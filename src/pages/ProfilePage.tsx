import { useState } from 'react';
import { useGameStore } from '../app/store/gameStore';
import { PlayerMiniCard } from '../components/player/PlayerMiniCard';
import { AVATAR_EMOJI } from '../config/gameConfig';
import { kawnieeNameLabel } from '../config/terminology';
import type { PlayerAvatar, SproutColor } from '../models';

const AVATARS: PlayerAvatar[] = ['pastel-smile', 'pastel-star', 'pastel-flower', 'pastel-heart', 'pastel-cloud'];
const COLORS: SproutColor[] = ['mint', 'peach', 'lavender', 'sky', 'sunny'];

export function ProfilePage() {
  const player = useGameStore((s) => s.player);
  const sprout = useGameStore((s) => s.sprout);
  const stats = useGameStore((s) => s.stats);
  const streak = useGameStore((s) => s.streak);
  const currency = useGameStore((s) => s.currency);
  const settings = useGameStore((s) => s.settings);
  const updatePlayer = useGameStore((s) => s.updatePlayer);
  const updatePrivacy = useGameStore((s) => s.updatePrivacy);
  const updateSprout = useGameStore((s) => s.updateSprout);
  const updateSettings = useGameStore((s) => s.updateSettings);
  const resetPrototype = useGameStore((s) => s.resetPrototype);

  const [name, setName] = useState(player.name);
  const [age, setAge] = useState(player.age);
  const [sproutName, setSproutName] = useState(sprout.name);
  const [statusMessage, setStatusMessage] = useState(player.statusMessage);
  const [saveMsg, setSaveMsg] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = () => {
    const r1 = updatePlayer({ name, age, statusMessage, avatar: player.avatar });
    const r2 = updateSprout({ name: sproutName, color: sprout.color });
    if (!r1.success) setSaveMsg(r1.error ?? 'Error saving');
    else if (!r2.success) setSaveMsg(r2.error ?? 'Error saving');
    else {
      setSaveMsg('Saved successfully!');
      setTimeout(() => setSaveMsg(''), 2000);
    }
  };

  return (
    <div className="p-4 pb-8">
      <h1 className="mb-4 text-xl font-bold">Profile</h1>
      <PlayerMiniCard player={player} className="mb-4" />

      <div className="mb-4 flex gap-4 rounded-2xl bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs text-gray-500">Garden Coins</p>
          <p className="text-lg font-bold text-yellow-600">🪙 {currency.gardenCoins}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Heart Seeds</p>
          <p className="text-lg font-bold text-pink-500">💗 {currency.heartSeeds}</p>
        </div>
      </div>

      <section className="mb-4 space-y-3 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="font-semibold">Edit profile</h2>
        <label className="block text-sm">
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} className="focus-ring mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="block text-sm">
          Age
          <input type="number" value={age} onChange={(e) => setAge(Number(e.target.value))} className="focus-ring mt-1 w-full rounded-xl border px-3 py-2" min={5} max={120} />
        </label>
        <label className="block text-sm">
          {kawnieeNameLabel()}
          <input value={sproutName} onChange={(e) => setSproutName(e.target.value)} className="focus-ring mt-1 w-full rounded-xl border px-3 py-2" />
        </label>
        <label className="block text-sm">
          Status message
          <input value={statusMessage} onChange={(e) => setStatusMessage(e.target.value)} className="focus-ring mt-1 w-full rounded-xl border px-3 py-2" maxLength={60} />
        </label>
        <fieldset>
          <legend className="text-sm">Avatar</legend>
          <div className="mt-1 flex gap-2">
            {AVATARS.map((a) => (
              <button key={a} type="button" onClick={() => updatePlayer({ avatar: a })} className={`text-2xl ${player.avatar === a ? 'ring-2 ring-mint-400 rounded-full' : ''}`}>
                {AVATAR_EMOJI[a]}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-sm">Sprout color</legend>
          <div className="mt-1 flex gap-2">
            {COLORS.map((c) => (
              <button key={c} type="button" onClick={() => updateSprout({ color: c })} className={`h-8 w-8 rounded-full capitalize ${sprout.color === c ? 'ring-2 ring-mint-400' : ''}`} style={{ background: c === 'mint' ? '#6ee7b7' : c === 'peach' ? '#fdba74' : c === 'lavender' ? '#c4b5fd' : c === 'sky' ? '#7dd3fc' : '#fde047' }} aria-label={c} />
            ))}
          </div>
        </fieldset>
        <button type="button" onClick={handleSave} className="focus-ring w-full rounded-full bg-mint-400 py-3 font-semibold text-white">
          Save changes
        </button>
        {saveMsg && <p className="text-center text-sm text-mint-500" role="status">{saveMsg}</p>}
      </section>

      <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Stats</h2>
        <dl className="grid grid-cols-2 gap-2 text-sm">
          <Stat label="Caring streak" value={streak.current} />
          <Stat label="Flowers" value={stats.flowersDiscovered} />
          <Stat label="Butterflies" value={stats.butterfliesDiscovered} />
          <Stat label="Friends visited" value={stats.friendsVisited} />
          <Stat label="Gifts sent" value={stats.giftsSent} />
          <Stat label="Gifts received" value={stats.giftsReceived} />
        </dl>
      </section>

      <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Privacy</h2>
        <PrivacyToggle label="Show age to approved friends" checked={player.privacy?.showAgeToFriends ?? true} onChange={(v) => updatePrivacy({ showAgeToFriends: v })} hint="Only approved friends can see your age when enabled." />
        <PrivacyToggle label="Allow friend garden visits" checked={player.privacy?.allowFriendVisits ?? true} onChange={(v) => updatePrivacy({ allowFriendVisits: v })} hint="Friends can visit your garden preview." />
        <PrivacyToggle label="Allow gifts" checked={player.privacy?.allowGifts ?? true} onChange={(v) => updatePrivacy({ allowGifts: v })} hint="Receive small gifts from friends." />
        <PrivacyToggle label="Allow hearts" checked={player.privacy?.allowHearts ?? true} onChange={(v) => updatePrivacy({ allowHearts: v })} hint="Friends can send you hearts." />
        <PrivacyToggle label="Show recent activity" checked={player.privacy?.showRecentActivity ?? true} onChange={(v) => updatePrivacy({ showRecentActivity: v })} hint="Friends see gentle activity updates." />
        <PrivacyToggle label="Reduce social visibility" checked={player.privacy?.reduceSocialVisibility ?? false} onChange={(v) => updatePrivacy({ reduceSocialVisibility: v })} hint="Appear quieter in friend lists." />
      </section>

      <section className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-3 font-semibold">Settings</h2>
        <PrivacyToggle label="Music" checked={settings.musicEnabled} onChange={(v) => updateSettings({ musicEnabled: v })} />
        <PrivacyToggle label="Sound effects" checked={settings.soundEffectsEnabled} onChange={(v) => updateSettings({ soundEffectsEnabled: v })} />
        <PrivacyToggle label="Character sounds" checked={settings.characterSoundsEnabled} onChange={(v) => updateSettings({ characterSoundsEnabled: v })} />
        <PrivacyToggle label="Reduced motion" checked={settings.reducedMotion} onChange={(v) => updateSettings({ reducedMotion: v })} hint="Gentler animations throughout the app." />
        <PrivacyToggle label="Notifications" checked={settings.notificationsEnabled} onChange={(v) => updateSettings({ notificationsEnabled: v })} />
        <label className="mt-3 block text-sm">
          Text size
          <select value={settings.textSize} onChange={(e) => updateSettings({ textSize: e.target.value as 'sm' | 'md' | 'lg' })} className="focus-ring mt-1 w-full rounded-xl border px-3 py-2">
            <option value="sm">Small</option>
            <option value="md">Medium</option>
            <option value="lg">Large</option>
          </select>
        </label>
        <label className="mt-3 block text-sm">
          Theme preview
          <select value={settings.themeOverride} onChange={(e) => updateSettings({ themeOverride: e.target.value as 'auto' | 'day' | 'evening' | 'night' })} className="focus-ring mt-1 w-full rounded-xl border px-3 py-2">
            <option value="auto">Auto (device time)</option>
            <option value="day">Day</option>
            <option value="evening">Evening</option>
            <option value="night">Night</option>
          </select>
        </label>
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-semibold">About Kawn Sprouts</h2>
        <p className="text-sm text-gray-600">Grow happiness together. A heartwarming social mini-game prototype.</p>
        <button type="button" onClick={() => setShowResetConfirm(true)} className="focus-ring mt-4 w-full rounded-full border-2 border-red-200 py-3 text-sm font-medium text-red-400">
          Reset prototype data
        </button>
      </section>

      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4" role="dialog" aria-modal="true">
          <div className="max-w-sm rounded-3xl bg-white p-6">
            <h3 className="font-bold">Reset prototype data?</h3>
            <p className="mt-2 text-sm text-gray-600">This will remove all local progress and return you to onboarding. Other browser data will not be affected.</p>
            <div className="mt-4 flex gap-2">
              <button type="button" onClick={() => setShowResetConfirm(false)} className="focus-ring flex-1 rounded-full border py-2">Cancel</button>
              <button type="button" onClick={() => { resetPrototype(); setShowResetConfirm(false); }} className="focus-ring flex-1 rounded-full bg-red-400 py-2 text-white">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-gray-50 p-2">
      <dt className="text-xs text-gray-500">{label}</dt>
      <dd className="font-bold">{value}</dd>
    </div>
  );
}

function PrivacyToggle({ label, checked, onChange, hint }: { label: string; checked: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex items-start gap-3 border-b border-gray-50 py-3 last:border-0">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-1" />
      <div>
        <span className="text-sm font-medium">{label}</span>
        {hint && <p className="text-xs text-gray-400">{hint}</p>}
      </div>
    </label>
  );
}
