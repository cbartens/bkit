/**
 * bkit-roadmap-sync.integration.test.ts — #380 Sub-plan 2 Task 11, matrix
 * row 15.
 *
 * Boundary: real workflow source (`bkit-ship.md`) resolved through the REAL
 * #202 tracker-marker resolver (`substituteWorkflow`) — the same mechanism
 * `bkit install` uses to render host mirrors — never a string-presence check
 * on the raw, unresolved source. The candidate-discovery shell fragment is
 * additionally extracted (never hand-copied) and EXECUTED for real against a
 * fixture ledger with multiple FIDs at differing statuses, a real git repo,
 * and status.jsonl logs living in a different month than the current ship —
 * asserting on BEHAVIOUR, not shape (remediate-2-2: attempt-2-verify Gap 1).
 */

import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { substituteWorkflow } from "./bkit-trackers.js";

const REPO_ROOT = path.resolve(import.meta.dirname, "..", "..");
const SHIP = fs.readFileSync(path.join(REPO_ROOT, ".bkit", "workflows", "bkit-ship.md"), "utf-8");

/** Slice of Step 10 item 3 covering ONLY the reverse tracker-label sync (both
 * the deterministic shell candidate-discovery AND the orchestrator-mediated
 * per-tracker write prose that follows it), never the cadence or drift-check
 * neighbours. */
function reverseSyncSlice(output: string): string {
  const start = output.indexOf("Reverse tracker-label sync");
  const end = output.indexOf("4. Launch three subagents");
  expect(start, "Reverse tracker-label sync section not found").toBeGreaterThanOrEqual(0);
  expect(end, "end-of-section anchor not found").toBeGreaterThan(start);
  return output.slice(start, end);
}

