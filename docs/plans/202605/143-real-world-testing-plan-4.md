Verdict: PASS

<!-- verdict:end -->

<!-- Note: child sub-plan 4 of 4. Split from the master per the WS DAG. Final sign-off child. -->

# Live Testing Gates — Sub-Plan 4: WS-7 Soak Orchestration + WS-8 Canonical-Mirror Lockstep + Final Gates / Verification

**Parent Plan:** [`143-real-world-testing-plan.md`](./143-real-world-testing-plan.md)
**Source master:** [`plan-v3-checked.md`](./plan-v3-checked.md)
**Requires (merged):** [`143-real-world-testing-plan-1.md`](./143-real-world-testing-plan-1.md), [`143-real-world-testing-plan-2.md`](./143-real-world-testing-plan-2.md), [`143-real-world-testing-plan-3.md`](./143-real-world-testing-plan-3.md). Specifically WS-3 (OBSERVE_MODE enum + status.json envelope), WS-5/WS-6 (the EXACT final Step 6 / Step 13 command text WS-8 mirrors verbatim), and the WS6-1 `debug-reproduce` guard shape (WS-7 widens its soak arm).
**Blocks:** — (final child; Gates 2/3/4 + Verification Plan are the whole-plan sign-off).

> [!CAUTION]
> **CRITICAL — do not hallucinate plan execution state.**
>
> 1. ALWAYS read this file natively before executing any step.
> 2. NEVER trust session summaries or conversation history for completion state.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in THIS document.

## Context & Goals

Three runtime-only bugs (#143) shipped green because every test was mocked. The fix is one missing invariant: a real-boundary test must EXIST, FAIL before a fix, PASS after — and when it cannot run, the green result must be loud and auditable.

This sub-plan installs the **soak orchestration + canonical-mirror lockstep** and carries the **whole-plan final gates + verification sign-off**:

- **WS-7 — Soak orchestration (fourth OBSERVE_MODE value) + guard coverage:** the orchestrator soak-entry + `[soak]` override; the one-way `Handoff: soak` crossover; the new Step 9S soak loop; the widened `debug-reproduce` soak arm; soak exhaustion routing; the new `bkit-debug-soak.md` prompt; the EXHAUSTIVE 18-site OBSERVE_MODE guard-coverage table.
- **WS-8 — Canonical-mirror lockstep edits:** `.agents/workflows.md` catalog rows + notes mirror the WS-5/WS-6/WS-7 command text exactly.
- **Gate 2 / Gate 3 / Gate 4 + Verification Plan + Manual Verification:** the whole-plan sign-off — verifying EVERY WS task across ALL four children, the session-end mirror regen, and the dogfood tarball + live install+upgrade + soak-guard smoke-read.

> [!CAUTION]
> **Highest-risk workstream — a half-wired `OBSERVE_MODE=soak` branch is the design's named top risk.** Each WS7-7 guard-site sub-item is DISCRETE. Do NOT collapse them. Reuse `MAX_DEBUG_ATTEMPT` (= 3, `bkit-debug.md:38`) as the single shared cap; mint NO new constant.

**Success criteria for THIS child:**

- All 18 WS7-7 guard sites verified; soak is one accumulating-context loop on the shared `MAX_DEBUG_ATTEMPT` budget; the crossover is one-way; the new `bkit-debug-soak.md` exists.
- `.agents/workflows.md` catalog rows + notes match the WS-5/6/7 command text exactly and teach `soak`.
- `pnpm test`, `pnpm check:type`, `pnpm check:format`, `pnpm lint`, `pnpm check:dist`, `pnpm bkit check` all green; the dogfood tarball seeds the renamed names + back-compat; install AND upgrade reconcile identically; the two INNER Step-12 grep checks pass.

## Out of Scope (this child)

- Writing live test BODIES / adding `test:smoke` / `:live` bodies to bkit's own `package.json` (bkit's `test:smoke`/`:live` are ABSENT — do NOT attempt to run them).
- A two-way soak<->normal crossover — soak never hands back (would discard accumulating context).
- A tighter per-paid-endpoint soak-iteration cap — deferred to `docs/pending.md`.
- Widening Gate 4's `DIAGNOSE_VERDICT in PASS|FAIL` assertion — the `debug-reproduce` CONCERNS rides its own step verdict (from plan-v4-3/WS6-4).

