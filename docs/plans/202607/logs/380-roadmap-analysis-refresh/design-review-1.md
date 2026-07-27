Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Buildability — stack feasibility, library fit, integration risk.

## Ecosystem Search

The "stack" here is bkit's own shipped surface (POSIX shell + jq folds, MCP tracker
reads, markdown workflow/agent files, cross-provider mirror render). No external
library ecosystem is in play, so the search is "does bkit already solve each
capability the design needs?" — the improve-over-duplicate rule governs.

- **Deterministic status fold (tracker labels + status.jsonl -> board)** — EXISTS.
  `.bkit/scripts/bkit-status-fold.sh` is the exact sibling the design names; it
  exports `BKIT_STATUS_FOLD` (a single-sourced jq reducer) sourced by all five
  orchestrators. Fit: the reducer folds `status.jsonl` into a run-array today; the
  new `bkit-roadmap-fold.sh` reuses `BKIT_STATUS_FOLD` verbatim for the status.jsonl
  half and adds the tracker-label projection. Recommendation: **USE-AS-IS + ADAPT**
  (source the existing fold, add the projection blob alongside it).
- **Parallel leaf subagent at ship close** — EXISTS. `bkit-ship.md` Step 10 launches
  `@bkit-ship-update-docs` ‖ `@bkit-ship-summary` via the `Agent` tool with the exact
  cwd/Read/Create context shape the design copies. Adding a third parallel leaf is a
  well-trodden pattern. Recommendation: **USE-AS-IS** (clone the invocation block).
- **On-demand utility workflow shape** — EXISTS. `bkit-worktree-sync.md` /
  `bkit-worktree-prune.md` give the `/bkit-*` utility skeleton (frontmatter
  `description`, `Usage:`, human-triggered CAUTION, numbered steps). `/bkit-roadmap`
  follows it directly. Recommendation: **USE-AS-IS**.
- **`counter` telemetry on `.bkit/stats.jsonl`** — PARTIAL. The `counter` kind exists
  in `.bkit/jsonl.md` and `.bkit/stats.jsonl` is tracked (not gitignored) and reaches
  `dev`. BUT the existing counter primitive (`bkit-counter-bus.sh`) is explicitly
  **derive-from-active-run**, non-persisted, per-FID — "There is no persisted counter
  state. Every counter is DERIVED from status.jsonl." A cross-ship "SHIP_CYCLE % N"
  cadence is a _different_ counting model. Recommendation: **BUILD-CUSTOM** (count
  persisted ship-close rows in `.bkit/stats.jsonl`), and the design must say so — see
  CRITICAL.
- **Bounded tracker read** — EXISTS. `list_issues` MCP is already invoked inline by
  all five orchestrators; the design's "never `search_issues`" matches the known
  silent-0-on-private-repo trap. Recommendation: **USE-AS-IS**.
- **Prompt-suggestion sub-logic** — EXISTS. `bkit-plan-complexity-check.md`
  (when-NOT-to-use) and `bkit-design-organise.md` (grouping/dependency) are shipped
  prompts the analysis leaf references. Recommendation: **ADAPT** (reference the
  doctrine, do not re-derive heuristics).
- **Consumer-owned generated artifact + `.agents/docs.md` Project row** — EXISTS as
  pattern. `docs/deferrals.jsonl` and the `Project Documents` table below `bkit:end`
  are the precedent; `bkit install` never overwrites that region and `bkit check`
  drift stays clean. Recommendation: **USE-AS-IS**.

## Stack Feasibility

Buildable with the approved stack; every primitive has a shipped precedent. Nothing
requires a new runtime, dependency, or file format. Concrete constraints found in
the code that the design under- or mis-states:

1. **Per-workflow git-staging is NOT one uniform "widen the STRAY allowlist."** The
   allowlist regex the design quotes
   (`^docs/plans/|^docs/(deferrals|decisions|failures)\.jsonl$|^\.bkit/friction\.jsonl$`)
   exists in **only two** files: `bkit-design.md:790` and `bkit-plan.md:851`.
   `bkit-build.md` and `bkit-debug.md` close with `git add -A` (no allowlist — a
   staged `roadmap.md` is swept in automatically, on `feat/{FID}`). `bkit-ship.md`
   stages docs with a **scoped** `git add -- docs/` (line 916), which already
   captures `docs/roadmap.md`. So the mechanical hook integrates three different
   ways, and the "widen allowlist in all 5" framing is inaccurate — the CI/bats
   assertion must be per-workflow-shape aware, not a single grep.

2. **The mechanical tier is not pure-shell "no LLM turn."** The tracker-agnostic read
   is `list_issues` MCP, which is orchestrator-mediated (agent issues the call, pipes
   JSON to the fold). It is _not an extra subagent/opus turn_, but it is also not a
   standalone shell script the way `bkit-status-fold.sh` is. A truly shell-only path
   would need `gh`, which breaks tracker-agnosticism for Linear consumers. Success
   Criterion #1's "no LLM turn" should read "no analysis/subagent turn."

3. **stats.jsonl reaches `dev` only at ship;** the cadence counter's persisted rows
   live there. Build/debug commit to `feat/{FID}`. This is consistent with the
   design's ship-cycle cadence (fires at ship-close, where the dev copy is written),
   so it is fine — but it confirms the cadence can only be evaluated at ship, never
   mid-build.

## Library / API Evaluation

No third-party libraries. The only "API" is the tracker MCP surface (`list_issues`)
already in use, plus the `Agent` tool and jq. Maturity/adoption: all in-repo,
shipped, test-covered (`bkit-trackers.test.ts`, `bkit-workflow-telemetry-script.integration.test.ts`).
License/bundle: N/A (shell + markdown shipped surface). Type coverage: the jsonl
codec is TypeScript (`.bkit/src/bkit-telemetry.ts`) — a new `counterName` for the
cadence would flow through the existing closed-enum `counter` kind without a schema
version bump, as the design intends.

## Integration Risk

- **Blast radius = the shipped surface of all five workflows + ship Step 10 + a new
  agent + a new utility + `.agents/docs.md`.** Every one of those edited files needs
  cross-provider mirror regen (claude/cursor/opencode), which is force-overwritten
  and NOT drift-gated — a stale mirror ships silently (known trap; memory +
  design Risk both flag it). Mitigation is real but manual: batch `bkit install` at
  session end and dogfood `install` AND `upgrade` live.
- **Ordering dependency at ship close:** the `@bkit-roadmap-refresh` leaf writes the
  `roadmap-analysis` block in Step 10, but the docs commit is the scoped
  `git add -- docs/` in Step 11. The design must confirm the write lands before the
  Step-11 stage (it does, given Step 10 precedes Step 11) — otherwise the analysis
  block is written but never committed.
- **Concurrency:** the no-concurrent-workflows-per-clone constraint holds; the
  regenerate-on-conflict projection tolerates a stray collision, which is the right
  call. Low risk.
- **best-effort MCP read** couples close latency to tracker availability; design
  already makes it non-gating (failed/empty read keeps prior block). Low risk.

## PoC Approach

Do not build. Minimal proof, in three slices:

1. **Fold slice** — hand-write `bkit-roadmap-fold.sh` sourcing `BKIT_STATUS_FOLD`;
   pipe a captured `list_issues` JSON + a sample `status.jsonl` through it; assert it
   renders the status-board table + the in-memory frontier snapshot deterministically
   and is byte-identical on re-run (proves regenerate-on-conflict safety).
2. **Cadence slice** — a jq one-liner over a sample `.bkit/stats.jsonl` counting
   persisted ship-close rows and evaluating `% N` (proves the counter primitive is
   buildable from persisted rows, distinct from the active-run helper).
3. **Staging slice** — dry-run the three staging shapes (design/plan allowlist widen;
   build/debug `git add -A`; ship `git add -- docs/`) against a staged `roadmap.md`
   to confirm each commits it without tripping a guard.

