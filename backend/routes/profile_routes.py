from flask import Blueprint
from controllers.profile_controller import ProfileController
from middleware.auth_middleware import login_required

def create_profile_routes():
    """Create blueprint for user profile routes"""
    profile_bp = Blueprint('profile_bp', __name__, url_prefix='/api/user')
    profile_controller = ProfileController()

    @profile_bp.route('/profile', methods=['GET'])
    @login_required
    def get_profile(user_id):
        """Get profile route"""
        return profile_controller.get_profile(user_id)

    @profile_bp.route('/profile', methods=['PUT'])
    @login_required
    def update_profile(user_id):
        """Update profile route"""
        return profile_controller.update_profile(user_id)

    return profile_bp
