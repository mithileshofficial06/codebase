'use client';

import { useCallback, useRef } from 'react';
import { useChatStore, Message } from '@/store/chatStore';

interface GraphData {
  nodes: Array<{ id: string; label: string; nodeType: string; commitFrequency: number; fileSize: number }>;
  edges: Array<{ id: string; source: string; target: string; weight: number }>;
}

function buildGraphContext(data: GraphData): string {
  const nodesSummary = data.nodes.map(n =>
    `${n.label} [${n.nodeType}] commits:${n.commitFrequency} size:${n.fileSize}b`
  ).join('\n');

  const edgesSummary = data.edges.map(e =>
    `${e.source}→${e.target} (weight:${e.weight})`
  ).join(', ');

  return `Nodes:\n${nodesSummary}\n\nEdges: ${edgesSummary}`;
}

export function useChat(graphData: GraphData) {
  const {
    messages,
    isLoading,
    addMessage,
    updateLastMessage,
    finishStreaming,
    setLoading,
  } = useChatStore();

  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (question: string) => {
    if (!question.trim() || isLoading) return;

    // 1. Add user message
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: question.trim(),
      timestamp: new Date(),
    };
    addMessage(userMsg);

    // 2. Add empty streaming assistant message
    const assistantMsg: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };
    addMessage(assistantMsg);
    setLoading(true);

    // 3. Call API
    abortRef.current = new AbortController();
    try {
      const graphContext = buildGraphContext(graphData);

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, graphContext }),
        signal: abortRef.current.signal,
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();
      let accumulated = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        updateLastMessage(accumulated);
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        updateLastMessage('Something went wrong. Please try again.');
      }
    } finally {
      finishStreaming();
      setLoading(false);
      abortRef.current = null;
    }
  }, [graphData, isLoading, addMessage, updateLastMessage, finishStreaming, setLoading]);

  return { messages, isLoading, sendMessage };
}
