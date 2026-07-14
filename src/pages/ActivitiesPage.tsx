import { useState } from 'react';
import { waterYourKawniee } from '../config/terminology';
import { motion } from 'framer-motion';
import { useGameStore } from '../app/store/gameStore';
import { QUIET_TIME_MESSAGES } from '../config/gameConfig';

export function ActivitiesPage() {
  const waterSprout = useGameStore((s) => s.waterSprout);
  const feedBirds = useGameStore((s) => s.feedBirds);
  const quietTime = useGameStore((s) => s.quietTime);
  const completeGardenSong = useGameStore((s) => s.completeGardenSong);
  const sprout = useGameStore((s) => s.sprout);
  const missions = useGameStore((s) => s.missions);
  const claimMissionReward = useGameStore((s) => s.claimMissionReward);
  const streak = useGameStore((s) => s.streak);
  const applyWarmWelcomeStreak = useGameStore((s) => s.applyWarmWelcomeStreak);

  const [quietActive, setQuietActive] = useState(false);
  const [quietMessage, setQuietMessage] = useState('');
  const [songStep, setSongStep] = useState(0);
  const [songActive, setSongActive] = useState(false);
  const [birdsActive, setBirdsActive] = useState(false);
  const [waterAnim, setWaterAnim] = useState(false);
  const [feedback, setFeedback] = useState('');

  const songSequence = [0, 2, 1, 3];

  const handleWater = () => {
    setWaterAnim(true);
    const result = waterSprout();
    setFeedback(result.message ?? (result.success ? 'Splish splash!' : ''));
    setTimeout(() => setWaterAnim(false), 2000);
  };

  const handleBirds = () => {
    setBirdsActive(true);
    const result = feedBirds();
    setFeedback(result.message ?? (result.success ? 'Birds are happy!' : ''));
    setTimeout(() => setBirdsActive(false), 3000);
  };

  const handleQuiet = () => {
    const result = quietTime();
    if (result.success) {
      setQuietActive(true);
      setQuietMessage(result.message ?? QUIET_TIME_MESSAGES[0]);
      setTimeout(() => setQuietActive(false), 4000);
    } else {
      setFeedback(result.message ?? '');
    }
  };

  const handleSongTap = (note: number) => {
    if (!songActive) setSongActive(true);
    if (songSequence[songStep] === note) {
      const next = songStep + 1;
      if (next >= songSequence.length) {
        completeGardenSong();
        setFeedback('Beautiful melody!');
        setSongStep(0);
        setSongActive(false);
      } else {
        setSongStep(next);
      }
    } else {
      setSongStep(0);
      setFeedback('Try again — tap the flowers in order!');
    }
  };

  return (
    <div className={`p-4 ${quietActive ? 'opacity-80' : ''}`}>
      <h1 className="mb-2 text-xl font-bold text-gray-800">Activities</h1>
      <p className="mb-6 text-sm text-gray-600">Gentle ways to care for {sprout.name}</p>

      <section className="mb-6 space-y-3">
        <ActivityCard title={waterYourKawniee()} onAction={handleWater}>
          {waterAnim && (
            <motion.div animate={{ y: [0, 20] }} className="text-center text-3xl">
              💧💧💧
            </motion.div>
          )}
        </ActivityCard>

        <ActivityCard title="Feed the birds" onAction={handleBirds}>
          {birdsActive && (
            <div className="flex justify-center gap-2 text-2xl">
              {['🐦', '🐤', '🐦'].map((b, i) => (
                <motion.span key={i} animate={{ x: [0, 20, 0] }} transition={{ delay: i * 0.3 }}>
                  {b}
                </motion.span>
              ))}
            </div>
          )}
        </ActivityCard>

        <ActivityCard title="Sit with Pip" onAction={handleQuiet}>
          {quietActive && (
            <p className="text-center text-sm text-gray-600 italic">{quietMessage}</p>
          )}
        </ActivityCard>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-2 font-semibold">Garden song</h3>
          <p className="mb-3 text-xs text-gray-500">Tap the flowers in sequence</p>
          <div className="flex justify-center gap-3">
            {['🌸', '🌼', '🌷', '🌻'].map((f, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSongTap(i)}
                className={`focus-ring text-3xl transition ${songActive && songSequence[songStep] === i ? 'scale-110 ring-2 ring-mint-400 rounded-full' : ''}`}
                aria-label={`Flower note ${i + 1}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {feedback && (
        <p className="mb-4 text-center text-sm text-gray-600" role="status">{feedback}</p>
      )}

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-bold">Little things to enjoy today</h2>
        {streak.warmWelcomeAvailable && (
          <button
            type="button"
            onClick={applyWarmWelcomeStreak}
            className="focus-ring mb-3 w-full rounded-xl bg-peach-100 p-3 text-sm text-peach-400"
          >
            Warm Welcome — Your garden kept your place warm. Your caring streak continues.
          </button>
        )}
        <ul className="space-y-3">
          {missions.missions.map((m) => (
            <li key={m.id} className="rounded-xl bg-gray-50 p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">{m.description}</span>
                <span className="text-xs text-gray-400">{m.progress}/{m.targetCount}</span>
              </div>
              {m.completed && !m.claimed && (
                <button
                  type="button"
                  onClick={() => claimMissionReward(m.id)}
                  className="focus-ring mt-2 rounded-full bg-mint-400 px-4 py-1 text-xs font-semibold text-white"
                >
                  Claim {m.reward.label}
                </button>
              )}
              {m.claimed && <span className="mt-1 block text-xs text-mint-500">Claimed ✓</span>}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function ActivityCard({
  title,
  onAction,
  children,
}: {
  title: string;
  onAction: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <button
          type="button"
          onClick={onAction}
          className="focus-ring rounded-full bg-mint-100 px-4 py-2 text-sm font-medium text-mint-500"
        >
          Start
        </button>
      </div>
      {children}
    </div>
  );
}
