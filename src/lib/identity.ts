// Stable per-device identity + per-room sip memory, persisted in localStorage so
// a refresh or reconnect keeps the same player and restores their running total.

export interface Identity {
  id: string
  name: string
  emoji: string
}

const KEY = 'taproom.identity.v1'

export const EMOJI_CHOICES = [
  '🍺', '🎯', '🎲', '⚡', '🔥', '💀', '😎', '🦊', '🐙', '🦁', '🐸', '🍻',
  '🕹️', '🎸', '👽', '🤖', '🦖', '🐝', '🍒', '⭐', '🌮', '🦦', '🐲', '🎩',
]

export function pickRandomEmoji(): string {
  return EMOJI_CHOICES[Math.floor(Math.random() * EMOJI_CHOICES.length)]
}

export function loadIdentity(): Identity {
  try {
    const cached = localStorage.getItem(KEY)
    if (cached) return JSON.parse(cached) as Identity
  } catch {
    // ignore corrupt storage
  }
  const ident: Identity = { id: crypto.randomUUID(), name: '', emoji: pickRandomEmoji() }
  try {
    localStorage.setItem(KEY, JSON.stringify(ident))
  } catch {
    // ignore unavailable storage
  }
  return ident
}

export function saveIdentity(patch: Partial<Identity>): Identity {
  const next = { ...loadIdentity(), ...patch }
  try {
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    // ignore
  }
  return next
}

const roomKey = (code: string) => `taproom.room.${code}.v1`

export function loadRoomSips(code: string): number {
  try {
    const cached = localStorage.getItem(roomKey(code))
    if (cached) return (JSON.parse(cached).cumulativeSips as number) ?? 0
  } catch {
    // ignore
  }
  return 0
}

export function saveRoomSips(code: string, cumulativeSips: number): void {
  try {
    localStorage.setItem(roomKey(code), JSON.stringify({ cumulativeSips }))
  } catch {
    // ignore
  }
}
