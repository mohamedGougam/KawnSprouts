# Kawn Sprouts — Mobile Integration Guide

Step-by-step guide for embedding Sprout Hollow into the Kawn social app. This prototype is **client-first** (localStorage today); production should sync the same state shape via your Kawn backend.

---

## Overview

| Layer | Role |
|-------|------|
| **Kawn app** | Auth, user profile, friends graph, WebView shell |
| **Sprouts game** | Village, cottage, treasures, shop — this repo |
| **Bridge** | Pass user identity in, push activity events in, read game state out |

**Goal:** Every Kawn user who opens Sprouts becomes a **player** with a persistent Sprout, village position, cottage inventory, and currency.

---

## Phase 1 — Identity (Kawn user → game player)

### Step 1.1: Map Kawn account to `player.id`

When loading the WebView, inject the logged-in Kawn user:

```typescript
// Kawn native → WebView postMessage or URL query
{
  kawnUserId: "usr_abc123",      // becomes player.id
  displayName: "Maya",
  age: 12,                        // from Kawn profile (with consent)
  avatarUrl: "https://...",       // optional; map to PlayerAvatar enum
  friends: [                      // Kawn friend list
    { id: "usr_xyz", name: "Lina", ... }
  ]
}
```

### Step 1.2: Hydrate player on launch

Replace the default `player-1` id with `kawnUserId` during `hydrate()`:

```typescript
// src/features/integration/kawnPlayerBridge.ts (to add in Kawn app)
export function applyKawnIdentity(state: PersistedGameState, kawn: KawnUserPayload): PersistedGameState {
  return {
    ...state,
    player: {
      ...state.player,
      id: kawn.kawnUserId,
      name: kawn.displayName,
      age: kawn.age,
    },
    friends: mapKawnFriendsToGameFriends(kawn.friends),
  };
}
```

### Step 1.3: One player per Kawn account

- Storage key today: `kawn-sprouts-game-state` (single device).
- Production: `kawn-sprouts-{kawnUserId}` or server-side document keyed by `kawnUserId`.

---

## Phase 2 — Embed the game (WebView)

### Step 2.1: Host the build

```bash
cd "C:\Kawn Sprouts"
npm run build
# Deploy dist/ to CDN or in-app asset bundle
```

### Step 2.2: Open in WebView

```
https://your-cdn/kawn-sprouts/index.html?kawnUserId=usr_abc123&token=...
```

Or load bundled `index.html` with query params from the native shell.

### Step 2.3: Safe area & bottom nav

The village UI reserves space for Kawn’s tab bar (`bottom-[calc(5rem+safe-area)]` on sheets). Match your native bottom inset or pass `--kawn-nav-height` CSS variable if you customize the shell.

---

## Phase 3 — State sync (persistence)

### What must persist (already in `PersistedGameState`)

| Field | Purpose |
|-------|---------|
| `player`, `sprout` | Identity & character |
| `currency` | `gardenCoins`, `heartSeeds`, **`diamonds`**, **`gold`** |
| `houseProgress.ownedItemIds` | Cottage shop purchases |
| `treasureCollection` | Daily collectible progress |
| `villagePosition` | Last map position |
| `garden`, `decorations`, `missions`, `streak`, … | Existing garden/social loop |

### Step 3.1: Replace localStorage with Kawn API

Implement `GameStateRepository` against your backend:

```typescript
// Pseudocode — Kawn backend
GET  /v1/users/{kawnUserId}/sprouts-state   → PersistedGameState
PUT  /v1/users/{kawnUserId}/sprouts-state   ← PersistedGameState
```

Call `persist()` debounced (e.g. 2s after changes) from the WebView; native can also pull state on `visibilitychange`.

### Step 3.2: Version migrations

`STORAGE_VERSION` is `6`. Server should store `version` and run the same migrations as `GameStateRepository.migrate()` when loading older saves.

---

## Phase 4 — Activity bridge (Kawn → Sprout rewards)

Kawn social actions should nudge the Sprout. The prototype already maps events in `src/config/gameConfig.ts` (`KAWN_EVENT_MAPPINGS`) and `simulateKawnEvent()` in `src/features/integration/kawnIntegration.ts`.

### Step 4.1: Wire real Kawn events

