// install/modules/antigravity.ts — the Google Antigravity host module. The whole host
// installs into a workspace PLUGIN at `.agents/plugins/bkit/`, so `.agents/` root stays
// the dedicated Codex install.

import * as fs from "node:fs";
import * as path from "node:path";
import { writeTier2, writeTier2JsonContained, ensureDir } from "../write.js";
import { stampManagedVersion } from "../version-file.js";
import {
  ANTIGRAVITY_AGENTS_DIR,
  applyAntigravityPrompt,
  applyAntigravitySkill,
} from "../../render/hosts.js";
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
// The host installs as a workspace PLUGIN (`.agents/plugins/bkit/`) — Antigravity's own
// packaging surface (antigravity.google/docs/plugins). The plugin activates per project:
//   .agents/plugins/bkit/plugin.json              — plugin manifest (required)
//   .agents/plugins/bkit/skills/bkit-<wf>/SKILL.md — workflow entry points (skills)
//   .agents/plugins/bkit/agents/<name>.md         — subagent prompt definitions
//   .agents/plugins/bkit/hooks.json + hooks/      — GateGuard registration (PreToolUse)
//
// `.agents/` ROOT stays the dedicated Codex install: Codex workflow skills live at
// `.agents/skills/bkit-<wf>/SKILL.md` and this module never writes there.
//
// There is no native subagent tool on Antigravity: the orchestrator loads a prompt with
// `view_file` and executes its step contract in-session, which is why the workflow skills
// respell `**Subagent:** @name` to the plugin's `agents/<name>.md` path.
//
// `.agents/plugins/` may hold consumer plugins, so every sweep here is scoped to the
// `bkit` plugin directory (and, within it, to `bkit-` prefixed entries).
// ---------------------------------------------------------------------------

/** The bkit Antigravity workspace plugin root. */
export const ANTIGRAVITY_PLUGIN_DIR = ".agents/plugins/bkit";

/** Workflow skills, one directory per workflow, each holding SKILL.md. */
export const ANTIGRAVITY_SKILLS_DIR = ".agents/plugins/bkit/skills";

/** Subagent prompt definitions. Sourced from the renderer's shared constant. */
export { ANTIGRAVITY_AGENTS_DIR };

/** Hook scripts referenced by the plugin's hooks.json. */
export const ANTIGRAVITY_HOOKS_DIR = ".agents/plugins/bkit/hooks";

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
 * Render the plugin's subagent prompts and workflow skills. Extracted so `bkit upgrade`
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

  // --- Prompts: markdown+frontmatter -> .agents/plugins/bkit/agents/<name>.md ---
  {
    const src = getPromptsRoot();
    const dest = ANTIGRAVITY_AGENTS_DIR;
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

    // Orphan sweep is bkit-prefix scoped — the plugin's agents/ is bkit-owned.
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

    // Prefix-scoped sweep inside the bkit plugin's skills/.
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

  const pluginShared = path.join(getSharedRoot(), ".agents", "plugins", "bkit");
  const pluginHooksSrc = path.join(getCoreRoot(), ".agents", "plugins", "bkit", "hooks");

  // --- plugin.json — Tier-2 json (deep-contained), the required plugin manifest ---
  {
    const jsonSrc = path.join(pluginShared, "plugin.json");
    const jsonDst = path.join(ANTIGRAVITY_PLUGIN_DIR, "plugin.json");
    if (fs.existsSync(jsonSrc)) {
      if (!dryRun) ensureDir(path.dirname(jsonDst));
      const prevLen = ws.writes.length;
      writeTier2JsonContained(jsonSrc, jsonDst, dryRun, ws);
      if (ws.writes.length > prevLen) console.log(`${logPrefix} ${tag}antigravity: ${jsonDst}`);
    }
  }

  // Root GEMINI.md — Antigravity workspace-rule redirect to .agents/rules.md. A ROOT file
  // (not under .agents/), so the plugin walk does not cover it. Tier-2 markered-text
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

  // --- plugin hooks.json — Tier-2 deep-contained (consumers may add their own groups) ---
  {
    const jsonSrc = path.join(pluginShared, "hooks.json");
    const jsonDst = path.join(ANTIGRAVITY_PLUGIN_DIR, "hooks.json");
    if (fs.existsSync(jsonSrc)) {
      if (!dryRun) ensureDir(path.dirname(jsonDst));
      const prevLen = ws.writes.length;
      writeTier2JsonContained(jsonSrc, jsonDst, dryRun, ws);
      if (ws.writes.length > prevLen) console.log(`${logPrefix} ${tag}antigravity: ${jsonDst}`);
    }
  }

  // --- bkit-gateguard.cjs / bkit-readguard.cjs — Tier-2 markered-text, twins of the Claude/Codex hooks ---
  for (const hook of ["bkit-gateguard.cjs", "bkit-readguard.cjs"]) {
    const hookSrc = path.join(pluginHooksSrc, hook);
    const hookDst = path.join(ANTIGRAVITY_HOOKS_DIR, hook);
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
    const railSrc = path.join(pluginHooksSrc, "bkit-guardrails.cjs");
    const railDst = path.join(ANTIGRAVITY_HOOKS_DIR, "bkit-guardrails.cjs");
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
      "antigravity host installed as a workspace plugin (.agents/plugins/bkit/: plugin.json + skills/bkit-* + agents/ + hooks.json).",
    action:
      "Three things that differ from the other hosts:\n" +
      "1. Workflows are SKILLS here, not slash commands: Antigravity discovers them under `.agents/plugins/bkit/skills/bkit-<wf>/SKILL.md` (the plugin activates per project — no toggle).\n" +
      "2. There is no native subagent tool. The orchestrator loads each subagent prompt from `.agents/plugins/bkit/agents/` with `view_file` and executes it in-session; isolated runs use `run_command` (`agy`).\n" +
      "3. GateGuard, ReadGuard and guardrails are wired from `.agents/plugins/bkit/hooks.json` (PreToolUse on `write_to_file` / `replace_file_content` / `view_file` / `run_command`). See .bkit/providers.md.",
  });

  // Both hosts installed: Antigravity's skill selector lists TWO sets of bkit-* skills.
  // Codex does not merge same-named skills; Antigravity lists both. Warn which to pick.
  const codexPresent =
    ctx.installedModules?.has("codex") ??
    fs.existsSync(path.join(process.cwd(), ".codex", "agents"));
  if (codexPresent) {
    advisories.push({
      id: "antigravity-codex-skill-overlap",
      severity: "advisory",
      detect:
        "Codex and Antigravity are both installed — Antigravity's skill selector now lists BOTH the Codex workflow skills (`.agents/skills/bkit-<wf>/SKILL.md`) and the Antigravity plugin skills (`.agents/plugins/bkit/skills/bkit-<wf>/SKILL.md`).",
      action:
        "In Antigravity, invoke the WORKFLOW skills from the plugin under `.agents/plugins/bkit/skills/bkit-<wf>/SKILL.md` — they carry Antigravity's tool vocabulary (`view_file`, plugin subagent paths). The `.agents/skills/bkit-*` copies are Codex's install and name Claude/Codex tools Antigravity does not have. If you only use one host, the other's skills are harmless but may appear in the picker.",
    });
  }
}
