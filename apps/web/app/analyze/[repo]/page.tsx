'use client';

import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import LoadingScreen from '@/components/loading/LoadingScreen';
import AppLayout from '@/components/AppLayout';

export default function AnalyzePage() {
  const [phase, setPhase] = useState<'loading' | 'app'>('loading');

  const handleLoadingComplete = useCallback(() => {
    setPhase('app');
  }, []);

  return (
    <AnimatePresence mode="wait">
      {phase === 'loading' && (
        <LoadingScreen key="loading" onComplete={handleLoadingComplete} />
      )}
      {phase === 'app' && <AppLayout key="app" />}
    </AnimatePresence>
  );
}
