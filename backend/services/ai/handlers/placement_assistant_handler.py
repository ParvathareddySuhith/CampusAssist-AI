import json
from services.ai.handlers.base_handler import BaseHandler
from config.config import Config
from langchain_groq import ChatGroq

class PlacementAssistantHandler(BaseHandler):
    """Handler for executing career placement tools (resume review, mock interviews, roadmaps, company prep) using Groq JSON mode"""
    
    def __init__(self, vectorstore=None):
        super().__init__(vectorstore)
        self.intent_name = "PLACEMENT_ASSISTANT"
        self.handler_name = "PlacementAssistantHandler"

    def generate_content(self, payload: dict) -> dict:
        """Query LLM with structured JSON formatting rules depending on target placement tool"""
        
        tool = payload.get("tool", "")
        
        # Initialize Groq LLM with JSON mode constraint
        llm = ChatGroq(
            groq_api_key=Config.GROQ_API_KEY,
            model_name="llama-3.3-70b-versatile",
            temperature=0.7,
            max_tokens=2048,
            timeout=60,
            model_kwargs={"response_format": {"type": "json_object"}}
        )

        if tool == "resume_review":
            resume_text = payload.get("resume_text", "").strip()
            system_prompt = (
                "You are an expert technical recruiter and ATS scanner. Analyze the provided resume text.\n"
                f"Resume Text: {resume_text}\n\n"
                "Return a JSON object containing exactly these fields:\n"
                "- 'ats_score': an integer score between 0 and 100\n"
                "- 'strengths': a list of exactly 3 core strengths found in the resume\n"
                "- 'weaknesses': a list of exactly 3 weaknesses or gaps found\n"
                "- 'missing_keywords': a list of exactly 4 critical technical keywords missing from the resume based on modern tech standards\n"
                "- 'suggestions': a list of exactly 4 actionable suggestions for improving the resume's ATS score."
            )
        elif tool == "hr_interview":
            action = payload.get("action", "generate")
            if action == "generate":
                system_prompt = (
                    "You are a Senior HR Director conducting a behavioral job interview. "
                    "Generate a single, realistic HR behavioral interview question (e.g. conflict resolution, leadership, strengths, weaknesses).\n\n"
                    "Return a JSON object containing exactly this field:\n"
                    "- 'question': the HR interview question text."
                )
            else:
                question = payload.get("question", "").strip()
                answer = payload.get("answer", "").strip()
                system_prompt = (
                    "You are a Senior HR Director evaluating a candidate's response to an HR question.\n"
                    f"Question: {question}\n"
                    f"Candidate Answer: {answer}\n\n"
                    "Return a JSON object containing exactly these fields:\n"
                    "- 'score': an evaluation score between 1 and 10\n"
                    "- 'feedback': a paragraph explaining the strengths and weaknesses of the candidate's answer\n"
                    "- 'suggestions': a list of exactly 3 tips to improve this behavioral response."
                )
        elif tool == "technical_interview":
            action = payload.get("action", "generate")
            subject = payload.get("subject", "DSA").strip()
            if action == "generate":
                system_prompt = (
                    f"You are a Senior Software Engineer conducting a technical coding interview on {subject}. "
                    f"Generate a single, realistic technical interview question about {subject} concepts.\n\n"
                    "Return a JSON object containing exactly this field:\n"
                    "- 'question': the technical interview question text."
                )
            else:
                question = payload.get("question", "").strip()
                answer = payload.get("answer", "").strip()
                system_prompt = (
                    f"You are a Senior Software Engineer evaluating a candidate's response to a technical {subject} question.\n"
                    f"Question: {question}\n"
                    f"Candidate Answer: {answer}\n\n"
                    "Return a JSON object containing exactly these fields:\n"
                    "- 'score': an evaluation score between 1 and 10\n"
                    "- 'feedback': a paragraph explaining the technical correctness of the candidate's answer\n"
                    "- 'suggestions': a list of exactly 3 tips to correct or improve their technical response."
                )
        elif tool == "roadmap":
            role = payload.get("role", "Software Engineer").strip()
            system_prompt = (
                f"You are a Career Coach in software engineering. Generate a personalized coding roadmap for becoming a {role}.\n\n"
                "Return a JSON object containing exactly these fields:\n"
                "- 'roadmap': a list of phase objects. Each phase object must contain 'phase' (string phase title) and 'topics' (list of strings to learn)\n"
                "- 'timeline': a string describing total duration (e.g. '6 Months')\n"
                "- 'resources': a list of exactly 4 books, websites, or courses to learn from\n"
                "- 'projects': a list of exactly 3 project ideas matching the role's skills."
            )
        elif tool == "company_prep":
            company = payload.get("company", "Google").strip()
            system_prompt = (
                f"You are a placement officer helping students prepare for placement drives. Provide preparation strategy for {company}.\n\n"
                "Return a JSON object containing exactly these fields:\n"
                "- 'rounds': a list of hiring rounds in order (e.g. ['Online Assessment', 'Technical Interview 1', 'HR Round'])\n"
                "- 'faqs': a list of exactly 4 frequently asked questions or technical topics specific to {company} drives\n"
                "- 'tips': a list of exactly 4 key placement preparation strategies."
            )
        else:
            raise ValueError(f"Unsupported placement assistant tool: {tool}")

        messages = [
            ("system", system_prompt),
            ("human", "Process placement content")
        ]

        response = llm.invoke(messages)
        content_str = response.content.strip()

        try:
            return json.loads(content_str)
        except json.JSONDecodeError as err:
            print(f"[Placement Assistant Handler] Failed to parse JSON response: {str(err)}. Raw output: {content_str}")
            return {"error": "Failed to decode JSON response from LLM", "raw_content": content_str}

    def _execute(self, question, session_id, user_id=None, routing_context=None):
        return {"message": "Direct API calls should invoke generate_content method"}, 200
