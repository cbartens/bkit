Enforced: true
Gaps: 26
Test order only: true

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
| 2 | `.bkit/core/engine/commands/workflow/runs.test.ts` "runs context refuses an issue-less marker and branch naming the missing issue" | recorded 2026-10-22T05:47:09Z | no | passed |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "gate --issue="" fails the fid check for 123-fix under github" | recorded 2026-10-22T03:00:06Z | added lines only | passed |
| 3 | `.bkit/core/engine/commands/workflow/steps.test.ts` "gate --issue="" passes the fid check for dev-ci-failures under github" | recorded 2026-10-22T03:00:10Z | added lines only | passed |
| 4 | `.bkit/core/engine/commands/workflow/prs.test.ts` "prMarker writes a FID-only marker with github wired and no issue" | recorded 2026-10-22T03:03:56Z | no | passed |
| 4 | `.bkit/core/engine/commands/workflow/prs.test.ts` "prs open refuses --base=main" | recorded 2026-10-22T03:04:04Z | no | passed |
| 4 | `.bkit/core/engine/commands/workflow/prs.test.ts` "prs merge refuses a PR whose base is main" | recorded 2026-10-22T03:04:11Z | no | passed |
| 4 | `.bkit/core/engine/commands/workflow/prs.test.ts` "prs merge refuses when the PR base is unknown" | recorded 2026-10-22T03:04:19Z | no | passed |
| 4 | `.bkit/core/engine/commands/workflow/branches.test.ts` "landPr refuses a main-based PR without retrying" | recorded 2026-10-22T03:04:46Z | yes | passed |
| 4 | `.bkit/core/engine/commands/workflow/branches.test.ts` "landPr refuses when the PR base is unknown" | recorded 2026-10-22T03:05:13Z | yes | passed |
| 4 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "closePr refuses when the PR base is unknown" | recorded 2026-10-22T03:05:27Z | added lines only | passed |
| 4 | `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` "lands an issue-less run with a FID-only marker" | recorded 2026-10-22T03:05:36Z | yes | passed |
| 5 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "ship on dev refuses with the releases-stay-manual text" | recorded 2026-10-22T03:08:31Z | added lines only | passed |
| 5 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "ship names a missing feat branch" | recorded 2026-10-22T03:08:34Z | added lines only | passed |
| 5 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "build in place on main is refused" | recorded 2026-10-22T03:08:38Z | added lines only | passed |
| 5 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "design and plan in place on main are refused" | recorded 2026-10-22T03:08:41Z | added lines only | passed |
| 11 | `.bkit/core/engine/commands/workflow/steps.test.ts` "writeStepRow with a shared-checkout record never commits a recorded path" | recorded 2026-10-22T05:43:21Z | yes | passed |
| 11 | `.bkit/core/engine/commands/workflow/steps.test.ts` "writeStepRow refuses when a recorded path changed" | recorded 2026-10-22T05:43:43Z | yes | passed |
| 11 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "stageTrackedUpdates skips recorded paths" | recorded 2026-10-22T05:43:58Z | no | passed |
| 11 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "in-place debug on dev writes the shared-checkout record" | recorded 2026-10-22T05:44:19Z | added lines only | passed |
| 11 | `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` "foreign staged and untracked files survive a run commit" | recorded 2026-10-22T05:44:29Z | yes | passed |
| 11 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "in-place debug on dev returns startSha and aheadAtStart" | recorded 2026-10-22T05:44:40Z | added lines only | passed |
| 11 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "a new run of the same FID rewrites startSha" | recorded 2026-10-22T05:44:50Z | added lines only | passed |
| 11 | `.bkit/core/engine/commands/workflow/steps.test.ts` "writeStepRow appends its commit sha to the record" | recorded 2026-10-22T05:44:59Z | yes | passed |
| 11 | `.bkit/core/engine/commands/workflow/steps.test.ts` "a hook-refused own-path commit exits without staging a recorded path" | recorded 2026-10-22T05:45:07Z | yes | passed |
| 11 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "a recorded ledger commits only the rows the run appended" | recorded 2026-10-22T05:45:13Z | no | passed |
| 11 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "close with a shared-checkout record never commits a recorded path" | recorded 2026-10-22T05:45:33Z | no | passed |
| 11 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "record is present after workflows close and before the push" | recorded 2026-10-22T05:45:50Z | no | passed |
| 11 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "failed handover from dev removes the record and keeps recorded paths" | recorded 2026-10-22T05:46:08Z | no | passed |
| 11 | `.bkit/core/engine/commands/workflow/locks.test.ts` "locks release removes the FID shared-checkout record" | recorded 2026-10-22T05:46:10Z | no | passed |
| 11 | `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` "close commit tree excludes foreign files" | recorded 2026-10-22T05:46:13Z | yes | passed |
| 11 | `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` "debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not" | recorded 2026-10-22T05:46:18Z | yes | passed |
| 11 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock" | recorded 2026-10-22T05:46:24Z | added lines only | passed |
| 11 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "a stale record without a lock is replaced" | recorded 2026-10-22T05:46:33Z | added lines only | passed |
| 11 | `.bkit/core/engine/commands/workflow/worktrees.test.ts` "a resume of the same FID reuses the record" | recorded 2026-10-22T05:46:40Z | added lines only | passed |
| 11 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "commitBookkeeping refuses when a recorded path changed" | recorded 2026-10-22T05:46:44Z | no | passed |
| 12 | `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` "push from an ahead local dev lands only the run commits" | recorded 2026-10-22T03:19:25Z | yes | passed |
| 12 | `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` "push from a level local dev is a plain push" | recorded 2026-10-22T03:19:30Z | yes | passed |
| 12 | `.bkit/core/engine/commands/land.test.ts` "pushToDev replays a commit range onto origin/dev" | recorded 2026-10-22T03:19:34Z | no | passed |
| 12 | `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` "a foreign commit made mid-run never reaches the remote" | recorded 2026-10-22T03:19:39Z | yes | passed |
| 12 | `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` "feature-mode push on dev with a record never pushes the foreign commit" | recorded 2026-10-22T03:19:43Z | yes | passed |
| 12 | `.bkit/core/engine/commands/workflow/branches.test.ts` "push after a replay reports the pushToDev sha not HEAD" | recorded 2026-10-22T03:20:27Z | yes | passed |
| 12 | `.bkit/core/engine/commands/land.test.ts` "pushToDev log line names what it lands" | recorded 2026-10-22T03:20:31Z | no | passed |
| 12 | `.bkit/core/engine/commands/workflow/branches.test.ts` "replay build callback cherry-picks exactly the recorded SHAs" | recorded 2026-10-22T03:21:01Z | yes | passed |
| 12 | `.bkit/core/engine/commands/workflow/branches.test.ts` "replay conflict exits non-zero naming the paths and removes the throwaway checkout" | recorded 2026-10-22T03:21:30Z | yes | passed |
| 12 | `.bkit/core/engine/commands/workflow/branches.test.ts` "a server-refused pushToDev exits EXIT_PUSH_FAILED naming the refusal" | recorded 2026-10-22T03:26:00Z | added lines only | passed |
| 12 | `.bkit/core/engine/commands/workflow/branches.test.ts` "skip-ci HEAD on the replay is refused" | recorded 2026-10-22T03:23:00Z | yes | passed |
| 12 | `.bkit/core/engine/commands/workflow/branches.test.ts` "abort mode on dev with a record pushes only recorded SHAs" | recorded 2026-10-22T03:24:14Z | yes | passed |
| 13 | `.bkit/core/engine/commands/workflow/runs.test.ts` "dispatch on dev with a pushed sha and no pr proves the run started" | recorded 2026-10-22T03:32:20Z | yes | passed |
| 13 | `.bkit/core/engine/commands/workflow/runs.test.ts` "re-trigger on dev with a record pushes through the own-commit push" | recorded 2026-10-22T03:32:42Z | yes | passed |
| 13 | `.bkit/core/engine/commands/workflow/runs.test.ts` "re-trigger on dev with a record never commits a foreign staged path" | recorded 2026-10-22T03:33:04Z | yes | passed |

## Gaps

- Task 1 `test-changed` — `.bkit/core/engine/commands/workflow/fids.test.ts` differs from its red snapshot for "check --issue="" accepts dev-ci-failures under github" (diff below)
- Task 1 `test-changed` — `.bkit/core/engine/commands/workflow/fids.test.ts` differs from its red snapshot for "check --issue="" rejects a FID with an all-digit word under every wired tracker" (diff below)
- Task 1 `test-changed` — `.bkit/core/engine/commands/workflow/fids.test.ts` differs from its red snapshot for "fidProblem with --issue absent matches today" (diff below)
- Task 1 `test-changed` — `.bkit/core/engine/commands/workflow/fids.test.ts` differs from its red snapshot for "check --tracker=any --issue="" applies the issue-less rule" (diff below)
- Task 4 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "landPr refuses a main-based PR without retrying" (diff below)
- Task 4 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "landPr refuses when the PR base is unknown" (diff below)
- Task 4 `test-changed` — `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts` differs from its red snapshot for "lands an issue-less run with a FID-only marker" (diff below)
- Task 11 `test-changed` — `.bkit/core/engine/commands/workflow/steps.test.ts` differs from its red snapshot for "writeStepRow with a shared-checkout record never commits a recorded path" (diff below)
- Task 11 `test-changed` — `.bkit/core/engine/commands/workflow/steps.test.ts` differs from its red snapshot for "writeStepRow refuses when a recorded path changed" (diff below)
- Task 11 `test-changed` — `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` differs from its red snapshot for "foreign staged and untracked files survive a run commit" (diff below)
- Task 11 `test-changed` — `.bkit/core/engine/commands/workflow/steps.test.ts` differs from its red snapshot for "writeStepRow appends its commit sha to the record" (diff below)
- Task 11 `test-changed` — `.bkit/core/engine/commands/workflow/steps.test.ts` differs from its red snapshot for "a hook-refused own-path commit exits without staging a recorded path" (diff below)
- Task 11 `test-changed` — `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` differs from its red snapshot for "close commit tree excludes foreign files" (diff below)
- Task 11 `test-changed` — `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` differs from its red snapshot for "debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not" (diff below)
- Task 12 `test-changed` — `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` differs from its red snapshot for "push from an ahead local dev lands only the run commits" (diff below)
- Task 12 `test-changed` — `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` differs from its red snapshot for "push from a level local dev is a plain push" (diff below)
- Task 12 `test-changed` — `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` differs from its red snapshot for "a foreign commit made mid-run never reaches the remote" (diff below)
- Task 12 `test-changed` — `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts` differs from its red snapshot for "feature-mode push on dev with a record never pushes the foreign commit" (diff below)
- Task 12 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "push after a replay reports the pushToDev sha not HEAD" (diff below)
- Task 12 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "replay build callback cherry-picks exactly the recorded SHAs" (diff below)
- Task 12 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "replay conflict exits non-zero naming the paths and removes the throwaway checkout" (diff below)
- Task 12 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "skip-ci HEAD on the replay is refused" (diff below)
- Task 12 `test-changed` — `.bkit/core/engine/commands/workflow/branches.test.ts` differs from its red snapshot for "abort mode on dev with a record pushes only recorded SHAs" (diff below)
- Task 13 `test-changed` — `.bkit/core/engine/commands/workflow/runs.test.ts` differs from its red snapshot for "dispatch on dev with a pushed sha and no pr proves the run started" (diff below)
- Task 13 `test-changed` — `.bkit/core/engine/commands/workflow/runs.test.ts` differs from its red snapshot for "re-trigger on dev with a record pushes through the own-commit push" (diff below)
- Task 13 `test-changed` — `.bkit/core/engine/commands/workflow/runs.test.ts` differs from its red snapshot for "re-trigger on dev with a record never commits a foreign staged path" (diff below)

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

## Diff since red — Task 3 `.bkit/core/engine/commands/workflow/steps.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-3-1.snapshot b/.bkit/core/engine/commands/workflow/steps.test.ts
index 4a8a6c4a..50dc32f2 100644
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
@@ -865,3 +880,85 @@ describe("bkit steps gate — placeholders, FID, derived attempt", () => {
     ).toBe(2);
   });
 });
