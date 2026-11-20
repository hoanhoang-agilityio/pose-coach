#!/usr/bin/env node
// ai-sdlc Stop hook: tests (and lint) must pass before Claude ends a build turn. Max 3 blocks.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { readStdinJson, projectRoot, readConfig, activeChange, isAccepted, changeRisk } from './lib.mjs';

try {
  const input = readStdinJson();
  const root = projectRoot(input);
  const cfg = readConfig(root);
  if (!cfg || !cfg.testCommand) process.exit(0);
  const act = activeChange(root);
  if (!act || !(isAccepted(path.join(act.dir, 'plan.md')) || changeRisk(act.dir) === 'trivial')) process.exit(0);

  const st = spawnSync('git', ['status', '--porcelain'], { cwd: root, encoding: 'utf8' });
  if (st.status === 0) {
    const lines = st.stdout.split('\n').filter(Boolean).map((l) => l.slice(3).replace(/^"|"$/g, ''));
    const relevant = lines.filter((f) => !f.startsWith('intent/') && !f.startsWith('.sdlc/'));
    if (!relevant.length) process.exit(0);
  }

  const counter = path.join(root, '.sdlc', '.stop-attempts');
  const reset = () => { try { fs.rmSync(counter, { force: true }); } catch { /* ignore */ } };
  let failed = null;
  for (const cmd of [cfg.testCommand, cfg.lintCommand].filter(Boolean)) {
    const r = spawnSync(cmd, { cwd: root, shell: true, encoding: 'utf8', timeout: 10 * 60 * 1000, maxBuffer: 64 * 1024 * 1024 });
    if (r.status !== 0) { failed = { cmd, out: `${r.stdout || ''}${r.stderr || ''}` }; break; }
  }
  if (!failed) { reset(); process.exit(0); }

  let n = 0;
  try { n = parseInt(fs.readFileSync(counter, 'utf8'), 10) || 0; } catch { /* first */ }
  n += 1;
  if (n <= 3) {
    fs.mkdirSync(path.dirname(counter), { recursive: true });
    fs.writeFileSync(counter, String(n));
    const tail = failed.out.split('\n').slice(-60).join('\n');
    process.stderr.write(`Tests/lint failing (\`${failed.cmd}\`). Fix before finishing. Attempt ${n}/3. Last output:\n${tail}\n`);
    process.exit(2);
  }
  reset();
  process.stderr.write(`ai-sdlc: \`${failed.cmd}\` still failing after 3 attempts. A human must look at this.\n`);
  process.exit(0);
} catch (e) {
  process.stderr.write(`ai-sdlc stop: internal error, allowing. ${e && e.message}\n`);
  process.exit(0);
}
