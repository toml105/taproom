import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { MicroGame, MicroGameContext } from './types'

const DURATION = 5000
const PLAUSIBLE_MAX = 90 // anti-autoclicker: cap absurd counts

function TapSprint({ ctx }: { ctx: MicroGameContext }) {
  const [count, setCount] = useState(0)
  const [left, setLeft] = useState(DURATION)
  const countRef = useRef(0)
  const doneRef = useRef(false)
  const startRef = useRef(0)

  useEffect(() => {
    startRef.current = performance.now()
    let raf = 0
    const tick = () => {
      const remaining = Math.max(0, DURATION - (performance.now() - startRef.current))
      setLeft(remaining)
      if (remaining <= 0) {
        finish()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function finish() {
    if (doneRef.current) return
    doneRef.current = true
    ctx.submit({ score: Math.min(countRef.current, PLAUSIBLE_MAX), valid: true })
  }

  function tap() {
    if (doneRef.current) return
    countRef.current += 1
    setCount(countRef.current)
  }

  const fill = Math.min(1, count / 50)
  const secs = (left / 1000).toFixed(1)

  return (
    <div className="flex w-full flex-1 select-none flex-col items-center justify-between px-6 py-8">
      <div className="text-center">
        <p className="font-display text-xs tracking-widest text-amber/80">{secs}s</p>
        <p className="mt-3 font-signage text-7xl leading-none text-ink text-glow-amber">{count}</p>
        <p className="mt-1 text-sm text-ink-low">taps</p>
      </div>

      <button
        onPointerDown={tap}
        className="relative my-4 flex aspect-square w-full max-w-xs items-center justify-center overflow-hidden rounded-[2rem] border-2 border-amber/60 bg-panel active:scale-[0.99]"
        aria-label="Tap as fast as you can"
      >
        <motion.div
          className="absolute inset-x-0 bottom-0 bg-beer"
          animate={{ height: `${fill * 100}%` }}
          transition={{ type: 'tween', duration: 0.1 }}
        />
        <span className="relative z-10 font-signage text-3xl text-pit">MASH!</span>
      </button>

      <p className="text-center text-sm text-ink-mid">Tap the pint as fast as you can</p>
    </div>
  )
}

export const tapSprint: MicroGame = {
  id: 'tap-sprint',
  title: 'Tap Sprint',
  tagline: 'Tap the pint as many times as you can in 5 seconds.',
  category: 'motor',
  direction: 'higher',
  playMs: DURATION,
  formatScore: (s) => `×${s}`,
  Play: TapSprint,
}
