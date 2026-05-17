'use client';

import { useRef, useEffect } from 'react';
import { useChatStore } from '@/store/chatStore';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import StreamingIndicator from './StreamingIndicator';
import { motion } from 'framer-motion';
import { MessageSquare } from 'lucide-react';

export default function ChatPanel() {
  const { messages, isStreaming } = useChatStore();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  return (
    <div className="flex-1 flex flex-col min-h-0" style={{ background: 'var(--bg-card)' }}>
      {/* Header */}
      <div className="px-5 py-3.5 border-b flex items-center gap-2.5" style={{ borderColor: 'var(--border-subtle)' }}>
        <MessageSquare className="w-4 h-4 text-purple-400" />
        <h2 className="text-sm font-semibold text-white/70 tracking-wide uppercase">AI Assistant</h2>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-full text-center"
          >
            <MessageSquare className="w-8 h-8 text-white/10 mb-3" />
            <p className="text-sm text-white/25">Ask about the codebase</p>
            <p className="text-xs text-white/15 mt-1">e.g. "What are the most coupled files?"</p>
          </motion.div>
        )}
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isStreaming && <StreamingIndicator />}
      </div>

      {/* Input */}
      <ChatInput />
    </div>
  );
}
