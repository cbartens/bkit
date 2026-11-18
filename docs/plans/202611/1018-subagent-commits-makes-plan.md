# Subagent commits: make the changed-files and gaps-fix checks measure from the last step-done commit Implementation Plan

## Context & Goals

`bkit tests changed` defaults `--base` to `HEAD` (`tests-changed.ts`), and `bkit-build.md` Step 9 sub-step 5 and the holistic Step 10 sub-step 12 run `bkit branches scan-diff --base=HEAD~1 --code`. Both assume a subagent never commits. A subagent that does commit gets an empty changed set (lint and typecheck never run on its files) or a wrong range (a Decision Pause for a gaps fix that exists). Issue #1018 (finding C2 of #1012): both checks answer the same whether or not a subagent committed, because they measure from the commit that holds the previous `step-done` row of the active run, never from `HEAD` or `HEAD~1`.

Decided in the issue and not reopened: refusing a subagent commit outright and the `Commits` bullet in `.bkit/instructions.md` are out of scope; the four prompts that call `bkit tests changed` without `--base` get no edit; the existing run resolver `resolveActiveRun` in `.bkit/core/engine/commands/lib.ts` is used, no second one is added.

**Related Issues:**

- #1018 — Subagent commits make the changed-files and gaps-fix checks measure the wrong range (open)
- #1012 — Project Goals audit: where bkit falls short, and what to change (umbrella)

---

## Acceptance Scenario

### Narrative

A build subagent finishes its edits and either commits them or leaves them uncommitted. `bkit tests changed` lists the same files, and the gaps-fix check reports the same source change, in both cases.

### Success Criteria

- `bkit tests changed` with no `--base` lists the same files whether the subagent committed or not.
- It never lists files from the previous step's own commit.
- `bkit branches scan-diff --since-step=<step> --code` exits the same whether the fix was committed by the subagent or left for `steps finish` to commit.
- No `--base=HEAD~1` literal is left in `.bkit/core/workflows/bkit-build.md`.
- No `bkit tests changed` call in a prompt needs an edit.

### Process Sketch

- **WHEN** a subagent edits `src/a.ts` and runs `bkit tests changed` uncommitted **→ THEN** `src/a.ts` is in the changed set.
- **WHEN** the subagent committed `src/a.ts` first **→ THEN** `src/a.ts` is in the changed set, and so is nothing from the previous step's commit.
- **IF** the run has no `step-done` row yet, or no active run is found **→ THEN** the base falls back to the run's `workflow-started` commit, else `HEAD`, with the choice logged.
- **WHEN** a gaps-fix step finished and its fix is in its own commit or in the finish commit **→ THEN** `scan-diff --since-step=build-plan-gaps-remediate --code` exits 0; a fix that changed only logs exits 1.

### Concrete Example

**Setup:** A scratch git repo with a run's `status.jsonl` holding a `workflow-started` row and one committed `step-done` row, and a tracked `src/a.ts`.

**Steps:**

1. Subagent edits `src/a.ts` and commits it → `bkit tests changed` lists `src/a.ts`.
2. Same edit left uncommitted → `bkit tests changed` lists `src/a.ts`.

**Outcome:** Both runs print the same changed set.

### Edge Cases

