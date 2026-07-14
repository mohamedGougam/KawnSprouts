import type { CurrencyBalance, CurrencyTransaction, TreasureCollectionState } from '../models';
import type { WorldTreasure } from '../config/treasureConfig';
import { getTodayDateString } from '../utils/gameUtils';
import { applyTransaction } from './currencyService';

export function ensureTreasureDay(state: TreasureCollectionState): TreasureCollectionState {
  const today = getTodayDateString();
  if (state.resetDate === today) return state;
  return { resetDate: today, collectedToday: [] };
}

export function isTreasureAvailable(treasureId: string, state: TreasureCollectionState): boolean {
  const fresh = ensureTreasureDay(state);
  return !fresh.collectedToday.includes(treasureId);
}

export function collectTreasure(
  treasure: WorldTreasure,
  balance: CurrencyBalance,
  transactions: CurrencyTransaction[],
  collection: TreasureCollectionState,
): {
  balance: CurrencyBalance;
  transactions: CurrencyTransaction[];
  collection: TreasureCollectionState;
  success: boolean;
  message?: string;
} {
  const fresh = ensureTreasureDay(collection);
  if (fresh.collectedToday.includes(treasure.id)) {
    return { balance, transactions, collection: fresh, success: false, message: 'Already collected today.' };
  }

  const currency = treasure.type === 'diamond' ? 'diamonds' : 'gold';
  const result = applyTransaction(
    balance,
    transactions,
    currency,
    treasure.amount,
    'earn',
    `Found ${treasure.type} in the village`,
  );
  if (!result.success) {
    return { balance, transactions, collection: fresh, success: false };
  }

  return {
    balance: result.balance,
    transactions: result.transactions,
    collection: {
      resetDate: fresh.resetDate,
      collectedToday: [...fresh.collectedToday, treasure.id],
    },
    success: true,
  };
}
