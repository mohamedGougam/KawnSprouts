import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../app/store/gameStore';
import { createDefaultState } from '../data/initialData';
import { LocalStorageGameStateRepository } from '../repositories/GameStateRepository';
import { STORAGE_KEY } from '../config/gameConfig';
import {
  purchaseShopItem,
  ownsItem,
  isItemUnlocked,
  getOwnedIds,
} from '../features/shop/services/shopService';
import {
  equipHat,
  previewHat,
  clearHatPreview,
  equipAndMountVehicle,
  mountVehicle,
  dismountVehicle,
  getVehicleSpeedMultiplier,
} from '../features/shop/services/cosmeticService';
import { addFurniturePlacement, validatePlacement } from '../features/shop/services/furnitureService';
import { getFeaturedItems } from '../features/shop/data/shopCatalog';
import { BIKE_SPEED_PX, WALK_SPEED_PX } from '../config/worldConstants';
import { applyTransaction } from '../services/currencyService';

function resetStore() {
  const fresh = createDefaultState();
  useGameStore.setState({ ...fresh, hydrated: true });
}

describe('Sprout & Sparkle shop', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  it('loads catalogue items by category', () => {
    const owned = getOwnedIds([]);
    expect(owned.size).toBe(0);
    const result = purchaseShopItem('little-straw-hat', {
      balance: { gardenCoins: 0, heartSeeds: 0, diamonds: 0, gold: 500 },
      transactions: [],
      inventory: [],
      playerLevel: 4,
      butterfliesDiscovered: 0,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.item.name).toBe('Little Straw Hat');
    }
  });

  it('gold purchase deducts correct amount', () => {
    const ctx = {
      balance: { gardenCoins: 0, heartSeeds: 0, diamonds: 5, gold: 200 },
      transactions: [],
      inventory: [],
      playerLevel: 4,
      butterfliesDiscovered: 0,
    };
    const result = purchaseShopItem('little-straw-hat', ctx);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.balance.gold).toBe(120);
      expect(result.balance.diamonds).toBe(5);
    }
  });

  it('diamond purchase deducts correct amount', () => {
    const ctx = {
      balance: { gardenCoins: 0, heartSeeds: 0, diamonds: 10, gold: 0 },
      transactions: [],
      inventory: [],
      playerLevel: 4,
      butterfliesDiscovered: 0,
    };
    const result = purchaseShopItem('butterfly-hat', ctx);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.balance.diamonds).toBe(4);
    }
  });

  it('fails with insufficient funds', () => {
    const result = purchaseShopItem('daisy-bicycle', {
      balance: { gardenCoins: 0, heartSeeds: 0, diamonds: 0, gold: 100 },
      transactions: [],
      inventory: [],
      playerLevel: 4,
      butterfliesDiscovered: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.reason).toBe('insufficient_funds');
    }
  });

  it('prevents duplicate non-stackable purchase', () => {
    const inventory = [{ itemId: 'little-straw-hat', purchasedAt: '', source: 'shop' as const, quantity: 1 }];
    const result = purchaseShopItem('little-straw-hat', {
      balance: { gardenCoins: 0, heartSeeds: 0, diamonds: 0, gold: 500 },
      transactions: [],
      inventory,
      playerLevel: 4,
      butterfliesDiscovered: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.reason).toBe('already_owned');
  });

  it('currency cannot become negative via applyTransaction', () => {
    const balance = { gardenCoins: 0, heartSeeds: 0, diamonds: 0, gold: 10 };
    const spent = applyTransaction(balance, [], 'gold', 50, 'spend', 'test');
    expect(spent.success).toBe(false);
  });

  it('hat preview does not change permanent equipment', () => {
    const base = { hatId: 'little-straw-hat', previewHatId: null };
    const preview = previewHat(base, 'mushroom-cap');
    expect(preview.hatId).toBe('little-straw-hat');
    expect(preview.previewHatId).toBe('mushroom-cap');
    const cleared = clearHatPreview(preview);
    expect(cleared.previewHatId).toBeNull();
    expect(cleared.hatId).toBe('little-straw-hat');
  });

  it('equipped hat replaces previous hat', () => {
    const a = equipHat({ hatId: null, previewHatId: null }, 'little-straw-hat');
    const b = equipHat(a, 'mushroom-cap');
    expect(b.hatId).toBe('mushroom-cap');
    expect(b.previewHatId).toBeNull();
  });

  it('bicycle mount and dismount', () => {
    let v = mountVehicle({ vehicleId: 'daisy-bicycle', mounted: false });
    expect(v.mounted).toBe(true);
    v = dismountVehicle(v);
    expect(v.mounted).toBe(false);
    expect(v.vehicleId).toBe('daisy-bicycle');
  });

  it('equip and mount starts riding immediately', () => {
    const v = equipAndMountVehicle('daisy-bicycle');
    expect(v.vehicleId).toBe('daisy-bicycle');
    expect(v.mounted).toBe(true);
  });

  it('bicycle speed multiplier is faster than walking', () => {
    expect(getVehicleSpeedMultiplier('daisy-bicycle')).toBeGreaterThan(1);
    expect(WALK_SPEED_PX * getVehicleSpeedMultiplier('daisy-bicycle')).toBeGreaterThan(WALK_SPEED_PX);
    expect(BIKE_SPEED_PX).toBeGreaterThan(WALK_SPEED_PX);
  });

  it('furniture placement validates collisions', () => {
    const placements = addFurniturePlacement([], 'cozy-leaf-bed', 0);
    expect(placements).toHaveLength(1);
    const slot = placements[0];
    expect(validatePlacement(placements, slot.x, slot.z, slot.id)).toBe(true);
    expect(validatePlacement(placements, slot.x, slot.z)).toBe(false);
  });

  it('purchase persists via game store', () => {
    useGameStore.setState({
      currency: { gardenCoins: 0, heartSeeds: 0, diamonds: 0, gold: 500 },
    });
    const r = useGameStore.getState().purchaseShopItem('little-straw-hat');
    expect(r.success).toBe(true);
    useGameStore.getState().persist();
    localStorage.setItem(STORAGE_KEY, localStorage.getItem(STORAGE_KEY)!);
    const loaded = new LocalStorageGameStateRepository().load();
    expect(ownsItem(loaded!.shopInventory, 'little-straw-hat')).toBe(true);
    expect(loaded!.currency.gold).toBe(420);
  });

  it('equipped hat persists after refresh', () => {
    useGameStore.setState({
      currency: { gardenCoins: 0, heartSeeds: 0, diamonds: 0, gold: 500 },
    });
    useGameStore.getState().purchaseShopItem('little-straw-hat');
    useGameStore.getState().equipShopHat('little-straw-hat');
    useGameStore.getState().persist();
    const loaded = new LocalStorageGameStateRepository().load();
    expect(loaded!.equippedCosmetics.hatId).toBe('little-straw-hat');
  });

  it('daily featured rotation is stable for the same day', () => {
    const d = new Date('2026-07-14T12:00:00Z');
    const a = getFeaturedItems(d).map((i) => i.id);
    const b = getFeaturedItems(d).map((i) => i.id);
    expect(a).toEqual(b);
    expect(a.length).toBe(3);
  });

  it('locked items fail purchase', () => {
    const result = purchaseShopItem('golden-acorn', {
      balance: { gardenCoins: 0, heartSeeds: 0, diamonds: 100, gold: 1000 },
      transactions: [],
      inventory: [],
      playerLevel: 1,
      butterfliesDiscovered: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) expect(result.reason).toBe('locked');
  });

  it('unlock check respects player level', () => {
    expect(
      isItemUnlocked(
        {
          id: 'golden-acorn',
          unlockCondition: { type: 'level', value: 3, label: 'Reach Level 3 to unlock.' },
        } as never,
        { playerLevel: 1, butterfliesDiscovered: 0 },
      ),
    ).toBe(false);
  });
});
