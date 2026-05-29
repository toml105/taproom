import type { ReactNode } from 'react'

export function Screen({
  children,
  className = '',
  center = false,
}: {
  children: ReactNode
  className?: string
  center?: boolean
}) {
  return (
    <main
      className={`relative flex min-h-dvh flex-col overflow-hidden bg-pub text-ink ${
        center ? 'items-center justify-center' : ''
      } ${className}`}
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 0.75rem)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 0.75rem)',
      }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(125% 65% at 50% -8%, color-mix(in oklab, var(--color-amber) 18%, transparent), transparent 62%)',
        }}
      />
      <div aria-hidden className="scanlines pointer-events-none absolute inset-0 -z-10 opacity-25" />
      {children}
    </main>
  )
}

interface BtnProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
}

export function PrimaryButton({ children, onClick, disabled, type = 'button' }: BtnProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl bg-amber px-6 py-4 font-signage text-lg text-pit ring-glow-amber transition-transform active:scale-[0.97] disabled:opacity-40 disabled:shadow-none"
    >
      {children}
    </button>
  )
}

export function GhostButton({ children, onClick, disabled, type = 'button' }: BtnProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl border border-line bg-panel/60 px-6 py-4 font-signage text-lg text-ink transition-transform active:scale-[0.97] disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export function Wordmark({ small = false }: { small?: boolean }) {
  return (
    <span
      className={`font-signage text-amber text-glow-amber ${
        small ? 'text-2xl' : 'text-[clamp(2.5rem,12vw,4rem)]'
      }`}
    >
      TAPROOM
    </span>
  )
}

export function PlayerChip({
  name,
  emoji,
  isHost,
  soft,
  sips,
  rank,
  highlight,
}: {
  name: string
  emoji: string
  isHost?: boolean
  soft?: boolean
  sips?: number
  rank?: number
  highlight?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
        highlight ? 'border-amber/70 bg-amber/10' : 'border-line/70 bg-panel/70'
      }`}
    >
      {rank !== undefined && (
        <span className="w-6 text-center font-display text-xs text-ink-low">{rank}</span>
      )}
      <span className="text-2xl" aria-hidden>
        {emoji}
      </span>
      <span className="min-w-0 flex-1 truncate font-semibold text-ink">{name}</span>
      {soft && (
        <span className="rounded-full bg-neon-cyan/15 px-2 py-0.5 text-[10px] font-bold uppercase text-neon-cyan">
          soft
        </span>
      )}
      {isHost && (
        <span className="rounded-full bg-amber/15 px-2 py-0.5 text-[10px] font-bold uppercase text-amber">
          host
        </span>
      )}
      {sips !== undefined && <span className="font-display text-sm text-ink">{sips}</span>}
    </div>
  )
}
