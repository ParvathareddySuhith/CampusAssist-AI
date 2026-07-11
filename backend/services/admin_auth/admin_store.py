from abc import ABC, abstractmethod
from typing import Optional
from .admin_models import Admin

class AdminStore(ABC):
    """Abstract base class representing the administrator storage interface"""
    
    @abstractmethod
    def create_admin(self, admin: Admin) -> Admin:
        """Persist a new administrator record. Return the created administrator."""
        pass

    @abstractmethod
    def get_by_id(self, admin_id: str) -> Optional[Admin]:
        """Fetch administrator by their unique identifier."""
        pass

    @abstractmethod
    def get_by_email(self, email: str) -> Optional[Admin]:
        """Fetch administrator by their registered email address."""
        pass

    @abstractmethod
    def get_by_username(self, username: str) -> Optional[Admin]:
        """Fetch administrator by their username."""
        pass

    @abstractmethod
    def update_last_login(self, admin_id: str, timestamp) -> bool:
        """Update last login timestamp for an administrator."""
        pass

    @abstractmethod
    def update_password(self, admin_id: str, password_hash: str) -> bool:
        """Update password hash for an administrator."""
        pass
