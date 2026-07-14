from flask import Blueprint
from controllers.admin_analytics_controller import AdminAnalyticsController
from auth.admin_required import admin_required

def create_admin_analytics_routes() -> Blueprint:
    """Create and return Blueprint for administrative analytics endpoints"""
    bp = Blueprint('admin_analytics', __name__)
    controller = AdminAnalyticsController()

    bp.add_url_rule('/dashboard', 'get_dashboard', admin_required(controller.get_dashboard), methods=['GET'])
    bp.add_url_rule('/departments', 'get_departments', admin_required(controller.get_departments), methods=['GET'])
    bp.add_url_rule('/questions', 'get_questions', admin_required(controller.get_questions), methods=['GET'])
    bp.add_url_rule('/documents', 'get_documents', admin_required(controller.get_documents), methods=['GET'])
    bp.add_url_rule('/notifications', 'get_notifications', admin_required(controller.get_notifications), methods=['GET'])
    bp.add_url_rule('/activity', 'get_activity', admin_required(controller.get_activity), methods=['GET'])

    return bp
