import { motion } from 'framer-motion'
import { Screen, PrimaryButton, GhostButton, PlayerChip } from '../components/ui'
import { useRoomStore } from '../store/useRoomStore'
import { getController } from '../hooks/useRoom'
import { GAMES_BY_ID } from '../games/registry'
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

  return (
    <Screen className="px-6">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="font-display text-[11px] tracking-[0.3em] text-ink-low">
          YOU PLACED {ordinal(myRank)}
        </p>
        {mySips > 0 ? (
          <motion.h1
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
            className="mt-3 font-signage text-6xl text-neon-pink text-glow-pink"
          >
            DRINK {mySips}
          </motion.h1>
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
        {mySips > 0 && <p className="mt-1 text-ink-mid">{mySips === 1 ? 'sip' : 'sips'}</p>}
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
        </p>
        <h1 className="mt-1 font-signage text-2xl text-amber text-glow-amber">Soberest wins</h1>
      </header>

      <div className="mt-5 flex-1 space-y-2 overflow-auto">
        {standings.map((s, i) => {
          const p = players[s.id]
          return (
            <PlayerChip
              key={s.id}
              rank={i + 1}
              name={(p?.name ?? 'Player') + (s.id === selfId ? ' (you)' : '')}
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
      </div>
      <div className="space-y-2">
        {isHost && <PrimaryButton onClick={() => getController()?.playAgain()}>Play again</PrimaryButton>}
        <GhostButton onClick={onLeave}>Leave</GhostButton>
      </div>
    </Screen>
  )
}
