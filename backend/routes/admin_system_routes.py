from flask import Blueprint, jsonify
from middleware.auth_middleware import admin_required
from services.admin_system_service import AdminSystemService

def create_admin_system_routes():
    """Create Blueprint for Admin System Health Dashboard"""
    bp = Blueprint('admin_system', __name__, url_prefix='/api/admin/system')
    service = AdminSystemService()

    @bp.route('/health', methods=['GET'])
    @admin_required
    def get_system_health():
        result = service.get_system_health()
        return jsonify(result), 200

    @bp.route('/metrics', methods=['GET'])
    @admin_required
    def get_system_metrics():
        result = service.get_system_metrics()
        return jsonify(result), 200

    return bp
