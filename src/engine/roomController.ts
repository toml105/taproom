import { RoomChannel } from './realtime'
import type { ConnStatus } from './realtime'
import { useRoomStore, emptySnapshot } from '../store/useRoomStore'
import { envelope } from '../lib/protocol'
import type {
  Countdown,
  Emote,
  Envelope,
  EventType,
  LeaderboardMsg,
  LobbyUpdate,
  ResultMsg,
  RoundIntro,
  RoundResultsMsg,
  SessionEnd,
  Snapshot,
} from '../lib/protocol'
import type {
  EngineSnapshot,
  GameSettings,
  PresenceState,
  PublicPlayer,
  RankRow,
  SipRow,
  Standing,
} from '../lib/types'
import type { Identity } from '../lib/identity'
import { loadRoomSips, saveRoomSips } from '../lib/identity'
import { electHost } from '../lib/hostElection'
import { rankScores, assignSips } from '../lib/scoring'
import { ALL_GAME_IDS, GAMES_BY_ID, pickNextGame } from '../games/registry'
import type { MicroGame } from '../games/types'
import { randomSeed } from '../lib/rng'

const INTRO_MS = 3200
const COUNT_MS = 3000
const COLLECT_GRACE_MS = 6000
const RESULTS_DWELL_MS = 4800
const LEADERBOARD_DWELL_MS = 6500
const HOST_GONE_GRACE_MS = 2500
const SNAPSHOT_INTERVAL_MS = 10000

type Timer = ReturnType<typeof setTimeout>

const MID_ROUND_PHASES = ['roundIntro', 'countdown', 'playing', 'collecting', 'roundResults']

export class RoomController {
  private channel: RoomChannel
  private snap: EngineSnapshot
  private presences: PresenceState[] = []
  private joinOrder = new Map<string, number>()
  private nextJoinOrder = 1
  private myJoinOrder = 500 + Math.floor(Math.random() * 400)
  private seq = 0
  private lastSeenSeq = -1
  private roundResults = new Map<string, { score: number; valid: boolean }>()
  private myCumulativeSips = 0
  private sessionStartedAt = 0
  private isHost = false
  private soft = false
  private destroyed = false

  private refereeTimer: Timer | null = null
  private localTimer: Timer | null = null
  private hostGoneTimer: Timer | null = null
  private snapshotTimer: ReturnType<typeof setInterval> | null = null
  private code: string
  private ident: Identity

  constructor(code: string, ident: Identity, asHost: boolean) {
    this.code = code
    this.ident = ident
    this.isHost = asHost
    this.myCumulativeSips = loadRoomSips(code)
    this.sessionStartedAt = asHost ? Date.now() : 0
    if (asHost) {
      this.joinOrder.set(ident.id, 0)
      this.myJoinOrder = 0
    }
    this.snap = emptySnapshot(code, asHost ? ident.id : '')
    this.channel = new RoomChannel(
      code,
      {
        onMessage: (e) => this.onMessage(e),
        onPresence: (ps) => this.onPresence(ps),
        onStatus: (s) => this.onStatus(s),
      },
      this.selfPresence(),
    )
  }

  // ---------- lifecycle ----------
  start() {
    this.patch({
      status: 'connecting',
      view: this.isHost ? 'lobby' : 'connecting',
      roomCode: this.code,
      selfId: this.ident.id,
      isHost: this.isHost,
    })
    if (this.isHost) {
      this.snap.settings = { ...this.snap.settings, enabledGameIds: ALL_GAME_IDS }
      this.pushSnapshot()
      this.startSnapshotLoop()
    }
    this.channel.subscribe()
  }

  destroy() {
    this.destroyed = true
    this.clearAllTimers()
    this.channel.close()
  }

  // ---------- public actions (UI) ----------
  setProfile(name: string, emoji: string) {
    this.ident = { ...this.ident, name, emoji }
    this.channel.setPresence(this.selfPresence())
    if (this.isHost) this.broadcastRoster()
  }

  setSoft(soft: boolean) {
    this.soft = soft
    this.channel.setPresence(this.selfPresence())
    if (this.isHost) this.broadcastRoster()
  }

