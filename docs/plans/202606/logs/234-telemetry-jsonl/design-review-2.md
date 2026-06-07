Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.

## Failure-Mode Enumeration

This system is agent-maintained, not server-operated. "On-call" in this context means: the bkit maintainer running a workflow discovers a corrupted state, the next agent run silently mis-buckets data, or a future author inherits a system they cannot reason about at 3am without deep context. The failure modes are evaluated in that lens.

### FM-1 — Telemetry write fails mid-workflow (best-effort claim vs. reality)

What fails: A `jq -nc … >> "$FILE"` close-step append exits non-zero (disk full, jq not found, invalid variable interpolation producing malformed JSON, the shell variable `$FILE` unset). The design says these are best-effort and never-gate. However, the design does NOT specify what the workflow actually does on append failure — does it `|| true`, `2>/dev/null`, or does the enclosing shell inherit the exit code and surface it as a workflow step failure?

How detected: Only by manual inspection of the step's stdout/stderr. No structured log, no counter, no aggregated warning. The workflow may proceed and the maintainer never knows the row was dropped.

Blast radius: Single workflow run loses its telemetry rows. Downstream fold produces silently undercounted stats (compliance rates, attempt counts, friction items). Worst case: a friction event that triggered a workflow is never recorded; the instinct loop has no signal to act on.

### FM-2 — Inline-jq ↔ TS reducer semantic drift (the known status.jsonl hazard, now multiplied)

What fails: The inline-jq filter appended in a workflow close step encodes a different identity tuple or field shape than `bkit-telemetry.ts`. The reducer silently mis-deduplicates (keeps duplicate rows it should collapse, or collapses rows it should keep). Under `merge=union` this is especially acute — interleaved rows from two branches that look identical to jq but differ in field order cause non-deterministic dedup outcomes depending on which branch's row the reducer sees first.

How detected: Only by running the parity test (which only passes if someone wrote and ran it). In production no alert fires — fold produces a wrong count silently. The design acknowledges this hazard but the parity test covers only ONE representative row per `kind`; complex identity scenarios (same-ms same-key across a merge conflict) are not pinned.

Blast radius: Analysis CLI produces incorrect compliance rates, attempt counts, and regression attribution. If this surfaces in a ship-chain rollup, the maintainer has no indicator whether the numbers are trustworthy.

### FM-3 — `merge=union` blanket-glob footgun / mis-scoped gitattributes

What fails: The P1 wiring step adds four explicit scoped lines for `.bkit/{stats,friction,deferrals,failures}.jsonl`. The design correctly forbids a blanket `*.jsonl` glob. However, if a future maintainer adds a new `.bkit/` JSONL file (e.g. a P3 helper output, a test fixture) without a corresponding explicit exemption line, it silently falls through with no `merge=union` — a merge would produce a conflict instead of auto-concatenation, blocking the PR. Alternatively, if the blanket-glob restriction is forgotten and a template update adds it, consumer repos are corrupted on `bkit upgrade`.

How detected: Merge conflict at PR time (detectable but confusing — maintainer sees a conflict in what looks like a data file). Consumer corruption from a bad template: only detected after `bkit upgrade` breaks the consumer's non-append-only JSONL.

Blast radius: Per-file: blocked merge (recoverable). Consumer-facing: re-creates the `611b438` pinnedCommit bricking class for consumers with non-append-only `.jsonl` data files.

### FM-4 — Unbounded file growth with no enforced pruning trigger

What fails: `stats.jsonl` receives rows at every workflow close step across every sub-plan verify+remediate loop. A complex build with 3 sub-plans × 3 verify attempts × 3 challenge-remediate loops can produce 20+ rows per run. After 100 builds the file is large; after 1,000 it may cause fold-time performance degradation and commit-size noise. The design defers rollup/archive to P4 and mentions `foldFrom(paths[])` as the future-proofing mechanism, but the rollup trigger policy is explicitly left as an Open Question, and no MAX_ROWS or MAX_BYTES threshold is named.

How detected: Manually, when a maintainer notices slow fold times or large commits. No counter, no alert, no structured log. The design acknowledges the risk but provides no detection surface.

