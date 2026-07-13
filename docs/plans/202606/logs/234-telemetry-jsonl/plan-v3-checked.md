Verdict: CONCERNS

<!-- verdict:end -->

<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). `{YYYYMM}` = creation month, set once at design start. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# bkit Unified `.jsonl` Telemetry System Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual `plan.md` file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

## Context & Goals

bkit currently scatters its telemetry across markdown ledgers (`.bkit/friction.md`, `docs/pending.md`, `docs/knowledge.md`, `docs/decisions.md`) plus a per-FID `status.jsonl` event log. The `.md` ledgers conflict on merge, are painful to aggregate, and carry the recurring EOF-append-ordering footgun. There is no compliance-grading signal, no failures ledger, no deterministic workflow counters, and no cross-repo harvest/analysis.

This plan implements issue #234 — a single telemetry machine consolidating #232 (compliance grader), #183 (size↔outcome analysis), #233 (friction harvest), and #58 (workflow counters). It generalises the already-shipped per-FID `status.jsonl` machine into a family of append-only NDJSON ledgers governed by ONE canonical TypeScript codec (`bkit-telemetry.ts`), written by inline-jq close steps that mirror the codec, and read by deterministic downstream scripts (grader, counter invariant, harvest, analysis, ship-chain rollup).

The work is decomposed into five workstreams that map 1:1 onto the design's locked P1–P5 phasing. This plan covers ALL FIVE workstreams in dependency order. WS-1 is the root substrate; WS-2/WS-3/WS-5 each depend only on WS-1; WS-4 depends on WS-1+WS-2+WS-3. **This is a bkit-repo (self-hosting tooling) feature — there is NO application database, no API routes, no UI, and no Supabase/RLS surface.** Template sections that assume a gether-style app stack are marked N/A with justification.

**Success Criteria:**

- Every workflow close step appends well-formed telemetry rows to the relevant `.jsonl` ledger; rows fold to current state via ONE canonical TypeScript reducer pinned by unit test, and a parity test proves an inline-jq-written row parses identically under that reducer.
- The compliance grader runs deterministic + advisory (never-gating, fail-open) over `git diff parentSha..HEAD`, surfaces violations in `ship-summary.md`, and never blocks a run because telemetry/grading failed.
- After the #58 refactor no `*_ATTEMPT` counter or `MAX_*` comparison lives in orchestrator prose (only fenced shell), all `MAX_*` live in one config, exceeding `MAX_*` cannot silently continue, and a `status.jsonl` invariant check confirms counter rows equal the count of the steps they count.
- The harvest CLI copies (never moves/truncates/writes) consumer `.bkit/*.jsonl`, deduplicates by per-`kind` composite identity, and the analysis CLI reports counts/rates/elapsed-time + the #183 size↔outcome regression — without ever mutating a consumer's files.
- The data files stay OUT of the manifest, each carries its own explicit scoped `merge=union` line (never a blanket `*.jsonl` glob), is exempt from install/mirror + slop-scan, and is committed at close with `[skip ci]`; legacy `KN-`/`DE-` refs resolve via `aliases[]` with no mass retrofit.

**Related Issues:**

- None _(related-issues scan returned `None.`; the four consolidated issues #232/#183/#233/#58 are closed-as-duplicate into #234 and are scope-input, not separate trackers; #230 is closed)._

**Required workstream dependency order (surfaced per Workstream contract):**

```
WS-1 (P1) ──┬──> WS-2 (P2) ──────────┐
            ├──> WS-3 (P3) ──────────┼──> WS-4 (P4)
            └──> WS-5 (P5)           │
                  ▲                   │
WS-2 ─(WS2-T1 CLI decision)─┴─────────┘
```

- **WS-1** (substrate) has no prerequisites and MUST land first — every other workstream reads/writes its codec, identity tuples, and exemption surface.
- **WS-2** (grader), **WS-3** (counters), **WS-5** (migration) each `Requires: [WS-1]` and may proceed in parallel once WS-1 ships — EXCEPT that WS-5's CLI plumbing (and WS-4's) is additionally gated on WS-2's WS2-T1 entrypoint/namespace decision (the shared `bkit-cli.ts` dispatch/parse architecture). WS-5 therefore `Requires: [WS-1, WS-2 (scoped: WS2-T1)]`.
- **WS-4** (harvest+analysis) `Requires: [WS-1, WS-2, WS-3]` — it is only meaningful once compliance rows (WS-2) and trustworthy `shell-bus` counters (WS-3) exist; its analysis CLI consumes WS-2's `kind:"compliance"` rows for per-rule compliance-rate analysis (the artefact behind the WS-2 edge).

