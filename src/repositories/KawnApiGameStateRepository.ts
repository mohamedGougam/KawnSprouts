import type { PersistedGameState } from '../models';
import type { GameStateRepository } from './GameStateRepository';
import { LocalStorageGameStateRepository } from './GameStateRepository';

// Fallback to localStorage so the game always works offline
const _local = new LocalStorageGameStateRepository();

/**
 * Production GameStateRepository that syncs state to the Kawn backend.
 *
 * Strategy:
 *   load()  → try GET /sprouts/state/, fall back to localStorage if offline
 *   save()  → write to localStorage immediately (zero latency), then push to
 *             API in the background so a network failure never loses data
 *   clear() → clears localStorage; optionally call DELETE /sprouts/state/
 *             separately if you need a full server-side wipe
 */
export class KawnApiGameStateRepository implements GameStateRepository {
  private readonly baseUrl: string;
  private readonly token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // strip trailing slash
    this.token = token;
  }

  private get _headers(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
    };
  }

  async load(): Promise<PersistedGameState | null> {
    try {
      const res = await fetch(`${this.baseUrl}/sprouts/state/`, {
        headers: this._headers,
        signal: AbortSignal.timeout(3_500), // 3.5s timeout for fast fallback
      });

      if (res.status === 204) {
        // No saved state on server yet — fresh player. Fall back to
        // localStorage in case they have local data from before the integration.
        return _local.load();
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as { state: PersistedGameState };
      return data.state;
    } catch (err) {
      console.warn('[Sprouts] API load failed — using localStorage fallback:', err);
      return _local.load();
    }
  }

  save(state: PersistedGameState): void {
    // Write to localStorage synchronously (instant, never fails)
    _local.save(state);

    // Push to backend in the background — best-effort
    fetch(`${this.baseUrl}/sprouts/state/`, {
      method: 'PUT',
      headers: this._headers,
      body: JSON.stringify({ state, version: state.version }),
      signal: AbortSignal.timeout(10_000),
    }).catch((err) => {
      console.warn('[Sprouts] API save failed (data is safe in localStorage):', err);
    });
  }

  clear(): void {
    _local.clear();
  }
}
