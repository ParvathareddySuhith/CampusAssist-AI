import re
from config.config import Config
from utils.helpers import is_general_chat

class AIRouter:
    """Enterprise Intent Resolver that maps queries to handlers using layered checks"""
    
    def __init__(self, registry):
        # Inject pre-initialized handlers registry
        self.registry = registry

    def resolve(self, request_context) -> tuple:
        """
        Resolves the query to a ResolvedHandler and builds the routing context.
        Returns: (BaseHandler, dict)
        """
        question = request_context.question
        routing_context = {
            "intent": "GENERAL",
            "confidence": 1.0,
            "reason": "Default route",
            "context": {
                "user_id": request_context.user_id,
                "session_id": request_context.session_id,
                "profile": request_context.profile,
                "request_metadata": request_context.request_metadata
            }
        }

        try:
            clean_q = question.strip().lower()

            # Layer 1: Small Talk Precheck (Greetings, thanks, farewells)
            general_response = is_general_chat(question)
            if general_response:
                routing_context.update({
                    "intent": "SMALL_TALK",
                    "confidence": 1.0,
                    "reason": "Precheck: general talk / greeting patterns",
                    "response": general_response
                })
                print("[Intent Resolver] Layer 1 matched: SMALL_TALK")
                return self.registry["SMALL_TALK"], routing_context

            # Layer 2: Document Context Precheck
            doc_patterns = [
                r"\bpdf\b", r"\bfile\b", r"\bdocument\b", r"\buploaded\b",
                r"\bcontext\b", r"\btextbook\b", r"\bpaper\b"
            ]
            for pat in doc_patterns:
                if re.search(pat, clean_q):
                    routing_context.update({
                        "intent": "DOCUMENT",
                        "confidence": 1.0,
                        "reason": f"Precheck: document keyword match ('{pat}')"
                    })
                    print(f"[Intent Resolver] Layer 2 matched: DOCUMENT (Reason: {routing_context['reason']})")
                    return self.registry["DOCUMENT"], routing_context

            # Layer 3: Campus Administrative Context Precheck
            campus_keywords = [
                r"\battendance\b", r"\bhostel\b", r"\bfees?\b", r"\bregulations?\b",
                r"\bsyllabus\b", r"\bcalendar\b", r"\blibrary\b", r"\bdepartments?\b",
                r"\bfaculty\b", r"\bexams?\b", r"\bexamination\b", r"\bscholarships?\b",
                r"\badmissions?\b", r"\bcampus\b", r"\buniversity\b", r"\bcollege\b",
                r"\bplacements?\b"
            ]
            for pat in campus_keywords:
                if re.search(pat, clean_q):
                    routing_context.update({
                        "intent": "CAMPUS",
                        "confidence": 1.0,
                        "reason": f"Precheck: campus keyword match ('{pat}')"
                    })
                    print(f"[Intent Resolver] Layer 3 matched: CAMPUS (Reason: {routing_context['reason']})")
                    return self.registry["CAMPUS"], routing_context

            # Layer 4: LLM Intent Classification
            if not Config.GROQ_API_KEY:
                print("[Intent Resolver] GROQ_API_KEY not configured. Defaulting to GENERAL.")
                return self.registry["GENERAL"], routing_context

            from langchain_groq import ChatGroq
            llm = ChatGroq(
                groq_api_key=Config.GROQ_API_KEY,
                model_name="llama-3.3-70b-versatile",
                temperature=0.0,
                max_tokens=60,
                timeout=5,
                max_retries=1
            )

            system_prompt = (
                "You are an AI Intent Classifier for a campus assistant. Classify the user question into exactly one of these intents:\n"
                "- 'CAMPUS': Institutional or administrative questions (hostels, fee, attendance, exam dates, college rules).\n"
                "- 'ACADEMIC': Pure conceptual learning, programming queries, DSA roadmaps, definitions (e.g. recursion, polymorphism, DBMS, java syntax).\n"
                "- 'PLACEMENT': Professional development, resume building, interview practice, placement drive details.\n"
                "- 'DOCUMENT': Explaining or referencing uploaded PDFs/materials.\n"
                "- 'GENERAL': General queries, greetings, or casual talk.\n\n"
                "You MUST respond with exactly this format (no other conversational text or intro):\n"
                "INTENT=<intent_word>\n"
                "CONFIDENCE=<float_confidence_score_between_0_and_1>\n"
                "REASON=<one_sentence_reasoning>"
            )

            messages = [
                ("system", system_prompt),
                ("human", f"Question: {question}")
            ]

            response = llm.invoke(messages)
            llm_output = response.content.strip()
            
            # Parse the structured response line by line
            intent = "GENERAL"
            confidence = 1.0
            reason = "LLM classification"
            
            for line in llm_output.split('\n'):
                line = line.strip()
                if line.startswith("INTENT="):
                    intent = line.replace("INTENT=", "").strip().upper()
                elif line.startswith("CONFIDENCE="):
                    try:
                        confidence = float(line.replace("CONFIDENCE=", "").strip())
                    except ValueError:
                        confidence = 1.0
                elif line.startswith("REASON="):
                    reason = line.replace("REASON=", "").strip()

            print(f"[Intent Resolver] LLM intent: {intent} (Confidence: {confidence})")

            # Validate intent and apply confidence threshold check
            valid_intents = {"CAMPUS", "ACADEMIC", "PLACEMENT", "DOCUMENT", "GENERAL", "SMALL_TALK"}
            if intent not in valid_intents:
                intent = "GENERAL"
                reason = f"Invalid intent returned: {intent}"

            if confidence < 0.65:
                print(f"[Intent Resolver] Low confidence ({confidence} < 0.65). Overriding intent to GENERAL.")
                intent = "GENERAL"
                reason = f"Low classification confidence fallback (originally: {intent}, confidence: {confidence})"

            routing_context.update({
                "intent": intent,
                "confidence": confidence,
                "reason": reason
            })

            handler = self.registry.get(intent, self.registry["GENERAL"])
            return handler, routing_context

        except Exception as e:
            print(f"[Intent Resolver] Execution failed: {str(e)}. Defaulting to GENERAL.")
            return self.registry["GENERAL"], routing_context
