## Session Prompt — this run's, newer than everything below

#960

## Issue description — oldest

### Narrative

When local `dev` is ahead of `origin/dev`, `/bkit-build` Step 2 starts the feature branch from local `dev` (`devBase` in `.bkit/core/engine/commands/workflow/worktrees.ts`). Every later read of "the feature's own changes" still measures from `origin/dev`. `origin/dev...HEAD` starts at the last commit the branch shares with `origin/dev`, which comes before the unpushed `dev` commits, so those commits count as part of the feature:

- The challenge reviewers review them, and any fix task they raise lands in the feature branch.
- The challenge size gate counts them, so a small change can be routed as large and launch the second reviewer for nothing.
- The holistic verify runs the tests for their files too.
- The migration scan and the Failure Path handover diff include them.

`/bkit-debug` has the same bug. Off `dev`, it diffs from `origin/dev` (Step 2: "`startSha` as `DIFF_BASE` (`origin/dev` when null)"), so a debug run on a held build branch cut from a local `dev` that is ahead reviews and scans the unpushed `dev` commits too.

Seen on 2026-11-15 in the #814 build, challenge round 1. The worktree `feat/814-local-test-limits` was cut from local `dev` while it was 5 commits ahead of `origin/dev`:

<!-- prettier-ignore -->
| Range, `docs/plans/**` excluded | Files | Lines added + deleted |
| --- | --- | --- |
| `origin/dev...HEAD` (what the reviewers got) | 142 | 4353 |
| `dev...HEAD` (#814's own work) | 41 | 2700 |

The fix is one engine helper, `featureBase`. It finds the commit the feature's own work starts after, and every reader uses it as its default. The helper finds where the branch last met `origin/dev` and where it last met local `dev`, then takes whichever is later. A branch cut from local `dev` then excludes the unpushed `dev` commits, and a branch cut from `origin/dev` behaves exactly as it does today. Because the helper reads both copies of `dev` and needs no run mode, #936's local mode gets the right base with no further change.

### Success Criteria

- On a branch cut from a local `dev` that is ahead of `origin/dev`, `bkit context diff`, `bkit challenge gate` and `bkit branches scan-diff` without `--base` cover only the branch's own commits.
- On a branch cut from `origin/dev` with local `dev` equal to it or diverged from it, those three verbs measure the same range as `origin/dev...HEAD` does today.
- The holistic verify's first test run (#951's `cleanBase` with no clean round) tests only the branch's own files, and a `/bkit-debug` run off `dev` diffs and scans only the branch's own commits.
- `.bkit/core/workflows/bkit-build.md`, `.bkit/core/prompts/bkit-build-plan-verify.md`, `.bkit/workflows.md` and `.bkit/prompts.md` describe the diff base as the feature's start commit and no longer say `origin/dev...HEAD`.
- `bkit tasks currency` still measures against `origin/dev`.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Local `dev` equals `origin/dev` | Base = where the branch last met `origin/dev`, as today |
| Local `dev` is ahead of `origin/dev` and the branch was cut from it | Base = where the branch last met local `dev`, so the unpushed `dev` commits are excluded |
| Local `dev` diverged from `origin/dev` and the branch was cut from `origin/dev` | Base = where the branch last met `origin/dev`, as today |
| Branch cut from local `dev`, then `origin/dev` moved and Step 3 merged `origin/dev` into the branch, so neither meeting point comes after the other | Base = a commit whose tree combines both meeting points (`git merge-tree --write-tree`), diffed straight to HEAD, so neither the unpushed `dev` commits nor the merged-in `origin/dev` commits count as the feature's. The holistic test run may test more files than the feature changed, never fewer |
| That combination has a conflict | Base = where the branch last met `origin/dev`, and the verb logs one line saying the diff may include unpushed `dev` commits |
| No local `dev` branch (CI or cloud clone) | Base = where the branch last met `origin/dev` |
| `--base` given | That base is used exactly, as today (per-group verify, debug in place on `dev`) |
| `/bkit-debug` in place on `dev` (`startSha` present) | Diffs from `startSha`, as today |
| `/bkit-debug` on a branch (`startSha` absent) | Passes no `--base`, so its diff and its `[DEBUG-OBSERVE]` scan use `featureBase` |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| featureBase picks the local dev meeting point when the branch was cut from a local dev ahead of origin/dev | unit | `.bkit/core/engine/commands/workflow/context.test.ts` |
| featureBase picks the origin/dev meeting point when local dev equals origin/dev | unit | `.bkit/core/engine/commands/workflow/context.test.ts` |
| featureBase picks the origin/dev meeting point when the branch was cut from origin/dev and local dev diverged | unit | `.bkit/core/engine/commands/workflow/context.test.ts` |
| featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev | unit | `.bkit/core/engine/commands/workflow/context.test.ts` |
| featureBase falls back to the origin/dev meeting point and logs when the combination conflicts | unit | `.bkit/core/engine/commands/workflow/context.test.ts` |
| featureBase uses the origin/dev meeting point when there is no local dev | unit | `.bkit/core/engine/commands/workflow/context.test.ts` |
| context diff without --base leaves out an unpushed local dev commit | unit | `.bkit/core/engine/commands/workflow/context.test.ts` |
| challenge gate without --base sizes only the branch's own lines | unit | `.bkit/core/engine/commands/workflow/challenge.test.ts` |
| scan-diff without --base ignores a match that only an unpushed local dev commit adds | unit | `.bkit/core/engine/commands/workflow/branches.test.ts` |
| cleanBase with no clean round returns the feature base, not origin/dev | unit | `.bkit/core/engine/commands/workflow/status.test.ts` |
| build workflow and verify prompt name no origin/dev diff or test base | unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` |
| debug passes --base only when it runs in place on dev | unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Feature base in the engine
<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Add `featureBase` and remove `DIFF_BASE`
  - **CREATE:** `featureBase` in `.bkit/core/engine/commands/workflow/context.ts`: returns the commit sha the feature's own work starts after. It takes the later of the merge-base of HEAD with `origin/dev` and the merge-base of HEAD with `refs/heads/dev`. When neither comes after the other, it combines the two with `git merge-tree --write-tree` and returns a `git commit-tree` commit of that tree, with both meeting points as parents; on a conflict it returns the `origin/dev` merge-base and logs one line. With no local `dev`, it returns the `origin/dev` merge-base.
  - **DELETE:** `DIFF_BASE` in `.bkit/core/engine/commands/workflow/context.ts`: replaced by `featureBase`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/tasks.ts`: `tasks currency` keeps `origin/dev` as its own named default, not `DIFF_BASE`
  - **READ:** `.bkit/core/engine/commands/workflow/branches.ts`: the existing `merge-tree --write-tree` call
  - **READ:** `devBase` in `.bkit/core/engine/commands/workflow/worktrees.ts`: which copy of `dev` a branch starts from
  - **DONE WHEN:** the six `featureBase` tests pass and `tasks currency` tests are unchanged and green
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/context.test.ts` `featureBase picks the local dev meeting point when the branch was cut from a local dev ahead of origin/dev` fails on `featureBase` not existing
    - `.bkit/core/engine/commands/workflow/context.test.ts` `featureBase picks the origin/dev meeting point when local dev equals origin/dev` fails on `featureBase` not existing
    - `.bkit/core/engine/commands/workflow/context.test.ts` `featureBase picks the origin/dev meeting point when the branch was cut from origin/dev and local dev diverged` fails on `featureBase` not existing
    - `.bkit/core/engine/commands/workflow/context.test.ts` `featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev` fails on `featureBase` not existing
    - `.bkit/core/engine/commands/workflow/context.test.ts` `featureBase falls back to the origin/dev meeting point and logs when the combination conflicts` fails on `featureBase` not existing
    - `.bkit/core/engine/commands/workflow/context.test.ts` `featureBase uses the origin/dev meeting point when there is no local dev` fails on `featureBase` not existing
<!-- bkit:task 1 end -->
<!-- bkit:task 2 start -->
- [ ] **TASK 2:** Default the diff readers to `featureBase`
  - **UPDATE:** `contextCommand` in `.bkit/core/engine/commands/workflow/context.ts`: `diff` with no `--base` → `featureBase`; the artifact's range line names the resolved base
  - **UPDATE:** `challengeCommand` in `.bkit/core/engine/commands/workflow/challenge.ts`: `gate` with no `--base` → fetch `origin dev` as today, then `featureBase`
  - **UPDATE:** `scanDiffVerb` in `.bkit/core/engine/commands/workflow/branches.ts`: `--base` becomes optional, no `--base` → `featureBase`
  - **UPDATE:** `diffNumstat` in `.bkit/core/engine/commands/workflow/context.ts`: a `featureBase` default is diffed straight to HEAD (`{sha}..HEAD`), because the combined commit of the split case is not an ancestor of HEAD; an explicit `--base` keeps `{base}...HEAD`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the three verbs' tests pass, and their existing tests that pass `--base` are unchanged and green
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/context.test.ts` `context diff without --base leaves out an unpushed local dev commit` fails on the artifact containing the unpushed commit's file
    - `.bkit/core/engine/commands/workflow/challenge.test.ts` `challenge gate without --base sizes only the branch's own lines` fails on the gate counting the unpushed commit's lines
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff without --base ignores a match that only an unpushed local dev commit adds` fails on `--base` being required
<!-- bkit:task 2 end -->
<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Use `featureBase` as the holistic test base fallback
  - **UPDATE:** `cleanBase` in `.bkit/core/engine/commands/workflow/status.ts`: #951 adds it; with no clean round, or a clean round whose `parentSha` is not an ancestor of HEAD, return `featureBase` instead of `origin/dev`. `bkit tests changed` keeps `{base}...HEAD`: in the split case git then measures from one of the two meeting points, so it may test more files than the feature changed, never fewer
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the `cleanBase` test passes and #951's existing `cleanBase` tests are green
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/status.test.ts` `cleanBase with no clean round returns the feature base, not origin/dev` fails on `cleanBase` returning `origin/dev`
<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->
<!-- bkit:group 2 start -->
### TASK GROUP 2: Workflow, prompt and docs
<!-- bkit:task 4 start -->
- [ ] **TASK 4:** Drop `origin/dev` as the diff and test base in the build workflow and verify prompt
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: the migration scan calls `bkit branches scan-diff` without `--base=origin/dev`; the holistic `Test base` wording from #951 names the feature's start commit for the first check
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: the `Test base` sentence from #951 says the first check tests from the feature's start commit, not `origin/dev`
  - **DEPENDS ON:** 2, 3
  - **DONE WHEN:** the audit test passes, and after `bkit install` re-renders the host mirrors of both files, `bkit check` reports no drift
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `build workflow and verify prompt name no origin/dev diff or test base` fails on the migration scan's `--base=origin/dev`
<!-- bkit:task 4 end -->
<!-- bkit:task 5 start -->
- [ ] **TASK 5:** Bring the docs and decisions in line
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the Diff per reader row and the build Step 11 row say the diff and the size gate measure from the feature's start commit
  - **UPDATE:** `.bkit/workflows.md`: the same two rows, kept identical to `.bkit/core/.bkit/workflows.md`
  - **UPDATE:** `.bkit/core/.bkit/prompts.md`: the `bkit-build-challenge-1` row says "the run's diff" instead of `git diff origin/dev...HEAD`
  - **UPDATE:** `.bkit/prompts.md`: the same row, kept identical to `.bkit/core/.bkit/prompts.md`
  - **UPDATE:** `docs/decisions.jsonl`: one new row for `featureBase`, appended with `bkit ledgers append`; it revises key `665-challenge-small-change-threshold`, whose summary says `origin/dev...HEAD`
  - **DEPENDS ON:** 4
  - **DONE WHEN:** `git grep -n "origin/dev\.\.\.HEAD"` over `.bkit/**/*.md` returns only debug and ship lines; `bkit check` passes
  - **TEST FIRST:** n/a — docs and ledger only
