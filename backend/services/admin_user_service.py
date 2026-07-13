import datetime
import re
from bson import ObjectId
from typing import Dict, Any, List, Optional
from config.database import db_instance
from services.analytics.memory_store import global_memory_store
from services.analytics.learning_analytics import LearningAnalyticsEngine
from services.learning_progress.learning_progress_store import global_progress_store
from services.learning_progress.learning_progress_engine import LearningProgressEngine
from services.learning_path.learning_path_engine import LearningPathEngine
from services.adaptive.adaptive_engine import AdaptiveEngine
from services.recommendation.recommendation_engine import RecommendationEngine
from services.dashboard.dashboard_service import DashboardService

class AdminUserService:
  """Service layer for administrative user management operations"""

  def __init__(self):
    self.users_collection = db_instance.get_collection("users")
    self.profiles_collection = db_instance.get_collection("profiles")
    
    # Instantiate dashboard dependencies
    analytics_store = global_memory_store
    analytics_engine = LearningAnalyticsEngine(analytics_store)
    progress_store = global_progress_store
    progress_engine = LearningProgressEngine(progress_store)
    learning_path_engine = LearningPathEngine()
    adaptive_engine = AdaptiveEngine(
      analytics_store=analytics_store,
      progress_store=progress_store
    )
    recommendation_engine = RecommendationEngine()
    
    self.dashboard_service = DashboardService(
      student_profile_model=None, # Not used for get_profile_aggregation when profile is passed or read
      analytics_engine=analytics_engine,
      adaptive_engine=adaptive_engine,
      recommendation_engine=recommendation_engine,
      progress_engine=progress_engine,
      learning_path_engine=learning_path_engine,
      progress_store=progress_store
    )
    # Patch student profile model to keep dashboard service self-contained
    from models.models import StudentProfile
    self.dashboard_service.student_profile_model = StudentProfile()

  def get_users_page(self, page: int, page_size: int, search_query: str = "", sort_by: str = "last_active", sort_order: str = "desc") -> Dict[str, Any]:
    """Retrieve search-filtered, sorted, and paginated student lists with metadata"""
    # 1. Search profiles collection first if search query is provided
    matching_user_ids = []
    if search_query:
      regex = re.compile(search_query, re.IGNORECASE)
      matching_profiles = list(self.profiles_collection.find({
        "$or": [
          {"full_name": regex},
          {"roll_number": regex},
          {"department": regex}
        ]
      }))
      for p in matching_profiles:
        uid = p.get("user_id")
        if uid:
          matching_user_ids.append(uid)

    # 2. Build users query
    user_query = {}
    if search_query:
      regex = re.compile(search_query, re.IGNORECASE)
      or_conditions = [
        {"username": regex},
        {"email": regex}
      ]
      
      # Convert profile IDs to ObjectIds
      obj_ids = []
      for uid in matching_user_ids:
        try:
          obj_ids.append(ObjectId(uid))
        except Exception:
          pass
      if obj_ids:
        or_conditions.append({"_id": {"$in": obj_ids}})
        
      user_query["$or"] = or_conditions

    # 3. Retrieve all matches from database
    db_users = list(self.users_collection.find(user_query))
    
    # 4. Enrich each student with profile and last_active telemetry
    enriched_users = []
    for u in db_users:
      user_id_str = str(u["_id"])
      
      # Fetch profile details
      profile = self.profiles_collection.find_one({"user_id": u["_id"]}) or {}
      
      # Fetch last active timestamp from in-memory analytics logs
      events = global_memory_store.get_events(user_id_str)
      last_active_dt = None
      if events:
        last_active_dt = max(e.timestamp for e in events)
      
      enriched_users.append({
        "id": user_id_str,
        "username": u.get("username", ""),
        "email": u.get("email", ""),
        "full_name": profile.get("full_name", ""),
        "department": profile.get("department", ""),
        "semester": profile.get("semester", ""),
        "is_active": u.get("is_active", True),
        "created_at": u.get("created_at"),
        "last_active_dt": last_active_dt,
        "last_active": last_active_dt.isoformat() if last_active_dt else "Never Active"
      })

    # 5. Sort list in Python to support in-memory last_active ordering
    reverse = sort_order.lower() == "desc"
    
    def get_sort_key(user_dict):
      val = user_dict.get(sort_by)
      if sort_by == "last_active":
        # Sort by actual datetime object (None values go to the end)
        dt = user_dict.get("last_active_dt")
        if dt is None:
          # If descending, put never active at the bottom (oldest epoch)
          # If ascending, put never active at the top (oldest epoch)
          return datetime.datetime(1970, 1, 1, tzinfo=datetime.timezone.utc)
        return dt
      elif sort_by == "created_at":
        dt = val
        if not dt:
          return datetime.datetime(1970, 1, 1, tzinfo=datetime.timezone.utc)
        if isinstance(dt, str):
          try:
            return datetime.datetime.fromisoformat(dt)
          except:
            return datetime.datetime(1970, 1, 1, tzinfo=datetime.timezone.utc)
        return dt
      # String fallback sorting
      return str(val or "").lower()

    enriched_users.sort(key=get_sort_key, reverse=reverse)

    # 6. Slice page
    total = len(enriched_users)
    start = (page - 1) * page_size
    end = start + page_size
    paginated_users = enriched_users[start:end]
    
    # Calculate pages count
    pages = (total + page_size - 1) // page_size if total > 0 else 0

    # Clean temporary datetime keys before returning JSON response
    for pu in paginated_users:
      if "last_active_dt" in pu:
        del pu["last_active_dt"]
      if isinstance(pu.get("created_at"), datetime.datetime):
        pu["created_at"] = pu["created_at"].isoformat()

    return {
      "users": paginated_users,
      "pagination": {
        "page": page,
        "page_size": page_size,
        "total": total,
        "pages": pages
      }
    }

  def get_user_details(self, user_id: str) -> Dict[str, Any]:
    """Inspect student dashboard aggregation and telemetry records"""
    # Verify user exists
    user = self.users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
      raise ValueError("Student user not found")

    # Fetch profile aggregation
    agg = self.dashboard_service.get_profile_aggregation(user_id)
    
    # Fetch questions telemetry count
    summary = LearningAnalyticsEngine(global_memory_store).get_summary(user_id)

    return {
      "id": str(user["_id"]),
      "username": user.get("username", ""),
      "email": user.get("email", ""),
      "is_active": user.get("is_active", True),
      "student": agg.get("student", {}),
      "learning_profile": agg.get("learning_profile", {}),
      "progress": agg.get("progress", []),
      "analytics": {
        "total_questions": summary.total_questions,
        "academic_questions": summary.academic_questions,
        "placement_questions": summary.placement_questions,
        "campus_questions": summary.campus_questions,
        "general_questions": summary.general_questions
      }
    }

  def update_user_status(self, user_id: str, enabled: bool) -> Dict[str, Any]:
    """Toggle is_active account activation status"""
    res = self.users_collection.update_one(
      {"_id": ObjectId(user_id)},
      {"$set": {"is_active": enabled}}
    )
    if res.matched_count == 0:
      raise ValueError("Student user not found")
      
    return {
      "success": True,
      "user": {
        "id": user_id,
        "is_active": enabled
      }
    }

  def notify_user(self, user_id: str, title: str, message: str, category: str = "GENERAL", priority: str = "MEDIUM", notification_service = None) -> Dict[str, Any]:
    """Send targeted alert announcement to student notifications center"""
    if not notification_service:
      raise ValueError("Notification service not configured")
      
    notification_service.create_notification(
      user_id=user_id,
      title=title,
      message=message,
      category=category or "GENERAL",
      priority=priority or "MEDIUM"
    )
    return {"success": True, "message": "Notification sent successfully"}
