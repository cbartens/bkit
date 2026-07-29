# Design Brainstorm & Ideas

Lens: Pragmatic — existing code, minimal new infra, ship fastest.

## Grounding — verified vs inferred

**Verified against the files in this worktree:**

- `.github/workflows/bkit-cloud.yml:58-74` — group `bkit-auto-${{ inputs.issue || github.event.workflow_run.head_branch }}`, `cancel-in-progress: true`. Byte-identical in `.bkit/templates/.github/workflows/bkit-cloud.yml:58-74` (the shipped source; the repo copy is the render). Any change is a two-file change.
- The "cross-surface collapse is not achievable by expression" comment is real (`bkit-cloud.yml:62-72`) and its reasoning holds: GHA has no regex/split/replace-to-numeric.
- Both jobs duplicate the whole ctx step verbatim, incl. the `bkit:start shared-deriv` / `bkit:start auto-route-gate` marker blocks (`run` job: 89-96, 190-214; `opencode` job: 254-261, 325-344). ~55 duplicated lines of FID/ISSUE derivation already exist.
- Both jobs carry `permissions: actions: read` (lines 103, 268) — **read, not write**.
- **The issue's premise about the locks is wrong for the cloud surface.** `.gitignore:48` ignores `docs/plans/*/logs/**/.lock` and `.gitignore:51` ignores `.bkit/.dev.lock`. Both are runner-local files in a fresh per-run checkout, never committed, never pushed. Two cloud runs on two runners **cannot see each other's locks**. So: (a) Gap 1's "they serialise via the in-workflow `.dev.lock`, just wastefully" is false in cloud — two cloud ships run genuinely in parallel to the merge, and the only real backstop is GitHub's atomic squash-merge plus `--match-head-commit` (`bkit-ship.md:33`); (b) Gap 2's "one acquires the lock, the other Failure-Paths with `bkit:failed`" is false in cloud — neither sees the other, both proceed. The failure mode is worse and quieter than the issue describes, and requirement 4 ("locks stay as the corruption-backstop") is not satisfiable in cloud by locks at all. **This raises the stakes on Gap 2 option (a) "accept + document": there is nothing to accept it onto.**
- Line refs in the issue: `bkit-ship.md:27` (Locks bullet) ✅; the 600s `.dev.lock` deadline is at `bkit-ship.md:874` and `:1165` (Failure Path uses 60s at `:84`) ✅; **`bkit-auto.md:86-92` is wrong** — that is PR/RUN_ID resolution. `bkit-auto.md` has no lock and no stale-run guard at all; the per-FID lock + stale guard live in `bkit-ship.md:206-227`.
- Existing tests block a naive fix: `.bkit/src/bkit-modules.integration.test.ts:1084-1130` (T3.1) finds the **single line** containing `group: bkit-auto-` and asserts it contains both `inputs.issue` and `head_branch` and no `replace(`. A folded `>-` multi-line group expression makes `groupLine` `undefined` → three tests fail. Any approach here rewrites T3.1.
- `.bkit/src/bkit-postinstall.ts:380-386` ships a consumer advisory that rewrites the `auto-route-gate` `if:` block, and `:539-543` a ci.yml concurrency advisory. Advisory text is a downstream surface of any shape change.
- Post-#363 baseline is real and near: `docs/plans/202607/363-widen-bkit-cloud-trigger-plan.md:297-317` — `branches: ['feat/**','fix/**','dev']` (`main` deferred, Task 14) and `cancel-in-progress: ${{ github.event.workflow_run.head_branch != 'dev' }}`. Design on that baseline, not today's dev.
- The queue-depth rule is already repo doctrine, review-corrected: same plan `:53`, `:317`, `:905` — "GHA queues **one** pending; older pendings are cancelled as newer arrive."

**Inferred (needs a spike before it becomes plan-load-bearing):**

