# Feature base for build and debug diffs Implementation Plan

## Context & Goals

When local `dev` is ahead of `origin/dev`, a build branch cut from local `dev` measures its diff from `origin/dev`, so unpushed `dev` commits count as the feature's. Add one engine helper, `featureBase`, and make `bkit context diff`, `bkit challenge gate`, `bkit branches scan-diff`, #951's `cleanBase` and `/bkit-debug` use it by default. Source: issue #960.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | no — engine helper inside an existing command module | `.agents/docs.md` index; repository code | partial | None |
| technology | `docs/technology.md` | no — no new dependency | `.agents/docs.md` index | partial | None |
| security | `docs/security.md` | no — no credential or permission change | `.agents/docs.md` index | partial | None |
| testing | `docs/testing.md` | yes — unit tests beside each command | `.agents/docs.md` index; existing `*.test.ts` files | partial | Tests follow the neighbouring test files |
| deployments | `docs/deployments.md` | no — branch-diff behaviour only | `.agents/docs.md` index | partial | None |

## Documentation Warnings

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Diff base default | `.bkit/core/engine/commands/workflow/context.ts` | `rg -n "DIFF_BASE" .bkit/core/engine/commands/workflow`, `merge-tree` in `branches.ts` | `DIFF_BASE` in `context.ts` — fixed `origin/dev`, missing the local `dev` meeting point | EXTEND | Replace the constant with `featureBase` in the same file |
| Scan-diff base | `.bkit/core/engine/commands/workflow/branches.ts` | `rg -n "scanDiffVerb"` | `scanDiffVerb` — requires `--base` | EXTEND | Make `--base` optional |
| Challenge gate base | `.bkit/core/engine/commands/workflow/challenge.ts` | `rg -n "DIFF_BASE"` | `challengeCommand` gate | EXTEND | Default to `featureBase` |
| Holistic test base | `.bkit/core/engine/commands/workflow/status.ts` | `rg -n "cleanBase"` | `cleanBase` — falls back to `origin/dev` | EXTEND | Fall back to `featureBase` |
| Currency base | `.bkit/core/engine/commands/workflow/tasks.ts` | `rg -n "DIFF_BASE"` | `tasks.ts` imports `DIFF_BASE` | EXTEND | Keep `origin/dev` as its own named default |
| `featureBase` helper | `.bkit/core/engine/commands/workflow/context.ts` | `rg -n "merge-base" .bkit/core/engine/commands/workflow`, `rg -n "DIFF_BASE"` there | `DIFF_BASE` — a fixed `origin/dev` string, not a computed commit | NEW | (c) the candidate `DIFF_BASE` is a Supersession Inventory DELETE |

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `DIFF_BASE` in `.bkit/core/engine/commands/workflow/context.ts` | `featureBase` in `.bkit/core/engine/commands/workflow/context.ts` | DELETE | A fixed `origin/dev` base counts unpushed local `dev` commits as the feature's |

## Derived Test Matrix

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
| build workflow names origin/dev only on the migration scan and the verify prompt tests from the start commit | unit | `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` | 4 |
| debug passes --base only when it runs in place on dev, outside the no-leak scan | unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 6 |
| build migration scan and debug off-dev no-leak scan pass --base=origin/dev | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 7 |
| featureBase falls back to the origin/dev meeting point when local dev already contains HEAD | Unit | `.bkit/core/engine/commands/workflow/feature-base.test.ts` | 8 |
| scan-diff without --base finds a marker the branch added when local dev already contains the branch | Unit | `.bkit/core/engine/commands/workflow/branches.test.ts` | 8 |
| ship sweep and Failure Path context diff lines pass --base=origin/dev | Unit | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 9 |

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Feature base in the engine

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Add `featureBase` and remove `DIFF_BASE`
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

- [x] **TASK 2:** Default the diff readers to `featureBase`
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

- [x] **TASK 3:** Use `featureBase` as the holistic test base fallback
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

