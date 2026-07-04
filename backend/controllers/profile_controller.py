from flask import request, jsonify
from models.models import StudentProfile

class ProfileController:
    """Controller for handling student profile-related requests"""
    
    def __init__(self):
        self.profile_model = StudentProfile()
        self.allowed_departments = ["CSE", "AIML", "ECE", "EEE", "MECH", "CIVIL"]

    def get_profile(self, user_id):
        """Retrieve the profile for the authenticated user"""
        try:
            profile = self.profile_model.get_profile(user_id)
            if not profile:
                # Return empty default state if no profile exists yet
                return jsonify({
                    "full_name": "",
                    "department": "",
                    "year": "",
                    "semester": "",
                    "section": "",
                    "roll_number": ""
                }), 200
            
            # Make sure MongoDB fields are serializable
            return jsonify({
                "full_name": profile.get("full_name", ""),
                "department": profile.get("department", ""),
                "year": profile.get("year", ""),
                "semester": profile.get("semester", ""),
                "section": profile.get("section", ""),
                "roll_number": profile.get("roll_number", "")
            }), 200
        except Exception as e:
            print(f"[Profile Controller] Get profile error: {str(e)}")
            return jsonify({"error": f"Failed to fetch profile: {str(e)}"}), 500

    def update_profile(self, user_id):
        """Upsert the profile for the authenticated user"""
        try:
            data = request.json
            if not data:
                return jsonify({"error": "No profile data provided"}), 400

            full_name = data.get("full_name", "").strip()
            department = data.get("department", "").strip().upper()
            year_raw = data.get("year")
            semester_raw = data.get("semester")
            section = data.get("section", "").strip()
            roll_number = data.get("roll_number", "").strip()

            # 1. Required Fields check
            if not full_name:
                return jsonify({"error": "Full Name is required"}), 400
            
            # 2. Department check
            if department not in self.allowed_departments:
                return jsonify({"error": f"Invalid department. Must be one of: {', '.join(self.allowed_departments)}"}), 400

            # 3. Year check
            try:
                year = int(year_raw)
                if not (1 <= year <= 4):
                    return jsonify({"error": "Academic Year must be between 1 and 4"}), 400
            except (ValueError, TypeError):
                return jsonify({"error": "Academic Year must be an integer"}), 400

            # 4. Semester check
            try:
                semester = int(semester_raw)
                if not (1 <= semester <= 8):
                    return jsonify({"error": "Semester must be between 1 and 8"}), 400
            except (ValueError, TypeError):
                return jsonify({"error": "Semester must be an integer"}), 400

            profile_data = {
                "full_name": full_name,
                "department": department,
                "year": year,
                "semester": semester,
                "section": section,
                "roll_number": roll_number
            }

            self.profile_model.upsert_profile(user_id, profile_data)
            return jsonify({
                "message": "Profile updated successfully",
                "profile": profile_data
            }), 200

        except Exception as e:
            print(f"[Profile Controller] Update profile error: {str(e)}")
            return jsonify({"error": f"Failed to update profile: {str(e)}"}), 500
