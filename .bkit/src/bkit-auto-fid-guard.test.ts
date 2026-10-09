// bkit-auto-fid-guard.test.ts — #341 build-challenge F4 remediation.
//
// bkit-auto resolves {FID} PRIMARILY from the PR-body marker
// (`<!-- bkit:fid={FID} -->`, D9 marker-primary reorder). The PR body is
// collaborator-trusted, not commit-signed (docs/security.md § CI Auto-Route
// Trust), and {FID} flows straight into filesystem paths
// (docs/plans/{YYYYMM}/logs/{FID}/…, .worktrees/{FID}) and downstream
// /bkit-* dispatch. Without a slug allowlist a marker like
// `bkit:fid=../../elsewhere` redirects writes outside the log directory.
//
// The allowlist lives in `bkit fids` (commands/workflow/fids.ts). This audit
// proves BOTH halves of the guard:
//   (i)  every FID entry point in bkit-auto.md goes through the command — the
//        CI_DEV argument through `bkit fids check --tracker=any`, the PR-body
//        marker and branch fallback through `bkit fids parse` — and no block
//        recovers a FID from the marker by hand;
//   (ii) the command's allowlists actually REJECT path-traversal / shell-
//        metacharacter FIDs (including inside a PR-body marker) and ACCEPT
//        the well-formed FID each tracker mints.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";

import { FID_PATTERNS, fromBranch, fromMarker } from "./commands/workflow/fids";

const REPO_ROOT = path.resolve(__dirname, "../..");
const AUTO = fs.readFileSync(path.resolve(REPO_ROOT, ".bkit/workflows/bkit-auto.md"), "utf-8");

/** Every ```bash block body in bkit-auto.md. */
const BASH_BLOCKS = [...AUTO.matchAll(/```bash\n([\s\S]*?)```/g)].map((m) => m[1]!);

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
  describe("(i) every FID entry point goes through bkit fids", () => {
    it("the CI_DEV FID argument is checked by `bkit fids check --tracker=any` before use", () => {
      const block = BASH_BLOCKS.find((b) => b.includes("MODE=CI_DEV"));
      expect(block, "the CI / CI_DEV discrimination block").toBeDefined();
      const check = block!.indexOf('fids check --fid="$ARG" --tracker=any');
      expect(check).toBeGreaterThan(-1);
      // The check runs before the CI_DEV mode line is printed, and a failed
      // check exits the block (never falls through to CI_DEV).
      expect(check).toBeLessThan(block!.indexOf("MODE=CI_DEV"));
      expect(block!.slice(check).split("\n")[0]).toMatch(/\|\|\s*\{[^}]*exit 1;\s*\}/);
    });

    it("the PR-body marker and the branch fallback are resolved by `bkit fids parse`", () => {
      const block = BASH_BLOCKS.find((b) => b.includes("fids parse"));
      expect(block, "the FID recovery block").toBeDefined();
      expect(block).toMatch(/fids parse --marker="\$MARKER" --branch="\{BRANCH\}"/);
    });

    it("no bash block recovers a FID from the marker by hand (sed/grep/jq on bkit:fid=)", () => {
      for (const b of BASH_BLOCKS) expect(b).not.toMatch(/bkit:fid=/);
    });
  });

  describe("(ii) each allowlist rejects traversal/injection and accepts its valid FID", () => {
    for (const [tracker, re] of Object.entries(FID_PATTERNS)) {
      for (const evil of MALICIOUS_FIDS) {
        it(`${tracker} rejects ${JSON.stringify(evil)}`, () => {
          expect(re.test(evil)).toBe(false);
        });
      }
    }

    it("a traversal FID inside a PR-body marker is refused, never returned", () => {
      for (const evil of MALICIOUS_FIDS) {
        expect(fromMarker(`<!-- bkit:issue=#341 bkit:fid=${evil} -->`, "github")).toBeNull();
        expect(fromMarker(`<!-- bkit:issue=ABC-1 bkit:fid=${evil} -->`, "linear")).toBeNull();
        expect(fromMarker(`<!-- bkit:fid=${evil} -->`, "none")).toBeNull();
        expect(fromBranch(`feat/${evil}`, "none").ok).toBe(false);
      }
    });

    it("github accepts a well-formed numeric-issue FID", () => {
      expect(FID_PATTERNS.github.test("341-three-runtimes")).toBe(true);
    });
    it("linear accepts a well-formed alpha-prefixed FID", () => {
      expect(FID_PATTERNS.linear.test("bar-341-three-runtimes")).toBe(true);
    });
    it("none accepts a well-formed branch-derived FID", () => {
      expect(FID_PATTERNS.none.test("341-three-runtimes")).toBe(true);
      expect(FID_PATTERNS.none.test("my-feature-branch")).toBe(true);
    });
    it("any (CI_DEV) accepts both tracker shapes", () => {
      expect(FID_PATTERNS.any.test("341-three-runtimes")).toBe(true);
      expect(FID_PATTERNS.any.test("bar-341-three-runtimes")).toBe(true);
    });
  });
});
