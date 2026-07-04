from services.ai.handlers.llm_handler import LLMHandler

class PlacementHandler(LLMHandler):
    """Handler for professional development, resume coaching, and interview prep queries"""
    
    def __init__(self, vectorstore):
        super().__init__(vectorstore)
        self.intent_name = "PLACEMENT"
        self.handler_name = "PlacementHandler"
        self.system_prompt = (
            "You are a Placement and Career Coach. Help the student prepare for university placements, "
            "interviews, resume building, soft skills development, or coding exercises. "
            "Provide professional tips, career advice, and structured interview answers."
        )
