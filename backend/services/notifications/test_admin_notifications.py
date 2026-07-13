import sys
import os
import unittest
import json
from unittest.mock import MagicMock, patch
import jwt
import datetime
from flask import Flask, jsonify
from bson import ObjectId

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from config.config import Config
from services.notifications.notification_models import Notification, VALID_CATEGORIES, VALID_PRIORITIES
from services.notifications.memory_notification_store import MemoryNotificationStore
from services.notifications.admin_notification_service import (
    AdminNotificationService,
    NotificationValidationError
)
from routes.admin_notification_routes import create_admin_notification_routes
from services.admin_auth.admin_models import Admin, ROLE_ADMIN

class TestAdminNotificationCenter(unittest.TestCase):

    def setUp(self):
        # 1. Mock collections
        self.mock_users_col = MagicMock()
        self.mock_profiles_col = MagicMock()

        # 2. Patch Database.get_collection before service init
        self.db_patcher = patch('config.database.Database.get_collection')
        self.mock_get_collection = self.db_patcher.start()
        self.mock_get_collection.side_effect = lambda name: self.mock_users_col if name == "users" else self.mock_profiles_col

        # 3. Create Store and Service
        self.store = MemoryNotificationStore()
        self.service = AdminNotificationService(self.store)

        # 4. Create Flask app
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test-secret-key'
        self.app.config['ADMIN_NOTIFICATION_SERVICE'] = self.service

        # Mock AdminAuthService
        from services.admin_auth import MemoryAdminStore, AdminAuthService
        self.admin_store = MemoryAdminStore()
        self.admin_auth_service = AdminAuthService(self.admin_store, self.app)
        self.admin_record = self.admin_store.create_admin(
            Admin(id="admin-123", username="testadmin", email="testadmin@campusassist.ai", password_hash="hash", role="ADMIN", is_active=True)
        )
        self.app.config['ADMIN_AUTH_SERVICE'] = self.admin_auth_service

        # Register routes
        self.app.register_blueprint(create_admin_notification_routes(), url_prefix='/api/admin/notifications')
        self.client = self.app.test_client()

        # Generate tokens
        self.admin_token = jwt.encode(
            {"user_id": "admin-123", "role": "ADMIN"},
            Config.SECRET_KEY,
            algorithm="HS256"
        )
        self.student_token = jwt.encode(
            {"user_id": "student-123", "role": "STUDENT"},
            Config.SECRET_KEY,
            algorithm="HS256"
        )
        self.admin_headers = {"Authorization": f"Bearer {self.admin_token}"}
        self.student_headers = {"Authorization": f"Bearer {self.student_token}"}

    def tearDown(self):
        self.db_patcher.stop()

    def test_broadcast_all_students(self):
        """Test broadcasting to all students fetches profiles and fans out"""
        # Mock student profiles in DB
        stud1_id = ObjectId()
        stud2_id = ObjectId()
        self.mock_profiles_col.find.return_value = [
            {"user_id": stud1_id, "department": "CSE", "semester": 5},
            {"user_id": stud2_id, "department": "ECE", "semester": 3}
        ]

        res = self.service.broadcast_notification(
            target_type="ALL",
            target_value="",
            title="All Campus Alert",
            message="Campus is closed due to rain.",
            category="GENERAL",
            priority="HIGH",
            created_by_admin_id="admin-123",
            sender_name="testadmin"
        )

        self.assertTrue(res["success"])
        self.assertEqual(res["recipients"], 2)
        self.assertIsNotNone(res["broadcast_id"])

        # Verify fanned out notification records in memory store
        notifs1 = self.store.get_all(str(stud1_id))
        self.assertEqual(len(notifs1), 1)
        self.assertEqual(notifs1[0].title, "All Campus Alert")
        self.assertEqual(notifs1[0].metadata["broadcast_id"], res["broadcast_id"])
        self.assertEqual(notifs1[0].metadata["created_by_admin_id"], "admin-123")

        notifs2 = self.store.get_all(str(stud2_id))
        self.assertEqual(len(notifs2), 1)

    def test_broadcast_by_department(self):
        """Test department broadcast queries profiles and sends to matching users"""
        stud1_id = ObjectId()
        self.mock_profiles_col.find.return_value = [
            {"user_id": stud1_id, "department": "CSE", "semester": 5}
        ]

        res = self.service.broadcast_notification(
            target_type="DEPARTMENT",
            target_value="CSE",
            title="CSE Circular",
            message="CSE students must submit reports.",
            category="ACADEMIC",
            priority="MEDIUM",
            created_by_admin_id="admin-123",
            sender_name="testadmin"
        )

        self.assertTrue(res["success"])
        self.assertEqual(res["recipients"], 1)
        # Verify db query parameters
        self.mock_profiles_col.find.assert_called_once()
        query_arg = self.mock_profiles_col.find.call_args[0][0]
        self.assertIn("department", query_arg)

    def test_broadcast_by_semester(self):
        """Test semester broadcast queries profiles and sends to matching users"""
        stud_id = ObjectId()
        self.mock_profiles_col.find.return_value = [
            {"user_id": stud_id, "department": "ECE", "semester": 6}
        ]

        res = self.service.broadcast_notification(
            target_type="SEMESTER",
            target_value="6",
            title="Semester 6 Exam Schedule",
            message="Exams start next week.",
            category="ACADEMIC",
            priority="HIGH",
            created_by_admin_id="admin-123",
            sender_name="testadmin"
        )

        self.assertTrue(res["success"])
        self.assertEqual(res["recipients"], 1)
        # Verify DB query semester parameter matches as integer
        query_arg = self.mock_profiles_col.find.call_args[0][0]
        self.assertEqual(query_arg["semester"], 6)

    def test_broadcast_individual(self):
        """Test broadcasting to an individual lookup users by username/email"""
        stud_id = ObjectId()
        self.mock_users_col.find_one.return_value = {"_id": stud_id, "username": "student1"}

        res = self.service.broadcast_notification(
            target_type="INDIVIDUAL",
            target_value="student1",
            title="Individual Warning",
            message="Please submit library books.",
            category="SYSTEM",
            priority="LOW",
            created_by_admin_id="admin-123",
            sender_name="testadmin"
        )

        self.assertTrue(res["success"])
        self.assertEqual(res["recipients"], 1)
        self.mock_users_col.find_one.assert_called_once()

    def test_broadcast_zero_matching_recipients(self):
        """Test that broadcasting with zero matched students raises validation error and returns HTTP 400"""
        self.mock_profiles_col.find.return_value = []

        with self.assertRaises(NotificationValidationError):
            self.service.broadcast_notification(
                target_type="ALL",
                target_value="",
                title="All Campus Alert",
                message="Body",
                category="GENERAL",
                priority="HIGH",
                created_by_admin_id="admin-123",
                sender_name="testadmin"
            )

        # Confirm HTTP 400 from endpoint
        res = self.client.post('/api/admin/notifications', headers=self.admin_headers, json={
            "target_type": "ALL",
            "target_value": "",
            "title": "Alert",
            "message": "Body",
            "category": "GENERAL",
            "priority": "HIGH"
        })
        self.assertEqual(res.status_code, 400)
        self.assertIn("No matching recipients found.", json.loads(res.data)["error"])

    def test_successive_broadcasts_unique_ids(self):
        """Verify consecutive broadcasts generate unique string broadcast_id values"""
        stud_id = ObjectId()
        self.mock_profiles_col.find.return_value = [{"user_id": stud_id}]

        res1 = self.service.broadcast_notification("ALL", "", "Title 1", "Message 1", "GENERAL", "LOW", "admin-123", "testadmin")
        res2 = self.service.broadcast_notification("ALL", "", "Title 2", "Message 2", "GENERAL", "LOW", "admin-123", "testadmin")

        self.assertNotEqual(res1["broadcast_id"], res2["broadcast_id"])
        self.assertIsInstance(res1["broadcast_id"], str)
        self.assertIsInstance(res2["broadcast_id"], str)

    def test_validation_failure_creates_zero_notifications(self):
        """Verify invalid payload validation fails and leaves the store completely empty"""
        # Empty Title
        with self.assertRaises(NotificationValidationError):
            self.service.broadcast_notification("ALL", "", "", "Message", "GENERAL", "LOW", "admin-123", "testadmin")
        
        # Invalid Category
        with self.assertRaises(NotificationValidationError):
            self.service.broadcast_notification("ALL", "", "Title", "Message", "INVALID_CAT", "LOW", "admin-123", "testadmin")

        # Verify nothing was added
        stats = self.service.get_notification_stats()
        self.assertEqual(stats["total_notifications"], 0)

    def test_atomic_rollback(self):
        """Verify failure during fan-out loops triggers rollback leaving zero records"""
        stud1_id = ObjectId()
        stud2_id = ObjectId()
        self.mock_profiles_col.find.return_value = [{"user_id": stud1_id}, {"user_id": stud2_id}]

        # Mock the store add method to fail on the second addition
        original_add = self.store.add
        add_calls = 0

        def failing_add(notification):
            nonlocal add_calls
            add_calls += 1
            if add_calls > 1:
                raise RuntimeError("Simulated connection failure during fan-out")
            original_add(notification)

        with patch.object(self.store, 'add', side_effect=failing_add):
            with self.assertRaises(RuntimeError):
                self.service.broadcast_notification("ALL", "", "Title", "Message", "GENERAL", "LOW", "admin-123", "testadmin")

        # Verify rollback wiped first inserted notification: total fanned out count in store must be 0
        stats = self.service.get_notification_stats()
        self.assertEqual(stats["total_notifications"], 0)

    def test_delete_broadcast(self):
        """Verify delete_notification deletes all fanned-out peers and returns deleted count"""
        stud1_id = ObjectId()
        stud2_id = ObjectId()
        self.mock_profiles_col.find.return_value = [{"user_id": stud1_id}, {"user_id": stud2_id}]

        # Create broadcast of 2 recipients
        res = self.service.broadcast_notification("ALL", "", "Title", "Message", "GENERAL", "LOW", "admin-123", "testadmin")
        self.assertEqual(self.service.get_notification_stats()["total_notifications"], 2)

        # Delete by broadcast_id
        deleted = self.service.delete_notification(res["broadcast_id"])
        self.assertEqual(deleted, 2)
        self.assertEqual(self.service.get_notification_stats()["total_notifications"], 0)

    def test_list_notifications_consolidated_and_stable_sorted(self):
        """Verify listings consolidates by broadcast_id and applies stable sorting and range validations"""
        stud1_id = ObjectId()
        stud2_id = ObjectId()
        self.mock_profiles_col.find.return_value = [{"user_id": stud1_id}, {"user_id": stud2_id}]

        # 1. Send broadcast (Title B)
        self.service.broadcast_notification("ALL", "", "Title B", "Message B", "GENERAL", "LOW", "admin-123", "testadmin")
        # 2. Send broadcast (Title A)
        self.service.broadcast_notification("ALL", "", "Title A", "Message A", "GENERAL", "LOW", "admin-123", "testadmin")

        # Test listing
        res = self.service.list_notifications(page=1, page_size=10)
        self.assertEqual(res["pagination"]["total"], 2) # Consolidated into 2 rows, not 4!
        
        # Newest first sorting makes Title A first (if sent second, timestamp is greater)
        self.assertEqual(res["notifications"][0]["title"], "Title A")
        self.assertEqual(res["notifications"][1]["title"], "Title B")

        # Invalid pagination ranges
        with self.assertRaises(NotificationValidationError):
            self.service.list_notifications(page=0)
        with self.assertRaises(NotificationValidationError):
            self.service.list_notifications(page_size=101)

    def test_rbac_enforcement(self):
        """Verify student JWTs cannot access administrative endpoints returning 403"""
        res = self.client.get('/api/admin/notifications', headers=self.student_headers)
        self.assertEqual(res.status_code, 403)

        res2 = self.client.post('/api/admin/notifications', headers=self.student_headers, json={})
        self.assertEqual(res2.status_code, 403)

        res3 = self.client.delete('/api/admin/notifications/broadcast-123', headers=self.student_headers)
        self.assertEqual(res3.status_code, 403)
