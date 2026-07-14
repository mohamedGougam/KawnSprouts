import { describe, it, expect, beforeEach } from 'vitest';
import { useGameStore } from '../app/store/gameStore';
import { createDefaultState } from '../data/initialData';
import { LocalStorageGameStateRepository } from '../repositories/GameStateRepository';
import { STORAGE_KEY } from '../config/gameConfig';
import {
  canShowAge,
  getGrowthStageFromPoints,
  validateAge,
  validatePlayerName,
  pickDailyMissions,
} from '../utils/gameUtils';
import { canPlaceDecoration } from '../services/gardenService';
import { applyTransaction } from '../services/currencyService';
import { ensureDailyMissions, updateMissionProgress } from '../services/missionService';
import { updateStreakOnActivity, applyWarmWelcome } from '../services/streakService';
import { getCareNeed, getKawnDisplayAge, WATER_GENTLE_MS, WATER_URGENT_MS } from '../services/careNeedsService';
import { simulateKawnEvent } from '../features/integration/kawnIntegration';

function resetStore() {
  const fresh = createDefaultState();
  useGameStore.setState({
    ...fresh,
    hydrated: true,
    pendingGardenLayout: null,
    decorationMode: false,
    selectedDecorationId: null,
    activeButterflyId: null,
    showWelcomeBack: false,
    welcomeBackMessage: '',
    speechBubble: null,
    lastTapTime: 0,
  });
}

