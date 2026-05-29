import { useEffect, useRef, useState } from 'react'
import { mulberry32 } from '../lib/rng'
import type { MicroGame, MicroGameContext } from './types'

const PLAY_MS = 8000
const FALSE_START = 9999

// Latency-fair: the WAIT->GO delay is computed locally from the shared seed and
// each device times its own GO->tap with performance.now(). Network lag never
// touches the measured reaction.
function Quickdraw({ ctx }: { ctx: MicroGameContext }) {
  const [phase, setPhase] = useState<'wait' | 'go' | 'done' | 'false'>('wait')
  const goAt = useRef(0)
  const doneRef = useRef(false)
  const [ms, setMs] = useState<number | null>(null)

  useEffect(() => {
    const delay = 1500 + mulberry32(ctx.seed ^ 0x85ebca6b)() * 3000
    const goTimer = setTimeout(() => {
      setPhase('go')
      goAt.current = performance.now()
    }, delay)
    const deadline = setTimeout(() => finish(2500, true), delay + 3000)
    return () => {
      clearTimeout(goTimer)
      clearTimeout(deadline)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function finish(score: number, valid: boolean) {
    if (doneRef.current) return
    doneRef.current = true
    setMs(score)
    setPhase(valid ? 'done' : 'false')
    setTimeout(() => ctx.submit({ score, valid }), 750)
  }

  function tap() {
    if (doneRef.current) return
    if (phase === 'wait') finish(FALSE_START, false)
    else if (phase === 'go') finish(Math.round(performance.now() - goAt.current), true)
  }

  const bg =
    phase === 'go' || phase === 'done'
      ? 'bg-neon-green'
      : phase === 'false'
        ? 'bg-neon-pink'
        : 'bg-pit'
  return (
    <div
      onPointerDown={tap}
      className={`flex w-full flex-1 select-none flex-col items-center justify-center text-center transition-colors ${bg}`}
    >
      {phase === 'wait' && <p className="font-signage text-4xl text-ink">WAIT…</p>}
      {phase === 'go' && <p className="font-signage text-7xl text-pit">TAP!</p>}
      {phase === 'done' && <p className="font-signage text-5xl text-pit">{ms} ms</p>}
      {phase === 'false' && <p className="font-signage text-3xl text-foam">TOO SOON</p>}
    </div>
  )
}

export const quickdraw: MicroGame = {
  id: 'quickdraw',
  title: 'Quick Draw',
  tagline: 'Tap the instant the screen turns green. Not a moment before.',
  category: 'reflex',
  direction: 'lower',
  playMs: PLAY_MS,
  formatScore: (s) => (s >= FALSE_START ? 'jumped' : `${s} ms`),
  Play: Quickdraw,
}
