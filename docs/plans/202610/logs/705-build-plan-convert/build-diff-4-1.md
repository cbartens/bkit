diff --git a/.bkit/cloud.md b/.bkit/cloud.md
index fe792ac10..09ef6c56d 100644
--- a/.bkit/cloud.md
+++ b/.bkit/cloud.md
@@ -396,7 +396,7 @@ When bkit reference Dockerfile changes (e.g. vale bump):
 
 # Post-CI auto-routing
 
-After `bkit-build` Step 15 close-workflow pushes CI-trigger commit (`chore({FID}): close-workflow`, no skip tags) and exits, post-CI router decides ship vs. debug and dispatches matching skill in fresh cloud session — no operator action between CI completion and dispatched session.
+After `bkit-build` Step 16 close-workflow pushes CI-trigger commit (`chore({FID}): close-workflow`, no skip tags) and exits, post-CI router decides ship vs. debug and dispatches matching skill in fresh cloud session — no operator action between CI completion and dispatched session.
 
 Routing **logic** in single bkit-managed slash-command orchestrator (`.bkit/core/workflows/bkit-auto.md`, mirrored to `.claude/commands/bkit-auto.md` + `.cursor/commands/bkit-auto.md` on each `pnpm bkit install`). Routing **trigger** wired separately per IDE — different event surfaces.
 
diff --git a/.bkit/core/.bkit/cloud.md b/.bkit/core/.bkit/cloud.md
index 7f82e0b7a..b2dab8af0 100644
--- a/.bkit/core/.bkit/cloud.md
+++ b/.bkit/core/.bkit/cloud.md
@@ -396,7 +396,7 @@ When bkit reference Dockerfile changes (e.g. vale bump):
 
 # Post-CI auto-routing
 
-After `bkit-build` Step 15 close-workflow pushes CI-trigger commit (`chore({FID}): close-workflow`, no skip tags) and exits, post-CI router decides ship vs. debug and dispatches matching skill in fresh cloud session — no operator action between CI completion and dispatched session.
+After `bkit-build` Step 16 close-workflow pushes CI-trigger commit (`chore({FID}): close-workflow`, no skip tags) and exits, post-CI router decides ship vs. debug and dispatches matching skill in fresh cloud session — no operator action between CI completion and dispatched session.
 
 Routing **logic** in single bkit-managed slash-command orchestrator (`.bkit/core/workflows/bkit-auto.md`, mirrored to `.claude/commands/bkit-auto.md` + `.cursor/commands/bkit-auto.md` on each `pnpm bkit install`). Routing **trigger** wired separately per IDE — different event surfaces.
 
diff --git a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
index 366fddc10..076025bd7 100644
--- a/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
+++ b/.bkit/core/engine/audits/workflows/workflow-shape.test.ts
@@ -391,6 +391,48 @@ function withNoAgent(lines: string[]): string[] {
   return lines.filter((l) => !l.includes("--agent"));
 }
 
+/** A live doc naming a build step by number, and the build table row its sentence means. */
+const LIVE_DOC_CLAIMS: ReadonlyArray<{ file: string; pattern: RegExp; step: string }> = [
+  {
+    file: "docs/deployments.md",
+    pattern: /Gate sites \(2\):\*\* build Step (\d+)/,
+    step: "build-close-workflow",
+  },
+  {
+    file: "docs/deployments.md",
+    pattern: /Open-PR pre-flight \(build Step (\d+)\)/,
+    step: "build-close-workflow",
+  },
+  {
+    file: ".bkit/cloud.md",
+    pattern: /`bkit-build` Step (\d+) close-workflow/,
+    step: "build-close-workflow",
+  },
+  {
+    file: ".bkit/core/.bkit/cloud.md",
+    pattern: /`bkit-build` Step (\d+) close-workflow/,
+    step: "build-close-workflow",
+  },
+];
+
+/** Each live-doc build-step number that disagrees with the number its table row carries. */
+function staleStepRefs(
+  claims: ReadonlyArray<{ file: string; pattern: RegExp; step: string }>,
+): string[] {
+  const numbers = new Map(
+    WORKFLOW_STEPS.build.map((s): [string, number] => [s.step ?? "", s.number]),
+  );
+  return claims.flatMap(({ file, pattern, step }) => {
+    const expected = numbers.get(step);
+    const named = pattern.exec(fs.readFileSync(path.join(REPO_ROOT, file), "utf-8"))?.[1];
+    if (expected === undefined) return [`${file}: the build table carries no ${step} row`];
+    if (named === undefined) return [`${file}: no ${step} step number named`];
+    return Number(named) === expected
+      ? []
+      : [`${file}: ${step} at Step ${named}, the table carries ${expected}`];
+  });
+}
+
 describe("build", () => {
   const build = workflow("build");
 
@@ -744,6 +786,12 @@ describe("build", () => {
   });
 });
 
