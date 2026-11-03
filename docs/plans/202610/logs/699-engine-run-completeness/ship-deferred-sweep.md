Verdict: PASS
Failures: 0
Lazy: 0

<!-- verdict:end -->

# Deferred Sweep

## Planned vs Delivered

Plan: `docs/plans/202610/699-engine-run-completeness-plan.md` (last committed 2026-11-01T15:05:54+10:00 at `5690a2176`; 25 of 25 tasks ticked, `:615-1064`). Checked at HEAD `ecd5b0d1f`, which adds the TASK 25 fix `2f41b8fb7` and a merge of `origin/dev` (`b9cbfdd79`) since the previous sweep at `472e66b5f`. Each item comes from the plan's `## Acceptance Scenario` Success Criteria 1-5 (`:72-78`) or a task's `DONE WHEN` line.

Checks run for this sweep, all at HEAD `ecd5b0d1f`:

- `pnpm exec vitest run` over 13 files: `checks/status-holes.test.ts`, `ledgers/journal.test.ts`, `ledgers/journal.integration.test.ts`, `commands/lib.test.ts`, `commands/workflow/{completeness,workflows,run-facts,status}.test.ts`, `commands/conventions.test.ts`, `audits/workflows/workflow-shape.test.ts`, `scripts/harvest/ledgers.integration.test.ts`, `tools/cli-doc.test.ts`, `commands/workflow/worktrees.integration.test.ts` → 13 files passed, 742 tests passed.
- `pnpm test:harvest` → pass 58, fail 0.
- `pnpm exec bats tests/status-holes-sweep-liveness.bats` → 2/2 ok.
- `node dist/cli.js check` exit 0; `pnpm bkit:check:dist` exit 0; `pnpm bkit:typecheck:tests` exit 0; `bash scripts/graphify/bkit-graphify.sh check-at HEAD` exit 0.
- `pnpm bkit:audit:status` exit 0, printing `[bkit-status-holes] sweep: 13 file(s), 4 holey`.
- `BKIT_ENGINE_JOURNAL=off node dist/cli.js completeness check --file=docs/plans/202610/logs/699-engine-run-completeness/status.jsonl` exit 0: `build: CLEAN (148 step(s), 110 call(s) observed)`, `evidenceHoles: []`, `stepHoles: []`; design, plan and the three ship runs each report CLEAN with `preJournal: true`.
- The full `pnpm vitest run` suite was not run in this sweep.

Items:

- **SC1, one verb for any phase (TASKs 6, 10, 20, 23, 24): Delivered.** `completenessCommand` is registered at `.bkit/core/engine/commands/registry.ts:13,60`. The live command above prints one verdict per run (build, design, plan, and three separate ship runs). `deriveContract` (`checks/status-holes.ts:335`) renders the markdown for the tracker through `substituteWorkflow` (`:33,341`). The output description reads "one completeness verdict per checked run" at `commands/workflow/completeness.ts:64` and `dist/commands/workflow/completeness.js:52`. The universe-equality case in `status-holes.test.ts` passes, so there is no hand table.
- **SC2, completeness row at close + start warning (TASKs 11, 12, 19): Delivered.** `writeCompletenessRow` is at `workflows.ts:1086`, and `previousRunWarning` is at `:1117`, called at `:2099`. The `workflows.test.ts` cases pass. The dead-journal line is documented in `docs/observability.md:63-67`.
- **SC3, a `tool-failure` friction row on an undeclared non-zero exit (TASKs 3, 4, 5): Delivered.** `journal.ts` exports `shouldRecordFriction` (`:86`), `frictionKey` (`:98`), `frictionRow` (`:118`) and `appendFrictionRow` (`:167`). `resolveActiveRun` is at `lib.ts:401`. The `journal.test.ts`, `journal.integration.test.ts` and harvest end-to-end cases in `scripts/harvest/ledgers.integration.test.ts` pass.
- **SC4, never changes an exit code or blocks (TASKs 4, 11, 12): Delivered.** The `lib.test.ts` forced-throw passthrough cases pass, and `pnpm bkit:audit:status` exits 0 on a corpus with 4 holey runs.
- **SC5, runtime derivation + promotion criteria against `384-tier3-promotion`: Delivered.** `docs/decisions.jsonl` holds one `384-tier3-promotion` row and 16 `699-*` rows.
- **TASKs 1-2, `MARK_ROWS` + reader audit + row docs: Delivered.** `engine-call` is listed at `run-facts.ts:362` and `scripts/harvest/bkit-harvest.mjs:1483`, and the parity case passes under `pnpm test:harvest`.
- **TASK 7, column-0 conditionality rule + build Step 4 skip row: Delivered.** The skip row is at `.bkit/core/workflows/bkit-build.md:443`, and the authoring rule is at `.bkit/core/.bkit/authoring.md:668`. The `workflow-shape.test.ts` and `status-holes.test.ts` cases pass.
- **TASKs 8-9, hole classes, verdict metadata, self-exclusion, read path: Delivered.** All `status-holes.test.ts` cases pass.
- **TASK 13, CI advisory step + liveness bats: Delivered.** `.github/workflows/bkit-ci.yml:521` runs `Check Status Holes`, and the bats file passes 2/2.
- **TASK 14, observability + testing docs: Delivered.** See `docs/observability.md:63-67`; `docs/testing.md` carries 3 `status-holes` references.
- **TASKs 15-16, generated artifacts: Delivered.** `bkit:check:dist`, `graphify check-at HEAD`, `bkit check` and `cli-doc.test.ts` all pass.
- **TASK 17, the `use` field on test fixtures: Delivered.** `pnpm bkit:typecheck:tests` exits 0.
- **TASK 18, calls outside the journal window never required: Delivered.** The `outsideWindow` handling is at `status-holes.ts:357-364`, and the case at `status-holes.test.ts:1210` passes.
- **TASK 19, dead-journal stderr line + 3 knowledge entries: Delivered.** See `docs/knowledge.jsonl:126-128` (keys `journal-write-root-is-runs-own-book-root`, `journal-step-fallback-noun-verb-mandatory`, `mark-rows-copies-must-stay-in-parity`).
- **TASK 21, `--file` that is not a status file falls back: Delivered.** The `lib.test.ts` and `journal.integration.test.ts` cases pass.
- **TASK 22, a journal that starts mid-run: Delivered.** See the `firstCall` boundary at `status-holes.ts:559`; its test passes.
- **TASK 25, a visit whose row-writing call was not journaled is judged steps-only: Delivered.** This item was Blocked in the previous sweep. Commit `2f41b8fb7` adds the case "a visit whose row writer sits below workflows close is judged steps-only when the journal saw none of its calls" to `status-holes.test.ts`, and it passes. The live command on this run's own `status.jsonl` now reports `build: CLEAN` with `evidenceHoles: []`, which is the `DONE WHEN` bar (plan `:1066`).

