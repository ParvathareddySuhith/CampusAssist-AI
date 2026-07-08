from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any

@dataclass
class LearningProfile:
    """Represents a student's dynamically compiled adaptive learning profile"""
    user_id: str
    favorite_topics: List[str] = field(default_factory=list)      # maps to strongest topics
    weak_topics: List[str] = field(default_factory=list)          # maps to weakest topics
    preferred_mode: str = "Quiz"                                  # e.g., "Quiz", "Flashcard", "Text Review"
    study_streak: int = 0
    preferred_assistant: str = "Study Assistant"                  # e.g., "Study Assistant", "Placement Assistant", "General Assistant"
    placement_readiness: str = "Beginner"                          # "Beginner", "Intermediate", "Advanced"
    confidence: float = 0.0                                       # confidence value between 0.0 and 1.0

    @property
    def strongest_topics(self) -> List[str]:
        """Property alias for favorite_topics"""
        return self.favorite_topics

    @property
    def weakest_topics(self) -> List[str]:
        """Property alias for weak_topics"""
        return self.weak_topics

    def to_dict(self) -> Dict[str, Any]:
        """Serialize dataclass into a JSON-compatible dictionary with property aliases"""
        data = asdict(self)
        data["strongest_topics"] = self.strongest_topics
        data["weakest_topics"] = self.weakest_topics
        return data
