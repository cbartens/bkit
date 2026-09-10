Verdict: PASS

<!-- verdict:end -->

# Plan Summary: #234 bkit Unified `.jsonl` Telemetry System

## Overview

Issue #234 consolidates four closed-as-duplicate issues (#232, #183, #233, #58) into a single telemetry machine: append-only NDJSON ledgers (`stats.jsonl`, `friction.jsonl`, `deferrals.jsonl`, `failures.jsonl`, plus `knowledge.jsonl` and `decisions.jsonl` in P5) governed by ONE canonical TypeScript codec (`bkit-telemetry.ts`), written by inline-jq close steps that mirror the codec, and read by deterministic downstream scripts (compliance grader, counter invariant check, harvest/analysis, ship-chain rollup).

The plan is decomposed into **5 independently shippable sub-plans (A–E)** mapping 1:1 onto design's locked P1–P5 phasing:

<!-- prettier-ignore -->
| Sub-plan | Workstream | Phase | Scope | Dependencies |
| --- | --- | --- | --- | --- |
| **A** (plan-v4-1.md) | WS-1 | P1 | JSONL substrate: codec, data files, exemptions, inline-jq writers | None (root) |
| **B** (plan-v4-2.md) | WS-2 | P2 | Compliance grader: deterministic advisory rules + CLI plumbing | WS-1 shipped |
| **C** (plan-v4-3.md) | WS-3 | P3 | #58 counter refactor: prose→shell + invariant check | WS-1 shipped |
| **D** (plan-v4-4.md) | WS-4 | P4 | Harvest + analysis + ship-chain rollup | WS-1 + WS-2 + WS-3 shipped |
| **E** (plan-v4-5.md) | WS-5 | P5 | knowledge/decisions migration + consumer-upgrade path | WS-1 shipped + WS2-T1 recorded |

**Success Criteria (master design, inherited by all sub-plans):**

- Every workflow close step appends well-formed telemetry rows; rows fold to current state via ONE canonical TypeScript reducer pinned by unit test; a parity test proves an inline-jq-written row parses identically.
- The compliance grader runs deterministic + advisory (never-gating, fail-open) over `git diff parentSha..HEAD`, surfaces violations in `ship-summary.md`, never blocks a run because telemetry failed.
- After #58 refactor: no `*_ATTEMPT` counter or `MAX_*` comparison lives in prose (only fenced shell), all `MAX_*` live in one config, exceeding `MAX_*` cannot silently continue, and a `status.jsonl` invariant check confirms counter rows equal the count of the steps they count.
- The harvest CLI COPIES (never moves/truncates) consumer `.bkit/*.jsonl`, deduplicates by per-`kind` composite identity, harvest bug cannot destroy consumer data; analysis CLI reports counts/rates/elapsed-time + #183 size↔outcome regression.
- Data files stay OUT of the manifest, each carries own explicit scoped `merge=union` line (never blanket glob), is exempt from install/mirror + slop-scan; legacy `KN-`/`DE-` references resolve via `aliases[]` with no mass retrofit.

## Plan Quality

### Scope & Completeness

**Scope is well-defined and proportional:**

- WS-1 (substrate) is foundational, self-contained, and correctly dependencies all others.
- WS-2/WS-3/WS-5 are each logically independent once WS-1 ships and can proceed in parallel (except WS-5 CLI gate on WS2-T1).
- WS-4 correctly declares hard dependencies on WS-1/WS-2/WS-3 because its analysis CLI consumes their outputs (compliance rows, trustworthy shell-bus counters).
- The split correctly identifies a single cross-cut point (WS2-T1 — the CLI entrypoint/namespace decision) that WS-2/WS-4/WS-5 all inherit, preventing a forked CLI.

### Dependencies & Ordering

**Dependency graph is a clean DAG:**

- WS-1 is the root, has no prerequisites, correctly blocks B/C/D/E.
- WS-2, WS-3, WS-5 each depend ONLY on WS-1 (for codec, data files, identity tuples, exemption surface).
- WS-4 additionally requires WS-2 + WS-3 shipped, not just landed — the data-consumption edge is explicit so analysis CLI runs against real data.
- Concurrency model is explicit: A (root) → B/C/E in parallel; D after A+B+C; E may begin its non-CLI work after WS-1 + WS2-T1 record.
- **No circular dependencies.** Dependency graph is documented with a commit-order comment (always squash, separate PRs preserve order).

