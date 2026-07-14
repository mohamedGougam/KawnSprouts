import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { WorldPosition } from '../../../models';
import { duckOutdoorAmbience, restoreOutdoorAmbience } from '../../../services/houseAudioService';

export type ShopExperiencePhase = 'idle' | 'interior';

const FADE_MS = 320;

export function useShopExperience() {
  const [phase, setPhase] = useState<ShopExperiencePhase>('idle');
  const [entryWorldPos, setEntryWorldPos] = useState<WorldPosition | null>(null);
  const [fade, setFade] = useState(0);
  const rafRef = useRef(0);

  const enterShop = useCallback((currentPos: WorldPosition) => {
    setEntryWorldPos(currentPos);
    setPhase('interior');
    setFade(1);
  }, []);

  const exitShop = useCallback((onComplete?: (savedPos?: WorldPosition) => void) => {
    const savedPos = entryWorldPos;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.max(0, 1 - (now - start) / FADE_MS);
      setFade(t);
      if (t > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPhase('idle');
        setEntryWorldPos(null);
        onComplete?.(savedPos ?? undefined);
      }
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [entryWorldPos]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return {
    phase,
    entryWorldPos,
    fade,
    enterShop,
    exitShop,
    isInside: phase === 'interior',
  };
}

interface ShopExperienceLayerProps {
  phase: ShopExperiencePhase;
  fade: number;
  soundEnabled: boolean;
  onRequestExit: () => void;
  children: React.ReactNode;
}

export function ShopExperienceLayer({
  phase,
  fade,
  soundEnabled,
  children,
}: Omit<ShopExperienceLayerProps, 'onRequestExit'>) {
  const ambienceStarted = useRef(false);

  useEffect(() => {
    if (!soundEnabled) return;
    if (phase === 'interior' && !ambienceStarted.current) {
      ambienceStarted.current = true;
      duckOutdoorAmbience();
    }
    if (phase === 'idle') {
      ambienceStarted.current = false;
      restoreOutdoorAmbience();
    }
  }, [phase, soundEnabled]);

  if (phase !== 'interior') return null;

  return (
    <motion.div
      className="absolute inset-0 z-50 flex h-full min-h-0 flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: fade }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
      style={{
        background: 'linear-gradient(180deg, #4a3728 0%, #2d2118 50%, #1a1410 100%)',
      }}
    >
      {children}
    </motion.div>
  );
}

export { ShopExperienceLayer as ShopExperienceShell };