> [!IMPORTANT]
> **Sequencing constraints carried from design + scope-input:**
>
> 1. **#230 GateGuard / config-protection WIP** is already shipped (`7732d69`) — the grader (WS-2) mirrors its deterministic-advisory / fail-open precedent and shares the protected-path table. No uncommitted blocker remains.
> 2. **`dev`-local `refactor(debug): mode-matched attempt counters` overlaps WS-3 (#58/P3 counter refactor).** Before WS-3 starts, RECONCILE: re-read the live `bkit-debug.md` / `bkit-build.md` attempt-counter prose against that `dev` change so the prose→shell migration does not regress or fork the mode-matched-counter work. See WS-3 pre-flight task.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You do NOT need to read the rest of this plan.** Focus here. The agent handles the rest.

### Spec — what good looks like _(canonical; both design and plan phases follow this)_

> [!IMPORTANT]
> Subagents (design synthesise, design summary, plan generate, plan review, plan summary) MUST follow this spec. No subagent restates these rules; this section is the single source of truth.

- **Narrative:** 1–2 sentences, user POV. Describes what the user does and gets back.
- **Success Criteria:** ≤5 bullets, each measurable / testable. Outcomes, NOT implementation steps.
- **Key Edge Cases _(inherited from design)_:** Design-shaping only.
- **Edge Cases _(plan phase)_:** Inherits design Key Edge Cases verbatim + plan-level cases.
- **Concrete Example _(plan phase only)_:** Specific user role + starting state + numbered steps + observable outcome.
- **Derived Test Matrix _(plan phase only)_:** One row per testable behaviour → exactly one runbook task.

### Narrative _(inherited from design — do not rewrite)_

As a bkit maintainer, I run a workflow (design/plan/build/debug/ship) and at its close it appends machine-readable telemetry rows to `.bkit/*.jsonl` / `docs/*.jsonl` — compliance grades, run outcomes, deterministic attempt/failure counts, friction, deferrals, and discovered bugs — without me writing prose ledgers by hand. At ship, the summary step shows me an aggregate rollup of the whole design→plan→build→debug→ship chain (counts, rates, elapsed times, compliance violations) read straight from those logs. Later, I run a harvest CLI that copies the same telemetry from my consumer repos on this machine and an analysis CLI tells me where compliance is regressing and whether change size predicts PR error rate — all without ever mutating a consumer's files.

### Success Criteria _(inherited from design — do not rewrite)_

1. Every workflow close step appends well-formed telemetry rows to the relevant `.jsonl` ledger; rows are folded to current state by ONE canonical TypeScript reducer whose semantics a unit test pins, and a parity test proves an inline-jq-written row parses identically under that reducer.
2. The compliance grader runs as a deterministic, advisory (never-gating, fail-open) step over `git diff parentSha..HEAD` + files, surfaces violations in `ship-summary.md`, and emits one compliance row per run×rule — and the same run never blocks because telemetry/grading failed.
3. After the #58 refactor, no `*_ATTEMPT` counter or `MAX_*` comparison lives in orchestrator prose (only in fenced shell), all `MAX_*` thresholds live in one config, exceeding a `MAX_*` cannot silently continue, and a `status.jsonl` invariant check confirms counter rows equal the count of the steps they count.
4. The harvest CLI copies (never moves/truncates/writes) consumer `.bkit/*.jsonl`, deduplicates by a per-`kind` composite identity, and a harvest bug cannot destroy or alter consumer data; the analysis CLI reports counts/rates/elapsed-time and the #183 size↔outcome regression with a dispatch-size threshold.
5. The data files stay OUT of the manifest (git-tracked runtime content), each has its own explicit scoped `merge=union` line (never a blanket `*.jsonl` glob), is exempt from install/mirror + slop-scan (no Vale exemption needed — `lint:prose` never scans `.jsonl`), and is committed at close with `[skip ci]`; legacy `KN-`/`DE-` references resolve via `aliases[]` with no mass retrofit of the ~1,460 existing references.

### Concrete Example _(plan expands from design)_

**Setup:** A bkit maintainer on the bkit repo itself, post WS-1+WS-2 ship, with `dist/` built. A `bkit-ship` run is closing on a feature branch whose `parentSha` is the design-start commit.

**Steps:**

1. The maintainer reaches the ship close gate → the workflow runs `pnpm bkit comply --phase ship || echo "[bkit-comply] grader unavailable, skipping"` → the grader diffs `parentSha..HEAD`, finds a `.claude/*` mirror edit, and appends one `kind:"compliance"` row per rule to `.bkit/stats.jsonl`.
2. The same close gate appends a `kind:"run-outcome"` row (lines_added/lines_deleted/lines_changed/files_changed/task_count/duration_seconds/deferrals/failures) and final `kind:"counter"` summary rows via `jq -nc '… | .ts = (now*1000|floor)' >> "$FILE" || echo "[bkit-telemetry] append failed: $FILE"`. (The `ci_try_success`/`corrective_commits`/`review_iterations` fields are backfilled by WS-4 analysis via the GitHub API.)
3. The ship-summary step folds `.bkit/stats.jsonl` (hot + archive via `foldFrom`), reports the chain rollup (counts/rates/elapsed/compliance violations) into `ship-summary.md`, and flags `malformedLineCount` + any unknown-`schemaVersion` exclusions + a `MAX_ROWS_BEFORE_ROLLUP` growth warning if exceeded.
4. The maintainer later runs `bkit harvest` (or the harvest verb) → it reads consumer worktrees, COPIES each consumer's `.bkit/{stats,friction}.jsonl`, COUNT-ONLY-aggregates `docs/{deferrals,failures}.jsonl`, dedupes by per-`kind` composite identity, and never writes to any consumer repo.
5. The maintainer runs `bkit analysis` → it folds the harvested rows and reports the #183 size↔outcome regression with a dispatch-size threshold, labelling pre-P3 counters `model-self-report` (untrusted) vs post-P3 `shell-bus` (trusted) via `counterSource`.

**Outcome:** Telemetry rows exist in the right ledgers, the workflow completed even though the grader found a violation (advisory, never gated), the maintainer sees a folded chain rollup and a cross-repo analysis, and no consumer file was ever mutated.

### Edge Cases _(plan expands from design's Key Edge Cases)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `merge=union` interleaves/duplicates appended lines; two branches write the same ms `ts` for the same logical key | Fold reducer dedupes by per-`kind` COMPOSITE identity (not bare `ts`), mirroring `bkit-status.ts`'s tuple dedupe; both git-level rows collapse to one |
| Someone proposes `.bkit/*.jsonl merge=union` (blanket glob) | FORBIDDEN — each file gets one explicit scoped line; validated via `git check-attr merge` (real resolver), asserting blanket glob does NOT match |
| Malformed / truncated trailing line during read or harvest | Tolerant `parse` wraps each line in try/catch, skips + counts it via `malformedLineCount`, NEVER throws (NEW behaviour — `parseStatus` throws); pinned by truncated-line fixture test |
| Telemetry append fails (disk, jq error) at close step | Best-effort idiom `… >> "$FILE" \ | \ | echo "[bkit-telemetry] append failed: $FILE"` guarantees exit 0; workflow continues |
| Grader missing / `dist/` stale / grader throws at close gate | Fail-open idiom `pnpm bkit comply --phase {p} \ | \ | echo "[bkit-comply] grader unavailable, skipping"` guarantees exit 0; advisory step never becomes a hard gate |
| `date +%s%3N` on a BSD/macOS dev shell | NOT USED — ms `ts` emitted via portable `jq '… \ | .ts = (now*1000\ | floor)'`; pinned + parity-tested |
| Reader meets a row with unknown (greater) `schemaVersion` | Warn `[bkit-telemetry] unknown schemaVersion N, excluding row` and EXCLUDE from rate/aggregate calcs (warn-and-exclude, never silently mis-bucket); fold surfaces excluded count |
| Pre-P3 counter rows present alongside post-P3 rows | `counterSource:"model-self-report"` vs `"shell-bus"` makes trust tier structurally distinguishable; analysis filters/labels without inferring P3 ship date |
| `*_ATTEMPT`/`MAX_*` config exceeded after WS-3 | `decide_next`/`check_max` cannot silently continue past `MAX_*`; invariant check confirms counter rows == counted-step rows |
| LLM rewords a friction/deferral/failure description | Logical key = explicit written-once `key` slug, NOT a free-text hash; a reword does NOT fork the key; recurrence collapses to same identity |
| `stats.jsonl` grows past threshold (~5,000 rows) before P4 rollup ships | P1 ship-summary emits a grep-able `[bkit-telemetry]` `MAX_ROWS_BEFORE_ROLLUP` WARNING; `foldFrom` already reads the pinned archive shard path so the later P4 rollup cannot break readers |
| P5 consumer migration deletes `.md` history | Migration ports to `.jsonl`, verifies row-count parity against a transient `.md.bak`, deletes `.md` ONLY after parity confirmed (idempotent); dogfood bkit's repo first + packed-tarball-validate |
| Concurrent workflows on one clone | Out of scope — single-clone serialisation already enforced; telemetry adds append-only best-effort writes, assumes no locking |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task. All tests are Vitest unit/integration in `.bkit/src/` or bats shell tests in `scripts/`; this repo has NO Playwright/E2E surface. Rows marked **boundary** cross an external boundary (git / filesystem / consumer repo / GitHub API) and require a non-mock test naming the boundary + ground-truth signal.

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `fold` collapses same-`kind` composite-identity duplicates to current state, per `kind` | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| `identity(event)` returns the correct composite tuple for each `kind` (compliance/counter/run-outcome/friction/deferral/failure) | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| `validate(event)` rejects malformed rows AND unknown `kind` before write, AND rejects any row missing an A2-mandatory envelope field (`ts`/`kind`/`repo`/`bkitVersion`/`schemaVersion`/`step`) | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| `run-outcome` row shape: a close-gate-shaped `run-outcome` event (lines_added/lines_deleted/lines_changed/files_changed/task_count/duration_seconds/ci_try_success/deferrals/failures) `validate`s, folds by `(repo, prNumber)`, and parses identically when written via the inline-jq close-step idiom (parity) | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| Two same-`ts` same-key inline-jq rows (identical `now*1000\ | floor` `ts`, identical key), concatenated as `merge=union` would produce, fold to ONE row via the per-`kind` COMPOSITE identity — and the composite tuple differs from bare `ts` so dedup is proven the composite path, not accidental `ts`-equality | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| Inline-jq parity: a `jq -nc '… \ | .ts=(now*1000\ | floor)'` row parses identically under `parse` | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| Tolerant `parse` skips + counts a malformed line via `malformedLineCount`, never throws — for BOTH a truncated trailing line AND a malformed line in the MIDDLE of the file (harvest reads whole consumer files, not only live tails) | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| `foldFrom(paths[])` reads a synthetic archive shard at `.bkit/archive/{basename}.{YYYYMM}.jsonl` + hot file | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| Rollup WRITER (WS-4) produces a shard at `ARCHIVE_SHARD_TEMPLATE` that `foldFrom` reads back with row count preserved (writer↔reader round-trip, distinct from the synthetic-shard reader test) | Unit (Vitest) | `.bkit/src/bkit-analysis.test.ts` |
| Reader warn-and-EXCLUDES a row with unknown (greater) `schemaVersion`; surfaces excluded count | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| `.gitattributes` resolves `merge=union` for each scoped data-file path (lines placed BELOW `# <!-- bkit:end -->`, outside the managed block) AND does NOT blanket-match an arbitrary `.bkit/foo.jsonl` NOR an arbitrary `docs/foo.jsonl` (symmetric blanket-glob absence — `docs/` files carry `merge=union` too per A1) | Integration **boundary: git check-attr** (Vitest/bats) | `.bkit/src/bkit-telemetry-gitattributes.integration.test.ts` |
| Each data file is absent from the install manifest (`format` entries) | Unit (Vitest) | `.bkit/src/bkit-manifest.test.ts` (extend) |
| Per-workflow summary read surfaces all three signals: `malformedLineCount`, unknown-`schemaVersion` exclusion count, and a grep-able `[bkit-telemetry]` `MAX_ROWS_BEFORE_ROLLUP` WARNING line when `rowCount > MAX_ROWS_BEFORE_ROLLUP` | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| Every workflow close-step append block sets ALL A2-mandatory envelope fields (`ts`/`kind`/`repo`/`bkitVersion`/`schemaVersion`/`step`) — grep over all 5 `bkit-*.md` workflow files finds NO append block omitting any A2 field (machine-verifiable, not agent-grep) | Integration (Vitest grep over workflow files) | `.bkit/src/bkit-telemetry-workflow-writers.test.ts` |
| Best-effort append + fail-open idioms guarantee exit 0: forcing the telemetry-append failure path (` |  | echo "[bkit-telemetry] append failed"`) AND the grader-unavailable path (` |  | echo "[bkit-comply] grader unavailable"`) each leaves shell exit 0 (locked SC #2/#4) | Unit (bats) **boundary: shell exit codes** | `scripts/tooling/telemetry-failopen.bats` |
| Compliance grader pure fn `(parentSha, phase, planPath) -> Violation[]` flags `no-mirror-edit` + `skip-ci-not-head` deterministically | Unit (Vitest) | `.bkit/src/bkit-comply.test.ts` |
| Grader emits one `kind:"compliance"` row per run×rule with `graderVersion` + `bkitVersion` | Unit (Vitest) | `.bkit/src/bkit-comply.test.ts` |
| Grader run over a REAL `git diff parentSha..HEAD` in a temp git repo flags an injected mirror edit | Integration **boundary: git diff** (Vitest) | `.bkit/src/bkit-comply.integration.test.ts` |
| `gate-paths.generated.cjs` drift test FAILS if the committed generated file diverges from the TS path-policy table | Unit (Vitest) | `.bkit/src/bkit-paths-policy.test.ts` |
| `comply` verb parses `--phase` + dispatches; unknown sub-verb/flag exits cleanly | Unit (Vitest) | `.bkit/src/bkit-cli.test.ts` (extend) |
| Close-gate wiring audit: EVERY wired close gate carries the fail-open `pnpm bkit comply --phase {p} \ | \ | echo "[bkit-comply] grader unavailable, skipping"` guard, and NO invocation sits on its own line under a bare `set -e` block that would defeat the `\ | \ | echo` (grep over workflow files) | Integration (Vitest grep over workflow files) | `.bkit/src/bkit-comply-gate-wiring.test.ts` |
| Shell counter bus generic helpers `counter_init/inc/get/reset/check_max` + `decide_next` exit codes/branch routing | Unit (bats) | `scripts/tooling/counter-bus.bats` |
| Per-mode mode-matched counters (DEBUG/NORMAL/SOAK, `bkit-debug.md:47`): each mode's distinct reset semantics (e.g. SOAK reset-to-0 on entry, DEBUG cross-invocation index) AND overflow-routing match the prose; a wrong per-mode branch is caught | Unit (bats) | `scripts/tooling/counter-bus.bats` |
| `status.jsonl`/`stats.jsonl` fold-invariant: `counters.verifyAttempt` == count of `plan-verify` rows | Integration (Vitest) | `.bkit/src/bkit-telemetry-invariant.test.ts` |
| No `*_ATTEMPT`/`MAX_*` comparison in orchestrator prose (only fenced shell); all `MAX_*` in one config | Integration (Vitest grep over workflow files) | `.bkit/src/bkit-counter-prose-audit.test.ts` |
| Harvest COPIES consumer `.bkit/*.jsonl` and NEVER writes/truncates the consumer repo (consumer file mtime + content unchanged) | Integration **boundary: filesystem/consumer repo** (Vitest) | `.bkit/src/bkit-harvest.integration.test.ts` |
| Harvest dedupes by per-`kind` composite `(ts, repo, …)` across repeat runs; tolerant `parse` skips half-written tail | Unit (Vitest) | `.bkit/src/bkit-harvest.test.ts` |
| Analysis CLI computes #183 size↔outcome regression + dispatch-size threshold over `run-outcome` rows; labels `counterSource` trust tier | Unit (Vitest) | `.bkit/src/bkit-analysis.test.ts` |
| Analysis CLI computes per-rule compliance rate over `kind:"compliance"` rows (the artefact behind the declared WS-2→WS-4 edge) | Unit (Vitest) | `.bkit/src/bkit-analysis.test.ts` |
| Migration parses bkit's REAL `knowledge.md`/`decisions.md` corpus → `.jsonl` with `aliases[]`; row-count parity before `.md` delete | Integration **boundary: filesystem + real corpus** (Vitest) | `.bkit/src/bkit-telemetry-migrate.integration.test.ts` |
| Migration validated via packed tarball in a clean consumer dir (`pnpm pack` → fresh install → run) | Integration **boundary: packed tarball install** (Vitest) | `.bkit/src/bkit-telemetry-migrate.integration.test.ts` |
| Migrate destructive-abort safety + idempotency: a forced parity-mismatch fixture ABORTS with ZERO `.md` deleted, an absent-`.md.bak` fixture ABORTS with ZERO `.md` deleted, AND re-running migrate is a no-op (idempotent) | Integration **boundary: filesystem/consumer repo** (Vitest) | `.bkit/src/bkit-telemetry-migrate.integration.test.ts` |
| KN-8 regression guard: `bkit upgrade` over a fixture consumer holding `.md` ledgers leaves ALL `.md` byte-identical + mtime-unchanged AND no `upgrade` code path reaches the migrate-delete fn (only an explicit `bkit telemetry migrate` deletes `.md`, post-parity) | Integration **boundary: filesystem/consumer repo** (Vitest) | `.bkit/src/bkit-telemetry-migrate.integration.test.ts` |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below. This is the only other section requiring your attention.

> [!WARNING]
> **Destructive ledger cutover (multi-phase).** This plan retires four markdown ledgers in favour of `.jsonl`:
>
> - **WS-1:** `.bkit/friction.md` → `.bkit/friction.jsonl`; `docs/pending.md` → `docs/deferrals.jsonl`; NEW `docs/failures.jsonl`.
> - **WS-5:** `docs/knowledge.md` → `docs/knowledge.jsonl`; `docs/decisions.md` → `docs/decisions.jsonl`.
>
> Per addendum **A5**, the P5 (WS-5) migration script is **destructive** — it ports history to `.jsonl` and **DELETES the `.md`** after row-count parity is verified (transient `.md.bak`). This SUPERSEDES the design body's "opt-in, dry-run-by-default, never deletes". WS-1's friction/pending cutover may start fresh (history optionally ported); WS-5's knowledge/decisions migration MUST run as part of rollout because agents stop reading `.md` once code reads `.jsonl`.

> [!IMPORTANT]
> **File placement (addendum A1 — SUPERSEDES the body's "four files under `.bkit/`"):**
>
> | File              | Location       | Replaces            | Harvest    |
> | ----------------- | -------------- | ------------------- | ---------- |
> | `stats.jsonl`     | `.bkit/`       | — (new)             | copy       |
> | `friction.jsonl`  | `.bkit/`       | `.bkit/friction.md` | copy       |
> | `deferrals.jsonl` | **`docs/`**    | `docs/pending.md`   | count-only |
> | `failures.jsonl`  | **`docs/`**    | — (new)             | count-only |
> | `knowledge.jsonl` | `docs/` (WS-5) | `docs/knowledge.md` | n/a        |
> | `decisions.jsonl` | `docs/` (WS-5) | `docs/decisions.md` | n/a        |

**Proposed new names:**

- **Source modules:** `.bkit/src/bkit-telemetry.ts` (+ `.test.ts`), `.bkit/src/bkit-comply.ts` (+ `.test.ts`, `.integration.test.ts`), `.bkit/src/bkit-paths-policy.ts` (+ `.test.ts`) — OPEN QUESTION resolved in WS-2: new `bkit-paths-policy.ts` vs extending `bkit-tiers.ts` (recommend new file; see WS-2).
- **Generated committed file:** `.claude/hooks/gate-paths.generated.cjs` (or equiv) + drift test.
- **CLI verbs (net-new dispatch+parse plumbing on a CLI that today hard-codes 5 install verbs with no sub-verb parser):** `comply` (WS-2), `harvest` + `analysis` (WS-4), `telemetry migrate` (WS-5). **OPEN QUESTION:** verb namespace (top-level `harvest`/`analysis` vs `telemetry harvest`/`telemetry analysis` sub-verbs) AND entrypoint (`dist/bkit-install.js` shared binary vs SEPARATE entrypoint so a grader/harvest crash never touches the consumer-mutating install path). MUST be resolved in WS-2 plan-review before the first read/grade verb ships.
- **Schema/catalog home (addendum A6):** machine schema = `bkit-telemetry.ts` types + `validate()`; agent-readable catalog = NEW shipped `docs/telemetry.md` (`bkit:start/end`, indexed in `.agents/docs.md`); behavioral rules = `rules.md` block.
- **Constants:** `ARCHIVE_SHARD_TEMPLATE` (`.bkit/archive/{basename}.{YYYYMM}.jsonl`), `MAX_ROWS_BEFORE_ROLLUP` (initial proposed ~5,000 — confirm in WS-1).

**Breaking changes:** All are bkit-internal/tooling — NO consumer-facing API/DB/route changes. The `.md`→`.jsonl` cutover changes where agents read/write telemetry; consumer impact is mediated by the install/upgrade engine + the WS-5 migration script. `merge=union` + slop exemptions now span `.bkit/` AND `docs/`.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

**Rejected (from design — documented road-not-taken):**

- **Single combined `telemetry.jsonl`** — REJECTED: violates locked decision #1 (one file per purpose); concentrates blast radius (one bad writer wedges every reader); weakens the rules.md→file affordance.
- **Thick `bkit telemetry append` CLI writer** — REJECTED: introduces a hard runtime dependency on the built CLI in the workflow hot path (build/resolution failure turns best-effort logging into a hard stop). Inline-jq writers + TS-canonical + parity test is the kept approach.
- **`counters.json` side-car state file** (#58 original) — REJECTED: breaks the fold-invariant under mid-loop failure. Counters are `kind:"counter"` events.
- **Install-time codegen into `gateguard.cjs`** — REJECTED: no such precedent (`gateguard.cjs` is byte-equal Tier-1 copy). Shared path table is a COMMITTED generated `.cjs` + drift test.
- **Engine auto-migration on `bkit upgrade`** — REJECTED for the destructive parser; superseded by addendum A5's controlled-rollout destructive script (dogfood-first + tarball-validated), NOT an auto-upgrade hook.
- **JSON Schema registry + versioned migrations** — REJECTED: over-engineered; TS discriminated-union-as-schema + Vitest is far cheaper.

**Recommendations / future phases:**

- Rollup-trigger VALUE (`MAX_ROWS_BEFORE_ROLLUP`) and committed-vs-gitignored archive remain OPEN (WS-4) — the path template + growth WARNING ship in WS-1 so the deferral is safe.
- #183 GitHub-API backfill scope (how far back; hand-written-baseline provenance) resolved in WS-4 plan.
- Per-phase grader rollout (all-5 close gates from P2 vs ship-only-first) resolved in WS-2 plan.
- **Design OQ "legacy `.md` ledger fate post-migration" is RESOLVED, not deferred:** addendum A5 + the Supersession Inventory close it — friction/pending are DELETE (WS-1; history optionally ported), knowledge/decisions are parity-gated destructive DELETE after migration (WS-5/A5). No separate resolve-task is needed; the Supersession rows + WS5-T2 are the resolution.

## Out of Scope

- Any application database, API route, UI component, Supabase migration, RLS policy, Zod validator, or Playwright E2E — this is a self-hosting tooling change to the bkit repo.
- Mass find-replace retrofit of the ~1,460 existing `KN-`/`DE-` references — resolved via `aliases[]` + a generated committed lookup table (WS-5).
- Offline `pass^k` grader fixture tier (explicitly out of scope per locked decision #6).
- Locking / concurrency control for telemetry writes — single-clone serialisation already enforced; writes stay append-only + best-effort.
- A human-facing telemetry renderer — consumption is agent-read (per-workflow summary + analysis CLI) only.
- Auto-wiring the WS-5 migration into the `bkit upgrade` hot path (deliberately NOT an upgrade hook).

## Merge Method

**Merge method: always squash.** Each workstream (or sub-phase, if a workstream is decomposed) ships as its own squash PR into `dev` via `gh pr merge --squash --delete-branch --body ""` (hardcoded in `bkit-ship.md` Step 5). Commit-boundary ordering across workstreams is preserved by SEPARATE PRs (WS-1 → then WS-2/WS-3/WS-5 in parallel → then WS-4), not by non-squash merges.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `.bkit/friction.md` | `.bkit/friction.jsonl` (`kind:"friction"`) | DELETE (WS-1; history optionally ported) | Markdown ledger → NDJSON; merge-union safe, aggregatable. `package.json` `files[]` already excludes `friction.md` from the package. |
| `docs/pending.md` | `docs/deferrals.jsonl` (`kind:"deferral"`) | DELETE (WS-1; ledger semantics preserved in `key`/`aliases`) | "Never silently drop work" ledger → NDJSON in `docs/` (repo work, count-only harvest per A1/A4). |
| `docs/knowledge.md` | `docs/knowledge.jsonl` (`kind:"knowledge"`) | DELETE (WS-5; destructive migration after parity, A5) | Migration MUST run as part of rollout — agents stop reading `.md` once code reads `.jsonl`. `KN-N` preserved in `aliases[]`. |
| `docs/decisions.md` | `docs/decisions.jsonl` (`kind:"decision"`) | DELETE (WS-5; destructive migration after parity, A5) | Same as knowledge; `DE-N` preserved in `aliases[]`. |
| `utility-harvest-friction` agent (prompt) — `.claude/agents/utility-harvest-friction.md` + `.cursor/agents/utility-harvest-friction.md` (project-managed, non-`bkit-`-prefix; NO `.bkit/prompts/` source) | `bkit harvest` CLI (WS-4, copy-only) | DELETE (WS-4) | Prompt → deterministic copy-only script; never truncates consumer repos. |
| `.bkit/templates/.bkit/friction.md` template + `docs/pending.md` template | Seeded-empty `.jsonl` templates (WS-1) | DELETE (WS-1) | Consumers inherit seeded `.jsonl`; `.md` versions stay readable-legacy only where they hold history. |
| Per-`.md`-file headers (friction categories, knowledge category enum) | Single shipped `docs/telemetry.md` catalog (A6) | DELETE (folded into one catalog) | One agent-readable catalog, not per-file headers; machine schema lives in `bkit-telemetry.ts`. |
| Inline prose `*_ATTEMPT` counters + `MAX_*` comparisons across 5 workflows | Shell counter bus + one `MAX_*` config (WS-3) | DELETE-from-prose (WS-3; reconcile with `dev` mode-matched-counter change first) | #58 prose→shell refactor; deterministic, fold-invariant-checkable. |

> [!CAUTION]
> **Default = `DELETE`.** Each `DELETE` row is mirrored in `Architecture & Component Changes` and as a removal task in the `Agent Execution Runbook`. The `.md` ledger DELETEs are staged (WS-1 friction/pending may start fresh; WS-5 knowledge/decisions are parity-gated destructive deletes) — this is a controlled-rollout migration with the migration script as the gate, NOT a `@deprecated`-and-still-exported anti-pattern.

## Security & Privacy

> Reference: `docs/security.md` § Security Checklist for New Features. This is a bkit-repo tooling change — most application-stack rows are N/A.

- [ ] **New API route** — N/A (no HTTP routes; CLI verbs are local-only).
- [ ] **New DB table/column** — N/A (no database).
- [ ] **Role-gated mutation** — N/A.
- [ ] **User input** — CLI arg parsing (`--phase`, harvest paths) is validated/narrowed in `bkit-cli.ts` (reject unknown verb/flag with clean exit), mirroring the existing `parseIssueTracker`/`parseCloudVariant` discipline. No Zod (bkit src has no validators package).
- [ ] **PII** — Telemetry rows carry repo/workflow/step/subagent metadata + LLM-authored free text (`description`/`root_cause`). NO secrets/tokens. **Harvest reads consumer repos READ-ONLY (copy-only); MUST NOT copy any `.env`/secret files — only the four named `.jsonl` ledgers.** Consumer-facing advisory text shipped by bkit MUST NOT cite `KN-`/`BAR-`/Linear refs (MEMORY rule).
- [ ] **Redirect URL** — N/A.
- [ ] **Webhook** — N/A.
- [ ] **New secret/env var** — None. #183 GitHub-API backfill (WS-4) reuses the existing `gh`/MCP auth surface; no new secret.

_Net: no new routes, DB writes, secrets, or untrusted-network input. Primary privacy concern = harvest must read consumer repos strictly read-only and copy ONLY the named ledgers._

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core (always verify)

- [ ] **Package Management:** Verify `package.json` — `picomatch` (dep), `vitest`/`tsx`/`typescript` (dev) present. No NEW runtime dependency expected (jq is a system tool; bats is dev-only). Ensure `pnpm-lock.yaml` syncs cleanly. If a bats harness is added, classify it dev-only (do NOT add to runtime deps — MEMORY: dogfood via tarball catches mis-classification).
- [ ] **Dependency Versions:** Spot-check `node --version` (>=20), `npx tsc --version`, `jq --version` (system; portable `now*1000|floor` avoids GNU-`date` dependency), `pnpm --version`. Flag outdated.
- [ ] **User Context:** Verify read/write access to `.bkit/src/`, `.bkit/workflows/`, `.bkit/templates/`, `.agents/`, root config (`.gitattributes`, `slop-scan.config.json`, `package.json`). Confirm consumer worktrees listed in `docs/bkit-consumers.md` are reachable for WS-4 harvest dogfood.
- [ ] **Pending Blockers:** Query tracker for open `blocker`-labelled issues relevant to telemetry. (`bkit.issueTracker: github`; `bkit.githubProject: false`.)
- [ ] **Project Context:** Read `docs/knowledge.md` + `docs/decisions.md` for relevant patterns/gotchas (status.jsonl reducer, gateguard advisory/fail-open precedent, install↔dogfood divergence, npmrc/pnpm var, slop per-file opt-out, ASCII operators in workflow files). **MANDATORY for WS-5:** read **KN-8** (`docs/knowledge.md:195` — bkit upgrade silently destroying consumer config, recovered only by `git revert`) + the `611b438` provenance-stamp-revert bricking class; the WS-5 destructive `.md` delete re-enters this exact pattern and is gated by WS5-T0/WS5-T2b.
- [ ] **Testing & Quality:** Align with `docs/testing.md`. Telemetry tests are Vitest unit/integration in `.bkit/src/`; counter-bus tests are bats; boundary tests (git diff, git check-attr, filesystem/consumer-repo, packed-tarball) run against ground truth, NOT mocks.
- [ ] **Prerequisite Plans:** None external. INTERNAL ordering: WS-1 fully shipped+verified BEFORE WS-2/WS-3/WS-5; WS-2+WS-3 shipped BEFORE WS-4.

### Conditional (verify only when applicable)

- [ ] **Secrets & Env Vars** — N/A (no new secrets; WS-4 GitHub-API backfill reuses existing `gh`/MCP auth).
- [ ] **Schema State** — N/A (no DB). The "schema" here is the TS discriminated union in `bkit-telemetry.ts` + `docs/telemetry.md` catalog.
- [ ] **Architecture & UI** — Validate against `docs/architecture.md` (bkit monorepo topology) + the canonical-source rule (edit `.bkit/`/`.agents/`/root config ONLY; `.claude/*`/`.cursor/*` mirrors are regenerated by the install engine, never hand-edited). No UI.
- [ ] **Observability** — Telemetry logs use the existing `[bkit-*]` grep-able convention (`[bkit-telemetry]`, `[bkit-comply]`, `[bkit-harvest]`) per `docs/observability.md`. Confirm these new log prefixes are documented.
- [ ] **Notifications** — N/A (no user-facing toasts).

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

### Data Schema Usage (Inputs & Outputs)

**None** — there is no application database. The "data model" is the append-only NDJSON ledger family governed by `bkit-telemetry.ts`. For completeness, the NDJSON contract:

**Shared envelope (every row, every file) — addendum A2 makes ALL of these mandatory on EVERY row, incl. count-only `deferrals`/`failures`:**

- `ts` (number, unix **milliseconds**, primary id + timestamp), `schemaVersion` (number, init `1`), `kind` (closed enum discriminator), `repo`, `bkitVersion`, `workflow?`, `step`, `subagent?`, `severity?`, `key?` (written-once logical slug for instinct-loop kinds), `references[]` (outbound links), `aliases[]` (this row's own former ids, e.g. `KN-14`/`DE-7`), `+ counterSource` on counters, `+ per-kind payload incl. prose` (`description`/`root_cause`).
- **Rationale (A2):** count-only harvest is dimensional — it slices counts by `repo`/`workflow`/`step`/`subagent`/`severity`, so these fields are load-bearing even where prose is never copied.

**Files → `kind` sets → fold/dedup identity:**

- `.bkit/stats.jsonl`: `compliance` keyed `(repo, workflow, parentSha, rule)`; `counter` keyed `(repo, workflow, parentSha, counterName)`; `run-outcome` keyed `(repo, prNumber)`.
- `.bkit/friction.jsonl`: `friction`, keyed by written-once `key`.
- `docs/deferrals.jsonl`: `deferral`, keyed by written-once `key`.
- `docs/failures.jsonl`: `failure`, keyed by written-once `key`.
- `docs/knowledge.jsonl` (WS-5): `knowledge`, keyed by written-once `key`; `KN-N` in `aliases[]`.
- `docs/decisions.jsonl` (WS-5): `decision`, keyed by written-once `key`; `DE-N` in `aliases[]`.

### Data Schema Changes

**None** to any database. NDJSON ledger changes are tracked above and in `Architecture & Component Changes`.

## Architecture & Component Changes

**CRITICAL:** All edits land in canonical `.bkit/`, `.agents/`, and root config; `.claude/*`/`.cursor/*` mirrors are regenerated by the install engine — NEVER hand-edited. Data files stay OUT of the manifest. ASCII operators (`!=` `>=` `<=`) only in workflow/prompt files.

### Database Migrations

**None** — no application database. (The `.md`→`.jsonl` ledger migration is a data-port script, covered under WS-1/WS-5, not a DB migration.)

### WS-1 — JSONL telemetry substrate (P1)

#### [NEW] `.bkit/src/bkit-telemetry.ts`

- ONE canonical codec/reducer cloned from the SHAPE of `.bkit/src/bkit-status.ts`. Exports: shared envelope type; per-`kind` discriminated-union payloads; `identity(event)` (per-`kind` composite tuple); `fold(events)`; `foldFrom(paths[])` (reads hot + archive shards); tolerant `parse(raw)`; `appendLine(event)`; `validate(event)`.
- **THREE load-bearing divergences from `bkit-status.ts` that are NEW behaviour (NOT inherited):** (a) tolerant `parse` = per-line try/catch + skip + `malformedLineCount` (`parseStatus` does a bare `JSON.parse(l)` and THROWS — see `bkit-status.ts:139`); (b) `validate` REJECTS unknown `kind` before write (`status.ts` has no reject path); (c) ms `ts` via `now*1000|floor`, NOT ISO `at`.
- Named exported constants: `ARCHIVE_SHARD_TEMPLATE` = `.bkit/archive/{basename}.{YYYYMM}.jsonl`; `MAX_ROWS_BEFORE_ROLLUP` (init proposed ~5,000). `schemaVersion` init `1`; bump ONLY on a breaking field change; reader warn-and-EXCLUDES unknown (greater) versions.

#### [NEW] `.bkit/src/bkit-telemetry.test.ts`

- Pins: fold/identity/validate per `kind`; inline-jq parity (`jq -nc '… | .ts=(now*1000|floor)'` row parses identically); truncated-line fixture skip+count; `foldFrom` against a synthetic archive shard at the pinned template; warn-and-exclude on unknown `schemaVersion`.

#### [NEW] `.bkit/src/bkit-telemetry-gitattributes.integration.test.ts`

- **Boundary: git `check-attr`.** Asserts each scoped data-file path resolves `merge=union` AND a non-listed `.bkit/foo.jsonl` does NOT (no blanket glob).

#### [NEW] data files (seeded empty)

- `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl`. Git-tracked runtime content, NOT manifest entries.

#### [MODIFY] `.gitattributes` (Existence Check: exists, lines 1–21)

- **BELOW the `# <!-- bkit:end -->` marker (NOT inside the managed `bkit:start/end` block)**, add FOUR explicit scoped `merge=union` lines (`.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl`) — NEVER a blanket `.bkit/*.jsonl` glob (the existing comment at lines 16–18 forbids it). **Rationale (Tier-2 bkit-repo rule — CLAUDE.md MEMORY "bkit-repo-only logic in Tier-2 files goes outside bkit:start/end markers"):** these four entries are bkit-repo-specific runtime ledgers, so they belong OUTSIDE the consumer-inherited managed block; the managed block is reserved for shipped/consumer-facing content. Keep `.bkit/friction.md` line until WS-1 retires it (it currently lives inside the managed block; the new entries go below `bkit:end`).

#### [MODIFY] `.bkit/templates/.gitattributes` (Existence Check: exists, identical block)

- The four data-file `merge=union` lines are bkit-repo-specific (bkit's own runtime ledgers), so they go BELOW `# <!-- bkit:end -->` in the root `.gitattributes` and are NOT mirrored into the consumer-inherited managed block of `.bkit/templates/.gitattributes`. (Consumer-inherited `.jsonl` exemptions — for files consumers actually ship — are added in WS-5's template-mirror task per the same below-`bkit:end` Tier-2 discipline only where the file is genuinely consumer-facing; the four WS-1 data files are bkit-repo-only and stay out of the template managed block.)

#### [MODIFY] `slop-scan.config.json` (Existence Check: exists)

- Add the four data-file paths to `ignores[]` (per-file opt-out, NEVER a blanket "skip `.jsonl`" — MEMORY rule). Mirror into the slop template if consumers ship one. **No `.vale.ini` block** — `lint:prose` (`package.json:50`) hands Vale an explicit `.md` find-list, so `.jsonl` is never scanned; a Vale scope block would be dead config.

#### [MODIFY] `.bkit/src/bkit-manifest.test.ts` (Existence Check: exists)

- Add an assertion that the four data files are ABSENT from manifest `format` entries (they are git-tracked content, not engine payload — exactly how `status.jsonl` + `.md` ledgers are handled).

#### [MODIFY] all 5 workflows — `.bkit/workflows/bkit-{design,plan,build,debug,ship}.md` (Existence Check: all exist)

- Add inline-jq close-step writers at EXISTING step boundaries using the pinned best-effort idiom and portable ms `ts` (mirroring the existing `jq -nc … >> "$STATUS"` blocks, e.g. `bkit-build.md:330–338`, but with `.ts = (now*1000|floor)` instead of `--arg t "$(date -u +%FT%TZ)"`):
  ```
  jq -nc '… | .ts = (now*1000|floor)' >> "$FILE" || echo "[bkit-telemetry] append failed: $FILE"
  ```
- EVERY emitted row stamps the A2-mandatory envelope (`repo`/`bkitVersion`/`schemaVersion`/`step` + `kind`). Pre-P3 counter rows stamp `counterSource:"model-self-report"`. The `bkit-ship.md` close gate ALSO emits one `kind:"run-outcome"` row keyed `(repo, prNumber)` carrying the git-derivable size fields (`lines_added`/`lines_deleted`/`lines_changed`/`files_changed`), plan signals (`task_count`, `duration_seconds`), and outcome counts (`deferrals`, `failures`) — the substrate the #183 regression reads (WS-1 owns the write; WS-4 backfills `ci_try_success`/`corrective_commits`/`review_iterations` via the GitHub API). Add a per-workflow summary read (count/size/fold-time) that also reports `malformedLineCount`, unknown-`schemaVersion` exclusions, and a `MAX_ROWS_BEFORE_ROLLUP` growth WARNING.
- **A7 sweep:** update workflow CAUTION headers (alongside the existing `Friction:` line, `bkit-ship.md:19`) with never-drop→`docs/deferrals.jsonl` + found-bug→`docs/failures.jsonl` lines; sweep every read/write of legacy ledgers to the `.jsonl` equivalents. Known sites: `bkit-ship` deferred-sweep (`docs/pending.md` → `docs/deferrals.jsonl`, `bkit-ship.md:467`), close-step friction sweep (`.bkit/friction.md` → `.bkit/friction.jsonl`, `bkit-ship.md:238,926`), `knowledge.md` gotcha-checks, `.agents/docs.md` index.

#### [NEW] `docs/telemetry.md` (addendum A6 — agent-readable catalog)

- `bkit:start/end` block carrying the old `.md` headers' Purpose / category enums (friction's `human-confirm|permission-prompt|…`, knowledge's category enum) / field meanings. One catalog, not per-file headers. Indexed in `.agents/docs.md`.

#### [MODIFY] `.agents/rules.md` (Existence Check: exists)

- New universal rules in the `bkit:start/end` block: "Never silently drop work → append `docs/deferrals.jsonl`"; "Any found bug → append `docs/failures.jsonl`"; reinforce "workflows also write `.bkit/friction.jsonl` + `.bkit/stats.jsonl`"; pin the `schemaVersion` bump rule. ASCII operators only.

#### [MODIFY] `.agents/docs.md` (Existence Check: exists)

- Add `docs/telemetry.md` to Workflow Matrix + Full Catalog; update the `docs/pending.md` row to `docs/deferrals.jsonl`; add `docs/failures.jsonl`. One canonical home per topic.

#### [DELETE] `.bkit/friction.md`, `docs/pending.md`, `.bkit/templates/.bkit/friction.md`, `docs/pending.md` template

- Replaced by seeded `.jsonl` (WS-1). `package.json` `files[]` already excludes `friction.md`. History optionally ported (clean break — new entries get `ts` ids; moved legacy entries keep old id only in `aliases[]`).

### WS-2 — Compliance grader (P2)

#### [NEW] `.bkit/src/bkit-comply.ts` (+ `.test.ts`, `.integration.test.ts`)

- Pure functions `(parentSha, phase, planPath) -> Violation[]` over `git diff parentSha..HEAD` + files; deterministic, advisory. Smallest-first rule set: `no-mirror-edit` (`.claude/*`/`.cursor/*` untouched in diff), `skip-ci-not-head` (`git log -1`). Each rule = data citing the prohibition it grades; `graderVersion` + `bkitVersion` stamped on every emitted `kind:"compliance"` row.

#### [NEW] `.bkit/src/bkit-paths-policy.ts` (+ `.test.ts`)

- **OPEN QUESTION (resolve in WS-2 plan-review): new `bkit-paths-policy.ts` vs extend `bkit-tiers.ts`.** Recommendation: NEW file — keeps the protected-path table single-purpose and importable by both grader and the generated `.cjs` without coupling to the install-tier logic. Holds the single protected-path table (mirrors `gateguard.cjs`'s `GATE_CONFIG_PATTERNS` concept, `gateguard.cjs:45`).

#### [NEW] `.claude/hooks/gate-paths.generated.cjs` + drift test (`.bkit/src/bkit-paths-policy.test.ts`)

- COMMITTED generated `.cjs` emitted from the TS table; drift test FAILS if the committed file diverges. NOT install-time codegen — install stays a byte-equal Tier-1 copy (matching the existing `gateguard.cjs` install path).

#### [MODIFY] `.bkit/src/bkit-cli.ts` (+ `bkit-cli.test.ts`) (Existence Check: exists)

- **Net-new CLI plumbing.** Extend the `Verb` union (currently `"install" | "check" | "doctor" | "uninstall" | "upgrade" | "help"`, `bkit-cli.ts:30`) with `comply`; add `--phase` value parsing (mirror the `parseIssueTracker`/`parseCloudVariant` discipline at `bkit-cli.ts:198–238`); add dispatch + usage. **Resolve the entrypoint OPEN QUESTION** (share `dist/bkit-install.js` vs separate entrypoint so a grader crash never touches the install hot path) BEFORE this lands.

#### [MODIFY] all 5 workflow close gates (or ship-only first — OPEN QUESTION)

- Invoke the grader under the PINNED fail-open idiom `pnpm bkit comply --phase {phase} || echo "[bkit-comply] grader unavailable, skipping"` (guaranteed exit 0). Append `kind:"compliance"` rows to `.bkit/stats.jsonl`; surface violations in `ship-summary.md`. **Resolve the per-phase rollout OPEN QUESTION** (all-5 from P2 vs ship-only first; smallest-first leans ship-only).

### WS-3 — #58 prose→shell counter refactor (P3)

> [!WARNING]
> **Reconcile with `dev`-local `refactor(debug): mode-matched attempt counters` FIRST.** Before any WS-3 edit, re-read the LIVE `bkit-debug.md`/`bkit-build.md` attempt-counter prose (e.g. `MAX_VERIFY_ATTEMPT`/`MAX_DEBUG_ATTEMPT` guards, `bkit-ship.md:91`) against that `dev` change so the prose→shell migration does not fork or regress the mode-matched-counter work. This is the first WS-3 runbook task.

#### [NEW] shell counter bus helper + `MAX_*` config

- `counter_init/inc/get/reset/check_max` + `decide_next` (prints next step id; exit code = branch). ALL `MAX_*` thresholds in ONE config file. Counters emit `kind:"counter"` rows with `counterSource:"shell-bus"` into `.bkit/stats.jsonl` (per A3: control counters live in per-plan `status.jsonl` during run; summary rows appended to central `.bkit/stats.jsonl` at workflow close).

#### [NEW] `scripts/tooling/counter-bus.bats`

- DIRECT bats unit tests for the helpers (not just integration via emitted JSONL) — a wrong `decide_next` branch code would silently mis-route all 5 workflows.

#### [MODIFY] `.bkit/workflows/bkit-{build,debug,plan,design}.md` (staged: build → debug → plan/design)

- Move every `*_ATTEMPT` counter + `MAX_*` comparison out of prose into fenced shell; keep narrative judgment branches (PASS/FAIL/CONCERNS, STANDARD/PIVOT/FINAL). ASCII operators only.

#### [NEW] invariant tests

- `.bkit/src/bkit-telemetry-invariant.test.ts` (`counters.verifyAttempt` == count of `plan-verify` rows via folded readers); `.bkit/src/bkit-counter-prose-audit.test.ts` (grep: no `*_ATTEMPT`/`MAX_*` comparison in prose except fenced shell; all `MAX_*` in one config).

### WS-4 — Harvest + analysis (P4)

#### [NEW] `bkit harvest` CLI (+ `bkit-harvest.test.ts`, `bkit-harvest.integration.test.ts`)

- Reads `docs/bkit-consumers.md` → `git worktree list --porcelain` per consumer → **COPIES** each consumer's `.bkit/{stats,friction}.jsonl` into bkit (COPY per A4) and COUNT-ONLY-aggregates `docs/{deferrals,failures}.jsonl` (dimensional counts from envelope metadata; prose NOT copied). Dedup by per-`kind` composite `(ts, repo, …)`; stamp `repo`. NEVER truncates/writes/commits consumer repos. Per-consumer timeout + continue-on-stall; grep-able `[bkit-harvest]` log lines; relies on WS-1 tolerant `parse` for half-written tails. **Boundary integration test: consumer file content + mtime unchanged after harvest.**

#### [NEW] `bkit analysis` CLI (+ `bkit-analysis.test.ts`)

- Counts/rates/elapsed-time; #183 size↔outcome regression (logistic `error ~ log(lines_added) + files_changed`, bucketed) over `kind:"run-outcome"` rows (fields: `lines_added`/`lines_deleted`/`lines_changed`/`files_changed`/`task_count`/`duration_seconds`/`ci_try_success`/`corrective_commits`/`review_iterations`/`deferrals`/`failures`) + GitHub-API historical backfill (pulls/commits/check-runs/reviews incl. hand-written baseline); dispatch-size threshold feeding `plan-complexity-check`/`split`; **per-rule compliance rate over time over WS-2's `kind:"compliance"` rows (this consumption is the artefact that makes the declared WS-2→WS-4 edge real)** + per-`bkitVersion`→CHANGELOG release-attributed regression. Labels `counterSource` trust tier. Recommend/inform only. **Resolve #183 backfill-scope + provenance OPEN QUESTION.**

#### [MODIFY] `bkit-ship.md` summary step — ship-chain rollup

- Report the ship workflow AND the entire design→plan→build→debug→ship chain (aggregate counts/rates/elapsed/compliance violations) from folded telemetry.

#### [NEW] rollup writer to `.bkit/archive/{basename}.{YYYYMM}.jsonl`

- P4 owns the rollup writer (path template + `foldFrom` already shipped in WS-1). **Resolve rollup-trigger-VALUE + committed-vs-gitignored-archive OPEN QUESTION.**

#### [MODIFY] `.bkit/src/bkit-cli.ts` + `.cursor`/`.claude` regen

- Add `harvest`/`analysis` verbs (namespace per the WS-2-resolved OPEN QUESTION).

#### [DELETE] `utility-harvest-friction` agent prompt — `.claude/agents/utility-harvest-friction.md` + `.cursor/agents/utility-harvest-friction.md`

- Mirrors the Supersession Inventory DELETE row. The prompt → deterministic copy-only `bkit harvest` CLI (WS-4). **Path note (verified against the live tree):** this is a project-managed (NON-`bkit-`-prefix) agent that exists ONLY as the two git-tracked files `.claude/agents/utility-harvest-friction.md` and `.cursor/agents/utility-harvest-friction.md` — there is NO `.bkit/prompts/` canonical source for it (unlike the `bkit-utility-*` agents, which DO have `.bkit/prompts/` sources and are install-generated). Because install never writes/prunes non-`bkit-`-prefix files in the mirror dirs, both files are deleted directly. (The earlier scope-check guess of `.agents/prompts/utility-harvest-friction.md` is INCORRECT — that path does not exist.)

### WS-5 — knowledge/decisions migration + consumer-upgrade path (P5)

#### [NEW] data files

- `docs/knowledge.jsonl` (`kind:"knowledge"`), `docs/decisions.jsonl` (`kind:"decision"`) with their OWN explicit scoped `merge=union` lines + slop exemptions (same surface as WS-1's four files). `KN-N`/`DE-N` preserved only in `aliases[]`.

#### [NEW] `bkit telemetry migrate` CLI (+ integration test) — DESTRUCTIVE per addendum A5

- **Net-new sub-verb parser** (`bkit-cli.ts` lacks one today; uses the WS2-T1-resolved entrypoint/namespace). Code cutover is automatic on upgrade (non-destructive — stops consulting `.md`). The data-migration script ports `KN-`/`DE-` ledgers → `docs/{knowledge,decisions}.jsonl` with `aliases[…]`, verifies row-count parity against a transient `.md.bak`, then **DELETES the `.md`** (idempotent). Emits a generated, committed (git-tracked + exempt) `KN-`/`DE-` → row lookup table so the ~1,460 references resolve auditably. **This SUPERSEDES the design body's "opt-in, dry-run, never deletes".**
- **KN-8 / `611b438` bricking-class guard (the design walked this back once; A5 walks it forward).** KN-8 (`docs/knowledge.md:195`) records bkit upgrade silently destroying consumer config, recovered only by `git revert`. The destructive `.md` delete MUST be reachable ONLY via an explicit hand-invoked `bkit telemetry migrate`, NEVER from the automatic `bkit upgrade` cutover path; the `.md.bak`/parity-gate is unskippable under partial failure (parity mismatch or absent `.md.bak` aborts BEFORE any delete). This invariant is pinned mechanically by a boundary test (WS5-T2b: `bkit upgrade` leaves all `.md` byte-identical + mtime-unchanged), NOT asserted in prose only. Both the shipped `KN-CORE-{N}` namespace AND consumer `KN-{N}`/`DE-{N}` namespaces (`knowledge.md:35`) are preserved in `aliases[]`.

#### [MODIFY] `.gitattributes` / `.bkit/templates/.gitattributes` / `slop-scan.config.json` / `.agents/docs.md`

- Add `docs/knowledge.jsonl`/`docs/decisions.jsonl` scoped `merge=union` lines + slop ignores; update docs index. **Placement (Tier-2 discipline, same as WS1-T4):** `docs/knowledge.jsonl`/`docs/decisions.jsonl` are consumer-inherited ledgers (the existing `docs/knowledge.md`/`docs/decisions.md merge=union` lines live INSIDE the managed `bkit:start/end` block today, lines 8–9). When their `.jsonl` successors are added, place each line in the SAME location its `.md` predecessor occupied (inside the managed block of both root `.gitattributes` and `.bkit/templates/.gitattributes`, since they are consumer-inherited content), and retire the corresponding `.md merge=union` line after the WS-5 destructive migration. This DIFFERS from WS-1's four data files (`.bkit/stats.jsonl`/`.bkit/friction.jsonl`/`docs/deferrals.jsonl`/`docs/failures.jsonl`), which are bkit-repo-only and therefore go BELOW `bkit:end` — verify the consumer-facing vs bkit-repo-only distinction at execution time before placing each line.

#### [DELETE] `docs/knowledge.md`, `docs/decisions.md` (parity-gated destructive delete, A5)

- Mirrors the Supersession Inventory DELETE rows. Both `.md` ledgers are DELETED by `bkit telemetry migrate` ONLY after row-count parity is verified against a transient `.md.bak` (WS5-T2); `KN-N`/`DE-N` ids preserved in `aliases[]`. The destructive delete is reachable ONLY via the explicit hand-invoked `bkit telemetry migrate`, NEVER from the automatic `bkit upgrade` cutover path (WS5-T2b pins this mechanically). The `.md` remains recoverable from immutable git history (`git checkout {SHA}~1 -- docs/knowledge.md docs/decisions.md`).

#### Dogfood discipline (A5)

- bkit's own repo migrates first by hand-reviewed CLI run; validate the parser against bkit's REAL `knowledge.md`/`decisions.md` corpus (NOT synthetic fixtures) AND via a packed tarball in a clean consumer dir (`pnpm pack` → fresh install → run; `bkit check` != live migration).

### Cron Jobs & Scheduled Tasks

**None.** Harvest + analysis are ad-hoc maintainer-run CLIs (NOT workflow steps, per A3), not scheduled tasks.

## Documentation Updates

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `docs/telemetry.md` | NEW — agent-readable telemetry catalog (Purpose, per-`kind` field meanings, category enums) per A6 |
| `.agents/docs.md` | Add `docs/telemetry.md` row; `docs/pending.md` → `docs/deferrals.jsonl`; add `docs/failures.jsonl` |
| `.agents/rules.md` | Never-drop→`docs/deferrals.jsonl`, found-bug→`docs/failures.jsonl`, friction/stats reinforcement, `schemaVersion` bump rule (A6/A7) |
| `docs/knowledge.md` (then `.jsonl` post WS-5) | status.jsonl→telemetry generalisation gotchas; tolerant-parse NEW-behaviour divergence; harvest copy-only invariant; ms-`ts` portability |
| `docs/decisions.md` (then `.jsonl` post WS-5) | Per-purpose files; inline-jq writers; counters-as-events; composite-identity dedup; committed-generated-`.cjs` + drift test; copy-only harvest; A1 file placement; A5 destructive migration |
| `docs/architecture.md` | Telemetry subsystem (codec + ledgers + readers) added to bkit topology |
| `docs/testing.md` | New test patterns: inline-jq parity, truncated-line fixture, git-check-attr boundary, counter-bus bats, packed-tarball migration validation |
| `docs/observability.md` | New grep-able log prefixes: `[bkit-telemetry]`, `[bkit-comply]`, `[bkit-harvest]` |

_Application-stack docs (`data-schema.md`, `data-pipeline.md`, `data-cron-jobs.md`, `security.md` PII rows, `styles.md`, `notifications.md`) need no change — no DB/pipeline/UI/route surface._

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | No application database. |
| **Code (WS-1–WS-4, bkit-local, additive)** | `git revert {COMMIT}` per workstream PR | Additive + best-effort; reverting removes the codec/writers/CLI verbs. Seeded-empty `.jsonl` files are harmless if left. |
| **Code (WS-3 control-flow)** | `git revert` the staged counter PR(s); fail-open degradation + invariant-check canary catch a bad `decide_next` before merge | Highest control-flow blast radius; staged build→debug→plan/design limits scope per revert. |
| **Data (WS-5 destructive `.md` delete)** | Restore `.md` from git history (`git checkout {SHA}~1 -- docs/knowledge.md docs/decisions.md`); transient `.md.bak` exists until parity-confirmed | Parity-gated delete + dogfood-first + tarball-validate make the destructive step recoverable; the `.md` lives in immutable git history regardless. |
| **Risk window** | None (no deploy) | bkit ships via npm package + install/upgrade engine; no Vercel/DB deploy gap. |

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate.
> **Blockers:** If a task cannot be completed, DO NOT fail silently — create a tracker `blocker` issue with context before stopping (and, post-WS-1, append a `kind:"failure"`/`kind:"deferral"` row).
> **Step Isolation:** Complete each task fully (including its verification + checking its box) before the next.
> **Workstream gating:** WS-1 fully done+verified BEFORE WS-2/WS-3/WS-5; WS-2+WS-3 done BEFORE WS-4.

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable. Tasks crossing an external boundary (git / filesystem / consumer repo / GitHub API) name the boundary + ground-truth signal in `Done when` (no mocks at boundary).

### WS-1 — JSONL telemetry substrate (Requires: none)

- [ ] **WS1-T1: Codec.** Write `.bkit/src/bkit-telemetry.ts` (envelope + per-`kind` union + `identity`/`fold`/`foldFrom`/`parse`/`appendLine`/`validate`; `ARCHIVE_SHARD_TEMPLATE`, `MAX_ROWS_BEFORE_ROLLUP`, `schemaVersion=1`), cloned from `bkit-status.ts` shape with the three NEW-behaviour divergences.
  - **Done when:** `.bkit/src/bkit-telemetry.ts` exports `fold`, `foldFrom`, `parse`, `appendLine`, `validate`, `identity` (or `kind`-keyed identity map), `ARCHIVE_SHARD_TEMPLATE`, `MAX_ROWS_BEFORE_ROLLUP`; the shared envelope type declares the A2-mandatory fields (`ts`/`kind`/`repo`/`bkitVersion`/`schemaVersion`/`step`) as required on EVERY `kind` (incl. count-only `deferrals`/`failures`); `tsc --noEmit` passes.
- [ ] **WS1-T2: Codec tests.** Write `.bkit/src/bkit-telemetry.test.ts` pinning fold/identity/validate per `kind`, inline-jq parity, truncated-line skip+count, `foldFrom` synthetic shard, warn-and-exclude unknown `schemaVersion`, `run-outcome` shape+parity, same-`ts` same-key composite-dedup.
  - **Done when:** `pnpm test bkit-telemetry` passes with assertions for each Derived-Test-Matrix unit row above; `validate` REJECTS a row missing any A2-mandatory envelope field (`ts`/`kind`/`repo`/`bkitVersion`/`schemaVersion`/`step`) — asserted by a per-field drop test; a deliberately truncated trailing line AND a malformed MIDDLE line each yield `malformedLineCount >= 1` and NO throw; a close-gate-shaped `run-outcome` event `validate`s + folds by `(repo, prNumber)`; two same-`ts` same-key inline-jq-shaped rows fold to ONE via the composite tuple (proven distinct from bare `ts`).
- [ ] **WS1-T3: Data files + manifest exclusion.** Create seeded-empty `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl`; assert absence from manifest `format` entries.
  - **Done when:** four files exist (empty); `.bkit/src/bkit-manifest.test.ts` asserts none is a manifest `format` entry and the test passes.
- [ ] **WS1-T4: `.gitattributes` + slop exemptions + git-check-attr boundary test.** Add four scoped `merge=union` lines to the ROOT `.gitattributes` **BELOW the `# <!-- bkit:end -->` marker (NOT inside the managed `bkit:start/end` block)** — these are bkit-repo-specific runtime ledgers per the Tier-2 bkit-repo rule (CLAUDE.md MEMORY: "bkit-repo-only logic in Tier-2 files goes outside bkit:start/end markers"); do NOT mirror them into `.bkit/templates/.gitattributes`'s managed block (they are bkit-repo-only, not consumer-inherited). Add four `ignores[]` to `slop-scan.config.json`; NO `.vale.ini` block.
  - **Done when (boundary: git check-attr):** `.bkit/src/bkit-telemetry-gitattributes.integration.test.ts` shells out to `git check-attr merge <path>` and asserts `union` for each of the four files AND that an unlisted `.bkit/foo.jsonl` resolves to NO union AND an unlisted `docs/foo.jsonl` resolves to NO union (symmetric blanket-glob absence across both directories); test passes; `pnpm lint:slop` does not flag the four files; AND a structural check (Grep/byte-offset) confirms the four `merge=union` lines sit BELOW the `# <!-- bkit:end -->` marker in the root `.gitattributes`, NOT inside the managed block.
- [ ] **WS1-T5: Ledger cutover.** Migrate `.bkit/friction.md` → `.bkit/friction.jsonl` (`kind:"friction"`), `docs/pending.md` → `docs/deferrals.jsonl` (`kind:"deferral"`); retire the `.md` files + templates. Clean break (new `ts` ids; moved legacy ids → `aliases[]`).
  - **Done when:** `.bkit/friction.md`, `docs/pending.md`, `.bkit/templates/.bkit/friction.md` and the pending template are deleted (`git status` shows deletions); `.jsonl` equivalents exist; the porting scope is EXPLICITLY chosen and recorded — either seeded-empty (fresh-start, deliberate) OR ported with legacy ids in `aliases[]` (NOT silently empty while live history is dropped); `Grep` finds no remaining live read/write of `.bkit/friction.md`/`docs/pending.md` outside archived plans.
- [ ] **WS1-T6: Inline-jq close-step writers (all 5 workflows).** Add best-effort writers at existing step boundaries using `… | .ts = (now*1000|floor)` + `|| echo "[bkit-telemetry] append failed: $FILE"`; EVERY emitted row stamps the A2-mandatory envelope (`repo`/`bkitVersion`/`schemaVersion`/`step` + `kind`); pre-P3 counter rows stamp `counterSource:"model-self-report"`.
  - **Done when:** each of `bkit-{design,plan,build,debug,ship}.md` contains a telemetry append block with the portable ms-`ts` expression (NOT `date +%s%3N`) and the `|| echo` guard; A2-envelope completeness is machine-verified by `.bkit/src/bkit-telemetry-workflow-writers.test.ts` (grep over all 5 workflow files asserts NO append block omits any A2-mandatory field — `ts`/`kind`/`repo`/`bkitVersion`/`schemaVersion`/`step`); a parity check confirms a row written by the workflow jq parses under `bkit-telemetry.parse` and `validate`s; AND `scripts/tooling/telemetry-failopen.bats` forces the append-failure path and asserts shell exit 0 (locked SC #2).
- [ ] **WS1-T7: `run-outcome` close-gate writer (ship).** At the `bkit-ship.md` close gate, append ONE `kind:"run-outcome"` row keyed `(repo, prNumber)` carrying the git-derivable size fields (`lines_added`/`lines_deleted`/`lines_changed`/`files_changed`), plan signals (`task_count`, `duration_seconds`), and outcome counts (`deferrals`, `failures`) plus the A2 envelope, under the same best-effort idiom. (The `ci_try_success`/`corrective_commits`/`review_iterations` GitHub-API-derived fields are backfilled by WS-4 analysis; WS-1 emits the size + plan substrate the #183 regression reads.)
  - **Done when:** `bkit-ship.md`'s close gate contains a `kind:"run-outcome"` append block with the portable ms-`ts` expression + `|| echo` guard that emits `lines_added`/`lines_deleted`/`lines_changed`/`files_changed`/`task_count`/`duration_seconds`/`deferrals`/`failures` + the A2 envelope (incl. `step`); a `Grep` confirms exactly one `run-outcome` writer exists and it is at the ship close gate; the emitted row shape matches the `run-outcome` shape/parity unit row in `bkit-telemetry.test.ts` (validates + folds by `(repo, prNumber)`).
- [ ] **WS1-T8: Per-workflow summary read.** Add a summary read (count/size/fold-time + `malformedLineCount` + unknown-`schemaVersion` exclusions + `MAX_ROWS_BEFORE_ROLLUP` growth WARNING).
  - **Done when:** each workflow's summary step emits the four metrics; the `MAX_ROWS_BEFORE_ROLLUP` value is LOCKED to a concrete number (not left as a TODO); exceeding `MAX_ROWS_BEFORE_ROLLUP` produces a grep-able `[bkit-telemetry]` WARNING line.
- [ ] **WS1-T9: rules.md + telemetry.md catalog + docs index (A6/A7).** Add never-drop/found-bug/friction-stats rules + `schemaVersion` bump rule to `rules.md`; write `docs/telemetry.md`; update `.agents/docs.md`; sweep workflow CAUTION headers + every legacy-ledger read/write site.
  - **Done when:** `rules.md` block contains the four rules; `docs/telemetry.md` exists with `bkit:start/end` + per-`kind` field meanings; `.agents/docs.md` lists `docs/telemetry.md` + `docs/deferrals.jsonl` + `docs/failures.jsonl`; `Grep` finds no unswept legacy-ledger reference in `.bkit/workflows/`, `.bkit/prompts/`, `.agents/rules.md`, `.agents/docs.md`, `.bkit/templates/`.

### 🔒 Gate 2 (WS-1): Code Implementation Check

- [ ] **Gate 2 (WS-1) - Verified:** Every WS-1 task above independently verified and checked off.

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

### WS-5 — knowledge/decisions migration (Requires: WS-1, WS-2 [scoped: WS2-T1 entrypoint/namespace decision])

> [!IMPORTANT]
> **WS-5 inherits the WS2-T1 CLI-substrate decision.** `bkit telemetry migrate` is net-new CLI dispatch + a sub-verb parser on the SAME `bkit-cli.ts` that WS-2 and WS-4 extend. WS-5's sub-verb parser + entrypoint wiring MUST NOT land before WS2-T1 records the entrypoint/namespace decision — otherwise the CLI architecture forks exactly where the design forbids it, and the destructive `.md`-deleting verb risks being wired into the consumer-mutating install hot path the isolation decision is meant to protect. The WS-1→{WS-2,WS-3,WS-5} parallelism still holds for everything EXCEPT WS-5's CLI plumbing (WS5-T2), which is gated on WS2-T1.

- [ ] **WS5-T1: New files + exemptions.** Create `docs/knowledge.jsonl`/`docs/decisions.jsonl` + scoped `merge=union` lines + slop ignores + docs index.
  - **Done when:** both files exist; `git check-attr merge` resolves `union` for each; slop does not flag them.
- [ ] **WS5-T0: Re-confirm the KN-8 / `611b438` bricking mechanism before any destructive code.** Re-read KN-8 (`docs/knowledge.md:195` — "bkit upgrade silently overwrote `.cursor/hooks.json`/`.claude/settings.json` ... destroying the consumer's hook block ... Recovered only by `git revert` of the install commit") and the design body's `611b438` provenance-stamp-revert "repo-bricking footgun". The design walked P5 back to opt-in/dry-run/never-deletes for exactly this class; addendum A5 walks it forward to a destructive delete — so the destructive path MUST be provably unreachable from automatic `bkit upgrade`.
  - **Done when:** a durable note in `docs/decisions.md` (then `.jsonl`) cites KN-8's mechanism + `611b438` and records the explicit invariant that the destructive delete is reachable ONLY via an explicit hand-invoked `bkit telemetry migrate`, NEVER from the automatic `bkit upgrade` cutover path; this invariant is the contract WS5-T2 + WS5-T2b enforce.
- [ ] **WS5-T2: Migration CLI (destructive, A5) + lookup table.** Implement `bkit telemetry migrate` (sub-verb parser, using the WS2-T1-resolved entrypoint/namespace); port `.md` → `.jsonl` with `aliases[]`; emit committed `KN-`/`DE-`→row lookup table; parity-verify then DELETE `.md`. **MUST NOT start until WS2-T1 is recorded** (entrypoint isolation matters MOST for this destructive consumer-mutating verb). The `.md.bak`/parity-gate MUST be unskippable under partial failure (a parity mismatch or a missing `.md.bak` aborts BEFORE any delete).
  - **Done when:** running migrate on a fixture corpus produces row-count parity (logged), writes the lookup table, and deletes `.md` ONLY after parity against the transient `.md.bak`; a forced parity-mismatch / absent-`.md.bak` fixture ABORTS with no `.md` deleted (delete is unreachable under partial failure); re-running is a no-op (idempotent).
- [ ] **WS5-T2b: Prove the destructive delete is unreachable from `bkit upgrade` (boundary test).** Pin the design's claim ("code cutover is automatic on upgrade — non-destructive") with a mechanical test, NOT prose, closing the KN-8 regression vector.
  - **Done when (boundary: filesystem/consumer repo):** a test runs `bkit upgrade` over a fixture consumer that has `.md` ledgers and asserts ALL `.md` ledgers are byte-identical + mtime-unchanged afterwards (ground-truth = real filesystem stat, no mock); a complementary assertion confirms ONLY an explicit `bkit telemetry migrate` invocation deletes `.md`, and only post-parity; `Grep`/dispatch-graph confirms no `upgrade` code path reaches the migrate-delete function.
- [ ] **WS5-T3: Real-corpus + packed-tarball validation.** Validate against bkit's REAL `knowledge.md`/`decisions.md` AND a packed tarball in a clean consumer dir.
  - **Done when (boundary: real corpus + packed tarball):** `.bkit/src/bkit-telemetry-migrate.integration.test.ts` runs migrate over bkit's actual `docs/knowledge.md`/`docs/decisions.md` and asserts every id appears in an `aliases[]` across BOTH the shipped `KN-CORE-{N}` namespace AND the consumer `KN-{N}`/`DE-{N}` namespaces (the migration must preserve both — `knowledge.md:35`); a `pnpm pack` → fresh-dir install → migrate run completes without `ERR_MODULE_NOT_FOUND` and ports the consumer's `.md` (ground-truth = real files + real install, no mock).
- [ ] **WS5-T4: Dogfood migrate bkit's own repo.** Hand-reviewed CLI run on bkit; commit the `.jsonl` + lookup table; confirm agents read `.jsonl`.
  - **Done when:** `docs/knowledge.jsonl`/`docs/decisions.jsonl` are populated from bkit's history, `.md` deleted, and `.agents/docs.md` + gotcha-check sites read the `.jsonl`.

### 🔒 Gate 2 (WS-5): Code Implementation Check

- [ ] **Gate 2 (WS-5) - Verified:** Every WS-5 task verified and checked off.

> [!IMPORTANT]
> **Testing Strategy (See `docs/testing.md`):** This is a bkit-repo tooling change — ALL tests are Vitest unit/integration in `.bkit/src/` or bats shell tests in `scripts/`. There is NO Playwright/E2E/Supabase surface (the gether-app Playwright conventions in the base template do NOT apply). Boundary tests (git diff, git check-attr, filesystem/consumer repo, packed-tarball, shell exit codes) run against ground truth — NO mocks at the boundary.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every Derived-Test-Matrix row maps to a checked-off runbook task above.
- [ ] **Update existing tests:** Adjust `bkit-cli.test.ts`, `bkit-manifest.test.ts`, and any workflow-content/render-parity tests affected by the new writers/verbs/ledger renames.
- [ ] **Write new tests:** All NEW test files listed in the Derived Test Matrix.
- [ ] **Verify observability:** New `[bkit-telemetry]`/`[bkit-comply]`/`[bkit-harvest]` log prefixes documented in `docs/observability.md`.
- [ ] **Update documentation:** All `Documentation Updates` rows completed; rewrite prose, no lazy appends.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** Every `Documentation Updates` row completed. `.agents/docs.md` accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck` (`tsc --noEmit`) + `pnpm lint:slop` clean (four/six data files in `ignores[]`); `pnpm lint:workflows` (actionlint) clean; `pnpm format:check`.
- [ ] **dist parity:** `pnpm check:dist` (rebuild `dist/` + `git diff --exit-code dist/`) — new CLI verbs compiled + committed.
- [ ] **Generated-file drift:** `gate-paths.generated.cjs` drift test green; render-parity / catalog-parity tests green for `.claude`/`.cursor` mirrors after regen.
- [ ] **Test Synchronization:** Re-run the full suite after each workstream merge; update `bkit-cli.test.ts`/`bkit-manifest.test.ts`/workflow-content tests in lockstep to prevent CI failures.
- [ ] **Run all tests:** `pnpm test` green incl. all boundary integration tests; counter-bus bats green. Fix all failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades:** On build/compile/test errors, NEVER hot-fix or anti-pattern. Follow `docs/architecture.md` + `docs/knowledge.md`. The telemetry codec MUST stay TS-canonical with the inline-jq parity test as the drift guard. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** Every Automated Tests checkbox verified with explicit proof (test output, `git check-attr` results, harvest mtime/content diffs, tarball-install log).

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Use local CLIs (`gh`, `git`, `jq`, `pnpm`) to verify, not dashboards.

- [ ] **Step 1 (WS-1):** Run a real bkit workflow on the bkit repo to close; `tail` the relevant `.jsonl` and confirm a well-formed row with ms `ts`; force an append failure and confirm the `[bkit-telemetry]` warning + workflow continuation.
- [ ] **Step 2 (WS-2):** Run `pnpm bkit comply --phase ship` on a branch with a deliberate `.claude/*` edit; confirm a `kind:"compliance"` row + `ship-summary.md` surfacing; rename/break `dist/` and confirm the fail-open `|| echo` keeps exit 0.
- [ ] **Step 3 (WS-3):** Drive a build verify loop past `MAX_VERIFY_ATTEMPT`; confirm it cannot silently continue and the invariant check passes.
- [ ] **Step 4 (WS-4):** Run harvest against a real consumer worktree; `git status` in the consumer confirms ZERO changes; run analysis and confirm the #183 regression output + `counterSource` trust labelling.
- [ ] **Step 5 (WS-5):** Run `bkit telemetry migrate` on bkit's own repo; confirm row-count parity log, `.md` deleted, every `KN-`/`DE-` id present in an `aliases[]`, and a clean-dir tarball install + migrate completes.
