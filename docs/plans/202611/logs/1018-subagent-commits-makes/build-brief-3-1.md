# Brief: group 3 — Challenge round 1 findings

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
- Group 3: Challenge round 1 findings — this group
  - TASK 6: A subagent commits its edit in a feature worktree whose tree also carries another feature's in-progress run, and `bkit tests changed` still lists nothing, so lint and typecheck never run on its files — open
  - TASK 7: A gaps-fix subagent commits its source fix, its first `steps finish` refuses a contradicted planned-test edit and writes a `build-takeover` row stamped with the post-fix `HEAD`, and `scan-diff --since-step` then measures from after the fix, exits 1 and sends the run to a needless Decision Pause — open
  - TASK 8: A debug run works in place on `dev` while another agent commits there (or `sync-dev` fast-forwards it), and `bkit tests changed` now lists every file those foreign commits touched, so the debug agent's gate fails on work it does not own and it is told every test must pass — open

## The work

<!-- bkit:task 6 start -->
- [ ] **TASK 6:** A subagent commits its edit in a feature worktree whose tree also carries another feature's in-progress run, and `bkit tests changed` still lists nothing, so lint and typecheck never run on its files
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/step-base.ts:37` · **Round:** 1
  - **DONE WHEN:** With no `--file`, `stepBase` resolves the run of the checkout's own FID (its `feat/{FID}` branch, passed to `resolveActiveRun` as `fid`) before it falls back to the single in-progress run, so another feature's in-progress run in the tree no longer makes `bkit tests changed` measure from `HEAD`; the existing planned tests still pass unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-changed.test.ts` `lists the subagent's committed file when another feature's run is also in progress` fails on `files` being `[]` instead of `["src/a.ts"]`: on branch `feat/1-x`, a second committed `docs/plans/202611/logs/2-y/status.jsonl` holding only a `workflow-started` row makes `resolveActiveRun` find two in-progress runs, so `stepBase` returns null and the base is `HEAD`
    - `.bkit/core/engine/commands/workflow/step-base.test.ts` `with no file on a feat/{FID} branch, picks that FID's run when another run is in progress` fails on `stepBase({ cwd })` returning null instead of the commit that holds run `1-x`'s last `step-done` row
<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->
- [ ] **TASK 7:** A gaps-fix subagent commits its source fix, its first `steps finish` refuses a contradicted planned-test edit and writes a `build-takeover` row stamped with the post-fix `HEAD`, and `scan-diff --since-step` then measures from after the fix, exits 1 and sends the run to a needless Decision Pause
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/step-base.ts:45` · **Round:** 1
  - **DONE WHEN:** `stepBase` skips the `build-takeover` rows (`TAKEOVER_STEP`, which a refused `steps finish` writes inside the step being measured) when it picks the prior `step-done` row, so `scan-diff --since-step` and `tests changed` measure from the row before the step began whether the subagent committed before the refusal or not.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff --since-step --code exits 0 when a refused finish wrote a takeover row after the subagent committed its fix` fails on exit 1 and `{ found: false, paths: [] }`: after `runWithEarlierStep`, commit `src/fix.ts`, append an uncommitted `build-takeover` row (`uncommitted: true`, `parentSha` = the fix commit), then `finish`; the prior row is the takeover row, so the base is the fix commit and only `status.jsonl` (excluded) is in range
    - `.bkit/core/engine/commands/workflow/step-base.test.ts` `skips a build-takeover row written inside the step it measures` fails on `stepBase({ cwd, step: "build-plan-b" })` returning the takeover row's `parentSha` instead of the commit that holds the `build-plan-a` row
<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->
- [ ] **TASK 8:** A debug run works in place on `dev` while another agent commits there (or `sync-dev` fast-forwards it), and `bkit tests changed` now lists every file those foreign commits touched, so the debug agent's gate fails on work it does not own and it is told every test must pass
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests-changed.ts:209` · **Round:** 1
  - **DONE WHEN:** On a run that works in place on a shared branch (it has a shared-checkout record), `bkit tests changed` with no `--base` never lists a file that only a commit outside the run touched, for example by keeping the `HEAD` default there; feature-worktree runs keep the run-derived base.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-changed.test.ts` `on an in-place shared-branch run leaves out a file another agent committed after the last step-done commit` fails on `files` containing `src/foreign.ts`: a debug run in place on `dev` with a shared-checkout record and one committed `step-done` row, then a foreign commit of `src/foreign.ts` and an uncommitted edit to `src/a.ts`; the base is the step-done commit, so the foreign commit is in range
<!-- bkit:task 8 end -->

## Deviations

publish=false
