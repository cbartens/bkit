Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A `bkit:gate:min` that rewrites a file of the merged leftover tip and exits 0 lets `closePr` push the unrewritten merge commit, where `checkLanding` stops the same landing with "landing gate changed the checkout"
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1696`
  - **DONE WHEN:** `gateMerged` reads HEAD and `git status --porcelain --untracked-files=all --ignore-submodules=none` before the gate and compares both after it, as `unchanged()` in `checkLanding` (`.bkit/core/engine/commands/land.ts:189`) does. A gate that moves HEAD or leaves the tree changed returns a reason that names the branch and says the landing gate changed the checkout, nothing is pushed, and the exit code is 10 for the flush and 11 for the close. `gateMerged` passes `ctx.log` to `runPushGate` instead of `() => {}`, so the gate's own lines reach the exit log. Today `runWithReceipt` (`.bkit/core/engine/commands/ci/push-gate.ts:128`) returns a `bkit:gate:min` status without looking at the checkout, and for the deepest full gate it returns the gate's 0 when the checkout changed and only logs "full gate passed, but the checkout changed", a line `gateMerged` drops. `.bkit/core/.bkit/workflows.md:126` (§ One landing routine for every dev write) says "Missing gates, failed checks and a changed landing tree stop the push", and the diff's new `docs/security.md` paragraph says the local landing gate is the only check a `[skip ci]` landing gets.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev does not push a merged leftover tip the landing gate rewrote` fails on exit 0 with the remote `ship-failed/{FID}` moved past the leftover tip (dev's `package.json` declares `bkit:gate:min` as `if [ -e {REL}/ship-earlier.md ]; then printf 'fixed\n' >> {REL}/ship-earlier.md; fi`, which changes nothing on the record alone, so `checkLanding` passes; the leftover tip from `leftBranch` carries `earlier`; it expects exit 10, an err naming `ship-failed/{FID}`, and `git rev-parse ship-failed/{FID}` on the remote still at the leftover tip)

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A squash-merged `ship-failed/{FID}` or `ship-close/{FID}` branch left on origin is merged into the next record, and the merge puts back the `.bkit/friction.jsonl` rows that harvest drained from `dev` after that squash, so the new PR lands the drained rows on `dev` again
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1745`
  - **DONE WHEN:** When the leftover tip's own PR is already MERGED (`probePr` with `state: "all"` finds a MERGED PR whose `headRefName` is the branch and whose `headRefOid` is the tip), `closePr` records the tip with `git merge -s ours` (the record's tree is kept exactly, and the push still fast-forwards) instead of `-X ours` plus `restoreBranchRows`, so the PR carries only the new record. Any other leftover tip is merged as today. The plan's Edge Cases row "Leftover branch whose PR was squash-merged" says "Its changes are already on dev, so the PR adds only the new record", and the `.bkit/shared/.gitattributes` header says `.bkit/friction.jsonl` "is the one ledger rows are REMOVED from (bkit's harvest drains it). Union would resurrect rows a drain deleted". The resurrection needs no conflict: the record's side has no net change to the file between the merge base and `dev`, so the 3-way merge applies the tip's added row. Verified in this challenge with a scratch repo (base row `a`; the tip adds `x`; `dev` gets the squash adding `x`, then a commit draining `x`, then the record): `git merge --no-ff --no-commit -X ours {tip}` exited 0 and left `{"key":"x"}` in `.bkit/friction.jsonl`.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev onto a squash-merged ship-failed tip does not bring back a drained friction row` fails on `git show ship-failed/{FID}:.bkit/friction.jsonl` on the remote holding the `drained` row (`refusedAfter`: `leftBranch` adds `earlier` plus a `{"key":"drained"}` row in `.bkit/friction.jsonl`; a scratch clone commits the same files to `dev` as the squash, then a commit that removes the `drained` row, both pushed before the hook; a `rawGh` stub answers `pr list` with `--state all` with a MERGED PR on the branch whose `headRefOid` is the tip, answers `pr list` with `--state open` with `[]` until `pr create`, and merges on request; it expects exit 0 and no `drained` row on the remote branch)

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** `gateMerged` compares the merge with `origin/dev` as it reads after the refused push, so when another landing in the same clone has fetched a newer `dev` meanwhile, the record looks like it reverts that newer `dev` code: the flush runs the full push gate, or stops with "has no declared landing gate" when none is declared
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:1689`
  - **DONE WHEN:** `gateMerged` classifies the merge against the base the record was built on, `git merge-base HEAD origin/dev` (the commit `pushToDev` checked out at `worktree add`), as `checkLanding` does with the fixed `base` it receives from `.bkit/core/engine/commands/land.ts:243`. An `origin/dev` that a parallel landing moved to a newer commit then still picks `bkit:gate:min` for a record plus a leftover tip that touch only the record's paths. `refs/remotes/origin/dev` is shared by every worktree of the clone, `fetchDev` rewrites it with `+refs/heads/dev:refs/remotes/origin/dev` (`.bkit/core/.bkit/workflows.md:126`), `pushToDev`'s doc comment names "another landing in this clone updating `origin/dev`", and runs of different FIDs hold separate locks (`.bkit/core/.bkit/workflows.md` § Concurrency lock), so they can land at the same time.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `--flush refused by dev gates a merged leftover tip against the record's base when origin/dev moved` fails on exit 10 with an err naming "has no declared landing gate" (the test makes a commit `D2` in the run's clone with `git commit-tree`: dev's tree plus `src/other.ts`, parent dev; dev's `package.json` declares only `bkit:gate:min`, as `git update-ref refs/remotes/origin/dev {D2}`, which stands in for a parallel fetch and exits 0; a leftover `ship-failed/{FID}` tip carrying `earlier` sits on origin; it expects exit 0 and the leftover tip an ancestor of the remote `ship-failed/{FID}`)

<!-- bkit:task 3 end -->

