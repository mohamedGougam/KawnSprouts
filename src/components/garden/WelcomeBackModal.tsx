import { useGameStore } from '../../app/store/gameStore';

export function WelcomeBackModal() {
  const message = useGameStore((s) => s.welcomeBackMessage);
  const dismissWelcomeBack = useGameStore((s) => s.dismissWelcomeBack);
  const sprout = useGameStore((s) => s.sprout);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-back-title"
    >
      <div className="max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
        <div className="mb-3 text-4xl" aria-hidden="true">
          🌸
        </div>
        <h2 id="welcome-back-title" className="mb-2 text-lg font-bold text-gray-800">
          Welcome back!
        </h2>
        <p className="mb-4 text-sm text-gray-600">{message}</p>
        <p className="mb-6 text-sm font-medium text-mint-500">{sprout.name} is happy to see you.</p>
        <button
          type="button"
          onClick={dismissWelcomeBack}
          className="focus-ring w-full rounded-full bg-mint-400 py-3 font-semibold text-white"
        >
          Enter the garden
        </button>
      </div>
    </div>
  );
}
