import type { WorldObjectType } from '../models';
import type { WorldPosition } from '../models';
import type { AtmosphereState } from './atmosphereService';
import { WORLD_REGIONS } from '../config/villageConfig';

let ctx: AudioContext | null = null;
const lastSoundByCategory: Record<string, number> = {};
const CATEGORY_COOLDOWN_MS: Record<string, number> = {
  sfx: 80,
  blob: 60,
  ambient: 400,
};

let musicTimer: ReturnType<typeof setInterval> | null = null;
let ambientInterval: ReturnType<typeof setInterval> | null = null;
let villageAmbienceInterval: ReturnType<typeof setInterval> | null = null;
let musicGain: GainNode | null = null;
let padGain: GainNode | null = null;
let padOsc: OscillatorNode | null = null;
let isMusicPlaying = false;
let audioUnlocked = false;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

function canPlay(category: string): boolean {
  const now = Date.now();
  const cooldown = CATEGORY_COOLDOWN_MS[category] ?? 120;
  if (now - (lastSoundByCategory[category] ?? 0) < cooldown) return false;
  lastSoundByCategory[category] = now;
  return true;
}

export type WorldSoundType =
  | 'blob'
  | 'splash'
  | 'crack'
  | 'creak'
  | 'rustle'
  | 'bloom'
  | 'thud'
  | 'chime'
  | 'wood-click'
  | 'paddle'
  | 'chirp'
  | 'quack'
  | 'hoot'
  | 'buzz'
  | 'croak'
  | 'echo'
  | 'wind'
  | 'waterfall';

export const OBJECT_SOUND_MAP: Record<WorldObjectType, WorldSoundType> = {
  tree: 'rustle',
  rock: 'thud',
  water: 'splash',
  flower: 'bloom',
  sign: 'creak',
  special: 'chime',
};

function spatialVolume(
  source: WorldPosition,
  listener: WorldPosition,
  baseVolume: number,
  maxDist = 550,
): number {
  const dist = Math.hypot(source.x - listener.x, source.y - listener.y);
  const atten = Math.max(0.04, 1 - dist / maxDist);
  return baseVolume * atten;
}

function spatialPan(source: WorldPosition, listener: WorldPosition): number {
  const dx = source.x - listener.x;
  return Math.max(-1, Math.min(1, dx / 420));
}

function playToneSpatial(
  freq: number,
  duration: number,
  type: OscillatorType,
  volume: number,
  pan: number,
) {
  const ac = getCtx();
  if (ac.state === 'suspended') void ac.resume();
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  const panner = ac.createStereoPanner();
  osc.type = type;
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, ac.currentTime);
  gain.gain.linearRampToValueAtTime(volume, ac.currentTime + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
  panner.pan.value = pan;
  osc.connect(gain);
  gain.connect(panner);
  panner.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + duration + 0.05);
}

