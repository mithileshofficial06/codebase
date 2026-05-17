import { GitHubFile, fetchFileContent } from './github';
import path from 'path';

export interface ParsedModule {
  source: string;
  size: number;
  dependencies: { resolved: string; type: 'import' | 'require' }[];
}

// ── Import/require regex patterns ────────────────────────────────

const IMPORT_PATTERNS = [
  // import ... from '...'
  /import\s+(?:[\w{}\s*,]+?\s+from\s+)?['"]([^'"]+)['"]/g,
  // import('...')
  /import\(\s*['"]([^'"]+)['"]\s*\)/g,
  // require('...')
  /require\(\s*['"]([^'"]+)['"]\s*\)/g,
  // export ... from '...'
  /export\s+(?:[\w{}\s*,]+?\s+from\s+)?['"]([^'"]+)['"]/g,
];

// ── Parse imports from file content ──────────────────────────────

function extractImports(content: string): { raw: string; type: 'import' | 'require' }[] {
  const imports: { raw: string; type: 'import' | 'require' }[] = [];
  const seen = new Set<string>();

  for (const pattern of IMPORT_PATTERNS) {
    // Reset regex state
    const regex = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      const raw = match[1];
      if (raw && !seen.has(raw)) {
        seen.add(raw);
        imports.push({
          raw,
          type: pattern.source.includes('require') ? 'require' : 'import',
        });
      }
    }
  }

  return imports;
}

// ── Resolve relative import to absolute repo path ────────────────

function resolveImportPath(
  importPath: string,
  fromFile: string,
  allFiles: Set<string>
): string | null {
  // Skip external packages (no dot prefix)
  if (!importPath.startsWith('.') && !importPath.startsWith('@/') && !importPath.startsWith('~/')) {
    return null;
  }

  // Handle alias paths
  let resolvedBase: string;
  if (importPath.startsWith('@/') || importPath.startsWith('~/')) {
    resolvedBase = importPath.replace(/^[@~]\//, 'src/');
  } else {
    const dir = path.dirname(fromFile);
    resolvedBase = path.posix.normalize(path.posix.join(dir, importPath));
  }

  // Try exact match and common extensions
  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
  for (const ext of extensions) {
    const candidate = resolvedBase + ext;
    if (allFiles.has(candidate)) {
      return candidate;
    }
  }

  return null;
}

// ── Parse all files and build dependency map ─────────────────────

export async function parseRepository(
  owner: string,
  repo: string,
  files: GitHubFile[],
  onProgress?: (current: number, total: number) => void
): Promise<ParsedModule[]> {
  const allPaths = new Set(files.map(f => f.path));
  const modules: ParsedModule[] = [];

  // Only parse JS/TS files for imports
  const parsableExts = new Set(['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs']);
  const parsableFiles = files.filter(f => {
    const ext = f.path.split('.').pop()?.toLowerCase() || '';
    return parsableExts.has(ext);
  });

  // Batch fetch file contents (limit concurrency)
  const BATCH_SIZE = 10;
  let processed = 0;

  for (let i = 0; i < parsableFiles.length; i += BATCH_SIZE) {
    const batch = parsableFiles.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      batch.map(async (file) => {
        const content = await fetchFileContent(owner, repo, file.path, file.sha);
        const rawImports = extractImports(content);

        const dependencies = rawImports
          .map(imp => {
            const resolved = resolveImportPath(imp.raw, file.path, allPaths);
            if (!resolved) return null;
            return { resolved, type: imp.type };
          })
          .filter(Boolean) as ParsedModule['dependencies'];

        return {
          source: file.path,
          size: file.size,
          dependencies,
        };
      })
    );

    modules.push(...results);
    processed += batch.length;
    onProgress?.(processed, parsableFiles.length);
  }

  // Add non-parsable files as nodes without dependencies
  for (const file of files) {
    const ext = file.path.split('.').pop()?.toLowerCase() || '';
    if (!parsableExts.has(ext)) {
      modules.push({
        source: file.path,
        size: file.size,
        dependencies: [],
      });
    }
  }

  return modules;
}
