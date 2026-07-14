import { motion } from 'framer-motion';
import type { Butterfly } from '../../models';
import { useGameStore } from '../../app/store/gameStore';

interface ButterflyWidgetProps {
  butterflyId: string;
  butterflies: Butterfly[];
}

export function ButterflyWidget({ butterflyId, butterflies }: ButterflyWidgetProps) {
  const collectButterfly = useGameStore((s) => s.collectButterfly);
  const butterfly = butterflies.find((b) => b.id === butterflyId);
  if (!butterfly) return null;

  const colors: Record<string, string> = {
    'sunny-wing': '#fbbf24',
    'berry-flutter': '#f472b6',
    'cloud-dancer': '#93c5fd',
    'moon-spark': '#c4b5fd',
    'heart-wing': '#fb7185',
    'tiny-rainbow': 'url(#rainbow)',
  };

  return (
    <motion.button
      type="button"
      className="focus-ring absolute right-8 top-1/2 z-30"
      animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
      transition={{ duration: 3, repeat: Infinity }}
      onClick={() => collectButterfly(butterflyId)}
      aria-label={`Collect ${butterfly.name} butterfly`}
    >
      <svg width="40" height="40" viewBox="0 0 40 40">
        <defs>
          <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#f472b6" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
        </defs>
        <ellipse cx="12" cy="20" rx="10" ry="14" fill={colors[butterfly.id] ?? '#fbbf24'} opacity="0.8" />
        <ellipse cx="28" cy="20" rx="10" ry="14" fill={colors[butterfly.id] ?? '#fbbf24'} opacity="0.8" />
        <ellipse cx="20" cy="20" rx="2" ry="8" fill="#374151" />
      </svg>
      <span className="block text-center text-[10px] font-medium text-gray-700">{butterfly.name}</span>
    </motion.button>
  );
}
