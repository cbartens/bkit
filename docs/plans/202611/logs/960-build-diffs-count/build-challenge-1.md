Verdict: CONCERNS
Failures: 4
Fingerprint: 272c7a5d0e18df65241bf6e95acfd2f5da27bcd496bf48f7da5cecb163cd42cb
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

Full diff read (`tmp/bkit-diff-960-build-diffs-count.md`, 1692 lines, no `partial diff coverage` mark) against `docs/plans/202611/960-build-diffs-count-plan.md`. Engine focus: `feature-base.ts`, the `context diff`, `challenge gate`, `branches scan-diff` and `status route` defaults, and the build, debug and ship workflow call sites that reach them. Host mirrors, `dist/` and generated registers were read as copies of their sources.

## Notes

- Task 1 path, read against the current `feature-base.ts`: with local `dev` containing HEAD, `merge-base HEAD refs/heads/dev` is HEAD, `isAncestor(o, l)` holds, so `featureBase` returns HEAD and `defaultRange` gives `{HEAD}..HEAD`, an empty diff. The same path makes an in-place debug run on `dev` with an empty `{BASE_FLAG}` scan nothing; debug in place normally gets `startSha`, so its explicit `--base` path is not affected.
- Checked and not a finding: `git()` returns `""` (not null) on a successful `merge-base --is-ancestor`, so the ancestor checks work; `merge-tree --write-tree` exits 1 on a conflict (and fails on a git too old to support it), which reaches the logged `origin/dev` fallback, so it fails safe; `{combined}...HEAD` in `bkit tests changed` diffs from one of several merge bases, testing more files, not fewer, as Task 3 of the plan states; build Step 16 routes a `scan-diff` exit other than 0 / 1 to the Failure Path, so a missing `origin/dev` fails closed.
- Docs cross-check: `docs/architecture.md` and `docs/security.md` hold no rule about diff bases or the `[DEBUG-OBSERVE]` no-leak scan. Outside this lens: the new `docs/decisions.jsonl` row says `featureBase` lives in `context.ts`, but it lives in `feature-base.ts` (re-exported from `context.ts`).
- Format fix from the last plan check: every `TEST FIRST` entry now puts the test file in backticks, then the test name in backticks.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A feature branch that local dev already contains (a local merge or fast-forward of the branch into dev) gets featureBase = HEAD, so every default diff is empty: scan-diff --marker="[DEBUG-OBSERVE]" --expect-none passes with a leaked marker, the migration scan misses migrations and challenge gate sizes 0 lines
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/feature-base.ts:22` · **Round:** 1
  - **DONE WHEN:** featureBase never returns HEAD's own commit when local dev contains HEAD (the refs/heads/dev merge-base equals git rev-parse HEAD); it falls back to the origin/dev meeting point, so the default diff of context diff, challenge gate and branches scan-diff holds the branch's commits that origin/dev lacks
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/feature-base.test.ts` `featureBase falls back to the origin/dev meeting point when local dev already contains HEAD` fails on featureBase returning HEAD's sha after git branch -f dev HEAD, not the origin/dev merge-base
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff without --base finds a marker the branch added when local dev already contains the branch` fails on --expect-none exiting 0 with found: false over the empty {HEAD}..HEAD range
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Ship's deferred sweep reads a diff measured from featureBase (its context diff passes no --base) while its Context tells it to scan disabled tests from origin/dev, so on a branch cut from a local dev ahead of origin/dev the sweep flags disabled tests in files its diff does not show, and the unpushed dev commits the PR merges go unreviewed by the diff the sweep reads
  **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/workflows/bkit-ship.md:530` · **Round:** 1
  - **DONE WHEN:** No agent can settle it, because the plan scopes featureBase to build and debug and never decides ship, whose PR merges origin/dev...HEAD, unpushed dev commits included. The owner decides which base ship's diff readers (Step 5 sweep and the Failure Path handover) measure from: the PR's merge diff (--base=origin/dev on both context diff lines) or the feature base (the sweep's Diff base Context line and its scan-diff --disabled-tests drop origin/dev). Then the artifact and the scan name one base
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `ship sweep diff and its disabled-tests scan measure from the same base` fails on ship Step 5's context diff line carrying no --base while the sweep Context names --base=origin/dev
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** branches scan-diff without --base no longer fetches origin/dev before diffing, so after a remote-side merge of dev into the branch (pulled into the worktree) build Step 16's migration scan measures from a stale origin/dev and counts other features' migrations as the branch's own, forcing a full CI build
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1694` · **Round:** 1
  - **DONE WHEN:** scan-diff with no --base runs fetchRemoteRef(top, "origin/dev") before defaultRange, logging a failed fetch and diffing against the local ref, as an explicit origin/<branch> base does
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff without --base fetches origin dev before measuring` fails on refs/remotes/origin/dev still naming the old tip after a commit was pushed to the remote's dev
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** bkit status route computes cleanBase (now featureBase) on every call for every workflow and step, so when origin/dev was merged into a branch cut from local dev, each route call runs git merge-tree --write-tree and writes a fresh commit-tree object, a write and a merge on a read verb the workflows call many times per run
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/status.ts:548` · **Round:** 1
  - **DONE WHEN:** status route resolves cleanBase (and so calls featureBase) only for --step=build-plan-verify-holistic; other steps print no cleanBase or a value computed without merge-tree or commit-tree
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `status route for a non-holistic step writes no feature-base commit` fails on git count-objects -v reporting more loose objects after status route --step=build-plan-tasks in the split-meeting-point repo
<!-- bkit:task 4 end -->
