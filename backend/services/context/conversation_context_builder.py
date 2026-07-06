import string
from typing import List, Dict, Any

class ConversationContextBuilder:
    """Generates concise, token-efficient conversation context from session history"""
    
    MAX_CONTEXT_INTERACTIONS = 5
    MAX_CONTEXT_CHARACTERS = 3000

    def build_context(self, recent_interactions: List[Dict[str, Any]], question: str) -> str:
        """Format historical interactions into a concise QA conversation context string"""
        
        # 1. Skip context injection for small talk/greetings to save tokens
        if self._is_small_talk(question):
            return ""

        # 2. Extract up to MAX_CONTEXT_INTERACTIONS
        interactions = recent_interactions[-self.MAX_CONTEXT_INTERACTIONS:]
        
        # 3. Format and enforce MAX_CONTEXT_CHARACTERS budget
        while interactions:
            lines = ["Conversation Context"]
            for idx, inter in enumerate(interactions):
                lines.append(f"Q:\n{inter['question']}")
                lines.append(f"A:\n{inter['answer']}")
            
            context_str = "\n\n".join(lines) + "\n\n"
            
            if len(context_str) <= self.MAX_CONTEXT_CHARACTERS:
                self._log_telemetry(len(interactions), len(context_str))
                return context_str
                
            # If context size exceeds budget, discard the oldest interaction and retry
            interactions.pop(0)

        return ""

    def _is_small_talk(self, question: str) -> bool:
        """Heuristic check to determine if the query is a simple greeting or pleasantry"""
        q = question.strip().lower()
        # Clean punctuation
        q = q.translate(str.maketrans("", "", string.punctuation))
        
        small_talk_keywords = {
            "hello", "hi", "hey", "thanks", "thank you", "bye", "goodbye",
            "good morning", "good evening", "good afternoon"
        }
        
        if q in small_talk_keywords:
            return True
            
        # Check sub-phrases
        for keyword in ["thank you", "thanks", "bye", "hello"]:
            if keyword in q:
                return True
                
        return False

    def _log_telemetry(self, count: int, char_count: int) -> None:
        """Prints detailed telemetry of context memory consumption"""
        est_tokens = char_count // 4
        print("\n" + "="*33)
        print("[CONVERSATION CONTEXT TELEMETRY]")
        print(f"Interactions Used : {count}")
        print(f"Characters : {char_count}")
        print(f"Tokens (estimated) : {est_tokens}")
        print("="*33 + "\n")
