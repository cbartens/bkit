<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# Sub-Plan D (WS-4) — Harvest + analysis (P4)

**Parent Plan:** [`plan-v4-split.md`](./plan-v4-split.md)
**Master Plan (full source):** [`plan-v3-checked.md`](./plan-v3-checked.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual sub-plan file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document.

## Workstream Dependency

- **Requires:** Sub-plans A (WS-1) + B (WS-2) + C (WS-3) ALL shipped to dev. WS-4 is only meaningful once compliance rows (WS-2) and trustworthy `shell-bus` counters (WS-3) exist; its analysis CLI consumes WS-2's `kind:"compliance"` rows for per-rule compliance-rate analysis (the artefact behind the WS-2→WS-4 edge), and the rollup writer + `foldFrom` round-trip use WS-1's codec.
- **Inherits:** the WS2-T1 CLI entrypoint/namespace decision — WS-4's `harvest`/`analysis` verbs MUST use the resolved namespace/entrypoint and MUST NOT start until WS2-T1 is recorded.
- **Concurrency:** None — runs last.

## Context & Goals

WS-4 implements the cross-repo harvest (#233) and size↔outcome analysis (#183), consolidated into #234. The harvest CLI COPIES (never moves/truncates/writes) consumer `.bkit/*.jsonl` and COUNT-ONLY-aggregates `docs/{deferrals,failures}.jsonl`, deduping by per-`kind` composite identity. The analysis CLI reports counts/rates/elapsed-time, the #183 size↔outcome regression, and per-rule compliance rate over WS-2's rows. WS-4 also wires the ship-chain rollup, implements the archive rollup writer, and DELETEs the superseded friction-utility agent. **bkit-repo tooling — NO database, API, UI, or RLS.**

**Success Criteria (this workstream):**

- The harvest CLI copies (never moves/truncates/writes) consumer `.bkit/*.jsonl`, deduplicates by per-`kind` composite identity, and a harvest bug cannot destroy or alter consumer data; the analysis CLI reports counts/rates/elapsed-time and the #183 size↔outcome regression with a dispatch-size threshold.

## Acceptance Scenario (scoped to WS-4)

### Narrative _(inherited from design — do not rewrite)_

As a bkit maintainer, I run a workflow (design/plan/build/debug/ship) and at its close it appends machine-readable telemetry rows to `.bkit/*.jsonl` / `docs/*.jsonl` — compliance grades, run outcomes, deterministic attempt/failure counts, friction, deferrals, and discovered bugs — without me writing prose ledgers by hand. At ship, the summary step shows me an aggregate rollup of the whole design→plan→build→debug→ship chain (counts, rates, elapsed times, compliance violations) read straight from those logs. Later, I run a harvest CLI that copies the same telemetry from my consumer repos on this machine and an analysis CLI tells me where compliance is regressing and whether change size predicts PR error rate — all without ever mutating a consumer's files.

### Success Criteria _(inherited from design — do not rewrite)_

4. The harvest CLI copies (never moves/truncates/writes) consumer `.bkit/*.jsonl`, deduplicates by a per-`kind` composite identity, and a harvest bug cannot destroy or alter consumer data; the analysis CLI reports counts/rates/elapsed-time and the #183 size↔outcome regression with a dispatch-size threshold.

### Concrete Example _(WS-4 slice)_

**Setup:** A bkit maintainer post WS-1+WS-2+WS-3 ship, with `dist/` built and consumer worktrees listed in `docs/bkit-consumers.md`.

**Steps:**

1. The maintainer runs `bkit harvest` (or the harvest verb) → it reads consumer worktrees, COPIES each consumer's `.bkit/{stats,friction}.jsonl`, COUNT-ONLY-aggregates `docs/{deferrals,failures}.jsonl`, dedupes by per-`kind` composite identity, and never writes to any consumer repo.
2. The maintainer runs `bkit analysis` → it folds the harvested rows and reports the #183 size↔outcome regression with a dispatch-size threshold, labelling pre-P3 counters `model-self-report` (untrusted) vs post-P3 `shell-bus` (trusted) via `counterSource`, plus per-rule compliance rate over WS-2's `kind:"compliance"` rows.
3. The ship-summary step folds `.bkit/stats.jsonl` (hot + archive via `foldFrom`) and reports the full design→plan→build→debug→ship chain rollup into `ship-summary.md`.

**Outcome:** A cross-repo analysis and a folded chain rollup; no consumer file was ever mutated.

### Edge Cases _(WS-4 slice)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Malformed / truncated trailing line during harvest read | Tolerant `parse` (WS-1) skips + counts via `malformedLineCount`, NEVER throws; harvest reads whole consumer files, not only live tails |
| Pre-P3 counter rows present alongside post-P3 rows | `counterSource:"model-self-report"` vs `"shell-bus"` makes trust tier structurally distinguishable; analysis filters/labels without inferring P3 ship date |
| `stats.jsonl` grows past threshold (~5,000 rows); P4 rollup ships | P4 rollup writer emits a shard at `ARCHIVE_SHARD_TEMPLATE`; `foldFrom` reads hot + archive so readers do not break |

### Derived Test Matrix _(WS-4 portion)_

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Rollup WRITER (WS-4) produces a shard at `ARCHIVE_SHARD_TEMPLATE` that `foldFrom` reads back with row count preserved (writer↔reader round-trip, distinct from the synthetic-shard reader test) | Unit (Vitest) | `.bkit/src/bkit-analysis.test.ts` |
| Harvest COPIES consumer `.bkit/*.jsonl` and NEVER writes/truncates the consumer repo (consumer file mtime + content unchanged) | Integration **boundary: filesystem/consumer repo** (Vitest) | `.bkit/src/bkit-harvest.integration.test.ts` |
| Harvest dedupes by per-`kind` composite `(ts, repo, …)` across repeat runs; tolerant `parse` skips half-written tail | Unit (Vitest) | `.bkit/src/bkit-harvest.test.ts` |
| Analysis CLI computes #183 size↔outcome regression + dispatch-size threshold over `run-outcome` rows; labels `counterSource` trust tier | Unit (Vitest) | `.bkit/src/bkit-analysis.test.ts` |
| Analysis CLI computes per-rule compliance rate over `kind:"compliance"` rows (the artefact behind the declared WS-2→WS-4 edge) | Unit (Vitest) | `.bkit/src/bkit-analysis.test.ts` |

## Architecture & Component Changes (WS-4)

**CRITICAL:** All edits land in canonical `.bkit/`, `.agents/`, root config; `.claude/*`/`.cursor/*` mirrors are regenerated by the install engine — NEVER hand-edited. ASCII operators only in workflow/prompt files.

#### [NEW] `bkit harvest` CLI (+ `bkit-harvest.test.ts`, `bkit-harvest.integration.test.ts`)

- Reads `docs/bkit-consumers.md` → `git worktree list --porcelain` per consumer → **COPIES** each consumer's `.bkit/{stats,friction}.jsonl` into bkit (COPY per A4) and COUNT-ONLY-aggregates `docs/{deferrals,failures}.jsonl` (dimensional counts from envelope metadata; prose NOT copied). Dedup by per-`kind` composite `(ts, repo, …)`; stamp `repo`. NEVER truncates/writes/commits consumer repos. Per-consumer timeout + continue-on-stall; grep-able `[bkit-harvest]` log lines; relies on WS-1 tolerant `parse` for half-written tails. **Boundary integration test: consumer file content + mtime unchanged after harvest.** **PII guard:** copy ONLY the named `.jsonl` ledgers — never any `.env`/secret files.

#### [NEW] `bkit analysis` CLI (+ `bkit-analysis.test.ts`)

- Counts/rates/elapsed-time; #183 size↔outcome regression (logistic `error ~ log(lines) + files_changed`, bucketed) over `kind:"run-outcome"` rows + GitHub-API historical backfill (pulls/commits/check-runs/reviews incl. hand-written baseline); dispatch-size threshold feeding `plan-complexity-check`/`split`; **per-rule compliance rate over time over WS-2's `kind:"compliance"` rows (this consumption is the artefact that makes the declared WS-2→WS-4 edge real)** + per-`bkitVersion`→CHANGELOG release-attributed regression. Labels `counterSource` trust tier. Recommend/inform only. **Resolve #183 backfill-scope + provenance OPEN QUESTION.**

#### [MODIFY] `bkit-ship.md` summary step — ship-chain rollup

- Report the ship workflow AND the entire design→plan→build→debug→ship chain (aggregate counts/rates/elapsed/compliance violations) from folded telemetry.

#### [NEW] rollup writer to `.bkit/archive/{basename}.{YYYYMM}.jsonl`

- P4 owns the rollup writer (path template + `foldFrom` already shipped in WS-1). **Resolve rollup-trigger-VALUE + committed-vs-gitignored-archive OPEN QUESTION.**

#### [MODIFY] `.bkit/src/bkit-cli.ts` + `.cursor`/`.claude` regen

- Add `harvest`/`analysis` verbs (namespace per the WS-2-resolved OPEN QUESTION). Keep `bkit-cli.test.ts` assertions additive (one `it` block per verb) to minimise merge conflict; rebase onto whichever CLI-touching workstream lands first.

#### [DELETE] `utility-harvest-friction` agent prompt — `.claude/agents/utility-harvest-friction.md` + `.cursor/agents/utility-harvest-friction.md`

- Mirrors the Supersession Inventory DELETE row. The prompt → deterministic copy-only `bkit harvest` CLI. **Path note (verified against the live tree):** this is a project-managed (NON-`bkit-`-prefix) agent that exists ONLY as the two git-tracked files `.claude/agents/utility-harvest-friction.md` and `.cursor/agents/utility-harvest-friction.md` — there is NO `.bkit/prompts/` canonical source for it. Because install never writes/prunes non-`bkit-`-prefix files in the mirror dirs, both files are deleted directly. (The earlier scope-check guess of `.agents/prompts/utility-harvest-friction.md` is INCORRECT — that path does not exist.)

## Supersession Inventory (WS-4 slice)

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `utility-harvest-friction` agent (prompt) — `.claude/agents/utility-harvest-friction.md` + `.cursor/agents/utility-harvest-friction.md` (project-managed, non-`bkit-`-prefix; NO `.bkit/prompts/` source) | `bkit harvest` CLI (WS-4, copy-only) | DELETE (WS-4) | Prompt → deterministic copy-only script; never truncates consumer repos. |

## Security & Privacy

- **PII:** Harvest reads consumer repos READ-ONLY (copy-only); MUST NOT copy any `.env`/secret files — only the four named `.jsonl` ledgers. #183 GitHub-API backfill reuses the existing `gh`/MCP auth surface; no new secret. Consumer-facing advisory text MUST NOT cite `KN-`/`BAR-`/Linear refs (MEMORY rule).
- _Net: no new routes, DB writes, secrets; primary privacy concern = harvest must read consumer repos strictly read-only and copy ONLY the named ledgers._

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Package Management:** Verify `package.json` — no NEW runtime dependency.
- [ ] **Dependency Versions:** Spot-check `node --version` (>=20), `npx tsc --version`, `git --version`, `gh --version`, `pnpm --version`.
- [ ] **User Context:** Verify read/write access to `.bkit/src/`, `bkit-cli.ts`, `.bkit/workflows/bkit-ship.md`. **Confirm consumer worktrees listed in `docs/bkit-consumers.md` are reachable for WS-4 harvest dogfood.**
- [ ] **Pending Blockers:** Query tracker for open `blocker`-labelled issues relevant to harvest/analysis.
- [ ] **Project Context:** Read `docs/knowledge.md` + `docs/decisions.md` (harvest copy-only invariant; dogfood-via-tarball; install↔dogfood divergence).
- [ ] **Testing & Quality:** Align with `docs/testing.md`. Boundary tests (filesystem/consumer repo mtime) run against ground truth, NOT mocks.
- [ ] **Prerequisite Plans:** **Sub-plans A (WS-1) + B (WS-2) + C (WS-3) MUST ALL be fully shipped+verified to dev BEFORE this sub-plan starts.** Additionally, WS-4's CLI verbs MUST NOT be wired until the WS2-T1 entrypoint/namespace decision is recorded.

### Conditional

- [ ] **Secrets & Env Vars** — N/A (WS-4 GitHub-API backfill reuses existing `gh`/MCP auth).
- [ ] **Architecture & UI** — Validate against `docs/architecture.md` + the canonical-source rule. No UI.
- [ ] **Observability** — Confirm `[bkit-harvest]` grep-able log prefix documented per `docs/observability.md`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** Human confirmed the master `👤 Acceptance Scenario` section (`plan-v3-checked.md`). _(Unchecked → REVISE.)_
- [ ] **Breaking Changes confirmed:** Human confirmed the master `⚠️ Breaking Changes & Naming Review` section. _(Unchecked → REVISE.)_
- [ ] **Gate 1 - Verified:** All Core items checked (incl. WS-1+WS-2+WS-3 shipped + WS2-T1 recorded). All applicable Conditional items checked.

## Agent Execution Runbook (WS-4)

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate.
> **Blockers:** If a task cannot be completed, DO NOT fail silently — create a tracker `blocker` issue with context before stopping (and append a `kind:"failure"`/`kind:"deferral"` row).
> **Step Isolation:** Complete each task fully (including its verification + checking its box) before the next.

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable. Tasks crossing an external boundary name the boundary + ground-truth signal in `Done when` (no mocks at boundary).

### WS-4 — Harvest + analysis (Requires: WS-1, WS-2, WS-3)

- [ ] **WS4-T1: Harvest CLI + copy-only boundary test.** Implement `bkit harvest` (COPY `.bkit/{stats,friction}.jsonl`; COUNT-ONLY `docs/{deferrals,failures}.jsonl`; dedup by per-`kind` composite; never write consumer repos).
  - **Done when (boundary: filesystem/consumer repo):** `.bkit/src/bkit-harvest.integration.test.ts` creates a temp consumer worktree, records each consumer file's content hash + mtime, runs harvest, and asserts consumer files are byte-identical + mtime-unchanged (ground-truth = real filesystem stat, no mock) while bkit's central store gained the copied rows.
- [ ] **WS4-T2: Harvest dedup + tolerant-tail unit test.** Write `bkit-harvest.test.ts`.
  - **Done when:** repeat harvest of the same rows does not duplicate (per-`kind` composite dedup) and a half-written tail line is skipped+counted, not thrown.
- [ ] **WS4-T3: Analysis CLI + #183 regression + per-rule compliance rate.** Implement `bkit analysis` (counts/rates/elapsed; logistic size↔outcome regression; dispatch-size threshold; `counterSource` trust labelling; `bkitVersion`→CHANGELOG; per-rule compliance rate over `kind:"compliance"` rows). Resolve backfill-scope OQ. **Requires WS-2** — the per-rule compliance-rate analysis is the artefact that makes the declared WS-2→WS-4 edge real (it consumes WS-2's `kind:"compliance"` rows).
  - **Done when:** `bkit-analysis.test.ts` asserts the regression + dispatch-size threshold over a `run-outcome` fixture; that pre-P3 `model-self-report` counters are labelled untrusted; AND that the CLI computes a per-rule compliance rate over a `kind:"compliance"` fixture (the WS-2-consuming assertion — exercises the WS-2→WS-4 edge); backfill scope recorded in decisions.
- [ ] **WS4-T4: Ship-chain rollup + rollup writer.** Wire `bkit-ship.md` summary chain rollup; implement the archive rollup writer at `ARCHIVE_SHARD_TEMPLATE`. Resolve rollup-trigger-value + commit-vs-ignore OQ.
  - **Done when:** `bkit-ship.md` summary reports the full design→ship chain from folded telemetry; rollup writer writes to `.bkit/archive/{basename}.{YYYYMM}.jsonl` and `foldFrom` reads it back with row count preserved (writer↔reader round-trip asserted in `.bkit/src/bkit-analysis.test.ts`, distinct from WS1-T2's synthetic-shard reader test); decision recorded.
- [ ] **WS4-T5: Harvest/analysis CLI plumbing + Supersession of friction-utility agent.** Add verbs using the WS2-T1-resolved namespace/entrypoint; DELETE the `utility-harvest-friction` agent prompt at its TWO git-tracked paths `.claude/agents/utility-harvest-friction.md` + `.cursor/agents/utility-harvest-friction.md` (project-managed, non-`bkit-`-prefix; there is NO `.bkit/prompts/` source to delete). **MUST NOT start until WS2-T1 is recorded.** Because WS-2/WS-4/WS-5 all `[MODIFY] bkit-cli.ts` + `bkit-cli.test.ts`, rebase onto whichever CLI-touching workstream lands first and keep `bkit-cli.test.ts` assertions additive (one `it` block per verb) to minimise merge conflict.
  - **Done when:** WS2-T1's decision is recorded FIRST; `bkit-cli.test.ts` parses the new verbs (additive per-verb `it` blocks); `Grep` over `.bkit/workflows/`, `.bkit/prompts/`, `.agents/` finds no live invocation of `utility-harvest-friction`; BOTH `.claude/agents/utility-harvest-friction.md` AND `.cursor/agents/utility-harvest-friction.md` are removed (`git status` shows both deletions) and no other path references the agent.

### 🔒 Gate 2 (WS-4): Code Implementation Check

- [ ] **Gate 2 (WS-4) - Verified:** Every WS-4 task verified and checked off.

## Testing & Documentation (WS-4 scope)

> [!IMPORTANT]
> **Testing Strategy (See `docs/testing.md`):** bkit-repo tooling — ALL tests are Vitest unit/integration in `.bkit/src/` or bats in `scripts/`. NO Playwright/E2E/Supabase surface. Boundary tests (filesystem/consumer repo) run against ground truth — NO mocks at the boundary.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every WS-4 Derived-Test-Matrix row maps to a checked-off runbook task above.
- [ ] **Update existing tests:** Adjust `bkit-cli.test.ts` (additive per-verb `it` blocks) and any workflow-content/render-parity tests affected by the new verbs/ship-chain rollup/agent delete.
- [ ] **Write new tests:** All NEW WS-4 test files listed in the Derived Test Matrix.
- [ ] **Verify observability:** New `[bkit-harvest]` log prefix documented in `docs/observability.md`.
- [ ] **Update documentation:** `docs/decisions.md` (copy-only harvest; rollup-trigger value; #183 backfill scope), `docs/knowledge.md` (harvest copy-only invariant), `docs/architecture.md` (harvest/analysis/rollup subsystem), `docs/testing.md` (filesystem consumer-repo boundary pattern), `docs/observability.md`.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** Every WS-4 `Documentation Updates` row completed. `.agents/docs.md` accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified.

## Verification Plan (WS-4)

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck` (`tsc --noEmit`) + `pnpm lint:slop` clean; `pnpm lint:workflows` (actionlint) clean; `pnpm format:check`.
- [ ] **dist parity:** `pnpm check:dist` — new `harvest`/`analysis` verbs compiled + committed.
- [ ] **Generated-file drift:** render-parity / catalog-parity tests green for `.claude`/`.cursor` mirrors after regen (incl. the agent-prompt deletion).
- [ ] **Test Synchronization:** Re-run the full suite; update `bkit-cli.test.ts`/workflow-content tests in lockstep.
- [ ] **Run all tests:** `pnpm test` green incl. the filesystem/consumer-repo boundary integration test. Fix all failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades:** On build/compile/test errors, NEVER hot-fix or anti-pattern. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** Every Automated Tests checkbox verified with explicit proof (test output, harvest mtime/content diffs).

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Use local CLIs (`gh`, `git`, `jq`, `pnpm`) to verify, not dashboards.

- [ ] **Step 4 (WS-4):** Run harvest against a real consumer worktree; `git status` in the consumer confirms ZERO changes; run analysis and confirm the #183 regression output + `counterSource` trust labelling.
