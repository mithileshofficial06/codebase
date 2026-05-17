'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GraphAssembly from './GraphAssembly';
import ChecklistItem, { StepStatus } from './ChecklistItem';

interface Step {
  id: string;
  label: string;
  activeLabel?: string;
  status: StepStatus;
  fileCount?: number;
}

interface LoadingScreenProps {
  onComplete: () => void;
}

const STEP_DEFS = [
  { id: 'connect', label: 'Connecting to GitHub' },
  { id: 'fetch', label: 'Fetching file tree' },
  { id: 'parse', label: 'Parsing imports' },
  { id: 'graph', label: 'Building dependency graph' },
  { id: 'health', label: 'Calculating health score' },
];

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [fileCount, setFileCount] = useState(0);
  const [allDone, setAllDone] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);

  // Advance steps with 1.5s delay each
  useEffect(() => {
    if (currentStep > STEP_DEFS.length) return;

    const delay = currentStep === 0 ? 800 : 1500;
    const timer = setTimeout(() => {
      if (currentStep < STEP_DEFS.length) {
        setCurrentStep((s) => s + 1);
      } else {
        setAllDone(true);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [currentStep]);

  // File counter for step 2
  useEffect(() => {
    if (currentStep !== 2) return; // step index 1 = "Fetching file tree" is active when currentStep=2 means step 1 is now active
    // Actually, when currentStep=2, step index 1 (fetch) just completed and step 2 (parse) is active
    // Let's re-think: currentStep is the index of the NEXT step to activate
    // So when currentStep transitions from 1 to 2, step 1 becomes active
  }, [currentStep]);

  // Simulate file count when "Fetching file tree" is active (step index 1, active when currentStep === 1)
  useEffect(() => {
    if (currentStep !== 1) return;
    setFileCount(0);
    let count = 0;
    const interval = setInterval(() => {
      count += Math.floor(Math.random() * 8) + 2;
      if (count > 43) count = 43;
      setFileCount(count);
      if (count >= 43) clearInterval(interval);
    }, 120);
    return () => clearInterval(interval);
  }, [currentStep]);

  // When all done, fade out then call onComplete
  useEffect(() => {
    if (!allDone) return;
    const timer = setTimeout(() => {
      setFadingOut(true);
      setTimeout(onComplete, 800);
    }, 600);
    return () => clearTimeout(timer);
  }, [allDone, onComplete]);

  const steps: Step[] = useMemo(
    () =>
      STEP_DEFS.map((def, i) => {
        let status: StepStatus = 'pending';
        if (i < currentStep) status = 'complete';
        else if (i === currentStep) status = 'active';

        let activeLabel: string | undefined;
        if (def.id === 'fetch' && status === 'active') {
          activeLabel = `Fetching file tree... ${fileCount} files`;
        }

        return { ...def, status, activeLabel };
      }),
    [currentStep, fileCount]
  );

  const progress = currentStep / STEP_DEFS.length;

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
    </motion.div>
  );
}
