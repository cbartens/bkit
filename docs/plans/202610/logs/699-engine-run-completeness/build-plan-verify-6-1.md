Verdict: FAIL
Failures: 3
Fixable: true
Tasks: none

<!-- verdict:end -->

# Plan Verification

## Scope

`Group 6`

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode `Group`; judged against `build-diff-6-1.md` (`workflows.ts`, `workflows.test.ts`, `dist/commands/workflow/workflows.js`). `build-plan-current.md`: PASS, 0 affected. Decision records `build-decision-1-1..5.md` cover groups 1-5 only; none accepts a group 6 gap. No prior group 6 verify or remediate logs.
- `pnpm exec vitest run .bkit/core/engine/commands/workflow/workflows.test.ts`: 140/140 pass; all 5 `TEST FIRST` tests present and green. Full suite not run (orchestrator: loaded machine, targeted files only).
- TASK 11 DONE WHEN met: `completenessRow` runs before the `workflow-done` append, after the `--record-step` close row; two closes → two rows (`slice(-4)` asserted); forced checker throw → exit 0, `workflow-done` last, one `[bkit-telemetry] completeness row not written:` line. Left off `Tasks` for the matrix gap only (append outside the try).
- `journalSuspect`: passed only by `completenessRow` (close path); `previousRunWarning` calls `readCompleteness` with no options; `completeness.ts` never passes it (`grep` over `.bkit/core/engine` non-test sources).
- Start warning: `ctx.log` → `io.stderr` (`.bkit/core/engine/commands/lib.ts:536`); test helper `JSON.parse`s the whole stdout, so stdout stays one object; warning names workflow, run number, close time and `bkit completeness check --workflow= --file=`.
- Failure paths: `previousRunWarning` wraps the whole body in try/catch → `null`, silent (task text "degrade silently" and DONE WHEN "no warning and no error" govern over Edge Cases row "each logs one stderr line", which contradicts them). Close path: checker / contract-read failure → one stderr line, no row; the completeness append itself is not covered (gap 3).
- Test-first audit: `Enforced: true`, 2 `null` gaps, both decided `Fixable: false` (rules: `code it runs` with changed inputs → false; `test body` changed beyond formatting → gap). Substance: neither weakens an assertion; both fixture edits were needed to make the tests able to pass under the group 4 checker (a run counts as closed only with its `{workflow}-close-workflow` `step-done` row; a stored row followed by a `step-done` row is recomputed). The "positive control" in the second test is present in red snapshot `build-task-red-6-12-2.snapshot:189`, so it is not a post-red addition. Only the owner can accept these.
- Side observation, out of group 6 scope: since the checker's `closed` keys on the close step row, a run closed with `workflows close` without `--record-step` and no close `step-done` row reports no step holes; tied to the group 4 checker, not proposed as a gap here.
- Minor: `closeWorkflow` declares a local `const runRowsOf` that shadows the new module-level `runRowsOf`; harmless, gates reported passing.

## Identified Gaps Log

3 gaps:

- TASK 12: `.bkit/core/engine/commands/workflow/workflows.test.ts` `warns when the previous run for this fid was holey` — test-changed — the shared `holeyBuild` fixture this test runs gained a `build-close-workflow` `step-done` row after the red (the checker counts a run as closed only when that step row is present, so the red-time fixture could never be holey); assertions unchanged, but the test's input changed after its red — Fixable: false
- TASK 12: `.bkit/core/engine/commands/workflow/workflows.test.ts` `prints nothing when the previous run is clean, absent, or unreadable` — test-changed — the clean case's own fixture lines were rewritten after the red (`holeyBuild[0]!` / `holeyBuild[1]!` became `...holeyBuild.slice(0, 2)` / `holeyBuild[2]!`, and the stored `completeness` row's `at` moved from `00:30` to `01:00` so no `step-done` row follows it and the read path does not recompute); not formatting, no assertion weakened or removed, the positive control was already present at red — Fixable: false
- TASK 11: Derived Test Matrix row `A checker or append throw at close still writes workflow-done and returns the normal exit code` — only the checker throw is fail-open and tested; in `closeWorkflow` (`.bkit/core/engine/commands/workflow/workflows.ts`) the `fs.appendFileSync(where.status, appendLine(completeness))` sits outside the `completenessRow` try/catch, so an append throw escapes the close before `workflow-done`, contrary to the task's "inside the `appendStats` fail-open idiom"; fix: move the append inside the try (one `[bkit-telemetry]` line on failure) and add a forced-append-throw case — Fixable: true
