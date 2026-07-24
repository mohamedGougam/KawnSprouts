import { AVATAR_EMOJI } from '../../config/gameConfig';
import type { Player } from '../../models';
import { canShowAge, getExperienceProgress } from '../../utils/gameUtils';

interface PlayerMiniCardProps {
  player: Player;
  showAge?: boolean;
  viewerIsApprovedFriend?: boolean;
  compact?: boolean;
  className?: string;
}

export function PlayerMiniCard({
  player,
  showAge = true,
  viewerIsApprovedFriend = true,
  compact = false,
  className = '',
}: PlayerMiniCardProps) {
  const ageVisible =
    showAge && canShowAge(viewerIsApprovedFriend, player.privacy?.showAgeToFriends ?? true, player.age);
  const xpProgress = getExperienceProgress(player.experience);

  return (
    <div
      className={`flex items-center gap-2 rounded-2xl bg-white/85 px-3 py-2 shadow-sm backdrop-blur-sm ${compact ? 'text-xs' : 'text-sm'} ${className}`}
      role="region"
      aria-label={`Player ${player.name}, level ${player.level}`}
    >
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-mint-100 to-lavender-100 text-lg"
        aria-hidden="true"
      >
        {AVATAR_EMOJI[player.avatar] ?? '😊'}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate font-semibold text-gray-800">{player.name}</span>
          <span className="shrink-0 rounded-full bg-mint-100 px-2 py-0.5 text-xs font-medium text-mint-500">
            Lv {player.level}
          </span>
        </div>
        {ageVisible && (
          <span className="text-xs text-gray-500">Age {player.age}</span>
        )}
        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-mint-400 to-sky-400 transition-all"
            style={{ width: `${xpProgress}%` }}
            role="progressbar"
            aria-valuenow={xpProgress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Experience progress"
          />
        </div>
      </div>
    </div>
  );
}
