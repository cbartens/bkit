Verdict: CONCERNS
Failures: 1
<!-- verdict:end -->

# Plan Scope Check — Lens 1 (Task completeness, scope precision, verification executability, scope creep/gaps, inter-task overlap)

**Audited:** `docs/plans/202607/logs/384-ship-bookkeeping/plan-v2-reviewed.md`
**Template contract:** `docs/plans/template.md` (Agent Execution Runbook → "Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable criterion").
**Issue scope (per audit prompt):** `.bkit/workflows/bkit-ship.md`, `.deferred-blocked` writer, Failure Path status target, `.bkit/workflows.md` step table, rendered mirrors, + verification-gap detector.

## Per-task audit

<!-- prettier-ignore -->
| Task | Has Scope | Has Criteria (`Done when`) | Has Verification | Notes |
| --- | --- | --- | --- | --- |
| **Task 0** — WS-1: #341 Serialisation Carve-Out (GO/NO-GO) | ✅ Explicit (verify #341 landed; confirm no concurrent bkit-ship.md PR; record `384-341-serialisation` decision) | ✅ Concrete `Done when` with 4 clauses | ✅ `git log --oneline d64ef5be..HEAD -- .bkit/workflows/bkit-ship.md`; `grep -c 'bkit_runtime_row ship'`, `'RUNTIME_DEVPUSHES'`, `'bkit_close_guard_checkout'`; `docs/decisions.jsonl` row | Tight, single-concern gate. Verifiers are executable. |
| **Task 1** — WS-3: Configuration Surface | ✅ Explicit (package.json keys; `bkit-ship-timeouts.sh` byte-identical pair; modify `bkit-protect-main.sh`; new unit test) | ✅ 4-clause `Done when` | ⚠️ 3 of 4 verifiers concrete (`pnpm test bkit-config-keys`, `pnpm test bkit-package-json`, grep for `jq` read); **4th clause "both byte-identical pairs verified by `bkit-dogfood-noop.integration.test.ts`" is forward-referenced — see MAJOR-1** | Scope is single (config surface). |
| **Task 2** — WS-2: gh Stub Harness + Fixture Corpus (GO/NO-GO cost hinge) | ✅ Explicit (extend PATH-shim idiom; fixture dispatch layer; 7 + 1 fixtures; husky wiring; NO-GO escalation) | ✅ 5-clause `Done when` | ✅ File existence; executable bit; smoke bats; `.husky/pre-push` content; `pnpm test:bats` exit 0 | Single concern (test infra). NO-GO explicitly plan-halting. |
| **Task 3** — WS-6: Bookkeeping Contract + Tier-2 Invariant Test (RED) | ✅ Explicit (write `.bkit/src/bkit-ship-invariants.test.ts` against current prose; publish canonical 14 step keys + 8-path `BOOK_PATHS`; positive presence assertions) | ✅ 3-clause `Done when` (test exists, FAILS on current, frozen lists published) | ✅ Test execution; published frozen lists | Single concern (the RED test). |
| **Task 4** — WS-4: `bkit-ship-gate.sh` + `tests/ship-gate.bats` (Tier-1 carrier) | ✅ Explicit (byte-identical pair; full contract; 10 named bats cases; override semantics) | ✅ 3-clause `Done when` | ⚠️ 2 of 3 verifiers concrete (`pnpm test:bats tests/ship-gate.bats`; `--explain` exit-code determinism); **3rd clause "byte-identical pair verified by `bkit-dogfood-noop.integration.test.ts`" forward-referenced — see MAJOR-1** | Single concern (the gate). |
| **Task 5** — WS-8: Failure Path + Worktree Hardening | ✅ Explicit (3 Failure Path sub-fixes + Step 12 ownership scoping; 2 new bats files) | ✅ 4-clause `Done when` | ✅ `pnpm test:bats` (×2); `grep -c '2>/dev/null \|\| true'` reduction ≥ 6; `.deferred-blocked` writer wired into `@bkit-ship-deferred-sweep` prompt | See MINOR-1 (bundles two distinct hardening areas) and MINOR-2 (`.bkit/workflows.md` shared with Task 8). |
| **Task 6** — WS-5: Gate Distribution / Dogfood Mirroring | ✅ Explicit (verify install/upgrade placement; executable bit; partial-upgrade drift; enforce byte-identity via bkit-dogfood-noop) | ✅ 4-clause `Done when` | ✅ `pnpm test bkit-dogfood-noop`; manual `bkit check`; `ls -l`; `diff` | **Task 6 is the explicit owner of `bkit-dogfood-noop` extension** (per Gate 2 line 492 + Verification Plan line 509: "extended for two new scripts (Task 6)"). |
| **Task 7** — WS-7: `bkit-ship.md` Structural Rewrite (Tier-2 GREEN) | ✅ Explicit (rewrite to verify→base-check→integrate→re-validate→merge gate→merge→close; explicit `BOOK_ROOT` mode-3 conditional; timeouts sourced from `bkit-ship-timeouts.sh`; pre-merge snapshot; three deletions) | ✅ Multi-clause `Done when` (10+ checks) | ✅ Tier-2 test GREEN; `grep -c 'git add -A'` = 0; every `gh pr merge` carries `--match-head-commit`; lock window rows; shape match; no bare numeric timeout; `BOOK_ROOT` at every write site; canonical 14 keys; `pnpm slop:delta` green; `pnpm lint:prose` green | Single file. Preserves Task 5 block explicitly (review-2 MINOR 4). |
| **Task 8** — WS-9: Rendered Mirrors + Workflow Index Regeneration | ✅ Explicit (regenerate via `bkit install`; re-section `.bkit/workflows.md` ship step table; restamp markers) | ✅ 4-clause `Done when` | ✅ `bkit install` exit 0; `bkit check` no drift; `diff` of `.claude/commands/bkit-ship.md`; `.bkit/workflows.md` reflects new step numbers | Single concern (distribution). See MINOR-2 (shared file with Task 5). |
| **Task 9** — WS-10: Documentation + Contract Publication | ✅ Explicit (5 docs: observability.md, deployments.md, decisions.jsonl ×2 keys, deferrals.jsonl with dedup guard, knowledge.jsonl) | ✅ 4-clause `Done when` | ✅ Literal-content greps; `grep -c '<key>'` ≤ 1 dedup; `pnpm test` passes | See MINOR-3 (bundles 5 docs, but all are "publish already-decided contracts"). |
| **Task 10** — WS-11: Tier-3 Status-Hole Detector | ✅ Explicit (test file + detector; derive from `bkit-ship.md`; path-conditional sets; fail-open channel; pinned watermark) | ✅ 5-clause `Done when` | ✅ `pnpm test bkit-status-hole-detector`; CLI exits 0; invented names surface as delta; promotion criteria referenced | Single concern (the detector). Maps to matrix row 8. |
| **Task 11** — WS-12: E2E Validation + Rollout | ✅ Explicit (manual; `--explain` vs `gh pr checks`; Path A + Path B2; 5 SCs; rate-limit sample; Tier-3 watermark calibration; mode-3 deferral; release gate+config+prose together; validation report) | ✅ 5-clause `Done when` | ✅ `ship-e2e-validation.md` exists + non-empty; PASS/FAIL per SC; rate-limit sample; mode-3 deferral cross-ref; `docs/failures.jsonl` rows | Single workstream. Maps to matrix row 9. |

