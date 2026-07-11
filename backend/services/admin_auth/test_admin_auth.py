import unittest
import json
import jwt
import threading
import time
from datetime import datetime, timezone
from flask import Flask
from flask_bcrypt import Bcrypt

from config.config import Config
from services.admin_auth import (
    Admin,
    MemoryAdminStore,
    AdminAuthService,
    ROLE_ADMIN,
    ROLE_STUDENT,
    ROLE_SUPER_ADMIN,
    AdminNotFoundError,
    AdminInvalidCredentialsError,
    AdminInactiveError
)
from routes.admin_auth_routes import create_admin_auth_routes

class TestAdminAuth(unittest.TestCase):
    
    def setUp(self):
        # Set up store, bcrypt and service
        self.store = MemoryAdminStore()
        self.app = Flask(__name__)
        self.app.config['SECRET_KEY'] = Config.SECRET_KEY
        self.bcrypt = Bcrypt(self.app)
        
        self.service = AdminAuthService(self.store, self.bcrypt)
        self.app.config['ADMIN_AUTH_SERVICE'] = self.service
        
        # Register admin auth blueprints
        self.app.register_blueprint(create_admin_auth_routes())
        self.client = self.app.test_client()
        
        # Seeding configuration
        self.default_username = "testadmin"
        self.default_email = "testadmin@campusassist.ai"
        self.default_password = "SecurePassword123"

        # Create default admin for tests
        self.admin_record = self.service.create_default_admin(
            self.default_username,
            self.default_email,
            self.default_password
        )

    def test_default_admin_creation(self):
        """Verify default admin seeding is successful and correctly sets fields"""
        self.assertIsNotNone(self.admin_record)
        self.assertEqual(self.admin_record.username, self.default_username)
        self.assertEqual(self.admin_record.email, self.default_email)
        self.assertEqual(self.admin_record.role, ROLE_ADMIN)
        self.assertTrue(self.admin_record.is_active)
        self.assertIsNone(self.admin_record.last_login)
        self.assertNotEqual(self.admin_record.password_hash, self.default_password) # Hashed

    def test_default_admin_idempotency(self):
        """Verify seeding the default administrator is fully idempotent and does not duplicate"""
        second_attempt = self.service.create_default_admin(
            self.default_username,
            self.default_email,
            "anotherpassword"
        )
        self.assertEqual(self.admin_record.id, second_attempt.id)
        
        # Verify store has only one record by email
        result = self.store.get_by_email(self.default_email)
        self.assertEqual(result.id, self.admin_record.id)

    def test_login_success(self):
        """Verify successful credentials return a valid JWT token and details without exposing password hash"""
        res = self.service.login(self.default_username, self.default_password)
        self.assertIn("token", res)
        self.assertIn("admin", res)
        
        admin_dict = res["admin"]
        self.assertEqual(admin_dict["username"], self.default_username)
        self.assertEqual(admin_dict["role"], ROLE_ADMIN)
        self.assertNotIn("password", admin_dict)
        self.assertNotIn("password_hash", admin_dict)

        # Decode token and check payload claims
        token = res["token"]
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        self.assertEqual(payload["user_id"], self.admin_record.id)
        self.assertEqual(payload["role"], ROLE_ADMIN)

    def test_login_success_by_email(self):
        """Verify login succeeds when using email instead of username"""
        res = self.service.login(self.default_email, self.default_password)
        self.assertIsNotNone(res.get("token"))

    def test_login_failures(self):
        """Verify login fails with wrong credentials or missing fields"""
        # Invalid password
        with self.assertRaises(AdminInvalidCredentialsError):
            self.service.login(self.default_username, "WrongPassword")

        # Non-existent username
        with self.assertRaises(AdminNotFoundError):
            self.service.login("fakeusername", self.default_password)

        # Inactive Admin
        inactive_admin = Admin(
            username="inactiveadmin",
            email="inactive@campusassist.ai",
            password_hash=self.bcrypt.generate_password_hash("pass").decode("utf-8"),
            is_active=False
        )
        self.store.create_admin(inactive_admin)
        with self.assertRaises(AdminInactiveError):
            self.service.login("inactiveadmin", "pass")

    def test_verify_admin_status(self):
        """Verify verify_admin method works correctly for active and inactive/missing admins"""
        verified = self.service.verify_admin(self.admin_record.id)
        self.assertEqual(verified.username, self.default_username)

        with self.assertRaises(AdminNotFoundError):
            self.service.verify_admin("nonexistent-uuid")

    def test_logout_endpoint_and_me_protected_route(self):
        """Verify /me and logout route access control behaviors"""
        # Login to get valid admin token
        login_res = self.client.post('/login', json={
            "username": self.default_username,
            "password": self.default_password
        })
        self.assertEqual(login_res.status_code, 200)
        data = json.loads(login_res.data)
        admin_token = data["token"]

        # Access profile /me route with valid admin token
        headers = {"Authorization": f"Bearer {admin_token}"}
        me_res = self.client.get('/me', headers=headers)
        self.assertEqual(me_res.status_code, 200)
        me_data = json.loads(me_res.data)
        self.assertEqual(me_data["username"], self.default_username)
        self.assertEqual(me_data["role"], ROLE_ADMIN)
        self.assertTrue(me_data["is_active"])

        # Access profile /me with student role token -> expected 403 Forbidden
        student_token = jwt.encode(
            {"user_id": "student123", "role": ROLE_STUDENT},
            Config.SECRET_KEY,
            algorithm="HS256"
        )
        student_headers = {"Authorization": f"Bearer {student_token}"}
        me_res_student = self.client.get('/me', headers=student_headers)
        self.assertEqual(me_res_student.status_code, 403)

        # Access profile /me without token -> expected 401 Unauthorized
        me_res_unauth = self.client.get('/me')
        self.assertEqual(me_res_unauth.status_code, 401)

        # Access logout endpoint with admin token
        logout_res = self.client.post('/logout', headers=headers)
        self.assertEqual(logout_res.status_code, 200)

        # Access logout without token -> expected 401
        logout_res_unauth = self.client.post('/logout')
        self.assertEqual(logout_res_unauth.status_code, 401)

    def test_store_deep_copy_protection(self):
        """Verify the memory store isolates internal references and protects against direct mutations"""
        admin = self.store.get_by_id(self.admin_record.id)
        admin.username = "mutated_username" # Try to mutate the returned copy

        # Retrieve again, original should remain unaffected
        admin_second = self.store.get_by_id(self.admin_record.id)
        self.assertEqual(admin_second.username, self.default_username)

    def test_store_thread_safety_concurrency(self):
        """Verify the store handles concurrent read/write operations without race conditions"""
        num_threads = 10
        errors = []

        def worker(thread_idx):
            try:
                # Concurrent writes
                new_admin = Admin(
                    username=f"user_{thread_idx}",
                    email=f"user_{thread_idx}@campusassist.ai",
                    password_hash="hash"
                )
                self.store.create_admin(new_admin)
                
                # Concurrent reads
                fetched = self.store.get_by_username(f"user_{thread_idx}")
                if not fetched or fetched.username != f"user_{thread_idx}":
                    errors.append(f"Verification failed on thread {thread_idx}")
            except Exception as e:
                errors.append(str(e))

        threads = [threading.Thread(target=worker, args=(i,)) for i in range(num_threads)]
        for t in threads:
            t.start()
        for t in threads:
            t.join()

        self.assertEqual(len(errors), 0, f"Concurrent store errors encountered: {errors}")
