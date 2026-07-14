/**
 * Interior scene configuration — data-driven room layouts.
 * Art direction: warm woodland dollhouse (reference-guided, original assets).
 * Graphics: procedural stylized 3D via React Three Fiber (Option A).
 */

export type InteriorPropType =
  | 'bed'
  | 'nightstand'
  | 'lamp'
  | 'rug'
  | 'table'
  | 'chair'
  | 'teacup'
  | 'book'
  | 'vase'
  | 'window'
  | 'door'
  | 'shelf'
  | 'clock'
  | 'painting'
  | 'plant'
  | 'plant-floor'
  | 'chest'
  | 'slippers'
  | 'heart-note'
  | 'teddy'
  | 'doormat'
  | 'shop';

export interface InteriorProp {
  id: string;
  type: InteriorPropType;
  x: number;
  y: number;
  z: number;
  rotation?: number;
  scale?: number;
}

export interface CollisionBox {
  id: string;
  x: number;
  z: number;
  halfW: number;
  halfD: number;
}

export interface InteriorTheme {
  wallColor: string;
  floorColor: string;
  trimColor: string;
  accentColor: string;
  rugColor: string;
  fabricColor: string;
  roofColor: string;
}

export interface InteriorSceneConfig {
  houseId: string;
  ownerId: string;
  ownerName: string;
  theme: InteriorTheme;
  props: InteriorProp[];
  collisions: CollisionBox[];
  npcStart: { x: number; z: number };
  playerStart: { x: number; z: number };
  walkBounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}

/** Adam's bear den — primary quality target */
export const ADAM_HOUSE_SCENE: InteriorSceneConfig = {
  houseId: 'house-adam',
  ownerId: 'adam',
  ownerName: 'Adam',
  theme: {
    wallColor: '#f5e6c8',
    floorColor: '#8b5e3c',
    trimColor: '#5c3d2e',
    accentColor: '#c2410c',
    rugColor: '#e07a5f',
    fabricColor: '#6b9080',
    roofColor: '#a16207',
  },
  playerStart: { x: 1.8, z: 1.4 },
  npcStart: { x: 0.5, z: 0.1 },
  walkBounds: { minX: -2.4, maxX: 2.4, minZ: -1.8, maxZ: 2.0 },
  collisions: [
    { id: 'bed', x: -2.0, z: -0.9, halfW: 0.95, halfD: 0.55 },
    { id: 'nightstand', x: -1.15, z: -1.15, halfW: 0.28, halfD: 0.22 },
    { id: 'table', x: 0.35, z: 0.15, halfW: 0.42, halfD: 0.42 },
    { id: 'chair', x: 1.15, z: 0.25, halfW: 0.28, halfD: 0.28 },
    { id: 'shelf', x: 0, z: -1.65, halfW: 0.75, halfD: 0.18 },
    { id: 'door', x: 2.15, z: 0.75, halfW: 0.35, halfD: 0.2 },
    { id: 'plant-r', x: 2.0, z: -0.5, halfW: 0.22, halfD: 0.22 },
    { id: 'chest', x: 2.0, z: -1.2, halfW: 0.3, halfD: 0.22 },
  ],
  props: [
    /* LEFT — sleep zone */
    { id: 'bed', type: 'bed', x: -2.0, y: 0, z: -0.9 },
    { id: 'nightstand', type: 'nightstand', x: -1.15, y: 0, z: -1.15 },
    { id: 'lamp', type: 'lamp', x: -1.15, y: 0.42, z: -1.15 },
    { id: 'clock-bed', type: 'clock', x: -0.88, y: 0.44, z: -1.08, scale: 0.45 },
    { id: 'window', type: 'window', x: -2.55, y: 1.35, z: -0.5, rotation: Math.PI / 2 },
    { id: 'slippers', type: 'slippers', x: -1.6, y: 0, z: -0.35 },
    /* CENTER — living */
    { id: 'rug', type: 'rug', x: 0.3, y: 0.01, z: 0.1 },
    { id: 'table', type: 'table', x: 0.35, y: 0, z: 0.15 },
    { id: 'chair', type: 'chair', x: 1.15, y: 0, z: 0.25 },
    { id: 'teacup', type: 'teacup', x: 0.35, y: 0.38, z: 0.1 },
    { id: 'book', type: 'book', x: 0.5, y: 0.36, z: 0.2 },
    { id: 'vase', type: 'vase', x: 0.2, y: 0.36, z: 0.22 },
    /* BACK wall */
    { id: 'shelf', type: 'shelf', x: 0, y: 1.05, z: -2.05 },
    { id: 'clock', type: 'clock', x: 1.1, y: 1.35, z: -2.0 },
    { id: 'painting', type: 'painting', x: -0.9, y: 1.25, z: -2.0 },
    { id: 'heart-note', type: 'heart-note', x: 0.55, y: 1.15, z: -1.98 },
    { id: 'teddy', type: 'teddy', x: -0.35, y: 0.95, z: -1.95 },
    /* RIGHT — entry */
    { id: 'door', type: 'door', x: 2.15, y: 0, z: 0.75 },
    { id: 'doormat', type: 'doormat', x: 1.85, y: 0.01, z: 1.1 },
    { id: 'plant-r', type: 'plant-floor', x: 2.0, y: 0, z: -0.5 },
    { id: 'chest', type: 'chest', x: 2.0, y: 0, z: -1.2 },
    { id: 'plant-l', type: 'plant-floor', x: -0.5, y: 0, z: 0.9, scale: 0.9 },
  ],
};

