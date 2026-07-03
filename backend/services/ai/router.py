class AIRouter:
    """Intent Router that maps user queries to handler intents"""
    
    def __init__(self, registry):
        # Inject pre-initialized handlers registry
        self.registry = registry

    def route_query(self, question: str) -> str:
        """
        Structural intent router. 
        In Task 4A, this is a placeholder that always returns 'CAMPUS' 
        to preserve existing RAG behavior.
        """
        return "CAMPUS"
