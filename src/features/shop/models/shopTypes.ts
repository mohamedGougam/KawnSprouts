/** Sprout & Sparkle — shop domain types */

export type ShopCategory = 'home' | 'hats' | 'bicycles' | 'special' | 'owned';

export type ShopItemType = 'furniture' | 'hat' | 'bicycle' | 'special';

export type ShopCurrencyType = 'gold' | 'diamonds';

export type ShopItemRarity = 'common' | 'uncommon' | 'rare' | 'special' | 'seasonal';

export type FurnitureSubType =
  | 'bed'
  | 'lamp'
  | 'rug'
  | 'cushion'
  | 'table'
  | 'window'
  | 'shelf'
  | 'plant'
  | 'clock'
  | 'lighting';

export interface ShopUnlockCondition {
  type: 'level' | 'butterflies' | 'growthStage';
  value: number | string;
  label: string;
}

export interface HatAttachment {
  emoji: string;
  offsetX: number;
  offsetY: number;
  scale: number;
  animated?: boolean;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  category: ShopCategory;
  itemType: ShopItemType;
  subType?: FurnitureSubType;
  rarity: ShopItemRarity;
  currencyType: ShopCurrencyType;
  price: number;
  thumbnail: string;
  tags: string[];
  stackable: boolean;
  placeable: boolean;
  unlockCondition?: ShopUnlockCondition;
  hatAttachment?: HatAttachment;
  vehicleSpeedMultiplier?: number;
  furniturePropType?: string;
  featured?: boolean;
  seasonal?: boolean;
}

export interface OwnedShopItem {
  itemId: string;
  purchasedAt: string;
  source: 'shop' | 'legacy';
  quantity: number;
}

export interface EquippedCosmetics {
  hatId: string | null;
  previewHatId: string | null;
}

export interface EquippedVehicle {
  vehicleId: string | null;
  mounted: boolean;
}

export interface FurniturePlacement {
  id: string;
  itemId: string;
  x: number;
  z: number;
  rotation?: number;
}

export interface ShopPurchaseRecord {
  id: string;
  itemId: string;
  itemName: string;
  currency: ShopCurrencyType;
  amount: number;
  previousBalance: number;
  resultingBalance: number;
  timestamp: string;
  success: boolean;
}

export interface ShopPlayerState {
  tutorialComplete: boolean;
  lastCategory: ShopCategory;
  viewedItemIds: string[];
}

export type ShopPurchaseResult =
  | { success: true; itemId: string; threadId?: string }
  | { success: false; reason: 'not_found' | 'unavailable' | 'locked' | 'already_owned' | 'insufficient_funds'; missing?: number; currency?: ShopCurrencyType; message: string };

export interface ShopEconomyPurchaseSuccess {
  success: true;
  balance: import('../../../models').CurrencyBalance;
  transactions: import('../../../models').CurrencyTransaction[];
  inventory: OwnedShopItem[];
  record: ShopPurchaseRecord;
  item: ShopItem;
}

export type ShopEconomyPurchaseResult =
  | ShopEconomyPurchaseSuccess
  | { success: false; reason: 'not_found' | 'locked' | 'already_owned' | 'insufficient_funds'; missing?: number; currency?: ShopCurrencyType; message: string };