<!-- bkit:task 5 end -->
<!-- bkit:task 6 start -->
- [ ] **TASK 6:** Let `/bkit-debug` off `dev` use the feature base
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: Step 2 sets `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty, in the same form as `{BRANCH_FLAG}`; `DIFF_BASE` and its `origin/dev` fallback are removed
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: the Failure Path `context diff` and the Step 11 `scan-diff` pass `{BASE_FLAG}` instead of `--base={DIFF_BASE}`
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the debug Step 2 and Step 11 rows and the Diff per reader row describe `{BASE_FLAG}` instead of `DIFF_BASE`
  - **UPDATE:** `.bkit/workflows.md`: the same three rows, kept identical to `.bkit/core/.bkit/workflows.md`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the `diff per reader` table's `BASE_FLAG` entry for debug becomes ` {BASE_FLAG}`; the `debug diffs against DIFF_BASE on dev` test is replaced by the test below
  - **DEPENDS ON:** 2
  - **DONE WHEN:** the audit test passes, and after `bkit install` re-renders the host mirrors of `bkit-debug.md`, `bkit check` reports no drift
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug passes --base only when it runs in place on dev` fails on Step 2's `origin/dev` when null fallback
<!-- bkit:task 6 end -->
<!-- bkit:group 2 end -->

