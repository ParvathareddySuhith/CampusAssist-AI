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
from services.admin_document_service import AdminDocumentService
from routes.admin_document_routes import create_admin_document_routes
from services.admin_auth import MemoryAdminStore, AdminAuthService
from services.admin_auth.admin_models import Admin

class TestAdminDocumentService(unittest.TestCase):

    def setUp(self):
        # 1. Setup mock collections
        self.mock_pdfs_col = MagicMock()

        # 2. Patch DB get_collection
        self.db_patcher = patch('config.database.Database.get_collection')
        self.mock_get_collection = self.db_patcher.start()
        self.mock_get_collection.side_effect = lambda name: self.mock_pdfs_col if name == "pdfs" else MagicMock()

        # 3. Setup services
        self.service = AdminDocumentService()

        # 4. Setup Flask Application
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = 'test-secret-key'
        self.app.config['ADMIN_DOCUMENT_SERVICE'] = self.service

        # Mock Admin Analytics Service for cache invalidation checks
        self.mock_analytics_service = MagicMock()
        self.app.config['ADMIN_ANALYTICS_SERVICE'] = self.mock_analytics_service

        self.admin_store = MemoryAdminStore()
        self.admin_auth_service = AdminAuthService(self.admin_store, self.app)
        self.admin_record = self.admin_store.create_admin(
            Admin(id="admin-123", username="testadmin", email="testadmin@campusassist.ai", password_hash="hash", role="ADMIN", is_active=True)
        )
        self.app.config['ADMIN_AUTH_SERVICE'] = self.admin_auth_service

        # Register blueprint
        self.app.register_blueprint(create_admin_document_routes())
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

    def test_list_documents_pagination(self):
        """Test paginated retrieval and mapping of document configurations"""
        self.mock_pdfs_col.count_documents.return_value = 25
        
        # Mock cursor returned by find().sort().skip().limit()
        mock_cursor = [
            {
                "public_id": "doc1",
                "filename": "A.pdf",
                "url": "http://a.pdf",
                "department": "CSE",
                "semester": 1,
                "subject": "Math",
                "academic_year": 2026,
                "status": "READY",
                "size": 1024,
                "uploaded_at": datetime.datetime(2026, 7, 16, 12, 0, 0, tzinfo=datetime.timezone.utc)
            }
        ]
        
        # Mock chained calls: find().sort().skip().limit()
        mock_find = self.mock_pdfs_col.find
        mock_sort = mock_find.return_value.sort
        mock_skip = mock_sort.return_value.skip
        mock_limit = mock_skip.return_value.limit
        mock_limit.return_value = mock_cursor

        result = self.service.list_documents(page=1, page_size=20)
        self.assertEqual(result["pagination"]["total"], 25)
        self.assertEqual(result["pagination"]["pages"], 2)
        self.assertEqual(len(result["documents"]), 1)
        self.assertEqual(result["documents"][0]["public_id"], "doc1")
        self.assertEqual(result["documents"][0]["status"], "READY")

    def test_get_document_stats(self):
        """Test aggregate document status counts"""
        self.mock_pdfs_col.count_documents.side_effect = lambda q: {
            # Total call (empty query)
            str({}): 10,
            # Processing call
            str({"status": {"$in": ["INDEXING", "PROCESSING"]}}): 2,
            # Failed call
            str({"status": "FAILED"}): 1
        }.get(str(q), 0)

        result = self.service.get_document_stats()
        self.assertEqual(result["total"], 10)
        self.assertEqual(result["processing"], 2)
        self.assertEqual(result["failed"], 1)
        self.assertEqual(result["indexed"], 7)

    def test_list_documents_filtering(self):
        """Test search and status filter queries forwarding to MongoDB"""
        self.mock_pdfs_col.count_documents.return_value = 1
        self.mock_pdfs_col.find.return_value.sort.return_value.skip.return_value.limit.return_value = []

        # 1. Test search query
        self.service.list_documents(search="OS")
        expected_query_search = {"filename": {"$regex": "OS", "$options": "i"}}
        self.mock_pdfs_col.count_documents.assert_any_call(expected_query_search)

        # 2. Test status query (READY)
        self.service.list_documents(status="READY")
        expected_query_ready = {"status": {"$in": ["READY", "INDEXED", None]}}
        self.mock_pdfs_col.count_documents.assert_any_call(expected_query_ready)

        # 3. Test status query (INDEXING)
        self.service.list_documents(status="INDEXING")
        expected_query_indexing = {"status": {"$in": ["INDEXING", "PROCESSING"]}}
        self.mock_pdfs_col.count_documents.assert_any_call(expected_query_indexing)

    def test_get_document(self):
        """Test retrieving detailed metadata for a single document"""
        # 1. Document exists
        self.mock_pdfs_col.find_one.return_value = {
            "public_id": "doc1",
            "filename": "A.pdf",
            "url": "http://a.pdf",
            "department": "CSE",
            "status": "READY",
            "size": 1024,
            "uploaded_at": datetime.datetime(2026, 7, 16, 12, 0, 0, tzinfo=datetime.timezone.utc),
            "chunks": 50,
            "embedding_model": "test-model"
        }
        res = self.service.get_document("doc1")
        self.assertIsNotNone(res)
        self.assertEqual(res["id"], "doc1")
        self.assertEqual(res["chunks"], 50)
        self.assertEqual(res["embedding_model"], "test-model")

        # 2. Document does not exist
        self.mock_pdfs_col.find_one.return_value = None
        res_none = self.service.get_document("doc2")
        self.assertIsNull = self.assertIsNone(res_none)

    @patch('services.cloudinary_service.CloudinaryService.delete_pdf')
    def test_delete_document(self, mock_cloud_delete):
        """Test document delete removes MongoDB doc, cloud storage, and vectors"""
        self.mock_pdfs_col.find_one.return_value = {"public_id": "doc1"}
        
        with patch('flask.current_app', self.app):
            res = self.service.delete_document("doc1")
            self.assertTrue(res["success"])
            self.mock_pdfs_col.delete_one.assert_called_with({"public_id": "doc1"})
            mock_cloud_delete.assert_called_with("doc1")
            self.mock_analytics_service.invalidate_cache.assert_called()

    def test_retry_index(self):
        """Test retry sets status to INDEXING and invalidates cache"""
        self.mock_pdfs_col.find_one.return_value = {"public_id": "doc1"}

        with patch('flask.current_app', self.app):
            res = self.service.retry_index("doc1")
            self.assertTrue(res["success"])
            self.assertEqual(res["status"], "INDEXING")
            self.mock_pdfs_col.update_one.assert_called_with(
                {"public_id": "doc1"},
                {"$set": {"status": "INDEXING"}}
            )
            self.mock_analytics_service.invalidate_cache.assert_called()

    def test_routes_endpoints(self):
        """Test API endpoints authorization and status returns"""
        # Set up mock details
        self.mock_pdfs_col.count_documents.return_value = 5
        self.mock_pdfs_col.find_one.return_value = {
            "public_id": "doc1",
            "filename": "A.pdf",
            "url": "http://a.pdf",
            "department": "CSE",
            "status": "READY",
            "size": 1024,
            "uploaded_at": datetime.datetime(2026, 7, 16, 12, 0, 0, tzinfo=datetime.timezone.utc),
            "chunks": 50,
            "embedding_model": "test-model"
        }

        # 1. Detail endpoint GET
        resp = self.client.get('/api/admin/documents/doc1', headers=self.admin_headers)
        self.assertEqual(resp.status_code, 200)
        res_data = json.loads(resp.data.decode('utf-8'))
        self.assertEqual(res_data["id"], "doc1")

        # 2. Retry endpoint POST
        resp_retry = self.client.post('/api/admin/documents/doc1/retry', headers=self.admin_headers)
        self.assertEqual(resp_retry.status_code, 200)

        # 3. RBAC checks on details
        resp_student = self.client.get('/api/admin/documents/doc1', headers=self.student_headers)
        self.assertEqual(resp_student.status_code, 403)

        resp_anon = self.client.get('/api/admin/documents/doc1')
        self.assertEqual(resp_anon.status_code, 401)

if __name__ == '__main__':
    unittest.main()
