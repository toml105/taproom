import { useEffect, useRef, useState } from 'react'
import { pickIndices } from '../lib/rng'
import { YEARS } from './data/years'
import type { MicroGame, MicroGameContext } from './types'

const PLAY_MS = 9000

function GuessYear({ ctx }: { ctx: MicroGameContext }) {
  const q = useRef(YEARS[pickIndices(ctx.seed ^ 0x42a, YEARS.length, 1)[0]]).current
  const [val, setVal] = useState('')
  const [done, setDone] = useState(false)
  const doneRef = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => submit(true), PLAY_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function submit(timeout: boolean) {
    if (doneRef.current) return
    if (timeout && val.trim() === '') {
      doneRef.current = true
      setDone(true)
      ctx.submit({ score: Number.MAX_SAFE_INTEGER, valid: false })
      return
    }
    const num = parseInt(val, 10)
    if (Number.isNaN(num)) return
    doneRef.current = true
    setDone(true)
    ctx.submit({ score: Math.abs(num - q.year), valid: true })
  }

  return (
    <div className="flex w-full flex-1 select-none flex-col items-center justify-center px-7 text-center">
      <p className="font-display text-[11px] tracking-[0.25em] text-amber/80">GUESS THE YEAR</p>
      <p className="mt-5 text-balance text-2xl font-semibold text-ink">{q.event}</p>
      {!done ? (
        <>
          <input
            autoFocus
            value={val}
            onChange={(e) => setVal(e.target.value.replace(/[^0-9]/g, '').slice(0, 4))}
            inputMode="numeric"
            placeholder="YYYY"
            className="mt-8 w-44 rounded-2xl border border-line bg-panel px-4 py-4 text-center font-display text-3xl text-amber placeholder:text-ink-low/40 focus:border-amber focus:outline-none"
          />
          <button
            onClick={() => submit(false)}
            disabled={val.trim() === ''}
            className="mt-6 w-44 rounded-2xl bg-amber px-6 py-3 font-signage text-pit disabled:opacity-40"
          >
            Lock it in
          </button>
        </>
      ) : (
        <div className="mt-8">
          <p className="text-ink-mid">It was</p>
          <p className="font-signage text-5xl text-neon-green text-glow-green">{q.year}</p>
          <p className="mt-3 text-ink-low">You said {val || 'nothing'}</p>
        </div>
      )}
    </div>
  )
}

export const guessYear: MicroGame = {
  id: 'guess-year',
  title: 'Guess the Year',
  tagline: 'When did it happen? Closest year is safe.',
  category: 'knowledge',
  direction: 'lower',
  playMs: PLAY_MS,
  formatScore: (s) => (s >= Number.MAX_SAFE_INTEGER ? 'no answer' : `±${s}`),
  Play: GuessYear,
}
