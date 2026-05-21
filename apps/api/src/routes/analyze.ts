import { Router, Request, Response } from 'express';
import { parseRepoUrl, fetchRepoTree } from '../services/github';
import { parseRepository } from '../services/parser';
import { buildGraph } from '../services/graphBuilder';
import { calculateHealth } from '../services/healthScore';
import { ProgressEmitter } from '../sse/progress';
import { getCache, setCache } from '../cache/redis';
import { RepoData } from '../types';

const router = Router();

// ── POST /analyze — standard JSON response ──────────────────────

router.post('/', async (req: Request, res: Response) => {
  try {
    const { repoUrl } = req.body;
    if (!repoUrl) {
      return res.status(400).json({ error: 'repoUrl is required' });
    }

    // Check cache
    const cached = await getCache(repoUrl);
    if (cached) {
      return res.json(cached);
    }

    const [owner, repo] = parseRepoUrl(repoUrl);
    const repoMeta = await fetchRepoTree(owner, repo);
    const modules = await parseRepository(owner, repo, repoMeta.files);
    const { nodes, edges } = buildGraph(modules, repoMeta.commitCounts);
    const health = calculateHealth(nodes, edges);

    const result: RepoData = {
      url: repoUrl,
      owner,
      repo,
      nodes,
      edges,
      health,
      fileCount: nodes.length,
      totalSize: nodes.reduce((sum, n) => sum + n.size, 0),
    };

    await setCache(repoUrl, result);
    res.json(result);
  } catch (error: any) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze repository' });
  }
});

// ── GET /analyze/stream — SSE streaming response ─────────────────

router.get('/stream', async (req: Request, res: Response) => {
  const repoUrl = req.query.repo as string;
  if (!repoUrl) {
    return res.status(400).json({ error: 'repo query param is required' });
  }

  const emitter = new ProgressEmitter(res);

  try {
    // Step 1: Check cache
    emitter.emitProgress('clone', 'processing', 'Checking cache...');
    const cached = await getCache(repoUrl);

    if (cached) {
      // Fast path — emit all steps as completed instantly
      emitter.emitProgress('clone', 'completed', 'Repository data cached');
      emitter.emitProgress('parse', 'completed', 'Dependencies cached');
      emitter.emitProgress('analyze', 'completed', 'Structure cached');
      emitter.emitProgress('health', 'completed', 'Health score cached');
      emitter.emitProgress('graph', 'completed', 'Graph ready');
      emitter.emitResult(cached);
      emitter.close();
      return;
    }

    // Step 1: Clone (fetch tree)
    emitter.emitProgress('clone', 'processing', 'Fetching repository tree...');
    const [owner, repo] = parseRepoUrl(repoUrl);
    const repoMeta = await fetchRepoTree(owner, repo);
    emitter.emitProgress('clone', 'completed', `Found ${repoMeta.files.length} files`);

    // Step 2: Parse dependencies
    emitter.emitProgress('parse', 'processing', 'Parsing import statements...');
    const modules = await parseRepository(owner, repo, repoMeta.files, (current, total) => {
      emitter.emitProgress('parse', 'processing', `Parsing ${current}/${total} files...`);
    });
    emitter.emitProgress('parse', 'completed', `Parsed ${modules.length} modules`);

    // Step 3: Analyze structure
    emitter.emitProgress('analyze', 'processing', 'Building dependency graph...');
    const { nodes, edges } = buildGraph(modules, repoMeta.commitCounts);
    emitter.emitProgress('analyze', 'completed', `${nodes.length} nodes, ${edges.length} edges`);

    // Step 4: Health score
    emitter.emitProgress('health', 'processing', 'Computing health metrics...');
    const health = calculateHealth(nodes, edges);
    emitter.emitProgress('health', 'completed', `Score: ${health.overall}/100`);

    // Step 5: Finalize graph
    emitter.emitProgress('graph', 'processing', 'Assembling graph data...');
    const result: RepoData = {
      url: repoUrl,
      owner,
      repo,
      nodes,
      edges,
      health,
      fileCount: nodes.length,
      totalSize: nodes.reduce((sum, n) => sum + n.size, 0),
    };

    await setCache(repoUrl, result);
    emitter.emitProgress('graph', 'completed', 'Graph ready');

    // Send final result
    emitter.emitResult(result);
    emitter.close();
  } catch (error: any) {
    console.error('Stream analyze error:', error);
    emitter.emitError(error.message || 'Analysis failed');
    emitter.close();
  }
});

export default router;
