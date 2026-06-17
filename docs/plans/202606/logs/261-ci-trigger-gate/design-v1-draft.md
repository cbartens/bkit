# Design: CI-Dispatch Gate — outcome-based verification of the final loud push

## Related Issues

- #209 — Workflow state model: persistent `feat/{FID}`, NDJSON `status.jsonl` (`merge=union`), the "fire CI exactly once" build shape (`worktree-setup [skip ci]` → `summary` clean → `create-pr [skip ci]` buried → `close-workflow` clean) that this gate must not disturb (closed)
- #81 — Avoid regression fail `/bkit-ship` on skipped essential tests: Change C (fail on empty rollup at ship) is the downstream backstop this gate complements by catching suppressed HEADs earlier, at the final feat-branch push (closed)
- #184 — The shared HEAD-Subject Assertion this design augments into the "CI-Dispatch Gate" (typed-string clause + new outcome clause) (referenced)
- §141 / KN-30 — D2/D3 cloud auto-route concurrency design: the hard constraint ("fire CI exactly once, no mid-build auto-router") (referenced)
- #279 — squash-body `[skip ci]` leak (same suppression class, ship side; not fixed here) (referenced)
- KN-11 (`deployments.md`) — the `[skip ci]` HEAD → empty rollup → vacuously-green-PR symptom this gate closes (referenced)

## Acceptance Scenario

### Narrative

A developer runs `/bkit-build` (or `/bkit-debug`, or `/bkit-ship`) and the workflow finishes by opening or updating a PR. They expect bkit-tests to actually run against the HEAD the PR now points at — not to discover days later, at ship time, that the PR has been sitting green-but-untested because its HEAD carried a `[skip ci]` token. If the workflow aborts mid-run, they expect the PR to keep its last validated HEAD rather than be poisoned by a silent `[skip ci]` abort commit.

### Success Criteria

