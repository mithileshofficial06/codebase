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

/* ─── File extension → color scheme ───────────────────────── */

const EXT_COLORS: Record<string, string> = {
  ts:   '#3b82f6', tsx:  '#60a5fa',
  js:   '#f59e0b', jsx:  '#fbbf24',
  py:   '#10b981',
  css:  '#a855f7', scss: '#c084fc',
  html: '#ef4444',
  json: '#6b7280', yaml: '#6b7280', yml: '#6b7280',
  md:   '#8b5cf6',
  go:   '#06b6d4', rs:   '#f97316',
  java: '#dc2626', rb:   '#ef4444',
};

function getExtColor(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  return EXT_COLORS[ext] || '#4b5563';
}

/* ─── Classify node by folder depth + connectivity ────────── */

function classifyNode(node: GraphNode): 'core' | 'hotspot' | 'stable' | 'utility' {
  // Hotspot = high commit frequency
  if (node.commitFrequency >= 10) return 'hotspot';
  // Core = entry points and highly connected files
  if (node.dependencies.length >= 3 || node.dependents.length >= 3) return 'core';
  // Utility = config files, isolated files
  const name = node.label.toLowerCase();
  if (/^(\.env|\.gitignore|readme|license|package\.json|requirements\.txt|dockerfile|docker-compose)/i.test(name)) return 'utility';
  if (node.commitFrequency <= 1 && node.dependencies.length === 0 && node.dependents.length === 0) return 'utility';
  // Everything else is stable
  return 'stable';
}

/* ─── Extract folder from path ────────────────────────────── */

function getFolder(filePath: string): string {
  const parts = filePath.split('/');
  if (parts.length <= 1) return '_root';
  // Use up to 2 levels: e.g. "backend/app" or "frontend/src"
  return parts.slice(0, Math.min(parts.length - 1, 2)).join('/');
}

/* ─── D3 layout with folder clustering ────────────────────── */

interface SimNode {
  id: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  folder: string;
  index?: number;
}

function computeLayout(graphNodes: GraphNode[], graphEdges: GraphEdge[]) {
  // Build folder groups
  const folderMap = new Map<string, number[]>();
  graphNodes.forEach((n, i) => {
    const folder = getFolder(n.path);
    if (!folderMap.has(folder)) folderMap.set(folder, []);
    folderMap.get(folder)!.push(i);
  });

  // Assign cluster centers in a circle for each folder
  const folders = Array.from(folderMap.keys());
  const clusterRadius = Math.max(200, folders.length * 50);
  const clusterCenters: Record<string, { x: number; y: number }> = {};
  folders.forEach((f, i) => {
    const angle = (i / folders.length) * 2 * Math.PI;
    clusterCenters[f] = {
      x: Math.cos(angle) * clusterRadius,
      y: Math.sin(angle) * clusterRadius,
    };
  });

  // Create simulation nodes with positions near their cluster center
  const simNodes: SimNode[] = graphNodes.map((n, i) => {
    const folder = getFolder(n.path);
    const center = clusterCenters[folder];
    // Slight jitter within cluster
    const jitter = 30;
    return {
      id: n.id,
      x: center.x + (Math.random() - 0.5) * jitter,
      y: center.y + (Math.random() - 0.5) * jitter,
      folder,
    };
  });

  // Valid edges
  const nodeIdSet = new Set(graphNodes.map(n => n.id));
  const validEdges = graphEdges.filter(e => nodeIdSet.has(e.source) && nodeIdSet.has(e.target));
  const simLinks = validEdges.map(e => ({ source: e.source, target: e.target }));

  // Adaptive force parameters based on node count
  const nodeCount = graphNodes.length;
  const chargeStrength = nodeCount > 100 ? -120 : nodeCount > 50 ? -200 : -400;
  const collideRadius = nodeCount > 100 ? 25 : nodeCount > 50 ? 35 : 50;
  const linkDistance = nodeCount > 100 ? 60 : nodeCount > 50 ? 100 : 150;

  // Custom clustering force — pull nodes toward their folder center
  function clusterForce(alpha: number) {
    for (const node of simNodes) {
      const center = clusterCenters[node.folder];
      if (center) {
        const strength = 0.3 * alpha;
        node.vx = (node.vx || 0) + (center.x - node.x) * strength;
        node.vy = (node.vy || 0) + (center.y - node.y) * strength;
      }
    }
  }

  // Run D3 force simulation
  const simulation = d3.forceSimulation<SimNode>(simNodes)
    .force('link', d3.forceLink(simLinks).id((d: any) => d.id).distance(linkDistance).strength(0.8))
    .force('charge', d3.forceManyBody().strength(chargeStrength))
    .force('center', d3.forceCenter(0, 0).strength(0.03))
    .force('collide', d3.forceCollide().radius(collideRadius))
    .force('cluster', clusterForce as any)
    .stop();

  for (let i = 0; i < 400; i++) {
    simulation.tick();
  }

  // Convert to ReactFlow nodes
  const rfNodes: Node[] = simNodes.map((sn) => {
    const raw = graphNodes.find(n => n.id === sn.id)!;
    const nodeType = classifyNode(raw);
    const extColor = getExtColor(raw.path);

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
        folder: sn.folder,
        dependencies: raw.dependencies,
        dependents: raw.dependents,
        extColor,
      },
    };
  });

  // Convert to ReactFlow edges
  const rfEdges: Edge[] = validEdges.map((e) => {
    const srcNode = graphNodes.find(n => n.id === e.source);
    const tgtNode = graphNodes.find(n => n.id === e.target);
    const srcColor = srcNode ? getExtColor(srcNode.path) : '#4b5563';
    const tgtColor = tgtNode ? getExtColor(tgtNode.path) : '#4b5563';

    return {
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'custom',
      data: {
        weight: e.weight,
        sourceColor: srcColor,
        targetColor: tgtColor,
      },
    };
  });

  return { rfNodes, rfEdges, clusterCenters };
}

/* ─── Props ───────────────────────────────────────────────── */

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/* ─── Inner graph ─────────────────────────────────────────── */

function GraphCanvasInner({ nodes: graphNodes, edges: graphEdges }: GraphCanvasProps) {
  const { rfNodes, rfEdges, clusterCenters } = useMemo(
    () => computeLayout(graphNodes, graphEdges),
    [graphNodes, graphEdges]
  );

  const [nodes, , onNodesChange] = useNodesState(rfNodes);
  const [edges, , onEdgesChange] = useEdgesState(rfEdges);

  // Sync to store for NodeDetail
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
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        nodesDraggable
        nodesConnectable={false}
        edgesUpdatable={false}
        connectOnClick={false}
        zoomOnScroll
        minZoom={0.05}
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
          nodeColor={(n) => n.data?.extColor || '#4b5563'}
          style={{ background: '#0d0d0d', bottom: 60, left: 16, width: 160, height: 100 }}
          maskColor="rgba(0,0,0,0.8)"
        />
      </ReactFlow>

      {/* Folder labels overlay */}
      <div
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}
        aria-hidden="true"
      />
    </>
  );
}

/* ─── Outer wrapper ───────────────────────────────────────── */

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
