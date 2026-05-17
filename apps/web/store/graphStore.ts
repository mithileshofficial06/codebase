import { create } from 'zustand';
import { GraphNode, GraphEdge } from '@codemap/shared';

interface GraphStore {
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNode: GraphNode | null;
  hoveredNodeId: string | null;
  hoveredEdgeId: string | null;

  setNodes: (nodes: GraphNode[]) => void;
  setEdges: (edges: GraphEdge[]) => void;
  selectNode: (node: GraphNode | null) => void;
  setHoveredNode: (id: string | null) => void;
  setHoveredEdge: (id: string | null) => void;
  updateNodePositions: (positions: Record<string, { x: number; y: number }>) => void;
}

export const useGraphStore = create<GraphStore>((set) => ({
  nodes: [],
  edges: [],
  selectedNode: null,
  hoveredNodeId: null,
  hoveredEdgeId: null,

  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges) => set({ edges }),
  selectNode: (node) => set({ selectedNode: node }),
  setHoveredNode: (id) => set({ hoveredNodeId: id }),
  setHoveredEdge: (id) => set({ hoveredEdgeId: id }),
  updateNodePositions: (positions) =>
    set((state) => ({
      nodes: state.nodes.map((node) => {
        const pos = positions[node.id];
        return pos ? { ...node, x: pos.x, y: pos.y } : node;
      }),
    })),
}));
