import warnings
import time
from typing import List, Dict, Any
from services.ai.handlers.base_handler import BaseHandler
from langchain_classic.chains import ConversationalRetrievalChain
from langchain_classic.memory import ConversationBufferMemory
from langchain_core.prompts.chat import ChatPromptTemplate
from langchain_core.retrievers import BaseRetriever
from langchain_core.callbacks import CallbackManagerForRetrieverRun
from langchain_core.documents import Document
from config.config import Config

# Re-use conversation memories and template from chat_service to maintain session memory
from services.chat_service import conversation_memories, template, retry_with_exponential_backoff


class SmartMetadataRetriever(BaseRetriever):
    """Custom LangChain Retriever that filters by student profile metadata with automatic fallback"""
    
    vectorstore: Any
    filter_dict: Dict[str, Any]

    def _get_relevant_documents(
        self, query: str, *, run_manager: CallbackManagerForRetrieverRun = None
    ) -> List[Document]:
        docs = []
        
        # 1. Attempt metadata-filtered search
        if self.filter_dict:
            try:
                print(f"[Smart RAG] Executing filtered search in Pinecone: {self.filter_dict}")
                docs = self.vectorstore.similarity_search(query, k=10, filter=self.filter_dict)
            except Exception as e:
                print(f"[Smart RAG] Filtered similarity search failed: {str(e)}")
        
        # 2. Fallback to unrestricted search if no docs found
        fallback_used = False
        if not docs:
            print("[Smart RAG] No documents matched filter criteria. Performing unrestricted fallback search...")
            try:
                docs = self.vectorstore.similarity_search(query, k=10)
                fallback_used = True
            except Exception as fallback_err:
                print(f"[Smart RAG] Unrestricted fallback search failed: {str(fallback_err)}")
                docs = []

        # Log Smart RAG Telemetry
        dept = self.filter_dict.get("department", "None")
        sem = self.filter_dict.get("semester", "None")
        subject = self.filter_dict.get("subject", "None")
        
        retrieved_docs = list(set([d.metadata.get("source", "unknown") for d in docs]))
        
        print("\n" + "="*50)
        print("[SMART RAG TELEMETRY LOG]")
        print(f"Department: {dept}")
        print(f"Semester: {sem}")
        print(f"Subject Filter: {subject}")
        print(f"Retrieved Documents: {retrieved_docs}")
        print(f"Fallback Used: {fallback_used}")
        print("="*50 + "\n")
        
        return docs


class RAGHandler(BaseHandler):
    """Handler for executing queries through the metadata-aware smart RAG pipeline"""
    
    def __init__(self, vectorstore):
        super().__init__(vectorstore)
        self.intent_name = "RAG"
        self.handler_name = "RAGHandler"

    def get_conversation_chain(self, session_id, routing_context=None):
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

        # Build filter from profile metadata
        filter_dict = {}
        if routing_context:
            profile = routing_context.get("context", {}).get("profile")
            if profile:
                dept = profile.get("department")
                sem = profile.get("semester")
                if dept:
                    filter_dict["department"] = dept.strip().upper()
                if sem:
                    try:
                        filter_dict["semester"] = int(sem)
                    except (ValueError, TypeError):
                        pass

        # Build personalization system instruction prompt
        from services.personalization.prompt_builder import PromptBuilder
        personalization = routing_context.get("personalization", {}) if routing_context else {}
        p_prompt = PromptBuilder.build(personalization)
        
        custom_template = p_prompt + template if p_prompt else template

        retriever = SmartMetadataRetriever(vectorstore=self.vectorstore, filter_dict=filter_dict)

        return ConversationalRetrievalChain.from_llm(
            llm=llm,
            retriever=retriever,
            memory=memory,
            combine_docs_chain_kwargs={"prompt": ChatPromptTemplate.from_template(custom_template)}
        )

    def _execute(self, question, session_id, user_id=None, routing_context=None):
        """Execute RAG pipeline"""
        if not self.vectorstore:
            return {
                "error": "The AI search database is not initialized.",
                "user_friendly_error": True,
                "session_id": session_id
            }, 503

        chat_chain = self.get_conversation_chain(session_id, routing_context)
        
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
