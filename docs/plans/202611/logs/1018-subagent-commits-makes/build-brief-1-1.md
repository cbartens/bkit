# Brief: group 1 — Base resolver and the two engine checks

Plan: Subagent commits: make the changed-files and gaps-fix checks measure from the last step-done commit Implementation Plan

## Why and what

### Context & Goals

`bkit tests changed` defaults `--base` to `HEAD` (`tests-changed.ts`), and `bkit-build.md` Step 9 sub-step 5 and the holistic Step 10 sub-step 12 run `bkit branches scan-diff --base=HEAD~1 --code`. Both assume a subagent never commits. A subagent that does commit gets an empty changed set (lint and typecheck never run on its files) or a wrong range (a Decision Pause for a gaps fix that exists). Issue #1018 (finding C2 of #1012): both checks answer the same whether or not a subagent committed, because they measure from the commit that holds the previous `step-done` row of the active run, never from `HEAD` or `HEAD~1`.

Decided in the issue and not reopened: refusing a subagent commit outright and the `Commits` bullet in `.bkit/instructions.md` are out of scope; the four prompts that call `bkit tests changed` without `--base` get no edit; the existing run resolver `resolveActiveRun` in `.bkit/core/engine/commands/lib.ts` is used, no second one is added.

**Related Issues:**

- #1018 — Subagent commits make the changed-files and gaps-fix checks measure the wrong range (open)
- #1012 — Project Goals audit: where bkit falls short, and what to change (umbrella)

---

### Narrative

A build subagent finishes its edits and either commits them or leaves them uncommitted. `bkit tests changed` lists the same files, and the gaps-fix check reports the same source change, in both cases.

### Success Criteria

- `bkit tests changed` with no `--base` lists the same files whether the subagent committed or not.
- It never lists files from the previous step's own commit.
- `bkit branches scan-diff --since-step=<step> --code` exits the same whether the fix was committed by the subagent or left for `steps finish` to commit.
- No `--base=HEAD~1` literal is left in `.bkit/core/workflows/bkit-build.md`.
- No `bkit tests changed` call in a prompt needs an edit.

## Where it fits

- Group 1: Base resolver and the two engine checks — this group
  - TASK 1: Add `stepBase`, the resolver of the commit a run's last step began after — open
  - TASK 2: Make `bkit tests changed` default its base to the run's last step-done commit — open
  - TASK 3: Add `--since-step` to `bkit branches scan-diff` — open
