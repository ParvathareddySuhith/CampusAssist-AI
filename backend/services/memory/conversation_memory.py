import datetime
from typing import List, Dict, Any

class ConversationMemory:
    """Represents conversation memory for a single session, storing question-answer interactions"""

    def __init__(self):
        self.interactions: List[Dict[str, Any]] = []

    def add_interaction(self, question: str, answer: str, timestamp: str = None) -> None:
        """Appends a single QA interaction to the history list"""
        if not timestamp:
            timestamp = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
            
        self.interactions.append({
            "question": question,
            "answer": answer,
            "timestamp": timestamp
        })

    def get_recent_interactions(self) -> List[Dict[str, Any]]:
        """Retrieve list of interactions stored in this session"""
        return self.interactions

    def clear(self) -> None:
        """Reset the conversation history list"""
        self.interactions = []

    def count(self) -> int:
        """Return the total number of interactions in this session memory"""
        return len(self.interactions)
