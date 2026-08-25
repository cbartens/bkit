# Build Input — 384-ship-bookkeeping

**FID:** `384-ship-bookkeeping` · **ISSUE:** cbartens/bkit#384 · **TITLE:** Ship bookkeeping mutates validated PR head

---

## Session Prompt

Build Feature (Workflow 3/6) — orchestrator managing workflow with subagents. Scope: Build feature and raise PR for `dev`. Executing against 3 sub-plans (plan split). See `docs/plans/202607/384-ship-bookkeeping-plan.md` (parent index) and `docs/plans/202607/384-ship-bookkeeping-plan-{1,2,3}.md` (child sub-plans).

---

## Issue #384 — Description

**Title:** Ship bookkeeping mutates validated PR head

**Body:**

`.bkit/workflows/bkit-ship.md` never states whether `feat/{FID}` gets pushed during ship, while simultaneously gating on the PR head SHA being CI-validated. Those two facts are incompatible, and because the push contract is unwritten, each agent resolves it differently — and every resolution breaks a different gate.

- **Push** → head SHA moves → Step 3 (`:397`) and Step 6 (`:598`) find no CI run at the new head and refuse.
- **Don't push** → Step 4's conflict resolution, Step 8's source-file remediation, and all Steps 1–8 artifacts stay local while Step 6 squash-merges the _remote_ PR, and Step 12 force-removes the worktree.

Line `:32` permits `git push --force-with-lease` "as the Step 2 rebase companion", but no step ever issues a push. So the workflow's correctness depends on an unwritten convention.

### Findings

1. **Step 3 does not verify green.** Sets `REGRESSION_VERDICT=PASS`, fails only when no run exists at head. A PR whose CI is currently red passes Step 3.
2. **`.deferred-blocked` has no writer.** No step in `bkit-ship.md` creates it — only `rm -f` and read. Sweep FAIL falls through to STOP with no handover.
3. **Step 6 validates one SHA and merges another.** Checks CI at `PRE_HEAD`; may push worktree and runs `gh pr update-branch` unconditionally — both move the head — then merges.
4. **Failure Path writes status to the wrong tree.** Resolves `REPO_ROOT` via `--git-common-dir` (main checkout) and appends `workflow-failed` to the **dev** copy, while Steps 1–8 write to the **worktree** copy via `--show-toplevel`.
5. **Step 8's retry loop cannot apply its own fix.** Edits the worktree, then re-runs Step 6, which merges the remote PR. Without a push the loop re-merges identical remote content until `MAX_MERGE_ATTEMPT` exhausts.
6. **`git add -A` on a shared worktree.** Bookkeeping commits stage whatever build or debug left dirty. Under a frozen head those leftovers are destroyed by Step 12's `worktree remove --force`.
7. **Agents are inventing step names.** Counter-bus and fold helpers key on step names, so improvised names are invisible to routing and attempt counting.

### Agreed solution

Two explicit paths, keyed on `git merge-base --is-ancestor origin/dev origin/feat/{FID}`.

**Path A — dev has not moved.** CI from build or debug is green at the PR head. Resume the shared worktree **read-only**: no rebase, no bookkeeping commits, no push. Merge.

**Path B — dev has moved, integration required.**

- **B1, no textual conflict** — `gh pr update-branch` rebases server-side and moves the head. No worktree, no local rebase, no conflict subagent.
- **B2, textual conflict** — worktree + `@bkit-ship-conflict-resolve` + `git push --force-with-lease`.

**Re-validation is mandatory in B.** Wait for a run at the new head, and if none appears within a timeout, `gh workflow run ci.yml --ref feat/{FID}`, then assert the capstone.

**Both paths end at the same gate:** `bkit-tests-check` concluded `success` at the current PR head.

**Bookkeeping never rides the branch.** `status.jsonl` and ship artifacts go to the dev tree from Step 1; Step 13's single `[skip ci]` push carries them.

### Scope

**In:** `.bkit/workflows/bkit-ship.md`, the `.deferred-blocked` writer, the Failure Path status target, `.bkit/workflows.md` step table, and the rendered mirrors.

**Out:** design/plan/build/debug worktree conventions.

