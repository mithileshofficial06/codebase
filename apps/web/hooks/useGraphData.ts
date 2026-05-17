'use client';

import { useMemo } from 'react';
import { useGraphStore } from '@/store/graphStore';
import { getNodeColor } from '@/lib/graphUtils';
import type { Node, Edge } from 'reactflow';

export function useGraphData() {
  const { nodes, edges } = useGraphStore();

  const transformedNodes: Node[] = useMemo(() => {
    return nodes.map((node) => ({
      id: node.id,
      type: 'custom',
      position: { x: node.x || 0, y: node.y || 0 },
      data: {
        label: node.label,
        path: node.path,
        fileType: node.fileType,
        size: node.size,
        depCount: node.dependencies.length,
        dependentCount: node.dependents.length,
        commitFrequency: node.commitFrequency,
        color: getNodeColor(node),
        isHotspot: node.dependents.length > 5 || node.commitFrequency > 10,
      },
    }));
  }, [nodes]);

  const transformedEdges: Edge[] = useMemo(() => {
    // Build a node-id → color map for gradient edges
    const nodeColorMap: Record<string, string> = {};
    for (const node of nodes) {
      nodeColorMap[node.id] = getNodeColor(node);
    }

    return edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'custom',
      data: {
        weight: edge.weight,
        sourceColor: nodeColorMap[edge.source] || '#8b5cf6',
        targetColor: nodeColorMap[edge.target] || '#8b5cf6',
      },
    }));
  }, [edges, nodes]);

  return { transformedNodes, transformedEdges };
}
