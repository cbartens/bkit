Verdict: PASS

<!-- verdict:end -->

<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). `{YYYYMM}` = creation month, set once at design start. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

<!-- bkit:start -->

# CI-Dispatch Gate — Outcome-Based Verification of the Final Loud Push (#261) Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

## Context & Goals

A build or debug workflow finishes, the PR exists, but **bkit-tests never run** because the PR's HEAD commit carries `[skip ci]`. GitHub suppresses both `pull_request` and `push` runs (substring match on the HEAD message), `gh pr view --json statusCheckRollup` comes back empty, and fail-fast gates admit a **vacuously green PR** (KN-11). The existing shared **HEAD-Subject Assertion** (`.bkit/workflows.md` §, #184) only checks a deny-list string against the commit the orchestrator _just constructed_ (clean by construction) — it never reads the real remote HEAD GitHub evaluated and never confirms a run was actually dispatched.

This plan replaces that string-check safeguard with an **outcome-based CI-Dispatch gate** that, after the final loud push, confirms a `bkit-decide` run was dispatched for the exact pushed HEAD; if none appears within a bounded poll and HEAD is clean, it self-heals once with a clean `re-trigger` commit, then either confirms or terminates with a named verdict. The gate fires **post-final-push only** — it adds **zero** mid-build CI triggers, preserving the load-bearing D2 cloud-auto-route concurrency invariant (KN-30 / §141 / #184): build/debug fire CI exactly once, on the loud close-workflow (build) / create-pr-or-close (debug) commit. Two companion edge-case guards (EC-2 abort-guard, EC-1 pre-flight) close the most likely "build ends in a PR not running tests" path.

This is an **authoring-only** change to `.bkit/workflows/*.md` plus rationale docs, one bkit-repo consistency test, and rendered host mirrors. No application code.

**Success Criteria:**

- After a build/debug workflow completes its final loud push, CI is confirmed **dispatched for the exact pushed HEAD** — or, when no run appears, the workflow self-heals once or terminates with a named, actionable verdict (`dispatched` / `self-healed` / `no-ci` / `unresolved`).
- The fix introduces **zero** additional mid-build CI triggers (D2 preserved — no `synchronize` between worktree-setup and the final loud push).
- On a consumer with no CI workflow for the event, the gate concludes `no-ci` and passes as a logged no-op.
- On abort, a branch with an open PR keeps its last remote HEAD (EC-2 guard — no new `[skip ci]` HEAD pushed onto a live PR).
- A build re-run/resume where `feat/{FID}` already has an open PR fails fast with a clear, named message (EC-1 pre-flight) instead of a blind `gh pr create` failure.

**Related Issues:**

- `#209 — Workflow state model: persistent feat/{FID}, NDJSON status.jsonl (closed)` — the `ciDispatch` field is additive on the `step-done` record and must stay backward-compatible with the #209 FOLD reducer.
- `#81 — Avoid regression fail /bkit-ship on skipped essential tests (closed)` — Change C is the downstream backstop; ship is OUT of this gate to avoid masking that signal.
- `#184 — Shared HEAD-Subject Assertion (referenced)` — augmented into the CI-Dispatch Gate.
- `#279 — squash-body [skip ci] leak (open, ship side)` — same suppression class; explicitly NOT fixed here.
- `§141 / KN-30 — D2/D3 cloud auto-route concurrency design (referenced)` — the hard constraint this plan must not regress.
- `KN-11 (deployments.md / knowledge.md) — [skip ci] HEAD → empty rollup → vacuously-green PR` — the symptom this gate closes.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You do NOT need to read the rest of this plan.** Focus here. The agent handles the rest.

### Spec — what good looks like _(canonical; both design and plan phases follow this)_

> [!IMPORTANT]
> Subagents (design synthesise, design summary, plan generate, plan review, plan summary) MUST follow this spec. No subagent restates these rules; this section is the single source of truth.

- **Narrative:** 1–2 sentences, user POV.
- **Success Criteria:** <=5 bullets, each measurable / testable. Outcomes, not implementation steps.
- **Key Edge Cases _(design phase produces; plan phase inherits)_:** Design-shaping only — concurrency, conflict resolution, failure modes.
- **Edge Cases _(plan phase)_:** Inherits design's Key Edge Cases verbatim + adds plan-level cases.
- **Concrete Example _(plan phase only)_:** Specific role + starting state + numbered steps + observable outcome.
- **Derived Test Matrix _(plan phase only)_:** One row per testable behaviour. Each row → exactly one task.

### Narrative _(inherited from design — do not rewrite)_

A maintainer runs `/bkit-build` (or `/bkit-debug`) on an issue; when the workflow finishes its final loud push, they get back a workflow that has **confirmed CI actually started for the pushed HEAD** (a `bkit-decide` run exists), self-healed once if the first push was silently suppressed, or terminated with a clearly named verdict — never a silently green PR with no tests.

### Success Criteria _(inherited from design — do not rewrite)_

- After a build/debug workflow completes its final loud push, CI is confirmed to have been **dispatched for the exact pushed HEAD** — or, when no run appears, the workflow self-heals once or terminates with a named, actionable verdict.
- The fix introduces **zero** additional mid-build CI triggers (D2 preserved).
- On a consumer with no CI workflow for the event, the gate concludes "no CI" and passes as a logged no-op.
- On abort, a branch with an open PR keeps its last remote HEAD (EC-2 guard).
- A build re-run/resume where `feat/{FID}` already has an open PR fails fast with a clear, named message (EC-1 pre-flight).

### Concrete Example _(plan expands from design)_

**Setup:** Maintainer on `feat/261-ci-trigger-gate` with an open PR to `dev`. `/bkit-build` reaches Step 18 (close-workflow). The issue carries `bkit:auto`.

**Steps:**

1. Step 18 re-reads labels → derives `AUTO_ROUTE_SUFFIX=" bkit [auto route]"` from `LABELS` → commits `chore(261-…): close-workflow bkit [auto route]` (clean — no suppressor) → HEAD-subject clause passes → pushes to `feat/261-…`.
2. The **CI-Dispatch gate** (same shell block, after the push) captures `PUSHED_HEAD=$(git rev-parse HEAD)` and polls `gh pr view {PR_NUMBER} --json statusCheckRollup` every `POLL_INTERVAL_S=10`s up to `POLL_BUDGET_S=60`s, logging each iteration with the `[bkit-ci-gate]` prefix. A `bkit-decide` check appears at attempt 3 → outcome `dispatched`.
3. The gate writes the terminal verdict onto the `step-done` NDJSON record via the additive `ciDispatch` field (`{outcome:"dispatched", head:"<sha>", attempts:3}`) and logs `[bkit-ci-gate] dispatched: bkit-decide run found for <sha> after 3 attempt(s)`.

**Outcome:** The maintainer sees a PR whose `statusCheckRollup` is non-empty and a `status.jsonl` `step-done` record carrying `ciDispatch.outcome="dispatched"` — CI is verified to have started, not merely assumed.

**Alternate (self-heal):** If at step 2 the poll exhausts 60s with an empty rollup AND `PUSHED_HEAD` message is clean, the gate pushes ONE clean empty `re-trigger` commit (carrying the same `AUTO_ROUTE_SUFFIX`), re-polls; a run appears → outcome `self-healed`; still nothing → outcome `no-ci` (logged pass). If `PUSHED_HEAD` was dirty (carried a suppressor) → outcome `unresolved(timeout-dirty)` → Failure Path.

### Edge Cases _(plan expands from design's Key Edge Cases)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| First push dispatched a `bkit-decide` run within budget | `dispatched` — no re-trigger, terminal `ciDispatch` verdict written |
| Poll exhausts budget, HEAD clean, re-trigger dispatches a run | `self-healed` — exactly 1 re-trigger commit; verdict `self-healed` |
| Poll exhausts budget, HEAD clean, re-trigger ALSO dispatches nothing | `no-ci` — logged pass (consumer has no CI workflow for the event); never Failure Path |
| Poll exhausts budget, `PUSHED_HEAD` message carries a suppressor token | `unresolved(timeout-dirty)` → Failure Path (do NOT re-trigger a dirty HEAD) |
| Self-heal already attempted (cap=1) and still no run, HEAD clean | `no-ci` (logged pass); cap prevents a second re-trigger |
| `gh pr view`/`gh run list` returns non-zero exit on a poll iteration | retry the iteration within budget (never `set -e` out); if EVERY iteration errored → `unresolved(gh-error)` → Failure Path |
| Re-trigger commit's `AUTO_ROUTE_SUFFIX` != the close-workflow suffix | `unresolved(autoroute-mismatch)` → Failure Path (assert-equal-before-push) |
| Re-trigger would fire CI but a prior run already appeared mid-poll | `dispatched` (re-poll wins); suffix asserted but no second re-trigger beyond cap → `retrigger-suppressed` sub-reason only when re-trigger pushed but still no run after re-poll → folds into `no-ci` discriminator |
| **EC-1:** build re-run where `feat/{FID}` already has an open PR | Pre-flight `gh pr list --head … --base dev` at Step 17 entry → open PR found → Failure Path with named message + `# TODO(#261-ec1)` placeholder |
| **EC-1 probe failure:** `gh pr list` errors at Step 17 entry | Fall through to today's blind `gh pr create` (no regression) |
| **EC-2:** build aborts and `feat/{FID}` has an open PR | Abort-guard: do NOT push the `[skip ci]` abort commit; preserve last validated remote HEAD |
| **EC-2:** build aborts and `feat/{FID}` has NO open PR | Plain abort commit + push as today |
| **EC-2 probe failure:** `gh pr list` errors during abort-guard | Treat as "PR exists, do NOT push" (inverted safe default — cost-asymmetry vs EC-1) |
| Debug AUTO_ROUTE sourcing: gate runs after `BKIT_AUTO_ROUTE_FILE` is `rm`-ed | Gate reuses the in-block `AUTO_ROUTE_SUFFIX` shell var already materialised from the file before the `rm` (it stays in scope) — `RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"`; do NOT reorder the `rm` or re-read the removed file |
| Ship workflow final push | OUT of scope — ship keeps its pre-existing `SQUASH_SHA`-poll gate (Step 13); no CI-Dispatch gate added (would mask #81 Change C) |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task. The two gate sites are authored as workflow _instructions_ (not executable code), so their "tests" are (a) the WS-6 cross-file alignment vitest and (b) the manual live-dogfood verification rows. The boundary-observing rows (live `gh`) are covered by manual verification because the gate is agent-executed bash, not a unit-testable function.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Build close-workflow site carries the CI-Dispatch gate (named symbols `POLL_BUDGET_S`/`POLL_INTERVAL_S`, `[bkit-ci-gate]` prefix, 4-outcome state machine, `ciDispatch` field) | Static/grep (vitest) | `.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts` |
| Debug close-workflow + create-pr site carries the same shared gate sub-lines | Static/grep (vitest) | `.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts` |
| Build and debug gates are byte-equal on the SHARED poll-loop + named-symbol sub-lines (NOT whole-gate — AUTO_ROUTE sourcing legitimately differs) | Static/grep (vitest) | `.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts` |
| Ship has NO CI-Dispatch gate (only its pre-existing `SQUASH_SHA`/`gh run list` gate) | Static/grep (vitest) | `.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts` |
| `ciDispatch` field shape parses cleanly through the #209 FOLD reducer (additive, no schema break) | Unit (vitest, bash via execFileSync) | `.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts` |
| Live: build close-workflow push → `bkit-decide` run dispatched for pushed HEAD; `ciDispatch.outcome="dispatched"` in `status.jsonl` | Manual (live `gh`, boundary) | Manual Verification Step 1 |
| Live: a forced `[skip ci]` HEAD push → gate self-heals once → run appears → `ciDispatch.outcome="self-healed"` | Manual (live `gh`, boundary) | Manual Verification Step 2 |
| Live (bkit degenerate repo / no-ci consumer): clean re-trigger dispatches nothing → `ciDispatch.outcome="no-ci"` logged pass | Manual (live `gh`, boundary) | Manual Verification Step 3 |
| Live: build abort on a branch with an open PR preserves remote HEAD (EC-2) | Manual (live `gh`, boundary) | Manual Verification Step 4 |
| Live: build re-run with existing open PR fails fast with named EC-1 message | Manual (live `gh`, boundary) | Manual Verification Step 5 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below. This is the only other section requiring your attention.

> [!IMPORTANT]
> **Section rename (docs + workflow doctrine, not a code symbol):**
> `.bkit/workflows.md` § **"HEAD-Subject Assertion"** → § **"CI-Dispatch Gate"**, and `docs/deployments.md` § **"CI trigger on final workflow push"** updated to describe the outcome gate. The HEAD-subject string clause is **retained** as the pre-push fast-fail _inside_ the renamed section; the rename reflects that the section now documents an outcome-verification gate, of which the string clause is one part. Any cross-reference to the old § name (e.g. in `docs/deployments.md` line ~319, `docs/knowledge.md` KN-11 `Related`) must be updated in lockstep.

> [!IMPORTANT]
> **New named symbols (workflow bash, both gate sites — must be identical):**
> `POLL_BUDGET_S=60`, `POLL_INTERVAL_S=10` (derived `ATTEMPTS=6`). Log prefix `[bkit-ci-gate]` on every poll/verdict line. Sub-reason codes: `timeout-dirty` / `retrigger-suppressed` / `autoroute-mismatch` / `gh-error`. Outcome vocabulary: `dispatched` / `self-healed` / `no-ci` / `unresolved`.

> [!IMPORTANT]
> **New NDJSON field (additive, backward-compatible):**
> `ciDispatch` object on the `step-done` record — `{outcome, head, attempts}` plus optional `reason` (sub-reason code) and `retrigger` (bool). Additive only: the #209 FOLD reducer does `del(.type,.workflow)` and merges the rest, so an extra key is preserved, never breaks the fold. No existing field is renamed or removed.

> [!WARNING]
> **D2 invariant is load-bearing — do NOT change the `[skip ci]` on `worktree-setup` / `create-pr` commits.** The gate fires post-final-push ONLY. No mid-build auto-router. Build's `create-pr` commit stays `[skip ci]` (EC-3 is NOT in scope — the design explicitly does not make create-pr clean).

> [!WARNING]
> **2 gate sites, not 3.** Ship is OUT. Do not add a CI-Dispatch gate at any ship step.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

- **Rejected — add the gate at ship too (3 sites).** Ship already has a `SQUASH_SHA`-poll gate at Step 13 (`gh run list --branch dev --commit "$SQUASH_SHA"` → assert `bkit-tests` not skipped/failed). Adding a self-heal there would mask the #81 Change C "essential tests skipped" signal that ship is the designed backstop for. Ship stays a verifier, not a self-healer.
- **Rejected — whole-gate byte-equality between build and debug.** The two gate sites legitimately differ in AUTO_ROUTE sourcing (build re-derives from `LABELS` in-block; debug reads `BKIT_AUTO_ROUTE_FILE` before `rm`). WS-6 asserts equality only on the SHARED poll-loop + named-symbol sub-lines.
- **Rejected — give build debug's PR-mode push to fix EC-1 (issue's original framing).** A mid-build `synchronize` on a clean HEAD is exactly the D2 auto-router defect. EC-1 is instead a _pre-flight fail-fast_ (detect existing PR, name it, Failure Path) — no mid-build push.
- **Rejected — `PUSH_MODE`-based no-op for "no CI".** `LOCAL` still dispatches CI (it creates a PR). The only legitimate no-op is "repo has no CI workflow for the event," discriminated by the clean re-trigger dispatching nothing — no mode branch.
- **Deferred — EC-3 (make build's create-pr commit clean).** Couples to the D2 contract; benign in today's buried-commit flow. Not in scope (design defers it).
- **Future — #279 squash-body `[skip ci]` leak (ship side).** Same suppression class; tracked separately.

## Out of Scope

- Ship CI-Dispatch gate (ship's existing gate is sufficient; adding one masks #81 Change C).
- EC-3 — making build's create-pr commit clean (defers; D2-coupled).
- #279 — squash-body `[skip ci]` leak on the ship side.
- Any application/runtime code change. This is authoring + one bkit-repo test + mirror re-render only.
- Changing the `[skip ci]` markers on `worktree-setup` / `create-pr` / intermediate bookkeeping commits (D2 load-bearing).
- New mid-build CI triggers of any kind.

## Merge Method

**Merge method: always squash.** `bkit-ship.md` is hardcoded to `gh pr merge --squash --delete-branch --body ""`. This plan ships as a single squash-merged PR into `dev`. No commit-boundary preservation needed.

## Supersession Inventory

The HEAD-Subject Assertion is **augmented, not deleted** — its string clause is retained inside the renamed § "CI-Dispatch Gate" as the pre-push fast-fail. The section heading is renamed; no file or executable artifact is removed.

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.bkit/workflows.md` § "HEAD-Subject Assertion" (heading + framing) | § "CI-Dispatch Gate" (string clause retained inside) | RETAIN-WITH-REASON | The deny-list string clause is still the correct pre-push fast-fail; the gate wraps it with outcome verification. Renaming the heading + reframing is in-place doctrine evolution, not artifact removal. No external contract; no kill-date needed — single atomic edit in WS-5. |

> [!CAUTION]
> **Default = `DELETE`.** This plan adds without removing any file. The single `RETAIN-WITH-REASON` row is a documentation-section rename where the underlying assertion logic persists — there is no orphaned export, route, or trigger to delete.

## Security & Privacy

None — no new routes, DB writes, secrets, or user input. The only new external interactions are read-only `gh pr view --json statusCheckRollup` / `gh run list` polls and a clean empty `git commit --allow-empty` + push, all on the maintainer's own credentials within existing workflow scope. No PII; the `[bkit-ci-gate]` log lines carry only SHAs and outcome codes.

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core (always verify)

- [ ] **Package Management:** No new packages. Confirm `pnpm-lock.yaml` unchanged (authoring + one test file only).
- [ ] **Dependency Versions:** Confirm `vitest` (existing) runs the new `.bkit/src/*.test.ts`; spot-check `gh --version` available for live verification. No version bumps.
- [ ] **User Context:** Confirm read/write access to `.bkit/workflows/bkit-build.md`, `.bkit/workflows/bkit-debug.md`, `.bkit/workflows/bkit-ship.md`, `.bkit/workflows.md`, `docs/deployments.md`, `docs/knowledge.md`, `docs/decisions.md`, `.bkit/src/`, and the mirror dirs `.claude/` `.cursor/` `.opencode/`.
- [ ] **Pending Blockers:** Query tracker for open `blocker`-labelled issues touching the workflow CI-trigger contract. None expected.
- [ ] **Project Context:** Re-read KN-11 (`docs/knowledge.md`), KN-30 / §141 framing (D2 constraint), `docs/decisions.md` for any prior CI-trigger ADR. Confirm `bkit [auto route]` / `bkit [verbose ci]` marker semantics in `.bkit/workflows.md` § Marker Propagation.
- [ ] **Testing & Quality:** Confirm the WS-6 test follows the precedent in `.bkit/src/bkit-workflow-lock-snippet.test.ts` (read `.bkit/workflows/*.md`, extract shared lines, assert cross-file equality). Aligns with `docs/testing.md`.
- [ ] **Prerequisite Plans:** None. #209 (state model) is already shipped; this builds on its `step-done` record additively.

### Conditional (verify only when applicable)

- [ ] **Observability** _(new log points)_: New `[bkit-ci-gate]` log prefix on poll/verdict lines, and the `ciDispatch` NDJSON field. Confirm naming aligns with the existing `[bkit-build]` / `[bkit-ci-gate]`-style breadcrumb convention in the workflow files; record in `docs/deployments.md` § CI-Dispatch Gate (no `docs/observability.md` row needed — these are workflow stdout breadcrumbs, not app telemetry).

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

### Data Schema Usage (Inputs & Outputs)

None — no database. The only state surface is the per-FID `status.jsonl` NDJSON ledger (#209).

- **Input (Read):** the `step-done` record currently emitted at each gate site (`{type, workflow, step, status, at, parentSha, artifacts, ...}`).
- **Output (Write):** the same `step-done` record, with an **additive** `ciDispatch` object key.

### Data Schema Changes

`ciDispatch` field on the `step-done` NDJSON record (build-close-workflow, debug-close-workflow, debug-create-pr). Additive — backward-compatible with the #209 FOLD reducer (the reducer does `del(.type,.workflow)` then merges the remainder into the folded step entry, so unknown keys pass through untouched).

- **ADD:** `step-done.ciDispatch` (object): `{ outcome: "dispatched"|"self-healed"|"no-ci"|"unresolved", head: "<sha>", attempts: <int> }` plus optional `reason: "timeout-dirty"|"retrigger-suppressed"|"autoroute-mismatch"|"gh-error"` and `retrigger: true|false`.

## Architecture & Component Changes

**Authoring-only** change to `.bkit/workflows/*.md` (instructions, not executable code) + rationale docs + one bkit-repo consistency test + rendered host mirrors. No `packages/` or app code. File locations follow the existing bkit topology: workflow definitions in `.bkit/workflows/`, shared doctrine in `.bkit/workflows.md`, deployment rules in `docs/deployments.md`, knowledge ledger in `docs/knowledge.md`, ADRs in `docs/decisions.md`, repo-consistency tests in `.bkit/src/`, rendered mirrors in `.claude/` `.cursor/` `.opencode/`.

### Shared gate logic (the CI-Dispatch gate kernel — authored inline at each of the 2 sites)

> **Authoring constraints (apply to every workflow edit below):** instructions-only (no rationale in workflow files — rationale → `.bkit/workflows.md`); self-contained (NO cross-reference to `workflows.md` — inline the gate bash at each site); reuse the closest existing phrasing/formatting verbatim (`grep .bkit/workflows/` first — model on the existing close-workflow push block); deny-list markers (`bkit [auto route]` / `bkit [verbose ci]` / `bkit [force build]` must pass); Two-Layer Separation; status.jsonl ceremony preserved; NO per-edit `pnpm bkit install` (mirrors batched once in WS-7). Anchor every edit by section / sub-step / search pattern — NEVER by hard line number (build/debug are 1000+ lines and drift).

The gate is appended **immediately after the existing final-push line** (`B=$(git branch --show-current); case "$B" in dev|main) git push origin "$B" ;; *) git push --force-with-lease origin "$B" ;; esac`) **inside the same shell block** so the just-pushed HEAD and the `AUTO_ROUTE_SUFFIX` are still in scope. Canonical shared kernel (the SHARED sub-lines WS-6 will assert byte-equal across both sites):

```bash
# --- CI-Dispatch Gate shared kernel ---
POLL_BUDGET_S=60; POLL_INTERVAL_S=10            # ATTEMPTS = BUDGET / INTERVAL = 6
PUSHED_HEAD=$(git rev-parse HEAD)
CI_OUTCOME=""; CI_REASON=""; CI_RETRIGGER="false"; CI_ATTEMPTS=0; GH_ALL_ERRORED="true"
echo "[bkit-ci-gate] polling for bkit-decide run on $PUSHED_HEAD (budget ${POLL_BUDGET_S}s, interval ${POLL_INTERVAL_S}s)"
poll_decide() {                                  # echoes "found" / "none" / "err"; never set -e out
  local out rc
  out=$(gh pr view {PR_NUMBER} --json statusCheckRollup --jq \
    '[.statusCheckRollup[]? | select(.name // .context // "" | test("decide"; "i"))] | length' 2>/dev/null); rc=$?
  [ "$rc" -ne 0 ] && { echo "err"; return; }
  GH_ALL_ERRORED="false"
  [ "${out:-0}" -gt 0 ] 2>/dev/null && echo "found" || echo "none"
}
elapsed=0
while [ "$elapsed" -lt "$POLL_BUDGET_S" ]; do
  CI_ATTEMPTS=$((CI_ATTEMPTS+1)); R=$(poll_decide)
  echo "[bkit-ci-gate] attempt ${CI_ATTEMPTS}: $R (elapsed ${elapsed}s)"
  [ "$R" = "found" ] && { CI_OUTCOME="dispatched"; break; }
  sleep "$POLL_INTERVAL_S"; elapsed=$((elapsed+POLL_INTERVAL_S))
done
# --- end CI-Dispatch Gate shared kernel ---
```

The shared block is delimited by the comments `# --- CI-Dispatch Gate shared kernel ---` (start) and `# --- end CI-Dispatch Gate shared kernel ---` (end), which the builder MUST include verbatim at the start and end of the shared poll-loop block in WS-1 and WS-2. The WS-6 vitest file extracts lines between these delimiters in `bkit-build.md` and `bkit-debug.md` and asserts byte-equality on the extracted set.

Then the site-specific tail (self-heal + AUTO_ROUTE sourcing differs per site — NOT WS-6-asserted):

```bash
if [ -z "$CI_OUTCOME" ]; then
  if [ "$GH_ALL_ERRORED" = "true" ]; then
    CI_OUTCOME="unresolved"; CI_REASON="gh-error"
    echo "[bkit-ci-gate] unresolved(gh-error): every poll iteration errored — gh unavailable/unauthed"
  elif echo "$PUSHED_HEAD_MSG" | grep -iEq '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]'; then
    CI_OUTCOME="unresolved"; CI_REASON="timeout-dirty"
    echo "[bkit-ci-gate] unresolved(timeout-dirty): no run and pushed HEAD carries a suppressor — refusing to re-trigger a dirty HEAD"
  else
    # self-heal cap = 1: assert re-trigger suffix == close-workflow suffix, then clean empty re-trigger
    [ "$RETRIGGER_SUFFIX" = "$AUTO_ROUTE_SUFFIX" ] || { CI_OUTCOME="unresolved"; CI_REASON="autoroute-mismatch"; }
    if [ -z "$CI_OUTCOME" ]; then
      git commit --allow-empty -m "chore({FID}): re-trigger${RETRIGGER_SUFFIX}"; CI_RETRIGGER="true"
      B=$(git branch --show-current); case "$B" in dev|main) git push origin "$B" ;; *) git push --force-with-lease origin "$B" ;; esac
      PUSHED_HEAD=$(git rev-parse HEAD); elapsed=0
      echo "[bkit-ci-gate] re-trigger pushed ($PUSHED_HEAD); re-polling"
      while [ "$elapsed" -lt "$POLL_BUDGET_S" ]; do
        CI_ATTEMPTS=$((CI_ATTEMPTS+1)); R=$(poll_decide)
        echo "[bkit-ci-gate] attempt ${CI_ATTEMPTS}: $R (elapsed ${elapsed}s)"
        [ "$R" = "found" ] && { CI_OUTCOME="self-healed"; break; }
        sleep "$POLL_INTERVAL_S"; elapsed=$((elapsed+POLL_INTERVAL_S))
      done
      # After re-trigger push: re-assert the re-trigger HEAD is clean before concluding no-ci
      RETRIGGER_HEAD_MSG=$(git log -1 --pretty=%B)
      if echo "$RETRIGGER_HEAD_MSG" | grep -iEq '\[skip ci\]|\[ci skip\]|\[no ci\]|\[skip actions\]|\[actions skip\]'; then
        CI_OUTCOME="unresolved"; CI_REASON="retrigger-suppressed"
        echo "[bkit-ci-gate] unresolved(retrigger-suppressed): re-trigger HEAD itself carries a suppressor — cannot confirm no-ci vs. suppression"
      else
        [ -z "$CI_OUTCOME" ] && { CI_OUTCOME="no-ci"
          echo "[bkit-ci-gate] no-ci: clean re-trigger dispatched nothing — repo has no CI workflow for this event (logged pass)"; }
      fi
    fi
  fi
fi
echo "[bkit-ci-gate] verdict: ${CI_OUTCOME}${CI_REASON:+(${CI_REASON})} head=$PUSHED_HEAD attempts=$CI_ATTEMPTS retrigger=$CI_RETRIGGER"
# ciDispatch verdict is ALWAYS written onto the step-done record (additive field; see below).
case "$CI_OUTCOME" in unresolved) ;; esac   # unresolved → route to Failure Path per step instruction
```

The `ciDispatch` additive field is merged onto the step's existing `step-done` jq object, e.g.:

```bash
jq -nc --arg p "$PARENT_SHA" --arg t "$(date -u +%FT%TZ)" \
  --arg o "$CI_OUTCOME" --arg h "$PUSHED_HEAD" --argjson a "$CI_ATTEMPTS" \
  --arg r "$CI_REASON" --argjson rt "$CI_RETRIGGER" \
  '{type:"step-done", workflow:"build", step:"build-close-workflow", status:"DONE", at:$t, parentSha:$p, artifacts:[],
    ciDispatch: ({outcome:$o, head:$h, attempts:$a, retrigger:$rt} + (if $r=="" then {} else {reason:$r} end))}' \
  >> "$STATUS"
```

> **Terminal-verdict rule:** the gate ALWAYS writes a `ciDispatch` verdict before the step ends. `dispatched` / `self-healed` / `no-ci` → step proceeds normally. `unresolved` (any sub-reason) → the step routes to **Failure Path** after the verdict is recorded.

#### [MODIFY] `.bkit/workflows/bkit-build.md` — Step 18 (Close Workflow) — WS-1

- **Existence Check:** confirmed — Step 18 close-workflow push block exists (sub-step 2, the `B=$(git branch --show-current); case … esac` push line after the HEAD-Subject Assertion, with `AUTO_ROUTE_SUFFIX` already derived in-block from `LABELS`).
- Append the shared kernel + build self-heal tail **inside that same shell block, after the existing push line**. `PR_NUMBER` for the `gh pr view` poll: re-derive in-block via `gh pr list --head "$(git branch --show-current)" --base dev --json number --jq '.[0].number'` (build does not carry `PR_NUMBER` at Step 18 — it was set in Step 17 but the block is a fresh shell; re-derive, and if empty treat as `no-ci` path candidate via the re-trigger discriminator).
- **AUTO_ROUTE sourcing (build):** `RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"` — re-use the in-block `AUTO_ROUTE_SUFFIX` already derived from `LABELS` (assert-equal is trivially satisfied; the assert line stays for cross-site symmetry).
- Capture `PUSHED_HEAD_MSG=$(git log -1 --pretty=%B)` before the suppressor check.
- On `unresolved` → Failure Path. Update Gate 18 checklist: add `[ ] CI-Dispatch gate ran; ciDispatch verdict recorded on step-done (dispatched|self-healed|no-ci)`.

#### [MODIFY] `.bkit/workflows/bkit-debug.md` — Step 10 (Close Workflow) close + create-pr blocks — WS-2

> **Anchor note:** the design names this "debug Step 12"; the current file numbers it **Step 10 — Close Workflow** (the workflows.md doctrine table also still says "Step 12" — a stale label). Anchor by the headings **"## 🤖 Step 10 — Close Workflow"**, the close-workflow push block (sub-step 3, ending in the `B=$(git branch --show-current); case … esac` push), and the create-pr push block (sub-step 9). Do NOT trust the "Step 12" number.

- **Existence Check:** confirmed — Step 10 close-workflow push block (sub-step 3) and create-pr push block (sub-step 9) both exist; `BKIT_AUTO_ROUTE_FILE` is created in sub-step 3 and read+`rm`-ed in sub-step 9.
- **Two trigger surfaces per `PUSH_MODE`:**
  - **PR-mode** (`TRIGGER_PR=0`): the CI-triggering push is the close-workflow push (sub-step 3). Append the gate there. `PR_NUMBER` is in scope (set in Step 1 sub-step 6). `RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"` (the in-block close-workflow suffix).
  - **LOCAL-mode** (`TRIGGER_PR=1`): the CI-triggering push is the create-pr push (sub-step 9). Append the gate there, after the create-pr push line. **AUTO_ROUTE sourcing — reuse the in-block shell var, do NOT reorder the `rm`:** the live create-pr block already reads `BKIT_AUTO_ROUTE_FILE` into the in-block shell var `AUTO_ROUTE_SUFFIX` and then `rm`s the file BEFORE the create-pr commit + push; `AUTO_ROUTE_SUFFIX` stays in scope through the rest of the block (this is the SAME value used to build the create-pr commit suffix). The gate's re-trigger therefore sources `RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"` from that already-set var — **do NOT reorder or delay the `rm`**, do NOT re-read the (already-removed) file. (Moving the `rm` after a re-trigger push would widen the stale-temp-file window and risks an implementer leaving the gate reading a removed file → empty suffix → dropped `bkit [auto route]` marker on the re-trigger HEAD.)
  - **Assert-equal-before-push (symmetry backstop):** `[ "$RETRIGGER_SUFFIX" = "$AUTO_ROUTE_SUFFIX" ]` — trivially satisfied since both reference the same in-block var; mismatch → `unresolved(autoroute-mismatch)` → Failure Path.
- Capture `PUSHED_HEAD_MSG=$(git log -1 --pretty=%B)`. Note debug commits may legitimately carry `bkit [verbose ci]` and/or `bkit [auto route]` — both pass the suppressor grep (deny-list).
- The SHARED kernel sub-lines (poll loop, `POLL_BUDGET_S`/`POLL_INTERVAL_S`, `poll_decide`, `[bkit-ci-gate]` lines, verdict echo) MUST be byte-identical to build's (WS-6 enforces). Only the AUTO_ROUTE sourcing + the `workflow:"debug"`/`step:` strings in the jq differ.
- On `unresolved` → Failure Path. Update Gate 10/12 checklist: add `[ ] CI-Dispatch gate ran on the CI-triggering push (close-workflow PR-mode / create-pr LOCAL-mode); ciDispatch verdict recorded`.

#### [MODIFY] `.bkit/workflows/bkit-build.md` — inline Failure Path (EC-2 abort-guard) — WS-3

- **Existence Check:** confirmed — inline Failure Path sub-steps 8–10 (`git add -A` → `git commit -m "docs({FID}): build aborted bkit [skip build] bkit [skip ci]"` → assert `{BRANCH}` non-empty + push).
- Wrap the abort commit+push in a PR-existence conditional. Before the push: probe `gh pr list --head "$(git branch --show-current)" --base dev --json number --jq '.[0].number'`.
  - Open PR found (non-empty) → **do NOT push** the `[skip ci]` abort commit; log `[bkit-ci-gate] abort-guard: open PR on branch — preserving last validated remote HEAD (no push)`. Leave the local abort commit unpushed.
  - No open PR → plain abort commit + push as today.
  - **Probe failed (non-zero exit)** → **inverted safe default: treat as "PR exists, do NOT push"** (cost-asymmetry: pushing a `[skip ci]` HEAD onto a live PR is the exact harm; not-pushing on a no-PR branch is harmless). Log the probe failure with the `[bkit-ci-gate]` prefix.
- Reuse the closest existing phrasing for the branch/PR probe (model on debug Step 1 sub-step 6 / Step 10 sub-step 4 `gh pr list --head … --base dev`).

#### [MODIFY] `.bkit/workflows.md` — shared Failure Path (EC-2 abort-guard, shared site) — WS-3

- **Existence Check:** confirmed — § Failure Path step 5 (`git add -A` → commit `docs({FID}): {phase} aborted bkit [skip build] bkit [skip ci]` → push) lives in the **conditional-handover** block (runs on max-retry exhaustion with a worktree present). This is the shared doctrine that **debug relies on entirely** — debug has no separate inline Failure-Path abort push of its own (build does; that is guarded by WS-3a).
- Add the same PR-existence conditional + inverted-safe-default rule to the shared Failure Path step 5 instruction so debug's Failure Path inherits the guard. Keep it instructions-level (this file is doctrine, not inline bash) but state the inverted-default-on-probe-failure explicitly.
- **Scope clarification (EC-2 coverage):** the guard at step 5 fires for **any phase** (build/debug/design/plan) that reaches that step — so debug's abort onto a live PR via the shared Failure Path IS covered. Step 5 is the conditional-handover push only; if debug's **non-exhaustion** Failure-Path triggers never reach step 5, they are not the EC-2 symptom. If any such non-handover path DID push a `[skip ci]` HEAD onto a live PR, that is **pre-existing behaviour and NOT in scope for this PR** — this PR covers exactly the abort sites the design covers (build's inline Failure Path + the shared step-5 push). Do NOT widen the guard beyond step 5.

#### [MODIFY] `.bkit/workflows/bkit-build.md` — Step 17 entry (EC-1 pre-flight) — WS-4

- **Existence Check:** confirmed — Step 17 (Create PR) sub-step 1 (`git fetch origin dev`) precedes the blind `gh pr create --base dev` (sub-step 3).
- Insert a pre-flight probe at Step 17 entry, **before** `gh pr create`: `gh pr list --head "$(git branch --show-current)" --base dev --json number --jq '.[0].number'`.
  - Open PR found (non-empty) → **Failure Path** with a clear, named message, e.g. `EC-1: feat/{FID} already has open PR #N to dev — build re-run/resume cannot blind-create. Resume via /bkit-debug or close the stale PR.` Include a `# TODO(#261-ec1)` placeholder comment marking the future idempotent-resume design.
  - **Probe failed (non-zero exit)** → **fall through** to today's blind `gh pr create` (no regression — EC-1's safe default is the OPPOSITE of EC-2's; here a false-negative just lands on today's behaviour).
- Update Gate 17 checklist: add `[ ] EC-1 pre-flight ran (no pre-existing open PR, or probe fell through)`.

### Documentation & rationale (WS-5)

#### [MODIFY] `.bkit/workflows.md` — § "HEAD-Subject Assertion" → § "CI-Dispatch Gate"

- Rename the heading. Reframe the prose: the section now documents an **outcome-verification gate** (poll for `bkit-decide` dispatch on the pushed HEAD → self-heal once → typed verdict) of which the deny-list HEAD-subject string clause is the pre-push fast-fail. Document: 4 outcomes (`dispatched`/`self-healed`/`no-ci`/`unresolved`), sub-reason codes, named symbols (`POLL_BUDGET_S=60`/`POLL_INTERVAL_S=10`), `[bkit-ci-gate]` prefix, self-heal cap=1, `gh`-error retry-then-`unresolved`, the `ciDispatch` additive NDJSON field, and the per-site AUTO_ROUTE sourcing difference (build re-derives from `LABELS`; debug reads `BKIT_AUTO_ROUTE_FILE` before `rm`). State the 2-sites-not-3 scope and WHY ship is out (#81 Change C). Update the per-workflow mechanic table rows (build 18, debug 10/12). Update the § `bkit [auto route]` Marker Propagation note that the re-trigger commit carries the same marker treatment.

#### [MODIFY] `docs/deployments.md` — § "CI trigger on final workflow push" + KN-11 cross-ref

- Update § "CI trigger on final workflow push" to describe the outcome gate (not just the string assertion). Update the cross-reference from § "HEAD-Subject Assertion" to § "CI-Dispatch Gate". Add the `ciDispatch` verdict to the commit-tag / surface tables where relevant. Note the EC-1/EC-2 guards.

#### [MODIFY] `docs/knowledge.md` — KN-11

- Update KN-11's `Fix or rule` + `Related` to point at the new § "CI-Dispatch Gate" and note that the outcome gate (not just the string check) is now the enforcement mechanism. Do NOT renumber; append to the fix prose.

#### [MODIFY] `docs/decisions.md` — new DE entry

- Append one ADR: "CI-Dispatch Gate — outcome-based verification of the final loud push (4-outcome state machine; post-final-push only; 2 sites not 3; ship out to preserve #81 Change C)." Check the last DE number first; allocate the next. Record the rejected alternatives (3 sites; whole-gate byte-equality; PR-mode push for EC-1; PUSH_MODE no-op).

### Repo-consistency test (WS-6)

#### [NEW] `.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts`

- Modeled on `.bkit/src/bkit-workflow-lock-snippet.test.ts` (read `.bkit/workflows/*.md`, extract lines, assert). The vitest suite is run by the bkit-repo `bkit-tests` CI job — the gate that `bkit check` participates in. Assertions:
  1. `bkit-build.md` contains the CI-Dispatch gate shared kernel (named symbols `POLL_BUDGET_S=60` / `POLL_INTERVAL_S=10`, `[bkit-ci-gate]` prefix, all 4 outcome strings, `ciDispatch` field).
  2. `bkit-debug.md` contains the same shared kernel sub-lines.
  3. **Grep-equality:** the SHARED poll-loop + named-symbol sub-lines extracted from build == those extracted from debug (byte-equal on the shared subset ONLY — NOT whole-gate; AUTO_ROUTE sourcing lines are excluded from the comparison).
  4. `bkit-ship.md` contains NO `[bkit-ci-gate]` gate (only its pre-existing `SQUASH_SHA` / `gh run list` gate) — negative assertion.
  5. A fabricated `ciDispatch`-bearing `step-done` line folds cleanly through the #209 FOLD reducer (run the FOLD jq via `execFileSync("bash", …)` and assert the `ciDispatch` key survives on the folded step).
- Include a "guard against vacuous match" assertion (the extraction regex matched >0 lines) per the lock-snippet precedent.

### Mirror re-render (WS-7)

#### [MODIFY] `.claude/` `.cursor/` `.opencode/` rendered mirrors

- After ALL workflow + doc edits (WS-1..WS-5) land, run `pnpm bkit install` ONCE (batch — never per-edit) to re-render the host mirrors so `.claude/commands/`, `.cursor/`, `.opencode/` reflect the edited `.bkit/workflows/*.md`. Verify the rendered surfaces carry the gate. (Per project memory: host-render mirrors are force-overwritten and not drift-gated by `bkit check`; the render output is the truth.)

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `docs/knowledge.md` | KN-11 fix/Related updated to point at § "CI-Dispatch Gate"; note outcome gate is now the enforcement mechanism. No renumber. |
| `docs/decisions.md` | New DE: CI-Dispatch Gate (4-outcome; post-final-push; 2 sites; ship out). Allocate next DE number. |
| `docs/deployments.md` | § "CI trigger on final workflow push" reframed to outcome gate; cross-ref renamed; EC-1/EC-2 noted. |
| `.bkit/workflows.md` | § "HEAD-Subject Assertion" → § "CI-Dispatch Gate"; per-workflow mechanic table + Marker Propagation note updated; shared Failure Path EC-2 guard added. |

_All other template doc rows (architecture/data-schema/data-pipeline/testing/observability) have no change — removed._

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | No DB changes. |
| **Code** | `git revert {COMMIT}` of the squash merge | Authoring + one test + mirrors only; revert restores the prior HEAD-Subject Assertion exactly. |
| **Risk window** | None | No deploy / migration. Gate is opt-in per workflow run; worst case a buggy gate routes to Failure Path (loud), never silently green. |

_Code-only — `git revert` sufficient._

## Agent Execution Runbook

[Chronological, step-by-step checklist guiding implementation. **MANDATORY**]

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Create a tracker issue (label `blocker`) with context before stopping.
> **Step Isolation:** Do NOT jump ahead. Complete each task fully (including its verification and checking its box) before starting the next.
> **Dependency ordering (DAG):** WS-1 → WS-2 → WS-6; WS-3 and WS-4 are independent (no upstream prereqs); WS-1+WS-2+WS-3+WS-4+WS-5 → WS-7. Execute in the task order below, which respects the DAG.
> **Anchoring:** Every edit anchors by section heading / sub-step / search pattern — NEVER by hard line number. Build/debug are 1000+ lines and drift.
> **No per-edit install:** Do NOT run `pnpm bkit install` between edits; mirrors are batched in Task 11 (WS-7).

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable.

### WS-1 — CI-Dispatch gate kernel — build close-workflow site

- [ ] **Task 1 (WS-1):** In `.bkit/workflows/bkit-build.md`, anchor "## 🤖 Step 18 — Close Workflow" → the close-workflow push block (the `B=$(git branch --show-current); case … esac` push after the HEAD-Subject Assertion). Inside that same shell block, after the push line, append the shared CI-Dispatch gate kernel + build self-heal tail (re-derive `PR_NUMBER` via `gh pr list --head "$(git branch --show-current)" --base dev`; `RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"`; capture `PUSHED_HEAD_MSG`). Merge the `ciDispatch` additive field onto the `build-close-workflow` `step-done` jq. Route `unresolved` → Failure Path. Add the Gate 18 checklist line. Include the `# --- CI-Dispatch Gate shared kernel ---` / `# --- end CI-Dispatch Gate shared kernel ---` delimiter comments at the start and end of the shared poll-loop block so WS-6 can extract and compare them.
  - **`bkit-decide` probe shape + fuzzy directive (note):** the `bkit-decide` poll reads the `gh pr view --json statusCheckRollup` **check-run shape** and uses a **case-insensitive fuzzy match** — `jq '.statusCheckRollup[] | select(.name | test("decide"; "i"))'` (the kernel form is `select(.name // .context // "" | test("decide"; "i"))`). This is the SAME tolerance as ship's fuzzy `test("test"; "i")` pattern, chosen because `bkit-decide` could be consumer-renamed; an exact literal would turn a renamed decide job into a permanent self-heal → `no-ci`/`unresolved`. The `statusCheckRollup` probe (build/debug) and ship's `gh run list` probe expose **different JSON shapes and CANNOT share a jq filter verbatim** — build/debug use the rollup check-run shape; ship uses the `gh run list` workflow-run shape. Use the rollup shape here.
  - **Done when:** `grep -c 'bkit-ci-gate' .bkit/workflows/bkit-build.md` >= 1; `grep 'POLL_BUDGET_S=60' .bkit/workflows/bkit-build.md` and `grep 'POLL_INTERVAL_S=10'` both match; the `build-close-workflow` jq object contains `ciDispatch`; all 4 outcome strings (`dispatched`/`self-healed`/`no-ci`/`unresolved`) appear in the Step 18 block; the poll step explicitly uses the case-insensitive fuzzy `test("decide"; "i")` pattern (verify it is the fuzzy `test(…; "i")` form, NOT an exact literal name match); Gate 18 checklist has the new CI-Dispatch line.

### WS-2 — CI-Dispatch gate kernel — debug create-pr/close-workflow site (depends WS-1)

- [ ] **Task 2 (WS-2):** In `.bkit/workflows/bkit-debug.md`, anchor "## 🤖 Step 10 — Close Workflow" (NOT "Step 12" — stale label). Append the SAME shared kernel sub-lines as WS-1 at BOTH CI-triggering surfaces: PR-mode → the close-workflow push block (sub-step 3); LOCAL-mode → the create-pr push block (sub-step 9). **AUTO_ROUTE sourcing (reuse the in-block shell var — do NOT reorder the `rm`):** the live create-pr block already materialises the suffix into the in-block shell var `AUTO_ROUTE_SUFFIX` (read from `BKIT_AUTO_ROUTE_FILE`) BEFORE the `rm -f "$BKIT_AUTO_ROUTE_FILE"`, and that var stays in scope for the rest of the block (where the create-pr commit + push happen, and where the gate is appended). The gate's re-trigger must therefore **reuse `AUTO_ROUTE_SUFFIX` directly**: set `RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"` — **do NOT reorder or delay the `rm`**, and do NOT re-read the (already-removed) file. The PR-mode leg reuses its own in-block suffix var the same way. Assert-equal becomes a trivially-satisfied symmetry backstop: `[ "$RETRIGGER_SUFFIX" = "$AUTO_ROUTE_SUFFIX" ]` → mismatch → `unresolved(autoroute-mismatch)` (they should be identical since it is the same var). Merge `ciDispatch` onto `debug-close-workflow` and `debug-create-pr` `step-done` jq objects. Route `unresolved` → Failure Path. Add Gate checklist line. Include the `# --- CI-Dispatch Gate shared kernel ---` / `# --- end CI-Dispatch Gate shared kernel ---` delimiter comments at the start and end of the shared poll-loop block so WS-6 can extract and compare them.
  - **`bkit-decide` probe shape + fuzzy directive (note):** identical to WS-1 — the `bkit-decide` poll reads the `gh pr view --json statusCheckRollup` check-run shape with the case-insensitive fuzzy match `jq '.statusCheckRollup[] | select(.name | test("decide"; "i"))'` (kernel form `select(.name // .context // "" | test("decide"; "i"))`), the SAME tolerance as ship's fuzzy `test("test"; "i")` (decide could be consumer-renamed). Build/debug use the rollup check-run shape; ship's `gh run list` probe uses a different workflow-run shape and CANNOT share the jq filter verbatim. Reuse WS-1's byte-equal kernel form here.
  - **Done when:** `grep -c 'bkit-ci-gate' .bkit/workflows/bkit-debug.md` >= 1; `POLL_BUDGET_S=60` + `POLL_INTERVAL_S=10` present; both `debug-close-workflow` and `debug-create-pr` jq objects contain `ciDispatch`; the LOCAL-mode gate's `RETRIGGER_SUFFIX` is set from the in-block `AUTO_ROUTE_SUFFIX` shell var (verify `RETRIGGER_SUFFIX="$AUTO_ROUTE_SUFFIX"`), the `rm -f "$BKIT_AUTO_ROUTE_FILE"` is NOT moved after the gate (its position relative to the suffix re-materialisation is unchanged from the live file), and the gate does NOT re-read `BKIT_AUTO_ROUTE_FILE` after the `rm`; the poll step uses the fuzzy `test("decide"; "i")` pattern (NOT an exact literal); `autoroute-mismatch` reason string present; the PR-mode close-workflow gate re-derives `PR_NUMBER` inside the sub-step 3 bash block via `PR_NUMBER=$(gh pr list --head "$(git branch --show-current)" --base dev --json number --jq '.[0].number')` — same pattern as build's WS-1 re-derivation; verify `grep 'pr list.*--json number.*--jq.*\[0\]' .bkit/workflows/bkit-debug.md` matches >= 2 times (once for the existing `PUSH_MODE` probe in Step 1, once for the PR-mode gate re-derivation).

### WS-3 — EC-2 abort-guard (independent)

- [ ] **Task 3 (WS-3a):** In `.bkit/workflows/bkit-build.md` inline Failure Path (anchor sub-steps 8–10: `git commit -m "docs({FID}): build aborted bkit [skip build] bkit [skip ci]"` + the push line), wrap the push in a `gh pr list --head … --base dev` PR-existence conditional. Open PR → do NOT push (preserve remote HEAD, log via `[bkit-ci-gate]`). No PR → push as today. Probe failed → inverted safe default = treat as "PR exists, do NOT push."
  - **Done when:** the build inline Failure Path push line is guarded by a `gh pr list --head` probe; the open-PR and probe-failure branches both skip the push; `grep 'abort-guard' .bkit/workflows/bkit-build.md` matches; the no-PR branch still pushes; structural check: `grep -B10 'force-with-lease' .bkit/workflows/bkit-build.md | grep -c 'EXISTING_PR\|abort-guard'` returns >= 1 in the inline Failure Path context (confirms the push line is structurally guarded, not just that a comment mentions the guard).
- [ ] **Task 4 (WS-3b):** In `.bkit/workflows.md` § Failure Path step 5 (shared `docs({FID}): {phase} aborted … push` instruction, in the conditional-handover block), add the same PR-existence conditional + inverted-safe-default-on-probe-failure rule at doctrine level so debug's Failure Path inherits it.
  - **Debug abort-path scope (clarification):** debug has **no separate inline Failure-Path abort push of its own** the way build does (WS-3a) — the shared § Failure Path step 5 push IS the relevant abort site for debug. The guard added here fires for **any phase** (build/debug/design/plan) that reaches step 5, so debug inherits it by construction. Note explicitly: step 5 is the conditional-handover push (runs on max-retry exhaustion with a worktree present). If debug's **non-exhaustion** aborts (a Failure-Path trigger that never reaches step 5) do not push onto a live PR, they are not the EC-2 symptom and need no guard; if any such path DID push onto a live PR, that is **pre-existing behaviour and NOT in scope for this PR** (this PR covers exactly what the design covers — build's inline Failure Path + the shared step-5 push). Do NOT widen the guard beyond step 5.
  - **Done when:** `.bkit/workflows.md` § Failure Path step 5 states the open-PR-preserve-HEAD rule AND the inverted-safe-default-on-probe-failure rule explicitly; the guard is at step 5 (the shared conditional-handover push) so it covers all callers including debug; no new abort site outside step 5 / build's inline Failure Path is added.

### WS-4 — EC-1 pre-flight (independent)

- [ ] **Task 5 (WS-4):** In `.bkit/workflows/bkit-build.md` Step 17 (anchor "## 🤖 Step 17 — Create PR" → sub-step 1 `git fetch origin dev`, before the `gh pr create` in sub-step 3), insert a `gh pr list --head "$(git branch --show-current)" --base dev` pre-flight probe. Open PR → Failure Path with a named message + `# TODO(#261-ec1)` placeholder. Probe failed → fall through to blind create (no regression). Add the Gate 17 checklist line.
  - **Done when:** Step 17 contains a `gh pr list --head` probe BEFORE `gh pr create`; the open-PR branch routes to Failure Path with a named EC-1 message; `grep '# TODO(#261-ec1)' .bkit/workflows/bkit-build.md` matches; the probe-failure branch falls through to `gh pr create`; Gate 17 checklist has the EC-1 line.

### WS-5 — Doc & rationale (depends WS-1, WS-2, WS-3, WS-4)

- [ ] **Task 6 (WS-5a):** In `.bkit/workflows.md`, rename § "HEAD-Subject Assertion" → § "CI-Dispatch Gate"; reframe prose (4 outcomes, sub-reasons, named symbols, `[bkit-ci-gate]`, cap=1, gh-error retry, `ciDispatch` field, per-site AUTO_ROUTE difference, 2-sites-not-3 + why ship out). Update the per-workflow mechanic table (build 18, debug 10/12) and the `bkit [auto route]` Marker Propagation re-trigger note.
  - **Done when:** `grep '### CI-Dispatch Gate' .bkit/workflows.md` matches; `grep 'HEAD-Subject Assertion' .bkit/workflows.md` returns ONLY retained-clause references (no stale section heading); the section documents all 4 outcomes + sub-reason codes + `ciDispatch`; ship-out rationale (#81 Change C) stated.
- [ ] **Task 7 (WS-5b):** Update `docs/deployments.md` § "CI trigger on final workflow push" (outcome gate framing + cross-ref rename + EC-1/EC-2 note); update `docs/knowledge.md` KN-11 (fix/Related → § "CI-Dispatch Gate"); append a new DE in `docs/decisions.md` (check last DE number first).
  - **Done when:** `docs/deployments.md` references § "CI-Dispatch Gate" (not the old name); KN-11 `Related` updated; a new `## DE-N: CI-Dispatch Gate …` entry exists with the rejected-alternatives list.

### WS-6 — Grep-equality alignment check (depends WS-1, WS-2)

- [ ] **Task 8 (WS-6):** Create `.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts` modeled on `.bkit/src/bkit-workflow-lock-snippet.test.ts`. Assert: (a) build + debug each carry the shared kernel (named symbols, `[bkit-ci-gate]`, 4 outcomes, `ciDispatch`); (b) the SHARED poll-loop + named-symbol sub-lines are byte-equal across build/debug (NOT whole-gate — exclude AUTO_ROUTE sourcing lines); (c) ship carries NO `[bkit-ci-gate]` gate (negative); (d) a `ciDispatch`-bearing `step-done` folds cleanly through the #209 FOLD reducer — the round-trip test asserts `ciDispatch.outcome === 'dispatched'`, `ciDispatch.head === <input_sha>`, and `ciDispatch.attempts === 1` survive the FOLD reducer unchanged (full object values, not just key presence); (e) guard-against-vacuous-match.
  - **Done when:** `pnpm vitest run bkit-ci-dispatch-gate-alignment` passes; the byte-equality assertion fails if a shared sub-line is edited in only one of the two files (verify by a scratch edit-and-revert); the ship negative assertion present; the FOLD-reducer round-trip assertion present; **the new file is picked up by the `bkit-tests` CI job** — confirm it lives at `.bkit/src/*.test.ts` (matches the vitest `include` glob `.bkit/src/**/*.test.ts` in `vitest.config.ts`) and is therefore discovered by the bare `pnpm test` / `vitest run` the `bkit-tests` job invokes (verify the bare `pnpm test` run — no name filter — includes `bkit-ci-dispatch-gate-alignment` in its executed-test set, e.g. it appears in `pnpm test` output and increments the suite count); `grep -A2 'retrigger-suppressed' .bkit/workflows/bkit-build.md | grep -v 'unresolved'` must return 0 matches (confirms `retrigger-suppressed` sub-reason is only ever assigned to the `unresolved` outcome, never `no-ci`); `grep -c '# --- CI-Dispatch Gate shared kernel ---' .bkit/workflows/bkit-build.md` returns 1 and same for `bkit-debug.md`; the vitest extraction logic uses these delimiter comments as anchors and the extracted line count > 0 (vacuous-match guard).

### WS-7 — Mirror re-render (depends WS-1, WS-2, WS-3, WS-4, WS-5)

- [ ] **Task 9 (WS-7):** Run `pnpm bkit install` ONCE (batch — after ALL of WS-1..WS-5 land) to re-render `.claude/` `.cursor/` `.opencode/` mirrors from the edited `.bkit/workflows/*.md`. Confirm the rendered command/agent surfaces carry the CI-Dispatch gate.
  - **Done when:** `grep -rl 'bkit-ci-gate' .claude/ .cursor/ .opencode/` returns the rendered build + debug workflow surfaces; no per-edit install was run earlier (single batch); `git status` shows the mirror files updated.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Testing & Documentation`.

- [ ] **Gate 2 - Verified:** Every WS-1..WS-7 task above independently verified and checked off against its `Done when:`.

> [!IMPORTANT]
> **Testing Strategy (See `docs/testing.md`):** This change is authoring-only — its "tests" are (1) the WS-6 static/grep vitest in `.bkit/src/` (cross-file alignment + FOLD round-trip), and (2) the live boundary verification rows in Manual Verification (gate observes real `gh` dispatch — no mocks at the `gh`/Actions boundary). There is no app code to unit/integration test; the gate logic is agent-executed bash whose contract is pinned by the alignment test + live dogfood.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every static/grep row maps to an assertion in `.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts`; every live row maps to a Manual Verification step. Add assertions/steps if any row is uncovered.
- [ ] **Update existing tests:** Confirm no existing `.bkit/src/*workflow*` test now fails on the gate additions (e.g. lock-snippet, catalog-parity). Adjust if a shared-line count assertion is affected.
- [ ] **Write new tests:** WS-6 test authored and passing (Task 8).
- [ ] **Verify observability:** `[bkit-ci-gate]` log prefix present on every poll/verdict line; `ciDispatch` verdict always written (terminal). Recorded in `docs/deployments.md` § CI-Dispatch Gate.
- [ ] **Update documentation:** WS-5 docs landed (knowledge KN-11, decisions DE-N, deployments §, workflows.md §). Rewrite prose — no lazy bullet appends.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Verification Plan`.

- [ ] **Docs updated:** Every row in `Documentation Updates` completed. `.agents/docs.md` still accurate (no new doc files added that need indexing).
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified and checked off.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** Run `pnpm tsc --noEmit` (for the new `.bkit/src/*.test.ts`) + ESLint + `pnpm lint:prose` on edited `.md`. Confirm `.bkit/workflows/*.md` use ASCII operators (`!=` `>=` `<=`), never Unicode `≠ ≥ ≤` (project rule).
- [ ] **Render-sweep parity:** `pnpm bkit check` exits 0 on consumer-owned drift surfaces (host-render mirrors are not drift-gated — expected). Confirm no managed-block drift introduced outside the mirrors.
- [ ] **WS-6 alignment test (`.bkit/src/bkit-ci-dispatch-gate-alignment.test.ts`):** `pnpm vitest run bkit-ci-dispatch-gate-alignment` passes — including the build↔debug byte-equality and the ship negative assertion.
- [ ] **Run all tests:** `pnpm test` green (the full bkit-repo suite — confirm no existing workflow-shape test regressed by the gate additions).

> [!IMPORTANT]
> **No Architectural Downgrades**: If a test fails, NEVER hot-fix by weakening the alignment assertion. Fix the divergent workflow file so the shared sub-lines match. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified and checked off. Explicit proof (vitest output, `tsc` clean, `bkit check` exit code) gathered.

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Proactively use `gh` to verify CI/CD pipelines instead of asking the user to check dashboards. These steps observe the REAL `gh` / GitHub Actions boundary (no mocks).

- [ ] **Step 1 — happy path (`dispatched`):** Dogfood `/bkit-build` on a scratch issue. After the close-workflow push, confirm via `gh pr view {PR} --json statusCheckRollup` that a `bkit-decide` check appears, and `jq 'select(.type=="step-done" and .step=="build-close-workflow") | .ciDispatch' docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` shows `outcome="dispatched"`.
- [ ] **Step 2 — self-heal (`self-healed`):** Force a deterministic `[skip ci]` HEAD before the close-workflow push: amend the close-workflow commit to include `[skip ci]` in its subject (or push a test commit with `[skip ci]` in its subject immediately before the gate runs). The gate detects an empty rollup after the poll budget, self-heals once with a clean `re-trigger` commit (no `[skip ci]`), re-polls, and a run appears. Confirm the gate logs `[bkit-ci-gate]` poll exhaustion, pushes exactly ONE `re-trigger` commit, a run appears, and `ciDispatch.outcome="self-healed"`, `retrigger=true`.
- [ ] **Step 3 — no-ci (`no-ci`):** Verify `no-ci` against bkit's own degenerate CI setup (bkit's `ci.yml` is a stub that runs `bkit-decide` → `bkit-tests` → `bkit-check`). Temporarily set `POLL_BUDGET_S=20` and push to a branch where the event is not triggered — e.g. a non-PR push on a `feat/*` branch when `on.push` only covers `[dev, main]` — to confirm the discriminator logs `no CI workflow dispatched for this event (confirmed)` and records `ciDispatch=no-ci`. Confirm `ciDispatch.outcome="no-ci"` and a logged pass (NOT Failure Path).
- [ ] **Step 4 — EC-2 abort-guard:** Trigger a build abort (Failure Path) on a branch with an open PR. Confirm via `gh pr view {PR} --json headRefOid` that the remote HEAD did NOT advance to a new `[skip ci]` abort commit (last validated HEAD preserved). Repeat on a no-PR branch → confirm the abort commit IS pushed.
- [ ] **Step 5 — EC-1 pre-flight:** Re-run `/bkit-build` on a branch that already has an open PR. Confirm it fails fast at Step 17 with the named EC-1 message (not a blind `gh pr create` failure → retry → Failure Path chain).

<!-- bkit:end -->
