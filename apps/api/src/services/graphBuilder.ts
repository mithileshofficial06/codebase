import { GraphNode, GraphEdge, FileType } from '@codemap/shared';
import { ParsedModule } from './parser';

// ── Map file extension to FileType ───────────────────────────────

function getFileType(filePath: string): FileType {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  const mapping: Record<string, FileType> = {
    ts: 'ts', tsx: 'tsx', js: 'js', jsx: 'jsx',
    mjs: 'js', cjs: 'js',
    css: 'css', scss: 'scss', less: 'css',
    html: 'html', json: 'json',
    md: 'md', yaml: 'yaml', yml: 'yaml',
  };
  return mapping[ext] || 'other';
}

// ── Build graph from parsed modules ──────────────────────────────

export function buildGraph(
  modules: ParsedModule[],
  commitCounts: Record<string, number>
): { nodes: GraphNode[]; edges: GraphEdge[] } {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Create a lookup from source path to node ID
  const pathToId = new Map<string, string>();
  modules.forEach((mod, i) => {
    const id = `node-${i}`;
    pathToId.set(mod.source, id);
  });

  // Track dependents for each file
  const dependentMap = new Map<string, string[]>();

  // Build edges first to count dependencies/dependents
  const edgeSet = new Set<string>();

  for (const mod of modules) {
    const sourceId = pathToId.get(mod.source);
    if (!sourceId) continue;

    for (const dep of mod.dependencies) {
      const targetId = pathToId.get(dep.resolved);
      if (!targetId || targetId === sourceId) continue;

      const edgeKey = `${sourceId}->${targetId}`;
      if (edgeSet.has(edgeKey)) continue;
      edgeSet.add(edgeKey);

      edges.push({
        id: `edge-${edges.length}`,
        source: sourceId,
        target: targetId,
        weight: 1,
        type: dep.type === 'require' ? 'dependency' : 'import',
      });

      // Track dependents
      if (!dependentMap.has(dep.resolved)) {
        dependentMap.set(dep.resolved, []);
      }
      dependentMap.get(dep.resolved)!.push(mod.source);
    }
  }

  // Build nodes
  for (const mod of modules) {
    const id = pathToId.get(mod.source);
    if (!id) continue;

    const label = mod.source.split('/').pop() || mod.source;
    const deps = mod.dependencies.map(d => d.resolved);
    const dependents = dependentMap.get(mod.source) || [];

    nodes.push({
      id,
      label,
      type: 'file',
      fileType: getFileType(mod.source),
      path: mod.source,
      size: mod.size,
      dependencies: deps,
      dependents,
      commitFrequency: commitCounts[mod.source] || 0,
    });
  }

  return { nodes, edges };
}
