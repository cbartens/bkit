// install/modules/codex.ts — the codex host module: `.codex/` agents and skills.

import * as fs from "node:fs";
import * as path from "node:path";
import { writeTier2, writeTier2JsonContained, ensureDir } from "../write.js";
import { managedVersionMarker, stampManagedVersion } from "../version-file.js";
import { applyCodexAgent, parseFrontmatter } from "../../render/hosts.js";
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
  removeOrphans,
  trackMirrorWrite,
} from "./core.js";

/**
 * Convert a workflow orchestrator (`.bkit/core/workflows/*.md`) into a Codex SKILL.md.
 *
 * Codex requires `name` and `description` in the skill frontmatter; the workflows already
 * carry `description`, so `name` is added and the body is kept verbatim (it is the whole
 * point — the workflow steps ARE the skill instructions). Tracker-conditional blocks are
 * resolved first, exactly as for the other hosts' command mirrors.
 */
export function applyCodexSkill(
  content: string,
  skillName: string,
  issueTracker: IssueTracker,
): string {
  const resolved = substituteWorkflow(content, issueTracker).output;
  const fmMatch = resolved.match(/^(---\r?\n)([\s\S]*?)(\r?\n---\r?\n?)/);
  if (!fmMatch) {
    return `---\nname: ${skillName}\ndescription: bkit ${skillName} workflow\n---\n\n${resolved}`;
  }
  const fmBlock = fmMatch[2];
  const body = resolved.slice(fmMatch[0].length);
  const parsed = parseFrontmatter(fmBlock);
  const description = (parsed.get("description") ?? `bkit ${skillName} workflow`).replace(
    /^"|"$/g,
    "",
  );
  return `---\nname: ${skillName}\ndescription: "${description.replace(/"/g, '\\"')}"\n---\n${body}`;
}

// ---------------------------------------------------------------------------
// runCodexModule — Codex CLI host (opt-in via --codex)
//
// Nullary flag, unlike --opencode: Codex has exactly one gateway (`openai`).
//
// Renders THREE things, two of them unlike any other host:
//   .codex/agents/<name>.toml          — TOML, not markdown-with-frontmatter
//   .codex/hooks.json + hooks/         — GateGuard registration (PreToolUse / apply_patch)
//   .agents/skills/bkit-<wf>/SKILL.md  — workflow entry points, as SKILLS not commands
//
// Skills: Codex has NO project-scoped command surface (custom prompts live only in
// ~/.codex/prompts). Codex's skill search path INCLUDES `$REPO_ROOT/.agents/skills`.
// Workflows are invoked `$bkit-design` on Codex, not `/bkit-design`, and the skills are
// visible to every host.
//
// NOTE there is no `.codex/config.toml`: `openai` is a RESERVED built-in provider id in
// Codex; re-stating it is rejected.
// ---------------------------------------------------------------------------

/** Directory holding bkit-generated workflow skills, shared across hosts. */
export const CODEX_SKILLS_DIR = ".agents/skills";

/**
 * Render `.codex/agents/*.toml` and the workflow skills. Extracted so `bkit upgrade`
 * re-renders them identically — bkit-owned output, force-overwritten.
 */
