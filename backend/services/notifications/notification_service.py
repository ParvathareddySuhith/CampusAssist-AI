import uuid
from datetime import datetime, timezone
from services.notifications.notification_models import (
    Notification,
    VALID_CATEGORIES,
    VALID_PRIORITIES
)
from services.notifications.notification_store import NotificationStore

class NotificationError(Exception):
    """Base exception for notification service"""
    pass

class NotificationNotFoundError(NotificationError):
    """Raised when a notification is not found"""
    pass

class NotificationAccessDeniedError(NotificationError):
    """Raised when a user is not authorized to access/modify a notification"""
    pass

class NotificationService:
    """Business logic layer for managing notifications"""
    
    def __init__(self, store: NotificationStore):
        self._store = store

    def create_notification(
        self,
        user_id: str,
        title: str,
        message: str,
        category: str = "GENERAL",
        priority: str = "MEDIUM",
        metadata: dict = None
    ) -> Notification:
        # Validate inputs
        if category not in VALID_CATEGORIES:
            raise ValueError(f"Invalid category: {category}")
        if priority not in VALID_PRIORITIES:
            raise ValueError(f"Invalid priority: {priority}")

        notification = Notification(
            id=str(uuid.uuid4()),
            user_id=user_id,
            title=title,
            message=message,
            category=category,
            priority=priority,
            created_at=datetime.now(timezone.utc),
            is_read=False,
            metadata=metadata or {}
        )
        
        # Add to store
        self._store.add(notification)
        
        # Telemetry
        unread_count = self.get_unread_count(user_id)
        print("Notification Service")
        print()
        print("User:")
        print(user_id)
        print()
        print("Created:")
        print(title)
        print()
        print("Priority:")
        print(priority)
        print()
        print("Unread:")
        print(unread_count)
        
        return notification

    def get_notifications(self, user_id: str) -> list:
        # Fetch all notifications for the user
        notifs = self._store.get_all(user_id)
        # Service owns sorting: newest first (created_at descending)
        return sorted(notifs, key=lambda x: x.created_at, reverse=True)

    def get_unread_count(self, user_id: str) -> int:
        notifs = self._store.get_all(user_id)
        return sum(1 for n in notifs if not n.is_read)

    def mark_as_read(self, user_id: str, notification_id: str) -> Notification:
        # Get raw notification from store
        notif = self._store.get(notification_id)
        if not notif:
            raise NotificationNotFoundError(f"Notification with ID {notification_id} not found")
        
        # Ownership validation
        if notif.user_id != user_id:
            raise NotificationAccessDeniedError(
                f"User {user_id} is not authorized to modify notification {notification_id}"
            )
            
        # Update read status in store
        self._store.mark_read(notification_id)
        
        # Return updated copy
        return self._store.get(notification_id)

    def mark_all_as_read(self, user_id: str) -> None:
        self._store.mark_all_read(user_id)

    def delete_notification(self, user_id: str, notification_id: str) -> None:
        # Get raw notification from store
        notif = self._store.get(notification_id)
        if not notif:
            raise NotificationNotFoundError(f"Notification with ID {notification_id} not found")
            
        # Ownership validation
        if notif.user_id != user_id:
            raise NotificationAccessDeniedError(
                f"User {user_id} is not authorized to delete notification {notification_id}"
            )
            
        self._store.delete(notification_id)

    def clear_notifications(self, user_id: str) -> None:
        self._store.clear(user_id)
