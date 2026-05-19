import { GraphNode, GraphEdge } from '@codemap/shared';

/* ═══════════════════════════════════════════════════════════════════
   Architecture Engine — Smart Cluster Detection
   Transforms flat file lists into architectural modules
   ═══════════════════════════════════════════════════════════════════ */

export interface ClusterNode {
  id: string;
  label: string;           // "API Routes", "Services", etc.
  humanLabel: string;       // "Authentication System" — richer label
  folder: string;           // "backend/app/routers"
  files: GraphNode[];
  fileCount: number;
  totalSize: number;
  avgCommitFreq: number;
  hotspotCount: number;
  isEntryPoint: boolean;
  color: string;
  icon: string;             // Emoji/icon hint for the UI
}

export interface ClusterEdge {
  id: string;
  source: string;
  target: string;
  weight: number;           // Number of file-level edges between clusters
}

export interface ArchitectureData {
  clusters: ClusterNode[];
  clusterEdges: ClusterEdge[];
  entryPoints: GraphNode[];
}

/* ─── Architectural pattern detection ─────────────────────────── */

interface PatternRule {
  patterns: RegExp[];
  label: string;
  humanLabel: string;
  icon: string;
  color: string;
  priority: number;         // Higher = matched first
}

const ARCH_PATTERNS: PatternRule[] = [
  {
    patterns: [/\/(routers?|routes?|api|endpoints?)\//i, /\/api\//i],
    label: 'API Routes',
    humanLabel: 'API & Routing Layer',
    icon: '⚡',
    color: '#f59e0b',
    priority: 90,
  },
  {
    patterns: [/\/models?\//i, /\/schemas?\//i, /\/entities?\//i, /\/types?\//i],
    label: 'Data Models',
    humanLabel: 'Data & Schema Layer',
    icon: '🗄',
    color: '#8b5cf6',
    priority: 85,
  },
  {
    patterns: [/\/services?\//i, /\/providers?\//i, /\/managers?\//i],
    label: 'Services',
    humanLabel: 'Business Logic Layer',
    icon: '⚙',
    color: '#3b82f6',
    priority: 80,
  },
  {
    patterns: [/\/components?\//i, /\/ui\//i, /\/widgets?\//i],
    label: 'UI Components',
    humanLabel: 'User Interface Components',
    icon: '🧩',
    color: '#06b6d4',
    priority: 75,
  },
  {
    patterns: [/\/hooks?\//i],
    label: 'React Hooks',
    humanLabel: 'Custom React Hooks',
    icon: '🪝',
    color: '#60a5fa',
    priority: 70,
  },
  {
    patterns: [/\/(stores?|state)\//i, /\/context\//i, /\/redux\//i, /\/zustand\//i],
    label: 'State Management',
    humanLabel: 'State & Data Flow',
    icon: '🔄',
    color: '#a855f7',
    priority: 70,
  },
  {
    patterns: [/\/middleware\//i, /\/guards?\//i, /\/interceptors?\//i],
    label: 'Middleware',
    humanLabel: 'Middleware & Guards',
    icon: '🛡',
    color: '#ef4444',
    priority: 65,
  },
  {
    patterns: [/\/(pages?|views?|screens?)\//i, /\/app\//i],
    label: 'Pages',
    humanLabel: 'Application Pages',
    icon: '📄',
    color: '#10b981',
    priority: 60,
  },
  {
    patterns: [/\/(utils?|helpers?|lib|common)\//i],
    label: 'Utilities',
    humanLabel: 'Utility Functions',
    icon: '🔧',
    color: '#6b7280',
    priority: 50,
  },
  {
    patterns: [/\/(tests?|__tests__|spec|testing)\//i, /\.(test|spec)\./i],
    label: 'Tests',
    humanLabel: 'Test Suite',
    icon: '🧪',
    color: '#22c55e',
    priority: 45,
  },
  {
    patterns: [/\/(config|configs?|settings?)\//i, /\.(config|rc)\./i],
    label: 'Configuration',
    humanLabel: 'Project Configuration',
    icon: '⚙',
    color: '#94a3b8',
    priority: 40,
  },
  {
    patterns: [/\/(styles?|css|scss|themes?)\//i],
    label: 'Styles',
    humanLabel: 'Styling & Themes',
    icon: '🎨',
    color: '#c084fc',
    priority: 35,
  },
  {
    patterns: [/\/(static|public|assets?|images?|media)\//i],
    label: 'Assets',
    humanLabel: 'Static Assets',
    icon: '📦',
    color: '#78716c',
    priority: 30,
  },
  {
    patterns: [/\/(database|db|migrations?|seeds?)\//i],
    label: 'Database',
    humanLabel: 'Database Layer',
    icon: '💾',
    color: '#f97316',
    priority: 85,
  },
  {
    patterns: [/\/(auth|authentication|login|signup)\//i],
    label: 'Authentication',
    humanLabel: 'Authentication System',
    icon: '🔐',
    color: '#dc2626',
    priority: 88,
  },
];

/* ─── Entry point detection ───────────────────────────────────── */

const ENTRY_POINT_PATTERNS = [
  /^(main|app|server|index)\.(py|ts|tsx|js|jsx|mjs)$/i,
  /^(manage|wsgi|asgi)\.(py)$/i,
  /^(next\.config|vite\.config|webpack\.config)/i,
];

function isEntryPoint(filePath: string): boolean {
  const fileName = filePath.split('/').pop() || '';
  return ENTRY_POINT_PATTERNS.some(p => p.test(fileName));
}

/* ─── Detect top-level project layers ─────────────────────────── */

function getTopLayer(filePath: string): string {
  const parts = filePath.split('/');
  if (parts.length <= 1) return '_root';
  // Common top-level folders that represent layers
  const top = parts[0].toLowerCase();
  if (['backend', 'server', 'api', 'src'].includes(top)) return parts[0];
  if (['frontend', 'client', 'web', 'app'].includes(top)) return parts[0];
  if (['scripts', 'tools', 'bin'].includes(top)) return parts[0];
  if (['docs', 'documentation'].includes(top)) return parts[0];
  if (['tests', 'test', '__tests__'].includes(top)) return parts[0];
  return parts[0];
}

/* ─── Match file to architectural pattern ─────────────────────── */

function matchArchPattern(filePath: string): PatternRule | null {
  // Sort by priority (highest first)
  const sorted = [...ARCH_PATTERNS].sort((a, b) => b.priority - a.priority);
  for (const rule of sorted) {
    if (rule.patterns.some(p => p.test('/' + filePath))) {
      return rule;
    }
  }
  return null;
}

/* ─── Main: Build architecture from graph data ────────────────── */

export function buildArchitecture(
  nodes: GraphNode[],
  edges: GraphEdge[]
): ArchitectureData {
  // Step 1: Group files into clusters
  const clusterMap = new Map<string, GraphNode[]>();
  const clusterMeta = new Map<string, { label: string; humanLabel: string; icon: string; color: string }>();

  for (const node of nodes) {
    const topLayer = getTopLayer(node.path);
    const archMatch = matchArchPattern(node.path);

    let clusterId: string;
    let meta: { label: string; humanLabel: string; icon: string; color: string };

    if (archMatch) {
      // File matched an architectural pattern
      clusterId = `${topLayer}/${archMatch.label.toLowerCase().replace(/\s+/g, '-')}`;
      meta = {
        label: `${topLayer}/${archMatch.label}`,
        humanLabel: archMatch.humanLabel,
        icon: archMatch.icon,
        color: archMatch.color,
      };
    } else {
      // No pattern match — group by parent folder (up to 2 levels)
      const parts = node.path.split('/');
      const folderKey = parts.length <= 2
        ? topLayer
        : parts.slice(0, Math.min(parts.length - 1, 2)).join('/');
      clusterId = folderKey;
      meta = {
        label: folderKey,
        humanLabel: humanizeFolderName(folderKey),
        icon: '📁',
        color: hashColor(folderKey),
      };
    }

    if (!clusterMap.has(clusterId)) {
      clusterMap.set(clusterId, []);
      clusterMeta.set(clusterId, meta);
    }
    clusterMap.get(clusterId)!.push(node);
  }

  // Step 2: Merge tiny clusters (< 2 files) into "Other"
  const MIN_CLUSTER_SIZE = 2;
  const otherFiles: GraphNode[] = [];
  const keysToRemove: string[] = [];

  for (const [key, files] of clusterMap) {
    if (files.length < MIN_CLUSTER_SIZE && key !== '_root') {
      otherFiles.push(...files);
      keysToRemove.push(key);
    }
  }

  for (const key of keysToRemove) {
    clusterMap.delete(key);
    clusterMeta.delete(key);
  }

  // Root files + tiny clusters → "Project Root"
  const rootFiles = clusterMap.get('_root') || [];
  const combinedRoot = [...rootFiles, ...otherFiles];
  if (combinedRoot.length > 0) {
    clusterMap.delete('_root');
    clusterMap.set('_root', combinedRoot);
    clusterMeta.set('_root', {
      label: 'Project Root',
      humanLabel: 'Project Configuration & Root Files',
      icon: '📋',
      color: '#64748b',
    });
  }

  // Step 3: Build ClusterNode objects
  const nodeToCluster = new Map<string, string>();
  const clusters: ClusterNode[] = [];

  for (const [clusterId, files] of clusterMap) {
    const meta = clusterMeta.get(clusterId)!;

    for (const file of files) {
      nodeToCluster.set(file.id, clusterId);
    }

    const avgCommitFreq = files.reduce((s, f) => s + f.commitFrequency, 0) / Math.max(files.length, 1);
    const hotspotCount = files.filter(f => f.commitFrequency >= 10).length;

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
    });
  }

  // Sort clusters: entry points first, then by file count descending
  clusters.sort((a, b) => {
    if (a.isEntryPoint !== b.isEntryPoint) return a.isEntryPoint ? -1 : 1;
    return b.fileCount - a.fileCount;
  });

  // Step 4: Build cluster-level edges
  const clusterEdgeMap = new Map<string, number>();
  for (const edge of edges) {
    const srcCluster = nodeToCluster.get(edge.source);
    const tgtCluster = nodeToCluster.get(edge.target);
    if (srcCluster && tgtCluster && srcCluster !== tgtCluster) {
      const key = `${srcCluster}→${tgtCluster}`;
      clusterEdgeMap.set(key, (clusterEdgeMap.get(key) || 0) + 1);
    }
  }

  const clusterEdges: ClusterEdge[] = [];
  for (const [key, weight] of clusterEdgeMap) {
    const [source, target] = key.split('→');
    clusterEdges.push({
      id: `ce-${clusterEdges.length}`,
      source,
      target,
      weight,
    });
  }

  // Step 5: Detect entry points
  const entryPoints = nodes.filter(n => isEntryPoint(n.path));

  return { clusters, clusterEdges, entryPoints };
}

/* ─── Helpers ─────────────────────────────────────────────────── */

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
  return `hsl(${hue}, 60%, 55%)`;
}
