'use client';

import { useCallback, useRef } from 'react';
import { useChatStore, Message } from '@/store/chatStore';
import { GraphNode, GraphEdge } from '@codemap/shared/types';
import { ClusterNode, ClusterEdge } from '@/lib/architectureEngine';
import { DetectedFlow } from '@/lib/flowDetection';
import { buildGraphAwareContext, formatContextForAI } from '@/lib/graphAwareContext';
import { detectQuestionIntent } from '@/lib/graphReactionEngine';

interface GraphAwareData {
  nodes: GraphNode[];
  edges: GraphEdge[];
  clusters: ClusterNode[];
  clusterEdges: ClusterEdge[];
  flows: DetectedFlow[];
  activeFlow: DetectedFlow | null;
  viewLevel: string;
  healthMetrics: any;
}

export function useChat(graphData: GraphAwareData) {
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

    // 3. Build graph-aware context
    const context = buildGraphAwareContext(
      graphData.nodes,
      graphData.edges,
      graphData.clusters,
      graphData.clusterEdges,
      graphData.flows,
      graphData.activeFlow,
      graphData.viewLevel,
      graphData.healthMetrics
    );
    
    const graphContext = formatContextForAI(context);
    const intent = detectQuestionIntent(question);

    // 4. Call API
    abortRef.current = new AbortController();
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question, 
          graphContext,
          questionIntent: intent.type,
        }),
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
