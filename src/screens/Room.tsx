import { useRoom } from '../hooks/useRoom'
import { Screen } from '../components/ui'
import { EmoteLayer } from '../components/Emote'
import { Lobby } from './Lobby'
import { RoundIntro, Countdown, PlayScreen, Waiting } from './Round'
import { RoundResults, Leaderboard, EndAwards } from './Results'

function Connecting({ code }: { code: string }) {
  return (
    <Screen center className="px-7 text-center">
      <div className="text-4xl">🍺</div>
      <p className="mt-4 font-signage text-xl text-amber">Connecting…</p>
      <p className="mt-1 font-display text-sm tracking-[0.3em] text-ink-low">{code}</p>
    </Screen>
  )
}

export function Room({
  code,
  asHost,
  onLeave,
}: {
  code: string
  asHost: boolean
  onLeave: () => void
}) {
  const s = useRoom(code, asHost)

  let content
  switch (s.view) {
    case 'lobby':
      content = <Lobby />
      break
    case 'roundIntro':
      content = <RoundIntro />
      break
    case 'countdown':
      content = <Countdown />
      break
    case 'playing':
      content = <PlayScreen />
      break
    case 'waiting':
      content = <Waiting />
      break
    case 'roundResults':
      content = <RoundResults />
      break
    case 'leaderboard':
      content = <Leaderboard onLeave={onLeave} />
      break
    case 'ended':
      content = <EndAwards onLeave={onLeave} />
      break
    default:
      content = <Connecting code={code} />
  }

  return (
    <>
      {content}
      <EmoteLayer />
      {s.status === 'reconnecting' && (
        <div className="fixed inset-x-0 top-0 z-50 bg-neon-pink/90 py-1 text-center text-xs font-semibold text-pit">
          Reconnecting…
        </div>
      )}
    </>
  )
}