  setSettings(p: Partial<GameSettings>) {
    if (!this.isHost) return
    this.snap.settings = { ...this.snap.settings, ...p }
    if (!this.snap.settings.enabledGameIds.length) this.snap.settings.enabledGameIds = ALL_GAME_IDS
    this.broadcastRoster()
  }

  startSession(settings?: Partial<GameSettings>) {
    if (!this.isHost) return
    this.snap.settings = { ...this.snap.settings, ...settings }
    if (!this.snap.settings.enabledGameIds.length) this.snap.settings.enabledGameIds = ALL_GAME_IDS
    this.beginRound(this.snap.round + 1)
  }

  nextRound() {
    if (!this.isHost) return
    if (this.snap.phase === 'leaderboard' || this.snap.phase === 'roundResults') {
      this.clearRefereeTimer()
      this.beginRound(this.snap.round + 1)
    }
  }

  endSession() {
    if (!this.isHost) return
    this.clearRefereeTimer()
    const winnerId = [...this.snap.standings].sort(
      (a, b) => a.cumulativeSips - b.cumulativeSips,
    )[0]?.id ?? null
    this.snap.phase = 'ended'
    this.broadcastState('session_end', {
      finalStandings: this.snap.standings,
      winnerId,
      roundsPlayed: this.snap.round,
    } satisfies SessionEnd)
    this.pushSnapshot()
    this.setView('ended')
  }

  playAgain() {
    if (!this.isHost) return
    this.snap.round = 0
    this.snap.standings = []
    this.snap.recentGameIds = []
    this.snap.lastRound = null
    this.myCumulativeSips = 0
    saveRoomSips(this.code, 0)
    this.channel.setPresence(this.selfPresence())
    this.beginRound(1)
  }

  submitResult(score: number, valid: boolean) {
    if (this.snap.gameId == null) return
    const payload: ResultMsg = { round: this.snap.round, gameId: this.snap.gameId, score, valid }
    // Optimistic "waiting" first, so an immediate finalize (solo / last to submit)
    // can override it with the results view rather than being clobbered by it.
    this.setView('waiting')
    if (this.isHost) this.handleResult(this.ident.id, payload)
    else this.channel.broadcast(envelope('result', this.ident.id, payload))
  }

  sendEmote(emoji: string) {
    this.channel.broadcast(envelope('emote', this.ident.id, { emote: emoji } satisfies Emote))
  }

  // ---------- presence / status ----------
  private onStatus(s: ConnStatus) {
    this.patch({ status: s })
    if (s === 'subscribed') {
      this.channel.setPresence(this.selfPresence())
      if (!this.isHost) this.channel.broadcast(envelope('ping_host', this.ident.id, {}))
    }
  }

  private onPresence(ps: PresenceState[]) {
    this.presences = ps
    if (this.isHost) {
      for (const p of ps) {
        if (!this.joinOrder.has(p.id)) this.joinOrder.set(p.id, this.nextJoinOrder++)
      }
      this.broadcastRoster()
    }
    this.reconcileHost()
    this.patch({ activeCount: this.presences.length })
  }

  private reconcileHost() {
    const hosts = this.presences.filter((p) => p.isHost)
    if (hosts.length === 0) {
      if (!this.hostGoneTimer && !this.destroyed) {
        this.hostGoneTimer = setTimeout(() => {
          this.hostGoneTimer = null
          const noneNow = this.presences.filter((p) => p.isHost).length === 0
          if (noneNow && electHost(this.presences) === this.ident.id) this.becomeHost()
        }, HOST_GONE_GRACE_MS)
      }
    } else {
      if (this.hostGoneTimer) {
        clearTimeout(this.hostGoneTimer)
        this.hostGoneTimer = null
      }
      if (hosts.length > 1) {
        if (this.isHost && electHost(hosts) !== this.ident.id) this.stepDown()
      } else if (this.isHost && hosts[0].id !== this.ident.id) {
        this.stepDown()
      }
    }
  }

