import sys
import os
import unittest
import json
import jwt
import time
import datetime
from unittest.mock import MagicMock, patch
from flask import Flask, jsonify
from bson import ObjectId

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../..')))

from config.config import Config
from services.notifications.memory_notification_store import MemoryNotificationStore
from services.analytics.admin_analytics_service import AdminAnalyticsService
from routes.admin_analytics_routes import create_admin_analytics_routes
from services.admin_auth import MemoryAdminStore, AdminAuthService
from services.admin_auth.admin_models import Admin

class TestAdminAnalyticsDashboard(unittest.TestCase):

    def setUp(self):
        # 1. Setup mock collections
        self.mock_users_col = MagicMock()
        self.mock_profiles_col = MagicMock()
        self.mock_pdfs_col = MagicMock()
        self.mock_chat_col = MagicMock()

        # 2. Patch DB get_collection
        self.db_patcher = patch('config.database.Database.get_collection')
        self.mock_get_collection = self.db_patcher.start()
        
        def collection_selector(name):
            if name == "users":
                return self.mock_users_col
            elif name == "profiles":
                return self.mock_profiles_col
            elif name == "pdfs":
                return self.mock_pdfs_col
            elif name == "chat_history":
                return self.mock_chat_col
            return MagicMock()
            
        self.mock_get_collection.side_effect = collection_selector

        # 3. Setup stores and services
        self.notif_store = MemoryNotificationStore()
        self.analytics_service = AdminAnalyticsService(self.notif_store)

        # 4. Setup Flask Application
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test-secret-key'
        self.app.config['ADMIN_ANALYTICS_SERVICE'] = self.analytics_service

        self.admin_store = MemoryAdminStore()
        self.admin_auth_service = AdminAuthService(self.admin_store, self.app)
        self.admin_record = self.admin_store.create_admin(
            Admin(id="admin-123", username="testadmin", email="testadmin@campusassist.ai", password_hash="hash", role="ADMIN", is_active=True)
        )
        self.app.config['ADMIN_AUTH_SERVICE'] = self.admin_auth_service

        # Register analytics blueprint
        self.app.register_blueprint(create_admin_analytics_routes(), url_prefix='/api/admin/analytics')
        self.client = self.app.test_client()

        # Clear global_memory_store to prevent state leakage from other tests
        from services.analytics.memory_store import global_memory_store
        with global_memory_store._lock:
            global_memory_store._db.clear()

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

    def test_dashboard_summary_success(self):
        """Test that the dashboard fetches aggregates from databases and matches structure"""
        # Mock database responses
        self.mock_users_col.count_documents.return_value = 5
        self.mock_pdfs_col.count_documents.return_value = 10
        self.mock_chat_col.count_documents.return_value = 15
        
        self.mock_profiles_col.find.return_value = [
            {"department": "CSE"}, {"department": "cse "}, {"department": "ECE"}
        ]
        self.mock_pdfs_col.find.return_value = [
            {"filename": "a.pdf", "status": "READY"},
            {"filename": "b.pdf", "status": "INDEXING"},
            {"filename": "c.pdf", "status": "FAILED"}
        ]
        self.mock_chat_col.find.return_value = [
            {"question": "What is normal form?"},
            {"question": "Resume advice?"}
        ]

        response = self.client.get('/api/admin/analytics/dashboard', headers=self.admin_headers)
        self.assertEqual(response.status_code, 200)
        
        res_data = json.loads(response.data.decode('utf-8'))
        self.assertIn("summary", res_data)
        self.assertEqual(res_data["summary"]["students"], 5)
        self.assertEqual(res_data["summary"]["documents"], 10)
        self.assertEqual(res_data["summary"]["questions"], 15)

        # Check department distribution ordering (CSE count: 2, ECE count: 1)
        self.assertEqual(len(res_data["departments"]), 2)
        self.assertEqual(res_data["departments"][0]["department"], "CSE")
        self.assertEqual(res_data["departments"][0]["count"], 2)
        self.assertEqual(res_data["departments"][1]["department"], "ECE")
        self.assertEqual(res_data["departments"][1]["count"], 1)

        # Check question intent categories parsed fallback
        self.assertEqual(res_data["questions_distribution"]["ACADEMIC"], 1)
        self.assertEqual(res_data["questions_distribution"]["PLACEMENT"], 1)

    def test_department_stats_stable_sorting(self):
        """Test that department counts are sorted by count DESC then department name ASC"""
        self.mock_profiles_col.find.return_value = [
            {"department": "ECE"},
            {"department": "CSE"},
            {"department": "CSE"},
            {"department": "ME"},
            {"department": "ME"},
            {"department": "Civil"},
            {"department": "Civil"},
            {"department": "Civil"},
        ]
        
        result = self.analytics_service._collect_department_stats()
        # Counts: Civil=3, CSE=2, ME=2, ECE=1
        # Order should be: Civil (3), CSE (2), ME (2), ECE (1)
        self.assertEqual(result[0]["department"], "CIVIL")
        self.assertEqual(result[0]["count"], 3)
        self.assertEqual(result[1]["department"], "CSE")
        self.assertEqual(result[1]["count"], 2)
        self.assertEqual(result[2]["department"], "ME")
        self.assertEqual(result[2]["count"], 2)
        self.assertEqual(result[3]["department"], "ECE")
        self.assertEqual(result[3]["count"], 1)

    def test_cache_lifecycle(self):
        """Verify that cache retains generated snapshot, and gets updated with invalidations/refreshes"""
        self.mock_users_col.count_documents.return_value = 1
        self.mock_pdfs_col.count_documents.return_value = 1
        self.mock_chat_col.count_documents.return_value = 1
        self.mock_profiles_col.find.return_value = []
        self.mock_pdfs_col.find.return_value = []
        self.mock_chat_col.find.return_value = []

        # First request (sets cache)
        resp1 = self.client.get('/api/admin/analytics/dashboard', headers=self.admin_headers)
        data1 = json.loads(resp1.data.decode('utf-8'))
        time1 = data1["generated_at"]
        self.assertFalse(data1["cache"]["cached"])

        # Second request (within 60s, returns cached copy)
        resp2 = self.client.get('/api/admin/analytics/dashboard', headers=self.admin_headers)
        data2 = json.loads(resp2.data.decode('utf-8'))
        time2 = data2["generated_at"]
        self.assertTrue(data2["cache"]["cached"])
        self.assertEqual(time1, time2)

        # Force refresh parameter (invalidates cache)
        resp3 = self.client.get('/api/admin/analytics/dashboard?refresh=true', headers=self.admin_headers)
        data3 = json.loads(resp3.data.decode('utf-8'))
        time3 = data3["generated_at"]
        self.assertFalse(data3["cache"]["cached"])
        self.assertNotEqual(time1, time3)

        # Invalidate cache manual call
        self.analytics_service.invalidate_cache()
        resp4 = self.client.get('/api/admin/analytics/dashboard', headers=self.admin_headers)
        data4 = json.loads(resp4.data.decode('utf-8'))
        time4 = data4["generated_at"]
        self.assertFalse(data4["cache"]["cached"])
        self.assertNotEqual(time3, time4)

    def test_error_resiliency(self):
        """Test that if a single aggregator fails, it logs to errors and other panels render normally"""
        self.mock_users_col.count_documents.return_value = 5
        self.mock_pdfs_col.count_documents.return_value = 10
        self.mock_chat_col.count_documents.return_value = 15
        
        # Make profile collection throw a database exception
        self.mock_profiles_col.find.side_effect = Exception("MongoDB connection timeout")
        self.mock_pdfs_col.find.return_value = []
        self.mock_chat_col.find.return_value = []

        response = self.client.get('/api/admin/analytics/dashboard', headers=self.admin_headers)
        self.assertEqual(response.status_code, 200)

        res_data = json.loads(response.data.decode('utf-8'))
        self.assertEqual(res_data["departments"], [])
        self.assertIn("departments", res_data["errors"])
        self.assertEqual(res_data["errors"]["departments"]["code"], "DEPARTMENT_STATS_UNAVAILABLE")
        self.assertEqual(res_data["summary"]["students"], 5)

    def test_rbac_protection(self):
        """Verify that non-admin requests receive HTTP 403 Forbidden"""
        # Test student token
        resp1 = self.client.get('/api/admin/analytics/dashboard', headers=self.student_headers)
        self.assertEqual(resp1.status_code, 403)

        # Test anonymous request
        resp2 = self.client.get('/api/admin/analytics/dashboard')
        self.assertEqual(resp2.status_code, 401)

if __name__ == '__main__':
    unittest.main()
