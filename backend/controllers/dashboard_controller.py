from flask import jsonify
from models.models import StudentProfile
from services.analytics.memory_store import global_memory_store
from services.analytics.learning_analytics import LearningAnalyticsEngine
from services.learning_progress.learning_progress_store import global_progress_store
from services.learning_progress.learning_progress_engine import LearningProgressEngine
from services.learning_path.learning_path_engine import LearningPathEngine
from services.adaptive.adaptive_engine import AdaptiveEngine
from services.recommendation.recommendation_engine import RecommendationEngine
from services.dashboard.dashboard_service import DashboardService

class DashboardController:
    """Controller handling HTTP REST requests for student dashboard aggregation"""

    def __init__(self):
        # Resolve dependency injections using global singletons
        student_profile_model = StudentProfile()
        analytics_store = global_memory_store
        analytics_engine = LearningAnalyticsEngine(analytics_store)
        progress_store = global_progress_store
        progress_engine = LearningProgressEngine(progress_store)
        learning_path_engine = LearningPathEngine()
        adaptive_engine = AdaptiveEngine(
            analytics_store=analytics_store,
            progress_store=progress_store
        )
        recommendation_engine = RecommendationEngine()

        self.service = DashboardService(
            student_profile_model=student_profile_model,
            analytics_engine=analytics_engine,
            adaptive_engine=adaptive_engine,
            recommendation_engine=recommendation_engine,
            progress_engine=progress_engine,
            learning_path_engine=learning_path_engine,
            progress_store=progress_store
        )

    def get_summary(self, user_id: str):
        """Retrieve unified dashboard summary"""
        try:
            res = self.service.get_summary(user_id)
            return jsonify(res), 200
        except Exception as e:
            print(f"[DashboardController] Get summary error: {e}")
            return jsonify({"error": f"Failed to load summary: {str(e)}"}), 500

    def get_activity(self, user_id: str):
        """Retrieve latest 10 learning events"""
        try:
            res = self.service.get_recent_activity(user_id)
            return jsonify(res), 200
        except Exception as e:
            print(f"[DashboardController] Get activity error: {e}")
            return jsonify({"error": f"Failed to load activity: {str(e)}"}), 500

    def get_recommendations(self, user_id: str):
        """Retrieve recommendations for a user via lightweight context"""
        try:
            res = self.service.get_recommendations(user_id)
            return jsonify(res), 200
        except Exception as e:
            print(f"[DashboardController] Get recommendations error: {e}")
            return jsonify({"error": f"Failed to load recommendations: {str(e)}"}), 500

    def get_profile(self, user_id: str):
        """Retrieve profile aggregation payload"""
        try:
            res = self.service.get_profile_aggregation(user_id)
            return jsonify(res), 200
        except Exception as e:
            print(f"[DashboardController] Get profile error: {e}")
            return jsonify({"error": f"Failed to load profile: {str(e)}"}), 500
