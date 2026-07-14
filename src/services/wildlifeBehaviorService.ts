import type { WorldPosition } from '../models';
import { WILDLIFE } from '../config/villageConfig';

export type WildlifeBehavior =
  | 'idle'
  | 'wander'
  | 'drink'
  | 'eat'
  | 'jump'
  | 'swim'
  | 'fly'
  | 'sniff'
  | 'hop'
  | 'splash'
  | 'dive'
  | 'hoot'
  | 'sit'
  | 'run';

export interface WildlifeState {
  id: string;
  position: WorldPosition;
  behavior: WildlifeBehavior;
  visible: boolean;
  timer: number;
}

const SPECIES_BEHAVIORS: Record<string, WildlifeBehavior[]> = {
  gazelle: ['drink', 'idle', 'wander'],
  giraffe: ['eat', 'idle', 'wander'],
  elephant: ['drink', 'idle', 'wander'],
  fish: ['splash', 'jump', 'idle'],
  bunny: ['sniff', 'hop', 'eat', 'idle'],
  owl: ['hoot', 'idle', 'sit'],
  duck: ['swim', 'dive', 'idle'],
  fox: ['sit', 'run', 'idle'],
  frog: ['hop', 'idle', 'splash'],
  bird: ['fly', 'idle'],
  butterfly: ['fly', 'idle'],
};

function speciesFromId(id: string): string {
  if (id.includes('gazelle')) return 'gazelle';
  if (id.includes('giraffe')) return 'giraffe';
  if (id.includes('elephant')) return 'elephant';
  if (id.includes('fish')) return 'fish';
  if (id.includes('bunny')) return 'bunny';
  if (id.includes('owl')) return 'owl';
  if (id.includes('duck')) return 'duck';
  if (id.includes('fox')) return 'fox';
  if (id.includes('frog')) return 'frog';
  if (id.includes('bird')) return 'bird';
  if (id.includes('butterfly')) return 'butterfly';
  return 'idle';
}

export function createWildlifeStates(isNight: boolean): WildlifeState[] {
  return WILDLIFE.map((a) => {
    const species = speciesFromId(a.id);
    const isOwl = species === 'owl';
    return {
      id: a.id,
      position: { ...a.position },
      behavior: (a.activity as WildlifeBehavior) ?? 'idle',
      visible: !isOwl || isNight,
      timer: Math.random() * 4000,
    };
  });
}

export function tickWildlife(states: WildlifeState[], dt: number, isNight: boolean): WildlifeState[] {
  return states.map((s) => {
    const species = speciesFromId(s.id);
    if (species === 'owl' && !isNight) return { ...s, visible: false };
    if (species === 'owl' && isNight) return { ...s, visible: true };

    let timer = s.timer - dt;
    let behavior = s.behavior;
    let position = { ...s.position };
    const options = SPECIES_BEHAVIORS[species] ?? ['idle'];

    if (timer <= 0) {
      behavior = options[Math.floor(Math.random() * options.length)];
      timer = 3000 + Math.random() * 5000;

      if (behavior === 'wander' || behavior === 'run') {
        position = {
          x: position.x + (Math.random() - 0.5) * 80,
          y: position.y + (Math.random() - 0.5) * 80,
        };
      }
      if (behavior === 'hop' || behavior === 'jump' || behavior === 'splash') {
        position = { ...position, y: position.y - 8 };
      }
      if (behavior === 'fly') {
        return { ...s, behavior, timer, visible: false, position };
      }
    } else if (s.behavior === 'fly' && !s.visible) {
      return { ...s, behavior: 'idle', timer: 2000, visible: true, position: s.position };
    }

    return { ...s, behavior, timer, position, visible: s.visible };
  });
}
