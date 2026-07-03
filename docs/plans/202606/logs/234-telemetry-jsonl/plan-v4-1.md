<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# Sub-Plan A (WS-1) — JSONL telemetry substrate (P1)

**Parent Plan:** [`plan-v4-split.md`](./plan-v4-split.md)
**Master Plan (full source):** [`plan-v3-checked.md`](./plan-v3-checked.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual sub-plan file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document.

## Workstream Dependency

- **Requires:** Nothing. WS-1 is the ROOT substrate and MUST land first — every other workstream (B/C/D/E) reads/writes its codec, identity tuples, and exemption surface.
- **Blocks:** Sub-plans B (WS-2), C (WS-3), E (WS-5) each require this shipped to dev; Sub-plan D (WS-4) requires A+B+C.
- **Concurrency:** None — root.

## Context & Goals

bkit scatters telemetry across markdown ledgers (`.bkit/friction.md`, `docs/pending.md`, `docs/knowledge.md`, `docs/decisions.md`) plus a per-FID `status.jsonl`. WS-1 lays the root substrate of issue #234: ONE canonical TypeScript codec (`.bkit/src/bkit-telemetry.ts`) generalising the shipped `status.jsonl` machine into a family of append-only NDJSON ledgers, the seeded data files, the `merge=union`/slop exemption surface, and inline-jq close-step writers across all 5 workflows. **bkit-repo tooling — NO database, API, UI, or RLS.**

**Success Criteria (this workstream):**

- Every workflow close step appends well-formed telemetry rows to the relevant `.jsonl` ledger; rows fold to current state via ONE canonical TypeScript reducer pinned by unit test; a parity test proves an inline-jq-written row parses identically under that reducer.
- The four data files stay OUT of the manifest, each carries its own explicit scoped `merge=union` line (never a blanket glob), is exempt from slop-scan.
- `.bkit/friction.md`/`docs/pending.md` are retired to `.jsonl`; the ship close gate emits a `kind:"run-outcome"` row (the #183 size substrate).

## Acceptance Scenario (scoped to WS-1)

### Narrative _(inherited from design — do not rewrite)_

As a bkit maintainer, I run a workflow (design/plan/build/debug/ship) and at its close it appends machine-readable telemetry rows to `.bkit/*.jsonl` / `docs/*.jsonl` — compliance grades, run outcomes, deterministic attempt/failure counts, friction, deferrals, and discovered bugs — without me writing prose ledgers by hand. At ship, the summary step shows me an aggregate rollup of the whole design→plan→build→debug→ship chain (counts, rates, elapsed times, compliance violations) read straight from those logs. Later, I run a harvest CLI that copies the same telemetry from my consumer repos on this machine and an analysis CLI tells me where compliance is regressing and whether change size predicts PR error rate — all without ever mutating a consumer's files.

### Success Criteria _(inherited from design — do not rewrite)_

1. Every workflow close step appends well-formed telemetry rows to the relevant `.jsonl` ledger; rows are folded to current state by ONE canonical TypeScript reducer whose semantics a unit test pins, and a parity test proves an inline-jq-written row parses identically under that reducer.
2. The data files stay OUT of the manifest (git-tracked runtime content), each has its own explicit scoped `merge=union` line (never a blanket `*.jsonl` glob), is exempt from install/mirror + slop-scan (no Vale exemption needed — `lint:prose` never scans `.jsonl`), and is committed at close with `[skip ci]`; legacy `KN-`/`DE-` references resolve via `aliases[]` with no mass retrofit of the ~1,460 existing references.

### Concrete Example _(WS-1 slice)_

**Setup:** A bkit maintainer on the bkit repo itself, building WS-1, with `dist/` built. A `bkit-ship` run is closing on a feature branch whose `parentSha` is the design-start commit.

**Steps:**

1. The ship close gate appends a `kind:"run-outcome"` row (lines_added/lines_deleted/lines_changed/files_changed/task_count/duration_seconds/deferrals/failures) via `jq -nc '… | .ts = (now*1000|floor)' >> "$FILE" || echo "[bkit-telemetry] append failed: $FILE"`.
2. The ship-summary step folds `.bkit/stats.jsonl` (hot + archive via `foldFrom`), reports counts/size/fold-time, and flags `malformedLineCount` + any unknown-`schemaVersion` exclusions + a `MAX_ROWS_BEFORE_ROLLUP` growth warning if exceeded.

**Outcome:** Telemetry rows exist in the right ledgers, the workflow completed even on append failure (best-effort, never gated), and the maintainer sees a folded summary.

### Edge Cases _(WS-1 slice)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `merge=union` interleaves/duplicates appended lines; two branches write the same ms `ts` for the same logical key | Fold reducer dedupes by per-`kind` COMPOSITE identity (not bare `ts`), mirroring `bkit-status.ts`'s tuple dedupe; both git-level rows collapse to one |
| Someone proposes `.bkit/*.jsonl merge=union` (blanket glob) | FORBIDDEN — each file gets one explicit scoped line; validated via `git check-attr merge` (real resolver), asserting blanket glob does NOT match |
| Malformed / truncated trailing line during read or harvest | Tolerant `parse` wraps each line in try/catch, skips + counts it via `malformedLineCount`, NEVER throws (NEW behaviour — `parseStatus` throws); pinned by truncated-line fixture test |
| Telemetry append fails (disk, jq error) at close step | Best-effort idiom `… >> "$FILE" \|\| echo "[bkit-telemetry] append failed: $FILE"` guarantees exit 0; workflow continues |
| `date +%s%3N` on a BSD/macOS dev shell | NOT USED — ms `ts` emitted via portable `jq '… \| .ts = (now*1000\|floor)'`; pinned + parity-tested |
| Reader meets a row with unknown (greater) `schemaVersion` | Warn `[bkit-telemetry] unknown schemaVersion N, excluding row` and EXCLUDE from rate/aggregate calcs (warn-and-exclude, never silently mis-bucket); fold surfaces excluded count |
| `stats.jsonl` grows past threshold (~5,000 rows) before P4 rollup ships | P1 ship-summary emits a grep-able `[bkit-telemetry]` `MAX_ROWS_BEFORE_ROLLUP` WARNING; `foldFrom` already reads the pinned archive shard path so the later P4 rollup cannot break readers |
| LLM rewords a friction/deferral/failure description | Logical key = explicit written-once `key` slug, NOT a free-text hash; a reword does NOT fork the key; recurrence collapses to same identity |

### Derived Test Matrix _(WS-1 portion)_

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| `fold` collapses same-`kind` composite-identity duplicates to current state, per `kind` | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| `identity(event)` returns the correct composite tuple for each `kind` (compliance/counter/run-outcome/friction/deferral/failure) | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| `validate(event)` rejects malformed rows AND unknown `kind` before write, AND rejects any row missing an A2-mandatory envelope field (`ts`/`kind`/`repo`/`bkitVersion`/`schemaVersion`/`step`) | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| `run-outcome` row shape: a close-gate-shaped `run-outcome` event (lines_added/lines_deleted/lines_changed/files_changed/task_count/duration_seconds/ci_try_success/deferrals/failures) `validate`s, folds by `(repo, prNumber)`, and parses identically when written via the inline-jq close-step idiom (parity) | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| Two same-`ts` same-key inline-jq rows (identical `now*1000\|floor` `ts`, identical key), concatenated as `merge=union` would produce, fold to ONE row via the per-`kind` COMPOSITE identity — and the composite tuple differs from bare `ts` so dedup is proven the composite path, not accidental `ts`-equality | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| Inline-jq parity: a `jq -nc '… \| .ts=(now*1000\|floor)'` row parses identically under `parse` | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| Tolerant `parse` skips + counts a malformed line via `malformedLineCount`, never throws — for BOTH a truncated trailing line AND a malformed line in the MIDDLE of the file | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| `foldFrom(paths[])` reads a synthetic archive shard at `.bkit/archive/{basename}.{YYYYMM}.jsonl` + hot file | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| Reader warn-and-EXCLUDES a row with unknown (greater) `schemaVersion`; surfaces excluded count | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| `.gitattributes` resolves `merge=union` for each scoped data-file path (lines placed BELOW `# <!-- bkit:end -->`, outside the managed block) AND does NOT blanket-match an arbitrary `.bkit/foo.jsonl` NOR an arbitrary `docs/foo.jsonl` (symmetric blanket-glob absence) | Integration **boundary: git check-attr** (Vitest/bats) | `.bkit/src/bkit-telemetry-gitattributes.integration.test.ts` |
| Each data file is absent from the install manifest (`format` entries) | Unit (Vitest) | `.bkit/src/bkit-manifest.test.ts` (extend) |
| Per-workflow summary read surfaces all three signals: `malformedLineCount`, unknown-`schemaVersion` exclusion count, and a grep-able `[bkit-telemetry]` `MAX_ROWS_BEFORE_ROLLUP` WARNING line when `rowCount > MAX_ROWS_BEFORE_ROLLUP` | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| Every workflow close-step append block sets ALL A2-mandatory envelope fields (`ts`/`kind`/`repo`/`bkitVersion`/`schemaVersion`/`step`) — grep over all 5 `bkit-*.md` workflow files finds NO append block omitting any A2 field | Integration (Vitest grep over workflow files) | `.bkit/src/bkit-telemetry-workflow-writers.test.ts` |
| Best-effort append idiom guarantees exit 0: forcing the telemetry-append failure path (`\|\| echo "[bkit-telemetry] append failed"`) leaves shell exit 0 (locked SC #2) | Unit (bats) **boundary: shell exit codes** | `scripts/tooling/telemetry-failopen.bats` |

## Architecture & Component Changes (WS-1)

**CRITICAL:** All edits land in canonical `.bkit/`, `.agents/`, root config; `.claude/*`/`.cursor/*` mirrors are regenerated by the install engine — NEVER hand-edited. Data files stay OUT of the manifest. ASCII operators only in workflow/prompt files.

#### [NEW] `.bkit/src/bkit-telemetry.ts`

- ONE canonical codec/reducer cloned from the SHAPE of `.bkit/src/bkit-status.ts`. Exports: shared envelope type; per-`kind` discriminated-union payloads; `identity(event)` (per-`kind` composite tuple); `fold(events)`; `foldFrom(paths[])` (reads hot + archive shards); tolerant `parse(raw)`; `appendLine(event)`; `validate(event)`.
- **THREE load-bearing divergences from `bkit-status.ts` that are NEW behaviour (NOT inherited):** (a) tolerant `parse` = per-line try/catch + skip + `malformedLineCount` (`parseStatus` does a bare `JSON.parse(l)` and THROWS — `bkit-status.ts:139`); (b) `validate` REJECTS unknown `kind` before write; (c) ms `ts` via `now*1000|floor`, NOT ISO `at`.
- Named exported constants: `ARCHIVE_SHARD_TEMPLATE` = `.bkit/archive/{basename}.{YYYYMM}.jsonl`; `MAX_ROWS_BEFORE_ROLLUP` (init proposed ~5,000). `schemaVersion` init `1`; bump ONLY on a breaking field change; reader warn-and-EXCLUDES unknown (greater) versions.

#### [NEW] `.bkit/src/bkit-telemetry.test.ts`

- Pins fold/identity/validate per `kind`; inline-jq parity; truncated-line fixture skip+count; `foldFrom` against a synthetic archive shard at the pinned template; warn-and-exclude on unknown `schemaVersion`.

#### [NEW] `.bkit/src/bkit-telemetry-gitattributes.integration.test.ts`

- **Boundary: git `check-attr`.** Asserts each scoped data-file path resolves `merge=union` AND a non-listed `.bkit/foo.jsonl` / `docs/foo.jsonl` does NOT.

#### [NEW] `.bkit/src/bkit-telemetry-workflow-writers.test.ts`

- Grep over all 5 workflow files asserts NO append block omits any A2-mandatory field.

#### [NEW] `scripts/tooling/telemetry-failopen.bats`

- Forces the append-failure path; asserts shell exit 0. (Dev-only bats harness — do NOT add to runtime deps.)

#### [NEW] data files (seeded empty)

- `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl`. Git-tracked runtime content, NOT manifest entries.

#### [MODIFY] `.gitattributes` (Existence Check: exists, lines 1–21)

- **BELOW the `# <!-- bkit:end -->` marker (NOT inside the managed `bkit:start/end` block)**, add FOUR explicit scoped `merge=union` lines (`.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl`) — NEVER a blanket glob. **Rationale (Tier-2 bkit-repo rule):** these four entries are bkit-repo-specific runtime ledgers, so they belong OUTSIDE the consumer-inherited managed block. Keep `.bkit/friction.md` line until WS-1 retires it.

#### [MODIFY] `.bkit/templates/.gitattributes`

- The four lines are bkit-repo-only — they go BELOW `# <!-- bkit:end -->` in the root `.gitattributes` and are NOT mirrored into the consumer-inherited managed block of the template.

#### [MODIFY] `slop-scan.config.json`

- Add the four data-file paths to `ignores[]` (per-file opt-out, NEVER a blanket "skip `.jsonl`"). **No `.vale.ini` block** — `lint:prose` hands Vale an explicit `.md` find-list, so `.jsonl` is never scanned.

#### [MODIFY] `.bkit/src/bkit-manifest.test.ts`

- Add an assertion that the four data files are ABSENT from manifest `format` entries.

#### [MODIFY] all 5 workflows — `.bkit/workflows/bkit-{design,plan,build,debug,ship}.md`

- Add inline-jq close-step writers at EXISTING step boundaries using the pinned best-effort idiom and portable ms `ts` (mirroring existing `jq -nc … >> "$STATUS"` blocks, e.g. `bkit-build.md:330–338`, but with `.ts = (now*1000|floor)`). EVERY emitted row stamps the A2-mandatory envelope. Pre-P3 counter rows stamp `counterSource:"model-self-report"`. The `bkit-ship.md` close gate ALSO emits one `kind:"run-outcome"` row keyed `(repo, prNumber)` carrying git-derivable size fields (`lines_added`/`lines_deleted`/`lines_changed`/`files_changed`) plus plan signals (`task_count`, `duration_seconds`) and outcome counts (`deferrals`, `failures`). Add a per-workflow summary read (count/size/fold-time + `malformedLineCount` + unknown-`schemaVersion` exclusions + `MAX_ROWS_BEFORE_ROLLUP` growth WARNING).
- **A7 sweep:** update workflow CAUTION headers with never-drop→`docs/deferrals.jsonl` + found-bug→`docs/failures.jsonl` lines; sweep every read/write of legacy ledgers to the `.jsonl` equivalents (`bkit-ship.md:467,238,926`, `knowledge.md` gotcha-checks, `.agents/docs.md` index).

#### [NEW] `docs/telemetry.md` (addendum A6 — agent-readable catalog)

- `bkit:start/end` block carrying the old `.md` headers' Purpose / category enums / field meanings. One catalog, not per-file headers. Indexed in `.agents/docs.md`.

#### [MODIFY] `.agents/rules.md`

- New universal rules in the `bkit:start/end` block: never-drop→`docs/deferrals.jsonl`; found-bug→`docs/failures.jsonl`; reinforce "workflows also write `.bkit/friction.jsonl` + `.bkit/stats.jsonl`"; pin the `schemaVersion` bump rule. ASCII operators only.

#### [MODIFY] `.agents/docs.md`

- Add `docs/telemetry.md` to Workflow Matrix + Full Catalog; update the `docs/pending.md` row to `docs/deferrals.jsonl`; add `docs/failures.jsonl`.

#### [DELETE] `.bkit/friction.md`, `docs/pending.md`, `.bkit/templates/.bkit/friction.md`, `docs/pending.md` template

- Replaced by seeded `.jsonl` (WS-1). `package.json` `files[]` already excludes `friction.md`. History optionally ported (clean break — new entries get `ts` ids; moved legacy entries keep old id only in `aliases[]`).

## Security & Privacy

- Telemetry rows carry repo/workflow/step/subagent metadata + LLM-authored free text (`description`/`root_cause`). NO secrets/tokens. Consumer-facing advisory text shipped by bkit MUST NOT cite `KN-`/`BAR-`/Linear refs (MEMORY rule).
- _Net: no new routes, DB writes, secrets, or untrusted-network input._

## 🚨 Pre-Flight / Dependencies 🚨

### Core (always verify)

- [ ] **Package Management:** Verify `package.json` — `picomatch` (dep), `vitest`/`tsx`/`typescript` (dev) present. No NEW runtime dependency (jq is a system tool; bats is dev-only). If a bats harness is added, classify it dev-only.
- [ ] **Dependency Versions:** Spot-check `node --version` (>=20), `npx tsc --version`, `jq --version` (system; portable `now*1000|floor` avoids GNU-`date`), `pnpm --version`.
- [ ] **User Context:** Verify read/write access to `.bkit/src/`, `.bkit/workflows/`, `.bkit/templates/`, `.agents/`, root config (`.gitattributes`, `slop-scan.config.json`, `package.json`).
- [ ] **Pending Blockers:** Query tracker for open `blocker`-labelled issues relevant to telemetry. (`bkit.issueTracker: github`.)
- [ ] **Project Context:** Read `docs/knowledge.md` + `docs/decisions.md` for relevant patterns (status.jsonl reducer, install↔dogfood divergence, slop per-file opt-out, ASCII operators in workflow files).
- [ ] **Testing & Quality:** Align with `docs/testing.md`. Telemetry tests are Vitest unit/integration in `.bkit/src/`; boundary tests (git check-attr, shell exit codes) run against ground truth, NOT mocks.
- [ ] **Prerequisite Plans:** None — WS-1 is the root. This sub-plan MUST ship to dev BEFORE Sub-plans B/C/D/E.

### Conditional

- [ ] **Architecture & UI** — Validate against `docs/architecture.md` + the canonical-source rule. No UI.
- [ ] **Observability** — Confirm `[bkit-telemetry]` grep-able log prefix documented per `docs/observability.md`.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** Human confirmed the master `👤 Acceptance Scenario` section (`plan-v3-checked.md`, checkbox `[x]`). _(Unchecked → REVISE.)_
- [ ] **Breaking Changes confirmed:** Human confirmed the master `⚠️ Breaking Changes & Naming Review` section. _(Unchecked → REVISE.)_
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Agent Execution Runbook (WS-1)

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate.
> **Blockers:** If a task cannot be completed, DO NOT fail silently — create a tracker `blocker` issue with context before stopping (and, post-WS-1, append a `kind:"failure"`/`kind:"deferral"` row).
> **Step Isolation:** Complete each task fully (including its verification + checking its box) before the next.

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable. Tasks crossing an external boundary name the boundary + ground-truth signal in `Done when` (no mocks at boundary).

### WS-1 — JSONL telemetry substrate (Requires: none)

- [ ] **WS1-T1: Codec.** Write `.bkit/src/bkit-telemetry.ts` (envelope + per-`kind` union + `identity`/`fold`/`foldFrom`/`parse`/`appendLine`/`validate`; `ARCHIVE_SHARD_TEMPLATE`, `MAX_ROWS_BEFORE_ROLLUP`, `schemaVersion=1`), cloned from `bkit-status.ts` shape with the three NEW-behaviour divergences.
  - **Done when:** `.bkit/src/bkit-telemetry.ts` exports `fold`, `foldFrom`, `parse`, `appendLine`, `validate`, `identity` (or `kind`-keyed identity map), `ARCHIVE_SHARD_TEMPLATE`, `MAX_ROWS_BEFORE_ROLLUP`; the shared envelope type declares the A2-mandatory fields (`ts`/`kind`/`repo`/`bkitVersion`/`schemaVersion`/`step`) as required on EVERY `kind` (incl. count-only `deferrals`/`failures`); `tsc --noEmit` passes.
- [ ] **WS1-T2: Codec tests.** Write `.bkit/src/bkit-telemetry.test.ts` pinning fold/identity/validate per `kind`, inline-jq parity, truncated-line skip+count, `foldFrom` synthetic shard, warn-and-exclude unknown `schemaVersion`, `run-outcome` shape+parity, same-`ts` same-key composite-dedup.
  - **Done when:** `pnpm test bkit-telemetry` passes with assertions for each Derived-Test-Matrix unit row above; `validate` REJECTS a row missing any A2-mandatory envelope field (`ts`/`kind`/`repo`/`bkitVersion`/`schemaVersion`/`step`) — asserted by a per-field drop test; a deliberately truncated trailing line AND a malformed MIDDLE line each yield `malformedLineCount >= 1` and NO throw; a close-gate-shaped `run-outcome` event `validate`s + folds by `(repo, prNumber)`; two same-`ts` same-key inline-jq-shaped rows fold to ONE via the composite tuple (proven distinct from bare `ts`).
- [ ] **WS1-T3: Data files + manifest exclusion.** Create seeded-empty `.bkit/stats.jsonl`, `.bkit/friction.jsonl`, `docs/deferrals.jsonl`, `docs/failures.jsonl`; assert absence from manifest `format` entries.
  - **Done when:** four files exist (empty); `.bkit/src/bkit-manifest.test.ts` asserts none is a manifest `format` entry and the test passes.
- [ ] **WS1-T4: `.gitattributes` + slop exemptions + git-check-attr boundary test.** Add four scoped `merge=union` lines to the ROOT `.gitattributes` **BELOW the `# <!-- bkit:end -->` marker (NOT inside the managed `bkit:start/end` block)** — these are bkit-repo-specific runtime ledgers per the Tier-2 bkit-repo rule (CLAUDE.md MEMORY: "bkit-repo-only logic in Tier-2 files goes outside bkit:start/end markers"); do NOT mirror them into `.bkit/templates/.gitattributes`'s managed block. Add four `ignores[]` to `slop-scan.config.json`; NO `.vale.ini` block.
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

## Testing & Documentation (WS-1 scope)

> [!IMPORTANT]
> **Testing Strategy (See `docs/testing.md`):** bkit-repo tooling — ALL tests are Vitest unit/integration in `.bkit/src/` or bats in `scripts/`. NO Playwright/E2E/Supabase surface. Boundary tests (git check-attr, shell exit codes) run against ground truth — NO mocks at the boundary.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every WS-1 Derived-Test-Matrix row maps to a checked-off runbook task above.
- [ ] **Update existing tests:** Adjust `bkit-manifest.test.ts` and any workflow-content/render-parity tests affected by the new writers/ledger renames.
- [ ] **Write new tests:** All NEW WS-1 test files listed in the Derived Test Matrix.
- [ ] **Verify observability:** New `[bkit-telemetry]` log prefix documented in `docs/observability.md`.
- [ ] **Update documentation:** `docs/telemetry.md` (NEW), `.agents/docs.md`, `.agents/rules.md`, `docs/knowledge.md` (status.jsonl→telemetry generalisation gotchas; tolerant-parse NEW-behaviour divergence; ms-`ts` portability), `docs/decisions.md` (per-purpose files; inline-jq writers; composite-identity dedup; A1 file placement), `docs/architecture.md` (telemetry subsystem), `docs/testing.md` (inline-jq parity, truncated-line fixture, git-check-attr boundary), `docs/observability.md`.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** Every WS-1 `Documentation Updates` row completed. `.agents/docs.md` accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified.

## Verification Plan (WS-1)

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm typecheck` (`tsc --noEmit`) + `pnpm lint:slop` clean (four data files in `ignores[]`); `pnpm lint:workflows` (actionlint) clean; `pnpm format:check`.
- [ ] **dist parity:** `pnpm check:dist` (rebuild `dist/` + `git diff --exit-code dist/`).
- [ ] **Test Synchronization:** Re-run the full suite; update `bkit-manifest.test.ts`/workflow-content tests in lockstep.
- [ ] **Run all tests:** `pnpm test` green incl. the git-check-attr boundary integration test; `telemetry-failopen.bats` green. Fix all failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades:** On build/compile/test errors, NEVER hot-fix or anti-pattern. The telemetry codec MUST stay TS-canonical with the inline-jq parity test as the drift guard. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

- [ ] **Gate 4 - Verified:** Every Automated Tests checkbox verified with explicit proof (test output, `git check-attr` results).

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** Use local CLIs (`gh`, `git`, `jq`, `pnpm`) to verify, not dashboards.

- [ ] **Step 1 (WS-1):** Run a real bkit workflow on the bkit repo to close; `tail` the relevant `.jsonl` and confirm a well-formed row with ms `ts`; force an append failure and confirm the `[bkit-telemetry]` warning + workflow continuation.
