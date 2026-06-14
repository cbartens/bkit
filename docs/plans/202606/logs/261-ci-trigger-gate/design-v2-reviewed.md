Verdict: PASS

<!-- verdict:end -->

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

A developer runs `/bkit-build` (or `/bkit-debug`) and the workflow finishes by opening or updating a PR. They expect bkit-tests to actually run against the HEAD the PR now points at — not to discover days later, at ship time, that the PR has been sitting green-but-untested because its HEAD carried a `[skip ci]` token. If the workflow aborts mid-run, they expect the PR to keep its last validated HEAD rather than be poisoned by a silent `[skip ci]` abort commit.

**Scope (post-review):** The CI-Dispatch gate applies at **2 sites** — build close-workflow and debug create-pr/close-workflow — **not** 3. Ship is explicitly **out** of this gate: ship already has an outcome-based CI-verification gate (it resolves `SQUASH_SHA`, polls `gh run list --branch dev --commit "$SQUASH_SHA"`, and hard-fails on missing/cancelled/failed/skipped `bkit-decide`/`bkit-tests`) that covers ship's post-merge dispatch. Ship has **no post-merge loud push** to gate (its post-merge `docs({FID}): ship DONE bkit [skip ci]` is silent by design). No CI-Dispatch gate is added at ship for this issue; ship's existing gate is confirmed/referenced as sufficient (#81 Change C backstop). The EC-2 abort-guard still applies to ship's Failure Path **if** that path pushes a `[skip ci]` HEAD onto an open PR.

### Success Criteria

- After a build/debug workflow completes its final loud push, CI is confirmed to have been **dispatched for the exact pushed HEAD** (at minimum a `bkit-decide` run) — or, when no run appears, the workflow self-heals once or terminates with a named, actionable verdict; no workflow ever finishes "green" on a PR whose HEAD has no dispatched run. (Ship's post-merge dispatch is covered by ship's pre-existing gate, not this one.)
- The fix introduces **zero** additional mid-build CI triggers: still exactly one intended dispatch per workflow, and the gate's optional self-heal re-trigger lands at the same point in the commit graph the close-workflow commit already occupies (D2 preserved).
- On a consumer with no CI workflow for the event (bkit's own degenerate setup / a no-`ci`-module consumer), the gate concludes "no CI" and passes as a logged no-op — it never pages or fails a repo that legitimately has no CI.
- On abort, a branch with an open PR keeps its last remote HEAD; the workflow never pushes a `[skip ci]` HEAD onto a live PR.
- A build re-run/resume where `feat/{FID}` already has an open PR fails fast with a clear, named message instead of erroring inside `gh pr create` and falling through an undocumented retry.

### Key Edge Cases

- **Queue latency vs. true suppression** (the universal ambiguity): GitHub surfaces the dispatched run in `statusCheckRollup` asynchronously; a real-but-slow run must not be read as "suppressed" and trigger a wasted re-trigger + (on auto-route consumers) a second auto-router pass. Bounded poll + heal-only-on-empty-rollup + cap-1 bounds the blast radius.
- **Self-heal re-trigger itself suppressed**: a second skip token leaking onto the re-trigger commit must NOT collapse into the "no-CI" no-op (false all-clear); a suppressed re-trigger is `unresolved` (Failure Path), only a _clean_ re-trigger that dispatches nothing is `no-ci`.
- **`gh` API non-zero exit during the poll** (rate-limit, token scope, network — review-2 C1): a failed `gh pr view` / `gh run list` inside the poll loop must NOT silently exit the gate without a `ciDispatch` verdict. Each poll iteration captures `gh`'s exit code; a non-zero exit logs a structured line and **retries the iteration** within the same budget; if every attempt errors (no clean read all budget), the gate routes to `ciDispatch=unresolved` (sub-reason `gh-error`), never a silent drop. This closes the #209 completeness invariant (every `step-done` carries a terminal verdict).
- **Re-trigger lands as final HEAD on an auto-route consumer**: the re-trigger commit must carry the exact same `AUTO_ROUTE_SUFFIX` treatment as the close-workflow commit it replaces, or it drops (or double-fires) the cloud auto-route. The gate **asserts** the re-trigger's derived `AUTO_ROUTE_SUFFIX` equals the value close-workflow used before pushing; a mismatch (e.g. source absent) is `unresolved`, never a silent marker-drop (review-2 C2).
- **EC-1 → EC-2 chain** (the most common path to the symptom): a build re-run blind-`gh pr create`s on an existing PR → errors → retry fails → Failure Path → abort pushes a `[skip ci]` HEAD onto the live PR → CI suppressed. Both ends are closed (EC-1 pre-flight fail-fast; EC-2 abort-guard).
- **Ship composition with #81**: ship's **existing** gate (the `SQUASH_SHA` poll + hard-fail on missing/skipped `bkit-decide`/`bkit-tests`) stays a hard fail-fast on empty/red rollup and is **not modified** by this issue; adding self-heal at ship would mask the exact signal #81 Change C exists to surface. The build/debug CI-Dispatch gate and ship's pre-existing gate are layered backstops, not duplicates.
- **Interrupted build between create-pr (Step 17) and close-workflow push (Step 18)** (EC-3): not directly fixed, but the gate's self-heal recovers it without human intervention instead of leaving a silent suppressed HEAD.

## Architecture

This is an **authoring-only** change to bkit's workflow instruction files (`.bkit/workflows/*.md`) plus their rationale docs and rendered mirrors. There is no application code, no runtime service, no schema. The "components" are inline bash blocks the orchestrator executes during a workflow run, and the "boundaries" are the **two** build/debug loud-push sites plus the abort path. Ship is not a gate site (it has no post-merge loud push and a pre-existing gate already covers its dispatch — see the Scope note above).

### The defect being closed (root cause)

The shared **HEAD-Subject Assertion** (`.bkit/workflows.md` § "HEAD-Subject Assertion", #184) checks a string the orchestrator _just typed_ (`git log -1 --pretty=%B` on a commit clean by construction; at create-pr only the PR _title_). It never reads the real remote HEAD GitHub evaluates and never confirms a run was dispatched. So whenever the clean final commit does not end up as the dispatched HEAD, the PR sits on a `[skip ci]` HEAD with no CI and nothing notices (KN-11). The fix moves the gate from "what we typed" to "what GitHub did" — it polls the live dispatched-run signal for the pushed HEAD.

### Two integration points (the build/debug loud-push sites)

The gate is the **post-push twin** of the existing pre-push inline HEAD clause. It is inlined immediately after each final loud push, with the workflow/event-specific signal differing per site. **Line numbers are intentionally omitted** — they drift; the plan phase re-derives every anchor against the live tree (the bkit-build / bkit-debug files are over 1,000 lines each). Reference is by section / sub-step name only:

<!-- prettier-ignore -->
| Site | File / anchor (by name) | Signal probe | Notes |
| --- | --- | --- | --- |
| build close-workflow | `bkit-build.md` Step 18 (close-workflow push) | `gh pr view {PR_NUMBER} --json statusCheckRollup` for a `bkit-decide` check | `PR_NUMBER` in scope from the create-pr step; `AUTO_ROUTE_SUFFIX` is derived in-block from `LABELS` in the same close-workflow shell, so the gate reuses it directly |
| debug create-pr / close-workflow | `bkit-debug.md` Step 12 — the active trigger sub-step (create-pr sub-step in LOCAL mode; close-workflow sub-step in PR mode) | `gh pr view {PR_NUMBER} --json statusCheckRollup` for a `bkit-decide` check | debug fires CI at create-pr (LOCAL) or close-workflow (PR); the gate goes at whichever sub-step is the actual trigger push. `AUTO_ROUTE_SUFFIX` is sourced from `BKIT_AUTO_ROUTE_FILE` — see the ordering constraint below |

> **Debug AUTO_ROUTE ordering (review-1 #2 / review-2 C2):** `BKIT_AUTO_ROUTE_FILE` is written earlier and `rm`-ed at the create-pr sub-step (after the trigger push). The gate's self-heal re-derivation MUST therefore run **in the same shell block that reads `BKIT_AUTO_ROUTE_FILE`, before it is removed** — i.e. the gate is inlined into the same bash block as the trigger push, so `PR_NUMBER` / `LABELS` / the file contents are all in scope. If `BKIT_AUTO_ROUTE_FILE` has already been removed (or `LABELS` is out of scope) when the re-trigger suffix is derived, the gate does **not** silently fall through to an empty suffix: it asserts the derived `AUTO_ROUTE_SUFFIX` matches the value the trigger commit used and routes to `unresolved` on mismatch (see change 1 / change 4).

> **Ship is not a gate site.** Ship's post-merge dispatch is already verified by ship's pre-existing gate (resolve `SQUASH_SHA` → `gh run list --branch dev --commit "$SQUASH_SHA"` → hard-fail on missing/cancelled/failed/skipped `bkit-decide`/`bkit-tests`). Ship has no post-merge **loud** push (its `docs({FID}): ship DONE bkit [skip ci]` is silent), so there is nothing for a CI-Dispatch gate to observe there, and probing the `[skip ci]` dev HEAD would be empty by construction. **No change at ship for this issue** beyond the EC-2 abort-guard applying to ship's Failure Path if it pushes a `[skip ci]` HEAD onto an open PR.

### Debug LOCAL-mode "fire CI exactly once" — load-bearing implicit assumption (review-1 #5)

In LOCAL mode, debug's close-workflow sub-step pushes a **clean** HEAD to the feat branch **before any PR exists** (the create-pr sub-step runs later). That pre-PR push fires **nothing**, because `ci.yml` `on.push` is scoped to `branches: [dev, main]` only — a push to a `feat/*` branch dispatches no `push`-event run. This is **why** the LOCAL-mode gate correctly sits at the create-pr sub-step (the real trigger, where the PR opens and dispatches the `pull_request` run) and is **not** duplicated at the pre-PR close-workflow push.

This is a **load-bearing implicit assumption, not a gap**: if `ci.yml` `on.push` were ever widened to include `feat/*`, the pre-PR push would become a second trigger and the "fire CI exactly once" invariant for debug-LOCAL would break. The plan must record this assumption explicitly (in the gate's inline comment and in the `deployments.md` D2 record) so a future `ci.yml` edit does not silently invalidate the gate placement.

### Abort-path integration (EC-2)

The EC-2 abort-guard is a conditional wrapped around the existing abort commit + push at **two** places that must stay aligned (anchors by name; the plan re-derives line numbers against the live tree):

- build **inline Failure Path** (the build-specific abort: `docs({FID}): build aborted bkit [skip build] bkit [skip ci]` → force-with-lease push)
- shared Failure Path / `.bkit/workflows.md` conditional-handover step (`{phase} aborted bkit [skip build] bkit [skip ci]` → push)

### Pre-flight integration (EC-1)

A read-only pre-flight at the **entry of build Step 17** (the create-pr step), before the blind `gh pr create`, using a `gh pr list --head … --base dev` probe (the exact form debug already uses for its PUSH_MODE decision). Anchors by name; the plan re-derives line numbers against the live tree.

### What does NOT change (D2 invariants preserved)

- The build commit shape stays `worktree-setup [skip ci]` → `summary` clean → `create-pr [skip ci]` buried → `close-workflow` clean. No intermediate commit becomes loud; no mid-build `synchronize` is introduced.
- The `[skip ci]` on `worktree-setup` / `create-pr` remains load-bearing.
- The gate fires **only** after the single final loud push; it observes, and at most adds one capped re-trigger commit at the same graph position the close-workflow commit already occupies.

## Data Model

No database schema. The only persisted state is an **additive field on the existing `step-done` NDJSON record** in `status.jsonl` (the #209 state model, `merge=union`-safe, append-only). The gate records its terminal verdict so on-call can read the outcome instead of reconstructing it from poll logs.

### `ciDispatch` verdict enum (new field on `step-done`)

Added to the `step-done` record emitted by `build-close-workflow` and the active debug trigger step (`debug-create-pr` in LOCAL-mode / `debug-close-workflow` in PR-mode). **Ship does not emit `ciDispatch`** — ship's pre-existing gate is unchanged by this issue and uses its own pass/hard-fail control flow:

<!-- prettier-ignore -->
| Value | Meaning | Operator action |
| --- | --- | --- |
| `dispatched` | A `bkit-decide` run appeared for the pushed HEAD within the poll budget | None — pass |
| `self-healed` | First poll empty + HEAD clean → one re-trigger pushed → run then appeared | None — pass (one extra empty commit on the branch) |
| `no-ci` | Re-trigger was clean (re-asserted) yet still dispatched nothing → repo has no CI workflow for this event | None — logged no-op (the log line records whether this is **confirmed** or **inferred**, see below) |
| `unresolved` | Re-trigger errored, or re-trigger HEAD was itself suppressed, or budget exhausted with a dirty HEAD, or every poll iteration hit a `gh` API error | Failure Path — message names HEAD SHA + a **sub-reason** (`timeout-dirty` / `retrigger-suppressed` / `gh-error`) + the `gh workflow run ci.yml --ref feat/{FID}` recovery |

**`no-ci` confirmed vs. inferred (review-2 O1 / no-ci ambiguity):** `no-ci` covers two physically different paths and the enum value stays the same (closed 4-state set), but the **log line distinguishes them** so an operator reading `status.jsonl` output can tell a legitimate no-CI repo from a queue-latency false-negative:

- **confirmed no-CI** — the re-trigger was clean and dispatched nothing within the budget (the discriminator-by-construction fired); log `no CI workflow dispatched for this event (confirmed)`.
- **inferred no-CI** — the re-trigger poll **also** reached the budget limit (both the original poll and the re-trigger poll timed out); log `re-trigger poll reached budget — concluding no CI (inferred / unconfirmed)`. This flags a possible queue-latency false-negative that an operator may want to re-verify, without converting a legitimate no-CI repo into a page.

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

- `ciDispatch` is **optional and additive** — older readers (and the `FOLD` reducer in `bkit-build.md`, the `step-done` reducer) ignore unknown keys; it never breaks the existing fold.
- It is the only new state key. No new files, no new lock semantics, no new gate state beyond what `status.jsonl` already captures.
- **Ship**: no `ciDispatch` field. Ship's pre-existing gate (the `SQUASH_SHA` poll + hard-fail) is untouched by this issue; ship does not self-heal and does not emit this verdict.

## Components / Flows

Four changes, all instructions-only, inlined per site (no cross-reference to `workflows.md`), reusing the closest existing phrasing verbatim.

### 1. CI-Dispatch outcome gate (the D2-safe kernel) — a 4-outcome state machine

Inlined immediately **after** the final loud push at each of the **two** build/debug trigger sites. Conceptual shape (the plan phase produces the byte-exact bash; magic numbers become named symbols `POLL_BUDGET_S` / `POLL_INTERVAL_S` so a grep finds every copy across both sites). All poll log lines carry a `[bkit-ci-gate]` context prefix per `docs/observability.md` convention (review-2 O3):

```
# After the loud push has landed the remote HEAD:
POLL_INTERVAL_S=10 ; ATTEMPTS=6        # ~60s budget; bounds *dispatch surfacing*, NOT run completion
api_errors=0
for attempt in 1..ATTEMPTS:
    rollup := gh pr view {PR_NUMBER} --json statusCheckRollup   # capture exit code, do NOT set -e out
    if gh exit != 0:
        api_errors += 1
        log "[bkit-ci-gate] attempt N/6: gh API error (exit $rc) — retrying iteration"
        sleep POLL_INTERVAL_S ; continue            # retry-the-iteration, never silently drop the gate
    log "[bkit-ci-gate] attempt N/6: rollup has K checks"   # queued-vs-suppressed must be reconstructable
    if a bkit-decide run is present → ciDispatch=dispatched ; PASS
    sleep POLL_INTERVAL_S
# Budget exhausted:
if api_errors == ATTEMPTS:                          # every iteration errored, never a clean read
    → ciDispatch=unresolved (sub-reason gh-error) → Failure Path
# No run seen but reads were clean:
re-run the inline HEAD clause on the current HEAD (%B grep of the suppressor set)
if HEAD is NOT clean → ciDispatch=unresolved (sub-reason timeout-dirty) → Failure Path   # never self-heal a dirty HEAD
# HEAD clean → SELF-HEAL (cap = 1):
derive AUTO_ROUTE_SUFFIX exactly as the trigger commit did (same source — see change 4)
ASSERT derived AUTO_ROUTE_SUFFIX == the trigger commit's value      # see change 4 / review-2 C2
if mismatch → ciDispatch=unresolved (sub-reason autoroute-mismatch) → Failure Path        # never drop the marker silently
git commit --allow-empty -m "chore({FID}): re-trigger ci${AUTO_ROUTE_SUFFIX}"
re-assert the re-trigger HEAD is clean (%B grep)               # a *suppressed* re-trigger is unresolved, not no-ci
if re-trigger HEAD NOT clean → ciDispatch=unresolved (sub-reason retrigger-suppressed) → Failure Path
push (reuse the exact `case "$B" in dev|main) … esac` push idiom)
poll once more (same ATTEMPTS budget, same gh-error handling):
    if a bkit-decide run appears → ciDispatch=self-healed ; PASS
    elif every re-trigger poll iteration errored → ciDispatch=unresolved (sub-reason gh-error) → Failure Path
    else → ciDispatch=no-ci ; log confirmed-vs-inferred (see Data Model) ; PASS (no-op)
```

**Outcome → record → action** (closed set, no fifth state):

- `dispatched` → record verdict, pass.
- `self-healed` → record verdict, pass (one extra empty commit; the cap-1 bounds blast radius).
- `no-ci` → record verdict, log (confirmed vs. inferred — see Data Model), pass. This is the **discriminator-by-construction**: a _clean_ re-trigger that still dispatches nothing is the _only_ legitimate no-op. There is **no `PUSH_MODE` no-op branch** — `PUSH_MODE=LOCAL` still dispatches CI (it creates a PR, so the `pull_request` event fires).
- `unresolved` → Failure Path with a self-describing message carrying a **sub-reason code** (`timeout-dirty` = budget exhausted with a suppressor on HEAD; `retrigger-suppressed` = re-trigger HEAD itself carried a suppressor; `autoroute-mismatch` = the re-trigger's `AUTO_ROUTE_SUFFIX` did not match the trigger commit's; `gh-error` = every poll iteration hit a `gh` API non-zero exit), the HEAD SHA, the last rollup state, and the `gh workflow run ci.yml --ref feat/{FID}` manual recovery (documented in `deployments.md`). The sub-reason makes on-call triage actionable without reading the orchestrator transcript (review-2 O2).

**`gh` API-error handling (review-2 C1):** the poll loop **never** `set -e`'s out on a `gh` non-zero exit. Each iteration captures the exit code; a non-zero exit logs a structured `[bkit-ci-gate]` line and **retries the iteration** within the budget. Only if _every_ iteration errors (no clean read all budget) does the gate route to `unresolved` (sub-reason `gh-error`). The gate **always** writes a terminal `ciDispatch` verdict to `status.jsonl` — there is no path where a `gh` error leaves the `step-done` record without a verdict (preserving the #209 completeness invariant).

**Ship:** unchanged. Ship's pre-existing gate (the `SQUASH_SHA` poll + hard-fail on missing/skipped `bkit-decide`/`bkit-tests`) already provides poll-only, no-self-heal verification — this is #81 Change C's territory and is **not** re-implemented here.

### 2. EC-2 abort-guard — never push a `[skip ci]` HEAD onto a live PR

At build's inline Failure Path and the shared Failure Path / `.bkit/workflows.md` conditional-handover step (anchors by name; the plan re-derives line numbers against the live tree), wrap the abort commit + push in a PR-existence conditional (reuse debug's read-only `gh pr list --head "$B" --base dev --json number --jq '.[0].number'` probe):

- **If** an open PR exists for this head → write the abort artifact + status + issue-comment handover as today, but do **NOT** create/push a new `[skip ci]` HEAD onto the PR branch. Leave the last validated remote HEAD intact. (The issue-comment handover in the Failure Path remains the durable abort-context sink, so preserving HEAD costs no diagnosability.)
- **Else** (no open PR) → plain abort-commit + push, exactly as today.
- A failed `gh pr list` probe is treated as **"PR exists / be safe"** → skip the push (the _worse_ outcome here is pushing a suppressed HEAD onto a live PR, so the safe fallback is to NOT push). This inverts the gate's elsewhere-safe default deliberately, because the cost asymmetry is reversed on the abort path.
- **Operability note — stale CI on the preserved HEAD (review-2):** leaving the last validated remote HEAD means the PR keeps that HEAD's prior CI run (which may be a complete pass/fail from an earlier attempt, or a partial run). This is the intended cost-asymmetry outcome (a preserved, possibly-stale green is better than a freshly-suppressed `[skip ci]` HEAD), and the EC-1 pre-flight catches the resume case by failing fast on the open PR. The recovery is the standard `gh workflow run ci.yml --ref feat/{FID}` re-trigger if an operator needs a fresh run on the preserved HEAD; this is not a new failure mode introduced by the gate.

### 3. EC-1 pre-flight escalation — fail fast on an existing PR (placeholder for the deferred PUSH_MODE fix)

At the entry of build Step 17 (the create-pr step; anchors by name, plan re-derives line numbers), before the blind `gh pr create`:

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

The self-heal re-trigger commit (change 1) lands as the **final HEAD**, so it must inherit the _exact_ marker treatment of the trigger commit it replaces (anchors by name; the plan re-derives line numbers):

- **build**: re-derive `AUTO_ROUTE_SUFFIX` in the gate's shell exactly as the close-workflow step does (`echo "${LABELS:-}" | grep -q 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]"`). Because the build gate is inlined into the **same** close-workflow bash block, `LABELS` / `AUTO_ROUTE_SUFFIX` are already in scope — reuse directly.
- **debug**: source it from the existing `BKIT_AUTO_ROUTE_FILE` mechanism (written earlier; read-and-`rm`-ed at the create-pr sub-step) so the re-trigger carries the same mode-correct suffix the trigger commit carried. **Ordering constraint (review-1 #2):** the gate must run in the **same shell block that reads `BKIT_AUTO_ROUTE_FILE`, before it is `rm`-ed** — the file is removed at the create-pr sub-step, so the gate cannot re-read it from a later, separate bash invocation (shell variables and the just-removed file do not persist across Bash tool calls). Inlining the gate into the trigger-push block is therefore mandatory, not stylistic.
- **Assert-before-push (review-2 C2):** if the source is absent when the suffix is derived (`LABELS` out of scope, or `BKIT_AUTO_ROUTE_FILE` already removed), `AUTO_ROUTE_SUFFIX` would silently default to empty. The gate MUST instead **assert the derived `AUTO_ROUTE_SUFFIX` matches the value the trigger commit used** before pushing the re-trigger. On mismatch (the derived value differs from the close-workflow/create-pr value — e.g. empty when the trigger had `bkit [auto route]`), the gate routes to `ciDispatch=unresolved` (sub-reason `autoroute-mismatch`) and logs the derivation mismatch. A silent re-trigger that drops the auto-route marker — causing a missed cloud-agent dispatch with no operator signal — is **never** allowed.
- The re-trigger MUST NOT introduce a fresh suppressor (it is `--allow-empty`, message is `chore({FID}): re-trigger ci${AUTO_ROUTE_SUFFIX}`), and the post-commit HEAD re-assertion (change 1) guarantees it.
- This resolves the issue's open question "does the re-trigger interact with the auto-route marker?" → **yes: same suffix, sourced the same way as the trigger commit, asserted-equal before push; never a fresh marker, never a silently-dropped one.** It also updates `.bkit/workflows.md` § `bkit [auto route]` Marker Propagation, which already names "the debug re-trigger commit" — the build gate's re-trigger must be added to that list.

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
| **`gh` API non-zero exit inside the poll loop retries the iteration; all-iterations-errored → `unresolved` (sub-reason `gh-error`)** — the gate never `set -e`'s out and always writes a terminal `ciDispatch` verdict | Swallow the error (corrupts the check count); or `set -e` out (leaves `step-done` with no verdict) | A `gh` rate-limit/scope/network error must not silently drop the gate's coverage or break the #209 completeness invariant; retry-then-route makes every outcome terminal and inspectable (review-2 C1) |
| **Assert the re-trigger's derived `AUTO_ROUTE_SUFFIX` equals the trigger commit's value before pushing; mismatch → `unresolved` (sub-reason `autoroute-mismatch`)** | Let a missing source silently default the suffix to empty | A silently-empty suffix drops the `bkit [auto route]` marker → missed cloud-agent dispatch with no operator signal; asserting-equal turns a marker-drop into a named, actionable failure instead of a silent regression (review-2 C2) |
| **`unresolved` Failure Path message carries a sub-reason code** (`timeout-dirty` / `retrigger-suppressed` / `autoroute-mismatch` / `gh-error`); `no-ci` log distinguishes **confirmed** vs **inferred** | One opaque `unresolved` / one opaque `no-ci` | On-call can triage (wait-and-retry vs. authoring-bug vs. API-issue) without reading the orchestrator transcript, and can tell a legitimate no-CI repo from a queue-latency false-negative (review-2 O1, O2) |
| **`[bkit-ci-gate]` context prefix on all gate poll log lines** | Bare log lines | Matches the `docs/observability.md` `[{Context}]` convention; makes the gate's output greppable in orchestrator transcripts (review-2 O3) |
| Self-heal only when rollup is **empty**, never on "incomplete/not-green"; budget bounds *dispatch surfacing*, not run completion | Larger budget; heal on any non-green; wait for `bkit-tests` to finish | Bounds queue-latency false-negatives; never waits for the run to *complete*, only to *appear* — heal-on-non-green would fire a wasteful (and on auto-route consumers, doubled-routing) second run on a real-but-slow run |
| Poll budget + interval as **named symbols** (`POLL_BUDGET_S` / `POLL_INTERVAL_S`), rationale documented in KN-11 | Bare `6` / `10s` literals inlined ×2 | Magic numbers across 2 aligned sites drift silently; the invariant "budget > p99 dispatch-surfacing latency" must have a documented home or it converts queued→suppressed in 6 months |
| **No `PUSH_MODE` no-op** — the clean-re-trigger-dispatches-nothing probe is the *sole* no-CI discriminator | `PUSH_MODE=LOCAL` → no-op; statically parse `.github/workflows/*.yml` for trigger events | `LOCAL` still dispatches CI (it opens a PR → `pull_request` event fires); static YAML parse re-introduces "trust what we typed" (the #261 root cause) and violates the MCP-only workflow rule |
| Re-trigger commit carries the **same `AUTO_ROUTE_SUFFIX`** treatment (and sourcing) as close-workflow | Plain re-trigger (no marker); always-marker | Re-trigger lands as final HEAD; stripping drops cloud auto-route continuity, always-adding double-fires it — must mirror close-workflow exactly (resolves the issue's open question) |
| **EC-2**: on abort, if an open PR exists, do NOT push a new `[skip ci]` HEAD — leave the last validated HEAD | Always push the abort commit (status quo) | Pushing `[skip ci]` onto a live PR is the confirmed EC-2 failure; "don't fire CI on abort" is D2-aligned; closes the EC-1→EC-2 chain; issue-comment handover preserves context |
| **EC-1**: build Step-17 pre-flight `gh pr list` → fail fast with a clear message if a PR exists; explicit placeholder for the deferred PUSH_MODE fix | Fold full PUSH_MODE/EXISTING_PR detection into build now (Approach B/C); leave the blind create | Full alignment is D2-risky (mid-build `synchronize`); the issue flags it as "must be designed, not hand-edited"; fail-fast surfaces the gap cleanly and the gate is the backstop |
| **No new gate at ship** — confirm/reference ship's pre-existing `SQUASH_SHA`-poll + hard-fail gate as sufficient | Add a new poll-only (or self-heal) gate at ship for symmetry with build/debug | Ship already has an outcome-based gate (resolve `SQUASH_SHA` → `gh run list` → hard-fail on missing/skipped `bkit-decide`/`bkit-tests`); a second gate would be redundant, and adding self-heal would mask the very signal #81 Change C exists to surface — a suppressed HEAD reaching ship is a real anomaly worth a human. Ship also has no post-merge **loud** push to gate; probing the `[skip ci]` dev HEAD would be empty by construction. The build/debug gate and ship's gate are layered backstops, not duplicates |
| **Inline per-site** (2× gate + 2× abort-guard, aligned), accept the lockstep-edit tax | Centralize as a generated/templated fragment | Honors the standing authoring doctrine (self-contained, no cross-refs to `workflows.md`); a fragment-include mechanism is forbidden new infra (YAGNI) and contradicts an approved constraint |
| Add a **grep-equality / render-sweep acceptance check** scoped to the genuinely-shared gate sub-lines (poll loop + named symbols), not whole-gate byte-equality | Trust manual alignment; or claim full byte-identity across sites | The inline doctrine's standing risk is a fix applied to one copy not all; a grep check on the shared sub-lines makes alignment verifiable. **Not** whole-gate byte-equality: the two gates legitimately differ (build sources `AUTO_ROUTE_SUFFIX` in-block from `LABELS`, debug from `BKIT_AUTO_ROUTE_FILE`), so a naive `grep -F` of the entire gate would fail by construction — the check targets only the shared poll-loop + symbol lines |
| Docs (`deployments.md` KN-11 + D2 record, `workflows.md` § rename) updated **in lockstep** with the workflow edits | Update docs separately / later | Authoring constraint requires lockstep; KN-11 must record the discriminator-by-construction invariant or the gate gets "simplified" into a regression |

## Approaches Considered

The three brainstorms converged on the same kernel (inline outcome-gate + EC-2 abort-guard) and diverged on (a) how much of the EC-1 chain to fix now, (b) whether to self-heal at all, and (c) how to inline. The selected design is the **Pragmatic/Structural Approach A kernel**, hardened with the **Risk-premortem state machine** (4 typed outcomes + re-trigger-clean re-assertion + named poll symbols), plus the **Structural Approach C conservative EC-1 pre-flight** for fail-fast UX.

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Inline outcome-gate as post-push twin of the existing assertion + EC-2 abort-guard (Pragmatic A / Structural A) | **KEPT** | Exactly the issue's D2-safe kernel; pure reuse of existing idioms; zero D2-risk surface; ships fastest. This is the spine of the design. |
| Outcome gate as an explicit **4-outcome state machine** with `ciDispatch` verdict, per-attempt poll logging, and a re-trigger-clean re-assertion before `no-ci` (Risk-premortem A) | **MERGED** (onto the kept kernel) | Risk-premortem mitigations are additive: they turn the kernel from "pass/fail" into a diagnosable, on-call-actionable state machine and close the false-all-clear hole. Layered on, not chosen against. |
| Conservative EC-1 **pre-flight fail-fast** (`gh pr list` → clear Failure Path, explicit placeholder) (Structural C) | **MERGED** (as change 3) | Surfaces EC-1 cleanly without taking on the D2-risky full PUSH_MODE alignment; better failure UX than the current blind-create chain; leaves a documented hook for the deferred fix. |
| Named poll symbols + KN-11 rationale home + grep-equality acceptance check **scoped to the shared sub-lines** (Risk-premortem A drift mitigation) | **MERGED** | Directly mitigates the inline-doctrine's lockstep-drift risk and the magic-number 6-months-later risk; cheap, additive. Scoped to the shared poll-loop + symbol lines, not whole-gate byte-equality (the two gates legitimately differ in AUTO_ROUTE sourcing). |
| Operability hardening: `gh`-error retry-then-`unresolved`, AUTO_ROUTE assert-equal-before-push, `unresolved` sub-reason codes, `no-ci` confirmed/inferred log, `[bkit-ci-gate]` prefix (Operability lens) | **MERGED** | Additive on the kept kernel: closes the two operability CRITICALs (silent gh-error drop, silent marker-drop) and makes every terminal state actionable; no change to the 4-state enum or D2 surface. |
| Fold full PUSH_MODE/EXISTING_PR detection into build now, routing CI through the existing close-workflow push (Pragmatic B / Structural B / Risk-premortem C EC-1 leg) | **REJECTED** (deferred) | D2-risky: a mis-computed "already pushed" predicate re-opens the mid-build `synchronize` defect (§141/KN-30). The issue explicitly flags this as "must be designed, not hand-edited." Deferred behind the EC-1 placeholder; the gate is its backstop. |
| Make build's create-pr commit clean (EC-3 fix) | **REJECTED** (deferred) | Changes the documented D2 contract; the issue says "don't change in isolation." The gate's self-heal recovers EC-3-induced states without it. |
| **Verify-only gate, no self-heal**, with a static "does this repo have CI for this event?" probe (Risk-premortem B) | **REJECTED** | The static CI-presence probe re-introduces "trust what we typed, not what GitHub did" (the #261 root cause) and violates the MCP-only rule. Without self-heal there is no clean no-CI discriminator and the gate pages the fleet on queue latency. Its one good idea (suppression = loud signal) is preserved via the `unresolved` outcome. |
| Add **any new gate** (poll-only or self-heal) at the **ship** site | **REJECTED** | Ship already has an outcome-based gate (`SQUASH_SHA` poll + hard-fail on missing/skipped `bkit-decide`/`bkit-tests`); a new one is redundant, self-heal would mask the #81 Change C signal, and ship has no post-merge loud push to observe (the `[skip ci]` dev HEAD is empty by construction). Ship's existing gate is confirmed sufficient; no change at ship for this issue. |
| Centralize the gate as a generated/templated fragment (Pragmatic C) | **REJECTED** | Contradicts the hard authoring constraint (self-contained, no cross-refs, inline at each site); a fragment-include mechanism is forbidden new infra (YAGNI). Listed for completeness only. |

## Trade-offs Accepted

**What we gain:**

- The blind spot closes: CI is verified by the _live GitHub signal_ for the pushed HEAD, not by a string the orchestrator typed. The KN-11 vacuously-green-PR class is caught at the earliest point (final feat-branch push) instead of at ship.
- Self-recovery: a suppressed HEAD self-heals once without human intervention; only genuinely unrecoverable states page.
- A diagnosable, on-call-actionable terminal state on every workflow (`ciDispatch` verdict), composing cleanly with the #209 NDJSON model.
- The EC-1→EC-2 chain (the most common path to the symptom) is closed at both ends with zero D2-risk.

**What we sacrifice vs. alternatives:**

- **Latency**: the close-workflow step now adds **up to ~120s** to the workflow — up to ~60s on the dispatched path (the first poll budget) and up to ~120s on the self-heal path (first poll budget + re-trigger poll budget), on top of the existing push. On fast repos this collapses to 1–2 iterations; on slow webhook fanout it is the full budget. This must be documented in the workflow instruction (a one-line note above the gate bash) so an operator seeing the step "hang" for 60–120s knows it is the gate polling, not a hung workflow (review-2 O4). Accepted as the cost of outcome-based verification.
- **Cosmetic extra commit on self-heal**: a real-but-slow run mistaken for suppression triggers one wasted `--allow-empty` re-trigger (tree-state unchanged, cap-1). Accepted; the alternative (verify-only, no heal) pages the fleet on queue latency instead.
- **Lockstep-edit tax**: 2× aligned gate copies (build, debug) + 2× abort-guard copies must be edited in lockstep on every future tuning (poll budget, cap, job name). The two gates are **not** whole-gate byte-identical — they differ in AUTO_ROUTE sourcing (build in-block from `LABELS`, debug from `BKIT_AUTO_ROUTE_FILE`) — so the grep-equality check targets only the genuinely-shared sub-lines (poll loop + named symbols). This is the standing cost of bkit's inline-single-source doctrine, accepted over the forbidden templated-fragment alternative; mitigated by named symbols + the scoped grep-equality acceptance check.
- **EC-1 not fully fixed**: build re-run on an existing PR still requires human intervention (now a clear fail-fast instead of a confusing one). The full build/debug branch-PR alignment is deferred as D2-risky.
- **EC-3 not fixed**: relies on the gate's self-heal to recover an interrupted build between Step 17 and Step 18 rather than making the create-pr commit clean.

## Risks & Open Questions

### Risks

- **Queue latency vs. true suppression (the universal ambiguity).** The poll budget is the single tuning knob that decides the false-positive rate. The invariant to encode and document in KN-11: _budget must exceed observed dispatch-surfacing p99, and must NOT wait for run completion_. If dispatch p99 ever creeps past the budget, a real-but-slow run reads as suppressed → wasted re-trigger (and, on auto-route consumers, a redundant auto-route event). Mitigations in the design: heal-only-on-empty (not non-green), cap-1, per-attempt poll logging for reconstructability.
- **Self-heal double-firing the auto-router.** On a `bkit:auto` consumer the re-trigger carries `bkit [auto route]`; a spurious re-trigger fires a second `bkit-decide` and a second auto-route dispatch. Bounded to exactly one extra run by cap-1; the empty-rollup discriminator keeps spurious triggers rare. (Cross-checking the D2/D3 stale-run guard in `bkit-cloud.yml` for behavior under two coexisting runs is noted below as an open question, not a blocker — the gate adds at most one run, same graph position as close-workflow.)
- **Inline-copy drift.** Two aligned gate copies (build, debug) + two abort-guard copies; a fix to one and not the other is itself an operability risk. Mitigated by named poll symbols and a grep-equality acceptance check **scoped to the shared sub-lines** (the two gates legitimately differ in AUTO_ROUTE sourcing, so whole-gate byte-equality is not the invariant); not eliminated.
- **Magic-number drift (6 months later).** A maintainer bumping CI cold-start, or a consumer on a slower runner, silently converts "queued" into "suppressed." Mitigated by promoting the constants to named symbols with the derivation documented in KN-11 (the magic number gets a home).
- **`gh` API failures (rate-limit / token-scope / network).** Inside the **poll loop**, a non-zero `gh` exit retries the iteration (structured `[bkit-ci-gate]` log) and, only if every iteration errors, routes to `unresolved` (sub-reason `gh-error`) — the gate never `set -e`'s out and always writes a terminal verdict (review-2 C1). On the **EC-1 pre-flight** a failed `gh pr list` falls through to today's blind create (no regression; gate is backstop). On the **EC-2 abort-guard** a failed `gh pr list` is treated as "PR exists → do not push" (safe-by-cost-asymmetry). These three behaviors (retry-then-unresolved / fall-through / do-not-push) are deliberately different per cost-asymmetry and must be called out so a future maintainer does not "normalize" them into one.
- **Silent AUTO_ROUTE marker-drop on re-trigger.** If the re-trigger's `AUTO_ROUTE_SUFFIX` source is absent (`LABELS` out of scope, or `BKIT_AUTO_ROUTE_FILE` already `rm`-ed) the suffix would default empty and the cloud-agent dispatch would silently not fire. Mitigated by the assert-equal-before-push rule (mismatch → `unresolved` sub-reason `autoroute-mismatch`), so a marker-drop is a named failure, not a silent regression (review-2 C2).
- **Debug AUTO_ROUTE ordering (file already removed).** `BKIT_AUTO_ROUTE_FILE` is `rm`-ed at the create-pr sub-step; the gate must run in the same shell block that reads it, before removal, or the re-derivation has nothing to read. Mitigated by requiring the gate be inlined into the trigger-push bash block; the assert-equal rule is the backstop if this is ever violated.
- **Bus factor / "simplification" regression.** The discriminator-by-construction (no `PUSH_MODE` no-op), the re-trigger-clean-before-`no-ci` rule, the AUTO_ROUTE assert-equal-before-push rule, the `gh`-error retry-then-`unresolved` rule, and the debug-LOCAL "`ci.yml on.push` is `[dev, main]` only so the pre-PR feat-branch push fires nothing" assumption are all non-obvious; a future maintainer could re-add a mode branch, collapse the no-CI/suppressed distinction, default a missing suffix to empty, swallow a `gh` error, or widen `on.push` and silently reopen #261 one layer down. Mitigated by stating all of these invariants explicitly in the `deployments.md` D2 record and the renamed `workflows.md` § "CI-Dispatch Gate".

### Doc & render surface (required, in lockstep)

- `docs/deployments.md` — update KN-11 / § "CI trigger on final workflow push" to describe the outcome gate + discriminator + named poll budget; add/extend the D2 record with the discriminator-by-construction, re-trigger-clean, **AUTO_ROUTE assert-equal**, **`gh`-error retry-then-unresolved**, and the **debug-LOCAL `ci.yml on.push = [dev, main]` only → feat-branch push fires nothing** invariants (so a future `on.push` widening cannot silently invalidate gate placement). Document the `unresolved` sub-reason codes and the `no-ci` confirmed/inferred distinction as the runbook for those verdicts.
- `.bkit/workflows.md` — rename/expand § "HEAD-Subject Assertion" → § "CI-Dispatch Gate" covering both clauses (typed-string + outcome) as one contract; add the build gate's re-trigger to § "`bkit [auto route]` Marker Propagation".
- `docs/observability.md` convention — the gate's poll log lines use the `[bkit-ci-gate]` `[{Context}]` prefix per the project logging convention.
- Re-render `.claude/` / `.cursor/` / `.opencode/` mirrors after the `.bkit/workflows/*.md` edits (batch at session end, per the no-per-edit-install rule — the orchestrator runs it, the plan notes it as a required final action; render output is truth, mirrors are force-overwritten).
- **Wire the scoped grep-equality check as a mandatory check, not just an acceptance criterion (review-2 O5).** The check that the two gates' shared poll-loop + named-symbol sub-lines stay aligned should be wired into the existing bkit-check gate (the pre-push hook / `ci.yml` check step) so it does not decay; otherwise drift is detected only by human review or by symptom.

### Open Questions (answered where the issue asked; flagged where they remain)

- **EC-1 idempotent re-run approach** → **answered**: pre-flight `gh pr list` fail-fast now; full PUSH_MODE/EXISTING_PR alignment deferred (D2-risky), with an explicit placeholder hook. Not closed in this change by design.
- **Re-trigger × auto-route marker interaction** → **answered**: the re-trigger carries the _same_ `AUTO_ROUTE_SUFFIX` treatment and sourcing as close-workflow (build: re-derive in-block from `LABELS`; debug: via `BKIT_AUTO_ROUTE_FILE`), never a fresh marker.
- **Ship `ship DONE [skip ci]` dev-HEAD batching** → **answered (confirmed safe)**: ship's post-merge `docs({FID}): ship DONE bkit [skip ci]` is the intentional status commit batched into the single post-merge push to `dev`; `dev`'s CI already fired on the squash merge, so this commit is correctly silent and never strands `dev`. This is also why ship has no post-merge **loud** push to gate — confirming the scope decision that ship is not a CI-Dispatch gate site. Ship's pre-existing `SQUASH_SHA`-poll gate covers ship's dispatch and is untouched by this issue.
- **Remaining (not blocking this design):** confirm the D2/D3 stale-run guard in `bkit-cloud.yml` tolerates the at-most-one extra self-heal run on a `bkit:auto` consumer (the gate's blast radius is one run at the close-workflow graph position; if the guard is confirmed weak, that is a separate `bkit-cloud.yml` hardening, not a change to this gate). Tune `POLL_BUDGET_S` against real dispatch-surfacing p99 once measurable (currently `gh`/REST 404 on the consumer orgs under the available token).

### Assumptions

- `bkit-decide` is the entry job that appears first in `statusCheckRollup` / `gh run list` for any dispatched run; if it is ever renamed, exactly one grep pattern changes per site (and the doc). **Reconcile with ship's fuzzy match (review-1 OPTIONAL):** ship's existing gate matches the tests job _fuzzily_ (`select(.name | test("test"; "i"))`) because consumer ci.yml job names vary. The plan should either adopt the same anchored/fuzzy tolerance for the `bkit-decide` probe (so a consumer-renamed decide job does not produce a permanent self-heal → `no-ci`/`unresolved`) **or** document why decide must be an exact literal while tests is fuzzy. The build/debug rollup probe (`gh pr view --json statusCheckRollup`, check-run shape) and ship's run-list probe (`gh run list`, workflow-run shape) expose **different JSON shapes** and cannot share a jq filter verbatim — the plan must use the shape-correct filter at each site (review-1 OPTIONAL).
- **`ci.yml` `on.push` is scoped to `branches: [dev, main]` only.** This is load-bearing for debug-LOCAL gate placement: a push to a `feat/*` branch fires no `push`-event run, so the pre-PR close-workflow push in LOCAL mode dispatches nothing and the gate correctly sits at the create-pr sub-step. If `on.push` is ever widened to include `feat/*`, this assumption (and the gate placement) must be revisited.
- The #209 `status.jsonl` `step-done` reader/`FOLD` reducer ignores the additive `ciDispatch` key (confirmed: jq fold operates on known keys only).
- `PR_NUMBER` is in scope at each PR-flow gate (build's create-pr step extracts it; debug Step 1 / Step 12 carry it). Ship is not a gate site here (its pre-existing gate uses `gh run list --branch dev --commit "$SQUASH_SHA"`, needing no PR number).
- The gate is inlined into the **same bash block** as its trigger push at both sites, so `PR_NUMBER` / `LABELS` (build) and the just-read `BKIT_AUTO_ROUTE_FILE` contents (debug, before its `rm`) are in scope — shell variables and the removed file do not persist across separate Bash tool invocations.
