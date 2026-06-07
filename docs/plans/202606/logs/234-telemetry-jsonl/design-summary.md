Verdict: PASS

<!-- verdict:end -->

# Design Summary: bkit unified `.bkit/*.jsonl` telemetry system (#234)

## Overview

#234 proposes a unified append-only NDJSON telemetry system unifying four separate ledger categories (compliance grades, workflow outcomes, deterministic counters, friction/deferrals/bugs, and later knowledge/decisions) into `.bkit/{stats,friction,deferrals,failures}.jsonl` + `docs/{knowledge,decisions}.jsonl`. The system is a direct generalization of the already-shipped `status.jsonl` machine: a canonical TypeScript codec (`bkit-telemetry.ts`) defines shared envelope, per-`kind` discriminated-union payloads, per-`kind` identity tuples, and a deterministic fold reducer that deduplicates under `merge=union` interleaves. Every workflow close step appends well-formed rows via inline `jq -nc … >> "$FILE"` writers (mirroring the reducer to maintain parity). A deterministic, advisory compliance grader runs over `git diff` + files to emit `kind:"compliance"` rows; a shell counter bus refactors prose `*_ATTEMPT`/`MAX_*` control-flow into deterministic, testable helpers; harvest and analysis CLIs read the folded telemetry to surface aggregate counts, compliance rates, regression attribution, and #183 size↔outcome signals without ever mutating consumer data; and an opt-in P5 migration CLI transforms legacy `KN-`/`DE-` markdown ledgers into JSONL with backward-compatible `aliases[]` references. The five workstreams (P1 substrate → P2 grader → P3 counter refactor / P4 harvest+analysis / P5 migration) form a clean dependency DAG, each independently shippable and additive on the prior.

## Design Quality

**Well-reasoned architecture:** The design is built on two proven, production-tested precedents — the `status.jsonl` append-only machine (shipped, in every workflow) and GateGuard's advisory/fail-open/deterministic-check posture (shipped, `7732d69`) — and extends them without introducing new infrastructure categories. All five locked design decisions (1: combine per-purpose files into one codec, not separate; 3: event-source and fold, not mutate; 5: `aliases[]` for legacy refs; 6: advisory/fail-open, never gate) stay faithful to the system architecture.

**Trade-offs explicitly accepted:** The design trades off write-path simplicity (inline jq across five workflows + four files) for isolation (one bad writer doesn't wedge every reader) and additive P5 (new `knowledge`/`decisions` files don't touch the P1 substrate). The per-`kind` composite identity tuple (not bare `ts`) adds correctness under `merge=union` at the cost of a per-`kind` specification burden — mitigated by pinning each tuple with a unit test and an existing `status.jsonl` pattern to clone. The counters-as-events design resolves the #58 side-car-file divergence and enables a fold-invariant (`counters.verifyAttempt` == count of `plan-verify` rows) that is checkable and self-correcting.

**Edge cases surfaced and mitigated:** The design identifies all major failure classes — blanket-glob gitattributes footgun, `merge=union` same-`ts` collisions, inline-jq drift, free-text hash-forking (for friction/deferral/failure keys), pre-P3 counter trustworthiness, harvest reading mid-write, P5 auto-migrate bricking risk — and pins explicit mitigations (no glob, per-`kind` identity tuple with unit test, parity test, explicit written-once `key` field locked in before P1, `counterSource` trust-tier field, tolerant per-line parse with truncated-line fixture, opt-in dry-run CLI + dogfood tarball validation). Two critical gaps remain: (1) the grader close-gate shell pattern (`|| echo "[bkit-comply] grader unavailable"`) must be specified before P2 ships to guarantee fail-open and prevent lockout; (2) `schemaVersion` discipline (initial value=`1`, bump trigger=BREAKING field change, reader warn-and-EXCLUDE unknown version) must be pinned so rows are never silently mis-bucketed.

## Acceptance Scenario

