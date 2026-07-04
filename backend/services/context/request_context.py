from dataclasses import dataclass, field
import datetime
from typing import Optional, List, Dict, Any

@dataclass
class RequestContext:
    """Dataclass holding all relevant request context before AI routing"""
    
    question: str
    user_id: Optional[str]
    session_id: str
    timestamp: datetime.datetime
    profile: Optional[Dict[str, Any]] = None
    conversation_history: List[Any] = field(default_factory=list)
    routing_context: Dict[str, Any] = field(default_factory=dict)
    request_metadata: Dict[str, Any] = field(default_factory=dict)
    debug_info: Dict[str, Any] = field(default_factory=dict)