  private becomeHost() {
    if (this.isHost || this.destroyed) return
    this.isHost = true
    this.sessionStartedAt = Date.now()
    this.joinOrder = new Map()
    this.nextJoinOrder = 0
    const ordered = [...this.presences].sort(
      (a, b) => a.joinOrder - b.joinOrder || a.id.localeCompare(b.id),
    )
    for (const p of ordered) this.joinOrder.set(p.id, this.nextJoinOrder++)
    this.myJoinOrder = this.joinOrder.get(this.ident.id) ?? 0

    const m = new Map<string, number>()
    this.snap.standings.forEach((s) => m.set(s.id, s.cumulativeSips))
    this.presences.forEach((p) => m.set(p.id, Math.max(m.get(p.id) ?? 0, p.cumulativeSips ?? 0)))
    this.snap.standings = [...m].map(([id, cumulativeSips]) => ({ id, cumulativeSips }))
    this.snap.hostId = this.ident.id
    if (MID_ROUND_PHASES.includes(this.snap.phase)) {
      this.snap.phase = this.snap.round > 0 ? 'leaderboard' : 'lobby'
    }
    this.seq = Math.max(this.seq, this.lastSeenSeq) + 100

    this.channel.setPresence(this.selfPresence())
    this.broadcastRoster()
    this.pushSnapshot()
    this.broadcastSnapshot()
    this.startSnapshotLoop()
    this.patch({ isHost: true })
    if (this.snap.phase === 'leaderboard') this.scheduleLeaderboardAdvance()
    this.syncHostView()
  }

  private stepDown() {
    this.isHost = false
    this.clearRefereeTimer()
    if (this.snapshotTimer) {
      clearInterval(this.snapshotTimer)
      this.snapshotTimer = null
    }
    this.channel.setPresence(this.selfPresence())
    this.patch({ isHost: false })
  }

  // ---------- host round loop ----------
  private beginRound(round: number) {
    const seed = randomSeed()
    const game = pickNextGame(this.snap.settings.enabledGameIds, this.snap.recentGameIds, seed)
    this.snap.round = round
    this.snap.gameId = game.id
    this.snap.roundSeed = seed
    this.snap.recentGameIds = [...this.snap.recentGameIds, game.id].slice(-4)
    this.snap.phase = 'roundIntro'
    this.roundResults.clear()
    this.broadcastState('round_intro', {
      round,
      gameId: game.id,
      roundSeed: seed,
      title: game.title,
      instructions: game.tagline,
      introMs: INTRO_MS,
    } satisfies RoundIntro)
    this.localEnterIntro(game, seed)
    this.refereeTimer = this.setT(INTRO_MS, () => this.hostStartCountdown(round, game, seed))
  }

  private hostStartCountdown(round: number, game: MicroGame, seed: number) {
    this.snap.phase = 'countdown'
    this.broadcastState('countdown', {
      round,
      gameId: game.id,
      roundSeed: seed,
      countMs: COUNT_MS,
      playMs: game.playMs,
    } satisfies Countdown)
    this.localStartCountdown(game, seed, COUNT_MS, game.playMs)
    this.refereeTimer = this.setT(COUNT_MS + game.playMs + COLLECT_GRACE_MS, () =>
      this.finalizeRound(round, game),
    )
  }

  private handleResult(from: string, p: ResultMsg) {
    if (!this.isHost || p.round !== this.snap.round) return
    if (this.roundResults.has(from)) return
    this.roundResults.set(from, { score: p.score, valid: p.valid })
    const roster = this.buildRoster()
    this.patch({ submittedCount: this.roundResults.size, activeCount: roster.length })
    if (roster.every((pl) => this.roundResults.has(pl.id))) {
      const game = GAMES_BY_ID[this.snap.gameId ?? '']
      if (game) this.finalizeRound(this.snap.round, game)
    }
  }