The narrative spans the full workflow lifecycle: a maintainer runs design/plan/build/debug/ship and at each close step rows append to `.bkit/*.jsonl` (compliance grades per run×rule, outcome signals per PR, attempt counts, friction/deferrals/bugs). The compliance grader runs deterministically over the diff, emits violations into `stats.jsonl`, and surfaces them in `ship-summary.md` — all advisory, fail-open, never blocking. At ship, a summary step rolls up the entire design→plan→build→debug→ship chain (counts, rates, elapsed, compliance violations) from the folded telemetry. Later, `bkit harvest` copies consumer telemetry read-only (never writes), and `bkit analyze` reports counts/rates, regression attribution, and compliance trends without touching the consumer. Success criteria all met: one canonical reducer with unit-tested per-`kind` identity; compliance grader deterministic/advisory with every row emitted; counter refactor deterministic via shell bus (P3) with invariant check; harvest copy-only with tolerant per-line parse; data files exempt from install/manifest, each with explicit scoped `merge=union` line; legacy refs resolved via `aliases[]` + generated lookup table. Key edge cases: `merge=union` interleave deduped by per-`kind` composite identity (unit-tested), trust tier distinguished by `counterSource` field, half-written tail lines skipped without throwing, P5 migration opt-in + dry-run + dogfood-tarball-validated.

Verdict on adherence to `docs/plans/template.md` § Acceptance Scenario: **PASS** — the narrative is concrete and specific (not vague "things will work"), success criteria are measurable and tied to code (reducer per-`kind` identity test, compliance grader row count per run×rule, counter invariant `counters.verifyAttempt` == `plan-verify` row count, harvest copy-only + tolerant read, `ship-summary.md` violations surfaced), and key edge cases are explicitly addressed (dedup strategy, trust-tier signalling, half-written-line handling, safe migration).

## Breaking Changes

**None.** The system is purely additive on existing `status.jsonl` and ledger `.md` files. Four new data files (`.bkit/{stats,friction,deferrals,failures}.jsonl`) are seeded empty; legacy `friction.md`, `docs/pending.md`, and the knowledge/decision ledgers stay readable indefinitely. P5 migration adds `docs/{knowledge,decisions}.jsonl` ALONGSIDE the `.md`, never deletes it. All data files are git-tracked runtime content, not manifest entries — identical to how `status.jsonl` is handled today. No workflow step names, verb signatures, or decision/knowledge reference formats change — legacy `KN-14`, `DE-7` references continue to work via `aliases[]` in the new JSONL rows, and a generated committed lookup table makes resolution auditable. The counter refactor (P3) does rewrites prose `*_ATTEMPT`/`MAX_*` but this is internal implementation, not a user-facing breaking change.

## Feasibility

The design generalizes production code (`bkit-status.ts`, `bkit-status.test.ts`, GateGuard) with three load-bearing NEW divergences that are explicitly specified:

1. **Tolerant per-line `parse`** (vs `parseStatus` which throws): new try/catch per line, skip+count `malformedLineCount`. Pinned with truncated-line fixture test in P1.
2. **`validate` rejects unknown `kind`** (vs status.ts with no reject path): guards against silent junk-drawer drift. Tested in P1.
3. **ms `ts` via `jq 'now*1000|floor'`** (vs status.jsonl ISO `at`): portable (BSD/macOS safe, not `date +%s%3N`), enables same-ms dedup via composite identity. Parity-tested in P1.

All three are within the approved stack (TypeScript, Vitest, jq) with no new infra. The design identifies and mitigates build risks:

- **CLI plumbing:** `comply`/`harvest`/`analysis`/`telemetry migrate` are net-new dispatch+parse verbs on a CLI that today hard-codes install verbs with no sub-verb parser. Feasible; review-1 notes this is genuinely new work, not a union-type one-liner. Must decide in P2 plan whether they share `dist/bkit-install.js` (the install-engine binary) or get a separate entrypoint (recommended, to isolate grader/harvest crashes from the consumer-mutating install path).
- **Shared path-policy table mechanism:** must be a **committed generated `.cjs` file + drift test**, NOT install-time codegen (no such precedent — `gateguard.cjs` is installed by byte-equal Tier-1 copy; existing transforms only rewrite markdown). TS table → committed `gate-paths.generated.cjs` with parity drift test, same discipline as inline-jq parity.
- **P3 control-flow blast radius:** Shell counter bus helpers (`counter_init/inc/get/reset/check_max`, `decide_next`) must have DIRECT unit tests (bats or equivalent), not just integration coverage via emitted rows. A `decide_next` bug that exits with wrong code silently mis-routes all 5 workflows.

