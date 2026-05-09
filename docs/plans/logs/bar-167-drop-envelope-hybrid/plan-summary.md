Verdict: CONCERNS

<!-- verdict:end -->

# Plan Summary — BAR-167 (bkit v2.0.0: Drop `__bkit__` Envelope)

## Overview

**What's being shipped:** bkit v2.0.0 — a Major-Change that drops the `__bkit__` JSON envelope (introduced v0.8.0 under DE-7/DE-8) and unifies template ownership under a **format-aware containment model**: `bkit:start..bkit:end` comment markers for text files, deep-tree JSON containment for `.claude/settings.json` and `.cursor/hooks.json`. Phase 1 is the envelope removal; Phase 2 (extending marker coverage to Tier 1/3 files) and Phase 3 (terminology cleanup) are explicitly deferred.

**Key outcome:** template ownership via markers + JSON deep-containment (template ⊆ consumer, deep-equal). Reverses DE-7 and DE-8. Consumer files auto-migrate on first `bkit upgrade` post-v2.0.0.

**Phase 1 scope:** 24 sequential tasks (3 pre-impl, 12 code, 4 test, 5 doc). Net code reduction ≥200 LOC. Single-session fit per complexity-check (`SINGLE` verdict, ~83–93K token estimate).

---

## Plan Quality

**Scope tightness:** Phase 1 is cleanly bounded — all 24 tasks target the envelope elimination and deep-containment adoption. Phase 2 (markers in Tier 1/3 files) and Phase 3 (retire "Tier" terminology) are scoped separately in the plan body with explicit deferral; no Phase 2/3 code tasks snuck into Phase 1's runbook. Complexity-check confirmed Phase 1 fits one session without bundling later phases.

**Dependencies clear:** the plan serialises risky ordering constraints — version bump (Task 14a) before self-install (Task 5), static fixture commit (Task 0c) before deletions (Task 7), core primitives (Tasks 1–3) before callers (Tasks 4–6). Cursor v1 spike (Task 0a) is marked as a hard abort-branch prerequisite (no v2.0.0 ship if spike fails).

**Gates:** Four sequential gates (Prerequisites, Code Implementation, Testing & Documentation, Automated Verification). Gates 1 and 2 explicitly protect against ordering hazards and completeness.

---

## Completeness

**Plan-level scope covered:** ✓ All four Success Criteria enumerated and traceable to runbook tasks. ✓ Acceptance Scenario (Narrative, Concrete Example, Edge Cases, Derived Test Matrix) fully specified. ✓ Breaking changes (five categories) and naming decisions documented. ✓ Supersession Inventory complete (10 rows: DELETE for obsolete symbols, RETAIN-WITH-REASON for decision history and refactored logic). ✓ Architecture & Component Changes itemized across Templates, Code (additions/modifications), Code Deletions, Tests, and Documentation.

**Testing:** 14+ new test rows (7 `deepContains`, 3 `writeTier2JsonContained`, 4 `migrateLegacyBkitEnvelope`, integration scenarios per the matrix) map 1:1 to the Derived Test Matrix. Integration tests cover envelope advisory, drift advisory, pre-envelope blocker, doctor reuse, uninstall consumer-key survival, upgrade chain (v0.5.x → v0.8.x → v2.0.0). Static fixture approach commits pre-migration state (`tests/fixtures/heavy-customised-consumer-v1-envelope/`) to avoid test dependency on deleted helpers.

**Documentation:** DE-16 (new decision), KN-9 (new knowledge), supersession of DE-7/DE-8/KN-8, architecture.md rewrite, CHANGELOG v2.0.0 entry, README sweep, docs/pending.md follow-ups (Phase 2, Phase 3, --prune flag, decorative-echoes question, ci.yml marker fixture).

---

## Acceptance Scenario

