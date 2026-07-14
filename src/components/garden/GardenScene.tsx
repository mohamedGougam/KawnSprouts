import { motion } from 'framer-motion';
import { useGameStore } from '../../app/store/gameStore';
import { SproutCharacter } from '../character/SproutCharacter';
import { PlayerMiniCard } from '../player/PlayerMiniCard';
import { StatusSummary } from '../status/StatusSummary';
import { QuickActions } from './QuickActions';
import { GardenDecorationsLayer } from '../decorations/GardenDecorationsLayer';
import { ButterflyWidget } from './ButterflyWidget';
import { WelcomeBackModal } from './WelcomeBackModal';
import { CareNeedsBanner } from './CareNeedsBanner';
import { getCareNeed } from '../../services/careNeedsService';
import { Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect } from 'react';

const SKY_GRADIENTS = {
  day: 'from-sky-300 via-sky-100 to-green-100',
  evening: 'from-orange-200 via-pink-100 to-green-100',
  night: 'from-indigo-900 via-purple-800 to-indigo-700',
};

export function GardenScene() {
  const player = useGameStore((s) => s.player);
  const sprout = useGameStore((s) => s.sprout);
  const speechBubble = useGameStore((s) => s.speechBubble);
  const activeButterflyId = useGameStore((s) => s.activeButterflyId);
  const butterflies = useGameStore((s) => s.butterflies);
  const notifications = useGameStore((s) => s.notifications);
  const decorationMode = useGameStore((s) => s.decorationMode);
  const settings = useGameStore((s) => s.settings);
  const getEffectiveTheme = useGameStore((s) => s.getEffectiveTheme);
  const tapSprout = useGameStore((s) => s.tapSprout);
  const spawnButterfly = useGameStore((s) => s.spawnButterfly);
  const lastWateredAt = useGameStore((s) => s.lastWateredAt);
  const showWelcomeBack = useGameStore((s) => s.showWelcomeBack);

  const careNeed = getCareNeed(lastWateredAt, sprout.name);
  const displayEmotion = careNeed.level !== 'content' ? careNeed.emotion : sprout.emotion;

  useEffect(() => {
    if (decorationMode) return;
    const id = window.setInterval(() => {
      if (Math.random() < 0.35) spawnButterfly();
    }, 45_000);
    const initial = window.setTimeout(() => spawnButterfly(), 8_000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(initial);
    };
  }, [decorationMode, spawnButterfly]);

  const theme = getEffectiveTheme();
  const unreadCount = notifications.filter((n) => !n.read).length;
  const reduced = settings.reducedMotion;

  return (
    <div className="relative min-h-[calc(100dvh-5rem)] overflow-hidden">
      {/* Sky */}
      <div className={`absolute inset-0 bg-gradient-to-b ${SKY_GRADIENTS[theme]}`} />

      {/* Sun / Moon */}
      {theme === 'day' && (
        <motion.div
          className="absolute right-8 top-16 h-14 w-14 rounded-full bg-yellow-200 shadow-lg"
          animate={reduced ? {} : { scale: [1, 1.05, 1] }}
          transition={{ duration: 6, repeat: Infinity }}
          aria-hidden="true"
        />
      )}
      {theme === 'night' && (
        <>
          <div className="absolute right-10 top-12 h-12 w-12 rounded-full bg-yellow-100 opacity-90 shadow-lg" aria-hidden="true" />
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute h-1 w-1 rounded-full bg-white opacity-80"
              style={{ top: `${10 + (i * 17) % 40}%`, left: `${5 + (i * 23) % 90}%` }}
              aria-hidden="true"
            />
          ))}
        </>
      )}

      {/* Clouds */}
      {!reduced &&
        [0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white/70"
            style={{
              width: 60 + i * 20,
              height: 24,
              top: `${15 + i * 8}%`,
              left: `${-20 + i * 30}%`,
            }}
            animate={{ x: ['0%', '120%'] }}
            transition={{ duration: 30 + i * 10, repeat: Infinity, ease: 'linear' }}
            aria-hidden="true"
          />
        ))}

      {/* Hills */}
      <div className="absolute bottom-0 h-2/5 w-full">
        <div className="absolute bottom-20 h-32 w-full rounded-[100%] bg-green-300/60" aria-hidden="true" />
        <div className="absolute bottom-10 h-40 w-full rounded-[100%] bg-garden-grass" aria-hidden="true" />
        <div className="absolute bottom-0 h-24 w-full bg-garden-grass-dark" aria-hidden="true" />
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-start justify-between gap-2 p-3">
        <PlayerMiniCard player={player} className="max-w-[200px] shrink-0" />
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="focus-ring rounded-full bg-white/85 px-3 py-2 text-xs font-medium text-gray-600 shadow-sm"
          >
            Village
          </Link>
          <Link
          to="/notifications"
          className="focus-ring relative flex h-10 w-10 items-center justify-center rounded-full bg-white/85 shadow-sm"
          aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        >
          <Bell size={20} className="text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-peach-400 text-xs font-bold text-white">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Link>
        </div>
      </div>

      <CareNeedsBanner />

      {/* Garden content */}
      <div className="relative z-10 flex flex-col items-center px-4 pb-4">
        {!decorationMode && (
          <GardenDecorationsLayer />
        )}

        {/* Flowers decoration */}
        <div className="absolute bottom-28 flex w-full justify-around px-4" aria-hidden="true">
          {['🌼', '🌸', '🌷', '🌻'].map((f, i) => (
            <span key={i} className="text-2xl opacity-80">{f}</span>
          ))}
        </div>

        <SproutCharacter
          color={sprout.color}
          emotion={displayEmotion}
          growthStage={sprout.growthStage}
          name={sprout.name}
          onTap={tapSprout}
          speechBubble={speechBubble}
          className="relative z-20 mt-8"
        />

        {activeButterflyId && (
          <ButterflyWidget
            butterflyId={activeButterflyId}
            butterflies={butterflies}
          />
        )}

        {!activeButterflyId && !decorationMode && (
          <button
            type="button"
            onClick={spawnButterfly}
            className="sr-only focus:not-sr-only focus-ring mt-2 rounded-full bg-white/80 px-3 py-1 text-xs"
          >
            Spawn butterfly (accessibility)
          </button>
        )}

        <StatusSummary className="mt-4 w-full max-w-sm" />
        <QuickActions className="mt-3 w-full max-w-sm" />
      </div>

      {theme === 'night' && (
        <div className="pointer-events-none absolute bottom-32 left-4 text-2xl opacity-70" aria-hidden="true">
          🏮
        </div>
      )}

      {showWelcomeBack && <WelcomeBackModal />}
    </div>
  );
}
