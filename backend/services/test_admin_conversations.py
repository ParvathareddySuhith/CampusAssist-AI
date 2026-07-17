import sys
import os
import unittest
import json
import jwt
import datetime
from unittest.mock import MagicMock, patch
from flask import Flask
from bson import ObjectId

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from config.config import Config
from services.admin_conversation_service import AdminConversationService
from routes.admin_conversation_routes import create_admin_conversation_routes
from services.admin_auth import MemoryAdminStore, AdminAuthService
from services.admin_auth.admin_models import Admin

class TestAdminConversationService(unittest.TestCase):

    def setUp(self):
        # 1. Setup mock collections
        self.mock_chat_history_col = MagicMock()
        self.mock_users_col = MagicMock()
        self.mock_profiles_col = MagicMock()
        
        # Set default safe return values for find_one to prevent MagicMock serialization errors
        self.mock_users_col.find_one.return_value = None
        self.mock_profiles_col.find_one.return_value = None

        # 2. Patch DB get_collection
        self.db_patcher = patch('config.database.Database.get_collection')
        self.mock_get_collection = self.db_patcher.start()
        self.mock_get_collection.side_effect = self._get_mock_collection

        # 3. Setup service
        self.service = AdminConversationService()

        # 4. Setup Flask Application
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test-secret-key'
        self.app.config['ADMIN_CONVERSATION_SERVICE'] = self.service

        self.admin_store = MemoryAdminStore()
        self.admin_auth_service = AdminAuthService(self.admin_store, self.app)
        self.admin_record = self.admin_store.create_admin(
            Admin(id="admin-123", username="testadmin", email="testadmin@campusassist.ai", password_hash="hash", role="ADMIN", is_active=True)
        )
        self.app.config['ADMIN_AUTH_SERVICE'] = self.admin_auth_service

        # Register blueprint
        self.app.register_blueprint(create_admin_conversation_routes())
        self.client = self.app.test_client()

        # Create JWT Tokens
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

    def _get_mock_collection(self, name):
        if name == "chat_history":
            return self.mock_chat_history_col
        elif name == "users":
            return self.mock_users_col
        elif name == "profiles":
            return self.mock_profiles_col
        return MagicMock()

    def test_list_conversations(self):
        """Test listing conversations with MongoDB aggregation output mapping"""
        user_id_1 = ObjectId()
        started_time = datetime.datetime(2026, 7, 17, 10, 0, 0, tzinfo=datetime.timezone.utc)
        
        # Mock aggregation pipeline output
        mock_agg_output = [
            {
                "_id": user_id_1,
                "username": "Alice",
                "email": "alice@gmail.com",
                "department": "CSE",
                "started": started_time,
                "last_message_at": started_time,
                "turns_count": 5
            }
        ]
        self.mock_chat_history_col.aggregate.return_value = mock_agg_output

        result = self.service.list_conversations(page=1, page_size=20, search="Alice", department="CSE")
        self.assertEqual(result["pagination"]["total"], 1)
        self.assertEqual(len(result["conversations"]), 1)
        
        conv = result["conversations"][0]
        self.assertEqual(conv["id"], str(user_id_1))
        self.assertEqual(conv["user"], "Alice")
        self.assertEqual(conv["department"], "CSE")
        self.assertEqual(conv["messages"], 10)  # turns * 2

    def test_get_conversation_details(self):
        """Test retrieving detailed chronological message logs for a single user"""
        user_id_1 = ObjectId()
        ts = datetime.datetime(2026, 7, 17, 10, 0, 0, tzinfo=datetime.timezone.utc)

        self.mock_users_col.find_one.return_value = {"_id": user_id_1, "username": "Alice"}
        self.mock_profiles_col.find_one.return_value = {"user_id": user_id_1, "department": "CSE"}
        
        # Mock chronological history cursor
        mock_cursor = MagicMock()
        mock_cursor.sort.return_value = [
            {
                "user_id": user_id_1,
                "question": "What is OS?",
                "answer": "Operating System.",
                "timestamp": ts
            }
        ]
        self.mock_chat_history_col.find.return_value = mock_cursor

        result = self.service.get_conversation(str(user_id_1))
        self.assertIsNotNone(result)
        self.assertEqual(result["user"], "Alice")
        self.assertEqual(result["department"], "CSE")
        self.assertEqual(len(result["messages"]), 2)
        self.assertEqual(result["messages"][0]["role"], "user")
        self.assertEqual(result["messages"][0]["content"], "What is OS?")
        self.assertEqual(result["messages"][1]["role"], "assistant")
        self.assertEqual(result["messages"][1]["content"], "Operating System.")

    def test_routes_endpoints_and_rbac(self):
        """Test endpoint access validation and RBAC checks"""
        user_id_1 = ObjectId()
        ts = datetime.datetime(2026, 7, 17, 10, 0, 0, tzinfo=datetime.timezone.utc)

        # Mock results
        self.mock_chat_history_col.aggregate.return_value = []
        self.mock_users_col.find_one.return_value = {"_id": user_id_1, "username": "Alice"}
        
        mock_cursor = MagicMock()
        mock_cursor.sort.return_value = []
        self.mock_chat_history_col.find.return_value = mock_cursor

        # 1. GET list authorized
        resp_list = self.client.get('/api/admin/conversations', headers=self.admin_headers)
        self.assertEqual(resp_list.status_code, 200)

        # 2. GET detail authorized
        resp_detail = self.client.get(f'/api/admin/conversations/{str(user_id_1)}', headers=self.admin_headers)
        self.assertEqual(resp_detail.status_code, 200)

        # 3. GET list forbidden (student role)
        resp_student = self.client.get('/api/admin/conversations', headers=self.student_headers)
        self.assertEqual(resp_student.status_code, 403)

        # 4. GET list unauthorized (anonymous request)
        resp_anon = self.client.get('/api/admin/conversations')
        self.assertEqual(resp_anon.status_code, 401)

if __name__ == '__main__':
    unittest.main()
