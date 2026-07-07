import sys
import os
import datetime

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from services.learning_path.learning_path_models import LearningStep, LearningPath
from services.learning_path.learning_path_engine import LearningPathEngine
from services.learning_progress.learning_progress_models import LearningProgress
from services.learning_progress.learning_progress_store import MemoryProgressStore
from services.learning_progress.learning_progress_engine import LearningProgressEngine
from services.context.request_context import RequestContext
from app import create_app

def test_learning_progress_subsystem():
    print("=== STARTING LEARNING PROGRESS ENGINE TESTS ===\n")
    
    store = MemoryProgressStore()
    engine = LearningProgressEngine(store)
    path_engine = LearningPathEngine()
    
    user_id_1 = "user_suhith_1"
    user_id_2 = "user_suhith_2"
    
    # Helper to construct stub RequestContext
    def make_context(question, user_id=user_id_1, intent_val="ACADEMIC"):
        return RequestContext(
            question=question,
            user_id=user_id,
            session_id="session_123",
            timestamp=datetime.datetime.utcnow(),
            intent=intent_val
        )

    # Pre-generate some learning paths
    ctx_dbms = make_context("Explain DBMS normalization.", user_id_1)
    path_dbms = path_engine.generate_learning_path(ctx_dbms)
    
    ctx_os = make_context("Explain CPU scheduling.", user_id_1)
    path_os = path_engine.generate_learning_path(ctx_os)

    # 1. Verify new user starts at 0%
    print("Test 1: Verifying new user starts at 0% and index 0...")
    progress_dbms = engine.get_or_initialize_progress(user_id_1, path_dbms)
    assert progress_dbms.completion_percentage == 0.0
    assert progress_dbms.current_step_index == 0
    assert len(progress_dbms.completed_steps) == 0
    
    formatted = engine.format_progress_response(progress_dbms, path_dbms)
    assert formatted["completion_percentage"] == 0
    assert formatted["current_step_index"] == 0
    assert formatted["completed_count"] == 0
    assert formatted["remaining_steps"] == 7
    assert formatted["total_steps"] == 7
    assert formatted["current_step"]["id"] == "dbms_intro"
    assert formatted["next_step"]["id"] == "dbms_er"
    print("✅ Test 1 passed!")

    # 2. Verify get_or_initialize_progress returns same progress instance
    print("Test 2: Verifying get_or_initialize_progress retrieve-or-create logic...")
    progress_dbms_check = engine.get_or_initialize_progress(user_id_1, path_dbms)
    assert progress_dbms_check is progress_dbms
    print("✅ Test 2 passed!")

    # 3. Verify completing one step updates progress and details correctly
    print("Test 3: Verifying completing one step...")
    engine.mark_step_completed(user_id_1, "DBMS", "dbms_intro", path_dbms)
    progress_after_1 = store.get_progress(user_id_1, "DBMS")
    assert "dbms_intro" in progress_after_1.completed_steps
    assert progress_after_1.current_step_index == 1
    assert progress_after_1.last_completed_step == "dbms_intro"
    # 1/7 = ~14.29%
    assert progress_after_1.completion_percentage == 14.29
    
    formatted_1 = engine.format_progress_response(progress_after_1, path_dbms)
    assert formatted_1["completion_percentage"] == 14
    assert formatted_1["completed_count"] == 1
    assert formatted_1["remaining_steps"] == 6
    assert formatted_1["current_step_index"] == 1
    assert formatted_1["current_step"]["id"] == "dbms_er"
    assert formatted_1["next_step"]["id"] == "dbms_relational"
    print("✅ Test 3 passed!")

    # 4. Verify duplicate completions don't change states
    print("Test 4: Verifying repeated completion of the same step...")
    engine.mark_step_completed(user_id_1, "DBMS", "dbms_intro", path_dbms)
    progress_after_dup = store.get_progress(user_id_1, "DBMS")
    assert progress_after_dup.completion_percentage == 14.29
    assert len(progress_after_dup.completed_steps) == 1
    print("✅ Test 4 passed!")

    # 5. Verify validation of invalid step ID
    print("Test 5: Verifying invalid step ID raises ValueError...")
    try:
        engine.mark_step_completed(user_id_1, "DBMS", "invalid_step_name", path_dbms)
        assert False, "Should have raised ValueError"
    except ValueError as val_err:
        print(f"✅ Test 5 passed! Raised expected ValueError: {str(val_err)}")

    # 6. Verify completing all steps reaches 100% and sets current/next steps to None
    print("Test 6: Verifying completing all steps...")
    step_ids = [s.id for s in path_dbms.steps]
    for step_id in step_ids:
        engine.mark_step_completed(user_id_1, "DBMS", step_id, path_dbms)
        
    progress_full = store.get_progress(user_id_1, "DBMS")
    assert progress_full.completion_percentage == 100.0
    assert progress_full.current_step_index == 7
    
    formatted_full = engine.format_progress_response(progress_full, path_dbms)
    assert formatted_full["completion_percentage"] == 100
    assert formatted_full["completed_count"] == 7
    assert formatted_full["remaining_steps"] == 0
    assert formatted_full["current_step_index"] == 7
    assert formatted_full["current_step"] is None
    assert formatted_full["next_step"] is None
    print("✅ Test 6 passed!")

    # 7. Verify progress isolation per user and topic (composite keys)
    print("Test 7: Verifying progress isolation...")
    # User 2 should start at 0% for DBMS even though User 1 is at 100%
    progress_u2_dbms = engine.get_or_initialize_progress(user_id_2, path_dbms)
    assert progress_u2_dbms.completion_percentage == 0.0
    
    # User 1 should have independent progress for Operating Systems
    progress_u1_os = engine.get_or_initialize_progress(user_id_1, path_os)
    assert progress_u1_os.completion_percentage == 0.0
    print("✅ Test 7 passed!")

    # 8. Verify empty learning paths return clean 0% values
    print("Test 8: Verifying empty learning path handling...")
    empty_path = LearningPath(
        topic="Empty Topic",
        source="GENERIC",
        difficulty="BEGINNER",
        estimated_total_minutes=0,
        steps=[]
    )
    progress_empty = engine.get_or_initialize_progress(user_id_1, empty_path)
    assert progress_empty.completion_percentage == 0.0
    assert progress_empty.current_step_index == 0
    
    formatted_empty = engine.format_progress_response(progress_empty, empty_path)
    assert formatted_empty["completion_percentage"] == 0
    assert formatted_empty["total_steps"] == 0
    assert formatted_empty["current_step"] is None
    assert formatted_empty["next_step"] is None
    print("✅ Test 8 passed!")

    # 9. Verify ChatService pipeline integration
    print("\nTesting ChatService integration...")
    app = create_app('testing')
    with app.app_context():
        from services.chat_service import ChatService
        chat_service = ChatService(vectorstore=object())
        
        from services.ai.handlers.llm_handler import LLMHandler
        mock_handler = LLMHandler(vectorstore=object())
        
        # Scenario A: ACADEMIC intent
        print("Scenario A: Verifying ACADEMIC query attaches progress...")
        mock_handler.intent_name = "ACADEMIC"
        mock_handler._execute = lambda q, s, u=None, r=None: (
            {"answer": "Java explanation.", "raw_answer": "Java explanation."}, 200
        )
        chat_service.router.resolve = lambda req_ctx: (mock_handler, {"intent": "ACADEMIC", "strategy": "llm", "confidence": 1.0})
        
        res, code = chat_service.process_query("Teach me Java basic syntax", "session_abc", user_id=user_id_1)
        assert code == 200
        assert "learning_path" in res
        assert "progress" in res
        assert res["progress"]["completion_percentage"] == 0
        assert res["progress"]["current_step"]["id"] == "java_intro"
        print("✅ Scenario A passed!")

        # Scenario B: non-ACADEMIC intent
        print("Scenario B: Verifying non-ACADEMIC query excludes progress...")
        mock_handler.intent_name = "GENERAL"
        mock_handler._execute = lambda q, s, u=None, r=None: (
            {"answer": "Standard chat.", "raw_answer": "Standard chat."}, 200
        )
        chat_service.router.resolve = lambda req_ctx: (mock_handler, {"intent": "GENERAL", "strategy": "llm", "confidence": 1.0})
        
        res, code = chat_service.process_query("Hello assistant", "session_abc", user_id=user_id_1)
        assert code == 200
        assert "learning_path" not in res
        assert "progress" not in res
        print("✅ Scenario B passed!")

    print("\n🎉 ALL LEARNING PROGRESS UNIT AND INTEGRATION TESTS PASSED SEAMLESSLY!")

if __name__ == "__main__":
    test_learning_progress_subsystem()
