import re
from typing import List
from services.learning_path.learning_path_models import LearningStep, LearningPath
from services.learning_path.learning_paths import LEARNING_PATHS, GENERIC_PATH_STEPS

class LearningPathEngine:
    """Core engine that compiles deterministic roadmaps for CS topics using RequestContext"""

    def generate_learning_path(self, request_context: "RequestContext") -> LearningPath:
        """Generates a structured LearningPath based on request context"""
        question = request_context.question
        topic = self._detect_topic(question)

        # Check if topic is a predefined core CS subject
        if topic in LEARNING_PATHS:
            config = LEARNING_PATHS[topic]
            steps = [
                LearningStep(
                    id=s["id"],
                    title=s["title"],
                    description=s["description"],
                    estimated_minutes=s["estimated_minutes"],
                    difficulty=s["difficulty"],
                    prerequisites=s["prerequisites"]
                )
                for s in config["steps"]
            ]
            return LearningPath(
                topic=topic,
                source="PREDEFINED",
                difficulty=config["difficulty"],
                estimated_total_minutes=config["estimated_total_minutes"],
                steps=steps,
                recommended_resources=config["recommended_resources"],
                next_step_index=0
            )

        # Handle unknown topics by populating the generic path template
        generic_steps = []
        estimated_total_minutes = 0
        for s in GENERIC_PATH_STEPS:
            formatted_title = s["title"].format(topic=topic)
            formatted_desc = s["description"].format(topic=topic)
            generic_steps.append(
                LearningStep(
                    id=s["id"],
                    title=formatted_title,
                    description=formatted_desc,
                    estimated_minutes=s["estimated_minutes"],
                    difficulty=s["difficulty"],
                    prerequisites=s["prerequisites"]
                )
            )
            estimated_total_minutes += s["estimated_minutes"]

        return LearningPath(
            topic=topic,
            source="GENERIC",
            difficulty="INTERMEDIATE",
            estimated_total_minutes=estimated_total_minutes,
            steps=generic_steps,
            recommended_resources=[
                "Google Search",
                "Official Documentation",
                "YouTube Tutorials"
            ],
            next_step_index=0
        )

    def _detect_topic(self, question: str) -> str:
        """Helper to match query keywords with core CS subjects (case-insensitive)"""
        q = question.lower().strip()

        # 1. Match core CS subjects
        if re.search(r'\b(dbms|database|databases)\b', q):
            return "DBMS"
        if re.search(r'\b(operating system|operating systems|os)\b', q):
            return "Operating Systems"
        if re.search(r'\bjava\b', q) and not re.search(r'\bjavascript\b', q):
            return "Java"
        if re.search(r'\bpython\b', q):
            return "Python"
        if re.search(r'\b(computer network|computer networks|networking|cn)\b', q):
            return "CN"
        if re.search(r'\b(dsa|data structure|data structures|algorithm|algorithms)\b', q):
            return "DSA"
        if re.search(r'\b(oop|oops|object oriented|object-oriented)\b', q):
            return "OOP"
        if re.search(r'\breact\b', q):
            return "React"
        if re.search(r'\bsql\b', q):
            return "SQL"

        # 2. Fallback keyword extraction: remove common introductory query phrases
        clean_q = re.sub(r'^(what is|explain|teach me|how to|how do i|tell me about|what are|define|discuss)\s+', '', q)
        clean_q = re.sub(r'[\.\?\!\,\;\:]+$', '', clean_q).strip()

        words = clean_q.split()
        if len(words) > 0 and len(words) <= 4:
            return " ".join(words).title()

        return "General Topic"
