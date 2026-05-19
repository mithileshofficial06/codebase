import { GraphNode, GraphEdge } from '@codemap/shared';

/**
 * Flow Detection Engine
 * Automatically infers execution flows from graph structure
 */

export interface FlowStep {
  nodeId: string;
  nodePath: string;
  nodeLabel: string;
  order: number;
  description: string;
  systemType: 'entry' | 'route' | 'middleware' | 'service' | 'model' | 'database' | 'ui' | 'utility';
}

export interface DetectedFlow {
  id: string;
  name: string;
  description: string;
  icon: string;
  complexity: 'low' | 'medium' | 'high';
  steps: FlowStep[];
  systemsInvolved: string[];
  estimatedRisk: 'low' | 'medium' | 'high';
  category: 'authentication' | 'api' | 'data' | 'ui' | 'business';
}

/**
 * Pattern-based flow detection rules
 */
const FLOW_PATTERNS = [
  {
    id: 'auth-flow',
    name: 'Authentication Flow',
    description: 'User authentication and session management',
    icon: '🔐',
    category: 'authentication' as const,
    entryPatterns: [/login|signin|auth/i],
    pathPatterns: [
      { pattern: /login|signin|auth/i, type: 'route' as const },
      { pattern: /auth|jwt|token|session/i, type: 'service' as const },
      { pattern: /user|account|profile/i, type: 'model' as const },
      { pattern: /database|db|store/i, type: 'database' as const },
    ],
  },
  {
    id: 'api-request-flow',
    name: 'API Request Flow',
    description: 'Standard API request processing',
    icon: '⚡',
    category: 'api' as const,
    entryPatterns: [/api|route|endpoint/i],
    pathPatterns: [
      { pattern: /route|endpoint|api/i, type: 'route' as const },
      { pattern: /middleware|guard|interceptor/i, type: 'middleware' as const },
      { pattern: /service|controller|handler/i, type: 'service' as const },
      { pattern: /model|schema|entity/i, type: 'model' as const },
    ],
  },
  {
    id: 'registration-flow',
    name: 'User Registration Flow',
    description: 'New user account creation',
    icon: '📝',
    category: 'authentication' as const,
    entryPatterns: [/register|signup|create.*account/i],
    pathPatterns: [
      { pattern: /register|signup/i, type: 'route' as const },
      { pattern: /validation|validator/i, type: 'middleware' as const },
      { pattern: /user.*service|account.*service/i, type: 'service' as const },
      { pattern: /user|account/i, type: 'model' as const },
      { pattern: /email|notification/i, type: 'service' as const },
    ],
  },
  {
    id: 'data-query-flow',
    name: 'Database Query Flow',
    description: 'Data retrieval and processing',
    icon: '💾',
    category: 'data' as const,
    entryPatterns: [/query|fetch|get|find/i],
    pathPatterns: [
      { pattern: /service|repository/i, type: 'service' as const },
      { pattern: /model|schema|entity/i, type: 'model' as const },
      { pattern: /database|db|orm/i, type: 'database' as const },
    ],
  },
  {
    id: 'ui-render-flow',
    name: 'UI Render Flow',
    description: 'Component rendering and data display',
    icon: '🎨',
    category: 'ui' as const,
    entryPatterns: [/page|component|view|screen/i],
    pathPatterns: [
      { pattern: /page|screen|view/i, type: 'ui' as const },
      { pattern: /component/i, type: 'ui' as const },
      { pattern: /hook|use/i, type: 'service' as const },
      { pattern: /store|state|context/i, type: 'service' as const },
    ],
  },
];

/**
 * Classify node system type based on path
 */
function classifySystemType(path: string): FlowStep['systemType'] {
  const lower = path.toLowerCase();
  
  if (/^(main|app|server|index)\./i.test(path.split('/').pop() || '')) return 'entry';
  if (/route|endpoint|api/i.test(lower)) return 'route';
  if (/middleware|guard|interceptor/i.test(lower)) return 'middleware';
  if (/service|controller|handler|manager/i.test(lower)) return 'service';
  if (/model|schema|entity|types/i.test(lower)) return 'model';
  if (/database|db|orm|prisma|sequelize/i.test(lower)) return 'database';
  if (/component|page|view|screen/i.test(lower)) return 'ui';
  
  return 'utility';
}

/**
 * Build dependency chain from a starting node
 */
function buildDependencyChain(
  startNodeId: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
  maxDepth: number = 6
): string[] {
  const visited = new Set<string>();
  const chain: string[] = [];
  
  function traverse(nodeId: string, depth: number) {
    if (depth > maxDepth || visited.has(nodeId)) return;
    
    visited.add(nodeId);
    chain.push(nodeId);
    
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    // Follow dependencies (imports)
    const outgoingEdges = edges.filter(e => e.source === nodeId);
    
    // Sort by relevance (prefer services, models over utilities)
    const sortedEdges = outgoingEdges.sort((a, b) => {
      const aNode = nodes.find(n => n.id === a.target);
      const bNode = nodes.find(n => n.id === b.target);
      if (!aNode || !bNode) return 0;
      
      const aType = classifySystemType(aNode.path);
      const bType = classifySystemType(bNode.path);
      
      const priority: Record<string, number> = {
        service: 5, model: 4, database: 3, middleware: 2, utility: 1
      };
      
      return (priority[bType] || 0) - (priority[aType] || 0);
    });
    
    // Traverse most relevant dependencies
    for (const edge of sortedEdges.slice(0, 3)) {
      traverse(edge.target, depth + 1);
    }
  }
  
  traverse(startNodeId, 0);
  return chain;
}

