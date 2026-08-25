// bkit-auto-fid-guard.test.ts — #341 build-challenge F4 remediation.
//
// bkit-auto step 9 resolves {FID} PRIMARILY from the PR-body marker
// (`<!-- bkit:fid={FID} -->`, D9 marker-primary reorder). The PR body is
// collaborator-trusted, not commit-signed (docs/security.md § CI Auto-Route
// Trust), and {FID} flows straight into filesystem paths
// (docs/plans/{YYYYMM}/logs/{FID}/…, .worktrees/{FID}) and downstream
// /bkit-* dispatch. Without a slug allowlist a marker like
// `bkit:fid=../../elsewhere` redirects writes outside the log directory.
//
// This audit proves BOTH halves of the fix:
//   (i)  the slug-allowlist assertion is PRESENT at every FID exit point in
//        bkit-auto.md (three step-9 tracker blocks + the step-10
//        branch-derive fallback), and
//   (ii) each allowlist regex actually REJECTS path-traversal / shell-
//        metacharacter FIDs and ACCEPTS the well-formed FID its variant mints.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

const REPO_ROOT = path.resolve(__dirname, "../..");
const AUTO = fs.readFileSync(path.resolve(REPO_ROOT, ".bkit/workflows/bkit-auto.md"), "utf-8");

// The three canonical allowlists bkit-auto enforces, keyed to the tracker
// variant that renders. Kept verbatim in sync with the assertions in
// bkit-auto.md and the sibling phase workflows (bkit-{design,plan,build,
// debug,ship}.md) — a drift here means the guard weakened.
const GUARDS = {
  github: /^[0-9]+-[a-z0-9-]+$/,
  linear: /^[a-z]+-[0-9]+-[a-z0-9-]+$/,
  safe: /^[a-z0-9][a-z0-9-]*$/, // no-tracker marker + branch-derive fallback
} as const;

// Attack vectors every allowlist MUST reject — path traversal, absolute
// paths, nested writes, and shell metacharacters reachable from an
// attacker-edited PR-body marker.
const MALICIOUS_FIDS = [
  "../../elsewhere",
  "..",
  "../341-three-runtimes",
  "341-three-runtimes/../../etc",
  "a/b",
  "/etc/passwd",
  "341;rm -rf /",
  "$(whoami)",
  "`id`",
  "341 three",
  "341-three-runtimes\n../evil",
] as const;

describe("bkit-auto FID slug guard (#341 F4 — path-traversal rejection)", () => {
  describe("(i) the allowlist assertion is present at every FID exit point", () => {
    it("step 9 github block asserts the canonical github slug", () => {
      expect(AUTO).toContain('[[ "{FID}" =~ ^[0-9]+-[a-z0-9-]+$ ]]');
    });
    it("step 9 linear block asserts the canonical linear slug", () => {
      expect(AUTO).toContain('[[ "{FID}" =~ ^[a-z]+-[0-9]+-[a-z0-9-]+$ ]]');
    });
    it("step 9 no-tracker block + step 10 branch-derive assert the safe slug", () => {
      // Two distinct occurrences: the false-tracker marker block and the
      // branch-derive fallback both use the permissive-but-safe slug.
      const occurrences = (AUTO.match(/\[\[ "\{FID\}" =~ \^\[a-z0-9\]\[a-z0-9-\]\*\$ \]\]/g) ?? [])
        .length;
      expect(occurrences).toBeGreaterThanOrEqual(2);
    });
  });

  describe("(ii) each allowlist rejects traversal/injection and accepts its valid FID", () => {
    for (const [variant, re] of Object.entries(GUARDS)) {
      for (const evil of MALICIOUS_FIDS) {
        it(`${variant} rejects ${JSON.stringify(evil)}`, () => {
          expect(re.test(evil)).toBe(false);
        });
      }
    }

    it("github accepts a well-formed numeric-issue FID", () => {
      expect(GUARDS.github.test("341-three-runtimes")).toBe(true);
    });
    it("linear accepts a well-formed alpha-prefixed FID", () => {
      expect(GUARDS.linear.test("bar-341-three-runtimes")).toBe(true);
    });
    it("safe accepts a well-formed branch-derived FID", () => {
      expect(GUARDS.safe.test("341-three-runtimes")).toBe(true);
      expect(GUARDS.safe.test("my-feature-branch")).toBe(true);
    });
  });
});
