Enforced: true
Gaps: 41

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/650-workflows-prompt-alone-plan-1.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 1 | `.bkit/core/engine/commands/workflow/fids.test.ts` "check --issue="" accepts dev-ci-failures under github" | recorded 2026-10-22T02:55:58Z | yes | passed |
| 1 | `.bkit/core/engine/commands/workflow/fids.test.ts` "check --issue="" rejects a FID with an all-digit word under every wired tracker" | recorded 2026-10-22T02:56:02Z | yes | passed |
| 1 | `.bkit/core/engine/commands/workflow/fids.test.ts` "fidProblem with --issue absent matches today" | recorded 2026-10-22T02:56:03Z | yes | passed |
| 1 | `.bkit/core/engine/commands/workflow/fids.test.ts` "check --tracker=any --issue="" applies the issue-less rule" | recorded 2026-10-22T02:56:04Z | yes | passed |
| 2 | `.bkit/core/engine/commands/workflow/fids.test.ts` "fromMarker returns issueId null for a FID-only marker under github" | recorded 2026-10-22T02:57:31Z | no | passed |
| 2 | `.bkit/core/engine/commands/workflow/fids.test.ts` "fromBranch returns issueId null for feat/dev-ci-failures under linear" | recorded 2026-10-22T02:57:31Z | no | passed |
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "runs context refuses an issue-less marker and branch naming the missing issue" | recorded 2026-10-22T02:57:53Z | yes | passed |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "gate --issue="" fails the fid check for 123-fix under github" | recorded 2026-10-22T03:00:06Z | yes | passed |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "gate --issue="" passes the fid check for dev-ci-failures under github" | recorded 2026-10-22T03:00:10Z | yes | passed |
| 4 | `.bkit/core/engine/commands/workflow/prs.test.ts` "prMarker writes a FID-only marker with github wired and no issue" | recorded 2026-10-22T03:03:56Z | no | passed |
| 4 | `.bkit/core/engine/commands/workflow/prs.test.ts` "prs open refuses --base=main" | recorded 2026-10-22T03:04:04Z | no | passed |
| 4 | `.bkit/core/engine/commands/workflow/prs.test.ts` "prs merge refuses a PR whose base is main" | recorded 2026-10-22T03:04:11Z | no | passed |
| 4 | `.bkit/core/engine/commands/workflow/prs.test.ts` "prs merge refuses when the PR base is unknown" | recorded 2026-10-22T03:04:19Z | no | passed |
| 4 | `.bkit/core/engine/commands/workflow/branches.test.ts` "landPr refuses a main-based PR without retrying" | recorded 2026-10-22T03:04:46Z | yes | passed |
| 4 | `.bkit/core/engine/commands/workflow/branches.test.ts` "landPr refuses when the PR base is unknown" | recorded 2026-10-22T03:05:13Z | yes | passed |
| 4 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "closePr refuses when the PR base is unknown" | recorded 2026-10-22T03:05:27Z | yes | passed |
| 4 | `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` "lands an issue-less run with a FID-only marker" | recorded 2026-10-22T03:05:36Z | yes | passed |
| 5 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "ship on dev refuses with the releases-stay-manual text" | recorded 2026-10-22T03:08:31Z | yes | passed |
| 5 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "ship names a missing feat branch" | recorded 2026-10-22T03:08:34Z | yes | passed |
| 5 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "build in place on main is refused" | recorded 2026-10-22T03:08:38Z | yes | passed |
| 5 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "design and plan in place on main are refused" | recorded 2026-10-22T03:08:41Z | yes | passed |
| 11 | `.bkit/core/engine/commands/workflow/steps.test.ts` "writeStepRow with a shared-checkout record never commits a recorded path" | missing | — | passed |
| 11 | `.bkit/core/engine/commands/workflow/steps.test.ts` "writeStepRow refuses when a recorded path changed" | missing | — | passed |
| 11 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "stageTrackedUpdates skips recorded paths" | missing | — | passed |
| 11 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "in-place debug on dev writes the shared-checkout record" | missing | — | passed |
| 11 | `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` "foreign staged and untracked files survive a run commit" | missing | — | passed |
| 11 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "in-place debug on dev returns startSha and aheadAtStart" | missing | — | passed |
| 11 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "a new run of the same FID rewrites startSha" | missing | — | passed |
| 11 | `.bkit/core/engine/commands/workflow/steps.test.ts` "writeStepRow appends its commit sha to the record" | missing | — | passed |
| 11 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a hook-refused own-path commit exits without staging a recorded path" | missing | — | passed |
| 11 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a recorded ledger commits only the rows the run appended" | missing | — | passed |
| 11 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "close with a shared-checkout record never commits a recorded path" | missing | — | passed |
| 11 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "record is present after workflows close and before the push" | missing | — | passed |
| 11 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "failed handover from dev removes the record and keeps recorded paths" | missing | — | passed |
| 11 | `.bkit/core/engine/commands/workflow/locks.test.ts` "locks release removes the FID shared-checkout record" | missing | — | passed |
| 11 | `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` "close commit tree excludes foreign files" | missing | — | passed |
| 11 | `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` "debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not" | missing | — | passed |
| 11 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock" | missing | — | passed |
| 11 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "a stale record without a lock is replaced" | missing | — | passed |
| 11 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "a resume of the same FID reuses the record" | missing | — | passed |
| 11 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "commitBookkeeping refuses when a recorded path changed" | missing | — | passed |
| 12 | `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` "push from an ahead local dev lands only the run commits" | recorded 2026-10-22T03:19:25Z | no | passed |
| 12 | `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` "push from a level local dev is a plain push" | recorded 2026-10-22T03:19:30Z | no | passed |
| 12 | `.bkit/core/engine/commands/land.test.ts` "pushToDev replays a commit range onto origin/dev" | recorded 2026-10-22T03:19:34Z | no | passed |
| 12 | `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` "a foreign commit made mid-run never reaches the remote" | recorded 2026-10-22T03:19:39Z | no | passed |
| 12 | `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` "feature-mode push on dev with a record never pushes the foreign commit" | recorded 2026-10-22T03:19:43Z | no | passed |
| 12 | `.bkit/core/engine/commands/workflow/branches.test.ts` "push after a replay reports the pushToDev sha not HEAD" | recorded 2026-10-22T03:20:27Z | yes | passed |
| 12 | `.bkit/core/engine/commands/land.test.ts` "pushToDev log line names what it lands" | recorded 2026-10-22T03:20:31Z | no | passed |
| 12 | `.bkit/core/engine/commands/workflow/branches.test.ts` "replay build callback cherry-picks exactly the recorded SHAs" | recorded 2026-10-22T03:21:01Z | yes | passed |
| 12 | `.bkit/core/engine/commands/workflow/branches.test.ts` "replay conflict exits non-zero naming the paths and removes the throwaway checkout" | recorded 2026-10-22T03:21:30Z | yes | passed |
| 12 | `.bkit/core/engine/commands/workflow/branches.test.ts` "a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal" | recorded 2026-10-22T03:26:00Z | yes | passed |
| 12 | `.bkit/core/engine/commands/workflow/branches.test.ts` "skip-ci HEAD on the replay is refused" | recorded 2026-10-22T03:23:00Z | yes | passed |
| 12 | `.bkit/core/engine/commands/workflow/branches.test.ts` "abort mode on dev with a record pushes only recorded SHAs" | recorded 2026-10-22T03:24:14Z | yes | passed |
| 13 | `.bkit/core/engine/commands/workflow/runs.test.ts` "dispatch on dev with a pushed sha and no pr proves the run started" | recorded 2026-10-22T03:32:20Z | no | passed |
| 13 | `.bkit/core/engine/commands/workflow/runs.test.ts` "re-trigger on dev with a record pushes through the own-commit push" | recorded 2026-10-22T03:32:42Z | no | passed |
| 13 | `.bkit/core/engine/commands/workflow/runs.test.ts` "re-trigger on dev with a record never commits a foreign staged path" | recorded 2026-10-22T03:33:04Z | no | passed |

## Gaps

- Task 1 `test-changed` — `.bkit/core/engine/commands/workflow/fids.test.ts` differs from its red snapshot for "check --issue="" accepts dev-ci-failures under github" (diff below)
- Task 1 `test-changed` — `.bkit/core/engine/commands/workflow/fids.test.ts` differs from its red snapshot for "check --issue="" rejects a FID with an all-digit word under every wired tracker" (diff below)
- Task 1 `test-changed` — `.bkit/core/engine/commands/workflow/fids.test.ts` differs from its red snapshot for "fidProblem with --issue absent matches today" (diff below)
- Task 1 `test-changed` — `.bkit/core/engine/commands/workflow/fids.test.ts` differs from its red snapshot for "check --tracker=any --issue="" applies the issue-less rule" (diff below)
- Task 2 `test-changed` — `.bkit/core/engine/commands/workflow/runs.test.ts` differs from its red snapshot for "runs context refuses an issue-less marker and branch naming the missing issue" (diff below)
- Task 3 `test-changed` — `.bkit/core/engine/commands/workflow/steps.test.ts` differs from its red snapshot for "gate --issue="" fails the fid check for 123-fix under github" (diff below)
- Task 3 `test-changed` — `.bkit/core/engine/commands/workflow/steps.test.ts` differs from its red snapshot for "gate --issue="" passes the fid check for dev-ci-failures under github" (diff below)
- Task 4 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "landPr refuses a main-based PR without retrying" (diff below)
- Task 4 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "landPr refuses when the PR base is unknown" (diff below)
- Task 4 `test-changed` — `.bkit/core/engine/commands/workflow/workflows.test.ts` differs from its red snapshot for "closePr refuses when the PR base is unknown" (diff below)
- Task 4 `test-changed` — `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` differs from its red snapshot for "lands an issue-less run with a FID-only marker" (diff below)
- Task 5 `test-changed` — `.bkit/core/engine/commands/workflow/worktrees.test.ts` differs from its red snapshot for "ship on dev refuses with the releases-stay-manual text" (diff below)
- Task 5 `test-changed` — `.bkit/core/engine/commands/workflow/worktrees.test.ts` differs from its red snapshot for "ship names a missing feat branch" (diff below)
- Task 5 `test-changed` — `.bkit/core/engine/commands/workflow/worktrees.test.ts` differs from its red snapshot for "build in place on main is refused" (diff below)
- Task 5 `test-changed` — `.bkit/core/engine/commands/workflow/worktrees.test.ts` differs from its red snapshot for "design and plan in place on main are refused" (diff below)
- Task 11 `no-red` — no red recorded for "writeStepRow with a shared-checkout record never commits a recorded path" — the test was never seen failing before the code
- Task 11 `no-red` — no red recorded for "writeStepRow refuses when a recorded path changed" — the test was never seen failing before the code
- Task 11 `no-red` — no red recorded for "stageTrackedUpdates skips recorded paths" — the test was never seen failing before the code
- Task 11 `no-red` — no red recorded for "in-place debug on dev writes the shared-checkout record" — the test was never seen failing before the code
- Task 11 `no-red` — no red recorded for "foreign staged and untracked files survive a run commit" — the test was never seen failing before the code
- Task 11 `no-red` — no red recorded for "in-place debug on dev returns startSha and aheadAtStart" — the test was never seen failing before the code
- Task 11 `no-red` — no red recorded for "a new run of the same FID rewrites startSha" — the test was never seen failing before the code
- Task 11 `no-red` — no red recorded for "writeStepRow appends its commit sha to the record" — the test was never seen failing before the code
- Task 11 `no-red` — no red recorded for "a hook-refused own-path commit exits without staging a recorded path" — the test was never seen failing before the code
- Task 11 `no-red` — no red recorded for "a recorded ledger commits only the rows the run appended" — the test was never seen failing before the code
- Task 11 `no-red` — no red recorded for "close with a shared-checkout record never commits a recorded path" — the test was never seen failing before the code
- Task 11 `no-red` — no red recorded for "record is present after workflows close and before the push" — the test was never seen failing before the code
- Task 11 `no-red` — no red recorded for "failed handover from dev removes the record and keeps recorded paths" — the test was never seen failing before the code
- Task 11 `no-red` — no red recorded for "locks release removes the FID shared-checkout record" — the test was never seen failing before the code
- Task 11 `no-red` — no red recorded for "close commit tree excludes foreign files" — the test was never seen failing before the code
- Task 11 `no-red` — no red recorded for "debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not" — the test was never seen failing before the code
- Task 11 `no-red` — no red recorded for "setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock" — the test was never seen failing before the code
- Task 11 `no-red` — no red recorded for "a stale record without a lock is replaced" — the test was never seen failing before the code
- Task 11 `no-red` — no red recorded for "a resume of the same FID reuses the record" — the test was never seen failing before the code
- Task 11 `no-red` — no red recorded for "commitBookkeeping refuses when a recorded path changed" — the test was never seen failing before the code
- Task 12 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "push after a replay reports the pushToDev sha not HEAD" (diff below)
- Task 12 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "replay build callback cherry-picks exactly the recorded SHAs" (diff below)
- Task 12 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "replay conflict exits non-zero naming the paths and removes the throwaway checkout" (diff below)
- Task 12 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal" (diff below)
- Task 12 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "skip-ci HEAD on the replay is refused" (diff below)
- Task 12 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "abort mode on dev with a record pushes only recorded SHAs" (diff below)

