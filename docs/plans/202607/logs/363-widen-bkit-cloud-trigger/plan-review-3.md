Verdict: FAIL
Failures: 1

<!-- verdict:end -->

# Plan Review 3 — Regression Risk & Failure/Concurrency-Path Design-Coverage

**Lens:** Regression to today's `feat/**` behaviour, loop/race guards for the new dev-triggered routing (the three #363-owned sub-risks from Comment 7), and edge-case handling (docs-only diffs, missing marker, stale dev HEAD, multiple merge-attempts).

**Scope verified against source (not just the plan prose):** `.bkit/templates/.github/workflows/bkit-cloud.yml` (trigger filter, `auto-route-gate`, concurrency group, both `shared-deriv` blocks), `.bkit/workflows/bkit-auto.md` Step 1 (RUN_ID/stale guard at lines 86-92, `MAX_NORMAL_ATTEMPT`), `.bkit/workflows/bkit-ship.md` Step 5 (squash `--subject` line 635, sync-merge line 630) + Step 13 Close (line 1206 close commit + line 1211 `git push origin dev`), `bkit-runtime.sh` `RUNTIME_DEVPUSHES` contract, `docs/deployments.md` § CI trigger / `[skip ci]` precedence.

---

## Findings

### F1 — CRITICAL (architectural) — Stale-run guard false-positives on every legitimate dev dispatch (close-commit race)

- **Lens reviewer:** plan-review-3
- **Severity:** CRITICAL
- **Class:** architectural
- **Location:** `plan-v1-draft.md` Task 2 / Architecture § `.github/workflows/bkit-cloud.yml` ctx step spec, lines 271-277 (the `if [ "$HEAD_SHA" != "$DEV_HEAD" ]` block); this is the plan's answer to Comment 7 sub-risk #3 ("Stale-run guard for the no-PR dev case").
- **Agreement:** 1/3 (single-lens; this is a design-coverage gap the other lenses did not surface from the failure/concurrency angle).

**Exploit scenario / why it breaks:**

