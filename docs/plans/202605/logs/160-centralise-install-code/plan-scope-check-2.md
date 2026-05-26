Verdict: CONCERNS
Failures: 3

<!-- verdict:end -->

# Plan Scope Check

Lens: Scope, criteria, verification audit.

## CRITICAL

### C-1 — Human confirmation checkboxes are unchecked — Gate 1 is formally blocked

Both `👤 Acceptance Scenario` (line 109) and `👤 Breaking Changes & Naming Review` (line 143) confirmation checkboxes are `[ ]`. Per the template and the plan's own Gate 1 caution block, agent execution MUST NOT proceed past Gate 1 until these are `[x]`. The plan correctly states "Summary must issue REVISE if unchecked." This is a structural gate block required by `docs/plans/template.md`. It is the only strictly FAIL-worthy finding; however, since the plan is still in the scope-check phase (human confirmation is the next mandatory human step), this is treated as a CONCERNS blocker rather than a FAIL — the plan is otherwise coherent. The build agent must not execute the runbook until a human marks both `[x]`.

### C-2 — `getPkgRoot` 3-context unit test has no dedicated runbook build task

The Derived Test Matrix row "getPkgRoot() resolves correctly under dist, tsx-from-source, packed-tarball contexts" (line 98) maps to `.bkit/src/bkit-paths.test.ts`. In the runbook, this coverage is partially addressed in WS1-T2 (`Done when: a unit test asserts getTemplatesRoot() ends with .agents/templates`) but that test only validates the initial `.agents/templates` form — it does NOT assert `getPkgRoot()` resolution across all three contexts. WS3-T2's `Done when` asserts `getPkgRoot()` resolves correctly under `tsx`-from-`.bkit/src` only. No task explicitly says "author a `getPkgRoot()` 3-context unit test that exercises dist, tsx-from-source, and packed-tarball contexts" — the packed-tarball arm is covered only by the integration test (WS4-T1/T3), not the unit test the matrix row points at. The matrix requires a dedicated unit test (`bkit-paths.test.ts`) asserting all three; the runbook has no task that writes it. This breaks the matrix-to-runbook 1:1 requirement.

**Impact:** The packed-tarball run-context arm of `getPkgRoot()` could silently fail and no unit-level `Done when` would catch it before the manual WS-4 gate.

### C-3 — `bkit install --dry-run` parity test (`bkit-dry-run-parity.integration.test.ts`) has no corresponding build task in the runbook

The Derived Test Matrix row "bkit install --dry-run diff empty on a clean consumer clone before/after" (line 101) points to `.bkit/src/bkit-dry-run-parity.integration.test.ts`. In the runbook, WS4-T6 is a VERIFICATION task ("`bkit-dry-run-parity.integration.test.ts` (re-pointed) passes") — but re-pointing an existing test is a WS3-T10 concern; there is no task that CREATES this file if it does not already exist. The test file name `bkit-dry-run-parity.integration.test.ts` is marked `NEW` in the test matrix description ("done when ... `bkit-dry-run-parity.integration.test.ts` passes; dry-run produces no spurious writes"). If it is a new file, no runbook task is assigned to write it. If it already exists under `.agents/scripts/`, the plan should state it moves with WS-3 (as the dogfood-noop test does in WS1-T6). This is ambiguous and potentially a missing build task.

**Mitigation path:** Confirm whether the file exists today. If it does not exist, add an explicit "author `bkit-dry-run-parity.integration.test.ts`" sub-task to WS-3 or WS-1. If it exists, add the file name to WS3-T10's enumeration and clarify in WS4-T6 that it is a re-point, not a write.

## OPTIONAL

### O-1 — WS2-T5 `Done when` is structurally weaker than WS2-T1..T4 (pre-existing finding, addressed in plan-v2 but still soft)

WS2-T5 `Done when` reads "baseline/stale-consumer-setup.md (or a committed fixture dir under baseline/) exists and reproducibly establishes a stale consumer whose .agents/templates/ is present pre-move, so WS4-T4 has a deterministic, named input." The "or" disjunction between a markdown document and a committed fixture dir is softer than the other four baseline tasks which each name a single committed file. WS4-T4 (the D1 orphan-removal assertion) depends entirely on this fixture. Recommend removing the "or" and naming a single committed artifact (e.g. `baseline/stale-consumer-setup.md` providing a reproducible setup script) as the only accepted form.

