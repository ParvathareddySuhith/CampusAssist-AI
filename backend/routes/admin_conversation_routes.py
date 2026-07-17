from flask import Blueprint, jsonify, request
from middleware.auth_middleware import admin_required
from services.admin_conversation_service import AdminConversationService

def create_admin_conversation_routes():
    """Create Blueprint for Admin Chat Conversation Explorer"""
    bp = Blueprint('admin_conversations', __name__, url_prefix='/api/admin/conversations')
    service = AdminConversationService()

    @bp.route('', methods=['GET'])
    @admin_required
    def list_conversations():
        try:
            page = int(request.args.get("page", 1))
            page_size = int(request.args.get("page_size", 20))
        except ValueError:
            page = 1
            page_size = 20

        search = request.args.get("search", "")
        department = request.args.get("department", "")

        result = service.list_conversations(
            page=page,
            page_size=page_size,
            search=search,
            department=department
        )
        return jsonify(result), 200

    @bp.route('/<string:conversation_id>', methods=['GET'])
    @admin_required
    def get_conversation(conversation_id):
        result = service.get_conversation(conversation_id)
        if not result:
            return jsonify({"error": "Conversation not found"}), 404
        return jsonify(result), 200

    return bp
