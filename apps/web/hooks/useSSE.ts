'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { SSEProgressEvent, SSEStepId, RepoData } from '@codemap/shared';

interface SSEState {
  steps: Record<SSEStepId, SSEProgressEvent>;
  result: RepoData | null;
  error: string | null;
  isConnected: boolean;
  isComplete: boolean;
}

const STEP_IDS: SSEStepId[] = ['clone', 'parse', 'analyze', 'health', 'graph'];

const initialSteps: Record<SSEStepId, SSEProgressEvent> = {
  clone: { step: 'clone', status: 'pending', message: 'Cloning repository' },
  parse: { step: 'parse', status: 'pending', message: 'Parsing dependencies' },
  analyze: { step: 'analyze', status: 'pending', message: 'Analyzing structure' },
  health: { step: 'health', status: 'pending', message: 'Computing health score' },
  graph: { step: 'graph', status: 'pending', message: 'Building graph' },
};

export function useSSE(repoUrl: string | null): SSEState {
  const [state, setState] = useState<SSEState>({
    steps: { ...initialSteps },
    result: null,
    error: null,
    isConnected: false,
    isComplete: false,
  });
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!repoUrl) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const url = `${apiUrl}/analyze/stream?repo=${encodeURIComponent(repoUrl)}`;

    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.onopen = () => {
      setState(prev => ({ ...prev, isConnected: true, error: null }));
    };

    es.addEventListener('progress', (event) => {
      const data: SSEProgressEvent = JSON.parse(event.data);
      setState(prev => ({
        ...prev,
        steps: {
          ...prev.steps,
          [data.step]: data,
        },
      }));
    });

    es.addEventListener('result', (event) => {
      const data: RepoData = JSON.parse(event.data);
      setState(prev => ({
        ...prev,
        result: data,
        isComplete: true,
      }));
      es.close();
    });

    es.addEventListener('error', (event) => {
      if (event instanceof MessageEvent) {
        const data = JSON.parse(event.data);
        setState(prev => ({
          ...prev,
          error: data.message || 'Analysis failed',
        }));
      }
      es.close();
    });

    es.onerror = () => {
      setState(prev => ({ ...prev, isConnected: false }));
      es.close();
    };
  }, [repoUrl]);

  useEffect(() => {
    connect();
    return () => {
      eventSourceRef.current?.close();
    };
  }, [connect]);

  return state;
}

export { STEP_IDS };
export type { SSEState };