**Verification gap to close:** a check that folds each `status.jsonl` and flags runs whose step set has holes.

---

## Issue #384 — Comments (newest-first)

### Comment 24 (2026-07-28T12:52:24Z) — Build Step 1

```comment
## Build Workflow
### Step 1 — Start Workflow
[cbartens/bkit/tree/dev](https://github.com/cbartens/bkit/tree/dev)
```

### Comment 23 (2026-07-28T11:00:01Z) — Plan Close Workflow

Artifacts list + telemetry. Plan close: durationSeconds 51033 (14h11m), linesChanged 2441 (+932/-1509), filesChanged 53, taskCount 55, compliance 2 pass (100%), PLAN_ATTEMPT 1.

### Comment 22 (2026-07-28T10:52:57Z) — Plan Summary (Verdict: PASS)

Plan delivers gate-first restructure of `bkit-ship.md`. New shape: verify → base-check → integrate → re-validate → merge → close. Bookkeeping moved off branch via tiered carriers: tested `bkit-ship-gate.sh` (Tier 1), prose invariants enforced by vitest (Tier 2), advisory status-hole detector (Tier 3). Split into 3 sub-plans: SP1 (foundations, config, gh stub harness, tested gate, Tier-2 RED); SP2 (hardening, structural rewrite Tier-2 GREEN, mirrors); SP3 (docs, detector, E2E).

### Comment 21 (2026-07-28T10:46:35Z) — Plan Complexity Split (Verdict: PASS)

3-way lossless partition along dependency seams. Parent index + 3 child sub-plans.

### Comment 20 (2026-07-28T10:40:41Z) — Plan Complexity Check (Verdict: SPLIT)

~140K token estimate (1.6× the 85K single-session threshold). RED→GREEN Tier-2 invariant is the plan's central quality mechanism.

### Comment 19 (2026-07-28T10:37:57Z) — Plan Apply Scope (Verdict: PASS)

### Comment 18 (2026-07-28T10:33:57Z) — Plan Scope Check (Verdict: CONCERNS, Failures: 1)

### Comment 17 (2026-07-28T10:28:34Z) — Plan Apply Review (Verdict: PASS)

### Comment 16 (2026-07-28T10:19:08Z) — Plan Review (Verdict: FAIL, Failures: 6)

### Comment 15 (2026-07-28T06:58:28Z) — Plan Fetch Context

Related issues, deferrals, failures gathered.

### Comment 14 (2026-07-28T06:57:44Z) — Plan Generate

### Comment 13 (2026-07-28T06:47:24Z) — Plan Worktree Setup

### Comment 12 (2026-07-28T06:43:17Z) — Plan Step 1

### Comment 11 (2026-07-27T02:44:34Z) — Design Close Workflow

Telemetry: durationSeconds 38527 (10h42m), linesChanged 8428 (+7770/-658), filesChanged 154, compliance 2 pass (100%), DESIGN_ATTEMPT 1.

### Comment 10 (2026-07-27T02:42:09Z) — Design Summary (Verdict: PASS)

Design restructures `bkit-ship.md` into verify → base-check → integrate → re-validate → merge → close. Three tiered carriers: tested `bkit-ship-gate.sh` (Tier 1), prose invariants (Tier 2), advisory detector (Tier 3). Key conventions: `BOOK_ROOT`/`BOOK_PATHS`, outbox durability, push-timing invariant decoupled from #341's `CAN_PUSH_DEV`, `--match-head-commit` on every merge.

### Comment 9 (2026-07-27T02:40:10Z) — Design Organise (Verdict: CONCERNS)

### Comment 8 (2026-07-27T02:35:11Z) — Design Apply Review (Verdict: CONCERNS)

### Comment 7 (2026-07-27T02:26:38Z) — Design Review (Verdict: CONCERNS)

### Comment 6 (2026-07-27T02:18:04Z) — Design Generate

### Comment 5 (2026-07-27T02:09:15Z) — Design Brainstorm & Ideate

### Comment 4 (2026-07-27T02:02:30Z) — Design Worktree Setup

### Comment 3 (2026-07-27T02:02:06Z) — Design Step 1

