import type { InteriorProp, InteriorPropType } from '../../../config/interiorSceneConfig';
import type { FurniturePlacement } from '../models/shopTypes';
import { getShopItem } from '../data/shopCatalog';
import { generateId } from '../../../utils/gameUtils';

const FURNITURE_PROP_MAP: Record<string, InteriorPropType> = {
  bed: 'bed',
  lamp: 'lamp',
  rug: 'rug',
  table: 'table',
  shelf: 'shelf',
  plant: 'plant-floor',
  clock: 'clock',
  cushion: 'chest',
  window: 'window',
  lighting: 'lamp',
};

export function placementsToInteriorProps(placements: FurniturePlacement[]): InteriorProp[] {
  return placements.map((p) => {
    const item = getShopItem(p.itemId);
    const propKey = item?.furniturePropType;
    const mapped = propKey ? FURNITURE_PROP_MAP[propKey] : undefined;
    const type: InteriorPropType = mapped ?? 'plant-floor';
    return {
      id: `shop-${p.id}`,
      type,
      x: p.x,
      y: 0,
      z: p.z,
      rotation: p.rotation,
    };
  });
}

/** Default placement slots for player house (world units) */
export const PLACEMENT_SLOTS: { x: number; z: number; label: string }[] = [
  { x: -0.8, z: 0.5, label: 'Left corner' },
  { x: 0.6, z: -0.3, label: 'Center' },
  { x: 1.4, z: 0.8, label: 'Near door' },
  { x: -0.3, z: -0.8, label: 'Back area' },
];

export function addFurniturePlacement(
  placements: FurniturePlacement[],
  itemId: string,
  slotIndex = 0,
): FurniturePlacement[] {
  const occupied = new Set(placements.map((p) => `${p.x},${p.z}`));
  let idx = slotIndex;
  let s = PLACEMENT_SLOTS[idx % PLACEMENT_SLOTS.length];
  while (occupied.has(`${s.x},${s.z}`) && idx < PLACEMENT_SLOTS.length + 4) {
    idx++;
    s = PLACEMENT_SLOTS[idx % PLACEMENT_SLOTS.length];
  }
  return [
    ...placements,
    { id: generateId('furn'), itemId, x: s.x, z: s.z, rotation: 0 },
  ];
}

export function removeFurniturePlacement(placements: FurniturePlacement[], id: string): FurniturePlacement[] {
  return placements.filter((p) => p.id !== id);
}

export function validatePlacement(
  placements: FurniturePlacement[],
  x: number,
  z: number,
  excludeId?: string,
): boolean {
  const minDist = 0.35;
  return !placements.some((p) => {
    if (p.id === excludeId) return false;
    return Math.hypot(p.x - x, p.z - z) < minDist;
  });
}
