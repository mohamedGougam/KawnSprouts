import { motion } from 'framer-motion';
import { tapYourKawniee } from '../../config/terminology';
import type { GrowthStage, SproutColor, SproutEmotion } from '../../models';
import { SPROUT_COLOR_MAP } from '../../config/gameConfig';
import { useSettings } from '../../app/store/gameStore';

interface SproutCharacterProps {
  color: SproutColor;
  emotion: SproutEmotion;
  growthStage: GrowthStage;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  onTap?: () => void;
  speechBubble?: string | null;
  className?: string;
}

const SIZE_MAP = { sm: 80, md: 120, lg: 160 };
const STAGE_SCALE: Record<GrowthStage, number> = {
  tinySeedling: 0.7,
  littleSprout: 0.85,
  bloomingSprout: 1,
  gardenFriend: 1.1,
  treehouseGuardian: 1.25,
};

export function SproutCharacter({
  color,
  emotion,
  growthStage,
  onTap,
  speechBubble,
  size = 'md',
  className = '',
}: SproutCharacterProps) {
  const settings = useSettings();
  const colors = SPROUT_COLOR_MAP[color] ?? SPROUT_COLOR_MAP.mint;
  const baseSize = SIZE_MAP[size];
  const scale = STAGE_SCALE[growthStage];
  const reduced = settings.reducedMotion;

  const eyeOffset = emotion === 'watchingButterfly' ? 3 : emotion === 'sleepy' ? 0 : 0;
  const eyeClosed = emotion === 'sleepy';
  const mouthCurve =
    emotion === 'sad'
      ? -6
      : emotion === 'happy' || emotion === 'excited'
        ? 8
        : emotion === 'thirsty'
          ? -3
          : 4;
  const eyebrowSad = emotion === 'sad';

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {speechBubble && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-12 z-20 max-w-[160px] rounded-2xl bg-white/95 px-3 py-2 text-center text-xs shadow-md"
          role="status"
        >
          {speechBubble}
          <div className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white/95" />
        </motion.div>
      )}
      <motion.button
        type="button"
        aria-label={tapYourKawniee()}
        onClick={onTap}
        className="focus-ring relative cursor-pointer rounded-full border-none bg-transparent p-2"
        animate={
          reduced
            ? {}
            : emotion === 'excited'
              ? { y: [0, -8, 0] }
              : emotion === 'calm'
                ? { scale: [1, 1.02, 1] }
                : { y: [0, -3, 0] }
        }
        transition={
          reduced
            ? {}
            : { duration: emotion === 'excited' ? 0.5 : 3, repeat: Infinity, ease: 'easeInOut' }
        }
        whileTap={reduced ? {} : { scale: 0.95 }}
      >
        <svg
          width={baseSize * scale}
          height={baseSize * scale * 1.2}
          viewBox="0 0 120 144"
          aria-hidden="true"
        >
          {/* Feet */}
          <ellipse cx="42" cy="130" rx="10" ry="6" fill={colors.body} opacity="0.8" />
          <ellipse cx="78" cy="130" rx="10" ry="6" fill={colors.body} opacity="0.8" />
          {/* Body */}
          <ellipse cx="60" cy="85" rx="38" ry="42" fill={colors.body} />
          {/* Arms */}
          <ellipse
            cx="22"
            cy="80"
            rx="8"
            ry="14"
            fill={colors.body}
            transform={emotion === 'excited' ? 'rotate(-20 22 80)' : 'rotate(-10 22 80)'}
          />
          <ellipse
            cx="98"
            cy="80"
            rx="8"
            ry="14"
            fill={colors.body}
            transform={emotion === 'excited' ? 'rotate(20 98 80)' : 'rotate(10 98 80)'}
          />
          {/* Leaves */}
          <motion.ellipse
            cx="45"
            cy="28"
            rx="14"
            ry="20"
            fill={colors.leaf}
            animate={reduced ? {} : { rotate: [-5, 5, -5] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ transformOrigin: '45px 40px' }}
          />
          <motion.ellipse
            cx="75"
            cy="28"
            rx="14"
            ry="20"
            fill={colors.leaf}
            animate={reduced ? {} : { rotate: [5, -5, 5] }}
            transition={{ duration: 4, repeat: Infinity }}
            style={{ transformOrigin: '75px 40px' }}
          />
          {/* Crown for stage 4+ */}
          {(growthStage === 'gardenFriend' || growthStage === 'treehouseGuardian') && (
            <path d="M40 18 L60 5 L80 18" fill="none" stroke="#fbbf24" strokeWidth="3" />
          )}
          {/* Flower for blooming+ */}
          {(growthStage === 'bloomingSprout' ||
            growthStage === 'gardenFriend' ||
            growthStage === 'treehouseGuardian') && (
            <circle cx="60" cy="8" r="6" fill="#f472b6" />
          )}
          {/* Cheeks */}
          <circle cx="38" cy="88" r="8" fill={colors.cheek} opacity="0.5" />
          <circle cx="82" cy="88" r="8" fill={colors.cheek} opacity="0.5" />
          {/* Eyes */}
          {eyeClosed ? (
            <>
              <path d="M44 68 Q50 74 56 68" fill="none" stroke="#374151" strokeWidth="2" />
              <path d="M64 68 Q70 74 76 68" fill="none" stroke="#374151" strokeWidth="2" />
            </>
          ) : (
            <>
              {eyebrowSad && (
                <>
                  <path d="M42 62 L56 66" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M78 66 L64 62" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
              <ellipse cx={50 + eyeOffset} cy="70" rx="7" ry={emotion === 'sad' ? 6 : 9} fill="white" />
              <ellipse cx={70 - eyeOffset} cy="70" rx="7" ry={emotion === 'sad' ? 6 : 9} fill="white" />
              <circle cx={52 + eyeOffset} cy="72" r="4" fill="#374151" />
              <circle cx={72 - eyeOffset} cy="72" r="4" fill="#374151" />
              <circle cx={53 + eyeOffset} cy="70" r="1.5" fill="white" />
              <circle cx={73 - eyeOffset} cy="70" r="1.5" fill="white" />
            </>
          )}
          {/* Mouth */}
          <path
            d={`M48 92 Q60 ${92 + mouthCurve} 72 92`}
            fill="none"
            stroke="#374151"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </motion.button>
    </div>
  );
}