Describable in <200 words, but slice 2 (cadence primitive) and the three-way staging
reality are the reason the verdict is CONCERNS not PASS.

## Unknowns & Blockers

- **Cadence counter primitive** — which persisted rows define a "ship cycle"
  (`outcome` rows keyed by workflow=ship? a new `counterName`?), and how the
  staleness-days fallback is measured. Needs a jq experiment against real
  `.bkit/stats.jsonl` before plan.
- **Status-board column set + closed-issue drop-off** — the design leaves this OPEN;
  the fold's output schema can't be finalised until it's settled (affects the fold's
  jq and the `.agents/docs.md` row scope).
- **Whether `roadmap-analysis` staging at ship works within the existing Step-10/11
  boundary** or needs a stage line in Step 10 — a 5-minute read-through confirms, but
  it is currently unstated.

## Verdict Reasoning

CONCERNS, not PASS: every capability the design needs already exists in bkit and the
architecture is feasible with the approved shell/jq/MCP/markdown/mirror stack — no
new runtime, dependency, or persisted ledger. But two buildability specifics are
mis-stated in ways that will bite during plan/build if not corrected: (1) the
cadence "counter row" reuses a name for a primitive that does NOT do cross-run
persisted counting today, and (2) the "widen the STRAY allowlist in every touched
workflow" model does not match the three different staging shapes actually in the
five workflows. Both are design-level clarifications, fully addressable — hence
CONCERNS, not FAIL. The design correctly defers the persisted-ledger / #260-actuator
/ #80-engine surface.

## CRITICAL

1. **Cadence counter is a new primitive, not the existing counter helper.**
   `bkit-counter-bus.sh` is explicitly derive-from-active-run and non-persisted
   ("There is no persisted counter state … each fenced block is a fresh process").
   The ship-cycle cadence must be a count of _persisted_ ship-close rows in the
   committed `.bkit/stats.jsonl`. The design must name this correct primitive (and
   the exact `kind`/`counterName`/key it counts, plus the staleness-days measure) so
   plan doesn't try to reuse `counter_count`/`counter_next` — which would silently
   return per-run attempt counts.
2. **Replace "widen the STRAY-guard allowlist in every touched workflow" with the
   real per-workflow staging integration.** The allowlist regex exists only in
   `bkit-design.md` and `bkit-plan.md`; `bkit-build.md`/`bkit-debug.md` use
   `git add -A` (no guard); `bkit-ship.md` uses scoped `git add -- docs/`. The
   mandatory CI/bats assertion must assert the correct behaviour per workflow shape,
   not grep one allowlist across all five — otherwise the assertion passes while a
   build/debug close silently mis-stages, or fails spuriously on workflows that have
   no allowlist to widen.

## OPTIONAL

- Reword Success Criterion #1's "no LLM turn": the tracker read is MCP (orchestrator-
  mediated), so it is "no analysis/subagent turn," not pure-shell. Prevents a plan
  task that tries to make the fold a standalone shell script and then reaches for
  `gh` (breaks Linear tracker-agnosticism).
- State the Step-10-writes / Step-11-stages ordering for the `roadmap-analysis` block
  explicitly so the analysis write is provably committed by the scoped
  `git add -- docs/`.
- Confirm `bkit-roadmap-fold.sh` sources `BKIT_STATUS_FOLD` rather than re-inlining
  the reducer (the whole point of the #58 single-source extraction).

## OUT OF SCOPE

- #260 actuator/contract and a persisted `roadmap.jsonl` event log — correctly
  deferred by the design; not a buildability blocker for v1.
- #80 lens-engine dependency — design already handles the not-yet-landed case with a
  generic "run an audit" next-step; no action for this lens.
- Model-ID / IDE-target volatility — a shipped-surface doctrine concern (stack
  independence), already reflected in the design's "reference doctrine generically,
  read IDE from config" decision; out of the buildability lens.
