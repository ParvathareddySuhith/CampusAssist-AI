class NotificationStore:
    """Abstract interface for notification storage backend"""
    
    def add(self, notification) -> None:
        raise NotImplementedError()

    def get_all(self, user_id) -> list:
        raise NotImplementedError()

    def get(self, notification_id):
        raise NotImplementedError()

    def mark_read(self, notification_id) -> None:
        raise NotImplementedError()

    def mark_all_read(self, user_id) -> None:
        raise NotImplementedError()

    def delete(self, notification_id) -> None:
        raise NotImplementedError()

    def clear(self, user_id) -> None:
        raise NotImplementedError()
