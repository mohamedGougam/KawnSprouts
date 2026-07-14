import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { InteriorNpc, NpcInteriorActivity } from '../../../config/houseInteriorConfig';

const ACTIVITY_OFFSET: Record<NpcInteriorActivity, { x: number; y: number; emoji?: string }> = {
  read: { x: 2, y: -1 },
  cook: { x: -2, y: 1 },
  clean: { x: 3, y: 2 },
  sit: { x: 0, y: 2 },
  'look-outside': { x: -4, y: -2 },
  'water-plant': { x: -3, y: 1 },
  wave: { x: 0, y: 0, emoji: '👋' },
  sleep: { x: 0, y: 3 },
  'drink-tea': { x: 1, y: 0 },
  walk: { x: 4, y: 0 },
  stretch: { x: 0, y: -2 },
};

interface InteriorNpcSpriteProps {
  npc: InteriorNpc;
}

export function InteriorNpcSprite({ npc }: InteriorNpcSpriteProps) {
  const [activityIndex, setActivityIndex] = useState(0);
  const activity = npc.activities[activityIndex % npc.activities.length];
  const offset = ACTIVITY_OFFSET[activity];

  useEffect(() => {
    const id = window.setInterval(() => {
      setActivityIndex((i) => i + 1);
    }, 5000 + Math.random() * 3000);
    return () => clearInterval(id);
  }, [npc.activities.length]);

  return (
    <motion.div
      className="pointer-events-none absolute flex flex-col items-center"
      style={{
        left: `${npc.x + offset.x}%`,
        top: `${npc.y + offset.y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: Math.round(npc.y + offset.y) + 5,
      }}
      animate={{
        y: activity === 'sleep' ? [0, 1, 0] : [0, -2, 0],
      }}
      transition={{ repeat: Infinity, duration: activity === 'sleep' ? 4 : 2.5 }}
    >
      <span className="text-2xl drop-shadow-sm" aria-hidden="true">
        {offset.emoji ?? npc.emoji}
      </span>
      <span className="mt-0.5 rounded-full bg-white/80 px-1.5 text-[8px] font-medium text-gray-700 shadow-sm">
        {npc.name}
      </span>
    </motion.div>
  );
}