- `needs.*` is available in `jobs.<id>.concurrency` (GitHub's context-availability table). Load-bearing for Approach B — verify in a scratch repo first.
- Concurrency groups are repository-scoped, so two workflow files can share one group name.
- For a `workflow_run`-triggered run, the Actions runs API reports `head_branch` = the triggering run's branch.
- `gh workflow run` needs `actions: write`; today's block grants `actions: read`, so any re-dispatch approach needs a permissions bump. (Adjacent, out of lens: `bkit-ship.md:545` runs `gh workflow run ci.yml` — under the cloud token that is a 403 today. Not this issue's remit; worth a `docs/failures.jsonl` row.)

**Cross-cutting constraint every approach inherits:** GHA queueing is depth-1. Three green `feat/**` PRs → ship A runs, ship B pends, ship C arrives and **silently cancels pending B**. B's PR is green, merge-ready, and never ships, with a bare "Cancelled" in the UI. Requirement 1 ("second ship queues") is satisfiable; "third ship queues" is not, by any pure-`concurrency` design. Every approach below needs an explicit answer (re-dispatch on cancel, a baton hand-off from the finishing ship, or an accepted-and-documented hole).

---

## Approach A — Phase-aware group + peer-run arbitration in the ctx step ⭐ Recommended

**Summary.** Two independent moves on the post-#363 file: (1) Gap 1 by a phase-aware workflow-level group expression that routes ship dispatches into a literal `bkit-ship-global`; (2) Gap 2 by teaching the existing ctx step to ask the Actions API "is another `bkit-cloud` run already in progress for my FID?" and yield deterministically — no new state surface, no lock that cannot cross a runner.

Shape:

```yaml
concurrency:
  group: >-
    ${{ (inputs.phase == 'ship'
         || (github.event.workflow_run.conclusion == 'success'
             && (startsWith(github.event.workflow_run.head_branch, 'feat/')
                 || startsWith(github.event.workflow_run.head_branch, 'fix/'))))
        && 'bkit-ship-global'
        || format('bkit-auto-{0}', inputs.issue || github.event.workflow_run.head_branch) }}
  cancel-in-progress: >-
    ${{ !(inputs.phase == 'ship' || (github.event.workflow_run.conclusion == 'success' && (startsWith(...) || startsWith(...))))
        && github.event.workflow_run.head_branch != 'dev' }}
```

The ship discriminator is `success AND head_branch startsWith feat/|fix/` — **not** `conclusion == 'success'` alone as the issue proposes, because post-#363 a green `dev` is a no-op, not a ship (`related-issues.md:86` flags this; confirmed against the #363 plan). `startsWith()` exists in GHA, so this is expressible. `&&`/`||` return operand values, so the ternary idiom is valid, but the ship condition must be parenthesised as one group — `&&` binds tighter than `||`.

Gap 2 (the ctx step, once, in the hoisted/duplicated shared-deriv block): after FID is canonicalised, `gh api /repos/{owner}/{repo}/actions/workflows/bkit-cloud.yml/runs?status=in_progress`, extract each peer's FID from `head_branch` + `display_title` (the `run-name` at `bkit-cloud.yml:53-56` already renders `bkit auto ship(363)` / `bkit auto feat(363-slug): …`), and if a peer with the same FID and a **lower run id** exists → `::notice::` + `skip=true` + exit 0. Lowest-id-wins is a deterministic tiebreak, so simultaneous checks can never both-yield (deadlock) or both-proceed. `actions: read` already covers the query.

