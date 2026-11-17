Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.

## Failure-Mode Enumeration

<!-- prettier-ignore -->
| Flow | Failure and current detection | Blast radius |
| --- | --- | --- |
| Install, upgrade and removal | A write fails between renderer outputs and the install state update. Another writer changes shared JSON after preflight. The draft validates inputs and checks drift, but leaves partial-operation recovery unspecified. | One checkout, including co-installed hosts if ownership is applied incorrectly. |
| Entry and readiness | A missing, stale or untrusted extension, or an incorrectly selected skill, prevents required guards from running. The draft calls for preflight and a mixed-host fixture. | One session or worktree. A render defect can affect every install of the release. |
| Model and tool resolution | Invalid credentials, unsupported reasoning, provider outage or tracker tool exposure mismatch blocks dispatch or fallback. The draft detects configuration and effective setting mismatch and requires live checks. | One run, or all runs using the affected provider or tracker. |
| Dispatch and collection | Spawn, timeout, turn limit, malformed or oversized events, a missing terminal event and nonzero exit affect child results. The draft bounds output and deadlines and enumerates terminal outcomes. A stale artifact can survive an incomplete attempt. | One dispatch, or the whole current phase if a required artifact cannot be trusted. |
| Interruption and resume | Cancellation normally reaps child groups. A coordinator killed before that handler runs can leave children writing to a resumed worktree. Durable completion rows distinguish finished steps but do not establish that the old writer has stopped. | One worktree and run, plus any tracker or remote operation still in flight. |
| Provider or MCP retry | A timeout can hide a completed external write. Existing workflow reconciliation applies before retry. Tool errors and expected policy denials must be distinguishable from a degraded dependency. | One operation, with a shared outage affecting users of that endpoint. |

## Observability Coverage

<!-- prettier-ignore -->
| Flow | Logs, frequency and correlation |
| --- | --- |
| Install, upgrade and removal | Reuse the existing prefixed CLI finding and exit status. The failed module, owned destination and repair command should identify a partial operation. No remote trace is needed for local writes. |
| Entry and readiness | The draft specifies a readiness result but gives no durable or operator-visible diagnostic when no workflow row exists yet. A blocked startup needs one redacted structured result on the launcher or extension error path. Count failures by stable reason rather than counting advisory messages. |
| Model and tool resolution | The draft distinguishes effective and requested settings, but gives no diagnostic contract for auth, unsupported combination, outage or tool exposure mismatch. Use the parent dispatch identity to correlate the local error with child and provider results. |
| Dispatch and collection | The proposed request identity includes workflow, step, attempt and dispatch. The draft does not specify a structured output prefix, when terminal results are persisted, or how to count one outcome per child without counting every streamed event. |
| Interruption and resume | The existing workflow status gives a durable step boundary. It has no proposed marker that distinguishes proven cleanup from unknown cleanup after abrupt coordinator exit. Correlate the interruption and any recovery refusal with the original dispatch. |
| Provider or MCP retry | Reuse the existing transport fallback and workflow failure records. Correlate with the dispatch or workflow operation and include a safe upstream request ID only when returned. A local correlation ID fits this repository's CLI-only observability model. |

Use the existing CLI and workflow evidence conventions in `docs/observability.md`. Failure diagnostics belong on stderr or Pi's visible result channel. A bounded outcome summary gives the workflow a count by failure reason. A diagnostic write failure must be distinguishable from a failed safeguard or an unproven cleanup.

## On-Call Ergonomics

No new paging service is needed. An install or readiness failure should report one actionable message and exit or return a blocked result. Give the operator the affected checkout, Pi version, owning configuration surface and one repair or check to run. For a partial install, rerun the same operation through bkit after addressing the write failure and verify with `bkit check`. For an unsupported provider, model or reasoning setting, correct the setting or select a verified combination.

During dispatch, show state changes and one terminal summary. Treat an ordinary operator cancellation as an informational outcome. When cleanup cannot be proved, give the operator the affected worktree and dispatch ID, state that another writer may still be active, and explain how to verify that the old dispatch is stopped before resuming. An uncertain tracker or remote write follows the existing workflow reconciliation path.

## Operational Dependencies

Extend the existing provider documentation with supported Pi versions and combinations, readiness diagnostics, partial lifecycle recovery and interrupted-dispatch recovery. Add the Pi diagnostic prefix and stable outcome categories to `docs/observability.md`. The existing workflow status and CLI diagnostics cover operator support without a new dashboard, page or log service.

## Verdict Reasoning

The existing CLI, workflow evidence and recovery surfaces can support Pi. The design needs explicit rules for artifact freshness and writer lifetime before a failed or abandoned dispatch can safely resume. Stable diagnostic outcomes and a repair path make those rules operable. The accepted provider configurability and full workflow scope are intact.

## CRITICAL

1. **Reconcile abandoned writers before reusing a worktree.** Flow 4 handles cancellation while the coordinator is alive. Flow 5 revalidates the next runtime but has no rule for a child or shell grandchild surviving coordinator death. A resumed Pi or non-Pi session can then modify the same worktree or act on the same remote while the prior worker runs. Define how dispatch ownership and cleanup are established across an abrupt stop. Admit a new writer only after cleanup is proved, or stop with an actionable recovery result. Exercise coordinator termination and cross-host resume in the compatibility check. Emit a single correlated cleanup outcome with a countable reason when cleanup is uncertain.
2. **Bind evidence to the successful dispatch.** A named path and a syntactically valid verdict cannot establish who produced it. For example, a cancelled child leaves a valid report, then a replacement exits cleanly with a terminal message but produces no report. The replacement could advance an artifact gate on the older report. Bind successful output to the current run, step, attempt, agent and dispatch. Specify how retries preserve partial evidence and how a header-only repair retains the intended body provenance. Reject old, missing or unexpected artifacts before calling the existing step gate. Record a correlated mismatch outcome and test the stale-path scenario.
3. **Specify visible failure evidence.** The draft names outcome classes and redaction, but leaves the failure sink and counters undefined. Require one bounded structured diagnostic per readiness refusal and one terminal outcome per requested child, including children prevented from starting by cancellation. Use an owning `[bkit-…]` prefix, stable reason, attempt or startup ID, dispatch ID when available, and requested/effective versions or settings where applicable. Keep event output and credentials out of diagnostic payloads. Define which existing evidence surface records the terminal summary after startup and how a failed recording is surfaced. Cover readiness, policy mismatch, invalid evidence and uncertain cleanup in Risks.

## OPTIONAL

1. **Document partial lifecycle repair.** The current installer writes directly and can stop after earlier writes. Specify how a failed Pi render remains detectable when the install state has not changed, and what repeat install, check and scoped uninstall do for that footprint. Include one interruption fixture with an unrelated JSON key and a co-installed host.
2. **Name the reason when the provider cannot start.** Give operators distinct outcomes for credential absence, capability mismatch, transport timeout and upstream refusal. Report the input setting that needs attention without printing its credential. A single summary per dispatch avoids alerting on each transient provider retry.
3. **Label the risk list accurately.** The bullets in `Risks & Open Questions` currently state risks or verification requirements. If the revision adds an actual owner question, include lettered options, a lettered recommendation and a default if unanswered.

## OUT OF SCOPE

Centralized telemetry, cross-provider cost comparisons and a new cloud dispatch lane.
