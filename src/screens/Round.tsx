import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Screen } from '../components/ui'
import { useRoomStore } from '../store/useRoomStore'
import { getController } from '../hooks/useRoom'
import { EmoteBar } from '../components/Emote'
import { TWISTS_BY_ID } from '../games/twists'
import type { MicroGameContext, VoteCandidate } from '../games/types'

function TwistBanner({ twistId }: { twistId: string }) {
  const twist = TWISTS_BY_ID[twistId]
  if (!twist || twist.id === 'none') return null
  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
      className="mt-5 rounded-2xl border-2 border-neon-pink/70 bg-neon-pink/10 px-5 py-3"
    >
      <p className="font-signage text-lg text-neon-pink text-glow-pink">
        {twist.badge ? `${twist.badge} ` : ''}
        {twist.label.toUpperCase()}
      </p>
      <p className="mt-1 text-sm text-ink-mid">{twist.intro}</p>
    </motion.div>
  )
}

export function RoundIntro() {
  const snapshot = useRoomStore((s) => s.snapshot)
  const play = useRoomStore((s) => s.play)
  const game = play?.game
  const { endless, totalRounds } = snapshot.settings
  const isFinal = !endless && snapshot.round >= totalRounds
  const roundLabel = isFinal
    ? 'FINAL ROUND'
    : endless
      ? `ROUND ${snapshot.round}`
      : `ROUND ${snapshot.round} / ${totalRounds}`
  return (
    <Screen center className="px-7 text-center">
      <p
        className={`font-display text-[11px] tracking-[0.3em] ${
          isFinal ? 'text-neon-pink' : 'text-ink-low'
        }`}
      >
        {roundLabel}
      </p>
      <motion.h1
        key={game?.id}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
        className="mt-4 font-signage text-4xl text-amber text-glow-amber"
      >
        {game?.title ?? 'Next game'}
      </motion.h1>
      <p className="mt-4 max-w-xs text-pretty text-ink-mid">{game?.tagline}</p>
      <TwistBanner twistId={snapshot.twistId} />
      <p className="mt-8 font-display text-[10px] tracking-[0.3em] text-amber/70">GET READY</p>
    </Screen>
  )
}

export function Countdown() {
  const countMs = useRoomStore((s) => s.countMs)
  const [n, setN] = useState(Math.max(1, Math.round(countMs / 1000)))
  useEffect(() => {
    setN(Math.max(1, Math.round(countMs / 1000)))
    const id = setInterval(() => setN((v) => (v > 1 ? v - 1 : v)), 1000)
    return () => clearInterval(id)
  }, [countMs])
  return (
    <Screen center>
      <motion.p
        key={n}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.35 }}
        className="font-signage text-[8rem] leading-none text-amber text-glow-amber"
      >
        {n}
      </motion.p>
    </Screen>
  )
}

export function PlayScreen() {
  const play = useRoomStore((s) => s.play)
  const snapshot = useRoomStore((s) => s.snapshot)
  const selfId = useRoomStore((s) => s.selfId)
  if (!play) return null

  const sipVals = snapshot.standings.map((s) => s.cumulativeSips)
  const maxSips = sipVals.length ? Math.max(...sipVals) : 0
  const mine = snapshot.standings.find((s) => s.id === selfId)?.cumulativeSips ?? 0
  const handicap = snapshot.settings.comebackHandicap && maxSips > 0 && mine === maxSips

  const candidates: VoteCandidate[] | undefined =
    play.game.kind === 'vote'
      ? snapshot.players
          .filter((p) => p.id !== selfId)
          .map((p) => ({ id: p.id, name: p.name, emoji: p.emoji }))
      : undefined

  const ctx: MicroGameContext = {
    round: snapshot.round,
    seed: play.seed,
    handicap,
    submit: (r) => getController()?.submitResult(r.score, r.valid),
    candidates,
    submitVote: candidates
      ? (targetId) => {
          const idx = candidates.findIndex((c) => c.id === targetId)
          getController()?.submitResult(idx >= 0 ? idx : 0, idx >= 0, idx >= 0 ? targetId : undefined)
        }
      : undefined,
  }
  const Game = play.game.Play
  return (
    <div className="relative flex min-h-dvh flex-col bg-pub text-ink">
      <Game key={`${snapshot.round}-${play.game.id}`} ctx={ctx} />
    </div>
  )
}

export function Waiting() {
  const reduce = useReducedMotion()
  const submitted = useRoomStore((s) => s.submittedCount)
  const active = useRoomStore((s) => s.activeCount)
  const isHost = useRoomStore((s) => s.isHost)
  return (
    <Screen center className="px-7 text-center">
      <motion.div
        animate={reduce ? {} : { opacity: [0.5, 1, 0.5] }}
        transition={{ repeat: Infinity, duration: 1.4 }}
        className="text-5xl"
      >
        🍺
      </motion.div>
      <h2 className="mt-5 font-signage text-2xl text-amber">Locked in</h2>
      <p className="mt-2 text-ink-mid">Waiting for the others to finish…</p>
      {isHost && active > 0 && (
        <p className="mt-3 font-display text-xs text-ink-low">
          {submitted}/{active} done
        </p>
      )}
      <div className="mt-8">
        <EmoteBar />
      </div>
    </Screen>
  )
}
