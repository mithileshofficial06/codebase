'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { RepoData } from '@codemap/shared';
import GraphAssembly from './GraphAssembly';
import ChecklistItem, { StepStatus } from './ChecklistItem';

interface Step {
  id: string;
  label: string;
  activeLabel?: string;
  status: StepStatus;
}

interface LoadingScreenProps {
  repoUrl: string;
  onComplete: (data: RepoData) => void;
}

// Map SSE step IDs to our checklist
const STEP_DEFS = [
  { id: 'clone',   label: 'Connecting to GitHub' },
  { id: 'parse',   label: 'Parsing imports' },
  { id: 'analyze', label: 'Building dependency graph' },
  { id: 'health',  label: 'Calculating health score' },
  { id: 'graph',   label: 'Finalizing graph' },
];

export default function LoadingScreen({ repoUrl, onComplete }: LoadingScreenProps) {
  const [stepStatuses, setStepStatuses] = useState<Record<string, { status: StepStatus; message?: string }>>({});
  const [error, setError] = useState<string | null>(null);
  const [allDone, setAllDone] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const resultRef = useRef<RepoData | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (!repoUrl) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
    const sseUrl = `${apiUrl}/analyze/stream?repo=${encodeURIComponent(repoUrl)}`;

    const es = new EventSource(sseUrl);
    eventSourceRef.current = es;

    es.addEventListener('progress', (event) => {
      try {
        const data = JSON.parse(event.data);
        setStepStatuses(prev => ({
          ...prev,
          [data.step]: { status: data.status === 'completed' ? 'complete' : data.status === 'processing' ? 'active' : 'pending', message: data.message },
        }));
      } catch {}
    });

    es.addEventListener('result', (event) => {
      try {
        const data: RepoData = JSON.parse(event.data);
        resultRef.current = data;
        setAllDone(true);
      } catch {}
      es.close();
    });

    es.addEventListener('error', (event) => {
      // Try to parse a custom error message
      try {
        const data = JSON.parse((event as any).data);
        setError(data.message || 'Analysis failed');
      } catch {
        setError('Connection to analysis server failed. Is the API running?');
      }
      es.close();
    });

    es.onerror = () => {
      if (es.readyState === EventSource.CLOSED) return;
      setError('Connection to analysis server lost. Is the API running on localhost:4000?');
      es.close();
    };

    return () => {
      es.close();
    };
  }, [repoUrl]);

  // When all done, fade out then call onComplete
  useEffect(() => {
    if (!allDone || !resultRef.current) return;
    const timer = setTimeout(() => {
      setFadingOut(true);
      setTimeout(() => onComplete(resultRef.current!), 800);
    }, 600);
    return () => clearTimeout(timer);
  }, [allDone, onComplete]);

  // Build steps for display
  const steps: Step[] = useMemo(() => {
    // Determine which steps are done based on SSE events
    return STEP_DEFS.map((def) => {
      const stepData = stepStatuses[def.id];
      let status: StepStatus = 'pending';
      let activeLabel: string | undefined;

      if (stepData) {
        status = stepData.status as StepStatus;
        if (status === 'active' && stepData.message) {
          activeLabel = stepData.message;
        }
        if (status === 'complete' && stepData.message) {
          activeLabel = stepData.message;
        }
      }

      return { ...def, status, activeLabel };
    });
  }, [stepStatuses]);

  // Estimate progress (0-1) from completed steps
  const completedCount = steps.filter(s => s.status === 'complete').length;
  const progress = completedCount / STEP_DEFS.length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: fadingOut ? 0 : 1 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-40 flex flex-col items-center justify-center"
      style={{ background: '#080808' }}
    >
      {/* Graph assembly — center */}
      <div className="mb-16">
        <GraphAssembly progress={progress} bloom={allDone} />
      </div>

      {/* Checklist — bottom center */}
      <div className="flex flex-col gap-3">
        {steps.map((step) => (
          <ChecklistItem
            key={step.id}
            label={step.activeLabel || step.label}
            status={step.status}
          />
        ))}
      </div>

      {/* Error state */}
      {error && (
        <div style={{
          marginTop: 24,
          padding: '10px 16px',
          background: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.2)',
          borderRadius: 8,
          color: '#ef4444',
          fontSize: 13,
          maxWidth: 400,
          textAlign: 'center',
        }}>
          {error}
        </div>
      )}
    </motion.div>
  );
}
