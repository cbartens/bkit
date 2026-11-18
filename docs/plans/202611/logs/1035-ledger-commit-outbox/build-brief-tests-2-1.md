# Brief: group 2 — Outbox files stay owner-only (tests)

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
- Group 2: Outbox files stay owner-only — this group
  - TASK 4: Make `invocation-context/` owner-only — open
  - TASK 5: Keep a correction-events file `0600` when it already exists — open
- Group 3: Docs and ledgers — next
  - TASK 6: Say what the commands refuse and which folders are owner-only, and close the deferral — open

## The work

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Make `invocation-context/` owner-only
  - **UPDATE:** `privateDir` in `.bkit/core/engine/ledgers/status.ts`: exported, and runs `chmodSync` on the file's parent folder to `0o700` after `mkdirSync`, so a folder that already existed is narrowed too
  - **UPDATE:** `writeInvocation` in `.bkit/core/engine/commands/lib.ts`: replaces `fs.mkdirSync(dir, { recursive: true })` with `privateDir(file)`, which removes the bare mkdir
  - **UPDATE:** `.bkit/core/engine/commands/lib.test.ts`: the two new cases, with the `writeInvocation` and `invocationDir` imports
  - **READ:** `ledgerOperationsFile` in `.bkit/core/engine/ledgers/status.ts`: it and the two appends there already call `privateDir`; the added `chmodSync` leaves their behaviour on a folder they created unchanged
  - **READ:** `docs/testing.md`: § Key test files, the `commands/lib.test.ts` row
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/lib.test.ts .bkit/core/engine/ledgers/journal.integration.test.ts` passes, `writeInvocation` holds no `fs.mkdirSync`, and `pnpm build && git add dist/` has run
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/lib.test.ts` `writeInvocation creates invocation-context owner-only` fails on `fs.statSync(invocationDir(r)).mode & 0o777` being "0o755": it calls `writeInvocation` in a temp git repo and expects `0o700`
    - `.bkit/core/engine/commands/lib.test.ts` `writeInvocation narrows an existing invocation-context to 0700` fails on the mode staying "0o755": it creates the folder with mode `0o755` first, calls `writeInvocation`, and expects `0o700`

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Keep a correction-events file `0600` when it already exists
  - **UPDATE:** `correctionBook` in `.bkit/core/engine/commands/workflow/ledgers.ts`: after `fs.appendFileSync(file, "", { mode: 0o600 })`, `fs.chmodSync(file, 0o600)`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.test.ts`: the new case in `describe("bkit ledgers append --invocation")`, next to `the correction-events file has mode 0600`
  - **READ:** `append` in `.bkit/core/engine/commands/workflow/ledgers.ts`: its later appends to the corrections file run after `correctionBook` in the same call, so they need no change
  - **READ:** `spendCorrection` in `.bkit/core/engine/commands/workflow/counters.ts`: it also appends after `correctionBook` in the same call, so it needs no change
  - **DEPENDS ON:** 3
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/ledgers.test.ts` passes, `the correction-events file has mode 0600` still passes, and `pnpm build && git add dist/` has run
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a correction-events file left at 0644 is 0600 after a corrected append` fails on the mode staying "0o644": it issues a standalone invocation, writes `.git/bkit-outbox/invocation-context/<id>.corrections.jsonl` with `chmodSync(..., 0o644)`, runs the refused append and the `--correction-of` retry, and expects mode `0o600` and the retry's `correction.used` = 1

<!-- bkit:task 5 end -->

### Earlier tasks this group depends on

- TASK 3 (group 1, done): Commit the deletion of a tracked lock file — `.bkit/core/engine/commands/workflow/ledgers.ts`, `.bkit/core/engine/commands/workflow/ledgers.test.ts`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| a --fid that climbs out of the log folder is refused and commits nothing | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| a --month that is not six digits is refused and commits nothing | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| only-bookkeeping refuses a wildcard or climbing --fid instead of passing a source change | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 1 |
| a tracked *.bkit-lock that was removed is committed as a deletion by the bookkeeping commit | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 3 |
| writeInvocation creates invocation-context owner-only | Unit | `.bkit/core/engine/commands/lib.test.ts` | 4 |
| writeInvocation narrows an existing invocation-context to 0700 | Unit | `.bkit/core/engine/commands/lib.test.ts` | 4 |
| a correction-events file left at 0644 is 0600 after a corrected append | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` | 5 |

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
