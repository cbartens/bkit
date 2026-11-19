Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 9, 10, 12, 13
Loosened: none
Fingerprint: 87f1e9083ad3e085ad9babcb8aadad757e4d05aee6f4511a96e5fdef8f18fb7f
<!-- verdict:end -->

# Plan Verification

## Scope

Group 3

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-3-1.md` (CONCERNS, 3 gaps). `build-plan-gaps-remediate-3-1-log.md` closed gaps 2 (Task 13 `Read` lines) and 3 (Task 13 stale `decisions compose` comments), and partly closed gap 1 (Task 11 moved cases).

## Notes

- Tests run: `pnpm exec vitest run -c vitest.unit.config.ts` on `open-decision.test.ts`, `decisions.test.ts`, `challenge.test.ts`, `tasks.test.ts`, `status.test.ts`, `steps.test.ts`, `workflows.test.ts`, `summary.test.ts`, `cli-doc.test.ts`, `workflow-shape.test.ts`, `instructions-coverage.test.ts`, `instructions.test.ts`, `instructions-sources.test.ts`, `trackers.test.ts`: 1331 of 1332 pass. `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` exits 0 with no report. `pnpm bkit:text:ceiling check` passes: prompts 83844, workflows 58004.
- The one failure, `workflow-shape.test.ts` `build > the owner decisions contract names the task block as the Fix now carrier`, comes from the remediation rewording `bkit-build.md:77` (it dropped "summarise" from "NEVER restate, summarise or paraphrase"). No task's `DONE WHEN` or `TEST FIRST` names that test, so it is not a gap here; the group gate (`bkit:gate:static-unit`) routes it.
- Task 9, 10 and 12: still satisfied, as in attempt 1; their `TEST FIRST` tests and the named existing test files pass.
- Task 13 satisfied: the `Read` lines at `bkit-build.md:926`, `:1034` and `:1210` now name the `-engine.md` file; verify's `Read` lines (`:804`, `:973`) glob `build-decision-*.md`, which matches it; `steps finish --step=build-decision` adds the engine file as a second `--artifact`; the guard test and `engine calls > %s calls only verbs and flags the CLI has` pass; `cli-doc.test.ts`, `trackers.test.ts` and the three instructions tests pass; the workflows ceiling is 58004, below 58012 at the start of the group. The remediation changed no engine source, so `dist/` from the execute commit stands.
- Task 11 not satisfied: see the gap. The `counts` verb works and the decision file stays byte-identical in its tests.
- Test-first audit (`build-tests-green-3-2.md`, `Enforced: true`, 4 `delete-still-referenced` gaps at `Fixable: null`), decided as in attempt 1:
  - `compose`: the sampled hits are `docker compose`, a different thing. Outside `docs/plans/` and `docs/audits/`, `decisions compose` or `decision-items.json` appears only in `CHANGELOG.md`, `docs/decisions.jsonl` and `docs/deferrals.jsonl` (append-only history) and `docs/testing.md:957` (Task 16, group 4). No gap.
  - `composeItems`: hits only in archived `docs/audits/` and `docs/plans/**/logs/`. No gap.
  - `itemLines`: `.bkit/core/engine/shared/text.ts:245-259` and `dist/shared/text.js` are a different YAML-style function. No gap.
  - `decisions.test.ts` "the file still exists": the DELETE named the `describe("bkit decisions compose")` cases, not the file, and that describe is gone. No gap.
- No `Taken over`, `Unproven`, `Changed by a code step` or `Updated tests` sections in the audit. No decision records. The brief has no `Deviations` section.
- `Derived Test Matrix` rows for Tasks 9-13 are each named in their task's `DONE WHEN`. This group's `Documentation Updates` rows (`.bkit/instructions.md` entries, the generated `cli.md` region) are done; the rest belong to Task 16.

## Identified Gaps Log

1 gap.

- TASK 11: moved-cases-missing — the remediation ported 9 of the deleted `bkit decisions compose` `--loop` / `--base-check` cases into `describe("bkit decisions counts")`, but these behaviours from `e95997dff:.bkit/core/engine/commands/workflow/decisions.test.ts` still have no `counts` case: `prints the holistic gate's failing tests per round for the holistic loop` (:487), `--loop on an unknown trend recommends Try again without claiming progress` (:691), `base check all says a gate still red after resume comes from this branch` (:873), `base check some names the split` (:887), `base check none keeps the trend and names the branch` (:917), `base check unknown keeps the trend and says why` (:927), `Try again is offered for every base verdict` (:943), and the `(local run)` / `can't tell (no JUnit report)` halves of `base check prints how many failing tests are also red on base` (:960) and the `B) Stop` effect text of `--loop writes an effect for each loop option` (:280); DONE WHEN "the moved cases pass" is still unmet — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 11: compose --loop / --base-check cases still not all moved to bkit decisions counts
  **Severity:** HIGH · **Class:** moved-cases-missing · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.test.ts:940` · **Round:** 1
  - **DONE WHEN:** the six tests below and the moved cases pass
  - **TEST FIRST:**
    - prints the holistic gate's failing tests per round for the holistic loop
    - --loop on an unknown trend recommends Try again without claiming progress
    - base check all says a gate still red after resume comes from this branch
    - base check some names the split
    - base check none keeps the trend and names the branch
    - base check unknown keeps the trend and says why
    - Try again is offered for every base verdict
    - base check prints how many failing tests are also red on base
    - --loop writes an effect for each loop option
<!-- bkit:task 1 end -->
