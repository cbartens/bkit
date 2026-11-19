Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 37
Loosened: none
Fingerprint: 6a9385bae2ae7c9816138dfef23a8935ed27a0b4f73e16d147e395bdd3c9a57f
<!-- verdict:end -->

# Plan Verification

## Scope

Group 10

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 36: both planned tests in `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` pass (the whole file passes). Every UPDATE field maps to a change in `.bkit/core/workflows/bkit-build.md` (Open decision `questions` = 0 route, Owner decisions line, Decision Pause steps 2, 4, 5, 6 and 8), `.bkit/core/workflows/bkit-ship.md` (reason file) and the three prompts, which each name `bkit decisions answers` once. No workflow or prompt names `-engine.md` or `build-owner-reason-`, and no workflow saves `decisions answers` output to a file. The remaining `--reason=` hits (`runs revalidate --reason="{REVALIDATE_REASON}"` at `bkit-ship.md:670`, `prs transport-row --reason=<why>` in the gh MCP fallback lines) are other verbs' flags carrying engine-set values, not the owner's words, so they are no gap. The remaining `Decision:` hits are the build header ban itself (`bkit-build.md:168`) and the design / plan answer-file `Decision: {key}` lines, which are not the build decision file. Word totals before the group (26439197d) and now: workflows 58007 to 57987 (lower), prompts 83844 to 83837 (not higher); the diagnose clause is shorter. Not satisfied: `instructions-coverage.test.ts` fails, and the ship reason-file path uses a `LOG_DIR` that ship never holds (see the log).
- TASK 37: satisfied. The `git grep` for `engine file` / `-engine.md` over `.bkit/core/*.md`, `.bkit/core/**/*.md` and `.bkit/instructions.md` prints nothing. `pnpm bkit:text:ceiling check` prints `ok — prompts 83837, workflows 57987`, and `scripts/gate/bkit-text-ceiling.json` is lowered to exactly those totals with no raise. `.bkit/core/.bkit/workflows.md` has the `decision-counts` and `decision-answer` status rows and the fixer's `decisions answers` lines; `.bkit/core/.bkit/jsonl.md` and `docs/testing.md` rows are updated. `.bkit/core/.bkit/cli.md` hand text and `.bkit/core/.bkit/authoring.md` name no engine file, so nothing there needed changing.
- Test-first audit (`build-tests-green-10-1.md`): `Enforced: true`, 0 gaps, no Taken over, Unproven, Changed by a code step, Updated tests or Already landed sections.
- Decision records: none of `build-decision-1-1.md`, `-1-2.md`, `-2-1.md` or `-2-2.md` covers a group 10 task. The `decisions.test.ts` change in the group diff is group 12's tests step (commit 527ec9d0b, Task 44), which `build-decision-2-2.md` Q1 hands to group 12 (assumed, not the owner's acceptance); it is not judged here.
- Out of scope, proposed separately: `bkit-ship.md:95` (Failure Path, an earlier group's task) also uses `{LOG_DIR}`, which ship never holds.

## Identified Gaps Log

2 gaps.

TASK 36: `.bkit/core/engine/tools/instructions-coverage.test.ts` `the repo > has no coverage findings` fails, and DONE WHEN names it: the `commits` and `pushes` drift anchors at `.bkit/instructions.md:1158` and `:1255` say `bkit-build:513`, but the `--only-if-dirty-tracked --scope=core --mode=commit` line is now `.bkit/core/workflows/bkit-build.md:515`, because Decision Pause step 6 gained two blank lines around its `decisions apply` fence after the anchors were moved. The same blank lines leave the UPDATE field's render baseline stale: `.bkit/core/engine/render/trackers.test.ts` `bkit-build: the none render matches its baseline byte for byte` fails against `.bkit/core/engine/render/__snapshots__/bkit-build.none.txt`. Fix: move both anchors to `bkit-build:515` and regenerate the baseline with `-u` — Fixable: true
TASK 36: `.bkit/core/workflows/bkit-ship.md:404` and `:406` write and pass the owner's reason at `{WORKTREE_PATH}/{LOG_DIR}/ship-owner-reason-{RUN}-{ENTRY}.md`, but bkit-ship never holds `LOG_DIR` (build holds it from `worktrees` `logDir`, an absolute path under the worktree, so `{WORKTREE_PATH}/{LOG_DIR}` would also double the worktree path). The task's UPDATE names `{WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md`; use that path in both lines — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 36: instructions-coverage drift anchors and the bkit-build none-render baseline are stale
  **Severity:** HIGH · **Class:** test-failing · **Fixable:** true · **Location:** `.bkit/instructions.md:1158` · **Round:** 1
  - **DONE WHEN:** the instruction tests (instructions-coverage.test.ts, instructions.test.ts, instructions-sources.test.ts) pass
  - **TEST FIRST:**
    - .bkit/core/engine/tools/instructions-coverage.test.ts the repo > has no coverage findings
    - .bkit/core/engine/render/trackers.test.ts none render baselines > bkit-build: the none render matches its baseline byte for byte
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 36: ship reason file path uses LOG_DIR, which bkit-ship never holds
  **Severity:** MEDIUM · **Class:** missing-implementation · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-ship.md:404` · **Round:** 1
  - **DONE WHEN:** bkit-ship.md confirm and reject write the owner words to {WORKTREE_PATH}/docs/plans/{YYYYMM}/logs/{FID}/ship-owner-reason-{RUN}-{ENTRY}.md and pass --reason-file with that path
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