Review-2 marks the operability gaps as CONCERNS (shell patterns underspecified, data-quality degradation silent without `schemaVersion` discipline), not FAIL — all failure modes are recoverable, but need specification before shipping.

## Synthesis Coverage

Three independent design lenses (buildability, operability, architecture) each produced an A/B/C brainstorm. Convergence: all three recommended Approach A (per-purpose files + canonical TS codec + inline-jq writers + counters-as-events + copy-only harvest + opt-in migration). The kept design is that convergent A with operability premortem mitigations (schemaVersion, foldFrom archive template, tolerant reader, malformedLineCount, copy-only harvest, dogfood-first migration) layered on. Rejected alternatives include single combined `telemetry.jsonl` (B, violates locked decision #1 on per-purpose isolation), thick `bkit telemetry append` CLI verb (C, adds CLI dependency to the write hot path), and engine-auto-migrate P5 (C, re-creates pinnedCommit bricking class). The synthesis kept no good options on the floor — the per-purpose file structure, event-sourced fold, and copy-only harvest are all load-bearing for isolation and safety.

## Scope Alignment

The design is tightly scoped to the original #234 brief: unified `.bkit/*.jsonl` telemetry (stats/friction/deferrals/failures) + harvest/analysis + #58 counter refactor + #183 size↔outcome regression attribution + #232 compliance grading. No creep: P5 migration is confined to legacy `KN-`/`DE-` ledgers (not all markdown), the grader is deterministic/advisory (not blocking), and the counter bus is deterministic shell (not architecture change). The design correctly defers to separate issues: #183 GitHub-API backfill auth/pagination, P4 rollup/archive retention threshold and commit-vs-ignore decision, per-phase grader rollout (all 5 from P2 vs ship-only-first), verb naming and namespace.

## Risks

**Outstanding mitigations (already in design, carry into plan):**

- **Blanket-glob footgun:** Each file gets one explicit scoped `.gitattributes merge=union` line inside the markered block (never `*.jsonl` glob). Validate via real attribute resolver (`git check-attr merge …`), not string-presence.
- **Inline-jq ↔ reducer drift:** TS canonical + parity test (one representative jq-written row per `kind` must parse identically under reducer). Treat jq as generated-from-spec.
- **Free-text key fork (friction/deferral/failure):** Decided before P1: explicit written-once `key` field (NOT free-text hash — LLM reword would fork it). Decision #5 locked.
- **Pre-P3 counter self-report:** `counterSource: "model-self-report" | "shell-bus"` field on every `kind:"counter"` row distinguishes trust tier structurally (FM-6 resolved).
- **Half-written tail during harvest:** Tolerant per-line try/catch, skip+count `malformedLineCount`, never throw. NEW behaviour (vs `parseStatus` which throws), pinned with truncated-line fixture test in P1 (FM-8 resolved).
- **P5 bricking class:** Opt-in dry-run CLI, writes ALONGSIDE `.md` (never deletes), dogfood-first on bkit's own repo, tarball-validated in a clean consumer dir. P5 is NOT wired into `bkit upgrade` at all.
- **Single-clone serialisation:** Append-only writes + `merge=union` + no-concurrent-workflows already enforced; telemetry adds no locking assumptions.

**Open (advise for plan):**

- **Grader close-gate shell idiom (CRITICAL, FM-7):** Every `pnpm bkit comply --phase {p}` invocation MUST have explicit `|| echo "[bkit-comply] grader unavailable, skipping"` (guarantees exit 0 even on missing `dist/`/grader exception). Without this, a build regression converts advisory into hard gate across all 5 workflows. Must be pinned in P2 plan, not left to implementor.
- **`schemaVersion` discipline (FM-10):** Initial value=`1`, bump on BREAKING field change (remove/rename/retype; additive=no bump). Reader warn-and-EXCLUDE unknown versions (not warn-and-continue). Pin in rules.md and codec doc-comment.
- **CLI entrypoint blast radius:** Decide whether `comply`/`harvest`/`analysis`/`telemetry migrate` share `dist/bkit-install.js` (the install-engine binary) or get a separate entrypoint. Isolating them protects install from grader/harvest crashes (recommended).
- **Shared path-policy mechanism:** Committed generated `gate-paths.generated.cjs` + drift test (decided), not install-time codegen (no precedent).
- **Archive shard path template (FM-5):** Pinned constant `.bkit/archive/{basename}.{YYYYMM}.jsonl` in P1 `bkit-telemetry.ts`; P1 unit test exercises `foldFrom` against a synthetic shard at that path so P4 cannot diverge.
- **`MAX_ROWS_BEFORE_ROLLUP` threshold (FM-4):** Defer rollup implementation to P4, but name a threshold constant (e.g. ~5,000 rows) so P1 ship-summary can emit a WARNING when exceeded — unbounded growth is detectable even before P4 rollup exists.

## Action Items

None requiring revision before planning — the design is ready. The two CONCERNS from reviews (review-1 §CRITICAL items 1-3, review-2 §CRITICAL C-1/C-2) have been either locked as decisions or deferred as open questions to plan:

1. **review-1 correction (three inaccurate "existing pattern" claims):** Already noted in design as Known Divergences and resolutions (new CLI plumbing, committed generated file + drift test vs codegen, no Vale exemption needed). Plan must inherit these corrections.
2. **review-2 C-1 (grader shell idiom):** Specified in design §Components/P2 as pinned idiom `pnpm bkit comply --phase {phase} || echo "[bkit-comply] grader unavailable, skipping"`. Plan must verify this pattern on EVERY close-gate invocation across all 5 workflows.
3. **review-2 C-2 (tolerant parse with truncated-line fixture):** Pinned in design §Components/P1.1 as NEW behaviour with its own unit test. Plan must include the fixture.

The design is complete and ready for planning. No content-level revisions needed; plan work is execution against locked decisions + open-question resolution.

## Outstanding Questions

Sourced from `## Risks & Open Questions` § "Open Questions (for plan/design-organise to resolve)":

- **Q:** Per-phase grader rollout — run `bkit comply` in all 5 close gates from P2, or ship-only first then expand? — **Recommended:** Ship-only (ship workflow close gate in P2), then expand to build/debug/plan/design in a follow-up wave once P2 stability is proven. Lower blast radius on P2 launch.

- **Q:** Rule table location — extend `bkit-tiers.ts` vs a new `bkit-paths-policy.ts` for the shared protected-path table (the sharing mechanism is now decided as committed generated file + drift test, not install-time codegen; this OQ is only about which TS file holds the canonical table). — **Recommended:** Extend `bkit-tiers.ts` (consolidates policy into one file; simpler than a new export). If `bkit-tiers.ts` grows too large later, a split is a future refactor with no breaking change.

- **Q:** CLI entrypoint / blast-radius isolation — do `comply`/`harvest`/`analysis`/`telemetry migrate` share `dist/bkit-install.js` (the install-engine binary) or get a SEPARATE entrypoint so a grader/harvest crash never touches the consumer-mutating install path? — **Recommended:** Separate entrypoint (e.g. `dist/bkit-tools.js`). Isolates read/grade/harvest verbs from the consumer-mutating install path; if a grader crash occurs, the install CLI is unaffected. Slightly higher initial implementation cost, much higher safety margin.

- **Q:** Migration CLI verb naming/surface — is the migration a sub-verb of a new `telemetry` verb (`bkit telemetry migrate`), and do harvest/analysis share that verb namespace, or are they separate top-level verbs? — **Recommended:** Separate top-level verbs (`bkit harvest`, `bkit analyze`, `bkit migrate-ledgers`). Simpler parser (no sub-verb dispatch); migration is orthogonal to telemetry read (harvest/analyze), so shared namespace adds no affordance. The `telemetry` namespace is available if future telemetry operations (e.g. `telemetry rollup`) warrant consolidation later.

- **Q:** Legacy `.md` ledger fate post-migration — keep `friction.md`/`pending.md` as read-only history indefinitely, or fold their content into the `.jsonl` at migration time and retire the files? — **Recommended:** Keep as read-only history indefinitely. Consumers rely on these files (some cite `KN-14` in design docs that are now closed). Retiring them breaks immutable history and forces a retroactive migration of all citing references. The `.md` + `.jsonl` coexistence is a bounded surface cost.

- **Q:** #183 GitHub-API backfill scope — how far back, and how is the hand-written-baseline provenance (non-`claude/` branches) reliably distinguished for the regression's provenance signal? — **Recommended:** Start with the last 12 months of PRs (configurable threshold). Distinguish hand-written via branch name prefix (`main` vs `claude/…`) or an explicit commit metadata query (e.g. check if the PR is authored by the bkit bot or a human). Treat as P4 implementation detail; design establishes the data model (`kind:"run-outcome"` with `provenance` field), plan specifies the query.

- **Q:** Rollup retention policy — what exact `MAX_ROWS_BEFORE_ROLLUP` (or `MAX_BYTES_…`) value triggers rollup to `.bkit/archive/{basename}.{YYYYMM}.jsonl`, and is the archive committed or git-ignored? — **Recommended:** `MAX_ROWS_BEFORE_ROLLUP` = ~5,000 rows per file as an initial threshold (review-2 FM-4: unbounded growth, so a named constant is critical). Archive committed (git-tracked, like the hot files), so `foldFrom` can read it deterministically and rollup becomes idempotent. Can be revisited in P4 if archive size or commit churn becomes a problem, but start with the safest choice (committed = readable, auditable, no surprise divergence).

All recommendations are advisory only and MUST NOT influence the `Verdict`.

## Suggested Workstreams

The design decomposes into five P1–P5 phases, each independently shippable and additive. Dependency graph:

```
WS-1 (P1)  ──┬──> WS-2 (P2)
             ├──> WS-3 (P3)  ──┐
             ├──> WS-4 (P4)  <─┼──(data)─ (WS-2/WS-3 rows required for meaningful analysis)
             └──> WS-5 (P5)
```

### WS-1: JSONL telemetry substrate (P1)

Codec/reducer + data files + exemptions + ledger migration + basic stats wiring. Requires: `[]`. Rationale: Root workstream; every other phase depends on the envelope, per-`kind` identity tuples, and fold contracts.

### WS-2: Compliance grader (P2)

Pure grader functions + shared path-policy table (committed generated `.cjs` + drift test) + close-gate integration. Requires: `[WS-1]`. Rationale: Logically bundled around #232 grader concept and GateGuard-mirroring deterministic-advisory pattern. Emits `kind:"compliance"` rows.

### WS-3: #58 prose→shell counter refactor (P3)

Shell counter bus + staged migration (build → debug → plan/design) + invariant check. Requires: `[WS-1]`. Rationale: Self-contained control-flow refactor; highest blast radius (rewrites loop/escalation logic across all 5 workflows). Gated by invariant-check canary; only after P3 ships are attempt/failure stats trustworthy.

### WS-4: Harvest + analysis (P4)

Harvest CLI (copy-only consumer read) + analysis CLI (counts/rates/regression/#183 size↔outcome) + ship-chain rollup + deferred rollup/archive writer. Requires: `[WS-1, WS-2, WS-3]`. Rationale: Hard-depends on WS-1 readers and archive template. Data-consumption edges to WS-2/WS-3 (compliance rates need `kind:"compliance"` rows; trustworthy attempt rates need `counterSource:"shell-bus"` from P3) make the ordering explicit.

### WS-5: knowledge/decisions migration + consumer-upgrade path (P5)

New data files + opt-in migration CLI (dry-run-by-default) + generated committed lookup table + dogfood discipline. Requires: `[WS-1]`. Rationale: Deliberately isolated; only consumer-facing phase. Orthogonal to grader and counters; can ship anytime after WS-1. Keeps the consumer-mutating migration plumbing (and its risk) out of bkit-local read/grade paths.

## Recommended Next Step

```
/bkit-plan 234
Brief: Five-phase JSONL telemetry substrate + compliance grader + counter refactor + harvest/analysis + consumer migration. P1 is root (codec, data files, basic stats wiring); P2–P5 dependent and independently shippable. Main decision points in P2 plan: CLI entrypoint isolation (separate vs shared with install binary), grader close-gate shell idiom pinning (fail-open guarantee), and shared path-policy table location (bkit-tiers vs new file). See `docs/plans/202606/logs/234-telemetry-jsonl/design-v3-organised.md` for full decision table and per-workstream scope.
```
