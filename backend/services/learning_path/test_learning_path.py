import sys
import os
import datetime

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from services.learning_path.learning_path_models import LearningStep, LearningPath
from services.learning_path.learning_path_engine import LearningPathEngine
from services.context.request_context import RequestContext
from app import create_app

def test_learning_path_engine():
    print("=== STARTING LEARNING PATH ENGINE UNIT TESTS ===\n")
    
    engine = LearningPathEngine()
    user_id = "user_suhith_999"
    
    # Helper to construct stub RequestContext
    def make_context(question, intent_val="ACADEMIC"):
        return RequestContext(
            question=question,
            user_id=user_id,
            session_id="session_123",
            timestamp=datetime.datetime.now(datetime.timezone.utc),
            intent=intent_val
        )

    # 1. Test Predefined Roadmap (DBMS)
    print("Testing predefined roadmap (DBMS)...")
    ctx_dbms = make_context("Explain DBMS normalization theory.")
    path_dbms = engine.generate_learning_path(ctx_dbms)
    
    assert path_dbms.topic == "DBMS"
    assert path_dbms.source == "PREDEFINED"
    assert path_dbms.difficulty == "INTERMEDIATE"
    assert path_dbms.estimated_total_minutes == 480
    assert path_dbms.next_step_index == 0
    assert len(path_dbms.steps) == 7
    assert path_dbms.steps[0].id == "dbms_intro"
    assert path_dbms.steps[0].completed is False
    print("✅ Predefined DBMS path passed!")

    # 2. Test Predefined Roadmap (Operating Systems)
    print("Testing predefined roadmap (Operating Systems)...")
    ctx_os = make_context("What are system calls in OS?")
    path_os = engine.generate_learning_path(ctx_os)
    assert path_os.topic == "Operating Systems"
    assert path_os.source == "PREDEFINED"
    assert path_os.difficulty == "ADVANCED"
    assert len(path_os.steps) == 7
    print("✅ Predefined Operating Systems path passed!")

    # 3. Test Unknown/Generic Topic Fallback
    print("Testing generic fallback roadmap...")
    ctx_generic = make_context("Teach me Machine Learning.")
    path_generic = engine.generate_learning_path(ctx_generic)
    
    assert path_generic.topic == "Machine Learning"
    assert path_generic.source == "GENERIC"
    assert path_generic.difficulty == "INTERMEDIATE"
    assert path_generic.next_step_index == 0
    assert len(path_generic.steps) == 6
    # Ensure title and description are formatted with the topic
    assert "Machine Learning" in path_generic.steps[0].title
    assert "Machine Learning" in path_generic.steps[0].description
    print("✅ Generic fallback path passed!")

    # 4. Test Serialization
    print("Testing serialization to_dict()...")
    path_dict = path_dbms.to_dict()
    assert path_dict["topic"] == "DBMS"
    assert path_dict["source"] == "PREDEFINED"
    assert path_dict["difficulty"] == "INTERMEDIATE"
    assert path_dict["next_step_index"] == 0
    assert isinstance(path_dict["steps"], list)
    assert path_dict["steps"][0]["id"] == "dbms_intro"
    assert path_dict["steps"][0]["completed"] is False
    print("✅ Serialization to_dict() passed!")

    # 5. Test Integration in ChatService
    print("\nTesting integration in ChatService pipeline...")
    app = create_app('testing')
    with app.app_context():
        from services.chat_service import ChatService
        chat_service = ChatService(vectorstore=object())
        
        # Mock handlers and router to return custom intent
        from services.ai.handlers.llm_handler import LLMHandler
        mock_handler = LLMHandler(vectorstore=object())
        
        # Case A: ACADEMIC intent
        print("Case A: Verifying ACADEMIC query returns learning path...")
        mock_handler.intent_name = "ACADEMIC"
        mock_handler._execute = lambda q, s, u=None, r=None: (
            {"answer": "Here is an explanation of DBMS.", "raw_answer": "Here is an explanation of DBMS."}, 200
        )
        chat_service.router.resolve = lambda req_ctx: (mock_handler, {"intent": "ACADEMIC", "strategy": "llm", "confidence": 1.0})
        
        res, code = chat_service.process_query("Tell me about databases", "session_123", user_id=user_id)
        assert code == 200
        assert "learning_path" in res
        assert res["learning_path"]["topic"] == "DBMS"
        assert res["learning_path"]["source"] == "PREDEFINED"
        assert res["learning_path"]["next_step_index"] == 0
        print("✅ Academic query returned correct learning path!")

        # Case B: non-ACADEMIC intent (e.g. SMALL_TALK or GENERAL)
        print("Case B: Verifying non-ACADEMIC query does NOT return learning path...")
        mock_handler.intent_name = "GENERAL"
        mock_handler._execute = lambda q, s, u=None, r=None: (
            {"answer": "Hello!", "raw_answer": "Hello!"}, 200
        )
        chat_service.router.resolve = lambda req_ctx: (mock_handler, {"intent": "GENERAL", "strategy": "llm", "confidence": 1.0})
        
        res, code = chat_service.process_query("Hello there", "session_123", user_id=user_id)
        assert code == 200
        assert "learning_path" not in res
        print("✅ Non-academic query excluded learning path!")

    print("\n🎉 ALL UNIT AND INTEGRATION TESTS PASSED SEAMLESSLY!")

if __name__ == "__main__":
    test_learning_path_engine()
