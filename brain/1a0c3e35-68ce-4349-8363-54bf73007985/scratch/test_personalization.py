import sys
import os

# Add backend to python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../../../../../Projects/chatbot-for-students-queries/backend')))

from services.personalization.context_personalizer import ContextPersonalizer
from services.personalization.prompt_builder import PromptBuilder
from app import create_app

def test_personalization():
    print("=== INITIALIZING PERSONALIZATION TESTS ===\n")
    
    personalizer = ContextPersonalizer()
    
    # Test case 1: Active profile
    profile_1 = {
        "full_name": "Suhith Reddy",
        "department": "CSE",
        "year": 3,
        "semester": 5,
        "preferred_language": "English",
        "career_goal": "AI Engineer",
        "interests": ["Machine Learning", "App Dev"]
    }
    
    p1 = personalizer.personalize(profile_1)
    print("Test Case 1 (Active Profile):")
    print(f"Profile Summary: {p1['profile']['profile_summary']}")
    print(f"Academic Level: {p1['profile']['academic_level']}")
    print(f"Has Career Goal: {p1['profile']['career_goal']}")
    print(f"Runtime Has Profile: {p1['runtime']['has_profile']}")
    
    prompt_1 = PromptBuilder.build(p1)
    print(f"Generated prompt contains profile: {'Suhith Reddy' in prompt_1}")
    print("-" * 50)
    
    # Test case 2: No profile
    p2 = personalizer.personalize(None)
    print("Test Case 2 (No Profile):")
    print(f"Has Profile: {p2['runtime']['has_profile']}")
    prompt_2 = PromptBuilder.build(p2)
    print(f"Generated prompt is empty: {prompt_2 == ''}")
    print("-" * 50)
    
    # Test case 3: Integration test via BaseHandler handle
    app = create_app('testing')
    with app.app_context():
        print("Testing BaseHandler telemetry output...")
        from services.ai.handlers.llm_handler import LLMHandler
        
        # Instantiate a handler (vectorstore can be None as LLMHandler does not use Pinecone)
        handler = LLMHandler(vectorstore=None)
        
        routing_context = {
            "strategy": "llm",
            "confidence": 0.95,
            "personalization": p1
        }
        
        # Stub the execution method to avoid actual Groq API rate limits in unit testing
        handler._execute = lambda question, session_id, user_id=None, routing_context=None: (
            {"answer": "MOCKED ANSWER"}, 200
        )
        
        print("\n--- Telemetry Output Trigger ---")
        result, code = handler.handle(
            question="What is recursion?",
            session_id="test_session_123",
            user_id="test_user_456",
            routing_context=routing_context
        )
        print("--- End Telemetry Output Trigger ---\n")
        
        assert result["answer"] == "MOCKED ANSWER"
        print("✅ Integration test passed successfully!")

if __name__ == "__main__":
    test_personalization()
