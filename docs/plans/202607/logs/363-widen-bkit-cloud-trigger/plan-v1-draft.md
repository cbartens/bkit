Verdict: PASS

<!-- verdict:end -->

<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

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
2. **Success is a no-op, not ship.** On `feat/**`, CI success → `/bkit-ship` (merge the PR). On `dev`, the merge already happened — CI success means "post-merge regression check passed" and requires no action. Only CI **failure** dispatches `/bkit-debug`.
3. **Cross-session loop bound.** A `dev`-triggered `/bkit-debug` pushes a fix to `dev` via a `fix/{FID}` PR; if that fix fails CI, another `workflow_run` fires, dispatching another `/bkit-debug` — a feedback loop with no natural terminator. Per-session `MAX_NORMAL_ATTEMPT` resets on each dispatch, so it cannot bound the cross-session loop. This plan adds a **`MAX_DEV_DISPATCH_ATTEMPTS` cap** (default 3, all-time per FID), enforced in the `bkit-cloud.yml` ctx step before dispatch.

**Success Criteria:**

- `bkit-cloud.yml`'s `workflow_run` trigger fires on `feat/**`, `fix/**`, and `dev` CI completion (never `main`); the existing `feat/**` pre-merge routing (success → ship, failure → debug) is preserved byte-for-byte.
- On `dev` CI **failure**, the cloud orchestrator recovers the FID from the squash-merge commit scope, re-checks `bkit:auto` on the issue (kill switch), and dispatches `/bkit-debug {FID}`. On `dev` CI **success**, the run exits as a no-op (`::notice::`, `skip=true`).
- The free-tier gate (`bkit [auto route]` in `head_commit.message`) admits `dev`-triggered runs by construction — `bkit-ship` threads the marker onto the squash `--subject` when the issue is `bkit:auto`-labeled. No separate gate path.
- Cross-session debug loop on `dev` is bounded: after `MAX_DEV_DISPATCH_ATTEMPTS` (3) dispatched debug sessions for one FID, subsequent `dev`-CI-fail dispatches exit as no-ops with an operator-review `::notice::`.
- Concurrency on `dev` does not cancel an in-flight debug (`cancel-in-progress: false` for `head_branch == 'dev'`); `feat/**`/`fix/**` keep `cancel-in-progress: true` (latest-wins, current behaviour).
- `bkit-auto.md` accepts a bare FID as `{ARG}` (CI_DEV mode) — skips the PR-lookup / PR-OPEN / `feat/`-prefix asserts, sets `BRANCH=dev`, derives `HEAD_SHA` from `origin/dev` for the stale-run guard.
- `bkit-debug.md` creates a `fix/{FID}` worktree off `origin/dev` in CI_DEV mode (not `feat/{FID}` — that branch was deleted on squash-merge); `PUSH_MODE=LOCAL` auto-detects (no open PR → LOCAL), unchanged.
- All changes mirrored to `.claude/`, `.cursor/`, `.opencode/`; version bumped 4.10.0 → 4.11.0; CHANGELOG entry added; `bkit-cloud.yml` consumer mirror regenerated.

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

A developer ships a `feat/{FID}` PR via `/bkit-ship`; the squash-merge lands on `dev` carrying the `bkit [auto route]` marker (because the issue is `bkit:auto`-labeled). Post-merge CI on `dev` runs. If it goes green, nothing happens (the regression check passed). If it goes red, the cloud orchestrator automatically dispatches `/bkit-debug {FID}` — the developer gets an autonomous debug session against the post-merge failure without lifting a finger. If the debug's fix also fails CI, another debug dispatches; after 3 dispatched debug sessions for the same FID, further dispatches go silent with an operator-review notice.

### Success Criteria

1. `workflow_run` fires on `dev` CI completion (in addition to `feat/**`, `fix/**`); `main` is never a trigger.
2. `dev` CI **failure** → `/bkit-debug {FID}` dispatched; `dev` CI **success** → no-op exit (`skip=true`, `::notice::`).
3. FID recovered from squash-merge commit scope (`feat(363-widen-bkit-cloud-trigger): ...`) when no open PR exists; `bkit:auto` re-checked on the issue as kill switch.
4. Free-tier gate admits `dev`-triggered runs via the existing `bkit [auto route]` marker — no second gate path.
5. Cross-session loop bounded at 3 dispatched debug sessions per FID (`MAX_DEV_DISPATCH_ATTEMPTS`); 4th+ dispatch exits as no-op with operator-review notice.

### Key Edge Cases

