Verdict: PASS

<!-- verdict:end -->

# Build-Readiness Summary — #203: CI Green != Validated

## Overview

This plan delivers a backport of the proven gether #403 "CI simplification" 4-job scaffold into bkit. The three-layer fix (Layer 1: scaffold into template + bkit's own `.github/workflows/ci.yml`; Layer 2: simplify ship/debug gates to read a single capstone check; Layer 3: one-bullet rules norm) ensures that "CI green" and "validated" no longer conflate — a partial run is green-by-construction but is not validation. The plan is structured as a SPLIT into two sub-plans (Sub-Plan 1: Phases A+B, 13 tasks covering CI scaffold + protection-script rename; Sub-Plan 2: Phases C+D+E+F, 18 tasks covering Layer-2 gates + rules + tests + docs + final mirror/dist batch), with a hard dependency: Sub-Plan 1 must commit before Sub-Plan 2 begins.

## Plan Quality

**Well-scoped:** Yes. The plan precisely mirrors the issue body's three-layer architecture and the user's PRIMARY STEER (2026-06-02): copy gether's ci.yml near-verbatim into the template, parameterize consumer-specific VALUES only (branch names, URLs, secret names), NOT stub whole tiers. The template's target archetype IS the gether stack (Next.js / Vercel / Supabase / turbo monorepo), so high-fidelity copy is appropriate. The plan explicitly reflects this priority and supersedes the earlier "generalize the SHAPE" framing.

**Dependencies clear:** Yes. Sub-Plan 1 establishes the foundation — both ci.yml files carry `bkit-tests-check`, the protection script is renamed to `bkit-protect-main.sh`, and the postinstall source is patched. Sub-Plan 2 then builds on that foundation: Layer-2 gates reference the capstone by name, Layer-2 tests assert the gate text exists, and Phase F rebuilds `dist/` to include the postinstall changes. The cross-plan dependency is explicit, loud-fail guarded (Task B4 pre-flight grep checks for capstone existence before running the protection-script dry-run), and sequenced.

**Gates correct:** Yes. Four gates span both sub-plans: Gate 1 (human confirmation of Acceptance Scenario + Breaking Changes) blocks entry to BOTH sub-plans; Gates 2–3 are sub-plan-specific code/test/verification checks. The Acceptance Scenario is fully specified (Narrative, Success Criteria, Concrete Example, Edge Cases, Derived Test Matrix with 22 rows mapped lossless to 31 runbook tasks), and Breaking Changes are explicit (3 breaking, 2 new, 3 behavioural — all with migration impact noted).

## Completeness

**Plan-level scope covered:** Yes. All three layers are included:

- Layer 1 (Sub-Plan 1): the 4-job scaffold in `.bkit/templates/.github/workflows/ci.yml` (copied near-verbatim per PRIMARY STEER), the degenerate 3-job scaffold in bkit's own `.github/workflows/ci.yml` (no `bkit-tests-live`, preserving SHA-cache + `[skip ci]` semantics), the protection-script rename (`bkit-set-protection.sh` → `bkit-protect-main.sh`), and the postinstall source patch.
- Layer 2 (Sub-Plan 2): `.bkit/workflows/bkit-ship.md` Gates 2+12 and `.bkit/workflows/bkit-debug.md` Step 3 rewritten via MCP to assert `bkit-tests-check == success` on the PR's full run; skipped/neutral/cancelled/missing all treated as non-green (closes the root-cause bug class).
- Layer 3 (Sub-Plan 2): one-bullet norm in `.agents/rules.md` + template mirror under Git/CI/Merges — "Green != ran != validated."

**Testing adequate:** Yes. Phase E (Sub-Plan 2, 10 tasks) includes:

