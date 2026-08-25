Verdict: PASS
<!-- verdict:end -->

# Design: Constant roadmap analysis refresh (#380)

## Related Issues

- #260 — Milestone Orchestrator autonomous PM loop that drives workstreams (open) — comment `#260-4724691125` ("auto update … roadmap.md to always suggest best next issue") is the direct precursor; #380 is the extraction of that sub-requirement, and #380's fold is #260's tick-step-1 sense primitive.
- #214 — bkit roadmap (open) — the hand-maintained living sequencing reference this feature automates into `docs/roadmap.md`.
- #209 — Workflow state model: squash-to-dev + persistent `feat/{FID}`, NDJSON `status.jsonl` (closed) — precedent for where `docs/roadmap.md` writes live (feat-located reaching `dev` via squash-merge), `merge=union`, the Close STRAY-guard, and the `-X ours` conflict class.
- #80 — `bkit-audit` lens engine (open) — the audit-candidate source injected on the cadence trigger; #260 is its deferred automated-trigger home.
- #324 — recurring self-healing audit loop / after-ship trigger (open) — shares the same post-merge event substrate; noted, not a dependency.
- #236 — Post-mortem on consumer debug sessions (closed) — source of the `green == validated` trust ceiling + the stack-independence rule the roadmap agent must respect.

## Acceptance Scenario

### Narrative

As a bkit user, after I close any workflow phase for an issue, `docs/roadmap.md` shows that issue under its current phase with no manual edit, so anyone — human or agent — can see where every open issue stands. When I ship an issue (or run `/bkit-roadmap` on demand), bkit refreshes an opus-authored "best next step": dependency-aware issue groupings, IDE- and model-aware prompt suggestions (including when NOT to use bkit), and periodically-injected audit and backlog candidates, so I always know what to work on next and how to drive bkit optimally.

### Success Criteria

1. After every workflow close, `docs/roadmap.md`'s status board reflects each open issue's current phase (projected from tracker `bkit:*` labels + `status.jsonl`), with no manual edit and no analysis/subagent turn (the tracker read is an orchestrator-mediated `list_issues` MCP call piped to the fold — NOT a standalone `gh`/shell path, which would break Linear tracker-agnosticism).
2. A concurrent close, a merge conflict, or an `-X ours` squash never aborts a close or silently corrupts the board — the status board is deterministically regenerable from the tracker.
3. Ship-close and `/bkit-roadmap` produce a refreshed analysis block: a ranked best-next-step, dependency-aware issue groupings, and bkit-usage prompt suggestions, stamped with scan coverage.
4. Ledger/audit integration fires on a deterministic threshold (not "periodically"), computed by counting persisted ship-close rows in the committed `.bkit/stats.jsonl` (NOT the non-persisted `bkit-counter-bus.sh` helper) plus a staleness-days fallback: open `deferrals.jsonl`/`failures.jsonl` items and a #80 audit candidate surface as grouped next-steps.
5. `docs/roadmap.md` stays consumer-owned — `bkit install` never overwrites it and `bkit check` drift stays clean; only the generator, the analysis prompt, the utility, the five close-step edits, and one `.agents/docs.md` index row ship.

### Key Edge Cases

- **Concurrent close / `-X ours` squash eating a feat-side roadmap edit** — the status block is a full tracker projection, re-rendered at every dev-reaching close; a lost or conflicted edit is a non-event because the board is reproducible from the tracker.
- **Close staging differs per workflow — the mechanical hook integrates three ways, NOT one uniform allowlist widen** — the STRAY-file guard allowlist (`^docs/plans/|^docs/(deferrals|decisions|failures)\.jsonl$|^\.bkit/friction\.jsonl$`) lives ONLY in `bkit-design.md` and `bkit-plan.md`; those two must widen it to include `^docs/roadmap\.md$`. `bkit-build.md`/`bkit-debug.md` close with `git add -A` (no allowlist — a staged `roadmap.md` is swept in automatically, on `feat/{FID}`), and `bkit-ship.md` stages docs with a scoped `git add -- docs/` that already captures `docs/roadmap.md`. The mandatory CI/bats assertion must be per-workflow-shape aware (asserting the correct staging behaviour for each of the three shapes), NOT a single grep for one allowlist across all five — a naive grep passes while a build/debug close silently mis-stages, or fails spuriously on the workflows that have no allowlist to widen.
- **Large tracker (200+ open issues) blows the analysis subagent's context/`maxTurns`** — scan is bounded (open + milestone-scoped, paged), coverage-stamped ("scanned N of M"), with report budget reserved; a truncated but authoritative-looking "best next step" is the failure to avoid.
- **Human hand-edits the generated status block** — a loud "generated — edit tracker labels, not this block" banner; the next regenerate reverts it, so the live truth stays the tracker.
- **Marker blocks themselves missing/mangled on an existing (non-bootstrap) `docs/roadmap.md`** — distinct from bootstrap (file absent) and from in-block hand-edits (banner-revert covers those): the anchor markers (`<!-- bkit:roadmap-status start/end -->` / `<!-- bkit:roadmap-analysis start/end -->`) are gone. Decided behaviour = re-bootstrap in place (re-emit the missing marker block(s) with the banner) and emit a `[bkit-roadmap]` stderr line, rather than abort the close or silently no-op — the file self-heals on the next close without a manual fix or a blocked consumer.
- **build/debug commit to `feat/{FID}`, not `dev`** — their status refresh reaches `dev` only at ship; between ships, `dev`'s board is refreshed by the next design/plan/ship close and the tracker remains the live-phase authority (surfaced decision for the human gate).

