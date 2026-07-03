<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# Sub-Plan B (WS-2) — Compliance grader (P2)

**Parent Plan:** [`plan-v4-split.md`](./plan-v4-split.md)
**Master Plan (full source):** [`plan-v3-checked.md`](./plan-v3-checked.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual sub-plan file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document.

## Workstream Dependency

- **Requires:** Sub-plan A (WS-1) shipped to dev — the grader reads/writes the WS-1 codec (`bkit-telemetry.ts`), appends `kind:"compliance"` rows to `.bkit/stats.jsonl`, and reuses WS-1's protected-path/exemption surface.
- **Concurrency:** May run concurrent with Sub-plan C (WS-3).
- **Blocks:** WS2-T1 (the shared CLI entrypoint/namespace decision) blocks the CLI plumbing of Sub-plans D (WS-4) and E (WS-5). Sub-plan E may begin once WS2-T1 is recorded (even before the rest of B ships). Sub-plan D requires B fully shipped.

## Context & Goals

WS-2 implements the compliance grader (#232 consolidated into #234): pure functions over `git diff parentSha..HEAD` + files, deterministic and advisory (never-gating, fail-open), emitting one `kind:"compliance"` row per run×rule into `.bkit/stats.jsonl` and surfacing violations in `ship-summary.md`. It also resolves the shared CLI substrate decision (WS2-T1) that WS-2/WS-4/WS-5 all inherit. **bkit-repo tooling — NO database, API, UI, or RLS.**

**Success Criteria (this workstream):**

- The compliance grader runs as a deterministic, advisory (never-gating, fail-open) step over `git diff parentSha..HEAD` + files, surfaces violations in `ship-summary.md`, and emits one compliance row per run×rule — and the same run never blocks because telemetry/grading failed.
- The single protected-path table drives both the grader and a COMMITTED generated `.cjs` (drift-tested); install stays a byte-equal Tier-1 copy.
- The CLI dispatch/parse architecture (entrypoint isolation + verb namespace) is recorded ONCE (WS2-T1) and inherited by all downstream verb-adding workstreams.

## Acceptance Scenario (scoped to WS-2)

### Narrative _(inherited from design — do not rewrite)_

As a bkit maintainer, I run a workflow (design/plan/build/debug/ship) and at its close it appends machine-readable telemetry rows to `.bkit/*.jsonl` / `docs/*.jsonl` — compliance grades, run outcomes, deterministic attempt/failure counts, friction, deferrals, and discovered bugs — without me writing prose ledgers by hand. At ship, the summary step shows me an aggregate rollup of the whole design→plan→build→debug→ship chain (counts, rates, elapsed times, compliance violations) read straight from those logs. Later, I run a harvest CLI that copies the same telemetry from my consumer repos on this machine and an analysis CLI tells me where compliance is regressing and whether change size predicts PR error rate — all without ever mutating a consumer's files.

### Success Criteria _(inherited from design — do not rewrite)_

2. The compliance grader runs as a deterministic, advisory (never-gating, fail-open) step over `git diff parentSha..HEAD` + files, surfaces violations in `ship-summary.md`, and emits one compliance row per run×rule — and the same run never blocks because telemetry/grading failed.

### Concrete Example _(WS-2 slice)_

**Setup:** A bkit maintainer on the bkit repo itself, post WS-1+WS-2 ship, with `dist/` built. A `bkit-ship` run is closing on a feature branch whose `parentSha` is the design-start commit.

**Steps:**

1. The maintainer reaches the ship close gate → the workflow runs `pnpm bkit comply --phase ship || echo "[bkit-comply] grader unavailable, skipping"` → the grader diffs `parentSha..HEAD`, finds a `.claude/*` mirror edit, and appends one `kind:"compliance"` row per rule to `.bkit/stats.jsonl`.
2. The ship-summary step surfaces the violations in `ship-summary.md`.

**Outcome:** The workflow completed even though the grader found a violation (advisory, never gated); the maintainer sees the violation surfaced.

### Edge Cases _(WS-2 slice)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Grader missing / `dist/` stale / grader throws at close gate | Fail-open idiom `pnpm bkit comply --phase {p} \|\| echo "[bkit-comply] grader unavailable, skipping"` guarantees exit 0; advisory step never becomes a hard gate |
| Reader meets a row with unknown (greater) `schemaVersion` | Warn-and-exclude (inherited from WS-1 codec); grader rows carry `schemaVersion` |

### Derived Test Matrix _(WS-2 portion)_

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Best-effort + fail-open idioms guarantee exit 0: forcing the grader-unavailable path (`\|\| echo "[bkit-comply] grader unavailable"`) leaves shell exit 0 (locked SC #4) | Unit (bats) **boundary: shell exit codes** | `scripts/tooling/telemetry-failopen.bats` |
| Compliance grader pure fn `(parentSha, phase, planPath) -> Violation[]` flags `no-mirror-edit` + `skip-ci-not-head` deterministically | Unit (Vitest) | `.bkit/src/bkit-comply.test.ts` |
| Grader emits one `kind:"compliance"` row per run×rule with `graderVersion` + `bkitVersion` | Unit (Vitest) | `.bkit/src/bkit-comply.test.ts` |
| Grader run over a REAL `git diff parentSha..HEAD` in a temp git repo flags an injected mirror edit | Integration **boundary: git diff** (Vitest) | `.bkit/src/bkit-comply.integration.test.ts` |
| `gate-paths.generated.cjs` drift test FAILS if the committed generated file diverges from the TS path-policy table | Unit (Vitest) | `.bkit/src/bkit-paths-policy.test.ts` |
| `comply` verb parses `--phase` + dispatches; unknown sub-verb/flag exits cleanly | Unit (Vitest) | `.bkit/src/bkit-cli.test.ts` (extend) |
| Close-gate wiring audit: EVERY wired close gate carries the fail-open `pnpm bkit comply --phase {p} \|\| echo "[bkit-comply] grader unavailable, skipping"` guard, and NO invocation sits on its own line under a bare `set -e` block that would defeat the `\|\| echo` (grep over workflow files) | Integration (Vitest grep over workflow files) | `.bkit/src/bkit-comply-gate-wiring.test.ts` |

## Architecture & Component Changes (WS-2)

**CRITICAL:** All edits land in canonical `.bkit/`, `.agents/`, root config; `.claude/*`/`.cursor/*` mirrors are regenerated by the install engine — NEVER hand-edited. ASCII operators only in workflow/prompt files.

#### [NEW] `.bkit/src/bkit-comply.ts` (+ `.test.ts`, `.integration.test.ts`)

- Pure functions `(parentSha, phase, planPath) -> Violation[]` over `git diff parentSha..HEAD` + files; deterministic, advisory. Smallest-first rule set: `no-mirror-edit` (`.claude/*`/`.cursor/*` untouched in diff), `skip-ci-not-head` (`git log -1`). Each rule = data citing the prohibition it grades; `graderVersion` + `bkitVersion` stamped on every emitted `kind:"compliance"` row.

#### [NEW] `.bkit/src/bkit-paths-policy.ts` (+ `.test.ts`)

- **OPEN QUESTION (resolve in WS-2 plan-review): new `bkit-paths-policy.ts` vs extend `bkit-tiers.ts`.** Recommendation: NEW file — keeps the protected-path table single-purpose and importable by both grader and the generated `.cjs` without coupling to the install-tier logic. Holds the single protected-path table (mirrors `gateguard.cjs`'s `GATE_CONFIG_PATTERNS` concept, `gateguard.cjs:45`).

#### [NEW] `.claude/hooks/gate-paths.generated.cjs` + drift test (`.bkit/src/bkit-paths-policy.test.ts`)

- COMMITTED generated `.cjs` emitted from the TS table; drift test FAILS if the committed file diverges. NOT install-time codegen — install stays a byte-equal Tier-1 copy.

#### [MODIFY] `.bkit/src/bkit-cli.ts` (+ `bkit-cli.test.ts`) (Existence Check: exists)

- **Net-new CLI plumbing.** Extend the `Verb` union (currently `"install" | "check" | "doctor" | "uninstall" | "upgrade" | "help"`, `bkit-cli.ts:30`) with `comply`; add `--phase` value parsing (mirror the `parseIssueTracker`/`parseCloudVariant` discipline at `bkit-cli.ts:198–238`); add dispatch + usage. **Resolve the entrypoint OPEN QUESTION** (share `dist/bkit-install.js` vs separate entrypoint so a grader crash never touches the install hot path) BEFORE this lands.

#### [MODIFY] all 5 workflow close gates (or ship-only first — OPEN QUESTION)

- Invoke the grader under the PINNED fail-open idiom `pnpm bkit comply --phase {phase} || echo "[bkit-comply] grader unavailable, skipping"` (guaranteed exit 0). Append `kind:"compliance"` rows to `.bkit/stats.jsonl`; surface violations in `ship-summary.md`. **Resolve the per-phase rollout OPEN QUESTION** (all-5 from P2 vs ship-only first; smallest-first leans ship-only).

## Security & Privacy

- CLI arg parsing (`--phase`) is validated/narrowed in `bkit-cli.ts` (reject unknown verb/flag with clean exit), mirroring `parseIssueTracker`/`parseCloudVariant`. No Zod. Grader rows carry repo/workflow/step metadata + rule ids; NO secrets.
- _Net: no new routes, DB writes, secrets, or untrusted-network input._

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Package Management:** Verify `package.json` — no NEW runtime dependency. bats harness stays dev-only.
- [ ] **Dependency Versions:** Spot-check `node --version` (>=20), `npx tsc --version`, `git --version`, `pnpm --version`.
- [ ] **User Context:** Verify read/write access to `.bkit/src/`, `.bkit/workflows/`, `.claude/hooks/`, `bkit-cli.ts`.
- [ ] **Pending Blockers:** Query tracker for open `blocker`-labelled issues relevant to telemetry/grading.
- [ ] **Project Context:** Read `docs/knowledge.md` + `docs/decisions.md` for relevant patterns (gateguard advisory/fail-open precedent — #230 GateGuard shipped `7732d69`, the grader mirrors its deterministic-advisory / fail-open precedent and shares the protected-path table; ASCII operators in workflow files).
- [ ] **Testing & Quality:** Align with `docs/testing.md`. Boundary tests (git diff, shell exit codes) run against ground truth, NOT mocks.
- [ ] **Prerequisite Plans:** **Sub-plan A (WS-1) MUST be fully shipped+verified to dev BEFORE this sub-plan starts** (grader writes WS-1's codec/ledger).

### Conditional

- [ ] **Architecture & UI** — Validate against `docs/architecture.md` + the canonical-source rule. No UI.
- [ ] **Observability** — Confirm `[bkit-comply]` grep-able log prefix documented per `docs/observability.md`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** Human confirmed the master `👤 Acceptance Scenario` section (`plan-v3-checked.md`). _(Unchecked → REVISE.)_
- [ ] **Breaking Changes confirmed:** Human confirmed the master `⚠️ Breaking Changes & Naming Review` section. _(Unchecked → REVISE.)_
- [ ] **Gate 1 - Verified:** All Core items checked (incl. WS-1 shipped). All applicable Conditional items checked.

## Agent Execution Runbook (WS-2)

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate.
> **Blockers:** If a task cannot be completed, DO NOT fail silently — create a tracker `blocker` issue with context before stopping (and append a `kind:"failure"`/`kind:"deferral"` row).
> **Step Isolation:** Complete each task fully (including its verification + checking its box) before the next.

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable. Tasks crossing an external boundary name the boundary + ground-truth signal in `Done when` (no mocks at boundary).

### WS-2 — Compliance grader (Requires: WS-1)

- [ ] **WS2-T1: Resolve entrypoint + namespace OPEN QUESTIONs (shared CLI-substrate decision for WS-2/WS-4/WS-5).** Decide: share `dist/bkit-install.js` vs separate entrypoint; verb namespace for read/grade verbs. This single decision is the CLI dispatch/parse architecture that WS-2 (`comply`), WS-4 (`harvest`/`analysis`), AND WS-5 (`telemetry migrate`) ALL inherit — it MUST be recorded before any of those three CLI-adding workstreams wires its verb, so the CLI is not forked (and so the destructive `migrate` verb respects the chosen install-path isolation).
  - **Done when:** decision recorded in `docs/decisions.md` (then `.jsonl`) with rationale; the chosen entrypoint isolates a grader/harvest/migrate crash from the consumer-mutating install path; the decision explicitly covers all three downstream verb sets (`comply`, `harvest`/`analysis`, `telemetry migrate`).
- [ ] **WS2-T2: Path-policy table + generated `.cjs` + drift test.** Add `.bkit/src/bkit-paths-policy.ts`; emit committed `.claude/hooks/gate-paths.generated.cjs`; drift test.
  - **Done when:** `.bkit/src/bkit-paths-policy.test.ts` FAILS when the committed `.cjs` is hand-edited to diverge and PASSES when regenerated; grader + generated file import/derive from the one table.
- [ ] **WS2-T3: Grader pure functions + tests.** Write `.bkit/src/bkit-comply.ts` (`no-mirror-edit`, `skip-ci-not-head`) + `.test.ts`.
  - **Done when:** `(parentSha, phase, planPath) -> Violation[]` is deterministic; unit test asserts each rule's pass/fail; every emitted `kind:"compliance"` row carries `graderVersion` + `bkitVersion`.
- [ ] **WS2-T4: Grader git-diff integration test.** Write `.bkit/src/bkit-comply.integration.test.ts`.
  - **Done when (boundary: git diff):** test builds a temp git repo, commits a `.claude/*` mirror edit, runs the grader over a REAL `git diff parentSha..HEAD`, and asserts `no-mirror-edit` is flagged (ground-truth = actual git diff output, no mock).
- [ ] **WS2-T5: `comply` CLI plumbing.** Extend `Verb` union + `--phase` parsing + dispatch + usage in `bkit-cli.ts`; update `bkit-cli.test.ts`. **MUST NOT start until WS2-T1 is recorded** (entrypoint/namespace is a hard gate before the first read/grade verb ships).
  - **Done when:** WS2-T1's decision is recorded FIRST; `bkit-cli.test.ts` asserts `comply --phase ship` parses to `{verb:"comply", phase:"ship"}` and an unknown sub-verb/flag exits cleanly; `tsc --noEmit` passes.
- [ ] **WS2-T6: Close-gate integration + per-phase rollout decision.** Wire the PINNED fail-open idiom into the resolved set of close gates; surface violations in `ship-summary.md`. **MUST NOT start until WS2-T1 is recorded.**
  - **Done when:** every wired close gate contains `pnpm bkit comply --phase {phase} || echo "[bkit-comply] grader unavailable, skipping"`, pinned by `.bkit/src/bkit-comply-gate-wiring.test.ts` (grep over the workflow files confirms the `|| echo` guard on EVERY invocation, and that no invocation sits on its own line under a bare `set -e` block that would defeat the `|| echo`); a forced grader failure leaves workflow exit 0, pinned by `scripts/tooling/telemetry-failopen.bats` (grader-unavailable path asserts shell exit 0, locked SC #4); rollout decision recorded.

### 🔒 Gate 2 (WS-2): Code Implementation Check

- [ ] **Gate 2 (WS-2) - Verified:** Every WS-2 task verified and checked off.

## Testing & Documentation (WS-2 scope)

> [!IMPORTANT]
> **Testing Strategy (See `docs/testing.md`):** bkit-repo tooling — ALL tests are Vitest unit/integration in `.bkit/src/` or bats in `scripts/`. NO Playwright/E2E/Supabase surface. Boundary tests (git diff, shell exit codes) run against ground truth — NO mocks at the boundary.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every WS-2 Derived-Test-Matrix row maps to a checked-off runbook task above.
- [ ] **Update existing tests:** Adjust `bkit-cli.test.ts` (additive per-verb `it` block) and any workflow-content/render-parity tests affected by the new `comply` verb/gate wiring.
- [ ] **Write new tests:** All NEW WS-2 test files listed in the Derived Test Matrix.
- [ ] **Verify observability:** New `[bkit-comply]` log prefix documented in `docs/observability.md`.
- [ ] **Update documentation:** `docs/decisions.md` (WS2-T1 CLI entrypoint/namespace decision; committed-generated-`.cjs` + drift test; grader advisory/fail-open precedent), `docs/architecture.md` (grader subsystem), `docs/testing.md` (git-diff boundary test pattern), `docs/observability.md`.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** Every WS-2 `Documentation Updates` row completed. `.agents/docs.md` accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified.

## Verification Plan (WS-2)

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck` (`tsc --noEmit`) + `pnpm lint:slop` clean; `pnpm lint:workflows` (actionlint) clean; `pnpm format:check`.
- [ ] **dist parity:** `pnpm check:dist` — new `comply` verb compiled + committed.
- [ ] **Generated-file drift:** `gate-paths.generated.cjs` drift test green; render-parity for `.claude`/`.cursor` mirrors after regen.
- [ ] **Test Synchronization:** Re-run the full suite; update `bkit-cli.test.ts`/workflow-content tests in lockstep.
- [ ] **Run all tests:** `pnpm test` green incl. the git-diff boundary integration test; `telemetry-failopen.bats` (grader-unavailable path) green. Fix all failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades:** On build/compile/test errors, NEVER hot-fix or anti-pattern. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** Every Automated Tests checkbox verified with explicit proof (test output, drift-test output).

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Use local CLIs (`gh`, `git`, `jq`, `pnpm`) to verify, not dashboards.

- [ ] **Step 2 (WS-2):** Run `pnpm bkit comply --phase ship` on a branch with a deliberate `.claude/*` edit; confirm a `kind:"compliance"` row + `ship-summary.md` surfacing; rename/break `dist/` and confirm the fail-open `|| echo` keeps exit 0.