- Group 2: Workflow calls, docs and mirrors — next
  - TASK 4: Point both gaps-fix source checks in `bkit-build.md` at `--since-step` — open
  - TASK 5: Update the docs and re-render the mirrors and `dist/` — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Add `stepBase`, the resolver of the commit a run's last step began after
  - **CREATE:** `stepBase` in `.bkit/core/engine/commands/workflow/step-base.ts`: returns the commit that holds the last `step-done` row of the active run (found by the row's `at` in the status file's history, else the row's `parentSha`); with a step name, the commit of the `step-done` row before that step's latest row; with no `step-done` row, the run's `workflow-started` commit; null with no active run
  - **CREATE:** `.bkit/core/engine/commands/workflow/step-base.test.ts`: real-git scratch repo with a committed `status.jsonl`
  - **READ:** `resolveActiveRun` in `.bkit/core/engine/commands/lib.ts`: finds the active run's status file
  - **READ:** `readStatusRows` in `.bkit/core/engine/commands/workflow/status.ts`: reads the rows
  - **READ:** `activeRunStart` in `.bkit/core/engine/commands/workflow/counters.ts`: the `workflow-started` row
  - **READ:** `writeStepRow` in `.bkit/core/engine/commands/workflow/steps.ts`: the row is written, then committed, with `parentSha` captured first
  - **READ:** `docs/testing.md`: § Test first and the real-git test tier
  - **DONE WHEN:** `step-base.ts` exports `stepBase`, imports no module that imports `tests-changed.ts` or `branches.ts`, and its three tests pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/step-base.test.ts` `returns the commit that holds the last step-done row` fails on the stub returning null instead of the commit that carries the row
    - `.bkit/core/engine/commands/workflow/step-base.test.ts` `with a step name returns the commit of the row before that step's latest row` fails on the stub returning the latest row's commit instead of the earlier one
    - `.bkit/core/engine/commands/workflow/step-base.test.ts` `falls back to the run start commit, and null with no run` fails on the stub returning null for a run with no step-done row

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Make `bkit tests changed` default its base to the run's last step-done commit
  - **UPDATE:** `testsChangedVerb` in `.bkit/core/engine/commands/workflow/tests-changed.ts`: `base` defaults to `stepBase(...)` (an explicit `--base` still wins; with no run or no row, `HEAD` and a log line); the `--base` help text names the run's last step-done commit
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests-changed.ts`: delete the comment and help text that rest on "agent steps never commit"
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tests-changed.test.ts`: the committed and uncommitted cases in a scratch repo with a `status.jsonl`
  - **READ:** `stepBase` in `.bkit/core/engine/commands/workflow/step-base.ts`: the resolver from TASK 1
  - **READ:** `.bkit/core/prompts/bkit-build-plan-tasks.md`: calls `bkit tests changed` without `--base`; it must need no edit
  - **DEPENDS ON:** 1
  - **DONE WHEN:** with no `--base`, a committed edit and the same edit left uncommitted give the same `files`; the previous step's own commit files are not listed; no prompt file changed; the file's tests pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-changed.test.ts` `lists a file the subagent committed after the last step-done commit` fails on the changed set being empty
    - `.bkit/core/engine/commands/workflow/tests-changed.test.ts` `lists the same file when it is left uncommitted` fails on the changed set differing from the committed case
    - `.bkit/core/engine/commands/workflow/tests-changed.test.ts` `leaves out a file only the previous step's own commit touched` fails on "src/prev.ts" being listed

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Add `--since-step` to `bkit branches scan-diff`
  - **UPDATE:** `scanDiffVerb` in `.bkit/core/engine/commands/workflow/branches.ts`: with the `scan-diff` verb spec, new flags `--since-step=<step>` (the base is `stepBase` of that step, so the range holds the step's own work, committed by the subagent or by `steps finish`) and `--file` (the run's `status.jsonl`, as `resolveActiveRun` takes it); exclusive with `--base`; a base that cannot be resolved exits `EXIT_DIFF_FAILED` with a log line
  - **UPDATE:** `.bkit/core/engine/commands/workflow/branches.test.ts`: cases in the `branches scan-diff` describe
  - **READ:** `stepBase` in `.bkit/core/engine/commands/workflow/step-base.ts`: the resolver from TASK 1
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `scan-diff --since-step=build-plan-gaps-remediate --code --file=<status>` exits 0 for a committed fix and for an uncommitted fix that `steps finish` committed, and exits 1 for a logs-only step; the `scan-diff` tests pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff --since-step --code exits 0 when the subagent committed its fix before steps finish` fails on "unknown flag" exit 2 instead of 0
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff --since-step --code exits 0 when the fix was left uncommitted and the finish commit holds it` fails on "unknown flag" exit 2 instead of 0
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff --since-step --code exits 1 when the step changed only logs` fails on "unknown flag" exit 2 instead of 1

<!-- bkit:task 3 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Default `--base` of `bkit tests changed` | `.bkit/core/engine/commands/workflow/tests-changed.ts` | `rg -n 'HEAD' tests-changed.ts`, `rg -n 'never commit or uncommitted files only' .bkit/core docs/testing.md` | `.bkit/core/engine/commands/workflow/tests-changed.ts` — owns the `HEAD` default, the flag help and `changedFiles` | EXTEND | Take the default from the new base resolver; fix the flag help. |
| Gaps-fix source check range | `.bkit/core/engine/commands/workflow/branches.ts` | `rg -n 'scan-diff' branches.ts`, `rg -n 'defaultRange' .bkit/core/engine/commands/workflow/` | `scanDiffVerb` in `.bkit/core/engine/commands/workflow/branches.ts` — has `--base` and the feature-base default, no step-relative range | EXTEND | Add `--since-step` and `--file` flags that set the base from the new resolver. |
| Base commit of the step's last `step-done` row | `.bkit/core/engine/commands/workflow/step-base.ts` | `rg -n 'step-done' .bkit/core/engine/commands/workflow/*.ts` filtered on last / latest / previous, `rg -n 'resolveActiveRun or activeRunStart or readStatusRows' .bkit/core/engine`, `.bkit/core/engine/commands/workflow/feature-base.ts` | `resolveActiveRun` in `.bkit/core/engine/commands/lib.ts` and `readStatusRows` in `status.ts` find the run and its rows (reused, not copied); `activeRunStart` in `counters.ts` returns only the `workflow-started` row; `featureBase` in `feature-base.ts` returns the feature's start, not a step's | NEW | Reason (a): no function maps a step-done row to the commit that holds it. `feature-base.ts` cannot take it (extending breaks its no-import-cycle contract: `status.ts` imports it and the helper must import `status.ts`). |
| Tests for the base resolver | `.bkit/core/engine/commands/workflow/step-base.test.ts` | `ls .bkit/core/engine/commands/workflow/*.test.ts` | None — no test covers the new module | NEW | Reason (a): the module is new, so its tests are. |
| Tests for the two checks | `.bkit/core/engine/commands/workflow/tests-changed.test.ts`, `.bkit/core/engine/commands/workflow/branches.test.ts`, `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | `rg -n 'describe\(' tests-changed.test.ts`, `rg -n 'branches scan-diff' branches.test.ts workflow-shape.test.ts` | the three files — real-git scratch-repo suites and markdown invariants for these verbs and workflow | EXTEND | Add the cases to the existing `tests changed` and `branches scan-diff` describes, and one invariant to `workflow-shape.test.ts`. |

## Deviations

publish=false