- **Squash-merge subject without scope:** A non-conventional commit (manual `git push` to `dev`, or a `chore(...)` scope that doesn't match `{FID}` slug regex) → FID recovery fails → fail-safe no-op exit (`::notice::`, `skip=true`). No dispatch, no crash.
- **`[skip ci]` Close commit:** The `chore({FID}): merge-pr attempt N` close commit that follows the squash merge carries `[skip ci]` → CI doesn't run → no `workflow_run` event. Only the squash-merge commit (which DOES carry `bkit [auto route]` and does NOT carry `[skip ci]`) triggers CI → the cloud gate matches. No interaction.
- **Two dev pushes fail CI near-simultaneously:** Concurrency group `bkit-auto-dev` with `cancel-in-progress: false` → the in-flight debug runs to completion; the superseding dispatch is **dropped** (GHA does not queue). The operator can manually re-trigger via `workflow_dispatch` if the dropped CI-fail wasn't addressed by the in-flight debug's fix.
- **Stale dev CI:** A CI run for an old `dev` SHA completes after a newer push has landed → stale-run guard compares `workflow_run.head_sha` against `git rev-parse origin/dev`; mismatch → `skip=true`.
- **FID from merged PR (fallback):** If the squash-merge scope is missing/malformed but the merge commit is linked to a PR, recover FID from `gh api` merge-commit `associatedPullRequests` → PR body `bkit:fid` marker. Primary path is commit-scope; this is the fallback.
- **`bkit:auto` revoked mid-loop:** Issue label removed between dispatches → kill switch fires on the next ctx-step label re-check → `skip=true`. Halts the loop even under the cap.

### Concrete Example

**Role:** bkit consumer repo operator (e.g. `app-gether-life`).
**Starting state:** Issue #142 is `bkit:auto`-labeled. PR #500 (`feat/142-add-auth`) passed pre-merge CI and is about to be squash-merged by `/bkit-ship`.

1. `/bkit-ship` squash-merges PR #500 to `dev` with subject `feat(142-add-auth): add OAuth flow (#500) bkit [auto route]` (the `bkit [auto route]` suffix threaded by `bkit-ship` Step 5 because the issue carries `bkit:auto`).
2. The close commit `chore(142-add-auth): merge-pr attempt 1` lands with `[skip ci]` — no CI, no cloud trigger.
3. Post-merge CI runs on `dev` (triggered by the squash-merge push). It **fails** (a post-merge-only integration test broke).
4. `workflow_run` fires. The gate matches (`bkit [auto route]` is in the squash-merge subject). The ctx step: `BRANCH=dev` → dev path → FID from commit scope `142-add-auth` → `ISSUE=142` → `bkit:auto` still on #142 → `PHASE=debug` → loop cap: 0 prior `dev-dispatch` rows < 3 → dispatch `/bkit-auto debug 142-add-auth`.
5. `bkit-auto` Step 1: `ARG=142-add-auth` (non-numeric) → `MODE=CI_DEV` → skip PR lookup → `BRANCH=dev`, `HEAD_SHA=$(git rev-parse origin/dev)`, `FID=142-add-auth`, `ISSUE_ID=142` → dispatch `/bkit-debug 142-add-auth`.
6. `bkit-debug` Step 2: CI_DEV mode → create `fix/142-add-auth` off `origin/dev` (not `feat/142-add-auth` — deleted). Step 1.6: `gh pr list --head fix/142-add-auth --base dev` → no PR → `PUSH_MODE=LOCAL`. Debug runs, fixes, opens PR `fix/142-add-auth → dev`, merges it.
7. The fix-merge push triggers CI on `dev` again. If green → no `workflow_run` dispatch (success = no-op). If red → steps 4-6 repeat, loop cap increments to 1.
8. After 3 dispatched debug sessions (cap reached), the 4th `dev`-CI-fail `workflow_run` ctx step reads `dev-dispatch` count = 3 >= `MAX_DEV_DISPATCH_ATTEMPTS` → `::notice::FID 142-add-auth exhausted 3 dev-triggered debug dispatches — operator review required.` → `skip=true`.

### Derived Test Matrix

| #   | Behaviour                                                                    | How to verify                                                                                                     |
| --- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| T1  | `workflow_run.branches` includes `dev`                                       | `yq` / `jq` parse of `bkit-cloud.yml` `on.workflow_run.branches` contains `dev`                                   |
| T2  | `cancel-in-progress` is `false` for `dev`, `true` otherwise                  | Expression `${{ github.event.workflow_run.head_branch != 'dev' }}` present in concurrency block                   |
| T3  | Ctx step derives FID from commit scope on `dev` (no PR)                      | Bash unit: feed a `feat(363-widen-bkit-cloud-trigger): ...` subject → assert `FID=363-widen-bkit-cloud-trigger`   |
| T4  | Ctx step routes `dev` success → skip, failure → debug                        | Bash unit: `CONCLUSION=success` + `BRANCH=dev` → `skip=true`; `CONCLUSION=failure` + `BRANCH=dev` → `phase=debug` |
| T5  | Ctx step enforces `MAX_DEV_DISPATCH_ATTEMPTS` cap                            | Bash unit: seed status.jsonl with 3 `dev-dispatch` rows → assert `skip=true` + notice                             |
| T6  | `bkit-auto` accepts non-numeric ARG as FID (CI_DEV mode)                     | Bash unit: `ARG=363-widen-bkit-cloud-trigger` → `MODE=CI_DEV`, no `gh pr view` call                               |
| T7  | `bkit-auto` CI_DEV skips `PR_STATE != OPEN` assert                           | Read: Step 1.7 gated on `MODE=CI` only                                                                            |
| T8  | `bkit-debug` creates `fix/{FID}` worktree in CI_DEV mode                     | Read: Step 2 branch-creation logic selects `fix/{FID}` when CI_DEV                                                |
| T9  | `bkit-ship` squash `--subject` includes `bkit [auto route]` when `bkit:auto` | Bash unit: `LABELS` contains `bkit:auto` → subject ends with `bkit [auto route]`                                  |
| T10 | `MAX_DEV_DISPATCH_ATTEMPTS=3` in counter-bus-config                          | `grep MAX_DEV_DISPATCH_ATTEMPTS .bkit/scripts/bkit-counter-bus-config.sh`                                         |
| T11 | Mirrors regenerated (`.claude/`, `.cursor/`, `.opencode/` in sync)           | `pnpm bkit upgrade --dry-run` produces no diff on canonical files                                                 |
| T12 | Version bumped 4.10.0 → 4.11.0                                               | `jq -r .version package.json` = `4.11.0`; `grep pinnedVersion .bkit/version` = `4.11.0`                           |

---

## Breaking Changes & Naming Review

**No breaking changes.** The `feat/**` pre-merge path is preserved byte-for-byte. The `dev` path is purely additive (a new branch in trigger filter + ctx step). Existing consumer repos without `bkit:auto`-labeled issues see no behaviour change (the free-tier gate already blocks unmarked runs).

**Naming:**

- `CI_DEV` mode — consistent with existing `CI` (pre-merge, PR-backed) and `BRIEF` (tracker-dispatched) modes in `bkit-auto.md`. The `_DEV` suffix denotes the `dev` branch origin.
- `MAX_DEV_DISPATCH_ATTEMPTS` — consistent with `MAX_DEBUG_ATTEMPT`, `MAX_NORMAL_ATTEMPT`, `MAX_SOAK_ATTEMPT` in `bkit-counter-bus-config.sh`. The `_DISPATCH` clarifier distinguishes cross-session cloud dispatches from in-session remediation attempts.
- `dev-dispatch` status.jsonl row type — consistent with existing `workflow-started`, `step-done` row types. Additive, NDJSON-merge-safe.

---

## Open Questions & Assumptions

**Settled in-plan (no blocker):**

1. **Cross-session loop cap mechanism.** Decision: **cap = 3 dev-triggered debug dispatches per FID, all-time, enforced in `bkit-cloud.yml` ctx step before dispatch.** Counter persisted as additive `dev-dispatch` rows in `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl`, recorded by `/bkit-debug` Step 1 telemetry (alongside its existing `workflow-started` row). The ctx step reads the count; the debug orchestrator writes the row. Window is all-time (not sliding) — simpler, safer; operator reset = delete the rows or bump `MAX_DEV_DISPATCH_ATTEMPTS`. Rationale: per-session `MAX_NORMAL_ATTEMPT` resets on each cloud dispatch and cannot bound a `dev` feedback loop; operator vigilance is unreliable for 24/7 cloud dispatch. 3 matches `MAX_DEBUG_ATTEMPT` (in-session escalation threshold), giving symmetry: 3 dispatched sessions, each with up to 3 in-session remediations, before the cap silences further dispatches.

2. **Concurrency on `dev`: queue vs. cancel.** Decision: **`cancel-in-progress: ${{ github.event.workflow_run.head_branch != 'dev' }}`.** For `dev`, `false` (in-flight debug runs to completion; superseding dispatch dropped — GHA does not queue). For `feat/**`/`fix/**`, `true` (latest-wins, current behaviour, no regression). Rationale: cancelling an in-flight `/bkit-debug` mid-flight risks leaving status.jsonl / worktree lock in an inconsistent state; the stale-run guard inside the next dispatch handles SHA supersession cleanly.

3. **FID recovery primary vs. fallback.** Decision: **primary = squash-merge commit scope regex** (`^\w+\(([0-9]+-[a-z0-9-]+)\):` on `head_commit.message`); **fallback = `gh api` merge-commit `associatedPullRequests` → PR body `bkit:fid` marker.** The commit-scope path is the common case (all bkit PR titles follow `feat({FID}): ...`), requires no extra API call, and fails safe (no match → no-op). The `gh api` fallback covers non-conventional merge subjects.

**Assumptions:**

- The squash-merge `--subject` set by `bkit-ship` Step 5 preserves the PR title verbatim, which follows `feat({FID}): ...` convention. This is already the case (line 635: `--subject "$(gh pr view {PR_NUMBER} --json title --jq .title) (#{PR_NUMBER})"`).
- `workflow_run.head_commit.message` on a `dev` push is the push's HEAD commit message — i.e. the squash-merge subject. This is GHA's documented behaviour for `workflow_run` events.
- CI on `dev` runs on every push (the consumer repo's CI workflow triggers on `push: branches: [dev]`). This is the existing contract in `docs/deployments.md`.
- `fix/{FID}` is the established debug-fix branch convention (referenced in `bkit-ship` Step 5 line 630, git rules line 31). Creating it off `origin/dev` is the expected debug LOCAL-mode setup.

---

## Alternative Approaches & Recommendations

**Option B (rejected): Separate `workflow_run` event for `dev` with a second gate path.** Adding a second `if:` condition or a separate job for `dev`-triggered runs, with its own marker or label check. Rejected because Option A reuses the existing `bkit [auto route]` gate by construction (the squash-merge subject already carries it when `bkit:auto`-labeled), so a second gate is redundant complexity. Option A is strictly simpler.

**Option C (rejected): `workflow_dispatch`-only for `dev` failures.** Require the operator to manually trigger `/bkit-debug` when `dev` CI fails. Rejected — this is the status quo and the motivation for #363. The whole point is autonomous post-merge failure routing.

**Option D (rejected): Sliding-window loop cap (e.g. 3 per 24h).** More complex (requires timestamp filtering in the ctx step), offers marginal benefit over all-time cap. If an FID accumulates 3 dispatched debug sessions ever, something is structurally wrong and an operator should review. All-time cap with manual reset is simpler and safer.

**Recommendation:** Option A as specified. The design is the minimal change that closes the post-merge blind spot without introducing a new trust surface, a new gate, or a new trust marker.

---

## Out of Scope

- **`main` branch trigger.** Production trunk never auto-dispatches a cloud agent. `main` stays manual-only (`workflow_dispatch`).
- **Cross-surface same-FID arbitration (#397).** The race between a dispatched build and the auto-ship it triggers (or two cloud dispatches for the same FID from different trigger surfaces) remains owned by #397's orchestrator-level stale-run guard + status.jsonl lock. This plan's `dev` concurrency group (`bkit-auto-dev`) collapses all `dev`-triggered runs for all FIDs into one group — FID-level mutual exclusion on `dev` is handled by `/bkit-debug` Step 1's `.lock` file (already exists), not by the GHA concurrency layer (which can't see the FID at group-evaluation time).
- **bkit-ship Step 10 "Verify Deploy" / ship-verify block contract / preflight advisories / renumber cascade.** DROPPED per issue comments. The ship-verify work is a separate concern.
- **#80 audit-logs-ship migration.** Lives in the triggered debug's `debug-fetch` independently. Not coupled to the trigger widening.
- **Webhook-based tracker triggers (Linear bridge, GitHub `issues: labeled`).** Phase 2 work, unrelated to the CI-driven trigger surface.

---

## Suggested Scope Expansion

None. This plan is tightly scoped to the trigger widening + its immediately necessary machinery (FID recovery, routing, concurrency, loop bound). No adjacent features are bundled.

---

## Security & Privacy

**CI Auto-Route Trust surface — `dev` push trigger (new):**

The existing trust model (documented in `docs/security.md` § CI Auto-Route Trust) gates cloud dispatches on the `bkit [auto route]` marker in the HEAD commit message, which is only present when `bkit-ship` threads it (gated on the `bkit:auto` issue label). This plan extends the same gate to `dev`-triggered runs — **no new trust marker, no new label, no new gate path.** The `dev` path adds one new derivation: FID from the squash-merge commit scope. The FID is validated against the existing slug allowlist (`^[0-9]+-[a-z0-9-]+$` for GitHub tracker) before use. A malformed or missing scope → fail-safe no-op exit (no dispatch, no crash, no information leak).

**Kill switch preserved:** The `bkit:auto` label re-check in the ctx step (live revocation) applies identically to `dev`-triggered runs. Removing the label mid-loop halts further dispatches even under the cap.

**Loop-bound as cost control:** `MAX_DEV_DISPATCH_ATTEMPTS=3` bounds cloud-agent spend per FID on the `dev` path. Without it, a stuck `dev` feedback loop could dispatch unbounded paid agent sessions. The cap is a security/cost control, not just a quality-of-life feature.

**No new secrets, no new permissions.** The `bkit-cloud.yml` jobs already have `contents: write`, `pull-requests: write`, `issues: write`, `actions: read`, `id-token: write` (claude job). The `dev` path uses the same permissions (read merge-commit via `gh api`, write `dev-dispatch` row via the debug orchestrator's existing commit path, dispatch `/bkit-debug`). No scope expansion.

---

## Pre-Flight / Dependencies (Gate 1)

- [ ] `bkit-cloud.yml` ctx step `shared-deriv` block is a `# bkit:start shared-deriv` / `# bkit:end shared-deriv` managed block, duplicated across both jobs (claude + opencode). Both copies must be extended identically.
- [ ] `bkit-ship.md` Step 5 already derives `AUTO_ROUTE_SUFFIX` from `bkit:auto` label (line 626) and threads it into the sync-merge commit (line 630). The squash `--subject` (line 635) does NOT yet include it — this is the Option A change point.
- [ ] `bkit-auto.md` Step 1.5 assumes `MODE=CI` → `PR_NUMBER="$ARG"` (numeric). The CI_DEV extension discriminates on ARG shape (numeric = CI/PR, non-numeric = CI_DEV/FID).
- [ ] `bkit-debug.md` Step 2 worktree setup creates `feat/{FID}` off `origin/dev`. The CI_DEV extension creates `fix/{FID}` instead (the `feat/{FID}` branch was deleted on squash-merge).
- [ ] `bkit-counter-bus-config.sh` is sourced by `bkit-cloud.yml` ctx step (after this plan) — verify the ctx step has access to the repo root (it does: `checkout@v4` with `ref: dev` precedes the ctx step).
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

- **Written by:** `/bkit-debug` Step 1 (in CI_DEV mode only), alongside its existing `workflow-started` row, as part of the telemetry commit.
- **Read by:** `bkit-cloud.yml` ctx step (both jobs), to count prior dev-triggered dispatches for the FID: `jq -r 'select(.type=="dev-dispatch" and .fid=="$FID") | .at' "$STATUS" | wc -l`.
- **Merge-safe:** NDJSON, `.jsonl merge=union` in `.gitattributes` (already configured). Additive row, no collision with existing types.
- **Location:** `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (same file as all other workflow telemetry for the FID). The YYYYMM is resolved by glob: `ls -d docs/plans/*/logs/"$FID"/ 2>/dev/null | head -1`.

**No schema migration.** Existing rows (`workflow-started`, `step-done`) are unchanged. The `dev-dispatch` row is purely additive.

---

## Architecture & Component Changes

### `.github/workflows/bkit-cloud.yml`

1. **Trigger filter (line 31):**

   ```yaml
   # Before:
   branches: ["feat/**"]
   # After:
   branches: ["feat/**", "fix/**", "dev"]
   ```

2. **Concurrency (line 73-74):**

   ```yaml
   # Before:
   group: bkit-auto-${{ inputs.issue || github.event.workflow_run.head_branch }}
   cancel-in-progress: true
   # After:
   group: bkit-auto-${{ inputs.issue || github.event.workflow_run.head_branch }}
   cancel-in-progress: ${{ github.event.workflow_run.head_branch != 'dev' }}
   ```

   For `dev`, the group resolves to `bkit-auto-dev` (collapses all dev-triggered runs; FID-level mutual exclusion is handled by `/bkit-debug`'s `.lock` file). `cancel-in-progress: false` ensures an in-flight debug is not cancelled mid-flight.

3. **Ctx step `shared-deriv` block (both jobs, lines 190-214 and 325-344):**
   Add a `dev` branch before the existing PR-lookup path:

   ```bash
   # bkit:start shared-deriv
   if [ "$BRANCH" = "dev" ]; then
     # Post-merge dev CI — no open PR; recover FID from squash-merge commit scope.
     case "$CONCLUSION" in
       success) echo "::notice::dev CI passed — post-merge regression check OK, no-op exit."; echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0 ;;
       failure) PHASE=debug ;;
       *) echo "::notice::Non-terminal CI conclusion '$CONCLUSION' on dev — no-op exit."; echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0 ;;
     esac
     # Primary: parse FID from commit scope: feat(363-widen-bkit-cloud-trigger): ...
     COMMIT_MSG="${{ github.event.workflow_run.head_commit.message }}"
     FID=$(echo "$COMMIT_MSG" | grep -oE '^\w+\(([0-9]+-[a-z0-9-]+)\):' | sed -E 's/^\w+\(([^)]+)\):/\1/' | head -1 || true)
     if [ -z "$FID" ]; then
       # Fallback: gh api merge-commit associatedPullRequests → PR body bkit:fid marker.
       HEAD_SHA="${{ github.event.workflow_run.head_sha }}"
       PR_BODY=$(gh api "repos/{owner}/{repo}/commits/$HEAD_SHA/pulls" --jq '.[0].body // empty' 2>/dev/null || echo "")
       FID=$(echo "$PR_BODY" | grep -oE 'bkit:fid=[^[:space:]>]+' | sed 's/bkit:fid=//' | head -1 || true)
     fi
     if [ -z "$FID" ] || ! [[ "$FID" =~ ^[0-9]+-[a-z0-9-]+$ ]]; then
       echo "::notice::Cannot derive FID from dev commit scope or linked PR — no-op exit (fail-safe)."
       echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
     fi
     ISSUE=$(echo "$FID" | grep -oE '^[0-9]+')
     ARG="$FID"
     # Stale-run guard: head_sha must be current dev HEAD.
     DEV_HEAD=$(git rev-parse origin/dev)
     HEAD_SHA="${{ github.event.workflow_run.head_sha }}"
     if [ "$HEAD_SHA" != "$DEV_HEAD" ]; then
       echo "::notice::Stale dev CI (head_sha=$HEAD_SHA, dev HEAD=$DEV_HEAD) — no-op exit."
       echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
     fi
     # Loop cap: count prior dev-dispatch rows for this FID.
     . "$REPO_ROOT/.bkit/scripts/bkit-counter-bus-config.sh"
     STATUS_DIR=$(ls -d docs/plans/*/logs/"$FID"/ 2>/dev/null | head -1)
     if [ -n "$STATUS_DIR" ] && [ -f "$STATUS_DIR/status.jsonl" ]; then
       DEV_COUNT=$(jq -r 'select(.type=="dev-dispatch" and .fid=="'"$FID"'") | .at' "$STATUS_DIR/status.jsonl" 2>/dev/null | wc -l)
       if [ "$DEV_COUNT" -ge "$MAX_DEV_DISPATCH_ATTEMPTS" ]; then
         echo "::notice::FID $FID exhausted $MAX_DEV_DISPATCH_ATTEMPTS dev-triggered debug dispatches — operator review required (delete dev-dispatch rows in status.jsonl to reset)."
         echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
       fi
     fi
     # Kill switch: re-check bkit:auto on the issue.
     ISSUE_LABELS=$(gh issue view "$ISSUE" --json labels --jq '[.labels[].name] | join(",")' 2>/dev/null || echo "")
     if ! echo "$ISSUE_LABELS" | grep -q 'bkit:auto'; then
       echo "::notice::Issue #$ISSUE no longer carries bkit:auto — no-op exit (kill switch)."
       echo "skip=true" >> "$GITHUB_OUTPUT"; exit 0
     fi
   else
     # Existing feat/** / fix/** path (PR-backed FID recovery) — unchanged.
     PR_NUMBER=$(gh pr list ...)
     ...existing logic...
   fi
   # bkit:end shared-deriv
   ```

   **Note:** The exact bash above is the spec; the builder adapts it to the existing `shared-deriv` block structure (which uses `PR_NUMBER` / `PR_BODY` / `ISSUE` / `FID` variables). The key additions are: (a) the `if BRANCH == dev` branch, (b) commit-scope FID recovery, (c) success → skip, (d) stale-run guard, (e) loop cap, (f) kill switch (reuses existing label check).

### `.bkit/workflows/bkit-auto.md` Step 1

1. **Step 1.5 (line 85):** Discriminate CI vs CI_DEV on ARG shape:

   ```bash
   if [[ "$ARG" =~ ^[0-9]+$ ]]; then
     PR_NUMBER="$ARG"      # CI mode — ARG is numeric PR number
   else
     FID="$ARG"            # CI_DEV mode — ARG is FID slug (e.g. 363-widen-bkit-cloud-trigger)
   fi
   ```

2. **Steps 6-8 (lines 86-92):** Gate on `MODE=CI` only. In CI_DEV mode:
   - `BRANCH=dev`
   - `HEAD_SHA=$(git rev-parse origin/dev)` (the runner is checked out on `dev`)
   - `PR_STATE=MERGED` (semantic: the feature PR was already merged)
   - `PR_URL="(merged)"` (no live PR URL)
   - `RUN_ID` = the `workflow_run` event's triggering CI run (from `github.event.workflow_run.id` equivalent — or skip, as `RUN_ID` is only used for the comment body link)

3. **Step 7 (line 87):** `PR_STATE != OPEN → Failure Path` — gate on `MODE=CI` only. CI_DEV mode skips this assert (the PR is intentionally already merged).

4. **Step 10 (line 118):** `BRANCH does NOT start with feat/ → Failure Path` — gate on `MODE=CI` only. CI_DEV mode has `BRANCH=dev` (intentionally not `feat/`); FID already set from ARG.

5. **Gate 1 checklist (line 141):** Add `CI_DEV placeholders non-empty (FID, ISSUE_ID, HEAD_SHA, if MODE = CI_DEV)`.

### `.bkit/workflows/bkit-debug.md` Step 2

1. **Worktree branch selection:** In CI_DEV mode (detect via: `feat/{FID}` branch absent remotely + trigger origin is `dev`), create `fix/{FID}` off `origin/dev` instead of `feat/{FID}`:

   ```bash
   if [ "$MODE" = "CI_DEV" ] || ! git fetch origin "feat/{FID}" 2>/dev/null; then
     # CI_DEV or feat/{FID} deleted (post-merge) — use fix/{FID} off dev.
     WORKTREE_BRANCH="fix/{FID}"
   else
     WORKTREE_BRANCH="feat/{FID}"
   fi
   # ...existing worktree creation logic using $WORKTREE_BRANCH...
   ```

2. **Step 1.6 PUSH_MODE:** Unchanged — `gh pr list --head $(git branch --show-current) --base dev` returns nothing for `fix/{FID}` (no PR yet) → `PUSH_MODE=LOCAL`. This is the correct behaviour for dev-triggered debug.

3. **Step 1 telemetry:** In CI_DEV mode, write the `dev-dispatch` row to status.jsonl alongside `workflow-started`:
   ```bash
   jq -nc --arg t "$(date -u +%FT%TZ)" --arg f "$FID" --arg h "$HEAD_SHA" --arg p "$PARENT_SHA" \
     '{type:"dev-dispatch", workflow:"auto", at:$t, fid:$f, headSha:$h, parentSha:$p}' >> "$STATUS"
   ```

### `.bkit/workflows/bkit-ship.md` Step 5

1. **Line 635 (squash `--subject`):** Thread `AUTO_ROUTE_SUFFIX` (already derived on line 626):
   ```bash
   # Before:
   --subject "$(gh pr view {PR_NUMBER} --json title --jq .title) (#{PR_NUMBER})" \
   # After:
   --subject "$(gh pr view {PR_NUMBER} --json title --jq .title) (#{PR_NUMBER})${AUTO_ROUTE_SUFFIX}" \
   ```
   This is the **entire** Option A change — one suffix appended to one `--subject` flag. When `bkit:auto` is labeled, `AUTO_ROUTE_SUFFIX=" bkit [auto route]"`; when not, `AUTO_ROUTE_SUFFIX=""` (no-op). The squash-merge commit on `dev` then carries the marker, and the existing `bkit-cloud.yml` gate (`contains(github.event.workflow_run.head_commit.message, 'bkit [auto route]')`) matches it for the `dev` trigger.

### `.bkit/scripts/bkit-counter-bus-config.sh`

1. **Add `MAX_DEV_DISPATCH_ATTEMPTS` in the bkit-debug section:**
   ```sh
   # bkit-debug.md counters (mode-matched pairs — DE-25, DE-36)
   MAX_DEBUG_ATTEMPT=3
   MAX_NORMAL_ATTEMPT=3
   MAX_SOAK_ATTEMPT=3
   MAX_DEV_DISPATCH_ATTEMPTS=3   # #363 — cross-session dev-triggered debug dispatch cap
   ```

### `.bkit/cloud.md`

1. **Decision log:** Add `## #363 — widen bkit-cloud trigger to post-merge dev CI` entry documenting: Option A rationale, dev vs feat routing table, loop-bound decision, concurrency decision.

2. **Routing table:** Add `dev` row: trigger = `workflow_run` on `dev` CI; success = no-op; failure = `/bkit-debug {FID}`; FID source = commit scope; concurrency = `cancel-in-progress: false`; loop cap = `MAX_DEV_DISPATCH_ATTEMPTS`.

### `docs/deployments.md`

1. **CI/CD matrix:** Add `dev` branch row — post-merge CI fires `workflow_run`; success = no-op; failure = auto-dispatch `/bkit-debug`.

2. **Auto-route contract:** Note that the `bkit [auto route]` marker is now threaded onto the squash-merge `--subject` (not just the sync-merge commit), enabling the `dev` trigger gate.

### `docs/security.md`

1. **§ CI Auto-Route Trust:** Add subsection for `dev` push trigger — trust surface is the squash-merge commit scope (validated against FID slug allowlist); no PR body involved; kill switch (label re-check) and loop cap apply identically.

---

## Supersession Inventory

No plan superseded. This is a new feature plan for #363. Related issues (#119, #397, #80) are referenced but not superseded.

---

## Documentation Updates

| File                  | Change                                                                     |
| --------------------- | -------------------------------------------------------------------------- |
| `.bkit/cloud.md`      | Decision log entry + routing table `dev` row + loop-bound note             |
| `docs/deployments.md` | CI/CD matrix `dev` branch row + auto-route contract update                 |
| `docs/security.md`    | § CI Auto-Route Trust — `dev` push trigger trust surface                   |
| `CHANGELOG.md`        | Unreleased entry: "widen bkit-cloud trigger to post-merge `dev` CI (#363)" |

---

## Rollback Strategy

**Feature is gated and additive.** Rollback path:

1. Revert `workflow_run.branches` from `['feat/**', 'fix/**', 'dev']` to `['feat/**']` — `dev` trigger stops firing immediately. No data migration, no schema change.
2. The `dev-dispatch` status.jsonl rows are harmless additive data; no cleanup needed.
3. The `bkit-ship` `--subject` suffix change (`AUTO_ROUTE_SUFFIX` threading) is backward-compatible — removing it only means `dev` CI runs don't carry the marker (which is fine if the trigger is reverted).
4. The `bkit-auto` CI_DEV mode is dead code if the trigger is reverted (never reached); no runtime impact.
5. Version bump (4.11.0) stays — it's a forward-only release tag.

**Partial rollback (disable loop cap only):** Set `MAX_DEV_DISPATCH_ATTEMPTS=999` in `bkit-counter-bus-config.sh` — effectively unbounded dispatch, restoring the "uncapped loop" behaviour while keeping the trigger widening.

---

## Agent Execution Runbook

> Gate 2 — each task is independently executable. `[ ]` = pending. Check after completion.

### Task 1 — Widen `bkit-cloud.yml` trigger + branch-aware concurrency

- [ ] **Scope:** `.github/workflows/bkit-cloud.yml` lines 28-74.
- [ ] Change `workflow_run.branches` from `['feat/**']` to `['feat/**', 'fix/**', 'dev']`.
- [ ] Change `concurrency.cancel-in-progress` from `true` to `${{ github.event.workflow_run.head_branch != 'dev' }}`.
- [ ] Update header comment (lines 14-16) to document the `dev` post-merge trigger surface.
- [ ] **Done when:** `yq '.on.workflow_run.branches' .github/workflows/bkit-cloud.yml` contains `dev`; `yq '.concurrency.cancel-in-progress'` is the dev-discriminating expression.
- [ ] **Test ref:** T1, T2.

### Task 2 — Extend `bkit-cloud.yml` ctx step `shared-deriv` block for `dev` (both jobs)

- [ ] **Scope:** `.github/workflows/bkit-cloud.yml` `shared-deriv` block in both `run` (claude) and `opencode` jobs — identical changes.
- [ ] Add `if [ "$BRANCH" = "dev" ]` branch before the existing PR-lookup path.
- [ ] Dev-success → `skip=true` + `::notice::`; dev-failure → `PHASE=debug`.
- [ ] FID recovery: primary = commit-scope regex `^\w+\(([0-9]+-[a-z0-9-]+)\):`; fallback = `gh api` merge-commit `associatedPullRequests` → PR body `bkit:fid`.
- [ ] FID slug assertion: `^[0-9]+-[a-z0-9-]+$` (GitHub tracker).
- [ ] Stale-run guard: `workflow_run.head_sha` vs `git rev-parse origin/dev`.
- [ ] Loop cap: source `bkit-counter-bus-config.sh`, count `dev-dispatch` rows, compare to `MAX_DEV_DISPATCH_ATTEMPTS`.
- [ ] Kill switch: re-check `bkit:auto` label on issue (reuse existing label-check logic).
- [ ] Source `bkit-counter-bus-config.sh` at the top of the ctx step run block (before the `if BRANCH == dev` branch).
- [ ] **Done when:** Both jobs' `shared-deriv` blocks contain the dev branch; a bash dry-run with `BRANCH=dev CONCLUSION=failure` and a seeded commit-scope subject produces `phase=debug arg=363-widen-bkit-cloud-trigger skip=false`; with `CONCLUSION=success` produces `skip=true`.
- [ ] **Test ref:** T3, T4, T5.

### Task 3 — Add `MAX_DEV_DISPATCH_ATTEMPTS` to `bkit-counter-bus-config.sh`

- [ ] **Scope:** `.bkit/scripts/bkit-counter-bus-config.sh`.
- [ ] Add `MAX_DEV_DISPATCH_ATTEMPTS=3` in the bkit-debug section (after `MAX_SOAK_ATTEMPT=3`).
- [ ] Comment: `# #363 — cross-session dev-triggered debug dispatch cap`.
- [ ] **Done when:** `grep MAX_DEV_DISPATCH_ATTEMPTS .bkit/scripts/bkit-counter-bus-config.sh` returns the line; `source` the file and `echo $MAX_DEV_DISPATCH_ATTEMPTS` prints `3`.
- [ ] **Test ref:** T10.

### Task 4 — Extend `bkit-auto.md` Step 1 for CI_DEV mode

- [ ] **Scope:** `.bkit/workflows/bkit-auto.md` Step 1, lines 85-118 + Gate 1 checklist line 141.
- [ ] Step 1.5: discriminate `[[ "$ARG" =~ ^[0-9]+$ ]]` → CI (PR_NUMBER) vs CI_DEV (FID).
- [ ] Steps 6-8: gate on `MODE=CI`; in CI_DEV set `BRANCH=dev`, `HEAD_SHA=$(git rev-parse origin/dev)`, skip PR lookup.
- [ ] Step 7 (`PR_STATE != OPEN → Failure Path`): gate on `MODE=CI`.
- [ ] Step 10 (`BRANCH does NOT start with feat/ → Failure Path`): gate on `MODE=CI`.
- [ ] Gate 1 checklist: add CI_DEV placeholders row.
- [ ] **Done when:** A dry-run invocation `/bkit-auto debug 363-widen-bkit-cloud-trigger` (non-numeric ARG) sets `MODE=CI_DEV`, `FID=363-widen-bkit-cloud-trigger`, `BRANCH=dev`, and does NOT call `gh pr view`.
- [ ] **Test ref:** T6, T7.

### Task 5 — Extend `bkit-debug.md` Step 2 for CI_DEV worktree + Step 1 `dev-dispatch` telemetry

- [ ] **Scope:** `.bkit/workflows/bkit-debug.md` Step 1 (telemetry) + Step 2 (worktree setup).
- [ ] Step 2: branch selection — if `MODE=CI_DEV` or `feat/{FID}` absent remotely → create `fix/{FID}` off `origin/dev`; else `feat/{FID}` (existing).
- [ ] Step 1.6: verify `PUSH_MODE=LOCAL` auto-detection works for `fix/{FID}` (no open PR → LOCAL). No change needed; verify only.
- [ ] Step 1 telemetry: in CI_DEV mode, write `dev-dispatch` row to status.jsonl alongside `workflow-started`.
- [ ] **Done when:** A dry-run debug in CI_DEV mode creates `fix/{FID}` (not `feat/{FID}`); status.jsonl contains a `dev-dispatch` row.
- [ ] **Test ref:** T8.

### Task 6 — Thread `AUTO_ROUTE_SUFFIX` into `bkit-ship.md` squash `--subject`

- [ ] **Scope:** `.bkit/workflows/bkit-ship.md` Step 5, line 635.
- [ ] Append `${AUTO_ROUTE_SUFFIX}` to the `--subject` value (after `#{PR_NUMBER})`).
- [ ] `AUTO_ROUTE_SUFFIX` is already derived on line 626 — no new gate logic.
- [ ] **Done when:** Read: line 635 `--subject` includes `${AUTO_ROUTE_SUFFIX}`; bash unit: `LABELS=bkit:auto` → subject ends with `bkit [auto route]`; `LABELS=""` → subject unchanged.
- [ ] **Test ref:** T9.

### Task 7 — Update `.bkit/cloud.md` (decision log + routing table)

- [ ] **Scope:** `.bkit/cloud.md`.
- [ ] Add decision-log entry `## #363 — widen bkit-cloud trigger to post-merge dev CI`.
- [ ] Document: Option A rationale, dev vs feat routing table, loop-bound decision (cap=3, all-time, `dev-dispatch` row), concurrency decision (`cancel-in-progress: false` for dev), FID recovery (commit scope + `gh api` fallback).
- [ ] **Done when:** `cloud.md` contains the decision-log entry with the routing table and both decisions documented.
- [ ] **Test ref:** N/A (documentation).

### Task 8 — Update `docs/deployments.md` (CI/CD matrix + auto-route contract)

- [ ] **Scope:** `docs/deployments.md`.
- [ ] CI/CD matrix: add `dev` branch row (post-merge CI → `workflow_run` → success=no-op, failure=`/bkit-debug`).
- [ ] Auto-route contract: document that `bkit [auto route]` is now threaded onto the squash-merge `--subject` (Option A), enabling the `dev` trigger gate.
- [ ] **Done when:** `deployments.md` CI/CD matrix includes a `dev` row with the post-merge routing.
- [ ] **Test ref:** N/A (documentation).

### Task 9 — Update `docs/security.md` § CI Auto-Route Trust

- [ ] **Scope:** `docs/security.md` § CI Auto-Route Trust.
- [ ] Add `dev` push trigger subsection: trust surface = squash-merge commit scope (FID slug allowlist); no PR body; kill switch (label re-check) applies; loop cap (`MAX_DEV_DISPATCH_ATTEMPTS=3`) as cost control.
- [ ] **Done when:** `security.md` § CI Auto-Route Trust documents the `dev` trust surface.
- [ ] **Test ref:** N/A (documentation).

### Task 10 — Mirror regen + version bump + CHANGELOG

- [ ] **Scope:** `.bkit/version`, `package.json`, `CHANGELOG.md`, `.claude/`, `.cursor/`, `.opencode/`.
- [ ] Bump `.bkit/version` `pinnedVersion` 4.10.0 → 4.11.0.
- [ ] Bump `package.json` `version` 4.10.0 → 4.11.0.
- [ ] `CHANGELOG.md` Unreleased: add `widen bkit-cloud trigger to post-merge dev CI (#363)`.
- [ ] Run `pnpm bkit upgrade` to regenerate `.claude/`, `.cursor/`, `.opencode/` mirrors from `.bkit/`.
- [ ] Run `bkit install` if separate from upgrade (verify via `pnpm bkit upgrade -- --help` or repo convention).
- [ ] Verify mirrors in sync: `git diff --stat` shows mirror files updated, `.bkit/` canonical files are the source.
- [ ] ASCII-only operators in all `.bkit/workflows/*.md` and `.bkit/prompts/*.md` content (no non-ASCII arrows/quotes in managed blocks).
- [ ] **Done when:** `jq -r .version package.json` = `4.11.0`; `grep pinnedVersion .bkit/version` = `4.11.0`; `CHANGELOG.md` has the entry; `pnpm bkit upgrade` produces no unexpected diff.
- [ ] **Test ref:** T11, T12.

### Task 11 — In-repo validation

- [ ] **Scope:** all changed files.
- [ ] YAML structure valid: `yq` parse `bkit-cloud.yml` succeeds; trigger filter + concurrency + ctx step all present.
- [ ] Ctx step bash dry-run: mock `BRANCH=dev CONCLUSION=failure COMMIT_MSG="feat(363-widen-bkit-cloud-trigger): test (#1) bkit [auto route]"` → assert `phase=debug`, `arg=363-widen-bkit-cloud-trigger`, `skip=false`.
- [ ] Ctx step bash dry-run: mock `BRANCH=dev CONCLUSION=success` → assert `skip=true`.
- [ ] Ctx step bash dry-run: seed 3 `dev-dispatch` rows → assert `skip=true` + notice.
- [ ] `bkit-auto` Step 1 dry-run: `ARG=363-widen-bkit-cloud-trigger` → `MODE=CI_DEV`, no `gh pr view`.
- [ ] `bkit-ship` Step 5 read: `--subject` includes `${AUTO_ROUTE_SUFFIX}`.
- [ ] `bkit-counter-bus-config.sh` sources cleanly; `MAX_DEV_DISPATCH_ATTEMPTS=3`.
- [ ] `pnpm turbo lint typecheck` (or repo equivalent) passes.
- [ ] **Done when:** All dry-run assertions pass; lint/typecheck green.
- [ ] **Test ref:** T1-T12.

### Task 12 — Consumer-repo acceptance note

- [ ] **Scope:** `.bkit/cloud.md` or `docs/deployments.md` acceptance section.
- [ ] Document: the `dev`-trigger happy path can only be fully exercised on consumer repos (`app-gether-life`, `visitfrasercoast-com`) that run CI on `push: branches: [dev]` and have `bkit-cloud.yml` installed with secrets. This repo (bkit itself) dogfoods the YAML structure but the full `workflow_run → /bkit-debug → fix → dev CI` loop requires a real consumer repo with `ANTHROPIC_API_KEY` / `OPENCODE_PROVIDER_KEY` secret wired.
- [ ] **Done when:** Acceptance note documents the consumer-repo-only exercisable path.
- [ ] **Test ref:** N/A (documentation).

---

## Verification Plan (Gate 4)

**Automated (in-repo):**

- `yq` parse of `bkit-cloud.yml` — trigger filter, concurrency, ctx step structure.
- Bash dry-runs of ctx step logic (mocked env vars, seeded status.jsonl).
- `source bkit-counter-bus-config.sh && echo $MAX_DEV_DISPATCH_ATTEMPTS`.
- `pnpm turbo lint typecheck` (or repo equivalent).
- Mirror diff check after `pnpm bkit upgrade`.

**Manual (consumer-repo, post-release):**

- On `app-gether-life` or `visitfrasercoast-com`: ship a `feat/{FID}` PR with `bkit:auto` label → verify squash-merge to `dev` carries `bkit [auto route]` in the commit subject → verify post-merge CI on `dev` → if CI fails, verify `/bkit-debug` auto-dispatches → verify `dev-dispatch` row in status.jsonl → verify loop cap after 3 dispatches.
- Verify `dev` CI success → no dispatch (no-op).

---

## Manual Verification

- Read the squash-merge commit on `dev` after a `/bkit-ship` — confirm the subject includes `bkit [auto route]` (when `bkit:auto` labeled) and does NOT include `[skip ci]`.
- Read the `chore({FID}): merge-pr attempt N` close commit — confirm it includes `[skip ci]` and does NOT include `bkit [auto route]`.
- Trigger a `workflow_dispatch` with `phase=debug issue=363` — confirm the existing manual path still works (no regression from the ctx step restructuring).

---

## Merge Method

**Squash merge** to `dev` via `/bkit-ship`. The squash subject will carry `bkit [auto route]` (this plan's change), making the post-merge CI on `dev` eligible to trigger the cloud workflow — dogfooding the feature on itself.
