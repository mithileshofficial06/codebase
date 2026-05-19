'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { RepoData } from '@codemap/shared';
import LoadingScreen from '@/components/loading/LoadingScreen';
import AppLayout from '@/components/AppLayout';

export default function AnalyzePage() {
  const params = useParams();
  const [phase, setPhase] = useState<'loading' | 'app'>('loading');
  const [repoData, setRepoData] = useState<RepoData | null>(null);

  // Decode the repo URL from route params
  const repoUrl = decodeURIComponent((params.repo as string) || '');

  const handleLoadingComplete = useCallback((data: RepoData) => {
    setRepoData(data);
    setPhase('app');
  }, []);

  return (
    <AnimatePresence mode="wait">
      {phase === 'loading' && (
        <LoadingScreen
          key="loading"
          repoUrl={repoUrl}
          onComplete={handleLoadingComplete}
        />
      )}
      {phase === 'app' && repoData && (
        <AppLayout key="app" repoData={repoData} />
      )}
    </AnimatePresence>
  );
}
