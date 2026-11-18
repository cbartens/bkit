# Brief: group 3 — Docs and ledgers

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
- Group 3: Docs and ledgers — this group
  - TASK 6: Say what the commands refuse and which folders are owner-only, and close the deferral — open

## The work

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Say what the commands refuse and which folders are owner-only, and close the deferral
  - **UPDATE:** `docs/security.md`: § Workflow comment ownership, the invocation folder is owner-only (`0700`) as well as its files
  - **UPDATE:** `docs/observability.md`: § Bookkeeping effects and receipts, `invocation-context/` is a `0700` folder and `<id>.corrections.jsonl` is `0600`
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: only the bookkeeping-pathspec bullet at line 147 (`Host skill mirrors are in the --scope=full bookkeeping pathspec`): add that a tracked `*.bkit-lock` that was deleted is staged as a deletion, and an untracked or changed one never is
  - **UPDATE:** `docs/testing.md`: § Key test files, the `commands/workflow/ledgers.test.ts` row adds the `--month` / `--fid` refusal and the lock-deletion case, the `commands/lib.test.ts` row adds the folder mode, and the `commands/workflow/decisions.test.ts` row adds the `pending` `--fid` refusal
  - **UPDATE:** `docs/deferrals.jsonl`: one `CLOSED` row for key `992-ledger-commands-six-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1273`, written with `bkit ledgers append --ledger=deferrals`
  - **READ:** `.bkit/core/.bkit/jsonl.md`: § Write Idiom, for the row
  - **DEPENDS ON:** 1, 2, 3, 4, 5
  - **DONE WHEN:** the four docs and the workflows source carry the edits above, `docs/deferrals.jsonl` has a `CLOSED` row for that key, and `pnpm tsx .bkit/core/engine/cli.ts upgrade` has re-rendered `.bkit/workflows.md` with no other change to it
  - **TEST FIRST:** n/a — docs and ledger rows only, no behaviour change

<!-- bkit:task 6 end -->

### Earlier tasks this group depends on

- TASK 1 (group 1, done): Refuse a `--month` or `--fid` that is not a plain folder name in `ledgers commit` and `ledgers only-bookkeeping` — `.bkit/core/engine/commands/workflow/ledgers.ts`, `.bkit/core/engine/commands/workflow/ledgers.test.ts`
- TASK 2 (group 1, done): Check `--fid` in `bkit decisions pending` through the same helper — `.bkit/core/engine/commands/workflow/decisions.ts`, `.bkit/core/engine/commands/workflow/decisions.test.ts`
- TASK 3 (group 1, done): Commit the deletion of a tracked lock file — `.bkit/core/engine/commands/workflow/ledgers.ts`, `.bkit/core/engine/commands/workflow/ledgers.test.ts`
- TASK 4 (group 2, done): Make `invocation-context/` owner-only — `.bkit/core/engine/ledgers/status.ts`, `.bkit/core/engine/commands/lib.ts`, `.bkit/core/engine/commands/lib.test.ts`
- TASK 5 (group 2, done): Keep a correction-events file `0600` when it already exists — `.bkit/core/engine/commands/workflow/ledgers.ts`, `.bkit/core/engine/commands/workflow/ledgers.test.ts`

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Docs for the new refusals and modes | `docs/security.md` | `grep -n 'invocation' docs/security.md docs/observability.md`; `grep -n 'bkit-lock' .bkit/core/.bkit/workflows.md` | Existing sentences in `docs/security.md` line 66, `docs/observability.md` § Bookkeeping effects and receipts, `docs/testing.md` Key test files rows | EXTEND | Edit those sentences and rows in place; no new doc. |

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