+
+describe("bkit steps done — a run in place on dev that shares its checkout", () => {
+  const FID = "650-shared";
+  const LOGS = `docs/plans/202610/logs/${FID}`;
+
+  /** A repo on dev holding foreign work (modified, untracked, staged) and the run's record. */
+  function shared() {
+    const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-steps-shared-")));
+    dirs.push(cwd);
+    git(cwd, "init", "-q", "-b", "dev");
+    git(cwd, "config", "user.email", "t@t");
+    git(cwd, "config", "user.name", "t");
+    fs.mkdirSync(path.join(cwd, "src"));
+    write(cwd, "src/a.txt", "a\n");
+    write(cwd, "src/staged.txt", "s\n");
+    git(cwd, "add", "-A");
+    git(cwd, "commit", "-q", "-m", "base");
+    write(cwd, "src/a.txt", "a\nforeign\n");
+    write(cwd, "notes.md", "foreign notes\n");
+    write(cwd, "src/staged.txt", "s\nforeign\n");
+    git(cwd, "add", "src/staged.txt");
+    writeRecord(cwd, newRecord(cwd, FID, "dev"));
+    fs.mkdirSync(path.join(cwd, LOGS), { recursive: true });
+    write(cwd, `${LOGS}/verify-1.md`, "Verdict: PASS\nFailures: 0\n\n<!-- verdict:end -->\n");
+    return cwd;
+  }
+  const step = (cwd: string) =>
+    run(cwd, [
+      "steps",
+      "done",
+      `--file=${LOGS}/status.jsonl`,
+      "--workflow=debug",
+      "--step=debug-verify",
+      "--verdict=PASS",
+      "--failures=0",
+      `--artifact=${LOGS}/verify-1.md`,
+      `--message=chore(${FID}): verify`,
+    ]);
+  const committed = (cwd: string) =>
+    git(cwd, "show", "--name-only", "--format=", "HEAD").split("\n").sort();
+  const staged = (cwd: string) => git(cwd, "diff", "--cached", "--name-only");
+
+  it("writeStepRow with a shared-checkout record never commits a recorded path", async () => {
+    const cwd = shared();
+    const r = await step(cwd);
+    expect(r.code).toBe(0);
+    expect(committed(cwd)).toEqual([`${LOGS}/status.jsonl`, `${LOGS}/verify-1.md`]);
+    expect(staged(cwd)).toBe("src/staged.txt");
+    expect(fs.readFileSync(path.join(cwd, "src/a.txt"), "utf-8")).toBe("a\nforeign\n");
+  });
+
+  it("writeStepRow refuses when a recorded path changed", async () => {
+    const cwd = shared();
+    const head = git(cwd, "rev-parse", "HEAD");
+    write(cwd, "src/a.txt", "a\nforeign\nedited mid-run\n");
+    const r = await step(cwd);
+    expect(r.code).toBe(10);
+    expect(r.err).toContain("src/a.txt");
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
+  });
+
+  it("writeStepRow appends its commit sha to the record", async () => {
+    const cwd = shared();
+    const r = await step(cwd);
+    expect(r.code).toBe(0);
+    expect(readRecord(cwd, FID)?.commits).toEqual([git(cwd, "rev-parse", "HEAD")]);
+  });
+
+  it("a hook-refused own-path commit exits without staging a recorded path", async () => {
+    const cwd = shared();
+    const head = git(cwd, "rev-parse", "HEAD");
+    fs.mkdirSync(path.join(cwd, ".git/hooks"), { recursive: true });
+    write(cwd, ".git/hooks/pre-commit", "#!/bin/sh\necho blocked >&2\nexit 1\n");
+    fs.chmodSync(path.join(cwd, ".git/hooks/pre-commit"), 0o755);
+    const r = await step(cwd);
+    expect(r.code).toBe(8);
+    expect(r.err).toContain("blocked");
+    expect(staged(cwd)).toBe("src/staged.txt");
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
+    expect(readRecord(cwd, FID)).toMatchObject({ commits: [] });
+  });
+});
```

## Diff since red — Task 3 `.bkit/core/engine/commands/workflow/steps.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-3-2.snapshot b/.bkit/core/engine/commands/workflow/steps.test.ts
index 4a8a6c4a..50dc32f2 100644
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
@@ -865,3 +880,85 @@ describe("bkit steps gate — placeholders, FID, derived attempt", () => {
     ).toBe(2);
   });
 });
+
+describe("bkit steps done — a run in place on dev that shares its checkout", () => {
+  const FID = "650-shared";
+  const LOGS = `docs/plans/202610/logs/${FID}`;
+
+  /** A repo on dev holding foreign work (modified, untracked, staged) and the run's record. */
+  function shared() {
+    const cwd = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), "bkit-steps-shared-")));
+    dirs.push(cwd);
+    git(cwd, "init", "-q", "-b", "dev");
+    git(cwd, "config", "user.email", "t@t");
+    git(cwd, "config", "user.name", "t");
+    fs.mkdirSync(path.join(cwd, "src"));
+    write(cwd, "src/a.txt", "a\n");
+    write(cwd, "src/staged.txt", "s\n");
+    git(cwd, "add", "-A");
+    git(cwd, "commit", "-q", "-m", "base");
+    write(cwd, "src/a.txt", "a\nforeign\n");
+    write(cwd, "notes.md", "foreign notes\n");
+    write(cwd, "src/staged.txt", "s\nforeign\n");
+    git(cwd, "add", "src/staged.txt");
+    writeRecord(cwd, newRecord(cwd, FID, "dev"));
+    fs.mkdirSync(path.join(cwd, LOGS), { recursive: true });
+    write(cwd, `${LOGS}/verify-1.md`, "Verdict: PASS\nFailures: 0\n\n<!-- verdict:end -->\n");
+    return cwd;
+  }
+  const step = (cwd: string) =>
+    run(cwd, [
+      "steps",
+      "done",
+      `--file=${LOGS}/status.jsonl`,
+      "--workflow=debug",
+      "--step=debug-verify",
+      "--verdict=PASS",
+      "--failures=0",
+      `--artifact=${LOGS}/verify-1.md`,
+      `--message=chore(${FID}): verify`,
+    ]);
+  const committed = (cwd: string) =>
+    git(cwd, "show", "--name-only", "--format=", "HEAD").split("\n").sort();
+  const staged = (cwd: string) => git(cwd, "diff", "--cached", "--name-only");
+
+  it("writeStepRow with a shared-checkout record never commits a recorded path", async () => {
+    const cwd = shared();
+    const r = await step(cwd);
+    expect(r.code).toBe(0);
+    expect(committed(cwd)).toEqual([`${LOGS}/status.jsonl`, `${LOGS}/verify-1.md`]);
+    expect(staged(cwd)).toBe("src/staged.txt");
+    expect(fs.readFileSync(path.join(cwd, "src/a.txt"), "utf-8")).toBe("a\nforeign\n");
+  });
+
+  it("writeStepRow refuses when a recorded path changed", async () => {
+    const cwd = shared();
+    const head = git(cwd, "rev-parse", "HEAD");
+    write(cwd, "src/a.txt", "a\nforeign\nedited mid-run\n");
+    const r = await step(cwd);
+    expect(r.code).toBe(10);
+    expect(r.err).toContain("src/a.txt");
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
+  });
+
+  it("writeStepRow appends its commit sha to the record", async () => {
+    const cwd = shared();
+    const r = await step(cwd);
+    expect(r.code).toBe(0);
+    expect(readRecord(cwd, FID)?.commits).toEqual([git(cwd, "rev-parse", "HEAD")]);
+  });
+
+  it("a hook-refused own-path commit exits without staging a recorded path", async () => {
+    const cwd = shared();
+    const head = git(cwd, "rev-parse", "HEAD");
+    fs.mkdirSync(path.join(cwd, ".git/hooks"), { recursive: true });
+    write(cwd, ".git/hooks/pre-commit", "#!/bin/sh\necho blocked >&2\nexit 1\n");
+    fs.chmodSync(path.join(cwd, ".git/hooks/pre-commit"), 0o755);
+    const r = await step(cwd);
+    expect(r.code).toBe(8);
+    expect(r.err).toContain("blocked");
+    expect(staged(cwd)).toBe("src/staged.txt");
+    expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
+    expect(readRecord(cwd, FID)).toMatchObject({ commits: [] });
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
index 45ff72a7..5082e8be 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-4-7.snapshot
+++ b/.bkit/core/engine/commands/workflow/workflows.test.ts
@@ -7,6 +7,7 @@ import { afterEach, describe, expect, it, vi } from "vitest";

 import { validate } from "../../ledgers/telemetry";
 import { runCommand } from "../lib";
+import { newRecord, writeRecord } from "./ledgers";
 import { locksCommand } from "./locks";
 import { workflowsCommand } from "./workflows";

@@ -1319,3 +1320,103 @@ describe("bkit workflows links", () => {
     expect(r.json.comment).toBeNull();
   });
 });
+
+describe("bkit workflows close / handover — a debug run in place on dev that shares its checkout", () => {
+  const recordAt = (cwd: string) =>
+    path.resolve(cwd, git(cwd, "rev-parse", "--git-path", `bkit/shared-checkout/${FID}.json`));
+  const committed = (cwd: string) =>
+    git(cwd, "show", "--name-only", "--format=", "HEAD").split("\n");
+
+  /** dev with an open debug run, foreign work in flight, the run's record, and the run's own log. */
+  function shared() {
+    const cwd = repo();
+    write(
+      cwd,
+      `${REL}/status.jsonl`,
+      jsonl([{ type: "workflow-started", workflow: "debug", at: new Date().toISOString() }]),
+    );
+    git(cwd, "add", "-A");
+    git(cwd, "commit", "-qm", "start");
+    write(cwd, "a.txt", "base\nforeign\n");
+    write(cwd, "notes.md", "foreign notes\n");
+    writeRecord(cwd, newRecord(cwd, FID, "dev"));
+    write(cwd, `${REL}/verify-1.md`, "Verdict: PASS\n");
+    return cwd;
+  }
+  const close = (cwd: string) =>
+    run(cwd, wf("close", "debug", "--message=chore(12-export-csv): close-workflow"));
+
+  it("close with a shared-checkout record never commits a recorded path", async () => {
+    const cwd = shared();
+    const r = await close(cwd);
+    expect(r.code).toBe(0);
+    expect(committed(cwd)).toContain(`${REL}/verify-1.md`);
+    expect(committed(cwd)).not.toContain("a.txt");
+    expect(committed(cwd)).not.toContain("notes.md");
+    expect(fs.readFileSync(path.join(cwd, "a.txt"), "utf-8")).toBe("base\nforeign\n");
+    expect(git(cwd, "status", "--porcelain", "--", "a.txt", "notes.md").split("\n")).toHaveLength(
+      2,
+    );
+  });
+
+  it("record is present after workflows close and before the push", async () => {
+    const cwd = shared();
+    expect((await close(cwd)).code).toBe(0);
+    expect(fs.existsSync(recordAt(cwd))).toBe(true);
+    const rec = JSON.parse(fs.readFileSync(recordAt(cwd), "utf-8")) as { commits: string[] };
+    expect(rec.commits.at(-1)).toBe(git(cwd, "rev-parse", "HEAD"));
+  });
+
+  it("failed handover from dev removes the record and keeps recorded paths", async () => {
+    const cwd = repo();
+    const remote = fs.realpathSync(
+      fs.mkdtempSync(path.join(os.tmpdir(), "bkit-workflows-remote-")),
+    );
+    dirs.push(remote);
+    git(remote, "init", "-q", "--bare");
+    git(cwd, "remote", "set-url", "origin", remote);
+    write(cwd, "docs/decisions.jsonl", jsonl([{ key: "a" }]));
+    git(cwd, "add", "docs/decisions.jsonl");
+    git(cwd, "commit", "-qm", "ledger");
+    git(cwd, "push", "-q", "origin", "dev");
+    const start = Date.now() - 1000;
+    // A foreign row that looks like the run's own: same workflow, inside the run's window.
+    fs.appendFileSync(
+      path.join(cwd, "docs/decisions.jsonl"),
+      jsonl([{ key: "foreign", workflow: "debug", ts: start + 1 }]),
+    );
+    fs.mkdirSync(path.dirname(recordAt(cwd)), { recursive: true });
+    fs.writeFileSync(
+      recordAt(cwd),
+      JSON.stringify({
+        fid: FID,
+        branch: "dev",
+        startSha: git(cwd, "rev-parse", "HEAD"),
+        originSha: git(cwd, "rev-parse", "HEAD"),
+        aheadAtStart: 0,
+        paths: [
+          {
+            path: "docs/decisions.jsonl",
+            hash: git(cwd, "hash-object", "--", "docs/decisions.jsonl"),
+            lines: 2,
+          },
+        ],
+        commits: [],
+      }),
+    );
+    fs.appendFileSync(
+      path.join(cwd, "docs/decisions.jsonl"),
+      jsonl([{ key: "mine", workflow: "debug", ts: start + 2 }]),
+    );
+    write(cwd, `${REL}/status.jsonl`, startedThenFailed("debug", start));
+    const r = await run(cwd, wf("handover", "debug", `--month=${M}`, "--push"));
+    expect(r.code).toBe(0);
+    expect(fs.existsSync(recordAt(cwd))).toBe(false);
+    const left = fs.readFileSync(path.join(cwd, "docs/decisions.jsonl"), "utf-8");
+    expect(left).toContain('"foreign"');
+    expect(left).not.toContain('"mine"');
+    const onDev = git(remote, "show", "dev:docs/decisions.jsonl");
+    expect(onDev).toContain('"mine"');
+    expect(onDev).not.toContain('"foreign"');
+  });
+});
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
index c26f8435..6fb6318b 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-5-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -10,6 +10,8 @@ import * as path from "node:path";
 import { afterEach, describe, expect, it, vi } from "vitest";

 import { runCommand } from "../lib";
