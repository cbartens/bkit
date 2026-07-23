<!-- bkit:start -->

<!-- bkit:managed v4.8.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Constant roadmap analysis refresh (#380) — Sub-Plan 1/3: Foundation + Mechanical tier (WS-1 + WS-2)

**Parent Plan:** [plan-v4-split.md](./plan-v4-split.md)

> [!IMPORTANT]
> **Sub-plan sequencing.** This is sub-plan **1 of 3** (split for session/token budget). Execution order is **1 → 2 → 3**; this sub-plan is the load-bearing foundation everything else reads from (nothing in sub-plans 2/3 can be meaningfully tested without it). Sibling sub-plans:
>
> - [plan-v4-2.md](./plan-v4-2.md) — Analysis + Cadence/Sync/Reconcile (WS-3 + WS-4).
> - [plan-v4-3.md](./plan-v4-3.md) — Utility + Cross-provider/docs (WS-5 + WS-6) + full Verification Plan (Gates 2–4, Manual Verification).
>
> **Gates:** this sub-plan owns **Gate 1 (Prerequisites)**. Gates 2–4 + the Mandatory Testing/Documentation tasks + Manual Verification run once in sub-plan 3 after all three sub-plans' tasks land. Each task below carries its own `Done when` test assertion for local self-verification.

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

**This sub-plan (1/3) builds the foundation + mechanical status tier:** the telemetry codec extension, the one-time `completed.md → completed.jsonl` backfill + rollout trigger, the `bkit-roadmap-fold.sh` helper, doc-index/`.gitattributes` entries, the ship-verdict reader migration, and the four workflow close-hook edits (design/plan/build/debug) including the dev-lock 4th staging shape.

The canonical design (`docs/plans/202607/380-roadmap-analysis-refresh-design.md`) was amended twice after close and re-reviewed. Two inversions and five re-review plan directives are load-bearing and this plan resolves each as concrete tasks:

- **On-disk-first, tracker-optional sensing** — the board builds from `docs/plans/**` artifacts + folded `status.jsonl` + `deferrals`/`failures.jsonl` + a consumer backlog region, and works under `tracker: none`; a `list_issues` MCP read is additive only when a tracker is wired.
- **Canonical-home inversion** — `docs/roadmap.md` is now the **canonical home for issue state** (phase-sectioned board Backlog → Design → Plan → Build → Debug → Ship); the tracker is a downstream mirror kept in sync from roadmap.md.
- **Directive 1** — status region is a per-FID **UPSERT/merge keyed on FID**, never a blind full-regenerate (build/debug rows are authored on `dev` but their `status.jsonl` lives on `feat/{FID}` and are not re-derivable from `dev`). **[This sub-plan: Tasks 3/6/7.]**
- **Directive 2** — `docs/completed.md` → `docs/completed.jsonl` migrates atomically across ALL touchpoints, with a one-time backfill. **[This sub-plan: Tasks 1/2/5.]**
- **Directive 3** — reverse tracker-label sync (roadmap → tracker) is orchestrator-mediated, settled-drift-guarded, MCP-only, best-effort. **[Sub-plan 2, Task 11.]**
- **Directive 4** — a canonical reconciliation/recovery pass diffs live `feat/*` (+ open issues when wired) against the board to re-add lost in-flight rows. **[Sub-plan 2, Task 12.]**
- **Directive 5** — build/debug dev-write is fail-open and a **fourth** distinct staging shape; the per-shape CI/bats assertion must cover it. **[This sub-plan: Task 7.]**

> **Directive ↔ design cross-map** (plan directive = design `Re-review findings` #): Directive 1 = re-review #1 (per-FID upsert); Directive 2 = re-review #3 (`completed.jsonl` migration + backfill); Directive 3 = re-review #4 (reverse tracker sync); Directive 4 = re-review #2 (reconcile/recovery); Directive 5 = re-review #5 (build/debug 4th staging shape). All five are present + tasked across the three sub-plans; the plan numbering is not the design's re-review order.

**Related Issues:**

- `#260` — Milestone Orchestrator autonomous PM loop (open) — the direct precursor; `bkit-roadmap-fold.sh` IS #260's tick-step-1 sense primitive (build once, #260 consumes the same fold + snapshot).
- `#214` — bkit roadmap (open) — the hand-maintained sequencing reference this feature automates.
- `#209` — Workflow state model: squash-to-dev + persistent `feat/{FID}`, NDJSON `status.jsonl` (closed) — precedent for feat-located writes reaching `dev`, `merge=union`, the Close STRAY-guard, and the `-X ours` conflict class.
- `#80` — `bkit-audit` lens engine (open) — the audit-candidate source injected on the cadence (sub-plan 2); a generic "run an audit" reference stands in until it lands.
- `#324` — recurring self-healing audit loop / after-ship trigger (open) — shares the post-merge event substrate; noted, not a dependency.
- `#236` — Post-mortem on consumer debug sessions (closed) — source of the stack-independence rule the roadmap surface must respect.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> Shared across all three sub-plans (human-confirmed once on the master plan). Reproduced verbatim for self-containment. The **Derived Test Matrix** below is scoped to THIS sub-plan's tasks.

### Narrative _(inherited from design — do not rewrite)_

As a bkit user, after I close any workflow phase for an issue, `docs/roadmap.md` shows that issue under its current phase with no manual edit, so anyone — human or agent — can see where every open issue stands. The board is built **primarily from on-disk artifacts so it works with no tracker connected** — the `docs/plans/**` design/plan docs, per-FID `status.jsonl`, the `deferrals`/`failures` ledgers, and a consumer-authored "Backlog / Ideas" region at the bottom of `roadmap.md`; when a tracker IS wired the board is additionally enriched with open tracker issues and their status/readiness. When I ship an issue (or run `/bkit-roadmap` on demand), bkit refreshes an opus-authored "best next step": dependency-aware issue groupings, IDE- and model-aware prompt suggestions (including when NOT to use bkit), and periodically-injected audit and backlog candidates, so I always know what to work on next and how to drive bkit optimally.

### Success Criteria _(inherited from design — do not rewrite)_

1. After every workflow close, `docs/roadmap.md`'s phase-sectioned status board reflects each in-flight issue's current phase, **built primarily from on-disk artifacts so it works with NO tracker connected** (`docs/plans/{YYYYMM}/{FID}-{design,plan}.md` presence + folded per-FID `status.jsonl` + open `docs/deferrals.jsonl`/`docs/failures.jsonl`), with no manual edit and no analysis/subagent turn. **When a tracker IS wired** (`github`/`linear`, NOT `none`), the board is additionally enriched with open tracker issues + `bkit:*` phase/readiness via an orchestrator-mediated `list_issues` MCP call (never `gh`/`search_issues`). The tracker read is **additive, never a precondition**: under `tracker: none` it is skipped entirely and the board is still complete.
2. A concurrent close, a merge conflict, or an `-X ours` squash never aborts a close or silently corrupts the board — the status board is deterministically regenerable per-FID (upsert keyed on FID; the `-X ours` non-event holds for the writer's own row).
3. Ship-close and `/bkit-roadmap` produce a refreshed analysis block: a ranked best-next-step, dependency-aware issue groupings, and bkit-usage prompt suggestions, stamped with scan coverage. _(Implemented in sub-plans 2/3.)_
4. Ledger/audit integration fires on a deterministic threshold — counting persisted ship-close rows in committed `.bkit/stats.jsonl` (NOT the non-persisted `bkit-counter-bus.sh` helper) plus a staleness-days fallback: open `deferrals.jsonl`/`failures.jsonl` items and a #80 audit candidate surface as grouped next-steps. _(Implemented in sub-plan 2.)_
5. `docs/roadmap.md` stays consumer-owned — `bkit install` never creates/overwrites it and `bkit check` drift stays clean; only the generator script, the analysis prompt, the utility, the five close-step edits, the `completed.jsonl` migration, and doc-index rows ship.

### Process Sketch _(inherited from design — plan may refine)_

- **WHEN** any workflow reaches Close (after its `bkit:*` transition) **→ THEN** the fold rewrites `docs/roadmap.md`'s `roadmap-status` block by **upserting only the closing FID's row** into its phase section, staged with the phase's existing close commit.
- **WHEN** the squash-merge conflicts on `docs/roadmap.md` (`-X ours`) **→ THEN** the writer re-upserts its own FID row; other rows are untouched, so no halt and no silent loss.
- **WHEN** ship-close runs OR `/bkit-roadmap` is invoked **→ THEN** `@bkit-roadmap-refresh` rewrites the `roadmap-analysis` block (best next step + groupings + prompt suggestions), bounded + coverage-stamped. _(sub-plans 2/3.)_
- **WHEN** the persisted ship-close count crosses `N` (or the staleness threshold) **→ THEN** the analysis pass injects a #80 audit candidate + open `deferrals`/`failures` items as grouped next-steps, and reconciles tracker labels to the board (settled drift only, when wired). _(sub-plan 2.)_
- **IF** `tracker: none` or the `list_issues` read fails/returns empty **→ THEN** the board is built entirely from on-disk artifacts + the Backlog region (never blank, never gated); every fail-open branch logs `[bkit-roadmap]`.
- **IF** a live in-flight `feat/*` FID is missing from the board **→ THEN** the reconcile pass re-adds/flags it with a `[bkit-roadmap]` line. _(sub-plan 2.)_

### Concrete Example _(plan expands from design)_

**Setup:** A `tracker: none` consumer repo. Two issues in flight: FID `412-export-csv` has `docs/plans/202607/412-export-csv-design.md` + `-plan.md` on disk and is mid-build on `feat/412-export-csv`; FID `418-rate-limit` has only `418-rate-limit-design.md`. A previously-shipped FID `401-login` sits in `docs/completed.jsonl`. The consumer has hand-written two lines under `## Backlog / Ideas` at the bottom of `docs/roadmap.md`.

**Steps:**

1. User closes `/bkit-build 412` → the build close-step fold upserts `412-export-csv` into the **Build** section of `docs/roadmap.md` on `feat/412-export-csv` (via `git add -A`) AND writes the same row to `dev`'s board under the dev-lock (fail-open). System commits the board with the close commit.
2. User closes `/bkit-plan 418` → the plan close-step fold upserts `418-rate-limit` into the **Plan** section on `dev` (STRAY allowlist widened to accept `docs/roadmap.md`); `401-login` is excluded (present in `completed.jsonl`); the two hand-written Backlog lines are untouched.
3. User runs `/bkit-roadmap` → `@bkit-roadmap-refresh` reads the frontier snapshot + `deferrals`/`failures.jsonl` + the Backlog region, rewrites `roadmap-analysis` with a ranked best-next-step (folding the two ideas in), stamps "scanned 2 of 2", and appends a `ROADMAP_SCAN_COVERAGE` counter row. _(sub-plans 2/3.)_
4. A fifth issue ships, crossing `N`=5 **ship-cycles overall** since the last analysis refresh → the cadence fires: a #80 audit candidate + the oldest open `deferrals` item surface as grouped next-steps; the shipped FID (`412-export-csv`) drops off the board into `completed.jsonl`. _(sub-plan 2.)_

**Outcome:** `docs/roadmap.md` shows every in-flight FID under exactly one phase section with zero manual edits, the Backlog survives every regenerate, shipped FIDs are gone from the board, and the analysis block names the next best step — all with no tracker connected.

### Edge Cases _(plan expands from design's Key Edge Cases)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Concurrent close / `-X ours` squash eats a feat-side roadmap edit | Per-FID upsert re-writes only the closing FID's row; other rows reproducible; non-event. |
| Close staging differs per workflow (FOUR shapes) | design/plan widen STRAY allowlist to `^docs/roadmap\.md$`; build/debug `git add -A` on `feat` PLUS a new dev-lock dev-write; ship scoped `git add -- docs/`. Per-shape CI/bats assertion, never one grep. |
| `tracker: none` or a `list_issues` read that fails/returns empty | Board built entirely from on-disk artifacts + Backlog; MCP skipped under `none`, treated inconclusive (keep prior tracker rows) when a wired read fails; never blank, never gated; `[bkit-roadmap]` stderr on every fail-open branch. |
| Large tracker (200+ open issues) blows analysis `maxTurns`/context | Bounded scan (open + milestone-scoped, paged), coverage-stamped "scanned N of M" + `ROADMAP_SCAN_COVERAGE` counter row; report budget reserved. _(sub-plan 2.)_ |
| Human hand-edits the generated status block | Loud "generated — do not edit; edit the tracker / plan artifacts" banner; next upsert reverts the machine region only. |
| Marker blocks missing/mangled on an existing `roadmap.md` | Re-bootstrap in place (re-emit missing marker block[s] + banner) + `[bkit-roadmap]` stderr; never abort the close, never no-op silently. |
| Consumer "Backlog / Ideas" region below the last machine marker | NEVER rewritten by any regenerator; a declared read-input for the analysis tier (promotable into design; may suggest filing as an issue when wired). |
| Lost/corrupted in-flight phase row (roadmap not fully re-derivable) | Reconcile pass diffs live `feat/*` (+ open issues when wired) vs the board, re-adds/flags missing rows with `[bkit-roadmap]`. _(sub-plan 2.)_ |
| `completed.jsonl` empty on rollout day | One-time backfill of existing `completed.md` entries → `completed.jsonl`, wired to run idempotently + fail-open at `bkit upgrade` so EVERY consumer (not just the bkit repo) migrates on rollout; else exclude-completed reads an empty ledger and every historically-shipped FID reappears as active. Manual re-run command documented in Documentation Updates. |
| Ship verdict reader misses the FID | `UPDATE_DOCS_VERDICT` reads `completed.jsonl` (not `completed.md`); backfill + reader switch land in the same change so no ship is blocked. |
| Backlog region as untrusted analysis input | Analysis prompt treats the Backlog region as DATA, not instructions (prompt-injection surface); folds ideas into ranking, never executes them. _(sub-plan 2.)_ |
| build/debug dev-write fails (lock held, offline) | Fail-open: the dev-located roadmap write never gates the close; `[bkit-roadmap]` on every fail branch; feat-side board still written. |

### Derived Test Matrix _(scoped to this sub-plan)_

> Tiers per `docs/testing.md` § Tiers (bkit has Unit `*.test.ts`, Integration `*.integration.test.ts`, Shell `tests/*.bats`, Static — no E2E/@live/fresh-DB). Boundary rows reach the real boundary (real `jq`/`sh`, real `fs`, real `git`) and assert a ground-truth signal, never a mock at the boundary. Row numbers preserve the master plan's numbering for cross-reference.

<!-- prettier-ignore -->
| # | Test description | Type | Target file |
| --- | --- | --- | --- |
| 1 | Fold builds the phase-sectioned board from on-disk artifacts under `tracker: none` (no MCP call attempted) | Shell (bats) | `tests/roadmap-fold.bats` |
| 2 | Fold per-FID upsert: a later fold preserves an existing build/debug row and never blind-reverts it | Shell (bats) | `tests/roadmap-fold.bats` |
| 3 | Fold excludes FIDs present in `completed.jsonl` from the board | Shell (bats) | `tests/roadmap-fold.bats` |
| 4 | Fold fail-open: malformed/empty input + absent tracker → exit 0 + `[bkit-roadmap]` stderr, board never blank | Shell (bats) | `tests/roadmap-fold.bats` |
| 5 | Bootstrap: absent `roadmap.md` → created with two markers + banner + `## Backlog / Ideas`; mangled markers → re-emitted in place | Shell (bats) | `tests/roadmap-fold.bats` |
| 6 | Backlog region below the last machine marker survives a regenerate (bytes unchanged) | Shell (bats) | `tests/roadmap-fold.bats` |
| 7 | `bkit-roadmap-fold.sh` sources `BKIT_STATUS_FOLD` (single-source) with the fail-closed `\|\| { … exit 2; }` guard; template copy exists and repo copy byte-matches, hashed in-process via `node:crypto` `createHash` (NEVER a shell `md5` shell-out — avoids the CLOSED macOS-only `status-fold-test-md5-macos-only-fails-linux-ci` portability regression) | Unit (Vitest) | `.bkit/src/bkit-roadmap-fold.test.ts` |
| 8 | `completed.jsonl` new `kind: "completed"` round-trips through the telemetry codec (accepted by `validate`, correct identity tuple) | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| 9 | Backfill: existing `completed.md` entries → `completed.jsonl` rows; idempotent (re-run adds no duplicate) | Integration (Vitest) | `.bkit/src/bkit-completed-backfill.integration.test.ts` |
| 10 | Ship verdict reader resolves `UPDATE_DOCS_VERDICT=PASS` from `completed.jsonl` (not `completed.md`) when the FID is present | Integration (Vitest) | `.bkit/src/bkit-ship-verdict.integration.test.ts` |
| 11 | Per-workflow-shape staging: design/plan allowlist includes `^docs/roadmap\.md$`; build/debug `git add -A`; ship scoped `git add -- docs/`; build/debug carry the dev-lock dev-write (4th shape) | Integration (Vitest, boundary: workflow files) | `.bkit/src/bkit-roadmap-staging.integration.test.ts` |
| 19 | Per-FID upsert collapses PRE-EXISTING duplicate FID rows to exactly one (KN-42 `merge=union`/`-X ours` duplicate-line class) — every row matching the FID key is replaced, not just the first match | Shell (bats) | `tests/roadmap-fold.bats` |
| 20 | Close-hook tracker enrichment when wired: design/plan/build/debug closes read open issues via an orchestrator-mediated `list_issues` (never `gh`/`search_issues`), pipe rows to the fold; skipped no-op under `tracker: none`; fail-open `[bkit-roadmap]` with 0/empty treated inconclusive | Integration (Vitest, boundary: workflow files) | `.bkit/src/bkit-roadmap-staging.integration.test.ts` |
| 21 | build/debug dev-lock dev-write behavioral: over a real temp git repo the worktree returns to `feat/*`, the FID row lands on `dev`, and a held lock is fail-open (exit 0, close never gated) | Integration (Vitest, boundary: real git) | `.bkit/src/bkit-roadmap-devwrite.integration.test.ts` |
| 22 | Every new `[bkit-roadmap]` fail branch (dev-write lock-held/offline; reverse-sync fire/skip/conflict) exits 0 and never gates the close | Shell (bats) | `tests/telemetry-failopen.bats` |

> [!NOTE]
> **Row→task mapping** (template's one-row→one-task stretched here per the master plan): fold behaviours (rows 1–7 + 19) = **Task 3**; per-workflow-shape staging + close enrichment (rows 11, 20) = **Tasks 6/7** (extended by sub-plan 2 Task 9 for ship Step 10); dev-write behavioral (row 21) = **Task 7**; fail-open exit-0 row (22) is shared **Task 7** (dev-write branches, here) + sub-plan 2 **Task 11** (reverse-sync branches). Row 22 is owned here; sub-plan 2's Task 11 extends the same `tests/telemetry-failopen.bats`. Rows 12–18 belong to sub-plans 2/3.

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** Reviewed on the master plan; carried forward here unchanged.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> Shared across all sub-plans (human-confirmed on master). Reproduced verbatim for self-containment.

**Proposed names (new artifacts):**

- `docs/roadmap.md` — consumer-owned generated artifact (peer of `deferrals.jsonl`); phase-sectioned board Backlog → Design → Plan → Build → Debug → Ship.
- Marker blocks: `<!-- bkit:roadmap-status start/end -->` and `<!-- bkit:roadmap-analysis start/end -->`; consumer region heading `## Backlog / Ideas` below the last machine marker.
- `.bkit/templates/.bkit/scripts/bkit-roadmap-fold.sh` (+ installed copy `.bkit/scripts/bkit-roadmap-fold.sh`) — sourced fold helper exporting `BKIT_ROADMAP_FOLD`.
- `.bkit/prompts/bkit-roadmap-refresh.md` → renders `@bkit-roadmap-refresh` (opus leaf). _(sub-plan 2.)_
- `.bkit/workflows/bkit-roadmap.md` → renders `/bkit-roadmap` utility command. _(sub-plan 3.)_
- `docs/completed.jsonl` — new ledger (peer of `deferrals`/`failures.jsonl`), new telemetry `kind: "completed"`.
- Telemetry names: `counterName: "ROADMAP_SCAN_COVERAGE"`; observability prefix `[bkit-roadmap]`.

> [!WARNING]
> **Migration — `docs/completed.md` → `docs/completed.jsonl` (Directive 2).** Not a removal — `completed.md` is RETAINED as the human-readable view. What changes: the **machine-readable source of truth** for "is this FID shipped?" moves to `completed.jsonl`. All touchpoints migrate in ONE change (else a partial migration blocks every ship at `bkit-ship.md` verdict step):
>
> 1. `@bkit-ship-update-docs` appends a `completed.jsonl` row (continues appending the `completed.md` entry too, so the human view is preserved).
> 2. `bkit-ship.md` verdict reader (currently `grep -c … docs/completed.md`, line ~902 / mirrors line ~757/754) switches to `completed.jsonl`.
> 3. `docs/completed.md` managed-block header gains a one-line "machine source: `docs/completed.jsonl`" note → its `.bkit/version` `canonicalHashes` entry is regenerated by `bkit upgrade` (it IS drift-gated).
> 4. One-time backfill of existing `completed.md` entries into `completed.jsonl` (idempotent), wired to run automatically — idempotently and fail-open — at `bkit upgrade`, so EVERY consumer migrates on rollout; a documented manual `bkit`-task command is the fallback.

> [!IMPORTANT]
> **build/debug now write `docs/roadmap.md` status to `dev` (Addendum C).** build and debug close steps gain a bounded dev-located roadmap write under ship's dev-lock idiom (fail-open) — the first time these two workflows touch `dev`. This is additive and best-effort; it never gates the close. The prior deferral `380-dev-located-roadmap-status-write-for-build-debug-closes` is thereby SUPERSEDED (pulled into scope) — mark it `CLOSED` in sub-plan 3, Task 14.

No exported TS symbol signatures change (the codec gains a union member, not a breaking change). No consumer command is renamed. `docs/roadmap.md` is net-new and consumer-owned.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** Reviewed on the master plan; carried forward here unchanged.

---

## 👤 ⚠️ Open Questions & Assumptions — HUMAN REVIEW REQUIRED

> Shared across all sub-plans (human-confirmed on master). Reproduced verbatim for self-containment.

- **Open question (cadence numbers):** `N` ship-cycles = **5** proposed; staleness-days fallback = **14** proposed (measured from the `roadmap-analysis` header `ts`). → Confirm both values, or accept the defaults. _(applies in sub-plan 2.)_
- **Open question (board scope):** status board carries **open + in-flight FIDs only**; shipped FIDs drop off into `completed.jsonl`; closed/abandoned tracker issues are not shown. → Confirm the drop-off policy.
- **Open question (`completed.md` fate):** proposal = **retain** `completed.md` as human-readable (dual-write) rather than generate it from the ledger — lowest-risk, no data loss, backward-readable. → Confirm retain-vs-generate.
- **Open question (`completed` codec scope):** add `kind: "completed"` to the `bkit-telemetry.ts` codec `validate`/identity so readers accept it; `bkit harvest`/`bkit analysis` ingestion of `completed.jsonl` is **out of scope**. → Confirm harvest stays out.
- **Assumption:** the no-concurrent-workflows-per-clone constraint holds → if violated, two closes racing `docs/roadmap.md` rely on per-FID upsert + `-X ours` tolerance (designed-for, not designed-around).
- **Assumption:** `.bkit/stats.jsonl` carries persisted ship-close `outcome` rows (`workflow == "ship"`) → if the schema drifts, the cadence count reads 0 and never fires (fail-safe). _(applies in sub-plan 2.)_
- **Assumption:** shipped roadmap/analysis text stays stack/vendor-agnostic and cites no tracker-internal refs (`BAR-`/`KN-`/Linear ids) → if violated, the shipped-surface rule reds `slop`/review.
- **Assumption:** #80 lens engine is NOT landed → the cadence injects a generic "run an audit" next-step referencing the audit prompt family, never a hardcoded stack lens. _(applies in sub-plan 2.)_

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** Reviewed on the master plan; carried forward here unchanged.

---

## Alternative Approaches & Recommendations

**Selection rule:** pick the approach with the best quality-of-end-state, NOT the smallest diff.

Chosen (from the design, carried into the plan):

- **Two-tier, two-marker-block generated artifact** inside one consumer-owned file — the deterministic status writer and the opus analysis writer own physically-separate marker regions, so they can never clobber each other, and the Backlog lives below both markers so it is never regenerated.
- **Per-FID UPSERT** for the status region (Directive 1) — NOT a blind full-regenerate. A full rebuild from dev-visible sources would silently revert build/debug rows (their `status.jsonl` lives on `feat/{FID}`). The upsert keeps `-X ours` a non-event for the writer's own row.
- **On-disk-first, tracker-additive** sensing — the board builds under `tracker: none`; `list_issues` enriches only when wired.
- **`completed.jsonl` as the machine-readable shipped-FID source** (Directive 2) with `completed.md` retained human-readable and dual-written.

Rejected paths (design § Approaches Considered): blind full-regenerate (reverts build/debug rows); persisted `roadmap.jsonl` event log (deferred to #260); sed-edited single unstructured file (races the shared file); tracker `list_issues` as required/primary source (breaks `tracker: none`); folding analysis into `@bkit-ship-update-docs` (couples to ship-only, blocks reuse); `search_issues` for the tracker read (silently returns 0 on private repos — forbidden; use `list_issues`, treat 0/empty as inconclusive).

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
> **Default = in-scope.** Each row above is genuinely-additive. Do NOT duplicate the `380-persisted-frontier-snapshot-event-log-for-260` deferral. The `380-dev-located-roadmap-status-write-for-build-debug-closes` deferral is now IN SCOPE (Addendum C) and is marked `CLOSED` in sub-plan 3, Task 14.

## Security & Privacy

> Reference: `docs/security.md`. bkit ships no runtime server; observability is CLI stdout/stderr (`docs/observability.md`).

- [ ] **User input** — the consumer "Backlog / Ideas" region is free-form text READ by `@bkit-roadmap-refresh` (sub-plan 2). The fold in THIS sub-plan reads it as bytes only (never `eval`/expand); it is NEVER rewritten by any regenerator.
- [ ] **Tracker MCP read** — `list_issues` is read-only, best-effort, and only when a tracker is wired; reuses the existing configured tracker MCP credential (no new secret). Never `gh`/`search_issues`.
- [ ] **PII** — none. Roadmap rows carry FIDs + issue titles + phase only; no user data. Shipped text stays stack/vendor-agnostic, no `BAR-`/`KN-`/Linear internal ids.

_No new routes, DB writes, or secrets._

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core (always verify)

- [ ] **Package Management:** No new npm deps expected (jq + shell + Vitest + bats already present). Confirm `pnpm-lock.yaml` unchanged.
- [ ] **Dependency Versions:** `pnpm --version`, `npx tsc --version`, `jq --version`, `npx bats --version` present; the fold + tests depend only on `jq` + POSIX `sh` (already required by `bkit-status-fold.sh`).
- [ ] **Existing-solution search (reuse over duplicate):** `bkit-roadmap-fold.sh` SOURCES `BKIT_STATUS_FOLD` from `bkit-status-fold.sh` verbatim (never re-inline — asserted by `bkit-status-fold.test.ts` pattern, whose template/repo byte-match hashes via `node:crypto` `createHash`, never a shell `md5` shell-out — CLOSED `status-fold-test-md5-macos-only-fails-linux-ci`); `completed.jsonl` reuses the `.bkit/jsonl.md` envelope + `bkit-telemetry.ts` codec.
- [ ] **User Context:** read/write access to `.bkit/**`, `docs/**`, `tests/**` confirmed.
- [ ] **Pending Blockers:** query the tracker for open `blocker`-labelled issues touching the four workflows (design/plan/build/debug) / ship prompt.
- [ ] **Project Context:** `docs/knowledge.jsonl` + `docs/decisions.jsonl` read for: `-X ours` conflict class (#209), `list_issues`-not-`search_issues`, the dev-lock idiom, `bkit install` batch-at-session-end, mirror not drift-gated.
- [ ] **Testing & Quality:** strategy aligns with `docs/testing.md` § Tiers (Unit/Integration/Shell-bats; no E2E/@live/fresh-DB) + § Counter derivation test coverage (bats pattern for shell logic over a real `status.jsonl`).
- [ ] **Prerequisite Plans:** none — this sub-plan (WS-1/WS-2) has no upstream plan dependency.

### Conditional (verify only when applicable)

- [ ] **Observability** _(new log points)_: the new `[bkit-roadmap]` prefix is a NEW module prefix → added to `docs/observability.md` in sub-plan 3 (Task 14). `[bkit-telemetry]` (counter append) already exists — reuse.
- [ ] **Architecture & Cross-provider** _(edited workflows + new script)_: every edited `.bkit/workflows/*.md` + new `.bkit/scripts/bkit-roadmap-fold.sh` require mirror regen — batched at session end in sub-plan 3 (WS-6), NOT per-edit here.

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

- **Input (Read):** `docs/plans/{YYYYMM}/{FID}-{design,plan}.md` presence (phase-reached); per-FID `docs/plans/{YYYYMM}/logs/{FID}/status.jsonl` (folded via `BKIT_STATUS_FOLD`); `docs/completed.jsonl` (exclude-completed); the `## Backlog / Ideas` region of `docs/roadmap.md` (read as bytes only here); tracker `list_issues` rows (only when wired); the #202 inline-marker tracker mode.
- **Output (Write):** `docs/roadmap.md` `roadmap-status` block (per-FID upsert); `docs/completed.jsonl` (one `completed` row per ship — via the ship writer, Task 5).

### Data Schema Changes

- **ADD** ledger `docs/completed.jsonl` — new telemetry `kind: "completed"`. Row = envelope + `{ key: "{FID}", summary: "{title}", references: ["{plan path}", "{PR}", "{sha}", "{tracker id}"] }`. Identity tuple `(kind, repo, key)` (uses the existing key-based `identity()` default; no `severity`). Codec: extend `TelemetryKind` union + discriminated payload union + `VALID_KINDS` + minimal `validate` payload check in `.bkit/src/bkit-telemetry.ts`.
- **ADD** generated artifact `docs/roadmap.md` — header stamp; `roadmap-status` machine block (phase sections Backlog → Design → Plan → Build → Debug → Ship; per-section FID rows `FID | Title | Milestone | Blocked-by | Last-transition ts`, FID is the universal key); `roadmap-analysis` machine block (bootstrapped empty here; written by sub-plan 2); `## Backlog / Ideas` consumer region below the last machine marker. No `bkit install`-managed block. `merge=union` in `.gitattributes` (+ templates copy). **`merge=union` on the `roadmap-status` UPSERT block is only safe BECAUSE the per-FID upsert dedupes idempotently** — every fold collapses ALL rows matching a FID key to exactly one, so any transient duplicate rows a union merge (or `-X ours`) leaves behind are collapsed on the next close. Without this, `roadmap-status` re-enters the **KN-42** duplicate-line class (`kn-42-pre-release-main-dev-backmerge-with-x-ours-duplicate`). The dedupe guarantee is asserted by matrix row 19.
- **ADD** in-memory frontier snapshot (fold output, NOT persisted): array of `{ id, phase, milestone, labels?, blockedBy?, lastTransitionTs, source }`, `source ∈ {"on-disk","tracker"}`.
- **NO** change to `status.jsonl` schema — the fold is the contract.

## Architecture & Component Changes

**CRITICAL:** shell/jq scripts are edited in `.bkit/templates/.bkit/scripts/` (SSOT); `bkit install` renders the repo copy `.bkit/scripts/` + regenerates `.bkit/version` hashes. Workflow/prompt SSOT is `.bkit/workflows/*.md`. Every `[NEW]` reuses an existing pattern (justified inline). **Mirror regen is batched to sub-plan 3 (WS-6) — do NOT run `bkit install` per-edit here.**

### Roadmap fold foundation (WS-1)

#### [NEW] `.bkit/templates/.bkit/scripts/bkit-roadmap-fold.sh`

- Sourced helper (sibling of `bkit-status-fold.sh`) exporting `BKIT_ROADMAP_FOLD` + shell functions: bootstrap/self-heal `docs/roadmap.md`; the deterministic jq projection `(on-disk plan-artifact scan + folded status.jsonl [+ tracker rows when wired]) → phase-sectioned board + frontier snapshot`; a **per-FID upsert** into the `roadmap-status` block that rewrites the closing FID's row within its phase section and **idempotently collapses ALL rows matching that FID key to exactly one** (never a blind whole-block rebuild, but never leaving a duplicate FID row either — this dedupe is what keeps `merge=union`/`-X ours` on `roadmap-status` safe against the KN-42 duplicate-line class; replace every FID-key match, not just the first).
- SOURCES `BKIT_STATUS_FOLD` from `bkit-status-fold.sh` verbatim (single-source #58 reducer) with the fail-closed `|| { echo "[bkit-telemetry] …" >&2; exit 2; }` guard — asserted by `bkit-roadmap-fold.test.ts`, whose template/repo byte-match hashes in-process via `node:crypto` `createHash` (NEVER a shell `md5` shell-out — the CLOSED `status-fold-test-md5-macos-only-fails-linux-ci` failure; copy the already-fixed `bkit-status-fold.test.ts` idiom verbatim).
- On-disk-first: per-FID phase from `{FID}-design.md`/`{FID}-plan.md` presence refined by the folded `status.jsonl`; excludes FIDs present in `docs/completed.jsonl` (Addendum E, depends on Directive 2 backfill); tracker rows merged only when the #202 inline-marker mode is `github`/`linear`.
- Fail-open: every branch (empty/malformed input, absent snapshot, tracker rows absent, read failure, 0/empty result, best-effort skip) emits a `[bkit-roadmap]` stderr line and never blanks the board. Reason it can't be folded into `bkit-status-fold.sh`: that reducer is a pure `status.jsonl` fold with a byte/md5-pinned blob; roadmap adds on-disk scan + tracker merge + markdown rendering — a separate, composed helper.

#### [NEW] `docs/roadmap.md` (generated at runtime, NOT shipped by install)

- Consumer-owned generated artifact; bootstrapped by the fold on first close (empty machine blocks + banner + empty `## Backlog / Ideas`). Never written by `bkit install`. Documented once in `.agents/docs.md` Project Documents (below `bkit:end`) — Task 4.

#### [MODIFY] `docs/completed.md` + `.bkit/templates/docs/completed.md`

- **Existence Check:** both exist. Add a one-line "machine source: `docs/completed.jsonl`" note to the managed-block header → `.bkit/version` `canonicalHashes["docs/completed.md"]` regenerated by `bkit upgrade` (sub-plan 3, WS-6). `completed.md` stays human-readable; the ship writer dual-writes (Task 5).

#### [NEW] `docs/completed.jsonl` + `.bkit/templates/docs/completed.jsonl`

- Machine-readable shipped-FID ledger (peer of `deferrals`/`failures.jsonl`). Template seed = empty file. `merge=union` in `.gitattributes` (+ templates copy). No managed block, NOT hash-gated (like `deferrals.jsonl`).

#### [MODIFY] `.bkit/src/bkit-telemetry.ts`

- **Existence Check:** exists. Add `"completed"` to `TelemetryKind` + `VALID_KINDS` + the discriminated `TelemetryEvent` union (`CompletedPayload = { key; summary; references? }`) + a minimal `validate` payload branch. `identity()` needs no case (falls through to the key-based default). Blast radius: `VALID_KINDS` consumers (readers) — greppable; no signature change.

#### [MODIFY] `.agents/docs.md` + `.bkit/templates/.agents/docs.md`

- Add a `docs/completed.jsonl` row to the Universal Documents table (Ship `●`); add a `docs/roadmap.md` row to the **Project Documents** table (consumer-owned). Both mirrored in the template copy. (Task 4.)

#### [MODIFY] `.gitattributes` + `.bkit/templates/.gitattributes`

- Add `docs/completed.jsonl merge=union` and `docs/roadmap.md merge=union` (roadmap in the append-safe ledger block; both files are append/upsert-only-safe).

#### [NEW] `.bkit/scripts/bkit-completed-backfill.sh` (or a one-time `bkit` task) — Directive 2

- One-time idempotent backfill: parse existing `docs/completed.md` entries (`## Title (date)` + `Artifacts:` FID path) → append a `completed` row per shipped FID to `docs/completed.jsonl`, skipping FIDs already present. Reuses the `.bkit/jsonl.md` write idiom.
- **Consumer rollout trigger (Directive 2, CRITICAL):** the backfill is invoked automatically — idempotently and fail-open — from `bkit upgrade`, so EVERY consumer migrates its historically-shipped FIDs the moment they adopt this feature (not only the bkit repo via the WS-6 dogfood run). Without this trigger the seed-empty `completed.jsonl` template ships to consumers whose `docs/plans/**` still lists shipped FIDs, and the exclude-completed scan re-materialises every shipped FID as active on the first bootstrapped board. A documented manual command (Documentation Updates, sub-plan 3) is the fallback for a manual re-run.

### Mechanical status tier (WS-2)

#### [MODIFY] `.bkit/workflows/bkit-design.md`, `bkit-plan.md`

- At the Close step (beside the existing `status.jsonl` commit): **when a tracker is wired** (`github`/`linear`, NOT `none`) the orchestrator (the workflow itself, NOT the shell fold or any leaf — those have no MCP tools) performs a best-effort `list_issues` MCP read (never `gh`/`search_issues`; 0/empty treated inconclusive) and pipes the open-issue rows to the fold; under `tracker: none` this is skipped entirely. Then source `bkit-roadmap-fold.sh`, upsert the closing FID's row into `roadmap-status` on `dev` (tracker rows merged only when supplied). **Widen the STRAY allowlist** `grep -vE '^docs/plans/|^docs/(deferrals|decisions|failures)\.jsonl$|^\.bkit/friction\.jsonl$'` to add `^docs/roadmap\.md$` (design line ~790; plan line ~851). Fail-open `[bkit-roadmap]` on every branch (unwired, read failure, empty). This is what satisfies SC#1's "additionally enriched … after every workflow close" — additive, never a precondition.

#### [MODIFY] `.bkit/workflows/bkit-build.md`, `bkit-debug.md`

- At the Close step: **when a tracker is wired** the orchestrator performs the same best-effort `list_issues` enrichment read (never `gh`/`search_issues`; 0/empty inconclusive; skipped no-op under `none`) and pipes rows to the fold. Upsert the FID's row on `feat/{FID}` (swept by the existing `git add -A`) AND add a bounded **dev-located roadmap write under the dev-lock idiom** (Addendum C; reuse ship's `.bkit/.dev.lock` acquire/trap/`git checkout dev`/FF/commit/push shape) — the FOURTH staging shape (Directive 5). Fail-open: the enrichment read and the dev-write never gate the close; `[bkit-roadmap]` on every fail branch (lock held, offline, MCP absent, unwired, empty).

#### [MODIFY] `.bkit/workflows/bkit-ship.md` (verdict reader only)

- At the ship-close verdict step, switch `UPDATE_DOCS_VERDICT` from `grep … docs/completed.md` to `docs/completed.jsonl` (Task 5). The ship-close `roadmap-status` upsert (scoped `git add -- docs/`), the analysis Step 10 wiring, and the cadence step land in sub-plans 2/3.

### Cron Jobs & Scheduled Tasks

None — all triggers are workflow-close-driven or on-demand; no scheduler.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `docs/completed.md` grep as the shipped-FID source of truth (the reader, NOT the file) | `docs/completed.jsonl` (`kind: "completed"`) | REPLACE (the grep reader is switched to `completed.jsonl` in Task 5; the `completed.md` FILE is retained-with-reason — kept human-readable, dual-written — and is NOT itself superseded) | Machine source moves to the ledger; the markdown stays as the human view — atomic migration of the reader + writer + hash-gate + backfill in one change (Directive 2). No file deleted. |

> [!CAUTION]
> No source file is DELETED. `completed.md` is retained by explicit design decision. The `380-dev-located-roadmap-status-write-for-build-debug-closes` deferral closure is a same-`key` ledger append handled in sub-plan 3, Task 14.

## Documentation Updates _(scoped to this sub-plan; cross-cutting docs are in sub-plan 3, Task 14)_

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.agents/docs.md` | New `docs/completed.jsonl` (Universal) + `docs/roadmap.md` (Project Documents) rows (+ template copy). (Task 4.) |
| `docs/completed.md` | One-line "machine source: `docs/completed.jsonl`" note in the managed-block header (+ template). (Task 5.) |
| `.gitattributes` (+ `.bkit/templates/.gitattributes`) | `docs/completed.jsonl merge=union`; `docs/roadmap.md merge=union`. (Tasks 1, 4.) |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **Code** | `git revert {COMMIT}` — all changes are additive files + workflow-step edits | No DB. Reverting restores the `completed.md`-grep verdict reader + drops `docs/roadmap.md` generation. |
| **Data (`completed.jsonl`)** | Delete `docs/completed.jsonl`; revert the ship reader to `completed.md`. `completed.md` was dual-written throughout, so no shipped-FID history is lost | Backfill is idempotent; re-running after revert is safe. |
| **Risk window** | None — no deploy, no migration apply | The only cross-file coupling is the `completed.md → completed.jsonl` touchpoint set (Tasks 1/2/5); land it as one commit so revert is atomic. |

_Code-only — `git revert` sufficient; re-run `bkit install` (sub-plan 3) to re-render mirrors._

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work runbook autonomously. No pause for user permission at any Gate.
> **Blockers:** Task incomplete → create tracker issue (label `blocker`) via configured tracker MCP before stopping.
> **Never drop work silently:** deferrals → `docs/deferrals.jsonl`, bugs → `docs/failures.jsonl` (`.bkit/jsonl.md` format; check existing entries first).
> **Ordering:** schema/foundation → mechanical. Each task fully complete (verification + checkbox) before the next. Gates 2–4 + Mandatory Testing/Documentation + Manual Verification run in sub-plan 3.

> Every task carries a `**Done when:**` line — terse, testable, codebase-verifiable. Test-bearing `Done when` entries map to exactly one `Derived Test Matrix` row.

### Foundation (WS-1)

- [ ] **Task 1 — `completed.jsonl` schema + codec.** Add `kind: "completed"` (payload `{ key, summary, references? }`) to `.bkit/src/bkit-telemetry.ts` (`TelemetryKind` + `VALID_KINDS` + union + `validate`); seed empty `docs/completed.jsonl` + `.bkit/templates/docs/completed.jsonl`; add `docs/completed.jsonl merge=union` to `.gitattributes` (+ templates copy). **Done when:** `bkit-telemetry.test.ts` proves a `completed` row is accepted by `validate` with identity `(kind, repo, key)` and an unknown kind still rejected (matrix row 8); `.gitattributes` carries the union line.
- [ ] **Task 2 — one-time backfill + consumer rollout trigger.** Add `.bkit/scripts/bkit-completed-backfill.sh` (+ template) parsing existing `docs/completed.md` FIDs → idempotent `completed` rows in `docs/completed.jsonl`; wire it to run automatically — idempotently and fail-open — from `bkit upgrade` so EVERY consumer migrates historical FIDs on rollout (not only the bkit repo); document the manual re-run command. On a parse MISS (a variant/malformed `completed.md` entry the `## Title (date)` + `Artifacts:` FID pattern does not match), emit a loud `[bkit-…]` diagnostic — NEVER a silent skip (a silent miss re-materialises that shipped FID as active on the first board, the exact trap the backfill exists to prevent). **Done when:** `bkit-completed-backfill.integration.test.ts` (real `fs`, temp `completed.md`) shows every well-formed entry becomes a row and a second run adds no duplicate (matrix row 9), AND a variant/malformed-entry fixture asserts either the FID is captured or a loud `[bkit-…]` diagnostic fires (never a silent skip); the `bkit upgrade` path invokes the backfill idempotently + fail-open, verified end-to-end in Manual Verification Step 1's scratch-consumer `bkit upgrade` (sub-plan 3).
- [ ] **Task 3 — `bkit-roadmap-fold.sh`.** Create `.bkit/templates/.bkit/scripts/bkit-roadmap-fold.sh`: export `BKIT_ROADMAP_FOLD`; source `BKIT_STATUS_FOLD` with fail-closed guard; on-disk-first scan (design/plan doc presence + `status.jsonl` fold), exclude-completed via `completed.jsonl`, tracker rows merged only when wired; **per-FID upsert** into `roadmap-status` that **idempotently collapses ALL rows matching the FID key to exactly one** (never leaves a duplicate FID row a `merge=union`/`-X ours` collision could produce — KN-42 duplicate-line class; replace every match, not just the first); bootstrap/self-heal; fail-open `[bkit-roadmap]` on every branch. (Lands on the un-shellchecked shipped shell surface tracked by OPEN deferral `58-no-shellcheck-gate-over-bkit-scripts` — no new lint work here.) **Done when:** `bkit-roadmap-fold.test.ts` proves it sources `bkit-status-fold.sh` with the guard + template/repo byte-match hashed in-process via `node:crypto` `createHash` — NOT a shell `md5` shell-out (matrix row 7); `tests/roadmap-fold.bats` proves on-disk board under `tracker: none` (row 1), per-FID upsert preserves a build/debug row (row 2), exclude-completed (row 3), fail-open exit 0 + `[bkit-roadmap]` non-blank (row 4), bootstrap + self-heal (row 5), Backlog region byte-unchanged after regenerate (row 6), and a per-FID upsert collapses PRE-EXISTING duplicate FID rows to exactly one (row 19).
- [ ] **Task 4 — doc-index + roadmap.md contract.** Add `docs/completed.jsonl` (Universal) + `docs/roadmap.md` (Project Documents) rows to `.agents/docs.md` (+ template); add `docs/roadmap.md merge=union` to `.gitattributes` (+ `.bkit/templates/.gitattributes`); document the two marker blocks + `## Backlog / Ideas` region + banner in the fold's bootstrap. **Done when:** `.agents/docs.md` carries both rows; `.gitattributes` AND `.bkit/templates/.gitattributes` each carry the `docs/roadmap.md merge=union` line (grep-verifiable); `bkit check` drift clean on `.agents/docs.md`.

### Mechanical tier (WS-2)

- [ ] **Task 5 — ship verdict reader migration.** Switch `bkit-ship.md` `UPDATE_DOCS_VERDICT` (line ~902) from `grep … docs/completed.md` to `docs/completed.jsonl`; update `@bkit-ship-update-docs` (`.bkit/prompts/bkit-ship-update-docs.md` step 6) to append a `completed.jsonl` row (dual-write with `completed.md`); add the "machine source" note to `docs/completed.md` header (+ template). **Done when:** `bkit-ship-verdict.integration.test.ts` resolves `PASS` from a fixture `completed.jsonl` containing the FID and `FAIL` when absent (matrix row 10).
- [ ] **Task 6 — design/plan close hook + STRAY widen + tracker enrichment.** Add the fold-upsert of `roadmap-status` at the design/plan Close steps on `dev`; add the orchestrator-mediated best-effort `list_issues` enrichment read (when a tracker is wired; never `gh`/`search_issues`; 0/empty inconclusive; skipped no-op under `none`) piping open-issue rows to the fold, satisfying SC#1's "additionally enriched after every workflow close"; widen the STRAY allowlist to include `^docs/roadmap\.md$` (design ~790, plan ~851); fail-open `[bkit-roadmap]` on every branch (unwired, read failure, empty). **Done when:** `bkit-roadmap-staging.integration.test.ts` (boundary: workflow files) asserts both allowlists contain `^docs/roadmap\.md$` (matrix row 11, part 1) AND that each close, when wired, invokes the orchestrator `list_issues` read (never `gh`/`search_issues`) piped to the fold, guarded no-op under `none`, fail-open (matrix row 20).
- [ ] **Task 7 — build/debug close hook + dev-lock dev-write (4th shape) + tracker enrichment.** Add the feat-side upsert (swept by `git add -A`) AND the bounded dev-located roadmap write under the dev-lock idiom at build Step 17 / debug Step 10; add the same orchestrator-mediated `list_issues` enrichment read (when wired; never `gh`/`search_issues`; 0/empty inconclusive; skipped no-op under `none`); fail-open, never gates. **Done when:** `bkit-roadmap-staging.integration.test.ts` asserts build/debug carry both `git add -A` and the dev-lock roadmap write, ship uses scoped `git add -- docs/` (matrix row 11, parts 2–4), and the wired-only enrichment read is present + fail-open (matrix row 20); `bkit-roadmap-devwrite.integration.test.ts` (real temp git repo) proves the dev-lock write returns the worktree to `feat/*`, lands the FID row on `dev`, and is fail-open exit 0 when the lock is held (matrix row 21); `tests/telemetry-failopen.bats` proves each new `[bkit-roadmap]` fail branch (dev-write lock-held/offline; reverse-sync fire/skip/conflict) exits 0 (matrix row 22).

> [!IMPORTANT]
> **Handoff to sub-plan 2.** After Tasks 1–7 land and their tests pass, sub-plan 2 (Analysis + Cadence/Sync/Reconcile) depends on: `bkit-roadmap-fold.sh` + the frontier snapshot (Task 3), the four close-hooks (Tasks 6/7), and `completed.jsonl` (Tasks 1/2/5). `tests/telemetry-failopen.bats` (created here) is extended by sub-plan 2 Task 11.

## Verification (scoped to this sub-plan)

> Full Gate 2/3/4 checkpoints + Manual Verification run in sub-plan 3. Locally verify THIS sub-plan's tasks with their `Done when` assertions before handoff:

- [ ] **Local gate suite on changed files:** `pnpm typecheck` + `pnpm lint` + `pnpm format:check` + `pnpm lint:prose` + `pnpm bkit check` green on the changed files. Do NOT weaken any gate.
- [ ] **This sub-plan's tests pass:** `pnpm test` for `bkit-telemetry.test.ts`, `bkit-roadmap-fold.test.ts`, `bkit-completed-backfill.integration.test.ts`, `bkit-ship-verdict.integration.test.ts`, `bkit-roadmap-staging.integration.test.ts`, `bkit-roadmap-devwrite.integration.test.ts`; `npx --yes bats tests/roadmap-fold.bats tests/telemetry-failopen.bats`.

## Merge Method

**Merge method: always squash.** `gh pr merge --squash --delete-branch --body ""`. The `completed.md → completed.jsonl` touchpoints (reader + writer + hash-gate + backfill — Tasks 1/2/5) MUST land in the same squash so revert is atomic and no ship is ever blocked by a partial migration.

<!-- bkit:end -->
