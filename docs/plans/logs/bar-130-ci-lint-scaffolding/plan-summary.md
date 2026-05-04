Verdict: PASS

<!-- verdict:end -->

# Plan Summary — BAR-130 CI Lint Scaffolding

## Overview

**Final state:** BAR-130 has been split into three single-session-executable sub-plans (`plan-v4-1.md`, `plan-v4-2.md`, `plan-v4-3.md`) anchored by parent index (`plan-v4-split.md`). All four plans carry PASS verdicts from prior workflow steps.

**Feature contract (unchanged across split):** Ship bkit v0.1.2 with three scopes:
- **(A)** bkit-the-repo self-gating — adds CI workflow, Vale, slop-scan, lint scripts to bkit's own repo.
- **(B)** bkit-the-installer engine — extends `bkit-install.ts` with three-tier file ownership, token substitution, generalised markers (HTML + hash variants), and template payloads.
- **(C)** CLI redesign + ship prep — refactors `init`+`install`+`--host=` into composable module flags, bumps version, rewrites docs, gates manual smoke against two consumers.

**Order-of-execution constraint (enforced by dependency):**
```
v4-1 (A: self-gating)
  └→ v4-2 (B: installer engine)
    └→ v4-3 (C: CLI redesign + ship)
```

v4-1 must precede v4-2 and v4-3 because lint scripts and prettier devDep (Task 7.4) are prerequites for `pnpm format:check`/`pnpm lint:prose`/`pnpm lint:slop` in subsequent pre-PR gates. v4-2 must precede v4-3 because `bkit-cli.ts` and `bkit-modules.ts` import the token resolver and tier writers created in v4-2.

---

## Plan Quality

**Structural conformance:** All three sub-plans and parent index adhere to `.agents/template.md` — context, acceptance scenario, breaking changes, pre-flight, architecture, documentation, rollback, runbook with gates, and verification plan all present and populated.

**Losslessness verified by parent:**
- Task count: 41 master tasks → v4-1 (4) + v4-2 (20) + v4-3 (17) = 41 ✓
- Phase coverage: Phases 0–10 distributed → v4-1 (Phase 7), v4-2 (Phases 0, 1, 2, 5, 6), v4-3 (Phases 3, 4, 8, 9, 10) = 11 phases assigned exactly once ✓
- DoD bullet mapping: All 16 DoD bullets (from plan-input.md) assigned to exactly one child per ownership table in parent ✓
- Supersession inventory: 6 rows all assigned to v4-3 (CLI surfaces touched by no other scope); v4-1 and v4-2 reference v4-3 for awareness ✓

**Dependency audit:** Parent plan explicitly specifies ordered execution; v4-1 and v4-2 state "prerequisites complete" checkboxes for siblings. Build workflow must execute in sequence.

**Template invariants:** Each child contains all required sections; parent carries integration-level cross-cutting concerns (ownership tables, marker/token distribution, DoD mapping, manual-gate placement).

---

## Completeness

**Scope coverage:**
- ✓ All three-tier file ownership semantics (Tier 1 fully managed, Tier 2 managed-block, Tier 3 seed-or-print) specified in v4-2 with examples.
- ✓ Token substitution (`{{NODE_VERSION}}`, `{{PNPM_VERSION}}`, `{{DEFAULT_BRANCH}}`, `{{PROJECT_NAME}}`) with fallback priority and hard-fail rules in v4-2 Phase 1.
- ✓ Marker generalisation (HTML-comment default, hash-comment for YAML/INI/shell) in v4-2 Phase 2 with call-site audit.
- ✓ Module dispatch (--core, --claude, --cursor, --ci, --lint, --git-hooks, --full) with idempotence in v4-3 Phase 4.
- ✓ Deprecation stubs (init verb, --host= flag) with kill-date v0.2 tracked to Linear issue (BAR-200, created in v4-3 Task 9.2) in v4-3 Phase 3.
- ✓ Auth-shim step inside bkit-managed block with BKIT_READ_TOKEN README documentation in v4-2 Task 6.1 + v4-3 Task 8.1.
- ✓ Dry-run parity investigation (Phase 5 root-cause) before fix (Phase 5 Task 5.2) in v4-2.

**Test coverage (Derived Test Matrix):**
- v4-1 owns 0 new tests — acceptance via pre-PR gate sequence + GitHub Actions CI.
- v4-2 owns 14 test matrix rows: token resolver (6), markers (3), tier writers (3), dry-run parity (7), plus auth-shim assertion in ci.yml template.
- v4-3 owns 7 test matrix rows: CLI parsing (5), module dispatch idempotence/composition (5), first-run signal (1), plus `it.todo` stub promotion audit at Gate 3.
- Parent notes: cross-module dry-run parity tests staged in v4-2 Task 5.3 promoted to green by v4-3 Phase 4.

