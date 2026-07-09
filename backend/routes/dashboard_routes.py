from flask import Blueprint
from controllers.dashboard_controller import DashboardController
from middleware.auth_middleware import login_required

def create_dashboard_routes():
    """Create blueprint for user dashboard routes"""
    dashboard_bp = Blueprint('dashboard_bp', __name__, url_prefix='/api/dashboard')
    controller = DashboardController()

    @dashboard_bp.route('/summary', methods=['GET'])
    @login_required
    def get_summary(user_id):
        """Retrieve unified dashboard summary"""
        return controller.get_summary(user_id)

    @dashboard_bp.route('/activity', methods=['GET'])
    @login_required
    def get_activity(user_id):
        """Retrieve latest 10 learning events"""
        return controller.get_activity(user_id)

    @dashboard_bp.route('/recommendations', methods=['GET'])
    @login_required
    def get_recommendations(user_id):
        """Retrieve recommendations for a user via lightweight context"""
        return controller.get_recommendations(user_id)

    @dashboard_bp.route('/profile', methods=['GET'])
    @login_required
    def get_profile(user_id):
        """Retrieve aggregated profile payload"""
        return controller.get_profile(user_id)

    return dashboard_bp
