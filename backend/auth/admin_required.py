from functools import wraps
import inspect
from flask import request, jsonify
from utils.auth import decode_token
from services.admin_auth.admin_models import ROLE_ADMIN, ROLE_SUPER_ADMIN

# Allowed admin roles for RBAC checks
ALLOWED_ADMIN_ROLES = {ROLE_ADMIN, ROLE_SUPER_ADMIN}

def admin_required(f):
    """Decorator to require administrator authentication and role-based access control (RBAC)"""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        payload = decode_token(token)
        if not payload:
            return jsonify({'error': 'Token is invalid'}), 401
            
        role = payload.get('role')
        if not role or role.upper() not in ALLOWED_ADMIN_ROLES:
            return jsonify({'error': 'Admin access required'}), 403
            
        # Dynamically inject admin_id only if the decorated function's signature accepts it
        sig = inspect.signature(f)
        if 'admin_id' in sig.parameters:
            kwargs['admin_id'] = payload.get('user_id')
            
        return f(*args, **kwargs)
    return decorated