| Kawn app event | Sprouts handler |
|----------------|-----------------|
| User posts a story | `simulateKawnActivity('sharedStory')` |
| User receives a like | `simulateKawnActivity('receivedLike')` |
| User comments on friend | `simulateKawnActivity('leftComment')` |
| User completes daily check-in | `simulateKawnActivity('dailyCheckIn')` |

Native → WebView:

```javascript
webView.postMessage(JSON.stringify({
  type: 'KAWN_ACTIVITY',
  event: 'receivedLike',
}));
```

WebView listener:

```typescript
window.addEventListener('message', (e) => {
  const data = JSON.parse(e.data);
  if (data.type === 'KAWN_ACTIVITY') {
    useGameStore.getState().simulateKawnActivity(data.event);
  }
});
```

### Step 4.2: Optional — reward diamonds/gold from Kawn

Extend mappings later, e.g. weekly streak in Kawn grants `+2 diamonds` via `applyTransaction(..., 'diamonds', 2, 'earn', 'Kawn weekly streak')`.

---

## Phase 5 — Village & cottage features (new)

### Player flow

1. Explore village → tap **💎 / 🪙** collectibles (respawn daily).
2. Header shows diamond & gold counts.
3. Tap **any cottage** → player **walks to the door** (pathfinding), then a **cinematic entry** (zoom, warm glow, door opens, camera passes through — no bottom sheet).
4. Inside: **dollhouse-style room** (~38° perspective), walk around, tap objects (window, chair, fireplace, bed, etc.), NPCs animate, random cozy events.
5. Tap **door** inside to exit smoothly back to the exact village spot.
6. At **10 diamonds** in your cottage → **shop nook** for rugs, curtains, toys, etc.

### Files to know

| File | Role |
|------|------|
| `src/config/treasureConfig.ts` | Spawn positions, `SHOP_UNLOCK_DIAMONDS` |
| `src/config/houseConfig.ts` | Shop catalogue |
| `src/services/treasureService.ts` | Collect + daily reset |
| `src/services/houseService.ts` | Purchase logic |
| `src/components/village/house/HouseExperienceLayer.tsx` | Cinematic entry/exit orchestration |
| `src/components/village/house/HouseInteriorScene.tsx` | Dollhouse interior + movement |
| `src/config/houseInteriorConfig.ts` | Per-resident personality, room layout (multi-room ready) |
| `src/services/houseAudioService.ts` | Indoor ambience & object sounds |


### Friend cottages

Friends’ houses open a **view-only** interior (base furniture). Their `houseProgress` should come from friend profiles once synced server-side.

---

## Phase 6 — Testing checklist for mobile dev

- [ ] Log in as Kawn user A → player name/id match Kawn profile
- [ ] Kill app, reopen → sprout, currency, cottage items restored from server
- [ ] Collect diamond on device A → appears in saved state on device B after sync
- [ ] 10 diamonds → shop button appears in cottage
- [ ] Purchase rug → visible inside cottage after reload
- [ ] PostMessage `KAWN_ACTIVITY` → sprout stats / notification update
- [ ] WebView safe area: sheets not hidden behind native tab bar
- [ ] Offline: queue `persist()` calls, flush when online

---

## Phase 7 — Suggested rollout

1. **Sprint A** — WebView + identity injection + read-only state from API  
2. **Sprint B** — Write path for `persist()`, migrate localStorage users  
3. **Sprint C** — Kawn activity bridge + push notifications (“Your cottage shop is open!”)  
4. **Sprint D** — Friend cottages & cross-player village (real positions, real shouts)

---

## Dev shortcuts (prototype only)

- `?dev` query — Kawn event simulator (existing)
- `npm run launch` — local village with treasures and shop
- Reset save: Profile → reset prototype, or clear `kawn-sprouts-game-state` in devtools

---

## Contact points in code

```typescript
// Store actions mobile will call
useGameStore.getState().collectTreasure(treasureId);
useGameStore.getState().buyHouseItem(itemId);
useGameStore.getState().simulateKawnActivity(eventType);
useGameStore.getState().persist();

// Repository swap for production
import { LocalStorageGameStateRepository } from './repositories/GameStateRepository';
// → KawnApiGameStateRepository implements same interface
```

For questions about state shape, see `src/models/index.ts` → `PersistedGameState`.
