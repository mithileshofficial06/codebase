/**
 * Semantic Architecture Engine
 * HYBRID INTELLIGENCE: Combines import parsing + semantic fallback clustering
 * Fixes: scattered nodes, weak clustering, meaningless empty space
 */

import { GraphNode, GraphEdge } from '@codemap/shared';

export interface SemanticCluster {
  id: string;
  label: string;
  humanLabel: string;
  folder: string;
  files: GraphNode[];
  fileCount: number;
  totalSize: number;
  avgCommitFreq: number;
  hotspotCount: number;
  isEntryPoint: boolean;
  color: string;
  icon: string;
  confidence: 'high' | 'medium' | 'low'; // Clustering confidence
  semanticType: string; // config, ui, api, service, etc.
  layerGravity: { x: number; y: number }; // Positional bias for layout
}

export interface SemanticEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  type: 'import' | 'semantic' | 'anchor'; // Edge type
  confidence: number; // 0-1
}

/**
 * SEMANTIC GROUPING RULES
 * Even with weak/missing imports, intelligently group files
 */

interface SemanticRule {
  id: string;
  patterns: RegExp[];
  label: string;
  humanLabel: string;
  icon: string;
  color: string;
  priority: number;
  semanticType: string;
  layerGravity: { x: number; y: number }; // Position bias
}