- Snapshot regeneration + mandatory human-diff review (Task A5, Sub-Plan 1) — high-fidelity assurance the new shape is intentional.
- Extend 4 existing test files + create 2 new test files (`bkit-ship-workflow.test.ts`, `bkit-protect-main.test.ts` or extension).
- Bug-class regression coverage (4 explicit Vitest scenarios: `bkit-tests-check` with conclusion `cancelled` / `skipped` / `neutral` / missing — each must be treated as non-green). This directly closes the #203 root-cause class.
- Fixture upgrade (`tests/fixtures/heavy-customised-ci/`) with precise bare-marker contract preservation (the fixture MUST retain its `# bkit:start` / `# bkit:end` markers so downstream tests pass; the template's no-bare-marker guard remains scoped to `.bkit/templates/**`).
- Actionlint + `actionlint -shellcheck=shellcheck` (Task A3a) for shell-logic validation.

**Docs planned:** Yes. Sub-Plan 2 includes (Tasks E7–E10):

- `docs/pending.md` quick-path entry updated (protection-script name + required job).
- `docs/deployments.md` (×2, engine + template) updated with 4-job vocabulary + reference to `bkit-protect-main.sh`.
- `docs/knowledge.md` + `docs/decisions.md` new entries (capstone-gated CI principle + naming decision rationale).
- `CHANGELOG.md` new version entry (Added / Changed / Migration notes).

## Acceptance Scenario

The full Acceptance Scenario (Narrative, Success Criteria, Concrete Example, Edge Cases, Derived Test Matrix) is specified in the parent plan index [`plan-v4-split.md`](./plan-v4-split.md#-acceptance-scenario-human-review-required).

**Narrative:** As a bkit consumer or maintainer, when CI reports a run green, the capstone job `bkit-tests-check` asserts every tier the plan said should run did run and passed. When a partial run skips expensive tiers by design, the capstone reflects that — and the ship/debug agents refuse to call it "validated" until they see `bkit-tests-check == success` on the PR's full run.

**Success Criteria:** `bkit-tests-check` exists in both ci.yml files with the 5-rule logic; is the sole required status check in `bkit-protect-main.sh`; Layer-2 gates assert it explicitly; `.agents/rules.md` carries the "Green != ran != validated" norm; all tests green; fixtures upgraded with bare-marker preservation preserved.

**Adherence to template:** The Acceptance Scenario adheres to `docs/plans/template.md` § Acceptance Scenario spec. It specifies testable, measurable success criteria (5 bullets with grep/exit-code/job-name verifiability); concrete edge cases cover partial runs, API errors, step-name contracts, and fixture marker collisions; and the Derived Test Matrix maps all 22 test rows lossless to the 31 runbook tasks with no orphans.

## Breaking Changes

- **New job names in shipped `ci.yml`:** `bkit-decide`, `bkit-tests-live`, `bkit-tests-check` (alongside existing `bkit-tests`). Capstone is `bkit-tests-check` (NOT `bkit-gate` — settled per #203 comment 2). Tier-3 seed-or-print: consumers ship it once; bkit never rewrites.
- **Protection script rename:** `scripts/ci/bkit-set-protection.sh` → `scripts/ci/bkit-protect-main.sh` (via `git mv` in both engine + template). Existing consumer copies (Tier-3) stay old; postinstall advisory flags the rename.
- **`REQUIRED_JOB` flip:** `"bkit-tests"` → `"bkit-tests-check"` inside the protection script. Consumers must re-apply the script (or hand-flip the required check).
- **Ship/debug gate behavioural change:** Layer-2 gates now assert `bkit-tests-check == success` on the PR's full run (not `statusCheckRollup` "any failures"). Consumers whose ci.yml does not yet ship the capstone will see ship gates refuse to declare validated — that is correct.
- **Postinstall advisory wording:** "Quick path" text + "Require status checks" line updated to reference `bkit-protect-main.sh` and `bkit-tests-check`.

All breaking changes are documented, have migration paths noted, and are gated by the human Acceptance Scenario confirmation checkbox.

## Design Alignment

The plan's Acceptance Scenario Narrative and Success Criteria match the canonical reference (gether #403's proven implementation, read from `/Users/christian/Documents/GitHub/app-gether-life/docs/plans/202605/403-ci-simplification-design.md`) verbatim:

- `bkit-decide` (front job: computes plan, emits plan JSON) feeds `bkit-tests-check` (back job: asserts every tier the plan said should run actually ran+passed).
- Plan JSON is the shared contract.
- Two-layer precedence (whether / how-much) + auto-escalate via `GET /commits/{sha}/pulls` on direct dev push.
- `bkit-tests-check` is the SOLE required check.

The plan's scope is the subset of gether #403 applicable to bkit: the template gets the full 4-job scaffold (gether applies this to consumers); bkit's own ci.yml degenerates to 3 jobs (no E2E/Vercel/live since bkit has no deploy); Layer-2 gates + Layer-3 norm are bkit-internal logic. The plan does NOT include gether's parity-matrix (executable validation that the PR's plan matches the run's actual tiers) — that is deferred per #209 scope.

## Risks

1. **Snapshot regeneration complexity (Task A5, Sub-Plan 1):** A ~1100-line ci.yml rewrite produces a ~1100-line snapshot diff. Mandatory human-review of the diff is the gate; false-positive risk is low (the diff is structural, not heuristic), but requires careful eyeball work.

2. **`detectRunLevelsNotComposed` step-name contract (Tasks A2b, A3b, Sub-Plan 1):** `.bkit/src/bkit-postinstall.ts` L713 keys its advisory off the literal step name `"Detect Direct Push"`. The plan retains this name in both ci.yml files (compat alias inside `bkit-decide`), but if the name is accidentally changed, the detector silent-fails (test suite will catch it, but requires running `pnpm test -- bkit-postinstall` with `--reporter=verbose` to confirm the 11 detector tests all pass).

3. **Bare-marker collision in `heavy-customised-ci` fixture (Task E5, Sub-Plan 2):** The fixture MUST preserve its bare `# bkit:start` / `# bkit:end` markers around the `Install Dependencies` block (required by downstream tests `bkit-modules.upgrade.integration.test.ts` L294-319). The template's no-bare-marker guard (`.bkit/src/bkit-templates.test.ts` L146-150) only scans `.bkit/templates/**`, so the fixture's bare markers do NOT violate the guard. However, any manual fixture upgrade must preserve both the markers AND the `consumer-job:` block byte-identical, AND upgrade the job shape to the new 4-job structure — a multi-constraint write with high per-error recovery cost.

4. **MCP-only constraint enforcement (Tasks C1, C3, Sub-Plan 2):** Layer-2 gate rewrites MUST use MCP (GitHub-MCP) equivalents for status-check + workflow-job reads, not `gh pr view` / `gh run view` CLI calls. The plan explicitly forbids NEW `gh` invocations in `.bkit/workflows/*.md`. The test in Task E2 (`bkit-ship-workflow.test.ts`) MUST include a `git diff` check asserting ZERO new `gh ` / `gh api ` / `curl ` lines introduced. Risk: executor accidentally introduces a `gh` call and the test either (a) doesn't catch it or (b) catches it but the fix requires re-reading the MCP toolset docs.

5. **Template copy fidelity (Task A2, Sub-Plan 1):** The instruction to copy gether's ci.yml "near-verbatim" is high-fidelity but subjective. The plan specifies parameterization targets (`{{DEFAULT_BRANCH}}`, URLs, secret names) and lists which tiers ship CANONICAL vs STUB. However, gether's ci.yml (~1100 lines) has consumer-specific paths (e.g. `apps/web` workspace, Vercel org/project IDs, Supabase regions). The executor must read the PRIMARY STEER carefully and the gether reference ci.yml at least once before copying. Risk: over-parameterizing or under-parameterizing (shipping consumer-specific literals instead of placeholders). Mitigation: the snapshot diff (Task A5) and the Vitest template-content tests (Task E1) will expose this.

6. **Layer-2 gate wording must reference capstone explicitly (Tasks C1–C3, Sub-Plan 2):** The plan's success hinges on the language "assert `bkit-tests-check == success`" being exact and non-ambiguous. A gate that reads "check `bkit-tests-check` and also check other job names for extra coverage" silently reintroduces the old bug. The test in Task E2 MUST grep for the exact wording in the gate text. Risk: low (template is close enough to gether's working proof), but requires careful review at Gate 2.

## Action Items

All critical findings from the review → apply cycle have been resolved:

- **Review CONCERNS → Applied:**
  - C1 (PRIMARY STEER copy-fidelity): The revised plan-v4 family explicitly states in Sub-Plan 1 Task A2 that the template ci.yml is copied "near-verbatim per PRIMARY STEER," parameterizing only VALUES. The task's Done-when asserts the `Run Live Tests` step is present un-commented (NOT a stub). Verified in plan-scope-check row for A2.
  - C2 (MCP-only constraint expansion): The revised plan explicitly forbids NEW `gh` invocations in Layer-2 gates (Tasks C1, C3 text states "use MCP … DO NOT introduce a new `gh` invocation"). Sub-Plan 2 Task E2 (`bkit-ship-workflow.test.ts`) includes a test that greps the diff for zero new `gh ` / `gh api ` / `curl ` lines.
  - C3 (testable Done-when criteria): All Done-when lines revised to pinned grep counts or named commands (plan-scope-check auditor confirms all 31 tasks have deterministic, codebase-verifiable checks).

- **Scope CONCERNS → Applied:**
  - Scope-check-1 (latent ordering trap, Task B4 precondition): The revised plan explicitly documents a loud-fail guard: Task B4 ("bkit-protect-main.sh --dry-run") has a precondition grep that asserts `bkit-tests-check:` exists in `.github/workflows/ci.yml` BEFORE running the dry-run. If the grep returns 0, the task outputs an explicit ABORT message and instructs the executor to complete Task A3 first.
  - Scope-check-2 (snapshot drift + test extension timing): Tasks A5 and E1 are sequenced: A5 (snapshot regen) in Sub-Plan 1 Phase A; E1 (content test extension) in Sub-Plan 2 Phase E. The snapshot is regenerated against the current test set (pre-extension) in A5, ensuring the snapshot captures the new shape. The extended test set in E1 then asserts the new 4-job structure + capstone shape + tier outputs.

- **Complexity SPLIT → Applied:**
  - The plan is split lossless into Sub-Plan 1 (13 tasks, Phases A+B) and Sub-Plan 2 (18 tasks, Phases C+D+E+F) with a hard cross-plan dependency (Sub-Plan 1 committed before Sub-Plan 2 begins). No task is orphaned or duplicated.

All review feedback is incorporated in the final plan artifact (`plan-v4-split.md`, `plan-v4-1.md`, `plan-v4-2.md`). The verdict trail shows: plan-review CONCERNS → plan-apply-review PASS; plan-scope-check CONCERNS (ordering trap + snapshot timing) → plan-apply-scope PASS; plan-complexity-check SPLIT → plan-complexity-split PASS. The workflow status log confirms all review/check/split steps completed successfully (status.jsonl lines 5–10, all PASS or SPLIT verdicts with no FAIL).

## Recommended Next Step

**For the human reviewer:**

1. **Read the parent plan index** ([`plan-v4-split.md`](./plan-v4-split.md)) to confirm scope, the cross-sub-plan dependency, and the shared Acceptance Scenario + Breaking Changes tables.
2. **Confirm the two human-gated checkboxes** at the top of the parent index:
   - Acceptance Scenario confirmed (`[x]`).
   - Breaking Changes confirmed (`[x]`).
3. **Execute Sub-Plan 1 first** (`/bkit-build` against `plan-v4-1.md`). This lands the CI scaffold (both ci.yml files) and the protection-script rename. DO NOT run Sub-Plan 2 until Sub-Plan 1 is committed.
4. **Execute Sub-Plan 2 after Sub-Plan 1 commit** (`/bkit-build` against `plan-v4-2.md`). This rewrites the Layer-2 gates, adds the Layer-3 norm, extends tests, upgrades the fixture, and regenerates mirrors + dist.

The two sub-plans are independent in terms of CI triggers (each can be built in separate workflow runs if needed), but sequentially dependent on commits (Sub-Plan 1 commit must land before Sub-Plan 2's first task runs).