describe("row 15: reverse tracker-label sync — MCP-only, no-op under none, settled-drift-guarded (#380)", () => {
  it("github/linear resolutions invoke an update_issue call, never gh/search_issues", () => {
    const github = substituteWorkflow(SHIP, "github");
    const linear = substituteWorkflow(SHIP, "linear");
    expect(github.orphans, "github resolution left orphan tracker markers").toEqual([]);
    expect(linear.orphans, "linear resolution left orphan tracker markers").toEqual([]);

    // Real MCP tool names per bkit-ship.md's own header (line ~37/44) and the
    // rest of the repo (issue_write/save_issue, never update_issue).
    expect(github.output).toMatch(/mcp__github__issue_write\(\{\s*method:\s*"update"/);
    expect(linear.output).toMatch(/mcp__linear__save_issue\(\{/);
    expect(github.output).not.toMatch(/mcp__github__update_issue/);
    expect(linear.output).not.toMatch(/mcp__linear__update_issue/);
    // Never an ACTUAL gh CLI / search_issues invocation for this reverse-sync
    // write (prose explaining the rule, e.g. "never gh/search_issues", is
    // expected and must not false-positive this assertion).
    const reverseSyncGithub = reverseSyncSlice(github.output);
    expect(reverseSyncGithub).not.toMatch(/search_issues\(/);
    expect(reverseSyncGithub).not.toMatch(/`gh /);
  });

  it("is a no-op under tracker: none", () => {
    const none = substituteWorkflow(SHIP, "none");
    expect(none.orphans, "none resolution left orphan tracker markers").toEqual([]);
    expect(none.output).toMatch(/reverse-sync no-op — tracker: none/);
    expect(none.output).not.toMatch(/issue_write/);
    expect(none.output).not.toMatch(/save_issue/);
  });

  it("encodes the settled-vs-transitioning predicate: no live feat/{FID} branch AND no in-flight phase event", () => {
    const github = substituteWorkflow(SHIP, "github");
    const reverseSyncGithub = reverseSyncSlice(github.output);
    // Live-branch guard (skips if a feat/{FID} branch is live, locally or
    // remotely) — remote check is a SINGLE bounded `ls-remote --heads`
    // (matched per FID in-memory), never one `ls-remote` invocation PER FID
    // (attempt-3-verify Gap 2: 50+ network round trips per ship).
    expect(reverseSyncGithub).toMatch(/show-ref --verify --quiet "refs\/heads\/feat\/\$RS_FID"/);
    expect(reverseSyncGithub).toMatch(
      /RS_REMOTE_HEADS=\$\(git -C "\$BOOK_ROOT" ls-remote --heads origin/,
    );
    expect(reverseSyncGithub).toMatch(
      /printf '%s\\n' "\$RS_REMOTE_HEADS" \| grep -q "refs\/heads\/feat\/\$RS_FID\\\$"/,
    );
    // Never a per-FID remote round trip inside the loop body.
    expect(reverseSyncGithub).not.toMatch(/ls-remote --exit-code --heads origin "feat\/\$RS_FID"/);
    // In-flight status.jsonl phase-event guard (workflow-started with no close-workflow yet).
    expect(reverseSyncGithub).toMatch(/workflow-started/);
    expect(reverseSyncGithub).toMatch(/close-workflow\$/);
    // The in-flight guard must be MONTH-AGNOSTIC (a glob over every
    // docs/plans/*/logs/{FID}/, never a hardcoded {YYYYMM} — a settled FID's
    // plan month can differ from the CURRENT ship's) — attempt-2-verify Gap 2.
    expect(reverseSyncGithub).toMatch(/docs\/plans\/\*\/logs\/"\$RS_FID"\/status\.jsonl/);
    expect(reverseSyncGithub).not.toMatch(/docs\/plans\/\{YYYYMM\}\/logs\/\$RS_FID\/status\.jsonl/);
  });

  it("terminal-aware phase mapping: SHIPPED maps to bkit:merged, never bkit:ship, so it cannot oscillate against Step 13", () => {
    const github = substituteWorkflow(SHIP, "github");
    const reverseSyncGithub = reverseSyncSlice(github.output);
    expect(reverseSyncGithub).toMatch(
      /\{DESIGNED:"design",PLANNED:"plan",BUILT:"build",SHIPPED:"merged"\}/,
    );
    expect(reverseSyncGithub).not.toMatch(/SHIPPED:"ship"/);
  });

  it("DEBUGGED is excluded from the phase-replacement map — bkit:debug is additive, never a phase replacement (attempt-3-verify Gap 1)", () => {
    const github = substituteWorkflow(SHIP, "github");
    const reverseSyncGithub = reverseSyncSlice(github.output);
    // The phase-replacement map must NOT contain a DEBUGGED entry: mapping
    // DEBUGGED -> bkit:debug here would make the per-candidate
    // "drop-old-phase-label, add {RS.label}" write collapse an existing
    // {bkit:build, bkit:debug} pair down to just {bkit:debug} — destroying
    // the real (non-additive) phase label for a settled DEBUGGED FID.
    expect(reverseSyncGithub).not.toMatch(/DEBUGGED:"debug"/);
    expect(reverseSyncGithub).not.toMatch(/DEBUGGED:\s*"[a-z]+"/);
  });

  it("resolves the tracker id + bkit:{phase} label from the settled-candidate JSON — never a literal ellipsis", () => {
    const github = substituteWorkflow(SHIP, "github");
    const reverseSyncGithub = reverseSyncSlice(github.output);
    // The candidate discovery derives a concrete tracker id + label, never a
    // bare "[...]" ellipsis placeholder with no mapping.
    expect(reverseSyncGithub).not.toMatch(/labels:\s*\[\.\.\.\]/);
    expect(reverseSyncGithub).toMatch(/githubIssueNumber/);
    expect(reverseSyncGithub).toMatch(/linearIssueId/);
    // The per-candidate write resolves issue_number from the candidate JSON,
    // never a bare "<resolved from ...>" placeholder with no mechanism.
    expect(reverseSyncGithub).not.toMatch(/<resolved from/);
    expect(reverseSyncGithub).toMatch(/issue_number:\s*\{RS\.githubIssueNumber\}/);
  });

  it("reconciles DRIFT, never an unconditional write: reads current labels, computes the full replacement set, skips when already in sync (attempt-2-verify Gap 1)", () => {
    const github = substituteWorkflow(SHIP, "github");
    const linear = substituteWorkflow(SHIP, "linear");
    const reverseSyncGithub = reverseSyncSlice(github.output);
    const reverseSyncLinear = reverseSyncSlice(linear.output);

    // The destructive single-element replace-semantics write must be GONE —
    // this is the exact literal the blocking defect shipped.
    expect(reverseSyncGithub).not.toMatch(/labels:\s*\[\{RS\.label\}\]/);
    expect(reverseSyncLinear).not.toMatch(/labels:\s*\[\{RS\.label\}\]/);

    // A read of the issue's CURRENT labels must precede the write.
    expect(reverseSyncGithub).toMatch(/mcp__github__issue_read\(\{\s*method:\s*"get"/);
    expect(reverseSyncLinear).toMatch(/mcp__linear__get_issue\(\{/);
    expect(reverseSyncGithub).toMatch(/\{RS_CURRENT_LABELS\}/);
    expect(reverseSyncLinear).toMatch(/\{RS_CURRENT_LABELS\}/);

    // The full replacement set is computed locally (read-modify-write, same
    // convention as the `:268`/`:1389` writes) and used in the write call —
    // never the bare single-element array.
    expect(reverseSyncGithub).toMatch(/\{RS_NEW_LABELS\}/);
    expect(reverseSyncGithub).toMatch(/labels:\s*\[\{RS_NEW_LABELS\}\]/);
    expect(reverseSyncLinear).toMatch(/labels:\s*\[\{RS_NEW_LABELS\}\]/);
    // Additive labels are explicitly named as preserved.
    expect(reverseSyncGithub).toMatch(/bkit:auto/);
    expect(reverseSyncGithub).toMatch(/blocker/);

    // Drift comparison: no-op when the computed set already matches — this is
    // what turns "every FID, every ship" into "only settled DRIFT".
    expect(reverseSyncGithub).toMatch(/already in sync/);
    expect(reverseSyncLinear).toMatch(/already in sync/);
  });

  it("is wrapped so it never gates the close — every branch is a continue/echo, not an exit", () => {
    const github = substituteWorkflow(SHIP, "github");
    const reverseSyncGithub = reverseSyncSlice(github.output);
    expect(reverseSyncGithub).not.toMatch(/\bexit\s+[1-9]/);
  });
});

/**
 * Extract the fenced shell fragment whose FIRST line contains `startNeedle`,
 * from the real shipped bkit-ship.md — never a hand-copied duplicate.
 */
function extractFencedBlock(source: string, startNeedle: string): string {
  const idx = source.indexOf(startNeedle);
  expect(idx, `startNeedle not found in bkit-ship.md: ${startNeedle}`).toBeGreaterThanOrEqual(0);
  const fenceStart = source.lastIndexOf("```bash", idx);
  const fenceEnd = source.indexOf("```", fenceStart + 6);
  return source.slice(fenceStart + "```bash".length, fenceEnd);
}

/** Isolate the candidate-discovery loop from the full Step-10-item-3 fence
 * (which also carries the cadence + drift-check fragments this test doesn't
 * exercise). */
function reverseSyncShellBlock(): string {
  const fullFence = extractFencedBlock(SHIP, "ROADMAP_JSONL=");
  const rsStart = fullFence.indexOf("# Reverse tracker-label sync");
  expect(rsStart, "reverse-sync comment header not found in Step 10 fence").toBeGreaterThanOrEqual(
    0,
  );
  const rsEnd = fullFence.indexOf("# Drift check", rsStart);
  expect(rsEnd, "drift-check comment header not found after reverse-sync").toBeGreaterThan(rsStart);
  return fullFence.slice(rsStart, rsEnd);
}

describe("row 15 (behavioural): candidate discovery over a real fixture ledger", () => {
  it("settles/skips FIDs correctly: live branch skipped, in-flight skipped, month-agnostic settled FIDs included with terminal-aware labels", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "bkit-roadmap-sync-"));
    try {
      // Real git repo — the show-ref/ls-remote live-branch guard needs a
      // real .git, not a mock.
      execSync("git init -q -b main", { cwd: tmpDir });
      execSync("git -c user.email=t@t -c user.name=t commit -q --allow-empty -m init", {
        cwd: tmpDir,
      });
      // 300-gamma has a LIVE local feat/* branch — must be skipped.
      execSync("git branch feat/300-gamma", { cwd: tmpDir });

      // Fixture ledger: 4 distinct FIDs at differing statuses.
      const roadmapJsonl = [
        { kind: "feature", key: "101-alpha", status: "BUILT", ts: 1000 },
        { kind: "feature", key: "205-beta", status: "SHIPPED", ts: 2000 },
        { kind: "feature", key: "300-gamma", status: "BUILT", ts: 3000 },
        { kind: "feature", key: "TEAM-42-delta", status: "SHIPPED", ts: 4000 },
        { kind: "feature", key: "410-epsilon", status: "DEBUGGED", ts: 5000 },
      ]
        .map((r) => JSON.stringify(r))
        .join("\n");
      fs.mkdirSync(path.join(tmpDir, "docs"), { recursive: true });
      fs.writeFileSync(path.join(tmpDir, "docs", "roadmap.jsonl"), roadmapJsonl + "\n");

      // 205-beta: settled, COMPLETED workflow, plan month DIFFERENT from the
      // "current" ship (which would be e.g. 202607) — proves the glob is
      // month-agnostic (attempt-2-verify Gap 2).
      const betaLogDir = path.join(tmpDir, "docs", "plans", "202601", "logs", "205-beta");
      fs.mkdirSync(betaLogDir, { recursive: true });
      fs.writeFileSync(
        path.join(betaLogDir, "status.jsonl"),
        [
          JSON.stringify({ type: "workflow-started", ts: 1 }),
          JSON.stringify({ type: "step-done", step: "ship-close-workflow", ts: 2 }),
        ].join("\n") + "\n",
      );

      // TEAM-42-delta: SHIPPED in the ledger but STILL in-flight (no
      // close-workflow row yet) — must be skipped despite SHIPPED status.
      const deltaLogDir = path.join(tmpDir, "docs", "plans", "202607", "logs", "TEAM-42-delta");
      fs.mkdirSync(deltaLogDir, { recursive: true });
      fs.writeFileSync(
        path.join(deltaLogDir, "status.jsonl"),
        JSON.stringify({ type: "workflow-started", ts: 1 }) + "\n",
      );

      // 410-epsilon: settled (COMPLETED workflow), status DEBUGGED — must be
      // excluded from candidates entirely (unmapped, same path as
      // ABANDONED), NEVER resolve to a phase-replacement label — proves the
      // DEBUGGED/additive-collapse fix for real (attempt-3-verify Gap 1).
      const epsilonLogDir = path.join(tmpDir, "docs", "plans", "202607", "logs", "410-epsilon");
      fs.mkdirSync(epsilonLogDir, { recursive: true });
      fs.writeFileSync(
        path.join(epsilonLogDir, "status.jsonl"),
        [
          JSON.stringify({ type: "workflow-started", ts: 1 }),
          JSON.stringify({ type: "step-done", step: "debug-close-workflow", ts: 2 }),
        ].join("\n") + "\n",
      );

      fs.mkdirSync(path.join(tmpDir, ".bkit"), { recursive: true });

      const rsBlock = reverseSyncShellBlock().replace(
        "$BOOK_ROOT/.bkit/.roadmap-reverse-sync-{FID}.json",
        path.join(tmpDir, ".bkit", "roadmap-reverse-sync.json"),
      );

      const script = [
        "set -eu",
        `BOOK_ROOT="${tmpDir}"`,
        `ROADMAP_JSONL="${path.join(tmpDir, "docs", "roadmap.jsonl")}"`,
        rsBlock.trim(),
      ].join("\n");

      execSync(script, { shell: "/bin/bash", cwd: tmpDir });

      const candidatesRaw = fs.readFileSync(
        path.join(tmpDir, ".bkit", "roadmap-reverse-sync.json"),
        "utf-8",
      );
      const candidates: Array<{
        fid: string;
        phase: string;
        label: string;
        githubIssueNumber?: string;
        linearIssueId?: string;
      }> = JSON.parse(candidatesRaw);
      const byFid = Object.fromEntries(candidates.map((c) => [c.fid, c]));

      // Settled, non-terminal: BUILT -> bkit:build.
      expect(byFid["101-alpha"]).toBeTruthy();
      expect(byFid["101-alpha"].label).toBe("bkit:build");
      expect(byFid["101-alpha"].githubIssueNumber).toBe("101");

      // Settled, TERMINAL: SHIPPED -> bkit:merged (never bkit:ship), and
      // resolved despite the status.jsonl living in a DIFFERENT month than
      // any hardcoded {YYYYMM} — proves the glob fix for Gap 2.
      expect(byFid["205-beta"]).toBeTruthy();
      expect(byFid["205-beta"].label).toBe("bkit:merged");

      // Live feat/* branch -> excluded entirely (actively transitioning).
      expect(byFid["300-gamma"]).toBeUndefined();

      // In-flight status.jsonl (no close-workflow yet) -> excluded despite
      // SHIPPED status in the ledger.
      expect(byFid["TEAM-42-delta"]).toBeUndefined();

      // Settled, DEBUGGED -> excluded entirely (unmapped): bkit:debug is
      // additive, never a phase-replacement label, so DEBUGGED must NEVER
      // appear as a candidate here (real-execution proof for the
      // attempt-3-verify Gap 1 fix — this is the exact mutation that used
      // to collapse {bkit:build, bkit:debug} down to {bkit:debug}).
      expect(byFid["410-epsilon"]).toBeUndefined();

      expect(candidates.length).toBe(2);
    } finally {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
  });
});
