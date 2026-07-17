import React, { useState, useEffect, useRef } from 'react';
import { FaTimes, FaUser, FaRobot, FaCalendarAlt, FaGraduationCap } from 'react-icons/fa';
import * as convService from '../../services/adminConversationService';

function ConversationDrawer({ isOpen, conversationId, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (!isOpen || !conversationId) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await convService.getAdminConversation(conversationId);
        setDetails(data);
      } catch (err) {
        console.error('Failed to load conversation details:', err);
        setError('Failed to load conversation history.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [isOpen, conversationId]);

  // Scroll to bottom on details load
  useEffect(() => {
    if (details && chatEndRef.current && typeof chatEndRef.current.scrollIntoView === 'function') {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [details]);

  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString();
    } catch (e) {
      return dateStr;
    }
  };

  const formatMsgTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-lg bg-neutral-900 border-l border-neutral-800 shadow-2xl flex flex-col text-white transform transition-transform duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-800 select-none">
          <div>
            <h3 className="text-lg font-bold">Conversation Log</h3>
            <p className="text-xs text-neutral-400">Review student-assistant dialogue</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-all cursor-pointer"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* User Card Metadata Info */}
        {details && (
          <div className="px-6 py-4 bg-neutral-950/40 border-b border-neutral-800/80 flex flex-wrap gap-4 text-xs text-neutral-400 font-semibold select-none">
            <div className="flex items-center space-x-1.5">
              <FaUser className="text-violet-400" />
              <span className="text-neutral-200">{details.user}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <FaGraduationCap className="text-emerald-400" />
              <span>Dept: <span className="text-neutral-200">{details.department}</span></span>
            </div>
            <div className="flex items-center space-x-1.5">
              <FaCalendarAlt className="text-amber-400" />
              <span>Started: <span className="text-neutral-200">{formatDate(details.created_at)}</span></span>
            </div>
          </div>
        )}

        {/* Chat History Panel */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-neutral-950/10">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-4">
              <div className="w-8 h-8 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
              <span className="text-sm text-neutral-500 font-semibold select-none">Loading messages...</span>
            </div>
          ) : error ? (
            <div className="text-center text-sm text-rose-400 py-12 font-semibold select-none">
              {error}
            </div>
          ) : details && details.messages ? (
            <>
              {details.messages.length === 0 ? (
                <div className="text-center text-sm text-neutral-500 py-12 font-semibold select-none">
                  No messages in this conversation.
                </div>
              ) : (
                details.messages.map((msg, index) => {
                  const isUser = msg.role === 'user';
                  
                  return (
                    <div 
                      key={index} 
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full`}
                    >
                      <div className={`flex items-start space-x-2.5 max-w-[85%] ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 select-none ${isUser ? 'bg-violet-600/20 border border-violet-500/30 text-violet-400' : 'bg-neutral-800 border border-neutral-700 text-neutral-400'}`}>
                          {isUser ? <FaUser className="w-3.5 h-3.5" /> : <FaRobot className="w-3.5 h-3.5" />}
                        </div>

                        {/* Bubble */}
                        <div className="flex flex-col space-y-1">
                          <div className={`p-3 rounded-2xl text-sm leading-relaxed border ${isUser ? 'bg-violet-650/15 border-violet-500/20 text-neutral-200 rounded-tr-none' : 'bg-neutral-900 border-neutral-800/80 text-neutral-200 rounded-tl-none'}`}>
                            <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                          </div>
                          <span className={`text-[9px] text-neutral-500 font-bold select-none ${isUser ? 'text-right' : 'text-left'}`}>
                            {formatMsgTime(msg.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={chatEndRef} />
            </>
          ) : null}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-950/20 select-none">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 border border-neutral-800 hover:bg-neutral-800 text-neutral-400 hover:text-white font-semibold rounded-lg text-sm transition-all duration-200 cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}

export default ConversationDrawer;
