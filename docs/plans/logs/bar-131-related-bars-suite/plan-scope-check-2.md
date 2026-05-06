Verdict: CONCERNS
Failures: 4
<!-- verdict:end -->

## Findings

### Critical (must-fix before Step 7)

- **[vitest-config]** `vitest.config.ts` include glob is `.agents/scripts/**/*.test.ts` only — `*.integration.test.ts` files are NOT matched. Every integration test file (`bkit-doctor.integration.test.ts`, `bkit-uninstall.surgical.integration.test.ts`, `bkit-bkitignore.integration.test.ts`, `bkit-install.integration.test.ts`, `bkit-modules.upgrade.integration.test.ts`, `bkit-upgrade.integration.test.ts`) will be silently skipped by `pnpm vitest run`. The plan's Verification Plan item "Add new `*.integration.test.ts` files to vitest config glob if not auto-discovered" is advisory-only and buried; a concrete P1.T0-adjacent task must extend the include glob to `["*.test.ts", "*.integration.test.ts"]` BEFORE any integration test is authored. Current gate commands all invoke `pnpm vitest run` which will silently pass with zero integration tests executed — a false green.

- **[P4-shippability]** Phase 4 is declared "independently shippable" in the phase index, but P4.T1 explicitly `Depends on P3.T3` (`writeTier2Json`). Phase 4 cannot merge without Phase 3 merged first. The cross-phase dep note covers only P2→P1; P4→P3 is undocumented in that note. Fix: add P4→P3 dependency to the Cross-phase dep note and remove "independently shippable" language for Phase 4, or split the Phase 4 staging work into a sub-phase that has no P3 dependency.

- **[P3-gate-fixture]** Phase 3 Gate and Manual Verification Step 3 reference "gether/fraser-coast fixture" as a mandatory pass criterion, but no runbook task creates, commits, or specifies the shape of this fixture. P3.T9 creates an in-code upgrade-survival regression test but does not mention gether/fraser-coast by name. Without a task that defines and commits the fixture, the gate has no actionable pass criterion. Fix: add a P3.T9a task that scaffolds a committed `fixtures/gether-shaped/` directory (or equivalent) and explicitly names it in the gate command.

- **[bkit-tier1-defaults-test-matrix]** `bkit-tier1-defaults.ts` (P3.T6a) has a corresponding test `bkit-tier1-defaults.test.ts` in the Phase 3 architecture table but NO row in the Derived Test Matrix. The matrix says "each row → one Agent Execution Runbook task" — the converse must also hold: every test file produced by a task must have a matrix row. Without a matrix row, the test file has no formal acceptance criterion and no 1:1 runbook mapping. Fix: add a row `"Versioned-defaults snapshot equality vs git-history JSON | Unit (Vitest) | .agents/scripts/bkit-tier1-defaults.test.ts"` to the Derived Test Matrix, and map it to P3.T6a in the runbook.

### Concerns (recommended)

- **[P3-rollback-error-handling]** The rollback table states that reverting Phase 3 templates causes `writeTier2Json` to error with "missing `__bkit__` envelope", but no task defines or implements that error message or guard. If `writeTier2Json` silently corrupts rather than loudly errors on a missing envelope, rollback degrades to silent data loss. Recommend adding an explicit acceptance criterion to P3.T3: `writeTier2Json` must throw (not swallow) when the `__bkit__` envelope is absent, and add a unit test case for this path in `bkit-tiers.test.ts`.

- **[P2.T11-per-key-feature-flag]** The `.bkitignore` per-key feature (`BKIT_BKITIGNORE_PER_KEY=1`) is spec'd in P2.T11 and listed in the test matrix as a single row (`".bkitignore` parser (pure)"). There is no separate matrix row for the per-key path, meaning the env-var-gated branch has no dedicated test assertion in the matrix. If the env var is not set during test runs the per-key path is never exercised. Recommend a second matrix row or an explicit fixture in `bkit-bkitignore.test.ts` that sets the env var and asserts per-key matching, with `afterEach` cleanup.

- **[P3.T7-safety]** P3.T7 retires `detectHooksConfigOverwriteRisk` (DELETE in Supersession Inventory). The plan says it may be "repurposed to assert `__bkit__` present post-install" as an alternative. The two options (delete vs repurpose) are left open in the runbook task. This ambiguity will cause implementation drift. Recommend resolving the decision in P3.T1a (the contract spec task) and updating P3.T7 with a single, unambiguous action.

- **[P4.T8-action-path]** The composite action is placed at `.github/actions/setup-auth/action.yml` (producer repo). The template update references `uses: cbartens/bkit/.github/actions/setup-auth@v1`. For this `uses` reference to resolve, the action must be in the published bkit repo at that path at tag `v1`. No task creates the `v1` git tag, and the Supersession Inventory RETAIN-WITH-REASON entry mentions "kill-date v1.1.0" but the plan's Merge Method says squash-per-phase — there is no explicit tagging step in P4. Recommend adding a P4.T8 sub-step: "Create and push `v1` tag pointing to the Phase 4 squash commit" with the specific `gh` command.

- **[pending.md-unassigned]** The plan says "plan summariser MUST append OOS items to `docs/pending.md` after plan approval." There is no runbook task for this. If the plan summariser role is not invoked, the OOS items (factory-reset uninstall, pnpm-lock cleanup, per-key `.bkitignore`, three-way merge UI, `bkit init`, npm-registry distribution) are never formally ledgered. Recommend adding an explicit task (e.g., P1.T0a or post-Gate-4) that appends these entries to `docs/pending.md`, or confirm the plan-summariser workflow handles it automatically and cite the workflow name.

### Nits (optional)

- **[matrix-1:1-wording]** The Derived Test Matrix header says "Each row → one Agent Execution Runbook task" but several rows map to the same target file and are bundled into one task (e.g., three rows map to `bkit-tiers.test.ts` and all land in P3.T1/T2/T3). This is implementation-efficient but violates the stated 1:1 rule. Consider rewording to "Each row → at least one runbook task" to avoid confusion for the executing agent.

- **[P2.T6-flag-list]** The `--module <name>` removal is documented inline in the task description but not reflected in the Acceptance Scenario Edge Cases table or the Breaking Changes section. Removing a flag is a user-visible contract change. While not a semver-major break (the flag never shipped), noting it in Breaking Changes (or at minimum in the Concrete Example steps) would make the contract surface complete.

- **[effort-tags-phase-only]** The plan uses phase-level effort tags (S/M/L) in the phase index but has no per-task effort tags. Tasks like P3.T6a (extracting git-history JSON for multiple versions) and P4.T5 (full diff engine) are individually L-effort within L-phases. No action required, but per-task tags would help the executing agent time-box.
