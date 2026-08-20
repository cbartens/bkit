# Related Issues — #363

Query: `bkit-cloud workflow_run dev auto-route post-merge concurrency`

## #397 — bkit-cloud concurrency ship-global lock cross-surface FID arbitration (open)

Surfaced while scoping #363's dev-CD-failure auto-route. #363 makes the `bkit-cloud` concurrency model load-bearing for post-merge debug; reviewing it exposed two pre-existing gaps in the model that #363 doesn't introduce but should be addressed in their own cycle.

### Target concurrency model

<!-- prettier-ignore -->
| Phase | Cross-FID | Same-FID |
| --- | --- | --- |
| Design / Plan / Build | unlimited | one workflow at a time |
| Debug (`feat/**`) | unlimited (per-FID isolation) | one workflow at a time |
| Debug (`dev`, post-merge) | one at a time globally (queue, not cancel) | n/a — `dev` is the convergence point |
| Ship | **one at a time globally** | one workflow at a time |

Today's `bkit-cloud.yml:73` group expression `bkit-auto-${{ inputs.issue || github.event.workflow_run.head_branch }}` enforces some of this and contradicts the rest.

### Problem — two gaps

#### Gap 1: Ship is not global at the GHA level

Two green `feat/**` PRs landing within the CI window dispatch two `/bkit-ship` runs concurrently (different groups: `bkit-auto-feat/{FID-A}` vs `bkit-auto-feat/{FID-B}`). Both boot, both attempt merge — they serialise via the in-workflow `.dev.lock` and the per-FID lock, but both sessions burn runner minutes while one waits. Target policy is one ship globally at any time.

#### Gap 2: Cross-surface same-FID is not enforced

A `/bkit-debug` dispatched for FID 363 (concurrency group `bkit-auto-363` via `workflow_dispatch`) does **not** collapse with a `/bkit-ship` dispatched from `feat/363-*` CI success (group `bkit-auto-feat/363-*`). GHA concurrency evaluates from trigger-payload context before any step runs, and the dispatch payload exposes only `{ISSUE}` while the `workflow_run` payload exposes `feat/{FID-with-slug}` — no expression-function combination normalises the two tokens. Today this is arbitrated by the orchestrator's per-FID `.lock` file + stale-run guard. Both sessions boot, one acquires the lock, the other hits the **Failure Path** with "lock held by …". Target policy is one workflow per FID at a time, across all surfaces.

### Requirements

1. **Ship-global**: at most one `/bkit-ship` dispatched by `bkit-cloud` runs at any time, across all FIDs. Second ship **queues**, does not cancel, does not boot-then-wait on `.dev.lock`.
2. **Same-FID cross-surface**: a dispatch for FID N and a CI-triggered dispatch for the same FID N cannot run concurrently. Second one queues or no-ops cleanly.
3. **No regression** to today's enforced semantics: design/plan/build per-FID isolation; `feat/**` debug per-FID isolation; `dev` debug one-at-a-time (today via collapse, but `cancel-in-progress: true` must change to queue per #363).
4. **No data-surface change**: the in-workflow `.dev.lock` and per-FID `.lock` remain as belt-and-braces; the GHA-level concurrency becomes the primary gate, the locks become the corruption-backstop.
5. **Observability**: a queued/cancelled run is visible in the GHA Actions UI with a reason; the orchestrator should not see "lock held" as a routine path.

### Interaction with #363

#363's dev-debug "one at a time, queue not cancel" is the same `cancel-in-progress: false` flip this issue needs for ship-global. Land them together or land #363 first with `cancel-in-progress: false` only on the dev-triggered branch and this issue generalises it.

### Best next step

1. Defer until #363 lands (or land concurrently if the design pass finds the `cancel-in-progress` flip is the single shared change).
2. `/bkit-design` → `/bkit-plan` → `/bkit-build`.

### Relationships

- **#363** — narrower dev-debug concurrency question; shares the `cancel-in-progress: false` flip.
- **#324** — self-healing audit loop; will rely on the concurrency model this issue settles.
- **#260** — milestone orchestrator; same multi-FID concurrency substrate.
- **#59** — original auto-router design; concurrency group expression dates from here.

### Comments

None.
