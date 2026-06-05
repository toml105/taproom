import { useEffect, useRef, useState } from 'react'
import { pickIndices } from '../lib/rng'
import { MOST_LIKELY } from './data/mostLikely'
import type { MicroGame, MicroGameContext } from './types'

const PLAY_MS = 9000

function MostLikely({ ctx }: { ctx: MicroGameContext }) {
  const prompt = useRef(MOST_LIKELY[pickIndices(ctx.seed ^ 0x4f01, MOST_LIKELY.length, 1)[0]]).current
  const candidates = ctx.candidates ?? []
  const [picked, setPicked] = useState<string | null>(null)
  const doneRef = useRef(false)

  useEffect(() => {
    const t = setTimeout(() => {
      if (!doneRef.current) {
        doneRef.current = true
        ctx.submit({ score: 0, valid: false }) // abstain
      }
    }, PLAY_MS)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function vote(id: string) {
    if (doneRef.current || picked) return
    doneRef.current = true
    setPicked(id)
    ctx.submitVote?.(id)
  }

  return (
    <div className="flex w-full flex-1 select-none flex-col px-6 py-8">
      <p className="text-center font-display text-[11px] tracking-[0.25em] text-amber/80">
        MOST LIKELY TO…
      </p>
      <div className="flex min-h-[5rem] flex-col items-center justify-center">
        <p className="text-balance text-center text-2xl font-semibold text-ink">{prompt.text}?</p>
      </div>
      <div className="grid gap-2.5">
        {candidates.map((c) => (
          <button
            key={c.id}
            onPointerDown={() => vote(c.id)}
            disabled={picked !== null}
            className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left text-base font-medium transition active:scale-[0.98] ${
              picked === c.id
                ? 'border-neon-green bg-neon-green/15 text-ink'
                : picked
                  ? 'border-line/40 text-ink-low'
                  : 'border-line bg-panel/70 text-ink'
            }`}
          >
            <span className="text-2xl" aria-hidden>
              {c.emoji}
            </span>
            <span className="min-w-0 flex-1 truncate">{c.name}</span>
          </button>
        ))}
        {candidates.length === 0 && (
          <p className="mt-6 text-center text-sm text-ink-low">
            Need more players for this one — sit tight.
          </p>
        )}
      </div>
      {picked && (
        <p className="mt-4 text-center text-sm text-ink-mid">Vote locked in 🍻</p>
      )}
    </div>
  )
}

export const mostLikely: MicroGame = {
  id: 'most-likely',
  title: 'Most Likely To',
  tagline: 'Vote for the player who fits the bill. Most votes drinks.',
  category: 'social',
  kind: 'vote',
  direction: 'lower',
  playMs: PLAY_MS,
  formatScore: (s) => `${s} vote${s === 1 ? '' : 's'}`,
  Play: MostLikely,
}
