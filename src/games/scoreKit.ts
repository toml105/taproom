// Shared "thought + speed" scoring for the quiz-style games.
//
// The design goal: getting the answer RIGHT is the floor (a flat base every
// correct answer earns), and SPEED is the differentiator on top (a bonus that
// decays linearly across the question's time window). A wrong answer scores
// nothing, so accuracy always beats guessing — but among players who are all
// correct, the fastest pulls ahead. Base and max-bonus are equal, so a perfect
// instant answer is worth ~2x a correct-but-slow one, and any correct answer
// beats any wrong one.

/** Points a correct answer is always worth, regardless of speed. */
export const CORRECT_BASE = 100
/** Most a correct answer can earn on top of the base for answering instantly. */
export const MAX_SPEED_BONUS = 100

/**
 * Speed bonus for an answer given `startedAt` (a performance.now() stamp taken
 * when the question appeared), decaying linearly to 0 across `perMs`.
 */
export function speedBonus(perMs: number, startedAt: number, maxBonus = MAX_SPEED_BONUS): number {
  const frac = 1 - (performance.now() - startedAt) / perMs
  return Math.max(0, Math.round(frac * maxBonus))
}

/** Points for one answer: right = base + speed bonus; wrong = nothing. */
export function answerScore(correct: boolean, perMs: number, startedAt: number): number {
  return correct ? CORRECT_BASE + speedBonus(perMs, startedAt) : 0
}
