from typing import Dict
from services.memory.conversation_memory import ConversationMemory

class ConversationMemoryManager:
    """
    Manages in-memory conversation records per session.
    
    Current implementation uses in-memory session storage.
    Designed so that Redis, MongoDB or another distributed
    cache can replace the internal storage without changing
    the public interface.
    """

    def __init__(self):
        self.memories: Dict[str, ConversationMemory] = {}

    def get_memory(self, session_id: str) -> ConversationMemory:
        """Retrieve or create ConversationMemory instance for a session_id"""
        if session_id not in self.memories:
            self.memories[session_id] = ConversationMemory()
        return self.memories[session_id]

    def add_interaction(self, session_id: str, question: str, answer: str, timestamp: str = None) -> None:
        """Add a QA interaction to session memory and enforce the 10-interaction cap"""
        memory = self.get_memory(session_id)
        memory.add_interaction(question, answer, timestamp)
        
        # Limit memory capacity to the 10 most recent interactions
        if memory.count() > 10:
            memory.interactions = memory.interactions[-10:]

    def clear_memory(self, session_id: str) -> None:
        """Wipe memory history for a session"""
        if session_id in self.memories:
            self.memories[session_id].clear()
