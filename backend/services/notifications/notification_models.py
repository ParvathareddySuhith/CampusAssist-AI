from dataclasses import dataclass, field
from datetime import datetime
from typing import Dict, Any

VALID_CATEGORIES = {
    "GENERAL",
    "STUDY",
    "PLACEMENT",
    "DASHBOARD",
    "SYSTEM",
}

VALID_PRIORITIES = {
    "LOW",
    "MEDIUM",
    "HIGH",
}

@dataclass
class Notification:
    id: str
    user_id: str
    title: str
    message: str
    category: str
    priority: str
    created_at: datetime
    is_read: bool = False
    metadata: Dict[str, Any] = field(default_factory=dict)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "message": self.message,
            "category": self.category,
            "priority": self.priority,
            "created_at": self.created_at.isoformat() if isinstance(self.created_at, datetime) else self.created_at,
            "is_read": self.is_read,
            "metadata": self.metadata
        }
