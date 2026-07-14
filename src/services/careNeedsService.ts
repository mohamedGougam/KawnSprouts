import type { CareNeedLevel, SproutEmotion } from '../models';

export const WATER_GENTLE_MS = 8 * 60 * 60 * 1000;
export const WATER_URGENT_MS = 3 * 24 * 60 * 60 * 1000;

export interface CareNeedResult {
  level: CareNeedLevel;
  emotion: SproutEmotion;
  message: string;
  actionLabel: string;
  hoursSinceWater: number;
}

export function getCareNeed(lastWateredAt: string, sproutName: string): CareNeedResult {
  const elapsed = Date.now() - new Date(lastWateredAt).getTime();
  const hoursSinceWater = elapsed / (60 * 60 * 1000);

  if (elapsed >= WATER_URGENT_MS) {
    return {
      level: 'urgent',
      emotion: 'sad',
      message: `${sproutName} hasn't had fresh water in a few days. A gentle splash would mean the world right now.`,
      actionLabel: `Water ${sproutName} now`,
      hoursSinceWater,
    };
  }

  if (elapsed >= WATER_GENTLE_MS) {
    return {
      level: 'gentle',
      emotion: 'thirsty',
      message: `${sproutName} is feeling a little thirsty. Could you spare a moment for a cozy watering?`,
      actionLabel: 'Give a drink',
      hoursSinceWater,
    };
  }

  return {
    level: 'content',
    emotion: 'happy',
    message: `${sproutName} is feeling cheerful and nicely watered.`,
    actionLabel: '',
    hoursSinceWater,
  };
}

export function getKawnDisplayAge(
  kawnAge: number | undefined,
  showAge: boolean,
  viewerIsApprovedFriend: boolean,
): number | null {
  if (!showAge || !viewerIsApprovedFriend || kawnAge === undefined) return null;
  return kawnAge;
}