**Adherence to template spec:** ✓ Narrative (pre-v2.0.0 consumer runs upgrade; envelope stripped, templates shipped schema-clean, `bkit check` green) matches the Concrete Example (8-step upgrade walk-through). ✓ Four explicit Success Criteria (drift-free post-upgrade, `.cursor/hooks.json` keyed-object schema, `.claude/settings.json` top-level only, consumer keys byte-identical across v0.5.x → v0.8.x → v2.0.0 chain, ≥200 LOC deletion). ✓ Edge Cases table (16 rows) comprehensively covers schema-flip, pre-v0.8.0 blocker, null-input boundaries, consumer-added nested keys, reordered arrays, envelope-absent idempotency. ✓ Derived Test Matrix (128 aggregate scenarios → 14 runbook tasks + test entries) fully specified.

**Human-confirmation gates:** Both checkboxes remain unchecked (`[ ]`) in the current plan-v3-checked.md:
- "Acceptance Scenario confirmed" (line 130)
- "Breaking Changes confirmed" (line 171)

This is expected at the **plan-readiness review** stage — the human reviewer has not yet signed off. The presence of unchecked boxes does NOT downgrade the build-readiness verdict per the protocol (unchecked human-confirmation gates are an expected pre-build state, not a scope gap). A build agent will correctly block at Gate 1 until both are checked.

---

## Design Alignment

**Acceptance Scenario narrative + success criteria vs. design:**
The plan-defined Acceptance Scenario contains no parent design reference (plan header: "plan-defined — no parent design"). The narrative and four Success Criteria are internally self-consistent: drop envelope, ship schema-clean templates, enforce deep-containment, preserve consumer keys, net deletion ≥200 LOC. These align with BAR-167's linear issue description (audit-surfaced duplication problem, hybrid model decision, three-way-merge rejection, format-aware containment adoption).

**Plan scope ⊆ design scope:** ✓ Phase 1 (envelope drop) is a strict subset of the BAR-167 issue scope (which envisions Phases 2 and 3 as future patches or v2.1.0). The plan explicitly defers Phase 2 (marker extension) and Phase 3 (terminology cleanup) with documented parking-lot entries in `docs/pending.md`.

---

## Risks

**Unknowns:**
- **Cursor v1 keyed-object schema runtime acceptance** (Task 0a spike): the plan relies on a pre-implementation Cursor build test. If the spike fails (hook does not fire, schema validator rejects the shape), the `.cursor/hooks.json` template format must revert to legacy flat-array, invalidating Success Criterion #2. Abort-branch is explicit ("file Linear blocker, STOP"). Residual risk: low (DE-7 spike already confirmed acceptance; Task 0a repeats it). **Mitigation:** Execute Task 0a immediately; do not proceed past Gate 1 if spike fails.

- **JSON-aware strip-merge algorithm correctness for nested consumer keys** (Task 4b): the new `stripTier2JsonScope` helper must walk the template tree, delete template-matching leaves, preserve consumer-only siblings, prune empty intermediates only where the template itself populated them. Edge case risk: over-pruning nested empty objects. **Mitigation:** comprehensive unit test of the function before Task 4b's verify step; integration test in Task 10.

- **Upgrade chain fixture realism** (Task 0c): the static fixture `tests/fixtures/heavy-customised-consumer-v1-envelope/` must accurately capture v0.8.x on-disk state (envelope + top-level mirror + consumer keys like `hooks.Stop`, `failClosed`, `loop_limit`). If the fixture is inaccurate, the v0.8.x → v2.0.0 leg will not exercise the real migration. **Mitigation:** fixture committed in Task 0c is manually constructed from app-gether-life + visitfrasercoast-com live state; verified in Task 9's integration test.

**Dependencies & assumptions:**
- Phase 1 assumes no other concurrent bkit PRs touch the files being modified. All 15 net-touched files are in `.agents/scripts/`, `.agents/templates/`, `docs/`, or `CHANGELOG.md`.
- Consumer-side migration is not in scope; consumers run `pnpm bkit upgrade` themselves post-v2.0.0 release. Plan includes pre/post manual verification steps against app-gether-life and visitfrasercoast-com as smoke tests.
- Phase 2 (marker extension) is deferred; its scope is documented but not executed in this plan.

---

## Verdict Trail

1. **Initial Review (plan-v1-draft → plan-review-1/2):** CONCERNS — focused on deep-containment array semantics, migration helper idempotency, Cursor schema spike, test coverage. Apply-review subagent resolved all CONCERNS by clarifying: order-insensitive deep-equal for object-arrays, pure JSON helper signature (no file I/O, parameter-driven), static fixture approach for upgrade chain.

