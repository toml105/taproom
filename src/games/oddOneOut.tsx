import { useRef } from 'react'
import { pickIndices, shuffleWithAnswer } from '../lib/rng'
import { ODD_ONE_OUT } from './data/oddoneout'
import { QuizRound } from '../components/QuizRound'
import type { QuizPrompt } from '../components/QuizRound'
import type { MicroGame, MicroGameContext } from './types'

const N = 3

function OddOneOut({ ctx }: { ctx: MicroGameContext }) {
  const prompts = useRef<QuizPrompt[]>(
    pickIndices(ctx.seed ^ 0xa11, ODD_ONE_OUT.length, N).map((qi, k) => {
      const set = ODD_ONE_OUT[qi]
      const sh = shuffleWithAnswer(ctx.seed ^ (0xb22 + k), set.items, set.odd)
      return {
        header: 'ODD ONE OUT',
        prompt: <p className="text-lg text-ink-mid">Which one doesn’t belong?</p>,
        options: sh.options,
        answer: sh.answer,
      }
    }),
  ).current
  return <QuizRound ctx={ctx} prompts={prompts} perMs={5000} cols={2} />
}

export const oddOneOut: MicroGame = {
  id: 'odd-one-out',
  title: 'Odd One Out',
  tagline: 'Tap the one that doesn’t belong. Don’t dawdle.',
  category: 'knowledge',
  direction: 'higher',
  playMs: N * 5000,
  formatScore: (s) => `${s}`,
  Play: OddOneOut,
}