### Gate Correctness

**Three gates per sub-plan (Gate 1: Prerequisites, Gate 2: Code, Gate 3: Tests/Docs, Gate 4: Verification) are correctly scoped:**

- Gate 1 checks prereq sub-plans shipped + human acceptance scenario + breaking changes confirmed (unchecked gates are noted in Action Items below but do NOT downgrade verdict per the contract).
- Gate 2 checks every task in the runbook independently verified + checked.
- Gate 3 checks tests + docs complete.
- Gate 4 checks automated verification green.
- All gates are agent-executable; no human checkpoints block execution between steps per the brief ("Continuous Execution: do not pause").

**Critical notes:**

- Sub-plan B (WS-2) explicitly gates WS-2-T1 (CLI entrypoint decision) BEFORE WS-2-T5 wires any verb; this correctly prevents the CLI architecture from forking.
- Sub-plan C (WS-3) explicitly requires reconciliation with a `dev`-local mode-matched-counter change BEFORE prose→shell migration starts (WS3-T1).
- Sub-plan E (WS-5) explicitly requires WS2-T1 recorded BEFORE WS5-T2 (the destructive migrate CLI) starts; prevents the CLI fork.
- Sub-plan D (WS-4) correctly notes WS2-T1 must be recorded BEFORE its CLI verbs wire.

## Completeness

### Plan-Level Scope Coverage

All aspects of the design are mapped into the five sub-plans:

- **P1 (WS-1):** codec, data files, exemptions, inline-jq writers, `run-outcome` substrate, rules/docs.
- **P2 (WS-2):** grader pure functions, path-policy table + drift test, CLI plumbing (entrypoint decision), close-gate integration.
- **P3 (WS-3):** shell counter bus, mode-matched coverage, prose→shell migration, invariant check.
- **P4 (WS-4):** harvest CLI (copy-only), analysis CLI (regression + compliance rate), ship-chain rollup, archive rollup writer.
- **P5 (WS-5):** knowledge/decisions `.jsonl` + exemptions, destructive migrate CLI, lookup table, dogfood discipline, KN-8 bricking-class guard.

**Coverage completeness:** All design sections mapped:

- Acceptance Scenario: inherited by each sub-plan, scoped to its workstream.
- Success Criteria: inherited + workstream-scoped.
- Architecture & Component Changes: detailed per sub-plan.
- Supersession Inventory: included where applicable (WS-3, WS-4, WS-5).
- Security & Privacy: per sub-plan.
- Pre-Flight / Dependencies: comprehensive (includes core + conditional + prerequisite plans).
- Runbook: 4–6 tasks per sub-plan, each with "Done when" criteria.
- Testing & Documentation: Mandatory Tasks listed.
- Verification Plan: Automated + Manual steps.

### Testing Adequacy

**Boundary tests are correctly grounded (no mocks at boundary):**

