import { useState } from 'react';
import { useGameStore } from '../app/store/gameStore';
import { SproutCharacter } from '../components/character/SproutCharacter';
import { PlayerMiniCard } from '../components/player/PlayerMiniCard';
import { Link } from 'react-router-dom';
import { ArrowLeft, Droplets, Gift, Heart, Waves } from 'lucide-react';
import { AVATAR_EMOJI } from '../config/gameConfig';
import { canShowAge } from '../utils/gameUtils';
import { INITIAL_GIFTS } from '../data/initialData';

const FRIEND_THEMES: Record<string, { emoji: string[]; bg: string }> = {
  lina: { emoji: ['💜', '🏮', '🌸'], bg: 'from-purple-100 to-lavender-100' },
  sami: { emoji: ['💧', '🐦', '🌿'], bg: 'from-sky-100 to-blue-100' },
  noor: { emoji: ['🌙', '✨', '🌺'], bg: 'from-indigo-100 to-purple-100' },
  adam: { emoji: ['🌀', '🌼', '🪴'], bg: 'from-yellow-50 to-green-100' },
};

export function FriendsPage() {
  const friends = useGameStore((s) => s.friends);
  const player = useGameStore((s) => s.player);
  const visitFriend = useGameStore((s) => s.visitFriend);
  const sendHeart = useGameStore((s) => s.sendHeart);
  const sendGift = useGameStore((s) => s.sendGift);
  const waterFriendFlower = useGameStore((s) => s.waterFriendFlower);
  const waveToFriend = useGameStore((s) => s.waveToFriend);
  const inventory = useGameStore((s) => s.inventory);
  const [message, setMessage] = useState('');
  const [selectedFriend, setSelectedFriend] = useState<string | null>(
    () => new URLSearchParams(window.location.search).get('id'),
  );
  const [showGiftPicker, setShowGiftPicker] = useState(false);

  const friend = friends.find((f) => f.id === selectedFriend);

  if (!friend) {
    return (
      <div className="p-4">
        <h1 className="mb-4 text-xl font-bold">Friends</h1>
        <ul className="space-y-3">
          {friends.map((f) => (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => {
                  setSelectedFriend(f.id);
                  visitFriend(f.id);
                }}
                className="focus-ring flex w-full items-center gap-3 rounded-2xl bg-white p-4 shadow-sm"
              >
                <span className="text-2xl">{AVATAR_EMOJI[f.avatar] ?? '😊'}</span>
                <div className="text-left">
                  <p className="font-semibold">{f.name}</p>
                  <p className="text-xs text-gray-500">Level {f.level} · {f.sproutName}&apos;s garden</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const theme = FRIEND_THEMES[friend.id] ?? FRIEND_THEMES.adam;
  const ageVisible = canShowAge(true, friend.privacy?.showAgeToFriends ?? true, friend.age);

  const handleAction = (action: () => { success: boolean; message?: string }) => {
    const result = action();
    setMessage(result.success ? '' : (result.message ?? ''));
  };

  return (
    <div className={`min-h-full bg-gradient-to-b ${theme.bg} p-4`}>
      <Link to="/friends" className="focus-ring mb-4 inline-flex items-center gap-1 text-sm text-gray-600" onClick={() => setSelectedFriend(null)}>
        <ArrowLeft size={16} /> Back to friends
      </Link>

      <PlayerMiniCard
        player={{
          ...player,
          id: friend.id,
          name: friend.name,
          age: friend.age ?? 0,
          level: friend.level,
          avatar: friend.avatar,
          privacy: { ...player.privacy, showAgeToFriends: friend.privacy?.showAgeToFriends ?? true },
        }}
        showAge={ageVisible}
        className="mb-4"
      />

      <div className="relative flex flex-col items-center rounded-3xl bg-white/50 py-8">
        <div className="mb-4 flex gap-4 text-3xl" aria-hidden="true">
          {theme.emoji.map((e, i) => (
            <span key={i}>{e}</span>
          ))}
        </div>
        <SproutCharacter
          color={friend.sproutColor}
          emotion="happy"
          growthStage="littleSprout"
          name={friend.sproutName}
        />
        <p className="mt-2 font-medium text-gray-700">{friend.sproutName}</p>
        <p className="text-xs text-gray-500">{friend.recentActivity}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <ActionBtn icon={<Droplets size={18} />} label="Water flower" onClick={() => handleAction(() => waterFriendFlower(friend.id))} />
        <ActionBtn icon={<Waves size={18} />} label="Wave" onClick={() => handleAction(() => waveToFriend(friend.id))} />
        <ActionBtn icon={<Heart size={18} />} label="Send heart" onClick={() => handleAction(() => sendHeart(friend.id))} />
        <ActionBtn icon={<Gift size={18} />} label="Send gift" onClick={() => setShowGiftPicker(true)} />
      </div>

      {message && <p className="mt-3 text-center text-sm text-gray-600" role="status">{message}</p>}

      {showGiftPicker && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/30" role="dialog" aria-modal="true">
          <div className="w-full max-w-[480px] rounded-t-3xl bg-white p-4">
            <h3 className="mb-3 font-bold">Choose a gift</h3>
            <ul className="space-y-2">
              {inventory.filter((i) => i.quantity > 0).map((inv) => {
                const gift = INITIAL_GIFTS.find((g) => g.id === inv.giftId);
                return (
                  <li key={inv.id}>
                    <button
                      type="button"
                      className="focus-ring flex w-full items-center gap-3 rounded-xl bg-gray-50 p-3"
                      onClick={() => {
                        handleAction(() => sendGift(friend.id, inv.giftId));
                        setShowGiftPicker(false);
                      }}
                    >
                      <span className="text-2xl">{gift?.icon}</span>
                      <span>{gift?.name}</span>
                      <span className="ml-auto text-xs text-gray-400">×{inv.quantity}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button type="button" onClick={() => setShowGiftPicker(false)} className="focus-ring mt-3 w-full py-2 text-gray-500">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ActionBtn({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="focus-ring flex items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-medium shadow-sm">
      {icon}
      {label}
    </button>
  );
}
