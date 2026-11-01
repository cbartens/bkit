Verdict: FAIL
Failures: 1
Lazy: 0

<!-- verdict:end -->

# Deferred Sweep

## Planned vs Delivered

Plan: `docs/plans/202610/699-engine-run-completeness-plan.md` (committed 2026-10-29, 25 of 25 tasks ticked). Checked at HEAD `472e66b5f`. Each item comes from the plan's `## Acceptance Scenario` (Success Criteria 1-5) or a task's `DONE WHEN` line, and each is marked with its status.

Test run for this sweep: `pnpm exec vitest run` over the 11 Derived Test Matrix files (`checks/status-holes.test.ts`, `ledgers/journal.test.ts`, `ledgers/journal.integration.test.ts`, `commands/lib.test.ts`, `commands/workflow/{completeness,workflows,run-facts,status}.test.ts`, `commands/conventions.test.ts`, `audits/workflows/workflow-shape.test.ts`, `scripts/harvest/ledgers.integration.test.ts`) → 11 files, 686 tests passed. `pnpm test:harvest` → 58 pass, 0 fail. `pnpm exec bats tests/status-holes-sweep-liveness.bats` → 2/2 ok. `node dist/cli.js check` exit 0. `pnpm bkit:check:dist` exit 0. `pnpm bkit:typecheck:tests` exit 0. `bash scripts/graphify/bkit-graphify.sh check-at HEAD` exit 0. `cli-doc.test.ts` 7/7 passed. The full `pnpm vitest run` suite was not re-run in this sweep.

- **SC1, one verb for any phase (TASKs 6, 10, 20, 23, 24): Delivered.** `completenessCommand` is registered (`.bkit/core/engine/commands/registry.ts:13,60`). `node dist/cli.js completeness check --file=docs/plans/202610/logs/699-engine-run-completeness/status.jsonl` exits 0 and prints one verdict per run (build, design, plan, ship). `deriveContract` (`checks/status-holes.ts:335`) renders the workflow markdown for the tracker (`substituteWorkflow`, `:341`). There is no hand table: the universe-equality test in `status-holes.test.ts` passes.
- **SC2, completeness row at close + start warning (TASKs 11, 12, 19): Delivered as code and tests.** `writeCompletenessRow` runs before `workflow-done`, and the dead-journal line is at `workflows.ts:1104`, documented at `docs/observability.md:60`. `previousRunWarning` is at `workflows.ts:1117` and is called at `:2099`. The `workflows.test.ts` cases pass. One limit: the warning's accuracy on a partly journaled run depends on the TASK 25 rule, which is Blocked (see Blocking Deferrals).
- **SC3, a `tool-failure` friction row on an undeclared non-zero exit (TASKs 3, 4, 5): Delivered.** `journal.ts` exports `shouldRecordFriction`, `frictionKey`, `frictionRow` and `appendFrictionRow` (`:86-167`). `resolveActiveRun` is at `lib.ts:401`. The `journal.test.ts` and `journal.integration.test.ts` cases pass, and so does the harvest end-to-end case in `scripts/harvest/ledgers.integration.test.ts`. The fix from the 2026-11-01 review, which reopens a CLOSED row when it recurs, is pinned at `journal.test.ts:136`.
- **SC4, never changes an exit code or blocks (TASKs 4, 11, 12): Delivered.** The `lib.test.ts` forced-throw passthrough cases pass. `pnpm bkit:audit:status` exits 0 and prints `[bkit-status-holes] sweep: 12 file(s), 4 holey`.
- **SC5, runtime derivation + promotion criteria against `384-tier3-promotion`: Delivered.** The `docs/decisions.jsonl` row `384-tier3-promotion` (ACTIVE, ts `1793001440745`) records "one release of fail-open signal without muting". 16 `699-*` decision rows are present.
- **TASKs 1-2, `MARK_ROWS` + reader audit + row docs: Delivered.** `run-facts.ts:357` and `bkit-harvest.mjs:1478` both carry the new types, and the parity case passes under `pnpm test:harvest`. Both row types are in `.bkit/core/.bkit/jsonl.md`.
- **TASK 7, column-0 conditionality rule + build Step 4 skip row: Delivered.** The skip row is at `.bkit/core/workflows/bkit-build.md:443`. The authoring rule is at `.bkit/core/.bkit/authoring.md:668`. The `workflow-shape.test.ts` and `status-holes.test.ts` cases pass.
- **TASKs 8-9, hole classes, verdict metadata, self-exclusion, read path: Delivered.** All named `status-holes.test.ts` cases pass.
- **TASK 13, CI advisory step + liveness bats: Delivered.** `.github/workflows/bkit-ci.yml:521-524` runs the `Check Status Holes` step, and `tests/status-holes-sweep-liveness.bats` passes 2/2.
- **TASK 14, observability + testing docs: Delivered.** See `docs/observability.md:60-72` and `docs/testing.md:652,661,854`.
- **TASKs 15-16, generated artifacts: Delivered.** `bkit:check:dist`, `graphify check-at HEAD` and `bkit check` all exit 0.
- **TASK 17, the `use` field on test fixtures: Delivered.** `pnpm bkit:typecheck:tests` exits 0.
- **TASK 18, calls outside the journal window never required: Delivered.** The `outsideWindow` handling is at `status-holes.ts:357-411`, and its test passes.
- **TASK 19, dead-journal stderr line + 3 knowledge entries: Delivered.** See `workflows.ts:1104` and `docs/knowledge.jsonl:126-129` (keys `journal-write-root-is-runs-own-book-root`, `journal-step-fallback-noun-verb-mandatory`, `mark-rows-copies-must-stay-in-parity`).
- **TASK 21, `--file` that is not a status file falls back: Delivered.** The `lib.test.ts` and `journal.integration.test.ts` cases pass.
- **TASK 22, a journal that starts mid-run: Delivered.** See `beforeJournal` at `status-holes.ts:651`, and its test passes.
- **TASK 25, a visit whose row-writing call was not journaled is judged steps-only: Blocked.** The live command on this run's own file still reports evidence holes for visits that have no journaled `steps finish`. Details are under Blocking Deferrals.

