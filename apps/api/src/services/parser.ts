import { GitHubFile, fetchFileContent } from './github';
import path from 'path';

export interface ParsedModule {
  source: string;
  size: number;
  dependencies: { resolved: string; type: 'import' | 'require' }[];
}

// ── JS/TS Import/require regex patterns ──────────────────────────

const JS_IMPORT_PATTERNS = [
  // import ... from '...'
  /import\s+(?:[\w{}\s*,]+?\s+from\s+)?['"]([^'"]+)['"]/g,
  // import('...')
  /import\(\s*['"]([^'"]+)['"]\s*\)/g,
  // require('...')
  /require\(\s*['"]([^'"]+)['"]\s*\)/g,
  // export ... from '...'
  /export\s+(?:[\w{}\s*,]+?\s+from\s+)?['"]([^'"]+)['"]/g,
];

// ── Python import regex patterns ─────────────────────────────────

const PYTHON_IMPORT_PATTERNS = [
  // import module / import module as alias
  /^import\s+([\w.]+)/gm,
  // from module import ...
  /^from\s+([\w.]+)\s+import/gm,
];

// ── Extract JS/TS imports ────────────────────────────────────────

function extractJsImports(content: string): { raw: string; type: 'import' | 'require' }[] {
  const imports: { raw: string; type: 'import' | 'require' }[] = [];
  const seen = new Set<string>();

  for (const pattern of JS_IMPORT_PATTERNS) {
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

// ── Extract Python imports ───────────────────────────────────────

function extractPythonImports(content: string): { raw: string; type: 'import' }[] {
  const imports: { raw: string; type: 'import' }[] = [];
  const seen = new Set<string>();

  for (const pattern of PYTHON_IMPORT_PATTERNS) {
    const regex = new RegExp(pattern.source, pattern.flags);
    let match: RegExpExecArray | null;
    while ((match = regex.exec(content)) !== null) {
      const raw = match[1];
      if (raw && !seen.has(raw)) {
        seen.add(raw);
        imports.push({ raw, type: 'import' });
      }
    }
  }

  return imports;
}

// ── Resolve JS/TS relative import to repo path ──────────────────

function resolveJsImportPath(
  importPath: string,
  fromFile: string,
  allFiles: Set<string>
): string | null {
  // Skip external packages
  if (!importPath.startsWith('.') && !importPath.startsWith('@/') && !importPath.startsWith('~/')) {
    return null;
  }

  let resolvedBase: string;
  if (importPath.startsWith('@/') || importPath.startsWith('~/')) {
    resolvedBase = importPath.replace(/^[@~]\//, 'src/');
  } else {
    const dir = path.dirname(fromFile);
    resolvedBase = path.posix.normalize(path.posix.join(dir, importPath));
  }

  const extensions = ['', '.ts', '.tsx', '.js', '.jsx', '.mjs', '/index.ts', '/index.tsx', '/index.js', '/index.jsx'];
  for (const ext of extensions) {
    const candidate = resolvedBase + ext;
    if (allFiles.has(candidate)) {
      return candidate;
    }
  }

  return null;
}

// ── Resolve Python import to repo path ───────────────────────────

function resolvePythonImportPath(
  importModule: string,
  fromFile: string,
  allFiles: Set<string>
): string | null {
  // Convert dotted module to path: "ai_analysis" → "ai_analysis.py"
  // "utils.helpers" → "utils/helpers.py"
  const parts = importModule.split('.');

  // Try relative to the importing file's directory first
  const fromDir = path.dirname(fromFile);

  // Try as a file in the same directory or subdirectory
  const candidates: string[] = [];

  // Flat module: scanner → scanner.py (same dir)
  const flatPath = path.posix.join(fromDir === '.' ? '' : fromDir, parts.join('/'));
  candidates.push(flatPath + '.py');

  // Package: module → module/__init__.py
  candidates.push(path.posix.join(flatPath, '__init__.py'));

  // Absolute from repo root: module.submodule → module/submodule.py
  const absolutePath = parts.join('/');
  candidates.push(absolutePath + '.py');
  candidates.push(path.posix.join(absolutePath, '__init__.py'));

  // If importing from a sub-package, also try the first component
  if (parts.length === 1) {
    // Try just the file at root level
    candidates.push(parts[0] + '.py');
  }

  for (const candidate of candidates) {
    const normalized = path.posix.normalize(candidate);
    if (allFiles.has(normalized)) {
      return normalized;
    }
  }

  return null;
}

// ── Determine which language a file is ───────────────────────────

const JS_EXTS = new Set(['ts', 'tsx', 'js', 'jsx', 'mjs', 'cjs']);
const PY_EXTS = new Set(['py']);

function getLanguage(filePath: string): 'js' | 'py' | 'other' {
  const ext = filePath.split('.').pop()?.toLowerCase() || '';
  if (JS_EXTS.has(ext)) return 'js';
  if (PY_EXTS.has(ext)) return 'py';
  return 'other';
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

  // Files we can parse for imports (JS/TS + Python)
  const parsableFiles = files.filter(f => {
    const lang = getLanguage(f.path);
    return lang === 'js' || lang === 'py';
  });

  // Batch fetch file contents (limit concurrency)
  const BATCH_SIZE = 10;
  let processed = 0;

  for (let i = 0; i < parsableFiles.length; i += BATCH_SIZE) {
    const batch = parsableFiles.slice(i, i + BATCH_SIZE);

    const results = await Promise.all(
      batch.map(async (file) => {
        const content = await fetchFileContent(owner, repo, file.path, file.sha);
        const lang = getLanguage(file.path);

        let dependencies: ParsedModule['dependencies'] = [];

        if (lang === 'js') {
          const rawImports = extractJsImports(content);
          dependencies = rawImports
            .map(imp => {
              const resolved = resolveJsImportPath(imp.raw, file.path, allPaths);
              if (!resolved) return null;
              return { resolved, type: imp.type };
            })
            .filter(Boolean) as ParsedModule['dependencies'];
        } else if (lang === 'py') {
          const rawImports = extractPythonImports(content);
          dependencies = rawImports
            .map(imp => {
              const resolved = resolvePythonImportPath(imp.raw, file.path, allPaths);
              if (!resolved) return null;
              return { resolved, type: imp.type };
            })
            .filter(Boolean) as ParsedModule['dependencies'];
        }

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
  const parsablePaths = new Set(parsableFiles.map(f => f.path));
  for (const file of files) {
    if (!parsablePaths.has(file.path)) {
      modules.push({
        source: file.path,
        size: file.size,
        dependencies: [],
      });
    }
  }

  return modules;
}
