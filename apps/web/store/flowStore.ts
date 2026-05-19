import { create } from 'zustand';
import { DetectedFlow } from '@/lib/flowDetection';

export type PlaybackState = 'idle' | 'playing' | 'paused' | 'completed';

interface FlowStore {
  // Flow data
  detectedFlows: DetectedFlow[];
  activeFlow: DetectedFlow | null;
  
  // Playback state
  playbackState: PlaybackState;
  currentStepIndex: number;
  playbackSpeed: number; // 0.5x, 1x, 2x
  autoFollowCamera: boolean;
  
  // UI state
  flowPanelOpen: boolean;
  showNarration: boolean;
  
  // Actions
  setDetectedFlows: (flows: DetectedFlow[]) => void;
  selectFlow: (flow: DetectedFlow | null) => void;
  startPlayback: () => void;
  pausePlayback: () => void;
  resumePlayback: () => void;
  stopPlayback: () => void;
  nextStep: () => void;
  previousStep: () => void;
  setCurrentStep: (index: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  toggleAutoFollow: () => void;
  toggleFlowPanel: () => void;
  toggleNarration: () => void;
  reset: () => void;
}

export const useFlowStore = create<FlowStore>((set, get) => ({
  // Initial state
  detectedFlows: [],
  activeFlow: null,
  playbackState: 'idle',
  currentStepIndex: -1,
  playbackSpeed: 1,
  autoFollowCamera: true,
  flowPanelOpen: false,
  showNarration: true,
  
  // Actions
  setDetectedFlows: (flows) => set({ detectedFlows: flows }),
  
  selectFlow: (flow) => set({ 
    activeFlow: flow,
    currentStepIndex: flow ? 0 : -1,
    playbackState: flow ? 'idle' : 'idle',
  }),
  
  startPlayback: () => {
    const { activeFlow } = get();
    if (!activeFlow) return;
    
    set({ 
      playbackState: 'playing',
      currentStepIndex: 0,
    });
  },
  
  pausePlayback: () => set({ playbackState: 'paused' }),
  
  resumePlayback: () => set({ playbackState: 'playing' }),
  
  stopPlayback: () => set({ 
    playbackState: 'idle',
    currentStepIndex: 0,
  }),
  
  nextStep: () => {
    const { activeFlow, currentStepIndex } = get();
    if (!activeFlow) return;
    
    const nextIndex = Math.min(currentStepIndex + 1, activeFlow.steps.length - 1);
    set({ currentStepIndex: nextIndex });
    
    if (nextIndex === activeFlow.steps.length - 1) {
      set({ playbackState: 'completed' });
    }
  },
  
  previousStep: () => {
    const { currentStepIndex } = get();
    set({ 
      currentStepIndex: Math.max(currentStepIndex - 1, 0),
      playbackState: 'paused',
    });
  },
  
  setCurrentStep: (index) => set({ 
    currentStepIndex: index,
    playbackState: 'paused',
  }),
  
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  
  toggleAutoFollow: () => set((state) => ({ 
    autoFollowCamera: !state.autoFollowCamera 
  })),
  
  toggleFlowPanel: () => set((state) => ({ 
    flowPanelOpen: !state.flowPanelOpen 
  })),
  
  toggleNarration: () => set((state) => ({ 
    showNarration: !state.showNarration 
  })),
  
  reset: () => set({
    activeFlow: null,
    playbackState: 'idle',
    currentStepIndex: -1,
  }),
}));