Blast radius: Single bkit repo (not consumers). Slow analysis CLI, slow ship-chain rollup step, large git history blobs. Recoverable via manual rollup but only if the maintainer recognises the symptom.

### FM-5 — `foldFrom(paths[])` ships in P1 but archive format is undefined until P4

What fails: `foldFrom(paths[])` must read both the hot file and any archive shards. The archive shard path convention (`.bkit/archive/{file}.{YYYYMM}.jsonl`) is mentioned in the design but the function is specified to ship in P1, while the archive format and rollup trigger are deferred to P4. If P4 is never built, `foldFrom` is effectively a single-file reader. If P4 IS built with a different archive naming convention than what P1 `foldFrom` assumed, every reader breaks.

How detected: Only when a P4 implementor diverges from an undocumented P1 assumption. No test pins the path convention; `foldFrom` in P1 has no archive shards to exercise.

Blast radius: P4 rollup breaks the analysis CLI and ship-chain rollup without warning. Requires a coordinated fix across `foldFrom`, the rollup writer, and potentially committed archive shards.

### FM-6 — Pre-P3 counter trustworthiness: LLM-authored `attempt:N` in existing rows

What fails: P1 adds inline-jq writers that emit `kind:"counter"` rows sourced from shell variables like `VERIFY_ATTEMPT` — but the current workflow (verified in `/Users/christian/Documents/GitHub/bkit/.worktrees/234-telemetry-jsonl/.bkit/workflows/bkit-build.md`, line 47 and 541) still has `MAX_VERIFY_ATTEMPT` and `VERIFY_ATTEMPT` as orchestrator-prose constants, not deterministic shell bus values. Until P3 lands, the `attempt:$a` value passed to jq IS the model's self-reported counter. P1 rows that look like counter events are structurally indistinguishable from P3 rows — there is no field indicating provenance or trustworthiness tier.

How detected: Not detectable from the row itself. An analysis author reading `kind:"counter"` rows emitted from P1 data will assume they are deterministic. This is explicitly noted in the design's Risks section ("pre-P3 counts are LLM-authored") but the design does NOT specify a field to discriminate pre-P3 from post-P3 rows.

Blast radius: Analysis CLI produces and surfaces attempt-rate figures that appear precise but are LLM self-reported. The design says "Analysis must label trust accordingly" but gives no mechanism for the reader to distinguish.

### FM-7 — Compliance grader exception / missing built CLI in close gate

What fails: `pnpm bkit comply --phase {phase}` is invoked in each workflow close gate (P2). If the `dist/bkit-comply.js` is not built, `pnpm` is not installed, or the TS compilation fails after a bad edit, the command fails. The design says "fail-open: grader exception → warning, workflow continues" but this relies on the workflow's shell invocation having an explicit `|| true` or equivalent. The design does not specify the exact failure-handling shell pattern for this invocation. A missing `|| true` means the close step exits non-zero, the workflow gate fails, and the grader has become a hard dependency — exactly the failure mode locked decision #6 forbids.

How detected: Close-step exit code causes the workflow gate to fail (the orchestrator sees a FAILED step). The maintainer is paged (if running CI) or blocked (if running locally).

Blast radius: Every workflow that hits a grader failure cannot close its gate without human intervention. If `dist/` is stale after a bad build push, all five workflows are affected simultaneously.

### FM-8 — Harvest reads consumer mid-write: half-written tail line

What fails: The harvest CLI reads a consumer worktree where a workflow is actively appending. The final line may be a partial JSON object. The design specifies "tolerant reader must skip an unparseable trailing line, count it, never throw" — this is correct and the pattern exists in `parseStatus`. However, `parseStatus` in the current `bkit-status.ts` does NOT implement skip-and-count for malformed lines — it calls `JSON.parse(l)` directly (line 139) and will throw on a malformed line. The new `bkit-telemetry.ts` is meant to fix this, but the fix must be explicitly tested against a truncated-line fixture, not just inferred from the description.

How detected: Harvest CLI crashes on a specific consumer's file, logs an error, and either skips that consumer or aborts. The maintainer may not notice if per-consumer errors are not prominently surfaced.

Blast radius: One consumer's data is excluded from the harvest run. If the harvest aborts entirely, all subsequent consumers' data is also lost for that run.

