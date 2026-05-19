'use client';

import { useMemo, useEffect, useCallback } from 'react';
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
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';
import * as d3 from 'd3-force';
import { GraphNode, GraphEdge } from '@codemap/shared';
import { useGraphStore } from '@/store/graphStore';
import { buildArchitecture, ClusterNode as ClusterNodeType, ClusterEdge } from '@/lib/architectureEngine';
import { CustomNode } from './CustomNode';
import { CustomEdge } from './CustomEdge';
import ClusterNodeComp from './ClusterNode';
import { LevelSwitcher } from './GraphControls';
import { NodeDetail } from './NodeDetail';
import { OnboardingPanel } from './OnboardingPanel';

/* ─── Node/Edge type maps ─────────────────────────────────────── */

const nodeTypes: NodeTypes = {
  custom: CustomNode,
  cluster: ClusterNodeComp,
};
const edgeTypes: EdgeTypes = { custom: CustomEdge };

/* ─── File extension color ────────────────────────────────────── */

const EXT_COLORS: Record<string, string> = {
  ts: '#3b82f6', tsx: '#60a5fa', js: '#f59e0b', jsx: '#fbbf24',
  py: '#10b981', css: '#a855f7', scss: '#c084fc', html: '#ef4444',
  json: '#6b7280', yaml: '#6b7280', yml: '#6b7280', md: '#8b5cf6',
  go: '#06b6d4', rs: '#f97316', java: '#dc2626', rb: '#ef4444',
};

function getExtColor(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  return EXT_COLORS[ext] || '#4b5563';
}

/* ─── Node classification ─────────────────────────────────────── */

function classifyNode(node: GraphNode): 'core' | 'hotspot' | 'stable' | 'utility' {
  if (node.commitFrequency >= 10) return 'hotspot';
  if (node.dependencies.length >= 3 || node.dependents.length >= 3) return 'core';
  const name = node.label.toLowerCase();
  if (/^(\.env|\.gitignore|readme|license|package\.json|requirements\.txt|dockerfile|docker-compose)/i.test(name)) return 'utility';
  if (node.commitFrequency <= 1 && node.dependencies.length === 0 && node.dependents.length === 0) return 'utility';
  return 'stable';
}

/* ═══ LEVEL 1: Architecture Layout ════════════════════════════ */

function computeArchitectureLayout(
  clusters: ClusterNodeType[],
  clusterEdges: ClusterEdge[]
) {
  interface SimNode { id: string; x: number; y: number; vx?: number; vy?: number; index?: number }

  const simNodes: SimNode[] = clusters.map((c, i) => {
    const angle = (i / Math.max(clusters.length, 1)) * 2 * Math.PI;
    const r = Math.max(250, clusters.length * 60);
    return { id: c.id, x: Math.cos(angle) * r, y: Math.sin(angle) * r };
  });

  const simLinks = clusterEdges
    .filter(e => {
      const ids = new Set(clusters.map(c => c.id));
      return ids.has(e.source) && ids.has(e.target);
    })
    .map(e => ({ source: e.source, target: e.target }));

  const simulation = d3.forceSimulation<SimNode>(simNodes)
    .force('link', d3.forceLink(simLinks).id((d: any) => d.id).distance(300).strength(0.3))
    .force('charge', d3.forceManyBody().strength(-1500))
    .force('center', d3.forceCenter(0, 0).strength(0.05))
    .force('collide', d3.forceCollide().radius(100))
    .stop();

  for (let i = 0; i < 300; i++) simulation.tick();

  const rfNodes: Node[] = simNodes.map(sn => {
    const cluster = clusters.find(c => c.id === sn.id)!;
    return {
      id: sn.id,
      type: 'cluster',
      position: { x: sn.x, y: sn.y },
      data: {
        label: cluster.label,
        humanLabel: cluster.humanLabel,
        fileCount: cluster.fileCount,
        color: cluster.color,
        icon: cluster.icon,
        hotspotCount: cluster.hotspotCount,
        isEntryPoint: cluster.isEntryPoint,
        avgCommitFreq: cluster.avgCommitFreq,
        totalSize: cluster.totalSize,
      },
    };
  });

  const rfEdges: Edge[] = clusterEdges
    .filter(e => {
      const ids = new Set(clusters.map(c => c.id));
      return ids.has(e.source) && ids.has(e.target);
    })
    .map(e => {
      const srcCluster = clusters.find(c => c.id === e.source);
      const tgtCluster = clusters.find(c => c.id === e.target);
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'custom',
        data: {
          weight: e.weight,
          sourceColor: srcCluster?.color || '#4b5563',
          targetColor: tgtCluster?.color || '#4b5563',
          isClusterEdge: true,
        },
      };
    });

  return { rfNodes, rfEdges };
}

