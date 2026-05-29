import type { PresenceState } from './types'

/**
 * Deterministic host election: the connected player with the lowest joinOrder.
 * Every client computes the same answer from the same presence list, so no
 * voting or messaging is needed to agree on who referees.
 */
export function electHost(presences: PresenceState[]): string | null {
  if (!presences.length) return null
  return [...presences].sort(
    (a, b) => a.joinOrder - b.joinOrder || a.id.localeCompare(b.id),
  )[0].id
}
