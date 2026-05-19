'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, ChevronRight, Zap, X } from 'lucide-react';
import { useFlowStore } from '@/store/flowStore';
import { DetectedFlow } from '@/lib/flowDetection';

/**
 * Flow Panel - Flow selection and playback controls
 */
export function FlowPanel() {
  const {
    detectedFlows,
    activeFlow,
    playbackState,
    currentStepIndex,
    playbackSpeed,
    autoFollowCamera,
    flowPanelOpen,
    selectFlow,
    startPlayback,
    pausePlayback,
    resumePlayback,
    stopPlayback,
    setPlaybackSpeed,
    toggleAutoFollow,
    toggleFlowPanel,
  } = useFlowStore();

  if (!flowPanelOpen) {
    return (
      <motion.button
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={toggleFlowPanel}
        className="fixed right-6 top-20 z-40 flex items-center gap-2 px-4 py-2 bg-[#0d0d0d] border border-[#1f1f1f] rounded-lg text-white text-sm font-medium hover:border-[#333] transition-all duration-200 shadow-lg"
      >
        <Zap size={16} className="text-[#f59e0b]" />
        Flows
        <span className="px-2 py-0.5 bg-[#1a1a1a] border border-[#333] rounded text-xs text-[#888]">
          {detectedFlows.length}
        </span>
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed right-6 top-20 bottom-6 z-40 w-96 bg-[#0d0d0d] border border-[#1f1f1f] rounded-xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1f1f1f]">
        <div className="flex items-center gap-2">
          <Zap size={18} className="text-[#f59e0b]" />
          <h3 className="text-white font-semibold">Flow Explorer</h3>
        </div>
        <button
          onClick={toggleFlowPanel}
          className="text-[#666] hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Active Flow Playback */}
      {activeFlow && (
        <div className="px-4 py-3 border-b border-[#1f1f1f] bg-[#0a0a0a]">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{activeFlow.icon}</span>
                <h4 className="text-white font-medium text-sm">{activeFlow.name}</h4>
              </div>
              <p className="text-[#888] text-xs">{activeFlow.description}</p>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            {playbackState === 'idle' || playbackState === 'completed' ? (
              <button
                onClick={startPlayback}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#f59e0b] hover:bg-[#f59e0b]/90 text-black rounded-lg text-sm font-medium transition-colors"
              >
                <Play size={14} fill="currentColor" />
                {playbackState === 'completed' ? 'Replay' : 'Play'}
              </button>
            ) : playbackState === 'playing' ? (
              <button
                onClick={pausePlayback}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Pause size={14} />
                Pause
              </button>
            ) : (
              <button
                onClick={resumePlayback}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#f59e0b] hover:bg-[#f59e0b]/90 text-black rounded-lg text-sm font-medium transition-colors"
              >
                <Play size={14} fill="currentColor" />
                Resume
              </button>
            )}

            <button
              onClick={stopPlayback}
              className="p-1.5 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white rounded-lg transition-colors"
              title="Reset"
            >
              <RotateCcw size={14} />
            </button>

            {/* Speed Control */}
            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="px-2 py-1.5 bg-[#1a1a1a] border border-[#333] text-white rounded-lg text-xs outline-none hover:border-[#444] transition-colors"
            >
              <option value={0.5}>0.5x</option>
              <option value={1}>1x</option>
              <option value={1.5}>1.5x</option>
              <option value={2}>2x</option>
            </select>

            {/* Auto-follow toggle */}
            <button
              onClick={toggleAutoFollow}
              className={`p-1.5 rounded-lg text-xs transition-colors ${
                autoFollowCamera
                  ? 'bg-[#f59e0b]/20 border border-[#f59e0b]/50 text-[#f59e0b]'
                  : 'bg-[#1a1a1a] border border-[#333] text-[#666]'
              }`}
              title="Auto-follow camera"
            >
              📹
            </button>
          </div>

          {/* Progress */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-[#888] mb-1">
              <span>Step {currentStepIndex + 1} of {activeFlow.steps.length}</span>
              <span>{Math.round(((currentStepIndex + 1) / activeFlow.steps.length) * 100)}%</span>
            </div>
            <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#f59e0b] to-[#ef4444]"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStepIndex + 1) / activeFlow.steps.length) * 100}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Flow List */}
      <div className="flex-1 overflow-y-auto">
        {detectedFlows.length === 0 ? (
          <div className="px-4 py-8 text-center text-[#666]">
            <Zap size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No flows detected</p>
            <p className="text-xs mt-1">Analyzing repository structure...</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {detectedFlows.map((flow) => (
              <FlowCard
                key={flow.id}
                flow={flow}
                isActive={activeFlow?.id === flow.id}
                onSelect={() => selectFlow(flow)}
              />
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Individual Flow Card
 */
function FlowCard({
  flow,
  isActive,
  onSelect,
}: {
  flow: DetectedFlow;
  isActive: boolean;
  onSelect: () => void;
}) {
  const complexityColors = {
    low: 'text-[#10b981] bg-[#10b981]/10 border-[#10b981]/30',
    medium: 'text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/30',
    high: 'text-[#ef4444] bg-[#ef4444]/10 border-[#ef4444]/30',
  };

  const riskColors = {
    low: 'text-[#10b981]',
    medium: 'text-[#f59e0b]',
    high: 'text-[#ef4444]',
  };

  return (
    <motion.button
      onClick={onSelect}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
        isActive
          ? 'bg-[#1a1a1a] border-[#f59e0b]/50 shadow-lg'
          : 'bg-[#0a0a0a] border-[#1f1f1f] hover:border-[#333] hover:bg-[#111]'
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl flex-shrink-0">{flow.icon}</span>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-medium text-sm mb-1 truncate">
            {flow.name}
          </h4>
          <p className="text-[#888] text-xs mb-2 line-clamp-2">
            {flow.description}
          </p>

          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-2 py-0.5 rounded text-xs border ${complexityColors[flow.complexity]}`}>
              {flow.complexity}
            </span>
            <span className="text-[#666] text-xs">
              {flow.steps.length} steps
            </span>
            <span className={`text-xs ${riskColors[flow.estimatedRisk]}`}>
              {flow.estimatedRisk} risk
            </span>
          </div>
        </div>
        {isActive && (
          <ChevronRight size={16} className="text-[#f59e0b] flex-shrink-0" />
        )}
      </div>
    </motion.button>
  );
}
