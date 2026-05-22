Verdict: CONCERNS
Failures: 5

<!-- verdict:end -->

# Plan Scope Check

## CRITICAL

**C1 — Test matrix row 17 has no dedicated runbook task (matrix↔runbook gap)**

The Derived Test Matrix row "Output formatter renders `--- i/N [severity] id ---\nDETECT: ...\nACTION: ...` shape per issue body | Unit (Vitest) | `.agents/scripts/bkit-postinstall.test.ts`" has no explicitly named runbook task. Task A2 creates a stub and Task F4 wires detectors, but neither is named as the task that writes and snapshot-tests the `formatChecklist` output. The matrix requires 1:1 mapping to runbook tasks; this row is unmapped. Fix: add a dedicated task (e.g., Task F5) for implementing and snapshot-testing `formatChecklist` against the issue-body example, and point the matrix row to it.

**C2 — Edge case "zero advisories → no banner" has no test matrix row and no runbook task**

The Edge Cases table explicitly lists "Zero advisories overall → No checklist banner printed (only `Done. N write(s)`.)" as a required behavior. Neither the Derived Test Matrix nor the runbook contains a task or row asserting this. The `formatChecklist` snapshot test (row 17) only covers the positive N-findings case. A missing-banner assertion is required to prevent regressions. Fix: add one matrix row targeting `bkit-postinstall.test.ts` and a corresponding runbook subtask.

**C3 — Edge case "`bkit check` dry-run Phase 1 advisories rendered" has no automated test row**

The Architecture section and Edge Cases table specify that `bkit check` skips Phase 3 but still emits Phase 1 advisories via `formatChecklist(ctx.advisories)`. Manual Verification Step 4 covers this, but the Derived Test Matrix contains no row and the runbook contains no automated test task asserting that (a) Phase 3 detectors are absent from dry-run output and (b) Phase 1 advisories ARE present. This is an untested behavioral contract. Fix: add an integration test row targeting `bkit-install.integration.test.ts` and a corresponding runbook task in Phase G.

**C4 — Intra-phase duplicate id dedupe has no test row and no runbook task**

The Edge Cases table states "Same finding id appears more than once within a single phase → deduplicated within phase (defensive — modules may double-report)." Task F4 names inter-phase dedupe (Phase 3 wins) but says nothing about intra-phase deduplication. No test matrix row covers this path. Fix: add a unit test row targeting `bkit-postinstall.test.ts` or `bkit-preflight.test.ts` and a corresponding runbook subtask in Task F4 or a new Task F4b.

**C5 — `detectNpmrcAuth` "file absent → silent skip (unknown)" is not a test matrix row**

The Architecture section specifies: "unknown when `.npmrc` is absent → silent skip (no finding)." Task E3 mentions "four cases: positive, missing-one-line, missing-both-lines, file-absent" in the implementation description, but the Derived Test Matrix row for `npmrc-missing-gh-packages` only says "when `.npmrc` lacks both required lines." The file-absent silent-skip case is not a matrix row, so it has no guaranteed test. Fix: expand the matrix row or add a dedicated row capturing the "`.npmrc` absent → no finding emitted" assertion.

## OPTIONAL

**O1 — `detectVercelProject` guard path not explicitly tested**

Architecture states both `detectVercelEnv` calls are silently skipped when `detectVercelProject(cwd)` returns false. Task E4 specifies "three cases each" for mock `execSync` but does not mention the no-project short-circuit. A test asserting "no `vercel.json` → zero Vercel findings emitted" would prevent false-positive regressions when consumers lack a Vercel project.

**O2 — `bkit check` Phase 1 blocker path has no automated test**

Manual Verification Step 4 covers `bkit check` with an advisory-only scenario. The Edge Cases table includes "Phase 1 blocker fires in `bkit check` → same exit 1". An automated integration test row for this path would catch regressions without relying on manual verification only.

**O3 — `WriteEntry.devDepsAdded?: string[]` shape change not in Supersession Inventory**

Task F3 extends `WriteEntry` (existing type in `.agents/scripts/bkit-tiers.ts`) with an optional field. This is a type-level change to an existing artifact. It is not listed in the Supersession Inventory. The change is additive and optional (low breakage risk), but per the Supersession Inventory rules, modifications to existing artifacts that are replaced or extended should be noted. Adding a `RETAIN-WITH-REASON` or a note clarifying the extension-only nature of this change would make the inventory complete.

**O4 — Gate 1 human checkboxes are both unchecked**

Both "Acceptance Scenario confirmed" and "Breaking Changes confirmed" checkboxes remain `[ ]`. Per the plan's own caution blocks, Gate 1 must not be passed until both are `[x]`. The plan's Narrative and Success Criteria are also marked `⚠️ MISSING` (correct per the design-missing fallback rule). This is a process gate, not a structural defect, but execution will be blocked until human confirmation is recorded.

**O5 — Task B4 verification is manual-only; no automated regression for banner format parity**

Task B4's verification is "dry-run on bkit dogfood repo prints same banner format" — a manual step. If the formatter is later changed, the only assertion is the snapshot test in row 17. Explicitly noting in the Verification Plan that the `formatChecklist` snapshot test in `bkit-postinstall.test.ts` covers B4's format contract would make the automated coverage explicit and remove the manual-only dependency.

## OUT OF SCOPE

**S1 — `bkit doctor` standalone verb**

The Future Phase Recommendations mention a `bkit doctor` verb calling `runPreflight` + `runPostInstallCheck` without install. This is correctly out of scope for this plan and should remain deferred to a future issue.

**S2 — BAR-139 `bkit uninstall` reuse of `PreflightFinding` / `formatChecklist`**

The plan notes that BAR-139 can reuse the formatter. Defining the API surface to accommodate that reuse (e.g., exporting `formatChecklist` from a shared location rather than `bkit-postinstall.ts`) is out of scope here. The current plan exports it from `bkit-postinstall.ts` which is sufficient for BAR-141; the BAR-139 plan should handle any needed refactor.

**S3 — `--strict` mode promoting advisories to blockers**

Correctly excluded per Out of Scope section and Alternative Approaches table. No action required.
