from services.ai.handlers.rag_handler import RAGHandler

class DocumentHandler(RAGHandler):
    """Handler for document-level queries (explaining or analyzing uploaded PDFs)"""
    
    def __init__(self, vectorstore):
        super().__init__(vectorstore)
        self.intent_name = "DOCUMENT"
        self.handler_name = "DocumentHandler"
