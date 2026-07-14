import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import type { VillageHouse } from '../../../models';
import type { HouseInteriorDefinition, HouseRandomEvent } from '../../../config/houseInteriorConfig';
import { RANDOM_EVENT_LABELS, RANDOM_EVENT_POOL } from '../../../config/houseInteriorConfig';
import { getInteriorSceneConfig } from '../../../config/interiorSceneConfig';
import { HouseShopSheet } from '../HouseShopSheet';
import { HOUSE_SHOP_ITEMS } from '../../../config/houseConfig';
import type { CurrencyBalance, HouseProgress, SproutColor } from '../../../models';
import type { FurniturePlacement } from '../../../features/shop/models/shopTypes';
import { playHouseSound } from '../../../services/houseAudioService';

const CozyHouseCanvas = lazy(() =>
  import('./three/CozyHouseScene').then((m) => ({ default: m.CozyHouseCanvas })),
);

interface HouseInteriorSceneProps {
  house: VillageHouse;
  definition: HouseInteriorDefinition;
  theme: 'day' | 'evening' | 'night';
  sproutColor: SproutColor;
  sproutName: string;
  isPlayerHouse: boolean;
  ownedItemIds: string[];
  shopUnlocked: boolean;
  currency: CurrencyBalance;
  houseProgress: HouseProgress;
  onBuyItem: (id: string) => void;
  onRequestExit: () => void;
  furniturePlacements?: FurniturePlacement[];
  hatOverlay?: string | null;
  hatOffset?: { offsetX?: number; offsetY?: number; scale?: number } | null;
}

export function HouseInteriorScene({
  house,
  definition,
  theme,
  sproutColor,
  sproutName,
  isPlayerHouse,
  shopUnlocked,
  currency,
  houseProgress,
  onBuyItem,
  onRequestExit,
  furniturePlacements = [],
  hatOverlay,
  hatOffset,
}: HouseInteriorSceneProps) {
  const [showShop, setShowShop] = useState(false);
  const [randomEvent, setRandomEvent] = useState<HouseRandomEvent | null>(null);

  const sceneConfig = useMemo(
    () => getInteriorSceneConfig(house.id, house.ownerId, house.ownerName),
    [house.id, house.ownerId, house.ownerName],
  );

  const residentNpc = definition.rooms['living-room'].npcs[0];
  const residentEmoji = residentNpc?.emoji ?? '🏠';
  const residentName = residentNpc?.name ?? sceneConfig.ownerName;

  const triggerRandomEvent = useCallback(() => {
    const pick = RANDOM_EVENT_POOL[Math.floor(Math.random() * RANDOM_EVENT_POOL.length)];
    setRandomEvent(pick);
    if (pick === 'fireplace-crackle') playHouseSound('fire-crackle');
    if (pick === 'kettle-whistle') playHouseSound('kettle');
    if (pick === 'bird-on-window') playHouseSound('bird-outside');
    if (pick === 'tiny-mouse') playHouseSound('mouse-scurry');
    window.setTimeout(() => setRandomEvent(null), 3200);
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => {
      if (Math.random() < 0.3) triggerRandomEvent();
    }, 24000);
    return () => clearInterval(id);
  }, [triggerRandomEvent]);

  return (
    <div className="pointer-events-auto flex h-full min-h-0 flex-col touch-none overscroll-none">
      <div className="flex shrink-0 items-center justify-between gap-2 px-4 pb-2 pt-3">
        <button
          type="button"
          onClick={onRequestExit}
          className="focus-ring flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-2 text-sm font-semibold text-amber-50 backdrop-blur-sm"
        >
          <ArrowLeft size={16} />
          Leave
        </button>
        <p className="truncate text-sm font-semibold text-amber-100/95">{house.label}</p>
        {isPlayerHouse && shopUnlocked ? (
          <button
            type="button"
            onClick={() => setShowShop(true)}
            className="focus-ring rounded-full bg-amber-200/20 px-3 py-2 text-xs font-semibold text-amber-50"
          >
            Shop
          </button>
        ) : (
          <div className="w-[72px]" aria-hidden="true" />
        )}
      </div>

      {randomEvent && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="shrink-0 px-4 pb-1 text-center text-xs text-amber-200/85"
        >
          ✨ {RANDOM_EVENT_LABELS[randomEvent]}
        </motion.p>
      )}

      <div
        className="relative mx-auto min-h-0 w-full max-w-lg flex-1 touch-none overscroll-none px-1 pb-3 sm:max-w-xl sm:px-2"
        style={{ touchAction: 'none' }}
      >
        <Suspense
          fallback={
            <div className="flex h-full items-center justify-center text-sm text-amber-200/75">
              Opening your cottage…
            </div>
          }
        >
          <CozyHouseCanvas
            scene={sceneConfig}
            theme={theme}
            sproutColor={sproutColor}
            sproutName={sproutName}
            residentName={residentName}
            residentEmoji={residentEmoji}
            interactive
            onDoorExit={onRequestExit}
            furniturePlacements={furniturePlacements}
            hatOverlay={hatOverlay}
            hatOffset={hatOffset}
          />
        </Suspense>
      </div>

      <p className="shrink-0 pb-2 text-center text-[10px] text-amber-200/50">
        Tap the floor to walk · Tap objects to interact · Tap the door to leave
      </p>

      <AnimatePresence>
        {showShop && isPlayerHouse && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-end bg-black/35 p-4 pb-24"
            onClick={() => setShowShop(false)}
          >
            <motion.div
              initial={{ y: 40 }}
              animate={{ y: 0 }}
              exit={{ y: 40 }}
              className="max-h-[50vh] w-full overflow-y-auto rounded-3xl bg-white p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-bold text-gray-900">Cottage shop</h3>
                <button
                  type="button"
                  className="focus-ring rounded-full px-3 py-1 text-sm text-gray-500"
                  onClick={() => setShowShop(false)}
                >
                  Close
                </button>
              </div>
              <HouseShopSheet
                items={HOUSE_SHOP_ITEMS}
                balance={currency}
                progress={houseProgress}
                onBuy={onBuyItem}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
