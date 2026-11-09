Verdict: PASS
Failures: 0
Lazy: 0

<!-- verdict:end -->

# Deferred Sweep

## Planned vs Delivered

Plan: `docs/plans/202611/842-ship-fails-local-plan.md` (Verdict PASS, last committed 2026-11-05T13:34:36Z per `ship-input-4.md:153`). The bar is § Acceptance Scenario (Success Criteria, Process Sketch, Concrete Example, Edge Cases and Derived Test Matrix) and the `DONE WHEN` lines of Tasks 1-10 (`ship-input-4.md:536`, `:556`, `:572`, `:591`, `:616`, `:631`, `:648`, `:668`, `:683`, `:693`).

Branch state: HEAD `f8adf9f22`, `origin/dev` `fc501c9ea`; `git merge-base --is-ancestor origin/dev HEAD` exits 0. Since the previous sweep's HEAD `235da766b`, the only engine, workflow or `dist` changes are in `8c24ba7a6` ("delete landed remote branch at its proved tip"): `worktrees.ts`, `worktrees.test.ts`, `close-squash.integration.test.ts`, `bkit-ship.md`, the `bkit-ship.none.txt` render snapshot and `dist/commands/workflow/worktrees.js`. The merge `f8adf9f22` changed none of those paths.

Evidence gathered in this sweep:

- `npx vitest run` on the 13 test files changed against `origin/dev` plus `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts`: 14 files passed, 1343 tests passed, 2 skipped, exit 0. The diff scan found no added skip marker, so this branch did not introduce the 2 skips.
- `node dist/cli.js check` → exit 0. `npx tsx .bkit/core/engine/tools/cli-doc.ts --check` → exit 0. A scratch `npx tsc -p tsconfig.json --outDir` build exits 0, and its `worktrees.js`, `branches.js`, `prs.js`, `runs.js` and `workflows.js` are byte-identical to the committed `dist/commands/workflow/` files.
- The 40 TEST FIRST titles were located by the previous sweep. Of their files, only `worktrees.test.ts` changed since then, and none of its TEST FIRST titles changed (`git show 8c24ba7a6` touches only the remote-deletion test at `worktrees.test.ts:852` and adds `:871`).

Items:

- Task 1 (feature reconciliation, CI-running publication): `Delivered`. Tests at `branches.test.ts:2797`, `:2809`, `:2827`, `:2852`, `:2877`, `:2902` and `worktrees.integration.test.ts:168`, all passing. `bkit-ship.md` Step 3 calls `branches sync --reconcile-feature` (asserted by `ship-invariants.test.ts:213`).
- Task 2 (ship-setup fetch, inherited unpublished dev refusal): `Delivered`. Tests at `worktrees.test.ts:442`, `:466`, `:489` and `branches.test.ts:2968`, `:2990`, passing.
- Task 3 (merged-on-entry qualification): `Delivered`. Tests at `prs.test.ts:430`, `:465`, `:476`, passing.
- Task 4 (guarded cleanup, one shared landed comparison): `Delivered`. Tests at `workflows.test.ts:1981`, `:1999`, `:2023`, `:2062`, `worktrees.integration.test.ts:317` and `branches.test.ts:3580`, `:3592`, `:3943`, passing. The shared helper is `worktrees.ts:711` (`export function notOnDev`). Remote deletion is now bound to the inspected tip: `deleteBranch` at `worktrees.ts:832` pushes `--force-with-lease=refs/heads/{branch}:{remoteExpected}` only after the expected-tip local delete succeeds, and retains and reports the remote when origin refuses. This meets the DONE WHEN clause "unsafe remote deletion is skipped with a reason" (test `worktrees.test.ts:871`, "retains the remote branch when origin refuses its conditional deletion") and plan line "Bind any remote deletion to its exact inspected tip" (`ship-input-4.md:445`). `bkit-ship.md:944` and `.claude/commands/bkit-ship.md:897` describe the same behaviour.
- Task 5 (fresh-dev ancestry at the merge gate): `Delivered`. Tests at `runs.test.ts:993`, `:1023`, `:1043`, `:1068`, passing.
- Task 6 (moved-head and base-conflict merge refusals): `Delivered`. Tests at `prs.test.ts:824`, `:838`, `:848`, `:869`, passing.
- Task 7 (workflow and resolver wiring): `Delivered`. Tests at `ship-invariants.test.ts:174`, `:190`, `:213`, `:249`, `:267`, `:307`, passing.
- Task 8 (docs, compiled output, provider renders): `Delivered`. All five Documentation Updates rows are changed in the diff. `8c24ba7a6` also updated `.bkit/core/.bkit/workflows.md`, `.bkit/core/.bkit/cli.md`, `docs/observability.md` and every provider render of `bkit-ship.md` for the restored remote deletion. The drift check, CLI doc check and `dist` comparison above pass. The scratch-consumer dogfood logs cited by the previous sweep (`tmp/build-group3-dogfood-final.log`, `tmp/bkit-842-coverage-consumer.log`) predate `8c24ba7a6`; that commit's runtime change is covered by the passing `worktrees.test.ts:852` / `:871` and `close-squash.integration.test.ts:230` against real bare origins.
- Task 9 (late remote code and gate exit 17 return to reconciliation): `Delivered`. Tests at `runs.test.ts:3069` and `ship-invariants.test.ts:213`, passing.
- Task 10 (MCP Actions provenance): `Delivered`. Tests at `runs.test.ts:1162`, `:1181`, passing.
- Success Criteria 1-7, the Process Sketch, the Concrete Example and the Edge Cases: `Delivered`. Each maps onto Tasks 1-7 and 9-10 above and is covered by the same passing tests.
- Derived Test Matrix: `Delivered`. Every row maps to a named test above, or to Task 8's generation checks.

