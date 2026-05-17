'use client';

import { ChatMessage as Message } from '@codemap/shared';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
}

// Regex to detect file paths like src/index.ts, ./utils/helpers.js etc.
const FILE_PATH_REGEX = /`([^`]*\.[a-zA-Z]{1,4})`/g;

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-purple-600/20 border border-purple-500/20 text-white/90'
            : 'bg-white/[0.04] border border-white/[0.06] text-white/80'
        }`}
        style={{
          borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
        }}
      >
        {isUser ? (
          <span>{message.content}</span>
        ) : (
          <div className="prose prose-invert prose-sm max-w-none
                         prose-p:my-1.5 prose-ul:my-1.5 prose-li:my-0.5
                         prose-code:bg-white/10 prose-code:px-1.5 prose-code:py-0.5
                         prose-code:rounded prose-code:text-purple-300 prose-code:text-xs
                         prose-code:font-mono prose-code:before:content-none prose-code:after:content-none
                         prose-pre:bg-white/[0.06] prose-pre:border prose-pre:border-white/[0.08]
                         prose-pre:rounded-lg prose-strong:text-white/90 prose-a:text-purple-400">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}