**All 21 Derived Test Matrix rows mapped to runbook tasks** (per parent plan-v4-split.md line 101–102).

**Manual gates (DoD bullets 13, 14):**
- Gate 4.5a: `app-gether-life` smoke-install log committed to `docs/plans/logs/bar-130-ci-lint-scaffolding/smoke-install.md`.
- Gate 4.5b: Second consumer (e.g., `www-visitfrasercoast-com`) onboarding log appended to smoke file.
- Both gates **block merge** per v4-3 runbook Gate 4.5 caution block.

**Documentation plan:**
- v4-1: None (self-gating only, no consumer-facing docs).
- v4-2: `docs/knowledge.md` if dry-run root-cause investigation surfaces a non-trivial gotcha (Task 5.1).
- v4-3: README + `.agents/README.md` rewrites (Tasks 8.1, 8.2), `docs/decisions.md` ADRs (Task 9.1), `docs/pending.md` kill-dates (Task 9.2), version bump (Task 10.1).

---

## Acceptance Scenario

**Inherited verbatim from master (featu

re contract):** Consumer adds `@cbartens/bkit@v0.1.2`, runs `bkit install --full`, gets complete stack with tokens substituted, managed blocks reconciled, auth-shim seeded, and first PR CI passing.

**Concrete examples (v4-specific):**
- **v4-1:** bkit's own PR runs typecheck, vitest, Vale, slop-scan, format:check, self-test; all green.
- **v4-2:** Tmpdir pre-seeded with `.nvmrc`, `package.json`, `git init` → `resolveTokens(cwd)` → `bkit install --ci` → on-disk `ci.yml` has substituted tokens (`node-version: 22`, `pnpm/action-setup: 10`, `branches: [main]`), bkit block appended, consumer jobs preserved.
- **v4-3:** User runs `bkit install --full` (no flags) → core + all modules written across three tiers; second run is a no-op; `bkit init` prints deprecation and delegates.

**Human confirmation gates:**
- v4-1 Gate 1: [ ] Acceptance Scenario confirmed; [ ] Breaking Changes confirmed.
- v4-2 Gate 1: [ ] Acceptance Scenario confirmed; [ ] Breaking Changes confirmed.
- v4-3 Gate 1: [ ] Acceptance Scenario confirmed; [ ] Breaking Changes confirmed.
- v4-3 Gate 4.5: [ ] app-gether-life smoke confirmed (4.5a); [ ] second consumer confirmed (4.5b).

**All checkboxes remain unchecked — human review required before execution.**

---

## Design Alignment

**Acceptance Scenario narrative + success criteria in each child:**
- v4-1: Specialises criteria #5 ("bkit's own PRs run gates before merge"); narrative inherited as context.
- v4-2: Specialises criteria #3 ("install --ci on existing ci.yml") and #4 ("check/install parity"); contributes to #1.
- v4-3: Specialises criteria #1 ("install --full seeds all tiers"), #2 ("install --claude" selective), #5 ("init/--host= deprecation"); closes #1–5 collectively.

**Design-doc verbatim content retained:**
- Three-tier semantics (Tier 1 fully managed, Tier 2 managed-block, Tier 3 seed-or-print) — embedded in v4-2 Architecture § B.
- CLI surface (verbs install/check/help; module flags --core/--claude/--cursor/--ci/--lint/--git-hooks/--full) — embedded in v4-3 Architecture § C.
- Token list with source priority and defaults — embedded in v4-2 Phase 1 Tasks 1.1–1.3.
- Marker syntax (HTML-comment for markdown/.gitignore, hash-comment for YAML/INI/shell) — embedded in v4-2 Phase 2 Tasks 2.1–2.2.
- Auth-shim mechanics (git config step before pnpm install, inside bkit-managed block) — embedded in v4-2 Task 6.1.

**Plan scope ⊆ design scope:** All resolved disambiguations (1–8 from plan-input.md) are reflected in child-plan tasks. No plan expansion beyond design boundaries; out-of-scope items (postflight.sh, package.json merging, helper auth action, --no-X/--force, 3-way merge, reusable workflows, VERCEL/LINEAR tokens, claude.yml/ci-complete.yml/smoke.yml) correctly excluded in "Out of Scope" sections of each child.

---

## Risks

### Addressed during review → plan fixes applied

