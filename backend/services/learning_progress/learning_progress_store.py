import abc
import threading
from typing import Dict, Tuple, Optional
from services.learning_progress.learning_progress_models import LearningProgress

class LearningProgressStore(abc.ABC):
    """Abstract base class interface for progress data repositories"""

    @abc.abstractmethod
    def get_progress(self, user_id: str, topic: str) -> Optional[LearningProgress]:
        """Fetch progress entry for user and topic"""
        pass

    @abc.abstractmethod
    def update_progress(self, progress: LearningProgress) -> None:
        """Upsert/save progress entry"""
        pass

    @abc.abstractmethod
    def clear_progress(self, user_id: str, topic: str) -> None:
        """Remove progress entry"""
        pass


class MemoryProgressStore(LearningProgressStore):
    """Thread-safe, in-memory repository for progress data using composite (user_id, topic) keys"""

    def __init__(self):
        self._store: Dict[Tuple[str, str], LearningProgress] = {}
        self._lock = threading.Lock()

    def get_progress(self, user_id: str, topic: str) -> Optional[LearningProgress]:
        with self._lock:
            key = (user_id, topic)
            return self._store.get(key)

    def update_progress(self, progress: LearningProgress) -> None:
        with self._lock:
            key = (progress.user_id, progress.topic)
            self._store[key] = progress

    def clear_progress(self, user_id: str, topic: str) -> None:
        with self._lock:
            key = (user_id, topic)
            if key in self._store:
                del self._store[key]


# Shared global singleton store
global_progress_store = MemoryProgressStore()
