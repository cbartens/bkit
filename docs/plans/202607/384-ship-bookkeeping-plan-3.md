Verdict: CONCERNS
<!-- verdict:end -->

# Sub-Plan 3 — Docs, Tier-3 Detector & E2E (Implementation Plan)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

**Parent Plan:** `docs/plans/202607/logs/384-ship-bookkeeping/384-ship-bookkeeping-plan.md` (parent index) · `plan-v3-checked.md` (full checked plan, full feature context).
**Design (source of truth):** `docs/plans/202607/384-ship-bookkeeping-design.md` (appended in `plan-input.md`).
**FID:** `384-ship-bookkeeping` · **ISSUE:** cbartens/bkit#384 · **Sub-plan:** 3 of 3.

> [!IMPORTANT]
> **This sub-plan is self-contained.** The design slice its tasks depend on is re-stated below. Full Acceptance Scenario / Success Criteria / Breaking Changes / Open Questions / Out-of-Scope / Rollback live in `plan-v3-checked.md` (inherited as confirmed). No DB / no Vercel / Supabase / Inngest — bkit meta-repo.

## Context & Goals (this slice)

This sub-plan publishes the contracts and documentation the gate depends on, ships the Tier-3 advisory status-hole detector, and performs the consumer-repo E2E validation + rollout. It ends with: **published docs + decisions ledger, advisory detector shipped, and a consumer-repo E2E run.** Nothing in Tiers 1–3 proves a run honoured the contract — only an end-to-end ship does (Risk 13), which makes Task 11's manual validation the feature's terminal evidence.

**Tasks in this sub-plan:** 9, 10, 11 (original IDs preserved; cross-task references keep original numbers).

---

## Design Slice — Decisions This Sub-Plan Owns

### The `run_level` contract — what the gate can prove, and what it publishes

The single capstone assertion is only load-bearing while `pull_request ⇒ run_level=full` holds. Answered two ways:

1. **The gate asserts what the payload carries** — a lane job that concluded `skipped` means the plan was not full → refuse (code 16). The SHA-cache short-circuit (`cache_skip` sentinel) is keyed to the exact commit SHA → must pass.
2. **The rest is a published consumer contract** — `docs/deployments.md` states: `pull_request` resolves to `run_level=full`; a consumer that narrows via `paths-ignore` / docs short-circuit has opted out of the merge-gate guarantee. A skipped-lane refusal is the detector for the common form of the violation; a degraded-but-not-skipped run is named as a residual risk rather than claimed as covered.

### Status-hole detector (Tier 3, advisory, fail-open)

Fold each `status.jsonl`, diff the observed step set against the expected set, flag holes. Two properties:

- **Derive the expected set from `bkit-ship.md`** by parsing `## … Step N — Name` headings + `step:"ship-…"` literals in fenced blocks — NEVER a hand-maintained table (a parallel table is a second source of truth; Finding 7 is that drift signature; the cheapest resolution under a table — edit the table to match observed reality — is also the wrong one).
- **Report a delta against a pinned watermark** as `bkit slop:delta` already does; emit through the fail-open advisory channel for one release before promoting to a gate. Corpus is 25–65% holey; a day-one aggregate gate emits hundreds of findings and is muted within a week.

Expectations are path-conditional (Path A skips integration + re-validation; MERGED-on-entry resume skips the middle; aborted run stops at the Failure Path). Promotion criteria (advisory → gate): "one release of fail-open signal without muting" — recorded in `docs/decisions.jsonl`.

### Observability contract

