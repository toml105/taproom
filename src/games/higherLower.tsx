import { useEffect, useRef, useState } from 'react'
import { pickIndices } from '../lib/rng'
import { HIGHER_LOWER } from './data/higherlower'
import type { MicroGame, MicroGameContext } from './types'

const N = 5
const PLAY_MS = 14000

function HigherLower({ ctx }: { ctx: MicroGameContext }) {
  const items = useRef(
    pickIndices(ctx.seed ^ 0x77cc, HIGHER_LOWER.length, N).map((i) => HIGHER_LOWER[i]),
  ).current
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<null | 'a' | 'b'>(null)
  const doneRef = useRef(false)

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

  function answer(side: 'a' | 'b') {
    if (doneRef.current || picked) return
    const it = items[i]
    const correct = side === 'a' ? it.aVal >= it.bVal : it.bVal >= it.aVal
    setPicked(side)
    if (correct) setScore((s) => s + 1)
    setTimeout(() => {
      setPicked(null)
      if (i + 1 >= N) finish()
      else setI(i + 1)
    }, 1000)
  }

  const it = items[i]
  const reveal = picked !== null
  const aWins = it.aVal >= it.bVal
  const fmt = (v: number, u?: string) => `${v.toLocaleString()}${u ? ` ${u}` : ''}`
  const sideCls = (side: 'a' | 'b', wins: boolean) => {
    if (!reveal) return 'border-line bg-panel/70 active:scale-[0.98]'
    return wins
      ? 'border-neon-green bg-neon-green/15'
      : picked === side
        ? 'border-neon-pink bg-neon-pink/15'
        : 'border-line/40 opacity-70'
  }

  return (
    <div className="flex w-full flex-1 select-none flex-col px-6 py-8">
      <div className="text-center">
        <p className="font-display text-[11px] tracking-[0.25em] text-amber/80">
          HIGHER OR LOWER · {i + 1}/{N}
        </p>
        <p className="mt-3 font-signage text-xl text-amber">{it.metric}?</p>
      </div>
      <div className="flex flex-1 flex-col justify-center gap-3">
        {(['a', 'b'] as const).map((side) => {
          const label = side === 'a' ? it.a : it.b
          const val = side === 'a' ? it.aVal : it.bVal
          const wins = side === 'a' ? aWins : !aWins
          return (
            <button
              key={side}
              onPointerDown={() => answer(side)}
              disabled={reveal}
              className={`rounded-2xl border-2 px-5 py-7 text-center transition ${sideCls(side, wins)}`}
            >
              <span className="font-signage text-xl text-ink">{label}</span>
              {reveal && <span className="mt-1 block text-sm text-ink-mid">{fmt(val, it.unit)}</span>}
            </button>
          )
        })}
      </div>
      <p className="text-center text-sm text-ink-mid">Tap the bigger one</p>
    </div>
  )
}

export const higherLower: MicroGame = {
  id: 'higher-lower',
  title: 'Higher or Lower',
  tagline: 'Tap whichever scores higher on the metric.',
  category: 'knowledge',
  direction: 'higher',
  playMs: PLAY_MS,
  formatScore: (s) => `${s}/5`,
  Play: HigherLower,
}
