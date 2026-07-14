import { motion } from 'framer-motion';
import type { HouseShopItem } from '../../config/houseConfig';
import type { CurrencyBalance, HouseProgress } from '../../models';
import { canBuyHouseItem, ownsHouseItem } from '../../services/houseService';

interface HouseShopSheetProps {
  items: HouseShopItem[];
  balance: CurrencyBalance;
  progress: HouseProgress;
  onBuy: (itemId: string) => void;
}

export function HouseShopSheet({ items, balance, progress, onBuy }: HouseShopSheetProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        Spend diamonds and gold on cozy upgrades. Everything you buy stays in your cottage forever.
      </p>
      <div className="flex gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
        <span>💎 {balance.diamonds}</span>
        <span>🪙 {balance.gold}</span>
      </div>
      <ul className="space-y-2">
        {items.map((item) => {
          const owned = ownsHouseItem(progress, item.id);
          const affordable = canBuyHouseItem(balance, progress, item);
          return (
            <li
              key={item.id}
              className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3"
            >
              <span className="text-2xl" aria-hidden="true">
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900">{item.name}</p>
                <p className="text-xs text-gray-500">{item.description}</p>
                <p className="mt-1 text-xs font-medium text-amber-800">
                  💎 {item.priceDiamonds} · 🪙 {item.priceGold}
                </p>
              </div>
              {owned ? (
                <span className="rounded-full bg-mint-100 px-3 py-1 text-xs font-semibold text-mint-800">
                  Owned
                </span>
              ) : (
                <motion.button
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  disabled={!affordable}
                  onClick={() => onBuy(item.id)}
                  className="focus-ring shrink-0 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
                >
                  Buy
                </motion.button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
