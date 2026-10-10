// install/modules/cursor.ts — the cursor host module: `.cursor/` agents, commands and config.

import * as fs from "node:fs";
import * as path from "node:path";
import { writeTier2, writeTier2JsonContained, ensureDir } from "../write.js";
import { stampManagedVersion } from "../version-file.js";
import { applyT1, applyT2, applyT3 } from "../../render/hosts.js";
import { getTemplatesRoot, getWorkflowsRoot, getPromptsRoot } from "../../shared/package-roots.js";
import { DEFAULT_ISSUE_TRACKER } from "../manifest.js";
import { substituteWorkflow } from "../../render/trackers.js";
import {
  writeCursorCloudDoc,
  writeNetworkAllowlistArtifact,
  writeCursorCliPermissionsArtifact,
} from "../cloud-env.js";
import type { ModuleContext } from "./index.js";
import {
  BKIT_PREFIX,
  installFile,
  listMdFiles,
  readInstallingVersion,
  removeOrphans,
  trackMirrorWrite,
} from "./core.js";
import { reconcileMcpJson } from "./claude.js";

export function renderCursorAgentsCommands(ctx: ModuleContext): string[] {
  const { dryRun, modelLookup, effortMap, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";
  const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;
  const version = ctx.version ?? readInstallingVersion();
  const written: string[] = [];

  // Commands: tracker block resolution → T1 → T2 → managed-version stamp (last)
  {
    const src = getWorkflowsRoot();
    const dest = ".cursor/commands";
    ensureDir(dest);
    const files = listMdFiles(src, BKIT_PREFIX);
    const sourceSet = new Set(files);

    for (const f of files) {
      const transform = (c: string) =>
        stampManagedVersion(applyT2(applyT1(substituteWorkflow(c, issueTracker).output)), version);
      if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
        const rel = path.join(dest, f);
        console.log(`${logPrefix} ${tag}write: ${rel}`);
        trackMirrorWrite(ctx, rel, written);
      }
    }

    for (const f of removeOrphans(dest, sourceSet, dryRun, BKIT_PREFIX)) {
      const rel = path.join(dest, f);
      console.log(`${logPrefix} ${tag}delete orphan: ${rel}`);
      trackMirrorWrite(ctx, rel, written);
    }
  }

  // Agents: tracker block resolution → T3
  {
    const src = getPromptsRoot();
    const dest = ".cursor/agents";
    ensureDir(dest);
    const files = listMdFiles(src, BKIT_PREFIX);
    const sourceSet = new Set(files);

    for (const f of files) {
      const transform = (c: string) =>
        stampManagedVersion(
          applyT3(substituteWorkflow(c, issueTracker).output, modelLookup, effortMap),
          version,
        );
      if (installFile(path.join(src, f), path.join(dest, f), transform, dryRun)) {
        const rel = path.join(dest, f);
        console.log(`${logPrefix} ${tag}write: ${rel}`);
        trackMirrorWrite(ctx, rel, written);
      }
    }

    for (const f of removeOrphans(dest, sourceSet, dryRun, BKIT_PREFIX)) {
      const rel = path.join(dest, f);
      console.log(`${logPrefix} ${tag}delete orphan: ${rel}`);
      trackMirrorWrite(ctx, rel, written);
    }
  }
  return written;
}

// ---------------------------------------------------------------------------
// runCursorModule — T1/T2/T3 transforms from .agents/ → .cursor/
// ---------------------------------------------------------------------------