## Invariants (this child)

- `MAX_DEBUG_ATTEMPT = 3` is the SINGLE shared cap (verified at `bkit-debug.md:38`); soak reuses it; mint NO new constant.
- `LIVE_API` is the in-code env var; surface vocab stays `live`; NO `API_LIVE` residue.
- ASCII operators (`!=` `>=` `<=`) in `.agents/workflows/*` + `.agents/prompts/*` (incl. the new `bkit-debug-soak.md`) — never Unicode.
- No `KN-` / `BAR-` / issue refs in consumer-facing text (the new prompt + the OBSERVE-vs-SOAK boundary sentence).
- #135 coordination note: `bkit-debug-failure-diagnose.md` is ALSO edited by #135 (the `Handoff: soak` verdict in WS7-2 lands on the same prompt) — do NOT assume sole ownership.
- The one-way `Handoff: soak` crossover NEVER burns an attempt when no fix is applied.
- bkit-repo-only `check:dist` / `check:bkit` / absent-live sit OUTSIDE `bkit:start/end`.

## Merge Method

**Merge method: always squash.** This child lands as the FINAL squash-merged PR after plan-v4-3.

## Supersession Inventory (slice relevant to this child)

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.agents/workflows.md` Debug Step 6 catalog row `lint typecheck test test:integration test:e2e` | `lint check test test:integration test:e2e test:integration:live test:e2e:live` | DELETE (replace) | Mirror must track the step edit (§H anti-drift). Owned by WS8-1. |
| `.agents/workflows.md` Build Step 13 catalog row `lint typecheck test` | `lint check test:unit test:smoke` | DELETE (replace) | Same anti-drift mirror; including the renamed enumerated single-package fallback list (`.agents/workflows.md:621`). Owned by WS8-2. |
| `.agents/workflows.md` "Pre-PR vs debug" note (`lint+typecheck+unit`) | `lint check` aggregate naming + build/debug tier distinction | DELETE (replace) | Same anti-drift mirror. Owned by WS8-3. |
| `.agents/workflows.md` CATALOG discovery-seam rows 621/646/972/975 (deferred from plan-v4-1/WS-1) | `pnpm turbo lint check test`-aligned rows | DELETE (replace) | These four catalog rows were the EXPECTED-and-deferred Gate-WS-1 hit; WS-8 (this child) lands them in lockstep with the step edits. |

> [!CAUTION]
> **Default = `DELETE`.** Each row mirrored in the WS-8 Architecture entry + the WS8-1..WS8-5 runbook tasks.

## Architecture & Component Changes

### WS-7 — Soak orchestration (fourth OBSERVE_MODE value) + guard coverage

#### [MODIFY] `.agents/workflows/bkit-debug.md` (Step 1 decision, new Step 9-soak, full guard table)

- **Existence Check:** exists. Wire the EXHAUSTIVE OBSERVE_MODE->soak guard table (§D) — each row a discrete checklist item (WS7-7 below). Add the orchestrator soak-entry branch + `[soak]` override at the Step 1 OBSERVE_MODE decision (line 142-145, BEFORE the attempt-exhaustion branch). Add the new Step 9-soak block (`Run only if OBSERVE_MODE = soak`) invoking `@bkit-debug-soak` with one accumulating context, looping on the SHARED `MAX_DEBUG_ATTEMPT` (= 3, line 38) budget. Widen the §B `debug-reproduce` guard's soak arm. Wire soak exhaustion routing -> `liveVerdict: FAIL` -> Failure Path / `@bkit-debug-abort-handover`; green exit -> soak-aware Close Workflow.

#### [MODIFY] `.agents/prompts/bkit-debug-failure-diagnose.md` (Handoff: soak verdict)

- Add the machine-parseable `Handoff: soak` verdict + reason on criteria 1-3 (esp. #3 the `failureSignatureMoved` chain smell). ONE-WAY; a `Handoff: soak` with no fix applied does NOT burn an attempt. (Coordination: #135 also edits this prompt.)

#### [NEW] `.agents/prompts/bkit-debug-soak.md`

- New prompt mirroring the failure-diagnose/remediate log shape: machine-parseable verdict header + `<!-- verdict:end -->` + accumulating ReAct-style instrument->fix->re-verify log against the live test; each iteration burns one unit of the shared `MAX_DEBUG_ATTEMPT` budget; appends `repro: fail|pass` and sets `failureSignatureMoved`. ASCII operators; no internal refs. (Regenerate `.claude/` + `.cursor/` mirrors at session end.)

### WS-8 — Canonical-mirror lockstep edits

#### [MODIFY] `.agents/workflows.md`

- **Existence Check:** exists. Debug Step 6 catalog row (line ~646): fold `typecheck`->`check`, append `test:integration:live test:e2e:live`. Build Step 13 catalog row (line ~621): `lint check test:unit` + `test:smoke` (no mocked integration/e2e in build's own step). "Turbo command (verbatim)" / "Pre-PR vs debug" note (line ~972-975): `lint check` naming + build-vs-debug tier distinction + debug appends live tiers when `LIVE_STACK = live`. `/bkit-debug` mode-detection note + catalog rows (line ~634, ~641-652): teach `soak`, add a Step 9-soak catalog row (`@bkit-debug-soak` _(only if `OBSERVE_MODE = soak`)_), widen the Gate-1 enum mention. Land the single canonical OBSERVE-vs-SOAK boundary sentence. ASCII operators; no internal refs.

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates (this child)

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends. The reference-doc renames were owned by plan-v4-1/WS1-6 and the taxonomy by plan-v4-2/WS-2; the remaining rows below are the soak/decision/pending additions + the cross-cutting docs the final Gate-3 verifies.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `docs/knowledge.md` | Add a KN entry on the rename-atomicity trap if a regression is hit during build (forward-looking command references only; leave historical KN narrative intact). |
| `docs/decisions.md` | DE entries (back-compat B1=a + soak shared-budget) recorded in plan-v4-1/Task 0 — verify present + accurate. |
| `docs/pending.md` | Append the future-phase tighter-soak-cap idea + the future-major legacy-alias-retirement follow-up (B1=a aliases carried indefinitely until consumers migrate). |
| `.agents/docs.md` | Verify the index still accurate after the new prompt `bkit-debug-soak.md` (prompts are catalogued in `.agents/prompts.md`, not `.agents/docs.md` — confirm no new doc row needed). |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | No DB. |
| **Code** | `git revert {COMMIT}` per WS PR | Code-only. The rename (plan-v4-1/WS-1) is the only blast-radius commit; revert restores `typecheck`/`format:check` atomically. |
| **Risk window** | None | No deploy / migration. After revert, run `pnpm build` + `pnpm bkit install` to regenerate `dist/` + mirrors to the reverted state. |

## 🚨 Pre-Flight / Dependencies 🚨

- [ ] **Prerequisite Plans:** plan-v4-1, plan-v4-2, plan-v4-3 all merged. The OBSERVE_MODE enum, status.json envelope, the WS6-1 `debug-reproduce` guard shape, and the WS-5/6 final command text must already exist.
- [ ] **Architecture & UI** _(new file)_: New prompt `.agents/prompts/bkit-debug-soak.md` must follow the existing prompt-file shape (machine-parseable verdict header + `<!-- verdict:end -->`); validate against `bkit-debug-failure-diagnose.md` as the reference shape.
- [ ] **Project Context:** Re-read `docs/decisions.md` (the soak shared-budget DE from plan-v4-1/Task 0b) before wiring WS-7.

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work through autonomously. Do not pause for user permission at any Gate.
> **Blockers:** If a task cannot be completed, create a tracker issue (label `blocker`) before stopping.
> **Step Isolation:** Complete each task fully before the next.
> **Sequencing:** WS-7 -> WS-8 (WS-8 mirrors the final WS-5/6/7 command text). Mirror regen (`dist`, `.claude`, `.cursor`, snapshots) BATCHED at session end. Then Gate 2 -> Gate 3 -> Verification Plan -> Gate 4 -> Manual Verification.

> Every task MUST include a `**Done when:**` line.

### WS-7 — Soak orchestration + guard coverage (Requires WS-3, WS-6)

> [!CAUTION]
> **Highest-risk workstream — a half-wired `OBSERVE_MODE=soak` branch is the design's named top risk.** Each guard-site below is a DISCRETE checklist item. Do NOT collapse them. Reuse `MAX_DEBUG_ATTEMPT` (= 3, `bkit-debug.md:38`) as the single shared cap; mint NO new constant.

- [ ] **WS7-1 — Step 1 orchestrator soak-entry + `[soak]` override.** Score criteria 1-2 from the report + `LIVE_STACK = live` -> `OBSERVE_MODE = soak`; `[soak]` flag = unconditional override (still subject to the Step-2 downgrade); both BEFORE the attempt-exhaustion branch (line 142-145). **Done when:** the Step 1 OBSERVE_MODE decision (the list-item at `bkit-debug.md` lines ~142-145 — labelled "Step 1 OBSERVE_MODE decision" consistently with the plan body and Architecture section; NOT "Step 8") lists the soak entry + `[soak]` override before the `DEBUG_ATTEMPT > MAX_DEBUG_ATTEMPT -> instrument` branch.
- [ ] **WS7-2 — `Handoff: soak` crossover.** `bkit-debug-failure-diagnose.md` emits the machine-parseable `Handoff: soak` verdict + reason (criteria 1-3, esp. #3 `failureSignatureMoved`); the workflow switches REMAINING shared budget to soak IF budget remains AND `liveStack == live`; ONE-WAY; handoff diagnosis does NOT burn an attempt. **Done when:** the prompt emits a parseable `Handoff: soak` verdict; the workflow Step 4 area has the one-way crossover wiring with the no-burn rule.
- [ ] **WS7-3 — New Step 9-soak block.** `Run only if OBSERVE_MODE = soak`; invoke `@bkit-debug-soak` with one accumulating context; reproduce-first runs first (the widened §B guard); loop instrument->fix->re-verify against the live test, each iteration burning one shared-budget unit; record `debug-soak` with `liveVerdict`, `soakIterations`, `failureSignatureMoved`. NOTE (anti-footgun): the existing `## 🤖 Step 9 — Observe Instrument` (`bkit-debug.md:624`) RETAINS its number — use an unambiguous heading for the new block (e.g. "Step 9S — Soak Loop") so an implementer does not renumber or overwrite Observe Instrument. **Done when:** `bkit-debug.md` has the soak block (distinct heading, NOT overwriting Step 9 Observe Instrument) gated `OBSERVE_MODE = soak` invoking `@bkit-debug-soak`, anchored on a prior `repro: fail`, looping on the shared `MAX_DEBUG_ATTEMPT` budget.
- [ ] **WS7-4 — Widen the `debug-reproduce` guard's soak arm.** Confirm the WS6-1 guard reads `(OBSERVE_MODE = off OR OBSERVE_MODE = soak) AND LIVE_STACK = live` and that `repro: pass`/`infra` short-circuits soak (route as the §B CONCERNS case, soak loop does NOT start). **Done when:** the reproduce guard includes the soak arm and the short-circuit is wired.
- [ ] **WS7-5 — Soak exhaustion routing.** Shared budget exhausted + live test failing -> `liveVerdict: FAIL` -> Failure Path / `@bkit-debug-abort-handover` (handover carries accumulated context + fixes-so-far); green exit -> soak-aware Close Workflow. The green-soak exit's satisfaction signal is the `repro: fail -> pass` transition (seeded `repro: fail` by `debug-reproduce`, flipped to `repro: pass` by the final soak iteration) — matching the non-soak Step 6 fail-then-pass contract so the soak path is auditable from state. **Done when:** the soak FAIL terminal state routes to `@bkit-debug-abort-handover`; green exit reaches Step 12 Close AND the final soak iteration records `liveVerdict: PASS` + the `repro: fail -> pass` transition.
- [ ] **WS7-6 — Create `.agents/prompts/bkit-debug-soak.md`.** Machine-parseable verdict header + `<!-- verdict:end -->` + accumulating ReAct log; ASCII operators; no internal refs. **Done when:** the file exists with the verdict header + `<!-- verdict:end -->` and the iterate-against-live-test loop description.
- [ ] **WS7-7 — Full OBSERVE_MODE guard-coverage table (DISCRETE per site).** Each sub-item below is verified independently:
  - [ ] Failure Path branch (line 73): confirm soak exhaustion reaches handover (EXTEND — no new condition). **Done when:** the soak `debug-soak` FAIL path reaches the line-73 branch.
  - [ ] Step 1 OBSERVE_MODE decision (line 142-145): orchestrator + `[soak]` added (WS7-1). **Done when:** present.
  - [ ] `Handoff: soak` crossover (new, Step 4 area) (WS7-2). **Done when:** present.
  - [ ] Gate 1 enum text (line 176): WIDEN to `(off | instrument | analyse | soak)`. **Done when:** the Gate-1 checklist enum reads all four values.
  - [ ] debug-input echo (line 163/234): no change (echoes whatever value). **Done when:** confirmed unchanged.
  - [ ] worktree-setup persist (line 248-249): soak->off downgrade + `liveStack` persist (WS3-2). **Done when:** present.
  - [ ] Step 4 Failure Diagnose guard (line ~390): KEEP `off` only; diagnose may still emit `Handoff: soak`. **Done when:** guard unchanged at `off`.
  - [ ] Step 5 Failure Remediate guard (line ~441): KEEP `off` only. **Done when:** unchanged.
  - [ ] Step 6 Run Tests guard (line ~487): KEEP `off` only. **Done when:** unchanged.
  - [ ] Step 7 Push Remediation guard (line ~536): KEEP `off and Step 5 PASS`. **Done when:** unchanged.
  - [ ] Step 8 Summary guard (line ~580): KEEP `off and Step 5 PASS`. **Done when:** unchanged.
  - [ ] Step 9 Observe Instrument guard (line ~626): KEEP `instrument`. **Done when:** unchanged.
  - [ ] Step 10 Observe Analyse guard (line ~694): KEEP `analyse`. **Done when:** unchanged.
  - [ ] Step 11 Observe Revert guard (line ~734): KEEP `analyse`. **Done when:** unchanged.
  - [ ] Step 12 Close Workflow guard (line ~785): EXTEND to `off OR instrument OR soak` (green soak reaches close). **Done when:** the guard reads `off OR instrument OR soak`.
  - [ ] Step 12 INNER tracker issue-update sub-step (line ~856, currently the list item `**If** OBSERVE_MODE = off:` that wraps the `issue-update-review` + `issue-update-status` tracker sub-steps): EXTEND to `off OR soak` so a green soak close updates the tracker (issue-update-review + issue-update-status, state -> `In Review`) exactly as a normal-off close does; `instrument` close intentionally still does NOT update (preserve existing line-856 semantics). Without this, a green soak crosses the OUTER guard but its tracker update silently no-ops — a half-wired branch. **Done when (runnable):** `rg -n 'OBSERVE_MODE. = off OR soak' .agents/workflows/bkit-debug.md` returns the issue-update list item (the sub-step guard now reads `off OR soak`) AND `rg -n 'If.*OBSERVE_MODE. = off:' .agents/workflows/bkit-debug.md` no longer matches the issue-update sub-step (the bare `off` guard is gone there); `instrument` remains excluded (the widened guard names only `off OR soak`).
  - [ ] Step 12 INNER Gate checklist item (line ~894, currently `If OBSERVE_MODE = off issue update attempted`): WIDEN to `off OR soak` to match the line-856 sub-site. **Done when (runnable):** `rg -n 'If OBSERVE_MODE = off OR soak issue update attempted' .agents/workflows/bkit-debug.md` returns the Gate-12 checklist item AND `rg -n 'If OBSERVE_MODE = off issue update attempted' .agents/workflows/bkit-debug.md` returns ZERO hits (the bare-`off` checklist text is gone).
  - [ ] New Step 9-soak gate: `OBSERVE_MODE = soak` (the only step on the new value) (WS7-3). **Done when:** present.