const SEMANTIC_RULES: SemanticRule[] = [
  // Config/System files (drift outward, top-right)
  {
    id: 'config',
    patterns: [
      /^package\.json$/i,
      /^tsconfig.*\.json$/i,
      /^vercel\.json$/i,
      /^vite\.config\./i,
      /^next\.config\./i,
      /^tailwind\.config\./i,
      /^eslint/i,
      /^\.env/i,
      /^webpack\.config/i,
      /^babel\.config/i,
      /^jest\.config/i,
      /^prettier/i,
    ],
    label: 'Project Configuration',
    humanLabel: 'Configuration & Build System',
    icon: '⚙️',
    color: '#94a3b8',
    priority: 100,
    semanticType: 'config',
    layerGravity: { x: 400, y: -300 },
  },

  // Next.js/React Pages (top layer)
  {
    id: 'pages',
    patterns: [
      /\/(app|pages)\/.*\/(page|layout)\.(tsx?|jsx?)$/i,
      /\/(app|pages)\/.*\.tsx?$/i,
      /\/pages\//i,
    ],
    label: 'Application Pages',
    humanLabel: 'Pages & Layouts',
    icon: '📄',
    color: '#10b981',
    priority: 95,
    semanticType: 'ui',
    layerGravity: { x: 0, y: -400 },
  },

  // React Components (upper layer)
  {
    id: 'components',
    patterns: [
      /\/components?\//i,
      /\/ui\//i,
      /\/widgets?\//i,
      /Button\.(tsx?|jsx?)$/i,
      /Modal\.(tsx?|jsx?)$/i,
      /Card\.(tsx?|jsx?)$/i,
      /Navbar\.(tsx?|jsx?)$/i,
    ],
    label: 'UI Components',
    humanLabel: 'User Interface Components',
    icon: '🧩',
    color: '#06b6d4',
    priority: 90,
    semanticType: 'ui',
    layerGravity: { x: -300, y: -200 },
  },

  // Custom Hooks (upper-mid layer)
  {
    id: 'hooks',
    patterns: [
      /\/hooks?\//i,
      /\/use[A-Z]/,
      /^use[A-Z].*\.(ts|tsx|js|jsx)$/,
    ],
    label: 'Custom Hooks',
    humanLabel: 'React Hooks',
    icon: '🪝',
    color: '#60a5fa',
    priority: 85,
    semanticType: 'ui',
    layerGravity: { x: -200, y: -100 },
  },

  // State Management (mid layer)
  {
    id: 'state',
    patterns: [
      /\/(store|stores?|state)\//i,
      /\/context\//i,
      /\/redux\//i,
      /\/zustand\//i,
      /Store\.(ts|tsx|js|jsx)$/i,
    ],
    label: 'State Management',
    humanLabel: 'State & Data Flow',
    icon: '🔄',
    color: '#a855f7',
    priority: 80,
    semanticType: 'service',
    layerGravity: { x: 0, y: 0 },
  },

  // API Routes (mid layer)
  {
    id: 'api',
    patterns: [
      /\/(api|routes?|routers?|endpoints?)\//i,
      /\/controllers?\//i,
    ],
    label: 'API Layer',
    humanLabel: 'API Routes & Controllers',
    icon: '⚡',
    color: '#f59e0b',
    priority: 88,
    semanticType: 'api',
    layerGravity: { x: 0, y: 100 },
  },

  // Services/Business Logic (lower-mid layer)
  {
    id: 'services',
    patterns: [
      /\/services?\//i,
      /\/providers?\//i,
      /\/managers?\//i,
      /Service\.(ts|tsx|js|jsx)$/i,
    ],
    label: 'Business Logic',
    humanLabel: 'Services & Business Logic',
    icon: '⚙️',
    color: '#3b82f6',
    priority: 75,
    semanticType: 'service',
    layerGravity: { x: 0, y: 200 },
  },

  // Models/Schema (lower layer)
  {
    id: 'models',
    patterns: [
      /\/models?\//i,
      /\/schemas?\//i,
      /\/entities?\//i,
      /\/types?\//i,
    ],
    label: 'Data Models',
    humanLabel: 'Data Models & Schemas',
    icon: '🗄️',
    color: '#8b5cf6',
    priority: 70,
    semanticType: 'model',
    layerGravity: { x: 0, y: 300 },
  },

  // Database (bottom layer)
  {
    id: 'database',
    patterns: [
      /\/(database|db|prisma|migrations?|seeds?)\//i,
      /\.prisma$/i,
    ],
    label: 'Database Layer',
    humanLabel: 'Database & Persistence',
    icon: '💾',
    color: '#f97316',
    priority: 68,
    semanticType: 'database',
    layerGravity: { x: 0, y: 400 },
  },

  // Authentication (mid-high priority)
  {
    id: 'auth',
    patterns: [
      /\/(auth|authentication|login|signup)\//i,
      /auth.*\.(ts|tsx|js|jsx)$/i,
    ],
    label: 'Authentication',
    humanLabel: 'Authentication System',
    icon: '🔐',
    color: '#dc2626',
    priority: 92,
    semanticType: 'service',
    layerGravity: { x: 300, y: 0 },
  },

  // Middleware (mid layer)
  {
    id: 'middleware',
    patterns: [
      /\/middleware\//i,
      /\/guards?\//i,
      /\/interceptors?\//i,
    ],
    label: 'Middleware',
    humanLabel: 'Middleware & Guards',
    icon: '🛡️',
    color: '#ef4444',
    priority: 78,
    semanticType: 'middleware',
    layerGravity: { x: 200, y: 100 },
  },

  // Utilities (drift outward, bottom-left)
  {
    id: 'utils',
    patterns: [
      /\/(utils?|helpers?|lib|common)\//i,
      /utils?\.(ts|tsx|js|jsx)$/i,
      /helpers?\.(ts|tsx|js|jsx)$/i,
      /constants?\.(ts|tsx|js|jsx)$/i,
    ],
    label: 'Utilities',
    humanLabel: 'Utility Functions',
    icon: '🔧',
    color: '#6b7280',
    priority: 50,
    semanticType: 'utility',
    layerGravity: { x: -400, y: 300 },
  },

  // Tests (drift outward, left)
  {
    id: 'tests',
    patterns: [
      /\/(tests?|__tests__|spec|testing)\//i,
      /\.(test|spec)\.(ts|tsx|js|jsx)$/i,
    ],
    label: 'Tests',
    humanLabel: 'Test Suite',
    icon: '🧪',
    color: '#22c55e',
    priority: 45,
    semanticType: 'test',
    layerGravity: { x: -400, y: -300 },
  },

  // Styles (drift outward, right)
  {
    id: 'styles',
    patterns: [
      /\/(styles?|css|scss|themes?)\//i,
      /\.(css|scss|sass)$/i,
      /globals\.css$/i,
    ],
    label: 'Styles',
    humanLabel: 'Styling & Themes',
    icon: '🎨',
    color: '#c084fc',
    priority: 40,
    semanticType: 'style',
    layerGravity: { x: 400, y: 200 },
  },

  // Assets (drift outward, bottom-right)
  {
    id: 'assets',
    patterns: [
      /\/(static|public|assets?|images?|media)\//i,
      /\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf)$/i,
    ],
    label: 'Assets',
    humanLabel: 'Static Assets',
    icon: '📦',
    color: '#78716c',
    priority: 30,
    semanticType: 'asset',
    layerGravity: { x: 400, y: 400 },
  },
];