export function playWorldSound(
  sound: WorldSoundType,
  source: WorldPosition,
  listener: WorldPosition,
  category = 'sfx',
) {
  if (!canPlay(category)) return;

  const vol = spatialVolume(source, listener, 0.14);
  const pan = spatialPan(source, listener);

  switch (sound) {
    case 'blob':
      playToneSpatial(280, 0.12, 'sine', vol * 1.2, pan);
      setTimeout(() => playToneSpatial(420, 0.08, 'sine', vol, pan), 40);
      break;
    case 'splash':
      playToneSpatial(180, 0.28, 'triangle', vol, pan);
      setTimeout(() => playToneSpatial(240, 0.15, 'sine', vol * 0.5, pan), 120);
      break;
    case 'crack':
      playToneSpatial(90, 0.2, 'square', vol * 0.65, pan);
      break;
    case 'creak':
      playToneSpatial(140, 0.32, 'sawtooth', vol * 0.45, pan);
      break;
    case 'rustle':
      playToneSpatial(320, 0.18, 'triangle', vol * 0.55, pan);
      break;
    case 'bloom':
      playToneSpatial(520, 0.22, 'sine', vol, pan);
      setTimeout(() => playToneSpatial(660, 0.12, 'sine', vol * 0.6, pan), 80);
      break;
    case 'thud':
      playToneSpatial(80, 0.16, 'sine', vol, pan);
      break;
    case 'chime':
      playToneSpatial(660, 0.38, 'sine', vol, pan);
      setTimeout(() => playToneSpatial(880, 0.28, 'sine', vol * 0.65, pan), 110);
      break;
    case 'wood-click':
      playToneSpatial(200, 0.09, 'square', vol * 0.55, pan);
      break;
    case 'paddle':
      playToneSpatial(120, 0.14, 'triangle', vol, pan);
      break;
    case 'chirp':
      playToneSpatial(900, 0.11, 'sine', vol, pan);
      setTimeout(() => playToneSpatial(1100, 0.08, 'sine', vol * 0.5, pan), 60);
      break;
    case 'quack':
      playToneSpatial(220, 0.16, 'square', vol, pan);
      break;
    case 'hoot':
      playToneSpatial(160, 0.42, 'sine', vol, pan);
      break;
    case 'buzz':
      playToneSpatial(400, 0.14, 'sawtooth', vol * 0.45, pan);
      break;
    case 'croak':
      playToneSpatial(150, 0.2, 'square', vol, pan);
      break;
    case 'echo':
      playToneSpatial(300, 0.52, 'sine', vol, pan);
      setTimeout(() => playToneSpatial(280, 0.42, 'sine', vol * 0.45, pan), 220);
      break;
    case 'wind':
      playToneSpatial(100, 0.65, 'triangle', vol * 0.35, pan);
      break;
    case 'waterfall':
      playToneSpatial(140, 0.55, 'sine', vol * 0.45, pan);
      setTimeout(() => playToneSpatial(180, 0.4, 'triangle', vol * 0.3, pan), 150);
      break;
  }
}

export function playObjectSound(
  type: WorldObjectType,
  source: WorldPosition,
  listener: WorldPosition,
) {
  playWorldSound(OBJECT_SOUND_MAP[type] ?? 'chime', source, listener);
}

/** Cute blob pop when tapping animals */
export function playBlobPop(listener?: WorldPosition, source?: WorldPosition) {
  if (listener && source) {
    playWorldSound('blob', source, listener, 'blob');
    return;
  }
  if (!canPlay('blob')) return;
  playToneSpatial(280, 0.12, 'sine', 0.14, 0);
  setTimeout(() => playToneSpatial(420, 0.08, 'sine', 0.1, 0), 40);
}

export function playAnimalAmbient(type: string, source?: WorldPosition, listener?: WorldPosition) {
  const sounds: Record<string, WorldSoundType> = {
    drinking: 'splash',
    jumping: 'splash',
    cleaning: 'splash',
    eating: 'rustle',
    swimming: 'quack',
    hop: 'croak',
    fly: 'chirp',
    sit: 'rustle',
    hoot: 'hoot',
    run: 'rustle',
    wander: 'chirp',
    sniff: 'rustle',
    splash: 'splash',
    dive: 'splash',
  };
  const sound = sounds[type] ?? 'chirp';
  if (source && listener) playWorldSound(sound, source, listener, 'ambient');
  else if (canPlay('ambient')) playToneSpatial(400, 0.18, 'sine', 0.06, 0);
}

const MELODY = [261.63, 293.66, 329.63, 392.0, 349.23, 329.63, 293.66, 261.63, 220.0];

function playMelodyNote(index: number) {
  if (!musicGain) return;
  const ac = getCtx();
  const osc = ac.createOscillator();
  const noteGain = ac.createGain();
  osc.type = 'triangle';
  osc.frequency.value = MELODY[index % MELODY.length];
  noteGain.gain.setValueAtTime(0, ac.currentTime);
  noteGain.gain.linearRampToValueAtTime(0.032, ac.currentTime + 0.1);
  noteGain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 1.4);
  osc.connect(noteGain);
  noteGain.connect(musicGain);
  osc.start();
  osc.stop(ac.currentTime + 1.5);
}

