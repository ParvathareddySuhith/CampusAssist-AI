import warnings
from services.ai.handlers.base_handler import BaseHandler
from langchain_classic.chains import ConversationalRetrievalChain
from langchain_classic.memory import ConversationBufferMemory
from langchain_core.prompts.chat import ChatPromptTemplate
from config.config import Config

# Re-use conversation memories and template from chat_service to maintain session memory
from services.chat_service import conversation_memories, template, retry_with_exponential_backoff

class RAGHandler(BaseHandler):
    """Handler for executing queries through the RAG pipeline"""
    
    def __init__(self, vectorstore):
        super().__init__(vectorstore)
        self.intent_name = "RAG"
        self.handler_name = "RAGHandler"

    def get_conversation_chain(self, session_id):
        """Create or retrieve a conversation chain for a session"""
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
            temperature=0.3,
            max_tokens=2048,
            timeout=Config.GROQ_TIMEOUT,
            max_retries=3
        )

        retriever = self.vectorstore.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 10}
        )

        return ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=retriever,
            memory=memory,
            combine_docs_chain_kwargs={"prompt": ChatPromptTemplate.from_template(template)}
        )

    def _execute(self, question, session_id, user_id=None, routing_context=None):
        """Execute RAG pipeline"""
        if not self.vectorstore:
            return {
                "error": "The AI search database is not initialized.",
                "user_friendly_error": True,
                "session_id": session_id
            }, 503

        chat_chain = self.get_conversation_chain(session_id)
        
        @retry_with_exponential_backoff(max_retries=3, base_delay=2)
        def call_chain():
            try:
                return chat_chain.invoke({"question": question})
            except AttributeError:
                return chat_chain({"question": question})
        
        try:
            result = call_chain()
            answer = result["answer"].strip()
            return self.save_and_format_response(question, answer, session_id, user_id)
            
        except TimeoutError:
            print("[RAG Handler] Timeout error during chain execution")
            return {
                "error": "The AI service is taking longer than expected. Please try again with a shorter question.",
                "user_friendly_error": True,
                "session_id": session_id
            }, 408
        except Exception as e:
            print(f"[RAG Handler] Chain execution failed: {str(e)}")
            raise e
