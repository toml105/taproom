import type { MicroGame } from './types'
import { mulberry32 } from '../lib/rng'
import { tapSprint } from './tapSprint'
import { bullseye } from './bullseye'
import { quickdraw } from './quickdraw'
import { stroop } from './stroop'
import { echo } from './echo'

export const GAMES: MicroGame[] = [bullseye, tapSprint, stroop, echo, quickdraw]

export const GAMES_BY_ID: Record<string, MicroGame> = Object.fromEntries(
  GAMES.map((g) => [g.id, g]),
)

export const ALL_GAME_IDS = GAMES.map((g) => g.id)

/** Pick the next game, avoiding the last couple played. Seeded for determinism. */
export function pickNextGame(
  enabledIds: string[],
  recentIds: string[],
  seed: number,
): MicroGame {
  const base = enabledIds.length ? GAMES.filter((g) => enabledIds.includes(g.id)) : GAMES
  const recent = new Set(recentIds.slice(-2))
  const fresh = base.filter((g) => !recent.has(g.id))
  const pool = fresh.length ? fresh : base
  const rng = mulberry32(seed)
  return pool[Math.floor(rng() * pool.length)] ?? GAMES[0]
}
