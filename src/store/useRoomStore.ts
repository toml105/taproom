import { create } from 'zustand'
import type { EngineSnapshot } from '../lib/types'
import { DEFAULT_SETTINGS } from '../lib/types'
import type { ConnStatus } from '../engine/realtime'
import type { MicroGame } from '../games/types'

export type View =
  | 'connecting'
  | 'lobby'
  | 'roundIntro'
  | 'countdown'
  | 'playing'
  | 'waiting'
  | 'roundResults'
  | 'targeting'
  | 'leaderboard'
  | 'ended'

export function emptySnapshot(roomCode = '', hostId = ''): EngineSnapshot {
  return {
    v: 1,
    phase: 'lobby',
    round: 0,
    gameId: null,
    roundSeed: null,
    twistId: 'none',
    targeting: null,
    hostId,
    roomCode,
    players: [],
    standings: [],
    lastRound: null,
    recentGameIds: [],
    settings: { ...DEFAULT_SETTINGS, enabledGameIds: [...DEFAULT_SETTINGS.enabledGameIds] },
    seq: 0,
  }
}

export interface PlayState {
  game: MicroGame
  seed: number
  deadlineMs: number
  startedAt: number
}

export interface EmoteBlip {
  id: string
  emoji: string
  n: number
}

interface RoomStore {
  status: ConnStatus | 'idle'
  view: View
  roomCode: string
  selfId: string
  isHost: boolean
  snapshot: EngineSnapshot
  play: PlayState | null
  countMs: number
  mySips: number
  myCumulativeSips: number
  submittedCount: number
  activeCount: number
  emote: EmoteBlip | null
  patch: (p: Partial<RoomStore>) => void
  reset: () => void
}

const initial = {
  status: 'idle' as ConnStatus | 'idle',
  view: 'connecting' as View,
  roomCode: '',
  selfId: '',
  isHost: false,
  snapshot: emptySnapshot(),
  play: null as PlayState | null,
  countMs: 3000,
  mySips: 0,
  myCumulativeSips: 0,
  submittedCount: 0,
  activeCount: 0,
  emote: null as EmoteBlip | null,
}

export const useRoomStore = create<RoomStore>((set) => ({
  ...initial,
  patch: (p) => set(p),
  reset: () => set({ ...initial }),
}))
