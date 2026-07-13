from flask import request, jsonify, current_app
from services.admin_user_service import AdminUserService

class AdminUserController:
    """Controller handling administrative user management HTTP REST requests"""

    def __init__(self):
        self.service = AdminUserService()

    def list_users(self):
        """List paginated, sorted and filtered student accounts"""
        try:
            page = int(request.args.get("page", 1))
            page_size = int(request.args.get("page_size", 20))
            search_query = request.args.get("search", "").strip()
            sort_by = request.args.get("sort", "last_active").strip()
            sort_order = request.args.get("order", "desc").strip()

            result = self.service.get_users_page(
                page=page,
                page_size=page_size,
                search_query=search_query,
                sort_by=sort_by,
                sort_order=sort_order
            )
            return jsonify(result), 200
        except Exception as e:
            current_app.logger.error(f"Error listing admin users: {str(e)}")
            return jsonify({"error": f"Failed to list users: {str(e)}"}), 500

    def get_user_details(self, user_id):
        """Retrieve student academic, progress, analytics and learning logs"""
        try:
            result = self.service.get_user_details(user_id)
            return jsonify(result), 200
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 404
        except Exception as e:
            current_app.logger.error(f"Error fetching user details: {str(e)}")
            return jsonify({"error": f"Failed to load details: {str(e)}"}), 500

    def update_user_status(self, user_id):
        """Toggle is_active account activation flag"""
        try:
            data = request.get_json() or {}
            # 'enabled' is passed from the PATCH payload
            enabled = data.get("enabled", True)

            result = self.service.update_user_status(user_id, enabled)
            return jsonify(result), 200
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 404
        except Exception as e:
            current_app.logger.error(f"Error updating user status: {str(e)}")
            return jsonify({"error": f"Failed to toggle status: {str(e)}"}), 500

    def notify_user(self, user_id):
        """Create and push a custom announcement alert to student Center"""
        try:
            data = request.get_json() or {}
            title = data.get("title", "").strip()
            message = data.get("message", "").strip()
            category = data.get("category", "GENERAL").strip()
            priority = data.get("priority", "MEDIUM").strip()

            if not title or not message:
                return jsonify({"error": "Title and message are required"}), 400

            notification_service = current_app.config.get("NOTIFICATION_SERVICE")
            result = self.service.notify_user(
                user_id=user_id,
                title=title,
                message=message,
                category=category,
                priority=priority,
                notification_service=notification_service
            )
            return jsonify(result), 201
        except ValueError as ve:
            return jsonify({"error": str(ve)}), 404
        except Exception as e:
            current_app.logger.error(f"Error sending user notification: {str(e)}")
            return jsonify({"error": f"Failed to dispatch alert: {str(e)}"}), 500
