import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Send, X, UserCheck } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CONFIG = {
  API_URL: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/webhook`,
  SESSION_KEY: 'leadbot_session_id',
  MESSAGES_KEY: 'leadbot_messages',
  SUPABASE_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
};

interface Message {
  id: string;
  text: string;
  sender: 'bot' | 'user';
  replies?: { title: string; payload: string }[];
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const hasInitialized = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Init session + restore messages from localStorage ──
  useEffect(() => {
    let sid = localStorage.getItem(CONFIG.SESSION_KEY);
    if (!sid) {
      sid = 'web_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      localStorage.setItem(CONFIG.SESSION_KEY, sid);
    }
    setSessionId(sid);

    // Restore previous messages so history survives page refresh
    const saved = localStorage.getItem(CONFIG.MESSAGES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Message[];
        // Strip replies from all restored messages so old buttons can't be clicked
        setMessages(parsed.map(m => ({ ...m, replies: [] })));
      } catch {
        localStorage.removeItem(CONFIG.MESSAGES_KEY);
      }
    }
  }, []);

  // ── Persist messages to localStorage ──
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(CONFIG.MESSAGES_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  // ── Scroll to bottom ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // ── Core API request ──
  const handleRequest = useCallback(async (text: string | null, payload: string | null = null) => {
    if (!sessionId) return;
    setIsTyping(true);

    try {
      const res = await fetch(CONFIG.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': CONFIG.SUPABASE_KEY,
          'Authorization': `Bearer ${CONFIG.SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          sessionId,
          messageText: payload ? null : text,
          payload,
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const botText = data.text || data.message || data.response || '';
      if (!botText && (!data.replies || data.replies.length === 0)) {
        throw new Error('Empty response');
      }

      const botMsg: Message = {
        id: crypto.randomUUID(),
        text: botText,
        sender: 'bot',
        replies: data.replies ?? [],
      };

      setMessages(prev => [...prev, botMsg]);
    } catch {
      setMessages(prev => [...prev, {
        id: crypto.randomUUID(),
        text: "I'm having a bit of trouble connecting. Please try again in a moment! 🔌",
        sender: 'bot',
        replies: [],
      }]);
    } finally {
      setIsTyping(false);
    }
  }, [sessionId]);

  // ── Open: send RESTART only on first open ever (no messages yet) ──
  useEffect(() => {
    if (isOpen && sessionId && messages.length === 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      handleRequest(null, 'RESTART');
    }
  }, [isOpen, sessionId, messages.length, handleRequest]);

  // ── Send typed message ──
  const onSend = () => {
    if (!inputValue.trim() || isTyping) return;
    const userMsg: Message = {
      id: crypto.randomUUID(),
      text: inputValue.trim(),
      sender: 'user',
      replies: [],
    };
    setMessages(prev => [...prev, userMsg]);
    handleRequest(inputValue.trim());
    setInputValue('');
  };

  // ── Quick reply click — clear buttons from the bot message by id ──
  const handleReplyClick = (botMsgId: string, title: string, payload: string) => {
    if (isTyping) return;
    // Add user message
    setMessages(prev => [
      ...prev.map(m => m.id === botMsgId ? { ...m, replies: [] } : m), // clear clicked buttons
      { id: crypto.randomUUID(), text: title, sender: 'user' as const, replies: [] },
    ]);
    handleRequest(null, payload);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="absolute bottom-20 right-0 w-[min(calc(100vw-32px),400px)] h-[min(calc(100vh-120px),600px)] bg-bg-card/80 backdrop-blur-2xl border border-border rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 border-b border-border bg-bg-secondary/30 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary leading-tight">Virtual Assistant</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-[11px] text-text-secondary uppercase tracking-wider font-medium">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-bg-secondary rounded-full transition-colors text-text-secondary"
                aria-label="Close chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 pb-24 space-y-4 scrollbar-hide">
              {messages.map((msg) => (
                <div key={msg.id} className={cn('flex flex-col', msg.sender === 'user' ? 'items-end' : 'items-start')}>
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm',
                      msg.sender === 'user'
                        ? 'bg-primary text-black font-medium rounded-br-none'
                        : 'bg-bg-secondary text-text-primary border border-border rounded-bl-none'
                    )}
                    style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {msg.text}
                  </motion.div>

                  {/* Quick reply buttons */}
                  {msg.replies && msg.replies.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="flex flex-wrap gap-2 mt-2 max-w-[85%]"
                    >
                      {msg.replies.map((reply, i) => (
                        <button
                          key={i}
                          onClick={() => handleReplyClick(msg.id, reply.title, reply.payload)}
                          disabled={isTyping}
                          className="px-3 py-1.5 rounded-full border border-primary/40 text-primary text-xs font-medium hover:bg-primary hover:text-black transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                        >
                          {reply.title}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-2">
                  <div className="bg-bg-secondary border border-border rounded-2xl rounded-bl-none px-4 py-3 flex gap-1">
                    {[0, 0.2, 0.4].map((delay, i) => (
                      <motion.span
                        key={i}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ repeat: Infinity, duration: 1.2, delay }}
                        className="w-1.5 h-1.5 bg-primary/60 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-bg-card/90 backdrop-blur-md border-t border-border">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && onSend()}
                  placeholder={isTyping ? 'Waiting for response...' : 'Type a message...'}
                  disabled={isTyping}
                  className="flex-1 bg-bg-secondary border border-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-primary/50 transition-colors placeholder:text-text-secondary/40 disabled:opacity-50"
                />
                <button
                  onClick={onSend}
                  disabled={!inputValue.trim() || isTyping}
                  className="w-10 h-10 bg-primary text-black rounded-xl flex items-center justify-center disabled:opacity-40 disabled:grayscale transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launch bubble */}
      <motion.button
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        onClick={() => setIsOpen(prev => !prev)}
        className={cn(
          'w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-colors duration-300 relative',
          isOpen ? 'bg-bg-card border border-border text-text-primary' : 'bg-primary text-black'
        )}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={26} />
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageSquare size={26} />
            </motion.span>
          )}
        </AnimatePresence>
        {/* Unread dot — only when closed */}
        {!isOpen && (
          <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-bg" />
        )}
      </motion.button>
    </div>
  );
}