function startMusicPad(ac: AudioContext) {
  stopMusicPad();
  padOsc = ac.createOscillator();
  padGain = ac.createGain();
  padOsc.type = 'sine';
  padOsc.frequency.value = 130.81;
  padGain.gain.value = 0.025;
  padOsc.connect(padGain);
  padGain.connect(ac.destination);
  padOsc.start();
}

function stopMusicPad() {
  try {
    padOsc?.stop();
  } catch {
    /* already stopped */
  }
  padOsc = null;
  padGain = null;
}

export function startAmbientMusic(enabled: boolean) {
  stopAmbientMusic();
  if (!enabled) return;

  const ac = getCtx();
  if (ac.state === 'suspended') void ac.resume();

  musicGain = ac.createGain();
  musicGain.gain.value = 0.2;
  musicGain.connect(ac.destination);
  startMusicPad(ac);

  let note = 0;
  isMusicPlaying = true;
  playMelodyNote(note++);
  musicTimer = setInterval(() => playMelodyNote(note++), 2200);
}

export function stopAmbientMusic() {
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
  musicGain = null;
  stopMusicPad();
  isMusicPlaying = false;
}

export function startRandomAnimalSounds(
  enabled: boolean,
  getAnimals: () => { activity?: string; position?: WorldPosition }[],
  getListener: () => WorldPosition,
) {
  stopRandomAnimalSounds();
  if (!enabled) return;

  ambientInterval = setInterval(() => {
    if (Math.random() > 0.38) return;
    const animals = getAnimals();
    if (!animals.length) return;
    const pick = animals[Math.floor(Math.random() * animals.length)];
    const listener = getListener();
    if (pick.position) playAnimalAmbient(pick.activity ?? 'default', pick.position, listener);
  }, 7500);
}

export function stopRandomAnimalSounds() {
  if (ambientInterval) clearInterval(ambientInterval);
  ambientInterval = null;
}

function isNearWater(pos: WorldPosition): boolean {
  return WORLD_REGIONS.some(
    (r) =>
      (r.id === 'river' || r.id === 'lake' || r.id === 'wetlands') &&
      pos.x >= r.x &&
      pos.x <= r.x + r.width &&
      pos.y >= r.y &&
      pos.y <= r.y + r.height,
  );
}

export function startVillageAmbience(
  enabled: boolean,
  getListener: () => WorldPosition,
  getAtmosphere: () => AtmosphereState,
) {
  stopVillageAmbience();
  if (!enabled) return;

  villageAmbienceInterval = setInterval(() => {
    const pos = getListener();
    const atmosphere = getAtmosphere();

    if (Math.random() < 0.45) {
      playWorldSound('chirp', { x: pos.x + 120, y: pos.y - 80 }, pos, 'ambient');
    }

    if (atmosphere.weather === 'windy' || atmosphere.weather === 'rain') {
      if (Math.random() < 0.35) {
        playWorldSound('wind', { x: pos.x - 200, y: pos.y }, pos, 'ambient');
      }
    }

    if (isNearWater(pos) && Math.random() < 0.5) {
      playWorldSound(Math.random() > 0.5 ? 'splash' : 'waterfall', pos, pos, 'ambient');
    }

    if (atmosphere.theme === 'night' && Math.random() < 0.25) {
      playWorldSound('hoot', { x: pos.x + 90, y: pos.y + 60 }, pos, 'ambient');
    }
  }, 11000);
}

export function stopVillageAmbience() {
  if (villageAmbienceInterval) clearInterval(villageAmbienceInterval);
  villageAmbienceInterval = null;
}

export async function ensureAudioUnlocked() {
  const ac = getCtx();
  if (ac.state === 'suspended') {
    await ac.resume();
  }
  if (!audioUnlocked) {
    const buffer = ac.createBuffer(1, 1, 22050);
    const src = ac.createBufferSource();
    src.buffer = buffer;
    src.connect(ac.destination);
    src.start(0);
    audioUnlocked = true;
  }
}

export function unlockAudio() {
  void ensureAudioUnlocked();
}

export function isAmbientMusicPlaying() {
  return isMusicPlaying;
}