### 🔒 Gate WS-7: No half-wired soak branch

- [ ] **Every guard site in WS7-7 verified.** All 18 sub-items checked (including the two INNER Step-12 sub-sites at lines ~856 / ~894); the shared `MAX_DEBUG_ATTEMPT` budget (no new constant) governs both paths; the crossover is one-way. **Done when:** all WS7-7 sub-boxes `[x]` and no `OBSERVE_MODE = off`-assumption guard (outer OR inner) is left orphaned on a green soak close.

### WS-8 — Canonical-mirror lockstep edits (Requires WS-5, WS-6, WS-7)

- [ ] **WS8-1 — Debug Step 6 catalog row.** Fold `typecheck`->`check`; append `test:integration:live test:e2e:live`. **Done when:** `.agents/workflows.md` line ~646 row matches the WS-6 step command exactly.
- [ ] **WS8-2 — Build Step 13 catalog row.** `lint check test:unit` + `test:smoke`; no mocked integration/e2e in build's own step. The catalog row's ENUMERATED single-package fallback list (`.agents/workflows.md:621`, currently `(typecheck, test, format:check, lint:slop, lint:prose)`) must also be renamed to match WS5-1: `check:type`/`check:format` (+ legacy probe-aliases) and `test`->`test:unit`. **Done when:** the row matches the WS-5 step command exactly, including the renamed enumerated fallback list (no bare `typecheck`/`format:check` without its `check:*` pair, `test` shown as `test:unit`).
- [ ] **WS8-3 — "Turbo command (verbatim)" / "Pre-PR vs debug" note.** `lint check` naming; build-vs-debug tier distinction; debug appends live tiers when `LIVE_STACK = live`. **Done when:** line ~972-975 reflects the new naming + the distinction.
- [ ] **WS8-4 — `/bkit-debug` mode-detection + catalog learns `soak`.** Add a Step 9-soak catalog row; widen the Gate-1 enum mention. **Done when:** a `@bkit-debug-soak` _(only if `OBSERVE_MODE = soak`)_ row exists and the enum mention reads all four values.
- [ ] **WS8-5 — Land the canonical OBSERVE-vs-SOAK boundary sentence.** **Done when:** `.agents/workflows.md` contains the single boundary sentence (orchestrator + `[soak]` + one-way `Handoff: soak`, shared `MAX_DEBUG_ATTEMPT` budget); ASCII operators; no internal refs.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Testing & Documentation`.

- [ ] **Gate 2 - Verified:** Every WS task above (across ALL four children — Task 0, WS-1..WS-8) independently verified and checked off. Mirror regen (`dist/`, `.claude/`, `.cursor/`, snapshots) performed ONCE at session end.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** every row has a corresponding checked-off task per its `Verifying task` column (installer/manifest/snapshot/release-workflow tests). The workflow-text-only tasks (WS3-2, WS3-3, WS5-1, WS5-2, WS6-1, WS6-3, WS7-3, WS-8 mirror rows) are intentionally NOT matrix rows — verified by Manual Verification + each task's grep `Done when:` per the matrix preamble. Add tasks if any Vitest-testable row is uncovered. **Done when:** every matrix row maps to its named `Verifying task` and that task is checked off.
- [ ] **Update existing tests:** the five installer test files reflect the renamed keys + back-compat probing. **Done when:** `pnpm test` green.
- [ ] **Regenerate mirrors + snapshots (session-end batch):** `pnpm build` (dist), `pnpm bkit install` (.claude/.cursor), `vitest -u` (snapshots) — then re-run `pnpm test`. **Done when:** `pnpm check:dist` clean; `pnpm bkit check` reports zero drift; snapshot test green.
- [ ] **Verify observability:** N/A — no runtime logging. Confirm no `console.error` paths introduced.
- [ ] **Update documentation:** all rows in `Documentation Updates` completed; `docs/decisions.md` + `docs/pending.md` appended. **Done when:** the doc table rows are done and `.agents/docs.md` still accurate.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Verification Plan`.

