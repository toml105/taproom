import type { MicroGame, GameCategory } from './types'
import { mulberry32 } from '../lib/rng'
import { tapSprint } from './tapSprint'
import { bullseye } from './bullseye'
import { quickdraw } from './quickdraw'
import { stroop } from './stroop'
import { echo } from './echo'
import { trivia } from './trivia'
import { closestCall } from './closestCall'
import { higherLower } from './higherLower'
import { oddOneOut } from './oddOneOut'
import { flags } from './flags'
import { trueFalse } from './trueFalse'
import { finishSaying } from './finishSaying'
import { guessYear } from './guessYear'
import { quickMaths } from './quickMaths'
import { spotIt } from './spotIt'
import { mostLikely } from './mostLikely'

export const GAMES: MicroGame[] = [
  trivia,
  quickdraw,
  oddOneOut,
  closestCall,
  flags,
  bullseye,
  trueFalse,
  higherLower,
  finishSaying,
  tapSprint,
  guessYear,
  stroop,
  echo,
  quickMaths,
  spotIt,
  mostLikely,
]

export const GAMES_BY_ID: Record<string, MicroGame> = Object.fromEntries(
  GAMES.map((g) => [g.id, g]),
)

export const ALL_GAME_IDS = GAMES.map((g) => g.id)

const byCat = (cats: GameCategory[]) =>
  GAMES.filter((g) => cats.includes(g.category)).map((g) => g.id)

/** Curated groupings the host can pick in the lobby. */
export const PACKS: { key: string; label: string; ids: string[] }[] = [
  { key: 'all', label: 'Everything', ids: ALL_GAME_IDS },
  { key: 'brains', label: 'Brains', ids: byCat(['knowledge', 'memory', 'focus']) },
  { key: 'reflexes', label: 'Reflexes', ids: byCat(['reflex', 'precision', 'motor', 'focus']) },
  { key: 'social', label: 'Social', ids: byCat(['social', 'knowledge', 'reflex']) },
]

/** Pick the next game, avoiding the last couple played. Seeded for determinism. */
export function pickNextGame(enabledIds: string[], recentIds: string[], seed: number): MicroGame {
  const base = enabledIds.length ? GAMES.filter((g) => enabledIds.includes(g.id)) : GAMES
  const recent = new Set(recentIds.slice(-2))
  const fresh = base.filter((g) => !recent.has(g.id))
  const pool = fresh.length ? fresh : base
  const rng = mulberry32(seed)
  return pool[Math.floor(rng() * pool.length)] ?? GAMES[0]
}
