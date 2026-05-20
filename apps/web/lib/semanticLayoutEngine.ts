/**
 * Semantic Layout Engine
 * Implements: architecture gravity zones, density optimization, dead node containment
 * Fixes: excessive empty space, floating islands, random positioning
 */

import * as d3 from 'd3-force';
import { SemanticCluster, SemanticEdge } from './semanticArchitectureEngine';
import { GraphNode, GraphEdge } from '@codemap/shared';

interface LayoutNode {
  id: string;
  x: number;
  y: number;
  vx?: number;
  vy?: number;
  index?: number;
  cluster?: string;
  semanticType?: string;
  layerGravity?: { x: number; y: number };
}

/**
 * ARCHITECTURE LAYOUT WITH SEMANTIC GRAVITY
 * Clusters positioned based on architectural layer
 */
export function computeSemanticArchitectureLayout(
  clusters: SemanticCluster[],
  semanticEdges: SemanticEdge[]
) {
  const simNodes: LayoutNode[] = clusters.map((c, i) => {
    // Use semantic gravity as initial position
    const gravity = c.layerGravity;
    const jitter = 50; // Small random offset
    
    return {
      id: c.id,
      x: gravity.x + (Math.random() - 0.5) * jitter,
      y: gravity.y + (Math.random() - 0.5) * jitter,
      semanticType: c.semanticType,
      layerGravity: gravity,
    };
  });

  const simLinks = semanticEdges
    .filter(e => {
      const ids = new Set(clusters.map(c => c.id));
      return ids.has(e.source) && ids.has(e.target);
    })
    .map(e => ({
      source: e.source,
      target: e.target,
      strength: e.type === 'import' ? 0.4 : 0.2, // Weaker for semantic edges
    }));

  // Semantic gravity force - pulls nodes toward their architectural layer
  function semanticGravityForce(alpha: number) {
    for (const node of simNodes) {
      if (node.layerGravity) {
        const strength = 0.15; // Moderate pull
        node.vx = (node.vx || 0) + (node.layerGravity.x - node.x) * strength * alpha;
        node.vy = (node.vy || 0) + (node.layerGravity.y - node.y) * strength * alpha;
      }
    }
  }

  // Center attraction - prevents extreme drift
  function centerAttractionForce(alpha: number) {
    for (const node of simNodes) {
      const strength = 0.02; // Weak pull to center
      node.vx = (node.vx || 0) + (0 - node.x) * strength * alpha;
      node.vy = (node.vy || 0) + (0 - node.y) * strength * alpha;
    }
  }

  const simulation = d3.forceSimulation<LayoutNode>(simNodes)
    .force('link', d3.forceLink(simLinks).id((d: any) => d.id).distance(250).strength((d: any) => d.strength))
    .force('charge', d3.forceManyBody().strength(-1200)) // Reduced repulsion
    .force('collide', d3.forceCollide().radius(120)) // Tighter packing
    .force('semanticGravity', semanticGravityForce as any)
    .force('centerAttraction', centerAttractionForce as any)
    .stop();

  // Run simulation
  for (let i = 0; i < 350; i++) simulation.tick();

  return { nodes: simNodes, edges: semanticEdges };
}

/**
 * MODULE LAYOUT WITH DENSITY OPTIMIZATION
 * Files within a cluster, tightly packed
 */
export function computeSemanticModuleLayout(
  cluster: SemanticCluster,
  allEdges: GraphEdge[]
) {
  const fileIds = new Set(cluster.files.map(f => f.id));
  const internalEdges = allEdges.filter(e => fileIds.has(e.source) && fileIds.has(e.target));

  const simNodes: LayoutNode[] = cluster.files.map((f, i) => {
    // Circular initial layout
    const angle = (i / Math.max(cluster.files.length, 1)) * 2 * Math.PI;
    const r = Math.max(60, cluster.files.length * 10); // Tighter radius
    return {
      id: f.id,
      x: Math.cos(angle) * r,
      y: Math.sin(angle) * r,
    };
  });

  const simLinks = internalEdges.map(e => ({ source: e.source, target: e.target }));

  const simulation = d3.forceSimulation<LayoutNode>(simNodes)
    .force('link', d3.forceLink(simLinks).id((d: any) => d.id).distance(100).strength(0.9)) // Stronger links
    .force('charge', d3.forceManyBody().strength(-300)) // Reduced repulsion
    .force('center', d3.forceCenter(0, 0).strength(0.1))
    .force('collide', d3.forceCollide().radius(35)) // Tighter collision
    .stop();

  for (let i = 0; i < 450; i++) simulation.tick();

  return { nodes: simNodes, edges: internalEdges };
}

/**
 * FILE LAYOUT WITH SEMANTIC CLUSTERING + DEAD NODE CONTAINMENT
 * All files with intelligent grouping and no floating nodes
 */
