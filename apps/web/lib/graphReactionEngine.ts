/**
 * Graph Reaction Engine
 * Synchronizes AI responses with graph interactions
 */

import { GraphNode } from '@codemap/shared/types';
import { ClusterNode } from './architectureEngine';
import { DetectedFlow } from './flowDetection';

export interface GraphReaction {
  type: 'zoomToNode' | 'focusCluster' | 'playFlow' | 'highlightDependencies' | 'pulseHotspots';
  target: string;
  metadata?: any;
}

/**
 * Extract file references from AI response
 */
export function extractFileReferences(text: string, nodes: GraphNode[]): string[] {
  const references: string[] = [];
  const nodeLabels = nodes.map(n => n.label);
  
  // Match file patterns: filename.ext
  const filePattern = /\b([\w.-]+\.(ts|tsx|js|jsx|py|css|scss|html|json|md|yaml|yml|go|rs|java|rb))\b/gi;
  const matches = text.matchAll(filePattern);
  
  for (const match of matches) {
    const filename = match[1];
    // Check if this file exists in our graph
    if (nodeLabels.includes(filename)) {
      references.push(filename);
    }
  }
  
  return [...new Set(references)]; // Remove duplicates
}

/**
 * Extract cluster/module references from AI response
 */
export function extractClusterReferences(text: string, clusters: ClusterNode[]): string[] {
  const references: string[] = [];
  
  clusters.forEach(cluster => {
    const patterns = [
      new RegExp(`\\b${cluster.humanLabel}\\b`, 'i'),
      new RegExp(`\\b${cluster.label}\\b`, 'i'),
      new RegExp(`\\b${cluster.folder}\\b`, 'i'),
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        references.push(cluster.id);
        break;
      }
    }
  });
  
  return [...new Set(references)];
}

/**
 * Extract flow references from AI response
 */
export function extractFlowReferences(text: string, flows: DetectedFlow[]): string[] {
  const references: string[] = [];
  
  flows.forEach(flow => {
    const patterns = [
      new RegExp(`\\b${flow.name}\\b`, 'i'),
      new RegExp(`\\b${flow.description}\\b`, 'i'),
    ];
    
    for (const pattern of patterns) {
      if (pattern.test(text)) {
        references.push(flow.id);
        break;
      }
    }
  });
  
  return [...new Set(references)];
}

/**
 * Detect intent from user question
 */
export function detectQuestionIntent(question: string): {
  type: 'architecture' | 'flow' | 'risk' | 'onboarding' | 'refactoring' | 'general';
  keywords: string[];
} {
  const lower = question.toLowerCase();
  
  // Architecture questions
  if (/how does|explain|what is|architecture|structure|system|module/i.test(lower)) {
    return { type: 'architecture', keywords: ['explain', 'architecture', 'system'] };
  }
  
  // Flow questions
  if (/flow|lifecycle|process|journey|path|request|data.*reach/i.test(lower)) {
    return { type: 'flow', keywords: ['flow', 'lifecycle', 'process'] };
  }
  
  // Risk questions
  if (/risk|break|fail|coupled|dangerous|hotspot|change|modify/i.test(lower)) {
    return { type: 'risk', keywords: ['risk', 'break', 'coupled'] };
  }
  
  // Onboarding questions
  if (/start|begin|explore|important|entry|where.*should/i.test(lower)) {
    return { type: 'onboarding', keywords: ['start', 'explore', 'entry'] };
  }
  
  // Refactoring questions
  if (/refactor|decouple|improve|technical debt|optimize|clean/i.test(lower)) {
    return { type: 'refactoring', keywords: ['refactor', 'decouple', 'improve'] };
  }
  
  return { type: 'general', keywords: [] };
}

/**
 * Generate graph reactions based on AI response
 */
export function generateGraphReactions(
  aiResponse: string,
  nodes: GraphNode[],
  clusters: ClusterNode[],
  flows: DetectedFlow[]
): GraphReaction[] {
  const reactions: GraphReaction[] = [];
  
  // Extract references
  const fileRefs = extractFileReferences(aiResponse, nodes);
  const clusterRefs = extractClusterReferences(aiResponse, clusters);
  const flowRefs = extractFlowReferences(aiResponse, flows);
  
  // Generate reactions based on references
  if (fileRefs.length > 0) {
    // Highlight first mentioned file
    reactions.push({
      type: 'zoomToNode',
      target: fileRefs[0],
      metadata: { allReferences: fileRefs },
    });
  }
  
  if (clusterRefs.length > 0) {
    // Focus on first mentioned cluster
    reactions.push({
      type: 'focusCluster',
      target: clusterRefs[0],
      metadata: { allReferences: clusterRefs },
    });
  }
  
  if (flowRefs.length > 0) {
    // Suggest flow playback
    reactions.push({
      type: 'playFlow',
      target: flowRefs[0],
      metadata: { allReferences: flowRefs },
    });
  }
  
  return reactions;
}

/**
 * Create clickable reference markup
 */
export interface ClickableReference {
  type: 'file' | 'cluster' | 'flow';
  text: string;
  target: string;
  startIndex: number;
  endIndex: number;
}

export function extractClickableReferences(
  text: string,
  nodes: GraphNode[],
  clusters: ClusterNode[],
  flows: DetectedFlow[]
): ClickableReference[] {
  const references: ClickableReference[] = [];
  
  // Extract file references
  const filePattern = /\b([\w.-]+\.(ts|tsx|js|jsx|py|css|scss|html|json|md|yaml|yml|go|rs|java|rb))\b/gi;
  let match;
  
  while ((match = filePattern.exec(text)) !== null) {
    const filename = match[1];
    const node = nodes.find(n => n.label === filename);
    
    if (node) {
      references.push({
        type: 'file',
        text: filename,
        target: node.id,
        startIndex: match.index,
        endIndex: match.index + filename.length,
      });
    }
  }
  
  // Extract cluster references (case-insensitive)
  clusters.forEach(cluster => {
    const patterns = [cluster.humanLabel, cluster.label];
    
    patterns.forEach(pattern => {
      const regex = new RegExp(`\\b${pattern}\\b`, 'gi');
      let match;
      
      while ((match = regex.exec(text)) !== null) {
        // Check if this position is already covered by a file reference
        const overlaps = references.some(
          ref => match!.index >= ref.startIndex && match!.index < ref.endIndex
        );
        
        if (!overlaps) {
          references.push({
            type: 'cluster',
            text: match[0],
            target: cluster.id,
            startIndex: match.index,
            endIndex: match.index + match[0].length,
          });
        }
      }
    });
  });
  
  // Extract flow references
  flows.forEach(flow => {
    const regex = new RegExp(`\\b${flow.name}\\b`, 'gi');
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      const overlaps = references.some(
        ref => match!.index >= ref.startIndex && match!.index < ref.endIndex
      );
      
      if (!overlaps) {
        references.push({
          type: 'flow',
          text: match[0],
          target: flow.id,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }
  });
  
  // Sort by start index
  return references.sort((a, b) => a.startIndex - b.startIndex);
}