## Blocking Deferrals

None

## Test Coverage Review

Command: `node dist/cli.js branches scan-diff --disabled-tests --base=origin/dev`. It returned a complete table with `found: true` and exit 1; exit 1 means hits were found, not that the scan failed. Its 10 rows collapse to 4 distinct tests. No added skip marker is among them. Result: 1 Preserved, 3 Retired, 0 Blocked. The two hits the previous sweep blocked (`close-squash.integration.test.ts:241`, `worktrees.test.ts:868`) no longer appear: `8c24ba7a6` restored the remote-deletion assertions, and `close-squash.integration.test.ts` no longer differs from `origin/dev`. Every current owner cited below is enabled, matched by the `vitest.config.ts:26-30` include globs, and passed in this sweep's run.

- `.bkit/core/engine/audits/workflows/workflow-shape.test.ts:1643` (old title "ship's merge MCP fallback asserts base.ref = dev before merging"). Removed: `expect(line).toBeDefined()` and `expect(line!.indexOf("assert")).toBeLessThan(line!.indexOf("merge_pull_request"))`. **Preserved.** The current test at `:1643`, "ship's merge MCP fallback proves the scoped dev base through the engine before merging", covers the same rule on the same input (`bkit-ship.md`): it asserts "The engine must establish `base.ref` = `dev`" comes before "run that engine gate again before mutation", which comes before "Only exit 0 authorizes `merge_pull_request`", with `--facts-file="{OUTBOX}/ship-gate-facts.json"` between them (`bkit-ship.md:683` and `:753`).
- `.bkit/core/engine/audits/workflows/ship-invariants.test.ts:764-765` (old title "F5: gate code 11 (poll) routes to Step 9 alongside codes 10, 14 and 17"). Removed: `expect(lines[idx]).toMatch(/\b17\b/)` and the "17 → Step 9" part of the block assertion. **Retired.** Owner source: the issue body, which states "Build follows the proposal unless the owner overrides it" (`ship-input-4.md:103`); its D proposal routes a stale gate back to Step 3 within the `ship.merge` counter (`ship-input-4.md:109-110`), and success criterion 7, extended by the owner comment dated 2026-11-03T06:01:09Z (`ship-input-4.md:144-149`), allows "re-validation or integration, never Step 11 / Step 12" (`ship-input-4.md:85`). Plan Task 9 `DONE WHEN` (`ship-input-4.md:683`) moves exit 17 to Step 3 reconciliation. Current coverage: `ship-invariants.test.ts:213` asserts the exit-17 block sets `RECONCILE_REQUIRED` true, routes through `counters route --name=MERGE_ATTEMPT` with `--continue=step-3` and `--exceeded=failure-path`, and has no `--continue=step-9` and no Step 11. Codes 10, 11 and 14 are still asserted at `:758`.
- `.bkit/core/engine/commands/workflow/worktrees.test.ts:742` (old title "removes a marked worktree with uncommitted changes and clears the marker"). Removed: `removed: true`, `reason: null`, the worktree and marker being gone. **Retired.** Owner source: the issue Outcome "never deletes a branch holding work that is not on `dev`" (`ship-input-4.md:75`) and the F proposal "no route can delete unlanded work" (`ship-input-4.md:116`, gap F added by the owner comment dated 2026-11-03T06:01:09Z). Uncommitted worktree changes are unlanded work, so the data-loss guard became stricter. Current coverage: `worktrees.test.ts:725` asserts `removed: false`, `reason: "uncommitted"`, the dirty file kept and the marker present; `:797` covers staged-only content, mode, type and deletion.
- `.bkit/core/engine/commands/workflow/worktrees.integration.test.ts:1172` (old title "removes a worktree setup created, uncommitted changes and all, and clears the marker"). Removed: the same removal assertions as the previous item. **Retired** on the same owner source. Current coverage: `worktrees.integration.test.ts:1167` asserts `removed: false`, `reason: "uncommitted"`, the dirty file kept, the marker present and the worktree still listed.

