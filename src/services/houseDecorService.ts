import type { InteriorProp } from '../config/interiorSceneConfig';

/** Base props that only appear after buying the matching cottage-shop item */
const GATED_PROP_ITEMS: Record<string, string> = {
  rug: 'woven-rug',
  painting: 'sun-painting',
  vase: 'flower-vase',
  shelf: 'bookshelf',
};

/** Extra props added when cottage-shop items are owned */
export function buildHouseInteriorProps(
  baseProps: InteriorProp[],
  ownedItemIds: string[],
): InteriorProp[] {
  if (!ownedItemIds.length) {
    return baseProps.filter((p) => !GATED_PROP_ITEMS[p.id]);
  }

  const owned = new Set(ownedItemIds);
  const props = baseProps.filter((p) => {
    const required = GATED_PROP_ITEMS[p.id];
    return !required || owned.has(required);
  });

  const extra: InteriorProp[] = [];

  const extraChairs = ownedItemIds.filter((id) => id === 'extra-chair').length;
  for (let i = 0; i < extraChairs; i++) {
    extra.push({
      id: `owned-chair-${i}`,
      type: 'chair',
      x: 0.55 + i * 0.32,
      y: 0,
      z: 0.48 + i * 0.08,
    });
  }

  if (owned.has('wind-chime')) {
    extra.push({ id: 'owned-wind-chime', type: 'heart-note', x: -2.35, y: 1.05, z: -0.42, scale: 0.75 });
  }

  if (owned.has('plush-cloud')) {
    extra.push({ id: 'owned-plush', type: 'teddy', x: -1.72, y: 0.44, z: -0.55, scale: 0.65 });
  }

  if (owned.has('lace-curtains')) {
    extra.push(
      { id: 'owned-curtain-l', type: 'curtain', x: -2.58, y: 1.05, z: -0.72 },
      { id: 'owned-curtain-r', type: 'curtain', x: -2.58, y: 1.05, z: -0.28 },
    );
  }

  if (owned.has('wooden-toy') && !owned.has('bookshelf')) {
    extra.push({ id: 'owned-toy', type: 'teddy', x: -0.35, y: 0.12, z: 0.85, scale: 0.55 });
  }

  return [...props, ...extra];
}

export function hasHouseOwnedItem(ownedItemIds: string[], itemId: string): boolean {
  return ownedItemIds.includes(itemId);
}
