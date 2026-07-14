import uuid
import datetime
import threading
from typing import Dict, Any, List, Optional
from config.database import db_instance
from services.notifications.memory_notification_store import MemoryNotificationStore
from services.analytics.memory_store import global_memory_store

class AdminAnalyticsService:
    """Service layer handling read-only aggregation of administration dashboard telemetry with 60s caching"""

    def __init__(self, notification_store: MemoryNotificationStore):
        self.notification_store = notification_store
        self._cache_lock = threading.Lock()
        self._dashboard_cache = {
            "data": None,
            "generated_at": None
        }
        self.RECENT_ACTIVITY_LIMIT = 15

    def invalidate_cache(self) -> None:
        """Clear the cached dashboard summary snapshot"""
        with self._cache_lock:
            self._dashboard_cache["data"] = None
            self._dashboard_cache["generated_at"] = None

    def get_dashboard_summary(self, force_refresh: bool = False) -> Dict[str, Any]:
        """Orchestrate and return a snapshot of the administration dashboard summary, using cache if valid"""
        if force_refresh:
            self.invalidate_cache()

        with self._cache_lock:
            now = datetime.datetime.now(datetime.timezone.utc)
            cached_data = self._dashboard_cache["data"]
            cached_time = self._dashboard_cache["generated_at"]

            if cached_data and cached_time:
                age_seconds = (now - cached_time).total_seconds()
                if age_seconds <= 60:
                    response = dict(cached_data)
                    response["cache"] = {
                        "cached": True,
                        "ttl_seconds": int(max(0, 60 - age_seconds))
                    }
                    return response

            # Cache is invalid or expired, aggregate fresh snapshot
            errors = {}
            summary = None
            departments = []
            questions_distribution = {}
            documents = None
            notifications = None
            recent_activity = []

            # 1. Headline summary counts
            try:
                summary = self._collect_summary()
            except Exception as e:
                errors["summary"] = {
                    "message": f"Unable to load summary metrics: {str(e)}",
                    "code": "SUMMARY_STATS_UNAVAILABLE"
                }

            # 2. Department statistics
            try:
                departments = self._collect_department_stats()
            except Exception as e:
                errors["departments"] = {
                    "message": f"Unable to load department enrollment distribution: {str(e)}",
                    "code": "DEPARTMENT_STATS_UNAVAILABLE"
                }

            # 3. Question intent distribution
            try:
                questions_distribution = self._collect_question_stats()
            except Exception as e:
                errors["questions_distribution"] = {
                    "message": f"Unable to load question intent distribution: {str(e)}",
                    "code": "QUESTION_STATS_UNAVAILABLE"
                }

            # 4. Document statistics
            try:
                documents = self._collect_document_stats()
            except Exception as e:
                errors["documents"] = {
                    "message": f"Unable to load document statistics: {str(e)}",
                    "code": "DOCUMENT_STATS_UNAVAILABLE"
                }

            # 5. Notification statistics
            try:
                notifications = self._collect_notification_stats()
            except Exception as e:
                errors["notifications"] = {
                    "message": f"Unable to load notification metrics: {str(e)}",
                    "code": "NOTIFICATION_STATS_UNAVAILABLE"
                }

            # 6. Recent activity timeline
            try:
                recent_activity = self._collect_recent_activity()
            except Exception as e:
                errors["recent_activity"] = {
                    "message": f"Unable to load recent activity timeline: {str(e)}",
                    "code": "RECENT_ACTIVITY_UNAVAILABLE"
                }

            fresh_data = {
                "generated_at": now.isoformat(),
                "cache": {
                    "cached": False,
                    "ttl_seconds": 60
                },
                "summary": summary,
                "departments": departments,
                "questions_distribution": questions_distribution,
                "documents": documents,
                "notifications": notifications,
                "recent_activity": recent_activity,
                "errors": errors
            }

            self._dashboard_cache["data"] = fresh_data
            self._dashboard_cache["generated_at"] = now
            return fresh_data

    def _collect_summary(self) -> Dict[str, Any]:
        """Aggregate headline totals across collections"""
        users_col = db_instance.get_collection("users")
        pdfs_col = db_instance.get_collection("pdfs")
        chat_history_col = db_instance.get_collection("chat_history")

        total_students = users_col.count_documents({})
        total_documents = pdfs_col.count_documents({})
        total_questions = chat_history_col.count_documents({})

        with self.notification_store._lock:
            total_notifications = len(self.notification_store._by_id)

        return {
            "students": total_students,
            "documents": total_documents,
            "questions": total_questions,
            "notifications": total_notifications
        }

    def _collect_department_stats(self) -> List[Dict[str, Any]]:
        """Group student enrollment profiles by department, sorted by count DESC and department ASC"""
        profiles_col = db_instance.get_collection("profiles")
        profiles = list(profiles_col.find({}))
        
        counts = {}
        for p in profiles:
            dept = p.get("department")
            if dept:
                dept_name = str(dept).strip().upper()
                counts[dept_name] = counts.get(dept_name, 0) + 1

        dept_stats = [{"department": k, "count": v} for k, v in counts.items()]
        # Stable sort: first by department ASC, then by count DESC
        dept_stats.sort(key=lambda x: x["department"])
        dept_stats.sort(key=lambda x: x["count"], reverse=True)
        return dept_stats

    def _collect_question_stats(self) -> Dict[str, int]:
        """Group user questions dynamically by intent category, with database fallback checks"""
        intents_counter = {}
        with global_memory_store._lock:
            for user_events in global_memory_store._db.values():
                for event in user_events:
                    intent = str(event.intent).upper()
                    intents_counter[intent] = intents_counter.get(intent, 0) + 1

        # Fallback to chat_history collection if memory store is empty
        if not intents_counter:
            chats = list(db_instance.get_collection("chat_history").find({}))
            for chat in chats:
                question = chat.get("question", "")
                q_lower = question.lower()
                if any(w in q_lower for w in ["dbms", "normal", "bcnf", "sql", "transaction", "schema", "table", "operating", "os", "process", "deadlock", "thread", "kernel", "class", "exam", "grade", "gpa"]):
                    intent = "ACADEMIC"
                elif any(w in q_lower for w in ["resume", "cv", "ats", "portfolio", "interview", "hr", "behavioral", "placement", "job", "career"]):
                    intent = "PLACEMENT"
                elif any(w in q_lower for w in ["bell", "notify", "broadcast", "alert"]):
                    intent = "SYSTEM"
                else:
                    intent = "GENERAL"
                intents_counter[intent] = intents_counter.get(intent, 0) + 1

        return intents_counter

    def _collect_document_stats(self) -> Dict[str, int]:
        """Group uploaded PDFs by status"""
        pdfs_col = db_instance.get_collection("pdfs")
        pdfs = list(pdfs_col.find({}))
        
        total = len(pdfs)
        indexed = 0
        processing = 0
        failed = 0

        for p in pdfs:
            status = str(p.get("status", "READY")).upper()
            if status in ("READY", "INDEXED"):
                indexed += 1
            elif status in ("INDEXING", "PROCESSING"):
                processing += 1
            elif status == "FAILED":
                failed += 1
            else:
                indexed += 1

        return {
            "total": total,
            "indexed": indexed,
            "processing": processing,
            "failed": failed
        }

    def _collect_notification_stats(self) -> Dict[str, Any]:
        """Compute notification feeds metrics and read rates"""
        with self.notification_store._lock:
            all_notifs = list(self.notification_store._by_id.values())

        total_notifications = len(all_notifs)
        read_count = sum(1 for n in all_notifs if n.is_read)
        read_rate = (read_count / total_notifications * 100) if total_notifications > 0 else 0.0

        broadcast_ids = set()
        individual_count = 0

        for n in all_notifs:
            b_id = n.metadata.get("broadcast_id") if n.metadata else None
            if b_id:
                broadcast_ids.add(b_id)
            else:
                individual_count += 1

        return {
            "broadcasts": len(broadcast_ids),
            "individual": individual_count,
            "read_rate": round(read_rate, 1)
        }

    def _collect_recent_activity(self) -> List[Dict[str, Any]]:
        """Compile a chronologically sorted list of recent platform actions"""
        users_col = db_instance.get_collection("users")
        pdfs_col = db_instance.get_collection("pdfs")

        # 1. Fetch user signups
        users = list(users_col.find({}).sort("created_at", -1).limit(self.RECENT_ACTIVITY_LIMIT))
        registration_events = []
        for u in users:
            ts = u.get("created_at")
            if isinstance(ts, str):
                try:
                    ts = datetime.datetime.fromisoformat(ts.replace("Z", "+00:00"))
                except:
                    ts = datetime.datetime.now(datetime.timezone.utc)
            elif not isinstance(ts, datetime.datetime):
                ts = datetime.datetime.now(datetime.timezone.utc)
            
            registration_events.append({
                "type": "USER_REGISTERED",
                "description": f"Student registered: {u.get('username', 'Unknown')}",
                "timestamp": ts,
                "identifier": u.get("username", "")
            })

        # 2. Fetch document uploads
        pdfs = list(pdfs_col.find({}).sort("uploaded_at", -1).limit(self.RECENT_ACTIVITY_LIMIT))
        pdf_events = []
        for p in pdfs:
            ts = p.get("uploaded_at")
            if isinstance(ts, str):
                try:
                    ts = datetime.datetime.fromisoformat(ts.replace("Z", "+00:00"))
                except:
                    ts = datetime.datetime.now(datetime.timezone.utc)
            elif not isinstance(ts, datetime.datetime):
                ts = datetime.datetime.now(datetime.timezone.utc)

            pdf_events.append({
                "type": "PDF_UPLOADED",
                "description": f"PDF Uploaded: {p.get('filename', 'Unknown.pdf')}",
                "timestamp": ts,
                "identifier": p.get("public_id", "")
            })

        # 3. Fetch broadcasts
        with self.notification_store._lock:
            all_notifs = list(self.notification_store._by_id.values())

        broadcast_groups = {}
        for n in all_notifs:
            b_id = n.metadata.get("broadcast_id") if n.metadata else None
            if b_id:
                if b_id not in broadcast_groups:
                    broadcast_groups[b_id] = {
                        "title": n.title,
                        "timestamp": n.created_at,
                        "recipients": 0
                    }
                broadcast_groups[b_id]["recipients"] += 1
                if n.created_at < broadcast_groups[b_id]["timestamp"]:
                    broadcast_groups[b_id]["timestamp"] = n.created_at

        broadcast_events = []
        for bid, bg in broadcast_groups.items():
            ts = bg["timestamp"]
            if not isinstance(ts, datetime.datetime):
                ts = datetime.datetime.now(datetime.timezone.utc)
            broadcast_events.append({
                "type": "BROADCAST_SENT",
                "description": f"Broadcast Sent: {bg['title']} (to {bg['recipients']} recipients)",
                "timestamp": ts,
                "identifier": bid
            })

        # Combine and sort deterministically
        all_events = registration_events + pdf_events + broadcast_events
        
        # Sort by: 1. timestamp DESC, 2. event_type ASC, 3. identifier ASC
        all_events.sort(key=lambda x: x["identifier"])
        all_events.sort(key=lambda x: x["type"])
        all_events.sort(key=lambda x: x["timestamp"].replace(tzinfo=datetime.timezone.utc) if x["timestamp"].tzinfo is None else x["timestamp"], reverse=True)

        sliced = all_events[:self.RECENT_ACTIVITY_LIMIT]
        formatted = []
        for e in sliced:
            formatted.append({
                "type": e["type"],
                "description": e["description"],
                "timestamp": e["timestamp"].isoformat()
            })
        return formatted
