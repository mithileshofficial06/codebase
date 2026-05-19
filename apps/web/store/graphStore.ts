import { create } from 'zustand';
import { GraphNode, GraphEdge } from '@codemap/shared/types';

export type FilterType = 'all' | 'core' | 'hotspot' | 'stable' | 'utility';

interface GraphStore {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode: GraphNode | null;
  activeFilter: FilterType;
  isDetailOpen: boolean;

  setNodes: (nodes: GraphNode[]) => void;
  setEdges: (edges: GraphEdge[]) => void;
  setSelectedNode: (node: GraphNode | null) => void;
  setActiveFilter: (filter: FilterType) => void;
  setDetailOpen: (open: boolean) => void;
}

export const useGraphStore = create<GraphStore>((set) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  activeFilter: 'all',
  isDetailOpen: false,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  setSelectedNode: (node) => set({ selectedNode: node, isDetailOpen: !!node }),
  setActiveFilter: (activeFilter) => set({ activeFilter }),
  setDetailOpen: (isDetailOpen) => set({ isDetailOpen }),
}));
