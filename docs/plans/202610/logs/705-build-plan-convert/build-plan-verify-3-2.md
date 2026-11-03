Verdict: PASS
Failures: 0
Fixable: false

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 3` (tasks 3, 4, 5).

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

Attempt 1 (`build-plan-verify-3-1.md`) recorded `Verdict: FAIL`, `Failures: 1`, `Fixable: false` on one `red-mismatch` gap: TASK 3's `TEST FIRST` named `.bkit/core/engine/tools/instructions.test.ts` "sync has nothing left to rewrite", which passes against the stale store and can never go red, so the recorded red for `.bkit/core/engine/tools/instructions-sources.test.ts` "each Special Behaviors row and authoring section has one equal entry" could not be matched to it. The owner settled it at the Decision Pause with `build-decision-1-3.md` (`Status: DECIDED`, `Decision: Fix now — ok fix teh plan line`): TASK 3's `TEST FIRST` line was retargeted to the sources test rather than waived, and no `TEST EXCEPTION` was written. The retarget is in commit `09bd27504` (one plan line), and `build-plan-check.md` re-ran with `Problems: 0`.

## Notes

- TASK 3 is ticked this round. Its `DONE WHEN` holds in the tree, checked directly rather than from the execute log's `DONE — TASK 3` line:
  - `.bkit/core/.bkit/workflows.md`'s build table (lines 873-888) reads `1 — Start Workflow` through `16 — Close Workflow & Create PR`; `3 — Branch Sync` (line 875) holds only `branches sync --merge-docs`, the new `4 — Plan Convert` (line 876) holds the `tests plan-check`, the `@bkit-build-plan-convert` dispatch and the re-check, and rows 5-16 are renumbered (5 — Plan Current, 6 — Skills, 7 — Execute Plan, 8 — Verify Plan, 9 — Remediate Gaps, 10 — Holistic Verification, 11 — Build Challenge, 12 — Run Tests, 13 — Diagnose Failure, 14 — Remediate Failure, 15 — Summary, 16 — Close Workflow).
  - Prose references moved with them: § Anchor Block's consumer reads "`/bkit-build` Step 5"; the Group loop paragraph reads "Steps 7-9"; § Cross-step invariants reads "build Steps 10, 11" and "group verify (Step 8)"; the "No plan" note reads Step 4 convert / Step 5 `anchor-read`; the Plan Current agent row routes to Step 6; commit-convention and CI-dispatch rows read build Step 16. `grep -n "Plan Convert" .bkit/core/.bkit/workflows.md` shows the new row at line 876. No old-number pair survives in the catalogue: `Step 4 — Plan Current`, `Step 3 — Plan Convert`, `group verify (Step 7)`, `Steps 9, 10`, `Plan Current (Step 4)`, `Build Challenge (Step 10)`, `Summary (Step 14)` and `Close Workflow (Step 15)` all return nothing; the only `Step 17` / `Step 18` hits in `.bkit/instructions.md` belong to audit templates, not build.
  - `pnpm instructions:sync` exits 0, and a second run exits 0 with `.bkit/instructions.md` byte-identical (`sha256 f08616fb…`, `git status --short .bkit/instructions.md` empty) — the sync is idempotent and the mirrored § Cross-step invariants carries the new numbers.
  - `npx vitest run .bkit/core/engine/tools/instructions.test.ts .bkit/core/engine/tools/instructions-sources.test.ts .bkit/core/engine/tools/instructions-coverage.test.ts` → 3 files, 139 tests pass, including the `DONE WHEN`-named `instructions.test.ts`.
- The retargeted `TEST FIRST` line matches the recorded red exactly. Plan line 236 names `.bkit/core/engine/tools/instructions-sources.test.ts` "each Special Behaviors row and authoring section has one equal entry"; `build-task-red-3-3-1.md` records that file and test name failing at 13:31:02Z before the catalogue edit with `cross-step-invariants: text differs — run pnpm instructions:sync` (1 failed / 20 passed, exit 1), which is the drift the line describes. `git log` shows `instructions-sources.test.ts` last changed in `feat(663)`, untouched on this branch, so red and green ran the same test body; the audit row reads `Changed since red: no`.
- The group-3 test-first audit was re-run here, not taken on trust: `node dist/cli.js tests green --file=docs/plans/202610/logs/705-build-plan-convert/status.jsonl --workflow=build --group=3 --plan=docs/plans/202610/705-build-plan-convert-plan.md --log=<temp>` → `enforced: true`, `gaps: []`, `testOrderOnly: false`, `lateRedUnchecked: []`, matching `build-tests-green-3-2.md` (`Enforced: true`, `Gaps: 0`, one row for TASK 3, `Green: passed`). No gap of any kind, so nothing enters the gaps log.
- TASK 4 still holds on this round's tree: `node dist/cli.js check` exits 0 with no managed file needing a re-render; the five host mirrors each carry exactly one `Step 4 — Plan Convert` heading and `.bkit/workflows.md` carries the `4 — Plan Convert` table row (line 876); no `.bkit/core/engine/**/*.ts` is newer than `dist/cli.js` and `git status --short dist/` is empty, so attempt 1's `bkit:check:dist` exit 0 still describes the tree. Ticked previously, unchanged.
- TASK 5 still holds: `docs/testing.md:630` (`workflow-shape.test.ts` row) names Plan Convert and the shifted build numbers; `docs/knowledge.jsonl`'s newest `plan-line-anchors-…` row (`ts` 1793072007945, schema 3, `ACTIVE`) references `.bkit/core/workflows/bkit-build.md (Step 5 — Plan Current)` with no `Step 4 — Plan Current` left in it, older append-only rows untouched. Ticked previously, unchanged.
- Groups 1 and 2 are intact, checked in the tree: `.bkit/core/workflows/bkit-build.md` headings run 1-16 with `Step 3 — Branch Sync` (line 356) holding only `branches sync --merge-docs` and its own `--number=3 --post --title="Branch Sync"` finish — no `tests plan-check` — and `Step 4 — Plan Convert` at line 374; `Step 5 — Plan Current` (line 403) carries exactly two `steps finish --step=build-plan-current` calls, both `--number=5 --post --title="Plan Current"`, the skip one (line 415) naming no `--agent` and carrying `Status=skipped (no plan anchor)`, the agent route (line 424) naming `--agent=bkit-build-plan-current`. Their suites pass: `npx vitest run workflow-shape.test.ts step-table.test.ts trackers.test.ts steps.test.ts` → 4 files, 453 tests pass.
- The full suite passes on this tree: `npx vitest run` → 198 files, 7857 tests pass, 1 skipped, no failures. No engine source changed in this group, so nothing outside the documented surfaces was disturbed.
- The decision record is the owner's own (`Status: DECIDED`, not assumed), so no assumed-accept caveat applies. TASK 3's `TEST EXCEPTION` field is absent, which is correct: the plan line was corrected instead, and `tests green` honours it without an exception.
- No `Derived Test Matrix` in the plan, so no rows to check. All four `Documentation Updates` rows (`.bkit/core/.bkit/workflows.md`, `.bkit/instructions.md`, `docs/testing.md`, `docs/knowledge.jsonl`) are done and verified above. No `BLOCKED` line or `docs/deferrals.jsonl` row is used as evidence anywhere.
- Only TASK 3's checkbox changed (`[ ]` → `[x]`); TASK 4 and TASK 5 were already ticked and nothing else was ticked. Nothing was committed by this step. The tree also carries this round's orchestrator-written `build-diff-3-2.md` (untracked) and the prettier-formatted `build-tests-green-3-2.md`, both left for the orchestrator.

## Identified Gaps Log

None.