/** Generic cozy layout for other houses (reuses diorama shell) */
export function getGenericCozyScene(
  houseId: string,
  ownerId: string,
  ownerName: string,
  theme: InteriorTheme,
): InteriorSceneConfig {
  return {
    ...ADAM_HOUSE_SCENE,
    houseId,
    ownerId,
    ownerName,
    theme,
    props: ADAM_HOUSE_SCENE.props.filter((p) => !['teddy', 'heart-note', 'slippers'].includes(p.type)),
  };
}

const THEME_MAP: Record<string, InteriorTheme> = {
  'house-player': {
    wallColor: '#fff7ed',
    floorColor: '#a67c52',
    trimColor: '#92400e',
    accentColor: '#f97316',
    rugColor: '#fb7185',
    fabricColor: '#93c5fd',
    roofColor: '#ea580c',
  },
  'house-lina': {
    wallColor: '#faf5ff',
    floorColor: '#9f7aea',
    trimColor: '#6d28d9',
    accentColor: '#a78bfa',
    rugColor: '#f0abfc',
    fabricColor: '#c4b5fd',
    roofColor: '#7c3aed',
  },
  'house-sami': {
    wallColor: '#f0f9ff',
    floorColor: '#7dd3fc',
    trimColor: '#0369a1',
    accentColor: '#38bdf8',
    rugColor: '#bae6fd',
    fabricColor: '#e0f2fe',
    roofColor: '#0284c7',
  },
  'house-noor': {
    wallColor: '#eef2ff',
    floorColor: '#818cf8',
    trimColor: '#4338ca',
    accentColor: '#6366f1',
    rugColor: '#a5b4fc',
    fabricColor: '#c7d2fe',
    roofColor: '#4f46e5',
  },
  'house-community': {
    wallColor: '#fdf2f8',
    floorColor: '#f9a8d4',
    trimColor: '#be185d',
    accentColor: '#ec4899',
    rugColor: '#fbcfe8',
    fabricColor: '#fce7f3',
    roofColor: '#db2777',
  },
};

export function getInteriorSceneConfig(houseId: string, ownerId: string, ownerName: string): InteriorSceneConfig {
  if (houseId === 'house-adam') return ADAM_HOUSE_SCENE;
  const theme = THEME_MAP[houseId] ?? THEME_MAP['house-player'];
  return getGenericCozyScene(houseId, ownerId, ownerName, theme);
}
