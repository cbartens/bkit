Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 37
Loosened: none
Fingerprint: bbb118e7f30ab6b83dc9698df5761d6c9037eaf01f1eb2cbe27311c32753db5c
<!-- verdict:end -->

# Plan Verification

## Scope

Group 10

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-10-1.md` (CONCERNS, 2 gaps, Tasks 37): stale `bkit-build:513` drift anchors plus the bkit-build none-render baseline, and the ship reason-file path using `{LOG_DIR}`.
- `build-plan-gaps-remediate-10-1-log.md` (commit d385a3192) fixed both: anchors now `bkit-build:515` in `.bkit/instructions.md:1158` and `:1255`, the baseline is regenerated, and `.bkit/core/workflows/bkit-ship.md:404` and `:406` use `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md`. The ship fix left its own `## Local Instructions` entry stale (see the log).

## Notes

- TASK 36: both planned tests in `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` pass; `instructions.test.ts`, `instructions-sources.test.ts` and `render/trackers.test.ts` pass. No workflow or prompt names `-engine.md` or `build-owner-reason-`. The `--reason=` hits that remain are the `prs transport-row --reason=<why>` gh MCP fallback text and `runs revalidate --reason="{REVALIDATE_REASON}"` (`bkit-ship.md:670`); both carry values the engine sets, not the owner's words, so they are no gap. The `Decision:` hits that remain are the build header ban (`bkit-build.md:168`) and the design / plan `Decision: {key}` answer lines, which are not the build decision file. No workflow saves `decisions answers` output to a file. The three prompts each name `bkit decisions answers` once. Word totals: workflows 57996 before the group (26439197d) and 57987 now (lower); prompts 83844 then 83837 now (not higher). Not satisfied: `instructions-coverage.test.ts` fails (1 of 607 tests in the five files run).
- TASK 37: satisfied. The DONE WHEN `git grep` prints nothing, and `pnpm bkit:text:ceiling check` prints `ok — prompts 83837, workflows 57987`. `scripts/gate/bkit-text-ceiling.json` is lowered to those totals with no raise.
- Test-first audit (`build-tests-green-10-2.md`): `Enforced: true`, 0 gaps, and none of the sections Taken over, Unproven, Changed by a code step, Updated tests or Already landed.
- Decision records: none of `build-decision-1-1.md`, `-1-2.md`, `-2-1.md` or `-2-2.md` covers a group 10 task. The `decisions.test.ts` change in the group diff belongs to group 12's tests step (Task 44). `build-decision-2-2.md` Q1 hands it to group 12 (assumed, not the owner's acceptance), so it is not judged here.
- The remediation commit d385a3192 also ticked `[x] TASK 37` in the plan, as verify 10-1 had passed it.
- Out of scope, proposed separately: `bkit-ship.md:95` (Failure Path, an earlier group's task) still uses `{LOG_DIR}`, which ship never holds.

## Identified Gaps Log

1 gap.

TASK 36: `.bkit/core/engine/tools/instructions-coverage.test.ts` `the repo > has no coverage findings` fails again, and DONE WHEN names it: the round-1 fix moved the ship reason file to `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md` at `.bkit/core/workflows/bkit-ship.md:404`, but the matching `## Local Instructions` entry at `.bkit/instructions.md:10901` still quotes the old `{WORKTREE_PATH}/{LOG_DIR}/ship-owner-reason-…` line, so the test reports "no entry" for `bkit-ship.md:404` and "local entry no longer in the file". Fix: update that entry to the new line text — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 36: the bkit-ship Local Instructions entry still quotes the old {LOG_DIR} ship-owner-reason line
  **Severity:** HIGH · **Class:** test-failing · **Fixable:** true · **Location:** `.bkit/instructions.md:10901` · **Round:** 1
  - **DONE WHEN:** the instruction tests (instructions-coverage.test.ts, instructions.test.ts, instructions-sources.test.ts) pass
  - **TEST FIRST:**
    - .bkit/core/engine/tools/instructions-coverage.test.ts the repo > has no coverage findings
<!-- bkit:task 1 end -->
