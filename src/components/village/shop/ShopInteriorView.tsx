import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Sparkles, X } from 'lucide-react';
import { useGameStore } from '../../../app/store/gameStore';
import type { ShopCategory, ShopItem } from '../../../features/shop/models/shopTypes';
import {
  filterCatalog,
  getCatalogByCategory,
  getFeaturedItems,
  getMomoRecommendations,
  getOwnedIds,
  isItemUnlocked,
  sortCatalog,
} from '../../../features/shop/services/shopService';
import { playShopSound } from '../../../features/shop/services/shopAudioService';
import { SHOP_MANIFEST } from '../../../assets/shop/manifest';
import { yourKawniee } from '../../../config/terminology';
import { VillageSproutMarker } from '../VillageSproutMarker';

const CATEGORIES: { id: ShopCategory; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'hats', label: 'Hats', icon: '🎩' },
  { id: 'bicycles', label: 'Bikes', icon: '🚲' },
  { id: 'special', label: 'Special', icon: '✨' },
  { id: 'owned', label: 'Owned', icon: '🎒' },
];

const RARITY_BORDER: Record<string, string> = {
  common: 'border-gray-200',
  uncommon: 'border-emerald-200',
  rare: 'border-violet-200 ring-1 ring-violet-100',
  special: 'border-amber-300 ring-1 ring-amber-100',
  seasonal: 'border-pink-200',
};

interface ShopInteriorViewProps {
  onExit: () => void;
  soundEnabled: boolean;
  onPlaceFurniture?: (itemId: string) => void;
  onEnterPlayerHouse?: () => void;
}

