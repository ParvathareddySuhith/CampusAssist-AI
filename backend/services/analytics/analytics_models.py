from dataclasses import dataclass, field, asdict
import datetime
from typing import List, Dict, Any, Optional

@dataclass
class LearningEvent:
    """Represents a single successful interaction analytics event"""
    user_id: str
    session_id: str
    timestamp: datetime.datetime
    intent: str
    topic: str
    response_type: str            # e.g., "RAG", "LLM"
    response_time_ms: int
    success: bool
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        """Serialize dataclass into a JSON-compatible dictionary"""
        data = asdict(self)
        if isinstance(data["timestamp"], datetime.datetime):
            data["timestamp"] = data["timestamp"].isoformat()
        return data


@dataclass
class LearningSummary:
    """Aggregated stats summary of a student's learning history"""
    total_questions: int
    academic_questions: int
    placement_questions: int
    campus_questions: int
    document_questions: int
    general_questions: int
    favorite_topics: List[str]
    last_activity: Optional[datetime.datetime]

    def to_dict(self) -> Dict[str, Any]:
        """Serialize dataclass into a JSON-compatible dictionary"""
        data = asdict(self)
        if data["last_activity"] and isinstance(data["last_activity"], datetime.datetime):
            data["last_activity"] = data["last_activity"].isoformat()
        return data