+import { COMMANDS } from "../registry";
+import { newRecord, writeRecord } from "./ledgers";
 import { ownershipMarker, worktreeDir, worktreesCommand } from "./worktrees";

 const FID = "42-thing";
@@ -197,6 +199,150 @@ describe("bkit worktrees setup — debug", () => {
   });
 });

+describe("bkit worktrees setup — debug in place on dev shares the checkout", () => {
+  const OTHER = "43-other";
+  const recordFile = (cwd: string, fid = FID) =>
+    path.resolve(cwd, git(cwd, "rev-parse", "--git-path", `bkit/shared-checkout/${fid}.json`));
+  const record = (cwd: string, fid = FID) =>
+    JSON.parse(fs.readFileSync(recordFile(cwd, fid), "utf-8")) as Record<string, unknown>;
+  const hashOf = (cwd: string, rel: string) => git(cwd, "hash-object", "--", rel);
+
+  async function bkit(cwd: string, ...argv: string[]) {
+    const out: string[] = [];
+    const code = await runCommand(argv, COMMANDS, {
+      classicVerbs: new Set(),
+      cwd,
+      io: { stdout: (t) => out.push(t), stderr: () => {} },
+    });
+    return { code, json: out.length ? JSON.parse(out.join("")) : undefined };
+  }
+  /** Take `fid`'s workflow lock and open its run, so the lock is live. */
+  async function liveRun(cwd: string, fid: string) {
+    const lock = await bkit(
+      cwd,
+      "locks",
+      "acquire",
+      "--kind=workflow",
+      "--workflow=debug",
+      `--fid=${fid}`,
+      `--month=${MONTH}`,
+    );
+    expect(lock.code).toBe(0);
+    const start = await bkit(
+      cwd,
+      "workflows",
+      "start",
+      "--workflow=debug",
+      `--fid=${fid}`,
+      `--month=${MONTH}`,
+      "--lock-held",
+      `--token=${lock.json.token}`,
+    );
+    expect(start.code).toBe(0);
+    // A run counts as live once it has stepped (locks.ts liveReason), as it has by Step 2's end.
+    const stepped = await bkit(
+      cwd,
+      "steps",
+      "done",
+      `--file=docs/plans/${MONTH}/logs/${fid}/status.jsonl`,
+      "--workflow=debug",
+      "--step=debug-start-workflow",
+      "--commit=none",
+    );
+    expect(stepped.code).toBe(0);
+  }
+
+  /** dev with a bare origin, one local commit beyond it, and foreign work in flight. */
+  function shared() {
+    const cwd = repo("dev");
+    const origin = `${cwd}-origin.git`;
+    dirs.push(origin);
+    git(cwd, "init", "-q", "--bare", "-b", "dev", origin);
+    fs.mkdirSync(path.join(cwd, "src"));
+    fs.mkdirSync(path.join(cwd, ".bkit"));
+    fs.writeFileSync(path.join(cwd, "src/a.txt"), "a\n");
+    fs.writeFileSync(path.join(cwd, ".bkit/issues.jsonl"), '{"id":"base"}\n');
+    git(cwd, "add", "src", ".bkit");
+    git(cwd, "commit", "-q", "-m", "base");
+    git(cwd, "remote", "add", "origin", origin);
+    git(cwd, "push", "-q", "-u", "origin", "dev");
+    git(cwd, "commit", "-q", "--allow-empty", "-m", "foreign local commit");
+    fs.writeFileSync(path.join(cwd, "src/a.txt"), "a\nforeign\n");
+    fs.writeFileSync(path.join(cwd, "notes.md"), "foreign notes\n");
+    fs.appendFileSync(path.join(cwd, ".bkit/issues.jsonl"), '{"id":"foreign"}\n');
+    return cwd;
+  }
+
+  it("in-place debug on dev writes the shared-checkout record", async () => {
+    const cwd = shared();
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(fs.existsSync(recordFile(cwd))).toBe(true);
+    const rec = record(cwd);
+    expect(rec).toMatchObject({
+      fid: FID,
+      branch: "dev",
+      startSha: git(cwd, "rev-parse", "HEAD"),
+      aheadAtStart: 1,
+      commits: [],
+    });
+    expect(rec.paths).toEqual(
+      expect.arrayContaining([
+        { path: "src/a.txt", hash: hashOf(cwd, "src/a.txt") },
+        { path: "notes.md", hash: hashOf(cwd, "notes.md") },
+        { path: ".bkit/issues.jsonl", hash: hashOf(cwd, ".bkit/issues.jsonl"), lines: 2 },
+      ]),
+    );
+  });
+
+  it("in-place debug on dev returns startSha and aheadAtStart", async () => {
+    const cwd = shared();
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ startSha: git(cwd, "rev-parse", "HEAD"), aheadAtStart: 1 });
+  });
+
+  it("a new run of the same FID rewrites startSha", async () => {
+    const cwd = shared();
+    await setup(cwd, "debug");
+    git(cwd, "commit", "-q", "--allow-empty", "-m", "another foreign commit");
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(record(cwd).startSha).toBe(git(cwd, "rev-parse", "HEAD"));
+    expect(r.json.aheadAtStart).toBe(2);
+  });
+
+  it("a resume of the same FID reuses the record", async () => {
+    const cwd = shared();
+    await setup(cwd, "debug");
+    const first = fs.readFileSync(recordFile(cwd), "utf-8");
+    await liveRun(cwd, FID);
+    git(cwd, "commit", "-q", "--allow-empty", "-m", "the run's own commit");
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(fs.readFileSync(recordFile(cwd), "utf-8")).toBe(first);
+  });
+
+  it("setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock", async () => {
+    const cwd = shared();
+    writeRecord(cwd, newRecord(cwd, OTHER, "dev"));
+    await liveRun(cwd, OTHER);
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(13);
+    expect(r.err).toContain(OTHER);
+    expect(fs.existsSync(recordFile(cwd))).toBe(false);
+  });
+
+  it("a stale record without a lock is replaced", async () => {
+    const cwd = shared();
+    writeRecord(cwd, newRecord(cwd, OTHER, "dev"));
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(fs.existsSync(recordFile(cwd))).toBe(true);
+    expect(fs.existsSync(recordFile(cwd, OTHER))).toBe(false);
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
index c26f8435..6fb6318b 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-5-2.snapshot
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -10,6 +10,8 @@ import * as path from "node:path";
 import { afterEach, describe, expect, it, vi } from "vitest";

 import { runCommand } from "../lib";
+import { COMMANDS } from "../registry";
+import { newRecord, writeRecord } from "./ledgers";
 import { ownershipMarker, worktreeDir, worktreesCommand } from "./worktrees";

 const FID = "42-thing";
@@ -197,6 +199,150 @@ describe("bkit worktrees setup — debug", () => {
   });
 });

+describe("bkit worktrees setup — debug in place on dev shares the checkout", () => {
+  const OTHER = "43-other";
+  const recordFile = (cwd: string, fid = FID) =>
+    path.resolve(cwd, git(cwd, "rev-parse", "--git-path", `bkit/shared-checkout/${fid}.json`));
+  const record = (cwd: string, fid = FID) =>
+    JSON.parse(fs.readFileSync(recordFile(cwd, fid), "utf-8")) as Record<string, unknown>;
+  const hashOf = (cwd: string, rel: string) => git(cwd, "hash-object", "--", rel);
+
+  async function bkit(cwd: string, ...argv: string[]) {
+    const out: string[] = [];
+    const code = await runCommand(argv, COMMANDS, {
+      classicVerbs: new Set(),
+      cwd,
+      io: { stdout: (t) => out.push(t), stderr: () => {} },
+    });
+    return { code, json: out.length ? JSON.parse(out.join("")) : undefined };
+  }
+  /** Take `fid`'s workflow lock and open its run, so the lock is live. */
+  async function liveRun(cwd: string, fid: string) {
+    const lock = await bkit(
+      cwd,
+      "locks",
+      "acquire",
+      "--kind=workflow",
+      "--workflow=debug",
+      `--fid=${fid}`,
+      `--month=${MONTH}`,
+    );
+    expect(lock.code).toBe(0);
+    const start = await bkit(
+      cwd,
+      "workflows",
+      "start",
+      "--workflow=debug",
+      `--fid=${fid}`,
+      `--month=${MONTH}`,
+      "--lock-held",
+      `--token=${lock.json.token}`,
+    );
+    expect(start.code).toBe(0);
+    // A run counts as live once it has stepped (locks.ts liveReason), as it has by Step 2's end.
+    const stepped = await bkit(
+      cwd,
+      "steps",
+      "done",
+      `--file=docs/plans/${MONTH}/logs/${fid}/status.jsonl`,
+      "--workflow=debug",
+      "--step=debug-start-workflow",
+      "--commit=none",
+    );
+    expect(stepped.code).toBe(0);
+  }
+
+  /** dev with a bare origin, one local commit beyond it, and foreign work in flight. */
+  function shared() {
+    const cwd = repo("dev");
+    const origin = `${cwd}-origin.git`;
+    dirs.push(origin);
+    git(cwd, "init", "-q", "--bare", "-b", "dev", origin);
+    fs.mkdirSync(path.join(cwd, "src"));
+    fs.mkdirSync(path.join(cwd, ".bkit"));
+    fs.writeFileSync(path.join(cwd, "src/a.txt"), "a\n");
+    fs.writeFileSync(path.join(cwd, ".bkit/issues.jsonl"), '{"id":"base"}\n');
+    git(cwd, "add", "src", ".bkit");
+    git(cwd, "commit", "-q", "-m", "base");
+    git(cwd, "remote", "add", "origin", origin);
+    git(cwd, "push", "-q", "-u", "origin", "dev");
+    git(cwd, "commit", "-q", "--allow-empty", "-m", "foreign local commit");
+    fs.writeFileSync(path.join(cwd, "src/a.txt"), "a\nforeign\n");
+    fs.writeFileSync(path.join(cwd, "notes.md"), "foreign notes\n");
+    fs.appendFileSync(path.join(cwd, ".bkit/issues.jsonl"), '{"id":"foreign"}\n');
+    return cwd;
+  }
+
+  it("in-place debug on dev writes the shared-checkout record", async () => {
+    const cwd = shared();
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(fs.existsSync(recordFile(cwd))).toBe(true);
+    const rec = record(cwd);
+    expect(rec).toMatchObject({
+      fid: FID,
+      branch: "dev",
+      startSha: git(cwd, "rev-parse", "HEAD"),
+      aheadAtStart: 1,
+      commits: [],
+    });
+    expect(rec.paths).toEqual(
+      expect.arrayContaining([
+        { path: "src/a.txt", hash: hashOf(cwd, "src/a.txt") },
+        { path: "notes.md", hash: hashOf(cwd, "notes.md") },
+        { path: ".bkit/issues.jsonl", hash: hashOf(cwd, ".bkit/issues.jsonl"), lines: 2 },
+      ]),
+    );
+  });
+
+  it("in-place debug on dev returns startSha and aheadAtStart", async () => {
+    const cwd = shared();
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ startSha: git(cwd, "rev-parse", "HEAD"), aheadAtStart: 1 });
+  });
+
+  it("a new run of the same FID rewrites startSha", async () => {
+    const cwd = shared();
+    await setup(cwd, "debug");
+    git(cwd, "commit", "-q", "--allow-empty", "-m", "another foreign commit");
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(record(cwd).startSha).toBe(git(cwd, "rev-parse", "HEAD"));
+    expect(r.json.aheadAtStart).toBe(2);
+  });
+
+  it("a resume of the same FID reuses the record", async () => {
+    const cwd = shared();
+    await setup(cwd, "debug");
+    const first = fs.readFileSync(recordFile(cwd), "utf-8");
+    await liveRun(cwd, FID);
+    git(cwd, "commit", "-q", "--allow-empty", "-m", "the run's own commit");
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(fs.readFileSync(recordFile(cwd), "utf-8")).toBe(first);
+  });
+
+  it("setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock", async () => {
+    const cwd = shared();
+    writeRecord(cwd, newRecord(cwd, OTHER, "dev"));
+    await liveRun(cwd, OTHER);
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(13);
+    expect(r.err).toContain(OTHER);
+    expect(fs.existsSync(recordFile(cwd))).toBe(false);
+  });
+
+  it("a stale record without a lock is replaced", async () => {
+    const cwd = shared();
+    writeRecord(cwd, newRecord(cwd, OTHER, "dev"));
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(fs.existsSync(recordFile(cwd))).toBe(true);
+    expect(fs.existsSync(recordFile(cwd, OTHER))).toBe(false);
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
index c26f8435..6fb6318b 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-5-3.snapshot
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -10,6 +10,8 @@ import * as path from "node:path";
 import { afterEach, describe, expect, it, vi } from "vitest";

 import { runCommand } from "../lib";
+import { COMMANDS } from "../registry";
+import { newRecord, writeRecord } from "./ledgers";
 import { ownershipMarker, worktreeDir, worktreesCommand } from "./worktrees";

 const FID = "42-thing";
@@ -197,6 +199,150 @@ describe("bkit worktrees setup — debug", () => {
   });
 });