## Exempt Deferrals

`node dist/cli.js ledgers triage --fid=842-ship-fails-local --plan=docs/plans/202611/842-ship-fails-local-plan.md` → 4 rows, all `Exempt`, 0 written unjustified, exit 0.

- `842-docs-only-dev-movement-ci-optimization` (`docs/deferrals.jsonl:216`, `scope-declared`, declared by `bkit-plan-generate` at ts 1793686505814; plan § Out of Scope; issue Open Questions mark it out of scope, `ship-input-4.md:119-120`). Leaves uncovered: skipping full CI when `dev` moved only by docs and ledgers. Triage: `in-scope-surface` and `own-declaration` fail, so it is Exempt.
- `842-cloud-concurrency-queue-non-goal` (`docs/deferrals.jsonl:217`, `scope-declared`; plan § Out of Scope; issue non-goal at `ship-input-4.md:93`). Leaves uncovered: the bkit-cloud GitHub Actions concurrency group. Triage: `in-scope-surface` and `own-declaration` fail, so it is Exempt.
- `842-sync-with-origin-dev` (`docs/deferrals.jsonl:222` and `:246`, duplicate rows, `needs-decision`, from the build-worktree-setup handover). Asked the owner how to bring the branch up to date with `origin/dev`. Triage: `in-scope-surface` and `no-external-blocker` fail, so it is Exempt. It is resolved in fact: `origin/dev` is an ancestor of HEAD. The row is still `OPEN` and can be closed.
- `842-remote-branch-retention-owner-approval` (`docs/deferrals.jsonl:253`, `needs-decision`, from the previous ship's handover; superseded by `:254`, status `CLOSED`, ts 1794263634156). Triage: "not tested" because the latest row is closed. The owner chose deletion; decision `842-ship-preserves-unlanded-work` update 3 (`docs/decisions.jsonl`, ts 1794263633809) records "Owner decision: landed remote feature branches are deleted", and `8c24ba7a6` implements it. Nothing is left uncovered.
- Issue non-goal: automatic resolution of code conflicts stays with `@bkit-ship-conflict-resolve` or a handover (`ship-input-4.md:94`; plan § Out of Scope, closing sentence at `ship-input-4.md:338`).
- Plan § Suggested Scope Expansion (`ship-input-4.md:340-353`): the listed candidates are explicitly kept separate.
- Advisory process items (preconditions and process checkboxes, not deliverables): the unticked `👤 ✅ Human Confirmation` boxes, Gates 1-4, the Verification Plan checkboxes (including Friction re-verification and Repository deletion boundary), and § Manual Verification Steps 1-4, which the plan labels "advisory only" (`ship-input-4.md:740`).

## Lazy Deferrals

None

## Handover Notes

None
