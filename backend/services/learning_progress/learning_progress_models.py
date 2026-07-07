from dataclasses import dataclass, field, asdict
import datetime
from typing import Set, Dict, Any, Optional

def default_metadata():
    """Returns standard metadata dictionary for future-proof learning progress tracking"""
    return {
        "revision_count": 0,
        "time_spent_minutes": 0,
        "last_accessed": None
    }

@dataclass
class LearningProgress:
    """Represents a student's study progress through a specific learning topic"""
    user_id: str
    topic: str
    completed_steps: Set[str] = field(default_factory=set)
    current_step_index: int = 0
    completion_percentage: float = 0.0
    started_at: datetime.datetime = field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at: datetime.datetime = field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))
    last_completed_step: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=default_metadata)

    def to_dict(self) -> Dict[str, Any]:
        """Serialize dataclass into a JSON-compatible dictionary with stable list sorting"""
        data = asdict(self)
        # Convert completed_steps Set to sorted List for stable JSON responses
        data["completed_steps"] = sorted(list(self.completed_steps))
        
        # Serialize datetime objects to ISO format
        if isinstance(data["started_at"], datetime.datetime):
            data["started_at"] = data["started_at"].isoformat()
        if isinstance(data["updated_at"], datetime.datetime):
            data["updated_at"] = data["updated_at"].isoformat()
            
        return data
