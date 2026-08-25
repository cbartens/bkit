Verdict: PASS
<!-- verdict:end -->

<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

<!-- Checked revision (v3). Builds on v2 (which incorporated all blocking/high findings from
     plan-review-1 CONCERNS, plan-review-2 CONCERNS, and plan-review-3 FAIL — see the
     "Review Critique Resolution Index" below). v3 applies the three non-blocking scope-check-1
     findings (F1/F2/F3) plus the scope-check-2 boundary confirmation (PASS — no scope expansion,
     no silent drops). See the "Scope-Check Resolution Index" near the end of this file for a
     finding-by-finding trace. Source references re-verified against the current worktree. -->

<!-- v4 — post-plan review revision (2026-07-29, pre-build). The v1-v3 chain was authored
     against parent SHA 2ee0da16, ten minutes BEFORE #384 (80660ac0) restructured
     `bkit-ship.md` into Path A/B and four follow-up fixes landed on dev. Every
     `bkit-ship.md:NNN` anchor in v3 was therefore stale, and v3's Task 4 premise
     ("AUTO_ROUTE_SUFFIX is already derived on line 626") is now FALSE — #384 deleted the
     variable from `bkit-ship.md` outright. v4 re-verifies every source anchor against dev
     @ d87c8641 and closes seven defects. See the "Post-Plan Review Findings" index at the
     end of this file for the finding-by-finding trace (P1-P7). -->

# Widen bkit-cloud Trigger to Post-Merge dev CI Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual `plan.md` file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

## Context & Goals

`bkit-cloud.yml`'s `workflow_run` trigger currently fires only on `feat/**` CI completion (pre-merge pull-request CI). When CI goes green on a `feat/{FID}` branch, the cloud orchestrator auto-ships the PR; when it fails, it auto-dispatches `/bkit-debug`. But once that PR squash-merges to `dev`, the `feat/{FID}` branch is deleted and **no cloud trigger fires for post-merge `dev` CI** — if the squash-merge reintroduces a failure (merge conflict resolution gone wrong, a dependency only resolved on the PR head, an env difference), bkit is blind to it. An operator must notice the red `dev` CI run and manually invoke `/bkit-debug`.

This plan **widens the trigger** to `['feat/**', 'fix/**', 'dev']` and adds the branch-aware routing, FID-recovery, concurrency, and loop-bound machinery the `dev` and `fix/**` paths require. `main` is **deliberately excluded** — a documented reversal of the issue's D-final decision, recorded as a deferral (see Out of Scope). The design follows **Option A** from the issue comments: the existing free-tier gate (`bkit [auto route]` HEAD-commit marker, threaded by `bkit-ship` onto the squash-merge `--subject` when the issue carries `bkit:auto`) is reused verbatim for the `dev` path — no second gate, no new trust surface. The `[skip ci]` Close commit that follows the squash merge is unaffected (it never carried the marker, so it never triggered the cloud workflow).

> [!IMPORTANT]
> **P1 — the Option A change point no longer exists (v4).** v3 asserted that `bkit-ship.md` already derives `AUTO_ROUTE_SUFFIX` from the `bkit:auto` label at line 626, so Task 4 was a one-token append. **#384 (80660ac0) deleted that derivation from `bkit-ship.md` entirely** — `grep -c 'AUTO_ROUTE_SUFFIX' .bkit/workflows/bkit-ship.md` now returns 0, and the ship conflict-resolve commit carries a hard-coded `bkit [skip ci]` instead of the conditional marker. Task 4 must therefore **re-introduce** the derivation, not just thread it. The idiom to mirror is `bkit-build.md:1261` / `bkit-debug.md:1262` (`echo "${LABELS:-}" | grep -q 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]" || true`), which both still carry it. This also means `.bkit/workflows.md:605,1010` — which still document ship's dev-sync / conflict-resolve marker re-carry — are **stale against shipped code**; that drift is a #384 regression, out of scope here, and is raised separately on #363/#384.

The `dev` path differs from the `feat/**` path in three load-bearing ways, all addressed here:

1. **No open PR.** On `dev`, `head_branch=dev` and there is no `feat/{FID}` branch and no PR body to parse for `bkit:issue` / `bkit:fid` markers. FID must be recovered from the **squash-merge commit scope** (`feat(363-widen-bkit-cloud-trigger): ...` — the PR title convention, which the squash `--subject` preserves verbatim).
2. **Success is a no-op, not ship.** On `feat/**`, CI success -> `/bkit-ship` (merge the PR). On `dev`, the merge already happened — CI success means "post-merge regression check passed" and requires no action. Only CI **failure** dispatches `/bkit-debug`.
3. **Cross-session loop bound.** A `dev`-triggered `/bkit-debug` pushes a fix to `dev` via a `fix/{FID}` PR; if that fix fails CI, another `workflow_run` fires, dispatching another `/bkit-debug` — a feedback loop with no natural terminator. Per-session `MAX_NORMAL_ATTEMPT` resets on each dispatch, so it cannot bound the cross-session loop. This plan adds a **`MAX_DEV_DISPATCH_ATTEMPTS` cap** (default 3 distinct failed dev CI SHAs per FID), enforced AND written in the `bkit-cloud.yml` ctx step at the dispatch decision point.

**Success Criteria:**

- `bkit-cloud.yml`'s `workflow_run` trigger fires on `feat/**`, `fix/**`, and `dev` CI completion (never `main`); the existing `feat/**` pre-merge routing (success -> ship, failure -> debug) is preserved for `feat/**` specifically. `fix/**` is a newly-folded surface and requires **three code changes to become functional at all** (P2, below) — it is NOT free.
- `fix/**` routing works end-to-end: the ctx-step FID fallback strips `fix/` as well as `feat/`, `bkit-auto.md` Step 10 accepts a `fix/` branch prefix, and the `fix/**` CI-failure -> debug loop is bounded by the same dispatch cap as `dev` (keyed on the FID, not the branch).
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
- **`[skip ci]` Close commit:** The `docs({FID}): ship DONE bkit [skip ci]` close commit (`bkit-ship.md:1258`) that follows the squash merge carries `[skip ci]` -> CI doesn't run -> no `workflow_run` event. Only the squash-merge commit (which DOES carry `bkit [auto route]` and does NOT carry `[skip ci]`) triggers CI -> the cloud gate matches. No interaction.
- **Two dev pushes fail CI near-simultaneously:** Concurrency group `bkit-auto-dev` with `cancel-in-progress: false` -> the in-flight debug runs to completion; the superseding run is **queued** (GHA queues one pending with `cancel-in-progress: false`; older pendings are cancelled as newer ones arrive). The queued run starts when the in-flight finishes and re-evaluates the cap at its ctx step (which sees the now-incremented `dev-dispatch` count). The operator does NOT need to manually re-trigger.
- **Stale dev CI (Option A guard):** A CI run for an old `dev` SHA completes after a newer feature push has landed. The guard queries the most recent COMPLETED CI run on `dev` via `gh run list --branch dev --workflow ci.yml --status completed`; if that run's `headSha` differs from `workflow_run.head_sha`, the run is stale -> `skip=true`. Close commits carry `[skip ci]` so they never appear in `gh run list` — the most-recent-completed-run head is always a feature/fix commit, which is exactly the staleness signal. (A naive `git rev-parse origin/dev` comparison is unsound: the close commit advances dev's tip during the CI run, guaranteeing a mismatch on every legitimate dispatch — see Review 3 F1.)
- **FID from merged PR (fallback):** If the squash-merge scope is missing/malformed but the merge commit is linked to a PR, recover FID from `gh api repos/$GITHUB_REPOSITORY/commits/$HEAD_SHA/pulls` -> PR body `bkit:fid` marker. Primary path is commit-scope; this is the fallback.
- **`bkit:auto` revoked mid-loop:** Issue label removed between dispatches -> kill switch fires on the next ctx-step label re-check -> `skip=true`. Halts the loop even under the cap.
- **Docs-only diff (Vercel cancel):** The dev path routes `dev CI failure -> /bkit-debug`. This is only correct for docs-only diffs if the consumer's `ci.yml` "Await Vercel Deployment" step neutralises a Vercel-CANCELED build (skip e2e, stay green) rather than red-ing it. If a consumer reds on Vercel-CANCELED, every docs-only squash-merge to dev false-dispatches `/bkit-debug` and burns cap budget. This invariant is asserted in `plan-input.md` and must be manually verified per target consumer (see Task 10).

### Concrete Example

**Role:** bkit consumer repo operator (e.g. `app-gether-life`).
**Starting state:** Issue #142 is `bkit:auto`-labeled. PR #500 (`feat/142-add-auth`) passed pre-merge CI and is about to be squash-merged by `/bkit-ship`.

