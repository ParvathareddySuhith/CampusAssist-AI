from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any

@dataclass
class LearningStep:
    """Represents a single step in a structured learning path"""
    id: str
    title: str
    description: str
    estimated_minutes: int
    difficulty: str  # "BEGINNER", "INTERMEDIATE", "ADVANCED"
    prerequisites: List[str] = field(default_factory=list)
    completed: bool = False

    def to_dict(self) -> Dict[str, Any]:
        """Serialize dataclass into a JSON-compatible dictionary"""
        return asdict(self)


@dataclass
class LearningPath:
    """Represents a structured roadmap generated for a topic"""
    topic: str
    source: str  # "PREDEFINED" | "GENERIC"
    difficulty: str  # "BEGINNER", "INTERMEDIATE", "ADVANCED"
    estimated_total_minutes: int
    steps: List[LearningStep]
    recommended_resources: List[str] = field(default_factory=list)
    next_step_index: int = 0

    def to_dict(self) -> Dict[str, Any]:
        """Serialize dataclass into a JSON-compatible dictionary"""
        data = asdict(self)
        # Manually serialize list of LearningStep dataclasses
        data["steps"] = [step.to_dict() for step in self.steps]
        return data
