Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.

Framing: bkit ships no live service — the "on-call" surface is (a) the consumer reading CI/`bkit install`/`bkit check` output and (b) the bkit maintainer triaging a consumer-filed issue or `bkit-debug` transcript. Every failure mode below is graded against that offline-diagnosis model, not a pager.

## Failure-Mode Enumeration

1. **Mechanical tier — bounded `list_issues` MCP read fails/times out at Close.** Internal dep failure (tracker unreachable, rate-limited, auth expired). Design: best-effort, keeps prior block, never gates the close. Detection: **none specified** — no log line, no counter. Blast radius: one issue's status view goes stale for one cycle; self-heals at next close IF the underlying tracker problem clears — but if the tracker problem is persistent (e.g. an expired token), every close silently no-ops the roadmap write indefinitely with zero signal.
2. **`list_issues` returns 0/empty on a private repo (the `search_issues` failure class the design already guards against by tool choice).** Design: treat 0/empty as inconclusive, keep prior block. Same detection gap as #1 — no differentiation logged between "really 0 open issues" and "read degraded."
3. **STRAY-guard allowlist widen missing/incomplete in one of the five workflows.** Internal logic gap (a shipped-surface bug, not a runtime failure). Detection: **loud** — consumer's close hard-aborts with the existing guard message; design mandates a CI/bats assertion to catch this pre-ship. Blast radius: every consumer of the unfixed workflow, until a bkit patch ships — high, but caught at build time if the assertion lands as specified.
4. **Marker blocks missing or malformed in an existing (non-bootstrap) `docs/roadmap.md`** — e.g. a consumer manually deletes/mangles `<!-- bkit:roadmap-status -->` markers. Not a bootstrap case (file absent) and not the "hand-edits content inside markers" case (banner-revert covers that) — this is a third case the design does not address: fold/regen behavior when the anchor markers themselves are gone. Detection and recovery path: unspecified. Blast radius: one file, but potentially every future close on that clone until manually fixed.
5. **Concurrent-close / `-X ours` squash conflict on `docs/roadmap.md`.** Design: regenerate-on-conflict, explicitly a non-event by construction. Detection: N/A by design (self-healing). Well covered.
6. **`@bkit-roadmap-refresh` `maxTurns`/context exhaustion on a large tracker.** Design: bounded scan, coverage stamp, reserved report budget. Detection: a text stamp in `roadmap.md` plus (per Risks section only, not the Architecture/Components section) a `stats.jsonl` coverage record. Blast radius: a truncated-but-authoritative-looking "best next step" reaching every human/agent reading the file until the next ship or on-demand run — the design itself names this the failure to avoid, so its detection strength matters most of any failure mode here.
7. **Cadence counter (`stats.jsonl` `counter` row) never increments, increments but the threshold check is off-by-one, or the injection silently fails to append the audit/ledger candidates.** Internal logic / partial-state failure. Detection: **none specified.** Blast radius: low (a UX/completeness regression, not data corruption) but directly defeats one of the issue's three explicit requirements ("every now and then inject #80 audits", "deferrals/failures.jsonl reviewed periodically") with no way for the maintainer or a consumer to notice it stopped firing short of manually auditing history.
8. **Bootstrap race** — two workflows in one clone both find `docs/roadmap.md` absent and both bootstrap-write it. Covered by the existing "no concurrent workflows per clone" assumption (explicitly named as an ASSUMPTION, not re-litigated) — acceptable, not a new gap.
9. **`.agents/docs.md` index row / new agent or utility mis-mirrored across claude/cursor/opencode.** Already flagged by the design itself as a RISK with a mitigation (batch regen + dogfood install/upgrade live); this is a known, pre-existing operational gap in bkit's shipped-surface tooling (mirrors are not drift-gated), not new to this design.

## Observability Coverage

