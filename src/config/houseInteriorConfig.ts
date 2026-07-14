import type { VillageHouse } from '../models';
import type { WorldPosition } from '../models';

/** Room ids — architecture supports future rooms without implementing them all */
export type HouseRoomId = 'living-room' | 'kitchen' | 'bedroom' | 'garden' | 'basement' | 'attic';

export type HousePersonality =
  | 'cozy-cottage'
  | 'rabbit-garden'
  | 'bear-den'
  | 'bird-nest'
  | 'fox-study'
  | 'frog-pond'
  | 'owl-tower'
  | 'village-hall';

export type InteriorObjectKind =
  | 'window'
  | 'chair'
  | 'table'
  | 'bookshelf'
  | 'plant'
  | 'fireplace'
  | 'clock'
  | 'bed'
  | 'teacup'
  | 'door'
  | 'chest'
  | 'lamp'
  | 'rug'
  | 'painting'
  | 'vase'
  | 'shelf'
  | 'teapot'
  | 'shop';

export interface InteriorFurniture {
  id: string;
  kind: InteriorObjectKind;
  label: string;
  x: number;
  y: number;
  z?: number;
  rotation?: number;
  scale?: number;
  icon?: string;
}

export type NpcInteriorActivity =
  | 'read'
  | 'cook'
  | 'clean'
  | 'sit'
  | 'look-outside'
  | 'water-plant'
  | 'wave'
  | 'sleep'
  | 'drink-tea'
  | 'walk'
  | 'stretch';

export interface InteriorNpc {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  activities: NpcInteriorActivity[];
}

export interface HouseRoomDefinition {
  id: HouseRoomId;
  name: string;
  floorWidth: number;
  floorHeight: number;
  furniture: InteriorFurniture[];
  npcs: InteriorNpc[];
  /** Future door connections to other rooms */
  exits: { id: string; targetRoom: HouseRoomId; x: number; y: number }[];
}

export interface HouseInteriorDefinition {
  houseId: string;
  personality: HousePersonality;
  defaultRoom: HouseRoomId;
  rooms: Partial<Record<HouseRoomId, HouseRoomDefinition>> & { 'living-room': HouseRoomDefinition };
  accentColor: string;
  wallColor: string;
  floorColor: string;
}

export type HouseRandomEvent =
  | 'cat-on-chair'
  | 'butterfly-visit'
  | 'kettle-whistle'
  | 'bird-on-window'
  | 'resident-wave'
  | 'fireplace-crackle'
  | 'tiny-mouse';

export const HOUSE_PERSONALITY_MAP: Record<string, HousePersonality> = {
  'house-player': 'cozy-cottage',
  'house-lina': 'rabbit-garden',
  'house-sami': 'bird-nest',
  'house-noor': 'owl-tower',
  'house-adam': 'bear-den',
  'house-community': 'village-hall',
};

const BASE_LIVING: Omit<HouseRoomDefinition, 'furniture' | 'npcs'> = {
  id: 'living-room',
  name: 'Living room',
  floorWidth: 100,
  floorHeight: 72,
  exits: [{ id: 'main-door', targetRoom: 'living-room', x: 50, y: 68 }],
};

function room(
  furniture: InteriorFurniture[],
  npcs: InteriorNpc[] = [],
): HouseRoomDefinition {
  return { ...BASE_LIVING, furniture, npcs };
}

