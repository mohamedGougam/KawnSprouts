/** Preload cache for house interior definitions — lazy load on first visit */
const preloaded = new Set<string>();
const nearby = new Set<string>();

export function markHouseNearby(houseId: string): void {
  nearby.add(houseId);
}

export function preloadHouseInterior(houseId: string): void {
  if (preloaded.has(houseId)) return;
  preloaded.add(houseId);
  void import('../components/village/house/three/CozyHouseScene');
}

export function preloadNearbyHouses(houseIds: string[]): void {
  for (const id of houseIds) {
    if (nearby.has(id) || preloaded.has(id)) preloadHouseInterior(id);
  }
}

export function isHousePreloaded(houseId: string): boolean {
  return preloaded.has(houseId);
}

export function clearHousePreloadCache(): void {
  preloaded.clear();
  nearby.clear();
}
