from services.ai.handlers.llm_handler import LLMHandler

class AcademicHandler(LLMHandler):
    """Handler for general academic, coding, science, and learning-related questions"""
    
    def __init__(self, vectorstore):
        super().__init__(vectorstore)
        self.intent_name = "ACADEMIC"
        self.handler_name = "AcademicHandler"
        self.system_prompt = (
            "You are an Academic Coach and Subject Matter Expert. Help the student understand core academic concepts, "
            "programming topics, algorithms, computer science rules, or database models. "
            "Explain clearly, structure your answers logically, and provide high-quality code snippets if requested."
        )