const COZY_COTTAGE = room(
  [
    /* Back wall decor */
    { id: 'painting', kind: 'painting', label: 'Picture frame', x: 50, y: 12 },
    { id: 'clock', kind: 'clock', label: 'Tiny clock', x: 68, y: 12 },
    { id: 'lamp', kind: 'lamp', label: 'Wall lamp', x: 32, y: 12 },
    /* Sleep zone — left */
    { id: 'bed', kind: 'bed', label: 'Cozy bed', x: 22, y: 32 },
    { id: 'chest', kind: 'chest', label: 'Wooden chest', x: 22, y: 48 },
    /* Reading zone — right */
    { id: 'bookshelf', kind: 'bookshelf', label: 'Bookshelf', x: 82, y: 34 },
    { id: 'shelf', kind: 'shelf', label: 'Shelves', x: 82, y: 20 },
    /* Center — dining */
    { id: 'rug', kind: 'rug', label: 'Round rug', x: 52, y: 46, scale: 1.15 },
    { id: 'table', kind: 'table', label: 'Round table', x: 52, y: 44 },
    { id: 'chair-1', kind: 'chair', label: 'Chair', x: 62, y: 48 },
    { id: 'teapot', kind: 'teapot', label: 'Teapot', x: 54, y: 42 },
    { id: 'teacup', kind: 'teacup', label: 'Tea cup', x: 58, y: 42 },
    { id: 'vase', kind: 'vase', label: 'Flower vase', x: 48, y: 42 },
    /* Accent */
    { id: 'plant', kind: 'plant', label: 'Potted plant', x: 38, y: 38 },
    { id: 'shop', kind: 'shop', label: 'Shop nook', x: 78, y: 52 },
  ],
  [],
);

const RABBIT_GARDEN = room(
  [
    { id: 'painting', kind: 'painting', label: 'Meadow art', x: 50, y: 12 },
    { id: 'clock', kind: 'clock', label: 'Clock', x: 68, y: 12 },
    { id: 'lamp', kind: 'lamp', label: 'Soft lamp', x: 32, y: 12 },
    { id: 'bed', kind: 'bed', label: 'Soft burrow bed', x: 22, y: 32 },
    { id: 'chest', kind: 'chest', label: 'Seed chest', x: 22, y: 48 },
    { id: 'plant', kind: 'plant', label: 'Carrot planter', x: 38, y: 38, icon: '🥕' },
    { id: 'plant-2', kind: 'plant', label: 'Wildflowers', x: 38, y: 22, icon: '🌼' },
    { id: 'bookshelf', kind: 'bookshelf', label: 'Seed books', x: 82, y: 34 },
    { id: 'rug', kind: 'rug', label: 'Flower rug', x: 52, y: 46, icon: '🌸', scale: 1.1 },
    { id: 'table', kind: 'table', label: 'Garden table', x: 52, y: 44 },
    { id: 'chair-1', kind: 'chair', label: 'Chair', x: 62, y: 48 },
    { id: 'vase', kind: 'vase', label: 'Daisy vase', x: 54, y: 42, icon: '🌼' },
    { id: 'teacup', kind: 'teacup', label: 'Herbal tea', x: 58, y: 42 },
  ],
  [{ id: 'lina', name: 'Lina', emoji: '🐰', x: 48, y: 40, activities: ['water-plant', 'sit', 'drink-tea', 'look-outside', 'wave'] }],
);

const BEAR_DEN = room(
  [
    { id: 'fireplace', kind: 'fireplace', label: 'Fireplace', x: 50, y: 14 },
    { id: 'painting', kind: 'painting', label: 'Forest frame', x: 68, y: 12 },
    { id: 'clock', kind: 'clock', label: 'Clock', x: 32, y: 12 },
    { id: 'bed', kind: 'bed', label: 'Big cozy bed', x: 22, y: 32 },
    { id: 'chest', kind: 'chest', label: 'Honey chest', x: 22, y: 48, icon: '🍯' },
    { id: 'plant', kind: 'plant', label: 'Pine sprig', x: 38, y: 38 },
    { id: 'bookshelf', kind: 'bookshelf', label: 'Woodcraft books', x: 82, y: 34 },
    { id: 'lamp', kind: 'lamp', label: 'Lantern', x: 82, y: 18 },
    { id: 'rug', kind: 'rug', label: 'Bear rug', x: 52, y: 46 },
    { id: 'table', kind: 'table', label: 'Wooden table', x: 54, y: 44 },
    { id: 'chair-1', kind: 'chair', label: 'Chair', x: 64, y: 48 },
    { id: 'teapot', kind: 'teapot', label: 'Honey tea', x: 54, y: 42 },
    { id: 'teacup', kind: 'teacup', label: 'Mug', x: 58, y: 42 },
  ],
  [{ id: 'adam', name: 'Adam', emoji: '🐻', x: 50, y: 38, activities: ['cook', 'stretch', 'sit', 'drink-tea', 'clean'] }],
);

