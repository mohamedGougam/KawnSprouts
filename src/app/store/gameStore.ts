import { create } from 'zustand';
import type {
  DecorationPlacement,
  GardenCell,
  KawnActivityEventType,
  PersistedGameState,
  Player,
  PlayerAvatar,
  PlayerPrivacy,
  SproutColor,
  SproutEmotion,
  WorldPosition,
} from '../../models';
import { isWalkablePosition, normalizeWorldPosition, HOME_POSITION, PLAYER_SPROUT_ID } from '../../config/villageConfig';
import { createDefaultState, INITIAL_GIFTS } from '../../data/initialData';
import {
  LocalStorageGameStateRepository,
  loadStateWithFallback,
} from '../../repositories/GameStateRepository';
import {
  ACTIVITY_COOLDOWNS,
  DUPLICATE_BUTTERFLY_REWARD,
  WELCOME_BACK_THRESHOLD_MS,
  WELCOME_GIFT_THRESHOLD_MS,
} from '../../config/gameConfig';
import {
  clamp,
  generateId,
  getGrowthStageFromPoints,
  getThemeFromTime,
  getTodayDateString,
  validateAge,
  validatePlayerName,
  validateSproutName,
} from '../../utils/gameUtils';
import { canPlaceDecoration, getDecorationById } from '../../services/gardenService';
import { applyTransaction } from '../../services/currencyService';
import { ensureDailyMissions, updateMissionProgress } from '../../services/missionService';
import { applyWarmWelcome, recordMeaningfulAction } from '../../services/streakService';
import { simulateKawnEvent } from '../../features/integration/kawnIntegration';
import { WORLD_TREASURES, SHOP_UNLOCK_DIAMONDS } from '../../config/treasureConfig';
import { HOUSE_SHOP_ITEMS } from '../../config/houseConfig';
import { collectTreasure as collectTreasureService, ensureTreasureDay } from '../../services/treasureService';
import { buyHouseItem as buyHouseItemService } from '../../services/houseService';
import {
  purchaseShopItem as executeShopPurchase,
} from '../../features/shop/services/shopService';
import { getShopItem } from '../../features/shop/data/shopCatalog';
import {
  equipHat,
  previewHat,
  clearHatPreview,
  equipVehicle,
  equipAndMountVehicle,
  mountVehicle,
  dismountVehicle,
} from '../../features/shop/services/cosmeticService';
import { addFurniturePlacement } from '../../features/shop/services/furnitureService';
import type { ShopCategory } from '../../features/shop/models/shopTypes';

// Mutable so AppRouter can swap in the API-backed repository at runtime.
// Default: localStorage (works everywhere, no auth required).
let _repo: LocalStorageGameStateRepository | import('../../repositories/KawnApiGameStateRepository').KawnApiGameStateRepository =
  new LocalStorageGameStateRepository();

/** Swap the active repository — called once by AppRouter after boot */
export function setActiveRepo(next: typeof _repo) {
  _repo = next;
}

interface GameStore extends PersistedGameState {
  hydrated: boolean;
  pendingGardenLayout: DecorationPlacement[] | null;
  decorationMode: boolean;
  selectedDecorationId: string | null;
  activeButterflyId: string | null;
  showWelcomeBack: boolean;
  welcomeBackMessage: string;
  speechBubble: string | null;
  lastTapTime: number;
  villageMoveMode: boolean;
  villageThreadOpen: boolean;

  hydrate: () => void;
  /** Boot from a pre-loaded server state + optional Kawn identity */
  hydrateFromApi: (
    serverState: PersistedGameState | null,
    kawnUserId?: string,
    kawnName?: string,
    kawnAge?: number | null,
    kawnFriends?: import('../../features/integration/kawnBridge').KawnFriend[],
  ) => void;
  persist: () => void;
  resetPrototype: () => void;

  completeOnboarding: (data: {
    sproutName: string;
    sproutColor: SproutColor;
    playerName: string;
    playerAge: number;
    avatar: PlayerAvatar;
    showAge: boolean;
  }) => void;

  updatePlayer: (updates: Partial<Player>) => { success: boolean; error?: string };
  updatePrivacy: (privacy: Partial<PlayerPrivacy>) => void;
  updateSprout: (updates: { name?: string; color?: SproutColor }) => { success: boolean; error?: string };
  setSproutEmotion: (emotion: SproutEmotion) => void;
  tapSprout: () => void;

  waterSprout: () => { success: boolean; message?: string };
  feedBirds: () => { success: boolean; message?: string; birdId?: string };
  collectButterfly: (butterflyId: string) => { success: boolean; isNew: boolean; name: string };
  spawnButterfly: () => void;
  dismissButterfly: () => void;
  quietTime: () => { success: boolean; message?: string };
  completeGardenSong: () => { success: boolean; message?: string };

  enterDecorationMode: () => void;
  exitDecorationMode: (save: boolean) => void;
  selectDecoration: (id: string | null) => void;
  placeDecoration: (position: GardenCell) => { success: boolean; message?: string };
  removePlacement: (placementId: string) => void;
  movePlacement: (placementId: string, position: GardenCell) => { success: boolean };

  visitFriend: (friendId: string) => void;
  sendHeart: (friendId: string) => { success: boolean; message?: string };
  sendGift: (friendId: string, giftId: string) => { success: boolean; message?: string };
  waterFriendFlower: (friendId: string) => { success: boolean; message?: string };
  waveToFriend: (friendId: string) => { success: boolean; message?: string };
  openGift: (transactionId: string) => void;

  claimMissionReward: (missionId: string) => { success: boolean; message?: string };
  trackMissionAction: (actionType: string) => void;
  openCollection: () => void;

  updateSettings: (settings: Partial<PersistedGameState['settings']>) => void;
  dismissNotification: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;