+describe("live docs", () => {
+  it("live docs name no build step the table does not carry", () => {
+    expect(staleStepRefs(LIVE_DOC_CLAIMS)).toEqual([]);
+  });
+});
+
 describe("resume", () => {
   /** Each `Step N — Title` heading, with the text up to the next step or section heading. */
   function stepSections(text: string): Array<{ number: number; title: string; body: string }> {
diff --git a/docs/deferrals.jsonl b/docs/deferrals.jsonl
index 4200b4b33..322f6d561 100644
--- a/docs/deferrals.jsonl
+++ b/docs/deferrals.jsonl
@@ -274,3 +274,7 @@
 {"schema":3,"ts":1793001441034,"kind":"deferral","key":"699-completeness-check-excludes-bkit-auto-router","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-generate","subagent":"bkit-plan-generate","model":"claude-opus-5-5"},"references":["699","docs/plans/202610/699-engine-run-completeness-design.md"],"reason":"scope-declared","type":"issue","category":"observability","severity":"LOW","summary":"The completeness check covers design / plan / build / debug / ship only; the bkit-auto router markdown has no contract of its own","description":"The design's Success Criterion 1 scopes the report to design / plan / build / debug / ship, and the derived step universe is cross-checked against WORKFLOW_STEPS, whose keys are exactly those five. bkit-auto is a phase router: it dispatches to one of the five workflows rather than carrying a step universe of its own, so a run whose status.jsonl workflow is auto has no contract to check against and the CLI reports no verdict for it (rather than reporting it holey).","remediation":"Decide whether bkit-auto should carry a contract at all (e.g. 'the dispatched workflow's run started'), then either extend WORKFLOW_STEPS with an auto entry or have the check treat the routed workflow's run as the auto run's continuation.","source":"plan-1 Task 7 (WS-1 Out of Scope); design Success Criterion 1","status":"OPEN"}
 {"schema":3,"ts":1793001441035,"kind":"deferral","key":"699-completeness-verdict-no-success-axis","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-generate","subagent":"bkit-plan-generate","model":"claude-opus-5-5"},"references":["699","docs/plans/202610/699-engine-run-completeness-design.md"],"reason":"scope-declared","type":"feature","category":"observability","severity":"LOW","summary":"The completeness verdict has no success axis: a required command that ran and failed still counts as present","description":"The design declares this a deliberate non-goal for the cycle (design § Risks, 'Attempted ≠ succeeded'; § Suggested Workstreams WS-2 Scope). The engine-call row records the attempt at dispatch entry, so 'journaled' means attempted, not succeeded, and an evidence hole is a missing call, never a failed one. No Success Criterion, Acceptance Scenario line or Derived Test Matrix row needs a success axis, and the friction ledger already surfaces the failures separately.","remediation":"Once the corpus exists, decide whether an engine-call row should also carry the exit code so a required call that ran and failed can be reported distinctly (a third hole class), or whether that stays the friction ledger's job.","source":"plan-1 Task 8 (WS-2 Out of Scope); design § Risks 'Attempted ≠ succeeded'","status":"OPEN"}
 {"schema":3,"ts":1793001912314,"kind":"deferral","key":"699-friction-key-truncation-class-fix","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"plan","step":"plan-update","subagent":"bkit-plan-update","model":"deepseek-v4.1-flash"},"references":["699","docs/plans/202610/logs/699-engine-run-completeness/plan-review-2.md"],"reason":"own-cycle","type":"issue","category":"tooling","severity":"MEDIUM","summary":"The identity-gated prune truncates a friction key at ~68 chars, so two long same-prefix keys collide and the fold loser is destroyed","description":"The knowledge row `identity-gated-prune-destroys-fold-losers-truncated-friction-keys-collide` records that the harvest's identity-gated prune truncates a friction key before comparing it, so two distinct rows whose keys share that ~68-char prefix collide and the fold loser is dropped. This plan's own keys are `<noun>-<verb>/<step>` and stay far under the truncation point, so the plan avoids the envelope rather than fixing it. Plan-sized: the durable fix is a schema-level change to key minting and the prune gate (the identity tuple in `.bkit/core/engine/ledgers/telemetry.ts` and the prune gate in `scripts/harvest/ledgers.ts`) plus a migration story for the keys already truncated on disk — new architecture, not a bounded mechanical edit.","remediation":"Stop truncating the compared key (hash the full key, or truncate a digest of it), then re-derive and re-run the prune gate over the existing store rows.","source":"plan-review-2 § Out of Scope 1; knowledge `identity-gated-prune-destroys-fold-losers-truncated-friction-keys-collide`","status":"OPEN"}
+{"schema":3,"ts":1793089178642,"kind":"deferral","key":"705-build-plan-convert-challenge-low-docs-migrations-md-37","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["705-build-plan-convert"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"The plan-task-markers advisory doc points the next build at the old convert step","description":"LOW build challenge finding at docs/migrations.md:37: The plan-task-markers advisory doc points the next build at the old convert step. Done when: `docs/migrations.md`'s `plan-task-markers-missing` row reads the FID's next `/bkit-build` **Step 4** converts the plan (`@bkit-build-plan-convert`), matching the Plan Convert row at 4.","source":"docs/migrations.md:37"}
+{"schema":3,"ts":1793089178643,"kind":"deferral","key":"705-build-plan-convert-challenge-low-bkit-core-engine-commands-workflow-status-ts-468","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["705-build-plan-convert"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"`bkit status resume` output help still describes the challenge as Step 10","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/status.ts:468: `bkit status resume` output help still describes the challenge as Step 10. Done when: the `challengeRound` description reads \"the round Step 11's challenge runs as\" and the `challengeDone` description reads \"so Step 11 goes on to Step 12\" — matching `WORKFLOW_STEPS.build` (challenge 11, Run Tests 12). Rebuild `dist/` in the same commit (engine TS edited).","source":".bkit/core/engine/commands/workflow/status.ts:468"}
+{"schema":3,"ts":1793089178644,"kind":"deferral","key":"705-build-plan-convert-challenge-low-bkit-core-engine-install-manifest-ts-252","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["705-build-plan-convert"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"Engine source comments still cite the pre-renumbering build steps","description":"LOW build challenge finding at .bkit/core/engine/install/manifest.ts:252: Engine source comments still cite the pre-renumbering build steps. Done when: `manifest.ts:252` reads \"build Step 12, the remediates\" (Run Tests moved 11→12), `manifest.ts:286` reads \"What `/bkit-build` Step 12 will run\" (the gate ladder runs at Run Tests), `checks/after/index.ts:365` reads \"build Step 15\" (Summary moved 14→15), `checks/before/repo.ts:186` reads \"`/bkit-build` Step 4 converts it\" (convert moved 3→4), and `challenge.ts:53` reads \"The reviewers Step 11 runs\" (challenge moved 10→11). Rebuild `dist/` in the same commit (engine TS edited).","source":".bkit/core/engine/install/manifest.ts:252"}
+{"schema":3,"ts":1793089178645,"kind":"deferral","key":"705-build-plan-convert-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-279","repo":"cbartens/bkit","bkit":{"version":"6.0.0"},"by":{"workflow":"build","step":"build-challenge"},"references":["705-build-plan-convert"],"type":"issue","category":"correctness","severity":"LOW","reason":"low-severity","summary":"A Decision Pause composed before the renumber resumes with its recorded `Pause step` and posts `Step {old N} — Decision Pause`: a run paused across the upgrade comments the paused step's old number (e.g. a verify pause written as 7 posts under Plan Execute's new 7), the exact comment-number drift #705 set out to kill, in a one-release window","description":"LOW build challenge finding at .bkit/core/engine/commands/workflow/workflows.ts:279: A Decision Pause composed before the renumber resumes with its recorded `Pause step` and posts `Step {old N} — Decision Pause`: a run paused across the upgrade comments the paused step's old number (e.g. a verify pause written as 7 posts under Plan Execute's new 7), the exact comment-number drift #705 set out to kill, in a one-release window. Done when: the owner decides whether `decisions compose` records the paused step's NAME beside its number so the read-back can translate to the current number, with number-only files from before the change accepted as a transient. No agent can settle it: pause files already written hold only the old number, so no mechanical translation exists for them; routing is unaffected (`from` / `route` are name-keyed, so the run still resumes at the right step); the decision is whether a one-upgrade comment cosmetic justifies a decision-file schema change.","source":".bkit/core/engine/commands/workflow/workflows.ts:279"}
diff --git a/docs/deployments.md b/docs/deployments.md
index 3fa290448..11f90e926 100644
--- a/docs/deployments.md
+++ b/docs/deployments.md
@@ -530,9 +530,9 @@ GitHub Actions suppresses `pull_request` + `push` when HEAD has `[skip ci]` or `
 
 **Poll anchors the check NAMESPACE, not a lane name**: the capstone `bkit.testing.ciCapstone` minus its last `-segment` (`bkit-tests-check` → any check containing `bkit-tests`). Single-job anchor PROHIBITED. Alignment: `.bkit/core/engine/audits/workflows/ci-dispatch-gate-alignment.test.ts`; legacy scaffolds: `ci-legacy-scaffold-job-names` advisory.
 
-**Gate sites (2):** build Step 15; debug Step 10 sub-step 6 (PR-mode and LOCAL-mode). Ship OUT — Step 14 reads the squash commit's capstone with `bkit runs gate --head=<SQUASH_SHA> --capstone-only`; CI-Dispatch there masks "essential tests skipped".
+**Gate sites (2):** build Step 16; debug Step 10 sub-step 6 (PR-mode and LOCAL-mode). Ship OUT — Step 14 reads the squash commit's capstone with `bkit runs gate --head=<SQUASH_SHA> --capstone-only`; CI-Dispatch there masks "essential tests skipped".
 
-**Open-PR pre-flight (build Step 15):** `bkit prs probe --base=dev` first; open PR → Failure Path (`feat/{FID} already has open PR #N to dev`). `bkit prs open` probes `--head` again before creating: exit 3 on an existing open PR (`--existing=fail`, the default), exit 5 on a `gh` error, never a blind create.
+**Open-PR pre-flight (build Step 16):** `bkit prs probe --base=dev` first; open PR → Failure Path (`feat/{FID} already has open PR #N to dev`). `bkit prs open` probes `--head` again before creating: exit 3 on an existing open PR (`--existing=fail`, the default), exit 5 on a `gh` error, never a blind create.
 
 **Abort-push guard (design / plan / build / debug Failure Path + `.bkit/workflows.md` § Failure Path step 4):** feature branch → the `[skip ci]` abort commit goes out via `bkit branches push --mode=abort`. Open PR → exit 7, no push. `gh` cannot answer → exit 80, no push; look up the PR via MCP, re-run with `--open-pr=<n>|none`. No PR → push. `dev` / `main` → nothing pushed from the checkout; only logs + ledgers land on `dev` via the throwaway `origin/dev` checkout.
 
