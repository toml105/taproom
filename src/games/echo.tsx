import { useEffect, useRef, useState } from 'react'
import { mulberry32 } from '../lib/rng'
import type { MicroGame, MicroGameContext } from './types'

// Pads differ by POSITION as well as colour, so they're distinguishable without
// relying on hue (colour-blind friendly).
const PADS = [
  { css: 'var(--color-neon-pink)', pos: 'TL', round: 'rounded-tl-[2rem]' },
  { css: 'var(--color-neon-cyan)', pos: 'TR', round: 'rounded-tr-[2rem]' },
  { css: 'var(--color-amber)', pos: 'BL', round: 'rounded-bl-[2rem]' },
  { css: 'var(--color-neon-green)', pos: 'BR', round: 'rounded-br-[2rem]' },
]
const MAX = 9
const PLAY_MS = 16000

function buildSeq(seed: number): number[] {
  const rng = mulberry32(seed ^ 0x27d4eb2f)
  return Array.from({ length: MAX }, () => Math.floor(rng() * 4))
}

function Echo({ ctx }: { ctx: MicroGameContext }) {
  const seq = useRef(buildSeq(ctx.seed)).current
  const [phase, setPhase] = useState<'watch' | 'input' | 'done'>('watch')
  const [level, setLevel] = useState(ctx.handicap ? 1 : 2)
  const [lit, setLit] = useState<number | null>(null)
  const inputIdx = useRef(0)
  const completed = useRef(0)
  const doneRef = useRef(false)

  // Replay the pattern up to the current level, then hand over to input.
  useEffect(() => {
    if (phase !== 'watch') return
    let cancelled = false
    const steps = seq.slice(0, level)
    const speed = Math.max(280, 620 - level * 30)
    let k = 0
    const play = () => {
      if (cancelled) return
      if (k >= steps.length) {
        setLit(null)
        setTimeout(() => {
          if (!cancelled) {
            inputIdx.current = 0
            setPhase('input')
          }
        }, 250)
        return
      }
      setLit(steps[k])
      setTimeout(() => {
        if (cancelled) return
        setLit(null)
        k++
        setTimeout(play, 150)
      }, speed)
    }
    const t = setTimeout(play, 450)
    return () => {
      cancelled = true
      clearTimeout(t)
    }
  }, [phase, level, seq])

  useEffect(() => {
    const deadline = setTimeout(finish, PLAY_MS)
    return () => clearTimeout(deadline)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function finish() {
    if (doneRef.current) return
    doneRef.current = true
    setPhase('done')
    ctx.submit({ score: completed.current, valid: true })
  }

  function tapPad(idx: number) {
    if (phase !== 'input' || doneRef.current) return
    setLit(idx)
    setTimeout(() => setLit(null), 120)
    if (idx !== seq[inputIdx.current]) {
      finish()
      return
    }
    inputIdx.current++
    if (inputIdx.current >= level) {
      completed.current = level
      if (level >= MAX) {
        finish()
        return
      }
      setLevel((l) => l + 1)
      setPhase('watch')
    }
  }

  return (
    <div className="flex w-full flex-1 select-none flex-col items-center justify-between px-6 py-8">
      <p className="font-display text-[11px] tracking-[0.25em] text-amber/80">
        {phase === 'watch' ? 'WATCH' : phase === 'input' ? 'REPEAT' : 'DONE'} · LEVEL {level}
      </p>
      <div className="grid aspect-square w-full max-w-sm grid-cols-2 grid-rows-2 gap-3">
        {PADS.map((pad, idx) => (
          <button
            key={pad.pos}
            onPointerDown={() => tapPad(idx)}
            aria-label={pad.pos}
            className={`transition-opacity ${pad.round}`}
            style={{ background: pad.css, opacity: lit === idx ? 1 : 0.32 }}
          />
        ))}
      </div>
      <p className="text-sm text-ink-mid">
        {phase === 'input' ? 'Tap the pattern back' : 'Memorise the pattern'}
      </p>
    </div>
  )
}

export const echo: MicroGame = {
  id: 'echo',
  title: 'Echo',
  tagline: 'Watch the pattern, then tap it back. It grows each level.',
  category: 'memory',
  direction: 'higher',
  playMs: PLAY_MS,
  formatScore: (s) => `lvl ${s}`,
  Play: Echo,
}
