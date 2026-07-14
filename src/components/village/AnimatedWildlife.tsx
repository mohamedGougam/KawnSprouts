import { motion } from 'framer-motion';
import type { WildlifeAnimal } from '../../models';

interface AnimatedWildlifeProps {
  animal: WildlifeAnimal;
  labelScale: number;
}

export function AnimatedWildlife({ animal, labelScale }: AnimatedWildlifeProps) {
  const activity = animal.activity ?? 'idle';

  return (
    <div style={labelScale !== 1 ? { transform: `scale(${labelScale})`, transformOrigin: 'center center' } : undefined}>
      <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
        {animal.id.includes('gazelle') && <GazelleSvg drinking={activity === 'drinking'} />}
        {animal.id.includes('giraffe') && <GiraffeSvg munching={activity === 'eating'} />}
        {animal.id.includes('elephant') && <ElephantSvg cleaning={activity === 'cleaning'} />}
        {animal.id.includes('fish') && <FishSvg jumping={activity === 'jumping'} />}
        {animal.id.includes('bunny') && <BunnySvg eating={activity === 'eating'} />}
        {animal.id.includes('owl') && <OwlSvg hooting={activity === 'idle'} />}
        {!animal.id.match(/gazelle|giraffe|elephant|fish|bunny|owl/) && (
          <text x="28" y="36" textAnchor="middle" fontSize="28">
            {animal.icon}
          </text>
        )}
      </svg>
    </div>
  );
}

function GazelleSvg({ drinking }: { drinking: boolean }) {
  return (
    <g>
      <ellipse cx="28" cy="40" rx="14" ry="8" fill="#d4a574" />
      <ellipse cx="28" cy="28" rx="10" ry="12" fill="#e8c49a" />
      <motion.g animate={drinking ? { rotate: [0, 15, 0] } : {}} style={{ transformOrigin: '28px 28px' }}>
        <ellipse cx="28" cy="18" rx="6" ry="8" fill="#e8c49a" />
        <motion.ellipse
          cx="28"
          cy="22"
          rx="3"
          fill="#8b6914"
          animate={drinking ? { ry: [1, 4, 1] } : { ry: 2 }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      </motion.g>
      <line x1="20" y1="44" x2="18" y2="52" stroke="#8b6914" strokeWidth="2" />
      <line x1="36" y1="44" x2="38" y2="52" stroke="#8b6914" strokeWidth="2" />
    </g>
  );
}

function GiraffeSvg({ munching }: { munching?: boolean }) {
  return (
    <g>
      <motion.rect
        x="24"
        y="8"
        width="8"
        height="28"
        rx="4"
        fill="#fbbf24"
        animate={{ rotate: [-2, 2, -2] }}
        style={{ transformOrigin: '28px 36px' }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <circle cx="28" cy="10" r="7" fill="#fbbf24" />
      <motion.ellipse
        cx="28"
        cy="14"
        rx="4"
        ry="2"
        fill="#78350f"
        animate={munching ? { ry: [2, 4, 1, 3, 2] } : { ry: [2, 3, 2] }}
        transition={{ duration: munching ? 0.5 : 2, repeat: Infinity }}
      />
      <ellipse cx="28" cy="40" rx="12" ry="6" fill="#d97706" opacity="0.5" />
    </g>
  );
}

function ElephantSvg({ cleaning }: { cleaning: boolean }) {
  return (
    <g>
      <ellipse cx="28" cy="32" rx="16" ry="14" fill="#9ca3af" />
      <motion.path
        d="M 18 28 Q 12 32 10 40"
        fill="none"
        stroke="#6b7280"
        strokeWidth="4"
        strokeLinecap="round"
        animate={cleaning ? { d: ['M 18 28 Q 12 32 10 40', 'M 18 28 Q 14 36 12 44', 'M 18 28 Q 12 32 10 40'] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
      <circle cx="22" cy="26" r="2" fill="#374151" />
      <circle cx="34" cy="26" r="2" fill="#374151" />
      <motion.ellipse
        cx="28"
        cy="34"
        rx="5"
        ry="2"
        fill="#4b5563"
        animate={cleaning ? { ry: [2, 3, 2] } : {}}
        transition={{ duration: 0.8, repeat: Infinity }}
      />
    </g>
  );
}

function FishSvg({ jumping }: { jumping: boolean }) {
  return (
    <motion.g
      animate={jumping ? { y: [0, -14, 0], rotate: [0, -20, 0] } : { y: [0, -2, 0] }}
      transition={{ duration: jumping ? 1.2 : 2.5, repeat: Infinity }}
    >
      <ellipse cx="28" cy="28" rx="14" ry="8" fill="#38bdf8" />
      <polygon points="14,28 6,22 6,34" fill="#0ea5e9" />
      <circle cx="32" cy="26" r="2" fill="#1e3a5f" />
      <motion.ellipse
        cx="26"
        cy="30"
        rx="3"
        ry="1"
        fill="#0369a1"
        animate={{ ry: [1, 2, 1] }}
        transition={{ duration: 0.5, repeat: Infinity }}
      />
    </motion.g>
  );
}

function BunnySvg({ eating }: { eating: boolean }) {
  return (
    <g>
      <ellipse cx="28" cy="36" rx="12" ry="10" fill="#f9a8d4" />
      <ellipse cx="22" cy="16" rx="4" ry="12" fill="#f9a8d4" />
      <ellipse cx="34" cy="16" rx="4" ry="12" fill="#f9a8d4" />
      <circle cx="28" cy="30" r="8" fill="#fce7f3" />
      <circle cx="25" cy="28" r="1.5" fill="#374151" />
      <circle cx="31" cy="28" r="1.5" fill="#374151" />
      <motion.ellipse
        cx="28"
        cy="33"
        rx="3"
        ry="2"
        fill="#f472b6"
        animate={eating ? { ry: [2, 0.5, 2], rx: [3, 4, 3] } : { ry: 2, rx: 3 }}
        transition={{ duration: 0.4, repeat: eating ? Infinity : 0 }}
      />
    </g>
  );
}

function OwlSvg({ hooting }: { hooting?: boolean }) {
  return (
    <g>
      <ellipse cx="28" cy="32" rx="14" ry="16" fill="#a78bfa" />
      <circle cx="22" cy="28" r="5" fill="white" />
      <circle cx="34" cy="28" r="5" fill="white" />
      <motion.circle
        cx="22"
        cy="28"
        r="2"
        fill="#374151"
        animate={hooting ? { scaleY: [1, 0.2, 1] } : {}}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.circle
        cx="34"
        cy="28"
        r="2"
        fill="#374151"
        animate={hooting ? { scaleY: [1, 0.2, 1] } : {}}
        transition={{ duration: 3, repeat: Infinity }}
      />
      <motion.path
        d="M 24 36 Q 28 38 32 36"
        fill="none"
        stroke="#5b21b6"
        strokeWidth="1.5"
        animate={
          hooting
            ? { d: ['M 24 36 Q 28 38 32 36', 'M 24 36 Q 28 40 32 36', 'M 24 36 Q 28 38 32 36'] }
            : { d: ['M 24 36 Q 28 38 32 36', 'M 24 36 Q 28 37 32 36', 'M 24 36 Q 28 38 32 36'] }
        }
        transition={{ duration: hooting ? 2 : 3, repeat: Infinity }}
      />
    </g>
  );
}
