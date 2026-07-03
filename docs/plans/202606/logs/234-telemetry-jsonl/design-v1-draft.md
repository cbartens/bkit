# Design: bkit unified `.bkit/*.jsonl` telemetry system

## Related Issues

- #234 — bkit telemetry: unified `.bkit/*.jsonl` (stats/friction/deferrals/failures) + harvest & analysis (open) — this design
- #232 — bkit-comply empirical compliance eval / deterministic grader (closed as duplicate into #234)
- #183 — Measure lines of code vs PR error rate / size↔outcome regression (closed as duplicate into #234)
- #233 — Enhance friction collection utility prompt → JSONL + harvest script (closed as duplicate into #234)
- #58 — Workflow counters status.json shell / prose→shell counter refactor, BAR-147 (closed as duplicate into #234)
- #230 — affaan/ECC adoption parent review (closed) — items A (GateGuard) + D (config-protection) shipped `7732d69`; item E provenance stamping reverted `611b438` (repo-bricking footgun); item B (eval layer) = this issue

## Acceptance Scenario

### Narrative

As a bkit maintainer, I run a workflow (design/plan/build/debug/ship) and at its close it appends machine-readable telemetry rows to `.bkit/*.jsonl` — compliance grades, run outcomes, deterministic attempt/failure counts, friction, deferrals, and discovered bugs — without me writing prose ledgers by hand. At ship, the summary step shows me an aggregate rollup of the whole design→plan→build→debug→ship chain (counts, rates, elapsed times, compliance violations) read straight from those logs. Later, I run a harvest CLI that copies the same telemetry from my consumer repos on this machine and an analysis CLI tells me where compliance is regressing and whether change size predicts PR error rate — all without ever mutating a consumer's files.

### Success Criteria

1. Every workflow close step appends well-formed telemetry rows to the relevant `.bkit/*.jsonl`; rows are folded to current state by ONE canonical TypeScript reducer whose semantics a unit test pins, and a parity test proves an inline-jq-written row parses identically under that reducer.
2. The compliance grader runs as a deterministic, advisory (never-gating, fail-open) step over `git diff parentSha..HEAD` + files, surfaces violations in `ship-summary.md`, and emits one compliance row per run×rule — and the same run never blocks because telemetry/grading failed.
3. After the #58 refactor, no `*_ATTEMPT` counter or `MAX_*` comparison lives in orchestrator prose (only in fenced shell), all `MAX_*` thresholds live in one config, exceeding a `MAX_*` cannot silently continue, and a `status.jsonl` invariant check confirms counter rows equal the count of the steps they count.
4. The harvest CLI copies (never moves/truncates/writes) consumer `.bkit/*.jsonl`, deduplicates by a per-`kind` composite identity, and a harvest bug cannot destroy or alter consumer data; the analysis CLI reports counts/rates/elapsed-time and the #183 size↔outcome regression with a dispatch-size threshold.
5. The four data files stay OUT of the manifest (git-tracked runtime content), each has its own explicit scoped `merge=union` line (never a blanket `*.jsonl` glob), is exempt from install/mirror + slop-scan + Vale, and is committed at close with `[skip ci]`; legacy `KN-`/`DE-` references resolve via `aliases[]` with no mass retrofit of the ~1,460 existing references.

### Key Edge Cases

