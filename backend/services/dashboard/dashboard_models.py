from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional

@dataclass
class DashboardStudent:
    """Academic and identification details of the student for dashboard display"""
    name: str = ""
    department: str = ""
    semester: int = 0

@dataclass
class DashboardSummary:
    """Unified container representing the complete learning overview returned in a single GET request"""
    student: DashboardStudent
    learning_profile: Dict[str, Any] = field(default_factory=dict)
    analytics: Dict[str, Any] = field(default_factory=dict)
    progress: List[Dict[str, Any]] = field(default_factory=list)
    recommendations: Dict[str, Any] = field(default_factory=dict)
    recent_activity: List[Dict[str, Any]] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        """Serialize data transfer object into JSON-compatible dictionary representation"""
        return {
            "student": asdict(self.student),
            "learning_profile": self.learning_profile,
            "analytics": self.analytics,
            "progress": self.progress,
            "recommendations": self.recommendations,
            "recent_activity": self.recent_activity
        }
