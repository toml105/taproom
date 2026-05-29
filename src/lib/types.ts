// Shared TAPROOM domain types. Pure data, no runtime dependencies.

export type Phase =
  | 'lobby'
  | 'roundIntro'
  | 'countdown'
  | 'playing'
  | 'collecting'
  | 'roundResults'
  | 'leaderboard'
  | 'ended'

/** What each connected client publishes via Supabase Presence. */
export interface PresenceState {
  id: string
  name: string
  emoji: string
  joinOrder: number
  cumulativeSips: number
  isHost: boolean
  /** Player is drinking soft drinks: still scores and ranks, just no alcohol. */
  soft: boolean
  /** Host only: when this host's session began (collision / host-claim tiebreak). */
  sessionStartedAt: number
}

/** Roster entry the host broadcasts to everyone. */
export interface PublicPlayer {
  id: string
  name: string
  emoji: string
  joinOrder: number
  connected: boolean
  isHost: boolean
  soft: boolean
}

export interface Standing {
  id: string
  cumulativeSips: number
  wins?: number
}

export interface RankRow {
  id: string
  rank: number
  score: number
  valid: boolean
}

export interface SipRow {
  id: string
  sips: number
}

export interface RoundResult {
  round: number
  gameId: string
  ranking: RankRow[] // best first
  sips: SipRow[]
}

export interface GameSettings {
  /** Hard humane ceiling on sips any one player can owe per round. */
  maxSipsPerRound: number
  softModeDefault: boolean
  comebackHandicap: boolean
  /** Empty means "all registered games". */
  enabledGameIds: string[]
  endless: boolean
  totalRounds: number
}

export const DEFAULT_SETTINGS: GameSettings = {
  maxSipsPerRound: 3,
  softModeDefault: false,
  comebackHandicap: true,
  enabledGameIds: [],
  endless: true,
  totalRounds: 12,
}

export const MAX_PLAYERS = 12

/** Authoritative game state: broadcast by the host, rendered by everyone. */
export interface EngineSnapshot {
  v: 1
  phase: Phase
  round: number
  gameId: string | null
  roundSeed: number | null
  power: boolean
  hostId: string
  roomCode: string
  players: PublicPlayer[]
  standings: Standing[]
  lastRound: RoundResult | null
  recentGameIds: string[]
  settings: GameSettings
  seq: number
}
