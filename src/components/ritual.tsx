import { useRef, useState } from 'react'

const HOLD_MS = 1150
const R = 54
const C = 2 * Math.PI * R

/**
 * Tap-and-hold to confirm you drank. A radial ring fills over ~1.2s; releasing
 * early empties it. Player-paced and physical, never auto-fires.
 */
export function HoldToDrink({
  label = 'HOLD TO DRINK',
  doneLabel = 'DOWN THE HATCH',
  onDone,
}: {
  label?: string
  doneLabel?: string
  onDone?: () => void
}) {
  const [p, setP] = useState(0)
  const [done, setDone] = useState(false)
  const holding = useRef(false)
  const start = useRef(0)
  const raf = useRef(0)

  function tick() {
    const np = Math.min(1, (performance.now() - start.current) / HOLD_MS)
    setP(np)
    if (np >= 1) {
      holding.current = false
      setDone(true)
      onDone?.()
      return
    }
    if (holding.current) raf.current = requestAnimationFrame(tick)
  }
  function down() {
    if (done) return
    holding.current = true
    start.current = performance.now()
    raf.current = requestAnimationFrame(tick)
  }
  function up() {
    if (done || !holding.current) return
    holding.current = false
    cancelAnimationFrame(raf.current)
    setP(0)
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex h-32 w-32 items-center justify-center rounded-full bg-neon-green/20 text-5xl">
          🍻
        </div>
        <p className="font-signage text-xl text-neon-green text-glow-green">{doneLabel}</p>
      </div>
    )
  }
  return (
    <button
      onPointerDown={down}
      onPointerUp={up}
      onPointerLeave={up}
      onPointerCancel={up}
      className="relative flex h-32 w-32 select-none items-center justify-center rounded-full active:scale-[0.98]"
      style={{ touchAction: 'none' }}
      aria-label={label}
    >
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={R} fill="none" stroke="var(--color-line)" strokeWidth="8" />
        <circle
          cx="60"
          cy="60"
          r={R}
          fill="none"
          stroke="var(--color-amber)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - p)}
        />
      </svg>
      <span className="px-3 text-center font-signage text-sm leading-tight text-amber">{label}</span>
    </button>
  )
}
