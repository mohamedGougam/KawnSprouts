import { useCallback, useEffect, useRef, useState } from 'react';
import type { WorldPosition } from '../models';
import { BIKE_SPEED_PX, BOAT_SPEED_PX, WALK_SPEED_PX } from '../config/worldConstants';
import { planLandOnlyTravel, planTravel, type TravelSegment } from '../services/pathfindingService';

export type TransportMode = 'walking' | 'boat' | 'bicycle' | 'idle';

interface UsePlayerWalkOptions {
  position: WorldPosition;
  onPositionChange: (pos: WorldPosition) => void;
  onArrive: (final: WorldPosition) => void;
  onTransportChange?: (mode: TransportMode) => void;
  /** When true, movement uses bicycle speed and never switches to boat */
  bikeMounted?: boolean;
  /** Pixels per frame while riding; defaults to BIKE_SPEED_PX */
  bikeSpeedPx?: number;
}

export function usePlayerWalk({
  position,
  onPositionChange,
  onArrive,
  onTransportChange,
  bikeMounted = false,
  bikeSpeedPx = BIKE_SPEED_PX,
}: UsePlayerWalkOptions) {
  const [transportMode, setTransportMode] = useState<TransportMode>('idle');
  const [isMoving, setIsMoving] = useState(false);
  const segmentsRef = useRef<TravelSegment[]>([]);
  const pathRef = useRef<WorldPosition[]>([]);
  const pathIndexRef = useRef(0);
  const segmentIndexRef = useRef(0);
  const modeRef = useRef<TransportMode>('walking');
  const rafRef = useRef<number>(0);
  const posRef = useRef(position);
  const arrivalCallbackRef = useRef<(() => void) | null>(null);
  const bikeSpeedRef = useRef(bikeSpeedPx);

  posRef.current = position;
  bikeSpeedRef.current = bikeSpeedPx;

  const setMode = (m: TransportMode) => {
    modeRef.current = m;
    setTransportMode(m);
    onTransportChange?.(m);
  };

  const stepAlongPath = useCallback(() => {
    const path = pathRef.current;
    const idx = pathIndexRef.current;
    if (idx >= path.length - 1) {
      const nextSeg = segmentIndexRef.current + 1;
      if (nextSeg < segmentsRef.current.length) {
        segmentIndexRef.current = nextSeg;
        const seg = segmentsRef.current[nextSeg];
        pathRef.current = seg.path;
        pathIndexRef.current = 0;
        setMode(seg.mode === 'boat' ? 'boat' : bikeMounted ? 'bicycle' : 'walking');
        rafRef.current = requestAnimationFrame(stepAlongPath);
        return;
      }
      setIsMoving(false);
      setMode('idle');
      onArrive(posRef.current);
      const cb = arrivalCallbackRef.current;
      arrivalCallbackRef.current = null;
      cb?.();
      return;
    }

    const current = posRef.current;
    const next = path[idx + 1];
    const speed =
      modeRef.current === 'boat'
        ? BOAT_SPEED_PX
        : modeRef.current === 'bicycle'
          ? bikeSpeedRef.current
          : WALK_SPEED_PX;
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= speed) {
      onPositionChange(next);
      pathIndexRef.current = idx + 1;
    } else {
      onPositionChange({
        x: current.x + (dx / dist) * speed,
        y: current.y + (dy / dist) * speed,
      });
    }

    rafRef.current = requestAnimationFrame(stepAlongPath);
  }, [onArrive, onPositionChange, bikeMounted]);

  const walkTo = useCallback(
    (target: WorldPosition, options?: { onArrive?: () => void }) => {
      cancelAnimationFrame(rafRef.current);
      arrivalCallbackRef.current = options?.onArrive ?? null;
      const plan = bikeMounted
        ? planLandOnlyTravel(posRef.current, target)
        : planTravel(posRef.current, target);
      if (!plan?.length) return false;

      segmentsRef.current = plan;
      segmentIndexRef.current = 0;
      pathRef.current = plan[0].path;
      pathIndexRef.current = 0;
      setMode(plan[0].mode === 'boat' ? 'boat' : bikeMounted ? 'bicycle' : 'walking');
      setIsMoving(true);
      rafRef.current = requestAnimationFrame(stepAlongPath);
      return true;
    },
    [stepAlongPath, bikeMounted],
  );

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return { walkTo, isMoving, transportMode };
}
