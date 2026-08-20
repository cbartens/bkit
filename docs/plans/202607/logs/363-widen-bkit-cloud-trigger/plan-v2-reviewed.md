Verdict: PASS

<!-- verdict:end -->

<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

<!-- Reviewed revision (v2). Incorporates all blocking/high findings from plan-review-1
     (CONCERNS), plan-review-2 (CONCERNS), and plan-review-3 (FAIL). See
     "Review Critique Resolution Index" near the end of this file for a critique-by-critique
     trace. Source references re-verified against the current worktree. -->

# Widen bkit-cloud Trigger to Post-Merge dev CI Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual `plan.md` file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

## Context & Goals

`bkit-cloud.yml`'s `workflow_run` trigger currently fires only on `feat/**` CI completion (pre-merge pull-request CI). When CI goes green on a `feat/{FID}` branch, the cloud orchestrator auto-ships the PR; when it fails, it auto-dispatches `/bkit-debug`. But once that PR squash-merges to `dev`, the `feat/{FID}` branch is deleted and **no cloud trigger fires for post-merge `dev` CI** — if the squash-merge reintroduces a failure (merge conflict resolution gone wrong, a dependency only resolved on the PR head, an env difference), bkit is blind to it. An operator must notice the red `dev` CI run and manually invoke `/bkit-debug`.

This plan **widens the trigger** to `['feat/**', 'fix/**', 'dev']` and adds the branch-aware routing, FID-recovery, concurrency, and loop-bound machinery the `dev` path requires. `main` stays manual-only (production trunk never auto-dispatches a cloud agent). The design follows **Option A** from the issue comments: the existing free-tier gate (`bkit [auto route]` HEAD-commit marker, threaded by `bkit-ship` onto the squash-merge `--subject` when the issue carries `bkit:auto`) is reused verbatim for the `dev` path — no second gate, no new trust surface. The `[skip ci]` Close commit that follows the squash merge is unaffected (it never carried the marker, so it never triggered the cloud workflow).

The `dev` path differs from the `feat/**` path in three load-bearing ways, all addressed here:

1. **No open PR.** On `dev`, `head_branch=dev` and there is no `feat/{FID}` branch and no PR body to parse for `bkit:issue` / `bkit:fid` markers. FID must be recovered from the **squash-merge commit scope** (`feat(363-widen-bkit-cloud-trigger): ...` — the PR title convention, which the squash `--subject` preserves verbatim).
2. **Success is a no-op, not ship.** On `feat/**`, CI success -> `/bkit-ship` (merge the PR). On `dev`, the merge already happened — CI success means "post-merge regression check passed" and requires no action. Only CI **failure** dispatches `/bkit-debug`.
3. **Cross-session loop bound.** A `dev`-triggered `/bkit-debug` pushes a fix to `dev` via a `fix/{FID}` PR; if that fix fails CI, another `workflow_run` fires, dispatching another `/bkit-debug` — a feedback loop with no natural terminator. Per-session `MAX_NORMAL_ATTEMPT` resets on each dispatch, so it cannot bound the cross-session loop. This plan adds a **`MAX_DEV_DISPATCH_ATTEMPTS` cap** (default 3 distinct failed dev CI SHAs per FID), enforced AND written in the `bkit-cloud.yml` ctx step at the dispatch decision point.

**Success Criteria:**

- `bkit-cloud.yml`'s `workflow_run` trigger fires on `feat/**`, `fix/**`, and `dev` CI completion (never `main`); the existing `feat/**` pre-merge routing (success -> ship, failure -> debug) is preserved for `feat/**` specifically. `fix/**` is a newly-folded surface (see "Breaking Changes" — `fix/**` PRs now follow the same ship/debug routing as `feat/**`).
- On `dev` CI **failure**, the cloud orchestrator recovers the FID from the squash-merge commit scope, runs a sound stale-run guard (Option A — CI-run recency, NOT a git-tip comparison), re-checks `bkit:auto` on the issue (kill switch), enforces the `MAX_DEV_DISPATCH_ATTEMPTS` cap, writes the `dev-dispatch` counter row to `status.jsonl` (committed to dev with `[skip ci]` so it persists across runs), and dispatches `/bkit-debug {FID}`. On `dev` CI **success**, the run exits as a no-op (`::notice::`, `skip=true`).
- The free-tier gate (`bkit [auto route]` in `head_commit.message`) admits `dev`-triggered runs by construction — `bkit-ship` threads the marker onto the squash `--subject` when the issue is `bkit:auto`-labeled. No separate gate path.
- Cross-session debug loop on `dev` is bounded: after `MAX_DEV_DISPATCH_ATTEMPTS` (3) distinct failed dev CI SHAs for one FID, subsequent `dev`-CI-fail dispatches exit as no-ops with an operator-review `::notice::`.
- Concurrency on `dev` uses `cancel-in-progress: false` for `head_branch == 'dev'`. Per documented GHA behaviour, a superseding dev run is **queued** (one pending; older pendings are cancelled as newer ones arrive) — it is NOT dropped. The queued run re-evaluates the cap at its ctx step, so the operator does NOT need to manually re-trigger. `feat/**`/`fix/**` keep `cancel-in-progress: true` (latest-wins, current behaviour).
- `bkit-auto.md` accepts a bare FID slug as `{ARG}` (CI_DEV mode) — skips the PR-lookup / PR-OPEN / `feat/`-prefix asserts, sets `BRANCH=dev`, derives `ISSUE_ID` from the FID numeric prefix, omits the actions-link from the start comment (no live PR run to link).
- `bkit-debug.md` requires **no code changes** for the dev path. The existing 3-way worktree fallback at `bkit-debug.md:318-327` already creates `fix/{FID}` off `origin/dev` when `feat/{FID}` is absent (the post-merge condition); `PUSH_MODE=LOCAL` auto-detects at Step 1.6 (no open `fix/{FID}` PR -> LOCAL). The dead `CI_DEV` mode proposed for `bkit-debug` in v1 is dropped entirely — the `dev-dispatch` counter write lives in the cloud ctx step (the component that actually knows `BRANCH=dev`).
- All changes mirrored to `.claude/`, `.cursor/`, `.opencode/`; version bumped 4.10.0 -> 4.11.0; CHANGELOG entry added; `bkit-cloud.yml` consumer mirror regenerated.

**Related Issues:**

- `#363 — Widen bkit-cloud trigger to post-merge dev CI (open)` — this plan.
- `#119 — CI auto-router (cloud dispatch on CI completion)` — established the `workflow_run` trigger; this plan extends its branch filter.
- `#397 — Cross-surface same-FID arbitration` — OUT OF SCOPE here. The cross-surface race (a dispatched build vs the auto-ship it triggers, or two cloud dispatches for the same FID from different trigger surfaces) remains owned by #397's orchestrator-level stale-run guard + status.jsonl lock.
- `#80 — audit-logs-ship migration` — DROPPED from this plan's scope. The `debug-fetch` runtime-log migration lives in the triggered debug's own workflow, independent of the trigger widening.

---

## Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You do NOT need to read the rest of this plan.** Focus here. The agent handles the rest.

### Narrative

A developer ships a `feat/{FID}` PR via `/bkit-ship`; the squash-merge lands on `dev` carrying the `bkit [auto route]` marker (because the issue is `bkit:auto`-labeled). `/bkit-ship` Step 13 then pushes a trailing `docs({FID}): ship DONE bkit [skip ci]` close commit onto `dev` while post-merge CI is still running — so by the time that CI completes, `dev`'s tip is the close commit (not the squash-merge). Post-merge CI on `dev` runs against the squash-merge SHA. If it goes green, nothing happens (the regression check passed). If it goes red, the cloud orchestrator automatically dispatches `/bkit-debug {FID}` — the developer gets an autonomous debug session against the post-merge failure without lifting a finger. If the debug's fix also fails CI, another debug dispatches; after 3 distinct failed dev CI SHAs for the same FID, further dispatches go silent with an operator-review notice.

### Success Criteria

1. `workflow_run` fires on `dev` CI completion (in addition to `feat/**`, `fix/**`); `main` is never a trigger.
2. `dev` CI **failure** -> `/bkit-debug {FID}` dispatched; `dev` CI **success** -> no-op exit (`skip=true`, `::notice::`).
3. FID recovered from squash-merge commit scope (`feat(363-widen-bkit-cloud-trigger): ...`) when no open PR exists; `bkit:auto` re-checked on the issue as kill switch.
4. Free-tier gate admits `dev`-triggered runs via the existing `bkit [auto route]` marker — no second gate path.
5. Cross-session loop bounded at 3 distinct failed dev CI SHAs per FID (`MAX_DEV_DISPATCH_ATTEMPTS`); the cap is checked AND written in the cloud ctx step before dispatch (counter row committed to dev with `[skip ci]` so it survives early `/bkit-debug` crashes).

### Key Edge Cases

