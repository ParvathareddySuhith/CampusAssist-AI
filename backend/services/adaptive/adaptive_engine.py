import datetime
from collections import Counter
from typing import List, Dict, Any, Optional

from services.analytics.analytics_store import AnalyticsStore
from services.analytics.analytics_models import LearningEvent
from services.learning_progress.learning_progress_store import LearningProgressStore
from services.adaptive.learning_profile import LearningProfile

class AdaptiveEngine:
    """Processes historical analytics and progress data to build a dynamic learning profile"""

    def __init__(self, analytics_store: AnalyticsStore, progress_store: Optional[LearningProgressStore] = None):
        self.analytics_store = analytics_store
        self.progress_store = progress_store

    def build_profile(self, user_id: str) -> LearningProfile:
        """Gathers user events and progress to build and return a dynamic learning profile"""
        user_id = user_id or "guest_user"
        events = self.analytics_store.get_events(user_id)

        if not events:
            # Default empty profile
            profile = LearningProfile(
                user_id=user_id,
                favorite_topics=[],
                weak_topics=[],
                preferred_mode="Quiz",
                study_streak=0,
                preferred_assistant="Study Assistant",
                placement_readiness="Beginner",
                confidence=0.0
            )
            self._log_telemetry(profile)
            return profile

        # Extract topics that have active progress
        active_topics_count = 0
        if self.progress_store:
            # Get unique topics from events to query progress
            unique_topics = set(e.topic for e in events if e.topic not in ("General Query", "General"))
            for topic in unique_topics:
                prog = self.progress_store.get_progress(user_id, topic)
                if prog and prog.completion_percentage > 0:
                    active_topics_count += 1

        # Heuristics
        streak = self._calculate_streak(events)
        fav_topics = self._calculate_favorite_topics(events, user_id)
        weak_topics = self._calculate_weak_topics(events, user_id)
        mode = self._calculate_preferred_mode(events)
        readiness = self._calculate_placement_readiness(events)
        assistant = self._calculate_preferred_assistant(events)
        confidence = self._calculate_confidence(len(events), streak, active_topics_count)

        profile = LearningProfile(
            user_id=user_id,
            favorite_topics=fav_topics,
            weak_topics=weak_topics,
            preferred_mode=mode,
            study_streak=streak,
            preferred_assistant=assistant,
            placement_readiness=readiness,
            confidence=confidence
        )

        self._log_telemetry(profile)
        return profile

    def _calculate_confidence(self, events_count: int, streak: int, active_topics: int) -> float:
        """Heuristic for profile confidence calculation"""
        analytics_score = min(events_count * 0.1, 0.6)
        streak_score = min(streak * 0.1, 0.2)
        progress_score = min(active_topics * 0.1, 0.2)
        
        confidence = analytics_score + streak_score + progress_score
        return round(min(confidence, 1.0), 2)

    def _calculate_streak(self, events: List[LearningEvent]) -> int:
        """Calculates study streak based on consecutive active UTC days"""
        dates = sorted({e.timestamp.date() for e in events})
        if not dates:
            return 0

        today = datetime.datetime.now(datetime.timezone.utc).date()
        yesterday = today - datetime.timedelta(days=1)

        if dates[-1] not in (today, yesterday):
            return 0

        streak = 1
        current_date = dates[-1]
        for i in range(len(dates) - 2, -1, -1):
            d = dates[i]
            if d == current_date - datetime.timedelta(days=1):
                streak += 1
                current_date = d
            elif d == current_date:
                continue
            else:
                break
        return streak

    def _calculate_favorite_topics(self, events: List[LearningEvent], user_id: str) -> List[str]:
        """Heuristic to determine strongest/favorite topics"""
        topic_scores = {}
        unique_topics = set(e.topic for e in events)

        for topic in unique_topics:
            if topic in ("General Query", "General"):
                continue

            topic_events = [e for e in events if e.topic == topic]
            # Frequency component
            score = len(topic_events) * 2.0
            # Success component
            success_count = sum(1 for e in topic_events if e.success)
            score += success_count * 0.5

            # Progress component
            if self.progress_store:
                progress = self.progress_store.get_progress(user_id, topic)
                if progress:
                    score += (progress.completion_percentage / 10.0)

            topic_scores[topic] = score

        # Sort by score desc, then topic name asc
        sorted_topics = sorted(topic_scores.items(), key=lambda x: (-x[1], x[0]))
        return [t[0] for t in sorted_topics[:3]]

    def _calculate_weak_topics(self, events: List[LearningEvent], user_id: str) -> List[str]:
        """Heuristic to determine weakest topics"""
        weakness_scores = {}
        unique_topics = set(e.topic for e in events)

        for topic in unique_topics:
            if topic in ("General Query", "General"):
                continue

            topic_events = [e for e in events if e.topic == topic]
            total_count = len(topic_events)
            if total_count == 0:
                continue

            w_score = 0.0

            # Error rate component
            failed_count = sum(1 for e in topic_events if not e.success)
            error_rate = failed_count / total_count
            w_score += error_rate * 10.0

            # Average response time component
            avg_latency = sum(e.response_time_ms for e in topic_events) / total_count
            if avg_latency > 2000:
                w_score += (avg_latency - 2000) / 1000.0

            # Progress component
            if self.progress_store:
                progress = self.progress_store.get_progress(user_id, topic)
                if progress:
                    if 0 < progress.completion_percentage < 50:
                        w_score += (50 - progress.completion_percentage) / 10.0

            if w_score > 0:
                weakness_scores[topic] = w_score

        # Sort by weakness score desc, then topic name asc
        sorted_weak = sorted(weakness_scores.items(), key=lambda x: (-x[1], x[0]))
        return [t[0] for t in sorted_weak[:3]]

    def _calculate_preferred_mode(self, events: List[LearningEvent]) -> str:
        """Determines preferred learning mode based on query keywords"""
        mode_counts = Counter()
        for e in events:
            # Check question text in event metadata
            question = e.metadata.get("question", "").lower()
            if not question:
                continue
            
            if any(w in question for w in ["quiz", "test", "practice"]):
                mode_counts["Quiz"] += 1
            elif any(w in question for w in ["flashcard", "card", "deck", "revise"]):
                mode_counts["Flashcard"] += 1
            elif any(w in question for w in ["notes", "explain", "theory", "tutorial"]):
                mode_counts["Text Review"] += 1

        if not mode_counts:
            return "Quiz"

        # Return most common mode (or tie breaker alphabetically)
        return sorted(mode_counts.items(), key=lambda x: (-x[1], x[0]))[0][0]

    def _calculate_placement_readiness(self, events: List[LearningEvent]) -> str:
        """Heuristic for placement readiness level"""
        placement_count = sum(1 for e in events if e.intent == "PLACEMENT")
        if placement_count <= 3:
            return "Beginner"
        elif placement_count <= 7:
            return "Intermediate"
        else:
            return "Advanced"

    def _calculate_preferred_assistant(self, events: List[LearningEvent]) -> str:
        """Heuristic for preferred assistant based on intent majority"""
        intent_counts = Counter(e.intent for e in events)
        if not intent_counts:
            return "Study Assistant"

        academic_count = intent_counts.get("ACADEMIC", 0)
        placement_count = intent_counts.get("PLACEMENT", 0)
        campus_count = intent_counts.get("CAMPUS", 0)

        # Compare and return
        max_count = max(academic_count, placement_count, campus_count)
        if max_count == 0:
            return "Study Assistant"

        if max_count == academic_count:
            return "Study Assistant"
        elif max_count == placement_count:
            return "Placement Assistant"
        else:
            return "General Assistant"

    def _log_telemetry(self, profile: LearningProfile) -> None:
        """Prints concise debug telemetry for the generated profile"""
        print("\n" + "="*36)
        print("Adaptive Learning Profile")
        print("\nFavorite Topics")
        if profile.favorite_topics:
            for item in profile.favorite_topics:
                print(f"• {item}")
        else:
            print("None")
            
        print("\nWeak Topics")
        if profile.weak_topics:
            for item in profile.weak_topics:
                print(f"• {item}")
        else:
            print("None")

        print(f"\nPreferred Mode\n{profile.preferred_mode}")
        print(f"\nPreferred Assistant\n{profile.preferred_assistant}")
        print(f"\nPlacement Readiness\n{profile.placement_readiness}")
        print(f"\nStudy Streak\n{profile.study_streak}")
        print(f"\nConfidence\n{profile.confidence}")
        print("="*36 + "\n")
