import { useEffect, useRef } from 'react';
import type { WorldPosition } from '../models';
import type { AtmosphereState } from '../services/atmosphereService';
import {
  unlockAudio,
  startAmbientMusic,
  stopAmbientMusic,
  startRandomAnimalSounds,
  stopRandomAnimalSounds,
  startVillageAmbience,
  stopVillageAmbience,
  ensureAudioUnlocked,
} from '../services/audioService';

interface UseVillageAudioOptions {
  musicEnabled: boolean;
  soundEffectsEnabled: boolean;
  characterSoundsEnabled: boolean;
  displayPos: WorldPosition;
  atmosphere: AtmosphereState;
  getAnimals: () => { activity?: string; position?: WorldPosition }[];
  suspendOutdoor?: boolean;
}

/** Keeps music/ambience running without restarting on every player step */
export function useVillageAudio({
  musicEnabled,
  soundEffectsEnabled,
  characterSoundsEnabled,
  displayPos,
  atmosphere,
  getAnimals,
  suspendOutdoor = false,
}: UseVillageAudioOptions) {
  const posRef = useRef(displayPos);
  const animalsRef = useRef(getAnimals);
  const atmosphereRef = useRef(atmosphere);

  posRef.current = displayPos;
  animalsRef.current = getAnimals;
  atmosphereRef.current = atmosphere;

  useEffect(() => {
    void ensureAudioUnlocked();
  }, []);

  useEffect(() => {
    unlockAudio();
    startAmbientMusic(musicEnabled);
    return () => stopAmbientMusic();
  }, [musicEnabled]);

  const sfxOn = soundEffectsEnabled || characterSoundsEnabled;

  useEffect(() => {
    if (!sfxOn || suspendOutdoor) {
      stopRandomAnimalSounds();
      stopVillageAmbience();
      return;
    }
    unlockAudio();
    startRandomAnimalSounds(
      true,
      () => animalsRef.current(),
      () => posRef.current,
    );
    startVillageAmbience(
      true,
      () => posRef.current,
      () => atmosphereRef.current,
    );
    return () => {
      stopRandomAnimalSounds();
      stopVillageAmbience();
    };
  }, [sfxOn, characterSoundsEnabled, soundEffectsEnabled, suspendOutdoor]);

  return { sfxEnabled: sfxOn };
}
