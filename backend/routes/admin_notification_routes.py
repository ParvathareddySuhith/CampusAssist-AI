from flask import Blueprint
from controllers.admin_notification_controller import AdminNotificationController
from auth.admin_required import admin_required

def create_admin_notification_routes() -> Blueprint:
    """Create and return Blueprint for administrative notification endpoints"""
    bp = Blueprint('admin_notifications', __name__)
    controller = AdminNotificationController()

    bp.add_url_rule('', 'list_notifications', admin_required(controller.list_notifications), methods=['GET'])
    bp.add_url_rule('', 'broadcast', admin_required(controller.broadcast), methods=['POST'])
    bp.add_url_rule('/<notification_id>', 'delete', admin_required(controller.delete), methods=['DELETE'])
    bp.add_url_rule('/stats', 'stats', admin_required(controller.stats), methods=['GET'])

    return bp
