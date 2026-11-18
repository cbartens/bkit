## Session Prompt — this run's, newer than everything below

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

## Issue description — oldest

### Narrative

The review of #992 (Ledger commands: six hardening gaps from the 860 review, https://github.com/cbartens/bkit/issues/992) found four problems outside that change, plus one rollback question. Each was checked against the code on `dev` at `97359934d`.

**`--fid` and `--month` reach git pathspecs unchecked.** A pathspec is the pattern git uses to pick which files a command touches. `bookPathspecs` in `.bkit/core/engine/commands/workflow/ledgers.ts` (line 112) builds the bookkeeping allow-list, the set of files a bookkeeping commit may stage, and its first entry is `` `docs/plans/${month}/logs/${fid}/*` `` (line 119). The `commit` handler passes `--month` and `--fid` straight in (lines 1388-1389), and so does the `only-bookkeeping` handler (lines 2396-2397), with no check beyond "not empty". Git normalises `..` inside a pathspec, so `--fid=../../../..` turns that entry into `*`, which matches the whole tree. A probe in a scratch repo confirmed it: `git ls-files --others -- 'docs/plans/202611/logs/../../../../*'` listed `src/app.ts`. So `bkit ledgers commit --fid=../../../..` stages and commits every untracked and changed file, and `bkit ledgers only-bookkeeping` reports a source-code change as bookkeeping only, which is the check that lets a bookkeeping push skip CI. A `*` or `?` in either value widens the entry to every run's log folder as well. The same file already checks `--month` elsewhere (`.bkit/core/engine/commands/workflow/decisions.ts:688`, `/^[0-9]{6}$/`), and `.bkit/core/engine/commands/workflow/fids.ts:47` defines the FID shapes; `FID_PATTERNS.none` (`/^[a-z0-9][a-z0-9-]*$/`) accepts every FID shape the other trackers mint, and all 59 log folders under `docs/plans/*/logs/` match it.

**The invocation folder is created with the default mode.** `writeInvocation` in `.bkit/core/engine/commands/lib.ts` (line 664) creates `<git common dir>/bkit-outbox/invocation-context/` with `fs.mkdirSync(dir, { recursive: true })` (line 667), so the folder is `0755` under the usual umask (the permission mask a process starts with). The operations store creates its folders owner-only through `privateDir` in `.bkit/core/engine/ledgers/status.ts` (lines 728-730, `mode: 0o700`). The receipts inside are `0600` already (line 669), so the gap is that other local users can list the invocation ids.

**A correction-events file made by an older bkit keeps its wider mode.** `correctionBook` in `ledgers.ts` (line 1642) creates `<id>.corrections.jsonl` with `fs.appendFileSync(file, "", { mode: 0o600 })` (line 1653). Node applies `mode` only when the call creates the file, so a file that an older bkit created (`0644`, before `97359934d` added the mode) stays `0644`. The window is narrow: each standalone invocation id is minted fresh, so only an invocation issued before an upgrade and used after it is affected. The rows hold no secret, row body or token (`docs/observability.md` § Bookkeeping effects and receipts).

**A deleted lock file that git still tracks is never committed as deleted.** Every ledger write holds a `<file>.bkit-lock` file. `commitBookkeeping` lists the files to stage with `git ls-files --cached --others --exclude-standard -- <allow-list> ':(exclude,glob)**/*.bkit-lock'` (lines 1265-1274). The exclude also hides a tracked lock that is gone from the worktree, so its deletion is never staged. A lock that an older bkit committed comes back on every fresh checkout, and `withTargetLock` (`status.ts`) never reclaims a lock, so every append to that ledger waits 10 seconds and fails. This is the open deferral `992-ledger-commands-six-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1273`; this issue closes it. The `--stage-tracked-updates` path already stages it through `git add -u`; the default path does not.

**Rollback past `97359934d` breaks replay.** A receipt written since `97359934d` has no `detail.block`. `ledgerEffect` (`status.ts:736-748`) reads the block from the intent instead. The code before that commit returns `result(d, d.block, true)`, and `result` calls `receiptRows(block)`, which throws on `undefined`; `stage()` turns that into exit 4 "append failed" with nothing written. No code change in the new version can fix the old version, and writing `detail.block` again would undo #992's removal of the second copy. This is an open question below, not a task.