/**
 * Calculate flow complexity
 */
function calculateComplexity(steps: FlowStep[]): DetectedFlow['complexity'] {
  if (steps.length <= 3) return 'low';
  if (steps.length <= 6) return 'medium';
  return 'high';
}

/**
 * Estimate flow risk based on hotspots and complexity
 */
function estimateRisk(steps: FlowStep[], nodes: GraphNode[]): DetectedFlow['estimatedRisk'] {
  const hotspotCount = steps.filter(step => {
    const node = nodes.find(n => n.id === step.nodeId);
    return node && node.commitFrequency >= 10;
  }).length;
  
  const hotspotRatio = hotspotCount / Math.max(steps.length, 1);
  
  if (hotspotRatio > 0.4 || steps.length > 8) return 'high';
  if (hotspotRatio > 0.2 || steps.length > 5) return 'medium';
  return 'low';
}

/**
 * Generate step description
 */
function generateStepDescription(step: FlowStep, index: number, total: number): string {
  const descriptions: Record<FlowStep['systemType'], string> = {
    entry: 'Application entry point',
    route: 'Handles incoming request',
    middleware: 'Validates and processes request',
    service: 'Executes business logic',
    model: 'Manages data structure',
    database: 'Persists data',
    ui: 'Renders user interface',
    utility: 'Provides helper functions',
  };
  
  return descriptions[step.systemType] || `Step ${index + 1} of ${total}`;
}

/**
 * Main flow detection function
 */
export function detectFlows(nodes: GraphNode[], edges: GraphEdge[]): DetectedFlow[] {
  const detectedFlows: DetectedFlow[] = [];
  
  for (const pattern of FLOW_PATTERNS) {
    // Find entry points matching this flow pattern
    const entryNodes = nodes.filter(node => 
      pattern.entryPatterns.some(p => p.test(node.path) || p.test(node.label))
    );
    
    for (const entryNode of entryNodes.slice(0, 2)) { // Limit to 2 per pattern
      // Build dependency chain
      const chain = buildDependencyChain(entryNode.id, nodes, edges);
      
      if (chain.length < 2) continue; // Need at least 2 steps
      
      // Filter chain to match flow pattern
      const relevantSteps = chain.filter(nodeId => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return false;
        
        return pattern.pathPatterns.some(pp => pp.pattern.test(node.path));
      });
      
      if (relevantSteps.length < 2) continue;
      
      // Build flow steps
      const steps: FlowStep[] = relevantSteps.slice(0, 8).map((nodeId, index) => {
        const node = nodes.find(n => n.id === nodeId)!;
        const systemType = classifySystemType(node.path);
        
        return {
          nodeId,
          nodePath: node.path,
          nodeLabel: node.label,
          order: index,
          description: '',
          systemType,
        };
      });
      
      // Add descriptions
      steps.forEach((step, i) => {
        step.description = generateStepDescription(step, i, steps.length);
      });
      
      // Extract unique systems
      const systemsInvolved = [...new Set(steps.map(s => s.systemType))];
      
      const flow: DetectedFlow = {
        id: `${pattern.id}-${entryNode.id}`,
        name: pattern.name,
        description: pattern.description,
        icon: pattern.icon,
        complexity: calculateComplexity(steps),
        steps,
        systemsInvolved: systemsInvolved,
        estimatedRisk: estimateRisk(steps, nodes),
        category: pattern.category,
      };
      
      detectedFlows.push(flow);
    }
  }
  
  // Remove duplicate flows (same steps)
  const uniqueFlows = detectedFlows.filter((flow, index, self) => {
    return index === self.findIndex(f => 
      f.steps.map(s => s.nodeId).join(',') === flow.steps.map(s => s.nodeId).join(',')
    );
  });
  
  // Sort by complexity and relevance
  return uniqueFlows.sort((a, b) => {
    const categoryPriority: Record<string, number> = {
      authentication: 5, api: 4, business: 3, data: 2, ui: 1
    };
    return (categoryPriority[b.category] || 0) - (categoryPriority[a.category] || 0);
  }).slice(0, 10); // Limit to top 10 flows
}

/**
 * Get flow narrative for AI explanation
 */
export function generateFlowNarrative(flow: DetectedFlow, nodes: GraphNode[]): string {
  const stepDescriptions = flow.steps.map((step, i) => {
    const node = nodes.find(n => n.id === step.nodeId);
    const connector = i === 0 ? 'starts at' : i === flow.steps.length - 1 ? 'finally reaches' : 'moves to';
    return `${connector} ${step.nodeLabel} (${step.description.toLowerCase()})`;
  });
  
  return `${flow.description}. The flow ${stepDescriptions.join(', then ')}.`;
}
