from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional

@dataclass
class RecommendationItem:
    """Dataclass representing a single recommendation item card/shortcut"""
    id: str
    title: str
    description: str
    type: str                     # e.g., "link", "quiz", "flashcard", "document", "roadmap"
    priority: str                 # Must only be: "HIGH", "MEDIUM", "LOW"
    action: str                   # Navigation route or action event payload (e.g. "/study-assistant")
    icon: str                     # Icon name or emoji (e.g. "📝", "📚")
    category: Optional[str] = None # Optional grouping category (e.g., "study", "placement")
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class RecommendationResult:
    """Dataclass holding all recommendation categories returned in the post-processing pipeline"""
    topics: List[RecommendationItem] = field(default_factory=list)
    documents: List[RecommendationItem] = field(default_factory=list)
    study_tools: List[RecommendationItem] = field(default_factory=list)
    placement: List[RecommendationItem] = field(default_factory=list)
    next_questions: List[RecommendationItem] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """Convert the nested dataclasses recursively into primitive python dictionaries for JSON serialization"""
        return asdict(self)