### Process Sketch

- WHEN any workflow reaches Close (after its `bkit:*` label transition) → THEN regenerate the `roadmap-status` block from a bounded tracker read + folded `status.jsonl` and commit it with the phase's existing close commit.
- WHEN the squash-merge conflicts on `docs/roadmap.md` → THEN take either side and re-run the fold (no halt, no silent loss).
- WHEN ship-close runs OR `/bkit-roadmap` is invoked → THEN `@bkit-roadmap-refresh` rewrites the `roadmap-analysis` block (best next step + groupings + prompt suggestions), bounded and coverage-stamped.
- WHEN the ship-cycle counter crosses N (or the staleness threshold) → THEN inject a #80 audit candidate and surface open `deferrals.jsonl`/`failures.jsonl` items as grouped next-steps.
- WHEN an agent needs live phase mid-build/debug → THEN it reads tracker labels (authoritative); `docs/roadmap.md` status is the refreshed-at-close convenience view.

## Architecture

Two tiers writing two physically-separate machine-owned blocks inside one consumer-owned file, so the cheap deterministic writer and the expensive opus writer can never clobber each other.

**Components**

1. **`docs/roadmap.md`** — consumer-owned generated artifact (peer of `deferrals.jsonl`), NOT a shipped managed-block template. Holds two generator-owned regions delimited by distinct markers — `<!-- bkit:roadmap-status start/end -->` and `<!-- bkit:roadmap-analysis start/end -->` — plus a free consumer-editable region outside them. Bootstrapped on first run if absent. Header stamp: "Status projected from tracker labels at {ts}; for live phase, read tracker labels."
2. **`.bkit/scripts/bkit-roadmap-fold.sh`** — sourced shell helper, sibling of `bkit-status-fold.sh`, providing the deterministic projection jq blob: `(tracker label rows + folded status.jsonl) -> status-board table + structured frontier snapshot`. It SOURCES `BKIT_STATUS_FOLD` from `bkit-status-fold.sh` verbatim for the `status.jsonl` half (reusing the #58 single-source reducer, never re-inlining it) and adds the tracker-label projection blob alongside it. Every fail-open branch (empty/malformed fold input, missing snapshot) emits a `[bkit-roadmap]` stderr line per the `docs/observability.md` bracketed-prefix convention. This fold IS #260's tick-step-1 "reconstruct the frontier" sense primitive; #260 consumes the same helper and its snapshot.
3. **Mechanical close-step hook** — added to each of the five workflows' Close step, beside the existing `status.jsonl` commit: a bounded `list_issues` MCP read (open + milestone-scoped) piped through the fold to rewrite the `roadmap-status` block, then staged and committed with the phase's existing close commit. Staging is per-workflow-shape (NOT one uniform allowlist widen): `bkit-design.md`/`bkit-plan.md` widen their STRAY allowlist to `^docs/roadmap\.md$`; `bkit-build.md`/`bkit-debug.md` already sweep it via `git add -A`; `bkit-ship.md` already captures it via the scoped `git add -- docs/`. Deterministic (MCP tool call + jq render), no analysis/subagent turn. Best-effort: a failed, empty, or inconclusive tracker read keeps the prior block, never gates the close, and emits a `[bkit-roadmap]` stderr line on every fail-open branch (read failure, 0/empty result, best-effort skip) so a persistent degradation — e.g. an expired token that silently no-ops the write every close — is grep-visible in a CI log or `bkit-debug` transcript rather than invisible.
4. **`@bkit-roadmap-refresh`** — opus leaf subagent that rewrites ONLY the `roadmap-analysis` block. Added as the third parallel subagent in ship Step 10 (alongside `@bkit-ship-update-docs` ‖ `@bkit-ship-summary`) and reused verbatim by the utility. Ordering: Step 10 writes the `roadmap-analysis` block into `docs/roadmap.md`; the subsequent Step 11 scoped `git add -- docs/` stages and commits it — the write provably precedes the stage, so the analysis block is never left written-but-uncommitted.
5. **`/bkit-roadmap`** — new on-demand utility workflow (mirrors the `bkit-worktree-*` utility shape) that runs the mechanical fold + invokes `@bkit-roadmap-refresh`.
6. **`.agents/docs.md`** — one new row for `docs/roadmap.md` in the Project Documents table (below `bkit:end`, consumer-owned).
7. **Cadence counter** — the ship-cycle count is DERIVED by counting persisted ship-close rows already committed to `.bkit/stats.jsonl` (e.g. `outcome` rows where `workflow == "ship"`; equivalently a persisted `counter` row `counterName: "SHIP_CYCLE"`, `counterSource: "shell-bus"` written at ship-close) — NOT via the `bkit-counter-bus.sh` `counter_count`/`counter_next` helpers, which are derive-from-active-run, non-persisted, per-FID and would return per-run attempt counts. The threshold fires the audit/ledger injection when the persisted ship count crosses `N`; a staleness-days fallback is measured from the `roadmap-analysis` header-stamp `ts` (days since the last analysis refresh). The analysis pass emits an `[bkit-analysis]`-family log line on both counter-advance and injection-fire so a stalled counter, an off-by-one threshold, or a silently-skipped injection is observable (distinguishing "no candidates existed" from "injection broke"); the cadence count reads through the existing generic `counter`-reader in `bkit analysis`, not a new counter mechanism.

**Boundaries / integration points**

- Mechanical tier = deterministic, writes only `roadmap-status`; analysis tier = opus, writes only `roadmap-analysis`. The two-block seam is the anti-clobber guarantee.
- Tracker access = `list_issues` MCP read only (never `search_issues` — it silently returns 0 on private repos; treat a 0/empty result as inconclusive and keep the prior block). `docs/roadmap.md` is a file write, so no tracker-write-scope conflict.
- Ship Step 10 parallel-subagent block gains a third agent; each workflow Close step gains the mechanical hook, staged per its existing shape (design/plan widen the STRAY allowlist; build/debug rely on `git add -A`; ship on the scoped `git add -- docs/`); the persisted ship-close-row count on `.bkit/stats.jsonl` drives cadence; `.agents/docs.md` gains one row.
- Every edited workflow/agent requires cross-provider mirror regen (claude/cursor/opencode), batched at session end.

## Data Model

- **`docs/roadmap.md`** — header stamp; `roadmap-status` block (machine-owned); `roadmap-analysis` block (machine-owned); free consumer region. No `bkit install`-managed block.
- **Status-board table columns** — `Issue | Title | Phase (bkit:* label) | Milestone | Blocked-by / dependency hint | Last-transition ts`. Rows = open issues (proposal: open + recently-merged; closed history stays in `docs/completed.md`).
- **Frontier snapshot** (the fold's structured output, in-memory / not persisted) — array of `{ issue, phase, milestone, labels, blockedBy?, lastTransitionTs }`. This is the #260-consumable structure; deliberately NOT written to a new `roadmap.jsonl` ledger.
- **Analysis coverage record** (first-class telemetry, NOT just a Risks-section aside) — a `counter` row on `.bkit/stats.jsonl` written by `@bkit-roadmap-refresh` at the end of every analysis pass: `kind: "counter"`, `counterName: "ROADMAP_SCAN_COVERAGE"`, `counterValue` = issues scanned (or scanned/total ×100), `counterSource: "model-self-report"`, plus the envelope `workflow`/`step`/`subagent`/`model`/`parentSha`. Paired with the human-readable "scanned N of M" stamp inside the `roadmap-analysis` block. This makes a shrinking coverage ratio (the design's named "failure to avoid" — a truncated-but-authoritative-looking best-next-step) observable through the existing generic `counter`-reader, not only by a human reading `roadmap.md` prose. Best-effort append (`[bkit-telemetry]` fail-open), never gates ship.
- **Reused existing state** — tracker `bkit:*` labels (the live state machine), per-FID `status.jsonl` (phase-transition events, folded via the existing reducer), persisted `.bkit/stats.jsonl` ship-close rows (the cadence count — see Component 7; NOT the non-persisted counter-bus helper), `docs/deferrals.jsonl` + `docs/failures.jsonl` (backlog candidates ranked by severity then age). No new schema version — the fold is the contract.

## Components / Flows

- **Mechanical flow (every close)** — after the `bkit:*` label transition, at Close: `list_issues` (bounded) + fold `status.jsonl` -> rewrite `roadmap-status` -> stage per the workflow's existing shape (design/plan: widened STRAY allowlist; build/debug: `git add -A`; ship: scoped `git add -- docs/`) + commit where the phase commits (dev for design/plan/ship; feat for build/debug, reaching dev at ship). Regenerate-on-conflict; every fail-open branch logs `[bkit-roadmap]`.
- **Analysis flow (ship + on-demand)** — `@bkit-roadmap-refresh` reads the bounded frontier + `.agents/docs.md` + `deferrals.jsonl`/`failures.jsonl` -> writes `roadmap-analysis`: ranked best-next-step, dependency-aware groupings (reusing `design-organise` seam logic), prompt suggestions (bkit-optimal usage; when-NOT-to-use via `plan-complexity-check`; IDE read from install config; model recommendations by doctrine-reference; opus-plans/sonnet-executes subagent-maximising shape) -> coverage output: the "scanned N of M" text stamp AND a `ROADMAP_SCAN_COVERAGE` `counter` row appended to `.bkit/stats.jsonl` so shrinking coverage is machine-visible.
- **Cadence flow** — at ship-close, count the persisted ship-close rows in committed `.bkit/stats.jsonl` (see Component 7; never the non-persisted counter-bus helper); when that count crosses `N` (propose N=5) or the staleness-days threshold (measured from the `roadmap-analysis` header-stamp `ts`) is crossed, the analysis pass injects a #80 audit candidate + open `deferrals.jsonl`/`failures.jsonl` items as grouped next-steps, and logs an `[bkit-analysis]`-family line on counter-advance and injection-fire.
- **Bootstrap flow** — first run creates `docs/roadmap.md` with empty marker blocks + the banner if the file is absent.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Two-tier model: deterministic `roadmap-status` block regenerated at every close + opus `roadmap-analysis` block at ship + on-demand | Single tier (analysis-only, or mechanical-only) | Owner-confirmed (design-input Comment 2); all three brainstorm lenses converge on it. |
| `docs/roadmap.md` = consumer-owned generated artifact, two machine-owned marker blocks, one `.agents/docs.md` Project row; NOT a shipped managed-block template | Tracker issue (gether#398 style); shipped managed-block template; two separate files | Owner confirmed file. Consumer-owned avoids `bkit install` overwrite + keeps `bkit check` drift clean; two blocks in one file physically prevent the two writers clobbering each other while keeping the single artifact intact. |
| Mechanical status = a FULL projection of tracker labels + folded `status.jsonl`, regenerated (regenerate-on-conflict) | Incremental single-row sed edit; a new `roadmap.jsonl` event log + rendered mirror | Full projection makes `-X ours`/concurrent-conflict a non-event and refreshes ALL issues at every dev-reaching close; a sed edit races the shared unstructured file (resurrects #209 Defect A); a ledger duplicates `status.jsonl`'s per-FID phase events and adds compaction machinery + contests "must be docs/roadmap.md". |
| Mechanical tier is deterministic — bounded `list_issues` MCP read + jq render via `bkit-roadmap-fold.sh`, no opus turn | Subagent/LLM-authored row updates | Owner called it cheap/deterministic; determinism is precisely what makes regenerate-on-conflict safe, and it avoids an opus turn per close × 5-workflow mirror cost. |
| Mechanical write folds into each workflow's existing Close step, committed where the phase already commits; live-phase authority = tracker labels | Dedicated new close step; forced dev-lock write from build/debug | Improve-over-duplicate (the Close is already the commit moment); avoids adding dev-writes to build/debug; the projection refreshes `dev` at the next design/plan/ship close and the tracker is the live truth (banner makes this explicit). |
| Analysis tier = dedicated opus leaf `@bkit-roadmap-refresh`, third parallel subagent in ship Step 10, reused verbatim by `/bkit-roadmap`; writes only `roadmap-analysis` | Fold the analysis into `@bkit-ship-update-docs` | A clean leaf is reusable as-is by the on-demand utility and later by #260; folding it into update-docs couples it to ship-only doc work and blocks utility reuse. It still reads the same inputs update-docs proves are available at ship-close. |
| Per-workflow staging integration (design/plan widen the STRAY allowlist to `^docs/roadmap\.md$`; build/debug already sweep via `git add -A`; ship already captures via scoped `git add -- docs/`) + a per-workflow-shape-aware CI/bats assertion | Single "widen the allowlist in all 5" grep; widen ad hoc / rely on manual review | The allowlist exists in only two of the five workflows; a single grep passes while build/debug mis-stage or fails spuriously where there is no allowlist. Assert the correct behaviour per shape so a missed integration reds CI, not the consumer's close. |
| Analysis scan bounded (open + milestone-scoped, paged), coverage-stamped, report budget reserved | Unbounded "read whole roadmap + all issues" | `maxTurns`/context exhaustion ships a truncated but authoritative-looking best-next-step; emit a coverage record so shrinking coverage is visible. |
| Prompt suggestions reuse `plan-complexity-check` (when-NOT-to-use) + `design-organise` grouping; reference model-selection doctrine generically + read IDE from install config; never hardcode model IDs/IDE names; emit in opus-plans/sonnet-executes shape | Bespoke heuristics; hardcoded model IDs / IDE names | Existing tested doctrine (improve over duplicate); shipped surface must stay stack/vendor-agnostic — model IDs come from live endpoints and IDE targets from config, so stored strings rot. |
| Ledger/audit cadence = count of PERSISTED ship-close rows in committed `.bkit/stats.jsonl` (crosses N; propose N=5) + staleness-days fallback (from the `roadmap-analysis` header-stamp `ts`); injects a #80 audit candidate + open `deferrals`/`failures` items as grouped next-steps; logs `[bkit-analysis]` on counter-advance + injection-fire | Undefined "periodically"; time-based cron; the non-persisted `bkit-counter-bus.sh` `counter_count`/`counter_next` helper | `bkit-counter-bus.sh` is derive-from-active-run/non-persisted/per-FID and returns per-run attempt counts, NOT a cross-ship cadence — plan must count persisted rows instead. Deterministic, testable, observable via the existing generic `counter`-reader + the fire/advance log lines; the design mandate needs a concrete, non-silent trigger. |
| #260 relationship: `bkit-roadmap-fold.sh` IS #260's tick-step-1 sense primitive (build once, #260 consumes the same fold + snapshot); do NOT build #260's actuator/contract or a persisted event-log now | Build the sensing schema/ledger up front; treat #380 fully standalone | The leaf/fold boundary preserves the evolution path without speculative schema; the fold FUNCTION delivers structured sensing without a persisted ledger, so no second sensing engine is built (the anti-pattern #260 itself flags). |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Regenerate-on-conflict pure-projection status block + two machine-owned marker blocks (lens 3A) | KEPT (core) | The only shape that satisfies the owner's full two-tier requirement while making the shared-file conflict class a non-event — the central risk of a repo-global, non-namespaced file. |
| Reuse ship-Step-10 parallel-subagent pattern + `bkit-status-fold`-style shell helper for the mechanical tier (lens 1A) | MERGED | Contributes the dedicated parallel-subagent leaf, the sourced shell-helper convention, and folding the mechanical write into the existing Close step. |
| Ledger-backed `roadmap.jsonl` + regenerated `roadmap.md` split into deterministic + LLM sections (lens 2A) | MERGED (split) / REJECTED (persisted ledger) | The split-sections idea is kept as the two marker blocks; the persisted `roadmap.jsonl` event log is rejected — it duplicates `status.jsonl`'s phase events and adds compaction/unbounded-fold machinery. |
| Single markdown file, sed-edited mechanically + subagent-rewritten narratively (lens 2B) | REJECTED | Concurrent closes race one unstructured file with no `merge=union`; a straight repeat of the #209 `status.json -> status.jsonl` problem. |
| Ship-close-only + on-demand utility, no mechanical per-close write (lens 1B / 2C / 3B) | REJECTED for v1 (staleness-honesty MERGED) | Conflicts with the owner's confirmed between-ship status requirement; its "live phase = tracker labels" honesty is merged as the header banner + the fallback live-phase authority. |
| Append-only `roadmap.jsonl` event log + rendered `docs/roadmap.md` mirror (lens 3C) | REJECTED | Over-builds (compaction, render-freshness checks), largest new-invariant surface, and contests the owner's "must be docs/roadmap.md" by making the `.md` a derived mirror of a `.jsonl` source of truth. |
| Build #260's standalone sensing primitive / contract now (lens 1C) | REJECTED (path preserved) | Speculative against #260's unbuilt tick (YAGNI); the leaf/fold boundary already preserves the evolution path without designing #260's schema. |

## Trade-offs Accepted

Chosen = regenerate-on-conflict pure-projection mechanical tier + a composed opus analysis leaf.

- **Gains** — conflict/concurrency safety (the board is reproducible, so `-X ours` and races are non-events); no new persisted ledger, no compaction machinery; a cheap deterministic mechanical tier; a reusable analysis leaf; the owner's two-tier model satisfied literally; #260's sense primitive delivered for free; minimal net-new persisted state.
- **vs a persisted ledger (lens 2A/3C)** — we give up durable, replayable cross-tick frontier history; #260 must call the live fold rather than replay an event log. Accepted because `status.jsonl` already holds per-FID phase history; if #260 later needs durable cross-tick snapshots, that is the deferred evolution (see Risks + `deferrals.jsonl`).
- **vs single-writer ship-only (lens 1B/2C/3B)** — we take a larger shipped-surface footprint (five workflow Close edits + STRAY-guard widen + mirror regen) instead of a one-workflow change. Accepted to deliver the owner-required between-ship status.
- **vs forcing a dev-write from build/debug** — `dev`'s `roadmap.md` status can lag by "time since the last design/plan/ship close" for issues sitting in build/debug. Accepted because the tracker is the live-phase authority and the banner makes staleness explicit.
- **A per-close bounded `list_issues` MCP read** couples close latency to tracker availability. Accepted as cheap/deterministic and made best-effort (a failed/empty read keeps the prior block and never gates the close).

## Risks & Open Questions

- **OPEN (human gate)** — Should build/debug closes force a dev-located `roadmap.md` status write (reusing ship's dev-lock idiom) so `dev`'s board reflects build/debug phases between ships, at the cost of adding dev-writes to two workflows that today never touch `dev`? v1 says no (tracker = live authority). Confirm. (Deferred as a feature — see `deferrals.jsonl`.)
- **OPEN** — Cadence numbers: `N` ship-cycles (propose 5) + the staleness-days fallback value.
- **OPEN** — Exact status-board columns and whether closed/merged issues drop off the board (proposal: open + recently-merged only; closed history stays in `docs/completed.md`).
- **RISK** — Cross-provider mirror regen for five edited workflows + the new agent + the new utility: mirrors are force-overwritten and NOT drift-gated, so a stale mirror ships silently. Batch the regen at session end; dogfood `install` AND `upgrade` live.
- **RISK** — The staging integration must land correctly in ALL five workflows in the same change (per-workflow-shape-aware CI/bats assertion mandatory): design/plan need the STRAY allowlist widened to `^docs/roadmap\.md$`, while build/debug (`git add -A`) and ship (scoped `git add -- docs/`) already capture the file — a missed design/plan widen aborts a consumer's close on a staged `roadmap.md`, and a single-grep assertion would miss the three-shape reality.
- **RISK** — Analysis `maxTurns`/context exhaustion on large trackers: bounded scan + coverage stamp + reserved report budget; the `ROADMAP_SCAN_COVERAGE` `counter` row (now a first-class Data-Model output, see above — written by `@bkit-roadmap-refresh` at every analysis pass, read via the generic `counter`-reader) makes a shrinking coverage ratio machine-visible rather than a silently-truncated but authoritative-looking best-next-step.
- **RISK** — A per-close `list_issues` MCP read couples close latency/reliability to tracker availability. Make it best-effort (failed read => keep prior block, never gate) and emit a `[bkit-roadmap]` stderr line on every fail-open branch (read failure, 0/empty, best-effort skip) per the `docs/observability.md` bracketed-prefix convention, so a persistent degradation (e.g. an expired token no-op'ing the write every close) is grep-visible instead of silent; use `list_issues`, never `search_issues` (silent-0-on-private-repo), and treat a 0/empty result as inconclusive.
- **DEPENDENCY** — #80 audit-candidate injection assumes the #80 lens engine lands; until then the cadence injects a generic "run an audit" next-step referencing the audit prompt family, never a hardcoded stack lens.
- **ASSUMPTION** — The no-concurrent-workflows-per-clone constraint still holds; `roadmap.md` raises the cost of violating it, but the regenerate-on-conflict design tolerates a stray collision. v1 does not design for parallel writers.
- **ASSUMPTION** — Shipped roadmap text stays stack/vendor-agnostic and cites no tracker-internal refs (BAR-/KN-/Linear); prompt-suggestion content reuses `plan-complexity-check` heuristics generically.

## Suggested Workstreams

### WS-1: Roadmap artifact + deterministic fold foundation

#### Scope

The shared, machine-owned substrate every other workstream reads or writes:

- `docs/roadmap.md` as a consumer-owned generated artifact (peer of `deferrals.jsonl`), NOT a shipped managed-block template: the two distinct marker regions (`<!-- bkit:roadmap-status start/end -->` and `<!-- bkit:roadmap-analysis start/end -->`), the free consumer-editable region, the header stamp ("Status projected from tracker labels at {ts}; for live phase, read tracker labels."), and the "generated — edit tracker labels, not this block" banner.
- Bootstrap flow: first-run creation of the file with empty marker blocks + banner when absent; marker-block self-heal (re-emit missing/mangled anchor block(s) in place with a `[bkit-roadmap]` stderr line) as distinct from bootstrap and from in-block hand-edit banner-revert.
- `.bkit/scripts/bkit-roadmap-fold.sh` — sourced shell helper (sibling of `bkit-status-fold.sh`) providing the deterministic jq projection `(tracker label rows + folded status.jsonl) -> status-board table + structured frontier snapshot`; SOURCES `BKIT_STATUS_FOLD` from `bkit-status-fold.sh` verbatim (single-source #58 reducer, never re-inlined); every fail-open branch emits `[bkit-roadmap]` per `docs/observability.md`.
- Data model: `docs/roadmap.md` block layout; status-board table columns (`Issue | Title | Phase | Milestone | Blocked-by | Last-transition ts`); the in-memory frontier snapshot structure (`{ issue, phase, milestone, labels, blockedBy?, lastTransitionTs }`, deliberately not persisted to any `roadmap.jsonl`); resolution of the OPEN column set + closed/merged drop-off question.
- `.agents/docs.md` — one new `docs/roadmap.md` row in the consumer-owned Project Documents table.

#### Requires

[]

#### Rationale

The marker-block file contract, the fold function, and the frontier-snapshot shape are the contract both the mechanical tier and the analysis tier depend on; the two-block anti-clobber seam and the snapshot schema must be fixed before either writer can target them. This is the only workstream with no upstream prerequisite (the root artifact + shared reducer).

### WS-2: Mechanical status tier — per-close hook + per-workflow staging

#### Scope

The deterministic `roadmap-status` writer wired into every workflow Close step:

- The mechanical close-step hook beside the existing `status.jsonl` commit in all five workflows: bounded `list_issues` MCP read (open + milestone-scoped, paged) piped through the WS-1 fold to rewrite ONLY the `roadmap-status` block, staged + committed with the phase's existing close commit. No analysis/subagent turn.
- Per-workflow-shape staging (NOT one uniform allowlist widen): `bkit-design.md`/`bkit-plan.md` widen their STRAY-guard allowlist to include `^docs/roadmap\.md$`; `bkit-build.md`/`bkit-debug.md` rely on their existing `git add -A`; `bkit-ship.md` relies on its scoped `git add -- docs/`. Commit location per phase (dev for design/plan/ship; feat/{FID} for build/debug, reaching dev at ship).
- Best-effort / fail-open discipline: failed, empty, or inconclusive tracker read keeps the prior block and never gates the close; `[bkit-roadmap]` stderr line on every fail-open branch (read failure, 0/empty, best-effort skip); `list_issues` only (never `search_issues`); regenerate-on-conflict handling for `-X ours`/concurrent-close.
- Mechanical flow + the per-workflow-shape-aware CI/bats assertion (asserts correct staging behaviour for each of the three shapes, not a single grep).
- Surfaces the OPEN build/debug dev-write human gate and the no-concurrent-workflows tolerance assumption.

#### Requires

[WS-1]

#### Rationale

A single logical unit: the mechanical tier is one flow whose complexity is entirely in the five-workflow staging integration and its shape-aware test. It consumes the WS-1 fold + `roadmap-status` marker block and must land as one coherent change so the staging assertion covers all three shapes together.

### WS-3: Analysis tier — `@bkit-roadmap-refresh` opus leaf

#### Scope

The expensive opus writer of the `roadmap-analysis` block:

- `@bkit-roadmap-refresh` opus leaf subagent writing ONLY the `roadmap-analysis` block; added as the third parallel subagent in ship Step 10 (alongside `@bkit-ship-update-docs` ‖ `@bkit-ship-summary`), with the write provably preceding the Step 11 scoped `git add -- docs/` stage/commit.
- Analysis flow: reads the bounded frontier snapshot + `.agents/docs.md` + `deferrals.jsonl`/`failures.jsonl`; writes ranked best-next-step, dependency-aware groupings (reusing `design-organise` seam logic), prompt suggestions (bkit-optimal usage; when-NOT-to-use via `plan-complexity-check`; IDE read from install config; model recommendations by doctrine-reference; opus-plans/sonnet-executes shape). No hardcoded model IDs / IDE names.
- Bounded scan (open + milestone-scoped, paged), report budget reserved, coverage-stamped.
- Data model: the Analysis coverage record — human-readable "scanned N of M" stamp AND the `ROADMAP_SCAN_COVERAGE` `counter` row appended to `.bkit/stats.jsonl` (`counterSource: "model-self-report"` + full envelope), best-effort (`[bkit-telemetry]` fail-open), never gates ship.
- Addresses the maxTurns/context-exhaustion risk and the stack/vendor-agnostic content assumption.

#### Requires

[WS-1]

#### Rationale

A clean reusable leaf that reads the WS-1 frontier snapshot and writes the second (analysis) marker block. It depends only on the WS-1 artifact/snapshot contract, not on the mechanical tier — the two-block seam makes them independent — so it is a distinct unit reused verbatim downstream.

### WS-4: Cadence-driven ledger/audit injection

#### Scope

The deterministic threshold that folds backlog/audit candidates into the analysis pass:

- Cadence counter DERIVED by counting persisted ship-close rows in committed `.bkit/stats.jsonl` (`outcome` rows where `workflow == "ship"`, or the equivalent persisted `counter` row `SHIP_CYCLE`/`counterSource: "shell-bus"`) — explicitly NOT the non-persisted `bkit-counter-bus.sh` helper — read via the existing generic `counter`-reader.
- Threshold crossing at `N` (propose N=5) plus a staleness-days fallback measured from the `roadmap-analysis` header-stamp `ts`; resolution of the OPEN cadence numbers.
- On fire: inject a #80 audit candidate (generic "run an audit" referencing the audit prompt family until the #80 lens engine lands — the noted #80 DEPENDENCY) + surface open `deferrals.jsonl`/`failures.jsonl` items (ranked severity then age) as grouped next-steps.
- `[bkit-analysis]`-family log line on both counter-advance and injection-fire (distinguishing "no candidates existed" from "injection broke").

#### Requires

[WS-3]

#### Rationale

The cadence injection is an add-on behaviour of the analysis pass (it augments the `roadmap-analysis` block with grouped candidates), so it builds on WS-3's leaf. It is separated because it has its own distinct data source (persisted `.bkit/stats.jsonl` cadence count), its own open numeric decisions, and its own #80 external dependency.

### WS-5: On-demand `/bkit-roadmap` utility workflow

#### Scope

- New `/bkit-roadmap` utility workflow mirroring the `bkit-worktree-*` utility shape.
- Runs the mechanical fold (WS-1/WS-2 path) + invokes `@bkit-roadmap-refresh` (WS-3), giving an on-demand refresh of both the status and analysis blocks outside the close cycle.

#### Requires

[WS-2, WS-3]

#### Rationale

The utility is a thin composition that reuses the mechanical fold path and the analysis leaf verbatim; it can only be built once both the mechanical write (WS-2) and the analysis subagent (WS-3) exist. Kept separate because it is a distinct on-demand entry point (a workflow file), not part of the close-driven flows.

### WS-6: Cross-provider mirror regen + live dogfood verification

#### Scope

- Cross-provider mirror regeneration (claude/cursor/opencode) for all edited surfaces: the five workflow Close steps (WS-2), `@bkit-roadmap-refresh` (WS-3), and the `/bkit-roadmap` utility (WS-5), batched at session end.
- Live dogfood of both `bkit install` AND `bkit upgrade` (separate engines) to catch install/upgrade divergence and stale-mirror ship (mirrors are force-overwritten and NOT drift-gated).
- Verifies `docs/roadmap.md` stays consumer-owned: `bkit install` never overwrites it and `bkit check` drift stays clean.

#### Requires

[WS-2, WS-3, WS-4, WS-5]

#### Rationale

Mirror regen must run once, after every edited workflow/agent/utility surface exists, per the batch-at-session-end rule; a stale mirror ships silently, so this terminal verification depends on all shipped-surface-editing workstreams being complete.
