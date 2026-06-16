# Design Brainstorm & Ideas

Lens: Optimal-tradeoff — best long-term shape ignoring legacy constraints.

---

## Approach A — Unified Envelope + Typed Codec Layer + Shell-Native Counter Bus ⭐ Recommended

**Summary:** A single `TelemetryEvent` TypeScript type (shared envelope + `kind` discriminator + per-kind payload) is the single source of truth for schema. A thin codec module (`bkit-telemetry.ts`) serialises/appends/reads JSONL; the compliance grader (`bkit-comply.ts`) is a pure function over that type; the counter bus is a POSIX shell helper that writes `kind: "counter"` rows into `stats.jsonl` — no separate counter state file, counters are just another event kind foldable from the same store.

**Complexity:** MEDIUM

**Extensibility:** Adding a new `kind` is a TypeScript discriminated-union extension that does not break existing folds. The grader's rule table is additive. Harvest and analysis consume the same JSONL without coupling to internals. The #183 regression query is a fold filter over `kind: "run-outcome"` rows — adding new outcome signals is a new field, not a schema migration.

**Risk:** The counter bus writing into `stats.jsonl` (rather than a separate counter state file such as the #58-era `status.json` object) means the fold to reconstruct current counter values is more expensive than reading a flat key. For bkit's run lengths this is irrelevant, but if consumers run extremely long loops the fold-per-increment pattern could accumulate lines. Mitigated by design: counters are only written at attempt boundaries, not tight inner loops.

**Maintenance:** One schema file to update, one codec to extend, grader rules additive. No separate counter state file eliminates the sync problem between prose-embedded counts and a side-car file.

**Friction vs ideal:**

- `bkit-status.ts` already has a fold pattern and `StatusEvent` discriminated union — this approach extends that mental model rather than fighting it, but the telemetry JSONL files (`.bkit/*.jsonl`) are semantically distinct from per-plan `status.jsonl` (archived per run). The naming similarity is a long-term source of confusion; the plan file uses `at` as its timestamp field, telemetry uses `ts`. Low migration cost but the two schemas must be documented separately.
- The workflows currently write `attempt:N` in prose and in the `attempt` field of `step-done` StatusEvents. P3 replaces those prose writes with shell-helper calls that emit `kind: "counter"` events. All five workflows must be edited — the blast radius is real but staged (build → debug → plan/design per design-input sequencing).
- The grader's diff base (`git diff parentSha..HEAD`) requires `parentSha` captured at step start. The workflows already do this for `status.jsonl` `step-done` events — the counter helper can reuse the same captured value. No new git ceremony needed.
- GateGuard's `GATE_CONFIG_PATTERNS` and the compliance grader's rule table both pattern-match file paths. Ideal shape: a single exported `PROTECTED_PATH_TABLE` in `bkit-tiers.ts` (or a new `bkit-paths-policy.ts`) consumed by both. Current shape: GateGuard is a `.cjs` hook (not importable from TS); any shared table must be duplicated or generated at `bkit install` time. This is the main friction point — addressed in P2 design.

### Workstream decomposition

<!-- prettier-ignore -->
| Phase | Primary deliverable | Key decision |
| --- | --- | --- |
| P1 | `bkit-telemetry.ts` codec; `.bkit/*.jsonl` bootstrap; `.gitattributes`; exemptions; friction/deferrals/failures write helpers in workflows | Counter events live in `stats.jsonl` as `kind: "counter"` not a separate `counters.jsonl` |
| P2 | `bkit-comply.ts` pure function + rule table; workflow close step integration; `stats.jsonl` compliance rows; advisory surface in ship-summary | Path-policy table generated into `gateguard.cjs` at install time from TS source |
| P3 | Shell counter bus (`counter_init/inc/get/check_max`); prose→shell migration for all 5 workflows; `status.jsonl` invariant check | Counter bus emits `kind: "counter"` to `stats.jsonl`; old prose `attempt:N` removed from orchestrator prose |
| P4 | Harvest script; analysis CLI; GitHub-API backfill for #183; logistic regression; dispatch-size threshold; ship-chain rollup | Harvest deduplicates by `ts` + `repo` composite (not just `ts`) to handle clock-skew across consumers |
| P5 | knowledge/decisions JSONL migration; `aliases[]` resolution; consumer-upgrade path | No mass retrofit of existing `KN-`/`DE-` refs; `aliases` in new rows resolve backward |

---

## Approach B — Separate Files per Concern, Typed Independently

**Summary:** Each JSONL file (`stats.jsonl`, `friction.jsonl`, `deferrals.jsonl`, `failures.jsonl`) has its own TypeScript type with no shared envelope — just a loose convention on `ts` and `repo`. The compliance grader reads only `stats.jsonl`; friction/deferrals/failures are append-target sinks written by workflow prose. The counter refactor (#58) writes to a separate `counters.json` state file as originally scoped, which is then snapshotted into a `stats.jsonl` row at step close.

**Complexity:** LOW (each file is narrow, independently evolvable)

**Extensibility:** Adding a new log file requires no schema negotiation. Each kind's type is entirely self-contained. Grader ignores files it does not care about. However, cross-cutting queries (e.g. join friction entries to the run that produced them) require joining on `ts` proximity or `runId` — no structural guarantee the rows correlate.

**Risk:** The locked decision (locked decision #1) explicitly rejects this split — "Storage does not force a hard-data/free-text split — combine, don't separate." Implementing Approach B contradicts an approved decision. The `counters.json` state file reintroduces the sync problem #58 originally diagnosed: if a workflow fails mid-loop, the state file and the `status.jsonl` attempt field diverge. The fold-based invariant check (the acceptance criterion in #58) cannot be applied if counters live outside the JSONL event stream.

**Risk (additional):** Harvest script must know which files to collect and how to merge them, and must handle each independently. The analysis CLI must join across files with no relational guarantee. This is manageable at small scale but adds accidental complexity for the #183 regression (which needs to join size signals, compliance signals, and outcome signals in one query).

**Maintenance:** Each file is simpler in isolation. But the codec logic is duplicated per file (append, read, dedup). Grader rule updates do not affect other file schemas, which is a genuine benefit when the compliance schema evolves frequently.

**Friction vs ideal:** Low friction to start (additive files only); high friction at P4 when harvest+analysis must join across files with ad-hoc timestamp proximity matching. The `counters.json` approach directly contradicts the fold-invariant acceptance criterion in #58, so P3 would need re-scoping.

---

## Approach C — JSONL Schema Registry + Versioned Migrations

**Summary:** A schema registry (a JSON file checked into `.bkit/`) lists all known `kind` values with their payload type definitions as JSON Schema objects. The codec validates every appended row against the registry. Schema evolution is versioned (`schemaVersion` field); a migration tool upgrades old rows at harvest time. The compliance grader is a plugin that registers its own rule kinds. The counter bus writes typed rows validated on append.

**Complexity:** HIGH

**Extensibility:** Maximum — any consumer can register new `kind` values with validated schemas; backward-compatible schema changes are automatic; breaking changes go through the migration path. The grader plugin model allows external teams to add rule packs.

**Risk:** Significant over-engineering for an agent-local telemetry system with a single consumer (bkit + its dogfood consumers). JSON Schema validation on every append adds latency in hot paths (the counter bus fires on every retry boundary). The migration tool adds a new surface area that must be maintained across bkit versions. The schema registry file is a merge-contention point if multiple contributors add new kinds in parallel. The `merge=union` approach used by the JSONL files does not apply to the registry JSON file — a classic split-brain scenario.

**Maintenance:** Registry files are expensive to maintain over time. bkit's existing pattern (TypeScript discriminated unions as schema, Vitest as the type-level test) is far cheaper and eliminates the JSON Schema/TS drift problem. The migration tool would be the most complex piece in the entire telemetry stack and would need its own test suite.

**Friction vs ideal:** Very high. This is the pattern that makes sense for a multi-team event-driven system (e.g. an analytics warehouse). For bkit's single-team, single-codebase, agent-local telemetry, it introduces more ceremony than value and would delay P1 delivery significantly.

---

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives considered | Why |
| --- | --- | --- |
| Single `TelemetryEvent` TS discriminated union in `bkit-telemetry.ts` (Approach A) | Separate per-file types (B); schema registry (C) | Locked decision #1 mandates combined envelope + kind discriminator. TS union is already the pattern in `bkit-status.ts` (`StatusEvent`). Schema registry (C) over-engineers for agent-local scope. |
| Counter bus emits `kind: "counter"` events into `stats.jsonl` (Approach A) | Separate `counters.json` state file (B, original #58 scope) | Fold-invariant acceptance criterion in #58 requires counters to be reconstructible from the event log. A side-car state file breaks the invariant under mid-loop failures. Event sourcing gives recurrence counts and interval-between-retries for free. |
| Shared path-policy table generated at `bkit install` into `gateguard.cjs` (Approach A P2) | Duplicate constants in TS and CJS (B); no sharing (C) | GateGuard and the compliance grader both pattern-match paths. Single source of truth eliminates drift. CJS hook cannot import TS; install-time code generation is the existing bkit pattern for mirrors. |
| Advisory-only grader, never gates, `[skip ci]` commit at close step (all approaches, locked) | Gate the PR; gate the close step; run as subagent | Locked decision #6 from design-input. Deterministic grader-as-subagent reintroduces nondeterminism. `merge=union` + exempt from slop/Vale preserves append-only invariant. |
| Harvest deduplication by composite `(ts, repo)` not `ts` alone | `runId` field (proposed in #232); `ts` alone | `ts` is ms-precision and is the primary id per locked decision #2. Two consumers writing at the exact same ms is practically impossible, but two writes from the same consumer in the same repo (e.g. resumable workflow restart) would collide on `ts` alone if they had the same `repo` value. The `runId` approach adds a new field that must be propagated; composite `(ts, repo)` uses existing fields. |
| P3 (#58 counter refactor) sequenced after P1+P2 (Approach A phasing) | Counter refactor first (highest risk); counter refactor last (lowest value) | P1 establishes the JSONL store that counter events write into. P2 establishes the grader that can verify counter-related compliance rules. P3 can then emit typed `kind: "counter"` events that P2 already understands. Reversing would require P3 to write to a temporary store then migrate. |
| `aliases[]` approach for KN-/DE- backward compatibility (all approaches, locked) | Mass retrofit of 1,460 refs; new id scheme ignores old ids | Locked decision #5. ~1,460 existing references are in archived plans, closed issues, and consumer repos — mass retrofit has no ROI and breaks immutable history. `aliases` in new rows is additive. |
