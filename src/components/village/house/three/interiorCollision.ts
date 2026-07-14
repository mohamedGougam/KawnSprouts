import type { CollisionBox } from '../../../../config/interiorSceneConfig';

export function clampWalkTarget(
  x: number,
  z: number,
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number },
  collisions: CollisionBox[],
  excludeId?: string,
): { x: number; z: number } {
  let tx = Math.max(bounds.minX, Math.min(bounds.maxX, x));
  let tz = Math.max(bounds.minZ, Math.min(bounds.maxZ, z));

  for (const box of collisions) {
    if (excludeId && box.id === excludeId) continue;
    if (pointInBox(tx, tz, box)) {
      const dx = tx - box.x;
      const dz = tz - box.z;
      if (Math.abs(dx) / box.halfW > Math.abs(dz) / box.halfD) {
        tx = dx > 0 ? box.x + box.halfW + 0.08 : box.x - box.halfW - 0.08;
      } else {
        tz = dz > 0 ? box.z + box.halfD + 0.08 : box.z - box.halfD - 0.08;
      }
    }
  }

  return {
    x: Math.max(bounds.minX, Math.min(bounds.maxX, tx)),
    z: Math.max(bounds.minZ, Math.min(bounds.maxZ, tz)),
  };
}

function pointInBox(x: number, z: number, box: CollisionBox): boolean {
  return Math.abs(x - box.x) <= box.halfW && Math.abs(z - box.z) <= box.halfD;
}
