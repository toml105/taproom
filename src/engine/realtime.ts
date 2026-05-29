import { supabase } from '../lib/supabaseClient'
import { BROADCAST_EVENT } from '../lib/protocol'
import type { Envelope } from '../lib/protocol'
import type { PresenceState } from '../lib/types'
import type { RealtimeChannel } from '@supabase/supabase-js'

export type ConnStatus = 'connecting' | 'subscribed' | 'reconnecting' | 'error' | 'closed'

export interface RoomChannelHandlers {
  onMessage: (env: Envelope) => void
  onPresence: (states: PresenceState[]) => void
  onStatus: (status: ConnStatus) => void
}

/** Thin wrapper around one Supabase Realtime channel per room: broadcast +
 * presence, with exponential-backoff resubscribe on errors. */
export class RoomChannel {
  private channel: RealtimeChannel | null = null
  private retries = 0
  private retryTimer: ReturnType<typeof setTimeout> | null = null
  private closed = false
  private code: string
  private handlers: RoomChannelHandlers
  private presence: PresenceState

  constructor(code: string, handlers: RoomChannelHandlers, presence: PresenceState) {
    this.code = code
    this.handlers = handlers
    this.presence = presence
  }

  private name() {
    return `taproom:room:${this.code}`
  }

  subscribe() {
    this.closed = false
    this.handlers.onStatus(this.retries ? 'reconnecting' : 'connecting')
    const ch = supabase.channel(this.name(), {
      config: { broadcast: { self: true }, presence: { key: this.presence.id } },
    })
    ch.on('broadcast', { event: BROADCAST_EVENT }, ({ payload }) => {
      this.handlers.onMessage(payload as Envelope)
    })
    const sync = () => this.handlers.onPresence(this.list())
    ch.on('presence', { event: 'sync' }, sync)
    ch.on('presence', { event: 'join' }, sync)
    ch.on('presence', { event: 'leave' }, sync)
    ch.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        this.retries = 0
        this.handlers.onStatus('subscribed')
        void ch.track(this.presence)
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
        if (!this.closed) this.scheduleReconnect()
      }
    })
    this.channel = ch
  }

  private scheduleReconnect() {
    if (this.retryTimer || this.closed) return
    this.handlers.onStatus('reconnecting')
    const base = Math.min(15000, 1000 * 2 ** this.retries)
    const delay = base * (0.8 + Math.random() * 0.4)
    this.retries++
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null
      this.teardown()
      this.subscribe()
    }, delay)
  }

  private list(): PresenceState[] {
    if (!this.channel) return []
    const raw = this.channel.presenceState() as unknown as Record<string, PresenceState[]>
    const out: PresenceState[] = []
    for (const key of Object.keys(raw)) {
      const metas = raw[key]
      if (metas && metas[0]) out.push(metas[0])
    }
    return out
  }

  presenceList(): PresenceState[] {
    return this.list()
  }

  setPresence(p: PresenceState) {
    this.presence = p
    if (this.channel) void this.channel.track(p)
  }

  broadcast(env: Envelope) {
    if (!this.channel) return
    void this.channel.send({ type: 'broadcast', event: BROADCAST_EVENT, payload: env })
  }

  private teardown() {
    if (this.channel) {
      void supabase.removeChannel(this.channel)
      this.channel = null
    }
  }

  close() {
    this.closed = true
    if (this.retryTimer) {
      clearTimeout(this.retryTimer)
      this.retryTimer = null
    }
    this.teardown()
    this.handlers.onStatus('closed')
  }
}
