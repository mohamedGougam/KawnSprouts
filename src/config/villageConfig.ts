import type { VillageHouse, WildlifeAnimal, WorldObject, WorldPosition, WorldRegion } from '../models';
import { WORLD_SIZE, WORLD_SCALE } from './worldConstants';

export { WORLD_SIZE };

const s = (x: number, y: number): WorldPosition => ({
  x: Math.round(x * WORLD_SCALE),
  y: Math.round(y * WORLD_SCALE),
});

export const HOME_POSITION: WorldPosition = s(1200, 1750);
export const PLAYER_DEFAULT_POSITION: WorldPosition = s(1200, 1680);
export const TAKE_ME_HOME_DISTANCE = Math.round(450 * WORLD_SCALE);
export const NAV_HELPER_DISTANCE = TAKE_ME_HOME_DISTANCE;

export const WORLD_REGIONS: WorldRegion[] = [
  { id: 'meadow', name: 'Sprout Hollow', x: 1050, y: 1950, width: 1500, height: 1500, gradient: 'linear-gradient(135deg,#86efac,#4ade80)' },
  { id: 'river', name: 'Silver River', x: 150, y: 525, width: 1125, height: 1650, gradient: 'linear-gradient(180deg,#7dd3fc,#38bdf8)' },
  { id: 'lake', name: 'Mirror Lake', x: 1200, y: 600, width: 750, height: 750, gradient: 'linear-gradient(180deg,#67e8f9,#0ea5e9)' },
  { id: 'mountains', name: 'Misty Peaks', x: 2325, y: 120, width: 1200, height: 1050, gradient: 'linear-gradient(160deg,#cbd5e1,#94a3b8)' },
  { id: 'savanna', name: 'Sunny Savanna', x: 1950, y: 1650, width: 1500, height: 1800, gradient: 'linear-gradient(135deg,#fde68a,#fbbf24)' },
  { id: 'forest', name: 'Whisper Woods', x: 225, y: 2250, width: 900, height: 1275, gradient: 'linear-gradient(135deg,#6ee7b7,#059669)' },
  { id: 'wetlands', name: 'Kind Wetlands', x: 1275, y: 600, width: 750, height: 750, gradient: 'linear-gradient(135deg,#a5f3fc,#2dd4bf)' },
  { id: 'garden', name: 'Sunpetal Garden', x: 1650, y: 2400, width: 600, height: 500, gradient: 'linear-gradient(135deg,#fbcfe8,#f9a8d4)' },
  { id: 'flower-field', name: 'Bloom Fields', x: 2100, y: 2100, width: 900, height: 700, gradient: 'linear-gradient(135deg,#fde68a,#f472b6)' },
  { id: 'hills', name: 'Rolling Hills', x: 2700, y: 1500, width: 800, height: 900, gradient: 'linear-gradient(135deg,#bbf7d0,#86efac)' },
  { id: 'clearing', name: 'Hidden Clearing', x: 300, y: 2850, width: 500, height: 450, gradient: 'linear-gradient(135deg,#d9f99d,#86efac)' },
  { id: 'campsite', name: 'Stargazer Camp', x: 2850, y: 2700, width: 400, height: 350, gradient: 'linear-gradient(135deg,#fed7aa,#fdba74)' },
  { id: 'picnic', name: 'Picnic Grove', x: 2400, y: 2550, width: 450, height: 400, gradient: 'linear-gradient(135deg,#fef08a,#86efac)' },
];

export const VILLAGE_SHOP = {
  id: 'shop-sprout-sparkle',
  name: 'Sprout & Sparkle',
  label: 'Sprout & Sparkle',
  position: s(1320, 1520),
  doorPosition: s(1320, 1580),
  color: '#fef3c7',
  roofColor: '#f59e0b',
  trimColor: '#92400e',
} as const;

