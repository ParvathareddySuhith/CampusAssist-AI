import datetime
from typing import Optional, Dict, Any

class ContextPersonalizer:
    """Extracts and structures user profile context for AI response personalization"""

    def personalize(self, profile: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate structured personalization details from student profile details"""
        has_profile = profile is not None
        
        # Default fallback values
        student_name = "Student"
        department = ""
        year = None
        semester = None
        preferred_language = "English"
        career_goal = None
        interests = []
        
        if has_profile:
            student_name = profile.get("full_name", "Student")
            department = profile.get("department", "")
            year = profile.get("year")
            semester = profile.get("semester")
            preferred_language = profile.get("preferred_language", "English")
            career_goal = profile.get("career_goal")
            interests = profile.get("interests", [])

        # Map academic year to level
        academic_level = ""
        if year:
            try:
                year_val = int(year)
                academic_level = "Undergraduate"
            except (ValueError, TypeError):
                pass

        # Build profile summary once
        profile_summary = ""
        if has_profile and department and semester and year:
            ordinal = {1: "1st", 2: "2nd", 3: "3rd", 4: "4th"}.get(year, f"{year}")
            profile_summary = f"{student_name} is a {ordinal} Year {department} student currently studying Semester {semester}."

        # Return future-proof nested schema
        return {
            "profile": {
                "student_name": student_name,
                "department": department,
                "year": year,
                "semester": semester,
                "academic_level": academic_level,
                "preferred_language": preferred_language,
                "career_goal": career_goal,
                "interests": interests,
                "profile_summary": profile_summary
            },
            "preferences": {
                "mode": "default"
            },
            "runtime": {
                "current_time": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
                "has_profile": has_profile
            }
        }
