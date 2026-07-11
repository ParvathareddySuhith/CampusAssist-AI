import unittest
import json
import jwt
import threading
import time
from datetime import datetime, timezone, timedelta
from flask import Flask

from config.config import Config
from services.notifications import (
    Notification,
    MemoryNotificationStore,
    NotificationService,
    VALID_CATEGORIES,
    VALID_PRIORITIES,
    NotificationNotFoundError,
    NotificationAccessDeniedError
)
from routes.notification_routes import create_notification_routes

class TestNotifications(unittest.TestCase):
    
    def setUp(self):
        # Initialize store and service
        self.store = MemoryNotificationStore()
        self.service = NotificationService(self.store)
        
        # Setup simple Flask test app
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = Config.SECRET_KEY
        
        # Register notification routes
        self.app.register_blueprint(create_notification_routes(self.service))
        self.client = self.app.test_client()
        
        self.user_id = "test_student_user"
        self.other_user_id = "other_student_user"
        
        # Generate valid test tokens
        self.token = jwt.encode(
            {"user_id": self.user_id},
            Config.SECRET_KEY,
            algorithm="HS256"
        )
        self.other_token = jwt.encode(
            {"user_id": self.other_user_id},
            Config.SECRET_KEY,
            algorithm="HS256"
        )
        
        self.headers = {"Authorization": f"Bearer {self.token}"}
        self.other_headers = {"Authorization": f"Bearer {self.other_token}"}

    def test_notification_creation(self):
        """Verify notification creation generates UUIDs, timezone-aware timestamps, and preserves metadata"""
        metadata = {"link": "/schedules/123", "target": "calendar"}
        notif = self.service.create_notification(
            user_id=self.user_id,
            title="Class Rescheduled",
            message="Your DBMS class is rescheduled to 2 PM.",
            category="STUDY",
            priority="HIGH",
            metadata=metadata
        )
        
        # Assertions
        self.assertIsNotNone(notif.id)
        self.assertEqual(len(notif.id), 36) # UUID length
        self.assertEqual(notif.user_id, self.user_id)
        self.assertEqual(notif.title, "Class Rescheduled")
        self.assertEqual(notif.message, "Your DBMS class is rescheduled to 2 PM.")
        self.assertEqual(notif.category, "STUDY")
        self.assertEqual(notif.priority, "HIGH")
        self.assertFalse(notif.is_read)
        self.assertEqual(notif.metadata, metadata)
        
        # Timestamp must be timezone-aware UTC
        self.assertIsNotNone(notif.created_at.tzinfo)
        self.assertEqual(notif.created_at.tzinfo, timezone.utc)

    def test_invalid_category_raises_error(self):
        """Verify creating a notification with an invalid category raises ValueError"""
        with self.assertRaises(ValueError):
            self.service.create_notification(
                user_id=self.user_id,
                title="Title",
                message="Message",
                category="ABC"
            )

    def test_invalid_priority_raises_error(self):
        """Verify creating a notification with an invalid priority raises ValueError"""
        with self.assertRaises(ValueError):
            self.service.create_notification(
                user_id=self.user_id,
                title="Title",
                message="Message",
                priority="URGENT"
            )

    def test_retrieval_sorting_newest_first(self):
        """Verify notifications are returned in descending order of created_at"""
        notif1 = self.service.create_notification(self.user_id, "First", "Msg 1")
        # Simulate slight time difference
        time.sleep(0.01)
        notif2 = self.service.create_notification(self.user_id, "Second", "Msg 2")
        time.sleep(0.01)
        notif3 = self.service.create_notification(self.user_id, "Third", "Msg 3")
        
        notifs = self.service.get_notifications(self.user_id)
        
        self.assertEqual(len(notifs), 3)
        self.assertEqual(notifs[0].id, notif3.id)
        self.assertEqual(notifs[1].id, notif2.id)
        self.assertEqual(notifs[2].id, notif1.id)

    def test_unread_count_helper(self):
        """Verify get_unread_count returns correct value as read status changes"""
        self.service.create_notification(self.user_id, "N1", "M1")
        n2 = self.service.create_notification(self.user_id, "N2", "M2")
        self.assertEqual(self.service.get_unread_count(self.user_id), 2)
        
        self.service.mark_as_read(self.user_id, n2.id)
        self.assertEqual(self.service.get_unread_count(self.user_id), 1)

    def test_mark_as_read_lifecycle(self):
        """Verify mark_as_read updates is_read flag, works on subsequent calls, and raises correct exceptions"""
        n = self.service.create_notification(self.user_id, "N1", "M1")
        self.assertFalse(n.is_read)
        
        # Mark read once
        updated = self.service.mark_as_read(self.user_id, n.id)
        self.assertTrue(updated.is_read)
        
        # Mark read twice (should not fail)
        updated_again = self.service.mark_as_read(self.user_id, n.id)
        self.assertTrue(updated_again.is_read)
        
        # Unauthorized access
        with self.assertRaises(NotificationAccessDeniedError):
            self.service.mark_as_read(self.other_user_id, n.id)
            
        # Non-existent notification
        with self.assertRaises(NotificationNotFoundError):
            self.service.mark_as_read(self.user_id, "fake_id_123")

    def test_mark_all_as_read(self):
        """Verify mark_all_as_read marks all notifications read for target user only"""
        self.service.create_notification(self.user_id, "U1_N1", "M1")
        self.service.create_notification(self.user_id, "U1_N2", "M2")
        other_n = self.service.create_notification(self.other_user_id, "U2_N1", "M1")
        
        self.service.mark_all_as_read(self.user_id)
        
        # User 1 should have 0 unread
        self.assertEqual(self.service.get_unread_count(self.user_id), 0)
        # User 2 should remain unread
        self.assertEqual(self.service.get_unread_count(self.other_user_id), 1)

    def test_delete_notification(self):
        """Verify single notification removal, ownership validation, and missing handling"""
        n = self.service.create_notification(self.user_id, "N1", "M1")
        self.assertEqual(len(self.service.get_notifications(self.user_id)), 1)
        
        # Try deleting with wrong owner
        with self.assertRaises(NotificationAccessDeniedError):
            self.service.delete_notification(self.other_user_id, n.id)
            
        # Try deleting non-existent ID
        with self.assertRaises(NotificationNotFoundError):
            self.service.delete_notification(self.user_id, "fake_id_123")
            
        # Delete successfully
        self.service.delete_notification(self.user_id, n.id)
        self.assertEqual(len(self.service.get_notifications(self.user_id)), 0)

    def test_clear_notifications(self):
        """Verify clear_notifications removes all notifications for target user only"""
        self.service.create_notification(self.user_id, "U1_N1", "M1")
        self.service.create_notification(self.user_id, "U1_N2", "M2")
        self.service.create_notification(self.other_user_id, "U2_N1", "M1")
        
        self.service.clear_notifications(self.user_id)
        
        self.assertEqual(len(self.service.get_notifications(self.user_id)), 0)
        self.assertEqual(len(self.service.get_notifications(self.other_user_id)), 1)

    def test_isolated_storage(self):
        """Verify user databases are strictly separated"""
        self.service.create_notification(self.user_id, "User 1 Notif", "Message")
        self.service.create_notification(self.other_user_id, "User 2 Notif", "Message")
        
        u1_list = self.service.get_notifications(self.user_id)
        u2_list = self.service.get_notifications(self.other_user_id)
        
        self.assertEqual(len(u1_list), 1)
        self.assertEqual(u1_list[0].title, "User 1 Notif")
        self.assertEqual(len(u2_list), 1)
        self.assertEqual(u2_list[0].title, "User 2 Notif")

    def test_thread_safety(self):
        """Verify thread-safe store and service handling concurrent additions"""
        num_threads = 10
        adds_per_thread = 100
        
        def worker(thread_idx):
            for i in range(adds_per_thread):
                self.service.create_notification(
                    user_id=f"thread_user_{thread_idx}",
                    title=f"Notif {i}",
                    message="Concurrent test message"
                )
                
        threads = []
        for t_idx in range(num_threads):
            t = threading.Thread(target=worker, args=(t_idx,))
            threads.append(t)
            t.start()
            
        for t in threads:
            t.join()
            
        # Verify counts
        for t_idx in range(num_threads):
            user_notifs = self.service.get_notifications(f"thread_user_{t_idx}")
            self.assertEqual(len(user_notifs), adds_per_thread)
            
        # Verify no duplicate IDs across all created notifications
        all_ids = set()
        total_count = 0
        for t_idx in range(num_threads):
            user_notifs = self.service.get_notifications(f"thread_user_{t_idx}")
            for n in user_notifs:
                all_ids.add(n.id)
                total_count += 1
                
        self.assertEqual(len(all_ids), num_threads * adds_per_thread)
        self.assertEqual(total_count, num_threads * adds_per_thread)

    def test_nested_metadata_preservation(self):
        """Verify that nested metadata dictionaries survive serialization and deep copying"""
        nested_metadata = {
            "action": "click",
            "payload": {
                "course_id": "CS101",
                "nested_list": [1, 2, 3],
                "details": {"key": "value"}
            }
        }
        n = self.service.create_notification(
            self.user_id, "Title", "Message", metadata=nested_metadata
        )
        
        # Test direct metadata
        self.assertEqual(n.metadata, nested_metadata)
        self.assertEqual(n.metadata["payload"]["details"]["key"], "value")
        
        # Test serialization format (to_dict)
        serialized = n.to_dict()
        self.assertEqual(serialized["metadata"], nested_metadata)
        self.assertEqual(serialized["metadata"]["payload"]["details"]["key"], "value")

    def test_clear_notifications_idempotency(self):
        """Verify that calling clear_notifications() twice succeeds without any errors"""
        self.service.create_notification(self.user_id, "N1", "M1")
        self.assertEqual(len(self.service.get_notifications(self.user_id)), 1)
        
        # First clear
        self.service.clear_notifications(self.user_id)
        self.assertEqual(len(self.service.get_notifications(self.user_id)), 0)
        
        # Second clear (should be idempotent and not raise errors)
        self.service.clear_notifications(self.user_id)
        self.assertEqual(len(self.service.get_notifications(self.user_id)), 0)

    def test_unread_count_updates_accurately(self):
        """Verify the unread count updates correctly after mark_as_read(), mark_all_as_read(), and delete_notification()"""
        n1 = self.service.create_notification(self.user_id, "N1", "M1")
        n2 = self.service.create_notification(self.user_id, "N2", "M2")
        n3 = self.service.create_notification(self.user_id, "N3", "M3")
        
        self.assertEqual(self.service.get_unread_count(self.user_id), 3)
        
        # 1. Update after single mark_as_read
        self.service.mark_as_read(self.user_id, n1.id)
        self.assertEqual(self.service.get_unread_count(self.user_id), 2)
        
        # 2. Update after delete
        self.service.delete_notification(self.user_id, n2.id)
        self.assertEqual(self.service.get_unread_count(self.user_id), 1)
        
        # 3. Update after mark_all_as_read
        self.service.mark_all_as_read(self.user_id)
        self.assertEqual(self.service.get_unread_count(self.user_id), 0)

    def test_timestamp_ordering_milliseconds(self):
        """Verify that notifications created milliseconds apart are still sorted newest first"""
        n1 = self.service.create_notification(self.user_id, "First", "Msg 1")
        # Ensure we sleep for a tiny duration so that created_at differs slightly
        time.sleep(0.005)
        n2 = self.service.create_notification(self.user_id, "Second", "Msg 2")
        time.sleep(0.005)
        n3 = self.service.create_notification(self.user_id, "Third", "Msg 3")
        
        # Retrieve and verify ordering
        notifs = self.service.get_notifications(self.user_id)
        self.assertEqual(len(notifs), 3)
        self.assertEqual(notifs[0].id, n3.id)
        self.assertEqual(notifs[1].id, n2.id)
        self.assertEqual(notifs[2].id, n1.id)

    def test_api_routes_success_and_errors(self):
        """Verify API response formats (including wrapper dict with unread_count), HTTP codes, and authentication checks"""
        
        # 1. GET empty list (expects wrapper dictionary)
        resp = self.client.get('/api/notifications', headers=self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json, {"notifications": [], "unread_count": 0})
        
        # 2. Authentication failure (missing token)
        resp = self.client.get('/api/notifications')
        self.assertEqual(resp.status_code, 401)
        self.assertIn("Token is missing", resp.json.get("message", ""))
        
        # Create a notification to test edits
        n = self.service.create_notification(self.user_id, "Title", "Message")
        
        # 3. GET populated list
        resp = self.client.get('/api/notifications', headers=self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json["notifications"]), 1)
        self.assertEqual(resp.json["notifications"][0]["id"], n.id)
        self.assertEqual(resp.json["unread_count"], 1)
        
        # 4. PATCH Mark Read Success
        resp = self.client.patch(f'/api/notifications/{n.id}/read', headers=self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(resp.json["is_read"])
        
        # 5. PATCH Mark Read 404 Missing
        resp = self.client.patch('/api/notifications/fake_id_123/read', headers=self.headers)
        self.assertEqual(resp.status_code, 404)
        self.assertIn("not found", resp.json.get("error", "").lower())
        
        # 6. PATCH Mark Read 403 Unauthorized
        resp = self.client.patch(f'/api/notifications/{n.id}/read', headers=self.other_headers)
        self.assertEqual(resp.status_code, 403)
        self.assertIn("not authorized", resp.json.get("error", "").lower())
        
        # Create more notifications
        n2 = self.service.create_notification(self.user_id, "T2", "M2")
        self.service.create_notification(self.other_user_id, "Other T", "Other M")
        
        # 7. PATCH Mark All Read
        resp = self.client.patch('/api/notifications/read-all', headers=self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(self.service.get_unread_count(self.user_id), 0)
        self.assertEqual(self.service.get_unread_count(self.other_user_id), 1) # Isolated
        
        # 8. DELETE Notification Success
        resp = self.client.delete(f'/api/notifications/{n2.id}', headers=self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(self.service.get_notifications(self.user_id)), 1)
        
        # 9. DELETE Notification 403 Unauthorized
        resp = self.client.delete(f'/api/notifications/{n.id}', headers=self.other_headers)
        self.assertEqual(resp.status_code, 403)
        
        # 10. DELETE Clear Notifications
        resp = self.client.delete('/api/notifications', headers=self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(self.service.get_notifications(self.user_id)), 0)
        self.assertEqual(len(self.service.get_notifications(self.other_user_id)), 1)
