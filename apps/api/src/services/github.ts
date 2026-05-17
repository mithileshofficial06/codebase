import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

export interface GitHubFile {
  path: string;
  type: 'blob' | 'tree';
  size: number;
  sha: string;
}

export interface RepoMeta {
  owner: string;
  repo: string;
  defaultBranch: string;
  files: GitHubFile[];
  commitCounts: Record<string, number>;
}

// ── Parse owner/repo from GitHub URL ─────────────────────────────

export function parseRepoUrl(url: string): [string, string] {
  const match = url.match(/github\.com\/([^\/]+)\/([^\/\?\#]+)/);
  if (!match) throw new Error('Invalid GitHub URL');
  return [match[1], match[2].replace(/\.git$/, '')];
}

// ── Code file extensions we care about ───────────────────────────

const CODE_EXTENSIONS = new Set([
  'ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs',
  'css', 'scss', 'less',
  'html', 'json', 'yaml', 'yml', 'md',
  'py', 'go', 'rs', 'java', 'rb',
]);

function isCodeFile(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase() || '';
  return CODE_EXTENSIONS.has(ext);
}

function shouldSkipPath(path: string): boolean {
  const skipPatterns = [
    'node_modules/', 'dist/', 'build/', '.next/',
    'vendor/', '__pycache__/', '.git/',
    'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml',
  ];
  return skipPatterns.some(p => path.includes(p));
}

// ── Fetch repository tree ────────────────────────────────────────

export async function fetchRepoTree(owner: string, repo: string): Promise<RepoMeta> {
  const { data: repoData } = await octokit.repos.get({ owner, repo });

  const { data: tree } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: repoData.default_branch,
    recursive: 'true',
  });

  const files: GitHubFile[] = (tree.tree || [])
    .filter(item =>
      item.path &&
      item.type === 'blob' &&
      isCodeFile(item.path) &&
      !shouldSkipPath(item.path)
    )
    .map(item => ({
      path: item.path!,
      type: item.type as 'blob' | 'tree',
      size: item.size || 0,
      sha: item.sha || '',
    }));

  // Fetch commit frequency (last 100 commits)
  const commitCounts = await fetchCommitFrequency(owner, repo);

  return {
    owner,
    repo,
    defaultBranch: repoData.default_branch,
    files,
    commitCounts,
  };
}

// ── Fetch commit frequency ───────────────────────────────────────

async function fetchCommitFrequency(
  owner: string,
  repo: string
): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  try {
    const { data: commits } = await octokit.repos.listCommits({
      owner,
      repo,
      per_page: 50,
    });

    // For each commit, fetch the files changed
    const commitDetails = await Promise.all(
      commits.slice(0, 20).map(async (commit) => {
        try {
          const { data } = await octokit.repos.getCommit({
            owner,
            repo,
            ref: commit.sha,
          });
          return data.files || [];
        } catch {
          return [];
        }
      })
    );

    for (const files of commitDetails) {
      for (const file of files) {
        if (file.filename) {
          counts[file.filename] = (counts[file.filename] || 0) + 1;
        }
      }
    }
  } catch (error) {
    console.warn('Could not fetch commit frequency:', error);
  }

  return counts;
}

// ── Fetch file content for import parsing ────────────────────────

export async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  sha: string
): Promise<string> {
  try {
    const { data } = await octokit.git.getBlob({ owner, repo, file_sha: sha });
    if (data.encoding === 'base64') {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return data.content;
  } catch {
    return '';
  }
}
