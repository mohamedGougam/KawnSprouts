import { motion } from 'framer-motion';

interface VillageShopBuildingProps {
  lanternsLit?: boolean;
}

/** Sprout & Sparkle — village boutique exterior (rounded cottage, no pointer/arrow shape) */
export function VillageShopBuilding({ lanternsLit }: VillageShopBuildingProps) {
  return (
    <div className="pointer-events-none -translate-x-1/2 -translate-y-1/2 select-none" aria-hidden="true">
      <svg width="88" height="96" viewBox="0 0 88 96" className="drop-shadow-lg">
        {/* Chimney smoke */}
        <motion.circle
          cx="62"
          cy="14"
          r="3"
          fill="rgba(255,255,255,0.45)"
          animate={{ cy: [14, 8], opacity: [0.5, 0] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        {/* Chimney */}
        <rect x="56" y="18" width="8" height="14" rx="1" fill="#92400e" />
        {/* Rounded roof — not a sharp upward arrow */}
        <path
          d="M8 42 Q44 18 80 42 L76 48 Q44 28 12 48 Z"
          fill="#f59e0b"
          stroke="#b45309"
          strokeWidth="1"
        />
        {/* Body */}
        <rect x="14" y="44" width="60" height="40" rx="6" fill="#fef3c7" stroke="#fbbf24" strokeWidth="1" />
        {/* Horizontal wooden sign on facade */}
        <rect x="18" y="36" width="52" height="12" rx="3" fill="#92400e" />
        <text x="44" y="44.5" textAnchor="middle" fill="#fef3c7" fontSize="5.5" fontWeight="700">
          Sprout &amp; Sparkle
        </text>
        {/* Display windows */}
        <rect x="20" y="52" width="14" height="12" rx="2" fill="#e0f2fe" stroke="#fcd34d" strokeWidth="0.8" />
        <text x="27" y="60.5" textAnchor="middle" fontSize="8">
          👒
        </text>
        <rect x="54" y="52" width="14" height="12" rx="2" fill="#e0f2fe" stroke="#fcd34d" strokeWidth="0.8" />
        <text x="61" y="60.5" textAnchor="middle" fontSize="8">
          🚲
        </text>
        {/* Door */}
        <rect x="37" y="66" width="14" height="18" rx="2" fill="#78350f" />
        <circle cx="48" cy="76" r="1.2" fill="#fde047" />
        {/* Lantern */}
        <motion.ellipse
          cx="74"
          cy="58"
          rx="4"
          ry="5"
          fill={lanternsLit ? '#fde047' : '#78716c'}
          animate={lanternsLit ? { opacity: [0.75, 1, 0.75] } : undefined}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
        {/* Flower boxes */}
        <text x="12" y="82" fontSize="7">
          🌸
        </text>
        <text x="72" y="82" fontSize="7">
          🌼
        </text>
        {/* Bike outside */}
        <text x="78" y="92" fontSize="10">
          🚲
        </text>
        {/* Bell */}
        <text x="68" y="50" fontSize="7">
          🔔
        </text>
      </svg>
      <p className="mt-0.5 text-center text-[9px] font-semibold text-amber-950 drop-shadow-sm">
        Tap to enter
      </p>
    </div>
  );
}
