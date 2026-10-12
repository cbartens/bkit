// install/modules/antigravity.ts — the Google Antigravity host module: `.agents/`
// prompts, skills and hooks.

import * as fs from "node:fs";
import * as path from "node:path";
import { writeTier2, writeTier2JsonContained, ensureDir } from "../write.js";
import { stampManagedVersion } from "../version-file.js";
import { applyAntigravityPrompt, applyAntigravitySkill } from "../../render/hosts.js";
import {
  getCoreRoot,
  getSharedRoot,
  getWorkflowsRoot,
  getPromptsRoot,
} from "../../shared/package-roots.js";
import { type IssueTracker, DEFAULT_ISSUE_TRACKER } from "../manifest.js";
import { substituteWorkflow } from "../../render/trackers.js";
import type { ModuleContext } from "./index.js";
import {
  BKIT_PREFIX,
  installFile,
  listMdFiles,
  readInstallingVersion,
  trackMirrorWrite,
} from "./core.js";

// ---------------------------------------------------------------------------
// runAntigravityModule — Google Antigravity IDE host (opt-in via --antigravity)
//
// Nullary flag, like --codex: Antigravity runs on one pinned gateway (`google`).
//
// Renders THREE things, all under the `.agents/` root Antigravity standardises on:
//   .agents/prompts/<name>.md           — subagent prompt definitions (executed in-session)
//   .agents/skills/bkit-<wf>/SKILL.md   — workflow entry points, as SKILLS not commands
//   .agents/hooks.json + hooks/         — GateGuard registration (PreToolUse)
//
// There is no native subagent tool on Antigravity: the orchestrator loads a prompt with
// `view_file` and executes its step contract in-session, which is why the workflow skills
// respell `**Subagent:** @name` to the prompt file path (applyAntigravityToolRewrites).
//
// `.agents/skills/` is SHARED with Codex and with third-party skills, so every sweep
// here is `bkit-` prefix scoped.
// ---------------------------------------------------------------------------

/** Directory holding bkit-generated workflow skills, shared across hosts. */
export const ANTIGRAVITY_SKILLS_DIR = ".agents/skills";

/** Directory holding bkit-generated subagent prompts. */
export const ANTIGRAVITY_PROMPTS_DIR = ".agents/prompts";

/**
 * Convert a workflow orchestrator into an Antigravity SKILL.md. Tracker-conditional
 * blocks are resolved first, exactly as for the other hosts' command mirrors.
 */
export function applyAntigravityWorkflowSkill(
  content: string,
  skillName: string,
  issueTracker: IssueTracker,
): string {
  return applyAntigravitySkill(substituteWorkflow(content, issueTracker).output, skillName);
}

/**
 * Render `.agents/prompts/*.md` and the workflow skills. Extracted so `bkit upgrade`
 * re-renders them identically — bkit-owned output, force-overwritten.
 */
export function renderAntigravityAgentsSkills(ctx: ModuleContext): string[] {
  const { dryRun, effortMap, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;
  const version = ctx.version ?? readInstallingVersion();
  const written: string[] = [];
  const modelLookup = ctx.antigravityModelLookup;
  if (!modelLookup) {
    throw new Error("renderAntigravityAgentsSkills: ctx.antigravityModelLookup is required");
  }

  // --- Prompts: markdown+frontmatter -> .agents/prompts/<name>.md ---
  {
    const src = getPromptsRoot();
    const dest = ANTIGRAVITY_PROMPTS_DIR;
    if (!dryRun) ensureDir(dest);
    const files = listMdFiles(src, BKIT_PREFIX);
    const sourceSet = new Set(files);

    for (const f of files) {
      const transform = (c: string) =>
        stampManagedVersion(
          applyAntigravityPrompt(
            substituteWorkflow(c, issueTracker).output,
            modelLookup,
            effortMap,
          ),
          version,
        );
      if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
        const rel = path.join(dest, f);
        console.log(`${logPrefix} ${tag}write: ${rel}`);
        trackMirrorWrite(ctx, rel, written);
      }
    }

    // Orphan sweep is bkit-prefix scoped — `.agents/prompts/` may carry consumer prompts.
    if (fs.existsSync(dest)) {
      for (const f of fs.readdirSync(dest)) {
        if (!f.startsWith(BKIT_PREFIX)) continue;
        if (sourceSet.has(f)) continue;
        const rel = path.join(dest, f);
        if (!dryRun) fs.rmSync(rel, { force: true });
        console.log(`${logPrefix} ${tag}delete orphan: ${rel}`);
        trackMirrorWrite(ctx, rel, written);
      }
    }
  }

  // --- Workflow skills: one directory per workflow, each holding SKILL.md ---
  {
    const src = getWorkflowsRoot();
    const files = listMdFiles(src, BKIT_PREFIX);
    const sourceStems = new Set(files.map((f) => f.replace(/\.md$/, "")));
    if (!dryRun && files.length > 0) ensureDir(ANTIGRAVITY_SKILLS_DIR);

    for (const f of files) {
      const stem = f.replace(/\.md$/, "");
      const dest = path.join(ANTIGRAVITY_SKILLS_DIR, stem, "SKILL.md");
      if (!dryRun) ensureDir(path.dirname(dest));
      const transform = (c: string) =>
        stampManagedVersion(applyAntigravityWorkflowSkill(c, stem, issueTracker), version);
      if (installFile(path.join(src, f), dest, transform, dryRun)) {
        console.log(`${logPrefix} ${tag}write: ${dest}`);
        trackMirrorWrite(ctx, dest, written);
      }
    }

    // Prefix-scoped sweep: `.agents/skills/` is shared with third-party skills.
    if (fs.existsSync(ANTIGRAVITY_SKILLS_DIR)) {
      for (const d of fs.readdirSync(ANTIGRAVITY_SKILLS_DIR)) {
        if (!d.startsWith(BKIT_PREFIX)) continue;
        if (sourceStems.has(d)) continue;
        const rel = path.join(ANTIGRAVITY_SKILLS_DIR, d);
        if (!dryRun) fs.rmSync(rel, { recursive: true, force: true });
        console.log(`${logPrefix} ${tag}delete orphan: ${rel}`);
        trackMirrorWrite(ctx, rel, written);
      }
    }
  }

  return written;
}

