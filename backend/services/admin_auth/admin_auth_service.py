import datetime
from flask_bcrypt import Bcrypt
from typing import Optional, Dict, Any
from .admin_models import Admin, ROLE_ADMIN
from .admin_store import AdminStore
from .token_utils import generate_admin_token

class AdminAuthError(Exception):
    """Base exception for admin authentication errors"""
    pass

class AdminNotFoundError(AdminAuthError):
    """Raised when an administrator is not found"""
    pass

class AdminInvalidCredentialsError(AdminAuthError):
    """Raised when password verification fails"""
    pass

class AdminInactiveError(AdminAuthError):
    """Raised when the administrator account is deactivated"""
    pass

class AdminAuthService:
    """Service to handle administrator registration, login, logout, verification, and updates"""
    
    def __init__(self, store: AdminStore, app_or_bcrypt):
        self.store = store
        if hasattr(app_or_bcrypt, 'check_password_hash'):
            self.bcrypt = app_or_bcrypt
        else:
            self.bcrypt = Bcrypt(app_or_bcrypt)

    def login(self, username_or_email: str, password: str) -> Dict[str, Any]:
        """Authenticate administrator credentials and return access token and admin details"""
        if not username_or_email or not password:
            raise AdminInvalidCredentialsError("Credentials cannot be empty")

        # Try to find by email first, then by username
        admin = self.store.get_by_email(username_or_email)
        if not admin:
            admin = self.store.get_by_username(username_or_email)

        if not admin:
            raise AdminNotFoundError("Administrator not found")

        if not admin.is_active:
            raise AdminInactiveError("Administrator account is inactive")

        # Verify password
        if not admin.verify_password(password, self.bcrypt):
            raise AdminInvalidCredentialsError("Invalid credentials")

        # Update last login timestamp
        now = datetime.datetime.now(datetime.timezone.utc)
        self.store.update_last_login(admin.id, now)
        admin.last_login = now

        # Generate JWT token using token utility
        token = generate_admin_token(admin)

        return {
            "token": token,
            "admin": admin.to_dict()
        }

    def logout(self, admin_id: str) -> bool:
        """Perform stateless logout for an administrator"""
        admin = self.store.get_by_id(admin_id)
        if not admin:
            raise AdminNotFoundError("Administrator not found")
        if not admin.is_active:
            raise AdminInactiveError("Administrator account is inactive")
        return True

    def verify_admin(self, admin_id: str) -> Admin:
        """Verify admin existence and active status"""
        admin = self.store.get_by_id(admin_id)
        if not admin:
            raise AdminNotFoundError("Administrator not found")
        if not admin.is_active:
            raise AdminInactiveError("Administrator account is inactive")
        return admin

    def create_default_admin(self, username: str, email: str, password: str) -> Optional[Admin]:
        """Idempotent helper to seed a default administrator on startup"""
        if not username or not email or not password:
            return None

        # Check if already exists by username or email to maintain idempotency
        existing = self.store.get_by_username(username)
        if not existing:
            existing = self.store.get_by_email(email)

        if existing:
            return existing

        password_hash = self.bcrypt.generate_password_hash(password).decode("utf-8")
        admin = Admin(
            username=username,
            email=email,
            password_hash=password_hash,
            role=ROLE_ADMIN,
            is_active=True
        )
        return self.store.create_admin(admin)

    def change_password(self, admin_id: str, old_password: str, new_password: str) -> bool:
        """Change the password for an existing administrator"""
        admin = self.store.get_by_id(admin_id)
        if not admin:
            raise AdminNotFoundError("Administrator not found")

        if not admin.is_active:
            raise AdminInactiveError("Administrator account is inactive")

        if not admin.verify_password(old_password, self.bcrypt):
            raise AdminInvalidCredentialsError("Invalid old password")

        new_hash = self.bcrypt.generate_password_hash(new_password).decode("utf-8")
        return self.store.update_password(admin.id, new_hash)
