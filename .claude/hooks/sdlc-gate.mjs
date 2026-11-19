#!/usr/bin/env node
// ai-sdlc PreToolUse gate. Block = message on stderr + exit 2. Fails open on internal error.
import fs from 'node:fs';
import path from 'node:path';
import {
  DEFAULT_ALLOWLIST, readStdinJson, projectRoot, readConfig, readFrontmatter, isAccepted,
  matchesAny, relToRoot, currentBranch, appendBypassLog, activeChange, designState, DESIGN_FILES,
} from './lib.mjs';

class Block extends Error {}
const block = (msg) => { throw new Block(msg); };

const ACCEPT_RE = /^\s*status:\s*["']?accepted\b/im;
const ACCEPTED_BY_RE = /^\s*accepted_by:[ \t]*["']?[^\s"'#]/im;
const ARTIFACT_RE = /^intent\/([^/]+)\/(intent|spec|plan|incident)\.md$/;
const DESIGN_RE = /^intent\/([^/]+)\/design\/.+$/;
const DESIGN_MD_RE = /^intent\/[^/]+\/design\/[^/]+\.md$/;
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

const PROTECTED = [
  '.claude/hooks/**', '.claude/settings.json', '.claude/settings.local.json', '.sdlc/config.json',
  '.sdlc/kit-lock.json', '.sdlc/bypass.log', '.github/workflows/sdlc-ci.yml', '.github/CODEOWNERS',
];
const PROTECTED_RE = /(\.claude\/hooks\/|\.claude\/settings(\.local)?\.json|\.sdlc\/config\.json|\.sdlc\/kit-lock\.json|\.sdlc\/bypass\.log|\.github\/workflows\/sdlc-ci\.yml|\.github\/CODEOWNERS)/;
const MUTATE_RE = /(sed\s+(-[a-zA-Z]*i|--in-place)|perl\s+-[a-zA-Z]*i|\btee\b|>>?|\becho\b|\bprintf\b|\bpython3?\b|node\s+-e|\bawk\b|cat\s*<<|\brm\b|\bmv\b|\bcp\b|\btruncate\b|\bchmod\b|git\s+checkout\s+--|git\s+restore)/;

function checkBash(root, cfg, cmd) {
  const probe = cmd.replace(/\d*>&\d+/g, '').replace(/\d*>\s*\/dev\/null/g, '');
  const writeLike = /(sed\s+(-[a-zA-Z]*i|--in-place)|perl\s+-[a-zA-Z]*i|\btee\b|>>?|\becho\b|\bprintf\b|\bpython3?\b|node\s+-e|\bawk\b|cat\s*<<)/;
  if ((/status:\s*["']?accepted/i.test(cmd) || /accepted_by:\s*\S/i.test(cmd)) && writeLike.test(probe)) {
    block(`Blocked: shell command writes an acceptance field. ${HUMAN_ONLY}`);
  }
  for (const seg of probe.split(/&&|\|\||;|\n|\|/)) {
    const m = PROTECTED_RE.exec(seg);
    if (m && MUTATE_RE.test(seg)) block(`${m[1].replace(/\/$/, '')} is protected; propose the change and ask the human to apply it.`);
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

  // Rule 2 (frozen): design markdown, design-system files, ADRs
  const dsDir = path.join(root, 'docs', 'design-system');
  if (DESIGN_MD_RE.test(rel) || rel === 'docs/design-system/design-system.md' || /^docs\/adr\/[^/]+\.md$/.test(rel)) {
    if (isAccepted(abs)) block(`Blocked: ${rel} is accepted and frozen. A human must set status: draft to reopen it.`);
  }
  if ((rel === 'docs/design-system/tokens.json' || rel === 'docs/design-system/components.md') && isAccepted(path.join(dsDir, 'design-system.md'))) {
    block(`Blocked: ${rel} is frozen because docs/design-system/design-system.md is accepted. A human must set it to draft to reopen it.`);
  }

  // Rule 2 (frozen companions): contract files follow their accepted artifact
  const cm = /^(intent\/[^/]+\/design)\/(openapi\.ya?ml|asyncapi\.ya?ml|[^/]+\.graphql|prototype\/.+)$/.exec(rel);
  if (cm) {
    const owner = cm[2].startsWith('prototype/') ? 'prototype.md' : 'api.md';
    if (isAccepted(path.join(root, cm[1], owner))) block(`Blocked: ${rel} is frozen because ${cm[1]}/${owner} is accepted. A human must set it to draft to reopen it.`);
  }

  // Rule 3 (design): any file under intent/<d>/design/ needs an accepted spec.md
  const dm = DESIGN_RE.exec(rel);
  if (dm && !isAccepted(path.join(root, 'intent', dm[1], 'spec.md'))) {
    block(`Blocked: ${rel} needs an accepted spec.md in intent/${dm[1]}/. Ask the human to review and accept spec.md first.`);
  }

  // Rule 2 + 3
  const m = ARTIFACT_RE.exec(rel);
  if (m) {
    if (isAccepted(abs)) block(`Blocked: ${rel} is accepted and frozen. A human must set status: draft to reopen it.`);
    const dir = path.dirname(abs);
    const kind = m[2];
    if (kind === 'spec' && !isAccepted(path.join(dir, 'intent.md'))) {
      block(`Blocked: spec.md needs an accepted intent.md in intent/${m[1]}/. Ask the human to review and accept intent.md first.`);
    }
    if (kind === 'plan') {
      const ifm = readFrontmatter(path.join(dir, 'intent.md'));
      const intentOk = isAccepted(path.join(dir, 'intent.md'));
      const low = intentOk && String(ifm && ifm.risk || '').toLowerCase() === 'low';
      if (!low) {
        const missing = [];
        if (!isAccepted(path.join(dir, 'spec.md'))) missing.push('spec.md');
        const ds = designState(root, dir);
        if (ds.unknown.length) block(`Blocked: design.md requires unknown artifact '${ds.unknown[0]}'; valid: ${Object.keys(DESIGN_FILES).join(', ')}. Ask the human to fix requires: in intent/${m[1]}/design/design.md.`);
        if (!ds.accepted) missing.push('design/design.md');
        for (const it of ds.items) if (!it.accepted) missing.push(it.rel);
        if (missing.length) {
          block(`Blocked: plan.md in intent/${m[1]}/ needs these accepted first (or an accepted intent.md with risk: low): ${missing.join(', ')}. Ask the human to review and accept them.`);
        }
      }
    }
  }

  // Rule 4
  const allow = Array.isArray(cfg.codePathsAllowlist) ? cfg.codePathsAllowlist : DEFAULT_ALLOWLIST;
  if (!matchesAny(rel, allow)) {
    const act = activeChange(root);
    if (!act) block(`Blocked: ${rel} is code and no change is active. Write intent -> (spec) -> plan, get the plan accepted, then run the build skill (it writes .sdlc/active).`);
    if (!isAccepted(path.join(act.dir, 'plan.md'))) block(`Blocked: active change intent/${act.name}/ has no accepted plan.md. Ask the human to review and accept plan.md.`);
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
