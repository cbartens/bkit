Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.

## Failure-Mode Enumeration

Per component / flow: what fails, how on-call detects it, blast radius.

<!-- prettier-ignore -->
| # | Component / flow | What fails | How detected | Blast radius |
| --- | --- | --- | --- | --- |
| FM1 | Contract deriver | md reworded / a step heading or `{BKIT}` literal moved after a close → wrong contract | `sourceCanonicalDrift` + `orphanSteps` in the report; `sourceSha` diff on a re-run. No metric | every run of that workflow — false `HOLEY` or false `CLEAN` |
| FM2 | Contract deriver | workflow md unreadable / absent at the derived path (consumer layout) | close / start raises unless swallowed (see FM9 / FM10) | every close / start in that repo |
| FM3 | Journal seam (entry) | run-resolve picks the wrong run | none automatic; only by reading a run's log and seeing foreign calls | two runs' journals (phantom + missing calls) |
| FM4 | Journal seam (entry) | >1 `IN_PROGRESS` run and no `--file` / `--fid` (≈107 of 358 `{BKIT}` calls carry neither) → skip | none — the skip is silent; it surfaces only as a false evidence hole | that run → false `HOLEY` warning |
| FM5 | Journal seam (entry) | journal write fails (read-only tree, full disk) → swallowed | one stderr line — **no documented prefix / grep pattern** | that run's evidence detection silently degrades to steps-only |
| FM6 | Journal seam (entry) | an uncaught throw escapes the swallow | user report / CI red only — no metric | every command in every consumer repo (CLI-wide) |
| FM7 | Journal seam (exit) | friction row refused by `validate` (it requires non-empty `by.step`) when the step is unknowable → swallowed | none | friction for step-less calls (`ledgers append`, `branches land`, `repo …`, `status row`) silently lost |
| FM8 | Journal seam (exit) | friction row written for a routine-but-undeclared exit | the friction ledger / harvest report | detector credibility (mute risk) |
| FM9 | Close integration | `check(...)` or the `completeness` row append throws inside `closeWorkflow` | close fails / no `workflow-done` / CI never dispatched | every phase close, every consumer repo |
| FM10 | Start / resume | the on-the-fly verdict computation throws in `workflows start` | start fails | every start |
| FM11 | Checker | mis-classification (evidence vs step hole; md conditionality) | the verdict itself | that run's warning (false ±) |
| FM12 | Readers | a `status.jsonl` reader not covered by `MARK_ROWS` / the audit mis-reads the new rows | none | silent stats / harvest corruption |
| FM13 | Volume | ~100 extra rows/run in the SoT `status.jsonl` | none | repo hygiene, git-diff noise, harvest scan cost |
| FM14 | Journal-broken | a journaling engine whose journal silently fails looks identical to a pre-journal run (`preJournal: true`) | none | evidence-hole detection silently dead for all runs |
| FM15 | CI advisory sweep | workflow inference / check error under `\|\| true` | none | corpus-wide detection surface silently dead |

Verified against source: the seam sits in `runCommand` (`commands/lib.ts`), the single dispatch point every `bkit <noun> <verb>` passes through — the workflow prose uses `"{BKIT}" noun verb` only (no classic verb, no `"$BKIT"`), so coverage holds. `appendLedgerRows` (`commands/workflow/ledgers.ts:1174`) mints `ts`, throws `EXIT_ROW_REFUSED` on a bad row and never dedups, so the friction dedup must be done by the seam; `validate` (`ledgers/telemetry.ts:1534`) hard-requires `by.step`; `fold` (`ledgers/status.ts:82`) ignores unknown row types, so the two new rows are additive to old readers.

## Observability Coverage

bkit ships no metric / trace pipeline — `docs/observability.md` § Scope: "No server-side telemetry pipeline, log drains, or tracing. Observability limited to CLI stdout / stderr". So the only surfaces are stderr / stdout, `status.jsonl` rows, and the CI step; "metric" and "trace" are absent by architecture, not by omission.

