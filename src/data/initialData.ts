import { PLAYER_DEFAULT_POSITION } from '../config/villageConfig';
import type {
  Butterfly,
  Flower,
  Friend,
  GardenDecoration,
  Gift,
  InventoryItem,
  PersistedGameState,
  Player,
  Sprout,
} from '../models';

export const DEFAULT_PLAYER: Player = {
  id: 'player-1',
  name: 'Maya',
  age: 12,
  level: 4,
  experience: 320,
  avatar: 'pastel-smile',
  privacy: {
    showAgeToFriends: true,
    allowFriendVisits: true,
    allowGifts: true,
    allowHearts: true,
    showRecentActivity: true,
    reduceSocialVisibility: false,
  },
  statusMessage: 'Growing happiness together 🌱',
};

export const DEFAULT_SPROUT: Sprout = {
  id: 'sprout-1',
  name: 'Pip',
  color: 'mint',
  emotion: 'happy',
  growthPoints: 45,
  growthStage: 'tinySeedling',
  status: {
    happiness: 85,
    hydration: 70,
    kindness: 60,
    growth: 45,
    friendship: 55,
    dailyStreak: 0,
  },
};

export const INITIAL_DECORATIONS: GardenDecoration[] = [
  { id: 'bench', name: 'Small Bench', category: 'furniture', price: 50, currency: 'coins', unlockLevel: 1, width: 2, height: 1, inventoryCount: 2 },
  { id: 'flower-pot', name: 'Flower Pot', category: 'nature', price: 30, currency: 'coins', unlockLevel: 1, width: 1, height: 1, inventoryCount: 3 },
  { id: 'mushroom-lamp', name: 'Mushroom Lamp', category: 'lights', price: 75, currency: 'coins', unlockLevel: 2, width: 1, height: 1, inventoryCount: 1 },
  { id: 'tiny-pond', name: 'Tiny Pond', category: 'nature', price: 100, currency: 'coins', unlockLevel: 3, width: 2, height: 2, inventoryCount: 1 },
  { id: 'wooden-sign', name: 'Wooden Sign', category: 'playful', price: 40, currency: 'coins', unlockLevel: 1, width: 1, height: 1, inventoryCount: 2 },
  { id: 'heart-stone', name: 'Heart-shaped Stone', category: 'special', price: 15, currency: 'hearts', unlockLevel: 2, width: 1, height: 1, inventoryCount: 1 },
  { id: 'lantern', name: 'Lantern', category: 'lights', price: 60, currency: 'coins', unlockLevel: 2, width: 1, height: 1, inventoryCount: 2 },
  { id: 'picnic-blanket', name: 'Picnic Blanket', category: 'furniture', price: 55, currency: 'coins', unlockLevel: 2, width: 2, height: 2, inventoryCount: 1 },
  { id: 'mini-windmill', name: 'Mini Windmill', category: 'playful', price: 120, currency: 'coins', unlockLevel: 4, width: 2, height: 2, inventoryCount: 1 },
  { id: 'birdhouse', name: 'Birdhouse', category: 'nature', price: 80, currency: 'coins', unlockLevel: 3, width: 1, height: 2, inventoryCount: 1 },
  { id: 'cloud-cushion', name: 'Cloud Cushion', category: 'playful', price: 20, currency: 'hearts', unlockLevel: 3, width: 1, height: 1, inventoryCount: 1 },
  { id: 'tiny-mailbox', name: 'Tiny Mailbox', category: 'special', price: 90, currency: 'coins', unlockLevel: 3, width: 1, height: 1, inventoryCount: 1 },
];

