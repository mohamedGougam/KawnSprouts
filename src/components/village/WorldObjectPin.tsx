import { motion } from 'framer-motion';
import type { WorldObject } from '../../models';

interface WorldObjectPinProps {
  object: WorldObject;
  discovered: boolean;
  onTap: () => void;
}

export function WorldObjectPin({ object, discovered, onTap }: WorldObjectPinProps) {
  return (
    <motion.button
      type="button"
      className="focus-ring absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
      style={{ left: object.position.x, top: object.position.y }}
      data-world-entity="true"
      onClick={(e) => {
        e.stopPropagation();
        onTap();
      }}
      whileTap={{ scale: 0.92 }}
      aria-label={`Explore ${object.name}`}
    >
      <span className="text-2xl drop-shadow-sm">{object.icon}</span>
      {!discovered && (
        <span className="mt-0.5 rounded-full bg-yellow-200 px-1.5 text-[8px] font-bold text-yellow-800">
          ?
        </span>
      )}
    </motion.button>
  );
}