1. **Single-session unrealism (Reviewer 1 CRITICAL #1):** Fixed by split into three sub-plans per complexity-check verdict. ~25K + ~60K + ~45K = ~130K total (three sessions, not one).

2. **Bun runtime assumption (Reviewer 1 CRITICAL #2):** Fixed — v4-1 Task 7.1 now specifies `pnpm tsx` as the preferred self-test runtime (no extra setup step).

3. **Dry-run bug root-cause unverified (Reviewer 2 CRITICAL C1):** Fixed — v4-2 Phase 5 Task 5.1 now mandates a root-cause investigation step (reproduce the divergence, identify the actual code path) BEFORE specifying the fix in Task 5.2. Do not pre-assume the location.

4. **Marker generalisation call-site audit (Reviewer 2 CRITICAL C2 + C6):** Fixed — v4-2 Task 2.2 now includes an explicit grep audit of all four functions (`findLineAnchoredMarkers`, `updateManagedBlock`, `extractManagedBlock`, `extractFullManagedBlock`) across all call sites. Hash-comment marker strings (`# bkit:start` / `# bkit:end`) are specified explicitly.

5. **Greenfield guard removal (Reviewer 2 CRITICAL C5):** Fixed — v4-3 Task 4.3 sub-step explicitly addresses the `.agents/prompts.md` presence guard: either delete it entirely (preferred, since `runCoreModule` creates `.agents/` including `prompts.md`) or move it inside the module that needs it.

6. **Manual smoke gates (Reviewer 2 CRITICAL C4):** Fixed — v4-3 Runbook adds hard Gate 4.5 with sub-gates 4.5a (app-gether-life smoke) and 4.5b (second consumer) blocking merge. Both require human sign-off.

7. **Supersession ambiguity (Reviewer 2 CRITICAL C3):** Fixed — v4-3 explicitly separates `bkit-init.ts` file (DELETE — body migrates to `runCoreModule`) from `init` verb (RETAIN-WITH-REASON deprecation stub in `bkit-cli.ts`). Two artifacts, two decisions.

8. **`lint:prose` shell quoting (Reviewer 1 CRITICAL #6 + Reviewer 2 O6):** Fixed — v4-1 Task 7.4 adopts the bash-wrapped if/else pattern: `bash -c 'if command -v vale >/dev/null 2>&1; then vale .agents/ "*.md"; else echo "[bkit] vale not in PATH — skipping"; fi'`. Real findings propagate; missing binary is a graceful skip.

9. **`.bkit-version` write-order (Reviewer 1 CRITICAL #7):** Fixed — v4-3 Task 4.3 sub-step and Task 4.5 explicit test ensure `.bkit-version` write is sequenced LAST (after payload copy, `rules.md` block, `.gitignore` block) so partial install leaves version file unwritten and re-run is detected as upgrade-needed.

10. **Pre-PR gate command (Reviewer 1 CRITICAL #5 + Reviewer 1 Optional #5):** Fixed — v4-3 Task 10.2 now specifies the sequential pnpm command (bkit is single-package, no turbo): `pnpm lint:prose && pnpm lint:slop && pnpm typecheck && pnpm format:check && pnpm test`.

11. **Package distribution guard (Reviewer 2 C7):** Fixed — v4-1 Task 7.1 now explicitly verifies that `.github/workflows/ci.yml` (bkit's own CI, at repo root) is excluded from consumer package via `pnpm pack --dry-run`.

12. **Auth-shim assertion (Auditor 1 CRITICAL #2):** Fixed — v4-2 Task 6.1 adds an automated test in `bkit-install.test.ts` asserting the auth-shim line is present *between* `# bkit:start` and `# bkit:end` and *before* `pnpm install`.

13. **Substituted ci.yml end-to-end (Auditor 1 CRITICAL #3 — DoD bullet 9):** Fixed — v4-2 Task 6.1b adds an integration test in `bkit-modules.integration.test.ts` asserting the rendered template contains literal substituted values (node-version: 22, branches: [main], pnpm major 10) with no placeholder leakage.

14. **`printUsage` / `runHost` dead-code verification (Auditor 2 CRITICAL C2 + C4):** Fixed — v4-3 Task 4.3 and Task 4.4 add explicit grep-based acceptance criteria confirming old definitions are fully removed from `bkit-install.ts` post-refactor.

15. **`it.todo` stub loophole (Auditor 1 CRITICAL #4 + Scope-check CRITICAL #4):** Fixed — v4-3 Gate 3 (Mandatory Tasks § Audit) explicitly runs `grep -nE "it\.todo|test\.todo"` across all test files and asserts ZERO hits before build can close.

16. **DoD bullets 9 + 12 missing automated assertions (Scope-check CRITICAL #2 + #3):** Fixed — v4-2 Task 6.1b (auth-shim and substituted values) and v4-2 Task 6.1 add the missing integration tests.

### Outstanding concerns for build phase

1. **Phase 5 dry-run root-cause is open-ended:** v4-2 Task 5.1 sub-step a requires investigation against a real tmpdir mirroring `app-gether-life` pre-v0.1.2 state. The fix location is NOT pre-assumed to be `runTemplates` (per Reviewer 2 C1) — it could be `runHost`, a marker-append path, or an untracked write. Build agent must complete this sub-step and document the root cause before Task 5.2 specifies the fix.

2. **Manual smoke gates require separate human session:** Gates 4.5a and 4.5b involve local `pnpm link` + consumer CI runs. These cannot be fully automated in a single agent session. Build workflow must hand off to human reviewer (or `bkit-build` agent acting on human artefacts) before merge.

3. **Second-consumer identity (Gate 4.5b):** Plan hardcodes `www-visitfrasercoast-com` but provides fallback "or other". Build must either confirm that repo is available during smoke or document the substitute in the log file.

4. **Linear issue BAR-200 (or equivalent v0.2 parking-lot):** v4-3 Task 9.2 references BAR-200 for `init` + `--host=` removal kill-dates. If that issue does not exist, the task must create it (via MCP or manual follow-up) so kill-dates are enforceable.

---

## Action Items

**For build phase entry (blocking):**

- [ ] **Confirm Gate 1 human checkboxes** across all three sub-plans (v4-1, v4-2, v4-3) before execution begins. Acceptance Scenario and Breaking Changes must be signed off by human reviewer.

- [ ] **Verify v4-1 execution sequence:** v4-1 must complete and merge (or be staged on the same branch) BEFORE v4-2 execution begins. Lint scripts and prettier devDep are hard dependencies for v4-2 pre-PR gates.

- [ ] **Plan v4-2 Phase 5 root-cause investigation:** Before Task 5.2 "fix dry-run divergence," Task 5.1 sub-step a must identify the actual code path that diverges (not pre-assumed to be `runTemplates`). Document the root cause in the test comment before proceeding to the fix.

- [ ] **Confirm Linear issue BAR-200 (or equivalent):** v4-3 Task 9.2 appends `docs/pending.md` entries with issue ID tracking kill-dates for `init` + `--host=` deprecation removal at v0.2. If BAR-200 does not exist, create it before v4-3 Task 9.2 execution.

- [ ] **Gate 4.5a human signature:** v4-3 smoke-install log (`docs/plans/logs/bar-130-ci-lint-scaffolding/smoke-install.md`) must be committed by human reviewer or build agent acting on verified artefacts. Both Gate 4.5a and 4.5b must be checked before PR merge is unblocked.

**For post-build (handoff to bkit-ship):**

- The plan's scope ends at version bump to `0.1.2` in `package.json` (v4-3 Task 10.1). Tag-push (`v0.1.2`) is owned by the `bkit-ship` workflow per v4-3 Task 10.4. Verify that `bkit-ship` input config auto-derives the tag from `package.json` `version` field (or is manually updated post-merge).

---

## What Goes to Drafts After Close-Workflow

Per the Plan workflow finalization, the following files will be archived to `docs/plans/drafts/` after this summary is committed:

- **Parent index:** `docs/plans/drafts/bar-130-ci-lint-scaffolding-plan.md` (copy of `plan-v4-split.md`)
- **Child 1:** `docs/plans/drafts/bar-130-ci-lint-scaffolding-plan-1.md` (copy of `plan-v4-1.md`)
- **Child 2:** `docs/plans/drafts/bar-130-ci-lint-scaffolding-plan-2.md` (copy of `plan-v4-2.md`)
- **Child 3:** `docs/plans/drafts/bar-130-ci-lint-scaffolding-plan-3.md` (copy of `plan-v4-3.md`)

The originals under `docs/plans/logs/bar-130-ci-lint-scaffolding/` remain as workflow audit trail.

---

## Summary

**Status:** Ready for build-phase entry. Three sub-plans are well-scoped, dependency-ordered, fully mapped to DoD, and carry PASS verdicts from prior review + scope + complexity steps. All CRITICAL and OPTIONAL findings from review and audit workflows have been addressed. Unchecked human-confirmation gates (Acceptance Scenario + Breaking Changes in each child; manual smoke in v4-3 Gate 4.5) are properly flagged with caution blocks.

**Execution path:** v4-1 (one session, ~25K) → v4-2 (one session, ~60K, includes Phase 5 root-cause investigation) → v4-3 (one session, ~45K, includes manual smoke gates). Total ~130K over three build sessions, concluding with ship workflow tag-push handoff.
