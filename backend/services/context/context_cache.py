class ContextCacheInterface:
    """Interface for future profile, conversation, and document context caching"""
    
    def get(self, key: str):
        """Retrieve cached context item"""
        raise NotImplementedError()
        
    def set(self, key: str, value: any, ttl: int = None):
        """Set cached context item with optional TTL"""
        raise NotImplementedError()
        
    def delete(self, key: str):
        """Delete cached context item"""
        raise NotImplementedError()
