<!-- bkit:start -->

<!-- bkit:managed v4.8.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Constant roadmap analysis refresh (#380) Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. Read this `plan.md` natively ONCE at session start. Do NOT re-read on every loop iteration.
> 2. NEVER trust session memory or previous conversation history.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in this document. `[ ]` = NOT DONE regardless of conversation context.

> [!IMPORTANT]
> **Docs & stack project-resolved.** This is the **bkit repo itself** — no application stack (no DB / API / UI / deploy). "Schema" = the JSONL ledger + generated-artifact contracts. Tests = Vitest (`*.test.ts` / `*.integration.test.ts`) + bats (`tests/*.bats`); no E2E / @live / fresh-DB tiers exist here (`docs/testing.md` § Tiers). Shipped surface must stay stack/vendor-agnostic (`.agents/rules.md`).

## Context & Goals

`docs/roadmap.md` is maintained by hand today, so it goes stale the moment any issue moves between design → plan → build → debug → ship. #380 automates it as a **two-tier generated artifact**: a cheap deterministic **status tier** rewrites a phase-sectioned board at every workflow close (no LLM turn), and an opus **analysis tier** rewrites a "best next step" (dependency-aware groupings + IDE/model-aware prompt suggestions + periodically-injected audit/ledger candidates) at ship and on-demand.

The canonical design (`docs/plans/202607/380-roadmap-analysis-refresh-design.md`) was amended twice after close and re-reviewed. Two inversions and five re-review plan directives are load-bearing and this plan resolves each as concrete tasks:

- **On-disk-first, tracker-optional sensing** — the board builds from `docs/plans/**` artifacts + folded `status.jsonl` + `deferrals`/`failures.jsonl` + a consumer backlog region, and works under `tracker: none`; a `list_issues` MCP read is additive only when a tracker is wired.
- **Canonical-home inversion** — `docs/roadmap.md` is now the **canonical home for issue state** (phase-sectioned board Backlog → Design → Plan → Build → Debug → Ship); the tracker is a downstream mirror kept in sync from roadmap.md.
- **Directive 1** — status region is a per-FID **UPSERT/merge keyed on FID**, never a blind full-regenerate (build/debug rows are authored on `dev` but their `status.jsonl` lives on `feat/{FID}` and are not re-derivable from `dev`).
- **Directive 2** — `docs/completed.md` → `docs/completed.jsonl` migrates atomically across ALL touchpoints, with a one-time backfill.
- **Directive 3** — reverse tracker-label sync (roadmap → tracker) is orchestrator-mediated, settled-drift-guarded, MCP-only, best-effort.
- **Directive 4** — a canonical reconciliation/recovery pass diffs live `feat/*` (+ open issues when wired) against the board to re-add lost in-flight rows.
- **Directive 5** — build/debug dev-write is fail-open and a **fourth** distinct staging shape; the per-shape CI/bats assertion must cover it.

> Success criteria ONCE in `Acceptance Scenario → Success Criteria`; each runbook task has own `Done when`. Do NOT restate success list here.

**Related Issues:**

- `#260` — Milestone Orchestrator autonomous PM loop (open) — the direct precursor; `bkit-roadmap-fold.sh` IS #260's tick-step-1 sense primitive (build once, #260 consumes the same fold + snapshot).
- `#214` — bkit roadmap (open) — the hand-maintained sequencing reference this feature automates.
- `#209` — Workflow state model: squash-to-dev + persistent `feat/{FID}`, NDJSON `status.jsonl` (closed) — precedent for feat-located writes reaching `dev`, `merge=union`, the Close STRAY-guard, and the `-X ours` conflict class.
- `#80` — `bkit-audit` lens engine (open) — the audit-candidate source injected on the cadence; a generic "run an audit" reference stands in until it lands.
- `#324` — recurring self-healing audit loop / after-ship trigger (open) — shares the post-merge event substrate; noted, not a dependency.
- `#236` — Post-mortem on consumer debug sessions (closed) — source of the stack-independence rule the roadmap surface must respect.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You only need 👤-marked sections** (Acceptance Scenario, Breaking Changes, Open Questions & Assumptions). Agent handles rest.

### Narrative _(inherited from design — do not rewrite)_

As a bkit user, after I close any workflow phase for an issue, `docs/roadmap.md` shows that issue under its current phase with no manual edit, so anyone — human or agent — can see where every open issue stands. The board is built **primarily from on-disk artifacts so it works with no tracker connected** — the `docs/plans/**` design/plan docs, per-FID `status.jsonl`, the `deferrals`/`failures` ledgers, and a consumer-authored "Backlog / Ideas" region at the bottom of `roadmap.md`; when a tracker IS wired the board is additionally enriched with open tracker issues and their status/readiness. When I ship an issue (or run `/bkit-roadmap` on demand), bkit refreshes an opus-authored "best next step": dependency-aware issue groupings, IDE- and model-aware prompt suggestions (including when NOT to use bkit), and periodically-injected audit and backlog candidates, so I always know what to work on next and how to drive bkit optimally.

### Success Criteria _(inherited from design — do not rewrite)_

1. After every workflow close, `docs/roadmap.md`'s phase-sectioned status board reflects each in-flight issue's current phase, **built primarily from on-disk artifacts so it works with NO tracker connected** (`docs/plans/{YYYYMM}/{FID}-{design,plan}.md` presence + folded per-FID `status.jsonl` + open `docs/deferrals.jsonl`/`docs/failures.jsonl`), with no manual edit and no analysis/subagent turn. **When a tracker IS wired** (`github`/`linear`, NOT `none`), the board is additionally enriched with open tracker issues + `bkit:*` phase/readiness via an orchestrator-mediated `list_issues` MCP call (never `gh`/`search_issues`). The tracker read is **additive, never a precondition**: under `tracker: none` it is skipped entirely and the board is still complete.
2. A concurrent close, a merge conflict, or an `-X ours` squash never aborts a close or silently corrupts the board — the status board is deterministically regenerable per-FID (upsert keyed on FID; the `-X ours` non-event holds for the writer's own row).
3. Ship-close and `/bkit-roadmap` produce a refreshed analysis block: a ranked best-next-step, dependency-aware issue groupings, and bkit-usage prompt suggestions, stamped with scan coverage.
4. Ledger/audit integration fires on a deterministic threshold — counting persisted ship-close rows in committed `.bkit/stats.jsonl` (NOT the non-persisted `bkit-counter-bus.sh` helper) plus a staleness-days fallback: open `deferrals.jsonl`/`failures.jsonl` items and a #80 audit candidate surface as grouped next-steps.
5. `docs/roadmap.md` stays consumer-owned — `bkit install` never creates/overwrites it and `bkit check` drift stays clean; only the generator script, the analysis prompt, the utility, the five close-step edits, the `completed.jsonl` migration, and doc-index rows ship.

### Process Sketch _(inherited from design — plan may refine)_

- **WHEN** any workflow reaches Close (after its `bkit:*` transition) **→ THEN** the fold rewrites `docs/roadmap.md`'s `roadmap-status` block by **upserting only the closing FID's row** into its phase section, staged with the phase's existing close commit.
- **WHEN** the squash-merge conflicts on `docs/roadmap.md` (`-X ours`) **→ THEN** the writer re-upserts its own FID row; other rows are untouched, so no halt and no silent loss.
- **WHEN** ship-close runs OR `/bkit-roadmap` is invoked **→ THEN** `@bkit-roadmap-refresh` rewrites the `roadmap-analysis` block (best next step + groupings + prompt suggestions), bounded + coverage-stamped.
- **WHEN** the persisted ship-close count crosses `N` (or the staleness threshold) **→ THEN** the analysis pass injects a #80 audit candidate + open `deferrals`/`failures` items as grouped next-steps, and reconciles tracker labels to the board (settled drift only, when wired).
- **IF** `tracker: none` or the `list_issues` read fails/returns empty **→ THEN** the board is built entirely from on-disk artifacts + the Backlog region (never blank, never gated); every fail-open branch logs `[bkit-roadmap]`.
- **IF** a live in-flight `feat/*` FID is missing from the board **→ THEN** the reconcile pass re-adds/flags it with a `[bkit-roadmap]` line.

### Concrete Example _(plan expands from design)_

**Setup:** A `tracker: none` consumer repo. Two issues in flight: FID `412-export-csv` has `docs/plans/202607/412-export-csv-design.md` + `-plan.md` on disk and is mid-build on `feat/412-export-csv`; FID `418-rate-limit` has only `418-rate-limit-design.md`. A previously-shipped FID `401-login` sits in `docs/completed.jsonl`. The consumer has hand-written two lines under `## Backlog / Ideas` at the bottom of `docs/roadmap.md`.

**Steps:**

1. User closes `/bkit-build 412` → the build close-step fold upserts `412-export-csv` into the **Build** section of `docs/roadmap.md` on `feat/412-export-csv` (via `git add -A`) AND writes the same row to `dev`'s board under the dev-lock (fail-open). System commits the board with the close commit.
2. User closes `/bkit-plan 418` → the plan close-step fold upserts `418-rate-limit` into the **Plan** section on `dev` (STRAY allowlist widened to accept `docs/roadmap.md`); `401-login` is excluded (present in `completed.jsonl`); the two hand-written Backlog lines are untouched.
3. User runs `/bkit-roadmap` → `@bkit-roadmap-refresh` reads the frontier snapshot + `deferrals`/`failures.jsonl` + the Backlog region, rewrites `roadmap-analysis` with a ranked best-next-step (folding the two ideas in), stamps "scanned 2 of 2", and appends a `ROADMAP_SCAN_COVERAGE` counter row.
4. User ships `412` for the 5th time since the last analysis refresh → the cadence fires: a #80 audit candidate + the oldest open `deferrals` item surface as grouped next-steps; `412-export-csv` drops off the board into `completed.jsonl`.

**Outcome:** `docs/roadmap.md` shows every in-flight FID under exactly one phase section with zero manual edits, the Backlog survives every regenerate, shipped FIDs are gone from the board, and the analysis block names the next best step — all with no tracker connected.

### Edge Cases _(plan expands from design's Key Edge Cases)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Concurrent close / `-X ours` squash eats a feat-side roadmap edit | Per-FID upsert re-writes only the closing FID's row; other rows reproducible; non-event. |
| Close staging differs per workflow (FOUR shapes) | design/plan widen STRAY allowlist to `^docs/roadmap\.md$`; build/debug `git add -A` on `feat` PLUS a new dev-lock dev-write; ship scoped `git add -- docs/`. Per-shape CI/bats assertion, never one grep. |
| `tracker: none` or a `list_issues` read that fails/returns empty | Board built entirely from on-disk artifacts + Backlog; MCP skipped under `none`, treated inconclusive (keep prior tracker rows) when a wired read fails; never blank, never gated; `[bkit-roadmap]` stderr on every fail-open branch. |
| Large tracker (200+ open issues) blows analysis `maxTurns`/context | Bounded scan (open + milestone-scoped, paged), coverage-stamped "scanned N of M" + `ROADMAP_SCAN_COVERAGE` counter row; report budget reserved. |
| Human hand-edits the generated status block | Loud "generated — do not edit; edit the tracker / plan artifacts" banner; next upsert reverts the machine region only. |
| Marker blocks missing/mangled on an existing `roadmap.md` | Re-bootstrap in place (re-emit missing marker block[s] + banner) + `[bkit-roadmap]` stderr; never abort the close, never no-op silently. |
| Consumer "Backlog / Ideas" region below the last machine marker | NEVER rewritten by any regenerator; a declared read-input for the analysis tier (promotable into design; may suggest filing as an issue when wired). |
| Lost/corrupted in-flight phase row (roadmap not fully re-derivable) | Reconcile pass diffs live `feat/*` (+ open issues when wired) vs the board, re-adds/flags missing rows with `[bkit-roadmap]`. |
| `completed.jsonl` empty on rollout day | One-time backfill of existing `completed.md` entries → `completed.jsonl`; else exclude-completed reads an empty ledger and every historically-shipped FID reappears as active. |
| Ship verdict reader misses the FID | `UPDATE_DOCS_VERDICT` reads `completed.jsonl` (not `completed.md`); backfill + reader switch land in the same change so no ship is blocked. |
| Backlog region as untrusted analysis input | Analysis prompt treats the Backlog region as DATA, not instructions (prompt-injection surface); folds ideas into ranking, never executes them. |
| build/debug dev-write fails (lock held, offline) | Fail-open: the dev-located roadmap write never gates the close; `[bkit-roadmap]` on every fail branch; feat-side board still written. |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task. Tiers per `docs/testing.md` § Tiers (bkit has Unit `*.test.ts`, Integration `*.integration.test.ts`, Shell `tests/*.bats`, Static — no E2E/@live/fresh-DB). Boundary rows reach the real boundary (real `jq`/`sh`, real `fs`, real `git`) and assert a ground-truth signal, never a mock at the boundary.

**Tier key** — use these exact tier names in the `Type` column (they MUST match `docs/testing.md`); pick the lowest tier that actually exercises the behaviour:

<!-- prettier-ignore -->
| Tier | Use for | Example behaviour |
| --- | --- | --- |
| **Static** | every change — type / lint / format / prose / drift / actionlint / `bkit check` (global gate, not a per-feature row) | `tsc` + lint + `bkit check` pass on the changed files |
| **Unit (Vitest)** | pure function / single module / file-content audit, no real subprocess | codec accepts a new `kind`; prompt file has no hardcoded model IDs |
| **Integration (Vitest)** | crosses a LOCAL boundary — real `fs` / real `git` / spawns `bkit` via `tsx` — no mocks at the boundary | backfill writes `completed.jsonl` from a temp `completed.md`; reconcile over a real `feat/*` branch |
| **Shell (bats)** | shell/jq logic sourced from `.bkit/scripts/*.sh` (real `jq`, cross-process) | the fold projects a board from a real `status.jsonl` fixture |

One row per behaviour:

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| Fold builds the phase-sectioned board from on-disk artifacts under `tracker: none` (no MCP call attempted) | Shell (bats) | `tests/roadmap-fold.bats` |
| Fold per-FID upsert: a later fold preserves an existing build/debug row and never blind-reverts it | Shell (bats) | `tests/roadmap-fold.bats` |
| Fold excludes FIDs present in `completed.jsonl` from the board | Shell (bats) | `tests/roadmap-fold.bats` |
| Fold fail-open: malformed/empty input + absent tracker → exit 0 + `[bkit-roadmap]` stderr, board never blank | Shell (bats) | `tests/roadmap-fold.bats` |
| Bootstrap: absent `roadmap.md` → created with two markers + banner + `## Backlog / Ideas`; mangled markers → re-emitted in place | Shell (bats) | `tests/roadmap-fold.bats` |
| Backlog region below the last machine marker survives a regenerate (bytes unchanged) | Shell (bats) | `tests/roadmap-fold.bats` |
| `bkit-roadmap-fold.sh` sources `BKIT_STATUS_FOLD` (single-source) with the fail-closed `\|\| { … exit 2; }` guard; template copy exists and repo copy byte-matches | Unit (Vitest) | `.bkit/src/bkit-roadmap-fold.test.ts` |
| `completed.jsonl` new `kind: "completed"` round-trips through the telemetry codec (accepted by `validate`, correct identity tuple) | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| Backfill: existing `completed.md` entries → `completed.jsonl` rows; idempotent (re-run adds no duplicate) | Integration (Vitest) | `.bkit/src/bkit-completed-backfill.integration.test.ts` |
| Ship verdict reader resolves `UPDATE_DOCS_VERDICT=PASS` from `completed.jsonl` (not `completed.md`) when the FID is present | Integration (Vitest) | `.bkit/src/bkit-ship-verdict.integration.test.ts` |
| Per-workflow-shape staging: design/plan allowlist includes `^docs/roadmap\.md$`; build/debug `git add -A`; ship scoped `git add -- docs/`; build/debug carry the dev-lock dev-write (4th shape) | Integration (Vitest, boundary: workflow files) | `.bkit/src/bkit-roadmap-staging.integration.test.ts` |
| `@bkit-roadmap-refresh` prompt writes ONLY the `roadmap-analysis` marker block and contains no hardcoded model IDs / IDE names | Unit (Vitest) | `.bkit/src/bkit-roadmap-refresh-prompt.test.ts` |
| `ROADMAP_SCAN_COVERAGE` counter row conforms to the `.bkit/jsonl.md` counter schema (`counterSource: "model-self-report"`, full envelope) | Unit (Vitest) | `.bkit/src/bkit-roadmap-refresh-prompt.test.ts` |
| Cadence: counts persisted ship-close `outcome` rows in `.bkit/stats.jsonl`, fires at `N`, staleness fallback measured from the `roadmap-analysis` header `ts` | Shell (bats) | `tests/roadmap-cadence.bats` |
| Reverse tracker sync step is MCP-only, no-op under `tracker: none`, best-effort (never gates the close), settled-drift-guarded | Integration (Vitest, boundary: workflow files) | `.bkit/src/bkit-roadmap-sync.integration.test.ts` |
| Reconcile/recovery: diff live `feat/*` (+ open issues when wired) vs the board re-adds a missing in-flight row + emits `[bkit-roadmap]` | Integration (Vitest, boundary: git branches) | `.bkit/src/bkit-roadmap-reconcile.integration.test.ts` |
| `/bkit-roadmap` utility invokes the mechanical fold + `@bkit-roadmap-refresh`; renders to all three hosts | Unit (Vitest) | `.bkit/src/bkit-roadmap-utility.test.ts` |
| `docs/roadmap.md` consumer-owned: `bkit install` never creates/overwrites it and `bkit check` drift stays clean | Integration (Vitest) | `.bkit/src/bkit-install.integration.test.ts` (new scenario) |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below.

**Proposed names (new artifacts):**

- `docs/roadmap.md` — consumer-owned generated artifact (peer of `deferrals.jsonl`); phase-sectioned board Backlog → Design → Plan → Build → Debug → Ship.
- Marker blocks: `<!-- bkit:roadmap-status start/end -->` and `<!-- bkit:roadmap-analysis start/end -->`; consumer region heading `## Backlog / Ideas` below the last machine marker.
- `.bkit/templates/.bkit/scripts/bkit-roadmap-fold.sh` (+ installed copy `.bkit/scripts/bkit-roadmap-fold.sh`) — sourced fold helper exporting `BKIT_ROADMAP_FOLD`.
- `.bkit/prompts/bkit-roadmap-refresh.md` → renders `@bkit-roadmap-refresh` (opus leaf).
- `.bkit/workflows/bkit-roadmap.md` → renders `/bkit-roadmap` utility command.
- `docs/completed.jsonl` — new ledger (peer of `deferrals`/`failures.jsonl`), new telemetry `kind: "completed"`.
- Telemetry names: `counterName: "ROADMAP_SCAN_COVERAGE"`; observability prefix `[bkit-roadmap]`.

> [!WARNING]
> **Migration — `docs/completed.md` → `docs/completed.jsonl` (Directive 2).** Not a removal — `completed.md` is RETAINED as the human-readable view. What changes: the **machine-readable source of truth** for "is this FID shipped?" moves to `completed.jsonl`. All touchpoints migrate in ONE change (else a partial migration blocks every ship at `bkit-ship.md` verdict step):
>
> 1. `@bkit-ship-update-docs` appends a `completed.jsonl` row (continues appending the `completed.md` entry too, so the human view is preserved).
> 2. `bkit-ship.md` verdict reader (currently `grep -c … docs/completed.md`, line ~902 / mirrors line ~757/754) switches to `completed.jsonl`.
> 3. `docs/completed.md` managed-block header gains a one-line "machine source: `docs/completed.jsonl`" note → its `.bkit/version` `canonicalHashes` entry is regenerated by `bkit upgrade` (it IS drift-gated).
> 4. One-time backfill of existing `completed.md` entries into `completed.jsonl` (idempotent).

> [!IMPORTANT]
> **build/debug now write `docs/roadmap.md` status to `dev` (Addendum C).** build and debug close steps gain a bounded dev-located roadmap write under ship's dev-lock idiom (fail-open) — the first time these two workflows touch `dev`. This is additive and best-effort; it never gates the close. The prior deferral `380-dev-located-roadmap-status-write-for-build-debug-closes` (`docs/deferrals.jsonl`) is thereby SUPERSEDED (pulled into scope) — mark it `CLOSED` in the same change.

No exported TS symbol signatures change (the codec gains a union member, not a breaking change). No consumer command is renamed. `docs/roadmap.md` is net-new and consumer-owned.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Open Questions & Assumptions — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Unknowns needing a decision, and assumptions this plan relies on.

- **Open question (cadence numbers):** `N` ship-cycles = **5** proposed; staleness-days fallback = **14** proposed (measured from the `roadmap-analysis` header `ts`). → Confirm both values, or accept the defaults.
- **Open question (board scope):** status board carries **open + in-flight FIDs only**; shipped FIDs drop off into `completed.jsonl`; closed/abandoned tracker issues are not shown. → Confirm the drop-off policy.
- **Open question (`completed.md` fate):** proposal = **retain** `completed.md` as human-readable (dual-write) rather than generate it from the ledger — lowest-risk, no data loss, backward-readable. → Confirm retain-vs-generate.
- **Open question (`completed` codec scope):** add `kind: "completed"` to the `bkit-telemetry.ts` codec `validate`/identity so readers accept it; `bkit harvest`/`bkit analysis` ingestion of `completed.jsonl` is **out of scope** (no reader consumes it yet). → Confirm harvest stays out.
- **Assumption:** the no-concurrent-workflows-per-clone constraint holds → if violated, two closes racing `docs/roadmap.md` rely on per-FID upsert + `-X ours` tolerance (designed-for, not designed-around).
- **Assumption:** `.bkit/stats.jsonl` carries persisted ship-close `outcome` rows (`workflow == "ship"`) — confirmed present in the ship close block → if the schema drifts, the cadence count reads 0 and never fires (fail-safe, not fail-dangerous).
- **Assumption:** shipped roadmap/analysis text stays stack/vendor-agnostic and cites no tracker-internal refs (`BAR-`/`KN-`/Linear ids) → if violated, the shipped-surface rule reds `slop`/review.
- **Assumption:** #80 lens engine is NOT landed → the cadence injects a generic "run an audit" next-step referencing the audit prompt family, never a hardcoded stack lens.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

**Selection rule:** pick the approach with the best quality-of-end-state, NOT the smallest diff.

Chosen (from the design, carried into the plan):

- **Two-tier, two-marker-block generated artifact** inside one consumer-owned file — the deterministic status writer and the opus analysis writer own physically-separate marker regions, so they can never clobber each other, and the Backlog lives below both markers so it is never regenerated.
- **Per-FID UPSERT** for the status region (Directive 1) — NOT a blind full-regenerate. A full rebuild from dev-visible sources would silently revert build/debug rows (their `status.jsonl` lives on `feat/{FID}`). The upsert keeps `-X ours` a non-event for the writer's own row.
- **On-disk-first, tracker-additive** sensing — the board builds under `tracker: none`; `list_issues` enriches only when wired.
- **`completed.jsonl` as the machine-readable shipped-FID source** (Directive 2) with `completed.md` retained human-readable and dual-written.

Rejected paths (design § Approaches Considered):

- **Blind full-regenerate of the status region** — reverts build/debug rows not re-derivable from `dev`; rejected in favour of per-FID upsert.
- **Persisted `roadmap.jsonl` event log** — duplicates `status.jsonl`'s phase events + adds compaction machinery + contests "must be `docs/roadmap.md`"; deferred to #260 (see Out of Scope / `docs/deferrals.jsonl` key `380-persisted-frontier-snapshot-event-log-for-260`).
- **sed-edited single unstructured file** — races the shared file with no `merge=union` (repeats #209 Defect A).
- **Tracker `list_issues` as the required/primary source** — breaks `tracker: none`; rejected for on-disk-first.
- **Fold the analysis into `@bkit-ship-update-docs`** — couples it to ship-only doc work and blocks utility reuse; kept as a clean reusable leaf.
- **`search_issues` for the tracker read** — silently returns 0 on private repos; forbidden. Use `list_issues`, treat 0/empty as inconclusive.

Future phases: promote the fold's frontier snapshot to #260's tick-step-1; when #260 needs durable cross-tick history, persist the snapshot (deferred).

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Persisted `roadmap.jsonl` event log / durable cross-tick frontier history | Genuinely additive; `status.jsonl` already holds per-FID phase history; not required by any Success Criterion | `#260` — already mirrored in `docs/deferrals.jsonl` key `380-persisted-frontier-snapshot-event-log-for-260` (OPEN) |
| #260 autonomous actuator / sensing contract / standalone sensing schema | Speculative against #260's unbuilt tick (YAGNI); the leaf/fold boundary preserves the evolution path | `#260` |
| #80 lens engine (the concrete audit lenses) | Depends on #80 landing; cadence injects a generic "run an audit" reference until then | `#80` |
| `bkit harvest` / `bkit analysis` ingestion of `completed.jsonl` | No reader consumes `completed.jsonl` yet; codec-acceptance is enough | Follow-up if a reader needs shipped-FID rollups |
| Generating `docs/completed.md` from the ledger | Retain-and-dual-write is lower risk; conversion is additive | Follow-up if the dual-write proves burdensome |

> [!CAUTION]
> **Default = in-scope.** Each row above is genuinely-additive, NOT required by a Success Criterion / Acceptance row / design section. The `380-persisted-frontier-snapshot-event-log-for-260` deferral is already present in `docs/deferrals.jsonl`; do NOT duplicate it. The `380-dev-located-roadmap-status-write-for-build-debug-closes` deferral is now IN SCOPE (Addendum C) and must be marked `CLOSED`, not left as a deferral.

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| `380-dev-located-roadmap-status-write-for-build-debug-closes` | `docs/deferrals.jsonl` | build/debug close staging (WS-2 dev-write) | Fold in — Addendum C pulls it into scope; close the deferral |
| `380-persisted-frontier-snapshot-event-log-for-260` | `docs/deferrals.jsonl` | the frontier snapshot shape (WS-1) | Keep deferred — build the in-memory fold only |
| `#260` tick-step-1 sensing | related issue | `bkit-roadmap-fold.sh` (WS-1) | Keep deferred — build the fold as the shared primitive; do not build #260's actuator |

> [!CAUTION]
> **Candidates, not scope.** Only the first row folds in (design Addendum C decision); the rest stay deferred.

## Security & Privacy

> Reference: `docs/security.md`. bkit ships no runtime server; observability is CLI stdout/stderr (`docs/observability.md`).

- [ ] **User input** — the consumer "Backlog / Ideas" region is free-form text READ by `@bkit-roadmap-refresh` as a prompt input. Treat it as **untrusted data, not instructions** (prompt-injection surface): fold ideas into the ranking, never execute embedded directives. The fold reads it as bytes only (never `eval`/expand).
- [ ] **Tracker MCP read** — `list_issues` is read-only, best-effort, and only when a tracker is wired; reuses the existing configured tracker MCP credential (no new secret). Never `gh`/`search_issues`.
- [ ] **Tracker MCP write (reverse sync)** — label reconciliation writes via the configured tracker MCP only (`.agents/rules.md` § Tracker MCP), best-effort, idempotent, never gates. No new scope beyond existing label-write.
- [ ] **PII** — none. Roadmap rows carry FIDs + issue titles + phase only; no user data. Shipped text stays stack/vendor-agnostic, no `BAR-`/`KN-`/Linear internal ids.

_No new routes, DB writes, or secrets._

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core (always verify)

- [ ] **Package Management:** No new npm deps expected (jq + shell + Vitest + bats already present). Confirm `pnpm-lock.yaml` unchanged.
- [ ] **Dependency Versions:** `pnpm --version`, `npx tsc --version`, `jq --version`, `npx bats --version` present; the fold + tests depend only on `jq` + POSIX `sh` (already required by `bkit-status-fold.sh`).
- [ ] **Existing-solution search (reuse over duplicate):** `bkit-roadmap-fold.sh` SOURCES `BKIT_STATUS_FOLD` from `bkit-status-fold.sh` verbatim (never re-inline — asserted by `bkit-status-fold.test.ts` pattern); analysis reuses `plan-complexity-check` (when-NOT-to-use) + `design-organise` grouping seam; cadence reuses the persisted `.bkit/stats.jsonl` `outcome` rows (NOT `bkit-counter-bus.sh`); utility mirrors the `bkit-worktree-*` workflow shape; `completed.jsonl` reuses the `.bkit/jsonl.md` envelope + `bkit-telemetry.ts` codec.
- [ ] **User Context:** read/write access to `.bkit/**`, `docs/**`, `.claude/**`, `.cursor/**`, `.opencode/**`, `tests/**` confirmed.
- [ ] **Pending Blockers:** query the tracker for open `blocker`-labelled issues touching the five workflows / ship prompt.
- [ ] **Project Context:** `docs/knowledge.jsonl` + `docs/decisions.jsonl` read for: `-X ours` conflict class (#209), `list_issues`-not-`search_issues`, the dev-lock idiom, `bkit install` batch-at-session-end, mirror not drift-gated.
- [ ] **Testing & Quality:** strategy aligns with `docs/testing.md` § Tiers (Unit/Integration/Shell-bats; no E2E/@live/fresh-DB) + § Counter derivation test coverage (bats pattern for shell logic over a real `status.jsonl`).
- [ ] **Prerequisite Plans:** none — WS-1 has no upstream plan dependency.

### Conditional (verify only when applicable)

- [ ] **Observability** _(new log points)_: the new `[bkit-roadmap]` prefix is a NEW module prefix → add it to `docs/observability.md` (one-prefix-per-subsystem rule). `[bkit-analysis]` (cadence advance/fire) + `[bkit-telemetry]` (counter append) already exist — reuse.
- [ ] **Architecture & Cross-provider** _(new workflow + agent + script)_: every edited `.bkit/workflows/*.md` + new `.bkit/prompts/bkit-roadmap-refresh.md` + `.bkit/workflows/bkit-roadmap.md` require mirror regen to `.claude/`, `.cursor/`, `.opencode/` (force-overwritten, NOT drift-gated — batch at session end, WS-6).

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes. **DO NOT stop for user permission.** Once saved, proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` (checkbox `[x]`).
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` (checkbox `[x]`).
- [ ] **Open Questions confirmed:** Human confirmed `👤 Open Questions & Assumptions` (checkbox `[x]`).
- [ ] **Security & Privacy checked:** All applicable rows verified.
- [ ] **Gate 1 - Verified:** All Core items checked; all applicable Conditional items checked.

## Data Schema Integration

bkit has no database. The "schema" is the JSONL-ledger + generated-artifact contracts. **Invariant conformance:** every write path is best-effort append (`|| echo "[bkit-…] append failed"`) that exits 0 and never gates a workflow; the ship verdict reader is the one path that must not silently pass — its migration to `completed.jsonl` is atomic across all touchpoints so a miss FAILs loudly, never green-with-omission.

### Data Schema Usage (Inputs & Outputs)

- **Input (Read):** `docs/plans/{YYYYMM}/{FID}-{design,plan}.md` presence (phase-reached); per-FID `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (folded via `BKIT_STATUS_FOLD`); `docs/completed.jsonl` (exclude-completed); `docs/deferrals.jsonl` + `docs/failures.jsonl` (backlog candidates, ranked severity then age); `.bkit/stats.jsonl` `outcome` rows where `workflow=="ship"` (cadence count); the `## Backlog / Ideas` region of `docs/roadmap.md` (analysis input); tracker `list_issues` rows (only when wired); the #202 inline-marker tracker mode.
- **Output (Write):** `docs/roadmap.md` `roadmap-status` block (per-FID upsert); `docs/roadmap.md` `roadmap-analysis` block; `docs/completed.jsonl` (one `completed` row per ship); `.bkit/stats.jsonl` `ROADMAP_SCAN_COVERAGE` counter row; tracker `bkit:*` labels (reverse sync, when wired).

### Data Schema Changes

- **ADD** ledger `docs/completed.jsonl` — new telemetry `kind: "completed"`. Row = envelope + `{ key: "{FID}", summary: "{title}", references: ["{plan path}", "{PR}", "{sha}", "{tracker id}"] }`. Identity tuple `(kind, repo, key)` (uses the existing key-based `identity()` default; no `severity`). Codec: extend `TelemetryKind` union + discriminated payload union + `VALID_KINDS` + minimal `validate` payload check in `.bkit/src/bkit-telemetry.ts`.
- **ADD** counter name `ROADMAP_SCAN_COVERAGE` (existing `counter` kind; `counterSource: "model-self-report"`; `counterValue` = issues scanned or scanned/total ×100).
- **ADD** generated artifact `docs/roadmap.md` — header stamp; `roadmap-status` machine block (phase sections Backlog → Design → Plan → Build → Debug → Ship; per-section FID rows `FID | Title | Milestone | Blocked-by | Last-transition ts`, FID is the universal key); `roadmap-analysis` machine block; `## Backlog / Ideas` consumer region below the last machine marker. No `bkit install`-managed block. `merge=union` in `.gitattributes` (+ templates copy).
- **ADD** in-memory frontier snapshot (fold output, NOT persisted): array of `{ id, phase, milestone, labels?, blockedBy?, lastTransitionTs, source }`, `source ∈ {"on-disk","tracker"}`.
- **NO** change to `status.jsonl` schema — the fold is the contract.

## Architecture & Component Changes

**CRITICAL:** shell/jq scripts are edited in `.bkit/templates/.bkit/scripts/` (SSOT); `bkit install` renders the repo copy `.bkit/scripts/` + regenerates `.bkit/version` hashes. Workflow/prompt SSOT is `.bkit/workflows/*.md` + `.bkit/prompts/*.md`; `bkit install` renders host mirrors (`.claude/`, `.cursor/`, `.opencode/`). Every `[NEW]` reuses an existing pattern (justified inline).

### Roadmap fold foundation (WS-1)

#### [NEW] `.bkit/templates/.bkit/scripts/bkit-roadmap-fold.sh`

- Sourced helper (sibling of `bkit-status-fold.sh`) exporting `BKIT_ROADMAP_FOLD` + shell functions: bootstrap/self-heal `docs/roadmap.md`; the deterministic jq projection `(on-disk plan-artifact scan + folded status.jsonl [+ tracker rows when wired]) → phase-sectioned board + frontier snapshot`; a **per-FID upsert** into the `roadmap-status` block (rewrite ONLY the closing FID's row within its phase section, never a blind whole-block rebuild).
- SOURCES `BKIT_STATUS_FOLD` from `bkit-status-fold.sh` verbatim (single-source #58 reducer) with the fail-closed `|| { echo "[bkit-telemetry] …" >&2; exit 2; }` guard — asserted by `bkit-roadmap-fold.test.ts`.
- On-disk-first: per-FID phase from `{FID}-design.md`/`{FID}-plan.md` presence refined by the folded `status.jsonl`; excludes FIDs present in `docs/completed.jsonl` (Addendum E, depends on Directive 2 backfill); tracker rows merged only when the #202 inline-marker mode is `github`/`linear`.
- Fail-open: every branch (empty/malformed input, absent snapshot, tracker rows absent, read failure, 0/empty result, best-effort skip) emits a `[bkit-roadmap]` stderr line and never blanks the board. Reason it can't be folded into `bkit-status-fold.sh`: that reducer is a pure `status.jsonl` fold with a byte/md5-pinned blob; roadmap adds on-disk scan + tracker merge + markdown rendering — a separate, composed helper.

#### [NEW] `docs/roadmap.md` (generated at runtime, NOT shipped by install)

- Consumer-owned generated artifact; bootstrapped by the fold on first close (empty machine blocks + banner + empty `## Backlog / Ideas`). Never written by `bkit install`. Documented once in `.agents/docs.md` Project Documents (below `bkit:end`).

#### [MODIFY] `docs/completed.md` + `.bkit/templates/docs/completed.md`

- **Existence Check:** both exist. Add a one-line "machine source: `docs/completed.jsonl`" note to the managed-block header → `.bkit/version` `canonicalHashes["docs/completed.md"]` regenerated by `bkit upgrade` (WS-6). `completed.md` stays human-readable; the ship writer dual-writes.

#### [NEW] `docs/completed.jsonl` + `.bkit/templates/docs/completed.jsonl`

- Machine-readable shipped-FID ledger (peer of `deferrals`/`failures.jsonl`). Template seed = empty file. `merge=union` in `.gitattributes` (+ templates copy). No managed block, NOT hash-gated (like `deferrals.jsonl`).

#### [MODIFY] `.bkit/src/bkit-telemetry.ts`

- **Existence Check:** exists. Add `"completed"` to `TelemetryKind` + `VALID_KINDS` + the discriminated `TelemetryEvent` union (`CompletedPayload = { key; summary; references? }`) + a minimal `validate` payload branch. `identity()` needs no case (falls through to the key-based default). Blast radius: `VALID_KINDS` consumers (readers) — greppable; no signature change.

#### [MODIFY] `.agents/docs.md` + `.bkit/templates/.agents/docs.md`

- Add a `docs/completed.jsonl` row to the Universal Documents table (Ship `●`); add a `docs/roadmap.md` row to the **Project Documents** table (consumer-owned). Both mirrored in the template copy.

#### [MODIFY] `.gitattributes` + `.bkit/templates/.gitattributes`

- Add `docs/completed.jsonl merge=union` and `docs/roadmap.md merge=union` (roadmap in the append-safe ledger block; both files are append/upsert-only-safe).

#### [NEW] `.bkit/scripts/bkit-completed-backfill.sh` (or a one-time `bkit` task) — Directive 2

- One-time idempotent backfill: parse existing `docs/completed.md` entries (`## Title (date)` + `Artifacts:` FID path) → append a `completed` row per shipped FID to `docs/completed.jsonl`, skipping FIDs already present. Runs once at rollout (WS-6 dogfood step). Reuses the `.bkit/jsonl.md` write idiom.

### Mechanical status tier (WS-2)

#### [MODIFY] `.bkit/workflows/bkit-design.md`, `bkit-plan.md`

- At the Close step (beside the existing `status.jsonl` commit): source `bkit-roadmap-fold.sh`, upsert the closing FID's row into `roadmap-status` on `dev`. **Widen the STRAY allowlist** `grep -vE '^docs/plans/|^docs/(deferrals|decisions|failures)\.jsonl$|^\.bkit/friction\.jsonl$'` to add `^docs/roadmap\.md$` (design line ~790; plan line ~851). Fail-open `[bkit-roadmap]`.

#### [MODIFY] `.bkit/workflows/bkit-build.md`, `bkit-debug.md`

- At the Close step: upsert the FID's row on `feat/{FID}` (swept by the existing `git add -A`) AND add a bounded **dev-located roadmap write under the dev-lock idiom** (Addendum C; reuse ship's `.bkit/.dev.lock` acquire/trap/`git checkout dev`/FF/commit/push shape) — the FOURTH staging shape (Directive 5). Fail-open: the dev-write never gates the close; `[bkit-roadmap]` on every fail branch (lock held, offline, MCP absent).

#### [MODIFY] `.bkit/workflows/bkit-ship.md`

- At close, upsert the FID's row (dropped to `completed.jsonl` on ship); staged by the existing scoped `git add -- docs/`. See WS-3/WS-4 for the analysis + cadence additions in Step 10.

### Analysis tier (WS-3)

#### [NEW] `.bkit/prompts/bkit-roadmap-refresh.md` → `@bkit-roadmap-refresh`

- Opus leaf writing ONLY the `roadmap-analysis` block. Reads the frontier snapshot + `.agents/docs.md` + `deferrals`/`failures.jsonl` + the `## Backlog / Ideas` region (as untrusted data). Writes: ranked best-next-step (folding ideas in), dependency-aware groupings (reuse `design-organise` seam), prompt suggestions (bkit-optimal usage; when-NOT-to-use via `plan-complexity-check`; IDE from install config; model recommendations by doctrine-reference; opus-plans/sonnet-executes shape). No hardcoded model IDs / IDE names. Bounded scan, report budget reserved, "scanned N of M" stamp + a `ROADMAP_SCAN_COVERAGE` counter row (`[bkit-telemetry]` fail-open). Reuses the `@bkit-ship-update-docs`/`@bkit-ship-summary` leaf frontmatter shape.

#### [MODIFY] `.bkit/workflows/bkit-ship.md` Step 10

- Add `@bkit-roadmap-refresh` as the third parallel subagent (alongside `@bkit-ship-update-docs` ‖ `@bkit-ship-summary`); its `roadmap-analysis` write precedes the existing Step 10 `git add -- docs/ && git commit … -- docs/` (line ~916), so it is committed, never left written-but-uncommitted. Add its artifact to the Gate-10 assertions.

### Cadence + reverse sync + reconcile (WS-4)

#### [MODIFY] `.bkit/workflows/bkit-ship.md` (cadence step)

- Count persisted ship-close `outcome` rows in committed `.bkit/stats.jsonl` (`workflow=="ship"`) — NOT `bkit-counter-bus.sh` (non-persisted, per-FID). Fire when the count crosses `N` (=5) OR the staleness-days (=14) since the `roadmap-analysis` header `ts`. On fire: inject a #80 audit candidate (generic "run an audit" until #80 lands) + open `deferrals`/`failures` items (severity then age) as grouped next-steps into the analysis pass; `[bkit-analysis]` line on counter-advance AND injection-fire.
- **Reverse tracker sync (Directive 3):** orchestrator-mediated (leaf prompts have no tracker MCP tools), MCP-only, best-effort, idempotent, no-op under `tracker: none`; reconcile ONLY settled drift (skip an issue whose phase is actively transitioning / has a live `feat/{FID}`); `[bkit-roadmap]` on fire/skip/conflict.
- **Reconcile/recovery (Directive 4):** diff live `feat/*` branches (+ open `list_issues` when wired) against the board; re-add or flag any missing in-flight FID row; `[bkit-roadmap]` line.

### On-demand utility (WS-5)

#### [NEW] `.bkit/workflows/bkit-roadmap.md` → `/bkit-roadmap`

- Utility workflow mirroring the `bkit-worktree-*` shape (`description:` frontmatter, numbered steps): run the mechanical fold (WS-1/WS-2 path) + invoke `@bkit-roadmap-refresh` (WS-3), refreshing both blocks outside the close cycle.

### Cross-provider + telemetry docs (WS-6)

#### [MODIFY] host mirrors + `.bkit/version`

- `bkit install` regenerates `.claude/commands/`, `.cursor/commands/`, `.opencode/command/` for the five edited workflows + new `/bkit-roadmap`; `.claude/agents/`, `.cursor/agents/`, `.opencode/agent/` for `@bkit-roadmap-refresh`; `.bkit/scripts/bkit-roadmap-fold.sh` from templates; `.bkit/version` `canonicalHashes` for the new script + changed `completed.md`. Batch at session end.

### Cron Jobs & Scheduled Tasks

None — all triggers are workflow-close-driven or on-demand (`/bkit-roadmap`); no scheduler.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `docs/completed.md` grep as the shipped-FID source of truth | `docs/completed.jsonl` (`kind: "completed"`) | RETAIN-WITH-REASON (`completed.md` kept human-readable, dual-written) | Machine source moves to the ledger; the markdown stays as the human view — atomic migration of the reader + writer + hash-gate + backfill in one change (Directive 2). No file deleted. |
| `docs/deferrals.jsonl` key `380-dev-located-roadmap-status-write-for-build-debug-closes` (OPEN deferral) | build/debug dev-lock roadmap write (Addendum C) | CLOSE (append `status:"CLOSED"` row) | Pulled into scope; the deferred feature is now built. |

> [!CAUTION]
> No source file is DELETED. `completed.md` is retained by explicit design decision (Addendum G: "kept or generated"). The deferral closure is a same-`key` ledger append, not a deletion.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/observability.md` | Add the `[bkit-roadmap]` prefix section (fold + hook + reconcile + reverse-sync fail-open lines); note the module prefix in the one-per-subsystem list. |
| `docs/decisions.jsonl` | Append `decision` rows (via `@bkit-build-challenge-remediate`/`@bkit-plan-generate` idiom, `.bkit/jsonl.md` format): `roadmap.md canonical home for issue state`; `roadmap-status is a per-FID upsert not a full regenerate`; `completed.jsonl as machine-readable shipped-FID ledger`. Check existing entries first (none present). |
| `docs/knowledge.jsonl` | Append `knowledge` rows: per-FID-upsert-not-regenerate gotcha (build/debug rows not re-derivable from `dev`); backfill-or-empty-ledger trap; `list_issues`-not-`search_issues`; build/debug dev-write is a 4th staging shape. |
| `docs/testing.md` | Add `tests/roadmap-fold.bats`, `tests/roadmap-cadence.bats`, and the new `*.test.ts`/`*.integration.test.ts` to the Key test files / bats tables. |
| `.agents/docs.md` | New `docs/completed.jsonl` (Universal) + `docs/roadmap.md` (Project Documents) rows. |
| `.bkit/jsonl.md` | Add `kind: "completed"` to § Ledgers & Writers (`docs/completed.jsonl`, written by `@bkit-ship-update-docs`), § Per-Kind Fields, § Identity/Dedup; note `ROADMAP_SCAN_COVERAGE` as a `counterName`. |
| `docs/completed.md` | One-line "machine source: `docs/completed.jsonl`" note in the managed-block header. |
| `.gitattributes` (+ `.bkit/templates/.gitattributes`) | `docs/completed.jsonl merge=union`; `docs/roadmap.md merge=union`. |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **Code** | `git revert {COMMIT}` — all changes are additive files + workflow-step edits | No DB. Reverting restores the `completed.md`-grep verdict reader + drops `docs/roadmap.md` generation. |
| **Data (`completed.jsonl`)** | Delete `docs/completed.jsonl`; revert the ship reader to `completed.md`. `completed.md` was dual-written throughout, so no shipped-FID history is lost | Backfill is idempotent; re-running after revert is safe. |
| **Mirrors** | `bkit install` re-renders host mirrors from the reverted SSOT | Mirrors are force-overwritten, not drift-gated — re-run install after any revert. |
| **Risk window** | None — no deploy, no migration apply | The only cross-file coupling is the `completed.md → completed.jsonl` touchpoint set; land it as one commit so revert is atomic. |

_Code-only — `git revert` sufficient; re-run `bkit install` to re-render mirrors._

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work runbook autonomously. No pause for user permission at any Gate.
> **Blockers:** Task incomplete → create tracker issue (label `blocker`) via configured tracker MCP before stopping.
> **Never drop work silently:** deferrals → `docs/deferrals.jsonl`, bugs → `docs/failures.jsonl` (`.bkit/jsonl.md` format; check existing entries first).
> **Ordering:** schema/foundation → mechanical → analysis → cadence → utility → mirror-regen. Each task fully complete (verification + checkbox) before the next.

> Every task carries a `**Done when:**` line — terse, testable, codebase-verifiable. Test-bearing `Done when` entries map to exactly one `Derived Test Matrix` row.

### Foundation (WS-1)

- [ ] **Task 1 — `completed.jsonl` schema + codec.** Add `kind: "completed"` (payload `{ key, summary, references? }`) to `.bkit/src/bkit-telemetry.ts` (`TelemetryKind` + `VALID_KINDS` + union + `validate`); seed empty `docs/completed.jsonl` + `.bkit/templates/docs/completed.jsonl`; add `docs/completed.jsonl merge=union` to `.gitattributes` (+ templates copy). **Done when:** `bkit-telemetry.test.ts` proves a `completed` row is accepted by `validate` with identity `(kind, repo, key)` and an unknown kind still rejected (matrix row 8); `.gitattributes` carries the union line.
- [ ] **Task 2 — one-time backfill.** Add `.bkit/scripts/bkit-completed-backfill.sh` (+ template) parsing existing `docs/completed.md` FIDs → idempotent `completed` rows in `docs/completed.jsonl`. **Done when:** `bkit-completed-backfill.integration.test.ts` (real `fs`, temp `completed.md`) shows every entry becomes a row and a second run adds no duplicate (matrix row 9).
- [ ] **Task 3 — `bkit-roadmap-fold.sh`.** Create `.bkit/templates/.bkit/scripts/bkit-roadmap-fold.sh`: export `BKIT_ROADMAP_FOLD`; source `BKIT_STATUS_FOLD` with fail-closed guard; on-disk-first scan (design/plan doc presence + `status.jsonl` fold), exclude-completed via `completed.jsonl`, tracker rows merged only when wired; **per-FID upsert** into `roadmap-status`; bootstrap/self-heal; fail-open `[bkit-roadmap]` on every branch. **Done when:** `bkit-roadmap-fold.test.ts` proves it sources `bkit-status-fold.sh` with the guard + template/repo byte-match (matrix row 7); `tests/roadmap-fold.bats` proves on-disk board under `tracker: none` (row 1), per-FID upsert preserves a build/debug row (row 2), exclude-completed (row 3), fail-open exit 0 + `[bkit-roadmap]` non-blank (row 4), bootstrap + self-heal (row 5), Backlog region byte-unchanged after regenerate (row 6).
- [ ] **Task 4 — doc-index + roadmap.md contract.** Add `docs/completed.jsonl` (Universal) + `docs/roadmap.md` (Project Documents) rows to `.agents/docs.md` (+ template); add `docs/roadmap.md merge=union`; document the two marker blocks + `## Backlog / Ideas` region + banner in the fold's bootstrap. **Done when:** `.agents/docs.md` carries both rows; `bkit check` drift clean on `.agents/docs.md`.

### Mechanical tier (WS-2)

- [ ] **Task 5 — ship verdict reader migration.** Switch `bkit-ship.md` `UPDATE_DOCS_VERDICT` (line ~902) from `grep … docs/completed.md` to `docs/completed.jsonl`; update `@bkit-ship-update-docs` (`.bkit/prompts/bkit-ship-update-docs.md` step 6) to append a `completed.jsonl` row (dual-write with `completed.md`); add the "machine source" note to `docs/completed.md` header (+ template). **Done when:** `bkit-ship-verdict.integration.test.ts` resolves `PASS` from a fixture `completed.jsonl` containing the FID and `FAIL` when absent (matrix row 10).
- [ ] **Task 6 — design/plan close hook + STRAY widen.** Add the fold-upsert of `roadmap-status` at the design/plan Close steps on `dev`; widen the STRAY allowlist to include `^docs/roadmap\.md$` (design ~790, plan ~851); fail-open `[bkit-roadmap]`. **Done when:** `bkit-roadmap-staging.integration.test.ts` (boundary: workflow files) asserts both allowlists contain `^docs/roadmap\.md$` (matrix row 11, part 1).
- [ ] **Task 7 — build/debug close hook + dev-lock dev-write (4th shape).** Add the feat-side upsert (swept by `git add -A`) AND the bounded dev-located roadmap write under the dev-lock idiom at build Step 17 / debug Step 10; fail-open, never gates. **Done when:** `bkit-roadmap-staging.integration.test.ts` asserts build/debug carry both `git add -A` and the dev-lock roadmap write, and ship uses scoped `git add -- docs/` (matrix row 11, parts 2–4).

### Analysis tier (WS-3)

- [ ] **Task 8 — `@bkit-roadmap-refresh` leaf.** Create `.bkit/prompts/bkit-roadmap-refresh.md` (opus leaf) writing ONLY `roadmap-analysis`; reads frontier snapshot + `deferrals`/`failures.jsonl` + Backlog region (as untrusted data); groupings via `design-organise` seam; prompt suggestions via `plan-complexity-check`; no hardcoded model IDs/IDE; "scanned N of M" + `ROADMAP_SCAN_COVERAGE` counter row. **Done when:** `bkit-roadmap-refresh-prompt.test.ts` asserts the prompt writes only the `roadmap-analysis` marker block + contains no model-ID/IDE literals (matrix row 12) and the emitted `ROADMAP_SCAN_COVERAGE` counter row conforms to the jsonl.md counter schema (matrix row 13).
- [ ] **Task 9 — ship Step 10 wiring.** Add `@bkit-roadmap-refresh` as the third parallel subagent in `bkit-ship.md` Step 10 with the write preceding the existing `git add -- docs/` commit (~916); add its artifact to Gate 10. **Done when:** `bkit-roadmap-staging.integration.test.ts` confirms Step 10 launches the three subagents and the analysis write precedes the docs commit (extends matrix row 11 audit); `bkit check` clean.

### Cadence + reverse sync + reconcile (WS-4)

- [ ] **Task 10 — cadence + audit/ledger injection.** Add the cadence step counting persisted ship-close `outcome` rows in `.bkit/stats.jsonl` (fire at `N`=5 / staleness=14 days from analysis `ts`); inject a generic #80 audit candidate + open `deferrals`/`failures` grouped next-steps; `[bkit-analysis]` on advance/fire. **Done when:** `tests/roadmap-cadence.bats` (real fixture `.bkit/stats.jsonl`) proves the count crosses `N` at the 5th ship row and the staleness path fires from an old `ts` (matrix row 14).
- [ ] **Task 11 — reverse tracker sync (Directive 3).** Add the orchestrator-mediated, MCP-only, settled-drift-guarded, best-effort, no-op-under-`none` reverse label sync to the cadence step; `[bkit-roadmap]` on fire/skip/conflict. **Done when:** `bkit-roadmap-sync.integration.test.ts` (boundary: workflow files) asserts the sync is MCP-only, guarded by the tracker-mode marker, and wrapped so it never gates the close (matrix row 15).
- [ ] **Task 12 — reconcile/recovery (Directive 4).** Add the reconcile pass diffing live `feat/*` (+ open issues when wired) vs the board, re-adding/flagging missing rows with `[bkit-roadmap]`. **Done when:** `bkit-roadmap-reconcile.integration.test.ts` (real git repo with a `feat/*` branch) shows a missing in-flight FID re-added + a `[bkit-roadmap]` line (matrix row 16).

### On-demand utility (WS-5)

- [ ] **Task 13 — `/bkit-roadmap` utility.** Create `.bkit/workflows/bkit-roadmap.md` (mirrors `bkit-worktree-*` shape): run the mechanical fold + invoke `@bkit-roadmap-refresh`. **Done when:** `bkit-roadmap-utility.test.ts` asserts the workflow sources the fold + invokes `@bkit-roadmap-refresh` (matrix row 17).

### Cross-provider + docs (WS-6)

- [ ] **Task 14 — deferral closure + observability + ledger docs.** Append a `status:"CLOSED"` row (same `key`) to `docs/deferrals.jsonl` for `380-dev-located-roadmap-status-write-for-build-debug-closes`; add the `[bkit-roadmap]` section to `docs/observability.md`; add `kind: "completed"` + `ROADMAP_SCAN_COVERAGE` to `.bkit/jsonl.md`; append the `decisions.jsonl`/`knowledge.jsonl` rows from Documentation Updates. **Done when:** the deferral shows a `CLOSED` row; `docs/observability.md` carries the `[bkit-roadmap]` prefix; `bkit check` + prose lint clean.
- [ ] **Task 15 — mirror regen + hash refresh.** Run `bkit install` (batched, session end) to render `.claude/`/`.cursor/`/`.opencode/` for the five edited workflows + `/bkit-roadmap` + `@bkit-roadmap-refresh`, render `.bkit/scripts/bkit-roadmap-fold.sh` from templates, and regenerate `.bkit/version` hashes (new script + changed `completed.md`). Run the one-time backfill (Task 2 script) once on `dev`. **Done when:** rendered mirrors exist for the new utility + agent; `git config core.bare false` restored; `bkit check` drift clean; `docs/completed.jsonl` populated from backfill.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes. **DO NOT stop for user permission.** Proceed to `Testing & Documentation`.

- [ ] **No bolt-on / no gate-weakening:** every `[NEW]` justified against reuse; `bkit-roadmap-fold.sh` sources (never re-inlines) `BKIT_STATUS_FOLD`; no `as any`/`@ts-ignore`/`.skip`/empty `catch`/error-swallowing added to pass a gate.
- [ ] **All five plan directives resolved as tasks:** upsert (Task 3/6/7), completed.jsonl migration+backfill (Task 1/2/5), reverse sync (Task 11), reconcile (Task 12), build/debug 4th staging shape + CI/bats (Task 7 + matrix row 11).
- [ ] **Gate 2 - Verified:** Every checkbox above independently verified.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** all 17 matrix rows have a checked-off test task (Tasks 1–13 above); no uncovered row.
- [ ] **Update existing tests:** adjust `bkit-status-fold.test.ts` expectations if `WORKFLOW_FILES` gains roadmap-source assertions; extend `bkit-install.integration.test.ts` with the roadmap-consumer-owned scenario (matrix row 18).
- [ ] **Write new tests:** the four new `*.test.ts`/`*.integration.test.ts` + `tests/roadmap-fold.bats` + `tests/roadmap-cadence.bats` per the matrix; bats over real `jq`/`sh`/`status.jsonl` (no mocks at the boundary).
- [ ] **Verify observability:** every fold/hook/reconcile/sync fail branch emits a bracketed `[bkit-roadmap]` line; counter appends `[bkit-telemetry]` fail-open; cadence `[bkit-analysis]`. `docs/observability.md` updated.
- [ ] **Update documentation:** all Documentation Updates rows applied; `.agents/docs.md` accurate.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes. **DO NOT stop for user permission.** Proceed to `Verification Plan`.

- [ ] **Docs updated:** every `Documentation Updates` row completed; `.agents/docs.md` accurate.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified.

## Verification Plan

### Automated Tests

- [ ] **Full local gate suite:** `pnpm typecheck` + `pnpm lint` + `pnpm format:check` + `pnpm lint:prose` + `pnpm lint:slop` + `pnpm slop:delta` + `pnpm check:dist` + `pnpm bkit check` — all green on the changed files. Do NOT weaken any gate.
- [ ] **Unit + integration (Vitest):** `pnpm test` passes including `bkit-telemetry.test.ts`, `bkit-roadmap-fold.test.ts`, `bkit-roadmap-refresh-prompt.test.ts`, `bkit-roadmap-utility.test.ts`, `bkit-completed-backfill.integration.test.ts`, `bkit-ship-verdict.integration.test.ts`, `bkit-roadmap-staging.integration.test.ts`, `bkit-roadmap-sync.integration.test.ts`, `bkit-roadmap-reconcile.integration.test.ts`, and the new `bkit-install.integration.test.ts` roadmap scenario.
- [ ] **Shell (bats):** `npx --yes bats tests/*.bats` passes including `tests/roadmap-fold.bats` + `tests/roadmap-cadence.bats` (real `jq`, cross-process, real fixtures).
- [ ] **Coverage:** `pnpm test:coverage:unit` branch floor not regressed (the shared `--coverage.thresholds.branches` gate — `docs/testing.md` § Coverage).
- [ ] **Build Configuration:** no new mock files; nothing to add to `tsconfig.json` exclude.

> [!IMPORTANT]
> **No Architectural Downgrades:** resolve build/compiler/test errors per `docs/architecture.md` + `docs/knowledge.jsonl`; never via `as any`/`.skip`/`passWithNoTests`. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes. **DO NOT stop for user permission.** Proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** Every checkbox in Automated Tests independently verified; explicit proof (test outputs) gathered.

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** use local CLIs (`gh`, `bkit`) to verify, never a dashboard.

- [ ] **Step 1 — dogfood install + upgrade (separate engines).** In a scratch consumer (`os.tmpdir()`): `bkit install --claude --cursor --tooling` then `bkit upgrade`; assert `docs/roadmap.md` is NOT created by install (consumer-owned, matrix row 18) and `bkit check` exits 0. Restore `git config core.bare false` in the bkit repo after install.
- [ ] **Step 2 — end-to-end close in the bkit repo.** Run one `/bkit-plan`-style close on a scratch FID and confirm `docs/roadmap.md` gains the FID under the Plan section (upsert), the Backlog region is untouched, and `[bkit-roadmap]` fail-open lines appear when the tracker is unreachable.
- [ ] **Step 3 — cadence + reconcile.** Seed 5 ship `outcome` rows in a fixture `.bkit/stats.jsonl` and confirm the cadence fires (`[bkit-analysis]`); create a stray `feat/{FID}` and confirm the reconcile pass re-adds its row.

## Merge Method

**Merge method: always squash.** `gh pr merge --squash --delete-branch --body ""`. The `completed.md → completed.jsonl` touchpoints (reader + writer + hash-gate + backfill) MUST land in the same squash so revert is atomic and no ship is ever blocked by a partial migration.

<!-- bkit:end -->
