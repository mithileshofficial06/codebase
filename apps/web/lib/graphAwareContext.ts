/**
 * Graph-Aware Context Builder
 * Transforms raw graph data into structured intelligence for AI
 */

import { GraphNode, GraphEdge } from '@codemap/shared/types';
import { ClusterNode, ClusterEdge } from './architectureEngine';
import { DetectedFlow } from './flowDetection';

export interface GraphAwareContext {
  // Architecture understanding
  architectureClusters: {
    id: string;
    name: string;
    type: string;
    fileCount: number;
    isEntryPoint: boolean;
    hotspotCount: number;
    avgCommitFreq: number;
  }[];
  
  // Dependency intelligence
  dependencyGraph: {
    coreNodes: string[];
    hotspotNodes: string[];
    stableNodes: string[];
    utilityNodes: string[];
    criticalPaths: string[][];
  };
  
  // Flow understanding
  detectedFlows: {
    id: string;
    name: string;
    description: string;
    complexity: string;
    risk: string;
    steps: string[];
  }[];
  
  // Risk analysis
  riskMetrics: {
    highRiskFiles: string[];
    tightlyCoupledModules: string[];
    changeHotspots: string[];
  };
  
  // Current focus context
  currentFocus: {
    focusedNode: string | null;
    focusedCluster: string | null;
    activeFlow: string | null;
    viewLevel: string;
  };
  
  // Health metrics
  healthMetrics: {
    overall: number;
    complexity: number;
    maintainability: number;
    testCoverage: number;
  };
  
  // Entry points for onboarding
  entryPoints: string[];
}

/**
 * Build structured context from graph data
 */
export function buildGraphAwareContext(
  nodes: GraphNode[],
  edges: GraphEdge[],
  clusters: ClusterNode[],
  clusterEdges: ClusterEdge[],
  flows: DetectedFlow[],
  focusedNodeId: string | null,
  focusedClusterId: string | null,
  activeFlow: DetectedFlow | null,
  viewLevel: string,
  healthMetrics: any
): GraphAwareContext {
  // Classify nodes
  const coreNodes: string[] = [];
  const hotspotNodes: string[] = [];
  const stableNodes: string[] = [];
  const utilityNodes: string[] = [];
  
  nodes.forEach(node => {
    if (node.commitFrequency >= 10) {
      hotspotNodes.push(node.label);
    } else if (node.dependencies.length >= 3 || node.dependents.length >= 3) {
      coreNodes.push(node.label);
    } else if (node.commitFrequency <= 1 && node.dependencies.length === 0 && node.dependents.length === 0) {
      utilityNodes.push(node.label);
    } else {
      stableNodes.push(node.label);
    }
  });
  
  // Find critical paths (nodes with high connectivity)
  const criticalPaths: string[][] = [];
  const highConnectivityNodes = nodes
    .filter(n => n.dependencies.length + n.dependents.length >= 5)
    .slice(0, 3);
  
  highConnectivityNodes.forEach(node => {
    const path = [node.label];
    // Add top 2 dependencies
    node.dependencies.slice(0, 2).forEach(depId => {
      const dep = nodes.find(n => n.id === depId);
      if (dep) path.push(dep.label);
    });
    if (path.length > 1) criticalPaths.push(path);
  });
  
  // Architecture clusters
  const architectureClusters = clusters.map(c => ({
    id: c.id,
    name: c.humanLabel,
    type: c.label,
    fileCount: c.fileCount,
    isEntryPoint: c.isEntryPoint,
    hotspotCount: c.hotspotCount,
    avgCommitFreq: c.avgCommitFreq,
  }));
  
  // Detected flows
  const detectedFlowsSummary = flows.map(f => ({
    id: f.id,
    name: f.name,
    description: f.description,
    complexity: f.complexity,
    risk: f.estimatedRisk,
    steps: f.steps.map(s => s.nodeLabel),
  }));
  
  // Risk metrics
  const highRiskFiles = hotspotNodes.slice(0, 10);
  const tightlyCoupledModules = coreNodes.slice(0, 8);
  const changeHotspots = nodes
    .filter(n => n.commitFrequency >= 5)
    .sort((a, b) => b.commitFrequency - a.commitFrequency)
    .slice(0, 8)
    .map(n => n.label);
  
  // Entry points
  const entryPoints = clusters
    .filter(c => c.isEntryPoint)
    .map(c => c.humanLabel);
  
  // Current focus
  let focusedNodeName: string | null = null;
  let focusedClusterName: string | null = null;
  
  if (focusedNodeId) {
    const node = nodes.find(n => n.id === focusedNodeId);
    focusedNodeName = node ? node.label : null;
  }
  
  if (focusedClusterId) {
    const cluster = clusters.find(c => c.id === focusedClusterId);
    focusedClusterName = cluster ? cluster.humanLabel : null;
  }
  
  return {
    architectureClusters,
    dependencyGraph: {
      coreNodes,
      hotspotNodes,
      stableNodes,
      utilityNodes,
      criticalPaths,
    },
    detectedFlows: detectedFlowsSummary,
    riskMetrics: {
      highRiskFiles,
      tightlyCoupledModules,
      changeHotspots,
    },
    currentFocus: {
      focusedNode: focusedNodeName,
      focusedCluster: focusedClusterName,
      activeFlow: activeFlow ? activeFlow.name : null,
      viewLevel,
    },
    healthMetrics: {
      overall: healthMetrics.overall || 0,
      complexity: healthMetrics.complexity || 0,
      maintainability: healthMetrics.maintainability || 0,
      testCoverage: healthMetrics.testCoverage || 0,
    },
    entryPoints,
  };
}