### Comment 2 (2026-07-27T01:51:23Z) — Design readiness clarifications

Key gaps to absorb into design:

- **#341 / `RUNTIME_DEVPUSHES`**: "Bookkeeping to the dev tree from Step 1" is wrong for cloud runtimes. Rule: dev tree when `RUNTIME_DEVPUSHES = true`, else current branch.
- **Path B dispatch**: B2 needs **unconditional** `gh workflow run` after head moves, not timeout fallback. CONFLICTING PRs fire nothing by construction.
- **Path-scoped staging**: `docs/plans/{YYYYMM}/logs/{FID}/` plus explicitly named ledgers — never blanket `docs/` or `-A`.
- **Finding 2 (`.deferred-blocked`)**: independent of Path A/B rewrite.
- **Verification gap**: status.jsonl hole detector.

### Comment 1 (2026-07-26T23:11:17Z) — Additional evidence from consumer ledgers

Three mechanisms produce "no CI run at the PR head":

1. A CONFLICTING PR stops CI entirely (no merge ref to evaluate).
2. A skip-ci token buried in branch history poisons dispatch for every later push.
3. One unattributed instance.

**Path B cannot rely on the push firing CI.** Wait-then-dispatch is the only viable path in B2, dispatch must be unconditional.

**Head-SHA-keyed capstone assertion is load-bearing.** Any gate that reads "the PR's latest run" is satisfiable by a stale green.

**Docs-only push can cancel the run that proves the merge is safe** (`cancel-in-progress`). "Bookkeeping never moves the head" has a second justification.

**Path B is the common case** (doc-line collisions).

**Second Failure Path status-loss mechanism**: append happens BEFORE `git rebase --abort`, so on mid-rebase abort the append is discarded.

**Constraint**: ship bookkeeping relocation must come with path-scoped staging — never blanket `docs/` or `-A`.

---

## Plan (parent index)

See `docs/plans/202607/384-ship-bookkeeping-plan.md` (appended below) and child sub-plans `docs/plans/202607/384-ship-bookkeeping-plan-{1,2,3}.md`.

### Execution Order

1. **Sub-plan 1 — Foundations & Tier-1 Gate** (`plan-1.md`): Tasks 0, 1, 2, 3, 4 (~33K). Output: config keys, gh stub harness, Tier-2 invariant RED, tested gate (10 bats GREEN). SP1 Gate.
2. **Sub-plan 2 — Hardening, Rewrite & Mirrors** (`plan-2.md`): Tasks 5, 6, 7, 8 (~44K). Output: hardened Failure Path, structural rewrite (Tier-2 GREEN), byte-identical mirrors. SP2 Gate.
3. **Sub-plan 3 — Docs, Detector & E2E** (`plan-3.md`): Tasks 9, 10, 11 (~26K). Output: 6 docs, Tier-3 detector, consumer-repo E2E. SP3 Gate.

---

## Parent Plan Content (`384-ship-bookkeeping-plan.md`)

Verdict: PASS
<!-- verdict:end -->

# Ship Bookkeeping — Plan Complexity Split (v4 Parent Index)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. This is the **parent index**. The full feature context (Acceptance Scenario, Success Criteria, Breaking Changes, Open Questions, Architecture, Supersession Inventory, Rollback) lives in `plan-v3-checked.md` — read it ONCE.
> 2. Each child sub-plan (`384-ship-bookkeeping-plan-1.md`, `384-ship-bookkeeping-plan-2.md`, `384-ship-bookkeeping-plan-3.md`) is **self-contained**: it re-states the design slice it owns, carries its own task list, and ends with its own gate.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in each sub-plan. `[ ]` = NOT DONE.

**Parent Plan (checked):** `docs/plans/202607/logs/384-ship-bookkeeping/plan-v3-checked.md`
**Design (source of truth):** `docs/plans/202607/384-ship-bookkeeping-design.md` (appended in `plan-input.md`)
**FID:** `384-ship-bookkeeping` · **ISSUE:** cbartens/bkit#384

---

## Partition Rationale