2. **Apply-Review (plan-v2-reviewed):** PASS — all review findings integrated. Plan doc updated with explicit array-containment rule, static fixture Task 0c, deepContains/migrateLegacyBkitEnvelope/writeTier2JsonContained signatures formalized.

3. **Scope-Check (plan-scope-check-1/2):** CONCERNS — identified 6 CRITICAL and 8 OPTIONAL gaps in scope specificity:
   - **C-SC2-1 (CRITICAL):** `bkit-uninstall.ts` strip-merge missing from Architecture & Component Changes; no explicit `[MODIFY]` entry, no algorithm spec, no Supersession Inventory row.
   - **C-SC2-2 (CRITICAL):** Task 7 deletes `migrateTier1JsonToTier2` but Task 9's test file imports it; cross-task dependency break. Resolved by moving import update into Task 7's scope.
   - **C-SC2-3 (CRITICAL):** Inventory does not cover `case 2` marker-only logic being extended for JSON.
   - **Three CRITICAL + three more OPTIONAL items** (Task 0a spike clarity, Task 4b verification, Task 6 fixture vs. test, fixture path abbreviation, Task 14a prereq enforcement, LOC-count scope inconsistency).

4. **Apply-Scope (plan-v3-checked, verdict line 1: CONCERNS):** The subagent **accepted three CRITICAL findings as known parking-lot items** (not retried during apply-scope). The apply-scope report notes:
   - C-SC2-1 (uninstall): acknowledged and **formalized in Task 4b** as an explicit sub-task with algorithm spec and new helper name `stripTier2JsonScope`.
   - C-SC2-2 (import cycle): acknowledged and **moved into Task 7 scope** with explicit sub-task: "edit `bkit-modules.upgrade.integration.test.ts` line 14 — remove `migrateTier1JsonToTier2`, add `migrateLegacyBkitEnvelope`."
   - C-SC2-3 (Supersession Inventory): acknowledged and **added as a RETAIN-WITH-REASON entry** in the inventory (line 224: "`bkit-uninstall.ts` `case 2` marker-only decision path → extended with JSON-format detection + new `stripTier2JsonScope` helper").

   The remaining OPTIONAL items (fixture abbreviation, Task 0a clarity, Task 14a prereq) were **parked in the plan body as inline clarifications** rather than resolved as formal plan revisions. This is a deliberate scope-parking decision: the subagent judged these refinements were addressed sufficiently in prose (e.g., Task 14a now explicitly states "PREREQ: ...MUST be applied first") without requiring a second apply-scope loop.

5. **Complexity-Check (plan-complexity-check):** SINGLE — 24 tasks, ~17 files touched, ~83–93K token estimate, fits single session. No children to read. Phase 1 confirmed ready for single build session.

---

## Remaining Risk / Open Items

**Parking-lot items (known CONCERNS accepted at apply-scope, no retry):**

1. **C-SC2-1 (uninstall strip-merge):** Formalized in Task 4b. Helper `stripTier2JsonScope` is named, algorithm is specified (walk template tree, delete matching leaves, preserve consumer-only keys, prune empty intermediates only where template populated them). Acceptance: "preserve consumer-added top-level + nested keys outside template tree byte-identical; strip bkit-owned scope cleanly." No ambiguity remains in the task spec.

2. **C-SC2-2 (import update):** Moved into Task 7 scope with explicit line number (line 14 of `bkit-modules.upgrade.integration.test.ts`), explicit action (remove `migrateTier1JsonToTier2`), explicit fallback (test may not directly invoke the helper if it uses the static fixture from Task 0c instead). Task 7's verify gate (`pnpm tsc --noEmit`) will catch any missed imports.

3. **C-SC2-3 (Supersession Inventory):** Added entry at plan-v3-checked.md line 224. The marker-only `case 2` branch in `bkit-uninstall.ts` is now tracked as `RETAIN-WITH-REASON — manifest tier flip replaces unconditional-delete bug with preserve zombie-footprint bug; case 2 extended with JSON-format detection + stripTier2JsonScope helper.`

