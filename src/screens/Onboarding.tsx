import { useState } from 'react'
import { motion } from 'framer-motion'
import { Screen, PrimaryButton, GhostButton, Wordmark } from '../components/ui'
import { EMOJI_CHOICES, loadIdentity, saveIdentity } from '../lib/identity'
import { confirmAge } from '../lib/age'
import { normalizeRoomCode, isValidRoomCode } from '../lib/roomCode'

export function AgeGate({ onConfirm }: { onConfirm: () => void }) {
  return (
    <Screen center className="px-7 text-center">
      <div className="text-5xl">🍺</div>
      <h1 className="mt-4 font-signage text-3xl text-amber text-glow-amber">Hold up</h1>
      <p className="mt-4 max-w-sm text-pretty text-ink-mid">
        TAPROOM is a drinking party game. Are you of legal drinking age where you are?
      </p>
      <p className="mt-3 max-w-sm text-sm text-ink-low">
        Know your limits, line up some water, and never drive after drinking. You can switch to soft
        drinks anytime and still play for points.
      </p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        <PrimaryButton
          onClick={() => {
            confirmAge()
            onConfirm()
          }}
        >
          I am of legal age
        </PrimaryButton>
        <GhostButton onClick={() => (window.location.href = 'https://www.google.com')}>
          Not yet
        </GhostButton>
      </div>
    </Screen>
  )
}

const TEASER_GAMES = ['QUICK DRAW', 'BULLSEYE', 'TAP SPRINT', 'STROOP', 'ECHO']

export function Landing({ onCreate, onJoin }: { onCreate: () => void; onJoin: () => void }) {
  return (
    <Screen className="items-center">
      <p className="mt-2 font-display text-[10px] tracking-[0.3em] text-amber/80">INSERT COIN</p>
      <section className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="text-5xl">🍺</div>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-4"
        >
          <Wordmark />
        </motion.div>
        <p className="mt-4 max-w-xs text-pretty text-ink-mid">
          The skill game you play together. Lose a round, drink the sips. Stay soberest, win the
          night.
        </p>
        <div className="mt-9 flex w-full max-w-xs flex-col gap-3">
          <PrimaryButton onClick={onCreate}>Create a room</PrimaryButton>
          <GhostButton onClick={onJoin}>Join a room</GhostButton>
        </div>
        <ul className="mt-9 flex max-w-xs flex-wrap items-center justify-center gap-2 text-[10px] font-semibold uppercase tracking-wide text-ink-low">
          {TEASER_GAMES.map((g) => (
            <li key={g} className="rounded-full border border-line/60 px-2.5 py-1">
              {g}
            </li>
          ))}
        </ul>
      </section>
      <footer className="px-8 text-center text-xs text-ink-low">
        21+ only. Know your limits, pace yourself, never drive after drinking.
      </footer>
    </Screen>
  )
}

export function JoinScreen({
  onJoin,
  onBack,
}: {
  onJoin: (code: string) => void
  onBack: () => void
}) {
  const [code, setCode] = useState('')
  const valid = isValidRoomCode(code)
  return (
    <Screen center className="px-7 text-center">
      <h1 className="font-signage text-3xl text-amber text-glow-amber">Join a room</h1>
      <p className="mt-3 text-ink-mid">Enter the 4-letter code from your host.</p>
      <input
        value={code}
        onChange={(e) => setCode(normalizeRoomCode(e.target.value))}
        inputMode="text"
        autoCapitalize="characters"
        autoCorrect="off"
        spellCheck={false}
        placeholder="ABCD"
        className="mt-7 w-full max-w-xs rounded-2xl border border-line bg-panel px-6 py-5 text-center font-display text-3xl uppercase tracking-[0.3em] text-amber placeholder:text-ink-low/40 focus:border-amber focus:outline-none"
      />
      <div className="mt-7 flex w-full max-w-xs flex-col gap-3">
        <PrimaryButton disabled={!valid} onClick={() => valid && onJoin(code)}>
          Join
        </PrimaryButton>
        <GhostButton onClick={onBack}>Back</GhostButton>
      </div>
    </Screen>
  )
}

export function NamePicker({ onDone }: { onDone: () => void }) {
  const existing = loadIdentity()
  const [name, setName] = useState(existing.name)
  const [emoji, setEmoji] = useState(existing.emoji)
  const valid = name.trim().length > 0
  return (
    <Screen className="px-7">
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="text-center font-signage text-3xl text-amber text-glow-amber">Who are you?</h1>
        <div className="mx-auto mt-7 w-full max-w-xs">
          <div className="flex items-center gap-3 rounded-2xl border border-line bg-panel px-4 py-3">
            <span className="text-3xl" aria-hidden>
              {emoji}
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 14))}
              placeholder="Your name"
              className="min-w-0 flex-1 bg-transparent text-lg text-ink placeholder:text-ink-low focus:outline-none"
            />
          </div>
          <div className="mt-4 grid grid-cols-6 gap-2">
            {EMOJI_CHOICES.map((e) => (
              <button
                key={e}
                onClick={() => setEmoji(e)}
                className={`aspect-square rounded-xl text-2xl transition ${
                  emoji === e ? 'bg-amber/20 ring-2 ring-amber' : 'bg-panel/60'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-xs pb-2">
        <PrimaryButton
          disabled={!valid}
          onClick={() => {
            saveIdentity({ name: name.trim(), emoji })
            onDone()
          }}
        >
          Let’s go
        </PrimaryButton>
      </div>
    </Screen>
  )
}
