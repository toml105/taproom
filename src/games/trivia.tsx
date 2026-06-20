import { useEffect, useRef, useState } from 'react'
import { pickIndices } from '../lib/rng'
import { TRIVIA } from './data/trivia'
import { answerScore } from './scoreKit'
import type { MicroGame, MicroGameContext } from './types'

const N = 3
const PER_MS = 5000
const PLAY_MS = N * PER_MS

function Trivia({ ctx }: { ctx: MicroGameContext }) {
  const qs = useRef(pickIndices(ctx.seed ^ 0x1234, TRIVIA.length, N).map((i) => TRIVIA[i])).current
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
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
    if (doneRef.current || picked !== null) return
    const q = qs[i]
    setPicked(choice)
    setScore((s) => s + answerScore(choice === q.answer, PER_MS, startRef.current))
    setTimeout(() => {
      setPicked(null)
      if (i + 1 >= N) finish()
      else setI(i + 1)
    }, 850)
  }

  const q = qs[i]
  const reveal = picked !== null
  return (
    <div className="flex w-full flex-1 select-none flex-col px-6 py-8">
      <p className="text-center font-display text-[11px] tracking-[0.25em] text-amber/80">
        {q.cat.toUpperCase()} · {i + 1}/{N} · {score}
      </p>
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="text-balance text-center text-2xl font-semibold text-ink">{q.q}</p>
      </div>
      <div className="grid gap-2.5">
        {q.options.map((opt, idx) => {
          const cls = reveal
            ? idx === q.answer
              ? 'border-neon-green bg-neon-green/15 text-ink'
              : idx === picked
                ? 'border-neon-pink bg-neon-pink/15 text-ink'
                : 'border-line/40 text-ink-low'
            : 'border-line bg-panel/70 text-ink active:scale-[0.98]'
          return (
            <button
              key={idx}
              onPointerDown={() => answer(idx)}
              disabled={reveal}
              className={`rounded-xl border-2 px-4 py-4 text-left text-base font-medium transition ${cls}`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export const trivia: MicroGame = {
  id: 'trivia',
  title: 'Trivia',
  tagline: 'Three questions. Fast and right beats slow and wrong.',
  category: 'knowledge',
  direction: 'higher',
  playMs: PLAY_MS,
  formatScore: (s) => `${s}`,
  Play: Trivia,
}
