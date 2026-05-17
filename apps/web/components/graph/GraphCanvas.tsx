'use client';

import { useEffect, useRef, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force';
import { useGraphStore } from '@/store/graphStore';
import { useGraphData } from '@/hooks/useGraphData';
import CustomNode from './CustomNode';
import CustomEdge from './CustomEdge';
import NodeDetail from './NodeDetail';

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

interface D3Node extends SimulationNodeDatum {
  id: string;
}

interface D3Link extends SimulationLinkDatum<D3Node> {
  id: string;
}

export default function GraphCanvas() {
  const { selectedNode } = useGraphStore();
  const { transformedNodes, transformedEdges } = useGraphData();
  const [rfNodes, setRfNodes, onNodesChange] = useNodesState([]);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState([]);
  const simulationRef = useRef<any>(null);

  // Run D3 force simulation when data changes
  useEffect(() => {
    if (transformedNodes.length === 0) return;

    // Create D3 nodes
    const d3Nodes: D3Node[] = transformedNodes.map((n) => ({
      id: n.id,
      x: n.position.x || Math.random() * 800,
      y: n.position.y || Math.random() * 600,
    }));

    // Create D3 links
    const d3Links: D3Link[] = transformedEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
    }));

    // Stop any existing simulation
    if (simulationRef.current) {
      simulationRef.current.stop();
    }

    const simulation = forceSimulation(d3Nodes)
      .force(
        'link',
        forceLink<D3Node, D3Link>(d3Links)
          .id((d) => d.id)
          .distance(120)
          .strength(0.3)
      )
      .force('charge', forceManyBody().strength(-200))
      .force('center', forceCenter(400, 300))
      .force('collide', forceCollide(40))
      .alpha(1)
      .alphaDecay(0.02);

    simulationRef.current = simulation;

    simulation.on('tick', () => {
      const positionMap: Record<string, { x: number; y: number }> = {};
      d3Nodes.forEach((n) => {
        positionMap[n.id] = { x: n.x || 0, y: n.y || 0 };
      });

      setRfNodes(
        transformedNodes.map((n) => ({
          ...n,
          position: positionMap[n.id] || n.position,
        }))
      );
    });

    simulation.on('end', () => {
      // Final positions
      setRfEdges(transformedEdges);
    });

    // Set edges immediately
    setRfEdges(transformedEdges);

    return () => {
      simulation.stop();
    };
  }, [transformedNodes, transformedEdges, setRfNodes, setRfEdges]);

  const onNodeClick = useCallback(
    (_: any, node: Node) => {
      const graphNode = useGraphStore.getState().nodes.find((n) => n.id === node.id);
      useGraphStore.getState().selectNode(graphNode || null);
    },
    []
  );

  return (
    <div className="w-full h-full relative" style={{ background: 'var(--bg-primary)' }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.1}
        maxZoom={3}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="rgba(255,255,255,0.03)" gap={24} size={1} />
        <Controls
          showInteractive={false}
          className="!bottom-4 !left-4"
        />
        <MiniMap
          nodeColor={(n) => n.data?.color || '#8b5cf6'}
          maskColor="rgba(0,0,0,0.7)"
          className="!bottom-4 !right-4"
          pannable
          zoomable
        />
      </ReactFlow>

      {/* Node detail slide-in panel */}
      {selectedNode && <NodeDetail node={selectedNode} />}
    </div>
  );
}
