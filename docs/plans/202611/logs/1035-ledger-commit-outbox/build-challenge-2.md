Verdict: CONCERNS
Failures: 2
Fingerprint: ba519654fabf81bca7b7d6bbe0b109eba3f4dde3433226cbda9c40ce3d76d0d0
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- Diff: `tmp/bkit-diff-1035-ledger-commit-outbox.md`, read in full (980 lines, no `partial diff coverage` line).
- Plan: `docs/plans/202611/1035-ledger-commit-outbox-plan.md`, tasks 1-8.
- Surfaces challenged: `checkMonthFid` / `monthAndFid` and the three handlers that use them (`ledgers commit`, `ledgers only-bookkeeping`, `decisions pending`); the checks inside `commitBookkeeping` and `checkOnlyBookkeeping` and their callers in `runs.ts`, `branches.ts`, `workflows.ts` and `ci.ts`; the deleted-lock listing in `commitBookkeeping`; `privateDir` and its callers (`writeInvocation`, `ledgerOperationsFile`, `recordLedgerOperation`, `recordLedgerIntent`); `correctionBook`; the doc, deferral, failure and friction rows the diff adds.
- Docs loaded: `.agents/docs.md`; `docs/security.md` in full; `docs/observability.md` § Bookkeeping effects and receipts and the `docs/testing.md` Key test files rows, as the diff leaves them; `docs/knowledge.jsonl`, searched for pathspec, lock and file-mode entries (none relevant).

## Notes

- Checked and clean: `FID_PATTERNS.none` (`/^[a-z0-9][a-z0-9-]*$/`) and `/^[0-9]{6}$/` are anchored and carry no `g` flag. Neither value can start with `:`, or contain `/`, `.` or a wildcard, so neither can carry pathspec magic or climb out of the log folder. Every changed handler runs the check before its first git call or path join. The CI hook's FID comes from `FEAT_BRANCH`, which is the same pattern. `branches sync --feature-state` checks its own month. `privateDir` only ever narrows `bkit-outbox/ledger-operations/` and `bkit-outbox/invocation-context/`. The invocation id that names a corrections file is checked against `/^inv-[0-9a-f]{32}$/` first. A lock body holds only a pid, a timestamp and a random token, so a committed lock leaks nothing. The diff adds no dependency, no secret and no personal data.
- Not logged again, because deferral rows this diff adds already record them: the re-created-lock race at `ledgers.ts:1309`, the `pending` climb test's fixture location at `decisions.test.ts:1698`, and the dispatcher journal resolving a raw `--fid` at `lib.ts:575`.
- Outside this build's scope (plan § Out of Scope), proposed separately: `--fid` checks in other verbs, and the file modes of the other `bkit-outbox/` folders, for example `sessions/`, which holds the verbatim session prompt. Their modes were not checked.
- Verification: both TEST FIRST reds are worked out from the code the diff leaves and from git's pathspec rules. Neither test was written or run, because this agent's mandate forbids writing code. A scratch-folder probe of `git add -- '*'` for TASK 2 was denied by the permission system, so that red rests on git's documented wildcard matching for pathspecs.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** `bkit runs gate --validated=<sha> --month=* --fid=<fid>` and `bkit runs revalidate --month=* --fid=<fid>` still pass a raw `*` month into the merge-gate check, so a change under any other month's `docs/plans/<any>/logs/<fid>/` counts as bookkeeping-only and CI at the older sha is reused, because `checkOnlyBookkeeping` gives the CI hook's `*` exemption to every caller
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:2393` · **Round:** 1
  - **DONE WHEN:** A `*` month is accepted only when the `bookkeeping-push` CI hook (`.bkit/core/engine/commands/ci/ci.ts:828`) asks for it. One way is an explicit opt-in that only that hook sets, in place of the unconditional `checkMonthFid(o.month, o.fid, true)`. With that in place, `bkit runs gate --validated` and `bkit runs revalidate` given `--month=*` exit 2 with a message naming `--month` before any git call, `bkit ledgers only-bookkeeping --month=*` still exits 2, and the existing `ci.test.ts` `bookkeeping-push` cases and the `--validated carry-forward (17)` cases still pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `--validated with --month=* is a usage error (2)` fails on exit 0: in `describe("--validated carry-forward (17)")` it runs `gate(carryRepo(), "--head=book-head", "--validated=green-capstone", "--month=*", "--fid=452g")` after `fixtureGh()`. It expects `r.code` 2 and `r.err` to contain `--month`. Today `checkOnlyBookkeeping` accepts `*`, the allow-list `docs/plans/*/logs/452g/*` matches `ship-summary.md`, and the gate passes with exit 0.
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** `bkit ledgers commit --path='*' --mode=commit` (or `--path=':(top)'`, `--path='docs/*.md'`) sweeps every changed and untracked file in the checkout into one bookkeeping commit, because `commitOnePath` hands the `--path` value to `git add --` and `git commit --` as a pathspec pattern, not a literal path; this is the same widening the build closes for `--fid`, on the same command
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/ledgers.ts:1180` · **Round:** 1
  - **DONE WHEN:** `commitOnePath` passes `--path` to both `git add` and `git commit` as one literal path, for example with the `:(literal)` prefix or `--literal-pathspecs`. A `*`, `?`, `[` or `:(...)` in the value then matches only a file with that exact name. `--path='*'` in a checkout with no file named `*` commits nothing and leaves HEAD and the index unchanged, and every existing `bkit ledgers commit --path` case still passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/ledgers.test.ts` `a --path that is a pathspec pattern commits only that literal path` fails on HEAD moving with `src/app.ts` in `git show --name-only --format= HEAD`: in `describe("bkit ledgers commit --path")` it takes `planRepo()`, writes an untracked `src/app.ts`, appends to the tracked `src.ts`, records `head(r)`, and runs `args(r, "--mode=commit", "--path=*", "--message=m")`. It expects `head(r)` unchanged and `staged(r)` empty. Today `git add -- '*'` stages both files and `git commit -- '*'` commits them with exit 0.
<!-- bkit:task 2 end -->