- **Squash-merge subject without scope:** A non-conventional commit (manual `git push` to `dev`, or a `chore(...)` scope that doesn't match `{FID}` slug regex) -> FID recovery fails -> fail-safe no-op exit (`::notice::`, `skip=true`). No dispatch, no crash.
- **`[skip ci]` Close commit:** The `docs({FID}): ship DONE bkit [skip ci]` close commit (`bkit-ship.md:1206`) that follows the squash merge carries `[skip ci]` -> CI doesn't run -> no `workflow_run` event. Only the squash-merge commit (which DOES carry `bkit [auto route]` and does NOT carry `[skip ci]`) triggers CI -> the cloud gate matches. No interaction.
- **Two dev pushes fail CI near-simultaneously:** Concurrency group `bkit-auto-dev` with `cancel-in-progress: false` -> the in-flight debug runs to completion; the superseding run is **queued** (GHA queues one pending with `cancel-in-progress: false`; older pendings are cancelled as newer ones arrive). The queued run starts when the in-flight finishes and re-evaluates the cap at its ctx step (which sees the now-incremented `dev-dispatch` count). The operator does NOT need to manually re-trigger.
- **Stale dev CI (Option A guard):** A CI run for an old `dev` SHA completes after a newer feature push has landed. The guard queries the most recent COMPLETED CI run on `dev` via `gh run list --branch dev --workflow CI --status completed`; if that run's `headSha` differs from `workflow_run.head_sha`, the run is stale -> `skip=true`. Close commits carry `[skip ci]` so they never appear in `gh run list` — the most-recent-completed-run head is always a feature/fix commit, which is exactly the staleness signal. (A naive `git rev-parse origin/dev` comparison is unsound: the close commit advances dev's tip during the CI run, guaranteeing a mismatch on every legitimate dispatch — see Review 3 F1.)
- **FID from merged PR (fallback):** If the squash-merge scope is missing/malformed but the merge commit is linked to a PR, recover FID from `gh api repos/$GITHUB_REPOSITORY/commits/$HEAD_SHA/pulls` -> PR body `bkit:fid` marker. Primary path is commit-scope; this is the fallback.
- **`bkit:auto` revoked mid-loop:** Issue label removed between dispatches -> kill switch fires on the next ctx-step label re-check -> `skip=true`. Halts the loop even under the cap.
- **Docs-only diff (Vercel cancel):** The dev path routes `dev CI failure -> /bkit-debug`. This is only correct for docs-only diffs if the consumer's `ci.yml` "Await Vercel Deployment" step neutralises a Vercel-CANCELED build (skip e2e, stay green) rather than red-ing it. If a consumer reds on Vercel-CANCELED, every docs-only squash-merge to dev false-dispatches `/bkit-debug` and burns cap budget. This invariant is asserted in `plan-input.md` and must be manually verified per target consumer (see Task 10).

### Concrete Example

**Role:** bkit consumer repo operator (e.g. `app-gether-life`).
**Starting state:** Issue #142 is `bkit:auto`-labeled. PR #500 (`feat/142-add-auth`) passed pre-merge CI and is about to be squash-merged by `/bkit-ship`.

1. `/bkit-ship` Step 6 squash-merges PR #500 to `dev` with subject `feat(142-add-auth): add OAuth flow (#500) bkit [auto route]` (the `bkit [auto route]` suffix threaded by Step 5 because the issue carries `bkit:auto`).
2. `/bkit-ship` Step 13 commits `docs(142-add-auth): ship DONE bkit [skip ci]` and pushes it to `dev` (`bkit-ship.md:1206,1211`) — no CI, no cloud trigger. `dev`'s tip is now this close commit.
3. Post-merge CI runs on `dev` against the squash-merge SHA (triggered by the Step 6 push). It **fails** (a post-merge-only integration test broke).
4. `workflow_run` fires. The gate matches (`bkit [auto route]` is in the squash-merge subject). The ctx step: `BRANCH=dev` -> dev path -> `CONCLUSION=failure` -> `PHASE=debug`. FID from commit scope `142-add-auth` -> `ISSUE=142`. Stale-run guard (Option A): `gh run list --branch dev --workflow CI --status completed` -> most-recent completed run's headSha == the squash-merge SHA == `workflow_run.head_sha` -> not stale. Loop cap: distinct `dev-dispatch` headSha count for `142-add-auth` = 0 < 3 -> proceed. Kill switch: `bkit:auto` still on #142 -> proceed. Write `dev-dispatch` row (headSha = squash-merge SHA), commit `docs(142-add-auth): dev-dispatch telemetry [skip ci]`, push to dev. Set `phase=debug arg=142-add-auth`.
5. Dispatch `/bkit-auto debug 142-add-auth`. `bkit-auto` Step 1.5: `ARG=142-add-auth` (non-numeric) -> `MODE=CI_DEV`, `FID=142-add-auth`, `ISSUE_ID=142`, `BRANCH=dev`. Steps 6-10 gated on `MODE=CI` (skipped). Dispatch `/bkit-debug 142-add-auth`.
6. `bkit-debug` Step 2 worktree: existing 3-way fallback (`bkit-debug.md:318-327`) — `feat/142-add-auth` absent remotely (deleted on squash-merge) -> create `fix/142-add-auth` off `origin/dev`. Step 1.6: `gh pr list --head fix/142-add-auth --base dev` -> no PR -> `PUSH_MODE=LOCAL`. Debug runs, fixes, opens PR `fix/142-add-auth -> dev`, merges it.
7. The fix-merge push triggers CI on `dev` again (new headSha). If green -> no dispatch (success = no-op). If red -> steps 4-6 repeat, cap's distinct-headSha count increments to 1.
8. After 3 distinct failed dev CI SHAs (cap reached), the 4th `dev`-CI-fail ctx step reads distinct count = 3 >= `MAX_DEV_DISPATCH_ATTEMPTS` -> `::notice::FID 142-add-auth exhausted 3 dev-triggered debug dispatches — operator review required.` -> `skip=true`.

### Derived Test Matrix

<!-- prettier-ignore -->
| # | Behaviour | How to verify |
| --- | --- | --- |
| T1 | `workflow_run.branches` includes `dev` | `yq` / `jq` parse of `bkit-cloud.yml` `on.workflow_run.branches` contains `dev` |
| T2 | `cancel-in-progress` is `false` for `dev`, `true` otherwise | Expression `${{ github.event.workflow_run.head_branch != 'dev' }}` present; bash unit: `head_branch=feat/foo` -> true (cancel preserved); `head_branch=dev` -> false (queue) |
| T3 | Ctx step derives FID from commit scope on `dev` (no PR) | Bash unit: feed a `feat(363-widen-bkit-cloud-trigger): ...` subject via `$COMMIT_MSG` env -> assert `FID=363-widen-bkit-cloud-trigger` |
| T4 | Ctx step routes `dev` success -> skip, failure -> debug | Bash unit: `CONCLUSION=success` + `BRANCH=dev` -> `skip=true`; `CONCLUSION=failure` + `BRANCH=dev` -> `phase=debug` |
| T5 | Ctx step enforces `MAX_DEV_DISPATCH_ATTEMPTS` cap (distinct headSha count) | Bash unit: seed status.jsonl with 3 `dev-dispatch` rows for 3 distinct headSha values -> assert `skip=true` + notice; 3 rows for the SAME headSha -> assert `skip=false` (counts distinct cycles) |
| T6 | `bkit-auto` accepts non-numeric ARG as FID (CI_DEV mode) | Bash unit: `ARG=363-widen-bkit-cloud-trigger` -> `MODE=CI_DEV`, no `gh pr view` call; `ISSUE_ID=363` derived |
| T7 | `bkit-auto` CI_DEV skips `PR_STATE != OPEN` + `feat/` prefix asserts | Read: Steps 7 and 10 gated on `MODE=CI` only; Step 9 (PR-body extraction) also gated |
| T8 | `bkit-debug` existing fallback creates `fix/{FID}` off `origin/dev` | Read: `bkit-debug.md:318-327` fallback path verified (no code change required) |
| T9 | `bkit-ship` squash `--subject` includes `bkit [auto route]` when `bkit:auto` | Bash unit: `LABELS` contains `bkit:auto` -> subject ends with `bkit [auto route]` |
| T10 | `MAX_DEV_DISPATCH_ATTEMPTS=3` in counter-bus-config | `grep MAX_DEV_DISPATCH_ATTEMPTS .bkit/scripts/bkit-counter-bus-config.sh` |
| T11 | Mirrors regenerated (`.claude/`, `.cursor/`, `.opencode/` in sync) | `pnpm bkit upgrade --dry-run` produces no diff on canonical files |
| T12 | Version bumped 4.10.0 -> 4.11.0 | `jq -r .version package.json` = `4.11.0`; `grep pinnedVersion .bkit/version` = `4.11.0` |

---

## Breaking Changes & Naming Review

**`fix/**` surface newly routed (behaviour change — documented, not a regression).** Today `workflow_run.branches: ['feat/**']` excludes `fix/**`, so a `/bkit-debug`-created `fix/{FID}` PR's green CI does NOT auto-dispatch `/bkit-ship` — the debug orchestrator owns the merge (LOCAL direct push, or waits for manual merge). After this plan, `fix/**` CI success -> `workflow_run` -> ctx step `else` branch -> `gh pr list --head fix/{FID} --base dev` -> PR found -> `phase=ship` -> cloud auto-merges the fix PR. This is the intended folding (matches the routing table), but it IS a behaviour change to `/bkit-debug`'s fix-PR lifecycle: `/bkit-debug`-created fix PRs will now be auto-merged by the cloud on green CI. The `feat/**` pre-merge path is preserved byte-for-byte; the "preserved" claim is scoped to `feat/**` only.

**No other breaking changes.** The `dev` path is purely additive (a new branch in the trigger filter + ctx step branch). Existing consumer repos without `bkit:auto`-labeled issues see no behaviour change (the free-tier gate already blocks unmarked runs).

**Naming:**

- `CI_DEV` mode (in `bkit-auto.md` only) — consistent with existing `CI` (pre-merge, PR-backed) and `BRIEF` (tracker-dispatched) modes. The `_DEV` suffix denotes the `dev` branch origin. NOTE: `CI_DEV` exists ONLY in `bkit-auto`; it is deliberately NOT propagated to `bkit-debug` (the dead cross-skill signal from v1 is dropped — `bkit-debug` has no way to receive it and does not need it).
- `MAX_DEV_DISPATCH_ATTEMPTS` — consistent with `MAX_DEBUG_ATTEMPT`, `MAX_NORMAL_ATTEMPT`, `MAX_SOAK_ATTEMPT`. The `_DISPATCH` clarifier distinguishes cross-session cloud dispatches from in-session remediation attempts. Consumed by `bkit-cloud.yml` ctx step (lives under a `# bkit-cloud.yml counters` section header, NOT the bkit-debug section).
- `dev-dispatch` status.jsonl row type — consistent with existing `workflow-started`, `step-done` row types. Additive, NDJSON-merge-safe.

