import type { ComponentType } from 'react'

export type ScoreDirection = 'higher' | 'lower'
export type GameCategory =
  | 'reflex'
  | 'precision'
  | 'memory'
  | 'focus'
  | 'motor'
  | 'knowledge'

/** Everything a micro-game needs to run locally and report one number. */
export interface MicroGameContext {
  round: number
  /** Shared seed: deterministic RNG so every device gets the same challenge. */
  seed: number
  /** True for the player most in the lead on sips (a subtle, kind handicap). */
  handicap: boolean
  /** Submit exactly once when the attempt ends. */
  submit: (result: { score: number; valid: boolean }) => void
}

/**
 * A self-contained skill game. It runs entirely on the player's device and
 * reports a single numeric score; the host ranks the numbers. Adding a game is
 * just dropping a module and registering it. No protocol changes.
 */
export interface MicroGame {
  id: string
  title: string
  /** One-line how-to shown on the round intro. */
  tagline: string
  category: GameCategory
  direction: ScoreDirection
  /** Approx play time; the host uses it to size the result-collection window. */
  playMs: number
  /** Pretty-print a raw score (e.g. "287 ms", "×18"). */
  formatScore?: (score: number) => string
  Play: ComponentType<{ ctx: MicroGameContext }>
}
