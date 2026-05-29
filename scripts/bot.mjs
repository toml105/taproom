// A headless bot player for testing: joins a room, appears in presence, and
// submits a good score each round. Usage: node scripts/bot.mjs <ROOMCODE>
import { createClient } from '@supabase/supabase-js'

const URL = 'https://jrvueyojezmbcmlxzlfr.supabase.co'
const KEY = 'sb_publishable_mlPHRXxho-1BaLQb1S4NdQ_TW2DbHT3'
const code = (process.argv[2] || '').toUpperCase()
if (!code) {
  console.error('usage: node scripts/bot.mjs <ROOMCODE>')
  process.exit(1)
}

const id = 'bot-' + Math.random().toString(36).slice(2, 8)
const GOOD = { 'tap-sprint': 48, bullseye: 96, stroop: 820, echo: 7, quickdraw: 240 }

const sb = createClient(URL, KEY, { realtime: { params: { eventsPerSecond: 20 } } })
const ch = sb.channel(`taproom:room:${code}`, {
  config: { broadcast: { self: false }, presence: { key: id } },
})

const env = (t, p) => ({ v: 1, t, from: id, ts: Date.now(), p })

ch.on('broadcast', { event: 'msg' }, ({ payload: e }) => {
  if (!e || e.from === id) return
  if (e.t === 'countdown') {
    const { round, gameId, countMs, playMs } = e.p
    const score = GOOD[gameId] ?? 50
    setTimeout(
      () => {
        ch.send({ type: 'broadcast', event: 'msg', payload: env('result', { round, gameId, score, valid: true }) })
        console.log(`bot submitted ${gameId}=${score} (round ${round})`)
      },
      countMs + Math.min(playMs, 2500),
    )
  }
})

ch.subscribe((s) => {
  if (s === 'SUBSCRIBED') {
    ch.track({
      id,
      name: 'Robo',
      emoji: '🤖',
      joinOrder: 50,
      cumulativeSips: 0,
      isHost: false,
      soft: false,
      sessionStartedAt: 0,
    })
    console.log(`bot ${id} joined room ${code}`)
  }
})

console.log(`bot running for room ${code} (Ctrl-C to stop)`)