/* ═══ LEVEL 2: Module Layout (files within a cluster) ════════ */

function computeModuleLayout(
  cluster: ClusterNodeType,
  allEdges: GraphEdge[]
) {
  interface SimNode { id: string; x: number; y: number; vx?: number; vy?: number; index?: number }

  const fileIds = new Set(cluster.files.map(f => f.id));
  const internalEdges = allEdges.filter(e => fileIds.has(e.source) && fileIds.has(e.target));

  const simNodes: SimNode[] = cluster.files.map((f, i) => {
    const angle = (i / Math.max(cluster.files.length, 1)) * 2 * Math.PI;
    const r = Math.max(80, cluster.files.length * 12);
    return { id: f.id, x: Math.cos(angle) * r, y: Math.sin(angle) * r };
  });

  const simLinks = internalEdges.map(e => ({ source: e.source, target: e.target }));

  const simulation = d3.forceSimulation<SimNode>(simNodes)
    .force('link', d3.forceLink(simLinks).id((d: any) => d.id).distance(120).strength(0.8))
    .force('charge', d3.forceManyBody().strength(-400))
    .force('center', d3.forceCenter(0, 0))
    .force('collide', d3.forceCollide().radius(40))
    .stop();

  for (let i = 0; i < 400; i++) simulation.tick();

  const rfNodes: Node[] = simNodes.map(sn => {
    const raw = cluster.files.find(f => f.id === sn.id)!;
    return {
      id: sn.id,
      type: 'custom',
      position: { x: sn.x, y: sn.y },
      data: {
        id: raw.id,
        label: raw.label,
        nodeType: classifyNode(raw),
        commitFrequency: raw.commitFrequency,
        fileSize: raw.size,
        path: raw.path,
        folder: cluster.folder,
        dependencies: raw.dependencies,
        dependents: raw.dependents,
        extColor: getExtColor(raw.path),
      },
    };
  });

  const rfEdges: Edge[] = internalEdges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'custom',
    data: {
      weight: e.weight,
      sourceColor: getExtColor(cluster.files.find(f => f.id === e.source)?.path || ''),
      targetColor: getExtColor(cluster.files.find(f => f.id === e.target)?.path || ''),
    },
  }));

  return { rfNodes, rfEdges };
}

/* ═══ LEVEL 3: Full File Layout ═══════════════════════════════ */

function computeFileLayout(graphNodes: GraphNode[], graphEdges: GraphEdge[]) {
  interface SimNode { id: string; x: number; y: number; vx?: number; vy?: number; folder: string; index?: number }

  function getFolder(p: string): string {
    const parts = p.split('/');
    if (parts.length <= 1) return '_root';
    return parts.slice(0, Math.min(parts.length - 1, 2)).join('/');
  }

  const folderMap = new Map<string, number[]>();
  graphNodes.forEach((n, i) => {
    const f = getFolder(n.path);
    if (!folderMap.has(f)) folderMap.set(f, []);
    folderMap.get(f)!.push(i);
  });

  const folders = Array.from(folderMap.keys());
  const clusterRadius = Math.max(200, folders.length * 50);
  const clusterCenters: Record<string, { x: number; y: number }> = {};
  folders.forEach((f, i) => {
    const angle = (i / folders.length) * 2 * Math.PI;
    clusterCenters[f] = { x: Math.cos(angle) * clusterRadius, y: Math.sin(angle) * clusterRadius };
  });

  const simNodes: SimNode[] = graphNodes.map(n => {
    const folder = getFolder(n.path);
    const center = clusterCenters[folder];
    return {
      id: n.id,
      x: center.x + (Math.random() - 0.5) * 30,
      y: center.y + (Math.random() - 0.5) * 30,
      folder,
    };
  });

  const nodeIdSet = new Set(graphNodes.map(n => n.id));
  const validEdges = graphEdges.filter(e => nodeIdSet.has(e.source) && nodeIdSet.has(e.target));

  const nodeCount = graphNodes.length;
  const chargeStrength = nodeCount > 100 ? -120 : nodeCount > 50 ? -200 : -400;
  const collideRadius = nodeCount > 100 ? 25 : nodeCount > 50 ? 35 : 50;
  const linkDistance = nodeCount > 100 ? 60 : nodeCount > 50 ? 100 : 150;

  function clusterForce(alpha: number) {
    for (const node of simNodes) {
      const center = clusterCenters[node.folder];
      if (center) {
        node.vx = (node.vx || 0) + (center.x - node.x) * 0.3 * alpha;
        node.vy = (node.vy || 0) + (center.y - node.y) * 0.3 * alpha;
      }
    }
  }

  const simulation = d3.forceSimulation<SimNode>(simNodes)
    .force('link', d3.forceLink(validEdges.map(e => ({ source: e.source, target: e.target }))).id((d: any) => d.id).distance(linkDistance).strength(0.8))
    .force('charge', d3.forceManyBody().strength(chargeStrength))
    .force('center', d3.forceCenter(0, 0).strength(0.03))
    .force('collide', d3.forceCollide().radius(collideRadius))
    .force('cluster', clusterForce as any)
    .stop();

  for (let i = 0; i < 400; i++) simulation.tick();

  const rfNodes: Node[] = simNodes.map(sn => {
    const raw = graphNodes.find(n => n.id === sn.id)!;
    return {
      id: sn.id,
      type: 'custom',
      position: { x: sn.x, y: sn.y },
      data: {
        id: raw.id,
        label: raw.label,
        nodeType: classifyNode(raw),
        commitFrequency: raw.commitFrequency,
        fileSize: raw.size,
        path: raw.path,
        folder: sn.folder,
        dependencies: raw.dependencies,
        dependents: raw.dependents,
        extColor: getExtColor(raw.path),
      },
    };
  });

  const rfEdges: Edge[] = validEdges.map(e => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'custom',
    data: {
      weight: e.weight,
      sourceColor: getExtColor(graphNodes.find(n => n.id === e.source)?.path || ''),
      targetColor: getExtColor(graphNodes.find(n => n.id === e.target)?.path || ''),
    },
  }));

  return { rfNodes, rfEdges };
}