export function ShopInteriorView({ onExit, soundEnabled, onPlaceFurniture, onEnterPlayerHouse }: ShopInteriorViewProps) {
  const currency = useGameStore((s) => s.currency);
  const inventory = useGameStore((s) => s.shopInventory);
  const shopState = useGameStore((s) => s.shopState);
  const sprout = useGameStore((s) => s.sprout);
  const player = useGameStore((s) => s.player);
  const stats = useGameStore((s) => s.stats);
  const equippedCosmetics = useGameStore((s) => s.equippedCosmetics);
  const equippedVehicle = useGameStore((s) => s.equippedVehicle);
  const purchaseShopItem = useGameStore((s) => s.purchaseShopItem);
  const equipShopHat = useGameStore((s) => s.equipShopHat);
  const previewShopHat = useGameStore((s) => s.previewShopHat);
  const clearShopHatPreview = useGameStore((s) => s.clearShopHatPreview);
  const equipShopVehicle = useGameStore((s) => s.equipShopVehicle);
  const equipAndRideShopVehicle = useGameStore((s) => s.equipAndRideShopVehicle);
  const completeShopTutorial = useGameStore((s) => s.completeShopTutorial);
  const setShopLastCategory = useGameStore((s) => s.setShopLastCategory);
  const placeShopFurniture = useGameStore((s) => s.placeShopFurniture);

  const [category, setCategory] = useState<ShopCategory>(shopState.lastCategory);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ShopItem | null>(null);
  const [confirmBuy, setConfirmBuy] = useState<ShopItem | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [momoLine, setMomoLine] = useState('Welcome to Sprout & Sparkle!');
  const [purchaseSuccess, setPurchaseSuccess] = useState<ShopItem | null>(null);
  const [showTutorial, setShowTutorial] = useState(!shopState.tutorialComplete);
  const [previewMode, setPreviewMode] = useState(false);

  const ownedIds = useMemo(() => getOwnedIds(inventory), [inventory]);
  const items = useMemo(() => {
    const base = getCatalogByCategory(category, ownedIds);
    const filtered = filterCatalog(base, { query, balance: currency, ownedIds });
    return sortCatalog(filtered, 'recommended', ownedIds);
  }, [category, query, currency, ownedIds]);

  const featured = useMemo(() => getFeaturedItems(), []);
  const momoPicks = useMemo(
    () => getMomoRecommendations(currency, inventory, ownedIds),
    [currency, inventory, ownedIds],
  );

  const ctx = { playerLevel: player.level, butterfliesDiscovered: stats.butterfliesDiscovered };

  const handleCategory = (c: ShopCategory) => {
    setCategory(c);
    setShopLastCategory(c);
    playShopSound('preview', soundEnabled);
  };

  const openPreview = (item: ShopItem) => {
    setSelected(item);
    setPreviewMode(true);
    playShopSound('preview', soundEnabled);
    if (item.itemType === 'hat') previewShopHat(item.id);
    setMomoLine('Something cozy caught your eye?');
  };

  const closePreview = () => {
    setSelected(null);
    setPreviewMode(false);
    clearShopHatPreview();
  };

  const handlePurchase = (item: ShopItem) => {
    setConfirmBuy(item);
  };

  const confirmPurchase = () => {
    if (!confirmBuy) return;
    const result = purchaseShopItem(confirmBuy.id);
    setConfirmBuy(null);
    if (!result.success) {
      playShopSound('error', soundEnabled);
      setMomoLine(result.message ?? 'This one will wait patiently for you.');
      setFeedback(result.message ?? null);
      return;
    }
    playShopSound(confirmBuy.currencyType === 'diamonds' ? 'purchase-diamond' : 'purchase-gold', soundEnabled);
    setMomoLine('A wonderful choice!');
    setPurchaseSuccess(confirmBuy);
    closePreview();
  };

  const afterPurchaseAction = (action: 'equip' | 'place' | 'ride' | 'close') => {
    if (!purchaseSuccess) return;
    const item = purchaseSuccess;
    setPurchaseSuccess(null);
    if (action === 'equip' && item.itemType === 'hat') {
      equipShopHat(item.id);
      playShopSound('equip-hat', soundEnabled);
    }
    if (action === 'equip' && item.itemType === 'bicycle') {
      equipShopVehicle(item.id);
      playShopSound('bike-bell', soundEnabled);
    }
    if (action === 'place' && item.placeable) {
      const r = placeShopFurniture(item.id);
      if (r.success) onPlaceFurniture?.(item.id);
    }
    if (action === 'ride' && item.itemType === 'bicycle') {
      equipAndRideShopVehicle(item.id);
      playShopSound('bike-bell', soundEnabled);
      onExit();
    }
  };

  const handleOwnedAction = (item: ShopItem) => {
    if (item.itemType === 'hat') {
      equipShopHat(equippedCosmetics.hatId === item.id ? null : item.id);
      playShopSound('equip-hat', soundEnabled);
      setMomoLine('It suits you beautifully!');
    } else if (item.itemType === 'bicycle') {
      equipAndRideShopVehicle(item.id);
      playShopSound('bike-bell', soundEnabled);
      setMomoLine('Your bicycle is ready for an adventure.');
      onExit();
    } else if (item.placeable) {
      const r = placeShopFurniture(item.id);
      if (r.success) {
        setMomoLine('That will look lovely in your home.');
        onEnterPlayerHouse?.();
      }
    }
  };

  return (
    <div className="pointer-events-auto flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 pb-2 pt-3 sm:px-4">
        <button
          type="button"
          onClick={() => {
            playShopSound('door', soundEnabled);
            clearShopHatPreview();
            onExit();
          }}
          className="focus-ring flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-sm font-semibold text-amber-50"
        >
          <ArrowLeft size={16} />
          Leave
        </button>
        <div className="text-center">
          <p className="text-sm font-bold text-amber-50">{SHOP_MANIFEST.shopName}</p>
          <p className="text-[10px] text-amber-200/70">with {SHOP_MANIFEST.shopkeeper}</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-black/25 px-2.5 py-1.5 text-xs font-semibold text-amber-50">
          <span>💎 {currency.diamonds}</span>
          <span className="text-amber-200/50">|</span>
          <span>🪙 {currency.gold}</span>
        </div>
      </div>

      {/* Cozy interior backdrop + shopkeeper */}
      <div className="relative mx-3 mb-2 shrink-0 overflow-hidden rounded-2xl bg-gradient-to-b from-amber-100/95 to-orange-100/90 p-3 shadow-inner sm:mx-4">
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'repeating-linear-gradient(90deg,#92400e22 0 8px,transparent 8px 16px)' }} />
        <div className="relative flex items-end justify-between gap-2">
          <div>
            <p className="text-lg">🐾</p>
            <p className="text-xs font-bold text-amber-900">{SHOP_MANIFEST.shopkeeper}</p>
            <p className="max-w-[200px] text-[11px] leading-snug text-amber-800/90">{momoLine}</p>
          </div>
          <div className="flex gap-1 text-lg opacity-80">
            <span>👒</span><span>🪴</span><span>🚲</span><span>🛋️</span>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="shrink-0 overflow-x-auto px-3 pb-2 sm:px-4">
        <div className="flex gap-1.5">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleCategory(c.id)}
              className={`focus-ring shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold ${
                category === c.id ? 'bg-amber-400 text-amber-950' : 'bg-white/15 text-amber-100'
              }`}
            >
              {c.icon} {c.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="shrink-0 px-3 pb-2 sm:px-4">
        <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
          <Search size={14} className="text-amber-200/60" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search little treasures…"
            className="min-w-0 flex-1 bg-transparent text-sm text-amber-50 placeholder:text-amber-200/40 focus:outline-none"
          />
        </div>
      </div>

      {category !== 'owned' && !query && featured.length > 0 && (
        <div className="shrink-0 px-3 pb-2 sm:px-4">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200/70">Today&apos;s Little Finds</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {featured.map((item) => (
              <button
                key={`feat-${item.id}`}
                type="button"
                onClick={() => openPreview(item)}
                className="focus-ring shrink-0 rounded-xl bg-amber-50/95 px-2 py-1.5 text-left shadow-sm ring-1 ring-amber-200/60"
              >
                <span className="text-lg">{item.thumbnail}</span>
                <p className="max-w-[72px] truncate text-[9px] font-semibold text-gray-800">{item.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Momo's picks */}
      {category !== 'owned' && !query && (
        <div className="shrink-0 px-3 pb-2 sm:px-4">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-amber-200/70">Momo&apos;s Picks</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {momoPicks.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => openPreview(item)}
                className="focus-ring shrink-0 rounded-xl bg-white/90 px-2 py-1.5 text-left shadow-sm"
              >
                <span className="text-lg">{item.thumbnail}</span>
                <p className="max-w-[72px] truncate text-[9px] font-semibold text-gray-800">{item.name}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Item grid */}
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-4 sm:px-4">
        {items.length === 0 ? (
          <p className="py-8 text-center text-sm text-amber-200/70">
            {category === 'owned' ? "You haven't brought anything home yet." : 'No little treasures matched that search.'}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {items.map((item) => {
              const owned = ownedIds.has(item.id);
              const locked = !isItemUnlocked(item, ctx);
              const canAfford =
                item.currencyType === 'gold'
                  ? currency.gold >= item.price
                  : currency.diamonds >= item.price;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => (owned && category === 'owned' ? handleOwnedAction(item) : openPreview(item))}
                  className={`focus-ring rounded-2xl border bg-white/95 p-2 text-left shadow-sm ${RARITY_BORDER[item.rarity]}`}
                >
                  <div className="mb-1 flex items-start justify-between">
                    <span className="text-2xl">{item.thumbnail}</span>
                    {owned && <span className="rounded-full bg-mint-100 px-1.5 py-0.5 text-[8px] font-bold text-mint-700">Owned</span>}
                  </div>
                  <p className="truncate text-xs font-bold text-gray-900">{item.name}</p>
                  <p className="text-[10px] capitalize text-gray-500">{item.rarity}</p>
                  {!owned && (
                    <p className={`mt-1 text-[10px] font-semibold ${canAfford ? 'text-amber-700' : 'text-gray-400'}`}>
                      {item.currencyType === 'gold' ? '🪙' : '💎'} {item.price}
                    </p>
                  )}
                  {locked && <p className="mt-0.5 text-[9px] text-orange-600">🔒 {item.unlockCondition?.label}</p>}
                  {equippedCosmetics.hatId === item.id && <p className="text-[9px] text-mint-600">Equipped</p>}
                  {equippedVehicle.vehicleId === item.id && <p className="text-[9px] text-sky-600">Equipped bike</p>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Preview overlay */}
      <AnimatePresence>
        {selected && previewMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex items-end bg-black/50 p-4"
            onClick={closePreview}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              className="max-h-[85vh] w-full overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase text-gray-400">{selected.rarity}</p>
                  <h3 className="text-lg font-bold text-gray-900">{selected.name}</h3>
                </div>
                <button type="button" onClick={closePreview} className="focus-ring rounded-full p-1"><X size={18} /></button>
              </div>
              <p className="mb-3 text-sm text-gray-600">{selected.description}</p>

              {/* Preview area */}
              <div className="mb-4 flex min-h-[120px] items-center justify-center rounded-2xl bg-gradient-to-b from-amber-50 to-orange-50 p-4">
                {selected.itemType === 'hat' && (
                  <div className="relative">
                    <p className="mb-1 text-center text-[10px] font-medium text-amber-700">Trying it on</p>
                    <VillageSproutMarker
                      color={sprout.color}
                      name={sprout.name}
                      isPlayer
                      position={{ x: 0, y: 0 }}
                      onTap={() => {}}
                      embedded
                      animate={!useGameStore.getState().settings.reducedMotion}
                      hatOverlay={selected.hatAttachment?.emoji ?? selected.thumbnail}
                      hatOffset={selected.hatAttachment}
                    />
                  </div>
                )}
                {selected.itemType === 'bicycle' && (
                  <div className="text-center">
                    <p className="mb-1 text-[10px] font-medium text-amber-700">Preview only</p>
                    <p className="text-4xl">🚲</p>
                    <p className="mt-2 text-2xl">{sprout.name} ready to ride!</p>
                  </div>
                )}
                {selected.itemType === 'furniture' && (
                  <div className="text-center">
                    <p className="text-4xl">{selected.thumbnail}</p>
                    <p className="mt-1 text-xs text-gray-600">Preview in your cottage</p>
                  </div>
                )}
                {selected.itemType === 'special' && <p className="text-5xl">{selected.thumbnail}</p>}
              </div>

              {!ownedIds.has(selected.id) && (
                <p className="mb-3 text-center text-sm font-semibold text-gray-800">
                  {selected.currencyType === 'gold' ? '🪙' : '💎'} {selected.price}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                {!ownedIds.has(selected.id) && isItemUnlocked(selected, ctx) && (
                  <button
                    type="button"
                    onClick={() => handlePurchase(selected)}
                    className="focus-ring flex-1 rounded-2xl bg-amber-400 py-3 text-sm font-bold text-amber-950"
                  >
                    Purchase
                  </button>
                )}
                {ownedIds.has(selected.id) && selected.itemType === 'hat' && (
                  <button type="button" onClick={() => { equipShopHat(selected.id); setMomoLine('It suits you beautifully!'); playShopSound('equip-hat', soundEnabled); }} className="focus-ring flex-1 rounded-2xl bg-mint-400 py-3 text-sm font-bold text-white">
                    Equip
                  </button>
                )}
                {ownedIds.has(selected.id) && selected.itemType === 'bicycle' && (
                  <button type="button" onClick={() => { equipAndRideShopVehicle(selected.id); playShopSound('bike-bell', soundEnabled); onExit(); }} className="focus-ring flex-1 rounded-2xl bg-sky-400 py-3 text-sm font-bold text-white">
                    Equip &amp; Ride
                  </button>
                )}
                {ownedIds.has(selected.id) && selected.placeable && (
                  <button type="button" onClick={() => { placeShopFurniture(selected.id); onEnterPlayerHouse?.(); }} className="focus-ring flex-1 rounded-2xl bg-orange-300 py-3 text-sm font-bold text-orange-950">
                    Place in home
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Purchase confirm */}
      <AnimatePresence>
        {confirmBuy && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] flex items-center justify-center bg-black/45 p-4">
            <div className="w-full max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
              <p className="text-center text-sm text-gray-700">
                Buy <strong>{confirmBuy.name}</strong> for{' '}
                <strong>{confirmBuy.price}</strong> {confirmBuy.currencyType === 'gold' ? 'Gold Coins' : 'Diamonds'}?
              </p>
              <p className="mt-2 text-center text-xs text-gray-500">
                Balance after:{' '}
                {confirmBuy.currencyType === 'gold'
                  ? currency.gold - confirmBuy.price
                  : currency.diamonds - confirmBuy.price}
              </p>
              <div className="mt-4 flex gap-2">
                <button type="button" onClick={() => setConfirmBuy(null)} className="focus-ring flex-1 rounded-2xl bg-gray-100 py-2.5 text-sm font-semibold">Not now</button>
                <button type="button" onClick={confirmPurchase} className="focus-ring flex-1 rounded-2xl bg-amber-400 py-2.5 text-sm font-bold text-amber-950">Buy</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success card */}
      <AnimatePresence>
        {purchaseSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[60] flex items-end bg-black/40 p-4">
            <div className="w-full rounded-3xl bg-white p-4 shadow-2xl">
              <p className="flex items-center gap-2 text-lg font-bold text-gray-900">
                <Sparkles size={18} className="text-amber-400" />
                {purchaseSuccess.name} is now yours!
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {purchaseSuccess.itemType === 'hat' && (
                  <button type="button" onClick={() => afterPurchaseAction('equip')} className="focus-ring rounded-xl bg-mint-400 px-4 py-2 text-sm font-semibold text-white">Equip now</button>
                )}
                {purchaseSuccess.itemType === 'bicycle' && (
                  <button type="button" onClick={() => afterPurchaseAction('ride')} className="focus-ring rounded-xl bg-sky-400 px-4 py-2 text-sm font-semibold text-white">Ride now</button>
                )}
                {purchaseSuccess.placeable && (
                  <button type="button" onClick={() => afterPurchaseAction('place')} className="focus-ring rounded-xl bg-orange-300 px-4 py-2 text-sm font-semibold text-orange-950">Place now</button>
                )}
                <button type="button" onClick={() => setPurchaseSuccess(null)} className="focus-ring rounded-xl bg-gray-100 px-4 py-2 text-sm font-semibold">Keep shopping</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial */}
      <AnimatePresence>
        {showTutorial && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 z-[70] flex items-center justify-center bg-black/55 p-4">
            <div className="max-w-sm rounded-3xl bg-white p-5 shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900">Welcome to Sprout &amp; Sparkle</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-700">
                <li>• Use Gold Coins and Diamonds earned from adventures.</li>
                <li>• Try items before buying them.</li>
                <li>• Furniture goes in your home, hats on {yourKawniee()}, bikes help you explore.</li>
              </ul>
              <button
                type="button"
                onClick={() => { setShowTutorial(false); completeShopTutorial(); }}
                className="focus-ring mt-4 w-full rounded-2xl bg-amber-400 py-3 font-bold text-amber-950"
              >
                Let&apos;s browse!
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {feedback && <p className="shrink-0 pb-2 text-center text-xs text-amber-200/80">{feedback}</p>}
    </div>
  );
}
