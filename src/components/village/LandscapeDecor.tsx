import { motion } from 'framer-motion';
import type { HerbPatch, LandscapeRuin } from '../../config/landscapeConfig';
import { HERB_PATCHES, LANDSCAPE_RUINS } from '../../config/landscapeConfig';

function RuinHouse({ ruin }: { ruin: LandscapeRuin }) {
  const isWindmill = ruin.id === 'ruin-2';
  const isWall = ruin.id === 'ruin-5';

  return (
    <div
      className="absolute opacity-90"
      style={{
        left: ruin.position.x,
        top: ruin.position.y,
        transform: `translate(-50%, -50%) rotate(${ruin.rotation ?? 0}deg)`,
      }}
      aria-hidden="true"
    >
      {isWall ? (
        <div className="relative">
          <div className="h-8 w-24 rounded-sm bg-stone-500/50" />
          <div className="absolute -left-2 top-1 h-6 w-8 rotate-6 rounded-sm bg-stone-600/40" />
          <div className="absolute -right-1 top-3 h-5 w-10 -rotate-12 rounded-sm bg-stone-400/50" />
          <div className="absolute bottom-0 left-4 h-3 w-14 rounded bg-stone-600/35" />
        </div>
      ) : isWindmill ? (
        <div className="relative">
          <div className="mx-auto h-14 w-3 rounded bg-stone-500/60" />
          <motion.div
            className="absolute -top-2 left-1/2 h-1 w-16 -translate-x-1/2 bg-stone-600/50"
            animate={{ rotate: 360 }}
            transition={{ duration: 14, repeat: Infinity, ease: 'linear' }}
            style={{ transformOrigin: 'center center' }}
          >
            <div className="absolute -top-3 left-0 h-6 w-2 rounded bg-stone-500/45" />
            <div className="absolute -bottom-3 right-0 h-6 w-2 rounded bg-stone-500/45" />
          </motion.div>
          <div className="absolute bottom-0 left-1/2 h-8 w-10 -translate-x-1/2 rounded-sm bg-stone-400/55" />
        </div>
      ) : (
        <div className="relative scale-125">
          <div className="mx-auto h-0 w-0 border-x-[24px] border-b-[16px] border-x-transparent border-b-stone-500/65" />
          <div className="relative mx-auto h-12 w-12 rounded-sm bg-stone-400/75">
            <div className="absolute -right-1 top-2 h-7 w-1.5 rotate-12 bg-stone-500/55" />
            <div className="absolute left-1 top-5 h-5 w-4 rounded-sm bg-stone-700/35" />
            <div className="absolute bottom-0 left-2 h-2.5 w-7 bg-stone-500/45" />
            <div className="absolute -left-2 bottom-1 h-4 w-5 -rotate-6 rounded-sm bg-stone-600/30" />
          </div>
          <div className="absolute -bottom-1 left-0 h-2.5 w-10 rounded bg-stone-600/35" />
          <div className="absolute -bottom-0.5 right-0 h-2 w-6 rotate-12 rounded bg-stone-500/30" />
        </div>
      )}
    </div>
  );
}

function HerbCluster({ herb }: { herb: HerbPatch }) {
  const scale = (herb.scale ?? 1) * 1.15;
  const colors: Record<HerbPatch['type'], string> = {
    clover: '#4ade80',
    lavender: '#c4b5fd',
    fern: '#059669',
    wildflower: '#f472b6',
    thyme: '#86efac',
  };

  return (
    <motion.div
      className="absolute"
      style={{ left: herb.position.x, top: herb.position.y, transform: 'translate(-50%, -50%)' }}
      animate={{ rotate: [-2, 2, -2], y: [0, -1, 0] }}
      transition={{ duration: 4 + (herb.id.charCodeAt(5) % 3), repeat: Infinity }}
      aria-hidden="true"
    >
      <div style={{ transform: `scale(${scale})`, filter: 'drop-shadow(0 1px 2px rgba(22,101,52,0.35))' }}>
        {herb.type === 'clover' && (
          <svg width="28" height="24" viewBox="0 0 24 20">
            <circle cx="8" cy="10" r="5" fill={colors.clover} opacity="0.95" />
            <circle cx="16" cy="10" r="5" fill={colors.clover} opacity="0.95" />
            <circle cx="12" cy="6" r="5" fill={colors.clover} opacity="0.95" />
            <line x1="12" y1="12" x2="12" y2="20" stroke="#166534" strokeWidth="2" />
          </svg>
        )}
        {herb.type === 'lavender' && (
          <svg width="18" height="32" viewBox="0 0 16 28">
            <line x1="8" y1="12" x2="8" y2="28" stroke="#5b21b6" strokeWidth="2" />
            {[4, 8, 12, 16, 20].map((y) => (
              <ellipse key={y} cx="8" cy={y} rx="5" ry="3" fill={colors.lavender} opacity="0.9" />
            ))}
          </svg>
        )}
        {herb.type === 'fern' && (
          <svg width="32" height="28" viewBox="0 0 28 24">
            <path d="M14 24 Q4 12 14 4 Q24 12 14 24" fill={colors.fern} opacity="0.85" />
            <path d="M14 20 Q8 14 14 8 Q20 14 14 20" fill="#10b981" opacity="0.65" />
          </svg>
        )}
        {herb.type === 'wildflower' && (
          <svg width="24" height="28" viewBox="0 0 20 24">
            <circle cx="10" cy="8" r="4" fill="#fde047" />
            {[0, 72, 144, 216, 288].map((angle) => (
              <ellipse
                key={angle}
                cx={10 + Math.cos((angle * Math.PI) / 180) * 7}
                cy={8 + Math.sin((angle * Math.PI) / 180) * 7}
                rx="3"
                ry="5"
                fill={colors.wildflower}
                opacity="0.95"
              />
            ))}
            <line x1="10" y1="12" x2="10" y2="24" stroke="#166534" strokeWidth="1.5" />
          </svg>
        )}
        {herb.type === 'thyme' && (
          <svg width="24" height="18" viewBox="0 0 20 16">
            {[2, 6, 10, 14].map((x) => (
              <ellipse key={x} cx={x} cy="8" rx="3" ry="6" fill={colors.thyme} opacity="0.9" />
            ))}
          </svg>
        )}
      </div>
    </motion.div>
  );
}

export function LandscapeDecor() {
  return (
    <>
      {LANDSCAPE_RUINS.map((ruin) => (
        <RuinHouse key={ruin.id} ruin={ruin} />
      ))}
      {HERB_PATCHES.map((herb) => (
        <HerbCluster key={herb.id} herb={herb} />
      ))}
    </>
  );
}
