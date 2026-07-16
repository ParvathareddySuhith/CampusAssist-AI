from flask import Blueprint, jsonify, request
from middleware.auth_middleware import admin_required
from services.admin_document_service import AdminDocumentService

def create_admin_document_routes():
    """Create Blueprint for Admin Document Management"""
    bp = Blueprint('admin_documents', __name__, url_prefix='/api/admin/documents')
    service = AdminDocumentService()

    @bp.route('', methods=['GET'])
    @admin_required
    def list_documents():
        try:
            page = int(request.args.get("page", 1))
            page_size = int(request.args.get("page_size", 20))
        except ValueError:
            page = 1
            page_size = 20
            
        result = service.list_documents(page=page, page_size=page_size)
        return jsonify(result), 200

    @bp.route('/stats', methods=['GET'])
    @admin_required
    def get_document_stats():
        result = service.get_document_stats()
        return jsonify(result), 200

    @bp.route('', methods=['POST'])
    @admin_required
    def upload_document():
        return jsonify({"error": "Not Implemented"}), 501

    @bp.route('/<string:doc_id>', methods=['DELETE'])
    @admin_required
    def delete_document(doc_id):
        return jsonify({"error": "Not Implemented"}), 501

    return bp