  private finalizeRound(round: number, game: MicroGame) {
    if (!this.isHost || this.snap.round !== round) return
    if (this.snap.phase === 'roundResults' || this.snap.phase === 'leaderboard') return
    this.clearRefereeTimer()
    const roster = this.buildRoster()
    const scores = roster.map((p) => {
      const r = this.roundResults.get(p.id)
      return { id: p.id, score: r ? r.score : 0, valid: r ? r.valid : false }
    })
    const ranking = rankScores(scores, game.direction === 'higher')
    const sips = assignSips(ranking, this.snap.settings.maxSipsPerRound)
    const m = new Map(this.snap.standings.map((s) => [s.id, s.cumulativeSips]))
    for (const sr of sips) m.set(sr.id, (m.get(sr.id) ?? 0) + sr.sips)
    // Union of everyone ever seen, so a momentary presence blip never drops a player.
    const ids = new Set<string>([...m.keys(), ...roster.map((p) => p.id)])
    this.snap.standings = [...ids].map((id) => ({ id, cumulativeSips: m.get(id) ?? 0 }))
    this.snap.lastRound = { round, gameId: game.id, ranking, sips }
    this.snap.phase = 'roundResults'
    this.broadcastState('round_results', {
      round,
      gameId: game.id,
      ranking,
      sips,
    } satisfies RoundResultsMsg)
    this.broadcastState('leaderboard', {
      standings: this.snap.standings,
      roundsPlayed: round,
    } satisfies LeaderboardMsg)
    this.applyRoundResults(round, game.id, ranking, sips)
    this.applyLeaderboard(this.snap.standings)
    this.refereeTimer = this.setT(RESULTS_DWELL_MS, () => this.hostShowLeaderboard(round))
  }

  private hostShowLeaderboard(round: number) {
    this.snap.phase = 'leaderboard'
    this.broadcastSnapshot()
    this.setView('leaderboard')
    if (!this.snap.settings.endless && round >= this.snap.settings.totalRounds) {
      this.refereeTimer = this.setT(RESULTS_DWELL_MS, () => this.endSession())
    } else {
      this.scheduleLeaderboardAdvance()
    }
  }

  private scheduleLeaderboardAdvance() {
    this.refereeTimer = this.setT(LEADERBOARD_DWELL_MS, () => this.beginRound(this.snap.round + 1))
  }

  // ---------- local play machine (host + client share) ----------
  private localEnterIntro(game: MicroGame, seed: number) {
    this.clearLocalTimer()
    this.patch({
      view: 'roundIntro',
      play: { game, seed, deadlineMs: game.playMs, startedAt: 0 },
      snapshot: this.cloneSnap(),
      mySips: 0,
    })
  }

  private localStartCountdown(game: MicroGame, seed: number, countMs: number, playMs: number) {
    this.clearLocalTimer()
    this.patch({
      view: 'countdown',
      countMs,
      play: { game, seed, deadlineMs: playMs, startedAt: 0 },
      snapshot: this.cloneSnap(),
    })
    this.localTimer = this.setT(countMs, () => {
      this.patch({ view: 'playing', play: { game, seed, deadlineMs: playMs, startedAt: Date.now() } })
    })
  }

  // ---------- inbound messages ----------
  private onMessage(env: Envelope) {
    if (!env || env.v !== 1) return
    if (env.from === this.ident.id && env.t !== 'emote') return

    if (env.t === 'emote') {
      const e = env.p as Emote
      const prev = useRoomStore.getState().emote?.n ?? 0
      this.patch({ emote: { id: env.from, emoji: e.emote, n: prev + 1 } })
      return
    }
    if (env.t === 'ping_host') {
      if (this.isHost) this.broadcastSnapshot()
      return
    }
    if (env.t === 'result') {
      if (this.isHost) this.handleResult(env.from, env.p as ResultMsg)
      return
    }

    // Remaining are host-to-all state events; only non-hosts apply, with dedupe.
    if (this.isHost) return
    if (env.seq !== undefined) {
      if (env.seq <= this.lastSeenSeq) return
      this.lastSeenSeq = env.seq
    }
    switch (env.t) {
      case 'lobby_update':
        this.applyLobby(env.p as LobbyUpdate)
        break
      case 'round_intro':
        this.applyRoundIntro(env.p as RoundIntro)
        break
      case 'countdown':
        this.applyCountdown(env.p as Countdown)
        break
      case 'round_results': {
        const m = env.p as RoundResultsMsg
        this.applyRoundResults(m.round, m.gameId, m.ranking, m.sips)
        break
      }
      case 'leaderboard':
        this.applyLeaderboard((env.p as LeaderboardMsg).standings)
        break
      case 'session_end': {
        const m = env.p as SessionEnd
        this.snap.standings = m.finalStandings
        this.snap.phase = 'ended'
        this.pushSnapshot()
        this.setView('ended')
        break
      }
      case 'snapshot':
        this.applySnapshot(env.p as Snapshot)
        break
    }
  }