+describe("bkit worktrees setup — debug in place on dev shares the checkout", () => {
+  const OTHER = "43-other";
+  const recordFile = (cwd: string, fid = FID) =>
+    path.resolve(cwd, git(cwd, "rev-parse", "--git-path", `bkit/shared-checkout/${fid}.json`));
+  const record = (cwd: string, fid = FID) =>
+    JSON.parse(fs.readFileSync(recordFile(cwd, fid), "utf-8")) as Record<string, unknown>;
+  const hashOf = (cwd: string, rel: string) => git(cwd, "hash-object", "--", rel);
+
+  async function bkit(cwd: string, ...argv: string[]) {
+    const out: string[] = [];
+    const code = await runCommand(argv, COMMANDS, {
+      classicVerbs: new Set(),
+      cwd,
+      io: { stdout: (t) => out.push(t), stderr: () => {} },
+    });
+    return { code, json: out.length ? JSON.parse(out.join("")) : undefined };
+  }
+  /** Take `fid`'s workflow lock and open its run, so the lock is live. */
+  async function liveRun(cwd: string, fid: string) {
+    const lock = await bkit(
+      cwd,
+      "locks",
+      "acquire",
+      "--kind=workflow",
+      "--workflow=debug",
+      `--fid=${fid}`,
+      `--month=${MONTH}`,
+    );
+    expect(lock.code).toBe(0);
+    const start = await bkit(
+      cwd,
+      "workflows",
+      "start",
+      "--workflow=debug",
+      `--fid=${fid}`,
+      `--month=${MONTH}`,
+      "--lock-held",
+      `--token=${lock.json.token}`,
+    );
+    expect(start.code).toBe(0);
+    // A run counts as live once it has stepped (locks.ts liveReason), as it has by Step 2's end.
+    const stepped = await bkit(
+      cwd,
+      "steps",
+      "done",
+      `--file=docs/plans/${MONTH}/logs/${fid}/status.jsonl`,
+      "--workflow=debug",
+      "--step=debug-start-workflow",
+      "--commit=none",
+    );
+    expect(stepped.code).toBe(0);
+  }
+
+  /** dev with a bare origin, one local commit beyond it, and foreign work in flight. */
+  function shared() {
+    const cwd = repo("dev");
+    const origin = `${cwd}-origin.git`;
+    dirs.push(origin);
+    git(cwd, "init", "-q", "--bare", "-b", "dev", origin);
+    fs.mkdirSync(path.join(cwd, "src"));
+    fs.mkdirSync(path.join(cwd, ".bkit"));
+    fs.writeFileSync(path.join(cwd, "src/a.txt"), "a\n");
+    fs.writeFileSync(path.join(cwd, ".bkit/issues.jsonl"), '{"id":"base"}\n');
+    git(cwd, "add", "src", ".bkit");
+    git(cwd, "commit", "-q", "-m", "base");
+    git(cwd, "remote", "add", "origin", origin);
+    git(cwd, "push", "-q", "-u", "origin", "dev");
+    git(cwd, "commit", "-q", "--allow-empty", "-m", "foreign local commit");
+    fs.writeFileSync(path.join(cwd, "src/a.txt"), "a\nforeign\n");
+    fs.writeFileSync(path.join(cwd, "notes.md"), "foreign notes\n");
+    fs.appendFileSync(path.join(cwd, ".bkit/issues.jsonl"), '{"id":"foreign"}\n');
+    return cwd;
+  }
+
+  it("in-place debug on dev writes the shared-checkout record", async () => {
+    const cwd = shared();
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(fs.existsSync(recordFile(cwd))).toBe(true);
+    const rec = record(cwd);
+    expect(rec).toMatchObject({
+      fid: FID,
+      branch: "dev",
+      startSha: git(cwd, "rev-parse", "HEAD"),
+      aheadAtStart: 1,
+      commits: [],
+    });
+    expect(rec.paths).toEqual(
+      expect.arrayContaining([
+        { path: "src/a.txt", hash: hashOf(cwd, "src/a.txt") },
+        { path: "notes.md", hash: hashOf(cwd, "notes.md") },
+        { path: ".bkit/issues.jsonl", hash: hashOf(cwd, ".bkit/issues.jsonl"), lines: 2 },
+      ]),
+    );
+  });
+
+  it("in-place debug on dev returns startSha and aheadAtStart", async () => {
+    const cwd = shared();
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ startSha: git(cwd, "rev-parse", "HEAD"), aheadAtStart: 1 });
+  });
+
+  it("a new run of the same FID rewrites startSha", async () => {
+    const cwd = shared();
+    await setup(cwd, "debug");
+    git(cwd, "commit", "-q", "--allow-empty", "-m", "another foreign commit");
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(record(cwd).startSha).toBe(git(cwd, "rev-parse", "HEAD"));
+    expect(r.json.aheadAtStart).toBe(2);
+  });
+
+  it("a resume of the same FID reuses the record", async () => {
+    const cwd = shared();
+    await setup(cwd, "debug");
+    const first = fs.readFileSync(recordFile(cwd), "utf-8");
+    await liveRun(cwd, FID);
+    git(cwd, "commit", "-q", "--allow-empty", "-m", "the run's own commit");
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(fs.readFileSync(recordFile(cwd), "utf-8")).toBe(first);
+  });
+
+  it("setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock", async () => {
+    const cwd = shared();
+    writeRecord(cwd, newRecord(cwd, OTHER, "dev"));
+    await liveRun(cwd, OTHER);
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(13);
+    expect(r.err).toContain(OTHER);
+    expect(fs.existsSync(recordFile(cwd))).toBe(false);
+  });
+
+  it("a stale record without a lock is replaced", async () => {
+    const cwd = shared();
+    writeRecord(cwd, newRecord(cwd, OTHER, "dev"));
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(fs.existsSync(recordFile(cwd))).toBe(true);
+    expect(fs.existsSync(recordFile(cwd, OTHER))).toBe(false);
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
index c26f8435..6fb6318b 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-5-4.snapshot
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -10,6 +10,8 @@ import * as path from "node:path";
 import { afterEach, describe, expect, it, vi } from "vitest";

 import { runCommand } from "../lib";
+import { COMMANDS } from "../registry";
+import { newRecord, writeRecord } from "./ledgers";
 import { ownershipMarker, worktreeDir, worktreesCommand } from "./worktrees";

 const FID = "42-thing";
@@ -197,6 +199,150 @@ describe("bkit worktrees setup — debug", () => {
   });
 });

+describe("bkit worktrees setup — debug in place on dev shares the checkout", () => {
+  const OTHER = "43-other";
+  const recordFile = (cwd: string, fid = FID) =>
+    path.resolve(cwd, git(cwd, "rev-parse", "--git-path", `bkit/shared-checkout/${fid}.json`));
+  const record = (cwd: string, fid = FID) =>
+    JSON.parse(fs.readFileSync(recordFile(cwd, fid), "utf-8")) as Record<string, unknown>;
+  const hashOf = (cwd: string, rel: string) => git(cwd, "hash-object", "--", rel);
+
+  async function bkit(cwd: string, ...argv: string[]) {
+    const out: string[] = [];
+    const code = await runCommand(argv, COMMANDS, {
+      classicVerbs: new Set(),
+      cwd,
+      io: { stdout: (t) => out.push(t), stderr: () => {} },
+    });
+    return { code, json: out.length ? JSON.parse(out.join("")) : undefined };
+  }
+  /** Take `fid`'s workflow lock and open its run, so the lock is live. */
+  async function liveRun(cwd: string, fid: string) {
+    const lock = await bkit(
+      cwd,
+      "locks",
+      "acquire",
+      "--kind=workflow",
+      "--workflow=debug",
+      `--fid=${fid}`,
+      `--month=${MONTH}`,
+    );
+    expect(lock.code).toBe(0);
+    const start = await bkit(
+      cwd,
+      "workflows",
+      "start",
+      "--workflow=debug",
+      `--fid=${fid}`,
+      `--month=${MONTH}`,
+      "--lock-held",
+      `--token=${lock.json.token}`,
+    );
+    expect(start.code).toBe(0);
+    // A run counts as live once it has stepped (locks.ts liveReason), as it has by Step 2's end.
+    const stepped = await bkit(
+      cwd,
+      "steps",
+      "done",
+      `--file=docs/plans/${MONTH}/logs/${fid}/status.jsonl`,
+      "--workflow=debug",
+      "--step=debug-start-workflow",
+      "--commit=none",
+    );
+    expect(stepped.code).toBe(0);
+  }
+
+  /** dev with a bare origin, one local commit beyond it, and foreign work in flight. */
+  function shared() {
+    const cwd = repo("dev");
+    const origin = `${cwd}-origin.git`;
+    dirs.push(origin);
+    git(cwd, "init", "-q", "--bare", "-b", "dev", origin);
+    fs.mkdirSync(path.join(cwd, "src"));
+    fs.mkdirSync(path.join(cwd, ".bkit"));
+    fs.writeFileSync(path.join(cwd, "src/a.txt"), "a\n");
+    fs.writeFileSync(path.join(cwd, ".bkit/issues.jsonl"), '{"id":"base"}\n');
+    git(cwd, "add", "src", ".bkit");
+    git(cwd, "commit", "-q", "-m", "base");
+    git(cwd, "remote", "add", "origin", origin);
+    git(cwd, "push", "-q", "-u", "origin", "dev");
+    git(cwd, "commit", "-q", "--allow-empty", "-m", "foreign local commit");
+    fs.writeFileSync(path.join(cwd, "src/a.txt"), "a\nforeign\n");
+    fs.writeFileSync(path.join(cwd, "notes.md"), "foreign notes\n");
+    fs.appendFileSync(path.join(cwd, ".bkit/issues.jsonl"), '{"id":"foreign"}\n');
+    return cwd;
+  }
+
+  it("in-place debug on dev writes the shared-checkout record", async () => {
+    const cwd = shared();
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(fs.existsSync(recordFile(cwd))).toBe(true);
+    const rec = record(cwd);
+    expect(rec).toMatchObject({
+      fid: FID,
+      branch: "dev",
+      startSha: git(cwd, "rev-parse", "HEAD"),
+      aheadAtStart: 1,
+      commits: [],
+    });
+    expect(rec.paths).toEqual(
+      expect.arrayContaining([
+        { path: "src/a.txt", hash: hashOf(cwd, "src/a.txt") },
+        { path: "notes.md", hash: hashOf(cwd, "notes.md") },
+        { path: ".bkit/issues.jsonl", hash: hashOf(cwd, ".bkit/issues.jsonl"), lines: 2 },
+      ]),
+    );
+  });
+
+  it("in-place debug on dev returns startSha and aheadAtStart", async () => {
+    const cwd = shared();
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(r.json).toMatchObject({ startSha: git(cwd, "rev-parse", "HEAD"), aheadAtStart: 1 });
+  });
+
+  it("a new run of the same FID rewrites startSha", async () => {
+    const cwd = shared();
+    await setup(cwd, "debug");
+    git(cwd, "commit", "-q", "--allow-empty", "-m", "another foreign commit");
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(record(cwd).startSha).toBe(git(cwd, "rev-parse", "HEAD"));
+    expect(r.json.aheadAtStart).toBe(2);
+  });
+
+  it("a resume of the same FID reuses the record", async () => {
+    const cwd = shared();
+    await setup(cwd, "debug");
+    const first = fs.readFileSync(recordFile(cwd), "utf-8");
+    await liveRun(cwd, FID);
+    git(cwd, "commit", "-q", "--allow-empty", "-m", "the run's own commit");
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(fs.readFileSync(recordFile(cwd), "utf-8")).toBe(first);
+  });
+
+  it("setup refuses with EXIT_SHARED_BUSY when another FID has a record and a live lock", async () => {
+    const cwd = shared();
+    writeRecord(cwd, newRecord(cwd, OTHER, "dev"));
+    await liveRun(cwd, OTHER);
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(13);
+    expect(r.err).toContain(OTHER);
+    expect(fs.existsSync(recordFile(cwd))).toBe(false);
+  });
+
+  it("a stale record without a lock is replaced", async () => {
+    const cwd = shared();
+    writeRecord(cwd, newRecord(cwd, OTHER, "dev"));
+    const r = await setup(cwd, "debug");
+    expect(r.code).toBe(0);
+    expect(fs.existsSync(recordFile(cwd))).toBe(true);
+    expect(fs.existsSync(recordFile(cwd, OTHER))).toBe(false);
+  });
+});
+
 describe("bkit worktrees setup — ship branch", () => {
   it("ships the prompt-named branch, else feat/{fid} when it exists, else the session branch", async () => {
     const cwd = repo("claude/work");
```

## Diff since red — Task 11 `.bkit/core/engine/commands/workflow/steps.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-1.snapshot b/.bkit/core/engine/commands/workflow/steps.test.ts
index 43f1c5d5..50dc32f2 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -959,6 +959,6 @@ describe("bkit steps done — a run in place on dev that shares its checkout", (
     expect(r.err).toContain("blocked");
     expect(staged(cwd)).toBe("src/staged.txt");
     expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
-    expect(readRecord(cwd, FID)?.commits ?? []).toEqual([]);
+    expect(readRecord(cwd, FID)).toMatchObject({ commits: [] });
   });
 });
```

## Diff since red — Task 11 `.bkit/core/engine/commands/workflow/steps.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-2.snapshot b/.bkit/core/engine/commands/workflow/steps.test.ts
index 43f1c5d5..50dc32f2 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-2.snapshot
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -959,6 +959,6 @@ describe("bkit steps done — a run in place on dev that shares its checkout", (
     expect(r.err).toContain("blocked");
     expect(staged(cwd)).toBe("src/staged.txt");
     expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
-    expect(readRecord(cwd, FID)?.commits ?? []).toEqual([]);
+    expect(readRecord(cwd, FID)).toMatchObject({ commits: [] });
   });
 });
