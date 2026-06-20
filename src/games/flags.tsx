import { useRef } from 'react'
import { pickIndices, shuffleWithAnswer } from '../lib/rng'
import { FLAGS } from './data/flags'
import { QuizRound } from '../components/QuizRound'
import type { QuizPrompt } from '../components/QuizRound'
import type { MicroGame, MicroGameContext } from './types'

const N = 3

function Flags({ ctx }: { ctx: MicroGameContext }) {
  const prompts = useRef<QuizPrompt[]>(
    pickIndices(ctx.seed ^ 0xf1a, FLAGS.length, N).map((qi, k) => {
      const correct = FLAGS[qi]
      const distractors = pickIndices(ctx.seed ^ (0xf2b + k), FLAGS.length, FLAGS.length)
        .filter((j) => j !== qi)
        .slice(0, 3)
        .map((j) => FLAGS[j].country)
      const sh = shuffleWithAnswer(ctx.seed ^ (0xf3c + k), [correct.country, ...distractors], 0)
      return {
        header: 'FLAGS',
        prompt: <span className="text-8xl leading-none">{correct.flag}</span>,
        options: sh.options,
        answer: sh.answer,
      }
    }),
  ).current
  return <QuizRound ctx={ctx} prompts={prompts} perMs={5000} cols={2} />
}

export const flags: MicroGame = {
  id: 'flags',
  title: 'Flags',
  tagline: 'Name the country from its flag. Quick and right wins.',
  category: 'knowledge',
  direction: 'higher',
  playMs: N * 5000,
  formatScore: (s) => `${s}`,
  Play: Flags,
}
