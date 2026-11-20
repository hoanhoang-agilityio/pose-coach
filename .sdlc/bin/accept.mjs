#!/usr/bin/env node
// ai-sdlc accept: a human sets status/accepted_by/accepted_at on a stage's artifacts and commits.
// Self-contained (no imports from the kit) so a workflow can run it from the default branch.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const STAGES = ['spec', 'design', 'plan', 'incident'];
const USAGE = 'Usage: ai-sdlc accept <spec|design|plan|incident> [NNN-slug] [--by <name>] [--no-commit]';

const fmBlock = (t) => /^(﻿?\s*---\r?\n)([\s\S]*?)(\r?\n---)/.exec(t);
export function statusOf(file) {
  try {
    const m = fmBlock(fs.readFileSync(file, 'utf8'));
    const s = m && /^status:[ \t]*["']?([A-Za-z]+)/im.exec(m[2]);
    return s ? s[1].toLowerCase() : null;
  } catch { return null; }
}
function walkMd(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walkMd(p));
    else if (e.name.endsWith('.md')) out.push(p);
  }
  return out.sort();
}

/** Files to accept for a stage: {file, main}. main files must exist; extras only when status is draft. */
function stageFiles(dir, stage) {
  const f = (...p) => path.join(dir, ...p);
  if (stage === 'design') {
    const main = f('design', 'design.md');
    return [{ file: main, main: true }, ...walkMd(f('design')).filter((p) => p !== main).map((file) => ({ file, main: false }))];
  }
  const out = [{ file: f(`${stage}.md`), main: true }];
  if (stage === 'spec') out.push({ file: f('intent.md'), main: false });
  return out;
}
const pending = ({ file, main }) => fs.existsSync(file) && (main ? statusOf(file) !== 'accepted' : statusOf(file) === 'draft');

function setFields(text, by, at) {
  const fields = { status: 'accepted', accepted_by: by, accepted_at: at };
  const m = fmBlock(text);
  if (!m) return `---\n${Object.entries(fields).map(([k, v]) => `${k}: ${v}`).join('\n')}\n---\n\n${text}`;
  let body = m[2];
  for (const [k, v] of Object.entries(fields)) {
    const re = new RegExp(`^${k}:.*$`, 'm');
    body = re.test(body) ? body.replace(re, `${k}: ${v}`) : `${body}\n${k}: ${v}`;
  }
  return text.slice(0, m.index) + m[1] + body + m[3] + text.slice(m.index + m[0].length);
}

function resolveChange(root, stage, arg) {
  const base = path.join(root, 'intent');
  const norm = (n) => n.replace(/^intent\//, '').replace(/\/+$/, '');
  if (arg) {
    const n = norm(arg);
    if (!fs.existsSync(path.join(base, n))) throw new Error(`No such change: intent/${n}`);
    return n;
  }
  try {
    const a = norm(fs.readFileSync(path.join(root, '.sdlc', 'active'), 'utf8').trim());
    if (a && stageFiles(path.join(base, a), stage).some((x) => x.main && pending(x))) return a;
  } catch { /* no active change */ }
  const all = fs.existsSync(base) ? fs.readdirSync(base, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort() : [];
  const cands = all.filter((n) => stageFiles(path.join(base, n), stage).some(pending));
  if (cands.length === 1) return cands[0];
  throw new Error(cands.length
    ? `More than one change has a draft ${stage}: ${cands.join(', ')}. Name one: ai-sdlc accept ${stage} <NNN-slug>`
    : `No change with a draft ${stage} found. Name one: ai-sdlc accept ${stage} <NNN-slug>`);
}

const git = (root, args) => spawnSync('git', ['-C', root, ...args], { encoding: 'utf8' });

/** Returns exit code. argv: ['spec', 'NNN-slug', '--by', 'name', '--no-commit']. */
export function acceptCommand(argv, { cwd = process.cwd(), out = console.log } = {}) {
  const pos = [];
  let by = null;
  let noCommit = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--by') by = argv[++i];
    else if (argv[i] === '--no-commit') noCommit = true;
    else pos.push(argv[i]);
  }
  const [stage, arg] = pos;
  if (!STAGES.includes(stage)) { out(`${USAGE}`); return 1; }
  if (process.env.CLAUDECODE) { out('Refused: only a human may accept an artifact. Run this yourself outside Claude Code (or comment /accept ' + stage + ' on the PR).'); return 1; }
  try {
    const root = cwd;
    const name = resolveChange(root, stage, arg);
    const dir = path.join(root, 'intent', name);
    const files = stageFiles(dir, stage);
    const main = files.find((x) => x.main);
    if (!fs.existsSync(main.file)) throw new Error(`intent/${name}/${path.relative(dir, main.file)} not found`);
    const todo = files.filter(pending);
    if (!todo.length) { out(`intent/${name}: ${stage} is already accepted. Nothing to do.`); return 0; }
    const who = by || (git(root, ['config', 'user.name']).stdout || '').trim();
    if (!who) throw new Error('Cannot tell who is accepting. Pass --by <name> or set git config user.name.');
    const at = new Date().toISOString().slice(0, 10);
    const rels = todo.map((x) => path.relative(root, x.file).split(path.sep).join('/'));
    for (const x of todo) fs.writeFileSync(x.file, setFields(fs.readFileSync(x.file, 'utf8'), who, at));
    out(`Accepted ${stage} for ${name} (by ${who}, ${at}):\n${rels.map((r) => '  ' + r).join('\n')}`);
    if (noCommit) return 0;
    const add = git(root, ['add', '--', ...rels]);
    const c = add.status === 0 && git(root, ['commit', '-m', `docs(${name}): accept ${stage}`, '-m', `Accepted-by: ${who}`, '--', ...rels]);
    if (!c || c.status !== 0) { out(`Files updated but git commit failed: ${(c || add).stderr.trim()}`); return 1; }
    out(`Committed: docs(${name}): accept ${stage}`);
    return 0;
  } catch (e) {
    out(e.message);
    return 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(fs.realpathSync(process.argv[1])).href) {
  process.exitCode = acceptCommand(process.argv.slice(2));
}