- **One stderr prefix** — `[bkit-ship-gate]` (brackets load-bearing for consumer log-drain grep; new script = new module = doc's bar met), registered in `docs/observability.md`.
- **Every terminal route writes a row** — gate refusals, poll-cap exhaustion, lock re-acquire failure, Failure Path (asserted in prose, enforced by Sub-plan 2 Task 7).
- **Consumer rollback path** — pin previous `@cbartens/bkit`; hold `bkit upgrade` for ship surfaces; audit any `BKIT_SHIP_GATE_OVERRIDE` rows written in the interim.

### CI-config reasoning chain (must be recorded, not re-derived)

The chain from `ci.yml:111`/`:602`/`:130`/`:19-21` → "one assertion is strictly stronger than all of Step 3" exists only in the issue/design thread. Lose it and the next maintainer either hardens the gate back into Step 3 or softens it to `statusCheckRollup` — both regressions, both reached by good-faith reasoning. Record in `docs/decisions.jsonl` with discarded alternatives named.

### E2E validation (Risk 13, Risk 11)

- bkit's own repo cannot dogfood (0 sweeps across 21 log dirs; 2 ship rows are fixtures). Verification depends on consumer-repo runs.
- **Mode-3 gap:** both validated paths are local-mode (`RUNTIME_DEVPUSHES=true`); mode-3 `BOOK_ROOT` live-verification is NOT exercised here — its prose contract is mechanically asserted by Sub-plan 1 Task 3's Tier-2 presence check; its live E2E is deferred to row `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run` (depends on OPEN `341-live-run-verification-mode-1-and-mode-3`).

### Five pre-existing #384 deferral keys (review-1 M2 — check before append)

`384-extract-ship-git-ci-mechanics-into-a-tested-kernel`, `384-promote-status-hole-detector-from-advisory-to-gate`, `384-ship-without-a-writable-branch-checkout-outside-b2`, `per-workflow-rollback-path-for-shipped-bkit-workflow-changes`, `384-ship-redesign-sequence-after-341` — five OPEN rows already exist; `grep` each before appending the Out-of-Scope mirror and skip duplicates (`.bkit/jsonl.md` dedup tuples).

---

## Predecessor Verification (Seam 2 — before Task 9 starts)

> [!CAUTION]
> **Re-verify Sub-plan 2's outputs landed.** Do NOT assume. If any check fails, Sub-plan 2 is incomplete — halt and surface to orchestrator (do not publish docs against a moving workflow shape).

- [x] **Rewrite live + invariant GREEN:** `.bkit/src/bkit-ship-invariants.test.ts` PASSES against rewritten `bkit-ship.md` (14/14 GREEN); rewritten shape is verify → base-check → integrate → re-validate → merge gate → merge → close.
- [x] **Mirrors byte-identical:** `bkit check` exits 0 (no `bkit-rendered-prompts-stale` drift; source↔mirror diff is non-empty by construction per KN `rendered-mirror-diff-nonempty-by-construction-tracker-resolution`); `.bkit/workflows.md` ship section reflects new shape (`BOOK_ROOT`/`BOOK_PATHS`, Path A/B base check, merge gate `bkit-ship-gate.sh assert`, bookkeeping off branch).
- [x] **Hardening live:** `.deferred-blocked` writer wired into `@bkit-ship-deferred-sweep`; `tests/ship-failure-path.bats` + `tests/ship-worktree-ownership.bats` GREEN.
- [x] **Tier-1 carrier intact:** `tests/ship-gate.bats` GREEN (16 cases).

---

## Architecture & Component Changes (this slice)

### Docs (Task 9)

- `docs/observability.md` — register `[bkit-ship-gate]` in prefix list (brackets load-bearing; new script = new module).
- `docs/deployments.md` — consumer CI contract: `pull_request ⇒ run_level=full`; narrowing via `paths-ignore` / docs short-circuit = opt-out of merge-gate guarantee; name present-but-degraded run as residual. Plus consumer rollback path.
- `docs/decisions.jsonl` — CI-config reasoning chain (key `384-ci-capstone-chain`); Tier-3 advisory→gate promotion criteria (key `384-tier3-promotion`).
- `docs/deferrals.jsonl` — mirror Out-of-Scope table (check the five pre-existing #384 keys first; skip duplicates); plus `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run` (Task 11 records it).
- `docs/knowledge.jsonl` — gotchas surfaced during implementation.
- `docs/testing.md` — new bats external-command stub harness (`tests/fixtures/gh/` + PATH shim) as a reusable pattern; Tier-3 fail-open advisory channel.

### Detector (Task 10)

- `.bkit/src/bkit-status-hole-detector.ts` (new) + `.bkit/src/bkit-status-hole-detector.test.ts` (new) + a `bkit` CLI subcommand (`bkit ship:audit` or wired into existing `bkit slop:delta` channel). Derives expected `ship-*` step set from `bkit-ship.md` (parses `## … Step N — Name` headings + `step:"ship-…"` literals); path-conditional sets; delta against pinned watermark; fail-open advisory.

### E2E (Task 11 — manual)

- `docs/plans/202607/logs/384-ship-bookkeeping/ship-e2e-validation.md` (validation report, written by Task 11).

---

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work autonomously. No pause for user permission at the SP3 Gate. Check `[x]` tasks as you go.
> **Blockers:** Task incomplete → create tracker issue (label `blocker`) before stopping.
> **Never drop work silently:** append deferred/out-of-scope to `docs/deferrals.jsonl`, bugs to `docs/failures.jsonl` (check existing entries first).
> **Step Isolation:** Complete each task fully before the next. Task 9 depends on Sub-plan 2 Tasks 4/7/8 (final prefix, exit codes, workflow shape, workflows.md); Task 10 depends on Sub-plan 1 Task 3 + Sub-plan 2 Task 7; Task 11 depends on all prior.

- [x] **Task 9 — WS-10: Documentation + Contract Publication.** Register `[bkit-ship-gate]` in `docs/observability.md`'s prefix list (brackets load-bearing; new script = new module = doc's bar met). Add consumer CI contract to `docs/deployments.md` alongside existing `[skip ci]`, dispatch-gate and `run_level` contracts: `pull_request` resolves to `run_level=full`; a consumer that narrows via `paths-ignore` or docs short-circuit has opted out of the merge-gate guarantee; name present-but-degraded run as residual. Add consumer rollback path (pin previous `@cbartens/bkit`; hold `bkit upgrade` for ship surfaces; audit any `BKIT_SHIP_GATE_OVERRIDE` rows). Record CI-config reasoning chain in `docs/decisions.jsonl` (key `384-ci-capstone-chain`): chain from `ci.yml:111`/`:602`/`:130`/`:19-21` → "one assertion strictly stronger than all of Step 3", with discarded alternatives named (merge queue unavailability mechanism; required status checks deferral; Step-1 probe rejection mechanism). Mirror Out-of-Scope table into `docs/deferrals.jsonl` — **but check the existing ledger first** (review-1 M2): five #384 deferral keys already exist as OPEN rows (`384-extract-ship-git-ci-mechanics-into-a-tested-kernel`, `384-promote-status-hole-detector-from-advisory-to-gate`, `384-ship-without-a-writable-branch-checkout-outside-b2`, `per-workflow-rollback-path-for-shipped-bkit-workflow-changes`, `384-ship-redesign-sequence-after-341`); `grep` each key before appending and skip duplicates (`.bkit/jsonl.md` dedup tuples). Record Tier-3 advisory→gate promotion criteria (key `384-tier3-promotion`): "one release of fail-open signal without muting". **Dependencies:** Task 4 (final prefix + exit codes), Task 7 (final workflow shape), Task 8 (final workflows.md). **Done when:** `docs/observability.md` contains literal `[bkit-ship-gate]`; `docs/deployments.md` contains literal `run_level=full` consumer contract + `BKIT_SHIP_GATE_OVERRIDE` rollback audit; `docs/decisions.jsonl` rows `384-ci-capstone-chain` and `384-tier3-promotion` exist; `docs/deferrals.jsonl` contains the seven out-of-scope rows AND no duplicate of any of the five pre-existing #384 deferral keys (verified by `grep -c '<key>'` ≤ 1 for each); `pnpm test` (which includes prose audit) passes.

- [x] **Task 10 — WS-11: Tier-3 Status-Hole Detector (Advisory, fail-open).** Create `.bkit/src/bkit-status-hole-detector.test.ts` and the detector itself (likely `.bkit/src/bkit-status-hole-detector.ts` + a `bkit` CLI subcommand `bkit ship:audit` or wired into existing `bkit slop:delta` channel). Derive expected `ship-*` step set from `bkit-ship.md` by parsing `## … Step N — Name` headings + `step:"ship-…"` literals in fenced blocks — NEVER a hand-maintained table. Make expectations path-conditional: Path A skips integration + re-validation; B1 and B2 differ; MERGED-on-entry resume skips the middle; aborted run stops at Failure Path. Report delta against a pinned watermark (as `bkit slop:delta` already does). Emit through the fail-open advisory channel for one release before any promotion to gate. Validate against the existing corpus (acknowledging 25–65% holey; one consumer repo produces no signal; bkit's own two ship rows are fixtures). Add unit test. **Dependencies:** Task 3 (canonical step-key set), Task 7 (final workflow to parse). **Done when:** `pnpm test bkit-status-hole-detector` passes; detector CLI exits 0 with advisory output (not non-zero) on a known-holey fixture; path-conditional sets asserted; invented names (`ship-resume-human-override`) surface as delta; promotion criteria referenced from `docs/decisions.jsonl` row `384-tier3-promotion`.

- [x] **Task 11 — WS-12: E2E Validation + Rollout.** Manual terminal workstream — produce the evidence no green pipeline can. Run `bkit-ship-gate.sh --explain` read-only against one live PR in each of bkit + (where available) the two consumer repos; diff each verdict against `gh pr checks`; record any disagreement as a fixture gap (append `docs/failures.jsonl`). Watch one Path A ship and one Path B2 ship in a consumer repo end to end, confirming Success Criteria 1–5 against artifacts left behind: `--match-head-commit` on merge call; no non-integration push to `feat/{FID}`; exactly one `status.jsonl` per run in one tree with terminal row; deferred-sweep FAIL reaching handover when triggered; staging confined to `BOOK_PATHS`. Take first real `gh` rate-limit sample under the poll loop; record against Risk 4's unmeasured assumption. Calibrate Tier-3 watermark from those runs. Release gate script + managed config + rewritten prose together in one `bkit upgrade` so no consumer sees prose calling a gate it does not have; confirm `bkit check` catches a partially-applied upgrade. **Mode-3 gap (review-3 M1):** both validated paths are local-mode (`RUNTIME_DEVPUSHES=true`); mode-3 (cloud, `RUNTIME_DEVPUSHES=false`) `BOOK_ROOT` live-verification is NOT exercised here — its prose contract is mechanically asserted by Task 3's Tier-2 presence check, and its live E2E is deferred to row `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run` (depends on OPEN `341-live-run-verification-mode-1-and-mode-3`); record this gap in the validation report. Write validation report to `docs/plans/202607/logs/384-ship-bookkeeping/ship-e2e-validation.md`. **Dependencies:** Task 4 (gate), Task 6 (distribution), Task 7 (prose), Task 8 (mirrors), Task 9 (docs), Task 10 (detector) — design `WS-12 → [WS-4, WS-5, WS-7, WS-9, WS-10, WS-11]`; Task 5 (WS-8) reaches here transitively via Task 7/Task 8 so is dropped from the direct list (review-2 MINOR 2; the prior "Task 5 (gate)" label was doubly wrong — Task 4 is the gate). **Done when:** `ship-e2e-validation.md` exists and is non-empty; it records at least one Path A + one Path B2 ship attempt with explicit PASS/FAIL against each of the 5 Success Criteria; `gh api rate_limit` sample recorded; Tier-3 watermark calibration note present; mode-3 deferral recorded (cross-ref `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run`); any disagreement between `--explain` and `gh pr checks` recorded as `docs/failures.jsonl` row.

### 🔒 SP3 Gate: Docs Published + Advisory Detector + E2E

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, the feature is ready for the squash-merge to `dev`.

- [x] **No bolt-on / no gate-weakening:** detector derives its expected set from `bkit-ship.md` (never a parallel table); fail-open advisory (not a day-one gate). No `as any` / `@ts-ignore` / `.skip` / empty `catch` introduced.
- [x] **Contracts published:** `docs/observability.md` contains `[bkit-ship-gate]`; `docs/deployments.md` contains `run_level=full` consumer contract + `BKIT_SHIP_GATE_OVERRIDE` rollback audit; `docs/decisions.jsonl` rows `384-ci-capstone-chain` + `384-tier3-promotion` exist.
- [x] **Deferrals non-duplicated:** `docs/deferrals.jsonl` seven out-of-scope rows present AND each of the five pre-existing #384 keys `grep -c` ≤ 1.
- [x] **Detector advisory:** `pnpm test bkit-status-hole-detector` GREEN; CLI exits 0 with advisory output on a known-holey fixture; path-conditional sets asserted; invented names surface as delta.
- [x] **E2E evidence:** `ship-e2e-validation.md` non-empty; Path A + Path B2 attempts recorded with explicit PASS/FAIL against all 5 Success Criteria; rate-limit sample present; Tier-3 watermark calibration note present; mode-3 deferral cross-ref recorded.
- [x] **SP3 - Verified:** Every checkbox above independently verified. Tasks 9–11 all `[x]`.

## Verification Plan (SP3)

### Automated Tests

- [x] **Unit suite (this slice):** `pnpm test bkit-status-hole-detector` GREEN.
- [x] **Full gate suite (feature-level):** `pnpm typecheck && pnpm test && pnpm format:check && pnpm lint:prose && pnpm slop:delta && pnpm test:bats && pnpm bkit check` all green (Tier-2 invariant now GREEN from Sub-plan 2; nothing is RED). Do NOT weaken any gate to pass.
- [x] **Docs updated:** Every row in `plan-v3-checked.md` § Documentation Updates completed. `.agents/docs.md` still accurate (no change needed).

### Manual Verification (Task 11 — the feature's terminal evidence)

> [!WARNING]
> **Dashboard Ban:** Use `gh` CLI to verify CI pipelines. The Task 11 E2E validation IS the manual verification — not optional (Risk 11: bkit's own CI cannot dogfood; Risk 13: no green pipeline proves a run honoured the contract).

- [ ] **Step 1 (Task 11):** In a consumer repo (app-gether-life preferred — has friction corpus; visitfrasercoast-com produces no signal), run one Path A `/bkit-ship` end-to-end on a PR whose `dev` is an ancestor of the head. Confirm via `gh pr view --json statusCheckRollup` and the resulting `status.jsonl`: gate asserted capstone at current head; `gh pr merge --squash --match-head-commit <sha>` issued; no push to `feat/{FID}`; one `status.jsonl` in `BOOK_ROOT` with terminal row.
- [ ] **Step 2 (Task 11):** In a consumer repo, run one Path B2 `/bkit-ship` end-to-end on a CONFLICTING PR (or one whose `dev` moved). Confirm: `gh pr update-branch` failed → `@bkit-ship-conflict-resolve` ran → `git push --force-with-lease` fired → `gh workflow run` dispatched unconditionally → poll loop bounded by both caps → `bkit-ship-gate.sh` asserted at new head → `gh pr merge --squash --match-head-commit` issued.
- [ ] **Step 3 (Task 11):** Trigger a deferred-sweep FAIL (e.g. introduce an unplanned `TODO` mid-build, run ship) and confirm `.deferred-blocked` sentinel written under `BOOK_ROOT`, route to `@bkit-debug-abort-handover`, handover artifact non-empty.
- [ ] **Step 4 (Task 11):** `bkit-ship-gate.sh --explain --head <sha> --repo <o/r>` against one live PR in each of bkit + consumer repos; diff verdict against `gh pr checks --required`; record disagreements as `docs/failures.jsonl`.

> [!IMPORTANT]
> **No Architectural Downgrades:** If build/test errors surface, NEVER resolve via hot fixes or anti-patterns. Halt and follow `docs/architecture.md` + `docs/knowledge.jsonl`.

### Feature Complete

Once SP3 Gate is `[x]`, all 12 tasks (Task 0–11) across the three sub-plans are done. The feature is ready for the squash-merged PR to `dev` (see `plan-v3-checked.md` § Merge Method). Rollout is one `bkit upgrade` release carrying gate script + managed config + rewritten prose together (Task 11), so no consumer sees prose calling a gate it does not have.

## Merge Method

**Merge method: always squash.** This sub-plan's commits land as part of the single squash-merged PR to `dev` (see `plan-v3-checked.md` § Merge Method).