Once done, both commands refuse a `--month` that is not six digits and a `--fid` that is not a lowercase slug, before git runs; the invocation folder is `0700`; a correction-events file is `0600` after every write; and a bookkeeping commit stages the deletion of a tracked `*.bkit-lock` while still never staging an untracked or changed one.

### Success Criteria

- `bkit ledgers commit` and `bkit ledgers only-bookkeeping` exit 2 with a message naming the flag when `--month` does not match `/^[0-9]{6}$/` or `--fid` does not match `FID_PATTERNS.none`, and stage, commit or diff nothing.
- `writeInvocation` leaves `invocation-context/` at mode `0700`, whether it created the folder or found it.
- After `correctionBook` runs, `<id>.corrections.jsonl` is mode `0600`, whether it created the file or found it.
- `commitBookkeeping` stages and commits the deletion of a tracked `*.bkit-lock` under the allow-list that is missing from the worktree.
- `commitBookkeeping` still never stages an untracked `*.bkit-lock` or a change to a tracked one.
- The deferral `992-ledger-commands-six-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1273` has a `CLOSED` row.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `--fid=../../../..` on `commit` | Exit 2 naming `--fid`; HEAD and the index unchanged. |
| `--fid=*` or `--month=*` on `only-bookkeeping` | Exit 2 naming the flag; no `onlyBookkeeping` verdict printed. |
| `--month=2026-11` or `--month=20261` | Exit 2 naming `--month`. |
| `--fid=446l` or `--fid=992-ledger-commands-six` | Accepted, as today. |
| `--fid=ENG-12-x` (uppercase) | Exit 2: every tracker's FID is lowercase (`fids.ts:47-53`). |
| Internal callers that pass `"*"` on purpose (`minPushPathspecs` in `.bkit/core/engine/commands/ci/ci.ts:613`, `ci.ts:828`) | Unchanged: the check sits in the two CLI handlers, not in `bookPathspecs`. |
| `invocation-context/` already exists at `0755` | Set to `0700` on the next `writeInvocation`. |
| `bkit-outbox/` does not exist yet | Created by the same `mkdirSync`; `invocation-context/` ends `0700`. |
| `<id>.corrections.jsonl` already exists at `0644` | Set to `0600` by `correctionBook`; its rows kept. |
| A run-scoped invocation (`scope === "run"`) | No corrections file is created; the status file is untouched. |
| Tracked lock deleted, and `*.bkit-lock` is in `.gitignore` | Deletion staged and committed; the ignore rule does not block it. |
| Tracked lock still present and changed | Not staged, as today. |
| Untracked leftover lock | Not staged, as today (existing test). |
| Tracked lock deleted outside the allow-list | Not staged: only paths under `bookPathspecs` are listed. |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| a --fid that climbs out of the log folder is refused and commits nothing | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |
| a --month that is not six digits is refused and commits nothing | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |
| only-bookkeeping refuses a wildcard or climbing --fid instead of passing a source change | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |
| writeInvocation creates invocation-context owner-only | Unit | `.bkit/core/engine/commands/lib.test.ts` |
| writeInvocation narrows an existing invocation-context to 0700 | Unit | `.bkit/core/engine/commands/lib.test.ts` |
| a correction-events file left at 0644 is 0600 after a corrected append | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |
| a tracked *.bkit-lock that was removed is committed as a deletion by the bookkeeping commit | Unit | `.bkit/core/engine/commands/workflow/ledgers.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Bookkeeping commands refuse bad paths and commit lock deletions

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Refuse a `--month` or `--fid` that is not a plain folder name
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.ts`: one helper next to `required` (line 212) that returns `--month` and `--fid` after checking `--month` against `/^[0-9]{6}$/` and `--fid` against `FID_PATTERNS.none` from `./fids.js`, and throws `CommandError(EXIT.USAGE, ...)` naming the flag and the expected shape
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.ts`: `commit` (lines 1388-1389) and `onlyBookkeeping` (lines 2396-2397) read the two flags through that helper
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.ts`: `MONTH_FLAG` and `FID_FLAG` (lines 229-235) `help` text names the shapes
  - **READ:** `bookPathspecs` (line 112) stays unchecked, because `minPushPathspecs` (`.bkit/core/engine/commands/ci/ci.ts:613`) and the bookkeeping-push check (`ci.ts:828`) pass `"*"` on purpose
  - **READ:** `.bkit/core/engine/commands/workflow/fids.ts` imports: confirm importing `FID_PATTERNS` into `ledgers.ts` makes no import cycle
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/ledgers.test.ts` passes, every existing `commit` and `only-bookkeeping` case still passes, and `pnpm build && git add dist/` has run
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a --fid that climbs out of the log folder is refused and commits nothing` (inside `describe("bkit ledgers commit (tests/book-commit.bats)")`, line 80) fails on exit 0 and `src/app.ts` in `git show --name-only HEAD`. The test commits a ledger, adds an untracked `src/app.ts`, runs `commit --month=202608 --fid=../../../.. --scope=core --mode=commit`, and expects exit 2, the error naming `--fid`, and HEAD unchanged.
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a --month that is not six digits is refused and commits nothing` fails on exit 0. It runs `commit --month=* --fid=446-book` and expects exit 2 naming `--month` and HEAD unchanged.
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `only-bookkeeping refuses a wildcard or climbing --fid instead of passing a source change` (inside `describe("bkit ledgers only-bookkeeping")`, line 959) fails on exit 0 with `onlyBookkeeping: true`. It changes `src/a.ts` between `from` and `to`, runs the check with `--fid=../../../..`, and expects exit 2 naming `--fid`.
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Commit the deletion of a tracked lock file
  - **UPDATE:** `commitBookkeeping` in `.bkit/core/engine/commands/workflow/ledgers.ts`: after the `listed` call (lines 1265-1281), run `git ls-files -z --deleted -- <specs>` and join each listed path ending in `.bkit-lock` to `paths`, so the existing `git add --pathspec-from-file` stages its removal
  - **UPDATE:** `.bkit/core/engine/commands/workflow/ledgers.test.ts`: the new case next to `a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit` (line 233)
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/ledgers.test.ts` passes, the line-233 test still passes, and `pnpm build && git add dist/` has run
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a tracked *.bkit-lock that was removed is committed as a deletion by the bookkeeping commit` fails on `git ls-files -- '*.bkit-lock'` still listing `docs/plans/202608/logs/446l/status.jsonl.bkit-lock` after the commit. The test commits `status.jsonl` and `status.jsonl.bkit-lock` with `commitAll`, deletes the lock file, appends a row to `status.jsonl`, and runs `commit --month=202608 --fid=446l --scope=core --mode=commit`. It expects exit 0, the lock path listed with status `D` in `git show --name-status --format= HEAD`, and `git ls-files -- '*.bkit-lock'` empty.
<!-- bkit:task 2 end -->
<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->
### TASK GROUP 2: Outbox files stay owner-only

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Make `invocation-context/` owner-only
  - **UPDATE:** `.bkit/core/engine/ledgers/status.ts`: export `privateDir` (line 728) and make it `chmodSync` the file's parent folder to `0o700` after `mkdirSync`, so a folder that already existed is narrowed too
  - **UPDATE:** `writeInvocation` in `.bkit/core/engine/commands/lib.ts` (line 664): replaces `fs.mkdirSync(dir, { recursive: true })` (line 667) with `privateDir(file)`
  - **READ:** `ledgerOperationsFile` and the two appends in `status.ts` (lines 723, 828, 868) call `privateDir` already; the added `chmodSync` leaves their behaviour on a folder they created unchanged
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/lib.test.ts .bkit/core/engine/ledgers/journal.integration.test.ts` passes, and `pnpm build && git add dist/` has run
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/lib.test.ts` `writeInvocation creates invocation-context owner-only` fails on `fs.statSync(invocationDir(r)).mode & 0o777` being `0o755`. It calls `writeInvocation` in a temp git repo and expects `0o700`.
    - `.bkit/core/engine/commands/lib.test.ts` `writeInvocation narrows an existing invocation-context to 0700` fails on the mode staying `0o755`. It creates the folder with mode `0o755` first, calls `writeInvocation`, and expects `0o700`.
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Keep a correction-events file `0600` when it already exists
  - **UPDATE:** `correctionBook` in `.bkit/core/engine/commands/workflow/ledgers.ts` (line 1642): after `fs.appendFileSync(file, "", { mode: 0o600 })` (line 1653), `fs.chmodSync(file, 0o600)`
  - **READ:** the later appends to the same file in `append` (`ledgers.ts`, lines 2037 and 2070) and `spendCorrection` (`.bkit/core/engine/commands/workflow/counters.ts:233`) all run after `correctionBook` in the same call, so they need no change
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/workflow/ledgers.test.ts` passes, `the correction-events file has mode 0600` still passes, and `pnpm build && git add dist/` has run
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a correction-events file left at 0644 is 0600 after a corrected append` (inside `describe("bkit ledgers append --invocation")`, line 1822, next to `the correction-events file has mode 0600`) fails on the mode staying `0o644`. It issues a standalone invocation, writes `.git/bkit-outbox/invocation-context/<id>.corrections.jsonl` with `chmodSync(..., 0o644)`, runs the refused append and the `--correction-of` retry, and expects mode `0o600` and the retry's `correction.used` = 1.
<!-- bkit:task 4 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->
### TASK GROUP 3: Docs and ledgers

<!-- bkit:task 5 start -->
- [ ] **TASK 5:** Say what the commands refuse and which folders are owner-only, and close the deferral
  - **UPDATE:** `docs/security.md` § Workflow comment ownership (line 66): the invocation folder is owner-only (`0700`) as well as its files
  - **UPDATE:** `docs/observability.md` § Bookkeeping effects and receipts: `invocation-context/` is a `0700` folder and `<id>.corrections.jsonl` is `0600`
  - **UPDATE:** `.bkit/core/.bkit/workflows.md` line 147: a tracked `*.bkit-lock` that was deleted is staged as a deletion, and an untracked or changed one never is
  - **UPDATE:** `docs/testing.md` § Key test files: the `commands/workflow/ledgers.test.ts` row (line 835) adds the `--month` / `--fid` refusal and the lock-deletion case, and the `commands/lib.test.ts` row (line 806) adds the folder mode
  - **UPDATE:** `docs/deferrals.jsonl`: one `CLOSED` row for key `992-ledger-commands-six-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1273`, written with `bkit ledgers append --ledger=deferrals`
  - **DEPENDS ON:** 1, 2, 3, 4
  - **DONE WHEN:** no line in those files says the invocation folder has the default mode or that no lock file is ever staged, and `pnpm tsx .bkit/core/engine/cli.ts upgrade` has re-rendered `.bkit/workflows.md`
  - **TEST FIRST:** n/a — docs and ledger rows only
<!-- bkit:task 5 end -->
<!-- bkit:group 3 end -->

### Open Questions & Assumptions

- **Open, and not for this build to settle: rollback past `97359934d`.** The owner decides it; no task here depends on the answer, so the build does not pause on it. An older bkit's replay throws on a receipt written since that commit (exit 4, nothing written, so it fails safe but blocks the retry). No change in the new version can fix the old code, and writing `detail.block` again undoes #992's removal of the second copy of the row bytes. Options:
  - (a) Recommended: add one `docs/decisions.jsonl` row saying a revert or downgrade across `97359934d` must keep `ledgerEffect`'s intent fallback, and that an older bkit refuses to replay a newer receipt with exit 4 and writes nothing. No code, no plan edit.
  - (b) Rewrite the Rollback Strategy of `docs/plans/202611/992-ledger-commands-six-plan.md` to say the same. That plan is a finished run's record, so a decision row is the home that later work reads.
  - (c) Write `detail.block` into new receipts again. Not recommended: it brings back the second copy that #992 removed.
- Assumption: `FID_PATTERNS.none` is the right `--fid` check, because it accepts every FID shape the `github`, `linear` and `jira` patterns mint and every existing log folder. A consumer with a hand-made uppercase or dotted FID would be refused; no such folder exists in this repo.
- Assumption: the `--month` / `--fid` check sits only in the two CLI handlers, because `bookPathspecs` must keep accepting `"*"`. The internal callers of `commitBookkeeping` and `checkOnlyBookkeeping` (`.bkit/core/engine/commands/workflow/branches.ts:2433`, `:2530`, `:2889`, `:3025`; `.bkit/core/engine/commands/workflow/workflows.ts:766`, `:1499`; `.bkit/core/engine/commands/workflow/runs.ts:1282`; `ci.ts:828`) were not each traced. `ci.ts:828` takes the FID from a `feat/{FID}` branch name, which git forbids to hold `..`, `*` or `?`, and `branches.ts:2433` only runs when the FID equals a `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` folder name (`branches.ts:2411-2413`). Checking the rest is out of scope here.
- Assumption: `chmodSync` after create is enough; no migration. The next write narrows a folder or file an older bkit left, and these files live in `.git/`, outside installs and upgrades.

Removes: the bare `fs.mkdirSync(dir, { recursive: true })` in `writeInvocation`, so the outbox has one way to make a private folder (`privateDir`); and the unchecked `required(ctx, "month")` / `required(ctx, "fid")` reads in `commit` and `onlyBookkeeping`.

### Breaking Changes & Naming

`bkit ledgers commit` and `bkit ledgers only-bookkeeping` now exit 2 on a `--month` that is not `YYYYMM` or a `--fid` that is not a lowercase slug; every workflow passes values that already match. `privateDir` becomes an export of `.bkit/core/engine/ledgers/status.ts`. No new flag, field or file.

### Out of Scope

- Checking `--fid` in other verbs that take one. `.bkit/core/engine/commands/workflow/decisions.ts:689` joins an unchecked `--fid` into the folder it reads decision files from; that is a separate finding to propose on its own, not a git pathspec.
- Narrowing `bkit-outbox/` itself or any other outbox folder.
- Reclaiming a stale `*.bkit-lock` in `withTargetLock`.
- Any change to the replay code or to what a receipt stores.

### References

- #992 — Ledger commands: six hardening gaps from the 860 review, https://github.com/cbartens/bkit/issues/992
- #860 — Move deterministic bookkeeping and safe recovery into the engine, https://github.com/cbartens/bkit/issues/860
- `docs/plans/202611/logs/992-ledger-commands-six/build-challenge-1.md` § Notes and § Findings Log, TASK 2
- `docs/plans/202611/logs/992-ledger-commands-six/build-challenge-2.md` § Notes
- `docs/plans/202611/992-ledger-commands-six-plan.md` § Rollback Strategy
- `docs/deferrals.jsonl` key `992-ledger-commands-six-challenge-low-bkit-core-engine-commands-workflow-ledgers-ts-1273`
- `docs/security.md` § Workflow comment ownership
- `docs/observability.md` § Bookkeeping effects and receipts
- `.bkit/core/.bkit/workflows.md` (bookkeeping pathspec bullets, lines 147-149)
- `.bkit/core/.bkit/jsonl.md` § Write Idiom
- `docs/testing.md` § Key test files

## Issue comment — posted 2026-11-18T06:20:42.000Z

One more place with the same gap, found while reviewing build 1028. It fits this issue's first item, so I am noting it here instead of filing a second issue.

`bkit decisions pending` builds the run's log folder from `--fid` without checking it: `.bkit/core/engine/commands/workflow/decisions.ts:689` is `path.join(top, "docs", "plans", month, "logs", String(ctx.flags.fid))`. `--month` is checked one line above (`/^[0-9]{6}$/`), `--fid` is not.

What can go wrong: `--fid=../../202610/logs/some-other-run` makes the command read another run's `build-decision-N-N.md` files, and with `--defer` it marks those items Deferred and writes deferral rows for them. The reach is small, because `decisionFiles` (line 324) only picks files named `build-decision-<n>-<n>.md` in that one folder.

Suggested fix, to build with this issue: check `--fid` against `FID_PATTERNS.none` in the `pending` handler, the same check this issue adds to `bkit ledgers commit` and `bkit ledgers only-bookkeeping`. One helper for all three handlers, so there is still one way to check a FID flag.
