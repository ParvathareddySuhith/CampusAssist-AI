from flask import request, jsonify, current_app
from services.analytics.admin_analytics_service import AdminAnalyticsService

class AdminAnalyticsController:
    """Controller handling HTTP serialization and validation for administrative analytics endpoints"""

    @property
    def _service(self) -> AdminAnalyticsService:
        """Lazy access to injected AdminAnalyticsService in app config"""
        return current_app.config["ADMIN_ANALYTICS_SERVICE"]

    def get_dashboard(self):
        """Handle GET /api/admin/analytics/dashboard"""
        try:
            refresh_param = request.args.get("refresh", "false").lower() == "true"
            result = self._service.get_dashboard_summary(force_refresh=refresh_param)
            return jsonify(result), 200
        except Exception as e:
            current_app.logger.error(f"Dashboard analytics collection failed: {str(e)}")
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500

    def get_departments(self):
        """Handle GET /api/admin/analytics/departments"""
        try:
            result = self._service._collect_department_stats()
            return jsonify(result), 200
        except Exception as e:
            current_app.logger.error(f"Department stats collection failed: {str(e)}")
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500

    def get_questions(self):
        """Handle GET /api/admin/analytics/questions"""
        try:
            result = self._service._collect_question_stats()
            return jsonify(result), 200
        except Exception as e:
            current_app.logger.error(f"Question stats collection failed: {str(e)}")
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500

    def get_documents(self):
        """Handle GET /api/admin/analytics/documents"""
        try:
            result = self._service._collect_document_stats()
            return jsonify(result), 200
        except Exception as e:
            current_app.logger.error(f"Document stats collection failed: {str(e)}")
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500

    def get_notifications(self):
        """Handle GET /api/admin/analytics/notifications"""
        try:
            result = self._service._collect_notification_stats()
            return jsonify(result), 200
        except Exception as e:
            current_app.logger.error(f"Notification stats collection failed: {str(e)}")
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500

    def get_activity(self):
        """Handle GET /api/admin/analytics/activity"""
        try:
            result = self._service._collect_recent_activity()
            return jsonify(result), 200
        except Exception as e:
            current_app.logger.error(f"Recent activity collection failed: {str(e)}")
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500