The checked plan (`plan-v3-checked.md`, `Verdict: PASS`) holds 12 tasks (Task 0–11) and 4 gates across shell scripts, bats, vitest, a 1278-line structural rewrite, rendered mirrors, 6 docs, a new detector module, and consumer-repo E2E. The complexity check (`plan-complexity-check.md`, `Verdict: SPLIT`) estimates ~140K tokens end-to-end — ~1.6× the 85K single-session threshold. The RED→GREEN Tier-2 invariant is the plan's central quality mechanism and would be jeopardised by attempting the rewrite (Task 7) in the same session as 11 other tasks.

The split is **lossless** along clean, tested dependency seams. Each seam is a verifiable artifact the next sub-plan treats as a stable input:

- **Seam 1 (Sub-plan 1 → 2):** tested `bkit-ship-gate.sh` (10 bats cases pass) + the `BOOK_ROOT`/`BOOK_PATHS` contract published as a RED Tier-2 invariant test + config keys + stub harness. These are proven before any prose is touched.
- **Seam 2 (Sub-plan 2 → 3):** the rewritten `bkit-ship.md` (Tier-2 invariant test GREEN) + byte-identical rendered mirrors + re-sectioned `.bkit/workflows.md`. These are the final workflow shape the docs and detector parse.

The critical path holds across the seam: **tested gate (SP1) → RED→GREEN invariant + final workflow shape (SP2) → docs/detector/E2E against that shape (SP3).** No deviation from the complexity check's proposed 3-way partition.

---

## Sub-Plan Dependency Graph

```
                       ┌─────────────────────────────────────────────┐
                       │  Sub-plan 1 — Foundations & Tier-1 Gate      │
                       │  Tasks 0, 1, 2, 3, 4   (~33K est.)           │
                       │  In:  none                                  │
                       │  Out: config keys · gh stub harness ·        │
                       │       Tier-2 invariant RED · tested gate     │
                       │       (10 bats cases GREEN)                  │
                       └──────────────────────┬──────────────────────┘
                                              │ Seam 1
                                              ▼
                       ┌─────────────────────────────────────────────┐
                       │  Sub-plan 2 — Hardening, Rewrite & Mirrors   │
                       │  Tasks 5, 6, 7, 8       (~44K est.)          │
                       │  In:  tested gate (SP1 T4) · BOOK_ROOT       │
                       │       contract (SP1 T3) · config (SP1 T1)    │
                       │  Out: hardened Failure Path + Step 12 ·      │
                       │       structural rewrite (Tier-2 GREEN) ·    │
                       │       byte-identical mirrors + workflows.md  │
                       └──────────────────────┬──────────────────────┘
                                              │ Seam 2
                                              ▼
                       ┌─────────────────────────────────────────────┐
                       │  Sub-plan 3 — Docs, Detector & E2E           │
                       │  Tasks 9, 10, 11        (~26K est.)          │
                       │  In:  final workflow shape (SP2 T7) ·        │
                       │       mirrors (SP2 T8)                      │
                       │  Out: 6 docs + decisions ledger · Tier-3     │
                       │       advisory detector · consumer-repo E2E  │
                       └─────────────────────────────────────────────┘
```

**Seam contracts (hard):**

- Sub-plan 2's first task (Task 5) re-verifies Sub-plan 1's outputs landed: `bkit-ship-gate.sh` + `tests/ship-gate.bats` exist and `pnpm test:bats tests/ship-gate.bats` passes; `.bkit/src/bkit-ship-invariants.test.ts` exists and is RED against current `bkit-ship.md`.
- Sub-plan 3's first task (Task 9) re-verifies Sub-plan 2's outputs landed: `.bkit/src/bkit-ship-invariants.test.ts` is GREEN; `bkit check` reports no `bkit-rendered-prompts-stale` drift; `.bkit/workflows.md` ship section reflects new shape.

---

## Per-Sub-Plan Summary

