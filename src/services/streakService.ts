import type { CaringStreak } from '../models';
import { getTodayDateString } from '../utils/gameUtils';

export function updateStreakOnActivity(streak: CaringStreak): CaringStreak {
  const today = getTodayDateString();
  if (streak.lastActiveDate === today) return streak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (streak.lastActiveDate === yesterdayStr) {
    const current = streak.current + 1;
    return {
      ...streak,
      current,
      longest: Math.max(streak.longest, current),
      lastActiveDate: today,
      paused: false,
      warmWelcomeAvailable: false,
    };
  }

  if (streak.warmWelcomeAvailable) {
    return {
      ...streak,
      lastActiveDate: today,
      paused: false,
      warmWelcomeAvailable: false,
    };
  }

  return {
    ...streak,
    paused: streak.current > 0,
    warmWelcomeAvailable: streak.current > 0,
    lastActiveDate: today,
  };
}

export function applyWarmWelcome(streak: CaringStreak): CaringStreak {
  return {
    ...streak,
    paused: false,
    warmWelcomeAvailable: false,
    lastActiveDate: getTodayDateString(),
  };
}

export function recordMeaningfulAction(streak: CaringStreak): CaringStreak {
  return updateStreakOnActivity(streak);
}