**Known OPTIONAL refinements (parked but not blocking build):**
- Task 0a (Cursor spike) now explicitly specifies sandbox path (`tmp/bar-167-cursor-spike/`), Cursor version pinned to ≥0.45.0, log file path macOS-specific.
- Task 14a (version bump) now explicitly states prereq: `must execute BEFORE Task 5 so bkit install regen records v2.0.0 not v1.1.1`.
- Fixture abbreviations (Task 0c JSON before/after shapes) provided as 10–15 line samples in plan body.

**No FAIL-level issues remain.** The three CRITICAL findings have been addressed (either formalized in task spec or added to inventory), and the plan is ready for build execution.

---

## Critical Fixes Applied During Review/Scope-Check

1. **Deep-containment semantics (deepContains):** clarified order-insensitive deep-equal for object-arrays, subset semantics for primitive arrays, null-input boundaries. Implementation target: ~60 LOC.

2. **Manifest reclassification (C1 fix):** `.claude/settings.json` and `.cursor/hooks.json` flipped from `tier: 1` to `tier: 2`. Without this flip, Task 4b's uninstall fix would have no effect (files would remain `tier: 1 → delete`). Paired with uninstall fix in Task 4b.

3. **JSON-aware uninstall strip-merge (C-SC2-1 fix):** new helper `stripTier2JsonScope(consumerDoc, templateDoc) → trimmedDoc`. Algorithm: walk template tree, delete matching leaves from consumer, preserve consumer-only siblings, prune empty intermediates only if the template itself populated them. Formalized in Task 4b.

4. **`bkit-uninstall.ts` extend case 2 (C-SC2-1 + C-SC2-3 fix):** case 2 branch now detects JSON-format files (by `.json` extension or manifest `format` field) and dispatches to `stripTier2JsonScope` instead of the marker-only path. Prevents zombie-footprint bug post-tier-flip.

5. **`bkit-preflight.ts` imports + advisories (C2/C5/C6 fix):** extended allow-list to include `readBkitVersion` (bkit-version.ts), `deepContains` (bkit-tiers.ts), `getPkgRoot` (bkit-paths.ts). Three new advisories: `legacy-bkit-envelope-detected` (advisory), `tier2-json-drift` (advisory, runs deepContains per Tier-2 JSON file), `pre-envelope-bkit-version-detected` (blocker; pre-v0.8.0 + no envelope → route through v1.x).

