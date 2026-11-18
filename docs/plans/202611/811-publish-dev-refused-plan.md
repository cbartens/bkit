# Publish a refused ship FAILED flush through a PR Implementation Plan

## Context & Goals

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

## 👤 ⚠️ Acceptance Scenario

### Narrative

A ship run fails after merge on a cloud runner whose `dev` is protected. The Failure Path flush still publishes the FAILED record, through a PR to `dev`, instead of losing it with the machine.

### Success Criteria

- A `--flush` that `dev` refuses publishes the FAILED record through a PR to `dev` and reports `pushed: true` with that branch (`ship-failed/{fid}`) as `ref`.
- The PR's title says ship FAILED, not ship DONE.
- When the PR path also fails, the record stays in the book, the command still exits 10, and the log names both failures.
- `handover --push` from the other workflows behaves as before.

### Process Sketch

- **WHEN** `dev` accepts the flush push **→ THEN** it lands on `dev` as today; no PR.
- **WHEN** `dev` refuses and the PR opens and merges **→ THEN** `pushed: true`, `ref` = `ship-failed/{fid}`, exit 0.
- **WHEN** `dev` refuses and the PR opens but the merge fails **→ THEN** exit 0, the open PR named in the log (as `closePr` reports `close-pr-open`).
- **WHEN** `dev` refuses and the branch push or `gh pr create` fails **→ THEN** the record is kept in the book, exit 10, both reasons logged.
- **WHEN** there is no bookkeeping delta **→ THEN** `skipped: "nothing-to-commit"` as today.

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. Real temp git repos with a bare remote and a `pre-receive` hook; `gh` is a stub on `PATH`.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| --flush refused by dev publishes the FAILED record through a PR | Integration | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 2 |
| --flush refused by dev with the PR path failing keeps the record and exits 10 | Integration | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 2 |
| closePr titles the PR by the record it carries | Integration | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 2 |
| --flush refused by dev twice for one FID publishes the second record through a PR | Unit | `.bkit/core/engine/commands/workflow/workflows.test.ts` | 5 |

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

- `bkit workflows handover --flush` no longer exits 10 when `dev` refuses and the PR path works; callers that read exit 10 as "kept" still see it when both paths fail (owner-approved 2026-11-17; 6.3.0 release notes).
- New branch name `ship-failed/{fid}`; new PR title `chore({fid}): ship FAILED`.

- [ ] **Breaking Changes confirmed:** I have reviewed the breaking changes and names above.

---

## 👤 ⚠️ Open Questions & Assumptions

- Branch name: `ship-failed/{fid}` (settled; see Context & Goals).
- `handover --push` with `shared` set gets no fallback (settled; see Context & Goals).

- [ ] **Open Questions confirmed:** I have reviewed the questions and assumptions above.

---

## Documentation Consultation

Index read: `.agents/docs.md`.

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | yes — the flush is part of the workflow engine's bookkeeping landing | `docs/architecture.md` § Package Boundaries, § Deterministic bookkeeping | covered | None; no architecture line names the refused-flush outcome. |
| technology | `docs/technology.md` | yes — TypeScript engine and Vitest conventions | `docs/technology.md` § Runtime & Language, § Testing | covered | None. |
| security | `docs/security.md` | yes — the PR path pushes a branch and merges with the run's `gh` token | `docs/security.md` § Secrets Management, § Repository controls (`cbartens/bkit`) | covered | None; no new credential surface (same `gh` as `closePr`). |
| testing | `docs/testing.md` | yes — new integration tests, and the ship flush coverage row | `docs/testing.md` § Which tier does a behaviour need?, § Test first; row for `commands/workflow/workflows.test.ts` (line 826) | covered | Update the row's flush clause (Task 4). |
| data-schema | `docs/data-schema.md` | no — no database | none | none | Not applicable. |
| design | `docs/design.md` | no — no UI | none | none | Not applicable. |
| observability | `docs/observability.md` | no — the change only adds `ctx.log` lines on the existing stderr log, no new log names, spans or drains | none | none | Not applicable. |
| deployments | `docs/deployments.md` | yes — branch-protection behaviour of a PR fallback | `docs/deployments.md` § Autonomous phase-close prerequisites | covered | Name the ship FAILED flush among the PR fallbacks (Task 4). |
| noise | `docs/noise.md` | no — no signal downgrade | none | none | Not applicable. |
| setup | `docs/setup.md` | no — no local setup change | none | none | Not applicable. |

