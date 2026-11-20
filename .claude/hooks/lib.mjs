// Shared helpers for ai-sdlc hooks. Zero dependencies.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

export const DEFAULT_ALLOWLIST = [
  'intent/**', '.sdlc/**', '.claude/**', 'docs/**', 'evals/**',
  'CLAUDE.md', 'REVIEW.md', 'README.md',
];

export function readStdinJson() {
  let raw = '';
  try { raw = fs.readFileSync(0, 'utf8'); } catch { /* no stdin */ }
  if (!raw.trim()) return {};
  return JSON.parse(raw);
}

export function projectRoot(input) {
  return process.env.CLAUDE_PROJECT_DIR || (input && input.cwd) || process.cwd();
}

export function readConfig(root) {
  const p = path.join(root, '.sdlc', 'config.json');
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

/** Parse a YAML inline list `[a, b]` into an array of strings. */
export function parseInlineList(v) {
  const m = /^\[(.*)\]$/.exec(String(v).trim());
  if (!m) return null;
  return m[1].split(',').map((x) => x.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
}

/**
 * Parse the first `---` block of a Markdown file. Returns {} when absent.
 * Scalars are strings; inline lists `[a, b]` and block lists (`- a`) become arrays.
 */
export function parseFrontmatter(text) {
  const m = /^\uFEFF?\s*---\r?\n([\s\S]*?)\r?\n---/.exec(text || '');
  const out = {};
  if (!m) return out;
  let listKey = null;
  for (const line of m[1].split(/\r?\n/)) {
    const item = /^\s*-\s+(.*)$/.exec(line);
    if (item && listKey) {
      if (!Array.isArray(out[listKey])) out[listKey] = [];
      out[listKey].push(item[1].replace(/\s+#.*$/, '').trim().replace(/^["']|["']$/g, ''));
      continue;
    }
    const kv = /^([A-Za-z_][\w-]*):\s*(.*)$/.exec(line);
    if (!kv) continue;
    listKey = null;
    let v = kv[2].replace(/\s+#.*$/, '').trim();
    const key = kv[1].toLowerCase();
    const list = parseInlineList(v);
    if (list) { out[key] = list; continue; }
    if (v === '') { out[key] = ''; listKey = key; continue; }
    v = v.replace(/^["']|["']$/g, '');
    out[key] = v;
  }
  // A key that opened a block list but got no items stays an empty string.
  return out;
}

export function readFrontmatter(file) {
  try { return parseFrontmatter(fs.readFileSync(file, 'utf8')); } catch { return null; }
}

export function isAccepted(file) {
  const fm = readFrontmatter(file);
  return !!fm && String(fm.status || '').toLowerCase() === 'accepted';
}

export function globToRegExp(glob) {
  let re = '';
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i];
    if (c === '*') {
      if (glob[i + 1] === '*') {
        i++;
        if (glob[i + 1] === '/') { i++; re += '(?:.*/)?'; } else re += '.*';
      } else re += '[^/]*';
    } else if (c === '?') re += '[^/]';
    else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp('^' + re + '$');
}

export function matchesAny(rel, globs) {
  return globs.some((g) => globToRegExp(g).test(rel));
}

/** Path relative to root with forward slashes, or null when outside root. */
export function relToRoot(root, target) {
  if (!target) return null;
  const abs = path.isAbsolute(target) ? target : path.resolve(root, target);
  let realRoot = root;
  try { realRoot = fs.realpathSync(root); } catch { /* keep */ }
  for (const base of [root, realRoot]) {
    const rel = path.relative(base, abs);
    if (!rel.startsWith('..') && !path.isAbsolute(rel)) return rel.split(path.sep).join('/');
  }
  return null;
}

export function currentBranch(root) {
  try {
    const r = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: root, encoding: 'utf8' });
    return r.status === 0 ? r.stdout.trim() : null;
  } catch { return null; }
}

export function appendBypassLog(root, entry) {
  const dir = path.join(root, '.sdlc');
  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(path.join(dir, 'bypass.log'), JSON.stringify(entry) + '\n');
}

export function activeChange(root) {
  try {
    const name = fs.readFileSync(path.join(root, '.sdlc', 'active'), 'utf8').trim();
    if (!name) return null;
    const dir = name.replace(/^intent\//, '').replace(/\/+$/, '');
    const abs = path.join(root, 'intent', dir);
    return fs.existsSync(abs) ? { name: dir, dir: abs } : null;
  } catch { return null; }
}

export const RISKS = ['trivial', 'low', 'medium', 'high'];
const rank = (r) => RISKS.indexOf(String(r || '').toLowerCase());

/** Risk of a change from files: spec.md risk, else legacy intent.md risk; -1 when none. */
export function fileRisk(changeDir) {
  for (const f of ['spec.md', 'intent.md']) {
    const fm = readFrontmatter(path.join(changeDir, f));
    if (fm && rank(fm.risk) >= 0) return rank(fm.risk);
  }
  return -1;
}

/** Highest risk of the given ranks; medium when none is known. Returns a name from RISKS. */
export function highestRisk(...ranks) {
  const known = ranks.filter((r) => r >= 0);
  return RISKS[known.length ? Math.max(...known) : 2];
}
export const riskRank = rank;

export function hasHeading(file, title) {
  try { return new RegExp(`^##\\s+${title}\\b`, 'im').test(fs.readFileSync(file, 'utf8')); } catch { return false; }
}

/** Effective risk of a change: highest of spec.md (else intent.md) and plan.md. */
export function changeRisk(changeDir) {
  return highestRisk(fileRisk(changeDir), rank((readFrontmatter(path.join(changeDir, 'plan.md')) || {}).risk));
}
