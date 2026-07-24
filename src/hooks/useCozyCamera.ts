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
  const panOffsetRef = useRef({ x: 0, y: 0 });
  const singlePanRef = useRef<{ x: number; y: number; active: boolean } | null>(null);
  const pointerPanRef = useRef<{ x: number; y: number; active: boolean; pointerId: number } | null>(null);
  const tapBlockedRef = useRef(false);

  const cameraRef = useRef<CameraState>({
    x: playerPos?.x ?? 1800,
    y: playerPos?.y ?? 2400,
    zoom: COZY_CAMERA_ZOOM,
  });
  const velocityRef = useRef({ x: 0, y: 0 });
  const prevPlayerRef = useRef(playerPos ?? { x: 1800, y: 2400 });
  const rafRef = useRef<number>(0);
  const [camera, setCamera] = useState<CameraState>(cameraRef.current);

  zoomRef.current = zoom;

  const clampZoom = (z: number) => Math.min(CAMERA_ZOOM_MAX, Math.max(CAMERA_ZOOM_MIN, z));
  const zoomIn = useCallback(() => setZoom((z) => clampZoom(z + ZOOM_STEP)), []);
  const zoomOut = useCallback(() => setZoom((z) => clampZoom(z - ZOOM_STEP)), []);
  const resetZoom = useCallback(() => setZoom(COZY_CAMERA_ZOOM), []);

  const resetPan = useCallback(() => {
    panOffsetRef.current = { x: 0, y: 0 };
  }, []);

  const consumeTapBlock = useCallback(() => {
    if (!tapBlockedRef.current) return false;
    tapBlockedRef.current = false;
    return true;
  }, []);

  const applyPanDelta = useCallback((dx: number, dy: number) => {
    panOffsetRef.current.x -= dx / zoomRef.current;
    panOffsetRef.current.y -= dy / zoomRef.current;
  }, []);

  const tick = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const cam = cameraRef.current;

    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const currentZoom = zoomRef.current;
    const safePos = playerPos ?? { x: 1800, y: 2400 };
    const prevPos = prevPlayerRef.current ?? safePos;

    const dx = safePos.x - prevPos.x;
    const dy = safePos.y - prevPos.y;
    velocityRef.current = { x: dx, y: dy };
    prevPlayerRef.current = safePos;

    const lag = isMoving ? CAMERA_FOLLOW_LAG : CAMERA_SETTLE_LAG;
    const targetX =
      safePos.x -
      vw / (2 * currentZoom) +
      panOffsetRef.current.x +
      (isMoving ? velocityRef.current.x * CAMERA_ANTICIPATION * 0.02 : 0);
    const targetY =
      safePos.y -
      vh / (2 * currentZoom) +
      CAMERA_VERTICAL_OFFSET / currentZoom +
      panOffsetRef.current.y +
      (isMoving ? velocityRef.current.y * CAMERA_ANTICIPATION * 0.02 : 0);

    const maxX = Math.max(0, WORLD_SIZE - vw / currentZoom);
    const maxY = Math.max(0, WORLD_SIZE - vh / currentZoom);

    const targetClampedX = Math.max(0, Math.min(maxX, targetX));
    const targetClampedY = Math.max(0, Math.min(maxY, targetY));

    const newX = cam.x + (targetClampedX - cam.x) * lag;
    const newY = cam.y + (targetClampedY - cam.y) * lag;

    const diffX = Math.abs(newX - cam.x);
    const diffY = Math.abs(newY - cam.y);
    const diffZoom = Math.abs(currentZoom - cam.zoom);

    if (diffX > 0.05 || diffY > 0.05 || diffZoom > 0.001) {
      cam.x = newX;
      cam.y = newY;
      cam.zoom = currentZoom;
      setCamera({ x: newX, y: newY, zoom: currentZoom });
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [playerPos, isMoving, viewportRef]);

  useEffect(() => {
    if (isMoving) resetPan();
  }, [isMoving, resetPan]);

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick]);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        singlePanRef.current = null;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchRef.current = { dist: Math.hypot(dx, dy), zoom: zoomRef.current };
        return;
      }
      if (e.touches.length === 1) {
        singlePanRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          active: false,
        };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && pinchRef.current) {
        e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const scale = dist / pinchRef.current.dist;
        setZoom(clampZoom(pinchRef.current.zoom * scale));
        return;
      }
      const pan = singlePanRef.current;
      if (e.touches.length !== 1 || !pan) return;
      const t = e.touches[0];
      const dx = t.clientX - pan.x;
      const dy = t.clientY - pan.y;
      if (!pan.active && Math.hypot(dx, dy) < 10) return;
      if (!pan.active) {
        pan.active = true;
        tapBlockedRef.current = true;
      }
      e.preventDefault();
      applyPanDelta(dx, dy);
      pan.x = t.clientX;
      pan.y = t.clientY;
    };

    const onTouchEnd = () => {
      pinchRef.current = null;
      singlePanRef.current = null;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      pointerPanRef.current = {
        x: e.clientX,
        y: e.clientY,
        active: false,
        pointerId: e.pointerId,
      };
    };

    const onPointerMove = (e: PointerEvent) => {
      const pan = pointerPanRef.current;
      if (!pan || e.pointerId !== pan.pointerId) return;
      const dx = e.clientX - pan.x;
      const dy = e.clientY - pan.y;
      if (!pan.active && Math.hypot(dx, dy) < 8) return;
      if (!pan.active) {
        pan.active = true;
        tapBlockedRef.current = true;
      }
      e.preventDefault();
      applyPanDelta(dx, dy);
      pan.x = e.clientX;
      pan.y = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      if (pointerPanRef.current?.pointerId === e.pointerId) {
        pointerPanRef.current = null;
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      e.preventDefault();
      setZoom((z) => clampZoom(z + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP)));
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('pointerdown', onPointerDown);
    el.addEventListener('pointermove', onPointerMove);
    el.addEventListener('pointerup', onPointerUp);
    el.addEventListener('pointercancel', onPointerUp);
    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      el.removeEventListener('wheel', onWheel);
    };
  }, [viewportRef, applyPanDelta]);

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
    resetPan,
    consumeTapBlock,
    labelScale: 1 / zoom,
  };
}
