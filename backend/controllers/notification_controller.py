from flask import jsonify
from services.notifications import (
    NotificationNotFoundError,
    NotificationAccessDeniedError
)

class NotificationController:
    """Controller for mapping HTTP requests to NotificationService business logic"""
    
    def __init__(self, notification_service):
        self.notification_service = notification_service

    def get_notifications(self, user_id: str):
        try:
            notifications = self.notification_service.get_notifications(user_id)
            unread_count = self.notification_service.get_unread_count(user_id)
            # Ensure an empty list is returned instead of null/error inside the wrapper dict
            return jsonify({
                "notifications": [n.to_dict() for n in notifications],
                "unread_count": unread_count
            }), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def mark_read(self, user_id: str, notification_id: str):
        try:
            updated = self.notification_service.mark_as_read(user_id, notification_id)
            return jsonify(updated.to_dict()), 200
        except NotificationNotFoundError as e:
            return jsonify({"error": str(e)}), 404
        except NotificationAccessDeniedError as e:
            return jsonify({"error": str(e)}), 403
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def mark_all_read(self, user_id: str):
        try:
            self.notification_service.mark_all_as_read(user_id)
            return jsonify({"message": "All notifications marked as read"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def delete_notification(self, user_id: str, notification_id: str):
        try:
            self.notification_service.delete_notification(user_id, notification_id)
            return jsonify({"message": "Notification deleted successfully"}), 200
        except NotificationNotFoundError as e:
            return jsonify({"error": str(e)}), 404
        except NotificationAccessDeniedError as e:
            return jsonify({"error": str(e)}), 403
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    def clear_notifications(self, user_id: str):
        try:
            self.notification_service.clear_notifications(user_id)
            return jsonify({"message": "All notifications cleared"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
