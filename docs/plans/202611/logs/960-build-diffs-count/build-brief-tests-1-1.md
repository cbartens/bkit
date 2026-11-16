# Brief: group 1 — Feature base in the engine (tests)

Plan: Feature base for build and debug diffs Implementation Plan

## Why and what

### Context & Goals

When local `dev` is ahead of `origin/dev`, a build branch cut from local `dev` measures its diff from `origin/dev`, so unpushed `dev` commits count as the feature's. Add one engine helper, `featureBase`, and make `bkit context diff`, `bkit challenge gate`, `bkit branches scan-diff`, #951's `cleanBase` and `/bkit-debug` use it by default. Source: issue #960.

## Where it fits

- Group 1: Feature base in the engine — this group
  - TASK 1: Add `featureBase` and remove `DIFF_BASE` — open
  - TASK 2: Default the diff readers to `featureBase` — open
  - TASK 3: Use `featureBase` as the holistic test base fallback — open
- Group 2: Workflow, prompt and docs — next
  - TASK 4: Drop `origin/dev` as the diff and test base in the build workflow and verify prompt — open
  - TASK 5: Bring the docs and decisions in line — open
  - TASK 6: Let `/bkit-debug` off `dev` use the feature base — open

## The work

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

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| featureBase picks the local dev meeting point when the branch was cut from a local dev ahead of origin/dev | unit | `.bkit/core/engine/commands/workflow/context.test.ts` | 1 |
| featureBase picks the origin/dev meeting point when local dev equals origin/dev | unit | `.bkit/core/engine/commands/workflow/context.test.ts` | 1 |
| featureBase picks the origin/dev meeting point when the branch was cut from origin/dev and local dev diverged | unit | `.bkit/core/engine/commands/workflow/context.test.ts` | 1 |
| featureBase combines both meeting points when origin/dev was merged into a branch cut from local dev | unit | `.bkit/core/engine/commands/workflow/context.test.ts` | 1 |
| featureBase falls back to the origin/dev meeting point and logs when the combination conflicts | unit | `.bkit/core/engine/commands/workflow/context.test.ts` | 1 |
| featureBase uses the origin/dev meeting point when there is no local dev | unit | `.bkit/core/engine/commands/workflow/context.test.ts` | 1 |
| context diff without --base leaves out an unpushed local dev commit | unit | `.bkit/core/engine/commands/workflow/context.test.ts` | 2 |
| challenge gate without --base sizes only the branch's own lines | unit | `.bkit/core/engine/commands/workflow/challenge.test.ts` | 2 |
| scan-diff without --base ignores a match that only an unpushed local dev commit adds | unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 2 |
| cleanBase with no clean round returns the feature base, not origin/dev | unit | `.bkit/core/engine/commands/workflow/status.test.ts` | 3 |
