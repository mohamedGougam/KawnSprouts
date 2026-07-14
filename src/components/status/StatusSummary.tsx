import { useGameStore } from '../../app/store/gameStore';
import { GROWTH_STAGE_THRESHOLDS } from '../../config/gameConfig';
import { getGrowthProgress } from '../../utils/gameUtils';

interface StatusSummaryProps {
  className?: string;
}

const STATUS_LABELS = [
  { key: 'happiness' as const, label: 'Feeling cheerful', low: 'A quiet moment together sounds lovely.' },
  { key: 'hydration' as const, label: 'Nicely watered', low: 'A little water would make Pip smile.' },
  { key: 'kindness' as const, label: 'Kind-hearted', low: 'A bird is waiting for a snack.' },
  { key: 'growth' as const, label: 'Growing well', low: 'The garden could use a caring touch.' },
  { key: 'friendship' as const, label: 'Friendship glowing', low: 'Visiting a friend could brighten the day.' },
];

export function StatusSummary({ className = '' }: StatusSummaryProps) {
  const sprout = useGameStore((s) => s.sprout);
  const progress = getGrowthProgress(sprout.growthPoints, sprout.growthStage);
  const stageLabel = GROWTH_STAGE_THRESHOLDS[sprout.growthStage].label;

  return (
    <div className={`rounded-2xl bg-white/80 p-3 shadow-sm backdrop-blur-sm ${className}`}>
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-semibold text-gray-700">{stageLabel}</span>
        <span className="text-gray-500">
          {progress.required > 0
            ? `${progress.current}/${progress.required} to next stage`
            : 'Max stage!'}
        </span>
      </div>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-300 to-mint-400"
          style={{ width: `${progress.percentage}%` }}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {STATUS_LABELS.map(({ key, label, low }) => {
          const value = sprout.status[key === 'growth' ? 'growth' : key];
          const isLow = value < 50;
          return (
            <div key={key} className="rounded-xl bg-white/60 px-2 py-1.5">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-medium text-gray-600">{label}</span>
                <span className="text-[10px] text-gray-400">{value}%</span>
              </div>
              <div className="mt-1 h-1 overflow-hidden rounded-full bg-gray-100">
                <div
                  className={`h-full rounded-full ${isLow ? 'bg-peach-300' : 'bg-mint-300'}`}
                  style={{ width: `${value}%` }}
                />
              </div>
              {isLow && (
                <p className="mt-0.5 text-[9px] text-gray-500">{low.replace('Pip', sprout.name)}</p>
              )}
            </div>
          );
        })}
      </div>
      {sprout.status.dailyStreak > 0 && (
        <p className="mt-2 text-center text-xs text-mint-500">
          🌟 Caring streak: {sprout.status.dailyStreak} days
        </p>
      )}
    </div>
  );
}
