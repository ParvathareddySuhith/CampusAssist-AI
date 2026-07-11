import datetime
import jwt
from config.config import Config
from .admin_models import Admin

def generate_admin_token(admin: Admin) -> str:
    """Generate JWT token for an admin containing their user_id and role"""
    payload = {
        'user_id': str(admin.id),
        'role': admin.role,
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')
