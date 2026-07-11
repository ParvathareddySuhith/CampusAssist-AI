from flask import Blueprint
from controllers.notification_controller import NotificationController
from middleware.auth_middleware import login_required

def create_notification_routes(notification_service):
    """Create blueprint for user notification routes"""
    notification_bp = Blueprint('notification_bp', __name__, url_prefix='/api/notifications')
    notification_controller = NotificationController(notification_service)

    @notification_bp.route('', methods=['GET'])
    @login_required
    def get_notifications(user_id):
        """Retrieve all notifications for the authenticated user"""
        return notification_controller.get_notifications(user_id)

    @notification_bp.route('/<id>/read', methods=['PATCH'])
    @login_required
    def mark_read(user_id, id):
        """Mark a single notification as read"""
        return notification_controller.mark_read(user_id, id)

    @notification_bp.route('/read-all', methods=['PATCH'])
    @login_required
    def mark_all_read(user_id):
        """Mark all notifications as read for the user"""
        return notification_controller.mark_all_read(user_id)

    @notification_bp.route('/<id>', methods=['DELETE'])
    @login_required
    def delete_notification(user_id, id):
        """Delete a single notification"""
        return notification_controller.delete_notification(user_id, id)

    @notification_bp.route('', methods=['DELETE'])
    @login_required
    def clear_notifications(user_id):
        """Clear all notifications for the user"""
        return notification_controller.clear_notifications(user_id)

    return notification_bp