- **Failure mode 1/2 (tracker-read failure/empty-result at Close)** — MISSING. `docs/observability.md`'s established convention is a per-subsystem `[Context]` stderr prefix (`[bkit-comply] grader unavailable, skipping` is the closest existing analogue — same fail-open shape: best-effort, log, never gate, exit 0). The design specifies the fail-open _behavior_ but not the _log line_. No `[bkit-roadmap]` prefix is named anywhere in the design.
- **Failure mode 4 (malformed/missing markers on non-bootstrap file)** — MISSING. No log signature, no fallback path documented (re-bootstrap? abort with guidance? silently no-op?).
- **Failure mode 6 (analysis truncation/coverage shrink)** — PARTIAL. A human-readable coverage stamp in `roadmap.md` is a Components-section commitment; a `stats.jsonl` coverage record is mentioned only in the Risks section, not carried into Architecture/Components/Data Model as a first-class output. Given the design calls this out as the central failure to avoid, the metric belongs in the Data Model section (a `counter`/telemetry row shape) not just a Risks-section aside — as written, it reads as an intention rather than a specified component.
- **Failure mode 7 (cadence counter mis-fire)** — MISSING. No log line, no verification path (e.g., a bats/CI assertion that the counter monotonically advances and the threshold check fires at the right cycle), no way to distinguish "no audit candidates existed" from "injection logic broke."
- **Failure mode 3 (STRAY-guard gap)** — COVERED. CI/bats assertion mandated at design time; the runtime failure itself is loud (close aborts).
- **Failure mode 5 (conflict/regenerate)** — COVERED by construction (no state to observe — reproducibility is the guarantee).
- **Correlation / cross-service tracing** — N/A; this is a single-clone, single-process CLI/agent flow, not a distributed service. No trace-span gap.

## On-Call Ergonomics

Given the offline-diagnosis model (no pager), the equivalent of "alert payload" is: (a) what a consumer sees in their terminal/CI log, (b) what a bkit maintainer sees when triaging a filed issue or a `bkit-debug` transcript.

- **Tracker-read failure at Close** — currently silent. No runbook to chase because nothing signals a problem exists; a consumer would only notice via secondary symptom (roadmap.md looks stale) and has no log line to grep. Recovery is automatic in the transient case, but there is no mechanism to detect the persistent case (e.g., expired token held over many closes). Add the `[bkit-roadmap]` fail-open log line so a `bkit-debug`/CI-log grep surfaces it.
- **STRAY-guard abort** — high clarity: the failure is the close itself failing with the existing guard message; recovery is a bkit patch (fix the missed workflow), not a per-consumer action once the CI/bats assertion is landed.
- **Analysis coverage shrink** — currently a passive text stamp a human must notice while reading `roadmap.md`; no push signal, no threshold-driven advisory in `bkit check`'s existing advisory-checklist surface (`Blockers`/`Advisories` per `docs/observability.md`). Recovery is human judgement (re-run `/bkit-roadmap` with wider scope) but nothing prompts that judgement to be exercised.
- **Cadence counter mis-fire** — no alert of any kind; would only surface as a much later human observation ("we never got an audit suggestion") with no log trail to diagnose why.
- **Noise** — no alert-storm vector identified; the design's failure modes tend toward silent under-firing, not over-firing/paging noise. That is itself worth naming as the opposite ergonomic risk: a maintainer/consumer has no way to know the feature quietly stopped working.

## Operational Dependencies

- New on-call-relevant surface introduced: `docs/roadmap.md` becomes a file agents/humans trust for "current phase" and "best next step" — its staleness or silent non-refresh is a new trust dependency that did not exist before (previously, only tracker labels were consulted).
- New shipped script `bkit-roadmap-fold.sh` joins the small set of sourced shell helpers (`bkit-status-fold.sh` peer) — any future incident triage for a "wrong phase shown" bug adds this file to the standard debug checklist.
- New `stats.jsonl` `counter` row (cadence) extends the existing counter-bus convention (`[bkit-analysis] counterSource trust: shell-bus=N …`) — should be folded into the existing `bkit analysis`/`[bkit-analysis]` reporting surface rather than left as an unobserved side file, otherwise it's a second, unaudited counter mechanism.
- Cross-provider mirror regen for 5 edited workflows + 1 new agent + 1 new utility — pre-existing known gap (mirrors not drift-gated), explicitly acknowledged by the design as a RISK with a stated mitigation (batch regen, dogfood install/upgrade live). No new gate is proposed beyond existing practice; acknowledged, not resolved — acceptable per project precedent, but worth restating so it isn't dropped at plan time.