export const INITIAL_FLOWERS: Flower[] = [
  { id: 'daisy', name: 'Daisy', rarity: 'common', description: 'A cheerful white bloom.', unlockCondition: 'Complete watering three times', discovered: false, canPlaceInGarden: true },
  { id: 'tulip', name: 'Tulip', rarity: 'common', description: 'A bright spring favorite.', unlockCondition: 'Feed five birds', discovered: false, canPlaceInGarden: true },
  { id: 'sunflower', name: 'Sunflower', rarity: 'uncommon', description: 'Always facing the sunshine.', unlockCondition: 'Maintain a caring streak', discovered: false, canPlaceInGarden: true },
  { id: 'lavender-flower', name: 'Lavender', rarity: 'common', description: 'Soft purple and calming.', unlockCondition: 'Visit a friend garden', discovered: false, canPlaceInGarden: true },
  { id: 'bluebell', name: 'Bluebell', rarity: 'uncommon', description: 'Tiny bells of blue.', unlockCondition: 'Collect a rare butterfly', discovered: false, canPlaceInGarden: true },
  { id: 'heart-bloom', name: 'Heart Bloom', rarity: 'rare', description: 'A flower shaped like love.', unlockCondition: 'Receive a friendship gift', discovered: false, canPlaceInGarden: true },
  { id: 'moon-flower', name: 'Moon Flower', rarity: 'rare', description: 'Glows softly at night.', unlockCondition: 'Reach Blooming Sprout stage', discovered: false, canPlaceInGarden: true },
  { id: 'star-petal', name: 'Star Petal', rarity: 'special', description: 'Petals like tiny stars.', unlockCondition: 'Complete all daily missions', discovered: false, canPlaceInGarden: true },
  { id: 'peach-bell', name: 'Peach Bell', rarity: 'uncommon', description: 'A warm peachy chime.', unlockCondition: 'Send three gifts', discovered: false, canPlaceInGarden: true },
];

export const INITIAL_BUTTERFLIES: Butterfly[] = [
  { id: 'sunny-wing', name: 'Sunny Wing', rarity: 'common', description: 'Loves sunny mornings.', discovered: false, collectedCount: 0 },
  { id: 'berry-flutter', name: 'Berry Flutter', rarity: 'common', description: 'Drawn to berry bushes.', discovered: false, collectedCount: 0 },
  { id: 'cloud-dancer', name: 'Cloud Dancer', rarity: 'uncommon', description: 'Floats like a cloud.', discovered: false, collectedCount: 0 },
  { id: 'moon-spark', name: 'Moon Spark', rarity: 'rare', description: 'Appears on calm nights.', discovered: false, collectedCount: 0 },
  { id: 'heart-wing', name: 'Heart Wing', rarity: 'uncommon', description: 'Wings shaped like hearts.', discovered: false, collectedCount: 0 },
  { id: 'tiny-rainbow', name: 'Tiny Rainbow', rarity: 'special', description: 'A rare colorful visitor.', discovered: false, collectedCount: 0 },
];

export const INITIAL_FRIENDS: Friend[] = [
  { id: 'lina', name: 'Lina', age: 14, kawnAge: 14, level: 6, avatar: 'pastel-flower', sproutName: 'Lumi', sproutColor: 'lavender', gardenTheme: 'lavender-lanterns', recentActivity: 'Watered the garden', friendshipStatus: 'approved', privacy: { showAgeToFriends: true, allowVisits: true, allowGifts: true } },
  { id: 'sami', name: 'Sami', kawnAge: 10, level: 3, avatar: 'pastel-cloud', sproutName: 'Bubbles', sproutColor: 'sky', gardenTheme: 'pond-birds', recentActivity: 'Fed the birds', friendshipStatus: 'approved', privacy: { showAgeToFriends: false, allowVisits: true, allowGifts: true } },
  { id: 'noor', name: 'Noor', age: 11, kawnAge: 11, level: 5, avatar: 'pastel-star', sproutName: 'Glow', sproutColor: 'sunny', gardenTheme: 'moon-flowers', recentActivity: 'Collected a butterfly', friendshipStatus: 'approved', privacy: { showAgeToFriends: true, allowVisits: true, allowGifts: true } },
  { id: 'adam', name: 'Adam', kawnAge: 9, level: 2, avatar: 'pastel-heart', sproutName: 'Sprig', sproutColor: 'peach', gardenTheme: 'windmill-daisy', recentActivity: 'Placed a decoration', friendshipStatus: 'approved', privacy: { showAgeToFriends: false, allowVisits: true, allowGifts: true } },
];

