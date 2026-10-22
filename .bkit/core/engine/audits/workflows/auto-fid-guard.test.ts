// audits/workflows/auto-fid-guard.test.ts — every FID entry point in bkit-auto.md goes through a
// bkit command, and the FID allowlists reject traversal and injection.

import * as fs from "node:fs";
import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { FID_PATTERNS, ISSUE_LESS_FID, fromBranch, fromMarker } from "../../commands/workflow/fids";
import { getWorkflowsRoot } from "../../shared/package-roots";

// ---------------------------------------------------------------------------
// auto-fid-guard
// ---------------------------------------------------------------------------
// auto-fid-guard — FID slug allowlist.
//
// bkit-auto resolves {FID} PRIMARILY from the PR-body marker (`<!-- bkit:fid={FID} -->`).
// The PR body is collaborator-trusted, not commit-signed (docs/security.md § CI Auto-Route
// Trust), and {FID} flows into filesystem paths (docs/plans/{YYYYMM}/logs/{FID}/…,
// .worktrees/{FID}) and downstream /bkit-* dispatch.
//
// The allowlists live in `bkit fids` (commands/workflow/fids.ts). This audit asserts BOTH
// halves of the guard:
//   (i)  every FID entry point in bkit-auto.md goes through a command — `bkit runs
//        context`, which checks a CI_DEV argument against the `any` allowlist and
//        recovers a PR's FID through the same `fromMarker` / `fromBranch` as `bkit fids
//        parse` (its refusals are pinned in runs.test.ts) — and no block recovers a
//        FID from the marker by hand;
//   (ii) the command's allowlists actually REJECT path-traversal / shell-
//        metacharacter FIDs (including inside a PR-body marker) and ACCEPT
//        the well-formed FID each tracker mints.
describe("auto-fid-guard", () => {
  const AUTO = fs.readFileSync(path.join(getWorkflowsRoot(), "bkit-auto.md"), "utf-8");

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
    describe("(i) every FID entry point goes through a bkit command", () => {
      it("phase, CI_DEV slug check and PR FID recovery all run in `bkit runs context`", () => {
        const block = BASH_BLOCKS.find((b) => b.includes("runs context"));
        expect(block, "the runs context block").toBeDefined();
        expect(block).toMatch(/"\{BKIT\}" runs context --phase="\{PHASE\}" --arg="\{ARG\}"/);
        expect(AUTO).toContain("`fid` as `{FID}`");
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
          expect(fromMarker(`<!-- bkit:issue=AB1-1 bkit:fid=${evil} -->`, "jira")).toBeNull();
          expect(fromMarker(`<!-- bkit:fid=${evil} -->`, "none")).toBeNull();
          expect(fromBranch(`feat/${evil}`, "none").ok).toBe(false);
        }
      });

      it("a traversal FID through the issue-less fallbacks is refused under every wired tracker", () => {
        for (const evil of MALICIOUS_FIDS) {
          expect(ISSUE_LESS_FID.test(evil)).toBe(false);
          for (const tracker of ["github", "linear", "jira"] as const) {
            expect(fromMarker(`<!-- bkit:fid=${evil} -->`, tracker)).toBeNull();
            expect(fromBranch(`feat/${evil}`, tracker).ok).toBe(false);
          }
        }
      });

      it("an issue-less FID resolves no issue, so /bkit-auto has nothing to dispatch on", () => {
        for (const tracker of ["github", "linear", "jira"] as const) {
          expect(fromMarker("<!-- bkit:fid=dev-ci-failures -->", tracker)?.issueId).toBeNull();
          const viaBranch = fromBranch("feat/dev-ci-failures", tracker);
          expect(viaBranch).toMatchObject({ ok: true, parsed: { issueId: null } });
        }
      });

      it("no FID allowlist (CI_DEV included) admits an issue-less FID", () => {
        for (const fid of ["dev-ci-failures", "fix-the-build"]) {
          expect(FID_PATTERNS.any.test(fid)).toBe(false);
          expect(FID_PATTERNS.github.test(fid)).toBe(false);
          expect(FID_PATTERNS.linear.test(fid)).toBe(false);
          expect(FID_PATTERNS.jira.test(fid)).toBe(false);
        }
      });

      it("github accepts a well-formed numeric-issue FID", () => {
        expect(FID_PATTERNS.github.test("341-three-runtimes")).toBe(true);
      });
      it("linear accepts a well-formed alpha-prefixed FID", () => {
        expect(FID_PATTERNS.linear.test("bar-341-three-runtimes")).toBe(true);
      });
      it("jira accepts a well-formed project-key FID, digits in the key included", () => {
        expect(FID_PATTERNS.jira.test("bar-341-three-runtimes")).toBe(true);
        expect(FID_PATTERNS.jira.test("ab1-341-three-runtimes")).toBe(true);
      });
      it("none accepts a well-formed branch-derived FID", () => {
        expect(FID_PATTERNS.none.test("341-three-runtimes")).toBe(true);
        expect(FID_PATTERNS.none.test("my-feature-branch")).toBe(true);
      });
      it("any (CI_DEV) accepts every tracker shape", () => {
        expect(FID_PATTERNS.any.test("341-three-runtimes")).toBe(true);
        expect(FID_PATTERNS.any.test("bar-341-three-runtimes")).toBe(true);
        expect(FID_PATTERNS.any.test("ab1-341-three-runtimes")).toBe(true);
      });
    });
  });
});
