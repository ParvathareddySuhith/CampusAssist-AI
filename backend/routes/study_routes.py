from flask import Blueprint, request, jsonify
from services.ai.handlers.study_assistant_handler import StudyAssistantHandler
from middleware.auth_middleware import login_required

def create_study_routes():
    """Create blueprint for academic study assistant routes"""
    study_bp = Blueprint('study_bp', __name__, url_prefix='/api')
    study_handler = StudyAssistantHandler()

    @study_bp.route('/study', methods=['POST'])
    @login_required
    def generate_study_resources(user_id):
        """Route to generate academic study materials using LLM"""
        try:
            data = request.json
            if not data:
                return jsonify({"error": "No parameters provided"}), 400

            tool = data.get("tool", "").strip()
            topic = data.get("topic", "").strip()
            difficulty = data.get("difficulty", "Medium").strip()
            question_count_raw = data.get("question_count", 5)

            if not tool or not topic:
                return jsonify({"error": "Parameters 'tool' and 'topic' are required"}), 400

            try:
                question_count = int(question_count_raw)
            except (ValueError, TypeError):
                question_count = 5

            # Delegate generation to the StudyAssistantHandler
            result = study_handler.generate_content(
                tool=tool,
                topic=topic,
                difficulty=difficulty,
                question_count=question_count
            )

            # Check for downstream generation errors
            if "error" in result:
                return jsonify(result), 500

            return jsonify(result), 200

        except Exception as e:
            print(f"[Study Routes] Error generating study resources: {str(e)}")
            return jsonify({"error": f"Failed to generate study materials: {str(e)}"}), 500

    return study_bp
