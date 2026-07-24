import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { GameLayout } from '../../components/layout/GameLayout';
import { OnboardingFlow } from '../../features/onboarding/OnboardingFlow';
import { VillageWorldView } from '../../components/village/VillageWorldView';
import { GardenScene } from '../../components/garden/GardenScene';
import { DecorationModePanel } from '../../components/decorations/DecorationModePanel';
import { useKawnActivityPoll } from '../../hooks/useKawnActivityPoll';

import { KawnApiGameStateRepository } from '../../repositories/KawnApiGameStateRepository';
import { setActiveRepo } from '../store/gameStore';
import { fetchKawnIdentity, getKawnLaunchParams } from '../../features/integration/kawnBridge';

const ActivitiesPage = lazy(() => import('../../pages/ActivitiesPage').then((m) => ({ default: m.ActivitiesPage })));
const FriendsPage = lazy(() => import('../../pages/FriendsPage').then((m) => ({ default: m.FriendsPage })));
const CollectionsPage = lazy(() => import('../../pages/CollectionsPage').then((m) => ({ default: m.CollectionsPage })));
const ProfilePage = lazy(() => import('../../pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const NotificationsPage = lazy(() => import('../../pages/NotificationsPage').then((m) => ({ default: m.NotificationsPage })));
const DevSimulatorPage = lazy(() => import('../../pages/DevSimulatorPage').then((m) => ({ default: m.DevSimulatorPage })));

function Loading() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="text-4xl animate-pulse" aria-label="Loading">🌱</div>
    </div>
  );
}

function AppRoutes() {
  const hydrated = useGameStore((s) => s.hydrated);
  const onboardingComplete = useGameStore((s) => s.onboardingComplete);
  const hydrate = useGameStore((s) => s.hydrate);
  const hydrateFromApi = useGameStore((s) => s.hydrateFromApi);
  const decorationMode = useGameStore((s) => s.decorationMode);
  const villageMoveMode = useGameStore((s) => s.villageMoveMode);
  const villageThreadOpen = useGameStore((s) => s.villageThreadOpen);
  const settings = useGameStore((s) => s.settings);

  // Start polling for Kawn activity reward events (no-ops in dev/standalone mode)
  useKawnActivityPoll();

  useEffect(() => {
    async function boot() {
      const { kawnUserId, displayName, age, kawnToken, apiBase } = getKawnLaunchParams();

      if (kawnToken && apiBase) {
        // ── Production path: running inside the Kawn Flutter WebView ──
        try {
          // Swap the store's repo to the API-backed one for all future saves
          const apiRepo = new KawnApiGameStateRepository(apiBase, kawnToken);
          setActiveRepo(apiRepo);

          // Fetch saved state + identity in parallel to minimise boot time
          const [serverState, identity] = await Promise.all([
            apiRepo.load(),
            fetchKawnIdentity(apiBase, kawnToken),
          ]);

          hydrateFromApi(
            serverState,
            identity?.kawnUserId ?? kawnUserId ?? undefined,
            identity?.displayName ?? displayName ?? undefined,
            identity?.age ?? age ?? undefined,
            identity?.friends,
          );

          if (!identity && kawnToken && apiBase) {
            // Background retry for identity if network call timed out during boot
            fetchKawnIdentity(apiBase, kawnToken).then((retryIdentity) => {
              if (retryIdentity?.friends && retryIdentity.friends.length > 0) {
                const VALID_COLORS = ['mint', 'peach', 'lavender', 'sky', 'sunny'];
                const VALID_AVATARS = ['pastel-smile', 'pastel-star', 'pastel-flower', 'pastel-heart', 'pastel-cloud'];
                useGameStore.setState({
                  friends: retryIdentity.friends.map((f) => ({
                    id: f.id,
                    name: f.name,
                    age: undefined,
                    kawnAge: undefined,
                    level: f.level ?? 1,
                    avatar: (f.avatar && VALID_AVATARS.includes(f.avatar) ? f.avatar : 'pastel-smile') as any,
                    sproutName: f.sproutName ?? f.name,
                    sproutColor: (f.sproutColor && VALID_COLORS.includes(f.sproutColor) ? f.sproutColor : 'mint') as any,
                    gardenTheme: 'day',
                    recentActivity: '',
                    friendshipStatus: 'approved' as const,
                    privacy: { showAgeToFriends: false, allowVisits: true, allowGifts: true },
                    lastInteraction: new Date().toISOString(),
                  })),
                });
                useGameStore.getState().persist();
              }
            });
          }
        } catch (err) {
          console.error('[Sprouts] API boot failed — falling back to localStorage:', err);
          hydrate(); // Always safe to fall back
        }
      } else {
        // ── Dev / standalone path: use localStorage as before ──
        hydrate();
      }
    }

    void boot();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', settings.reducedMotion);
    document.documentElement.classList.remove('text-size-sm', 'text-size-md', 'text-size-lg');
    document.documentElement.classList.add(`text-size-${settings.textSize}`);
  }, [settings.reducedMotion, settings.textSize]);

  if (!hydrated) return <Loading />;

  if (!onboardingComplete) {
    return <OnboardingFlow />;
  }

  const showDev = new URLSearchParams(window.location.search).has('dev');

  return (
    <GameLayout hideNav={decorationMode || villageMoveMode || villageThreadOpen}>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<VillageWorldView />} />
          <Route path="/home" element={<><GardenScene />{decorationMode && <DecorationModePanel />}</>} />
          <Route path="/activities" element={<ActivitiesPage />} />
          <Route path="/friends" element={<FriendsPage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          {showDev && <Route path="/dev/simulator" element={<DevSimulatorPage />} />}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </GameLayout>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
