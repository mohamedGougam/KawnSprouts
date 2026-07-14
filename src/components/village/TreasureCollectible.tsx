import { motion } from 'framer-motion';
import type { WorldTreasure } from '../../config/treasureConfig';

interface TreasureCollectibleProps {
  treasure: WorldTreasure;
  available: boolean;
  onCollect: () => void;
}

export function TreasureCollectible({ treasure, available, onCollect }: TreasureCollectibleProps) {
  if (!available) return null;

  const isDiamond = treasure.type === 'diamond';

  return (
    <button
      type="button"
      data-world-entity="true"
      onClick={(e) => {
        e.stopPropagation();
        onCollect();
      }}
      className="focus-ring -translate-x-1/2 -translate-y-1/2"
      aria-label={`Collect ${treasure.type}`}
    >
      <motion.div
        className="relative flex h-9 w-9 items-center justify-center rounded-full shadow-md"
        style={{
          background: isDiamond
            ? 'radial-gradient(circle at 30% 30%, #e0f2fe, #38bdf8)'
            : 'radial-gradient(circle at 30% 30%, #fef08a, #eab308)',
        }}
        animate={{ y: [0, -4, 0], scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2.2 }}
      >
        <span className="text-sm" aria-hidden="true">
          {isDiamond ? '💎' : '🪙'}
        </span>
        <motion.span
          className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-gray-700 shadow"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        >
          {treasure.amount}
        </motion.span>
      </motion.div>
    </button>
  );
}