### FM-9 — P5 migration CLI: md-parser tolerance on real corpus vs. synthetic fixtures

What fails: The migration CLI parses `knowledge.md` and `decisions.md` — prose ledgers with no formal schema, 1,460 references, and accumulated edge cases (multi-line descriptions, nested bullets, missing fields, entries without `KN-N` headers). The design requires dogfood-first validation against the real corpus, but if the initial implementation is only tested against synthetic fixtures, the first live run on bkit's own repo will surface parser failures. The design acknowledges this but the failure mode is: migration CLI crashes mid-file, leaving a partial `knowledge.jsonl` alongside an intact `knowledge.md`. The caller must detect this and roll back.

How detected: Parser error logged to stderr. The dry-run-by-default discipline ensures no writes occur in the default path, but if a maintainer runs without dry-run, a partial write requires manual inspection.

Blast radius: bkit's own repo only (dogfood-first discipline). Consumer repos are unaffected until they opt in. But if a bug reaches consumers, the `.md` is still intact (the design's key safety property).

### FM-10 — `schemaVersion` field: unspecified branch/warn behavior for unknown versions

What fails: The design mandates `schemaVersion` on every row from P1, and says "lets the CLI warn on unknown versions instead of silently mis-bucketing." But the design does not specify: what version values are valid, what the initial version is, whether the fold/analysis CLI warns and continues or warns and excludes, and what triggers a version bump. If a future P-phase change adds or removes fields without bumping `schemaVersion`, existing analysis is mis-bucketed silently — the same failure `schemaVersion` is meant to prevent.

How detected: Silent analysis mis-bucketing — same as the problem the field is meant to solve. There is no alert or counter for "rows with unknown schemaVersion seen."

Blast radius: Potentially all historical data if the version-bump discipline is not enforced.

---

## Observability Coverage

This is a bkit-local agent-driven system. The observability model follows bkit's established pattern: structured logs to stdout/stderr with `[Context]` prefix, no server-side drains, no dashboards. All findings below are evaluated against that constraint.

### FM-1 (write failure, best-effort) — CRITICAL gap

The design specifies best-effort writes but does NOT specify the failure-handling shell pattern. There is no structured log at the failure point, no counter for "rows dropped due to write error," and no mechanism for the fold step or summary step to detect gaps (e.g., a missing `kind:"run-outcome"` row for a completed run). Detection path: user report only (maintainer notices suspicious numbers in a later analysis run).

### FM-2 (jq drift) — CONCERNS gap

Observability: parity test covers one representative row per `kind`. No coverage for identity collision under `merge=union` interleave. Metric for drift: none (a drifted fold produces wrong numbers, not an error). Detection path: analysis surprises (wrong compliance rate, incorrect attempt count) plus manual code review.

### FM-3 (gitattributes blanket-glob) — CONCERNS gap

Observability: the gitattributes validator (mentioned in the design) is the only check. No runtime counter for "this file has no merge=union attribute." Detection: merge conflict at PR time or post-upgrade consumer report.

### FM-4 (unbounded growth) — CONCERNS gap

No counter, no structured log, no threshold. The ship-summary step could emit a row count and file size warning as part of its fold-time reporting, but this is not specified. Detection path: manual observation.

### FM-5 (foldFrom P1 vs P4 convention mismatch) — CONCERNS gap

No test pins the archive shard path convention between P1 and P4. The `foldFrom` function is tested in P1 but only exercised against the hot file (no archive shards exist until P4). No warning when `foldFrom` finds an archive shard it cannot parse.

### FM-6 (pre-P3 counter trust) — CONCERNS gap

No row-level field distinguishes LLM-authored from deterministic counters. The design acknowledges this and says "analysis must label trust accordingly" — but the mechanism for doing so (a field, a date threshold, a `schemaVersion` tie) is unspecified. Detection: an analysis author must know to look at the `bkitVersion` and infer P3 shipping date.

### FM-7 (grader exception / missing dist) — CRITICAL gap

The design specifies fail-open for grader failures but does not specify the shell pattern (`|| true`, `2>/dev/null || echo "[bkit-comply] grader unavailable, skipping"`). No structured `[bkit-comply]` prefixed log line is specified for the skip-and-continue case. No metric for "grader invocation failures per run." Detection path: close-step exit code (if `|| true` is omitted) or user report (if it is included but silent).

