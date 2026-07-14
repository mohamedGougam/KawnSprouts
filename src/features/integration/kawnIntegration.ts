import type { KawnActivityEventType, PersistedGameState } from '../../models';
import { KAWN_EVENT_MAPPINGS } from '../../config/gameConfig';
import { clamp, generateId } from '../../utils/gameUtils';

export function simulateKawnEvent(
  state: PersistedGameState,
  eventType: KawnActivityEventType,
): Partial<PersistedGameState> {
  const mapping = KAWN_EVENT_MAPPINGS[eventType];
  if (!mapping) return {};

  const updates: Partial<PersistedGameState> = {};
  const sprout = { ...state.sprout, status: { ...state.sprout.status } };

  for (const [key, value] of Object.entries(mapping.effects)) {
    switch (key) {
      case 'growthPoints':
        sprout.growthPoints += value;
        sprout.status.growth = clamp(sprout.status.growth + 5, 20, 100);
        break;
      case 'friendship':
        sprout.status.friendship = clamp(sprout.status.friendship + value, 20, 100);
        break;
      case 'happiness':
        sprout.status.happiness = clamp(sprout.status.happiness + value, 20, 100);
        break;
      case 'kindness':
        sprout.status.kindness = clamp(sprout.status.kindness + value, 20, 100);
        break;
      case 'attractButterfly':
        updates.notifications = [
          {
            id: generateId('notif'),
            message: 'A butterfly has arrived in your garden.',
            read: false,
            createdAt: new Date().toISOString(),
            type: 'discovery',
          },
          ...state.notifications,
        ];
        break;
      case 'flowerProgress':
        break;
      case 'streakEligible':
        break;
    }
  }

  updates.sprout = sprout;
  updates.notifications = updates.notifications ?? [
    {
      id: generateId('notif'),
      message: `Kawn activity: ${mapping.description}`,
      read: false,
      createdAt: new Date().toISOString(),
      type: 'info',
    },
    ...state.notifications,
  ];

  return updates;
}

export function getKawnEventTypes(): KawnActivityEventType[] {
  return Object.keys(KAWN_EVENT_MAPPINGS) as KawnActivityEventType[];
}
