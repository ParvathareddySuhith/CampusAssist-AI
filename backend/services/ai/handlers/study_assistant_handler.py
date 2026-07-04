import json
from services.ai.handlers.base_handler import BaseHandler
from config.config import Config
from langchain_groq import ChatGroq

class StudyAssistantHandler(BaseHandler):
    """Handler for executing academic study assistant tools (quizzes, flashcards, summarizers) using pure LLM generation"""
    
    def __init__(self, vectorstore=None):
        super().__init__(vectorstore)
        self.intent_name = "STUDY_ASSISTANT"
        self.handler_name = "StudyAssistantHandler"

    def generate_content(self, tool: str, topic: str, difficulty: str = "Medium", question_count: int = 5) -> dict:
        """Query LLM with structured JSON formatting rules depending on target study tool"""
        
        # Initialize ChatGroq with JSON mode formatting constraint
        llm = ChatGroq(
            groq_api_key=Config.GROQ_API_KEY,
            model_name="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=2048,
            timeout=60,
            model_kwargs={"response_format": {"type": "json_object"}}
        )

        if tool == "quiz":
            system_prompt = (
                "You are an expert academic tutor. Generate a revision quiz in structured JSON format.\n"
                f"Topic: {topic}\n"
                f"Difficulty: {difficulty}\n"
                f"Question Count: {question_count}\n\n"
                "Return a JSON object with a single key 'quiz' pointing to a list of question objects. "
                "Each question object MUST contain the following fields:\n"
                "- 'question': the question text\n"
                "- 'options': list of exactly 4 option strings, prefixed with A), B), C), D)\n"
                "- 'correct_answer': the exact correct option string (matching one of the options)\n"
                "- 'explanation': a brief explanation of why that option is correct."
            )
        elif tool == "flashcard":
            system_prompt = (
                "You are an expert academic tutor. Generate flashcards in structured JSON format.\n"
                f"Topic: {topic}\n\n"
                "Return a JSON object with a single key 'flashcards' pointing to a list of exactly 6 flashcard objects. "
                "Each flashcard object MUST contain the following fields:\n"
                "- 'question': a core conceptual question or definition prompt\n"
                "- 'answer': a concise, clear answer explaining the concept."
            )
        elif tool == "summarizer":
            system_prompt = (
                "You are an expert academic tutor. Generate revision notes in structured JSON format.\n"
                f"Topic: {topic}\n\n"
                "Return a JSON object with exactly the following fields:\n"
                "- 'summary': a clear paragraph summarizing the topic\n"
                "- 'key_points': a list of exactly 5 bullet points capturing key takeaways and definitions."
            )
        elif tool == "important_questions":
            system_prompt = (
                "You are an expert academic tutor. Generate exam questions in structured JSON format.\n"
                f"Topic: {topic}\n\n"
                "Return a JSON object with exactly the following fields:\n"
                "- 'two_marks': a list of exactly 3 short-answer questions (conceptual definitions)\n"
                "- 'five_marks': a list of exactly 2 medium-answer questions (explanations, differences)\n"
                "- 'ten_marks': a list of exactly 2 long-essay questions (architectures, design, full details)."
            )
        elif tool == "explain":
            system_prompt = (
                "You are an expert academic tutor. Explain a topic in structured JSON format.\n"
                f"Topic: {topic}\n\n"
                "Return a JSON object with exactly the following fields:\n"
                "- 'explanation': a simple, intuitive explanation of the concept suited for beginners\n"
                "- 'example': a real-world metaphor or concrete code example explaining the topic\n"
                "- 'interview_tips': a list of exactly 3 tips for answering questions about this topic during placement interviews."
            )
        else:
            raise ValueError(f"Unsupported study assistant tool: {tool}")

        messages = [
            ("system", system_prompt),
            ("human", f"Generate JSON study resources for topic: {topic}")
        ]

        # Execute LLM call
        response = llm.invoke(messages)
        content_str = response.content.strip()

        try:
            return json.loads(content_str)
        except json.JSONDecodeError as err:
            print(f"[Study Assistant Handler] Failed to parse JSON response: {str(err)}. Raw output: {content_str}")
            return {"error": "Failed to decode JSON response from LLM", "raw_content": content_str}

    def _execute(self, question, session_id, user_id=None, routing_context=None):
        # Fallback dummy implementation for BaseHandler conformance
        return {"message": "Direct API calls should invoke generate_content method"}, 200