  // ---------- client appliers (also reused by host for its own results) ----------
  private applyLobby(p: LobbyUpdate) {
    this.snap.players = p.players
    this.snap.hostId = p.hostId
    this.snap.settings = p.settings
    this.snap.roomCode = p.roomCode
    this.learnMyJoinOrder(p.players)
    this.pushSnapshot()
    const v = useRoomStore.getState().view
    if (v === 'connecting' || v === 'lobby') this.setView('lobby')
  }

  private applyRoundIntro(p: RoundIntro) {
    const game = GAMES_BY_ID[p.gameId]
    if (!game) return
    this.snap.round = p.round
    this.snap.gameId = p.gameId
    this.snap.roundSeed = p.roundSeed
    this.snap.phase = 'roundIntro'
    this.localEnterIntro(game, p.roundSeed)
  }

  private applyCountdown(p: Countdown) {
    const game = GAMES_BY_ID[p.gameId]
    if (!game) return
    this.snap.round = p.round
    this.snap.gameId = p.gameId
    this.snap.roundSeed = p.roundSeed
    this.snap.phase = 'countdown'
    this.localStartCountdown(game, p.roundSeed, p.countMs, p.playMs)
  }

  private applyRoundResults(round: number, gameId: string, ranking: RankRow[], sips: SipRow[]) {
    this.snap.lastRound = { round, gameId, ranking, sips }
    this.snap.phase = 'roundResults'
    this.clearLocalTimer()
    const mine = sips.find((s) => s.id === this.ident.id)
    this.pushSnapshot()
    this.patch({ view: 'roundResults', mySips: mine ? mine.sips : 0, play: null })
  }

  private applyLeaderboard(standings: Standing[]) {
    this.snap.standings = standings
    const mine = standings.find((s) => s.id === this.ident.id)
    if (mine) {
      this.myCumulativeSips = mine.cumulativeSips
      saveRoomSips(this.code, mine.cumulativeSips)
      this.channel.setPresence(this.selfPresence())
    }
    this.pushSnapshot()
    this.patch({ myCumulativeSips: this.myCumulativeSips })
  }

  private applySnapshot(s: Snapshot) {
    this.snap = s
    this.learnMyJoinOrder(s.players)
    const mine = s.standings.find((x) => x.id === this.ident.id)
    if (mine) {
      this.myCumulativeSips = mine.cumulativeSips
      saveRoomSips(this.code, mine.cumulativeSips)
    }
    this.lastSeenSeq = Math.max(this.lastSeenSeq, s.seq)
    this.pushSnapshot()
    this.patch({ myCumulativeSips: this.myCumulativeSips })
    this.syncClientViewFromSnapshot()
  }

  // ---------- view derivation ----------
  private syncHostView() {
    const ph = this.snap.phase
    if (ph === 'lobby') this.setView('lobby')
    else if (ph === 'leaderboard') this.setView('leaderboard')
    else if (ph === 'ended') this.setView('ended')
  }

  private syncClientViewFromSnapshot() {
    const ph = this.snap.phase
    const st = useRoomStore.getState()
    if (ph === 'lobby') this.setView('lobby')
    else if (ph === 'leaderboard') this.setView('leaderboard')
    else if (ph === 'ended') this.setView('ended')
    else if (ph === 'roundResults') this.setView('roundResults')
    else if (!st.play) {
      // Mid-round with no local game in progress = late joiner. Spectate.
      this.setView(this.snap.round > 0 ? 'leaderboard' : 'lobby')
    }
  }

