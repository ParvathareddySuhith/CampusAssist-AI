from flask import Blueprint, request, jsonify
from services.ai.handlers.placement_assistant_handler import PlacementAssistantHandler
from middleware.auth_middleware import login_required

def create_placement_routes():
    """Create blueprint for career placement assistant routes"""
    placement_bp = Blueprint('placement_bp', __name__, url_prefix='/api')
    placement_handler = PlacementAssistantHandler()

    @placement_bp.route('/placement', methods=['POST'])
    @login_required
    def generate_placement_resources(user_id):
        """Route to process career prep tools using LLM"""
        try:
            data = request.json
            if not data:
                return jsonify({"error": "No parameters provided"}), 400

            tool = data.get("tool", "").strip()
            if not tool:
                return jsonify({"error": "Parameter 'tool' is required"}), 400

            # Delegate generation to the PlacementAssistantHandler
            result = placement_handler.generate_content(data)

            # Check for downstream generation errors
            if "error" in result:
                return jsonify(result), 500

            return jsonify(result), 200

        except Exception as e:
            print(f"[Placement Routes] Error generating placement resources: {str(e)}")
            return jsonify({"error": f"Failed to generate placement materials: {str(e)}"}), 500

    return placement_bp