## Blocking Deferrals

None. `node dist/cli.js branches scan-diff --disabled-tests --base=origin/dev` exits 0 with `found: false` and `disabled: []`.

## Exempt Deferrals

Plan-declared items (plan `§ Out of Scope`, `:264-272`, committed 2026-10-29, before the build):

- **Promotion from advisory to a blocking gate.** Leaves the check fail-open: it never blocks a merge. Declared in plan `§ Out of Scope` and the design's constraints; tracked by the pre-existing OPEN row `384-promote-status-hole-detector-from-advisory-to-gate` (`reason` `scope-declared`). `Exempt`.
- **`bkit-auto` router coverage.** Leaves the router markdown with no contract. Row `699-completeness-check-excludes-bkit-auto-router` (`scope-declared`, OPEN). Triage: `Exempt` (in-scope-surface fails, own-declaration holds).
- **Success axis on the verdict.** A required command that ran and failed still counts as present. Row `699-completeness-verdict-no-success-axis` (`scope-declared`, OPEN). Triage: `Exempt` (in-scope-surface fails).
- **Friction-key truncation class fix.** Leaves the ~68-char prune truncation able to collide long same-prefix keys. Row `699-friction-key-truncation-class-fix` (`own-cycle`, OPEN). Triage: `Exempt` (bounded-remediation and in-scope-surface fail).
- **Suggested Scope Expansion rows** (plan `:274-289`): `telemetry-validate-does-not-enforce-ts-mint-or-duplicate-line-invariants`, `58-status-jsonl-run-boundary-keys-on-last-run-overall`, `58-debug-run-tests-parentsha-advances-only-transitively`, `384-ship-without-a-writable-branch-checkout-outside-b2`, `per-workflow-rollback-path-for-shipped-bkit-workflow-changes`, `#701`, `#100`, `#556`, `#101`. Each is marked "keep deferred" or "no action" by the plan, and each is owned by its own pre-existing row or issue. `Exempt`.

Rows for this FID that `bkit ledgers triage --fid=699-engine-run-completeness --plan=docs/plans/202610/699-engine-run-completeness-plan.md` reported (9 rows, 0 written unjustified):

- `442-status-hole-detector-beyond-ship`: CLOSED (superseded by this plan). `Exempt`, not tested.
- `699-engine-run-completeness-challenge-low-bkit-core-engine-checks-status-holes-ts-1032`, `...-commands-workflow-completeness-ts-91`, `...-ledgers-journal-ts-174`: `low-severity` LOW build-challenge findings, now CLOSED. `Exempt`, not tested.
- `699-engine-run-completeness-friction-recurrence-parallel-race`: `low-severity`, OPEN. Leaves two parallel writers of the same friction recurrence able to under-count by one. Declared in the 2026-11-01T05:36:21Z issue comment. `Exempt`, not tested.
- `699-task-25-visit-without-journaled-row-writer-judged-steps-only`: `hard-blocked`, now CLOSED by commit `2f41b8fb7`, which this sweep confirmed (see TASK 25 above). `Exempt`, not tested.

Advisory process items, which never block (step 6 rule):

- Plan Gates 2, 3 and 4 and `### 👤 Manual Verification` (`:1075-1120`) still carry 24 unticked boxes. These are build-process checklists, not deliverables.
- The build summary lists TDD red-first refusals for TASKs 2, 5, 7, 9 and 13, plus the TASK 1 harvest gaps. The owner accepted them in `build-decision-1-1.md` and `build-decision-1-2.md`.
- An open owner question from the 2026-11-01T05:36:21Z issue comment: `engineJournal().failure` writes friction rows from git hooks. This is documented as intended at `docs/observability.md:63`, so it is a design choice left to the owner, not an unmet deliverable.

## Lazy Deferrals

None. No intended deliverable is left `Planned`, and the triage verb put every row in `Exempt` (0 rows written as `unjustified`).

## Handover Notes

None
