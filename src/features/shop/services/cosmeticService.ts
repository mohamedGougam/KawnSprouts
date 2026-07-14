import type { EquippedCosmetics, EquippedVehicle } from '../models/shopTypes';
import { getShopItem } from '../data/shopCatalog';

export function resolveHatDisplay(cosmetics: EquippedCosmetics): string | null {
  const id = cosmetics.previewHatId ?? cosmetics.hatId;
  if (!id) return null;
  return getShopItem(id)?.hatAttachment?.emoji ?? getShopItem(id)?.thumbnail ?? null;
}

export function resolveHatAttachment(cosmetics: EquippedCosmetics) {
  const id = cosmetics.previewHatId ?? cosmetics.hatId;
  if (!id) return null;
  return getShopItem(id)?.hatAttachment ?? null;
}

export function equipHat(_cosmetics: EquippedCosmetics, hatId: string | null): EquippedCosmetics {
  return { hatId, previewHatId: null };
}

export function previewHat(cosmetics: EquippedCosmetics, hatId: string | null): EquippedCosmetics {
  return { ...cosmetics, previewHatId: hatId };
}

export function clearHatPreview(cosmetics: EquippedCosmetics): EquippedCosmetics {
  return { ...cosmetics, previewHatId: null };
}

export function equipVehicle(_vehicle: EquippedVehicle, vehicleId: string | null): EquippedVehicle {
  return { vehicleId, mounted: false };
}

export function equipAndMountVehicle(vehicleId: string): EquippedVehicle {
  return { vehicleId, mounted: true };
}

export function mountVehicle(vehicle: EquippedVehicle): EquippedVehicle {
  if (!vehicle.vehicleId) return vehicle;
  return { ...vehicle, mounted: true };
}

export function dismountVehicle(vehicle: EquippedVehicle): EquippedVehicle {
  return { ...vehicle, mounted: false };
}

export function getVehicleSpeedMultiplier(vehicleId: string | null): number {
  if (!vehicleId) return 1;
  return getShopItem(vehicleId)?.vehicleSpeedMultiplier ?? 1.55;
}

export function getVehicleEmoji(vehicleId: string | null): string | null {
  if (!vehicleId) return null;
  return getShopItem(vehicleId)?.thumbnail ?? '🚲';
}