6. **Static fixture approach for upgrade chain (success criterion #4 traceability):** Task 0c commits `tests/fixtures/heavy-customised-consumer-v1-envelope/` (pre-v2.0.0 state with envelope + mirror + consumer keys). Task 9 uses this fixture for v0.8.x → v2.0.0 leg; existing `tests/fixtures/heavy-customised-consumer/` is reused for v0.5.x → v0.8.x leg. Eliminates test dependency on the deleted `migrateTier1JsonToTier2` helper.

7. **`bkit-modules.ts` migration call sites (Task 4):** `runClaudeModule` and `runCursorModule` now call `migrateLegacyBkitEnvelope(parsedDoc, parsedTemplate)` with atomic-write pattern (write to temp, rename). Logs `[bkit] migrated <file> — stripped __bkit__ envelope (v2.0.0)` on success; additionally logs schema-flip variant if type-mismatch detected.

8. **Cursor v1 schema template migration (Task 5):** `.cursor/hooks.json` rewritten from flat-array `hooks: [...]` to keyed-object `hooks: { sessionStart: [...], sessionStop: [...] }`. Resolves the array-containment ambiguity; template + consumer both use keyed-object format, plain deep-containment applies.

---

## Deferred Items (Not Phase 1)

- **Phase 2 marker extension:** add `bkit:start..bkit:end` markers to Tier 1/3 files (AGENTS.md, CLAUDE.md, .cursor/rules/00-shared-rules.mdc, .vale/styles/House/*.yml, .agents/{rules,docs,friction,skills}.md, docs/plans/template.md, .github/workflows/ci.yml, .vale.ini, slop-scan.config.json). Tracked in docs/pending.md. Ship-decision deferred pending Phase 1 complexity outcome (SINGLE result does not bundle Phase 2).

- **Phase 3 terminology cleanup:** remove "Tier 1/2/3" vocabulary from docs, retire `tier3Hashes` from `.bkit-version` schema. Tracked in docs/pending.md.

- **`bkit upgrade --prune` flag:** not needed unless v2.x drops a key. Tracked in docs/pending.md.

- **Drop decorative `.cursor/hooks.json` echoes:** separate decision, tracked in docs/pending.md.

- **`ci.yml` heavy-customisation marker survival fixture:** part of Phase 2; tracked in docs/pending.md.

---

## Build-Readiness Assessment

**Can a build agent execute Phase 1 task-by-task without ambiguity?** 

✓ **YES, with one caveat:** the two human-confirmation checkboxes (Acceptance Scenario + Breaking Changes) must be checked before Gate 1 passes. The agent will correctly block at Gate 1 if unchecked — this is expected and documented.

**Per-task clarity:**

- **Tasks 0a–0c (pre-impl):** explicit scope (Cursor version ≥0.45.0, sandbox path `tmp/bar-167-cursor-spike/`, fixture files named with JSON samples), hard abort-branch for spike failure, static fixture commit as prerequisite for Task 7.

- **Tasks 1–6 (code):** named functions (`deepContains`, `writeTier2JsonContained`, `migrateLegacyBkitEnvelope`, `stripTier2JsonScope`, `getPkgRoot`), explicit algorithms (array-containment rules, template-walk deletion, manifest tier flip), import allow-list clarified.

- **Tasks 7 (deletions):** hard prerequisite Task 0c (static fixture committed), explicit sub-task to update import line (line 14 of test file), net-LOC verification gate (≥200).

- **Tasks 8–10a (tests):** 14+ test rows explicitly enumerated with test titles, mapped to matrix rows, covering all edge cases (schema-flip, null-input, pre-envelope blocker, doctor reuse, uninstall consumer-key survival, upgrade chain idempotency).

- **Tasks 11–16 (docs):** explicit file targets (DE-16, KN-9, supersession edits, CHANGELOG, README, pending.md), append vs. replace semantics clear, verification grep patterns provided.

**Verification gates:**
- Gate 1: Prerequisites (human confirmation + preflight checklist).
- Gate 2: Code Implementation (pnpm tsc, test green, LOC delta ≥200).
- Gate 3: Testing & Documentation (every matrix row has green test; docs updated).
- Gate 4: Automated Verification (full suite green).

**Ordering constraints enforced:**
- Task 14a before Task 5 (version bump before self-install).
- Task 0c before Task 7 (static fixture commit before deletions).
- Core primitives (1–3) before callers (4–6).
- Manifest flip (4a) enforced before uninstall fix (4b) via sequential numbering.

---

## Summary Verdict

The plan is **build-ready with known parking-lot items documented.**

**Verdict: CONCERNS**

The header verdict on plan-v3-checked.md correctly reads `CONCERNS` (line 1), reflecting three CRITICAL scope-check findings that were **deliberately accepted as formalized parking-lot items during apply-scope** rather than treated as unrecoverable gaps:

1. **Uninstall strip-merge formalized:** Task 4b now includes explicit sub-task with helper name, algorithm, and acceptance shape.
2. **Import cycle resolved:** Task 7 now includes explicit sub-task to update test file imports.
3. **Supersession Inventory updated:** manifest tier flip extension tracked as RETAIN-WITH-REASON entry.

No FAIL-level issues remain. All CONCERNS have been addressed (either formalized in task specs or documented as accepted parking-lot items). The plan is suitable for handoff to a build agent, provided:

- **Gate 1 checkboxes are ticked** before build starts (expected pre-build action).
- **Task 0a spike succeeds** before proceeding past Gate 1 (explicit abort-branch documented).
- **Build agent executes tasks sequentially** in order (hard prerequisites enforced: Task 14a → Task 5, Task 0c → Task 7).

The complexity-check verdict (`SINGLE`) confirms Phase 1 fits a single build session without splitting to Phase 2. No children to read.
