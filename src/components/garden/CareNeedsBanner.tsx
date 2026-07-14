import { Link } from 'react-router-dom';
import { Droplets } from 'lucide-react';
import { useGameStore } from '../../app/store/gameStore';
import { getCareNeed } from '../../services/careNeedsService';

export function CareNeedsBanner() {
  const sprout = useGameStore((s) => s.sprout);
  const lastWateredAt = useGameStore((s) => s.lastWateredAt);
  const waterSprout = useGameStore((s) => s.waterSprout);

  const care = getCareNeed(lastWateredAt, sprout.name);

  if (care.level === 'content') return null;

  const urgent = care.level === 'urgent';

  return (
    <div
      className={`mx-3 mt-2 rounded-2xl p-4 shadow-sm ${
        urgent ? 'bg-orange-50 ring-1 ring-orange-200' : 'bg-sky-50 ring-1 ring-sky-100'
      }`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl" aria-hidden="true">
          {urgent ? '🥺' : '💧'}
        </span>
        <div className="flex-1">
          <p className={`text-sm font-medium ${urgent ? 'text-orange-800' : 'text-sky-800'}`}>
            {care.message}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => waterSprout()}
              className={`focus-ring flex min-h-[44px] items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white ${
                urgent ? 'bg-orange-400' : 'bg-sky-400'
              }`}
            >
              <Droplets size={16} />
              {care.actionLabel}
            </button>
            <Link
              to="/"
              className="focus-ring flex min-h-[44px] items-center rounded-full px-4 py-2 text-sm text-gray-600"
            >
              Back to village
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
