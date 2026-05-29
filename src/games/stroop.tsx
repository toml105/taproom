import { useEffect, useRef, useState } from 'react'
import { mulberry32 } from '../lib/rng'
import type { MicroGame, MicroGameContext } from './types'

// Label text + ink color. The text label keeps it colour-blind friendly: the
// answer buttons read their own name, so the challenge is inhibition, not hue.
const COLORS = [
  { key: 'red', label: 'RED', css: 'var(--color-neon-pink)' },
  { key: 'green', label: 'GREEN', css: 'var(--color-neon-green)' },
  { key: 'blue', label: 'BLUE', css: 'var(--color-neon-cyan)' },
  { key: 'amber', label: 'AMBER', css: 'var(--color-amber)' },
]
const PROMPTS = 8
const PER_MS = 2000
const PLAY_MS = 14000

interface Prompt {
  word: number
  ink: number
}

function buildPrompts(seed: number): Prompt[] {
  const rng = mulberry32(seed ^ 0xc2b2ae35)
  const arr: Prompt[] = []
  for (let k = 0; k < PROMPTS; k++) {
    const word = Math.floor(rng() * 4)
    let ink = Math.floor(rng() * 4)
    if (ink === word) ink = (ink + 1 + Math.floor(rng() * 3)) % 4
    arr.push({ word, ink })
  }
  return arr
}

function Stroop({ ctx }: { ctx: MicroGameContext }) {
  const prompts = useRef(buildPrompts(ctx.seed)).current
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [flash, setFlash] = useState<'ok' | 'no' | null>(null)
  const doneRef = useRef(false)
  const promptStart = useRef(performance.now())

  useEffect(() => {
    promptStart.current = performance.now()
  }, [i])

  useEffect(() => {
    const deadline = setTimeout(finish, PLAY_MS)
    return () => clearTimeout(deadline)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function finish() {
    if (doneRef.current) return
    doneRef.current = true
    ctx.submit({ score, valid: true })
  }

  function answer(choice: number) {
    if (doneRef.current) return
    const correct = choice === prompts[i].ink
    if (correct) {
      const elapsed = performance.now() - promptStart.current
      const bonus = Math.max(0, Math.round((PER_MS - elapsed) / 20))
      setScore((s) => s + 100 + bonus)
      setFlash('ok')
    } else {
      setFlash('no')
    }
    setTimeout(() => setFlash(null), 140)
    if (i + 1 >= PROMPTS) setTimeout(finish, 160)
    else setI(i + 1)
  }

  const p = prompts[i]
  return (
    <div className="flex w-full flex-1 select-none flex-col items-center justify-between px-6 py-8">
      <div className="text-center">
        <p className="font-display text-[11px] tracking-[0.25em] text-amber/80">
          {i + 1}/{PROMPTS} · TAP THE INK COLOUR
        </p>
        <p className="mt-2 font-display text-xs text-ink-low">score {score}</p>
      </div>
      <p
        className="font-signage text-6xl transition-transform"
        style={{ color: COLORS[p.ink].css, transform: flash ? 'scale(1.04)' : 'scale(1)' }}
      >
        {COLORS[p.word].label}
      </p>
      <div className="grid w-full max-w-sm grid-cols-2 gap-3">
        {COLORS.map((c, idx) => (
          <button
            key={c.key}
            onPointerDown={() => answer(idx)}
            className="rounded-2xl border-2 py-6 font-signage text-lg active:scale-[0.97]"
            style={{
              borderColor: c.css,
              color: c.css,
              background: `color-mix(in oklab, ${c.css} 12%, transparent)`,
            }}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export const stroop: MicroGame = {
  id: 'stroop',
  title: 'Stroop',
  tagline: 'Tap the INK colour of the word, not what it spells.',
  category: 'focus',
  direction: 'higher',
  playMs: PLAY_MS,
  formatScore: (s) => `${s}`,
  Play: Stroop,
}
