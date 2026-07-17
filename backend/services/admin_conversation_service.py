import datetime
import math
from typing import Dict, Any, List
from bson import ObjectId
from config.database import db_instance

class AdminConversationService:
    """Service layer handling administrative chatbot conversation explorer queries"""

    def __init__(self):
        self.chat_history_col = db_instance.get_collection("chat_history")
        self.users_col = db_instance.get_collection("users")
        self.profiles_col = db_instance.get_collection("profiles")

    def list_conversations(self, page: int = 1, page_size: int = 20, search: str = "", department: str = "") -> Dict[str, Any]:
        """Aggregate flat chat history entries by user_id to display user conversations"""
        if page < 1:
            page = 1
        if not (1 <= page_size <= 100):
            page_size = 20

        # Build aggregation pipeline
        pipeline = []

        # 1. Join with users collection
        pipeline.append({
            "$lookup": {
                "from": "users",
                "localField": "user_id",
                "foreignField": "_id",
                "as": "user"
            }
        })
        pipeline.append({
            "$unwind": {
                "path": "$user",
                "preserveNullAndEmptyArrays": False
            }
        })

        # 2. Join with profiles collection
        pipeline.append({
            "$lookup": {
                "from": "profiles",
                "localField": "user_id",
                "foreignField": "user_id",
                "as": "profile"
            }
        })
        pipeline.append({
            "$unwind": {
                "path": "$profile",
                "preserveNullAndEmptyArrays": True
            }
        })

        # 3. Project needed fields for matching and grouping
        pipeline.append({
            "$project": {
                "user_id": 1,
                "question": 1,
                "answer": 1,
                "timestamp": 1,
                "username": "$user.username",
                "email": "$user.email",
                "department": {"$ifNull": ["$profile.department", "GENERAL"]}
            }
        })

        # 4. Filter by search query and department
        match_conditions = []
        if department:
            match_conditions.append({
                "department": {"$regex": f"^{department}$", "$options": "i"}
            })

        if search:
            match_conditions.append({
                "$or": [
                    {"username": {"$regex": search, "$options": "i"}},
                    {"email": {"$regex": search, "$options": "i"}},
                    {"question": {"$regex": search, "$options": "i"}},
                    {"answer": {"$regex": search, "$options": "i"}}
                ]
            })

        if match_conditions:
            pipeline.append({
                "$match": {
                    "$and": match_conditions
                }
            })

        # 5. Group by user_id
        pipeline.append({
            "$group": {
                "_id": "$user_id",
                "username": {"$first": "$username"},
                "email": {"$first": "$email"},
                "department": {"$first": "$department"},
                "started": {"$min": "$timestamp"},
                "last_message_at": {"$max": "$timestamp"},
                "turns_count": {"$sum": 1}
            }
        })

        # 6. Sort newest conversation first
        pipeline.append({
            "$sort": {
                "last_message_at": -1
            }
        })

        # Run aggregation and paginate in Python
        all_results = list(self.chat_history_col.aggregate(pipeline))
        total = len(all_results)
        pages = math.ceil(total / page_size) if total > 0 else 0

        if page > pages and pages > 0:
            page = pages

        skip = (page - 1) * page_size
        paginated_results = all_results[skip : skip + page_size]

        conversations = []
        for item in paginated_results:
            started_val = item.get("started")
            started_iso = started_val.isoformat() if isinstance(started_val, datetime.datetime) else started_val

            conversations.append({
                "id": str(item.get("_id")),
                "user": item.get("username") or item.get("email") or "Unknown User",
                "email": item.get("email"),
                "department": item.get("department"),
                "started": started_iso,
                "messages": item.get("turns_count", 0) * 2
            })

        return {
            "conversations": conversations,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "pages": pages
            }
        }

    def get_conversation(self, conversation_id: str) -> Dict[str, Any]:
        """Retrieve complete chronological QA message history for a single user"""
        try:
            user_obj_id = ObjectId(conversation_id)
        except Exception:
            return None

        user = self.users_col.find_one({"_id": user_obj_id})
        profile = self.profiles_col.find_one({"user_id": user_obj_id})
        
        # Fetch chat history turns sorted oldest first
        history = list(self.chat_history_col.find({"user_id": user_obj_id}).sort("timestamp", 1))
        
        messages = []
        for chat in history:
            ts = chat.get("timestamp")
            ts_iso = ts.isoformat() if isinstance(ts, datetime.datetime) else ts

            # User query turn
            messages.append({
                "role": "user",
                "content": chat.get("question"),
                "timestamp": ts_iso
            })
            # Assistant response turn
            messages.append({
                "role": "assistant",
                "content": chat.get("answer"),
                "timestamp": ts_iso
            })

        created_at_val = history[0].get("timestamp") if history else datetime.datetime.now(datetime.timezone.utc)
        created_at_iso = created_at_val.isoformat() if isinstance(created_at_val, datetime.datetime) else created_at_val

        return {
            "id": conversation_id,
            "user": user.get("username") if user else "Unknown User",
            "department": profile.get("department", "GENERAL") if profile else "GENERAL",
            "created_at": created_at_iso,
            "messages": messages
        }
