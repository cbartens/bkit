Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 1, 2, 3, 4, 5
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-1-1.md` (attempt 1): CONCERNS, 2 gaps (TASK 3 race/deadline proof, TASK 5 corrupt state); Tasks 1, 2, 4.
- `build-plan-gaps-remediate-1-1-log.md`: both gaps DONE in commit ecaa5d0f8.

## Notes

- Judged against `build-diff-1-2.md` (group 1 diff, cumulative) plus the remediation commit ecaa5d0f8. No brief `Deviations` section and no `build-decision-*.md` records were supplied. `build-plan-current.md`: PASS, 0 affected tasks.
- Test-first audit (`build-tests-green-1-2.md`): `Enforced: true`, 0 gaps, all 16 planned tests red then green; no `Unproven`, `Updated tests` or `Already landed` sections.
- Test run (`.bkit/core/engine/audits/hooks/` + `.bkit/core/engine/install/modules/index.integration.test.ts`, 12 files): 890 pass, 3 fail, all T6 `guardrails.cjs installed mirror is its rendered template` (cursor, claude, codex). These are the known stale-mirror failures that wait for the orchestrator's end-of-session `bkit upgrade` (`.agents/rules.md` § Install to mirror); not logged.
- TASK 3 (attempt-1 gap closed): the new `rejects a source swapped between lstat and open` test makes `lstatSync` report another file's inode, so it fails without the ino/dev re-check in `readBoundedSource` (`.bkit/core/hooks/guardrails-shell.js:786-800`); `stops at the cooperative deadline and keeps earlier targets` asserts `limit: "deadline"` through a `Date.now` seam. They sit beside the named cases rather than inside them, because a code step may not edit a planned test after red (`.bkit/friction.jsonl` row `steps-finish/build-plan-gaps-remediate`). The deadline test does not actually prove a retained earlier target (the clock expires before the first command); other limits already prove target retention. Satisfied, but see the lint gate gap.
- TASK 5 (attempt-1 gap closed): `readState` (`.bkit/core/hooks/gateguard-engine.js:183-197`) now reads unparseable state as empty; `markWarned` then overwrites the corrupt file with valid state, so a deny is durable and a retry is not blocked again. The new parity test `unparseable session state still advises, and deny does not loop` covers advisory and deny on claude, cursor, opencode and codex. The catch is a plan-required fallback (in-process / state fallback), not error-swallowing; `docs/observability.md` has no GateGuard logging contract.
- TASKS 1, 2, 4: unchanged since attempt 1, which judged them satisfied; their tests still pass.
- Gate checks run (not a build): `pnpm bkit:slop:delta` and the repo `oxlint` config each fail on one item from this group (both logged, Fixable: true). Prettier and `tsc -p tsconfig.test.json` are clean on the changed files. The two gate gaps are logged as group gate gaps rather than task gaps, because every task's `DONE WHEN` (named tests pass) is met; the fix round must close them before `bkit:gate:static` can pass.
- Out of scope: the `.bkit/friction.jsonl` rows in the diff are workflow ledger rows, not work of this plan.

## Identified Gaps Log

2 gaps.

GATE (TASK 1 code): `pnpm bkit:slop:delta` (part of `bkit:gate:min` and `bkit:gate:static`) fails against base da97be38 (= origin/dev): net-new `structure.pass-through-wrappers` at `.bkit/core/hooks/guardrails-shell.js:171` — `isDynamicWord(cmd, text)` only returns `cmd.dyn.has(text)` and is called at 10 sites; fix in place (inline `cmd.dyn.has(...)` at the call sites or give the helper real logic) so the gate passes without a suppression — Fixable: true
GATE (TASK 3 code): `pnpm lint` (part of `bkit:gate:static`) fails on the two in-process seam tests the remediation added to `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` (`rejects a source swapped between lstat and open`, `stops at the cooperative deadline and keeps earlier targets`): `vitest(no-conditional-in-test)` at lines 558:11 and 577:36 (the ternaries inside the `lstatSync` and `Date.now` mock implementations); restructure the mocks without a conditional in the test body (e.g. a module-level helper or `mockReturnValueOnce` chains) so lint passes with no disable comment — Fixable: true
