import threading
import copy
from services.notifications.notification_store import NotificationStore

class MemoryNotificationStore(NotificationStore):
    """Thread-safe in-memory implementation of NotificationStore"""
    
    def __init__(self):
        self._lock = threading.Lock()
        self._notifications = {}  # user_id -> list of Notification
        self._by_id = {}          # notification_id -> Notification

    def add(self, notification) -> None:
        with self._lock:
            user_id = notification.user_id
            if user_id not in self._notifications:
                self._notifications[user_id] = []
            # Store a copy to prevent mutation from outside
            notif_copy = copy.deepcopy(notification)
            self._notifications[user_id].append(notif_copy)
            self._by_id[notification.id] = notif_copy

    def get_all(self, user_id) -> list:
        with self._lock:
            user_list = self._notifications.get(user_id, [])
            # Return deep copies to maintain safety
            return copy.deepcopy(user_list)

    def get(self, notification_id):
        with self._lock:
            notif = self._by_id.get(notification_id)
            if notif:
                return copy.deepcopy(notif)
            return None

    def mark_read(self, notification_id) -> None:
        with self._lock:
            notif = self._by_id.get(notification_id)
            if notif:
                notif.is_read = True

    def mark_all_read(self, user_id) -> None:
        with self._lock:
            user_list = self._notifications.get(user_id, [])
            for notif in user_list:
                notif.is_read = True

    def delete(self, notification_id) -> None:
        with self._lock:
            notif = self._by_id.get(notification_id)
            if notif:
                user_id = notif.user_id
                if user_id in self._notifications:
                    self._notifications[user_id] = [n for n in self._notifications[user_id] if n.id != notification_id]
                if notification_id in self._by_id:
                    del self._by_id[notification_id]

    def clear(self, user_id) -> None:
        with self._lock:
            user_list = self._notifications.get(user_id, [])
            for notif in user_list:
                if notif.id in self._by_id:
                    del self._by_id[notif.id]
            self._notifications[user_id] = []
