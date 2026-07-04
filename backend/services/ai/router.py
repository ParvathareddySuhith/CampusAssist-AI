import re
from config.config import Config

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
        clean_q = question.strip().lower()

        # Helper function to check keywords with word boundaries
        def has_words(patterns, text):
            for pat in patterns:
                # If pattern contains multiple words, check substring directly
                if ' ' in pat:
                    if pat in text:
                        return True
                else:
                    if re.search(r'\b' + re.escape(pat) + r'\b', text):
                        return True
            return False

        # Layer 1: Small Talk Detection (no LLM, heuristic)
        small_talk_patterns = ["hello", "hi", "hey", "good morning", "good evening", "thanks", "thank you", "bye", "goodbye"]
        if has_words(small_talk_patterns, clean_q):
            routing_context = {
                "intent": "SMALL_TALK",
                "confidence": 1.0,
                "reason": "Precheck: greeting or farewell phrase matched",
                "strategy": "heuristic",
                "classifier": None
            }
            print("[Intent Resolver] Layer 1 matched: SMALL_TALK")
            return self.registry["SMALL_TALK"], routing_context

        # Layer 2: Campus Heuristics (no LLM, heuristic)
        campus_patterns = [
            "attendance", "hostel", "fees", "fee", "library", "regulation", 
            "exam", "semester", "department", "faculty", "syllabus", 
            "academic calendar", "scholarship"
        ]
        if has_words(campus_patterns, clean_q):
            routing_context = {
                "intent": "CAMPUS",
                "confidence": 1.0,
                "reason": "Precheck: campus administrative term matched",
                "strategy": "heuristic",
                "classifier": None
            }
            print("[Intent Resolver] Layer 2 matched: CAMPUS")
            return self.registry["CAMPUS"], routing_context

        # Layer 3: Document Detection (no LLM, heuristic)
        document_patterns = [
            "uploaded pdf", "this document", "explain this pdf", 
            "summarize the document", "chapter", "notes", "pdf", "document"
        ]
        if has_words(document_patterns, clean_q):
            routing_context = {
                "intent": "DOCUMENT",
                "confidence": 1.0,
                "reason": "Precheck: document request phrase or keyword matched",
                "strategy": "heuristic",
                "classifier": None
            }
            print("[Intent Resolver] Layer 3 matched: DOCUMENT")
            return self.registry["DOCUMENT"], routing_context

        # Layer 4: LLM Intent Classification
        if not Config.GROQ_API_KEY:
            # Fallback to GENERAL if no key is configured
            routing_context = {
                "intent": "GENERAL",
                "confidence": 1.0,
                "reason": "Fallback: GROQ_API_KEY not configured",
                "strategy": "heuristic",
                "classifier": None
            }
            print("[Intent Resolver] Fallback to GENERAL (no API key)")
            return self.registry["GENERAL"], routing_context

        try:
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
                "You are an AI Intent Classifier for a student campus assistant. Classify the user question into exactly one of these intents:\n"
                "- 'ACADEMIC': Questions about specific technical/programming concepts, computer science topics, code debugging, or algorithms (e.g. 'Explain polymorphism', 'recursion in Java', 'DBMS SQL joins').\n"
                "- 'PLACEMENT': Professional development, resume building, interview practice, HR interview questions (e.g. 'Give HR interview questions', 'mock resume tips').\n"
                "- 'GENERAL': General knowledge questions, general science definitions, broad topics (e.g. 'What is Artificial Intelligence?', 'Who is Alan Turing?'), greetings, or casual talk.\n\n"
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
            
            # Parse response line-by-line safely
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
            valid_intents = {"ACADEMIC", "PLACEMENT", "GENERAL"}
            if intent not in valid_intents:
                intent = "GENERAL"
                reason = f"Invalid intent returned: {intent}"

            if confidence < 0.65:
                print(f"[Intent Resolver] Low confidence ({confidence} < 0.65). Overriding intent to GENERAL.")
                intent = "GENERAL"
                reason = f"Low classification confidence fallback (originally: {intent}, confidence: {confidence})"

            routing_context = {
                "intent": intent,
                "confidence": confidence,
                "reason": reason,
                "strategy": "llm",
                "classifier": "groq"
            }

            handler = self.registry.get(intent, self.registry["GENERAL"])
            return handler, routing_context

        except Exception as e:
            print(f"[Intent Resolver] LLM classification failed: {str(e)}. Defaulting to GENERAL.")
            routing_context = {
                "intent": "GENERAL",
                "confidence": 1.0,
                "reason": f"Fallback: LLM classification failed ({str(e)})",
                "strategy": "heuristic",
                "classifier": None
            }
            return self.registry["GENERAL"], routing_context
