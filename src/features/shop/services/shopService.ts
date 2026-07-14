import type { CurrencyBalance } from '../../../models';
import type {
  OwnedShopItem,
  ShopItem,
  ShopPurchaseRecord,
  ShopEconomyPurchaseResult,
} from '../models/shopTypes';
import { getShopItem, SHOP_CATALOG } from '../data/shopCatalog';
import { canAfford, applyTransaction, type SpendableCurrency } from '../../../services/currencyService';
import { generateId } from '../../../utils/gameUtils';

export interface ShopEconomyContext {
  balance: CurrencyBalance;
  transactions: import('../../../models').CurrencyTransaction[];
  inventory: OwnedShopItem[];
  playerLevel: number;
  butterfliesDiscovered: number;
}

function spendCurrency(
  balance: CurrencyBalance,
  transactions: import('../../../models').CurrencyTransaction[],
  currency: SpendableCurrency,
  amount: number,
  reason: string,
) {
  return applyTransaction(balance, transactions, currency, amount, 'spend', reason);
}

export function ownsItem(inventory: OwnedShopItem[], itemId: string): boolean {
  return inventory.some((o) => o.itemId === itemId);
}

export function isItemUnlocked(item: ShopItem, ctx: Pick<ShopEconomyContext, 'playerLevel' | 'butterfliesDiscovered'>): boolean {
  if (!item.unlockCondition) return true;
  const c = item.unlockCondition;
  if (c.type === 'level') return ctx.playerLevel >= (c.value as number);
  if (c.type === 'butterflies') return ctx.butterfliesDiscovered >= (c.value as number);
  return true;
}

export function getBalanceForCurrency(balance: CurrencyBalance, currency: 'gold' | 'diamonds'): number {
  return currency === 'gold' ? balance.gold : balance.diamonds;
}

export function purchaseShopItem(itemId: string, ctx: ShopEconomyContext): ShopEconomyPurchaseResult {
  const item = getShopItem(itemId);
  if (!item) return { success: false, reason: 'not_found', message: 'Momo could not find that item.' };

  if (!isItemUnlocked(item, ctx)) {
    return {
      success: false,
      reason: 'locked',
      message: item.unlockCondition?.label ?? 'This item is not available yet.',
    };
  }

  if (!item.stackable && ownsItem(ctx.inventory, itemId)) {
    return { success: false, reason: 'already_owned', message: 'You already own this little treasure.' };
  }

  const currency = item.currencyType as SpendableCurrency;
  const prev = getBalanceForCurrency(ctx.balance, item.currencyType);
  if (!canAfford(ctx.balance, currency, item.price)) {
    return {
      success: false,
      reason: 'insufficient_funds',
      missing: item.price - prev,
      currency: item.currencyType,
      message:
        item.currencyType === 'gold'
          ? `You need ${item.price - prev} more Gold Coins.`
          : `You need ${item.price - prev} more Diamonds.`,
    };
  }

  const spent = spendCurrency(ctx.balance, ctx.transactions, currency, item.price, `Shop: ${item.name}`);
  if (!spent.success) {
    return { success: false, reason: 'insufficient_funds', message: 'Not enough currency for this purchase.' };
  }

  const existing = ctx.inventory.find((o) => o.itemId === itemId);
  const inventory: OwnedShopItem[] = existing
    ? ctx.inventory.map((o) =>
        o.itemId === itemId ? { ...o, quantity: o.quantity + 1 } : o,
      )
    : [
        ...ctx.inventory,
        { itemId, purchasedAt: new Date().toISOString(), source: 'shop', quantity: 1 },
      ];

  const record: ShopPurchaseRecord = {
    id: generateId('shop-tx'),
    itemId: item.id,
    itemName: item.name,
    currency: item.currencyType,
    amount: item.price,
    previousBalance: prev,
    resultingBalance: getBalanceForCurrency(spent.balance, item.currencyType),
    timestamp: new Date().toISOString(),
    success: true,
  };

  return {
    success: true,
    balance: spent.balance,
    transactions: spent.transactions,
    inventory,
    record,
    item,
  };
}

export function filterCatalog(
  items: ShopItem[],
  opts: {
    query?: string;
    currency?: 'gold' | 'diamonds' | 'all';
    owned?: 'owned' | 'not_owned' | 'all';
    rarity?: string;
    affordable?: boolean;
    balance: CurrencyBalance;
    ownedIds: Set<string>;
  },
): ShopItem[] {
  let list = [...items];
  const q = opts.query?.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.description.toLowerCase().includes(q) ||
        i.tags.some((t) => t.includes(q)),
    );
  }
  if (opts.currency && opts.currency !== 'all') {
    list = list.filter((i) => i.currencyType === opts.currency);
  }
  if (opts.owned === 'owned') list = list.filter((i) => opts.ownedIds.has(i.id));
  if (opts.owned === 'not_owned') list = list.filter((i) => !opts.ownedIds.has(i.id));
  if (opts.rarity && opts.rarity !== 'all') {
    list = list.filter((i) => i.rarity === opts.rarity);
  }
  if (opts.affordable) {
    list = list.filter((i) => canAfford(opts.balance, i.currencyType, i.price));
  }
  return list;
}

export function sortCatalog(items: ShopItem[], sort: string, ownedIds: Set<string>): ShopItem[] {
  const copy = [...items];
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'rarity':
      return copy.sort((a, b) => a.rarity.localeCompare(b.rarity));
    case 'owned-first':
      return copy.sort((a, b) => Number(ownedIds.has(b.id)) - Number(ownedIds.has(a.id)));
    default:
      return copy;
  }
}

export function getMomoRecommendations(
  balance: CurrencyBalance,
  inventory: OwnedShopItem[],
  ownedIds: Set<string>,
): ShopItem[] {
  const picks: ShopItem[] = [];
  const hasHat = inventory.some((o) => getShopItem(o.itemId)?.itemType === 'hat');
  const hasBike = inventory.some((o) => getShopItem(o.itemId)?.itemType === 'bicycle');
  if (!hasHat) {
    const hat = SHOP_CATALOG.find((i) => i.itemType === 'hat' && !ownedIds.has(i.id) && canAfford(balance, 'gold', i.price));
    if (hat) picks.push(hat);
  }
  if (!hasBike) {
    const bike = SHOP_CATALOG.find((i) => i.id === 'daisy-bicycle' && !ownedIds.has(i.id));
    if (bike) picks.push(bike);
  }
  const affordable = SHOP_CATALOG.filter(
    (i) => !ownedIds.has(i.id) && canAfford(balance, i.currencyType, i.price) && i.category === 'home',
  );
  if (affordable[0]) picks.push(affordable[0]);
  return picks.slice(0, 3);
}

export function getOwnedIds(inventory: OwnedShopItem[]): Set<string> {
  return new Set(inventory.map((o) => o.itemId));
}

export { getCatalogByCategory, getFeaturedItems, getShopItem, SHOP_CATALOG } from '../data/shopCatalog';

export type {
  ShopCategory,
  ShopPlayerState,
  EquippedCosmetics,
  EquippedVehicle,
  FurniturePlacement,
  ShopEconomyPurchaseResult,
  ShopEconomyPurchaseSuccess,
} from '../models/shopTypes';
