import { useRef } from 'react'
import { pickIndices, shuffleWithAnswer } from '../lib/rng'
import { SAYINGS } from './data/sayings'
import { QuizRound } from '../components/QuizRound'
import type { QuizPrompt } from '../components/QuizRound'
import type { MicroGame, MicroGameContext } from './types'

const N = 3

function FinishSaying({ ctx }: { ctx: MicroGameContext }) {
  const prompts = useRef<QuizPrompt[]>(
    pickIndices(ctx.seed ^ 0x5a1, SAYINGS.length, N).map((qi, k) => {
      const s = SAYINGS[qi]
      const sh = shuffleWithAnswer(ctx.seed ^ (0x5b2 + k), s.options, s.answer)
      return {
        header: 'FINISH THE SAYING',
        prompt: <p className="text-balance text-2xl font-semibold text-ink">{s.start}</p>,
        options: sh.options,
        answer: sh.answer,
      }
    }),
  ).current
  return <QuizRound ctx={ctx} prompts={prompts} perMs={5000} cols={1} />
}

export const finishSaying: MicroGame = {
  id: 'finish-saying',
  title: 'Finish the Saying',
  tagline: 'Pick the right ending — fast — to the famous saying.',
  category: 'knowledge',
  direction: 'higher',
  playMs: N * 5000,
  formatScore: (s) => `${s}`,
  Play: FinishSaying,
}
