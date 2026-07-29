# Design Brainstorm & Ideas — Ideate 2 (Orchestrator / Lock-File Lens)

Lens: Optimal-tradeoff — best long-term shape ignoring legacy constraints, viewed from what
the per-FID `.lock`, `.dev.lock`, stale-run guard, and `bkit-auto` phase router actually do
today (verified against source, not the issue body's own line citations).

## Grounding — verified vs inferred

**Verified by reading source (not trusted from the issue body):**

- `docs/plans/*/logs/**/.lock` is **gitignored** (`.bkit/templates/gitignore:40`) — it is
  never committed or pushed. `.bkit/.dev.lock` is likewise gitignored (line 43).
- Lock acquire/cross-check logic (`docs/plans/{YYYYMM}/logs/{FID}/.lock`, 30-min-idle stale
  rule, `.dev.lock` 600s-deadline `set -C` loop) lives **independently inside each phase
  workflow** — `bkit-ship.md:27,77-100,873-900`, `bkit-debug.md:27,63-67,130-134`, and the
  identical `Locks:` boilerplate line in `bkit-design.md` / `bkit-plan.md` / `bkit-build.md`.
  It is copy-pasted 5x, not centralised in a shared script.
- **`bkit-auto.md` (the orchestrator/router the issue calls out at "`bkit-auto.md:86-92`")
  has NO lock or stale-run-guard logic at all.** Read in full (192 lines): Step 1 is pure
  FID/PR/issue derivation, Step 2 is a bare `Skill` dispatch. Lines 86-92 are the branch-name
  FID-fallback derivation, unrelated to locking. **The issue's own citation is wrong** — the
  stale-run guard the issue describes lives in the _dispatched phase workflow_
  (e.g. `bkit-ship.md:27`), not the router. Correct this in the plan/build handoff.
- `bkit-runtime.sh:173-183` capability table: `RUNTIME=GITHUB_ACTION` (the case a
  `bkit-cloud.yml` job runs under — `GITHUB_ACTIONS=true`) resolves
  `RUNTIME_WORKTREES=true, RUNTIME_DEVPUSHES=true` — **same capability class as LOCAL**, not
  the reduced `CLOUD_CLAUDE` class. So the `.dev.lock` code path in `bkit-ship.md:873-900` is
  NOT skipped in `bkit-cloud.yml` runs (I initially assumed `RUNTIME_DEVPUSHES=false` there;
  that was wrong — corrected after reading the capability table).
- **However** — each `bkit-cloud.yml` job does a **fresh `actions/checkout@v4`** on a
  **fresh runner VM** (`bkit-cloud.yml:123-135` claude job, `:282-287` opencode job). Two
  concurrent `bkit-cloud.yml` runs (two different `workflow_run`/`workflow_dispatch` events)
  get two disjoint filesystems. `.dev.lock` and the per-FID `.lock` are plain files created
  with `set -C` inside that filesystem — **they cannot see each other across separate GHA
  runners.** This directly contradicts the issue's Gap 1 framing ("both attempt merge — they
  serialise via the in-workflow `.dev.lock` … and the per-FID lock, just wastefully"): across
  two GHA runners there is **no serialisation at all** from either lock file. Same for Gap 2's
  framing ("both sessions boot, one acquires the lock, the other Failure-Paths with 'lock
  held by …'") — that collision literally cannot happen cross-runner today; it can only
  happen when both sessions share one filesystem (LOCAL clone, or a persistent `CLOUD_CURSOR`
  VM — matches the existing "No concurrent bkit workflows on one clone" memory finding).
- What actually backstops two concurrent cross-runner ships today is **GitHub server-side
  atomicity**, not the file locks: `bkit-ship.md:678-683` merges with
  `gh pr merge --squash --delete-branch --match-head-commit "$GATE_HEAD"` — the server
  refuses if the PR head moved. A losing ship's Step 6 re-validate loop (`bkit-ship.md:676`,
  codes 11/14) routes it back to re-poll/re-gate, which is the "burn runner minutes" cost the
  issue names — real, just via a different mechanism than claimed.
- Concurrency-group evaluation timing (`bkit-cloud.yml:64-72`) — GHA evaluates
  **workflow-level** `concurrency:` from trigger-payload context before any step runs, so a
  workflow-level group genuinely cannot normalise `inputs.issue` (bare number) against
  `head_branch` (`feat/{FID}-slug}`) via expression functions alone. This part of the issue's
  analysis is correct and already well-argued in the file's own comment.
- `gh pr merge --match-head-commit` and the Step 6 re-validate loop already give ship a
  self-healing answer to "boot against stale `dev`/PR state" — a queued run that dequeues
  later re-derives `BRANCH`/`HEAD_SHA`/`PR_STATE` fresh at `bkit-auto.md` Step 1 and re-gates
  at merge time regardless of how it got scheduled.

**Inferred / not directly verified:** GHA's documented behaviour that **job-level**
`concurrency:` blocks (as opposed to workflow-level) can reference `needs.<job>.outputs` —
I did not find this in this repo's own files (there is no existing job-level concurrency
example here to confirm against); it is standard documented GHA behaviour, but flag it for
the plan phase to validate against GitHub's docs/a spike before committing to Approach A.

