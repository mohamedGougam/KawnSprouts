import { GROWTH_STAGE_THRESHOLDS, GROWTH_STAGES_ORDER } from '../config/gameConfig';
import type { GrowthStage } from '../models';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function getGrowthStageFromPoints(points: number): GrowthStage {
  for (const stage of GROWTH_STAGES_ORDER) {
    const threshold = GROWTH_STAGE_THRESHOLDS[stage];
    if (points >= threshold.min && points <= threshold.max) return stage;
  }
  return 'treehouseGuardian';
}

export function getNextGrowthStage(current: GrowthStage): GrowthStage | null {
  const idx = GROWTH_STAGES_ORDER.indexOf(current);
  if (idx < 0 || idx >= GROWTH_STAGES_ORDER.length - 1) return null;
  return GROWTH_STAGES_ORDER[idx + 1];
}

export function getGrowthProgress(points: number, stage: GrowthStage): {
  current: number;
  required: number;
  percentage: number;
} {
  const threshold = GROWTH_STAGE_THRESHOLDS[stage];
  const nextStage = getNextGrowthStage(stage);
  if (!nextStage) {
    return { current: points - threshold.min, required: 0, percentage: 100 };
  }
  const nextMin = GROWTH_STAGE_THRESHOLDS[nextStage].min;
  const range = nextMin - threshold.min;
  const current = points - threshold.min;
  return {
    current,
    required: range,
    percentage: clamp(Math.round((current / range) * 100), 0, 100),
  };
}

export function getLevelFromExperience(xp: number): number {
  return Math.floor(xp / 100) + 1;
}

export function getExperienceProgress(xp: number): number {
  return xp % 100;
}

export function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

export function getThemeFromTime(): 'day' | 'evening' | 'night' {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 17) return 'day';
  if (hour >= 17 && hour < 20) return 'evening';
  return 'night';
}

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function validatePlayerName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length < 2) return 'Name must be at least 2 characters';
  if (trimmed.length > 20) return 'Name must be 20 characters or less';
  return null;
}

export function validateSproutName(name: string): string | null {
  const trimmed = name.trim().replace(/\s+/g, ' ');
  if (trimmed.length < 2) return 'Name must be at least 2 characters';
  if (trimmed.length > 16) return 'Name must be 16 characters or less';
  return null;
}

export function validateAge(age: number): string | null {
  if (!Number.isInteger(age)) return 'Age must be a whole number';
  if (age < 5) return 'Age must be at least 5';
  if (age > 120) return 'Please enter a valid age';
  return null;
}

export function formatCooldown(ms: number): string {
  const minutes = Math.ceil(ms / 60000);
  if (minutes <= 1) return 'about a minute';
  return `${minutes} minutes`;
}

export function hashDateSeed(date: string): number {
  let hash = 0;
  for (let i = 0; i < date.length; i++) {
    hash = (hash << 5) - hash + date.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function pickDailyMissions(date: string, count = 3): number[] {
  const seed = hashDateSeed(date);
  const indices: number[] = [];
  const poolSize = 9;
  let s = seed;
  while (indices.length < count) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const idx = s % poolSize;
    if (!indices.includes(idx)) indices.push(idx);
  }
  return indices;
}

export function canShowAge(
  viewerIsApprovedFriend: boolean,
  subjectShowAge: boolean,
  subjectAge?: number,
): boolean {
  if (subjectAge === undefined) return false;
  if (!subjectShowAge) return false;
  return viewerIsApprovedFriend;
}

export function isMinor(age: number): boolean {
  return age < 18;
}
