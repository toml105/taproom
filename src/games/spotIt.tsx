import { useEffect, useRef, useState } from 'react'
import { mulberry32 } from '../lib/rng'
import type { MicroGame, MicroGameContext } from './types'

const PLAY_MS = 12000
// Pairs of similar-looking emoji: [common fill, the odd one to find].
const PAIRS: [string, string][] = [
  ['🙂', '🙃'],
  ['🐶', '🐺'],
  ['🍊', '🍋'],
  ['😺', '😸'],
  ['🌝', '🌚'],
  ['🐸', '🐢'],
  ['🍎', '🍏'],
  ['⭐', '🌟'],
  ['🦊', '🐱'],
  ['🥔', '🥥'],
  ['🐵', '🙈'],
  ['🌵', '🎄'],
]

interface Grid {
  fill: string
  odd: string
  oddIndex: number
  size: number // cells = size*size
}

function buildGrid(rng: () => number, level: number): Grid {
  const pair = PAIRS[Math.floor(rng() * PAIRS.length)]
  // Grid grows from 3x3 up to 5x5 as you progress.
  const dim = Math.min(5, 3 + Math.floor(level / 3))
  const cells = dim * dim
  return {
    fill: pair[0],
    odd: pair[1],
    oddIndex: Math.floor(rng() * cells),
    size: dim,
  }
}

function SpotIt({ ctx }: { ctx: MicroGameContext }) {
  const rng = useRef(mulberry32(ctx.seed ^ 0x590717)).current
  const [level, setLevel] = useState(0)
  const [grid, setGrid] = useState<Grid>(() => buildGrid(rng, 0))
  const [score, setScore] = useState(0)
  const [flash, setFlash] = useState<'ok' | 'no' | null>(null)
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

  function tap(idx: number) {
    if (doneRef.current) return
    if (idx === grid.oddIndex) {
      setScore((s) => s + 1)
      setFlash('ok')
      const next = level + 1
      setLevel(next)
      setGrid(buildGrid(rng, next))
    } else {
      setFlash('no')
      setScore((s) => Math.max(0, s - 1)) // small penalty for misfires
    }
    setTimeout(() => setFlash(null), 120)
  }

  return (
    <div className="flex w-full flex-1 select-none flex-col items-center justify-between px-6 py-8">
      <div className="text-center">
        <p className="font-display text-[11px] tracking-[0.25em] text-amber/80">
          SPOT THE ODD ONE
        </p>
        <p className="mt-2 font-display text-xs text-ink-low">found {score}</p>
      </div>
      <div
        className="grid w-full max-w-sm gap-2 transition-transform"
        style={{
          gridTemplateColumns: `repeat(${grid.size}, minmax(0, 1fr))`,
          transform: flash === 'ok' ? 'scale(1.02)' : 'scale(1)',
        }}
      >
        {Array.from({ length: grid.size * grid.size }, (_, idx) => (
          <button
            key={idx}
            onPointerDown={() => tap(idx)}
            className="flex aspect-square items-center justify-center rounded-lg border border-line/50 bg-panel/50 text-3xl active:scale-95"
          >
            <span aria-hidden>{idx === grid.oddIndex ? grid.odd : grid.fill}</span>
          </button>
        ))}
      </div>
      <p className="font-display text-xs text-ink-low">
        {flash === 'no' ? 'not that one!' : 'tap the different emoji'}
      </p>
    </div>
  )
}

export const spotIt: MicroGame = {
  id: 'spot-it',
  title: 'Spot It',
  tagline: 'Tap the one emoji that’s different. Keep finding them, fast.',
  category: 'reflex',
  direction: 'higher',
  playMs: PLAY_MS,
  formatScore: (s) => `${s} found`,
  Play: SpotIt,
}
