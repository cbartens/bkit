<!-- Save draft plans in `docs/plans/drafts/`. Move to `docs/plans/active/` when approved for execution. -->

# BAR-187 — Workflow Commit/Push Reduction Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual `plan.md` file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document.

**Linear:** [BAR-187](https://linear.app/bartens/issue/BAR-187/workflow-commitpush-reduction-parentsha-dev-canonical-statusjson)
**FID:** `bar-187-workflow-commit-push-reduction`
**Type:** bkit-repo internal — no DB / RLS / UI / consumer-app surfaces touched.

## Context & Goals

Workflow orchestrators (`bkit-plan`, `bkit-design`, `bkit-build`, `bkit-debug`, `bkit-ship`) make ~15-28 commits and up to ~12 pushes per single workflow run. Two structural over-commitments drive the noise:

1. **Double commits per step** — every step emits a `chore({FID}): <step> work` commit on `feat/{FID}` followed by a separate `chore({FID}): <step> status` commit. The split exists only because `status.json` records the work commit's SHA (`commitSha`), creating a chicken-and-egg ordering.
2. **Per-step dev pushes for plan/design** — BAR-183 made plan/design push `status.json` to `dev` after every status mutation. ~10 dev pushes per workflow with no `[skip ci]` tag → CI noise.

Net effect on `dev` history per feature lifecycle (plan → build → ship clean): ~22 status-bookkeeping commits surrounding 1 substantive feature commit (the PR squash). PR diffs include `status.json` churn. `git log dev` is dominated by workflow plumbing.

**Success Criteria:**

- Per-step commits on `feat/{FID}` reduced from 2 to 1 (one combined commit per step; `parentSha` captured at step start replaces post-commit `commitSha`).
- `status.json` lives at `$REPO_ROOT/docs/plans/logs/{FID}/status.json` for ALL workflows; outside-worktree `cat` reads live state.
- Dev-side commits/pushes occur **only at workflow termination** (close-workflow OR Failure Path). Mid-workflow dev pushes = 0.
- All dev status-only commits carry `[skip ci]` tag.
- Plan/design success close = ONE squash commit landing on `dev` (feat content + status.json).
- Resume from interrupted workflow still works (reads `status.json` from `$REPO_ROOT`).
- All 5 workflows updated consistently; no per-workflow drift in the new pattern.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**

### Narrative

A developer runs `/bkit-plan bar-X` end-to-end on a clean feature, then `/bkit-build bar-X`, `/bkit-ship bar-X`. After ship, `git log dev --oneline | grep bar-X` shows ≤ 4 commits attributable to this feature (1 substantive PR-squash + 3 status-only `[skip ci]` markers across plan close, build close, ship close). During each workflow run, the developer can `cat docs/plans/logs/bar-X/status.json` from the main repo directory and see live progress without entering the worktree.

### Success Criteria

- Per-run `git log feat/bar-X --oneline` shows one commit per workflow step (not two).
- `git log dev --since=<workflow-start> --grep bar-X` shows 0 commits during workflow execution; 1 commit at close-workflow termination.
- `cat $REPO_ROOT/docs/plans/logs/bar-X/status.json | jq '.[-1].steps[-1]'` returns the most recent step entry while the workflow is running, including a `parentSha` field (no `commitSha` field).
- A killed-mid-step workflow can resume via `/bkit-{phase}` re-invocation and continues from the last `DONE` step recorded in `status.json`.

### Concrete Example

**Setup:** Developer on `dev`, `BAR-187` plan executed end-to-end.

**Steps:**

1. Developer runs `/bkit-plan bar-X` → workflow completes successfully.
2. `git log dev --oneline -5` shows ONE commit on dev for the plan: `docs(bar-X): plan DONE` (squash-merged feat content + status.json).
3. Developer runs `/bkit-build bar-X` → workflow completes successfully (PR opened).
4. `git log dev --oneline -10` shows: 1 plan commit + 1 `chore(bar-X): build DONE [skip ci]` status commit (no feat content yet — that lives on the PR).
5. Developer runs `/bkit-ship bar-X` → PR squash-merges, workflow completes.
6. `git log dev --oneline -10` shows: 1 plan commit + 1 build status + 1 PR-squash (feature work) + 1 `chore(bar-X): ship DONE [skip ci]` = **4 commits total** for the feature.

**Outcome:** `git log dev` is feature-by-feature readable. Workflow plumbing reduced to 3 `[skip ci]` markers per lifecycle.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Workflow killed mid-step (process dies, no commit made) | Resume reads `status.json` on disk, finds last `DONE` step, continues. Uncommitted feat artifacts re-applied by next subagent run or re-derivable. |
| Dev moved (someone else pushed) during workflow | `git pull --ff-only origin dev` at close succeeds (status.json paths are FID-scoped, no conflict). |
| Concurrent same-FID run on same machine | Lock check (existing `.lock` mechanism) routes to Failure Path. No change. |
| Failure Path triggered mid-workflow | Status.json `FAILED` committed/pushed to dev (`[skip ci]`); feat granular history preserved on `feat/{FID}` for forensics. |
| Build fails → debug recovers → ship succeeds | Granular commits accumulate on `feat/{FID}` across build + debug. Ship's `gh pr merge --squash` collapses everything into ONE dev commit. Status commits on dev: build FAILED + debug DONE + ship DONE (3 `[skip ci]` markers). |
| Workflow doesn't commit status.json mid-run, but tool/user does `git status` on main repo | Shows `docs/plans/logs/{FID}/status.json` as modified-uncommitted; expected and harmless. |
| Plan/design squash-merge runs after dev moved | `git pull --ff-only` resyncs; squash merge proceeds on fresh dev base. |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `Step` type carries `parentSha` (not `commitSha`); validateInvariants unchanged | Unit (Vitest) | `.agents/scripts/bkit-status.test.ts` |
| All 5 workflow files use `STATUS="$REPO_ROOT/..."` (no relative `docs/plans/logs/...` STATUS assignments) | Lint (grep-based assertion) | New: `.agents/scripts/bkit-workflows-status-path.test.ts` OR inline grep in CI |
| No workflow file contains `commitSha` references (after migration) | Lint (grep-based assertion) | Same as above |
| No mid-workflow `git -C "$REPO_ROOT" push origin dev` outside close-workflow / Failure Path blocks | Lint (grep + line-context assertion) | Same as above |
| All `chore({FID}): ... status` dev commit messages contain `[skip ci]` | Lint (grep) | Same as above |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**

### Breaking changes

1. **Schema field rename** — `Step.commitSha` → `Step.parentSha`. Existing `status.json` files (under `docs/plans/active/*` and `docs/plans/logs/*`) use `commitSha`. No backfill needed (historical files are immutable forensic records). New workflow runs write `parentSha`. The TypeScript type and validateInvariants update accordingly.

2. **Status.json branch placement universal** — `status.json` now lives on `dev`'s working copy (uncommitted during workflow) for build/debug/ship too, not just plan/design. PR diffs no longer include `status.json` churn.

3. **Workflow rule update** — `.agents/workflows.md` Execution Protocol "Status" row + §status.json + §BAR-183 + §Concurrency lock are rewritten. Any downstream tooling that read `git show feat/{FID}:status.json` must switch to `cat $REPO_ROOT/.../status.json`.

4. **Mid-run remote visibility loss** — `https://github.com/{OWNER_REPO}/blob/dev/docs/plans/logs/{FID}/status.json` URLs (used in Linear comments) reflect terminal state of the prior workflow run during in-flight execution. Live state requires `cat` on the local working copy. Documented trade-off (see Context & Goals).

### Naming

- New status field: `parentSha` (camelCase, replaces `commitSha`).
- New env semantic: `PARENT_SHA` (bash variable in workflow steps, replaces `START_SHA`/`SHA` capture-after-commit).
- No new files, no renamed files.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

---

## Alternative Approaches & Recommendations

**Rejected:**

- **Drop per-step commits entirely** (single batched commit at close) — loses bisectability + `git log` narrative + per-subagent attribution + per-step hook signal locality. Status.json is the audit trail but git log is still nice to have. The 50% reduction via `parentSha` is the right sweet spot.
- **Keep `status.json` on `feat/{FID}` for build/debug/ship** (revert BAR-183 universal extension) — saves 1 dev push at close for those, but `cat`-from-anywhere visibility requires `git show feat/{FID}:status.json` instead of `cat`. Visibility ergonomics win the trade.
- **Squash within debug workflow on success** — would require `rebase` or `--amend` (policy-prohibited). PR squash via ship handles the same collapse forward-only.

**Future:**

- If post-rollout `git log dev` is still cluttered by 3 `[skip ci]` markers per feature, consider a single combined "workflow ledger" commit per feature lifecycle (ship merges build/debug/ship status into one dev commit). Out of scope for this plan.

## Out of Scope

- `.agents/scripts/bkit-version.ts`, `bkit-tiers.ts`, install/uninstall surfaces — not touched.
- Subagent prompts (`.agents/prompts/`) — not touched.
- Consumer-app templates (`.agents/templates/`) — not touched (no workflow files there).
- Linear comment lifecycle / Linear API integration — unchanged.
- `.gitignore` — `.lock` already excluded (verified: `.gitignore:48`).
- BAR-184 (pre-worktree divergence guard) — preserved as-is; per-step commits still happen INSIDE the worktree, never on `dev` pre-worktree.

## Merge Method

**Merge method: squash** (per `bkit-ship.md` § Step 4 — `gh pr merge --squash --delete-branch --body ""`). No deviation needed.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `Step.commitSha` field in `bkit-status.ts:11` | `Step.parentSha` | DELETE | Never consumed; pure forensic. `git log -S` covers post-hoc lookup. |
| Per-step `git add "$STATUS" && git commit -m "...status"` patterns in `bkit-build/debug/ship.md` | Single combined work commit + close-workflow dev commit | DELETE | Drives the double-commit waste. |
| Per-step `git -C "$REPO_ROOT" pull/add/commit/push origin dev` blocks in `bkit-plan.md`, `bkit-design.md` | Single close-workflow dev push | DELETE | ~10 dev pushes per plan/design workflow, no `[skip ci]` (CI noise). |
| `.agents/workflows.md` § BAR-183 rationale ("Build/debug/ship continue to keep status.json on feat/{FID}") | Rewritten: "All workflows, status.json on dev via `$REPO_ROOT`" | MODIFY | Universal-extension decision in this plan. |
| `.agents/workflows.md` § Concurrency lock `case "$LOCK_WORKFLOW" in plan | design) ... *) git show feat/{FID}:$STATUS_REL ...` | All branches read `cat "$REPO_ROOT/$STATUS_REL"` | MODIFY | Single status.json location. |

## Security & Privacy

_None — no new routes, DB writes, secrets, or user input._

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Package Management:** No new packages. `pnpm-lock.yaml` unchanged.
- [ ] **Dependency Versions:** No CLI tool changes. `jq` already required by workflows.
- [ ] **User Context:** Read/write access to `.agents/scripts/*`, `.agents/workflows/*.md`, `.agents/workflows.md`.
- [ ] **Pending Blockers:** Query Linear for open `blocker` label. None expected.
- [ ] **Project Context:** Reviewed `.agents/rules.md`, `.agents/workflows.md`, `docs/knowledge.md` BAR-183 / BAR-184 entries.
- [ ] **Testing & Quality:** `.agents/scripts/bkit-status.test.ts` exists and is the canonical place for the new schema test.
- [ ] **Prerequisite Plans:** None. BAR-183 is shipped; BAR-184 is shipped. Both stay compatible.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** Human confirmed § Acceptance Scenario (checkbox `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed § Breaking Changes (checkbox `[x]`).
- [ ] **Gate 1 - Verified:** All Core items checked.

---

## Architecture & Component Changes

### Schema

#### [MODIFY] `.agents/scripts/bkit-status.ts`

- **Existence check:** verified at `.agents/scripts/bkit-status.ts:1-30`.
- Rename field `commitSha: string` → `parentSha: string` on `Step` type.
- Keep all other fields and `validateInvariants` unchanged.
- Update top-of-file doc comment (line 1-5) — replace any commitSha mention with parentSha; clarify "captured at step START via `git rev-parse HEAD`, BEFORE the step's commit".

#### [MODIFY] `.agents/scripts/bkit-status.test.ts`

- **Existence check:** verified at `.agents/scripts/bkit-status.test.ts:1-?` (file exists per `grep`).
- Update fixture line ~10: `commitSha: "a1b2c3d"` → `parentSha: "a1b2c3d"`.
- No new test cases needed (invariants unchanged; rename is mechanical).

### Workflow rules — central

#### [MODIFY] `.agents/workflows.md`

- **Existence check:** verified.
- **§ Execution Protocol → "Status" row** (currently line ~109): no functional change. Optionally clarify "parentSha captured at step START" if word budget allows.
- **§ status.json — workflow state SoT** (currently lines 117-202):
  - Rewrite **Branch placement** table (lines 121-128): single row — "All workflows | dev working copy at `$REPO_ROOT` | per-step writes are file-only (uncommitted); committed + pushed only at close-workflow OR Failure Path".
  - Delete the **Rationale** paragraph (line 129) and replace with brief: "Single canonical location enables `cat $REPO_ROOT/docs/plans/logs/{FID}/status.json` outside-worktree progress reads without git knowledge. Per-step writes accumulate locally; one dev push at termination with `[skip ci]`."
  - Update **Field semantics** table: replace `commitSha` row (if explicit) with `parentSha`. Update Shape example block (lines 134-158) — replace any `commitSha` in JSON with `parentSha`, sample value remains a SHA hash.
  - Update **Init / append patterns** (lines 172-199):
    - `STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"` for ALL workflows (delete the per-workflow conditional comment).
    - Append-step example: add `--arg p "$PARENT_SHA"` and `parentSha:$p` to the jq append; `PARENT_SHA` captured before the step's commit.
    - Delete the "plan/design only: every status mutation is followed by `git -C "$REPO_ROOT" pull/add/commit/push`" block — replaced by close-workflow-only push.
  - Update **Resume rule** (line 201): unchanged semantics; clarify it reads `cat "$REPO_ROOT/$STATUS_REL"`.
- **§ Concurrency lock** (lines 203-235): update the staleness-check `case "$LOCK_WORKFLOW" in ... esac` block to always `cat "$REPO_ROOT/$STATUS_REL"` (drop the `git show feat/{FID}:` branch).
- **§ Pre-worktree divergence guard (BAR-184)** (line 89): no change — still applies; per-step commits still happen INSIDE worktree.
- **§ Extension under BAR-183** (line 91): rewrite — "All workflows write `status.json` to `dev`'s working copy at `$REPO_ROOT` (file-only per step, uncommitted between steps). Single commit + push at close-workflow OR Failure Path. BAR-184 divergence guard still holds: no commits on `dev` between worktree creation and close-workflow."

### Workflow files — per-file pattern changes

Each of `bkit-plan.md`, `bkit-design.md`, `bkit-build.md`, `bkit-debug.md`, `bkit-ship.md` follows the same mechanical pattern. Diff template:

**Commit message convention (aligned to `status.json` schema enum `IN_PROGRESS | DONE | FAILED`):**

- Per-step commits (during workflow): `chore({FID}): {step}` — no `work` / `status` suffix; the step IS done if it commits
- Close-workflow success (substantive): `{type}({FID}): {workflow} DONE` — `type` = `docs` for plan/design (plan markdown content), `docs` for ship (docs updates + status); plan/design has NO `[skip ci]`; build/debug/ship has `[skip ci]`
- Close-workflow success (status-only): `chore({FID}): {workflow} DONE [skip ci]` — build/debug only (no substantive content lands at their close)
- Failure Path: `chore({FID}): {workflow} FAILED [skip ci]` — always

**For every "Update status and commit" block in a step (NOT close-workflow / Failure Path):**

```bash
# OLD (two commits + optional dev push)
STATUS="docs/plans/logs/{FID}/status.json"
git add -A && git commit --allow-empty -m "chore({FID}): {step} work"
SHA=$(git rev-parse HEAD)
t=$(mktemp); jq --arg sha "$SHA" ... '... commitSha:$sha ...' "$STATUS" > "$t" && mv "$t" "$STATUS"
git add "$STATUS" && git commit -m "chore({FID}): {step} status"
# (plan/design only:) git -C "$REPO_ROOT" pull --ff-only origin dev; add; commit; push origin dev

# NEW (one commit, no dev push, no suffix)
PARENT_SHA=$(git rev-parse HEAD)
STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"
t=$(mktemp); jq --arg p "$PARENT_SHA" ... '... parentSha:$p ...' "$STATUS" > "$t" && mv "$t" "$STATUS"
git add -A && git commit --allow-empty -m "chore({FID}): {step}"
```

**For close-workflow on success:**

- **plan / design:** `git merge --squash feat/{FID}` + `git add status.json` + `git commit -m "docs({FID}): {plan|design} DONE"` + push. NO `[skip ci]` — substantive plan/design content lands on dev, CI runs.
- **build / debug:** stage status.json on dev (already at `$REPO_ROOT`), commit `chore({FID}): {build|debug} DONE [skip ci]`, push.
- **ship:** stage all dev-side substantive work (update-docs, archive-docs, worktree-cleanup tree changes) + status.json, commit `docs({FID}): ship DONE [skip ci]`, push. (`docs` because the dev-side content is docs updates + archive moves; `[skip ci]` because the PR squash-merge in Step 4 already triggered CI for the feature.)

**For Failure Path:**

- Stage status.json (already marked FAILED in step body), commit `chore({FID}): {workflow} FAILED [skip ci]`, push.
- Preserve `feat/{FID}` granular history (no destructive ops).

Per-file specifics (line ranges as of current `dev`):

#### [MODIFY] `.agents/workflows/bkit-plan.md`

- 10 status-write blocks across Steps 2-11 (lines ~162-595) — apply new pattern; remove all `git -C "$REPO_ROOT" pull/add/commit/push` per-step blocks.
- Step 2 (line ~162): drop the `start-workflow + worktree-setup status` combined block, replace with two single-commit `parentSha` captures (one per status entry) on `feat/{FID}` working copy only.
- Step 11 close-workflow (lines ~540-595): rewrite to do `git merge --squash feat/{FID}` + stage status.json + ONE dev commit + push. Feat deletion sequence (lines ~574-577) unchanged.
- Failure Path block (lines ~40-60): update to write status FAILED, commit `[skip ci]`, push.
- Update top-of-file "Status branch" caution block (line ~24): "status.json on `dev` working copy at `$REPO_ROOT`; per-step writes are file-only; ONE dev push at close OR Failure Path".
- Gate-check lines: replace all `recorded with commitSha` → `recorded with parentSha` (~10 occurrences).

#### [MODIFY] `.agents/workflows/bkit-design.md`

- Same pattern as plan, 9 status-write blocks. Step 2 same dual-entry pattern. Close-workflow same squash. Failure Path same.
- Gate-check lines: same rename.

#### [MODIFY] `.agents/workflows/bkit-build.md`

- ~14 status-write blocks (per clean-path step + retry-branch steps).
- Status path change: `STATUS="docs/plans/logs/{FID}/status.json"` → `STATUS="$REPO_ROOT/docs/plans/logs/{FID}/status.json"` everywhere.
- Drop all `git add "$STATUS" && git commit -m "...status"` lines after each work commit. Status.json mutation stays (jq), but no per-step status commit.
- Step 2 dual-entry pattern same as plan.
- Close-workflow (line ~870-890): stage status.json on dev + ONE commit `chore({FID}): build DONE [skip ci]` + push dev. Existing feat push at line ~885 unchanged (PR review push).
- Failure Path block (lines ~40-60): same as plan.
- Existing `git push origin $(git branch --show-current)` operational pushes (create-pr step line ~803, close line ~885, Failure Path line ~68) UNCHANGED.
- Gate-check lines: rename ~14 occurrences.

#### [MODIFY] `.agents/workflows/bkit-debug.md`

- Same pattern as build, ~10 status-write blocks (incl. retry branches).
- Operational `git push origin $(git branch --show-current)` pushes at push-remediation (line ~407), summary (line ~443), observe (line ~498), close (line ~626) UNCHANGED.
- Close-workflow: ONE dev commit `chore({FID}): debug DONE [skip ci]` + push dev.
- Gate-check lines: rename ~10 occurrences.

#### [MODIFY] `.agents/workflows/bkit-ship.md`

- Steps 1-6 (on feat/{FID} in worktree): same per-step pattern as build — single combined commit, status.json on `$REPO_ROOT`.
- Steps 7-11 (on dev in `$REPO_ROOT`): batch into close-workflow's single commit. Per-step status.json writes still happen (file-only on dev's working copy), but per-step commits eliminated.
  - Step 7 (switch-to-dev, line ~426-457): keep cwd switch + pull. Drop the per-step commit pair. Just update status.json + capture parentSha; no commit.
  - Step 8 (update-docs + summary, line ~461-516): subagent edits dev-side files. Update status.json. No commit per step.
  - Step 9 (archive-docs, line ~519+): subagent moves files on dev. No commit per step.
  - Step 10 (worktree-cleanup): subagent cleans up. No commit per step.
  - Step 11 (close-workflow, line ~610+): single `git add -A && git commit -m "docs({FID}): ship DONE [skip ci]"` + push dev. Captures: steps 7-11 substantive work + status.json final state (workflow=DONE).
- Failure Path block (lines ~40-60): same.
- Existing `git push origin dev` at line 544 (today's close): removed (replaced by Step 11 batched push).
- Gate-check lines: rename ~12 occurrences.

### Documentation Updates

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `.agents/workflows.md` | Rewrite §status.json branch placement table + rationale; §Concurrency lock staleness-check; BAR-183 extension paragraph. |
| `docs/knowledge.md` | Append KN entry: "Workflow commit/push pattern — status.json canonical on dev via `$REPO_ROOT`; ONE dev push at close; per-step work commits on feat/{FID} only." Reference BAR-187 + BAR-183 + BAR-184 chain. |
| `.agents/docs.md` | Verify no index update needed (workflows.md still authoritative). |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| Code | `git revert {BAR-187-squash-commit}` | Single squash commit on dev — clean revert. |
| Workflows in-flight at rollback | Drain — let active workflows finish under new pattern before reverting. | Pre-revert audit: `ls docs/plans/logs/*/.lock` to confirm no active run. |
| Status.json files written under new schema | Historical `parentSha` records remain in `docs/plans/logs/` — readable by old `commitSha`-expecting code only if validator is forgiving. | `validateInvariants` doesn't reference either field — no runtime break. |

_Code-only — no DB, no deploy infra. `git revert` sufficient._

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Check off `[x]` as each task completes.
> **Step Isolation:** Complete each task fully (including verification) before moving to next.
> **Build path:** This plan is intended to execute via `/bkit-build bar-187` — orchestrator handles status.json + commits per the OLD pattern during build itself (this plan modifies the workflows; the changes apply to FUTURE runs, not the run building this plan).

**Implementation Tasks:**

### Phase A — Schema (foundation, 2 files)

- [ ] **Task A1:** `MODIFY .agents/scripts/bkit-status.ts` — rename `commitSha: string` → `parentSha: string` on `Step` type (line 11). Update top doc comment to clarify capture timing.
  - **Verification:** `grep -n "commitSha" .agents/scripts/bkit-status.ts` returns empty; `grep -n "parentSha" .agents/scripts/bkit-status.ts` returns the type field line.

- [ ] **Task A2:** `MODIFY .agents/scripts/bkit-status.test.ts` — replace `commitSha:` in fixture with `parentSha:`.
  - **Verification:** `pnpm vitest run .agents/scripts/bkit-status.test.ts` passes.

### Phase B — Central rules (1 file)

- [ ] **Task B1:** `MODIFY .agents/workflows.md` § status.json (lines ~117-202):
  - Branch placement table → single row, all workflows on dev via `$REPO_ROOT`.
  - Init/append code blocks → single `STATUS="$REPO_ROOT/..."` form; `parentSha` capture pattern.
  - Delete the per-step dev push block (lines ~194-198).
  - Resume rule wording updated.
  - **Verification:** `grep -n "commitSha\|feat/{FID}:.\\$STATUS_REL\|push origin dev" .agents/workflows.md` — every match must be in BAR-183 historical reference, close-workflow block, or Failure Path block (NOT per-step).

- [ ] **Task B2:** `MODIFY .agents/workflows.md` § Concurrency lock (lines ~203-235): replace the `case "$LOCK_WORKFLOW"` staleness-check with single-branch `cat "$REPO_ROOT/$STATUS_REL"`.
  - **Verification:** `grep -n "git show \"feat/" .agents/workflows.md` returns empty (or only in historical/diff context).

- [ ] **Task B3:** `MODIFY .agents/workflows.md` § BAR-183 extension paragraph (line ~91): rewrite to "All workflows, status.json on dev via `$REPO_ROOT`, single push at termination".
  - **Verification:** paragraph reflects universal extension; no per-workflow branching language remains.

### Phase C — Workflow files (5 files, parallel-safe edits since each file is independent)

- [ ] **Task C1:** `MODIFY .agents/workflows/bkit-plan.md`:
  - Top caution block (line ~24) — update Status branch wording.
  - All status-write blocks (10 steps) — apply NEW pattern: `PARENT_SHA` capture, `STATUS="$REPO_ROOT/..."`, jq with `parentSha:$p`, single combined work commit, NO per-step dev push/commit.
  - Step 11 close-workflow (lines ~540-595): `git merge --squash feat/{FID}` + stage status.json + single commit `docs({FID}): plan DONE` + push dev. Feat deletion unchanged.
  - Failure Path (lines ~40-60): commit status FAILED `[skip ci]` + push dev.
  - Gate-check rename: `recorded with commitSha` → `recorded with parentSha` (~10 occurrences).
  - **Verification:** `grep -nE "git add \"\\\$STATUS\"|commitSha" .agents/workflows/bkit-plan.md` returns empty. `grep -nE "PARENT_SHA|parentSha" .agents/workflows/bkit-plan.md` returns ≥10 matches. `grep -nE "merge --squash" .agents/workflows/bkit-plan.md` returns ≥1 match (in close-workflow).

- [ ] **Task C2:** `MODIFY .agents/workflows/bkit-design.md`:
  - Same pattern as plan; 9 status-write blocks.
  - Close-workflow squash-merge same as plan.
  - **Verification:** same grep assertions as Task C1.

- [ ] **Task C3:** `MODIFY .agents/workflows/bkit-build.md`:
  - All status-write blocks (~14) — apply NEW pattern.
  - `STATUS=` paths all `$REPO_ROOT/...`.
  - Close-workflow: stage status.json on dev + single `chore({FID}): build DONE [skip ci]` + push dev. Existing feat push at create-pr (line ~803) and close (line ~885) UNCHANGED.
  - Failure Path: same pattern as plan.
  - **Verification:** `grep -nE "git add \"\\\$STATUS\"|commitSha" .agents/workflows/bkit-build.md` returns empty. `grep -c "\\[skip ci\\]" .agents/workflows/bkit-build.md` ≥ pre-edit count.

- [ ] **Task C4:** `MODIFY .agents/workflows/bkit-debug.md`:
  - Same pattern as build, ~10 status-write blocks.
  - Operational feat pushes (push-remediation, summary, observe, close) UNCHANGED.
  - Close-workflow: single dev status commit + push.
  - **Verification:** same as Task C3.

- [ ] **Task C5:** `MODIFY .agents/workflows/bkit-ship.md`:
  - Steps 1-6 (feat-side): same per-step pattern as build.
  - Steps 7-11 (dev-side): per-step status.json writes file-only; NO per-step commits.
  - Step 11 close-workflow: batched `git add -A && git commit -m "docs({FID}): ship DONE [skip ci]"` + push dev.
  - Remove the existing `git push origin dev` at line ~544 (now subsumed by Step 11).
  - **Verification:** `grep -nE "git add \"\\\$STATUS\"|commitSha" .agents/workflows/bkit-ship.md` returns empty. Step 7-10 contain NO `git commit` operations (only Step 11 commits).

### Phase D — Mirrors & docs

- [ ] **Task D1:** Run `bkit install` at session end to regenerate `.claude/` and `.cursor/` mirrors from `.agents/*` canonical sources.
  - **Verification:** `git diff --stat .claude/ .cursor/` shows expected mirror updates.

- [ ] **Task D2:** `MODIFY docs/knowledge.md` — append KN entry referencing BAR-187, BAR-183, BAR-184 chain.
  - **Verification:** `grep -n "BAR-187" docs/knowledge.md` returns the new entry.

### 🔒 Gate 2: Code Implementation Check

- [ ] All Phase A, B, C, D tasks above are `[x]`.
- [ ] No file in `.agents/scripts/` or `.agents/workflows/` contains the literal string `commitSha` (verify: `grep -rn commitSha .agents/`).
- [ ] No workflow file contains a per-step `git add "$STATUS" && git commit -m "...status"` pattern (verify: `grep -nE "git add \"\\\$STATUS\"" .agents/workflows/`).
- [ ] No workflow file contains a per-step `git -C "$REPO_ROOT" push origin dev` OUTSIDE close-workflow or Failure Path blocks (verify by reading each push call's surrounding step header).
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified.

### Testing & Documentation

- [ ] **Verify test coverage against Derived Test Matrix:**
  - Row 1 (`Step.parentSha` schema): covered by `.agents/scripts/bkit-status.test.ts` (Task A2).
  - Rows 2-5 (lint-style assertions): all enforced via grep checks in Gate 2. Optional — add a dedicated lint script if grep-in-gate proves insufficient over time.

- [ ] **Update existing tests:** None — only `.agents/scripts/bkit-status.test.ts` is touched.

- [ ] **Write new tests:** Skip — invariants are unchanged, schema change is rename-only.

- [ ] **Update documentation:** Task D2 (knowledge.md KN entry) done in Phase D.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] `pnpm vitest run .agents/scripts/bkit-status.test.ts` passes.
- [ ] `docs/knowledge.md` has BAR-187 entry.
- [ ] `.agents/workflows.md` reflects all three BAR-187/BAR-183/BAR-184 references coherently.
- [ ] **Gate 3 - Verified.**

## Verification Plan

### Automated Tests

- [ ] **Type check + lint:** `pnpm turbo lint typecheck format:check test` (per `.agents/rules.md` §Testing).
- [ ] **Vitest unit:** `.agents/scripts/bkit-status.test.ts` passes.
- [ ] **Grep assertions (Gate 2 lint-style):**
  - `grep -rn commitSha .agents/` → empty.
  - `grep -nE "git add \"\\\$STATUS\"" .agents/workflows/` → empty.
  - `grep -nE "STATUS=\"docs/plans" .agents/workflows/` → empty (all should be `$REPO_ROOT/docs/plans`).
  - Each workflow file has exactly ONE `git -C "\\\$REPO_ROOT" push origin dev` inside close-workflow block + ONE inside Failure Path block (no others).
- [ ] **Mirror regeneration:** `bkit install` exits clean; `git status .claude/ .cursor/` matches expected diff.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] All grep assertions pass.
- [ ] All Vitest tests pass.
- [ ] All `pnpm turbo lint typecheck format:check test` checks pass.
- [ ] **Gate 4 - Verified.**

### Manual Verification

- [ ] **Manual workflow dry-run on a throwaway FID:** Pick a tiny no-op feature (e.g., a typo fix in `README.md`) and run `/bkit-plan bar-XXX`, then `/bkit-build bar-XXX`, then `/bkit-ship bar-XXX` end-to-end. Verify:
  - During each workflow: `cat docs/plans/logs/bar-XXX/status.json` from main repo dir returns live state with `parentSha` fields.
  - During each workflow: no dev pushes occur (`git log origin/dev --oneline` is stable between workflow start and close).
  - At workflow close: exactly 1 commit lands on dev with `[skip ci]` (build/debug/ship) or as `docs({FID}): plan DONE` (plan/design — substantive, no `[skip ci]`).
  - At ship completion: `git log dev --oneline -10` shows the feature lifecycle as ≤4 commits.
- [ ] **Resume test:** Kill a workflow mid-step (Ctrl-C the orchestrator). Re-invoke. Verify resume reads `status.json` from `$REPO_ROOT` and continues after last `DONE` step.
- [ ] **Failure Path test:** Trigger an artificial Failure Path (e.g., subagent returns empty artifact). Verify status FAILED commit lands on dev with `[skip ci]`; feat/{FID} preserved with granular history.

---

## Design Decisions

### Why parentSha (not commitSha)?

`commitSha` references the SHA of the step's work commit, which doesn't exist until AFTER `git add -A && git commit`. So status.json must be written THEN committed in a separate step → double commit. Switching to `parentSha = git rev-parse HEAD` (captured at step START) removes the ordering: status.json can be written FIRST and committed alongside the work in a single commit. The information value is equivalent — both fields say "this step landed after commit X" — and `commitSha` was never read by any code outside its type declaration (`grep -rn commitSha .agents/` returns only writer sites and the type definition).

### Why status.json on dev (not feat/{FID}) for build/debug/ship?

Three benefits:

1. **Outside-worktree visibility** — `cat $REPO_ROOT/docs/plans/logs/{FID}/status.json` works from anywhere. Today it requires `git show feat/{FID}:status.json` (build/debug/ship) or entering the worktree.
2. **PR diffs clean** — status.json churn drops out of the PR squash entirely. Reviewers see substantive code only.
3. **Cross-workflow handoff** — ship reads prior debug's `debugAttempt` from a single canonical location, no branch-aware logic.

Cost: +1 dev push per workflow at close (build/debug). Acceptable for the visibility gain.

### Why per-step commits on feat/{FID} (not single batched at close)?

Considered fully batching to ONE commit at close per workflow. Decided AGAINST because:

- Loses `git bisect` to localize regressions to a specific step.
- `git log feat/{FID}` no longer reads as workflow narrative.
- Pre-commit hook signal locality (lint-staged) — failures muddier on a giant batched commit.
- `git show HEAD` per-step is the cleanest way to see what one subagent produced.

Status.json provides the audit trail (step name, timestamps, verdicts, parentSha, artifacts) — but `git log` is still nice to have for spelunking. The `parentSha` swap halves commits already; further reduction has real cost without clear benefit.

### Why squash-merge plan/design on success (but not build/debug)?

- **plan/design** merge to dev directly with NO PR. Without a squash step, every per-step feat commit lands on dev via `git merge --no-edit` (today's pattern), bringing ~10 commits per workflow onto dev. Squash collapses to ONE.
- **build/debug** land on dev via the ship workflow's `gh pr merge --squash` — already squashed. No additional squash step needed.

### Why preserve granular commits on failure?

Failure debugging needs the granular history. Status.json says "step N failed"; the commit history says "subagent at step N produced these exact file changes." `git show HEAD~K` is the fastest way to see partial work. Preserving feat/{FID} on origin (push at Failure Path) gives forensic access from anywhere.

### Why all dev close commits use [skip ci] (except plan/design success)?

- **build / debug / ship close-workflow on success**: dev commits are status-bookkeeping only (or in ship's case, doc updates + status). The substantive feature commit landed via `gh pr merge --squash` separately. No need for CI to re-run.
- **plan / design close-workflow on success**: the squash-merge IS the substantive feature work (plan files landing on dev). CI SHOULD run because the plan/design content is now on dev and downstream tooling depends on it (e.g., consumer-app `bkit install` reads docs/plans).
- **All Failure Paths**: status FAILED with `[skip ci]` — CI on a failed workflow is meaningless.

### Why not eliminate dev pushes during workflow for build/debug?

Already eliminated. Build/debug make ZERO dev pushes during their workflow today (status.json was on feat/{FID}, status pushes weren't sent to dev). The new pattern adds ONE dev push at close for status.json visibility — that's the +1 push cost noted in Net Impact.

### Compatibility with BAR-184 (pre-worktree divergence guard)

BAR-184 says Step 1 must NOT commit on dev pre-worktree. Per-step commits in the new pattern happen INSIDE the worktree on feat/{FID}, never on dev. Only close-workflow / Failure Path commit on dev. BAR-184 preserved.

### Compatibility with BAR-183 (original status.json on dev for plan/design)

BAR-183 is generalized to all workflows here. The lock-staleness `git show feat/{FID}:status.json` branch goes away (single `cat` everywhere). No regression — every plan/design behaviour BAR-183 enabled is preserved + extended to build/debug/ship.