  applyWarmWelcomeStreak: () => void;
  dismissWelcomeBack: () => void;
  checkWelcomeBack: () => void;
  simulateKawnActivity: (eventType: KawnActivityEventType) => void;

  getEffectiveTheme: () => 'day' | 'evening' | 'night';
  tickStatusDecay: () => void;

  setVillageMoveMode: (enabled: boolean) => void;
  setVillageThreadOpen: (open: boolean) => void;
  moveVillageSprout: (position: WorldPosition) => { success: boolean };
  discoverWorldObject: (objectId: string) => void;
  discoverSecret: (secretId: string) => void;
  postVillageShout: (text: string) => { success: boolean };
  replyToVillageMessage: (messageId: string, text: string) => { success: boolean; threadId?: string };
  startDirectVillageChat: (friendId: string, text: string) => { success: boolean; threadId?: string };
  goHome: () => void;

  collectTreasure: (treasureId: string) => { success: boolean; message?: string };
  buyHouseItem: (itemId: string) => { success: boolean; message?: string };
  isShopUnlocked: () => boolean;

  purchaseShopItem: (itemId: string) =>
    | { success: true; itemId: string; message?: string }
    | { success: false; reason: string; message: string; missing?: number; currency?: string };
  equipShopHat: (hatId: string | null) => void;
  previewShopHat: (hatId: string | null) => void;
  clearShopHatPreview: () => void;
  equipShopVehicle: (vehicleId: string | null) => void;
  equipAndRideShopVehicle: (vehicleId: string) => void;
  mountShopVehicle: () => void;
  dismountShopVehicle: () => void;
  placeShopFurniture: (itemId: string, slotIndex?: number) => { success: boolean; message?: string };
  completeShopTutorial: () => void;
  setShopLastCategory: (cat: ShopCategory) => void;
}

function ensureFriendLimits(state: PersistedGameState): PersistedGameState['friendDailyLimits'] {
  const today = getTodayDateString();
  if (state.friendDailyLimits.date === today) return state.friendDailyLimits;
  return { date: today, heartsSent: {}, giftsSent: {}, flowersWatered: {}, wavesSent: {} };
}

function addNotification(
  state: PersistedGameState,
  message: string,
  type: PersistedGameState['notifications'][0]['type'] = 'info',
): PersistedGameState['notifications'] {
  if (!state.settings.notificationsEnabled) return state.notifications;
  return [
    {
      id: generateId('notif'),
      message,
      read: false,
      createdAt: new Date().toISOString(),
      type,
    },
    ...state.notifications.slice(0, 49),
  ];
}

