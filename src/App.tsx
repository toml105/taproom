import { motion, useReducedMotion } from 'framer-motion'

const GAMES = ['QUICK DRAW', 'BULLSEYE', 'TAP SPRINT', 'STROOP', 'ECHO']

export default function App() {
  const reduce = useReducedMotion()

  return (
    <main
      className="relative flex min-h-dvh flex-col items-center overflow-hidden bg-pub text-ink"
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 1.25rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 1.25rem)',
      }}
    >
      {/* Atmosphere: a neon amber glow spilling from the top, faint CRT scanlines */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(125% 70% at 50% -5%, color-mix(in oklab, var(--color-amber) 24%, transparent), transparent 60%)',
        }}
      />
      <div aria-hidden className="scanlines pointer-events-none absolute inset-0 -z-10 opacity-40" />

      <p className="mt-2 font-display text-[10px] tracking-[0.3em] text-amber/80">INSERT COIN</p>

      <section className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <Mug />
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 14, filter: 'blur(8px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-5 font-signage text-[clamp(2.5rem,12vw,4rem)] leading-none text-amber text-glow-amber"
        >
          TAPROOM
        </motion.h1>

        <p className="mt-4 max-w-xs text-pretty text-base text-ink-mid">
          The skill game you play together. Lose a round, drink the sips. Stay soberest, win the
          night.
        </p>

        <div className="mt-9 flex w-full max-w-xs flex-col gap-3">
          <button className="rounded-2xl bg-amber px-6 py-4 font-signage text-lg text-pit ring-glow-amber transition-transform active:scale-[0.97]">
            Create a room
          </button>
          <button className="rounded-2xl border border-line bg-panel/60 px-6 py-4 font-signage text-lg text-ink transition-transform active:scale-[0.97]">
            Join a room
          </button>
        </div>

        <ul className="mt-9 flex max-w-xs flex-wrap items-center justify-center gap-x-2 gap-y-2 text-[10px] font-semibold uppercase tracking-wide text-ink-low">
          {GAMES.map((g) => (
            <li key={g} className="rounded-full border border-line/60 px-2.5 py-1">
              {g}
            </li>
          ))}
        </ul>
      </section>

      <footer className="px-8 text-center text-xs leading-relaxed text-ink-low">
        21+ only. Know your limits, pace yourself, never drive after drinking.
      </footer>
    </main>
  )
}

/** Brand glyph: a foamy amber pint, the house sign of TAPROOM. */
function Mug() {
  return (
    <svg width="76" height="76" viewBox="0 0 512 512" role="img" aria-label="Foaming pint">
      <defs>
        <linearGradient id="beer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFC857" />
          <stop offset="100%" stopColor="#DD8A1E" />
        </linearGradient>
      </defs>
      <path
        d="M354 214 q70 4 70 72 q0 68 -70 72"
        fill="none"
        stroke="#B0701C"
        strokeWidth="30"
        strokeLinecap="round"
      />
      <path
        d="M158 160 L354 160 L322 408 Q320 420 308 420 L204 420 Q192 420 190 408 Z"
        fill="url(#beer)"
        stroke="#7A3E0C"
        strokeWidth="8"
        strokeLinejoin="round"
      />
      <rect x="180" y="220" width="14" height="150" rx="7" fill="#FFFFFF" opacity="0.16" />
      <path
        d="M158 160 L354 160 L354 196 Q322 214 286 204 Q256 196 226 206 Q190 216 158 198 Z"
        fill="#F7E6C6"
      />
      <path
        d="M158 160 Q168 128 206 134 Q230 112 258 130 Q286 114 312 134 Q346 128 354 160 Z"
        fill="#F7E6C6"
      />
      <circle cx="206" cy="120" r="14" fill="#F7E6C6" />
      <circle cx="258" cy="104" r="18" fill="#F7E6C6" />
      <circle cx="312" cy="122" r="13" fill="#F7E6C6" />
    </svg>
  )
}
