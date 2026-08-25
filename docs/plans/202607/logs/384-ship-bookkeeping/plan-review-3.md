Verdict: CONCERNS
Failures: 2
<!-- verdict:end -->

# Plan Review — Lens 3: Regression Risk, Testability, Scope Discipline

**Plan under review:** `docs/plans/202607/logs/384-ship-bookkeeping/plan-v1-draft.md`
**FID:** `384-ship-bookkeeping` · **Issue:** cbartens/bkit#384
**Design:** `docs/plans/202607/384-ship-bookkeeping-design.md` (appended to `plan-input.md`)

## Surface-Area Map

### High-risk surfaces touched

<!-- prettier-ignore -->
| Surface | Change | Consumers / blast radius |
| --- | --- | --- |
| `.bkit/scripts/bkit-ship-gate.sh` + `.bkit/templates/.bkit/scripts/bkit-ship-gate.sh` (NEW, byte-identical pair) | Tier-1 force-overwritten on `bkit upgrade` | Every ship run; failure is **unrecoverable** (untested head squashed to `dev`). Consumers receive via `bkit upgrade` with no per-workflow revert. |
| `.bkit/workflows/bkit-ship.md` (MODIFY, structural rewrite; plan states 1244 lines, actual 1278 — cosmetic) | 13-step skeleton → verify → base-check → integrate → re-validate → merge gate → merge → close | Propagates to 4 rendered command surfaces via `bkit install`: `.claude/commands/bkit-ship.md` (byte-identical), `.cursor/commands/bkit-ship.md` (transformed), `.opencode/commands/bkit-ship.md`, templates-content snapshot. Every ship run depends on it. |
| `.bkit/scripts/bkit-protect-main.sh` + template pair (MODIFY) | Line 38 literal `REQUIRED_JOB="bkit-tests-check"` → `jq` read of `bkit.capstoneJob` | Existing call site, behaviour-preserving for default config. `jq` already a declared dependency (`Requires: gh, jq`), so no new dep introduced. |
| `.bkit/scripts/bkit-ship-timeouts.sh` + template pair (NEW) | Managed config (CI-wait timeout, poll interval, dev-lock staleness, acquire deadline, `MAX_MERGE_ATTEMPT`) | Sourced by rewritten `bkit-ship.md` prose (Task 7). Tier-1 force-overwritten. |
| `.husky/pre-push` (MODIFY) | Task 2 wires `pnpm test:bats` after the `pnpm bkit check` line | Every push from bkit's own repo; consumer `.husky/pre-push` is seed-or-print (bkit-owned pre-push is repo-local, not consumer-shipped for this change). |
| `package.json` (MODIFY) | Adds `bkit.capstoneJob`, `bkit.ciWorkflow` (consumer-tunable; survive `stripManagedKeys`) | bkit's own worked example; consumers may override. |
| Canonical 14 `ship-*` step keys (frozen schema) | Published as stable vocabulary; numbers may move, keys may not | `counter_next`/`counter_current`, fold reducer, Resume (`bkit-ship.md:25`), lock-staleness cross-check (`:27`), every historical consumer row keys on names. Renaming resets attempt counters across 3 repos. |

### New tests / fixtures

- `tests/ship-gate.bats`, `tests/ship-failure-path.bats`, `tests/ship-worktree-ownership.bats` (NEW) — run via `pnpm test:bats` (CI glob `ci.yml:502`, plus new pre-push wiring in Task 2).
- `tests/fixtures/gh/` corpus + PATH-shimmed `gh` stub (NEW) — **first-of-its-kind** in this repo (verified: no existing bats file stubs an external command; `tests/fixtures/` holds scaffold dirs only). Stated as reusable for future shell-tier gates.
- `.bkit/src/bkit-ship-invariants.test.ts` (NEW, Tier-2) — RED before prose rewrite (Task 3), GREEN after (Task 7).
- `.bkit/src/bkit-config-keys.test.ts` (NEW).
- `.bkit/src/bkit-status-hole-detector.test.ts` + detector (NEW, Tier-3, fail-open advisory).