- The previous step's own commit touched `src/b.ts`: `src/b.ts` is not listed.
- The previous `step-done` row was written with `--commit=none` (no commit holds it): the base is that row's `parentSha`.
- An explicit `--base` still wins over the run's base.

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `stepBase` returns the commit that holds the last `step-done` row of the active run | unit | `.bkit/core/engine/commands/workflow/step-base.test.ts` | 1 |
| `stepBase` with a step name returns the commit of the `step-done` row before that step's latest row | unit | `.bkit/core/engine/commands/workflow/step-base.test.ts` | 1 |
| `stepBase` returns the run start commit when no `step-done` row exists, and null with no run | unit | `.bkit/core/engine/commands/workflow/step-base.test.ts` | 1 |
| `tests changed` with no `--base` lists a file the subagent committed after the last step-done commit | unit | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` | 2 |
| `tests changed` with no `--base` lists the same file when it is left uncommitted | unit | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` | 2 |
| `tests changed` with no `--base` leaves out a file only the previous step's own commit touched | unit | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` | 2 |
| `scan-diff --since-step --code` exits 0 when the subagent committed its source fix before `steps finish` | unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 3 |
| `scan-diff --since-step --code` exits 0 when the fix was left uncommitted and `steps finish` committed it | unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 3 |
| `scan-diff --since-step --code` exits 1 when the step changed only logs, committed or not | unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 3 |
| `bkit-build.md` holds no `--base=HEAD~1` and both gaps-fix checks use `--since-step` | unit (markdown-invariant) | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 4 |
| lists the subagent's committed file when another feature's run is also in progress | Unit | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` | 6 |
| with no file on a feat/{FID} branch, picks that FID's run when another run is in progress | Unit | `.bkit/core/engine/commands/workflow/step-base.test.ts` | 6 |
| scan-diff --since-step --code exits 0 when a refused finish wrote a takeover row after the subagent committed its fix | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 7 |
| skips a build-takeover row written inside the step it measures | Unit | `.bkit/core/engine/commands/workflow/step-base.test.ts` | 7 |
| on an in-place shared-branch run leaves out a file another agent committed after the last step-done commit | Unit | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` | 8 |
| lists the subagent's committed file on an adopted branch when another feature's run is also in progress | Unit | `.bkit/core/engine/commands/workflow/tests-changed.test.ts` | 9 |
| with no file on a branch that is not feat/{FID}, picks the run this branch started when another run is in progress | Unit | `.bkit/core/engine/commands/workflow/step-base.test.ts` | 9 |

---

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | yes — engine verbs under `commands/workflow/` and the `status.jsonl` event log | `docs/architecture.md` (index row read; engine and ledger sections) | covered | None. |
| technology | `docs/technology.md` | yes — TypeScript engine, Vitest naming, `pnpm build` and `dist/` | `docs/technology.md` (Testing, Build sections) | covered | None. |
| security | `docs/security.md` | no — no route, secret or user input; the change reads git history and a local ledger | `docs/security.md` (checked, nothing to change) | covered | None. |
| testing | `docs/testing.md` | yes — real-git scratch-repo tests, test inventory rows for both test files | `docs/testing.md` line 815 (`tests-changed.test.ts` row), line 829 (`branches.test.ts` row), § Test first | covered | None. |
| data-schema | `docs/data-schema.md` | no — no database | none | none | Not applicable: no database change. |
| design | `docs/design.md` | no — no UI | none | none | Not applicable: no UI. |
| observability | `docs/observability.md` | no — no logging pipeline change | none | none | Not applicable: only a log line on a fallback. |
| deployments | `docs/deployments.md` | no — no release or CI change | none | none | Not applicable: no release or CI change. |

## Documentation Warnings

None

## Data Schema Integration

