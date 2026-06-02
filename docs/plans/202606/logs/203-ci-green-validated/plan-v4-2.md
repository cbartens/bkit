Verdict: PASS

<!-- verdict:end -->

# 203 — Sub-Plan 2 of 2: Layer-2 + Layer-3 + Tests + Docs + Final Mirror/Dist (Phases C + D + E + F)

**Parent Plan:** [`./plan-v4-split.md`](./plan-v4-split.md)
**Source plan (full):** [`./plan-v3-checked.md`](./plan-v3-checked.md)
**Predecessor (MUST be committed first):** [`./plan-v4-1.md`](./plan-v4-1.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

---

## 🛑 Hard Dependency on Sub-Plan 1

> [!CAUTION]
> **Sub-Plan 2 MUST NOT begin until Sub-Plan 1 is committed (Phases A + B complete).**
>
> Layer-2 ship/debug gates (Tasks C1/C2/C3) reference `bkit-tests-check` by name; the gate text without the job present in ci.yml ships a dangling reference. The Layer-2 tests (E2 — `bkit-ship-workflow.test.ts`) also assume the gate text exists.
>
> Sub-Plan 1 establishes these invariants Sub-Plan 2 depends on:
>
> 1. Both `.github/workflows/ci.yml` and `.bkit/templates/.github/workflows/ci.yml` contain a job named `bkit-tests-check`.
> 2. `scripts/ci/bkit-protect-main.sh` (and template mirror) exist; old `bkit-set-protection.sh` is gone.
> 3. `.bkit/src/bkit-postinstall.ts` source mentions `bkit-protect-main.sh` (`dist/` stale — Task F1 rebuilds it).
> 4. Full-file template snapshot is current with the 4-job shape.
>
> **Verification before starting Sub-Plan 2:**
>
> ```bash
> grep -c '^[[:space:]]*bkit-tests-check:[[:space:]]*$' .github/workflows/ci.yml          # must return >= 1
> grep -c '^[[:space:]]*bkit-tests-check:[[:space:]]*$' .bkit/templates/.github/workflows/ci.yml  # must return >= 1
> test -f scripts/ci/bkit-protect-main.sh                                                   # must exit 0
> test ! -f scripts/ci/bkit-set-protection.sh                                                # must exit 0
> grep -c "bkit-protect-main" .bkit/src/bkit-postinstall.ts                                  # must return 3
> ```
>
> If any check fails, STOP and complete Sub-Plan 1 first.

---

## Scope of Sub-Plan 2

This sub-plan executes **Phase C + Phase D + Phase E + Phase F** of the consolidated #203 plan:

- **Phase C (Layer-2 ship/debug gates):** C1, C2, C3 — MCP-only rewrites of `bkit-ship.md` Step 2/6 + Step 12, and `bkit-debug.md` Step 3, all referencing `bkit-tests-check`.
- **Phase D (Layer-3 rules norm):** D1, D2 — insert the "Green != ran != validated" bullet into `.agents/rules.md` and `.bkit/templates/.agents/rules.md`.
- **Phase E (tests + fixtures + docs):** E1–E10 — extend 4 existing test files, create 2 new test files (`bkit-ship-workflow.test.ts` + optional `bkit-protect-main.test.ts`), upgrade the `heavy-customised-ci` fixture with bare-marker contract preservation, and edit `docs/pending.md` + `docs/deployments.md` (×2) + `docs/knowledge.md` + `docs/decisions.md` + `CHANGELOG.md`.
- **Phase F (FINAL batched mirror+dist regen):** F1, F2, F3 — `pnpm build` (`tsc`) for `dist/`, `pnpm bkit install` for `.claude/` + `.cursor/` mirrors, full Vitest suite + actionlint + dry-run for the final go/no-go.

---

## PRIMARY STEER (load-bearing; both sub-plans honour it)

> [!IMPORTANT]
> Per 2026-06-02 directive: **copy gether's `/Users/christian/Documents/GitHub/app-gether-life/.github/workflows/ci.yml` near-verbatim** into the template — parameterize VALUES only. Do NOT stub whole tiers. Sub-Plan 1 executed this; Sub-Plan 2 assumes the result is in place.

**Canonical reference paths (for tests that interrogate the template):**

- gether ci.yml: `/Users/christian/Documents/GitHub/app-gether-life/.github/workflows/ci.yml`
- gether #403 design doc: `/Users/christian/Documents/GitHub/app-gether-life/docs/plans/202605/403-ci-simplification-design.md`
- bkit template (rewritten by Sub-Plan 1): `.bkit/templates/.github/workflows/ci.yml`
- bkit's own (rewritten by Sub-Plan 1): `.github/workflows/ci.yml`

**Capstone shape (canonical — verified by tests in this sub-plan):**

- Job name `bkit-tests-check`.
- `needs: [bkit-decide, bkit-tests, bkit-tests-live]` (template) / `needs: [bkit-decide, bkit-tests]` (bkit-own).
- `if: ${{ !cancelled() }}`.
- Tier outputs from `bkit-tests`: `integration_outcome` (step `id: integration`) + `e2e_outcome` (step `id: e2e`).
- 5-rule capstone script (DECIDE / TESTS / INTEGRATION / E2E / LIVE).

**Constraints (apply to every task in this sub-plan):**

- ASCII operators only (`!=` `>=` `<=`; never Unicode `≠ ≥ ≤`) in any `.bkit/workflows/*.md` and `.bkit/prompts/*.md` and rules.md edits.
- Workflows are **MCP-only** for GitHub: no `gh api`, no `gh` CLI, no raw HTTP added in `.bkit/workflows/*.md` by this plan. Pre-existing legacy `gh` lines untouched by #203 are out-of-scope to migrate.
- `.github/workflows/*` edits already locked by Sub-Plan 1; no additional CI workflow edits in this sub-plan.
- Mirror + dist regeneration is BATCHED — Phase F runs ONCE at the end, not per-edit.

---

## Context & Goals (carried from parent)

(Same context as Sub-Plan 1 — see [`./plan-v4-1.md`](./plan-v4-1.md#context--goals-carried-from-parent) for the full text.)

**Sub-Plan 2 Success Criteria:**

- `.bkit/workflows/bkit-ship.md` Gates 2/3 + Step 12 and `.bkit/workflows/bkit-debug.md` Step 3 assert `bkit-tests-check == success` on the PR's full run via MCP; `skipped`/`neutral`/`cancelled`/missing treated as non-green; no NEW `gh` invocations introduced.
- `.agents/rules.md` + `.bkit/templates/.agents/rules.md` Git/CI/Merges section gains the one-bullet norm "Green != ran != validated …".
- `pnpm test` (full Vitest suite) + `pnpm build` + `pnpm bkit check` + `pnpm lint:workflows` (actionlint) all green; bug-class regression tests (4 explicit Vitest cases for `bkit-tests-check` outcome rejection) PASS.
- `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` upgraded to the 4-job shape with bare markers preserved.
- `dist/` rebuilt (`pnpm check:dist` green); `.claude/` + `.cursor/` mirrors regenerated (`pnpm bkit check` green).
- `CHANGELOG.md` + `docs/pending.md` + `docs/deployments.md` (×2) + `docs/knowledge.md` + `docs/decisions.md` updated.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**

(The full Acceptance Scenario — Narrative, Success Criteria, Concrete Example, Edge Cases, Derived Test Matrix — lives in the parent index [`plan-v4-split.md`](./plan-v4-split.md#-acceptance-scenario-human-review-required). Sub-Plan 2 executor MUST read it once.)

Sub-Plan 2 contributes the following Derived Test Matrix rows:

| Matrix concern                                                                                                   | Where Sub-Plan 2 addresses it                                    |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `.bkit/workflows/bkit-ship.md` Gate 2 + Step 12 + Gate 3 read `bkit-tests-check == SUCCESS` via MCP              | Task C1 + C2                                                     |
| Bug-class regression: ship/debug gate rejects each of `cancelled`/`skipped`/`neutral`/`missing` (4 Vitest cases) | Task E2 (`bkit-ship-workflow.test.ts`)                           |
| `.bkit/workflows/bkit-debug.md` Step 3 inspects `bkit-tests-check` via MCP equivalent                            | Task C3 + E2                                                     |
| `.agents/rules.md` + template mirror carry "Green != ran != validated" bullet                                    | Tasks D1 + D2 + E4                                               |
| `heavy-customised-ci` fixture upgraded to 4-job shape PRESERVING bare markers                                    | Task E5                                                          |
| Template's no-bare-marker guard remains scoped to `.bkit/templates/**`                                           | Task E1 (assertion added) + E5 (verification of scope unchanged) |
| `docs/pending.md` Quick path entry says `bkit-protect-main.sh` + `bkit-tests-check`                              | Task E7                                                          |
| `dist/` regenerated; `dist/bkit-postinstall.js` contains `bkit-protect-main` literal                             | Task F1                                                          |
| `.claude/commands/*` + `.cursor/commands/*` mirrors match `.bkit/workflows/*.md`                                 | Task F2                                                          |
| All test rows of the Derived Test Matrix execute green together                                                  | Task F3                                                          |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed (parent index read; this sub-plan's scope agreed).**

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

Sub-Plan 2 introduces / surfaces the following breaking changes (parent table at [`plan-v4-split.md`](./plan-v4-split.md#breaking-changes--naming-review-human-review-required) is canonical):

| Change                                                                                                                                                           | Type            | Notes                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `.bkit/workflows/bkit-ship.md` Step 12 squash-merge guard: now keys off `bkit-tests-check` capstone conclusion instead of "any job whose name matches `/test/i`" | Behavioural     | A consumer whose ci.yml does not yet ship the capstone will see ship Step 12 refuse to declare validated — that is correct. |
| Branch protection on bkit's own `main` (operator step — out-of-tree)                                                                                             | Operator action | Not executed by this build; `docs/pending.md` entry updated only (Task E7); the actual flip is operator-side.               |

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed.**

---

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Sub-Plan 1 committed:** the 5-line bash precondition block above passes.
- [ ] **Package Management:** `package.json` unchanged; `pnpm-lock.yaml` clean.
- [ ] **User Context:** Worktree at `.worktrees/203-ci-green-validated`; CLAUDE.md and `.agents/rules.md` read.
- [ ] **Project Context:** `docs/knowledge.md` and `docs/decisions.md` checked.
- [ ] **Testing & Quality:** `docs/testing.md` reviewed; bkit tests are pure Vitest, no Playwright.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Sub-Plan 1 invariants verified.**
- [ ] **Acceptance Scenario confirmed:** Human checkbox `[x]`.
- [ ] **Breaking Changes confirmed:** Human checkbox `[x]`.
- [ ] **Gate 1 - Verified:** All Core items checked.

---

## Architecture & Component Changes (Sub-Plan 2 scope)

### Layer 2 — Ship + debug gates (follows Sub-Plan 1's Layer 1)

#### [MODIFY] `.bkit/workflows/bkit-ship.md`

- **Existence Check:** present.
- **MCP-only constraint (per plan-input L84 + user-memory `feedback_workflows_mcp_only`):** This plan introduces NO new `gh` CLI / `gh api` / raw-HTTP calls anywhere in `.bkit/workflows/*.md`. Pre-existing legacy `gh pr view` / `gh run view` lines untouched by #203 are out-of-scope to migrate; but every NEW gate added by Layer 2 below uses the MCP GitHub tooling already configured (e.g. `mcp__github__pull_request_read` with `methods: ['statusCheckRollup']`, `mcp__github__list_workflow_runs` + `mcp__github__list_workflow_jobs`).
- Step 6 of Step 2 (line 290): Replace the current `statusCheckRollup` "any failures" gate with an MCP-based capstone gate:
  - Call `mcp__github__pull_request_read` with `method: 'statusCheckRollup'` against the PR; extract the entry where `context == "bkit-tests-check"` and assert `conclusion == "SUCCESS"`.
  - If the call errors OR the rollup is empty OR the `bkit-tests-check` entry is missing OR `conclusion` is any of `SKIPPED` / `NEUTRAL` / `CANCELLED` / `FAILURE` (the four non-green outcomes that fed the #203 bug) → **Failure Path**.
  - Add a note that PR-side `bkit-tests-check` MUST be on the FULL run for the PR's `headRefOid` — partial runs are explicitly non-validating.
- Step 12 squash-merge block (lines 885-897): Replace the `select(.name | test("test"; "i"))` heuristic with an MCP-based `bkit-tests-check` extractor: read the workflow run for the squash-merge SHA via MCP (`mcp__github__list_workflow_runs` filtered by `head_sha`, then `mcp__github__list_workflow_jobs`), find the job with `name == "bkit-tests-check"`, and assert `conclusion == "success"`. Treat `skipped` / `neutral` / `cancelled` / missing the same as `failure`. Update the gate-12 checkbox label (line 952) to `Squash-merge CI run completed bkit-tests-check (not cancelled, not failed, not skipped)`. **Do not introduce a fresh `gh run view --json jobs --jq …` call here** — the replacement is MCP-only since this is a NEW gate, not a touch-up of legacy plumbing.
- Anywhere else in the file that references `bkit-tests` as the validation gate (none observed) → leave untouched.
- ASCII operators only — verify `!=` `>=` `<=` (no Unicode).

#### [MODIFY] `.bkit/workflows/bkit-debug.md`

- **Existence Check:** present.
- **MCP-only constraint applies:** the new `TESTS_CHECK` fetch is MCP, not `gh run view`.
- Step 3 lines 362-365 (the `RUN_CONCLUSION` blind read): after computing `RUN_CONCLUSION`, add an MCP-based fetch of the `bkit-tests-check` job conclusion:
  - Use `mcp__github__list_workflow_jobs` against the resolved `RUN_ID`; locate the job with `name == "bkit-tests-check"`; bind its `conclusion` to `TESTS_CHECK` (fallback `"missing"` if absent).
  - The condition (line 366) becomes: `If RUN_ID non-empty AND (RUN_CONCLUSION != "success" OR TESTS_CHECK != "success") → fetch CI logs …`.
  - Treats `skipped` / `cancelled` / `neutral` / `"missing"` as non-success.
- ASCII operators only.

#### [MODIFY] `.claude/commands/bkit-ship.md` + `.cursor/commands/bkit-ship.md` + `.claude/agents/bkit-ship-*.md` + `.cursor/agents/bkit-ship-*.md` mirrors

- Regenerated by `pnpm bkit install` at end-of-session (Task F2). No hand-edit.

### Layer 3 — Rules norm (follows Layer-2)

#### [MODIFY] `.agents/rules.md`

- **Existence Check:** present (line 52 onwards read).
- Under `### Git, CI & Merges`, AFTER line 64 (the existing `**CI:**` bullet), INSERT a new bullet:
  - `- **Validation != green:** Green != ran != validated. Classify the CI run type (partial / full) before reporting any verdict. NEVER report validated/done off a partial run; the validating run is always the PR's full CI. The required check is `bkit-tests-check`— it MUST be`success` on the full run, never skipped/neutral/cancelled/missing.`
  - Note the explicit space between the closing backtick of `` `bkit-tests-check` `` and the em-dash (avoids the no-space-before-em-dash prose-lint smell flagged in plan-review-1 OP1).

#### [MODIFY] `.bkit/templates/.agents/rules.md`

- Same bullet inserted at the same position.

### Tests, fixtures, docs

#### [MODIFY] `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml`

- Upgrade the single-job fixture to the 4-job shape so install/upgrade integration tests reflect the new template. Preserve the existing `consumer-job:` block (lines 54-59 — the test asserts non-bkit jobs survive install).
- **CRITICAL contract collision resolution (per plan-review-3 #3):** the fixture MUST preserve its bare `# bkit:start` / `# bkit:end` markers around the `Install Dependencies` block (today's lines 23-52). `.bkit/src/bkit-modules.upgrade.integration.test.ts` L294-319 depends on these bare markers for (i) marker-survival and (ii) `detectTier2TextDrift` text-drift detection on the consumer-added `NODE_AUTH_TOKEN` env line inside the marker block. The TEMPLATE's no-bare-marker guard (`.bkit/src/bkit-templates.test.ts` L146-150) only scans `.bkit/templates/.github/workflows/ci.yml` — it does NOT scan `tests/fixtures/**`, so the fixture's bare markers do NOT violate the template guard. Task E5 must (a) keep the bare markers in the fixture; (b) verify the template-guard's scope remains scoped to `.bkit/templates/**` (assertion added in Task E1's matrix row "Template's no-bare-marker guard remains scoped").

#### [MODIFY] `.bkit/src/bkit-templates.content.test.ts`

- Extend the existing `verbose-ci-env` block tests (lines 135-160 range) with new assertions:
  - `bkit-decide:` job exists at column 0 of the `jobs:` block (1 occurrence).
  - `bkit-tests-check:` job exists (1 occurrence).
  - `bkit-tests-live:` job exists as a CANONICAL job body (NOT commented — assert the `Run Live Tests` step is present un-commented).
  - `bkit-tests-check` job has `if: ${{ !cancelled() }}` (or `if: !cancelled()` literal form) AND `needs:` listing `bkit-decide`, `bkit-tests`, `bkit-tests-live`.
  - `bkit-tests` job declares `outputs:` with `integration_outcome:` and `e2e_outcome:`; integration step has `id: integration` and E2E step has `id: e2e`.
  - `bkit-decide` has the `Assemble and emit plan JSON` step containing the literal schema-validation loop tokens (all six required fields `schema|run_level|web_affected|should_run_e2e|live_should_run|depth_source|whether_reason` present).
  - `bkit-decide` has the `Write plan-table-v1 to step summary` step (`if: "!cancelled()"`) AND the `Write cancellation notice` step (`if: cancelled()`).
  - `bkit-decide` retains a step `name: Detect Direct Push` (compat alias for `detectRunLevelsNotComposed`).
  - The existing `bkit:start verbose-ci-env` block remains exactly one occurrence at 4-space indent.
  - Template's no-bare-marker guard (`.bkit/src/bkit-templates.test.ts` L146-150) remains scoped to `.bkit/templates/**` — does NOT regress to scan `tests/fixtures/**`.

#### [MODIFY] `.bkit/src/bkit-postinstall.test.ts`

- Add tests asserting:
  - Quick-path string mentions `bkit-protect-main.sh` (not `bkit-set-protection.sh`).
  - Quick-path string mentions `bkit-tests-check` and does NOT include the bare prefix `bkit-tests` without the `-check` suffix (assertion uses word-boundary regex `/\bbkit-tests\b(?!-)/`).
  - "Require status checks" advisory line mentions `bkit-tests-check`.

#### [NEW] `.bkit/src/bkit-ship-workflow.test.ts` (NEW FILE — does NOT currently exist; must be created)

- Bug-class regression coverage (CRITICAL #6 — closes the #203 root cause):
  - `bkit-ship.md` Step 2 step 6 gate parses `bkit-tests-check` via MCP-style call (no NEW `gh pr view`/`gh api`/raw-HTTP added by this plan); the gate text explicitly treats each of `SKIPPED` / `NEUTRAL` / `CANCELLED` / `FAILURE` / missing as non-green (one Vitest case per outcome).
  - `bkit-ship.md` Step 12 squash-merge guard names `bkit-tests-check` explicitly (no `test("test"; "i")` regex heuristic remains).
  - `bkit-debug.md` Step 3 adds an MCP fetch of `TESTS_CHECK` (no NEW `gh run view` call) and treats `skipped`/`cancelled`/`neutral`/`missing` as non-success.
  - **Plan-introduced new-`gh`-call counter:** grep both `.bkit/workflows/bkit-ship.md` and `.bkit/workflows/bkit-debug.md` between HEAD and the plan diff; assert ZERO new `gh ` / `gh api ` / `curl -s.*api.github` invocations were added by this plan's diff.

#### [NEW] `.bkit/src/bkit-protect-main.test.ts` (OR extend an existing test file)

- File existence: `scripts/ci/bkit-protect-main.sh` present; old `bkit-set-protection.sh` absent (in engine root and in `.bkit/templates/scripts/ci/`).
- Static content: `REQUIRED_JOB="bkit-tests-check"` present; no `REQUIRED_JOB="bkit-tests"` remains.
- Pre-flight regex check: the script's grep pattern targets `bkit-tests-check` literal.

#### [MODIFY] `.bkit/src/bkit-rules-sync.test.ts`

- Add assertions that both `.agents/rules.md` and `.bkit/templates/.agents/rules.md` Git/CI/Merges section contain the literal substring `Green != ran != validated` (case-sensitive) and `bkit-tests-check`.

#### [MODIFY] `.bkit/src/bkit-modules.upgrade.integration.test.ts`

- Add an integration test step asserting that after `bkit install` against `heavy-customised-ci`, the rendered `ci.yml` contains `bkit-tests-check:` and the four expected job names. The existing `consumer-job:` block remains intact.

#### [MODIFY] `docs/pending.md`

- The entry "Enable `main` branch protection ruleset on `cbartens/bkit` (2026-05-12)" lines 173-182: replace `bash scripts/ci/bkit-set-protection.sh` -> `bash scripts/ci/bkit-protect-main.sh`; `required check bkit-tests` -> `required check bkit-tests-check`; context `bkit-tests` -> `bkit-tests-check` (3 occurrences in the description body); `bkit-tests` job exists -> `bkit-tests-check` job exists. Do NOT alter the deferred status — the operator step is still gated on GitHub Pro / public-repo upgrade.

#### [MODIFY] `CHANGELOG.md`

- New entry at top, format `## [{NEXT}] — YYYY-MM-DD`:
  - `### Added` — `bkit-decide`, `bkit-tests-live`, `bkit-tests-check` jobs in the seeded `ci.yml` (Tier-3 seed-or-print). Capstone is the sole required check.
  - `### Changed` — `scripts/ci/bkit-set-protection.sh` -> `scripts/ci/bkit-protect-main.sh`; `REQUIRED_JOB` -> `bkit-tests-check`. Postinstall advisory updated. Ship + debug agent gates simplified to `bkit-tests-check == success`.
  - `### Migration notes` — existing consumers with the old script copy: rename + flip `REQUIRED_JOB` + ensure ci.yml carries `bkit-tests-check` before re-applying. Bkit's own `main` protection unchanged (still deferred).

### Documentation Updates

| File                                  | Change required                                                                                                                                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `docs/deployments.md`                 | Refresh "Run-level tiers" table heading to reference the new 4-job vocabulary (`bkit-decide` plan + `bkit-tests-check` capstone); add one line under "Branch protection" pointing at `bkit-protect-main.sh`. |
| `.bkit/templates/docs/deployments.md` | Same edits (consumer mirror).                                                                                                                                                                                |
| `docs/knowledge.md`                   | Append one KN-N entry: "Capstone-gated CI — `bkit-tests-check` is the only required check; partial runs legitimately skip tiers without breaking required-check".                                            |
| `docs/decisions.md`                   | Append one DE-N entry: "Capstone CI job `bkit-tests-check` adopted (gether #403 backport); decided over original #203 `bkit-gate` name and over making `bkit-tests` the required check".                     |
| `docs/pending.md`                     | Update quick-path entry (covered by Task E7).                                                                                                                                                                |
| `CHANGELOG.md`                        | New version entry (covered by Task E10).                                                                                                                                                                     |

---

## Agent Execution Runbook (Sub-Plan 2 — Phases C + D + E + F)

> Every task carries a terse, codebase-verifiable `Done when:` line. Phase C/D/E can be parallel-ish; Phase F is strictly LAST.

### Phase C — Layer 2 ship + debug gates (depends on Sub-Plan 1's Phase A landing the capstone)

- [ ] **Task C1 (MCP-only, CRITICAL #2):** Edit `.bkit/workflows/bkit-ship.md` Step 2 step 6: replace the legacy `statusCheckRollup` "any failures" pattern (today's literal line: `gh pr view {PR_NUMBER} --json statusCheckRollup` followed by the "any check failed or rollup empty" Failure Path) with an MCP-based gate that extracts the `bkit-tests-check` entry and asserts `conclusion == "SUCCESS"`. Use `mcp__github__pull_request_read` (or the project's existing MCP getter for status checks) — DO NOT introduce a new `gh pr view --json statusCheckRollup --jq …` invocation. Treat `SKIPPED` / `NEUTRAL` / `CANCELLED` / `FAILURE` / missing all as non-green (Failure Path).
  - **Scope:** `.bkit/workflows/bkit-ship.md` Step 2 step 6.
  - **Done when:** grep-anchored verification (line numbers are unstable, the grep is stable): `grep -c 'gh pr view {PR_NUMBER} --json statusCheckRollup' .bkit/workflows/bkit-ship.md` returns exactly `0` (the legacy invocation is REMOVED from this gate); AND `grep -c 'bkit-tests-check' .bkit/workflows/bkit-ship.md` returns at least `1` in Step 2 step 6 (verify by extracting the block between `## Step 2` and `## Step 3` headers and grepping inside); AND the replacement text contains a `mcp__github__pull_request_read` (or equivalent project MCP getter) literal in Step 2 step 6; AND explicit text rejects each of `SKIPPED` / `NEUTRAL` / `CANCELLED` / missing as non-green; AND `git diff .bkit/workflows/bkit-ship.md` shows ZERO new `gh ` / `gh api ` / `curl ` invocations in Step 2 step 6 (pre-existing legacy lines elsewhere in the file untouched are fine).

- [ ] **Task C2:** Edit `.bkit/workflows/bkit-ship.md` Step 12 (lines 885-897): replace the `select(.name | test("test"; "i"))` heuristic with MCP-based `bkit-tests-check` extraction (read workflow run for the squash-merge SHA via `mcp__github__list_workflow_runs` + `mcp__github__list_workflow_jobs`; find the job named `bkit-tests-check`; assert `conclusion == "success"`). Update gate-12 checkbox (line 952) wording to `Squash-merge CI run completed bkit-tests-check (not cancelled, not failed, not skipped)`. Verify ASCII operators (no Unicode `!=` `>=` `<=` — ASCII only).
  - **Scope:** same file.
  - **Done when:** `grep -c 'test("test"; "i")' .bkit/workflows/bkit-ship.md` returns exactly `0`; `grep -c 'bkit-tests-check' .bkit/workflows/bkit-ship.md` returns at least `3` (Step 6, Step 12 block, Gate 12 checkbox); ASCII-only sweep clean — `python3 -c "import sys; sys.exit(0 if all(c not in open('.bkit/workflows/bkit-ship.md').read() for c in chr(8800)+chr(8805)+chr(8804)) else 1)"` exits 0; `git diff .bkit/workflows/bkit-ship.md` Step 12 block shows ZERO new `gh ` / `gh api ` / `curl ` invocations introduced.

- [ ] **Task C3 (MCP-only, CRITICAL #2):** Edit `.bkit/workflows/bkit-debug.md` Step 3 (line 362): after `RUN_CONCLUSION` computation, add an MCP-based `TESTS_CHECK` fetch via `mcp__github__list_workflow_jobs` (or the project's equivalent MCP job-list getter) against the resolved `RUN_ID`; bind the `bkit-tests-check` job's `conclusion` to `TESTS_CHECK` (fallback `"missing"` if absent). DO NOT introduce `gh run view "$RUN_ID" --json jobs --jq …` (or any other new `gh` invocation). Tighten the conditional so any non-`"success"` for either `RUN_CONCLUSION` OR `TESTS_CHECK` triggers the context fetch. Verify ASCII operators.
  - **Scope:** `.bkit/workflows/bkit-debug.md`.
  - **Done when:** `grep -c "bkit-tests-check" .bkit/workflows/bkit-debug.md` returns at least `1` (in Step 3 lines 360-400); ASCII-only sweep clean; `git diff .bkit/workflows/bkit-debug.md` Step 3 block shows ZERO new `gh ` / `gh api ` / `curl ` invocations.

### Phase D — Layer 3 rules norm (depends on Sub-Plan 1's Phase A so the rules wording can reference the right capstone)

- [ ] **Task D1:** Edit `.agents/rules.md` § "Git, CI & Merges": insert the new bullet AFTER line 64 (`**CI:**`).
  - **Scope:** `.agents/rules.md`.
  - **Done when:** `grep -n "Green != ran != validated" .agents/rules.md` returns one match between lines ~64-70; ASCII-only sweep clean.

- [ ] **Task D2:** Mirror the same bullet into `.bkit/templates/.agents/rules.md` § "Git, CI & Merges" at the same position.
  - **Scope:** `.bkit/templates/.agents/rules.md`.
  - **Done when:** same grep on template; `.bkit/src/bkit-rules-sync.test.ts` (after Task E4) green.

### Phase E — Tests + fixtures + docs (depends on Phases A-D)

- [ ] **Task E1:** Extend `.bkit/src/bkit-templates.content.test.ts` with 4-job-shape assertions per Tests § content-test (count `bkit-decide:`/`bkit-tests:`/`bkit-tests-live:`/`bkit-tests-check:` occurrences; `if: !cancelled()` + `needs:` listing; plan-table-v1 schema-validation step; tier-outcome outputs; `Detect Direct Push` compat-alias presence; bare-marker guard scope assertion).
  - **Scope:** `.bkit/src/bkit-templates.content.test.ts`.
  - **Done when:** `pnpm test -- bkit-templates.content` exits 0 with the new tests reported.

- [ ] **Task E2:** Extend `.bkit/src/bkit-postinstall.test.ts` with Quick-path + status-checks assertions per Tests § postinstall. **Create the NEW test file `.bkit/src/bkit-ship-workflow.test.ts`** (this file does NOT currently exist — verified: only `bkit-release-workflow.test.ts` is present; do NOT extend the release-workflow file as that would mismatch the filter and risk a false-green) covering the bug-class regression (CRITICAL #6): four explicit Vitest cases asserting `bkit-ship.md` + `bkit-debug.md` gate text rejects each of `SKIPPED` / `NEUTRAL` / `CANCELLED` / `"missing"` for `bkit-tests-check` conclusion.
  - **Scope:** `.bkit/src/bkit-postinstall.test.ts` (extend) + NEW `.bkit/src/bkit-ship-workflow.test.ts` (create).
  - **Done when:** `pnpm test -- bkit-postinstall` exits 0 with the three new assertions present BY NAME — `postinstall quick-path mentions bkit-protect-main.sh`, `postinstall quick-path mentions bkit-tests-check (word-boundary, not bkit-tests bare)`, `postinstall status-checks line mentions bkit-tests-check`; AND the file `.bkit/src/bkit-ship-workflow.test.ts` exists (`test -f .bkit/src/bkit-ship-workflow.test.ts` exits 0); AND `pnpm test -- bkit-ship-workflow.test.ts` exits 0 reporting **exactly 4 PASSED test cases** present BY NAME — `bkit-ship gate rejects SKIPPED`, `bkit-ship gate rejects NEUTRAL`, `bkit-ship gate rejects CANCELLED`, `bkit-ship gate rejects missing`. A run that reports zero tests matched (a vacuous-pass) MUST NOT satisfy this gate; verify by inspecting the Vitest summary line for `4 passed` (and that the file path is the resolved file — Vitest's `--reporter=verbose` may be used to confirm the case names).

- [ ] **Task E3:** Create `.bkit/src/bkit-protect-main.test.ts` (OR extend `bkit-postinstall.test.ts`) per Tests § protect-main: assert file existence, absence of old name, `REQUIRED_JOB` literal, pre-flight grep target.
  - **Scope:** new (or extended) test file.
  - **Done when:** `pnpm test -- bkit-protect-main` (or the host file) exits 0; assertions pass against the on-disk rename from Sub-Plan 1 Phase B.

- [ ] **Task E4:** Extend `.bkit/src/bkit-rules-sync.test.ts` with the "Green != ran != validated" substring assertion against both `.agents/rules.md` and `.bkit/templates/.agents/rules.md`.
  - **Scope:** `.bkit/src/bkit-rules-sync.test.ts`.
  - **Done when:** `pnpm test -- bkit-rules-sync` exits 0; both rules.md files match.

- [ ] **Task E5 (CRITICAL #5 — fixture marker-contract collision resolution):** Upgrade `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` to the 4-job shape (matching the template structure) while explicitly preserving (i) the `consumer-job:` block byte-identical to before, (ii) the bare `# bkit:start` / `# bkit:end` markers around the consumer-customised `Install Dependencies` block (REQUIRED by `bkit-modules.upgrade.integration.test.ts` L294-319 — both the marker-survival assertion AND the `detectTier2TextDrift` text-drift trigger on the `NODE_AUTH_TOKEN` env line). The fixture intentionally DIVERGES from the template's no-bare-marker shape — this is a documented contract, NOT a regression. Verify `.bkit/src/bkit-templates.test.ts` L146-150's no-bare-marker guard remains scoped to `.bkit/templates/**` (does NOT widen to scan `tests/fixtures/**`).
  - **Scope:** `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` + verification of `.bkit/src/bkit-templates.test.ts` guard scope.
  - **Done when:** `actionlint tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` exits 0; `grep -c '^      # bkit:start$' tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` returns exactly `1`; `grep -c '^      # bkit:end$' …ci.yml` returns exactly `1`; `consumer-job:` block byte-identical (verified via `git diff` showing only additions, no deletions of the consumer-job lines); `bkit-tests-check:` present; `grep -n 'tests/fixtures' .bkit/src/bkit-templates.test.ts` returns no matches in the no-bare-marker guard (lines 146-150 still scan only `readTemplate(...)`).

- [ ] **Task E6:** Extend `.bkit/src/bkit-modules.upgrade.integration.test.ts` with a step asserting that after `bkit install` against `heavy-customised-ci`, the rendered ci.yml contains all four job names and `consumer-job:` is preserved.
  - **Scope:** `.bkit/src/bkit-modules.upgrade.integration.test.ts`.
  - **Done when:** `pnpm test -- bkit-modules.upgrade.integration` exits 0 with the new assertion passing.

- [ ] **Task E7:** Edit `docs/pending.md` entry "Enable `main` branch protection ruleset on `cbartens/bkit`" (lines 173-182): replace `bkit-set-protection.sh` -> `bkit-protect-main.sh` (1 occurrence); replace required-check `bkit-tests` -> `bkit-tests-check` (3 occurrences in the body); replace context `bkit-tests` -> `bkit-tests-check` (in the ruleset JSON line).
  - **Scope:** `docs/pending.md`.
  - **Done when:** `grep -n "bkit-set-protection" docs/pending.md` returns no matches; `grep -n "bkit-protect-main" docs/pending.md` returns at least 1 match; `grep -nE '`bkit-tests`' docs/pending.md` returns at most the historical resolved entries (line 190-193 of the BAR-167 Phase 2 entry uses `ci.yml` as a literal — preserve).

- [ ] **Task E8:** Edit `docs/deployments.md` + `.bkit/templates/docs/deployments.md`: refresh "Run-level tiers" / "Branch protection" sections with one-line pointers to the 4-job vocabulary + `bkit-protect-main.sh`. No structural rewrite — minimal patches only.
  - **Scope:** both deployments docs.
  - **Done when:** `grep -n "bkit-tests-check" docs/deployments.md .bkit/templates/docs/deployments.md` returns at least 1 match per file; prose lint (`pnpm lint:prose`) green.

- [ ] **Task E9:** Append new entries to `docs/knowledge.md` (KN-N) and `docs/decisions.md` (DE-N) per Documentation Updates table.
  - **Scope:** both docs.
  - **Done when:** `tail -n 5 docs/knowledge.md` shows the new KN entry with capstone-gated-CI; `tail -n 5 docs/decisions.md` shows the new DE entry on the `bkit-tests-check` adoption.

- [ ] **Task E10:** Append new version entry to `CHANGELOG.md` per Documentation Updates.
  - **Scope:** `CHANGELOG.md`.
  - **Done when:** new `## [{NEXT}] — YYYY-MM-DD` block at top with Added/Changed/Migration-notes sections; `pnpm lint:prose` green.

### 🔒 Gate 2: Code Implementation Check (Sub-Plan 2 scope)

- [ ] **Gate 2 - Verified (Sub-Plan 2):** Phases C-E checkboxes ticked; the workflow gate, rules norm, test, fixture, and docs changes are reflected in the repo (`git status` shows expected file paths modified/added).

### 🔒 Gate 3: Testing & Documentation Check (Sub-Plan 2 scope)

- [ ] **Docs updated:** `docs/pending.md`, `docs/deployments.md` (+ template), `docs/knowledge.md`, `docs/decisions.md`, `CHANGELOG.md` — every row in Documentation Updates ticked.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified.

### Phase F — Mirror + dist regeneration (FINAL — batched; depends on ALL of Sub-Plan 1 + Phases C-E)

> Per memory note "bkit install — batch at end, not after every edit" — do NOT regenerate mirrors per-edit. Run once at the end.

- [ ] **Task F1:** `pnpm build` (== `tsc`) to regenerate `dist/` after `.bkit/src/bkit-postinstall.ts` edit (Sub-Plan 1 Task B5).
  - **Scope:** `dist/`.
  - **Done when:** `pnpm check:dist` exits 0 (no diff between built and committed `dist/`); `grep -c "bkit-protect-main" dist/bkit-postinstall.js` returns exactly `3` (matches the source `.bkit/src/bkit-postinstall.ts` count from Task B5 — guarantees dist freshness wrt the rename).

- [ ] **Task F2 (CRITICAL #7 — resolved command name):** `pnpm bkit install` inside the worktree to regenerate `.claude/commands/*` and `.cursor/commands/*` mirrors from `.bkit/workflows/*.md` edits (Phase C). The repo's `package.json` defines `"bkit": "node dist/bkit-install.js"` (L41); `.bkit/src/bkit-install.ts` L973 distinguishes verbs by `verb === "check"` (dry-run) vs `install` (apply). No `--apply` flag exists — `install` is the apply verb. The dry-run / drift-detection counterpart is `pnpm bkit check`.
  - **Scope:** `.claude/commands/`, `.cursor/commands/`, `.claude/agents/`, `.cursor/agents/`.
  - **Done when:** `pnpm bkit install` exits 0 (writes any drifted mirrors); `pnpm bkit check` exits 0 immediately afterwards (zero drift remains between `.bkit/workflows/*.md` source and `.claude/commands/*` + `.cursor/commands/*` mirrors).

- [ ] **Task F3:** Final verification: `pnpm test` AND `pnpm typecheck` AND `pnpm lint:workflows` (actionlint) AND `pnpm bkit check` AND `bash scripts/ci/bkit-protect-main.sh --dry-run`.
  - **Scope:** verification only.
  - **Done when:** all five commands exit 0.

> [!IMPORTANT]
> **Testing Strategy (See `docs/testing.md`):** bkit's tests are pure Vitest. No Playwright. Backend pipeline logic mocked at HTTP boundary where applicable. The CI scaffold itself is validated via `actionlint` (static) + the `.bkit/src/bkit-templates.content.test.ts` content assertions (snapshot-style); behavioural validation of the capstone happens via the next CI run on the PR.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every row in `Acceptance Scenario → Derived Test Matrix` has a corresponding task. Sub-Plan 1 owns A2b/A3a/A3b/A4/A5/B4 rows; Sub-Plan 2 owns E1-E6 + F1 + F3 rows.
- [ ] **Update existing tests:** Done via E1 (extended content tests, incl. plan-table-v1 schema + tier-outcome outputs + bare-marker guard scope assertion), E2 (postinstall Quick-path + bug-class regression cases), E4, E6.
- [ ] **Write new tests:** Done via E3 (new `bkit-protect-main.test.ts` or extension) AND new `bkit-ship-workflow.test.ts` for the four bug-class outcome cases.
- [ ] **Regenerate full-template snapshot:** Done by Sub-Plan 1 Task A5 (`pnpm test -- bkit-templates.content -u` + manual diff review).
- [ ] **Verify observability:** N/A — no new log channels (the `$GITHUB_STEP_SUMMARY` plan-table is observable but inherited from gether).
- [ ] **Update documentation:** Done via E7, E8, E9, E10.

---

## Verification Plan (Sub-Plan 2 scope)

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck`; `pnpm lint:workflows` (actionlint); `pnpm lint:prose`; `pnpm lint:slop`.
- [ ] **Test Synchronization:** No external test suites; all in-repo.
- [ ] **Unit tests:** `pnpm test -- bkit-templates.content` + `pnpm test -- bkit-postinstall` + `pnpm test -- bkit-protect-main` (or host file) + `pnpm test -- bkit-rules-sync` + `pnpm test -- bkit-ship-workflow`.
- [ ] **Integration tests:** `pnpm test -- bkit-modules.upgrade.integration` (asserts heavy-customised-ci install → 4-job shape).
- [ ] **Dist freshness:** `pnpm check:dist`.
- [ ] **Mirror parity:** `pnpm bkit check`.
- [ ] **Protection script live:** `bash scripts/ci/bkit-protect-main.sh --dry-run` exits 0 and prints `"contexts": ["bkit-tests-check"]`.
- [ ] **Workflow validity:** `actionlint` over `.github/workflows/ci.yml`, `.bkit/templates/.github/workflows/ci.yml`, `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml`.
- [ ] **Run all tests:** `pnpm test` (the full Vitest suite — 1100+ tests, ~30s). Fix all failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades:** Any actionlint or test failure surfacing a real defect in the new ci.yml must be fixed in the ci.yml, not silenced via lint comments or test exclusions.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** Every Automated Tests checkbox ticked with explicit output captured (test names, actionlint result, dry-run output).

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Use local CLIs.

- [ ] **Step 1:** Push the branch and open a PR; observe the next CI run renders the new 4-job graph. `gh pr view --json statusCheckRollup --jq '.statusCheckRollup[] | select(.context == "bkit-tests-check")'` returns a `conclusion: SUCCESS` entry. The new capstone job summary in `$GITHUB_STEP_SUMMARY` shows the plan table.
- [ ] **Step 2:** From the PR's `bkit-decide` step summary, verify `plan-table-v1` JSON is emitted and `markers_present` is `[]` for the clean PR push.
- [ ] **Step 3:** Operator note: branch-protection flip on `main` to require `bkit-tests-check` is deferred per `docs/pending.md` (403 on non-Pro). Do NOT execute. Update the quick-path entry only (Task E7).
- [ ] **Step 4 (post-Phase F):** Run `/bkit-ship` end-to-end against this very PR ONCE the new capstone has reported at least once on the PR's full run (depends on Phase F push triggering CI). Confirm Gate 2 reads the capstone via MCP (not the legacy "any failures" rollup heuristic) and Step 12 squash-merge guard reads the capstone's conclusion on the merge SHA's CI run via MCP. If running the ship workflow before the capstone has reported, the gate correctly refuses to declare validated — this is expected behaviour, not a failure.

---

## Rollback Strategy

| Axis            | Action                                                 | Notes                                                                                                                                                                                                                                                                            |
| --------------- | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **DB**          | N/A                                                    | No migrations.                                                                                                                                                                                                                                                                   |
| **Code**        | `git revert {squash-merge-SHA}`                        | All edits are in one squash. CI template rolls back to single-job shape; protection script reverts via `git mv` in the revert commit.                                                                                                                                            |
| **Risk window** | None for consumers who have not re-applied protection. | Consumers who flipped branch protection to require `bkit-tests-check` between merge and revert would need to re-apply old `REQUIRED_JOB="bkit-tests"` — they can run `bash scripts/ci/bkit-set-protection.sh` from the revert; engine handles both names cleanly via the rename. |

---

## Merge Method

**Merge method: always squash.** Plan MUST land via `gh pr merge --squash --delete-branch --body ""` (bkit-ship.md Step 5 hardcoded).