## Documentation Warnings

None

## Data Schema Integration

None — no database. The change reads and writes only git state and the run's `status.jsonl` book.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| PR fallback for a refused `dev` push, with a caller-chosen title and branch | `.bkit/core/engine/commands/workflow/workflows.ts` | `grep -n 'closePr\|pushToDev\|landFailedRecord\|ship-close' .bkit/core/engine/commands/workflow/workflows.ts`; `grep -rn 'refused?' .bkit/core/engine/commands/land.ts`; references to `closePr` | `closePr` (opens `ship-close/{fid}` PR titled ship DONE and merges it), `pushToDev` `refused` hook | EXTEND | `closePr` gains `title` and `branch` inputs; `landFailedRecord` passes a `refused` handler to `pushToDev` that calls it. No second PR helper. |
| Refused-flush test setup (a `gh` stub and a PATH wrapper) | `.bkit/core/engine/commands/workflow/workflows.test.ts` | `grep -n 'withGh\|refusedDev\|pre-receive' .bkit/core/engine/commands/workflow/workflows.test.ts` | `refusedDev` (stub `gh`, hard-coded head `ship-close/{FID}`) and `withGh` inside the `close PR` describe | EXTEND | Lift the stub builder and `withGh` to file scope with the head branch as a parameter; `refusedDev` and the new flush tests both use them. |

## Architecture & Component Changes

**Ledger rows:** None

### Workflow engine (`.bkit/core/engine/commands/workflow/workflows.ts`)

- [MODIFY] `closePr`: takes `{ title, branch, subject }` instead of the hard-coded title and `ship-close/{fid}`; its log and failure messages name the branch and keep "not merged".
- [MODIFY] `shipClose`: passes `title` `docs({fid}): ship DONE`, `branch` `ship-close/{fid}`, `subject` as today.
- [MODIFY] `landFailedRecord`: new `viaPr` option; when set, passes a `refused` handler to `pushToDev` that calls `closePr` with title `chore({fid}): {workflow} FAILED`, branch `ship-failed/{fid}`, subject `chore({fid}): {workflow} FAILED bkit [skip ci]`; a merged or open PR returns `code` 0, `pushed` true, `ref` the branch; a failed PR path returns exit 10 with both reasons in the log.
- [MODIFY] `handoverVerb`: the `--flush` call passes `viaPr: true`; the `--push` shared call passes `viaPr: false`.

### Tests (`.bkit/core/engine/commands/workflow/workflows.test.ts`)

- [MODIFY] shared `gh` stub and `withGh` lifted to file scope; "--flush refused by dev keeps the record in the book and exits 10" becomes the PR-path-fails case; two new tests.

### Docs

