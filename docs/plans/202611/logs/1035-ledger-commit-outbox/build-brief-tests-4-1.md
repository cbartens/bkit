# Brief: group 4 — Challenge round 1 findings (tests)

Plan: Ledger commit and outbox files refuse bad paths and stay owner-only Implementation Plan

## Why and what

### Context & Goals

Issue #1035 (follow-up of #992). `bkit ledgers commit`, `bkit ledgers only-bookkeeping` and (added by the orchestrator's latest issue comment) `bkit decisions pending` pass `--month` / `--fid` to a git pathspec or a folder path unchecked, so a `--fid=../../../..` widens the bookkeeping allow-list to the whole tree. The invocation folder is created `0755`, a correction-events file made by an older bkit keeps `0644`, and a tracked `*.bkit-lock` that was deleted is never committed as deleted. Goal: one shared check for the `--month` / `--fid` flags in all three handlers, owner-only outbox files and folders, the lock deletion committed, the docs and the `CLOSED` deferral row.

**Related Issues:**

- #1035 — Ledger commit and outbox files refuse bad paths and stay owner-only (open)
- #992 — Ledger commands: six hardening gaps from the 860 review (follow-up of)

---

### Narrative

`bkit ledgers commit`, `bkit ledgers only-bookkeeping` and `bkit decisions pending` refuse a `--month` that is not six digits and a `--fid` that is not a lowercase slug before git or the file system is touched. The invocation folder is `0700`, a correction-events file is `0600` after every write, and a bookkeeping commit stages the deletion of a tracked `*.bkit-lock`.

### Success Criteria

- `commit` and `only-bookkeeping` exit 2 naming the flag when `--month` is not `/^[0-9]{6}$/` or `--fid` does not match `FID_PATTERNS.none`, and stage, commit or diff nothing.
- `decisions pending` exits 2 on a `--fid` that does not match `FID_PATTERNS.none`, through the same helper.
- `writeInvocation` leaves `invocation-context/` at `0700`, whether it created the folder or found it.
- After `correctionBook` runs, `<id>.corrections.jsonl` is `0600`, whether it created the file or found it.
- `commitBookkeeping` stages the deletion of a tracked `*.bkit-lock` under the allow-list and still never stages an untracked or changed one; the deferral `992-ledger-commands-six-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1273` has a `CLOSED` row.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Checking `--fid` in other verbs that take one (beyond `decisions pending`) | The issue limits the check to the three handlers | A follow-up proposal |
| Narrowing `bkit-outbox/` itself or any other outbox folder | Only `invocation-context/` is named | A follow-up proposal |
| Reclaiming a stale `*.bkit-lock` in `withTargetLock` | Only the deletion commit is named | A follow-up proposal |
| Any change to the replay code or to what a receipt stores; the rollback question | Owner's decision | `docs/decisions.jsonl`, by the owner |
| Any edit to `.bkit/instructions.md`, `.bkit/core/workflows/`, `.bkit/core/prompts/`, `steps.ts`, `branches.ts`, `step-base.ts`, `tests-changed.ts`, `package.json`, `scripts/gate/` | Run instructions: no workflow or prompt text changes | Other builds |

## Where it fits

- Group 1: Bookkeeping commands refuse bad paths and commit lock deletions — done
  - TASK 1: Refuse a `--month` or `--fid` that is not a plain folder name in `ledgers commit` and `ledgers only-bookkeeping` — done
  - TASK 2: Check `--fid` in `bkit decisions pending` through the same helper — done
  - TASK 3: Commit the deletion of a tracked lock file — done
- Group 2: Outbox files stay owner-only — done
  - TASK 4: Make `invocation-context/` owner-only — done
  - TASK 5: Keep a correction-events file `0600` when it already exists — done
- Group 3: Docs and ledgers — done
  - TASK 6: Say what the commands refuse and which folders are owner-only, and close the deferral — done
- Group 4: Challenge round 1 findings — this group
  - TASK 7: An in-place run on dev whose tracked lock was dirty when the run started and is deleted during it now stops its bookkeeping commit with exit 10 — open
  - TASK 8: A climbing `--fid=../../../..` passed to `bkit runs gate --validated`, `bkit runs revalidate` or `bkit workflows handover --push|--flush` still makes the merge gate treat a source change as bookkeeping-only, or sweeps the whole tree into a commit pushed to `dev`, because the new check guards three handlers and not the `checkOnlyBookkeeping` / `commitBookkeeping` sinks — open

