import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { mulberry32 } from '../lib/rng'
import type { MicroGame, MicroGameContext } from './types'

const PLAY_MS = 8000

function Bullseye({ ctx }: { ctx: MicroGameContext }) {
  const target = useRef(0.2 + mulberry32(ctx.seed ^ 0x9e3779b9)() * 0.6).current
  const [pos, setPos] = useState(0)
  const posRef = useRef(0)
  const doneRef = useRef(false)
  const [result, setResult] = useState<number | null>(null)
  const speed = 0.55 + Math.min(ctx.round, 8) * 0.06

  useEffect(() => {
    const start = performance.now()
    let raf = 0
    const tick = () => {
      const phase = ((performance.now() - start) / 1000) * speed
      const tri = Math.abs(((phase % 1) * 2) - 1) // 0..1..0 triangle
      posRef.current = 1 - tri
      setPos(posRef.current)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    const deadline = setTimeout(() => stop(true), PLAY_MS)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(deadline)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function stop(timeout: boolean) {
    if (doneRef.current) return
    doneRef.current = true
    const err0 = Math.abs(posRef.current - target)
    const err = ctx.handicap ? err0 * 0.7 : err0
    const score = timeout ? 0 : Math.max(0, Math.round(100 * (1 - err)))
    setResult(score)
    setTimeout(() => ctx.submit({ score, valid: true }), 750)
  }

  const tol = ctx.handicap ? 0.09 : 0.06
  return (
    <div
      onPointerDown={() => stop(false)}
      className="flex w-full flex-1 select-none flex-col items-center justify-center px-6"
    >
      <p className="mb-8 font-display text-xs tracking-[0.3em] text-amber/80">STOP ON THE BULLSEYE</p>
      <div className="relative my-6 h-16 w-full max-w-sm rounded-full border border-line bg-panel">
        <div
          className="absolute top-0 h-full rounded-full bg-neon-green/25"
          style={{ left: `${(target - tol) * 100}%`, width: `${tol * 2 * 100}%` }}
        />
        <div
          className="absolute top-0 h-full w-0.5 -translate-x-1/2 bg-neon-green"
          style={{ left: `${target * 100}%` }}
        />
        <div
          className="absolute top-[-6px] h-[calc(100%+12px)] w-1.5 -translate-x-1/2 rounded bg-amber"
          style={{ left: `${pos * 100}%` }}
        />
      </div>
      {result === null ? (
        <p className="mt-6 font-signage text-2xl text-ink">TAP TO STOP</p>
      ) : (
        <motion.p
          initial={{ scale: 0.6 }}
          animate={{ scale: 1 }}
          className="mt-6 font-signage text-5xl text-amber text-glow-amber"
        >
          {result}
        </motion.p>
      )}
    </div>
  )
}

export const bullseye: MicroGame = {
  id: 'bullseye',
  title: 'Bullseye',
  tagline: 'Stop the slider as close to the centre of the zone as you can.',
  category: 'precision',
  direction: 'higher',
  playMs: PLAY_MS,
  formatScore: (s) => `${s}/100`,
  Play: Bullseye,
}
