import { CHUNK_SIZE, CHUNK_LOAD_MARGIN } from '../config/worldConstants';
import type { WorldPosition } from '../models';

export function chunkKey(cx: number, cy: number) {
  return `${cx},${cy}`;
}

export function posToChunk(pos: WorldPosition) {
  return {
    cx: Math.floor(pos.x / CHUNK_SIZE),
    cy: Math.floor(pos.y / CHUNK_SIZE),
  };
}

export function getVisibleChunks(cameraX: number, cameraY: number, vw: number, vh: number, zoom: number) {
  const worldLeft = cameraX;
  const worldTop = cameraY;
  const worldRight = cameraX + vw / zoom;
  const worldBottom = cameraY + vh / zoom;

  const minCx = Math.floor(worldLeft / CHUNK_SIZE) - CHUNK_LOAD_MARGIN;
  const maxCx = Math.floor(worldRight / CHUNK_SIZE) + CHUNK_LOAD_MARGIN;
  const minCy = Math.floor(worldTop / CHUNK_SIZE) - CHUNK_LOAD_MARGIN;
  const maxCy = Math.floor(worldBottom / CHUNK_SIZE) + CHUNK_LOAD_MARGIN;

  const chunks: string[] = [];
  for (let cx = minCx; cx <= maxCx; cx++) {
    for (let cy = minCy; cy <= maxCy; cy++) {
      if (cx >= 0 && cy >= 0) chunks.push(chunkKey(cx, cy));
    }
  }
  return new Set(chunks);
}

export function isInVisibleChunks(pos: WorldPosition, visible: Set<string>) {
  const { cx, cy } = posToChunk(pos);
  return visible.has(chunkKey(cx, cy));
}

export function chunkOpacity(cx: number, cy: number, cameraX: number, cameraY: number, vw: number, vh: number, zoom: number) {
  const chunkLeft = cx * CHUNK_SIZE;
  const chunkTop = cy * CHUNK_SIZE;
  const chunkRight = chunkLeft + CHUNK_SIZE;
  const chunkBottom = chunkTop + CHUNK_SIZE;

  const viewLeft = cameraX;
  const viewTop = cameraY;
  const viewRight = cameraX + vw / zoom;
  const viewBottom = cameraY + vh / zoom;

  const overlap =
    Math.max(0, Math.min(chunkRight, viewRight) - Math.max(chunkLeft, viewLeft)) *
    Math.max(0, Math.min(chunkBottom, viewBottom) - Math.max(chunkTop, viewTop));
  const chunkArea = CHUNK_SIZE * CHUNK_SIZE;
  const ratio = overlap / chunkArea;
  return Math.min(1, Math.max(0.15, ratio * 1.5));
}
