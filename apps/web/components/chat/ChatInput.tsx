'use client';

import { useState, useRef } from 'react';
import { useChatStore } from '@/store/chatStore';
import { ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChatInput() {
  const [input, setInput] = useState('');
  const { sendMessage, isStreaming } = useChatStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input.trim());
    setInput('');
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t" style={{ borderColor: 'var(--border-subtle)' }}>
      <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] rounded-full px-4 py-1.5
                      focus-within:border-purple-500/30 transition-colors">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about the codebase…"
          disabled={isStreaming}
          className="flex-1 bg-transparent text-sm text-white/80 placeholder:text-white/20
                     focus:outline-none disabled:opacity-50 py-1"
        />
        <motion.button
          type="submit"
          disabled={isStreaming || !input.trim()}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0
                     bg-purple-600/60 text-white/80
                     disabled:opacity-30 disabled:cursor-not-allowed
                     hover:bg-purple-600/80 transition-colors"
        >
          <ArrowUp className="w-3.5 h-3.5" />
        </motion.button>
      </div>
    </form>
  );
}
