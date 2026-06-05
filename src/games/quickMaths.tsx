import { useEffect, useRef, useState } from 'react'
import { mulberry32 } from '../lib/rng'
import type { MicroGame, MicroGameContext } from './types'

const N = 8
const PER_MS = 2200
const PLAY_MS = 16000

interface Problem {
  text: string
  answer: number
  options: number[]
}

function buildProblems(seed: number): Problem[] {
  const rng = mulberry32(seed ^ 0x5a17)
  const out: Problem[] = []
  for (let k = 0; k < N; k++) {
    const op = Math.floor(rng() * 3) // 0 +, 1 -, 2 ×
    let a: number, b: number, answer: number, sym: string
    if (op === 2) {
      a = 2 + Math.floor(rng() * 11)
      b = 2 + Math.floor(rng() * 11)
      answer = a * b
      sym = '×'
    } else if (op === 1) {
      a = 5 + Math.floor(rng() * 45)
      b = 1 + Math.floor(rng() * a) // keep non-negative
      answer = a - b
      sym = '−'
    } else {
      a = 2 + Math.floor(rng() * 49)
      b = 2 + Math.floor(rng() * 49)
      answer = a + b
      sym = '+'
    }
    const opts = new Set<number>([answer])
    while (opts.size < 4) {
      const delta = (1 + Math.floor(rng() * 6)) * (rng() < 0.5 ? -1 : 1)
      const cand = answer + delta
      if (cand >= 0) opts.add(cand)
    }
    const options = [...opts].sort(() => rng() - 0.5)
    out.push({ text: `${a} ${sym} ${b}`, answer, options })
  }
  return out
}

function QuickMaths({ ctx }: { ctx: MicroGameContext }) {
  const problems = useRef(buildProblems(ctx.seed)).current
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [flash, setFlash] = useState<'ok' | 'no' | null>(null)
  const doneRef = useRef(false)
  const startRef = useRef(performance.now())

  useEffect(() => {
    startRef.current = performance.now()
  }, [i])
  useEffect(() => {
    const t = setTimeout(finish, PLAY_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function finish() {
    if (doneRef.current) return
    doneRef.current = true
    ctx.submit({ score, valid: true })
  }

  function answer(choice: number) {
    if (doneRef.current) return
    if (choice === problems[i].answer) {
      const bonus = Math.max(0, Math.round((PER_MS - (performance.now() - startRef.current)) / 25))
      setScore((s) => s + 100 + bonus)
      setFlash('ok')
    } else {
      setFlash('no')
    }
    setTimeout(() => setFlash(null), 130)
    if (i + 1 >= N) setTimeout(finish, 150)
    else setI(i + 1)
  }

  const p = problems[i]
  return (
    <div className="flex w-full flex-1 select-none flex-col items-center justify-between px-6 py-8">
      <div className="text-center">
        <p className="font-display text-[11px] tracking-[0.25em] text-amber/80">
          {i + 1}/{N} · QUICK MATHS
        </p>
        <p className="mt-2 font-display text-xs text-ink-low">score {score}</p>
      </div>
      <p
        className="font-signage text-6xl text-ink transition-transform"
        style={{ transform: flash ? 'scale(1.05)' : 'scale(1)' }}
      >
        {p.text}
      </p>
      <div className="grid w-full max-w-sm grid-cols-2 gap-3">
        {p.options.map((o, idx) => (
          <button
            key={idx}
            onPointerDown={() => answer(o)}
            className="rounded-2xl border-2 border-line bg-panel/70 py-6 font-signage text-2xl text-ink active:scale-[0.97]"
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  )
}

export const quickMaths: MicroGame = {
  id: 'quick-maths',
  title: 'Quick Maths',
  tagline: 'Solve as many as you can. Fast and right wins.',
  category: 'focus',
  direction: 'higher',
  playMs: PLAY_MS,
  formatScore: (s) => `${s}`,
  Play: QuickMaths,
}
