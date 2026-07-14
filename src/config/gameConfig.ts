import type { GrowthStage } from '../models';
import { waterYourKawniee } from './terminology';

export const STORAGE_KEY = 'kawn-sprouts-game-state';
export const STORAGE_VERSION = 9;

/** Starting shop wallet for new players */
export const STARTING_GOLD = 550;
export const STARTING_DIAMONDS = 550;

export const GROWTH_STAGE_THRESHOLDS: Record<GrowthStage, { min: number; max: number; label: string }> = {
  tinySeedling: { min: 0, max: 99, label: 'Tiny Seedling' },
  littleSprout: { min: 100, max: 249, label: 'Little Sprout' },
  bloomingSprout: { min: 250, max: 499, label: 'Blooming Sprout' },
  gardenFriend: { min: 500, max: 899, label: 'Garden Friend' },
  treehouseGuardian: { min: 900, max: Infinity, label: 'Treehouse Guardian' },
};

export const GROWTH_STAGES_ORDER: GrowthStage[] = [
  'tinySeedling',
  'littleSprout',
  'bloomingSprout',
  'gardenFriend',
  'treehouseGuardian',
];

export const XP_PER_LEVEL = 100;

export const ACTIVITY_COOLDOWNS = {
  water: 5 * 60 * 1000,
  feedBirds: 3 * 60 * 1000,
  quietTime: 2 * 60 * 1000,
  gardenSong: 4 * 60 * 1000,
};

export const STATUS_DECAY_INTERVAL = 30 * 60 * 1000;
export const STATUS_DECAY_AMOUNT = 2;
export const STATUS_MIN = 20;
export const STATUS_MAX = 100;

export const WELCOME_BACK_THRESHOLD_MS = 4 * 60 * 60 * 1000;
export const WELCOME_GIFT_THRESHOLD_MS = 24 * 60 * 60 * 1000;

export const GARDEN_GRID = { width: 8, height: 6 };

export const SPROUT_TAP_MESSAGES = [
  "I'm happy you're here.",
  'The flowers look lovely today.',
  'I think I saw a butterfly.',
  'Shall we water the garden?',
  'This is a cozy day.',
  'Your garden feels warm and safe.',
  'I love spending time with you.',
];

export const WELCOME_BACK_MESSAGES = [
  "I missed you. I'm glad you came back.",
  'Your garden kept your place warm.',
  'A butterfly visited while you were away.',
  'Welcome back. Everything is still here.',
  'The flowers saved a sunny spot for you.',
];

export const QUIET_TIME_MESSAGES = [
  'Breathing together feels peaceful.',
  'The clouds drift by so gently.',
  'This quiet moment is a gift.',
  'Everything feels calm and cozy.',
];

export const MISSION_POOL = [
  { id: 'water', description: waterYourKawniee(), actionType: 'water', targetCount: 1 },
  { id: 'feed', description: 'Feed one bird', actionType: 'feedBirds', targetCount: 1 },
  { id: 'visit', description: 'Visit one friend', actionType: 'visitFriend', targetCount: 1 },
  { id: 'butterfly', description: 'Collect one butterfly', actionType: 'collectButterfly', targetCount: 1 },
  { id: 'decorate', description: 'Add one garden decoration', actionType: 'placeDecoration', targetCount: 1 },
  { id: 'heart', description: 'Send a heart', actionType: 'sendHeart', targetCount: 1 },
  { id: 'quiet', description: 'Sit quietly with Pip', actionType: 'quietTime', targetCount: 1 },
  { id: 'song', description: 'Play the garden song', actionType: 'gardenSong', targetCount: 1 },
  { id: 'collection', description: 'Open the collection book', actionType: 'openCollection', targetCount: 1 },
];

export const MISSION_REWARDS = [
  { type: 'growth' as const, amount: 15, label: '15 Growth Points' },
  { type: 'coins' as const, amount: 25, label: '25 Garden Coins' },
  { type: 'hearts' as const, amount: 5, label: '5 Heart Seeds' },
  { type: 'flowerSeed' as const, amount: 1, label: '1 Flower Seed' },
  { type: 'cosmetic' as const, amount: 1, label: 'Cosmetic Item' },
];

export const KAWN_EVENT_MAPPINGS: Record<
  string,
  { description: string; effects: Record<string, number> }
> = {
  POST_CREATED: { description: 'Growth points for sharing', effects: { growthPoints: 10 } },
  COMMENT_CREATED: { description: 'Friendship points for commenting', effects: { friendship: 5 } },
  POSITIVE_COMMENT_RECEIVED: {
    description: 'Attract a butterfly',
    effects: { attractButterfly: 1 },
  },
  POST_LIKED: { description: 'Happiness boost', effects: { happiness: 8 } },
  HELPFUL_ANSWER_RECEIVED: {
    description: 'Flower unlock progress',
    effects: { flowerProgress: 1 },
  },
  FRIEND_VISIT: { description: 'Friendship increase', effects: { friendship: 10 } },
  COMMUNITY_WELCOME: { description: 'Kindness increase', effects: { kindness: 12 } },
  DAILY_LOGIN: { description: 'Caring streak eligibility', effects: { streakEligible: 1 } },
};

export const DUPLICATE_BUTTERFLY_REWARD = { coins: 10, hearts: 2 };

export const PLAYER_NAME_MIN = 2;
export const PLAYER_NAME_MAX = 20;
export const SPROUT_NAME_MIN = 2;
export const SPROUT_NAME_MAX = 16;
export const AGE_MIN = 5;
export const AGE_MAX = 120;

export const SPROUT_COLOR_MAP = {
  mint: { body: '#6ee7b7', leaf: '#34d399', cheek: '#fda4af' },
  peach: { body: '#fdba74', leaf: '#fb923c', cheek: '#fda4af' },
  lavender: { body: '#c4b5fd', leaf: '#a78bfa', cheek: '#f9a8d4' },
  sky: { body: '#7dd3fc', leaf: '#38bdf8', cheek: '#fda4af' },
  sunny: { body: '#fde047', leaf: '#facc15', cheek: '#fda4af' },
};

export const AVATAR_EMOJI: Record<string, string> = {
  'pastel-smile': '😊',
  'pastel-star': '⭐',
  'pastel-flower': '🌸',
  'pastel-heart': '💗',
  'pastel-cloud': '☁️',
};