export const INITIAL_GIFTS: Gift[] = [
  { id: 'acorn', name: 'Acorn', description: 'A tiny woodland treasure.', icon: '🌰', rarity: 'common' },
  { id: 'cookie', name: 'Cookie', description: 'A sweet garden treat.', icon: '🍪', rarity: 'common' },
  { id: 'flower-seed', name: 'Flower Seed', description: 'Plant happiness together.', icon: '🌱', rarity: 'common' },
  { id: 'tiny-scarf', name: 'Tiny Scarf', description: 'Keeps Sprouts cozy.', icon: '🧣', rarity: 'uncommon' },
  { id: 'star-lantern', name: 'Star Lantern', description: 'A gentle night light.', icon: '🏮', rarity: 'rare' },
  { id: 'friendship-ribbon', name: 'Friendship Ribbon', description: 'Tied with care.', icon: '🎀', rarity: 'uncommon' },
  { id: 'plush-cloud', name: 'Small Plush Cloud', description: 'Soft as a cloud.', icon: '☁️', rarity: 'uncommon' },
  { id: 'painted-pebble', name: 'Painted Pebble', description: 'Hand-painted with love.', icon: '🪨', rarity: 'common' },
  { id: 'warm-tea', name: 'Warm Tea Cup', description: 'A cozy decoration.', icon: '🍵', rarity: 'rare' },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'inv-acorn', giftId: 'acorn', quantity: 3 },
  { id: 'inv-cookie', giftId: 'cookie', quantity: 2 },
  { id: 'inv-flower-seed', giftId: 'flower-seed', quantity: 5 },
  { id: 'inv-scarf', giftId: 'tiny-scarf', quantity: 1 },
  { id: 'inv-ribbon', giftId: 'friendship-ribbon', quantity: 2 },
  { id: 'inv-pebble', giftId: 'painted-pebble', quantity: 4 },
];

export function createDefaultState(): PersistedGameState {
  const now = new Date().toISOString();
  return {
    version: 1,
    onboardingComplete: false,
    player: { ...DEFAULT_PLAYER },
    sprout: { ...DEFAULT_SPROUT, status: { ...DEFAULT_SPROUT.status } },
    garden: {
      id: 'garden-1',
      theme: 'day',
      placements: [],
      gridWidth: 8,
      gridHeight: 6,
    },
    decorations: INITIAL_DECORATIONS.map((d) => ({ ...d })),
    flowers: INITIAL_FLOWERS.map((f) => ({ ...f })),
    butterflies: INITIAL_BUTTERFLIES.map((b) => ({ ...b })),
    friends: INITIAL_FRIENDS.map((f) => ({ ...f, privacy: { ...f.privacy } })),
    inventory: INITIAL_INVENTORY.map((i) => ({ ...i })),
    giftTransactions: [],
    unopenedGiftCount: 0,
    missions: { date: '', missions: [] },
    streak: {
      current: 0,
      longest: 0,
      lastActiveDate: '',
      paused: false,
      warmWelcomeAvailable: false,
    },
    currency: { gardenCoins: 200, heartSeeds: 15, diamonds: 1000, gold: 1000 },
    currencyTransactions: [],
    notifications: [],
    settings: {
      musicEnabled: true,
      soundEffectsEnabled: true,
      characterSoundsEnabled: true,
      reducedMotion: false,
      textSize: 'md',
      themeOverride: 'auto',
      notificationsEnabled: true,
    },
    activityCooldowns: { water: null, feedBirds: null, quietTime: null, gardenSong: null },
    friendDailyLimits: { date: '', heartsSent: {}, giftsSent: {}, flowersWatered: {}, wavesSent: {} },
    lastActiveAt: now,
    welcomeBackShown: false,
    activityLog: [],
    stats: {
      friendsVisited: 0,
      giftsSent: 0,
      giftsReceived: 0,
      flowersDiscovered: 0,
      butterfliesDiscovered: 0,
    },
    lastWateredAt: now,
    villagePosition: { ...PLAYER_DEFAULT_POSITION },
    discoveredWorldObjects: [],
    discoveredSecrets: [],
    villageMessages: [
      {
        id: 'msg-seed-1',
        kind: 'shout',
        threadId: null,
        replyToId: null,
        senderId: 'lina',
        senderName: 'Lina',
        anchorResidentId: 'lina',
        participantIds: [],
        text: 'The lavender smells lovely today!',
        timestamp: now,
      },
      {
        id: 'msg-seed-2',
        kind: 'shout',
        threadId: null,
        replyToId: null,
        senderId: 'gazelle-gigi',
        senderName: 'Gigi',
        anchorResidentId: 'gazelle-gigi',
        participantIds: [],
        text: 'Ah, this water is so good…',
        timestamp: now,
      },
    ],
    houseProgress: { ownedItemIds: [] },
    treasureCollection: { resetDate: '', collectedToday: [] },
    shopInventory: [],
    equippedCosmetics: { hatId: null, previewHatId: null },
    equippedVehicle: { vehicleId: null, mounted: false },
    furniturePlacements: [],
    shopPurchaseHistory: [],
    shopState: { tutorialComplete: false, lastCategory: 'home', viewedItemIds: [] },
  };
}
