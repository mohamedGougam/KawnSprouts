import { useCallback, useEffect, useRef, useState } from 'react';
import type { WorldPosition } from '../models';
import {
  CAMERA_ANTICIPATION,
  CAMERA_FOLLOW_LAG,
  CAMERA_SETTLE_LAG,
  CAMERA_VERTICAL_OFFSET,
  CAMERA_ZOOM_MAX,
  CAMERA_ZOOM_MIN,
  COZY_CAMERA_ZOOM,
  WORLD_SIZE,
} from '../config/worldConstants';

const ZOOM_STEP = 0.2;

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export function useCozyCamera(
  playerPos: WorldPosition,
  isMoving: boolean,
  viewportRef: React.RefObject<HTMLDivElement | null>,
) {
  const [zoom, setZoom] = useState(COZY_CAMERA_ZOOM);
  const zoomRef = useRef(COZY_CAMERA_ZOOM);
  const pinchRef = useRef<{ dist: number; zoom: number } | null>(null);

  const cameraRef = useRef<CameraState>({
    x: playerPos.x,
    y: playerPos.y,
    zoom: COZY_CAMERA_ZOOM,
  });
  const velocityRef = useRef({ x: 0, y: 0 });
  const prevPlayerRef = useRef(playerPos);
  const rafRef = useRef<number>(0);
  const [camera, setCamera] = useState<CameraState>(cameraRef.current);

  zoomRef.current = zoom;

  const clampZoom = (z: number) => Math.min(CAMERA_ZOOM_MAX, Math.max(CAMERA_ZOOM_MIN, z));
  const zoomIn = useCallback(() => setZoom((z) => clampZoom(z + ZOOM_STEP)), []);
  const zoomOut = useCallback(() => setZoom((z) => clampZoom(z - ZOOM_STEP)), []);
  const resetZoom = useCallback(() => setZoom(COZY_CAMERA_ZOOM), []);

  const tick = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const currentZoom = zoomRef.current;

    const dx = playerPos.x - prevPlayerRef.current.x;
    const dy = playerPos.y - prevPlayerRef.current.y;
    velocityRef.current = { x: dx, y: dy };
    prevPlayerRef.current = playerPos;

    const lag = isMoving ? CAMERA_FOLLOW_LAG : CAMERA_SETTLE_LAG;
    const targetX =
      playerPos.x -
      vw / (2 * currentZoom) +
      (isMoving ? velocityRef.current.x * CAMERA_ANTICIPATION * 0.02 : 0);
    const targetY =
      playerPos.y -
      vh / (2 * currentZoom) +
      CAMERA_VERTICAL_OFFSET / currentZoom +
      (isMoving ? velocityRef.current.y * CAMERA_ANTICIPATION * 0.02 : 0);

    const maxX = Math.max(0, WORLD_SIZE - vw / currentZoom);
    const maxY = Math.max(0, WORLD_SIZE - vh / currentZoom);

    const cam = cameraRef.current;
    cam.x += (Math.max(0, Math.min(maxX, targetX)) - cam.x) * lag;
    cam.y += (Math.max(0, Math.min(maxY, targetY)) - cam.y) * lag;
    cam.zoom = currentZoom;

    setCamera({ ...cam });
    rafRef.current = requestAnimationFrame(tick);
  }, [playerPos, isMoving, viewportRef]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchRef.current = { dist: Math.hypot(dx, dy), zoom: zoomRef.current };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !pinchRef.current) return;
      e.preventDefault();
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      const scale = dist / pinchRef.current.dist;
      setZoom(clampZoom(pinchRef.current.zoom * scale));
    };

    const onTouchEnd = () => {
      pinchRef.current = null;
    };

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => clampZoom(z + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)));
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('wheel', onWheel);
    };
  }, [viewportRef]);

  const screenToWorld = useCallback(
    (clientX: number, clientY: number, rect: DOMRect): WorldPosition => {
      const cam = cameraRef.current;
      return {
        x: (clientX - rect.left) / cam.zoom + cam.x,
        y: (clientY - rect.top) / cam.zoom + cam.y,
      };
    },
    [],
  );

  return {
    camera,
    screenToWorld,
    zoom,
    zoomIn,
    zoomOut,
    resetZoom,
    labelScale: 1 / zoom,
  };
}