## Verdict Reasoning

The design's core conflict-safety property (regenerate-on-conflict pure projection) is operability-sound by construction — the highest-blast-radius classic failure mode (concurrent/`-X ours` corruption) is a designed non-event, and the STRAY-guard gap has an explicit CI-time mitigation. However, three of the design's own named failure classes (tracker-read fail-open, marker-corruption on an existing file, cadence-counter mis-fire) currently ship with best-effort _behavior_ but no _log signature or metric_, and the fourth — analysis truncation, which the design itself flags as "the failure to avoid" — has only a Risks-section aside committing to a `stats.jsonl` coverage record rather than a first-class Data-Model/Components specification. None of these are unrecoverable or data-corrupting, and all fail toward silent no-op rather than alert-storm, so this does not rise to FAIL. But a feature whose two headline promises ("always know current phase," "periodically injected audit/ledger candidates") can silently stop delivering on either promise with zero observable signal is not yet operable as designed — CONCERNS.

## CRITICAL

- **No `[bkit-roadmap]` (or equivalent) log prefix specified for the mechanical tier's fail-open path** (tracker-read failure, empty/inconclusive result, best-effort skip). Violates the existing shipped convention (`docs/observability.md`: one prefix per subsystem, `[bkit-comply] grader unavailable, skipping` is the direct precedent for this exact fail-open shape). Add before plan: a `[bkit-roadmap]` stderr line on every fail-open branch of the mechanical hook and the fold script.
- **Analysis-truncation observability (coverage shrink) is under-specified relative to its own stated severity.** The design names this "the failure to avoid" but commits the mitigating `stats.jsonl` coverage record only in the Risks section, not the Data Model / Components sections. Promote it to a first-class output (row shape, write point, and — ideally — a `bkit check`/advisory-checklist surfacing so a shrinking coverage ratio is visible without a human reading `roadmap.md` prose).
- **Cadence counter has no verification/observability path.** Nothing detects a stalled counter, an off-by-one threshold, or a silently-failed injection. Given this is one of the issue's three explicit requirements (periodic audit/ledger review), a silent failure here defeats the feature with no way for anyone to notice. Needs at minimum a log line on injection-fire and on counter-advance, ideally folded into the existing `[bkit-analysis]` counter-bus reporting rather than a new unobserved side mechanism.

## OPTIONAL

- Define the recovery path for marker-corruption on an existing (non-bootstrap) `docs/roadmap.md` — re-bootstrap-in-place vs. abort-with-guidance vs. silent no-op should be an explicit decision, not left implicit.
- Fold the new cadence `counter` row into the existing `bkit analysis` / `[bkit-analysis]` reporting surface (already reads `.bkit/stats.jsonl` counters) rather than introducing a second, separately-audited counter mechanism.
- Consider a `bkit check` advisory (non-blocking, matching the existing Phase 3 advisory-checklist idiom) that flags a `roadmap.md` header-stamp timestamp older than N ship-cycles as a lightweight "the mechanical/analysis refresh may have stopped firing" signal — the closest thing this offline-diagnosis model has to a staleness page.

## OUT OF SCOPE

- Cross-provider mirror-regen drift is a pre-existing, already-acknowledged project-wide gap (mirrors not drift-gated); this design neither worsens nor is expected to fix it — tracked at the project level, not a #380-specific operability blocker.
- Distributed tracing / correlation IDs — not applicable; this is a single-clone CLI/agent flow, not a multi-service request path.
- #260's autonomous-actuation on-call model (what happens when an agent _acts_ on the roadmap's best-next-step unsupervised) is explicitly deferred by the design itself and is out of scope for #380's operability review.
