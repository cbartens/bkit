Enforced: true
Gaps: 26
Test order only: false

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202610/650-workflows-prompt-alone-plan-2.md`

<!-- prettier-ignore -->
| Task | Test | Red | Changed since red | Green |
| --- | --- | --- | --- | --- |
| 7 | `.bkit/core/engine/tools/wording.test.ts` "workflow-issue-id-missing has no STOP" | recorded 2026-10-22T07:24:28Z | no | passed |
| 7 | `.bkit/core/engine/tools/wording.test.ts` "changed issue clauses keep their old text in retired" | recorded 2026-10-22T07:24:41Z | no | passed |
| 7 | `.bkit/core/engine/tools/wording.test.ts` "workflow-fid-mint re-mints once on a fids check reject" | recorded 2026-10-22T07:24:44Z | no | passed |
| 8 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty" | recorded 2026-10-22T07:24:44Z | yes | passed |
| 8 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "no wired-tracker block STOPs on a missing issue" | recorded 2026-10-22T07:24:45Z | yes | passed |
| 8 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "fids check and steps gate carry --issue in every workflow" | recorded 2026-10-22T07:24:46Z | yes | passed |
| 8 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "No issue bullet sits in a tracker true block" | recorded 2026-10-22T07:24:46Z | yes | passed |
| 8 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "every issues labels --board fence has a Skip if ISSUE_ID empty line" | recorded 2026-10-22T07:24:47Z | yes | passed |
| 8 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "final messages start with the no-issue warning clause" | recorded 2026-10-22T07:24:48Z | yes | passed |
| 8 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "Step 1 recovers ISSUE_ID from a named FID or feat branch before warning" | recorded 2026-10-22T07:24:48Z | yes | passed |
| 8 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "Placeholders rule lets ISSUE_ID be empty in every workflow" | recorded 2026-10-22T07:24:49Z | yes | passed |
| 8 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "Jira related-issues query drops key != when ISSUE_ID is empty" | recorded 2026-10-22T07:24:50Z | yes | passed |
| 9 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "build 18.9 and debug 11.9 kill-switch checks skip when ISSUE_ID is empty" | recorded 2026-10-22T07:24:50Z | yes | passed |
| 9 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "debug Step 1 never probes for a PR on dev or main" | recorded 2026-10-22T07:24:51Z | yes | passed |
| 9 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "design Step 11 requires an issue" | recorded 2026-10-22T07:24:51Z | yes | passed |
| 10 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "AGENTS.md router does not STOP on a missing issue" | recorded 2026-10-22T07:24:52Z | yes | passed |
| 14 | `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` "debug Step 11 on dev waits for and gates the dev CI run" | recorded 2026-10-22T07:24:53Z | yes | passed |
| 14 | `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` "debug Step 11 on dev dispatches by pushed sha" | recorded 2026-10-22T07:24:53Z | yes | passed |
| 14 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "debug Steps 9 and 10 push nothing on dev" | recorded 2026-10-22T07:24:54Z | yes | passed |
| 14 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "debug diffs against DIFF_BASE on dev" | recorded 2026-10-22T07:24:54Z | yes | passed |
| 14 | `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` "debug Step 11 on dev releases the lock after the CI wait" | recorded 2026-10-22T07:24:55Z | yes | passed |
| 14 | `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` "debug Step 11 on dev records the close against the pushed sha" | recorded 2026-10-22T07:24:55Z | yes | passed |
| 14 | `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` "debug Step 11 on dev routes a red run to the Failure Path naming the run" | recorded 2026-10-22T07:24:56Z | yes | passed |
| 14 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "debug stops and asks on EXIT_FOREIGN_PATH" | recorded 2026-10-22T07:24:56Z | yes | passed |
| 15 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "Step 10 label re-read skips when ISSUE_ID is empty" | recorded 2026-10-22T07:25:18Z | yes | passed |
| 15 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "naming warning fires issue-less when the branch is not feat/{FID}" | missing | — | not passed |
| 15 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "Step 10 MCP merge asserts base dev" | recorded 2026-10-22T07:25:19Z | yes | passed |
| 15 | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "Step 14.3 labels skip when ISSUE_ID is empty" | recorded 2026-10-22T07:25:20Z | yes | passed |

## Gaps

- Task 8 `test-changed` — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` differs from its red snapshot for "every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty" (diff below)
- Task 8 `test-changed` — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` differs from its red snapshot for "no wired-tracker block STOPs on a missing issue" (diff below)
- Task 8 `test-changed` — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` differs from its red snapshot for "fids check and steps gate carry --issue in every workflow" (diff below)
- Task 8 `test-changed` — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` differs from its red snapshot for "No issue bullet sits in a tracker true block" (diff below)
- Task 8 `test-changed` — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` differs from its red snapshot for "every issues labels --board fence has a Skip if ISSUE_ID empty line" (diff below)
- Task 8 `test-changed` — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` differs from its red snapshot for "final messages start with the no-issue warning clause" (diff below)
- Task 8 `test-changed` — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` differs from its red snapshot for "Step 1 recovers ISSUE_ID from a named FID or feat branch before warning" (diff below)
- Task 8 `test-changed` — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` differs from its red snapshot for "Placeholders rule lets ISSUE_ID be empty in every workflow" (diff below)
- Task 8 `test-changed` — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` differs from its red snapshot for "Jira related-issues query drops key != when ISSUE_ID is empty" (diff below)
- Task 9 `test-changed` — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` differs from its red snapshot for "build 18.9 and debug 11.9 kill-switch checks skip when ISSUE_ID is empty" (diff below)
- Task 9 `test-changed` — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` differs from its red snapshot for "debug Step 1 never probes for a PR on dev or main" (diff below)
- Task 9 `test-changed` — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` differs from its red snapshot for "design Step 11 requires an issue" (diff below)
- Task 10 `test-changed` — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` differs from its red snapshot for "AGENTS.md router does not STOP on a missing issue" (diff below)
- Task 14 `test-changed` — `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` differs from its red snapshot for "debug Step 11 on dev waits for and gates the dev CI run" (diff below)
- Task 14 `test-changed` — `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` differs from its red snapshot for "debug Step 11 on dev dispatches by pushed sha" (diff below)
- Task 14 `test-changed` — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` differs from its red snapshot for "debug Steps 9 and 10 push nothing on dev" (diff below)
- Task 14 `test-changed` — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` differs from its red snapshot for "debug diffs against DIFF_BASE on dev" (diff below)
- Task 14 `test-changed` — `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` differs from its red snapshot for "debug Step 11 on dev releases the lock after the CI wait" (diff below)
- Task 14 `test-changed` — `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` differs from its red snapshot for "debug Step 11 on dev records the close against the pushed sha" (diff below)
- Task 14 `test-changed` — `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts` differs from its red snapshot for "debug Step 11 on dev routes a red run to the Failure Path naming the run" (diff below)
- Task 14 `test-changed` — `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` differs from its red snapshot for "debug stops and asks on EXIT_FOREIGN_PATH" (diff below)
- Task 15 `test-changed` — `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` differs from its red snapshot for "Step 10 label re-read skips when ISSUE_ID is empty" (diff below)
- Task 15 `red-mismatch` — no red for `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "naming warning fires issue-less when the branch is not feat/{FID}"; reds recorded for `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` "naming warning fires issue-less when the branch is not feat/FID" (passes now)
- Task 15 `not-green` — the named test "naming warning fires issue-less when the branch is not feat/{FID}" did not run; the report holds "bkit-ship.md — staging hygiene (banned patterns) > has no `git add -A` anywhere (full content)", "bkit-ship.md — staging hygiene (banned patterns) > has no literal `git add` anywhere — every stage goes through bkit ledgers", "bkit-ship.md — push-timing invariant (feature-branch pushes before merge) > pushes the feature branch only to open a missing PR, in Integrate (B2), and in Commit + Push Bookkeeping", "bkit-ship.md — push-timing invariant (feature-branch pushes before merge) > force-pushes only in Integrate (B2), and never a bare --force", "bkit-ship.md — push-timing invariant (feature-branch pushes before merge) > the pre-merge bookkeeping push is a plain push — never forced", …
- Task 15 `test-changed` — `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` differs from its red snapshot for "Step 10 MCP merge asserts base dev" (diff below)
- Task 15 `test-changed` — `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` differs from its red snapshot for "Step 14.3 labels skip when ISSUE_ID is empty" (diff below)

## Diff since red — Task 8 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-8-1.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 94d7dc78..977eb210 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-8-1.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -6,6 +6,8 @@ import * as path from "node:path";

 import { describe, expect, it } from "vitest";

+import { substituteWorkflow } from "../../render/trackers";
+
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 const PHASES = ["design", "plan", "build", "debug", "ship"] as const;
 const ALL = ["auto", ...PHASES] as const;
@@ -406,17 +408,19 @@ interface TrackerBlock {
   end: number;
 }

-/** Every tracker block (nested ones too) as a line range, markers included. */
+/** Every tracker block (nested and inline ones too) as a line range, markers included. */
 function trackerBlocks(lines: string[]): TrackerBlock[] {
   const stack: { kind: string; start: number }[] = [];
   const out: TrackerBlock[] = [];
   lines.forEach((line, i) => {
-    const m = /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/.exec(line);
-    if (!m) return;
-    if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
-    else {
-      const open = stack.pop();
-      if (open) out.push({ ...open, end: i });
+    for (const m of line.matchAll(
+      /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/g,
+    )) {
+      if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
+      else {
+        const open = stack.pop();
+        if (open) out.push({ ...open, end: i });
+      }
     }
   });
   return out;
@@ -447,22 +451,72 @@ function itemRange(lines: string[], at: number): [number, number] {
   return [at, next === -1 ? lines.length : next];
 }

+/**
+ * Issue-tied call lines from `from` on that no `Skip if ISSUE_ID empty` line guards. The line sits
+ * in a tracker block: the guard is in that block. A `false` block renders only with no tracker
+ * wired, so it holds no issue-tied call. The line sits in no block (a call that also runs under
+ * `none`): the guard is in its numbered item.
+ */
+function unguardedIssueCalls(lines: string[], from: number): string[] {
+  const blocks = trackerBlocks(lines);
+  return lines.flatMap((line, i) => {
+    if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
+    const block = innermostBlock(blocks, i);
+    if (block?.kind === "false") return [];
+    const guardFrom =
+      block?.start ??
+      lines
+        .map((l, n) => (n <= i && /^\d+\. /.test(l) ? n : -1))
+        .reduce((a, b) => Math.max(a, b), -1);
+    const guarded =
+      guardFrom >= 0 && lines.slice(guardFrom, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
+    return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
+  });
+}
+
+/** Line indexes of the `issues labels --board=` fences. */
+const boardFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) =>
+    l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
+  );
+
+/** Line indexes that post a Failure Path `comment`. */
+const commentPosts = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+
+/** A Failure Path comment post is guarded on its own line or by a Skip line in its tracker block. */
+function guardedPost(lines: string[], blocks: TrackerBlock[], i: number): boolean {
+  const block = innermostBlock(blocks, i);
+  return (
+    lines[i]!.includes("`ISSUE_ID` empty") ||
+    (block !== undefined && lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)))
+  );
+}
+
+/** Tracker blocks lying wholly inside the line range. */
+const blocksWithin = (lines: string[], from: number, to: number): TrackerBlock[] =>
+  trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+
+/** The wired-tracker blocks of Step 1 that read blockers. */
+const blockerBlocks = (step1: string[]): TrackerBlock[] =>
+  trackerBlocks(step1).filter(
+    (b) =>
+      ["github", "linear", "jira"].includes(b.kind) &&
+      /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
+  );
+
+/** Line indexes of `branches push` fences. */
+const pushFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+
 describe("issue-less runs", () => {
   it.each(PHASES)(
     "%s: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty",
     (name) => {
       const lines = workflow(name).split("\n");
-      const blocks = trackerBlocks(lines);
       const from = bodyStart(lines);
       expect(from, name).toBeGreaterThan(0);
-      const unguarded = lines.flatMap((line, i) => {
-        if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
-        const block = innermostBlock(blocks, i);
-        const guarded =
-          block !== undefined &&
-          lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
-        return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
-      });
+      const unguarded = unguardedIssueCalls(lines, from);
       expect(unguarded, `${name}: issue-tied calls with no Skip if ISSUE_ID empty`).toEqual([]);
     },
   );
@@ -472,9 +526,7 @@ describe("issue-less runs", () => {
     (name) => {
       const lines = workflow(name).split("\n");
       const blocks = trackerBlocks(lines);
-      const fences = lines.flatMap((l, i) =>
-        l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
-      );
+      const fences = boardFences(lines);
       expect(fences.length, `${name}: no issues labels --board fence found`).toBeGreaterThanOrEqual(
         2,
       );
@@ -501,7 +553,8 @@ describe("issue-less runs", () => {
   });

   it.each(PHASES)("%s: fids check and steps gate carry --issue in every workflow", (name) => {
-    const text = workflow(name);
+    // The flag sits in a tracker block (a `none` run has no issue), so read the wired render.
+    const text = substituteWorkflow(workflow(name), "github").output;
     const step1 = section(text, /Step 1 — Start Workflow/);
     expect(commandLines(step1, "fids check"), name).toEqual([
       expect.stringContaining('--fid="{FID}" --issue="{ISSUE_ID}"'),
@@ -604,15 +657,13 @@ describe("issue-less runs", () => {
   it.each(PHASES)("%s: every Failure Path comment post sits behind the ISSUE_ID guard", (name) => {
     const failure = section(workflow(name), /Failure Path/).split("\n");
     const blocks = trackerBlocks(failure);
-    const posts = failure.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+    const posts = commentPosts(failure);
     expect(posts.length, name).toBeGreaterThan(0);
     for (const i of posts) {
-      const block = innermostBlock(blocks, i);
-      const guarded =
-        failure[i]!.includes("`ISSUE_ID` empty") ||
-        (block !== undefined &&
-          failure.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)));
-      expect(guarded, `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`).toBe(true);
+      expect(
+        guardedPost(failure, blocks, i),
+        `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`,
+      ).toBe(true);
     }
   });

@@ -625,7 +676,7 @@ describe("issue-less runs", () => {
       const at = lines.findIndex((l) => /^9\. .*(?:post-push|kill-switch)/i.test(l));
       expect(at, `${name}: kill-switch sub-step 9`).toBeGreaterThanOrEqual(0);
       const [from, to] = itemRange(lines, at);
-      const blocks = trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+      const blocks = blocksWithin(lines, from, to);
       expect(blocks.length, name).toBeGreaterThan(0);
       for (const b of blocks) {
         expect(
@@ -638,11 +689,7 @@ describe("issue-less runs", () => {

   it("build Step 1 blocker check skips when ISSUE_ID is empty", () => {
     const step1 = section(workflow("build"), /Step 1 — Start Workflow/).split("\n");
-    const blockers = trackerBlocks(step1).filter(
-      (b) =>
-        ["github", "linear", "jira"].includes(b.kind) &&
-        /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
-    );
+    const blockers = blockerBlocks(step1);
     expect(blockers).toHaveLength(3);
     for (const b of blockers) {
       expect(step1.slice(b.start, b.end + 1).join("\n")).toContain(SKIP_NO_ISSUE);
@@ -699,7 +746,7 @@ describe("debug on dev", () => {
   it("debug Steps 9 and 10 push nothing on dev", () => {
     for (const heading of [/Step 9 — Push Remediation/, /Step 10 — Summary/]) {
       const lines = section(debug, heading).split("\n");
-      const pushes = lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+      const pushes = pushFences(lines);
       expect(pushes.length, `${heading}: no branches push fence`).toBeGreaterThan(0);
       for (const i of pushes) {
         // Opening fence at i - 1; the line above it carries the dev skip.
```

## Diff since red — Task 8 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-8-2.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 94d7dc78..977eb210 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-8-2.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -6,6 +6,8 @@ import * as path from "node:path";

 import { describe, expect, it } from "vitest";

+import { substituteWorkflow } from "../../render/trackers";
+
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 const PHASES = ["design", "plan", "build", "debug", "ship"] as const;
 const ALL = ["auto", ...PHASES] as const;
@@ -406,17 +408,19 @@ interface TrackerBlock {
   end: number;
 }

