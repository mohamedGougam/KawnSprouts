import { motion } from 'framer-motion';
import type { SproutColor, SproutEmotion } from '../../models';
import { ZoomLabel } from './ZoomLabel';
import { SPROUT_COLOR_MAP } from '../../config/gameConfig';
import { ariaYourKawniee } from '../../config/terminology';

interface VillageSproutMarkerProps {
  color: SproutColor;
  emotion?: SproutEmotion;
  name: string;
  isPlayer?: boolean;
  position: { x: number; y: number };
  onTap: () => void;
  animate?: boolean;
  embedded?: boolean;
  labelScale?: number;
  /** Scales the sprout SVG when embedded in the 3D interior */
  interiorScale?: number;
  hatOverlay?: string | null;
  hatOffset?: { offsetX?: number; offsetY?: number; scale?: number } | null;
  showBicycle?: boolean;
  bicycleVariant?: string | null;
  /** World sprite scale — use below 1 while moving */
  motionScale?: number;
  onTapSound?: () => void;
}

const BICYCLE_COLORS: Record<string, { frame: string; accent: string }> = {
  'daisy-bicycle': { frame: '#e8c547', accent: '#fff8dc' },
  'berry-bicycle': { frame: '#e8554d', accent: '#ffd4d1' },
  'forest-bicycle': { frame: '#4a9b5c', accent: '#c8f0c8' },
  'moonbeam-bicycle': { frame: '#9b8fd4', accent: '#f0e8ff' },
  'cloud-cruiser': { frame: '#6eb8e8', accent: '#e8f6ff' },
  'friendship-tandem': { frame: '#f08c6a', accent: '#ffe4d9' },
};

function BicycleGraphic({ variant }: { variant?: string | null }) {
  const colors = BICYCLE_COLORS[variant ?? ''] ?? { frame: '#6b9fd4', accent: '#dbeafe' };
  return (
    <svg width="58" height="30" viewBox="0 0 58 30" aria-hidden="true" className="drop-shadow-md">
      <circle cx="14" cy="22" r="7" fill="none" stroke={colors.frame} strokeWidth="2.5" />
      <circle cx="14" cy="22" r="2" fill={colors.frame} />
      <circle cx="44" cy="22" r="7" fill="none" stroke={colors.frame} strokeWidth="2.5" />
      <circle cx="44" cy="22" r="2" fill={colors.frame} />
      <path
        d="M14 22 L24 10 L34 14 L44 22"
        fill="none"
        stroke={colors.frame}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M24 10 L24 6" stroke={colors.frame} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M34 14 L40 8" stroke={colors.frame} strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="28" cy="12" rx="5" ry="3" fill={colors.accent} opacity="0.9" />
      {variant === 'friendship-tandem' && (
        <path d="M30 14 L36 10" stroke={colors.frame} strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      )}
    </svg>
  );
}

export function VillageSproutMarker({
  color,
  emotion = 'happy',
  name,
  isPlayer,
  position,
  onTap,
  animate = true,
  embedded = false,
  labelScale = 1,
  interiorScale,
  hatOverlay,
  hatOffset,
  showBicycle = false,
  bicycleVariant = null,
  motionScale = 1,
  onTapSound,
}: VillageSproutMarkerProps) {
  const colors = SPROUT_COLOR_MAP[color];
  const isSad = emotion === 'sad' || emotion === 'thirsty';
  const mouthCurve = isSad ? -4 : 5;

  return (
    <motion.button
      type="button"
      className={`focus-ring pointer-events-auto z-20 flex flex-col items-center ${embedded ? 'relative' : 'absolute -translate-x-1/2 -translate-y-full'}`}
      style={embedded ? undefined : { left: `${position.x}%`, top: `${position.y}%` }}
      onClick={(e) => {
        e.stopPropagation();
        onTapSound?.();
        onTap();
      }}
      animate={
        animate
          ? { y: [0, -4, 0] }
          : undefined
      }
      transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      aria-label={`${name}${isPlayer ? ariaYourKawniee() : ''}`}
    >
      {isPlayer && (
        <ZoomLabel labelScale={labelScale}>
          <span className="mb-0.5 inline-block rounded-full bg-white/90 px-2 py-0.5 font-semibold text-mint-600 shadow-sm">
            {name}
          </span>
        </ZoomLabel>
      )}
      {hatOverlay && (
        <span
          className="pointer-events-none absolute z-30 drop-shadow-md"
          style={{
            transform: `translate(${hatOffset?.offsetX ?? 0}px, ${hatOffset?.offsetY ?? -22}px) scale(${hatOffset?.scale ?? 1})`,
            fontSize: '1.1rem',
          }}
          aria-hidden
        >
          {hatOverlay}
        </span>
      )}
      <motion.div
        className="relative flex flex-col items-center"
        animate={{ scale: interiorScale ?? motionScale }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        style={{ transformOrigin: 'center bottom' }}
      >
        <svg
          width="44"
          height="52"
          viewBox="0 0 44 52"
          aria-hidden="true"
          className="relative z-10"
          style={{ marginBottom: showBicycle ? -6 : 0, transform: showBicycle ? 'translateY(-8px)' : undefined }}
        >
        <ellipse cx="22" cy="46" rx="6" ry="3" fill={colors.body} opacity={showBicycle ? 0 : 0.7} />
        <ellipse cx="14" cy="46" rx="6" ry="3" fill={colors.body} opacity={showBicycle ? 0 : 0.7} />
        <ellipse cx="22" cy="30" rx="16" ry="18" fill={colors.body} />
        <ellipse cx="14" cy="10" rx="6" ry="9" fill={colors.leaf} />
        <ellipse cx="30" cy="10" rx="6" ry="9" fill={colors.leaf} />
        <circle cx="16" cy="28" r="5" fill={colors.cheek} opacity="0.45" />
        <circle cx="28" cy="28" r="5" fill={colors.cheek} opacity="0.45" />
        {isSad ? (
          <>
            <ellipse cx="16" cy="24" rx="4" ry="5" fill="white" />
            <ellipse cx="28" cy="24" rx="4" ry="5" fill="white" />
            <circle cx="16" cy="25" r="2" fill="#374151" />
            <circle cx="28" cy="25" r="2" fill="#374151" />
            <path d="M14 26 Q16 24 18 26" fill="none" stroke="#374151" strokeWidth="1" />
            <path d="M26 26 Q28 24 30 26" fill="none" stroke="#374151" strokeWidth="1" />
          </>
        ) : (
          <>
            <ellipse cx="16" cy="24" rx="4" ry="5" fill="white" />
            <ellipse cx="28" cy="24" rx="4" ry="5" fill="white" />
            <circle cx="17" cy="25" r="2" fill="#374151" />
            <circle cx="29" cy="25" r="2" fill="#374151" />
          </>
        )}
        <path
          d={`M16 32 Q22 ${32 + mouthCurve} 28 32`}
          fill="none"
          stroke="#374151"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
        {showBicycle && (
          <div className="pointer-events-none -mt-1" aria-hidden>
            <BicycleGraphic variant={bicycleVariant} />
          </div>
        )}
      </motion.div>
      {!isPlayer && (
        <ZoomLabel labelScale={labelScale} className="mt-0.5">
          <span className="block truncate rounded-full bg-white/90 px-2 py-0.5 font-semibold text-gray-800 shadow-sm">
            {name}
          </span>
        </ZoomLabel>
      )}
    </motion.button>
  );
}