<!-- prettier-ignore -->
| Sub-plan | File | Tasks | Est. tokens | Predecessor verification | Own gate |
| --- | --- | --- | --- | --- | --- |
| **1 — Foundations & Tier-1 Gate** | `384-ship-bookkeeping-plan-1.md` | 0, 1, 2, 3, 4 | ~33K | none (fresh start) | SP1 Gate (tested gate GREEN + invariant RED) |
| **2 — Hardening, Rewrite & Mirrors** | `384-ship-bookkeeping-plan-2.md` | 5, 6, 7, 8 | ~44K | SP1 gate + bats + RED invariant re-verified (Task 5 prelude) | SP2 Gate (invariant GREEN + mirrors byte-identical) |
| **3 — Docs, Detector & E2E** | `384-ship-bookkeeping-plan-3.md` | 9, 10, 11 | ~26K | SP2 mirrors + GREEN invariant re-verified (Task 9 prelude) | SP3 Gate (docs published + detector advisory + E2E report) |

### Lossless Coverage

- **Original tasks (plan-v3-checked):** Task 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 → **12 tasks**.
- **Across sub-plans:** SP1 = {0,1,2,3,4} · SP2 = {5,6,7,8} · SP3 = {9,10,11} → **12 tasks**. Each task appears in **exactly one** sub-plan; `Done when` entries copied verbatim.
- **Original gates (Gate 1–4):** Gate 1 (human-review prerequisites) is confirmed once at the feature level (`plan-v3-checked.md`) and inherited by every sub-plan. Gates 2–4 (code / testing / automated verification) are sliced per sub-plan. The full Gate 4 suite (`pnpm test && pnpm test:bats && pnpm bkit check`) is re-run at every sub-plan boundary.
- **Total est. tokens:** ~103K across 3 sessions (vs ~140K single-session) — every sub-plan < 85K.

---

## Preserved Corrections (plan-v3-checked)

Every correction from `plan-v3-checked.md` is carried into the relevant sub-plan verbatim. This section is the cross-check index:

- **Real post-#341 ship marker** (`bkit_runtime_row ship` / `RUNTIME_DEVPUSHES`) — **SP1, Task 0** Done-when.
- **gh PATH-shim reuse** (not "first-of-its-kind") — **SP1, Task 2** (extends `bkit-runtime.bats:44-58`) + **SP1 Gate** no-bolt-on box.
- **8-path frozen `BOOK_PATHS` allow-list** — **SP1, Task 3** positive-presence assertion.
- **Mode-3 deferral cross-reference** (`384-mode-3-bookkeeping-e2e-deferred-to-341-live-run`) — **SP3, Task 11** Mode-3 gap.
- **`bkit-dogfood-noop.integration.test.ts` ownership** (Task 6 sole owner; Tasks 1+4 use manual `diff`) — **SP1, Tasks 1 & 4** Done-when; **SP2, Task 6** sole ownership.
- **Path-scoped staging** (never `git add -A` / blanket `docs/`) — **SP1, Task 3**; enforced GREEN by **SP2, Task 7**.
- **`[skip ci]` hygiene** (single path-scoped close commit) — **SP2, Task 7** Steps 7+.
- **`CAN_PUSH_DEV`/`RUNTIME_DEVPUSHES`-conditional `BOOK_ROOT`** (explicit Step-1 bullet) — **SP2, Task 7** (review-1 m4).
- **Timeout literals sourced from `bkit-ship-timeouts.sh`** (no third source of truth) — **SP2, Task 7** Step 5 (review-3 m2).
- **Preserve Task 5's Failure Path block in the rewrite** (review-2 MINOR 4) — **SP2, Task 7**.
- **Task 8 must not drop Task 5's `.deferred-blocked` writer wire-in** (scope-check-1 MINOR-2) — **SP2, Task 8**.

---

## Execution Order

1. **Execute `384-ship-bookkeeping-plan-1.md`** end-to-end (Tasks 0 → 4). Land SP1 Gate: tested gate GREEN, Tier-2 invariant RED.
2. **Execute `384-ship-bookkeeping-plan-2.md`** (Tasks 5 → 8), starting with the SP1-seam verification prelude. Land SP2 Gate: invariant GREEN, mirrors byte-identical.
3. **Execute `384-ship-bookkeeping-plan-3.md`** (Tasks 9 → 11), starting with the SP2-seam verification prelude. Land SP3 Gate: docs published, detector advisory, E2E report written.

Each sub-plan is independently buildable + verifiable against its own gate. Merge is one squash-merged PR to `dev` per the workflow's hard rule.