The guard compares `workflow_run.head_sha` (R1's head) against `git rev-parse origin/dev` (current dev tip) with strict inequality and skips on mismatch. The cloud-orchestrated `/bkit-ship` path guarantees a mismatch before the cloud workflow boots:

1. feat/{FID} CI green → `bkit-cloud` dispatches `/bkit-ship`; ship runs on the cloud GHA runner where `RUNTIME_DEVPUSHES=true` (`docs/deployments.md:140`, `bkit-runtime.sh`).
2. `/bkit-ship` Step 6 `gh pr merge --squash` lands the squash-merge on `dev` server-side (Push 1, subject `feat({FID}): … (#{PR}) bkit [auto route]` after Task 6). Push 1 triggers dev CI run R1; `workflow_run.head_sha` for the later event = R1's head = squash-merge SHA.
3. `/bkit-ship` Step 13 Close Workflow commits `docs({FID}): ship DONE bkit [skip ci]` (`bkit-ship.md:1206`) and pushes it to `dev` (`git -C "$REPO_ROOT" push origin dev`, `bkit-ship.md:1211`) — Push 2. dev tip advances to the close commit. Steps 7–13 take seconds; R1 (full consumer suite) takes minutes, so Push 2 lands while R1 is still in flight.
4. R1 completes (failure) → `workflow_run` fires → `bkit-cloud.yml` boots → `actions/checkout@v4 ref: dev` → `git rev-parse origin/dev` = **close-commit SHA**, not the squash-merge SHA.
5. Ctx step: `HEAD_SHA` (squash-merge) `!=` `DEV_HEAD` (close commit) → `::notice::Stale dev CI …` → `skip=true` → **no dispatch**.

The same advance-then-skip recurs on every fix-PR cycle (`/bkit-debug` LOCAL close also pushes a `chore({FID}): close-workflow` to dev). The guard as specified suppresses the dispatch for the exact failure mode the feature exists to catch, for any consumer whose dev CI outlasts the close-workflow push (the common case — full test suites).

It is also environment-flaky: a consumer with a sub-minute CI may see R1 complete before Push 2 lands and the guard passes; a consumer with minute-scale CI never gets a dispatch. Correctness must not depend on the CI-duration vs close-workflow-duration race.

Note also the guard's stated intent (skip a CI run "for an old dev SHA" superseded by a _newer feature_ push) is not even achieved by `git rev-parse origin/dev`: two sequential fix squash-merges A→B both leave A as an ancestor of dev tip, so even an ancestor-reachability variant would not distinguish "superseded by newer feature" from "superseded by bkit bookkeeping."

**Suggested fix (pick one, spec it in the plan before build):**

- **(A) Preferred — drop the git-tip comparison; query CI-run recency instead.** Replace the guard with: fetch the latest completed CI run for `dev` and compare its `headSha` to `workflow_run.head_sha`; skip only if a _newer_ CI run exists. Close commits carry `[skip ci]` so they never create CI runs — the latest CI run's head is the latest _feature_ commit, which is exactly the staleness signal intended. Sketch:
  ```bash
  LATEST=$(gh run list --branch dev --workflow CI --status completed --limit 5 \
    --json databaseId,headSha --jq "[.[] | select(.headSha == \"$HEAD_SHA\")] | .[0].databaseId")
  # HEAD_SHA is current iff it appears in the recent completed dev CI runs.
  ```
  (Refine to "is HEAD_SHA the newest completed run" rather than mere presence.)
- **(B) Narrower — walk back past bkit bookkeeping commits.** From `origin/dev`, skip trailing commits whose subject matches `^(docs|chore)\((.{FID})\): .*\[skip ci\]` / `close-workflow`, then compare. More fragile (subject-convention dependent) but stays local.
- **(C) Minimal — remove the guard and rely on the `bkit-auto-dev` concurrency group + `MAX_DEV_DISPATCH_ATTEMPTS` cap.** The guard is defence-in-depth, not load-bearing, once the loop cap exists; dropping it is safer than shipping a guard that always fires.

Until one of these is adopted, Success Criterion #2 ("On dev CI failure … dispatches `/bkit-debug`") is unmet for the common case.

---

### F2 — LOW (architectural) — `bkit-auto-dev` concurrency group collapses across FIDs; dropped dispatches have no operator signal

- **Lens reviewer:** plan-review-3
- **Severity:** LOW
- **Class:** architectural
- **Location:** `plan-v1-draft.md` Architecture § Concurrency (lines 231-242), Edge Cases (line 72), Out of Scope (line 156). Comment 7 sub-risk #1 ("Concurrency-key collapse on dev").
- **Agreement:** 1/3.

The group `bkit-auto-${{ … head_branch }}` resolves to `bkit-auto-dev` for every dev-triggered run regardless of FID. With `cancel-in-progress: false`, GHA does **not** queue — it drops the superseding run. So if FID-A's dev-debug is in-flight and FID-B's dev CI fails 10 s later, FID-B's dispatch is silently dropped (visible only as a cancelled/skipped row in the Actions UI; no `::notice::`, no tracker comment, no re-queue). `/bkit-debug` Step 1's `.lock` only prevents two debugs from _running together_ — it does not re-arm a dropped dispatch. The plan acknowledges the drop and defers FID-level mutual exclusion to #397, which is the correct scope call, so this is a documented limitation rather than a coverage gap. **Suggested fix (optional):** add a one-line `::notice::` in the ctx step when `BRANCH=dev` and the run is the superseding one is not possible (GHA evaluates concurrency before the job boots), so instead note in `docs/deployments.md` that operators must monitor the Actions UI for dropped `bkit-auto-dev` rows when multiple FIDs are in flight.

---

### F3 — LOW (mechanical) — `dev-dispatch` counter is written after dispatch; a crash between dispatch and write undercounts (cap can be exceeded)

- **Lens reviewer:** plan-review-3
- **Severity:** LOW
- **Class:** mechanical
- **Location:** `plan-v1-draft.md` § Open Questions #1 (line 126), Architecture `bkit-debug.md` Step 1 telemetry (lines 345-349). Comment 7 sub-risk #2 ("Self-triggering / debug-on-debug loop").
- **Agreement:** 1/3.

Cap enforcement point is correct (ctx step reads count before dispatch — good). But the increment is written by `/bkit-debug` Step 1 _after_ the dispatch has already left the ctx step. If `/bkit-debug` boots but crashes before the `dev-dispatch` row is appended (e.g., checkout failure, secret-missing gate exit, runner preemption), the row is never written; the next dev-CI-fail re-reads the same `N` and dispatches again. The `bkit-auto-dev` group serialises dev-dispatch runs globally so there is no concurrent double-increment, but repeated early crashes let the true dispatch count exceed `MAX_DEV_DISPATCH_ATTEMPTS`. For a control the plan explicitly frames as cost/security ("Loop-bound as cost control", § Security & Privacy), the write should precede or accompany the dispatch rather than trail it. **Suggested fix:** write the `dev-dispatch` row from the ctx step (it has `$REPO_ROOT`, `$FID`, `workflow_run.head_sha`, and can derive `parentSha`) immediately before issuing the `/bkit-auto` dispatch, so the count is incremented at the decision point; alternatively accept the gap but state it explicitly in § Security & Privacy.

---

### F4 — LOW (architectural) — Docs-only-diff precondition (Vercel cancel → CI green) is inherited but not verified

- **Lens reviewer:** plan-review-3
- **Severity:** LOW
- **Class:** architectural
- **Location:** `plan-v1-draft.md` does not restate the invariant from `plan-input.md` Comment 4 point 5 ("Docs-only diffs neutralise the await — Vercel cancels those builds; that's an intentional no-deploy, not a false green"); Task 12 (consumer-repo acceptance note) does not list it.
- **Agreement:** 1/3.

The dev path routes `dev CI failure → /bkit-debug`. The feature is only correct for docs-only diffs if the consumer's `ci.yml` "Await Vercel Deployment" step neutralises a Vercel-CANCELED build (skip e2e, stay green) rather than red-ing it. If a consumer's CI reds on Vercel-CANCELED, every docs-only squash-merge to dev would false-dispatch `/bkit-debug` and burn one unit of the `MAX_DEV_DISPATCH_ATTEMPTS=3` budget per FID — silently eroding the cap. The invariant is asserted in `plan-input.md` but dropped from the plan body and the acceptance checklist. **Suggested fix:** add a Task 12 bullet requiring manual verification that each target consumer's `ci.yml` neutralises (not reds) Vercel-CANCELED builds, and note in `docs/deployments.md` `dev` row that the dev-trigger path assumes this contract.

---

### F5 — LOW (mechanical) — `fix/**` folding silently changes `/bkit-debug`'s fix-PR lifecycle (now cloud-auto-ships)

- **Lens reviewer:** plan-review-3
- **Severity:** LOW
- **Class:** mechanical
- **Location:** `plan-v1-draft.md` Success Criteria line 30 (claims `feat/**` preserved "byte-for-byte" but is silent on `fix/**`); trigger filter change line 228; routing table inherits `plan-input.md` Comment 4 ("`fix/**` is a pre-existing routing gap worth folding in").
- **Agreement:** 1/3.

Today `workflow_run.branches: ['feat/**']` excludes `fix/**`, so a `/bkit-debug`-created `fix/{FID}` PR's green CI does **not** auto-dispatch `/bkit-ship` — the debug orchestrator owns the merge (LOCAL mode direct push, or waits for manual merge). After this plan, `fix/**` CI success → `workflow_run` → ctx step `else` branch → `gh pr list --head fix/{FID} --base dev` → PR found → `phase=ship` → cloud auto-merges the fix PR. This is almost certainly the intended folding (matches the routing table), but it is an undocumented behaviour change to `/bkit-debug`'s fix-PR flow, and Success Criterion line 30's "preserved byte-for-byte" claim is literally false for the `fix/**` surface (which is new, not preserved). **Suggested fix:** add one sentence to § Breaking Changes & Naming Review stating that `fix/**` PRs now follow the same success→ship / failure→debug routing as `feat/**`, and that `/bkit-debug`-created fix PRs will be auto-merged by the cloud on green CI; correct the "byte-for-byte" wording to scope it to `feat/**` only.

---

### F6 — LOW (mechanical) — Telemetry schema / `bkit-auto` CI_DEV gaps: `parentSha` undefined, `headSha` semantic mismatch, empty `RUN_ID` breaks comment link

- **Lens reviewer:** plan-review-3
- **Severity:** LOW
- **Class:** mechanical
- **Location:** `plan-v1-draft.md` Data Schema Integration lines 198-207 (`dev-dispatch` row) + Architecture `bkit-debug.md` Step 1 telemetry lines 346-349 (`--arg p "$PARENT_SHA"`); `bkit-auto.md` Step 1 Task 4 lines 316-322 (CI_DEV `HEAD_SHA=$(git rev-parse origin/dev)`, `RUN_ID` optional).
- **Agreement:** 1/3.

Three small inconsistencies the builder will otherwise guess at:

1. The `dev-dispatch` jq command references `$PARENT_SHA` but nothing in the plan defines it (bkit-ship derives `PARENT_SHA=$(git rev-parse HEAD)` at `bkit-ship.md:647`; the plan does not say bkit-debug CI_DEV does the same). Specify the derivation.
2. In CI_DEV, `HEAD_SHA=$(git rev-parse origin/dev)` is the dev tip (close commit, per F1), so the `dev-dispatch` row's `headSha` field records the close-commit SHA, not the CI-failed squash-merge SHA. The row is therefore not a faithful record of "which CI run failed." Either rename the field or source it from the triggering `workflow_run.head_sha` propagated through `/bkit-auto`.
3. `bkit-auto.md` Step 1.11 comment-body template references `{RUN_ID}` unconditionally; CI_DEV skips Step 1.8 (RUN_ID resolution), so the rendered comment carries a broken/empty actions link. Gate the link rendering on `MODE=CI` or source `RUN_ID` from the `workflow_run` event id.

---

## What the plan gets right (regression-risk positive confirmation)

- **`feat/**` routing preserved.** The `if [ "$BRANCH" = "dev" ]` branch wraps the existing CI path; `feat/**` still hits `gh pr list --head feat/{FID}` → PR-body FID → ship/debug. No regression.
- **`cancel-in-progress` flip is correctly scoped.** `${{ github.event.workflow_run.head_branch != 'dev' }}` evaluates to `true` for `workflow_dispatch` (`head_branch` is empty, `'' != 'dev'`) and for `feat/**`/`fix/**` (both `!= 'dev'`) — so dispatch and pre-merge paths keep today's latest-wins semantic. Only `dev` flips to `false`. No regression to existing groups.
- **`[skip ci]` / KN-11 holds.** Verified at source: the trailing Close commit `docs({FID}): ship DONE bkit [skip ci]` (`bkit-ship.md:1206`) carries `[skip ci]` but **not** `bkit [auto route]`; the squash-merge subject (line 635) after Task 6 carries `bkit [auto route]` and the HEAD-Subject Assertion (`bkit-ship.md:598`) rejects `[skip ci]` in PR titles, so the squash subject cannot accidentally carry it. The free-tier gate (`contains(head_commit.message, 'bkit [auto route]')`) is defence-in-depth even if a consumer's CI ignored `[skip ci]`.
- **Missing-marker gate is sound.** A squash-merge without the marker (Task 6 not applied, or issue not `bkit:auto`-labelled) fails the workflow-level `auto-route-gate` `if:` before the job boots — zero runner minutes, matches today's `feat/**` behaviour.
- **Loop-cap enforcement point is correct** (ctx step, before dispatch, all-time per FID, counter source = `status.jsonl` `dev-dispatch` rows). The cap's _write_ timing is F3, but the _read/decision_ is at the right place.
- **`bkit:auto` kill switch reused** verbatim from the existing `shared-deriv` label re-check; live revocation works mid-loop.
- **#397 boundary correctly held.** Only the `cancel-in-progress: false` flip is shared; cross-surface same-FID arbitration is explicitly deferred to #397's orchestrator-level guard + status.jsonl lock (plan lines 43, 156).

---

## Verdict rationale

F1 is CRITICAL and architectural: the stale-run guard as specified makes Success Criterion #2 unmet for the common (minute-scale CI) case, with correctness depending on an uncontrollable race between dev-CI duration and `/bkit-ship`'s close-workflow push. The plan must adopt fix A/B/C for F1 before build. The remaining findings (F2–F6) are LOW and non-blocking. Per the reconcile protocol, one CRITICAL ⇒ **FAIL**.
