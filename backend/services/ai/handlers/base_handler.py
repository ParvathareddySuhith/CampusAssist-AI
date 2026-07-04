import time
import re
from models.models import Query, ChatHistory

class BaseHandler:
    """Base class for all intent handlers implementing common telemetry and formatting"""
    
    def __init__(self, vectorstore):
        self.vectorstore = vectorstore
        self.query_model = Query()
        self.chat_history_model = ChatHistory()
        self.intent_name = "BASE"
        self.handler_name = "BaseHandler"

    def handle(self, question, session_id, user_id=None, routing_context=None):
        """Unified entry point for query processing with telemetry logging"""
        start_time = time.time()
        
        try:
            result, status_code = self._execute(question, session_id, user_id, routing_context)
        except Exception as e:
            print(f"[AI Service Layer] Error executing {self.handler_name}: {str(e)}")
            raise e
            
        execution_time = time.time() - start_time
        
        print("\n" + "="*40)
        print(f"Intent: {self.intent_name}")
        print(f"Handler: {self.handler_name}")
        print(f"Execution Time: {execution_time:.2f}s")
        print("="*40 + "\n")
        
        return result, status_code

    def _execute(self, question, session_id, user_id=None, routing_context=None):
        """Abstract execution method overridden by subclasses"""
        raise NotImplementedError("Subclasses must implement _execute()")

    def format_response(self, text):
        """Format markdown-style text to HTML"""
        if not text:
            return ""
        
        # Convert newlines to breaks
        formatted = text.replace('\n', '<br>')
        
        # Convert bold markdown **text** to HTML <strong>text</strong>
        formatted = re.sub(r'\*\*(.*?)\*\*', r'<strong>\1</strong>', formatted)
        
        # Convert list markdown - text to HTML bullet lists
        formatted = re.sub(r'^\s*-\s+(.*?)(?=\n|$)', r'<li>\1</li>', formatted, flags=re.MULTILINE)
        
        return formatted

    def save_and_format_response(self, question, answer, session_id, user_id=None):
        """Save history and format output"""
        # Check for various forms of "no answer" responses
        no_answer_phrases = [
            "i do not know",
            "i don't know",
            "cannot find",
            "no information",
            "insufficient information",
            "the document does not contain",
            "no relevant information",
            "cannot answer",
            "unable to answer"
        ]
        
        if any(phrase in answer.lower() for phrase in no_answer_phrases):
            print("No answer found - adding to unanswered queries")
            self.query_model.create_query(question, user_id, answered=False)
            return {
                "answer": "I apologize, but I don't have enough information to answer this question accurately. Your query has been logged for manual review.",
                "status": "unanswered",
                "session_id": session_id
            }, 404
        
        # Store chat history if user is logged in
        if user_id:
            try:
                self.chat_history_model.create_chat(user_id, question, answer)
            except Exception as e:
                print(f"Error storing chat history: {str(e)}")

        formatted_answer = self.format_response(answer)
        
        # Load memory to compile history output
        from services.chat_service import conversation_memories
        memory = conversation_memories.get(session_id)
        chat_history = []
        if memory:
            chat_history = [str(msg) for msg in memory.chat_memory.messages]
            
        return {
            "answer": formatted_answer,
            "raw_answer": answer,
            "chat_history": chat_history,
            "status": "answered",
            "session_id": session_id
        }, 200
