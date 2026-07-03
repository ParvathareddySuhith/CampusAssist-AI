from services.ai.handlers.llm_handler import LLMHandler

class PlacementHandler(LLMHandler):
    """Handler for professional development, resume coaching, and interview prep queries"""
    
    def __init__(self, vectorstore):
        super().__init__(vectorstore)
        self.intent_name = "PLACEMENT"
        self.handler_name = "PlacementHandler"
