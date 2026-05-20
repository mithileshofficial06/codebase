'use client';

import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Message } from '@/store/chatStore';
import { useGraphStore } from '@/store/graphStore';
import { useFlowStore } from '@/store/flowStore';
import { extractClickableReferences, ClickableReference } from '@/lib/graphReactionEngine';

interface ChatMessageProps {
  message: Message;
  onReferenceClick?: (ref: ClickableReference) => void;
}

export function ChatMessage({ message, onReferenceClick }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const { nodes, clusters } = useGraphStore();
  const { detectedFlows } = useFlowStore();

  // Extract clickable references from AI response
  const clickableRefs = useMemo(() => {
    if (isUser || !message.content) return [];
    return extractClickableReferences(message.content, nodes, clusters, detectedFlows);
  }, [message.content, isUser, nodes, clusters, detectedFlows]);

  // Handle reference click
  const handleReferenceClick = useCallback((ref: ClickableReference) => {
    if (onReferenceClick) {
      onReferenceClick(ref);
    }
  }, [onReferenceClick]);

  // Render content with clickable references
  const renderedContent = useMemo(() => {
    if (isUser) return message.content;
    if (clickableRefs.length === 0) return message.content;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    clickableRefs.forEach((ref, idx) => {
      // Add text before reference
      if (ref.startIndex > lastIndex) {
        parts.push(message.content.slice(lastIndex, ref.startIndex));
      }

      // Add clickable reference
      const colorMap = {
        file: '#7eb8f7',
        cluster: '#f59e0b',
        flow: '#10b981',
      };

      parts.push(
        <button
          key={`ref-${idx}`}
          onClick={() => handleReferenceClick(ref)}
          style={{
            fontFamily: '"Geist Mono", "SF Mono", monospace',
            fontSize: 12,
            color: colorMap[ref.type],
            backgroundColor: ref.type === 'file' ? '#0d1929' : ref.type === 'cluster' ? '#1a0f00' : '#001a0f',
            padding: '2px 5px',
            borderRadius: 4,
            border: 'none',
            cursor: 'pointer',
            transition: 'all 150ms ease',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = ref.type === 'file' ? '#1a2d4d' : ref.type === 'cluster' ? '#2d1f00' : '#002d1a';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = ref.type === 'file' ? '#0d1929' : ref.type === 'cluster' ? '#1a0f00' : '#001a0f';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
          title={`Click to ${ref.type === 'file' ? 'zoom to file' : ref.type === 'cluster' ? 'explore module' : 'play flow'}`}
        >
          {ref.text}
        </button>
      );

      lastIndex = ref.endIndex;
    });

    // Add remaining text
    if (lastIndex < message.content.length) {
      parts.push(message.content.slice(lastIndex));
    }

    return parts;
  }, [message.content, isUser, clickableRefs]);

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          marginBottom: 12,
        }}
      >
        <div
          style={{
            maxWidth: '85%',
            padding: '9px 13px',
            backgroundColor: '#1a1a1a',
            borderRadius: '14px 14px 3px 14px',
            fontSize: 13,
            color: '#d4d4d4',
            lineHeight: 1.5,
            fontFamily: '"Geist", -apple-system, sans-serif',
            fontWeight: 450,
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
        gap: 10,
        marginBottom: 12,
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          marginTop: 2,
          boxShadow: '0 0 8px rgba(59,130,246,0.3)',
        }}
      >
        <span style={{ fontSize: 10, fontWeight: 700, color: '#ffffff' }}>CM</span>
      </div>

      <div
        style={{
          maxWidth: '90%',
          fontSize: 13,
          color: '#b8b8b8',
          lineHeight: 1.7,
          fontFamily: '"Geist", -apple-system, sans-serif',
          minHeight: 18,
          fontWeight: 450,
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
              marginLeft: 3,
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
