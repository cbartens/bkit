Verdict: PASS

<!-- verdict:end -->

# 203 — Sub-Plan 1 of 2: Layer-1 CI scaffold + Protection-Script + Postinstall (Phases A + B)

**Parent Plan:** [`./plan-v4-split.md`](./plan-v4-split.md)
**Source plan (full):** [`./plan-v3-checked.md`](./plan-v3-checked.md)
**Sibling sub-plan (must land AFTER this one is committed):** [`./plan-v4-2.md`](./plan-v4-2.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

---

## Scope of Sub-Plan 1

This sub-plan executes **Phase A + Phase B** of the consolidated #203 plan:

- **Phase A (CI scaffold authoring):** A1, A2, A2b, A3, A3a, A3b, A4, A5 — the high-fidelity copy of gether's `ci.yml` into `.bkit/templates/.github/workflows/ci.yml`, the degenerate 3-job rewrite of bkit's OWN `.github/workflows/ci.yml`, the two `detectRunLevelsNotComposed` contract verifications, `actionlint -shellcheck` self-CI safeguard, local sanity pass, and the full-file snapshot regen + manual diff review.
- **Phase B (protection script rename + postinstall patch):** B1, B2, B3, B4, B5 — `git mv bkit-set-protection.sh -> bkit-protect-main.sh` (engine + template mirror), `REQUIRED_JOB` flip to `bkit-tests-check`, `--dry-run` preflight against the renamed script (loud-fail guarded by Task A3 sequencing), and the `bkit-postinstall.ts` source edit (dist regen is deferred to Sub-Plan 2 Phase F).

**End state of this sub-plan:** Both ci.yml files carry the 4-job (template) / 3-job (bkit-own) scaffold; the protection script is renamed + pre-flighted; `bkit-postinstall.ts` source is patched. `dist/` is NOT yet rebuilt. Layer 2 / Layer 3 / tests / docs / final mirror+dist regen all happen in [Sub-Plan 2](./plan-v4-2.md).

---

## PRIMARY STEER (load-bearing; both sub-plans honour it)

> [!IMPORTANT]
> Per 2026-06-02 directive: **copy gether's `/Users/christian/Documents/GitHub/app-gether-life/.github/workflows/ci.yml` near-verbatim** into the template — parameterize VALUES only (default branch, action SHAs, Vercel preview URLs, secret names). Do NOT stub whole tiers. The bkit template's target archetype IS the gether stack (Next.js / Vercel / Supabase / turbo monorepo). Reserve commented `bkit-stub:` blocks ONLY for genuinely-not-universal tiers (Supabase-migrate class).

**Canonical reference paths (read these BEFORE Task A2):**

- Source ci.yml to copy: `/Users/christian/Documents/GitHub/app-gether-life/.github/workflows/ci.yml`
- gether #403 design doc: `/Users/christian/Documents/GitHub/app-gether-life/docs/plans/202605/403-ci-simplification-design.md`
- bkit template (target of the copy): `.bkit/templates/.github/workflows/ci.yml`
- bkit's own (degenerate target): `.github/workflows/ci.yml`

**Capstone shape (canonical — appears in BOTH ci.yml files):**

- Job name `bkit-tests-check`.
- `needs: [bkit-decide, bkit-tests, bkit-tests-live]` (template) / `needs: [bkit-decide, bkit-tests]` (bkit-own).
- `if: ${{ !cancelled() }}` (or `if: !cancelled()` literal form).
- `timeout-minutes: 2`; one step `Check Test Plan Followed` with `env:` block exposing `PLAN`, `DECIDE_RESULT`, `TESTS_RESULT`, `LIVE_RESULT`, `INTEGRATION_OUTCOME`, `E2E_OUTCOME`.
- 5-rule script copied verbatim from gether ci.yml L1044-1101 asserting:
  1. `DECIDE_RESULT == "success"`; else `FAIL=1`.
  2. If `plan.run_level != 'none'` AND `TESTS_RESULT != 'success'` → `FAIL=1`.
  3. If `plan.run_level != 'none'` AND `plan.web_affected == 'true'` AND `INTEGRATION_OUTCOME != 'success'` → `FAIL=1`.
  4. If `plan.run_level != 'none'` AND `plan.should_run_e2e == 'true'` AND `plan.web_affected == 'true'` AND `E2E_OUTCOME != 'success'` → `FAIL=1`.
  5. If `plan.live_should_run == 'true'` AND `LIVE_RESULT != 'success'` → `FAIL=1`.
  6. Final `if [ "$FAIL" = "1" ]; then ::error::bkit-tests-check FAILED…; exit 1; fi` + success line. No checkout, no install (target: <10s).

**Tier-output contract (template only):** `bkit-tests` declares job-level `outputs: { integration_outcome: ${{ steps.integration.outcome }}, e2e_outcome: ${{ steps.e2e.outcome }} }`. Integration step has `id: integration`; Playwright E2E step has `id: e2e`.

**Constraints (apply to every task in this sub-plan):**

- ASCII operators only in any human-readable text written here (`!=` `>=` `<=`; never Unicode `≠ ≥ ≤`).
- `.github/workflows/*` edits are human-gated per `.agents/rules.md` L65 — ALWAYS require explicit human confirmation before commit.
- Tracker writes via GitHub-MCP only (no `gh` CLI, no raw HTTP) — no new `gh` invocations introduced anywhere by Sub-Plan 1.
- Mirror + dist regeneration is BATCHED to Sub-Plan 2 Phase F — do NOT run `pnpm bkit install` after every edit.

---

## Context & Goals (carried from parent)

bkit's ship/debug gates and consumer-template CI conflate "the CI run concluded `success`" with "the change was validated by CI". A partial CI run is green-by-construction (E2E and live-deploy tiers are intentionally skipped), so `statusCheckRollup == success` carries zero validation signal. Gether #403 has now proven the structural fix in production: an always-on plan-producing job (`bkit-decide`) feeds a single capstone (`bkit-tests-check`) that asserts every tier the plan said should run actually ran+passed.

**This sub-plan delivers the foundation:** the 4-job scaffold in both ci.yml files, the renamed protection script, and the postinstall.ts source patch. Without this foundation Sub-Plan 2 cannot run — Layer-2 ship/debug gates reference `bkit-tests-check` by name, and the protection-script preflight asserts the job exists.

**Sub-Plan 1 Success Criteria:**

- `.bkit/templates/.github/workflows/ci.yml` ships the full 4-job scaffold via near-verbatim copy from gether, NOT stub.
- bkit's own `.github/workflows/ci.yml` carries the degenerate 3-job shape, preserving SHA-cache skip + `[skip ci]` semantics + verbose-CI knobs.
- `scripts/ci/bkit-set-protection.sh` is renamed to `scripts/ci/bkit-protect-main.sh` (engine + template mirror); `REQUIRED_JOB` flipped to `bkit-tests-check`; preflight greps for `bkit-tests-check`.
- `bkit-postinstall.ts` source patched (3 occurrences of `bkit-protect-main`, advisory + status-checks line updated). `dist/` NOT yet rebuilt — deferred to Sub-Plan 2 F1.
- `actionlint -shellcheck=shellcheck` exits 0 on bkit's own ci.yml (self-CI safeguard).
- Full-file template snapshot regenerated and human-reviewed.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**

(The full Acceptance Scenario — Narrative, Success Criteria, Concrete Example, Edge Cases, Derived Test Matrix — lives in the parent index [`plan-v4-split.md`](./plan-v4-split.md#-acceptance-scenario-human-review-required). The Sub-Plan 1 executor MUST read that section once; it is the testable contract for the WHOLE #203 feature and is not duplicated here to avoid drift.)

Sub-Plan 1 contributes the following Derived Test Matrix rows (the matrix rows mapped to tests / verification land here; the test AUTHORING is in Sub-Plan 2):

<!-- prettier-ignore -->
| Matrix concern | Where Sub-Plan 1 addresses it |
| --- | --- |
| Template ci.yml has 4 named jobs + verbose-ci-env block preserved | Task A2 (Done-when grep counts) |
| Template ci.yml capstone has `if: !cancelled()` + `needs:` lists 3 jobs + 5-rule assertions | Task A2 (Done-when grep counts) |
| Template ci.yml `bkit-decide` carries jq-schema validation loop with all 7 literal field names | Task A2 (Done-when verifies `plan-table-v1` occurrence count = 4) |
| Template ci.yml `bkit-decide` writes plan-table-v1 summary AND cancellation notice | Task A2 (Done-when greps `Write cancellation notice`) |
| Template ci.yml `bkit-tests` declares `integration_outcome` + `e2e_outcome` job outputs | Task A2 (Done-when greps both) |
| Template ci.yml `bkit-tests-live` is a CANONICAL job body (not commented stub) | Task A2 (Done-when greps un-commented `Run Live Tests`) |
| Snapshot regenerated to match new 4-job template, diff human-reviewed | Task A5 |
| `bkit-decide` carries `Detect Direct Push` step so `detectRunLevelsNotComposed` advisory still fires (template) | Task A2b |
| `bkit-decide` carries `Detect Direct Push` step so `detectRunLevelsNotComposed` still passes against bkit-self (bkit-own) | Task A3b |
| bkit's own ci.yml has degenerate 3-job shape; SHA-cache + `[skip ci]` preserved; actionlint clean | Task A3 + A3a + A4 |
| `bkit-protect-main.sh` exists, old name absent, `REQUIRED_JOB="bkit-tests-check"`, preflight greps the new literal | Tasks B1 + B2 + B3 + B4 |
| `bkit-postinstall.ts` Quick-path advisory mentions `bkit-protect-main.sh` + `bkit-tests-check` | Task B5 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed (parent index read; this sub-plan's scope agreed).**

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

Sub-Plan 1 introduces the following breaking changes (parent table at [`plan-v4-split.md`](./plan-v4-split.md#breaking-changes--naming-review-human-review-required) is canonical):

<!-- prettier-ignore -->
| Change | Type | Notes |
| --- | --- | --- |
| New job names in shipped `ci.yml`: `bkit-decide`, `bkit-tests-live`, `bkit-tests-check` (alongside existing `bkit-tests`) | New | Capstone is `bkit-tests-check` (NOT `bkit-gate` — settled per #203 comment 2). |
| `scripts/ci/bkit-set-protection.sh` -> `scripts/ci/bkit-protect-main.sh` (`git mv` rename of both engine + template copy) | Breaking | Tier-3 seed-or-print: existing consumers keep their copy; postinstall advisory + CHANGELOG (Sub-Plan 2 E10) flag the rename. |
| `REQUIRED_JOB` constant: `"bkit-tests"` -> `"bkit-tests-check"` inside `bkit-protect-main.sh` | Breaking | Consumer ci.yml MUST already carry `bkit-tests-check` for the preflight to pass. |
| Postinstall advisory "Quick path" text + "Require status checks: bkit-tests" line | Behavioural | Both updated to reference `bkit-protect-main.sh` and `bkit-tests-check`. |

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed.**

---

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Package Management:** `package.json` unchanged; `pnpm-lock.yaml` clean.
- [ ] **Dependency Versions:** No new deps; existing `picomatch` retained.
- [ ] **User Context:** Worktree at `.worktrees/203-ci-green-validated`; CLAUDE.md and `.agents/rules.md` read.
- [ ] **Pending Blockers:** No open Linear blockers tagged for #203; #209 is sibling and out of scope.
- [ ] **Project Context:** `docs/knowledge.md` and `docs/decisions.md` checked for prior CI-shape decisions (none conflicting). Template ci.yml must lint clean via `actionlint`.
- [ ] **Testing & Quality:** `docs/testing.md` reviewed; bkit tests are pure Vitest, no Playwright.
- [ ] **Prerequisite Plans:** None.
- [ ] **Gether reference read:** `/Users/christian/Documents/GitHub/app-gether-life/.github/workflows/ci.yml` lines ~49-1101 (the source of the COPY) read at least once.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** Human checkbox `[x]`.
- [ ] **Breaking Changes confirmed:** Human checkbox `[x]`.
- [ ] **Gate 1 - Verified:** All Core items checked.

---

## Architecture & Component Changes (Sub-Plan 1 scope)

### Layer 1 — CI scaffold (foundational; lands first)

#### [MODIFY] `.bkit/templates/.github/workflows/ci.yml`

- **Existence Check:** present.
- **Strategy (per PRIMARY STEER 2026-06-02):** **Copy gether's `/Users/christian/Documents/GitHub/app-gether-life/.github/workflows/ci.yml` near-verbatim** and parameterize only consumer-specific VALUES.
- Rewrite from single `bkit-tests` job to 4-job shape:
  - **`bkit-decide`** — COPIED CANONICAL from gether `ci.yml` lines ~49-547. Includes: checkout depth 0; bare `turbo` install + `Resolve base ref` step (PR -> `origin/{base_ref}`, push -> `BEFORE_SHA`, dispatch -> `origin/HEAD~1` fallback); **`Detect affected packages` step (turbo query affected --packages) copied verbatim** including zero-SHA / turbo-error / stderr-merge fallbacks — emits `affected_packages` / `web_affected` / `global_dep_changed` / `global_dep_triggers`; `Read markers` step copied verbatim (all 6 markers via `env:` to avoid script-injection — NEVER inline `${{ github.event.* }}` inside `run:`); `Layer 1 — whether to run` + `Layer 2 — how much to run` + `Compute liveness and E2E gate` steps copied verbatim (two-layer precedence; main-carveout; push-to-dev `gh api repos/{owner}/{repo}/commits/{sha}/pulls` auto-escalate with API-error fallback `depth_source=fallback-on-api-error`); `Assemble and emit plan JSON` step copied verbatim with the same jq schema-validation loop (`for field in schema run_level web_affected should_run_e2e live_should_run depth_source whether_reason; do has($f) and .[$f] != null; done` — `exit 1` on missing); `Write plan-table-v1 to step summary` step (`if: "!cancelled()"`) copied verbatim; `Write cancellation notice` step (`if: cancelled()`) copied verbatim. Parameterize: branch literal `main` / `dev` -> `{{DEFAULT_BRANCH}}` and `dev` where applicable; action SHAs left at gether's pinned versions (consumer can bump); `web` literal in `WEB_AFFECTED=$(echo "$PACKAGES" | jq 'any(.[]; . == "web")')` may stay as `web` since that's the gether/template archetype's web-app workspace name (document via inline comment).
  - **`bkit-tests`** — COPIED CANONICAL from gether `ci.yml` lines ~548-974. `if: fromJSON(needs.bkit-decide.outputs.plan).run_level != 'none'`; `needs: [bkit-decide]`; **declares `outputs: { integration_outcome: ${{ steps.integration.outcome }}, e2e_outcome: ${{ steps.e2e.outcome }} }` verbatim**; preserves the existing `# bkit:start verbose-ci-env` named block VERBATIM at the same 4-space indent (`bkit-preflight` regex match is exact). Steps copied near-verbatim: Checkout (fetch-depth 0), Fetch Base Branch, Guard Migration Immutability, Materialise Base Worktree (slop-scan delta), Setup pnpm/Node, Configure Verbose CI, Install Dependencies, Install Vale, Run Lint / Typecheck / Format / Vale / Slop-Scan (full + delta), Tear Down Base Worktree, Run Bkit Check, Pull Vercel Env Vars (with fail-fast on missing `NEXT_PUBLIC_SUPABASE_URL` and CRITICAL*KEYS loop), Validate Environment, **Resolve Vercel URL** (gated `if: fromJSON(needs.bkit-decide.outputs.plan).web_affected`, queries Vercel API by `meta-githubCommitSha` with `state=READY,BUILDING,QUEUED,INITIALIZING` filter and 60s retry — copied canonical), Apply Supabase Migrations (gated to push events on `{{DEFAULT_BRANCH}}` / `dev`), Run Vitest Unit Tests, Build All Packages, **Run Vitest Integration Tests with `id: integration`** (gated `if: fromJSON(needs.bkit-decide.outputs.plan).web_affected`), **Await Vercel Deployment** (gated `run_level == 'full' && web_affected`), Check Stale Test Data, **Run Playwright E2E Tests with `id: e2e`** (gated `(run_level == 'full' || should_run_e2e) && web_affected`), Upload Playwright Report, Report Skipped Tests. Parameterize: all `secrets.VERCEL*\_`/`secrets.SUPABASE\_\_`/`secrets.VERCEL_AUTOMATION_BYPASS_SECRET`/`secrets.GH_BKIT_TOKEN`left as`${{ secrets.X }}` references (consumer-provided); production preview URLs (`https://app-gether-life.vercel.app` / `https://app-gether-life-git-dev-gether-life.vercel.app`) -> `https://{{PROJECT_SLUG}}.vercel.app` / `https://{{PROJECT_SLUG}}-git-dev-{{TEAM_SLUG}}.vercel.app` placeholders with one-line stub-comment; `apps/web` workspace path left as-is (template archetype). The existing `Detect Direct Push` step in today's template (lines 88-107) is replaced by `bkit-decide`'s marker + escalation steps — but per Task A2b a `name: Detect Direct Push` step is RETAINED inside `bkit-decide` as a thin compat alias so `detectRunLevelsNotComposed` (`.bkit/src/bkit-postinstall.ts` L713) still fires its advisory. The existing `Check SHA Cache` step (today's lines 67-86) is gether-specific via SHA-cache-skip — NOT in gether's ci.yml — KEEP in `bkit-tests` as the first step (cache-skip is independent of the plan).
  - **`bkit-tests-live`** — COPIED CANONICAL from gether `ci.yml` lines ~975-1043. `needs: [bkit-decide, bkit-tests]`; `if: fromJSON(needs.bkit-decide.outputs.plan).live_should_run && needs.bkit-tests.result == 'success'` (re-add the bkit-tests success gate that gether's TEMP DEBUG note removes); `env:` block with `TURBO_TOKEN` / `TURBO_TEAM` / `VERCEL_ORG_ID` / `VERCEL_PROJECT_ID` / `GH_BKIT_TOKEN` / `TURBO_LOG_LEVEL` / `VERBOSE_CI` copied verbatim; Steps: Checkout, Setup pnpm/Node, Configure Verbose CI, Install Dependencies, Pull Vercel Env Vars, **Run Live Tests** (`env: LIVE_API: "1"`; resolves `DEPLOY_URL` from branch; runs `npx turbo run test:live --continue`). Parameterize: same secret + URL placeholders as `bkit-tests`. **This is a CANONICAL job body, NOT a commented `bkit-stub:` block** (per STEER: "present + parameterized" not "commented-out stub").
  - **`bkit-tests-check`** — COPIED CANONICAL from gether `ci.yml` lines ~1044-1101 (the 5-rule capstone). Exact shape per PRIMARY STEER block above.
- **Reserve commented `bkit-stub:` blocks ONLY for genuinely-not-universal tiers:** keep `bkit-stub:supabase-migrate` (some consumers run Supabase via different tooling), `bkit-stub:test-presence`, `bkit-stub:smoke` (separate workflow file), `bkit-stub:auto-force-e2e`, `bkit-stub:migrations-immutable` (already canonical inside `bkit-tests`'s Guard Migration Immutability step; the legacy stub variant can be removed since the canonical step now ships present). Remove the `bkit-stub:vercel-await` / `bkit-stub:e2e` / `bkit-stub:e2e-artifacts` stubs — those tiers are now CANONICAL inside `bkit-tests` / `bkit-tests-live`.
- Preserve workflow-level `concurrency` block, `permissions`, and `on:` triggers — adopt gether's shape (`permissions: contents: read, statuses: read, pull-requests: read`; `concurrency` group `${{ github.workflow }}-${{ github.head_ref || github.ref_name }}` cancel-in-progress true). `on:` triggers parameterized: `branches: [{{DEFAULT_BRANCH}}, dev]`.
- Workflow-level `env:` block: copy `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24` + `TURBO_FORCE` (force-cache marker) from gether verbatim.
- Honour the file's Tier-3 "yours to own" header semantics — bkit never rewrites this file after first seed.

#### [MODIFY] `.github/workflows/ci.yml` (bkit's OWN — dogfood)

- **Existence Check:** present.
- Degenerate 3-job shape: `bkit-decide` (markers + run_level + merged-PR escalation, NO turbo affected-graph since bkit is single-package — `web_affected` hardcoded `true`, `should_run_e2e` hardcoded `false`, `live_should_run` hardcoded `false`); `bkit-tests` (today's static+unit+integration steps); NO `bkit-tests-live` job at all; `bkit-tests-check` capstone (`needs: [bkit-decide, bkit-tests]`, `if: !cancelled()`, asserts both succeeded).
- **`bkit-decide` MUST contain a step `name: Detect Direct Push`** (the same literal name today's template uses at lines 88-107). Rationale: `.bkit/src/bkit-postinstall.ts` L713 (`detectRunLevelsNotComposed`) keys its advisory off this literal step name; retaining the name avoids breaking the detector contract.
- Fold existing `Check SHA Cache` step into `bkit-decide` as a step BEFORE the marker read (`bkit-tests` becomes `needs: [bkit-decide]` and `if: fromJSON(needs.bkit-decide.outputs.plan).run_level != 'none' && needs.bkit-decide.outputs.cache_hit != 'true'`, with the `cache_hit` field added to the plan JSON).
- Preserve workflow-level `permissions` + `concurrency` block + `on:` triggers verbatim.
- `actions: read` permission stays (used by SHA-cache `gh run list`).
- **Self-CI sequencing safety:** before commit, validate the bkit-decide + bkit-tests-check `run:` bodies with `actionlint -shellcheck=shellcheck` (Task A3a) — actionlint's default pass alone can let logic typos through.

### Layer 1 — Protection script rename (follows ci.yml changes)

#### [DELETE] `scripts/ci/bkit-set-protection.sh`

- Reason: renamed to `bkit-protect-main.sh` via `git mv` to preserve file history.

#### [NEW] `scripts/ci/bkit-protect-main.sh`

- Same content as `bkit-set-protection.sh` with these changes:
  - Header comment block: `bkit-set-protection.sh` -> `bkit-protect-main.sh` (all 3 occurrences).
  - `REQUIRED_JOB="bkit-tests"` -> `REQUIRED_JOB="bkit-tests-check"`.
  - All log prefix strings `[bkit-set-protection]` -> `[bkit-protect-main]` (lines 65, 70, 71, 79, 113).
  - Usage block (`bash scripts/ci/bkit-set-protection.sh …`) -> `bash scripts/ci/bkit-protect-main.sh …` (lines 21-23).
  - Pre-flight grep regex `^[[:space:]]+${REQUIRED_JOB}:` unchanged in shape — but the value flips to `bkit-tests-check`.

#### [DELETE] `.bkit/templates/scripts/ci/bkit-set-protection.sh`

- Reason: same rename, template-side.

#### [NEW] `.bkit/templates/scripts/ci/bkit-protect-main.sh`

- Identical content to the engine copy.

### Layer 1 — Postinstall advisory (follows protection-script rename)

#### [MODIFY] `.bkit/src/bkit-postinstall.ts`

- **Existence Check:** present (lines 1622-1641 grep'd).
- Line 1622: `const protectionScript = path.join(cwd, "scripts", "ci", "bkit-set-protection.sh")` -> `…/bkit-protect-main.sh`.
- Line 1625: Quick-path string `"…bkit ships scripts/ci/bkit-set-protection.sh — run bash scripts/ci/bkit-set-protection.sh --dry-run …a bkit-tests job exists in .github/workflows/ci.yml before requiring it as a status check."` -> `"…bkit ships scripts/ci/bkit-protect-main.sh — run bash scripts/ci/bkit-protect-main.sh --dry-run to preview the policy, then drop --dry-run to apply. The script pre-flights that a bkit-tests-check job exists in .github/workflows/ci.yml before requiring it as a status check."`.
- Line 1636: `"    - Require status checks: bkit-tests\n"` -> `"    - Require status checks: bkit-tests-check\n"`.

---

## Agent Execution Runbook (Sub-Plan 1 — Phases A + B)

> Every task carries a terse, codebase-verifiable `Done when:` line. Tasks are ordered chronologically with explicit dependencies. Phase A ci.yml changes MUST land before Phase B (the protection script's preflight greps the ci.yml for `bkit-tests-check`).

### Phase A — Layer 1 ci.yml (foundational; everything else depends on the capstone existing)

- [ ] **Task A1:** Backup-read both ci.yml files (template + bkit's own) and the gether reference ci.yml (`/Users/christian/Documents/GitHub/app-gether-life/.github/workflows/ci.yml`); inline-document the COPY mapping (which gether line ranges become which template sections) as a short multi-line YAML comment header in the template — single comment block, no executable change. This is the bridge note for Task A2's copy-fidelity pass.
  - **Scope:** `.bkit/templates/.github/workflows/ci.yml` (header comment only).
  - **Done when:** the file's first 30 lines contain a comment block matching the literal substring `scaffold: bkit-decide -> bkit-tests / bkit-tests-live -> bkit-tests-check (copied from gether #403; see plan-v2-reviewed §Architecture Layer 1)`; `pnpm lint:workflows` (actionlint) exit 0; no job-level changes yet.

- [ ] **Task A2:** Rewrite `.bkit/templates/.github/workflows/ci.yml` to the 4-job shape per Architecture § Layer 1 — **copy gether's `ci.yml` near-verbatim per PRIMARY STEER**, parameterizing only values: `{{DEFAULT_BRANCH}}` / Vercel preview URL placeholders / secret references. Preserve `# bkit:start verbose-ci-env` named block VERBATIM at 4-space indent. Retain a step `name: Detect Direct Push` inside `bkit-decide` (compat alias for `detectRunLevelsNotComposed`). Add `bkit-tests-check` capstone copied verbatim from gether L1044-1101. `bkit-tests-live` ships as a CANONICAL job body (NOT a commented `bkit-stub:` block).
  - **Scope:** `.bkit/templates/.github/workflows/ci.yml`.
  - **Done when:** `grep -cE '^[[:space:]]*bkit-(decide|tests|tests-live|tests-check):[[:space:]]*$' .bkit/templates/.github/workflows/ci.yml` returns exactly `4`; `grep -c '^    # bkit:start verbose-ci-env$' …ci.yml` returns exactly `1`; `grep -c 'name: Detect Direct Push' …ci.yml` returns at least `1`; `grep -c 'Run Live Tests' …ci.yml` returns exactly `1` (un-commented — verify with `grep -cE '^      - name: Run Live Tests$' …ci.yml`); `grep -c 'integration_outcome:' …ci.yml` returns at least `1` AND `grep -c 'e2e_outcome:' …ci.yml` returns at least `1`; `grep -c 'plan-table-v1' …ci.yml` returns exactly `4` (matches gether reference: jq schema-tag occurrence + assemble-step `schema=plan-table-v1` literal + summary-table header occurrence + cancellation-notice schema-tag echo — verified `grep -c "plan-table-v1" /Users/christian/Documents/GitHub/app-gether-life/.github/workflows/ci.yml` returns `4`); `grep -c 'Write cancellation notice' …ci.yml` returns exactly `1`; `actionlint .bkit/templates/.github/workflows/ci.yml` exits 0.

- [ ] **Task A2b (compat retain):** Verify `detectRunLevelsNotComposed` detector contract preserved.
  - **Scope:** `.bkit/templates/.github/workflows/ci.yml` (verification — A2 already retained the step name).
  - **Done when:** `grep -c 'Detect Direct Push' .bkit/templates/.github/workflows/ci.yml` returns at least `1`; the 11 existing tests in `.bkit/src/bkit-postinstall.test.ts` covering `detectRunLevelsNotComposed` continue to pass (`pnpm test -- bkit-postinstall` exits 0 and none of those 11 tests skip).

- [ ] **Task A3:** Rewrite `.github/workflows/ci.yml` (bkit's OWN) to the degenerate 3-job shape (`bkit-decide` + `bkit-tests` + `bkit-tests-check`; NO `bkit-tests-live`). Fold the existing `Check SHA Cache` step into `bkit-decide` and surface `cache_hit` on the plan JSON. Retain a step `name: Detect Direct Push` inside `bkit-decide` (detector compat). Preserve `permissions`, `concurrency`, and `on:` blocks verbatim. `actions: read` stays (SHA-cache `gh run list`).
  - **Scope:** `.github/workflows/ci.yml`.
  - **Done when:** `grep -cE '^[[:space:]]*bkit-(decide|tests|tests-check):[[:space:]]*$' .github/workflows/ci.yml` returns exactly `3`; `grep -c 'bkit-tests-live:' .github/workflows/ci.yml` returns exactly `0`; `grep -c 'Detect Direct Push' .github/workflows/ci.yml` returns at least `1`; `actionlint .github/workflows/ci.yml` exits 0; bkit's own CI green on next push (verified in Sub-Plan 2 Phase F manual verification).

- [ ] **Task A3b (bkit-self detectRunLevelsNotComposed contract, MUST-FIX #4):** Verify bkit's OWN post-rewrite `.github/workflows/ci.yml` (Task A3 output) STILL satisfies the `detectRunLevelsNotComposed` detector contract (`.bkit/src/bkit-postinstall.ts` L713) — not just the template. The detector keys off the literal step name `Detect Direct Push`; after A3 folds the SHA-cache step into `bkit-decide` and retains the `Detect Direct Push` step name, the detector's ~11 tests in `.bkit/src/bkit-postinstall.test.ts` MUST still all pass when the detector is run against the bkit-own ci.yml shape (which they implicitly do, since the test suite runs the detector against constructed shapes that mirror real consumer/bkit-own configurations).
  - **Scope:** verification only (no file edits — A3 already retained the step name).
  - **Depends on:** Task A3 (bkit's own ci.yml is at the post-rewrite shape).
  - **Done when:** `pnpm test -- bkit-postinstall.test.ts` exits 0 AND the test summary shows **all 11 `detectRunLevelsNotComposed`-keyed tests PASSED** (verify by running with `--reporter=verbose` and grepping the output for `detectRunLevelsNotComposed` — count of PASS lines must be at least `11`, count of FAIL lines must be exactly `0`); AND `grep -c '^[[:space:]]*- name: Detect Direct Push$' .github/workflows/ci.yml` returns at least `1` (the literal step name the detector matches on is present in bkit's own post-A3 ci.yml). A vacuous pass (zero matched tests) is NOT acceptable for this gate.

- [ ] **Task A3a (self-CI sequencing safeguard, CRITICAL #8):** Shell-logic preview of the bkit-decide + bkit-tests-check `run:` bodies in `.github/workflows/ci.yml`. This catches logic-shape regressions actionlint's default pass might miss (broken `case` arms, unterminated heredocs). Use **`actionlint -shellcheck=shellcheck`** (actionlint already extracts each `run:` body and invokes shellcheck on it — this IS the deterministic verification that every embedded shell body was syntax-checked + lint-checked). The method is pinned: actionlint with `-shellcheck` flag. No yq extraction, no tmp-file scripting, no "equivalent the implementer authors" escape hatch.
  - **Scope:** verification only.
  - **Precondition:** Task A3 complete (bkit's own `ci.yml` carries the `bkit-tests-check:` job and the `bkit-decide:` job) — otherwise the actionlint pass has nothing to validate.
  - **Done when:** `actionlint -shellcheck=shellcheck .github/workflows/ci.yml` exits 0 — this is a single deterministic command, no extraction logic, no version-dependent `yq` invocation. If `shellcheck` is not on PATH, install it (`brew install shellcheck` on macOS) before running this task; the gate does NOT silently degrade.

- [ ] **Task A4:** Local sanity (no commit yet): `pnpm lint:workflows` (actionlint) on both ci.yml files PLUS `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml`; render-test the template via `pnpm test -- bkit-templates.content` to confirm `verbose-ci-env` block tests still pass against the PRE-extension test set (sanity that the rewrite did not break the existing verbose-ci-env structural tests; the EXTENDED test set covering the new 4-job shape runs after Sub-Plan 2 Task E1).
  - **Scope:** verification only.
  - **Done when:** `pnpm lint:workflows` exits 0 (all three workflow files clean); `pnpm test -- bkit-templates.content` exits 0 against the pre-extension test set (Sub-Plan 2 Task E1 extends it later).

- [ ] **Task A5 (snapshot regen, CRITICAL #3):** After Task A2 lands, the full-file template snapshot `.bkit/src/__snapshots__/bkit-templates.content.test.ts.snap` (single `toMatchSnapshot()` at `bkit-templates.content.test.ts` line 61-63) is stale. Regenerate via `pnpm test -- bkit-templates.content -u` (Vitest's update-snapshot flag), THEN eyeball-review `git diff -- .bkit/src/__snapshots__/bkit-templates.content.test.ts.snap` to confirm the new 4-job shape is INTENTIONAL — never rubber-stamp the regeneration. If the diff contains anything unexpected (orphan stubs not removed, missing `Detect Direct Push` compat alias, missing capstone), fix the template and re-run, do NOT accept the snapshot blindly.
  - **Scope:** `.bkit/src/__snapshots__/bkit-templates.content.test.ts.snap`.
  - **Done when:** `pnpm test -- bkit-templates.content` exits 0 (after `-u` regen and manual diff acceptance); `git diff --stat .bkit/src/__snapshots__/bkit-templates.content.test.ts.snap` shows a non-zero diff (snapshot WAS regenerated, not skipped); a one-line human-acceptance note added to the commit message ("snapshot regenerated and reviewed: $TIMESTAMP").

### Phase B — Layer 1 protection script + postinstall (depends on Phase A landing `bkit-tests-check` in both ci.yml files)

- [ ] **Task B1:** `git mv scripts/ci/bkit-set-protection.sh scripts/ci/bkit-protect-main.sh` (engine).
  - **Scope:** `scripts/ci/`.
  - **Done when:** `git status` shows the rename (R); old path does not exist (`test ! -f scripts/ci/bkit-set-protection.sh`); new path exists (`test -f scripts/ci/bkit-protect-main.sh`).

- [ ] **Task B2:** `git mv .bkit/templates/scripts/ci/bkit-set-protection.sh .bkit/templates/scripts/ci/bkit-protect-main.sh` (template mirror).
  - **Scope:** `.bkit/templates/scripts/ci/`.
  - **Done when:** same as B1, template path.

- [ ] **Task B3:** Edit `scripts/ci/bkit-protect-main.sh`: `REQUIRED_JOB="bkit-tests"` -> `"bkit-tests-check"`; update header comment block (3 occurrences of `bkit-set-protection`), usage block, all `[bkit-set-protection]` log prefixes (5 occurrences) to `[bkit-protect-main]`. Mirror identical edits to `.bkit/templates/scripts/ci/bkit-protect-main.sh`.
  - **Scope:** both renamed scripts.
  - **Done when:** `grep -n "bkit-set-protection" scripts/ci/bkit-protect-main.sh .bkit/templates/scripts/ci/bkit-protect-main.sh` returns no matches; `grep -n 'REQUIRED_JOB="bkit-tests-check"' scripts/ci/bkit-protect-main.sh` returns one match.

- [ ] **Task B4:** `bash scripts/ci/bkit-protect-main.sh --dry-run` from repo root (the worktree root — `cd "$WORKTREE_PATH"` first; the script reads `.github/workflows/ci.yml` relative to PWD).
  - **Scope:** verification.
  - **Depends on:** **Task A3** (bkit's own `.github/workflows/ci.yml` carries the `bkit-tests-check:` job), **Task A1** + **Task A2** (template carries the scaffold — irrelevant to this dry-run since the script reads the engine ci.yml, but listed for sequencing clarity), and **Task B3** (`REQUIRED_JOB="bkit-tests-check"`). Out-of-order execution is detected by the explicit precondition below.
  - **Precondition (LOUD-fail guard against out-of-order execution):** Before running the dry-run, run `grep -c '^[[:space:]]*bkit-tests-check:[[:space:]]*$' .github/workflows/ci.yml` from the worktree root and assert it returns at least `1`. If it returns `0`, ABORT this task with the explicit message `BLOCKED: capstone job missing — Task A3 (bkit's own ci.yml carries bkit-tests-check) must complete before Task B4. Do NOT run bkit-protect-main.sh --dry-run; the pre-flight will fail confusingly. Re-run Task A3 first.` Do NOT proceed; this is the loud-failure path for the latent ordering trap flagged in scope-check-2.
  - **Done when:** the precondition grep returned `>= 1`; `bash scripts/ci/bkit-protect-main.sh --dry-run` exits 0; output contains `"contexts": ["bkit-tests-check"]`; the script's internal pre-flight grep against `.github/workflows/ci.yml` passes (echoes a success line, not the missing-job error).

- [ ] **Task B5:** Edit `.bkit/src/bkit-postinstall.ts` per Architecture § Layer 1 Postinstall (line 1622 path; line 1625 Quick-path string; line 1636 status-checks line). Do NOT regenerate `dist/` yet — batched in Sub-Plan 2 Phase F (Task F1). Pin the exact replacement count by reading the file before editing: the three sites are (1) the `protectionScript` path constant at L1622, (2) the Quick-path string at L1625, (3) the status-checks list at L1636 — exactly three replacements, no fourth.
  - **Scope:** `.bkit/src/bkit-postinstall.ts`.
  - **Done when:** `grep -c "bkit-set-protection" .bkit/src/bkit-postinstall.ts` returns exactly `0`; `grep -c "bkit-protect-main" .bkit/src/bkit-postinstall.ts` returns exactly `3` (path constant L1622 + Quick-path string L1625 + dry-run example in Quick-path string L1625 — the Quick-path string contains the file name TWICE: `bkit ships scripts/ci/bkit-protect-main.sh — run bash scripts/ci/bkit-protect-main.sh --dry-run`); `grep -c "Require status checks: bkit-tests-check" .bkit/src/bkit-postinstall.ts` returns exactly `1`; word-boundary check `grep -cE '\bbkit-tests\b(?!-)' .bkit/src/bkit-postinstall.ts` (use `grep -P` if available) returns `0` (no bare `bkit-tests` remains without the `-check` suffix in the advisory strings).

### 🔒 Gate 2: Code Implementation Check (Sub-Plan 1 scope)

- [ ] **Gate 2 - Verified (Sub-Plan 1):** Phase A + Phase B checkboxes ticked; the protection-script rename and ci.yml changes are reflected in the repo (`git status` shows expected file paths modified/renamed/added). `dist/` regen + mirror regen are NOT yet done — that's Sub-Plan 2 Phase F.

---

## Verification Plan (Sub-Plan 1 scope)

### Automated Tests

- [ ] **Workflow validity:** `actionlint` over both `.github/workflows/ci.yml` and `.bkit/templates/.github/workflows/ci.yml`.
- [ ] **Self-CI shell-preview:** `actionlint -shellcheck=shellcheck .github/workflows/ci.yml` exits 0 (Task A3a).
- [ ] **detectRunLevelsNotComposed contract — template:** `pnpm test -- bkit-postinstall` exits 0; all 11 detector tests PASS (Task A2b).
- [ ] **detectRunLevelsNotComposed contract — bkit-self:** same suite re-asserted against bkit's own ci.yml shape (Task A3b — same test file, same 11 tests).
- [ ] **Snapshot regen + human diff review:** `pnpm test -- bkit-templates.content` exits 0; snapshot diff reviewed (Task A5).
- [ ] **Protection script live (dry-run):** `bash scripts/ci/bkit-protect-main.sh --dry-run` exits 0 and prints `"contexts": ["bkit-tests-check"]` (Task B4).
- [ ] **Postinstall source patched:** `grep -c "bkit-protect-main" .bkit/src/bkit-postinstall.ts` returns `3`; `grep -c "bkit-set-protection" .bkit/src/bkit-postinstall.ts` returns `0` (Task B5).

> [!IMPORTANT]
> **No Architectural Downgrades:** Any actionlint or test failure surfacing a real defect in the new ci.yml must be fixed in the ci.yml, not silenced via lint comments or test exclusions.
> **Dist regen NOT in this sub-plan:** `pnpm check:dist` will be RED at the end of Sub-Plan 1 because `bkit-postinstall.ts` has been edited but `dist/` is not yet rebuilt — that's Sub-Plan 2 Task F1. This is expected; do NOT rebuild dist here.

### 🔒 Sub-Plan 1 Verification Gate

- [ ] **Sub-Plan 1 - Verified:** Every Automated Tests checkbox in this sub-plan ticked with explicit output captured. Ready to hand off to Sub-Plan 2.

---

## Handoff to Sub-Plan 2

Once every box above is `[x]` and committed, the following invariants hold (Sub-Plan 2 depends on them):

1. Both `.github/workflows/ci.yml` and `.bkit/templates/.github/workflows/ci.yml` contain a job named `bkit-tests-check`.
2. `scripts/ci/bkit-protect-main.sh` (and the template mirror) exist at the new path; old name is gone.
3. `.bkit/src/bkit-postinstall.ts` source references `bkit-protect-main.sh` (`dist/` is stale — Sub-Plan 2 F1 rebuilds it).
4. Full-file template snapshot is up to date with the new 4-job shape.

Sub-Plan 2 will: rewrite Layer-2 ship/debug gates (Phase C), insert the Layer-3 rules norm (Phase D), author all tests + upgrade the heavy-customised-ci fixture + update CHANGELOG/docs/pending (Phase E), then run the FINAL batched `pnpm build` + `pnpm bkit install` regen (Phase F).
