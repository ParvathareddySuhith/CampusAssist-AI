import datetime
from collections import Counter
from typing import List, Dict, Any, Optional

from services.analytics.analytics_store import AnalyticsStore
from services.analytics.analytics_models import LearningEvent, LearningSummary

class LearningAnalyticsEngine:
    """Core analytics engine that compiles learning events and aggregates history statelessly"""

    def __init__(self, store: AnalyticsStore):
        self.store = store

    def record_event(self, request_context: "RequestContext", response: Dict[str, Any]) -> None:
        """Constructs a LearningEvent from query context and logs it via the store"""
        user_id = request_context.user_id or "guest_user"
        session_id = request_context.session_id
        timestamp = datetime.datetime.now(datetime.timezone.utc)
        intent = request_context.intent

        # Extract topic from question using keywords
        topic = self._extract_topic(request_context.question)

        # Calculate latency in milliseconds
        latency = int((timestamp - request_context.timestamp).total_seconds() * 1000)
        # Avoid negative latency or 0 ms anomalies
        if latency <= 0:
            latency = 1

        # Extract response type (RAG vs LLM)
        routing_ctx = request_context.routing_context or {}
        strategy = routing_ctx.get("strategy", "LLM").upper()

        event = LearningEvent(
            user_id=user_id,
            session_id=session_id,
            timestamp=timestamp,
            intent=intent,
            topic=topic,
            response_type=strategy,
            response_time_ms=latency,
            success=True,
            metadata={
                "question_length": len(request_context.question),
                "question": request_context.question
            }
        )

        self.store.add_event(event)

        # Count total questions asked by this student for telemetry
        user_events = self.store.get_events(user_id)
        total_asked = len(user_events)

        self._log_telemetry(user_id, intent, topic, strategy, latency, total_asked)

    def get_summary(self, user_id: str) -> LearningSummary:
        """Aggregates all recorded events for a user to compile a LearningSummary"""
        user_id = user_id or "guest_user"
        events = self.store.get_events(user_id)

        if not events:
            return LearningSummary(
                total_questions=0,
                academic_questions=0,
                placement_questions=0,
                campus_questions=0,
                document_questions=0,
                general_questions=0,
                favorite_topics=[],
                last_activity=None
            )

        total_questions = len(events)
        
        # Count intents
        academic_count = sum(1 for e in events if e.intent == "ACADEMIC")
        placement_count = sum(1 for e in events if e.intent == "PLACEMENT")
        campus_count = sum(1 for e in events if e.intent == "CAMPUS")
        document_count = sum(1 for e in events if e.intent == "DOCUMENT")
        general_count = sum(1 for e in events if e.intent in ["GENERAL", "SMALL_TALK"])

        # Determine favorite topics (top 3)
        topics = [e.topic for e in events]
        topic_counts = Counter(topics)
        # Get top 3 sorted by frequency, then alphabetically
        favorite_topics = [t[0] for t in topic_counts.most_common(3)]

        # Get latest activity
        last_activity = max(e.timestamp for e in events)

        return LearningSummary(
            total_questions=total_questions,
            academic_questions=academic_count,
            placement_questions=placement_count,
            campus_questions=campus_count,
            document_questions=document_count,
            general_questions=general_count,
            favorite_topics=favorite_topics,
            last_activity=last_activity
        )

    def _extract_topic(self, question: str) -> str:
        """Extracts standard topics from raw question keywords"""
        q = question.lower()
        if any(w in q for w in ["dbms", "normal", "bcnf", "sql", "transaction", "schema", "table"]):
            return "DBMS"
        elif any(w in q for w in ["operating", "os", "process", "deadlock", "thread", "kernel"]):
            return "Operating Systems"
        elif any(w in q for w in ["resume", "cv", "ats", "portfolio"]):
            return "Resume Review"
        elif any(w in q for w in ["interview", "hr", "behavioral", "strength", "weakness"]):
            return "Interview Prep"
        elif any(w in q for w in ["quiz", "flashcard", "notes", "summarize", "study"]):
            return "Study Assistant"
        return "General Query"

    def _log_telemetry(self, user_id: str, intent: str, topic: str, resp_type: str, latency: int, total_asked: int) -> None:
        """Logs readable telemetry values in the requested format"""
        # Obfuscate user ID to show first 8 chars + ... if long
        user_display = user_id
        if len(user_id) > 12:
            user_display = user_id[:8] + "..."

        print("\n" + "="*34)
        print("Learning Analytics")
        print(f"User\n{user_display}")
        print(f"\nIntent\n{intent}")
        print(f"\nTopic\n{topic}")
        print(f"\nResponse Type\n{resp_type}")
        print(f"\nLatency\n{latency} ms")
        print(f"\nQuestions Asked\n{total_asked}")
        print("="*34 + "\n")