const BIRD_NEST = room(
  [
    { id: 'painting', kind: 'painting', label: 'Sky painting', x: 50, y: 12 },
    { id: 'clock', kind: 'clock', label: 'Clock', x: 68, y: 12 },
    { id: 'shelf', kind: 'shelf', label: 'Music shelf', x: 32, y: 12, icon: '🎵' },
    { id: 'bed', kind: 'bed', label: 'Nest bed', x: 22, y: 32 },
    { id: 'lamp', kind: 'lamp', label: 'Glow lamp', x: 82, y: 18 },
    { id: 'bookshelf', kind: 'bookshelf', label: 'Song books', x: 82, y: 36 },
    { id: 'plant', kind: 'plant', label: 'Twig plant', x: 38, y: 38 },
    { id: 'rug', kind: 'rug', label: 'Feather rug', x: 52, y: 46, icon: '🪶' },
    { id: 'table', kind: 'table', label: 'Nest table', x: 52, y: 44 },
    { id: 'chair-1', kind: 'chair', label: 'Perch chair', x: 62, y: 48 },
    { id: 'vase', kind: 'vase', label: 'Feather vase', x: 54, y: 42 },
    { id: 'teacup', kind: 'teacup', label: 'Tea', x: 58, y: 42 },
  ],
  [{ id: 'sami', name: 'Sami', emoji: '🐦', x: 46, y: 40, activities: ['look-outside', 'walk', 'wave', 'drink-tea', 'stretch'] }],
);

const OWL_TOWER = room(
  [
    { id: 'fireplace', kind: 'fireplace', label: 'Candle hearth', x: 50, y: 14 },
    { id: 'painting', kind: 'painting', label: 'Constellation', x: 68, y: 12, icon: '🌙' },
    { id: 'clock', kind: 'clock', label: 'Grand clock', x: 32, y: 12 },
    { id: 'bed', kind: 'bed', label: 'Loft bed', x: 22, y: 32 },
    { id: 'chest', kind: 'chest', label: 'Scroll chest', x: 22, y: 48 },
    { id: 'bookshelf', kind: 'bookshelf', label: 'Tall bookshelf', x: 82, y: 34 },
    { id: 'bookshelf-2', kind: 'bookshelf', label: 'Star charts', x: 82, y: 20 },
    { id: 'lamp', kind: 'lamp', label: 'Candle lamp', x: 38, y: 22 },
    { id: 'plant', kind: 'plant', label: 'Night herb', x: 38, y: 40 },
    { id: 'rug', kind: 'rug', label: 'Star rug', x: 52, y: 46, icon: '⭐' },
    { id: 'table', kind: 'table', label: 'Study table', x: 52, y: 44 },
    { id: 'chair-1', kind: 'chair', label: 'Reading chair', x: 62, y: 48 },
    { id: 'teacup', kind: 'teacup', label: 'Night tea', x: 56, y: 42 },
  ],
  [{ id: 'noor', name: 'Noor', emoji: '🦉', x: 50, y: 38, activities: ['read', 'sit', 'look-outside', 'drink-tea', 'sleep'] }],
);