## Approach A — Resolver job + job-level concurrency groups ⭐ Recommended

A tiny pre-flight job (`resolve`, no `concurrency:` block, cheap: `gh pr view` / `gh issue
view` only, no full checkout) runs first and derives one canonical token regardless of
trigger surface — reusing the exact `shared-deriv` FID/ISSUE extraction already duplicated in
the `claude`/`opencode` jobs' `Resolve phase + brief context` step (`bkit-cloud.yml:190-214`,
`:325-344`). It outputs `group = phase == 'ship' && 'bkit-ship-global' ||
format('bkit-fid-{0}', FID)`. The `claude`/`opencode` jobs add `needs: resolve` and set
`concurrency: group: ${{ needs.resolve.outputs.group }}`, `cancel-in-progress: false`. Because
job-level concurrency evaluates after `resolve` completes (not at trigger time), the FID
normalisation the issue calls "impossible via expression" becomes possible — `resolve` did
real work (a `gh` API call) to produce it, not string manipulation.

- **Closes Gap 2 for real** at the GHA level (not "accept + document") — a `/bkit-debug`
  dispatch and the CI-triggered `/bkit-ship` for the same FID collapse into `bkit-fid-{FID}`
  regardless of the `inputs.issue`-vs-`head_branch` payload-shape mismatch.
- **Requirement 5 (observability) mostly comes for free**: a run that never gets past
  `resolve` sits in GHA's native "Queued" state, visible with the concurrency-group name as
  the reason — no custom tracker comment/label plumbing needed for the common case. The
  existing per-workflow `.lock` Failure Path becomes true defense-in-depth (only reachable if
  `resolve`'s derivation disagrees with the phase workflow's own derivation, or for the
  same-filesystem LOCAL/CLOUD_CURSOR race the file lock still legitimately covers).
- **Complexity:** MEDIUM — one new job, ~30 lines, duplicated once more (claude+opencode) or
  factored into a single shared `resolve` job both depend on (cleaner — do the latter).
- **Extensibility:** Good — #324 (audit-trigger dispatches) and #260 (milestone-orchestrator
  dispatches) are exactly the "third producer" #397's related-issues doc flags; both can
  reuse the same `resolve` job's FID-derivation contract instead of inventing their own.
- **Risk:** Main failure mode is `resolve` itself being wrong or slow (extra `gh` API round
  trip per run before the real job can even queue) — bounded, since it's the same lookups the
  jobs already do internally, just hoisted earlier. Second risk: unverified GHA behaviour
  (see Inferred note above) — must be spiked before planning commits to this shape.