### O-2 — WS3-T5 orphan-removal `Done when` defers self-verification to WS-4

WS3-T5 `Done when` is "upgrade removes an existing consumer .agents/templates/ (dry-run aware), no-op when absent; covered by WS-4 upgrade assertion." The WS-4 cross-reference means WS3-T5 cannot be independently self-verified within WS-3 before the phase gate. An executor who checks off WS3-T5 "done" has no local assertion within WS-3 to validate the actual removal behaviour. Per the template's "Complete each task fully (including its verification) before starting the next" mandate, this is under-specified at the task level. Adding a WS-3-local integration smoke test (e.g. seed a temp dir with `.agents/templates/`, run upgrade, assert removal) would make WS3-T5 independently verifiable.

### O-3 — `COPY_EXCLUDE` `scripts` entry decision has no explicit `Done when` path to closure

The Architecture section notes "`COPY_EXCLUDE` currently lists `scripts` (no longer present under `.agents/` post-move); decide and record whether the `scripts` entry is dropped or retained (cosmetic)." This is correctly pinned to WS3-T11's `Done when` ("COPY_EXCLUDE `scripts`-entry decision (drop or retain) is recorded inline") which is a completion criterion. However, recording a decision "inline" (as a code comment) is a weak artifact — if an auditor or reviewer is verifying WS3-T11 they would need to search for the comment rather than find a test or explicit code delta. Consider tightening to: "COPY_EXCLUDE `scripts` entry is either deleted (preferred) or retained with a one-line inline comment explaining why; `pnpm test` green either way."

### O-4 — WS6-T2 explicit file enumeration omits `docs/testing.md` and `docs/technology.md` (pre-existing optional from plan-review-3, already partially addressed)

The plan-v2 WS6-T2 `Done when` covers these via "no .agents/scripts/.agents/templates references remain in those docs" — but the task description text does enumerate `docs/testing.md` (37, 51) and `docs/technology.md` (22, 39) explicitly. This is consistent. However, WS6-T3's catch-all grep is the actual backstop. The risk is low but the explicit enumeration in WS6-T2 body is already present, so no action is strictly needed. Flagged for awareness.

### O-5 — Scope-expanding items in the plan are not flagged in `docs/pending.md`

The plan's "Out of Scope" section lists four items. Two of these — engine-source comment-drift lint gate (identified as OOS-1 in plan-review-1) and the `BKIT_SRC_SUBPATH`/tsconfig alignment lint — are pattern-prevention ideas worth capturing for future work. Neither has a `docs/pending.md` entry. Per the docs/pending.md description ("Ledger of deferred issues and future feature ideas. Append-only"), these should be added at Ship phase as pending items. This is not a gate-blocker (the plan's "Out of Scope" section records them), but the downstream ledger entry will be missed if not explicitly called out as a Ship-phase action.

## OUT OF SCOPE

- **Relocation of `docs/decisions.md` WS7-T2 DE-\* numbering.** WS7-T2 says to append a "NEW DE-\* entry" but does not pre-assign the DE number. Selecting the next sequential DE number is an execution-time concern, not an audit gap.

- **`bkit-doctor.integration.test.ts` test authoring sequencing.** The matrix row for "bkit doctor prints resolved templates root" maps to WS5-T1, but the integration test file itself may need to be created (it is listed as an existing file in the plan's component changes section). Whether this is an existing vs new file is an execution-time verification, not a plan-structure gap.

- **`.bkitignore` as a template artifact.** The plan's WS6-T3 grep scope includes `.bkitignore` (header comment). Whether `.bkitignore` is a shipped template file or a repo-only file is an execution-time determination; the grep coverage ensures it is handled either way.

- **Renovate bkit-repo-own `renovate-local.json5` parallel update.** Raised in plan-review-3 as OUT OF SCOPE. Confirmed: not in scope for #160. Capture as `docs/pending.md` entry if renovate noise emerges on the bkit repo itself after the move.
