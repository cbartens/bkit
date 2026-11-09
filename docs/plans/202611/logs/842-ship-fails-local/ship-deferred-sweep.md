Verdict: PASS
Failures: 0
Lazy: 0

<!-- verdict:end -->

# Deferred Sweep

## Planned vs Delivered

Plan: `docs/plans/202611/842-ship-fails-local-plan.md` (Verdict PASS, last committed 2026-11-05T13:34:36Z per `ship-input-2.md:153`). Bar: § Acceptance Scenario (Success Criteria, Process Sketch, Edge Cases, Derived Test Matrix) and the `DONE WHEN` lines of Tasks 1-10.

Test evidence run in this sweep: `npx vitest run` on `branches.test.ts`, `worktrees.test.ts`, `prs.test.ts`, `workflows.test.ts`, `runs.test.ts`, `worktrees.integration.test.ts` (all under `.bkit/core/engine/commands/workflow/`) and `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` → 7 files, 940 tests passed, exit 0. `close-squash.integration.test.ts` and `workflow-shape.test.ts` → 2 files, 272 tests passed, exit 0. All 40 named TEST FIRST titles exist (located by `grep -nF`, lines below).

- Task 1 (feature reconciliation, CI-running publication): `Delivered` — `branches.test.ts:2797`, `:2809`, `:2827`, `:2852`, `:2877`, `:2902`; `worktrees.integration.test.ts:168`; `bkit-ship.md:267` and `:415` call `branches sync --reconcile-feature`.
- Task 2 (ship-setup fetch, inherited unpublished dev refusal): `Delivered` — `worktrees.test.ts:442`, `:466`, `:489`; `branches.test.ts:2968`, `:2990`.
- Task 3 (merged-on-entry qualification): `Delivered` — `prs.test.ts:430`, `:465`, `:476`.
- Task 4 (guarded cleanup, shared landed comparison): `Delivered` — `workflows.test.ts:1981`, `:1999`, `:2023`, `:2062`; `worktrees.integration.test.ts:317`; `branches.test.ts:3580`, `:3592`, `:3943`. The shared helper lives at `worktrees.ts:711` (`export function notOnDev`); `branches.ts` has no definition left and calls the helper at `branches.ts:3260`.
- Task 5 (fresh-dev ancestry at the merge gate): `Delivered` — `runs.test.ts:993`, `:1023`, `:1043`, `:1068`.
- Task 6 (moved-head and base-conflict merge refusals): `Delivered` — `prs.test.ts:824`, `:838`, `:848`, `:869`.
- Task 7 (workflow and resolver wiring): `Delivered` — `ship-invariants.test.ts:174`, `:190`, `:249`, `:267`, `:307`; `grep -n 'delete-branch' .bkit/core/workflows/bkit-ship.md` gives no merge-call hit; the resolver takes `{MERGE_TARGET}` (`bkit-ship-conflict-resolve.md:61`, `:71`).
- Task 8 (docs, compiled output, provider renders): `Delivered` — all five Documentation Updates rows are changed in the diff (`.bkit/core/.bkit/workflows.md`, `prompts.md`, `cli.md`, `docs/testing.md`, `docs/observability.md`); `workflows.md:1114` documents retained remote refs and the separate GitHub auto-delete setting. `node dist/cli.js check` → `0 write(s) would occur`, exit 0 (provider mirrors in sync). `tsx .bkit/core/engine/tools/cli-doc.ts --check` → exit 0. A scratch `tsc --outDir` build differs from committed `dist/` in 0 files. Scratch-consumer dogfood: `tmp/build-group3-dogfood-final.log` records `hosts:5, freshInstallUpgradeCheck:true, matchingPaginatedGate:true, foreignRunRejected:true, foreignJobRejected:true`; `tmp/bkit-842-coverage-consumer.log` is present. The `build-summary.md:110` risk "BLOCKED — bkit:generate" is superseded by this evidence.
- Task 9 (late remote code and gate exit 17 return to reconciliation): `Delivered` — `runs.test.ts:3069`; `ship-invariants.test.ts:213`.
- Task 10 (MCP Actions provenance): `Delivered` — `runs.test.ts:1162`, `:1181`.
- Success Criteria 1-7, the Process Sketch and the Edge Cases map onto Tasks 1-7 and 9-10 above and are covered by the same passing tests: catch-up on both paths, CI-running publication, divergent merge, stale-base re-entry, inherited-dev refusal, newer work after a merged PR, guarded close, and moved-head / conflict routing away from Steps 11-12. `Delivered`.
- Derived Test Matrix: every row maps to a named test above, or to Task 8's generation checks. `Delivered`.