export function runAntigravityModule(ctx: ModuleContext): void {
  const { dryRun, advisories, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";

  renderAntigravityAgentsSkills(ctx);

  const agyShared = path.join(getSharedRoot(), ".agents");
  const agyHooks = path.join(getCoreRoot(), ".agents", "hooks");

  // Root GEMINI.md — Antigravity workspace-rule redirect to .agents/rules.md. A ROOT file
  // (not under .agents/), so the .agents/ walk does not cover it. Tier-2 markered-text
  // (writeTier2 html-comment), exact twin of the claude module's CLAUDE.md.
  {
    const src = path.join(getSharedRoot(), "GEMINI.md");
    const dst = "GEMINI.md";
    if (fs.existsSync(src)) {
      const prevLen = ws.writes.length;
      writeTier2(src, dst, ctx.tokens, "html-comment", dryRun, ws);
      if (ws.writes.length > prevLen) console.log(`${logPrefix} ${tag}antigravity: ${dst}`);
    }
  }

  // --- hooks.json — Tier-2 deep-contained (consumers may add their own event groups) ---
  {
    const jsonSrc = path.join(agyShared, "hooks.json");
    const jsonDst = ".agents/hooks.json";
    if (fs.existsSync(jsonSrc)) {
      if (!dryRun) ensureDir(path.dirname(jsonDst));
      const prevLen = ws.writes.length;
      writeTier2JsonContained(jsonSrc, jsonDst, dryRun, ws);
      if (ws.writes.length > prevLen) console.log(`${logPrefix} ${tag}antigravity: ${jsonDst}`);
    }
  }

  // --- bkit-gateguard.cjs — Tier-2 markered-text, twin of the Claude/Codex hook ---
  {
    const hookSrc = path.join(agyHooks, "bkit-gateguard.cjs");
    const hookDst = ".agents/hooks/bkit-gateguard.cjs";
    if (fs.existsSync(hookSrc)) {
      if (!dryRun) ensureDir(path.dirname(hookDst));
      const prevLen = ws.writes.length;
      writeTier2(hookSrc, hookDst, ctx.tokens, "slash-comment", dryRun, ws);
      if (ws.writes.length > prevLen) console.log(`${logPrefix} ${tag}antigravity: ${hookDst}`);
    }
  }

  // --- bkit-guardrails.cjs — Tier-2 markered-text, twin of the Cursor/Codex hook ---
  // Registered on matcher `run_command` in hooks.json above. Same decision engine as the
  // other hosts; the deny tier blocks for real.
  {
    const railSrc = path.join(agyHooks, "bkit-guardrails.cjs");
    const railDst = ".agents/hooks/bkit-guardrails.cjs";
    if (fs.existsSync(railSrc)) {
      if (!dryRun) ensureDir(path.dirname(railDst));
      const prevLen = ws.writes.length;
      writeTier2(railSrc, railDst, ctx.tokens, "slash-comment", dryRun, ws);
      if (ws.writes.length > prevLen) console.log(`${logPrefix} ${tag}antigravity: ${railDst}`);
    }
  }

  advisories.push({
    id: "antigravity-setup",
    severity: "advisory",
    detect:
      "antigravity host installed (.agents/prompts + .agents/skills/bkit-* + .agents/hooks.json).",
    action:
      "Three things that differ from the other hosts:\n" +
      "1. Workflows are SKILLS here, not slash commands: Antigravity discovers them under `.agents/skills/bkit-*/SKILL.md`.\n" +
      "2. There is no native subagent tool. The orchestrator loads each subagent prompt from `.agents/prompts/` with `view_file` and executes it in-session; isolated runs use `run_command` (`agy`).\n" +
      "3. GateGuard and guardrails are wired from `.agents/hooks.json` (PreToolUse on `write_to_file` / `replace_file_content` / `run_command`). See .bkit/providers.md.",
  });
}
