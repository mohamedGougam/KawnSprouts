/**
 * Interior asset manifest — procedural R3F geometry placeholders.
 * Replace with licensed GLB/WebP layers when art pipeline is ready.
 *
 * License: All current interior meshes are original procedural geometry (CC0 / project-owned).
 * No third-party models shipped in this build.
 */

export type InteriorAssetType = 'mesh' | 'texture' | 'audio' | 'sprite';

export interface InteriorAssetEntry {
  id: string;
  type: InteriorAssetType;
  source: 'procedural' | string;
  license: string;
  attribution?: string;
  depthLayer: number;
  collision?: { halfW: number; halfD: number };
  soundId?: string;
  animationId?: string;
}

/** Design grid — world units (character height ≈ 0.75) */
export const INTERIOR_DESIGN_GRID = {
  roomWidth: 5.2,
  roomDepth: 4.4,
  characterHeight: 0.75,
  doorHeight: 1.05,
  bed: { w: 1.85, d: 1.05 },
  tableRadius: 0.42,
  rugRadius: 0.88,
  chair: { w: 0.48, d: 0.44 },
} as const;

export const ADAM_HOUSE_MANIFEST: InteriorAssetEntry[] = [
  { id: 'shell-floor', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 0 },
  { id: 'shell-walls', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 1 },
  { id: 'shell-roof', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 2 },
  { id: 'bed', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 3, collision: { halfW: 0.95, halfD: 0.55 }, soundId: 'cushion', animationId: 'blanket-fluff' },
  { id: 'nightstand', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 3, collision: { halfW: 0.28, halfD: 0.22 }, soundId: 'wood-knock' },
  { id: 'lamp', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 4, soundId: 'chime-soft', animationId: 'lamp-glow' },
  { id: 'rug', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 2, soundId: 'cushion', animationId: 'rug-ripple' },
  { id: 'table', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 3, collision: { halfW: 0.42, halfD: 0.42 }, soundId: 'wood-knock' },
  { id: 'chair', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 3, collision: { halfW: 0.28, halfD: 0.28 }, soundId: 'wood-bounce' },
  { id: 'door', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 4, collision: { halfW: 0.35, halfD: 0.2 }, soundId: 'door-creak', animationId: 'door-swing' },
  { id: 'window', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 5, soundId: 'wind-window', animationId: 'curtain-sway' },
  { id: 'shelf', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 5, collision: { halfW: 0.75, halfD: 0.18 }, soundId: 'page-turn' },
  { id: 'clock', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 5, soundId: 'clock-tick' },
  { id: 'plant', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 3, soundId: 'leaf-rustle' },
  { id: 'teacup', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 4, soundId: 'steam' },
  { id: 'book', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 4, soundId: 'page-turn' },
  { id: 'painting', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 5, soundId: 'wood-knock' },
  { id: 'chest', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 3, collision: { halfW: 0.3, halfD: 0.22 }, soundId: 'wood-knock' },
  { id: 'teddy', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 5, soundId: 'cushion' },
  { id: 'heart-note', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 5, soundId: 'chime-soft' },
  { id: 'slippers', type: 'mesh', source: 'procedural', license: 'CC0', depthLayer: 2 },
  { id: 'floor-texture', type: 'texture', source: 'procedural-canvas', license: 'CC0', depthLayer: 0 },
  { id: 'indoor-ambience', type: 'audio', source: 'procedural-web-audio', license: 'CC0', depthLayer: 0 },
];

export function getInteriorManifest(houseId: string): InteriorAssetEntry[] {
  if (houseId === 'house-adam') return ADAM_HOUSE_MANIFEST;
  return ADAM_HOUSE_MANIFEST.filter((a) => !['teddy', 'heart-note', 'slippers'].includes(a.id));
}
