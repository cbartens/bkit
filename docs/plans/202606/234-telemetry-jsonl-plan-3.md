<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# Sub-Plan C (WS-3) — #58 prose→shell counter refactor (P3)

**Parent Plan:** [`plan-v4-split.md`](./plan-v4-split.md)
**Master Plan (full source):** [`plan-v3-checked.md`](./plan-v3-checked.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual sub-plan file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document.

## Workstream Dependency

- **Requires:** Sub-plan A (WS-1) shipped to dev — counters emit `kind:"counter"` rows via the WS-1 codec into `.bkit/stats.jsonl`, and the invariant check folds via WS-1's readers.
- **Concurrency:** May run concurrent with Sub-plan B (WS-2).
- **Blocks:** Sub-plan D (WS-4) requires this shipped (analysis needs trustworthy `shell-bus` counters).

> [!WARNING]
> **Reconcile with `dev`-local `refactor(debug): mode-matched attempt counters` FIRST.** Before any WS-3 edit, re-read the LIVE `bkit-debug.md`/`bkit-build.md` attempt-counter prose (e.g. `MAX_VERIFY_ATTEMPT`/`MAX_DEBUG_ATTEMPT` guards, `bkit-ship.md:91`) against that `dev` change so the prose→shell migration does not fork or regress the mode-matched-counter work. This is the first WS-3 runbook task.

## Context & Goals

WS-3 implements the #58 counter refactor (consolidated into #234): moves every `*_ATTEMPT` counter + `MAX_*` comparison out of orchestrator prose into fenced shell, centralises all `MAX_*` thresholds in one config, and makes exceeding a `MAX_*` non-silent. Counters become `kind:"counter"` events (`counterSource:"shell-bus"`) with a fold-invariant check confirming counter rows equal the count of the steps they count. **bkit-repo tooling — NO database, API, UI, or RLS.**

**Success Criteria (this workstream):**

- After the refactor no `*_ATTEMPT` counter or `MAX_*` comparison lives in orchestrator prose (only fenced shell), all `MAX_*` live in one config, exceeding `MAX_*` cannot silently continue, and a `status.jsonl` invariant check confirms counter rows equal the count of the steps they count.

## Acceptance Scenario (scoped to WS-3)

### Narrative _(inherited from design — do not rewrite)_

As a bkit maintainer, I run a workflow (design/plan/build/debug/ship) and at its close it appends machine-readable telemetry rows to `.bkit/*.jsonl` / `docs/*.jsonl` — compliance grades, run outcomes, deterministic attempt/failure counts, friction, deferrals, and discovered bugs — without me writing prose ledgers by hand. At ship, the summary step shows me an aggregate rollup of the whole design→plan→build→debug→ship chain (counts, rates, elapsed times, compliance violations) read straight from those logs. Later, I run a harvest CLI that copies the same telemetry from my consumer repos on this machine and an analysis CLI tells me where compliance is regressing and whether change size predicts PR error rate — all without ever mutating a consumer's files.

### Success Criteria _(inherited from design — do not rewrite)_

3. After the #58 refactor, no `*_ATTEMPT` counter or `MAX_*` comparison lives in orchestrator prose (only in fenced shell), all `MAX_*` thresholds live in one config, exceeding a `MAX_*` cannot silently continue, and a `status.jsonl` invariant check confirms counter rows equal the count of the steps they count.

### Concrete Example _(WS-3 slice)_

**Setup:** A bkit maintainer driving a build verify loop on the bkit repo, post WS-1 ship.

**Steps:**

1. The maintainer drives the verify loop past `MAX_VERIFY_ATTEMPT`; the shell counter bus `check_max` cannot return "continue".
2. The invariant check folds `.bkit/stats.jsonl` and confirms `counters.verifyAttempt` == count of `plan-verify` rows.

**Outcome:** Exceeding `MAX_*` cannot silently continue; the invariant check passes.

### Edge Cases _(WS-3 slice)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `*_ATTEMPT`/`MAX_*` config exceeded after WS-3 | `decide_next`/`check_max` cannot silently continue past `MAX_*`; invariant check confirms counter rows == counted-step rows |
| Pre-P3 counter rows present alongside post-P3 rows | `counterSource:"model-self-report"` vs `"shell-bus"` makes trust tier structurally distinguishable; analysis filters/labels without inferring P3 ship date |

### Derived Test Matrix _(WS-3 portion)_

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Shell counter bus generic helpers `counter_init/inc/get/reset/check_max` + `decide_next` exit codes/branch routing | Unit (bats) | `scripts/tooling/counter-bus.bats` |
| Per-mode mode-matched counters (DEBUG/NORMAL/SOAK, `bkit-debug.md:47`): each mode's distinct reset semantics (e.g. SOAK reset-to-0 on entry, DEBUG cross-invocation index) AND overflow-routing match the prose; a wrong per-mode branch is caught | Unit (bats) | `scripts/tooling/counter-bus.bats` |
| `status.jsonl`/`stats.jsonl` fold-invariant: `counters.verifyAttempt` == count of `plan-verify` rows | Integration (Vitest) | `.bkit/src/bkit-telemetry-invariant.test.ts` |
| No `*_ATTEMPT`/`MAX_*` comparison in orchestrator prose (only fenced shell); all `MAX_*` in one config | Integration (Vitest grep over workflow files) | `.bkit/src/bkit-counter-prose-audit.test.ts` |

## Architecture & Component Changes (WS-3)

**CRITICAL:** All edits land in canonical `.bkit/`, `.agents/`, root config; `.claude/*`/`.cursor/*` mirrors are regenerated by the install engine — NEVER hand-edited. ASCII operators (`!=` `>=` `<=`) only in workflow/prompt files.

#### [NEW] shell counter bus helper + `MAX_*` config

- `counter_init/inc/get/reset/check_max` + `decide_next` (prints next step id; exit code = branch). ALL `MAX_*` thresholds in ONE config file. Counters emit `kind:"counter"` rows with `counterSource:"shell-bus"` into `.bkit/stats.jsonl` (per A3: control counters live in per-plan `status.jsonl` during run; summary rows appended to central `.bkit/stats.jsonl` at workflow close).

#### [NEW] `scripts/tooling/counter-bus.bats`

- DIRECT bats unit tests for the helpers (not just integration via emitted JSONL) — a wrong `decide_next` branch code would silently mis-route all 5 workflows.

#### [MODIFY] `.bkit/workflows/bkit-{build,debug,plan,design}.md` (staged: build → debug → plan/design)

- Move every `*_ATTEMPT` counter + `MAX_*` comparison out of prose into fenced shell; keep narrative judgment branches (PASS/FAIL/CONCERNS, STANDARD/PIVOT/FINAL). ASCII operators only.

#### [NEW] invariant tests

- `.bkit/src/bkit-telemetry-invariant.test.ts` (`counters.verifyAttempt` == count of `plan-verify` rows via folded readers); `.bkit/src/bkit-counter-prose-audit.test.ts` (grep: no `*_ATTEMPT`/`MAX_*` comparison in prose except fenced shell; all `MAX_*` in one config).

## Supersession Inventory (WS-3 slice)

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| Inline prose `*_ATTEMPT` counters + `MAX_*` comparisons across 5 workflows | Shell counter bus + one `MAX_*` config (WS-3) | DELETE-from-prose (WS-3; reconcile with `dev` mode-matched-counter change first) | #58 prose→shell refactor; deterministic, fold-invariant-checkable. |

## Security & Privacy

- Counter rows carry repo/workflow/step metadata + `counterSource`; NO secrets. Shell helpers do no network I/O.
- _Net: no new routes, DB writes, secrets, or untrusted-network input._

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Package Management:** Verify `package.json` — bats harness stays dev-only (do NOT add to runtime deps).
- [ ] **Dependency Versions:** Spot-check `node --version` (>=20), `jq --version` (system), `bats --version`, `pnpm --version`.
- [ ] **User Context:** Verify read/write access to `.bkit/workflows/`, `scripts/tooling/`, the `MAX_*` config home, `.bkit/src/`.
- [ ] **Pending Blockers:** Query tracker for open `blocker`-labelled issues relevant to counters/#58.
- [ ] **Project Context:** Read `docs/knowledge.md` + `docs/decisions.md`. **MANDATORY pre-flight:** re-read the LIVE `bkit-debug.md`/`bkit-build.md` attempt-counter prose against the `dev`-local `refactor(debug): mode-matched attempt counters` change (mode-matched DEBUG/NORMAL/SOAK triple at `bkit-debug.md:47`) — see WS3-T1. ASCII operators in workflow files.
- [ ] **Testing & Quality:** Align with `docs/testing.md`. counter-bus tests are bats; the invariant test is Vitest over folded readers; boundary tests (shell exit codes) run against ground truth.
- [ ] **Prerequisite Plans:** **Sub-plan A (WS-1) MUST be fully shipped+verified to dev BEFORE this sub-plan starts** (counters emit via WS-1's codec).

### Conditional

- [ ] **Architecture & UI** — Validate against `docs/architecture.md` + the canonical-source rule. No UI.
- [ ] **Observability** — Counter rows use the `[bkit-telemetry]` grep-able prefix per `docs/observability.md`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** Human confirmed the master `👤 Acceptance Scenario` section (`plan-v3-checked.md`). _(Unchecked → REVISE.)_
- [ ] **Breaking Changes confirmed:** Human confirmed the master `⚠️ Breaking Changes & Naming Review` section. _(Unchecked → REVISE.)_
- [ ] **Gate 1 - Verified:** All Core items checked (incl. WS-1 shipped + the `dev` mode-matched-counter reconciliation noted). All applicable Conditional items checked.

## Agent Execution Runbook (WS-3)

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate.
> **Blockers:** If a task cannot be completed, DO NOT fail silently — create a tracker `blocker` issue with context before stopping (and append a `kind:"failure"`/`kind:"deferral"` row).
> **Step Isolation:** Complete each task fully (including its verification + checking its box) before the next.

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable. Tasks crossing an external boundary name the boundary + ground-truth signal in `Done when` (no mocks at boundary).

### WS-3 — Counter refactor (Requires: WS-1)

- [ ] **WS3-T1: Reconcile with `dev` mode-matched-counter change.** Re-read live `bkit-debug.md`/`bkit-build.md` attempt-counter prose vs `refactor(debug): mode-matched attempt counters`.
  - **Done when:** a written reconciliation note recorded in `docs/decisions.md` (then `.jsonl`) — a durable, non-delete-eligible home (NOT only the delete-eligible plan log) — lists every `*_ATTEMPT`/`MAX_*` site (incl. the mode-matched DEBUG/NORMAL/SOAK triple at `bkit-debug.md:47`) and confirms the prose→shell migration preserves the mode-matched reset/overflow semantics; no fork/regression. _(Reconciliation is a judgement-gated step; the durable note is the verifiable artefact.)_
- [ ] **WS3-T2: Shell counter bus + `MAX_*` config + bats tests (incl. per-mode mode-matched coverage).** Implement helpers + single `MAX_*` config; write `scripts/tooling/counter-bus.bats`. Coverage MUST include the mode-matched counters from `bkit-debug.md:47` (DEBUG/NORMAL/SOAK) with their distinct reset/overflow semantics, not only the generic `decide_next`/`check_max` exit codes — a wrong per-mode branch silently mis-routes all 5 workflows.
  - **Done when (boundary: shell exit codes):** `counter-bus.bats` asserts `decide_next` exit code == intended branch for each scenario and `check_max` cannot return "continue" past `MAX_*`; AND a PER-MODE scenario for each mode-matched counter (DEBUG/NORMAL/SOAK) asserts the reset semantics (e.g. SOAK reset-to-0 on entry, DEBUG cross-invocation index) and the overflow-routing match what the prose at `bkit-debug.md:47` specified; bats run green.
- [ ] **WS3-T3: Staged prose→shell migration (build → debug → plan/design).** Move every `*_ATTEMPT`/`MAX_*` comparison into fenced shell; counters emit `counterSource:"shell-bus"`. The mode-matched DEBUG/NORMAL/SOAK sites (`bkit-debug.md:47`) migrate to the per-mode bus helpers proven in WS3-T2.
  - **Done when:** `.bkit/src/bkit-counter-prose-audit.test.ts` (grep) finds no `*_ATTEMPT`/`MAX_*` comparison outside fenced shell and all `MAX_*` in one config; AND each migrated mode-matched DEBUG/NORMAL/SOAK site routes through the WS3-T2 per-mode bats-covered helpers (reset/overflow semantics preserved per the WS3-T1 reconciliation note); test passes.
- [ ] **WS3-T4: Invariant check.** Write `.bkit/src/bkit-telemetry-invariant.test.ts`.
  - **Done when:** test asserts `counters.verifyAttempt` == count of `plan-verify` rows via the folded readers over a fixture log; passes.

### 🔒 Gate 2 (WS-3): Code Implementation Check

- [ ] **Gate 2 (WS-3) - Verified:** Every WS-3 task verified and checked off.

## Testing & Documentation (WS-3 scope)

> [!IMPORTANT]
> **Testing Strategy (See `docs/testing.md`):** bkit-repo tooling — ALL tests are Vitest unit/integration in `.bkit/src/` or bats in `scripts/`. NO Playwright/E2E/Supabase surface. Boundary tests (shell exit codes) run against ground truth — NO mocks at the boundary.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every WS-3 Derived-Test-Matrix row maps to a checked-off runbook task above.
- [ ] **Update existing tests:** Adjust any workflow-content/render-parity tests affected by the prose→shell migration across the 4 workflow files.
- [ ] **Write new tests:** All NEW WS-3 test files listed in the Derived Test Matrix (`counter-bus.bats`, `bkit-telemetry-invariant.test.ts`, `bkit-counter-prose-audit.test.ts`).
- [ ] **Verify observability:** Counter `[bkit-telemetry]` log usage consistent with `docs/observability.md`.
- [ ] **Update documentation:** `docs/decisions.md` (WS3-T1 reconciliation note; counters-as-events), `docs/knowledge.md` (mode-matched counter gotchas), `docs/testing.md` (counter-bus bats pattern).

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** Every WS-3 `Documentation Updates` row completed. `.agents/docs.md` accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified.

## Verification Plan (WS-3)

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck` (`tsc --noEmit`) + `pnpm lint:slop` clean; `pnpm lint:workflows` (actionlint) clean; `pnpm format:check`.
- [ ] **dist parity:** `pnpm check:dist` (rebuild `dist/` + `git diff --exit-code dist/`).
- [ ] **Test Synchronization:** Re-run the full suite; update workflow-content tests in lockstep.
- [ ] **Run all tests:** `pnpm test` green incl. the invariant + prose-audit tests; counter-bus bats green. Fix all failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades:** On build/compile/test errors, NEVER hot-fix or anti-pattern. Halt if stuck. (Highest control-flow blast radius — staged build→debug→plan/design limits scope per revert.)

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** Every Automated Tests checkbox verified with explicit proof (bats output, invariant-test output).

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Use local CLIs (`gh`, `git`, `jq`, `pnpm`) to verify, not dashboards.

- [ ] **Step 3 (WS-3):** Drive a build verify loop past `MAX_VERIFY_ATTEMPT`; confirm it cannot silently continue and the invariant check passes.
