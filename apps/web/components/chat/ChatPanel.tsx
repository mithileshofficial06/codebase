'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { Message } from '@/store/chatStore';
import { ChatMessage } from './ChatMessage';
import { StreamingIndicator } from './StreamingIndicator';

const SUGGESTED_QUESTIONS = [
  'What does auth.ts do?',
  'Which files are risky to change?',
  'How does the payment flow work?',
];

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (question: string) => void;
}

export function ChatPanel({ messages, isLoading, sendMessage }: ChatPanelProps) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    sendMessage(input);
    setInput('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSuggestedClick = (q: string) => {
    sendMessage(q);
  };

  const hasMessages = messages.length > 0;
  const hasText = input.trim().length > 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        background: '#0a0a0a',
        borderBottom: '1px solid #1a1a1a',
      }}
    >
      {/* Header */}
      <div
        style={{
          height: 40,
          padding: '0 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #141414',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: isLoading ? '#6b7280' : '#10b981',
              animation: isLoading ? 'none' : 'status-pulse 2s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontSize: 12,
              color: '#888888',
              fontWeight: 500,
              fontFamily: 'var(--font-body, sans-serif)',
            }}
          >
            Ask CodeMap
          </span>
        </div>
        <span style={{ fontSize: 11, color: '#333333', fontFamily: 'var(--font-code, monospace)' }}>
          ⌘K
        </span>
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 12,
        }}
        className="chat-scroll"
      >
        {!hasMessages && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: 8,
            }}
          >
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSuggestedClick(q)}
                style={{
                  border: '1px solid #1f1f1f',
                  background: '#0d0d0d',
                  color: '#555555',
                  fontSize: 11,
                  borderRadius: 9999,
                  padding: '6px 12px',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  fontFamily: 'var(--font-body, sans-serif)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#999999';
                  e.currentTarget.style.borderColor = '#2a2a2a';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#555555';
                  e.currentTarget.style.borderColor = '#1f1f1f';
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}

        <AnimatePresence>
          {isLoading && messages[messages.length - 1]?.content === '' && (
            <StreamingIndicator />
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Input bar */}
      <div
        style={{
          height: 44,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '0 8px 0 12px',
          background: '#0d0d0d',
          borderTop: '1px solid #141414',
          flexShrink: 0,
        }}
      >
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
          placeholder="Ask anything about this codebase..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 13,
            color: '#cccccc',
            fontFamily: 'var(--font-body, sans-serif)',
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !hasText}
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: 'none',
            background: hasText ? '#3b82f6' : '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: hasText ? 'pointer' : 'default',
            transition: 'background 150ms ease',
            flexShrink: 0,
          }}
        >
          <ArrowUp size={14} color={hasText ? '#ffffff' : '#555555'} strokeWidth={2.5} />
        </button>
      </div>

      <style>{`
        @keyframes status-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: #1a1a1a; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
      `}</style>
    </div>
  );
}

export default ChatPanel;
