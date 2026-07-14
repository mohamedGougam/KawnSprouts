import { motion } from 'framer-motion';
import type { WorldPosition } from '../../models';

interface BoatEntityProps {
  position: WorldPosition;
  rocking?: boolean;
}

export function BoatEntity({ position, rocking = true }: BoatEntityProps) {
  return (
    <motion.div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: position.x, top: position.y }}
      animate={rocking ? { rotate: [-2, 2, -2], y: [0, 2, 0] } : undefined}
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      aria-hidden="true"
    >
      <svg width="56" height="32" viewBox="0 0 56 32">
        <path d="M4 20 Q28 28 52 20 L48 24 Q28 30 8 24 Z" fill="#92400e" />
        <path d="M8 18 Q28 22 48 18" fill="none" stroke="#78350f" strokeWidth="1.5" />
        <motion.line
          x1="28" y1="8" x2="20" y2="18"
          stroke="#a16207"
          strokeWidth="2"
          animate={{ rotate: [0, 15, 0] }}
          style={{ transformOrigin: '28px 18px' }}
          transition={{ duration: 1.2, repeat: Infinity }}
        />
        <ellipse cx="28" cy="26" rx="20" ry="3" fill="#0ea5e9" opacity="0.3" />
      </svg>
      <motion.div
        className="absolute -bottom-1 left-1/2 h-1 w-12 -translate-x-1/2 rounded-full bg-sky-300/40"
        animate={{ scaleX: [0.8, 1.2, 0.8], opacity: [0.3, 0.6, 0.3] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.div>
  );
}
