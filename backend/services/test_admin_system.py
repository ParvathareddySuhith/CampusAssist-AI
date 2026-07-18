import sys
import os
import unittest
import json
import jwt
from unittest.mock import MagicMock, patch
from flask import Flask

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from config.config import Config
from services.admin_system_service import AdminSystemService
from routes.admin_system_routes import create_admin_system_routes
from services.admin_auth import MemoryAdminStore, AdminAuthService
from services.admin_auth.admin_models import Admin
from config.database import db_instance

class TestAdminSystemService(unittest.TestCase):

    def setUp(self):
        # 1. Setup mock collections
        self.mock_pdfs_col = MagicMock()
        self.mock_users_col = MagicMock()
        self.mock_chat_history_col = MagicMock()
        self.mock_notifications_col = MagicMock()

        # Set default values to prevent MagicMocks from leaking into JSON serialization
        self.mock_pdfs_col.count_documents.return_value = 0
        self.mock_users_col.count_documents.return_value = 0
        self.mock_chat_history_col.count_documents.return_value = 0
        self.mock_notifications_col.count_documents.return_value = 0
        self.mock_chat_history_col.distinct.return_value = []
        self.mock_pdfs_col.find.return_value = []

        # 2. Patch DB get_collection
        self.db_patcher = patch('config.database.Database.get_collection')
        self.mock_get_collection = self.db_patcher.start()
        self.mock_get_collection.side_effect = self._get_mock_collection

        # Mock db_instance.db command for health pings
        self.mock_db = MagicMock()
        self.original_db = db_instance.db
        db_instance.db = self.mock_db
        self.mock_db.command.return_value = {"ok": 1}

        # 3. Setup service
        self.service = AdminSystemService()

        # 4. Setup Flask Application
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test-secret-key'
        self.app.config['ADMIN_SYSTEM_SERVICE'] = self.service

        self.admin_store = MemoryAdminStore()
        self.admin_auth_service = AdminAuthService(self.admin_store, self.app)
        self.admin_record = self.admin_store.create_admin(
            Admin(id="admin-123", username="testadmin", email="testadmin@campusassist.ai", password_hash="hash", role="ADMIN", is_active=True)
        )
        self.app.config['ADMIN_AUTH_SERVICE'] = self.admin_auth_service

        # Register blueprint
        self.app.register_blueprint(create_admin_system_routes())
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
        db_instance.db = self.original_db

    def _get_mock_collection(self, name):
        if name == "pdfs":
            return self.mock_pdfs_col
        elif name == "users":
            return self.mock_users_col
        elif name == "chat_history":
            return self.mock_chat_history_col
        elif name == "notifications":
            return self.mock_notifications_col
        return MagicMock()

    def test_get_system_health_healthy(self):
        """Test services health validation under a fully healthy, configured state"""
        with patch.object(Config, 'PINECONE_API_KEY', 'test-key'), \
             patch.object(Config, 'PINECONE_ENVIRONMENT', 'test-env'), \
             patch.object(Config, 'CLOUDINARY_CLOUD_NAME', 'test-cloud'), \
             patch.object(Config, 'CLOUDINARY_API_KEY', 'test-api-key'):
            
            res = self.service.get_system_health()
            self.assertEqual(len(res["services"]), 4)
            
            mongo_srv = next(s for s in res["services"] if s["name"] == "MongoDB")
            self.assertEqual(mongo_srv["status"], "healthy")
            self.assertIn("latency_ms", mongo_srv)

            pinecone_srv = next(s for s in res["services"] if s["name"] == "Pinecone")
            self.assertEqual(pinecone_srv["status"], "healthy")

            cloudinary_srv = next(s for s in res["services"] if s["name"] == "Cloudinary")
            self.assertEqual(cloudinary_srv["status"], "healthy")

    def test_get_system_health_degraded(self):
        """Test services health validation when credentials configuration is absent"""
        with patch.object(Config, 'PINECONE_API_KEY', None), \
             patch.object(Config, 'CLOUDINARY_CLOUD_NAME', None):
            
            res = self.service.get_system_health()
            
            pinecone_srv = next(s for s in res["services"] if s["name"] == "Pinecone")
            self.assertEqual(pinecone_srv["status"], "degraded")

            cloudinary_srv = next(s for s in res["services"] if s["name"] == "Cloudinary")
            self.assertEqual(cloudinary_srv["status"], "degraded")

    def test_get_system_metrics(self):
        """Test aggregate database statistics and storage calculation"""
        self.mock_pdfs_col.count_documents.return_value = 10
        self.mock_users_col.count_documents.return_value = 50
        self.mock_chat_history_col.distinct.return_value = ["u1", "u2"]
        self.mock_notifications_col.count_documents.return_value = 5

        # Mock find returned pdf docs with mixed numeric and string size structures
        self.mock_pdfs_col.find.return_value = [
            {"size": 1048576},        # 1 MB in bytes
            {"size": "2.5 MB"},        # 2.5 MB
            {"size": "512 KB"}         # 0.5 MB
        ]

        res = self.service.get_system_metrics()
        self.assertEqual(res["documents"], 10)
        self.assertEqual(res["users"], 50)
        self.assertEqual(res["conversations"], 2)
        self.assertEqual(res["notifications"], 5)
        self.assertEqual(res["storage_mb"], 4.0)  # 1.0 + 2.5 + 0.5
        self.assertIn("uptime", res)

    def test_routes_endpoints_and_rbac(self):
        """Test routing authentication and access levels"""
        # 1. GET health authorized
        resp = self.client.get('/api/admin/system/health', headers=self.admin_headers)
        self.assertEqual(resp.status_code, 200)

        # 2. GET metrics authorized
        resp_met = self.client.get('/api/admin/system/metrics', headers=self.admin_headers)
        self.assertEqual(resp_met.status_code, 200)

        # 3. Forbidden (student headers)
        resp_stud = self.client.get('/api/admin/system/health', headers=self.student_headers)
        self.assertEqual(resp_stud.status_code, 403)

        # 4. Unauthorized (no headers)
        resp_anon = self.client.get('/api/admin/system/health')
        self.assertEqual(resp_anon.status_code, 401)

if __name__ == '__main__':
    unittest.main()