- [x] **TASK 4:** Drop `origin/dev` as the diff and test base in the build workflow and verify prompt
  - **UPDATE:** `.bkit/core/workflows/bkit-build.md`: no diff or test base names `origin/dev` except the Step 16 migration scan, which TASK 7 points at `--base=origin/dev`; the holistic `Test base` wording from #951 names the feature's start commit for the first check
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: the `Test base` sentence from #951 says the first check tests from the feature's start commit, not `origin/dev`
  - **DEPENDS ON:** 2, 3
  - **DONE WHEN:** the audit test passes, and after `bkit install` re-renders the host mirrors of both files, `bkit check` reports no drift
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/local-gate-audit.test.ts` `build workflow names origin/dev only on the migration scan and the verify prompt tests from the start commit` fails on a `--base=origin/dev` line in `bkit-build.md` other than the migration scan, or a verify prompt `Test base` that names `origin/dev`

<!-- bkit:task 4 end -->
<!-- bkit:task 5 start -->

- [x] **TASK 5:** Bring the docs and decisions in line
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

- [x] **TASK 6:** Let `/bkit-debug` off `dev` use the feature base
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: Step 2 sets `{BASE_FLAG}` = `--base={startSha}` when `startSha` is present, else empty, in the same form as `{BRANCH_FLAG}`; `DIFF_BASE` and its `origin/dev` fallback are removed
  - **UPDATE:** `.bkit/core/workflows/bkit-debug.md`: the Failure Path `context diff` and the Step 11 `scan-diff` lines pass `{BASE_FLAG}` instead of `--base={DIFF_BASE}`, except the no-leak scan, which TASK 7 points at `{NOLEAK_BASE}`
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: the debug Step 2 and Step 11 rows and the Diff per reader row describe `{BASE_FLAG}` instead of `DIFF_BASE`
  - **UPDATE:** `.bkit/workflows.md`: the same three rows, kept identical to `.bkit/core/.bkit/workflows.md`
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: the `diff per reader` table's `BASE_FLAG` entry for debug becomes ` {BASE_FLAG}`; the `debug diffs against DIFF_BASE on dev` test is replaced by the test below
  - **DEPENDS ON:** 2
  - **DONE WHEN:** the audit test passes, and after `bkit install` re-renders the host mirrors of `bkit-debug.md`, `bkit check` reports no drift
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `debug passes --base only when it runs in place on dev, outside the no-leak scan` fails on Step 2's `origin/dev` when null fallback

<!-- bkit:task 6 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Challenge round 1 findings

<!-- bkit:task 7 start -->

- [x] **TASK 7:** Unpushed local `dev` commits ride the feature push and PR into `origin/dev`, but the default-base gates no longer see them: a failed in-place `/bkit-debug` on `dev` leaves `[DEBUG-OBSERVE]` instrumentation commits on local `dev`, the next branch is cut from local `dev`, and the off-`dev` debug no-leak scan, the migration `FORCE_BUILD` scan, the challenge size gate, the security reviewer's diff and ship Step 5's diff all measure from `featureBase`, so the marker lines and migrations reach `origin/dev` unreviewed and unscanned
      **Severity:** HIGH · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:1692` · **Round:** 1
  - **DONE WHEN:** The two publishing-guard scans measure everything the feature push publishes, by passing `--base=origin/dev` explicitly: build Step 16's migration scan (`.bkit/core/workflows/bkit-build.md`, the `branches scan-diff --paths='(^|/)(migrations|migrate)/'` line) and debug's `[DEBUG-OBSERVE]` no-leak scan (`.bkit/core/workflows/bkit-debug.md`, the `branches scan-diff ... --marker="[DEBUG-OBSERVE]" --expect-none` line) when the run is off `dev`; in place on `dev` the no-leak scan keeps `--base={startSha}`. The `scan-diff` default (`featureBase`), Task 2's test `scan-diff without --base ignores a match that only an unpushed local dev commit adds`, the security challenge diff, the challenge size gate and the holistic test base stay on `featureBase`. The workflow docs that describe these scans name the base each one uses
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build migration scan and debug off-dev no-leak scan pass --base=origin/dev` fails on build Step 16's `scan-diff --paths` line carrying no `--base` and debug's no-leak `scan-diff` line taking `{BASE_FLAG}`, which is empty off `dev`

<!-- bkit:task 7 end -->
<!-- bkit:task 8 start -->

- [x] **TASK 8:** A feature branch that local dev already contains (a local merge or fast-forward of the branch into dev) gets featureBase = HEAD, so every default diff is empty: scan-diff --marker="[DEBUG-OBSERVE]" --expect-none passes with a leaked marker, the migration scan misses migrations and challenge gate sizes 0 lines
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/feature-base.ts:22` · **Round:** 1
  - **DONE WHEN:** featureBase never returns HEAD's own commit when local dev contains HEAD (the refs/heads/dev merge-base equals git rev-parse HEAD); it falls back to the origin/dev meeting point, so the default diff of context diff, challenge gate and branches scan-diff holds the branch's commits that origin/dev lacks
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/feature-base.test.ts` `featureBase falls back to the origin/dev meeting point when local dev already contains HEAD` fails on featureBase returning HEAD's sha after git branch -f dev HEAD, not the origin/dev merge-base
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `scan-diff without --base finds a marker the branch added when local dev already contains the branch` fails on --expect-none exiting 0 with found: false over the empty {HEAD}..HEAD range

<!-- bkit:task 8 end -->
<!-- bkit:task 9 start -->

- [x] **TASK 9:** Ship's deferred sweep reads a diff measured from featureBase (its context diff passes no --base) while its Context tells it to scan disabled tests from origin/dev, so on a branch cut from a local dev ahead of origin/dev the sweep flags disabled tests in files its diff does not show, and the unpushed dev commits the PR merges go unreviewed by the diff the sweep reads
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/workflows/bkit-ship.md:530` · **Round:** 1
  - **DONE WHEN:** Both of ship's `context diff` lines in `.bkit/core/workflows/bkit-ship.md` (the Step 5 deferred sweep, `--step=ship-deferred-sweep`, and the Failure Path handover, `--step=abort-handover`) pass `--base=origin/dev`, so the diff the sweep reads is the PR's merge diff and names the same base as the sweep Context's `bkit branches scan-diff --disabled-tests --base=origin/dev`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `ship sweep and Failure Path context diff lines pass --base=origin/dev` fails on both ship `context diff` lines carrying no `--base` while the sweep Context names `--base=origin/dev`

<!-- bkit:task 9 end -->
<!-- bkit:group 3 end -->
