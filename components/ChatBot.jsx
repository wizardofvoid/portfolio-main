'use client';

import { useState, useRef, useEffect } from 'react';

// SVG Icons
const ChatIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const SendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

// Generate a random ID for session tracking
function generateSessionId() {
  return Math.random().toString(36).substring(2, 15);
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ role: 'bot', content: "Hi, I'm Ayush's AI assistant. Ask me anything about his work, skills, or experience!" }]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(generateSessionId);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages, sessionId }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      // Add a placeholder for the bot's response
      setMessages((prev) => [...prev, { role: 'bot', content: '' }]);

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const text = decoder.decode(value, { stream: true });
          setMessages((prev) => {
            const updated = [...prev];
            const lastMessage = { ...updated[updated.length - 1] };
            lastMessage.content += text;
            updated[updated.length - 1] = lastMessage;
            return updated;
          });
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { role: 'bot', content: "Sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Convert URLs in text to clickable links safely
  const formatText = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) => {
      if (part.match(urlRegex)) {
        return <a key={i} href={part} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'underline', color: 'var(--accent)' }}>{part}</a>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <>
      {/* Floating Bubble */}
      <button
        className="chat-bubble"
        onClick={() => setIsOpen(true)}
        aria-label="Open chat"
        data-magnetic
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--card-grad)',
          border: '1px solid var(--border)',
          zIndex: 9500,
          display: isOpen ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent)',
          cursor: 'none',
          boxShadow: '0 8px 24px var(--shadow)',
          transformStyle: 'preserve-3d',
        }}
      >
        <span style={{ width: '24px', height: '24px', display: 'block' }}>
          <ChatIcon />
        </span>
        {/* Pulse dot */}
        <span style={{ position: 'absolute', top: '14px', right: '14px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulseGlow 2s infinite' }} />
      </button>

      {/* Expanded Panel */}
      <div
        className="chat-panel"
        style={{
          position: 'fixed',
          bottom: '28px',
          right: '28px',
          width: 'min(420px, calc(100vw - 32px))',
          height: 'min(560px, calc(100vh - 100px))',
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRadius: '16px',
          zIndex: 9500,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 12px 32px var(--shadow)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.95)',
          transition: 'opacity 0.35s cubic-bezier(0.16, 1, 0.3, 1), transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', flex: 'none' }}>
          <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: '12px', letterSpacing: '2px', color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulseGlow 2s infinite' }} />
            AS<span style={{ color: 'var(--text-4)' }}>/</span><span style={{ color: 'var(--text-3)' }}>chat</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'none', padding: '4px', display: 'flex' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; }}
            aria-label="Close chat"
          >
            <span style={{ width: '18px', height: '18px' }}><CloseIcon /></span>
          </button>
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <div
                style={{
                  maxWidth: '85%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '12px',
                  borderBottomLeftRadius: msg.role === 'bot' ? '4px' : '12px',
                  background: msg.role === 'user' ? 'var(--accent-tint)' : 'var(--surface)',
                  color: msg.role === 'user' ? 'var(--text)' : 'var(--text-2)',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {formatText(msg.content)}
              </div>
            </div>
          ))}
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ padding: '12px 16px', borderRadius: '12px', borderBottomLeftRadius: '4px', background: 'var(--surface)' }}>
                <div className="chat-typing" style={{ display: 'flex', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSubmit} style={{ padding: '16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '12px', background: 'var(--bg)', flex: 'none' }}>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            style={{
              flex: 1,
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '10px 14px',
              color: 'var(--text)',
              fontSize: '14px',
              fontFamily: "'Space Grotesk', sans-serif",
              outline: 'none',
              cursor: 'none'
            }}
            onFocus={(e) => { e.target.style.borderColor = 'color-mix(in oklab, var(--accent) 50%, transparent)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border)'; }}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              background: input.trim() && !isLoading ? 'var(--accent)' : 'var(--surface)',
              color: input.trim() && !isLoading ? 'var(--bg)' : 'var(--text-4)',
              border: 'none',
              borderRadius: '8px',
              width: '42px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'none',
              transition: 'background 0.2s',
            }}
          >
            <span style={{ width: '18px', height: '18px' }}><SendIcon /></span>
          </button>
        </form>
      </div>
    </>
  );
}
