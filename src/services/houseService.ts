import type { CurrencyBalance, CurrencyTransaction, HouseProgress } from '../models';
import type { HouseShopItem } from '../config/houseConfig';
import { applyTransaction, canAffordBoth } from './currencyService';

export function ownsHouseItem(progress: HouseProgress, itemId: string): boolean {
  return progress.ownedItemIds.includes(itemId);
}

export function canBuyHouseItem(
  balance: CurrencyBalance,
  progress: HouseProgress,
  item: HouseShopItem,
): boolean {
  if (ownsHouseItem(progress, item.id)) return false;
  return canAffordBoth(balance, item.priceDiamonds, item.priceGold);
}

export function buyHouseItem(
  balance: CurrencyBalance,
  transactions: CurrencyTransaction[],
  progress: HouseProgress,
  item: HouseShopItem,
): {
  balance: CurrencyBalance;
  transactions: CurrencyTransaction[];
  progress: HouseProgress;
  success: boolean;
  message?: string;
} {
  if (ownsHouseItem(progress, item.id)) {
    return { balance, transactions, progress, success: false, message: 'You already own this.' };
  }
  if (!canAffordBoth(balance, item.priceDiamonds, item.priceGold)) {
    return { balance, transactions, progress, success: false, message: 'Not enough diamonds or gold.' };
  }

  let nextBalance = balance;
  let nextTransactions = transactions;

  if (item.priceDiamonds > 0) {
    const d = applyTransaction(nextBalance, nextTransactions, 'diamonds', item.priceDiamonds, 'spend', `House: ${item.name}`);
    if (!d.success) return { balance, transactions, progress, success: false, message: 'Not enough diamonds.' };
    nextBalance = d.balance;
    nextTransactions = d.transactions;
  }
  if (item.priceGold > 0) {
    const g = applyTransaction(nextBalance, nextTransactions, 'gold', item.priceGold, 'spend', `House: ${item.name}`);
    if (!g.success) return { balance, transactions, progress, success: false, message: 'Not enough gold.' };
    nextBalance = g.balance;
    nextTransactions = g.transactions;
  }

  return {
    balance: nextBalance,
    transactions: nextTransactions,
    progress: { ownedItemIds: [...progress.ownedItemIds, item.id] },
    success: true,
  };
}
