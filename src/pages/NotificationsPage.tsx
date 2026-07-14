import { useGameStore } from '../app/store/gameStore';

export function NotificationsPage() {
  const notifications = useGameStore((s) => s.notifications);
  const dismissNotification = useGameStore((s) => s.dismissNotification);
  const markAllNotificationsRead = useGameStore((s) => s.markAllNotificationsRead);
  const markNotificationRead = useGameStore((s) => s.markNotificationRead);

  return (
    <div className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">Notifications</h1>
        {notifications.length > 0 && (
          <button type="button" onClick={markAllNotificationsRead} className="focus-ring text-sm text-mint-500">
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-center text-gray-500">No notifications yet. Your garden is peaceful.</p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`rounded-2xl p-4 ${n.read ? 'bg-white' : 'bg-mint-50'} shadow-sm`}
            >
              <p className="text-sm">{n.message}</p>
              <div className="mt-2 flex gap-2">
                {!n.read && (
                  <button type="button" onClick={() => markNotificationRead(n.id)} className="text-xs text-mint-500">
                    Mark read
                  </button>
                )}
                <button type="button" onClick={() => dismissNotification(n.id)} className="text-xs text-gray-400">
                  Dismiss
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