- **Maintenance:** LOW-MEDIUM ongoing — one FID-derivation implementation instead of two
  (currently `claude` and `opencode` jobs each carry their own copy of `shared-deriv`,
  `bkit-cloud.yml:190-214` / `:325-344` — already a drift risk today, independent of #397).
- **Friction vs ideal:** Existing-codebase friction — the `shared-deriv` block is currently
  inlined per-job, not a callable unit; hoisting it into `resolve` means either (a) factoring
  it into a composite action / reusable step (touches both jobs, non-trivial diff) or
  (b) accepting one more duplicated copy in `resolve` itself (three copies, worse). Also
  touches the `.bkit/templates/.github/workflows/bkit-cloud.yml` mirror (must stay in lockstep
  with the root file per the render-sweep discipline already in place for this file).

## Approach B — Phase-aware workflow-level group expression (the issue's own suggestion)

Ship the design-input's proposed expression as-is: workflow-level `concurrency.group`
collapses ship dispatches (CI-success on `feat/**`, corrected per #363's relationship note to
`conclusion == 'success' && head_branch matches feat/**`, not conclusion alone) to
`bkit-ship-global`; everything else keeps `bkit-auto-{issue|head_branch}` per-FID isolation;
`cancel-in-progress: false` throughout. Gap 2 stays with today's orchestrator-side `.lock` +
stale-run-guard arbitration, per the issue's option (a) "accept + document."

- **Fully closes Gap 1** (ship-global) — no reservations, this part of the issue's proposal
  is sound and matches verified GHA workflow-level-evaluation semantics.
- **Does NOT close Gap 2** in the way the issue believes it does. Per the Grounding section
  above, on the actual `bkit-cloud.yml` cross-runner surface, the "lock held → Failure Path"
  collision this option relies on as the fallback arbiter **cannot occur** — two racing
  same-FID GHA runs today get two disjoint filesystems and neither sees the other's lock, so
  under Approach B, Gap 2 remains **genuinely unarbitrated** for the GHA surface (both
  sessions run to completion independently, corruption-risk bounded only by whatever the
  downstream git/tracker writes tolerate — status.jsonl is `merge=union` NDJSON so it's
  append-safe, but two concurrent debug/ship sessions mutating the same `feat/{FID}` branch is
  a real collision this leaves open). It only degrades to the issue's described "wasteful but
  safe" behaviour for LOCAL / `CLOUD_CURSOR` (shared filesystem) races, which is a narrower
  win than the issue's Requirement 2 asks for.
- **Complexity:** LOW — smallest diff, single expression change + a Requirement-5 early-exit
  patch to the 5 duplicated lock-check blocks (comment `bkit:queued`, exit 0, no
  `bkit:failed`) for the surviving same-filesystem race.
- **Extensibility:** Weak — Gap 2 stays an orchestrator convention every new dispatcher (#324,
  #260) must independently re-implement correctly (lock path, 30-min staleness window, comment
  semantics) rather than getting it for free from one GHA primitive.
- **Risk:** Silent under-delivery — ships green, acceptance-criteria "dispatch `/bkit-debug`
  for an in-flight FID and observe queue/no-op" would need to be tested from the SAME runner
  context to even exercise the arbitration path; a real two-separate-GHA-run test would show
  both booting, which is what Gap 2 set out to eliminate.
- **Maintenance:** MEDIUM — the 5-file duplicated lock-check block is now also the exit point
  serving Requirement 5's queued-not-failed comment/label semantics; every future workflow
  file (a 6th phase, say) needs the same patch applied by hand.
- **Friction vs ideal:** Smallest migration cost of the three approaches — one YAML expression
  change (mirrored to the template), plus small edits to already-duplicated lock blocks. But
  it ships a Gap-2 fix that doesn't fully hold under the conditions the issue's own acceptance
  criteria describe (separate CI-triggered vs dispatched sessions), which is a scope-honesty
  problem more than an implementation one — worth surfacing explicitly rather than silently
  landing.

## Approach C — External cross-runner lock primitive (a git-ref or label mutex)

Replace/augment the local file locks with a primitive that actually survives across separate
GHA runners: e.g. a compare-and-swap on a dedicated orphan ref
(`refs/bkit-locks/ship-global`, `refs/bkit-locks/fid-{FID}`) via `git push origin
<sha>:refs/bkit-locks/…` (fails atomically if the ref already exists — GitHub's ref-creation
is server-atomic) or an issue-label CAS (`gh issue edit --add-label bkit:locked:{FID}`,
tolerating the label-exists-already 422 as "lock held"). Stale-lock recovery mirrors today's
30-min-idle / 900s `.dev.lock` reap logic, but reading ref/label age instead of file mtime.
This is the issue's option (b), generalised to cover both Gap 1 and Gap 2 with one mechanism
instead of two GHA concurrency groups plus a file-lock fallback.

- **Fully closes both gaps for real**, including the cross-runner case Approach B cannot, and
  without depending on the unverified job-level-concurrency-with-needs-outputs GHA behaviour
  Approach A leans on.
- **Complexity:** HIGH — new state surface (a lock ref/label namespace), a genuinely new CAS
  protocol with its own edge cases (partial push failure, orphaned lock on a killed runner —
  no `trap EXIT` equivalent survives a hard-killed GHA VM the way it does for a local
  process), and it must be reconciled with the _existing_ file locks (do they become pure
  no-ops? Redundant belt-and-braces? The issue's Requirement 4 says locks "remain as
  belt-and-braces," which starts to strain if there are now two independent lock mechanisms.)
- **Extensibility:** Best in principle — a real distributed-lock primitive is exactly what
  #260's "single-flight lock / leader election" and #324's third-producer overlap need — but
  over-builds ahead of those issues actually landing (#260, #324 are both still open/design).
- **Risk:** Main failure mode is a leaked lock from a killed/timed-out runner with no
  guaranteed cleanup step (GHA `if: always()` steps can still be skipped on hard cancellation
  or infra failure) — worse blast radius than today's file lock (which is scoped to one
  ephemeral filesystem and vanishes with the VM; a pushed ref/label is durable and must be
  explicitly reaped).
- **Maintenance:** HIGH ongoing — a new mutex protocol to own, test, and reason about
  independent of GHA's own concurrency semantics; effectively rebuilding what workflow/job-
  level `concurrency:` already gives for free in Approaches A/B.
- **Friction vs ideal:** Largest diff surface — touches every phase workflow's lock-acquire
  block (5 files) to add the ref/label CAS alongside the existing file lock, plus new
  stale-reap logic, plus decides the "belt-and-braces" framing needs updating since there
  would now be two lock layers instead of one.

## Decisions

| Decided                                                                                                                                                                            | Alternatives                                                             | Why                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recommend Approach A (resolver job + job-level concurrency) over the issue's own Approach B suggestion                                                                             | Approach B as literally proposed in the design-input                     | Gap 2's "accept + document" fallback (today's per-FID `.lock`) is verified to be a no-op across separate GHA runners — it cannot arbitrate the exact same-FID cross-surface case the issue's acceptance criteria test. Approach A closes Gap 2 at the primitive that's actually shared (GHA's own queue), not at a file lock that provably isn't. |
| Flag the issue's `bkit-auto.md:86-92` citation as incorrect before planning                                                                                                        | Trusting the issue body's line reference                                 | Read in full: no lock logic exists in `bkit-auto.md`; the stale-run guard is in each dispatched phase workflow (`bkit-ship.md:27` etc). Plan phase should cite the correct 5 files.                                                                                                                                                               |
| Keep the ship-discriminator fix from #363's relationship note (`conclusion == 'success' AND head_branch matches feat/**`, not conclusion alone) regardless of which approach ships | Conclusion-alone discriminator as originally drafted in the design-input | #363 widens the `workflow_run` branch filter to `dev`/`main`; a bare `conclusion == 'success'` test would misroute a green `dev`/`main` CI run into the ship-global group. Verified via `related-issues.md`'s #363 analysis, not independently re-derived here.                                                                                   |
| Treat file locks (`.lock`, `.dev.lock`) as staying exactly as-is (Requirement 4, belt-and-braces) under Approach A                                                                 | Removing/rewriting the file locks                                        | They remain correct and load-bearing for the case they DO cover (LOCAL clone races, same-filesystem `CLOUD_CURSOR` sessions) — Approach A doesn't touch them, it adds a GHA-level primitive in front for the cross-runner case they never covered.                                                                                                |
| Do not pursue Approach C now                                                                                                                                                       | External CAS lock primitive                                              | Solves a real gap but over-builds ahead of #260/#324 (still open/design) actually needing a distributed single-flight lock; GHA's native concurrency (Approach A) is cheaper and sufficient for #397's stated scope. Revisit if #260's "single-flight lock / leader election" requirement lands first and wants to share a primitive.             |
