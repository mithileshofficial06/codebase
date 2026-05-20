'use client';

import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp, Sparkles } from 'lucide-react';
import { Message } from '@/store/chatStore';
import { ChatMessage } from './ChatMessage';
import { StreamingIndicator } from './StreamingIndicator';
import { useGraphStore } from '@/store/graphStore';
import { useFlowStore } from '@/store/flowStore';
import { ClickableReference } from '@/lib/graphReactionEngine';

interface ChatPanelProps {
  messages: Message[];
  isLoading: boolean;
  sendMessage: (question: string) => void;
  suggestedQuestions: string[];
  onReferenceClick?: (ref: ClickableReference) => void;
}

export function ChatPanel({ messages, isLoading, sendMessage, suggestedQuestions, onReferenceClick }: ChatPanelProps) {
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
          height: 44,
          padding: '0 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #141414',
          flexShrink: 0,
          background: 'linear-gradient(180deg, #0a0a0a 0%, #0d0d0d 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: isLoading ? 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: isLoading ? 'none' : '0 0 8px rgba(16,185,129,0.4)',
              animation: isLoading ? 'none' : 'status-pulse 2s ease-in-out infinite',
            }}
          />
          <span
            style={{
              fontSize: 12,
              color: '#999',
              fontWeight: 600,
              fontFamily: '"Geist", -apple-system, sans-serif',
              letterSpacing: '-0.01em',
            }}
          >
            Graph-Aware AI
          </span>
        </div>
        <Sparkles size={13} color="#555" />
      </div>

      {/* Messages area */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 14,
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
              gap: 10,
              padding: '0 12px',
            }}
          >
            <div style={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
              boxShadow: '0 0 20px rgba(59,130,246,0.3)',
            }}>
              <Sparkles size={22} color="#ffffff" />
            </div>
            <p style={{
              fontSize: 11,
              color: '#666',
              textAlign: 'center',
              marginBottom: 12,
              lineHeight: 1.5,
            }}>
              Ask me about architecture, flows, risks, or where to start exploring
            </p>
            {suggestedQuestions.map((q, idx) => (
              <motion.button
                key={q}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => handleSuggestedClick(q)}
                style={{
                  border: '1px solid #1f1f1f',
                  background: '#0d0d0d',
                  color: '#777',
                  fontSize: 11,
                  borderRadius: 9999,
                  padding: '7px 14px',
                  cursor: 'pointer',
                  transition: 'all 200ms ease',
                  fontFamily: '"Geist", -apple-system, sans-serif',
                  fontWeight: 500,
                  width: '100%',
                  textAlign: 'left',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#aaa';
                  e.currentTarget.style.borderColor = '#2a2a2a';
                  e.currentTarget.style.background = '#111';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#777';
                  e.currentTarget.style.borderColor = '#1f1f1f';
                  e.currentTarget.style.background = '#0d0d0d';
                }}
              >
                {q}
              </motion.button>
            ))}
          </div>
        )}

        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} onReferenceClick={onReferenceClick} />
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
          minHeight: 50,
          display: 'flex',
          alignItems: 'center',
          gap: 9,
          padding: '0 10px 0 14px',
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
          placeholder="Ask about this codebase..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: 13,
            color: '#d4d4d4',
            fontFamily: '"Geist", -apple-system, sans-serif',
            fontWeight: 450,
          }}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading || !hasText}
          style={{
            width: 30,
            height: 30,
            borderRadius: '50%',
            border: 'none',
            background: hasText ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' : '#1a1a1a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: hasText ? 'pointer' : 'default',
            transition: 'all 200ms ease',
            flexShrink: 0,
            boxShadow: hasText ? '0 0 12px rgba(59,130,246,0.3)' : 'none',
          }}
        >
          <ArrowUp size={15} color={hasText ? '#ffffff' : '#555555'} strokeWidth={2.5} />
        </button>
      </div>

      <style>{`
        @keyframes status-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .chat-scroll::-webkit-scrollbar { width: 4px; }
        .chat-scroll::-webkit-scrollbar-track { background: #1a1a1a; }
        .chat-scroll::-webkit-scrollbar-thumb { background: #2a2a2a; border-radius: 2px; }
      `}</style>
    </div>
  );
}

export default ChatPanel;
