import { Screen, PrimaryButton, Wordmark, PlayerChip } from '../components/ui'
import { ShareSheet } from '../components/ShareSheet'
import { useRoomStore } from '../store/useRoomStore'
import { getController } from '../hooks/useRoom'
import { PACKS } from '../games/registry'

export function Lobby() {
  const snapshot = useRoomStore((s) => s.snapshot)
  const isHost = useRoomStore((s) => s.isHost)
  const selfId = useRoomStore((s) => s.selfId)
  const roomCode = useRoomStore((s) => s.roomCode)
  const players = snapshot.players
  const me = players.find((p) => p.id === selfId)
  const settings = snapshot.settings
  const sameSet = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x))
  const activePack = PACKS.find((p) => sameSet(p.ids, settings.enabledGameIds))?.key ?? 'custom'

  return (
    <Screen className="px-6">
      <header className="flex items-center justify-between py-2">
        <Wordmark small />
        <span className="text-xs text-ink-low">{players.length} in</span>
      </header>

      <div className="mt-2">
        <ShareSheet code={roomCode} />
      </div>

      <div className="mt-6 flex-1 overflow-auto">
        <p className="mb-2 text-xs uppercase tracking-wide text-ink-low">Players</p>
        <div className="space-y-2">
          {players.map((p) => (
            <PlayerChip
              key={p.id}
              name={p.name + (p.id === selfId ? ' (you)' : '')}
              emoji={p.emoji}
              isHost={p.isHost}
              soft={p.soft}
            />
          ))}
          {players.length === 0 && <p className="text-sm text-ink-low">Waiting for players…</p>}
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {isHost && (
          <div className="space-y-3 rounded-2xl border border-line/60 bg-panel/40 p-3">
            <div>
              <p className="mb-1.5 text-[11px] uppercase tracking-wide text-ink-low">Game pack</p>
              <div className="grid grid-cols-3 gap-2">
                {PACKS.map((p) => (
                  <button
                    key={p.key}
                    onClick={() => getController()?.setSettings({ enabledGameIds: p.ids })}
                    className={`rounded-xl px-2 py-2 text-sm font-semibold transition ${
                      activePack === p.key
                        ? 'bg-amber text-pit'
                        : 'border border-line/60 bg-panel text-ink-mid'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-[11px] uppercase tracking-wide text-ink-low">Max sips / round</p>
              <div className="flex gap-1.5">
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    onClick={() => getController()?.setSettings({ maxSipsPerRound: n })}
                    className={`h-9 w-9 rounded-lg text-sm font-bold transition ${
                      settings.maxSipsPerRound === n
                        ? 'bg-amber text-pit'
                        : 'border border-line/60 bg-panel text-ink-mid'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        <button
          onClick={() => getController()?.setSoft(!(me?.soft ?? false))}
          className="flex w-full items-center justify-between rounded-xl border border-line bg-panel/60 px-4 py-3 text-left"
        >
          <span className="text-sm text-ink-mid">I’m on soft drinks (still play for points)</span>
          <span
            className={`ml-3 h-6 w-11 shrink-0 rounded-full p-0.5 transition-colors ${
              me?.soft ? 'bg-neon-cyan' : 'bg-line'
            }`}
          >
            <span
              className={`block h-5 w-5 rounded-full bg-pit transition-transform ${
                me?.soft ? 'translate-x-5' : ''
              }`}
            />
          </span>
        </button>

        {isHost ? (
          <PrimaryButton onClick={() => getController()?.startSession()}>
            {players.length < 2 ? 'Start (solo warm-up)' : 'Start the night'}
          </PrimaryButton>
        ) : (
          <p className="py-2 text-center text-sm text-ink-low">Waiting for the host to start…</p>
        )}
      </div>
    </Screen>
  )
}
