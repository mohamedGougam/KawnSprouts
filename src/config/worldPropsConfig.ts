import type { WorldPosition } from '../models';

export type ScatterPropType =
  | 'flower'
  | 'mushroom'
  | 'pebble'
  | 'stick'
  | 'leaf'
  | 'fence'
  | 'nest'
  | 'watering-can'
  | 'log'
  | 'sign'
  | 'lantern'
  | 'bush'
  | 'reed'
  | 'lilypad';

export interface ScatterProp {
  id: string;
  type: ScatterPropType;
  position: WorldPosition;
  rotation?: number;
  scale?: number;
  layer: 'foreground' | 'midground';
}

export interface SecretDiscovery {
  id: string;
  position: WorldPosition;
  radius: number;
  icon: string;
  reveal: string;
  sound: string;
  particle?: 'fairy' | 'firefly' | 'bee' | 'ladybug' | 'rainbow' | 'crow' | 'cat';
}

export interface DepthTree {
  id: string;
  position: WorldPosition;
  scale?: number;
}

export interface WaterFeature {
  id: string;
  position: WorldPosition;
  width: number;
  height: number;
  type: 'ripple' | 'lilypad' | 'reed' | 'sparkle';
}

function scatter(
  base: Omit<ScatterProp, 'id'>[],
  prefix: string,
): ScatterProp[] {
  return base.map((p, i) => ({ ...p, id: `${prefix}-${i}` }));
}

export const DEPTH_TREES: DepthTree[] = [
  { id: 'dt-1', position: { x: 1050, y: 2480 }, scale: 1.2 },
  { id: 'dt-2', position: { x: 1980, y: 2340 }, scale: 1.4 },
  { id: 'dt-3', position: { x: 540, y: 2580 }, scale: 1.1 },
  { id: 'dt-4', position: { x: 1620, y: 2100 }, scale: 1.3 },
  { id: 'dt-5', position: { x: 2280, y: 1920 }, scale: 1.0 },
  { id: 'dt-6', position: { x: 780, y: 2220 }, scale: 1.15 },
];

export const SCATTER_PROPS: ScatterProp[] = scatter(
  [
    { type: 'flower', position: { x: 1720, y: 2550 }, layer: 'foreground', scale: 0.9 },
    { type: 'flower', position: { x: 1755, y: 2570 }, layer: 'foreground' },
    { type: 'mushroom', position: { x: 720, y: 2730 }, layer: 'foreground' },
    { type: 'pebble', position: { x: 1850, y: 2620 }, layer: 'midground' },
    { type: 'stick', position: { x: 1100, y: 2700 }, rotation: 25, layer: 'midground' },
    { type: 'leaf', position: { x: 1420, y: 2680 }, layer: 'foreground' },
    { type: 'fence', position: { x: 1680, y: 2640 }, layer: 'midground' },
    { type: 'nest', position: { x: 510, y: 2280 }, layer: 'midground' },
    { type: 'watering-can', position: { x: 1860, y: 2580 }, layer: 'midground' },
    { type: 'log', position: { x: 390, y: 2640 }, layer: 'midground', scale: 1.1 },
    { type: 'sign', position: { x: 1560, y: 2520 }, layer: 'midground' },
    { type: 'lantern', position: { x: 1770, y: 2490 }, layer: 'foreground' },
    { type: 'bush', position: { x: 1320, y: 2760 }, layer: 'foreground', scale: 1.2 },
    { type: 'reed', position: { x: 450, y: 1260 }, layer: 'foreground' },
    { type: 'lilypad', position: { x: 510, y: 1320 }, layer: 'foreground' },
    { type: 'flower', position: { x: 2100, y: 2100 }, layer: 'foreground' },
    { type: 'flower', position: { x: 2130, y: 2120 }, layer: 'foreground' },
    { type: 'mushroom', position: { x: 900, y: 2760 }, layer: 'foreground' },
    { type: 'pebble', position: { x: 2400, y: 2400 }, layer: 'midground' },
    { type: 'bush', position: { x: 2700, y: 1800 }, layer: 'foreground' },
    { type: 'lantern', position: { x: 1800, y: 2220 }, layer: 'foreground' },
    { type: 'reed', position: { x: 420, y: 1380 }, layer: 'foreground' },
    { type: 'lilypad', position: { x: 570, y: 1410 }, layer: 'foreground' },
    { type: 'flower', position: { x: 2550, y: 2550 }, layer: 'foreground' },
    { type: 'leaf', position: { x: 1200, y: 2820 }, layer: 'foreground' },
    { type: 'stick', position: { x: 600, y: 2850 }, rotation: -15, layer: 'midground' },
    { type: 'fence', position: { x: 2040, y: 2700 }, layer: 'midground' },
    { type: 'log', position: { x: 2880, y: 2100 }, layer: 'midground' },
    { type: 'nest', position: { x: 2340, y: 1680 }, layer: 'midground' },
    { type: 'watering-can', position: { x: 1740, y: 2760 }, layer: 'midground' },
  ],
  'scatter',
);

