import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import type { VillageHouse } from '../../../models';
import type { WorldPosition } from '../../../models';
import { getHouseInteriorDefinition } from '../../../config/houseInteriorConfig';
import { preloadHouseInterior } from '../../../services/housePreloadService';
import {
  duckOutdoorAmbience,
  restoreOutdoorAmbience,
  startIndoorAmbience,
  stopIndoorAmbience,
} from '../../../services/houseAudioService';
import { HouseInteriorScene } from './HouseInteriorScene';
import type { AtmosphereState } from '../../../services/atmosphereService';
import type { CurrencyBalance, HouseProgress, SproutColor } from '../../../models';
import type { FurniturePlacement } from '../../../features/shop/models/shopTypes';

export type HouseExperiencePhase = 'idle' | 'interior';

interface HouseExperienceLayerProps {
  house: VillageHouse | null;
  phase: HouseExperiencePhase;
  theme: 'day' | 'evening' | 'night';
  atmosphere: AtmosphereState;
  sproutColor: SproutColor;
  sproutName: string;
  isPlayerHouse: boolean;
  ownedItemIds: string[];
  shopUnlocked: boolean;
  currency: CurrencyBalance;
  houseProgress: HouseProgress;
  soundEnabled: boolean;
  onBuyItem: (id: string) => { success: boolean; message?: string };
  onRequestExit: () => void;
  furniturePlacements?: FurniturePlacement[];
  hatOverlay?: string | null;
  hatOffset?: { offsetX?: number; offsetY?: number; scale?: number } | null;
}

const FADE_MS = 280;

export function useHouseExperience() {
  const [house, setHouse] = useState<VillageHouse | null>(null);
  const [phase, setPhase] = useState<HouseExperiencePhase>('idle');
  const [entryWorldPos, setEntryWorldPos] = useState<WorldPosition | null>(null);
  const [fade, setFade] = useState(0);
  const rafRef = useRef(0);

  const enterHouse = useCallback((h: VillageHouse, currentPos: WorldPosition) => {
    preloadHouseInterior(h.id);
    setHouse(h);
    setEntryWorldPos(currentPos);
    setPhase('interior');
    setFade(1);
  }, []);

  const exitHouse = useCallback((onComplete?: (savedPos?: WorldPosition) => void) => {
    const savedPos = entryWorldPos;
    const start = performance.now();

    const tick = (now: number) => {
      const t = Math.max(0, 1 - (now - start) / FADE_MS);
      setFade(t);
      if (t > 0) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setPhase('idle');
        setHouse(null);
        setEntryWorldPos(null);
        onComplete?.(savedPos ?? undefined);
      }
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
  }, [entryWorldPos]);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return {
    house,
    phase,
    entryWorldPos,
    fade,
    enterHouse,
    exitHouse,
    isInside: phase === 'interior',
  };
}

export function HouseExperienceLayer({
  house,
  phase,
  theme,
  atmosphere,
  sproutColor,
  sproutName,
  isPlayerHouse,
  ownedItemIds,
  shopUnlocked,
  currency,
  houseProgress,
  soundEnabled,
  fade,
  onRequestExit,
  onBuyItem,
  furniturePlacements = [],
  hatOverlay,
  hatOffset,
}: HouseExperienceLayerProps & { fade: number }) {
  const definition = house ? getHouseInteriorDefinition(house.id) : null;
  const ambienceStarted = useRef(false);

  useEffect(() => {
    if (!house || !soundEnabled) return;

    if (phase === 'interior' && !ambienceStarted.current) {
      ambienceStarted.current = true;
      duckOutdoorAmbience();
      const hasFire = definition?.rooms['living-room'].furniture.some((f) => f.kind === 'fireplace');
      startIndoorAmbience(true, atmosphere, !!hasFire);
    }

    if (phase === 'idle') {
      ambienceStarted.current = false;
      stopIndoorAmbience();
      restoreOutdoorAmbience();
    }
  }, [phase, house, soundEnabled, atmosphere, definition]);

  if (!house || phase !== 'interior') return null;

  return (
    <motion.div
      className="absolute inset-0 z-30 flex flex-col overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: fade }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
      style={{
        background: 'linear-gradient(180deg, #3d2e24 0%, #2a1f18 45%, #1a1410 100%)',
      }}
    >
      {definition && (
        <HouseInteriorScene
          house={house}
          definition={definition}
          theme={theme}
          sproutColor={sproutColor}
          sproutName={sproutName}
          isPlayerHouse={isPlayerHouse}
          ownedItemIds={ownedItemIds}
          shopUnlocked={shopUnlocked}
          currency={currency}
          houseProgress={houseProgress}
          onBuyItem={onBuyItem}
          onRequestExit={onRequestExit}
          furniturePlacements={furniturePlacements}
          hatOverlay={hatOverlay}
          hatOffset={hatOffset}
        />
      )}
    </motion.div>
  );
}

export function getHouseApproachTarget(_house: VillageHouse): WorldPosition {
  return { x: 0, y: 0 };
}
