import sys
import os
import datetime
import unittest

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from services.recommendation.recommendation_engine import RecommendationEngine
from services.recommendation.recommendation_models import RecommendationItem
from services.context.request_context import RequestContext
from services.adaptive.learning_profile import LearningProfile
from services.personalization.prompt_builder import PromptBuilder

class TestRecommendationEngineAdaptive(unittest.TestCase):

    def setUp(self):
        self.engine = RecommendationEngine()
        self.user_id = "test_student_123"

    def make_context(self, intent="ACADEMIC", profile=None):
        return RequestContext(
            question="Tell me about normalization",
            user_id=self.user_id,
            session_id="session_abc",
            timestamp=datetime.datetime.utcnow(),
            intent=intent,
            learning_profile=profile
        )

    def test_no_profile_fallback(self):
        """Verifies that when learning_profile is None, default recommendations are generated without errors"""
        ctx = self.make_context(intent="ACADEMIC", profile=None)
        res = self.engine.generate(ctx)

        # Check default study tools are present
        tool_titles = [item.title for item in res.study_tools]
        self.assertIn("Generate Quiz", tool_titles)
        self.assertIn("Flashcard Review", tool_titles)

        # Verify no specialized algorithm recommendations are present
        self.assertNotIn("Tree Problems", tool_titles)

    def test_study_tools_personalization_intermediate_advanced(self):
        """Verifies adapted quiz/flashcard recommendations for Intermediate/Advanced profiles"""
        profile = LearningProfile(
            user_id=self.user_id,
            favorite_topics=["DBMS"],
            placement_readiness="Intermediate"
        )
        ctx = self.make_context(intent="ACADEMIC", profile=profile)
        res = self.engine.generate(ctx)

        tool_titles = [item.title for item in res.study_tools]
        self.assertIn("Recommend Advanced DBMS Quiz", tool_titles)
        self.assertIn("DBMS Flashcard Review", tool_titles)

    def test_study_tools_personalization_beginner(self):
        """Verifies adapted quiz recommendations for Beginner profiles (no 'Advanced' prefix)"""
        profile = LearningProfile(
            user_id=self.user_id,
            favorite_topics=["DBMS"],
            placement_readiness="Beginner"
        )
        ctx = self.make_context(intent="ACADEMIC", profile=profile)
        res = self.engine.generate(ctx)

        tool_titles = [item.title for item in res.study_tools]
        self.assertIn("Recommend DBMS Quiz", tool_titles)
        self.assertIn("DBMS Flashcard Review", tool_titles)

    def test_placement_personalization(self):
        """Verifies adapted placement recommendations (technical interview focus)"""
        profile = LearningProfile(
            user_id=self.user_id,
            favorite_topics=["Java"],
            placement_readiness="Intermediate"
        )
        ctx = self.make_context(intent="PLACEMENT", profile=profile)
        res = self.engine.generate(ctx)

        placement_titles = [item.title for item in res.placement]
        self.assertIn("Practice Java Technical Interview", placement_titles)
        self.assertIn("Mock Tech Interview", placement_titles)

    def test_algorithm_specialization_substring_matching(self):
        """Verifies case-insensitive substring matching for algorithm-specific topics"""
        # Test case: favorite_topics contains 'Advanced Algorithms'
        profile_alg = LearningProfile(
            user_id=self.user_id,
            favorite_topics=["Advanced Algorithms"]
        )
        ctx_alg = self.make_context(intent="ACADEMIC", profile=profile_alg)
        res_alg = self.engine.generate(ctx_alg)

        tool_titles = [item.title for item in res_alg.study_tools]
        self.assertIn("Tree Problems", tool_titles)
        self.assertIn("Graph Flashcards", tool_titles)
        self.assertIn("BFS Quiz", tool_titles)

        # Test case: weak_topics contains 'Binary Trees'
        profile_tree = LearningProfile(
            user_id=self.user_id,
            weak_topics=["Binary Trees"]
        )
        ctx_tree = self.make_context(intent="ACADEMIC", profile=profile_tree)
        res_tree = self.engine.generate(ctx_tree)

        tool_titles_tree = [item.title for item in res_tree.study_tools]
        self.assertIn("Tree Problems", tool_titles_tree)
        self.assertIn("Graph Flashcards", tool_titles_tree)
        self.assertIn("BFS Quiz", tool_titles_tree)

    def test_prompt_builder_personalization_guidance(self):
        """Verifies PromptBuilder generates adaptive instruction blocks for LLM prompts"""
        personalization = {
            "learning_profile": {
                "favorite_topics": ["DBMS", "Java"],
                "weak_topics": ["CN"],
                "placement_readiness": "Intermediate",
                "study_streak": 5,
                "confidence": 0.85
            }
        }
        payload = PromptBuilder.build_prompt(
            question="Explain BCNF",
            intent="ACADEMIC",
            personalization=personalization,
            conversation_context=""
        )

        sys_prompt = payload.system_prompt
        self.assertIn("ADAPTIVE LEARNING PERSONALIZATION GUIDELINES:", sys_prompt)
        self.assertIn("DBMS, Java", sys_prompt)
        self.assertIn("CN", sys_prompt)
        self.assertIn("Intermediate", sys_prompt)
        self.assertIn("5-day study streak", sys_prompt)

    def test_prompt_builder_fallback(self):
        """Verifies PromptBuilder falls back to default behavior when no profile is present"""
        payload = PromptBuilder.build_prompt(
            question="Explain BCNF",
            intent="ACADEMIC",
            personalization={},
            conversation_context=""
        )
        self.assertNotIn("ADAPTIVE LEARNING PERSONALIZATION GUIDELINES:", payload.system_prompt)

    def test_chatservice_integration_adaptive_flow(self):
        """Verifies end-to-end integration and profile attachment inside ChatService"""
        from app import create_app
        app = create_app('testing')
        with app.app_context():
            from services.chat_service import ChatService
            from services.ai.handlers.llm_handler import LLMHandler
            from services.analytics.analytics_models import LearningEvent
            
            chat_service = ChatService(vectorstore=object())
            
            # Setup mock handler
            mock_handler = LLMHandler(vectorstore=object())
            mock_handler.intent_name = "ACADEMIC"
            mock_handler._execute = lambda q, s, u=None, r=None: (
                {"answer": "DBMS details.", "raw_answer": "DBMS details."}, 200
            )
            chat_service.router.resolve = lambda req_ctx: (mock_handler, {"intent": "ACADEMIC", "strategy": "llm", "confidence": 1.0})

            # Mock analytics store events to simulate a DBMS-focused student
            today = datetime.datetime.utcnow()
            for i in range(4):
                chat_service.analytics_store.add_event(
                    LearningEvent(
                        user_id="cs_user",
                        session_id=f"sess_{i}",
                        timestamp=today,
                        intent="ACADEMIC",
                        topic="DBMS",
                        response_type="LLM",
                        response_time_ms=100,
                        success=True,
                        metadata={"question": "Let's learn about databases"}
                    )
                )

            # Capture context and verify personalized recommendations and prompt parameters
            captured_context = []
            original_resolve = chat_service.router.resolve
            def mock_resolve(req_ctx):
                captured_context.append(req_ctx)
                return original_resolve(req_ctx)
            
            chat_service.router.resolve = mock_resolve
            res, code = chat_service.process_query("What is DBMS?", "session_xyz", user_id="cs_user")

            self.assertEqual(code, 200)
            self.assertIn("recommendations", res)
            
            # Verify study tools in API response were adapted based on profile favorite topic "DBMS"
            study_tools_res = res["recommendations"]["study_tools"]
            tool_titles = [item["title"] for item in study_tools_res]
            self.assertIn("Recommend DBMS Quiz", tool_titles)
            self.assertIn("DBMS Flashcard Review", tool_titles)

            # Verify the captured RequestContext holds personalization details
            req_ctx = captured_context[0]
            self.assertEqual(req_ctx.learning_profile.favorite_topics[0], "DBMS")
            self.assertIn("learning_profile", req_ctx.personalization)

if __name__ == '__main__':
    unittest.main()