export const SECRET_DISCOVERIES: SecretDiscovery[] = [
  { id: 'secret-mushroom', position: { x: 720, y: 2730 }, radius: 40, icon: '🍄', reveal: 'A tiny fairy waves hello!', sound: 'bloom', particle: 'fairy' },
  { id: 'secret-stump', position: { x: 390, y: 2640 }, radius: 45, icon: '🪵', reveal: 'A ladybug crawls out to say hi.', sound: 'rustle', particle: 'ladybug' },
  { id: 'secret-mailbox', position: { x: 1830, y: 2610 }, radius: 35, icon: '📬', reveal: 'A kind letter flutters out.', sound: 'wood-click' },
  { id: 'secret-lantern', position: { x: 1770, y: 2490 }, radius: 40, icon: '🏮', reveal: 'Fireflies swirl around you.', sound: 'chime', particle: 'firefly' },
  { id: 'secret-well', position: { x: 1920, y: 2460 }, radius: 50, icon: '⛲', reveal: 'Your voice echoes softly… hello… hello…', sound: 'echo' },
  { id: 'secret-flower', position: { x: 2100, y: 2100 }, radius: 35, icon: '🌸', reveal: 'A busy bee comes to visit!', sound: 'buzz', particle: 'bee' },
  { id: 'secret-cloud', position: { x: 2700, y: 400 }, radius: 80, icon: '☁️', reveal: 'A rainbow shimmers across the sky!', sound: 'chime', particle: 'rainbow' },
  { id: 'secret-frog', position: { x: 570, y: 1410 }, radius: 35, icon: '🐸', reveal: 'Ribbit! The frog hops away.', sound: 'croak' },
  { id: 'secret-scarecrow', position: { x: 2550, y: 2280 }, radius: 45, icon: '🌾', reveal: 'A crow lands and caws hello.', sound: 'chirp', particle: 'crow' },
  { id: 'secret-chimney', position: { x: 1800, y: 2625 }, radius: 50, icon: '🏠', reveal: 'A cat peeks out and waves a paw.', sound: 'wood-click', particle: 'cat' },
];

export const WATER_FEATURES: WaterFeature[] = [
  { id: 'wf-1', position: { x: 150, y: 525 }, width: 1125, height: 1650, type: 'ripple' },
  { id: 'wf-2', position: { x: 510, y: 1320 }, width: 60, height: 60, type: 'lilypad' },
  { id: 'wf-3', position: { x: 570, y: 1410 }, width: 50, height: 50, type: 'lilypad' },
  { id: 'wf-4', position: { x: 450, y: 1260 }, width: 30, height: 80, type: 'reed' },
  { id: 'wf-5', position: { x: 1275, y: 600 }, width: 750, height: 750, type: 'ripple' },
  { id: 'wf-6', position: { x: 480, y: 900 }, width: 40, height: 40, type: 'sparkle' },
];
