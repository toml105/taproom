import { useEffect, useRef, useState } from 'react'
import { pickIndices } from '../lib/rng'
import { TRUE_FALSE } from './data/truefalse'
import { answerScore } from './scoreKit'
import type { MicroGame, MicroGameContext } from './types'

const N = 6
const PER_MS = 2600
const PLAY_MS = N * PER_MS

function TrueFalse({ ctx }: { ctx: MicroGameContext }) {
  const items = useRef(
    pickIndices(ctx.seed ^ 0x7f1, TRUE_FALSE.length, N).map((i) => TRUE_FALSE[i]),
  ).current
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<boolean | null>(null)
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
  function answer(val: boolean) {
    if (doneRef.current || picked !== null) return
    setPicked(val)
    setScore((s) => s + answerScore(val === items[i].a, PER_MS, startRef.current))
    setTimeout(() => {
      setPicked(null)
      if (i + 1 >= N) finish()
      else setI(i + 1)
    }, 700)
  }

  const it = items[i]
  const reveal = picked !== null
  const button = (val: boolean, label: string, base: string) => {
    const correct = it.a === val
    const cls = reveal
      ? correct
        ? 'border-neon-green bg-neon-green/15'
        : picked === val
          ? 'border-neon-pink bg-neon-pink/15'
          : 'border-line/40 opacity-60'
      : `${base} active:scale-[0.97]`
    return (
      <button
        onPointerDown={() => answer(val)}
        disabled={reveal}
        className={`flex-1 rounded-2xl border-2 py-9 font-signage text-2xl text-ink transition ${cls}`}
      >
        {label}
      </button>
    )
  }

  return (
    <div className="flex w-full flex-1 select-none flex-col px-6 py-8">
      <p className="text-center font-display text-[11px] tracking-[0.25em] text-amber/80">
        TRUE OR FALSE · {i + 1}/{N} · score {score}
      </p>
      <div className="flex flex-1 flex-col items-center justify-center">
        <p className="text-balance text-center text-2xl font-semibold text-ink">{it.s}</p>
      </div>
      <div className="flex gap-3">
        {button(true, 'TRUE', 'border-neon-green/60 bg-panel/70')}
        {button(false, 'FALSE', 'border-neon-pink/60 bg-panel/70')}
      </div>
    </div>
  )
}

export const trueFalse: MicroGame = {
  id: 'true-false',
  title: 'True or False',
  tagline: 'Six statements. Right and fast — don’t dither.',
  category: 'knowledge',
  direction: 'higher',
  playMs: PLAY_MS,
  formatScore: (s) => `${s}`,
  Play: TrueFalse,
}
