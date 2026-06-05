// The wire contract. Every realtime message is an Envelope sent on one
// broadcast event; clients discriminate on `t`. Host-to-all events carry a
// monotonic `seq` so clients can drop stale / duplicate / reordered messages.
import type {
  EngineSnapshot,
  GameSettings,
  PublicPlayer,
  RankRow,
  SipRow,
  Standing,
} from './types'

export const PROTOCOL_VERSION = 1 as const
export const BROADCAST_EVENT = 'msg'

export type EventType =
  | 'lobby_update'
  | 'session_start'
  | 'round_intro'
  | 'countdown'
  | 'result'
  | 'round_results'
  | 'targeting_start'
  | 'targeting_pick'
  | 'leaderboard'
  | 'session_end'
  | 'snapshot'
  | 'emote'
  | 'ping_host'

export interface Envelope<T = unknown> {
  v: typeof PROTOCOL_VERSION
  t: EventType
  from: string
  ts: number
  seq?: number
  p: T
}

export interface LobbyUpdate {
  roomCode: string
  hostId: string
  players: PublicPlayer[]
  settings: GameSettings
}
export interface RoundIntro {
  round: number
  gameId: string
  roundSeed: number
  title: string
  instructions: string
  introMs: number
  twistId: string
}
export interface Countdown {
  round: number
  gameId: string
  roundSeed: number
  countMs: number
  playMs: number
  twistId: string
}
export interface ResultMsg {
  round: number
  gameId: string
  score: number
  valid: boolean
  /** Vote-game only: the player this voter chose. */
  targetId?: string
}
export interface RoundResultsMsg {
  round: number
  gameId: string
  ranking: RankRow[]
  sips: SipRow[]
  twistId: string
}
export interface TargetingStart {
  round: number
  assignerId: string
  candidateIds: string[]
  bonus: number
  deadlineMs: number
}
export interface TargetingPick {
  round: number
  targetId: string
}
export interface LeaderboardMsg {
  standings: Standing[]
  roundsPlayed: number
}
export interface SessionEnd {
  finalStandings: Standing[]
  winnerId: string | null
  roundsPlayed: number
}
export interface Emote {
  emote: string
}
export type Snapshot = EngineSnapshot

export function envelope<T>(t: EventType, from: string, p: T, seq?: number): Envelope<T> {
  const e: Envelope<T> = { v: PROTOCOL_VERSION, t, from, ts: Date.now(), p }
  if (seq !== undefined) e.seq = seq
  return e
}
