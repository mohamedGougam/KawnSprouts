import { TILE_SIZE, WORLD_SIZE } from '../config/worldConstants';
import { VILLAGE_HOUSES, WORLD_OBJECTS, WORLD_REGIONS } from '../config/villageConfig';
import type { WorldPosition } from '../models';

export type TerrainTile = 'land' | 'water' | 'bridge' | 'blocked';

const COLS = Math.ceil(WORLD_SIZE / TILE_SIZE);
const ROWS = Math.ceil(WORLD_SIZE / TILE_SIZE);

let terrainGrid: TerrainTile[][] | null = null;

const BRIDGE_ZONES = [
  { x: 880, y: 1320, width: 180, height: 80 },
  { x: 900, y: 1350, width: 140, height: 60 },
];

const DOCK_ZONES = [
  { x: 850, y: 1290, width: 120, height: 90 },
  { x: 1750, y: 2550, width: 150, height: 100 },
];

function inRect(px: number, py: number, r: { x: number; y: number; width: number; height: number }) {
  return px >= r.x && px <= r.x + r.width && py >= r.y && py <= r.y + r.height;
}

function isWaterRegion(px: number, py: number): boolean {
  return WORLD_REGIONS.some(
    (reg) =>
      (reg.id === 'river' || reg.id === 'wetlands' || reg.id === 'lake') &&
      px >= reg.x &&
      px <= reg.x + reg.width &&
      py >= reg.y &&
      py <= reg.y + reg.height,
  );
}

function isBlocked(px: number, py: number): boolean {
  for (const house of VILLAGE_HOUSES) {
    if (Math.hypot(px - house.position.x, py - house.position.y) < 70) return true;
  }
  for (const obj of WORLD_OBJECTS) {
    if (obj.type === 'tree' && Math.hypot(px - obj.position.x, py - obj.position.y) < 45) return true;
    if (obj.type === 'rock' && Math.hypot(px - obj.position.x, py - obj.position.y) < 35) return true;
  }
  return false;
}

export function buildTerrainGrid(): TerrainTile[][] {
  const grid: TerrainTile[][] = [];
  for (let row = 0; row < ROWS; row++) {
    grid[row] = [];
    for (let col = 0; col < COLS; col++) {
      const px = col * TILE_SIZE + TILE_SIZE / 2;
      const py = row * TILE_SIZE + TILE_SIZE / 2;

      if (px < 60 || py < 60 || px > WORLD_SIZE - 60 || py > WORLD_SIZE - 60) {
        grid[row][col] = 'blocked';
        continue;
      }
      if (BRIDGE_ZONES.some((z) => inRect(px, py, z))) {
        grid[row][col] = 'bridge';
        continue;
      }
      if (isBlocked(px, py)) {
        grid[row][col] = 'blocked';
        continue;
      }
      if (isWaterRegion(px, py)) {
        grid[row][col] = 'water';
        continue;
      }
      grid[row][col] = 'land';
    }
  }
  return grid;
}

export function getTerrainGrid(): TerrainTile[][] {
  if (!terrainGrid) terrainGrid = buildTerrainGrid();
  return terrainGrid;
}

export function worldToTile(pos: WorldPosition): { col: number; row: number } {
  return {
    col: Math.floor(pos.x / TILE_SIZE),
    row: Math.floor(pos.y / TILE_SIZE),
  };
}

export function tileToWorld(col: number, row: number): WorldPosition {
  return {
    x: col * TILE_SIZE + TILE_SIZE / 2,
    y: row * TILE_SIZE + TILE_SIZE / 2,
  };
}

export function getTerrainAt(pos: WorldPosition): TerrainTile {
  const { col, row } = worldToTile(pos);
  const grid = getTerrainGrid();
  return grid[row]?.[col] ?? 'blocked';
}

export function isLandWalkable(pos: WorldPosition): boolean {
  const t = getTerrainAt(pos);
  return t === 'land' || t === 'bridge';
}

export function isWaterTile(pos: WorldPosition): boolean {
  return getTerrainAt(pos) === 'water';
}

export function isBoatNavigable(pos: WorldPosition): boolean {
  return getTerrainAt(pos) === 'water';
}

export function nearestWalkable(pos: WorldPosition, maxRadius = 8): WorldPosition | null {
  const { col, row } = worldToTile(pos);
  const grid = getTerrainGrid();
  for (let r = 0; r <= maxRadius; r++) {
    for (let dc = -r; dc <= r; dc++) {
      for (let dr = -r; dr <= r; dr++) {
        const nc = col + dc;
        const nr = row + dr;
        const tile = grid[nr]?.[nc];
        if (tile === 'land' || tile === 'bridge') return tileToWorld(nc, nr);
      }
    }
  }
  return null;
}

export function nearestWaterFromLand(pos: WorldPosition): WorldPosition | null {
  const { col, row } = worldToTile(pos);
  const grid = getTerrainGrid();
  for (let r = 1; r <= 6; r++) {
    for (let dc = -r; dc <= r; dc++) {
      for (let dr = -r; dr <= r; dr++) {
        const nc = col + dc;
        const nr = row + dr;
        if (grid[nr]?.[nc] === 'water') {
          const land = grid[row]?.[col];
          if (land === 'land' || land === 'bridge') return tileToWorld(nc, nr);
        }
      }
    }
  }
  return null;
}

export function getDockNear(pos: WorldPosition): WorldPosition | null {
  for (const dock of DOCK_ZONES) {
    const cx = dock.x + dock.width / 2;
    const cy = dock.y + dock.height / 2;
    if (Math.hypot(pos.x - cx, pos.y - cy) < 120) return { x: cx, y: cy };
  }
  return null;
}

export function depthZIndex(y: number, layer: 'bg' | 'mid' | 'fg' = 'mid'): number {
  const base = Math.floor(y);
  if (layer === 'bg') return base - 2000;
  if (layer === 'fg') return base + 5000;
  return base;
}