  // ---------- helpers ----------
  private selfPresence(): PresenceState {
    return {
      id: this.ident.id,
      name: this.ident.name || 'Player',
      emoji: this.ident.emoji,
      joinOrder: this.isHost ? 0 : this.myJoinOrder,
      cumulativeSips: this.myCumulativeSips,
      isHost: this.isHost,
      soft: this.soft,
      sessionStartedAt: this.isHost ? this.sessionStartedAt : 0,
    }
  }

  private buildRoster(): PublicPlayer[] {
    const list = this.presences.map((p) => ({
      id: p.id,
      name: p.name || 'Player',
      emoji: p.emoji,
      joinOrder: this.joinOrder.get(p.id) ?? p.joinOrder ?? 999,
      connected: true,
      isHost: p.id === this.ident.id,
      soft: p.soft,
    }))
    // The host is always present locally, even if a presence sync briefly drops it.
    if (this.isHost && !list.some((p) => p.id === this.ident.id)) {
      list.push({
        id: this.ident.id,
        name: this.ident.name || 'Player',
        emoji: this.ident.emoji,
        joinOrder: 0,
        connected: true,
        isHost: true,
        soft: this.soft,
      })
    }
    return list.sort((a, b) => a.joinOrder - b.joinOrder)
  }

  private broadcastRoster() {
    if (!this.isHost) return
    this.snap.players = this.buildRoster()
    this.snap.hostId = this.ident.id
    this.broadcastState('lobby_update', {
      roomCode: this.code,
      hostId: this.ident.id,
      players: this.snap.players,
      settings: this.snap.settings,
    } satisfies LobbyUpdate)
    this.pushSnapshot()
  }

  private learnMyJoinOrder(players: PublicPlayer[]) {
    const me = players.find((p) => p.id === this.ident.id)
    if (me && me.joinOrder !== this.myJoinOrder) {
      this.myJoinOrder = me.joinOrder
      this.channel.setPresence(this.selfPresence())
    }
  }

  private nextSeq() {
    this.seq += 1
    return this.seq
  }

  private broadcastState<T>(t: EventType, p: T) {
    this.channel.broadcast(envelope(t, this.ident.id, p, this.nextSeq()))
  }

  private broadcastSnapshot() {
    this.snap.seq = this.nextSeq()
    this.channel.broadcast(envelope('snapshot', this.ident.id, this.cloneSnap(), this.snap.seq))
  }

  private cloneSnap(): EngineSnapshot {
    return {
      ...this.snap,
      players: [...this.snap.players],
      standings: [...this.snap.standings],
      recentGameIds: [...this.snap.recentGameIds],
    }
  }

  private pushSnapshot() {
    this.patch({ snapshot: this.cloneSnap(), isHost: this.isHost })
  }

  private setView(view: ReturnType<typeof useRoomStore.getState>['view']) {
    this.patch({ view })
  }

  private patch(p: Partial<ReturnType<typeof useRoomStore.getState>>) {
    useRoomStore.getState().patch(p)
  }

  private startSnapshotLoop() {
    if (this.snapshotTimer) clearInterval(this.snapshotTimer)
    this.snapshotTimer = setInterval(() => {
      if (this.isHost && !this.destroyed) this.broadcastSnapshot()
    }, SNAPSHOT_INTERVAL_MS)
  }

  private setT(ms: number, fn: () => void): Timer {
    return setTimeout(() => {
      if (!this.destroyed) fn()
    }, ms)
  }

  private clearRefereeTimer() {
    if (this.refereeTimer) {
      clearTimeout(this.refereeTimer)
      this.refereeTimer = null
    }
  }

  private clearLocalTimer() {
    if (this.localTimer) {
      clearTimeout(this.localTimer)
      this.localTimer = null
    }
  }

  private clearAllTimers() {
    this.clearRefereeTimer()
    this.clearLocalTimer()
    if (this.hostGoneTimer) {
      clearTimeout(this.hostGoneTimer)
      this.hostGoneTimer = null
    }
    if (this.snapshotTimer) {
      clearInterval(this.snapshotTimer)
      this.snapshotTimer = null
    }
  }
}
