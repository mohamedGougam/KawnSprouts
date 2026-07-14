import { useCallback, useEffect, useRef, useState } from 'react';

export const INTERIOR_WALK_SPEED = 2.6;

interface UseInteriorWalkOptions {
  initial: { x: number; y: number };
  onFootstep?: () => void;
}

export function useInteriorWalk({ initial, onFootstep }: UseInteriorWalkOptions) {
  const [position, setPosition] = useState(initial);
  const [isMoving, setIsMoving] = useState(false);
  const pathRef = useRef<{ x: number; y: number }[]>([]);
  const pathIndexRef = useRef(0);
  const rafRef = useRef(0);
  const posRef = useRef(initial);
  const stepCounterRef = useRef(0);

  posRef.current = position;

  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

  const step = useCallback(() => {
    const path = pathRef.current;
    const idx = pathIndexRef.current;
    if (idx >= path.length - 1) {
      setIsMoving(false);
      return;
    }

    const current = posRef.current;
    const next = path[idx + 1];
    const dx = next.x - current.x;
    const dy = next.y - current.y;
    const dist = Math.hypot(dx, dy);

    if (dist <= INTERIOR_WALK_SPEED) {
      setPosition(next);
      pathIndexRef.current = idx + 1;
      stepCounterRef.current += 1;
      if (stepCounterRef.current % 4 === 0) onFootstep?.();
    } else {
      setPosition({
        x: current.x + (dx / dist) * INTERIOR_WALK_SPEED,
        y: current.y + (dy / dist) * INTERIOR_WALK_SPEED,
      });
      stepCounterRef.current += 1;
      if (stepCounterRef.current % 6 === 0) onFootstep?.();
    }

    rafRef.current = requestAnimationFrame(step);
  }, [onFootstep]);

  const walkTo = useCallback(
    (target: { x: number; y: number }) => {
      cancelAnimationFrame(rafRef.current);
      const start = posRef.current;
      const clamped = {
        x: clamp(target.x, 8, 92),
        y: clamp(target.y, 22, 64),
      };
      pathRef.current = [start, clamped];
      pathIndexRef.current = 0;
      stepCounterRef.current = 0;
      setIsMoving(true);
      rafRef.current = requestAnimationFrame(step);
    },
    [clamp, step],
  );

  const resetPosition = useCallback((pos: { x: number; y: number }) => {
    cancelAnimationFrame(rafRef.current);
    setIsMoving(false);
    pathRef.current = [];
    setPosition(pos);
  }, []);

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  return { position, isMoving, walkTo, resetPosition };
}

/** Simple path for exiting — walk toward door */
export function walkInteriorToDoor(
  walkTo: (t: { x: number; y: number }) => void,
  door: { x: number; y: number },
) {
  walkTo({ x: door.x, y: door.y - 4 });
}
