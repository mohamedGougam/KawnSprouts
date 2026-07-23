/**
 * useKawnActivityPoll.ts
 *
 * React hook that polls GET /sprouts/activity/pending/ every 30 seconds
 * while the game is mounted and open. Each event batch is fed into the
 * game store's simulateKawnActivity() action, which applies the
 * appropriate sprout-stat boosts and in-game notifications.
 *
 * Only active when running inside the Kawn Flutter WebView (i.e. when
 * kawnToken and apiBase are present in the URL). In dev mode (?dev) or
 * standalone browser sessions, polling is skipped entirely.
 */

import { useEffect, useRef } from 'react';
import { useGameStore } from '../app/store/gameStore';
import {
  getKawnLaunchParams,
  isKawnEmbedded,
  pollPendingActivityEvents,
} from '../features/integration/kawnBridge';
import type { KawnActivityEventType } from '../models';

/** Poll interval in milliseconds (30 seconds) */
const POLL_INTERVAL_MS = 30_000;

export function useKawnActivityPoll(): void {
  const simulateKawnActivity = useGameStore((s) => s.simulateKawnActivity);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Skip polling if not embedded inside the Kawn app
    if (!isKawnEmbedded()) return;

    const { kawnToken, apiBase } = getKawnLaunchParams();
    if (!kawnToken || !apiBase) return;

    async function poll() {
      const events = await pollPendingActivityEvents(apiBase!, kawnToken!);
      for (const eventType of events) {
        try {
          simulateKawnActivity(eventType as KawnActivityEventType);
        } catch (err) {
          console.warn('[Sprouts] Failed to apply activity event:', eventType, err);
        }
      }
    }

    // Poll immediately when the game opens (catches queued events from
    // actions the user did before opening Sprouts), then every 30s
    void poll();
    timerRef.current = setInterval(() => void poll(), POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [simulateKawnActivity]);
}