```

## Diff since red — Task 11 `.bkit/core/engine/commands/workflow/worktrees.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-4.snapshot b/.bkit/core/engine/commands/workflow/worktrees.test.ts
index 5dddd8ce..6fb6318b 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-4.snapshot
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -239,6 +239,17 @@ describe("bkit worktrees setup — debug in place on dev shares the checkout", (
       `--token=${lock.json.token}`,
     );
     expect(start.code).toBe(0);
+    // A run counts as live once it has stepped (locks.ts liveReason), as it has by Step 2's end.
+    const stepped = await bkit(
+      cwd,
+      "steps",
+      "done",
+      `--file=docs/plans/${MONTH}/logs/${fid}/status.jsonl`,
+      "--workflow=debug",
+      "--step=debug-start-workflow",
+      "--commit=none",
+    );
+    expect(stepped.code).toBe(0);
   }

   /** dev with a bare origin, one local commit beyond it, and foreign work in flight. */
```

## Diff since red — Task 11 `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-5.snapshot b/.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts
index 4214e331..a47bea83 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-5.snapshot
+++ b/.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts
@@ -270,7 +270,10 @@ describe("the commits of a debug run in place on dev carry only the run's own pa
     const committed = git(cwd, "show", `HEAD:${ISSUES}`)
       .split("\n")
       .map((l) => JSON.parse(l) as Record<string, unknown>);
-    expect(committed.map((r) => r.id ?? r.key)).toEqual(["base", FID]);
+    expect(committed).toEqual([
+      expect.objectContaining({ id: "base" }),
+      expect.objectContaining({ key: FID }),
+    ]);
     expect(read(cwd, ISSUES)).toContain('"id":"foreign-row"');
   });
 });
```

## Diff since red — Task 11 `.bkit/core/engine/commands/workflow/worktrees.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-6.snapshot b/.bkit/core/engine/commands/workflow/worktrees.test.ts
index 5dddd8ce..6fb6318b 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-6.snapshot
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -239,6 +239,17 @@ describe("bkit worktrees setup — debug in place on dev shares the checkout", (
       `--token=${lock.json.token}`,
     );
     expect(start.code).toBe(0);
+    // A run counts as live once it has stepped (locks.ts liveReason), as it has by Step 2's end.
+    const stepped = await bkit(
+      cwd,
+      "steps",
+      "done",
+      `--file=docs/plans/${MONTH}/logs/${fid}/status.jsonl`,
+      "--workflow=debug",
+      "--step=debug-start-workflow",
+      "--commit=none",
+    );
+    expect(stepped.code).toBe(0);
   }

   /** dev with a bare origin, one local commit beyond it, and foreign work in flight. */
```

## Diff since red — Task 11 `.bkit/core/engine/commands/workflow/worktrees.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-7.snapshot b/.bkit/core/engine/commands/workflow/worktrees.test.ts
index 5dddd8ce..6fb6318b 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-7.snapshot
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -239,6 +239,17 @@ describe("bkit worktrees setup — debug in place on dev shares the checkout", (
       `--token=${lock.json.token}`,
     );
     expect(start.code).toBe(0);
+    // A run counts as live once it has stepped (locks.ts liveReason), as it has by Step 2's end.
+    const stepped = await bkit(
+      cwd,
+      "steps",
+      "done",
+      `--file=docs/plans/${MONTH}/logs/${fid}/status.jsonl`,
+      "--workflow=debug",
+      "--step=debug-start-workflow",
+      "--commit=none",
+    );
+    expect(stepped.code).toBe(0);
   }

   /** dev with a bare origin, one local commit beyond it, and foreign work in flight. */
```

## Diff since red — Task 11 `.bkit/core/engine/commands/workflow/steps.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-8.snapshot b/.bkit/core/engine/commands/workflow/steps.test.ts
index 43f1c5d5..50dc32f2 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-8.snapshot
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -959,6 +959,6 @@ describe("bkit steps done — a run in place on dev that shares its checkout", (
     expect(r.err).toContain("blocked");
     expect(staged(cwd)).toBe("src/staged.txt");
     expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
-    expect(readRecord(cwd, FID)?.commits ?? []).toEqual([]);
+    expect(readRecord(cwd, FID)).toMatchObject({ commits: [] });
   });
 });
```

## Diff since red — Task 11 `.bkit/core/engine/commands/workflow/steps.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-9.snapshot b/.bkit/core/engine/commands/workflow/steps.test.ts
index 43f1c5d5..50dc32f2 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-9.snapshot
+++ b/.bkit/core/engine/commands/workflow/steps.test.ts
@@ -959,6 +959,6 @@ describe("bkit steps done — a run in place on dev that shares its checkout", (
     expect(r.err).toContain("blocked");
     expect(staged(cwd)).toBe("src/staged.txt");
     expect(git(cwd, "rev-parse", "HEAD")).toBe(head);
-    expect(readRecord(cwd, FID)?.commits ?? []).toEqual([]);
+    expect(readRecord(cwd, FID)).toMatchObject({ commits: [] });
   });
 });
```

## Diff since red — Task 11 `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-15.snapshot b/.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts
index 4214e331..a47bea83 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-15.snapshot
+++ b/.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts
@@ -270,7 +270,10 @@ describe("the commits of a debug run in place on dev carry only the run's own pa
     const committed = git(cwd, "show", `HEAD:${ISSUES}`)
       .split("\n")
       .map((l) => JSON.parse(l) as Record<string, unknown>);
-    expect(committed.map((r) => r.id ?? r.key)).toEqual(["base", FID]);
+    expect(committed).toEqual([
+      expect.objectContaining({ id: "base" }),
+      expect.objectContaining({ key: FID }),
+    ]);
     expect(read(cwd, ISSUES)).toContain('"id":"foreign-row"');
   });
 });
```

## Diff since red — Task 11 `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-16.snapshot b/.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts
index 4214e331..a47bea83 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-16.snapshot
+++ b/.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts
@@ -270,7 +270,10 @@ describe("the commits of a debug run in place on dev carry only the run's own pa
     const committed = git(cwd, "show", `HEAD:${ISSUES}`)
       .split("\n")
       .map((l) => JSON.parse(l) as Record<string, unknown>);
-    expect(committed.map((r) => r.id ?? r.key)).toEqual(["base", FID]);
+    expect(committed).toEqual([
+      expect.objectContaining({ id: "base" }),
+      expect.objectContaining({ key: FID }),
+    ]);
     expect(read(cwd, ISSUES)).toContain('"id":"foreign-row"');
   });
 });
```

## Diff since red — Task 11 `.bkit/core/engine/commands/workflow/worktrees.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-17.snapshot b/.bkit/core/engine/commands/workflow/worktrees.test.ts
index 5dddd8ce..6fb6318b 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-17.snapshot
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -239,6 +239,17 @@ describe("bkit worktrees setup — debug in place on dev shares the checkout", (
       `--token=${lock.json.token}`,
     );
     expect(start.code).toBe(0);
+    // A run counts as live once it has stepped (locks.ts liveReason), as it has by Step 2's end.
+    const stepped = await bkit(
+      cwd,
+      "steps",
+      "done",
+      `--file=docs/plans/${MONTH}/logs/${fid}/status.jsonl`,
+      "--workflow=debug",
+      "--step=debug-start-workflow",
+      "--commit=none",
+    );
+    expect(stepped.code).toBe(0);
   }

   /** dev with a bare origin, one local commit beyond it, and foreign work in flight. */
```

## Diff since red — Task 11 `.bkit/core/engine/commands/workflow/worktrees.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-18.snapshot b/.bkit/core/engine/commands/workflow/worktrees.test.ts
index 5dddd8ce..6fb6318b 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-18.snapshot
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -239,6 +239,17 @@ describe("bkit worktrees setup — debug in place on dev shares the checkout", (
       `--token=${lock.json.token}`,
     );
     expect(start.code).toBe(0);
+    // A run counts as live once it has stepped (locks.ts liveReason), as it has by Step 2's end.
+    const stepped = await bkit(
+      cwd,
+      "steps",
+      "done",
+      `--file=docs/plans/${MONTH}/logs/${fid}/status.jsonl`,
+      "--workflow=debug",
+      "--step=debug-start-workflow",
+      "--commit=none",
+    );
+    expect(stepped.code).toBe(0);
   }

   /** dev with a bare origin, one local commit beyond it, and foreign work in flight. */
```

## Diff since red — Task 11 `.bkit/core/engine/commands/workflow/worktrees.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-19.snapshot b/.bkit/core/engine/commands/workflow/worktrees.test.ts
index 5dddd8ce..6fb6318b 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-11-redo-19.snapshot
+++ b/.bkit/core/engine/commands/workflow/worktrees.test.ts
@@ -239,6 +239,17 @@ describe("bkit worktrees setup — debug in place on dev shares the checkout", (
       `--token=${lock.json.token}`,
     );
     expect(start.code).toBe(0);
+    // A run counts as live once it has stepped (locks.ts liveReason), as it has by Step 2's end.
+    const stepped = await bkit(
+      cwd,
+      "steps",
+      "done",
+      `--file=docs/plans/${MONTH}/logs/${fid}/status.jsonl`,
+      "--workflow=debug",
+      "--step=debug-start-workflow",
+      "--commit=none",
+    );
+    expect(stepped.code).toBe(0);
   }

   /** dev with a bare origin, one local commit beyond it, and foreign work in flight. */
```

## Diff since red — Task 12 `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-12-1.snapshot b/.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts
index 4cd835d2..a47bea83 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-12-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts
@@ -146,97 +146,6 @@ const untouched = (cwd: string, foreign: Record<string, string>) => {
   expect(git(cwd, "ls-files", "--others", "--exclude-standard")).toContain("notes.md");
 };