/**
 * Generate context-aware suggested questions
 */
export function generateSuggestedQuestions(context: GraphAwareContext): string[] {
  const suggestions: string[] = [];
  
  // Focus-aware suggestions
  if (context.currentFocus.focusedNode) {
    suggestions.push(`How does ${context.currentFocus.focusedNode} work?`);
    suggestions.push(`What depends on ${context.currentFocus.focusedNode}?`);
  } else if (context.currentFocus.focusedCluster) {
    suggestions.push(`Explain the ${context.currentFocus.focusedCluster} system`);
    suggestions.push(`What are the risks in ${context.currentFocus.focusedCluster}?`);
  } else if (context.currentFocus.activeFlow) {
    suggestions.push(`Explain the ${context.currentFocus.activeFlow}`);
    suggestions.push(`What could break in this flow?`);
  }
  
  // Architecture-level suggestions
  if (context.architectureClusters.length > 0 && suggestions.length < 3) {
    suggestions.push('How does the architecture work?');
    suggestions.push('Which systems are most important?');
  }
  
  // Risk-aware suggestions
  if (context.riskMetrics.highRiskFiles.length > 0 && suggestions.length < 3) {
    suggestions.push('Which files are risky to change?');
    suggestions.push('Where is technical debt concentrated?');
  }
  
  // Flow suggestions
  if (context.detectedFlows.length > 0 && suggestions.length < 3) {
    const firstFlow = context.detectedFlows[0];
    suggestions.push(`Explain the ${firstFlow.name.toLowerCase()}`);
  }
  
  // Onboarding suggestions
  if (context.entryPoints.length > 0 && suggestions.length < 3) {
    suggestions.push('Where should I start exploring?');
  }
  
  // Generic fallbacks
  if (suggestions.length < 3) {
    suggestions.push('Which modules are tightly coupled?');
  }
  if (suggestions.length < 3) {
    suggestions.push('Show me the request lifecycle');
  }
  
  return suggestions.slice(0, 3);
}

/**
 * Format context for AI prompt
 */
export function formatContextForAI(context: GraphAwareContext): string {
  const sections: string[] = [];
  
  // Architecture overview
  sections.push('=== ARCHITECTURE ===');
  sections.push(`Modules: ${context.architectureClusters.length}`);
  context.architectureClusters.forEach(c => {
    const tags = [];
    if (c.isEntryPoint) tags.push('ENTRY');
    if (c.hotspotCount > 0) tags.push(`${c.hotspotCount} HOTSPOTS`);
    sections.push(`- ${c.name} (${c.fileCount} files)${tags.length > 0 ? ` [${tags.join(', ')}]` : ''}`);
  });
  
  // Dependency intelligence
  sections.push('\n=== DEPENDENCY GRAPH ===');
  if (context.dependencyGraph.coreNodes.length > 0) {
    sections.push(`Core nodes (high connectivity): ${context.dependencyGraph.coreNodes.slice(0, 8).join(', ')}`);
  }
  if (context.dependencyGraph.hotspotNodes.length > 0) {
    sections.push(`Hotspot nodes (high change frequency): ${context.dependencyGraph.hotspotNodes.slice(0, 8).join(', ')}`);
  }
  if (context.dependencyGraph.criticalPaths.length > 0) {
    sections.push('Critical paths:');
    context.dependencyGraph.criticalPaths.forEach(path => {
      sections.push(`  ${path.join(' → ')}`);
    });
  }
  
  // Detected flows
  if (context.detectedFlows.length > 0) {
    sections.push('\n=== DETECTED FLOWS ===');
    context.detectedFlows.forEach(f => {
      sections.push(`${f.name} [${f.complexity} complexity, ${f.risk} risk]:`);
      sections.push(`  ${f.steps.join(' → ')}`);
    });
  }
  
  // Risk analysis
  sections.push('\n=== RISK ANALYSIS ===');
  if (context.riskMetrics.highRiskFiles.length > 0) {
    sections.push(`High-risk files: ${context.riskMetrics.highRiskFiles.slice(0, 6).join(', ')}`);
  }
  if (context.riskMetrics.tightlyCoupledModules.length > 0) {
    sections.push(`Tightly coupled: ${context.riskMetrics.tightlyCoupledModules.slice(0, 6).join(', ')}`);
  }
  
  // Current focus
  if (context.currentFocus.focusedNode || context.currentFocus.focusedCluster || context.currentFocus.activeFlow) {
    sections.push('\n=== CURRENT FOCUS ===');
    if (context.currentFocus.focusedNode) {
      sections.push(`User is focused on: ${context.currentFocus.focusedNode}`);
    }
    if (context.currentFocus.focusedCluster) {
      sections.push(`User is exploring: ${context.currentFocus.focusedCluster} cluster`);
    }
    if (context.currentFocus.activeFlow) {
      sections.push(`Active flow: ${context.currentFocus.activeFlow}`);
    }
  }
  
  // Health metrics
  sections.push('\n=== HEALTH METRICS ===');
  sections.push(`Overall: ${context.healthMetrics.overall}/100`);
  sections.push(`Complexity: ${context.healthMetrics.complexity}/100`);
  sections.push(`Maintainability: ${context.healthMetrics.maintainability}/100`);
  
  // Entry points
  if (context.entryPoints.length > 0) {
    sections.push('\n=== ENTRY POINTS ===');
    sections.push(context.entryPoints.join(', '));
  }
  
  return sections.join('\n');
}
