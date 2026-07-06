import warnings
from services.ai.handlers.base_handler import BaseHandler
from langchain_classic.memory import ConversationBufferMemory
from config.config import Config

# Re-use conversation memories and retry helper from chat_service
from services.chat_service import conversation_memories, retry_with_exponential_backoff

class LLMHandler(BaseHandler):
    """Base handler for executing direct LLM operations without RAG retrieval"""
    
    def __init__(self, vectorstore):
        super().__init__(vectorstore)
        self.intent_name = "GENERAL"
        self.handler_name = "LLMHandler"
        self.system_prompt = (
            "You are a helpful and knowledgeable campus assistant. Answer the student's question directly. "
            "Provide a detailed, accurate, and professional response."
        )

    def _execute(self, question, session_id, user_id=None, routing_context=None):
        # Resolve session memory
        if session_id not in conversation_memories:
            with warnings.catch_warnings():
                warnings.simplefilter("ignore")
                memory = ConversationBufferMemory(
                    memory_key='chat_history',
                    return_messages=True
                )
            conversation_memories[session_id] = memory
        else:
            memory = conversation_memories[session_id]

        # Initialize LLM
        from langchain_groq import ChatGroq
        llm = ChatGroq(
            groq_api_key=Config.GROQ_API_KEY,
            model_name=Config.GROQ_MODEL,
            temperature=0.4, # Balanced temperature for creativity/precision
            max_tokens=2048,
            timeout=Config.GROQ_TIMEOUT,
            max_retries=3
        )

        # Retrieve RequestContext from routing_context
        request_context = None
        if routing_context:
            request_context = routing_context.get("request_context")

        personalization = {}
        conversation_context = ""
        if request_context:
            personalization = request_context.personalization
            conversation_context = request_context.conversation_context

        # Assemble prompt payload via PromptBuilder
        from services.personalization.prompt_builder import PromptBuilder
        payload = PromptBuilder.build_prompt(
            question=question,
            intent=self.intent_name,
            personalization=personalization,
            conversation_context=conversation_context
        )

        history_messages = memory.chat_memory.messages
        # 1. Start with system prompt from payload
        messages = [("system", payload.system_prompt)]
        
        # 2. Append history
        for msg in history_messages:
            if msg.type == "human" or msg.type == "user":
                messages.append(("human", msg.content))
            else:
                messages.append(("ai", msg.content))
                
        # 3. Append user query (with conversation context)
        messages.append(("human", payload.user_prompt))

        @retry_with_exponential_backoff(max_retries=3, base_delay=2)
        def call_llm():
            return llm.invoke(messages)

        try:
            result = call_llm()
            answer = result.content.strip()
            
            # Store exchange in memory
            memory.chat_memory.add_user_message(question)
            memory.chat_memory.add_ai_message(answer)
            
            return self.save_and_format_response(question, answer, session_id, user_id)
            
        except Exception as e:
            print(f"[LLM Handler] LLM generation failed: {str(e)}")
            raise e
