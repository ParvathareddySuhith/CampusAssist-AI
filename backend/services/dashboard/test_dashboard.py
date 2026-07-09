import sys
import os
import datetime
import unittest
from unittest.mock import MagicMock, patch

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from app import create_app
from services.context.request_context import RequestContext
from services.adaptive.learning_profile import LearningProfile
from services.analytics.analytics_models import LearningEvent
from services.learning_progress.learning_progress_models import LearningProgress
from services.learning_path.learning_path_models import LearningPath, LearningStep
from services.dashboard.dashboard_service import DashboardService
from services.dashboard.dashboard_models import DashboardStudent

class TestLearningDashboardBackend(unittest.TestCase):

    def setUp(self):
        self.app = create_app('testing')
        self.app_context = self.app.app_context()
        self.app_context.push()

        self.user_id = "cs_dashboard_user"
        self.session_id = "session_dashboard_123"

        # Mock models & stores for test isolation
        self.mock_student_profile = MagicMock()
        
        # We reuse existing engines but with mocked/test stores
        from services.analytics.memory_store import MemoryAnalyticsStore
        from services.analytics.learning_analytics import LearningAnalyticsEngine
        from services.learning_progress.learning_progress_store import MemoryProgressStore
        from services.learning_progress.learning_progress_engine import LearningProgressEngine
        from services.learning_path.learning_path_engine import LearningPathEngine
        from services.adaptive.adaptive_engine import AdaptiveEngine
        from services.recommendation.recommendation_engine import RecommendationEngine

        self.analytics_store = MemoryAnalyticsStore()
        self.analytics_engine = LearningAnalyticsEngine(self.analytics_store)

        self.progress_store = MemoryProgressStore()
        self.progress_engine = LearningProgressEngine(self.progress_store)

        self.learning_path_engine = LearningPathEngine()
        
        self.adaptive_engine = AdaptiveEngine(
            analytics_store=self.analytics_store,
            progress_store=self.progress_store
        )
        self.recommendation_engine = RecommendationEngine()

        self.service = DashboardService(
            student_profile_model=self.mock_student_profile,
            analytics_engine=self.analytics_engine,
            adaptive_engine=self.adaptive_engine,
            recommendation_engine=self.recommendation_engine,
            progress_engine=self.progress_engine,
            learning_path_engine=self.learning_path_engine,
            progress_store=self.progress_store
        )

    def tearDown(self):
        self.app_context.pop()

    def test_empty_state_guest_fallback(self):
        """Verify dashboard summary returns success with typed defaults for users with no data"""
        self.mock_student_profile.get_profile.return_value = None

        summary = self.service.get_summary(self.user_id)

        # Assert correct keys exist
        self.assertIn("student", summary)
        self.assertIn("analytics", summary)
        self.assertIn("learning_profile", summary)
        self.assertIn("progress", summary)
        self.assertIn("recommendations", summary)
        self.assertIn("recent_activity", summary)

        # Assert typed defaults
        self.assertEqual(summary["student"]["name"], "")
        self.assertEqual(summary["student"]["department"], "")
        self.assertEqual(summary["student"]["semester"], 0)
        self.assertEqual(summary["analytics"]["questions"], 0)
        self.assertEqual(summary["learning_profile"]["study_streak"], 0)
        self.assertEqual(summary["learning_profile"]["favorite_topics"], [])
        self.assertEqual(summary["progress"], [])
        self.assertEqual(summary["recent_activity"], [])
        
        # Verify recommendation default lists are present
        self.assertIn("topics", summary["recommendations"])
        self.assertIn("documents", summary["recommendations"])
        self.assertIn("study_tools", summary["recommendations"])

    def test_summary_payload_verification(self):
        """Verify summary returns complete aggregated details for a user with profile, progress, and analytics"""
        # Set profile
        self.mock_student_profile.get_profile.return_value = {
            "full_name": "Suhith",
            "department": "CSE",
            "semester": 5
        }

        # Populate analytics events
        today = datetime.datetime.now(datetime.timezone.utc)
        self.analytics_store.add_event(LearningEvent(self.user_id, "s1", today, "ACADEMIC", "DBMS", "LLM", 150, True))
        self.analytics_store.add_event(LearningEvent(self.user_id, "s2", today, "PLACEMENT", "Java", "RAG", 200, True))

        # Populate progress record
        progress_rec = LearningProgress(
            user_id=self.user_id,
            topic="DBMS",
            completed_steps={"intro"},
            current_step_index=1,
            completion_percentage=25.0,
            started_at=today,
            updated_at=today
        )
        self.progress_store.update_progress(progress_rec)

        summary = self.service.get_summary(self.user_id)

        # Assert student profile details
        self.assertEqual(summary["student"]["name"], "Suhith")
        self.assertEqual(summary["student"]["department"], "CSE")
        self.assertEqual(summary["student"]["semester"], 5)

        # Assert analytics values
        self.assertEqual(summary["analytics"]["questions"], 2)
        self.assertEqual(summary["analytics"]["academic"], 1)
        self.assertEqual(summary["analytics"]["placement"], 1)

        # Assert adaptive details
        self.assertEqual(summary["learning_profile"]["study_streak"], 1)
        self.assertIn("DBMS", summary["learning_profile"]["favorite_topics"])

        # Assert progress details
        self.assertEqual(len(summary["progress"]), 1)
        self.assertEqual(summary["progress"][0]["topic"], "DBMS")
        self.assertEqual(summary["progress"][0]["completed_steps"], ["intro"])

        # Assert recommendations and activity are filled
        self.assertTrue(len(summary["recommendations"]["study_tools"]) > 0)
        self.assertEqual(len(summary["recent_activity"]), 2)

    def test_recent_activity_limit_and_sorting(self):
        """Verify activity returns at most 10 events, sorted by timestamp descending"""
        base_time = datetime.datetime.now(datetime.timezone.utc)
        
        # Add 12 events spaced by minutes
        for i in range(12):
            timestamp = base_time + datetime.timedelta(minutes=i)
            self.analytics_store.add_event(
                LearningEvent(self.user_id, f"session_{i}", timestamp, "ACADEMIC", "DBMS", "LLM", 100, True)
            )

        activity = self.service.get_recent_activity(self.user_id)

        # Assert limit of 10
        self.assertEqual(len(activity), 10)

        # Assert descending order (most recent first)
        timestamps = [datetime.datetime.strptime(act["timestamp"], "%Y-%m-%d %H:%M:%S UTC") for act in activity]
        for idx in range(len(timestamps) - 1):
            self.assertTrue(timestamps[idx] >= timestamps[idx + 1])

    def test_dashboard_consistency(self):
        """Verify summary analytics match the analytics engine values for the same user"""
        today = datetime.datetime.now(datetime.timezone.utc)
        for _ in range(5):
            self.analytics_store.add_event(LearningEvent(self.user_id, "s1", today, "ACADEMIC", "DBMS", "LLM", 100, True))

        summary = self.service.get_summary(self.user_id)
        raw_summary = self.analytics_engine.get_summary(self.user_id)

        self.assertEqual(summary["analytics"]["questions"], raw_summary.total_questions)
        self.assertEqual(summary["analytics"]["academic"], raw_summary.academic_questions)

    def test_recommendation_consistency(self):
        """Verify GET /dashboard/recommendations matches summary recommendations payload"""
        self.mock_student_profile.get_profile.return_value = {
            "full_name": "Suhith",
            "department": "CSE",
            "semester": 5
        }
        today = datetime.datetime.now(datetime.timezone.utc)
        self.analytics_store.add_event(LearningEvent(self.user_id, "s1", today, "ACADEMIC", "DBMS", "LLM", 100, True))

        summary = self.service.get_summary(self.user_id)
        standalone_recs = self.service.get_recommendations(self.user_id)

        # Verify equal study tool counts and keys
        self.assertEqual(
            [item["title"] for item in summary["recommendations"]["study_tools"]],
            [item["title"] for item in standalone_recs["study_tools"]]
        )

    def test_graceful_subsystem_failure(self):
        """Verify summary endpoint succeeds even if recommendation engine fails, displaying error string"""
        self.mock_student_profile.get_profile.return_value = None

        # Force RecommendationEngine.generate to raise Exception
        with patch.object(self.recommendation_engine, 'generate', side_effect=RuntimeError("Subsystem offline")):
            summary = self.service.get_summary(self.user_id)

            self.assertEqual(summary["student"]["name"], "")
            self.assertEqual(summary["analytics"]["questions"], 0)
            self.assertIn("error", summary["recommendations"])
            self.assertEqual(summary["recommendations"]["error"], "Subsystem offline")
            self.assertEqual(summary["recommendations"]["study_tools"], [])

    def test_profile_aggregation(self):
        """Verify aggregated profile returns profile data, adaptive details, and progress records"""
        self.mock_student_profile.get_profile.return_value = {
            "full_name": "Suhith",
            "department": "CSE",
            "semester": 5,
            "year": 3,
            "section": "A",
            "roll_number": "CS001"
        }

        profile_payload = self.service.get_profile_aggregation(self.user_id)

        self.assertEqual(profile_payload["student"]["full_name"], "Suhith")
        self.assertEqual(profile_payload["student"]["department"], "CSE")
        self.assertEqual(profile_payload["student"]["roll_number"], "CS001")
        self.assertEqual(profile_payload["learning_profile"]["placement_readiness"], "Beginner")
        self.assertEqual(profile_payload["progress"], [])

if __name__ == '__main__':
    unittest.main()
