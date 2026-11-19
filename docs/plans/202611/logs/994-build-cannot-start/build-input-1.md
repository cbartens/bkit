## Session Prompt — this run's, newer than everything below

#994 publish=false

## Issue description — oldest

### What happened

A build was started for a feature whose planning branch was still on the remote after the plan phase closed. The build's rebase of the feature branch onto the plan hit an add/add conflict in the plan's log files (the same file was created on both sides), and the build refused to continue. It happened on three separate features, and each time an owner had to repair the branch by hand.

Why the planning branch survives the plan close is not written down. The code shows the rule (below) but no decision row or doc says why the branch is kept in the cases that matter.

### What should happen

A build either starts cleanly on a plan whose branch was closed out, or it says in one line what to do, without a conflict in files the plan close wrote.

### Where in the code

Read on `dev` on 2026-11-16; not re-run.

- `.bkit/core/engine/commands/workflow/branches.ts:271` returns `"refuse"` for this state.
- `.bkit/core/engine/commands/workflow/branches.ts:3278-3295`: the plan close keeps the planning branch when pushes are left over (`left.length`) and removes it only when dev pushes happened (`devPushes`). A branch that is kept still holds the plan's log rows.
- `.bkit/core/engine/commands/workflow/worktrees.ts:1384` rebases with `--rebase-merges`, which replays the add/add on the plan's log files.
- `.bkit/core/workflows/bkit-plan.md:578` describes the close step.

### Steps to reproduce

Not reproduced by me. The three recorded sightings all follow the same path: plan phase closes with the planning branch kept, the same plan log files are later created on the feature branch, build starts and rebases.

### How often

Three sightings, recorded as three keys: `951-build-rebase-plan-v2-reviewed-add-add-conflict` (open, the canonical one), `916-build-rebase-add-add-conflict-plan-logs` and `912-build-rebase-add-add-plan-v2-reviewed` (both closed as duplicates of the same defect, the audit's `failures-29` and `failures-31`).

### Success Criteria

- A build started after a plan close that kept its branch does not stop on an add/add conflict in the plan's log files.
- Or, if refusing is right, the refusal at `branches.ts:271` names the file and the single command that fixes it.
- The reason the planning branch is kept at the plan close is written down in a decision row.

### Which test proves it

A test in `.bkit/core/engine/commands/workflow/branches.test.ts` (or the worktree test file that covers the rebase) that builds a plan-closed branch with a leftover push and starts the build.

### References

**Audit reports:** docs/audits/202611/failures-20261116T065554Z.md (findings failures-5, failures-29, failures-31)

Ledger keys covered (`docs/failures.jsonl`):

- `951-build-rebase-plan-v2-reviewed-add-add-conflict`
- `916-build-rebase-add-add-conflict-plan-logs`
- `912-build-rebase-add-add-plan-v2-reviewed`

Sub-issue of [#345 — Failures triage](https://github.com/cbartens/bkit/issues/345). Raised by [#968 — Sweep the deferrals and failures parked since v6.1.1 before v6.2](https://github.com/cbartens/bkit/issues/968).

## Issue comment — posted 2026-11-17T11:37:01.000Z

Owner decision for this issue, 2026-11-17 (v6.3 run): the engine resolves the clash itself.

- For plan-log files that exist both on `dev` and on the leftover planning branch, the engine keeps `dev`'s copy and the build starts. This is what it already does for ledgers and for untracked logs.
- No owner repair and no stop.
- The planning branch is not deleted at plan close, and the build does not keep refusing with a clearer message.

## Issue comment — posted 2026-11-19T06:32:18.000Z

Lane change in the v6.3 run (2026-11-19, agreed with the owner): this issue is built with `/bkit-build`, not `/bkit-debug`. The label moves from `next:debug` to `next:build`.

Why: the debug workflow is not used in this run until "Ship and debug in local mode" (https://github.com/cbartens/bkit/issues/938) lands, and this issue does not need a diagnosis. The cause is in the body (`branches.ts:271`, `branches.ts:3278-3295`, `worktrees.ts:1384`) and the owner's decision of 2026-11-17 above says what to build: for plan-log files that exist both on `dev` and on the leftover planning branch, the engine keeps `dev`'s copy and the build starts.

Order: after the build of "Host-made worktrees: gaps left after setup adopts them" (https://github.com/cbartens/bkit/issues/1050) has landed, because both change `worktrees.ts`.