export const VILLAGE_HOUSES: VillageHouse[] = [
  { id: 'house-player', ownerId: 'player-1', ownerName: 'You', label: 'Your cottage', position: s(1200, 1750), color: '#fef3c7', roofColor: '#f97316' },
  { id: 'house-lina', ownerId: 'lina', ownerName: 'Lina', label: "Lina's home", position: s(980, 1620), color: '#ede9fe', roofColor: '#a78bfa' },
  { id: 'house-sami', ownerId: 'sami', ownerName: 'Sami', label: "Sami's home", position: s(1420, 1580), color: '#e0f2fe', roofColor: '#38bdf8' },
  { id: 'house-noor', ownerId: 'noor', ownerName: 'Noor', label: "Noor's home", position: s(1380, 1880), color: '#fef9c3', roofColor: '#eab308' },
  { id: 'house-adam', ownerId: 'adam', ownerName: 'Adam', label: "Adam's home", position: s(1020, 1900), color: '#ffedd5', roofColor: '#fb923c' },
  { id: 'house-community', ownerId: 'community', ownerName: 'Village', label: 'Gathering hall', position: s(1200, 1480), color: '#fce7f3', roofColor: '#ec4899' },
];

export const WORLD_OBJECTS: WorldObject[] = [
  { id: 'oak-tree', name: 'Whisper Oak', type: 'tree', position: s(320, 1680), icon: '🌳', fact: 'This oak is over 80 years old. Its wide branches give shade to tired Kawniees on sunny days.' },
  { id: 'cherry-tree', name: 'Blush Cherry', type: 'tree', position: s(1980, 1320), icon: '🌸', fact: 'Soft pink petals fall like confetti in spring. Birds love to nest here.' },
  { id: 'moss-rock', name: 'Mossy Rock', type: 'rock', position: s(880, 1720), icon: '🪨', fact: 'A smooth stone wrapped in green moss. It stays cool even on warm afternoons.' },
  { id: 'wishing-well', name: 'Wishing Well', type: 'water', position: s(1280, 1640), icon: '⛲', fact: 'Villagers drop kind wishes here — never coins. The water ripples when someone smiles nearby.' },
  { id: 'bee-hive', name: 'Busy Bee Tree', type: 'special', position: s(2100, 420), icon: '🐝', fact: 'Honeybees pollinate the village flowers. They never sting — only buzz friendly hellos.' },
  { id: 'lantern-post', name: 'Lantern Post', type: 'sign', position: s(1150, 1520), icon: '🏮', fact: 'These lanterns glow softly at night so everyone finds their way home safely.' },
  { id: 'mushroom-ring', name: 'Mushroom Circle', type: 'flower', position: s(480, 1820), icon: '🍄', fact: 'A fairy ring of tiny mushrooms. Legend says they grow where laughter was shared.' },
  { id: 'star-stone', name: 'Star Stone', type: 'rock', position: s(1620, 1980), icon: '⭐', fact: 'A pebble with a natural star shape. Kawniees make wishes when they find it.' },
  { id: 'butterfly-bush', name: 'Butterfly Bush', type: 'flower', position: s(1320, 1820), icon: '🦋', fact: 'Purple blooms attract butterflies from miles away. A peaceful spot to sit and watch.' },
  { id: 'tiny-bridge', name: 'Tiny Bridge', type: 'water', position: s(620, 920), icon: '🌉', fact: 'A wooden bridge over a babbling brook. The planks creak in a cozy, familiar way.' },
  { id: 'cloud-bush', name: 'Cloud Bush', type: 'flower', position: s(1780, 1720), icon: '☁️', fact: 'Fluffy white flowers that look like little clouds resting on the ground.' },
  { id: 'signpost', name: 'Village Sign', type: 'sign', position: s(1180, 1420), icon: '🪧', fact: 'Welcome to Sprout Hollow! Every path leads to kindness and a new friend among the Kawniees.' },
  { id: 'mountain-crystal', name: 'Peak Crystal', type: 'rock', position: s(1920, 280), icon: '💎', fact: 'A crystal that catches moonlight. Climbers leave kind notes beside it.' },
  { id: 'savanna-tree', name: 'Acacia Tree', type: 'tree', position: s(1680, 1280), icon: '🌴', fact: 'Wide and flat on top — perfect shade for picnics under the savanna sun.' },
  { id: 'waterfall', name: 'Misty Falls', type: 'water', position: s(400, 1100), icon: '💧', fact: 'A gentle waterfall where the river meets the lake. Mist sparkles in the sun.' },
  { id: 'picnic-table', name: 'Picnic Table', type: 'special', position: s(1600, 1700), icon: '🧺', fact: 'Friends leave snacks here for whoever wanders by.' },
  { id: 'campfire', name: 'Campsite Fire', type: 'special', position: s(1900, 1800), icon: '🔥', fact: 'A cozy campfire that never goes out. Marshmallows optional.' },
];