- [MODIFY] `.bkit/core/.bkit/workflows.md` (the lines about the refused flush), `docs/testing.md` (the `workflows.test.ts` row's flush clause), `docs/deployments.md` (one sentence in § Autonomous phase-close prerequisites). The rendered `.bkit/workflows.md` regenerates in the orchestrator's end-of-session batch install.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: The FAILED flush gets the close's PR fallback

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Let `closePr` take the PR title and branch, and lift the test `gh` stub to file scope
  - **UPDATE:** `closePr` in `.bkit/core/engine/commands/workflow/workflows.ts`: take `{ title, branch, subject }` instead of the hard-coded `docs({fid}): ship DONE` title and `ship-close/{fid}` branch; name the branch in its failure and "opened but not merged" log lines, keeping "not merged"
  - **UPDATE:** `shipClose` in `.bkit/core/engine/commands/workflow/workflows.ts`: pass the DONE title, the `ship-close/{fid}` branch and the existing `subject`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: lift the `gh` stub builder (head branch as a parameter) and `withGh` out of the `close PR (dev refused the push)` describe to file scope; add a `--title` assertion to "closePr with base dev still merges" (the `pr create` call carries `docs(12-export-csv): ship DONE`)
  - **DONE WHEN:** `closePr` has no hard-coded title or branch (`grep -n "ship DONE\`\|ship-close/\${fid}" `shows them only at the`shipClose` call and its doc comment); "closePr with base dev still merges" and "closePr refuses when the PR base is unknown" pass and the first asserts the DONE title
  - **TEST FIRST:** n/a — pure refactor of `closePr`'s inputs and of the test helper; behaviour is unchanged and the existing close PR tests (plus the added title assertion) cover it, so no test can fail first. The FAILED title and branch behaviour is tested in Task 2.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Publish a refused `--flush` FAILED record through the PR path
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

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Docs match the new behaviour

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Rewrite the lines about a refused FAILED flush in the workflows doc source
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: line 132 (`--flush` / `--push` bullet: `--flush` refused → `ship-failed/{FID}` PR, record stays in the run's tree only when the PR path also fails; `--push` from a shared checkout still keeps the record in the tree), line 150 (the "refused → stays in the run's tree ... a refused record is lost" sentence: true only when the PR path also fails) and line 823 (Ship exception: refused → a `ship-failed/{FID}` PR; record stays in `BOOK_ROOT` only when that fails too); edit only these lines, each no longer than today
  - **READ:** `.agents/docs.md`: the index row for `.bkit/workflows.md`
  - **READ:** `.bkit/authoring.md`: § Which Sections Apply and § Before You Save, before the edit
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `grep -n 'ship-failed' .bkit/core/.bkit/workflows.md` shows the three lines; no sentence there says a refused `--flush` always keeps the record in the tree; `.bkit/core/workflows/bkit-ship.md` is unchanged
  - **TEST FIRST:** n/a — docs only (no behaviour change)

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Update the testing and deployments docs for the refused flush
  - **UPDATE:** `docs/testing.md`: the `commands/workflow/workflows.test.ts` row (line 826): replace "a refused push keeping the record in the book with exit 10" in the ship `--flush` clause with the PR path (a refused flush published through a `ship-failed/{FID}` PR, exit 10 only when the PR path fails too); edit only that clause
  - **UPDATE:** `docs/deployments.md`: § Autonomous phase-close prerequisites: one sentence saying a refused ship FAILED flush opens and merges a `ship-failed/{FID}` PR under the same two prerequisites
  - **DEPENDS ON:** 2
  - **DONE WHEN:** `grep -n 'ship-failed' docs/testing.md docs/deployments.md` shows both edits; the `workflows.test.ts` row no longer says a refused flush only keeps the record
  - **TEST FIRST:** n/a — docs only (no behaviour change)

<!-- bkit:task 4 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Challenge round 1 findings

<!-- bkit:task 5 start -->

- [x] **TASK 5:** A second refused flush of one FID fails its branch push, because the first flush left `ship-failed/{FID}` on origin, so a cloud runner loses that record again — accepted by owner
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1495` · **Round:** 1
  - **DONE WHEN:** The owner decides how a refused flush publishes when origin already holds `ship-failed/{FID}`. That happens after an open PR whose merge failed, after a branch push whose `gh pr create` failed, or after a merged head that was not deleted. The options are to update the bkit-owned branch with a lease and reuse its open PR, or to mint a branch name per attempt. No agent can settle it, because a lease update is a force push that the repo's git rules forbid, and the plan fixes the branch name. Once decided, a second refused flush of one FID lands its record through a PR and exits 0.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev twice for one FID publishes the second record through a PR` fails on the second flush's `HEAD:refs/heads/ship-failed/12-export-csv` push being rejected as non-fast-forward (the first commit is not on `dev`), so it exits 10 with `close branch push failed for ship-failed/12-export-csv`
  - **TEST EXCEPTION:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev twice for one FID publishes the second record through a PR` fails on the second flush's `HEAD:refs/heads/ship-failed/12-export-csv` push being rejected as non-fast-forward (the first commit is not on `dev`), so it exits 10 with `close branch push failed for ship-failed/12-export-csv` — the task was accepted as a known limit at decision 1 with no fix built, so the test has no code to prove; the orchestrator's follow-up issue owns it (the brief's recommended Accept, taken on the owner's behalf) (owner, 2026-11-18)

<!-- bkit:task 5 end -->
<!-- bkit:group 3 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded, or a code step's `BLOCKED` line names the change for the owner.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in Task 2's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Update documentation:** Tasks 3 and 4 done.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every doc line named in Tasks 3 and 4 is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate (no row changes).
- [ ] **Gate 3 — Verified:** every box above is checked.

## Rollback Strategy

Code-only — `git revert` sufficient. The change adds a fallback to one verb and re-parameterises one helper; the only persisted artefact is a `ship-failed/{FID}` branch and PR on a remote, deletable by hand.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** the deepest declared `bkit:gate:*` script and `bkit check` pass.
- [ ] **Run `workflows.test.ts`:** the close PR tests, the `--flush` tests and "--push on dev refused keeps the record in the checkout and exits 10" pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof.
