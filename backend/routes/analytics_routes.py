from flask import Blueprint
from controllers.analytics_controller import AnalyticsController
from middleware.auth_middleware import login_required

def create_analytics_routes():
    """Create blueprint for user analytics routes"""
    analytics_bp = Blueprint('analytics_bp', __name__, url_prefix='/api/analytics')
    analytics_controller = AnalyticsController()

    @analytics_bp.route('/summary', methods=['GET'])
    @login_required
    def get_summary(user_id):
        """Retrieve analytics summary for the authenticated user"""
        return analytics_controller.get_analytics_summary(user_id)

    return analytics_bp