-describe("a debug run in place on dev shares its checkout with foreign work", () => {
-  it("foreign staged and untracked files survive a run commit", async () => {
-    const { cwd, foreign } = fixture();
-    const { setup } = await startRun(cwd);
-    expect(setup.json.aheadAtStart).toBe(1);
-    const done = await step(cwd);
-    expect(done.code).toBe(0);
-    const ledger = await bkit(
-      cwd,
-      "ledgers",
-      "commit",
-      `--root=${cwd}`,
-      `--month=${MONTH}`,
-      `--fid=${FID}`,
-      "--scope=core",
-      "--mode=commit",
-      `--message=chore(${FID}): book`,
-      "--stage-tracked-updates",
-    );
-    expect([0, 6]).toContain(ledger.code);
-    const tree = git(cwd, "ls-tree", "-r", "--name-only", "HEAD");
-    expect(tree).not.toContain("notes.md");
-    expect(git(cwd, "show", "HEAD:src/a.txt")).toBe("a");
-    expect(git(cwd, "show", "HEAD:src/staged.txt")).toBe("s");
-    expect(tree).toContain(`${LOGS}/status.jsonl`);
-    untouched(cwd, foreign);
-    expect(readRecord(cwd, FID)?.commits.length).toBeGreaterThanOrEqual(1);
-  });
-
-  it("close commit tree excludes foreign files", async () => {
-    const { cwd, foreign } = fixture();
-    await startRun(cwd);
-    await step(cwd);
-    foreignCommit(cwd, "foreign commit made mid-run");
-    const close = await bkit(
-      cwd,
-      "workflows",
-      "close",
-      "--workflow=debug",
-      `--fid=${FID}`,
-      `--month=${MONTH}`,
-      `--message=chore(${FID}): close`,
-    );
-    expect(close.code).toBe(0);
-    const closeFiles = git(cwd, "show", "--name-only", "--format=", "HEAD").split("\n");
-    expect(closeFiles).toContain(`${LOGS}/status.jsonl`);
-    for (const rel of Object.keys(foreign)) expect(closeFiles).not.toContain(rel);
-    expect(git(cwd, "ls-tree", "-r", "--name-only", "HEAD")).not.toContain("notes.md");
-    untouched(cwd, foreign);
-    expect(readRecord(cwd, FID)).not.toBeNull();
-  });
-
-  it("debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not", async () => {
-    const { cwd } = fixture();
-    await startRun(cwd);
-    await step(cwd);
-    const mirror = await bkit(cwd, "roadmap", "mirror", "--workflow=debug", `--fid=${FID}`);
-    expect(mirror.code).toBe(0);
-    expect(mirror.json.appended).toBe(true);
-    const close = await bkit(
-      cwd,
-      "workflows",
-      "close",
-      "--workflow=debug",
-      `--fid=${FID}`,
-      `--month=${MONTH}`,
-      `--message=chore(${FID}): close`,
-    );
-    expect(close.code).toBe(0);
-    const committed = git(cwd, "show", `HEAD:${ISSUES}`);
-    expect(committed).toContain('"base"');
-    expect(committed).toContain(FID);
-    expect(committed).not.toContain("foreign-row");
-    // The working file still carries the foreign row, uncommitted.
-    expect(read(cwd, ISSUES)).toContain("foreign-row");
-    expect(git(cwd, "diff", "--name-only", "--", ISSUES)).toBe(ISSUES);
-  });
-
-  it("a pre-dirty file changed during the run is refused with exit 10 and nothing is committed", async () => {
-    const { cwd } = fixture();
-    await startRun(cwd);
-    write(cwd, "notes.md", "foreign notes\nedited during the run\n");
-    const before = git(cwd, "rev-parse", "HEAD");
-    const done = await step(cwd);
-    expect(done.code).toBe(10);
-    expect(done.err).toContain("notes.md");
-    expect(git(cwd, "rev-parse", "HEAD")).toBe(before);
-    expect(git(cwd, "diff", "--cached", "--name-only")).toBe("src/staged.txt");
-  });
-});
-
 describe("the push of a debug run in place on dev sends only the run's commits", () => {
   const remoteLog = (origin: string) => git(origin, "log", "--format=%s", "dev").split("\n");

@@ -305,3 +214,66 @@ describe("the push of a debug run in place on dev sends only the run's commits",
     expect(git(origin, "rev-parse", "dev")).toBe(git(cwd, "rev-parse", "HEAD"));
   });
 });
+
+describe("the commits of a debug run in place on dev carry only the run's own paths", () => {
+  /** Paths in the tree of `rev`. */
+  const tree = (cwd: string, rev: string) =>
+    git(cwd, "ls-tree", "-r", "--name-only", rev).split("\n");
+  /** Paths `rev` changed against its parent. */
+  const changed = (cwd: string, rev: string) =>
+    git(cwd, "diff-tree", "--no-commit-id", "--name-only", "-r", rev).split("\n");
+  const close = (cwd: string) =>
+    bkit(
+      cwd,
+      "workflows",
+      "close",
+      "--workflow=debug",
+      `--fid=${FID}`,
+      `--month=${MONTH}`,
+      `--message=chore(${FID}): close`,
+    );
+
+  it("foreign staged and untracked files survive a run commit", async () => {
+    const { cwd, foreign } = fixture();
+    await startRun(cwd);
+    const done = await step(cwd);
+    expect(done.code).toBe(0);
+    expect(git(cwd, "log", "-1", "--format=%s")).toBe(`chore(${FID}): verify`);
+    expect(tree(cwd, "HEAD")).not.toContain("notes.md");
+    for (const p of changed(cwd, "HEAD")) expect(p.startsWith(`${LOGS}/`)).toBe(true);
+    untouched(cwd, foreign);
+  });
+
+  it("close commit tree excludes foreign files", async () => {
+    const { cwd, foreign } = fixture();
+    await startRun(cwd);
+    await step(cwd);
+    const closed = await close(cwd);
+    expect(closed.code).toBe(0);
+    expect(git(cwd, "log", "-1", "--format=%s")).toBe(`chore(${FID}): close`);
+    expect(tree(cwd, "HEAD")).not.toContain("notes.md");
+    expect(changed(cwd, "HEAD")).not.toEqual(
+      expect.arrayContaining([expect.stringMatching(/^(src\/|notes\.md$)/)]),
+    );
+    expect(git(cwd, "show", "HEAD:src/staged.txt")).toBe("s");
+    untouched(cwd, foreign);
+  });
+
+  it("debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not", async () => {
+    const { cwd } = fixture();
+    await startRun(cwd);
+    await step(cwd);
+    const mirrored = await bkit(cwd, "roadmap", "mirror", "--workflow=debug", `--fid=${FID}`);
+    expect(mirrored.code).toBe(0);
+    expect(mirrored.json).toMatchObject({ appended: true, skipped: "on dev" });
+    expect((await close(cwd)).code).toBe(0);
+    const committed = git(cwd, "show", `HEAD:${ISSUES}`)
+      .split("\n")
+      .map((l) => JSON.parse(l) as Record<string, unknown>);
+    expect(committed).toEqual([
+      expect.objectContaining({ id: "base" }),
+      expect.objectContaining({ key: FID }),
+    ]);
+    expect(read(cwd, ISSUES)).toContain('"id":"foreign-row"');
+  });
+});
```

## Diff since red — Task 12 `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-12-2.snapshot b/.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts
index 4cd835d2..a47bea83 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-12-2.snapshot
+++ b/.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts
@@ -146,97 +146,6 @@ const untouched = (cwd: string, foreign: Record<string, string>) => {
   expect(git(cwd, "ls-files", "--others", "--exclude-standard")).toContain("notes.md");
 };

-describe("a debug run in place on dev shares its checkout with foreign work", () => {
-  it("foreign staged and untracked files survive a run commit", async () => {
-    const { cwd, foreign } = fixture();
-    const { setup } = await startRun(cwd);
-    expect(setup.json.aheadAtStart).toBe(1);
-    const done = await step(cwd);
-    expect(done.code).toBe(0);
-    const ledger = await bkit(
-      cwd,
-      "ledgers",
-      "commit",
-      `--root=${cwd}`,
-      `--month=${MONTH}`,
-      `--fid=${FID}`,
-      "--scope=core",
-      "--mode=commit",
-      `--message=chore(${FID}): book`,
-      "--stage-tracked-updates",
-    );
-    expect([0, 6]).toContain(ledger.code);
-    const tree = git(cwd, "ls-tree", "-r", "--name-only", "HEAD");
-    expect(tree).not.toContain("notes.md");
-    expect(git(cwd, "show", "HEAD:src/a.txt")).toBe("a");
-    expect(git(cwd, "show", "HEAD:src/staged.txt")).toBe("s");
-    expect(tree).toContain(`${LOGS}/status.jsonl`);
-    untouched(cwd, foreign);
-    expect(readRecord(cwd, FID)?.commits.length).toBeGreaterThanOrEqual(1);
-  });
-
-  it("close commit tree excludes foreign files", async () => {
-    const { cwd, foreign } = fixture();
-    await startRun(cwd);
-    await step(cwd);
-    foreignCommit(cwd, "foreign commit made mid-run");
-    const close = await bkit(
-      cwd,
-      "workflows",
-      "close",
-      "--workflow=debug",
-      `--fid=${FID}`,
-      `--month=${MONTH}`,
-      `--message=chore(${FID}): close`,
-    );
-    expect(close.code).toBe(0);
-    const closeFiles = git(cwd, "show", "--name-only", "--format=", "HEAD").split("\n");
-    expect(closeFiles).toContain(`${LOGS}/status.jsonl`);
-    for (const rel of Object.keys(foreign)) expect(closeFiles).not.toContain(rel);
-    expect(git(cwd, "ls-tree", "-r", "--name-only", "HEAD")).not.toContain("notes.md");
-    untouched(cwd, foreign);
-    expect(readRecord(cwd, FID)).not.toBeNull();
-  });
-
-  it("debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not", async () => {
-    const { cwd } = fixture();
-    await startRun(cwd);
-    await step(cwd);
-    const mirror = await bkit(cwd, "roadmap", "mirror", "--workflow=debug", `--fid=${FID}`);
-    expect(mirror.code).toBe(0);
-    expect(mirror.json.appended).toBe(true);
-    const close = await bkit(
-      cwd,
-      "workflows",
-      "close",
-      "--workflow=debug",
-      `--fid=${FID}`,
-      `--month=${MONTH}`,
-      `--message=chore(${FID}): close`,
-    );
-    expect(close.code).toBe(0);
-    const committed = git(cwd, "show", `HEAD:${ISSUES}`);
-    expect(committed).toContain('"base"');
-    expect(committed).toContain(FID);
-    expect(committed).not.toContain("foreign-row");
-    // The working file still carries the foreign row, uncommitted.
-    expect(read(cwd, ISSUES)).toContain("foreign-row");
-    expect(git(cwd, "diff", "--name-only", "--", ISSUES)).toBe(ISSUES);
-  });
-
-  it("a pre-dirty file changed during the run is refused with exit 10 and nothing is committed", async () => {
-    const { cwd } = fixture();
-    await startRun(cwd);
-    write(cwd, "notes.md", "foreign notes\nedited during the run\n");
-    const before = git(cwd, "rev-parse", "HEAD");
-    const done = await step(cwd);
-    expect(done.code).toBe(10);
-    expect(done.err).toContain("notes.md");
-    expect(git(cwd, "rev-parse", "HEAD")).toBe(before);
-    expect(git(cwd, "diff", "--cached", "--name-only")).toBe("src/staged.txt");
-  });
-});
-
 describe("the push of a debug run in place on dev sends only the run's commits", () => {
   const remoteLog = (origin: string) => git(origin, "log", "--format=%s", "dev").split("\n");

@@ -305,3 +214,66 @@ describe("the push of a debug run in place on dev sends only the run's commits",
     expect(git(origin, "rev-parse", "dev")).toBe(git(cwd, "rev-parse", "HEAD"));
   });
 });
