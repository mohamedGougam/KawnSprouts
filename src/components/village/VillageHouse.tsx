import { motion } from 'framer-motion';
import type { VillageHouse as VillageHouseModel } from '../../models';

interface VillageHouseProps {
  house: VillageHouseModel;
  isPlayer?: boolean;
  lanternsLit?: boolean;
}

export function VillageHouse({ house, isPlayer, lanternsLit }: VillageHouseProps) {
  return (
    <div className="-translate-x-1/2 -translate-y-1/2" data-world-entity="true">
      <div className="relative">
        <div
          className="mx-auto h-0 w-0 border-x-[28px] border-b-[22px] border-x-transparent"
          style={{ borderBottomColor: house.roofColor }}
        />
        <div
          className="relative mx-auto h-14 w-[52px] rounded-b-lg shadow-md"
          style={{ backgroundColor: house.color }}
        >
          <motion.div
            className="absolute left-1/2 top-3 h-6 w-5 -translate-x-1/2 rounded-sm"
            style={{
              backgroundColor: lanternsLit ? 'rgba(253,224,71,0.7)' : 'rgba(120,53,15,0.2)',
              boxShadow: lanternsLit ? '0 0 8px rgba(253,224,71,0.6)' : undefined,
            }}
            animate={lanternsLit ? { opacity: [0.7, 1, 0.7] } : undefined}
            transition={{ duration: 3, repeat: Infinity }}
          />
          {isPlayer && (
            <motion.div
              className="absolute -right-1 -top-1 rounded-full bg-mint-400 px-1.5 py-0.5 text-[8px] font-bold text-white"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              You
            </motion.div>
          )}
        </div>
        <p className="mt-1 max-w-[64px] truncate text-center text-[9px] font-medium text-gray-700">
          {house.label}
        </p>
      </div>
    </div>
  );
}
