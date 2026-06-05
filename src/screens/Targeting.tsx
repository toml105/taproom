import { useState } from 'react'
import { motion } from 'framer-motion'
import { Screen } from '../components/ui'
import { EmoteBar } from '../components/Emote'
import { useRoomStore } from '../store/useRoomStore'
import { getController } from '../hooks/useRoom'

export function Targeting() {
  const snapshot = useRoomStore((s) => s.snapshot)
  const selfId = useRoomStore((s) => s.selfId)
  const tg = snapshot.targeting
  const [picked, setPicked] = useState<string | null>(null)

  if (!tg) return null
  const byId = Object.fromEntries(snapshot.players.map((p) => [p.id, p]))
  const assigner = byId[tg.assignerId]
  const candidates = tg.candidateIds.map((id) => byId[id]).filter(Boolean)
  const amAssigner = selfId === tg.assignerId
  const bonusLabel = `+${tg.bonus} sip${tg.bonus === 1 ? '' : 's'}`

  if (!amAssigner) {
    return (
      <Screen center className="px-7 text-center">
        <div className="text-5xl">{assigner?.emoji ?? '👑'}</div>
        <h2 className="mt-4 font-signage text-2xl text-amber text-glow-amber">
          {assigner?.name ?? 'The winner'} won the round
        </h2>
        <p className="mt-2 text-ink-mid">…and is choosing who takes {bonusLabel}.</p>
        <div className="mt-8">
          <EmoteBar />
        </div>
      </Screen>
    )
  }

  return (
    <Screen className="px-6">
      <header className="pt-3 text-center">
        <p className="font-display text-[11px] tracking-[0.3em] text-ink-low">YOU WON THE ROUND</p>
        <h1 className="mt-1 font-signage text-3xl text-neon-green text-glow-green">Hand out {bonusLabel}</h1>
        <p className="mt-1 text-sm text-ink-mid">Tap a player to make them drink.</p>
      </header>

      <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-line/40">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 8, ease: 'linear' }}
          className="h-full bg-neon-pink"
        />
      </div>

      <div className="mt-4 flex-1 space-y-2 overflow-auto">
        {candidates.map((p) => (
          <button
            key={p.id}
            disabled={picked !== null}
            onPointerDown={() => {
              if (picked) return
              setPicked(p.id)
              getController()?.submitTargetPick(p.id)
            }}
            className={`flex w-full items-center gap-3 rounded-xl border-2 px-3 py-3 text-left transition active:scale-[0.98] ${
              picked === p.id
                ? 'border-neon-pink bg-neon-pink/15'
                : 'border-line bg-panel/70'
            }`}
          >
            <span className="text-2xl" aria-hidden>
              {p.emoji}
            </span>
            <span className="min-w-0 flex-1 truncate font-semibold text-ink">{p.name}</span>
            <span className="font-display text-xs text-neon-pink">{bonusLabel}</span>
          </button>
        ))}
        {candidates.length === 0 && (
          <p className="text-center text-sm text-ink-low">No one to target.</p>
        )}
      </div>
    </Screen>
  )
}
