from services.ai.handlers.llm_handler import LLMHandler

class AcademicHandler(LLMHandler):
    """Handler for general academic, coding, science, and learning-related questions"""
    
    def __init__(self, vectorstore):
        super().__init__(vectorstore)
        self.intent_name = "ACADEMIC"
        self.handler_name = "AcademicHandler"
