Verdict: PASS
Failures: 0
Fixable: false
Tasks: 25, 26, 27, 28, 29
Loosened: none
Fingerprint: 7a8ce8aa8a9ca982028d77deb96d8aadbebe8a2ff48a85a7ff09bce86e69e71e
<!-- verdict:end -->

# Plan Verification

## Scope

Group 8

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-8-1.md`: `CONCERNS`, 2 gaps (Task 27 stale Result file still renders; Task 25 torn line completed by a later writer's newline counted as foreign). `build-plan-gaps-remediate-8-1-log.md` reports both fixed.

## Notes

- Mode `Group`, judged against `build-diff-8-2.md`. The brief has no `Deviations` section. `build-plan-current.md` names Tasks 1, 4, 6 and 9 only, none in this group. Decision records `build-decision-1-1` to `1-5` cover group 1 and accept no gap here.
- Test-first audit (`build-tests-green-8-2.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`, no `Updated tests` or `Already landed` section.
- Single-file runs, all passing: `ledgers/journal.integration.test.ts` (22, including Task 17's and Task 25's tests), `commands/workflow/steps.test.ts` (125), `commands/workflow/ledgers.test.ts` (107), `commands/workflow/counters.test.ts` (64). `tsx .bkit/core/engine/tools/instructions.ts` (check mode, no `--write`) exits 0 with no drift. The full suite was not run, per the caller.
- TASK 25 (satisfied): the landed check at `.bkit/core/engine/commands/workflow/ledgers.ts:1753`-`:1779` strips one leading separator newline from both our block and the bytes at the recorded offset, then compares the first line by content without its newline. A complete line that is equal to or a proper prefix of our first line stays `UncertainEffect`; only a complete line that is neither prepares afresh. Traced cases: whole block landed (receipted); our first line whole with a torn tail (uncertain); torn prefix with no later writer (incomplete line, uncertain); torn prefix completed by a later writer's `\n` separator from `appendHeld` (`ledgers/status.ts:950`) (complete proper prefix, uncertain, so the attempt-1 gap is closed); a ledger without a trailing newline at prepare time, where both our block and a foreign block start with `\n` (separator stripped, foreign line differs, prepares afresh, so the attempt-1 observation is closed too). No test pins the torn-then-completed case; the judgment rests on reading the code. Residual edge, not a gap: a writer that appends without the separator (every engine ledger writer goes through `appendHeld`/`appendLocked`, which adds it) would glue its row onto our torn prefix, and that line is then neither equal nor a prefix, so it prepares afresh, leaving one malformed line but no duplicate row.
- TASK 26 (satisfied, unchanged since attempt 1): the group diff touches `runs.ts` only for this task; its test passes.
- TASK 27 (satisfied): every `Result:` line in `.bkit/core/workflows/*.md` (13 sites: `bkit-build.md:700`, `:862`, `:971`, `:976`, `:1086`; `bkit-debug.md:556`; `bkit-design.md:415`, `:420`, `:452`; `bkit-plan.md:370`, `:375`, `:380`; `bkit-ship.md:756`) now says "Before the launch, delete any older file at the Result path, so a subagent that dies leaves no result to render." Those 13 match the 13 `steps stub --result-file` calls one to one; `bkit-auto.md` has none. The shared entry `result-path-cleared` in `.bkit/instructions.md:4920` carries it, every Result-writing prompt says the caller deletes the older file, and all host mirrors (`.claude`, `.cursor`, `.opencode`, `.agents` skills and plugins) carry it. With the file deleted, a dead subagent leaves no file, `readResult` (`steps.ts:1707`) exits 6 and the step takes its Failure Path, which meets the DONE WHEN's "the workflow clears ... each Result path before launching its subagent". Residual risk, not a gap: the deletion is a prose instruction on the `Result:` line inside the Context the orchestrator forwards, not a bash command, so it relies on the orchestrator acting on it; this run's caller passed the Result line as "write this fresh; any file already there is from an earlier round", which reads as a note to the subagent rather than evidence of a delete. A fenced `rm -f "{OUTBOX}/...-result.json"` before each launch would make it deterministic; that is a proposal outside this task's DONE WHEN.
- TASK 28 (satisfied, unchanged since attempt 1): the remediation edit in `ledgers.ts` does not touch the correction path; `counters.test.ts` passes.
- TASK 29 (satisfied, unchanged since attempt 1): `ledgers.test.ts` passes. The attempt-1 note on the `complete` to `clean` status rename (no `CHANGELOG.md` line) stands as an owner call.
- Error paths: no new error path in the remediation; `UncertainEffect` and the stub's exit 6 are existing structured exits.

## Identified Gaps Log

None
