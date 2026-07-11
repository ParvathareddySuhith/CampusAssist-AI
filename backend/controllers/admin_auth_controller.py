from flask import request, jsonify, current_app
from services.admin_auth.admin_auth_service import (
    AdminNotFoundError,
    AdminInvalidCredentialsError,
    AdminInactiveError
)

class AdminAuthController:
    """Controller for handling administrator authentication endpoints"""

    @property
    def _auth_service(self):
        """Lazy access the injected AdminAuthService from application config"""
        return current_app.config["ADMIN_AUTH_SERVICE"]

    def login(self):
        """Handle POST /api/admin/login"""
        try:
            data = request.json or {}
            username_or_email = data.get("username") or data.get("email")
            password = data.get("password")

            if not username_or_email or not password:
                return jsonify({"error": "Username/email and password are required"}), 400

            result = self._auth_service.login(username_or_email, password)
            return jsonify(result), 200

        except (AdminNotFoundError, AdminInvalidCredentialsError):
            return jsonify({"error": "Invalid username or password"}), 401
        except AdminInactiveError as e:
            return jsonify({"error": str(e)}), 403
        except Exception as e:
            return jsonify({"error": f"Internal server error: {str(e)}"}), 500

    def logout(self, admin_id):
        """Handle POST /api/admin/logout"""
        try:
            self._auth_service.logout(admin_id)
            return jsonify({"message": "Successfully logged out"}), 200
        except AdminNotFoundError as e:
            return jsonify({"error": str(e)}), 404
        except AdminInactiveError as e:
            return jsonify({"error": str(e)}), 403
        except Exception as e:
            return jsonify({"error": f"Logout failed: {str(e)}"}), 500

    def me(self, admin_id):
        """Handle GET /api/admin/me"""
        try:
            admin = self._auth_service.verify_admin(admin_id)
            return jsonify(admin.to_dict()), 200
        except AdminNotFoundError as e:
            return jsonify({"error": str(e)}), 404
        except AdminInactiveError as e:
            return jsonify({"error": str(e)}), 403
        except Exception as e:
            return jsonify({"error": f"Failed to retrieve profile: {str(e)}"}), 500