**Task completeness verdict:** 12/12 tasks have explicit Scope, Criteria, and Verification. Template contract met.

## Scope precision

- Tasks 0–4, 6–8, 10, 11: each is a single, well-bounded unit.
- **Task 5** bundles Failure Path (3 sub-fixes) + Step 12 worktree-ownership scoping. Both are "ship hardening underneath the rewrite" and produce two distinct bats files (`tests/ship-failure-path.bats` + `tests/ship-worktree-ownership.bats`). Borderline — see MINOR-1.
- **Task 9** bundles edits to 5 different docs. All are "publish already-decided contracts/decisions" — single conceptual concern. Acceptable.

## Verification executability

- All Done-when clauses use concrete commands (`pnpm test`, `pnpm test:bats`, `grep -c`, `diff`, `bkit install`, `bkit check`, `ls -l`, `git log`).
- No "review" or "ensure" without a mechanism.
- **Forward-reference issue** on Task 1 and Task 4 (see MAJOR-1).

## Scope creep (against issue scope)

<!-- prettier-ignore -->
| Task | Touches in-scope item? | Verdict |
| --- | --- | --- |
| 0 | Gates `.bkit/workflows/bkit-ship.md` work | ✅ in |
| 1 | package.json + `bkit-ship-timeouts.sh` + `bkit-protect-main.sh` | ✅ enabling infrastructure for gate (in-scope) |
| 2 | `tests/fixtures/gh/` + `.husky/pre-push` | ✅ enabling test infrastructure (in-scope) |
| 3 | Tier-2 invariant test | ✅ in (verification-gap detector's prose companion) |
| 4 | `bkit-ship-gate.sh` + `tests/ship-gate.bats` | ✅ in (merge gate mechanism) |
| 5 | `.deferred-blocked` writer + Failure Path + Step 12 | ✅ in |
| 6 | Dogfood mirroring of new scripts | ✅ in (rendered mirrors) |
| 7 | `bkit-ship.md` rewrite | ✅ in |
| 8 | Rendered mirrors + `.bkit/workflows.md` step table | ✅ in |
| 9 | Documentation | ✅ per-template (template mandates documentation updates) |
| 10 | Tier-3 status-hole detector | ✅ in (verification-gap detector) |
| 11 | E2E validation | ✅ per-template (manual verification) |

**No scope creep identified.**

## Scope gaps (in-scope items missing a task)

<!-- prettier-ignore -->
| In-scope item (from issue) | Owning task(s) | Covered? |
| --- | --- | --- |
| `.bkit/workflows/bkit-ship.md` rewrite | Task 7 (structural) + Task 5 (Failure Path + Step 12) | ✅ |
| `.deferred-blocked` writer | Task 5 (implement) + Task 3 (assert) | ✅ |
| Failure Path status target | Task 5 | ✅ |
| `.bkit/workflows.md` step table | Task 8 (+ Task 5 wires prompt) | ✅ |
| Rendered mirrors | Task 8 (regen) + Task 6 (verify distribution) | ✅ |
| Verification-gap detector | Task 10 (Tier-3 status-hole detector) | ✅ |

**No scope gaps identified.**

## Derived Test Matrix ↔ Runbook bidirectional mapping

<!-- prettier-ignore -->
| Matrix row | Maps to task(s) | Bidirectional? |
| --- | --- | --- |
| 1. Gate maps 7 fixtures → exit codes (`tests/ship-gate.bats`) | Task 4 | ✅ |
| 2. Prose invariants (`.bkit/src/bkit-ship-invariants.test.ts`) | Task 3 + Task 7 | ✅ |
| 3. `.deferred-blocked` writer fires on FAIL | Task 3 + Task 5 | ✅ |
| 4. Failure Path append ordering + `BOOK_ROOT` (`tests/ship-failure-path.bats`) | Task 5 | ✅ |
| 5. Step 12 worktree ownership (`tests/ship-worktree-ownership.bats`) | Task 5 | ✅ |
| 6. Config keys (`.bkit/src/bkit-config-keys.test.ts`) | Task 1 | ✅ |
| 7. `bkit-ship-gate.sh` byte-identical + install/upgrade (`bkit-dogfood-noop.integration.test.ts`) | Task 6 | ✅ |
| 8. Tier-3 detector (`.bkit/src/bkit-status-hole-detector.test.ts`) | Task 10 | ✅ |
| 9. First real Path A + Path B2 ship (E2E manual) | Task 11 | ✅ |

Gate 2's "Verify test coverage against Derived Test Matrix" checkbox (plan line 491) reproduces this mapping verbatim. **Bidirectional map intact — every matrix row → ≥1 task; every task with a test target → ≥1 matrix row.**

## Inter-task scope overlap

<!-- prettier-ignore -->
| File | Tasks touching it | Sequencing | Ambiguity? |
| --- | --- | --- | --- |
| `.bkit/workflows/bkit-ship.md` | Task 5 (Failure Path + Step 12 block edits); Task 7 (structural rewrite) | Task 5 → Task 7 (Task 7 explicitly preserves Task 5's block, review-2 MINOR 4) | ✅ Resolved |
| `.bkit/scripts/bkit-ship-gate.sh` + template | Task 4 (creates); Task 6 (verifies distribution, no edit) | Task 4 → Task 6 | ✅ Resolved |
| `.bkit/scripts/bkit-protect-main.sh` + template | Task 1 only | — | ✅ |
| `package.json` | Task 1 only | — | ✅ |
| `.bkit/workflows.md` | Task 5 (wires `.deferred-blocked` into `@bkit-ship-deferred-sweep` prompt); Task 8 (re-sections ship step table) | Task 5 → Task 8 (Task 8 dep on Task 5 transitively via Task 7) | ⚠️ See MINOR-2 |
| `tests/ship-gate.bats` | Task 2 (optional: "smoke bats case … or appended to `tests/ship-gate.bats` setup"); Task 4 (creates the file) | Task 2 → Task 4 | ⚠️ See MINOR-4 |
| `.bkit/src/bkit-ship-invariants.test.ts` | Task 3 (creates RED); Task 7 (makes GREEN by rewriting prose under test — no edit to test file) | Task 3 → Task 7 | ✅ Resolved |
| `bkit-dogfood-noop.integration.test.ts` | Task 1 (Done-when references as verifier); Task 4 (Done-when references as verifier); Task 6 (explicitly extends for two new scripts) | Task 6 owns extension; Tasks 1+4 reference | ⚠️ See MAJOR-1 |
| `.husky/pre-push` | Task 2 only | — | ✅ |
| Rendered mirrors (`.claude/commands/bkit-ship.md`, etc.) | Task 8 only | — | ✅ |

## CRITICAL

None. All 12 tasks have explicit Scope, Criteria, and Verification. Matrix↔Runbook bidirectional map is intact. No scope gaps on the six in-scope items. No scope creep. Supersession Inventory complete (7 rows; 6 DELETE + 1 RETAIN-WITH-REASON with justification; all DELETE rows mirrored as `[DELETE]`/`[MODIFY]` in Architecture). Out-of-Scope table all `Exempt` (genuinely-additive; traced to design decisions).

## MAJOR

### MAJOR-1: `bkit-dogfood-noop.integration.test.ts` ownership split across Tasks 1, 4, 6 — Tasks 1+4 Done-when unsatisfiable in isolation

**Where:** Task 1 (line 453), Task 4 (line 459), Task 6 (line 463), Gate 2 (line 492), Verification Plan (line 509).

**Observation:**

- Task 1 `Done when` asserts: "both byte-identical pairs verified by `bkit-dogfood-noop.integration.test.ts`" (referring to `bkit-ship-timeouts.sh` + `bkit-protect-main.sh` pairs).
- Task 4 `Done when` asserts: "byte-identical pair verified by `bkit-dogfood-noop.integration.test.ts`" (referring to `bkit-ship-gate.sh` pair).
- Task 6 scope explicitly owns: "Enforce byte-identity via the templates-content snapshot and `bkit-dogfood-noop.integration.test.ts`."
- Gate 2 line 492 and Verification Plan line 509 both state: "`bkit-dogfood-noop.integration.test.ts` extended for two new scripts (Task 6)."
- Matrix row 7 maps the byte-identical verification to Task 6 alone.

**Problem:** Tasks 1 and 4 cannot satisfy their `Done when` clauses without Task 6 having landed (the test does not yet cover the new scripts until Task 6 extends it). This is a verification-executability gap on two tasks: their stated verifier is not yet wired to the artifact under test. The clauses are forward-references, not independently runnable checks.

**Fix options (apply via plan-update; pick one):**

1. **(Preferred)** Drop the `bkit-dogfood-noop` clause from Task 1 and Task 4 `Done when`. Replace with manual `diff` between root + template copies (which is the underlying property). Task 6 then automates this via the test extension.
2. Add an explicit step in Task 1 scope: "extend `bkit-dogfood-noop.integration.test.ts` to cover `bkit-ship-timeouts.sh` byte-identity" — and similarly in Task 4 for `bkit-ship-gate.sh`. Task 6's scope then reduces to "verify both extensions land + manual `bkit check` drift".

**Severity rationale:** Real inter-task scope overlap on a single test file (per lens: "Do two tasks claim ownership of the same edit?"). Does not block plan progress (Task 6 will close the loop), but Tasks 1 and 4 checkboxes cannot be ticked without ambiguity until Task 6 lands — which violates the runbook's "Step Isolation" rule that each task's verification completes before the next.

## MINOR

### MINOR-1: Task 5 bundles two distinct hardening areas

**Where:** Task 5 (line 461).

**Observation:** Task 5 bundles (a) Failure Path fixes (`.deferred-blocked` writer + `BOOK_ROOT` + abort-before-append ordering + 6 silencings) and (b) Step 12 worktree-ownership scoping. These are two logically distinct hardening areas of `bkit-ship.md`, producing two distinct bats files (`tests/ship-failure-path.bats` + `tests/ship-worktree-ownership.bats`).

**Assessment:** Acceptable as-is — both are "ship hardening underneath the rewrite" and the design's `WS-8` groups them. Could be split if execution friction emerges; not blocking.

### MINOR-2: `.bkit/workflows.md` touched by Task 5 and Task 8 — file ownership across two tasks

**Where:** Task 5 (line 461, Done-when includes "`.deferred-blocked` writer wired into `@bkit-ship-deferred-sweep` prompt description in `.bkit/workflows.md`"); Task 8 (line 467, Done-when includes "`.bkit/workflows.md` ship section reflects new step numbers and references `.deferred-blocked` writer").

**Observation:** Both tasks touch the ship section of `.bkit/workflows.md`. The edits are different (Task 5 wires the writer into the deferred-sweep prompt; Task 8 re-sections the step table) and sequenced (Task 5 → Task 8 transitively via Task 7). Both can complete independently.

**Assessment:** Acceptable — sequential, additive edits. Worth a one-line note in Task 8 that its re-section preserves Task 5's writer wire-in (mirroring the pattern Task 7 uses for Task 5's Failure Path block at review-2 MINOR 4).

### MINOR-3: Task 9 bundles 5 different docs

**Where:** Task 9 (line 469).

**Observation:** Task 9 edits `docs/observability.md`, `docs/deployments.md`, `docs/decisions.jsonl` (×2 keys), `docs/deferrals.jsonl`, plus the implicit `docs/knowledge.jsonl` per the Documentation Updates table.

**Assessment:** Acceptable — all are "publish already-decided contracts/decisions", which is a single conceptual concern. Template treats documentation as one workstream.

### MINOR-4: `tests/ship-gate.bats` smoke-case location ambiguous between Task 2 and Task 4

**Where:** Task 2 (line 455): "a smoke bats case (`tests/fixtures/gh/smoke.bats` or appended to `tests/ship-gate.bats` setup)"; Task 4 (line 459): "Create `tests/ship-gate.bats` with the 10 named cases."

**Observation:** Task 2 offers two locations for the smoke case. If Task 2 picks the second option (append to `tests/ship-gate.bats` setup), it pre-creates a file that Task 4 then "creates" with 10 cases — ownership ambiguity on `tests/ship-gate.bats`.

**Assessment:** Minor — Task 2 can pick the first option (`tests/fixtures/gh/smoke.bats`) and avoid the conflict. Plan should pick one location explicitly.

## OUT OF SCOPE

(Not applied to plan — surfaced for human review only.)

- **Promotion of Tier-3 detector to gate** — recorded as deferral (`384-promote-status-hole-detector-from-advisory-to-gate`); correctly out of scope; Task 9/Task 10 cross-link.
- **Mode-3 (cloud, `RUNTIME_DEVPUSHES=false`) live E2E** — recorded as deferral (`384-mode-3-bookkeeping-e2e-deferred-to-341-live-run`); correctly out of scope; Task 11 records gap; Task 3 mechanically asserts the prose contract.
- **Per-workflow rollback mechanism** — manual rollback path is in scope (Task 9); the per-workflow mechanism is correctly deferred.
- **Required status checks on `dev` via `bkit-protect-main.sh`** — correctly deferred; additive cross-consumer policy.

---

**Lens-1 verdict:** CONCERNS — one MAJOR (inter-task overlap on `bkit-dogfood-noop.integration.test.ts` ownership rendering Tasks 1+4 Done-when clauses unsatisfiable in isolation). All other lens criteria (task completeness, scope precision, verification executability, scope creep, scope gaps) pass cleanly. MAJOR is fixable via a one-line scope/Done-when edit in plan-update; no structural rework required.
