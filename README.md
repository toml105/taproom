# 🍺 TAPROOM

**The skill-based drinking game you play together.** Open one link on your phone, join a room, and every round the whole group plays the same quick skill micro-game at once. Place well and stay sober; lose and drink the sips. A live "who's stayed soberest" leaderboard runs all night.

No truth-or-dare, no cringe. Just reflexes, precision, memory, and nerve.

**▶ Play: https://toml105.github.io/taproom/**

## How it works

1. One person taps **Create a room** and shares the link (or QR / 4-letter code).
2. Everyone opens it on their phone, picks a name and emoji, and lands in the lobby.
3. The host starts the night. Each round: a 3-2-1 countdown, then everyone plays the **same** micro-game simultaneously.
4. You're ranked by skill. The worse you place, the more **sips** you drink (capped, humane). Top finishers stay sober.
5. Hold to confirm you drank, the group clinks 🍻, the leaderboard updates, and the next game begins.

It installs as a PWA ("Add to Home Screen"), but no install or login is needed. Just open the link.

## The games

| Game | Skill |
| --- | --- |
| **Quick Draw** | Reaction. Tap the instant the screen turns green. |
| **Bullseye** | Precision. Stop the sweeping marker on the target. |
| **Tap Sprint** | Speed. Most taps in 5 seconds. |
| **Stroop** | Focus. Tap the ink colour, not the word. |
| **Echo** | Memory. Repeat the pattern as it grows. |

Each game is a self-contained module (`src/games/`), so adding more is a drop-in.

## Drink responsibly

21+ only. The game shows an age gate, caps sips per round, has an **On soft drinks** mode that still plays for points, a no-shame **skip this drink** option, and periodic hydrate nudges. Know your limits, pace yourself, and never drive after drinking.

## Tech

- **React + TypeScript + Vite**, **Tailwind v4**, **Framer Motion**, **Zustand**.
- **Supabase Realtime** (broadcast + presence, no database tables) as an invisible relay so phones on any network stay in sync.
- **Host-authoritative**: the room creator's browser referees the round loop; if they drop, the next player is auto-promoted.
- **Latency-fair by design**: each player's skill is measured locally and only the score is sent, so nobody's Wi-Fi is a disadvantage.
- Installable **PWA**, deployed to **GitHub Pages** via Actions.

## Develop

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
```

Supabase connection lives in `.env` (a public, client-embeddable publishable key; safe to commit because it only grants ephemeral Realtime channel access). Pushing to `main` auto-deploys to GitHub Pages.

Built with [Claude Code](https://claude.com/claude-code) and the [impeccable](https://github.com/pbakaus/impeccable) design skill.