export const WILDLIFE: WildlifeAnimal[] = [
  { id: 'gazelle-gigi', name: 'Gigi the Gazelle', icon: '🦌', position: s(420, 780), thought: 'Ah, this water is so good. I feel way better!', activity: 'drinking' },
  { id: 'giraffe-tea', name: 'Tall Tea', icon: '🦒', position: s(1850, 1380), thought: 'Hello there! The view from up here is lovely today.', activity: 'eating' },
  { id: 'elephant-ellie', name: 'Ellie the Elephant', icon: '🐘', position: s(380, 1050), thought: 'A gentle splash keeps the river bank tidy for everyone.', activity: 'cleaning' },
  { id: 'fish-spot', name: 'River Friends', icon: '🐟', position: s(540, 620), thought: 'Splash! We jump when we are happy!', activity: 'jumping' },
  { id: 'bunny-mochi', name: 'Mochi Bunny', icon: '🐰', position: s(920, 1560), thought: 'These clover patches are the softest napping spot.', activity: 'eating' },
  { id: 'owl-hoot', name: 'Hoot the Owl', icon: '🦉', position: s(380, 1580), thought: 'Who-who… I mean, hello friend!' },
  { id: 'duck-paddle', name: 'Paddle the Duck', icon: '🦆', position: s(1280, 900), thought: 'Quack! The lake is perfect today.', activity: 'swimming' },
  { id: 'fox-rusty', name: 'Rusty Fox', icon: '🦊', position: s(2100, 2400), thought: 'I like watching the village from here.', activity: 'sit' },
  { id: 'frog-ribbit', name: 'Ribbit', icon: '🐸', position: s(570, 1410), thought: 'Hop hop! Lilypads are the best.', activity: 'hop' },
  { id: 'bird-sky', name: 'Sky Bird', icon: '🐦', position: s(1500, 2100), thought: 'Tweet! What a beautiful day.', activity: 'fly' },
];

export const FRIEND_WAYPOINTS: Record<string, WorldPosition[]> = {
  lina: [s(1050, 1680), s(980, 1580), s(1120, 1720), s(620, 950)],
  sami: [s(1380, 1650), s(1500, 1720), s(1750, 1400), s(1280, 1800)],
  noor: [s(1420, 1820), s(1350, 1750), s(1550, 1900), s(1100, 1500)],
  adam: [s(1080, 1850), s(980, 1780), s(1180, 1920), s(800, 1700)],
};

export const PLAYER_SPROUT_ID = 'player-sprout';

export function isWalkablePosition(pos?: WorldPosition | null): boolean {
  if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') return false;
  return pos.x >= 60 && pos.x <= WORLD_SIZE - 60 && pos.y >= 60 && pos.y <= WORLD_SIZE - 60;
}

export function normalizeWorldPosition(pos?: WorldPosition | null): WorldPosition {
  if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') {
    return HOME_POSITION;
  }
  if (pos.x <= 100 && pos.y <= 100) {
    return {
      x: Math.round((pos.x / 100) * WORLD_SIZE),
      y: Math.round((pos.y / 100) * WORLD_SIZE),
    };
  }
  if (pos.x <= 2400 && pos.y <= 2400) {
    return { x: Math.round(pos.x * WORLD_SCALE), y: Math.round(pos.y * WORLD_SCALE) };
  }
  return pos;
}

export function distanceBetween(a: WorldPosition, b: WorldPosition): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
