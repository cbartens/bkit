/**
 * bkit-status-fold.test.ts — #58 T1.1/T1.3
 *
 * Asserts the status.jsonl fold reducer is single-sourced:
 *   (a) zero inline `FOLD='def lastIdx...` assignments remain in any
 *       `.bkit/workflows/*.md`.
 *   (b) the shipped script's extracted `BKIT_STATUS_FOLD` blob length and md5
 *       equal the figures T1.1 MEASURED from the tree (1078 bytes /
 *       ed1c4a236d35499f39033206d5b75480) — NOT the issue's inherited,
 *       unreconciled `1079` / `d04a2499ad1900d9757b00774dd87866`.
 *   (c) every workflow that references `$BKIT_STATUS_FOLD` also sources
 *       `bkit-status-fold.sh`.
 *   (d) every source site is fail-closed (carries the `|| { ... exit 2; }`
 *       guard).
 */

import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const TEMPLATE_SCRIPTS = path.join(REPO_ROOT, ".bkit/templates/.bkit/scripts");
const FOLD_SH_PATH = path.join(TEMPLATE_SCRIPTS, "bkit-status-fold.sh");

const WORKFLOW_FILES = [
  ".bkit/workflows/bkit-build.md",
  ".bkit/workflows/bkit-debug.md",
  ".bkit/workflows/bkit-plan.md",
  ".bkit/workflows/bkit-design.md",
  ".bkit/workflows/bkit-ship.md",
];

// Figures MEASURED at T1.1 against the tree — NOT the issue's inherited
// 1079 / d04a2499ad1900d9757b00774dd87866, which could not be reconciled to
// any measured slice (value / bare assignment token / whole indented line).
const MEASURED_BYTES = 1078;
const MEASURED_MD5 = "ed1c4a236d35499f39033206d5b75480";

function readWorkflow(rel: string): string {
  const p = path.join(REPO_ROOT, rel);
  return fs.existsSync(p) ? fs.readFileSync(p, "utf-8") : "";
}

describe("#58 T1.1/T1.3: bkit-status-fold.sh is single-sourced", () => {
  it("no inline FOLD='def lastIdx... assignment remains in any workflow", () => {
    for (const wf of WORKFLOW_FILES) {
      const content = readWorkflow(wf);
      expect(content, `${wf} should not be empty`).not.toBe("");
      expect(
        content.includes("FOLD='def lastIdx"),
        `${wf} still has an inline FOLD assignment`,
      ).toBe(false);
    }
  });

  it("bkit-status-fold.sh exists and defines BKIT_STATUS_FOLD", () => {
    expect(fs.existsSync(FOLD_SH_PATH)).toBe(true);
    const content = fs.readFileSync(FOLD_SH_PATH, "utf-8");
    expect(content).toMatch(/^BKIT_STATUS_FOLD=/m);
  });

  it("extracted BKIT_STATUS_FOLD blob length/md5 equal T1.1's MEASURED figures (not the issue's inherited ones)", () => {
    const out = execSync(`sh -c '. "${FOLD_SH_PATH}"; printf "%s" "$BKIT_STATUS_FOLD"'`, {
      encoding: "utf-8",
    });
    expect(Buffer.byteLength(out, "utf-8")).toBe(MEASURED_BYTES);
    // Hash in-process rather than shelling out to `md5` (BSD/macOS-only — Linux
    // CI has `md5sum`, so the pipe `| md5` failed there while passing locally on
    // macOS). `out` is the exact byte string the shell pipe would have hashed,
    // so createHash("md5") over it yields the same digest on every platform.
    const md5 = createHash("md5").update(out, "utf-8").digest("hex");
    expect(md5).toBe(MEASURED_MD5);
  });

  // NOTE: A former test here cross-checked the extracted value against the
  // inline `FOLD='def lastIdx...'` blob read from `git show dev:...bkit-build.md`.
  // That was a one-time TRANSITION check: it only held while T1.2 sat on a
  // feature branch and `dev` still carried the inline assignment. Once #58 (T1.2)
  // merged into dev, `dev:bkit-build.md` IS the converted file with no inline
  // blob, so the cross-check could never pass again (self-invalidating). The
  // value it guarded is already durably pinned by the length/md5 assertion above
  // (whose md5 was itself measured from that exact blob at T1.1), so it was
  // removed rather than salvaged via fragile git archaeology.

  it("every workflow referencing $BKIT_STATUS_FOLD also sources bkit-status-fold.sh", () => {
    for (const wf of WORKFLOW_FILES) {
      const content = readWorkflow(wf);
      if (!content) continue;
      const usesFold = content.includes("$BKIT_STATUS_FOLD");
      const sourcesFold = content.includes("bkit-status-fold.sh");
      if (usesFold) {
        expect(
          sourcesFold,
          `${wf} uses $BKIT_STATUS_FOLD but never sources bkit-status-fold.sh`,
        ).toBe(true);
      }
    }
  });

  it("every source site is fail-closed (carries the || { ... exit 2; } guard)", () => {
    for (const wf of WORKFLOW_FILES) {
      const content = readWorkflow(wf);
      if (!content) continue;
      const sourceLines = content
        .split("\n")
        .filter((l) => l.includes("bkit-status-fold.sh") && l.trim().startsWith("."));
      for (const line of sourceLines) {
        expect(line, `${wf}: source line missing fail-closed guard: ${line}`).toMatch(
          /\|\|\s*\{[^}]*exit 2;\s*\}/,
        );
        expect(line).toContain("[bkit-telemetry]");
      }
    }
  });
});
