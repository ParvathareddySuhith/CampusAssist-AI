from typing import List, Dict, Any
from services.recommendation.recommendation_models import RecommendationItem, RecommendationResult
from services.context.request_context import RequestContext

class RecommendationEngine:
    """
    Version 1
    
    Rule-based recommendation engine.
    
    Future versions may combine:
    - LLM reasoning
    - Vector similarity
    - Student learning history
    - Click analytics
    - Course progression
    
    without changing this public interface.
    """

    def generate(self, request_context: RequestContext) -> RecommendationResult:
        """Stateless generation of career, study and document recommendations from RequestContext"""
        intent = request_context.intent
        
        # Split logic into clean private generator methods
        topics = self._generate_topics(request_context)
        documents = self._generate_documents(request_context)
        study_tools = self._generate_study_tools(request_context)
        placement = self._generate_placement(request_context)
        next_questions = self._generate_next_questions(request_context)
        
        # Generate specialized recommendations and extend study_tools list
        specialized = self._generate_specialized_recommendations(request_context)
        study_tools.extend(specialized)
        
        result = RecommendationResult(
            topics=topics,
            documents=documents,
            study_tools=study_tools,
            placement=placement,
            next_questions=next_questions
        )
        
        self._log_telemetry(intent, result)
        return result

    def _generate_topics(self, request_context: RequestContext) -> List[RecommendationItem]:
        intent = request_context.intent
        items = []
        if intent == "ACADEMIC":
            items.append(RecommendationItem(
                id="rec_topic_norm",
                title="DBMS Normalization",
                description="Study 1NF, 2NF, 3NF and BCNF concepts.",
                type="topic",
                priority="HIGH",
                action="explain",
                icon="📚",
                category="academic",
                metadata={"topic": "Normalization"}
            ))
            items.append(RecommendationItem(
                id="rec_topic_dbms",
                title="Database Transactions",
                description="ACID properties, schedules and concurrency control.",
                type="topic",
                priority="MEDIUM",
                action="explain",
                icon="📊",
                category="academic",
                metadata={"topic": "Transactions"}
            ))
        elif intent == "CAMPUS":
            items.append(RecommendationItem(
                id="rec_topic_cal",
                title="Academic Calendar",
                description="View exam dates, holidays, and semester milestones.",
                type="topic",
                priority="HIGH",
                action="calendar",
                icon="📅",
                category="campus"
            ))
        return items

    def _generate_documents(self, request_context: RequestContext) -> List[RecommendationItem]:
        intent = request_context.intent
        items = []
        if intent in ["DOCUMENT", "ACADEMIC"]:
            items.append(RecommendationItem(
                id="rec_doc_syllabus",
                title="DBMS Syllabus.pdf",
                description="Official CSE syllabus for Database Systems.",
                type="document",
                priority="MEDIUM",
                action="/documents",
                icon="📄",
                category="study"
            ))
        elif intent == "CAMPUS":
            items.append(RecommendationItem(
                id="rec_doc_handbook",
                title="Student Handbook.pdf",
                description="Campus rules, grading systems, and code of conduct.",
                type="document",
                priority="HIGH",
                action="/documents",
                icon="📘",
                category="campus"
            ))
        return items

    def _generate_study_tools(self, request_context: RequestContext) -> List[RecommendationItem]:
        intent = request_context.intent
        items = []
        
        # Default titles & descriptions
        quiz_title = "Generate Quiz"
        quiz_desc = "Take an interactive test on this topic to test your knowledge."
        flash_title = "Flashcard Review"
        flash_desc = "Use flashcards to quickly revise core terminology definitions."

        profile = getattr(request_context, "learning_profile", None)
        if profile and profile.favorite_topics:
            fav_topic = profile.favorite_topics[0]
            is_advanced = profile.placement_readiness in ("Intermediate", "Advanced")
            
            # Quiz Recommendation
            if is_advanced:
                quiz_title = f"Recommend Advanced {fav_topic} Quiz"
            else:
                quiz_title = f"Recommend {fav_topic} Quiz"
            quiz_desc = f"Take an interactive {fav_topic.lower()} quiz."
            
            # Flashcards
            flash_title = f"{fav_topic} Flashcard Review"
            flash_desc = f"Revise {fav_topic} concepts using flashcards."

        if intent in ["ACADEMIC", "DOCUMENT"]:
            items.append(RecommendationItem(
                id="rec_tool_quiz",
                title=quiz_title,
                description=quiz_desc,
                type="quiz",
                priority="HIGH",
                action="/study-assistant",
                icon="📝",
                category="study"
            ))
            items.append(RecommendationItem(
                id="rec_tool_flash",
                title=flash_title,
                description=flash_desc,
                type="flashcard",
                priority="MEDIUM",
                action="/study-assistant",
                icon="📇",
                category="study"
            ))
        return items

    def _generate_placement(self, request_context: RequestContext) -> List[RecommendationItem]:
        intent = request_context.intent
        items = []
        
        resume_title = "Resume Review"
        resume_desc = "Analyze your resume with AI to optimize for ATS score keywords."
        
        profile = getattr(request_context, "learning_profile", None)
        if profile and profile.favorite_topics:
            fav_topic = profile.favorite_topics[0]
            resume_title = f"Practice {fav_topic} Technical Interview"
            resume_desc = f"Practice a technical developer interview focused on {fav_topic}."

        if intent == "PLACEMENT":
            items.append(RecommendationItem(
                id="rec_place_resume",
                title=resume_title,
                description=resume_desc,
                type="roadmap",
                priority="HIGH",
                action="/placement-assistant",
                icon="📄",
                category="placement"
            ))
            items.append(RecommendationItem(
                id="rec_place_mock",
                title="Mock Tech Interview",
                description="Simulate a technical developer interview on DSA or DBMS.",
                type="roadmap",
                priority="HIGH",
                action="/placement-assistant",
                icon="💻",
                category="placement"
            ))
        return items

    def _generate_specialized_recommendations(self, request_context: RequestContext) -> List[RecommendationItem]:
        profile = getattr(request_context, "learning_profile", None)
        if not profile:
            return []

        # Combine favorite and weak topics
        all_topics = set(profile.favorite_topics + profile.weak_topics)
        
        # Substring matching (case-insensitive)
        keywords = {
            "algorithms",
            "algorithm",
            "tree",
            "trees",
            "graph",
            "graphs",
            "recursion",
        }
        
        has_match = False
        for topic in all_topics:
            topic_lower = topic.lower()
            if any(kw in topic_lower for kw in keywords):
                has_match = True
                break
                
        if not has_match:
            return []

        return [
            RecommendationItem(
                id="rec_spec_tree",
                title="Tree Problems",
                description="Practice problem-solving on Binary Trees and Binary Search Trees.",
                type="link",
                priority="HIGH",
                action="/study-assistant",
                icon="📝",
                category="study"
            ),
            RecommendationItem(
                id="rec_spec_graph",
                title="Graph Flashcards",
                description="Review Graph concepts, representations, and traversals.",
                type="flashcard",
                priority="HIGH",
                action="/study-assistant",
                icon="📇",
                category="study"
            ),
            RecommendationItem(
                id="rec_spec_bfs",
                title="BFS Quiz",
                description="Test your understanding of Breadth-First Search algorithms.",
                type="quiz",
                priority="HIGH",
                action="/study-assistant",
                icon="📝",
                category="study"
            )
        ]

    def _generate_next_questions(self, request_context: RequestContext) -> List[RecommendationItem]:
        intent = request_context.intent
        items = []
        if intent == "ACADEMIC":
            items.append(RecommendationItem(
                id="rec_next_bcnf",
                title="Explain BCNF",
                description="Learn the difference between 3NF and BCNF.",
                type="question",
                priority="MEDIUM",
                action="ask",
                icon="❓",
                category="followup"
            ))
            items.append(RecommendationItem(
                id="rec_next_sql",
                title="SQL Join Examples",
                description="Retrieve SQL queries matching DBMS Joins.",
                type="question",
                priority="MEDIUM",
                action="ask",
                icon="❓",
                category="followup"
            ))
        elif intent == "PLACEMENT":
            items.append(RecommendationItem(
                id="rec_next_hr",
                title="Mock HR Questions",
                description="Get behavioral interview advice.",
                type="question",
                priority="MEDIUM",
                action="ask",
                icon="❓",
                category="followup"
            ))
        else:
            items.append(RecommendationItem(
                id="rec_next_help",
                title="Explain Deadlocks",
                description="Suggested follow-up query details.",
                type="question",
                priority="LOW",
                action="ask",
                icon="❓",
                category="followup"
            ))
        return items

    def _log_telemetry(self, intent: str, result: RecommendationResult) -> None:
        """Prints detailed telemetry of recommendation parameters"""
        print("\n" + "="*40)
        print("Recommendation Engine")
        print(f"Intent: {intent}")
        
        print("\nTopics")
        if result.topics:
            for item in result.topics:
                print(f"• {item.title}")
        else:
            print("None")
            
        print("\nStudy Tools")
        if result.study_tools:
            for item in result.study_tools:
                print(f"• {item.title}")
        else:
            print("None")
            
        print("\nPlacement")
        if result.placement:
            for item in result.placement:
                print(f"• {item.title}")
        else:
            print("None")
            
        print("\nNext Questions")
        if result.next_questions:
            for item in result.next_questions:
                print(f"• {item.title}")
        else:
            print("None")
            
        print("="*40 + "\n")
