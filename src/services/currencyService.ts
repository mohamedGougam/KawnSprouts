import type { CurrencyBalance, CurrencyTransaction } from '../models';
import { generateId } from '../utils/gameUtils';

export type SpendableCurrency = 'coins' | 'hearts' | 'diamonds' | 'gold';

export function canAfford(balance: CurrencyBalance, currency: SpendableCurrency, amount: number): boolean {
  if (amount < 0) return false;
  switch (currency) {
    case 'coins':
      return balance.gardenCoins >= amount;
    case 'hearts':
      return balance.heartSeeds >= amount;
    case 'diamonds':
      return balance.diamonds >= amount;
    case 'gold':
      return balance.gold >= amount;
  }
}

export function applyTransaction(
  balance: CurrencyBalance,
  transactions: CurrencyTransaction[],
  currency: SpendableCurrency,
  amount: number,
  type: 'earn' | 'spend',
  reason: string,
): { balance: CurrencyBalance; transactions: CurrencyTransaction[]; success: boolean } {
  const newBalance = { ...balance };
  if (type === 'spend') {
    if (!canAfford(balance, currency, amount)) {
      return { balance, transactions, success: false };
    }
    switch (currency) {
      case 'coins':
        newBalance.gardenCoins -= amount;
        break;
      case 'hearts':
        newBalance.heartSeeds -= amount;
        break;
      case 'diamonds':
        newBalance.diamonds -= amount;
        break;
      case 'gold':
        newBalance.gold -= amount;
        break;
    }
  } else {
    switch (currency) {
      case 'coins':
        newBalance.gardenCoins += amount;
        break;
      case 'hearts':
        newBalance.heartSeeds += amount;
        break;
      case 'diamonds':
        newBalance.diamonds += amount;
        break;
      case 'gold':
        newBalance.gold += amount;
        break;
    }
  }
  if (
    newBalance.gardenCoins < 0 ||
    newBalance.heartSeeds < 0 ||
    newBalance.diamonds < 0 ||
    newBalance.gold < 0
  ) {
    return { balance, transactions, success: false };
  }
  const tx: CurrencyTransaction = {
    id: generateId('tx'),
    type,
    currency,
    amount,
    reason,
    timestamp: new Date().toISOString(),
  };
  return {
    balance: newBalance,
    transactions: [...transactions, tx],
    success: true,
  };
}

export function canAffordBoth(
  balance: CurrencyBalance,
  diamonds: number,
  gold: number,
): boolean {
  return canAfford(balance, 'diamonds', diamonds) && canAfford(balance, 'gold', gold);
}