### Backwards-compat boundary

- Consumers receive `bkit-ship-gate.sh` on next `bkit upgrade` (Tier-1 force-overwrite). Rollback path documented (Task 9 → `docs/deployments.md`): pin previous `@cbartens/bkit`, hold upgrade for ship surfaces, audit `BKIT_SHIP_GATE_OVERRIDE` rows.
- `bkit-ship.md` rewrite propagates to all 4 command surfaces; Task 8 regenerates via `bkit install` in one pass, Task 6 enforces byte-identity for the gate pair.
- Canonical step keys frozen; renaming resets counters in-flight across 3 repos (bkit + 2 consumers). Task 3 publishes the canonical set; Task 10 detector surfaces invented names as delta.
- No DB, no API routes, no secrets, no user input. `bkit.capstoneJob` / `bkit.ciWorkflow` are `package.json` keys, not secrets.

### Regression detection (multi-tier)

- **Tier 1 (gate):** `tests/ship-gate.bats` against 7 captured `gh` fixtures + API-error fixture → exit codes 0/10/11/12/13/14/15/16/20. Proves fixtures map to exit codes BEFORE any prose is touched (Task 4 done-when).
- **Tier 2 (prose invariants):** `bkit-ship-invariants.test.ts` RED on current `bkit-ship.md`, GREEN after rewrite — direct antidote to `01f8b8d9` (worktree model + head-match gate landed together, neither reviewed against the other).
- **Tier 3 (advisory detector):** `bkit-status-hole-detector` over `status.jsonl` corpus; fail-open for one release.
- **E2E (manual, Task 11):** Path A + Path B2 in consumer repos against all 5 Success Criteria.
- **Existing bats suite:** `pnpm test:bats` runs all 7 existing bats files (`counter-bus`, `counter-derive`, `counter-failclosed`, `route-state`, `telemetry-failopen`, `bkit-runtime`, `cloud-bootstrap-preflight`) — regression detection for downstream scripts (`bkit-status-fold.sh`, `bkit-counter-bus.sh`, `bkit-status-route.sh`) that key on step names.
- **Rollback:** explicit `Rollback Strategy` table (code gate+mirrors / code prose / consumer / config keys / risk window).

### Findings coverage (all 7 issue findings have a regression test)