None — no database.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Default `--base` of `bkit tests changed` | `.bkit/core/engine/commands/workflow/tests-changed.ts` | `rg -n 'HEAD' tests-changed.ts`, `rg -n 'never commit or uncommitted files only' .bkit/core docs/testing.md` | `.bkit/core/engine/commands/workflow/tests-changed.ts` — owns the `HEAD` default, the flag help and `changedFiles` | EXTEND | Take the default from the new base resolver; fix the flag help. |
| Gaps-fix source check range | `.bkit/core/engine/commands/workflow/branches.ts` | `rg -n 'scan-diff' branches.ts`, `rg -n 'defaultRange' .bkit/core/engine/commands/workflow/` | `scanDiffVerb` in `.bkit/core/engine/commands/workflow/branches.ts` — has `--base` and the feature-base default, no step-relative range | EXTEND | Add `--since-step` and `--file` flags that set the base from the new resolver. |
| The two `--base=HEAD~1` calls | `.bkit/core/workflows/bkit-build.md` | `rg -n 'HEAD~1 or scan-diff' .bkit/core/workflows/bkit-build.md` | `.bkit/core/workflows/bkit-build.md` — Step 9 sub-step 5 and Step 10 sub-step 12 | EXTEND | Replace the literal with `--since-step=build-plan-gaps-remediate --file="{STATUS}"` and `--since-step=build-plan-gaps-remediate-holistic --file="{STATUS}"`. |
| Base commit of the step's last `step-done` row | `.bkit/core/engine/commands/workflow/step-base.ts` | `rg -n 'step-done' .bkit/core/engine/commands/workflow/*.ts` filtered on last / latest / previous, `rg -n 'resolveActiveRun or activeRunStart or readStatusRows' .bkit/core/engine`, `.bkit/core/engine/commands/workflow/feature-base.ts` | `resolveActiveRun` in `.bkit/core/engine/commands/lib.ts` and `readStatusRows` in `status.ts` find the run and its rows (reused, not copied); `activeRunStart` in `counters.ts` returns only the `workflow-started` row; `featureBase` in `feature-base.ts` returns the feature's start, not a step's | NEW | Reason (a): no function maps a step-done row to the commit that holds it. `feature-base.ts` cannot take it (extending breaks its no-import-cycle contract: `status.ts` imports it and the helper must import `status.ts`). |
| Tests for the base resolver | `.bkit/core/engine/commands/workflow/step-base.test.ts` | `ls .bkit/core/engine/commands/workflow/*.test.ts` | None — no test covers the new module | NEW | Reason (a): the module is new, so its tests are. |
| Tests for the two checks | `.bkit/core/engine/commands/workflow/tests-changed.test.ts`, `.bkit/core/engine/commands/workflow/branches.test.ts`, `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | `rg -n 'describe\(' tests-changed.test.ts`, `rg -n 'branches scan-diff' branches.test.ts workflow-shape.test.ts` | the three files — real-git scratch-repo suites and markdown invariants for these verbs and workflow | EXTEND | Add the cases to the existing `tests changed` and `branches scan-diff` describes, and one invariant to `workflow-shape.test.ts`. |
| Docs and CLI catalogue | `docs/testing.md`, `.bkit/core/.bkit/cli.md` | `rg -n 'tests-changed.test or branches.test' docs/testing.md`, `rg -n 'scan-diff' .bkit/core/.bkit/cli.md` | `docs/testing.md` rows for both test files; `.bkit/core/.bkit/cli.md` scan-diff row | EXTEND | Update the rows to match the new tests and flag. |

## Architecture & Component Changes

- **[NEW]** `.bkit/core/engine/commands/workflow/step-base.ts` — `stepBase`: from the active run's `status.jsonl`, the commit that holds a `step-done` row (found by the row's `at` through `git log -S` on the status file), else that row's `parentSha`; with a step name, the row before that step's latest row. Run found with `resolveActiveRun`; rows read with `readStatusRows`. Reason: Reuse Inventory (a).
- **[MODIFY]** `.bkit/core/engine/commands/workflow/tests-changed.ts` — default `base` from `stepBase` (logged), explicit `--base` wins; drop the comment and help text that rest on "agent steps never commit".
- **[MODIFY]** `.bkit/core/engine/commands/workflow/branches.ts` — `scan-diff` gains `--since-step=<step>` and `--file`.
- **[MODIFY]** `.bkit/core/workflows/bkit-build.md` — the two `--base=HEAD~1` calls.

## Supersession Inventory

<!-- prettier-ignore -->
| Removed | Where | Replaced by |
| --- | --- | --- |
| `--base=HEAD~1` literal (Step 9 sub-step 5) | `.bkit/core/workflows/bkit-build.md` | `--since-step=build-plan-gaps-remediate --file="{STATUS}"` |
| `--base=HEAD~1` literal (Step 10 sub-step 12) | `.bkit/core/workflows/bkit-build.md` | `--since-step=build-plan-gaps-remediate-holistic --file="{STATUS}"` |
| "default HEAD: uncommitted files only" help text and the "agent steps never commit" comment | `.bkit/core/engine/commands/workflow/tests-changed.ts` | help text naming the run's last step-done commit |

## Documentation Updates

- `docs/testing.md`: the `tests-changed.test.ts` and `branches.test.ts` inventory rows name the new cases.
- `.bkit/core/.bkit/cli.md`: the `scan-diff` row lists `--since-step` and `--file`.

## Rollback Strategy

Code-only — `git revert` sufficient.

## Agent Execution Runbook

Before editing `.bkit/core/workflows/bkit-build.md`, run `pnpm instructions:show --file bkit-build.md` and follow `.bkit/authoring.md` § Which Sections Apply and § Before You Save.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Base resolver and the two engine checks

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Add `stepBase`, the resolver of the commit a run's last step began after
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

- [x] **TASK 2:** Make `bkit tests changed` default its base to the run's last step-done commit
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

- [x] **TASK 3:** Add `--since-step` to `bkit branches scan-diff`
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

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Workflow calls, docs and mirrors

<!-- bkit:task 4 start -->

- [x] **TASK 4:** Point both gaps-fix source checks in `bkit-build.md` at `--since-step`
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: Step 9 sub-step 5 becomes `"{BKIT}" branches scan-diff --since-step=build-plan-gaps-remediate --file="{STATUS}" --code >/dev/null`; Step 10 sub-step 12 the same with `--since-step=build-plan-gaps-remediate-holistic`; no `--base=HEAD~1` literal is left
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the markdown invariant
  - **READ:** `.bkit/instructions.md`: shared clauses touching these lines (`pnpm instructions:show --file bkit-build.md`)
  - **READ:** `.bkit/authoring.md`: § Which Sections Apply, § Before You Save
  - **UPDATE:** `.bkit/workflows.md`: no edit unless the Step 9 or Step 10 row describes the range; index stays accurate (`.bkit/core/.bkit/workflows.md` is the source)
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `rg -n 'HEAD~1' .bkit/core/workflows/bkit-build.md` finds nothing, both calls carry `--since-step` and `--file="{STATUS}"`, and the `workflow-shape.test.ts` invariant passes along with the workflow fence-syntax audit
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `bkit-build gaps-fix source checks measure from the previous step, never HEAD~1` fails on "--base=HEAD~1" still being in `bkit-build.md`

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [x] **TASK 5:** Update the docs and re-render the mirrors and `dist/`
  - **UPDATE:** `docs/testing.md`: the `tests-changed.test.ts` row (line 815) and the `branches.test.ts` row (line 829) name the new cases; the Changed files bullet (line 572) says `bkit tests changed` measures from the run's last step-done commit
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: the `scan-diff` row lists `--since-step` and `--file`
  - **READ:** `.bkit/authoring.md`: § Docs
  - **READ:** `.agents/docs.md`: the index stays accurate (no new doc)
  - **DEPENDS ON:** 2, 4
  - **DONE WHEN:** the docs name the new behaviour; `pnpm build` has refreshed `dist/`; `pnpm tsx .bkit/core/engine/cli.ts upgrade` has re-rendered the installed copies; `bkit check` reports no drift; the full unit suite passes
  - **TEST FIRST:** n/a — docs, a regenerated `dist/` and re-rendered mirrors; no behaviour change (the behaviour tests are in tasks 1 to 4)

<!-- bkit:task 5 end -->

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Challenge round 1 findings

<!-- bkit:task 6 start -->

- [x] **TASK 6:** A subagent commits its edit in a feature worktree whose tree also carries another feature's in-progress run, and `bkit tests changed` still lists nothing, so lint and typecheck never run on its files
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/step-base.ts:37` · **Round:** 1
  - **DONE WHEN:** With no `--file`, `stepBase` resolves the run of the checkout's own FID (its `feat/{FID}` branch, passed to `resolveActiveRun` as `fid`) before it falls back to the single in-progress run, so another feature's in-progress run in the tree no longer makes `bkit tests changed` measure from `HEAD`; the existing planned tests still pass unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-changed.test.ts` `lists the subagent's committed file when another feature's run is also in progress` fails on `files` being `[]` instead of `["src/a.ts"]`: on branch `feat/1-x`, a second committed `docs/plans/202611/logs/2-y/status.jsonl` holding only a `workflow-started` row makes `resolveActiveRun` find two in-progress runs, so `stepBase` returns null and the base is `HEAD`
    - `.bkit/core/engine/commands/workflow/step-base.test.ts` `with no file on a feat/{FID} branch, picks that FID's run when another run is in progress` fails on `stepBase({ cwd })` returning null instead of the commit that holds run `1-x`'s last `step-done` row

