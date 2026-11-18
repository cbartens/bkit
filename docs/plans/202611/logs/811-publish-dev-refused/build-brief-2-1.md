# Brief: group 2 — Docs match the new behaviour

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

- Group 1: The FAILED flush gets the close's PR fallback — done
  - TASK 1: Let `closePr` take the PR title and branch, and lift the test `gh` stub to file scope — done
  - TASK 2: Publish a refused `--flush` FAILED record through the PR path — done
- Group 2: Docs match the new behaviour — this group
  - TASK 3: Rewrite the lines about a refused FAILED flush in the workflows doc source — open
  - TASK 4: Update the testing and deployments docs for the refused flush — open

## The work

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Rewrite the lines about a refused FAILED flush in the workflows doc source
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: line 132 (`--flush` / `--push` bullet: `--flush` refused → `ship-failed/{FID}` PR, record stays in the run's tree only when the PR path also fails; `--push` from a shared checkout still keeps the record in the tree), line 150 (the "refused → stays in the run's tree ... a refused record is lost" sentence: true only when the PR path also fails) and line 823 (Ship exception: refused → a `ship-failed/{FID}` PR; record stays in `BOOK_ROOT` only when that fails too); edit only these lines, each no longer than today
  - **READ:** `.agents/docs.md`: the index row for `.bkit/workflows.md`
  - **READ:** `.bkit/authoring.md`: § Which Sections Apply and § Before You Save, before the edit
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `grep -n 'ship-failed' .bkit/core/.bkit/workflows.md` shows the three lines; no sentence there says a refused `--flush` always keeps the record in the tree; `.bkit/core/workflows/bkit-ship.md` is unchanged
  - **TEST FIRST:** n/a — docs only (no behaviour change)

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Update the testing and deployments docs for the refused flush
  - **UPDATE:** `docs/testing.md`: the `commands/workflow/workflows.test.ts` row (line 826): replace "a refused push keeping the record in the book with exit 10" in the ship `--flush` clause with the PR path (a refused flush published through a `ship-failed/{FID}` PR, exit 10 only when the PR path fails too); edit only that clause
  - **UPDATE:** `docs/deployments.md`: § Autonomous phase-close prerequisites: one sentence saying a refused ship FAILED flush opens and merges a `ship-failed/{FID}` PR under the same two prerequisites
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `grep -n 'ship-failed' docs/testing.md docs/deployments.md` shows both edits; the `workflows.test.ts` row no longer says a refused flush only keeps the record
  - **TEST FIRST:** n/a — docs only (no behaviour change)

<!-- bkit:task 4 end -->

### Earlier tasks this group depends on

- TASK 2 (group 1, done): Publish a refused `--flush` FAILED record through the PR path — `.bkit/core/engine/commands/workflow/workflows.ts`, `.bkit/core/engine/commands/workflow/workflows.test.ts`
