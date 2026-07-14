import type { PersistedGameState } from '../models';
import { STORAGE_KEY, STORAGE_VERSION } from '../config/gameConfig';
import { normalizeWorldPosition } from '../config/villageConfig';
import { migrateLegacyChats } from '../services/villageChatService';
import { ensureTreasureDay } from '../services/treasureService';
import { createDefaultState } from '../data/initialData';

export interface GameStateRepository {
  load(): PersistedGameState | null;
  save(state: PersistedGameState): void;
  clear(): void;
}

export class LocalStorageGameStateRepository implements GameStateRepository {
  private key: string;

  constructor(key = STORAGE_KEY) {
    this.key = key;
  }

  load(): PersistedGameState | null {
    try {
      const raw = localStorage.getItem(this.key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as PersistedGameState;
      return this.migrate(parsed);
    } catch {
      return null;
    }
  }

  save(state: PersistedGameState): void {
    try {
      localStorage.setItem(this.key, JSON.stringify({ ...state, version: STORAGE_VERSION }));
    } catch {
      // Storage full or unavailable — fail silently for prototype
    }
  }

  clear(): void {
    localStorage.removeItem(this.key);
  }

  private migrate(state: PersistedGameState): PersistedGameState {
    const defaults = createDefaultState();
    const merged = { ...defaults, ...state, version: STORAGE_VERSION };
    if (!state.lastWateredAt) merged.lastWateredAt = defaults.lastWateredAt;
    if (!state.villagePosition) merged.villagePosition = defaults.villagePosition;
    if (!state.discoveredWorldObjects) merged.discoveredWorldObjects = [];
    if (!state.discoveredSecrets) merged.discoveredSecrets = [];
    if (!state.villageMessages?.length) {
      if (state.villageChats && Object.keys(state.villageChats).length > 0) {
        merged.villageMessages = migrateLegacyChats(state.villageChats);
      } else {
        merged.villageMessages = defaults.villageMessages;
      }
    }
    delete (merged as { villageChats?: unknown }).villageChats;
    merged.villagePosition = normalizeWorldPosition(merged.villagePosition);
    if (merged.currency.diamonds === undefined) merged.currency.diamonds = 0;
    if (merged.currency.gold === undefined) merged.currency.gold = 0;
    if (!merged.houseProgress) merged.houseProgress = defaults.houseProgress;
    if (!merged.treasureCollection) merged.treasureCollection = defaults.treasureCollection;
    if (!merged.shopInventory) merged.shopInventory = defaults.shopInventory;
    if (!merged.equippedCosmetics) merged.equippedCosmetics = defaults.equippedCosmetics;
    if (!merged.equippedVehicle) merged.equippedVehicle = defaults.equippedVehicle;
    if (!merged.furniturePlacements) merged.furniturePlacements = defaults.furniturePlacements;
    if (!merged.shopPurchaseHistory) merged.shopPurchaseHistory = defaults.shopPurchaseHistory;
    if (!merged.shopState) merged.shopState = defaults.shopState;
    // Migrate legacy house shop items into unified inventory
    for (const legacyId of merged.houseProgress.ownedItemIds ?? []) {
      if (!merged.shopInventory.some((o) => o.itemId === legacyId)) {
        merged.shopInventory.push({
          itemId: legacyId,
          purchasedAt: new Date().toISOString(),
          source: 'legacy',
          quantity: 1,
        });
      }
    }
    merged.treasureCollection = ensureTreasureDay(merged.treasureCollection);
    return merged;
  }
}

export function loadStateWithFallback(repo: GameStateRepository): PersistedGameState {
  const loaded = repo.load();
  if (loaded) return loaded;
  return createDefaultState();
}
