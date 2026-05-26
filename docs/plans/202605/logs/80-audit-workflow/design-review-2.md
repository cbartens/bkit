Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.

## Failure-Mode Enumeration

### Step 3 — Stack Detect (`bkit-audit-stack-detect`)

| What fails                                                                                                                                                    | How detected                                                                                                                                                                                                     | Blast radius                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Agent reads no manifests (empty/polyglot repo with no recognisable files)                                                                                     | `audit-stack.md` written with all fields `unknown` / empty lists; orchestrator gate only checks file-exists-non-empty — passes silently                                                                          | All 11 lenses run on a maximally-`unknown` report; every lens operates in universal-probe-only mode. Single run, single audit.                                                                                                    |
| Agent writes a structurally invalid file (missing `schemaVersion` line, missing `## Detection Coverage` section, truncated mid-write)                         | Orchestrator gate is existence+non-empty only; no schema validation. First lens to fail its `schemaVersion` assert produces a CONCERNS lens verdict; other 11 lenses may independently misparse                  | All 11 parallel lenses simultaneously. `## Missing Lenses` at Step 6 makes crash-failures visible, but schema-parse failures that yield degraded-but-non-empty output are not surfaced until Step 6 coverage manifest inspection. |
| `audit-stack.md` is non-empty but logically thin (field values filled but wrong — e.g. polyglot repo emits `language: typescript` from one stray config file) | No detection path — the schema has no confidence/coverage score per field, only `unknownFieldCount` and `filesScanned`. Lenses receive plausible-but-incorrect context and apply wrong stack heuristics silently | All 11 lenses. Output degradation is invisible until a human reads the final audit and cross-checks against the repo.                                                                                                             |
| `bkit-audit-stack-detect` subagent crashes or times out (>3600s)                                                                                              | Orchestrator artifact-existence gate fails → Failure Path                                                                                                                                                        | Single run. Correctly handled by the design.                                                                                                                                                                                      |

### Step 4 — Skill Install (`bkit-audit-install-skills`)

