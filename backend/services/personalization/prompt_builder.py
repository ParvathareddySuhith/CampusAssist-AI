from typing import Dict, Any

class PromptBuilder:
    """Builds consistent system personalization prompts using the personalization dictionary"""

    @staticmethod
    def build(personalization: Dict[str, Any]) -> str:
        """Construct prompt modifier if profile exists, otherwise return an empty string"""
        if not personalization:
            return ""
            
        runtime = personalization.get("runtime", {})
        if not runtime.get("has_profile", False):
            return ""
            
        profile = personalization.get("profile", {})
        profile_summary = profile.get("profile_summary", "")
        if not profile_summary:
            return ""
            
        # Compile standard instruction
        return (
            "You are CampusAssist AI.\n"
            "Student Context:\n"
            f"- Profile: {profile_summary}\n\n"
            "If the student query relates to academics, course details, placement prep, or campus queries, "
            "adapt your explanations and detail level to suit their academic background (e.g. mentioning relevant semesters, "
            "core subjects, or expectations for their year when helpful).\n"
            "Never fabricate or invent student profile information.\n"
        )