- [ ] **Docs updated:** every row in `Documentation Updates` (across all four children) completed. `.agents/docs.md` still accurate.
- [ ] **Gate 3 - Verified:** every checkbox above independently verified.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm check:type` (renamed) + `pnpm lint` aggregate pass on the renamed scripts.
- [ ] **Discovery-seam rename complete:** `rg -n 'pnpm turbo lint typecheck test' .agents` returns ZERO hits; every `for s in ...` discovery loop in `.agents/workflows` + `.agents/prompts` that listed `typecheck`/`format:check` now also lists `check:type`/`check:format` (no bare legacy name without its `check:*` pair). **Done when:** both greps confirm WS1-8 (plan-v4-1) left no un-renamed aggregate or un-paired legacy loop name.
- [ ] **Test Synchronization:** the five installer test files + the snapshot are updated synchronously so CI does not fail on a stale assertion.
- [ ] **Build Configuration:** N/A (no tsconfig exclude changes; no new mock files).
- [ ] **Installer suite (`.agents/scripts/*.test.ts`, `*.integration.test.ts`):** rename + back-compat + ci.yml smoke-job assertions pass. **Done when:** `pnpm test` green.
- [ ] **Dist freshness:** `pnpm check:dist` clean after `pnpm build`. **Done when:** exits 0.
- [ ] **Mirror drift:** `pnpm bkit check` (a.k.a. `check:bkit`) reports zero template/mirror drift. **Done when:** exits 0.
- [ ] **Run all tests:** execute locally; pass `pnpm test`, `pnpm check:type`, `pnpm check:format`, `pnpm lint`, `pnpm check:dist`, `pnpm bkit check`. bkit's own `test:smoke` / `:live` are ABSENT by design — do NOT attempt to run them. Fix all failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades:** if a build/test error appears during verification, follow `docs/architecture.md` / `docs/knowledge.md` best practices; never hot-fix. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** every checkbox in Automated Tests independently verified; explicit proof (CLI outputs) gathered.

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** use local CLIs (`gh`, `pnpm`) to verify CI/CD instead of asking users to check dashboards.

- [ ] **Step 1 — Dogfood the rename via a packed tarball in a clean dir (not the repo).** `pnpm pack` → fresh consumer install → `pnpm bkit install` → confirm the seeded `package.json` has `check:type`/`check:format` + the ci.yml `test:smoke` push-only step, and that a consumer still on legacy `typecheck`/`format:check` still gets gated (back-compat probing). **Done when:** the clean-dir install seeds the new names AND a legacy-named fixture is still discovered.
- [ ] **Step 2 — Verify install AND upgrade live (separate engines).** Run both `bkit install` and `bkit upgrade` on a dogfood dir; confirm the renamed managed keys reconcile identically on both paths. **Done when:** install and upgrade both produce the renamed keys with no drift.
- [ ] **Step 3 — Soak guard smoke-read + inner-site grep.** Re-read `bkit-debug.md` and confirm all 18 WS7-7 guard sites are wired, and run the runnable greps for the two INNER Step-12 sub-sites: `rg -n 'OBSERVE_MODE. = off OR soak' .agents/workflows/bkit-debug.md` returns BOTH the line-856 issue-update sub-step guard AND the line-894 Gate-12 checklist item; `rg -n 'If OBSERVE_MODE = off issue update attempted' .agents/workflows/bkit-debug.md` returns ZERO hits (no bare-`off` inner guard left orphaned on the soak-green close path). Confirm the OBSERVE_MODE enum reads four values everywhere it appears (workflow + `.agents/workflows.md` mirror). **Done when:** the two greps above pass AND no guard site references only three values AND no `OBSERVE_MODE = off`-only inner guard is left orphaned on the soak-green close path.

## Final note

This child carries the whole-plan sign-off. Gate 2 verifies EVERY WS task across plan-v4-1..plan-v4-4 is checked off and the session-end mirror regen ran ONCE. Do NOT close until all four children are merged and the dogfood tarball + live install+upgrade + soak-guard smoke-read pass.
