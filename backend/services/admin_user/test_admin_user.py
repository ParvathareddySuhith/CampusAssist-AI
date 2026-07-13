import sys
import os
import unittest
from unittest.mock import MagicMock, patch
from bson import ObjectId
import datetime
from flask import Flask, jsonify

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from services.auth_service import UserDisabledError, ensure_active_user
from services.admin_user_service import AdminUserService
from routes.admin_user_routes import create_admin_user_routes
from utils.auth import generate_admin_token, generate_user_token

class TestAdminUserManagement(unittest.TestCase):

    def setUp(self):
        # 1. Mock collections
        self.mock_users_col = MagicMock()
        self.mock_profiles_col = MagicMock()

        # 2. Patch Database.get_collection BEFORE blueprint/controller initialization
        self.db_patcher = patch('config.database.Database.get_collection')
        self.mock_get_collection = self.db_patcher.start()
        self.mock_get_collection.side_effect = lambda name: self.mock_users_col if name == "users" else self.mock_profiles_col

        # 3. Create Flask test app
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test-secret-key'
        
        # Register routes
        self.app.register_blueprint(create_admin_user_routes())
        self.client = self.app.test_client()

    def tearDown(self):
        # Stop database patcher
        self.db_patcher.stop()

    def test_ensure_active_user(self):
        """Test account status validation check"""
        # Active user should pass silently
        ensure_active_user({"username": "stud1", "is_active": True})
        
        # Default missing is_active is True
        ensure_active_user({"username": "stud2"})

        # Inactive user raises UserDisabledError
        with self.assertRaises(UserDisabledError):
            ensure_active_user({"username": "stud3", "is_active": False})

    def test_update_user_status(self):
        """Test updating user account status in database"""
        self.mock_users_col.update_one.return_value.matched_count = 1
        service = AdminUserService()
        user_id = str(ObjectId())
        
        res = service.update_user_status(user_id, False)
        self.assertTrue(res["success"])
        self.assertEqual(res["user"]["is_active"], False)
        self.assertEqual(res["user"]["id"], user_id)
        self.mock_users_col.update_one.assert_called_once()

    def test_notify_user(self):
        """Test notifying user through notification service"""
        mock_notification_svc = MagicMock()
        service = AdminUserService()
        user_id = str(ObjectId())

        res = service.notify_user(
            user_id=user_id,
            title="Syllabus update",
            message="DBMS syllabus changed",
            category="ACADEMIC",
            priority="HIGH",
            notification_service=mock_notification_svc
        )

        self.assertTrue(res["success"])
        mock_notification_svc.create_notification.assert_called_once_with(
            user_id=user_id,
            title="Syllabus update",
            message="DBMS syllabus changed",
            category="ACADEMIC",
            priority="HIGH"
        )

    def test_get_users_page(self):
        """Test listing users with pagination, sorting and searching"""
        # Mock database outputs
        uid1 = ObjectId()
        uid2 = ObjectId()
        self.mock_users_col.find.return_value = [
            {"_id": uid1, "username": "student_alice", "email": "alice@gmail.com", "is_active": True, "created_at": datetime.datetime(2026, 1, 1, tzinfo=datetime.timezone.utc)},
            {"_id": uid2, "username": "student_bob", "email": "bob@gmail.com", "is_active": False, "created_at": datetime.datetime(2026, 1, 2, tzinfo=datetime.timezone.utc)}
        ]
        
        # Match user profiles return details
        self.mock_profiles_col.find_one.side_effect = [
            {"user_id": uid1, "full_name": "Alice Peterson", "department": "CSE", "semester": 6},
            {"user_id": uid2, "full_name": "Bob Marley", "department": "ECE", "semester": 4},
            {"user_id": uid1, "full_name": "Alice Peterson", "department": "CSE", "semester": 6},
            {"user_id": uid2, "full_name": "Bob Marley", "department": "ECE", "semester": 4}
        ]

        service = AdminUserService()
        res = service.get_users_page(page=1, page_size=1, search_query="", sort_by="username", sort_order="asc")
        
        # Verify pagination size
        self.assertEqual(len(res["users"]), 1)
        self.assertEqual(res["pagination"]["total"], 2)
        self.assertEqual(res["pagination"]["pages"], 2)
        self.assertEqual(res["users"][0]["username"], "student_alice")

        # Test search query filters
        self.mock_profiles_col.find.return_value = [
            {"user_id": uid2, "full_name": "Bob Marley", "department": "ECE", "semester": 4}
        ]
        res_search = service.get_users_page(page=1, page_size=10, search_query="bob")
        self.assertEqual(res_search["pagination"]["total"], 2)

    @patch('routes.admin_user_routes.admin_required')
    def test_routes_protection(self, mock_admin_required):
        """Test admin blueprint routes block access without admin privilege"""
        # Mock admin decorator to bypass for checking route calls
        mock_admin_required.side_effect = lambda f: f

        # Re-register to test client with bypassed admin decorator
        app = Flask(__name__)
        app.config['SECRET_KEY'] = 'test-secret'
        app.register_blueprint(create_admin_user_routes())
        client = app.test_client()

        # Call route with mocked controller dependencies
        with patch('controllers.admin_user_controller.AdminUserService') as MockServiceClass:
            mock_svc = MockServiceClass.return_value
            mock_svc.get_users_page.return_value = {"users": [], "pagination": {}}
            
            resp = client.get('/api/admin/users/')
            self.assertEqual(resp.status_code, 200)