export function renderCodexAgentsSkills(ctx: ModuleContext): string[] {
  const { dryRun, effortMap, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;
  const version = ctx.version ?? readInstallingVersion();
  const written: string[] = [];
  const codexModelLookup = ctx.codexModelLookup;
  if (!codexModelLookup) {
    throw new Error("renderCodexAgentsSkills: ctx.codexModelLookup is required");
  }

  // --- Agents: markdown+frontmatter -> TOML, managed-version marker as the first line ---
  {
    const src = getPromptsRoot();
    const dest = ".codex/agents";
    if (!dryRun) ensureDir(dest);
    const files = listMdFiles(src, BKIT_PREFIX);
    // Destination basenames are .toml, so the orphan sweep compares on the .toml names.
    const sourceNames = new Set(files.map((f) => f.replace(/\.md$/, ".toml")));

    for (const f of files) {
      const stem = f.replace(/\.md$/, "");
      const transform = (c: string) =>
        `${managedVersionMarker(version, "hash")}\n` +
        applyCodexAgent(substituteWorkflow(c, issueTracker).output, codexModelLookup, effortMap);
      if (installFile(path.join(src, f), path.join(dest, `${stem}.toml`), transform, dryRun)) {
        const rel = path.join(dest, `${stem}.toml`);
        console.log(`${logPrefix} ${tag}write: ${rel}`);
        trackMirrorWrite(ctx, rel, written);
      }
    }

    for (const f of removeOrphans(dest, sourceNames, dryRun, BKIT_PREFIX, { extension: ".toml" })) {
      const rel = path.join(dest, f);
      console.log(`${logPrefix} ${tag}delete orphan: ${rel}`);
      trackMirrorWrite(ctx, rel, written);
    }
  }

  // --- Workflow skills: one directory per workflow, each holding SKILL.md ---
  // `.agents/skills/` is Codex's. The Antigravity host installs its own workflow skills
  // into a workspace plugin (`.agents/plugins/bkit/skills/`) instead, so this directory
  // has a single writer and the two hosts never fight over one file.
  {
    const src = getWorkflowsRoot();
    const files = listMdFiles(src, BKIT_PREFIX);
    const sourceStems = new Set(files.map((f) => f.replace(/\.md$/, "")));
    if (!dryRun && files.length > 0) ensureDir(CODEX_SKILLS_DIR);

    for (const f of files) {
      const stem = f.replace(/\.md$/, "");
      const dest = path.join(CODEX_SKILLS_DIR, stem, "SKILL.md");
      if (!dryRun) ensureDir(path.dirname(dest));
      const transform = (c: string) =>
        stampManagedVersion(applyCodexSkill(c, stem, issueTracker), version);
      if (installFile(path.join(src, f), dest, transform, dryRun)) {
        console.log(`${logPrefix} ${tag}write: ${dest}`);
        trackMirrorWrite(ctx, dest, written);
      }
    }

    // Orphan sweep is bkit-prefix scoped: `.agents/skills/` is SHARED with third-party
    // skills installed via skills.sh, so anything not named bkit-* is off limits here.
    const orphans = removeOrphans(CODEX_SKILLS_DIR, sourceStems, dryRun, BKIT_PREFIX, {
      wholeFolders: true,
    });
    for (const d of orphans) {
      const rel = path.join(CODEX_SKILLS_DIR, d);
      console.log(`${logPrefix} ${tag}delete orphan: ${rel}`);
      trackMirrorWrite(ctx, rel, written);
    }
  }

  return written;
}

export function runCodexModule(ctx: ModuleContext): void {
  const { dryRun, advisories, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";

  renderCodexAgentsSkills(ctx);

  const codexShared = path.join(getSharedRoot(), ".codex");
  const codexHooks = path.join(getCoreRoot(), ".codex", "hooks");

  // --- hooks.json — Tier-2 deep-contained (consumers may add their own event groups) ---
  {
    const jsonSrc = path.join(codexShared, "hooks.json");
    const jsonDst = ".codex/hooks.json";
    if (fs.existsSync(jsonSrc)) {
      if (!dryRun) ensureDir(path.dirname(jsonDst));
      const prevLen = ws.writes.length;
      writeTier2JsonContained(jsonSrc, jsonDst, dryRun, ws);
      if (ws.writes.length > prevLen) console.log(`${logPrefix} ${tag}codex: ${jsonDst}`);
    }
  }

  // --- bkit-gateguard.cjs / bkit-readguard.cjs — Tier-2 markered-text, twins of the Claude hooks ---
  for (const hook of ["bkit-gateguard.cjs", "bkit-readguard.cjs"]) {
    const hookSrc = path.join(codexHooks, hook);
    const hookDst = `.codex/hooks/${hook}`;
    if (fs.existsSync(hookSrc)) {
      if (!dryRun) ensureDir(path.dirname(hookDst));
      const prevLen = ws.writes.length;
      writeTier2(hookSrc, hookDst, ctx.tokens, "slash-comment", dryRun, ws);
      if (ws.writes.length > prevLen) console.log(`${logPrefix} ${tag}codex: ${hookDst}`);
    }
  }

  // --- bkit-guardrails.cjs — Tier-2 markered-text, twin of the Cursor hook ---
  // Registered on matcher `Bash` in hooks.json above. Same decision engine as Cursor;
  // the deny tier blocks, the ask tier is advisory because Codex parses but does not
  // implement `permissionDecision: "ask"`.
  {
    const railSrc = path.join(codexHooks, "bkit-guardrails.cjs");
    const railDst = ".codex/hooks/bkit-guardrails.cjs";
    if (fs.existsSync(railSrc)) {
      if (!dryRun) ensureDir(path.dirname(railDst));
      const prevLen = ws.writes.length;
      writeTier2(railSrc, railDst, ctx.tokens, "slash-comment", dryRun, ws);
      if (ws.writes.length > prevLen) console.log(`${logPrefix} ${tag}codex: ${railDst}`);
    }
  }

  advisories.push({
    id: "codex-setup",
    severity: "advisory",
    detect: "codex host installed (.codex/agents + .agents/skills/bkit-*).",
    action:
      "Three things that differ from the other hosts:\n" +
      "1. TRUST THE LAYER. Codex loads project-local hooks only once the `.codex/` layer is trusted. Until then GateGuard and ReadGuard are installed and never fire.\n" +
      "2. Workflows are SKILLS here, not slash commands: invoke `$bkit-design`, not `/bkit-design`.\n" +
      "3. Per-agent `tools:` is NOT enforced. Codex has no tool allowlist, so every agent gets the full built-in tool set. See .bkit/providers.md.",
  });
}