## Blocking Deferrals

- **TASK 25 `DONE WHEN` is not met at HEAD.** The blocking test that applies is "the deliverable produces a wrong observable result".
  - **The plan's bar** (plan TASK 25 `DONE WHEN`): "a visit whose own row-writing call (`steps finish` / `steps done` / the call that wrote its `step-done` row) has no journaled `engine-call` in its owned gaps is judged steps-only ... and this run's own `status.jsonl` reports no evidence hole for a visit with no journaled `steps finish`."
  - **What was observed:** `BKIT_ENGINE_JOURNAL=off node dist/cli.js completeness check --file=docs/plans/202610/logs/699-engine-run-completeness/status.jsonl` exits 0 and reports `build: HOLEY (148 step(s), 110 call(s) observed)` with two evidence holes:
    - `evidence hole: build-create-pr lacks prs probe`
    - `evidence hole: build-close-workflow lacks prs probe`
  - **Why both holes are false.** This file journals no `steps finish`, `steps done`, `prs probe`, `workflows close` or `prs open` call at all. Its 112 `engine-call` rows are 63 `disk prune`, 23 `ci slop`, 23 `ci prose`, 2 `completeness check` and 1 `ledgers append`. The last build `engine-call` row is `status.jsonl:417`. The two visits are the `step-done` rows at `status.jsonl:434` and `:435-436`, and no call was journaled in their gaps.
  - **Earlier verify result.** `build-plan-verify-12-2.md` recorded this same command as build `CLEAN`, `evidenceHoles: []` (136 steps). That was before the Step 16 rows (`build-create-pr`, `build-close-workflow`) were written. Since they landed, the clause fails.
  - **Root cause.** The writer skip at `.bkit/core/engine/checks/status-holes.ts:656-659` fires only when the unit's non-branch calls include `steps finish` or `steps done`. For build Step 16, `deriveContract` gives the unit `[build-create-pr, build-close-workflow]` these calls:
    - `prs probe` (required)
    - `branches scan-diff`, `issues fetch`, `roadmap mirror` and `workflows close`, all `branch`
    - `steps done` (`bkit-build.md:1035`) does not appear, because it sits below `workflows close` and so falls in `outsideWindow` (`:357-364`).

    The skip therefore never applies, and the "the call that wrote its `step-done` row" case named in `DONE WHEN` (here `workflows close` / `steps done`) is not implemented. The scratch probe `/private/tmp/claude-501/-Users-christian-Documents-GitHub-bkit/91131698-d6a2-4b6f-9113-720b495a9c74/scratchpad/u16.mjs` printed that unit's call list.
  - **Effect on users.** The build run has no stored `completeness` row: its `workflow-done` at `status.jsonl:433` was written by a non-journaling engine. So `previousRunWarning` (`workflows.ts:1117-1127`) computes this verdict on the fly, and a start on this FID warns about a hole that is not real. That is exactly the case TASK 25 was meant to remove. Any consumer whose build Step 16 runs under a non-journaling `{BKIT}` gets the same false warning.
- **Disabled-test scan:** `node dist/cli.js branches scan-diff --disabled-tests --base=origin/dev` → `found: false`, `disabled: []`, exit 0. No test was disabled.

## Exempt Deferrals

