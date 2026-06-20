import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { MicroGameContext } from '../games/types'
import { answerScore } from '../games/scoreKit'

export interface QuizPrompt {
  header: string
  prompt: ReactNode
  options: string[]
  answer: number
}

/** Shared multiple-choice round runner: sequence of prompts, speed-weighted
 * scoring, brief correct/wrong reveal, then submit. */
export function QuizRound({
  ctx,
  prompts,
  perMs = 5000,
  cols = 1,
}: {
  ctx: MicroGameContext
  prompts: QuizPrompt[]
  perMs?: number
  cols?: 1 | 2
}) {
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const doneRef = useRef(false)
  const startRef = useRef(performance.now())
  const N = prompts.length

  useEffect(() => {
    startRef.current = performance.now()
  }, [i])
  useEffect(() => {
    const t = setTimeout(finish, N * perMs)
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
    const correct = choice === prompts[i].answer
    setScore((s) => s + answerScore(correct, perMs, startRef.current))
    setPicked(choice)
    setTimeout(() => {
      setPicked(null)
      if (i + 1 >= N) finish()
      else setI(i + 1)
    }, 850)
  }

  const q = prompts[i]
  const reveal = picked !== null
  return (
    <div className="flex w-full flex-1 select-none flex-col px-6 py-8">
      <p className="text-center font-display text-[11px] tracking-[0.25em] text-amber/80">
        {q.header} · {i + 1}/{N} · {score}
      </p>
      <div className="flex flex-1 flex-col items-center justify-center text-center">{q.prompt}</div>
      <div className={`grid gap-2.5 ${cols === 2 ? 'grid-cols-2' : 'grid-cols-1'}`}>
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
              className={`rounded-xl border-2 px-4 py-4 font-medium transition ${cols === 2 ? 'text-center' : 'text-left'} ${cls}`}
            >
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}