### FM-8 (half-written tail line, harvest) — CONCERNS gap

The current `bkit-status.ts` `parseStatus` throws on malformed lines (line 139, `JSON.parse(l)` with no try/catch). The new `bkit-telemetry.ts` tolerant reader is specified but not yet implemented. Verification of the tolerant-parse path requires a specific unit test with a truncated-line fixture — not present in the design. No structured log for "skipped N malformed lines from consumer X."

### FM-9 (P5 migration, corpus tolerance) — CONCERNS gap

The design requires dogfood-first validation but does not specify a structured log format for parser errors during migration. A migration failure mid-file produces stderr output; no counter for "N entries failed to parse."

### FM-10 (schemaVersion discipline) — CONCERNS gap

No alert/counter for "rows with unrecognised schemaVersion seen." No specification of initial version value, valid range, or bump trigger. The warn-and-continue vs warn-and-exclude behavior on unknown version is unspecified.

---

## On-Call Ergonomics

"On-call" in this context = a future bkit maintainer (or the author returning after 3 months) encountering a broken state during or after a workflow run.

### Alert: Workflow close step exits non-zero due to telemetry append failure

Runbook clarity: None. The step output will show a jq error or `append: No such file or directory`. There is no runbook for this, no reference to a known recovery path, and no indicator whether the workflow data (code changes, commits) is intact. The maintainer must manually verify that the actual work is committed and then re-run or manually append the missing telemetry row.

Recovery action: Human judgment required. Not idempotent (re-running the step may re-execute business logic, not just the append).

Noise: Low (fails rarely, but when it does, blocks the gate if `|| true` is missing).

### Alert: Compliance grader (`pnpm bkit comply`) fails in close gate

Runbook clarity: Low. The error is a `pnpm` exit code. The maintainer must diagnose whether it is a missing `dist/`, a TS compilation error, a grader bug, or a real compliance violation that triggered a non-zero exit (if the advisory contract is violated). No standard `[bkit-comply] grader unavailable` message is specified.

Recovery action: Identify root cause, rebuild dist or bypass (with deliberate `|| true` if dist is broken). This is human judgment.

Noise: Low in steady state, HIGH after a bad release of `bkit-comply.ts` (all five workflow close gates are affected simultaneously).

### Alert: Analysis CLI produces unexpected numbers (wrong compliance rate, wrong attempt count)

Runbook clarity: Near-zero. The output of the analysis CLI is the only signal. The maintainer must manually inspect raw `.jsonl` files, run the fold manually, and compare. No structured log for fold anomalies. No checksum or row-count assertion in the ship-chain rollup.

Recovery action: Manual JSONL inspection. Requires knowledge of the identity tuple per `kind`. This is the 3am worst case: numbers are wrong, the system provides no self-diagnostic, and recovery requires reading the reducer source.

Noise: Continuous (every analysis run could surface bad data) but probably rare.

### Alert: Harvest CLI stalls or errors on a specific consumer

Runbook clarity: The design specifies "per-consumer timeout + continue on stall; logs files-found/rows-copied/skipped+reason" — this is the right shape. However, the log format is not specified (what prefix, what file, stderr vs stdout). The maintainer reading a harvest run log must parse unstructured output to understand which consumer failed and why.

Recovery action: Idempotent — re-run harvest after the consumer finishes its workflow. The copy-only model means no consumer data is damaged.

Noise: Low.

### Alert: P3 counter refactor wedges a workflow (bad `check_max`/`decide_next`)

Runbook clarity: Very low. A workflow step that should escalate on `MAX_VERIFY_ATTEMPT` fails to do so (or does so when it should not) due to a `check_max` bug. The symptom is a workflow that loops beyond MAX or exits prematurely. The maintainer sees incorrect behavior, not an explicit error. No structured log for counter state at each check.

Recovery action: Human judgment. Must inspect `stats.jsonl` to reconstruct counter state, compare to the shell helper logic. This is the highest-complexity recovery scenario.