function recordActivity(state: GameStore, actionType: string): Partial<GameStore> {
  const streak = recordMeaningfulAction(state.streak);
  const missions = updateMissionProgress(state.missions, actionType);
  return { streak, missions, lastActiveAt: new Date().toISOString() };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...createDefaultState(),
  hydrated: false,
  pendingGardenLayout: null,
  decorationMode: false,
  selectedDecorationId: null,
  activeButterflyId: null,
  showWelcomeBack: false,
  welcomeBackMessage: '',
  speechBubble: null,
  lastTapTime: 0,
  villageMoveMode: false,
  villageThreadOpen: false,

  hydrate: () => {
    // Sync path — used in dev/standalone mode where repo is localStorage
    const raw = _repo.load();
    // Handle the case where load() returns a Promise (API repo)
    if (raw instanceof Promise) {
      raw.then((state) => {
        const resolved = state ?? createDefaultState();
        const missions = ensureDailyMissions(resolved.missions);
        const friendDailyLimits = ensureFriendLimits(resolved);
        const treasureCollection = ensureTreasureDay(
          resolved.treasureCollection ?? { resetDate: '', collectedToday: [] },
        );
        set({
          ...resolved,
          villagePosition: normalizeWorldPosition(resolved.villagePosition),
          missions,
          friendDailyLimits,
          treasureCollection,
          hydrated: true,
          pendingGardenLayout: null,
          decorationMode: false,
          selectedDecorationId: null,
          activeButterflyId: null,
          showWelcomeBack: false,
          welcomeBackMessage: '',
          speechBubble: null,
          lastTapTime: 0,
          villageMoveMode: false,
          villageThreadOpen: false,
        });
        get().checkWelcomeBack();
      });
      return;
    }
    const state = raw ?? createDefaultState();
    const missions = ensureDailyMissions(state.missions);
    const friendDailyLimits = ensureFriendLimits(state);
    const treasureCollection = ensureTreasureDay(
      state.treasureCollection ?? { resetDate: '', collectedToday: [] },
    );
    set({
      ...state,
      villagePosition: normalizeWorldPosition(state.villagePosition),
      missions,
      friendDailyLimits,
      treasureCollection,
      hydrated: true,
      pendingGardenLayout: null,
      decorationMode: false,
      selectedDecorationId: null,
      activeButterflyId: null,
      showWelcomeBack: false,
      welcomeBackMessage: '',
      speechBubble: null,
      lastTapTime: 0,
      villageMoveMode: false,
      villageThreadOpen: false,
    });
    get().checkWelcomeBack();
  },

  hydrateFromApi: (serverState, kawnUserId, kawnName, kawnAge, kawnFriends) => {
    const base = serverState ?? createDefaultState();

    // Overlay real Kawn identity
    const player = kawnUserId
      ? { ...base.player, id: kawnUserId, name: kawnName ?? base.player.name, age: kawnAge ?? base.player.age }
      : base.player;

    let friends: PersistedGameState['friends'] = base.friends;

    if (kawnUserId) {
      const VALID_COLORS: SproutColor[] = ['mint', 'peach', 'lavender', 'sky', 'sunny'];
      const VALID_AVATARS: PlayerAvatar[] = [
        'pastel-smile',
        'pastel-star',
        'pastel-flower',
        'pastel-heart',
        'pastel-cloud',
      ];

      if (Array.isArray(kawnFriends)) {
        friends = kawnFriends.map((f) => ({
          id: f.id,
          name: f.name,
          age: undefined,
          kawnAge: undefined,
          level: f.level ?? 1,
          avatar: f.avatar && VALID_AVATARS.includes(f.avatar) ? f.avatar : 'pastel-smile',
          sproutName: f.sproutName ?? f.name,
          sproutColor: f.sproutColor && VALID_COLORS.includes(f.sproutColor) ? f.sproutColor : 'mint',
          gardenTheme: 'day',
          recentActivity: '',
          friendshipStatus: 'approved' as const,
          privacy: { showAgeToFriends: false, allowVisits: true, allowGifts: true },
          lastInteraction: new Date().toISOString(),
        }));
      } else if (serverState?.friends) {
        // Strip legacy mock friends (lina, sami, noor, adam) if any were stored earlier
        friends = serverState.friends.filter(
          (f) => !['lina', 'sami', 'noor', 'adam'].includes(f.id.toLowerCase()),
        );
      } else {
        friends = [];
      }
    }

    const state: PersistedGameState = {
      ...base,
      onboardingComplete: kawnUserId ? true : base.onboardingComplete,
      player,
      friends,
    };
    const missions = ensureDailyMissions(state.missions);
    const friendDailyLimits = ensureFriendLimits(state);
    const treasureCollection = ensureTreasureDay(
      state.treasureCollection ?? { resetDate: '', collectedToday: [] },
    );

    set({
      ...state,
      villagePosition: normalizeWorldPosition(state.villagePosition),
      missions,
      friendDailyLimits,
      treasureCollection,
      hydrated: true,
      pendingGardenLayout: null,
      decorationMode: false,
      selectedDecorationId: null,
      activeButterflyId: null,
      showWelcomeBack: false,
      welcomeBackMessage: '',
      speechBubble: null,
      lastTapTime: 0,
      villageMoveMode: false,
      villageThreadOpen: false,
    });
    get().checkWelcomeBack();
  },

  persist: (() => {
    let _debounceTimer: ReturnType<typeof setTimeout> | null = null;
    return () => {
      const s = get();
      const state: PersistedGameState = {
        version: s.version,
        onboardingComplete: s.onboardingComplete,
        player: s.player,
        sprout: s.sprout,
        garden: s.garden,
        decorations: s.decorations,
        flowers: s.flowers,
        butterflies: s.butterflies,
        friends: s.friends,
        inventory: s.inventory,
        giftTransactions: s.giftTransactions,
        unopenedGiftCount: s.unopenedGiftCount,
        missions: s.missions,
        streak: s.streak,
        currency: s.currency,
        currencyTransactions: s.currencyTransactions,
        notifications: s.notifications,
        settings: s.settings,
        activityCooldowns: s.activityCooldowns,
        friendDailyLimits: s.friendDailyLimits,
        lastActiveAt: s.lastActiveAt,
        welcomeBackShown: s.welcomeBackShown,
        activityLog: s.activityLog,
        stats: s.stats,
        lastWateredAt: s.lastWateredAt,
        villagePosition: s.villagePosition,
        discoveredWorldObjects: s.discoveredWorldObjects,
        discoveredSecrets: s.discoveredSecrets,
        villageMessages: s.villageMessages,
        houseProgress: s.houseProgress,
        treasureCollection: s.treasureCollection,
        shopInventory: s.shopInventory,
        equippedCosmetics: s.equippedCosmetics,
        equippedVehicle: s.equippedVehicle,
        furniturePlacements: s.furniturePlacements,
        shopPurchaseHistory: s.shopPurchaseHistory,
        shopState: s.shopState,
      };
      // Debounce: wait 2s after last change before writing.
      // localStorage is always written immediately via KawnApiGameStateRepository;
      // the debounce only delays the network push to avoid hammering the API.
      if (_debounceTimer !== null) clearTimeout(_debounceTimer);
      _debounceTimer = setTimeout(() => {
        _repo.save(state);
        _debounceTimer = null;
      }, 2_000);
    };
  })(),

  resetPrototype: () => {
    repo.clear();
    const fresh = createDefaultState();
    set({
      ...fresh,
      hydrated: true,
      pendingGardenLayout: null,
      decorationMode: false,
      selectedDecorationId: null,
      activeButterflyId: null,
      showWelcomeBack: false,
      welcomeBackMessage: '',
      speechBubble: null,
      villageMoveMode: false,
  villageThreadOpen: false,
    });
  },

  completeOnboarding: (data) => {
    set((s) => ({
      onboardingComplete: true,
      player: {
        ...s.player,
        name: data.playerName.trim(),
        age: data.playerAge,
        avatar: data.avatar,
        privacy: { ...s.player.privacy, showAgeToFriends: data.showAge },
      },
      sprout: {
        ...s.sprout,
        name: data.sproutName.trim(),
        color: data.sproutColor,
        emotion: 'happy',
      },
      lastActiveAt: new Date().toISOString(),
    }));
    get().persist();
  },

  updatePlayer: (updates) => {
    if (updates.name !== undefined) {
      const err = validatePlayerName(updates.name);
      if (err) return { success: false, error: err };
    }
    if (updates.age !== undefined) {
      const err = validateAge(updates.age);
      if (err) return { success: false, error: err };
    }
    set((s) => ({ player: { ...s.player, ...updates, name: updates.name?.trim() ?? s.player.name } }));
    get().persist();
    return { success: true };
  },

  updatePrivacy: (privacy) => {
    set((s) => ({ player: { ...s.player, privacy: { ...s.player.privacy, ...privacy } } }));
    get().persist();
  },

  updateSprout: (updates) => {
    if (updates.name !== undefined) {
      const err = validateSproutName(updates.name);
      if (err) return { success: false, error: err };
    }
    set((s) => ({
      sprout: {
        ...s.sprout,
        ...updates,
        name: updates.name?.trim().replace(/\s+/g, ' ') ?? s.sprout.name,
      },
    }));
    get().persist();
    return { success: true };
  },

  setSproutEmotion: (emotion) => set((s) => ({ sprout: { ...s.sprout, emotion } })),

  tapSprout: () => {
    const now = Date.now();
    const s = get();
    if (now - s.lastTapTime < 3000) return;
    const messages = [
      "I'm happy you're here.",
      'The flowers look lovely today.',
      'I think I saw a butterfly.',
      'Shall we water the garden?',
      'This is a cozy day.',
    ];
    set({
      lastTapTime: now,
      speechBubble: messages[Math.floor(Math.random() * messages.length)],
      sprout: { ...s.sprout, emotion: 'excited' },
    });
    setTimeout(() => {
      set((st) => ({ speechBubble: null, sprout: { ...st.sprout, emotion: 'happy' } }));
    }, 2500);
  },

  waterSprout: () => {
    const s = get();
    const now = Date.now();
    if (s.activityCooldowns.water && now < s.activityCooldowns.water) {
      return {
        success: false,
        message: `${s.sprout.name} has enough water for now.`,
      };
    }
    set((st) => ({
      ...recordActivity(st, 'water'),
      activityCooldowns: { ...st.activityCooldowns, water: now + ACTIVITY_COOLDOWNS.water },
      sprout: {
        ...st.sprout,
        emotion: 'happy',
        growthPoints: st.sprout.growthPoints + 5,
        growthStage: getGrowthStageFromPoints(st.sprout.growthPoints + 5),
        status: {
          ...st.sprout.status,
          hydration: clamp(st.sprout.status.hydration + 15, 20, 100),
          growth: clamp(st.sprout.status.growth + 3, 20, 100),
          dailyStreak: recordMeaningfulAction(st.streak).current,
        },
      },
      notifications: addNotification(st, `${st.sprout.name} enjoyed the water!`, 'info'),
      lastWateredAt: new Date().toISOString(),
    }));
    get().persist();
    return { success: true };
  },

  feedBirds: () => {
    const s = get();
    const now = Date.now();
    if (s.activityCooldowns.feedBirds && now < s.activityCooldowns.feedBirds) {
      return { success: false, message: 'The birds are resting for now.' };
    }
    const birds = ['sparrow', 'robin', 'puffbird', 'finch'];
    const birdId = birds[Math.floor(Math.random() * birds.length)];
    set((st) => ({
      ...recordActivity(st, 'feedBirds'),
      activityCooldowns: { ...st.activityCooldowns, feedBirds: now + ACTIVITY_COOLDOWNS.feedBirds },
      sprout: {
        ...st.sprout,
        emotion: 'watchingButterfly',
        status: {
          ...st.sprout.status,
          kindness: clamp(st.sprout.status.kindness + 12, 20, 100),
        },
      },
      notifications: addNotification(st, 'Birds enjoyed the seeds!', 'info'),
    }));
    setTimeout(() => get().setSproutEmotion('happy'), 3000);
    get().persist();
    return { success: true, birdId };
  },

  spawnButterfly: () => {
    const s = get();
    if (s.activeButterflyId) return;
    const undiscovered = s.butterflies.filter((b) => !b.discovered);
    const pool = undiscovered.length > 0 ? undiscovered : s.butterflies;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    set({ activeButterflyId: picked.id });
    set((st) => ({
      notifications: addNotification(st, 'A butterfly has arrived in your garden.', 'discovery'),
    }));
  },

  dismissButterfly: () => set({ activeButterflyId: null }),

  collectButterfly: (butterflyId) => {
    const s = get();
    const butterfly = s.butterflies.find((b) => b.id === butterflyId);
    if (!butterfly) return { success: false, isNew: false, name: '' };
    const isNew = !butterfly.discovered;
    let currency = { ...s.currency };
    let currencyTransactions = [...s.currencyTransactions];

    if (!isNew) {
      const result = applyTransaction(
        currency,
        currencyTransactions,
        'coins',
        DUPLICATE_BUTTERFLY_REWARD.coins,
        'earn',
        `Duplicate ${butterfly.name}`,
      );
      currency = result.balance;
      currencyTransactions = result.transactions;
      const heartResult = applyTransaction(
        currency,
        currencyTransactions,
        'hearts',
        DUPLICATE_BUTTERFLY_REWARD.hearts,
        'earn',
        `Duplicate ${butterfly.name}`,
      );
      currency = heartResult.balance;
      currencyTransactions = heartResult.transactions;
    }

    set((st) => ({
      ...recordActivity(st, 'collectButterfly'),
      activeButterflyId: null,
      currency,
      currencyTransactions,
      butterflies: st.butterflies.map((b) =>
        b.id === butterflyId
          ? {
              ...b,
              discovered: true,
              collectedCount: b.collectedCount + 1,
              firstDiscoveredAt: b.firstDiscoveredAt ?? new Date().toISOString(),
            }
          : b,
      ),
      stats: {
        ...st.stats,
        butterfliesDiscovered: isNew
          ? st.stats.butterfliesDiscovered + 1
          : st.stats.butterfliesDiscovered,
      },
      sprout: {
        ...st.sprout,
        emotion: 'excited',
        status: {
          ...st.sprout.status,
          happiness: clamp(st.sprout.status.happiness + 8, 20, 100),
        },
      },
      notifications: addNotification(
        st,
        isNew ? `${butterfly.name} joined your collection!` : `Another ${butterfly.name} visited!`,
        'discovery',
      ),
    }));
    setTimeout(() => get().setSproutEmotion('happy'), 2000);
    get().persist();
    return { success: true, isNew, name: butterfly.name };
  },

  quietTime: () => {
    const s = get();
    const now = Date.now();
    if (s.activityCooldowns.quietTime && now < s.activityCooldowns.quietTime) {
      return { success: false, message: 'Enjoy this peaceful moment a little longer.' };
    }
    const messages = [
      'Breathing together feels peaceful.',
      'The clouds drift by so gently.',
      'This quiet moment is a gift.',
    ];
    set((st) => ({
      ...recordActivity(st, 'quietTime'),
      activityCooldowns: { ...st.activityCooldowns, quietTime: now + ACTIVITY_COOLDOWNS.quietTime },
      sprout: {
        ...st.sprout,
        emotion: 'calm',
        status: {
          ...st.sprout.status,
          happiness: clamp(st.sprout.status.happiness + 5, 20, 100),
        },
      },
    }));
    get().persist();
    return { success: true, message: messages[Math.floor(Math.random() * messages.length)] };
  },

  completeGardenSong: () => {
    const s = get();
    const now = Date.now();
    if (s.activityCooldowns.gardenSong && now < s.activityCooldowns.gardenSong) {
      return { success: false, message: 'The flowers are resting their melody.' };
    }
    set((st) => ({
      ...recordActivity(st, 'gardenSong'),
      activityCooldowns: { ...st.activityCooldowns, gardenSong: now + ACTIVITY_COOLDOWNS.gardenSong },
      sprout: {
        ...st.sprout,
        emotion: 'excited',
        status: {
          ...st.sprout.status,
          friendship: clamp(st.sprout.status.friendship + 10, 20, 100),
        },
      },
    }));
    setTimeout(() => get().setSproutEmotion('happy'), 3000);
    get().persist();
    return { success: true, message: 'Beautiful melody!' };
  },

  enterDecorationMode: () =>
    set((s) => ({
      decorationMode: true,
      pendingGardenLayout: [...s.garden.placements],
    })),

  exitDecorationMode: (save) => {
    set((s) => {
      if (save && s.pendingGardenLayout) {
        return {
          decorationMode: false,
          selectedDecorationId: null,
          garden: { ...s.garden, placements: s.pendingGardenLayout },
          pendingGardenLayout: null,
        };
      }
      return { decorationMode: false, selectedDecorationId: null, pendingGardenLayout: null };
    });
    get().persist();
  },

  selectDecoration: (id) => set({ selectedDecorationId: id }),

  placeDecoration: (position) => {
    const s = get();
    if (!s.selectedDecorationId) return { success: false, message: 'Select a decoration first' };
    const decoration = getDecorationById(s.decorations, s.selectedDecorationId);
    if (!decoration || decoration.inventoryCount <= 0) {
      return { success: false, message: 'No items available' };
    }
    const layout = s.pendingGardenLayout ?? s.garden.placements;
    if (!canPlaceDecoration(position, decoration, layout, s.decorations)) {
      return { success: false, message: 'Cannot place here' };
    }
    const placement: DecorationPlacement = {
      id: generateId('placement'),
      decorationId: decoration.id,
      position,
    };
    set((st) => ({
      ...recordActivity(st, 'placeDecoration'),
      pendingGardenLayout: [...layout, placement],
      decorations: st.decorations.map((d) =>
        d.id === decoration.id ? { ...d, inventoryCount: d.inventoryCount - 1 } : d,
      ),
      selectedDecorationId: null,
    }));
    return { success: true };
  },

  removePlacement: (placementId) => {
    set((s) => {
      const layout = s.pendingGardenLayout ?? s.garden.placements;
      const placement = layout.find((p) => p.id === placementId);
      if (!placement) return s;
      return {
        pendingGardenLayout: layout.filter((p) => p.id !== placementId),
        decorations: s.decorations.map((d) =>
          d.id === placement.decorationId ? { ...d, inventoryCount: d.inventoryCount + 1 } : d,
        ),
      };
    });
  },

  movePlacement: (placementId, position) => {
    const s = get();
    const layout = s.pendingGardenLayout ?? s.garden.placements;
    const placement = layout.find((p) => p.id === placementId);
    if (!placement) return { success: false };
    const decoration = getDecorationById(s.decorations, placement.decorationId);
    if (!decoration) return { success: false };
    if (!canPlaceDecoration(position, decoration, layout, s.decorations, placementId)) {
      return { success: false };
    }
    set({
      pendingGardenLayout: layout.map((p) =>
        p.id === placementId ? { ...p, position } : p,
      ),
    });
    return { success: true };
  },

  visitFriend: (friendId) => {
    const friend = get().friends.find((f) => f.id === friendId);
    set((s) => ({
      ...recordActivity(s, 'visitFriend'),
      stats: { ...s.stats, friendsVisited: s.stats.friendsVisited + 1 },
      notifications: friend
        ? addNotification(s, `You visited ${friend.name}'s garden.`, 'friend')
        : s.notifications,
    }));
    get().persist();
  },

  sendHeart: (friendId) => {
    const s = get();
    const limits = ensureFriendLimits(s);
    if (limits.heartsSent[friendId]) {
      const friend = s.friends.find((f) => f.id === friendId);
      return {
        success: false,
        message: `You already sent ${friend?.name ?? 'this friend'} a heart today.`,
      };
    }
    set((st) => ({
      ...recordActivity(st, 'sendHeart'),
      friendDailyLimits: {
        ...limits,
        heartsSent: { ...limits.heartsSent, [friendId]: true },
      },
      notifications: addNotification(st, `You sent a heart!`, 'friend'),
    }));
    get().persist();
    return { success: true };
  },

  sendGift: (friendId, giftId) => {
    const s = get();
    const limits = ensureFriendLimits(s);
    if (limits.giftsSent[friendId]) {
      const friend = s.friends.find((f) => f.id === friendId);
      return {
        success: false,
        message: `You already left ${friend?.name ?? 'this friend'} a little gift today.`,
      };
    }
    const inv = s.inventory.find((i) => i.giftId === giftId);
    if (!inv || inv.quantity <= 0) {
      return { success: false, message: 'Gift not available' };
    }
    const friend = s.friends.find((f) => f.id === friendId);
    const gift = INITIAL_GIFTS.find((g) => g.id === giftId);
    set((st) => ({
      ...recordActivity(st, 'sendGift'),
      inventory: st.inventory.map((i) =>
        i.giftId === giftId ? { ...i, quantity: i.quantity - 1 } : i,
      ),
      giftTransactions: [
        {
          id: generateId('gift'),
          giftId,
          senderId: st.player.id,
          senderName: st.player.name,
          receiverId: friendId,
          receiverName: friend?.name ?? 'Friend',
          sentAt: new Date().toISOString(),
          opened: true,
          direction: 'sent' as const,
        },
        ...st.giftTransactions,
      ],
      friendDailyLimits: {
        ...limits,
        giftsSent: { ...limits.giftsSent, [friendId]: true },
      },
      stats: { ...st.stats, giftsSent: st.stats.giftsSent + 1 },
      notifications: addNotification(st, `You sent a ${gift?.name ?? 'gift'}!`, 'gift'),
    }));
    get().persist();
    return { success: true };
  },

  waterFriendFlower: (friendId) => {
    const limits = ensureFriendLimits(get());
    if (limits.flowersWatered[friendId]) {
      return { success: false, message: 'You already watered a flower here today.' };
    }
    set({
      friendDailyLimits: {
        ...limits,
        flowersWatered: { ...limits.flowersWatered, [friendId]: true },
      },
    });
    get().persist();
    return { success: true };
  },

  waveToFriend: (friendId) => {
    const limits = ensureFriendLimits(get());
    if (limits.wavesSent[friendId]) {
      return { success: false, message: 'You already waved today.' };
    }
    set((s) => ({
      friendDailyLimits: {
        ...limits,
        wavesSent: { ...limits.wavesSent, [friendId]: true },
      },
      sprout: { ...s.sprout, emotion: 'happy' },
    }));
    get().persist();
    return { success: true };
  },

  openGift: (transactionId) => {
    set((s) => {
      const tx = s.giftTransactions.find((t) => t.id === transactionId);
      if (!tx || tx.opened) return s;
      return {
        giftTransactions: s.giftTransactions.map((t) =>
          t.id === transactionId ? { ...t, opened: true } : t,
        ),
        unopenedGiftCount: Math.max(0, s.unopenedGiftCount - 1),
        sprout: { ...s.sprout, emotion: 'receivingGift' },
        stats: { ...s.stats, giftsReceived: s.stats.giftsReceived + 1 },
      };
    });
    setTimeout(() => get().setSproutEmotion('happy'), 3000);
    get().persist();
  },

  claimMissionReward: (missionId) => {
    const s = get();
    const mission = s.missions.missions.find((m) => m.id === missionId);
    if (!mission || !mission.completed || mission.claimed) {
      return { success: false, message: 'Reward not available' };
    }
    let currency = { ...s.currency };
    let currencyTransactions = [...s.currencyTransactions];
    const sprout = { ...s.sprout, status: { ...s.sprout.status } };

    switch (mission.reward.type) {
      case 'coins': {
        const r = applyTransaction(currency, currencyTransactions, 'coins', mission.reward.amount, 'earn', mission.description);
        currency = r.balance;
        currencyTransactions = r.transactions;
        break;
      }
      case 'hearts': {
        const r = applyTransaction(currency, currencyTransactions, 'hearts', mission.reward.amount, 'earn', mission.description);
        currency = r.balance;
        currencyTransactions = r.transactions;
        break;
      }
      case 'growth':
        sprout.growthPoints += mission.reward.amount;
        sprout.growthStage = getGrowthStageFromPoints(sprout.growthPoints);
        break;
      default:
        break;
    }

    set({
      currency,
      currencyTransactions,
      sprout,
      missions: {
        ...s.missions,
        missions: s.missions.missions.map((m) =>
          m.id === missionId ? { ...m, claimed: true } : m,
        ),
      },
    });
    get().persist();
    return { success: true };
  },

  trackMissionAction: (actionType) => {
    set((s) => ({ missions: updateMissionProgress(s.missions, actionType) }));
    get().persist();
  },

  openCollection: () => {
    set((s) => recordActivity(s, 'openCollection'));
    get().persist();
  },

  updateSettings: (settings) => {
    set((s) => ({ settings: { ...s.settings, ...settings } }));
    get().persist();
  },

  dismissNotification: (id) => {
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) }));
    get().persist();
  },

  markNotificationRead: (id) => {
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    }));
    get().persist();
  },

  markAllNotificationsRead: () => {
    set((s) => ({
      notifications: s.notifications.map((n) => ({ ...n, read: true })),
    }));
    get().persist();
  },

  applyWarmWelcomeStreak: () => {
    set((s) => ({ streak: applyWarmWelcome(s.streak) }));
    get().persist();
  },

  dismissWelcomeBack: () => {
    set({ showWelcomeBack: false, welcomeBackShown: true });
    get().persist();
  },

  checkWelcomeBack: () => {
    const s = get();
    if (!s.onboardingComplete || s.welcomeBackShown) return;
    const elapsed = Date.now() - new Date(s.lastActiveAt).getTime();
    if (elapsed >= WELCOME_BACK_THRESHOLD_MS) {
      const messages = [
        "I missed you. I'm glad you came back.",
        'Your garden kept your place warm.',
        'A butterfly visited while you were away.',
        'Welcome back. Everything is still here.',
      ];
      set({
        showWelcomeBack: true,
        welcomeBackMessage: messages[Math.floor(Math.random() * messages.length)],
        sprout: { ...s.sprout, emotion: 'welcomingBack' },
      });
      if (elapsed >= WELCOME_GIFT_THRESHOLD_MS) {
        const inv = s.inventory.find((i) => i.giftId === 'cookie');
        if (inv) {
          set((st) => ({
            inventory: st.inventory.map((i) =>
              i.giftId === 'cookie' ? { ...i, quantity: i.quantity + 1 } : i,
            ),
            giftTransactions: [
              {
                id: generateId('gift'),
                giftId: 'cookie',
                senderId: 'garden',
                senderName: 'Your Garden',
                receiverId: st.player.id,
                receiverName: st.player.name,
                sentAt: new Date().toISOString(),
                opened: false,
                direction: 'received' as const,
              },
              ...st.giftTransactions,
            ],
            unopenedGiftCount: st.unopenedGiftCount + 1,
          }));
        }
      }
    }
  },

  simulateKawnActivity: (eventType) => {
    const s = get();
    const updates = simulateKawnEvent(s, eventType);
    set(updates);
    get().persist();
  },

  getEffectiveTheme: () => {
    const s = get();
    if (s.settings.themeOverride !== 'auto') return s.settings.themeOverride;
    return getThemeFromTime();
  },

  tickStatusDecay: () => {
    set((s) => ({
      sprout: {
        ...s.sprout,
        status: {
          ...s.sprout.status,
          hydration: clamp(s.sprout.status.hydration - 1, 20, 100),
          happiness: clamp(s.sprout.status.happiness - 1, 20, 100),
        },
      },
    }));
  },

  setVillageMoveMode: (enabled) => set({ villageMoveMode: enabled }),

  setVillageThreadOpen: (open) => set({ villageThreadOpen: open }),

  moveVillageSprout: (position) => {
    if (!isWalkablePosition(position)) return { success: false };
    set({ villagePosition: position, villageMoveMode: false });
    get().persist();
    return { success: true };
  },

  discoverWorldObject: (objectId) => {
    set((s) => {
      if (s.discoveredWorldObjects.includes(objectId)) return s;
      return {
        discoveredWorldObjects: [...s.discoveredWorldObjects, objectId],
        notifications: addNotification(s, 'You discovered something new in the village!', 'discovery'),
      };
    });
    get().persist();
  },

  discoverSecret: (secretId) => {
    set((s) => {
      if (s.discoveredSecrets.includes(secretId)) return s;
      return { discoveredSecrets: [...s.discoveredSecrets, secretId] };
    });
    get().persist();
  },

  postVillageShout: (text) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 120) return { success: false };
    const s = get();
    const msg = {
      id: generateId('msg'),
      kind: 'shout' as const,
      threadId: null,
      replyToId: null,
      senderId: s.player.id,
      senderName: s.player.name,
      anchorResidentId: PLAYER_SPROUT_ID,
      participantIds: [] as string[],
      text: trimmed,
      timestamp: new Date().toISOString(),
    };
    set((st) => ({ villageMessages: [...st.villageMessages, msg].slice(-80) }));
    get().persist();
    return { success: true };
  },

  replyToVillageMessage: (messageId, text) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 120) return { success: false };
    const s = get();
    const parent = s.villageMessages.find((m) => m.id === messageId);
    if (!parent) return { success: false };
    const threadId = parent.threadId ?? `thread-${parent.id}`;
    const participantIds = [...new Set([parent.senderId, s.player.id])].sort();

    const msg = {
      id: generateId('msg'),
      kind: 'thread' as const,
      threadId,
      replyToId: messageId,
      senderId: s.player.id,
      senderName: s.player.name,
      anchorResidentId: PLAYER_SPROUT_ID,
      participantIds,
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    set((st) => ({ villageMessages: [...st.villageMessages, msg].slice(-80) }));

    const friend = s.friends.find((f) => f.id === parent.senderId);
    if (friend) {
      const replies = [
        'Oh hi! So nice to hear from you!',
        'That made me smile!',
        'Want to explore the meadow together?',
      ];
      const replyText = replies[Math.floor(Math.random() * replies.length)];
      window.setTimeout(() => {
        const st = get();
        const friendMsg = {
          id: generateId('msg'),
          kind: 'thread' as const,
          threadId,
          replyToId: msg.id,
          senderId: friend.id,
          senderName: friend.name,
          anchorResidentId: friend.id,
          participantIds,
          text: replyText,
          timestamp: new Date().toISOString(),
        };
        set({ villageMessages: [...st.villageMessages, friendMsg].slice(-80) });
        get().persist();
      }, 1800);
    }

    get().persist();
    return { success: true, threadId };
  },

  startDirectVillageChat: (friendId, text) => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > 120) return { success: false };
    const s = get();
    const friend = s.friends.find((f) => f.id === friendId);
    if (!friend) return { success: false };

    const threadId = `thread-direct-${friendId}`;
    const participantIds = [...new Set([friendId, s.player.id])].sort();

    const msg = {
      id: generateId('msg'),
      kind: 'thread' as const,
      threadId,
      replyToId: null,
      senderId: s.player.id,
      senderName: s.player.name,
      anchorResidentId: PLAYER_SPROUT_ID,
      participantIds,
      text: trimmed,
      timestamp: new Date().toISOString(),
    };

    set((st) => ({ villageMessages: [...st.villageMessages, msg].slice(-80) }));

    const replies = [
      'Oh hi! So nice to hear from you!',
      'That made me smile!',
      'Want to explore the meadow together?',
    ];
    const replyText = replies[Math.floor(Math.random() * replies.length)];
    window.setTimeout(() => {
      const st = get();
      const friendMsg = {
        id: generateId('msg'),
        kind: 'thread' as const,
        threadId,
        replyToId: msg.id,
        senderId: friend.id,
        senderName: friend.name,
        anchorResidentId: friend.id,
        participantIds,
        text: replyText,
        timestamp: new Date().toISOString(),
      };
      set({ villageMessages: [...st.villageMessages, friendMsg].slice(-80) });
      get().persist();
    }, 1800);

    get().persist();
    return { success: true, threadId };
  },

  goHome: () => {
    set({ villagePosition: { ...HOME_POSITION } });
    get().persist();
  },

  collectTreasure: (treasureId) => {
    const s = get();
    const treasure = WORLD_TREASURES.find((t) => t.id === treasureId);
    if (!treasure) return { success: false, message: 'Treasure not found.' };

    const collection = ensureTreasureDay(s.treasureCollection);
    const result = collectTreasureService(treasure, s.currency, s.currencyTransactions, collection);
    if (!result.success) return { success: false, message: result.message };

    const hadShop = s.currency.diamonds >= SHOP_UNLOCK_DIAMONDS;
    const updates: Partial<GameStore> = {
      currency: result.balance,
      currencyTransactions: result.transactions,
      treasureCollection: result.collection,
    };

    if (!hadShop && result.balance.diamonds >= SHOP_UNLOCK_DIAMONDS) {
      updates.notifications = addNotification(
        s,
        'You found enough diamonds! The cottage shop is now open.',
        'discovery',
      );
    }

    set(updates);
    get().persist();
    get().trackMissionAction('collectTreasure');
    return { success: true };
  },

  buyHouseItem: (itemId) => {
    const s = get();
    if (s.currency.diamonds < SHOP_UNLOCK_DIAMONDS) {
      return { success: false, message: 'Collect 10 diamonds to unlock the shop.' };
    }
    const item = HOUSE_SHOP_ITEMS.find((i) => i.id === itemId);
    if (!item) return { success: false, message: 'Item not found.' };

    const result = buyHouseItemService(s.currency, s.currencyTransactions, s.houseProgress, item);
    if (!result.success) return { success: false, message: result.message };

    set({
      currency: result.balance,
      currencyTransactions: result.transactions,
      houseProgress: result.progress,
      notifications: addNotification(s, `New cozy item: ${item.name}!`, 'discovery'),
    });
    get().persist();
    get().trackMissionAction('buyHouseItem');
    return { success: true };
  },

  isShopUnlocked: () => get().currency.diamonds >= SHOP_UNLOCK_DIAMONDS,

  purchaseShopItem: (itemId) => {
    const s = get();
    const result = executeShopPurchase(itemId, {
      balance: s.currency,
      transactions: s.currencyTransactions,
      inventory: s.shopInventory,
      playerLevel: s.player.level,
      butterfliesDiscovered: s.stats.butterfliesDiscovered,
    });
    if (!result.success) {
      return { ...result, message: result.message };
    }
    const item = result.item;
    set({
      currency: result.balance,
      currencyTransactions: result.transactions,
      shopInventory: result.inventory,
      shopPurchaseHistory: [...s.shopPurchaseHistory, result.record].slice(-50),
      notifications: addNotification(s, `${item.name} is now yours!`, 'discovery'),
    });
    get().persist();
    get().trackMissionAction('purchaseShopItem');
    return { success: true, itemId, message: `${item.name} is now yours!` };
  },

  equipShopHat: (hatId) => {
    set((st) => ({ equippedCosmetics: equipHat(st.equippedCosmetics, hatId) }));
    get().persist();
  },

  previewShopHat: (hatId) => {
    set((st) => ({ equippedCosmetics: previewHat(st.equippedCosmetics, hatId) }));
  },

  clearShopHatPreview: () => {
    set((st) => ({ equippedCosmetics: clearHatPreview(st.equippedCosmetics) }));
  },

  equipShopVehicle: (vehicleId) => {
    set((st) => ({ equippedVehicle: equipVehicle(st.equippedVehicle, vehicleId) }));
    get().persist();
  },

  equipAndRideShopVehicle: (vehicleId) => {
    set({ equippedVehicle: equipAndMountVehicle(vehicleId) });
    get().persist();
  },

  mountShopVehicle: () => {
    set((st) => ({ equippedVehicle: mountVehicle(st.equippedVehicle) }));
  },

  dismountShopVehicle: () => {
    set((st) => ({ equippedVehicle: dismountVehicle(st.equippedVehicle) }));
  },

  placeShopFurniture: (itemId, slotIndex = 0) => {
    const s = get();
    if (!s.shopInventory.some((o) => o.itemId === itemId)) {
      return { success: false, message: 'You do not own this item.' };
    }
    const item = getShopItem(itemId);
    if (!item?.placeable) return { success: false, message: 'This item cannot be placed.' };
    set({ furniturePlacements: addFurniturePlacement(s.furniturePlacements, itemId, slotIndex) });
    get().persist();
    return { success: true, message: `${item.name} placed in your cottage!` };
  },

  completeShopTutorial: () => {
    set((st) => ({ shopState: { ...st.shopState, tutorialComplete: true } }));
    get().persist();
  },

  setShopLastCategory: (cat) => {
    set((st) => ({ shopState: { ...st.shopState, lastCategory: cat } }));
  },
}));

export const usePlayer = () => useGameStore((s) => s.player);
export const useSprout = () => useGameStore((s) => s.sprout);
export const useSettings = () => useGameStore((s) => s.settings);
export const useOnboardingComplete = () => useGameStore((s) => s.onboardingComplete);
