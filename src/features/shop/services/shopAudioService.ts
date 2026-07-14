/** Soft procedural shop sounds — respects existing audio settings pattern */

let lastAt = 0;
const COOLDOWN = 350;

function getCtx(): AudioContext {
  const w = window as unknown as { __kawnAudioCtx?: AudioContext };
  if (!w.__kawnAudioCtx) w.__kawnAudioCtx = new AudioContext();
  return w.__kawnAudioCtx;
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number) {
  const now = Date.now();
  if (now - lastAt < COOLDOWN) return;
  lastAt = now;
  const ac = getCtx();
  if (ac.state === 'suspended') void ac.resume();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ac.currentTime);
  gain.gain.linearRampToValueAtTime(vol, ac.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + dur + 0.05);
}

export type ShopSound =
  | 'bell'
  | 'door'
  | 'purchase-gold'
  | 'purchase-diamond'
  | 'equip-hat'
  | 'bike-bell'
  | 'error'
  | 'celebrate'
  | 'preview';

export function playShopSound(s: ShopSound, enabled = true) {
  if (!enabled) return;
  switch (s) {
    case 'bell':
      tone(880, 0.25, 'sine', 0.1);
      setTimeout(() => tone(660, 0.2, 'sine', 0.07), 60);
      break;
    case 'door':
      tone(140, 0.3, 'triangle', 0.06);
      break;
    case 'purchase-gold':
      tone(520, 0.12, 'square', 0.08);
      setTimeout(() => tone(680, 0.1, 'sine', 0.06), 50);
      break;
    case 'purchase-diamond':
      tone(740, 0.2, 'sine', 0.09);
      setTimeout(() => tone(980, 0.15, 'sine', 0.07), 70);
      break;
    case 'equip-hat':
      tone(400, 0.1, 'sine', 0.07);
      break;
    case 'bike-bell':
      tone(920, 0.08, 'sine', 0.1);
      break;
    case 'error':
      tone(220, 0.15, 'sawtooth', 0.05);
      break;
    case 'celebrate':
      tone(660, 0.15, 'sine', 0.08);
      setTimeout(() => tone(880, 0.12, 'sine', 0.07), 80);
      break;
    case 'preview':
      tone(340, 0.08, 'triangle', 0.05);
      break;
  }
}