<!-- bkit:task 6 end -->
<!-- bkit:task 7 start -->

- [x] **TASK 7:** A gaps-fix subagent commits its source fix, its first `steps finish` refuses a contradicted planned-test edit and writes a `build-takeover` row stamped with the post-fix `HEAD`, and `scan-diff --since-step` then measures from after the fix, exits 1 and sends the run to a needless Decision Pause
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/step-base.ts:45` · **Round:** 1
  - **DONE WHEN:** `stepBase` skips the `build-takeover` rows (`TAKEOVER_STEP`, which a refused `steps finish` writes inside the step being measured) when it picks the prior `step-done` row, so `scan-diff --since-step` and `tests changed` measure from the row before the step began whether the subagent committed before the refusal or not.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff --since-step --code exits 0 when a refused finish wrote a takeover row after the subagent committed its fix` fails on exit 1 and `{ found: false, paths: [] }`: after `runWithEarlierStep`, commit `src/fix.ts`, append an uncommitted `build-takeover` row (`uncommitted: true`, `parentSha` = the fix commit), then `finish`; the prior row is the takeover row, so the base is the fix commit and only `status.jsonl` (excluded) is in range
    - `.bkit/core/engine/commands/workflow/step-base.test.ts` `skips a build-takeover row written inside the step it measures` fails on `stepBase({ cwd, step: "build-plan-b" })` returning the takeover row's `parentSha` instead of the commit that holds the `build-plan-a` row