+
+describe("the commits of a debug run in place on dev carry only the run's own paths", () => {
+  /** Paths in the tree of `rev`. */
+  const tree = (cwd: string, rev: string) =>
+    git(cwd, "ls-tree", "-r", "--name-only", rev).split("\n");
+  /** Paths `rev` changed against its parent. */
+  const changed = (cwd: string, rev: string) =>
+    git(cwd, "diff-tree", "--no-commit-id", "--name-only", "-r", rev).split("\n");
+  const close = (cwd: string) =>
+    bkit(
+      cwd,
+      "workflows",
+      "close",
+      "--workflow=debug",
+      `--fid=${FID}`,
+      `--month=${MONTH}`,
+      `--message=chore(${FID}): close`,
+    );
+
+  it("foreign staged and untracked files survive a run commit", async () => {
+    const { cwd, foreign } = fixture();
+    await startRun(cwd);
+    const done = await step(cwd);
+    expect(done.code).toBe(0);
+    expect(git(cwd, "log", "-1", "--format=%s")).toBe(`chore(${FID}): verify`);
+    expect(tree(cwd, "HEAD")).not.toContain("notes.md");
+    for (const p of changed(cwd, "HEAD")) expect(p.startsWith(`${LOGS}/`)).toBe(true);
+    untouched(cwd, foreign);
+  });
+
+  it("close commit tree excludes foreign files", async () => {
+    const { cwd, foreign } = fixture();
+    await startRun(cwd);
+    await step(cwd);
+    const closed = await close(cwd);
+    expect(closed.code).toBe(0);
+    expect(git(cwd, "log", "-1", "--format=%s")).toBe(`chore(${FID}): close`);
+    expect(tree(cwd, "HEAD")).not.toContain("notes.md");
+    expect(changed(cwd, "HEAD")).not.toEqual(
+      expect.arrayContaining([expect.stringMatching(/^(src\/|notes\.md$)/)]),
+    );
+    expect(git(cwd, "show", "HEAD:src/staged.txt")).toBe("s");
+    untouched(cwd, foreign);
+  });
+
+  it("debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not", async () => {
+    const { cwd } = fixture();
+    await startRun(cwd);
+    await step(cwd);
+    const mirrored = await bkit(cwd, "roadmap", "mirror", "--workflow=debug", `--fid=${FID}`);
+    expect(mirrored.code).toBe(0);
+    expect(mirrored.json).toMatchObject({ appended: true, skipped: "on dev" });
+    expect((await close(cwd)).code).toBe(0);
+    const committed = git(cwd, "show", `HEAD:${ISSUES}`)
+      .split("\n")
+      .map((l) => JSON.parse(l) as Record<string, unknown>);
+    expect(committed).toEqual([
+      expect.objectContaining({ id: "base" }),
+      expect.objectContaining({ key: FID }),
+    ]);
+    expect(read(cwd, ISSUES)).toContain('"id":"foreign-row"');
+  });
+});
```

## Diff since red — Task 12 `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-12-4.snapshot b/.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts
index 4cd835d2..a47bea83 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-12-4.snapshot
+++ b/.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts
@@ -146,97 +146,6 @@ const untouched = (cwd: string, foreign: Record<string, string>) => {
   expect(git(cwd, "ls-files", "--others", "--exclude-standard")).toContain("notes.md");
 };

-describe("a debug run in place on dev shares its checkout with foreign work", () => {
-  it("foreign staged and untracked files survive a run commit", async () => {
-    const { cwd, foreign } = fixture();
-    const { setup } = await startRun(cwd);
-    expect(setup.json.aheadAtStart).toBe(1);
-    const done = await step(cwd);
-    expect(done.code).toBe(0);
-    const ledger = await bkit(
-      cwd,
-      "ledgers",
-      "commit",
-      `--root=${cwd}`,
-      `--month=${MONTH}`,
-      `--fid=${FID}`,
-      "--scope=core",
-      "--mode=commit",
-      `--message=chore(${FID}): book`,
-      "--stage-tracked-updates",
-    );
-    expect([0, 6]).toContain(ledger.code);
-    const tree = git(cwd, "ls-tree", "-r", "--name-only", "HEAD");
-    expect(tree).not.toContain("notes.md");
-    expect(git(cwd, "show", "HEAD:src/a.txt")).toBe("a");
-    expect(git(cwd, "show", "HEAD:src/staged.txt")).toBe("s");
-    expect(tree).toContain(`${LOGS}/status.jsonl`);
-    untouched(cwd, foreign);
-    expect(readRecord(cwd, FID)?.commits.length).toBeGreaterThanOrEqual(1);
-  });
-
-  it("close commit tree excludes foreign files", async () => {
-    const { cwd, foreign } = fixture();
-    await startRun(cwd);
-    await step(cwd);
-    foreignCommit(cwd, "foreign commit made mid-run");
-    const close = await bkit(
-      cwd,
-      "workflows",
-      "close",
-      "--workflow=debug",
-      `--fid=${FID}`,
-      `--month=${MONTH}`,
-      `--message=chore(${FID}): close`,
-    );
-    expect(close.code).toBe(0);
-    const closeFiles = git(cwd, "show", "--name-only", "--format=", "HEAD").split("\n");
-    expect(closeFiles).toContain(`${LOGS}/status.jsonl`);
-    for (const rel of Object.keys(foreign)) expect(closeFiles).not.toContain(rel);
-    expect(git(cwd, "ls-tree", "-r", "--name-only", "HEAD")).not.toContain("notes.md");
-    untouched(cwd, foreign);
-    expect(readRecord(cwd, FID)).not.toBeNull();
-  });
-
-  it("debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not", async () => {
-    const { cwd } = fixture();
-    await startRun(cwd);
-    await step(cwd);
-    const mirror = await bkit(cwd, "roadmap", "mirror", "--workflow=debug", `--fid=${FID}`);
-    expect(mirror.code).toBe(0);
-    expect(mirror.json.appended).toBe(true);
-    const close = await bkit(
-      cwd,
-      "workflows",
-      "close",
-      "--workflow=debug",
-      `--fid=${FID}`,
-      `--month=${MONTH}`,
-      `--message=chore(${FID}): close`,
-    );
-    expect(close.code).toBe(0);
-    const committed = git(cwd, "show", `HEAD:${ISSUES}`);
-    expect(committed).toContain('"base"');
-    expect(committed).toContain(FID);
-    expect(committed).not.toContain("foreign-row");
-    // The working file still carries the foreign row, uncommitted.
-    expect(read(cwd, ISSUES)).toContain("foreign-row");
-    expect(git(cwd, "diff", "--name-only", "--", ISSUES)).toBe(ISSUES);
-  });
-
-  it("a pre-dirty file changed during the run is refused with exit 10 and nothing is committed", async () => {
-    const { cwd } = fixture();
-    await startRun(cwd);
-    write(cwd, "notes.md", "foreign notes\nedited during the run\n");
-    const before = git(cwd, "rev-parse", "HEAD");
-    const done = await step(cwd);
-    expect(done.code).toBe(10);
-    expect(done.err).toContain("notes.md");
-    expect(git(cwd, "rev-parse", "HEAD")).toBe(before);
-    expect(git(cwd, "diff", "--cached", "--name-only")).toBe("src/staged.txt");
-  });
-});
-
 describe("the push of a debug run in place on dev sends only the run's commits", () => {
   const remoteLog = (origin: string) => git(origin, "log", "--format=%s", "dev").split("\n");

@@ -305,3 +214,66 @@ describe("the push of a debug run in place on dev sends only the run's commits",
     expect(git(origin, "rev-parse", "dev")).toBe(git(cwd, "rev-parse", "HEAD"));
   });
 });
+
+describe("the commits of a debug run in place on dev carry only the run's own paths", () => {
+  /** Paths in the tree of `rev`. */
+  const tree = (cwd: string, rev: string) =>
+    git(cwd, "ls-tree", "-r", "--name-only", rev).split("\n");
+  /** Paths `rev` changed against its parent. */
+  const changed = (cwd: string, rev: string) =>
+    git(cwd, "diff-tree", "--no-commit-id", "--name-only", "-r", rev).split("\n");
+  const close = (cwd: string) =>
+    bkit(
+      cwd,
+      "workflows",
+      "close",
+      "--workflow=debug",
+      `--fid=${FID}`,
+      `--month=${MONTH}`,
+      `--message=chore(${FID}): close`,
+    );
+
+  it("foreign staged and untracked files survive a run commit", async () => {
+    const { cwd, foreign } = fixture();
+    await startRun(cwd);
+    const done = await step(cwd);
+    expect(done.code).toBe(0);
+    expect(git(cwd, "log", "-1", "--format=%s")).toBe(`chore(${FID}): verify`);
+    expect(tree(cwd, "HEAD")).not.toContain("notes.md");
+    for (const p of changed(cwd, "HEAD")) expect(p.startsWith(`${LOGS}/`)).toBe(true);
+    untouched(cwd, foreign);
+  });
+
+  it("close commit tree excludes foreign files", async () => {
+    const { cwd, foreign } = fixture();
+    await startRun(cwd);
+    await step(cwd);
+    const closed = await close(cwd);
+    expect(closed.code).toBe(0);
+    expect(git(cwd, "log", "-1", "--format=%s")).toBe(`chore(${FID}): close`);
+    expect(tree(cwd, "HEAD")).not.toContain("notes.md");
+    expect(changed(cwd, "HEAD")).not.toEqual(
+      expect.arrayContaining([expect.stringMatching(/^(src\/|notes\.md$)/)]),
+    );
+    expect(git(cwd, "show", "HEAD:src/staged.txt")).toBe("s");
+    untouched(cwd, foreign);
+  });
+
+  it("debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not", async () => {
+    const { cwd } = fixture();
+    await startRun(cwd);
+    await step(cwd);
+    const mirrored = await bkit(cwd, "roadmap", "mirror", "--workflow=debug", `--fid=${FID}`);
+    expect(mirrored.code).toBe(0);
+    expect(mirrored.json).toMatchObject({ appended: true, skipped: "on dev" });
+    expect((await close(cwd)).code).toBe(0);
+    const committed = git(cwd, "show", `HEAD:${ISSUES}`)
+      .split("\n")
+      .map((l) => JSON.parse(l) as Record<string, unknown>);
+    expect(committed).toEqual([
+      expect.objectContaining({ id: "base" }),
+      expect.objectContaining({ key: FID }),
+    ]);
+    expect(read(cwd, ISSUES)).toContain('"id":"foreign-row"');
+  });
+});
```

## Diff since red — Task 12 `.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-12-5.snapshot b/.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts
index 4cd835d2..a47bea83 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-12-5.snapshot
+++ b/.bkit/core/engine/commands/workflow/shared-checkout.integration.test.ts
@@ -146,97 +146,6 @@ const untouched = (cwd: string, foreign: Record<string, string>) => {
   expect(git(cwd, "ls-files", "--others", "--exclude-standard")).toContain("notes.md");
 };

-describe("a debug run in place on dev shares its checkout with foreign work", () => {
-  it("foreign staged and untracked files survive a run commit", async () => {
-    const { cwd, foreign } = fixture();
-    const { setup } = await startRun(cwd);
-    expect(setup.json.aheadAtStart).toBe(1);
-    const done = await step(cwd);
-    expect(done.code).toBe(0);
-    const ledger = await bkit(
-      cwd,
-      "ledgers",
-      "commit",
-      `--root=${cwd}`,
-      `--month=${MONTH}`,
-      `--fid=${FID}`,
-      "--scope=core",
-      "--mode=commit",
-      `--message=chore(${FID}): book`,
-      "--stage-tracked-updates",
-    );
-    expect([0, 6]).toContain(ledger.code);
-    const tree = git(cwd, "ls-tree", "-r", "--name-only", "HEAD");
-    expect(tree).not.toContain("notes.md");
-    expect(git(cwd, "show", "HEAD:src/a.txt")).toBe("a");
-    expect(git(cwd, "show", "HEAD:src/staged.txt")).toBe("s");
-    expect(tree).toContain(`${LOGS}/status.jsonl`);
-    untouched(cwd, foreign);
-    expect(readRecord(cwd, FID)?.commits.length).toBeGreaterThanOrEqual(1);
-  });
-
-  it("close commit tree excludes foreign files", async () => {
-    const { cwd, foreign } = fixture();
-    await startRun(cwd);
-    await step(cwd);
-    foreignCommit(cwd, "foreign commit made mid-run");
-    const close = await bkit(
-      cwd,
-      "workflows",
-      "close",
-      "--workflow=debug",
-      `--fid=${FID}`,
-      `--month=${MONTH}`,
-      `--message=chore(${FID}): close`,
-    );
-    expect(close.code).toBe(0);
-    const closeFiles = git(cwd, "show", "--name-only", "--format=", "HEAD").split("\n");
-    expect(closeFiles).toContain(`${LOGS}/status.jsonl`);
-    for (const rel of Object.keys(foreign)) expect(closeFiles).not.toContain(rel);
-    expect(git(cwd, "ls-tree", "-r", "--name-only", "HEAD")).not.toContain("notes.md");
-    untouched(cwd, foreign);
-    expect(readRecord(cwd, FID)).not.toBeNull();
-  });
-
-  it("debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not", async () => {
-    const { cwd } = fixture();
-    await startRun(cwd);
-    await step(cwd);
-    const mirror = await bkit(cwd, "roadmap", "mirror", "--workflow=debug", `--fid=${FID}`);
-    expect(mirror.code).toBe(0);
-    expect(mirror.json.appended).toBe(true);
-    const close = await bkit(
-      cwd,
-      "workflows",
-      "close",
-      "--workflow=debug",
-      `--fid=${FID}`,
-      `--month=${MONTH}`,
-      `--message=chore(${FID}): close`,
-    );
-    expect(close.code).toBe(0);
-    const committed = git(cwd, "show", `HEAD:${ISSUES}`);
-    expect(committed).toContain('"base"');
-    expect(committed).toContain(FID);
-    expect(committed).not.toContain("foreign-row");
-    // The working file still carries the foreign row, uncommitted.
-    expect(read(cwd, ISSUES)).toContain("foreign-row");
-    expect(git(cwd, "diff", "--name-only", "--", ISSUES)).toBe(ISSUES);
-  });
-
-  it("a pre-dirty file changed during the run is refused with exit 10 and nothing is committed", async () => {
-    const { cwd } = fixture();
-    await startRun(cwd);
-    write(cwd, "notes.md", "foreign notes\nedited during the run\n");
-    const before = git(cwd, "rev-parse", "HEAD");
-    const done = await step(cwd);
-    expect(done.code).toBe(10);
-    expect(done.err).toContain("notes.md");
-    expect(git(cwd, "rev-parse", "HEAD")).toBe(before);
-    expect(git(cwd, "diff", "--cached", "--name-only")).toBe("src/staged.txt");
-  });
-});
-
 describe("the push of a debug run in place on dev sends only the run's commits", () => {
   const remoteLog = (origin: string) => git(origin, "log", "--format=%s", "dev").split("\n");

@@ -305,3 +214,66 @@ describe("the push of a debug run in place on dev sends only the run's commits",
     expect(git(origin, "rev-parse", "dev")).toBe(git(cwd, "rev-parse", "HEAD"));
   });
 });