1. `/bkit-ship` Step 6 squash-merges PR #500 to `dev` with subject `feat(142-add-auth): add OAuth flow (#500) bkit [auto route]` (the `bkit [auto route]` suffix threaded by Step 5 because the issue carries `bkit:auto`).
2. `/bkit-ship` Step 13 commits `docs(142-add-auth): ship DONE bkit [skip ci]` and pushes it to `dev` (`bkit-ship.md:1258,1261-1265`) — no CI, no cloud trigger. `dev`'s tip is now this close commit.
3. Post-merge CI runs on `dev` against the squash-merge SHA (triggered by the Step 6 push). It **fails** (a post-merge-only integration test broke).
4. `workflow_run` fires. The gate matches (`bkit [auto route]` is in the squash-merge subject). The ctx step: `BRANCH=dev` -> dev path -> `CONCLUSION=failure` -> `PHASE=debug`. FID from commit scope `142-add-auth` -> `ISSUE=142`. Stale-run guard (Option A): `gh run list --branch dev --workflow ci.yml --status completed` -> most-recent completed run's headSha == the squash-merge SHA == `workflow_run.head_sha` -> not stale. Loop cap: distinct `dev-dispatch` headSha count for `142-add-auth` = 0 < 3 -> proceed. Kill switch: `bkit:auto` still on #142 -> proceed. Write `dev-dispatch` row (headSha = squash-merge SHA), commit `docs(142-add-auth): dev-dispatch telemetry [skip ci]`, push to dev. Set `phase=debug arg=142-add-auth`.
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
| T6 | `bkit-auto` accepts non-numeric ARG as FID (CI_DEV mode) | Bash unit: `ARG=363-widen-bkit-cloud-trigger` -> `MODE=CI_DEV`, no `gh pr view` call (asserted via sentinel — Task 2 F1); `ISSUE_ID=363` derived |
| T7 | `bkit-auto` CI_DEV skips `PR_STATE != OPEN` + `feat/` prefix asserts | Read: Steps 7 and 10 gated on `MODE=CI` only; Step 9 (PR-body extraction) also gated |
| T8 | `bkit-debug` existing fallback creates `fix/{FID}` off `origin/dev` | Read: `bkit-debug.md:318-327` fallback path verified (no code change required); `git diff --exit-code -- .bkit/workflows/bkit-debug.md` exits 0 (Task 3 F2) |
| T9 | `bkit-ship` squash `--subject` includes `bkit [auto route]` when `bkit:auto` | Bash unit: `LABELS` contains `bkit:auto` -> subject ends with `bkit [auto route]` |
| T10 | `MAX_DEV_DISPATCH_ATTEMPTS=3` in counter-bus-config | `grep MAX_DEV_DISPATCH_ATTEMPTS .bkit/scripts/bkit-counter-bus-config.sh` |
| T11 | Mirrors regenerated (`.claude/`, `.cursor/`, `.opencode/` in sync) | `pnpm bkit upgrade --dry-run` produces no diff on canonical files |
| T12 | Version bumped 4.10.0 -> 4.11.0 | `jq -r .version package.json` = `4.11.0`; `grep pinnedVersion .bkit/version` = `4.11.0` (re-verified: dev is still on 4.10.0, so the bump target is unchanged) |
| T13 | Ctx step recovers FID from a `fix/**` branch (v4/P2) | Bash unit: `BRANCH=fix/363-widen-bkit-cloud-trigger` -> `FID=363`; `BRANCH=fix/bar-123-auth` -> `FID=bar-123`; `BRANCH=feat/141-cloud-app` -> unchanged from today |
| T14 | `bkit-auto` Step 10 accepts `fix/` (v4/P2) | Dry-run `MODE=CI BRANCH=fix/363-widen-bkit-cloud-trigger` reaches Step 11, NOT the Failure Path, with `FID=363-widen-bkit-cloud-trigger`; `BRANCH=chore/x` still routes to the Failure Path |
| T15 | `fix/**` failure loop is capped; success + `feat/**` are not (v4/P3) | Bash unit: `BRANCH=fix/363-x CONCLUSION=failure` + 3 distinct-headSha rows -> `skip=true`; `fix/**` + `success` -> `phase=ship`, cap unconsulted; `feat/**` + `failure` -> `phase=debug`, unconsulted |
| T16 | Dev path is tracker-agnostic (v4/P5) | Bash unit: `COMMIT_MSG="feat(bar-123-auth): x"` on `BRANCH=dev` -> `FID=bar-123-auth`, `ISSUE=bar-123` (Linear shape admitted, not silently no-op'd) |
| T17 | Counter write fails CLOSED (v4/P6) | Bash unit with a `git` stub whose `push` always fails and whose `origin/dev` lacks the row -> assert `skip=true` + fail-closed notice, and that no `phase=`/`arg=` pair is emitted |

---

## Breaking Changes & Naming Review

**`fix/**` surface newly routed (behaviour change — documented, not a regression).** Today `workflow_run.branches: ['feat/**']` excludes `fix/**`, so a `/bkit-debug`-created `fix/{FID}` PR's green CI does NOT auto-dispatch `/bkit-ship` — the debug orchestrator owns the merge (LOCAL direct push, or waits for manual merge). After this plan, `fix/**` CI success -> `workflow_run` -> ctx step `else` branch -> `gh pr list --head fix/{FID} --base dev` -> PR found -> `phase=ship` -> cloud auto-merges the fix PR. This is the intended folding (matches the routing table), but it IS a behaviour change to `/bkit-debug`'s fix-PR lifecycle: `/bkit-debug`-created fix PRs will now be auto-merged by the cloud on green CI. The `feat/**` pre-merge path is preserved byte-for-byte; the "preserved" claim is scoped to `feat/**` only.

> [!WARNING]
> **P2 — v3's `fix/**` folding was INERT, and its no-op was silent (v4 correction).** Adding `fix/**` to `workflow_run.branches` alone does nothing, because three downstream surfaces are `feat/`-only. Verified against dev @ d87c8641:
>
> 1. **ctx-step FID fallback is `feat/`-only** (`bkit-cloud.yml:198`): `FID=$(echo "$BRANCH" | sed 's|^feat/||' | grep -oE '^[0-9]+|^[a-z]+-[0-9]+')`. For `BRANCH=fix/363-widen-bkit-cloud-trigger` the `sed` is a no-op and neither alternation matches (`^[0-9]+` fails on `f`; `^[a-z]+-[0-9]+` needs `fix-363`, the string has `fix/363`) -> `FID` empty.
> 2. **The PRIMARY path cannot rescue it.** `bkit-debug.md:1244-1249` creates the fix PR with a body containing only a plan-doc link inside `bkit:start/end` — **no `bkit:issue=` / `bkit:fid=` markers** (`grep -c 'bkit:fid=' .bkit/workflows/bkit-debug.md` = 0). So the marker parse yields empty too, and the ctx step takes the `Cannot derive FID/ISSUE` fail-safe exit.
> 3. **`bkit-auto.md:118` hard-rejects the branch anyway**: `**If** BRANCH does NOT start with feat/ -> **Failure Path**`. This fires in `MODE=CI` (a `fix/**` PR run IS `MODE=CI` with a numeric PR ARG), so even if 1+2 were fixed the dispatch would land in the Failure Path — which posts a failure comment and sets `bkit:failed`. That is strictly **worse** than today's silence.
>
> Net: as written in v3, every `fix/**` CI completion no-ops at the ctx step (best case) or fails the issue (if 1+2 are fixed in isolation). The Breaking-Changes claim above ("cloud auto-merges the fix PR") could not occur. v4 adds **Tasks 11-13** to make the folding real, per the issue pivot comment's "fix/** is a pre-existing routing gap worth folding in".
>
> **P3 — the `fix/**` failure loop is unbounded.** `MAX_DEV_DISPATCH_ATTEMPTS` is gated on `BRANCH = dev`. A `fix/**` CI **failure** dispatches `/bkit-debug`, whose fix push re-reds CI, which dispatches again — the exact cross-session feedback loop the cap exists to bound, on the surface this plan newly opens, with no bound at all. v4 rekeys the cap on the **FID** (not the branch) and applies it to both post-`feat/**` surfaces; see Task 1f and Task 13.

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

6. **(v4) P5 — the dev-path FID regex must be tracker-agnostic.** Decision: **the commit-scope regex and the FID slug allowlist accept BOTH tracker shapes**, matching the existing `feat/**` fallback at `bkit-cloud.yml:198` (`'^[0-9]+|^[a-z]+-[0-9]+'`). v3 hard-coded the GitHub shape only — scope regex `^\w+\(([0-9]+-[a-z0-9-]+)\):`, allowlist `^[0-9]+-[a-z0-9-]+$`, and `ISSUE=$(printf '%s' "$FID" | grep -oE '^[0-9]+')`. A Linear-tracker consumer's FID is `bar-123-slug`, which fails all three, so **the dev trigger would silently never fire for any Linear consumer** — a fail-safe no-op that looks identical to "no marker", giving the operator no signal. bkit's shipped surface must be tracker-independent (`.agents/rules.md`; the existing ctx-step fallback already honours this). v4 widens to allowlist `^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$` and derives `ISSUE` via `grep -oE '^[0-9]+|^[a-z]+-[0-9]+'` — the same alternation the `feat/**` path already uses. Applies identically to `bkit-auto.md` Step 1.5's CI_DEV `ISSUE_ID` derivation.

7. **(v4) P6 — the counter write must fail CLOSED, not open.** Decision: **on telemetry push failure, re-fetch and retry once; if the row still is not on `dev`, `skip=true` and do NOT dispatch.** v3 tolerated a rejected push with `git push origin dev || echo "::notice::… row already on dev for this headSha; continuing."` and dispatched anyway. That claim only holds for the specific dual-job race it names; any other non-fast-forward (dev advanced for an unrelated reason — a concurrent ship close commit, a Renovate merge) also rejects the push, and then the row exists in NO durable location while the dispatch proceeds. Every such cycle is uncounted, so `MAX_DEV_DISPATCH_ATTEMPTS` never trips and the loop bound is defeated — precisely the failure mode the cap is a cost/security control against (Security section: "Without it, a stuck `dev` feedback loop could dispatch unbounded paid agent sessions"). A control that silently degrades to unbounded is worse than no control, because the plan's own text asserts the loop is bounded. Fail-closed is the correct posture: an undispatched debug costs one operator `workflow_dispatch`; an unbounded loop costs unbounded agent spend. See the revised Task 1f bash.

**Assumptions:**

- The squash-merge `--subject` set by `bkit-ship` Step 5 preserves the PR title verbatim, which follows `feat({FID}): ...` convention. This is already the case (`bkit-ship.md:634-635`: `--subject "$(gh pr view {PR_NUMBER} --json title --jq .title) (#{PR_NUMBER})"`).
- `workflow_run.head_commit.message` on a `dev` push is the push's HEAD commit message — i.e. the squash-merge subject. This is GHA's documented behaviour for `workflow_run` events.
- CI on `dev` runs on every push (the consumer repo's CI workflow triggers on `push: branches: [dev]`). This is the existing contract in `docs/deployments.md`.
- `fix/{FID}` is the established debug-fix branch convention (referenced in `bkit-ship` Step 5 line 630, git rules line 31). The existing `bkit-debug.md:318-327` fallback already creates it off `origin/dev`.
- The consumer's CI workflow is named "CI" (so `gh run list --workflow CI` resolves it). This matches `bkit-cloud.yml`'s `workflows: [CI]` trigger. **(v4 correction)** It does NOT match `bkit-ship.md` — that file uses the **filename** form `--workflow ci.yml` throughout (`bkit-ship.md:543,546`; v3 cited `:610`'s `--workflow CI`, which no longer exists). `gh run list --workflow` accepts either a name or a filename, so both resolve, but the stale-guard should use the **`ci.yml` filename form** for consistency with every other `gh run list` call bkit ships, and because the workflow _name_ is consumer-editable free text while the filename is fixed by `bkit install`. Task 1f bash updated accordingly.

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

- **`main` branch trigger — DEFERRED, and this is a REVERSAL of a settled issue decision (P4).** Production trunk never auto-dispatches a cloud agent; `main` stays manual-only (`workflow_dispatch`). **This contradicts #363's pivot comment D-final** ("verify at **both `dev` (post-merge) and `main` (post dev->main promotion)** — `main` CI's e2e-await covers the _production_ deploy, folding the prod gap into the same mechanism"), whose routing table and diff both list `main`. v3 dropped it into Out of Scope without flagging the reversal, and scope-check-2 passed the plan as "zero silent drops" — that verdict was wrong on this item.
  - **Why the exclusion is still the right call:** the issue's own **open item 3** never resolved it — "routing on `main` only works if the promotion commit carries the marker. bkit has no consumer-facing dev->main promotion workflow, so confirm where that commit is authored (may be out of bkit's control for some consumers)." With no bkit-authored promotion commit, there is nothing to thread `bkit [auto route]` onto, so a `main` trigger would be gated shut by construction for exactly the consumers it targets. Shipping it would be dead configuration plus a live risk of a paid agent dispatching against production trunk.
  - **Required bookkeeping (Task 14):** append a `docs/deferrals.jsonl` row recording the reversal + rationale + the unresolved promotion-commit-authorship precondition, and post the decision change on #363. Do not let this stay an unrecorded silent drop.
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

- [x] `bkit-cloud.yml` template is at `.bkit/templates/.github/workflows/bkit-cloud.yml` (canonical source; `.github/workflows/bkit-cloud.yml` is the installed copy). The ctx step `shared-deriv` block is a `# bkit:start shared-deriv` / `# bkit:end shared-deriv` managed block, duplicated across both jobs (`run`/claude at lines 190-214 and `opencode` at lines 325-344). Both copies must be extended identically. The `if [ "$BRANCH" = "dev" ]` guard is inserted AFTER the `case "$CONCLUSION"` routing and BEFORE the `gh pr list` PR-lookup (which moves into the `else` branch); the `shared-deriv` markers extend upward to encompass the new guard.
- [x] The existing ctx step `env:` block carries `GH_TOKEN, EVENT, IN_PHASE, IN_ISSUE, CONCLUSION, BRANCH` only. `COMMIT_MSG` and `HEAD_SHA` must be ADDED to the `env:` block (injection-safe). `$GITHUB_WORKSPACE` and `$GITHUB_REPOSITORY` (GHA-provided) are used for sourcing `bkit-counter-bus-config.sh` and `gh api` repo path — `$REPO_ROOT` is NOT defined in the ctx step (v1 defect).
- [x] **(v4 — REPLACES the stale v3 anchor.)** `bkit-ship.md` no longer derives `AUTO_ROUTE_SUFFIX` anywhere: #384 (80660ac0) deleted both the Step-4 conflict-resolve derivation (old lines 483-485) and the Step-6 dev-sync derivation (old lines 625-630), and removed the `chore({FID}): sync dev` merge commit. Verify before editing: `grep -c 'AUTO_ROUTE_SUFFIX' .bkit/workflows/bkit-ship.md` -> `0`. The squash `--subject` is now at **line 682** (was 634-635) inside the `gh pr merge --squash --delete-branch --match-head-commit` block. Task 4 must ADD the derivation and thread it — mirror `bkit-build.md:1261`.
- [x] **(v4) All other `bkit-ship.md` anchors re-verified against dev @ d87c8641** — every v3 line number was authored against 2ee0da16 and is stale: HEAD-Subject Assertion `598` -> **647**; squash `--subject` `634-635` -> **682**; ship-DONE close commit `1206` -> **1258**; close-commit push `1211` -> **1261-1265** (now conditional on `RUNTIME_DEVPUSHES`); CI-wait idiom `610` -> **546**, and it is `--workflow ci.yml`, **not** `--workflow CI` (see Assumptions).
- [x] **(v4) `RUNTIME_DEVPUSHES` caveat on the close-commit narrative.** `bkit-ship.md:1261-1265` pushes the `docs({FID}): ship DONE bkit [skip ci]` close commit to `dev` **only when `RUNTIME_DEVPUSHES = true`** (LOCAL / GITHUB_ACTION / CLOUD_CURSOR per `bkit-runtime.sh:167-177`); under `CLOUD_CLAUDE` / `UNKNOWN` it stays on the working branch. The plan's edge-case narrative ("dev's tip is the close commit by the time the cloud workflow boots") therefore holds for the common runtimes but is not universal. This does NOT weaken stale-run guard Option A — that guard reads CI-run recency, never dev's tip, so it is correct under both runtimes. No task change; recorded so a builder does not "fix" the guard back to a tip comparison.
- [x] `bkit-auto.md` Step 1.5 (line 85) assumes `MODE=CI` -> `PR_NUMBER="$ARG"` (numeric). The CI_DEV extension discriminates on ARG shape (numeric = CI/PR, non-numeric = CI_DEV/FID). Steps 6-10 (lines 86-118) and Step 9 (lines 93-117, PR-body extraction) must be gated on `MODE=CI`.
- [x] `bkit-debug.md` Step 2 worktree fallback (`bkit-debug.md:318-327`) ALREADY creates `fix/{FID}` off `origin/dev` when `feat/{FID}` is absent — the post-merge condition. NO code change needed in `bkit-debug` (v1's redundant `CI_DEV` branch-selection edit is dropped).
- [x] `bkit-counter-bus-config.sh` bkit-debug section is at lines 16-19. `MAX_DEV_DISPATCH_ATTEMPTS` goes under a NEW `# bkit-cloud.yml counters` section header (it is consumed by the cloud ctx step, not bkit-debug).
- [x] `bkit-ship.md:1258` (v3 said 1206) close commit is `docs({FID}): ship DONE bkit [skip ci]` (re-verified) — NOT `chore({FID}): merge-pr attempt N` (v1's misidentifier; that per-attempt telemetry commit no longer exists in the #384 Path A/B structure at all).
- [x] **(v4) `bkit-auto.md` + `bkit-debug.md` + `bkit-cloud.yml` anchors all re-verified and STILL CORRECT** — only `bkit-ship.md` drifted. Confirmed on dev @ d87c8641: `bkit-auto.md` Step 1.5 = line 85, Steps 6/7/8 = 86/87/88, Step 9 = 93-117, Step 10 = 118, Step 11 comment = 126-134, Gate 1 = 141. `bkit-debug.md` 3-way worktree fallback = 318-327 (`git worktree add` at 320/323/326), Step 1.6 PUSH_MODE = 179-181. `bkit-cloud.yml` header = 14-19, trigger = 31, concurrency = 73-74, `case "$CONCLUSION"` = 177, `gh pr list` = 182, `shared-deriv` = 190-214 (claude) / 325-344 (opencode).
- [x] **(v4) `bkit-debug`'s mint-mode fallback is reachable in this runtime.** Task 3's verify-only premise depends on `RUNTIME_WORKTREES = true`, since adopt mode (`bkit-runtime.sh:195-200`) sets `WORKTREE_PATH=$REPO_ROOT` and does NO `git worktree add` — the 3-way fallback at `bkit-debug.md:318-327` never runs there. `bkit-runtime.sh:167-172` maps `GITHUB_ACTION` -> `RUNTIME_WORKTREES=true`, and `bkit-cloud.yml` dispatches on a GH-Actions runner, so mint mode holds for the dev-trigger path. Note `workflows.md:113`: adopt mode "refuses outright if that branch is `dev`" — so under a hypothetical `RUNTIME_WORKTREES=false` cloud dispatch the dev path would refuse rather than corrupt `dev`. Fail-safe either way; recorded so Task 3 asserts the runtime, not just the file.
- [x] Consumer repos (`app-gether-life`, `visitfrasercoast-com`) run CI on `push: branches: [dev]` — verify in their CI workflow (documented in `docs/deployments.md`). **(verify-1-3)** Confirmed against both checkouts: `app-gether-life/.github/workflows/ci.yml` `on.push.branches: [main, dev]`; `visitfrasercoast-com/.github/workflows/ci.yml` `on.push.branches: [main, dev]`.

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
- **(v4) One row type, both post-`feat/**` surfaces.** The `dev-dispatch` type is also written for `fix/**` CI-failure dispatches (P3), keyed on the same FID — a FID gets ONE post-`feat/**` debug budget however the failure surfaced. The name is kept for schema stability; the `type` is not re-namespaced per branch. `feat/**` never writes this row.
- **(v4) Fail-closed write.** The row must be verified present on `origin/dev` before dispatch; if the push cannot land it, the run skips instead of dispatching uncounted (P6). A `dev-dispatch` row that exists only in the runner's workspace is equivalent to no row at all.
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
       # v4/P5: scope regex accepts BOTH tracker shapes — GitHub `363-slug` and
       # Linear `bar-123-slug` — mirroring the alternation the feat/** fallback
       # already uses at bkit-cloud.yml:198. A GitHub-only regex silently no-ops
       # the whole dev trigger for every Linear-tracker consumer.
       FID=$(printf '%s' "$COMMIT_MSG" | grep -oE '^\w+\((([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+)\):' | sed -E 's/^\w+\(([^)]+)\):/\1/' | head -1 || true)
       if [ -z "$FID" ]; then
         # Fallback: gh api merge-commit linked PR -> PR body bkit:fid marker.
         PR_BODY=$(gh api "repos/${GITHUB_REPOSITORY}/commits/${HEAD_SHA}/pulls" --jq '.[0].body // empty' 2>/dev/null || echo "")
         FID=$(printf '%s' "$PR_BODY" | grep -oE 'bkit:fid=[^[:space:]>]+' | sed 's/bkit:fid=//' | head -1 || true)
       fi
       if [ -z "$FID" ] || ! [[ "$FID" =~ ^([0-9]+|[a-z]+-[0-9]+)-[a-z0-9-]+$ ]]; then
         echo "::notice::Cannot derive FID by dev commit scope or linked PR — no-op exit (fail-safe)."
         echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
       fi
       ISSUE=$(printf '%s' "$FID" | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1)
       ARG="$FID"
       # Stale-run guard (Option A): HEAD_SHA is current iff it is the headSha of the most
       # recent COMPLETED CI run on dev. Close commits carry [skip ci] so they never appear
       # in gh run list; only feature/fix commits do — the most-recent-completed-run head is
       # exactly the staleness signal. (A git rev-parse origin/dev comparison is unsound:
       # /bkit-ship Step 13 pushes docs({FID}): ship DONE bkit [skip ci] to dev during the
       # dev CI run, so dev's tip is the close commit by the time the cloud workflow boots.)
       # v4: --workflow ci.yml (filename), not `CI` (name). Both resolve, but the
       # filename is fixed by `bkit install` while the display name is consumer-
       # editable free text, and every other gh run list call bkit ships uses the
       # filename form (bkit-ship.md:546).
       LATEST_CI_SHA=$(gh run list --branch dev --workflow ci.yml --status completed --limit 10 \
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
       # v4/P6 — FAIL CLOSED. A rejected push is NOT automatically the dual-job race:
       # any non-fast-forward (a concurrent ship close commit, a Renovate merge) rejects
       # too, and then the row exists nowhere durable while the dispatch proceeds. Every
       # such cycle would be uncounted, so the cap never trips and the loop bound this
       # plan advertises silently degrades to unbounded paid agent spend. Retry once
       # against a re-fetched dev, then VERIFY the row is actually on origin/dev — that
       # verification is also what keeps the genuine dual-job race safe, since the
       # sibling job's row for the same headSha satisfies it.
       if ! git -C "$GITHUB_WORKSPACE" push origin dev 2>/dev/null; then
         git -C "$GITHUB_WORKSPACE" fetch origin dev
         git -C "$GITHUB_WORKSPACE" rebase origin/dev || { git -C "$GITHUB_WORKSPACE" rebase --abort || true; }
         git -C "$GITHUB_WORKSPACE" push origin dev 2>/dev/null || true
       fi
       git -C "$GITHUB_WORKSPACE" fetch origin dev
       LANDED=$(git -C "$GITHUB_WORKSPACE" show "origin/dev:${STATUS_FILE}" 2>/dev/null \
         | jq -s --arg f "$FID" --arg h "$HEAD_SHA" \
             '[.[] | select(.type=="dev-dispatch" and .fid==$f and .headSha==$h)] | length' 2>/dev/null || echo 0)
       if [ "${LANDED:-0}" -lt 1 ]; then
         echo "::notice::dev-dispatch row for $FID @ $HEAD_SHA is not on origin/dev after retry — refusing to dispatch uncounted (fail-closed). Resolve the dev push contention and re-run via workflow_dispatch."
         echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
       fi
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
         # v4/P2: strip fix/ as well as feat/. bkit-debug's fix PR body carries NO
         # bkit:fid= marker (bkit-debug.md:1244-1249), so fix/** ALWAYS lands here —
         # a feat/-only strip leaves 'fix/363-...', which matches neither alternation
         # and no-ops the entire fix/** surface this plan claims to fold in.
         # NOTE the '#' sed delimiter: with the '|' delimiter the alternation would
         # have to be escaped as \| and is then ambiguous under -E. Do not "simplify".
         FID=$(echo "$BRANCH" | sed -E 's#^(feat|fix)/##' | grep -oE '^[0-9]+|^[a-z]+-[0-9]+' | head -1)
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
       # v4/P3 — bound the fix/** debug loop. A fix/** CI FAILURE dispatches /bkit-debug,
       # whose fix push re-reds CI, which dispatches again: the same cross-session loop
       # MAX_DEV_DISPATCH_ATTEMPTS exists to bound, on a surface this plan newly opens.
       # v3 keyed the cap on BRANCH = dev, leaving fix/** unbounded. The counter is keyed
       # on the FID (shared with the dev path — one FID's post-feat debug budget, however
       # the failure surfaced), so the dev and fix/** cycles for a FID share one budget.
       # feat/** is deliberately NOT capped: it is pre-merge, PR-scoped, and already
       # bounded by the in-session MAX_DEBUG_ATTEMPT / MAX_NORMAL_ATTEMPT counters.
       case "$BRANCH" in
         fix/*)
           if [ "$PHASE" = "debug" ]; then
             bkit_dev_dispatch_guard "$FID" "$HEAD_SHA" || { echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0; }
           fi
           ;;
       esac
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

   **(v4) `bkit_dev_dispatch_guard` — factor the cap block into one shell function.** The dev branch and the new `fix/**` branch (P3) need byte-identical cap-check + counter-write + fail-closed-verify logic, and the block is ~35 lines. Duplicating it inline in two branches × two jobs = four copies is a drift hazard the `shared-deriv` marker pair exists to prevent. Define it ONCE at the top of the `else` (CI-driven) arm, inside `shared-deriv`, as `bkit_dev_dispatch_guard <FID> <HEAD_SHA>`, and call it from both branches. It encapsulates, in order: source `bkit-counter-bus-config.sh`; resolve `STATUS_DIR`/`STATUS_FILE`; count distinct `dev-dispatch` headShas for the FID; `return 1` with the operator-review `::notice::` if `>= MAX_DEV_DISPATCH_ATTEMPTS`; else append the row, commit `docs($FID): dev-dispatch telemetry [skip ci]`, push with retry, verify the row landed on `origin/dev`, and `return 1` with the fail-closed `::notice::` if it did not. `return 0` = proceed to dispatch. The dev branch's inline block above is the function body; the caller writes `bkit_dev_dispatch_guard "$FID" "$HEAD_SHA" || { echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0; }`. Note the row `type` stays `dev-dispatch` for both surfaces — one budget per FID, one row type, no schema change (see Data Schema).

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

   **(v4/P2) The `MODE=CI` gate is not sufficient — Step 10 must also accept `fix/`.** A `fix/**` PR run IS `MODE=CI` (numeric PR ARG, open PR), so gating Step 10 on `MODE=CI` leaves it firing for exactly the surface this plan newly folds in, and its verbatim text today is `**If** BRANCH does NOT start with feat/ -> **Failure Path**. **Else** -> FID="${BRANCH#feat/}"`. That routes every `fix/**` dispatch into the Failure Path, which posts a failure comment and sets `bkit:failed` on the issue — strictly worse than today's silence. Rewrite Step 10 to accept both prefixes and strip whichever matched:

   ```bash
   case "$BRANCH" in
     feat/*) FID="${BRANCH#feat/}" ;;
     fix/*)  FID="${BRANCH#fix/}" ;;
     *) : ;;   # -> Failure Path
   esac
   ```

   Keep the existing post-strip asserts unchanged (`FID` non-empty, `FID != BRANCH`, `[[ "{FID}" =~ ^[a-z0-9][a-z0-9-]*$ ]]`). Note the existing charset assert already admits the Linear `bar-123-slug` shape, so no P5 change is needed here.

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

1. **(v4/P1 — REWRITTEN. v3's version of this item was authored against a file that no longer exists in that shape.)** v3 said: "Thread `AUTO_ROUTE_SUFFIX` (already derived on line 626) … This is the **entire** Option A change — one suffix appended to one `--subject` flag." That is now false. #384 (80660ac0) deleted every `AUTO_ROUTE_SUFFIX` derivation from `bkit-ship.md`; `grep -c 'AUTO_ROUTE_SUFFIX' .bkit/workflows/bkit-ship.md` returns **0**. Task 4 must therefore ADD the derivation as well as thread it, in the **same shell block** as the merge (the value must not be assumed to survive a Bash-tool-call boundary — this is why `bkit-debug.md:1253` says "set and use `AUTO_ROUTE_SUFFIX` in same shell").

   At **line 682** (v3 said 634-635), inside the existing `gh pr merge` block:

   ```bash
   # Before (dev @ d87c8641):
   if [ "$(gh pr view {PR_NUMBER} --json state --jq .state 2>/dev/null)" != "MERGED" ]; then
     gh pr merge {PR_NUMBER} --squash --delete-branch --match-head-commit "$GATE_HEAD" \
       --subject "$(gh pr view {PR_NUMBER} --json title --jq .title) (#{PR_NUMBER})" \
       --body ""
   fi
   # After:
   AUTO_ROUTE_SUFFIX=""
   echo "${LABELS:-}" | grep -q 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]" || true
   if [ "$(gh pr view {PR_NUMBER} --json state --jq .state 2>/dev/null)" != "MERGED" ]; then
     gh pr merge {PR_NUMBER} --squash --delete-branch --match-head-commit "$GATE_HEAD" \
       --subject "$(gh pr view {PR_NUMBER} --json title --jq .title) (#{PR_NUMBER})${AUTO_ROUTE_SUFFIX}" \
       --body ""
   fi
   ```

   The derivation idiom is copied verbatim from `bkit-build.md:1261` and `bkit-debug.md:1262`, which both still carry it — do NOT invent a new one. `{LABELS}` is populated at ship Step 1 from the tracker read (`bkit-ship.md:247` / `:250`); assert it is in scope in this block, since after #384 it is an agent-substituted placeholder rather than an exported shell var. When `bkit:auto` is labeled the squash-merge commit on `dev` carries the marker and the existing `bkit-cloud.yml` gate matches it for the `dev` trigger; when not, the suffix is empty and nothing changes. The HEAD-Subject Assertion (**`bkit-ship.md:647`**, v3 said 598) already rejects `[skip ci]` in PR titles, so the squash subject cannot accidentally carry a suppressor.

2. **(v4) Accepted cosmetic consequence — the marker becomes permanent `dev` history.** Until now `bkit [auto route]` only ever appeared on ephemeral `feat/{FID}` commits that were squashed away at merge. Threading it onto the squash `--subject` puts it in `git log dev` forever, and into anything generated from commit subjects (release notes, `git shortlog`). This is inherent to Option A — the gate reads `head_commit.message`, so the marker must be on the commit that lands. Accepted, not a defect; recorded so it is not "cleaned up" later by someone who does not know it is load-bearing. `.bkit/workflows.md` § `bkit [auto route]` Marker Propagation should gain the squash-merge row (folded into Task 5's doc sweep).

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

3. **Consumer-repo acceptance note (Task 10 owner surface — scope-check F3):** A dedicated "Consumer-repo acceptance note" section in this same file (co-located with the `dev` CI/CD matrix row added by Task 6) documents that the full happy-path loop is only exercisable on consumer repos with `bkit-cloud.yml` installed and secrets wired. This resolves the prior `.bkit/cloud.md` **or** `docs/deployments.md` disjunction to a single concrete owner file so a builder/reviewer is not guessing.

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
| `docs/deployments.md` | CI/CD matrix `dev` branch row + auto-route contract update + docs-only-diff precondition + consumer-repo acceptance note (Task 10 — scope-check F3 resolved here) |
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
>
> **(v4) Same-file note extends to the new tasks.** Tasks **11** and **13** edit the SAME `bkit-cloud.yml` ctx step as Task 1 — apply all three in ONE edit pass over that managed block, or the second pass will fight the first. Task **12** edits the same `bkit-auto.md` Step 1 region as Task 2 — apply together. Task **14** is independent bookkeeping. Ordering: `1+11+13` -> `2+12` -> `3`-`7` -> `8` -> `9`. Task 4 carries a **PRE-CHECK that voids the task** if its premise has shifted again since this revision (P1) — run it before touching `bkit-ship.md`.

### Task 1 — Cloud trigger surface (trigger widen + concurrency + ctx step dev branch + counter-bus-config + dev-dispatch write)

- [x] **Scope:** `.bkit/templates/.github/workflows/bkit-cloud.yml` (both `run`/claude and `opencode` jobs) + `.bkit/scripts/bkit-counter-bus-config.sh`.
- [x] **Depends on:** none.
- [x] **Sub-step 1a — counter-bus-config:** Add `# bkit-cloud.yml counters` section with `MAX_DEV_DISPATCH_ATTEMPTS=3` after the bkit-debug section (Review 2 L12 — new section header, not crammed under bkit-debug).
- [x] **Sub-step 1b — trigger filter:** Change `workflow_run.branches` from `['feat/**']` to `['feat/**', 'fix/**', 'dev']`.
- [x] **Sub-step 1c — concurrency:** Change `cancel-in-progress` from `true` to `${{ github.event.workflow_run.head_branch != 'dev' }}`.
- [x] **Sub-step 1d — header comment:** Replace lines 14-19 with the verbatim text in Architecture section item 1 (Review 2 L11).
- [x] **Sub-step 1e — ctx step env (both jobs):** Add `COMMIT_MSG: ${{ github.event.workflow_run.head_commit.message }}` and `HEAD_SHA: ${{ github.event.workflow_run.head_sha }}` to the `env:` block (injection-safe — Review 1 M3).
- [x] **Sub-step 1f — ctx step run (both jobs):** Insert the `if [ "$BRANCH" = "dev" ]` branch after the `case "$CONCLUSION"` and before `gh pr list`; move PR-lookup into `else`; extend `shared-deriv` markers. Implement: commit-scope FID recovery (primary) + `gh api repos/$GITHUB_REPOSITORY/commits/$HEAD_SHA/pulls` (fallback — Review 2 M4); FID slug assertion; dev-success -> skip; stale-run guard Option A (`gh run list --branch dev --workflow ci.yml --status completed` — Review 3 F1); loop cap (`. "$GITHUB_WORKSPACE/.bkit/scripts/bkit-counter-bus-config.sh"` — Review 1 M2 / Review 2 #3; distinct headSha count); kill switch (`bkit:auto` re-check); dev-dispatch write + `git commit -m "docs($FID): dev-dispatch telemetry [skip ci]"` + push (Review 1 H1 / Review 2 #2 / Review 3 F3 — writer co-located with reader, before dispatch). **(v4)** The push is **fail-closed**, not `|| <notice>`: retry against a re-fetched `dev`, then verify the row is on `origin/dev`, else `skip=true` (P6). FID recovery is **tracker-agnostic** — both `363-slug` and `bar-123-slug` shapes (P5). The cap block is factored into `bkit_dev_dispatch_guard` so Task 13 can reuse it for `fix/**` (P3).
- [x] **Done when:**
  - `yq '.on.workflow_run.branches' .bkit/templates/.github/workflows/bkit-cloud.yml` contains `dev`.
  - `yq '.concurrency.cancel-in-progress'` is the dev-discriminating expression.
  - Both jobs' ctx `env:` blocks contain `COMMIT_MSG` and `HEAD_SHA`.
  - `grep MAX_DEV_DISPATCH_ATTEMPTS .bkit/scripts/bkit-counter-bus-config.sh` returns the line; `source` the file and `echo $MAX_DEV_DISPATCH_ATTEMPTS` prints `3`.
  - Bash dry-run (harness below): `BRANCH=dev CONCLUSION=failure COMMIT_MSG="feat(363-widen-bkit-cloud-trigger): test (#1) bkit [auto route]"` -> `phase=debug`, `arg=363-widen-bkit-cloud-trigger`, `skip=false`; `BRANCH=dev CONCLUSION=success` -> `skip=true`; seed 3 distinct-headSha `dev-dispatch` rows -> `skip=true` + notice.
- [x] **Test ref:** T1, T2, T3, T4, T5, T10.

**Dry-run harness (Task 1f):** Extract the `run:` block via `yq -r '.jobs.run.steps[] | select(.name=="Resolve phase + brief context") | .run' .bkit/templates/.github/workflows/bkit-cloud.yml`. `export GITHUB_OUTPUT=$(mktemp) GITHUB_WORKSPACE="$PWD" GITHUB_REPOSITORY="owner/repo"`; export `BRANCH`/`CONCLUSION`/`COMMIT_MSG`/`HEAD_SHA`/`EVENT`; stub `gh` (e.g. `GH_HOST=invalid` for fail-safe paths, or a shell function returning canned JSON for `gh run list`/`gh issue view`); read `$GITHUB_OUTPUT` to assert `phase=`/`arg=`/`skip=` (Review 2 L13). This same harness pattern is reused by Task 2's `gh pr view` sentinel (F1) and Task 9's regression dry-runs.

### Task 2 — Extend `bkit-auto.md` Step 1 for CI_DEV mode

- [x] **Scope:** `.bkit/workflows/bkit-auto.md` Step 1, lines 85-118 + Step 11 comment (lines 126-134) + Gate 1 checklist (line 141).
- [x] **Depends on:** Task 1 (ctx step must dispatch non-numeric ARG for CI_DEV to be reachable).
- [x] Step 1.5: discriminate `[[ "$ARG" =~ ^[0-9]+$ ]]` -> CI (PR_NUMBER) vs CI_DEV (FID, ISSUE_ID from numeric prefix, BRANCH=dev, HEAD_SHA, PR_STATE=MERGED, RUN_ID="").
- [x] Steps 6-8: gate on `MODE=CI`; in CI_DEV the six vars are pre-set, skip `gh pr view`/RUN_ID.
- [x] Step 7 (`PR_STATE != OPEN -> Failure Path`): gate on `MODE=CI`.
- [x] Step 9 (`pull_request_read` PR-body FID extraction): gate on `MODE=CI` (Review 1 M5).
- [x] Step 10 (`BRANCH does NOT start with feat/ -> Failure Path`): gate on `MODE=CI`.
- [x] Step 11 comment: gate the `actions/run/{RUN_ID}` link on `MODE=CI` (or `[ -n "$RUN_ID" ]`) — CI_DEV omits it (Review 3 F6.3).
- [x] Gate 1 checklist: add `CI_DEV placeholders non-empty (FID, ISSUE_ID, BRANCH, HEAD_SHA, if MODE = CI_DEV)`.
- [x] ASCII-only operators in all `.bkit/workflows/*.md` edits (no non-ASCII arrows/quotes in managed blocks).
- [x] **Done when:** A dry-run invocation with `ARG=363-widen-bkit-cloud-trigger` (non-numeric) sets `MODE=CI_DEV`, `FID=363-widen-bkit-cloud-trigger`, `ISSUE_ID=363`, `BRANCH=dev`; Step 11 comment omits the actions link.
- [x] **Verification (scope-check F1 — observable negative):** The "does NOT call `gh pr view`" criterion is made observable by wiring the Task 1f harness `gh`-stubbing pattern to a sentinel. Before the Step 1.5 dry-run with `ARG=363-widen-bkit-cloud-trigger`, install a recording stub, e.g.:
  ```bash
  GH_CALLS=$(mktemp)
  gh() { echo "called: $*" >> "$GH_CALLS"; }
  export -f gh
  # ... run the Step 1.5 logic with ARG=363-widen-bkit-cloud-trigger ...
  ```
  After the dry-run, assert the sentinel contains no `pr view` invocation:
  ```bash
  ! grep -q 'pr view' "$GH_CALLS"   # exit 0 = pass (no pr view call recorded)
  ```
  This reuses the Task 1f harness precedent and gives a builder/reviewer a concrete, objective proof that CI_DEV mode skips the PR lookup — the negative criterion is no longer unobservable (scope-check-1 F1).
- [x] **Test ref:** T6, T7.

### Task 3 — Verify `bkit-debug.md` needs no changes (verify-only)

- [x] **Scope:** `.bkit/workflows/bkit-debug.md` — READ ONLY (no edits).
- [x] **Depends on:** none (verification of existing behaviour).
- [x] Confirm `bkit-debug.md:318-327` 3-way fallback creates `fix/{FID}` off `origin/dev` when `feat/{FID}` is absent (post-merge condition).
- [x] Confirm `bkit-debug.md:179-181` Step 1.6 `gh pr list --head $(git branch --show-current) --base dev` returns nothing for `fix/{FID}` (no open PR) -> `PUSH_MODE=LOCAL`.
- [x] Confirm NO `CI_DEV` references are added (the dead signal is dropped — Review 1 M4 / Review 2 #2; the `dev-dispatch` write lives in the cloud ctx step).
- [x] **Done when:** Read confirms both existing behaviours cover the dev path; no diff to `bkit-debug.md`.
- [x] **Verification (scope-check F2 — objective zero-diff proof):** The "no diff" criterion is made objective with an explicit exit-code check. Run after the full build completes (this task asserts the file is never touched by any other task):
  ```bash
  git diff --exit-code -- .bkit/workflows/bkit-debug.md   # exit 0 = no diff = PASS
  ```
  Equivalently, `git status --porcelain .bkit/workflows/bkit-debug.md` asserts empty output. This aligns the verification strength with the "no diff" criterion — a builder can no longer accidentally edit `bkit-debug.md` and pass on a soft "Read confirms" check (scope-check-1 F2).
- [x] **Test ref:** T8.

### Task 4 — Thread `AUTO_ROUTE_SUFFIX` into `bkit-ship.md` squash `--subject`

- [x] **Scope:** `.bkit/workflows/bkit-ship.md` — the `gh pr merge --squash` block at **line 682** (v3 said "Step 5, lines 634-635"; both the step structure and the line numbers changed under #384).
- [x] **Depends on:** none.
- [x] **PRE-CHECK (v4/P1 — do this first, the task is void if it fails):** `grep -c 'AUTO_ROUTE_SUFFIX' .bkit/workflows/bkit-ship.md` must return `0`. If it returns non-zero, #384's removal has been reverted since this plan was revised — re-read the file and re-scope this task before editing.
- [x] ADD the derivation immediately above the `gh pr merge` call, in the SAME shell block: `AUTO_ROUTE_SUFFIX=""` then `echo "${LABELS:-}" | grep -q 'bkit:auto' && AUTO_ROUTE_SUFFIX=" bkit [auto route]" || true`. Copy the idiom verbatim from `bkit-build.md:1261`; do not invent a variant.
- [x] Append `${AUTO_ROUTE_SUFFIX}` to the `--subject` value (after `(#{PR_NUMBER})`).
- [x] Assert `{LABELS}` is in scope in that block (populated at ship Step 1 tracker read, `bkit-ship.md:247`/`:250`). Under `bkit:tracker none` it is empty -> suffix empty -> no marker, which is correct.
- [x] **Done when:** Read: the `gh pr merge` block derives AND threads `${AUTO_ROUTE_SUFFIX}`; bash unit: `LABELS=bkit:auto` -> subject ends with `bkit [auto route]`; `LABELS=""` -> subject unchanged; `grep -c 'AUTO_ROUTE_SUFFIX' .bkit/workflows/bkit-ship.md` >= 3 (the plan's own verbatim spec snippet for this task already contains 3 matching lines before any prose; `= 2` was unsatisfiable by the plan's own text — corrected during build-plan-gaps-remediate-1-3, see CONCERN-1).
- [x] **Test ref:** T9.

### Task 5 — Update `.bkit/cloud.md` (decision log + routing table)

- [x] **Scope:** `.bkit/cloud.md`.
- [x] **Depends on:** none.
- [x] Add decision-log entry `## #363 — widen bkit-cloud trigger to post-merge dev CI`.
- [x] Document: Option A rationale; dev vs feat routing table; stale-run guard Option A (CI-run recency via `gh run list`, NOT git-tip — with the close-commit-race justification); loop-bound decision (cap=3 distinct headSha, all-time, written by ctx step before dispatch); concurrency decision (`cancel-in-progress: false` for dev — QUEUES not drops, queued run re-evaluates cap); FID recovery (commit scope + `gh api` fallback).
- [x] **Done when:** `cloud.md` contains the decision-log entry with the routing table and all decisions documented.
- [x] **Test ref:** N/A (documentation).

### Task 6 — Update `docs/deployments.md` (CI/CD matrix + auto-route contract + docs-only-diff precondition)

- [x] **Scope:** `docs/deployments.md`.
- [x] **Depends on:** none.
- [x] CI/CD matrix: add `dev` branch row (post-merge CI -> `workflow_run` -> success=no-op, failure=`/bkit-debug`).
- [x] Auto-route contract: document that `bkit [auto route]` is now threaded onto the squash-merge `--subject` (Option A), enabling the `dev` trigger gate.
- [x] Docs-only-diff precondition: note that the dev-trigger path assumes the consumer's `ci.yml` neutralises (not reds) Vercel-CANCELED builds (Review 3 F4). This is the AUTHORITATIVE location for that note; Task 10 cross-references it rather than restating it.
- [x] **Done when:** `deployments.md` CI/CD matrix includes a `dev` row with the post-merge routing + docs-only-diff precondition.
- [x] **Test ref:** N/A (documentation).

### Task 7 — Update `docs/security.md` § CI Auto-Route Trust

- [x] **Scope:** `docs/security.md` § CI Auto-Route Trust.
- [x] **Depends on:** none.
- [x] Add `dev` push trigger subsection: trust surface = squash-merge commit scope (FID slug allowlist); dynamic values via `env:` (injection-safe); no PR body; kill switch (label re-check) applies; loop cap (`MAX_DEV_DISPATCH_ATTEMPTS=3`, distinct headSha) as cost control.
- [x] **Done when:** `security.md` § CI Auto-Route Trust documents the `dev` trust surface.
- [x] **Test ref:** N/A (documentation).

### Task 8 — Mirror regen + version bump + CHANGELOG

- [x] **Scope:** `.bkit/version`, `package.json`, `CHANGELOG.md`, `.claude/`, `.cursor/`, `.opencode/`.
- [x] **Depends on:** Tasks 1-7 (must run after all canonical `.bkit/` edits).
- [x] Bump `.bkit/version` `pinnedVersion` 4.10.0 -> 4.11.0.
- [x] Bump `package.json` `version` 4.10.0 -> 4.11.0.
- [x] `CHANGELOG.md` Unreleased: add `widen bkit-cloud trigger to post-merge dev CI (#363)`.
- [x] Run `pnpm bkit upgrade` to regenerate `.claude/`, `.cursor/`, `.opencode/` mirrors from `.bkit/`.
- [x] Verify mirrors in sync: `git diff --stat` shows mirror files updated, `.bkit/` canonical files are the source.
- [x] ASCII-only operators in all `.bkit/workflows/*.md` and `.bkit/prompts/*.md` content (no non-ASCII arrows/quotes in managed blocks).
- [x] **Done when:** `jq -r .version package.json` = `4.11.0`; `grep pinnedVersion .bkit/version` = `4.11.0`; `CHANGELOG.md` has the entry; `pnpm bkit upgrade` produces no unexpected diff.
- [x] **Test ref:** T11, T12.

### Task 9 — In-repo validation

- [x] **Scope:** all changed files.
- [x] **Depends on:** Tasks 1-8.
- [x] YAML structure valid: `yq` parse `bkit-cloud.yml` (template + installed) succeeds; trigger filter + concurrency + ctx step all present.
- [x] Ctx step bash dry-run (harness per Task 1f): `BRANCH=dev CONCLUSION=failure COMMIT_MSG="feat(363-widen-bkit-cloud-trigger): test (#1) bkit [auto route]"` -> assert `phase=debug`, `arg=363-widen-bkit-cloud-trigger`, `skip=false`.
- [x] Ctx step bash dry-run: `BRANCH=dev CONCLUSION=success` -> assert `skip=true`.
- [x] Ctx step bash dry-run: seed 3 distinct-headSha `dev-dispatch` rows -> assert `skip=true` + notice; 3 same-headSha rows -> assert `skip=false` (distinct-cycle counting).
- [x] `bkit-auto` Step 1 dry-run: `ARG=363-widen-bkit-cloud-trigger` -> `MODE=CI_DEV`, no `gh pr view` (asserted via Task 2 F1 sentinel), `ISSUE_ID=363`.
- [x] `bkit-ship` Step 5 read: `--subject` includes `${AUTO_ROUTE_SUFFIX}`.
- [x] `bkit-counter-bus-config.sh` sources cleanly; `MAX_DEV_DISPATCH_ATTEMPTS=3`.
- [x] `bkit-debug.md` zero-diff: `git diff --exit-code -- .bkit/workflows/bkit-debug.md` exits 0 (Task 3 F2).
- [x] **(v4) `fix/**` dry-runs:** ctx step `BRANCH=fix/363-widen-bkit-cloud-trigger` -> `FID=363` (T13); `bkit-auto` Step 10 `MODE=CI BRANCH=fix/363-...` reaches Step 11, not the Failure Path (T14); `BRANCH=fix/363-x CONCLUSION=failure` + 3 distinct-headSha rows -> `skip=true`, and `feat/**` + `failure` does NOT consult the cap (T15).
- [x] **(v4) Tracker-agnostic dry-run:** `BRANCH=dev COMMIT_MSG="feat(bar-123-auth): x"` -> `FID=bar-123-auth`, `ISSUE=bar-123` (T16).
- [x] **(v4) Fail-closed dry-run:** `git` stub whose `push` always fails and whose `origin/dev` lacks the row -> `skip=true` + fail-closed notice, and NO `phase=`/`arg=` emitted (T17).
- [x] **(v4) Anchor re-verification before build:** re-run the P7 anchor checks (`grep -c 'AUTO_ROUTE_SUFFIX' .bkit/workflows/bkit-ship.md` >= 3 after Task 4 — see CONCERN-1/Task 4 correction; squash `--subject`, close commit and HEAD-Subject Assertion still where this revision says). `bkit-ship.md` moved twice in one afternoon; do not trust a line number this plan states without re-grepping. This is a PRE-build check; the builder's own pre-check confirmed `grep -c AUTO_ROUTE_SUFFIX` = 0 before editing (build-plan-execute-1-log.md, Task 4), satisfying the intent. Post-build anchors re-verified in build-plan-verify-1-3.md: squash `--subject` 687, close commit 1264, HEAD-Subject Assertion 644, `gh run list --workflow ci.yml` 552 — all accounted for by Task 4's insertion (expected drift, not a defect).
- [x] `pnpm turbo lint typecheck` (or repo equivalent) passes.
- [x] **Done when:** All dry-run assertions pass; lint/typecheck green; `bkit-debug.md` zero-diff holds.
- [x] **Test ref:** T1-T17.

### Task 10 — Consumer-repo acceptance note (exercisable-path docs)

- [x] **Scope:** `docs/deployments.md` — a dedicated "Consumer-repo acceptance note" section (CANONICAL OWNER — scope-check F3 resolution). The prior `.bkit/cloud.md` **or** `docs/deployments.md` disjunction is collapsed to `docs/deployments.md` so a builder/reviewer is not guessing. Task 6 owns the `dev` CI/CD matrix ROW + the docs-only-diff precondition NOTE inline in that row; Task 10 owns a DISTINCT "Consumer-repo acceptance note" section describing the full exercisable happy-path loop — the two do NOT duplicate. (Rationale: Task 6 already adds the `dev` row to `deployments.md`; co-locating the acceptance note avoids splitting deployment-related docs across `cloud.md`, which Task 5 owns as the decision-log surface.)
- [x] **Depends on:** none.
- [x] Document: the `dev`-trigger happy path can only be fully exercised on consumer repos (`app-gether-life`, `visitfrasercoast-com`) that run CI on `push: branches: [dev]` and have `bkit-cloud.yml` installed with secrets. This repo (bkit itself) dogfoods the YAML structure but the full `workflow_run -> /bkit-debug -> fix -> dev CI` loop requires a real consumer repo with `ANTHROPIC_API_KEY` / `OPENCODE_PROVIDER_KEY` secret wired.
- [x] Cross-reference the docs-only-diff precondition from Task 6's `dev` matrix row (do NOT re-state it — Task 6 owns that note; Task 10 points to it to avoid the duplication risk flagged in scope-check-1 F3).
- [x] **Done when:** `docs/deployments.md` has a dedicated "Consumer-repo acceptance note" section documenting the consumer-repo-only exercisable happy path, cross-referencing Task 6's docs-only-diff precondition note.
- [x] **Test ref:** N/A (documentation).

### Task 11 — Make `fix/**` FID recovery work in the cloud ctx step (v4/P2)

- [x] **Scope:** `.bkit/templates/.github/workflows/bkit-cloud.yml` — the `else` (PR-backed) arm of the ctx step, both jobs. Same file as Task 1; execute as part of the Task 1 edit pass to avoid two rewrites of one managed block.
- [x] **Depends on:** Task 1 (same surface).
- [x] Change the branch-strip fallback from `sed 's|^feat/||'` to `sed -E 's#^(feat|fix)/##'`. Keep the `#` delimiter — with `|` the alternation needs escaping and is ambiguous under `-E`.
- [x] Rationale to preserve in a comment: `bkit-debug.md:1244-1249` creates the fix PR with NO `bkit:issue=` / `bkit:fid=` body markers, so `fix/**` ALWAYS reaches this fallback; a `feat/`-only strip no-ops the entire surface.
- [x] **Done when:** bash unit against the extracted `run:` block: `BRANCH=fix/363-widen-bkit-cloud-trigger` -> `FID=363`, `ISSUE=363` (matching today's `feat/**` behaviour for a slugged branch); `BRANCH=fix/bar-123-auth` -> `FID=bar-123` (Linear shape); `BRANCH=feat/141-cloud-app` -> unchanged from today.
- [x] **Test ref:** T13.

### Task 12 — Accept `fix/` in `bkit-auto.md` Step 10 (v4/P2)

- [x] **Scope:** `.bkit/workflows/bkit-auto.md` Step 10 (line 118).
- [x] **Depends on:** Task 11 (a `fix/**` dispatch must be reachable before this assert matters). Execute with Task 2 — same file, same edit pass.
- [x] Replace the `feat/`-only prefix assert with a `case` accepting `feat/*` and `fix/*` and stripping whichever matched; anything else -> Failure Path (unchanged).
- [x] Keep the existing post-strip asserts verbatim (`FID` non-empty, `FID != BRANCH`, charset `^[a-z0-9][a-z0-9-]*$`).
- [x] ASCII-only operators.
- [x] **Done when:** Read: Step 10 accepts both prefixes; dry-run `BRANCH=fix/363-widen-bkit-cloud-trigger` in `MODE=CI` reaches Step 11 (not the Failure Path) with `FID=363-widen-bkit-cloud-trigger`; `BRANCH=chore/x` still routes to the Failure Path.
- [x] **Test ref:** T14.

### Task 13 — Bound the `fix/**` debug loop (v4/P3)

- [x] **Scope:** `.bkit/templates/.github/workflows/bkit-cloud.yml` ctx step, both jobs. Part of the Task 1 edit pass.
- [x] **Depends on:** Tasks 1, 11.
- [x] Factor the dev branch's cap-check + counter-write + fail-closed-verify block into a `bkit_dev_dispatch_guard <FID> <HEAD_SHA>` shell function defined once inside `shared-deriv` (see Architecture item 5's `bkit_dev_dispatch_guard` note). Call it from the dev branch and from a `case "$BRANCH" in fix/*)` guard in the `else` arm, the latter only when `PHASE = debug`.
- [x] Do NOT cap `feat/**` — pre-merge, PR-scoped, already bounded by in-session `MAX_DEBUG_ATTEMPT` / `MAX_NORMAL_ATTEMPT`.
- [x] Counter stays keyed on the FID with row type `dev-dispatch`: one post-`feat/**` debug budget per FID regardless of which surface the failure arrived on. No schema change.
- [x] **Done when:** bash unit: `BRANCH=fix/363-x CONCLUSION=failure` with 3 distinct-headSha `dev-dispatch` rows for the FID -> `skip=true` + operator-review notice; `CONCLUSION=success` on `fix/**` -> `phase=ship`, cap NOT consulted; `BRANCH=feat/141-x CONCLUSION=failure` -> `phase=debug`, cap NOT consulted (no regression to the pre-merge path).
- [x] **Test ref:** T15.

### Task 14 — Record the `main` exclusion as an explicit deferral (v4/P4)

- [x] **Scope:** `docs/deferrals.jsonl` + the `#363` tracker issue.
- [x] **Depends on:** none.
- [x] Append one deferral row recording: #363's pivot comment D-final settled branch scope as `['feat/**','fix/**','dev','main']`; this plan ships without `main`; rationale = production trunk never auto-dispatches a paid agent AND the issue's own open item 3 (dev->main promotion commit authorship, hence marker placement) is unresolved and may be outside bkit's control for some consumers; revisit if/when a bkit-authored promotion path exists.
- [x] Post the same decision change as a comment on #363 so the reversal is visible on the tracker, not only in the plan.
- [x] **Why this task exists:** v3 moved `main` to Out of Scope with no deferral row and no tracker note, and scope-check-2 then certified the plan as "zero silent drops". This closes the bookkeeping hole, not the design question.
- [x] **Done when:** `grep -c '363' docs/deferrals.jsonl` includes the new row; the comment is on #363.
- [x] **Test ref:** N/A (bookkeeping).

---

## Verification Plan (Gate 4)

**Automated (in-repo):**

- `yq` parse of `bkit-cloud.yml` — trigger filter, concurrency, ctx step structure.
- Bash dry-runs of ctx step logic (mocked env vars, seeded status.jsonl — harness per Task 1f).
- `source bkit-counter-bus-config.sh && echo $MAX_DEV_DISPATCH_ATTEMPTS`.
- `bkit-auto` Step 1 CI_DEV dry-run with `gh` sentinel (Task 2 F1) — assert no `pr view` recorded.
- `git diff --exit-code -- .bkit/workflows/bkit-debug.md` — zero diff (Task 3 F2).
- `pnpm turbo lint typecheck` (or repo equivalent).
- Mirror diff check after `pnpm bkit upgrade`.

**Manual (consumer-repo, post-release):**

- On `app-gether-life` or `visitfrasercoast-com`: ship a `feat/{FID}` PR with `bkit:auto` label -> verify squash-merge to `dev` carries `bkit [auto route]` in the commit subject -> verify post-merge CI on `dev` -> if CI fails, verify `/bkit-debug` auto-dispatches -> verify `dev-dispatch` row in status.jsonl -> verify loop cap after 3 distinct failed SHAs.
- Verify `dev` CI success -> no dispatch (no-op).
- Verify docs-only squash-merge does NOT false-dispatch (Vercel-CANCELED neutralised, not red).

---

## Manual Verification

- Read the squash-merge commit on `dev` after a `/bkit-ship` — confirm the subject includes `bkit [auto route]` (when `bkit:auto` labeled) and does NOT include `[skip ci]`.
- Read the `docs({FID}): ship DONE bkit [skip ci]` close commit (`bkit-ship.md:1258`) — confirm it includes `[skip ci]` and does NOT include `bkit [auto route]`.
- Trigger a `workflow_dispatch` with `phase=debug issue=363` — confirm the existing manual path still works (no regression from the ctx step restructuring).

---

## Merge Method

**Squash merge** to `dev` via `/bkit-ship`. The squash subject will carry `bkit [auto route]` (this plan's change), making the post-merge CI on `dev` eligible to trigger the cloud workflow — dogfooding the feature on itself.

---

## Review Critique Resolution Index

Trace of every load-bearing critique from the three reviews and how this v3 (inherited from v2) resolves it.

<!-- prettier-ignore -->
| Critique | Severity | Resolution in v3 |
| --- | --- | --- |
| **R3 F1** stale-run guard unsound (close-commit race) | CRITICAL | Adopted **Option A**: `gh run list --branch dev --workflow CI --status completed` headSha comparison (close commits never appear — they carry `[skip ci]`). Dropped the `git rev-parse origin/dev` comparison. Justified in Open Questions #2 + Architecture section item 5. Options B/C documented as rejected. |
| **R1 H1 / R2 #2** loop cap silently inert (no CI_DEV signal in bkit-debug) | HIGH | Counter write moved into the **cloud ctx step** (the component that knows `BRANCH=dev`), BEFORE dispatch. `CI_DEV` mode dropped from `bkit-debug` entirely; `bkit-debug` needs zero code changes (existing 3-way fallback covers `fix/{FID}`). Open Questions #1/#5 + Task 1f + Task 3. |
| **R1 M1 / R2 #1** undeclared Task 2 -> Task 3 dependency | HIGH | Merged old Tasks 1+2+3 into **Task 1** (single owner of `.bkit/templates/.github/workflows/bkit-cloud.yml` + `bkit-counter-bus-config.sh`). Explicit `Depends on` fields on every task. Runbook preamble documents the merge. |
| **R1 M2 / R2 #3** undefined `$REPO_ROOT` in cloud ctx step | HIGH | Use `$GITHUB_WORKSPACE` (GHA-provided) for sourcing; `$GITHUB_REPOSITORY` for `gh api`. Pre-Flight section + Architecture items 4/5. |
| **R1 M3 / R2 M** inline `${{ head_commit.message }}` injection | MEDIUM | `COMMIT_MSG` and `HEAD_SHA` added to ctx step `env:` block (injection-safe); `$GITHUB_REPOSITORY` replaces literal `{owner}/{repo}` in `gh api`. Architecture items 4/5 + Security section. |
| **R1 M4 / R2 #2** bkit-debug Step 2 worktree change redundant | MEDIUM | Dropped the edit; **Task 3 is verify-only**. Existing `bkit-debug.md:318-327` fallback already creates `fix/{FID}` off `origin/dev`. |
| **R2 M6 / R3 F2** concurrency narrative ("dropped, not queued") wrong | MEDIUM | Corrected: GHA with `cancel-in-progress: false` **QUEUES** (one pending; older pendings cancelled as newer arrive). Queued run re-evaluates cap at ctx step. Operator does NOT manually re-trigger. Open Questions #3 + Acceptance edge cases + Architecture item 3. |
| **R3 F3** counter written after dispatch (undercount on crash) | LOW | Write moved to ctx step, **before** dispatch, committed to dev with `[skip ci]`. Open Questions #1/#5 + Architecture item 5. |
| **R3 F6** telemetry `parentSha`/`headSha` correctness + RUN_ID link | LOW | `headSha` = `workflow_run.head_sha` (CI-failed SHA, correct); `parentSha` derived via `git rev-parse origin/dev`. bkit-auto Step 11 actions-link gated on `MODE=CI`/non-empty `RUN_ID`. Architecture bkit-auto item 6 + Data Schema. |
| **R2 M7** close-commit identifier wrong | MEDIUM | Corrected to `docs({FID}): ship DONE bkit [skip ci]` (`bkit-ship.md:1206`, verified). Pre-Flight + Acceptance edge cases + Manual Verification. |
| **R3 F4** docs-only-diff precondition (Vercel cancel) | LOW | Added to Acceptance edge cases + Task 6 + Task 10 (manual verification per consumer). |
| **R3 F5** `fix/**` lifecycle (now cloud-auto-ships) | LOW | Documented in Breaking Changes section (`fix/**` newly folded; Success Criteria scoped to `feat/**`). |
| **R1 M5** bkit-auto Step 9 not gated + ISSUE_ID unspecified | MEDIUM | Step 9 added to the `MODE=CI` gate list; `ISSUE_ID` numeric-prefix derivation specified in Step 1.5 CI_DEV branch. Architecture bkit-auto items 1/4 + Task 2. |
| **R1 M6** ctx-step dev-branch placement ambiguous | MEDIUM | Placement made explicit: `if [ "$BRANCH" = "dev" ]` after `case "$CONCLUSION"`, before `gh pr list`; PR-lookup moves into `else`; `shared-deriv` markers extend upward. Pre-Flight + Architecture item 5. |
| **R2 L10** T2 presence-only check misses behavioural regression | LOW | T2 augmented with bash unit: `head_branch=feat/foo` -> true (cancel preserved); `head_branch=dev` -> false (queue). Test Matrix T2. |
| **R2 L11** header comment text unspecified | LOW | Verbatim replacement header text quoted in Architecture item 1. |
| **R2 L12** MAX_DEV_DISPATCH_ATTEMPTS breaks comment grouping | LOW | New `# bkit-cloud.yml counters` section header (consumed by cloud ctx step, not bkit-debug). Architecture counter-bus-config item 1. |
| **R2 L13** dry-run harness unspecified | LOW | Dry-run harness specified in Task 1f (yq extraction, env mocking, gh stubbing, GITHUB_OUTPUT assertion); reused by Task 2 F1 sentinel. |
| **R1 L1 / R2 L9** telemetry location misstated (Step 1 vs Step 2.6) | LOW | Moot — telemetry write moved out of bkit-debug entirely (now in cloud ctx step). |

---

## Scope-Check Resolution Index

Trace of the three non-blocking scope-check-1 findings and how v3 resolves each. (Scope-check-2 returned PASS with zero findings — no scope expansion and no silent drops detected — so it required no plan edits; its boundary confirmation is reflected here as a no-op.)

<!-- prettier-ignore -->
| Finding | Severity | Lens | Resolution in v3 |
| --- | --- | --- | --- |
| **SC1-F1** Task 2 negative criterion unobservable (`does NOT call gh pr view`) | CONCERNS | verification strength | Task 2 gains an explicit **Verification (scope-check F1)** sub-bullet that wires the Task 1f `gh`-stubbing harness into a sentinel: `gh() { echo "called: $*" >> "$GH_CALLS"; }; export -f gh`, then after the `ARG=<FID>` dry-run asserts `! grep -q 'pr view' "$GH_CALLS"`. The negative criterion is now objectively observable. Test Matrix T6 updated to reference the sentinel. |
| **SC1-F2** Task 3 criterion/verification strength mismatch (`no diff` vs `Read confirms`) | CONCERNS | verification strength | Task 3 gains an explicit **Verification (scope-check F2)** sub-bullet: `git diff --exit-code -- .bkit/workflows/bkit-debug.md` (exit 0 = no diff = PASS), run after the full build so it catches any other task touching the file. Test Matrix T8 + Task 9 validation both assert the zero-diff command. Verification strength now matches the criterion. |
| **SC1-F3** Task 10 scope disjunctive (`cloud.md` OR `deployments.md`) | CONCERNS | scope ambiguity | The disjunction is collapsed to a single concrete owner file: **`docs/deployments.md`** (Task 10 Scope updated + Architecture `docs/deployments.md` item 3 + Documentation Updates table + Verification Plan all point to `deployments.md`). Task 10 owns a DISTINCT "Consumer-repo acceptance note" section that cross-references Task 6's docs-only-diff precondition note rather than restating it, eliminating the duplication risk. |
| **SC2** boundary confirmation (no expansion, no silent drops) | PASS | scope boundary | ~~No edit required — scope-check-2 found zero scope expansions and zero silent drops.~~ **(v4) This verdict was WRONG on `main`** — see P4 below. `main` was settled IN scope by #363's pivot comment D-final and was moved to Out of Scope by v1-v3 with no deferral row and no tracker note, which is the definition of a silent drop. Closed by Task 14. |

---

## Post-Plan Review Findings (v4 — 2026-07-29, pre-build)

The v1-v3 chain was authored in a worktree at parent `2ee0da16`. Ten minutes later `80660ac0` (#384) restructured `bkit-ship.md` into Path A/B, and four follow-up fixes landed on `dev` the same afternoon. The plan's three reviews, two scope-checks and complexity-check all ran against the pre-#384 tree, so none of them could have caught P1. Every source anchor below was re-verified against `dev @ d87c8641`.

<!-- prettier-ignore -->
| ID | Finding | Severity | Resolution in v4 |
| --- | --- | --- | --- |
| P1 | **Task 4's premise is void.** v3: "`AUTO_ROUTE_SUFFIX` is already derived on line 626 — no new gate logic." #384 deleted every derivation from `bkit-ship.md`; the grep count is 0. The Option A change point is gone. | CRITICAL | Task 4 rewritten to ADD the derivation (idiom from `bkit-build.md:1261`) and thread it at line 682, with a `grep -c` pre-check that voids the task if the premise shifts again. Context & Goals carries a callout. |
| P2 | **`fix/**` folding is inert.** Ctx-step FID fallback strips `feat/` only; `bkit-debug`'s fix PR body has no `bkit:fid=` marker; `bkit-auto.md:118` hard-fails non-`feat/` branches. The documented "cloud auto-merges the fix PR" cannot occur. | HIGH | New Tasks 11 + 12; ctx-step `sed -E` strips both prefixes; `bkit-auto` Step 10 `case` accepts both. Breaking Changes corrected with the three verified reasons. |
| P3 | **The `fix/**` failure loop is unbounded.** The cap is gated on `BRANCH = dev`, so the newly-opened `fix/**` surface has exactly the cross-session feedback loop the cap exists to prevent, with no bound. | HIGH | New Task 13 — cap rekeyed on the FID and factored into `bkit_dev_dispatch_guard`, called from both post-`feat/**` surfaces. `feat/**` deliberately stays uncapped (pre-merge, already bounded in-session). |
| P4 | **`main` was silently dropped.** #363's pivot comment D-final settled `['feat/**','fix/**','dev','main']`; v3 moved `main` to Out of Scope with no deferral row and no tracker note, and scope-check-2 passed it as "zero silent drops". | MEDIUM | Exclusion KEPT (the issue's own open item 3 — promotion-commit authorship — is unresolved, so a `main` trigger would be gated shut by construction). New Task 14 records the reversal in `deferrals.jsonl` and on #363. |
| P5 | **Dev path is GitHub-tracker-only.** Scope regex, slug allowlist and `ISSUE` derivation all assume `363-slug`. A Linear consumer's `bar-123-slug` fails all three, so the dev trigger silently never fires for them. | MEDIUM | Regex / allowlist / derivation widened to the same alternation the existing `feat/**` fallback already uses (`bkit-cloud.yml:198`). New Open Question 6; T16. |
| P6 | **The loop cap fails OPEN.** v3 tolerated a rejected telemetry push and dispatched anyway. Any non-fast-forward (not just the dual-job race it names) leaves the row nowhere durable, so the cycle is uncounted and the advertised bound degrades to unbounded. | MEDIUM | Retry against a re-fetched `dev`, then VERIFY the row is on `origin/dev`; if not, `skip=true`. The same verification is what keeps the genuine dual-job race safe. New Open Question 7; T17. |
| P7 | **Every `bkit-ship.md` line anchor is stale** (598->647, 634-635->682, 1206->1258, 1211->1261-1265, 610->546, and `--workflow CI` is now `--workflow ci.yml`). `bkit-auto` / `bkit-debug` / `bkit-cloud.yml` anchors were re-checked and are all still correct. | LOW | Anchors corrected in Pre-Flight, Architecture and Manual Verification. Stale-guard switched to the `ci.yml` filename form (fixed by `bkit install`; the display name is consumer-editable free text). |

**Two non-defects, recorded so a builder does not "fix" them:** (a) the `bkit [auto route]` marker becomes permanent `dev` history once threaded onto the squash subject — inherent to Option A, since the gate reads `head_commit.message`; (b) `bkit-ship`'s close commit only reaches `dev` when `RUNTIME_DEVPUSHES = true`, so the "dev's tip is the close commit" narrative is not universal — but stale-guard Option A reads CI-run recency, never dev's tip, so it stays correct under both runtimes.

**Residual risk accepted (not fixed here).** The `dev` concurrency group is `bkit-auto-dev` for ALL FIDs. With `cancel-in-progress: false` GHA keeps at most ONE pending run per group, so if FID-A is in-flight and FID-B then FID-C arrive, **FID-B's dispatch is cancelled while pending and never re-fires**. The plan's "the operator does NOT need to manually re-trigger" claim holds only for the most recent queued run. FID-level arbitration belongs to #397; this loses a dispatch rather than corrupting one, so it fails safe.