### Open Questions & Assumptions

- Assumption: three-dot `origin/dev...HEAD` stays correct for a branch cut from `origin/dev` that is behind `dev`, as decision `661-ship-b1-updates-branch-only-when-dev-requires-checks` says. `featureBase` keeps that case unchanged.
- Assumption: `/bkit-ship` needs no change here. `assertShipEligible` (`.bkit/core/engine/commands/workflow/worktrees.ts`) refuses a branch that carries unpushed `dev` commits, so ship's `origin/dev` base (the deferred sweep's `scan-diff --base=origin/dev`) is correct today. Ship's `context diff` calls pass no `--base` and pick up `featureBase` from Task 2, which gives the same range on every branch ship accepts. #938 removes that refusal for a local ship and must move the deferred sweep's base then.

### Breaking Changes & Naming

- `DIFF_BASE` is removed from `.bkit/core/engine/commands/workflow/context.ts`. Its importers are `challenge.ts` and `tasks.ts`.
- `bkit branches scan-diff --base` becomes optional. Every existing call passes it, so nothing breaks.
- The diff artifact's range line names the resolved base sha instead of `origin/dev...HEAD`.
- `/bkit-debug`'s `DIFF_BASE` placeholder becomes `{BASE_FLAG}`, which is empty off `dev`.

### Out of Scope

- `bkit tasks currency`: it measures how far `dev` moved since the plan was written, not the feature's diff (decision `701-currency-against`).
- Per-group verify: it already passes `--base={GROUP_BASE}`.
- `landingRef` and the local start base: #936.

### References

- #814 — the build where this was seen
- #924 — Let every workflow land on local dev without pushing. Its design replaces `origin/dev` with `landingRef` at the start base, the cleanup proof, the close gate and the refusals, but not at the diff base.
- #936 — Publish mode and local start base
- #938 — Ship and debug in local mode
- #951 — Build: repeat whole-feature checks re-check everything, costing hours. Adds `cleanBase`, whose fallback is `origin/dev`.
- `docs/decisions.jsonl` key `661-ship-b1-updates-branch-only-when-dev-requires-checks`
- `docs/decisions.jsonl` key `665-challenge-small-change-threshold`
- `docs/decisions.jsonl` key `701-currency-against`
- `.bkit/workflows.md` § Common Workflow Anatomy
- `.bkit/workflows.md` § Diff per reader

###### bkit:blocked-by start
- #951
###### bkit:blocked-by end