<!-- bkit:task 7 end -->
<!-- bkit:task 8 start -->

- [x] **TASK 8:** A debug run works in place on `dev` while another agent commits there (or `sync-dev` fast-forwards it), and `bkit tests changed` now lists every file those foreign commits touched, so the debug agent's gate fails on work it does not own and it is told every test must pass
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tests-changed.ts:209` · **Round:** 1
  - **DONE WHEN:** On a run that works in place on a shared branch (it has a shared-checkout record), `bkit tests changed` with no `--base` never lists a file that only a commit outside the run touched, for example by keeping the `HEAD` default there; feature-worktree runs keep the run-derived base.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-changed.test.ts` `on an in-place shared-branch run leaves out a file another agent committed after the last step-done commit` fails on `files` containing `src/foreign.ts`: a debug run in place on `dev` with a shared-checkout record and one committed `step-done` row, then a foreign commit of `src/foreign.ts` and an uncommitted edit to `src/a.ts`; the base is the step-done commit, so the foreign commit is in range

<!-- bkit:task 8 end -->
<!-- bkit:group 3 end -->

<!-- bkit:group 4 start -->

### TASK GROUP 4: Challenge round 2 findings

<!-- bkit:task 9 start -->

- [x] **TASK 9:** A build runs in a cloud runtime that adopts its session branch in place (`claude/...`, not `feat/{FID}`), the tree carries another feature's in-progress run from `dev`, a subagent commits its edit, and `bkit tests changed` still lists nothing, so lint and typecheck never run on its files
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/step-base.ts:47` · **Round:** 2
  - **DONE WHEN:** With no `--file`, `stepBase` finds the checkout's own run on a branch that is not `feat/{FID}` (an adopt-mode session branch, or a debug run's named `--branch`), for example the one in-progress run whose `status.jsonl` this branch's own commits or working tree changed, so another feature's in-progress run in the tree no longer makes `bkit tests changed` measure from `HEAD` there; the existing planned tests still pass unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests-changed.test.ts` `lists the subagent's committed file on an adopted branch when another feature's run is also in progress` fails on `files` being `[]` instead of `["src/a.ts"]`: on `dev` commit `docs/plans/202611/logs/2-y/status.jsonl` holding only a `workflow-started` row, branch `claude/session` from it, commit run `1-x`'s `workflow-started` row and one `step-done` row, then commit `src/a.ts`; `branchFid` is undefined, the scan finds two in-progress runs, so `stepBase` returns null and the base is `HEAD`
    - `.bkit/core/engine/commands/workflow/step-base.test.ts` `with no file on a branch that is not feat/{FID}, picks the run this branch started when another run is in progress` fails on `stepBase({ cwd })` returning null instead of the commit that holds run `1-x`'s last `step-done` row

<!-- bkit:task 9 end -->
<!-- bkit:group 4 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red, or as an `updated` existing test, before its code step ran. A later task that names an earlier task's test takes it over: the build reports the takeover and does not refuse it.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded, or a code step's `BLOCKED` line names the change for the owner.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in one task's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** the deepest declared `bkit:gate:*` script and `bkit check` pass.
- [ ] **Run all tests:** `pnpm test` passes.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** In a scratch repo with bkit installed and an in-progress build run, edit a source file, commit it, and run `bkit tests changed`; the file is listed.
