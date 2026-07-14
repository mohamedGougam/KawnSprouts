import type { WorldPosition } from '../models';
import {
  getTerrainGrid,
  tileToWorld,
  worldToTile,
  nearestWalkable,
  type TerrainTile,
} from './worldNavService';

type WalkMode = 'land' | 'water';

function tileCost(tile: TerrainTile, mode: WalkMode): number {
  if (mode === 'land') {
    if (tile === 'land') return 1;
    if (tile === 'bridge') return 1.2;
    return Infinity;
  }
  return tile === 'water' ? 1 : Infinity;
}

function heuristic(a: { col: number; row: number }, b: { col: number; row: number }) {
  return Math.hypot(a.col - b.col, a.row - b.row);
}

function findPathOnGrid(
  start: WorldPosition,
  end: WorldPosition,
  mode: WalkMode,
): WorldPosition[] | null {
  const grid = getTerrainGrid();
  const startTile = worldToTile(start);
  const endTile = worldToTile(end);

  const open: { col: number; row: number; f: number; g: number }[] = [];
  const cameFrom = new Map<string, { col: number; row: number }>();
  const gScore = new Map<string, number>();

  const key = (c: number, r: number) => `${c},${r}`;
  const startKey = key(startTile.col, startTile.row);

  gScore.set(startKey, 0);
  open.push({ ...startTile, f: heuristic(startTile, endTile), g: 0 });

  const dirs = [
    [0, 1], [1, 0], [0, -1], [-1, 0],
    [1, 1], [-1, 1], [1, -1], [-1, -1],
  ];

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift()!;
    if (current.col === endTile.col && current.row === endTile.row) {
      const path: WorldPosition[] = [];
      let c: { col: number; row: number } | undefined = current;
      while (c) {
        path.unshift(tileToWorld(c.col, c.row));
        c = cameFrom.get(key(c.col, c.row));
      }
      return path.length > 1 ? path : null;
    }

    for (const [dc, dr] of dirs) {
      const nc = current.col + dc;
      const nr = current.row + dr;
      const tile = grid[nr]?.[nc];
      if (!tile) continue;
      const cost = tileCost(tile, mode);
      if (cost === Infinity) continue;

      const tentative = (gScore.get(key(current.col, current.row)) ?? Infinity) + cost * (dc !== 0 && dr !== 0 ? 1.414 : 1);
      const nk = key(nc, nr);
      if (tentative < (gScore.get(nk) ?? Infinity)) {
        cameFrom.set(nk, { col: current.col, row: current.row });
        gScore.set(nk, tentative);
        const f = tentative + heuristic({ col: nc, row: nr }, endTile);
        if (!open.some((o) => o.col === nc && o.row === nr)) {
          open.push({ col: nc, row: nr, f, g: tentative });
        }
      }
    }
  }
  return null;
}

export interface TravelSegment {
  mode: 'walk' | 'boat';
  path: WorldPosition[];
}

/** Land-only travel (no boat segments) — used while riding a bicycle */
export function planLandOnlyTravel(start: WorldPosition, target: WorldPosition): TravelSegment[] | null {
  const walkStart = nearestWalkable(start) ?? start;
  const walkEnd = nearestWalkable(target) ?? target;
  const path = findPathOnGrid(walkStart, walkEnd, 'land');
  if (!path) return null;
  return [{ mode: 'walk', path }];
}

export function planTravel(start: WorldPosition, target: WorldPosition): TravelSegment[] | null {
  const walkStart = nearestWalkable(start) ?? start;
  const walkEnd = nearestWalkable(target) ?? target;

  const startTerrain = getTerrainGrid()[worldToTile(walkStart).row]?.[worldToTile(walkStart).col];
  const endTerrain = getTerrainGrid()[worldToTile(walkEnd).row]?.[worldToTile(walkEnd).col];

  const directLand = findPathOnGrid(walkStart, walkEnd, 'land');
  if (directLand) return [{ mode: 'walk', path: directLand }];

  if (startTerrain === 'water' || endTerrain === 'water') {
    const boatPath = findPathOnGrid(walkStart, walkEnd, 'water');
    if (boatPath) return [{ mode: 'boat', path: boatPath }];
  }

  return directLand ? [{ mode: 'walk', path: directLand }] : null;
}

export function findLandPath(start: WorldPosition, end: WorldPosition): WorldPosition[] | null {
  const s = nearestWalkable(start);
  const e = nearestWalkable(end);
  if (!s || !e) return null;
  return findPathOnGrid(s, e, 'land');
}
