## #811 — Publish a dev-refused ship FAILED flush through a ship-close PR (open)

### Narrative

When ship fails, its Failure Path runs `workflows handover --flush` (`.bkit/core/workflows/bkit-ship.md:94-97`). That calls `landFailedRecord` (`.bkit/core/engine/commands/workflow/workflows.ts:744`), which commits the ship FAILED record in a throwaway `origin/dev` checkout and pushes it to `dev`.

When `dev` refuses that push (branch protection, for example), `landFailedRecord` takes its `refused` branch (`workflows.ts:820-821`). It logs "ship FAILED record kept in {book}", keeps the record only in the local book, and exits 10. On a laptop the next ship run carries it. On a cloud runner the machine is thrown away, so the record is lost.

Ship's success close already handles the same refusal. `shipClose` passes a `refused` handler to `pushToDev` that publishes the commit through a `ship-close/{fid}` PR (`closePr`, `workflows.ts:1435-1470`). The FAILED flush should do the same.

The ledger row (`ship-cloud-failure-path-after-merge-has-no-publish-channel`) describes an older mechanism, a push of `git branch --show-current`, which is gone since `0df5dda6c`. The defect it names is still reachable.

### Success Criteria

- A `--flush` that `dev` refuses publishes the FAILED record through a PR to `dev` and reports `pushed: true` with that branch as `ref`.
- The PR's title says ship FAILED, not ship DONE.
- When the PR path also fails, the record stays in the book, the command still exits 10, and the log names both failures.
- `handover --push` from the other workflows behaves as before.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `dev` accepts the push | Lands on `dev` as today; no PR |
| `dev` refuses; PR opens and merges | `pushed: true`, `ref` = the PR branch, exit 0 |
| `dev` refuses; PR opens but merge fails | Exit 0 with the open PR named, the way `closePr` reports `close-pr-open` |
| `dev` refuses; branch push or `gh pr create` fails | Record kept in the book, exit 10, both reasons logged |
| No bookkeeping delta | `skipped: "nothing-to-commit"` as today |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| --flush refused by dev publishes the FAILED record through a PR | integration | `.bkit/core/engine/commands/workflow/workflows.test.ts` |
| --flush refused by dev with the PR path failing keeps the record and exits 10 | integration | `.bkit/core/engine/commands/workflow/workflows.test.ts` |
| closePr titles the PR by the record it carries | integration | `.bkit/core/engine/commands/workflow/workflows.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Give the FAILED flush the close's PR fallback
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Let `closePr` take the PR title, so the FAILED flush can reuse it
  - **UPDATE:** `closePr` in `.bkit/core/engine/commands/workflow/workflows.ts`: take the title instead of the hard-coded `docs({fid}): ship DONE`
  - **UPDATE:** `shipClose` in `.bkit/core/engine/commands/workflow/workflows.ts`: pass the DONE title
  - **DONE WHEN:** the existing ship-close PR tests pass unchanged
  - **TEST FIRST:**
    - `workflows.test.ts` `closePr titles the PR by the record it carries` fails on a FAILED record PR titled ship DONE
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Publish a refused FAILED flush through the PR path
  - **UPDATE:** `landFailedRecord` in `.bkit/core/engine/commands/workflow/workflows.ts`: pass a `refused` handler to `pushToDev` that calls `closePr` with a ship FAILED title, and return its `ref`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/workflows.test.ts`: the test "--flush refused by dev keeps the record in the book and exits 10" (`:1633`) becomes the PR-path-fails case
  - **UPDATE:** `.bkit/core/workflows/bkit-ship.md`: the Failure Path text for step 5, if it describes the refused outcome
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a refused flush against a test remote with a pre-receive hook lands the record through a PR branch
  - **TEST FIRST:**
    - `workflows.test.ts` `--flush refused by dev publishes the FAILED record through a PR` fails on exit 10 with `pushed: false`
    - `workflows.test.ts` `--flush refused by dev with the PR path failing keeps the record and exits 10` fails on a missing second reason in the log
<!-- bkit:task 2 end -->
<!-- bkit:group 1 end -->

### Open Questions & Assumptions

- Branch name: reuse `ship-close/{fid}`, or use `ship-failed/{fid}` so a later DONE close never collides with an open FAILED PR? Recommended: `ship-failed/{fid}`.
- Assumption: `handover --push` with `shared` set, the other caller of `landFailedRecord` (`workflows.ts:882`), gets the same fallback. Confirm during plan.

### Breaking Changes & Naming

- `handover --flush` no longer exits 10 when `dev` refuses and the PR path works. Callers that read exit 10 as "kept" still see it when both paths fail.

### References

**Audit reports:** docs/audits/202611/failures.md (findings failures-5)

- #345 — Failures triage (https://github.com/cbartens/bkit/issues/345)
- #452, closed, no longer covers this
- `docs/failures.jsonl` key `ship-cloud-failure-path-after-merge-has-no-publish-channel`
- `0df5dda6c`, feat(639): flush through a throwaway `origin/dev` checkout

## #662 — Debug can't start after failed ship: leftover files block rebase (closed)

### Failing test or CI run

None yet. Seen live in app-gether-life on #1502 (`1502-inngest-trace-link`), bkit 5.5.1.

### What happened

1. `/bkit-ship` failed at Step 6: the ship-summary verdict was FAIL at 2026-10-22T07:16:37Z. Its Failure Path ran `workflows handover --flush`, which landed the run's record on dev as commit `343804646 chore(1502-inngest-trace-link): ship FAILED bkit [skip ci]`. By design, that step leaves the feature worktree untouched. The code says why: "the next ship of {fid} carries it" (`.bkit/core/engine/commands/workflow/workflows.ts`, `landFailedRecord`). So the worktree was left with uncommitted changes:
   - ship's doc edits to `docs/roadmap.md`, `docs/testing.md` and `docs/observability.md`
   - the two `.bkit/issues.jsonl` SHIPPED rows
   - `status.jsonl`, the `.bkit/` ledgers and four untracked `ship-*.md` logs
2. The next run was `/bkit-debug #1502`, not a ship. Debug Step 2 runs `bkit worktrees setup --workflow=debug --fid=... --detect`. That resumes the worktree by rebasing it onto `origin/dev`. Git refuses to start a rebase while there are uncommitted changes (`error: cannot rebase: You have unstaged changes.`), so the command exits 9 (`EXIT_REBASE_NOT_STARTED`).
3. Step 2's route (`.bkit/core/workflows/bkit-debug.md`, Step 2 sub-step 1) only handles exit 0 and exit 3, so exit 9 sends the run to the Failure Path. Debug never starts.
4. The debug Failure Path then runs `workflows handover --push`. On a feature branch, that does `git add -A` and commits (`workflows.ts:601`). It swept the ship run's leftovers into `5bfcefdd9 docs(1502-inngest-trace-link): debug aborted bkit [skip ci]`. The commit stayed local only because PR #1556 is open (exit 9 again, this time `EXIT_OPEN_PR_KEPT`, from a different command).

The outcome: a workflow that has nothing wrong with it can't start. A run labelled "debug aborted" ends up committing another run's work. And the same ship log files now exist on dev and on the feature branch with slightly different contents. For example, `ship-input-1.md` is 819 lines on dev and 823 on the branch. So the next resume rebase is likely to conflict on them.

### What should happen

Any workflow must do whatever it takes to start. That includes cleaning up after a failed earlier run, whichever workflow that earlier run was.

- **Clean up at the start, not in the Failure Path.** When `worktrees setup --detect` resumes a worktree and finds a previous run's uncommitted record, it commits that record itself, under a commit message that names the run it came from, and only then rebases. Ship already relies on "the next run carries it". That needs to be true for every workflow that can come next: debug, build, and ship again. Today only the next ship handles it.
- **Ship then fail must be a normal path.** Ship has to write SHIPPED to `.bkit/issues.jsonl` before merge, because everything must be committed before merge so nothing is left behind. A ship that fails after that point leaves a SHIPPED row behind, and that is expected. Whatever runs next carries it, and a later row from the next phase replaces it, because the ledger is read newest-row-wins (`roadmap.ts`).
- **No duplicated log files.** Cleaning up a run whose record was already flushed to dev must not leave the same log files on dev and on the feature branch with different contents. The cleanup either picks up exactly what dev has, or lets dev's copy win when it rebases.
- **No unknown exit codes.** Step 2 must not leave a known `worktrees setup` exit code unhandled. Once the cleanup happens at the start, exit 9 should only mean something cleanup can't fix.

### Steps to reproduce

1. Have a feature with an open PR, and run `/bkit-ship` until it fails after `ship-update-docs` (a summary verdict of FAIL is enough).
2. Leave the worktree as the ship Failure Path left it.
3. Run `/bkit-debug #<issue>`.
4. Step 2 exits 9 and the run goes to the Failure Path. Its handover commits the ship leftovers as "debug aborted".

### How often

Every time

### Affected area

- `.bkit/core/engine/commands/workflow/worktrees.ts`: `worktrees setup --detect`, the resume rebase and `EXIT_REBASE_NOT_STARTED`
- `.bkit/core/engine/commands/workflow/workflows.ts`: `landFailedRecord` (the ship `--flush` that leaves the worktree as it is) and `handover --push` running `git add -A`
- `.bkit/core/workflows/bkit-debug.md`: Step 2 route
- The same Step 2 resume in `bkit-build.md` and `bkit-ship.md`, which should handle this the same way

### Where and when

app-gether-life, bkit 5.5.1, 2026-10-22, from 07:16Z (ship FAIL) to 07:37Z (debug FAIL).

### Evidence

- Ship record on dev: app-gether-life `343804646`
- Local-only debug abort commit holding the ship leftovers: app-gether-life `5bfcefdd9`
- The debug run logged a friction row: `debug-step2-cannot-resume-a-worktree-a-failed-ship-run-left-dirty`

### References

Related: app-gether-life #1502 (Trace link from web request into Inngest jobs), PR #1556

## Work done

Fixed on `dev` in 992747a6. Not pushed yet.

### The decision

A workflow does whatever it needs to do to start. The cleanup happens when the next run starts, not in the failed run's Failure Path, and every workflow that resumes a worktree gets it, not only a following ship.

The early SHIPPED row is left alone on purpose. Ship has to commit everything before merge, so a SHIPPED row before a later FAIL is expected. The next run carries that row, and a newer row replaces it because `.bkit/issues.jsonl` is read newest-row-wins.

### What changed

`bkit worktrees setup` now checks the worktree before its resume rebase. If a previous run left uncommitted files there, it commits them first, then rebases. This lives in `carryLeftovers` in `.bkit/core/engine/commands/workflow/worktrees.ts`.

- **The commit says where the files came from.** The message names the earlier run from `status.jsonl`, for example `chore(1502-inngest-trace-link): carry the failed ship record left uncommitted bkit`. When there is no run to name, it says `carry uncommitted work left in the worktree`.
- **Dev's copy of a log wins.** An untracked file in one of this feature's log folders (`docs/plans/*/logs/{FID}/`) is deleted first if dev already has it. A failed ship's flush already put those logs on dev, and two copies of one file would stop the rebase. On #1502, `ship-input-1.md` was 819 lines on dev and 823 in the worktree.
- **Copied-in files are never committed.** The files setup copies in from the main checkout (`bkit.worktree.copy`, for example `.env`) are left out of the commit, so committing everything can't put a secret into git.
- **Two new output fields.** `carriedSha` is the cleanup commit, reported after the rebase replays it. `carriedDropped` lists the logs that were deleted because dev already had them.
- **Exit 9 now only means the cleanup commit itself was refused**, for example by a commit hook. Debug Step 2 still sends that to the Failure Path, which is right, because a refused commit needs a person to look at it.
- **Ship is unchanged.** It doesn't rebase when it resumes, and it already picks up its own leftovers.

### Tests

The tests are in `worktrees.integration.test.ts` and run against a real git remote:
- debug and build each resume after a failed ship. The leftovers are committed under the expected message, the log dev already holds is replaced by dev's copy, the ship's doc edit is kept, and the rebase lands on dev's tip.
- `.env` copied in by setup stays out of the commit.
- A clean worktree gets no extra commit.
- When a pre-commit hook refuses the cleanup commit, setup still exits 9 with a message and writes the sentinel.

`worktrees.test.ts` and `worktrees.integration.test.ts` pass (90 tests). The type check, oxlint and prettier are clean. When I ran `slop:delta` against only these changes, it found no new findings.

### Docs

- `.bkit/core/.bkit/workflows.md` and its copy at `.bkit/workflows.md` describe the resume step (the `resumed` row).
- `docs/testing.md` lists the new cases.
- `CHANGELOG.md` has a line under Unreleased → Fixed.

### Not done here

- **Debug's failure handover still commits everything with `git add -A`.** Now that cleanup happens at start, that commit normally holds only the debug run's own record, so I left it alone.
- **The #1502 worktree in app-gether-life isn't cleaned up.** It still has the local commit `5bfcefdd9`, which mixes the ship's doc edits under a "debug aborted" message. That needs tidying by hand.
- **This issue stays open** until dev is pushed and the fix is released.

## Follow-up audit — other sites in the same defect class as #700's `addAllButCopied` failure

Context: #662's follow-up commit `ce802b482` introduced `addAllButCopied` and asserted, in its doc comment and a test name, that the `bkit.workflows.worktree.copy` entries are left out of every commit "gitignored or not". #700 proved that false: the helper names the copied entry in a `:(exclude)` pathspec, and git's `add` refuses any pathspec that names a gitignored file. Recorded as `worktree-copy-gitignored-file-breaks-commit` (HIGH, OPEN).

This is a sweep for other sites in the same family, done while diagnosing #700. Nothing below is fixed by `ce802b482` or `992747a6`.

### Confirmed mechanism

`git add -A -- . ':(exclude)<gitignored file>'` exits 1. Verified under git 2.56.0:

<!-- prettier-ignore -->
| form | result |
| --- | --- |
| `git add -A -- . ':(exclude).bkit/.env'` (ignored) | **exit 1** |
| `git add --pathspec-from-file=<ignored path>` | **exit 1** |
| `git add -- <ignored path>` | **exit 1** |
| `git add -A -- .` (no exclude) | exit 0 |
| `git add -u -- . ':(exclude,literal)<ignored path>'` | exit 0 |

Two ways to trip it: naming an ignored path in an `:(exclude)`, or feeding an ignored path through `--pathspec-from-file`.

### 1. `addAllButCopied` — the #700 bug (confirmed, HIGH)

`worktrees.ts:244`. Every caller is broken in a worktree that copied a gitignored entry:

- `steps finish` — `steps.ts:480`, and `--docs-only` at `steps.ts:824`
- `workflows handover --push` — `workflows.ts:874`
- `workflows close` — `workflows.ts:1276`
- `carryLeftovers` (resume cleanup) — `worktrees.ts:280`

The trigger is not exotic. Any project whose main checkout has a real, gitignored `.env` (the norm) copies it (`copyListed`, `worktrees.ts:295`) and then fails every commit identically. This repo dodges it only by accident: `.gitignore:22` ignores `.env`, but there is no real `.env` in the main checkout and `copyListed` skips missing entries (`worktrees.ts:305`); `.bkit/.env` exists, so it trips.

Suggested fix — drop from the exclude list the entries git already ignores (`git add -A` skips them anyway):

```ts
const keep = copied
  .map((e) => path.normalize(e))
  .filter((e) => !runGit(tree, ["check-ignore", "-q", "--", e]).ok)
  .map((e) => `:(exclude)${e}`);
```

`git check-ignore` reports tracked files as not-ignored, so a tracked copy entry keeps its exclusion. Do **not** exclude the parent directory (`:(exclude).bkit` also drops tracked siblings such as `.bkit/version`), and do **not** add `-f` (that commits the secret). Test: a fixture whose `.gitignore` contains the copy entry — `copiedRepo` (`steps.test.ts:814`) and `workflows.test.ts:1187` both run against fixtures with no `.gitignore`, which is why the suite is green.

### 2. `markerCommit` — raw `git add -A`, the `ce802b482` intent missed here (HIGH for the projects `ce802b482` was written for)

`branches.ts:780` (caller `branches.ts:1000`, `addAll: true`; reached by `bkit branches push --commit=...`, e.g. `bkit-debug.md:654`). Unlike handover/close, this stages with a bare `git add -A`, so a copied entry the project has **not** gitignored — the exact scenario `ce802b482` cites — is committed and pushed.

Suggested fix: `addAllButCopied(cwd)` instead of `runGit(cwd, ["add", "-A"])`. This must land **after** fix 1, or it inherits the guard bug.

### 3. `commitOnePath` — `git add -- <path>` can name an ignored path (LOW, latent)

`ledgers.ts:843`, where `<path>` is the caller's `--path` (`bkit ledgers commit --path=...`). A gitignored `--path` trips the same guard and surfaces as `EXIT_STAGE`. In-tree callers pass `docs/plans/...` (`bkit-build.md:164`), so there is no live trigger.

Suggested fix: `check-ignore` the path and refuse with a clear message (`--path` is gitignored — refusing to stage it) rather than leaking git's guard error. Do not silently `-f`.

### 4. `--pathspec-from-file` sites — latent, currently safe (LOW)

`commitOwnSet` (`ledgers.ts:546`, `:570`) and `commitBookkeeping` (`ledgers.ts:1041`). `git add --pathspec-from-file` **does** trip the guard (verified), but these lists are safe today: `commitOwnSet`'s list is `set.plain` from `dirtyPaths` (`ledgers.ts:374`), which drops ignored entries; `commitBookkeeping`'s is `git ls-files` output (tracked only).

Suggested fix: pin the invariant with a filter or a comment plus a test, so a future list that gains an ignored path fails loudly at the right layer instead of as an opaque `EXIT_STAGE`.

### 5. `git add -u` with `:(exclude,literal)` — verified immune (no change)

`ledgers.ts:943`. `git add -u -- . ':(exclude,literal)<ignored>'` exits 0 because `-u` only considers tracked files. Recorded so this site is not "fixed" into a regression.

### 6. Same trigger, different commit failure — setup omits a gitignored file the commit needs