Noise: Low once stable, HIGH immediately after P3 lands (all 5 workflows change simultaneously).

---

## Operational Dependencies

The design introduces the following new on-call/maintenance surfaces:

1. Four new `.bkit/*.jsonl` data files that must be monitored for growth, not corrupted by gitattributes misconfiguration, and kept out of the manifest. No dashboard. Monitoring is manual (periodic `wc -l` or ship-summary row count).

2. `bkit-telemetry.ts` codec/reducer: new canonical source of truth that ALL telemetry depends on. Any bug in `fold`, `identity`, or `parse` silently corrupts all downstream analysis. Requires the parity test to be run on every change — there is no CI gate enforcing this beyond "tests pass."

3. `bkit-comply.ts` grader registered as a new `comply` verb in `bkit-cli.ts` Verb union. This is a new CLI surface that can fail after any `pnpm build` regression. The grader runs in every workflow close gate from P2 onward.

4. The shared path-policy table (grader ↔ `gateguard.cjs` via install-time generation): a new generated file that must be kept in sync via the install engine. If codegen fails or the TS source changes without triggering a regeneration, `gateguard.cjs` will have a stale policy table. No alert for stale policy.

5. Shell counter bus helpers (`counter_init/inc/get/reset/check_max`, `decide_next`) — new shell infrastructure that all 5 workflows depend on after P3. A bug in these helpers affects all workflows simultaneously. No unit tests are specified for the shell helpers themselves (only for the emitted JSONL rows).

6. Harvest CLI: a new verb that reads consumer repos. Consumer-side changes (worktree path changes, renamed `.bkit/` files) will silently produce empty harvest results. No alert for "expected N consumers, found 0 rows."

7. `foldFrom(paths[])`: a new function in P1 that must correctly handle an archive path format not yet defined. Future P4 implementors must discover the expected path convention from reading P1 source.

---

## Verdict Reasoning

The design is structurally sound and directly generalises the proven `status.jsonl` machine. The core locked decisions (best-effort writes, advisory grader, event-sourced fold, copy-only harvest, opt-in migration) are all operability-positive choices that prevent the known failure classes (gating, bricking, data mutation). The design's own Risks section correctly identifies most of the serious failure modes.

The CONCERNS fall into two clusters:

**Cluster A — Underspecified failure-handling shell patterns (FM-1, FM-7):** The "best-effort / fail-open" discipline is stated in prose but the concrete shell idiom (`|| true`, `2>/dev/null || echo "[bkit-comply] skipping"`) is not specified. For best-effort telemetry writes this is workable because losing a row is recoverable. For the grader close gate (FM-7), a missing `|| true` makes the grader a hard dependency, violating locked decision #6. This must be resolved before P2 ships.

**Cluster B — Silent data quality degradation (FM-2, FM-6, FM-10):** Inline-jq ↔ reducer drift, pre-P3 counter trust, and `schemaVersion` discipline all share the same failure mode: the system produces numbers that appear trustworthy but are not, with no self-diagnostic. The parity test and `schemaVersion` are the mitigations, but neither is fully specified (parity coverage per `kind`; `schemaVersion` initial value, bump trigger, and CLI behavior on unknown version).

Neither cluster is a FAIL — the system is operable and recoverable in all enumerated failure modes. But Cluster A has one CRITICAL item (grader shell pattern), and Cluster B needs concrete specification before the analysis CLI produces numbers anyone can rely on.

---

## CRITICAL

**C-1 — Grader close-gate failure-handling shell pattern must be specified.**

The design says "fail-open: grader exception → warning, workflow continues" but does not specify the shell invocation pattern. Every workflow close gate that calls `pnpm bkit comply --phase` must have an explicit `|| echo "[bkit-comply] grader unavailable, skipping"` (or equivalent) that guarantees exit 0 even on grader failure. Without this, a `dist/` build regression or a grader bug converts an advisory step into a hard gate across all 5 workflows simultaneously — exactly what locked decision #6 prohibits. This pattern must be pinned in the plan, not left to the implementor.

**C-2 — `bkit-telemetry.ts` tolerant `parse` must differ from `bkit-status.ts` `parseStatus` in a load-bearing way: try/catch per line.**

