import { WORLD_SCALE } from './worldConstants';

const sc = (x: number, y: number) => ({ x: Math.round(x * WORLD_SCALE), y: Math.round(y * WORLD_SCALE) });

export interface LandscapeRuin {
  id: string;
  position: { x: number; y: number };
  label: string;
  rotation?: number;
}

export interface HerbPatch {
  id: string;
  position: { x: number; y: number };
  type: 'clover' | 'lavender' | 'fern' | 'wildflower' | 'thyme';
  scale?: number;
}

export const LANDSCAPE_RUINS: LandscapeRuin[] = [
  { id: 'ruin-1', position: sc(260, 1420), label: 'Old stone cottage', rotation: -8 },
  { id: 'ruin-2', position: sc(1580, 950), label: 'Broken windmill', rotation: 12 },
  { id: 'ruin-3', position: sc(2050, 1680), label: 'Forgotten barn', rotation: -5 },
  { id: 'ruin-4', position: sc(720, 520), label: 'River watchtower', rotation: 6 },
  { id: 'ruin-5', position: sc(1100, 2100), label: 'Crumbling wall', rotation: 0 },
  { id: 'ruin-6', position: sc(1480, 1180), label: 'Collapsed shed', rotation: -14 },
  { id: 'ruin-7', position: sc(340, 1920), label: 'Mossy hut', rotation: 4 },
  { id: 'ruin-8', position: sc(1980, 820), label: 'Broken chimney', rotation: -10 },
];

export const HERB_PATCHES: HerbPatch[] = [
  { id: 'herb-1', position: sc(900, 1540), type: 'clover', scale: 1.2 },
  { id: 'herb-2', position: sc(950, 1580), type: 'clover' },
  { id: 'herb-3', position: sc(870, 1600), type: 'wildflower' },
  { id: 'herb-4', position: sc(1250, 1780), type: 'lavender', scale: 1.1 },
  { id: 'herb-5', position: sc(1300, 1810), type: 'lavender' },
  { id: 'herb-6', position: sc(400, 1650), type: 'fern' },
  { id: 'herb-7', position: sc(440, 1690), type: 'fern', scale: 0.9 },
  { id: 'herb-8', position: sc(1750, 1550), type: 'thyme' },
  { id: 'herb-9', position: sc(1800, 1580), type: 'wildflower' },
  { id: 'herb-10', position: sc(600, 1100), type: 'clover' },
  { id: 'herb-11', position: sc(1500, 2000), type: 'lavender' },
  { id: 'herb-12', position: sc(220, 1750), type: 'fern', scale: 1.3 },
  { id: 'herb-13', position: sc(1920, 1100), type: 'wildflower', scale: 1.2 },
  { id: 'herb-14', position: sc(1050, 1450), type: 'thyme' },
  { id: 'herb-15', position: sc(500, 850), type: 'clover' },
  { id: 'herb-16', position: sc(1180, 1700), type: 'wildflower', scale: 1.4 },
  { id: 'herb-17', position: sc(1220, 1740), type: 'lavender', scale: 1.3 },
  { id: 'herb-18', position: sc(820, 1480), type: 'thyme', scale: 1.2 },
  { id: 'herb-19', position: sc(1650, 1620), type: 'fern', scale: 1.25 },
  { id: 'herb-20', position: sc(280, 1320), type: 'clover', scale: 1.35 },
];
