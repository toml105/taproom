// Round twists: a seeded per-round modifier that changes how sips are handed
// out. Each twist is a PURE transform from the base sip assignment (already
// humane-capped by assignSips) to a final assignment, re-clamped to a hard
// ceiling. Only the host runs `apply`; clients just receive a twistId and look
// up the label/intro for display, so the engine stays host-authoritative.
import { mulberry32 } from '../lib/rng'
import type { RankRow, SipRow } from '../lib/types'

/** Absolute ceiling on sips from any twist, regardless of per-round settings. */
export const TWIST_HARD_CAP = 5

export interface TwistContext {
  /** Best-first ranking from rankScores. */
  ranking: RankRow[]
  /** Output of assignSips (already capped to settings.maxSipsPerRound). */
  base: SipRow[]
  /** settings.maxSipsPerRound. */
  cap: number
  hardCap: number
}

export interface Twist {
  id: string
  label: string
  /** One-liner shown on the round-intro screen. */
  intro: string
  badge?: string
  /** Pure: base sips -> final sips. MUST clamp every value to hardCap. */
  apply: (ctx: TwistContext) => SipRow[]
}

const clamp = (n: number, hardCap: number) => Math.max(0, Math.min(hardCap, Math.round(n)))

const none: Twist = {
  id: 'none',
  label: 'Straight Round',
  intro: 'No twist — bottom of the pack drinks.',
  apply: ({ base, hardCap }) => base.map((s) => ({ id: s.id, sips: clamp(s.sips, hardCap) })),
}

const power: Twist = {
  id: 'power',
  label: 'Power Round',
  intro: 'Double stakes — every sip counts double.',
  badge: '⚡',
  apply: ({ base, hardCap }) =>
    base.map((s) => ({ id: s.id, sips: s.sips > 0 ? clamp(s.sips * 2, hardCap) : 0 })),
}

const mirror: Twist = {
  id: 'mirror',
  label: 'Mirror Round',
  intro: 'Overconfidence tax — the winner drinks one, too.',
  badge: '🪞',
  apply: ({ ranking, base, hardCap }) => {
    const top = ranking.find((r) => r.valid)
    return base.map((s) =>
      top && s.id === top.id
        ? { id: s.id, sips: clamp(Math.max(s.sips, 1), hardCap) }
        : { id: s.id, sips: clamp(s.sips, hardCap) },
    )
  },
}

const suddenDeath: Twist = {
  id: 'suddenDeath',
  label: 'Sudden Death',
  intro: 'Only last place drinks — but they drink big.',
  badge: '💀',
  apply: ({ ranking, cap, hardCap }) => {
    const valid = ranking.filter((r) => r.valid)
    const loser = valid.length ? valid[valid.length - 1] : ranking[ranking.length - 1]
    return ranking.map((r) => ({
      id: r.id,
      sips: loser && r.id === loser.id ? clamp(Math.max(cap, 1), hardCap) : 0,
    }))
  },
}

const luckyLast: Twist = {
  id: 'luckyLast',
  label: 'Lucky Last',
  intro: 'Last place is forgiven this round. Everyone else, watch out.',
  badge: '🍀',
  apply: ({ ranking, base, hardCap }) => {
    const valid = ranking.filter((r) => r.valid)
    const last = valid.length ? valid[valid.length - 1] : null
    const baseMap = new Map(base.map((s) => [s.id, s.sips]))
    return ranking.map((r) => ({
      id: r.id,
      sips: last && r.id === last.id ? 0 : clamp(baseMap.get(r.id) ?? 0, hardCap),
    }))
  },
}

const avalanche: Twist = {
  id: 'avalanche',
  label: 'Avalanche',
  intro: 'Everyone drinks one — except the winner.',
  badge: '🏔️',
  apply: ({ ranking, hardCap }) => {
    const top = ranking.find((r) => r.valid)
    return ranking.map((r) => ({
      id: r.id,
      sips: top && r.id === top.id ? 0 : clamp(1, hardCap),
    }))
  },
}

export const TWISTS: Twist[] = [none, power, mirror, suddenDeath, luckyLast, avalanche]

export const TWISTS_BY_ID: Record<string, Twist> = Object.fromEntries(
  TWISTS.map((t) => [t.id, t]),
)

/**
 * Deterministically choose the round's twist. Round 1 is always clean; every
 * 4th round is a Power Round; otherwise a seeded pool biased toward "none" so
 * twists stay special.
 */
export function pickTwist(round: number, seed: number): Twist {
  if (round <= 1) return none
  if (round % 4 === 0) return power
  const rng = mulberry32((seed ^ 0x7c157) >>> 0)
  const pool = [none, none, none, mirror, luckyLast, suddenDeath, avalanche]
  return pool[Math.floor(rng() * pool.length)] ?? none
}