- After a build/debug/ship workflow completes its final loud push, CI is confirmed to have been **dispatched for the exact pushed HEAD** (at minimum a `bkit-decide` run) — or, when no run appears, the workflow self-heals once or terminates with a named, actionable verdict; no workflow ever finishes "green" on a PR whose HEAD has no dispatched run.
- The fix introduces **zero** additional mid-build CI triggers: still exactly one intended dispatch per workflow, and the gate's optional self-heal re-trigger lands at the same point in the commit graph the close-workflow commit already occupies (D2 preserved).
- On a consumer with no CI workflow for the event (bkit's own degenerate setup / a no-`ci`-module consumer), the gate concludes "no CI" and passes as a logged no-op — it never pages or fails a repo that legitimately has no CI.
- On abort, a branch with an open PR keeps its last remote HEAD; the workflow never pushes a `[skip ci]` HEAD onto a live PR.
- A build re-run/resume where `feat/{FID}` already has an open PR fails fast with a clear, named message instead of erroring inside `gh pr create` and falling through an undocumented retry.

### Key Edge Cases

- **Queue latency vs. true suppression** (the universal ambiguity): GitHub surfaces the dispatched run in `statusCheckRollup` asynchronously; a real-but-slow run must not be read as "suppressed" and trigger a wasted re-trigger + (on auto-route consumers) a second auto-router pass. Bounded poll + heal-only-on-empty-rollup + cap-1 bounds the blast radius.
- **Self-heal re-trigger itself suppressed**: a second skip token leaking onto the re-trigger commit must NOT collapse into the "no-CI" no-op (false all-clear); a suppressed re-trigger is `unresolved` (Failure Path), only a _clean_ re-trigger that dispatches nothing is `no-ci`.
- **Re-trigger lands as final HEAD on an auto-route consumer**: the re-trigger commit must carry the exact same `AUTO_ROUTE_SUFFIX` treatment as the close-workflow commit it replaces, or it drops (or double-fires) the cloud auto-route.
- **EC-1 → EC-2 chain** (the most common path to the symptom): a build re-run blind-`gh pr create`s on an existing PR → errors → retry fails → Failure Path → abort pushes a `[skip ci]` HEAD onto the live PR → CI suppressed. Both ends are closed (EC-1 pre-flight fail-fast; EC-2 abort-guard).
- **Ship composition with #81**: ship's gate must stay a hard fail-fast on empty/red rollup; adding self-heal at ship would mask the exact signal #81 Change C exists to surface. The two gates are layered backstops, not duplicates.
- **Interrupted build between create-pr (Step 17) and close-workflow push (Step 18)** (EC-3): not directly fixed, but the gate's self-heal recovers it without human intervention instead of leaving a silent suppressed HEAD.

## Architecture

This is an **authoring-only** change to bkit's workflow instruction files (`.bkit/workflows/*.md`) plus their rationale docs and rendered mirrors. There is no application code, no runtime service, no schema. The "components" are inline bash blocks the orchestrator executes during a workflow run, and the "boundaries" are the three loud-push sites plus the abort path.

### The defect being closed (root cause)

The shared **HEAD-Subject Assertion** (`.bkit/workflows.md:938`, #184) checks a string the orchestrator _just typed_ (`git log -1 --pretty=%B` on a commit clean by construction; at create-pr only the PR _title_). It never reads the real remote HEAD GitHub evaluates and never confirms a run was dispatched. So whenever the clean final commit does not end up as the dispatched HEAD, the PR sits on a `[skip ci]` HEAD with no CI and nothing notices (KN-11). The fix moves the gate from "what we typed" to "what GitHub did" — it polls the live dispatched-run signal for the pushed HEAD.

### Three integration points (the loud-push sites)

The gate is the **post-push twin** of the existing pre-push inline HEAD clause. It is inlined immediately after each final loud push, with the workflow/event-specific signal differing per site:

<!-- prettier-ignore -->
| Site | File / anchor | Signal probe | Notes |
| --- | --- | --- | --- |
| build close-workflow | `bkit-build.md:1166-1189` (Step 18) | `gh pr view {PR_NUMBER} --json statusCheckRollup` for a `bkit-decide` check | `PR_NUMBER` in scope from Step 17; `AUTO_ROUTE_SUFFIX` derived in-block at `:1168-1169` |
| debug create-pr / close-workflow | `bkit-debug.md:929-949` (Step 12 sub-9, LOCAL-mode trigger) **and** `:888-901` (Step 12 sub-3, PR-mode trigger) | `gh pr view {PR_NUMBER} --json statusCheckRollup` for a `bkit-decide` check | debug fires CI at create-pr (LOCAL) or close-workflow (PR); the gate goes at whichever sub-step is the actual trigger push. `AUTO_ROUTE_SUFFIX` sourced via `BKIT_AUTO_ROUTE_FILE` (`:876-878`, `:936-942`) |
| ship post-merge | `bkit-ship.md:941-955` (Step 13) | `gh run list --branch dev --commit "$PARENT_SHA"` (reuse the exact form already at `:929-930`) | **No self-heal** — ship stays hard fail-fast (see Decisions; #81 Change C backstop) |

### Abort-path integration (EC-2)

The EC-2 abort-guard is a conditional wrapped around the existing abort commit + push at **two** places that must stay byte-aligned:

- build inline Failure Path `bkit-build.md:95-96` (the build-specific abort: `docs({FID}): build aborted bkit [skip build] bkit [skip ci]` → force-with-lease push)
- shared Failure Path `bkit-build.md:506` / `.bkit/workflows.md` conditional-handover step (`{phase} aborted bkit [skip build] bkit [skip ci]` → push)

### Pre-flight integration (EC-1)

A read-only pre-flight at the **entry of build Step 17** (`bkit-build.md:1084`), before the blind `gh pr create` at `:1092`, using a `gh pr list --head … --base dev` probe (the exact form debug already uses at `:172` / `:910`).

### What does NOT change (D2 invariants preserved)

- The build commit shape stays `worktree-setup [skip ci]` → `summary` clean → `create-pr [skip ci]` buried → `close-workflow` clean. No intermediate commit becomes loud; no mid-build `synchronize` is introduced.
- The `[skip ci]` on `worktree-setup` / `create-pr` remains load-bearing.
- The gate fires **only** after the single final loud push; it observes, and at most adds one capped re-trigger commit at the same graph position the close-workflow commit already occupies.

## Data Model

No database schema. The only persisted state is an **additive field on the existing `step-done` NDJSON record** in `status.jsonl` (the #209 state model, `merge=union`-safe, append-only). The gate records its terminal verdict so on-call can read the outcome instead of reconstructing it from poll logs.

### `ciDispatch` verdict enum (new field on `step-done`)

Added to the `step-done` record emitted by `build-close-workflow`, the active debug trigger step (`debug-create-pr` in LOCAL-mode / `debug-close-workflow` in PR-mode), and `ship-close-workflow`:

<!-- prettier-ignore -->
| Value | Meaning | Operator action |
| --- | --- | --- |
| `dispatched` | A `bkit-decide` run appeared for the pushed HEAD within the poll budget | None — pass |
| `self-healed` | First poll empty + HEAD clean → one re-trigger pushed → run then appeared | None — pass (one extra empty commit on the branch) |
| `no-ci` | Re-trigger was clean (re-asserted) yet still dispatched nothing → repo has no CI workflow for this event | None — logged no-op |
| `unresolved` | Re-trigger errored, or re-trigger HEAD was itself suppressed, or budget exhausted with a dirty HEAD | Failure Path — page names HEAD SHA + the `gh workflow run ci.yml --ref feat/{FID}` recovery |

Shape (extends the existing `step-done` jq emission; example for build):

```json
{
  "type": "step-done",
  "workflow": "build",
  "step": "build-close-workflow",
  "status": "DONE",
  "at": "…",
  "parentSha": "…",
  "artifacts": [],
  "ciDispatch": "dispatched"
}
```

- `ciDispatch` is **optional and additive** — older readers (and the `FOLD` reducer in `bkit-build.md:131`) ignore unknown keys; it never breaks the existing fold.
- It is the only new state key. No new files, no new lock semantics, no new gate state beyond what `status.jsonl` already captures.
- **Ship**: `ship-close-workflow` records only `dispatched` or routes to Failure Path (no `self-healed` / `no-ci` at ship — ship does not self-heal).

## Components / Flows

Four changes, all instructions-only, inlined per site (no cross-reference to `workflows.md`), reusing the closest existing phrasing verbatim.

### 1. CI-Dispatch outcome gate (the D2-safe kernel) — a 4-outcome state machine

Inlined immediately **after** the final loud push at each of the three trigger sites. Conceptual shape (the plan phase produces the byte-exact bash; magic numbers become named symbols `POLL_BUDGET_S` / `POLL_INTERVAL_S` so a grep finds every copy across the 3 sites):

```
# After the loud push has landed PARENT_SHA as the remote HEAD:
POLL_INTERVAL_S=10 ; ATTEMPTS=6        # ~60s budget; bounds *dispatch surfacing*, NOT run completion
for attempt in 1..ATTEMPTS:
    probe the live signal for the pushed HEAD:
        build/debug → gh pr view {PR_NUMBER} --json statusCheckRollup  (look for a `bkit-decide` check)
        ship        → gh run list --branch dev --commit "$PARENT_SHA"   (look for a dispatched run)
    log "attempt N/6: rollup has K checks"          # queued-vs-suppressed must be reconstructable
    if a bkit-decide run is present → ciDispatch=dispatched ; PASS
    sleep POLL_INTERVAL_S
# Budget exhausted, no run seen:
re-run the inline HEAD clause on the current HEAD (%B grep of the suppressor set)
if HEAD is NOT clean → ciDispatch=unresolved → Failure Path     # a suppressor leaked; never self-heal a dirty HEAD
# HEAD clean → SELF-HEAL (cap = 1):
derive AUTO_ROUTE_SUFFIX exactly as the close-workflow commit did (same source — see change 4)
git commit --allow-empty -m "chore({FID}): re-trigger ci${AUTO_ROUTE_SUFFIX}"
re-assert the re-trigger HEAD is clean (%B grep)               # a *suppressed* re-trigger is unresolved, not no-ci
if re-trigger HEAD NOT clean → ciDispatch=unresolved → Failure Path
push (reuse the exact `case "$B" in dev|main) … esac` push idiom)
poll once more (same ATTEMPTS budget):
    if a bkit-decide run appears → ciDispatch=self-healed ; PASS
    else → ciDispatch=no-ci ; log "no CI workflow dispatched for this event" ; PASS (no-op)
```

**Outcome → record → action** (closed set, no fifth state):

- `dispatched` → record verdict, pass.
- `self-healed` → record verdict, pass (one extra empty commit; the cap-1 bounds blast radius).
- `no-ci` → record verdict, log, pass. This is the **discriminator-by-construction**: a _clean_ re-trigger that still dispatches nothing is the _only_ legitimate no-op. There is **no `PUSH_MODE` no-op branch** — `PUSH_MODE=LOCAL` still dispatches CI (it creates a PR, `bkit-debug.md:172`).
- `unresolved` → Failure Path with a self-describing page (HEAD SHA, last rollup state, re-trigger error / suppressed-HEAD reason, the `gh workflow run ci.yml --ref feat/{FID}` manual recovery already documented at `deployments.md:351`).

**Ship variant**: poll-only, **no self-heal** — an empty/red rollup after the budget is a hard Failure Path (this is #81 Change C's territory; ship records `dispatched` or fails, never `self-healed`/`no-ci`).

### 2. EC-2 abort-guard — never push a `[skip ci]` HEAD onto a live PR

At build `bkit-build.md:95-96` and the shared Failure Path `bkit-build.md:506` / `.bkit/workflows.md` conditional-handover step, wrap the abort commit + push in a PR-existence conditional (reuse debug's read-only `gh pr list --head "$B" --base dev --json number --jq '.[0].number'` probe):

- **If** an open PR exists for this head → write the abort artifact + status + issue-comment handover as today, but do **NOT** create/push a new `[skip ci]` HEAD onto the PR branch. Leave the last validated remote HEAD intact. (The issue-comment handover at `bkit-build.md:97-101` / shared `:507` remains the durable abort-context sink, so preserving HEAD costs no diagnosability.)
- **Else** (no open PR) → plain abort-commit + push, exactly as today.
- A failed `gh pr list` probe is treated as **"PR exists / be safe"** → skip the push (the _worse_ outcome here is pushing a suppressed HEAD onto a live PR, so the safe fallback is to NOT push). This inverts the gate's elsewhere-safe default deliberately, because the cost asymmetry is reversed on the abort path.

### 3. EC-1 pre-flight escalation — fail fast on an existing PR (placeholder for the deferred PUSH_MODE fix)

At the entry of build Step 17 (`bkit-build.md:1084`), before the blind `gh pr create` (`:1092`):

```
EXISTING_PR=$(gh pr list --head "$(git branch --show-current)" --base dev --json number --jq '.[0].number' 2>/dev/null || echo "")
if EXISTING_PR is non-empty:
    → Failure Path with a clear, named message:
      "Open PR #${EXISTING_PR} already exists for this branch — resume is not supported without the
       build/debug branch-PR alignment fix. Run /bkit-debug on the existing PR, or close it and re-run /bkit-build."
```

- This **surfaces** EC-1 as a fast, named Failure Path instead of the current blind `gh pr create` → error → retry → undocumented Failure Path. It does **not** close EC-1's underlying re-run idempotency.
- Marked with an explicit placeholder comment (`# TODO(#261-ec1): replace with full PUSH_MODE/EXISTING_PR detection — see Risks`) so the deferred D2-risky build/debug branch-PR alignment has a documented hook.
- A failed `gh pr list` probe → treat as "unknown, proceed" (`|| echo ""` then fall through to the existing blind create) — same as today, no regression; the outcome gate (change 1) is the backstop if the blind create lands a suppressed state.

### 4. Re-trigger marker treatment — same `AUTO_ROUTE_SUFFIX` as close-workflow

The self-heal re-trigger commit (change 1) lands as the **final HEAD**, so it must inherit the _exact_ marker treatment of the close-workflow commit it replaces:

- **build**: re-derive `AUTO_ROUTE_SUFFIX` in the gate's shell exactly as `bkit-build.md:1168-1169` does (`echo "${LABELS:-}" | grep -q 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]"`). Because the build gate runs in the same Step 18 block, `AUTO_ROUTE_SUFFIX` is already in scope — reuse it directly.
- **debug**: source it via the existing `BKIT_AUTO_ROUTE_FILE` mechanism (`bkit-debug.md:876-878` writes it; `:936-942` reads-and-removes it) so the re-trigger carries the same mode-correct suffix (`PR_MODE_AUTO_SUFFIX` in PR-mode, `LOCAL_MODE_AUTO_SUFFIX` in LOCAL-mode) the close-workflow/create-pr commit would have carried.
- The re-trigger MUST NOT introduce a fresh suppressor (it is `--allow-empty`, message is `chore({FID}): re-trigger ci${AUTO_ROUTE_SUFFIX}`), and the post-commit HEAD re-assertion (change 1) guarantees it.
- This resolves the issue's open question "does the re-trigger interact with the auto-route marker?" → **yes: same suffix, sourced the same way as close-workflow; never a fresh marker.** It also updates `.bkit/workflows.md` § `bkit [auto route]` Marker Propagation, which already names "the debug re-trigger commit" — the build gate's re-trigger must be added to that list.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Gate on the **dispatched-run outcome** (poll the live signal for the pushed HEAD), not a typed string | Keep the typed HEAD-Subject string check only | Root cause is "checks a string we typed, not what GitHub did" — only the live signal closes the blind spot (all 3 lenses agree) |
| Probe for a **`bkit-decide`** run specifically, not mere run existence | Poll any run; poll `bkit-tests`; poll by SHA only | `bkit-decide` is the entry job guaranteed to appear first; polling `bkit-tests` adds latency; any-run risks a false-positive from a manual dispatch |
| Gate fires **post-final-push only**, never at intermediate steps | Gate at create-pr; gate at every push | Mid-push gating re-introduces the D2 mid-build `synchronize` defect; intermediate `[skip ci]` commits are intentionally silent |
| **Four typed outcomes** (`dispatched` / `self-healed` / `no-ci` / `unresolved`) recorded as `ciDispatch` on the `step-done` record | Boolean pass/fail; reconstruct from logs | A closed, named outcome set is the difference between a 3am page that says "do X" and one that says "figure out what happened"; composes with #209 NDJSON, `merge=union`-safe |
| Self-heal = **1 capped** clean empty re-trigger, then re-poll; cap exhausted → Failure Path | 0 (no self-heal); unbounded retries | 0 = no recovery and loses the no-CI discriminator; unbounded = commit-graph noise + risk of repeated auto-router fan-out; cap-1 bounds waste to exactly one extra run |
| **Re-assert the re-trigger HEAD is clean before concluding `no-ci`** | Collapse `no-ci` and suppressed-re-trigger into one no-op | Without this, a *suppressed* re-trigger reads as "no CI" → false 3am all-clear → reopens #261 one layer down (Risk-premortem lens's highest-value safety add) |
| Self-heal only when rollup is **empty**, never on "incomplete/not-green"; budget bounds *dispatch surfacing*, not run completion | Larger budget; heal on any non-green; wait for `bkit-tests` to finish | Bounds queue-latency false-negatives; never waits for the run to *complete*, only to *appear* — heal-on-non-green would fire a wasteful (and on auto-route consumers, doubled-routing) second run on a real-but-slow run |
| Poll budget + interval as **named symbols** (`POLL_BUDGET_S` / `POLL_INTERVAL_S`), rationale documented in KN-11 | Bare `6` / `10s` literals inlined ×3 | Magic numbers across 3 byte-aligned sites drift silently; the invariant "budget > p99 dispatch-surfacing latency" must have a documented home or it converts queued→suppressed in 6 months |
| **No `PUSH_MODE` no-op** — the clean-re-trigger-dispatches-nothing probe is the *sole* no-CI discriminator | `PUSH_MODE=LOCAL` → no-op; statically parse `.github/workflows/*.yml` for trigger events | `LOCAL` still dispatches CI (`bkit-debug.md:172`); static YAML parse re-introduces "trust what we typed" (the #261 root cause) and violates the MCP-only workflow rule |
| Re-trigger commit carries the **same `AUTO_ROUTE_SUFFIX`** treatment (and sourcing) as close-workflow | Plain re-trigger (no marker); always-marker | Re-trigger lands as final HEAD; stripping drops cloud auto-route continuity, always-adding double-fires it — must mirror close-workflow exactly (resolves the issue's open question) |
| **EC-2**: on abort, if an open PR exists, do NOT push a new `[skip ci]` HEAD — leave the last validated HEAD | Always push the abort commit (status quo) | Pushing `[skip ci]` onto a live PR is the confirmed EC-2 failure; "don't fire CI on abort" is D2-aligned; closes the EC-1→EC-2 chain; issue-comment handover preserves context |
| **EC-1**: build Step-17 pre-flight `gh pr list` → fail fast with a clear message if a PR exists; explicit placeholder for the deferred PUSH_MODE fix | Fold full PUSH_MODE/EXISTING_PR detection into build now (Approach B/C); leave the blind create | Full alignment is D2-risky (mid-build `synchronize`); the issue flags it as "must be designed, not hand-edited"; fail-fast surfaces the gap cleanly and the gate is the backstop |
| **Ship gate: poll-only, NO self-heal**; ship's existing fail-on-empty-rollup stays a hard fail | Add self-heal at ship for symmetry with build/debug | Self-heal at ship masks the very signal #81 Change C exists to surface — a suppressed HEAD reaching ship is a real anomaly worth a human. The two gates are layered backstops, not duplicates |
| **Inline per-site** (3× gate + 2× abort-guard, byte-aligned), accept the lockstep-edit tax | Centralize as a generated/templated fragment | Honors the standing authoring doctrine (self-contained, no cross-refs to `workflows.md`); a fragment-include mechanism is forbidden new infra (YAGNI) and contradicts an approved constraint |
| Add a **grep-equality / render-sweep acceptance check** that the inlined gate stays byte-identical across the 3 sites | Trust manual alignment | The inline doctrine's standing risk is a fix applied to one copy not all; a grep check makes byte-alignment a verifiable acceptance criterion |
| Docs (`deployments.md` KN-11 + D2 record, `workflows.md` § rename) updated **in lockstep** with the workflow edits | Update docs separately / later | Authoring constraint requires lockstep; KN-11 must record the discriminator-by-construction invariant or the gate gets "simplified" into a regression |

## Approaches Considered

The three brainstorms converged on the same kernel (inline outcome-gate + EC-2 abort-guard) and diverged on (a) how much of the EC-1 chain to fix now, (b) whether to self-heal at all, and (c) how to inline. The selected design is the **Pragmatic/Structural Approach A kernel**, hardened with the **Risk-premortem state machine** (4 typed outcomes + re-trigger-clean re-assertion + named poll symbols), plus the **Structural Approach C conservative EC-1 pre-flight** for fail-fast UX.

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Inline outcome-gate as post-push twin of the existing assertion + EC-2 abort-guard (Pragmatic A / Structural A) | **KEPT** | Exactly the issue's D2-safe kernel; pure reuse of existing idioms; zero D2-risk surface; ships fastest. This is the spine of the design. |
| Outcome gate as an explicit **4-outcome state machine** with `ciDispatch` verdict, per-attempt poll logging, and a re-trigger-clean re-assertion before `no-ci` (Risk-premortem A) | **MERGED** (onto the kept kernel) | Risk-premortem mitigations are additive: they turn the kernel from "pass/fail" into a diagnosable, on-call-actionable state machine and close the false-all-clear hole. Layered on, not chosen against. |
| Conservative EC-1 **pre-flight fail-fast** (`gh pr list` → clear Failure Path, explicit placeholder) (Structural C) | **MERGED** (as change 3) | Surfaces EC-1 cleanly without taking on the D2-risky full PUSH_MODE alignment; better failure UX than the current blind-create chain; leaves a documented hook for the deferred fix. |
| Named poll symbols + KN-11 rationale home + grep-equality acceptance check (Risk-premortem A drift mitigation) | **MERGED** | Directly mitigates the inline-doctrine's lockstep-drift risk and the magic-number 6-months-later risk; cheap, additive. |
| Fold full PUSH_MODE/EXISTING_PR detection into build now, routing CI through the existing close-workflow push (Pragmatic B / Structural B / Risk-premortem C EC-1 leg) | **REJECTED** (deferred) | D2-risky: a mis-computed "already pushed" predicate re-opens the mid-build `synchronize` defect (§141/KN-30). The issue explicitly flags this as "must be designed, not hand-edited." Deferred behind the EC-1 placeholder; the gate is its backstop. |
| Make build's create-pr commit clean (EC-3 fix) | **REJECTED** (deferred) | Changes the documented D2 contract; the issue says "don't change in isolation." The gate's self-heal recovers EC-3-induced states without it. |
| **Verify-only gate, no self-heal**, with a static "does this repo have CI for this event?" probe (Risk-premortem B) | **REJECTED** | The static CI-presence probe re-introduces "trust what we typed, not what GitHub did" (the #261 root cause) and violates the MCP-only rule. Without self-heal there is no clean no-CI discriminator and the gate pages the fleet on queue latency. Its one good idea (suppression = loud signal) is preserved via the `unresolved` outcome. |
| Add self-heal to the **ship** gate for symmetry | **REJECTED** | Masks the exact signal #81 Change C surfaces; a suppressed HEAD reaching ship is a real anomaly. Ship stays poll-only hard-fail. |
| Centralize the gate as a generated/templated fragment (Pragmatic C) | **REJECTED** | Contradicts the hard authoring constraint (self-contained, no cross-refs, inline at each site); a fragment-include mechanism is forbidden new infra (YAGNI). Listed for completeness only. |

## Trade-offs Accepted

**What we gain:**

- The blind spot closes: CI is verified by the _live GitHub signal_ for the pushed HEAD, not by a string the orchestrator typed. The KN-11 vacuously-green-PR class is caught at the earliest point (final feat-branch push) instead of at ship.
- Self-recovery: a suppressed HEAD self-heals once without human intervention; only genuinely unrecoverable states page.
- A diagnosable, on-call-actionable terminal state on every workflow (`ciDispatch` verdict), composing cleanly with the #209 NDJSON model.
- The EC-1→EC-2 chain (the most common path to the symptom) is closed at both ends with zero D2-risk.

**What we sacrifice vs. alternatives:**

- **Latency**: every close-workflow now polls up to ~60s (and up to ~120s on the self-heal path) for dispatch to surface, on top of the existing push. On fast repos this collapses to 1–2 iterations; on slow webhook fanout it is the full budget. Accepted as the cost of outcome-based verification.
- **Cosmetic extra commit on self-heal**: a real-but-slow run mistaken for suppression triggers one wasted `--allow-empty` re-trigger (tree-state unchanged, cap-1). Accepted; the alternative (verify-only, no heal) pages the fleet on queue latency instead.
- **Lockstep-edit tax**: 3× byte-aligned gate copies + 2× abort-guard copies must be edited in lockstep on every future tuning (poll budget, cap, job name). This is the standing cost of bkit's inline-single-source doctrine, accepted over the forbidden templated-fragment alternative; mitigated by named symbols + a grep-equality acceptance check.
- **EC-1 not fully fixed**: build re-run on an existing PR still requires human intervention (now a clear fail-fast instead of a confusing one). The full build/debug branch-PR alignment is deferred as D2-risky.
- **EC-3 not fixed**: relies on the gate's self-heal to recover an interrupted build between Step 17 and Step 18 rather than making the create-pr commit clean.

## Risks & Open Questions

### Risks

- **Queue latency vs. true suppression (the universal ambiguity).** The poll budget is the single tuning knob that decides the false-positive rate. The invariant to encode and document in KN-11: _budget must exceed observed dispatch-surfacing p99, and must NOT wait for run completion_. If dispatch p99 ever creeps past the budget, a real-but-slow run reads as suppressed → wasted re-trigger (and, on auto-route consumers, a redundant auto-route event). Mitigations in the design: heal-only-on-empty (not non-green), cap-1, per-attempt poll logging for reconstructability.
- **Self-heal double-firing the auto-router.** On a `bkit:auto` consumer the re-trigger carries `bkit [auto route]`; a spurious re-trigger fires a second `bkit-decide` and a second auto-route dispatch. Bounded to exactly one extra run by cap-1; the empty-rollup discriminator keeps spurious triggers rare. (Cross-checking the D2/D3 stale-run guard in `bkit-cloud.yml` for behavior under two coexisting runs is noted below as an open question, not a blocker — the gate adds at most one run, same graph position as close-workflow.)
- **Inline-copy drift.** Three byte-aligned gate copies + two abort-guard copies; a fix to one and not the others is itself an operability risk. Mitigated by named poll symbols and a grep-equality acceptance check; not eliminated.
- **Magic-number drift (6 months later).** A maintainer bumping CI cold-start, or a consumer on a slower runner, silently converts "queued" into "suppressed." Mitigated by promoting the constants to named symbols with the derivation documented in KN-11 (the magic number gets a home).
- **`gh pr list` token-scope failures.** On the EC-1 pre-flight a failed probe falls through to today's blind create (no regression; gate is backstop). On the EC-2 abort-guard a failed probe is treated as "PR exists → do not push" (safe-by-cost-asymmetry). These two opposite fallbacks are intentional and must be called out so a future maintainer does not "normalize" them.
- **Bus factor / "simplification" regression.** The discriminator-by-construction (no `PUSH_MODE` no-op) and the re-trigger-clean-before-`no-ci` rule are non-obvious; a future maintainer could re-add a mode branch or collapse the no-CI/suppressed distinction and silently reopen #261. Mitigated by stating both invariants explicitly in the `deployments.md` D2 record and the renamed `workflows.md` § "CI-Dispatch Gate".

### Doc & render surface (required, in lockstep)

- `docs/deployments.md` — update KN-11 / § "CI trigger on final workflow push" to describe the outcome gate + discriminator + named poll budget; add/extend the D2 record with the discriminator-by-construction and re-trigger-clean invariants.
- `.bkit/workflows.md` — rename/expand § "HEAD-Subject Assertion" → § "CI-Dispatch Gate" covering both clauses (typed-string + outcome) as one contract; add the build gate's re-trigger to § "`bkit [auto route]` Marker Propagation".
- Re-render `.claude/` / `.cursor/` / `.opencode/` mirrors after the `.bkit/workflows/*.md` edits (batch at session end, per the no-per-edit-install rule — the orchestrator runs it, the plan notes it as a required final action; render output is truth, mirrors are force-overwritten).

### Open Questions (answered where the issue asked; flagged where they remain)

- **EC-1 idempotent re-run approach** → **answered**: pre-flight `gh pr list` fail-fast now; full PUSH_MODE/EXISTING_PR alignment deferred (D2-risky), with an explicit placeholder hook. Not closed in this change by design.
- **Re-trigger × auto-route marker interaction** → **answered**: the re-trigger carries the _same_ `AUTO_ROUTE_SUFFIX` treatment and sourcing as close-workflow (build: re-derive in-block from `LABELS`; debug: via `BKIT_AUTO_ROUTE_FILE`), never a fresh marker.
- **Ship `ship DONE [skip ci]` dev-HEAD batching** → **answered (confirmed safe)**: ship's post-merge `docs({FID}): ship DONE bkit [skip ci]` is the intentional status commit batched into the single Step-13 push to `dev`; `dev`'s CI already fired on the Step-6 squash merge, so this commit is correctly silent and never strands `dev`. The ship gate is poll-only and does not touch it.
- **Remaining (not blocking this design):** confirm the D2/D3 stale-run guard in `bkit-cloud.yml` tolerates the at-most-one extra self-heal run on a `bkit:auto` consumer (the gate's blast radius is one run at the close-workflow graph position; if the guard is confirmed weak, that is a separate `bkit-cloud.yml` hardening, not a change to this gate). Tune `POLL_BUDGET_S` against real dispatch-surfacing p99 once measurable (currently `gh`/REST 404 on the consumer orgs under the available token).

### Assumptions

- `bkit-decide` is the entry job that appears first in `statusCheckRollup` / `gh run list` for any dispatched run; if it is ever renamed, exactly one grep pattern changes per site (and the doc).
- The #209 `status.jsonl` `step-done` reader/`FOLD` reducer ignores the additive `ciDispatch` key (confirmed: jq fold operates on known keys only).
- `PR_NUMBER` is in scope at each PR-flow gate (build Step 17 extracts it; debug Step 1 / Step 12 carry it). The ship gate uses `gh run list --branch dev --commit "$PARENT_SHA"`, needing no PR number.
