import type { AtmosphereState } from './atmosphereService';

let indoorInterval: ReturnType<typeof setInterval> | null = null;
let indoorPadOsc: OscillatorNode | null = null;
let indoorPadGain: GainNode | null = null;
let outdoorDucked = false;

function getCtx(): AudioContext {
  const w = window as unknown as { __kawnAudioCtx?: AudioContext };
  if (!w.__kawnAudioCtx) w.__kawnAudioCtx = new AudioContext();
  return w.__kawnAudioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType, volume: number) {
  const ac = getCtx();
  if (ac.state === 'suspended') void ac.resume();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ac.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ac.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  osc.connect(gain);
  gain.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration + 0.05);
}

export type HouseSoundType =
  | 'door-creak'
  | 'wood-knock'
  | 'wood-bounce'
  | 'page-turn'
  | 'leaf-rustle'
  | 'fire-crackle'
  | 'clock-tick'
  | 'cushion'
  | 'spoon'
  | 'steam'
  | 'wind-window'
  | 'bird-outside'
  | 'kettle'
  | 'footstep'
  | 'mouse-scurry'
  | 'chime-soft';

export function playHouseSound(sound: HouseSoundType, volume = 0.12) {
  switch (sound) {
    case 'door-creak':
      playTone(120, 0.45, 'sawtooth', volume * 0.5);
      setTimeout(() => playTone(95, 0.35, 'triangle', volume * 0.35), 80);
      break;
    case 'wood-knock':
      playTone(180, 0.08, 'square', volume * 0.55);
      break;
    case 'wood-bounce':
      playTone(220, 0.1, 'sine', volume * 0.45);
      break;
    case 'page-turn':
      playTone(340, 0.12, 'triangle', volume * 0.35);
      break;
    case 'leaf-rustle':
      playTone(420, 0.18, 'triangle', volume * 0.4);
      break;
    case 'fire-crackle':
      playTone(90, 0.25, 'square', volume * 0.35);
      setTimeout(() => playTone(70, 0.2, 'sawtooth', volume * 0.25), 60);
      break;
    case 'clock-tick':
      playTone(800, 0.05, 'sine', volume * 0.5);
      break;
    case 'cushion':
      playTone(160, 0.14, 'sine', volume * 0.4);
      break;
    case 'spoon':
      playTone(520, 0.06, 'sine', volume * 0.45);
      break;
    case 'steam':
      playTone(280, 0.22, 'sine', volume * 0.3);
      break;
    case 'wind-window':
      playTone(110, 0.4, 'triangle', volume * 0.3);
      break;
    case 'bird-outside':
      playTone(920, 0.1, 'sine', volume * 0.4);
      setTimeout(() => playTone(1100, 0.08, 'sine', volume * 0.3), 70);
      break;
    case 'kettle':
      playTone(600, 0.3, 'sine', volume * 0.35);
      break;
    case 'footstep':
      playTone(140, 0.06, 'square', volume * 0.25);
      break;
    case 'mouse-scurry':
      playTone(400, 0.08, 'triangle', volume * 0.2);
      setTimeout(() => playTone(450, 0.06, 'triangle', volume * 0.15), 50);
      break;
    case 'chime-soft':
      playTone(660, 0.35, 'sine', volume * 0.35);
      break;
  }
}

function startIndoorPad(theme: AtmosphereState['theme']) {
  stopIndoorPad();
  const ac = getCtx();
  indoorPadOsc = ac.createOscillator();
  indoorPadGain = ac.createGain();
  indoorPadOsc.type = 'sine';
  indoorPadOsc.frequency.value = theme === 'night' ? 98 : theme === 'evening' ? 110 : 130;
  indoorPadGain.gain.value = 0.018;
  indoorPadOsc.connect(indoorPadGain);
  indoorPadGain.connect(ac.destination);
  indoorPadOsc.start();
}

function stopIndoorPad() {
  try {
    indoorPadOsc?.stop();
  } catch {
    /* stopped */
  }
  indoorPadOsc = null;
  indoorPadGain = null;
}

export function startIndoorAmbience(enabled: boolean, atmosphere: AtmosphereState, hasFireplace: boolean) {
  stopIndoorAmbience();
  if (!enabled) return;

  startIndoorPad(atmosphere.theme);
  outdoorDucked = true;

  indoorInterval = setInterval(() => {
    const r = Math.random();
    if (r < 0.2) playHouseSound('clock-tick', 0.06);
    else if (r < 0.35 && hasFireplace) playHouseSound('fire-crackle', 0.08);
    else if (r < 0.5) playHouseSound('wind-window', 0.05);
    else if (r < 0.65) playHouseSound('bird-outside', 0.04);
    else if (r < 0.8) playHouseSound('door-creak', 0.04);
    else playHouseSound('chime-soft', 0.03);
  }, 9000);
}

export function stopIndoorAmbience() {
  if (indoorInterval) clearInterval(indoorInterval);
  indoorInterval = null;
  stopIndoorPad();
  outdoorDucked = false;
}

export function isOutdoorAudioDucked() {
  return outdoorDucked;
}

export function duckOutdoorAmbience() {
  outdoorDucked = true;
}

export function restoreOutdoorAmbience() {
  outdoorDucked = false;
}
