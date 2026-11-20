#!/usr/bin/env node
// ai-sdlc PreToolUse gate. Block = message on stderr + exit 2. Fails open on internal error.
import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_ALLOWLIST, readStdinJson, projectRoot, readConfig, readFrontmatter, isAccepted,
  matchesAny, relToRoot, currentBranch, appendBypassLog, activeChange, fileRisk, highestRisk, changeRisk, riskRank, hasHeading,
  parseFrontmatter,
} from './lib.mjs';

class Block extends Error {}
const block = (msg) => { throw new Block(msg); };

const ACCEPT_RE = /^\s*status:\s*["']?accepted\b/im;
const ACCEPTED_BY_RE = /^\s*accepted_by:[ \t]*["']?[^\s"'#]/im;
const ARTIFACT_RE = /^intent\/([^/]+)\/(intent|spec|plan|incident)\.md$/;
const DESIGN_MD_RE = /^intent\/[^/]+\/design\/design\.md$/;
const DESIGN_RE = /^intent\/([^/]+)\/design\/.+$/;
const HUMAN_ONLY = 'Only a human may accept an artifact: open the file and set status, accepted_by and accepted_at yourself.';

function newTexts(tool, ti) {
  const t = [];
  if (typeof ti.content === 'string') t.push(ti.content);
  if (typeof ti.new_string === 'string') t.push(ti.new_string);
  if (typeof ti.new_source === 'string') t.push(ti.new_source);
  if (Array.isArray(ti.edits)) for (const e of ti.edits) if (e && typeof e.new_string === 'string') t.push(e.new_string);
  return t;
}

function targetPath(ti) {
  return ti.file_path || ti.notebook_path || ti.path || null;
}

function secretName(base) {
  if (/^\.env(\..+)?$/.test(base)) return !/^\.env\.(example|sample|template)$/.test(base);
  return /\.(pem|key)$/.test(base) || /^id_rsa/.test(base) || /^credentials/.test(base) || /^secrets\./.test(base);
}

// Primary protection is permissions.deny in settings.json; this is the second line of defense.
const PROTECTED = [
  '.claude/hooks/**', '.claude/settings.json', '.claude/settings.local.json', '.sdlc/config.json',
  '.sdlc/kit-lock.json', '.sdlc/bypass.log', '.sdlc/bin/**', '.github/workflows/sdlc-ci.yml',
  '.github/workflows/sdlc-accept.yml', '.github/CODEOWNERS',
];
const PROTECTED_RE = /(\.claude\/hooks\/|\.claude\/settings(\.local)?\.json|\.sdlc\/config\.json|\.sdlc\/kit-lock\.json|\.sdlc\/bypass\.log|\.sdlc\/bin\/|\.github\/workflows\/sdlc-(ci|accept)\.yml|\.github\/CODEOWNERS)/;
const ACCEPT_CMD_RE = /\bai-sdlc(?:\.mjs)?\s+accept\b|\baccept\.mjs\b/;
const READ_ONLY_RE = /^\s*(cat|grep|rg|ls|head|tail|wc|diff|less|git\s+(log|diff|show|status))\b/;
const HOW_TO_ACCEPT = 'Ask the human to accept it: comment `/accept <stage>` on the PR, or run `npx github:hoanhoang-agilityio/ai-sdlc accept <stage>`.';
const MUTATE_RE = /(sed\s+(-[a-zA-Z]*i|--in-place)|perl\s+-[a-zA-Z]*i|\btee\b|>>?|\becho\b|\bprintf\b|\bpython3?\b|node\s+-e|\bawk\b|cat\s*<<|\brm\b|\bmv\b|\bcp\b|\btruncate\b|\bchmod\b|git\s+checkout\s+--|git\s+restore)/;

function checkBash(root, cfg, cmd) {
  const probe = cmd.replace(/\d*>&\d+/g, '').replace(/\d*>\s*\/dev\/null/g, '');
  const writeLike = /(sed\s+(-[a-zA-Z]*i|--in-place)|perl\s+-[a-zA-Z]*i|\btee\b|>>?|\becho\b|\bprintf\b|\bpython3?\b|node\s+-e|\bawk\b|cat\s*<<)/;
  if ((/status:\s*["']?accepted/i.test(cmd) || /accepted_by:\s*\S/i.test(cmd)) && writeLike.test(probe)) {
    block(`Blocked: shell command writes an acceptance field. ${HUMAN_ONLY}`);
  }
  for (const seg of probe.split(/&&|\|\||;|\n|\|/)) {
    const m = PROTECTED_RE.exec(seg);
    if (m && MUTATE_RE.test(seg) && !/^\s*git\s+(?:-\S+\s+)*commit\b/.test(seg)) block(`${m[1].replace(/\/$/, '')} is protected; propose the change and ask the human to apply it.`);
  }
  for (const seg of probe.split(/&&|\|\||;|\n|\|/)) {
    if (ACCEPT_CMD_RE.test(seg) && !READ_ONLY_RE.test(seg)) block(`Blocked: only a human may accept an artifact. ${HOW_TO_ACCEPT}`);
  }
  const def = (cfg && cfg.defaultBranch) || 'main';
  const branches = new Set(['main', 'master', def]);
  // split into simple commands to avoid matching across && chains
  for (const part of cmd.split(/&&|\|\||;|\n|\|/)) {
    const p = part.trim();
    if (/\bgit\b/.test(p) && /--no-verify\b/.test(p)) block('Blocked: --no-verify skips hooks. Fix the failing check instead.');
    if (/^(?:\S+=\S*\s+)*git\s+(?:-\S+\s+\S+\s+)*push\b/.test(p) || /\bgit\s+push\b/.test(p)) {
      const args = p.slice(p.search(/\bpush\b/) + 4).trim().split(/\s+/).filter(Boolean);
      if (args.some((a) => a === '--force' || a === '-f' || a.startsWith('--force-with-lease') || (/^-[a-zA-Z]*f[a-zA-Z]*$/.test(a)) || a.startsWith('+'))) {
        block('Blocked: force push is not allowed.');
      }
      const positional = args.filter((a) => !a.startsWith('-'));
      for (const a of positional) {
        const dst = a.includes(':') ? a.split(':').pop() : a;
        const d = dst.replace(/^refs\/heads\//, '');
        if (branches.has(d) && (a.includes(':') || positional.length >= 2)) {
          block(`Blocked: pushing to ${d} is not allowed. Push a branch (feat/NNN-slug) and open a PR.`);
        }
      }
      if (positional.length < 2 && !positional.some((a) => a.includes(':'))) {
        const cur = currentBranch(root);
        if (cur && branches.has(cur)) block(`Blocked: git push from ${cur}. Work on branch feat/NNN-slug and open a PR.`);
      }
    }
    if (/\bgh\s+pr\s+merge\b/.test(p) || (/\bgh\s+api\b/.test(p) && /\/merge\b/.test(p))) {
      block('Blocked: merging is a human action. Ask a human to merge the PR.');
    }
    if (/\bgit\s+merge\b/.test(p)) {
      const cur = currentBranch(root);
      if (cur && branches.has(cur)) block(`Blocked: git merge while on ${cur}. Merge via a reviewed PR.`);
    }
  }
}

function checkPlan(root, name, abs, texts) {
  const dir = path.dirname(abs);
  let planRisk = riskRank((readFrontmatter(abs) || {}).risk);
  for (const t of texts) { const r = riskRank(parseFrontmatter(t).risk); if (r >= 0) planRisk = r; }
  const risk = highestRisk(fileRisk(dir), planRisk);
  if (risk === 'trivial' || risk === 'low') return;
  const missing = [];
  const design = path.join(dir, 'design', 'design.md');
  if (!isAccepted(path.join(dir, 'spec.md'))) missing.push('spec.md accepted (/accept spec)');
  if (!isAccepted(design)) missing.push('design/design.md accepted (/accept design)');
  // v0.2 compatibility: an accepted design/test-strategy.md or design/security.md also satisfies these.
  const legacy = (f) => isAccepted(path.join(dir, 'design', f));
  if (!hasHeading(design, 'Test strategy') && !legacy('test-strategy.md')) missing.push('a "## Test strategy" heading in design/design.md');
  if (risk === 'high' && !hasHeading(design, 'Security') && !legacy('security.md')) missing.push('a "## Security" heading in design/design.md');
  if (missing.length) {
    block(`Blocked: plan.md in intent/${name}/ is risk ${risk} and still needs: ${missing.join('; ')}. ${HOW_TO_ACCEPT}`);
  }
}

function checkFile(root, cfg, tool, ti) {
  const target = targetPath(ti);
  const rel = relToRoot(root, target);
  const texts = newTexts(tool, ti);

  // Rule 1
  for (const t of texts) {
    if (ACCEPT_RE.test(t) || ACCEPTED_BY_RE.test(t)) block(`Blocked: writing "status: accepted" / "accepted_by". ${HUMAN_ONLY}`);
  }
  if (rel === null) return; // outside the project: not ours to judge
  const abs = path.resolve(root, rel);

  // Protected files: human-only
  if (matchesAny(rel, PROTECTED)) block(`${rel} is protected; propose the change and ask the human to apply it.`);

  // Rule 5
  if (secretName(path.basename(rel))) block(`Blocked: ${rel} looks like a secrets file. Edit it yourself; use .env.example for templates.`);

  // Frozen: accepted design.md and ADRs; other design/ files follow design.md
  if (DESIGN_MD_RE.test(rel) || /^docs\/adr\/[^/]+\.md$/.test(rel)) {
    if (isAccepted(abs)) block(`Blocked: ${rel} is accepted and frozen. A human must set status: draft to reopen it.`);
  }
  const dm = DESIGN_RE.exec(rel);
  if (dm) {
    const spec = path.join(root, 'intent', dm[1], 'spec.md');
    if (!isAccepted(spec)) block(`Blocked: ${rel} needs an accepted spec.md in intent/${dm[1]}/. ${HOW_TO_ACCEPT.replace('<stage>', 'spec')}`);
    if (!rel.endsWith('/design/design.md') && isAccepted(path.join(root, 'intent', dm[1], 'design', 'design.md'))) {
      block(`Blocked: ${rel} is frozen because intent/${dm[1]}/design/design.md is accepted. A human must set it to draft to reopen it.`);
    }
  }

  // Frozen artifacts + plan prerequisites
  const m = ARTIFACT_RE.exec(rel);
  if (m) {
    if (isAccepted(abs)) block(`Blocked: ${rel} is accepted and frozen. A human must set status: draft to reopen it.`);
    if (m[2] === 'plan') checkPlan(root, m[1], abs, texts);
  }

  // Rule 4
  const allow = Array.isArray(cfg.codePathsAllowlist) ? cfg.codePathsAllowlist : DEFAULT_ALLOWLIST;
  if (!matchesAny(rel, allow)) {
    const act = activeChange(root);
    if (!act) block(`Blocked: ${rel} is code and no change is active. Write spec -> (design) -> plan, get the plan accepted (or plan risk: trivial), then run the build skill (it writes .sdlc/active).`);
    const plan = path.join(act.dir, 'plan.md');
    const trivial = changeRisk(act.dir) === 'trivial';
    if (!isAccepted(plan) && !trivial) block(`Blocked: active change intent/${act.name}/ has no accepted plan.md (and plan risk is not trivial). ${HOW_TO_ACCEPT.replace('<stage>', 'plan')}`);
  }
}

function main() {
  const input = readStdinJson();
  const root = projectRoot(input);
  const cfg = readConfig(root);
  if (!cfg) return;
  const tool = input.tool_name || '';
  const ti = input.tool_input || {};
  if (process.env.SDLC_GATE === 'off') {
    appendBypassLog(root, { ts: new Date().toISOString(), tool, target_or_command: tool === 'Bash' ? ti.command || '' : targetPath(ti) || '' });
    process.stderr.write('ai-sdlc: SDLC_GATE=off, gate bypassed (logged to .sdlc/bypass.log).\n');
    return;
  }
  if (tool === 'Bash') checkBash(root, cfg, String(ti.command || ''));
  else checkFile(root, cfg, tool, ti);
}

try {
  main();
} catch (e) {
  if (e instanceof Block) {
    process.stderr.write(e.message + '\n');
    process.exit(2);
  }
  process.stderr.write(`ai-sdlc gate: internal error, allowing. ${e && e.message}\n`);
}
