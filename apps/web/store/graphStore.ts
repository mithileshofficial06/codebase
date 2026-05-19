import { create } from 'zustand';
import { GraphNode, GraphEdge } from '@codemap/shared/types';
import { ClusterNode, ClusterEdge } from '@/lib/architectureEngine';

export type FilterType = 'all' | 'core' | 'hotspot' | 'stable' | 'utility';
export type ViewLevel = 'architecture' | 'module' | 'file';

interface GraphStore {
  // Existing
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode: GraphNode | null;
  activeFilter: FilterType;
  isDetailOpen: boolean;

  // New — hierarchical view
  viewLevel: ViewLevel;
  clusters: ClusterNode[];
  clusterEdges: ClusterEdge[];
  expandedCluster: string | null;
  onboardingDismissed: boolean;
  onboardingData: string | null;       // AI-generated summary text
  onboardingLoading: boolean;

  // Existing actions
  setNodes: (nodes: GraphNode[]) => void;
  setEdges: (edges: GraphEdge[]) => void;
  setSelectedNode: (node: GraphNode | null) => void;
  setActiveFilter: (filter: FilterType) => void;
  setDetailOpen: (open: boolean) => void;

  // New actions
  setViewLevel: (level: ViewLevel) => void;
  setClusters: (clusters: ClusterNode[], clusterEdges: ClusterEdge[]) => void;
  expandCluster: (clusterId: string) => void;
  collapseCluster: () => void;
  dismissOnboarding: () => void;
  setOnboardingData: (data: string | null) => void;
  setOnboardingLoading: (loading: boolean) => void;
}

export const useGraphStore = create<GraphStore>((set) => ({
  // Existing state
  nodes: [],
  edges: [],
  selectedNode: null,
  activeFilter: 'all',
  isDetailOpen: false,

  // New state
  viewLevel: 'architecture',
  clusters: [],
  clusterEdges: [],
  expandedCluster: null,
  onboardingDismissed: false,
  onboardingData: null,
  onboardingLoading: false,

  // Existing actions
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNode: (node) => set({ selectedNode: node, isDetailOpen: !!node }),
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  setDetailOpen: (isDetailOpen) => set({ isDetailOpen }),

  // New actions
  setViewLevel: (viewLevel) => set({ viewLevel, expandedCluster: null }),
  setClusters: (clusters, clusterEdges) => set({ clusters, clusterEdges }),
  expandCluster: (clusterId) => set({ expandedCluster: clusterId, viewLevel: 'module' }),
  collapseCluster: () => set({ expandedCluster: null, viewLevel: 'architecture' }),
  dismissOnboarding: () => set({ onboardingDismissed: true }),
  setOnboardingData: (onboardingData) => set({ onboardingData }),
  setOnboardingLoading: (onboardingLoading) => set({ onboardingLoading }),
}));
