# Design Input — 397-cloud-concurrency-arbitration

## Session Prompt

`/bkit-design 397`

## Issue #397 — bkit-cloud concurrency ship-global lock cross-surface FID arbitration

**State:** open
**Labels:** enhancement, bkit:design
**Milestone:** Workflow Optimisation
**URL:** https://github.com/cbartens/bkit/issues/397

### Description

> Surfaced while scoping #363's dev-CD-failure auto-route. #363 makes the `bkit-cloud` concurrency model load-bearing for post-merge debug; reviewing it exposed two pre-existing gaps in the model that #363 doesn't introduce but should be addressed in their own cycle.

## Target concurrency model

<!-- prettier-ignore -->
| Phase | Cross-FID | Same-FID |
| --- | --- | --- |
| Design / Plan / Build | unlimited | one workflow at a time |
| Debug (`feat/**`) | unlimited (per-FID isolation) | one workflow at a time |
| Debug (`dev`, post-merge) | one at a time globally (queue, not cancel) | n/a — `dev` is the convergence point |
| Ship | **one at a time globally** | one workflow at a time |

Today's `bkit-cloud.yml:73` group expression `bkit-auto-${{ inputs.issue || github.event.workflow_run.head_branch }}` enforces some of this and contradicts the rest.

## Problem — two gaps

### Gap 1: Ship is not global at the GHA level

Two green `feat/**` PRs landing within the CI window dispatch two `/bkit-ship` runs concurrently (different groups: `bkit-auto-feat/{FID-A}` vs `bkit-auto-feat/{FID-B}`). Both boot, both attempt merge — they serialise via the in-workflow `.dev.lock` (`bkit-ship.md:27`) and the per-FID lock, but:

- Both sessions burn runner minutes while one waits up to the 600s lock deadline.
- Both attempt `gh pr update-branch` / `gh pr merge` against their own PR; the second one's PR may no longer merge cleanly after the first lands on `dev` (race-window for "PR-head-stale" failures).
- The `.dev.lock` prevents corruption, just wastefully.

Target policy is one ship globally at any time.

### Gap 2: Cross-surface same-FID is not enforced

A `/bkit-debug` dispatched for FID 363 (concurrency group `bkit-auto-363` via `workflow_dispatch`) does **not** collapse with a `/bkit-ship` dispatched from `feat/363-*` CI success (group `bkit-auto-feat/363-*`). Already called out at `bkit-cloud.yml:62-72`: GHA concurrency evaluates from trigger-payload context before any step runs, and the dispatch payload exposes only `{ISSUE}` while the `workflow_run` payload exposes `feat/{FID-with-slug}` — no expression-function combination normalises the two tokens.

Today this is arbitrated by the orchestrator's per-FID `.lock` file (`docs/plans/{YYYYMM}/logs/{FID}/.lock`) + stale-run guard (`bkit-auto.md:86-92`). Both sessions boot, one acquires the lock, the other hits the **Failure Path** with "lock held by …". Same shape as Gap 1: data-safe, runner-minute-wasteful, plus a spurious `bkit:failed` label on the loser.

Target policy is one workflow per FID at a time, across all surfaces.

## Requirements

1. **Ship-global**: at most one `/bkit-ship` dispatched by `bkit-cloud` runs at any time, across all FIDs. Second ship **queues**, does not cancel, does not boot-then-wait on `.dev.lock`.
2. **Same-FID cross-surface**: a dispatch (`/bkit-design`|`/bkit-plan`|`/bkit-build`|`/bkit-debug`) for FID N and a CI-triggered dispatch (`/bkit-ship`|`/bkit-debug`) for the same FID N cannot run concurrently. Second one queues or no-ops cleanly, does not boot-then-fail on the per-FID `.lock`.
3. **No regression** to today's enforced semantics: design/plan/build per-FID isolation (yes today); `feat/**` debug per-FID isolation (yes today); `dev` debug one-at-a-time (yes today via collapse, but `cancel-in-progress: true` must change to queue per #363).
4. **No data-surface change**: the in-workflow `.dev.lock` and per-FID `.lock` remain as belt-and-braces; the GHA-level concurrency becomes the primary gate, the locks become the corruption-backstop (not the serialiser).
5. **Observability**: a queued/cancelled run is visible in the GHA Actions UI with a reason; the orchestrator should not see "lock held" as a routine path.

## Suggested solution (for the design pass to validate)

### Gap 1 — ship-global

Phase-aware group expression:

```yaml
concurrency:
  group: >-
    ${{ (inputs.phase == 'ship' || github.event.workflow_run.conclusion == 'success')
        && 'bkit-ship-global'
        || format('bkit-auto-{0}', inputs.issue || github.event.workflow_run.head_branch) }}
  cancel-in-progress: false
```

- Ship dispatches (manual or CI success on `feat/**`) collapse to `bkit-ship-global`; second ship queues.
- Debug/design/plan/build keep today's per-FID `bkit-auto-{…}` isolation.
- `cancel-in-progress: false` everywhere — queue, don't cancel. Matches the "wait your turn" semantic.

Caveat for design to resolve: a CI-success ship and a manual ship dispatch for the same FID would both route to `bkit-ship-global` — that's correct (one ship at a time globally, including same-FID), but means the second always queues even if it's the "right" one. Acceptable per the target policy.

### Gap 2 — cross-surface same-FID

GHA expression functions cannot normalise `{ISSUE}` (numeric, e.g. `363`) and `feat/{FID-with-slug}` (e.g. `feat/363-route-post-merge`) into one token (already analysed at `bkit-cloud.yml:62-72`). Two paths for design to choose:

- **(a) Accept + document.** Rely on the orchestrator's per-FID `.lock` + stale-run guard as the cross-surface arbiter. Document that "two sessions boot, one acquires, one Failure-Paths with `bkit:failed`" is the rare-path cost of GHA's concurrency-evaluation timing. Add an orchestrator-side early-exit (detect lock held before invoking the skill → emit a `bkit:queued` comment, no `bkit:failed` label, exit 0) so the loser doesn't look like a failure. Smallest diff.
- **(b) External state.** A pre-job that recovers the FID from either payload and writes/reads a sentinel (GitHub Actions cache, a `bkit-cloud-locks` branch ref, etc.) to enforce same-FID exclusion. Heavier; introduces a new state surface.

Recommend **(a)** unless the boot-then-fail rate proves noisy in practice.

## Interaction with #363

#363's dev-debug "one at a time, queue not cancel" is the same `cancel-in-progress: false` flip this issue needs for ship-global. Land them together or land #363 first with `cancel-in-progress: false` only on the dev-triggered branch and this issue generalises it.

## Best next step

1. **Defer until #363 lands** (or land concurrently if the design pass finds the `cancel-in-progress` flip is the single shared change). #363 is narrower and already in flight; this issue is the broader model.
2. `/bkit-design` to validate the phase-aware group expression (especially the CI-success-vs-manual-ship collapse in Gap 1's solution) and choose between (a) and (b) for Gap 2.
3. `/bkit-plan` → `/bkit-build`.
4. Acceptance: ship two PRs to green CI simultaneously and observe the second queue (not boot-then-wait, not cancel); dispatch `/bkit-debug` for an in-flight FID and observe queue/no-op (not boot-then-fail with `bkit:failed`).

## Relationships

- **#363** — narrower dev-debug concurrency question; shares the `cancel-in-progress: false` flip.
- **#324** — self-healing audit loop; will rely on the concurrency model this issue settles.
- **#260** — milestone orchestrator; same multi-FID concurrency substrate.
- **#59** — original auto-router design; concurrency group expression dates from here.

### Comments

None.
