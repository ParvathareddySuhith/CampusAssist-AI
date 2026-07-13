from flask import request, jsonify, current_app
from services.notifications.admin_notification_service import (
    NotificationValidationError,
    AdminNotificationService
)

class AdminNotificationController:
    """Controller handling HTTP serialization and validation for administrative notification endpoints"""

    @property
    def _service(self) -> AdminNotificationService:
        """Lazy access the injected AdminNotificationService from app config"""
        return current_app.config["ADMIN_NOTIFICATION_SERVICE"]

    def list_notifications(self):
        """Handle GET /api/admin/notifications"""
        try:
            page = int(request.args.get("page", 1))
            page_size = int(request.args.get("page_size", 20))
            search = request.args.get("search", "")
            category = request.args.get("category", "ALL")
            priority = request.args.get("priority", "ALL")
            target_type = request.args.get("target_type", "ALL")

            filters = {
                "category": category,
                "priority": priority,
                "target_type": target_type
            }

            result = self._service.list_notifications(
                page=page,
                page_size=page_size,
                filters=filters,
                search_query=search
            )
            return jsonify(result), 200

        except NotificationValidationError as e:
            return jsonify({"error": str(e)}), 400
        except ValueError:
            return jsonify({"error": "Invalid query parameters."}), 400
        except Exception as e:
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500

    def broadcast(self, admin_id: str):
        """Handle POST /api/admin/notifications"""
        try:
            data = request.json or {}
            
            # Fetch sending administrator's profile details
            admin_auth_service = current_app.config["ADMIN_AUTH_SERVICE"]
            admin = admin_auth_service.verify_admin(admin_id)

            target_type = data.get("target_type")
            target_value = data.get("target_value")
            title = data.get("title")
            message = data.get("message")
            category = data.get("category", "GENERAL")
            priority = data.get("priority", "MEDIUM")

            result = self._service.broadcast_notification(
                target_type=target_type,
                target_value=target_value,
                title=title,
                message=message,
                category=category,
                priority=priority,
                created_by_admin_id=admin.id,
                sender_name=admin.username
            )
            return jsonify(result), 201

        except NotificationValidationError as e:
            return jsonify({"error": str(e)}), 400
        except Exception as e:
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500

    def delete(self, notification_id: str):
        """Handle DELETE /api/admin/notifications/<notification_id>"""
        try:
            deleted_count = self._service.delete_notification(notification_id)
            if deleted_count == 0:
                return jsonify({"error": "Notification or broadcast not found."}), 404
            return jsonify({
                "success": True,
                "deleted_count": deleted_count,
                "message": f"Deleted successfully for {deleted_count} recipients."
            }), 200

        except Exception as e:
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500

    def stats(self):
        """Handle GET /api/admin/notifications/stats"""
        try:
            result = self._service.get_notification_stats()
            return jsonify(result), 200
        except Exception as e:
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500