const VILLAGE_HALL = room(
  [
    { id: 'fireplace', kind: 'fireplace', label: 'Hearth', x: 50, y: 14 },
    { id: 'painting', kind: 'painting', label: 'Village mural', x: 50, y: 12 },
    { id: 'clock', kind: 'clock', label: 'Hall clock', x: 68, y: 12 },
    { id: 'lamp', kind: 'lamp', label: 'Chandelier', x: 32, y: 12 },
    { id: 'plant', kind: 'plant', label: 'Welcome plant', x: 22, y: 38 },
    { id: 'bookshelf', kind: 'bookshelf', label: 'Community shelf', x: 82, y: 34 },
    { id: 'rug', kind: 'rug', label: 'Welcome rug', x: 50, y: 46 },
    { id: 'table', kind: 'table', label: 'Gathering table', x: 50, y: 44 },
    { id: 'chair-1', kind: 'chair', label: 'Chair', x: 42, y: 48 },
    { id: 'chair-2', kind: 'chair', label: 'Chair', x: 58, y: 48 },
    { id: 'teapot', kind: 'teapot', label: 'Big teapot', x: 50, y: 42 },
    { id: 'teacup', kind: 'teacup', label: 'Tea cups', x: 54, y: 42 },
  ],
  [{ id: 'host', name: 'Pip', emoji: '🌱', x: 50, y: 36, activities: ['wave', 'walk', 'drink-tea', 'clean', 'stretch'] }],
);

const PERSONALITY_ROOMS: Record<HousePersonality, HouseRoomDefinition> = {
  'cozy-cottage': COZY_COTTAGE,
  'rabbit-garden': RABBIT_GARDEN,
  'bear-den': BEAR_DEN,
  'bird-nest': BIRD_NEST,
  'fox-study': OWL_TOWER,
  'frog-pond': RABBIT_GARDEN,
  'owl-tower': OWL_TOWER,
  'village-hall': VILLAGE_HALL,
};

const PERSONALITY_STYLE: Record<
  HousePersonality,
  { accentColor: string; wallColor: string; floorColor: string }
> = {
  'cozy-cottage': { accentColor: '#f97316', wallColor: '#fff7ed', floorColor: '#c4a484' },
  'rabbit-garden': { accentColor: '#a78bfa', wallColor: '#faf5ff', floorColor: '#d8b4fe' },
  'bear-den': { accentColor: '#92400e', wallColor: '#fef3c7', floorColor: '#a16207' },
  'bird-nest': { accentColor: '#38bdf8', wallColor: '#f0f9ff', floorColor: '#bae6fd' },
  'fox-study': { accentColor: '#ea580c', wallColor: '#fff7ed', floorColor: '#fdba74' },
  'frog-pond': { accentColor: '#14b8a6', wallColor: '#f0fdfa', floorColor: '#5eead4' },
  'owl-tower': { accentColor: '#6366f1', wallColor: '#eef2ff', floorColor: '#a5b4fc' },
  'village-hall': { accentColor: '#ec4899', wallColor: '#fdf2f8', floorColor: '#f9a8d4' },
};

export function getHouseDoorWorldPosition(house: VillageHouse): WorldPosition {
  return { x: house.position.x, y: house.position.y + 32 };
}

export function getHouseApproachPosition(house: VillageHouse): WorldPosition {
  return { x: house.position.x, y: house.position.y + 52 };
}

export function getHouseInteriorDefinition(houseId: string): HouseInteriorDefinition {
  const personality = HOUSE_PERSONALITY_MAP[houseId] ?? 'cozy-cottage';
  const style = PERSONALITY_STYLE[personality];
  const livingRoom = PERSONALITY_ROOMS[personality];
  return {
    houseId,
    personality,
    defaultRoom: 'living-room',
    rooms: { 'living-room': livingRoom },
    ...style,
  };
}

export const RANDOM_EVENT_LABELS: Record<HouseRandomEvent, string> = {
  'cat-on-chair': 'A sleepy cat curled up on the chair.',
  'butterfly-visit': 'A butterfly drifted through the window.',
  'kettle-whistle': 'The kettle let out a cheerful whistle.',
  'bird-on-window': 'A bird landed on the windowsill.',
  'resident-wave': 'Someone waved hello.',
  'fireplace-crackle': 'The fireplace crackled warmly.',
  'tiny-mouse': 'A tiny mouse scampered across the floor.',
};

export const RANDOM_EVENT_POOL: HouseRandomEvent[] = [
  'cat-on-chair',
  'butterfly-visit',
  'kettle-whistle',
  'bird-on-window',
  'resident-wave',
  'fireplace-crackle',
  'tiny-mouse',
];
