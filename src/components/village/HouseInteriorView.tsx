import { motion } from 'framer-motion';

interface HouseInteriorViewProps {
  ownerName: string;
  ownedItemIds: string[];
  isPlayerHouse: boolean;
  onOpenShop?: () => void;
  shopUnlocked?: boolean;
}

function has(items: string[], id: string): boolean {
  return items.includes(id);
}

export function HouseInteriorView({
  ownerName,
  ownedItemIds,
  isPlayerHouse,
  onOpenShop,
  shopUnlocked,
}: HouseInteriorViewProps) {
  const extraChairs = ownedItemIds.filter((id) => id === 'extra-chair').length;
  const hasCurtains = has(ownedItemIds, 'lace-curtains');
  const hasSheets = has(ownedItemIds, 'bed-sheets');
  const hasRug = has(ownedItemIds, 'woven-rug');
  const hasTableCloth = has(ownedItemIds, 'table-cloth');
  const hasPainting = has(ownedItemIds, 'sun-painting');
  const hasLantern = has(ownedItemIds, 'star-lantern');
  const hasVase = has(ownedItemIds, 'flower-vase');
  const hasBookshelf = has(ownedItemIds, 'bookshelf');
  const hasToy = has(ownedItemIds, 'wooden-toy');
  const hasPlush = has(ownedItemIds, 'plush-cloud');
  const hasChime = has(ownedItemIds, 'wind-chime');

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">
        {isPlayerHouse
          ? 'Your cozy cottage — keep collecting treasures to decorate more.'
          : `${ownerName}'s cozy cottage`}
      </p>

      <div
        className="relative mx-auto aspect-[4/3] w-full max-w-sm overflow-hidden rounded-3xl shadow-inner"
        style={{
          background: 'linear-gradient(180deg, #fff7ed 0%, #fde68a 55%, #d4a574 100%)',
        }}
      >
        {/* Wall */}
        <div className="absolute inset-x-0 top-0 h-[62%] bg-gradient-to-b from-orange-50 to-amber-100" />

        {/* Floor */}
        <div
          className="absolute inset-x-0 bottom-0 h-[38%]"
          style={{
            background: 'repeating-linear-gradient(90deg, #c4a484 0px, #c4a484 18px, #b8956f 18px, #b8956f 36px)',
          }}
        />

        {/* Window */}
        <div className="absolute left-[12%] top-[14%] h-16 w-14 rounded-lg border-4 border-amber-800/30 bg-sky-200/80 shadow-inner">
          <div className="absolute inset-0 flex">
            <div className="w-1/2 border-r border-amber-800/20" />
            <div className="h-full w-1/2 border-l border-amber-800/20" />
          </div>
          {hasCurtains && (
            <>
              <div className="absolute -left-1 top-0 h-full w-3 rounded-l-full bg-white/70 shadow-sm" />
              <div className="absolute -right-1 top-0 h-full w-3 rounded-r-full bg-white/70 shadow-sm" />
            </>
          )}
        </div>

        {/* Painting */}
        {hasPainting && (
          <div className="absolute right-[14%] top-[12%] flex h-12 w-10 flex-col items-center justify-center rounded-md border-2 border-amber-900/20 bg-yellow-200 shadow">
            <span className="text-lg" aria-hidden="true">
              🌞
            </span>
          </div>
        )}

        {/* Wind chime near window */}
        {hasChime && (
          <motion.span
            className="absolute left-[22%] top-[10%] text-lg"
            animate={{ rotate: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 3 }}
            aria-hidden="true"
          >
            🎐
          </motion.span>
        )}

        {/* Rug */}
        {hasRug && (
          <div className="absolute bottom-[28%] left-[18%] h-10 w-24 rounded-full bg-rose-300/80 shadow-sm ring-2 ring-rose-400/40" />
        )}

        {/* Bed */}
        <div className="absolute bottom-[22%] left-[8%]">
          <div
            className="h-14 w-20 rounded-2xl shadow-md"
            style={{ backgroundColor: hasSheets ? '#bfdbfe' : '#fcd34d' }}
          />
          <div className="absolute -left-1 top-1 h-8 w-6 rounded-lg bg-amber-100 shadow-sm" />
          <div className="absolute -right-1 top-2 h-6 w-5 rounded-full bg-white shadow-sm" />
          {hasPlush && (
            <span className="absolute left-3 top-2 text-sm" aria-hidden="true">
              ☁️
            </span>
          )}
          <p className="mt-1 text-center text-[8px] font-medium text-amber-900/70">Bed</p>
        </div>

        {/* Round dining table */}
        <div className="absolute bottom-[30%] right-[22%]">
          <div
            className="relative h-14 w-14 rounded-full shadow-md"
            style={{ backgroundColor: '#d97706' }}
          >
            {hasTableCloth && (
              <div className="absolute inset-1 rounded-full border-2 border-dashed border-white/60 bg-red-300/50" />
            )}
            {hasVase && (
              <span className="absolute left-1/2 top-1 -translate-x-1/2 text-xs" aria-hidden="true">
                🏺
              </span>
            )}
          </div>
          <p className="mt-1 text-center text-[8px] font-medium text-amber-900/70">Table</p>
        </div>

        {/* Base chair */}
        <div className="absolute bottom-[24%] right-[12%]">
          <div className="h-8 w-7 rounded-t-lg bg-amber-700 shadow-sm" />
          <div className="mx-auto h-2 w-8 rounded-sm bg-amber-800" />
          <p className="mt-0.5 text-center text-[8px] font-medium text-amber-900/70">Chair</p>
        </div>

        {/* Extra chairs */}
        {extraChairs > 0 && (
          <div className="absolute bottom-[24%] right-[34%]">
            <div className="h-7 w-6 rounded-t-lg bg-amber-600 shadow-sm" />
            <div className="mx-auto h-2 w-7 rounded-sm bg-amber-800" />
          </div>
        )}

        {/* Bookshelf */}
        {hasBookshelf && (
          <div className="absolute bottom-[38%] left-[32%] h-16 w-10 rounded-sm bg-amber-900/80 shadow">
            <div className="m-1 space-y-0.5">
              <div className="h-1.5 rounded-sm bg-sky-300" />
              <div className="h-1.5 rounded-sm bg-rose-300" />
              <div className="h-1.5 rounded-sm bg-lime-300" />
              {hasToy && <span className="block text-center text-[10px]">🧸</span>}
            </div>
          </div>
        )}

        {/* Star lantern */}
        {hasLantern && (
          <motion.div
            className="absolute right-[10%] top-[28%] text-base"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ repeat: Infinity, duration: 2.5 }}
            aria-hidden="true"
          >
            ✨
          </motion.div>
        )}

        {/* Warm glow */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-amber-900/10 to-transparent" />
      </div>

      {isPlayerHouse && shopUnlocked && onOpenShop && (
        <button
          type="button"
          onClick={onOpenShop}
          className="focus-ring w-full rounded-2xl bg-amber-500 py-3 text-sm font-bold text-white shadow-md"
        >
          🏪 Open cottage shop
        </button>
      )}
      {isPlayerHouse && !shopUnlocked && (
        <p className="rounded-2xl bg-sky-50 px-4 py-3 text-center text-xs text-sky-800">
          Find 💎 diamonds in the village. At 10 diamonds you can open the cottage shop!
        </p>
      )}
    </div>
  );
}
