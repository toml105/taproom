import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useRoomStore } from '../store/useRoomStore'
import { getController } from '../hooks/useRoom'

const REACTS = ['🍻', '🔥', '😂', '👏', '💀']

/** Tap a reaction; it broadcasts to everyone in the room. */
export function EmoteBar() {
  return (
    <div className="flex justify-center gap-2">
      {REACTS.map((e) => (
        <button
          key={e}
          onClick={() => getController()?.sendEmote(e)}
          className="rounded-full border border-line/60 bg-panel/70 px-3 py-2 text-xl active:scale-90"
          aria-label={`React ${e}`}
        >
          {e}
        </button>
      ))}
    </div>
  )
}

/** Floats incoming reactions up the screen. Mounted once at the room level. */
export function EmoteLayer() {
  const emote = useRoomStore((s) => s.emote)
  const [items, setItems] = useState<{ key: number; emoji: string }[]>([])

  useEffect(() => {
    if (!emote) return
    const key = emote.n
    setItems((prev) => [...prev, { key, emoji: emote.emoji }])
    const t = setTimeout(() => setItems((prev) => prev.filter((i) => i.key !== key)), 2000)
    return () => clearTimeout(t)
  }, [emote])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-40 flex justify-center">
      <AnimatePresence>
        {items.map((it) => (
          <motion.div
            key={it.key}
            initial={{ opacity: 0, y: 20, scale: 0.6 }}
            animate={{ opacity: 1, y: -50, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: 'easeOut' }}
            className="absolute text-5xl"
          >
            {it.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
