import { motion } from 'framer-motion';
import type { VillageHouse } from '../../../models';

interface HouseExteriorFocusProps {
  house: VillageHouse;
  progress: number;
  doorOpen: number;
  theme: 'day' | 'evening' | 'night';
}

export function HouseExteriorFocus({ house, progress, doorOpen, theme }: HouseExteriorFocusProps) {
  const windowGlow = progress > 0.15 ? 1 : 0;
  const doorGlow = progress > 0.28 ? 1 : 0;
  const smokeOpacity = progress > 0.1 ? Math.min(1, (progress - 0.1) * 3.5) : 0;

  const lanternColor =
    theme === 'night' ? 'rgba(253,224,71,0.85)' : theme === 'evening' ? 'rgba(251,191,36,0.7)' : 'rgba(254,240,138,0.5)';

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <motion.div
        className="relative"
        animate={{ scale: 1 + progress * 3.2, y: progress * -32 }}
        transition={{ type: 'spring', stiffness: 210, damping: 26, mass: 0.55 }}
      >
        <motion.div className="absolute -right-2 -top-8 h-8 w-6" style={{ opacity: smokeOpacity }}>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-white/50 blur-sm"
              style={{ width: 8 + i * 4, height: 8 + i * 4, left: i * 2, top: -i * 8 }}
              animate={{ y: [-4, -16], opacity: [0.5, 0], scale: [1, 1.4] }}
              transition={{ repeat: Infinity, duration: 2.2, delay: i * 0.35 }}
            />
          ))}
        </motion.div>

        <div
          className="mx-auto h-0 w-0 border-x-[52px] border-b-[40px] border-x-transparent drop-shadow-lg"
          style={{ borderBottomColor: house.roofColor }}
        />

        <div
          className="relative mx-auto h-24 w-[96px] rounded-b-xl shadow-xl"
          style={{ backgroundColor: house.color }}
        >
          <motion.div
            className="absolute left-3 top-5 h-7 w-6 rounded-sm border-2 border-amber-900/20"
            animate={{
              backgroundColor: `rgba(186,230,253,${0.5 + windowGlow * 0.45})`,
              boxShadow: windowGlow ? `0 0 14px ${lanternColor}` : '0 0 0px transparent',
            }}
            transition={{ duration: 0.35 }}
          />
          <motion.div
            className="absolute right-3 top-5 h-7 w-6 rounded-sm border-2 border-amber-900/20"
            animate={{
              backgroundColor: `rgba(186,230,253,${0.5 + windowGlow * 0.45})`,
              boxShadow: windowGlow ? `0 0 14px ${lanternColor}` : '0 0 0px transparent',
            }}
            transition={{ duration: 0.35 }}
          />

          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            <motion.div
              className="relative h-14 w-11 origin-left rounded-t-sm border-2 border-amber-900/35 bg-amber-800 shadow-inner"
              animate={{
                rotateY: doorOpen * -72,
                boxShadow: doorGlow ? `0 0 22px rgba(251,191,36,${doorGlow * 0.85})` : 'none',
              }}
              transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="absolute right-1.5 top-1/2 h-2 w-2 rounded-full bg-yellow-300 shadow" />
            </motion.div>

            <motion.div
              className="absolute bottom-0 left-1/2 -z-10 h-24 w-28 -translate-x-1/2 rounded-full blur-xl"
              animate={{
                opacity: doorOpen * 0.95,
                scale: 0.55 + doorOpen * 0.9,
              }}
              style={{
                background: 'radial-gradient(circle, rgba(251,191,36,0.92), rgba(251,191,36,0))',
              }}
            />
          </div>
        </div>

        <p className="mt-2 text-center text-sm font-semibold text-white drop-shadow-md">{house.label}</p>
      </motion.div>
    </div>
  );
}
