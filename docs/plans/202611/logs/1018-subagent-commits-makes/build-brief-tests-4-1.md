# Brief: group 4 — Challenge round 2 findings (tests)

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

- Group 1: Base resolver and the two engine checks — done
  - TASK 1: Add `stepBase`, the resolver of the commit a run's last step began after — done
  - TASK 2: Make `bkit tests changed` default its base to the run's last step-done commit — done
  - TASK 3: Add `--since-step` to `bkit branches scan-diff` — done
- Group 2: Workflow calls, docs and mirrors — done
  - TASK 4: Point both gaps-fix source checks in `bkit-build.md` at `--since-step` — done
  - TASK 5: Update the docs and re-render the mirrors and `dist/` — done
- Group 3: Challenge round 1 findings — done
  - TASK 6: A subagent commits its edit in a feature worktree whose tree also carries another feature's in-progress run, and `bkit tests changed` still lists nothing, so lint and typecheck never run on its files — done
  - TASK 7: A gaps-fix subagent commits its source fix, its first `steps finish` refuses a contradicted planned-test edit and writes a `build-takeover` row stamped with the post-fix `HEAD`, and `scan-diff --since-step` then measures from after the fix, exits 1 and sends the run to a needless Decision Pause — done
  - TASK 8: A debug run works in place on `dev` while another agent commits there (or `sync-dev` fast-forwards it), and `bkit tests changed` now lists every file those foreign commits touched, so the debug agent's gate fails on work it does not own and it is told every test must pass — done
- Group 4: Challenge round 2 findings — this group
  - TASK 9: A build runs in a cloud runtime that adopts its session branch in place (`claude/...`, not `feat/{FID}`), the tree carries another feature's in-progress run from `dev`, a subagent commits its edit, and `bkit tests changed` still lists nothing, so lint and typecheck never run on its files — open

## The work

<!-- bkit:task 9 start -->
- [ ] **TASK 9:** A build runs in a cloud runtime that adopts its session branch in place (`claude/...`, not `feat/{FID}`), the tree carries another feature's in-progress run from `dev`, a subagent commits its edit, and `bkit tests changed` still lists nothing, so lint and typecheck never run on its files
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/step-base.ts:47` · **Round:** 2
  - **DONE WHEN:** With no `--file`, `stepBase` finds the checkout's own run on a branch that is not `feat/{FID}` (an adopt-mode session branch, or a debug run's named `--branch`), for example the one in-progress run whose `status.jsonl` this branch's own commits or working tree changed, so another feature's in-progress run in the tree no longer makes `bkit tests changed` measure from `HEAD` there; the existing planned tests still pass unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-changed.test.ts` `lists the subagent's committed file on an adopted branch when another feature's run is also in progress` fails on `files` being `[]` instead of `["src/a.ts"]`: on `dev` commit `docs/plans/202611/logs/2-y/status.jsonl` holding only a `workflow-started` row, branch `claude/session` from it, commit run `1-x`'s `workflow-started` row and one `step-done` row, then commit `src/a.ts`; `branchFid` is undefined, the scan finds two in-progress runs, so `stepBase` returns null and the base is `HEAD`
    - `.bkit/core/engine/commands/workflow/step-base.test.ts` `with no file on a branch that is not feat/{FID}, picks the run this branch started when another run is in progress` fails on `stepBase({ cwd })` returning null instead of the commit that holds run `1-x`'s last `step-done` row
<!-- bkit:task 9 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `stepBase` returns the commit that holds the last `step-done` row of the active run | unit | `.bkit/core/engine/commands/workflow/step-base.test.ts` | 1 |
| `stepBase` with a step name returns the commit of the `step-done` row before that step's latest row | unit | `.bkit/core/engine/commands/workflow/step-base.test.ts` | 1 |
| `stepBase` returns the run start commit when no `step-done` row exists, and null with no run | unit | `.bkit/core/engine/commands/workflow/step-base.test.ts` | 1 |
| `tests changed` with no `--base` lists a file the subagent committed after the last step-done commit | unit | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` | 2 |
| `tests changed` with no `--base` lists the same file when it is left uncommitted | unit | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` | 2 |
| `tests changed` with no `--base` leaves out a file only the previous step's own commit touched | unit | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` | 2 |
| lists the subagent's committed file when another feature's run is also in progress | Unit | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` | 6 |
| with no file on a feat/{FID} branch, picks that FID's run when another run is in progress | Unit | `.bkit/core/engine/commands/workflow/step-base.test.ts` | 6 |
| skips a build-takeover row written inside the step it measures | Unit | `.bkit/core/engine/commands/workflow/step-base.test.ts` | 7 |
| on an in-place shared-branch run leaves out a file another agent committed after the last step-done commit | Unit | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` | 8 |
| lists the subagent's committed file on an adopted branch when another feature's run is also in progress | Unit | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` | 9 |
| with no file on a branch that is not feat/{FID}, picks the run this branch started when another run is in progress | Unit | `.bkit/core/engine/commands/workflow/step-base.test.ts` | 9 |

## Deviations

publish=false
