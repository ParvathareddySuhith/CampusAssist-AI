from flask import Blueprint
from controllers.admin_user_controller import AdminUserController
from auth.admin_required import admin_required

def create_admin_user_routes():
    """Create admin user management routes blueprint"""
    bp = Blueprint('admin_user_bp', __name__, url_prefix='/api/admin/users')
    controller = AdminUserController()

    @bp.route('/', methods=['GET'])
    @admin_required
    def list_users():
        """List paginated users"""
        return controller.list_users()

    @bp.route('/<user_id>', methods=['GET'])
    @admin_required
    def get_user_details(user_id):
        """Retrieve detailed user inspect profile"""
        return controller.get_user_details(user_id)

    @bp.route('/<user_id>/status', methods=['PATCH'])
    @admin_required
    def update_user_status(user_id):
        """Toggle is_active account activation flag"""
        return controller.update_user_status(user_id)

    @bp.route('/<user_id>/notify', methods=['POST'])
    @admin_required
    def notify_user(user_id):
        """Send notification alert to user notifications center"""
        return controller.notify_user(user_id)

    return bp
