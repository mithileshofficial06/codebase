import { GraphNode, GraphEdge, HealthScore, HealthMetric } from '@codemap/shared';

// ── Main health calculation ──────────────────────────────────────

export function calculateHealth(nodes: GraphNode[], edges: GraphEdge[]): HealthScore {
  const metrics: HealthMetric[] = [
    calculateModularity(nodes, edges),
    calculateComplexity(nodes, edges),
    calculateDocumentation(nodes),
    calculateTestCoverage(nodes),
    calculateMaintainability(nodes, edges),
  ];

  const overall = Math.round(
    metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length
  );

  return { overall, metrics };
}

// ── 1. Modularity — code organization quality ────────────────────

function calculateModularity(nodes: GraphNode[], edges: GraphEdge[]): HealthMetric {
  if (nodes.length === 0) return metric('Modularity', 50, 'How well code is organized into modules');

  // Measure: folder depth distribution + module count
  const folders = new Set<string>();
  for (const node of nodes) {
    const parts = node.path.split('/');
    for (let i = 1; i < parts.length; i++) {
      folders.add(parts.slice(0, i).join('/'));
    }
  }

  const folderRatio = folders.size / Math.max(nodes.length, 1);
  const avgDepth = nodes.reduce((sum, n) => sum + n.path.split('/').length, 0) / nodes.length;

  // Good modularity: many folders relative to files, reasonable depth (2-4)
  let score = 50;
  score += Math.min(25, folderRatio * 50);
  score += avgDepth >= 2 && avgDepth <= 5 ? 25 : Math.max(0, 25 - Math.abs(avgDepth - 3.5) * 8);

  return metric('Modularity', clamp(score), 'How well code is organized into focused modules and directories');
}

// ── 2. Complexity — coupling and dependency density ──────────────

function calculateComplexity(nodes: GraphNode[], edges: GraphEdge[]): HealthMetric {
  if (nodes.length === 0) return metric('Complexity', 50, 'Dependency coupling between files');

  const avgDeps = edges.length / Math.max(nodes.length, 1);
  const maxFanOut = Math.max(...nodes.map(n => n.dependencies.length), 0);
  const maxFanIn = Math.max(...nodes.map(n => n.dependents.length), 0);

  // Detect circular dependencies (simplified)
  const hasCircular = detectCircularDeps(nodes, edges);

  let score = 100;
  score -= Math.min(30, avgDeps * 5);          // High avg deps = bad
  score -= Math.min(25, maxFanOut * 2);         // High fan-out = bad
  score -= Math.min(20, maxFanIn * 1.5);        // High fan-in = moderate concern
  if (hasCircular) score -= 15;                 // Circular deps = bad

  return metric('Complexity', clamp(score), 'Lower coupling means simpler, more maintainable code');
}

// ── 3. Documentation — README and docs presence ──────────────────

function calculateDocumentation(nodes: GraphNode[]): HealthMetric {
  if (nodes.length === 0) return metric('Documentation', 50, 'Presence of documentation files');

  const docFiles = nodes.filter(n =>
    n.path.toLowerCase().includes('readme') ||
    n.path.toLowerCase().includes('docs/') ||
    n.path.toLowerCase().includes('doc/') ||
    n.path.toLowerCase().endsWith('.md') ||
    n.path.toLowerCase().includes('contributing') ||
    n.path.toLowerCase().includes('changelog')
  );

  const hasReadme = nodes.some(n => n.path.toLowerCase() === 'readme.md');
  const docRatio = docFiles.length / Math.max(nodes.length, 1);

  let score = 0;
  if (hasReadme) score += 40;
  score += Math.min(40, docRatio * 500);
  score += Math.min(20, docFiles.length * 5);

  return metric('Documentation', clamp(score), 'Presence of README, docs, and documentation files');
}

// ── 4. Test Coverage — test file ratio ───────────────────────────

function calculateTestCoverage(nodes: GraphNode[]): HealthMetric {
  if (nodes.length === 0) return metric('Test Coverage', 0, 'Ratio of test files to source files');

  const testPatterns = ['test', 'spec', '__tests__', '.test.', '.spec.'];
  const testFiles = nodes.filter(n =>
    testPatterns.some(p => n.path.toLowerCase().includes(p))
  );

  const sourceFiles = nodes.filter(n =>
    !testPatterns.some(p => n.path.toLowerCase().includes(p)) &&
    (n.fileType === 'ts' || n.fileType === 'tsx' || n.fileType === 'js' || n.fileType === 'jsx')
  );

  const ratio = testFiles.length / Math.max(sourceFiles.length, 1);

  // 1:1 test-to-source ratio = 100%
  const score = Math.min(100, ratio * 100);

  return metric('Test Coverage', clamp(score), 'Ratio of test/spec files to source files');
}

// ── 5. Maintainability — file size, orphans, structure ───────────

function calculateMaintainability(nodes: GraphNode[], edges: GraphEdge[]): HealthMetric {
  if (nodes.length === 0) return metric('Maintainability', 50, 'Overall code maintainability');

  // Average file size (smaller is better, up to a point)
  const avgSize = nodes.reduce((sum, n) => sum + n.size, 0) / nodes.length;
  const sizeScore = avgSize < 5000 ? 30 : avgSize < 15000 ? 20 : avgSize < 30000 ? 10 : 0;

  // Orphan files (no dependencies in or out)
  const connectedNodes = new Set<string>();
  for (const edge of edges) {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  }
  const orphanRatio = 1 - connectedNodes.size / Math.max(nodes.length, 1);
  const orphanScore = Math.max(0, 30 - orphanRatio * 60);

  // File count (too many or too few is concerning)
  const countScore = nodes.length >= 5 && nodes.length <= 500 ? 20 : 10;

  // Commit frequency spread (active development = good)
  const activeFiles = nodes.filter(n => n.commitFrequency > 0).length;
  const activityScore = Math.min(20, (activeFiles / Math.max(nodes.length, 1)) * 30);

  return metric(
    'Maintainability',
    clamp(sizeScore + orphanScore + countScore + activityScore),
    'Based on file sizes, orphan files, and development activity'
  );
}

// ── Helpers ──────────────────────────────────────────────────────

function metric(name: string, score: number, detail: string): HealthMetric {
  return { name, score: Math.round(score), max: 100, description: name, detail };
}

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

function detectCircularDeps(nodes: GraphNode[], edges: GraphEdge[]): boolean {
  const adj = new Map<string, string[]>();
  for (const edge of edges) {
    if (!adj.has(edge.source)) adj.set(edge.source, []);
    adj.get(edge.source)!.push(edge.target);
  }

  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(nodeId: string): boolean {
    if (inStack.has(nodeId)) return true;
    if (visited.has(nodeId)) return false;

    visited.add(nodeId);
    inStack.add(nodeId);

    for (const neighbor of adj.get(nodeId) || []) {
      if (dfs(neighbor)) return true;
    }

    inStack.delete(nodeId);
    return false;
  }

  for (const node of nodes) {
    if (dfs(node.id)) return true;
  }

  return false;
}
