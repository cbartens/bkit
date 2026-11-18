# Brief: group 1 — The FAILED flush gets the close's PR fallback (tests)

Plan: Publish a refused ship FAILED flush through a PR Implementation Plan

## Why and what

### Context & Goals

When ship fails, its Failure Path runs `bkit workflows handover --flush`. That commits the ship FAILED record in a throwaway `origin/dev` checkout and pushes it to `dev`. When `dev` refuses the push (branch protection), the record stays only in the run's book and the command exits 10; on a cloud runner the book is thrown away, so the record is lost. Ship's success close already publishes a refused commit through a PR (`closePr`). The FAILED flush gets the same fallback, with a ship FAILED title and its own `ship-failed/{fid}` branch.

**Removed by this change:**

- The `refused` outcome of `landFailedRecord` that only kept the record in the book and exited 10 when `dev` refuses the push and the PR path works. Exit 10 now means both the `dev` push and the PR path failed (owner decision, 2026-11-17, v6.3 run; goes into the 6.3.0 release notes at release time).
- The hard-coded `docs({fid}): ship DONE` PR title and the hard-coded `ship-close/{fid}` branch inside `closePr`; both become inputs.

**Related Issues:**

- #811 — publish a refused ship FAILED flush through a PR (the issue this plan converts)
- #345 — Failures triage (tracker, stays open)

**Where the code is today** (the issue's line numbers are old), all in `.bkit/core/engine/commands/workflow/workflows.ts`: `landFailedRecord` near line 718 with its `refused` case near 794; `closePr` near 1434 with the hard-coded title near 1452; `shipClose` near 1480 passes the `refused` handler to `pushToDev` (`.bkit/core/engine/commands/land.ts:221`). Tests: `.bkit/core/engine/commands/workflow/workflows.test.ts`.

**Settled open assumption (read from the code).** `landFailedRecord` has two callers in `handoverVerb`: `--push` when the checkout is shared (`dev`, `main` or detached; any workflow: design, plan, build, debug) and `--flush` (ship only; `--flush` refuses any other workflow). The issue's assumption that `--push` with `shared` gets the same fallback is rejected: the issue's own success criterion says `handover --push` from the other workflows behaves as before, the existing test "--push on dev refused keeps the record in the checkout and exits 10" asserts exit 10 for a build run, and a `ship-failed/{fid}` PR titled "ship FAILED" for a build or debug record would be wrong. So `landFailedRecord` takes a flag, set by the `--flush` call only.

**Branch name:** `ship-failed/{fid}` (the issue's recommendation), so a later DONE close on `ship-close/{fid}` never collides with an open FAILED PR.

**Not changed:** `.bkit/core/workflows/bkit-ship.md`. Its Failure Path step 5 says "**If** the push failed → do not claim success", which stays right (exit 10 now means both paths failed), and it never describes the refused outcome. `summary.ts`, `branches.ts`, `step-base.ts`, `tests-changed.ts`, `ledgers.ts`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`, `package.json` and everything under `scripts/gate/` are edited by other builds and stay untouched. The text ceiling is never raised: the prose edits below replace lines at the same length or shorter, and a ceiling finding is proved by reading the code or by a test, not by running the raise command.

**Known limit, proposed separately (not built here):** a `--flush` from a shared checkout whose FAILED record lands through a PR returns no `sha`, so the carried files are not handed back to that checkout (`handBack` needs the landed commit). `--flush` runs in the ship feature worktree (not shared) in the Failure Path, and `shipClose` leaves its book the same way; a follow-up can hand back after a merged PR.

---

### Narrative

A ship run fails after merge on a cloud runner whose `dev` is protected. The Failure Path flush still publishes the FAILED record, through a PR to `dev`, instead of losing it with the machine.

### Success Criteria

- A `--flush` that `dev` refuses publishes the FAILED record through a PR to `dev` and reports `pushed: true` with that branch (`ship-failed/{fid}`) as `ref`.
- The PR's title says ship FAILED, not ship DONE.
- When the PR path also fails, the record stays in the book, the command still exits 10, and the log names both failures.
- `handover --push` from the other workflows behaves as before.

## Where it fits

- Group 1: The FAILED flush gets the close's PR fallback — this group
  - TASK 1: Let `closePr` take the PR title and branch, and lift the test `gh` stub to file scope — done
  - TASK 2: Publish a refused `--flush` FAILED record through the PR path — open
- Group 2: Docs match the new behaviour — next
  - TASK 3: Rewrite the lines about a refused FAILED flush in the workflows doc source — open
  - TASK 4: Update the testing and deployments docs for the refused flush — open

## The work

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Publish a refused `--flush` FAILED record through the PR path
  - **UPDATE:** `landFailedRecord` in `.bkit/core/engine/commands/workflow/workflows.ts`: add `viaPr`; with it, pass `pushToDev` a `refused` handler that calls `closePr` (`ship-failed/{fid}`, title `chore({fid}): {workflow} FAILED`, subject `chore({fid}): {workflow} FAILED bkit [skip ci]`); in the `refused` case return `{ code: EXIT.OK, pushed: true, ref: branch }` for a merged or open PR, and `stop(EXIT_PUSH_FAILED, ...)` naming both the dev refusal and the PR failure when the PR path failed; without `viaPr` the case is unchanged
  - **UPDATE:** `handoverVerb` in `.bkit/core/engine/commands/workflow/workflows.ts`: pass `viaPr: true` from the `--flush` call and `viaPr: false` from the `--push` shared call
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: the test "--flush refused by dev keeps the record in the book and exits 10" becomes the PR-path-fails case (its hook refuses every ref, so the branch push fails); two new tests in the `bkit workflows handover` describe using the lifted `gh` stub with head `ship-failed/12-export-csv` and a hook refusing only `refs/heads/dev`
  - **READ:** `pushToDev` in `.bkit/core/engine/commands/land.ts`: the `refused` handler runs on the built commit before the `refused` result returns
  - **READ:** `docs/testing.md`: § Which tier does a behaviour need? and § Test first for the tiers and naming
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a refused `--flush` against a test remote with a `pre-receive` hook lands the record on `ship-failed/{FID}` through a PR (`pushed: true`, `ref` = that branch, exit 0, `pr create` titled `chore(12-export-csv): ship FAILED`); with the PR path failing it exits 10, keeps the record in the book, and the log holds both the dev refusal and the PR failure; "--push on dev refused keeps the record in the checkout and exits 10" still passes unchanged; all three matrix tests pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev publishes the FAILED record through a PR` fails on the flush exiting "10" with `pushed: false` instead of exit 0 with `ref` `ship-failed/12-export-csv`
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev with the PR path failing keeps the record and exits 10` fails on the log holding only "dev refused the push" and no second reason for the failed branch push
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `closePr titles the PR by the record it carries` fails on no `pr create` call carrying the title "chore(12-export-csv): ship FAILED" (the flush never calls `gh`)

<!-- bkit:task 2 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| --flush refused by dev publishes the FAILED record through a PR | Integration | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 2 |
| --flush refused by dev with the PR path failing keeps the record and exits 10 | Integration | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 2 |
| closePr titles the PR by the record it carries | Integration | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 2 |
