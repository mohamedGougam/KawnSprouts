import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { GameLayout } from '../../components/layout/GameLayout';
import { OnboardingFlow } from '../../features/onboarding/OnboardingFlow';
import { VillageWorldView } from '../../components/village/VillageWorldView';
import { GardenScene } from '../../components/garden/GardenScene';
import { DecorationModePanel } from '../../components/decorations/DecorationModePanel';

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
  const decorationMode = useGameStore((s) => s.decorationMode);
  const villageMoveMode = useGameStore((s) => s.villageMoveMode);
  const villageThreadOpen = useGameStore((s) => s.villageThreadOpen);
  const settings = useGameStore((s) => s.settings);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

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
