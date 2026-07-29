Verdict: PASS
<!-- verdict:end -->

# Design: Constant roadmap analysis refresh (#380)

> [!IMPORTANT]
> **Post-review revision (2026-07-23):** the owner inverted the authority model — `docs/roadmap.md` is now the **canonical home for issue state** (phase sections + a consumer-managed backlog), and the tracker is a downstream mirror that roadmap.md is used to verify and keep in sync. See **Addendum — Canonical-home revision** at the end of this doc; where it conflicts with the body below, **the addendum wins**.

## Related Issues

- #260 — Milestone Orchestrator autonomous PM loop that drives workstreams (open) — comment `#260-4724691125` ("auto update … roadmap.md to always suggest best next issue") is the direct precursor; #380 is the extraction of that sub-requirement, and #380's fold is #260's tick-step-1 sense primitive.
- #214 — bkit roadmap (open) — the hand-maintained living sequencing reference this feature automates into `docs/roadmap.md`.
- #209 — Workflow state model: squash-to-dev + persistent `feat/{FID}`, NDJSON `status.jsonl` (closed) — precedent for where `docs/roadmap.md` writes live (feat-located reaching `dev` via squash-merge), `merge=union`, the Close STRAY-guard, and the `-X ours` conflict class.
- #80 — `bkit-audit` lens engine (open) — the audit-candidate source injected on the cadence trigger; #260 is its deferred automated-trigger home.
- #324 — recurring self-healing audit loop / after-ship trigger (open) — shares the same post-merge event substrate; noted, not a dependency.
- #236 — Post-mortem on consumer debug sessions (closed) — source of the `green == validated` trust ceiling + the stack-independence rule the roadmap agent must respect.

## Acceptance Scenario

### Narrative

As a bkit user, after I close any workflow phase for an issue, `docs/roadmap.md` shows that issue under its current phase with no manual edit, so anyone — human or agent — can see where every open issue stands. The board is built **primarily from on-disk artifacts so it works with no tracker connected** — the `docs/plans/**` design/plan docs, per-FID `status.jsonl`, the `deferrals`/`failures` ledgers, and a consumer-authored "ideas / new work" region at the bottom of `roadmap.md`; when a tracker IS wired the board is additionally enriched with open tracker issues and their status/readiness. When I ship an issue (or run `/bkit-roadmap` on demand), bkit refreshes an opus-authored "best next step": dependency-aware issue groupings, IDE- and model-aware prompt suggestions (including when NOT to use bkit), and periodically-injected audit and backlog candidates, so I always know what to work on next and how to drive bkit optimally.

### Success Criteria

