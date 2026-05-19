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

/* ─── Mock data ───────────────────────────────────────────── */

const MOCK_NODES_RAW = [
  { id: 'app',      label: 'app.ts',      nodeType: 'core',    commitFrequency: 8,  fileSize: 4200 },
  { id: 'auth',     label: 'auth.ts',     nodeType: 'hotspot', commitFrequency: 24, fileSize: 3100 },
  { id: 'db',       label: 'db.ts',       nodeType: 'core',    commitFrequency: 5,  fileSize: 2800 },
  { id: 'router',   label: 'router.ts',   nodeType: 'core',    commitFrequency: 6,  fileSize: 1900 },
  { id: 'payment',  label: 'payment.ts',  nodeType: 'hotspot', commitFrequency: 18, fileSize: 3800 },
  { id: 'orders',   label: 'orders.ts',   nodeType: 'hotspot', commitFrequency: 15, fileSize: 4100 },
  { id: 'user',     label: 'user.ts',     nodeType: 'stable',  commitFrequency: 3,  fileSize: 2200 },
  { id: 'email',    label: 'email.ts',    nodeType: 'stable',  commitFrequency: 2,  fileSize: 1100 },
  { id: 'utils',    label: 'utils.ts',    nodeType: 'utility', commitFrequency: 1,  fileSize: 800 },
  { id: 'config',   label: 'config.ts',   nodeType: 'utility', commitFrequency: 1,  fileSize: 400 },
  { id: 'logger',   label: 'logger.ts',   nodeType: 'utility', commitFrequency: 1,  fileSize: 300 },
  { id: 'types',    label: 'types.ts',    nodeType: 'utility', commitFrequency: 2,  fileSize: 600 },
];

const MOCK_EDGES_RAW = [
  { id: 'e1',  source: 'app',     target: 'auth',    weight: 3 },
  { id: 'e2',  source: 'app',     target: 'db',      weight: 3 },
  { id: 'e3',  source: 'app',     target: 'router',  weight: 2 },
  { id: 'e4',  source: 'router',  target: 'payment', weight: 2 },
  { id: 'e5',  source: 'router',  target: 'orders',  weight: 2 },
  { id: 'e6',  source: 'router',  target: 'user',    weight: 1 },
  { id: 'e7',  source: 'auth',    target: 'db',      weight: 3 },
  { id: 'e8',  source: 'auth',    target: 'utils',   weight: 1 },
  { id: 'e9',  source: 'orders',  target: 'payment', weight: 2 },
  { id: 'e10', source: 'orders',  target: 'email',   weight: 1 },
  { id: 'e11', source: 'orders',  target: 'db',      weight: 2 },
  { id: 'e12', source: 'payment', target: 'utils',   weight: 1 },
  { id: 'e13', source: 'payment', target: 'config',  weight: 1 },
  { id: 'e14', source: 'user',    target: 'db',      weight: 2 },
  { id: 'e15', source: 'email',   target: 'config',  weight: 1 },
  { id: 'e16', source: 'app',     target: 'logger',  weight: 1 },
  { id: 'e17', source: 'db',      target: 'config',  weight: 1 },
  { id: 'e18', source: 'orders',  target: 'types',   weight: 1 },
  { id: 'e19', source: 'user',    target: 'types',   weight: 1 },
];

/* ─── D3 layout computation (synchronous, runs once) ─────── */

interface SimNode {
  id: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  index?: number;
}

function computeLayout() {
  // Build dependency/dependent lookups
  const depsMap: Record<string, string[]> = {};
  const dependentsMap: Record<string, string[]> = {};
  MOCK_NODES_RAW.forEach(n => { depsMap[n.id] = []; dependentsMap[n.id] = []; });
  MOCK_EDGES_RAW.forEach(e => {
    depsMap[e.source]?.push(e.target);
    dependentsMap[e.target]?.push(e.source);
  });

  // Create simulation nodes with initial circular positions
  const simNodes: SimNode[] = MOCK_NODES_RAW.map((n, i) => {
    const angle = (i / MOCK_NODES_RAW.length) * 2 * Math.PI;
    return { id: n.id, x: Math.cos(angle) * 150, y: Math.sin(angle) * 150 };
  });

  // Create simulation links
  const simLinks = MOCK_EDGES_RAW.map(e => ({
    source: e.source,
    target: e.target,
  }));

  // Run D3 force simulation synchronously for 500 ticks
  const simulation = d3.forceSimulation<SimNode>(simNodes)
    .force('link', d3.forceLink(simLinks).id((d: any) => d.id).distance(180).strength(1.0).iterations(3))
    .force('charge', d3.forceManyBody().strength(-500))
    .force('center', d3.forceCenter(0, 0))
    .force('collide', d3.forceCollide().radius(55))
    .force('x', d3.forceX(0).strength(0.05))
    .force('y', d3.forceY(0).strength(0.05))
    .stop();

  // Run ticks synchronously
  for (let i = 0; i < 500; i++) {
    simulation.tick();
  }

  // Convert to ReactFlow nodes
  const rfNodes: Node[] = simNodes.map((sn) => {
    const raw = MOCK_NODES_RAW.find(n => n.id === sn.id)!;
    return {
      id: sn.id,
      type: 'custom',
      position: { x: sn.x, y: sn.y },
      data: {
        ...raw,
        dependencies: depsMap[sn.id] || [],
        dependents: dependentsMap[sn.id] || [],
      },
    };
  });

  // Convert to ReactFlow edges
  const rfEdges: Edge[] = MOCK_EDGES_RAW.map((e) => {
    const srcType = MOCK_NODES_RAW.find(n => n.id === e.source)?.nodeType || 'utility';
    const tgtType = MOCK_NODES_RAW.find(n => n.id === e.target)?.nodeType || 'utility';
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

/* ─── Inner graph (must be inside ReactFlowProvider) ──────── */

function GraphCanvasInner() {
  const { rfNodes, rfEdges } = useMemo(() => computeLayout(), []);

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

export function GraphCanvas() {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlowProvider>
        <GraphCanvasInner />
        <FilterBar />
        <NodeDetail />
      </ReactFlowProvider>
    </div>
  );
}

export default GraphCanvas;