- **`merge=union` interleave + `ts`-ms collision.** Union may duplicate/interleave appended lines and two branches can write the same ms `ts` for the same logical key; the fold reducer MUST dedupe by a per-`kind` composite identity (not bare `ts`), mirroring `bkit-status.ts`'s tuple-identity dedupe.
- **Blanket-glob footgun.** `merge=union` must NEVER be `.bkit/*.jsonl` — the existing `.gitattributes` comment forbids it (union corrupts a consumer's non-append-only `.jsonl`). Each file gets one explicit scoped line; P5 files get their own lines when added.
- **Telemetry/grader failure must degrade, not abort.** A malformed line, a missing built CLI, or a grader exception must surface as a warning and let the workflow continue (advisory/fail-open per locked decision #6 + GateGuard precedent) — never a hard stop in the workflow hot path.
- **Half-written tail line during harvest.** Harvest reads a consumer worktree that may be mid-write; the tolerant reader must skip an unparseable trailing line (count it, never throw), exactly as `parseStatus` tolerates malformed lines.
- **Trust boundary on free-text + pre-P3 counts.** Free-text fields (`description`/`root_cause`) are LLM-authored; attempt/failure counts are the model's self-report UNTIL P3 makes them deterministic. Analysis must not present attempt-rate as trustworthy before P3.
- **P5 consumer migration is the bricking class.** Auto-migrating consumer `knowledge.md`/`decisions.md` on `bkit upgrade` re-creates the pinnedCommit (`611b438`) consumer-bricking footgun; migration must be an opt-in, dry-run-by-default CLI that writes alongside the `.md` (never deletes it), dogfood-validated on bkit's own repo first and via a packed tarball in a clean consumer dir.
- **Concurrency / single-clone.** No-concurrent-workflows on one clone is already enforced; telemetry adds more close-step writes to the same files, so writes stay append-only and best-effort and the design must not assume locking.

## Architecture

The system is a direct generalisation of the already-shipped per-FID `status.jsonl` machine: append-only NDJSON files governed by one canonical TypeScript reducer/codec, written by inline-jq close steps that mirror the reducer, and read by downstream deterministic scripts. Nothing introduces an infra category the repo has not already validated in production.

### Component map

<!-- prettier-ignore -->
| Component | Path (canonical source) | Role | Phase |
| --- | --- | --- | --- |
| Telemetry codec/reducer | `.bkit/src/bkit-telemetry.ts` | ONE canonical module: shared envelope type, per-`kind` discriminated-union payloads, per-`kind` identity function, `fold(events)`, tolerant `parse(raw)`, `appendLine(event)`, `validate(event)`, `foldFrom(paths[])`. Cloned from `bkit-status.ts`. | P1 |
| Telemetry codec test | `.bkit/src/bkit-telemetry.test.ts` | Unit-tests fold/identity/validate per `kind`; parity test: a representative inline-jq-written row parses identically under `parse`. | P1 |
| Data files | `.bkit/{stats,friction,deferrals,failures}.jsonl` (P1); `docs/{knowledge,decisions}.jsonl` (P5) | Append-only NDJSON ledgers. Git-tracked runtime content, NOT manifest entries. | P1 / P5 |
| Workflow close-step writers | `.bkit/workflows/bkit-{design,plan,build,debug,ship}.md` | Inline `jq -nc … >> "$FILE"` blocks (mirroring `appendLine`/`fold`) that append rows at existing step boundaries. | P1, P3 |
| Compliance grader | `.bkit/src/bkit-comply.ts` (+ `.test.ts`) | Pure functions `(parentSha, phase, planPath) -> Violation[]`; deterministic, advisory; `pnpm bkit comply --phase` in each close gate; emits `kind:"compliance"` rows; surfaces in `ship-summary.md`. | P2 |
| Path-policy table | shared TS source (e.g. exported from `bkit-tiers.ts` or new `bkit-paths-policy.ts`) | Single protected-path table consumed by the grader directly and by `gateguard.cjs` via install-time generation. | P2 |
| Shell counter bus | shell helper invoked from workflows (`counter_init/inc/get/check_max`, `decide_next`) + `MAX_*` config | Deterministic prose→shell counter refactor; emits `kind:"counter"` rows into `stats.jsonl`; replaces LLM-written `attempt:N`. | P3 |
| Harvest CLI | new `bkit` verb / utility script (replaces `utility-harvest-friction` agent) | COPY-ONLY collector: reads `docs/bkit-consumers.md` → consumer worktrees → copies `.bkit/*.jsonl` into bkit; dedupe by per-`kind` composite; never writes/truncates consumer repos. | P4 |
| Analysis CLI | new `bkit` verb / utility script | Reads folded telemetry (hot + archive via `foldFrom`); reports counts/rates/elapsed; #183 size↔outcome regression + GitHub-API backfill; dispatch-size threshold; `bkitVersion`→CHANGELOG regression attribution. | P4 |
| Migration CLI | new `bkit` verb (e.g. `bkit telemetry migrate`) | Opt-in, dry-run-by-default; parses `KN-`/`DE-` ledgers → `docs/{knowledge,decisions}.jsonl` with `aliases:[…]` ALONGSIDE the `.md` (never deletes). | P5 |

### Boundaries & integration points

- **Canonical-source rule:** all edits land in `.bkit/`, `.agents/`, and root config; the `.claude/*` and `.cursor/*` mirrors are regenerated by the install engine, never hand-edited.
- **Write path = self-contained shell+jq** (no hard dependency on a built CLI in the workflow hot path), consistent with `status.jsonl`. The TS codec is the unit-tested source of truth; the inline jq mirrors it. Telemetry writes are best-effort and never gate.
- **Read path = deterministic scripts** (grader, analysis, summary) that import or re-implement `fold`. The grader, summary step, and analysis CLI are the only readers; there is no human renderer (locked decision #4 — agent-read).
- **Exemption surface (reuse existing knobs, no new category):** each data file gets (1) one explicit scoped `.gitattributes merge=union` line inside the markered block, (2) a `slop-scan.config.json` `ignores[]` entry, (3) a `.vale.ini` scope block disabling House/write-good rules, and (4) NO manifest `format` entry (it is git-tracked content, not engine payload — exactly how `status.jsonl` and the `.md` ledgers are handled today).
- **#230 reuse:** GateGuard (A, `7732d69`) and config-protection (D) are the proven deterministic-advisory / fail-open / dogfood-gated-deny-ramp precedent the grader mirrors. The grader shares the protected-path table with GateGuard's `GATE_CONFIG_PATTERNS` concept.
- **Commit discipline:** data-file mutations are committed at workflow close with `[skip ci]` (append-only, `merge=union`, single-clone serialisation already enforced).

## Data Model

### Shared envelope (every row, every file)

One JSON object per line. All rows carry the same envelope; a `kind` discriminator selects the per-`kind` payload (which freely mixes typed fields and free-text prose — locked decision #1, "combine, don't separate").

<!-- prettier-ignore -->
| Field | Type | Notes |
| --- | --- | --- |
| `ts` | number | Primary id = unix **milliseconds** (locked decision #2). Doubles as timestamp → elapsed-time/intervals. ms avoids same-second collisions when one step writes several rows. |
| `schemaVersion` | number | On EVERY row from P1 (rows are immutable — retrofitting later is impossible). Lets the CLI branch/warn on unknown versions instead of silently mis-bucketing. (Premortem-lens additive insurance.) |
| `kind` | string (closed enum) | Discriminator. Validated on append — unknown `kind` rejected, preventing the junk-drawer drift. |
| `repo` | string | Origin repo (stamped on harvest dedupe + cross-repo analysis). |
| `bkitVersion` | string | Stamped on every row; load-bearing for #183 release-attributed-regression join (`bkitVersion` → CHANGELOG). |
| `workflow` | string? | design \| plan \| build \| debug \| ship (where applicable). |
| `subagent` | string? | Emitting subagent, if any. |
| `severity` | string? | Where applicable. |
| `references` | string[] | Outbound links (JSONL form of the legacy `Related:` field): issues, PRs, commit SHAs, FIDs, paths, sibling `ts`. |
| `aliases` | string[] | This entry's OWN former id(s) (`KN-14`, `DE-7`). Kept separate from `references` to avoid "I AM KN-14" vs "I LINK TO KN-14" collision (locked decision #5). Clean break: new entries get `ts` ids + empty `aliases`. |

### Files and their `kind` sets

<!-- prettier-ignore -->
| File | Replaces | `kind` values | Identity (fold/dedup) key |
| --- | --- | --- | --- |
| `.bkit/stats.jsonl` | new | `compliance` (per run×rule), `run-outcome` (#183 size+outcome signals), `counter` (#58 attempt/failure counts) | per-`kind` composite — e.g. `compliance` keyed by `(repo, workflow, parentSha, rule)`; `counter` keyed by `(repo, workflow, parentSha, counterName)`; `run-outcome` keyed by `(repo, prNumber)` |
| `.bkit/friction.jsonl` | `.bkit/friction.md` | `friction` | logical key (e.g. normalized `category+scope+description-hash` or an explicit written-once `key`) so the instinct loop = append same-key row |
| `.bkit/deferrals.jsonl` | `docs/pending.md` | `deferral` | logical key per deferred item |
| `.bkit/failures.jsonl` | new | `failure` | logical key per discovered bug |
| `docs/knowledge.jsonl` (P5) | `docs/knowledge.md` | `knowledge` | logical key; legacy `KN-N` preserved in `aliases` |
| `docs/decisions.jsonl` (P5) | `docs/decisions.md` | `decision` | logical key; legacy `DE-N` preserved in `aliases` |

### Event-sourcing + fold (locked decision #3)

Rows are immutable + append-only (preserves `merge=union` safety). "Current state" is derived by folding — never by mutating prior rows. The #230-item-C instinct loop (confidence rises on recurrence, last-confirmed bumps) is a NEW appended row with the SAME logical key; the fold reduces same-key rows to current state and computes `confidence` / `lastConfirmed` / recurrence-count / interval-between-recurrences for free — identical to how `status.jsonl` folds repeated `step-done` rows.

Dedup identity is a **per-`kind` composite key, NOT bare `ts`** (resolved divergence — see Decisions). Under `merge=union`, two branches can append a same-`ts` same-key row; both survive at git level, so the reducer's `identity(event)` collapses them, exactly as `bkit-status.ts` collapses by `(workflow, step, parentSha, at)`.

### `kind:"compliance"` and `kind:"run-outcome"` payloads (from #232/#183)

- `compliance`: `rule`, `result` (`pass`|`fail`|`n/a`), `evidence`, `phase`, `graderVersion` (+ `bkitVersion` from envelope). One row per run×rule.
- `run-outcome`: size signals (`additions`/`deletions`/`net`/`files_changed` + diff-complexity proxy), outcome signals (`ci_first_try`, `corrective_commits`, `reverted`/hotfix-within-N-days, `review_iterations`), provenance (agentic via `claude/` branch vs hand-written baseline), plus `blocking_deferrals`/`exempt_deferrals` + `sweep_verdict` (from `bkit-ship` Step 5's `ship-deferred-sweep.md` header + `status.jsonl`).

### `kind:"counter"` payload (from #58)

Counters are events, NOT a side-car state file: `{verifyAttempt, testAttempt, challengeAttempt, debugAttempt, mergeAttempt, subPlan, subCount}` are emitted as `kind:"counter"` rows at attempt boundaries and folded to current value. This makes the #58 fold-invariant (`counters.verifyAttempt` == count of `plan-verify` rows) checkable and gives recurrence/interval-between-retries for free — a side-car file would diverge from the event stream under mid-loop failure.

### Reducer surface (`bkit-telemetry.ts`, cloned from `bkit-status.ts`)

`fold(events)`, `foldFrom(paths[])` (reads archive + hot so deferred P4 rollup-to-`.bkit/archive/{file}.{YYYYMM}.jsonl` doesn't break readers later), tolerant `parse(raw)` (skips/counts unparseable lines, never throws), `appendLine(event)`, per-`kind` `identity(event)`, `validate(event)` (reject malformed + unknown `kind` before write).

## Components / Flows

Organised along the locked P1–P5 phasing (dependency-ordered; the design-organise step will formalise `Suggested Workstreams`). Each phase is independently shippable and additive on the prior.

### P1 — JSONL substrate (bkit-local, additive)

1. **Codec.** Write `.bkit/src/bkit-telemetry.ts` (envelope + per-`kind` union + `fold`/`foldFrom`/`parse`/`appendLine`/`identity`/`validate`) and `.bkit/src/bkit-telemetry.test.ts` (fold/identity/validate per `kind` + inline-jq parity test). Clone the shape of `bkit-status.ts` / `bkit-status.test.ts`.
2. **Files + exemptions.** Create `.bkit/{stats,friction,deferrals,failures}.jsonl` (seeded empty). Extend the `.gitattributes` markered block with FOUR explicit scoped lines (`.bkit/stats.jsonl merge=union`, etc. — never a blanket glob). Add the four paths to `slop-scan.config.json` `ignores[]`. Add a `.vale.ini` scope block disabling House/write-good for them. Do NOT add manifest `format` entries. Update `.bkit/templates/.gitattributes` / slop / vale templates so consumers inherit the same exemptions.
3. **Migrate ledgers.** `friction.md` → `friction.jsonl` (carry fields into `kind:"friction"` payload); `docs/pending.md` → `deferrals.jsonl` (`kind:"deferral"`); introduce `failures.jsonl` (`kind:"failure"`). Clean break — new entries get `ts` ids; legacy entries that move keep their old id only in `aliases[]`. Retire the `.bkit/templates/.bkit/friction.md` / `docs/pending.md` templates in favour of seeded `.jsonl` (the `.md` versions stay readable-legacy where they contain history).
4. **Basic stats wiring.** Add inline-jq close-step writers in all 5 workflows that append attempt/failure-count rows at EXISTING step boundaries (model's self-report until P3 makes them deterministic) plus per-workflow summary read (count/size/fold-time).
5. **Rules.md additions.** New universal rules: "Never silently drop work → append `deferrals.jsonl`"; "Any found bug → append `failures.jsonl`"; reinforce "workflows also write `friction.jsonl` + `stats.jsonl`." Cross-check `.agents/docs.md` so the topic lives in exactly one canonical doc; update `.agents/docs.md` catalog for the new ledgers. ASCII operators only in workflow/prompt files.

### P2 — Compliance grader (bkit-local)

1. **Pure functions.** `.bkit/src/bkit-comply.ts`: `(parentSha, phase, planPath) -> Violation[]`, unit-tested. Smallest first version = 2 git-only rules (e.g. `no-mirror-edit` = `.claude/*`/`.cursor/*` untouched in diff; `skip-ci-not-head` = `git log -1`), then grow the rule table. Each rule is data citing the prohibition it grades; `graderVersion` stamped on every row.
2. **Shared path-policy table.** Factor the protected-path patterns into a single exported TS table (extend `bkit-tiers.ts` or add `bkit-paths-policy.ts`); the grader imports it directly. `gateguard.cjs` (a `.cjs` hook, not TS-importable) receives the same table via **install-time generation** from the TS source (resolved divergence — see Decisions), eliminating duplicate drift between hook and grader.
3. **Close-gate integration.** Each workflow close gate runs `pnpm bkit comply --phase {phase}` (advisory), appends `kind:"compliance"` rows to `stats.jsonl`, and surfaces violations in `ship-summary.md`. Fail-open: grader exception → warning, workflow continues. Register the `comply` verb in `bkit-cli.ts` (`Verb` union) + usage.

### P3 — #58 counter refactor (all 5 workflows, control-flow; bounded high-risk)

1. **Shell counter bus.** Helper providing `counter_init/inc/get/reset/check_max` and `decide_next` (prints next step id, exit code = branch). All `MAX_*` thresholds in ONE config file. Counters emit `kind:"counter"` rows into `stats.jsonl`.
2. **Staged migration** (per design-input + #58): bkit-build (worst offender) → bkit-debug → plan/design. Move every `*_ATTEMPT` counter and `MAX_*` comparison out of prose into fenced shell; keep narrative judgment branches (PASS/FAIL/CONCERNS, STANDARD/PIVOT/FINAL).
3. **Invariant check.** `status.jsonl` invariant (`counters.verifyAttempt` == count of `plan-verify` rows, via jq + the folded `bkit-status`/`bkit-telemetry` readers). Acceptance: no `*_ATTEMPT` in prose except in fenced shell; all `MAX_*` in one config; exceeding `MAX_*` cannot silently continue. Only after P3 are attempt/failure stats trustworthy.

### P4 — Harvest + analysis (bkit-local + consumer READ)

1. **Harvest CLI** (replaces `utility-harvest-friction` agent): reads `docs/bkit-consumers.md` → `git worktree list --porcelain` per consumer → **COPIES** each consumer's `.bkit/*.jsonl` into bkit, deduping by per-`kind` composite `(ts, repo, …)` and stamping `repo`. NEVER truncates/writes/commits in consumer repos (deliberate divergence from the friction-truncate model — defends the install↔dogfood bricking class on the read side). Per-consumer timeout + continue on stall; logs files-found/rows-copied/skipped+reason; tolerant reader skips half-written tail lines.
2. **Analysis CLI.** Counts/rates/elapsed-time; #183 size↔outcome regression (logistic `error ~ log(lines) + files_changed`, bucketed) over `kind:"run-outcome"` rows + GitHub-API historical backfill (pulls/commits/check-runs/reviews, incl. hand-written baseline the grader can't see); actionable **dispatch-size threshold** feeding `plan-complexity-check`/`split`; per-rule compliance rate over time + per `bkitVersion` joined to CHANGELOG for release-attributed regression. Recommend/inform only.
3. **Ship-chain rollup.** `bkit-ship` summary reports the ship workflow AND the entire design→plan→build→debug→ship chain (aggregate counts, rates, elapsed, compliance violations) read from the folded telemetry.
4. **Designed-for-now, deferred-build rollup/archive.** `foldFrom(paths[])` (P1) already reads archive + hot, so a later rollup of oldest rows into `.bkit/archive/{file}.{YYYYMM}.jsonl` doesn't break any reader.

### P5 — knowledge/decisions migration + consumer-upgrade path (install engine + consumers)

1. **New files.** `docs/knowledge.jsonl` (`kind:"knowledge"`), `docs/decisions.jsonl` (`kind:"decision"`) with their OWN explicit `merge=union` lines + exemptions. `KN-N`/`DE-N` preserved only in `aliases[]`.
2. **Opt-in migration CLI** (`bkit telemetry migrate` or similar): dry-run-by-default; parses the consumer's `.md` ledgers → `.jsonl` ALONGSIDE (never deletes the `.md`); prints diff/summary; emits a **generated, committed `KN-`/`DE-` → row lookup table** so the ~1,460 references resolve auditably (not a runtime re-parse). NOT engine-auto-migrate on `bkit upgrade` (resolved divergence — see Decisions).
3. **Dogfood discipline.** bkit's own repo migrates first by hand-reviewed CLI run; validate the parser against bkit's REAL `knowledge.md`/`decisions.md` corpus (not synthetic fixtures) and via a packed tarball in a clean consumer dir — `bkit check` != live migration.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| **Per-purpose files** (`stats`/`friction`/`deferrals`/`failures`; later `knowledge`/`decisions`), one canonical `bkit-telemetry.ts` codec/reducer | Single combined `telemetry.jsonl` (all-lens Approach B) | All three lenses converged. Honours locked decision #1 ("one file per purpose"); isolates blast radius (one bad writer can't wedge every reader); clean rules.md→file affordance ("bug → `failures.jsonl`" beats "a row in the big file"); per-purpose pruning/selective harvest; additive P5 without touching P1 files. |
| **Writers = inline `jq -nc … >> "$FILE"`** mirroring the unit-tested TS reducer | Thick `bkit telemetry append` CLI verb (lens-1 Approach C) | Keeps telemetry writes self-contained shell — best-effort, never-gate (decision #6) — with NO hard dependency on a built CLI in the workflow hot path; consistent with `status.jsonl`. A thick CLI turns "log telemetry" into a potential hard stop if `dist/` isn't resolvable. Drift risk mitigated by TS-is-canonical + parity test (existing `status.jsonl` discipline). |
| **Counters = `kind:"counter"` events in `stats.jsonl`**, NOT a side-car state file | `counters.json` state file (original #58 scope; lens-2 Approach B) | The #58 fold-invariant acceptance criterion REQUIRES counters reconstructible from the event log; a side-car diverges from `status.jsonl` under mid-loop failure. Event-sourcing also yields recurrence/interval-between-retries for free. |
| **Dedup identity = per-`kind` composite key**, not bare `ts` | `ts` alone; a new `runId` field (#232 proposal) | `ts` is ms-precision but two same-repo writes (resumable restart) or a `merge=union` interleave can collide; composite identity uses EXISTING fields (no new field to propagate) and mirrors `bkit-status.ts`'s tuple dedupe. Each `kind` defines its own identity tuple. |
| **`schemaVersion` on every row from P1** | Add versioning later | Rows are immutable append-only — retrofitting is impossible. Cheapest insurance against silent mis-bucketing; lets the CLI warn on unknown versions. (Premortem-lens additive contribution.) |
| **Shared path-policy table generated into `gateguard.cjs` at install time** from one TS source | Duplicate constants in TS + CJS; no sharing | GateGuard (`.cjs`, not TS-importable) and the grader both pattern-match paths; one source of truth eliminates drift. Install-time codegen is the EXISTING bkit pattern for mirrors. |
| **Grader = deterministic script, advisory, fail-open**, `[skip ci]` close commit; NOT a subagent, NEVER gates | Grade-as-subagent; gate the close step / PR | Locked decision #6. A grader-as-subagent reintroduces the nondeterminism being measured. GateGuard is the proven deterministic-advisory / fail-open / dogfood-gated-deny-ramp precedent. |
| **Harvest = COPY-ONLY**, dedup by `(ts, repo, …)`, never writes/truncates/commits consumer repos | Truncate-source (the `utility-harvest-friction` model) | Deliberate divergence. Telemetry is the consumer's OWN analysis history; copying (not moving) makes a harvest bug structurally non-destructive — pre-empts the pinnedCommit-class (`611b438`) consumer-bricking on the read side. |
| **P5 consumer migration = opt-in, dry-run-by-default CLI**, writes alongside `.md` | Engine auto-migrates consumer ledgers on `bkit upgrade` (lens-3 Approach C, argued against) | Auto-migration runs a tolerance-heavy `KN-`/`DE-` parser across consumer repos automatically = the exact pinnedCommit bricking class. Opt-in + dogfood-first + tarball-validated honours "verify install AND upgrade live" + "dogfood via packed tarball, not the repo". |
| **`aliases[]` for `KN-`/`DE-` backward compat**; no mass retrofit | Mass find-replace of ~1,460 refs to new ids | Locked decision #5. Old refs live in engine source, archived plans, CHANGELOG, closed issues, consumer repos; mass retrofit is high-blast-radius and breaks immutable history. A generated committed lookup table makes resolution auditable. |
| **Keep data files OUT of the manifest**; only `.gitattributes`/rules/template blocks are engine-managed | Add `format` entries for the `.jsonl` files | Concretely realises "exempt from install/mirror + slop + Vale" — matches how `status.jsonl` and the `.md` ledgers are handled today (git-tracked content, not engine payload). Per-file opt-out in slop/Vale, never a blanket "skip `.jsonl`". |
| **`ts` = unix milliseconds, primary id + timestamp** | seconds; separate id + timestamp fields | Locked decision #2. (Note: `status.jsonl` uses ISO `at` strings — telemetry's ms `ts` is an intentional, documented divergence the reducer handles.) |

## Approaches Considered

Three lenses each produced an A/B/C set. All three independently recommended their "A" and all three A's converge on the same shape — per-purpose files + one canonical `bkit-telemetry.ts` reducer cloned from `bkit-status.ts`, counters-as-events, copy-only harvest, opt-in P5 migration. The kept design is that convergent A, with the premortem lens's mitigations (schemaVersion, foldFrom-for-rollup, tolerant reader, copy-only, dogfood-first migration) layered on.

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| **Per-purpose files + canonical TS codec + inline-jq writers** (lens-1 A / lens-2 A / lens-3 A — convergent) | **KEPT** | 1:1 generalisation of the shipped `status.jsonl` machine; lowest new infra; honours locked decisions #1/#3; reuses union-merge block, slop overrides, manifest mirror exemptions, inline-jq close-step idiom. All three lenses' recommendation. |
| **Premortem mitigations** (lens-3 A's `schemaVersion`, `foldFrom(paths[])`, tolerant reader, copy-only harvest, dogfood-first P5) | **MERGED** | Additive — layered onto the convergent base, not a separate approach. These are the load-bearing scar-compliant defenses (drift, growth, bricking class). |
| **Counter bus as `kind:"counter"` events** (lens-2 A) | **KEPT** | Resolves the #58 side-car-file divergence in favour of event-sourcing so the fold-invariant is checkable. |
| **Single combined `telemetry.jsonl`** (lens-1 B / lens-3 B) | **REJECTED** | Violates locked decision #1 ("one file per purpose"); concentrates blast radius (one bad line wedges every reader); weakens the rules.md→file affordance; complicates per-purpose rollup/selective harvest. Documented road-not-taken; reopen only to minimise gitattributes/exemption surface. |
| **Thick `bkit telemetry append` CLI writer** (lens-1 C) | **REJECTED** | Introduces a hard runtime dependency on the built CLI in the workflow hot path (a build/resolution failure turns best-effort logging into a hard stop); diverges from the working self-contained shell+jq convention; flag-vs-stdin schema becomes a new compatibility surface. |
| **Separate per-file types, no shared envelope; `counters.json` side-car** (lens-2 B) | **REJECTED** | Contradicts locked decision #1 (combine, don't separate); the side-car breaks the #58 fold-invariant under mid-loop failure; cross-cutting #183 joins lose any structural correlation guarantee. |
| **JSON Schema registry + versioned migrations** (lens-2 C) | **REJECTED** | Over-engineered for single-team agent-local telemetry; per-append validation latency in the counter hot path; a registry JSON file is a merge-contention split-brain (`merge=union` doesn't apply); the migration tool would be the most complex piece in the stack. TS discriminated-union-as-schema + Vitest is far cheaper. |
| **Engine-managed P5 migration on `bkit upgrade`** (lens-3 C, surfaced to argue against) | **REJECTED** | A tolerance-heavy parser auto-running across consumer repos on upgrade is the pinnedCommit bricking class; consumer-facing failures with no bkit-side telemetry. Replaced by the opt-in dry-run CLI (see Decisions). |

## Trade-offs Accepted

**For per-purpose files + inline-jq writers (the kept approach):**

- **Gain:** lowest-risk reuse of a production-proven pattern; isolated blast radius per file; per-purpose pruning/selective harvest; self-contained best-effort writes with no CLI dependency in the hot path; clean rules.md→file mapping; additive P5.
- **Sacrifice vs single-file (B):** more wiring points — four (later six) `.gitattributes` lines, slop entries, Vale blocks, and more close-step jq blocks across 5 workflows. Bounded, mechanical, copy-of-existing-pattern.
- **Sacrifice vs thick CLI (C):** the inline jq must be kept in lockstep with the TS reducer (the known `status.jsonl` drift hazard). Mitigated by TS-is-canonical + a parity test, exactly as today.

**For counters-as-events (vs side-car state):**

- **Gain:** fold-invariant is checkable; recurrence/interval-between-retries free; no sync problem under mid-loop failure.
- **Sacrifice:** reconstructing a current counter value is a fold over rows, not a flat key read. Irrelevant at bkit run lengths (counters fire only at attempt boundaries, never tight inner loops).

**For copy-only harvest (vs truncate-source):**

- **Gain:** a harvest bug is structurally non-destructive to consumer data; pre-empts the consumer-bricking class on the read side.
- **Sacrifice:** the bkit-side store accumulates duplicates across harvest runs that the per-`kind` composite dedupe must absorb; bkit doesn't "clean up" the consumer's growing logs (the consumer owns retention).

**For opt-in dry-run P5 migration (vs engine auto-migrate):**

- **Gain:** the highest-blast-radius step never auto-touches consumer repos; dogfood-first + tarball-validated.
- **Sacrifice:** consumers must deliberately run the migration; the `.md` and `.jsonl` coexist during the clean-break transition (more surface, but no destructive cutover).

**For ms `ts` ids (vs ISO `at`):**

- **Gain:** elapsed-time/intervals for free; no same-second collisions.
- **Sacrifice:** an intentional divergence from `status.jsonl`'s ISO `at` — the reducer and any shared tooling must handle both timestamp shapes, and the two schemas must be documented separately to avoid confusion.

## Risks & Open Questions

### Risks (cross-approach, carry into plan)

- **`merge=union` blanket-glob footgun.** Under NO circumstance may union be `.bkit/*.jsonl` (the existing `.gitattributes` comment forbids it — union corrupts a consumer's non-append-only `.jsonl`). Each file gets an explicit scoped line; P5 files get their own. Validate the rendered `.gitattributes` with the real attribute resolver, not string-presence.
- **`ts`-ms collision under union.** Same-ms same-key rows both survive at git level; correctness depends entirely on the reducer's per-`kind` `identity()`. Pin every `kind`'s identity tuple with a unit test (clone `bkit-status.test.ts`).
- **Inline-jq ↔ TS reducer drift.** The known `status.jsonl` hazard, now multiplied across more files/blocks. Mitigation: TS canonical + a parity test asserting a jq-written row parses identically; treat the jq filter as generated-from-spec, reviewed against the reducer.
- **Free-text + pre-P3 counts are LLM-authored.** Only typed fields (post-P3 counters) are deterministic; `description`/`root_cause` and pre-P3 attempt counts are model self-report. Analysis must label trust accordingly and not present attempt-rate as trustworthy before P3.
- **P3 control-flow blast radius.** The counter refactor rewrites loop/escalation control-flow across all 5 workflows; a bad `check_max`/`decide_next` could wedge a run. Staged (build→debug→plan/design) + the `status.jsonl` invariant check as canary + fail-open degradation.
- **#183 regression-attribution requires `graderVersion` + `bkitVersion` on every relevant row** — missing either makes "regression appeared at release X" unanswerable after the fact (rows immutable). Stamp from P1/P2.
- **Unbounded growth.** `stats.jsonl` grows fastest (every workflow×step). Rollup/archive is deferred to P4 but `foldFrom(paths[])` must ship in P1 or the later archive migration breaks every reader.
- **P5 install↔dogfood divergence.** The migration CLI must be exercised on bkit's own repo AND via a packed tarball in a clean consumer dir — `bkit check` != live migration (the scar that bricked the repo). `aliases` resolution for ~1,460 refs must be a generated committed lookup table, not a runtime re-parse.
- **Half-written tail line during harvest.** Harvest may read a consumer mid-workflow; the tolerant reader must skip/count an unparseable trailing line, never throw.
- **Authoring-constraint regressions.** Edit only canonical `.bkit/`/`.agents/`/root config (never `.claude/*`/`.cursor/*`); keep the four data files out of the manifest; ASCII operators (`!=` `>=` `<=`) in workflow/prompt files; no Linear/KN-/BAR- refs in consumer-facing advisory text shipped by bkit.

### Open Questions (for plan/design-organise to resolve)

- **Per-phase grader rollout:** run `bkit comply` in all 5 close gates from P2, or ship-only first then expand? (#232 left this open; smallest-first leans ship-only.)
- **Rule table location:** extend `bkit-tiers.ts` vs a new `bkit-paths-policy.ts` for the shared protected-path table — which is the cleaner single source for both grader and the install-time `gateguard.cjs` generation?
- **Migration CLI verb naming/surface:** is the migration a sub-verb of a new `telemetry` verb (`bkit telemetry migrate`), and do harvest/analysis share that verb namespace, or are they separate top-level verbs? (Affects `Verb` union + usage.)
- **Friction/knowledge logical-key definition:** explicit written-once `key` field vs derived `category+scope+description-hash` for the instinct-loop fold — which is more robust to LLM-authored variance in the free-text fields?
- **Legacy `.md` ledger fate post-migration:** keep `friction.md`/`pending.md` as read-only history indefinitely, or fold their content into the `.jsonl` at migration time and retire the files?
- **#183 GitHub-API backfill scope:** how far back, and how is the hand-written-baseline provenance (non-`claude/` branches) reliably distinguished for the regression's provenance signal?
- **Rollup retention policy:** what `MAX_*`-style threshold triggers rollup to `.bkit/archive/{file}.{YYYYMM}.jsonl`, and is archive committed or git-ignored?

### Assumptions

- Single-clone serialisation + no-concurrent-workflows is already enforced (MEMORY + locked decision #6); telemetry does not add locking.
- `status.jsonl`'s inline-jq close-step idiom and `bkit-status.ts` reducer are stable and templatable.
- GateGuard (`7732d69`) and config-protection are the canonical advisory/fail-open precedent and remain shipped.
