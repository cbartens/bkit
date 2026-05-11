Verdict: SINGLE

<!-- verdict:end -->

# Plan Complexity Check

## Counts

**Tasks:** 44 total runbook tasks

- Phase A: 9 tasks (A1–A9) — source artifacts and orchestrator files
- Phase B: 4 tasks (B1–B4) — installer module wiring
- Phase C: 18 tasks (C1a–C9g) — test coverage (all Derived Test Matrix rows)
- Phase D: 7 tasks (D1–D7) — documentation
- Phase E: 3 tasks (E1–E3) — mirror regen and bkit-repo checks

**Gates:** 4 gates

- Gate 1: Prerequisites Check (human-confirmed Acceptance Scenario + Breaking Changes)
- Gate 2: Code Implementation Check
- Gate 3: Testing and Documentation Check
- Gate 4: Automated Verification Confirmed

**Domain areas covered:** 3

- Installer/CLI (bkit-modules.ts, bkit-cli.ts, TypeScript test suite)
- GHA Workflow / YAML (new trigger workflow + template)
- Documentation (workflows.md, docs.md, decisions.md, knowledge.md, deployments.md, pending.md, prompts.md)

## Session Fit Estimate

**File reads required:** ~15 files (5 existing orchestrators for Path A edits, bkit-modules.ts, bkit-cli.ts, 6 test files to extend, 2 doc files for verification)

**Files to create:** 3 (bkit-ci-router.md, bkit-ci-router.yml dogfood, bkit-ci-router.yml template)

**Files to modify:** ~18 (5 orchestrators, bkit-modules.ts, bkit-cli.ts, 6 test files, workflows.md, docs.md, templates/docs.md, prompts.md, knowledge.md, deployments.md)

**Token estimate breakdown:**

- Plan read + docs.md: ~15K tokens
- Reading 15 existing files for context: ~25K tokens
- Writing 3 new files (orchestrator md is largest at ~4K tokens, 2 YAML files): ~8K tokens
- Editing 18 existing files (targeted edits, not full rewrites): ~25K tokens
- Test authoring (18 new test cases across 6 files, mostly small assertions): ~15K tokens
- Verification commands output and gate checks: ~5K tokens

**Total estimated: ~93K tokens** — within the 100K threshold.

## Rationale

The plan fits a single session. Although it has 44 tasks across 5 phases, the individual tasks are highly focused and mechanical:

- The 5 orchestrator edits (A4–A8) are identical one-line additions to each Step 1 body — low per-file token cost.
- The 18 test tasks (Phase C) are predominantly small `assert`/`grep` assertions added to existing test files, not new test infrastructure.
- The 3 new files are well-specified in the plan: the two YAML files are byte-identical (under 50 lines each) and the orchestrator markdown has a defined 7-step skeleton.
- Documentation edits (Phase D) are verify-or-append operations, several of which are verification-only (D4, D7 confirm existing entries; no writes needed).
- No new dependencies, no DB migrations, no UI surface, no multi-repo coordination.
- The installer changes (Phase B) follow the existing `runCiModule` pattern exactly — the plan provides the full implementation shape.

The plan is additive throughout (no existing artifact replaced), which keeps diffs narrow. All 4 domains (installer, GHA YAML, orchestrator markdown, docs) are handled within the same codebase with no external API calls required during implementation. The session token budget is comfortably within the 100K threshold.
