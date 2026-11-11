Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 26, 28, 29
Loosened: none
Fingerprint: 55b6646c39c57a4ff793765411fead2de447b9723491c7e08abc8e6351f7ef6a
<!-- verdict:end -->

# Plan Verification

## Scope

Group 8

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode `Group`, judged against `build-diff-8-1.md`. The brief has no `Deviations` section. `build-plan-current.md` names Tasks 1, 4, 6 and 9 only, none in this group. Decision records `build-decision-1-1` to `1-5` cover group 1 and accept no gap here.
- Test-first audit (`build-tests-green-8-1.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`, no `Updated tests` or `Already landed` section. All five planned tests went red, then green.
- Single-file runs, all passing: `counters.test.ts` (64), `ledgers.test.ts` (107), `steps.test.ts` (125), `runs.test.ts` (191), `ledgers/status.test.ts` (15), `ledgers/journal.integration.test.ts` (22, including Task 17's tests), `audits/workflows/ci-dispatch-gate-alignment.test.ts` (36), `render/trackers.test.ts` (105, the `bkit-plan.none.txt` snapshot) and `install/modules/core.integration.test.ts -t 'deterministic bookkeeping contracts'` (1). The full suite was not run, per the caller.
- TASK 25 (not satisfied): a foreign complete line at the offset now prepares afresh and appends once, and a whole landed line or an unterminated torn tail still throws `UncertainEffect`. The gap is the torn-then-completed line (see the log). Observation outside the DONE WHEN letter: when the ledger did not end in a newline at prepare time, our block starts with `\n`, a foreign writer's block also starts with `\n`, so `haveFirst` equals `wantFirst` (`"\n"`) and the original stuck-intent bug remains for that ledger state.
- TASK 26 (satisfied): `landEmptyOwnCommits` calls `onCopy` with the copy SHA, which persists `retrigger.copy` before `git push` (`runs.ts:815`, `:1133`-`:1137`). A resumed `commit-created` re-trigger on a shared branch fetches, and if `origin/<branch>` contains the copy it records `push-completed` with the copy SHA and pushes nothing (`runs.ts:1122`-`:1132`). `pending.length === 0` now returns the remote tip, not `rec.pushed.at(-1)`. `validRetrigger` checks `copy` as a SHA.
- TASK 27 (not satisfied): the engine half exists (`steps stub --invocation`, flagged `unresolved` so the dispatcher does not resolve it, exit 6 on a mismatched `invocation`). Neither binding the DONE WHEN allows is wired: no workflow passes `--invocation`, none clears a Result path, no prompt has a subagent write `invocation`, and a result without the field is accepted. A dead subagent's step still renders the previous file. The code step's own log says "workflow clearing of Result paths not wired". The fix can take either route the DONE WHEN names. Clearing each Result path in the workflow before launch is the smaller one. The invocation route would also need every Result-writing prompt to write the id, and `steps stub` to refuse a result missing it when `--invocation` is given.
- TASK 28 (satisfied): `ledgers append --correction-of` passes `requestHash = actionHash(canonicalJson({ledger, rows}))` and the candidate row stores it through `...extra`. `spendCorrection` replays a known id free only on a matching hash and otherwise returns `conflict` with nothing written (`counters.ts:230`-`:239`). `CorrectionExhausted` names the conflict. The test drives `counters correction --request-hash` rather than the `ledgers append` calls its TEST FIRST describes; the test-first audit passed it. Observation: `--request-hash` is optional on `counters correction`, and a candidate row with no hash makes any later request under that id a free replay (`hashes.length > 0` guard). No workflow or prompt calls `counters correction` directly, so only a deliberate hand call reaches this.
- TASK 29 (satisfied): `coverage.status` is `incomplete` and `clean` is false whenever `nextCursor` is non-null (`ledgers.ts:2004`-`:2010`). `bkit-plan.md` re-runs the related-knowledge save with `--limit` set to `total` when `nextCursor` is not null. `query` has no upper cap on `--limit` (`ledgers.ts:1980`). Mirrors, the `.bkit/instructions.md` index line, the snapshot and the `.bkit/version` hashes are updated. On the `complete` to `clean` rename and the two edited tests (`install/modules/core.integration.test.ts:2659`, `ledgers/journal.integration.test.ts:549`): the edits are sound as tests. Each still pins one exact status plus `clean: true` on a finished, diagnostic-free scan, so no expectation was loosened. The rename itself is not required by the DONE WHEN, which `incomplete` beside `complete` would have met. No shipped workflow, prompt, template or doc names the `complete` value: prompts route on `missing`, `partial` and `unreadable` after `nextCursor` is null. So nothing in bkit reads the old value. It is still a change to the public `ledgers query` output, and a consumer script that matched `status: "complete"` would stop matching. No `CHANGELOG.md` line records it. That is an owner call, not a gap here.
- Error paths added (`CorrectionExhausted` conflict, the stale-result `CommandError`, `UncertainEffect`) use the engine's existing structured exits. No new error is swallowed.

## Identified Gaps Log

2 gaps.

- TASK 27: `.bkit/core/workflows/bkit-build.md:979` — a stale Result file still renders: no workflow passes `--invocation` to `steps stub --result-file` (`bkit-build.md:703`, `:865`, `:979`, `:980`, `:1089`; `bkit-debug.md:559`; `bkit-design.md:423`, `:424`, `:455`; `bkit-plan.md:383`-`:385`; `bkit-ship.md:759`), none clears or rotates a Result path before launching its subagent, no subagent prompt writes an `invocation` key into its result, and `steps.ts:2340` accepts a result with no `invocation` field even when `--invocation` is given, so round 1's challenge result or an earlier run's PASS verify result still renders as the current artifact and a missing fresh result never takes the Failure Path — Fixable: true
- TASK 25: `.bkit/core/engine/commands/workflow/ledgers.ts:1760` — a torn proper prefix of our first line that a later writer completed with its `\n` separator (`ledgers/status.ts:950` prepends one when the file does not end in a newline) is a complete line whose content is a proper prefix of the block's first line; `foreignWholeLine` compares the bytes including the newline, so it counts that line as foreign and prepares afresh instead of reporting `UncertainEffect`, against the DONE WHEN's "neither equal to nor a proper prefix" — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 27: a stale Result file still renders because no workflow binds the result to the current launch
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:979` · **Round:** 1
  - **DONE WHEN:** A result file that predates the subagent launch it is rendered for never renders: every workflow that renders a Result path either clears it before launching its subagent, or passes the issued invocation to `steps stub --result-file --invocation` and the subagent writes that id into its result, with a result that lacks the id refused (exit 6, nothing written); a missing fresh result always takes the step Failure Path.
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/steps.test.ts `refuses a result file left from an earlier round`
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 25: a torn prefix of our first line completed by a later writer newline is treated as a foreign row and the operation prepares afresh
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1760` · **Round:** 1
  - **DONE WHEN:** The landed check compares the first line at the recorded offset by content: a complete line whose content (without its newline) is a proper prefix of our first line reports `UncertainEffect` and writes nothing; only a complete line that is neither equal to nor a proper prefix of our first line prepares afresh and appends once.
  - **TEST FIRST:**
    - .bkit/core/engine/ledgers/journal.integration.test.ts `prepares afresh when nothing landed and a foreign row followed`
<!-- bkit:task 2 end -->