---

## Open Questions & Assumptions

**Settled in-plan (no blocker):**

1. **Cross-session loop cap mechanism.** Decision: **cap = 3 distinct failed dev CI SHAs per FID, all-time, enforced AND written in `bkit-cloud.yml` ctx step at the dispatch decision point.** The cap counts DISTINCT `headSha` values among `dev-dispatch` rows for the FID (not total rows), so a dual-job race — both the claude and opencode jobs writing a row for the same `workflow_run` event — counts as one cycle. The counter row is committed to `dev` with `[skip ci]` (so it persists across runs and survives early `/bkit-debug` crashes — v1's write-after-dispatch undercount defect is closed by writing BEFORE dispatch). Reader and writer are the SAME component (the cloud ctx step) — no cross-skill `MODE` propagation needed (v1's dead `CI_DEV`-in-`bkit-debug` signal is dropped). Window is all-time (not sliding) — simpler, safer; operator reset = delete the rows or bump `MAX_DEV_DISPATCH_ATTEMPTS`. Rationale: per-session `MAX_NORMAL_ATTEMPT` resets on each cloud dispatch and cannot bound a `dev` feedback loop; operator vigilance is unreliable for 24/7 cloud dispatch. 3 matches `MAX_DEBUG_ATTEMPT` (in-session escalation threshold), giving symmetry: 3 dispatched cycles, each with up to 3 in-session remediations, before the cap silences further dispatches.

2. **Stale-run guard (Option A — CI-run recency).** Decision: **query the most recent COMPLETED CI run on `dev` via `gh run list`; skip only if its `headSha` differs from `workflow_run.head_sha`.** Justification: `/bkit-ship` Step 13 pushes `docs({FID}): ship DONE bkit [skip ci]` to `dev` DURING the dev CI run, so by the time CI completes and the cloud workflow boots, `dev`'s tip is the close commit — a naive `git rev-parse origin/dev` comparison would mismatch on EVERY legitimate dispatch and suppress the feature entirely (Review 3 F1, CRITICAL). Close commits carry `[skip ci]` so they never trigger CI and never appear in `gh run list`; only feature/fix commits appear. The most-recent-completed-run head is therefore the latest feature commit that ran CI — exactly the staleness signal intended. Options B (walk back past bookkeeping commits) is subject-convention-dependent and fragile; Option C (drop the guard, rely on cap + kill-switch) loses defence-in-depth. Option A keeps defence-in-depth AND is sound. If `gh run list` returns empty (CI workflow name mismatch, permissions issue), the guard fails OPEN (proceeds with dispatch) — better to dispatch than to silently skip.

3. **Concurrency on `dev`: queue, not cancel.** Decision: **`cancel-in-progress: ${{ github.event.workflow_run.head_branch != 'dev' }}`.** For `dev`, `false` (in-flight debug runs to completion; superseding run is QUEUED — GHA queues one pending with `cancel-in-progress: false`; older pendings are cancelled as newer ones arrive; the queued run re-evaluates the cap at its ctx step when it starts). The operator does NOT need to manually re-trigger. For `feat/**`/`fix/**`, `true` (latest-wins, current behaviour, no regression). Rationale: cancelling an in-flight `/bkit-debug` mid-flight risks leaving status.jsonl / worktree lock in an inconsistent state; the queued-run-re-evaluates-cap flow bounds the loop cleanly.

4. **FID recovery primary vs. fallback.** Decision: **primary = squash-merge commit scope regex** (`^\w+\(([0-9]+-[a-z0-9-]+)\):` on the commit message, passed via `env:` NOT inline `${{ }}`); **fallback = `gh api repos/$GITHUB_REPOSITORY/commits/$HEAD_SHA/pulls` -> PR body `bkit:fid` marker.** The commit-scope path is the common case (all bkit PR titles follow `feat({FID}): ...`), requires no extra API call, and fails safe (no match -> no-op).