export function computeSemanticFileLayout(
  graphNodes: GraphNode[],
  graphEdges: GraphEdge[],
  clusters: SemanticCluster[]
) {
  // Build node-to-cluster mapping
  const nodeToCluster = new Map<string, SemanticCluster>();
  for (const cluster of clusters) {
    for (const file of cluster.files) {
      nodeToCluster.set(file.id, cluster);
    }
  }

  // Position cluster centers based on semantic gravity
  const clusterCenters = new Map<string, { x: number; y: number }>();
  clusters.forEach((cluster, i) => {
    const gravity = cluster.layerGravity;
    // Scale down for file view
    clusterCenters.set(cluster.id, {
      x: gravity.x * 0.6,
      y: gravity.y * 0.6,
    });
  });

  const simNodes: LayoutNode[] = graphNodes.map(n => {
    const cluster = nodeToCluster.get(n.id);
    const center = cluster ? clusterCenters.get(cluster.id) : { x: 0, y: 0 };
    
    return {
      id: n.id,
      x: (center?.x || 0) + (Math.random() - 0.5) * 40,
      y: (center?.y || 0) + (Math.random() - 0.5) * 40,
      cluster: cluster?.id,
      semanticType: cluster?.semanticType,
    };
  });

  const nodeIdSet = new Set(graphNodes.map(n => n.id));
  const validEdges = graphEdges.filter(e => nodeIdSet.has(e.source) && nodeIdSet.has(e.target));

  // Adaptive parameters based on node count
  const nodeCount = graphNodes.length;
  const chargeStrength = nodeCount > 100 ? -100 : nodeCount > 50 ? -180 : -350;
  const collideRadius = nodeCount > 100 ? 22 : nodeCount > 50 ? 30 : 45;
  const linkDistance = nodeCount > 100 ? 50 : nodeCount > 50 ? 85 : 130;

  // Cluster affinity force - keeps files near their semantic cluster
  function clusterAffinityForce(alpha: number) {
    for (const node of simNodes) {
      if (node.cluster) {
        const center = clusterCenters.get(node.cluster);
        if (center) {
          const strength = 0.25; // Moderate pull
          node.vx = (node.vx || 0) + (center.x - node.x) * strength * alpha;
          node.vy = (node.vy || 0) + (center.y - node.y) * strength * alpha;
        }
      }
    }
  }

  // Dead node containment - prevent isolated nodes from drifting
  function deadNodeContainmentForce(alpha: number) {
    for (const node of simNodes) {
      const hasConnections = validEdges.some(e => e.source === node.id || e.target === node.id);
      
      if (!hasConnections && node.cluster) {
        // Strongly anchor dead nodes to their cluster center
        const center = clusterCenters.get(node.cluster);
        if (center) {
          const strength = 0.4; // Strong pull
          node.vx = (node.vx || 0) + (center.x - node.x) * strength * alpha;
          node.vy = (node.vy || 0) + (center.y - node.y) * strength * alpha;
        }
      }
    }
  }

  const simulation = d3.forceSimulation<LayoutNode>(simNodes)
    .force('link', d3.forceLink(validEdges.map(e => ({ source: e.source, target: e.target }))).id((d: any) => d.id).distance(linkDistance).strength(0.7))
    .force('charge', d3.forceManyBody().strength(chargeStrength))
    .force('center', d3.forceCenter(0, 0).strength(0.02)) // Weak center
    .force('collide', d3.forceCollide().radius(collideRadius))
    .force('clusterAffinity', clusterAffinityForce as any)
    .force('deadNodeContainment', deadNodeContainmentForce as any)
    .stop();

  for (let i = 0; i < 450; i++) simulation.tick();

  return { nodes: simNodes, edges: validEdges };
}

/**
 * GRAPH DENSITY OPTIMIZATION
 * Reduces empty space while maintaining readability
 */
export function optimizeGraphDensity(
  nodes: LayoutNode[],
  targetDensity: number = 0.7 // 0-1, higher = denser
): LayoutNode[] {
  if (nodes.length === 0) return nodes;

  // Calculate current bounding box
  const xs = nodes.map(n => n.x);
  const ys = nodes.map(n => n.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const currentWidth = maxX - minX;
  const currentHeight = maxY - minY;
  const currentArea = currentWidth * currentHeight;

  // Calculate ideal area based on target density
  const nodeArea = nodes.length * 10000; // Approximate area per node
  const idealArea = nodeArea / targetDensity;

  // Scale factor to achieve target density
  const scaleFactor = Math.sqrt(idealArea / Math.max(currentArea, 1));
  const clampedScale = Math.max(0.5, Math.min(1.2, scaleFactor)); // Limit scaling

  // Apply scaling and re-center
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  return nodes.map(n => ({
    ...n,
    x: (n.x - centerX) * clampedScale,
    y: (n.y - centerY) * clampedScale,
  }));
}