| What fails                                                                                                    | How detected                                                                                                                                                                                                                                         | Blast radius                                                                                                                                                                                                                                                                                                                               |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Registry unreachable / DNS failure                                                                            | `npx skills find` hangs up to 3600s step timeout; Step 4 terminates via timeout → Failure Path                                                                                                                                                       | Single run. Design intent is "skill-install is non-gating" but the design states only `skills found: 0 → SKIP branch (not Failure Path)` — a network hang reaching the 3600s ceiling IS routed to Failure Path (attributed to Step 4). The `[skills=false]` escape bypasses this but requires the human to know about the hang in advance. |
| `npx skills` binary absent from PATH (no global install)                                                      | Runtime error from Bash; agent CONCERNS verdict; audit proceeds skill-less                                                                                                                                                                           | Single run                                                                                                                                                                                                                                                                                                                                 |
| Installed skill has malformed prompt structure (e.g. breaks the lens context budget)                          | No detection — skills are injected into lens context without validation; a malformed skill payload silently inflates or corrupts lens context                                                                                                        | All 11 lenses simultaneously                                                                                                                                                                                                                                                                                                               |
| Skill install succeeds but `audit-install-skills.md` is not written (agent crash after install, before write) | Orchestrator artifact gate → Failure Path; installed skills sit in `.agents/skills/` with no provenance record                                                                                                                                       | Single run                                                                                                                                                                                                                                                                                                                                 |
| 10-skill cap exceeded (data-driven token mapping produces >10 queries)                                        | Agent caps at 10 installs; excess queries are skipped. Not a Failure Path trigger, not surfaced distinctively in `audit-install-skills.md` (design says "Not found / Skipped" section but doesn't distinguish cap-truncation from genuine not-found) | Single run; marginal quality reduction on repos with many detected tokens                                                                                                                                                                                                                                                                  |

### Step 5 — 11 Parallel Lens Agents (`bkit-audit-lens-*`)

| What fails                                                                                                                                               | How detected                                                                                                                                                                                                                                                             | Blast radius                                                                               |
| -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| One or more lens agents crash (budget exhaustion, malformed `audit-stack.md` input, tool permission failure)                                             | Post-Step-5 gate in the superseded registry block checks file-exists+non-empty+verdict-present per lens; design inherits this gate. `MISSING`/`EMPTY` → CONCERNS-equivalent; `NO_VERDICT` → FAIL-equivalent. `## Missing Lenses` at Step 6 provides further cross-check. | Subset of 11. At worst, 11/11 crash → FAIL-equivalent → Failure Path.                      |
| Lens produces valid YAML `finding` blocks but the `awk` parser in synthesiser misparses (e.g. `what` field contains a colon not at first-colon boundary) | Findings silently dropped from synthesis output; no error signal. Design specifies "split on FIRST only" — the constraint is placed on the lens output format but enforced only by convention, not by the synthesiser raising a parse error                              | All findings from affected lenses across the run.                                          |
| All 11 lenses return CONCERNS (degraded enrichment + marginal target repo)                                                                               | Worst-of-11 = CONCERNS; run continues to synthesis. Correctly handled.                                                                                                                                                                                                   | Single run; output quality reduced.                                                        |
| Context budget overflow on a large monorepo (audit-stack.md + target docs + installed skills exceed model context window for a single lens)              | Model truncates silently; lens produces partial output; finding cap at 25 means partial output still passes existence gate; no explicit budget-check gate                                                                                                                | Single lens. Detected only if the lens produces a `NO_VERDICT` artifact, otherwise silent. |

### Step 6 — Synthesise (`bkit-audit-synthesise`)

| What fails                                                                                                             | How detected                                                                                                                                                                                                                                                  | Blast radius                                                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `## Missing Lenses` section not written (agent exits after dedup but before coverage manifest write)                   | No explicit gate checks for the presence of the `## Missing Lenses` section — the design states it is "non-skippable" but the orchestrator gate is only artifact-exists+non-empty+verdict-present. A truncated artifact that omits the manifest still passes. | The silent-coverage-degradation risk the design specifically identifies as guarded is unguarded at the orchestrator gate level. |
| Cross-lens dedup `awk` parser produces an empty synthesis (all findings dropped due to parse errors)                   | `SYNTHESIS_VERDICT` = FAIL → Failure Path. Correctly handled if the verdict is written.                                                                                                                                                                       | Single run                                                                                                                      |
| Synthesis runs fine but `audit-v1-synthesis.md` is written without a verdict header (agent truncated after body write) | Orchestrator verdict-retry logic fires (one re-issue); if retry also fails → Failure Path. Correctly handled per `workflows.md` § Verdict Validation.                                                                                                         | Single run                                                                                                                      |

### Step 7 — Organise (`bkit-audit-organise`)

| What fails                                                             | How detected                                                                                                                                                                 | Blast radius                                                         |
| ---------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Coverage orphan found (finding appears in synthesis but not in matrix) | `ORGANISE_VERDICT` = FAIL → Failure Path. Correctly handled.                                                                                                                 | Single run                                                           |
| DAG cycle in `Requires` edges                                          | `ORGANISE_VERDICT` = FAIL → Failure Path. Correctly handled.                                                                                                                 | Single run                                                           |
| Workstream sub-issue spawn fails (tracker write failure)               | Per `workflows.md` § Tracker Writes Are Best-Effort — tracker writes are non-gating. `TRACKER_DEFERRED=true` committed into next commit message. Not a Failure Path trigger. | Only tracker visibility; on-disk `audit-v2-ranked.md` is unaffected. |

### Step 10 — Close Workflow (copy to `docs/audits/`)

| What fails                                                                                       | How detected                                                                                                                                                 | Blast radius                                                                           |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Copy of `audit-v2-ranked.md` to `docs/audits/{FID}-audit.md` fails (disk full, permission error) | No explicit existence-check gate after the copy at close — the design states "cp v2 → docs/audits/{FID}-audit.md" but does not specify a post-copy assertion | Single run; canonical artifact is absent but the versioned source in logs still exists |
| `git worktree remove` fails (worktree has uncommitted changes)                                   | Standard Failure Path. Worktree persists, lock may be orphaned. Lock idle threshold (1800s) governs next-run recovery.                                       | Single run; no data loss                                                               |

### Cross-cutting: `audit-stack.md` as single contract feeding 11 parallel readers

| What fails                                                                          | How detected                                                                                                                                                                          | Blast radius                                                                            |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Schema version bump in `bkit-audit-stack-detect` without corresponding lens updates | Lenses assert `schemaVersion`; mismatch → annotate context, run universal probes. CONCERNS on each affected lens. Coverage manifest at Step 6 surfaces how many lenses degraded.      | All 11 lenses simultaneously — largest blast radius of any failure mode in the pipeline |
| Missing field (field name typo in stack-detect output vs lens expectation)          | Lenses fall back to `unknown`-valued fields per design. Silent degradation — the lens cannot distinguish "field genuinely unknown" from "field name mismatched". No structured error. | All lenses that reference the misnamed field                                            |

### Cross-cutting: Reproducibility drift from external skills

| What fails                                                                        | How detected                                                                                                                                              | Blast radius                                            |
| --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Same commit audited twice with different registry state yields different findings | `audit-install-skills.md` captures installed identities + versions; a human comparing two audit runs can explain the divergence. No automated diff-alert. | Single-run audit quality; historical comparability only |
| Community skill payload introduces incorrect or adversarial probe logic           | No validation of skill content beyond the 10-skill cap; skill payloads are injected into Opus context verbatim                                            | All lenses that loaded the affected skill               |

---

## Observability Coverage

The project's observability infrastructure is CLI stdout/stderr only (`docs/observability.md` § Scope: "bkit has no server-side telemetry pipeline, log drains, or tracing infrastructure"). All observability for `/bkit-audit` is therefore on-disk artifacts + tracker comments. The `[{Context}]` bracketed log prefix convention applies to `bkit install` CLI, not to workflow agent logs.

Per failure mode:

| Failure mode                                                                | Structured log at failure point                                                                                                                                                   | Metric/counter | Trace/correlation id         | Assessment                                                                                                                                                           |
| --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Stack-detect produces all-`unknown` output                                  | `## Detection Coverage` block in `audit-stack.md` (`unknownFieldCount`, `filesScanned`) — present per schema. No alert threshold.                                                 | None           | FID threads all artifacts    | ACCEPTABLE — degradation visible in artifact; no automated alert needed for a human-invoked ad-hoc workflow                                                          |
| Stack-detect writes structurally invalid file                               | No structured error log from the agent; orchestrator existence+non-empty gate does not log WHY it failed; Failure Path posts "Workflow Failure" tracker comment with step + error | None           | FID via Failure Path comment | CONCERN — the Failure Path comment includes "last 20 lines of stderr" which may or may not contain the structural issue; no structured parse-failure log             |
| Stack-detect produces plausible-but-incorrect fields (silent wrong context) | No detection path at all                                                                                                                                                          | None           | N/A                          | CRITICAL — silent wrong-context feeds all 11 lenses; the only observability is the human reading the final audit and noticing implausible findings                   |
| Network hang at skill-install (reaching 3600s timeout)                      | Timeout → Failure Path → tracker comment with "last 20 lines of stderr". `[skills=false]` on re-run bypasses but requires human awareness of the hang cause                       | None           | FID via Failure Path         | CONCERN — 3600s is a very long wait before the Failure Path fires; no intermediate progress log or partial-completion signal is specified                            |
| Skill install cap-truncation vs genuine not-found                           | `audit-install-skills.md` `## Not Found / Skipped` section — but design does not distinguish cap-truncation from not-found                                                        | None           | FID via artifact             | MINOR — cosmetic but can mislead                                                                                                                                     |
| Lens agent crash                                                            | Post-Step-5 existence+non-empty gate → Failure Path comment                                                                                                                       | None           | FID via gate                 | ACCEPTABLE                                                                                                                                                           |
| `finding` block parse failure in synthesiser                                | Silent finding loss — no log, no counter                                                                                                                                          | None           | N/A                          | CRITICAL — findings silently dropped from output; the final audit has fewer findings than the lenses produced and neither the human nor any system signal flags this |
| `## Missing Lenses` section absent from synthesis                           | No gate checks for section presence                                                                                                                                               | None           | N/A                          | CRITICAL — the primary silent-coverage-degradation guard has no gate                                                                                                 |
| Context budget overflow on large monorepo (lens truncation)                 | Only detectable if lens produces `NO_VERDICT`; otherwise silent                                                                                                                   | None           | N/A                          | CONCERN — no proactive observability; finding-count reduction visible only if the human compares lens outputs to synthesis                                           |
| Schema version mismatch (stack-detect bumped, lenses not updated)           | Each lens annotates its own context (per design); `## Missing Lenses` surfaces lens-level CONCERNS. No schema-mismatch counter across 11 lenses.                                  | None           | FID                          | CONCERN — aggregate impact not surfaced; each lens independently annotates locally                                                                                   |
| Canonical artifact copy fails at close                                      | No post-copy assertion specified                                                                                                                                                  | None           | N/A                          | CONCERN — human discovers missing `docs/audits/{FID}-audit.md` only when they look for it                                                                            |

---

## On-Call Ergonomics

This is an ad-hoc, human-invoked, read-only audit workflow with no production service impact. "On-call" in this context means the human invoker discovering a stalled or silent-failure run and understanding what happened.

### Recovery action assessment per anticipated failure state

**Stalled at Step 4 (skill-install network hang):**

- Current detection: none until 3600s timeout fires.
- Recovery action: `[skills=false]` re-invoke (escape hatch exists; not automatic).
- Ergonomics gap: the human has no signal that Step 4 is hanging (vs. legitimately slow). A 3600s wait before any feedback is unusable in practice. No intermediate "still installing skill N of M" progress log specified.
- Verdict: POOR — human must infer the hang from context, then choose the right escape hatch. Not obvious from the Failure Path comment alone.

**Failure Path comment at Step 4 (post-timeout):**

- Runbook obviousness: "last 20 lines of stderr" from `npx skills` would typically contain a network error or timeout message. Actionable: human adds `[skills=false]` on re-invoke.
- Recovery: manual re-invoke with `[skills=false]`. Idempotent. GOOD.

**Silent audit quality degradation (all-`unknown` stack or wrong-context stack):**

- Current detection: human reads `## Detection Coverage` in `audit-stack.md` and separately notices implausible findings.
- Runbook: none specified in the design. No "check `audit-stack.md` for quality" step in the Close gate.
- Recovery: re-invoke after manually inspecting / correcting the stack detection context. Non-obvious.
- Verdict: POOR — the human must know to check `audit-stack.md` independently; this is not surfaced in any gate or summary output.

**`## Missing Lenses` absent from synthesis:**

- Ergonomics: human reading the final audit has no indication the coverage manifest was not written. A truncated synthesis that passed the existence gate silently omits the coverage manifest.
- Recovery: human inspects `audit-v1-synthesis.md` directly.
- Verdict: POOR — the design's strongest observability guard against silent coverage degradation is not itself guarded.

**Finding-count drop between lens outputs and synthesis:**

- No signal. Human would need to manually count findings in each `audit-lens-{slug}.md` and compare to synthesis.
- Verdict: UNOBSERVABLE without manual inspection.

**Schema-version mismatch after a stack-detect update:**

- Each lens writes its own CONCERNS annotation locally. The summary in `audit-summary.md` will reflect degraded lens verdicts. Detectable from the summary.
- Recovery: update lenses to new schema version. Tracked naturally via CONCERNS findings in the final artifact.
- Verdict: ACCEPTABLE for the ad-hoc nature of this workflow.

**Concurrency / re-audit FID suffix:**

- Lock + FID suffix (`-audit-{YYYYMMDD-HHmm}`) adequately isolates concurrent re-audits. Recovery is deterministic via standard lock-staleness logic.
- Verdict: GOOD.

---

## Operational Dependencies

New on-call burden introduced by this design:

1. **No new alerts or dashboards.** The workflow is ad-hoc and human-invoked; there is no scheduled run, no CI integration, and no metric emission. Zero new alerting infrastructure required.

2. **New artifacts require human literacy.** Operators who invoke `/bkit-audit` must understand:
   - `audit-stack.md` quality indicators (`unknownFieldCount`, `filesScanned`) and their implications for finding trustworthiness.
   - `audit-install-skills.md` provenance log — needed to explain audit-to-audit divergence.
   - `## Missing Lenses` in synthesis — the coverage health indicator.
   - That Step 4 can hang for up to 3600s and that `[skills=false]` is the escape.

3. **`[skills=false]` escape hatch knowledge.** This is a non-obvious escape: the design documents it in the design doc but there is no mention of it in the workflow's failure-path comment or gate checklists. An operator who has never read the design doc would not know to use it when Step 4 hangs.

4. **`docs/audits/` directory maintenance.** Each run appends a new `{FID}-audit.md`. No pruning or archival strategy is specified; this is low-urgency but grows unbounded over time.

5. **Legacy `bkit-utility-audit-*` prompts remain live.** Four deprecated prompts co-exist with the new workflow. Operators must know which to use; the deprecation header guides but does not hard-block.

6. **`audit-install-skills.md` as reproducibility forensic.** When two audit runs produce different findings on the same commit, the operator is expected to compare `audit-install-skills.md` files across runs. No tooling assists this comparison.

---

## Verdict Reasoning

The design is **operable in its core execution path** — the 10-step pipeline correctly follows the `bkit-design` ceremony (FID / lock / status.json / gate / comment-per-step / Failure Path), enrichment degradation correctly lowers to CONCERNS rather than triggering Failure Path, and the `[skills=false]` offline escape is well-specified.

However, three operability gaps rise to CRITICAL:

1. **Silent wrong-context propagation from stack-detect.** The design correctly handles thin/unknown output (CONCERNS + degrade gracefully) but has no observability path for plausible-but-incorrect output. A stack-detect agent that confidently misidentifies the repo's stack feeds all 11 lenses incorrect enrichment with no signal. The `## Detection Coverage` section only reports `unknownFieldCount`, not confidence in the non-unknown values.

2. **`finding` block parse failures in the synthesiser are silent.** The design specifies `awk` parsing and constrains the finding format, but a parse failure drops findings silently with no log, no counter, and no alert. The final audit may be materially incomplete without any indication. This is the worst observability gap in the pipeline.

3. **`## Missing Lenses` coverage manifest has no gate.** The design identifies this as the "non-skippable surface" for detecting silent coverage degradation, but the orchestrator gate at Step 6 is existence+non-empty+verdict-present — it does not assert that the `## Missing Lenses` section exists in the synthesis artifact. A truncated synthesis passes the gate silently.

These gaps are addressable (see CRITICAL section) and do not require structural redesign. The overall pipeline shape is sound.

---

## CRITICAL

**C-1: No observability for plausible-but-incorrect stack-detect output.**

The `## Detection Coverage` block records `unknownFieldCount` but has no per-field or aggregate confidence score. A stack-detect run that fills all fields based on ambiguous evidence (e.g. a TypeScript config in a primarily Go repo) has `unknownFieldCount: 0` and looks fully populated. All 11 lenses receive and act on incorrect enrichment silently.

Required: either (a) add a `confidence: low|medium|high` field to `## Detection Coverage` with a rule that `confidence: low` forces stack-detect verdict to CONCERNS and the orchestrator surfaces this prominently in the Step 3 tracker comment, or (b) add an explicit "detection confidence" check to the Close gate or Step 8 Summary that advises the human to review `audit-stack.md` before trusting the audit.

**C-2: `finding` block parse failures in `bkit-audit-synthesise` must not be silent.**

The design specifies `awk` state-machine parsing and format constraints, but no error-handling contract for malformed blocks is specified. A finding whose `what` field accidentally contains a triple-backtick or whose line exceeds 200 chars is silently dropped.

Required: the synthesiser prompt must specify that parse failures are written to an explicit `## Parse Errors` section in `audit-v1-synthesis.md` with the raw block and the parse failure reason. The orchestrator gate at Step 6 must assert that this section is either absent (no errors) or CONCERNS-flagged.

**C-3: `## Missing Lenses` section must be gated at the orchestrator level.**

The design identifies the coverage manifest as non-skippable but provides no gate enforcement. The Step 6 gate checks artifact-exists+non-empty+verdict-present only.

Required: add a gate item at Step 6: "Artifact `audit-v1-synthesis.md` contains `## Missing Lenses` section (grep-check)." Absence → re-issue synthesiser with a tightening prompt, or Failure Path on second absence.

---

## OPTIONAL

**O-1: `[skills=false]` escape hatch should appear in the Failure Path comment.**

When Step 4 times out, the Failure Path comment contains step number + last 20 lines of stderr. The operator's recovery action (`[skills=false]` on re-invoke) is not discoverable from the comment alone. Recommend adding a one-line hint to the Step 4 Failure Path comment body: "Re-invoke with `[skills=false]` to bypass skill install."

**O-2: Step 4 progress logging.**

The 3600s timeout is a backstop but no intermediate progress is emitted. Recommend the skill-install agent log each `npx skills find` query attempt and its result (`hit / miss / error`) as it runs, so an operator watching the session can detect a hang before the 3600s ceiling. This is a prompt-level recommendation.

**O-3: Distinguish cap-truncation from genuine not-found in `audit-install-skills.md`.**

The `## Not Found / Skipped` section currently conflates three distinct outcomes: `skills=false` escape, genuine registry miss, and cap-truncation. Recommend splitting into `## Not Found`, `## Cap Truncated` (tokens beyond the 10-skill limit), and `## Skipped (offline)` for operator clarity.

**O-4: Post-copy assertion at Step 10 (Close Workflow).**

The design specifies `cp v2 → docs/audits/{FID}-audit.md` but does not assert the canonical artifact exists and is non-empty after the copy. Add a gate item: "Artifact `docs/audits/{FID}-audit.md` written (non-empty)."

**O-5: `audit-stack.md` quality summary in Step 8 (Summary) output.**

The 500-token Summary subagent currently targets Linear-bound exec summary + top-3 CRITICAL + class totals + lens coverage. Recommend adding one line to the summary template: "Stack detection: `{language}/{packageManager}` ({unknownFieldCount} unknown fields, {filesScanned} files scanned)." This surfaces stack-detection quality to the human in the tracker comment without requiring a separate `audit-stack.md` read.

**O-6: Installed-skills divergence detection across re-audits.**

When a re-audit (`-audit-{YYYYMMDD-HHmm}` FID suffix) produces different findings than the prior run on the same commit, the operator is expected to manually compare `audit-install-skills.md` files. A note in the Step 10 Close Workflow instructing the orchestrator to compare the current `audit-install-skills.md` against the prior run's (if a prior FID exists) and emit a tracker comment if skill identities differ would reduce this investigation burden.

---

## OUT OF SCOPE

**Phase 3 (WebSearch augmentation):** explicitly deferred by the design brief; observability considerations for a `--with-websearch` flag (rate-limit signals, stale-result handling) are not in scope for v1.

**Community skill trust / adversarial content validation:** the design acknowledges the skill-provenance risk and defers the source-reputation threshold question. Content-level validation of installed skill payloads is a future concern.

**Cross-audit aggregation / trending:** no mechanism for comparing finding severity trends across multiple `/bkit-audit` runs on the same repo. Deferred per brief.

**`docs/audits/` pruning / archival strategy:** low urgency; bounded by the number of audit runs a team performs. Not a v1 concern.
