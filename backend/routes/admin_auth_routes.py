from flask import Blueprint
from controllers.admin_auth_controller import AdminAuthController
from auth.admin_required import admin_required

def create_admin_auth_routes():
    """Create and return Blueprint for administrator authentication routes"""
    admin_auth_bp = Blueprint('admin_auth', __name__)
    controller = AdminAuthController()

    admin_auth_bp.add_url_rule('/login', 'login', controller.login, methods=['POST'])
    admin_auth_bp.add_url_rule('/logout', 'logout', admin_required(controller.logout), methods=['POST'])
    admin_auth_bp.add_url_rule('/me', 'me', admin_required(controller.me), methods=['GET'])

    return admin_auth_bp
