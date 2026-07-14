export type SproutColor = 'mint' | 'peach' | 'lavender' | 'sky' | 'sunny';

export type SproutEmotion =
  | 'calm'
  | 'happy'
  | 'excited'
  | 'sleepy'
  | 'surprised'
  | 'proud'
  | 'thirsty'
  | 'sad'
  | 'watchingButterfly'
  | 'receivingGift'
  | 'welcomingBack';

export type CareNeedLevel = 'content' | 'gentle' | 'urgent';

export interface WorldPosition {
  x: number;
  y: number;
}

export interface VillageHouse {
  id: string;
  ownerId: string;
  ownerName: string;
  label: string;
  position: WorldPosition;
  color: string;
  roofColor: string;
}

export type WorldObjectType = 'tree' | 'rock' | 'water' | 'flower' | 'sign' | 'special';

export interface WorldObject {
  id: string;
  name: string;
  type: WorldObjectType;
  position: WorldPosition;
  icon: string;
  fact: string;
}

export interface WorldRegion {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  gradient: string;
}

export interface WildlifeAnimal {
  id: string;
  name: string;
  icon: string;
  position: WorldPosition;
  thought: string;
  activity?: string;
}

export interface VillageChatMessage {
  id: string;
  residentId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
}

/** Public shouts everyone sees; thread replies visible in side panel for participants */
export interface VillageMessage {
  id: string;
  kind: 'shout' | 'thread';
  threadId: string | null;
  replyToId: string | null;
  senderId: string;
  senderName: string;
  anchorResidentId: string;
  participantIds: string[];
  text: string;
  timestamp: string;
}

export interface VillageResident {
  id: string;
  playerId: string;
  playerName: string;
  sproutName: string;
  sproutColor: SproutColor;
  /** Verified age from Kawn platform — never derived from date of birth in UI */
  kawnAge?: number;
  showAge: boolean;
  isPlayer: boolean;
  houseId: string;
  position: WorldPosition;
  waypoints: WorldPosition[];
}

export type GrowthStage =
  | 'tinySeedling'
  | 'littleSprout'
  | 'bloomingSprout'
  | 'gardenFriend'
  | 'treehouseGuardian';

export type PlayerAvatar =
  | 'pastel-smile'
  | 'pastel-star'
  | 'pastel-flower'
  | 'pastel-heart'
  | 'pastel-cloud';

export interface PlayerPrivacy {
  showAgeToFriends: boolean;
  allowFriendVisits: boolean;
  allowGifts: boolean;
  allowHearts: boolean;
  showRecentActivity: boolean;
  reduceSocialVisibility: boolean;
}

export interface Player {
  id: string;
  name: string;
  age: number;
  level: number;
  experience: number;
  avatar: PlayerAvatar;
  privacy: PlayerPrivacy;
  statusMessage: string;
}

export interface SproutStatus {
  happiness: number;
  hydration: number;
  kindness: number;
  growth: number;
  friendship: number;
  dailyStreak: number;
}

export interface Sprout {
  id: string;
  name: string;
  color: SproutColor;
  emotion: SproutEmotion;
  growthPoints: number;
  growthStage: GrowthStage;
  status: SproutStatus;
}

export interface GardenCell {
  x: number;
  y: number;
}

export interface DecorationPlacement {
  id: string;
  decorationId: string;
  position: GardenCell;
  rotation?: number;
}

export interface Garden {
  id: string;
  theme: 'day' | 'evening' | 'night';
  placements: DecorationPlacement[];
  gridWidth: number;
  gridHeight: number;
}

export type DecorationCategory = 'nature' | 'furniture' | 'lights' | 'playful' | 'special';

export interface GardenDecoration {
  id: string;
  name: string;
  category: DecorationCategory;
  price: number;
  currency: 'coins' | 'hearts';
  unlockLevel: number;
  width: number;
  height: number;
  inventoryCount: number;
}

export type Rarity = 'common' | 'uncommon' | 'rare' | 'special';

export interface Flower {
  id: string;
  name: string;
  rarity: Rarity;
  description: string;
  unlockCondition: string;
  discovered: boolean;
  discoveredAt?: string;
  canPlaceInGarden: boolean;
}

export interface Butterfly {
  id: string;
  name: string;
  rarity: Rarity;
  description: string;
  discovered: boolean;
  collectedCount: number;
  firstDiscoveredAt?: string;
}

export interface FriendPrivacy {
  showAgeToFriends: boolean;
  allowVisits: boolean;
  allowGifts: boolean;
}

export interface Friend {
  id: string;
  name: string;
  /** Verified age synced from Kawn — used for display when privacy allows */
  age?: number;
  kawnAge?: number;
  level: number;
  avatar: PlayerAvatar;
  sproutName: string;
  sproutColor: SproutColor;
  gardenTheme: string;
  recentActivity: string;
  friendshipStatus: 'approved' | 'pending';
  privacy: FriendPrivacy;
  lastInteraction?: string;
}

export interface Gift {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: Rarity;
}

export interface GiftTransaction {
  id: string;
  giftId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  sentAt: string;
  opened: boolean;
  direction: 'sent' | 'received';
}

