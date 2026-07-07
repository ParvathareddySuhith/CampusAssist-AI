from flask import request, jsonify
from services.analytics.learning_analytics import LearningAnalyticsEngine
from services.analytics.memory_store import global_memory_store
import datetime

class AnalyticsController:
    """Controller for fetching user learning analytics summaries and detailed metrics"""
    
    def __init__(self):
        self.analytics_engine = LearningAnalyticsEngine(global_memory_store)

    def get_analytics_summary(self, user_id):
        """Retrieve compiled learning statistics and activity metrics for the user"""
        if not user_id:
            return jsonify({"error": "Unauthorized user token validation failed"}), 401
            
        try:
            summary = self.analytics_engine.get_summary(user_id)
            events = self.analytics_engine.store.get_events(user_id)
            
            # 1. Calculate questions asked today (UTC timezone matched)
            today_utc = datetime.datetime.utcnow().date()
            questions_today = sum(1 for e in events if e.timestamp.date() == today_utc)
            
            # 2. Calculate current session activity matching active session_id query param
            session_id = request.args.get("session_id")
            session_questions = 0
            if session_id:
                session_questions = sum(1 for e in events if e.session_id == session_id)
            elif events:
                # Fallback to the latest known session of the student
                latest_session = events[-1].session_id
                session_questions = sum(1 for e in events if e.session_id == latest_session)

            # Calculate favorite topics with counts
            from collections import Counter
            topics = [e.topic for e in events if e.topic]
            topic_counts = Counter(topics)
            favorite_topics_with_counts = [
                {"topic": topic, "count": count}
                for topic, count in topic_counts.most_common(3)
            ]

            return jsonify({
                "total_questions": summary.total_questions,
                "academic_questions": summary.academic_questions,
                "placement_questions": summary.placement_questions,
                "campus_questions": summary.campus_questions,
                "document_questions": summary.document_questions,
                "general_questions": summary.general_questions,
                "favorite_topics": favorite_topics_with_counts,
                "last_activity": summary.last_activity.isoformat() if summary.last_activity else None,
                "today_questions": questions_today,
                "session_questions": session_questions
            }), 200
            
        except Exception as e:
            print(f"[Analytics Controller] Error compiling summary: {str(e)}")
            return jsonify({"error": f"Failed to retrieve learning analytics: {str(e)}"}), 500