5. **Counter write location.** Decision: **written by the cloud ctx step (both jobs), immediately before dispatch, committed to dev with `[skip ci]`.** NOT written by `/bkit-debug` (v1's design had no CI_DEV signal in bkit-debug, making the cap silently inert). The ctx step already knows `BRANCH=dev`, the FID, and the `workflow_run.head_sha`. Reader and writer co-located. F3 (undercount on early crash) closed: the write precedes dispatch.

**Assumptions:**

- The squash-merge `--subject` set by `bkit-ship` Step 5 preserves the PR title verbatim, which follows `feat({FID}): ...` convention. This is already the case (`bkit-ship.md:634-635`: `--subject "$(gh pr view {PR_NUMBER} --json title --jq .title) (#{PR_NUMBER})"`).
- `workflow_run.head_commit.message` on a `dev` push is the push's HEAD commit message — i.e. the squash-merge subject. This is GHA's documented behaviour for `workflow_run` events.
- CI on `dev` runs on every push (the consumer repo's CI workflow triggers on `push: branches: [dev]`). This is the existing contract in `docs/deployments.md`.
- `fix/{FID}` is the established debug-fix branch convention (referenced in `bkit-ship` Step 5 line 630, git rules line 31). The existing `bkit-debug.md:318-327` fallback already creates it off `origin/dev`.
- The consumer's CI workflow is named "CI" (so `gh run list --workflow CI` resolves it). This matches `bkit-cloud.yml`'s `workflows: [CI]` trigger and `bkit-ship.md:610`'s `--workflow CI` idiom.

---

## Alternative Approaches & Recommendations

**Option B (rejected): Separate `workflow_run` event for `dev` with a second gate path.** Adding a second `if:` condition or a separate job for `dev`-triggered runs, with its own marker or label check. Rejected because Option A reuses the existing `bkit [auto route]` gate by construction (the squash-merge subject already carries it when `bkit:auto`-labeled), so a second gate is redundant complexity. Option A is strictly simpler.

**Option C (rejected): `workflow_dispatch`-only for `dev` failures.** Require the operator to manually trigger `/bkit-debug` when `dev` CI fails. Rejected — this is the status quo and the motivation for #363. The whole point is autonomous post-merge failure routing.

**Option D (rejected): Sliding-window loop cap (e.g. 3 per 24h).** More complex (requires timestamp filtering in the ctx step), offers marginal benefit over all-time cap. If an FID accumulates 3 dispatched debug cycles ever, something is structurally wrong and an operator should review. All-time cap with manual reset is simpler and safer.

**Stale-run guard Option B (rejected): walk back past bkit bookkeeping commits.** From `origin/dev`, skip trailing commits whose subject matches `^(docs|chore)\(.*\): .*\[skip ci\]`, then compare. More fragile (subject-convention dependent) than Option A and stays local-only. Option A's `gh run list` is more robust.

**Stale-run guard Option C (rejected): drop the guard, rely on cap + kill-switch.** The guard is defence-in-depth, not load-bearing, once the loop cap exists. But dropping it entirely loses the staleness check. Option A keeps defence-in-depth AND is sound.

**Recommendation:** Option A as specified, with stale-run guard Option A. The design is the minimal change that closes the post-merge blind spot without introducing a new trust surface, a new gate, or a new trust marker.

---

## Out of Scope

- **`main` branch trigger.** Production trunk never auto-dispatches a cloud agent. `main` stays manual-only (`workflow_dispatch`).
- **Cross-surface same-FID arbitration (#397).** The race between a dispatched build and the auto-ship it triggers (or two cloud dispatches for the same FID from different trigger surfaces) remains owned by #397's orchestrator-level stale-run guard + status.jsonl lock. This plan's `dev` concurrency group (`bkit-auto-dev`) collapses all `dev`-triggered runs into one group — FID-level mutual exclusion on `dev` is handled by `/bkit-debug` Step 1's `.lock` file (already exists), not by the GHA concurrency layer (which can't see the FID at group-evaluation time).
- **bkit-ship Step 10 "Verify Deploy" / ship-verify block contract / preflight advisories / renumber cascade.** DROPPED per issue comments. The ship-verify work is a separate concern.
- **#80 audit-logs-ship migration.** Lives in the triggered debug's `debug-fetch` independently. Not coupled to the trigger widening.
- **Webhook-based tracker triggers (Linear bridge, GitHub `issues: labeled`).** Phase 2 work, unrelated to the CI-driven trigger surface.

---

## Suggested Scope Expansion

None. This plan is tightly scoped to the trigger widening + its immediately necessary machinery (FID recovery, routing, concurrency, loop bound). No adjacent features are bundled.

---

## Security & Privacy

**CI Auto-Route Trust surface — `dev` push trigger (new):**

The existing trust model (documented in `docs/security.md` § CI Auto-Route Trust) gates cloud dispatches on the `bkit [auto route]` marker in the HEAD commit message, which is only present when `bkit-ship` threads it (gated on the `bkit:auto` issue label). This plan extends the same gate to `dev`-triggered runs — **no new trust marker, no new label, no new gate path.** The `dev` path adds one new derivation: FID from the squash-merge commit scope. The FID is validated against the existing slug allowlist (`^[0-9]+-[a-z0-9-]+$` for GitHub tracker) before use. A malformed or missing scope -> fail-safe no-op exit (no dispatch, no crash, no information leak). Dynamic values (`head_commit.message`, `head_sha`) are passed through the `env:` block (NOT inline `${{ }}` into bash) — injection-safe (Review 1 M3).

**Kill switch preserved:** The `bkit:auto` label re-check in the ctx step (live revocation) applies identically to `dev`-triggered runs. Removing the label mid-loop halts further dispatches even under the cap.

**Loop-bound as cost control:** `MAX_DEV_DISPATCH_ATTEMPTS=3` bounds cloud-agent spend per FID on the `dev` path. The counter is written BEFORE dispatch (at the decision point) and committed to `dev`, so an early `/bkit-debug` crash does not undercount — the cap cannot be silently exceeded by repeated early crashes (Review 3 F3 closed). Without it, a stuck `dev` feedback loop could dispatch unbounded paid agent sessions. The cap is a security/cost control, not just a quality-of-life feature.

**No new secrets, no new permissions.** The `bkit-cloud.yml` jobs already have `contents: write`, `pull-requests: write`, `issues: write`, `actions: read`, `id-token: write` (claude job). The `dev` path uses the same permissions (read merge-commit via `gh api`, write `dev-dispatch` row + telemetry commit via the existing `contents: write`, dispatch `/bkit-debug`). No scope expansion.

---

## Pre-Flight / Dependencies (Gate 1)

- [ ] `bkit-cloud.yml` template is at `.bkit/templates/.github/workflows/bkit-cloud.yml` (canonical source; `.github/workflows/bkit-cloud.yml` is the installed copy). The ctx step `shared-deriv` block is a `# bkit:start shared-deriv` / `# bkit:end shared-deriv` managed block, duplicated across both jobs (`run`/claude at lines 190-214 and `opencode` at lines 325-344). Both copies must be extended identically. The `if [ "$BRANCH" = "dev" ]` guard is inserted AFTER the `case "$CONCLUSION"` routing and BEFORE the `gh pr list` PR-lookup (which moves into the `else` branch); the `shared-deriv` markers extend upward to encompass the new guard.
- [ ] The existing ctx step `env:` block carries `GH_TOKEN, EVENT, IN_PHASE, IN_ISSUE, CONCLUSION, BRANCH` only. `COMMIT_MSG` and `HEAD_SHA` must be ADDED to the `env:` block (injection-safe). `$GITHUB_WORKSPACE` and `$GITHUB_REPOSITORY` (GHA-provided) are used for sourcing `bkit-counter-bus-config.sh` and `gh api` repo path — `$REPO_ROOT` is NOT defined in the ctx step (v1 defect).
- [ ] `bkit-ship.md` Step 5 already derives `AUTO_ROUTE_SUFFIX` from `bkit:auto` label (line 626) and threads it into the sync-merge commit (line 630). The squash `--subject` (lines 634-635) does NOT yet include it — this is the Option A change point.
- [ ] `bkit-auto.md` Step 1.5 (line 85) assumes `MODE=CI` -> `PR_NUMBER="$ARG"` (numeric). The CI_DEV extension discriminates on ARG shape (numeric = CI/PR, non-numeric = CI_DEV/FID). Steps 6-10 (lines 86-118) and Step 9 (lines 93-117, PR-body extraction) must be gated on `MODE=CI`.
- [ ] `bkit-debug.md` Step 2 worktree fallback (`bkit-debug.md:318-327`) ALREADY creates `fix/{FID}` off `origin/dev` when `feat/{FID}` is absent — the post-merge condition. NO code change needed in `bkit-debug` (v1's redundant `CI_DEV` branch-selection edit is dropped).
- [ ] `bkit-counter-bus-config.sh` bkit-debug section is at lines 16-19. `MAX_DEV_DISPATCH_ATTEMPTS` goes under a NEW `# bkit-cloud.yml counters` section header (it is consumed by the cloud ctx step, not bkit-debug).
- [ ] `bkit-ship.md:1206` close commit is `docs({FID}): ship DONE bkit [skip ci]` (verified) — NOT `chore({FID}): merge-pr attempt N` (v1's misidentifier; that is a pre-merge per-attempt telemetry commit on `feat/{FID}`, line 655, and does NOT land on `dev`).
- [ ] Consumer repos (`app-gether-life`, `visitfrasercoast-com`) run CI on `push: branches: [dev]` — verify in their CI workflow (documented in `docs/deployments.md`).

---

## Data Schema Integration

**New status.jsonl row type: `dev-dispatch`**

```json
{
  "type": "dev-dispatch",
  "workflow": "auto",
  "at": "2026-07-29T14:23:00Z",
  "fid": "363-widen-bkit-cloud-trigger",
  "headSha": "abc1234",
  "parentSha": "def5678"
}
```

- **Written by:** the `bkit-cloud.yml` ctx step (both jobs), immediately BEFORE dispatching `/bkit-debug`, committed to `dev` as `docs({FID}): dev-dispatch telemetry [skip ci]` (so the row persists across runs). `headSha` = `workflow_run.head_sha` (the squash-merge / CI-failed SHA — the correct "which CI run failed" record); `parentSha` = `git rev-parse origin/dev` (dev tip at dispatch time, for correlation).
- **Read by:** `bkit-cloud.yml` ctx step (both jobs), to count prior dev-triggered dispatch CYCLES for the FID: distinct `headSha` values among matching rows — `[.[] | select(.type=="dev-dispatch" and .fid==$f) | .headSha] | unique | length` (so a dual-job race writing two rows for the same event headSha counts as one cycle).
- **Merge-safe:** NDJSON, `.jsonl merge=union` in `.gitattributes` (already configured). Additive row, no collision with existing types.
- **Location:** `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (same file as all other workflow telemetry for the FID). The YYYYMM is resolved by glob: `ls -d docs/plans/*/logs/"$FID"/ 2>/dev/null | head -1`; if absent, `docs/plans/$(date -u +%Y%m)/logs/$FID/` is created.

**No schema migration.** Existing rows (`workflow-started`, `step-done`) are unchanged. The `dev-dispatch` row is purely additive.

---

## Architecture & Component Changes

### `.bkit/templates/.github/workflows/bkit-cloud.yml`

1. **Header comment (lines 14-19) — update to document the `dev` post-merge trigger surface:**

   ```yaml
   # Phase 1 wires three trigger surfaces:
   #   - workflow_run (CI completion on feat/**): success -> ship, failure -> debug
   #     (preserves the previous bkit-ci-router behaviour exactly).
   #   - workflow_run (CI completion on fix/**): success -> ship, failure -> debug
   #     (newly folded — fix-PR green CI now auto-merges via the cloud).
   #   - workflow_run (CI completion on dev): success -> no-op (regression check passed),
   #     failure -> /bkit-debug {FID} (FID recovered from squash-merge commit scope;
   #     loop-bounded by MAX_DEV_DISPATCH_ATTEMPTS). [skip ci] close commits never trigger CI.
   #   - workflow_dispatch: pick ANY phase (ship|debug|design|plan|build) for an issue.
   ```

2. **Trigger filter (line 31):**

   ```yaml
   # Before:
   branches: ["feat/**"]
   # After:
   branches: ["feat/**", "fix/**", "dev"]
   ```

3. **Concurrency (lines 73-74):**

   ```yaml
   # Before:
   group: bkit-auto-${{ inputs.issue || github.event.workflow_run.head_branch }}
   cancel-in-progress: true
   # After:
   group: bkit-auto-${{ inputs.issue || github.event.workflow_run.head_branch }}
   cancel-in-progress: ${{ github.event.workflow_run.head_branch != 'dev' }}
   ```

   For `dev`, the group resolves to `bkit-auto-dev`. `cancel-in-progress: false` means an in-flight debug runs to completion and a superseding run is QUEUED (GHA queues one pending; older pendings cancelled as newer arrive); the queued run re-evaluates the cap at its ctx step. `feat/**`/`fix/**` keep `true` (latest-wins). `workflow_dispatch` (`head_branch` empty, `'' != 'dev'` -> true) keeps latest-wins — no regression.

4. **Ctx step `env:` block (both jobs) — ADD `COMMIT_MSG` and `HEAD_SHA` (injection-safe; referenced as `$vars` in bash, NOT inline `${{ }}`):**

   ```yaml
   env:
     GH_TOKEN: ${{ github.token }}
     EVENT: ${{ github.event_name }}
     IN_PHASE: ${{ inputs.phase }}
     IN_ISSUE: ${{ inputs.issue }}
     CONCLUSION: ${{ github.event.workflow_run.conclusion }}
     BRANCH: ${{ github.event.workflow_run.head_branch }}
     COMMIT_MSG: ${{ github.event.workflow_run.head_commit.message }}
     HEAD_SHA: ${{ github.event.workflow_run.head_sha }}
   ```

   (`$GITHUB_WORKSPACE` and `$GITHUB_REPOSITORY` are GHA-auto-provided — no `env:` entry needed.)

5. **Ctx step `run:` block (both jobs) — insert the `dev` branch AFTER the `case "$CONCLUSION"` routing and BEFORE the `gh pr list` PR-lookup. The PR-lookup moves into the `else` branch. The `# bkit:start shared-deriv` / `# bkit:end shared-deriv` markers extend upward to encompass the new `if [ "$BRANCH" = "dev" ]` guard.**

   ```bash
   set -euo pipefail
   if [ "$EVENT" = "workflow_dispatch" ]; then
     PHASE="$IN_PHASE"
     ARG="$IN_ISSUE"
     FID="$IN_ISSUE"
   else
     # Route by conclusion.
     case "$CONCLUSION" in
       success) PHASE=ship ;;
       failure) PHASE=debug ;;
       *) echo "::notice::Non-terminal CI conclusion '$CONCLUSION' — no-op exit."; echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0 ;;
     esac

     # bkit:start shared-deriv
     if [ "$BRANCH" = "dev" ]; then
       # Post-merge dev CI — no open PR. Recover FID from squash-merge commit scope.
       # dev success = regression check passed = no-op (the merge already happened).
       if [ "$PHASE" = "ship" ]; then
         echo "::notice::dev CI passed — post-merge regression check OK, no-op exit."
         echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
       fi
       # PHASE=debug below.
       # Primary: parse FID from commit scope: feat(363-widen-bkit-cloud-trigger): ...
       FID=$(printf '%s' "$COMMIT_MSG" | grep -oE '^\w+\(([0-9]+-[a-z0-9-]+)\):' | sed -E 's/^\w+\(([^)]+)\):/\1/' | head -1 || true)
       if [ -z "$FID" ]; then
         # Fallback: gh api merge-commit linked PR -> PR body bkit:fid marker.
         PR_BODY=$(gh api "repos/${GITHUB_REPOSITORY}/commits/${HEAD_SHA}/pulls" --jq '.[0].body // empty' 2>/dev/null || echo "")
         FID=$(printf '%s' "$PR_BODY" | grep -oE 'bkit:fid=[^[:space:]>]+' | sed 's/bkit:fid=//' | head -1 || true)
       fi
       if [ -z "$FID" ] || ! [[ "$FID" =~ ^[0-9]+-[a-z0-9-]+$ ]]; then
         echo "::notice::Cannot derive FID from dev commit scope or linked PR — no-op exit (fail-safe)."
         echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
       fi
       ISSUE=$(printf '%s' "$FID" | grep -oE '^[0-9]+')
       ARG="$FID"
       # Stale-run guard (Option A): HEAD_SHA is current iff it is the headSha of the most
       # recent COMPLETED CI run on dev. Close commits carry [skip ci] so they never appear
       # in gh run list; only feature/fix commits do — the most-recent-completed-run head is
       # exactly the staleness signal. (A git rev-parse origin/dev comparison is unsound:
       # /bkit-ship Step 13 pushes docs({FID}): ship DONE bkit [skip ci] to dev during the
       # dev CI run, so dev's tip is the close commit by the time the cloud workflow boots.)
       LATEST_CI_SHA=$(gh run list --branch dev --workflow CI --status completed --limit 10 \
         --json headSha --jq '.[0].headSha // empty' 2>/dev/null || echo "")
       if [ -n "$LATEST_CI_SHA" ] && [ "$HEAD_SHA" != "$LATEST_CI_SHA" ]; then
         echo "::notice::Stale dev CI (head_sha=$HEAD_SHA, latest completed dev CI head=$LATEST_CI_SHA) — no-op exit."
         echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
       fi
       # Loop cap: count DISTINCT headSha values among prior dev-dispatch rows for this FID
       # (so a dual-job race writing two rows for the same event headSha counts as one cycle).
       . "$GITHUB_WORKSPACE/.bkit/scripts/bkit-counter-bus-config.sh"
       STATUS_DIR=$(ls -d docs/plans/*/logs/"$FID"/ 2>/dev/null | head -1 || true)
       if [ -z "$STATUS_DIR" ]; then
         STATUS_DIR="docs/plans/$(date -u +%Y%m)/logs/$FID/"
       fi
       mkdir -p "$STATUS_DIR"
       STATUS_FILE="${STATUS_DIR}status.jsonl"
       DEV_COUNT=0
       if [ -f "$STATUS_FILE" ]; then
         DEV_COUNT=$(jq -s --arg f "$FID" '[.[] | select(.type=="dev-dispatch" and .fid==$f) | .headSha] | unique | length' "$STATUS_FILE" 2>/dev/null || echo 0)
       fi
       if [ "$DEV_COUNT" -ge "$MAX_DEV_DISPATCH_ATTEMPTS" ]; then
         echo "::notice::FID $FID exhausted $MAX_DEV_DISPATCH_ATTEMPTS dev-triggered debug dispatches — operator review required (delete dev-dispatch rows in status.jsonl to reset)."
         echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
       fi
       # Kill switch: re-check bkit:auto on the issue (live revocation).
       ISSUE_LABELS=$(gh issue view "$ISSUE" --json labels --jq '[.labels[].name] | join(",")' 2>/dev/null || echo "")
       if ! echo "$ISSUE_LABELS" | grep -q 'bkit:auto'; then
         echo "::notice::Issue #$ISSUE no longer carries bkit:auto — no-op exit (kill switch)."
         echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
       fi
       # Write the dev-dispatch counter row NOW (before dispatch) so an early /bkit-debug
       # crash does not undercount (F3). headSha = workflow_run.head_sha (the CI-failed SHA);
       # parentSha = dev tip at dispatch time.
       PARENT_SHA=$(git -C "$GITHUB_WORKSPACE" rev-parse origin/dev 2>/dev/null || echo "")
       jq -nc --arg t "$(date -u +%FT%TZ)" --arg f "$FID" --arg h "$HEAD_SHA" --arg p "$PARENT_SHA" \
         '{type:"dev-dispatch", workflow:"auto", at:$t, fid:$f, headSha:$h, parentSha:$p}' \
         >> "$STATUS_FILE"
       git -C "$GITHUB_WORKSPACE" add -- "$STATUS_FILE"
       git -C "$GITHUB_WORKSPACE" commit -m "docs($FID): dev-dispatch telemetry [skip ci]" -- "$STATUS_FILE"
       # Tolerate push race: if the parallel job (claude vs opencode) pushed first for the
       # same headSha, this push is rejected — the row is already on dev; continue to dispatch.
       git -C "$GITHUB_WORKSPACE" push origin dev || echo "::notice::dev-dispatch telemetry push rejected (parallel job won the race) — row already on dev for this headSha; continuing."
     else
       # Existing feat/** / fix/** path (PR-backed FID recovery) — unchanged.
       PR_NUMBER=$(gh pr list --head "$BRANCH" --base dev --state open --json number --jq '.[0].number // empty')
       if [ -z "$PR_NUMBER" ]; then
         echo "::notice::No open PR for branch $BRANCH — no-op exit."
         echo "skip=true" >> "$GITHUB_OUTPUT"
         exit 0
       fi
       ARG="$PR_NUMBER"
       PR_BODY=$(gh pr view "$PR_NUMBER" --json body --jq .body 2>/dev/null || echo "")
       ISSUE=$(echo "$PR_BODY" | grep -oE 'bkit:issue=#[0-9]+' | sed 's/bkit:issue=#//' | head -1 || true)
       FID=$(echo "$PR_BODY" | grep -oE 'bkit:fid=[^[:space:]>]+' | sed 's/bkit:fid=//' | head -1 || true)
       if [ -z "$ISSUE" ] || [ -z "$FID" ]; then
         FID=$(echo "$BRANCH" | sed 's|^feat/||' | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1)
         ISSUE="$FID"
       fi
       if [ -z "$FID" ] || [ -z "$ISSUE" ]; then
         echo "::notice::Cannot derive FID/ISSUE for branch $BRANCH — no-op exit (fail-safe)."
         echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
       fi
       ISSUE_LABELS=$(gh issue view "$ISSUE" --json labels --jq '[.labels[].name] | join(",")' 2>/dev/null || echo "")
       if ! echo "$ISSUE_LABELS" | grep -q 'bkit:auto'; then
         echo "::notice::Issue #$ISSUE no longer carries bkit:auto — no-op exit (kill switch)."
         echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
       fi
     fi
     # bkit:end shared-deriv
   fi
   # Guard: arg must be alphanumeric/dash/dot/slash.
   if ! [[ "$ARG" =~ ^[0-9A-Za-z._/-]+$ ]]; then
     echo "::error::Invalid arg value '${ARG}' — aborting." >&2
     exit 1
   fi
   {
     echo "skip=false"
     echo "phase=$PHASE"
     echo "arg=$ARG"
   } >> "$GITHUB_OUTPUT"
   ```

   **Note:** The exact bash above is the spec; the builder applies it to BOTH jobs' ctx steps identically. The key additions vs today: (a) `COMMIT_MSG`/`HEAD_SHA` in `env:`, (b) the `if BRANCH == dev` branch with commit-scope FID recovery, (c) dev success -> skip, (d) stale-run guard Option A, (e) loop cap (distinct headSha count), (f) kill switch, (g) dev-dispatch write+commit+push before dispatch, (h) PR-lookup moved into `else`, (i) `shared-deriv` markers extended upward.

### `.bkit/workflows/bkit-auto.md` Step 1

1. **Step 1.5 (line 85):** Discriminate CI vs CI_DEV on ARG shape. When `MODE=CI` and ARG is non-numeric, switch to CI_DEV and derive FID/ISSUE_ID/BRANCH directly (no PR lookup):

   ```bash
   if [ "$MODE" = "CI" ]; then
     if [[ "$ARG" =~ ^[0-9]+$ ]]; then
       PR_NUMBER="$ARG"      # CI mode — ARG is numeric PR number
     else
       # CI_DEV mode — ARG is a FID slug (e.g. 363-widen-bkit-cloud-trigger).
       # Dev-triggered dispatch from bkit-cloud.yml; no open PR (already squash-merged).
       MODE=CI_DEV
       FID="$ARG"
       ISSUE_ID=$(printf '%s' "$FID" | grep -oE '^[0-9]+')
       BRANCH=dev
       HEAD_SHA=$(git rev-parse origin/dev 2>/dev/null || echo "")
       PR_STATE=MERGED       # semantic: the feature PR was already merged
       PR_URL="(merged)"
       RUN_ID=""             # no open-PR run to link; Step 11 comment omits the actions link
     fi
   fi
   ```

   Assert `ISSUE_ID` non-empty after derivation (else Failure Path).

2. **Steps 6-8 (lines 86-92):** Gate on `MODE=CI` only. CI_DEV mode skips PR lookup (`gh pr view`), `PR_STATE` assert, and `RUN_ID` resolution (all six vars already set in Step 1.5).

3. **Step 7 (line 87):** `PR_STATE != OPEN -> Failure Path` — gate on `MODE=CI` only. CI_DEV mode skips this assert (the PR is intentionally already merged).

4. **Step 9 (lines 93-117):** `Extract ISSUE_ID and FID from PR body metadata` via `pull_request_read` — gate on `MODE=CI` only (Review 1 M5). CI_DEV mode skips this (PR_NUMBER is empty; FID/ISSUE_ID already derived from ARG in Step 1.5).

5. **Step 10 (line 118):** `BRANCH does NOT start with feat/ -> Failure Path` — gate on `MODE=CI` only. CI_DEV mode has `BRANCH=dev` (intentionally not `feat/`); FID already set.

6. **Step 11 comment body (lines 126-134):** The actions-link line `[{OWNER_REPO}/actions/run/{RUN_ID}]` is rendered ONLY when `RUN_ID` is non-empty (gate the line on `MODE=CI`, or on `[ -n "$RUN_ID" ]`). In CI_DEV, `RUN_ID` is empty -> omit the actions link (Review 3 F6.3). The branch/PR lines render with `dev` / `(none)` / `(merged)` harmlessly.

7. **Gate 1 checklist (line 141):** Add `CI_DEV placeholders non-empty (FID, ISSUE_ID, BRANCH, HEAD_SHA, if MODE = CI_DEV)`.

### `.bkit/workflows/bkit-debug.md` — NO CODE CHANGES

The existing 3-way worktree fallback at `bkit-debug.md:318-327` already creates `fix/{FID}` off `origin/dev` when `feat/{FID}` is absent (the exact post-merge condition — squash-merge's `--delete-branch` deletes `feat/{FID}`):

```bash
if git show-ref --verify --quiet "refs/heads/feat/{FID}"; then
  git worktree add "$WORKTREE_PATH" "feat/{FID}"
elif git fetch origin "feat/{FID}" 2>/dev/null \
     && git show-ref --verify --quiet "refs/remotes/origin/feat/{FID}"; then
  git worktree add "$WORKTREE_PATH" --track -b "feat/{FID}" "origin/feat/{FID}"
else
  git fetch origin dev
  git worktree add "$WORKTREE_PATH" -b "fix/{FID}" origin/dev
fi
```

Step 1.6 PUSH_MODE auto-detect (`bkit-debug.md:179-181`) already returns `PUSH_MODE=LOCAL` for `fix/{FID}` (no open PR). The v1 plan's `CI_DEV` branch-selection edit and telemetry write are DROPPED — `bkit-debug` has no `CI_DEV` concept, and the `dev-dispatch` counter write lives in the cloud ctx step (the component that knows `BRANCH=dev`). This task is VERIFY-ONLY (see Task 3).

### `.bkit/workflows/bkit-ship.md` Step 5

1. **Lines 634-635 (squash `--subject`):** Thread `AUTO_ROUTE_SUFFIX` (already derived on line 626):
   ```bash
   # Before:
   --subject "$(gh pr view {PR_NUMBER} --json title --jq .title) (#{PR_NUMBER})" \
   # After:
   --subject "$(gh pr view {PR_NUMBER} --json title --jq .title) (#{PR_NUMBER})${AUTO_ROUTE_SUFFIX}" \
   ```
   This is the **entire** Option A change — one suffix appended to one `--subject` flag. When `bkit:auto` is labeled, `AUTO_ROUTE_SUFFIX=" bkit [auto route]"`; when not, `AUTO_ROUTE_SUFFIX=""` (no-op). The squash-merge commit on `dev` then carries the marker, and the existing `bkit-cloud.yml` gate matches it for the `dev` trigger. The HEAD-Subject Assertion (`bkit-ship.md:598`) already rejects `[skip ci]` in PR titles, so the squash subject cannot accidentally carry it.

### `.bkit/scripts/bkit-counter-bus-config.sh`

1. **Add `MAX_DEV_DISPATCH_ATTEMPTS` under a NEW `# bkit-cloud.yml counters` section (it is consumed by the cloud ctx step, not bkit-debug):**
   ```sh
   # bkit-debug.md counters (mode-matched pairs — DE-25, DE-36)
   MAX_DEBUG_ATTEMPT=3
   MAX_NORMAL_ATTEMPT=3
   MAX_SOAK_ATTEMPT=3

   # bkit-cloud.yml counters
   MAX_DEV_DISPATCH_ATTEMPTS=3   # #363 — cross-session dev-triggered debug dispatch cap (distinct failed dev CI SHAs per FID)
   ```

### `.bkit/cloud.md`

1. **Decision log:** Add `## #363 — widen bkit-cloud trigger to post-merge dev CI` entry documenting: Option A rationale, dev vs feat routing table, stale-run guard Option A (CI-run recency, NOT git-tip), loop-bound decision (cap=3 distinct headSha, all-time, written by ctx step before dispatch), concurrency decision (`cancel-in-progress: false` for dev — QUEUES, not drops).

2. **Routing table:** Add `dev` row: trigger = `workflow_run` on `dev` CI; success = no-op; failure = `/bkit-debug {FID}`; FID source = commit scope (fallback `gh api`); concurrency = `cancel-in-progress: false` (queue); loop cap = `MAX_DEV_DISPATCH_ATTEMPTS` (distinct headSha).

### `docs/deployments.md`

1. **CI/CD matrix:** Add `dev` branch row — post-merge CI fires `workflow_run`; success = no-op; failure = auto-dispatch `/bkit-debug`. Note the docs-only-diff precondition: the dev-trigger path assumes the consumer's `ci.yml` neutralises (not reds) Vercel-CANCELED builds.

2. **Auto-route contract:** Note that the `bkit [auto route]` marker is now threaded onto the squash-merge `--subject` (not just the sync-merge commit), enabling the `dev` trigger gate.

### `docs/security.md`

1. **§ CI Auto-Route Trust:** Add subsection for `dev` push trigger — trust surface is the squash-merge commit scope (validated against FID slug allowlist); dynamic values via `env:` (injection-safe); no PR body involved; kill switch (label re-check) and loop cap apply identically.

---

## Supersession Inventory

No plan superseded. This is a new feature plan for #363. Related issues (#119, #397, #80) are referenced but not superseded.

---

## Documentation Updates

<!-- prettier-ignore -->
| File | Change |
| --- | --- |
| `.bkit/cloud.md` | Decision log entry + routing table `dev` row + loop-bound note + stale-guard Option A note |
| `docs/deployments.md` | CI/CD matrix `dev` branch row + auto-route contract update + docs-only-diff precondition |
| `docs/security.md` | § CI Auto-Route Trust — `dev` push trigger trust surface (env-safe) |
| `CHANGELOG.md` | Unreleased entry: "widen bkit-cloud trigger to post-merge `dev` CI (#363)" |

---

## Rollback Strategy

**Feature is gated and additive.** Rollback path:

1. Revert `workflow_run.branches` from `['feat/**', 'fix/**', 'dev']` to `['feat/**']` — `dev` trigger stops firing immediately. No data migration, no schema change.
2. The `dev-dispatch` status.jsonl rows + `docs({FID}): dev-dispatch telemetry [skip ci]` commits are harmless additive data; no cleanup needed.
3. The `bkit-ship` `--subject` suffix change (`AUTO_ROUTE_SUFFIX` threading) is backward-compatible — removing it only means `dev` CI runs don't carry the marker (which is fine if the trigger is reverted).
4. The `bkit-auto` CI_DEV mode is dead code if the trigger is reverted (never reached); no runtime impact.
5. Version bump (4.11.0) stays — it's a forward-only release tag.

**Partial rollback (disable loop cap only):** Set `MAX_DEV_DISPATCH_ATTEMPTS=999` in `bkit-counter-bus-config.sh` — effectively unbounded dispatch, restoring the "uncapped loop" behaviour while keeping the trigger widening.

---

## Agent Execution Runbook

> Gate 2 — tasks with explicit `Depends on` fields. `[ ]` = pending. Check after completion.
> **Same-file note:** Task 1 owns the entire `.bkit/templates/.github/workflows/bkit-cloud.yml` + `bkit-counter-bus-config.sh` surface (the v1 split across three tasks with an undeclared dependency is merged into one — Review 1 M1 / Review 2 #1 / Review 2 #8). Execute Task 1 fully before Task 2 (Task 2's CI_DEV mode is dead code until Task 1's ctx step dispatches a non-numeric ARG).

### Task 1 — Cloud trigger surface (trigger widen + concurrency + ctx step dev branch + counter-bus-config + dev-dispatch write)

- [ ] **Scope:** `.bkit/templates/.github/workflows/bkit-cloud.yml` (both `run`/claude and `opencode` jobs) + `.bkit/scripts/bkit-counter-bus-config.sh`.
- [ ] **Depends on:** none.
- [ ] **Sub-step 1a — counter-bus-config:** Add `# bkit-cloud.yml counters` section with `MAX_DEV_DISPATCH_ATTEMPTS=3` after the bkit-debug section (Review 2 L12 — new section header, not crammed under bkit-debug).
- [ ] **Sub-step 1b — trigger filter:** Change `workflow_run.branches` from `['feat/**']` to `['feat/**', 'fix/**', 'dev']`.
- [ ] **Sub-step 1c — concurrency:** Change `cancel-in-progress` from `true` to `${{ github.event.workflow_run.head_branch != 'dev' }}`.
- [ ] **Sub-step 1d — header comment:** Replace lines 14-19 with the verbatim text in Architecture § item 1 (Review 2 L11).
- [ ] **Sub-step 1e — ctx step env (both jobs):** Add `COMMIT_MSG: ${{ github.event.workflow_run.head_commit.message }}` and `HEAD_SHA: ${{ github.event.workflow_run.head_sha }}` to the `env:` block (injection-safe — Review 1 M3).
- [ ] **Sub-step 1f — ctx step run (both jobs):** Insert the `if [ "$BRANCH" = "dev" ]` branch after the `case "$CONCLUSION"` and before `gh pr list`; move PR-lookup into `else`; extend `shared-deriv` markers. Implement: commit-scope FID recovery (primary) + `gh api repos/$GITHUB_REPOSITORY/commits/$HEAD_SHA/pulls` (fallback — Review 2 M4); FID slug assertion; dev-success -> skip; stale-run guard Option A (`gh run list --branch dev --workflow CI --status completed` — Review 3 F1); loop cap (`. "$GITHUB_WORKSPACE/.bkit/scripts/bkit-counter-bus-config.sh"` — Review 1 M2 / Review 2 #3; distinct headSha count); kill switch (`bkit:auto` re-check); dev-dispatch write + `git commit -m "docs($FID): dev-dispatch telemetry [skip ci]"` + `git push origin dev || <notice>` (Review 1 H1 / Review 2 #2 / Review 3 F3 — writer co-located with reader, before dispatch).
- [ ] **Done when:**
  - `yq '.on.workflow_run.branches' .bkit/templates/.github/workflows/bkit-cloud.yml` contains `dev`.
  - `yq '.concurrency.cancel-in-progress'` is the dev-discriminating expression.
  - Both jobs' ctx `env:` blocks contain `COMMIT_MSG` and `HEAD_SHA`.
  - `grep MAX_DEV_DISPATCH_ATTEMPTS .bkit/scripts/bkit-counter-bus-config.sh` returns the line; `source` the file and `echo $MAX_DEV_DISPATCH_ATTEMPTS` prints `3`.
  - Bash dry-run (harness below): `BRANCH=dev CONCLUSION=failure COMMIT_MSG="feat(363-widen-bkit-cloud-trigger): test (#1) bkit [auto route]"` -> `phase=debug`, `arg=363-widen-bkit-cloud-trigger`, `skip=false`; `BRANCH=dev CONCLUSION=success` -> `skip=true`; seed 3 distinct-headSha `dev-dispatch` rows -> `skip=true` + notice.
- [ ] **Test ref:** T1, T2, T3, T4, T5, T10.

**Dry-run harness (Task 1f):** Extract the `run:` block via `yq -r '.jobs.run.steps[] | select(.name=="Resolve phase + brief context") | .run' .bkit/templates/.github/workflows/bkit-cloud.yml`. `export GITHUB_OUTPUT=$(mktemp) GITHUB_WORKSPACE="$PWD" GITHUB_REPOSITORY="owner/repo"`; export `BRANCH`/`CONCLUSION`/`COMMIT_MSG`/`HEAD_SHA`/`EVENT`; stub `gh` (e.g. `GH_HOST=invalid` for fail-safe paths, or a shell function returning canned JSON for `gh run list`/`gh issue view`); read `$GITHUB_OUTPUT` to assert `phase=`/`arg=`/`skip=` (Review 2 L13).

### Task 2 — Extend `bkit-auto.md` Step 1 for CI_DEV mode

- [ ] **Scope:** `.bkit/workflows/bkit-auto.md` Step 1, lines 85-118 + Step 11 comment (lines 126-134) + Gate 1 checklist (line 141).
- [ ] **Depends on:** Task 1 (ctx step must dispatch non-numeric ARG for CI_DEV to be reachable).
- [ ] Step 1.5: discriminate `[[ "$ARG" =~ ^[0-9]+$ ]]` -> CI (PR_NUMBER) vs CI_DEV (FID, ISSUE_ID from numeric prefix, BRANCH=dev, HEAD_SHA, PR_STATE=MERGED, RUN_ID="").
- [ ] Steps 6-8: gate on `MODE=CI`; in CI_DEV the six vars are pre-set, skip `gh pr view`/RUN_ID.
- [ ] Step 7 (`PR_STATE != OPEN -> Failure Path`): gate on `MODE=CI`.
- [ ] Step 9 (`pull_request_read` PR-body FID extraction): gate on `MODE=CI` (Review 1 M5).
- [ ] Step 10 (`BRANCH does NOT start with feat/ -> Failure Path`): gate on `MODE=CI`.
- [ ] Step 11 comment: gate the `actions/run/{RUN_ID}` link on `MODE=CI` (or `[ -n "$RUN_ID" ]`) — CI_DEV omits it (Review 3 F6.3).
- [ ] Gate 1 checklist: add `CI_DEV placeholders non-empty (FID, ISSUE_ID, BRANCH, HEAD_SHA, if MODE = CI_DEV)`.
- [ ] ASCII-only operators in all `.bkit/workflows/*.md` edits (no non-ASCII arrows/quotes in managed blocks).
- [ ] **Done when:** A dry-run invocation `/bkit-auto debug 363-widen-bkit-cloud-trigger` (non-numeric ARG) sets `MODE=CI_DEV`, `FID=363-widen-bkit-cloud-trigger`, `ISSUE_ID=363`, `BRANCH=dev`, and does NOT call `gh pr view`; Step 11 comment omits the actions link.
- [ ] **Test ref:** T6, T7.

### Task 3 — Verify `bkit-debug.md` needs no changes (verify-only)

- [ ] **Scope:** `.bkit/workflows/bkit-debug.md` — READ ONLY (no edits).
- [ ] **Depends on:** none (verification of existing behaviour).
- [ ] Confirm `bkit-debug.md:318-327` 3-way fallback creates `fix/{FID}` off `origin/dev` when `feat/{FID}` is absent (post-merge condition).
- [ ] Confirm `bkit-debug.md:179-181` Step 1.6 `gh pr list --head $(git branch --show-current) --base dev` returns nothing for `fix/{FID}` (no open PR) -> `PUSH_MODE=LOCAL`.
- [ ] Confirm NO `CI_DEV` references are added (the dead signal is dropped — Review 1 M4 / Review 2 #2; the `dev-dispatch` write lives in the cloud ctx step).
- [ ] **Done when:** Read confirms both existing behaviours cover the dev path; no diff to `bkit-debug.md`.
- [ ] **Test ref:** T8.

### Task 4 — Thread `AUTO_ROUTE_SUFFIX` into `bkit-ship.md` squash `--subject`

- [ ] **Scope:** `.bkit/workflows/bkit-ship.md` Step 5, lines 634-635.
- [ ] **Depends on:** none.
- [ ] Append `${AUTO_ROUTE_SUFFIX}` to the `--subject` value (after `#{PR_NUMBER})`).
- [ ] `AUTO_ROUTE_SUFFIX` is already derived on line 626 — no new gate logic.
- [ ] **Done when:** Read: lines 634-635 `--subject` includes `${AUTO_ROUTE_SUFFIX}`; bash unit: `LABELS=bkit:auto` -> subject ends with `bkit [auto route]`; `LABELS=""` -> subject unchanged.
- [ ] **Test ref:** T9.

### Task 5 — Update `.bkit/cloud.md` (decision log + routing table)

- [ ] **Scope:** `.bkit/cloud.md`.
- [ ] **Depends on:** none.
- [ ] Add decision-log entry `## #363 — widen bkit-cloud trigger to post-merge dev CI`.
- [ ] Document: Option A rationale; dev vs feat routing table; stale-run guard Option A (CI-run recency via `gh run list`, NOT git-tip — with the close-commit-race justification); loop-bound decision (cap=3 distinct headSha, all-time, written by ctx step before dispatch); concurrency decision (`cancel-in-progress: false` for dev — QUEUES not drops, queued run re-evaluates cap); FID recovery (commit scope + `gh api` fallback).
- [ ] **Done when:** `cloud.md` contains the decision-log entry with the routing table and all decisions documented.
- [ ] **Test ref:** N/A (documentation).

### Task 6 — Update `docs/deployments.md` (CI/CD matrix + auto-route contract + docs-only-diff precondition)

- [ ] **Scope:** `docs/deployments.md`.
- [ ] **Depends on:** none.
- [ ] CI/CD matrix: add `dev` branch row (post-merge CI -> `workflow_run` -> success=no-op, failure=`/bkit-debug`).
- [ ] Auto-route contract: document that `bkit [auto route]` is now threaded onto the squash-merge `--subject` (Option A), enabling the `dev` trigger gate.
- [ ] Docs-only-diff precondition: note that the dev-trigger path assumes the consumer's `ci.yml` neutralises (not reds) Vercel-CANCELED builds (Review 3 F4).
- [ ] **Done when:** `deployments.md` CI/CD matrix includes a `dev` row with the post-merge routing + docs-only-diff precondition.
- [ ] **Test ref:** N/A (documentation).

### Task 7 — Update `docs/security.md` § CI Auto-Route Trust

- [ ] **Scope:** `docs/security.md` § CI Auto-Route Trust.
- [ ] **Depends on:** none.
- [ ] Add `dev` push trigger subsection: trust surface = squash-merge commit scope (FID slug allowlist); dynamic values via `env:` (injection-safe); no PR body; kill switch (label re-check) applies; loop cap (`MAX_DEV_DISPATCH_ATTEMPTS=3`, distinct headSha) as cost control.
- [ ] **Done when:** `security.md` § CI Auto-Route Trust documents the `dev` trust surface.
- [ ] **Test ref:** N/A (documentation).

### Task 8 — Mirror regen + version bump + CHANGELOG

- [ ] **Scope:** `.bkit/version`, `package.json`, `CHANGELOG.md`, `.claude/`, `.cursor/`, `.opencode/`.
- [ ] **Depends on:** Tasks 1-7 (must run after all canonical `.bkit/` edits).
- [ ] Bump `.bkit/version` `pinnedVersion` 4.10.0 -> 4.11.0.
- [ ] Bump `package.json` `version` 4.10.0 -> 4.11.0.
- [ ] `CHANGELOG.md` Unreleased: add `widen bkit-cloud trigger to post-merge dev CI (#363)`.
- [ ] Run `pnpm bkit upgrade` to regenerate `.claude/`, `.cursor/`, `.opencode/` mirrors from `.bkit/`.
- [ ] Verify mirrors in sync: `git diff --stat` shows mirror files updated, `.bkit/` canonical files are the source.
- [ ] ASCII-only operators in all `.bkit/workflows/*.md` and `.bkit/prompts/*.md` content (no non-ASCII arrows/quotes in managed blocks).
- [ ] **Done when:** `jq -r .version package.json` = `4.11.0`; `grep pinnedVersion .bkit/version` = `4.11.0`; `CHANGELOG.md` has the entry; `pnpm bkit upgrade` produces no unexpected diff.
- [ ] **Test ref:** T11, T12.

### Task 9 — In-repo validation

- [ ] **Scope:** all changed files.
- [ ] **Depends on:** Tasks 1-8.
- [ ] YAML structure valid: `yq` parse `bkit-cloud.yml` (template + installed) succeeds; trigger filter + concurrency + ctx step all present.
- [ ] Ctx step bash dry-run (harness per Task 1f): `BRANCH=dev CONCLUSION=failure COMMIT_MSG="feat(363-widen-bkit-cloud-trigger): test (#1) bkit [auto route]"` -> assert `phase=debug`, `arg=363-widen-bkit-cloud-trigger`, `skip=false`.
- [ ] Ctx step bash dry-run: `BRANCH=dev CONCLUSION=success` -> assert `skip=true`.
- [ ] Ctx step bash dry-run: seed 3 distinct-headSha `dev-dispatch` rows -> assert `skip=true` + notice; 3 same-headSha rows -> assert `skip=false` (distinct-cycle counting).
- [ ] `bkit-auto` Step 1 dry-run: `ARG=363-widen-bkit-cloud-trigger` -> `MODE=CI_DEV`, no `gh pr view`, `ISSUE_ID=363`.
- [ ] `bkit-ship` Step 5 read: `--subject` includes `${AUTO_ROUTE_SUFFIX}`.
- [ ] `bkit-counter-bus-config.sh` sources cleanly; `MAX_DEV_DISPATCH_ATTEMPTS=3`.
- [ ] `pnpm turbo lint typecheck` (or repo equivalent) passes.
- [ ] **Done when:** All dry-run assertions pass; lint/typecheck green.
- [ ] **Test ref:** T1-T12.

### Task 10 — Consumer-repo acceptance note (incl. docs-only-diff precondition)

- [ ] **Scope:** `.bkit/cloud.md` or `docs/deployments.md` acceptance section.
- [ ] **Depends on:** none.
- [ ] Document: the `dev`-trigger happy path can only be fully exercised on consumer repos (`app-gether-life`, `visitfrasercoast-com`) that run CI on `push: branches: [dev]` and have `bkit-cloud.yml` installed with secrets. This repo (bkit itself) dogfoods the YAML structure but the full `workflow_run -> /bkit-debug -> fix -> dev CI` loop requires a real consumer repo with `ANTHROPIC_API_KEY` / `OPENCODE_PROVIDER_KEY` secret wired.
- [ ] Docs-only-diff precondition (Review 3 F4): require manual verification that each target consumer's `ci.yml` neutralises (not reds) Vercel-CANCELED builds; note in the `dev` row that the dev-trigger path assumes this contract.
- [ ] **Done when:** Acceptance note documents the consumer-repo-only exercisable path + docs-only-diff precondition.
- [ ] **Test ref:** N/A (documentation).

---

## Verification Plan (Gate 4)

**Automated (in-repo):**

- `yq` parse of `bkit-cloud.yml` — trigger filter, concurrency, ctx step structure.
- Bash dry-runs of ctx step logic (mocked env vars, seeded status.jsonl — harness per Task 1f).
- `source bkit-counter-bus-config.sh && echo $MAX_DEV_DISPATCH_ATTEMPTS`.
- `pnpm turbo lint typecheck` (or repo equivalent).
- Mirror diff check after `pnpm bkit upgrade`.

**Manual (consumer-repo, post-release):**

- On `app-gether-life` or `visitfrasercoast-com`: ship a `feat/{FID}` PR with `bkit:auto` label -> verify squash-merge to `dev` carries `bkit [auto route]` in the commit subject -> verify post-merge CI on `dev` -> if CI fails, verify `/bkit-debug` auto-dispatches -> verify `dev-dispatch` row in status.jsonl -> verify loop cap after 3 distinct failed SHAs.
- Verify `dev` CI success -> no dispatch (no-op).
- Verify docs-only squash-merge does NOT false-dispatch (Vercel-CANCELED neutralised, not red).

---

## Manual Verification

- Read the squash-merge commit on `dev` after a `/bkit-ship` — confirm the subject includes `bkit [auto route]` (when `bkit:auto` labeled) and does NOT include `[skip ci]`.
- Read the `docs({FID}): ship DONE bkit [skip ci]` close commit (`bkit-ship.md:1206`) — confirm it includes `[skip ci]` and does NOT include `bkit [auto route]`.
- Trigger a `workflow_dispatch` with `phase=debug issue=363` — confirm the existing manual path still works (no regression from the ctx step restructuring).

---

## Merge Method

**Squash merge** to `dev` via `/bkit-ship`. The squash subject will carry `bkit [auto route]` (this plan's change), making the post-merge CI on `dev` eligible to trigger the cloud workflow — dogfooding the feature on itself.

---

## Review Critique Resolution Index

Trace of every load-bearing critique from the three reviews and how this v2 resolves it.

<!-- prettier-ignore -->
| Critique | Severity | Resolution in v2 |
| --- | --- | --- |
| **R3 F1** stale-run guard unsound (close-commit race) | CRITICAL | Adopted **Option A**: `gh run list --branch dev --workflow CI --status completed` headSha comparison (close commits never appear — they carry `[skip ci]`). Dropped the `git rev-parse origin/dev` comparison. Justified in Open Questions #2 + Architecture § item 5. Options B/C documented as rejected. |
| **R1 H1 / R2 #2** loop cap silently inert (no CI_DEV signal in bkit-debug) | HIGH | Counter write moved into the **cloud ctx step** (the component that knows `BRANCH=dev`), BEFORE dispatch. `CI_DEV` mode dropped from `bkit-debug` entirely; `bkit-debug` needs zero code changes (existing 3-way fallback covers `fix/{FID}`). Open Questions #1/#5 + Task 1f + Task 3. |
| **R1 M1 / R2 #1** undeclared Task 2 -> Task 3 dependency | HIGH | Merged old Tasks 1+2+3 into **Task 1** (single owner of `.bkit/templates/.github/workflows/bkit-cloud.yml` + `bkit-counter-bus-config.sh`). Explicit `Depends on` fields on every task. Runbook preamble documents the merge. |
| **R1 M2 / R2 #3** undefined `$REPO_ROOT` in cloud ctx step | HIGH | Use `$GITHUB_WORKSPACE` (GHA-provided) for sourcing; `$GITHUB_REPOSITORY` for `gh api`. Pre-Flight § + Architecture § item 4/5. |
| **R1 M3 / R2 M** inline `${{ head_commit.message }}` injection | MEDIUM | `COMMIT_MSG` and `HEAD_SHA` added to ctx step `env:` block (injection-safe); `$GITHUB_REPOSITORY` replaces literal `{owner}/{repo}` in `gh api`. Architecture § item 4/5 + Security §. |
| **R1 M4 / R2 #2** bkit-debug Step 2 worktree change redundant | MEDIUM | Dropped the edit; **Task 3 is verify-only**. Existing `bkit-debug.md:318-327` fallback already creates `fix/{FID}` off `origin/dev`. |
| **R2 M6 / R3 F2** concurrency narrative ("dropped, not queued") wrong | MEDIUM | Corrected: GHA with `cancel-in-progress: false` **QUEUES** (one pending; older pendings cancelled as newer arrive). Queued run re-evaluates cap at ctx step. Operator does NOT manually re-trigger. Open Questions #3 + Acceptance edge cases + Architecture § item 3. |
| **R3 F3** counter written after dispatch (undercount on crash) | LOW | Write moved to ctx step, **before** dispatch, committed to dev with `[skip ci]`. Open Questions #1/#5 + Architecture § item 5. |
| **R3 F6** telemetry `parentSha`/`headSha` correctness + RUN_ID link | LOW | `headSha` = `workflow_run.head_sha` (CI-failed SHA, correct); `parentSha` derived via `git rev-parse origin/dev`. bkit-auto Step 11 actions-link gated on `MODE=CI`/non-empty `RUN_ID`. Architecture § bkit-auto item 6 + Data Schema §. |
| **R2 M7** close-commit identifier wrong | MEDIUM | Corrected to `docs({FID}): ship DONE bkit [skip ci]` (`bkit-ship.md:1206`, verified). Pre-Flight § + Acceptance edge cases + Manual Verification. |
| **R3 F4** docs-only-diff precondition (Vercel cancel) | LOW | Added to Acceptance edge cases + Task 6 + Task 10 (manual verification per consumer). |
| **R3 F5** `fix/**` lifecycle (now cloud-auto-ships) | LOW | Documented in Breaking Changes § (`fix/**` newly folded; Success Criteria scoped to `feat/**`). |
| **R1 M5** bkit-auto Step 9 not gated + ISSUE_ID unspecified | MEDIUM | Step 9 added to the `MODE=CI` gate list; `ISSUE_ID` numeric-prefix derivation specified in Step 1.5 CI_DEV branch. Architecture § bkit-auto items 1/4 + Task 2. |
| **R1 M6** ctx-step dev-branch placement ambiguous | MEDIUM | Placement made explicit: `if [ "$BRANCH" = "dev" ]` after `case "$CONCLUSION"`, before `gh pr list`; PR-lookup moves into `else`; `shared-deriv` markers extend upward. Pre-Flight § + Architecture § item 5. |
| **R2 L10** T2 presence-only check misses behavioural regression | LOW | T2 augmented with bash unit: `head_branch=feat/foo` -> true (cancel preserved); `head_branch=dev` -> false (queue). Test Matrix T2. |
| **R2 L11** header comment text unspecified | LOW | Verbatim replacement header text quoted in Architecture § item 1. |
| **R2 L12** MAX_DEV_DISPATCH_ATTEMPTS breaks comment grouping | LOW | New `# bkit-cloud.yml counters` section header (consumed by cloud ctx step, not bkit-debug). Architecture § counter-bus-config item 1. |
| **R2 L13** dry-run harness unspecified | LOW | Dry-run harness specified in Task 1f (yq extraction, env mocking, gh stubbing, GITHUB_OUTPUT assertion). |
| **R1 L1 / R2 L9** telemetry location misstated (Step 1 vs Step 2.6) | LOW | Moot — telemetry write moved out of bkit-debug entirely (now in cloud ctx step). |
