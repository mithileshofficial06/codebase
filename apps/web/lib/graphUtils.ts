import { GraphNode, FileType } from '@codemap/shared';

const FILE_TYPE_COLORS: Record<FileType, string> = {
  ts: '#3178c6',
  tsx: '#3178c6',
  js: '#f7df1e',
  jsx: '#f7df1e',
  css: '#a855f7',
  scss: '#cf649a',
  html: '#e34c26',
  json: '#6b7280',
  md: '#4ade80',
  yaml: '#cb171e',
  other: '#6b7280',
};

export function getNodeColor(node: GraphNode): string {
  if (node.type === 'folder') return '#8b5cf6';
  return FILE_TYPE_COLORS[node.fileType] || '#6b7280';
}

export function getNodeSize(node: GraphNode): number {
  const depCount = node.dependencies.length + node.dependents.length;
  return Math.max(36, Math.min(64, 36 + depCount * 3));
}

export function calculateEdgeWeight(weight: number): number {
  return Math.max(1, Math.min(4, weight * 1.5));
}