- **Complexity:** MEDIUM. Two gnarly expressions (the ship condition is duplicated between `group` and `cancel-in-progress`) plus ~15 lines of bash duplicated into both jobs. Rewrites T3.1.
- **Extensibility:** Fair. #324's audit dispatches and #260's milestone ticks become "another dispatch with a FID", which the peer check handles for free; but each new _policy_ (e.g. "audit runs never collide with ship") means editing the expression again. The policy stays encoded in YAML expressions, which is exactly what `related-issues.md:67` warns will not scale.
- **Risk:** The ship condition drifts out of sync between `group` and `cancel-in-progress` (silent — a wrong `cancel-in-progress` cancels a mid-merge ship). Secondary: `display_title` parsing is brittle if a PR title breaks the `type(scope):` convention; mitigate by preferring `head_branch` and treating an unparseable peer as "no collision" (fail-open, preserving today's behaviour).
- **Maintenance:** Low-moderate. One file (plus template), no new state, nothing to garbage-collect. The bash lands in the already-duplicated ctx block, so it is 2× copies to keep in sync — the existing `shared-deriv` markers already signal that debt.
- **Reuse vs new:** Almost all reuse — existing group expression, existing ctx step, existing `actions: read`, existing `run-name`. Net-new: one API call + tiebreak.

---

## Approach B — Hoist shared-deriv into a `prep` job; job-level concurrency on its outputs

**Summary.** Split the ctx logic out of both agent jobs into one `prep` job that canonicalises `phase` / `issue` / `fid` / `arg` / `skip` in **shell** (where regex exists, so `feat/363-slug` → `363` is trivial), then gate the heavy jobs with `concurrency: group: ${{ needs.prep.outputs.lockgroup }}`, `cancel-in-progress: false`, where `lockgroup` = `bkit-ship-global` for ship and `bkit-fid-{ISSUE}` otherwise. Both gaps collapse into one mechanism, enforced by GHA rather than by an advisory bash check, and the ~55 lines duplicated between the two agent jobs disappear.

- **Complexity:** MEDIUM-HIGH. Restructures the job graph, moves the `shared-deriv` and `auto-route-gate` marker blocks, adds outputs plumbing, and requires the checkout+`gh` setup in a third job (~20-30s and a fresh checkout per run, cheap but not free).
- **Extensibility:** Best of the three for policy growth — the lock key is computed in bash, so "ship is global", "audit shares the FID lane", "milestone ticks are capacity-1" are all one-line shell edits in one place. This is the "expressible as a policy, not an ad-hoc expression" property #260 asks for (`related-issues.md:67`).
- **Risk:** Two, both sharp. (1) **`needs` in `jobs.<id>.concurrency` is inferred, not verified** — if unavailable the whole approach evaporates; spike it first. (2) **The dual-agent hazard is new:** the `claude` and `opencode` jobs are additive by design (both run when both secrets are set). Put them in the same group and one pends behind the other; then any _new_ run's queued job silently cancels the pending `opencode` job. Fix by suffixing the group per job (`…-claude` / `…-opencode`), which makes "ship-global" global per agent lane rather than truly global — a semantic the design must state explicitly. This hazard does not exist at workflow level (both jobs are one run).
- **Maintenance:** Moderate. Fewer duplicated lines than today (a genuine win), but a job graph readers must hold in their head, and a shape that diverges from `ci.yml`'s conventions.
- **Reuse vs new:** High reuse of the _logic_ (the shared-deriv bash moves, unchanged) with a net-new job and a new dependency on an unverified GHA capability.

---

## Approach C — Router / executor split (`bkit-cloud.yml` dispatches `bkit-cloud-run.yml`)

**Summary.** `bkit-cloud.yml` keeps both trigger surfaces but becomes a light router: no agent, just checkout + the existing ctx logic, ending in `gh workflow run bkit-cloud-run.yml -f phase=… -f fid=… -f arg=…`. The new `bkit-cloud-run.yml` carries the two agent jobs and — because it has exactly **one** trigger surface with **one** payload shape — a trivially normalised group: `${{ inputs.phase == 'ship' && 'bkit-ship-global' || format('bkit-fid-{0}', inputs.fid) }}`, `cancel-in-progress: false`. Gap 2 stops existing (there is no second token shape to reconcile), Gap 1 is a literal string, and the queued executor run is plainly visible as a queued run in the UI (requirement 5).

- **Complexity:** HIGH. New shipped workflow file, `bkit install` manifest + template + render tests, the `permissions` bump to `actions: write`, docs (`.bkit/cloud.md` routing table + `docs/deployments.md`), and a hard collision with #363, which is at `bkit:build` and edits exactly these lines.
- **Extensibility:** Highest. One executor surface is the natural dispatch primitive #260 and #324 both want to consume; adding a producer means adding a caller, not editing a concurrency expression. Also the only shape where an operator-visible "queued because X is shipping" is honest.
- **Risk:** Two-hop latency and a doubled run count in the Actions UI (noisier, more minutes on the router). A dropped/403 re-dispatch is a silent no-op for the whole phase — strictly worse than today's failure mode, so the router needs its own dispatch-verify. Also GITHUB_TOKEN dispatch semantics need confirming under the consumer's default `GITHUB_TOKEN` permission setting (some repos default to read-only).
- **Maintenance:** Highest ongoing cost — two files to keep in lockstep, two templates, two advisories, and consumer upgrade churn for a change consumers cannot see the benefit of.
- **Reuse vs new:** Mostly net-new infra for a problem two smaller changes can cover. YAGNI says defer until #260/#324 actually need a shared dispatcher — then this is the right shape and this issue's expression work becomes the thing it replaces.

---

## Decisions

| Decided                                                                                                      | Alternatives                                                             | Why                                                                                                                                                                                                                                                     |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Approach A (phase-aware group + ctx peer arbitration)                                                        | B (prep job), C (router/executor)                                        | Smallest diff on the file #363 is already editing; no unverified GHA capability; no new state surface; both gaps answered.                                                                                                                              |
| Ship discriminator = `success && startsWith(head_branch,'feat/'\|'fix/')`, **not** `conclusion == 'success'` | Issue's proposed `conclusion == 'success'`                               | Post-#363 a green `dev`/`main` is a no-op, not a ship; the issue's expression would park dev-CI runs in the ship queue. Confirmed against the #363 plan.                                                                                                |
| Gap 2 solved by peer-run arbitration in ctx, **not** by "accept + rely on the per-FID `.lock`"               | Issue's option (a) accept+document; option (b) cache/branch-ref sentinel | Both `.lock` files are gitignored, runner-local, and invisible across runs — option (a) leans on an arbiter that does not exist in cloud. Peer arbitration adds no state surface, so option (b)'s cost is avoided too.                                  |
| Deterministic lowest-run-id tiebreak for peer arbitration                                                    | First-writer-wins sentinel; both-yield-then-retry                        | Removes the both-yield deadlock and both-proceed race without any shared write; each run reaches the same verdict from the same read.                                                                                                                   |
| Loser exits 0 with `::notice::` + a tracker comment; never `bkit:failed`                                     | Leave today's Failure Path                                               | Requirement 5; and the loser is a routine outcome, not a failure. Only reachable because the loser boots the ~20s ctx step — a GHA-cancelled pending run can never speak, which is the price of pure-`concurrency` designs.                             |
| Queue-depth-1 hole gets an explicit, named answer in the design doc                                          | Silent acceptance                                                        | A cancelled _pending_ ship leaves a green merge-ready PR unshipped with no signal. Candidates: baton hand-off (finishing ship re-dispatches the next green `bkit:auto` PR), a scheduled sweeper, or documented-and-accepted with a `bkit:queued` label. |
| Baseline = post-#363 `bkit-cloud.yml`; land after #363, not concurrently                                     | Land together; land first                                                | #363 is at `bkit:build` on the same 4 lines; rebasing this onto it is far cheaper than the reverse. The `cancel-in-progress` flip is genuinely shared, so this issue generalises #363's expression rather than duplicating it.                          |
| T3.1 (`bkit-modules.integration.test.ts:1084-1130`) is rewritten as part of the change, not patched around   | Keep the single-line `group:` shape to satisfy the test                  | The test encodes the old single-line assumption as an expectation; a folded expression is correct and the test must follow. Assert rendered semantics (parsed YAML), not line-shape.                                                                    |
| Approach C is recorded as the deferred target shape                                                          | Build it now                                                             | It is the right primitive once #260/#324 have two more dispatch producers; building it now is net-new infra for a two-expression problem.                                                                                                               |