Declared in the plan's `## Out of Scope` (plan committed 2026-10-29, carried in `ship-input-1.md:498-506`):

- `384-promote-status-hole-detector-from-advisory-to-gate`. **Leaves uncovered:** promoting the check from advisory to a blocking gate. **Reason:** the pre-existing OPEN deferral is the matching row. The design constraint is "Advisory / fail-open until proven", and Success Criterion 4 forbids blocking. The triage did not match it to this FID because its key is `384-*`.
- `699-completeness-check-excludes-bkit-auto-router`. **Leaves uncovered:** the `bkit-auto` router markdown has no contract. **Reason:** `scope-declared`. Triage: `Exempt` (in-scope-surface fails).
- `699-completeness-verdict-no-success-axis`. **Leaves uncovered:** a required command that ran and failed still counts as present. **Reason:** `scope-declared`, a design non-goal. Triage: `Exempt` (in-scope-surface fails).
- `699-friction-key-truncation-class-fix`. **Leaves uncovered:** a friction key is truncated at about 68 chars, so two long keys with the same prefix collide. **Reason:** `own-cycle`. Triage: `Exempt` (bounded-remediation and in-scope-surface fail).

Other plan-related rows bucketed by `bkit ledgers triage --fid=699-engine-run-completeness --plan=docs/plans/202610/699-engine-run-completeness-plan.md` (8 rows, 0 written unjustified, all `Exempt`):

- `442-status-hole-detector-beyond-ship`. CLOSED, because this plan supersedes it. Not tested (settled row).
- `699-engine-run-completeness-challenge-low-bkit-core-engine-checks-status-holes-ts-1032`, `...-commands-workflow-completeness-ts-91` and `...-ledgers-journal-ts-174`. `low-severity` LOW build-challenge findings, each now CLOSED as fixed (ts `1793483830878`-`880`). Not tested (settled rows).
- `699-engine-run-completeness-friction-recurrence-parallel-race`. **Leaves uncovered:** two parallel processes that record the same friction recurrence under-count `recurrenceCount` by one per collision. **Reason:** `low-severity`. It was declared in the 2026-11-01 review response (`ship-input-1.md:225-226`) for the LOW review finding at `journal.ts:175-181`. Not tested (LOW row).

Kept deferred in the plan's `## Suggested Scope Expansion` (`ship-input-1.md:508-521`). These are pre-existing rows or issues, not this cycle's work:

- `telemetry-validate-does-not-enforce-ts-mint-or-duplicate-line-invariants`
- `58-status-jsonl-run-boundary-keys-on-last-run-overall`
- `58-debug-run-tests-parentsha-advances-only-transitively`
- `384-ship-without-a-writable-branch-checkout-outside-b2`
- `per-workflow-rollback-path-for-shipped-bkit-workflow-changes`
- `#701`, `#100`, `#556` and `#101`

The plan's future-phase recommendation (`ship-input-1.md:496`) is to promote the check to a gate and to revisit the self-describing-row fallback.

Advisory items, not deliverables:

- The plan's Gate 2, Gate 3 and Gate 4 checkboxes and the `Verification Plan` § Automated Tests boxes (`ship-input-1.md:1309-1343`) are unticked. They are build-process conditions, so they are advisory only.
- `👤 Manual Verification` Steps 1-5 (`ship-input-1.md:1345-1354`) are labelled "advisory only" by the plan itself.

Owner question, neither deferred nor blocking: `engineJournal().failure` writes friction rows from git-hook-launched commands. The 2026-11-01 review response (`ship-input-1.md:228-229`) leaves this to the owner. The behaviour is documented as intended at `docs/observability.md:63`.

## Lazy Deferrals

None

## Handover Notes

- **TASK 25 (Blocked).** Extend the writer-skip rule in `.bkit/core/engine/checks/status-holes.ts:654-659` so that it also covers a unit whose step row is written by a call outside the unit's in-window calls. Build Step 16 is the case: its rows come from `steps done` below `workflows close`, or from `workflows close` itself, which `DONE WHEN` names as "the call that wrote its `step-done` row". Two ways to do it:
  - Treat a visit with no journaled call in its owned gaps as steps-only, whatever the writer is.
  - Consider the writer calls that `outsideWindow` holds for that unit.

  Add a `status-holes.test.ts` case for the shape `[ambient call, ..., step build-create-pr, step build-close-workflow]` with no journaled call in their gaps, and expect no evidence hole. Then rebuild `dist/`. The fix is done when `BKIT_ENGINE_JOURNAL=off node dist/cli.js completeness check --file=docs/plans/202610/logs/699-engine-run-completeness/status.jsonl` reports build `CLEAN`, with `evidenceHoles: []`. The other option is for the owner to move this case to declared out of scope in the plan before the next ship.
