import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlayerAvatar, SproutColor } from '../../models';
import { useGameStore } from '../../app/store/gameStore';
import { SproutCharacter } from '../../components/character/SproutCharacter';
import { AVATAR_EMOJI, SPROUT_COLOR_MAP } from '../../config/gameConfig';
import { TERMINOLOGY, chooseKawnieeColor, kawnieeNameLabel, meetFirstKawniee, nameYourKawniee } from '../../config/terminology';
import { validateAge, validatePlayerName, validateSproutName } from '../../utils/gameUtils';

const SPROUT_COLORS: { id: SproutColor; label: string }[] = [
  { id: 'mint', label: 'Mint' },
  { id: 'peach', label: 'Peach' },
  { id: 'lavender', label: 'Lavender' },
  { id: 'sky', label: 'Sky blue' },
  { id: 'sunny', label: 'Soft yellow' },
];

const AVATARS: { id: PlayerAvatar; label: string }[] = [
  { id: 'pastel-smile', label: 'Smile' },
  { id: 'pastel-star', label: 'Star' },
  { id: 'pastel-flower', label: 'Flower' },
  { id: 'pastel-heart', label: 'Heart' },
  { id: 'pastel-cloud', label: 'Cloud' },
];

export function OnboardingFlow() {
  const completeOnboarding = useGameStore((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [sproutColor, setSproutColor] = useState<SproutColor>('mint');
  const [sproutName, setSproutName] = useState('Pip');
  const [playerName, setPlayerName] = useState('Maya');
  const [playerAge, setPlayerAge] = useState(12);
  const [avatar, setAvatar] = useState<PlayerAvatar>('pastel-smile');
  const [showAge, setShowAge] = useState(true);
  const [error, setError] = useState('');

  const next = () => setStep((s) => s + 1);

  const handleComplete = () => {
    const nameErr = validateSproutName(sproutName);
    const playerErr = validatePlayerName(playerName);
    const ageErr = validateAge(playerAge);
    if (nameErr || playerErr || ageErr) {
      setError(nameErr ?? playerErr ?? ageErr ?? '');
      return;
    }
    completeOnboarding({
      sproutName,
      sproutColor,
      playerName,
      playerAge,
      avatar,
      showAge,
    });
  };

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-sky-100 to-green-50 p-6">
      <AnimatePresence mode="wait">
        {step === 0 && (
          <Step key="welcome" title={`Welcome to ${TERMINOLOGY.product.name}`} subtitle={TERMINOLOGY.definition}>
            <div className="mb-8 text-6xl" aria-hidden="true">🌱</div>
            <button type="button" onClick={next} className="focus-ring rounded-full bg-mint-400 px-8 py-4 text-lg font-bold text-white shadow-lg">
              {meetFirstKawniee().replace('.', '')}
            </button>
          </Step>
        )}
        {step === 1 && (
          <Step key="color" title={chooseKawnieeColor()}>
            <div className="mb-6 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {SPROUT_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSproutColor(c.id)}
                  className={`focus-ring flex flex-col items-center gap-2 rounded-2xl p-3 ${sproutColor === c.id ? 'bg-white shadow-md ring-2 ring-mint-400' : 'bg-white/60'}`}
                  aria-pressed={sproutColor === c.id}
                >
                  <div className="h-10 w-10 rounded-full" style={{ background: SPROUT_COLOR_MAP[c.id].body }} />
                  <span className="text-xs">{c.label}</span>
                </button>
              ))}
            </div>
            <SproutCharacter color={sproutColor} emotion="happy" growthStage="tinySeedling" size="sm" />
            <button type="button" onClick={next} className="focus-ring mt-6 rounded-full bg-mint-400 px-8 py-3 font-semibold text-white">
              Continue
            </button>
          </Step>
        )}
        {step === 2 && (
          <Step key="name" title={nameYourKawniee()}>
            <label htmlFor="sprout-name" className="mb-2 block text-sm font-medium text-gray-700">
              {kawnieeNameLabel()}
            </label>
            <input
              id="sprout-name"
              value={sproutName}
              onChange={(e) => setSproutName(e.target.value)}
              className="focus-ring mb-4 w-full rounded-xl border border-gray-200 px-4 py-3"
              maxLength={16}
            />
            <button type="button" onClick={next} className="focus-ring rounded-full bg-mint-400 px-8 py-3 font-semibold text-white">
              Continue
            </button>
          </Step>
        )}
        {step === 3 && (
          <Step key="player" title="Create your player card">
            <div className="space-y-3 text-left">
              <div>
                <label htmlFor="player-name" className="text-sm font-medium">Player name</label>
                <input id="player-name" value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="focus-ring mt-1 w-full rounded-xl border px-4 py-2" />
              </div>
              <div>
                <label htmlFor="player-age" className="text-sm font-medium">Age</label>
                <input id="player-age" type="number" value={playerAge} onChange={(e) => setPlayerAge(Number(e.target.value))} className="focus-ring mt-1 w-full rounded-xl border px-4 py-2" min={5} max={120} />
              </div>
              <fieldset>
                <legend className="text-sm font-medium">Avatar</legend>
                <div className="mt-2 flex gap-2">
                  {AVATARS.map((a) => (
                    <button key={a.id} type="button" onClick={() => setAvatar(a.id)} className={`focus-ring rounded-full p-2 text-2xl ${avatar === a.id ? 'ring-2 ring-mint-400' : ''}`} aria-pressed={avatar === a.id}>
                      {AVATAR_EMOJI[a.id]}
                    </button>
                  ))}
                </div>
              </fieldset>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={showAge} onChange={(e) => setShowAge(e.target.checked)} />
                Show age to approved friends
              </label>
            </div>
            <button type="button" onClick={next} className="focus-ring mt-6 rounded-full bg-mint-400 px-8 py-3 font-semibold text-white">
              Continue
            </button>
          </Step>
        )}
        {step === 4 && (
          <Step key="plant" title="Plant the seed">
            <motion.div className="relative mb-8 h-32 w-32" aria-hidden="true">
              <motion.div animate={{ y: [0, 60] }} transition={{ duration: 1.5 }} className="absolute left-1/2 top-0 -translate-x-1/2 text-3xl">🌰</motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: [0, 1, 0.5] }} transition={{ delay: 1, duration: 1 }} className="absolute bottom-0 left-1/2 -translate-x-1/2 text-4xl">✨</motion.div>
              <div className="absolute bottom-0 h-8 w-full rounded-full bg-amber-800/60" />
            </motion.div>
            <button type="button" onClick={next} className="focus-ring rounded-full bg-mint-400 px-8 py-3 font-semibold text-white">
              Watch it grow
            </button>
          </Step>
        )}
        {step === 5 && (
          <Step key="arrival" title={`${sproutName} is happy to meet you.`}>
            <SproutCharacter color={sproutColor} emotion="excited" growthStage="tinySeedling" />
            {error && <p className="mb-4 text-sm text-red-500" role="alert">{error}</p>}
            <button type="button" onClick={handleComplete} className="focus-ring mt-6 rounded-full bg-mint-400 px-8 py-4 text-lg font-bold text-white shadow-lg">
              Enter the garden
            </button>
          </Step>
        )}
      </AnimatePresence>
      <p className="mt-8 text-sm text-gray-500">{TERMINOLOGY.product.tagline}</p>
    </div>
  );
}

function Step({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex max-w-md flex-col items-center text-center"
    >
      <h1 className="mb-2 text-2xl font-bold text-gray-800">{title}</h1>
      {subtitle && <p className="mb-6 text-gray-600">{subtitle}</p>}
      {children}
    </motion.div>
  );
}
