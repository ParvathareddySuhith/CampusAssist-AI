import threading
import copy
from typing import Optional
from .admin_models import Admin
from .admin_store import AdminStore

class MemoryAdminStore(AdminStore):
    """Thread-safe in-memory administrator storage implementation with deep copy protection"""
    
    def __init__(self):
        self._admins = {}
        self._lock = threading.Lock()

    def create_admin(self, admin: Admin) -> Admin:
        """Persist a deep copy of the administrator record to avoid sharing mutable references"""
        with self._lock:
            admin_copy = copy.deepcopy(admin)
            self._admins[admin_copy.id] = admin_copy
            return copy.deepcopy(admin_copy)

    def get_by_id(self, admin_id: str) -> Optional[Admin]:
        """Fetch a deep copy of the administrator by id"""
        with self._lock:
            admin = self._admins.get(admin_id)
            return copy.deepcopy(admin) if admin else None

    def get_by_email(self, email: str) -> Optional[Admin]:
        """Fetch a deep copy of the administrator by email (case-insensitive)"""
        with self._lock:
            for admin in self._admins.values():
                if admin.email.lower() == email.lower():
                    return copy.deepcopy(admin)
            return None

    def get_by_username(self, username: str) -> Optional[Admin]:
        """Fetch a deep copy of the administrator by username (case-insensitive)"""
        with self._lock:
            for admin in self._admins.values():
                if admin.username.lower() == username.lower():
                    return copy.deepcopy(admin)
            return None

    def update_last_login(self, admin_id: str, timestamp) -> bool:
        """Update last login timestamp for a stored administrator"""
        with self._lock:
            admin = self._admins.get(admin_id)
            if admin:
                admin.last_login = timestamp
                return True
            return False

    def update_password(self, admin_id: str, password_hash: str) -> bool:
        """Update password hash for a stored administrator"""
        with self._lock:
            admin = self._admins.get(admin_id)
            if admin:
                admin.password_hash = password_hash
                return True
            return False