export function runCursorModule(ctx: ModuleContext): void {
  const { dryRun, tokens, advisories, ws, logPrefix } = ctx;
  const tag = dryRun ? "[dry-run] " : "";

  const issueTracker = ctx.issueTracker ?? DEFAULT_ISSUE_TRACKER;

  // Source-rendered agents/commands (.cursor/agents T3 from .bkit/prompts, .cursor/commands
  // T1/T2 from .bkit/workflows). Extracted to renderCursorAgentsCommands so `bkit upgrade`
  // re-renders them identically — bkit-owned output, force-overwritten.
  renderCursorAgentsCommands(ctx);

  // Tier 2 JSON (contained) — deep-containment: hooks.json
  const cursorTemplates = path.join(getTemplatesRoot(), ".cursor");
  const hooksSrc = path.join(cursorTemplates, "hooks.json");
  const hooksDst = ".cursor/hooks.json";
  if (fs.existsSync(hooksSrc)) {
    const prevLen = ws.writes.length;
    writeTier2JsonContained(hooksSrc, hooksDst, dryRun, ws);
    if (ws.writes.length > prevLen) {
      console.log(`${logPrefix} ${tag}cursor: ${hooksDst}`);
    }
  }

  // Markered-text — manifest format: "markered-text" — preflight hook + shared rules.
  // All use html-comment markers (# <!-- bkit:start --> / # <!-- bkit:end -->).
  // Uses writeTier2 to update only the bkit-managed block; consumer content outside
  // markers is preserved. `.cursor/Dockerfile` is a template (`.bkit/templates.md`).
  {
    const markeredFiles: Array<[string, string]> = [
      [path.join(cursorTemplates, "hooks", "preflight.sh"), ".cursor/hooks/preflight.sh"],
      [
        path.join(cursorTemplates, "rules", "00-shared-rules.mdc"),
        ".cursor/rules/00-shared-rules.mdc",
      ],
    ];
    for (const [src, dst] of markeredFiles) {
      if (!fs.existsSync(src)) continue;
      const prevLen = ws.writes.length;
      writeTier2(src, dst, tokens, "html-comment", dryRun, ws);
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}cursor: ${dst}`);
      }
    }
  }

  // markered-text (slash-comment) — Cursor destructive-op / secret-exposure guardrails
  // (parity with Claude permissions deny/ask and OpenCode permission map). bkit owns
  // only the decision engine between the markers; consumers own the stdin/stdout driver
  // from first install onward, same split as the two GateGuard hooks.
  {
    const src = path.join(cursorTemplates, "hooks", "guardrails.cjs");
    const dst = ".cursor/hooks/guardrails.cjs";
    if (fs.existsSync(src)) {
      const prevLen = ws.writes.length;
      writeTier2(src, dst, tokens, "slash-comment", dryRun, ws);
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}cursor: ${dst}`);
      }
    }
  }

  // markered-text (slash-comment) — GateGuard advisory PreToolUse hook for Cursor.
  // Same managed block as the Claude twin; the driver outside it adapts Cursor's
  // payload (relative file_path, no subagent marker) and emits Cursor's shape.
  {
    const src = path.join(cursorTemplates, "hooks", "gateguard.cjs");
    const dst = ".cursor/hooks/gateguard.cjs";
    if (fs.existsSync(src)) {
      const prevLen = ws.writes.length;
      writeTier2(src, dst, tokens, "slash-comment", dryRun, ws);
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}cursor: ${dst}`);
      }
    }
  }

  // .cursor/mcp.json — same per-entry ownership as .mcp.json (reconcileMcpJson).
  {
    const cursorMcpSrc = path.join(cursorTemplates, "mcp.json");
    const cursorMcpDst = path.join(".cursor", "mcp.json");
    if (fs.existsSync(cursorMcpSrc)) {
      const prevLen = ws.writes.length;
      reconcileMcpJson(cursorMcpSrc, cursorMcpDst, issueTracker, dryRun, ws);
      if (ws.writes.length > prevLen) {
        console.log(`${logPrefix} ${tag}cursor: ${cursorMcpDst}`);
      }
    }
  }

  // Cursor-only runtime curl/wget allowlist (guardrails.cjs reads `.cursor/allowlist.json`).
  // Same domain set as Claude WebFetch / OpenCode bash allows — sourced from tooling
  // defaults ∪ consumer `allowed-domains`. Not under `.bkit/` (IDE-scoped artifact).
  // Cursor CLI / cloud-agent MCP allows (`.cursor/cli.json`) from consumer `mcp-servers` —
  // same server set as Claude `mcp__…` allows / OpenCode `<server>_*` permission rows.
  for (const art of [
    writeNetworkAllowlistArtifact(process.cwd(), dryRun),
    writeCursorCliPermissionsArtifact(process.cwd(), dryRun),
  ]) {
    if (art.wrote) {
      ws.writes.push({ path: art.path, action: "write" });
      console.log(`${logPrefix} ${tag}cursor: ${art.path}`);
    }
  }

  // Post-install advisory: macOS GUI-isolation note.
  // MCP token placeholders (${BKIT_GH_TOKEN}, ${BKIT_LINEAR_API_KEY}, …) in .cursor/mcp.json are
  // expanded by Cursor from the process environment. When Cursor is launched from the
  // Dock/Finder (launchd), it does NOT inherit the login-shell / direnv env — tokens
  // resolve empty and MCP calls fail with auth errors.
  advisories.push({
    id: "cursor-gui-isolation",
    severity: "advisory",
    detect:
      "Cursor's MCP token placeholders (${BKIT_GH_TOKEN}, …) resolve from process.env. " +
      "Dock/Finder-launched Cursor does not inherit the login-shell / direnv env.",
    action:
      "[cursor] Use `bkit cursor` to launch Cursor — it execs the binary directly with " +
      ".bkit/.env merged into the environment so MCP tokens resolve correctly. " +
      "Quit Cursor first (a running instance will not see the new env). " +
      'Alternative: `launchctl setenv BKIT_GH_TOKEN "$BKIT_GH_TOKEN"` (session-scoped; must re-run after reboot) ' +
      "then relaunch from Dock.",
  });

  // Generated copy-paste-ready Cursor Background Agents setup doc — `.cursor/cloud.md`.
  // Twin of `.claude/cloud.md` (runClaudeModule): UNTRACKED + gitignored, inlines REAL
  // secret values resolved from `.envrc` under the Cursor env-var policy (Linear tracker
  // adds BKIT_LINEAR_API_KEY, no autocompact knob). Never enters ws.writes / canonicalHashes /
  // `bkit check` drift — values are machine-local and expected to differ. Skipped on
  // dry-run (`bkit check`) so a read-only check never writes secrets. Upgrade regenerates
  // it via the same helper (see runUpgrade caller).
  if (!dryRun && writeCursorCloudDoc(process.cwd(), tokens, issueTracker)) {
    console.log(
      `${logPrefix} ${tag}cursor: .cursor/cloud.md (generated — gitignored, holds resolved secrets)`,
    );
  }
}
