import type { VillageMessage } from '../models';

/** Latest overhead bubble for a resident, respecting viewer thread participation */
export function getHeadBubble(
  messages: VillageMessage[],
  anchorResidentId: string,
  viewerId: string,
  activeThreadId: string | null,
): VillageMessage | null {
  const anchored = messages
    .filter((m) => m.anchorResidentId === anchorResidentId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));

  if (!anchored.length) return null;

  const latest = anchored[anchored.length - 1];

  if (
    latest.kind === 'thread' &&
    latest.participantIds.includes(viewerId) &&
    activeThreadId === latest.threadId
  ) {
    const shoutOnly = anchored.filter((m) => m.kind === 'shout');
    return shoutOnly.length ? shoutOnly[shoutOnly.length - 1] : null;
  }

  return latest;
}

export function getThreadMessages(messages: VillageMessage[], threadId: string): VillageMessage[] {
  return messages
    .filter((m) => m.threadId === threadId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function getPublicShouts(messages: VillageMessage[]): VillageMessage[] {
  return messages.filter((m) => m.kind === 'shout').sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

/** Latest public shout anchored to a resident (what everyone sees overhead). */
export function getPublicShout(messages: VillageMessage[], anchorResidentId: string): VillageMessage | null {
  const shouts = messages
    .filter((m) => m.kind === 'shout' && m.anchorResidentId === anchorResidentId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
  return shouts.length ? shouts[shouts.length - 1] : null;
}

/** Existing private thread between viewer and a friend, if any. */
export function findDirectThreadId(
  messages: VillageMessage[],
  friendId: string,
  viewerId: string,
): string | null {
  const thread = messages.find(
    (m) =>
      m.kind === 'thread' &&
      m.participantIds.includes(friendId) &&
      m.participantIds.includes(viewerId),
  );
  return thread?.threadId ?? null;
}

export function getThreadPartnerName(
  messages: VillageMessage[],
  threadId: string,
  viewerId: string,
  friends: { id: string; name: string; sproutName: string }[],
  playerName: string,
): string {
  const thread = messages.find((m) => m.threadId === threadId);
  if (!thread) return 'Chat';
  const otherId = thread.participantIds.find((id) => id !== viewerId);
  if (!otherId || otherId === viewerId) return 'Chat';
  if (otherId.startsWith('player')) return playerName;
  const friend = friends.find((f) => f.id === otherId);
  return friend ? `${friend.name} (${friend.sproutName})` : otherId;
}

export function migrateLegacyChats(
  legacy: Record<string, { id: string; residentId: string; senderId: string; senderName: string; text: string; timestamp: string }[]>,
): VillageMessage[] {
  const out: VillageMessage[] = [];
  for (const [residentId, msgs] of Object.entries(legacy)) {
    for (const m of msgs) {
      out.push({
        id: m.id,
        kind: 'shout',
        threadId: null,
        replyToId: null,
        senderId: m.senderId,
        senderName: m.senderName,
        anchorResidentId: residentId,
        participantIds: [],
        text: m.text,
        timestamp: m.timestamp,
      });
    }
  }
  return out;
}
