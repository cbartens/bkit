# Related Issues — 397-cloud-concurrency-arbitration

Query: `concurrency ship dispatch workflow lock in:title,body` (sort updated desc, perPage 15). 3 hits; self (#397) dropped → 2 hits. #363 added manually: it is named as the direct in-flight dependency in the issue body and shares the `cancel-in-progress` flip.

---

## #59 — Auto-route build PRs to ship/debug after CI (closed, completed)

The origin of the `bkit-cloud` concurrency group expression. Original design (as `bkit-ci-router.yml`):

```yaml
concurrency:
  group: bkit-ci-router-${{ github.event.workflow_run.head_branch }}
  cancel-in-progress: true
```

Success criteria included, verbatim:

> When a newer CI completion arrives mid-router run, the newer run supersedes (`cancel-in-progress: true`). Ship squash-merge is GitHub-atomic, so mid-cancel during ship cannot corrupt PR state.

Open question 2 from #59, verbatim:

> **Concurrency on ship** — `cancel-in-progress: true` is safe because squash-merge is GitHub-atomic (no partial-state window). If concerns arise post-ship, consider per-stage concurrency groups.

**Relevance to #397:** #59 explicitly reasoned that `cancel-in-progress: true` was safe _for ship_ on atomicity grounds, and explicitly parked "per-stage concurrency groups" as the escalation path. #397 requirement 3 now flips that to queue-not-cancel. The design must reconcile: is #59's atomicity argument still the reason cancellation was safe, and what changes when we stop cancelling (a cancelled-mid-ship run left no partial state; a _queued_ run may act on a `dev` that moved under it)? #59's parked "per-stage concurrency groups" is close to the phase-aware group expression #397 proposes.

The `bkit-ci-router.yml` of #59 has since been superseded by `bkit-cloud.yml` (#119 + #245), which carries the same group expression keyed on `inputs.issue || head_branch`. #59's 22 comments are implementation-cycle logs from the closed May cycle and carry no further concurrency-model content.

---

## #260 — Milestone Orchestrator autonomous PM loop that drives workstreams (open)

Body excerpt — Concurrency / shared-state hazards, verbatim:

> Two bkit workflows on one clone collide (shared `dev` + working tree + `.git/config`). MVP = **capacity 1 / serial** (+ the single-flight lock from R1). Parallel requires worktree isolation per workstream **and** conflict-aware frontier selection (never co-schedule two issues touching the same shared surface). Deferred.

Body excerpt — Reliability (R1), verbatim:

> The dual-write problem (we dispatch _and_ journal) and overlapping tick invocations are the #1 functional risk. Required:
>
> - **Idempotency keys on dispatch** — an event-tick and a heartbeat-tick must not double-launch the same workstream.
> - **Single-flight lock / leader election** — only one tick mutates state at a time (capacity=1 does **not** prevent two overlapping _invocations of the loop_).
> - **Reconciliation** — a tick detects "journal says dispatched X but no `workflow_run` exists" → recovers. (Durable-execution / saga discipline — Temporal, Step Functions.)

Comment `4884305741` (2026-07-05), verbatim:

> ## Overlap noted from #324 — the after-ship audit trigger rides this same event substrate
>
> #324 (recurring self-healing audit loop) is adding an **after-ship / post-deploy trigger** that fires on the same post-merge / CI-concluded `workflow_run` signal this orchestrator ticks on. Full detail + overlap table on #324.
>
> Net: the **event-router + dispatcher** layer here is a shared primitive with two producers — milestone workstreams (this issue) and audit findings (#324) — plus shared idempotency/dedup-on-dispatch and worktree isolation. Worth designing the sense → dispatch seam once and letting both consume it. Not a closing dependency either way.

Comment `4703258377` (2026-06-14), verbatim:

> Issues that keep happening this orchestrators needs to help avoid
>
> - Crucial test missing, too much mocking, hence not build properly, releasing things that do not actually work
> - Reinventing the wheel, existing process not re-used but instead new similar process built so drift
> - Not cleaning up when something becomes obsolete
> - ???

Comment `4884267569` (2026-07-05), verbatim:

> Combine with https://github.com/cbartens/bkit/issues/324 ???

Remaining #260 comments (`4700140004` adversarial pre-flight addendum, `4700207189` best-practice addendum, `4700280363` closing-tasks, `4701145832` "see also #206/#207", `4724691125` roadmap auto-update) are decision-funnel / preference-learning material with no concurrency content.

**Relevance to #397:** #260 states the _desired_ concurrency substrate — capacity 1, single-flight lock, idempotent dispatch, reconciliation, worktree isolation as the precondition for capacity > 1. #397 is settling the GHA-level half of exactly that substrate. Two constraints #397's design must respect: (1) the concurrency model it lands becomes the primitive #260 and #324 both consume, so it should be expressible as a policy, not an ad-hoc expression; (2) #260 names the _dispatch idempotency_ problem (event-tick vs heartbeat-tick double-launch) which GHA `concurrency` alone does not solve — a queued duplicate is still a duplicate dispatch when it eventually runs.

---

## #363 — Route post-merge CI failure to /bkit-debug widen bkit-cloud trigger (open, `bkit:build`)

**In flight** — currently at `bkit:build`, plan revised 2026-07-29 (`f9ccd1da`, re-anchored on post-#384 dev). The original ship-verify block-contract design was **superseded** by a pivot comment (`5045381126`); the final approach is:

> reuse the trigger `bkit-cloud` already has. It routes on CI conclusion for the pre-merge feature branch (`workflow_run: [CI], branches: ['feat/**']` → success→ship, failure→debug); we simply **widen that filter to the post-merge branches** (`['feat/**', 'fix/**', 'dev', 'main']`) so a post-merge CI failure auto-launches `/bkit-debug`. **No `bkit-ship` edit, no ship-verify block, no `MERGE_SHA`, no preflight advisories, no renumber cascade.**

```
TODAY:  build → PR CI → auto → debug OR ship;  ship → merged(dev) → done (post-merge CI ignored)
FUTURE: build → PR CI → auto → debug OR ship;  ship → merged(dev) → dev CI  → auto → nothing OR debug
                                                     dev→main promo → main CI → auto → nothing OR debug
```

**Relevance to #397 — this is the sharpest coupling and the design must resolve it:**

1. #363 widens the `workflow_run` branch filter to include `dev` and `main`. That means `github.event.workflow_run.head_branch` can now be the literal `dev` or `main`, not just `feat/{FID}`. Today's group `bkit-auto-${{ inputs.issue || head_branch }}` then yields `bkit-auto-dev` — which happens to give dev-debug the "one at a time globally" collapse #397 requirement 3 credits it with, but **only as a side effect of the branch name**, and today with `cancel-in-progress: true` it _cancels_ rather than queues.
2. #397's proposed Gap 1 expression tests `github.event.workflow_run.conclusion == 'success'` as the ship discriminator. Post-#363 that is **no longer sound**: a _success_ on `dev` or `main` is not a ship, and under #363 a success on those branches routes to nothing. The expression would route a green `dev` CI run into `bkit-ship-global`, coupling dev-CI runs to the ship queue. The design must re-derive the ship discriminator from `(conclusion == 'success' AND head_branch matches feat/**)` or from the routed phase, not from conclusion alone.
3. The `cancel-in-progress: false` flip is genuinely shared between #363 and #397 — #363's dev-debug needs queue-not-cancel and #397's ship-global needs queue-not-cancel. Landing order matters: #363 is already at `bkit:build`, so #397 should assume post-#363 `bkit-cloud.yml` as its baseline, not today's dev.
4. #363's `fix/**` addition also widens the branch-name shape feeding the group key, which affects any string reasoning the group expression does.

**Consumer-owned, do not build into bkit** (from #363): `scripts/ci/vercel-deploy-status.sh`, the pre-merge "Await Vercel Deployment" CI gate, the out-of-band `health.yml` post-deploy gate.

---

## #324 — recurring self-healing audit loop (referenced, not a search hit)

Named in #397's Relationships as a downstream consumer of the concurrency model. Per #260 comment `4884305741`, #324 adds an after-ship / post-deploy trigger on the same `workflow_run` substrate, with its own dispatches. Any concurrency policy #397 lands must have a defined answer for a third producer of dispatches (audit findings) that is neither a phase dispatch nor a CI-success ship.