<!-- prettier-ignore -->
| # | Logs at failure point | Metric / counter | Trace / correlation | Design says |
| --- | --- | --- | --- | --- |
| FM1 | report lines (drift / orphan / holes) | none | `sourceSha` on the row | PRESENT — `sourceSha` + drift/orphan fields are the design's own mitigation |
| FM2 | none specific | none | none | MISSING — inherits FM9 / FM10 |
| FM3 | none | none | none | MISSING — misattribution is only visible by inspection |
| FM4 | none | none | none | MISSING — a silent skip manifests only as a false evidence hole |
| FM5 | one stderr line per swallow | none | none | PARTIAL — the line exists but carries no `[{Context}]` prefix / grep key; `docs/observability.md` makes the brackets load-bearing |
| FM6 | none | none | none | MISSING — test-only mitigation; no runtime signal |
| FM7 | none | none | none | MISSING — the refusal is swallowed; no `[bkit-telemetry]`-style line specified |
| FM8 | the row itself | none | `by.workflow` / `by.step` only (no run pointer) | PRESENT — the row is the record |
| FM9 | none | none | none | MISSING — must mirror `appendStats`'s `[bkit-telemetry] … not written` pattern (`workflows.ts:1031`) |
| FM10 | none | none | none | MISSING — same shape as FM9 |
| FM11 | per-hole evidence (step + missing calls) in the row | none | `sourceSha` | PRESENT — the 3am-diagnosability requirement is met |
| FM12 | none | none | none | MISSING — no assertion that unknown row types are inert in every reader |
| FM13 | none | none | none | MISSING — no size / volume signal |
| FM14 | none | none | none | MISSING — the `preJournal` carve-out masks a broken journal; no heartbeat mechanism, no alert |
| FM15 | none | none | none | MISSING — `\|\| true` swallows a broken check |

Two of these (FM14, and FM5's missing prefix) are CRITICAL per the "missing observability for a CRITICAL failure mode" rule: the feature's primary signal can be dead with nothing an on-call could alert on.

## On-Call Ergonomics

Per anticipated signal (no surface pages; the check is fail-open by decision `384-tier3-promotion`).

1. **CI advisory report** (`Check Status Holes`, `.github/workflows/bkit-ci.yml:510`, repointed at the generalised check). Runbook obviousness: the report names per-run holes and the class (evidence / step / unexercised / unexpected) — readable without context-chasing. Recovery: human triage; nothing automatic. Noise: `|| true` + exit-0 contract, so it can never fail the static lane; the hole-class split keeps the content down. Gap: a check that errors out is swallowed by `|| true` (FM15) — add a liveness assertion (the sweep must print a summary line).
2. **Start / resume "previous run was holey" warning** (one line, Q14). Runbook obviousness: it says the previous run was holey but not _what_ was holey or _which_ run → context-chasing (`bkit completeness check --file=…`). Recovery: none by design (never interrupts, never prompts — Q17). Noise: scoped to evidence + step holes, so it should survive a release. Improve: name the run (workflow, run number, close time) and the reading command or the hole count.
3. **Seam swallow line** (FM5 / FM7). Runbook obviousness: **no documented prefix or grep pattern**, so on-call cannot build an alert on the only available signal, and `docs/observability.md` (the canonical registry of `[{Context}]` prefixes and their grep keys) is not in the design's doc-edit list. Recovery: none — the command proceeds. This is the weakest link for a broken journal.
4. **`completeness` row at close.** Runbook: carries per-hole evidence + `sourceSha` → a good 3am artefact, and `sourceSha` makes a prose-vs-verdict disagreement diffable. Gap: no stated join for the friction row (FM8), so friction cannot be correlated back to the run.
5. **Friction rows** in `.bkit/friction.jsonl`. Runbook: drained by `pnpm harvest`; `category: "tool-failure"`; no alert, no counter. Recovery: human triage. The engine-writes-as-the-active-workflow choice (no `KIND_WRITERS` change) is verified: `friction.orchestrators = {design, plan, build, debug, ship}` (`ledgers/telemetry.ts:415`) and `writerProblem` accepts `by.workflow` when `by.subagent` is absent.

## Operational Dependencies

New dashboards / alerts / runbooks the design introduces — none paging, but each needs a documented grep key or runbook line.

- **Docs to sync** (the Components table lists only `.bkit/workflows.md` § `status.jsonl`):
  - `docs/observability.md` — **not listed**; required for the seam's stderr prefixes and their canonical grep patterns (the only signal for a broken journal / refused friction).
  - `docs/testing.md` § Tier-3 — **not listed**; the generalised detector contract and the fixture corpus belong here (the design cites it as prior art but schedules no edit).
  - `.bkit/jsonl.md` — a sentence that the engine writes friction _as_ the active workflow is in `Decisions` but not in the Components table.
- **Reader invariant:** `MARK_ROWS` (`run-facts.ts:354`) gains `engine-call` + `completeness`; the design's open Q8 adds a targeted audit of `stepsBlock`, `ciList` and the harvest `afterEnd` / `lastActivity` / `byRun` windows. Recommend one explicit "an unknown `status.jsonl` row type is inert" test rather than an enumerated reader list (a missed reader is silent corruption — the design's own risk).
- **No kill switch** (settled Q7: always on). Consequence: incident recovery for a bad seam is pinning / rolling back `@cbartens/bkit` and holding `bkit upgrade` (`docs/deployments.md` § Consumer rollback path), not a runtime toggle. The design should record this as an accepted operational dependency.
- **Harvest:** already drains every `.bkit/friction.jsonl` row; must tolerate the new `status.jsonl` row types via the `run-facts.ts` fix. The bkit repo sets `.bkit/friction.jsonl merge=union` locally (`.gitattributes:45`) — union may resurrect drained rows, an accepted trade noted there.
- **CI:** repoint `pnpm bkit:audit:status` (`package.json:94`, `tsx …/status-holes.ts docs/plans/*/logs/*/status.jsonl`) at the generalised check; keep exit-0. The corpus sweep passes files without `--workflow`, so the check must infer the workflow per run from the rows — otherwise the sweep silently no-ops under `|| true`.
- **On-call burden added:** one advisory CI output, one start/resume warning line, one seam stderr family, two new `status.jsonl` row types. None pages; all need a documented grep key.