/**
 * ENTRYPOINT DETECTION
 */
const ENTRY_POINT_PATTERNS = [
  /^(main|app|server|index)\.(py|ts|tsx|js|jsx|mjs)$/i,
  /^(manage|wsgi|asgi)\.(py)$/i,
  /^page\.tsx?$/i,
  /^layout\.tsx?$/i,
];

function isEntryPoint(filePath: string): boolean {
  const fileName = filePath.split('/').pop() || '';
  return ENTRY_POINT_PATTERNS.some(p => p.test(fileName));
}

/**
 * FRAMEWORK DETECTION
 */
interface FrameworkSignature {
  name: string;
  patterns: RegExp[];
  conventions: {
    entryPoints: RegExp[];
    routing: RegExp[];
    components: RegExp[];
  };
}

const FRAMEWORKS: FrameworkSignature[] = [
  {
    name: 'Next.js',
    patterns: [/next\.config/i, /\/app\/.*page\.tsx?$/i, /\/pages\//i],
    conventions: {
      entryPoints: [/\/app\/page\.tsx?$/i, /\/pages\/index\.tsx?$/i],
      routing: [/\/app\/.*\/page\.tsx?$/i, /\/pages\/.*\.tsx?$/i],
      components: [/\/components?\//i],
    },
  },
  {
    name: 'React',
    patterns: [/react/i, /\.tsx?$/i],
    conventions: {
      entryPoints: [/^(index|main|app)\.(tsx?|jsx?)$/i],
      routing: [],
      components: [/\/components?\//i],
    },
  },
  {
    name: 'Express',
    patterns: [/express/i, /\/routes?\//i, /\/api\//i],
    conventions: {
      entryPoints: [/^(server|app|index)\.(ts|js)$/i],
      routing: [/\/routes?\//i, /\/api\//i],
      components: [/\/controllers?\//i, /\/services?\//i],
    },
  },
];

function detectFramework(nodes: GraphNode[]): FrameworkSignature | null {
  for (const fw of FRAMEWORKS) {
    const matchCount = nodes.filter(n => 
      fw.patterns.some(p => p.test(n.path) || p.test(n.label))
    ).length;
    
    if (matchCount > 0) return fw;
  }
  return null;
}

/**
 * SEMANTIC CLUSTERING WITH FALLBACK
 */
export function buildSemanticArchitecture(
  nodes: GraphNode[],
  edges: GraphEdge[]
): {
  clusters: SemanticCluster[];
  semanticEdges: SemanticEdge[];
  framework: string | null;
} {
  const framework = detectFramework(nodes);
  
  // Step 1: Semantic grouping (rule-based)
  const clusterMap = new Map<string, GraphNode[]>();
  const clusterMeta = new Map<string, SemanticRule>();
  const unmatchedNodes: GraphNode[] = [];

  for (const node of nodes) {
    let matched = false;

    // Try to match against semantic rules (priority order)
    const sortedRules = [...SEMANTIC_RULES].sort((a, b) => b.priority - a.priority);
    
    for (const rule of sortedRules) {
      if (rule.patterns.some(p => p.test(node.path) || p.test(node.label))) {
        if (!clusterMap.has(rule.id)) {
          clusterMap.set(rule.id, []);
          clusterMeta.set(rule.id, rule);
        }
        clusterMap.get(rule.id)!.push(node);
        matched = true;
        break;
      }
    }

    if (!matched) {
      unmatchedNodes.push(node);
    }
  }

  // Step 2: Fallback clustering for unmatched nodes (folder-based)
  const folderClusters = new Map<string, GraphNode[]>();
  
  for (const node of unmatchedNodes) {
    const parts = node.path.split('/');
    const folder = parts.length > 1 ? parts.slice(0, Math.min(2, parts.length - 1)).join('/') : '_root';
    
    if (!folderClusters.has(folder)) {
      folderClusters.set(folder, []);
    }
    folderClusters.get(folder)!.push(node);
  }

  // Add folder clusters with lower confidence
  for (const [folder, files] of folderClusters) {
    if (files.length >= 1) { // Keep even single files to avoid floating
      const clusterId = `folder-${folder}`;
      clusterMap.set(clusterId, files);
      clusterMeta.set(clusterId, {
        id: clusterId,
        patterns: [],
        label: folder,
        humanLabel: humanizeFolderName(folder),
        icon: '📁',
        color: hashColor(folder),
        priority: 20,
        semanticType: 'folder',
        layerGravity: { x: 0, y: 0 }, // Center by default
      });
    }
  }

  // Step 3: Build SemanticCluster objects
  const nodeToCluster = new Map<string, string>();
  const clusters: SemanticCluster[] = [];

  for (const [clusterId, files] of clusterMap) {
    const meta = clusterMeta.get(clusterId)!;

    for (const file of files) {
      nodeToCluster.set(file.id, clusterId);
    }

    const avgCommitFreq = files.reduce((s, f) => s + f.commitFrequency, 0) / Math.max(files.length, 1);
    const hotspotCount = files.filter(f => f.commitFrequency >= 10).length;
    const confidence = meta.priority >= 70 ? 'high' : meta.priority >= 40 ? 'medium' : 'low';

    clusters.push({
      id: clusterId,
      label: meta.label,
      humanLabel: meta.humanLabel,
      folder: clusterId,
      files,
      fileCount: files.length,
      totalSize: files.reduce((s, f) => s + f.size, 0),
      avgCommitFreq,
      hotspotCount,
      isEntryPoint: files.some(f => isEntryPoint(f.path)),
      color: meta.color,
      icon: meta.icon,
      confidence,
      semanticType: meta.semanticType,
      layerGravity: meta.layerGravity,
    });
  }

  // Sort: entry points first, then by confidence and file count
  clusters.sort((a, b) => {
    if (a.isEntryPoint !== b.isEntryPoint) return a.isEntryPoint ? -1 : 1;
    const confScore = { high: 3, medium: 2, low: 1 };
    if (confScore[a.confidence] !== confScore[b.confidence]) {
      return confScore[b.confidence] - confScore[a.confidence];
    }
    return b.fileCount - a.fileCount;
  });

  // Step 4: Build semantic edges (import + anchor edges)
  const semanticEdges: SemanticEdge[] = [];
  const edgeMap = new Map<string, { weight: number; type: 'import' | 'semantic' }>();

  // Import-based edges
  for (const edge of edges) {
    const srcCluster = nodeToCluster.get(edge.source);
    const tgtCluster = nodeToCluster.get(edge.target);
    
    if (srcCluster && tgtCluster && srcCluster !== tgtCluster) {
      const key = `${srcCluster}→${tgtCluster}`;
      const existing = edgeMap.get(key);
      edgeMap.set(key, {
        weight: (existing?.weight || 0) + 1,
        type: 'import',
      });
    }
  }

  // Anchor edges for weakly connected clusters (prevent floating)
  for (const cluster of clusters) {
    const hasOutgoing = Array.from(edgeMap.keys()).some(k => k.startsWith(cluster.id + '→'));
    const hasIncoming = Array.from(edgeMap.keys()).some(k => k.endsWith('→' + cluster.id));
    
    if (!hasOutgoing && !hasIncoming && cluster.semanticType !== 'config') {
      // Find nearest semantic neighbor
      const nearestCluster = clusters.find(c => 
        c.id !== cluster.id && 
        c.semanticType === cluster.semanticType &&
        (c.fileCount > cluster.fileCount || c.confidence === 'high')
      );
      
      if (nearestCluster) {
        const key = `${nearestCluster.id}→${cluster.id}`;
        edgeMap.set(key, { weight: 1, type: 'semantic' });
      }
    }
  }

  // Convert to SemanticEdge array
  for (const [key, data] of edgeMap) {
    const [source, target] = key.split('→');
    semanticEdges.push({
      id: `se-${semanticEdges.length}`,
      source,
      target,
      weight: data.weight,
      type: data.type,
      confidence: data.type === 'import' ? 0.9 : 0.5,
    });
  }

  return {
    clusters,
    semanticEdges,
    framework: framework?.name || null,
  };
}

/**
 * Helpers
 */
function humanizeFolderName(folder: string): string {
  const last = folder.split('/').pop() || folder;
  return last
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())
    + ' Module';
}

function hashColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = ((hash % 360) + 360) % 360;
  return `hsl(${hue}, 55%, 50%)`;
}
