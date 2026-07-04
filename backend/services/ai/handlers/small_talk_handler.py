from services.ai.handlers.base_handler import BaseHandler

class SmallTalkHandler(BaseHandler):
    """Handler for fallbacks, greetings, thanks, and simple banter"""
    
    def __init__(self, vectorstore):
        super().__init__(vectorstore)
        self.intent_name = "SMALL_TALK"
        self.handler_name = "SmallTalkHandler"

    def _execute(self, question, session_id, user_id=None, routing_context=None):
        # Retrieve the precheck response from the routing_context if available
        answer = "Hello! How can I help you today?"
        if routing_context and "response" in routing_context:
            answer = routing_context["response"]

        # Store greeting interaction in conversation history memory
        from services.chat_service import conversation_memories
        import warnings
        from langchain_classic.memory import ConversationBufferMemory
        
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
            
        memory.chat_memory.add_user_message(question)
        memory.chat_memory.add_ai_message(answer)
        
        return self.save_and_format_response(question, answer, session_id, user_id)
