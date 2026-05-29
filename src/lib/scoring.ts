import type { RankRow, SipRow } from './types'

interface RawScore {
  id: string
  score: number
  valid: boolean
}

/** Rank players best-first. Invalid (DNF / no-show) always sorts to the bottom. */
export function rankScores(scores: RawScore[], higherIsBetter: boolean): RankRow[] {
  const sorted = [...scores].sort((a, b) => {
    if (a.valid !== b.valid) return a.valid ? -1 : 1
    return higherIsBetter ? b.score - a.score : a.score - b.score
  })
  const rows: RankRow[] = []
  let prevScore: number | null = null
  let prevValid: boolean | null = null
  let prevRank = 0
  sorted.forEach((s, i) => {
    const tie = prevValid === s.valid && prevScore === s.score
    const rank = tie ? prevRank : i + 1
    rows.push({ id: s.id, rank, score: s.score, valid: s.valid })
    prevScore = s.score
    prevValid = s.valid
    prevRank = rank
  })
  return rows
}

/**
 * Placement -> sips. The top ~40% drink nothing (staying sober is the reward);
 * the rest ramp from 1 up to the per-round cap. The cap is a hard humane
 * ceiling enforced here and never bypassable by a game module.
 */
export function assignSips(ranking: RankRow[], cap: number): SipRow[] {
  const n = ranking.length
  if (n <= 1) return ranking.map((r) => ({ id: r.id, sips: 0 }))
  const safeTop = Math.max(1, Math.ceil(n * 0.4))
  const losers = Math.max(1, n - safeTop)
  return ranking.map((r) => {
    if (r.rank <= safeTop) return { id: r.id, sips: 0 }
    const posInLosers = r.rank - safeTop // 1..losers
    const raw = Math.ceil((posInLosers / losers) * cap)
    return { id: r.id, sips: Math.max(1, Math.min(raw, cap)) }
  })
}
