import type { DecorationPlacement, GardenCell, GardenDecoration } from '../models';
import { GARDEN_GRID } from '../config/gameConfig';

export function cellsForPlacement(
  position: GardenCell,
  decoration: GardenDecoration,
): GardenCell[] {
  const cells: GardenCell[] = [];
  for (let dy = 0; dy < decoration.height; dy++) {
    for (let dx = 0; dx < decoration.width; dx++) {
      cells.push({ x: position.x + dx, y: position.y + dy });
    }
  }
  return cells;
}

export function isWithinBounds(cell: GardenCell, gridWidth: number, gridHeight: number): boolean {
  return cell.x >= 0 && cell.y >= 0 && cell.x < gridWidth && cell.y < gridHeight;
}

export function placementFits(
  position: GardenCell,
  decoration: GardenDecoration,
  gridWidth: number,
  gridHeight: number,
): boolean {
  return cellsForPlacement(position, decoration).every((c) =>
    isWithinBounds(c, gridWidth, gridHeight),
  );
}

export function placementsOverlap(
  a: DecorationPlacement,
  decA: GardenDecoration,
  b: DecorationPlacement,
  decB: GardenDecoration,
): boolean {
  const cellsA = cellsForPlacement(a.position, decA);
  const cellsB = cellsForPlacement(b.position, decB);
  return cellsA.some((ca) => cellsB.some((cb) => ca.x === cb.x && ca.y === cb.y));
}

export function canPlaceDecoration(
  position: GardenCell,
  decoration: GardenDecoration,
  placements: DecorationPlacement[],
  decorations: GardenDecoration[],
  excludePlacementId?: string,
): boolean {
  if (!placementFits(position, decoration, GARDEN_GRID.width, GARDEN_GRID.height)) {
    return false;
  }
  const newPlacement: DecorationPlacement = {
    id: 'temp',
    decorationId: decoration.id,
    position,
  };
  for (const existing of placements) {
    if (existing.id === excludePlacementId) continue;
    const existingDec = decorations.find((d) => d.id === existing.decorationId);
    if (!existingDec) continue;
    if (placementsOverlap(newPlacement, decoration, existing, existingDec)) {
      return false;
    }
  }
  return true;
}

export function getDecorationById(
  decorations: GardenDecoration[],
  id: string,
): GardenDecoration | undefined {
  return decorations.find((d) => d.id === id);
}
