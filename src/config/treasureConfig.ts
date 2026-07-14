import type { WorldPosition } from '../models';
import { WORLD_SCALE } from './worldConstants';

const s = (x: number, y: number): WorldPosition => ({
  x: Math.round(x * WORLD_SCALE),
  y: Math.round(y * WORLD_SCALE),
});

export type TreasureType = 'diamond' | 'gold';

export interface WorldTreasure {
  id: string;
  type: TreasureType;
  position: WorldPosition;
  amount: number;
}

/** Collectibles hidden around the village — respawn daily */
export const WORLD_TREASURES: WorldTreasure[] = [
  { id: 'gem-1', type: 'diamond', position: s(920, 1560), amount: 1 },
  { id: 'gem-2', type: 'diamond', position: s(1280, 1640), amount: 1 },
  { id: 'gem-3', type: 'diamond', position: s(620, 920), amount: 1 },
  { id: 'gem-4', type: 'diamond', position: s(1680, 1280), amount: 1 },
  { id: 'gem-5', type: 'diamond', position: s(380, 1580), amount: 1 },
  { id: 'gem-6', type: 'diamond', position: s(1420, 1880), amount: 1 },
  { id: 'gem-7', type: 'diamond', position: s(1920, 420), amount: 1 },
  { id: 'gem-8', type: 'diamond', position: s(1050, 1450), amount: 1 },
  { id: 'gem-9', type: 'diamond', position: s(2100, 2100), amount: 1 },
  { id: 'gem-10', type: 'diamond', position: s(480, 1820), amount: 1 },
  { id: 'gold-1', type: 'gold', position: s(880, 1720), amount: 2 },
  { id: 'gold-2', type: 'gold', position: s(1350, 1820), amount: 2 },
  { id: 'gold-3', type: 'gold', position: s(540, 620), amount: 3 },
  { id: 'gold-4', type: 'gold', position: s(1750, 1550), amount: 2 },
  { id: 'gold-5', type: 'gold', position: s(1180, 1420), amount: 2 },
  { id: 'gold-6', type: 'gold', position: s(1620, 1980), amount: 3 },
  { id: 'gold-7', type: 'gold', position: s(800, 1100), amount: 2 },
  { id: 'gold-8', type: 'gold', position: s(2280, 1680), amount: 2 },
];

export const SHOP_UNLOCK_DIAMONDS = 10;