export interface InventoryItem {
  id: string;
  giftId: string;
  quantity: number;
}

export type MissionRewardType = 'growth' | 'coins' | 'hearts' | 'flowerSeed' | 'cosmetic';

export interface MissionReward {
  type: MissionRewardType;
  amount: number;
  label: string;
}

export interface DailyMission {
  id: string;
  description: string;
  targetCount: number;
  progress: number;
  completed: boolean;
  claimed: boolean;
  reward: MissionReward;
  actionType: string;
}

export interface MissionProgress {
  date: string;
  missions: DailyMission[];
}

export interface CaringStreak {
  current: number;
  longest: number;
  lastActiveDate: string;
  paused: boolean;
  warmWelcomeAvailable: boolean;
}

export interface CurrencyBalance {
  gardenCoins: number;
  heartSeeds: number;
  diamonds: number;
  gold: number;
}

export interface HouseProgress {
  ownedItemIds: string[];
}

export type {
  OwnedShopItem,
  EquippedCosmetics,
  EquippedVehicle,
  FurniturePlacement,
  ShopPurchaseRecord,
  ShopPlayerState,
} from '../features/shop/models/shopTypes';

export interface TreasureCollectionState {
  /** Date string YYYY-MM-DD when collectibles last reset */
  resetDate: string;
  /** Treasure ids collected today */
  collectedToday: string[];
}

export interface CurrencyTransaction {
  id: string;
  type: 'earn' | 'spend';
  currency: 'coins' | 'hearts' | 'diamonds' | 'gold';
  amount: number;
  reason: string;
  timestamp: string;
}

export type ActivityEventType =
  | 'water'
  | 'feedBirds'
  | 'collectButterfly'
  | 'quietTime'
  | 'gardenSong'
  | 'visitFriend'
  | 'sendHeart'
  | 'sendGift'
  | 'placeDecoration'
  | 'openCollection';

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
}

export type KawnActivityEventType =
  | 'POST_CREATED'
  | 'COMMENT_CREATED'
  | 'POSITIVE_COMMENT_RECEIVED'
  | 'POST_LIKED'
  | 'HELPFUL_ANSWER_RECEIVED'
  | 'FRIEND_VISIT'
  | 'COMMUNITY_WELCOME'
  | 'DAILY_LOGIN';

export interface KawnActivityEvent {
  type: KawnActivityEventType;
  timestamp: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface AppNotification {
  id: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'info' | 'gift' | 'discovery' | 'friend' | 'mission';
}

export interface GameSettings {
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
  characterSoundsEnabled: boolean;
  reducedMotion: boolean;
  textSize: 'sm' | 'md' | 'lg';
  themeOverride: 'auto' | 'day' | 'evening' | 'night';
  notificationsEnabled: boolean;
}

export interface ActivityCooldowns {
  water: number | null;
  feedBirds: number | null;
  quietTime: number | null;
  gardenSong: number | null;
}

export interface FriendDailyLimits {
  date: string;
  heartsSent: Record<string, boolean>;
  giftsSent: Record<string, boolean>;
  flowersWatered: Record<string, boolean>;
  wavesSent: Record<string, boolean>;
}

export interface PersistedGameState {
  version: number;
  onboardingComplete: boolean;
  player: Player;
  sprout: Sprout;
  garden: Garden;
  decorations: GardenDecoration[];
  flowers: Flower[];
  butterflies: Butterfly[];
  friends: Friend[];
  inventory: InventoryItem[];
  giftTransactions: GiftTransaction[];
  unopenedGiftCount: number;
  missions: MissionProgress;
  streak: CaringStreak;
  currency: CurrencyBalance;
  currencyTransactions: CurrencyTransaction[];
  notifications: AppNotification[];
  settings: GameSettings;
  activityCooldowns: ActivityCooldowns;
  friendDailyLimits: FriendDailyLimits;
  lastActiveAt: string;
  welcomeBackShown: boolean;
  activityLog: ActivityEvent[];
  stats: {
    friendsVisited: number;
    giftsSent: number;
    giftsReceived: number;
    flowersDiscovered: number;
    butterfliesDiscovered: number;
  };
  lastWateredAt: string;
  villagePosition: WorldPosition;
  discoveredWorldObjects: string[];
  discoveredSecrets: string[];
  villageMessages: VillageMessage[];
  houseProgress: HouseProgress;
  treasureCollection: TreasureCollectionState;
  shopInventory: import('../features/shop/models/shopTypes').OwnedShopItem[];
  equippedCosmetics: import('../features/shop/models/shopTypes').EquippedCosmetics;
  equippedVehicle: import('../features/shop/models/shopTypes').EquippedVehicle;
  furniturePlacements: import('../features/shop/models/shopTypes').FurniturePlacement[];
  shopPurchaseHistory: import('../features/shop/models/shopTypes').ShopPurchaseRecord[];
  shopState: import('../features/shop/models/shopTypes').ShopPlayerState;
  /** @deprecated migrated to villageMessages */
  villageChats?: Record<string, VillageChatMessage[]>;
}