## The work

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** An in-place run on dev whose tracked lock was dirty when the run started and is deleted during it now stops its bookkeeping commit with exit 10
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1322` · **Round:** 1
  - **DONE WHEN:** `commitBookkeeping` adds a deleted tracked `*.bkit-lock` to `paths` only when the run's record does not hold that path (or adds it after the `rec` filtering, never into the `among` list handed to `ownSet`), so the scenario commits the run's own rows with exit 0 and leaves the recorded lock uncommitted, as the base commit `47d0fd4ee` did.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a recorded tracked lock deleted during an in-place run does not refuse the bookkeeping commit` fails on exit 10 ("refusing to commit: ...status.jsonl.bkit-lock changed during the run but was already modified before it started"): in the describe for a run in place on dev that shares its checkout, commit `${LOGS}/status.jsonl` and an empty `${LOGS}/status.jsonl.bkit-lock` on `dev`, write `{"pid":1}` to the lock, call `writeRecord(r, newRecord(r, FID, "dev"))`, delete the lock, append a row to `status.jsonl`, run `commit --month=202610 --fid=650-shared --scope=core --mode=commit --message=x`, and expect exit 0, `status.jsonl` in `git show --name-only --format= HEAD` and the lock not in it.

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** A climbing `--fid=../../../..` passed to `bkit runs gate --validated`, `bkit runs revalidate` or `bkit workflows handover --push|--flush` still makes the merge gate treat a source change as bookkeeping-only, or sweeps the whole tree into a commit pushed to `dev`, because the new check guards three handlers and not the `checkOnlyBookkeeping` / `commitBookkeeping` sinks
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:2380` · **Round:** 1
  - **DONE WHEN:** Direction (option (a), decision 2): `commitBookkeeping` (`.bkit/core/engine/commands/workflow/ledgers.ts:1205`) and `checkOnlyBookkeeping` (`ledgers.ts:2380`) each run the shape check `monthAndFid` already holds before they touch git or build a pathspec, so every caller (`runs.ts`, `workflows.ts`, `branches.ts`, `ci.ts`, and the `ledgers` handlers) is covered from one place.
    - Reuse `monthAndFid`'s six-digit and `FID_PATTERNS.none` checks: split out the part that checks a `{ month, fid }` pair and call it from `monthAndFid` and from both functions. Add no second pattern and no second helper.
    - The only exemption is `month` = `*`, which the CI hook passes to `checkOnlyBookkeeping` (`.bkit/core/engine/commands/ci/ci.ts:828`). A `*` FID or any other month is refused.
    - A refused call throws `CommandError` with exit 2, its message names the bad value, and nothing is written: no commit, no index change, no ledger row.
    - Where a `ledgers` handler this build changed now gets the same refusal from the shared function, remove its own `monthAndFid` call. Keep a per-handler call only where the handler builds a path from `--month` or `--fid` before it reaches the shared function.
    - `monthAndFid`'s comment states what is true after the change.
    - The existing tests in `runs.test.ts`, `workflows.test.ts`, `branches.test.ts`, `ci.test.ts` and `ledgers.test.ts` still pass, including the issue-less FID cases.
    - The footprint stays `ledgers.ts`, `ledgers.test.ts`, `dist/` and any doc line that describes the check. If a caller's source file needs an edit, stop and report why instead of editing it.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `checkOnlyBookkeeping refuses a climbing fid from any caller` fails on `{ kind: "ok" }` being returned: it commits a base, commits a change to `src/a.ts`, calls `checkOnlyBookkeeping(r, { month: "202610", fid: "../../../..", from, to })` directly and expects a `CommandError` with code 2 whose message contains `../../../..`
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `commitBookkeeping refuses a climbing fid from any caller` fails on `src/app.ts` being committed: it commits `docs/plans/202608/logs/446-book/status.jsonl`, adds an untracked `src/app.ts`, calls `commitBookkeeping({ root: r, month: "202608", fid: "../../../..", scope: "core", mode: "commit", message: "climb" }, () => {})` directly and expects a `CommandError` with code 2 whose message contains `../../../..`, HEAD unchanged and nothing staged

<!-- bkit:task 8 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a --fid that climbs out of the log folder is refused and commits nothing | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| a --month that is not six digits is refused and commits nothing | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| only-bookkeeping refuses a wildcard or climbing --fid instead of passing a source change | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| a tracked *.bkit-lock that was removed is committed as a deletion by the bookkeeping commit | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 3 |
| a correction-events file left at 0644 is 0600 after a corrected append | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 5 |
| a recorded tracked lock deleted during an in-place run does not refuse the bookkeeping commit | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 7 |
| checkOnlyBookkeeping refuses a climbing fid from any caller | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 8 |
| commitBookkeeping refuses a climbing fid from any caller | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 8 |

## Deviations

New task from the v6.3 orchestrator session. Run `/bkit-build #1035 publish=false` for issue 1035 "Ledger commit and outbox files refuse bad paths and stay owner-only" (https://github.com/cbartens/bkit/issues/1035). It is a follow-up of the 992 build you did, so you know this code.

