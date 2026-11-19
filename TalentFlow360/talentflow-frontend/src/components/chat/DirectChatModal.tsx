import React, { useState, useEffect, useRef } from 'react';
import { X, Send, MessageSquare, Check, CheckCheck, Loader2, Sparkles, Building2 } from 'lucide-react';
import { ChatMessage } from '../../types/chat';
import chatService from '../../services/chatService';
import webSocketService from '../../services/webSocketService';

interface DirectChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicationId: number;
  jobTitle?: string;
  companyName?: string;
  counterpartName?: string;
  currentUserEmail: string;
}

export const DirectChatModal: React.FC<DirectChatModalProps> = ({
  isOpen,
  onClose,
  applicationId,
  jobTitle = 'Job Application',
  companyName = 'Hiring Team',
  counterpartName = 'Hiring Lead',
  currentUserEmail,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isOpen || !applicationId) return;

    let isMounted = true;
    setLoading(true);

    // 1. Fetch initial chat history
    chatService.getChatHistory(applicationId)
      .then((history) => {
        if (isMounted) {
          setMessages(history);
          setLoading(false);
          setTimeout(scrollToBottom, 100);
        }
      })
      .catch((err) => {
        console.error('Failed to load chat history:', err);
        if (isMounted) setLoading(false);
      });

    // 2. Subscribe to real-time WebSocket updates for this application
    const unsubscribe = webSocketService.subscribeToApplicationChat(applicationId, (newMsg: ChatMessage) => {
      if (isMounted) {
        setMessages((prev) => {
          // Prevent duplicates
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        setTimeout(scrollToBottom, 50);

        // Mark as read if message is addressed to current user
        if (newMsg.recipientEmail?.toLowerCase() === currentUserEmail.toLowerCase()) {
          chatService.markAsRead(applicationId).catch(() => {});
        }
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isOpen, applicationId, currentUserEmail]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || sending) return;

    const textToSend = inputValue.trim();
    setInputValue('');
    setSending(true);

    try {
      const savedMsg = await chatService.sendMessage({
        applicationId,
        content: textToSend,
      });

      setMessages((prev) => {
        if (prev.some((m) => m.id === savedMsg.id)) return prev;
        return [...prev, savedMsg];
      });
      setTimeout(scrollToBottom, 50);
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert(err?.response?.data?.message || 'Failed to send message. Please try again.');
      setInputValue(textToSend); // Restore unsent text
    } finally {
      setSending(false);
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200"
        style={{ height: 'min(720px, 90vh)' }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center text-indigo-300 font-bold flex-shrink-0">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="font-semibold text-white text-base truncate">{counterpartName}</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex-shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
                  Active Chat
                </span>
              </div>
              <p className="text-xs text-slate-300 truncate flex items-center space-x-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span>{companyName}</span>
                <span>•</span>
                <span className="text-slate-400 truncate">{jobTitle}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800/60 transition-colors ml-2"
            title="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 space-y-4">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2 py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              <p className="text-sm">Connecting to secure conversation...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 text-sm">Direct Messaging Connected</h4>
                <p className="text-xs text-slate-500 max-w-sm mt-1">
                  Send a message directly regarding {jobTitle}. Both parties receive instant updates and real-time alerts.
                </p>
              </div>
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = msg.senderEmail?.toLowerCase() === currentUserEmail?.toLowerCase();

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center space-x-2 text-xs text-slate-400 px-1">
                    <span className="font-medium text-slate-600">
                      {isMe ? 'You' : msg.senderName}
                    </span>
                    <span>•</span>
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600 font-semibold">
                      {msg.senderRole}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed break-words ${
                      isMe
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <div
                      className={`text-[10px] mt-1.5 flex items-center justify-end space-x-1 ${
                        isMe ? 'text-indigo-200' : 'text-slate-400'
                      }`}
                    >
                      <span>{formatTime(msg.createdAt)}</span>
                      {isMe && (
                        <span title={msg.isRead ? 'Read' : 'Sent'}>
                          {msg.isRead ? (
                            <CheckCheck className="w-3.5 h-3.5 text-emerald-300" />
                          ) : (
                            <Check className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message... (Enter to send)"
            disabled={sending}
            className="flex-1 bg-slate-100 hover:bg-slate-100/80 focus:bg-white text-slate-800 text-sm px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || sending}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white p-3 rounded-xl font-medium transition-all shadow-sm flex items-center justify-center flex-shrink-0"
            title="Send Message"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DirectChatModal;
