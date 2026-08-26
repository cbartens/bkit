<!-- bkit:start -->

<!-- bkit:managed v4.8.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Constant roadmap analysis refresh (#380) — Sub-Plan 1/3: Foundation + Mechanical tier (WS-1 + WS-2)

**Parent Plan:** [380-roadmap-analysis-refresh-plan.md](./380-roadmap-analysis-refresh-plan.md)

> [!IMPORTANT]
> **Sub-plan sequencing.** This is sub-plan **1 of 3** (split for session/token budget). Execution order is **1 → 2 → 3**; this sub-plan is the load-bearing foundation everything else reads from (nothing in sub-plans 2/3 can be meaningfully tested without it). Sibling sub-plans:
>
> - [380-roadmap-analysis-refresh-plan-2.md](./380-roadmap-analysis-refresh-plan-2.md) — Analysis + Cadence/Sync/Reconcile (WS-3 + WS-4).
> - [380-roadmap-analysis-refresh-plan-3.md](./380-roadmap-analysis-refresh-plan-3.md) — Utility + Cross-provider/docs (WS-5 + WS-6) + full Verification Plan (Gates 2–4, Manual Verification).
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

**This sub-plan (1/3) builds the foundation + mechanical status tier:** the telemetry codec extension (`kind: "feature"`), the `completed.md → docs/roadmap.jsonl` migration + bootstrap seed (a fifth pair on the existing `bkit telemetry migrate`, which DELETES the `.md` after its parity gate), the `bkit-roadmap-fold.sh` projection helper, doc-index/`.gitattributes` entries, the ship-verdict reader + writer migration **plus the `BOOK_PATHS` staging swap that makes the ship-close row actually commit** (#384; design Addendum 4 § T), and the four workflow close-hook edits (design/plan/build/debug) including the dev-lock 4th staging shape and both STRAY guards per workflow (§ U).

The canonical design (`docs/plans/202607/380-roadmap-analysis-refresh-design.md`) was amended twice after close and re-reviewed. Two inversions and five re-review plan directives are load-bearing and this plan resolves each as concrete tasks:

- **On-disk-first, tracker-optional sensing** — the board builds from `docs/plans/**` artifacts + folded `status.jsonl` + `deferrals`/`failures.jsonl` + a consumer backlog region, and works under `tracker: none`; a `list_issues` MCP read is additive only when a tracker is wired.
- **Canonical-home inversion** — `docs/roadmap.md` is now the **canonical home for issue state** (phase-sectioned board Backlog → Design → Plan → Build → Debug → Ship → Shipped); the tracker is a downstream mirror kept in sync from roadmap.md.
- **Addendum 2 (owner, 2026-07-25)** — `docs/completed.md` is **DELETED**, not retained (§ H); the row is a `deferral`/`failure` row minus `severity` (§ I, amended by Addendum 3); the migration is a fifth pair on `bkit telemetry migrate`, NOT a new backfill script, and by DE-39 is never callable from `bkit upgrade` (§ J); `## Ship` (in flight) and `## Shipped` (last 10) are separate sections (§ K); `.bkit/stats.jsonl` carries no task detail (§ L/§ R); harvest never consumes the ledger (§ M).
- **Addendum 3 (owner, 2026-07-27) — LOAD-BEARING, read first.** `docs/roadmap.jsonl` (`kind: "feature"`, `key` = FID, status ladder `DESIGNED|PLANNED|BUILT|DEBUGGED|SHIPPED|ABANDONED`) is the CANONICAL state, appended at ALL FIVE phase closes (§ N). `docs/roadmap.md` is a **pure projection** — fully regenerated from the ledger, so the per-FID upsert (Directive 1), the KN-42 dedupe invariant, and the reconcile/recovery pass (Directive 4) are **VOID** (§ O). bkit rewrites ONLY bytes strictly between a marker pair; everything outside is consumer scratchpad (§ P). Cadence counts `BUILT` FIDs from the ledger since the last fire, thresholds `bkit.roadmap.buildCycles`=10 / `bkit.roadmap.stalenessDays`=90 in the `package.json` manifest (§ Q). No FID ever enters `stats.jsonl`/`friction.jsonl` (§ R). The on-disk scan becomes a ONE-TIME bootstrap seed (§ S).
- **Directive 1 — VOID (Addendum 3 § O).** The status region is a **full regenerate from `docs/roadmap.jsonl`**, not a per-FID upsert: every phase close appends a ledger row that reaches `dev`, so the board is always re-derivable. The KN-42 duplicate-collapse invariant it required is void with it. **[This sub-plan: Task 3 builds the projection.]**
- **Directive 2** — `docs/completed.md` → `docs/roadmap.jsonl` migrates atomically across ALL touchpoints, via the existing `bkit telemetry migrate` (parity-gated, deletes the `.md`), plus the § S bootstrap seed. **[This sub-plan: Tasks 1/2/5.]**
- **Directive 3** — reverse tracker-label sync (roadmap → tracker) is orchestrator-mediated, settled-drift-guarded, MCP-only, best-effort. **[Sub-plan 2, Task 11.]**
- **Directive 4 — VOID as a recovery path (Addendum 3 § O).** A lost/corrupted board is rebuilt by re-running the fold. What survives is a smaller drift CHECK: warn when a live `feat/*` has NO ledger row (a close that never wrote). **[Sub-plan 2, Task 12, rescoped.]**
- **Directive 5** — build/debug dev-write is fail-open and a **fourth** distinct staging shape; the per-shape CI/bats assertion must cover it. **[This sub-plan: Task 7.]**

> **Directive ↔ design cross-map** (plan directive = design `Re-review findings` #): Directive 1 = re-review #1 (per-FID upsert — now VOID); Directive 2 = re-review #3 (ledger migration + `completed.md` deletion); Directive 3 = re-review #4 (reverse tracker sync); Directive 4 = re-review #2 (reconcile/recovery); Directive 5 = re-review #5 (build/debug 4th staging shape). All five are present + tasked across the three sub-plans; the plan numbering is not the design's re-review order.

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
2. A concurrent close, a merge conflict, or an `-X ours` squash never aborts a close or silently corrupts the board — `docs/roadmap.jsonl` is append-only + `merge=union` and the board is fully regenerated from it, so a lost or clobbered board is rebuilt exactly.
3. Ship-close and `/bkit-roadmap` produce a refreshed analysis block: a ranked best-next-step, dependency-aware issue groupings, and bkit-usage prompt suggestions, stamped with scan coverage. _(Implemented in sub-plans 2/3.)_
4. Ledger/audit integration fires on a deterministic threshold — counting DISTINCT FIDs that reached `BUILT` in `docs/roadmap.jsonl` since the last cadence FIRE (design Addendum 3 § Q; never `.bkit/stats.jsonl` rows, which carry no FID by § R, and never the non-persisted `bkit-counter-bus.sh` helper) plus a staleness-days fallback measured from that same fire: open `deferrals.jsonl`/`failures.jsonl` items and a #80 audit candidate surface as grouped next-steps. _(Implemented in sub-plan 2.)_
5. `docs/roadmap.md` stays consumer-owned — `bkit install` never creates/overwrites it and `bkit check` drift stays clean; only the generator script, the analysis prompt, the utility, the five close-step edits, the ledger migration, and doc-index rows ship.

### Process Sketch _(inherited from design — plan may refine)_

- **WHEN** any workflow reaches Close (after its `bkit:*` transition) **→ THEN** it appends one `kind: "feature"` row to `docs/roadmap.jsonl` at that phase's status, then the fold **fully regenerates** `docs/roadmap.md`'s `roadmap-status` block from the ledger, staged with the phase's existing close commit.
- **WHEN** the squash-merge conflicts on `docs/roadmap.md` (`-X ours`) **→ THEN** it is a non-event: the ledger is append-only + `merge=union`, and the next fold regenerates the board from it. A deleted or corrupted `roadmap.md` is likewise rebuilt exactly.
- **WHEN** ship-close runs OR `/bkit-roadmap` is invoked **→ THEN** `@bkit-roadmap-refresh` rewrites the `roadmap-analysis` block (best next step + groupings + prompt suggestions), bounded + coverage-stamped. _(sub-plans 2/3.)_
- **WHEN** the count of DISTINCT `BUILT` FIDs in `docs/roadmap.jsonl` since the last `ROADMAP_CADENCE_FIRE` crosses `bkit.roadmap.buildCycles` (or `bkit.roadmap.stalenessDays` pass since that same fire) **→ THEN** the analysis pass fires once, rebaselines, injects a #80 audit candidate + open `deferrals`/`failures` items as grouped next-steps, and reconciles tracker labels to the board (settled drift only, when wired). _(sub-plan 2.)_
- **IF** `tracker: none` or the `list_issues` read fails/returns empty **→ THEN** the board is built entirely from on-disk artifacts + the Backlog region (never blank, never gated); every fail-open branch logs `[bkit-roadmap]`.
- **IF** a live in-flight `feat/*` FID has NO `docs/roadmap.jsonl` row (a close that never wrote) **→ THEN** the drift check WARNS with a `[bkit-roadmap]` line; it never mutates the board, which the fold regenerates from the ledger. _(sub-plan 2, Task 12 — Directive 4 rescoped.)_

### Concrete Example _(plan expands from design)_

**Setup:** A `tracker: none` consumer repo, already migrated + seeded (§ S). Two issues in flight: FID `412-export-csv` has `docs/plans/202607/412-export-csv-design.md` + `-plan.md` on disk and is mid-build on `feat/412-export-csv`; FID `418-rate-limit` has only `418-rate-limit-design.md`. A previously-shipped FID `401-login` sits in `docs/roadmap.jsonl` at `SHIPPED`. The consumer has hand-written two lines under `## Backlog / Ideas` at the bottom of `docs/roadmap.md` and one scratch note ABOVE the status block.

**Steps:**

1. User closes `/bkit-build 412` → the build close appends `{key: "412-export-csv", status: "BUILT"}` to `docs/roadmap.jsonl` on `feat/412-export-csv` (via `git add -A`) AND appends the same union-merged line to `dev`'s ledger under the dev-lock (fail-open), regenerating the board from it. System commits with the close commit.
2. User closes `/bkit-plan 418` → the plan close appends `{key: "418-rate-limit", status: "PLANNED"}` and regenerates the board on `dev` (STRAY allowlist widened to accept `docs/roadmap.md` + `docs/roadmap.jsonl`); `401-login` projects into `## Shipped`, not an active section; every byte outside the marker pairs — including the two hand-written Backlog lines — is untouched.
3. User runs `/bkit-roadmap` → `@bkit-roadmap-refresh` reads the frontier snapshot + `deferrals`/`failures.jsonl` + the Backlog region, rewrites `roadmap-analysis` with a ranked best-next-step (folding the two ideas in), stamps "scanned 2 of 2", and appends a `ROADMAP_SCAN_COVERAGE` counter row. _(sub-plans 2/3.)_
4. Ten distinct FIDs reach `BUILT` since the last cadence fire (`bkit.roadmap.buildCycles`), and the next ship close evaluates the threshold → the cadence fires once, rebaselines via a `ROADMAP_CADENCE_FIRE` counter row, and injects a #80 audit candidate + the oldest open `deferrals` item as grouped next-steps; the shipped FID (`412-export-csv`) gains a `SHIPPED` row and projects into `## Shipped` (last 10). _(sub-plan 2.)_

**Outcome:** `docs/roadmap.md` shows every in-flight FID under exactly one phase section with zero manual edits, every byte outside the marker pairs survives each regenerate, shipped FIDs remain visible in `## Shipped` for 10 cycles then fall off, `ABANDONED` FIDs are hidden entirely, and the analysis block names the next best step — all with no tracker connected.

### Edge Cases _(plan expands from design's Key Edge Cases)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Concurrent close / `-X ours` squash eats a feat-side roadmap edit | Non-event: `docs/roadmap.jsonl` is append-only + `merge=union`; the board is regenerated from it on the next fold. |
| Close staging differs per workflow (FOUR shapes) | design/plan widen **both** STRAY allowlists (dev path AND `RUNTIME_DEVPUSHES=false` PR path — design 793/827, plan 854/888; design Addendum 4 § U); build/debug `git add -A` on `feat` PLUS a new dev-lock dev-write; ship stages via the frozen `BOOK_PATHS` allow-list under `$BOOK_ROOT` (#384 — **never** `-A`, never blanket `docs/`; Addendum 4 § T). Per-shape CI/bats assertion, never one grep. |
| `tracker: none` or a `list_issues` read that fails/returns empty | Board built entirely from on-disk artifacts + Backlog; MCP skipped under `none`, treated inconclusive (keep prior tracker rows) when a wired read fails; never blank, never gated; `[bkit-roadmap]` stderr on every fail-open branch. |
| Large tracker (200+ open issues) blows analysis `maxTurns`/context | Bounded scan (open + milestone-scoped, paged), coverage-stamped "scanned N of M" + `ROADMAP_SCAN_COVERAGE` counter row; report budget reserved. _(sub-plan 2.)_ |
| Human hand-edits inside a generated marker block | Loud "generated — do not edit; append to `docs/roadmap.jsonl` or edit outside the markers" banner; the next regenerate reverts the machine region only. |
| Marker blocks missing/mangled on an existing `roadmap.md` | Re-bootstrap in place (re-emit missing marker block[s] + banner) + `[bkit-roadmap]` stderr; never abort the close, never no-op silently. **The repair MUST NOT swallow surrounding consumer text** — the only path that can destroy scratchpad bytes (own matrix row). |
| Consumer scratchpad ANYWHERE outside a marker pair (above the board, between the two blocks, or at the bottom) | NEVER rewritten by any regenerator (Addendum 3 § P — the invariant is marker-pair-scoped, not "below the last marker"); the Backlog region is a declared read-input for the analysis tier (promotable into design; may suggest filing as an issue when wired). |
| Lost/corrupted/deleted `roadmap.md` | Rebuilt exactly by re-running the fold — the board holds no state the ledger lacks. The residual risk is a close that never WROTE its ledger row: the rescoped drift check warns when a live `feat/*` has no row. _(sub-plan 2.)_ |
| Consumer has not run `bkit telemetry migrate` yet (`docs/roadmap.jsonl` absent/empty) | The board would be EMPTY, not wrong — the projection has no rows to draw. The `bkit telemetry migrate` run both ports `completed.md` (rows land at `SHIPPED`) and performs the § S bootstrap seed for in-flight FIDs; an install advisory fires while `completed.md` exists, and the fold emits a `[bkit-roadmap]` line naming the command when it finds an empty ledger beside a non-empty `docs/plans/**`. |
| Ship verdict reader misses the FID | `UPDATE_DOCS_VERDICT` asserts a `SHIPPED`-status row for the FID in `docs/roadmap.jsonl` — **presence alone is not enough**, since a `BUILT` row from the build close would otherwise pass the gate green while ship's writer silently failed. |
| `## Shipped` section grows unbounded | Projected from `docs/roadmap.jsonl` each fold — FIDs whose folded status is `SHIPPED`, `ts` desc, capped at the last **10**; older rows stay in the ledger and fall off the board. No delete step, no state on the board. |
| A feature is dropped and sits in Design forever | A human (or an agent on explicit human instruction) appends a same-`key` row with `status: "ABANDONED"`; the projection hides `ABANDONED` FIDs from every board section. Documented in `.bkit/jsonl.md` + the `roadmap.md` banner. |
| Backlog region as untrusted analysis input | Analysis prompt treats the Backlog region as DATA, not instructions (prompt-injection surface); folds ideas into ranking, never executes them. _(sub-plan 2.)_ |
| build/debug dev-write fails (lock held, offline) | Fail-open: the dev-located roadmap write never gates the close; `[bkit-roadmap]` on every fail branch; feat-side board still written. |

### Derived Test Matrix _(scoped to this sub-plan)_

> Tiers per `docs/testing.md` § Tiers (bkit has Unit `*.test.ts`, Integration `*.integration.test.ts`, Shell `tests/*.bats`, Static — no E2E/@live/fresh-DB). Boundary rows reach the real boundary (real `jq`/`sh`, real `fs`, real `git`) and assert a ground-truth signal, never a mock at the boundary. Row numbers preserve the master plan's numbering for cross-reference.

<!-- prettier-ignore -->
| # | Test description | Type | Target file |
| --- | --- | --- | --- |
| 1 | Fold projects the phase-sectioned board from `docs/roadmap.jsonl` under `tracker: none` (no MCP call attempted); each FID appears under its folded latest status | Shell (bats) | `tests/roadmap-fold.bats` |
| 2 | Full regenerate is deterministic + idempotent: two consecutive folds over the same ledger produce byte-identical marker-block content, and a `BUILT` row written by build is still projected after a later plan-close regenerate | Shell (bats) | `tests/roadmap-fold.bats` |
| 3 | Status projection: `SHIPPED` FIDs leave the active sections for `## Shipped`; `ABANDONED` FIDs are hidden from every section; a same-`key` append moves a FID between sections | Shell (bats) | `tests/roadmap-fold.bats` |
| 4 | Fold fail-open: malformed/empty input + absent tracker → exit 0 + `[bkit-roadmap]` stderr, board never blank | Shell (bats) | `tests/roadmap-fold.bats` |
| 5 | Bootstrap: absent `roadmap.md` → created with two markers + banner + `## Backlog / Ideas`; mangled markers → re-emitted in place | Shell (bats) | `tests/roadmap-fold.bats` |
| 6 | Marker-pair invariant: consumer text ABOVE the status block, BETWEEN the two marker blocks, and BELOW the last marker all survive a regenerate byte-unchanged (Addendum 3 § P) | Shell (bats) | `tests/roadmap-fold.bats` |
| 7 | `bkit-roadmap-fold.sh` sources `BKIT_STATUS_FOLD` (single-source) with the fail-closed `\|\| { … exit 2; }` guard; template copy exists and repo copy byte-matches, hashed in-process via `node:crypto` `createHash` (NEVER a shell `md5` shell-out — avoids the CLOSED macOS-only `status-fold-test-md5-macos-only-fails-linux-ci` portability regression) | Unit (Vitest) | `.bkit/src/bkit-roadmap-fold.test.ts` |
| 8 | New `kind: "feature"` round-trips through the telemetry codec (accepted by `validate`, identity `(kind, repo, key)`, all six `status` values accepted, `severity` rejected); a same-`key` append folds last-wins to the latest status | Unit (Vitest) | `.bkit/src/bkit-telemetry.test.ts` |
| 9 | `bkit telemetry migrate` fifth pair: existing `completed.md` entries → `docs/roadmap.jsonl` rows at `status: "SHIPPED"`; row-count parity gate passes then DELETES `completed.md`; a parity mismatch aborts with the `.md` intact; re-run is an idempotent no-op; the verb stays unreachable from `bkit upgrade` (DE-39) | Integration (Vitest) | `.bkit/src/bkit-telemetry-migrate.integration.test.ts` |
| 10 | Ship verdict reader resolves `UPDATE_DOCS_VERDICT=PASS` only from a `SHIPPED`-status row for the FID in `docs/roadmap.jsonl`, and **FAIL when only a `BUILT` row exists** (green-with-omission guard) | Integration (Vitest) | `.bkit/src/bkit-ship-verdict.integration.test.ts` |
| 11 | Per-workflow-shape staging: design/plan carry `^docs/roadmap\.md$` + `^docs/roadmap\.jsonl$` in **both** STRAY allowlists (dev path AND PR path — 4 sites); build/debug `git add -A`; ship stages via `BOOK_PATHS` (no `git add -- docs/`, no `-A`); build/debug carry the dev-lock dev-write (4th shape) | Integration (Vitest, boundary: workflow files) | `.bkit/src/bkit-roadmap-staging.integration.test.ts` |
| 19 | A `merge=union` collision that duplicates ledger LINES still projects exactly one board row per FID (the fold dedupes by `key` last-wins), and a deleted `roadmap.md` is rebuilt byte-identically from the ledger | Shell (bats) | `tests/roadmap-fold.bats` |
| 20 | Close-hook tracker enrichment when wired: design/plan/build/debug closes read open issues via an orchestrator-mediated `list_issues` (never `gh`/`search_issues`), pipe rows to the fold; skipped no-op under `tracker: none`; fail-open `[bkit-roadmap]` with 0/empty treated inconclusive | Integration (Vitest, boundary: workflow files) | `.bkit/src/bkit-roadmap-staging.integration.test.ts` |
| 21 | build/debug dev-lock dev-write behavioral: over a real temp git repo the worktree returns to `feat/*`, the appended `docs/roadmap.jsonl` line (`BUILT`/`DEBUGGED`) lands on `dev`, and a held lock is fail-open (exit 0, close never gated) | Integration (Vitest, boundary: real git) | `.bkit/src/bkit-roadmap-devwrite.integration.test.ts` |
| 22 | Every new `[bkit-roadmap]` fail branch (dev-write lock-held/offline; reverse-sync fire/skip/conflict) exits 0 and never gates the close | Shell (bats) | `tests/telemetry-failopen.bats` |
| 23 | `## Shipped` projects `SHIPPED` FIDs `ts` desc capped at 10 (the 11th falls off the board but remains in the ledger), while a FID mid-ship (`BUILT`/`DEBUGGED`, no `SHIPPED` row) stays in its active section | Shell (bats) | `tests/roadmap-fold.bats` |
| 24 | Bootstrap seed (§ S): a repo with in-flight `docs/plans/**` artifacts + folded `status.jsonl` but an empty ledger gets one seed row per in-flight FID at its detected status; re-running adds no duplicate; an empty ledger beside non-empty `docs/plans/**` emits the `[bkit-roadmap]` migrate hint | Integration (Vitest) | `.bkit/src/bkit-telemetry-migrate.integration.test.ts` |
| 25 | Self-heal repair of a missing/mangled marker pair re-emits the markers WITHOUT swallowing adjacent consumer text (the only regenerate path that can destroy scratchpad bytes) | Shell (bats) | `tests/roadmap-fold.bats` |
| 26 | Ship `BOOK_PATHS`/`BOOK_ROOT` (#384, design Addendum 4 § T): the frozen `BOOK_PATHS_ALLOW_LIST` carries `docs/roadmap.jsonl` + `docs/roadmap.md` and NO `docs/completed.md`; `bkit-ship.md`'s `BOOK_PATHS` string matches it; the existing negative assertions banning `-A` and bare `docs/` staging still pass (a blanket-`docs/` "fix" reds the suite); ship's roadmap ledger write + verdict read resolve under `$BOOK_ROOT` | Integration (Vitest, boundary: workflow files) | `.bkit/src/bkit-ship-invariants.test.ts` |

> [!NOTE]
> **Row→task mapping** (template's one-row→one-task stretched here per the master plan): fold/projection behaviours (rows 1–7 + 19 + 23 + 25) = **Task 3**; migration + bootstrap seed (rows 9, 24) = **Task 2**; per-workflow-shape staging + close enrichment (rows 11, 20) = **Tasks 6/7** (extended by sub-plan 2 Task 9 for ship Step 10); ship `BOOK_PATHS`/`BOOK_ROOT` (row 26) = **Task 5**; dev-write behavioral (row 21) = **Task 7**; fail-open exit-0 row (22) is shared **Task 7** (dev-write branches, here) + sub-plan 2 **Task 11** (reverse-sync branches). Row 22 is owned here; sub-plan 2's Task 11 extends the same `tests/telemetry-failopen.bats`. Rows 12–18 belong to sub-plans 2/3.

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** Reviewed on the master plan; carried forward here unchanged.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> Shared across all sub-plans (human-confirmed on master). Reproduced verbatim for self-containment.

**Proposed names (new artifacts):**

- `docs/roadmap.jsonl` — the CANONICAL feature ledger (peer of `deferrals`/`failures.jsonl`), new telemetry `kind: "feature"`, appended at all five phase closes.
- `docs/roadmap.md` — consumer-owned generated artifact; a **pure projection** of the ledger. Sections Backlog → Design → Plan → Build → Debug → Ship → Shipped (`## Shipped` = last 10 `SHIPPED` FIDs; `ABANDONED` hidden).
- Marker blocks: `<!-- bkit:roadmap-status start/end -->` and `<!-- bkit:roadmap-analysis start/end -->`; bkit rewrites ONLY bytes strictly between a pair (Addendum 3 § P). Consumer scratchpad lives anywhere outside them; the conventional heading is `## Backlog / Ideas`.
- `.bkit/templates/.bkit/scripts/bkit-roadmap-fold.sh` (+ installed copy `.bkit/scripts/bkit-roadmap-fold.sh`) — sourced fold helper exporting `BKIT_ROADMAP_FOLD`.
- `.bkit/prompts/bkit-roadmap-refresh.md` → renders `@bkit-roadmap-refresh` (opus leaf). _(sub-plan 2.)_
- `.bkit/workflows/bkit-roadmap.md` → renders `/bkit-roadmap` utility command. _(sub-plan 3.)_
- Manifest keys: `bkit.roadmap.buildCycles` (default 10), `bkit.roadmap.stalenessDays` (default 90) in `package.json` — the consumer-adjustable cadence thresholds (Addendum 3 § Q).
- Telemetry names: `counterName: "ROADMAP_SCAN_COVERAGE"`, `counterName: "ROADMAP_CADENCE_FIRE"` (FID-free — `stats.jsonl` is harvested, Addendum 3 § R); observability prefix `[bkit-roadmap]`.

> [!WARNING]
> **Migration — `docs/completed.md` → `docs/roadmap.jsonl` (Directive 2 + Addendum 2 § H/J + Addendum 3 § N/S). THIS IS A FILE REMOVAL.** `completed.md` is DELETED: the ledger becomes the only feature record. All touchpoints migrate in ONE change (else a partial migration blocks every ship at `bkit-ship.md` verdict step):
>
> 1. `@bkit-ship-update-docs` appends a `docs/roadmap.jsonl` row at `status: "SHIPPED"` **instead of** a `completed.md` entry (no dual-write), written under `$BOOK_ROOT` like every other ship bookkeeping write (#384; design Addendum 4 § T).
> 2. `bkit-ship.md` verdict reader (currently `grep -c … docs/completed.md` at **line 961**) switches to asserting a `SHIPPED`-status row for the FID in `$BOOK_ROOT/docs/roadmap.jsonl` — presence alone must NOT pass (a `BUILT` row from the build close would green a failed ship writer). Host mirrors are regenerated, never hand-edited.
> 3. **`BOOK_PATHS` (frozen staging allow-list, `bkit-ship.md` Step 1 line ~187 + its comment block ~177–186) swaps `docs/completed.md` for `docs/roadmap.jsonl` + `docs/roadmap.md`**, and `.bkit/src/bkit-ship-invariants.test.ts`'s `BOOK_PATHS_ALLOW_LIST` (line ~78) mirrors that swap. Without this the ship close stages a deleted path and never commits the `SHIPPED` row — the verdict still greens off the working tree while the board silently loses every shipped FID. The test's negative assertions banning `-A` / bare `docs/` staging MUST stay green (design Addendum 4 § T — do not "fix" staging by reverting to blanket `docs/`).
> 4. `docs/completed.md` (183 lines) + `.bkit/templates/docs/completed.md` are DELETED; the `.bkit/version` `canonicalHashes["docs/completed.md"]` entry is REMOVED (no `.jsonl` replaces it — no ledger is hash-gated); `.gitattributes` (+ template) swaps its `docs/completed.md merge=union` line for `docs/roadmap.jsonl merge=union`; the `.agents/docs.md` catalog row (line 39) is replaced; `.bkit/README.md:355`, `.bkit/workflows.md` (lines 142, 591, 1236) and `.bkit/prompts.md` (lines 184, 312 — the `bkit-ship-update-docs` role/summary text) drop their `completed.md` references. Host mirrors (`.claude/`, `.cursor/`, `.opencode/` × `bkit-ship` + `bkit-ship-update-docs`) still carry the string until the sub-plan 3 Task 15 regen — that is expected, not a miss.
> 5. Content migration extends the EXISTING `bkit telemetry migrate` (`.bkit/src/bkit-telemetry-migrate.ts`) as a fifth `.md`→`.jsonl` pair, inheriting its `.md.bak` → write → row-count-parity → delete-only-after-parity contract and its idempotent re-run; the same run performs the § S **bootstrap seed** (one row per in-flight FID from `docs/plans/**` + folded `status.jsonl`).
> 6. **DE-39 invariant:** that verb is NEVER callable from `bkit upgrade` (mechanically enforced by `bkit-telemetry-migrate.integration.test.ts`). Rollout is therefore explicit-invocation + an install advisory while `completed.md` exists. An unmigrated repo has an EMPTY board (not a wrong one) plus a `[bkit-roadmap]` hint naming the command.

> [!IMPORTANT]
> **build/debug now write `docs/roadmap.md` status to `dev` (Addendum C).** build and debug close steps gain a bounded dev-located roadmap write under ship's dev-lock idiom (fail-open) — the first time these two workflows touch `dev`. This is additive and best-effort; it never gates the close. The prior deferral `380-dev-located-roadmap-status-write-for-build-debug-closes` is thereby SUPERSEDED (pulled into scope) — mark it `CLOSED` in sub-plan 3, Task 14.

No exported TS symbol signatures change (the codec gains a union member, not a breaking change). No consumer command is renamed. `docs/roadmap.md` is net-new and consumer-owned.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** Reviewed on the master plan; carried forward here unchanged.

---

## 👤 ⚠️ Open Questions & Assumptions — HUMAN REVIEW REQUIRED

> Shared across all sub-plans (human-confirmed on master). Reproduced verbatim for self-containment.

- **RESOLVED (cadence numbers, owner 2026-07-27 — Addendum 3 § Q):** `bkit.roadmap.buildCycles` = **10** distinct FIDs reaching `BUILT` since the last cadence FIRE (NOT since the last analysis refresh — that advances every ship and would reset the counter); `bkit.roadmap.stalenessDays` = **90**. Both read from the `package.json` manifest with the existing `bkit.*` jq idiom; the fire timestamp persists as a FID-free `ROADMAP_CADENCE_FIRE` counter row. _(applies in sub-plan 2.)_
- **RESOLVED (board scope, owner 2026-07-25/27 — Addendum 2 § K + Addendum 3 § O):** the board projects each FID under its folded latest ledger status; `SHIPPED` shows in `## Shipped` (`ts` desc, last **10**, then falls off); `ABANDONED` is hidden from every section. Closed/abandoned tracker issues are not shown.
- **RESOLVED (`completed.md` fate, owner 2026-07-25 — Addendum 2 § H):** DELETE it. No dual-write, no generated markdown view; `docs/roadmap.jsonl` is the only feature record.
- **RESOLVED (`ABANDONED` authorship, owner 2026-07-27 — Addendum 3 § N):** appended as a same-`key` row by a human, or by an agent on explicit human instruction — never inferred by a workflow. Documented in `.bkit/jsonl.md` AND the `roadmap.md` banner: append an `ABANDONED` row to remove a FID from the board; `SHIPPED` FIDs need no action (they age off the last-10 window on their own).
- **RESOLVED (codec + harvest scope, owner 2026-07-25/27):** add `kind: "feature"` to the `bkit-telemetry.ts` codec `validate`/identity so readers accept it; **`bkit harvest` does NOT consume `docs/roadmap.jsonl`** — not copy, not count. `HARVEST_COPY_FILES` and the count-only set are unchanged. Corollary (Addendum 3 § R): **no FID or task detail may be added to `stats.jsonl`/`friction.jsonl`** — they are copied cross-repo and carry how bkit performs, never what the consumer is building.
- **Assumption:** the no-concurrent-workflows-per-clone constraint holds → if violated, two closes racing the ledger rely on append-only + `merge=union` + regenerate-from-ledger (designed-for, not designed-around).
- **Assumption:** `docs/roadmap.jsonl` carries a `BUILT` row per built FID (Task 7) and `.bkit/stats.jsonl` carries the FID-free `ROADMAP_CADENCE_FIRE` counter row → if either is missing the cadence count reads 0 and never fires (fail-safe). No FID ever enters `stats.jsonl` (Addendum 3 § R), so the cadence cannot count `outcome` rows. _(applies in sub-plan 2.)_
- **Assumption:** shipped roadmap/analysis text stays stack/vendor-agnostic and cites no tracker-internal refs (`BAR-`/`KN-`/Linear ids) → if violated, the shipped-surface rule reds `slop`/review.
- **Assumption:** #80 lens engine is NOT landed → the cadence injects a generic "run an audit" next-step referencing the audit prompt family, never a hardcoded stack lens. _(applies in sub-plan 2.)_

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** Reviewed on the master plan; carried forward here unchanged.

---

## Alternative Approaches & Recommendations

**Selection rule:** pick the approach with the best quality-of-end-state, NOT the smallest diff.

Chosen (from the design, carried into the plan):

- **Two-tier, two-marker-block generated artifact** inside one consumer-owned file — the deterministic status writer and the opus analysis writer own physically-separate marker regions, so they can never clobber each other, and the Backlog lives below both markers so it is never regenerated.
- **Full regenerate from the ledger** for the status region (Addendum 3 § O) — the per-FID upsert is VOID. Every phase close appends a `merge=union` row that reaches `dev` (build/debug via the dev-lock write), so the board is always re-derivable and needs no upsert, no dedupe invariant, and no recovery pass.
- **Ledger-first, tracker-additive** sensing — the board projects from `docs/roadmap.jsonl` under `tracker: none`; the on-disk scan survives only as the one-time bootstrap seed (§ S); `list_issues` enriches only when wired.
- **`docs/roadmap.jsonl` as the SOLE feature record** (Directive 2 + Addendum 2 § H/I + Addendum 3 § N) — `completed.md` deleted, row = a `deferral`/`failure` row minus `severity` plus a six-state ladder, migrated by the existing parity-gated `bkit telemetry migrate`.

Rejected paths (design § Approaches Considered): blind full-regenerate (reverts build/debug rows); persisted `roadmap.jsonl` event log (deferred to #260); sed-edited single unstructured file (races the shared file); tracker `list_issues` as required/primary source (breaks `tracker: none`); folding analysis into `@bkit-ship-update-docs` (couples to ship-only, blocks reuse); `search_issues` for the tracker read (silently returns 0 on private repos — forbidden; use `list_issues`, treat 0/empty as inconclusive).

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| ~~Persisted `roadmap.jsonl` event log / durable cross-tick frontier history~~ | **NOW IN SCOPE** (Addendum 3 § N) — `docs/roadmap.jsonl` IS that event log. The `380-persisted-frontier-snapshot-event-log-for-260` deferral is SUPERSEDED and closed in sub-plan 3, Task 14; #260 inherits the substrate | In scope, this plan |
| #260 autonomous actuator / sensing contract / standalone sensing schema | Speculative against #260's unbuilt tick (YAGNI); the leaf/fold boundary preserves the evolution path | `#260` |
| #80 lens engine (the concrete audit lenses) | Depends on #80 landing; cadence injects a generic "run an audit" reference until then | `#80` |
| `bkit harvest` / `bkit analysis` ingestion of `docs/roadmap.jsonl` | DECIDED out (owner 2026-07-25) — harvest neither copies nor counts it; codec-acceptance is enough | Not planned |
| `references: ["{FID}"]` on close-step `outcome` rows | **REJECTED, not deferred** (Addendum 3 § R) — `stats.jsonl` is harvested cross-repo; a FID is consumer task detail and must never enter it | Not planned |
| Renaming/splitting `.bkit/stats.jsonl` into an `activity.jsonl` | REJECTED and closed (Addendum 2 § L) — breaks the harvest export contract and puts durable history in the rollup compaction path | Not planned |

> [!CAUTION]
> **Default = in-scope.** TWO deferrals are now superseded and are both appended `CLOSED` in sub-plan 3, Task 14: `380-dev-located-roadmap-status-write-for-build-debug-closes` (Addendum 1 § C — the dev-lock write, now appending a ledger line) and `380-persisted-frontier-snapshot-event-log-for-260` (Addendum 3 § N — `docs/roadmap.jsonl` IS the event log).

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
- [ ] **Existing-solution search (reuse over duplicate):** `bkit-roadmap-fold.sh` SOURCES `BKIT_STATUS_FOLD` from `bkit-status-fold.sh` verbatim (never re-inline — asserted by `bkit-status-fold.test.ts` pattern, whose template/repo byte-match hashes via `node:crypto` `createHash`, never a shell `md5` shell-out — CLOSED `status-fold-test-md5-macos-only-fails-linux-ci`); `docs/roadmap.jsonl` reuses the `.bkit/jsonl.md` envelope + `bkit-telemetry.ts` codec.
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

bkit has no database. The "schema" is the JSONL-ledger + generated-artifact contracts. **Invariant conformance:** every write path is best-effort append (`|| echo "[bkit-…] append failed"`) that exits 0 and never gates a workflow; the ship verdict reader is the one path that must not silently pass — its migration to `docs/roadmap.jsonl` is atomic across all touchpoints so a miss FAILs loudly, never green-with-omission.

### Data Schema Usage (Inputs & Outputs)

- **Input (Read):** `docs/roadmap.jsonl` (the projection's ONLY per-close input, folded by `key` last-wins); `docs/plans/{YYYYMM}/{FID}-{design,plan}.md` presence + per-FID `status.jsonl` folded via `BKIT_STATUS_FOLD` (**bootstrap seed only**, § S — not read per close); every byte outside the marker pairs in `docs/roadmap.md` (preserved, read as bytes only); tracker `list_issues` rows (only when wired); the #202 inline-marker tracker mode.
- **Output (Write):** `docs/roadmap.jsonl` (one `feature` row per phase close — design/plan/build/debug orchestrators, Tasks 6/7; ship via `@bkit-ship-update-docs`, Task 5); `docs/roadmap.md` `roadmap-status` block (FULL regenerate from the ledger, strictly between the marker pair).

### Data Schema Changes

- **ADD** ledger `docs/roadmap.jsonl` — new telemetry `kind: "feature"`, structurally a `deferral`/`failure` row **minus `severity`**, with a six-state ladder (Addendum 2 § I as amended by Addendum 3 § N). Row = envelope + `{ key: "{FID}", status, category, summary, description, references: ["{FID}", "{plan path}", "PR-{n}", "{sha}", "{tracker id}"] }`:
  - `key` = `{FID}`; identity tuple `(kind, repo, key)` via the existing key-based `identity()` default (no new branch). Every phase close is a same-`key` append — `fold()` last-wins gives the current phase; the row sequence is the history.
  - `status` ladder: `DESIGNED` (design close) | `PLANNED` (plan close) | `BUILT` (build close) | `DEBUGGED` (debug close) | `SHIPPED` (ship close) | `ABANDONED` (human-appended, or an agent on explicit human instruction — never workflow-inferred).
  - `category` = the DOMAIN set shared with `deferral`/`failure` (`agentic`/`infra`/`correctness`/…), NOT `completed.md`'s legacy product-shaped set.
  - `summary` = title; `description` = the dense prose formerly in `completed.md`'s `**Summary:**`; `references[]` absorbs its `**Artifacts:**` + `**Related:**`.
  - **No `severity`** (`.bkit/jsonl.md` § Severity forbids it outside the triage trio).
  - Codec: extend `TelemetryKind` union + discriminated payload union + `VALID_KINDS` + minimal `validate` payload check in `.bkit/src/bkit-telemetry.ts`.
- **ADD** manifest keys `bkit.roadmap.buildCycles` (default 10) + `bkit.roadmap.stalenessDays` (default 90) in `package.json`, read via the existing `bkit.*` idiom with defaults in `.bkit/src/bkit-manifest.ts` (Addendum 3 § Q); one-line pointer added to `.agents/config.md`. _(Consumed in sub-plan 2, Task 10.)_
- **REMOVE** `docs/completed.md` + `.bkit/templates/docs/completed.md` (Addendum 2 § H) and its `.bkit/version` `canonicalHashes` entry. No `.jsonl` replaces the hash-gate: no ledger in the tree is hash-gated or install-seeded.
- **ADD** generated artifact `docs/roadmap.md` — header stamp + banner; `roadmap-status` machine block (sections Backlog → Design → Plan → Build → Debug → Ship → Shipped, **fully regenerated from `docs/roadmap.jsonl`** on every fold; per-section rows `FID | Title | Milestone | Blocked-by | Last-transition ts`; `## Shipped` = `SHIPPED` FIDs `ts` desc capped at 10; `ABANDONED` hidden entirely); `roadmap-analysis` machine block (bootstrapped empty here; written by sub-plan 2); consumer scratchpad anywhere OUTSIDE the marker pairs, including the `## Backlog / Ideas` region. No `bkit install`-managed block. `merge=union` in `.gitattributes` (+ templates copy). **The KN-42 duplicate-line hazard does not apply to a full regenerate** — the projection cannot emit two rows for one FID, and duplicate LEDGER lines fold by `key` last-wins (matrix row 19).
- **ADD** in-memory frontier snapshot (fold output, NOT persisted — the durable event log is now `docs/roadmap.jsonl` itself): array of `{ id, phase, milestone, labels?, blockedBy?, lastTransitionTs, source }`, `source ∈ {"ledger","tracker"}`.
- **NO** change to `status.jsonl` schema — the fold is the contract.

## Architecture & Component Changes

**CRITICAL:** shell/jq scripts are edited in `.bkit/templates/.bkit/scripts/` (SSOT); `bkit install` renders the repo copy `.bkit/scripts/` + regenerates `.bkit/version` hashes. Workflow/prompt SSOT is `.bkit/workflows/*.md`. Every `[NEW]` reuses an existing pattern (justified inline). **Mirror regen is batched to sub-plan 3 (WS-6) — do NOT run `bkit install` per-edit here.**

### Roadmap fold foundation (WS-1)

#### [NEW] `.bkit/templates/.bkit/scripts/bkit-roadmap-fold.sh`

- Sourced helper (sibling of `bkit-status-fold.sh`) exporting `BKIT_ROADMAP_FOLD` + shell functions: bootstrap/self-heal `docs/roadmap.md`; the deterministic jq projection `docs/roadmap.jsonl` (folded by `key`, last-wins) `-> phase-sectioned board`; and a **full regenerate** of the `roadmap-status` block from that projection — never an upsert, never a read of the previous board content.
- **Marker-pair invariant (Addendum 3 § P):** the writer replaces ONLY the bytes strictly between a `start`/`end` marker pair. Bytes above the first marker, between the two blocks, and below the last marker are consumer scratchpad and are re-emitted verbatim. The self-heal path for a missing/mangled marker pair MUST insert/repair markers without swallowing adjacent text (matrix row 25) — it is the only regenerate path that can destroy consumer bytes.
- SOURCES `BKIT_STATUS_FOLD` from `bkit-status-fold.sh` verbatim (single-source #58 reducer) with the fail-closed `|| { echo "[bkit-telemetry] …" >&2; exit 2; }` guard — asserted by `bkit-roadmap-fold.test.ts`, whose template/repo byte-match hashes in-process via `node:crypto` `createHash` (NEVER a shell `md5` shell-out — the CLOSED `status-fold-test-md5-macos-only-fails-linux-ci` failure; copy the already-fixed `bkit-status-fold.test.ts` idiom verbatim). `BKIT_STATUS_FOLD` is used by the § S bootstrap seed, not by the per-close projection.
- Projection rules: each FID renders under its folded latest `status`; `SHIPPED` -> `## Shipped` (`ts` desc, cap 10, older rows stay in the ledger); `ABANDONED` -> hidden from every section; tracker rows merged only when the #202 inline-marker mode is `github`/`linear`. An EMPTY ledger beside a non-empty `docs/plans/**` emits a `[bkit-roadmap]` hint naming `bkit telemetry migrate` (the § S seed has not run).
- Fail-open: every branch (empty/malformed input, absent snapshot, tracker rows absent, read failure, 0/empty result, best-effort skip) emits a `[bkit-roadmap]` stderr line and never blanks the board. Reason it can't be folded into `bkit-status-fold.sh`: that reducer is a pure `status.jsonl` fold with a byte/md5-pinned blob; roadmap adds on-disk scan + tracker merge + markdown rendering — a separate, composed helper.

#### [NEW] `docs/roadmap.md` (generated at runtime, NOT shipped by install)

- Consumer-owned generated artifact; bootstrapped by the fold on first close (empty machine blocks + banner + empty `## Backlog / Ideas`). Never written by `bkit install`. Documented once in `.agents/docs.md` Project Documents (below `bkit:end`) — Task 4.

#### [DELETE] `docs/completed.md` + `.bkit/templates/docs/completed.md` — Addendum 2 § H

- **Existence Check:** both exist (repo copy is a Tier-2 managed block, 183 lines, entries appended below `<!-- bkit:end -->`; template 29 lines). Delete BOTH after `bkit telemetry migrate` has ported the entries and passed its parity gate (Task 2 before Task 5). Remove the `.bkit/version` `canonicalHashes["docs/completed.md"]` entry (line 53 — verify `grep completed .bkit/version` is empty afterwards) and every reference, verified live on `dev` at `e14fe9f4`: `.gitattributes` + template (line 9), `.agents/docs.md` (line 39) + template, `.bkit/README.md:355`, `.bkit/workflows.md` (line 142 brace-list `docs/{knowledge,decisions,completed,pending}.md`, line 591 `merge=union` ledger list, line 1236 write-ownership table), `.bkit/prompts.md` (line 184 agent-table purpose cell, line 312 agent-summary row), `.bkit/workflows/bkit-ship.md` (lines 179 + 187 `BOOK_PATHS`, line 961 verdict grep), `.bkit/prompts/bkit-ship-update-docs.md`, `.bkit/src/bkit-ship-invariants.test.ts:80`. NOT touched here: `docs/decisions.jsonl` (historical decision row — append-only history, correctly retains the name) and the six host mirrors (regenerated in sub-plan 3 Task 15).

#### [NEW] `docs/roadmap.jsonl` (runtime-created, NOT shipped by install)

- The canonical feature ledger (peer of `deferrals`/`failures.jsonl`), written at all five phase closes. **No template and no `.bkit/version` entry** — no `.jsonl` in the tree is seeded or hash-gated; the file is born on the migration's first write. `docs/roadmap.jsonl merge=union` in `.gitattributes` (+ templates copy), replacing the `completed.md` line.

#### [MODIFY] `.bkit/src/bkit-telemetry.ts`

- **Existence Check:** exists. Add `"feature"` to `TelemetryKind` + `VALID_KINDS` + the discriminated `TelemetryEvent` union (`FeaturePayload = { key; status; category; summary; description; references? }`, `status` a closed six-value enum) + a minimal `validate` payload branch. `identity()` needs no case (falls through to the key-based default). Assert `severity` is NOT accepted on this kind. Blast radius: `VALID_KINDS` consumers (readers) — greppable; no signature change.

#### [MODIFY] `.agents/docs.md` + `.bkit/templates/.agents/docs.md`

- REPLACE the `docs/completed.md` row (line 39) with `docs/roadmap.jsonl` in the Universal Documents table (written at every phase close, so all five phase columns `●`); add a `docs/roadmap.md` row to the **Project Documents** table (consumer-owned, generated). Both mirrored in the template copy. (Task 4.)

#### [MODIFY] `.gitattributes` + `.bkit/templates/.gitattributes`

- Swap line 9 `docs/completed.md merge=union` → `docs/roadmap.jsonl merge=union`; add `docs/roadmap.md merge=union` (the ledger is append-only; the board is fully regenerated, so a union artefact is collapsed on the next fold).

#### [MODIFY] `.bkit/src/bkit-telemetry-migrate.ts` — Directive 2 + Addendum 2 § J

- **Existence Check:** exists; already migrates FOUR `.md`→`.jsonl` pairs (`docs/knowledge.md`, `docs/decisions.md`, `docs/pending.md`, `.bkit/friction.md`) under one safety contract: transient `.md.bak` → write rows → **row-count parity gate** → delete the `.md` ONLY after parity → abort with ZERO deletion on mismatch → idempotent re-run (`.md` absent + `.jsonl` non-empty = done).
- Add `docs/completed.md` → `docs/roadmap.jsonl` (`kind: "feature"`, `status: "SHIPPED"`) as the FIFTH pair: a `parseCompletedMd` entry parser (`## Title (YYYY-MM-DD)` + `**Category:**` / `**Artifacts:**` / `**Summary:**` / `**Related:**` → `key`/`category`/`summary`/`description`/`references`), a `buildFeatureRow` mapper, `featureRowCount` + `completedMdDeleted` on `MigrateResult`, and the paths/idempotency branch. Legacy category values outside the domain set map to the closest domain term (`other` if none); a parse MISS emits a loud `[bkit-telemetry]` diagnostic, never a silent skip.
- **Bootstrap seed (Addendum 3 § S), same run:** after the parity gate, scan `docs/plans/{YYYYMM}/{FID}-{design,plan}.md` + each folded per-FID `status.jsonl` and append ONE seed row per in-flight FID at its detected status (`DESIGNED`/`PLANNED`/`BUILT`/`DEBUGGED`), skipping FIDs already present in the ledger. Without this the projection has no rows for work already in flight and the first board is empty. Idempotent: re-running adds no duplicate.
- **DO NOT wire this to `bkit upgrade`** — DE-39 forbids it and `bkit-telemetry-migrate.integration.test.ts` enforces it mechanically. Rollout = explicit `bkit telemetry migrate` + the install advisory + the fold's empty-ledger `[bkit-roadmap]` hint. There is NO legacy `completed.md` grep fallback — Task 5 deletes the file and its reader together, so an unmigrated repo has an EMPTY board, never a wrong one.

#### [MODIFY] `.bkit/src/bkit-preflight.ts` (or `bkit-postinstall.ts`) — rollout advisory

- **Existence Check:** both exist with a `PreflightFinding[]` advisory channel. Add one advisory detector: `docs/completed.md` still present → advise running `bkit telemetry migrate`. Advisory severity only — never a blocker, never gating.

### Mechanical status tier (WS-2)

#### [MODIFY] `.bkit/workflows/bkit-design.md`, `bkit-plan.md`

- At the Close step (beside the existing `status.jsonl` commit): append the phase's `docs/roadmap.jsonl` row (`DESIGNED` for design, `PLANNED` for plan) via the `.bkit/jsonl.md` write idiom, then regenerate `roadmap-status` from the ledger. **When a tracker is wired** (`github`/`linear`, NOT `none`) the orchestrator (the workflow itself, NOT the shell fold or any leaf — those have no MCP tools) performs a best-effort `list_issues` MCP read (never `gh`/`search_issues`; 0/empty treated inconclusive) and pipes the open-issue rows to the fold; under `tracker: none` this is skipped entirely. Source `bkit-roadmap-fold.sh` and regenerate `roadmap-status` on `dev` from the ledger (tracker rows merged only when supplied). **Widen BOTH STRAY allowlists in EACH workflow — FOUR sites, not two** (design Addendum 4 § U; verified on `dev` at `e14fe9f4`): each of design/plan carries the guard twice, once per runtime shape — the `RUNTIME_DEVPUSHES=true` dev path (`bkit-design.md:793`, `bkit-plan.md:854`, over `git diff --cached --name-only` after the `-X ours` squash, allowlist `…|^\.bkit/(friction|stats)\.jsonl$`) and the `RUNTIME_DEVPUSHES=false` PR path (`bkit-design.md:827`, `bkit-plan.md:888`, over `git diff --name-only "origin/dev...{BRANCH}"`, narrower allowlist `…|^\.bkit/friction\.jsonl$`). All four add `^docs/roadmap\.md$` and `^docs/roadmap\.jsonl$`; widening only the dev-path pair aborts every PR-mode close with `close-workflow diff carries non-doc files: docs/roadmap.jsonl`. **Runtime-mode note:** "regenerate on `dev`" describes the dev path only — under `RUNTIME_DEVPUSHES=false` the close writes the ledger row + board on the working branch and it reaches `dev` through the squash PR merge (#341 shape A); the fold is identical in both modes. Fail-open `[bkit-roadmap]` on every branch (unwired, read failure, empty). This is what satisfies SC#1's "additionally enriched … after every workflow close" — additive, never a precondition.

#### [MODIFY] `.bkit/workflows/bkit-build.md`, `bkit-debug.md`

- At the Close step: **when a tracker is wired** the orchestrator performs the same best-effort `list_issues` enrichment read (never `gh`/`search_issues`; 0/empty inconclusive; skipped no-op under `none`) and pipes rows to the fold. Append the FID's ledger row (`BUILT` for build, `DEBUGGED` for debug) + regenerate the board on `feat/{FID}` (swept by the existing `git add -A`) AND add a bounded **dev-located write under the dev-lock idiom** (Addendum 1 § C; reuse ship's `.bkit/.dev.lock` acquire/trap/`git checkout dev`/FF/commit/push shape) that appends the SAME `docs/roadmap.jsonl` line to `dev` and regenerates `dev`'s board — the FOURTH staging shape (Directive 5). Because the dev write is an append to a `merge=union` ledger rather than a markdown upsert, it is conflict-free by construction. Fail-open: the enrichment read and the dev-write never gate the close; `[bkit-roadmap]` on every fail branch (lock held, offline, MCP absent, unwired, empty).

#### [MODIFY] `.bkit/workflows/bkit-ship.md` (verdict reader + `BOOK_PATHS`)

- **Existence Check (post-#384, verified on `dev` at `e14fe9f4`):** Step 1 resolves `BOOK_ROOT` (line ~171: `RUNTIME_DEVPUSHES=true` → `$REPO_ROOT`/dev tree; `false` → working-branch tree) and the FROZEN `BOOK_PATHS` staging allow-list (comment block ~177–186, assignment line 187), staged once at Close via `git -C "$WT" add $BOOK_PATHS` (line ~1257) and in the Failure/abort paths (lines ~95/136/489). **The scoped `git add -- docs/` this plan was written against no longer exists anywhere in the file**, and line 28 bans both `-A` and blanket `docs/` staging (design Addendum 4 § T).
- At the ship-close verdict step (line 961), switch `UPDATE_DOCS_VERDICT` from `grep -c … docs/completed.md` to asserting a `SHIPPED`-status row for the FID in `$BOOK_ROOT/docs/roadmap.jsonl` — never mere presence (Task 5).
- Swap `docs/completed.md` → `docs/roadmap.jsonl` + `docs/roadmap.md` in the `BOOK_PATHS` assignment AND its comment block, so the Close-step commit actually carries the ship-close ledger row and the regenerated board. Do NOT widen staging back to `docs/` or `-A`.
- The `roadmap-status` regenerate at ship, the analysis Step 10 wiring, and the cadence step land in sub-plans 2/3; all of them inherit `$BOOK_ROOT` for writes and `BOOK_PATHS` for staging.

#### [MODIFY] `.bkit/src/bkit-ship-invariants.test.ts`

- **Existence Check:** exists; exports `BOOK_PATHS_ALLOW_LIST` (line ~78) as the deliberately FROZEN #384 staging contract — currently containing `docs/completed.md` — plus negative assertions banning `-A` and bare `docs/` staging. Update the frozen list in the SAME change as the `BOOK_PATHS` edit (swap `docs/completed.md` for `docs/roadmap.jsonl` + `docs/roadmap.md`); leave every negative assertion intact. This is the only sanctioned reason to touch the frozen list — record it in the test comment.

#### [MODIFY] `.bkit/prompts.md`

- **Existence Check:** exists; line 184 (agent table, `bkit-ship-update-docs` purpose cell "update completed.md (multi-doc writer)") and line 312 (agent summary "append `completed.md`") both name the retired file. Retarget both to `docs/roadmap.jsonl`. Missed by the original touchpoint inventory.

### Cron Jobs & Scheduled Tasks

None — all triggers are workflow-close-driven or on-demand; no scheduler.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `docs/completed.md` — the FILE and its grep reader | `docs/roadmap.jsonl` (`kind: "feature"`) | REPLACE + **DELETE the file** (repo copy + template + `.bkit/version` entry + all references) | Nobody reads the markdown (humans read `docs/roadmap.md`; the sole machine reader is the ship verdict grep), and two records of the same thing drift. Reader + writer + file removal + content migration land in ONE change (Directive 2, Addendum 2 § H). |
| Per-FID upsert of `roadmap-status` + its KN-42 duplicate-collapse invariant (Directive 1) | Full regenerate from `docs/roadmap.jsonl` | REMOVE (never built — this plan replaces the mechanism before implementation) | The upsert existed only because build/debug rows were not re-derivable from `dev`; the ledger removes that asymmetry (Addendum 3 § O). |
| On-disk artifact scan as the PER-CLOSE phase source | `docs/roadmap.jsonl` projection; the scan survives as the one-time bootstrap seed | REPURPOSE | Phase state now comes from the ledger each close; the scan runs once at migration to seed in-flight FIDs (Addendum 3 § S). |

> [!CAUTION]
> **`docs/completed.md` IS deleted** — but only after `bkit telemetry migrate`'s row-count parity gate passes (Task 2 precedes Task 5); a parity mismatch aborts with the `.md` intact and nothing else in this sub-plan proceeds. The `380-dev-located-roadmap-status-write-for-build-debug-closes` deferral closure is a same-`key` ledger append handled in sub-plan 3, Task 14.

## Documentation Updates _(scoped to this sub-plan; cross-cutting docs are in sub-plan 3, Task 14)_

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.agents/docs.md` | REPLACE the `docs/completed.md` row (line 39) with `docs/roadmap.jsonl` (Universal, written at all five phase closes); add `docs/roadmap.md` (Project Documents) (+ template copy). (Task 4.) |
| `.bkit/README.md`, `.bkit/workflows.md`, `.bkit/prompts.md` | Drop/replace every `docs/completed.md` reference (line numbers verified on `dev` at `e14fe9f4`): README line 355; workflows line 142 (brace-list `docs/{knowledge,decisions,completed,pending}.md`), line 591 (`merge=union` ledger list), line 1236 (write-ownership table); prompts.md line 184 (agent-table purpose cell) + line 312 (agent-summary row). (Task 5.) |
| `.bkit/jsonl.md` | `kind: "feature"` in § Ledgers & Writers (`docs/roadmap.jsonl`, written by ALL FIVE workflow closes + `@bkit-ship-update-docs`), § Per-Kind Fields (incl. the six-value `status` ladder), § Identity/Dedup, § Severity (explicitly excluded), the `ABANDONED` append idiom for removing a FID from the board, + an example row. (Sub-plan 3, Task 14.) |
| `bkit telemetry migrate` CLI help (`.bkit/src/bkit-cli.ts`) | Name the fifth pair `docs/completed.md → docs/roadmap.jsonl` and the bootstrap seed in the verb's help text. (Task 2.) |
| `.gitattributes` (+ `.bkit/templates/.gitattributes`) | Swap `docs/completed.md merge=union` → `docs/roadmap.jsonl merge=union`; add `docs/roadmap.md merge=union`. (Tasks 1, 4.) |
| `.agents/config.md` (+ template) | One-line pointer to the `package.json` `bkit.roadmap.{buildCycles,stalenessDays}` cadence keys — the numbers live in the manifest, not here. (Task 1.) |

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **Code** | `git revert {COMMIT}` — changes are additive files + workflow-step edits + ONE file deletion | No DB. The revert restores `docs/completed.md` (content and all) from git along with the `completed.md`-grep verdict reader, and drops `docs/roadmap.md` generation. |
| **Data (`docs/roadmap.jsonl`)** | Delete `docs/roadmap.jsonl`; the reverted `completed.md` is the record again | The deleted `.md` is recoverable from git history at any commit, and the migration only deletes it after a row-count parity gate — so no feature history is lost in either direction. Re-running `bkit telemetry migrate` after a revert is idempotent and safe. |
| **Risk window** | None — no deploy, no migration apply | The only cross-file coupling is the `completed.md → docs/roadmap.jsonl` touchpoint set (Tasks 1/2/5); land it as one commit so the revert restores the file and its reader together. |

_Code-only — `git revert` sufficient; re-run `bkit install` (sub-plan 3) to re-render mirrors._

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work runbook autonomously. No pause for user permission at any Gate.
> **Blockers:** Task incomplete → create tracker issue (label `blocker`) via configured tracker MCP before stopping.
> **Never drop work silently:** deferrals → `docs/deferrals.jsonl`, bugs → `docs/failures.jsonl` (`.bkit/jsonl.md` format; check existing entries first).
> **Ordering:** schema/foundation → mechanical. Each task fully complete (verification + checkbox) before the next. Gates 2–4 + Mandatory Testing/Documentation + Manual Verification run in sub-plan 3.

> Every task carries a `**Done when:**` line — terse, testable, codebase-verifiable. Test-bearing `Done when` entries map to exactly one `Derived Test Matrix` row.

### Foundation (WS-1)

- [x] **Task 1 — `roadmap.jsonl` schema + codec + manifest keys.** Add `kind: "feature"` (payload `{ key, status, category, summary, description, references? }`; `status` a closed enum `DESIGNED|PLANNED|BUILT|DEBUGGED|SHIPPED|ABANDONED`; no `severity`) to `.bkit/src/bkit-telemetry.ts` (`TelemetryKind` + `VALID_KINDS` + union + `validate`); swap `.gitattributes` line 9 to `docs/roadmap.jsonl merge=union` (+ templates copy); add `bkit.roadmap.buildCycles` (10) + `bkit.roadmap.stalenessDays` (90) defaults to `.bkit/src/bkit-manifest.ts` with a one-line pointer in `.agents/config.md` (+ template). NO template file and NO `.bkit/version` entry for the ledger — it is born on first write, like every other `.jsonl`. **Done when:** `bkit-telemetry.test.ts` proves a `feature` row is accepted by `validate` with identity `(kind, repo, key)`, all six `status` values round-trip, `severity` on the kind is rejected, a same-`key` append folds last-wins to the latest status, and an unknown kind is still rejected (matrix row 8); `.gitattributes` (+ template) carries the `.jsonl` union line and no longer names `completed.md`; `bkit-manifest.test.ts` proves both cadence defaults resolve when `bkit.roadmap` is absent.
- [x] **Task 2 — `bkit telemetry migrate` fifth pair + bootstrap seed + rollout advisory.** Extend `.bkit/src/bkit-telemetry-migrate.ts` with `docs/completed.md` → `docs/roadmap.jsonl` (`kind: "feature"`, `status: "SHIPPED"`): entry parser (`## Title (YYYY-MM-DD)` + `**Category:**`/`**Artifacts:**`/`**Summary:**`/`**Related:**` → `key`/`category`/`summary`/`description`/`references`), row builder, `featureRowCount` + `completedMdDeleted` on `MigrateResult`, paths + idempotency branch — all under the EXISTING `.md.bak` → parity-gate → delete-only-after-parity contract. Map legacy categories (`backend`/`frontend`/`data`/`integrations`/`ai`) onto the domain set, `other` if none. In the SAME run, perform the **§ S bootstrap seed**: scan `docs/plans/{YYYYMM}/{FID}-{design,plan}.md` + folded per-FID `status.jsonl` and append one row per in-flight FID at its detected status, skipping FIDs already in the ledger. On a parse MISS emit a loud `[bkit-telemetry]` diagnostic — NEVER a silent skip. Update the verb's CLI help. Add ONE advisory detector (`PreflightFinding`) firing while `docs/completed.md` still exists, naming `bkit telemetry migrate`. **DO NOT wire the migrator to `bkit upgrade`** — DE-39 forbids it. **Done when:** `bkit-telemetry-migrate.integration.test.ts` (real `fs`, temp fixtures) shows every well-formed entry becomes a `SHIPPED` row, the parity gate passes and DELETES `completed.md`, a seeded parity mismatch aborts with the `.md` intact, a second run is an idempotent no-op (matrix row 9), the seed writes one row per in-flight FID at its detected status and adds no duplicate on re-run (matrix row 24), a variant/malformed entry yields capture or a loud diagnostic (never a silent skip), and the existing "never reachable from `bkit upgrade`" assertion still passes with the new pair; the advisory fires only while the `.md` exists.
- [x] **Task 3 — `bkit-roadmap-fold.sh` (projection).** Create `.bkit/templates/.bkit/scripts/bkit-roadmap-fold.sh`: export `BKIT_ROADMAP_FOLD`; source `BKIT_STATUS_FOLD` with the fail-closed guard (used by the seed, not the per-close path); fold `docs/roadmap.jsonl` by `key` last-wins and **fully regenerate** the `roadmap-status` block — sections by folded status, `SHIPPED` into `## Shipped` (`ts` desc, cap 10), `ABANDONED` hidden, tracker rows merged only when wired; bootstrap/self-heal; fail-open `[bkit-roadmap]` on every branch including the empty-ledger migrate hint. **Honour the marker-pair invariant:** rewrite only bytes strictly between a `start`/`end` pair; re-emit everything outside verbatim; repair mangled markers without swallowing adjacent text. (Lands on the un-shellchecked shipped shell surface tracked by OPEN deferral `58-no-shellcheck-gate-over-bkit-scripts` — no new lint work here.) **Done when:** `bkit-roadmap-fold.test.ts` proves it sources `bkit-status-fold.sh` with the guard + template/repo byte-match hashed in-process via `node:crypto` `createHash` — NOT a shell `md5` shell-out (matrix row 7); `tests/roadmap-fold.bats` proves the ledger projection under `tracker: none` (row 1), deterministic + idempotent regenerate preserving a build-written row (row 2), status projection incl. `ABANDONED` hidden (row 3), fail-open exit 0 + `[bkit-roadmap]` non-blank (row 4), bootstrap + self-heal (row 5), consumer text above/between/below the markers byte-unchanged (row 6), duplicate ledger lines collapsing to one board row + a deleted board rebuilt byte-identically (row 19), `## Shipped` capped at 10 with mid-ship FIDs left in place (row 23), and marker repair that does not swallow adjacent consumer text (row 25).
- [x] **Task 4 — doc-index + roadmap.md contract.** REPLACE the `docs/completed.md` row (line 39) with `docs/roadmap.jsonl` (Universal, all five phase columns) and add a `docs/roadmap.md` (Project Documents) row in `.agents/docs.md` (+ template); add `docs/roadmap.md merge=union` to `.gitattributes` (+ `.bkit/templates/.gitattributes`); document the two marker blocks, the marker-pair invariant, the `ABANDONED` removal idiom, and the `## Shipped` last-10 behaviour in the fold's bootstrap banner. **Done when:** `.agents/docs.md` carries both rows and no `completed.md` row; `.gitattributes` AND `.bkit/templates/.gitattributes` each carry the `docs/roadmap.md merge=union` line (grep-verifiable); the bootstrap banner names the `ABANDONED` idiom; `bkit check` drift clean on `.agents/docs.md`.

### Mechanical tier (WS-2)

- [x] **Task 5 — ship writer + verdict reader + `BOOK_PATHS` migration + `completed.md` removal.** Update `@bkit-ship-update-docs` (`.bkit/prompts/bkit-ship-update-docs.md` step 6) to append a `docs/roadmap.jsonl` row at `status: "SHIPPED"` in `.bkit/jsonl.md` format **instead of** a `completed.md` entry (no dual-write) — written under `$BOOK_ROOT` at Step 10, before the verdict reads it, preserving today's ordering. Switch `bkit-ship.md` `UPDATE_DOCS_VERDICT` (**line 961**) to assert a `SHIPPED`-status row for the FID in `$BOOK_ROOT/docs/roadmap.jsonl` (presence alone MUST NOT pass — a `BUILT` row from the build close would otherwise green a failed ship writer). **Swap `docs/completed.md` → `docs/roadmap.jsonl` + `docs/roadmap.md` in `bkit-ship.md`'s `BOOK_PATHS` assignment (line 187) and its comment block (~177–186), and mirror the swap in `.bkit/src/bkit-ship-invariants.test.ts`'s frozen `BOOK_PATHS_ALLOW_LIST` (line ~78)** — without it the close stages a deleted path and never commits the `SHIPPED` row while the verdict greens off the working tree (design Addendum 4 § T). Do NOT reintroduce `-A` or blanket `docs/` staging; the test's negative assertions must stay green. Then DELETE `docs/completed.md` + `.bkit/templates/docs/completed.md` (only after Task 2's parity gate passed), remove its `.bkit/version` `canonicalHashes` entry (line 53), and drop its references in `.bkit/README.md:355`, `.bkit/workflows.md` (142, 591, 1236) and `.bkit/prompts.md` (184, 312). **Done when:** `bkit-ship-verdict.integration.test.ts` resolves `PASS` from a fixture ledger holding a `SHIPPED` row for the FID, `FAIL` when the FID is absent, and `FAIL` when only a `BUILT` row exists (matrix row 10); `bkit-ship-invariants.test.ts` proves the frozen allow-list and `bkit-ship.md`'s `BOOK_PATHS` string agree, carry both roadmap paths, carry no `completed.md`, and that the `-A`/bare-`docs/` bans still pass (matrix row 26); `grep -rln "completed\.md" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=plans .` returns ONLY `docs/decisions.jsonl` (historical row, correct) and the six host mirrors (`.claude|.cursor|.opencode` × `bkit-ship` + `bkit-ship-update-docs`, cleared by sub-plan 3 Task 15's regen); `grep completed .bkit/version` is empty.
- [x] **Task 6 — design/plan close hook + STRAY widen (4 sites) + tracker enrichment.** At the design/plan Close steps append the phase's ledger row (`DESIGNED`/`PLANNED`) and regenerate `roadmap-status` from the ledger — on `dev` under `RUNTIME_DEVPUSHES=true`, on the working branch under `false` (it reaches `dev` via the squash PR merge, #341 shape A); add the orchestrator-mediated best-effort `list_issues` enrichment read (when a tracker is wired; never `gh`/`search_issues`; 0/empty inconclusive; skipped no-op under `none`); **widen ALL FOUR STRAY allowlists** to include BOTH `^docs/roadmap\.md$` and `^docs/roadmap\.jsonl$` — dev path `bkit-design.md:793` + `bkit-plan.md:854` AND PR path `bkit-design.md:827` + `bkit-plan.md:888` (design Addendum 4 § U; missing the PR pair aborts every PR-mode close); fail-open `[bkit-roadmap]` on every branch. **Done when:** `bkit-roadmap-staging.integration.test.ts` (boundary: workflow files) asserts all FOUR allowlists contain both patterns — asserted per occurrence, not by a file-level `grep -q` that one match satisfies — and that each close appends its status row before regenerating (matrix row 11, part 1) AND that each close, when wired, invokes the orchestrator `list_issues` read (never `gh`/`search_issues`) piped to the fold, guarded no-op under `none`, fail-open (matrix row 20).
- [x] **Task 7 — build/debug close hook + dev-lock ledger append (4th shape) + tracker enrichment.** At build Step 17 / debug Step 10 append the FID's ledger row (`BUILT`/`DEBUGGED`) + regenerate the board on `feat/{FID}` (swept by `git add -A`) AND add the bounded dev-located write under the dev-lock idiom that appends the SAME `merge=union` ledger line to `dev` and regenerates `dev`'s board; add the same orchestrator-mediated `list_issues` enrichment read (when wired; never `gh`/`search_issues`; 0/empty inconclusive; skipped no-op under `none`); fail-open, never gates. **Done when:** `bkit-roadmap-staging.integration.test.ts` asserts build/debug carry both `git add -A` (build Step 17 line ~1285, debug Step 10 line ~1129 — both verified present on `dev`) and the dev-lock ledger append, and that ship stages the roadmap paths via `BOOK_PATHS` with no `git add -- docs/` and no `-A` anywhere in `bkit-ship.md` (matrix row 11, parts 2–4; the `BOOK_PATHS` content itself is matrix row 26 / Task 5), and the wired-only enrichment read is present + fail-open (matrix row 20); `bkit-roadmap-devwrite.integration.test.ts` (real temp git repo) proves the dev-lock write returns the worktree to `feat/*`, lands the status row on `dev`, and is fail-open exit 0 when the lock is held (matrix row 21); `tests/telemetry-failopen.bats` proves each new `[bkit-roadmap]` fail branch exits 0 (matrix row 22).

> [!IMPORTANT]
> **Handoff to sub-plan 2.** After Tasks 1–7 land and their tests pass, sub-plan 2 (Analysis + Cadence/Sync/Reconcile) depends on: `bkit-roadmap-fold.sh` + the frontier snapshot + the `## Shipped` projection (Task 3), the four close-hooks (Tasks 6/7), `docs/roadmap.jsonl` + `kind: "feature"` with `completed.md` deleted (Tasks 1/2/5), and the `bkit.roadmap.{buildCycles,stalenessDays}` manifest keys (Task 1). `tests/telemetry-failopen.bats` (created here) is extended by sub-plan 2 Task 11.

## Verification (scoped to this sub-plan)

> Full Gate 2/3/4 checkpoints + Manual Verification run in sub-plan 3. Locally verify THIS sub-plan's tasks with their `Done when` assertions before handoff:

- [ ] **Local gate suite on changed files:** `pnpm typecheck` + `pnpm lint` + `pnpm format:check` + `pnpm lint:prose` + `pnpm bkit check` green on the changed files. Do NOT weaken any gate.
- [x] **This sub-plan's tests pass:** `pnpm test` for `bkit-telemetry.test.ts`, `bkit-roadmap-fold.test.ts`, `bkit-telemetry-migrate.integration.test.ts`, `bkit-ship-verdict.integration.test.ts`, `bkit-roadmap-staging.integration.test.ts`, `bkit-roadmap-devwrite.integration.test.ts`, and the updated `bkit-ship-invariants.test.ts` (frozen `BOOK_PATHS_ALLOW_LIST` + intact `-A`/bare-`docs/` bans); `npx --yes bats tests/roadmap-fold.bats tests/telemetry-failopen.bats`.

## Merge Method

**Merge method: always squash.** `gh pr merge --squash --delete-branch --body ""`. The `completed.md → docs/roadmap.jsonl` touchpoints (codec + migrator + writer + reader + file deletion + manifest/`.gitattributes`/doc-index references — Tasks 1/2/5) MUST land in the same squash so revert is atomic (restoring the deleted `.md` together with its reader) and no ship is ever blocked by a partial migration.

<!-- bkit:end -->
