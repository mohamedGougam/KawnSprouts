import type { DailyMission, MissionProgress } from '../models';
import { MISSION_POOL, MISSION_REWARDS } from '../config/gameConfig';
import { getTodayDateString, pickDailyMissions } from '../utils/gameUtils';

export function generateDailyMissions(date: string): DailyMission[] {
  const indices = pickDailyMissions(date, 3);
  return indices.map((idx, i) => {
    const pool = MISSION_POOL[idx];
    const reward = MISSION_REWARDS[i % MISSION_REWARDS.length];
    return {
      id: `mission-${date}-${idx}`,
      description: pool.description,
      targetCount: pool.targetCount,
      progress: 0,
      completed: false,
      claimed: false,
      reward,
      actionType: pool.actionType,
    };
  });
}

export function ensureDailyMissions(missions: MissionProgress): MissionProgress {
  const today = getTodayDateString();
  if (missions.date === today && missions.missions.length > 0) {
    return missions;
  }
  return { date: today, missions: generateDailyMissions(today) };
}

export function updateMissionProgress(
  missions: MissionProgress,
  actionType: string,
): MissionProgress {
  const updated = ensureDailyMissions(missions);
  return {
    ...updated,
    missions: updated.missions.map((m) => {
      if (m.actionType !== actionType || m.completed) return m;
      const progress = Math.min(m.progress + 1, m.targetCount);
      return {
        ...m,
        progress,
        completed: progress >= m.targetCount,
      };
    }),
  };
}