describe('Kawn Sprouts', () => {
  beforeEach(() => {
    localStorage.clear();
    resetStore();
  });

  it('1. onboarding completion persists', () => {
    useGameStore.getState().completeOnboarding({
      sproutName: 'Pip',
      sproutColor: 'mint',
      playerName: 'Maya',
      playerAge: 12,
      avatar: 'pastel-smile',
      showAge: true,
    });
    useGameStore.getState().persist();
    const repo = new LocalStorageGameStateRepository();
    const loaded = repo.load();
    expect(loaded?.onboardingComplete).toBe(true);
    expect(loaded?.sprout.name).toBe('Pip');
  });

  it('2. player name can be edited', () => {
    const result = useGameStore.getState().updatePlayer({ name: 'Alex' });
    expect(result.success).toBe(true);
    expect(useGameStore.getState().player.name).toBe('Alex');
  });

  it('3. age can be edited and validated', () => {
    expect(useGameStore.getState().updatePlayer({ age: 15 }).success).toBe(true);
    expect(useGameStore.getState().updatePlayer({ age: 3 }).success).toBe(false);
    expect(validateAge(3)).toBeTruthy();
    expect(validateAge(12)).toBeNull();
  });

  it('4. age visibility hides age correctly', () => {
    expect(canShowAge(true, false, 12)).toBe(false);
    expect(canShowAge(true, true, 12)).toBe(true);
  });

  it('5. minor age is not shown to unknown users', () => {
    expect(canShowAge(false, true, 12)).toBe(false);
  });

  it('6. player name validation works', () => {
    expect(validatePlayerName('A')).toBeTruthy();
    expect(validatePlayerName('Maya')).toBeNull();
  });

  it('7. watering increases hydration', () => {
    const before = useGameStore.getState().sprout.status.hydration;
    useGameStore.getState().waterSprout();
    expect(useGameStore.getState().sprout.status.hydration).toBeGreaterThan(before);
  });

  it('8. watering cooldown prevents repeated farming', () => {
    useGameStore.getState().waterSprout();
    const result = useGameStore.getState().waterSprout();
    expect(result.success).toBe(false);
  });

  it('9. feeding birds increases kindness', () => {
    const before = useGameStore.getState().sprout.status.kindness;
    useGameStore.getState().feedBirds();
    expect(useGameStore.getState().sprout.status.kindness).toBeGreaterThan(before);
  });

  it('10. butterfly collection records new discoveries', () => {
    const result = useGameStore.getState().collectButterfly('sunny-wing');
    expect(result.success).toBe(true);
    expect(result.isNew).toBe(true);
    const b = useGameStore.getState().butterflies.find((x) => x.id === 'sunny-wing');
    expect(b?.discovered).toBe(true);
  });

  it('11. duplicate butterflies award fallback reward', () => {
    useGameStore.getState().collectButterfly('sunny-wing');
    const coinsBefore = useGameStore.getState().currency.gardenCoins;
    useGameStore.getState().collectButterfly('sunny-wing');
    expect(useGameStore.getState().currency.gardenCoins).toBeGreaterThan(coinsBefore);
  });

  it('12. growth points advance growth stages', () => {
    expect(getGrowthStageFromPoints(0)).toBe('tinySeedling');
    expect(getGrowthStageFromPoints(100)).toBe('littleSprout');
    expect(getGrowthStageFromPoints(900)).toBe('treehouseGuardian');
  });

  it('13. garden placement prevents overlap', () => {
    const state = useGameStore.getState();
    const dec = state.decorations.find((d) => d.id === 'bench')!;
    const layout = [{ id: 'p1', decorationId: 'bench', position: { x: 0, y: 0 } }];
    expect(canPlaceDecoration({ x: 0, y: 0 }, dec, layout, state.decorations)).toBe(false);
    expect(canPlaceDecoration({ x: 4, y: 0 }, dec, layout, state.decorations)).toBe(true);
  });

  it('14. garden layout persists after reload', () => {
    useGameStore.setState((s) => ({
      garden: {
        ...s.garden,
        placements: [{ id: 'p1', decorationId: 'bench', position: { x: 1, y: 1 } }],
      },
    }));
    useGameStore.getState().persist();
    const loaded = new LocalStorageGameStateRepository().load();
    expect(loaded?.garden.placements).toHaveLength(1);
  });

  it('15. currency cannot become negative', () => {
    const balance = { gardenCoins: 10, heartSeeds: 5, diamonds: 0, gold: 0 };
    const result = applyTransaction(balance, [], 'coins', 20, 'spend', 'test');
    expect(result.success).toBe(false);
    expect(result.balance.gardenCoins).toBe(10);
  });

  it('16. gift sending reduces inventory', () => {
    const before = useGameStore.getState().inventory.find((i) => i.giftId === 'acorn')!.quantity;
    useGameStore.getState().sendGift('lina', 'acorn');
    const after = useGameStore.getState().inventory.find((i) => i.giftId === 'acorn')!.quantity;
    expect(after).toBe(before - 1);
  });

  it('17. daily gift limits work', () => {
    useGameStore.getState().sendGift('lina', 'acorn');
    const result = useGameStore.getState().sendGift('lina', 'cookie');
    expect(result.success).toBe(false);
  });

  it('18. daily missions remain stable across refreshes', () => {
    const m1 = ensureDailyMissions({ date: '', missions: [] });
    const m2 = ensureDailyMissions(m1);
    expect(m1.missions.map((x) => x.id)).toEqual(m2.missions.map((x) => x.id));
  });

  it('19. mission rewards cannot be claimed twice', () => {
    const missions = ensureDailyMissions({ date: '2026-07-14', missions: [] });
    const updated = updateMissionProgress(missions, missions.missions[0].actionType);
    const mission = { ...updated.missions[0], completed: true, progress: 1 };
    useGameStore.setState({ missions: { date: '2026-07-14', missions: [mission] } });
    useGameStore.getState().claimMissionReward(mission.id);
    const result = useGameStore.getState().claimMissionReward(mission.id);
    expect(result.success).toBe(false);
  });

  it('20. caring streak pauses safely', () => {
    let streak = {
      current: 5,
      longest: 5,
      lastActiveDate: '2020-01-01',
      paused: false,
      warmWelcomeAvailable: false,
    };
    streak = updateStreakOnActivity(streak);
    expect(streak.paused || streak.warmWelcomeAvailable).toBe(true);
    expect(streak.current).toBe(5);
  });

  it('21. warm welcome restores streak', () => {
    const streak = applyWarmWelcome({
      current: 5,
      longest: 5,
      lastActiveDate: '2020-01-01',
      paused: true,
      warmWelcomeAvailable: true,
    });
    expect(streak.warmWelcomeAvailable).toBe(false);
    expect(streak.paused).toBe(false);
  });

  it('22. reset removes only prototype data', () => {
    localStorage.setItem('other-app', 'keep');
    localStorage.setItem(STORAGE_KEY, '{}');
    useGameStore.getState().resetPrototype();
    expect(localStorage.getItem('other-app')).toBe('keep');
    expect(useGameStore.getState().onboardingComplete).toBe(false);
  });

  it('23. reduced motion setting exists', () => {
    useGameStore.getState().updateSettings({ reducedMotion: true });
    expect(useGameStore.getState().settings.reducedMotion).toBe(true);
  });

  it('24. corrupted LocalStorage falls back safely', () => {
    localStorage.setItem(STORAGE_KEY, '{invalid json');
    const repo = new LocalStorageGameStateRepository();
    expect(repo.load()).toBeNull();
  });

  it('25. Kawn activity event simulation updates state', () => {
    const state = createDefaultState();
    const updates = simulateKawnEvent(state, 'POST_CREATED');
    expect(updates.sprout?.growthPoints).toBeGreaterThan(state.sprout.growthPoints);
  });

  it('daily mission pick is deterministic', () => {
    const a = pickDailyMissions('2026-07-14');
    const b = pickDailyMissions('2026-07-14');
    expect(a).toEqual(b);
  });

  it('care need gentle after 8 hours without water', () => {
    const last = new Date(Date.now() - WATER_GENTLE_MS - 1000).toISOString();
    const care = getCareNeed(last, 'Pip');
    expect(care.level).toBe('gentle');
    expect(care.emotion).toBe('thirsty');
  });

  it('care need urgent after 3 days without water', () => {
    const last = new Date(Date.now() - WATER_URGENT_MS - 1000).toISOString();
    const care = getCareNeed(last, 'Pip');
    expect(care.level).toBe('urgent');
    expect(care.emotion).toBe('sad');
  });

  it('kawn age hidden when privacy disabled', () => {
    expect(getKawnDisplayAge(12, false, true)).toBeNull();
    expect(getKawnDisplayAge(12, true, true)).toBe(12);
  });

  it('move village sprout persists position', () => {
    useGameStore.getState().moveVillageSprout({ x: 825, y: 600 });
    expect(useGameStore.getState().villagePosition).toEqual({ x: 825, y: 600 });
  });

  it('village shout posts public message', () => {
    const r = useGameStore.getState().postVillageShout('Hi everyone!');
    expect(r.success).toBe(true);
    expect(useGameStore.getState().villageMessages.some((m) => m.text === 'Hi everyone!' && m.kind === 'shout')).toBe(true);
  });

  it('village thread reply creates thread message', () => {
    const msgs = useGameStore.getState().villageMessages;
    const linaShout = msgs.find((m) => m.senderId === 'lina');
    expect(linaShout).toBeTruthy();
    const r = useGameStore.getState().replyToVillageMessage(linaShout!.id, 'Hello Lina!');
    expect(r.success).toBe(true);
    expect(useGameStore.getState().villageMessages.some((m) => m.kind === 'thread' && m.text === 'Hello Lina!')).toBe(true);
  });

  it('direct village chat starts without a public shout', () => {
    const r = useGameStore.getState().startDirectVillageChat('noor', 'Hi Noor!');
    expect(r.success).toBe(true);
    expect(
      useGameStore.getState().villageMessages.some(
        (m) => m.kind === 'thread' && m.text === 'Hi Noor!' && m.threadId === 'thread-direct-noor',
      ),
    ).toBe(true);
  });

  it('collecting treasure adds diamonds and persists', () => {
    const r = useGameStore.getState().collectTreasure('gem-1');
    expect(r.success).toBe(true);
    expect(useGameStore.getState().currency.diamonds).toBe(1);
    useGameStore.getState().persist();
    const loaded = new LocalStorageGameStateRepository().load();
    expect(loaded?.currency.diamonds).toBe(1);
    expect(loaded?.treasureCollection.collectedToday).toContain('gem-1');
  });

  it('house shop unlocks at 10 diamonds and purchases persist', () => {
    const store = useGameStore.getState();
    for (let i = 1; i <= 10; i++) {
      store.collectTreasure(`gem-${i}`);
    }
    expect(useGameStore.getState().isShopUnlocked()).toBe(true);
    useGameStore.setState((s) => ({
      currency: { ...s.currency, gold: 20 },
    }));
    const buy = useGameStore.getState().buyHouseItem('woven-rug');
    expect(buy.success).toBe(true);
    expect(useGameStore.getState().houseProgress.ownedItemIds).toContain('woven-rug');
    useGameStore.getState().persist();
    const loaded = new LocalStorageGameStateRepository().load();
    expect(loaded?.houseProgress.ownedItemIds).toContain('woven-rug');
  });
});
