from dataclasses import dataclass
from typing import Dict, Any, Optional

@dataclass
class PromptPayload:
    """Standardized structured container for assembled prompts"""
    system_prompt: str
    user_prompt: str
    is_rag: bool
    retrieved_context: Optional[str] = None


class PromptBuilder:
    """Assembles unified career/personalization system prompts for LLM and RAG execution"""

    @staticmethod
    def build(personalization: Dict[str, Any]) -> str:
        """Construct prompt modifier if profile exists (for backward compatibility)"""
        if not personalization:
            return ""
            
        runtime = personalization.get("runtime", {})
        if not runtime.get("has_profile", False):
            return ""
            
        profile = personalization.get("profile", {})
        profile_summary = profile.get("profile_summary", "")
        if not profile_summary:
            return ""
            
        return (
            "You are CampusAssist AI.\n"
            "Student Context:\n"
            f"- Profile: {profile_summary}\n\n"
            "If the student query relates to academics, course details, placement prep, or campus queries, "
            "adapt your explanations and detail level to suit their academic background (e.g. mentioning relevant semesters, "
            "core subjects, or expectations for their year when helpful).\n"
            "Never fabricate or invent student profile information.\n"
        )

    @staticmethod
    def build_prompt(
        question: str,
        intent: str,
        personalization: Dict[str, Any],
        conversation_context: str,
        retrieved_context: Optional[str] = None
    ) -> PromptPayload:
        """
        Assembles consistent prompts using a single return type structure.
        
        Assembly Order:
        1. Base System Prompt
        2. Personalization Context
        3. Conversation Context
        4. Retrieved Documents (RAG Context, if active)
        5. Current Question
        """
        is_rag = (intent == "RAG" or retrieved_context is not None)

        # 1. Base System Prompt
        if is_rag:
            # Import template from chat_service for backward compatibility
            from services.chat_service import template as RAG_TEMPLATE
            system_prompt = RAG_TEMPLATE
        else:
            system_prompt = (
                "You are a helpful and knowledgeable campus assistant. Answer the student's question directly. "
                "Provide a detailed, accurate, and professional response."
            )

        # 2. Personalization Context
        p_prompt = PromptBuilder.build(personalization)
        if p_prompt:
            if is_rag:
                system_prompt = p_prompt + "\n" + system_prompt
            else:
                system_prompt = system_prompt + "\n\n" + p_prompt

        # 3. User Prompt (incorporates conversation context)
        if conversation_context:
            user_prompt = f"{conversation_context}Current Question:\n{question}"
        else:
            user_prompt = question

        return PromptPayload(
            system_prompt=system_prompt,
            user_prompt=user_prompt,
            is_rag=is_rag,
            retrieved_context=retrieved_context
        )
