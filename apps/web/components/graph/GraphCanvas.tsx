'use client';

import { useMemo } from 'react';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  NodeTypes,
  EdgeTypes,
  Node,
  Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import * as d3 from 'd3-force';
import { GraphNode, GraphEdge } from '@codemap/shared';
import { useGraphStore } from '@/store/graphStore';
import { CustomNode } from './CustomNode';
import { CustomEdge } from './CustomEdge';
import { FilterBar } from './GraphControls';
import { NodeDetail } from './NodeDetail';

/* ─── Type maps ───────────────────────────────────────────── */

const nodeTypes: NodeTypes = { custom: CustomNode };
const edgeTypes: EdgeTypes = { custom: CustomEdge };

const TYPE_COLORS: Record<string, string> = {
  core: '#3b82f6',
  hotspot: '#ef4444',
  stable: '#10b981',
  utility: '#4b5563',
};

/* ─── Classify node by commit frequency & connectivity ───── */

function classifyNode(node: GraphNode): 'core' | 'hotspot' | 'stable' | 'utility' {
  if (node.commitFrequency >= 10) return 'hotspot';
  if (node.dependencies.length >= 3 || node.dependents.length >= 3) return 'core';
  if (node.commitFrequency <= 2 && node.dependencies.length <= 1) return 'utility';
  return 'stable';
}

/* ─── D3 layout computation (synchronous) ────────────────── */

interface SimNode {
  id: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  index?: number;
}

function computeLayout(graphNodes: GraphNode[], graphEdges: GraphEdge[]) {
  // Create simulation nodes with initial circular positions
  const simNodes: SimNode[] = graphNodes.map((n, i) => {
    const angle = (i / Math.max(graphNodes.length, 1)) * 2 * Math.PI;
    const radius = Math.min(200, graphNodes.length * 15);
    return { id: n.id, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius };
  });

  // Create simulation links — only include edges where both source and target exist
  const nodeIdSet = new Set(graphNodes.map(n => n.id));
  const validEdges = graphEdges.filter(e => nodeIdSet.has(e.source) && nodeIdSet.has(e.target));

  const simLinks = validEdges.map(e => ({
    source: e.source,
    target: e.target,
  }));

  // Run D3 force simulation synchronously
  const simulation = d3.forceSimulation<SimNode>(simNodes)
    .force('link', d3.forceLink(simLinks).id((d: any) => d.id).distance(180).strength(1.0).iterations(3))
    .force('charge', d3.forceManyBody().strength(-500))
    .force('center', d3.forceCenter(0, 0))
    .force('collide', d3.forceCollide().radius(55))
    .force('x', d3.forceX(0).strength(0.05))
    .force('y', d3.forceY(0).strength(0.05))
    .stop();

  for (let i = 0; i < 500; i++) {
    simulation.tick();
  }

  // Convert to ReactFlow nodes
  const rfNodes: Node[] = simNodes.map((sn) => {
    const raw = graphNodes.find(n => n.id === sn.id)!;
    const nodeType = classifyNode(raw);
    return {
      id: sn.id,
      type: 'custom',
      position: { x: sn.x, y: sn.y },
      data: {
        id: raw.id,
        label: raw.label,
        nodeType,
        commitFrequency: raw.commitFrequency,
        fileSize: raw.size,
        path: raw.path,
        dependencies: raw.dependencies,
        dependents: raw.dependents,
      },
    };
  });

  // Convert to ReactFlow edges
  const rfEdges: Edge[] = validEdges.map((e) => {
    const srcNode = graphNodes.find(n => n.id === e.source);
    const tgtNode = graphNodes.find(n => n.id === e.target);
    const srcType = srcNode ? classifyNode(srcNode) : 'utility';
    const tgtType = tgtNode ? classifyNode(tgtNode) : 'utility';

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'custom',
      data: {
        weight: e.weight,
        sourceColor: TYPE_COLORS[srcType],
        targetColor: TYPE_COLORS[tgtType],
      },
    };
  });

  return { rfNodes, rfEdges };
}

/* ─── Props ───────────────────────────────────────────────── */

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/* ─── Inner graph (must be inside ReactFlowProvider) ──────── */

function GraphCanvasInner({ nodes: graphNodes, edges: graphEdges }: GraphCanvasProps) {
  const { rfNodes, rfEdges } = useMemo(
    () => computeLayout(graphNodes, graphEdges),
    [graphNodes, graphEdges]
  );

  const [nodes, , onNodesChange] = useNodesState(rfNodes);
  const [edges, , onEdgesChange] = useEdgesState(rfEdges);

  // Sync nodes to store for NodeDetail to reference
  const { setNodes: setStoreNodes } = useGraphStore();
  useMemo(() => {
    const storeNodes = rfNodes.map(n => ({
      id: n.id,
      label: n.data.label,
      nodeType: n.data.nodeType,
      commitFrequency: n.data.commitFrequency,
      size: n.data.fileSize,
      path: n.data.path,
      dependencies: n.data.dependencies,
      dependents: n.data.dependents,
    }));
    setStoreNodes(storeNodes as any);
  }, [rfNodes, setStoreNodes]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
      fitViewOptions={{ padding: 0.15 }}
      nodesDraggable
      nodesConnectable={false}
      edgesUpdatable={false}
      connectOnClick={false}
      zoomOnScroll
      minZoom={0.1}
      maxZoom={4}
      proOptions={{ hideAttribution: true }}
      style={{ background: '#080808' }}
    >
      <Background variant={'dots' as any} gap={24} size={1} color="#1a1a1a" />
      <Controls
        showInteractive={false}
        style={{
          bottom: 16,
          right: 16,
          left: 'auto',
          background: '#080808',
          border: '1px solid #1f1f1f',
          borderRadius: 8,
        }}
      />
      <MiniMap
        nodeColor={(n) => TYPE_COLORS[n.data?.nodeType] || '#4b5563'}
        style={{ background: '#0d0d0d', bottom: 60, left: 16, width: 140, height: 90 }}
        maskColor="rgba(0,0,0,0.8)"
      />
    </ReactFlow>
  );
}

/* ─── Outer wrapper (provides ReactFlowProvider) ─────────── */

export function GraphCanvas({ nodes, edges }: GraphCanvasProps) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlowProvider>
        <GraphCanvasInner nodes={nodes} edges={edges} />
        <FilterBar />
        <NodeDetail />
      </ReactFlowProvider>
    </div>
  );
}

export default GraphCanvas;
