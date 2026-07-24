/**
 * kawnBridge.ts
 *
 * Handles all communication between the KawnSprouts game and the Kawn
 * platform. Three responsibilities:
 *
 *  1. Read launch parameters injected by the Flutter WebView into the URL
 *  2. Fetch the user's full identity (name, age, avatar, friends) from the backend
 *  3. Poll for pending activity reward events (POST_LIKED, DAILY_LOGIN, etc.)
 *
 * See docs/KAWN_INTEGRATION.md for the full integration design.
 */

import type { KawnActivityEventType, PersistedGameState } from '../../models';

// --------------------------------------------------------------------------
// Types
// --------------------------------------------------------------------------

export interface KawnFriend {
  id: string;
  name: string;
  avatarUrl?: string | null;
  level?: number;
  sproutName?: string;
  sproutColor?: import('../../models').SproutColor;
  avatar?: import('../../models').PlayerAvatar;
  houseProgress?: { ownedItemIds: string[] } | null;
}

export interface KawnUserPayload {
  kawnUserId: string;
  displayName: string;
  age?: number | null;
  avatarUrl?: string | null;
  friends: KawnFriend[];
}

export interface KawnLaunchParams {
  kawnUserId: string | null;
  displayName: string | null;
  age: number | null;
  kawnToken: string | null;
  /** Base URL of the Kawn REST API, e.g. "http://20.119.99.223" */
  apiBase: string | null;
}

// --------------------------------------------------------------------------
// 1. Launch params
// --------------------------------------------------------------------------

let _cachedParams: KawnLaunchParams | null = null;

/**
 * Read URL query params injected by the Flutter SproutsScreen.
 * Cached after the first call — the URL never changes during a session.
 */
export function getKawnLaunchParams(): KawnLaunchParams {
  if (_cachedParams) return _cachedParams;
  const p = new URLSearchParams(window.location.search);
  const ageStr = p.get('age');
  const rawApiBase = p.get('apiBase');

  _cachedParams = {
    kawnUserId: p.get('kawnUserId'),
    displayName: p.get('displayName'),
    age: ageStr ? parseInt(ageStr, 10) : null,
    kawnToken: p.get('kawnToken'),
    apiBase: rawApiBase ?? null,
  };
  return _cachedParams;
}

/** Returns true when the game is running inside the Kawn Flutter WebView */
export function isKawnEmbedded(): boolean {
  const { kawnToken, apiBase } = getKawnLaunchParams();
  return Boolean(kawnToken && apiBase);
}

// --------------------------------------------------------------------------
// 2. Identity
// --------------------------------------------------------------------------

/**
 * Fetch the full user identity from GET /sprouts/identity/.
 * Returns null on any error — the caller falls back to URL-param values.
 */
export async function fetchKawnIdentity(
  apiBase: string,
  token: string,
): Promise<KawnUserPayload | null> {
  try {
    const res = await fetch(`${apiBase}/sprouts/identity/`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;
    return (await res.json()) as KawnUserPayload;
  } catch (err) {
    console.warn('[Sprouts] fetchKawnIdentity failed:', err);
    return null;
  }
}

/**
 * Patch a loaded PersistedGameState with the real Kawn user identity.
 * This replaces the placeholder "player-1" id and mock friends list.
 */
export function applyKawnIdentity(
  state: PersistedGameState,
  kawn: KawnUserPayload,
): PersistedGameState {
  return {
    ...state,
    player: {
      ...state.player,
      id: kawn.kawnUserId,
      name: kawn.displayName,
      age: kawn.age ?? state.player.age,
    },
    // Map Kawn friends to the game's Friend shape
    friends: kawn.friends.map((f) => ({
      id: f.id,
      name: f.name,
      age: undefined,
      kawnAge: undefined,
      level: 1,
      avatar: 'pastel-smile' as const,
      sproutName: 'Sprout',
      sproutColor: 'mint' as const,
      gardenTheme: 'day',
      recentActivity: '',
      friendshipStatus: 'approved' as const,
      privacy: {
        showAgeToFriends: false,
        allowVisits: true,
        allowGifts: true,
      },
      lastInteraction: new Date().toISOString(),
    })),
  };
}

// --------------------------------------------------------------------------
// 3. Activity event polling
// --------------------------------------------------------------------------

/**
 * Poll GET /sprouts/activity/pending/ and return any queued event types.
 * Events are consumed (deleted) server-side on retrieval — each is
 * delivered at most once.
 */
export async function pollPendingActivityEvents(
  apiBase: string,
  token: string,
): Promise<KawnActivityEventType[]> {
  try {
    const res = await fetch(`${apiBase}/sprouts/activity/pending/`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(5_000),
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { events: string[] };
    return (data.events ?? []) as KawnActivityEventType[];
  } catch {
    return []; // Silently swallow — polling failures are non-critical
  }
}