-/** Every tracker block (nested ones too) as a line range, markers included. */
+/** Every tracker block (nested and inline ones too) as a line range, markers included. */
 function trackerBlocks(lines: string[]): TrackerBlock[] {
   const stack: { kind: string; start: number }[] = [];
   const out: TrackerBlock[] = [];
   lines.forEach((line, i) => {
-    const m = /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/.exec(line);
-    if (!m) return;
-    if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
-    else {
-      const open = stack.pop();
-      if (open) out.push({ ...open, end: i });
+    for (const m of line.matchAll(
+      /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/g,
+    )) {
+      if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
+      else {
+        const open = stack.pop();
+        if (open) out.push({ ...open, end: i });
+      }
     }
   });
   return out;
@@ -447,22 +451,72 @@ function itemRange(lines: string[], at: number): [number, number] {
   return [at, next === -1 ? lines.length : next];
 }

+/**
+ * Issue-tied call lines from `from` on that no `Skip if ISSUE_ID empty` line guards. The line sits
+ * in a tracker block: the guard is in that block. A `false` block renders only with no tracker
+ * wired, so it holds no issue-tied call. The line sits in no block (a call that also runs under
+ * `none`): the guard is in its numbered item.
+ */
+function unguardedIssueCalls(lines: string[], from: number): string[] {
+  const blocks = trackerBlocks(lines);
+  return lines.flatMap((line, i) => {
+    if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
+    const block = innermostBlock(blocks, i);
+    if (block?.kind === "false") return [];
+    const guardFrom =
+      block?.start ??
+      lines
+        .map((l, n) => (n <= i && /^\d+\. /.test(l) ? n : -1))
+        .reduce((a, b) => Math.max(a, b), -1);
+    const guarded =
+      guardFrom >= 0 && lines.slice(guardFrom, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
+    return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
+  });
+}
+
+/** Line indexes of the `issues labels --board=` fences. */
+const boardFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) =>
+    l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
+  );
+
+/** Line indexes that post a Failure Path `comment`. */
+const commentPosts = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+
+/** A Failure Path comment post is guarded on its own line or by a Skip line in its tracker block. */
+function guardedPost(lines: string[], blocks: TrackerBlock[], i: number): boolean {
+  const block = innermostBlock(blocks, i);
+  return (
+    lines[i]!.includes("`ISSUE_ID` empty") ||
+    (block !== undefined && lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)))
+  );
+}
+
+/** Tracker blocks lying wholly inside the line range. */
+const blocksWithin = (lines: string[], from: number, to: number): TrackerBlock[] =>
+  trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+
+/** The wired-tracker blocks of Step 1 that read blockers. */
+const blockerBlocks = (step1: string[]): TrackerBlock[] =>
+  trackerBlocks(step1).filter(
+    (b) =>
+      ["github", "linear", "jira"].includes(b.kind) &&
+      /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
+  );
+
+/** Line indexes of `branches push` fences. */
+const pushFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+
 describe("issue-less runs", () => {
   it.each(PHASES)(
     "%s: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty",
     (name) => {
       const lines = workflow(name).split("\n");
-      const blocks = trackerBlocks(lines);
       const from = bodyStart(lines);
       expect(from, name).toBeGreaterThan(0);
-      const unguarded = lines.flatMap((line, i) => {
-        if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
-        const block = innermostBlock(blocks, i);
-        const guarded =
-          block !== undefined &&
-          lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
-        return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
-      });
+      const unguarded = unguardedIssueCalls(lines, from);
       expect(unguarded, `${name}: issue-tied calls with no Skip if ISSUE_ID empty`).toEqual([]);
     },
   );
@@ -472,9 +526,7 @@ describe("issue-less runs", () => {
     (name) => {
       const lines = workflow(name).split("\n");
       const blocks = trackerBlocks(lines);
-      const fences = lines.flatMap((l, i) =>
-        l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
-      );
+      const fences = boardFences(lines);
       expect(fences.length, `${name}: no issues labels --board fence found`).toBeGreaterThanOrEqual(
         2,
       );
@@ -501,7 +553,8 @@ describe("issue-less runs", () => {
   });

   it.each(PHASES)("%s: fids check and steps gate carry --issue in every workflow", (name) => {
-    const text = workflow(name);
+    // The flag sits in a tracker block (a `none` run has no issue), so read the wired render.
+    const text = substituteWorkflow(workflow(name), "github").output;
     const step1 = section(text, /Step 1 — Start Workflow/);
     expect(commandLines(step1, "fids check"), name).toEqual([
       expect.stringContaining('--fid="{FID}" --issue="{ISSUE_ID}"'),
@@ -604,15 +657,13 @@ describe("issue-less runs", () => {
   it.each(PHASES)("%s: every Failure Path comment post sits behind the ISSUE_ID guard", (name) => {
     const failure = section(workflow(name), /Failure Path/).split("\n");
     const blocks = trackerBlocks(failure);
-    const posts = failure.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+    const posts = commentPosts(failure);
     expect(posts.length, name).toBeGreaterThan(0);
     for (const i of posts) {
-      const block = innermostBlock(blocks, i);
-      const guarded =
-        failure[i]!.includes("`ISSUE_ID` empty") ||
-        (block !== undefined &&
-          failure.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)));
-      expect(guarded, `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`).toBe(true);
+      expect(
+        guardedPost(failure, blocks, i),
+        `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`,
+      ).toBe(true);
     }
   });

@@ -625,7 +676,7 @@ describe("issue-less runs", () => {
       const at = lines.findIndex((l) => /^9\. .*(?:post-push|kill-switch)/i.test(l));
       expect(at, `${name}: kill-switch sub-step 9`).toBeGreaterThanOrEqual(0);
       const [from, to] = itemRange(lines, at);
-      const blocks = trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+      const blocks = blocksWithin(lines, from, to);
       expect(blocks.length, name).toBeGreaterThan(0);
       for (const b of blocks) {
         expect(
@@ -638,11 +689,7 @@ describe("issue-less runs", () => {

   it("build Step 1 blocker check skips when ISSUE_ID is empty", () => {
     const step1 = section(workflow("build"), /Step 1 — Start Workflow/).split("\n");
-    const blockers = trackerBlocks(step1).filter(
-      (b) =>
-        ["github", "linear", "jira"].includes(b.kind) &&
-        /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
-    );
+    const blockers = blockerBlocks(step1);
     expect(blockers).toHaveLength(3);
     for (const b of blockers) {
       expect(step1.slice(b.start, b.end + 1).join("\n")).toContain(SKIP_NO_ISSUE);
@@ -699,7 +746,7 @@ describe("debug on dev", () => {
   it("debug Steps 9 and 10 push nothing on dev", () => {
     for (const heading of [/Step 9 — Push Remediation/, /Step 10 — Summary/]) {
       const lines = section(debug, heading).split("\n");
-      const pushes = lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+      const pushes = pushFences(lines);
       expect(pushes.length, `${heading}: no branches push fence`).toBeGreaterThan(0);
       for (const i of pushes) {
         // Opening fence at i - 1; the line above it carries the dev skip.
```

## Diff since red — Task 8 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-8-3.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 94d7dc78..977eb210 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-8-3.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -6,6 +6,8 @@ import * as path from "node:path";

 import { describe, expect, it } from "vitest";

+import { substituteWorkflow } from "../../render/trackers";
+
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 const PHASES = ["design", "plan", "build", "debug", "ship"] as const;
 const ALL = ["auto", ...PHASES] as const;
@@ -406,17 +408,19 @@ interface TrackerBlock {
   end: number;
 }

-/** Every tracker block (nested ones too) as a line range, markers included. */
+/** Every tracker block (nested and inline ones too) as a line range, markers included. */
 function trackerBlocks(lines: string[]): TrackerBlock[] {
   const stack: { kind: string; start: number }[] = [];
   const out: TrackerBlock[] = [];
   lines.forEach((line, i) => {
-    const m = /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/.exec(line);
-    if (!m) return;
-    if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
-    else {
-      const open = stack.pop();
-      if (open) out.push({ ...open, end: i });
+    for (const m of line.matchAll(
+      /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/g,
+    )) {
+      if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
+      else {
+        const open = stack.pop();
+        if (open) out.push({ ...open, end: i });
+      }
     }
   });
   return out;
@@ -447,22 +451,72 @@ function itemRange(lines: string[], at: number): [number, number] {
   return [at, next === -1 ? lines.length : next];
 }

+/**
+ * Issue-tied call lines from `from` on that no `Skip if ISSUE_ID empty` line guards. The line sits
+ * in a tracker block: the guard is in that block. A `false` block renders only with no tracker
+ * wired, so it holds no issue-tied call. The line sits in no block (a call that also runs under
+ * `none`): the guard is in its numbered item.
+ */
+function unguardedIssueCalls(lines: string[], from: number): string[] {
+  const blocks = trackerBlocks(lines);
+  return lines.flatMap((line, i) => {
+    if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
+    const block = innermostBlock(blocks, i);
+    if (block?.kind === "false") return [];
+    const guardFrom =
+      block?.start ??
+      lines
+        .map((l, n) => (n <= i && /^\d+\. /.test(l) ? n : -1))
+        .reduce((a, b) => Math.max(a, b), -1);
+    const guarded =
+      guardFrom >= 0 && lines.slice(guardFrom, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
+    return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
+  });
+}
+
+/** Line indexes of the `issues labels --board=` fences. */
+const boardFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) =>
+    l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
+  );
+
+/** Line indexes that post a Failure Path `comment`. */
+const commentPosts = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+
+/** A Failure Path comment post is guarded on its own line or by a Skip line in its tracker block. */
+function guardedPost(lines: string[], blocks: TrackerBlock[], i: number): boolean {
+  const block = innermostBlock(blocks, i);
+  return (
+    lines[i]!.includes("`ISSUE_ID` empty") ||
+    (block !== undefined && lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)))
+  );
+}
+
+/** Tracker blocks lying wholly inside the line range. */
+const blocksWithin = (lines: string[], from: number, to: number): TrackerBlock[] =>
+  trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+
+/** The wired-tracker blocks of Step 1 that read blockers. */
+const blockerBlocks = (step1: string[]): TrackerBlock[] =>
+  trackerBlocks(step1).filter(
+    (b) =>
+      ["github", "linear", "jira"].includes(b.kind) &&
+      /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
+  );
+
+/** Line indexes of `branches push` fences. */
+const pushFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+
 describe("issue-less runs", () => {
   it.each(PHASES)(
     "%s: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty",
     (name) => {
       const lines = workflow(name).split("\n");
-      const blocks = trackerBlocks(lines);
       const from = bodyStart(lines);
       expect(from, name).toBeGreaterThan(0);
-      const unguarded = lines.flatMap((line, i) => {
-        if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
-        const block = innermostBlock(blocks, i);
-        const guarded =
-          block !== undefined &&
-          lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
-        return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
-      });
+      const unguarded = unguardedIssueCalls(lines, from);
       expect(unguarded, `${name}: issue-tied calls with no Skip if ISSUE_ID empty`).toEqual([]);
     },
   );
@@ -472,9 +526,7 @@ describe("issue-less runs", () => {
     (name) => {
       const lines = workflow(name).split("\n");
       const blocks = trackerBlocks(lines);
-      const fences = lines.flatMap((l, i) =>
-        l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
-      );
+      const fences = boardFences(lines);
       expect(fences.length, `${name}: no issues labels --board fence found`).toBeGreaterThanOrEqual(
         2,
       );
@@ -501,7 +553,8 @@ describe("issue-less runs", () => {
   });

   it.each(PHASES)("%s: fids check and steps gate carry --issue in every workflow", (name) => {
-    const text = workflow(name);
+    // The flag sits in a tracker block (a `none` run has no issue), so read the wired render.
+    const text = substituteWorkflow(workflow(name), "github").output;
     const step1 = section(text, /Step 1 — Start Workflow/);
     expect(commandLines(step1, "fids check"), name).toEqual([
       expect.stringContaining('--fid="{FID}" --issue="{ISSUE_ID}"'),
@@ -604,15 +657,13 @@ describe("issue-less runs", () => {
   it.each(PHASES)("%s: every Failure Path comment post sits behind the ISSUE_ID guard", (name) => {
     const failure = section(workflow(name), /Failure Path/).split("\n");
     const blocks = trackerBlocks(failure);
-    const posts = failure.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+    const posts = commentPosts(failure);
     expect(posts.length, name).toBeGreaterThan(0);
     for (const i of posts) {
-      const block = innermostBlock(blocks, i);
-      const guarded =
-        failure[i]!.includes("`ISSUE_ID` empty") ||
-        (block !== undefined &&
-          failure.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)));
-      expect(guarded, `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`).toBe(true);
+      expect(
+        guardedPost(failure, blocks, i),
+        `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`,
+      ).toBe(true);
     }
   });

@@ -625,7 +676,7 @@ describe("issue-less runs", () => {
       const at = lines.findIndex((l) => /^9\. .*(?:post-push|kill-switch)/i.test(l));
       expect(at, `${name}: kill-switch sub-step 9`).toBeGreaterThanOrEqual(0);
       const [from, to] = itemRange(lines, at);
-      const blocks = trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+      const blocks = blocksWithin(lines, from, to);
       expect(blocks.length, name).toBeGreaterThan(0);
       for (const b of blocks) {
         expect(
@@ -638,11 +689,7 @@ describe("issue-less runs", () => {

   it("build Step 1 blocker check skips when ISSUE_ID is empty", () => {
     const step1 = section(workflow("build"), /Step 1 — Start Workflow/).split("\n");
-    const blockers = trackerBlocks(step1).filter(
-      (b) =>
-        ["github", "linear", "jira"].includes(b.kind) &&
-        /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
-    );
+    const blockers = blockerBlocks(step1);
     expect(blockers).toHaveLength(3);
     for (const b of blockers) {
       expect(step1.slice(b.start, b.end + 1).join("\n")).toContain(SKIP_NO_ISSUE);
@@ -699,7 +746,7 @@ describe("debug on dev", () => {
   it("debug Steps 9 and 10 push nothing on dev", () => {
     for (const heading of [/Step 9 — Push Remediation/, /Step 10 — Summary/]) {
       const lines = section(debug, heading).split("\n");
-      const pushes = lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+      const pushes = pushFences(lines);
       expect(pushes.length, `${heading}: no branches push fence`).toBeGreaterThan(0);
       for (const i of pushes) {
         // Opening fence at i - 1; the line above it carries the dev skip.
```

## Diff since red — Task 8 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-8-4.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 94d7dc78..977eb210 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-8-4.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -6,6 +6,8 @@ import * as path from "node:path";

 import { describe, expect, it } from "vitest";

+import { substituteWorkflow } from "../../render/trackers";
+
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 const PHASES = ["design", "plan", "build", "debug", "ship"] as const;
 const ALL = ["auto", ...PHASES] as const;
@@ -406,17 +408,19 @@ interface TrackerBlock {
   end: number;
 }

-/** Every tracker block (nested ones too) as a line range, markers included. */
+/** Every tracker block (nested and inline ones too) as a line range, markers included. */
 function trackerBlocks(lines: string[]): TrackerBlock[] {
   const stack: { kind: string; start: number }[] = [];
   const out: TrackerBlock[] = [];
   lines.forEach((line, i) => {
-    const m = /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/.exec(line);
-    if (!m) return;
-    if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
-    else {
-      const open = stack.pop();
-      if (open) out.push({ ...open, end: i });
+    for (const m of line.matchAll(
+      /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/g,
+    )) {
+      if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
+      else {
+        const open = stack.pop();
+        if (open) out.push({ ...open, end: i });
+      }
     }
   });
   return out;
@@ -447,22 +451,72 @@ function itemRange(lines: string[], at: number): [number, number] {
   return [at, next === -1 ? lines.length : next];
 }

+/**
+ * Issue-tied call lines from `from` on that no `Skip if ISSUE_ID empty` line guards. The line sits
+ * in a tracker block: the guard is in that block. A `false` block renders only with no tracker
+ * wired, so it holds no issue-tied call. The line sits in no block (a call that also runs under
+ * `none`): the guard is in its numbered item.
+ */
+function unguardedIssueCalls(lines: string[], from: number): string[] {
+  const blocks = trackerBlocks(lines);
+  return lines.flatMap((line, i) => {
+    if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
+    const block = innermostBlock(blocks, i);
+    if (block?.kind === "false") return [];
+    const guardFrom =
+      block?.start ??
+      lines
+        .map((l, n) => (n <= i && /^\d+\. /.test(l) ? n : -1))
+        .reduce((a, b) => Math.max(a, b), -1);
+    const guarded =
+      guardFrom >= 0 && lines.slice(guardFrom, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
+    return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
+  });
+}
+
+/** Line indexes of the `issues labels --board=` fences. */
+const boardFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) =>
+    l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
+  );
+
+/** Line indexes that post a Failure Path `comment`. */
+const commentPosts = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+
+/** A Failure Path comment post is guarded on its own line or by a Skip line in its tracker block. */
+function guardedPost(lines: string[], blocks: TrackerBlock[], i: number): boolean {
+  const block = innermostBlock(blocks, i);
+  return (
+    lines[i]!.includes("`ISSUE_ID` empty") ||
+    (block !== undefined && lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)))
+  );
+}
+
+/** Tracker blocks lying wholly inside the line range. */
+const blocksWithin = (lines: string[], from: number, to: number): TrackerBlock[] =>
+  trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+
+/** The wired-tracker blocks of Step 1 that read blockers. */
+const blockerBlocks = (step1: string[]): TrackerBlock[] =>
+  trackerBlocks(step1).filter(
+    (b) =>
+      ["github", "linear", "jira"].includes(b.kind) &&
+      /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
+  );
+
+/** Line indexes of `branches push` fences. */
+const pushFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+
 describe("issue-less runs", () => {
   it.each(PHASES)(
     "%s: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty",
     (name) => {
       const lines = workflow(name).split("\n");
-      const blocks = trackerBlocks(lines);
       const from = bodyStart(lines);
       expect(from, name).toBeGreaterThan(0);
-      const unguarded = lines.flatMap((line, i) => {
-        if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
-        const block = innermostBlock(blocks, i);
-        const guarded =
-          block !== undefined &&
-          lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
-        return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
-      });
+      const unguarded = unguardedIssueCalls(lines, from);
       expect(unguarded, `${name}: issue-tied calls with no Skip if ISSUE_ID empty`).toEqual([]);
     },
   );
@@ -472,9 +526,7 @@ describe("issue-less runs", () => {
     (name) => {
       const lines = workflow(name).split("\n");
       const blocks = trackerBlocks(lines);
-      const fences = lines.flatMap((l, i) =>
-        l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
-      );
+      const fences = boardFences(lines);
       expect(fences.length, `${name}: no issues labels --board fence found`).toBeGreaterThanOrEqual(
         2,
       );
@@ -501,7 +553,8 @@ describe("issue-less runs", () => {
   });

   it.each(PHASES)("%s: fids check and steps gate carry --issue in every workflow", (name) => {
-    const text = workflow(name);
+    // The flag sits in a tracker block (a `none` run has no issue), so read the wired render.
+    const text = substituteWorkflow(workflow(name), "github").output;
     const step1 = section(text, /Step 1 — Start Workflow/);
     expect(commandLines(step1, "fids check"), name).toEqual([
       expect.stringContaining('--fid="{FID}" --issue="{ISSUE_ID}"'),
@@ -604,15 +657,13 @@ describe("issue-less runs", () => {
   it.each(PHASES)("%s: every Failure Path comment post sits behind the ISSUE_ID guard", (name) => {
     const failure = section(workflow(name), /Failure Path/).split("\n");
     const blocks = trackerBlocks(failure);
-    const posts = failure.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+    const posts = commentPosts(failure);
     expect(posts.length, name).toBeGreaterThan(0);
     for (const i of posts) {
-      const block = innermostBlock(blocks, i);
-      const guarded =
-        failure[i]!.includes("`ISSUE_ID` empty") ||
-        (block !== undefined &&
-          failure.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)));
-      expect(guarded, `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`).toBe(true);
+      expect(
+        guardedPost(failure, blocks, i),
+        `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`,
+      ).toBe(true);
     }
   });

@@ -625,7 +676,7 @@ describe("issue-less runs", () => {
       const at = lines.findIndex((l) => /^9\. .*(?:post-push|kill-switch)/i.test(l));
       expect(at, `${name}: kill-switch sub-step 9`).toBeGreaterThanOrEqual(0);
       const [from, to] = itemRange(lines, at);
-      const blocks = trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+      const blocks = blocksWithin(lines, from, to);
       expect(blocks.length, name).toBeGreaterThan(0);
       for (const b of blocks) {
         expect(
@@ -638,11 +689,7 @@ describe("issue-less runs", () => {

   it("build Step 1 blocker check skips when ISSUE_ID is empty", () => {
     const step1 = section(workflow("build"), /Step 1 — Start Workflow/).split("\n");
-    const blockers = trackerBlocks(step1).filter(
-      (b) =>
-        ["github", "linear", "jira"].includes(b.kind) &&
-        /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
-    );
+    const blockers = blockerBlocks(step1);
     expect(blockers).toHaveLength(3);
     for (const b of blockers) {
       expect(step1.slice(b.start, b.end + 1).join("\n")).toContain(SKIP_NO_ISSUE);
@@ -699,7 +746,7 @@ describe("debug on dev", () => {
   it("debug Steps 9 and 10 push nothing on dev", () => {
     for (const heading of [/Step 9 — Push Remediation/, /Step 10 — Summary/]) {
       const lines = section(debug, heading).split("\n");
-      const pushes = lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+      const pushes = pushFences(lines);
       expect(pushes.length, `${heading}: no branches push fence`).toBeGreaterThan(0);
       for (const i of pushes) {
         // Opening fence at i - 1; the line above it carries the dev skip.
```

## Diff since red — Task 8 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-8-5.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 94d7dc78..977eb210 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-8-5.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -6,6 +6,8 @@ import * as path from "node:path";

 import { describe, expect, it } from "vitest";

+import { substituteWorkflow } from "../../render/trackers";
+
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 const PHASES = ["design", "plan", "build", "debug", "ship"] as const;
 const ALL = ["auto", ...PHASES] as const;
@@ -406,17 +408,19 @@ interface TrackerBlock {
   end: number;
 }

-/** Every tracker block (nested ones too) as a line range, markers included. */
+/** Every tracker block (nested and inline ones too) as a line range, markers included. */
 function trackerBlocks(lines: string[]): TrackerBlock[] {
   const stack: { kind: string; start: number }[] = [];
   const out: TrackerBlock[] = [];
   lines.forEach((line, i) => {
-    const m = /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/.exec(line);
-    if (!m) return;
-    if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
-    else {
-      const open = stack.pop();
-      if (open) out.push({ ...open, end: i });
+    for (const m of line.matchAll(
+      /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/g,
+    )) {
+      if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
+      else {
+        const open = stack.pop();
+        if (open) out.push({ ...open, end: i });
+      }
     }
   });
   return out;
@@ -447,22 +451,72 @@ function itemRange(lines: string[], at: number): [number, number] {
   return [at, next === -1 ? lines.length : next];
 }

+/**
+ * Issue-tied call lines from `from` on that no `Skip if ISSUE_ID empty` line guards. The line sits
+ * in a tracker block: the guard is in that block. A `false` block renders only with no tracker
+ * wired, so it holds no issue-tied call. The line sits in no block (a call that also runs under
+ * `none`): the guard is in its numbered item.
+ */
+function unguardedIssueCalls(lines: string[], from: number): string[] {
+  const blocks = trackerBlocks(lines);
+  return lines.flatMap((line, i) => {
+    if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
+    const block = innermostBlock(blocks, i);
+    if (block?.kind === "false") return [];
+    const guardFrom =
+      block?.start ??
+      lines
+        .map((l, n) => (n <= i && /^\d+\. /.test(l) ? n : -1))
+        .reduce((a, b) => Math.max(a, b), -1);
+    const guarded =
+      guardFrom >= 0 && lines.slice(guardFrom, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
+    return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
+  });
+}
+
+/** Line indexes of the `issues labels --board=` fences. */
+const boardFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) =>
+    l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
+  );
+
+/** Line indexes that post a Failure Path `comment`. */
+const commentPosts = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+
+/** A Failure Path comment post is guarded on its own line or by a Skip line in its tracker block. */
+function guardedPost(lines: string[], blocks: TrackerBlock[], i: number): boolean {
+  const block = innermostBlock(blocks, i);
+  return (
+    lines[i]!.includes("`ISSUE_ID` empty") ||
+    (block !== undefined && lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)))
+  );
+}
+
+/** Tracker blocks lying wholly inside the line range. */
+const blocksWithin = (lines: string[], from: number, to: number): TrackerBlock[] =>
+  trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+
+/** The wired-tracker blocks of Step 1 that read blockers. */
+const blockerBlocks = (step1: string[]): TrackerBlock[] =>
+  trackerBlocks(step1).filter(
+    (b) =>
+      ["github", "linear", "jira"].includes(b.kind) &&
+      /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
+  );
+
+/** Line indexes of `branches push` fences. */
+const pushFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+
 describe("issue-less runs", () => {
   it.each(PHASES)(
     "%s: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty",
     (name) => {
       const lines = workflow(name).split("\n");
-      const blocks = trackerBlocks(lines);
       const from = bodyStart(lines);
       expect(from, name).toBeGreaterThan(0);
-      const unguarded = lines.flatMap((line, i) => {
-        if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
-        const block = innermostBlock(blocks, i);
-        const guarded =
-          block !== undefined &&
-          lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
-        return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
-      });
+      const unguarded = unguardedIssueCalls(lines, from);
       expect(unguarded, `${name}: issue-tied calls with no Skip if ISSUE_ID empty`).toEqual([]);
     },
   );
@@ -472,9 +526,7 @@ describe("issue-less runs", () => {
     (name) => {
       const lines = workflow(name).split("\n");
       const blocks = trackerBlocks(lines);
-      const fences = lines.flatMap((l, i) =>
-        l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
-      );
+      const fences = boardFences(lines);
       expect(fences.length, `${name}: no issues labels --board fence found`).toBeGreaterThanOrEqual(
         2,
       );
@@ -501,7 +553,8 @@ describe("issue-less runs", () => {
   });

   it.each(PHASES)("%s: fids check and steps gate carry --issue in every workflow", (name) => {
-    const text = workflow(name);
+    // The flag sits in a tracker block (a `none` run has no issue), so read the wired render.
+    const text = substituteWorkflow(workflow(name), "github").output;
     const step1 = section(text, /Step 1 — Start Workflow/);
     expect(commandLines(step1, "fids check"), name).toEqual([
       expect.stringContaining('--fid="{FID}" --issue="{ISSUE_ID}"'),
@@ -604,15 +657,13 @@ describe("issue-less runs", () => {
   it.each(PHASES)("%s: every Failure Path comment post sits behind the ISSUE_ID guard", (name) => {
     const failure = section(workflow(name), /Failure Path/).split("\n");
     const blocks = trackerBlocks(failure);
-    const posts = failure.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+    const posts = commentPosts(failure);
     expect(posts.length, name).toBeGreaterThan(0);
     for (const i of posts) {
-      const block = innermostBlock(blocks, i);
-      const guarded =
-        failure[i]!.includes("`ISSUE_ID` empty") ||
-        (block !== undefined &&
-          failure.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)));
-      expect(guarded, `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`).toBe(true);
+      expect(
+        guardedPost(failure, blocks, i),
+        `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`,
+      ).toBe(true);
     }
   });

@@ -625,7 +676,7 @@ describe("issue-less runs", () => {
       const at = lines.findIndex((l) => /^9\. .*(?:post-push|kill-switch)/i.test(l));
       expect(at, `${name}: kill-switch sub-step 9`).toBeGreaterThanOrEqual(0);
       const [from, to] = itemRange(lines, at);
-      const blocks = trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+      const blocks = blocksWithin(lines, from, to);
       expect(blocks.length, name).toBeGreaterThan(0);
       for (const b of blocks) {
         expect(
@@ -638,11 +689,7 @@ describe("issue-less runs", () => {

   it("build Step 1 blocker check skips when ISSUE_ID is empty", () => {
     const step1 = section(workflow("build"), /Step 1 — Start Workflow/).split("\n");
-    const blockers = trackerBlocks(step1).filter(
-      (b) =>
-        ["github", "linear", "jira"].includes(b.kind) &&
-        /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
-    );
+    const blockers = blockerBlocks(step1);
     expect(blockers).toHaveLength(3);
     for (const b of blockers) {
       expect(step1.slice(b.start, b.end + 1).join("\n")).toContain(SKIP_NO_ISSUE);
@@ -699,7 +746,7 @@ describe("debug on dev", () => {
   it("debug Steps 9 and 10 push nothing on dev", () => {
     for (const heading of [/Step 9 — Push Remediation/, /Step 10 — Summary/]) {
       const lines = section(debug, heading).split("\n");
-      const pushes = lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+      const pushes = pushFences(lines);
       expect(pushes.length, `${heading}: no branches push fence`).toBeGreaterThan(0);
       for (const i of pushes) {
         // Opening fence at i - 1; the line above it carries the dev skip.
```

## Diff since red — Task 8 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-8-6.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 94d7dc78..977eb210 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-8-6.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -6,6 +6,8 @@ import * as path from "node:path";

 import { describe, expect, it } from "vitest";

+import { substituteWorkflow } from "../../render/trackers";
+
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 const PHASES = ["design", "plan", "build", "debug", "ship"] as const;
 const ALL = ["auto", ...PHASES] as const;
@@ -406,17 +408,19 @@ interface TrackerBlock {
   end: number;
 }

-/** Every tracker block (nested ones too) as a line range, markers included. */
+/** Every tracker block (nested and inline ones too) as a line range, markers included. */
 function trackerBlocks(lines: string[]): TrackerBlock[] {
   const stack: { kind: string; start: number }[] = [];
   const out: TrackerBlock[] = [];
   lines.forEach((line, i) => {
-    const m = /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/.exec(line);
-    if (!m) return;
-    if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
-    else {
-      const open = stack.pop();
-      if (open) out.push({ ...open, end: i });
+    for (const m of line.matchAll(
+      /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/g,
+    )) {
+      if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
+      else {
+        const open = stack.pop();
+        if (open) out.push({ ...open, end: i });
+      }
     }
   });
   return out;
@@ -447,22 +451,72 @@ function itemRange(lines: string[], at: number): [number, number] {
   return [at, next === -1 ? lines.length : next];
 }

+/**
+ * Issue-tied call lines from `from` on that no `Skip if ISSUE_ID empty` line guards. The line sits
+ * in a tracker block: the guard is in that block. A `false` block renders only with no tracker
+ * wired, so it holds no issue-tied call. The line sits in no block (a call that also runs under
+ * `none`): the guard is in its numbered item.
+ */
+function unguardedIssueCalls(lines: string[], from: number): string[] {
+  const blocks = trackerBlocks(lines);
+  return lines.flatMap((line, i) => {
+    if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
+    const block = innermostBlock(blocks, i);
+    if (block?.kind === "false") return [];
+    const guardFrom =
+      block?.start ??
+      lines
+        .map((l, n) => (n <= i && /^\d+\. /.test(l) ? n : -1))
+        .reduce((a, b) => Math.max(a, b), -1);
+    const guarded =
+      guardFrom >= 0 && lines.slice(guardFrom, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
+    return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
+  });
+}
+
+/** Line indexes of the `issues labels --board=` fences. */
+const boardFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) =>
+    l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
+  );
+
+/** Line indexes that post a Failure Path `comment`. */
+const commentPosts = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+
+/** A Failure Path comment post is guarded on its own line or by a Skip line in its tracker block. */
+function guardedPost(lines: string[], blocks: TrackerBlock[], i: number): boolean {
+  const block = innermostBlock(blocks, i);
+  return (
+    lines[i]!.includes("`ISSUE_ID` empty") ||
+    (block !== undefined && lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)))
+  );
+}
+
+/** Tracker blocks lying wholly inside the line range. */
+const blocksWithin = (lines: string[], from: number, to: number): TrackerBlock[] =>
+  trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+
+/** The wired-tracker blocks of Step 1 that read blockers. */
+const blockerBlocks = (step1: string[]): TrackerBlock[] =>
+  trackerBlocks(step1).filter(
+    (b) =>
+      ["github", "linear", "jira"].includes(b.kind) &&
+      /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
+  );
+
+/** Line indexes of `branches push` fences. */
+const pushFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+
 describe("issue-less runs", () => {
   it.each(PHASES)(
     "%s: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty",
     (name) => {
       const lines = workflow(name).split("\n");
-      const blocks = trackerBlocks(lines);
       const from = bodyStart(lines);
       expect(from, name).toBeGreaterThan(0);
-      const unguarded = lines.flatMap((line, i) => {
-        if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
-        const block = innermostBlock(blocks, i);
-        const guarded =
-          block !== undefined &&
-          lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
-        return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
-      });
+      const unguarded = unguardedIssueCalls(lines, from);
       expect(unguarded, `${name}: issue-tied calls with no Skip if ISSUE_ID empty`).toEqual([]);
     },
   );
@@ -472,9 +526,7 @@ describe("issue-less runs", () => {
     (name) => {
       const lines = workflow(name).split("\n");
       const blocks = trackerBlocks(lines);
-      const fences = lines.flatMap((l, i) =>
-        l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
-      );
+      const fences = boardFences(lines);
       expect(fences.length, `${name}: no issues labels --board fence found`).toBeGreaterThanOrEqual(
         2,
       );
@@ -501,7 +553,8 @@ describe("issue-less runs", () => {
   });

   it.each(PHASES)("%s: fids check and steps gate carry --issue in every workflow", (name) => {
-    const text = workflow(name);
+    // The flag sits in a tracker block (a `none` run has no issue), so read the wired render.
+    const text = substituteWorkflow(workflow(name), "github").output;
     const step1 = section(text, /Step 1 — Start Workflow/);
     expect(commandLines(step1, "fids check"), name).toEqual([
       expect.stringContaining('--fid="{FID}" --issue="{ISSUE_ID}"'),
@@ -604,15 +657,13 @@ describe("issue-less runs", () => {
   it.each(PHASES)("%s: every Failure Path comment post sits behind the ISSUE_ID guard", (name) => {
     const failure = section(workflow(name), /Failure Path/).split("\n");
     const blocks = trackerBlocks(failure);
-    const posts = failure.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+    const posts = commentPosts(failure);
     expect(posts.length, name).toBeGreaterThan(0);
     for (const i of posts) {
-      const block = innermostBlock(blocks, i);
-      const guarded =
-        failure[i]!.includes("`ISSUE_ID` empty") ||
-        (block !== undefined &&
-          failure.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)));
-      expect(guarded, `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`).toBe(true);
+      expect(
+        guardedPost(failure, blocks, i),
+        `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`,
+      ).toBe(true);
     }
   });

@@ -625,7 +676,7 @@ describe("issue-less runs", () => {
       const at = lines.findIndex((l) => /^9\. .*(?:post-push|kill-switch)/i.test(l));
       expect(at, `${name}: kill-switch sub-step 9`).toBeGreaterThanOrEqual(0);
       const [from, to] = itemRange(lines, at);
-      const blocks = trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+      const blocks = blocksWithin(lines, from, to);
       expect(blocks.length, name).toBeGreaterThan(0);
       for (const b of blocks) {
         expect(
@@ -638,11 +689,7 @@ describe("issue-less runs", () => {

   it("build Step 1 blocker check skips when ISSUE_ID is empty", () => {
     const step1 = section(workflow("build"), /Step 1 — Start Workflow/).split("\n");
-    const blockers = trackerBlocks(step1).filter(
-      (b) =>
-        ["github", "linear", "jira"].includes(b.kind) &&
-        /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
-    );
+    const blockers = blockerBlocks(step1);
     expect(blockers).toHaveLength(3);
     for (const b of blockers) {
       expect(step1.slice(b.start, b.end + 1).join("\n")).toContain(SKIP_NO_ISSUE);
@@ -699,7 +746,7 @@ describe("debug on dev", () => {
   it("debug Steps 9 and 10 push nothing on dev", () => {
     for (const heading of [/Step 9 — Push Remediation/, /Step 10 — Summary/]) {
       const lines = section(debug, heading).split("\n");
-      const pushes = lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+      const pushes = pushFences(lines);
       expect(pushes.length, `${heading}: no branches push fence`).toBeGreaterThan(0);
       for (const i of pushes) {
         // Opening fence at i - 1; the line above it carries the dev skip.
```

## Diff since red — Task 8 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-8-7.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 94d7dc78..977eb210 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-8-7.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -6,6 +6,8 @@ import * as path from "node:path";

 import { describe, expect, it } from "vitest";

+import { substituteWorkflow } from "../../render/trackers";
+
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 const PHASES = ["design", "plan", "build", "debug", "ship"] as const;
 const ALL = ["auto", ...PHASES] as const;
@@ -406,17 +408,19 @@ interface TrackerBlock {
   end: number;
 }

-/** Every tracker block (nested ones too) as a line range, markers included. */
+/** Every tracker block (nested and inline ones too) as a line range, markers included. */
 function trackerBlocks(lines: string[]): TrackerBlock[] {
   const stack: { kind: string; start: number }[] = [];
   const out: TrackerBlock[] = [];
   lines.forEach((line, i) => {
-    const m = /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/.exec(line);
-    if (!m) return;
-    if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
-    else {
-      const open = stack.pop();
-      if (open) out.push({ ...open, end: i });
+    for (const m of line.matchAll(
+      /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/g,
+    )) {
+      if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
+      else {
+        const open = stack.pop();
+        if (open) out.push({ ...open, end: i });
+      }
     }
   });
   return out;
@@ -447,22 +451,72 @@ function itemRange(lines: string[], at: number): [number, number] {
   return [at, next === -1 ? lines.length : next];
 }

+/**
+ * Issue-tied call lines from `from` on that no `Skip if ISSUE_ID empty` line guards. The line sits
+ * in a tracker block: the guard is in that block. A `false` block renders only with no tracker
+ * wired, so it holds no issue-tied call. The line sits in no block (a call that also runs under
+ * `none`): the guard is in its numbered item.
+ */
+function unguardedIssueCalls(lines: string[], from: number): string[] {
+  const blocks = trackerBlocks(lines);
+  return lines.flatMap((line, i) => {
+    if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
+    const block = innermostBlock(blocks, i);
+    if (block?.kind === "false") return [];
+    const guardFrom =
+      block?.start ??
+      lines
+        .map((l, n) => (n <= i && /^\d+\. /.test(l) ? n : -1))
+        .reduce((a, b) => Math.max(a, b), -1);
+    const guarded =
+      guardFrom >= 0 && lines.slice(guardFrom, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
+    return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
+  });
+}
+
+/** Line indexes of the `issues labels --board=` fences. */
+const boardFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) =>
+    l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
+  );
+
+/** Line indexes that post a Failure Path `comment`. */
+const commentPosts = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+
+/** A Failure Path comment post is guarded on its own line or by a Skip line in its tracker block. */
+function guardedPost(lines: string[], blocks: TrackerBlock[], i: number): boolean {
+  const block = innermostBlock(blocks, i);
+  return (
+    lines[i]!.includes("`ISSUE_ID` empty") ||
+    (block !== undefined && lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)))
+  );
+}
+
+/** Tracker blocks lying wholly inside the line range. */
+const blocksWithin = (lines: string[], from: number, to: number): TrackerBlock[] =>
+  trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+
+/** The wired-tracker blocks of Step 1 that read blockers. */
+const blockerBlocks = (step1: string[]): TrackerBlock[] =>
+  trackerBlocks(step1).filter(
+    (b) =>
+      ["github", "linear", "jira"].includes(b.kind) &&
+      /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
+  );
+
+/** Line indexes of `branches push` fences. */
+const pushFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+
 describe("issue-less runs", () => {
   it.each(PHASES)(
     "%s: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty",
     (name) => {
       const lines = workflow(name).split("\n");
-      const blocks = trackerBlocks(lines);
       const from = bodyStart(lines);
       expect(from, name).toBeGreaterThan(0);
-      const unguarded = lines.flatMap((line, i) => {
-        if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
-        const block = innermostBlock(blocks, i);
-        const guarded =
-          block !== undefined &&
-          lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
-        return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
-      });
+      const unguarded = unguardedIssueCalls(lines, from);
       expect(unguarded, `${name}: issue-tied calls with no Skip if ISSUE_ID empty`).toEqual([]);
     },
   );
@@ -472,9 +526,7 @@ describe("issue-less runs", () => {
     (name) => {
       const lines = workflow(name).split("\n");
       const blocks = trackerBlocks(lines);
-      const fences = lines.flatMap((l, i) =>
-        l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
-      );
+      const fences = boardFences(lines);
       expect(fences.length, `${name}: no issues labels --board fence found`).toBeGreaterThanOrEqual(
         2,
       );
@@ -501,7 +553,8 @@ describe("issue-less runs", () => {
   });

   it.each(PHASES)("%s: fids check and steps gate carry --issue in every workflow", (name) => {
-    const text = workflow(name);
+    // The flag sits in a tracker block (a `none` run has no issue), so read the wired render.
+    const text = substituteWorkflow(workflow(name), "github").output;
     const step1 = section(text, /Step 1 — Start Workflow/);
     expect(commandLines(step1, "fids check"), name).toEqual([
       expect.stringContaining('--fid="{FID}" --issue="{ISSUE_ID}"'),
@@ -604,15 +657,13 @@ describe("issue-less runs", () => {
   it.each(PHASES)("%s: every Failure Path comment post sits behind the ISSUE_ID guard", (name) => {
     const failure = section(workflow(name), /Failure Path/).split("\n");
     const blocks = trackerBlocks(failure);
-    const posts = failure.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+    const posts = commentPosts(failure);
     expect(posts.length, name).toBeGreaterThan(0);
     for (const i of posts) {
-      const block = innermostBlock(blocks, i);
-      const guarded =
-        failure[i]!.includes("`ISSUE_ID` empty") ||
-        (block !== undefined &&
-          failure.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)));
-      expect(guarded, `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`).toBe(true);
+      expect(
+        guardedPost(failure, blocks, i),
+        `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`,
+      ).toBe(true);
     }
   });

@@ -625,7 +676,7 @@ describe("issue-less runs", () => {
       const at = lines.findIndex((l) => /^9\. .*(?:post-push|kill-switch)/i.test(l));
       expect(at, `${name}: kill-switch sub-step 9`).toBeGreaterThanOrEqual(0);
       const [from, to] = itemRange(lines, at);
-      const blocks = trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+      const blocks = blocksWithin(lines, from, to);
       expect(blocks.length, name).toBeGreaterThan(0);
       for (const b of blocks) {
         expect(
@@ -638,11 +689,7 @@ describe("issue-less runs", () => {

   it("build Step 1 blocker check skips when ISSUE_ID is empty", () => {
     const step1 = section(workflow("build"), /Step 1 — Start Workflow/).split("\n");
-    const blockers = trackerBlocks(step1).filter(
-      (b) =>
-        ["github", "linear", "jira"].includes(b.kind) &&
-        /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
-    );
+    const blockers = blockerBlocks(step1);
     expect(blockers).toHaveLength(3);
     for (const b of blockers) {
       expect(step1.slice(b.start, b.end + 1).join("\n")).toContain(SKIP_NO_ISSUE);
@@ -699,7 +746,7 @@ describe("debug on dev", () => {
   it("debug Steps 9 and 10 push nothing on dev", () => {
     for (const heading of [/Step 9 — Push Remediation/, /Step 10 — Summary/]) {
       const lines = section(debug, heading).split("\n");
-      const pushes = lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+      const pushes = pushFences(lines);
       expect(pushes.length, `${heading}: no branches push fence`).toBeGreaterThan(0);
       for (const i of pushes) {
         // Opening fence at i - 1; the line above it carries the dev skip.
```

## Diff since red — Task 8 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-8-8.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 94d7dc78..977eb210 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-8-8.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -6,6 +6,8 @@ import * as path from "node:path";

 import { describe, expect, it } from "vitest";

+import { substituteWorkflow } from "../../render/trackers";
+
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 const PHASES = ["design", "plan", "build", "debug", "ship"] as const;
 const ALL = ["auto", ...PHASES] as const;
@@ -406,17 +408,19 @@ interface TrackerBlock {
   end: number;
 }

-/** Every tracker block (nested ones too) as a line range, markers included. */
+/** Every tracker block (nested and inline ones too) as a line range, markers included. */
 function trackerBlocks(lines: string[]): TrackerBlock[] {
   const stack: { kind: string; start: number }[] = [];
   const out: TrackerBlock[] = [];
   lines.forEach((line, i) => {
-    const m = /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/.exec(line);
-    if (!m) return;
-    if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
-    else {
-      const open = stack.pop();
-      if (open) out.push({ ...open, end: i });
+    for (const m of line.matchAll(
+      /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/g,
+    )) {
+      if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
+      else {
+        const open = stack.pop();
+        if (open) out.push({ ...open, end: i });
+      }
     }
   });
   return out;
@@ -447,22 +451,72 @@ function itemRange(lines: string[], at: number): [number, number] {
   return [at, next === -1 ? lines.length : next];
 }

+/**
+ * Issue-tied call lines from `from` on that no `Skip if ISSUE_ID empty` line guards. The line sits
+ * in a tracker block: the guard is in that block. A `false` block renders only with no tracker
+ * wired, so it holds no issue-tied call. The line sits in no block (a call that also runs under
+ * `none`): the guard is in its numbered item.
+ */
+function unguardedIssueCalls(lines: string[], from: number): string[] {
+  const blocks = trackerBlocks(lines);
+  return lines.flatMap((line, i) => {
+    if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
+    const block = innermostBlock(blocks, i);
+    if (block?.kind === "false") return [];
+    const guardFrom =
+      block?.start ??
+      lines
+        .map((l, n) => (n <= i && /^\d+\. /.test(l) ? n : -1))
+        .reduce((a, b) => Math.max(a, b), -1);
+    const guarded =
+      guardFrom >= 0 && lines.slice(guardFrom, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
+    return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
+  });
+}
+
+/** Line indexes of the `issues labels --board=` fences. */
+const boardFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) =>
+    l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
+  );
+
+/** Line indexes that post a Failure Path `comment`. */
+const commentPosts = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+
+/** A Failure Path comment post is guarded on its own line or by a Skip line in its tracker block. */
+function guardedPost(lines: string[], blocks: TrackerBlock[], i: number): boolean {
+  const block = innermostBlock(blocks, i);
+  return (
+    lines[i]!.includes("`ISSUE_ID` empty") ||
+    (block !== undefined && lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)))
+  );
+}
+
+/** Tracker blocks lying wholly inside the line range. */
+const blocksWithin = (lines: string[], from: number, to: number): TrackerBlock[] =>
+  trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+
+/** The wired-tracker blocks of Step 1 that read blockers. */
+const blockerBlocks = (step1: string[]): TrackerBlock[] =>
+  trackerBlocks(step1).filter(
+    (b) =>
+      ["github", "linear", "jira"].includes(b.kind) &&
+      /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
+  );
+
+/** Line indexes of `branches push` fences. */
+const pushFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+
 describe("issue-less runs", () => {
   it.each(PHASES)(
     "%s: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty",
     (name) => {
       const lines = workflow(name).split("\n");
-      const blocks = trackerBlocks(lines);
       const from = bodyStart(lines);
       expect(from, name).toBeGreaterThan(0);
-      const unguarded = lines.flatMap((line, i) => {
-        if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
-        const block = innermostBlock(blocks, i);
-        const guarded =
-          block !== undefined &&
-          lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
-        return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
-      });
+      const unguarded = unguardedIssueCalls(lines, from);
       expect(unguarded, `${name}: issue-tied calls with no Skip if ISSUE_ID empty`).toEqual([]);
     },
   );
@@ -472,9 +526,7 @@ describe("issue-less runs", () => {
     (name) => {
       const lines = workflow(name).split("\n");
       const blocks = trackerBlocks(lines);
-      const fences = lines.flatMap((l, i) =>
-        l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
-      );
+      const fences = boardFences(lines);
       expect(fences.length, `${name}: no issues labels --board fence found`).toBeGreaterThanOrEqual(
         2,
       );
@@ -501,7 +553,8 @@ describe("issue-less runs", () => {
   });

   it.each(PHASES)("%s: fids check and steps gate carry --issue in every workflow", (name) => {
-    const text = workflow(name);
+    // The flag sits in a tracker block (a `none` run has no issue), so read the wired render.
+    const text = substituteWorkflow(workflow(name), "github").output;
     const step1 = section(text, /Step 1 — Start Workflow/);
     expect(commandLines(step1, "fids check"), name).toEqual([
       expect.stringContaining('--fid="{FID}" --issue="{ISSUE_ID}"'),
@@ -604,15 +657,13 @@ describe("issue-less runs", () => {
   it.each(PHASES)("%s: every Failure Path comment post sits behind the ISSUE_ID guard", (name) => {
     const failure = section(workflow(name), /Failure Path/).split("\n");
     const blocks = trackerBlocks(failure);
-    const posts = failure.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+    const posts = commentPosts(failure);
     expect(posts.length, name).toBeGreaterThan(0);
     for (const i of posts) {
-      const block = innermostBlock(blocks, i);
-      const guarded =
-        failure[i]!.includes("`ISSUE_ID` empty") ||
-        (block !== undefined &&
-          failure.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)));
-      expect(guarded, `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`).toBe(true);
+      expect(
+        guardedPost(failure, blocks, i),
+        `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`,
+      ).toBe(true);
     }
   });

@@ -625,7 +676,7 @@ describe("issue-less runs", () => {
       const at = lines.findIndex((l) => /^9\. .*(?:post-push|kill-switch)/i.test(l));
       expect(at, `${name}: kill-switch sub-step 9`).toBeGreaterThanOrEqual(0);
       const [from, to] = itemRange(lines, at);
-      const blocks = trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+      const blocks = blocksWithin(lines, from, to);
       expect(blocks.length, name).toBeGreaterThan(0);
       for (const b of blocks) {
         expect(
@@ -638,11 +689,7 @@ describe("issue-less runs", () => {

   it("build Step 1 blocker check skips when ISSUE_ID is empty", () => {
     const step1 = section(workflow("build"), /Step 1 — Start Workflow/).split("\n");
-    const blockers = trackerBlocks(step1).filter(
-      (b) =>
-        ["github", "linear", "jira"].includes(b.kind) &&
-        /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
-    );
+    const blockers = blockerBlocks(step1);
     expect(blockers).toHaveLength(3);
     for (const b of blockers) {
       expect(step1.slice(b.start, b.end + 1).join("\n")).toContain(SKIP_NO_ISSUE);
@@ -699,7 +746,7 @@ describe("debug on dev", () => {
   it("debug Steps 9 and 10 push nothing on dev", () => {
     for (const heading of [/Step 9 — Push Remediation/, /Step 10 — Summary/]) {
       const lines = section(debug, heading).split("\n");
-      const pushes = lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+      const pushes = pushFences(lines);
       expect(pushes.length, `${heading}: no branches push fence`).toBeGreaterThan(0);
       for (const i of pushes) {
         // Opening fence at i - 1; the line above it carries the dev skip.
```

## Diff since red — Task 8 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-8-9.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 94d7dc78..977eb210 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-8-9.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -6,6 +6,8 @@ import * as path from "node:path";

 import { describe, expect, it } from "vitest";

+import { substituteWorkflow } from "../../render/trackers";
+
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 const PHASES = ["design", "plan", "build", "debug", "ship"] as const;
 const ALL = ["auto", ...PHASES] as const;
@@ -406,17 +408,19 @@ interface TrackerBlock {
   end: number;
 }

-/** Every tracker block (nested ones too) as a line range, markers included. */
+/** Every tracker block (nested and inline ones too) as a line range, markers included. */
 function trackerBlocks(lines: string[]): TrackerBlock[] {
   const stack: { kind: string; start: number }[] = [];
   const out: TrackerBlock[] = [];
   lines.forEach((line, i) => {
-    const m = /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/.exec(line);
-    if (!m) return;
-    if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
-    else {
-      const open = stack.pop();
-      if (open) out.push({ ...open, end: i });
+    for (const m of line.matchAll(
+      /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/g,
+    )) {
+      if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
+      else {
+        const open = stack.pop();
+        if (open) out.push({ ...open, end: i });
+      }
     }
   });
   return out;
@@ -447,22 +451,72 @@ function itemRange(lines: string[], at: number): [number, number] {
   return [at, next === -1 ? lines.length : next];
 }

+/**
+ * Issue-tied call lines from `from` on that no `Skip if ISSUE_ID empty` line guards. The line sits
+ * in a tracker block: the guard is in that block. A `false` block renders only with no tracker
+ * wired, so it holds no issue-tied call. The line sits in no block (a call that also runs under
+ * `none`): the guard is in its numbered item.
+ */
+function unguardedIssueCalls(lines: string[], from: number): string[] {
+  const blocks = trackerBlocks(lines);
+  return lines.flatMap((line, i) => {
+    if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
+    const block = innermostBlock(blocks, i);
+    if (block?.kind === "false") return [];
+    const guardFrom =
+      block?.start ??
+      lines
+        .map((l, n) => (n <= i && /^\d+\. /.test(l) ? n : -1))
+        .reduce((a, b) => Math.max(a, b), -1);
+    const guarded =
+      guardFrom >= 0 && lines.slice(guardFrom, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
+    return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
+  });
+}
+
+/** Line indexes of the `issues labels --board=` fences. */
+const boardFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) =>
+    l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
+  );
+
+/** Line indexes that post a Failure Path `comment`. */
+const commentPosts = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+
+/** A Failure Path comment post is guarded on its own line or by a Skip line in its tracker block. */
+function guardedPost(lines: string[], blocks: TrackerBlock[], i: number): boolean {
+  const block = innermostBlock(blocks, i);
+  return (
+    lines[i]!.includes("`ISSUE_ID` empty") ||
+    (block !== undefined && lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)))
+  );
+}
+
+/** Tracker blocks lying wholly inside the line range. */
+const blocksWithin = (lines: string[], from: number, to: number): TrackerBlock[] =>
+  trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+
+/** The wired-tracker blocks of Step 1 that read blockers. */
+const blockerBlocks = (step1: string[]): TrackerBlock[] =>
+  trackerBlocks(step1).filter(
+    (b) =>
+      ["github", "linear", "jira"].includes(b.kind) &&
+      /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
+  );
+
+/** Line indexes of `branches push` fences. */
+const pushFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+
 describe("issue-less runs", () => {
   it.each(PHASES)(
     "%s: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty",
     (name) => {
       const lines = workflow(name).split("\n");
-      const blocks = trackerBlocks(lines);
       const from = bodyStart(lines);
       expect(from, name).toBeGreaterThan(0);
-      const unguarded = lines.flatMap((line, i) => {
-        if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
-        const block = innermostBlock(blocks, i);
-        const guarded =
-          block !== undefined &&
-          lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
-        return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
-      });
+      const unguarded = unguardedIssueCalls(lines, from);
       expect(unguarded, `${name}: issue-tied calls with no Skip if ISSUE_ID empty`).toEqual([]);
     },
   );
@@ -472,9 +526,7 @@ describe("issue-less runs", () => {
     (name) => {
       const lines = workflow(name).split("\n");
       const blocks = trackerBlocks(lines);
-      const fences = lines.flatMap((l, i) =>
-        l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
-      );
+      const fences = boardFences(lines);
       expect(fences.length, `${name}: no issues labels --board fence found`).toBeGreaterThanOrEqual(
         2,
       );
@@ -501,7 +553,8 @@ describe("issue-less runs", () => {
   });

   it.each(PHASES)("%s: fids check and steps gate carry --issue in every workflow", (name) => {
-    const text = workflow(name);
+    // The flag sits in a tracker block (a `none` run has no issue), so read the wired render.
+    const text = substituteWorkflow(workflow(name), "github").output;
     const step1 = section(text, /Step 1 — Start Workflow/);
     expect(commandLines(step1, "fids check"), name).toEqual([
       expect.stringContaining('--fid="{FID}" --issue="{ISSUE_ID}"'),
@@ -604,15 +657,13 @@ describe("issue-less runs", () => {
   it.each(PHASES)("%s: every Failure Path comment post sits behind the ISSUE_ID guard", (name) => {
     const failure = section(workflow(name), /Failure Path/).split("\n");
     const blocks = trackerBlocks(failure);
-    const posts = failure.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+    const posts = commentPosts(failure);
     expect(posts.length, name).toBeGreaterThan(0);
     for (const i of posts) {
-      const block = innermostBlock(blocks, i);
-      const guarded =
-        failure[i]!.includes("`ISSUE_ID` empty") ||
-        (block !== undefined &&
-          failure.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)));
-      expect(guarded, `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`).toBe(true);
+      expect(
+        guardedPost(failure, blocks, i),
+        `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`,
+      ).toBe(true);
     }
   });

@@ -625,7 +676,7 @@ describe("issue-less runs", () => {
       const at = lines.findIndex((l) => /^9\. .*(?:post-push|kill-switch)/i.test(l));
       expect(at, `${name}: kill-switch sub-step 9`).toBeGreaterThanOrEqual(0);
       const [from, to] = itemRange(lines, at);
-      const blocks = trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+      const blocks = blocksWithin(lines, from, to);
       expect(blocks.length, name).toBeGreaterThan(0);
       for (const b of blocks) {
         expect(
@@ -638,11 +689,7 @@ describe("issue-less runs", () => {

   it("build Step 1 blocker check skips when ISSUE_ID is empty", () => {
     const step1 = section(workflow("build"), /Step 1 — Start Workflow/).split("\n");
-    const blockers = trackerBlocks(step1).filter(
-      (b) =>
-        ["github", "linear", "jira"].includes(b.kind) &&
-        /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
-    );
+    const blockers = blockerBlocks(step1);
     expect(blockers).toHaveLength(3);
     for (const b of blockers) {
       expect(step1.slice(b.start, b.end + 1).join("\n")).toContain(SKIP_NO_ISSUE);
@@ -699,7 +746,7 @@ describe("debug on dev", () => {
   it("debug Steps 9 and 10 push nothing on dev", () => {
     for (const heading of [/Step 9 — Push Remediation/, /Step 10 — Summary/]) {
       const lines = section(debug, heading).split("\n");
-      const pushes = lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+      const pushes = pushFences(lines);
       expect(pushes.length, `${heading}: no branches push fence`).toBeGreaterThan(0);
       for (const i of pushes) {
         // Opening fence at i - 1; the line above it carries the dev skip.
```

## Diff since red — Task 9 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-9-1.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 94d7dc78..977eb210 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-9-1.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -6,6 +6,8 @@ import * as path from "node:path";

 import { describe, expect, it } from "vitest";

+import { substituteWorkflow } from "../../render/trackers";
+
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 const PHASES = ["design", "plan", "build", "debug", "ship"] as const;
 const ALL = ["auto", ...PHASES] as const;
@@ -406,17 +408,19 @@ interface TrackerBlock {
   end: number;
 }

-/** Every tracker block (nested ones too) as a line range, markers included. */
+/** Every tracker block (nested and inline ones too) as a line range, markers included. */
 function trackerBlocks(lines: string[]): TrackerBlock[] {
   const stack: { kind: string; start: number }[] = [];
   const out: TrackerBlock[] = [];
   lines.forEach((line, i) => {
-    const m = /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/.exec(line);
-    if (!m) return;
-    if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
-    else {
-      const open = stack.pop();
-      if (open) out.push({ ...open, end: i });
+    for (const m of line.matchAll(
+      /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/g,
+    )) {
+      if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
+      else {
+        const open = stack.pop();
+        if (open) out.push({ ...open, end: i });
+      }
     }
   });
   return out;
@@ -447,22 +451,72 @@ function itemRange(lines: string[], at: number): [number, number] {
   return [at, next === -1 ? lines.length : next];
 }

+/**
+ * Issue-tied call lines from `from` on that no `Skip if ISSUE_ID empty` line guards. The line sits
+ * in a tracker block: the guard is in that block. A `false` block renders only with no tracker
+ * wired, so it holds no issue-tied call. The line sits in no block (a call that also runs under
+ * `none`): the guard is in its numbered item.
+ */
+function unguardedIssueCalls(lines: string[], from: number): string[] {
+  const blocks = trackerBlocks(lines);
+  return lines.flatMap((line, i) => {
+    if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
+    const block = innermostBlock(blocks, i);
+    if (block?.kind === "false") return [];
+    const guardFrom =
+      block?.start ??
+      lines
+        .map((l, n) => (n <= i && /^\d+\. /.test(l) ? n : -1))
+        .reduce((a, b) => Math.max(a, b), -1);
+    const guarded =
+      guardFrom >= 0 && lines.slice(guardFrom, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
+    return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
+  });
+}
+
+/** Line indexes of the `issues labels --board=` fences. */
+const boardFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) =>
+    l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
+  );
+
+/** Line indexes that post a Failure Path `comment`. */
+const commentPosts = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+
+/** A Failure Path comment post is guarded on its own line or by a Skip line in its tracker block. */
+function guardedPost(lines: string[], blocks: TrackerBlock[], i: number): boolean {
+  const block = innermostBlock(blocks, i);
+  return (
+    lines[i]!.includes("`ISSUE_ID` empty") ||
+    (block !== undefined && lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)))
+  );
+}
+
+/** Tracker blocks lying wholly inside the line range. */
+const blocksWithin = (lines: string[], from: number, to: number): TrackerBlock[] =>
+  trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+
+/** The wired-tracker blocks of Step 1 that read blockers. */
+const blockerBlocks = (step1: string[]): TrackerBlock[] =>
+  trackerBlocks(step1).filter(
+    (b) =>
+      ["github", "linear", "jira"].includes(b.kind) &&
+      /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
+  );
+
+/** Line indexes of `branches push` fences. */
+const pushFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+
 describe("issue-less runs", () => {
   it.each(PHASES)(
     "%s: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty",
     (name) => {
       const lines = workflow(name).split("\n");
-      const blocks = trackerBlocks(lines);
       const from = bodyStart(lines);
       expect(from, name).toBeGreaterThan(0);
-      const unguarded = lines.flatMap((line, i) => {
-        if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
-        const block = innermostBlock(blocks, i);
-        const guarded =
-          block !== undefined &&
-          lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
-        return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
-      });
+      const unguarded = unguardedIssueCalls(lines, from);
       expect(unguarded, `${name}: issue-tied calls with no Skip if ISSUE_ID empty`).toEqual([]);
     },
   );
@@ -472,9 +526,7 @@ describe("issue-less runs", () => {
     (name) => {
       const lines = workflow(name).split("\n");
       const blocks = trackerBlocks(lines);
-      const fences = lines.flatMap((l, i) =>
-        l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
-      );
+      const fences = boardFences(lines);
       expect(fences.length, `${name}: no issues labels --board fence found`).toBeGreaterThanOrEqual(
         2,
       );
@@ -501,7 +553,8 @@ describe("issue-less runs", () => {
   });

   it.each(PHASES)("%s: fids check and steps gate carry --issue in every workflow", (name) => {
-    const text = workflow(name);
+    // The flag sits in a tracker block (a `none` run has no issue), so read the wired render.
+    const text = substituteWorkflow(workflow(name), "github").output;
     const step1 = section(text, /Step 1 — Start Workflow/);
     expect(commandLines(step1, "fids check"), name).toEqual([
       expect.stringContaining('--fid="{FID}" --issue="{ISSUE_ID}"'),
@@ -604,15 +657,13 @@ describe("issue-less runs", () => {
   it.each(PHASES)("%s: every Failure Path comment post sits behind the ISSUE_ID guard", (name) => {
     const failure = section(workflow(name), /Failure Path/).split("\n");
     const blocks = trackerBlocks(failure);
-    const posts = failure.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+    const posts = commentPosts(failure);
     expect(posts.length, name).toBeGreaterThan(0);
     for (const i of posts) {
-      const block = innermostBlock(blocks, i);
-      const guarded =
-        failure[i]!.includes("`ISSUE_ID` empty") ||
-        (block !== undefined &&
-          failure.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)));
-      expect(guarded, `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`).toBe(true);
+      expect(
+        guardedPost(failure, blocks, i),
+        `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`,
+      ).toBe(true);
     }
   });

@@ -625,7 +676,7 @@ describe("issue-less runs", () => {
       const at = lines.findIndex((l) => /^9\. .*(?:post-push|kill-switch)/i.test(l));
       expect(at, `${name}: kill-switch sub-step 9`).toBeGreaterThanOrEqual(0);
       const [from, to] = itemRange(lines, at);
-      const blocks = trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+      const blocks = blocksWithin(lines, from, to);
       expect(blocks.length, name).toBeGreaterThan(0);
       for (const b of blocks) {
         expect(
@@ -638,11 +689,7 @@ describe("issue-less runs", () => {

   it("build Step 1 blocker check skips when ISSUE_ID is empty", () => {
     const step1 = section(workflow("build"), /Step 1 — Start Workflow/).split("\n");
-    const blockers = trackerBlocks(step1).filter(
-      (b) =>
-        ["github", "linear", "jira"].includes(b.kind) &&
-        /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
-    );
+    const blockers = blockerBlocks(step1);
     expect(blockers).toHaveLength(3);
     for (const b of blockers) {
       expect(step1.slice(b.start, b.end + 1).join("\n")).toContain(SKIP_NO_ISSUE);
@@ -699,7 +746,7 @@ describe("debug on dev", () => {
   it("debug Steps 9 and 10 push nothing on dev", () => {
     for (const heading of [/Step 9 — Push Remediation/, /Step 10 — Summary/]) {
       const lines = section(debug, heading).split("\n");
-      const pushes = lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+      const pushes = pushFences(lines);
       expect(pushes.length, `${heading}: no branches push fence`).toBeGreaterThan(0);
       for (const i of pushes) {
         // Opening fence at i - 1; the line above it carries the dev skip.
```

## Diff since red — Task 9 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-9-2.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 94d7dc78..977eb210 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-9-2.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -6,6 +6,8 @@ import * as path from "node:path";

 import { describe, expect, it } from "vitest";

+import { substituteWorkflow } from "../../render/trackers";
+
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 const PHASES = ["design", "plan", "build", "debug", "ship"] as const;
 const ALL = ["auto", ...PHASES] as const;
@@ -406,17 +408,19 @@ interface TrackerBlock {
   end: number;
 }

-/** Every tracker block (nested ones too) as a line range, markers included. */
+/** Every tracker block (nested and inline ones too) as a line range, markers included. */
 function trackerBlocks(lines: string[]): TrackerBlock[] {
   const stack: { kind: string; start: number }[] = [];
   const out: TrackerBlock[] = [];
   lines.forEach((line, i) => {
-    const m = /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/.exec(line);
-    if (!m) return;
-    if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
-    else {
-      const open = stack.pop();
-      if (open) out.push({ ...open, end: i });
+    for (const m of line.matchAll(
+      /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/g,
+    )) {
+      if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
+      else {
+        const open = stack.pop();
+        if (open) out.push({ ...open, end: i });
+      }
     }
   });
   return out;
@@ -447,22 +451,72 @@ function itemRange(lines: string[], at: number): [number, number] {
   return [at, next === -1 ? lines.length : next];
 }

+/**
+ * Issue-tied call lines from `from` on that no `Skip if ISSUE_ID empty` line guards. The line sits
+ * in a tracker block: the guard is in that block. A `false` block renders only with no tracker
+ * wired, so it holds no issue-tied call. The line sits in no block (a call that also runs under
+ * `none`): the guard is in its numbered item.
+ */
+function unguardedIssueCalls(lines: string[], from: number): string[] {
+  const blocks = trackerBlocks(lines);
+  return lines.flatMap((line, i) => {
+    if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
+    const block = innermostBlock(blocks, i);
+    if (block?.kind === "false") return [];
+    const guardFrom =
+      block?.start ??
+      lines
+        .map((l, n) => (n <= i && /^\d+\. /.test(l) ? n : -1))
+        .reduce((a, b) => Math.max(a, b), -1);
+    const guarded =
+      guardFrom >= 0 && lines.slice(guardFrom, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
+    return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
+  });
+}
+
+/** Line indexes of the `issues labels --board=` fences. */
+const boardFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) =>
+    l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
+  );
+
+/** Line indexes that post a Failure Path `comment`. */
+const commentPosts = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+
+/** A Failure Path comment post is guarded on its own line or by a Skip line in its tracker block. */
+function guardedPost(lines: string[], blocks: TrackerBlock[], i: number): boolean {
+  const block = innermostBlock(blocks, i);
+  return (
+    lines[i]!.includes("`ISSUE_ID` empty") ||
+    (block !== undefined && lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)))
+  );
+}
+
+/** Tracker blocks lying wholly inside the line range. */
+const blocksWithin = (lines: string[], from: number, to: number): TrackerBlock[] =>
+  trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+
+/** The wired-tracker blocks of Step 1 that read blockers. */
+const blockerBlocks = (step1: string[]): TrackerBlock[] =>
+  trackerBlocks(step1).filter(
+    (b) =>
+      ["github", "linear", "jira"].includes(b.kind) &&
+      /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
+  );
+
+/** Line indexes of `branches push` fences. */
+const pushFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+
 describe("issue-less runs", () => {
   it.each(PHASES)(
     "%s: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty",
     (name) => {
       const lines = workflow(name).split("\n");
-      const blocks = trackerBlocks(lines);
       const from = bodyStart(lines);
       expect(from, name).toBeGreaterThan(0);
-      const unguarded = lines.flatMap((line, i) => {
-        if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
-        const block = innermostBlock(blocks, i);
-        const guarded =
-          block !== undefined &&
-          lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
-        return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
-      });
+      const unguarded = unguardedIssueCalls(lines, from);
       expect(unguarded, `${name}: issue-tied calls with no Skip if ISSUE_ID empty`).toEqual([]);
     },
   );
@@ -472,9 +526,7 @@ describe("issue-less runs", () => {
     (name) => {
       const lines = workflow(name).split("\n");
       const blocks = trackerBlocks(lines);
-      const fences = lines.flatMap((l, i) =>
-        l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
-      );
+      const fences = boardFences(lines);
       expect(fences.length, `${name}: no issues labels --board fence found`).toBeGreaterThanOrEqual(
         2,
       );
@@ -501,7 +553,8 @@ describe("issue-less runs", () => {
   });

   it.each(PHASES)("%s: fids check and steps gate carry --issue in every workflow", (name) => {
-    const text = workflow(name);
+    // The flag sits in a tracker block (a `none` run has no issue), so read the wired render.
+    const text = substituteWorkflow(workflow(name), "github").output;
     const step1 = section(text, /Step 1 — Start Workflow/);
     expect(commandLines(step1, "fids check"), name).toEqual([
       expect.stringContaining('--fid="{FID}" --issue="{ISSUE_ID}"'),
@@ -604,15 +657,13 @@ describe("issue-less runs", () => {
   it.each(PHASES)("%s: every Failure Path comment post sits behind the ISSUE_ID guard", (name) => {
     const failure = section(workflow(name), /Failure Path/).split("\n");
     const blocks = trackerBlocks(failure);
-    const posts = failure.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+    const posts = commentPosts(failure);
     expect(posts.length, name).toBeGreaterThan(0);
     for (const i of posts) {
-      const block = innermostBlock(blocks, i);
-      const guarded =
-        failure[i]!.includes("`ISSUE_ID` empty") ||
-        (block !== undefined &&
-          failure.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)));
-      expect(guarded, `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`).toBe(true);
+      expect(
+        guardedPost(failure, blocks, i),
+        `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`,
+      ).toBe(true);
     }
   });

@@ -625,7 +676,7 @@ describe("issue-less runs", () => {
       const at = lines.findIndex((l) => /^9\. .*(?:post-push|kill-switch)/i.test(l));
       expect(at, `${name}: kill-switch sub-step 9`).toBeGreaterThanOrEqual(0);
       const [from, to] = itemRange(lines, at);
-      const blocks = trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+      const blocks = blocksWithin(lines, from, to);
       expect(blocks.length, name).toBeGreaterThan(0);
       for (const b of blocks) {
         expect(
@@ -638,11 +689,7 @@ describe("issue-less runs", () => {

   it("build Step 1 blocker check skips when ISSUE_ID is empty", () => {
     const step1 = section(workflow("build"), /Step 1 — Start Workflow/).split("\n");
-    const blockers = trackerBlocks(step1).filter(
-      (b) =>
-        ["github", "linear", "jira"].includes(b.kind) &&
-        /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
-    );
+    const blockers = blockerBlocks(step1);
     expect(blockers).toHaveLength(3);
     for (const b of blockers) {
       expect(step1.slice(b.start, b.end + 1).join("\n")).toContain(SKIP_NO_ISSUE);
@@ -699,7 +746,7 @@ describe("debug on dev", () => {
   it("debug Steps 9 and 10 push nothing on dev", () => {
     for (const heading of [/Step 9 — Push Remediation/, /Step 10 — Summary/]) {
       const lines = section(debug, heading).split("\n");
-      const pushes = lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+      const pushes = pushFences(lines);
       expect(pushes.length, `${heading}: no branches push fence`).toBeGreaterThan(0);
       for (const i of pushes) {
         // Opening fence at i - 1; the line above it carries the dev skip.
```

## Diff since red — Task 9 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-9-3.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 94d7dc78..977eb210 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-9-3.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -6,6 +6,8 @@ import * as path from "node:path";

 import { describe, expect, it } from "vitest";

+import { substituteWorkflow } from "../../render/trackers";
+
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 const PHASES = ["design", "plan", "build", "debug", "ship"] as const;
 const ALL = ["auto", ...PHASES] as const;
@@ -406,17 +408,19 @@ interface TrackerBlock {
   end: number;
 }

-/** Every tracker block (nested ones too) as a line range, markers included. */
+/** Every tracker block (nested and inline ones too) as a line range, markers included. */
 function trackerBlocks(lines: string[]): TrackerBlock[] {
   const stack: { kind: string; start: number }[] = [];
   const out: TrackerBlock[] = [];
   lines.forEach((line, i) => {
-    const m = /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/.exec(line);
-    if (!m) return;
-    if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
-    else {
-      const open = stack.pop();
-      if (open) out.push({ ...open, end: i });
+    for (const m of line.matchAll(
+      /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/g,
+    )) {
+      if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
+      else {
+        const open = stack.pop();
+        if (open) out.push({ ...open, end: i });
+      }
     }
   });
   return out;
@@ -447,22 +451,72 @@ function itemRange(lines: string[], at: number): [number, number] {
   return [at, next === -1 ? lines.length : next];
 }

+/**
+ * Issue-tied call lines from `from` on that no `Skip if ISSUE_ID empty` line guards. The line sits
+ * in a tracker block: the guard is in that block. A `false` block renders only with no tracker
+ * wired, so it holds no issue-tied call. The line sits in no block (a call that also runs under
+ * `none`): the guard is in its numbered item.
+ */
+function unguardedIssueCalls(lines: string[], from: number): string[] {
+  const blocks = trackerBlocks(lines);
+  return lines.flatMap((line, i) => {
+    if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
+    const block = innermostBlock(blocks, i);
+    if (block?.kind === "false") return [];
+    const guardFrom =
+      block?.start ??
+      lines
+        .map((l, n) => (n <= i && /^\d+\. /.test(l) ? n : -1))
+        .reduce((a, b) => Math.max(a, b), -1);
+    const guarded =
+      guardFrom >= 0 && lines.slice(guardFrom, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
+    return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
+  });
+}
+
+/** Line indexes of the `issues labels --board=` fences. */
+const boardFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) =>
+    l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
+  );
+
+/** Line indexes that post a Failure Path `comment`. */
+const commentPosts = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+
+/** A Failure Path comment post is guarded on its own line or by a Skip line in its tracker block. */
+function guardedPost(lines: string[], blocks: TrackerBlock[], i: number): boolean {
+  const block = innermostBlock(blocks, i);
+  return (
+    lines[i]!.includes("`ISSUE_ID` empty") ||
+    (block !== undefined && lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)))
+  );
+}
+
+/** Tracker blocks lying wholly inside the line range. */
+const blocksWithin = (lines: string[], from: number, to: number): TrackerBlock[] =>
+  trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+
+/** The wired-tracker blocks of Step 1 that read blockers. */
+const blockerBlocks = (step1: string[]): TrackerBlock[] =>
+  trackerBlocks(step1).filter(
+    (b) =>
+      ["github", "linear", "jira"].includes(b.kind) &&
+      /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
+  );
+
+/** Line indexes of `branches push` fences. */
+const pushFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+
 describe("issue-less runs", () => {
   it.each(PHASES)(
     "%s: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty",
     (name) => {
       const lines = workflow(name).split("\n");
-      const blocks = trackerBlocks(lines);
       const from = bodyStart(lines);
       expect(from, name).toBeGreaterThan(0);
-      const unguarded = lines.flatMap((line, i) => {
-        if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
-        const block = innermostBlock(blocks, i);
-        const guarded =
-          block !== undefined &&
-          lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
-        return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
-      });
+      const unguarded = unguardedIssueCalls(lines, from);
       expect(unguarded, `${name}: issue-tied calls with no Skip if ISSUE_ID empty`).toEqual([]);
     },
   );
@@ -472,9 +526,7 @@ describe("issue-less runs", () => {
     (name) => {
       const lines = workflow(name).split("\n");
       const blocks = trackerBlocks(lines);
-      const fences = lines.flatMap((l, i) =>
-        l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
-      );
+      const fences = boardFences(lines);
       expect(fences.length, `${name}: no issues labels --board fence found`).toBeGreaterThanOrEqual(
         2,
       );
@@ -501,7 +553,8 @@ describe("issue-less runs", () => {
   });

   it.each(PHASES)("%s: fids check and steps gate carry --issue in every workflow", (name) => {
-    const text = workflow(name);
+    // The flag sits in a tracker block (a `none` run has no issue), so read the wired render.
+    const text = substituteWorkflow(workflow(name), "github").output;
     const step1 = section(text, /Step 1 — Start Workflow/);
     expect(commandLines(step1, "fids check"), name).toEqual([
       expect.stringContaining('--fid="{FID}" --issue="{ISSUE_ID}"'),
@@ -604,15 +657,13 @@ describe("issue-less runs", () => {
   it.each(PHASES)("%s: every Failure Path comment post sits behind the ISSUE_ID guard", (name) => {
     const failure = section(workflow(name), /Failure Path/).split("\n");
     const blocks = trackerBlocks(failure);
-    const posts = failure.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+    const posts = commentPosts(failure);
     expect(posts.length, name).toBeGreaterThan(0);
     for (const i of posts) {
-      const block = innermostBlock(blocks, i);
-      const guarded =
-        failure[i]!.includes("`ISSUE_ID` empty") ||
-        (block !== undefined &&
-          failure.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)));
-      expect(guarded, `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`).toBe(true);
+      expect(
+        guardedPost(failure, blocks, i),
+        `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`,
+      ).toBe(true);
     }
   });

@@ -625,7 +676,7 @@ describe("issue-less runs", () => {
       const at = lines.findIndex((l) => /^9\. .*(?:post-push|kill-switch)/i.test(l));
       expect(at, `${name}: kill-switch sub-step 9`).toBeGreaterThanOrEqual(0);
       const [from, to] = itemRange(lines, at);
-      const blocks = trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+      const blocks = blocksWithin(lines, from, to);
       expect(blocks.length, name).toBeGreaterThan(0);
       for (const b of blocks) {
         expect(
@@ -638,11 +689,7 @@ describe("issue-less runs", () => {

   it("build Step 1 blocker check skips when ISSUE_ID is empty", () => {
     const step1 = section(workflow("build"), /Step 1 — Start Workflow/).split("\n");
-    const blockers = trackerBlocks(step1).filter(
-      (b) =>
-        ["github", "linear", "jira"].includes(b.kind) &&
-        /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
-    );
+    const blockers = blockerBlocks(step1);
     expect(blockers).toHaveLength(3);
     for (const b of blockers) {
       expect(step1.slice(b.start, b.end + 1).join("\n")).toContain(SKIP_NO_ISSUE);
@@ -699,7 +746,7 @@ describe("debug on dev", () => {
   it("debug Steps 9 and 10 push nothing on dev", () => {
     for (const heading of [/Step 9 — Push Remediation/, /Step 10 — Summary/]) {
       const lines = section(debug, heading).split("\n");
-      const pushes = lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+      const pushes = pushFences(lines);
       expect(pushes.length, `${heading}: no branches push fence`).toBeGreaterThan(0);
       for (const i of pushes) {
         // Opening fence at i - 1; the line above it carries the dev skip.
```

## Diff since red — Task 10 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-10-1.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 94d7dc78..977eb210 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-10-1.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -6,6 +6,8 @@ import * as path from "node:path";

 import { describe, expect, it } from "vitest";

+import { substituteWorkflow } from "../../render/trackers";
+
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 const PHASES = ["design", "plan", "build", "debug", "ship"] as const;
 const ALL = ["auto", ...PHASES] as const;
@@ -406,17 +408,19 @@ interface TrackerBlock {
   end: number;
 }

-/** Every tracker block (nested ones too) as a line range, markers included. */
+/** Every tracker block (nested and inline ones too) as a line range, markers included. */
 function trackerBlocks(lines: string[]): TrackerBlock[] {
   const stack: { kind: string; start: number }[] = [];
   const out: TrackerBlock[] = [];
   lines.forEach((line, i) => {
-    const m = /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/.exec(line);
-    if (!m) return;
-    if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
-    else {
-      const open = stack.pop();
-      if (open) out.push({ ...open, end: i });
+    for (const m of line.matchAll(
+      /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/g,
+    )) {
+      if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
+      else {
+        const open = stack.pop();
+        if (open) out.push({ ...open, end: i });
+      }
     }
   });
   return out;
@@ -447,22 +451,72 @@ function itemRange(lines: string[], at: number): [number, number] {
   return [at, next === -1 ? lines.length : next];
 }

+/**
+ * Issue-tied call lines from `from` on that no `Skip if ISSUE_ID empty` line guards. The line sits
+ * in a tracker block: the guard is in that block. A `false` block renders only with no tracker
+ * wired, so it holds no issue-tied call. The line sits in no block (a call that also runs under
+ * `none`): the guard is in its numbered item.
+ */
+function unguardedIssueCalls(lines: string[], from: number): string[] {
+  const blocks = trackerBlocks(lines);
+  return lines.flatMap((line, i) => {
+    if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
+    const block = innermostBlock(blocks, i);
+    if (block?.kind === "false") return [];
+    const guardFrom =
+      block?.start ??
+      lines
+        .map((l, n) => (n <= i && /^\d+\. /.test(l) ? n : -1))
+        .reduce((a, b) => Math.max(a, b), -1);
+    const guarded =
+      guardFrom >= 0 && lines.slice(guardFrom, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
+    return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
+  });
+}
+
+/** Line indexes of the `issues labels --board=` fences. */
+const boardFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) =>
+    l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
+  );
+
+/** Line indexes that post a Failure Path `comment`. */
+const commentPosts = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+
+/** A Failure Path comment post is guarded on its own line or by a Skip line in its tracker block. */
+function guardedPost(lines: string[], blocks: TrackerBlock[], i: number): boolean {
+  const block = innermostBlock(blocks, i);
+  return (
+    lines[i]!.includes("`ISSUE_ID` empty") ||
+    (block !== undefined && lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)))
+  );
+}
+
+/** Tracker blocks lying wholly inside the line range. */
+const blocksWithin = (lines: string[], from: number, to: number): TrackerBlock[] =>
+  trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+
+/** The wired-tracker blocks of Step 1 that read blockers. */
+const blockerBlocks = (step1: string[]): TrackerBlock[] =>
+  trackerBlocks(step1).filter(
+    (b) =>
+      ["github", "linear", "jira"].includes(b.kind) &&
+      /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
+  );
+
+/** Line indexes of `branches push` fences. */
+const pushFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+
 describe("issue-less runs", () => {
   it.each(PHASES)(
     "%s: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty",
     (name) => {
       const lines = workflow(name).split("\n");
-      const blocks = trackerBlocks(lines);
       const from = bodyStart(lines);
       expect(from, name).toBeGreaterThan(0);
-      const unguarded = lines.flatMap((line, i) => {
-        if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
-        const block = innermostBlock(blocks, i);
-        const guarded =
-          block !== undefined &&
-          lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
-        return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
-      });
+      const unguarded = unguardedIssueCalls(lines, from);
       expect(unguarded, `${name}: issue-tied calls with no Skip if ISSUE_ID empty`).toEqual([]);
     },
   );
@@ -472,9 +526,7 @@ describe("issue-less runs", () => {
     (name) => {
       const lines = workflow(name).split("\n");
       const blocks = trackerBlocks(lines);
-      const fences = lines.flatMap((l, i) =>
-        l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
-      );
+      const fences = boardFences(lines);
       expect(fences.length, `${name}: no issues labels --board fence found`).toBeGreaterThanOrEqual(
         2,
       );
@@ -501,7 +553,8 @@ describe("issue-less runs", () => {
   });

   it.each(PHASES)("%s: fids check and steps gate carry --issue in every workflow", (name) => {
-    const text = workflow(name);
+    // The flag sits in a tracker block (a `none` run has no issue), so read the wired render.
+    const text = substituteWorkflow(workflow(name), "github").output;
     const step1 = section(text, /Step 1 — Start Workflow/);
     expect(commandLines(step1, "fids check"), name).toEqual([
       expect.stringContaining('--fid="{FID}" --issue="{ISSUE_ID}"'),
@@ -604,15 +657,13 @@ describe("issue-less runs", () => {
   it.each(PHASES)("%s: every Failure Path comment post sits behind the ISSUE_ID guard", (name) => {
     const failure = section(workflow(name), /Failure Path/).split("\n");
     const blocks = trackerBlocks(failure);
-    const posts = failure.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+    const posts = commentPosts(failure);
     expect(posts.length, name).toBeGreaterThan(0);
     for (const i of posts) {
-      const block = innermostBlock(blocks, i);
-      const guarded =
-        failure[i]!.includes("`ISSUE_ID` empty") ||
-        (block !== undefined &&
-          failure.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)));
-      expect(guarded, `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`).toBe(true);
+      expect(
+        guardedPost(failure, blocks, i),
+        `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`,
+      ).toBe(true);
     }
   });

@@ -625,7 +676,7 @@ describe("issue-less runs", () => {
       const at = lines.findIndex((l) => /^9\. .*(?:post-push|kill-switch)/i.test(l));
       expect(at, `${name}: kill-switch sub-step 9`).toBeGreaterThanOrEqual(0);
       const [from, to] = itemRange(lines, at);
-      const blocks = trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+      const blocks = blocksWithin(lines, from, to);
       expect(blocks.length, name).toBeGreaterThan(0);
       for (const b of blocks) {
         expect(
@@ -638,11 +689,7 @@ describe("issue-less runs", () => {

   it("build Step 1 blocker check skips when ISSUE_ID is empty", () => {
     const step1 = section(workflow("build"), /Step 1 — Start Workflow/).split("\n");
-    const blockers = trackerBlocks(step1).filter(
-      (b) =>
-        ["github", "linear", "jira"].includes(b.kind) &&
-        /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
-    );
+    const blockers = blockerBlocks(step1);
     expect(blockers).toHaveLength(3);
     for (const b of blockers) {
       expect(step1.slice(b.start, b.end + 1).join("\n")).toContain(SKIP_NO_ISSUE);
@@ -699,7 +746,7 @@ describe("debug on dev", () => {
   it("debug Steps 9 and 10 push nothing on dev", () => {
     for (const heading of [/Step 9 — Push Remediation/, /Step 10 — Summary/]) {
       const lines = section(debug, heading).split("\n");
-      const pushes = lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+      const pushes = pushFences(lines);
       expect(pushes.length, `${heading}: no branches push fence`).toBeGreaterThan(0);
       for (const i of pushes) {
         // Opening fence at i - 1; the line above it carries the dev skip.
```

## Diff since red — Task 14 `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-14-1.snapshot b/.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts
index c7e4ad26..4094a9eb 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-14-1.snapshot
+++ b/.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts
@@ -251,6 +251,12 @@ describe("bkit-debug.md — Step 11 on dev", () => {
   const step11 = debugMd.slice(start, debugMd.indexOf("### 🔒 Gate 11", start));
   const step11Fences = fences(step11);
   const at = (re: RegExp) => step11Fences.findIndex((f) => re.test(f));
+  const releaseFences = step11Fences.flatMap((f, i) =>
+    /"\{BKIT\}" locks release\b/.test(f) ? [i] : [],
+  );
+  const refusalRoute = step11
+    .split("\n")
+    .find((l) => l.includes("exit 8") && l.includes("exit 11"));

   it("debug Step 11 on dev waits for and gates the dev CI run", () => {
     const wait = at(/"\{BKIT\}" runs wait --head="?\{DEV_SHA\}"? --branch=dev --until=completed/);
@@ -273,15 +279,12 @@ describe("bkit-debug.md — Step 11 on dev", () => {
   it("debug Step 11 on dev releases the lock after the CI wait", () => {
     const push = at(/"\{BKIT\}" branches push --mode=dev\b/);
     const wait = at(/"\{BKIT\}" runs wait --head=/);
-    const releases = step11Fences.flatMap((f, i) =>
-      /"\{BKIT\}" locks release\b/.test(f) ? [i] : [],
-    );
     expect(push).toBeGreaterThan(-1);
     expect(wait).toBeGreaterThan(push);
     // The dev push block holds no release; one release follows the wait.
     expect(step11Fences[push]!).not.toContain("locks release");
     expect(
-      releases.some((i) => i > wait),
+      releaseFences.some((i) => i > wait),
       "no locks release after runs wait",
     ).toBe(true);
   });
@@ -303,8 +306,7 @@ describe("bkit-debug.md — Step 11 on dev", () => {
   });

   it("debug Step 11 on dev sends a refused push or a replay conflict to the Failure Path", () => {
-    const route = step11.split("\n").find((l) => l.includes("exit 8") && l.includes("exit 11"));
-    expect(route, "no push-refusal route").toBeDefined();
-    expect(route).toContain("**Failure Path**");
+    expect(refusalRoute, "no push-refusal route").toBeDefined();
+    expect(refusalRoute).toContain("**Failure Path**");
   });
 });
```

## Diff since red — Task 14 `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-14-2.snapshot b/.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts
index c7e4ad26..4094a9eb 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-14-2.snapshot
+++ b/.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts
@@ -251,6 +251,12 @@ describe("bkit-debug.md — Step 11 on dev", () => {
   const step11 = debugMd.slice(start, debugMd.indexOf("### 🔒 Gate 11", start));
   const step11Fences = fences(step11);
   const at = (re: RegExp) => step11Fences.findIndex((f) => re.test(f));
+  const releaseFences = step11Fences.flatMap((f, i) =>
+    /"\{BKIT\}" locks release\b/.test(f) ? [i] : [],
+  );
+  const refusalRoute = step11
+    .split("\n")
+    .find((l) => l.includes("exit 8") && l.includes("exit 11"));

   it("debug Step 11 on dev waits for and gates the dev CI run", () => {
     const wait = at(/"\{BKIT\}" runs wait --head="?\{DEV_SHA\}"? --branch=dev --until=completed/);
@@ -273,15 +279,12 @@ describe("bkit-debug.md — Step 11 on dev", () => {
   it("debug Step 11 on dev releases the lock after the CI wait", () => {
     const push = at(/"\{BKIT\}" branches push --mode=dev\b/);
     const wait = at(/"\{BKIT\}" runs wait --head=/);
-    const releases = step11Fences.flatMap((f, i) =>
-      /"\{BKIT\}" locks release\b/.test(f) ? [i] : [],
-    );
     expect(push).toBeGreaterThan(-1);
     expect(wait).toBeGreaterThan(push);
     // The dev push block holds no release; one release follows the wait.
     expect(step11Fences[push]!).not.toContain("locks release");
     expect(
-      releases.some((i) => i > wait),
+      releaseFences.some((i) => i > wait),
       "no locks release after runs wait",
     ).toBe(true);
   });
@@ -303,8 +306,7 @@ describe("bkit-debug.md — Step 11 on dev", () => {
   });

   it("debug Step 11 on dev sends a refused push or a replay conflict to the Failure Path", () => {
-    const route = step11.split("\n").find((l) => l.includes("exit 8") && l.includes("exit 11"));
-    expect(route, "no push-refusal route").toBeDefined();
-    expect(route).toContain("**Failure Path**");
+    expect(refusalRoute, "no push-refusal route").toBeDefined();
+    expect(refusalRoute).toContain("**Failure Path**");
   });
 });
```

## Diff since red — Task 14 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-14-3.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 94d7dc78..977eb210 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-14-3.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -6,6 +6,8 @@ import * as path from "node:path";

 import { describe, expect, it } from "vitest";

+import { substituteWorkflow } from "../../render/trackers";
+
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 const PHASES = ["design", "plan", "build", "debug", "ship"] as const;
 const ALL = ["auto", ...PHASES] as const;
@@ -406,17 +408,19 @@ interface TrackerBlock {
   end: number;
 }

-/** Every tracker block (nested ones too) as a line range, markers included. */
+/** Every tracker block (nested and inline ones too) as a line range, markers included. */
 function trackerBlocks(lines: string[]): TrackerBlock[] {
   const stack: { kind: string; start: number }[] = [];
   const out: TrackerBlock[] = [];
   lines.forEach((line, i) => {
-    const m = /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/.exec(line);
-    if (!m) return;
-    if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
-    else {
-      const open = stack.pop();
-      if (open) out.push({ ...open, end: i });
+    for (const m of line.matchAll(
+      /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/g,
+    )) {
+      if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
+      else {
+        const open = stack.pop();
+        if (open) out.push({ ...open, end: i });
+      }
     }
   });
   return out;
@@ -447,22 +451,72 @@ function itemRange(lines: string[], at: number): [number, number] {
   return [at, next === -1 ? lines.length : next];
 }

+/**
+ * Issue-tied call lines from `from` on that no `Skip if ISSUE_ID empty` line guards. The line sits
+ * in a tracker block: the guard is in that block. A `false` block renders only with no tracker
+ * wired, so it holds no issue-tied call. The line sits in no block (a call that also runs under
+ * `none`): the guard is in its numbered item.
+ */
+function unguardedIssueCalls(lines: string[], from: number): string[] {
+  const blocks = trackerBlocks(lines);
+  return lines.flatMap((line, i) => {
+    if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
+    const block = innermostBlock(blocks, i);
+    if (block?.kind === "false") return [];
+    const guardFrom =
+      block?.start ??
+      lines
+        .map((l, n) => (n <= i && /^\d+\. /.test(l) ? n : -1))
+        .reduce((a, b) => Math.max(a, b), -1);
+    const guarded =
+      guardFrom >= 0 && lines.slice(guardFrom, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
+    return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
+  });
+}
+
+/** Line indexes of the `issues labels --board=` fences. */
+const boardFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) =>
+    l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
+  );
+
+/** Line indexes that post a Failure Path `comment`. */
+const commentPosts = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+
+/** A Failure Path comment post is guarded on its own line or by a Skip line in its tracker block. */
+function guardedPost(lines: string[], blocks: TrackerBlock[], i: number): boolean {
+  const block = innermostBlock(blocks, i);
+  return (
+    lines[i]!.includes("`ISSUE_ID` empty") ||
+    (block !== undefined && lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)))
+  );
+}
+
+/** Tracker blocks lying wholly inside the line range. */
+const blocksWithin = (lines: string[], from: number, to: number): TrackerBlock[] =>
+  trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+
+/** The wired-tracker blocks of Step 1 that read blockers. */
+const blockerBlocks = (step1: string[]): TrackerBlock[] =>
+  trackerBlocks(step1).filter(
+    (b) =>
+      ["github", "linear", "jira"].includes(b.kind) &&
+      /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
+  );
+
+/** Line indexes of `branches push` fences. */
+const pushFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+
 describe("issue-less runs", () => {
   it.each(PHASES)(
     "%s: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty",
     (name) => {
       const lines = workflow(name).split("\n");
-      const blocks = trackerBlocks(lines);
       const from = bodyStart(lines);
       expect(from, name).toBeGreaterThan(0);
-      const unguarded = lines.flatMap((line, i) => {
-        if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
-        const block = innermostBlock(blocks, i);
-        const guarded =
-          block !== undefined &&
-          lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
-        return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
-      });
+      const unguarded = unguardedIssueCalls(lines, from);
       expect(unguarded, `${name}: issue-tied calls with no Skip if ISSUE_ID empty`).toEqual([]);
     },
   );
@@ -472,9 +526,7 @@ describe("issue-less runs", () => {
     (name) => {
       const lines = workflow(name).split("\n");
       const blocks = trackerBlocks(lines);
-      const fences = lines.flatMap((l, i) =>
-        l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
-      );
+      const fences = boardFences(lines);
       expect(fences.length, `${name}: no issues labels --board fence found`).toBeGreaterThanOrEqual(
         2,
       );
@@ -501,7 +553,8 @@ describe("issue-less runs", () => {
   });

   it.each(PHASES)("%s: fids check and steps gate carry --issue in every workflow", (name) => {
-    const text = workflow(name);
+    // The flag sits in a tracker block (a `none` run has no issue), so read the wired render.
+    const text = substituteWorkflow(workflow(name), "github").output;
     const step1 = section(text, /Step 1 — Start Workflow/);
     expect(commandLines(step1, "fids check"), name).toEqual([
       expect.stringContaining('--fid="{FID}" --issue="{ISSUE_ID}"'),
@@ -604,15 +657,13 @@ describe("issue-less runs", () => {
   it.each(PHASES)("%s: every Failure Path comment post sits behind the ISSUE_ID guard", (name) => {
     const failure = section(workflow(name), /Failure Path/).split("\n");
     const blocks = trackerBlocks(failure);
-    const posts = failure.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+    const posts = commentPosts(failure);
     expect(posts.length, name).toBeGreaterThan(0);
     for (const i of posts) {
-      const block = innermostBlock(blocks, i);
-      const guarded =
-        failure[i]!.includes("`ISSUE_ID` empty") ||
-        (block !== undefined &&
-          failure.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)));
-      expect(guarded, `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`).toBe(true);
+      expect(
+        guardedPost(failure, blocks, i),
+        `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`,
+      ).toBe(true);
     }
   });

@@ -625,7 +676,7 @@ describe("issue-less runs", () => {
       const at = lines.findIndex((l) => /^9\. .*(?:post-push|kill-switch)/i.test(l));
       expect(at, `${name}: kill-switch sub-step 9`).toBeGreaterThanOrEqual(0);
       const [from, to] = itemRange(lines, at);
-      const blocks = trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+      const blocks = blocksWithin(lines, from, to);
       expect(blocks.length, name).toBeGreaterThan(0);
       for (const b of blocks) {
         expect(
@@ -638,11 +689,7 @@ describe("issue-less runs", () => {

   it("build Step 1 blocker check skips when ISSUE_ID is empty", () => {
     const step1 = section(workflow("build"), /Step 1 — Start Workflow/).split("\n");
-    const blockers = trackerBlocks(step1).filter(
-      (b) =>
-        ["github", "linear", "jira"].includes(b.kind) &&
-        /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
-    );
+    const blockers = blockerBlocks(step1);
     expect(blockers).toHaveLength(3);
     for (const b of blockers) {
       expect(step1.slice(b.start, b.end + 1).join("\n")).toContain(SKIP_NO_ISSUE);
@@ -699,7 +746,7 @@ describe("debug on dev", () => {
   it("debug Steps 9 and 10 push nothing on dev", () => {
     for (const heading of [/Step 9 — Push Remediation/, /Step 10 — Summary/]) {
       const lines = section(debug, heading).split("\n");
-      const pushes = lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+      const pushes = pushFences(lines);
       expect(pushes.length, `${heading}: no branches push fence`).toBeGreaterThan(0);
       for (const i of pushes) {
         // Opening fence at i - 1; the line above it carries the dev skip.
```

## Diff since red — Task 14 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-14-4.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 94d7dc78..977eb210 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-14-4.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -6,6 +6,8 @@ import * as path from "node:path";

 import { describe, expect, it } from "vitest";

+import { substituteWorkflow } from "../../render/trackers";
+
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 const PHASES = ["design", "plan", "build", "debug", "ship"] as const;
 const ALL = ["auto", ...PHASES] as const;
@@ -406,17 +408,19 @@ interface TrackerBlock {
   end: number;
 }

-/** Every tracker block (nested ones too) as a line range, markers included. */
+/** Every tracker block (nested and inline ones too) as a line range, markers included. */
 function trackerBlocks(lines: string[]): TrackerBlock[] {
   const stack: { kind: string; start: number }[] = [];
   const out: TrackerBlock[] = [];
   lines.forEach((line, i) => {
-    const m = /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/.exec(line);
-    if (!m) return;
-    if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
-    else {
-      const open = stack.pop();
-      if (open) out.push({ ...open, end: i });
+    for (const m of line.matchAll(
+      /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/g,
+    )) {
+      if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
+      else {
+        const open = stack.pop();
+        if (open) out.push({ ...open, end: i });
+      }
     }
   });
   return out;
@@ -447,22 +451,72 @@ function itemRange(lines: string[], at: number): [number, number] {
   return [at, next === -1 ? lines.length : next];
 }

+/**
+ * Issue-tied call lines from `from` on that no `Skip if ISSUE_ID empty` line guards. The line sits
+ * in a tracker block: the guard is in that block. A `false` block renders only with no tracker
+ * wired, so it holds no issue-tied call. The line sits in no block (a call that also runs under
+ * `none`): the guard is in its numbered item.
+ */
+function unguardedIssueCalls(lines: string[], from: number): string[] {
+  const blocks = trackerBlocks(lines);
+  return lines.flatMap((line, i) => {
+    if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
+    const block = innermostBlock(blocks, i);
+    if (block?.kind === "false") return [];
+    const guardFrom =
+      block?.start ??
+      lines
+        .map((l, n) => (n <= i && /^\d+\. /.test(l) ? n : -1))
+        .reduce((a, b) => Math.max(a, b), -1);
+    const guarded =
+      guardFrom >= 0 && lines.slice(guardFrom, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
+    return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
+  });
+}
+
+/** Line indexes of the `issues labels --board=` fences. */
+const boardFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) =>
+    l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
+  );
+
+/** Line indexes that post a Failure Path `comment`. */
+const commentPosts = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+
+/** A Failure Path comment post is guarded on its own line or by a Skip line in its tracker block. */
+function guardedPost(lines: string[], blocks: TrackerBlock[], i: number): boolean {
+  const block = innermostBlock(blocks, i);
+  return (
+    lines[i]!.includes("`ISSUE_ID` empty") ||
+    (block !== undefined && lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)))
+  );
+}
+
+/** Tracker blocks lying wholly inside the line range. */
+const blocksWithin = (lines: string[], from: number, to: number): TrackerBlock[] =>
+  trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+
+/** The wired-tracker blocks of Step 1 that read blockers. */
+const blockerBlocks = (step1: string[]): TrackerBlock[] =>
+  trackerBlocks(step1).filter(
+    (b) =>
+      ["github", "linear", "jira"].includes(b.kind) &&
+      /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
+  );
+
+/** Line indexes of `branches push` fences. */
+const pushFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+
 describe("issue-less runs", () => {
   it.each(PHASES)(
     "%s: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty",
     (name) => {
       const lines = workflow(name).split("\n");
-      const blocks = trackerBlocks(lines);
       const from = bodyStart(lines);
       expect(from, name).toBeGreaterThan(0);
-      const unguarded = lines.flatMap((line, i) => {
-        if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
-        const block = innermostBlock(blocks, i);
-        const guarded =
-          block !== undefined &&
-          lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
-        return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
-      });
+      const unguarded = unguardedIssueCalls(lines, from);
       expect(unguarded, `${name}: issue-tied calls with no Skip if ISSUE_ID empty`).toEqual([]);
     },
   );
@@ -472,9 +526,7 @@ describe("issue-less runs", () => {
     (name) => {
       const lines = workflow(name).split("\n");
       const blocks = trackerBlocks(lines);
-      const fences = lines.flatMap((l, i) =>
-        l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
-      );
+      const fences = boardFences(lines);
       expect(fences.length, `${name}: no issues labels --board fence found`).toBeGreaterThanOrEqual(
         2,
       );
@@ -501,7 +553,8 @@ describe("issue-less runs", () => {
   });

   it.each(PHASES)("%s: fids check and steps gate carry --issue in every workflow", (name) => {
-    const text = workflow(name);
+    // The flag sits in a tracker block (a `none` run has no issue), so read the wired render.
+    const text = substituteWorkflow(workflow(name), "github").output;
     const step1 = section(text, /Step 1 — Start Workflow/);
     expect(commandLines(step1, "fids check"), name).toEqual([
       expect.stringContaining('--fid="{FID}" --issue="{ISSUE_ID}"'),
@@ -604,15 +657,13 @@ describe("issue-less runs", () => {
   it.each(PHASES)("%s: every Failure Path comment post sits behind the ISSUE_ID guard", (name) => {
     const failure = section(workflow(name), /Failure Path/).split("\n");
     const blocks = trackerBlocks(failure);
-    const posts = failure.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+    const posts = commentPosts(failure);
     expect(posts.length, name).toBeGreaterThan(0);
     for (const i of posts) {
-      const block = innermostBlock(blocks, i);
-      const guarded =
-        failure[i]!.includes("`ISSUE_ID` empty") ||
-        (block !== undefined &&
-          failure.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)));
-      expect(guarded, `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`).toBe(true);
+      expect(
+        guardedPost(failure, blocks, i),
+        `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`,
+      ).toBe(true);
     }
   });

@@ -625,7 +676,7 @@ describe("issue-less runs", () => {
       const at = lines.findIndex((l) => /^9\. .*(?:post-push|kill-switch)/i.test(l));
       expect(at, `${name}: kill-switch sub-step 9`).toBeGreaterThanOrEqual(0);
       const [from, to] = itemRange(lines, at);
-      const blocks = trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+      const blocks = blocksWithin(lines, from, to);
       expect(blocks.length, name).toBeGreaterThan(0);
       for (const b of blocks) {
         expect(
@@ -638,11 +689,7 @@ describe("issue-less runs", () => {

   it("build Step 1 blocker check skips when ISSUE_ID is empty", () => {
     const step1 = section(workflow("build"), /Step 1 — Start Workflow/).split("\n");
-    const blockers = trackerBlocks(step1).filter(
-      (b) =>
-        ["github", "linear", "jira"].includes(b.kind) &&
-        /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
-    );
+    const blockers = blockerBlocks(step1);
     expect(blockers).toHaveLength(3);
     for (const b of blockers) {
       expect(step1.slice(b.start, b.end + 1).join("\n")).toContain(SKIP_NO_ISSUE);
@@ -699,7 +746,7 @@ describe("debug on dev", () => {
   it("debug Steps 9 and 10 push nothing on dev", () => {
     for (const heading of [/Step 9 — Push Remediation/, /Step 10 — Summary/]) {
       const lines = section(debug, heading).split("\n");
-      const pushes = lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+      const pushes = pushFences(lines);
       expect(pushes.length, `${heading}: no branches push fence`).toBeGreaterThan(0);
       for (const i of pushes) {
         // Opening fence at i - 1; the line above it carries the dev skip.
```

## Diff since red — Task 14 `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-14-5.snapshot b/.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts
index c7e4ad26..4094a9eb 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-14-5.snapshot
+++ b/.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts
@@ -251,6 +251,12 @@ describe("bkit-debug.md — Step 11 on dev", () => {
   const step11 = debugMd.slice(start, debugMd.indexOf("### 🔒 Gate 11", start));
   const step11Fences = fences(step11);
   const at = (re: RegExp) => step11Fences.findIndex((f) => re.test(f));
+  const releaseFences = step11Fences.flatMap((f, i) =>
+    /"\{BKIT\}" locks release\b/.test(f) ? [i] : [],
+  );
+  const refusalRoute = step11
+    .split("\n")
+    .find((l) => l.includes("exit 8") && l.includes("exit 11"));

   it("debug Step 11 on dev waits for and gates the dev CI run", () => {
     const wait = at(/"\{BKIT\}" runs wait --head="?\{DEV_SHA\}"? --branch=dev --until=completed/);
@@ -273,15 +279,12 @@ describe("bkit-debug.md — Step 11 on dev", () => {
   it("debug Step 11 on dev releases the lock after the CI wait", () => {
     const push = at(/"\{BKIT\}" branches push --mode=dev\b/);
     const wait = at(/"\{BKIT\}" runs wait --head=/);
-    const releases = step11Fences.flatMap((f, i) =>
-      /"\{BKIT\}" locks release\b/.test(f) ? [i] : [],
-    );
     expect(push).toBeGreaterThan(-1);
     expect(wait).toBeGreaterThan(push);
     // The dev push block holds no release; one release follows the wait.
     expect(step11Fences[push]!).not.toContain("locks release");
     expect(
-      releases.some((i) => i > wait),
+      releaseFences.some((i) => i > wait),
       "no locks release after runs wait",
     ).toBe(true);
   });
@@ -303,8 +306,7 @@ describe("bkit-debug.md — Step 11 on dev", () => {
   });

   it("debug Step 11 on dev sends a refused push or a replay conflict to the Failure Path", () => {
-    const route = step11.split("\n").find((l) => l.includes("exit 8") && l.includes("exit 11"));
-    expect(route, "no push-refusal route").toBeDefined();
-    expect(route).toContain("**Failure Path**");
+    expect(refusalRoute, "no push-refusal route").toBeDefined();
+    expect(refusalRoute).toContain("**Failure Path**");
   });
 });
```

## Diff since red — Task 14 `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-14-6.snapshot b/.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts
index c7e4ad26..4094a9eb 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-14-6.snapshot
+++ b/.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts
@@ -251,6 +251,12 @@ describe("bkit-debug.md — Step 11 on dev", () => {
   const step11 = debugMd.slice(start, debugMd.indexOf("### 🔒 Gate 11", start));
   const step11Fences = fences(step11);
   const at = (re: RegExp) => step11Fences.findIndex((f) => re.test(f));
+  const releaseFences = step11Fences.flatMap((f, i) =>
+    /"\{BKIT\}" locks release\b/.test(f) ? [i] : [],
+  );
+  const refusalRoute = step11
+    .split("\n")
+    .find((l) => l.includes("exit 8") && l.includes("exit 11"));

   it("debug Step 11 on dev waits for and gates the dev CI run", () => {
     const wait = at(/"\{BKIT\}" runs wait --head="?\{DEV_SHA\}"? --branch=dev --until=completed/);
@@ -273,15 +279,12 @@ describe("bkit-debug.md — Step 11 on dev", () => {
   it("debug Step 11 on dev releases the lock after the CI wait", () => {
     const push = at(/"\{BKIT\}" branches push --mode=dev\b/);
     const wait = at(/"\{BKIT\}" runs wait --head=/);
-    const releases = step11Fences.flatMap((f, i) =>
-      /"\{BKIT\}" locks release\b/.test(f) ? [i] : [],
-    );
     expect(push).toBeGreaterThan(-1);
     expect(wait).toBeGreaterThan(push);
     // The dev push block holds no release; one release follows the wait.
     expect(step11Fences[push]!).not.toContain("locks release");
     expect(
-      releases.some((i) => i > wait),
+      releaseFences.some((i) => i > wait),
       "no locks release after runs wait",
     ).toBe(true);
   });
@@ -303,8 +306,7 @@ describe("bkit-debug.md — Step 11 on dev", () => {
   });

   it("debug Step 11 on dev sends a refused push or a replay conflict to the Failure Path", () => {
-    const route = step11.split("\n").find((l) => l.includes("exit 8") && l.includes("exit 11"));
-    expect(route, "no push-refusal route").toBeDefined();
-    expect(route).toContain("**Failure Path**");
+    expect(refusalRoute, "no push-refusal route").toBeDefined();
+    expect(refusalRoute).toContain("**Failure Path**");
   });
 });
```

## Diff since red — Task 14 `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-14-7.snapshot b/.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts
index c7e4ad26..4094a9eb 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-14-7.snapshot
+++ b/.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts
@@ -251,6 +251,12 @@ describe("bkit-debug.md — Step 11 on dev", () => {
   const step11 = debugMd.slice(start, debugMd.indexOf("### 🔒 Gate 11", start));
   const step11Fences = fences(step11);
   const at = (re: RegExp) => step11Fences.findIndex((f) => re.test(f));
+  const releaseFences = step11Fences.flatMap((f, i) =>
+    /"\{BKIT\}" locks release\b/.test(f) ? [i] : [],
+  );
+  const refusalRoute = step11
+    .split("\n")
+    .find((l) => l.includes("exit 8") && l.includes("exit 11"));

   it("debug Step 11 on dev waits for and gates the dev CI run", () => {
     const wait = at(/"\{BKIT\}" runs wait --head="?\{DEV_SHA\}"? --branch=dev --until=completed/);
@@ -273,15 +279,12 @@ describe("bkit-debug.md — Step 11 on dev", () => {
   it("debug Step 11 on dev releases the lock after the CI wait", () => {
     const push = at(/"\{BKIT\}" branches push --mode=dev\b/);
     const wait = at(/"\{BKIT\}" runs wait --head=/);
-    const releases = step11Fences.flatMap((f, i) =>
-      /"\{BKIT\}" locks release\b/.test(f) ? [i] : [],
-    );
     expect(push).toBeGreaterThan(-1);
     expect(wait).toBeGreaterThan(push);
     // The dev push block holds no release; one release follows the wait.
     expect(step11Fences[push]!).not.toContain("locks release");
     expect(
-      releases.some((i) => i > wait),
+      releaseFences.some((i) => i > wait),
       "no locks release after runs wait",
     ).toBe(true);
   });
@@ -303,8 +306,7 @@ describe("bkit-debug.md — Step 11 on dev", () => {
   });

   it("debug Step 11 on dev sends a refused push or a replay conflict to the Failure Path", () => {
-    const route = step11.split("\n").find((l) => l.includes("exit 8") && l.includes("exit 11"));
-    expect(route, "no push-refusal route").toBeDefined();
-    expect(route).toContain("**Failure Path**");
+    expect(refusalRoute, "no push-refusal route").toBeDefined();
+    expect(refusalRoute).toContain("**Failure Path**");
   });
 });
```

## Diff since red — Task 14 `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-14-8.snapshot b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 94d7dc78..977eb210 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-14-8.snapshot
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -6,6 +6,8 @@ import * as path from "node:path";

 import { describe, expect, it } from "vitest";

+import { substituteWorkflow } from "../../render/trackers";
+
 const REPO_ROOT = path.resolve(__dirname, "../../../../..");
 const PHASES = ["design", "plan", "build", "debug", "ship"] as const;
 const ALL = ["auto", ...PHASES] as const;
@@ -406,17 +408,19 @@ interface TrackerBlock {
   end: number;
 }

-/** Every tracker block (nested ones too) as a line range, markers included. */
+/** Every tracker block (nested and inline ones too) as a line range, markers included. */
 function trackerBlocks(lines: string[]): TrackerBlock[] {
   const stack: { kind: string; start: number }[] = [];
   const out: TrackerBlock[] = [];
   lines.forEach((line, i) => {
-    const m = /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/.exec(line);
-    if (!m) return;
-    if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
-    else {
-      const open = stack.pop();
-      if (open) out.push({ ...open, end: i });
+    for (const m of line.matchAll(
+      /<!-- bkit:tracker (github|linear|jira|true|false) (start|end) -->/g,
+    )) {
+      if (m[2] === "start") stack.push({ kind: m[1]!, start: i });
+      else {
+        const open = stack.pop();
+        if (open) out.push({ ...open, end: i });
+      }
     }
   });
   return out;
@@ -447,22 +451,72 @@ function itemRange(lines: string[], at: number): [number, number] {
   return [at, next === -1 ? lines.length : next];
 }

+/**
+ * Issue-tied call lines from `from` on that no `Skip if ISSUE_ID empty` line guards. The line sits
+ * in a tracker block: the guard is in that block. A `false` block renders only with no tracker
+ * wired, so it holds no issue-tied call. The line sits in no block (a call that also runs under
+ * `none`): the guard is in its numbered item.
+ */
+function unguardedIssueCalls(lines: string[], from: number): string[] {
+  const blocks = trackerBlocks(lines);
+  return lines.flatMap((line, i) => {
+    if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
+    const block = innermostBlock(blocks, i);
+    if (block?.kind === "false") return [];
+    const guardFrom =
+      block?.start ??
+      lines
+        .map((l, n) => (n <= i && /^\d+\. /.test(l) ? n : -1))
+        .reduce((a, b) => Math.max(a, b), -1);
+    const guarded =
+      guardFrom >= 0 && lines.slice(guardFrom, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
+    return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
+  });
+}
+
+/** Line indexes of the `issues labels --board=` fences. */
+const boardFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) =>
+    l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
+  );
+
+/** Line indexes that post a Failure Path `comment`. */
+const commentPosts = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+
+/** A Failure Path comment post is guarded on its own line or by a Skip line in its tracker block. */
+function guardedPost(lines: string[], blocks: TrackerBlock[], i: number): boolean {
+  const block = innermostBlock(blocks, i);
+  return (
+    lines[i]!.includes("`ISSUE_ID` empty") ||
+    (block !== undefined && lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)))
+  );
+}
+
+/** Tracker blocks lying wholly inside the line range. */
+const blocksWithin = (lines: string[], from: number, to: number): TrackerBlock[] =>
+  trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+
+/** The wired-tracker blocks of Step 1 that read blockers. */
+const blockerBlocks = (step1: string[]): TrackerBlock[] =>
+  trackerBlocks(step1).filter(
+    (b) =>
+      ["github", "linear", "jira"].includes(b.kind) &&
+      /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
+  );
+
+/** Line indexes of `branches push` fences. */
+const pushFences = (lines: string[]): number[] =>
+  lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+
 describe("issue-less runs", () => {
   it.each(PHASES)(
     "%s: every tracker MCP call and bkit issues fence is guarded by ISSUE_ID empty",
     (name) => {
       const lines = workflow(name).split("\n");
-      const blocks = trackerBlocks(lines);
       const from = bodyStart(lines);
       expect(from, name).toBeGreaterThan(0);
-      const unguarded = lines.flatMap((line, i) => {
-        if (i < from || !ISSUE_TIED.some((re) => re.test(line))) return [];
-        const block = innermostBlock(blocks, i);
-        const guarded =
-          block !== undefined &&
-          lines.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE));
-        return guarded ? [] : [`${i + 1}: ${line.trim().slice(0, 100)}`];
-      });
+      const unguarded = unguardedIssueCalls(lines, from);
       expect(unguarded, `${name}: issue-tied calls with no Skip if ISSUE_ID empty`).toEqual([]);
     },
   );
@@ -472,9 +526,7 @@ describe("issue-less runs", () => {
     (name) => {
       const lines = workflow(name).split("\n");
       const blocks = trackerBlocks(lines);
-      const fences = lines.flatMap((l, i) =>
-        l.includes('"{BKIT}" issues labels') && l.includes("--board=") ? [i] : [],
-      );
+      const fences = boardFences(lines);
       expect(fences.length, `${name}: no issues labels --board fence found`).toBeGreaterThanOrEqual(
         2,
       );
@@ -501,7 +553,8 @@ describe("issue-less runs", () => {
   });

   it.each(PHASES)("%s: fids check and steps gate carry --issue in every workflow", (name) => {
-    const text = workflow(name);
+    // The flag sits in a tracker block (a `none` run has no issue), so read the wired render.
+    const text = substituteWorkflow(workflow(name), "github").output;
     const step1 = section(text, /Step 1 — Start Workflow/);
     expect(commandLines(step1, "fids check"), name).toEqual([
       expect.stringContaining('--fid="{FID}" --issue="{ISSUE_ID}"'),
@@ -604,15 +657,13 @@ describe("issue-less runs", () => {
   it.each(PHASES)("%s: every Failure Path comment post sits behind the ISSUE_ID guard", (name) => {
     const failure = section(workflow(name), /Failure Path/).split("\n");
     const blocks = trackerBlocks(failure);
-    const posts = failure.flatMap((l, i) => (/[Pp]ost `comment`/.test(l) ? [i] : []));
+    const posts = commentPosts(failure);
     expect(posts.length, name).toBeGreaterThan(0);
     for (const i of posts) {
-      const block = innermostBlock(blocks, i);
-      const guarded =
-        failure[i]!.includes("`ISSUE_ID` empty") ||
-        (block !== undefined &&
-          failure.slice(block.start, i + 1).some((l) => l.includes(SKIP_NO_ISSUE)));
-      expect(guarded, `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`).toBe(true);
+      expect(
+        guardedPost(failure, blocks, i),
+        `${name}: Failure Path line ${i + 1}: ${failure[i]!.trim()}`,
+      ).toBe(true);
     }
   });

@@ -625,7 +676,7 @@ describe("issue-less runs", () => {
       const at = lines.findIndex((l) => /^9\. .*(?:post-push|kill-switch)/i.test(l));
       expect(at, `${name}: kill-switch sub-step 9`).toBeGreaterThanOrEqual(0);
       const [from, to] = itemRange(lines, at);
-      const blocks = trackerBlocks(lines).filter((b) => b.start >= from && b.end <= to);
+      const blocks = blocksWithin(lines, from, to);
       expect(blocks.length, name).toBeGreaterThan(0);
       for (const b of blocks) {
         expect(
@@ -638,11 +689,7 @@ describe("issue-less runs", () => {

   it("build Step 1 blocker check skips when ISSUE_ID is empty", () => {
     const step1 = section(workflow("build"), /Step 1 — Start Workflow/).split("\n");
-    const blockers = trackerBlocks(step1).filter(
-      (b) =>
-        ["github", "linear", "jira"].includes(b.kind) &&
-        /blocked|blockers/.test(step1.slice(b.start, b.end + 1).join("\n")),
-    );
+    const blockers = blockerBlocks(step1);
     expect(blockers).toHaveLength(3);
     for (const b of blockers) {
       expect(step1.slice(b.start, b.end + 1).join("\n")).toContain(SKIP_NO_ISSUE);
@@ -699,7 +746,7 @@ describe("debug on dev", () => {
   it("debug Steps 9 and 10 push nothing on dev", () => {
     for (const heading of [/Step 9 — Push Remediation/, /Step 10 — Summary/]) {
       const lines = section(debug, heading).split("\n");
-      const pushes = lines.flatMap((l, i) => (/^\s*"\{BKIT\}" branches push\b/.test(l) ? [i] : []));
+      const pushes = pushFences(lines);
       expect(pushes.length, `${heading}: no branches push fence`).toBeGreaterThan(0);
       for (const i of pushes) {
         // Opening fence at i - 1; the line above it carries the dev skip.
```

## Diff since red — Task 15 `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-15-1.snapshot b/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
index 59cf2641..85bf90c7 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-15-1.snapshot
+++ b/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
@@ -651,6 +651,9 @@ describe("bkit-ship.md — Failure Path single-write contract", () => {
 // and the MCP merge fallback asserts the base itself.
 describe("bkit-ship.md — issue-less runs and the main guard", () => {
   const SKIP = "**Skip if** `ISSUE_ID` empty";
+  /** Index of the first line after `start` matching `re`. */
+  const nextAfter = (lines: string[], start: number, re: RegExp) =>
+    lines.findIndex((l, i) => i > start && re.test(l));
   const step10 = () =>
     section(readShip(), /^## .*Step \d+ — Merge Gate \+ Merge PR/, /^### .*Gate/);

@@ -692,7 +695,7 @@ describe("bkit-ship.md — issue-less runs and the main guard", () => {
   it("Step 14.3 labels skip when ISSUE_ID is empty", () => {
     const lines = section(readShip(), /^## .*Step 14 — Close Workflow/, /^### .*Gate/).split("\n");
     const start = lines.findIndex((l) => /^3\. /.test(l));
-    const end = lines.findIndex((l, i) => i > start && /^4\. /.test(l));
+    const end = nextAfter(lines, start, /^4\. /);
     expect(start).toBeGreaterThanOrEqual(0);
     const item = lines.slice(start, end).join("\n");
     const all = blocks(item);
```

## Diff since red — Task 15 `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-15-3.snapshot b/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
index 59cf2641..85bf90c7 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-15-3.snapshot
+++ b/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
@@ -651,6 +651,9 @@ describe("bkit-ship.md — Failure Path single-write contract", () => {
 // and the MCP merge fallback asserts the base itself.
 describe("bkit-ship.md — issue-less runs and the main guard", () => {
   const SKIP = "**Skip if** `ISSUE_ID` empty";
+  /** Index of the first line after `start` matching `re`. */
+  const nextAfter = (lines: string[], start: number, re: RegExp) =>
+    lines.findIndex((l, i) => i > start && re.test(l));
   const step10 = () =>
     section(readShip(), /^## .*Step \d+ — Merge Gate \+ Merge PR/, /^### .*Gate/);

@@ -692,7 +695,7 @@ describe("bkit-ship.md — issue-less runs and the main guard", () => {
   it("Step 14.3 labels skip when ISSUE_ID is empty", () => {
     const lines = section(readShip(), /^## .*Step 14 — Close Workflow/, /^### .*Gate/).split("\n");
     const start = lines.findIndex((l) => /^3\. /.test(l));
-    const end = lines.findIndex((l, i) => i > start && /^4\. /.test(l));
+    const end = nextAfter(lines, start, /^4\. /);
     expect(start).toBeGreaterThanOrEqual(0);
     const item = lines.slice(start, end).join("\n");
     const all = blocks(item);
```

## Diff since red — Task 15 `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`

```diff
diff --git a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-15-4.snapshot b/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
index 59cf2641..85bf90c7 100644
--- a/docs/plans/202610/logs/650-workflows-prompt-alone/build-task-red-2-15-4.snapshot
+++ b/.bkit/core/engine/audits/workflows/ship-invariants.test.ts
@@ -651,6 +651,9 @@ describe("bkit-ship.md — Failure Path single-write contract", () => {
 // and the MCP merge fallback asserts the base itself.
 describe("bkit-ship.md — issue-less runs and the main guard", () => {
   const SKIP = "**Skip if** `ISSUE_ID` empty";
+  /** Index of the first line after `start` matching `re`. */
+  const nextAfter = (lines: string[], start: number, re: RegExp) =>
+    lines.findIndex((l, i) => i > start && re.test(l));
   const step10 = () =>
     section(readShip(), /^## .*Step \d+ — Merge Gate \+ Merge PR/, /^### .*Gate/);

@@ -692,7 +695,7 @@ describe("bkit-ship.md — issue-less runs and the main guard", () => {
   it("Step 14.3 labels skip when ISSUE_ID is empty", () => {
     const lines = section(readShip(), /^## .*Step 14 — Close Workflow/, /^### .*Gate/).split("\n");
     const start = lines.findIndex((l) => /^3\. /.test(l));
-    const end = lines.findIndex((l, i) => i > start && /^4\. /.test(l));
+    const end = nextAfter(lines, start, /^4\. /);
     expect(start).toBeGreaterThanOrEqual(0);
     const item = lines.slice(start, end).join("\n");
     const all = blocks(item);
```

## Runner output — `.bkit/core/engine/audits/workflows/ship-invariants.test.ts`

```

> @cbartens/bkit@5.5.1 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/audits/workflows/ship-invariants.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

 ✓ .bkit/core/engine/audits/workflows/ship-invariants.test.ts (48 tests) 13ms

 Test Files  1 passed (1)
      Tests  48 passed (48)
   Start at  20:10:48
   Duration  92ms (transform 53%, tests 29%, setup 8%, import 6%, worker 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-VuinC8/junit.xml
```