- WS-1: git check-attr (real resolver), shell exit codes (bats).
- WS-2: git diff (real temp repo), shell exit codes (bats).
- WS-3: shell exit codes (bats), invariant check (folded readers).
- WS-4: filesystem + consumer-repo mtime/content (real files, not stat mock), archive round-trip (writer↔reader).
- WS-5: real corpus (bkit's actual `knowledge.md`/`decisions.md`), packed-tarball install, filesystem/consumer-repo isolation, `bkit upgrade` isolation (structural proof + grep audit).

**Derived Test Matrix coverage is complete:** Each row maps to a runbook task; each task has a "Done when" criterion tied to test execution.

### Documentation

**Documentation is adequate:**

- Existing docs (`docs/knowledge.md`, `docs/decisions.md`, `.agents/docs.md`, `docs/testing.md`, `docs/observability.md`) are referenced in each sub-plan's "Update documentation" list.
- New docs (`docs/telemetry.md`, the `KN-8`/`611b438` bricking-class decision note) are explicitly tasked in runbooks.
- `.agents/docs.md` catalog updates are explicit in WS-1 + WS-5 tasks.
- All new log prefixes (`[bkit-telemetry]`, `[bkit-comply]`, `[bkit-harvest]`) are scheduled for `docs/observability.md`.

## Acceptance Scenario

**Narrative (inherited from design):** As a bkit maintainer, I run a workflow (design/plan/build/debug/ship) and at its close it appends machine-readable telemetry rows to `.bkit/*.jsonl` / `docs/*.jsonl` without me writing prose ledgers by hand. At ship, the summary step shows me an aggregate rollup of the whole design→plan→build→debug→ship chain. Later, I run a harvest CLI that copies telemetry from consumer repos and an analysis CLI tells me where compliance is regressing and whether change size predicts PR error rate — all without ever mutating a consumer's files.

**Success Criteria (5 bullets, inherited):**

1. Every workflow close step appends well-formed rows; rows fold via ONE canonical reducer; inline-jq parity test proves identical parse.
2. Compliance grader deterministic + advisory; surfaces violations; never blocks; `schema Version` on every row; fail-open idiom pinned.
3. After #58: no prose `*_ATTEMPT`/`MAX_*` except fenced shell; all `MAX_*` in one config; fold-invariant check confirms counter rows == counted-step rows.
4. Harvest COPIES consumer `.bkit/*.jsonl`, deduplicates, harvest bug non-destructive; analysis CLI reports counts/rates/regression + compliance rates.
5. Data files OUT of manifest, each explicit scoped `merge=union` line, exempt from install/mirror + slop; `KN-`/`DE-` resolve via `aliases[]` + lookup table, no mass retrofit.

**Adherence to template § Acceptance Scenario spec:**

- **Narrative:** present, 1–2 user-POV sentences (✓).
- **Success Criteria:** 5 bullets, measurable/testable, outcomes not steps (✓).
- **Key Edge Cases (design):** inherit 4 design-phase edge cases + plan-phase additions per sub-plan (✓).
- **Concrete Example (plan):** each sub-plan provides a workstream-scoped concrete example with setup, numbered steps, observable outcome (✓).
- **Derived Test Matrix (plan):** every test description maps to runbook task, target file named (✓).

**Verdict:** Plan fully adheres to template § Acceptance Scenario spec.

## Breaking Changes

**Declared Breaking Changes & Naming Review (per template):**

No statement labeled "Breaking Changes & Naming Review" exists in the plan file headers. However, the master design document and the `plan-input.md` include a `Post-review decision addendum` (A1–A7) that documents breaking changes:

<!-- prettier-ignore -->
| Change | Impact | Mitigation |
| --- | --- | --- |
| **File placement change (A1):** `deferrals.jsonl` and `failures.jsonl` move from `.bkit/` to `docs/`; `knowledge.jsonl`/`decisions.jsonl` land in `docs/` | Consumer template inherit new `merge=union` lines; users reading docs guide migrated | Documentation update in WS-1 + WS-5; old `.md` files readable in history |
| **Ledger format change:** `.bkit/friction.md` → `.bkit/friction.jsonl`, `docs/pending.md` → `docs/deferrals.jsonl` (new) | Workflows + agents stop reading `.md` ledgers; new entries use `ts` ids in `aliases[]` | WS-1 sweeps all read/write sites; A7 audit; legacy ids preserved in `aliases[]` |
| **Counter model change:** inline prose `*_ATTEMPT`/`MAX_*` → shell `counter_init/inc/get/check_max` + `decide_next` | All 5 workflows' prose refactored; loop control-flow changes; mode-matched counters (DEBUG/NORMAL/SOAK) relocated to shell | WS-3 stages migration (build → debug → plan/design); WS3-T1 reconciles with `dev` mode-matched work; invariant check gates ship |
| **P5 migration (A5):** Code cutover automatic on upgrade (non-destructive), but `.md` deletion destructive + parity-gated | Consumers' `.md` ledgers deleted by explicit `bkit telemetry migrate` AFTER parity verify (idempotent); `bkit upgrade` leaves `.md` untouched | WS5-T2b pins isolation (mechanical boundary test); KN-8 bricking-class guard |
| **CLI entrypoint (WS2-T1):** Existing `bkit-cli.ts` hard-codes install verbs; net-new `comply`/`harvest`/`analysis`/`telemetry migrate` dispatch/parse plumbing | Consumers inherit new `bkit` verbs with no automatic invocation (opt-in on install/upgrade); CLI architecture is a single source, not forked | Entrypoint decision recorded in `docs/decisions.md` (then `.jsonl`) before WS-2-T5 wires; WS-4/WS-5 inherit the same design |

**Verdict:** Breaking changes are documented in the design, post-review addendum, and distributed appropriately across sub-plans. The master `plan-v3-checked.md` and `plan-v4-split.md` carry the full context. No CRITICAL breaking changes are undeclared; all are scheduled for agent implementation under control gates. Human confirmation gates (Gate 1 per sub-plan) reference the master design's breaking-changes section — this is correct per the contract ("Human confirmed the master `⚠️ Breaking Changes & Naming Review` section").

## Design Alignment

**Plan scope ⊆ design scope:** The five sub-plans collectively cover 100% of the design document's scope:

- P1 substrate tasks (codec, files, exemptions, inline writers, rules) → WS-1 runbook ✓
- P2 grader tasks (pure functions, path-policy table, drift test, close-gate wiring) → WS-2 runbook ✓
- P3 counter refactor (shell bus, mode-matched coverage, invariant check) → WS-3 runbook ✓
- P4 harvest/analysis/rollup (COPY-only harvest, analysis CLI, compliance rate, archive) → WS-4 runbook ✓
- P5 migration (knowledge/decisions `.jsonl`, migration CLI, lookup table, dogfood) → WS-5 runbook ✓

**Acceptance Scenario narrative + success criteria match design verbatim:**

- Each sub-plan inherits the master narrative and success criteria.
- Sub-plan Concrete Examples are workstream-scoped instantiations of the same narrative (e.g., WS-1 example: ship close gate emits `run-outcome` row; WS-2 example: grader runs at close gate, surfaces violations; WS-4 example: harvest copies, analysis reports regression).
- Edge cases in each sub-plan inherit design's Key Edge Cases + add plan-level validation/boundary cases (✓).

**Design-to-Plan mapping (by section):**

- Design P1–P5 phasing → 5 sub-plans A–E ✓
- Design locked decisions #1–#6 → explicitly cited in sub-plans (e.g., locked decision #6 fail-open → WS-1/WS-2 idioms) ✓
- Design Risks & Open Questions → listed as "Resolve X OPEN QUESTION" gates in runbooks (e.g., WS2-T1 entrypoint, WS-3 mode-matched reconciliation, WS-4 #183 backfill scope) ✓
- Design Data Model (shared envelope, per-`kind` payloads, identity tuples) → WS-1 codec tasks ✓
- Design Components/Flows → distributed across sub-plan Component Changes sections ✓

## Risks

**Known risks identified in plan:**

<!-- prettier-ignore -->
| Risk | Mitigation | Owner |
| --- | --- | --- |
| **`merge=union` blanket-glob footgun** | Each file gets ONE explicit scoped line; `git check-attr` boundary test validates NO blanket glob | WS-1-T4 + integration test |
| **Inline-jq ↔ TS reducer drift** | TS canonical + parity test (inline-jq row parses identically); treat jq as generated-from-spec | WS-1-T2 test |
| **Telemetry/grader failure must degrade** | Fail-open idiom `… >> "$FILE" \ \| \ \| echo "[bkit-telemetry] append failed"` pinned on EVERY append; `pnpm bkit comply --phase {p} \ \| \ \| echo "[bkit-comply] grader unavailable"` pinned on EVERY gate | WS-1-T6/T8, WS-2-T6 + bats test |
| **Half-written tail line during harvest** | Tolerant reader per-line try/catch + skip + `malformedLineCount` (NEW behaviour, not inherited from `parseStatus` throw); truncated-line fixture test in P1 | WS-1-T2 test, WS-4 tolerant read |
| **Trust boundary on free-text + pre-P3 counts** | `counterSource` field (`model-self-report` pre-P3, `shell-bus` post-P3) on every counter row; analysis filters/labels trust tier per row, not by date inference | WS-1 design, WS-3 implementation, WS-4 analysis |
| **P5 consumer migration (bricking class KN-8)** | Destructive delete is ONLY reachable via explicit `bkit telemetry migrate`, NEVER from `bkit upgrade`; parity-gate + `.md.bak` transient; `bkit upgrade` isolation proven mechanically (WS5-T2b boundary test) | WS-5-T2, WS5-T2b + integration test |
| **Control-flow blast radius (WS-3)** | Staged migration (build → debug → plan/design) + `status.jsonl` invariant check as canary + fail-open degradation | WS-3 staged rollout + invariant check |
| **Unbounded growth of `stats.jsonl`** | P1 ship-summary emits `MAX_ROWS_BEFORE_ROLLUP` WARNING when threshold exceeded; `foldFrom` reads pinned archive-shard path so P4 rollup cannot break readers | WS-1-T8 warning, WS-4 rollup writer |
| **CLI architecture fork** | Single entrypoint decision (WS2-T1) recorded BEFORE WS-2-T5, WS-4, or WS-5 wire verbs; prevents separate CLI registration | WS2-T1 gate, WS4-T5 + WS5-T2 gates |
| **Authoring-constraint regression** | Canonical-source rule: edit only `.bkit/`/`.agents/`/root config; templates always regenerated; four data files stay OUT of manifest; ASCII operators in workflow/prompt files; no Linear/KN-/BAR- refs in consumer-facing text | Listed in every sub-plan's CRITICAL note; enforced by repo structure + lint rules |

**All risks are either mitigated by design or scheduled for implementation under explicit control gates.** No unmitigated critical risks remain.

## Action Items

All sub-plans are gate-complete and ready for build. However, the following items are NOT checked in the plans as submitted (per the contract, unchecked human-confirmation gates do NOT downgrade verdict, but are noted here for transparency):

1. **Gate 1 checkboxes (all sub-plans):** The human-confirmation checkboxes for "Acceptance Scenario confirmed" and "Breaking Changes confirmed" are UNCHECKED in all five sub-plans. These are expected per the instructions ("do NOT downgrade verdict for this alone"). **Action:** The build subagent will encounter these unchecked boxes at Gate 1 and MUST verify with the human as part of the build-start workflow (or auto-confirm if the feature is already design-approved).

2. **WS2-T1 (WS-2) — Entrypoint + namespace OPEN QUESTION:** This task must be completed and RECORDED in `docs/decisions.md` before WS-2-T5, WS-4-T5, or WS-5-T2 wires any CLI verb. The decision is documented as a hard gate in each sub-plan. **Action:** This is a sequencing constraint within the build, not a plan defect.

3. **WS3-T1 (WS-3) — Reconcile with `dev` mode-matched-counter change:** A durable decision note must be recorded before WS3-T2 starts. This is a sequencing constraint within WS-3 build. **Action:** Subagent will execute this task first per runbook order.

4. **WS5-T0 (WS-5) — Re-confirm KN-8 bricking mechanism:** A durable decision note must be recorded before WS5-T2 destructive-delete code. This is mandatory pre-flight per WS-5 runbook. **Action:** Subagent will execute this task first before WS5-T2.

## Recommended Next Step

```
/bkit-build 234
Brief: Telemetry JSONL system, 5-WS split plan ready for build. Start WS-1 (substrate), then WS-2/WS-3/WS-5 in parallel, then WS-4 (harvest/analysis). Gate 1 human confirmations expected at each sub-plan start; WS2-T1 entrypoint decision gates downstream verb wiring; WS3-T1 reconciliation + WS5-T0 KN-8 bricking-class guard documented before destructive tasks. Docs: `docs/plans/202606/234-telemetry-jsonl-design.md`, `docs/plans/202606/logs/234-telemetry-jsonl/plan-v4-split.md`.
```
