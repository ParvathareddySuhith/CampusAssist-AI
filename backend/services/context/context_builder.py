import datetime
from typing import Optional
from models.models import StudentProfile
from services.context.request_context import RequestContext

class ContextBuilder:
    """Context Builder that gathers all relevant request context before AI routing"""
    
    def __init__(self):
        # Database service layer mapping (easily swappable for ProfileService later)
        self.profile_model = StudentProfile()
        from services.memory.memory_manager import ConversationMemoryManager
        self.memory_manager = ConversationMemoryManager()
        from services.context.conversation_context_builder import ConversationContextBuilder
        self.context_builder_memory = ConversationContextBuilder()

    def build_context(self, question: str, user_id: Optional[str], session_id: str) -> RequestContext:
        """Gathers student profile, history, timestamps, and returns RequestContext"""
        # 1. Fetch user profile if user_id is provided
        profile = None
        if user_id:
            try:
                profile = self.profile_model.get_profile(user_id)
            except Exception as e:
                print(f"[Context Builder] Error fetching user profile: {str(e)}")

        # 2. Fetch conversation history
        # Local import inside the method to prevent circular import issues on startup
        conversation_history = []
        try:
            from services.chat_service import conversation_memories
            memory = conversation_memories.get(session_id)
            if memory:
                conversation_history = memory.chat_memory.messages
        except Exception as e:
            print(f"[Context Builder] Error fetching conversation history: {str(e)}")

        # 3. Assemble request metadata
        request_metadata = {
            "is_authenticated": user_id is not None,
            "has_profile": profile is not None
        }

        # 4. Generate personalization details
        from services.personalization.context_personalizer import ContextPersonalizer
        personalizer = ContextPersonalizer()
        personalization = personalizer.personalize(profile)

        # 5. Fetch recent interactions from conversation memory
        memory = self.memory_manager.get_memory(session_id)
        recent_interactions = memory.get_recent_interactions()

        # 6. Generate conversation context
        conversation_context = self.context_builder_memory.build_context(recent_interactions, question)

        # 7. Construct and return RequestContext dataclass
        return RequestContext(
            question=question,
            user_id=user_id,
            session_id=session_id,
            timestamp=datetime.datetime.utcnow(),
            profile=profile,
            conversation_history=conversation_history,
            request_metadata=request_metadata,
            personalization=personalization,
            recent_interactions=recent_interactions,
            conversation_context=conversation_context
        )
