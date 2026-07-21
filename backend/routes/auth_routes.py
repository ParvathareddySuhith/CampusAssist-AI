from flask import Blueprint
from controllers.auth_controller import AuthController

def create_auth_routes(app):
    """Create authentication routes"""
    auth_bp = Blueprint('auth', __name__, url_prefix='/api')
    auth_controller = AuthController(app)
    auth_controller.auth_service.ensure_default_user()
    
    # User authentication routes
    auth_bp.add_url_rule('/signup', 'signup', auth_controller.signup, methods=['POST'])
    auth_bp.add_url_rule('/login', 'login', auth_controller.login, methods=['POST'])
    
    return auth_bp
