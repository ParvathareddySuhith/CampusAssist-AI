import datetime
from typing import List, Dict, Any, Optional
from services.context.request_context import RequestContext
from services.dashboard.dashboard_models import DashboardStudent, DashboardSummary

class DashboardService:
    """Read-only orchestrator service that aggregates student dashboard telemetry without writing state"""

    def __init__(self,
                 student_profile_model,
                 analytics_engine,
                 adaptive_engine,
                 recommendation_engine,
                 progress_engine,
                 learning_path_engine,
                 progress_store=None):
        self.student_profile_model = student_profile_model
        self.analytics_engine = analytics_engine
        self.adaptive_engine = adaptive_engine
        self.recommendation_engine = recommendation_engine
        self.progress_engine = progress_engine
        self.learning_path_engine = learning_path_engine
        
        # fallback/injected progress store for querying progress lists
        if progress_store:
            self.progress_store = progress_store
        elif hasattr(progress_engine, 'store'):
            self.progress_store = progress_engine.store
        else:
            self.progress_store = None

    def get_summary(self, user_id: str) -> Dict[str, Any]:
        """Orchestrate all dashboard data sections with resilience to partial subsystem failures"""
        user_id = user_id or "guest_user"

        # 1. Fetch Student Profile
        try:
            profile = self.student_profile_model.get_profile(user_id)
            if profile:
                student = DashboardStudent(
                    name=profile.get("full_name", ""),
                    department=profile.get("department", ""),
                    semester=int(profile.get("semester", 0))
                )
            else:
                student = DashboardStudent(name="", department="", semester=0)
        except Exception as e:
            print(f"[DashboardService] Failed to retrieve student profile: {e}")
            student = DashboardStudent(name="", department="", semester=0)

        # 2. Fetch Adaptive Profile
        try:
            profile_obj = self.adaptive_engine.build_profile(user_id)
            learning_profile = profile_obj.to_dict()
        except Exception as e:
            print(f"[DashboardService] Failed to build adaptive profile: {e}")
            learning_profile = {
                "user_id": user_id,
                "favorite_topics": [],
                "weak_topics": [],
                "preferred_mode": "Quiz",
                "study_streak": 0,
                "preferred_assistant": "Study Assistant",
                "placement_readiness": "Beginner",
                "confidence": 0.0,
                "strongest_topics": [],
                "weakest_topics": [],
                "error": str(e)
            }

        # 3. Fetch Analytics Summary
        try:
            summary_obj = self.analytics_engine.get_summary(user_id)
            analytics = {
                "questions": summary_obj.total_questions,
                "academic": summary_obj.academic_questions,
                "placement": summary_obj.placement_questions,
                "campus": summary_obj.campus_questions,
                "general": summary_obj.general_questions
            }
        except Exception as e:
            print(f"[DashboardService] Failed to fetch analytics summary: {e}")
            analytics = {
                "questions": 0,
                "academic": 0,
                "placement": 0,
                "campus": 0,
                "general": 0,
                "error": str(e)
            }

        # 4. Fetch Progress Subsystem records
        try:
            progress = self._fetch_all_progress(user_id)
        except Exception as e:
            print(f"[DashboardService] Failed to compile learning progress: {e}")
            progress = []

        # 5. Fetch Personalized Recommendations using Lightweight RequestContext
        try:
            recommendations = self._fetch_recommendations_with_ctx(user_id, profile, learning_profile)
        except Exception as e:
            print(f"[DashboardService] Failed to generate recommendations: {e}")
            recommendations = {
                "topics": [],
                "documents": [],
                "study_tools": [],
                "placement": [],
                "next_questions": [],
                "error": str(e)
            }

        # 6. Fetch Recent Activity Limit (latest 10, timestamp desc)
        try:
            recent_activity = self.get_recent_activity(user_id)
        except Exception as e:
            print(f"[DashboardService] Failed to gather recent activity: {e}")
            recent_activity = []

        summary_dto = DashboardSummary(
            student=student,
            learning_profile=learning_profile,
            analytics=analytics,
            progress=progress,
            recommendations=recommendations,
            recent_activity=recent_activity
        )
        return summary_dto.to_dict()

    def get_recent_activity(self, user_id: str) -> List[Dict[str, Any]]:
        """Gets learning events sorted by timestamp descending, returning at most 10 events"""
        user_id = user_id or "guest_user"
        if not self.analytics_engine or not hasattr(self.analytics_engine, 'store'):
            return []
        
        events = self.analytics_engine.store.get_events(user_id)
        if not events:
            return []

        sorted_events = sorted(events, key=lambda e: e.timestamp, reverse=True)[:10]
        return [
            {
                "timestamp": e.timestamp.strftime("%Y-%m-%d %H:%M:%S UTC"),
                "intent": e.intent,
                "topic": e.topic,
                "response_type": e.response_type,
                "success": e.success,
                "metadata": e.metadata
            }
            for e in sorted_events
        ]

    def get_recommendations(self, user_id: str) -> Dict[str, Any]:
        """Retrieve recommendations for a user via lightweight context"""
        user_id = user_id or "guest_user"
        try:
            profile = self.student_profile_model.get_profile(user_id)
            profile_obj = self.adaptive_engine.build_profile(user_id)
            return self._fetch_recommendations_with_ctx(user_id, profile, profile_obj.to_dict())
        except Exception as e:
            print(f"[DashboardService] Failed to generate standalone recommendations: {e}")
            return {
                "topics": [],
                "documents": [],
                "study_tools": [],
                "placement": [],
                "next_questions": [],
                "error": str(e)
            }

    def get_profile_aggregation(self, user_id: str) -> Dict[str, Any]:
        """Aggregate student database profile, adaptive profile, and learning progress"""
        user_id = user_id or "guest_user"
        
        try:
            profile = self.student_profile_model.get_profile(user_id)
            if profile:
                student = {
                    "full_name": profile.get("full_name", ""),
                    "department": profile.get("department", ""),
                    "year": profile.get("year", ""),
                    "semester": profile.get("semester", ""),
                    "section": profile.get("section", ""),
                    "roll_number": profile.get("roll_number", "")
                }
            else:
                student = {
                    "full_name": "",
                    "department": "",
                    "year": "",
                    "semester": "",
                    "section": "",
                    "roll_number": ""
                }
        except Exception as e:
            student = {
                "full_name": "",
                "department": "",
                "year": "",
                "semester": "",
                "section": "",
                "roll_number": "",
                "error": str(e)
            }

        try:
            profile_obj = self.adaptive_engine.build_profile(user_id)
            learning_profile = profile_obj.to_dict()
        except Exception as e:
            learning_profile = {
                "favorite_topics": [],
                "weak_topics": [],
                "preferred_mode": "Quiz",
                "study_streak": 0,
                "preferred_assistant": "Study Assistant",
                "placement_readiness": "Beginner",
                "confidence": 0.0,
                "error": str(e)
            }

        try:
            progress = self._fetch_all_progress(user_id)
        except Exception as e:
            progress = []

        return {
            "student": student,
            "learning_profile": learning_profile,
            "progress": progress
        }

    # Private helper methods
    def _fetch_all_progress(self, user_id: str) -> List[Dict[str, Any]]:
        """Collects formatted progress payloads from storage locks"""
        if not self.progress_store or not hasattr(self.progress_store, '_store'):
            return []

        user_progress = []
        with self.progress_store._lock:
            # Safely extract matching items
            matching_progress = [
                prog for key, prog in self.progress_store._store.items()
                if key[0] == user_id
            ]

        for prog in matching_progress:
            # Generate the predefined or generic learning path for this topic
            dummy_ctx = RequestContext(
                question=f"Introduce {prog.topic}",
                user_id=user_id,
                session_id="dashboard_summary",
                timestamp=datetime.datetime.now(datetime.timezone.utc),
                intent="ACADEMIC"
            )
            lpath = self.learning_path_engine.generate_learning_path(dummy_ctx)
            formatted = self.progress_engine.format_progress_response(prog, lpath)
            formatted["topic"] = prog.topic
            user_progress.append(formatted)

        return user_progress

    def _fetch_recommendations_with_ctx(self, user_id: str, profile_dict: Optional[Dict[str, Any]], learning_profile_dict: Dict[str, Any]) -> Dict[str, Any]:
        """Helper to invoke recommendation engine using a lightweight RequestContext"""
        # Re-materialize the LearningProfile object for typing if dictionary was passed
        from services.adaptive.learning_profile import LearningProfile
        if isinstance(learning_profile_dict, dict):
            profile_obj = LearningProfile(
                user_id=user_id,
                favorite_topics=learning_profile_dict.get("favorite_topics", []),
                weak_topics=learning_profile_dict.get("weak_topics", []),
                preferred_mode=learning_profile_dict.get("preferred_mode", "Quiz"),
                study_streak=learning_profile_dict.get("study_streak", 0),
                preferred_assistant=learning_profile_dict.get("preferred_assistant", "Study Assistant"),
                placement_readiness=learning_profile_dict.get("placement_readiness", "Beginner"),
                confidence=learning_profile_dict.get("confidence", 0.0)
            )
        else:
            profile_obj = learning_profile_dict

        # Determine target intent based on adaptive preferences
        intent = "GENERAL"
        pref_assistant = getattr(profile_obj, "preferred_assistant", "General Assistant")
        if pref_assistant == "Placement Assistant":
            intent = "PLACEMENT"
        elif pref_assistant == "Study Assistant":
            intent = "ACADEMIC"

        # Build lightweight RequestContext
        ctx = RequestContext(
            question="Help me revise topics.",
            user_id=user_id,
            session_id="dashboard_summary",
            timestamp=datetime.datetime.now(datetime.timezone.utc),
            profile=profile_dict,
            learning_profile=profile_obj,
            personalization={
                "learning_profile": profile_obj.to_dict()
            },
            intent=intent
        )
        
        res = self.recommendation_engine.generate(ctx)
        return res.to_dict()
