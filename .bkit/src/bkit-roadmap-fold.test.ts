/**
 * bkit-roadmap-fold.test.ts — #380 Sub-plan 1 Task 3, matrix row 7.
 *
 * Asserts:
 *   (a) the template copy exists and defines BKIT_ROADMAP_PROJECT.
 *   (b) it sources BKIT_STATUS_FOLD from bkit-status-fold.sh with the
 *       fail-closed `|| { ... exit 2; }` guard.
 *   (c) the installed repo copy (`.bkit/scripts/bkit-roadmap-fold.sh`)
 *       byte-matches the template, hashed IN-PROCESS via node:crypto
 *       createHash — NEVER a shell `md5` shell-out (the CLOSED
 *       `status-fold-test-md5-macos-only-fails-linux-ci` portability
 *       regression this deliberately avoids).
 */

import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const TEMPLATE_PATH = path.join(REPO_ROOT, ".bkit/templates/.bkit/scripts/bkit-roadmap-fold.sh");
const REPO_COPY_PATH = path.join(REPO_ROOT, ".bkit/scripts/bkit-roadmap-fold.sh");

function sha256(content: string): string {
  return createHash("sha256").update(content, "utf-8").digest("hex");
}

describe("#380 bkit-roadmap-fold.sh — template exists + defines the projection", () => {
  it("template copy exists and defines BKIT_ROADMAP_FOLD (human-confirmed Naming Review name)", () => {
    expect(fs.existsSync(TEMPLATE_PATH)).toBe(true);
    const content = fs.readFileSync(TEMPLATE_PATH, "utf-8");
    expect(content).toMatch(/^BKIT_ROADMAP_FOLD=/m);
    // GAP-3 regression guard: the plan's Naming Review names the exported
    // symbol BKIT_ROADMAP_FOLD (mirroring the BKIT_STATUS_FOLD precedent) —
    // never re-introduce the earlier BKIT_ROADMAP_PROJECT drift.
    expect(content).not.toMatch(/^BKIT_ROADMAP_PROJECT=/m);
  });

  it("sources BKIT_STATUS_FOLD from bkit-status-fold.sh with the fail-closed guard", () => {
    const content = fs.readFileSync(TEMPLATE_PATH, "utf-8");
    expect(content).toContain("bkit-status-fold.sh");
    const lines = content.split("\n");
    const sourceIdx = lines.findIndex(
      (l) => l.includes("bkit-status-fold.sh") && l.trim().startsWith("."),
    );
    expect(sourceIdx, "no `. .../bkit-status-fold.sh` source line found").toBeGreaterThanOrEqual(0);
    // The guard body may span multiple lines (`|| {` on the source line,
    // `return 2` + closing `}` below it) — check the small window, not one line.
    const window = lines.slice(sourceIdx, sourceIdx + 4).join("\n");
    expect(window).toMatch(/\|\|\s*\{[\s\S]*?return 2;?[\s\S]*?\}/);
    expect(window).toContain("[bkit-telemetry]");
  });

  it("defines the fail-open bkit_roadmap_fold entrypoint", () => {
    const content = fs.readFileSync(TEMPLATE_PATH, "utf-8");
    expect(content).toMatch(/^bkit_roadmap_fold\(\)\s*\{/m);
  });

  // The status block is a pure projection of docs/roadmap.jsonl now that
  // tracker rows render in their own marker block, so a phase close re-renders
  // it instead of parsing the on-disk board back to preserve foreign rows.
  // `bkit_roadmap_upsert` and the board parser it needed are both gone.
  it("defines no board-parsing upsert path — the fold is the only entrypoint", () => {
    const content = fs.readFileSync(TEMPLATE_PATH, "utf-8");
    expect(content).not.toMatch(/bkit_roadmap_upsert/);
    expect(content).not.toMatch(/_bkit_roadmap_parse_status/);
  });

  it("renders the tracker block from docs/tracker.jsonl with an Other catch-all", () => {
    const content = fs.readFileSync(TEMPLATE_PATH, "utf-8");
    expect(content).toMatch(/^_bkit_roadmap_render_tracker\(\)\s*\{/m);
    expect(content).toContain("docs/tracker.jsonl");
    expect(content).toContain("Other");
  });

  // Two blocks, two cadences: only /bkit-roadmap re-fetches the tracker, so a
  // phase close must carry the existing stamp forward rather than mint a new
  // one and claim freshness it does not have.
  it("stamps each block and gates the tracker stamp on an explicit refresh flag", () => {
    const content = fs.readFileSync(TEMPLATE_PATH, "utf-8");
    expect(content).toContain("BKIT_ROADMAP_TRACKER_REFRESHED");
    expect(content).toMatch(/_\(refreshed/);
  });

  // Three consumer-owned notes islands sit around the generated lists and are
  // carried through verbatim — never regenerated, never dropped on a fold.
  it("defines three notes marker pairs carried through the fold verbatim", () => {
    const content = fs.readFileSync(TEMPLATE_PATH, "utf-8");
    expect(content).toContain("<!-- bkit:roadmap-notes-pre start -->");
    expect(content).toContain("<!-- bkit:roadmap-notes-pre end -->");
    expect(content).toContain("<!-- bkit:roadmap-notes-mid start -->");
    expect(content).toContain("<!-- bkit:roadmap-notes-mid end -->");
    expect(content).toContain("<!-- bkit:roadmap-notes-post start -->");
    expect(content).toContain("<!-- bkit:roadmap-notes-post end -->");
    expect(content).toMatch(/never overwritten/);
    expect(content).toMatch(/notes-post is last/);
    expect(content).not.toMatch(/printf '## Backlog \/ Ideas/);
  });

  it("repo copy byte-matches the template (installed copy is not stale) — hashed via node:crypto, never a shell md5 shell-out", () => {
    expect(
      fs.existsSync(REPO_COPY_PATH),
      "installed .bkit/scripts/bkit-roadmap-fold.sh missing",
    ).toBe(true);
    const template = fs.readFileSync(TEMPLATE_PATH, "utf-8");
    const repoCopy = fs.readFileSync(REPO_COPY_PATH, "utf-8");
    expect(sha256(repoCopy)).toBe(sha256(template));
  });

  it("shell syntax is valid (sh -n)", () => {
    expect(() => execSync(`sh -n "${TEMPLATE_PATH}"`)).not.toThrow();
  });
});
