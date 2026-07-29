Verdict: CONCERNS
<!-- verdict:end -->

Failures: 8

# Plan Review 1 — Tightness, Scope Discipline, Design-Coverage

**Plan:** `docs/plans/202607/logs/363-widen-bkit-cloud-trigger/plan-v1-draft.md`
**Reviewer lens:** Plan tightness, scope discipline, design-coverage.
**Method:** Every source file the plan touches was read against current tree state (`.github/workflows/bkit-cloud.yml`, `.bkit/workflows/bkit-auto.md`, `.bkit/workflows/bkit-debug.md`, `.bkit/workflows/bkit-ship.md`, `.bkit/scripts/bkit-counter-bus-config.sh`). Line references below cite the **current** tree, not the plan's (sometimes stale) numbers.

## Summary

Design-coverage is strong: all seven settled decisions from the comment thread (filter widen, branch-aware routing, FID-from-commit-scope recovery, Option A suffix threading, the three #363-owned concurrency sub-risks, #397 deferral, and the DROPPED ship-verify/preflight items) map to concrete tasks, and no DROPPED item is re-introduced. Scope is clean — no out-of-scope smuggling.

The plan is **not buildable as written** without fixes, however. The single most important gap is a broken control-flow link in the cross-session loop cap (the load-bearing security/cost control): the `dev-dispatch` counter row is assigned to a writer (`/bkit-debug`) that has no way to know it is running in CI_DEV mode, so the cap silently never increments. Several smaller bash-level defects (`$REPO_ROOT` undefined, inline `${{ }}` expansion of an attacker-influenceable commit message, a task-ordering dependency) would crash the ctx step or weaken the gate if built literally. None require redesign; all are surgical fixes the plan-update pass should fold in.

---

## Design-Coverage Checklist (settled decisions → tasks)

| #   | Settled decision (source)                                                                       | Covered?                                          | Task(s)        |
| --- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------- |
| a   | Filter widens to `['feat/**','fix/**','dev']`, NOT `main` (Comment 6)                           | ✅                                                | Task 1         |
| b   | Branch-aware routing: feat/fix→ship/debug; dev→no-op/debug; main→manual/excluded (Comments 4,6) | ✅                                                | Task 2         |
| c   | FID recovery from squash-merge commit scope on dev (Comment 4 §Scope-IN 3)                      | ✅                                                | Task 2         |
| d   | Option A — `AUTO_ROUTE_SUFFIX` on PR squash-merge `--subject`, gated `bkit:auto` (Comment 5)    | ✅                                                | Task 6         |
| e1  | `cancel-in-progress: false` queue semantic for dev (Comment 7)                                  | ✅                                                | Task 1         |
| e2  | Cross-session loop cap `MAX_DEV_DISPATCH_ATTEMPTS` (Comment 7)                                  | ⚠️ Partial — see H1 (writer has no CI_DEV signal) | Tasks 2,3,5    |
| e3  | Stale-run guard for no-PR dev case (Comment 7)                                                  | ✅                                                | Task 2         |
| f   | #397 cross-surface arbitration explicitly out of scope (Comment 7)                              | ✅                                                | Out of Scope § |
| g   | DROPPED items not re-introduced (ship-verify, preflight, #80) (Comment 4 §DROPPED)              | ✅                                                | Out of Scope § |

---

## Findings

### HIGH

#### H1 — `dev-dispatch` counter row has no CI_DEV detection signal in `/bkit-debug` (loop cap is non-functional)

**Severity:** HIGH &nbsp; **Class:** architectural (control-flow link missing)
**Location:** plan Task 5 + Architecture § `.bkit/workflows/bkit-debug.md` Step 1 telemetry; Data Schema § "Written by: `/bkit-debug` Step 1 (in CI_DEV mode only)".

The cross-session loop cap (`MAX_DEV_DISPATCH_ATTEMPTS`) is the load-bearing security/cost control for sub-risk (e)(2). The plan specifies a clean reader (the cloud ctx step counts `dev-dispatch` rows) **but assigns the write to `/bkit-debug` "in CI_DEV mode only"**, and `CI_DEV` mode does not exist in `bkit-debug`'s scope:

- `MODE=CI_DEV` is introduced only in `bkit-auto.md` (Task 4, Step 1.5). Verified: `bkit-auto.md:75` hard-codes `debug → MODE=CI`; the plan overrides this to CI_DEV only inside `bkit-auto`.
- `bkit-auto.md:167` dispatches `/bkit-debug {FID}` — a **bare FID**, no mode token. Verified there is no MODE/env propagation on the dispatch.
- `bkit-debug.md` has **zero** `CI_DEV` references (grep confirms only `DEBUG_MODE`/`PUSH_MODE`). It derives its own state from `git branch --show-current` (Step 1.3) and never receives a CI_DEV signal.

**Exploit/failure scenario:** Built as written, `/bkit-debug` cannot tell a dev-triggered dispatch from a `feat/**` dispatch. Two outcomes, both wrong:

- If it writes `dev-dispatch` on every debug → `feat/**` debug runs falsely consume the cap (wrong FID surface).
- If it never writes the row (the literal reading — "in CI_DEV mode only" and there is no such mode) → `DEV_COUNT` stays 0 forever → the cap **never fires** → a stuck `dev` feedback loop dispatches unbounded paid agent sessions. This is exactly the cost-amplification vector the cap exists to prevent, and it fails silently.

**Suggested fix (pick one, state it in the plan):**

1. Move the `dev-dispatch` row write into the **cloud ctx step** (`bkit-cloud.yml`) — it already knows `BRANCH=dev` and the FID. Write the row to `status.jsonl` immediately before dispatching `/bkit-debug`. This keeps reader and writer in the same component and removes the cross-skill propagation problem entirely. (Preferred — simplest, fewest moving parts.)
2. Propagate the signal: have `bkit-auto` dispatch `/bkit-debug {FID} dev` (or set an env var the cloud ctx step exports) and have `bkit-debug` detect CI_DEV from the extra token / `BRANCH=dev` at Step 1.3.

---

### MEDIUM

#### M1 — Task ordering: Task 2 (ctx step) has a hard runtime dependency on Task 3 but is listed before it

**Severity:** MEDIUM &nbsp; **Class:** mechanical (dependency)
**Location:** plan Task 2 ("Source `bkit-counter-bus-config.sh`... compare to `MAX_DEV_DISPATCH_ATTEMPTS`") vs Task 3 (adds `MAX_DEV_DISPATCH_ATTEMPTS`).

Task 2's ctx-step bash sources `bkit-counter-bus-config.sh` then runs `[ "$DEV_COUNT" -ge "$MAX_DEV_DISPATCH_ATTEMPTS" ]`. The variable is added by Task 3. The plan states "Gate 2 — each task is independently executable," but if a builder executes in listed order (2 before 3), `MAX_DEV_DISPATCH_ATTEMPTS` is unset. The ctx step opens with `set -euo pipefail` (`bkit-cloud.yml:169`), so `[ "0" -ge "" ]` is a bash integer-expression error → non-zero exit → **the entire ctx step aborts and no cloud dispatch happens**.

**Suggested fix:** Reorder so Task 3 precedes Task 2, or add an explicit `Depends on: Task 3` line to Task 2.

#### M2 — `$REPO_ROOT` is undefined in the ctx step; the `source` path is broken

**Severity:** MEDIUM &nbsp; **Class:** mechanical (undefined variable)
**Location:** plan Architecture § bkit-cloud.yml item 3 bash: `. "$REPO_ROOT/.bkit/scripts/bkit-counter-bus-config.sh"`.

The existing ctx step (`bkit-cloud.yml:158-227`) never defines `REPO_ROOT` — its `env:` block carries only `GH_TOKEN, EVENT, IN_PHASE, IN_ISSUE, CONCLUSION, BRANCH`. With `REPO_ROOT` unset, `. "$REPO_ROOT/.bkit/..."` expands to `. "/.bkit/scripts/bkit-counter-bus-config.sh"` (absolute, nonexistent) → source fails under `set -euo pipefail` → ctx step aborts. Task 2 says "Source bkit-counter-bus-config.sh at the top of the ctx step run block" but does not define `REPO_ROOT`.

**Suggested fix:** Add `REPO_ROOT="$GITHUB_WORKSPACE"` (or `REPO_ROOT="$(pwd)"`) at the top of the ctx-step run block before sourcing, consistent with how `bkit-debug.md`/`bkit-ship.md` derive `REPO_ROOT=$(git rev-parse --show-toplevel)`.

#### M3 — Inline `${{ }}` expansion of `head_commit.message` into bash is an injection / breakage vector

**Severity:** MEDIUM &nbsp; **Class:** mechanical (unsafe substitution)
**Location:** plan Architecture § bkit-cloud.yml item 3 bash: `COMMIT_MSG="${{ github.event.workflow_run.head_commit.message }}"` and `HEAD_SHA="${{ github.event.workflow_run.head_sha }}"`.

`head_commit.message` is the squash-merge subject = the PR title, which a contributor controls and may legitimately contain a double-quote (e.g. `feat(363-foo): handle "edge" case`). Inline `${{ }}` substitution into a double-quoted bash string closes the string on the embedded `"` and enables arbitrary shell execution. The existing ctx step deliberately passes dynamic values through the `env:` block (`CONCLUSION`, `BRANCH`); the plan should follow that pattern. (Note: `head_commit.message` is already used safely in `run-name` via `format()` and in the `if:` gate via `contains()` — both expression-context, not shell-context.)

**Suggested fix:** Add to the ctx step `env:` block `COMMIT_MSG: ${{ github.event.workflow_run.head_commit.message }}` and `HEAD_SHA: ${{ github.event.workflow_run.head_sha }}`; reference `$COMMIT_MSG` / `$HEAD_SHA` in the bash.

#### M4 — `bkit-debug.md` Step 2 worktree change is redundant; existing code already creates `fix/{FID}`

**Severity:** MEDIUM &nbsp; **Class:** mechanical (no-op change / references undefined var)
**Location:** plan Task 5 + Architecture § bkit-debug Step 2.

The plan proposes adding `if [ "$MODE" = "CI_DEV" ] || ! git fetch origin "feat/{FID}"; then WORKTREE_BRANCH="fix/{FID}"`. Two problems:

1. The existing code (`bkit-debug.md:318-327`) **already** falls through to `git worktree add "$WORKTREE_PATH" -b "fix/{FID}" origin/dev` when `feat/{FID}` is absent — the exact post-merge condition (squash-merge's `--delete-branch` deletes `feat/{FID}`). The change is functionally a no-op for the intended case.
2. `$MODE` does not exist in `bkit-debug` (see H1) — `MODE = CI_DEV` would always be false here, so the proposed guard relies entirely on the `feat/{FID}`-absent fallback that already exists.

**Suggested fix:** Drop the Step 2 branch-selection edit and mark Step 2 as **verify-only** (the existing fallback already produces `fix/{FID}` off `origin/dev` for post-merge). Keep Task 5's Step 1.6 `PUSH_MODE=LOCAL` verify and the telemetry write (once H1's signal is resolved).

#### M5 — `bkit-auto.md` Step 1.9 (PR-body marker extraction) is not gated for CI_DEV; `ISSUE_ID` derivation unspecified

**Severity:** MEDIUM &nbsp; **Class:** mechanical (missing gate + missing derivation)
**Location:** plan Task 4 (gates Steps 6-8, 7, 10 on `MODE=CI`) — omits Step 9.

Task 4 lists gating Steps 6-8, Step 7, and Step 10 on `MODE=CI`, but omits **Step 9** (`bkit-auto.md:93-117`, "Extract `ISSUE_ID` and `FID` from PR body metadata" via `pull_request_read({ pull_number: {PR_NUMBER} })`). In CI_DEV mode Step 1.6 is skipped so `PR_NUMBER` is empty/undefined; an ungated Step 9 would call `pull_request_read` with no PR number. Additionally, the plan never states how `bkit-auto` derives `ISSUE_ID` in CI_DEV mode: `FID` comes from `ARG` (Task 4 Step 1.5), but the numeric `ISSUE_ID` extraction (`ISSUE_ID=$(echo "$FID" | grep -oE '^[0-9]+')`) is not specified for this path, even though the concrete example (plan §Concrete Example step 5) assumes `ISSUE_ID=142`.

**Suggested fix:** Add Step 9 to the "gate on `MODE=CI`" list in Task 4; add an explicit `ISSUE_ID` numeric-prefix derivation in the CI_DEV branch of Step 1.5.

#### M6 — Ctx-step dev-branch placement is structurally ambiguous (inside shared-deriv vs before PR-lookup)

**Severity:** MEDIUM &nbsp; **Class:** mechanical (placement / stale line ref)
**Location:** plan Architecture § bkit-cloud.yml item 3 ("shared-deriv block, lines 190-214") vs Task 2 ("Add `if BRANCH=dev` before the existing PR-lookup path").

These two statements conflict. The PR-lookup (`gh pr list --head "$BRANCH" --base dev --state open`, `bkit-cloud.yml:182` claude / `:317` opencode) **precedes** the `shared-deriv` block (`:190`/`:325`) and exits early (`skip=true`) when no open PR is found — which is **always** the case for `BRANCH=dev` (no `dev→dev` PR exists). Therefore a dev branch placed _inside_ the current shared-deriv block (190-214) is **unreachable**. Task 2's checklist ("before the existing PR-lookup path") is correct, but the Architecture section frames it as a shared-deriv-block edit at "lines 190-214" and wraps the spec in `# bkit:start/end shared-deriv` markers with the PR-lookup moved into the `else` — implying a marker relocation/restructure that the plan undersells as "the builder adapts it."

**Suggested fix:** Make placement explicit: the `if [ "$BRANCH" = "dev" ]` guard is inserted immediately after the `case "$CONCLUSION"` routing (before `:182`/`:317`), the `gh pr list` PR-lookup moves into the `else` branch, and the `shared-deriv` markers are extended upward to encompass the new guard. State that the managed-block boundary moves.

---

### LOW

#### L1 — bkit-debug telemetry location misstated (Step 1 vs Step 2.6)

**Severity:** LOW &nbsp; **Class:** mechanical (stale step reference)
**Location:** plan Task 5 scope — "bkit-debug.md Step 1 (telemetry)".

The `workflow-started` row — the "alongside" anchor for the `dev-dispatch` row — is written at `bkit-debug.md` Step 2.6 (`:368`), not Step 1. Step 1 (lines 121-281) contains no `workflow-started` write. A builder following "Step 1 telemetry" literally will not find the anchor.

**Suggested fix:** Change "Step 1 (telemetry)" to "Step 2.6 — alongside the `workflow-started` row write (line 368)."

---

## Scope Discipline — no findings

- No DROPPED item (ship-verify block, preflight advisories, renumber cascade, `#80` audit-logs migration) is re-introduced. The Out-of-Scope § explicitly fences each.
- No task smuggles work beyond the settled design. Task 6 is correctly minimal (one `${AUTO_ROUTE_SUFFIX}` append to one `--subject`).
- `main` is correctly excluded everywhere (filter, routing table, docs).
- `MAX_DEV_DISPATCH_ATTEMPTS` partial-rollback note is correctly bounded (does not expand scope).

## Task Ordering & Dependencies — summary

- **One ordering defect (M1):** Task 2 → Task 3 dependency unrecognised.
- **One coupling gap (H1):** Task 4 (sets CI_DEV in bkit-auto) and Task 5 (consumes CI_DEV in bkit-debug) are coupled by a MODE-propagation link the plan does not define.
- No circular dependencies. Tasks 1, 6, 7, 8, 9, 10 are genuinely independent.

## Buildability — summary

Files/section references verified against current tree:

- `bkit-cloud.yml:31` (branches), `:73-74` (concurrency), `:190-214`/`:325-344` (shared-deriv) — **accurate**.
- `bkit-ship.md:625-626` (AUTO_ROUTE_SUFFIX derive), `:634-635` (squash `--subject`) — **accurate**; Task 6 change point confirmed.
- `bkit-auto.md:85` (Step 1.5), `:86-92` (Steps 6-8), `:93-117` (Step 9 — **not gated, see M5**), `:118` (Step 10), `:141` (Gate 1) — mostly accurate; Step 9 gap is M5.
- `bkit-debug.md:179-181` (Step 1.6 PUSH_MODE), `:318-327` (Step 2 worktree — **already handles fix/{FID}, see M4**), `:368` (workflow-started — **Step 2.6 not Step 1, see L1**).
- `bkit-counter-bus-config.sh:16-19` (debug counters section) — **accurate**; Task 3 insertion point confirmed.
- `.bkit/version` (`pinnedVersion: 4.10.0`) and `package.json` (`version: 4.10.0`) — **accurate**; bump target 4.11.0 confirmed.
- `.bkit/cloud.md:446` (Decision log) — **exists**; Task 7 insertion point confirmed.

## Recommendation

CONCERNS — not blocking on design grounds (coverage of settled decisions is complete and scope is clean), but **blocking on buildability** for H1, M1, M2, M3 if the plan is executed literally. Recommend the plan-update pass fold in the eight fixes above before `/bkit-build`. H1 is the priority: without a defined CI_DEV signal for the `dev-dispatch` writer, the plan's central loop-bound control is silently inert.