## Verdict Reasoning

**CONCERNS.** The mechanism is operable in shape: every part reuses an existing idiom, the two new row types are additive (`fold` skips unknown types), the `completeness` row carries per-hole evidence and a `sourceSha` for 3am diagnosis, and the advisory / fail-open posture is unchanged. Failure modes are mostly observable through the `completeness` row, the report, and `sourceSha`.

Three gaps are load-bearing and must be closed before build, because each lets a failure of the _feature itself_ go undetected while damaging the product or defeating the feature's purpose:

1. the advisory check runs in-process inside `closeWorkflow` (and `workflows start`) with no specified fail-open wrapper — a deriver / checker bug or a missing md would fail every phase close in every consumer repo;
2. a silently broken journal is indistinguishable from a pre-journal run, so the primary signal (evidence holes) can be dead with nothing to alert on;
3. the friction row's `by.step` is required by `validate` but unspecified in the step-unknowable degrade path, so step-less friction is silently dropped.

Each is additive to fix (a try/catch + a logged line, a heartbeat signal, a `by.step` value, and the observability-doc entries), which is why this is CONCERNS rather than FAIL. But the design should not proceed to build until the three CRITICAL items are pinned and tested: success criterion 4 ("never fail a workflow") is currently an intent without a named mechanism on the two in-process call sites.

Concrete evidence reviewed: `commands/lib.ts` `runCommand` (the single dispatch point), `checks/status-holes.ts` (the detector being generalised), `commands/workflow/ledgers.ts:1174` `appendLedgerRows` (throws, mints `ts`, no dedup), `ledgers/telemetry.ts:1534` `validate` (`by.step` required) and `:415` `KIND_WRITERS.friction`, `ledgers/status.ts:82` `fold`, `commands/workflow/run-facts.ts:354` `MARK_ROWS`, `commands/workflow/workflows.ts:1114` `closeWorkflow` + `:1025` `appendStats` (the fail-open idiom to copy), `.github/workflows/bkit-ci.yml:510`, `docs/observability.md` § Scope + log-format rules, `docs/testing.md:557` § Tier-3.

## CRITICAL

Operability gaps the design must address before proceeding.

