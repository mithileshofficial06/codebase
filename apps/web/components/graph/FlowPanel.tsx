'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Zap, X } from 'lucide-react';
import { useFlowStore } from '@/store/flowStore';
import { DetectedFlow } from '@/lib/flowDetection';
import { FlowIcons, ComplexityIndicator, RiskIndicator, PlaybackIcons } from '@/components/ui/Icons';

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
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="fixed right-6 top-20 bottom-6 z-40 w-96 bg-[#0d0d0d]/95 backdrop-blur-2xl border border-[#1f1f1f] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1f1f1f] bg-[#0a0a0a]/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#f59e0b] to-[#ef4444] flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <h3 className="text-white font-semibold text-base">Flow Explorer</h3>
        </div>
        <button
          onClick={toggleFlowPanel}
          className="text-[#666] hover:text-white hover:bg-[#1a1a1a] p-1.5 rounded-lg transition-all"
        >
          <X size={18} />
        </button>
      </div>

      {/* Active Flow Playback */}
      {activeFlow && (
        <div className="px-5 py-4 border-b border-[#1f1f1f] bg-gradient-to-b from-[#0a0a0a]/80 to-[#0d0d0d]/50">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="flex-shrink-0">
                  {activeFlow.icon === 'Authentication' && <FlowIcons.Authentication />}
                  {activeFlow.icon === 'ApiRequest' && <FlowIcons.ApiRequest />}
                  {activeFlow.icon === 'Registration' && <FlowIcons.Registration />}
                  {activeFlow.icon === 'Database' && <FlowIcons.Database />}
                  {activeFlow.icon === 'UiRender' && <FlowIcons.UiRender />}
                </div>
                <h4 className="text-white font-semibold text-sm">{activeFlow.name}</h4>
              </div>
              <p className="text-[#888] text-xs leading-relaxed">{activeFlow.description}</p>
            </div>
          </div>

          {/* Playback Controls */}
          <div className="flex items-center gap-2">
            {playbackState === 'idle' || playbackState === 'completed' ? (
              <button
                onClick={startPlayback}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#f59e0b] hover:bg-[#f59e0b]/90 text-black rounded-lg text-sm font-medium transition-colors"
              >
                <PlaybackIcons.Play className="w-3.5 h-3.5" />
                {playbackState === 'completed' ? 'Replay' : 'Play'}
              </button>
            ) : playbackState === 'playing' ? (
              <button
                onClick={pausePlayback}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white rounded-lg text-sm font-medium transition-colors"
              >
                <PlaybackIcons.Pause className="w-3.5 h-3.5" />
                Pause
              </button>
            ) : (
              <button
                onClick={resumePlayback}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#f59e0b] hover:bg-[#f59e0b]/90 text-black rounded-lg text-sm font-medium transition-colors"
              >
                <PlaybackIcons.Play className="w-3.5 h-3.5" />
                Resume
              </button>
            )}

            <button
              onClick={stopPlayback}
              className="p-1.5 bg-[#1a1a1a] hover:bg-[#222] border border-[#333] text-white rounded-lg transition-colors"
              title="Reset"
            >
              <PlaybackIcons.Reset className="w-3.5 h-3.5" />
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
              className={`p-1.5 rounded-lg transition-colors ${
                autoFollowCamera
                  ? 'bg-[#f59e0b]/20 border border-[#f59e0b]/50 text-[#f59e0b]'
                  : 'bg-[#1a1a1a] border border-[#333] text-[#666]'
              }`}
              title="Auto-follow camera"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="4" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
                <path d="M12 6l2 1.5-2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="7" cy="7.5" r="1.5" fill="currentColor" />
              </svg>
            </button>
          </div>

          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-[#888] font-medium">Step {currentStepIndex + 1} of {activeFlow.steps.length}</span>
              <span className="text-[#666] font-mono">{Math.round(((currentStepIndex + 1) / activeFlow.steps.length) * 100)}%</span>
            </div>
            <div className="h-1.5 bg-[#1a1a1a] rounded-full overflow-hidden border border-[#1f1f1f]">
              <motion.div
                className="h-full bg-gradient-to-r from-[#f59e0b] via-[#f97316] to-[#ef4444]"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStepIndex + 1) / activeFlow.steps.length) * 100}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Flow List */}
      <div className="flex-1 overflow-y-auto">
        {detectedFlows.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[#1a1a1a] border border-[#1f1f1f] flex items-center justify-center">
              <Zap size={28} className="text-[#666]" />
            </div>
            <p className="text-sm text-[#888] font-medium mb-2">No meaningful flows detected</p>
            <p className="text-xs text-[#666] leading-relaxed px-4">
              This repository doesn't have clear execution flows, or the dependency graph is too sparse to infer behavioral patterns.
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-2.5">
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
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 ${
        isActive
          ? 'bg-gradient-to-br from-[#1a1a1a] to-[#151515] border-[#f59e0b]/50 shadow-lg shadow-[#f59e0b]/10'
          : 'bg-[#0a0a0a] border-[#1f1f1f] hover:border-[#333] hover:bg-[#111]'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {flow.icon === 'Authentication' && <FlowIcons.Authentication />}
          {flow.icon === 'ApiRequest' && <FlowIcons.ApiRequest />}
          {flow.icon === 'Registration' && <FlowIcons.Registration />}
          {flow.icon === 'Database' && <FlowIcons.Database />}
          {flow.icon === 'UiRender' && <FlowIcons.UiRender />}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-white font-semibold text-sm mb-1.5 truncate">
            {flow.name}
          </h4>
          <p className="text-[#888] text-xs mb-3 line-clamp-2 leading-relaxed">
            {flow.description}
          </p>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[#0d0d0d] border border-[#1f1f1f]">
              <ComplexityIndicator level={flow.complexity} />
              <span className="text-[#888] text-xs font-medium">{flow.complexity}</span>
            </div>
            <span className="text-[#666] text-xs font-medium">
              {flow.steps.length} steps
            </span>
            <div className="flex items-center gap-1.5">
              <RiskIndicator level={flow.estimatedRisk} />
              <span className="text-[#666] text-xs font-medium">{flow.estimatedRisk}</span>
            </div>
          </div>
        </div>
        {isActive && (
          <ChevronRight size={16} className="text-[#f59e0b] flex-shrink-0 mt-1" />
        )}
      </div>
    </motion.button>
  );
}
