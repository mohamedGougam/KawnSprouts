import { useState, useEffect, type ReactNode } from 'react';
import { Droplets, Bird, Sparkles, Paintbrush } from 'lucide-react';
import { useGameStore } from '../../app/store/gameStore';
import { Link } from 'react-router-dom';
import { formatCooldown } from '../../utils/gameUtils';

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className = '' }: QuickActionsProps) {
  const waterSprout = useGameStore((s) => s.waterSprout);
  const feedBirds = useGameStore((s) => s.feedBirds);
  const enterDecorationMode = useGameStore((s) => s.enterDecorationMode);
  const sprout = useGameStore((s) => s.sprout);
  const cooldowns = useGameStore((s) => s.activityCooldowns);
  const [message, setMessage] = useState('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const waterRemaining = cooldowns.water ? Math.max(0, cooldowns.water - now) : 0;

  return (
    <div className={className}>
      <div className="flex justify-center gap-2">
        <ActionButton
          icon={<Droplets size={20} />}
          label="Water"
          onClick={() => {
            const result = waterSprout();
            if (!result.success && result.message) setMessage(result.message);
            else setMessage('');
          }}
          disabled={waterRemaining > 0}
        />
        <ActionButton
          icon={<Bird size={20} />}
          label="Feed birds"
          onClick={() => {
            const result = feedBirds();
            if (!result.success && result.message) setMessage(result.message);
          }}
        />
        <ActionButton icon={<Sparkles size={20} />} label="Activities" asLink to="/activities" />
        <ActionButton icon={<Paintbrush size={20} />} label="Decorate" onClick={enterDecorationMode} />
      </div>
      {message && (
        <p className="mt-2 text-center text-xs text-gray-600" role="status">
          {message}
          {waterRemaining > 0 && ` (${formatCooldown(waterRemaining)} remaining)`}
        </p>
      )}
      {!message && waterRemaining > 0 && (
        <p className="mt-2 text-center text-xs text-gray-500">
          {sprout.name} has enough water for now.
        </p>
      )}
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  disabled,
  asLink,
  to,
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  asLink?: boolean;
  to?: string;
}) {
  const className =
    'focus-ring flex min-h-[48px] min-w-[72px] flex-col items-center justify-center gap-1 rounded-2xl bg-white/90 px-2 py-2 text-xs font-medium text-gray-700 shadow-sm transition hover:bg-white disabled:opacity-50';

  if (asLink && to) {
    return (
      <Link to={to} className={className} aria-label={label}>
        {icon}
        {label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={className} aria-label={label}>
      {icon}
      {label}
    </button>
  );
}