Where and how:
- Work from the main checkout `/Users/christian/Documents/GitHub/bkit` on branch `dev` (currently `47d0fd4ee`, 7 commits ahead of `origin/dev`, not pushed). The build makes its own worktree under `.worktrees/`. Never push, never touch `main`, never run `/bkit-ship` or `/bkit-debug`. The close is held (`publish=false`).
- Read `.agents/rules.md` first and follow it.

Scope (the issue body has ready task blocks, 5 tasks in 3 groups):
- `.bkit/core/engine/commands/workflow/ledgers.ts` and `ledgers.test.ts`, `.bkit/core/engine/ledgers/status.ts`, `.bkit/core/engine/commands/lib.ts` and `lib.test.ts`, `docs/security.md`, `docs/observability.md`, `docs/testing.md`, one `CLOSED` deferral row.
- One addition from the orchestrator (see the latest comment on the issue): apply the same `--fid` check to `bkit decisions pending` at `.bkit/core/engine/commands/workflow/decisions.ts:689`, through the same helper, with one test. The issue body lists this as out of scope; the owner prefers found work to be fixed where it fits, so treat it as in scope. One helper for all three handlers, never a second way to check a FID flag.
- In `.bkit/core/.bkit/workflows.md` change only the bookkeeping-pathspec bullet the issue names (line 147 area). Another running build (1018) changes other parts of that file. Do not touch `.bkit/instructions.md`, any file under `.bkit/core/workflows/` or `.bkit/core/prompts/`, `steps.ts`, `branches.ts`, `step-base.ts`, `tests-changed.ts`, `package.json`, or anything under `scripts/gate/`.
- The rollback question in the issue's "Open Questions" is the owner's and no task depends on it: do not settle it, do not write a decision row for it.

Size discipline:
- Removes: the bare `fs.mkdirSync(dir, { recursive: true })` in `writeInvocation` (one way to make a private folder, `privateDir`), and the unchecked `required(ctx, "month")` / `required(ctx, "fid")` reads in `commit` and `onlyBookkeeping`.
- This build should change no workflow or prompt text. If `pnpm bkit:text:ceiling check` ever fails, stop and message me. Never run `pnpm bkit:text:ceiling raise`.

Machine load (two other builds are running, 1018 and 819):
- Before any test gate, wait while the 1-minute load from `uptime` is above 6; start anyway after 15 minutes.
- A red gate whose only failures are timeouts: re-run once before treating it as a real failure. Never weaken or skip a test or lengthen a timeout.
- Give every subagent a 20-minute fallback timer. If one overruns, check its log; if it is only waiting on the machine-wide tests lock, wait; otherwise stop it and re-run once.

Decision Pauses:
- Where the pause offers a recommendation, take it as an orchestrator assumption and carry on.
- Stop and message me (do not guess) for: a pause with no recommendation, any question about a planned test (dropping, unlocking or rewriting one), anything needing a credential, anything touching `main` or a release, removing a worktree or branch by force.
- If a permission prompt is denied, do not try another route; stop and tell me.

When done: message me at the held close or at a Failure Path with the FID, the summary verdict, the path of `build-summary.md`, and any open finding above LOW.