The existing `parseStatus` (line 139 of `/Users/christian/Documents/GitHub/bkit/.worktrees/234-telemetry-jsonl/.bkit/src/bkit-status.ts`) calls `JSON.parse(l)` with no per-line try/catch — a malformed line throws and aborts the fold. The new telemetry `parse` MUST wrap each line's parse in a try/catch, skip malformed lines, and increment a `malformedLineCount`. This is especially load-bearing for harvest (FM-8). The plan must include a unit test pinning this behavior against a truncated-line fixture — not just specified in prose.

---

## OPTIONAL

**O-1 — Add a `counterProvenance` field (or `schemaVersion` tie) to distinguish pre-P3 LLM-authored counters from post-P3 deterministic shell bus counters (FM-6).**

A boolean `deterministicCounters: false` or a `counterSource: "model-self-report" | "shell-bus"` on `kind:"counter"` rows would let the analysis CLI automatically filter and label the trust tier, without requiring the reader to know the P3 ship date or `bkitVersion`.

**O-2 — Specify `schemaVersion` initial value, valid range, and CLI behavior for unknown version (FM-10).**

The plan should name the initial version (e.g. `1`), the criteria for incrementing it (breaking field change, not additive field), and the fold/analysis behavior on an unknown version (warn-and-exclude-from-rate-calculations vs warn-and-continue). Without this, `schemaVersion` is an insurance field that nobody knows how to act on.

**O-3 — Pin the archive shard path convention between P1 `foldFrom` and P4 rollup in the plan (FM-5).**

Even if P4 is deferred, the plan should specify the path template (`.bkit/archive/{file}.{YYYYMM}.jsonl`) as a constant in `bkit-telemetry.ts` so P4 cannot silently diverge. A P1 unit test that calls `foldFrom` with a synthetic archive shard at that path would lock this contract.

**O-4 — Specify the rollup/pruning trigger threshold (FM-4).**

Defer the actual rollup implementation to P4, but name a `MAX_ROWS_BEFORE_ROLLUP` or `MAX_BYTES_BEFORE_ROLLUP` constant in the design so the plan can include a ship-summary row-count warning when the threshold is exceeded. Currently the Open Question is fully unresolved.

**O-5 — Specify a structured `[bkit-telemetry]` log line for every skipped/failed write.**

The existing bkit pattern (`[bkit-install]`, `[bkit-preflight]`) is the grep-able audit trail. Adding `[bkit-telemetry] append failed: {file} {error}` and `[bkit-comply] grader unavailable, skipping: {reason}` to the shell patterns would make the failure modes detectable without requiring JSONL inspection.

**O-6 — Shell counter bus helpers need unit tests, not just integration coverage via emitted JSONL rows (FM-P3).**

The design specifies that `check_max` and `decide_next` are the control-flow branch points for all 5 workflows after P3. A bug in `decide_next` that exits with the wrong code produces a workflow that silently takes the wrong branch. Shell unit tests (bats or equivalent) for the helpers would catch this before it affects all 5 workflows simultaneously.

---

## OUT OF SCOPE

**OUT-1 — Server-side observability, dashboards, log drains.**

bkit has no server-side telemetry infrastructure (`docs/observability.md`: "bkit has no server-side telemetry pipeline, log drains, or tracing infrastructure"). All failure detection is local CLI output. This is a known constraint, not a gap in this design.

**OUT-2 — Consumer-side telemetry pipeline operational concerns.**

Consumers operate their own repos. The design's consumer impact is limited to: read-only harvest (never writes), opt-in P5 migration (dry-run-by-default), and template changes (`.gitattributes`, slop, vale). Consumer operational concerns beyond "harvest doesn't corrupt their files" are outside this design's scope.

**OUT-3 — #183 GitHub-API backfill operational concerns (rate limits, token scope, historical depth).**

The analysis CLI's GitHub-API backfill (hand-written baseline provenance, historical PRs) introduces an external dependency with its own failure modes (rate limit, token rotation, repo visibility). These are real but belong in the P4 plan, not this design review.

**OUT-4 — The `offline pass^k` fixture tier for the grader.**

Explicitly out of scope per locked decision #6 / the archived #232 notes. Operational concerns for that tier are deferred accordingly.
