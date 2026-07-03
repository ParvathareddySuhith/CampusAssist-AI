from services.ai.handlers.rag_handler import RAGHandler

class CampusHandler(RAGHandler):
    """Handler for campus administrative/institutional queries"""
    
    def __init__(self, vectorstore):
        super().__init__(vectorstore)
        self.intent_name = "CAMPUS"
        self.handler_name = "CampusHandler"