1. After every workflow close, `docs/roadmap.md`'s status board reflects each in-flight issue's current phase, **built primarily from on-disk artifacts so it works with NO tracker connected** — the presence of `docs/plans/{YYYYMM}/{FID}-{design,plan}.md`, the folded per-FID `status.jsonl`, and open `docs/deferrals.jsonl`/`docs/failures.jsonl` items — with no manual edit and no analysis/subagent turn. **When a tracker IS wired** (`github`/`linear` per the #202 inline-marker model, NOT `none`), the board is additionally enriched with open tracker issues and their `bkit:*` phase + readiness via an orchestrator-mediated `list_issues` MCP call piped to the fold (never a standalone `gh`/`search_issues` path — that breaks Linear tracker-agnosticism and silently returns 0 on private repos). The tracker read is **additive, never a precondition**: under `tracker: none` it is skipped entirely and the board is still complete from on-disk sources.
2. A concurrent close, a merge conflict, or an `-X ours` squash never aborts a close or silently corrupts the board — the status board is deterministically regenerable from the on-disk artifacts (and the tracker read when wired).
3. Ship-close and `/bkit-roadmap` produce a refreshed analysis block: a ranked best-next-step, dependency-aware issue groupings, and bkit-usage prompt suggestions, stamped with scan coverage.
4. Ledger/audit integration fires on a deterministic threshold (not "periodically"), computed by counting DISTINCT FIDs that reached `BUILT` in `docs/roadmap.jsonl` since the last cadence FIRE (Addendum 3 § Q — never `.bkit/stats.jsonl` rows, which carry no FID by § R, and never the non-persisted `bkit-counter-bus.sh` helper) plus a staleness-days fallback measured from that same fire: open `deferrals.jsonl`/`failures.jsonl` items and a #80 audit candidate surface as grouped next-steps.
5. `docs/roadmap.md` stays consumer-owned — `bkit install` never overwrites it and `bkit check` drift stays clean; only the generator, the analysis prompt, the utility, the five close-step edits, and one `.agents/docs.md` index row ship.

### Key Edge Cases

- **Concurrent close / `-X ours` squash eating a feat-side roadmap edit** — the status block is a full tracker projection, re-rendered at every dev-reaching close; a lost or conflicted edit is a non-event because the board is reproducible from the tracker.
- **Close staging differs per workflow — the mechanical hook integrates three ways, NOT one uniform allowlist widen** — the STRAY-file guard allowlist (`^docs/plans/|^docs/(deferrals|decisions|failures)\.jsonl$|^\.bkit/friction\.jsonl$`) lives ONLY in `bkit-design.md` and `bkit-plan.md`; those two must widen it to include `^docs/roadmap\.md$`. `bkit-build.md`/`bkit-debug.md` close with `git add -A` (no allowlist — a staged `roadmap.md` is swept in automatically, on `feat/{FID}`), and `bkit-ship.md` stages docs with a scoped `git add -- docs/` that already captures `docs/roadmap.md`. The mandatory CI/bats assertion must be per-workflow-shape aware (asserting the correct staging behaviour for each of the three shapes), NOT a single grep for one allowlist across all five — a naive grep passes while a build/debug close silently mis-stages, or fails spuriously on the workflows that have no allowlist to widen.
- **Large tracker (200+ open issues) blows the analysis subagent's context/`maxTurns`** — scan is bounded (open + milestone-scoped, paged), coverage-stamped ("scanned N of M"), with report budget reserved; a truncated but authoritative-looking "best next step" is the failure to avoid.
- **Human hand-edits the generated status block** — a loud "generated — edit tracker labels, not this block" banner; the next regenerate reverts it, so the live truth stays the tracker.
- **Marker blocks themselves missing/mangled on an existing (non-bootstrap) `docs/roadmap.md`** — distinct from bootstrap (file absent) and from in-block hand-edits (banner-revert covers those): the anchor markers (`<!-- bkit:roadmap-status start/end -->` / `<!-- bkit:roadmap-analysis start/end -->`) are gone. Decided behaviour = re-bootstrap in place (re-emit the missing marker block(s) with the banner) and emit a `[bkit-roadmap]` stderr line, rather than abort the close or silently no-op — the file self-heals on the next close without a manual fix or a blocked consumer.
- **build/debug commit to `feat/{FID}`, not `dev`** — their status refresh reaches `dev` only at ship; between ships, `dev`'s board is refreshed by the next design/plan/ship close and the tracker remains the live-phase authority (surfaced decision for the human gate).
- **No tracker connected (`tracker: none`) or a tracker read that fails/returns empty** — the status board is built entirely from on-disk artifacts (design/plan doc presence + folded `status.jsonl` + `deferrals`/`failures.jsonl`) plus the consumer-owned ideas region. The `list_issues` call is skipped outright under `none`, and treated as inconclusive (keep the prior tracker-derived rows) when it fails under a wired tracker. The roadmap is never empty or stale-by-omission just because the tracker is absent or unreachable — on-disk is the floor, tracker is the enrichment.
- **Consumer-authored "ideas / new work" region at the bottom of `roadmap.md`** — free-form new-work ideas a consumer jots below the two machine-owned blocks (issues not yet filed, or no tracker at all). The mechanical and analysis regenerators only ever rewrite content between their own markers and NEVER touch anything below the last machine marker, so hand-written ideas survive every regenerate. The analysis tier READS this region as an input and folds those ideas into its ranked best-next-step (and, when a tracker is wired, may suggest filing them as issues).

### Process Sketch

- WHEN any workflow reaches Close (after its `bkit:*` label transition) → THEN regenerate the `roadmap-status` block from a bounded tracker read + folded `status.jsonl` and commit it with the phase's existing close commit.
- WHEN the squash-merge conflicts on `docs/roadmap.md` → THEN take either side and re-run the fold (no halt, no silent loss).
- WHEN ship-close runs OR `/bkit-roadmap` is invoked → THEN `@bkit-roadmap-refresh` rewrites the `roadmap-analysis` block (best next step + groupings + prompt suggestions), bounded and coverage-stamped.
- WHEN the ship-cycle counter crosses N (or the staleness threshold) → THEN inject a #80 audit candidate and surface open `deferrals.jsonl`/`failures.jsonl` items as grouped next-steps.
- WHEN an agent needs live phase mid-build/debug → THEN it reads tracker labels (authoritative); `docs/roadmap.md` status is the refreshed-at-close convenience view.

## Architecture

Two tiers writing two physically-separate machine-owned blocks inside one consumer-owned file, so the cheap deterministic writer and the expensive opus writer can never clobber each other.

**Components**

1. **`docs/roadmap.md`** — consumer-owned generated artifact (peer of `deferrals.jsonl`), NOT a shipped managed-block template. Layout, top to bottom: two generator-owned regions delimited by distinct markers — `<!-- bkit:roadmap-status start/end -->` then `<!-- bkit:roadmap-analysis start/end -->` — followed by a **consumer-owned "Ideas / New Work" region below the last machine marker**. The regenerators only ever rewrite content between their own markers and never touch anything below the last machine marker, so the ideas region is a durable consumer input (read by the analysis tier), not scratch space that gets clobbered. Bootstrapped on first run if absent (empty machine blocks + banner + an empty `## Ideas / New Work` heading). Header stamp reflects the sensing sources actually used, e.g. "Status built from on-disk plan artifacts at {ts}" and, when a tracker is wired, "+ tracker labels; for live phase read tracker labels."
2. **`.bkit/scripts/bkit-roadmap-fold.sh`** — sourced shell helper, sibling of `bkit-status-fold.sh`, providing the deterministic projection jq blob: `(on-disk plan-artifact scan + folded status.jsonl [+ tracker label rows WHEN a tracker is wired]) -> status-board table + structured frontier snapshot`. **On-disk artifacts are the primary, always-available source** (works under `tracker: none`): per-FID phase is derived from the presence of `docs/plans/{YYYYMM}/{FID}-design.md` (design done) and `{FID}-plan.md` (plan done), refined by the folded per-FID `status.jsonl` for the live in-flight phase, with `docs/completed.md` marking shipped FIDs. It SOURCES `BKIT_STATUS_FOLD` from `bkit-status-fold.sh` verbatim for the `status.jsonl` half (reusing the #58 single-source reducer, never re-inlining it). Tracker-label rows (from Component 3's `list_issues` read) are merged in only when a tracker is configured, enriching each row with `bkit:*` phase + readiness and adding open issues that have no on-disk FID yet. Every fail-open branch (empty/malformed fold input, missing snapshot, tracker rows absent) emits a `[bkit-roadmap]` stderr line per the `docs/observability.md` bracketed-prefix convention. This fold IS #260's tick-step-1 "reconstruct the frontier" sense primitive; #260 consumes the same helper and its snapshot.
3. **Mechanical close-step hook** — added to each of the five workflows' Close step, beside the existing `status.jsonl` commit: an always-run bounded scan of on-disk plan artifacts (design/plan doc presence + folded `status.jsonl`) — and, **ONLY WHEN a tracker is wired**, an additional bounded `list_issues` MCP read (open + milestone-scoped) merged in — piped through the fold to rewrite the `roadmap-status` block, then staged and committed with the phase's existing close commit. Tracker-wired vs `none` is read from the installed inline-marker config (#202), so under `tracker: none` no MCP call is attempted at all. Staging is per-workflow-shape (NOT one uniform allowlist widen): `bkit-design.md`/`bkit-plan.md` widen their STRAY allowlist to `^docs/roadmap\.md$`; `bkit-build.md`/`bkit-debug.md` already sweep it via `git add -A`; `bkit-ship.md` already captures it via the scoped `git add -- docs/`. Deterministic (shell/jq + optional MCP tool call), no analysis/subagent turn. Best-effort: a failed, empty, or inconclusive tracker read falls back to the on-disk-only board (never blank), never gates the close, and emits a `[bkit-roadmap]` stderr line on every fail-open branch (read failure, 0/empty result, best-effort skip) so a persistent degradation — e.g. an expired token that silently no-ops the tracker half every close — is grep-visible in a CI log or `bkit-debug` transcript rather than invisible.
4. **`@bkit-roadmap-refresh`** — opus leaf subagent that rewrites ONLY the `roadmap-analysis` block. Added as the third parallel subagent in ship Step 10 (alongside `@bkit-ship-update-docs` ‖ `@bkit-ship-summary`) and reused verbatim by the utility. Ordering: Step 10 writes the `roadmap-analysis` block into `docs/roadmap.md`; the subsequent Step 11 scoped `git add -- docs/` stages and commits it — the write provably precedes the stage, so the analysis block is never left written-but-uncommitted.
5. **`/bkit-roadmap`** — new on-demand utility workflow (mirrors the `bkit-worktree-*` utility shape) that runs the mechanical fold + invokes `@bkit-roadmap-refresh`.
6. **`.agents/docs.md`** — one new row for `docs/roadmap.md` in the Project Documents table (below `bkit:end`, consumer-owned).
7. **Cadence counter** — the ship-cycle count is DERIVED by counting persisted ship-close rows already committed to `.bkit/stats.jsonl` (e.g. `outcome` rows where `workflow == "ship"`; equivalently a persisted `counter` row `counterName: "SHIP_CYCLE"`, `counterSource: "shell-bus"` written at ship-close) — NOT via the `bkit-counter-bus.sh` `counter_count`/`counter_next` helpers, which are derive-from-active-run, non-persisted, per-FID and would return per-run attempt counts. The threshold fires the audit/ledger injection when the persisted ship count crosses `N`; a staleness-days fallback is measured from the `roadmap-analysis` header-stamp `ts` (days since the last analysis refresh). The analysis pass emits an `[bkit-analysis]`-family log line on both counter-advance and injection-fire so a stalled counter, an off-by-one threshold, or a silently-skipped injection is observable (distinguishing "no candidates existed" from "injection broke"); the cadence count reads through the existing generic `counter`-reader in `bkit analysis`, not a new counter mechanism.

**Boundaries / integration points**

- Mechanical tier = deterministic, writes only `roadmap-status`; analysis tier = opus, writes only `roadmap-analysis`. The two-block seam is the anti-clobber guarantee.
- Tracker access = `list_issues` MCP read only, and ONLY when a tracker is wired (never `search_issues` — it silently returns 0 on private repos; treat a 0/empty result as inconclusive and fall back to the on-disk board). Under `tracker: none` there is no tracker access at all. `docs/roadmap.md` is a file write, so no tracker-write-scope conflict.
- Ship Step 10 parallel-subagent block gains a third agent; each workflow Close step gains the mechanical hook, staged per its existing shape (design/plan widen the STRAY allowlist; build/debug rely on `git add -A`; ship on the scoped `git add -- docs/`); the persisted ship-close-row count on `.bkit/stats.jsonl` drives cadence; `.agents/docs.md` gains one row.
- Every edited workflow/agent requires cross-provider mirror regen (claude/cursor/opencode), batched at session end.

## Data Model

- **`docs/roadmap.md`** — header stamp; `roadmap-status` block (machine-owned); `roadmap-analysis` block (machine-owned); consumer-owned "Ideas / New Work" region below the last machine marker (a read input for analysis, never regenerated). No `bkit install`-managed block.
- **Status-board table columns** — `Issue/FID | Title | Phase | Milestone | Blocked-by / dependency hint | Last-transition ts`. Rows = the **union of on-disk FIDs** (derived from `docs/plans/{YYYYMM}/{FID}-{design,plan}.md` + folded `status.jsonl`) **and, when a tracker is wired, open tracker issues** (proposal: open + recently-merged; closed history stays in `docs/completed.md`). Under `tracker: none` the rows are the on-disk FIDs alone. Phase source: on-disk (doc presence + status.jsonl fold) always; `bkit:*` label overrides/enriches it when the tracker is wired.
- **Frontier snapshot** (the fold's structured output, in-memory / not persisted) — array of `{ id, phase, milestone, labels?, blockedBy?, lastTransitionTs, source }` where `source ∈ {"on-disk","tracker"}` records where each row came from (so a consumer with no tracker gets a fully-formed snapshot). This is the #260-consumable structure; deliberately NOT written to a new `roadmap.jsonl` ledger.
- **Analysis coverage record** (first-class telemetry, NOT just a Risks-section aside) — a `counter` row on `.bkit/stats.jsonl` written by `@bkit-roadmap-refresh` at the end of every analysis pass: `kind: "counter"`, `counterName: "ROADMAP_SCAN_COVERAGE"`, `counterValue` = issues scanned (or scanned/total ×100), `counterSource: "model-self-report"`, plus the envelope `workflow`/`step`/`subagent`/`model`/`parentSha`. Paired with the human-readable "scanned N of M" stamp inside the `roadmap-analysis` block. This makes a shrinking coverage ratio (the design's named "failure to avoid" — a truncated-but-authoritative-looking best-next-step) observable through the existing generic `counter`-reader, not only by a human reading `roadmap.md` prose. Best-effort append (`[bkit-telemetry]` fail-open), never gates ship.
- **Reused existing state** — the on-disk plan artifacts `docs/plans/{YYYYMM}/{FID}-{design,plan}.md` (phase-reached, always available), per-FID `status.jsonl` (phase-transition events, folded via the existing reducer), `docs/completed.md` (shipped FIDs), tracker `bkit:*` labels (the live state machine, ONLY when wired), persisted `.bkit/stats.jsonl` ship-close rows (the cadence count — see Component 7; NOT the non-persisted counter-bus helper), `docs/deferrals.jsonl` + `docs/failures.jsonl` (backlog candidates ranked by severity then age), and the consumer "Ideas / New Work" region of `docs/roadmap.md` (free-form new-work input for the analysis tier). No new schema version — the fold is the contract.

## Components / Flows

- **Mechanical flow (every close)** — at Close: scan on-disk plan artifacts (design/plan doc presence) + fold `status.jsonl` — and, only when a tracker is wired, merge a bounded `list_issues` read (after the `bkit:*` label transition) — -> rewrite `roadmap-status` -> stage per the workflow's existing shape (design/plan: widened STRAY allowlist; build/debug: `git add -A`; ship: scoped `git add -- docs/`) + commit where the phase commits (dev for design/plan/ship; feat for build/debug, reaching dev at ship). Under `tracker: none` the on-disk scan alone produces the board. Regenerate-on-conflict; every fail-open branch logs `[bkit-roadmap]`.
- **Analysis flow (ship + on-demand)** — `@bkit-roadmap-refresh` reads the bounded frontier snapshot + `.agents/docs.md` + `deferrals.jsonl`/`failures.jsonl` + the consumer "Ideas / New Work" region of `docs/roadmap.md` -> writes `roadmap-analysis`: ranked best-next-step (folding in consumer ideas alongside open issues/backlog), dependency-aware groupings (reusing `design-organise` seam logic), prompt suggestions (bkit-optimal usage; when-NOT-to-use via `plan-complexity-check`; IDE read from install config; model recommendations by doctrine-reference; opus-plans/sonnet-executes subagent-maximising shape). When a tracker is wired it may also suggest filing a promising consumer idea as an issue; under `tracker: none` it keeps ideas as roadmap-local next-steps. Coverage output: the "scanned N of M" text stamp AND a `ROADMAP_SCAN_COVERAGE` `counter` row appended to `.bkit/stats.jsonl` so shrinking coverage is machine-visible.
- **Cadence flow** — at ship-close, count the persisted ship-close rows in committed `.bkit/stats.jsonl` (see Component 7; never the non-persisted counter-bus helper); when that count crosses `N` (propose N=5) or the staleness-days threshold (measured from the `roadmap-analysis` header-stamp `ts`) is crossed, the analysis pass injects a #80 audit candidate + open `deferrals.jsonl`/`failures.jsonl` items as grouped next-steps, and logs an `[bkit-analysis]`-family line on counter-advance and injection-fire.
- **Bootstrap flow** — first run creates `docs/roadmap.md` with empty marker blocks + the banner if the file is absent.

## Decisions

| Decided                                                                                                                                                                                                                                                                                                                                            | Alternatives                                                                                                             | Why                                                                                                                                                                                                                                                                                                                                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Sensing source = ON-DISK-FIRST** (design/plan doc presence + folded `status.jsonl` + `deferrals`/`failures.jsonl` + the consumer ideas region); the `list_issues` tracker read is ADDITIVE, run only when a tracker is wired; the roadmap builds fully under `tracker: none`                                                                     | Tracker (`list_issues`) as the required/primary status source                                                            | bkit is tracker-agnostic — the #202 inline-marker `none` mode is first-class, so the roadmap must build with no tracker and never be empty because one is absent/unreachable. On-disk plan artifacts + `status.jsonl` already encode phase, so the tracker is enrichment (readiness/labels + not-yet-on-disk open issues), not the source of truth. |
| Two-tier model: deterministic `roadmap-status` block regenerated at every close + opus `roadmap-analysis` block at ship + on-demand                                                                                                                                                                                                                | Single tier (analysis-only, or mechanical-only)                                                                          | Owner-confirmed (design-input Comment 2); all three brainstorm lenses converge on it.                                                                                                                                                                                                                                                               |
| `docs/roadmap.md` = consumer-owned generated artifact, two machine-owned marker blocks, one `.agents/docs.md` Project row; NOT a shipped managed-block template                                                                                                                                                                                    | Tracker issue (gether#398 style); shipped managed-block template; two separate files                                     | Owner confirmed file. Consumer-owned avoids `bkit install` overwrite + keeps `bkit check` drift clean; two blocks in one file physically prevent the two writers clobbering each other while keeping the single artifact intact.                                                                                                                    |
| Mechanical status = a FULL projection of tracker labels + folded `status.jsonl`, regenerated (regenerate-on-conflict)                                                                                                                                                                                                                              | Incremental single-row sed edit; a new `roadmap.jsonl` event log + rendered mirror                                       | Full projection makes `-X ours`/concurrent-conflict a non-event and refreshes ALL issues at every dev-reaching close; a sed edit races the shared unstructured file (resurrects #209 Defect A); a ledger duplicates `status.jsonl`'s per-FID phase events and adds compaction machinery + contests "must be docs/roadmap.md".                       |
| Mechanical tier is deterministic — bounded `list_issues` MCP read + jq render via `bkit-roadmap-fold.sh`, no opus turn                                                                                                                                                                                                                             | Subagent/LLM-authored row updates                                                                                        | Owner called it cheap/deterministic; determinism is precisely what makes regenerate-on-conflict safe, and it avoids an opus turn per close × 5-workflow mirror cost.                                                                                                                                                                                |
| Mechanical write folds into each workflow's existing Close step, committed where the phase already commits; live-phase authority = tracker labels                                                                                                                                                                                                  | Dedicated new close step; forced dev-lock write from build/debug                                                         | Improve-over-duplicate (the Close is already the commit moment); avoids adding dev-writes to build/debug; the projection refreshes `dev` at the next design/plan/ship close and the tracker is the live truth (banner makes this explicit).                                                                                                         |
| Analysis tier = dedicated opus leaf `@bkit-roadmap-refresh`, third parallel subagent in ship Step 10, reused verbatim by `/bkit-roadmap`; writes only `roadmap-analysis`                                                                                                                                                                           | Fold the analysis into `@bkit-ship-update-docs`                                                                          | A clean leaf is reusable as-is by the on-demand utility and later by #260; folding it into update-docs couples it to ship-only doc work and blocks utility reuse. It still reads the same inputs update-docs proves are available at ship-close.                                                                                                    |
| Per-workflow staging integration (design/plan widen the STRAY allowlist to `^docs/roadmap\.md$`; build/debug already sweep via `git add -A`; ship already captures via scoped `git add -- docs/`) + a per-workflow-shape-aware CI/bats assertion                                                                                                   | Single "widen the allowlist in all 5" grep; widen ad hoc / rely on manual review                                         | The allowlist exists in only two of the five workflows; a single grep passes while build/debug mis-stage or fails spuriously where there is no allowlist. Assert the correct behaviour per shape so a missed integration reds CI, not the consumer's close.                                                                                         |
| Analysis scan bounded (open + milestone-scoped, paged), coverage-stamped, report budget reserved                                                                                                                                                                                                                                                   | Unbounded "read whole roadmap + all issues"                                                                              | `maxTurns`/context exhaustion ships a truncated but authoritative-looking best-next-step; emit a coverage record so shrinking coverage is visible.                                                                                                                                                                                                  |
| Prompt suggestions reuse `plan-complexity-check` (when-NOT-to-use) + `design-organise` grouping; reference model-selection doctrine generically + read IDE from install config; never hardcode model IDs/IDE names; emit in opus-plans/sonnet-executes shape                                                                                       | Bespoke heuristics; hardcoded model IDs / IDE names                                                                      | Existing tested doctrine (improve over duplicate); shipped surface must stay stack/vendor-agnostic — model IDs come from live endpoints and IDE targets from config, so stored strings rot.                                                                                                                                                         |
| Ledger/audit cadence = count of PERSISTED ship-close rows in committed `.bkit/stats.jsonl` (crosses N; propose N=5) + staleness-days fallback (from the `roadmap-analysis` header-stamp `ts`); injects a #80 audit candidate + open `deferrals`/`failures` items as grouped next-steps; logs `[bkit-analysis]` on counter-advance + injection-fire | Undefined "periodically"; time-based cron; the non-persisted `bkit-counter-bus.sh` `counter_count`/`counter_next` helper | `bkit-counter-bus.sh` is derive-from-active-run/non-persisted/per-FID and returns per-run attempt counts, NOT a cross-ship cadence — plan must count persisted rows instead. Deterministic, testable, observable via the existing generic `counter`-reader + the fire/advance log lines; the design mandate needs a concrete, non-silent trigger.   |
| #260 relationship: `bkit-roadmap-fold.sh` IS #260's tick-step-1 sense primitive (build once, #260 consumes the same fold + snapshot); do NOT build #260's actuator/contract or a persisted event-log now                                                                                                                                           | Build the sensing schema/ledger up front; treat #380 fully standalone                                                    | The leaf/fold boundary preserves the evolution path without speculative schema; the fold FUNCTION delivers structured sensing without a persisted ledger, so no second sensing engine is built (the anti-pattern #260 itself flags).                                                                                                                |

## Approaches Considered

| Approach                                                                                                               | Verdict                                      | Why                                                                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Regenerate-on-conflict pure-projection status block + two machine-owned marker blocks (lens 3A)                        | KEPT (core)                                  | The only shape that satisfies the owner's full two-tier requirement while making the shared-file conflict class a non-event — the central risk of a repo-global, non-namespaced file.                     |
| Reuse ship-Step-10 parallel-subagent pattern + `bkit-status-fold`-style shell helper for the mechanical tier (lens 1A) | MERGED                                       | Contributes the dedicated parallel-subagent leaf, the sourced shell-helper convention, and folding the mechanical write into the existing Close step.                                                     |
| Ledger-backed `roadmap.jsonl` + regenerated `roadmap.md` split into deterministic + LLM sections (lens 2A)             | MERGED (split) / REJECTED (persisted ledger) | The split-sections idea is kept as the two marker blocks; the persisted `roadmap.jsonl` event log is rejected — it duplicates `status.jsonl`'s phase events and adds compaction/unbounded-fold machinery. |
| Single markdown file, sed-edited mechanically + subagent-rewritten narratively (lens 2B)                               | REJECTED                                     | Concurrent closes race one unstructured file with no `merge=union`; a straight repeat of the #209 `status.json -> status.jsonl` problem.                                                                  |
| Ship-close-only + on-demand utility, no mechanical per-close write (lens 1B / 2C / 3B)                                 | REJECTED for v1 (staleness-honesty MERGED)   | Conflicts with the owner's confirmed between-ship status requirement; its "live phase = tracker labels" honesty is merged as the header banner + the fallback live-phase authority.                       |
| Append-only `roadmap.jsonl` event log + rendered `docs/roadmap.md` mirror (lens 3C)                                    | REJECTED                                     | Over-builds (compaction, render-freshness checks), largest new-invariant surface, and contests the owner's "must be docs/roadmap.md" by making the `.md` a derived mirror of a `.jsonl` source of truth.  |
| Build #260's standalone sensing primitive / contract now (lens 1C)                                                     | REJECTED (path preserved)                    | Speculative against #260's unbuilt tick (YAGNI); the leaf/fold boundary already preserves the evolution path without designing #260's schema.                                                             |

## Trade-offs Accepted

Chosen = regenerate-on-conflict pure-projection mechanical tier + a composed opus analysis leaf.

- **Gains** — conflict/concurrency safety (the board is reproducible, so `-X ours` and races are non-events); no new persisted ledger, no compaction machinery; a cheap deterministic mechanical tier; a reusable analysis leaf; the owner's two-tier model satisfied literally; #260's sense primitive delivered for free; minimal net-new persisted state.
- **vs a persisted ledger (lens 2A/3C)** — we give up durable, replayable cross-tick frontier history; #260 must call the live fold rather than replay an event log. Accepted because `status.jsonl` already holds per-FID phase history; if #260 later needs durable cross-tick snapshots, that is the deferred evolution (see Risks + `deferrals.jsonl`).
- **vs single-writer ship-only (lens 1B/2C/3B)** — we take a larger shipped-surface footprint (five workflow Close edits + STRAY-guard widen + mirror regen) instead of a one-workflow change. Accepted to deliver the owner-required between-ship status.
- **vs forcing a dev-write from build/debug** — `dev`'s `roadmap.md` status can lag by "time since the last design/plan/ship close" for issues sitting in build/debug. Accepted because the tracker is the live-phase authority and the banner makes staleness explicit.
- **A per-close bounded `list_issues` MCP read** (only when a tracker is wired) couples close latency to tracker availability. Accepted as cheap/deterministic and made best-effort (a failed/empty read falls back to the on-disk board and never gates the close); under `tracker: none` it is skipped entirely.

## Risks & Open Questions

- **OPEN (human gate)** — Should build/debug closes force a dev-located `roadmap.md` status write (reusing ship's dev-lock idiom) so `dev`'s board reflects build/debug phases between ships, at the cost of adding dev-writes to two workflows that today never touch `dev`? v1 says no (tracker = live authority). Confirm. (Deferred as a feature — see `deferrals.jsonl`.)
- **OPEN** — Cadence numbers: `N` ship-cycles (propose 5) + the staleness-days fallback value.
- **OPEN** — Exact status-board columns and whether closed/merged issues drop off the board (proposal: open + recently-merged only; closed history stays in `docs/completed.md`).
- **RISK** — Cross-provider mirror regen for five edited workflows + the new agent + the new utility: mirrors are force-overwritten and NOT drift-gated, so a stale mirror ships silently. Batch the regen at session end; dogfood `install` AND `upgrade` live.
- **RISK** — The staging integration must land correctly in ALL five workflows in the same change (per-workflow-shape-aware CI/bats assertion mandatory): design/plan need the STRAY allowlist widened to `^docs/roadmap\.md$`, while build/debug (`git add -A`) and ship (scoped `git add -- docs/`) already capture the file — a missed design/plan widen aborts a consumer's close on a staged `roadmap.md`, and a single-grep assertion would miss the three-shape reality.
- **RISK** — Analysis `maxTurns`/context exhaustion on large trackers: bounded scan + coverage stamp + reserved report budget; the `ROADMAP_SCAN_COVERAGE` `counter` row (now a first-class Data-Model output, see above — written by `@bkit-roadmap-refresh` at every analysis pass, read via the generic `counter`-reader) makes a shrinking coverage ratio machine-visible rather than a silently-truncated but authoritative-looking best-next-step.
- **RISK** — A per-close `list_issues` MCP read couples close latency/reliability to tracker availability. Mitigated by the on-disk-first model: the read runs only when a tracker is wired and is always additive, so a failed read falls back to the complete on-disk board (never blank, never gated) and emits a `[bkit-roadmap]` stderr line on every fail-open branch (read failure, 0/empty, best-effort skip) per the `docs/observability.md` bracketed-prefix convention, so a persistent degradation (e.g. an expired token no-op'ing the tracker half every close) is grep-visible instead of silent; use `list_issues`, never `search_issues` (silent-0-on-private-repo), and treat a 0/empty result as inconclusive.
- **RISK** — On-disk phase can lag the tracker for build/debug FIDs (their `status.jsonl` lives on `feat/{FID}` until ship) and for issues opened but not yet designed (no on-disk FID). Accepted: when a tracker is wired it enriches/overrides on-disk phase and adds not-yet-on-disk open issues; under `tracker: none` the build/debug lag is the same trade-off already accepted for the tracker path, and the header stamp + banner make the as-of-close basis explicit.
- **DEPENDENCY** — #80 audit-candidate injection assumes the #80 lens engine lands; until then the cadence injects a generic "run an audit" next-step referencing the audit prompt family, never a hardcoded stack lens.
- **ASSUMPTION** — The no-concurrent-workflows-per-clone constraint still holds; `roadmap.md` raises the cost of violating it, but the regenerate-on-conflict design tolerates a stray collision. v1 does not design for parallel writers.
- **ASSUMPTION** — Shipped roadmap text stays stack/vendor-agnostic and cites no tracker-internal refs (BAR-/KN-/Linear); prompt-suggestion content reuses `plan-complexity-check` heuristics generically.

## Suggested Workstreams

### WS-1: Roadmap artifact + deterministic fold foundation

#### Scope

The shared, machine-owned substrate every other workstream reads or writes:

- `docs/roadmap.md` as a consumer-owned generated artifact (peer of `deferrals.jsonl`), NOT a shipped managed-block template: the two distinct marker regions (`<!-- bkit:roadmap-status start/end -->` and `<!-- bkit:roadmap-analysis start/end -->`), the free consumer-editable region, the header stamp ("Status projected from tracker labels at {ts}; for live phase, read tracker labels."), and the "generated — edit tracker labels, not this block" banner.
- Bootstrap flow: first-run creation of the file with empty marker blocks + banner when absent; marker-block self-heal (re-emit missing/mangled anchor block(s) in place with a `[bkit-roadmap]` stderr line) as distinct from bootstrap and from in-block hand-edit banner-revert.
- `.bkit/scripts/bkit-roadmap-fold.sh` — sourced shell helper (sibling of `bkit-status-fold.sh`) providing the deterministic jq projection `(on-disk plan-artifact scan + folded status.jsonl [+ tracker label rows when wired]) -> status-board table + structured frontier snapshot`; on-disk is the primary always-available source (per-FID phase from `docs/plans/{YYYYMM}/{FID}-{design,plan}.md` presence + `status.jsonl` + `docs/completed.md`), tracker rows merged only when configured; SOURCES `BKIT_STATUS_FOLD` from `bkit-status-fold.sh` verbatim (single-source #58 reducer, never re-inlined); reads the wired-vs-`none` tracker mode from the #202 inline-marker config; every fail-open branch emits `[bkit-roadmap]` per `docs/observability.md`.
- The consumer-owned "Ideas / New Work" region contract: it lives below the last machine marker, is bootstrapped as an empty `## Ideas / New Work` heading, is NEVER rewritten by any regenerator, and is a declared read-input for the analysis tier.
- Data model: `docs/roadmap.md` block layout (two machine blocks + consumer ideas region); status-board table columns (`Issue/FID | Title | Phase | Milestone | Blocked-by | Last-transition ts`); the in-memory frontier snapshot structure (`{ id, phase, milestone, labels?, blockedBy?, lastTransitionTs, source }`, `source ∈ {"on-disk","tracker"}`, deliberately not persisted to any `roadmap.jsonl`); resolution of the OPEN column set + closed/merged drop-off question.
- `.agents/docs.md` — one new `docs/roadmap.md` row in the consumer-owned Project Documents table.

#### Requires

[]

#### Rationale

The marker-block file contract, the fold function, and the frontier-snapshot shape are the contract both the mechanical tier and the analysis tier depend on; the two-block anti-clobber seam and the snapshot schema must be fixed before either writer can target them. This is the only workstream with no upstream prerequisite (the root artifact + shared reducer).

### WS-2: Mechanical status tier — per-close hook + per-workflow staging

#### Scope

The deterministic `roadmap-status` writer wired into every workflow Close step:

- The mechanical close-step hook beside the existing `status.jsonl` commit in all five workflows: an always-run on-disk plan-artifact scan + `status.jsonl` fold, plus a bounded `list_issues` MCP read (open + milestone-scoped, paged) ONLY when a tracker is wired, piped through the WS-1 fold to rewrite ONLY the `roadmap-status` block, staged + committed with the phase's existing close commit. Under `tracker: none` no MCP call is attempted; the on-disk scan alone produces the board. No analysis/subagent turn.
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
- Analysis flow: reads the bounded frontier snapshot + `.agents/docs.md` + `deferrals.jsonl`/`failures.jsonl` + the consumer "Ideas / New Work" region of `docs/roadmap.md`; writes ranked best-next-step (folding consumer ideas in alongside open issues/backlog), dependency-aware groupings (reusing `design-organise` seam logic), prompt suggestions (bkit-optimal usage; when-NOT-to-use via `plan-complexity-check`; IDE read from install config; model recommendations by doctrine-reference; opus-plans/sonnet-executes shape). When a tracker is wired it may suggest filing a promising idea as an issue; under `tracker: none` ideas stay roadmap-local next-steps. No hardcoded model IDs / IDE names.
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

## Addendum — Canonical-home revision (post-review, 2026-07-23)

> Owner direction after the design passed review. Where this addendum conflicts with the body above, **the addendum wins**; the affected body decisions are named inline. Net effect: `docs/roadmap.md` moves from a derived view of the tracker to the **canonical home for issue state**, with the tracker as a downstream mirror.

### A. `docs/roadmap.md` is the CANONICAL home for issue state; the tracker is a downstream mirror

> **Superseded by Addendum 3 § N/O:** the CANONICAL home is now `docs/roadmap.jsonl` (the feature ledger); `docs/roadmap.md` is its regenerable human view. The tracker remains a downstream mirror.

Supersedes the body's "tracker labels = live-phase authority" and "mechanical status = a projection of tracker labels" framing (Success Criterion #1, the build/debug edge case, the two Decisions rows on live-phase authority, and the Trade-off on build/debug lag). The authority chain is now **workflow execution -> on-disk artifacts + `docs/roadmap.md` (canonical) -> tracker labels (synced FROM roadmap, see D)**. Every item being worked on MUST appear in `docs/roadmap.md` under exactly one phase section; the tracker, when connected, is a nice-to-have enrichment, not the source of truth.

### B. Phase-sectioned board + consumer backlog

The `roadmap-status` machine region is organised into phase sections — **Backlog -> Design -> Plan -> Build -> Debug -> Ship** — each listing the FIDs currently in that phase. On ship an item moves to the completed ledger (see G) and drops off the board. _(Refined by **Addendum 2 § K**: `## Ship` = in flight only, plus a separate regenerated `## Shipped` section capped at the last 10.)_ The **Backlog** is the free-form, consumer-managed region at the bottom of the file — this is the body's "Ideas / New Work" region, renamed and promoted to a first-class phase: open things to work on, never regenerated, read by the analysis tier and promotable into design.

### C. build/debug now write roadmap status to `dev` — resolves OPEN #1

Supersedes the body's "v1 = no build/debug dev-write" decision and its accepted "build/debug status lags on dev" trade-off. Because roadmap.md must show build/debug as canonical, build and debug closes write their FID's row into the `dev` `roadmap-status` region under ship's existing dev-lock idiom. All five workflows now refresh the dev roadmap at close (design/plan/ship already reach dev; build/debug gain a bounded dev-located write). This is the only way a `tracker: none` repo can show build/debug phase on dev, and it is now required, not optional — the earlier "make build/debug a no-op" simplification is void.

### D. Reverse tracker-label sync (roadmap -> tracker)

New capability: on the cadence trigger (and at analysis), reconcile the tracker TO roadmap.md's canonical state — verify each open issue's `bkit:*` phase label matches its roadmap section and update it if drifted. MCP-only (per rules), best-effort, never gates, idempotent, and must not fight a workflow's own in-flight label write (reconcile only settled drift, not a phase actively transitioning). No-op under `tracker: none`.

### E. On-disk scan excludes completed (finding #2)

The fold scopes the on-disk scan to non-completed FIDs (skip anything in the completed ledger) so `docs/plans/**` growth does not inflate per-close cost.

### F. FID is the universal key (finding #3)

Rows key on **FID** always. When a tracker is connected the tracker id is embedded in the FID (`{ISSUE_ID}-{slug}`), so no separate issue-number column is needed; under `tracker: none` the FID stands alone.

### G. Convert `docs/completed.md` -> `docs/completed.jsonl` (finding #4) — IN SCOPE for #380 (owner-confirmed 2026-07-23)

> **Superseded in part by Addendum 2 (§ H/I/J):** `completed.md` is DELETED rather than kept-or-generated; the row format is fixed in § I; the migration extends `bkit telemetry migrate` instead of a new backfill script.

Add a structured `docs/completed.jsonl` shipped-FID ledger (peer of `deferrals.jsonl`/`failures.jsonl`, `.bkit/jsonl.md` format) as the machine-readable "is this FID shipped?" source, replacing free-form markdown parsing. `@bkit-ship-update-docs` appends a row at ship close; the human-readable `docs/completed.md` is kept or generated from the ledger. **In-scope surface:** the ship workflow (`@bkit-ship-update-docs` writer) and any existing `completed.md` readers migrate together in the same change; the exclude-completed scan (E) reads the new ledger. This adds `@bkit-ship-update-docs` (and the ship Close step) to the edited shipped surface, so it joins WS-6's mirror-regen + install/upgrade dogfood.

### Reconciliation of the conflict-safety model

Making roadmap.md canonical does NOT abandon regenerate-on-conflict. The `roadmap-status` phase sections stay regenerable from (dev-visible on-disk artifacts + each closing workflow's authoritative knowledge of its own FID's phase — now written to dev for build/debug too); the **Backlog** is consumer-canonical and protected by living outside the machine markers (never regenerated). Conflict-safety holds via serial-workflow execution + the dev-lock + regenerate-from-sources, so an `-X ours` collision on the status region is still a non-event. The plan must specify the per-FID upsert-vs-full-regenerate mechanism for the phase sections.

### Workstream impact

- **WS-1** gains the phase-section layout, the Backlog region contract, exclude-completed scoping, and the `completed.jsonl` schema + the `docs/completed.md`->`docs/completed.jsonl` migration (G, in scope), including the `@bkit-ship-update-docs` writer edit.
- **WS-2** gains build/debug dev-located roadmap writes under the dev-lock (all five workflows now refresh dev at close).
- **WS-4** gains the reverse tracker-label sync (D) on the cadence.
- **WS-6** now also mirror-regens + dogfoods the edited ship Close / `@bkit-ship-update-docs` surface (from G).
- Consider a dedicated workstream for D (reverse sync) if it grows beyond a fold-in.

### Re-review findings (2026-07-23) — plan directives

Both post-revision review lenses returned **CONCERNS** (buildable + operable, no FAIL); every finding is plan-resolvable and is captured here as a directive so the plan phase addresses it explicitly. Reports: `design-rereview-1.md` (buildability) + `design-rereview-2.md` (operability) in the logs dir.

1. **~~Phase sections are a per-FID UPSERT/MERGE, not a blind full-regenerate.~~ VOID — superseded by Addendum 3 § O** (the board is a pure projection of `docs/roadmap.jsonl`, fully regenerated every run; the asymmetry this directive existed for is gone). Retained for provenance: build/debug rows are authored on `dev` at their close and are NOT re-derivable from `dev` (their `status.jsonl` lives on `feat/{FID}`). So a later design/plan/ship close must MERGE its own FID's row into the existing board, never rebuild the whole board from dev-visible sources (which would silently revert build/debug rows). This resolves the body's open "per-FID upsert-vs-full-regenerate" question: the status region is an idempotent per-FID upsert keyed on FID, and the `-X ours` non-event property holds for the writer's own row, not a blind full rebuild.
2. **~~Canonical reconciliation / recovery check.~~ VOID as a recovery path — superseded by Addendum 3 § O** (a lost board is rebuilt by re-running the fold); what survives is a smaller drift CHECK for a live `feat/*` with no ledger row. Retained for provenance: Because roadmap.md is canonical and not fully re-derivable, add a reconcile pass (at ship or on the cadence) that diffs live `feat/*` branches (+ open tracker issues when wired) against the board and re-adds or flags any missing in-flight row, with a `[bkit-roadmap]` log line — the recovery path for a lost/corrupted phase row.
3. **`completed.md` -> `completed.jsonl` migrates atomically across ALL touchpoints, with backfill.** _(Mechanism superseded by Addendum 2 § J — the migration extends `bkit telemetry migrate`, which by DE-39 is never callable from `bkit upgrade`; (c) becomes REMOVAL of the manifest entry, and (d) becomes explicit-invocation + a transitional fold fallback.)_ In one change: (a) the `@bkit-ship-update-docs` writer; (b) the ship Step 10 verdict reader `grep -c "...{FID}" docs/completed.md` at `bkit-ship.md:902` (else `UPDATE_DOCS_VERDICT` = FAIL blocks every ship); (c) the `.bkit/version` manifest hash-gate entry for `docs/completed.md` (it IS drift-gated, unlike `deferrals.jsonl`); (d) a one-time BACKFILL of existing `completed.md` entries into `completed.jsonl` — else finding E's exclude-completed reads an empty ledger on rollout day and every historically-shipped FID reappears as active.
4. **Reverse tracker-label sync is ORCHESTRATOR-mediated, best-effort, with a settled-drift guard.** No leaf prompt has tracker MCP tools (verified), so the sync lives in the workflow/orchestrator (the cadence step), never in `@bkit-roadmap-refresh`. It reconciles only SETTLED drift — skip any issue whose phase is actively transitioning (a workflow holding its lock / an in-flight `feat/{FID}`) — is idempotent, never gates, and emits a `[bkit-roadmap]` line on fire / skip / conflict.
5. **build/debug dev-write is fail-open + a 4th staging shape.** The build/debug dev-located roadmap write never gates the close (fail-open, `[bkit-roadmap]` on every fail branch) and is a FOURTH distinct staging shape beyond the body's three — the per-shape CI/bats assertion must cover it (design/plan allowlist-widen; build/debug `git add -A` on feat PLUS the new dev-lock write; ship scoped `git add`).

## Addendum 2 — Completed ledger, board cap, telemetry scope (owner, 2026-07-25)

> Owner direction taken during plan review. Where this conflicts with Addendum 1 or the body, **Addendum 2 wins**. It supersedes Addendum 1 § G's "`completed.md` is kept or generated from the ledger" and re-review directive #3's backfill mechanism, and refines § B's section list.

### H. `docs/completed.md` is DELETED, not retained

> **Amended by Addendum 3 § N:** the replacement ledger is `docs/roadmap.jsonl` (`kind: "feature"`), not `docs/completed.jsonl`. The deletion decision stands.

`docs/completed.jsonl` becomes the ONLY shipped-feature record — no dual-write, no generated markdown view. Rationale: nobody reads `completed.md` (humans read `docs/roadmap.md`; the one machine reader is the ship verdict grep), and two records of the same thing drift. Supersedes Addendum 1 § G's retention clause and every "retain / dual-write / retain-with-reason" statement in the plan.

### I. `kind: "completed"` row format — a `deferral`/`failure` row minus `severity` and `status`

> **Amended by Addendum 3 § N:** the kind is `feature` in `docs/roadmap.jsonl`, and `status` is REINSTATED as a six-state ladder (the kind is no longer terminal). Everything else below — `key` = FID, the domain `category` set, `summary`/`description`/`references`, no `severity`, no template, no hash-gate — stands.

Structurally identical to the triage ledgers so one envelope + one `fold()` covers all of `docs/*.jsonl`:

<!-- prettier-ignore -->
```jsonl
{ "ts": 1753400000000, "kind": "completed", "repo": "cbartens/bkit", "bkitVersion": "4.8.0", "workflow": "ship", "step": "ship-update-docs", "subagent": "bkit-ship-update-docs", "model": "claude-opus-5", "key": "380-roadmap-analysis-refresh", "category": "agentic", "summary": "constant roadmap analysis refresh", "description": "Automated docs/roadmap.md with a deterministic status tier refreshed at every workflow close and an analysis tier refreshed at ship.", "references": ["380", "docs/plans/202607/380-roadmap-analysis-refresh-plan.md", "PR-401", "a1b2c3d"] }
```

- `key` = `{FID}`, identity tuple `(kind, repo, key)` — the existing key-based `identity()` default, no new branch. A re-ship or hotfix of the same FID is a same-`key` append; `fold()` returns the latest and prior lines remain as history.
- `category` = the DOMAIN set already used by `deferral`/`failure` (`agentic`/`infra`/`correctness`/…), NOT `completed.md`'s legacy product-shaped set (`backend`/`frontend`/`data`/`integrations`/`ai`) — one enum across ledgers.
- `summary` = title; `description` = the dense prose that was `completed.md`'s `**Summary:**`; `references[]` absorbs both `**Artifacts:**` and `**Related:**` (plan paths, PR, SHAs, tracker id, sibling row `ts`).
- **No `severity`** (`.bkit/jsonl.md` § Severity forbids it outside the triage trio) and **no `status`** — the kind is terminal.
- **No template and no hash-gate:** no `.jsonl` in the tree is seeded by `bkit install` or listed in `.bkit/version` (`deferrals`/`failures`/`knowledge`/`decisions` are all born on first append) — `completed.jsonl` follows. The manifest entry for `docs/completed.md` is REMOVED, not regenerated.

### J. Migration extends `bkit telemetry migrate` — it is NOT a new backfill script

> **Amended by Addendum 3 § N/S:** the fifth pair targets `docs/roadmap.jsonl` and back-filled rows land at `status: "SHIPPED"`; the same run performs the § S bootstrap seed for in-flight FIDs.

The `.md` -> `.jsonl` migrator already exists (`.bkit/src/bkit-telemetry-migrate.ts`, verb `bkit telemetry migrate`) and already ports four legacy ledgers (`knowledge.md`, `decisions.md`, `pending.md`, `.bkit/friction.md`), each under a `.md.bak` -> write rows -> **row-count parity gate** -> delete the `.md` ONLY after parity contract, idempotent on re-run. `docs/completed.md` -> `docs/completed.jsonl` is added as the FIFTH pair, reusing that contract verbatim. This supersedes the planned standalone `bkit-completed-backfill.sh`.

**Inherited invariant (DE-39):** the migrator is **NEVER callable from `bkit upgrade`** — explicit invocation only, enforced mechanically by `bkit-telemetry-migrate.integration.test.ts`. This voids re-review directive #3(d)'s "wire the backfill to `bkit upgrade`" rollout trigger. The rollout path becomes:

1. An advisory (existing `PreflightFinding` channel) fires while `docs/completed.md` still exists, naming `bkit telemetry migrate`.
2. The fold's exclude-completed step is transitional-tolerant: read `docs/completed.jsonl`; if it is absent/empty AND `docs/completed.md` still exists, fall back to the legacy `completed.md` grep for this one purpose and emit a `[bkit-roadmap]` line pointing at the migrate command. Deleting the `.md` at migration ends the fallback permanently.

### K. Board: `## Ship` (in flight) and `## Shipped` (last 10) are SEPARATE sections

> **Amended by Addendum 3 § N/O:** there is no upsert/regenerate split between sections — the WHOLE board is regenerated from `docs/roadmap.jsonl`. `## Ship` holds FIDs whose latest status is mid-ship, `## Shipped` holds `SHIPPED` FIDs capped at 10, and `ABANDONED` FIDs are hidden entirely.

Refines § B's section list to **Backlog -> Design -> Plan -> Build -> Debug -> Ship -> Shipped**:

- **`## Ship`** — items whose ship workflow is in flight (PR open, not yet merged). Per-FID upsert, same mechanics as the other phase sections, uncapped.
- **`## Shipped`** — the last **10** shipped FIDs by `ts` desc, **fully regenerated from `docs/completed.jsonl`** on every fold. Holds no state, prunes itself, needs no delete step; older entries stay in the ledger and simply fall off the board.

They MUST be separate sections because their write mechanics differ: a regenerate-from-ledger pass over a combined section would wipe the in-flight ship row the ship workflow upserted at its own start. This resolves the plan's open "board scope / drop-off policy" question: shipped items leave the active phases immediately and remain visible in `## Shipped` for exactly 10 cycles.

### L. `.bkit/stats.jsonl` is UNCHANGED — the `activity.jsonl` proposal is closed

A mid-review proposal to rename/split `.bkit/stats.jsonl` into an `activity.jsonl` (enriching `outcome` rows with FID + prose) is **rejected and closed**, for the record so it is not re-raised:

- `outcome` rows are load-bearing for the `med·5` telemetry report (`bkit-telemetry.ts`) and are copied wholesale into bkit's harvest store (`HARVEST_COPY_FILES`) — adding consumer feature prose there changes what leaves a consumer repo, which `.bkit/jsonl.md` deliberately restricts.
- `.bkit/stats.jsonl` is the hot file drained by `writeRollupShard` into archive shards; durable shipped-history must not live in a compaction path.
- The `docs/` (project history, prose) vs `.bkit/` (machine telemetry) split already exists; `completed.jsonl` is its natural fifth `docs/` ledger.

~~Optional, NOT in #380: adding `references: ["{FID}"]` to the close-step `outcome` row.~~ **REJECTED outright by Addendum 3 § R** — `stats.jsonl` is harvested cross-repo and must carry no consumer task detail.

### M. `bkit harvest` does NOT consume the feature ledger (owner, 2026-07-25)

Neither copied nor counted: `HARVEST_COPY_FILES` (`stats.jsonl`, `friction.jsonl`) and the count-only set (`docs/deferrals.jsonl`, `docs/failures.jsonl`) are unchanged. Feature titles and prose stay in the consumer repo. Codec acceptance (the new kind passes `validate`) is all the ledger needs; no harvest reader is added now or planned.

## Addendum 3 — Feature ledger as canonical state; roadmap.md as pure projection (owner, 2026-07-27)

> Owner direction during plan review. Where this conflicts with Addendum 1, Addendum 2, or the body, **Addendum 3 wins**. Net effect: the ledger named in Addendum 2 § H/I is renamed, widened from ship-only to ALL FIVE phase closes, and becomes the canonical state; `docs/roadmap.md` demotes to a regenerable human view. This supersedes Addendum 1 § A's "roadmap.md is the canonical home" in favour of "the ledger is canonical, roadmap.md is its window", and voids the machinery that existed only because roadmap.md was not re-derivable.

### N. `docs/roadmap.jsonl` — the ledger, written at EVERY phase close

Renames and widens Addendum 2's `docs/completed.jsonl`:

- **File:** `docs/roadmap.jsonl` (peer of `deferrals`/`failures.jsonl`; `merge=union`; no template, no `.bkit/version` hash-gate, born on first append). `docs/roadmap.md` is its human-readable view — same stem, one machine, one human.
- **Kind:** `feature`. Row = envelope + `{ key: "{FID}", status, category, summary, description, references[] }` — a `deferral`/`failure` row minus `severity`, with its own status ladder.
- **Status ladder:** `DESIGNED` | `PLANNED` | `BUILT` | `DEBUGGED` | `SHIPPED` | `ABANDONED`. Each phase close appends one same-`key` row; `fold()` last-wins gives current phase, the row sequence is the history. Re-runs (a second build, a debug loop, a re-ship) are same-`key` appends, never edits.
- **Writers:** design close -> `DESIGNED`; plan close -> `PLANNED`; build close -> `BUILT`; debug close -> `DEBUGGED`; ship close -> `SHIPPED` (via `@bkit-ship-update-docs`, at Step 10 so the verdict reader still sees it). `ABANDONED` is appended by a human, or by an agent on explicit human instruction — never inferred by a workflow.
- **Reaching `dev`:** design/plan/ship closes already run on `dev`. build/debug closes run on `feat/{FID}`, so they keep Addendum 1 § C's dev-lock write — but it now appends ONE `merge=union` JSONL line instead of upserting markdown, so it is conflict-free by construction rather than by invariant.

<!-- prettier-ignore -->
```jsonl
{ "ts": 1753600000000, "kind": "feature", "repo": "cbartens/bkit", "bkitVersion": "4.8.0", "workflow": "build", "step": "build-close-workflow", "key": "380-roadmap-analysis-refresh", "status": "BUILT", "category": "agentic", "summary": "constant roadmap analysis refresh", "description": "Feature ledger + regenerated roadmap board.", "references": ["380", "docs/plans/202607/380-roadmap-analysis-refresh-plan.md", "PR-401"] }
```

### O. `docs/roadmap.md` is a PURE PROJECTION — no upsert, no reconcile

Because every phase close appends to an append-only, union-merged ledger that reaches `dev`, the board is fully re-derivable at any moment. The fold **regenerates the whole `roadmap-status` block from the ledger** on every run. Consequences — these are removals, not additions:

- **Addendum 1 re-review directive #1 (per-FID UPSERT) is VOID.** It existed because build/debug rows were authored on `dev` and not re-derivable from it. The ledger removes that asymmetry.
- **The KN-42 duplicate-row dedupe invariant is VOID** for `roadmap-status` — a full regenerate cannot leave duplicate rows, so `merge=union`/`-X ours` on `roadmap.md` needs no idempotent-collapse guarantee. (`merge=union` on `docs/roadmap.jsonl` is correct and sufficient: append-only.)
- **Addendum 1 re-review directive #4 (reconcile/recovery pass) is VOID as a recovery mechanism.** A lost, corrupted, or deleted `roadmap.md` is rebuilt exactly by re-running the fold. What remains worth keeping is a much smaller drift CHECK: warn when a live `feat/*` branch has no ledger row at all (a close that never wrote), which is a missing-write signal, not a board-recovery path.
- Board sections project from each FID's folded latest status: `SHIPPED` leaves the active sections and shows in `## Shipped` (last 10 by `ts` desc, then falls off); `ABANDONED` is hidden from the board entirely and lives only in the ledger.

### P. Marker-pair invariant — bkit only rewrites BETWEEN markers

Supersedes the body's "the consumer region below the last machine marker": **bkit rewrites only the bytes strictly between a `start`/`end` marker pair. Everything outside any pair is consumer territory, wherever it sits in the file** — above the board, between the `roadmap-status` and `roadmap-analysis` blocks, or at the bottom. Humans use `roadmap.md` as a scratchpad for ideas that are not yet designs or plans; all of it survives every regenerate.

The one path that can still destroy consumer bytes is the self-heal for missing/mangled markers: it MUST insert or repair markers without swallowing surrounding text, and carries its own test row rather than riding on the bootstrap row.

### Q. Cadence — count `BUILT` FIDs from the ledger, evaluate at ship close

- **Count:** distinct FIDs whose ledger status reached `BUILT` **since the last cadence FIRE** — NOT since the last analysis refresh. The analysis block is refreshed at every ship close, so anchoring on its header `ts` would reset the counter on every ship and the threshold would never be reached.
- **Fire timestamp:** persisted as a `counter` row in `.bkit/stats.jsonl`, `counterName: "ROADMAP_CADENCE_FIRE"` — no FID, no task detail (§ R). Read through the existing generic `counter`-reader.
- **Thresholds:** `N` = **10** build-cycles OR **90** days since the last fire. Both consumer-adjustable via the `package.json` manifest — `bkit.roadmap.buildCycles` (default 10) and `bkit.roadmap.stalenessDays` (default 90) — read with the existing `bkit.*` jq idiom, NOT a new config surface. `.agents/config.md` gets a one-line pointer.
- **Evaluation point:** ship close and `/bkit-roadmap` only. A skipped ship delays a fire; it never loses one, because the count accrues on build closes. Known edge, accepted: in a repo that NEVER ships, neither threshold is ever evaluated — `/bkit-roadmap` is the manual entry point.
- **On fire:** rebaseline to now (a long gap produces ONE fire, not a backlog of them), inject the #80 audit candidate + open `deferrals`/`failures` items, run the reverse tracker sync.

### R. No task detail in harvested ledgers — `references: ["{FID}"]` on `outcome` rows is REJECTED

Reverses Addendum 2 § L's "optional follow-up". `.bkit/stats.jsonl` and `.bkit/friction.jsonl` are `HARVEST_COPY_FILES` — copied wholesale into bkit's cross-repo store — so they carry how bkit PERFORMS, never what a consumer is working on. A FID identifies the consumer's task. The cadence therefore counts FIDs out of `docs/roadmap.jsonl`, which harvest never touches (§ M). The only new row in `stats.jsonl` is the FID-free `ROADMAP_CADENCE_FIRE` counter.

### S. Bootstrap seed — the on-disk scan runs ONCE, not per close

With the board projecting purely from the ledger, a repo adopting this feature has in-flight work that has no ledger rows yet, and it would stay invisible until each FID next closes a phase. So the on-disk scan (`docs/plans/**` artifacts + folded per-FID `status.jsonl`) is retained but repurposed: it **seeds** the ledger once, at migration/first bootstrap, writing one row per in-flight FID at its detected status. After that the board never re-derives from disk — every subsequent row comes from a phase close.

## Addendum 4 — Post-#384 ship-surface re-anchor (2026-07-29)

This design was written against `dev` before #384 landed. Three body claims about the shipped surface are now factually wrong; the sections below supersede them. Verified against `dev` at `e14fe9f4`.

### T. Ship stages via `BOOK_ROOT` + `BOOK_PATHS` — the scoped `git add -- docs/` NO LONGER EXISTS

**Supersedes every body claim that "ship already captures `docs/roadmap.md` via a scoped `git add -- docs/`"** (§ Key Edge Cases, § Components 3/4, § Architecture, § Decisions, § Risks, WS-2, WS-3). #384 replaced that idiom outright:

- **`BOOK_ROOT`** (`bkit-ship.md` Step 1, line ~171) is the single tree every status/artifact write targets: `RUNTIME_DEVPUSHES=true` -> `$REPO_ROOT` (dev tree); `false` -> the current working-branch tree (#341 shape A). Roadmap ledger + board writes at ship MUST resolve under `$BOOK_ROOT`, exactly like `status.jsonl` — never a bare relative path.
- **`BOOK_PATHS`** (line ~187) is a FROZEN path-scoped staging allow-list; the Close step stages `git -C "$WT" add $BOOK_PATHS` (line ~1257). Line 28 of the workflow bans both `-A` and blanket `docs/` staging. The list today contains `docs/completed.md`.
- **Consequence for #380:** deleting `completed.md` without editing `BOOK_PATHS` leaves ship staging a dead path AND never staging `docs/roadmap.jsonl` / `docs/roadmap.md` — the `SHIPPED` row written at Step 10 is never committed, while the verdict reader (working tree) still passes green. Silent loss of every shipped FID. `BOOK_PATHS` MUST swap `docs/completed.md` -> `docs/roadmap.jsonl` + `docs/roadmap.md`.
- **`.bkit/src/bkit-ship-invariants.test.ts`** publishes that allow-list as `BOOK_PATHS_ALLOW_LIST` (a deliberately frozen #384 invariant, currently containing `docs/completed.md`) plus negative assertions banning `-A` / bare `docs/`. It must be updated in the SAME change, and the negative assertions must stay intact — re-introducing blanket `docs/` staging to capture the roadmap files is a regression of `fd6180c0`, not a fix.

### U. design/plan carry TWO STRAY guards, one per runtime mode — both must widen

**Supersedes the body's "the STRAY-file guard allowlist ... lives ONLY in `bkit-design.md` and `bkit-plan.md`; those two must widen it"** — correct about which workflows, wrong about the count. Each of those two workflows has the guard TWICE, once per runtime shape:

- `RUNTIME_DEVPUSHES=true` (dev path): `bkit-design.md:793`, `bkit-plan.md:854` — checks `git diff --cached --name-only` after the `-X ours` squash.
- `RUNTIME_DEVPUSHES=false` (PR path, #341 shape A): `bkit-design.md:827`, `bkit-plan.md:888` — checks `git diff --name-only "origin/dev...{BRANCH}"`, and its allowlist is narrower (no `stats.jsonl`).

Widening only the first aborts every close in PR mode with `design close-workflow diff carries non-doc files: docs/roadmap.jsonl`. Both guards in both workflows widen to accept `^docs/roadmap\.md$` and `^docs/roadmap\.jsonl$` — four edits, not two. Correspondingly, "regenerate the board on `dev`" holds only on the dev path; in PR mode the close writes on the working branch and the row reaches `dev` through the squash PR merge.

### V. Cadence body text is superseded by § Q

**Supersedes § Success Criteria 4 (corrected in place), § Components 7, § Architecture "Cadence flow", and § Decisions** — all of which describe counting persisted ship-close `outcome` rows in `.bkit/stats.jsonl` with `N`=5 and staleness measured from the `roadmap-analysis` header stamp. § Q is authoritative: count DISTINCT `BUILT` FIDs in `docs/roadmap.jsonl` since the last `ROADMAP_CADENCE_FIRE` row, `N`=10, staleness 90 days from that same fire. § R forbids FIDs in `stats.jsonl`, so the `outcome`-row count cannot be per-FID and is not usable as the cadence source.