## Blocking Deferrals

None

## Test Coverage Review

Command: `node dist/cli.js branches scan-diff --disabled-tests --base=origin/dev` (via `pnpm bkit`). It returned the complete table with `found: true` and exit 1. Exit 1 means hits were found, not that the scan failed. 12 rows collapse to 6 distinct tests. No added skip marker is among them. Result: 1 Preserved, 5 Retired, 0 Blocked. Every current owner below is enabled and is picked up by the `vitest.config.ts:26-28` include globs. The unit files run in the unit gate and the `*.integration.test.ts` files run in `test:integration`. All of them passed in this sweep.

- `.bkit/core/engine/audits/workflows/workflow-shape.test.ts:1643` (old title "ship's merge MCP fallback asserts base.ref = dev before merging"). Removed: `expect(line).toBeDefined()` and the check that `assert` comes before `merge_pull_request`. **Preserved.** The current test at `:1643`, "ship's merge MCP fallback proves the scoped dev base through the engine before merging", checks the same thing: the base must be proven to be `dev` before the merge mutation. It asserts that "The engine must establish `base.ref` = `dev`" comes before "run that engine gate again before mutation", which comes before "Only exit 0 authorizes `merge_pull_request`", and that the facts file is passed in between. The engine refuses facts whose base is not `dev` (`runs.ts:1982-1983`). The workflow text is at `bkit-ship.md:683`.
- `.bkit/core/engine/audits/workflows/ship-invariants.test.ts:764-765` (old title "F5: gate code 11 (poll) routes to Step 9 alongside codes 10, 14 and 17"). Removed: `expect(lines[idx]).toMatch(/\b17\b/)` and the "17 → Step 9" part of the block assertion. **Retired.** The rule that gate exit 17 goes back to Step 9 was replaced by plan Task 9's `DONE WHEN` (plan line 529): exit 17 must return through Step 3 reconciliation. That task came from the build challenge round 1 finding. The owner's issue success criterion ("routes back to re-validation or integration, never to Step 11 / Step 12", `ship-input-2.md:85`) allows Step 3. The new rule is covered by `ship-invariants.test.ts:213`, which asserts the exit-17 block sets `RECONCILE_REQUIRED` true and routes through `counters route --name=MERGE_ATTEMPT` with `--continue=step-3`, `--exceeded=failure-path`, no `--continue=step-9` and no Step 11. Codes 10, 11 and 14 are still asserted at `:758`.
- `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts:241` (old title "lands this run's doc and then removes the branch, leaving unrelated edits alone"). Removed: `expect(ls-remote origin refs/heads/feat/{FID}).toBe("")`. **Retired.** The rule that close deletes the remote branch was retired by plan § Breaking Changes & Naming Review ("A remote branch is retained and reported when an equivalent conditional deletion cannot be enforced under the merge-only/no-force-push policy, even when its inspected work is landed") and by decision `842-ship-preserves-unlanded-work` (update 2, ts 1793687546918 = 2026-11-03T06:32Z). The new rule is covered by `:230`, which asserts the doc landed, the local branch is gone, the remote ref equals the branch tip, the worktree is gone and an unrelated edit is untouched.
- `.bkit/core/engine/commands/workflow/worktrees.test.ts:868` (old title "deletes the local and remote branch once the marked worktree is gone"). Removed: `remoteDeleted: true` and `remoteHas(origin)` false. **Retired** by the same plan section and decision. The new rule is covered by `worktrees.test.ts:852`, "deletes the proved local branch and retains the remote branch conditionally". It asserts `branchDeleted: true`, `remoteDeleted: false`, that the remote still exists and that the stderr reason is "conditional deletion is unavailable".
- `.bkit/core/engine/commands/workflow/worktrees.test.ts:742` (old title "removes a marked worktree with uncommitted changes and clears the marker"). Removed: `removed: true`, the worktree and marker being gone, and the worktree list being empty. **Retired.** The rule that removal deletes a dirty worktree was retired by plan Task 4 `DONE WHEN` ("close preserves ... dirty work"; "standalone removal retains ownership/dirty-work protections") and decision `842-ship-preserves-unlanded-work`. The change makes the data-loss guard stricter, not weaker. The new rule is covered by `:725`, which asserts `removed: false`, `reason: "uncommitted"`, the dirty file kept and the marker present, and by `:797` (staged-only content, mode, type and deletion are preserved).
- `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts:1172` (old title "removes a worktree setup created, uncommitted changes and all, and clears the marker"). Removed: the same removal assertions as the previous item. **Retired** on the same basis. The new rule is covered by `:1167`, which asserts `removed: false`, `reason: "uncommitted"`, the dirty file kept, the marker present and the worktree still listed.

