import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useRoom } from '../hooks/useRoom'
import { Screen } from '../components/ui'
import { EmoteLayer } from '../components/Emote'
import { Lobby } from './Lobby'
import { RoundIntro, Countdown, PlayScreen, Waiting } from './Round'
import { RoundResults, Leaderboard, EndAwards } from './Results'
import { Targeting } from './Targeting'

function Connecting({ code }: { code: string }) {
  return (
    <Screen center className="px-7 text-center">
      <div className="text-4xl">🍺</div>
      <p className="mt-4 font-signage text-xl text-amber">Connecting…</p>
      <p className="mt-1 font-display text-sm tracking-[0.3em] text-ink-low">{code}</p>
    </Screen>
  )
}

export function Room({
  code,
  asHost,
  onLeave,
}: {
  code: string
  asHost: boolean
  onLeave: () => void
}) {
  const s = useRoom(code, asHost)

  let content
  switch (s.view) {
    case 'lobby':
      content = <Lobby />
      break
    case 'roundIntro':
      content = <RoundIntro />
      break
    case 'countdown':
      content = <Countdown />
      break
    case 'playing':
      content = <PlayScreen />
      break
    case 'waiting':
      content = <Waiting />
      break
    case 'roundResults':
      content = <RoundResults />
      break
    case 'targeting':
      content = <Targeting />
      break
    case 'leaderboard':
      content = <Leaderboard onLeave={onLeave} />
      break
    case 'ended':
      content = <EndAwards onLeave={onLeave} />
      break
    default:
      content = <Connecting code={code} />
  }

  return (
    <>
      <PhaseFade view={s.view}>{content}</PhaseFade>
      <EmoteLayer />
      {s.status === 'reconnecting' && (
        <div className="fixed inset-x-0 top-0 z-50 bg-neon-pink/90 py-1 text-center text-xs font-semibold text-pit">
          Reconnecting…
        </div>
      )}
    </>
  )
}

/**
 * A gentle fade-in on every phase change, so transitions between screens feel
 * smooth rather than snapping. Keyed by view so it replays on each change. It
 * never starts fully transparent, so timing-sensitive game screens are visible
 * immediately. Honors reduced-motion.
 */
function PhaseFade({ view, children }: { view: string; children: ReactNode }) {
  const reduce = useReducedMotion()
  if (reduce) return <>{children}</>
  return (
    <motion.div
      key={view}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  )
}
