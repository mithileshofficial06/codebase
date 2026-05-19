'use client';

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Message } from '@/store/chatStore';

// Regex to match filenames like auth.ts, db.tsx, payment.py, etc.
const FILE_PATTERN = /\b([\w.-]+\.(ts|tsx|js|jsx|py|css|scss|html|json|md|yaml|yml))\b/g;

function highlightFileNames(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const regex = new RegExp(FILE_PATTERN.source, 'g');
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <span
        key={`${match[1]}-${match.index}`}
        style={{
          fontFamily: 'var(--font-code, "Geist Mono", monospace)',
          fontSize: 12,
          color: '#7eb8f7',
          backgroundColor: '#0d1929',
          padding: '2px 4px',
          borderRadius: 3,
        }}
      >
        {match[1]}
      </span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  const renderedContent = useMemo(() => {
    if (isUser) return message.content;
    return highlightFileNames(message.content);
  }, [message.content, isUser]);

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 10,
        }}
      >
        <div
          style={{
            maxWidth: '85%',
            padding: '8px 12px',
            backgroundColor: '#1a1a1a',
            borderRadius: '12px 12px 2px 12px',
            fontSize: 13,
            color: '#cccccc',
            lineHeight: 1.5,
            fontFamily: 'var(--font-body, sans-serif)',
          }}
        >
          {message.content}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{
        display: 'flex',
        gap: 8,
        marginBottom: 10,
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          backgroundColor: '#1a1a1a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <span style={{ fontSize: 9, fontWeight: 700, color: '#3b82f6' }}>CM</span>
      </div>

      <div
        style={{
          maxWidth: '90%',
          fontSize: 13,
          color: '#aaaaaa',
          lineHeight: 1.7,
          fontFamily: 'var(--font-body, sans-serif)',
          minHeight: 18,
        }}
      >
        {renderedContent}
        {message.isStreaming && (
          <span
            style={{
              display: 'inline-block',
              width: 2,
              height: 14,
              backgroundColor: '#3b82f6',
              marginLeft: 2,
              verticalAlign: 'text-bottom',
              animation: 'cursor-blink 1s infinite',
            }}
          />
        )}
      </div>

      <style>{`
        @keyframes cursor-blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </motion.div>
  );
}

export default ChatMessage;