<!-- prettier-ignore -->
| Finding | Regression coverage |
| --- | --- |
| F1 (Step 3 doesn't verify green) | Replaced by gate assertion; `ship-gate.bats` |
| F2 (`.deferred-blocked` no writer) | Task 5 writer + Task 3 invariant + Manual Step 3 trigger |
| F3 (Step 6 validates one SHA, merges another) | `--match-head-commit` invariant (Task 3); Task 11 Manual Step 1/2 |
| F4 (Failure Path wrong tree) | `ship-failure-path.bats` (BOOK_ROOT honoured; append after abort) |
| F5 (Step 8 retry loop) | Deleted; routing to build. No direct test (deletion is the fix). |
| F6 (`git add -A`) | Tier-2 invariant (no `git add -A`; no `git add -- docs/`) — **see MAJOR 2** for allow-list gap |
| F7 (invented step names) | Task 10 detector surfaces delta against pinned watermark |

## CRITICAL

None. No backwards-compat break without a shim, no missing migration ordering (N/A — no DB), no design-coverage gap for an in-scope touched surface, no re-entry into a known-broken pattern. Fix-code-never-gate is explicitly prohibited (Architecture & Component Changes CRITICAL note + Gate 2 checkbox: "No `as any` / `as unknown as` / `@ts-ignore` / `.skip` / empty `catch` / error-swallowing introduced to make any gate pass — the gate is the gate."). `[skip ci]` hygiene is preserved at runtime (post-merge docs-only flush to `dev`, never on `feat/{FID}`; existing `.husky/pre-push` mechanically blocks `[skip ci]` on feat-branch head when a PR is open). Path-scoped staging is named (`BOOK_PATH`) and Tier-2-enforced — **see MAJOR 2 for the literal-contents gap**.

## MAJOR

### M1 — Mode-3 (`RUNTIME_DEVPUSHES=false` / cloud) `BOOK_ROOT` path has zero verification coverage

**Where:** Task 11 (E2E Validation) Manual Verification Steps 1–4 (lines 524–527); Task 3 Tier-2 invariant cases (line 338).

**Problem:** The design defines `BOOK_ROOT` runtime-conditionally (two rows): `CAN_PUSH_DEV=true` (worktree present, modes 1–2) → main checkout / dev tree; `CAN_PUSH_DEV=false` (mode 3, unknown) → current working branch (adopt tree), bookkeeping lands with the phase-close PR per #341 shape A. The plan's Concrete Example (line 66) handles only the `true` case; Edge Cases (line 84) acknowledges mode 3 in prose; **Task 11 validates only Path A + Path B2 in consumer repos — both local-mode (`RUNTIME_DEVPUSHES=true`) scenarios**. Manual Steps 1–4 (lines 524–527) never run a mode-3 cloud session. Task 3's Tier-2 invariant asserts "every `status.jsonl` write resolves via `BOOK_ROOT`" — path-agnostic; it does not assert that `BOOK_ROOT` resolution honours `CAN_PUSH_DEV` / `RUNTIME_DEVPUSHES`. So the mode-3 path is asserted in prose only — exactly the defect class that produced this issue (load-bearing rule in prose, no gate).

**Why it matters:** Success Criterion 2 (push-timing invariant: no ship bookkeeping commit reaches `origin/feat/{FID}` before merge) is the load-bearing difference in mode 3 — `BOOK_ROOT` flips to the adopt tree and the flush rides the phase-close PR instead of a direct dev push. An unwritten or wrong conditional there silently re-opens the misattribution window that `ship-step10-blanket-git-add-docs-sweeps-concurrent-sessions` is about. The existing deferral `341-live-run-verification-mode-1-and-mode-3` (OPEN, MEDIUM) confirms mode 3 has not been exercised for #341 either, so the dependency is itself unverified.

**Fix (pick one):**

1. Add Task 11 Manual Step 5: run one phase close from a claude.ai cloud session (mode 3, `CLAUDE_CODE_REMOTE=true`) and confirm `BOOK_ROOT` resolves to the adopt tree and bookkeeping rides the phase-close PR with no `feat/{FID}` push; OR
2. Append a `docs/deferrals.jsonl` row `384-mode-3-bookkeeping-e2e-deferred-to-341-live-run` explicitly stating mode-3 BOOK_ROOT verification depends on `341-live-run-verification-mode-1-and-mode-3`; OR
3. Extend Task 3's Tier-2 invariant to assert that `bkit-ship.md` carries the `CAN_PUSH_DEV`-conditional `BOOK_ROOT` resolution text (presence check, matching the existing Tier-2 rigour).

**Severity:** MAJOR — design-coverage gap on a Success-Criterion-critical surface that the plan leaves unverified by any tier.

### M2 — `BOOK_PATHS` literal allow-list contents not pinned in plan or Tier-2 test

**Where:** Task 3 cases (line 338), Task 7 contract (line 459), Success Criterion 5 (line 48), Breaking Changes & Naming Review (line 130).

**Problem:** The design pins `BOOK_PATHS` to 8 literal paths — `docs/plans/{YYYYMM}/logs/{FID}/`, `docs/completed.md`, `docs/deferrals.jsonl`, `docs/failures.jsonl`, `docs/knowledge.jsonl`, `docs/decisions.jsonl`, `.bkit/friction.jsonl`, `.agents/skills`, `skills-lock.json` (verified in `design-v3-organised.md:131-135`, `plan-input.md:423-427`, `design-v1-draft.md:107-113`). The plan only ever refers to `BOOK_PATHS` abstractly — "the literal allow-list" (line 130), "+ named ledgers" (line 48), "path-scoped to `BOOK_PATHS`" (line 459). The Tier-2 invariant cases assert **negatives only** (no `git add -A`; no blanket `git add -- docs/`) — they never assert the **positive presence** of the 8 paths. Success Criterion 5 requires staging scope "verified mechanically rather than by review" — a purely-negative test catches blanket staging but does not catch "implementer staged the wrong allow-list" (e.g. omitted `.bkit/friction.jsonl`, included an extra path, or used a stale list).

**Why it matters:** This is the direct mitigation for `ship-step10-blanket-git-add-docs-sweeps-concurrent-sessions` (concurrent `bkit-plan` 837 had staged another FID's files; a blanket `git add -- docs/` would have misattributed them). The defect class is "staged a path outside the intended allow-list" — a positive-presence test is what catches that; the negative-only test catches only the most-violent form. Relocating ship bookkeeping onto `dev` _increases_ exposure to this race (design D25), so the mechanical guarantee is load-bearing, not decorative.

**Fix:** Pin the 8 paths as a frozen list in Task 3's `.bkit/src/bkit-ship-invariants.test.ts` (alongside the canonical 14 step-key set) and add a case asserting every `git add` in `bkit-ship.md` resolves via `BOOK_PATHS` and that `BOOK_PATHS` is defined exactly as the 8 paths (or cite the design block verbatim in Task 7's contract so the implementing agent does not drift). Either satisfies SC 5's "verified mechanically".

**Severity:** MAJOR — Success Criterion 5's "verified mechanically" is unsatisfiable as written; the regression vector the deferral is about is only partially closed.

## MINOR

### m1 — Task 5 dependency wording references wrong task for `BOOK_ROOT`

Task 5 Dependencies (line 455): `"Task 4 (gate, per design ordering), Task 6 contract (BOOK_ROOT — refer to Task 3's published name even though the prose rewrite is Task 7)"`. Task 6 is "Gate Distribution / Dogfood Mirroring" — not the `BOOK_ROOT` publisher. `BOOK_ROOT` is published by Task 3 (the Tier-2 invariant test). The parenthetical recovers the intent ("refer to Task 3's published name"), but the leading "Task 6 contract" is misleading. Recommend rewriting to `"Task 4 (gate, per design ordering); reads BOOK_ROOT from Task 3's published contract (the prose rewrite in Task 7 consumes the same name)."` Agent can recover from context, but plan-verify reads Done-when lines literally.

### m2 — No assertion that `bkit-ship-timeouts.sh` values propagate to prose (third-source-of-truth drift)

Task 1 creates `.bkit/scripts/bkit-ship-timeouts.sh` with `SHIP_CI_WAIT_TIMEOUT_S=1800`, `SHIP_POLL_INTERVAL_S=30`, `SHIP_DEV_LOCK_STALE_S=900`, `SHIP_DEV_LOCK_ACQUIRE_DEADLINE_S=600`, `MAX_MERGE_ATTEMPT=3`. Task 7's prose uses "attempt cap AND elapsed cap" / "dev-lock windowing". No test asserts the prose sources these from the `SHIP_*` variables rather than re-hardcoding the literals (e.g. `1800` inline). If the agent hardcodes, three sources of truth drift (script, prose, invariant). Tier-2 invariant could assert "no bare numeric timeout literal in `bkit-ship.md` outside the `SHIP_*` sourcing line".

### m3 — PR #720 fixture capture depends on a live consumer-repo PR

Task 2 captures the "PR #720 `total_count 0` (CONFLICTING)" fixture from real `gh` output in app-gether-life. PR #720 may have been closed/deleted by the time implementation runs. The plan hedges with "where available" (line 449) but does not specify a synthetic fallback matching PR #720's `total_count 0` shape. If unavailable, code 10 (no run) vs code 20 (API error) distinction loses its decisive fixture. Recommend: "if PR #720 is unavailable, capture the equivalent shape from any CONFLICTING PR with zero runs, or commit a synthetic JSON matching the observed fields".

### m4 — `bkit-ship.md` line count drift (cosmetic)

Plan line 354 states `bkit-ship.md` is "1244 lines, post-#341"; actual is 1278 lines today. Cosmetic; Task 0's mechanical check (`bkit_close_guard_checkout` marker present in Step 9) is what actually verifies the post-#341 baseline. Recommend updating the line count to avoid a plan-verify false-positive on a literal grep.

### m5 — Task 2 GO/NO-GO scope-reduction escape hatch is appropriate but blunt

Task 2 (line 449) defines a GO/NO-GO cost hinge: if the `gh` stub cannot be settled in ~half a day / 8 turns, STOP, append `docs/deferrals.jsonl` row `384-gh-stub-cost-hinge`, surface to orchestrator for tiering revisit. This is the design's single cost hinge and the handling is correct. Worth noting for the orchestrator: NO-GO means SC 1's primary carrier (Tier-1 merge gate) is removed from scope — SC 1 would then rest on Tier-2 prose invariants only, which the design explicitly says is insufficient (Risk 9: "a prose-invariant test verifies presence, not consumption"). NO-GO is therefore a plan-halting decision, not a Task-2-only skip — the plan should state that explicitly so a downstream agent does not interpret "tiering revisit" as "continue with Tasks 3–11 without the gate".

## OUT OF SCOPE

- **Mode-3 cloud E2E for the FULL ship shape (not just BOOK_ROOT)** — broader than M1; the design's mode-3 contract rides #341's adopt-tree path, so full mode-3 ship validation belongs with `341-live-run-verification-mode-1-and-mode-3` (already OPEN). M1's deferral option captures the BOOK_ROOT-specific slice.
- **Consumer-side bats re-verification after `bkit upgrade`** — consumers receive `bkit-ship-gate.sh` via force-overwrite but their (seeded) `.husky/pre-push` does not run `pnpm test:bats` (and they have no `tests/` dir). This is an inherent asymmetry of the install-engine model: bkit's CI proves the released script; consumers trust the release. Not a plan defect; would be addressed by the deferred executable-kernel extraction (`384-extract-ship-git-ci-mechanics-into-a-tested-kernel`).
- **`bkit-counter-prose-audit.test.ts` cross-check extension** — already defensively handled in Verification Plan line 503 ("verify cross-check still passes; extend if so"). No action.

---

## Scope-Discipline Check (passed)

The design REJECTED: full kernel extraction, ship-without-branch-checkout, merge queue, surgical patch, head-move observer as primary, Step-1 push probe, remove-branch-write-access premise. **Verified** all are in `Out of Scope` (lines 200–209) and mirrored into `docs/deferrals.jsonl` by Task 9 — none silently re-absorbed as tasks:

- `384-extract-ship-git-ci-mechanics-into-a-tested-kernel` → Out of Scope row "Executable ship kernel, thin workflow" → Task 9 mirrors to deferrals.
- `384-ship-without-a-writable-branch-checkout-outside-b2` → Out of Scope row "Remove ship's write access to the branch entirely" (absorbed findings: Step 12 ownership + push-timing invariant — both as decisions, not as the rejected structural change).
- `384-promote-status-hole-detector-from-advisory-to-gate` → Out of Scope implicit in Tier-3 fail-open design; Task 10 implements advisory only.
- Merge queue → Out of Scope row with mechanism (unavailable on private non-Enterprise).
- Surgical patch → Out of Scope row.
- Step-1 push-capability probe → Out of Scope row with mechanism (rejected by #341).
- Head-move observer as primary → Out of Scope row (observation half kept as re-validation trigger — design decision, not scope creep).

"Suggested Scope Expansion" candidates (lines 216–224) are correctly bounded — two "fold in" rows trace to design scope (canonical step-key publication → Task 9/10; SC 2 → Task 7), one "keep advisory" row does not expand scope. No scope creep detected.

## CI-Suppression Hygiene Check (passed)

- Runtime `[skip ci]` (Task 7 line 459, Concrete Example line 71) is on the **dev-branch post-merge docs-only bookkeeping flush** — `dev`/`main` are exempt from `.husky/pre-push`'s `[skip ci]` block (verified: pre-push lines condition `case "$BRANCH" in dev|main) ;;`). The flush carries only `BOOK_PATHS`-scoped ledgers (no code). Correct per `.agents/rules.md` § Git, CI & Merges.
- No task adds `[skip ci]` to a `feat/{FID}` branch push. Implementation commits for Tasks 1–11 touch code (`.bkit/scripts/*`, `.bkit/workflows/*`, `.bkit/src/*`, `tests/*`) — must NOT carry `[skip ci]`; mechanically enforced by existing `.husky/pre-push` `[skip ci]` block on feat-branch head when a PR is open.
- Task 2's wiring of `pnpm test:bats` into `.husky/pre-push` does not touch the `[skip ci]` guard — additive only.

## Path-Scoped Staging Check (conditional pass — see M2)

- Plan rejects blanket `git add -A` and `git add -- docs/` (Tier-2 invariant, Task 3).
- `BOOK_PATHS` named as the allow-list; deferral `ship-step10-blanket-git-add-docs-sweeps-concurrent-sessions` acknowledged.
- **Gap:** literal contents not pinned (M2) — the staging scope guarantee is mechanically enforceable only after M2's fix lands.

## Consumer-Repo Verification Check (passed with mode-3 caveat — see M1)

- Task 11 Manual Step 1: Path A in consumer repo (app-gether-life preferred; visitfrasercoast-com de-prioritized per Risk 10 — produces no signal).
- Task 11 Manual Step 2: Path B2 in consumer repo.
- Task 11 Manual Step 4: `bkit-ship-gate.sh --explain` against live PR in bkit + (where available) both consumer repos; disagreements recorded as `docs/failures.jsonl` rows.
- Open Question (line 170) explicitly accepts the "consumer repo unavailable" fallback (only Path A in bkit's own telemetry observable; Path B2 defers). Reasonable hedge.
- **Caveat:** consumer-repo runs are local-mode (RUNTIME_DEVPUSHES=true). Mode-3 cloud path is not in Task 11 — M1.

## Runtime Conditional Check (conditional pass — see M1)

- Plan's Concrete Example handles `RUNTIME_DEVPUSHES=true` explicitly (worktree present ⇒ `CAN_PUSH_DEV=true` ⇒ `BOOK_ROOT=$REPO_ROOT`).
- Edge Cases table handles `RUNTIME_DEVPUSHES=false` (mode 3 → adopt tree, phase-close PR per #341 shape A).
- Task 7's prose-rewrite contract says "Step 1 resolves `BOOK_ROOT` + `BOOK_PATHS`" but does not spell out the `CAN_PUSH_DEV` conditional — relies on the agent reading the design's BOOK_ROOT table.
- No mechanical assertion (Tier-2 invariant) and no E2E (Task 11) for the `false` branch — M1.

## Testability Check (passed)

Every task has a concrete, executable `Done when:` criterion (verified per task). No "review the diff" verifications. Notable strengths:

- Task 3's RED-then-GREEN discipline proves the invariant test would catch a half-applied rewrite.
- Task 4's `pnpm test:bats tests/ship-gate.bats` proves fixtures map to exit codes BEFORE any prose is touched.
- Task 5's `grep -c '2>/dev/null || true'` reduced-by-6 criterion is mechanical and countable.
- Task 11's validation report (`ship-e2e-validation.md`) requires explicit PASS/FAIL against each of the 5 Success Criteria — manual but evidence-producing.

---

**Verdict rationale:** No CRITICAL. Two MAJOR — both verification-coverage gaps on Success-Criterion-critical surfaces (M1: mode-3 BOOK_ROOT; M2: BOOK_PATHS literal contents), both closable with a one-line test extension or an explicit deferral row. Plan is otherwise tight on regression risk (multi-tier detection + explicit rollback), testability (every task executable), scope discipline (no creep; rejected design items properly out-of-scope), and CI-suppression hygiene. Fix M1 + M2 before Gate 1.
