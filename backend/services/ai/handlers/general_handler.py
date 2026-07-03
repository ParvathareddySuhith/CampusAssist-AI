from services.ai.handlers.llm_handler import LLMHandler

class GeneralHandler(LLMHandler):
    """Handler for fallbacks, greetings, and generic conversation"""
    
    def __init__(self, vectorstore):
        super().__init__(vectorstore)
        self.intent_name = "GENERAL"
        self.handler_name = "GeneralHandler"
