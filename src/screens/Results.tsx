import { useState } from 'react'
import { motion } from 'framer-motion'
import { Screen, PrimaryButton, GhostButton, PlayerChip } from '../components/ui'
import { HoldToDrink } from '../components/ritual'
import { EmoteBar } from '../components/Emote'
import { useRoomStore } from '../store/useRoomStore'
import { getController } from '../hooks/useRoom'
import { GAMES_BY_ID } from '../games/registry'
import { TWISTS_BY_ID } from '../games/twists'
import type { PublicPlayer } from '../lib/types'

function byId(players: PublicPlayer[]): Record<string, PublicPlayer> {
  return Object.fromEntries(players.map((p) => [p.id, p]))
}

function ordinal(n?: number): string {
  if (!n) return ''
  const s = ['th', 'st', 'nd', 'rd']
  const v = n % 100
  return `${n}${s[(v - 20) % 10] ?? s[v] ?? s[0]}`
}

export function RoundResults() {
  const snapshot = useRoomStore((s) => s.snapshot)
  const selfId = useRoomStore((s) => s.selfId)
  const mySips = useRoomStore((s) => s.mySips)
  const lr = snapshot.lastRound
  const players = byId(snapshot.players)
  const game = lr ? GAMES_BY_ID[lr.gameId] : undefined
  const myRank = lr?.ranking.find((r) => r.id === selfId)?.rank
  const soft = snapshot.players.find((p) => p.id === selfId)?.soft ?? false
  const twist = lr?.twistId ? TWISTS_BY_ID[lr.twistId] : undefined
  const [skipped, setSkipped] = useState(false)

  return (
    <Screen className="px-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        {twist && twist.id !== 'none' && (
          <p className="mb-1 font-display text-[11px] tracking-[0.25em] text-neon-pink">
            {twist.badge ? `${twist.badge} ` : ''}
            {twist.label.toUpperCase()}
          </p>
        )}
        <p className="font-display text-[11px] tracking-[0.3em] text-ink-low">
          YOU PLACED {ordinal(myRank)}
        </p>
        {mySips > 0 ? (
          <>
            <motion.h1
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
              className="mt-3 font-signage text-6xl text-neon-pink text-glow-pink"
            >
              {mySips}
            </motion.h1>
            <p className="mt-1 text-ink-mid">
              {soft
                ? mySips === 1
                  ? 'soft sip'
                  : 'soft sips'
                : mySips === 1
                  ? 'sip to drink'
                  : 'sips to drink'}
            </p>
            <div className="mt-7">
              {skipped ? (
                <p className="font-signage text-lg text-ink-mid">Skipped 👍 no pressure</p>
              ) : (
                <HoldToDrink
                  label={soft ? 'HOLD TO SIP' : 'HOLD TO DRINK'}
                  doneLabel={soft ? 'NICE ONE' : 'DOWN THE HATCH'}
                  onDone={() => getController()?.sendEmote('🍻')}
                />
              )}
            </div>
            {!skipped && (
              <button
                onClick={() => setSkipped(true)}
                className="mt-4 text-xs text-ink-low underline"
              >
                Sitting this one out
              </button>
            )}
          </>
        ) : (
          <motion.h1
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
            className="mt-3 font-signage text-4xl text-neon-green text-glow-green"
          >
            STAY SOBER 😎
          </motion.h1>
        )}
      </div>

      <div className="mb-2 space-y-1.5">
        {lr?.ranking.map((r) => {
          const p = players[r.id]
          const sips = lr.sips.find((s) => s.id === r.id)?.sips ?? 0
          return (
            <div
              key={r.id}
              className="flex items-center gap-3 rounded-xl border border-line/60 bg-panel/60 px-3 py-2 text-sm"
            >
              <span className="w-5 text-center font-display text-xs text-ink-low">{r.rank}</span>
              <span aria-hidden>{p?.emoji ?? '🎮'}</span>
              <span className="min-w-0 flex-1 truncate">
                {p?.name ?? 'Player'}
                {r.id === selfId ? ' (you)' : ''}
              </span>
              <span className="text-ink-low">
                {game?.formatScore ? game.formatScore(r.score) : r.score}
                {!r.valid ? ' dnf' : ''}
              </span>
              <span className="w-8 text-right font-display text-xs text-neon-pink">
                {sips > 0 ? `+${sips}` : '0'}
              </span>
            </div>
          )
        })}
      </div>
    </Screen>
  )
}