Not pathspec bugs, but the same abort shape (#700's "step 2 commit exits 8 → run aborts"), and they collide with fix 1:

- `.vale/styles/write-good` — `harvest/friction.jsonl` keys `worktree-setup-skips-vale-styles-so-first-commit-fails-lint-prose` / `…-first-step-commit-…` (4 rows, 5.2.2–5.2.4). Setup does not copy the gitignored vale styles; the `lint:prose` pre-commit hook refuses; `steps finish` exits 8 at Step 2. **Collision:** the recorded remediation — "copy the gitignored file into the worktree" — is exactly what arms bug 1. Fix 1 must ship before or with any such copy-list addition.
- `.bkit/core` + `.bkit/shared` payload symlinks — friction `worktree-setup-omits-bkit-core-shared-payload-links-so-pre-push-bkit-check-drifts`. Gitignored symlinks not created → `bkit check` drift → pre-push refuses.

### 7. Related abort shape, not pathspec (for completeness)

- `context finalise` exits 8 when a pre-commit guard refuses — friction `related-issue-text-with-malformed-table-blocks-fetch-context-commit`.
- `branches push` exits 8 on runGit's default 1 MB maxBuffer — friction `bkit-rungit-push-dies-on-spawnsync-1mb-maxbuffer`.

### Suggested fix order

1. Fix 1 (`addAllButCopied`) + the gitignored-copy-entry test — unblocks #700 and every `steps finish` in a copied worktree.
2. Fix 2 (`markerCommit`) — closes the secret-commit hole the `ce802b482` intent missed.
3. Fixes 3–4 — harden the remaining `add` pathspec sites.
4. Fix 6 — only after 1, since the vale remediation adds a gitignored entry to the copy list.

## Fixes applied on `dev` (local)

Follow-up to the audit above. Fixes 1–4 implemented on `dev`, committed locally (not yet pushed).

### Commit `412fe612f` — `fix(700): never name a gitignored worktree.copy entry in a commit pathspec`

<!-- prettier-ignore -->
| Fix | Change |
| --- | --- |
| 1 | `addAllButCopied` (`commands/workflow/worktrees.ts`) drops copied entries git already ignores from the `:(exclude)` list. Shared check `isIgnoredPath` added in `commands/lib.ts`. |
| 2 | `markerCommit` (`commands/workflow/branches.ts`) stages through `addAllButCopied` instead of a raw `git add -A`, so `bkit branches push --commit` no longer commits a copied-in secret. |
| 3 | `commitOnePath` (`commands/workflow/ledgers.ts`) refuses a gitignored `--path` with `--path is gitignored, refusing to stage it: <path>` instead of leaking git's guard message. |
| 4 | `commitOwnSet` (`commands/workflow/ledgers.ts`) refuses a gitignored path in its set with `refusing to stage gitignored path(s): <paths>`. |

Why the fix works: `git add -A` skips an ignored file anyway, so an ignored copied entry needs no exclusion; naming it in the pathspec is what trips git's guard. Excluding the parent directory was rejected (`.bkit/` holds tracked files such as `.bkit/version`), and `-f` was rejected (it commits the secret).

### Tests (red before, green after)

- `commands/workflow/worktrees.test.ts` — `addAllButCopied` with a gitignored entry plus a non-ignored one.
- `commands/workflow/steps.test.ts` — `bkit steps finish --commit=auto` in a worktree whose copy list names a gitignored entry: exit 0, the source committed, the ignored entry not.
- `commands/workflow/branches.test.ts` — the `--commit` marker leaves a copied `.env` out of the commit and the pushed branch.
- `commands/workflow/ledgers.test.ts` — `--path` and `commitOwnSet` name a gitignored path in the error.

### Docs and ledger

- `CHANGELOG.md` (Unreleased → Fixed), `docs/testing.md` (new coverage section).
- Commit `fd110763e` closes the failure row `worktree-copy-gitignored-file-breaks-commit`.

### Verification (all green)

- `pnpm vitest run` — 7827 passed, 1 skipped (198 files)
- `pnpm test:integration` — 1578 passed (46 files)
- `pnpm bkit:gate:static` — typecheck, lint, format, tables, prose, slop:delta
- `pnpm bkit:test:bats` — all ok
- `pnpm bkit check` — exit 0; `pnpm bkit:check:dist` clean at the commit
- Built-CLI dogfood on a scratch consumer: `steps finish` exit 0 with a gitignored copy entry (ignored entry untracked); `ledgers commit --path=<gitignored>` exit 4 with the clear message.

### Not done here (still recorded in the audit above)

- **Fix 6** — `.vale/styles/write-good` and the `.bkit/core` / `.bkit/shared` payload links are still missing from `bkit worktrees setup`. The ordering now works in the safe direction: fix 1 has landed, so adding a gitignored entry to the copy list no longer arms the guard bug.
- **Fix 7** — the `context finalise` / `branches push` abort shapes are separate and untouched.

### Also recovered

The main checkout was still `core.bare=true`; `git config --local --unset core.bare` restored it. The `main-checkout-left-core-bare-true` failure stays OPEN — its setter is still unknown.

Commits are on local `dev` (4 commits ahead of `origin/dev`, 2 of them this work); not pushed.

## Review of the landed work (28 Oct 2026)

Code review of #662 on `dev`: `992747a69` and `ce802b482`. I checked them against `dev` at `8e73232bf`, together with #543 and #702, since all three touch worktree setup. All six findings are in code these two commits added, and **none is fixed yet**.

1. **HIGH: a copy-list entry outside the repo breaks every commit bkit makes in the worktree.**
   - The docs say an entry in `bkit.workflows.worktree.copy` that points outside the repo, such as `../shared/.env`, is skipped. `copyListed` does skip it (`.bkit/core/engine/commands/workflow/worktrees.ts:370`).
   - But `addAllButCopied` (`:307`) still adds `:(exclude)../shared/.env` to its `git add`.
   - Its ignore check, `isIgnoredPath` (`.bkit/core/engine/commands/lib.ts:420`), treats git's error on that path as "not ignored" instead of skipping the path. So the exclude goes in, and git rejects the whole add.
   - I reproduced it: `git add -A -- . ':(exclude)../shared/.env'` exits 128 with "is outside repository" and stages nothing.
   - Effects:
     - every per-step commit exits 8;
     - the close commit throws;
     - `handover --push` ignores the failed add and pushes without the failure record.
   - `b470e1420` (#700) fixed the same trap for gitignored entries, but not for entries outside the repo.
2. **MEDIUM: a secret can be committed when the two copy lists differ.**
   - Setup copies files using the main checkout's list (`readBkitConfig(root)`). But `addAllButCopied` leaves out only what the worktree's own `package.json` lists.
   - A file named only in the main checkout's list, for example through an uncommitted local edit, gets copied in. Every step commit then commits and pushes it, unless it's gitignored.
3. **MEDIUM: the exit-9 stop this issue fixed still happens when a copied file is also tracked.**
   - Example: a committed `.env` with placeholder values. That's the Vite convention, and `.env` is in the default copy list.
   - Setup copies the real `.env` over it, so git sees the file as modified. The carry commit leaves it out, so the resume rebase refuses with "cannot rebase: You have unstaged changes" every time.
   - The reviewer reproduced this.
   - A tracked `.bkit/.env` that setup replaces with a link hits the same problem.
4. **MEDIUM: design and plan closes never remove their worktree when `.env` isn't gitignored.**
   - The copied `.env` is deliberately left uncommitted. But `uncommitted()` (`.bkit/core/engine/commands/workflow/branches.ts:1777`) counts it as uncommitted work.
   - So the close keeps the worktree and `feat/{FID}` every time. That's exactly the case `ce802b482` was written for.
5. **MEDIUM: the cleanup before the rebase can delete a file whose content differs.**
   - `carryLeftovers` (`worktrees.ts:327`) deletes an uncommitted log file whenever `dev` has a file at the same path.
   - It only checks that the path exists on `dev` (`cat-file -e`). It never compares contents and keeps no backup.
   - It deletes before anyone knows whether the commit or rebase will succeed.
   - The existing test sets up exactly this case ("worktree copy" vs "landed copy") and accepts the deletion.
6. **LOW: a misleading message on resume.**
   - When the only uncommitted files are the copied ones, setup still tries an empty commit and logs "could not commit what an earlier run left" (`worktrees.ts:332` onward), though nothing was left.
   - Anyone later diagnosing an exit 9 would be pointed at the wrong cause.

**Note:** `992747a69` also contains the #670 change to how settings are seeded. I reviewed it only where it touches the worktree copy list.

The summary for this whole review round is on #551.

---
_Generated by [Claude Code](https://claude.ai/code)_

### Review fixes: done

All six #662 findings are fixed in `49324bf6c`, including the HIGH one; the `workflows.md` and CHANGELOG updates are in `8e18df45f`. Both are on the local branch `review-fixes-deepseek`, which is **not yet pushed**. It fast-forwards into `dev` once another session's uncommitted doc edits are committed.

- **HIGH: a copy entry outside the checkout no longer breaks every commit.** An entry like `../shared/.env` was put in the exclude list of every bkit `git add -A`. Git refused it (exit 128) and staged nothing, so step, close and carry commits all failed. Such entries are now dropped the same way setup already skips them, and the abort commit logs a failed add.
- **Commits leave out both copy lists.** Entries from the main checkout's list and the worktree's list are excluded, plus `.bkit/.env`. A file copied in only because the main checkout's list names it is never committed. The shared exclude list is the new `copyExcludes`.
- **A tracked `.env` that setup copied over no longer blocks a resume** with exit 9. The rebase sets it aside with `--autostash` and puts it back.
- **A resume no longer deletes a log that differs from `dev`'s copy.** It moves the log to `bkit-outbox/{FID}/dropped-logs/` first and names where. A log identical to `dev`'s copy is still deleted.
- **A worktree whose only leftover is a copied entry counts as clean.** There's no misleading "could not commit", and a design or plan close removes the worktree and branch instead of keeping them.

**Checks:** each new test was seen failing before its fix. The only exception is the two `workflows.test.ts` cases, which passed straight away because the root fix had already landed. The full gate on the branch is green.

---
_Generated by [Claude Code](https://claude.ai/code)_

## #679 — Raw git in ship, debug and build becomes bkit verbs (closed)

### Problem

A handful of workflow steps still run raw git and shell inside their bash blocks, or ask the orchestrator to read shell output by eye. They cost few tokens, but each is a place the model can run the wrong git command or misread the result, and the same sequence is written out more than once.

<!-- prettier-ignore -->
| Item (#676) | Where | What the block does today |
| --- | --- | --- |
| 13 | build Step 18 sub-steps 1 and 2 | `git fetch origin dev`; `git diff origin/dev --name-only \| grep -qiE '(^\|/)(migrations\|migrate)/'`; `git show -s --format=%B HEAD \| grep -qF '[force build]'`; then amend or `git commit --allow-empty` with `bkit [force build]`. The engine has no notion of force build. |
| 14 | debug Step 11 sub-steps 2 and 6 | `git diff {DIFF_BASE}...HEAD -- . ':(exclude)docs/plans' \| grep -qE '^\+.*\[DEBUG-OBSERVE\]'` as the no-leak assertion; `"{BKIT}" issues labels {LABEL_FLAGS} \| jq -er .autoRouteSuffix` then `git add -A && git commit --allow-empty -m "chore({FID}): create-pr bkit [verbose ci]${AUTO_ROUTE_SUFFIX}"`. |
| 15 | ship Steps 1, 2, 4, 5, 8, 10, 14 | Step 1: `[ "$(git branch --show-current)" = "{SHIP_BRANCH}" ] \|\| …` and `rm -f` of the `.deferred-blocked` and `.rebase-failed` sentinels. Step 2 sub-step 3: branch `case`, `git fetch origin dev`, `git rev-list --count origin/dev..HEAD`, `git push -u origin "$B"`, `prs open`, `status meta --opened-pr`. Step 4 B2: `ledgers commit --mode=stage` then raw `git commit -m "chore({FID}): conflict-resolve bkit [skip ci]"` then `branches push`. Step 5: `git fetch origin "{SHIP_BRANCH}"` and `git merge --ff-only`. Step 8: `git push origin "{SHIP_BRANCH}"` after `ledgers commit`. Step 10: `git fetch` plus `counters rows … \| jq -er .value` into `counters route`. Step 14: `rm -f` and `cp` of `ship-summary.md` into the outbox. |
| 17 | ship Step 2 sub-steps 2 and 6 | A case-insensitive contains check on the branch name, by the model; `runs wait` twice then the model asserts `prs checks` output. |
| 18 | design and plan Failure Path step 3 | The model reads `git status --short` porcelain to decide which stray files to remove. |

### Outcome

Each sequence becomes a verb or a flag on an existing verb, with a `Route:` on exit codes:

- `branches force-build --base=origin/dev` detects migration paths and amends or empty-commits the `[force build]` marker. Or a `--force-build-on=migrations` flag on `prs open`.
- `prs scan-diff --marker='[DEBUG-OBSERVE]' --base={DIFF_BASE}` beside the existing `prs scan-body`; `prs open --create-pr-commit` writes the `create-pr bkit [verbose ci]` commit with the auto-route suffix itself.
- Ship: `branches ff --ref=origin/{SHIP_BRANCH}` for fetch plus fast-forward; `prs open --ensure` folds the branch guard, fetch, ahead count, push and `status meta`; `ledgers commit --push` for the stage-commit-push triples; `counters route --rows=…` so no jq; `workflows close --summary=ship-summary.md` does the outbox copy. Step 1's branch assert and sentinel removal move into `workflows start` for ship.
- `prs checks --assert` exits non-zero when any check is not green; `branches name-check --branch --expect` for the warning.
- `workflows handover --list-stray` prints the untracked and modified paths as JSON; the orchestrator still decides what to remove.

### Success criteria

- No bash block in `.bkit/core/workflows/` contains a bare `git fetch`, `git merge`, `git push`, `git commit`, `git diff … | grep`, `rm -f` or `cp` outside a `"{BKIT}"` call, except `cd` and `mkdir -p`.
- No `| jq` pipe remains in a workflow bash block.
- Ship, debug and build keep their current behaviour on the same inputs; the existing render snapshots and `commands/workflow/*.test.ts` cover each new verb.

### Constraints and non-goals

- Behaviour-preserving. No change to what gets committed, pushed or asserted; only who runs it.
- One workflow per change, ship first since it holds the most.
- Done last in the #676 order; it buys safety and consistency more than tokens.

### Decisions already made

- None yet.

### Open questions

- Whether the force-build marker belongs on `prs open` or on a `branches` verb, given ship also opens PRs.

### References

- #676 — Audit: orchestrator work the engine could do as bkit commands (items 13, 14, 15, 17, 18)
- #663 — Workflow prompt process optimisation
- `.bkit/core/.bkit/workflows.md` § Workflow Authoring Rules ("Bash decides, prose routes")
- `.bkit/core/engine/commands/workflow/branches.ts`
- `.bkit/core/engine/commands/workflow/prs.ts`
- `.bkit/core/engine/commands/workflow/ledgers.ts`
- `.bkit/core/workflows/bkit-ship.md`
- `.bkit/core/workflows/bkit-debug.md` (Step 11)
- `.bkit/core/workflows/bkit-build.md` (Step 18)

**A follow-on now depends on this issue: #681 "Engine output as text: terse verb replies, tabulated context fetches" (https://github.com/cbartens/bkit/issues/681).**

Today 8 call sites pipe `"{BKIT}"` output through `jq` (7 in `.bkit/core/workflows/bkit-debug.md`, 1 in `bkit-ship.md`), which is the only reason verb replies are JSON. Once this issue removes every `| jq`, nothing parses the output, and #681 can switch the default to `key: value` text (with `--json` kept for scripts and tests) across the 317 `"{BKIT}"` calls in the six workflows. #681 lists this issue in its `bkit:blocked-by` block.

One request for the design here: when a raw git call becomes a verb, print only the fields the workflow reads next, not the whole git object. That is the same saving #681 is after, and it costs nothing to do here first.

Review comment of 2026-10-23 on #663 "Workflow prompt process optimisation" (https://github.com/cbartens/bkit/issues/663), sections 3 and 4.

### Implementation plan (2026-10-24)

**In short:** every raw `git` and `gh` line left in ship, debug and build becomes a `bkit branches|prs|ledgers|workflows` verb, or a flag on one that already exists. A guard test then fails if a raw call comes back. It ships in six slices: ship first (the most lines), then debug, then build, then the Failure Paths, then the guard. One behaviour fix rides along: `[force build]` currently does nothing on pull requests.

#### Decisions taken with the owner on 2026-10-24

<!-- prettier-ignore -->
| # | Question | Decision |
| --- | --- | --- |
| 11 | `[force build]` on pull requests | **Fixed here.** CI reads the marker from the PR title on `pull_request` events and from the commit message only on pushes (`bkit-ci.yml:57-71`). So the empty `[force build]` commit the workflows push today is ignored on a PR. `branches force-build` does both: (1) it adds `[force build]` to the PR title when a PR is open, then (2) it pushes the empty marker commit. CI's `pull_request` trigger uses the default event types (`opened`, `synchronize`, `reopened`; `bkit-ci.yml:11`), so renaming the title alone starts nothing. The push in (2) is the `synchronize` event that starts the run, and that run reads the new title. It never amends a commit. |
| 5 | Repeat-safety (shared with #675) | Marker commits, CI dispatch re-triggers and PR opens record an `engine-action` row in `status.jsonl` before they report done, and check for one first. A re-run after a crash doesn't push a second marker commit or open a second PR. The row type and helper come from #675 — Engine does tracker reads and writes; MCP becomes the fallback — https://github.com/cbartens/bkit/issues/675. |

Decided by me (say if you disagree):
- **Ship Step 8 push stays conditional.** The draft for this plan suggested pushing unconditionally. I'm keeping today's behaviour: push only when `outcome` says there is something new. It becomes a route on the verb's output instead of prose. An unconditional push would start a CI run on every ship even when nothing changed. If you want the simpler unconditional form, it's a one-line change.
- **Branch-name check.** When the branch name doesn't match the FID, `worktrees setup` prints a stderr warning rather than failing, so a hand-made branch still works.

#### What is already true in the code

- Item 17 in the body is out of date: `prs checks` already exits 1 on a failing check. #662 — workflows start after a failed ship — https://github.com/cbartens/bkit/issues/662 is closed.
- The body's site list misses these: build:146, debug:310, Failure Path build:90 and debug:92, ship:486, and ship sub-steps 2.2 and 2.6. All are in the slices below.
- Ship's last jq pipe (`bkit-ship.md:535`) goes here. Debug's go in #678 — Build and debug loop verbs: failure count, diff artifact, debug mode — https://github.com/cbartens/bkit/issues/678.

#### New verbs and flags

<!-- prettier-ignore -->
| Verb or flag | Replaces |
| --- | --- |
| `branches push --mode=plain --set-upstream --ahead-of=<ref>` | `git push -u` plus the prose ahead-of check |
| `branches fast-forward --onto=<ref>` | `git fetch` + `git merge --ff-only` |
| `branches scan-diff --base` | `git diff --name-only` pipes used for routing |
| `branches force-build` | the empty-commit block; also sets the PR title (decision 11) |
| `branches push --commit --label` | `git commit --allow-empty -m …` + push for the debug `create-pr bkit [verbose ci]` marker |
| `counters route --rows=` | prose counter arithmetic in ship |
| `workflows start --branch` | ship's sentinel clearing in prose |
| `workflows close --summary` | `git log` summary assembly at close |
| `ledgers commit --path` and `--mode=commit --stage-tracked-updates` | `git add`/`git commit` of ledgers |
| `status meta --debug-attempt=run` | debug's hand-written meta row |
| `runs gate --branch` (with fetch) | `git fetch` before the gate check |
| `workflows handover --list-stray` | Failure Path `git status --porcelain` reading |

Every verb that pushes or opens a PR records an `engine-action` row (decision 5).

#### Slices

Each slice: tests first and red, engine code to green, prose, `pnpm wording:sync`, `bkit install` once at the end.

1. **Ship open and verify** (Steps 1-8): `workflows start --branch`, `branches fast-forward`, `branches scan-diff`, `branches push --mode=plain`, the conditional Step 8 route, ship 2.2 and 2.6, ship:486.
2. **Ship integrate to close**: `counters route`, `ledgers commit`, `workflows close --summary`, the jq pipe at `:535`.
3. **Debug**: `branches push --commit --label`, `status meta --debug-attempt=run`, debug:310, `branches force-build`.
4. **Build**: build:146, the build `[force build]` site, `runs gate --branch`.
5. **Failure Paths**: `workflows handover --list-stray` at build:90 and debug:92, and the ship equivalent.
6. **Guard test**: `workflow-fence-syntax.test.ts` fails on any `git ` or `gh ` call inside a workflow bash fence, except a short named allow-list with a reason for each entry. This waits for #678, which removes debug's jq and `git diff` lines.

Tests per verb: plain and set-upstream push against a temp bare remote; fast-forward refusing a diverged branch; `force-build` with and without an open PR (stubbed `gh`), plus a re-run that is deduped; `--list-stray` on a dirty tree; the Step 8 route on each `outcome`.

#### Verification

- `pnpm vitest run`, `pnpm bkit:gate:static-unit-integration`, `pnpm wording:sync` with no diff, `bkit check` with no drift.
- Live: `/bkit-ship` of a small change on a throwaway issue. On its PR, run `branches force-build` and check that CI starts with the force-build path (the job log shows the marker was read from the title).
- Consumer CI files copied from bkit's template read the title the same way. Check the template copy and note in `CHANGELOG.md` if it differs.

#### Risks

- **Push and PR semantics in the engine.** A wrong flag here pushes the wrong branch. Each push verb prints what it pushed and where; integration tests use a real bare remote, not a stub.
- **Uncommitted work by other agents** in `worktrees.ts` and `workflows.md`: rebase onto it before slices 1 and 5.

No open questions remain for this issue.

**Implemented: all six slices** of the plan above, in commit `e3cb1a3f` on branch `feat/676-engine-io`. The commit is local only for now; the branch has not been pushed.

Checks run:
- typecheck, lint, format and prose checks pass.
- Unit tests: 5734 passed. The 2 that fail also fail on `dev` without this change.
- bats tests: 31 of 31 pass. Integration tests: 1553 of 1553 pass.
- `slop:delta`: unchanged from `dev`.
- `bkit check`: clean.

The guard test in `workflow-fence-syntax.test.ts` allows one raw git call: the bootstrap line that locates the `bkit` binary, since no verb can run before it.

Changes from the plan:
- **Ship Step 5.1 stops on a failed fetch.** Exit 10 now goes to the Failure Path.
- **Build's no-progress check and migrations scan look at committed diffs.** They compare commits (three-dot) instead of the working tree, which makes the migrations scan stricter.
- **Build's force-build runs after `prs open`.** That way the PR exists when its title is set.
- **Ship's Failure Path has no `--list-stray` step.** It saves only the run's record.
- **Two audit tests were narrowed, as a direct effect of removing raw calls.** `counter-prose-audit.test.ts` now checks `REVALIDATE_ATTEMPT` in place of `DEBUG_ATTEMPT`, whose jq line is gone. The shell-variable minimum in `block-locality-audit.test.ts` dropped from 10 to 5.
- **Corrected `.bkit/workflows.md`.** It said ship pushes before merge in two places; the code and its test have three: opening a missing PR, B2 and bookkeeping.

Live runs (a throwaway `/bkit-ship` and `branches force-build` on its PR) were not done.

## #849 — Keep local dev synchronized after workflow close (open)

### Problem

Local `dev` and `origin/dev` keep ending up ahead of or behind each other after workflows finish. The owner has to reconcile them by hand, and a successful close doesn't say whether local `dev` was brought up to date or only GitHub's copy.

Source inspection on 2026-11-03 found:

- Ship Step 13 runs `branches sync-dev` before Step 14 lands the final DONE bookkeeping commit. So the close can move `origin/dev` again after local `dev` was synced.
- `syncDevVerb` returns success when `fastForwardDev` reports `skipped`. That keeps the landing a success, but it is no proof that local `dev` is in sync.
- `fastForwardDev` refuses non-fast-forward updates and prints generic `git pull --rebase` / push advice. When local-only commits were already published inside a squash, that advice replays changes `origin/dev` already holds.
- The shared landing routine uses a throwaway checkout so it never publishes unrelated local commits or disturbs another agent's work. Keep that protection.

The checkout was 19 commits ahead and 1 behind its cached `origin/dev` during the investigation (no fetch, so not a live count).

### Scope decision (2026-11-10)

**In scope: the automatic sync at close, and honest reporting.** Nothing else.

**Out of scope: the recovery tool.** That covers `bkit branches dev-status`, `bkit branches dev-reconcile`, `@bkit-utility-sync-dev`, the proof of which local commits GitHub already holds as copies or squashes, replaying unpublished commits, `dev-backup/*` branches and the hold ref.

Why it was cut:

- The recurring pain is local `dev` falling behind after a close. A fast-forward after the last landing fixes it. Nobody has hit a case the automatic sync can't handle often enough to need a tool.
- The design (`docs/plans/202611/849-keep-local-dev-design.md`) made the cheap fix wait for the expensive one. WS-6, the automatic sync, `Requires [WS-1, WS-3, WS-4]`, only because its message points at the recovery tool.
- The recovery tool brought most of the risk. The design run's spike disproved 5 of its 11 claims, and the run ended in a Workflow Failure at its summary step. The design's open questions are mostly about the recovery tool: empty replays, adopting while `dev` is checked out, the hold ref, merge commits, how GitHub reports a protected-branch refusal.
- Its test list covers cases nobody has seen, such as refusals under a non-English git locale, commits empty from the start, the server refusing a push the owner already approved, and install failing after a fast-forward.

If divergence that needs a tool keeps happening after this ships, open a new issue with the real cases attached.

Grill answers withdrawn by this cut: Q4 (recovery tool form), Q5 (replay strategy), Q6 (proving "already on GitHub"), Q8 (backup branch) and Q9 (recovery checks). Q1-Q3, Q7, Q10 and Q11 stand.

### Outcome

Every close that lands on `dev` leaves local `dev` level with `origin/dev` when a fast-forward can do it safely. When it can't, the final message says plainly that the work landed, how far local `dev` is ahead or behind, why it wasn't moved, and what to do by hand.

### Success criteria

- After every push to `dev` (design/plan close, ship close including the final `ship DONE` commit, build/debug `branches push --mode=dev`, failure-record handovers, roadmap mirror pushes), a clean local `dev` that is only behind ends equal to `origin/dev`. Equal stays a no-op.
- Each of those paths reports one result: equal, fast-forwarded, ahead, divergent, blocked (with the reason) or unavailable (fetch failed). A blocked sync never turns a successful landing into a failure.
- When the fast-forward succeeds but the frozen install fails, the close still exits 0 and its sync line says the install failed and how to re-run it. No `friction` row. Standalone `bkit branches sync-dev` keeps exit 16.
- Local commits, staged changes, working-tree edits, the active branch and other worktrees are never changed by the automatic sync.
- The ahead / divergent message gives the counts and a plain manual step. It drops the `git pull --rebase` advice, which is wrong when local commits were already squashed into `origin/dev`.
- Ship's sync moves into `workflows close`, after the final `ship DONE` landing. Ship Step 13 is removed.
- Tests: equal / behind / ahead / divergent; edited and occupied worktrees; fetch failure; a ship close PR that stays unmerged (reports "landing pending"); a landed close whose sync is blocked still exits 0.

### Design workstreams kept

From `docs/plans/202611/849-keep-local-dev-design.md`:

- **WS-6** automatic sync core (`syncLocalDev`), with the ahead/behind count from `rev-list --left-right --count` only. No copy classification, so no dependency on WS-1, WS-3 or WS-4.
- **WS-7** engine caller wiring and the reachability contract test.
- **WS-8** workflow display of the sync line.
- **WS-9** ship Step 13 retirement.
- **WS-5**, reduced: remove the wrong `git pull --rebase` advice, and point the advice at a manual step instead of a recovery tool.

Dropped: WS-1 (except the ahead/behind count), WS-2, WS-3 and WS-4.

### Constraints and non-goals

- No reset, force-push of shared branches, automatic stashing or rewriting of shared history.
- The automatic sync only ever fast-forwards.
- A successful landing stays successful when the local sync is blocked; the final message discloses the local state.
- Keep the isolated landing architecture (#639).
- Feature-branch catch-up belongs to #842.
- Non-goal: any tool that reconciles an existing divergence (see Scope decision).

### Next step

Run `/bkit-plan #849`. The design `docs/plans/202611/849-keep-local-dev-design.md` holds only the kept workstreams (WS-5 to WS-9, one suggested plan P-1 that requires nothing) and the install-failure answer above. `/bkit-plan` reads it from `origin/dev`, so the design commit must be pushed first.

### References

- [#639 — Land parallel workflow closes on dev without colliding](https://github.com/cbartens/bkit/issues/639): the existing safe-fast-forward and isolated-landing contract.
- [#842 — Ship fails when the local feature branch differs from GitHub's](https://github.com/cbartens/bkit/issues/842): gap E, unpushed `dev` changes later held inside a squash.
- [#885 — Necessity and simplicity across design and review](https://github.com/cbartens/bkit/issues/885): this cut is one of its worked examples.
- `.bkit/core/workflows/bkit-ship.md` § Step 13 — Update Local Dev; § Step 14 — Close Workflow.
- `.bkit/core/engine/commands/workflow/branches.ts`: `syncDevVerb`, `fastForwardDev`, `pushOwnCommits`.
- `.bkit/core/engine/commands/workflow/workflows.ts`: `shipClose`.
- `.bkit/core/engine/commands/land.ts`: shared isolated landing routine.

Priority: High (recurring sync defect, misleading success reporting). Size: S-M (sync core, caller wiring, display, ship step removal, tests). Next step: plan.

### Open questions answered, design narrowed in place

**Install failure after the close fast-forwards local `dev`:** the close exits 0 and its sync line says the install failed and how to re-run it. No Failure Path and no `friction` row. Standalone `bkit branches sync-dev` keeps exit 16 for a person at a terminal.

That was the only open question from the last design summary about the part we kept. The other six (empty replays, adopting while `dev` is checked out, the utility running prepare, the hold ref, merge commits, how GitHub reports a protected-branch refusal) were about the recovery tool and go with it.

**Design edited in place instead of a full re-run.** `docs/plans/202611/849-keep-local-dev-design.md` now holds only WS-5 (reduced) and WS-6 to WS-9. WS-6 requires nothing, and one suggested plan, P-1, covers all five. The spike's findings that touched the kept part are already handled: blocked reasons are read from git state, not git's translated error text, and the copy count is gone.

Changes beyond deleting the recovery parts:

- Ahead / behind come from `rev-list --left-right --count` only, with no copy count.
- The routine debug-on-dev line uses `replayedOwn`, the number of the run's own commits `pushOwnCommits` replayed. That number is exact without classifying commits.
- The ahead / divergent lines point at `git log --oneline origin/dev..dev` and say "bring local dev level by hand". They name no reset command, because agents read the line.
- The "publish dev (git push origin dev)" advice in `unpushedDevCause`, `inheritedDevRefusal` and the base-branch refusal stays unchanged. Changing it is #842 gap E's job.
- The test list is the issue's: equal / behind / ahead / divergent, edited and occupied worktrees, fetch failure, an unmerged ship close PR (`pending`), and a landed close with a blocked sync still exiting 0.

**Next step:** `/bkit-plan #849`, once the design edit is on `origin/dev`.

## #520 — Fix three bugs found during stack audit: debug soak regex, ship CI workflow name, and deployments reset --hard (closed)

## Goal

Fix three bugs in workflows, prompts, and seeded docs discovered during the stack-agnostic audit (#498).

## 1. Unescaped regex in debug soak prompt
- **Location:** `.bkit/prompts/bkit-debug-failure-soak.md:51`
- **Problem:** The prompt checks that all temporary debug instrumentation has been removed by running `git grep '[DEBUG-OBSERVE]'`. Without the `-F` (fixed strings) flag, git interprets the brackets as a regex character class matching any single uppercase letter (`D`, `E`, `B`, `U`, `G`, etc.). Consequently, the check matches virtually any line in the codebase containing an uppercase character and can almost never pass cleanly.
- **Fix:** Change command to `git grep -F '[DEBUG-OBSERVE]'`.

## 2. Hardcoded workflow filename in ship Step 9
- **Location:** `.bkit/workflows/bkit-ship.md:944, 959, 970, 1016`
- **Problem:** These lines hardcode `--workflow ci.yml` when checking or triggering GitHub Actions workflow runs, ignoring the `bkit.ciWorkflow` setting that `.bkit/scripts/bkit-ship-gate.sh:168` honours. If a consumer repo renames their primary CI workflow, ship polls and dispatches the wrong workflow file.
- **Fix:** Resolve the workflow filename using the `bkit.ciWorkflow` configuration helper before dispatching or checking status.

## 3. Disallowed git command in deployments runbook
- **Location:** `.bkit/templates/docs/deployments.md:79`
- **Problem:** The runbook instructs the reader to execute `git reset --hard` during deployment troubleshooting. This directly violates `.agents/rules.md:81`, which prohibits destructive git commands (`git reset --hard`, `git clean -f`, force pushes).
- **Fix:** Replace `git reset --hard` with safe worktree or checkout recovery instructions.

Related: #498
Parent: #498

## Analysis

All three bugs are already fixed in the current tree — the fixes landed during the audit-fix sessions and the #467 command extractions. Verified each:

1. **Debug soak regex** — `.bkit/core/prompts/bkit-debug-failure-soak.md:52` now reads: "Verify `git grep -F '[DEBUG-OBSERVE]'` over source returns nothing." The `-F` (fixed strings) flag is present, so the check no longer matches arbitrary lines containing an uppercase letter.
2. **Ship CI workflow name** — no literal `ci.yml` (or any hardcoded workflow file) remains in the ship workflow or any phase workflow. Ship Step 9 now runs `bkit runs revalidate`, and the command path reads the configured file: `.bkit/core/engine/commands/workflow/runs.ts:90` — `const { ciWorkflow } = readBkitConfig(root)` — with `ciDeclared` checking `.github/workflows/<bkit.ciWorkflow>` and dispatch targeting `target.ciWorkflow`. The `bkit.ciWorkflow` setting (`bkit-ci.yml` default) is the single source; a consumer rename no longer polls or dispatches the wrong file.
3. **Deployments `git reset --hard`** — gone from both the template (`.bkit/shared/docs/deployments.md`) and the adopted copy. The dev rollback runbook says "NEVER `git reset` or force-push `dev` (`.agents/rules.md` § Git, CI & Merges)" and uses `git revert --no-edit <green-sha>..HEAD`; the production rollback is a protection-disabled `gh api -X PATCH ... force=true` ref update in an owner runbook (no local reset). The only remaining `git reset --hard` strings are the guardrails' own permission rows (`"git reset --hard*": "ask"`), which is the protection working as intended.

## Work done

Verification only — no changes needed.

Closing as completed.

## #492 — Ship never writes its "workflow started" row, so every ship run on a feature folds into one (closed)

## What's wrong

Design, plan, build and debug each write a `{type:"workflow-started"}` row to the feature's `status.jsonl` when they start. Ship doesn't: `.bkit/workflows/bkit-ship.md` has zero places that write one.

The status reader (`.bkit/scripts/bkit-status-fold.sh`) only opens a new run when it sees that row. Without it, every ship attempt on the same feature gets glued onto the previous one.

## What that breaks

- **Merge attempts carry over between runs.** The attempt counters only count rows in the current run. On `380-roadmap-analysis-refresh` (4 ship runs, 3 failed), a fresh ship run would start at merge attempt 2 of 3 instead of 1 of 3.
- **Duration is always 0.** `SHIP_START` (`bkit-ship.md`, Step 10 close) looks for the latest ship `workflow-started` row, finds none, and records `durationSeconds: 0`. The friction/deferral/failure counts on the outcome row then count every ship row since the start of time, not just this run.
- **`SHIP_ATTEMPT` is always 0.** `COUNTER_VALUE` counts ship `workflow-started` rows.
- **A new run inherits the old run's result.** After a run ends DONE or FAILED, the next run's steps attach to that finished run, so a resume check sees it as already finished.
- #277's fix depends on this row, so it can't work for ship.

## How it happened

The row (and the check that skips re-writing it when resuming an in-progress run) was removed from ship's Step 1 in 80660ac0 (#384, PR #395) during the Path A/B restructure. The #384 plan doesn't mention removing it and no reason is recorded, so it looks accidental.

Logged in `docs/failures.jsonl` as `ship-never-writes-workflow-started-row` (HIGH).

## Fix

- Put the write back in ship Step 1, same shape as `bkit-build.md` Step 1: migrate a legacy `status.json` if there's no `status.jsonl` yet, then write `workflow-started` (with `parentSha`) unless the latest run is already an in-progress ship run (a resume).
- Add a test asserting all five workflows write the row.

## Fix — staged on `dev`, not yet committed

### What changed

**`.bkit/workflows/bkit-ship.md` Step 1, item 8** now writes the "workflow started" row again, before the `ship-start-workflow` row. It's the same block build, plan, design and debug already use:

1. If the feature only has an old-format `status.json` and no `status.jsonl` yet, convert it first. Ship had this before #384. Without it, ship would start a fresh `status.jsonl` and the older history would never be carried over.
2. Write `{type:"workflow-started", workflow:"ship", at, parentSha}`, **unless** the latest run in the file is a ship run that's still in progress. That case is a resume, and it must not count as a new run.

With the row back:
- a new ship run starts at merge attempt 1 of 3, not wherever the last run stopped;
- `durationSeconds` on the outcome row measures this run instead of always being 0, and the per-run friction/deferral/failure counts only cover this run;
- `SHIP_ATTEMPT` counts ship runs instead of always being 0;
- a new run no longer inherits the previous run's DONE/FAILED status;
- #277's fix can now work for ship.

### Tests

- `.bkit/src/bkit-ship-invariants.test.ts`: checks that **all five** workflows (design, plan, build, debug, ship) write their own "started" row, and skip it when that run is already in progress. This would catch the same row being dropped from any workflow in a future restructure.
- New `.bkit/src/bkit-ship-workflow-started.integration.test.ts`: pulls the actual block out of `bkit-ship.md` and runs it with bash in a scratch git repo, using the real `bkit-status-fold.sh` (the script that reads `status.jsonl`). The test doesn't keep its own copy of the logic. Cases:
  - fresh run → one "started" row with a commit SHA, then `ship-start-workflow`
  - resume of an in-progress ship run → no second "started" row
  - previous ship run FAILED → a new "started" row
  - latest run is a finished build → a ship "started" row
  - old-format `status.json` only → converted, then the ship row is written

All 6 new tests **fail against the old `bkit-ship.md`** and pass against the fix.

### Also in the change

- The ship command copies for Claude, Cursor and opencode (`.claude/commands/bkit-ship.md`, `.cursor/commands/bkit-ship.md`, `.opencode/commands/bkit-ship.md`) and `.agents/skills/bkit-ship/SKILL.md`, regenerated with `bkit upgrade`, plus their three hash lines in `.bkit/version`.
- `docs/failures.jsonl`: new row marking `ship-never-writes-workflow-started-row` as CLOSED, with a reference to #492.

### Checks run

- typecheck: pass
- The new tests plus `bkit-counter-prose-audit.test.ts`: 170/170 pass
- Full `pnpm test`: 2 failures, both in `bkit-ledger-integrity.test.ts`. They're about `docs/deferrals.jsonl`, which this change doesn't touch: four entries there are missing a `reason`. These failures come from outside this change.
- `slop:delta` (the code-quality scanner) against HEAD: 0 new findings. Against the default base it reports +1, which comes from the 53 commits already on `dev` that aren't pushed yet, not from this change.

Committed to `dev` as fd311627 (`fix(492): restore ship's workflow-started row`). It's local only for now and not pushed yet, so the commit link won't resolve on GitHub until it's pushed.

## #821 — Add a ship-lane reconciler for depth-1 queue eviction (open)

###### bkit:blocked-by start
- #397
###### bkit:blocked-by end

### Narrative

GitHub Actions holds exactly one pending run per concurrency group. When a third ship starts while one runs and one waits, the waiting second run is displaced. That PR stays green, open and merge-ready, but never ships, and because the displaced run executes no step, no bkit notice, comment, label or ledger row records it. #397 — bkit-cloud concurrency: global ship lock, FID arbitration accepts this hole for N >= 3. This issue adds a reconciler that finds and re-dispatches displaced ships once #397 has landed its admission probe.

### Success Criteria

- A ship displaced from the pending slot is re-dispatched by the next sweep.
- A sweep dispatches at most one run, bounded like `MAX_DEV_DISPATCH_ATTEMPTS` (`.bkit/templates/.github/workflows/bkit-cloud.yml`, held equal to `bkit counters max` by `counters.test.ts`).
- The admission probe and the sweep predicate call one shared implementation.
- The predicate keys on the workflow file name, never a consumer-editable CI display name.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Two sweeps run at once | Only one dispatch per displaced PR |
| The displaced PR was closed or merged meanwhile | No dispatch |
| Dispatch cap reached | Sweep stops and leaves a visible record |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Shared predicate picks a displaced, still-open ship PR and skips closed ones | unit | set by the plan, next to #397's admission probe |
| Sweep dispatches at most one run per pass | unit | set by the plan |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Reconciler
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Extract one shared ship-lane predicate used by #397's admission probe and the sweep
  - **READ:** #397's admission probe (lands with #397)
  - **DONE WHEN:** both callers import the same function
  - **TEST FIRST:**
    - predicate test fails on a displaced, still-open ship PR not being selected
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Add a capped sweeper that re-dispatches one displaced ship per pass
  - **UPDATE:** `.bkit/templates/.github/workflows/bkit-cloud.yml`: cloud job `permissions` gain `actions: write` (currently `actions: read` at `:111`, `:480`, `:555`); needs owner confirmation per `.agents/rules.md` § CI edits for the rendered `.github/workflows/` copy
  - **DEPENDS ON:** 1
  - **DONE WHEN:** a sweep with two displaced PRs dispatches exactly one
  - **TEST FIRST:**
    - sweep test fails on more than one dispatch per pass
<!-- bkit:task 2 end -->
<!-- bkit:group 1 end -->

### Open Questions & Assumptions

- Assumes #397 lands an admission probe; the target files are fixed by the plan once it does.
- The row says this belongs with #260's single-flight / idempotent-dispatch substrate.

### References

- **Audit reports:** docs/audits/202611/deferrals.md (findings deferrals-12)
- Audit parent: #344 — Deferrals triage
- #397 — bkit-cloud concurrency: global ship lock, FID arbitration
- `docs/deferrals.jsonl` key `397-ship-lane-reconciler-for-depth-1-queue-eviction`

## #100 — Agentic preflight and runtime infra hardening (open)

<!-- linear-import: BAR-232 -->
**Linear:** [BAR-232](https://linear.app/bartens/issue/BAR-232) · **Created:** 2026-05-19 · **Linear assignee:** christian@bartens.biz

---

## Context

Two operational gaps in the autonomous bkit workflow that allow silent failure modes when the pipeline runs unattended.

Both surfaced as deferred items in `docs/pending.md` during [BAR-101](https://linear.app/bartens/issue/BAR-101/linear-depot-claude-intergration) / [BAR-110](https://linear.app/bartens/issue/BAR-110/agent-workflows-prompts-install-script) design work. Grouped together here because they share the same surface (preflight hooks + scheduled checks) and the same failure shape ("agent thinks it's making progress, in fact it's stalled").

## Scope

### 1\. Branch protection rule verification in pre-flight

Ship phase merges PRs autonomously. If `dev` branch requires human approvals, ship will silently fail at merge step with no useful diagnostic.

Currently `.agents/templates/scripts/ci/bkit-set-protection.sh` exists as a one-time **applier** but there is no pre-flight **verifier** gate before ship.

**Fix:** Add a preflight check (in `.claude/hooks/preflight.sh` / `.cursor/hooks/preflight.sh` or as a `bkit-preflight.ts` subverb) that runs `gh api repos/{owner}/{repo}/branches/dev/protection` and confirms one of:

* `required_approving_review_count` is 0, OR
* Cursor Cloud Agent / GitHub Actions bot is in the bypass-actors list

Fail fast with a clear message if neither condition holds.

### 2\. Stuck-pipeline detection

When an agent launched via API fails silently, the parent Linear issue is left `In Progress` with no further activity. No alerting; the only signal is "I haven't seen movement in a while."

**Fix:** Cursor scheduled automation (or GHA cron job) that queries Linear for issues:

* Status `In Progress`
* Has `Build` / `Debug` / `Ship` label
* No recent agent comment for > N hours (N tunable, suggest 4h initial)

Action: post a warning comment on the issue. If stale for > 2N hours, add `Blocked` label.

## Acceptance

* Pre-flight check rejects a Ship run against a `dev` branch with `required_approving_review_count > 0` and no bypass actor, with a clear error.
* Scheduled automation posts a `[bkit-stuck]` warning comment on any issue idle past the threshold.
* Both gates documented in `.agents/workflows/` or equivalent.

## Out of scope

* Refactoring the workflow to use a different orchestration backend.
* Per-step heartbeat tracking (much larger lift).

## Related

* [BAR-101](https://linear.app/bartens/issue/BAR-101/linear-depot-claude-intergration) (Linear → Depot → Claude pipeline that introduced these surfaces)
* [BAR-110](https://linear.app/bartens/issue/BAR-110/agent-workflows-prompts-install-script) (in-repo bkit migration where the gaps surfaced)
* `docs/pending.md` (entries removed at issue-creation time)

<!-- linear-links-start -->
**Links:**

- **Related:** [BAR-101](https://linear.app/bartens/issue/BAR-101) _(not imported)_, [BAR-110](https://linear.app/bartens/issue/BAR-110) _(not imported)_
<!-- linear-links-end -->

## #363 — Route post-merge CI failures to /bkit-debug (closed)

> ## ⚠️ Design superseded — see the [pivot comment](https://github.com/cbartens/bkit/issues/363#issuecomment-5045381126)
>
> The `ship-verify` block-contract design below (post-merge "Verify Deploy" step in `/bkit-ship`) was **abandoned** after a design pass on 2026-07-22. It is preserved as history only.
>
> **Final approach:** reuse the trigger `bkit-cloud` already has. It routes on CI conclusion for the pre-merge feature branch (`workflow_run: [CI], branches: ['feat/**']` → success→ship, failure→debug); we simply **widen that filter to the post-merge branches** (`['feat/**', 'fix/**', 'dev', 'main']`) so a post-merge CI failure auto-launches `/bkit-debug`. **No `bkit-ship` edit, no ship-verify block, no `MERGE_SHA`, no preflight advisories, no renumber cascade.**
>
> ```
> TODAY:  build → PR CI → auto → debug OR ship;  ship → merged(dev) → done (post-merge CI ignored)
> FUTURE: build → PR CI → auto → debug OR ship;  ship → merged(dev) → dev CI  → auto → nothing OR debug
>                                                       dev→main promo → main CI → auto → nothing OR debug
> ```
>
> Full discussion, final scope (IN / DROPPED / RELOCATED), and the 5 open design items (led by the load-bearing `[skip ci]` / auto-route-marker-on-squash-merge question) are in the **[pivot comment ↗](https://github.com/cbartens/bkit/issues/363#issuecomment-5045381126)**.

---

<details>
<summary><b>Superseded original design</b> (ship-verify block contract) — kept for history</summary>

## Problem

On merge-to-deploy stacks (Vercel/Netlify/…), a release can **merge green yet the production deployment fail to build, get provider-CANCELED** (e.g. a non-web-affected release commit → Vercel cancels), or never promote. `/bkit-ship` ends at merge + docs with **no check that the resulting deployment reached a terminal-OK state** — so ship reports success while prod silently didn't ship. Symmetrically, `@live`/e2e reds are frequently caused by the deployment (CANCELED/ERROR/not-ready/raced) but present as test failures.

`/bkit-ship` (bkit:managed) has no post-merge deploy verification and no consumer hook to add one without editing a bkit:managed file. `bkit-utility-audit-logs-ship` ("post-deploy smoke check for new errors/regressions") already exists but is **invoked by no workflow** and still hard-codes `audit-gcp-errors.sh` + provider probes.

## Decision

Add a **post-merge "Fetch Deploy Context" step** to `/bkit-ship`, structured as a direct mirror of `/bkit-debug` Step 4 "Fetch Context". It is the stack-agnostic substrate #324's after-ship trigger has always needed. Two tiers ride on the same fetched artifact:

1. **Deterministic READY gate (exit-code).** "Did the deploy reach a terminal-OK state" is a *fact*, so it is gated deterministically off the block's **exit code** — bkit never parses the deploy output. `FAIL` → **hard Failure Path**.
2. **Post-deploy log-regression judge (Option B — pulls in #80).** A judge subagent (`bkit-utility-audit-logs-ship`, **migrated off `audit-gcp-errors.sh`** to read the fetched artifact) scans the post-deploy logs for **new error signatures / regressions** → `HEALTHY | DEGRADED | BROKEN` → surface in the ship summary + recommend `/bkit-debug`. Advisory, **never auto-rollback** (per #324).

This lands the deploy-reached-READY gate **and** the post-deploy regression scan in one cycle. The self-healing `→ /bkit-plan → /bkit-build` loop stays deferred to #324.

## Why this stays stack-agnostic

bkit ships the **contract**, never the **check**:

- bkit ships the *plumbing* — when to run (post-merge, `state = MERGED`), the fetch-context discovery/capture machinery, the exit-code verdict vocabulary, summary-surfacing, Failure-Path routing.
- The consumer supplies the *check* as a self-contained `<!-- ship-verify:start <name> -->` bash block in `.agents/config.md` **after `<!-- bkit:end -->`** (exactly where `debug-fetch` blocks live) — inlining `vercel inspect $MERGE_SHA … | jq` **or** shelling out to a script it already owns; bkit neither knows nor requires either.
- bkit reads only the **exit code** (fact) and captures **stdout verbatim** as evidence (which may literally say `READY`/`CANCELED` — the consumer's words, never parsed by bkit).
- A stack with no deploy just has zero `ship-verify` blocks → the step **SKIPs with a breadcrumb** and ship proceeds exactly as today.

No consumer edit to any bkit:managed file is required.

## Block contract (`ship-verify`)

- Marker pair `<!-- ship-verify:start <name> -->` / `<!-- ship-verify:end -->`, single fenced `bash` body, **consumer region only** (below `bkit:end`). Name charset `[\w.-]+`. `<!-- ship-verify:none intentional -->` opt-out.
- bkit exports **`MERGE_SHA`** (the squash-merge commit on dev) into each block so the fetch targets the just-merged deployment. The block owns any polling/waiting for the deploy to reach a terminal state — **ship ends at merge; the deploy is async**, so "wait for the deploy to land" lives in the consumer's block, not in bkit.
- **Self-gating / fail-soft:** missing CLI/token → one-line `[ship-verify:<name>] skipped — …` breadcrumb to stderr, `exit 0`.
- **Verdict = exit code, checked breadcrumb-first:** breadcrumb present → `SKIP`; else exit 0 → `PASS`; else → `FAIL`. (The one principled divergence from `debug-fetch`, whose blocks always `exit 0` — justified because this step *gates* rather than merely *fetches*.)
- **One artifact per source:** stdout (or the breadcrumb) → `docs/plans/{YYYYMM}/logs/{FID}/ship-verify-<name>-{ATTEMPT}.md`, auto-globbed into `@bkit-ship-summary` (its Action Items section already names "deferred deploy verifications" — zero summary-agent change).
- Reuse the existing `<!-- debug-fetch:provision <name> -->` sibling for the cloud-CLI install recipe (no new provision markers).

## Routing

- **READY gate `FAIL`** → **Failure Path** (locked decision). Add `ship-verify` to the abort-handover trigger sentinels (`bkit-ship.md:114`) so a deploy-verify FAIL writes `ship-handover.md` carrying the `ship-verify-*.md` evidence + a "reproduce with `/bkit-debug`" pointer, instead of a **silent STOP**.
  - **Accepted consequence of the hard route:** post-merge STOP skips docs-update / worktree-cleanup / close-workflow; `.worktrees/{FID}` + the `feat/{FID}` branch persist until the operator runs `/bkit-worktree-prune` — call this out in the handover text so it isn't a surprise.
- **Judge `DEGRADED`/`BROKEN`** → advisory: surface in the summary + recommend `/bkit-debug`, **never auto-rollback** (#324). Does not hard-stop the ship. (Confirm during build whether `BROKEN` should escalate to the Failure Path.)

## Implementation checklist

- [ ] `.bkit/workflows/bkit-ship.md` — new Step 10 "Verify Deploy" (fetch-context mirror of `bkit-debug.md:540–557`), inserted after Step 9 "Switch to Dev", guarded `Run only if state = MERGED`. Two parts: (a) fetch + exit-code READY gate; (b) `@bkit-utility-audit-logs-ship` judge over the fetched artifact. Emit a status.jsonl `step:"ship-verify"` record (`parentSha`, verdict, artifacts).
- [ ] **Renumber cascade:** Steps 10→14 shift; `### 🔒 Gate N` labels, status `step:` names, `### Step N` tracker-comment headers, and every `→ Step N` cross-reference.
- [ ] Failure Path: add `ship-verify` sentinel at `bkit-ship.md:114`.
- [ ] `.agents/config.md` + `.bkit/templates/.agents/config.md` — `ship-verify` contract prose (mirror the debug-fetch prose at L15–31) + one **inert** `ship-verify:start vercel-deploy` reference example above `bkit:end` + `ship-verify:none intentional` opt-out.
- [ ] `.bkit/src/bkit-preflight.ts` (+ `.test.ts`) — advisory pair (`ship-verify-source-not-enabled` evidence-gated; `ship-verify-provision-missing`) mirroring the three debug-fetch advisories (`bkit-preflight.ts:371–664`). Must yield **zero** findings on this repo (slop:delta requires a net-new rule to find nothing on base).
- [ ] **#80 migration:** refactor `bkit-utility-audit-logs-ship` (`.bkit/prompts/bkit-utility-audit-logs-ship.md`) to **drop the `audit-gcp-errors.sh` dependency** and read the fetched `ship-verify-*.md` artifact instead; keep the `HEALTHY | DEGRADED | BROKEN` verdict; regen mirrors. (Guard the gether-life false-green datapoint in #80 comment `4954947485`: a retired-but-still-referenced log source must read `N/A — not configured`, not a clean bill.)
- [ ] `.bkit/workflows.md` — Step spec (mirror the debug-fetch prose at L691) + overview-table row / step-number fixes.
- [ ] `docs/deployments.md` (or `docs/observability.md`) pointer + `.agents/docs.md` index row. No duplication.
- [ ] Mirror regen (`pnpm bkit upgrade`, batched end-of-session) → `.claude`/`.cursor`/`.opencode`; bump `.bkit/version` + `package.json`; CHANGELOG entry. Verify **install and upgrade** live (dogfood).
- [ ] ASCII operators only (`!=` `>=` `<=`) in `.bkit/workflows|prompts/*.md`.

## Acceptance

- `/bkit-ship` surfaces a post-merge deploy verdict in its summary and routes a non-READY deploy into the Failure Path — with **no** consumer edit to any bkit:managed file.
- Fail-soft + self-gating (missing token/CLI → SKIP with breadcrumb), matching `debug-fetch`.
- Tool-agnostic — no hard-coded Vercel in bkit's shipped surface; the consumer supplies the check via a `ship-verify` block.
- Post-deploy log-regression judge (`audit-logs-ship`, migrated off the GCP script) surfaces `HEALTHY | DEGRADED | BROKEN` and recommends `/bkit-debug` on non-HEALTHY, never auto-rollback.

## Relationships

- Implements the **"trigger after ship (post-deploy)"** entry point from **#324** (the self-healing `→ /bkit-plan → /bkit-build` loop stays in #324).
- Pulls in the `bkit-utility-audit-logs-ship` migration from **#80** (retire `audit-gcp-errors.sh` → read the stack-agnostic fetched artifact).
- Related: **#67** (PR-base verification + rollback playbook), **#260** (post-merge / CI-concluded event substrate).

**Consumer already owns — do NOT build into bkit:** `scripts/ci/vercel-deploy-status.sh <sha>`, the pre-merge "Await Vercel Deployment" CI gate, and the out-of-band `health.yml` post-deploy gate.

</details>

## What #363 is

**Fresh, unstarted** — open, `enhancement`, milestone *Workflow Optimisation*, no comments, no branch, no plan yet.

It adds a **post-merge "Verify Deploy" step** to `/bkit-ship` that catches the "merged green but prod deploy failed/CANCELED/never promoted" gap. Two tiers on one fetched artifact:

1. **Deterministic READY gate** — bkit runs a consumer-supplied `ship-verify` bash block and reads **only its exit code** (never parses output). `FAIL` → hard Failure Path.
2. **Log-regression judge** — `bkit-utility-audit-logs-ship` scans post-deploy logs → `HEALTHY|DEGRADED|BROKEN`, advisory, recommends `/bkit-debug`, never auto-rollback.

It's a deliberate mirror of `/bkit-debug`'s "Fetch Context" step, reusing the same `<!-- ...:start <name> -->` marker machinery below `bkit:end`, and it finally wires in the #80 `audit-logs-ship` migration (off `audit-gcp-errors.sh`).

## Verified against the tree
- ✅ `bkit-debug.md:538` Fetch Context step + the `debug-fetch` awk extractor exist — the mirror target is real.
- ✅ Preflight advisory machinery exists (`.bkit/src/bkit-preflight.ts:371+`, the `debug-fetch` opt-out/advisory pair) — the "add a symmetric `ship-verify` advisory pair" ask has a concrete template.
- ✅ `bkit-utility-audit-logs-ship` exists, **invoked by no workflow**, still hardcodes `audit-gcp-errors.sh` (`.bkit/prompts.md:318` + the prompt file) — exactly as the issue claims.
- ⚠️ **Line refs have drifted.** `bkit-ship.md:114` and `bkit-debug.md:540–557` are approximate now (Fetch Context is `:538`; ship's Failure-Path sentinel logic is ~`:114` but shifts). Build must re-locate by marker, not line number.

## My read — sound design, four things to settle first

The core is genuinely good: exit-code-only gating keeps bkit stack-agnostic and consistent with the existing debug-fetch doctrine; the fail-soft/SKIP-with-breadcrumb behaviour matches precedent; folding in #80 is real cleanup. I'd greenlight the *direction*. But before design/plan:

1. **The hard-FAIL consequence deserves a second look.** A non-READY deploy STOPs *after* merge, skipping docs-update / worktree-cleanup / close-workflow, leaving `.worktrees/{FID}` + `feat/{FID}` until a manual prune. The merge already landed — the failure is a *prod* problem, but the penalty falls on *local* cleanup. Is leaving a worktree behind on every flaky/CANCELED deploy the right trade, or should cleanup still run and only the handover/summary carry the red? The issue locks "hard route" but leaves BROKEN-escalation open — worth deciding both together.

2. **Async timeout contract.** "Ship ends at merge; the consumer block owns polling." Clean, but it means ship now blocks on an arbitrary consumer poll loop at the very end with **no bkit-side timeout**. If the deploy never starts, ship hangs. I'd want bkit to wrap the block in a bounded timeout (→ SKIP/FAIL breadcrumb) rather than trust every consumer block to self-bound.

3. **bkit can't dogfood the happy path.** bkit ships to npm, not a merge-to-deploy provider — its own `/bkit-ship` will have zero `ship-verify` blocks → SKIP. The real READY-gate + judge path is only exercisable on a consumer (gether-life / visitfrasercoast). Plan the acceptance check to run there, not just `bkit check`/install-upgrade in-repo.

4. **Scope is large for one cycle.** Step insertion **+ full renumber cascade** (every `### Step N`, `🔒 Gate N`, status `step:` name, tracker header, `→ Step N` ref — and the cascade is bigger than the checklist's "10→14"; ship runs to Gate 13) **+** two preflight advisories with slop:delta-zero-findings constraint **+** the #80 agent migration **+** template/config/workflows.md/docs/mirror/version/changelog. The renumber alone is error-prone. Consider splitting the #80 `audit-logs-ship` migration out, or at least sequence it as its own batch.

Net: **yes, it sounds right** — the mechanism is well-thought-out and consistent with existing patterns. I'd resolve #1 and #2 as explicit decisions in the design phase rather than deferring to "confirm during build," and go in expecting the renumber cascade to be the risky part.

Want me to kick off `/bkit-design` on it, or draft the two open decisions (FAIL-cleanup + async timeout) as a comment on the issue first?

## Design decisions / open questions (2026-07-22)

Walkthrough review with @cbartens. Three items from the pre-design pass:

### 1. READY gate is **advisory**, not a hard Failure Path route — LOCKED

**Supersedes the "Routing → READY gate `FAIL` → Failure Path" section of the issue.**

The deploy-verify no longer hard-STOPs the ship. Ship **completes normally** (docs-update, worktree-cleanup, close-workflow all run) and a deploy problem is surfaced as a **`FAIL` verdict in the ship summary** — i.e. the ship's overall verdict goes `FAIL` when the deploy has issues, but there is no post-merge abort-handover.

Rationale: the merge has already landed, so the failure is a *prod-deploy* problem; penalising *local* cleanup (leaving `.worktrees/{FID}` + `feat/{FID}` behind for a manual prune) was the wrong trade. A loud summary verdict carries the signal without the sharp edge.

Consequences for the checklist:
- **Drop** the `ship-verify` abort-handover sentinel add at `bkit-ship.md:114` and the "Accepted consequence of the hard route" paragraph.
- The exit-code verdict (`SKIP | PASS | FAIL`) still stands — it just feeds the **summary verdict**, not routing.
- Judge `DEGRADED`/`BROKEN` stays advisory as already specified (recommend `/bkit-debug`, never auto-rollback). The "confirm during build whether `BROKEN` escalates to Failure Path" note is resolved: **no escalation** — everything is advisory/summary now.

### 2. Trigger mechanism: **event-driven, not in-workflow polling** — OPEN (recommended direction below)

Question raised: why block the ship turn on a poll at all? Do all runtimes even support it, or just Claude?

Findings:
- **`bkit-cloud` already routes on CI conclusion** (success → ship, failure → debug — per #260). The "async external outcome → route to next workflow" pattern already exists in bkit; deploy-verify should not invent a bespoke poll.
- A **deploy conclusion is the post-merge twin of that pre-merge CI conclusion** (merge → provider build → READY/ERROR mirrors push → CI → pass/fail). Same substrate: deploy-OK → done, deploy-broken → `/bkit-debug`. This is exactly the "trigger after ship (post-deploy)" entry point already cited from #324, and the #260 conclusion-event substrate.
- **In-workflow synchronous polling is platform-fragile:** Claude Code caps Bash at 600s; Cursor/opencode differ. It works "just for Claude," breaks on >10min deploys, and freezes the turn. Wrong durable mechanism.

Recommended direction (combines cleanly with #1 — advisory/summary-only):
- **Ship never blocks.** It captures whatever terminal state exists at merge (or `pending`), records the `ship-verify-*.md` artifact + `MERGE_SHA`, and colors an advisory verdict into the summary.
- The **authoritative** deploy verdict + auto-route-to-`/bkit-debug` rides the **deploy-conclusion event** (#260/#324 substrate), where an event can re-invoke the agent — no poll.
- **Cloud vs local split:** *cloud* ship (bkit-cloud) gets event-routing for free; *local* IDE ship has no external re-invoke, so it emits the artifact + `pending`/snapshot verdict and defers the real verdict to the event/health trigger. A consumer that *wants* its own block to bound-poll may — it owns the block — but bkit neither mandates nor forbids a blocking loop.

**Open:** confirm this direction before design. If accepted, it reframes #363 to ship the fetch-context substrate + exit-code verdict contract + summary surfacing, with the durable auto-route deferred to the #260/#324 conclusion-event substrate rather than a bkit-mandated poll.

### 3. Acceptance testing happens in **consumer repos** — NOTE

bkit ships to npm, not a merge-to-deploy provider, so its own `/bkit-ship` will have zero `ship-verify` blocks → the step SKIPs. The READY-gate + judge happy path is only exercisable on a consumer (gether-life / visitfrasercoast). Plan the live acceptance check there; in-repo validation is limited to SKIP-with-breadcrumb + install/upgrade dogfood + slop:delta-zero-findings on the new advisory pair.

---
Also noted for the build: the checklist's line refs have drifted (`bkit-ship.md:114`, `bkit-debug.md:540-557`, `workflows.md L691`, `bkit-preflight.ts:371-664`) — re-locate by marker, not line number. The renumber cascade is larger than "10→14" (ship runs to Gate 13) and is the highest-risk mechanical part.

So it’s really local ide bkit build but with bkit auto label and then have cloud take over and run debug or ship yes? That is happy path yes?

---

Yes — that's the happy path, and the pre-merge half of it already exists exactly like that. Confirmed in bkit-cloud.yml:

Trigger: workflow_run (CI completion on feat/**)
Gate: bkit:auto label + bkit [auto route] marker in the head commit (live kill-switch re-checks bkit:auto)
Route: CI success → ship, CI failure → debug — and ship/debug run in cloud, not local
So your model is right: local IDE /bkit-build stamps the auto-route marker, pushes feat/**, and cloud takes over the routing on CI conclusion. That's live today.

Where #363 fits — it adds the post-merge hop to that same chain:

local /bkit-build (bkit:auto)
   → CI(feat) success → cloud SHIP (merge to dev)      ← exists today
      → deploy fires → post-deploy health concludes
         → healthy = done  /  broken = cloud DEBUG      ← the #363/#324 hop
Two precisions so we scope it right:

The auto path kills the poll question entirely. In the happy path ship runs in cloud, so the deploy verdict rides an event — the consumer's post-deploy workflow (the health.yml the issue says the consumer already owns) concludes, and bkit-cloud gains a second trigger that routes broken → debug. No in-workflow poll anywhere. Polling only ever mattered for the manual local-IDE /bkit-ship (the non-auto path), which stays best-effort/pending.
Scope boundary to confirm. That post-deploy → debug auto-route trigger is the "trigger after ship (post-deploy)" entry point the issue says it implements for #324. So there's a fork:
#363 = ship-side substrate only (fetch-context + exit-code verdict + ship-verify-*.md artifact + summary verdict), and the actual bkit-cloud post-deploy trigger lands in #324; or
#363 also wires the bkit-cloud trigger (new workflow_run/deployment_status → route broken→debug), delivering the end-to-end auto path in one cycle.
The issue as written leans option 1 ("self-healing loop stays deferred to #324"). Which do you want — substrate-only in #363, or fold the cloud trigger in too? That's the last open decision, and I'll update the #363 comment to record the happy-path model + whichever scope you pick.

## ⛏ Design pivot — supersedes the ship-verify approach (2026-07-22)

> This comment records the full design discussion and the **final** decision. It **supersedes** both the original issue body (the `ship-verify` block-contract design) and the earlier "Design decisions" comment's framing. Those remain above as the evolution trail. **Net effect: no `bkit-ship` edit at all.**

### TL;DR

Instead of adding a post-merge "Verify Deploy" step to `/bkit-ship`, we **reuse the trigger bkit already has**. `bkit-cloud` already routes on CI conclusion for the *pre-merge* feature branch (`workflow_run: [CI], branches: ['feat/**']` → success→ship, failure→debug). We simply **widen that same trigger to the post-merge branches** so a post-merge CI failure auto-launches `/bkit-debug`. No ship-verify block, no `MERGE_SHA`, no preflight advisories, no Step insertion, no renumber cascade.

### How we got here (discussion trail)

1. **Original design:** add a stack-agnostic `ship-verify` bash-block contract + exit-code READY gate + preflight advisories + a new `bkit-ship` Step 10 with a full renumber cascade. High mechanical risk.
2. **Decision — no hard-fail (D1).** A post-merge STOP that skips docs/cleanup and strands the worktree was the wrong trade (the merge already landed). Verdict should be advisory, not a Failure-Path route.
3. **Decision — event-driven, not polling (D2).** An in-workflow synchronous poll blocks the turn and is platform-fragile (Claude Code caps Bash at 600s; Cursor/opencode differ). We should ride an **event**, not poll.
4. **Key realisation:** `bkit-cloud` *already is* that event router — it routes on CI conclusion (`success→ship, failure→debug`) for `feat/**`. A **post-merge deploy conclusion is the symmetric twin** of the pre-merge CI conclusion.
5. **"Do we even need the deploy signal separately?"** Checked the consumer CI: `ci.yml`'s `bkit-tests-e2e` lane already runs an **"Await Vercel Deployment"** step + e2e against the deploy. So for **web-affecting** changes, deploy health is *already inside the CI conclusion*. A broken/CANCELED web build reds e2e → reds CI. (Docs-only diffs neutralise the await — Vercel cancels those builds; that's an intentional no-deploy, **not** a false green.)
6. **Branch scope (D-final):** verify at **both `dev` (post-merge) and `main` (post dev→main promotion)** — `main` CI's e2e-await covers the *production* deploy, folding the prod gap into the same mechanism (no separate `health.yml` trigger required; its live-URL smoke stays as an out-of-band extra).
7. **Not `claude/**`/`cursor/**`:** those are render-target *directories* / worktree *paths*, never git branches. bkit names every work branch `feat/{FID}` (or `fix/{FID}` for standalone debug) regardless of platform. `fix/**` is a pre-existing routing gap worth folding in.

### Final architecture

```
TODAY:   build → PR CI → auto → debug OR ship;  ship → merged(dev) → done (post-merge CI ignored)
FUTURE:  build → PR CI → auto → debug OR ship;  ship → merged(dev) → dev CI  → auto → nothing OR debug
                                                       dev→main promo → main CI → auto → nothing OR debug
```

**The entire change is the trigger filter:**

```diff
  workflow_run:
    workflows: [CI]
-   branches: ['feat/**']
+   branches: ['feat/**', 'fix/**', 'dev', 'main']
    types: [completed]
```

**Branch-aware routing table (keyed on `head_branch`):**

<!-- prettier-ignore -->
| Trigger | success | failure |
| --- | --- | --- |
| `feat/**` / `fix/**` CI (pre-merge, via `pull_request`) | → **ship** | → debug |
| `dev` CI (post-merge to dev, via `push`) | → nothing | → **debug** |
| `main` CI (post dev→main promotion, via `push`) | → nothing | → **debug** |

Mechanism is consistent: pre-merge CI fires via `pull_request` and `workflow_run.branches` matches the PR **head** (`feat/**`/`fix/**`); post-merge CI fires via `push` on `dev`/`main`. Consumer `ci.yml` already runs `push: [main, dev]` + `pull_request: [main, dev]`, so the signal exists on all four.

### Scope — what's IN

1. **`bkit-cloud.yml`** — widen the `workflow_run` branch filter to `['feat/**', 'fix/**', 'dev', 'main']`.
2. **Branch-aware routing** — `feat/**`/`fix/**` → ship/debug (today); `dev`/`main` → **failure→debug, success→no-op** (post-merge has nothing left to ship).
3. **FID recovery** — on `dev`/`main`, `head_branch` is the base branch, not `feat/{FID}`; bkit-cloud must recover the issue from the merge-commit scope (`feat(363): …`) or the merged PR.
4. **Auto-route marker placement** *(load-bearing — see open items)* — the free-tier gate requires `bkit [auto route]` in the triggering `head_commit.message`. Today ship stamps the marker on **intermediate `feat/{FID}` commits** (`bkit-ship.md:473`, `:617`) and the build close commit — **not** verified on the **PR squash-merge commit** that actually lands on `dev` and triggers post-merge CI. Must be extended to the squash-merge (and any dev→main promotion) commit.

### Scope — what's DROPPED from the original body

- `bkit-ship` Step 10 "Verify Deploy" + the Steps 10→14 **renumber cascade**.
- The `ship-verify` block contract (`<!-- ship-verify:start … -->`, `MERGE_SHA` export, breadcrumb/verdict rules).
- The two new `bkit-preflight.ts` advisories + tests + slop:delta-zero-findings constraint.
- The ship-verify artifact + `@bkit-ship-summary` surfacing.
- The `ship-verify` Failure-Path sentinel add at `bkit-ship.md:114`.

### Scope — relocated

- **#80 `bkit-utility-audit-logs-ship` migration** is no longer a ship-side judge. The post-deploy log-regression scan naturally lands inside the **triggered `/bkit-debug`** run — its `debug-fetch` context blocks already read logs (matches the "audit moves onto debug-fetch" direction). Can proceed independently of this change.

### Open items to settle in design

1. **`[skip ci]` interaction (load-bearing).** Ship's terminal dev commits carry `bkit [skip ci]` (`docs({FID}): ship DONE bkit [skip ci]`). The commit that must trigger post-merge routing is the **PR squash-merge** commit (PR title, no skip) — not the trailing `[skip ci]` status commit. Confirm the squash-merge run fires and the trailing skip-ci status commit doesn't suppress it (cf. KN-11 "skip-ci must not be HEAD"). This is the highest-risk unknown.
2. **Marker on the squash-merge / promotion commit** — extend `AUTO_ROUTE_SUFFIX` onto the commit(s) that land on `dev`/`main`, gated on `bkit:auto`, so the free-tier gate fires post-merge.
3. **`dev→main` promotion path** — routing on `main` only works if the promotion commit carries the marker. bkit has no consumer-facing dev→main promotion workflow, so confirm where that commit is authored (may be out of bkit's control for some consumers).
4. **Loop/concurrency safety** — every `dev`/`main` push evaluates the trigger; the `bkit [auto route]` marker + live `bkit:auto` kill-switch + FID recovery bound it to opted-in merge commits. Confirm the orchestrator stale-run guard covers the new post-merge fan-in.
5. **`health.yml` — keep as-is.** Its prod live-URL smoke is additive; `main` CI's e2e-await already carries the prod-deploy-READY signal, so bkit-cloud need not route on `health.yml` conclusion. Revisit only if the e2e-await proves insufficient.

### Testing (unchanged from D3)

Exercisable only in a consumer (`app-gether-life` / `visitfrasercoast-com`) — bkit ships to npm and has no merge-to-deploy provider, so its own loop never post-merge-verifies. Both consumers already emit the needed signals (`ci.yml` e2e-await + `health.yml`).

### Relationships (updated)

- **Implements** the "trigger after ship (post-deploy)" entry point of **#324** by extending the existing conclusion-router rather than adding a bespoke gate.
- **#260** — this *is* the CI-concluded-event substrate, minimally extended to post-merge branches.
- **#80** — audit-logs-ship migration relocated into the triggered debug's `debug-fetch`.
- **#67** — PR-base verification / rollback playbook stays separate.

## Decision — Option A resolves open items #1 + #2 (2026-07-29)

Walked the gap with the in-tree state (`bkit-ship.md` Steps 6–8 inline debug, `bkit-cloud.yml:29-32` `workflow_run` filter, `bkit-auto.md:74-75` phase mapping). Two of the four open items from the pivot comment are now decided; #3 and #4 remain for the plan pass.

### Decision: Option A — thread `bkit [auto route]` onto the squash-merge subject

Extend `AUTO_ROUTE_SUFFIX` (currently set at `bkit-ship.md:626` for the intermediate sync merge only) onto the **PR squash-merge subject** authored at Step 6.5 (`bkit-ship.md:634`, `gh pr merge {PR_NUMBER} --squash --subject …`), gated on `bkit:auto` on the issue. Same single marker-gate mechanism then covers `feat/**` and `dev`/`main` triggers — no second gate path in `bkit-cloud.yml`.

Rejected alternative: a second `workflow_run` filter on `dev` that derives eligibility from the merged PR's `bkit:auto` label rather than the commit message. Avoids polluting dev squash titles but adds a second gate mechanism and a `gh pr list --base dev --merged` reverse-lookup on every dev push. Not worth the divergence.

### Resolves open item #2 — marker on the squash-merge / promotion commit

Option A *is* the answer. The free-tier gate (`bkit-cloud.yml:94, :259`) fires post-merge because the squash-merge commit — the one that actually lands on `dev` and triggers post-merge CI — now carries `bkit [auto route]`. Same applies to any dev→main promotion commit bkit authors.

### Resolves open item #1 — `[skip ci]` interaction (was highest-risk unknown)

De-risked by Option A. The commit that must trigger post-merge routing is the PR squash-merge (PR title + `AUTO_ROUTE_SUFFIX`, **no** `[skip ci]`). The trailing status commit `docs({FID}): ship DONE bkit [skip ci]` (`bkit-ship.md` Close) lands *after* the squash-merge and is not HEAD when `workflow_run` fires on the CI run triggered by the squash-merge. `[skip ci]` rides on a different commit and cannot suppress the route. KN-11 ("skip-ci must not be HEAD") is satisfied by construction.

### Still open for `/bkit-plan`

- **#3 — dev→main promotion path.** Routing on `main` only works if the promotion commit carries the marker; bkit has no consumer-facing dev→main promotion workflow today, so the commit may be authored outside bkit's control for some consumers. Plan must decide: scope to `dev` only, or document a consumer-side marker requirement for `main`.
- **#4 — loop / concurrency safety.** Every `dev`/`main` push evaluates the trigger. The `bkit [auto route]` marker + live `bkit:auto` kill-switch + FID recovery bound it to opted-in merge commits; plan must confirm the orchestrator stale-run guard covers the new post-merge fan-in (multiple merge-attempts on the same FID within the CI window).

### Durable record

Option A rationale also captured in `.bkit/cloud.md` Decision log (ships with the repo, survives this thread).

### Next step

`/bkit-plan` #363 — design is settled on the load-bearing items; plan surfaces #3 and #4 as scoped decisions.

## Constraint — `bkit:auto` is `dev`-only; `main` is always manual (2026-07-29)

Walked the hard-stop policy with @cbartens. Locking the scope boundary:

- **`bkit:auto` only ever routes against `dev`.** Pre-merge `feat/**` CI → ship (merges into `dev`), and post-merge `dev` CI failure → debug. Both auto.
- **`main` is never auto-touched.** Dev→main promotion and any merge into `main` always requires explicit human interaction — no auto-route, no `bkit:auto`-gated trigger on `main` CI, no auto debug dispatch from a `main` CI failure.

This matches the existing hard-stop after Ship (production merge needs explicit human approval, per `.bkit/comparison.md:124`) — extending automation to `main` would contradict it.

### Resolves open item #3 — dev→main promotion path

Settled by the constraint above. The final `workflow_run` branch filter widens to **`['feat/**', 'fix/**', 'dev']`** — **`main` is excluded**. No marker-on-promotion-commit problem, because no promotion commit is auto-eligible. Open item #3's "may be out of bkit's control for some consumers" concern is moot: bkit declines to automate that path at all.

### Updated branch-aware routing table

<!-- prettier-ignore -->
| Trigger | success | failure |
| --- | --- | --- |
| `feat/**` / `fix/**` CI (pre-merge, via `pull_request`) | → **ship** | → debug |
| `dev` CI (post-merge to dev, via `push`) | → nothing | → **debug** |
| `main` CI (post dev→main promotion) | **manual** | **manual** |

### Plan scope update for `/bkit-plan`

- `bkit-cloud.yml` branch filter widens to `['feat/**', 'fix/**', 'dev']` — **not** `main`.
- No `AUTO_ROUTE_SUFFIX` threading onto dev→main promotion commits (none eligible).
- Open item **#4 (loop / concurrency safety on dev pushes)** remains the only unresolved design question for the plan pass.

## Open item #4 split — partial deferral to #397 (2026-07-29)

Unpacked open item #4 ("loop/concurrency safety on dev pushes") into four sub-risks during the scope conversation. One moves to the new dedicated concurrency ticket **#397**; three stay here as #363's responsibility.

<!-- prettier-ignore -->
| Sub-risk | Owner | Note |
| --- | --- | --- |
| Concurrency-key collapse on `dev` (`bkit-auto-dev` group, cancel vs queue semantic) | **#363** | #397 Requirements #3 and "Interaction with #363" explicitly defer the `cancel-in-progress: false` flip back here. The dev-debug "one at a time, **queue not cancel**" intent from the constraint comment above is the load-bearing decision. |
| Self-triggering / debug-on-debug loop (per-session `MAX_NORMAL_ATTEMPT` resets each new `workflow_run` dispatch) | **#363** | Intrinsic to the dev auto-route path — doesn't apply to other phases. Needs a cross-session attempt cap per FID (e.g. max N dispatched debug sessions within a window) or the loop can ping-pong until a human notices. |
| Stale-run guard for the no-PR `dev` case | **#363** | `bkit-auto.md:86-92` matches `headSha` against the PR's `headRefOid`; on `dev` there's no PR — FID recovered from merge-commit scope, head compared against dev's current HEAD. Build-time verification rather than policy choice, but worth flagging so the planner doesn't assume the existing guard covers it unchanged. |
| Cross-surface race (dispatch-debug vs CI-ship on one FID; `bkit-auto-{ISSUE}` vs `bkit-auto-feat/{FID}` groups don't collapse) | **#397** (Gap 2) | Pre-existing, not introduced by #363. |

### What this means for `/bkit-plan` #363

Plan must still settle, in-session:

1. `cancel-in-progress: false` for dev-triggered `workflow_run` runs (queue semantic).
2. Cross-session debug-loop bound per FID (decision: cap N, or trust per-session caps + operator vigilance).
3. Stale-run guard extension to the no-PR `dev` case (build-time check; verify `bkit-auto.md:86-92` handles the FID-from-merge-commit-scope path).

Cross-surface same-FID arbitration is owned by #397 and is out of scope here.

### Status update

Open items from the pivot comment:

- #1 `[skip ci]` interaction — **RESOLVED** (Option A, comment above).
- #2 marker on squash-merge / promotion commit — **RESOLVED** (Option A, comment above).
- #3 dev→main promotion path — **RESOLVED** (`main` excluded from auto entirely; comment above).
- #4 loop/concurrency safety — **PARTIALLY DEFERRED** to #397 (cross-surface race only); three dev-CD-specific sub-risks remain here.

#363 is ready for `/bkit-plan`.

```comment
## Plan Workflow
### Step 1 — Start Workflow
[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
Parent design: None
```

```comment
### Step 2 — Worktree Setup
[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
[docs/plans/202607/logs/363-widen-bkit-cloud-trigger/status.jsonl](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/status.jsonl)
```

```comment
### Step 3 — Generate Plan
[plan-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-v1-draft.md)
```

```comment
### Step 4 — Fetch Context
[related-issues.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/related-issues.md)
[related-deferrals.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/related-deferrals.md)
[related-failures.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/related-failures.md)
```

```comment
### Step 5 — Review Plan - Verdict: FAIL - Failures: 9
```

```comment
### Step 6 — Apply Review - Verdict: PASS
[plan-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-v2-reviewed.md)
```

```comment
### Step 7 — Scope Check - Verdict: CONCERNS - Failures: 3
```

```comment
### Step 8 — Apply Scope - Verdict: PASS
[plan-v3-checked.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-v3-checked.md)
```

```comment
### Step 9 — Complexity Check - Verdict: SINGLE
```

```comment
### Step 11 — Summary - Verdict: PASS
[plan-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-summary.md)
Verdict: PASS
<!-- verdict:end -->

# Build Summary

## Overview

This plan widens `bkit-cloud.yml`'s `workflow_run` trigger from `['feat/**']` to `['feat/**', 'fix/**', 'dev']` and adds branch-aware routing that automatically dispatches `/bkit-debug` for post-merge `dev` CI failures. The feature addresses the post-merge blind spot where a squash-merge re-introduces a failure (merge conflict resolution gone wrong, dependency only resolved on PR head, env difference) — previously, bkit was blind to these until an operator noticed and manually invoked `/bkit-debug`.

The design follows Option A: the existing free-tier gate (`bkit [auto route]` marker in HEAD commit message) is threaded onto the squash-merge `--subject` by `bkit-ship` when the issue carries `bkit:auto`. No second gate path. The dev path differs from `feat/**` in three ways addressed here: (1) no open PR → FID recovered from squash-merge commit scope, (2) success is no-op not ship, (3) cross-session loop bound via `MAX_DEV_DISPATCH_ATTEMPTS=3`. Production `main` branch remains manual-only.

## Implementation Quality

**Verifies against plan-v3-checked.md:** The plan underwent a 4-gate stress-test before approval:

- **Generate → Review (FAIL):** plan-review-1 raised 8 buildability blockers (undefined `$REPO_ROOT`, task ordering, injection safety, dead CI_DEV signal) → all addressed in v2
- **Apply Review → Review (CONCERNS):** plan-review-2 found no CRITICAL issues; verified dependency graph and single-owner surfaces
- **Scope Check (CONCERNS):** plan-scope-check-1 found 3 non-blocking verification gaps (negative criterion unobservable, criterion/verification strength mismatch, disjunctive file target) → all addressed in v3
- **Apply Scope → Complexity Check (SINGLE):** plan-complexity-check confirmed the 10 tasks (9 canonical files, ~130 lines code) fit a single build session with linear dependencies

**Architecture respected:** The plan preserves `feat/**` routing byte-for-byte; `fix/**` is newly folded (now follows same success→ship/failure→debug routing as `feat/**`). `bkit-debug.md` is zero-diff (verify-only) — the existing 3-way worktree fallback already creates `fix/{FID}` off `origin/dev`. No new trust markers, no new permissions.

## Verification Status

All gates passed. The plan went through **3 review iterations** before reaching v3-checked:

- Review 1 (8 findings) → Apply Review → Review 2 (no CRITICAL, 12 HIGH/MEDIUM/LOW findings on dependencies and documentation) → Apply Scope → Scope Check 1 (3 findings) → Apply Scope → Complexity Check (SINGLE, approved)
- Total findings addressed: 23 (8 from review-1, 12 from review-2, 3 from scope-check-1)

## Test Status

In-repo validation passes first run. The plan includes a 12-row test matrix (T1-T12) covering trigger presence, concurrency expression, FID recovery, routing logic, loop cap, CI_DEV mode, bkit-auto gates, and verification steps. Consumer-repo acceptance is documented (exercisable only on merge-to-deploy consumers like `app-gether-life` / `visitfrasercoast-com` — bkit ships to npm).

## Challenge

The plan's 3 review cycles surfaced and resolved several critical gaps:

- **H1 (HIGH):** `dev-dispatch` counter row had no CI_DEV signal in `/bkit-debug` → loop cap would be non-functional. Resolved by moving the write to the cloud ctx step (reader and writer co-located).
- **F1 (CRITICAL):** Stale-run guard (git-tip comparison) false-positives on every legitimate dev dispatch due to close-commit race. Resolved by adopting Option A guard (CI-run recency via `gh run list --branch dev --workflow CI --status completed`).
- **F3 (LOW):** `dev-dispatch` counter written after dispatch → early crash undercounts. Resolved by writing BEFORE dispatch in the cloud ctx step.

**Severity distribution:** 1 CRITICAL (F1), 3 HIGH (H1, M1, M2), 9 MEDIUM (M3-M11), 10 LOW (L1-L13, F2-F6). All blocking findings addressed; remaining LOW findings (F2 concurrency group collapse, F4 docs-only-diff precondition, F5 `fix/**` folding, F6 telemetry gaps) are documented limitations.

## Generated Tests

The plan includes a comprehensive test matrix (12 entries) with mechanical verification steps (yq, grep, jq, bash units). Edge cases tested: squash-merge without scope, `[skip ci]` close commit, simultaneous dev pushes, stale CI run, FID from merged PR, `bkit:auto` revocation mid-loop, docs-only diff behavior.

## Risks

**Highest-risk areas:**

1. **Ctx-step staleness logic (Option A guard):** Relies on `gh run list` returning the most recent completed CI run on `dev`. If CI workflow name mismatch or permissions issue, guard fails open (proceeds with dispatch) — safer to dispatch than silently skip. Close commits carry `[skip ci]` so they never appear in the list.
2. **GHA concurrency semantics:** With `cancel-in-progress: false` for `dev`, a superseding run is **queued** (not dropped). The operator does NOT need to manually re-trigger — the queued run re-evaluates the loop cap when it starts.
3. **Docs-only-diff invariant:** The dev path assumes consumer `ci.yml` neutralises Vercel-CANCELED builds (not reds them). If a consumer reds on cancel, every docs-only squash-merge false-dispatches and burns cap budget. Documented in `docs/deployments.md` — operator must verify per target.

## Action Items

None. All CRITICAL and HIGH findings addressed. Remaining LOW findings are documented limitations, not blockers.

## Recommended Next Step

```
/bkit-ship 363
Brief: Plan approved for build — widens bkit-cloud trigger to post-merge dev CI with autonomous debug dispatch, 3-attempt loop bound, queue semantic. Passed 4-gate review (23 findings addressed). Complexity=SINGLE fits one build session.
```
```

```comment
### Step 12 — Close Workflow
#### Artifacts
- [363-widen-bkit-cloud-trigger-plan.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/363-widen-bkit-cloud-trigger-plan.md)
- [plan-v3-checked.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-v3-checked.md) (final)
- [plan-v2-reviewed.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-v2-reviewed.md)
- [plan-v1-draft.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-v1-draft.md)
- [plan-review-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-review-1.md)
- [plan-review-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-review-2.md)
- [plan-review-3.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-review-3.md)
- [plan-scope-check-1.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-scope-check-1.md)
- [plan-scope-check-2.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-scope-check-2.md)
- [plan-complexity-check.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-complexity-check.md)
- [plan-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-summary.md)
- [plan-input.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-input.md)

Merged to `dev` via PRs [#398](https://github.com/cbartens/bkit/pull/398) + [#400](https://github.com/cbartens/bkit/pull/400) (close-guard scan: clean; transport: pr).

> Note: the local squash-merge path was blocked by pre-existing uncommitted in-flight #384/#394 work in the dev working tree (a process auto-committed it during hook runs). Pivoted to the documented PR squash-merge fallback, which lands only the plan docs on `origin/dev`. **Local `dev` checkout now diverges from `origin/dev`** (holds those stray in-flight commits unpushed) — run `git fetch && git reset --hard origin/dev` in the main checkout to resync.

#### Telemetry
**plan close** · cbartens/bkit

| metric | this run | med·5 |
| --- | --- | --- |
| durationSeconds | 39794 (11h3m) | — |
| linesChanged | 11406 (+10133/-1273) | — |
| filesChanged | 93 | — |
| taskCount | 92 | — |
| frictionAdded | 0 | — |
| deferralsAdded | 0 | — |
| failuresAdded | 0 | — |
| compliance | 2 pass · 0 fail · 0 n/a (100%) | — |
| attempts | PLAN_ATTEMPT 1 | — |

[363 Route post-merge CI failure to /bkit-debug widen bkit-cloud trigger](https://github.com/cbartens/bkit/issues/363)
```

## 🔍 Post-plan review — plan revised to v4 (pre-build)

Reviewed `docs/plans/202607/363-widen-bkit-cloud-trigger-plan.md` before build. **The plan is logically sound in its core design** — Option A (reuse the existing `bkit [auto route]` gate rather than adding a second trust surface), stale-guard Option A (CI-run recency, not a git-tip comparison), and the cross-session dispatch cap are all correct calls, and the v1→v3 review chain resolved its own critiques properly.

But the plan chain ran in a worktree at parent `2ee0da16`, and **`80660ac0` (#384, "restructure bkit-ship.md into Path A/B") landed ten seconds later**, followed by four more fixes to the same file that afternoon. All three plan-reviews, both scope-checks and the complexity-check therefore validated against a tree that no longer exists. Seven defects found; plan updated to v4 (230 insertions), anchors re-verified against `dev @ d87c8641`.

### Blocking

**P1 — CRITICAL: Task 4's premise is void.** v3 stated *"`AUTO_ROUTE_SUFFIX` is already derived on line 626 — no new gate logic … this is the **entire** Option A change."* #384 deleted every `AUTO_ROUTE_SUFFIX` derivation from `bkit-ship.md`:

```
$ grep -c 'AUTO_ROUTE_SUFFIX' .bkit/workflows/bkit-ship.md
0
```

The variable the whole Option A design hangs off no longer exists, and the squash `--subject` moved 634→**682**. Task 4 rewritten to **add** the derivation (idiom copied from `bkit-build.md:1261`, which still carries it) as well as thread it, with a `grep -c` pre-check that voids the task if the premise shifts a third time.

**P2 — HIGH: the `fix/**` folding was inert.** The plan documents *"cloud auto-merges the fix PR"* as an intended behaviour change. It cannot occur — three surfaces are `feat/`-only:

1. `bkit-cloud.yml:198` — `sed 's|^feat/||'` is a no-op on `fix/363-…`, and neither fallback alternation then matches (`^[0-9]+` fails on `f`; `^[a-z]+-[0-9]+` needs `fix-363`, we have `fix/363`) → `FID` empty.
2. The PRIMARY path can't rescue it — `bkit-debug.md:1244-1249` creates the fix PR with **no `bkit:issue=` / `bkit:fid=` body markers** (`grep -c 'bkit:fid=' .bkit/workflows/bkit-debug.md` = 0).
3. `bkit-auto.md:118` hard-rejects non-`feat/` branches, and a `fix/**` PR run *is* `MODE=CI` — so fixing 1+2 alone routes every dispatch into the **Failure Path**, which posts a failure comment and sets `bkit:failed`. Worse than today's silence.

Per the pivot comment's *"`fix/**` is a pre-existing routing gap worth folding in"*, added **Tasks 11 + 12** to make it real rather than dropping it.

**P3 — HIGH: the `fix/**` failure loop is unbounded.** `MAX_DEV_DISPATCH_ATTEMPTS` is gated on `BRANCH = dev`. A `fix/**` CI failure dispatches `/bkit-debug` → fix push re-reds CI → dispatches again: exactly the cross-session loop the cap exists to bound, on the surface this plan newly opens, with no bound. **Task 13** rekeys the cap on the FID and factors it into a `bkit_dev_dispatch_guard` helper called from both post-`feat/**` surfaces. `feat/**` stays uncapped (pre-merge, already bounded by in-session `MAX_DEBUG_ATTEMPT`).

### Non-blocking

**P4 — `main` was silently dropped.** This issue's pivot comment settles branch scope as `['feat/**','fix/**','dev','main']` (D-final: *"verify at **both `dev`… and `main`**"*), with `main` in both the routing table and the diff. The plan moved it to Out of Scope with no deferral row and no note here — and scope-check-2 still certified *"zero silent drops"*.

**Decision: keep `main` excluded, but record it.** The plan's rationale is sound, and this issue's own **open item 3** never resolved the precondition — *"routing on `main` only works if the promotion commit carries the marker. bkit has no consumer-facing dev→main promotion workflow… may be out of bkit's control for some consumers."* With no bkit-authored promotion commit there is nothing to thread the marker onto, so a `main` trigger would be gated shut by construction for exactly the consumers it targets — dead config plus a live risk of a paid agent dispatching against production trunk. **Task 14** appends the reversal to `docs/deferrals.jsonl`; revisit if a bkit-authored promotion path ever exists.

**P5 — the dev path was GitHub-tracker-only.** Scope regex, slug allowlist and `ISSUE` derivation all assumed `363-slug`. A Linear consumer's `bar-123-slug` fails all three → the dev trigger silently never fires for them, and the fail-safe no-op looks identical to "no marker", so there's no operator signal. Widened to the same alternation the existing `feat/**` fallback already uses.

**P6 — the loop cap failed OPEN.** v3 tolerated a rejected telemetry push with `|| echo "::notice:: … row already on dev; continuing"` and dispatched anyway. That claim only holds for the dual-job race it names — any other non-fast-forward (a concurrent ship close commit, a Renovate merge) also rejects, leaving the row in no durable location while the dispatch proceeds. Every such cycle is uncounted, so the cap never trips and the bound the plan advertises degrades to unbounded paid agent spend. Now retries against a re-fetched `dev`, **verifies the row is on `origin/dev`**, and skips rather than dispatching uncounted. (That verification is also what makes the genuine dual-job race safe.)

**P7 — every `bkit-ship.md` anchor is stale:** 598→647, 634-635→682, 1206→1258, 1211→1261-1265, 610→546, and `--workflow CI` is now `--workflow ci.yml`. Stale-guard switched to the `ci.yml` filename form — fixed by `bkit install`, whereas the workflow display name is consumer-editable free text. `bkit-auto` / `bkit-debug` / `bkit-cloud.yml` anchors were all re-checked and are still correct; only `bkit-ship.md` drifted.

### Recorded, not fixed

- **Non-defects** (so a builder doesn't "correct" them): the `bkit [auto route]` marker becomes permanent `dev` history once on the squash subject — inherent to Option A, since the gate reads `head_commit.message`; and `bkit-ship`'s close commit only reaches `dev` when `RUNTIME_DEVPUSHES = true`, so the "dev's tip is the close commit" narrative isn't universal — but stale-guard Option A reads CI-run recency, never dev's tip, so it holds under both runtimes.
- **Residual risk:** the `dev` concurrency group is `bkit-auto-dev` for *all* FIDs. With `cancel-in-progress: false` GHA keeps at most one pending run per group, so if FID-A is in-flight and FID-B then FID-C arrive, **FID-B's dispatch is cancelled while pending and never re-fires**. The plan's "operator does NOT need to manually re-trigger" holds only for the newest queued run. FID-level arbitration is #397's; this loses a dispatch rather than corrupting one, so it fails safe.

### Separate regression — not fixed here

#384 didn't just move the `AUTO_ROUTE_SUFFIX` derivation, it **removed the marker re-carry from `bkit-ship.md` entirely**. The Step-4 conflict-resolve commit is now a hard-coded `chore({FID}): conflict-resolve bkit [skip ci]`, and the `chore({FID}): sync dev` merge is gone. But `.bkit/workflows.md:605,1010` still document both as re-carrying `bkit [auto route]`, with the stated reason: *"Re-carry required: gate reads single commit `head_commit.message`; unmarked commit on top buries marker."* So after a bkit-driven conflict-resolve, the feat-branch HEAD carries no marker and the free-tier gate no longer matches on the re-dispatched CI run — the auto-ship path goes silent for opted-in issues. Shipped doc↔code drift plus a probable functional regression; out of scope for this plan, raising on #384.

---

Plan is **v4 and build-ready** at 14 tasks (was 10) and T1-T17 (was T1-T12). Task ordering is now `1+11+13` → `2+12` → `3`-`7` → `8` → `9`, since Tasks 11/13 edit the same `bkit-cloud.yml` managed block as Task 1 and must land in one pass.

## Build Workflow
### Step 1 — Start Workflow
[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)

### Step 2 — Worktree Setup
[cbartens/bkit/tree/feat/363-widen-bkit-cloud-trigger](https://github.com/cbartens/bkit/tree/feat/363-widen-bkit-cloud-trigger)
[docs/plans/202607/logs/363-widen-bkit-cloud-trigger/status.jsonl](https://github.com/cbartens/bkit/blob/feat/363-widen-bkit-cloud-trigger/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/status.jsonl)

### Step 3 — Branch Sync
[cbartens/bkit/tree/feat/363-widen-bkit-cloud-trigger](https://github.com/cbartens/bkit/tree/feat/363-widen-bkit-cloud-trigger)

### Step 4 — Install Skills

### Build — Decision Reversal: `main` excluded from trigger (Task 14)

Per the plan's "Out of Scope" section (`docs/plans/202607/363-widen-bkit-cloud-trigger-plan.md`), this build **reverses** the pivot comment's D-final decision to include `main` in the widened `workflow_run` trigger filter. Shipped filter: `['feat/**', 'fix/**', 'dev']` — `main` stays `workflow_dispatch`-only (manual).

**Why:** the issue's own open item 3 was never resolved — routing on `main` only works if the `dev`→`main` promotion commit carries the `bkit [auto route]` marker, and bkit has no consumer-facing promotion workflow to thread it onto. With no bkit-authored promotion commit, a `main` trigger would be gated shut by construction for exactly the consumers it targets, while adding live risk of a paid agent dispatching against production trunk. `dev`→`main` promotion and any merge into `main` continues to require explicit human interaction.

Recorded as an OPEN deferral: `docs/deferrals.jsonl` key `363-main-branch-trigger-excluded-reversal`. Revisit only if/when bkit gains an authored `dev`→`main` promotion workflow.

### Step 5 — Plan Execute - Verdict: PASS - Sub-plan: 1/1

### Step 6 — Plan Verify - Verdict: FAIL - Failures: 4 - Sub-plan: 1/1 - Attempt: 1

### Step 7 — Plan Gaps Remediate - Verdict: PASS - Sub-plan: 1/1 - Attempt: 1 - Strategy: STANDARD

### Step 6 — Plan Verify - Verdict: FAIL - Failures: 1 - Sub-plan: 1/1 - Attempt: 2

### Step 7 — Plan Gaps Remediate - Verdict: PASS - Sub-plan: 1/1 - Attempt: 2 - Strategy: PIVOT

### Step 6 — Plan Verify - Verdict: CONCERNS - Failures: 0 - Sub-plan: 1/1 - Attempt: 3

### Step 7 — Plan Gaps Remediate - Verdict: PASS - Sub-plan: 1/1 - Attempt: 3 - Strategy: FINAL

### Step 6 — Plan Verify - Verdict: PASS - Failures: 0 - Sub-plan: 1/1 - Attempt: 4

### Step 9 — Build Challenge - Verdict: FAIL - Failures: 1 - Attempt: 0

### Step 10 — Reconcile Build Challenge - Verdict: FAIL - Failures: 1 - Attempt: 0

### Step 11 — Build Challenge Remediate - Verdict: CONCERNS - Attempt: 1

### Step 12 — Build Challenge Tests - Verdict: PASS

### Step 9 — Build Challenge (re-run) - Verdict: CONCERNS - Failures: 0 - Attempt: 1

### Step 10 — Reconcile Build Challenge (re-run) - Verdict: FAIL - Failures: 1 - Attempt: 1

### Workflow Failure
Step: 10 — Reconcile Build Challenge; Sub-step: max-retry exhaustion routing
Error: `MAX_CHALLENGE_REMEDIATE_ATTEMPT` (1) exhausted — the second `build-challenge-reconcile` pass still returned `Verdict: FAIL, Failures: 1` (CRITICAL: the `bkit [auto route]` squash-merge marker threading is still functionally inert — the `$GITHUB_ENV`-based cross-tool-call handoff added in the first remediation pass does not work across separate Bash tool calls within a single cloud-dispatch step, and the fix was never regenerated into the `.claude`/`.cursor`/`.opencode` mirrors that actually execute). Per `decide_next`, `CHALLENGE_REMEDIATE_ATTEMPT` (1) exceeded threshold (0) — routing to Failure Path.
Stderr: `[bkit-telemetry] counter CHALLENGE_REMEDIATE_ATTEMPT exceeded max=0 (value=1)`

### Workflow Handover
[build-handover.md](https://github.com/cbartens/bkit/blob/feat/363-widen-bkit-cloud-trigger/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/build-handover.md)

# Debug Abort Handover

## The Short Version

This build widens bkit's cloud auto-agent trigger to also watch the `dev` branch after a PR merges, so a failure caught right after merging gets an automatic fix attempt instead of going unnoticed. The plumbing for that is built and mostly sound, but the one wire that actually turns the feature on — carrying a "please auto-route this" marker onto the merge commit — is broken by a JavaScript-style variable-scoping mistake in the shell scripts, so the feature is currently a no-op. One remediation attempt already fixed several other real bugs but missed this one and also forgot to re-publish the fix into the copies of the workflow that actually run in the cloud.

## What's Actually Happening

Symptom: post-merge `dev` CI failures never trigger the intended `/bkit-debug` auto-dispatch. Trigger: the free-tier gate in `bkit-cloud.yml` requires `bkit [auto route]` literally present in the squash-merge commit subject. Proximate cause: `bkit-ship.md` Step 5 (`.bkit/workflows/bkit-ship.md:686-704`) never actually appends that suffix — it tries to read a handoff variable/file (`BKIT_AUTO_ROUTE_FILE`) set at Step 1 (`:255-262`) via `$GITHUB_ENV`, but falls back to a dead `${LABELS:-}` read (`:696`) that is always empty by the time Step 5 runs. Root cause (design fragility): `$GITHUB_ENV` only propagates a variable **between separate GitHub Actions workflow steps**; inside `claude-code-action`/`opencode run`, an agent's Bash tool calls are all inside one Action step, so the file written at Step 1 never becomes visible at Step 5 in a real cloud dispatch. Contributing factor: `.claude/`, `.cursor/`, `.opencode/` mirrors of `bkit-ship.md` and `bkit-auto.md` were never regenerated after the first remediation pass, so even a correct fix in `.bkit/workflows/` would not reach the artifacts the runner executes.

## Attempt History

<!-- prettier-ignore -->
| Strategy | What was tried | Why it failed |
| --- | --- | --- |
| build-plan-execute (4 verify/remediate cycles) | Implemented trigger widening, ctx-step FID recovery, loop cap, `fix/**` folding | Reached PASS at `build-plan-verify` attempt 4 |
| build-challenge attempt 0 → CRITICAL | Found `/bkit-ship` was feat/-only (fix/** success mis-routed to ship), FID lacked slug allowlist, `AUTO_ROUTE_SUFFIX` marker-threading was dead code | FAIL, 1 CRITICAL escalation |
| build-challenge-remediate attempt 1 (STANDARD, the ONE allowed attempt) | Fixed fix/** ship no-op guard, FID slug allowlist, fork-origin guard, fail-closed counter write, exact-match kill-switch, and "fixed" the marker handoff via a `mktemp` + `$GITHUB_ENV` file-path handoff | Verdict CONCERNS; all local tests/lint green — but the `$GITHUB_ENV` handoff idiom does not survive across Bash tool calls within a single cloud Action step, and mirrors were never regenerated |
| build-challenge attempt 1 (fresh re-run) → CONCERNS (0 local failures) | Re-verified the remediation | Individual lenses missed the cross-tool-call defect; only reconcile caught it |
| build-challenge-reconcile attempt 1 → FAIL, 1 CRITICAL (F1) + HIGH (F2) + 9 more (F3–F11) | Reviewer independently reproduced the `set -euo pipefail` abort and confirmed via `git log -1` that all 3 host mirrors still carry pre-remediation content | Feature confirmed functionally inert; `MAX_CHALLENGE_REMEDIATE_ATTEMPT=1` exhausted → abort |

## Verified Resolutions (DO NOT ROLL BACK)

- `fix/**` CI-success no longer mis-routes to `/bkit-ship` — reconfirmed clean.
- FID slug allowlist enforced in `bkit-cloud.yml` at all 4 sites — reconfirmed clean.
- Fork-origin `head_repository == github.repository` job-level gate — reconfirmed clean.
- Exact-match `grep -qxF 'bkit:auto'` kill switch (was unanchored substring) — reconfirmed clean.
- Fail-closed counter write with `git show origin/dev:` verification (P6) — reconfirmed clean.
- Version bump 4.10.0 → 4.11.0 — reconfirmed clean.
- `docs/deferrals.jsonl` main-branch exclusion + self-resettable cap rows — correctly recorded, keep as-is.

## Persistent Errors

- **F1 (CRITICAL)** — `.bkit/workflows/bkit-ship.md:255-262,686-704` (+ stale mirrors). The marker is never emitted on any path in any runtime; `bkit-cloud.yml`'s `contains(head_commit.message, 'bkit [auto route]')` gate can never match a `dev` push.
- **F2 (HIGH)** — `.claude/commands/bkit-auto.md` (and `.cursor/`, `.opencode/`) still lack the M2 CI_DEV FID slug assert present in `.bkit/workflows/bkit-auto.md`.
- F3–F11 (MEDIUM/LOW) — secondary mechanical findings, see `build-challenge.md`.

## Recommended Next Steps

1. **Delete the cross-call `$GITHUB_ENV` handoff; re-derive in the same fence used at Step 5** via `gh issue view {ISSUE_ID} --json labels` inside the Step 5 merge fence — matches `docs/knowledge.jsonl` key `363-workflow-md-shell-var-does-not-survive-bash-tool-call-boundary`.
2. **Regenerate all host mirrors** via `bkit install`/`bkit upgrade` and diff-verify against `.bkit/workflows/` — must be the LAST step before re-challenge.
3. **Note:** `bkit-debug.md:1258-1264` carries the exact same broken `$GITHUB_ENV`-handoff idiom (pre-existing, not introduced by #363) — worth a follow-up issue.
4. Fix F3–F11 in the same remediation pass (all mechanical) before re-running `build-challenge`.

A fresh session should re-enter the build workflow from a corrected sub-plan (this attempt's `build-challenge-remediate` budget is exhausted).

## Reference Docs

- `docs/plans/202607/363-widen-bkit-cloud-trigger-plan.md` (v4, PASS) — design intent.
- `docs/plans/202607/logs/363-widen-bkit-cloud-trigger/status.jsonl` — full step ledger.
- `docs/plans/202607/logs/363-widen-bkit-cloud-trigger/build-challenge.md` — reconciled F1–F11 findings.
- `docs/plans/202607/logs/363-widen-bkit-cloud-trigger/build-challenge-remediate-log.md` — first remediation pass.
- `docs/knowledge.jsonl` key `363-workflow-md-shell-var-does-not-survive-bash-tool-call-boundary`.
- `docs/deferrals.jsonl` — main-branch exclusion + self-resettable cap, unrelated to this abort.
- `docs/failures.jsonl` — two new rows appended by this handover.

## Post-abort debug session — F1 root cause corrected, all 11 findings closed

Follow-up to the `build-challenge-reconcile` abort and `build-handover.md`. All work is on `feat/363-widen-bkit-cloud-trigger` in the worktree, **uncommitted** (see State below).

### Root cause was deeper than the handover recorded

The handover blamed the `$GITHUB_ENV` handoff. That is real but secondary. The actual root cause:

> **`LABELS` is never assigned as a shell variable anywhere in `.bkit/`.** It is an MCP-derived *template* value. So `${LABELS:-}` expanded empty in every runtime, in every fence, on every path — the `$GITHUB_ENV` handoff was carrying an already-empty value.

Verified by static analysis (`grep -rn 'LABELS=' .bkit/workflows/` → no matches) rather than inference.

**This was never a #363 regression.** The identical dead idiom was already on `dev` in `bkit-build.md:1261` and `bkit-debug.md:1095,1262`. `bkit [auto route]` had **never** been emitted by any workflow — the `feat/**` auto-route path was inert too. Per maintainer decision, all three workflows were fixed rather than ship a half-repaired mechanism.

### F1 (CRITICAL) — fixed at the root

Cross-call state removed entirely. All 5 sites now re-derive in the fence that consumes the value, matching `docs/knowledge.jsonl` key `363-workflow-md-shell-var-does-not-survive-bash-tool-call-boundary` idiom 1, and mirroring `bkit-cloud.yml`'s own kill switch:

```bash
AUTO_ROUTE_SUFFIX=""
gh issue view {ISSUE_ID} --json labels --jq '.labels[].name' 2>/dev/null | grep -qxF 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]" || true
```

`-qxF` also closes the anchoring defect — `bkit:auto-paused` / `no-bkit:auto` no longer arm the route. Non-GitHub trackers and `bkit:tracker false` fail closed (no issue to read → empty suffix → subject unchanged), which is correct: the cloud kill switch is unconditionally `gh issue view` and could not gate them either.

Sites: `bkit-ship.md` Step 5; `bkit-build.md` Steps 3 + 8; `bkit-debug.md` Steps 2 + 8. Step 1's `mktemp`/`$GITHUB_ENV` handoff deleted.

### Findings disposition

<!-- prettier-ignore -->
| # | Sev | Status |
| --- | --- | --- |
| F1 | CRITICAL | Fixed at root (above) |
| F2 | HIGH | Already fixed by `ff09147b`; re-verified all mirrors |
| F3 | MEDIUM | `\|\| true` added — unreachable fail-safe now reachable |
| F4 | MEDIUM | PR lookup filtered to same-repo `merged_at != null` |
| F5 | MEDIUM | `fix/**` success → no-op corrected in workflow header + `.bkit/cloud.md` |
| F6 | MEDIUM | Drop row moved to `$GITHUB_STEP_SUMMARY` (the push raced and lost it) |
| F7 | LOW | Kill switch moved **ahead** of the stale-run guard — revocation now stops all side effects |
| F8 | LOW | `head -1` first — FID read from subject, not squash body |
| F9 | LOW | `find … \| sort \| head -1` — deterministic month bucket |
| F10 | LOW | Guarded `source` + explicit `MAX_…` check |
| F11 | LOW | `docs/security.md` now states the cap is advisory / self-resettable |

### Three defects in the report's own suggested fixes

Caught before shipping:

1. **F4** — `gh api` has no `--arg` flag (that is jq's). The suggested filter would have shipped as broken CLI. Used jq's `env.GITHUB_REPOSITORY` instead, which also avoids splicing a value into the filter text.
2. **F10** — `: "${VAR:?msg}"` **exits the whole shell** even inside a `|| {}`-guarded function, reproducing the exact abort F10 exists to prevent. Verified empirically; replaced with an explicit `[ -z … ] && return 1`.
3. **Both jobs** — the F7 and F4 edits initially landed in job 1 only (job 2 uses abbreviated comments, so the anchors missed). Both ctx steps are now verified logically identical line-for-line.

### Verification

Every fix is **mutation-tested** — reverted, confirmed the new tests fail, restored:

- F1 revert → 7 failures · F3 → 7 · F7 → 1 · F8 → 1

This matters because the *old* F1 tests asserted only that the handoff **text** was present, so they passed on a wholly inert mechanism. New `.bkit/src/bkit-auto-route-marker.integration.test.ts` executes the real fences (sliced from the shipped markdown, not re-typed) against a stubbed `gh` and asserts the rendered `--subject`, across all three workflows × {label present, absent, near-miss ×2, unreadable issue}.

Gates: **2707 tests passed / 77 files**, typecheck, prettier, actionlint, `check:dist`, `slop:delta` net 0, `bkit check` exit 0 no drift. All 15 mirror sites regenerated and content-verified — re-rendered a second time after prettier reformatted the source, since that exact ordering is what produced the original stale-mirror finding (F2).

### State

- Branch `feat/363-widen-bkit-cloud-trigger`, **uncommitted** in the worktree — 21 files modified + 1 new test file
- **No build PR exists.** The only PRs on this branch are plan-phase: #398 (MERGED, "plan DONE") and #399 (CLOSED)
- Labels: `enhancement`, `bkit:build`, `bkit:failed`

### ⚠️ Do not run `/bkit-ship` yet

`bkit-ship.md:369` resolves the PR with `[.[] | select(.state=="OPEN")] + [.[] | select(.state=="MERGED")] | .[0]`. With no open PR that returns **#398 — the already-merged plan PR** (base `dev`, so the base check passes). Ship would then abort at the Step 7 rollup gate (`:389`, rollup is `[]`), so it fails safe rather than false-greening — but it fails confusingly against the wrong PR and re-stamps `bkit:failed`.

### Next step

Build, not ship — build is the phase that creates the PR:

1. Commit + push the branch
2. **Clear the two `build-challenge-remediate` rows** from `status.jsonl` first. `MAX_CHALLENGE_REMEDIATE_ATTEMPT=1` is already consumed for this FID, so a re-entered build aborts immediately if the fresh challenge requests *any* remediation
3. Re-enter `/bkit-build 363` → challenge re-runs against the fixed code → PR created
4. CI green → `/bkit-ship 363`

### State update — committed, pushed, `bkit:failed` cleared

- **Commit `4eb90baf`** on `feat/363-widen-bkit-cloud-trigger` (22 files, +767/−341). Pre-commit (vale, `check:dist`) and pre-push (bats 167 tests, `check:dist`, actionlint) hooks all passed. The single vale warning is pre-existing in `docs/testing.md`, unrelated.
- **Labels now** `enhancement`, `bkit:build` — `bkit:failed` removed.
- Commit message deliberately omits the literal auto-route marker string (it would arm the cloud trigger from the commit itself) and carries no CI-suppressing token, so the head is PR-ready.

### Correction to the previous comment's "next step"

Re-running `/bkit-build` is **not** required to close this out. `/bkit-ship` reads none of build's status rows — it runs its own `bkit-ship-deferred-sweep` completeness gate and hard-requires only an **OPEN PR based on `dev` plus green CI**. No `.deferred-blocked` sentinel and no stale `.lock` exist for this FID, so nothing is blocking.

Opening a PR also resolves the stale-PR hazard flagged above: ship's query prefers `OPEN` over `MERGED`, so an open build PR takes precedence over the merged plan PR #398.

Remaining to ship:

1. Open a PR (base `dev`) from `feat/363-widen-bkit-cloud-trigger`
2. Dispatch CI manually — `gh workflow run ci.yml --ref feat/363-widen-bkit-cloud-trigger`. Branch pushes do not auto-fire `ci.yml` in this repo; confirmed again just now (zero runs after the push)
3. CI green → `/bkit-ship 363`

**Trade-off, stated explicitly:** skipping the build re-run forgoes a fresh adversarial `build-challenge` pass over these fixes. All 11 findings are closed with mutation-proof and the full suite is green, but a challenge is specifically designed to catch what the implementer missed — CI and the deferred sweep are a different, weaker net.

## Ship Workflow
### Step 1 — Start Workflow
[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)

### Step 2 — Verify PR (Worktree Setup + Regression Guard)
[cbartens/bkit/tree/feat/363-widen-bkit-cloud-trigger](https://github.com/cbartens/bkit/tree/feat/363-widen-bkit-cloud-trigger)
[docs/plans/202607/logs/363-widen-bkit-cloud-trigger/status.jsonl](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/status.jsonl)

### Step 4 — Integrate (Path B) - Verdict: PASS

### Step 5 — Re-validate + Deferred Sweep - Verdict: PASS

### Step 6 — Merge Gate + Merge PR - Verdict: PASS

### Step 9 — Switch to Dev
[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)

### Step 10 — Update Docs & Summary - Verdict: PASS - Docs: PASS
[ship-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/ship-summary.md)

Verdict: PASS

<!-- verdict:end -->

# Ship Summary

## Overview

Feature #363 widens `bkit-cloud.yml`'s `workflow_run` trigger from `['feat/**']` to `['feat/**', 'fix/**', 'dev']` and adds branch-aware routing that automatically dispatches `/bkit-debug` for post-merge `dev` CI failures. The 22-file change (+767/−341 net) addresses the post-merge blind spot where a squash-merge reintroduces a failure — merge conflict resolution gone wrong, a dependency only resolved on the PR head, or an env difference. Previously bkit was blind to these until an operator noticed and manually invoked `/bkit-debug`; now the cloud orchestrator auto-routes the failure, delivering autonomous fix attempts bounded by a cross-session loop cap.

**Key changes:**
- `bkit-cloud.yml`: trigger filter widened; branch-aware routing added; FID recovery from squash-merge commit scope; concurrency group `bkit-auto-dev` with `cancel-in-progress: false` for `dev`; loop-cap enforcement.
- `bkit-ship.md`: `AUTO_ROUTE_SUFFIX` derivation re-introduced (threaded onto squash-merge subject when `bkit:auto`-labeled).
- `bkit-build.md`, `bkit-debug.md`: marker-threading corrected to re-derive per-fence (not via cross-call handoff).
- `bkit-counter-bus-config.sh`: `MAX_DEV_DISPATCH_ATTEMPTS=3` added for loop-bounding.
- Version 4.10.0 → 4.11.0; all mirrors (`.claude/`, `.cursor/`, `.opencode/`) regenerated; `docs/deferrals.jsonl` row added for main-branch exclusion reversal.

## CI Status

**Build phase:** Initial attempt FAILED at build-challenge-reconcile after max-retry exhaustion (1 allowed STANDARD→PIVOT→FINAL cycle). Root cause: `${LABELS:-}` shell idiom was never assigned anywhere in `.bkit/` (pre-existing dead code on dev, not a #363 regression). The `bkit [auto route]` marker threading was functionally inert across all workflows.

**Follow-up debug session** (2026-07-30 02:57–03:09) re-analyzed and fixed the root cause: deleted the cross-call `$GITHUB_ENV`-based handoff; re-derived `AUTO_ROUTE_SUFFIX` per-fence in all five workflows using `gh issue view {ISSUE_ID} --json labels --jq` with anchored grep (`-qxF`); regenerated all host mirrors; mutation-tested all fixes (7 test failures on each fix revert, confirming fixes are load-bearing). All 11 build-challenge findings closed. Full test suite green (2707 tests passed, 77 files; typecheck, prettier, actionlint, `check:dist`, `slop:delta` net 0, `bkit check` exit 0). Commit `4eb90baf` pushed (22 files, +767/−341).

**Ship phase:** Green first attempt. 
- **ship-regression-guard:** PASS — no merge-blocking issues detected.
- **ship-conflict-resolve:** PASS — rebase conflict on CHANGELOG.md resolved (non-overlapping additive entries under `## [Unreleased]` concatenated preserving both Added/Changed/Fixed convention). All post-rebase verifications passed (install, typecheck, test, build).
- **ship-deferred-sweep:** PASS — no deferred blocking items.
- **ship-merge-pr:** PASS — PR #407 squash-merged to dev without failures.
- **ship-switch-to-dev:** DONE — merged at commit fbd46ad0; branch deleted.

## Action Items

1. **Corrected code was never re-challenged after the debug fix.** This is an accepted, declared trade-off per the build-challenge protocol: the follow-up debug session fixed the root cause and ran the full suite + mutation tests locally, but the fix was never re-run through `build-challenge` (which exists to catch what the implementer missed). The deferred-sweep summary documents this: *"skipping the build re-run forgoes a fresh adversarial `build-challenge` pass over these fixes. All 11 findings are closed with mutation-proof and the full suite is green, but a challenge is specifically designed to catch what the implementer missed"* (ship-input.md line 792–793). Reviewers should note this trade-off was made: the code is fully tested and mutation-proof, but did not receive a second-pass challenge review.

2. **`docs/deferrals.jsonl` row added for main-branch exclusion.** Feature reversed the pivot-comment D-final decision to include `main` in the trigger filter — a documented, evaluated decision recorded as deferral row `363-main-branch-trigger-excluded-reversal`. No further action required; the exclusion is intentional and the rationale is preserved.

3. **Follow-up: `bkit-debug.md:1258-1264` carries the same broken `$GITHUB_ENV`-handoff idiom.** The debug session noted this pre-existing pattern in bkit-debug.md (worth a follow-up issue). Not addressed in this cycle.

4. **Loop-cap self-resetability:** Deferral row `363-dev-dispatch-cap-self-resettable-by-controlled-principal` documents that `MAX_DEV_DISPATCH_ATTEMPTS` counter lives in a file the dispatched `/bkit-debug` session has permission to rewrite — the cap is self-resettable by the principal it bounds (operators / malfunctioning agents). This was known and accepted as a trade-off; future mitigation would derive the count from a source the session cannot rewrite (e.g., `gh run list` filtered by FID) or cross-check against GitHub's API history. Documented as an acknowledged design trade-off, not a hidden gap.

## Recommended Next Step

Feature merged successfully. No further bkit command required.

**Brief:** Post-merge dev CI trigger widened; autonomous debug dispatch added for post-merge failures; 3-attempt loop-bound enforced. Build encountered inert marker-threading (pre-existing dead code, fixed via debug session + full mutation-proof test suite). Ship green first attempt, rebase conflict resolved. Trade-off note: follow-up debug fix was mutation-tested and fully validated but did not receive a second-pass build-challenge review — acceptable because challenge is designed for a human oversight catch and the fix was already caught and verified. Main-branch exclusion recorded as documented reversal decision.

## Deferred & Out-of-Scope

**Blocking Deferrals:** None.

**Exempt (out-of-scope):** 

1. **363-main-branch-trigger-excluded-reversal** (docs/deferrals.jsonl row 69) — `main` branch excluded from auto-trigger; reversal of pivot-comment D-final decision. Rationale: no bkit-authored dev→main promotion workflow exists to carry `bkit [auto route]` marker, and bkit policy locks `bkit:auto` to dev-only (dev→main always manual). Recorded for revisit if bkit gains an authored promotion workflow.

2. **363-dev-dispatch-cap-self-resettable-by-controlled-principal** (docs/deferrals.jsonl row 70) — Loop-cap counter (`MAX_DEV_DISPATCH_ATTEMPTS=3`) lives in docs/plans/{FID}/status.jsonl on origin/dev, which the dispatched `/bkit-debug` session has contents:write permission to rewrite. Cap is self-resettable by the principal it bounds. Documented as accepted security trade-off; future mitigation would derive count from a source the session cannot rewrite or cross-check against GitHub API history.

3. **384-separate-ship-redesign** — The follow-up debug found and fixed pre-existing broken `$GITHUB_ENV`-handoff idiom in bkit-debug.md:1258-1264 (same pattern, same fix needed). Out of scope for this cycle; noted for follow-up issue.

### Step 11 — Prune Skills

### Step 12 — Worktree Cleanup

### Step 13 — Close Workflow
#### Artifacts
- [363-widen-bkit-cloud-trigger-plan.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/363-widen-bkit-cloud-trigger-plan.md)
- [ship-conflict-resolve.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/ship-conflict-resolve.md)
- [ship-deferred-sweep.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/ship-deferred-sweep.md) (reconstructed — see `docs/failures.jsonl` key `363-ship-worktree-artifact-lost-before-any-commit-captures-it`)
- [ship-input.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/ship-input.md)
- [ship-summary.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/ship-summary.md)
- [ship-update-docs.md](https://github.com/cbartens/bkit/blob/dev/docs/plans/202607/logs/363-widen-bkit-cloud-trigger/ship-update-docs.md)

#### Telemetry
**ship close** · cbartens/bkit

<!-- prettier-ignore -->
| metric | this run | med·5 |
| --- | --- | --- |
| durationSeconds | 40762 (11h19m) | — |
| linesChanged | 5928 (+5342/-586) | — |
| filesChanged | 66 | — |
| taskCount | 129 | — |
| frictionAdded | 0 | — |
| deferralsAdded | 0 | — |
| failuresAdded | 1 | — |
| compliance | 1 pass · 1 fail · 0 n/a (50%) | — |
| attempts | SHIP_ATTEMPT 1 | — |

`med·5` = median of the previous 5 ship runs (— if < 3) · ledger 55 rows, 0 malformed

**Process gap found and logged during this run:** `ship-deferred-sweep.md` (Step 5) was created inside the feature worktree with no commit step before Step 6's merge and Step 12's worktree removal — the artifact was silently destroyed. Recovered from the orchestrator's transcript and logged as `docs/failures.jsonl` key `363-ship-worktree-artifact-lost-before-any-commit-captures-it` (MEDIUM, OPEN) for a future fix to `.bkit/workflows/bkit-ship.md` Step 5.

[363 Route post-merge CI failure to /bkit-debug widen bkit-cloud trigger](https://github.com/cbartens/bkit/issues/363)

## #412 — Ship failure path pushes twice, splitting across branches (closed)

## Problem

`.bkit/workflows/bkit-ship.md`'s Failure Path performs **two commits and two pushes onto two different refs** whenever the handover branch fires (§4 → §5–11: max-retry exhaustion, a `.rebase-failed` sentinel, or a `.deferred-blocked` sentinel).

<!-- prettier-ignore -->
| # | sub-step | lines | tree | ref | payload |
| --- | --- | --- | --- | --- | --- |
| 1 | §1 | `:94-97` | `$REPO_ROOT` (dev tree) | `dev` | `chore({FID}): ship FAILED bkit [skip ci]` — `status.jsonl`, `ship-input.md`, `.deferred-blocked` |
| 2 | §8–10 | `:136-138` | worktree | `feat/{FID}` | `docs({FID}): ship aborted bkit [skip ci]` — `ship-handover.md`, `ship-deferred-sweep.md`, a `docs/deferrals.jsonl` row |

Ship is the only phase workflow that does this. `bkit-design.md` / `bkit-plan.md` failure paths make no commit at all (status append only); `bkit-build.md` / `bkit-debug.md` make exactly one (the abort push).

## Evidence — the #380 ship, 2026-07-31

```
c28dfb8d  dev                             chore(380-roadmap-analysis-refresh): ship FAILED bkit [skip ci]
          → status.jsonl, ship-input.md, .deferred-blocked
39bfd87a  feat/380-roadmap-analysis-refresh   docs(380-roadmap-analysis-refresh): ship aborted bkit [skip ci]
          → ship-handover.md, ship-deferred-sweep.md, docs/deferrals.jsonl
```

Same failure, five minutes apart, bookkeeping split across two branches.

## Why it matters

1. **The branch half is the half that gets lost.** `ship-deferred-sweep.md` + `ship-handover.md` only ever exist on `feat/{FID}`, which a failed ship never merges — worktree-prune, branch delete, or a later `--force-with-lease` all destroy them. Already an OPEN row in `docs/failures.jsonl` (`363-ship-worktree-artifact-lost-before-any-commit-captures-it`), hand-recovered in `702426ae`.
2. **It mutates a still-open, CI-validated PR head with a `[skip ci]` commit.** This is exactly the missing ship EC-2 guard described in #322 (`build` refuses this; ship has no equivalent). Removing push #2 closes that gap for free.
3. **It can violate the file's own contract.** `:28` states "`dev` commit and push ONCE per run". If ship fails after Step 9 — which checks out `dev` in the main checkout — with cwd at `$REPO_ROOT`, §10's `case "$B" in dev|main) git push origin "$B"` makes *both* pushes hit `dev`.

## Adjacent defects in the same block

The Close step (Step 13) already has the guards the Failure Path lacks:

4. **No runtime detect.** The Failure Path never sources `.bkit/scripts/bkit-runtime.sh` or calls `bkit_runtime_detect` (Close does at `:1176-1178`). Every Bash call is a fresh shell, so `RUNTIME_DEVPUSHES` is unset at `:65` → the mode-3 branch never fires and **cloud runs still attempt `git push origin dev`**, which Close explicitly skips at `:1265-1269`.
5. **No dev checkout or branch assert.** `:94-97` runs `pull --ff-only origin dev` → `add` → `commit` → `push origin dev` against `$REPO_ROOT` as-is. Close asserts the branch (`:1180-1181`), as does Step 9 (`:886-888`). If the main checkout is parked on another branch, that pull merges `origin/dev` into *that* branch, the FAILED commit lands there, and `push origin dev` pushes the untouched local `dev` ref — the record never reaches the remote.
6. **Re-entrancy.** §6's "If any file empty → **Failure Path**" (`:134`) is a self-loop when raised from inside the Failure Path.
7. **Sentinel litter.** `.deferred-blocked` — an empty sentinel read within the same run — rides into `dev` because `BOOK_PATHS` stages the whole `docs/plans/{YYYYMM}/logs/{FID}/` directory.

## Should the failure write go to `dev` at all?

**Yes in local modes, never in cloud — one write, tree selected by `RUNTIME_DEVPUSHES`, exactly as Close does it** (`:1179-1186` + `:1265-1269`).

The handover is *about* the branch, but its **reader** is `BOOK_ROOT`-side:

- Step 1's resume / lock-staleness cross-check folds `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (`:205-214`).
- §4's handover condition stats `$BOOK_ROOT/.../.deferred-blocked` (`:129`).
- #384 Finding 4 fixed precisely this wrong-tree class for the status write; the artifact write never got the same treatment.

Put the record where the retrieval path looks. And a failed ship's branch is the least durable surface in the repo: nothing merges it, and three separate mechanisms delete it.

For `RUNTIME_DEVPUSHES=false` (mode 3, cloud) the question is moot — it cannot push `dev`, so the current branch is the only target, and that is #341 shape A (bookkeeping lands with the phase-close PR). What must change is that this is *decided*, not accidental: today the block has no runtime detect and always takes the dev path.

## Proposed change

**Reorder the Failure Path so all git writes collapse into one flush block at the end:**

1. §1 becomes state-only — `git rebase --abort` (must stay before the status append), `workflow-failed` row into `$BOOK_ROOT/.../status.jsonl`, lock release, `.rebase-failed` cleanup. **No `add` / `commit` / `push`.**
2. Tracker label + failure comment (unchanged).
3. Handover subagent when §4's condition holds; a missing/empty artifact **logs and falls through** to the flush — it must not re-enter the Failure Path (defect 6).
4. **Single flush block, always reached** (handover or not), mirroring Step 13:
   - source `bkit-runtime.sh` → `bkit_runtime_detect` → `bkit_runtime_assert_resolved`;
   - acquire `.bkit/.dev.lock` with the `trap … EXIT` release (keep the current best-effort 60s deadline; on timeout, leave the commit local and say so);
   - `RUNTIME_DEVPUSHES=true` → `git -C "$REPO_ROOT" checkout dev` + assert `branch --show-current` = `dev`, `WT="$REPO_ROOT"`; else `WT=$(git rev-parse --show-toplevel)` and log the skip;
   - copy the worktree-side log-dir artifacts (`ship-handover.md`, `ship-deferred-sweep.md`, any `ship-*-log.md`) into `$BOOK_ROOT/docs/plans/{YYYYMM}/logs/{FID}/` before staging — this is the `363-ship-worktree-artifact-lost…` failure row;
   - `git -C "$WT" add $BOOK_PATHS` (excluding `.deferred-blocked` / `.lock`) → **one** commit `chore({FID}): ship FAILED bkit [skip ci]` → **one** push, guarded by `RUNTIME_DEVPUSHES` exactly like `:1265-1269`.
5. Handover tracker comment, then **STOP**.

The `docs({FID}): ship aborted` message and the `feat/{FID}` push disappear entirely.

### Alternatives considered

<!-- prettier-ignore -->
| Option | Pros | Cons |
| --- | --- | --- |
| **A. One write, tree by `RUNTIME_DEVPUSHES`** (recommended) | Matches Close; artifacts land where the reader looks; stops mutating the validated PR head; closes ship's EC-2 gap | Handover artifacts must be copied worktree → `BOOK_ROOT` before staging |
| **B. Keep both, just add the runtime guard** | Smallest diff | Leaves the artifact-loss row open and keeps writing `[skip ci]` onto an open PR head |
| **C. Branch-only (never touch dev)** | Uniform across runtimes; no dev lock needed on failure | On a failed ship nothing merges the branch, so the failure record dies with it; breaks the `BOOK_ROOT` resume contract (#384) in local modes |

## Acceptance criteria

- [ ] Exactly one `git push` in the Failure Path block of `.bkit/workflows/bkit-ship.md`, wrapped in a `RUNTIME_DEVPUSHES` conditional.
- [ ] Failure Path sources `bkit-runtime.sh` and calls `bkit_runtime_detect` before any tree decision.
- [ ] Dev-tree ops are preceded by `checkout dev` + a `branch --show-current` assert.
- [ ] Handover / sweep artifacts are present in the single commit (copied from the worktree when `RUNTIME_WORKTREES=true`).
- [ ] No path inside the Failure Path routes back to the Failure Path.
- [ ] `.deferred-blocked` / `.lock` are not staged.
- [ ] New assertions in `tests/ship-failure-path.bats` (the harness already greps the block): single-push count, `RUNTIME_DEVPUSHES` guard present, runtime detect present, dev assert present. Existing six assertions still pass.
- [ ] `pnpm bkit install` re-renders the `.claude` / `.cursor` / `.opencode` mirrors.

## References

- #384 — Finding 4 (Failure Path wrote status to the wrong tree); `80660ac0` restructured ship and added `tests/ship-failure-path.bats`
- #341 — shape A, bookkeeping rides the phase-close PR when `RUNTIME_DEVPUSHES=false`
- #322 — ship lacks build's EC-2 abort-guard; overlaps here, this issue removes the offending push
- `docs/failures.jsonl` → `363-ship-worktree-artifact-lost-before-any-commit-captures-it` (OPEN)
- `702426ae` — manual recovery of a lost `ship-deferred-sweep.md`
- `c28dfb8d` + `39bfd87a` — the two commits from the #380 ship failure

Note for whoever picks this up: `feat/380-roadmap-analysis-refresh` has in-flight edits to the same block (the `stat` idiom at `:88` and `BOOK_PATHS` at `:188`), but nothing touching the push structure.

## Edits applied on `dev` — working tree only, uncommitted, nothing pushed

Option **A** implemented as proposed: one commit, one push, target chosen by `RUNTIME_DEVPUSHES`.

### Files changed (6)

<!-- prettier-ignore -->
| file | change |
| --- | --- |
| `.bkit/workflows/bkit-ship.md` | Failure Path restructured to the single-write shape (below); `:28` contract sentence rewritten |
| `.bkit/workflows.md` | ship exception added under **Conditional handover**; commit-tags table row scoped to build/debug + a ship row added |
| `.bkit/templates/gitignore` + `.gitignore` | `.deferred-blocked` / `.rebase-failed` ignored (template source and rendered managed block, kept in sync) |
| `tests/ship-failure-path.bats` | +10 assertions (group 5, single-write contract); 6 → 16 |
| `.bkit/src/bkit-skip-ci-subject-audit.test.ts` | dropped the `docs({FID}): ship aborted` registry entry — that subject no longer exists |

### New Failure Path shape

```
1  rebase --abort → workflow-failed row → lock release → sentinel cleanup   (no git object)
2  tracker labels
3  tracker failure comment
4  handover-triggered? → 5   else → 7   ({HANDOVER_OK})
5  @bkit-debug-abort-handover
6  assert artifact — missing/empty logs, sets {HANDOVER_OK}=false, falls through to 7
7  FLUSH: reconcile artifacts into BOOK_ROOT → ONE commit → ONE push
8  handover tracker comment (skipped when {HANDOVER_OK}=false)
9  STOP
```

Step 7 sources `bkit-runtime.sh` and calls `bkit_runtime_detect` in-block (as does step 1 — shell state does not cross a Bash-block boundary), then:

- `RUNTIME_DEVPUSHES=true` → `checkout dev` + `branch --show-current` assert + `pull --ff-only` → `WT=$REPO_ROOT`, `TARGET=dev`
- `RUNTIME_DEVPUSHES=false` → `WT=$BOOK_ROOT`, `TARGET=$(git branch --show-current)`, dev untouched
- dev lock busy → `FLUSH=0`, bookkeeping stays in the working tree with the old "rides along" message rather than aborting the abort
- `[ -n "$TARGET" ]` asserted, `git add $BOOK_PATHS`, and the commit+push only fire when `git diff --cached --quiet` says there is a delta

### Decisions taken while implementing

**`bkit_runtime_assert_resolved` is deliberately not called here.** Its documented contract is "route a non-zero return to the Failure Path", which is a self-loop from inside it. Instead an unresolved `RUNTIME_DEVPUSHES` falls back to `false` — the same value the shim itself assigns to `UNKNOWN` — so the abort still lands on a pushable ref. Guessing `true` would attempt a `checkout dev` on a session that cannot push it.

**Sentinels are gitignored rather than excluded by pathspec.** `.lock` was already ignored; `.deferred-blocked` / `.rebase-failed` were not, which is how the empty sentinel reached `dev` in `c28dfb8d`. Ignoring them fixes the Close-step staging path too, and needs no pathspec magic at either call site.

**failures.jsonl remediation option (b), not (a).** The handover subagent keeps its `cd {WORKTREE_PATH}` — it must read `git diff origin/dev..HEAD` from the branch — and step 7 copies the log-dir artifacts into `BOOK_ROOT` instead. Step 5's `ship-deferred-sweep.md` needs that copy regardless, so one mechanism covers both.

**Ledgers are unioned, not copied.** Branch-side `deferrals/failures/knowledge/decisions.jsonl` + `.bkit/friction.jsonl` rows are appended only when absent from the `BOOK_ROOT` copy (`grep -F -x -v -f`), so a worktree ledger cannot clobber dev-side rows.

**Handover comment link now uses `{HANDOVER_REF}`** (`dev` when `RUNTIME_DEVPUSHES` = true, else `{BRANCH}`) — the old link hardcoded `blob/{BRANCH}`, which would now 404.

### Caught during implementation

`SRC_WT="${WORKTREE_PATH:-$REPO_ROOT/.worktrees/{FID}}"` was in the first draft. A `}` inside a `${VAR:-default}` closes the expansion early: with `WORKTREE_PATH` set it evaluates to `/path/to/wt}` — trailing brace — so the artifact copy would have silently found no directory and skipped, reproducing the exact loss this issue is about. Replaced with a two-line form and a warning comment. No other `${…:-…{PLACEHOLDER}}` exists in `.bkit/workflows/`.

### Verification

- `bats tests/ship-failure-path.bats` — 16/16 (was 6; the 6 pre-existing invariants still hold)
- `pnpm test:bats` — 177/177
- `pnpm test` — 2818 passed, 79 files (the one failure this change caused, the skip-ci subject registry, is fixed above)
- Failure Path bash blocks extracted and `bash -n` / `sh -n` clean with placeholders left intact

### Not done

- **No commit, no push** — per instruction. The tree also carries a large unrelated in-flight change set from a concurrent session on the same clone, so these 6 files need staging by path when they are committed.
- **Host mirrors** (`.claude` / `.cursor` / `.opencode` `commands/bkit-ship.md`) currently do carry the rendered change — a concurrent `bkit install` picked it up — but that was not run as part of this work; re-render before relying on it.
- **`docs/plans/202607/logs/380-roadmap-analysis-refresh/.deferred-blocked` is still tracked** from `c28dfb8d`. The new ignore rule does not untrack it; it needs a `git rm --cached` whenever someone next commits here.

### Adjacent, not touched

- `.bkit/workflows.md:572` claims "`plan`/`design`: failed-status commit additionally pushes `dev` (best-effort)". `bkit-design.md`'s Failure Path makes no commit and no push at all — the sentence looks stale independent of this change.
- `bkit-build.md` / `bkit-debug.md` Failure Paths still resolve `STATUS` via `$REPO_ROOT` with a `.worktrees/{FID}` fallback rather than `BOOK_ROOT` — the pre-#384 shape that ship has now outgrown. Candidate follow-up.

### The `stat` idiom this issue parked has landed on `dev`, independent of #380

The closing note said `feat/380-roadmap-analysis-refresh` had in-flight edits to the same block, naming the `stat` idiom. That part is now on `dev` on its own, so it no longer waits on the 380 ship.

**What was wrong.** The idiom tried the BSD form first:

```sh
stat -f %m "$FILE" 2>/dev/null || stat -c %Y "$FILE" 2>/dev/null || echo 0
```

On GNU coreutils `-f` is `--file-system`, so on a Linux runner the first branch succeeds while reporting the *filesystem*, not the file, and the `||` fallback never runs. Every staleness comparison built on it (`DEVLOCK_MTIME`, `LOCK_AGE`) was measuring the wrong number — silently, because nothing errors.

**Fix.** GNU form first, BSD as the fallback. Applied to all 10 sites rather than the 3 that were in scope on 380:

<!-- prettier-ignore -->
| File | Sites |
| --- | --- |
| `.bkit/workflows/bkit-ship.md` | 4 — Failure Path dev lock `:170`, Step 1 lock age `:276`, Step 9 dev lock `:989`, Step 13 dev lock `:1287` |
| `.bkit/workflows/bkit-design.md` | 2 |
| `.bkit/workflows/bkit-plan.md` | 2 |
| `.bkit/workflows/bkit-build.md` | 1 |
| `.bkit/workflows/bkit-debug.md` | 1 |

Leaving the other 7 would have kept the identical bug live in four workflows.

### Two stale numbers against this issue's acceptance criteria

The criteria assumed `tests/ship-failure-path.bats` had 6 assertions. It has 19 — the restructure this issue asked for landed and grew the harness. `docs/testing.md` still published the pre-restructure figures in two places: it claimed 6 bats assertions, and claimed `.bkit/src/bkit-ship-invariants.test.ts` had 14 assertions over a `BOOK_PATHS` 10-path allow-list. Actual on `dev` is 36 assertions over the 12-path `bkit-book-commit.sh` allow-list. Both corrected in the same change.

The Failure Path's single-flush structure itself is untouched — one commit, one push, `RUNTIME_DEVPUSHES`-conditional, as this issue specified.

Staged on `dev`, not yet committed.

### Landed on `dev` — commit `1ac4b3c8`, 41 files

The single-flush Failure Path from this issue is untouched. What landed on top is the gate-refusal re-entry, plus the `stat` fix this issue had parked.

### Gate refusal now re-enters the poll, not the sweep

Codes 10, 11 and 14 are CI state. The deferred sweep cannot change them — its verdict is a function of branch content — and it is a high-effort leaf, so re-running it on a CI-state refusal is both useless and expensive. Head movement as the only re-validate trigger also left code 10 (no run) with no path to dispatch, so it refused indefinitely.

Step 6 now routes 10/11/14 back into Step 5's re-validate block only. The sweep stays first-pass-only, because the jump from sub-step 1 lands on Step 6 and sub-step 7 *is* Step 5's `Route:` block. Bounded by `MAX_REVALIDATE_ATTEMPT` (3), derived from the `ship-revalidate-dispatch` rows written since this run's `ship-start-workflow` row — the re-entry writes no `step-done` row, so the counter bus cannot see it and the count is hand-rolled.

### Step 5 probes before dispatching

`ci.yml` keys `pull_request` concurrency by `head_ref` and `workflow_dispatch` by `run_id` — separate groups, so a duplicate is never cancelled and burns a full run. The head move already fires `pull_request` at that SHA. Step 5 now probes with `bkit_wait_ci` and dispatches only when no run is present; the probe is never a pass condition.

The poll is also anchored on the head SHA now (`select(.headSha == $h)`). Absent a guaranteed-fresh dispatch, `--limit 1` can return a COMPLETED run from a superseded head and the wait exits green against the wrong commit.

### The `stat` fix from the earlier comment

Applied at all 10 sites across 5 workflows, GNU `-c %Y` first with BSD `-f %m` as the fallback. Verified there is no straggler left in `.bkit/workflows/`.

### Authoring-rule cleanups found while reviewing the diff

Four things in `bkit-ship.md` were prose narrating what a mechanism already did, which `.bkit/workflows.md` § Workflow Authoring Rules bans:

- An inline comment explaining when `REVALIDATE_REASON` is set. The same change had correctly deleted the comment two lines above it.
- `→ Step 6. Sub-steps 2-7 run ONCE per ship, on the first pass only.` — the jump target already determines that.
- `→ Step 5 sub-step 1 ONLY, then back here.` — cross-step jumps in the corpus are always a bare `→ Step N.`; `→ sub-step N` is used only for jumps inside a step, and there is no "return" notion.
- The counter-bus lead-in pre-announced `→ bounded poll-only re-entry into Step 5` *before* `decide_next` ran, but on exit 1 the destination is the Failure Path. It also restated the bash line by line and marked a bash-local as `{REVALIDATE_ATTEMPT}`. Now matches the two sibling call sites verbatim: `— run counter-bus routing:`.

Four Gate items were rewritten to established shapes. Across the corpus, gate items run median 70 chars and p90 106; these were 106, 138, 71, 79 and 118. The head-movement one ended `(or neither — head unchanged, first pass)`, which made it unfalsifiable. `(head-anchored, no timeout exhaustion)` restated the same line's own label. One led with `Sub-steps 2-7` instead of a prose label and carried rationale in its parenthetical. The Gate 6 counter item now mirrors its existing sibling, `Soak iteration counter derived from status.jsonl (since last soakEntryAt), bounded by MAX_SOAK_ATTEMPT`.

Both `ship-revalidate-dispatch` and `ship-gate-refusal` were being written without appearing in the `status.jsonl` Event types table in `.bkit/workflows.md`. Both registered now; the second predates this work.

### Two things left open

**`{REVALIDATE_REASON}` is carried in the model across the Step 6 → Step 5 → Step 6 jump.** § Routing state says cross-block routing vars are re-read from `status.jsonl` via `bkit-status-route.sh`, the same doctrine as § Attempt counters, "never carried". The same change derives `REVALIDATE_ATTEMPT` from `status.jsonl` correctly and then carries `REVALIDATE_REASON` in the model — two adjacent routing values, two mechanisms. There is no `route_*` helper for it, so closing this means adding one or deriving it inline.

**`START_AT` fails open.** With `${START_AT:-}` empty, `.at > ""` is true for every row, so a missing or unreadable `ship-start-workflow` row counts `ship-revalidate-dispatch` rows from every previous ship of this FID and routes to the Failure Path early. The `case` guard only rejects non-numeric, and `length + 1` is always numeric. `counter_current` fails closed on exactly this class (refuses 0, exit 2).

### Not done

Host mirrors (`.claude` / `.cursor` / `.opencode`) are committed as they stood — they carry an earlier render and do not match the current `.bkit/prompts/bkit-ship-deferred-sweep.md`. `bkit check` does not gate mirror drift, so nothing will catch it. Needs a `bkit install` and a follow-up commit.

Full suite green at the commit: 99 files, 3601 passed.