1. **Close / start path is not provably fail-open (FM9 / FM10).** `closeWorkflow` (`workflows.ts:1114`) calls `check(...)` in-process and appends the `completeness` row before `workflow-done`; the design specifies the fail-safe contract for the _journal seam_ but not for this call. A deriver / checker bug or an unreadable workflow md throws → close fails → the run never closes, CI is never dispatched, the feature is marked `close-failed`. `workflows start`'s on-the-fly verdict is the same shape. Required: wrap both in the `appendStats` idiom (`workflows.ts:1025` — try/catch → `[bkit-telemetry]`-style log → degrade to "no completeness row" / "no warning"), and add a test that forces the check to throw and asserts the close still writes `workflow-done` and returns its normal exit code. Success criterion 4 already demands this; the design must name the mechanism.
2. **A broken journal has no actionable signal (FM14 / FM5).** The pre-journal carve-out labels any zero-`engine-call` run `preJournal: true` with a steps-only, non-holey verdict — so a journaling engine whose journal silently fails looks exactly like a historical pre-journal run: evidence-hole detection is dead and nothing alarms. The design's "heartbeat invariant" is asserted but not mechanised, and the seam's swallow line carries no `[{Context}]` prefix or grep pattern (`docs/observability.md` makes the brackets load-bearing and the design's doc-edit list omits observability.md). Required: a positive signal that the journal is live for a journaling engine (e.g. a `completeness` row field, a stderr line, or a stats counter when a run closes with zero `engine-call` rows), plus the seam's canonical prefix and grep patterns in `docs/observability.md`.
3. **Step-less friction is silently refused (FM7).** `validate()` requires `by.step` to be a non-empty string (`ledgers/telemetry.ts:1534`). The design degrades only the _key_ for calls without `--step=` (`ledgers append`, `branches land`, `repo …`, `status row`) and never states what `by.step` holds; an omitted / empty value makes `appendLedgerRows` throw `EXIT_ROW_REFUSED`, which the seam swallows, so the friction the feature exists to surface is dropped with no signal. Required: specify the `by.step` value for the degrade path (e.g. the active run's workflow or a literal) and log a `[bkit-…]` line when a friction row is refused.

## OPTIONAL

Operability improvements worth incorporating but not blockers.

- The start / resume warning should name the previous run (workflow, run number, close time) and the reading command (`bkit completeness check --file=…`) or the hole count, so on-call is not left context-chasing.
- Give the friction row a run join (`run.parentSha`, or a pointer to the run's `status.jsonl`): friction rows carry `by` only, so a `tool-failure` row cannot be correlated to the run / CI that produced it.
- FM4: log (stderr) each skipped-attribution call, so a false evidence hole caused by a multi-run ambiguity can be explained rather than suspected.
- Exclude the self-journaled `completeness` call from the verdict's `unexpected` list (not just from the required set), or every check reports its own call as unexpected.
- Reader surgery: add one explicit test asserting an unknown `status.jsonl` row type is inert in every reader (`stepsBlock`, `ciList`, `counters`, `summary`, `runtime`, harvest `afterEnd` / `lastActivity` / `byRun`), rather than enumerating readers by hand.
- FM15: have the CI advisory step assert it printed a sweep summary (a liveness check), so a check that errors under `|| true` is visible rather than silently no-op.
- FM2 / FM12: add the seam's stderr lines and the generalised detector to `docs/observability.md` and `docs/testing.md` § Tier-3 in the same change (the Components table lists neither).
- Add the `scope` field to the friction row example (`.bkit/jsonl.md` lists it on friction rows) for doc conformance.
- FM13: note the ~100 rows/run volume against the harvest scan and consider a documented size expectation.

## OUT OF SCOPE

Operability concerns outside the current design scope — defer to future work.

- Alert-threshold tuning / paging policy: the check is fail-open by decision `384-tier3-promotion` and never pages; threshold design belongs to a future promotion to a blocking gate.
- A server-side metric / trace pipeline: bkit ships none (`docs/observability.md` § Scope); the design correctly stays within stdout / stderr + rows.
- Correctness / buildability details of the deriver and seam (parser edge cases, the "22 distinct calls" count in the Reuse table, `fold`'s identity for `engine-call` rows, close's `events` snapshot timing): that is the buildability lens, not operability.
- A runtime kill switch: settled off by Q7; recorded here as an accepted operational dependency, not a gap.
