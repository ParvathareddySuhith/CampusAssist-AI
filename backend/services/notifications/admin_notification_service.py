import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional
from config.database import db_instance
from services.notifications.notification_models import (
    Notification,
    VALID_CATEGORIES,
    VALID_PRIORITIES
)
from services.notifications.notification_store import NotificationStore

class NotificationValidationError(Exception):
    """Exception raised when notification parameter validation checks fail"""
    pass

class AdminNotificationService:
    """Service layer handling administrative notification broadcasts, stats, and history management"""

    def __init__(self, store: NotificationStore):
        self.store = store

    def broadcast_notification(
        self,
        target_type: str,
        target_value: str,
        title: str,
        message: str,
        category: str,
        priority: str,
        created_by_admin_id: str,
        sender_name: str
    ) -> Dict[str, Any]:
        """Broadcasts a notification to a specific group of students atomically using fan-out on write"""
        # Validate inputs
        if not title or not title.strip():
            raise NotificationValidationError("Notification title cannot be empty.")
        if not message or not message.strip():
            raise NotificationValidationError("Notification message cannot be empty.")
        if category not in VALID_CATEGORIES:
            raise NotificationValidationError(f"Invalid category: {category}")
        if priority not in VALID_PRIORITIES:
            raise NotificationValidationError(f"Invalid priority: {priority}")
        if target_type not in ["ALL", "DEPARTMENT", "SEMESTER", "INDIVIDUAL"]:
            raise NotificationValidationError(f"Invalid target type: {target_type}")

        # Look up recipient students from MongoDB
        profiles_collection = db_instance.get_collection("profiles")
        users_collection = db_instance.get_collection("users")
        recipient_user_ids = []

        if target_type == "ALL":
            profiles = list(profiles_collection.find({}))
            recipient_user_ids = [str(p["user_id"]) for p in profiles if "user_id" in p]
        elif target_type == "DEPARTMENT":
            if not target_value or not target_value.strip():
                raise NotificationValidationError("Department value cannot be empty.")
            import re
            dept_regex = re.compile(f"^{target_value.strip()}$", re.IGNORECASE)
            profiles = list(profiles_collection.find({"department": dept_regex}))
            recipient_user_ids = [str(p["user_id"]) for p in profiles if "user_id" in p]
        elif target_type == "SEMESTER":
            if not target_value:
                raise NotificationValidationError("Semester value cannot be empty.")
            try:
                sem_val = int(target_value)
            except ValueError:
                raise NotificationValidationError(f"Invalid semester value: {target_value}")
            profiles = list(profiles_collection.find({"semester": sem_val}))
            recipient_user_ids = [str(p["user_id"]) for p in profiles if "user_id" in p]
        elif target_type == "INDIVIDUAL":
            if not target_value or not target_value.strip():
                raise NotificationValidationError("Individual recipient username or email cannot be empty.")
            import re
            ident_regex = re.compile(f"^{target_value.strip()}$", re.IGNORECASE)
            user = users_collection.find_one({"$or": [{"username": ident_regex}, {"email": ident_regex}]})
            if not user:
                raise NotificationValidationError(f"Individual student '{target_value}' not found.")
            recipient_user_ids = [str(user["_id"])]

        if not recipient_user_ids:
            raise NotificationValidationError("No matching recipients found.")

        broadcast_id = str(uuid.uuid4())
        created_notifications = []

        try:
            for r_id in recipient_user_ids:
                notification = Notification(
                    id=str(uuid.uuid4()),
                    user_id=r_id,
                    title=title.strip(),
                    message=message.strip(),
                    category=category,
                    priority=priority,
                    created_at=datetime.now(timezone.utc),
                    is_read=False,
                    metadata={
                        "broadcast_id": broadcast_id,
                        "created_by_admin_id": created_by_admin_id,
                        "sender_name": sender_name,
                        "target_type": target_type,
                        "target_value": target_value
                    }
                )
                self.store.add(notification)
                created_notifications.append(notification.id)
        except Exception as e:
            # Atomic Rollback on failure
            for nid in created_notifications:
                try:
                    self.store.delete(nid)
                except Exception:
                    pass
            raise e

        return {
            "success": True,
            "broadcast_id": broadcast_id,
            "recipients": len(recipient_user_ids),
            "message": "Notification sent successfully."
        }

    def list_notifications(
        self,
        page: int = 1,
        page_size: int = 20,
        filters: Optional[Dict[str, Any]] = None,
        search_query: str = ""
    ) -> Dict[str, Any]:
        """Retrieve paginated list of consolidated broadcasts or individual messages"""
        if page < 1:
            raise NotificationValidationError("Page number must be 1 or greater.")
        if not (1 <= page_size <= 100):
            raise NotificationValidationError("Page size must be between 1 and 100.")

        with self.store._lock:
            all_notifs = list(self.store._by_id.values())

        # Group notifications by broadcast_id
        broadcasts = {}
        individuals = []

        for n in all_notifs:
            b_id = n.metadata.get("broadcast_id")
            if b_id:
                if b_id not in broadcasts:
                    broadcasts[b_id] = {
                        "id": b_id,
                        "title": n.title,
                        "message": n.message,
                        "category": n.category,
                        "priority": n.priority,
                        "created_at": n.created_at,
                        "target_type": n.metadata.get("target_type", "ALL"),
                        "target_value": n.metadata.get("target_value", ""),
                        "created_by_admin_id": n.metadata.get("created_by_admin_id", ""),
                        "sender_name": n.metadata.get("sender_name", "admin"),
                        "recipients": 0,
                        "delivered": 0,
                        "read": 0
                    }
                broadcasts[b_id]["recipients"] += 1
                broadcasts[b_id]["delivered"] += 1
                if n.is_read:
                    broadcasts[b_id]["read"] += 1
                # Maintain min created_at
                if n.created_at < broadcasts[b_id]["created_at"]:
                    broadcasts[b_id]["created_at"] = n.created_at
            else:
                individuals.append({
                    "id": n.id,
                    "title": n.title,
                    "message": n.message,
                    "category": n.category,
                    "priority": n.priority,
                    "created_at": n.created_at,
                    "target_type": "INDIVIDUAL",
                    "target_value": n.user_id,
                    "created_by_admin_id": n.metadata.get("created_by_admin_id", ""),
                    "sender_name": n.metadata.get("sender_name", "System"),
                    "recipients": 1,
                    "delivered": 1,
                    "read": 1 if n.is_read else 0
                })

        consolidated = list(broadcasts.values()) + individuals

        # Apply Filters
        filters = filters or {}
        filtered_list = []
        for item in consolidated:
            # Category filter
            cat_filter = filters.get("category")
            if cat_filter and cat_filter.upper() != "ALL":
                if item["category"].upper() != cat_filter.upper():
                    continue

            # Priority filter
            pri_filter = filters.get("priority")
            if pri_filter and pri_filter.upper() != "ALL":
                if item["priority"].upper() != pri_filter.upper():
                    continue

            # Target Scope filter
            scope_filter = filters.get("target_type")
            if scope_filter and scope_filter.upper() != "ALL":
                if item["target_type"].upper() != scope_filter.upper():
                    continue

            # Search text filter
            if search_query:
                sq = search_query.lower()
                if sq not in item["title"].lower() and sq not in item["message"].lower():
                    continue

            filtered_list.append(item)

        # Stable sorting: Sort by title ASC, then by id DESC, then by created_at DESC
        filtered_list.sort(key=lambda x: x["title"])
        filtered_list.sort(key=lambda x: x["id"], reverse=True)
        filtered_list.sort(key=lambda x: x["created_at"], reverse=True)

        total = len(filtered_list)
        pages = (total + page_size - 1) // page_size if total > 0 else 1

        start = (page - 1) * page_size
        end = start + page_size

        return {
            "notifications": [
                {
                    **item,
                    "created_at": item["created_at"].isoformat() if isinstance(item["created_at"], datetime) else item["created_at"]
                }
                for item in filtered_list[start:end]
            ],
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "pages": pages
            }
        }

    def delete_notification(self, id_or_broadcast_id: str) -> int:
        """Deletes a broadcast or individual message from memory store, returning deleted records count"""
        deleted_count = 0
        with self.store._lock:
            to_delete = []

            # Check if matching individual ID exists
            if id_or_broadcast_id in self.store._by_id:
                notif = self.store._by_id[id_or_broadcast_id]
                b_id = notif.metadata.get("broadcast_id")
                if b_id:
                    # Is part of a broadcast, collect all matching notifications
                    for nid, n in list(self.store._by_id.items()):
                        if n.metadata.get("broadcast_id") == b_id:
                            to_delete.append(n)
                else:
                    # Single notification
                    to_delete.append(notif)
            else:
                # Check if input matches broadcast_id directly
                for nid, n in list(self.store._by_id.items()):
                    if n.metadata.get("broadcast_id") == id_or_broadcast_id:
                        to_delete.append(n)

            # Perform deletion
            for n in to_delete:
                user_id = n.user_id
                if user_id in self.store._notifications:
                    self.store._notifications[user_id] = [x for x in self.store._notifications[user_id] if x.id != n.id]
                if n.id in self.store._by_id:
                    del self.store._by_id[n.id]
                deleted_count += 1

        return deleted_count

    def get_notification_stats(self) -> Dict[str, Any]:
        """Retrieve total, unread, broadcasts, and individual counts"""
        with self.store._lock:
            all_notifs = list(self.store._by_id.values())

        total_notifications = len(all_notifs)
        unread = sum(1 for n in all_notifs if not n.is_read)

        broadcast_ids = set()
        individual_messages = 0

        for n in all_notifs:
            b_id = n.metadata.get("broadcast_id")
            if b_id:
                broadcast_ids.add(b_id)
            else:
                individual_messages += 1

        return {
            "total_notifications": total_notifications,
            "unread": unread,
            "broadcasts": len(broadcast_ids),
            "individual_messages": individual_messages
        }