export function Leaderboard({ onLeave }: { onLeave: () => void }) {
  const snapshot = useRoomStore((s) => s.snapshot)
  const isHost = useRoomStore((s) => s.isHost)
  const selfId = useRoomStore((s) => s.selfId)
  const players = byId(snapshot.players)
  const standings = [...snapshot.standings].sort((a, b) => a.cumulativeSips - b.cumulativeSips)

  return (
    <Screen className="px-6">
      <header className="pt-2 text-center">
        <p className="font-display text-[10px] tracking-[0.3em] text-ink-low">
          AFTER ROUND {snapshot.round}
          {snapshot.settings.endless ? '' : ` / ${snapshot.settings.totalRounds}`}
        </p>
        <h1 className="mt-1 font-signage text-2xl text-amber text-glow-amber">Soberest wins</h1>
      </header>

      <div className="mt-5 flex-1 space-y-2 overflow-auto">
        {standings.map((s, i) => {
          const p = players[s.id]
          const onFire = (s.streak ?? 0) >= 3
          return (
            <PlayerChip
              key={s.id}
              rank={i + 1}
              name={
                (p?.name ?? 'Player') +
                (s.id === selfId ? ' (you)' : '') +
                (onFire ? ` 🔥${s.streak}` : '')
              }
              emoji={i === 0 ? '👑' : (p?.emoji ?? '🎮')}
              sips={s.cumulativeSips}
              highlight={i === 0}
            />
          )
        })}
        {standings.length === 0 && (
          <p className="text-center text-sm text-ink-low">No scores yet.</p>
        )}
      </div>

      {snapshot.round % 5 === 0 && (
        <p className="mt-3 text-center text-sm text-neon-cyan">
          💧 Hydrate check. Grab a glass of water.
        </p>
      )}
      <div className="mt-3">
        <EmoteBar />
      </div>

      {isHost ? (
        <div className="mt-3 flex flex-col gap-2">
          <PrimaryButton onClick={() => getController()?.nextRound()}>Next round</PrimaryButton>
          <GhostButton onClick={() => getController()?.endSession()}>End the night</GhostButton>
        </div>
      ) : (
        <p className="mt-3 py-2 text-center text-sm text-ink-low">Next round starting soon…</p>
      )}
      <button onClick={onLeave} className="mt-2 text-center text-xs text-ink-low underline">
        Leave room
      </button>
    </Screen>
  )
}

export function EndAwards({ onLeave }: { onLeave: () => void }) {
  const snapshot = useRoomStore((s) => s.snapshot)
  const isHost = useRoomStore((s) => s.isHost)
  const players = byId(snapshot.players)
  const standings = [...snapshot.standings].sort((a, b) => a.cumulativeSips - b.cumulativeSips)
  const winner = standings[0]
  const lush = standings.length > 1 ? standings[standings.length - 1] : undefined
  const mvp = [...standings].sort((a, b) => (b.wins ?? 0) - (a.wins ?? 0))[0]
  const streaker = [...standings].sort((a, b) => (b.bestStreak ?? 0) - (a.bestStreak ?? 0))[0]
  const kingmaker = [...standings].sort((a, b) => (b.sipsGiven ?? 0) - (a.sipsGiven ?? 0))[0]
  const marked = [...standings].sort((a, b) => (b.sipsReceived ?? 0) - (a.sipsReceived ?? 0))[0]
  const nm = (id?: string) => players[id ?? '']?.name ?? 'Player'

  return (
    <Screen className="px-6 text-center">
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="font-display text-[11px] tracking-[0.3em] text-ink-low">SOBEREST LEGEND</p>
        <div className="mt-3 text-6xl">{players[winner?.id ?? '']?.emoji ?? '🏆'}</div>
        <h1 className="mt-2 font-signage text-4xl text-neon-green text-glow-green">
          {players[winner?.id ?? '']?.name ?? 'Champion'}
        </h1>
        <p className="mt-1 text-ink-mid">{winner?.cumulativeSips ?? 0} sips all night</p>
        {lush && lush.id !== winner?.id && (
          <p className="mt-6 text-sm text-ink-low">
            🍻 The Lush: {players[lush.id]?.name ?? 'Player'} ({lush.cumulativeSips} sips)
          </p>
        )}
        {mvp && (mvp.wins ?? 0) > 0 && (
          <p className="mt-2 text-sm text-ink-low">
            🏆 MVP: {nm(mvp.id)} ({mvp.wins} round {mvp.wins === 1 ? 'win' : 'wins'})
          </p>
        )}
        {streaker && (streaker.bestStreak ?? 0) >= 3 && (
          <p className="mt-2 text-sm text-ink-low">
            🔥 Hot Streak: {nm(streaker.id)} ({streaker.bestStreak} in a row)
          </p>
        )}
        {kingmaker && (kingmaker.sipsGiven ?? 0) > 0 && (
          <p className="mt-2 text-sm text-ink-low">
            👑 Kingmaker: {nm(kingmaker.id)} (handed out {kingmaker.sipsGiven})
          </p>
        )}
        {marked && (marked.sipsReceived ?? 0) > 0 && marked.id !== winner?.id && (
          <p className="mt-2 text-sm text-ink-low">
            🎯 Marked: {nm(marked.id)} (took {marked.sipsReceived} handed sips)
          </p>
        )}
      </div>
      <div className="space-y-2">
        {isHost && <PrimaryButton onClick={() => getController()?.playAgain()}>Play again</PrimaryButton>}
        <GhostButton onClick={onLeave}>Leave</GhostButton>
      </div>
    </Screen>
  )
}
