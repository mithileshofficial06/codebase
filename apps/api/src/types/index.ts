// ─── File & Graph Types ───────────────────────────────────────────

export type FileType = 'ts' | 'tsx' | 'js' | 'jsx' | 'css' | 'scss' | 'html' | 'json' | 'md' | 'yaml' | 'other';

export interface GraphNode {
  id: string;
  label: string;
  type: 'file' | 'folder';
  fileType: FileType;
  path: string;
  size: number;
  dependencies: string[];
  dependents: string[];
  commitFrequency: number;
  x?: number;
  y?: number;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  weight: number;
  type: 'import' | 'export' | 'dependency';
}

// ─── Health Score Types ───────────────────────────────────────────

export interface HealthMetric {
  name: string;
  score: number;
  max: number;
  description: string;
  detail: string;
}

export interface HealthScore {
  overall: number;
  metrics: HealthMetric[];
}

// ─── Repo Types ───────────────────────────────────────────────────

export interface RepoData {
  url: string;
  owner: string;
  repo: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  health: HealthScore;
  fileCount: number;
  totalSize: number;
}

// ─── Chat Types ───────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// ─── API Types ────────────────────────────────────────────────────

export interface AnalyzeRequest {
  repoUrl: string;
}

export interface AnalyzeResponse {
  jobId: string;
  status: 'processing' | 'completed' | 'failed';
}

export type SSEStepId = 'clone' | 'parse' | 'analyze' | 'health' | 'graph';

export interface SSEProgressEvent {
  step: SSEStepId;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  message?: string;
  progress?: number;
}

export interface SSEResultEvent {
  type: 'result';
  data: RepoData;
}

export interface SSEErrorEvent {
  type: 'error';
  message: string;
}
