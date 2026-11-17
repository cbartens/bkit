Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 14, 15, 16, 17
Loosened: none
Fingerprint: e58b4756ab63b3f46fd25c28748dd8be3cb83e655b8abe47e1ab69bbf9e82a15
<!-- verdict:end -->

# Plan Verification

## Scope

Group 5

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-5-1.md` (CONCERNS, 2 Fixable: true gaps on Task 18: no working restore for a `test-loosened` `Changed by a code step` test; stale catalog rows).
- `build-plan-gaps-remediate-5-1-log.md` (PASS, Fixed 2): reworded the tests-step restore bullet and the verify rule, and updated the catalog rows in `.bkit/core/.bkit/prompts.md`, `.bkit/core/.bkit/workflows.md` and their rendered copies.

## Notes

- Judged against `build-diff-5-2.md` (group diff: commits `f4ca3a679` tests, `fdf41478f` code, `e98a5acf9` remediate). Remediate commit `e98a5acf9` touched only prompts, catalogs, mirrors, the register files and the engine's plan ticks for Tasks 14-17; no engine source changed since attempt 1.
- TASK 14-17: unchanged since attempt 1 and still satisfied (`tests.ts:2479-2492` `changed` before the not-enforced return; `lockBaselines` newest-blob move for `block: null` at `tests.ts:406-413`; `CODE_STEPS` and non-empty `reason` filter at `tests.ts:380-384`, `fieldExtras` refusal in `steps.ts`; `baselineDiff` null blob as `""` and `lineDiff` empty split). Their `TEST FIRST` tests pass in `build-tests-green-5-2.md`.
- TASK 18: prior gap 2 is closed: `.bkit/core/.bkit/prompts.md:337` and `.bkit/core/.bkit/workflows.md:1799` (and the rendered `.bkit/prompts.md` / `.bkit/workflows.md`) now say a `Changed by a code step` entry raises `test-loosened` for an added line that disables or loosens the test. Prior gap 1 is closed on its routing: the verify rule logs `Fixable: false` for an earlier-group test or a repeat (matches decision 6 Q2 (a), "to you as a blocker"), and for a same-group test the restore route (`bkit-build.md:833-850`) re-runs `tests red --group`, which re-records the restored lines because they differ from the proven red block. Task 18 stays open for two new gaps the rewording introduced: a mis-nested `Else` in the verify rule, and a restore bullet that names an `origin` field the `changed` entry does not carry.
- Stale wording sweep: `cannot remove or loosen` survives only in `steps.test.ts:2596` as a `not.toMatch` assertion (Task 18's own test).
- Test-first audit (`build-tests-green-5-2.md`): `Enforced: true`, 0 gaps, 0 unproven, no `Updated tests` or `Changed by a code step` section, so no `null` gap to decide and nothing loosened. Already landed: Task 15 `steps.test.ts` "still refuses a group 2 code step that changes a file whose group 1 planned test has no recorded block, exit 11" — the engine already refused any edit to an unlocated test's whole file; the test guards that it stays refused.
- Plan currency (`build-plan-current.md`): the two `Reword` items name Tasks 5 and 7 (earlier groups), none of this group.
- Decision records: decision 6 (`build-decision-1-6.md`) chose Fix now for Tasks 15 and 18 (option (a)); no record accepts either gap logged here. Decisions 1-1 to 1-5 cover earlier groups or holistic gaps.
- Out of scope, carried from attempt 1 and proposed separately: `runs.ts:2329` writes a `step-done` row with any `--step` and raw `--field` extras, so `--step=build-plan-tasks --field=changedTests=...` could still forge a baseline-moving record; Task 16's DONE WHEN names only `steps finish` and `steps record`.

## Identified Gaps Log

2 gaps.

TASK 18: `.bkit/core/prompts/bkit-build-plan-verify.md:96-99` — the new `Changed by a code step` rule is mis-nested: its `**If**` (earlier-group or repeat → `Fixable: false`) sits at 5 spaces, but its `**Else** → raise a test-loosened gap ... Fixable: true` sits at 3 spaces, a sibling of the step-8 section bullets (`Unproven`, `Updated tests`), so the Fixable: true branch reads as a standalone section rule detached from both its condition and the "an added line disables or loosens the test" case; that case also sits inside a continuation paragraph instead of on its own line with the `If` / `Else` as its sub-bullets (`.bkit/authoring.md` "Conditions on their own lines"). Fix the source nesting and re-render the mirrors (`.claude/`, `.cursor/`, `.opencode/`, `.codex/`, `.agents/plugins/`) — Fixable: true
TASK 18: `.bkit/core/prompts/bkit-build-plan-tests.md:81` — the restore bullet for a `Changed by a code step` entry tells the tests step to restore the test "as at its baseline, the entry's `origin` blob (`git show {origin}`)", but a `changed` entry carries no `origin`: the `Changed` interface (`.bkit/core/engine/commands/workflow/tests.ts:1490-1497`) holds `task`, `test`, `name`, `reason`, `diff` and `additive`, and the report's `## Changed by a code step` section (`tests.ts:1715-1724`) prints only the reason and the diff, so the step names a value the agent cannot read. Either print `origin` on the `changed` entry and its report line, or have the bullet work from the entry's diff alone; the DONE WHEN's "a test-loosened gap that the tests step restores" needs a restore the tests step can carry out — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Changed by a code step rule: Else branch mis-nested as a step-8 sibling bullet
  **Severity:** MEDIUM · **Class:** prompt-structure · **Fixable:** true · **Location:** `.bkit/core/prompts/bkit-build-plan-verify.md:99` · **Round:** 1
  - **DONE WHEN:** In .bkit/core/prompts/bkit-build-plan-verify.md the Changed by a code step rule puts the "an added line disables or loosens the test" case on its own line, with its If (earlier group or repeat -> Fixable: false) and Else (Fixable: true, Loosened line) as sub-bullets at the same depth beneath it; mirrors re-rendered and .bkit/instructions.md synced
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Restore bullet names an origin blob the changed entry does not carry
  **Severity:** MEDIUM · **Class:** contract-mismatch · **Fixable:** true · **Location:** `.bkit/core/prompts/bkit-build-plan-tests.md:81` · **Round:** 1
  - **DONE WHEN:** The tests-step restore bullet for a Changed by a code step entry names only values the entry carries: either tests green prints origin on each changed entry (JSON and the report line) or the bullet restores from the entry diff alone; mirrors re-rendered and .bkit/instructions.md synced
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
