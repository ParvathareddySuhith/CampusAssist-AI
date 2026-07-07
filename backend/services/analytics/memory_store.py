import threading
from typing import List, Dict
from services.analytics.analytics_store import AnalyticsStore
from services.analytics.analytics_models import LearningEvent

class MemoryAnalyticsStore(AnalyticsStore):
    """
    Thread-safe, in-memory implementation of AnalyticsStore.
    
    Developers:
    To migrate to MongoDB, Redis, or PostgreSQL in future sprints,
    simply create a new concrete store class (e.g. MongoAnalyticsStore)
    implementing AnalyticsStore interface without changing any code
    in the LearningAnalyticsEngine.
    """

    def __init__(self):
        self._lock = threading.Lock()
        self._db: Dict[str, List[LearningEvent]] = {}

    def add_event(self, event: LearningEvent) -> None:
        with self._lock:
            user_id = event.user_id
            if user_id not in self._db:
                self._db[user_id] = []
            self._db[user_id].append(event)

    def get_events(self, user_id: str) -> List[LearningEvent]:
        with self._lock:
            # Return a list copy to prevent thread-safety mutation leaks
            return list(self._db.get(user_id, []))

    def clear(self, user_id: str) -> None:
        with self._lock:
            if user_id in self._db:
                self._db[user_id] = []

global_memory_store = MemoryAnalyticsStore()