/* ═══ Props ═══════════════════════════════════════════════════ */

interface GraphCanvasProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/* ═══ Inner Canvas ════════════════════════════════════════════ */

function GraphCanvasInner({ nodes: graphNodes, edges: graphEdges }: GraphCanvasProps) {
  const {
    viewLevel,
    clusters,
    clusterEdges,
    expandedCluster,
    setClusters,
    setNodes: setStoreNodes,
  } = useGraphStore();

  const { fitView } = useReactFlow();

  // Compute architecture on mount
  useEffect(() => {
    const arch = buildArchitecture(graphNodes, graphEdges);
    setClusters(arch.clusters, arch.clusterEdges);
  }, [graphNodes, graphEdges, setClusters]);

  // Compute layout based on view level
  const { rfNodes, rfEdges } = useMemo(() => {
    if (viewLevel === 'architecture' && clusters.length > 0) {
      return computeArchitectureLayout(clusters, clusterEdges);
    }

    if (viewLevel === 'module' && expandedCluster) {
      const cluster = clusters.find(c => c.id === expandedCluster);
      if (cluster) {
        return computeModuleLayout(cluster, graphEdges);
      }
    }

    // File view (Level 3) or fallback
    return computeFileLayout(graphNodes, graphEdges);
  }, [viewLevel, clusters, clusterEdges, expandedCluster, graphNodes, graphEdges]);

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  // Update nodes/edges when layout changes (level switch)
  useEffect(() => {
    setNodes(rfNodes);
    setEdges(rfEdges);
    // Fit view after a short delay to let animation settle
    const t = setTimeout(() => fitView({ padding: 0.2, duration: 600 }), 100);
    return () => clearTimeout(t);
  }, [rfNodes, rfEdges, setNodes, setEdges, fitView]);

  // Sync file nodes to store for NodeDetail
  useEffect(() => {
    if (viewLevel !== 'architecture') {
      const fileNodes = rfNodes
        .filter(n => n.type === 'custom')
        .map(n => ({
          id: n.id,
          label: n.data.label,
          nodeType: n.data.nodeType,
          commitFrequency: n.data.commitFrequency,
          size: n.data.fileSize,
          path: n.data.path,
          dependencies: n.data.dependencies,
          dependents: n.data.dependents,
        }));
      setStoreNodes(fileNodes as any);
    }
  }, [rfNodes, viewLevel, setStoreNodes]);

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
          nodeColor={(n) => {
            if (n.type === 'cluster') return n.data?.color || '#4b5563';
            return n.data?.extColor || '#4b5563';
          }}
          style={{ background: '#0d0d0d', bottom: 60, left: 16, width: 160, height: 100 }}
          maskColor="rgba(0,0,0,0.8)"
        />
      </ReactFlow>

      {/* Onboarding overlay (Architecture view only) */}
      {viewLevel === 'architecture' && <OnboardingPanel />}
    </>
  );
}

/* ═══ Outer Wrapper ═══════════════════════════════════════════ */

export function GraphCanvas({ nodes, edges }: GraphCanvasProps) {
  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlowProvider>
        <GraphCanvasInner nodes={nodes} edges={edges} />
        <LevelSwitcher />
        <NodeDetail />
      </ReactFlowProvider>
    </div>
  );
}

export default GraphCanvas;