+
+describe("the commits of a debug run in place on dev carry only the run's own paths", () => {
+  /** Paths in the tree of `rev`. */
+  const tree = (cwd: string, rev: string) =>
+    git(cwd, "ls-tree", "-r", "--name-only", rev).split("\n");
+  /** Paths `rev` changed against its parent. */
+  const changed = (cwd: string, rev: string) =>
+    git(cwd, "diff-tree", "--no-commit-id", "--name-only", "-r", rev).split("\n");
+  const close = (cwd: string) =>
+    bkit(
+      cwd,
+      "workflows",
+      "close",
+      "--workflow=debug",
+      `--fid=${FID}`,
+      `--month=${MONTH}`,
+      `--message=chore(${FID}): close`,
+    );
+
+  it("foreign staged and untracked files survive a run commit", async () => {
+    const { cwd, foreign } = fixture();
+    await startRun(cwd);
+    const done = await step(cwd);
+    expect(done.code).toBe(0);
+    expect(git(cwd, "log", "-1", "--format=%s")).toBe(`chore(${FID}): verify`);
+    expect(tree(cwd, "HEAD")).not.toContain("notes.md");
+    for (const p of changed(cwd, "HEAD")) expect(p.startsWith(`${LOGS}/`)).toBe(true);
+    untouched(cwd, foreign);
+  });
+
+  it("close commit tree excludes foreign files", async () => {
+    const { cwd, foreign } = fixture();
+    await startRun(cwd);
+    await step(cwd);
+    const closed = await close(cwd);
+    expect(closed.code).toBe(0);
+    expect(git(cwd, "log", "-1", "--format=%s")).toBe(`chore(${FID}): close`);
+    expect(tree(cwd, "HEAD")).not.toContain("notes.md");
+    expect(changed(cwd, "HEAD")).not.toEqual(
+      expect.arrayContaining([expect.stringMatching(/^(src\/|notes\.md$)/)]),
+    );
+    expect(git(cwd, "show", "HEAD:src/staged.txt")).toBe("s");
+    untouched(cwd, foreign);
+  });
+
+  it("debug-on-dev roadmap mirror row lands while the foreign issues.jsonl row does not", async () => {
+    const { cwd } = fixture();
+    await startRun(cwd);
+    await step(cwd);
+    const mirrored = await bkit(cwd, "roadmap", "mirror", "--workflow=debug", `--fid=${FID}`);
+    expect(mirrored.code).toBe(0);
+    expect(mirrored.json).toMatchObject({ appended: true, skipped: "on dev" });
+    expect((await close(cwd)).code).toBe(0);
+    const committed = git(cwd, "show", `HEAD:${ISSUES}`)
+      .split("\n")
+      .map((l) => JSON.parse(l) as Record<string, unknown>);
+    expect(committed).toEqual([
+      expect.objectContaining({ id: "base" }),
+      expect.objectContaining({ key: FID }),
+    ]);
+    expect(read(cwd, ISSUES)).toContain('"id":"foreign-row"');
+  });
+});
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

## Diff since red — Task 13 `.bkit/core/engine/commands/workflow/runs.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-13-1.snapshot b/.bkit/core/engine/commands/workflow/runs.test.ts
index 471f86bc..eff21c2b 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-13-1.snapshot
+++ b/.bkit/core/engine/commands/workflow/runs.test.ts
@@ -1998,40 +1998,28 @@ describe("bkit runs context", () => {
     expect((await context(cwd, "ship", "42")).code).toBe(8);
   });

-  it("runs context refuses an issue-less marker and branch naming the missing issue", async () => {
-    const cwd = autoRepo();
-    const runs = JSON.stringify([{ databaseId: 5, headSha: "sha-il" }]);
-    fakeGhBin({
-      "pr-view": prJson({
-        headRefName: "feat/dev-ci-failures",
-        headRefOid: "sha-il",
-        body: "<!-- bkit:fid=dev-ci-failures -->\n",
-      }),
-      "run-list": runs,
-    });
-    const viaMarker = await context(cwd, "ship", "42");
-    expect(viaMarker.code).toBe(9);
-    expect(viaMarker.err).toContain("no issue in the PR-body marker or branch FID");
-    expect(viaMarker.json.fid).toBeNull();
-    fakeGhBin({
-      "pr-view": prJson({
-        headRefName: "feat/dev-ci-failures",
-        headRefOid: "sha-il",
-        body: "",
-      }),
-      "run-list": runs,
-    });
-    const viaBranch = await context(cwd, "ship", "42");
-    expect(viaBranch.code).toBe(9);
-    expect(viaBranch.err).toContain("no issue in the PR-body marker or branch FID");
-  });
-
   it("an unknown phase exits 3; gh needing auth exits 80", async () => {
     const cwd = autoRepo();
     expect((await context(cwd, "deploy", "1")).code).toBe(3);
     fakeGhBin({ "pr-view": "EXIT:4" });
     expect((await context(cwd, "ship", "42")).code).toBe(80);
   });
+
+  it("runs context refuses an issue-less marker and branch naming the missing issue", async () => {
+    const cwd = autoRepo();
+    const runs = JSON.stringify([{ databaseId: 5, headSha: "sha12" }]);
+    const cases = [
+      { headRefName: "feat/other", body: "<!-- bkit:fid=dev-ci-failures -->\n" },
+      { headRefName: "feat/dev-ci-failures", body: "" },
+    ];
+    for (const pr of cases) {
+      fakeGhBin({ "pr-view": prJson(pr), "run-list": runs });
+      const r = await context(cwd, "ship", "42");
+      expect(r.err).toContain("dev-ci-failures names no issue");
+      expect(r.code).toBe(9);
+      expect(r.json.fid).toBeNull();
+    }
+  });
 });

 // ---------------------------------------------------------------------------
```

## Diff since red — Task 13 `.bkit/core/engine/commands/workflow/runs.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-13-2.snapshot b/.bkit/core/engine/commands/workflow/runs.test.ts
index 471f86bc..eff21c2b 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-13-2.snapshot
+++ b/.bkit/core/engine/commands/workflow/runs.test.ts
@@ -1998,40 +1998,28 @@ describe("bkit runs context", () => {
     expect((await context(cwd, "ship", "42")).code).toBe(8);
   });

-  it("runs context refuses an issue-less marker and branch naming the missing issue", async () => {
-    const cwd = autoRepo();
-    const runs = JSON.stringify([{ databaseId: 5, headSha: "sha-il" }]);
-    fakeGhBin({
-      "pr-view": prJson({
-        headRefName: "feat/dev-ci-failures",
-        headRefOid: "sha-il",
-        body: "<!-- bkit:fid=dev-ci-failures -->\n",
-      }),
-      "run-list": runs,
-    });
-    const viaMarker = await context(cwd, "ship", "42");
-    expect(viaMarker.code).toBe(9);
-    expect(viaMarker.err).toContain("no issue in the PR-body marker or branch FID");
-    expect(viaMarker.json.fid).toBeNull();
-    fakeGhBin({
-      "pr-view": prJson({
-        headRefName: "feat/dev-ci-failures",
-        headRefOid: "sha-il",
-        body: "",
-      }),
-      "run-list": runs,
-    });
-    const viaBranch = await context(cwd, "ship", "42");
-    expect(viaBranch.code).toBe(9);
-    expect(viaBranch.err).toContain("no issue in the PR-body marker or branch FID");
-  });
-
   it("an unknown phase exits 3; gh needing auth exits 80", async () => {
     const cwd = autoRepo();
     expect((await context(cwd, "deploy", "1")).code).toBe(3);
     fakeGhBin({ "pr-view": "EXIT:4" });
     expect((await context(cwd, "ship", "42")).code).toBe(80);
   });
+
+  it("runs context refuses an issue-less marker and branch naming the missing issue", async () => {
+    const cwd = autoRepo();
+    const runs = JSON.stringify([{ databaseId: 5, headSha: "sha12" }]);
+    const cases = [
+      { headRefName: "feat/other", body: "<!-- bkit:fid=dev-ci-failures -->\n" },
+      { headRefName: "feat/dev-ci-failures", body: "" },
+    ];
+    for (const pr of cases) {
+      fakeGhBin({ "pr-view": prJson(pr), "run-list": runs });
+      const r = await context(cwd, "ship", "42");
+      expect(r.err).toContain("dev-ci-failures names no issue");
+      expect(r.code).toBe(9);
+      expect(r.json.fid).toBeNull();
+    }
+  });
 });

 // ---------------------------------------------------------------------------
```

## Diff since red — Task 13 `.bkit/core/engine/commands/workflow/runs.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-13-3.snapshot b/.bkit/core/engine/commands/workflow/runs.test.ts
index 471f86bc..eff21c2b 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-1-13-3.snapshot
+++ b/.bkit/core/engine/commands/workflow/runs.test.ts
@@ -1998,40 +1998,28 @@ describe("bkit runs context", () => {
     expect((await context(cwd, "ship", "42")).code).toBe(8);
   });

-  it("runs context refuses an issue-less marker and branch naming the missing issue", async () => {
-    const cwd = autoRepo();
-    const runs = JSON.stringify([{ databaseId: 5, headSha: "sha-il" }]);
-    fakeGhBin({
-      "pr-view": prJson({
-        headRefName: "feat/dev-ci-failures",
-        headRefOid: "sha-il",
-        body: "<!-- bkit:fid=dev-ci-failures -->\n",
-      }),
-      "run-list": runs,
-    });
-    const viaMarker = await context(cwd, "ship", "42");
-    expect(viaMarker.code).toBe(9);
-    expect(viaMarker.err).toContain("no issue in the PR-body marker or branch FID");
-    expect(viaMarker.json.fid).toBeNull();
-    fakeGhBin({
-      "pr-view": prJson({
-        headRefName: "feat/dev-ci-failures",
-        headRefOid: "sha-il",
-        body: "",
-      }),
-      "run-list": runs,
-    });
-    const viaBranch = await context(cwd, "ship", "42");
-    expect(viaBranch.code).toBe(9);
-    expect(viaBranch.err).toContain("no issue in the PR-body marker or branch FID");
-  });
-
   it("an unknown phase exits 3; gh needing auth exits 80", async () => {
     const cwd = autoRepo();
     expect((await context(cwd, "deploy", "1")).code).toBe(3);
     fakeGhBin({ "pr-view": "EXIT:4" });
     expect((await context(cwd, "ship", "42")).code).toBe(80);
   });
+
+  it("runs context refuses an issue-less marker and branch naming the missing issue", async () => {
+    const cwd = autoRepo();
+    const runs = JSON.stringify([{ databaseId: 5, headSha: "sha12" }]);
+    const cases = [
+      { headRefName: "feat/other", body: "<!-- bkit:fid=dev-ci-failures -->\n" },
+      { headRefName: "feat/dev-ci-failures", body: "" },
+    ];
+    for (const pr of cases) {
+      fakeGhBin({ "pr-view": prJson(pr), "run-list": runs });
+      const r = await context(cwd, "ship", "42");
+      expect(r.err).toContain("dev-ci-failures names no issue");
+      expect(r.code).toBe(9);
+      expect(r.json.fid).toBeNull();
+    }
+  });
 });

 // ---------------------------------------------------------------------------
```