## Diff since red — Task 1 `.bkit/core/engine/commands/workflow/fids.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-1-1.snapshot b/.bkit/core/engine/commands/workflow/fids.test.ts
index 6100a62c..5218a8c5 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-1-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/fids.test.ts
@@ -8,6 +8,8 @@ import {
   FID_PATTERNS,
   fidProblem,
   fidsCommand,
+  fromBranch,
+  fromMarker,
   ISSUE_ID_PATTERNS,
   ISSUE_LESS_FID,
   issueIdOf,
@@ -354,6 +356,10 @@ describe("bkit fids parse", () => {
     ["jira", "feat/mba-7-slug", "mba-7-slug", "MBA-7"],
     ["jira", "feat/ab2-7-slug", "ab2-7-slug", "AB2-7"],
     ["none", "feat/anything-goes", "anything-goes", null],
+    ["github", "feat/abc-x", "abc-x", null],
+    ["github", "feat/dev-ci-failures", "dev-ci-failures", null],
+    ["linear", "feat/dev-ci-failures", "dev-ci-failures", null],
+    ["jira", "feat/dev-ci-failures", "dev-ci-failures", null],
   ])("%s branch %s -> FID %s, issueId %j", async (tracker, branch, fid, issueId) => {
     const r = await run(project(tracker), ["parse", `--branch=${branch}`]);
     expect(r.code).toBe(0);
@@ -364,7 +370,6 @@ describe("bkit fids parse", () => {
     ["github", "dev", "is not feat/{FID}"],
     ["github", "feat/", "is not a slug"],
     ["github", "feat/Upper-case", "is not a slug"],
-    ["github", "feat/abc-x", "embeds no github issue id"],
     ["linear", "feat/341-x", "embeds no linear issue id"],
     ["linear", "feat/ab2-7-x", "embeds no linear issue id"],
     ["jira", "feat/341-x", "embeds no jira issue id"],
@@ -385,6 +390,84 @@ describe("bkit fids parse", () => {
   });
 });

+describe("issue-less FID recovery", () => {
+  const FID_ONLY = "<!-- bkit:fid=dev-ci-failures -->";
+
+  it("fromMarker returns issueId null for a FID-only marker under github", () => {
+    expect(fromMarker(FID_ONLY, "github")).toEqual({
+      fid: "dev-ci-failures",
+      issueId: null,
+      source: "marker",
+    });
+  });
+
+  it.each(["linear", "jira", "none"] as const)(
+    "fromMarker returns issueId null for a FID-only marker under %s",
+    (tracker) => {
+      expect(fromMarker(FID_ONLY, tracker)).toMatchObject({
+        fid: "dev-ci-failures",
+        issueId: null,
+      });
+    },
+  );
+
+  it("fromBranch returns issueId null for feat/dev-ci-failures under linear", () => {
+    expect(fromBranch("feat/dev-ci-failures", "linear")).toEqual({
+      ok: true,
+      parsed: { fid: "dev-ci-failures", issueId: null, source: "branch" },
+    });
+  });
+
+  it.each(["github", "jira"] as const)(
+    "fromBranch returns issueId null for feat/dev-ci-failures under %s",
+    (tracker) => {
+      expect(fromBranch("feat/dev-ci-failures", tracker)).toMatchObject({
+        ok: true,
+        parsed: { issueId: null },
+      });
+    },
+  );
+
+  it("a tracker-shaped marker or branch still parses as its issue", () => {
+    expect(fromMarker("<!-- bkit:issue=#341 bkit:fid=341-x -->", "github")).toMatchObject({
+      issueId: "341",
+    });
+    expect(fromBranch("feat/341-x", "github")).toMatchObject({
+      ok: true,
+      parsed: { issueId: "341" },
+    });
+  });
+
+  it("a FID-only marker holding an all-digit word is not issue-less", () => {
+    for (const fid of ["341-x", "123", "dev-123-x", "fix-2-retry"]) {
+      expect(fromMarker(`<!-- bkit:fid=${fid} -->`, "github")).toBeNull();
+      expect(fromMarker(`<!-- bkit:fid=${fid} -->`, "linear")).toBeNull();
+    }
+    expect(fromMarker("<!-- bkit:fid=341-x -->", "none")).toMatchObject({ issueId: null });
+  });
+
+  it("a malformed tracker marker does not fall back to the FID-only shape", () => {
+    expect(fromMarker("<!-- bkit:issue=#341 bkit:fid=Not_A_Slug -->", "github")).toBeNull();
+  });
+
+  it("fids parse recovers an issue-less FID from the marker and from the branch", async () => {
+    const m = await run(project("github"), ["parse", `--marker=${FID_ONLY}`]);
+    expect(m.json).toEqual({
+      fid: "dev-ci-failures",
+      issueId: null,
+      source: "marker",
+      tracker: "github",
+    });
+    const b = await run(project("jira"), ["parse", "--branch=feat/dev-ci-failures"]);
+    expect(b.json).toEqual({
+      fid: "dev-ci-failures",
+      issueId: null,
+      source: "branch",
+      tracker: "jira",
+    });
+  });
+});
+
 describe("issueIdOf", () => {
   it("matches auto's CI_DEV derivation (first numeric or team-number prefix, uppercased)", () => {
     expect(issueIdOf("12-34-x", "any")).toBe("12");
```

## Diff since red — Task 1 `.bkit/core/engine/commands/workflow/fids.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-1-2.snapshot b/.bkit/core/engine/commands/workflow/fids.test.ts
index 6100a62c..5218a8c5 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-1-2.snapshot
+++ b/.bkit/core/engine/commands/workflow/fids.test.ts
@@ -8,6 +8,8 @@ import {
   FID_PATTERNS,
   fidProblem,
   fidsCommand,
+  fromBranch,
+  fromMarker,
   ISSUE_ID_PATTERNS,
   ISSUE_LESS_FID,
   issueIdOf,
@@ -354,6 +356,10 @@ describe("bkit fids parse", () => {
     ["jira", "feat/mba-7-slug", "mba-7-slug", "MBA-7"],
     ["jira", "feat/ab2-7-slug", "ab2-7-slug", "AB2-7"],
     ["none", "feat/anything-goes", "anything-goes", null],
+    ["github", "feat/abc-x", "abc-x", null],
+    ["github", "feat/dev-ci-failures", "dev-ci-failures", null],
+    ["linear", "feat/dev-ci-failures", "dev-ci-failures", null],
+    ["jira", "feat/dev-ci-failures", "dev-ci-failures", null],
   ])("%s branch %s -> FID %s, issueId %j", async (tracker, branch, fid, issueId) => {
     const r = await run(project(tracker), ["parse", `--branch=${branch}`]);
     expect(r.code).toBe(0);
@@ -364,7 +370,6 @@ describe("bkit fids parse", () => {
     ["github", "dev", "is not feat/{FID}"],
     ["github", "feat/", "is not a slug"],
     ["github", "feat/Upper-case", "is not a slug"],
-    ["github", "feat/abc-x", "embeds no github issue id"],
     ["linear", "feat/341-x", "embeds no linear issue id"],
     ["linear", "feat/ab2-7-x", "embeds no linear issue id"],
     ["jira", "feat/341-x", "embeds no jira issue id"],
@@ -385,6 +390,84 @@ describe("bkit fids parse", () => {
   });
 });

+describe("issue-less FID recovery", () => {
+  const FID_ONLY = "<!-- bkit:fid=dev-ci-failures -->";
+
+  it("fromMarker returns issueId null for a FID-only marker under github", () => {
+    expect(fromMarker(FID_ONLY, "github")).toEqual({
+      fid: "dev-ci-failures",
+      issueId: null,
+      source: "marker",
+    });
+  });
+
+  it.each(["linear", "jira", "none"] as const)(
+    "fromMarker returns issueId null for a FID-only marker under %s",
+    (tracker) => {
+      expect(fromMarker(FID_ONLY, tracker)).toMatchObject({
+        fid: "dev-ci-failures",
+        issueId: null,
+      });
+    },
+  );
+
+  it("fromBranch returns issueId null for feat/dev-ci-failures under linear", () => {
+    expect(fromBranch("feat/dev-ci-failures", "linear")).toEqual({
+      ok: true,
+      parsed: { fid: "dev-ci-failures", issueId: null, source: "branch" },
+    });
+  });
+
+  it.each(["github", "jira"] as const)(
+    "fromBranch returns issueId null for feat/dev-ci-failures under %s",
+    (tracker) => {
+      expect(fromBranch("feat/dev-ci-failures", tracker)).toMatchObject({
+        ok: true,
+        parsed: { issueId: null },
+      });
+    },
+  );
+
+  it("a tracker-shaped marker or branch still parses as its issue", () => {
+    expect(fromMarker("<!-- bkit:issue=#341 bkit:fid=341-x -->", "github")).toMatchObject({
+      issueId: "341",
+    });
+    expect(fromBranch("feat/341-x", "github")).toMatchObject({
+      ok: true,
+      parsed: { issueId: "341" },
+    });
+  });
+
+  it("a FID-only marker holding an all-digit word is not issue-less", () => {
+    for (const fid of ["341-x", "123", "dev-123-x", "fix-2-retry"]) {
+      expect(fromMarker(`<!-- bkit:fid=${fid} -->`, "github")).toBeNull();
+      expect(fromMarker(`<!-- bkit:fid=${fid} -->`, "linear")).toBeNull();
+    }
+    expect(fromMarker("<!-- bkit:fid=341-x -->", "none")).toMatchObject({ issueId: null });
+  });
+
+  it("a malformed tracker marker does not fall back to the FID-only shape", () => {
+    expect(fromMarker("<!-- bkit:issue=#341 bkit:fid=Not_A_Slug -->", "github")).toBeNull();
+  });
+
+  it("fids parse recovers an issue-less FID from the marker and from the branch", async () => {
+    const m = await run(project("github"), ["parse", `--marker=${FID_ONLY}`]);
+    expect(m.json).toEqual({
+      fid: "dev-ci-failures",
+      issueId: null,
+      source: "marker",
+      tracker: "github",
+    });
+    const b = await run(project("jira"), ["parse", "--branch=feat/dev-ci-failures"]);
+    expect(b.json).toEqual({
+      fid: "dev-ci-failures",
+      issueId: null,
+      source: "branch",
+      tracker: "jira",
+    });
+  });
+});
+
 describe("issueIdOf", () => {
   it("matches auto's CI_DEV derivation (first numeric or team-number prefix, uppercased)", () => {
     expect(issueIdOf("12-34-x", "any")).toBe("12");
```

## Diff since red — Task 1 `.bkit/core/engine/commands/workflow/fids.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-1-3.snapshot b/.bkit/core/engine/commands/workflow/fids.test.ts
index 6100a62c..5218a8c5 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-1-3.snapshot
+++ b/.bkit/core/engine/commands/workflow/fids.test.ts
@@ -8,6 +8,8 @@ import {
   FID_PATTERNS,
   fidProblem,
   fidsCommand,
+  fromBranch,
+  fromMarker,
   ISSUE_ID_PATTERNS,
   ISSUE_LESS_FID,
   issueIdOf,
@@ -354,6 +356,10 @@ describe("bkit fids parse", () => {
     ["jira", "feat/mba-7-slug", "mba-7-slug", "MBA-7"],
     ["jira", "feat/ab2-7-slug", "ab2-7-slug", "AB2-7"],
     ["none", "feat/anything-goes", "anything-goes", null],
+    ["github", "feat/abc-x", "abc-x", null],
+    ["github", "feat/dev-ci-failures", "dev-ci-failures", null],
+    ["linear", "feat/dev-ci-failures", "dev-ci-failures", null],
+    ["jira", "feat/dev-ci-failures", "dev-ci-failures", null],
   ])("%s branch %s -> FID %s, issueId %j", async (tracker, branch, fid, issueId) => {
     const r = await run(project(tracker), ["parse", `--branch=${branch}`]);
     expect(r.code).toBe(0);
@@ -364,7 +370,6 @@ describe("bkit fids parse", () => {
     ["github", "dev", "is not feat/{FID}"],
     ["github", "feat/", "is not a slug"],
     ["github", "feat/Upper-case", "is not a slug"],
-    ["github", "feat/abc-x", "embeds no github issue id"],
     ["linear", "feat/341-x", "embeds no linear issue id"],
     ["linear", "feat/ab2-7-x", "embeds no linear issue id"],
     ["jira", "feat/341-x", "embeds no jira issue id"],
@@ -385,6 +390,84 @@ describe("bkit fids parse", () => {
   });
 });

+describe("issue-less FID recovery", () => {
+  const FID_ONLY = "<!-- bkit:fid=dev-ci-failures -->";
+
+  it("fromMarker returns issueId null for a FID-only marker under github", () => {
+    expect(fromMarker(FID_ONLY, "github")).toEqual({
+      fid: "dev-ci-failures",
+      issueId: null,
+      source: "marker",
+    });
+  });
+
+  it.each(["linear", "jira", "none"] as const)(
+    "fromMarker returns issueId null for a FID-only marker under %s",
+    (tracker) => {
+      expect(fromMarker(FID_ONLY, tracker)).toMatchObject({
+        fid: "dev-ci-failures",
+        issueId: null,
+      });
+    },
+  );
+
+  it("fromBranch returns issueId null for feat/dev-ci-failures under linear", () => {
+    expect(fromBranch("feat/dev-ci-failures", "linear")).toEqual({
+      ok: true,
+      parsed: { fid: "dev-ci-failures", issueId: null, source: "branch" },
+    });
+  });
+
+  it.each(["github", "jira"] as const)(
+    "fromBranch returns issueId null for feat/dev-ci-failures under %s",
+    (tracker) => {
+      expect(fromBranch("feat/dev-ci-failures", tracker)).toMatchObject({
+        ok: true,
+        parsed: { issueId: null },
+      });
+    },
+  );
+
+  it("a tracker-shaped marker or branch still parses as its issue", () => {
+    expect(fromMarker("<!-- bkit:issue=#341 bkit:fid=341-x -->", "github")).toMatchObject({
+      issueId: "341",
+    });
+    expect(fromBranch("feat/341-x", "github")).toMatchObject({
+      ok: true,
+      parsed: { issueId: "341" },
+    });
+  });
+
+  it("a FID-only marker holding an all-digit word is not issue-less", () => {
+    for (const fid of ["341-x", "123", "dev-123-x", "fix-2-retry"]) {
+      expect(fromMarker(`<!-- bkit:fid=${fid} -->`, "github")).toBeNull();
+      expect(fromMarker(`<!-- bkit:fid=${fid} -->`, "linear")).toBeNull();
+    }
+    expect(fromMarker("<!-- bkit:fid=341-x -->", "none")).toMatchObject({ issueId: null });
+  });
+
+  it("a malformed tracker marker does not fall back to the FID-only shape", () => {
+    expect(fromMarker("<!-- bkit:issue=#341 bkit:fid=Not_A_Slug -->", "github")).toBeNull();
+  });
+
+  it("fids parse recovers an issue-less FID from the marker and from the branch", async () => {
+    const m = await run(project("github"), ["parse", `--marker=${FID_ONLY}`]);
+    expect(m.json).toEqual({
+      fid: "dev-ci-failures",
+      issueId: null,
+      source: "marker",
+      tracker: "github",
+    });
+    const b = await run(project("jira"), ["parse", "--branch=feat/dev-ci-failures"]);
+    expect(b.json).toEqual({
+      fid: "dev-ci-failures",
+      issueId: null,
+      source: "branch",
+      tracker: "jira",
+    });
+  });
+});
+
 describe("issueIdOf", () => {
   it("matches auto's CI_DEV derivation (first numeric or team-number prefix, uppercased)", () => {
     expect(issueIdOf("12-34-x", "any")).toBe("12");
```

## Diff since red — Task 1 `.bkit/core/engine/commands/workflow/fids.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-1-4.snapshot b/.bkit/core/engine/commands/workflow/fids.test.ts
index 6100a62c..5218a8c5 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-1-4.snapshot
+++ b/.bkit/core/engine/commands/workflow/fids.test.ts
@@ -8,6 +8,8 @@ import {
   FID_PATTERNS,
   fidProblem,
   fidsCommand,
+  fromBranch,
+  fromMarker,
   ISSUE_ID_PATTERNS,
   ISSUE_LESS_FID,
   issueIdOf,
@@ -354,6 +356,10 @@ describe("bkit fids parse", () => {
     ["jira", "feat/mba-7-slug", "mba-7-slug", "MBA-7"],
     ["jira", "feat/ab2-7-slug", "ab2-7-slug", "AB2-7"],
     ["none", "feat/anything-goes", "anything-goes", null],
+    ["github", "feat/abc-x", "abc-x", null],
+    ["github", "feat/dev-ci-failures", "dev-ci-failures", null],
+    ["linear", "feat/dev-ci-failures", "dev-ci-failures", null],
+    ["jira", "feat/dev-ci-failures", "dev-ci-failures", null],
   ])("%s branch %s -> FID %s, issueId %j", async (tracker, branch, fid, issueId) => {
     const r = await run(project(tracker), ["parse", `--branch=${branch}`]);
     expect(r.code).toBe(0);
@@ -364,7 +370,6 @@ describe("bkit fids parse", () => {
     ["github", "dev", "is not feat/{FID}"],
     ["github", "feat/", "is not a slug"],
     ["github", "feat/Upper-case", "is not a slug"],
-    ["github", "feat/abc-x", "embeds no github issue id"],
     ["linear", "feat/341-x", "embeds no linear issue id"],
     ["linear", "feat/ab2-7-x", "embeds no linear issue id"],
     ["jira", "feat/341-x", "embeds no jira issue id"],
@@ -385,6 +390,84 @@ describe("bkit fids parse", () => {
   });
 });

+describe("issue-less FID recovery", () => {
+  const FID_ONLY = "<!-- bkit:fid=dev-ci-failures -->";
+
+  it("fromMarker returns issueId null for a FID-only marker under github", () => {
+    expect(fromMarker(FID_ONLY, "github")).toEqual({
+      fid: "dev-ci-failures",
+      issueId: null,
+      source: "marker",
+    });
+  });
+
+  it.each(["linear", "jira", "none"] as const)(
+    "fromMarker returns issueId null for a FID-only marker under %s",
+    (tracker) => {
+      expect(fromMarker(FID_ONLY, tracker)).toMatchObject({
+        fid: "dev-ci-failures",
+        issueId: null,
+      });
+    },
+  );
+
+  it("fromBranch returns issueId null for feat/dev-ci-failures under linear", () => {
+    expect(fromBranch("feat/dev-ci-failures", "linear")).toEqual({
+      ok: true,
+      parsed: { fid: "dev-ci-failures", issueId: null, source: "branch" },
+    });
+  });
+
+  it.each(["github", "jira"] as const)(
+    "fromBranch returns issueId null for feat/dev-ci-failures under %s",
+    (tracker) => {
+      expect(fromBranch("feat/dev-ci-failures", tracker)).toMatchObject({
+        ok: true,
+        parsed: { issueId: null },
+      });
+    },
+  );
+
+  it("a tracker-shaped marker or branch still parses as its issue", () => {
+    expect(fromMarker("<!-- bkit:issue=#341 bkit:fid=341-x -->", "github")).toMatchObject({
+      issueId: "341",
+    });
+    expect(fromBranch("feat/341-x", "github")).toMatchObject({
+      ok: true,
+      parsed: { issueId: "341" },
+    });
+  });
+
+  it("a FID-only marker holding an all-digit word is not issue-less", () => {
+    for (const fid of ["341-x", "123", "dev-123-x", "fix-2-retry"]) {
+      expect(fromMarker(`<!-- bkit:fid=${fid} -->`, "github")).toBeNull();
+      expect(fromMarker(`<!-- bkit:fid=${fid} -->`, "linear")).toBeNull();
+    }
+    expect(fromMarker("<!-- bkit:fid=341-x -->", "none")).toMatchObject({ issueId: null });
+  });
+
+  it("a malformed tracker marker does not fall back to the FID-only shape", () => {
+    expect(fromMarker("<!-- bkit:issue=#341 bkit:fid=Not_A_Slug -->", "github")).toBeNull();
+  });
+
+  it("fids parse recovers an issue-less FID from the marker and from the branch", async () => {
+    const m = await run(project("github"), ["parse", `--marker=${FID_ONLY}`]);
+    expect(m.json).toEqual({
+      fid: "dev-ci-failures",
+      issueId: null,
+      source: "marker",
+      tracker: "github",
+    });
+    const b = await run(project("jira"), ["parse", "--branch=feat/dev-ci-failures"]);
+    expect(b.json).toEqual({
+      fid: "dev-ci-failures",
+      issueId: null,
+      source: "branch",
+      tracker: "jira",
+    });
+  });
+});
+
 describe("issueIdOf", () => {
   it("matches auto's CI_DEV derivation (first numeric or team-number prefix, uppercased)", () => {
     expect(issueIdOf("12-34-x", "any")).toBe("12");
```

## Diff since red — Task 2 `.bkit/core/engine/commands/workflow/runs.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-2-3.snapshot b/.bkit/core/engine/commands/workflow/runs.test.ts
index 9dad6d9b..471f86bc 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-2-3.snapshot
+++ b/.bkit/core/engine/commands/workflow/runs.test.ts
@@ -19,6 +19,7 @@ import {
   type Gh,
 } from "./runs";
 import type { GhResult } from "../lib";
+import { appendRecordCommit, newRecord, readRecord, writeRecord } from "./ledgers";

 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 const FIXTURES = path.join(REPO_ROOT, "tests", "fixtures", "gh");
@@ -1375,6 +1376,137 @@ describe("bkit runs dispatch", { timeout: 20_000 }, () => {
   });
 });

+describe("bkit runs dispatch on dev (a debug run in place)", { timeout: 30_000 }, () => {
+  const FID = "1-x";
+
+  /**
+   * A clone on `dev` of a bare origin: one pushed base commit, a foreign local commit,
+   * then (with `record`) a shared-checkout record and one commit the run made.
+   */
+  function devRepo(o: { record: boolean }) {
+    const root = tmp();
+    const remote = path.join(root, "remote.git");
+    const cwd = path.join(root, "work");
+    gitIn(root, "init", "-q", "--bare", "-b", "dev", remote);
+    gitIn(root, "init", "-q", "-b", "dev", cwd);
+    gitIn(cwd, "config", "user.email", "t@t");
+    gitIn(cwd, "config", "user.name", "t");
+    gitIn(cwd, "commit", "-q", "--allow-empty", "-m", "base");
+    gitIn(cwd, "remote", "add", "origin", remote);
+    gitIn(cwd, "push", "-q", "-u", "origin", "dev");
+    gitIn(cwd, "commit", "-q", "--allow-empty", "-m", "foreign local commit");
+    if (o.record) writeRecord(cwd, newRecord(cwd, FID, "dev"));
+    gitIn(cwd, "commit", "-q", "--allow-empty", "-m", `chore(${FID}): run commit`);
+    if (o.record) appendRecordCommit(cwd, FID, gitIn(cwd, "rev-parse", "HEAD"));
+    const remoteTip = () => gitIn(remote, "rev-parse", "dev");
+    const remoteLog = () => gitIn(remote, "log", "--format=%s", "dev").split("\n");
+    return { root, remote, cwd, remoteTip, remoteLog };
+  }
+
+  const gateBase = (cwd: string) => ({
+    cwd,
+    pr: "7",
+    fid: FID,
+    autoRouteSuffix: "",
+    budgetS: 60,
+    intervalS: 10,
+    retriggered: false,
+  });
+  const quiet = { sleep: instant, log: noLog };
+  const NONE = rollup("vercel");
+  const FOUND = rollup("bkit-tests-unit");
+
+  /** A gh whose `run list` is empty for `emptyFor` calls, then shows a run at origin's dev tip. */
+  const runAtRemoteTip = (remote: string, emptyFor: number): Gh => {
+    let n = 0;
+    return (args) => {
+      if (args[0] !== "run" || args[1] !== "list") return fail;
+      if (++n <= emptyFor) return ok("[]");
+      const headSha = gitIn(remote, "rev-parse", "dev");
+      return ok(JSON.stringify([{ status: "queued", conclusion: "", headSha }]));
+    };
+  };
+
+  it("dispatch on dev with a pushed sha and no pr proves the run started", async () => {
+    const { cwd, root, remote } = devRepo({ record: true });
+    // The pushed sha is a copy the push made on origin; the clone does not have it yet.
+    const other = path.join(root, "other");
+    gitIn(root, "clone", "-q", "-b", "dev", remote, other);
+    gitIn(other, "commit", "-q", "--allow-empty", "-m", `chore(${FID}): landed copy`);
+    gitIn(other, "push", "-q", "origin", "dev");
+    const sha = gitIn(other, "rev-parse", "HEAD");
+    fakeGhBin({
+      "pr-list": "[]",
+      "run-list": JSON.stringify([{ status: "queued", conclusion: "", headSha: sha }]),
+    });
+    const r = await cli(cwd, ["dispatch", `--fid=${FID}`, `--sha=${sha}`]);
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({
+      ciDispatch: { outcome: "dispatched", head: sha, retrigger: false },
+      phase: "done",
+      pr: null,
+      head: sha,
+      scanResult: "clean",
+    });
+  });
+
+  it("re-trigger on dev with a record pushes through the own-commit push", async () => {
+    const { cwd, remote, remoteTip, remoteLog } = devRepo({ record: true });
+    const r = await ciDispatchGate(gateBase(cwd), {
+      gh: sequenceGh([NONE, NONE, NONE, NONE, NONE, NONE, FOUND]).gh,
+      ...quiet,
+    });
+    // The foreign local commit never reaches origin; the run's commits do.
+    expect(remoteLog()).not.toContain("foreign local commit");
+    expect(remoteLog()).toContain(`chore(${FID}): run commit`);
+    expect(remoteLog()[0]).toBe(`chore(${FID}): re-trigger`);
+    // The gate follows the landed copy, not the local commit it was made as.
+    expect(r.ciDispatch).toMatchObject({ outcome: "self-healed", head: remoteTip() });
+    expect(r.head).toBe(remoteTip());
+    expect(gitIn(remote, "rev-list", "--count", "dev")).toBe("3");
+    expect(readRecord(cwd, FID)?.commits).toHaveLength(2);
+  });
+
+  it("re-trigger on dev with a record never commits a foreign staged path", async () => {
+    const { cwd, remoteLog } = devRepo({ record: true });
+    fs.writeFileSync(path.join(cwd, "foreign.txt"), "user work\n");
+    gitIn(cwd, "add", "foreign.txt");
+    await ciDispatchGate(gateBase(cwd), {
+      gh: sequenceGh([NONE, NONE, NONE, NONE, NONE, NONE, FOUND]).gh,
+      ...quiet,
+    });
+    const retrigger = gitIn(cwd, "log", "-1", "--format=%H", "--grep=re-trigger");
+    expect(gitIn(cwd, "show", "--name-only", "--format=", retrigger)).toBe("");
+    expect(gitIn(cwd, "diff", "--cached", "--name-only")).toBe("foreign.txt");
+    expect(remoteLog()).not.toContain("foreign local commit");
+  });
+
+  it("dispatch on dev with no pr and a record follows the landed sha through the re-trigger", async () => {
+    const { cwd, remote, remoteTip } = devRepo({ record: true });
+    const r = await ciDispatchGate(
+      { ...gateBase(cwd), pr: null },
+      { gh: runAtRemoteTip(remote, 6), ...quiet },
+    );
+    expect(r.ciDispatch).toMatchObject({
+      outcome: "self-healed",
+      retrigger: true,
+      head: remoteTip(),
+    });
+    expect(gitIn(remote, "log", "-1", "--format=%s", "dev")).toBe(`chore(${FID}): re-trigger`);
+  });
+
+  it("re-trigger on dev without a record stays a plain commit and a plain push", async () => {
+    const { cwd, remoteTip, remoteLog } = devRepo({ record: false });
+    const r = await ciDispatchGate(gateBase(cwd), {
+      gh: sequenceGh([NONE, NONE, NONE, NONE, NONE, NONE, FOUND]).gh,
+      ...quiet,
+    });
+    expect(remoteTip()).toBe(gitIn(cwd, "rev-parse", "HEAD"));
+    expect(remoteLog()).toContain("foreign local commit");
+    expect(r.ciDispatch).toMatchObject({ outcome: "self-healed", head: remoteTip() });
+  });
+});
+
 const ROLLUP_FOUND = JSON.stringify({
   statusCheckRollup: [{ name: "bkit-tests-unit", status: "QUEUED" }],
 });
@@ -1880,7 +2012,7 @@ describe("bkit runs context", () => {
     const viaMarker = await context(cwd, "ship", "42");
     expect(viaMarker.code).toBe(9);
     expect(viaMarker.err).toContain("no issue in the PR-body marker or branch FID");
-    expect(viaMarker.json).not.toHaveProperty("issueId", null);
+    expect(viaMarker.json.fid).toBeNull();
     fakeGhBin({
       "pr-view": prJson({
         headRefName: "feat/dev-ci-failures",
```

## Diff since red — Task 3 `.bkit/core/engine/commands/workflow/steps.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-3-1.snapshot b/.bkit/core/engine/commands/workflow/steps.test.ts
index 4a8a6c4a..19902044 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-3-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -7,6 +7,7 @@ import { afterEach, describe, expect, it } from "vitest";

 import { runCommand } from "../lib";
 import { COMMANDS } from "../registry";
+import { newRecord, readRecord, writeRecord } from "./ledgers";
 import { ROW_FIELDS, placeholderLines, promptHeader, promptVerdicts, readHeader } from "./steps";

 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
@@ -840,6 +841,20 @@ describe("bkit steps gate — placeholders, FID, derived attempt", () => {
       expect((await gate(wired(), "123-fix", "--issue=")).code).toBe(1);
     });

+    it("gate --issue without --fid is a usage error", async () => {
+      expect(
+        (
+          await run(wired(), [
+            "steps",
+            "gate",
+            "--workflow=design",
+            "--step=design-start-workflow",
+            "--issue=",
+          ])
+        ).code,
+      ).toBe(2);
+    });
+
     it('gate --issue="" under none keeps today\'s check', async () => {
       expect((await gate(repo(), "123-fix", "--issue=")).code).toBe(0);
     });
@@ -865,3 +880,87 @@ describe("bkit steps gate — placeholders, FID, derived attempt", () => {
     ).toBe(2);
   });
 });
+
+describe("bkit steps done — in-place run with a shared-checkout record", () => {
+  const FID = "650-shared";
+  const LOGS = `docs/plans/202610/logs/${FID}`;
+
+  /** A clone on `dev` with foreign work in flight: a modified file, an untracked one, a staged one. */
+  function sharedRepo() {
+    const cwd = repo();
+    git(cwd, "switch", "-q", "-C", "dev");
+    fs.mkdirSync(path.join(cwd, "src"), { recursive: true });
+    write(cwd, "src/a.txt", "a\n");
+    write(cwd, "src/staged.txt", "s\n");
+    git(cwd, "add", "-A");
+    git(cwd, "commit", "-q", "-m", "base");
+    write(cwd, "src/a.txt", "a\nforeign edit\n");
+    write(cwd, "notes.md", "foreign notes\n");
+    write(cwd, "src/staged.txt", "s\nforeign staged\n");
+    git(cwd, "add", "src/staged.txt");
+    writeRecord(cwd, newRecord(cwd, FID, "dev"));
+    fs.mkdirSync(path.join(cwd, LOGS), { recursive: true });
+    write(cwd, `${LOGS}/verify-1.md`, "Verdict: PASS\nFailures: 0\n\n<!-- verdict:end -->\n");
+    return cwd;
+  }
+  const args = (...extra: string[]) => [
+    "steps",
+    "done",
+    `--file=${LOGS}/status.jsonl`,
+    "--workflow=debug",
+    "--step=debug-verify",
+    "--verdict=PASS",
+    "--failures=0",
+    `--artifact=${LOGS}/verify-1.md`,
+    "--message=chore(650-shared): verify",
+    ...extra,
+  ];
+
+  it("writeStepRow with a shared-checkout record never commits a recorded path", async () => {
+    const cwd = sharedRepo();
+    const r = await run(cwd, args());
+    expect(r.code).toBe(0);
+    const committed = git(cwd, "show", "--name-only", "--format=", "HEAD").split("\n").sort();
+    expect(committed).toEqual([`${LOGS}/status.jsonl`, `${LOGS}/verify-1.md`]);
+    expect(git(cwd, "status", "--porcelain")).toBe("M src/a.txt\nM  src/staged.txt\n?? notes.md");
+  });
+
+  it("writeStepRow refuses when a recorded path changed", async () => {
+    const cwd = sharedRepo();
+    write(cwd, "src/a.txt", "a\nforeign edit\nchanged again\n");
+    const before = git(cwd, "rev-parse", "HEAD");
+    const r = await run(cwd, args());
+    expect(r.code).toBe(10);
+    expect(r.err).toContain("src/a.txt");
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(before);
+    expect(fs.existsSync(path.join(cwd, LOGS, "status.jsonl"))).toBe(true);
+  });
+
+  it("writeStepRow appends its commit sha to the record", async () => {
+    const cwd = sharedRepo();
+    const r = await run(cwd, args());
+    expect(r.json.commit).toBe(git(cwd, "rev-parse", "HEAD"));
+    expect(readRecord(cwd, FID)?.commits).toEqual([r.json.commit]);
+  });
+
+  it("a hook-refused own-path commit exits without staging a recorded path", async () => {
+    const cwd = sharedRepo();
+    const hook = path.join(cwd, ".git", "hooks", "pre-commit");
+    fs.writeFileSync(hook, "#!/bin/sh\necho refused >&2\nexit 1\n", { mode: 0o755 });
+    const before = git(cwd, "rev-parse", "HEAD");
+    const r = await run(cwd, args());
+    expect(r.code).toBe(8);
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(before);
+    // Only the pre-existing staged file is in the index; the foreign edit stays unstaged.
+    expect(git(cwd, "diff", "--cached", "--name-only")).not.toContain("src/a.txt");
+    expect(readRecord(cwd, FID)?.commits).toEqual([]);
+  });
+
+  it("without a record the commit is the whole tree, as before", async () => {
+    const cwd = repo();
+    write(cwd, "stray.txt", "x\n");
+    const r = await run(cwd, doneArgs());
+    expect(r.code).toBe(0);
+    expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).toContain("stray.txt");
+  });
+});
```

## Diff since red — Task 3 `.bkit/core/engine/commands/workflow/steps.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-3-2.snapshot b/.bkit/core/engine/commands/workflow/steps.test.ts
index 4a8a6c4a..19902044 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-3-2.snapshot
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -7,6 +7,7 @@ import { afterEach, describe, expect, it } from "vitest";

 import { runCommand } from "../lib";
 import { COMMANDS } from "../registry";
+import { newRecord, readRecord, writeRecord } from "./ledgers";
 import { ROW_FIELDS, placeholderLines, promptHeader, promptVerdicts, readHeader } from "./steps";

 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
@@ -840,6 +841,20 @@ describe("bkit steps gate — placeholders, FID, derived attempt", () => {
       expect((await gate(wired(), "123-fix", "--issue=")).code).toBe(1);
     });

+    it("gate --issue without --fid is a usage error", async () => {
+      expect(
+        (
+          await run(wired(), [
+            "steps",
+            "gate",
+            "--workflow=design",
+            "--step=design-start-workflow",
+            "--issue=",
+          ])
+        ).code,
+      ).toBe(2);
+    });
+
     it('gate --issue="" under none keeps today\'s check', async () => {
       expect((await gate(repo(), "123-fix", "--issue=")).code).toBe(0);
     });
@@ -865,3 +880,87 @@ describe("bkit steps gate — placeholders, FID, derived attempt", () => {
     ).toBe(2);
   });
 });
+
+describe("bkit steps done — in-place run with a shared-checkout record", () => {
+  const FID = "650-shared";
+  const LOGS = `docs/plans/202610/logs/${FID}`;
+
+  /** A clone on `dev` with foreign work in flight: a modified file, an untracked one, a staged one. */
+  function sharedRepo() {
+    const cwd = repo();
+    git(cwd, "switch", "-q", "-C", "dev");
+    fs.mkdirSync(path.join(cwd, "src"), { recursive: true });
+    write(cwd, "src/a.txt", "a\n");
+    write(cwd, "src/staged.txt", "s\n");
+    git(cwd, "add", "-A");
+    git(cwd, "commit", "-q", "-m", "base");
+    write(cwd, "src/a.txt", "a\nforeign edit\n");
+    write(cwd, "notes.md", "foreign notes\n");
+    write(cwd, "src/staged.txt", "s\nforeign staged\n");
+    git(cwd, "add", "src/staged.txt");
+    writeRecord(cwd, newRecord(cwd, FID, "dev"));
+    fs.mkdirSync(path.join(cwd, LOGS), { recursive: true });
+    write(cwd, `${LOGS}/verify-1.md`, "Verdict: PASS\nFailures: 0\n\n<!-- verdict:end -->\n");
+    return cwd;
+  }
+  const args = (...extra: string[]) => [
+    "steps",
+    "done",
+    `--file=${LOGS}/status.jsonl`,
+    "--workflow=debug",
+    "--step=debug-verify",
+    "--verdict=PASS",
+    "--failures=0",
+    `--artifact=${LOGS}/verify-1.md`,
+    "--message=chore(650-shared): verify",
+    ...extra,
+  ];
+
+  it("writeStepRow with a shared-checkout record never commits a recorded path", async () => {
+    const cwd = sharedRepo();
+    const r = await run(cwd, args());
+    expect(r.code).toBe(0);
+    const committed = git(cwd, "show", "--name-only", "--format=", "HEAD").split("\n").sort();
+    expect(committed).toEqual([`${LOGS}/status.jsonl`, `${LOGS}/verify-1.md`]);
+    expect(git(cwd, "status", "--porcelain")).toBe("M src/a.txt\nM  src/staged.txt\n?? notes.md");
+  });
+
+  it("writeStepRow refuses when a recorded path changed", async () => {
+    const cwd = sharedRepo();
+    write(cwd, "src/a.txt", "a\nforeign edit\nchanged again\n");
+    const before = git(cwd, "rev-parse", "HEAD");
+    const r = await run(cwd, args());
+    expect(r.code).toBe(10);
+    expect(r.err).toContain("src/a.txt");
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(before);
+    expect(fs.existsSync(path.join(cwd, LOGS, "status.jsonl"))).toBe(true);
+  });
+
+  it("writeStepRow appends its commit sha to the record", async () => {
+    const cwd = sharedRepo();
+    const r = await run(cwd, args());
+    expect(r.json.commit).toBe(git(cwd, "rev-parse", "HEAD"));
+    expect(readRecord(cwd, FID)?.commits).toEqual([r.json.commit]);
+  });
+
+  it("a hook-refused own-path commit exits without staging a recorded path", async () => {
+    const cwd = sharedRepo();
+    const hook = path.join(cwd, ".git", "hooks", "pre-commit");
+    fs.writeFileSync(hook, "#!/bin/sh\necho refused >&2\nexit 1\n", { mode: 0o755 });
+    const before = git(cwd, "rev-parse", "HEAD");
+    const r = await run(cwd, args());
+    expect(r.code).toBe(8);
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(before);
+    // Only the pre-existing staged file is in the index; the foreign edit stays unstaged.
+    expect(git(cwd, "diff", "--cached", "--name-only")).not.toContain("src/a.txt");
+    expect(readRecord(cwd, FID)?.commits).toEqual([]);
+  });
+
+  it("without a record the commit is the whole tree, as before", async () => {
+    const cwd = repo();
+    write(cwd, "stray.txt", "x\n");
+    const r = await run(cwd, doneArgs());
+    expect(r.code).toBe(0);
+    expect(git(cwd, "show", "--name-only", "--format=", "HEAD")).toContain("stray.txt");
+  });
+});
```

## Diff since red — Task 4 `.bkit/core/engine/commands/workflow/branches.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-4-5.snapshot b/.bkit/core/engine/commands/workflow/branches.test.ts
index 2c6b1d53..5c4c9efd 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-4-5.snapshot
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -8,7 +8,15 @@ import { afterEach, describe, expect, it, vi } from "vitest";

 import { runCommand } from "../lib";
 import { LOCKFILE_REGENERATE, PACKAGE_RUNNER } from "../../shared/package-manager";
-import { LEDGERS, branchesCommand, classifyConflict, readAnchor, stampAnchor } from "./branches";
+import {
+  LEDGERS,
+  branchesCommand,
+  classifyConflict,
+  readAnchor,
+  replayBuild,
+  stampAnchor,
+} from "./branches";
+import { appendRecordCommit, newRecord, writeRecord } from "./ledgers";

 // `branches land` retries without waiting, three tries in all.
 vi.mock("../../shared/timeouts", async (importOriginal) => {
@@ -941,6 +949,7 @@ describe("branches push", { timeout: GIT_TIMEOUT }, () => {
       forced: true,
       skipped: null,
       prNumber: null,
+      replayed: false,
     });
     expect(remoteSha(origin, "feat/1-x")).toBe(sha(clone));
     // A rebased (rewritten) branch still pushes: that is what the lease is for.
@@ -1038,6 +1047,7 @@ describe("branches push", { timeout: GIT_TIMEOUT }, () => {
       forced: false,
       skipped: "open-pr",
       prNumber: 12,
+      replayed: false,
     });
     expect(fs.readFileSync(log, "utf-8")).toContain(
       "pr list --head feat/1-x --state open --json number,state",
@@ -1110,6 +1120,157 @@ describe("branches push", { timeout: GIT_TIMEOUT }, () => {
   });
 });

+describe(
+  "branches push — in place on dev with a shared-checkout record",
+  { timeout: GIT_TIMEOUT },
+  () => {
+    const FID = "650-own-push";
+    const remoteLog = (origin: string) => git(origin, "log", "--format=%s", "dev").out.split("\n");
+
+    /** A clone on dev with one foreign commit already ahead; the run starts after it. */
+    function started(name: string) {
+      const { origin, clone } = withOrigin(name);
+      commit(clone, { "foreign-before.txt": "f\n" }, "foreign: made before the run");
+      writeRecord(clone, newRecord(clone, FID, "dev"));
+      return { origin, clone };
+    }
+    /** A commit the run made: recorded the way the engine records it. */
+    function runCommit(clone: string, files: Record<string, string>, message: string) {
+      commit(clone, files, message);
+      appendRecordCommit(clone, FID, sha(clone));
+      return sha(clone);
+    }
+
+    it("push after a replay reports the pushToDev sha not HEAD", async () => {
+      const { origin, clone } = started("replay-sha");
+      runCommit(clone, { "run.txt": "r\n" }, "fix: the run's commit");
+      const r = await run(clone, ["push", "--mode=dev"]);
+      expect(r.code).toBe(0);
+      expect(r.json).toMatchObject({ pushed: true, ref: "dev", forced: false, replayed: true });
+      expect(r.json?.sha).toBe(sha(origin, "dev"));
+      expect(r.json?.sha).not.toBe(sha(clone));
+      expect(remoteLog(origin)).toContain("fix: the run's commit");
+      expect(remoteLog(origin)).not.toContain("foreign: made before the run");
+      expect(r.err).toContain("git pull --rebase origin dev");
+    });
+
+    it("replay build callback cherry-picks exactly the recorded SHAs", () => {
+      const { origin, clone } = started("replay-build");
+      const first = runCommit(clone, { "one.txt": "1\n" }, "run one");
+      commit(clone, { "foreign-mid.txt": "m\n" }, "foreign: mid-run");
+      const second = runCommit(clone, { "two.txt": "2\n" }, "run two");
+      git(clone, "fetch", "-q", "origin", "dev");
+      const dir = path.join(tmp("replay-dir"), "wt");
+      git(clone, "worktree", "add", "--detach", dir, "origin/dev");
+      replayBuild([first, second])(dir);
+      expect(git(dir, "log", "--format=%s", "origin/dev..HEAD").out).toBe("run two\nrun one");
+      expect(fs.existsSync(path.join(dir, "foreign-mid.txt"))).toBe(false);
+      expect(fs.existsSync(path.join(dir, "two.txt"))).toBe(true);
+      expect(sha(origin, "dev")).toBe(sha(dir, "origin/dev"));
+    });
+
+    it("replay conflict exits non-zero naming the paths and removes the throwaway checkout", async () => {
+      const { origin, clone } = withOrigin("replay-conflict");
+      commit(clone, { "src.txt": "foreign line\n" }, "foreign: touches src.txt");
+      writeRecord(clone, newRecord(clone, FID, "dev"));
+      // The run's commit rewrites the foreign line, so it cannot apply without it.
+      fs.writeFileSync(path.join(clone, "src.txt"), "code v0\nrun rewrote it\n");
+      git(clone, "add", "-A");
+      git(clone, "commit", "-q", "-m", "fix: depends on the foreign commit");
+      appendRecordCommit(clone, FID, sha(clone));
+      const before = sha(origin, "dev");
+      const r = await run(clone, ["push", "--mode=dev"]);
+      expect(r.code).toBe(11);
+      expect(r.err).toContain("src.txt");
+      expect(sha(origin, "dev")).toBe(before);
+      expect(fs.existsSync(path.join(clone, ".worktrees", `_land-${FID}`))).toBe(false);
+      expect(git(clone, "worktree", "list", "--porcelain").out).not.toContain("_land-");
+    });
+
+    it("a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal", async () => {
+      const { origin, clone } = started("replay-refused");
+      runCommit(clone, { "run.txt": "r\n" }, "fix: refused");
+      fs.writeFileSync(
+        path.join(origin, "hooks", "pre-receive"),
+        '#!/bin/sh\necho "dev is protected" >&2\nexit 1\n',
+        { mode: 0o755 },
+      );
+      const calls = path.join(tmp("calls"), "git");
+      const bin = stubBin({
+        git: `[ "$1" = push ] && echo "$*" >> "${calls}"\nexec "${REAL_GIT}" "$@"`,
+      });
+      const r = await run(clone, ["push", "--mode=dev"], { PATH: withBin(bin) });
+      expect(r.code).toBe(8);
+      expect(r.err).toContain("dev is protected");
+      // The one push went out of the throwaway checkout as HEAD:dev, not from the main checkout.
+      expect(fs.readFileSync(calls, "utf-8")).toBe("push origin HEAD:dev\n");
+      expect(r.json).toMatchObject({ pushed: false, ref: null, sha: null });
+      expect(fs.existsSync(path.join(clone, ".worktrees", `_land-${FID}`))).toBe(false);
+    });
+
+    it("skip-ci HEAD on the replay is refused", async () => {
+      const { origin, clone } = started("replay-skipci");
+      runCommit(clone, { "run.txt": "r\n" }, "chore(650): close bkit [skip ci]");
+      commit(clone, { "foreign-top.txt": "t\n" }, "foreign: top commit, no token");
+      const refused = await run(clone, ["push", "--mode=dev", "--require-ci"]);
+      expect(refused.code).toBe(6);
+      expect(refused.json).toMatchObject({ pushed: false, skipped: "skip-ci" });
+      expect(remoteLog(origin)).not.toContain("chore(650): close bkit [skip ci]");
+    });
+
+    it("a skip-ci foreign HEAD does not block a replay whose last run commit is clean", async () => {
+      const { origin, clone } = started("replay-skipci-foreign");
+      runCommit(clone, { "run.txt": "r\n" }, "fix: the run's last commit");
+      commit(clone, { "foreign-top.txt": "t\n" }, "foreign: wip [skip ci]");
+      const r = await run(clone, ["push", "--mode=dev", "--require-ci"]);
+      expect(r.code).toBe(0);
+      expect(remoteLog(origin)).toContain("fix: the run's last commit");
+    });
+
+    it("abort mode on dev with a record pushes only recorded SHAs", async () => {
+      const { origin, clone } = started("replay-abort");
+      runCommit(clone, { "run.txt": "r\n" }, "fix: recorded");
+      commit(clone, { "foreign-mid.txt": "m\n" }, "foreign: mid-run");
+      const calls = path.join(tmp("calls"), "git");
+      const bin = stubBin({
+        git: `[ "$1" = push ] && echo "$*" >> "${calls}"\nexec "${REAL_GIT}" "$@"`,
+      });
+      const r = await run(clone, ["push", "--mode=abort"], { PATH: withBin(bin) });
+      expect(r.code).toBe(0);
+      expect(remoteLog(origin)).toContain("fix: recorded");
+      expect(remoteLog(origin)).not.toContain("foreign: mid-run");
+      expect(fs.readFileSync(calls, "utf-8")).not.toContain("push origin dev");
+    });
+
+    it("a level local dev is a plain push, recording nothing extra", async () => {
+      const { origin, clone } = withOrigin("replay-level");
+      writeRecord(clone, newRecord(clone, FID, "dev"));
+      runCommit(clone, { "run.txt": "r\n" }, "fix: only the run");
+      const r = await run(clone, ["push", "--mode=dev"]);
+      expect(r.code).toBe(0);
+      expect(r.json).toMatchObject({ pushed: true, replayed: false, sha: sha(clone) });
+      expect(sha(origin, "dev")).toBe(sha(clone));
+    });
+
+    it("a record with no commits pushes nothing", async () => {
+      const { origin, clone } = started("replay-empty");
+      const before = sha(origin, "dev");
+      const r = await run(clone, ["push", "--mode=dev"]);
+      expect(r.code).toBe(0);
+      expect(r.json).toMatchObject({ pushed: false, skipped: "no-run-commits" });
+      expect(sha(origin, "dev")).toBe(before);
+    });
+
+    it("without a record the dev push is unchanged and replayed is false", async () => {
+      const { origin, clone } = withOrigin("replay-none");
+      commit(clone, { "a.txt": "a\n" }, "docs: x");
+      const r = await run(clone, ["push", "--mode=dev"]);
+      expect(r.json).toMatchObject({ pushed: true, replayed: false, sha: sha(clone) });
+      expect(sha(origin, "dev")).toBe(sha(clone));
+    });
+  },
+);
+
 // ---------------------------------------------------------------------------
 // sync
 // ---------------------------------------------------------------------------
```

## Diff since red — Task 4 `.bkit/core/engine/commands/workflow/branches.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-4-6.snapshot b/.bkit/core/engine/commands/workflow/branches.test.ts
index 2c6b1d53..5c4c9efd 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-4-6.snapshot
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -8,7 +8,15 @@ import { afterEach, describe, expect, it, vi } from "vitest";

 import { runCommand } from "../lib";
 import { LOCKFILE_REGENERATE, PACKAGE_RUNNER } from "../../shared/package-manager";
-import { LEDGERS, branchesCommand, classifyConflict, readAnchor, stampAnchor } from "./branches";
+import {
+  LEDGERS,
+  branchesCommand,
+  classifyConflict,
+  readAnchor,
+  replayBuild,
+  stampAnchor,
+} from "./branches";
+import { appendRecordCommit, newRecord, writeRecord } from "./ledgers";

 // `branches land` retries without waiting, three tries in all.
 vi.mock("../../shared/timeouts", async (importOriginal) => {
@@ -941,6 +949,7 @@ describe("branches push", { timeout: GIT_TIMEOUT }, () => {
       forced: true,
       skipped: null,
       prNumber: null,
+      replayed: false,
     });
     expect(remoteSha(origin, "feat/1-x")).toBe(sha(clone));
     // A rebased (rewritten) branch still pushes: that is what the lease is for.
@@ -1038,6 +1047,7 @@ describe("branches push", { timeout: GIT_TIMEOUT }, () => {
       forced: false,
       skipped: "open-pr",
       prNumber: 12,
+      replayed: false,
     });
     expect(fs.readFileSync(log, "utf-8")).toContain(
       "pr list --head feat/1-x --state open --json number,state",
@@ -1110,6 +1120,157 @@ describe("branches push", { timeout: GIT_TIMEOUT }, () => {
   });
 });

+describe(
+  "branches push — in place on dev with a shared-checkout record",
+  { timeout: GIT_TIMEOUT },
+  () => {
+    const FID = "650-own-push";
+    const remoteLog = (origin: string) => git(origin, "log", "--format=%s", "dev").out.split("\n");
+
+    /** A clone on dev with one foreign commit already ahead; the run starts after it. */
+    function started(name: string) {
+      const { origin, clone } = withOrigin(name);
+      commit(clone, { "foreign-before.txt": "f\n" }, "foreign: made before the run");
+      writeRecord(clone, newRecord(clone, FID, "dev"));
+      return { origin, clone };
+    }
+    /** A commit the run made: recorded the way the engine records it. */
+    function runCommit(clone: string, files: Record<string, string>, message: string) {
+      commit(clone, files, message);
+      appendRecordCommit(clone, FID, sha(clone));
+      return sha(clone);
+    }
+
+    it("push after a replay reports the pushToDev sha not HEAD", async () => {
+      const { origin, clone } = started("replay-sha");
+      runCommit(clone, { "run.txt": "r\n" }, "fix: the run's commit");
+      const r = await run(clone, ["push", "--mode=dev"]);
+      expect(r.code).toBe(0);
+      expect(r.json).toMatchObject({ pushed: true, ref: "dev", forced: false, replayed: true });
+      expect(r.json?.sha).toBe(sha(origin, "dev"));
+      expect(r.json?.sha).not.toBe(sha(clone));
+      expect(remoteLog(origin)).toContain("fix: the run's commit");
+      expect(remoteLog(origin)).not.toContain("foreign: made before the run");
+      expect(r.err).toContain("git pull --rebase origin dev");
+    });
+
+    it("replay build callback cherry-picks exactly the recorded SHAs", () => {
+      const { origin, clone } = started("replay-build");
+      const first = runCommit(clone, { "one.txt": "1\n" }, "run one");
+      commit(clone, { "foreign-mid.txt": "m\n" }, "foreign: mid-run");
+      const second = runCommit(clone, { "two.txt": "2\n" }, "run two");
+      git(clone, "fetch", "-q", "origin", "dev");
+      const dir = path.join(tmp("replay-dir"), "wt");
+      git(clone, "worktree", "add", "--detach", dir, "origin/dev");
+      replayBuild([first, second])(dir);
+      expect(git(dir, "log", "--format=%s", "origin/dev..HEAD").out).toBe("run two\nrun one");
+      expect(fs.existsSync(path.join(dir, "foreign-mid.txt"))).toBe(false);
+      expect(fs.existsSync(path.join(dir, "two.txt"))).toBe(true);
+      expect(sha(origin, "dev")).toBe(sha(dir, "origin/dev"));
+    });
+
+    it("replay conflict exits non-zero naming the paths and removes the throwaway checkout", async () => {
+      const { origin, clone } = withOrigin("replay-conflict");
+      commit(clone, { "src.txt": "foreign line\n" }, "foreign: touches src.txt");
+      writeRecord(clone, newRecord(clone, FID, "dev"));
+      // The run's commit rewrites the foreign line, so it cannot apply without it.
+      fs.writeFileSync(path.join(clone, "src.txt"), "code v0\nrun rewrote it\n");
+      git(clone, "add", "-A");
+      git(clone, "commit", "-q", "-m", "fix: depends on the foreign commit");
+      appendRecordCommit(clone, FID, sha(clone));
+      const before = sha(origin, "dev");
+      const r = await run(clone, ["push", "--mode=dev"]);
+      expect(r.code).toBe(11);
+      expect(r.err).toContain("src.txt");
+      expect(sha(origin, "dev")).toBe(before);
+      expect(fs.existsSync(path.join(clone, ".worktrees", `_land-${FID}`))).toBe(false);
+      expect(git(clone, "worktree", "list", "--porcelain").out).not.toContain("_land-");
+    });
+
+    it("a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal", async () => {
+      const { origin, clone } = started("replay-refused");
+      runCommit(clone, { "run.txt": "r\n" }, "fix: refused");
+      fs.writeFileSync(
+        path.join(origin, "hooks", "pre-receive"),
+        '#!/bin/sh\necho "dev is protected" >&2\nexit 1\n',
+        { mode: 0o755 },
+      );
+      const calls = path.join(tmp("calls"), "git");
+      const bin = stubBin({
+        git: `[ "$1" = push ] && echo "$*" >> "${calls}"\nexec "${REAL_GIT}" "$@"`,
+      });
+      const r = await run(clone, ["push", "--mode=dev"], { PATH: withBin(bin) });
+      expect(r.code).toBe(8);
+      expect(r.err).toContain("dev is protected");
+      // The one push went out of the throwaway checkout as HEAD:dev, not from the main checkout.
+      expect(fs.readFileSync(calls, "utf-8")).toBe("push origin HEAD:dev\n");
+      expect(r.json).toMatchObject({ pushed: false, ref: null, sha: null });
+      expect(fs.existsSync(path.join(clone, ".worktrees", `_land-${FID}`))).toBe(false);
+    });
+
+    it("skip-ci HEAD on the replay is refused", async () => {
+      const { origin, clone } = started("replay-skipci");
+      runCommit(clone, { "run.txt": "r\n" }, "chore(650): close bkit [skip ci]");
+      commit(clone, { "foreign-top.txt": "t\n" }, "foreign: top commit, no token");
+      const refused = await run(clone, ["push", "--mode=dev", "--require-ci"]);
+      expect(refused.code).toBe(6);
+      expect(refused.json).toMatchObject({ pushed: false, skipped: "skip-ci" });
+      expect(remoteLog(origin)).not.toContain("chore(650): close bkit [skip ci]");
+    });
+
+    it("a skip-ci foreign HEAD does not block a replay whose last run commit is clean", async () => {
+      const { origin, clone } = started("replay-skipci-foreign");
+      runCommit(clone, { "run.txt": "r\n" }, "fix: the run's last commit");
+      commit(clone, { "foreign-top.txt": "t\n" }, "foreign: wip [skip ci]");
+      const r = await run(clone, ["push", "--mode=dev", "--require-ci"]);
+      expect(r.code).toBe(0);
+      expect(remoteLog(origin)).toContain("fix: the run's last commit");
+    });
+
+    it("abort mode on dev with a record pushes only recorded SHAs", async () => {
+      const { origin, clone } = started("replay-abort");
+      runCommit(clone, { "run.txt": "r\n" }, "fix: recorded");
+      commit(clone, { "foreign-mid.txt": "m\n" }, "foreign: mid-run");
+      const calls = path.join(tmp("calls"), "git");
+      const bin = stubBin({
+        git: `[ "$1" = push ] && echo "$*" >> "${calls}"\nexec "${REAL_GIT}" "$@"`,
+      });
+      const r = await run(clone, ["push", "--mode=abort"], { PATH: withBin(bin) });
+      expect(r.code).toBe(0);
+      expect(remoteLog(origin)).toContain("fix: recorded");
+      expect(remoteLog(origin)).not.toContain("foreign: mid-run");
+      expect(fs.readFileSync(calls, "utf-8")).not.toContain("push origin dev");
+    });
+
+    it("a level local dev is a plain push, recording nothing extra", async () => {
+      const { origin, clone } = withOrigin("replay-level");
+      writeRecord(clone, newRecord(clone, FID, "dev"));
+      runCommit(clone, { "run.txt": "r\n" }, "fix: only the run");
+      const r = await run(clone, ["push", "--mode=dev"]);
+      expect(r.code).toBe(0);
+      expect(r.json).toMatchObject({ pushed: true, replayed: false, sha: sha(clone) });
+      expect(sha(origin, "dev")).toBe(sha(clone));
+    });
+
+    it("a record with no commits pushes nothing", async () => {
+      const { origin, clone } = started("replay-empty");
+      const before = sha(origin, "dev");
+      const r = await run(clone, ["push", "--mode=dev"]);
+      expect(r.code).toBe(0);
+      expect(r.json).toMatchObject({ pushed: false, skipped: "no-run-commits" });
+      expect(sha(origin, "dev")).toBe(before);
+    });
+
+    it("without a record the dev push is unchanged and replayed is false", async () => {
+      const { origin, clone } = withOrigin("replay-none");
+      commit(clone, { "a.txt": "a\n" }, "docs: x");
+      const r = await run(clone, ["push", "--mode=dev"]);
+      expect(r.json).toMatchObject({ pushed: true, replayed: false, sha: sha(clone) });
+      expect(sha(origin, "dev")).toBe(sha(clone));
+    });
+  },
+);
+
 // ---------------------------------------------------------------------------
 // sync
 // ---------------------------------------------------------------------------
```

## Diff since red — Task 4 `.bkit/core/engine/commands/workflow/workflows.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-4-7.snapshot b/.bkit/core/engine/commands/workflow/workflows.test.ts
index 45ff72a7..bcfde474 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-4-7.snapshot
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -7,6 +7,7 @@ import { afterEach, describe, expect, it, vi } from "vitest";

 import { validate } from "../../ledgers/telemetry";
 import { runCommand } from "../lib";
+import { newRecord, readRecord, writeRecord } from "./ledgers";
 import { locksCommand } from "./locks";
 import { workflowsCommand } from "./workflows";

@@ -725,6 +726,48 @@ describe("bkit workflows close — commit, outbox, comment", () => {
     expect(r.json.comment).toContain("#### Telemetry");
   });

+  describe("in place on dev with a shared-checkout record", () => {
+    /** `started()` plus foreign work in flight when the record is taken. */
+    function recorded() {
+      const cwd = started("debug");
+      write(cwd, "notes.md", "foreign notes\n");
+      write(cwd, "a.txt", "base\nforeign edit\n");
+      write(cwd, "staged.txt", "foreign staged\n");
+      git(cwd, "add", "staged.txt");
+      writeRecord(cwd, newRecord(cwd, FID, "dev"));
+      return cwd;
+    }
+
+    it("close with a shared-checkout record never commits a recorded path", async () => {
+      const cwd = recorded();
+      const r = await run(cwd, wf("close", "debug", "--message=chore(12-export-csv): close"));
+      expect(r.code).toBe(0);
+      const committed = git(cwd, "show", "--name-only", "--format=", "HEAD").split("\n");
+      expect(committed).toContain(`${REL}/status.jsonl`);
+      expect(committed).not.toContain("notes.md");
+      expect(committed).not.toContain("a.txt");
+      expect(committed).not.toContain("staged.txt");
+      expect(git(cwd, "status", "--porcelain")).toBe("M a.txt\nA  staged.txt\n?? notes.md");
+      expect(readRecord(cwd, FID)?.commits).toEqual([git(cwd, "rev-parse", "HEAD")]);
+    });
+
+    it("record is present after workflows close and before the push", async () => {
+      const cwd = recorded();
+      await run(cwd, wf("close", "debug", "--message=chore(12-export-csv): close"));
+      expect(readRecord(cwd, FID)).not.toBeNull();
+    });
+
+    it("close refuses with exit 10 when a recorded path changed", async () => {
+      const cwd = recorded();
+      write(cwd, "notes.md", "foreign notes\nand more\n");
+      const before = git(cwd, "rev-parse", "HEAD");
+      const r = await run(cwd, wf("close", "debug", "--message=m"));
+      expect(r.code).toBe(10);
+      expect(r.err).toContain("notes.md");
+      expect(git(cwd, "rev-parse", "HEAD")).toBe(before);
+    });
+  });
+
   it("--number without --outbox is a usage error", async () => {
     expect((await run(started(), wf("close", "build", "--number=18", "--title=t"))).code).toBe(2);
   });
@@ -883,6 +926,22 @@ describe("bkit workflows handover", () => {
     expect(r.json.comment).toContain(`https://github.com/o/r/blob/dev/${REL}/debug-handover.md`);
   });

+  it("failed handover from dev removes the record and keeps recorded paths", async () => {
+    const { cwd } = withDevRemote();
+    write(cwd, "src.ts", "foreign half-done fix\n");
+    write(cwd, `${REL}/debug-handover.md`, "# Handover\n");
+    writeRecord(cwd, newRecord(cwd, FID, "dev"));
+    expect(readRecord(cwd, FID)).not.toBeNull();
+    const start = Date.now() - 1000;
+    write(cwd, `${REL}/status.jsonl`, startedThenFailed("debug", start));
+    const r = await run(cwd, wf("handover", "debug", `--month=${M}`, "--push"));
+    expect(r.code).toBe(0);
+    expect(readRecord(cwd, FID)).toBeNull();
+    expect(fs.readFileSync(path.join(cwd, "src.ts"), "utf-8")).toBe("foreign half-done fix\n");
+    // The recorded handover log was dirty before the run: the hand-back leaves it.
+    expect(fs.existsSync(path.join(cwd, REL, "debug-handover.md"))).toBe(true);
+  });
+
   it("--push on dev hands the landed record back, so local dev fast-forwards onto it", async () => {
     const { cwd } = withDevRemote();
     write(cwd, "docs/decisions.jsonl", jsonl([{ key: "a" }]));
```

## Diff since red — Task 4 `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-4-8.snapshot b/.bkit/core/engine/audits/workflows/close-squash.integration.test.ts
index 38f2719c..0ffe26b7 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-4-8.snapshot
+++ b/.bkit/core/engine/audits/workflows/close-squash.integration.test.ts
@@ -260,7 +260,7 @@ describe("bkit-design.md close with no issue", () => {
     const res = runClose("design", fx.repo, {
       fid,
       issue: "",
-      env: { PATH: `${bin}${path.delimiter}${process.env.PATH ?? ""}` },
+      env: { PATH: [bin, process.env.PATH].join(path.delimiter) },
     });

     expect(res.status, res.stderr).toBe(80);
```

## Diff since red — Task 5 `.bkit/core/engine/commands/workflow/worktrees.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-5-1.snapshot b/.bkit/core/engine/commands/workflow/worktrees.test.ts
index c26f8435..e6a48189 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-5-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -10,6 +10,7 @@ import * as path from "node:path";
 import { afterEach, describe, expect, it, vi } from "vitest";

 import { runCommand } from "../lib";
+import { readRecord, writeRecord, type SharedCheckoutRecord } from "./ledgers";
 import { ownershipMarker, worktreeDir, worktreesCommand } from "./worktrees";

 const FID = "42-thing";
@@ -197,6 +198,128 @@ describe("bkit worktrees setup — debug", () => {
   });
 });

+describe("bkit worktrees setup — debug in place on dev (shared-checkout record)", () => {
+  const OTHER = "7-other";
+  const record = (
+    fid: string,
+    extra: Partial<SharedCheckoutRecord> = {},
+  ): SharedCheckoutRecord => ({
+    fid,
+    branch: "dev",
+    startSha: "a".repeat(40),
+    originSha: null,
+    aheadAtStart: 0,
+    paths: [],
+    commits: ["b".repeat(40)],
+    ...extra,
+  });
+  const statusRows = (cwd: string, fid: string, rows: object[]) => {
+    const dir = path.join(cwd, "docs/plans", MONTH, "logs", fid);
+    fs.mkdirSync(dir, { recursive: true });
+    fs.writeFileSync(
+      path.join(dir, "status.jsonl"),
+      rows.map((r) => `${JSON.stringify(r)}\n`).join(""),
+    );
+    return dir;
+  };
+  const now = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
+  const running = (cwd: string, fid: string) => {
+    const dir = statusRows(cwd, fid, [
+      { type: "workflow-started", workflow: "debug", at: now() },
+      {
+        type: "step-done",
+        workflow: "debug",
+        step: "debug-start",
+        status: "DONE",
+        at: now(),
+        parentSha: "c".repeat(40),
+        artifacts: [],
+      },
+    ]);
+    fs.writeFileSync(path.join(dir, ".lock"), `${now()} debug ${fid} tok\n`);
+  };
+
+  it("in-place debug on dev writes the shared-checkout record", async () => {
+    const cwd = repo("dev");
+    fs.writeFileSync(path.join(cwd, "mine.txt"), "pre-existing\n");
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    const rec = readRecord(cwd, FID);
+    expect(rec).toMatchObject({
+      fid: FID,
+      branch: "dev",
+      startSha: git(cwd, "rev-parse", "HEAD"),
+      aheadAtStart: 0,
+      commits: [],
+    });
+    expect(rec?.paths.map((p) => p.path)).toContain("mine.txt");
+    expect(rec?.paths.find((p) => p.path === "mine.txt")?.hash).toBe(
+      git(cwd, "hash-object", "mine.txt"),
+    );
+  });
+
+  it("in-place debug on dev returns startSha and aheadAtStart", async () => {
+    const cwd = repo("dev");
+    const r = await setup(cwd, "debug");
+    expect(r.json).toMatchObject({ startSha: git(cwd, "rev-parse", "HEAD"), aheadAtStart: 0 });
+  });
+
+  it("counts the commits local dev holds beyond origin/dev as aheadAtStart", async () => {
+    const cwd = repo("dev");
+    git(cwd, "update-ref", "refs/remotes/origin/dev", "HEAD");
+    git(cwd, "commit", "-q", "--allow-empty", "-m", "local one");
+    git(cwd, "commit", "-q", "--allow-empty", "-m", "local two");
+    const r = await setup(cwd, "debug");
+    expect(r.json.aheadAtStart).toBe(2);
+    expect(readRecord(cwd, FID)?.aheadAtStart).toBe(2);
+  });
+
+  it("a feature branch run writes no record and no start fields", async () => {
+    const cwd = repo(`feat/${FID}`);
+    const r = await setup(cwd, "debug");
+    expect(r.json).not.toHaveProperty("startSha");
+    expect(readRecord(cwd, FID)).toBeNull();
+  });
+
+  it("a new run of the same FID rewrites startSha", async () => {
+    const cwd = repo("dev");
+    writeRecord(cwd, record(FID));
+    await setup(cwd, "debug");
+    const rec = readRecord(cwd, FID);
+    expect(rec?.startSha).toBe(git(cwd, "rev-parse", "HEAD"));
+    expect(rec?.commits).toEqual([]);
+  });
+
+  it("a resume of the same FID reuses the record", async () => {
+    const cwd = repo("dev");
+    writeRecord(cwd, record(FID));
+    statusRows(cwd, FID, [{ type: "workflow-started", workflow: "debug", at: now() }]);
+    const r = await setup(cwd, "debug");
+    expect(r.json.startSha).toBe("a".repeat(40));
+    expect(readRecord(cwd, FID)?.commits).toEqual(["b".repeat(40)]);
+  });
+
+  it("setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock", async () => {
+    const cwd = repo("dev");
+    writeRecord(cwd, record(OTHER));
+    running(cwd, OTHER);
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(13);
+    expect(r.err).toContain(OTHER);
+    expect(readRecord(cwd, FID)).toBeNull();
+    expect(readRecord(cwd, OTHER)).not.toBeNull();
+  });
+
+  it("a stale record without a lock is replaced", async () => {
+    const cwd = repo("dev");
+    writeRecord(cwd, record(OTHER));
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(readRecord(cwd, OTHER)).toBeNull();
+    expect(readRecord(cwd, FID)).not.toBeNull();
+  });
+});
+
 describe("bkit worktrees setup — ship branch", () => {
   it("ships the prompt-named branch, else feat/{fid} when it exists, else the session branch", async () => {
     const cwd = repo("claude/work");
```

## Diff since red — Task 5 `.bkit/core/engine/commands/workflow/worktrees.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-5-2.snapshot b/.bkit/core/engine/commands/workflow/worktrees.test.ts
index c26f8435..e6a48189 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-5-2.snapshot
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -10,6 +10,7 @@ import * as path from "node:path";
 import { afterEach, describe, expect, it, vi } from "vitest";

 import { runCommand } from "../lib";
+import { readRecord, writeRecord, type SharedCheckoutRecord } from "./ledgers";
 import { ownershipMarker, worktreeDir, worktreesCommand } from "./worktrees";

 const FID = "42-thing";
@@ -197,6 +198,128 @@ describe("bkit worktrees setup — debug", () => {
   });
 });

+describe("bkit worktrees setup — debug in place on dev (shared-checkout record)", () => {
+  const OTHER = "7-other";
+  const record = (
+    fid: string,
+    extra: Partial<SharedCheckoutRecord> = {},
+  ): SharedCheckoutRecord => ({
+    fid,
+    branch: "dev",
+    startSha: "a".repeat(40),
+    originSha: null,
+    aheadAtStart: 0,
+    paths: [],
+    commits: ["b".repeat(40)],
+    ...extra,
+  });
+  const statusRows = (cwd: string, fid: string, rows: object[]) => {
+    const dir = path.join(cwd, "docs/plans", MONTH, "logs", fid);
+    fs.mkdirSync(dir, { recursive: true });
+    fs.writeFileSync(
+      path.join(dir, "status.jsonl"),
+      rows.map((r) => `${JSON.stringify(r)}\n`).join(""),
+    );
+    return dir;
+  };
+  const now = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
+  const running = (cwd: string, fid: string) => {
+    const dir = statusRows(cwd, fid, [
+      { type: "workflow-started", workflow: "debug", at: now() },
+      {
+        type: "step-done",
+        workflow: "debug",
+        step: "debug-start",
+        status: "DONE",
+        at: now(),
+        parentSha: "c".repeat(40),
+        artifacts: [],
+      },
+    ]);
+    fs.writeFileSync(path.join(dir, ".lock"), `${now()} debug ${fid} tok\n`);
+  };
+
+  it("in-place debug on dev writes the shared-checkout record", async () => {
+    const cwd = repo("dev");
+    fs.writeFileSync(path.join(cwd, "mine.txt"), "pre-existing\n");
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    const rec = readRecord(cwd, FID);
+    expect(rec).toMatchObject({
+      fid: FID,
+      branch: "dev",
+      startSha: git(cwd, "rev-parse", "HEAD"),
+      aheadAtStart: 0,
+      commits: [],
+    });
+    expect(rec?.paths.map((p) => p.path)).toContain("mine.txt");
+    expect(rec?.paths.find((p) => p.path === "mine.txt")?.hash).toBe(
+      git(cwd, "hash-object", "mine.txt"),
+    );
+  });
+
+  it("in-place debug on dev returns startSha and aheadAtStart", async () => {
+    const cwd = repo("dev");
+    const r = await setup(cwd, "debug");
+    expect(r.json).toMatchObject({ startSha: git(cwd, "rev-parse", "HEAD"), aheadAtStart: 0 });
+  });
+
+  it("counts the commits local dev holds beyond origin/dev as aheadAtStart", async () => {
+    const cwd = repo("dev");
+    git(cwd, "update-ref", "refs/remotes/origin/dev", "HEAD");
+    git(cwd, "commit", "-q", "--allow-empty", "-m", "local one");
+    git(cwd, "commit", "-q", "--allow-empty", "-m", "local two");
+    const r = await setup(cwd, "debug");
+    expect(r.json.aheadAtStart).toBe(2);
+    expect(readRecord(cwd, FID)?.aheadAtStart).toBe(2);
+  });
+
+  it("a feature branch run writes no record and no start fields", async () => {
+    const cwd = repo(`feat/${FID}`);
+    const r = await setup(cwd, "debug");
+    expect(r.json).not.toHaveProperty("startSha");
+    expect(readRecord(cwd, FID)).toBeNull();
+  });
+
+  it("a new run of the same FID rewrites startSha", async () => {
+    const cwd = repo("dev");
+    writeRecord(cwd, record(FID));
+    await setup(cwd, "debug");
+    const rec = readRecord(cwd, FID);
+    expect(rec?.startSha).toBe(git(cwd, "rev-parse", "HEAD"));
+    expect(rec?.commits).toEqual([]);
+  });
+
+  it("a resume of the same FID reuses the record", async () => {
+    const cwd = repo("dev");
+    writeRecord(cwd, record(FID));
+    statusRows(cwd, FID, [{ type: "workflow-started", workflow: "debug", at: now() }]);
+    const r = await setup(cwd, "debug");
+    expect(r.json.startSha).toBe("a".repeat(40));
+    expect(readRecord(cwd, FID)?.commits).toEqual(["b".repeat(40)]);
+  });
+
+  it("setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock", async () => {
+    const cwd = repo("dev");
+    writeRecord(cwd, record(OTHER));
+    running(cwd, OTHER);
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(13);
+    expect(r.err).toContain(OTHER);
+    expect(readRecord(cwd, FID)).toBeNull();
+    expect(readRecord(cwd, OTHER)).not.toBeNull();
+  });
+
+  it("a stale record without a lock is replaced", async () => {
+    const cwd = repo("dev");
+    writeRecord(cwd, record(OTHER));
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(readRecord(cwd, OTHER)).toBeNull();
+    expect(readRecord(cwd, FID)).not.toBeNull();
+  });
+});
+
 describe("bkit worktrees setup — ship branch", () => {
   it("ships the prompt-named branch, else feat/{fid} when it exists, else the session branch", async () => {
     const cwd = repo("claude/work");
```

## Diff since red — Task 5 `.bkit/core/engine/commands/workflow/worktrees.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-5-3.snapshot b/.bkit/core/engine/commands/workflow/worktrees.test.ts
index c26f8435..e6a48189 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-5-3.snapshot
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -10,6 +10,7 @@ import * as path from "node:path";
 import { afterEach, describe, expect, it, vi } from "vitest";

 import { runCommand } from "../lib";
+import { readRecord, writeRecord, type SharedCheckoutRecord } from "./ledgers";
 import { ownershipMarker, worktreeDir, worktreesCommand } from "./worktrees";

 const FID = "42-thing";
@@ -197,6 +198,128 @@ describe("bkit worktrees setup — debug", () => {
   });
 });

+describe("bkit worktrees setup — debug in place on dev (shared-checkout record)", () => {
+  const OTHER = "7-other";
+  const record = (
+    fid: string,
+    extra: Partial<SharedCheckoutRecord> = {},
+  ): SharedCheckoutRecord => ({
+    fid,
+    branch: "dev",
+    startSha: "a".repeat(40),
+    originSha: null,
+    aheadAtStart: 0,
+    paths: [],
+    commits: ["b".repeat(40)],
+    ...extra,
+  });
+  const statusRows = (cwd: string, fid: string, rows: object[]) => {
+    const dir = path.join(cwd, "docs/plans", MONTH, "logs", fid);
+    fs.mkdirSync(dir, { recursive: true });
+    fs.writeFileSync(
+      path.join(dir, "status.jsonl"),
+      rows.map((r) => `${JSON.stringify(r)}\n`).join(""),
+    );
+    return dir;
+  };
+  const now = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
+  const running = (cwd: string, fid: string) => {
+    const dir = statusRows(cwd, fid, [
+      { type: "workflow-started", workflow: "debug", at: now() },
+      {
+        type: "step-done",
+        workflow: "debug",
+        step: "debug-start",
+        status: "DONE",
+        at: now(),
+        parentSha: "c".repeat(40),
+        artifacts: [],
+      },
+    ]);
+    fs.writeFileSync(path.join(dir, ".lock"), `${now()} debug ${fid} tok\n`);
+  };
+
+  it("in-place debug on dev writes the shared-checkout record", async () => {
+    const cwd = repo("dev");
+    fs.writeFileSync(path.join(cwd, "mine.txt"), "pre-existing\n");
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    const rec = readRecord(cwd, FID);
+    expect(rec).toMatchObject({
+      fid: FID,
+      branch: "dev",
+      startSha: git(cwd, "rev-parse", "HEAD"),
+      aheadAtStart: 0,
+      commits: [],
+    });
+    expect(rec?.paths.map((p) => p.path)).toContain("mine.txt");
+    expect(rec?.paths.find((p) => p.path === "mine.txt")?.hash).toBe(
+      git(cwd, "hash-object", "mine.txt"),
+    );
+  });
+
+  it("in-place debug on dev returns startSha and aheadAtStart", async () => {
+    const cwd = repo("dev");
+    const r = await setup(cwd, "debug");
+    expect(r.json).toMatchObject({ startSha: git(cwd, "rev-parse", "HEAD"), aheadAtStart: 0 });
+  });
+
+  it("counts the commits local dev holds beyond origin/dev as aheadAtStart", async () => {
+    const cwd = repo("dev");
+    git(cwd, "update-ref", "refs/remotes/origin/dev", "HEAD");
+    git(cwd, "commit", "-q", "--allow-empty", "-m", "local one");
+    git(cwd, "commit", "-q", "--allow-empty", "-m", "local two");
+    const r = await setup(cwd, "debug");
+    expect(r.json.aheadAtStart).toBe(2);
+    expect(readRecord(cwd, FID)?.aheadAtStart).toBe(2);
+  });
+
+  it("a feature branch run writes no record and no start fields", async () => {
+    const cwd = repo(`feat/${FID}`);
+    const r = await setup(cwd, "debug");
+    expect(r.json).not.toHaveProperty("startSha");
+    expect(readRecord(cwd, FID)).toBeNull();
+  });
+
+  it("a new run of the same FID rewrites startSha", async () => {
+    const cwd = repo("dev");
+    writeRecord(cwd, record(FID));
+    await setup(cwd, "debug");
+    const rec = readRecord(cwd, FID);
+    expect(rec?.startSha).toBe(git(cwd, "rev-parse", "HEAD"));
+    expect(rec?.commits).toEqual([]);
+  });
+
+  it("a resume of the same FID reuses the record", async () => {
+    const cwd = repo("dev");
+    writeRecord(cwd, record(FID));
+    statusRows(cwd, FID, [{ type: "workflow-started", workflow: "debug", at: now() }]);
+    const r = await setup(cwd, "debug");
+    expect(r.json.startSha).toBe("a".repeat(40));
+    expect(readRecord(cwd, FID)?.commits).toEqual(["b".repeat(40)]);
+  });
+
+  it("setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock", async () => {
+    const cwd = repo("dev");
+    writeRecord(cwd, record(OTHER));
+    running(cwd, OTHER);
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(13);
+    expect(r.err).toContain(OTHER);
+    expect(readRecord(cwd, FID)).toBeNull();
+    expect(readRecord(cwd, OTHER)).not.toBeNull();
+  });
+
+  it("a stale record without a lock is replaced", async () => {
+    const cwd = repo("dev");
+    writeRecord(cwd, record(OTHER));
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(readRecord(cwd, OTHER)).toBeNull();
+    expect(readRecord(cwd, FID)).not.toBeNull();
+  });
+});
+
 describe("bkit worktrees setup — ship branch", () => {
   it("ships the prompt-named branch, else feat/{fid} when it exists, else the session branch", async () => {
     const cwd = repo("claude/work");
```

## Diff since red — Task 5 `.bkit/core/engine/commands/workflow/worktrees.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-5-4.snapshot b/.bkit/core/engine/commands/workflow/worktrees.test.ts
index c26f8435..e6a48189 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-5-4.snapshot
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -10,6 +10,7 @@ import * as path from "node:path";
 import { afterEach, describe, expect, it, vi } from "vitest";

 import { runCommand } from "../lib";
+import { readRecord, writeRecord, type SharedCheckoutRecord } from "./ledgers";
 import { ownershipMarker, worktreeDir, worktreesCommand } from "./worktrees";

 const FID = "42-thing";
@@ -197,6 +198,128 @@ describe("bkit worktrees setup — debug", () => {
   });
 });

+describe("bkit worktrees setup — debug in place on dev (shared-checkout record)", () => {
+  const OTHER = "7-other";
+  const record = (
+    fid: string,
+    extra: Partial<SharedCheckoutRecord> = {},
+  ): SharedCheckoutRecord => ({
+    fid,
+    branch: "dev",
+    startSha: "a".repeat(40),
+    originSha: null,
+    aheadAtStart: 0,
+    paths: [],
+    commits: ["b".repeat(40)],
+    ...extra,
+  });
+  const statusRows = (cwd: string, fid: string, rows: object[]) => {
+    const dir = path.join(cwd, "docs/plans", MONTH, "logs", fid);
+    fs.mkdirSync(dir, { recursive: true });
+    fs.writeFileSync(
+      path.join(dir, "status.jsonl"),
+      rows.map((r) => `${JSON.stringify(r)}\n`).join(""),
+    );
+    return dir;
+  };
+  const now = () => new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
+  const running = (cwd: string, fid: string) => {
+    const dir = statusRows(cwd, fid, [
+      { type: "workflow-started", workflow: "debug", at: now() },
+      {
+        type: "step-done",
+        workflow: "debug",
+        step: "debug-start",
+        status: "DONE",
+        at: now(),
+        parentSha: "c".repeat(40),
+        artifacts: [],
+      },
+    ]);
+    fs.writeFileSync(path.join(dir, ".lock"), `${now()} debug ${fid} tok\n`);
+  };
+
+  it("in-place debug on dev writes the shared-checkout record", async () => {
+    const cwd = repo("dev");
+    fs.writeFileSync(path.join(cwd, "mine.txt"), "pre-existing\n");
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    const rec = readRecord(cwd, FID);
+    expect(rec).toMatchObject({
+      fid: FID,
+      branch: "dev",
+      startSha: git(cwd, "rev-parse", "HEAD"),
+      aheadAtStart: 0,
+      commits: [],
+    });
+    expect(rec?.paths.map((p) => p.path)).toContain("mine.txt");
+    expect(rec?.paths.find((p) => p.path === "mine.txt")?.hash).toBe(
+      git(cwd, "hash-object", "mine.txt"),
+    );
+  });
+
+  it("in-place debug on dev returns startSha and aheadAtStart", async () => {
+    const cwd = repo("dev");
+    const r = await setup(cwd, "debug");
+    expect(r.json).toMatchObject({ startSha: git(cwd, "rev-parse", "HEAD"), aheadAtStart: 0 });
+  });
+
+  it("counts the commits local dev holds beyond origin/dev as aheadAtStart", async () => {
+    const cwd = repo("dev");
+    git(cwd, "update-ref", "refs/remotes/origin/dev", "HEAD");
+    git(cwd, "commit", "-q", "--allow-empty", "-m", "local one");
+    git(cwd, "commit", "-q", "--allow-empty", "-m", "local two");
+    const r = await setup(cwd, "debug");
+    expect(r.json.aheadAtStart).toBe(2);
+    expect(readRecord(cwd, FID)?.aheadAtStart).toBe(2);
+  });
+
+  it("a feature branch run writes no record and no start fields", async () => {
+    const cwd = repo(`feat/${FID}`);
+    const r = await setup(cwd, "debug");
+    expect(r.json).not.toHaveProperty("startSha");
+    expect(readRecord(cwd, FID)).toBeNull();
+  });
+
+  it("a new run of the same FID rewrites startSha", async () => {
+    const cwd = repo("dev");
+    writeRecord(cwd, record(FID));
+    await setup(cwd, "debug");
+    const rec = readRecord(cwd, FID);
+    expect(rec?.startSha).toBe(git(cwd, "rev-parse", "HEAD"));
+    expect(rec?.commits).toEqual([]);
+  });
+
+  it("a resume of the same FID reuses the record", async () => {
+    const cwd = repo("dev");
+    writeRecord(cwd, record(FID));
+    statusRows(cwd, FID, [{ type: "workflow-started", workflow: "debug", at: now() }]);
+    const r = await setup(cwd, "debug");
+    expect(r.json.startSha).toBe("a".repeat(40));
+    expect(readRecord(cwd, FID)?.commits).toEqual(["b".repeat(40)]);
+  });
+
+  it("setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock", async () => {
+    const cwd = repo("dev");
+    writeRecord(cwd, record(OTHER));
+    running(cwd, OTHER);
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(13);
+    expect(r.err).toContain(OTHER);
+    expect(readRecord(cwd, FID)).toBeNull();
+    expect(readRecord(cwd, OTHER)).not.toBeNull();
+  });
+
+  it("a stale record without a lock is replaced", async () => {
+    const cwd = repo("dev");
+    writeRecord(cwd, record(OTHER));
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(readRecord(cwd, OTHER)).toBeNull();
+    expect(readRecord(cwd, FID)).not.toBeNull();
+  });
+});
+
 describe("bkit worktrees setup — ship branch", () => {
   it("ships the prompt-named branch, else feat/{fid} when it exists, else the session branch", async () => {
     const cwd = repo("claude/work");
```

## Diff since red — Task 12 `.bkit/core/engine/commands/workflow/branches.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-12-6.snapshot b/.bkit/core/engine/commands/workflow/branches.test.ts
index cc2d6e04..5c4c9efd 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-12-6.snapshot
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -949,6 +949,7 @@ describe("branches push", { timeout: GIT_TIMEOUT }, () => {
       forced: true,
       skipped: null,
       prNumber: null,
+      replayed: false,
     });
     expect(remoteSha(origin, "feat/1-x")).toBe(sha(clone));
     // A rebased (rewritten) branch still pushes: that is what the lease is for.
@@ -1046,6 +1047,7 @@ describe("branches push", { timeout: GIT_TIMEOUT }, () => {
       forced: false,
       skipped: "open-pr",
       prNumber: 12,
+      replayed: false,
     });
     expect(fs.readFileSync(log, "utf-8")).toContain(
       "pr list --head feat/1-x --state open --json number,state",
@@ -1193,9 +1195,15 @@ describe(
         '#!/bin/sh\necho "dev is protected" >&2\nexit 1\n',
         { mode: 0o755 },
       );
-      const r = await run(clone, ["push", "--mode=dev"]);
+      const calls = path.join(tmp("calls"), "git");
+      const bin = stubBin({
+        git: `[ "$1" = push ] && echo "$*" >> "${calls}"\nexec "${REAL_GIT}" "$@"`,
+      });
+      const r = await run(clone, ["push", "--mode=dev"], { PATH: withBin(bin) });
       expect(r.code).toBe(8);
       expect(r.err).toContain("dev is protected");
+      // The one push went out of the throwaway checkout as HEAD:dev, not from the main checkout.
+      expect(fs.readFileSync(calls, "utf-8")).toBe("push origin HEAD:dev\n");
       expect(r.json).toMatchObject({ pushed: false, ref: null, sha: null });
       expect(fs.existsSync(path.join(clone, ".worktrees", `_land-${FID}`))).toBe(false);
     });
```

## Diff since red — Task 12 `.bkit/core/engine/commands/workflow/branches.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-12-8.snapshot b/.bkit/core/engine/commands/workflow/branches.test.ts
index cc2d6e04..5c4c9efd 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-12-8.snapshot
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -949,6 +949,7 @@ describe("branches push", { timeout: GIT_TIMEOUT }, () => {
       forced: true,
       skipped: null,
       prNumber: null,
+      replayed: false,
     });
     expect(remoteSha(origin, "feat/1-x")).toBe(sha(clone));
     // A rebased (rewritten) branch still pushes: that is what the lease is for.
@@ -1046,6 +1047,7 @@ describe("branches push", { timeout: GIT_TIMEOUT }, () => {
       forced: false,
       skipped: "open-pr",
       prNumber: 12,
+      replayed: false,
     });
     expect(fs.readFileSync(log, "utf-8")).toContain(
       "pr list --head feat/1-x --state open --json number,state",
@@ -1193,9 +1195,15 @@ describe(
         '#!/bin/sh\necho "dev is protected" >&2\nexit 1\n',
         { mode: 0o755 },
       );
-      const r = await run(clone, ["push", "--mode=dev"]);
+      const calls = path.join(tmp("calls"), "git");
+      const bin = stubBin({
+        git: `[ "$1" = push ] && echo "$*" >> "${calls}"\nexec "${REAL_GIT}" "$@"`,
+      });
+      const r = await run(clone, ["push", "--mode=dev"], { PATH: withBin(bin) });
       expect(r.code).toBe(8);
       expect(r.err).toContain("dev is protected");
+      // The one push went out of the throwaway checkout as HEAD:dev, not from the main checkout.
+      expect(fs.readFileSync(calls, "utf-8")).toBe("push origin HEAD:dev\n");
       expect(r.json).toMatchObject({ pushed: false, ref: null, sha: null });
       expect(fs.existsSync(path.join(clone, ".worktrees", `_land-${FID}`))).toBe(false);
     });
```

## Diff since red — Task 12 `.bkit/core/engine/commands/workflow/branches.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-12-9.snapshot b/.bkit/core/engine/commands/workflow/branches.test.ts
index cc2d6e04..5c4c9efd 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-12-9.snapshot
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -949,6 +949,7 @@ describe("branches push", { timeout: GIT_TIMEOUT }, () => {
       forced: true,
       skipped: null,
       prNumber: null,
+      replayed: false,
     });
     expect(remoteSha(origin, "feat/1-x")).toBe(sha(clone));
     // A rebased (rewritten) branch still pushes: that is what the lease is for.
@@ -1046,6 +1047,7 @@ describe("branches push", { timeout: GIT_TIMEOUT }, () => {
       forced: false,
       skipped: "open-pr",
       prNumber: 12,
+      replayed: false,
     });
     expect(fs.readFileSync(log, "utf-8")).toContain(
       "pr list --head feat/1-x --state open --json number,state",
@@ -1193,9 +1195,15 @@ describe(
         '#!/bin/sh\necho "dev is protected" >&2\nexit 1\n',
         { mode: 0o755 },
       );
-      const r = await run(clone, ["push", "--mode=dev"]);
+      const calls = path.join(tmp("calls"), "git");
+      const bin = stubBin({
+        git: `[ "$1" = push ] && echo "$*" >> "${calls}"\nexec "${REAL_GIT}" "$@"`,
+      });
+      const r = await run(clone, ["push", "--mode=dev"], { PATH: withBin(bin) });
       expect(r.code).toBe(8);
       expect(r.err).toContain("dev is protected");
+      // The one push went out of the throwaway checkout as HEAD:dev, not from the main checkout.
+      expect(fs.readFileSync(calls, "utf-8")).toBe("push origin HEAD:dev\n");
       expect(r.json).toMatchObject({ pushed: false, ref: null, sha: null });
       expect(fs.existsSync(path.join(clone, ".worktrees", `_land-${FID}`))).toBe(false);
     });
```

## Diff since red — Task 12 `.bkit/core/engine/commands/workflow/branches.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-12-10.snapshot b/.bkit/core/engine/commands/workflow/branches.test.ts
index 9c7d9245..5c4c9efd 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-12-10.snapshot
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -949,6 +949,7 @@ describe("branches push", { timeout: GIT_TIMEOUT }, () => {
       forced: true,
       skipped: null,
       prNumber: null,
+      replayed: false,
     });
     expect(remoteSha(origin, "feat/1-x")).toBe(sha(clone));
     // A rebased (rewritten) branch still pushes: that is what the lease is for.
@@ -1046,6 +1047,7 @@ describe("branches push", { timeout: GIT_TIMEOUT }, () => {
       forced: false,
       skipped: "open-pr",
       prNumber: 12,
+      replayed: false,
     });
     expect(fs.readFileSync(log, "utf-8")).toContain(
       "pr list --head feat/1-x --state open --json number,state",
```

## Diff since red — Task 12 `.bkit/core/engine/commands/workflow/branches.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-12-11.snapshot b/.bkit/core/engine/commands/workflow/branches.test.ts
index cc2d6e04..5c4c9efd 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-12-11.snapshot
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -949,6 +949,7 @@ describe("branches push", { timeout: GIT_TIMEOUT }, () => {
       forced: true,
       skipped: null,
       prNumber: null,
+      replayed: false,
     });
     expect(remoteSha(origin, "feat/1-x")).toBe(sha(clone));
     // A rebased (rewritten) branch still pushes: that is what the lease is for.
@@ -1046,6 +1047,7 @@ describe("branches push", { timeout: GIT_TIMEOUT }, () => {
       forced: false,
       skipped: "open-pr",
       prNumber: 12,
+      replayed: false,
     });
     expect(fs.readFileSync(log, "utf-8")).toContain(
       "pr list --head feat/1-x --state open --json number,state",
@@ -1193,9 +1195,15 @@ describe(
         '#!/bin/sh\necho "dev is protected" >&2\nexit 1\n',
         { mode: 0o755 },
       );
-      const r = await run(clone, ["push", "--mode=dev"]);
+      const calls = path.join(tmp("calls"), "git");
+      const bin = stubBin({
+        git: `[ "$1" = push ] && echo "$*" >> "${calls}"\nexec "${REAL_GIT}" "$@"`,
+      });
+      const r = await run(clone, ["push", "--mode=dev"], { PATH: withBin(bin) });
       expect(r.code).toBe(8);
       expect(r.err).toContain("dev is protected");
+      // The one push went out of the throwaway checkout as HEAD:dev, not from the main checkout.
+      expect(fs.readFileSync(calls, "utf-8")).toBe("push origin HEAD:dev\n");
       expect(r.json).toMatchObject({ pushed: false, ref: null, sha: null });
       expect(fs.existsSync(path.join(clone, ".worktrees", `_land-${FID}`))).toBe(false);
     });
```

## Diff since red — Task 12 `.bkit/core/engine/commands/workflow/branches.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-12-12.snapshot b/.bkit/core/engine/commands/workflow/branches.test.ts
index cc2d6e04..5c4c9efd 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-12-12.snapshot
+++ b/.bkit/core/engine/commands/workflow/branches.test.ts
@@ -949,6 +949,7 @@ describe("branches push", { timeout: GIT_TIMEOUT }, () => {
       forced: true,
       skipped: null,
       prNumber: null,
+      replayed: false,
     });
     expect(remoteSha(origin, "feat/1-x")).toBe(sha(clone));
     // A rebased (rewritten) branch still pushes: that is what the lease is for.
@@ -1046,6 +1047,7 @@ describe("branches push", { timeout: GIT_TIMEOUT }, () => {
       forced: false,
       skipped: "open-pr",
       prNumber: 12,
+      replayed: false,
     });
     expect(fs.readFileSync(log, "utf-8")).toContain(
       "pr list --head feat/1-x --state open --json number,state",
@@ -1193,9 +1195,15 @@ describe(
         '#!/bin/sh\necho "dev is protected" >&2\nexit 1\n',
         { mode: 0o755 },
       );
-      const r = await run(clone, ["push", "--mode=dev"]);
+      const calls = path.join(tmp("calls"), "git");
+      const bin = stubBin({
+        git: `[ "$1" = push ] && echo "$*" >> "${calls}"\nexec "${REAL_GIT}" "$@"`,
+      });
+      const r = await run(clone, ["push", "--mode=dev"], { PATH: withBin(bin) });
       expect(r.code).toBe(8);
       expect(r.err).toContain("dev is protected");
+      // The one push went out of the throwaway checkout as HEAD:dev, not from the main checkout.
+      expect(fs.readFileSync(calls, "utf-8")).toBe("push origin HEAD:dev\n");
       expect(r.json).toMatchObject({ pushed: false, ref: null, sha: null });
       expect(fs.existsSync(path.join(clone, ".worktrees", `_land-${FID}`))).toBe(false);
     });
```
