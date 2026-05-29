// Headless smoke test: confirms Supabase Realtime broadcast + presence works
// cross-client with our publishable key and channel naming.
import { createClient } from '@supabase/supabase-js'

const URL = 'https://jrvueyojezmbcmlxzlfr.supabase.co'
const KEY = 'sb_publishable_mlPHRXxho-1BaLQb1S4NdQ_TW2DbHT3'
const room = `taproom:room:NODE${Math.floor(Math.random() * 1000)}`

setTimeout(() => {
  console.log('TIMEOUT')
  process.exit(1)
}, 18000)

function make(id) {
  const sb = createClient(URL, KEY, { realtime: { params: { eventsPerSecond: 20 } } })
  const ch = sb.channel(room, { config: { broadcast: { self: false }, presence: { key: id } } })
  return { sb, ch, id }
}

const A = make('A')
const B = make('B')
let received = false
B.ch.on('broadcast', { event: 'msg' }, () => {
  received = true
})
A.ch.on('presence', { event: 'sync' }, () => {})
B.ch.on('presence', { event: 'sync' }, () => {})

const sub = (c) =>
  new Promise((res) => {
    c.ch.subscribe(async (s) => {
      if (s === 'SUBSCRIBED') {
        await c.ch.track({ id: c.id, name: c.id })
        res(s)
      } else if (s === 'CHANNEL_ERROR' || s === 'TIMED_OUT') {
        res(s)
      }
    })
  })

const sa = await sub(A)
const sb2 = await sub(B)
await new Promise((r) => setTimeout(r, 3000))
const ac = Object.keys(A.ch.presenceState()).length
const bc = Object.keys(B.ch.presenceState()).length
A.ch.send({ type: 'broadcast', event: 'msg', payload: { hi: 1 } })
await new Promise((r) => setTimeout(r, 1500))

console.log(`status A=${sa} B=${sb2} | presence A=${ac} B=${bc} | broadcast=${received}`)
const ok = sa === 'SUBSCRIBED' && sb2 === 'SUBSCRIBED' && received && ac >= 2 && bc >= 2
console.log(ok ? 'REALTIME + PRESENCE OK' : 'NEEDS REVIEW')
process.exit(ok ? 0 : 1)
