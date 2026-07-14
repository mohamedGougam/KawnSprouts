# Kawn Sprouts

**Grow happiness together.**

Kawn Sprouts is a heartwarming social mini-game prototype in which every player cares for a tiny creature called a **Kawniee**. Built as a fully isolated, client-side React application with local persistence — ready for future integration with the Kawn platform.

## Product overview

- Care for your Kawniee through gentle daily activities
- Decorate your garden, collect flowers and butterflies
- Visit friends, send hearts and gifts
- Complete daily missions and grow through five stages
- Safe, cozy experience suitable for children and adults

## Key features

- **Onboarding** — 6-step welcome flow with Kawniee customization
- **Animated garden** — Day/evening/night themes based on device time
- **Kawniee character** — SVG character with emotions, blinking, tap reactions
- **Activities** — Water, feed birds, quiet time, garden song
- **Decorations** — Grid-based placement with persistence
- **Collections** — Flowers and butterflies with rarity filtering
- **Friends** — Mock friends with visitable gardens and daily limits
- **Missions & streaks** — Deterministic daily missions, warm welcome streak restore
- **Privacy** — Age visibility controls, minor-safe defaults
- **Sprout Hollow village** — Explore a cozy 2.5D world with other Kawniees, chat, boat travel, secrets
- **Cottage interior** — Tap your house for a cozy room (bed, round table, chair)
- **Treasures & shop** — Collect 💎 diamonds and 🪙 gold; at 10 diamonds unlock the cottage shop for rugs, curtains, toys, and more (all persisted)

## Technology stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Framer Motion
- React Router 7
- Zustand
- Lucide React
- Vitest + React Testing Library
- ESLint + Prettier

## Project architecture

```
src/
  app/           Router, Zustand store
  components/    UI components (character, garden, layout, etc.)
  config/        Game constants and thresholds
  data/          Initial/mock data
  features/      Onboarding, Kawn integration
  models/        TypeScript domain models
  pages/         Route-level screens
  repositories/  LocalStorage persistence abstraction
  services/      Business logic (garden, currency, missions, streak)
  styles/        Global CSS and Tailwind
  tests/         Automated tests
  utils/         Shared helpers
```

## Installation

```bash
cd "C:\Kawn Sprouts"
npm install
```

## Development

```bash
npm run dev
```

**Quick launch (PowerShell)** — kills ports 5173/4173 if in use, then starts the game:

```powershell
cd "C:\Kawn Sprouts"; npm run launch
```

One-liner from anywhere:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -Command "5173,4173|%{Get-NetTCPConnection -LocalPort $_ -State Listen -EA 0|%{Stop-Process -Id $_.OwningProcess -Force -EA 0}}; Set-Location 'C:\Kawn Sprouts'; npm run dev"
```

## Test

```bash
npm test
```

## Production build

```bash
npm run build
```

## Preview production build

```bash
npm run preview
```

## Lint & format

```bash
npm run lint
npm run format
```

## Persistence design

- All game state stored under `kawn-sprouts-game-state` in localStorage
- `GameStateRepository` / `LocalStorageGameStateRepository` abstraction
- Versioned storage with migration and corrupted-data fallback
- UI components never call localStorage directly

## Glossary

- **Kawn Sprouts** — the product name
- **Sprout Hollow** — the village world where Kawniees live
- **Kawniee** — one creature (e.g. Pip is a Kawniee)
- **Kawniees** — the species; multiple creatures (e.g. Pip and Gigi are Kawniees)

Canonical definition (also in `src/config/terminology.ts`):

> Kawniees are tiny, kind-hearted creatures who live in Sprout Hollow. Every Kawniee has a unique personality and grows through care, friendship, curiosity, and joyful adventures.

Growth stage labels such as “Little Sprout” refer to the garden growth metaphor, not the species name.

## Privacy behavior

- Age stored as whole number only (no date of birth)
- Age shown only when player enables visibility **and** viewer is an approved friend
- Friend cards hide age by default when privacy disabled
- Minor profiles use safer defaults; no location, contact, or DM exposure

## Accessibility

- Semantic HTML, ARIA labels, keyboard focus rings
- Reduced motion setting disables large animations
- Text size adjustment (small/medium/large)
- Screen reader labels on navigation and interactive elements

## Kawn integration adapter

**Full mobile handoff guide:** [docs/KAWN_INTEGRATION.md](docs/KAWN_INTEGRATION.md) — identity mapping, WebView embed, state sync API, activity bridge, and testing checklist.

Event types in `src/config/gameConfig.ts` (`KAWN_EVENT_MAPPINGS`):

- `POST_CREATED`, `COMMENT_CREATED`, `POSITIVE_COMMENT_RECEIVED`, etc.

Development simulator: add `?dev` to the URL and navigate to `/dev/simulator`

## Prototype reset

Profile → Settings → **Reset prototype data** (with confirmation). Clears only Kawn Sprouts storage key.

## Known limitations

- No backend; friends and gifts are simulated locally
- Butterfly spawn uses manual trigger (hidden accessibility button + store spawn)
- Audio tones not implemented (visual-only garden song)
- No real browser push notifications

## Recommended future backend

- REST/GraphQL API for player state sync
- Real-time friend visits via WebSocket
- Server-validated currency and gift transactions
- Auth integration with main Kawn platform

## Recommended next phases

1. Connect Kawn activity webhook → integration adapter
2. Real multiplayer friend gardens
3. Server-side mission and streak validation
4. Asset pipeline for richer SVG illustrations
5. Optional ambient audio with user consent

---

Made with kindness for the Kawn ecosystem.