Approval note for the 5 Retired hits: they rest on the committed plan, which the owner ran through `/bkit-build` and `/bkit-ship #842`, and on its decision rows. The plan's own `👤 ✅ Human Confirmation` boxes and Gate 1 boxes are unticked. No separate owner sign-off on the retired requirements was found.

## Exempt Deferrals

- `842-docs-only-dev-movement-ci-optimization` (`docs/deferrals.jsonl:216`, `scope-declared`, declared by plan-generate around 2026-11-03; plan § Out of Scope; issue Open Questions marks it out of scope). It leaves uncovered skipping full CI when `dev` moved only by docs and ledgers. Triage: Exempt.
- `842-cloud-concurrency-queue-non-goal` (`docs/deferrals.jsonl:217`, `scope-declared`; plan § Out of Scope; issue § Constraints and non-goals names #397). It leaves uncovered the bkit-cloud GitHub Actions concurrency group. Triage: Exempt.
- `842-sync-with-origin-dev` (`docs/deferrals.jsonl:222` and `:246`, duplicate rows, `needs-decision`, build-worktree-setup handover). It asked the owner to choose how to bring the branch up to date with `origin/dev`. Triage: Exempt. In the current state, `git merge-base --is-ancestor origin/dev HEAD` succeeds, because ship's Step 4 merge produced `a0b4be564`. The row is still `OPEN` and can be closed.
- Issue non-goal: automatic resolution of code conflicts stays with `@bkit-ship-conflict-resolve` or a handover (`ship-input-2.md:94`; plan § Out of Scope, closing sentence).
- Plan § Suggested Scope Expansion: these candidates are explicitly kept separate. `639-refused-ship-failed-record-lost-in-cloud-container`, #800, #801, `ship-cloud-failure-path-after-merge-has-no-publish-channel`, `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run`, `384-required-status-checks-on-dev-via-bkit-protect-main`, `384-merge-queue-unavailable-private-non-enterprise`, `397-ship-lane-reconciler-for-depth-1-queue-eviction`, `397-dual-agent-same-run-double-ship-when-both-secrets-set`, `capability-register-drift-shipped-by-pr-708-reds-dev-capstone`, `per-workflow-rollback-path-for-shipped-bkit-workflow-changes`.
- Advisory process items (preconditions and process checkboxes, not deliverables): the unticked `👤 ✅ Human Confirmation` boxes, Gates 1-4, the Verification Plan checkboxes (including Friction re-verification and Repository deletion boundary), and the § Manual Verification Steps 1-4, which the plan itself labels "advisory only".

## Lazy Deferrals

None

## Handover Notes

None
