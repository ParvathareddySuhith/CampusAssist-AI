import datetime
from dataclasses import dataclass, field
import uuid

# Role constants
ROLE_ADMIN = "ADMIN"
ROLE_STUDENT = "STUDENT"
ROLE_FACULTY = "FACULTY"
ROLE_SUPER_ADMIN = "SUPER_ADMIN"

@dataclass
class Admin:
    """Administrator model representation"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    username: str = ""
    email: str = ""
    password_hash: str = ""
    role: str = ROLE_ADMIN
    created_at: datetime.datetime = field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc))
    last_login: datetime.datetime = None
    is_active: bool = True

    def to_dict(self):
        """Convert Admin object to a clean dict for API responses (never exposing password hash)"""
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.isoformat() if isinstance(self.created_at, datetime.datetime) else self.created_at,
            "last_login": self.last_login.isoformat() if isinstance(self.last_login, datetime.datetime) else self.last_login,
            "is_active": self.is_active
        }

    def verify_password(self, password, bcrypt_instance):
        """Verify candidate password against stored bcrypt hash"""
        if not self.password_hash:
            return False
        return bcrypt_instance.check_password_hash(self.password_hash, password)
