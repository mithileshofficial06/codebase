'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReactFlow } from 'reactflow';
import { useFlowStore } from '@/store/flowStore';
import { useGraphStore } from '@/store/graphStore';
import { SystemTypeIcon } from '@/components/ui/Icons';

/**
 * Flow Visualization System
 * Handles cinematic flow playback with animations
 */
export function FlowVisualization() {
  const { activeFlow, playbackState, currentStepIndex, playbackSpeed, autoFollowCamera, nextStep } = useFlowStore();
  const { nodes } = useGraphStore();
  const { fitView, getNode } = useReactFlow();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-advance playback
  useEffect(() => {
    if (playbackState !== 'playing' || !activeFlow) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const stepDuration = (2000 / playbackSpeed); // Base 2 seconds per step

    intervalRef.current = setInterval(() => {
      if (currentStepIndex < activeFlow.steps.length - 1) {
        nextStep();
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, stepDuration);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [playbackState, currentStepIndex, activeFlow, playbackSpeed, nextStep]);

  // Camera follow
  useEffect(() => {
    if (!activeFlow || !autoFollowCamera || currentStepIndex < 0) return;

    const currentStep = activeFlow.steps[currentStepIndex];
    if (!currentStep) return;

    const node = getNode(currentStep.nodeId);
    if (!node) return;

    // Smooth camera transition to current step
    setTimeout(() => {
      fitView({
        nodes: [node],
        duration: 800,
        padding: 0.8,
      });
    }, 100);
  }, [currentStepIndex, activeFlow, autoFollowCamera, fitView, getNode]);

  if (!activeFlow || playbackState === 'idle') return null;

  const currentStep = activeFlow.steps[currentStepIndex];

  return (
    <>
      {/* Backdrop dimming during flow playback */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 bg-black/60 pointer-events-none z-10"
        style={{ backdropFilter: 'blur(3px)' }}
      />

      {/* Step indicator */}
      <AnimatePresence mode="wait">
        {currentStep && (
          <motion.div
            key={currentStep.nodeId}
            initial={{ opacity: 0, y: 30, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.92 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 max-w-2xl"
          >
            <div className="bg-[#0d0d0d]/98 backdrop-blur-2xl border border-[#1f1f1f] rounded-2xl shadow-2xl p-5">
              <div className="flex items-start gap-4">
                {/* Step number */}
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#f59e0b] to-[#ef4444] flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-[#f59e0b]/20">
                  {currentStepIndex + 1}
                </div>

                {/* Step info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2.5 mb-2">
                    <h4 className="text-white font-semibold text-base">{currentStep.nodeLabel}</h4>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#1a1a1a] border border-[#333] rounded-lg">
                      <SystemTypeIcon type={currentStep.systemType} />
                      <span className="text-xs text-[#888] font-medium">{currentStep.systemType}</span>
                    </div>
                  </div>
                  <p className="text-[#aaa] text-sm mb-2.5 leading-relaxed">{currentStep.description}</p>
                  <p className="text-[#666] text-xs font-mono truncate">{currentStep.nodePath}</p>
                </div>

                {/* Pulse animation */}
                <div className="flex-shrink-0 relative w-10 h-10">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-[#f59e0b]"
                    animate={{
                      scale: [1, 1.8, 1],
                      opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                      duration: 2.5,
                      repeat: Infinity,
                      ease: 'easeOut',
                    }}
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#ef4444] opacity-90 shadow-lg shadow-[#f59e0b]/30" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Flow progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[28rem]"
      >
        <div className="bg-[#0d0d0d]/98 backdrop-blur-2xl border border-[#1f1f1f] rounded-full px-5 py-2.5 shadow-2xl">
          <div className="flex items-center gap-3.5">
            <span className="text-[#888] text-xs font-semibold whitespace-nowrap tabular-nums">
              {currentStepIndex + 1}/{activeFlow.steps.length}
            </span>
            <div className="flex-1 h-2 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#1f1f1f]">
              <motion.div
                className="h-full bg-gradient-to-r from-[#f59e0b] via-[#f97316] to-[#ef4444] relative"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStepIndex + 1) / activeFlow.steps.length) * 100}%` }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Animated shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </motion.div>
            </div>
            <span className="text-[#888] text-xs font-semibold tabular-nums">
              {Math.round(((currentStepIndex + 1) / activeFlow.steps.length) * 100)}%
            </span>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </>
  );
}
