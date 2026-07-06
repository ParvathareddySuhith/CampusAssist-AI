from abc import ABC, abstractmethod
from typing import List
from services.analytics.analytics_models import LearningEvent

class AnalyticsStore(ABC):
    """Abstract storage interface for recording learning events.
    
    Subclasses must implement these methods to support different backends
    (e.g., in-memory list, MongoDB collection, Redis, SQL database).
    """

    @abstractmethod
    def add_event(self, event: LearningEvent) -> None:
        """Saves a learning event to the store"""
        pass

    @abstractmethod
    def get_events(self, user_id: str) -> List[LearningEvent]:
        """Retrieves all learning events for a given user"""
        pass

    @abstractmethod
    def clear(self, user_id: str) -> None:
        """Clears all events for a given user"""
        pass
