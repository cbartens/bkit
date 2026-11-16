# Brief: group 3 — Challenge round 1 findings

Plan: Feature base for build and debug diffs Implementation Plan

## Why and what

### Context & Goals

When local `dev` is ahead of `origin/dev`, a build branch cut from local `dev` measures its diff from `origin/dev`, so unpushed `dev` commits count as the feature's. Add one engine helper, `featureBase`, and make `bkit context diff`, `bkit challenge gate`, `bkit branches scan-diff`, #951's `cleanBase` and `/bkit-debug` use it by default. Source: issue #960.

## Where it fits

- Group 1: Feature base in the engine — done
  - TASK 1: Add `featureBase` and remove `DIFF_BASE` — done
  - TASK 2: Default the diff readers to `featureBase` — done
  - TASK 3: Use `featureBase` as the holistic test base fallback — done
- Group 2: Workflow, prompt and docs — done
  - TASK 4: Drop `origin/dev` as the diff and test base in the build workflow and verify prompt — done
  - TASK 5: Bring the docs and decisions in line — done
  - TASK 6: Let `/bkit-debug` off `dev` use the feature base — done
- Group 3: Challenge round 1 findings — this group
  - TASK 7: Unpushed local `dev` commits ride the feature push and PR into `origin/dev`, but the default-base gates no longer see them: a failed in-place `/bkit-debug` on `dev` leaves `[DEBUG-OBSERVE]` instrumentation commits on local `dev`, the next branch is cut from local `dev`, and the off-`dev` debug no-leak scan, the migration `FORCE_BUILD` scan, the challenge size gate, the security reviewer's diff and ship Step 5's diff all measure from `featureBase`, so the marker lines and migrations reach `origin/dev` unreviewed and unscanned — open
  - TASK 8: A feature branch that local dev already contains (a local merge or fast-forward of the branch into dev) gets featureBase = HEAD, so every default diff is empty: scan-diff --marker="[DEBUG-OBSERVE]" --expect-none passes with a leaked marker, the migration scan misses migrations and challenge gate sizes 0 lines — open
  - TASK 9: Ship's deferred sweep reads a diff measured from featureBase (its context diff passes no --base) while its Context tells it to scan disabled tests from origin/dev, so on a branch cut from a local dev ahead of origin/dev the sweep flags disabled tests in files its diff does not show, and the unpushed dev commits the PR merges go unreviewed by the diff the sweep reads — open

## The work

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Unpushed local `dev` commits ride the feature push and PR into `origin/dev`, but the default-base gates no longer see them: a failed in-place `/bkit-debug` on `dev` leaves `[DEBUG-OBSERVE]` instrumentation commits on local `dev`, the next branch is cut from local `dev`, and the off-`dev` debug no-leak scan, the migration `FORCE_BUILD` scan, the challenge size gate, the security reviewer's diff and ship Step 5's diff all measure from `featureBase`, so the marker lines and migrations reach `origin/dev` unreviewed and unscanned
      **Severity:** HIGH · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1692` · **Round:** 1
  - **DONE WHEN:** The two publishing-guard scans measure everything the feature push publishes, by passing `--base=origin/dev` explicitly: build Step 16's migration scan (`.bkit/core/workflows/bkit-build.md`, the `branches scan-diff --paths='(^|/)(migrations|migrate)/'` line) and debug's `[DEBUG-OBSERVE]` no-leak scan (`.bkit/core/workflows/bkit-debug.md`, the `branches scan-diff ... --marker="[DEBUG-OBSERVE]" --expect-none` line) when the run is off `dev`; in place on `dev` the no-leak scan keeps `--base={startSha}`. The `scan-diff` default (`featureBase`), Task 2's test `scan-diff without --base ignores a match that only an unpushed local dev commit adds`, the security challenge diff, the challenge size gate and the holistic test base stay on `featureBase`. The workflow docs that describe these scans name the base each one uses
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build migration scan and debug off-dev no-leak scan pass --base=origin/dev` fails on build Step 16's `scan-diff --paths` line carrying no `--base` and debug's no-leak `scan-diff` line taking `{BASE_FLAG}`, which is empty off `dev`

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** A feature branch that local dev already contains (a local merge or fast-forward of the branch into dev) gets featureBase = HEAD, so every default diff is empty: scan-diff --marker="[DEBUG-OBSERVE]" --expect-none passes with a leaked marker, the migration scan misses migrations and challenge gate sizes 0 lines
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/feature-base.ts:22` · **Round:** 1
  - **DONE WHEN:** featureBase never returns HEAD's own commit when local dev contains HEAD (the refs/heads/dev merge-base equals git rev-parse HEAD); it falls back to the origin/dev meeting point, so the default diff of context diff, challenge gate and branches scan-diff holds the branch's commits that origin/dev lacks
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/feature-base.test.ts` `featureBase falls back to the origin/dev meeting point when local dev already contains HEAD` fails on featureBase returning HEAD's sha after git branch -f dev HEAD, not the origin/dev merge-base
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff without --base finds a marker the branch added when local dev already contains the branch` fails on --expect-none exiting 0 with found: false over the empty {HEAD}..HEAD range

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Ship's deferred sweep reads a diff measured from featureBase (its context diff passes no --base) while its Context tells it to scan disabled tests from origin/dev, so on a branch cut from a local dev ahead of origin/dev the sweep flags disabled tests in files its diff does not show, and the unpushed dev commits the PR merges go unreviewed by the diff the sweep reads
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/workflows/bkit-ship.md:530` · **Round:** 1
  - **DONE WHEN:** Both of ship's `context diff` lines in `.bkit/core/workflows/bkit-ship.md` (the Step 5 deferred sweep, `--step=ship-deferred-sweep`, and the Failure Path handover, `--step=abort-handover`) pass `--base=origin/dev`, so the diff the sweep reads is the PR's merge diff and names the same base as the sweep Context's `bkit branches scan-diff --disabled-tests --base=origin/dev`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `ship sweep and Failure Path context diff lines pass --base=origin/dev` fails on both ship `context diff` lines carrying no `--base` while the sweep Context names `--base=origin/dev`

<!-- bkit:task 9 end -->
