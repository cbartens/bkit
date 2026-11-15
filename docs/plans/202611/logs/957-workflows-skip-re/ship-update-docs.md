# Docs Update

## Files Modified

- `docs/testing.md` (unstaged)

## Drift Resolved

`docs/testing.md`: all four passes applied. The tests the build added were not in the per-file coverage tables. Five rows now match the shipped tests:

- `commands/workflow/summary.test.ts` row: an all-`Accept` holistic pause settles the last holistic verify and remediate FAIL before it, with the `Holistic verify` loop item answered `Decide`. A `Fix now` item or a `Try again` loop answer settles nothing.
- `commands/workflow/step-table.test.ts` row: `status resume` after a `route=continue` row names Build Challenge (holistic) or Plan Execute (group verify).
- `commands/workflow/tasks.test.ts` row: `tick --decision` ticks only the `Accept` / `Accept (assumed)` items' `Task {N}` tasks (any case). A `Fix now` item's task stays open.
- `commands/workflow/workflows.test.ts` row (§ in the workflows paragraph): `openDecision` carries `sourceChanged` (the `Source changed` header).
- `audits/workflows/workflow-shape.test.ts` row: the `continue` route. It needs no `Gate: FAIL` and the header `Source changed: false`. Holistic goes to Step 11. Verify ticks through `tasks tick --decision` before the decision row, sends a non-zero exit to the Failure Path, then goes to Step 7.

No wording was reorganised or compressed beyond those edits, and no cross-reference needed changing.

Already updated in the staged change, not touched by me:

- `.bkit/cli.md` and `.bkit/core/.bkit/cli.md` (the `--decision` flag).
- `.bkit/core/.bkit/workflows.md` and `.bkit/workflows.md` (the Re-runs follow answers invariant).
- `.bkit/instructions.md`.
- `docs/decisions.jsonl` (the rule's ledger row).

I also did not edit `docs/capabilities.md`, `docs/components.md`, `docs/architecture.md` or `docs/technology.md`. Plan task 5 names only the workflow doc and the decisions ledger, and grep finds no mention of decision routes or `tasks tick` in them.

Memory: `MEMORY.md` holds only pointers, and no entry is stale or duplicates this change. No edit.

History boundary: `git rev-parse --is-shallow-repository` printed `false`, so the full history is read. `origin/dev..HEAD` lists 16 commits. The feature itself is the staged, uncommitted change.

## Unresolved Coverage

Per topic, for the files this ship touches:

<!-- prettier-ignore -->
| Topic | Status |
| --- | --- |
| architecture, technology, security, data-schema, deployments, observability, design, noise, setup | Present and indexed. Not touched by this change (engine commands and workflow prose only, no topology, dependency, credential, schema, CI, logging or setup change). |
| testing | Present and indexed. Updated. |

Coverage check against `.agents/docs.md`: all ten recommended documents exist in `docs/` with an index row, and none is empty or still the starter. `docs/data-schema.md` is 10 lines and `docs/noise.md` is 14 lines. Both are short, and neither is relevant here.

None unresolved.

## Pending Items

From `ship-pending-items-957.md`, four LOW deferrals, all reason `low-severity`, for human review:

- `957-workflows-skip-re-challenge-low-bkit-core-engine-commands-workflow-tasks-ts-219`: `tasks tick --decision` matches a task number anywhere in an item's title. A gap such as `No test covers the retry path that task 2 adds` ticks task 2, so an unfinished task passes the summary's unticked-task gate. Done when only a title starting with `Task {N}` ticks.
- `957-workflows-skip-re-challenge-low-bkit-core-engine-commands-workflow-tasks-ts-213`: `tasks tick --decision` ticks from any decision file, including a `Gate: FAIL` pause, a `From: holistic` file or another group's file. The red-gate exclusion lives only in workflow prose. Done when it exits 2 and ticks nothing on those headers.
- `957-workflows-skip-re-challenge-low-bkit-core-engine-commands-workflow-tasks-ts-222`: `tasks tick --tasks=9 --decision=<file>` on group 1 silently drops task 9 (group 2) and exits 0, where `--tasks=9` alone exits 2. Done when the group filter applies only to the decision-derived numbers.
- `957-workflows-skip-re-challenge-low-bkit-core-workflows-bkit-build-md-306`: an all-Accept holistic pause on a gap naming an unticked task goes to Step 11 with no tick, so Step 15 can report `Task N not done`. Done when the holistic items are titled `Task {N}` and `continue` from holistic runs `tasks tick --decision` per group.

## Blockers

None
