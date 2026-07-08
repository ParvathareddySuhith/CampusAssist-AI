import sys
import os
import datetime
import unittest

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from services.analytics.analytics_models import LearningEvent
from services.analytics.memory_store import MemoryAnalyticsStore
from services.learning_progress.learning_progress_models import LearningProgress
from services.learning_progress.learning_progress_store import MemoryProgressStore
from services.adaptive.learning_profile import LearningProfile
from services.adaptive.adaptive_engine import AdaptiveEngine
from services.context.request_context import RequestContext

class TestAdaptiveProfile(unittest.TestCase):

    def setUp(self):
        self.analytics_store = MemoryAnalyticsStore()
        self.progress_store = MemoryProgressStore()
        self.engine = AdaptiveEngine(
            analytics_store=self.analytics_store,
            progress_store=self.progress_store
        )
        self.user_id = "test_student_123"

    def test_default_profile_for_new_user(self):
        """Verifies that an empty profile is returned for a user with no analytics events"""
        profile = self.engine.build_profile(self.user_id)
        self.assertEqual(profile.user_id, self.user_id)
        self.assertEqual(profile.favorite_topics, [])
        self.assertEqual(profile.weak_topics, [])
        self.assertEqual(profile.preferred_mode, "Quiz")
        self.assertEqual(profile.study_streak, 0)
        self.assertEqual(profile.placement_readiness, "Beginner")
        self.assertEqual(profile.confidence, 0.0)

    def test_streak_calculation(self):
        """Tests the streak heuristic with various date patterns"""
        today = datetime.datetime.utcnow()
        yesterday = today - datetime.timedelta(days=1)
        two_days_ago = today - datetime.timedelta(days=2)
        four_days_ago = today - datetime.timedelta(days=4)

        # 1. Study streak of 3 consecutive days ending today
        events = [
            LearningEvent(self.user_id, "s1", two_days_ago, "ACADEMIC", "DBMS", "LLM", 50, True),
            LearningEvent(self.user_id, "s1", yesterday, "ACADEMIC", "DBMS", "LLM", 60, True),
            LearningEvent(self.user_id, "s1", today, "ACADEMIC", "DBMS", "LLM", 70, True),
        ]
        for e in events:
            self.analytics_store.add_event(e)

        profile = self.engine.build_profile(self.user_id)
        self.assertEqual(profile.study_streak, 3)

        # Clear store and check broken streak
        self.analytics_store.clear(self.user_id)
        events = [
            LearningEvent(self.user_id, "s1", four_days_ago, "ACADEMIC", "DBMS", "LLM", 50, True),
            LearningEvent(self.user_id, "s1", two_days_ago, "ACADEMIC", "DBMS", "LLM", 60, True),
        ]
        for e in events:
            self.analytics_store.add_event(e)
            
        profile = self.engine.build_profile(self.user_id)
        self.assertEqual(profile.study_streak, 0)

    def test_confidence_score_calculation(self):
        """Tests the confidence formula behavior with different number of events, streaks, and progress records"""
        # Scenario: 3 events, 2 days streak, 1 active topic progress
        today = datetime.datetime.utcnow()
        yesterday = today - datetime.timedelta(days=1)
        
        events = [
            LearningEvent(self.user_id, "s1", yesterday, "ACADEMIC", "DBMS", "LLM", 50, True),
            LearningEvent(self.user_id, "s1", today, "ACADEMIC", "DBMS", "LLM", 60, True),
            LearningEvent(self.user_id, "s1", today, "ACADEMIC", "Java", "LLM", 70, True),
        ]
        for e in events:
            self.analytics_store.add_event(e)

        # Add progress for DBMS with 20% completion
        progress = LearningProgress(user_id=self.user_id, topic="DBMS", completion_percentage=20.0)
        self.progress_store.update_progress(progress)

        profile = self.engine.build_profile(self.user_id)
        
        # Calculation:
        # analytics_score = min(3 * 0.1, 0.6) = 0.3
        # streak_score = min(2 * 0.1, 0.2) = 0.2
        # progress_score = min(1 * 0.1, 0.2) = 0.1
        # confidence = 0.3 + 0.2 + 0.1 = 0.6
        self.assertEqual(profile.confidence, 0.6)

    def test_favorite_topics_heuristic(self):
        """Tests strongest topic scoring based on frequencies and progress bonuses"""
        today = datetime.datetime.utcnow()
        # Topic A: 3 events, 0 progress
        # Topic B: 2 events, 80% progress
        # Topic C: 1 event, 0 progress
        events = [
            LearningEvent(self.user_id, "s1", today, "ACADEMIC", "DBMS", "LLM", 100, True),
            LearningEvent(self.user_id, "s1", today, "ACADEMIC", "DBMS", "LLM", 100, True),
            LearningEvent(self.user_id, "s1", today, "ACADEMIC", "DBMS", "LLM", 100, True),
            
            LearningEvent(self.user_id, "s1", today, "ACADEMIC", "Java", "LLM", 100, True),
            LearningEvent(self.user_id, "s1", today, "ACADEMIC", "Java", "LLM", 100, True),
            
            LearningEvent(self.user_id, "s1", today, "ACADEMIC", "OS", "LLM", 100, True),
        ]
        for e in events:
            self.analytics_store.add_event(e)

        # Update Java to 80% completion
        java_progress = LearningProgress(user_id=self.user_id, topic="Java", completion_percentage=80.0)
        self.progress_store.update_progress(java_progress)

        profile = self.engine.build_profile(self.user_id)

        # Expected scores:
        # DBMS: freq=3 -> 6.0, success=3 -> 1.5. Total = 7.5
        # Java: freq=2 -> 4.0, success=2 -> 1.0, progress = 8.0. Total = 13.0
        # OS: freq=1 -> 2.0, success=1 -> 0.5. Total = 2.5
        # Order should be Java, DBMS, OS
        self.assertEqual(profile.favorite_topics, ["Java", "DBMS", "OS"])
        self.assertEqual(profile.strongest_topics, ["Java", "DBMS", "OS"])

    def test_weak_topics_heuristic(self):
        """Tests weak topics classification based on error rates and latency"""
        today = datetime.datetime.utcnow()
        # DBMS: has failed event (error rate > 0)
        # Java: slow average response time (3000ms)
        events = [
            LearningEvent(self.user_id, "s1", today, "ACADEMIC", "DBMS", "LLM", 100, False),
            LearningEvent(self.user_id, "s1", today, "ACADEMIC", "Java", "LLM", 3000, True),
        ]
        for e in events:
            self.analytics_store.add_event(e)

        profile = self.engine.build_profile(self.user_id)
        self.assertIn("DBMS", profile.weak_topics)
        self.assertIn("Java", profile.weak_topics)
        self.assertEqual(profile.weakest_topics, profile.weak_topics)

    def test_preferred_mode_detection(self):
        """Tests that query keywords correctly flag study mode preferences"""
        today = datetime.datetime.utcnow()
        events = [
            # Two flashcard references
            LearningEvent(self.user_id, "s1", today, "ACADEMIC", "DBMS", "LLM", 100, True, {"question": "Can you give me flashcards for DBMS?"}),
            LearningEvent(self.user_id, "s1", today, "ACADEMIC", "DBMS", "LLM", 100, True, {"question": "Show card review"}),
            # One quiz reference
            LearningEvent(self.user_id, "s1", today, "ACADEMIC", "DBMS", "LLM", 100, True, {"question": "Give me a DBMS quiz"}),
        ]
        for e in events:
            self.analytics_store.add_event(e)

        profile = self.engine.build_profile(self.user_id)
        self.assertEqual(profile.preferred_mode, "Flashcard")

    def test_placement_readiness_and_assistant(self):
        """Verifies readiness transitions and preferred assistant intents mapping"""
        today = datetime.datetime.utcnow()
        # 5 placement events -> Readiness: Intermediate. Preferred assistant: Placement Assistant
        for i in range(5):
            self.analytics_store.add_event(
                LearningEvent(self.user_id, f"s{i}", today, "PLACEMENT", "Resume Review", "LLM", 100, True)
            )

        profile = self.engine.build_profile(self.user_id)
        self.assertEqual(profile.placement_readiness, "Intermediate")
        self.assertEqual(profile.preferred_assistant, "Placement Assistant")

    def test_chatservice_integration(self):
        """Tests that ChatService correctly builds the profile and attaches it to RequestContext and personalization"""
        from app import create_app
        app = create_app('testing')
        with app.app_context():
            from services.chat_service import ChatService
            from services.ai.handlers.llm_handler import LLMHandler
            
            chat_service = ChatService(vectorstore=object())
            
            # Mock the router resolve to return LLMHandler and simple intent metadata
            mock_handler = LLMHandler(vectorstore=object())
            mock_handler.intent_name = "GENERAL"
            mock_handler._execute = lambda q, s, u=None, r=None: (
                {"answer": "Hello!", "raw_answer": "Hello!"}, 200
            )
            chat_service.router.resolve = lambda req_ctx: (mock_handler, {"intent": "GENERAL", "strategy": "llm", "confidence": 1.0})
            
            # Let's add some analytics events for user_id to simulate profile building
            # 4 PLACEMENT events -> Readiness: Intermediate. Preferred assistant: Placement Assistant.
            today = datetime.datetime.utcnow()
            for i in range(4):
                chat_service.analytics_store.add_event(
                    LearningEvent(
                        user_id="integration_user",
                        session_id=f"session_{i}",
                        timestamp=today,
                        intent="PLACEMENT",
                        topic="Resume Review",
                        response_type="LLM",
                        response_time_ms=100,
                        success=True,
                        metadata={"question": "Let's practice mock interview resume review questions"}
                    )
                )
                
            # Process query and verify integration flow
            captured_context = []
            original_resolve = chat_service.router.resolve
            def mock_resolve(req_ctx):
                captured_context.append(req_ctx)
                return original_resolve(req_ctx)
            
            chat_service.router.resolve = mock_resolve
            
            res, code = chat_service.process_query("Help me with my resume", "session_xyz", user_id="integration_user")
            
            self.assertEqual(code, 200)
            self.assertEqual(len(captured_context), 1)
            req_ctx = captured_context[0]
            
            # Assert RequestContext receives LearningProfile
            self.assertIsNotNone(req_ctx.learning_profile)
            self.assertEqual(req_ctx.learning_profile.placement_readiness, "Intermediate")
            self.assertEqual(req_ctx.learning_profile.preferred_assistant, "Placement Assistant")
            
            # Assert personalization contains serialized profile
            self.assertIn("learning_profile", req_ctx.personalization)
            serialized = req_ctx.personalization["learning_profile"]
            self.assertEqual(serialized["placement_readiness"], "Intermediate")
            self.assertEqual(serialized["preferred_assistant"], "Placement Assistant")

if __name__ == '__main__':
    unittest.main()
