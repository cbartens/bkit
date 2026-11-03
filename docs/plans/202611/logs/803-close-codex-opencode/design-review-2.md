Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.

## Failure-Mode Enumeration

The blast radius is one tool invocation or one installed checkout. A shared parser defect can affect every installation using the release, but there is no deployed regional or tenant service.

<!-- prettier-ignore -->
| Flow | Failure mode and severity | Detection in the draft | Blast radius and recovery |
| --- | --- | --- | --- |
| Codex classification | An earlier advisory masks a later key read; CRITICAL. | Whole-command findings and real denial validation are required. No failure-event or counter contract is specified. | One invocation; a common defect affects all Codex users on the release. Refuse recognized key reads, fix the shared classifier, and verify rendered adapters. |
| OpenCode target inspection | An unapproved or unresolved destination is allowed; CRITICAL. | Bounded grammar, all-target inspection and real-host execution validation. No stable failure-event or counter contract is specified. | One invocation; an unsafe classifier affects all OpenCode installations on the release. Refuse the command and give supported usage guidance. |
| OpenCode adapter | Hook ordering, stale wiring or an internal exception bypasses refusal; CRITICAL. | Ordering is explicitly unproven; real-host validation gates the outcome. The exception policy recommends visible sanitized reporting but gives no diagnostic schema or repetition rule. | One invocation or all calls using the affected driver. Verify host behavior, refresh wiring, and retain the declared fail-open limitation until an owner changes it. |
| Guard availability | Missing or corrupt allowlist, unsupported options, hidden config or redirection produces a legitimate refusal; OPTIONAL. | Ordinary unresolved result and sanitized refusal. | One command. Supply an explicit supported invocation or repair the installed allowlist. Repeated identical unsafe calls remain refused. |
| Permission reconciliation | A malformed record, edited grant or missing historic provenance prevents revocation; CRITICAL for an obsolete privileged grant. | Preserve and report the entry; do not claim full cleanup. The report's fields and incomplete-cleanup status are not defined. | One checkout. Owner review is required for unproven entries; future grants gain provenance. |
| Permission mutation | Disk error or process death occurs between intent, settings and ownership writes; CRITICAL. | Before/after hashes support automatic recovery; failed writes remain failures. | One permission file and its state. Retry can recover recognized before/after states, provided the recovery evidence survives. |
| Permission recovery | Current file matches neither recorded hash, or recovery metadata is malformed; CRITICAL. | Preserve the file and require resolution. The operator's decision and safe retry procedure are unspecified. | One checkout; a pending mutation can obstruct later upgrade or uninstall. See C2. |
| Concurrent mutation | Another installer or editor changes settings or version state during mutation; CRITICAL if user changes are overwritten or ownership evidence is lost. | Input-hash re-read detects some edits; an exclusive installer lock is the recommended open choice. | One checkout. Lock lifecycle, stale-holder recovery and the remaining editor race need explicit treatment. |
| Uninstall | Permission cleanup fails after other cleanup has begun; CRITICAL for retained grants or lost provenance. | Capture facts first, retain evidence, report the path and stop reporting success. | One checkout. Retry the same cleanup after fixing the failure; intent must remain usable. |
| Cloud freshness | Expected artifact, configured stamp or JSON tooling is absent, malformed or stale; OPTIONAL. | Print matching/mismatched/unavailable and explicit reason; warn and continue. | One cloud session. Upgrade, refresh instructions, copy list and stamp together, and rebuild the snapshot. |
| Cloud rollout | A copied bootstrap is stale or matching stamps are mistaken for dashboard verification; OPTIONAL. | Copy-and-own refresh instructions and explicit stamp limitations. | Sessions created from that snapshot. Merge the section and refresh the setup; a matching stamp is only operator-supplied evidence. |
| Diagnostics | Commands, URL credentials or queries leak through refusals, rewrites or exception text; CRITICAL. | Redaction rules prohibit complete commands, userinfo, queries, headers and contents. | The transcript or CI log containing the diagnostic. Apply redaction before every output path, including suggested rewrites and exception reporting. |

## Observability Coverage

`docs/observability.md` limits the product to CLI stdout/stderr and requires bracketed subsystem prefixes. No server telemetry, alerting service or distributed tracing is configured. This review therefore expects countable local events and CLI summaries, not a new monitoring backend.

<!-- prettier-ignore -->
| Failure family | Logs | Metric or counter | Trace or correlation |
| --- | --- | --- | --- |
| Key/download enforcement and hook errors | Safe reasons are described, but a bracketed prefix, reason codes and exception-event contract are absent. | No denied/unresolved/error event counts or countable event contract. C1. | No cross-service flow; distributed traces are not applicable. Host/tool-call identifiers would help correlate repeated failures. |
| Reconciliation and malformed ownership | Preservation and conflict reports are described, but the stable fields, command result and incomplete-cleanup distinction are absent. | No inserted/retained/revoked/conflicted/unresolved counts. C1. | No cross-service flow. A local mutation identifier is useful across settings and state diagnostics. |
| Interrupted writes and recovery | Before/after states are explicit; write failures are reported. Stable phase and recovery-result diagnostics are absent. | No recovered-before/recovered-after/conflicted/failed-write counts. C1. | No service trace is required; a mutation identifier avoids mixing separate retries. |
| Cloud stamps and bootstrap | Explicit statuses, expected/configured values, causes and refresh guidance are specified. The prefix and one-event-per-bootstrap rule are not. | Status lines can provide a countable local event once their stable form is defined. | One local bootstrap; no cross-service trace is applicable because the design makes no dashboard API call. |
| Secret-safe diagnostics | Redaction fields are explicitly specified. Suggested rewrites need to obey the same rule. | An output-redaction regression is verified by assertions, not a production counter containing sensitive values. | Identifiers must remain opaque and non-secret. |

The draft has no observability section and does not explicitly adopt the existing prefix convention. That omission affects severe bypass and retained-grant failures, so C1 is required before the design proceeds. Counts can be emitted in existing command summaries or extracted from stable per-event reason fields; a new persistent telemetry store is unnecessary.

## On-Call Ergonomics

There are no planned paging alerts. The operator is the person reading a hook refusal, installer result or cloud bootstrap log.

<!-- prettier-ignore -->
| Signal | Recovery and clarity | Noise considerations |
| --- | --- | --- |
| Unapproved/unresolved download | Refusal should name the reason category and safe hostname, identify supported syntax, and preserve redaction. Repairing the command is a human action; repeated unsafe calls stay blocked. | Emit one refusal per invocation; do not turn persistent enforcement into a retry-once advisory. No paging threshold is needed. |
| Hook internal error | The proposed fail-open choice needs a clear degraded-enforcement message and an immediate validation/repair action. Otherwise a successful tool call can conceal a broken guard. | One countable sanitized event per failed invocation; no uncontrolled stack/command dumps. Repetition counts belong in the existing output surface. |
| Permission conflict or failed cleanup | The affected path and reason must distinguish a user edit, unknown historic ownership and pending recovery conflict. The draft preserves data, but does not say how to resolve a third-hash state. C2. | A command should summarize distinct conflicts once and report that cleanup is incomplete; a subsequent retry should not silently convert uncertainty to ownership. |
| Installer lock contention | Waiting or refusing should be bounded and report the holder's safe identity. Stale-holder reclamation must avoid releasing a live holder's lock. | Do not spin or emit one line per retry. Report contention and terminal result; the design still needs a chosen contract. O1. |
| Cloud mismatch/unavailable | The prescribed refresh steps are clear and preserve warn/continue. Missing artifact/tooling is a different reason from a stale configured stamp and should be printed as such. | Once per bootstrap is sufficient. Cloud-only guarding avoids local-session noise. O2. |
| Stale copied driver/bootstrap | Installation and rollout must say which adopted file needs wiring changes and which verification establishes success. | Keep installation guidance at install/upgrade and bootstrap guidance at session start. O3. |

## Operational Dependencies

- A short permission-conflict recovery runbook is new, including third-hash recovery and partial uninstall. It should live in the existing operator documentation rather than a new dashboard.
- Installer lock ownership, contention and stale-holder recovery become operational responsibilities if recommended option A is taken.
- Operators must refresh copied cloud bootstrap code, the applied network list and its stamp, and rebuild affected snapshots.
- Maintainers must retain real-host evidence that OpenCode refusal precedes execution and that Codex denial is effective for the supported versions.
- No new dashboard, paging alert, server, telemetry collector or tracing service is required.

## Verdict Reasoning

CONCERNS: the design is operable with addressable caveats. It correctly preserves uncertain user configuration, separates policy refusal from crashes, retains recovery evidence after partial failure, and makes cloud stamp limitations explicit. It also calls for real-host enforcement evidence rather than trusting adapter return values.

Before proceeding, it needs a concrete diagnostic/counting contract for severe failures and a safe runbook for the pending-mutation conflict state. Those are design additions that fit the existing CLI output and documentation stack. This is not a FAIL because no unavailable monitoring service or unrecoverable architectural dependency is required.

## CRITICAL

- **C1 — Define countable, prefixed failure diagnostics.** Severity: CRITICAL. The draft's shared policy, adapter, ownership and recovery flows promise sanitized reasons and conflict reports, but do not define structured fields, bracketed prefixes or counts. `docs/observability.md` § Log Format makes the brackets load-bearing for consumer grep/CI detection. An unexpected fail-open hook error or incomplete grant removal can therefore be indistinguishable from ordinary success in automation. Add an observability contract using each existing owning subsystem's prefix, stable reason/status fields, host and operation, safe affected path/hostname, and the final command outcome. Define per-invocation hook event counts or countable reason events, and per-command permission totals including unresolved/conflicted entries and recovery results. Severe failures need those logs and counters at their failure point. Cross-service tracing is not applicable to these local flows; do not introduce a tracing backend. Ensure suggested rewrites and exception text obey the existing redaction rule.
- **C2 — Make pending-mutation conflicts recoverable without discarding provenance.** Severity: CRITICAL. Components / Flows § 3 says a third hash preserves the file and requires resolution, and § 4 retains evidence after partial uninstall. It never defines what the operator does next, how stale intended ownership is settled against the current file, or when a retry may safely proceed. Retrying unchanged can remain blocked, while deleting the intent or overwriting settings can lose ownership or user edits. Add a bounded runbook and explicit result states: preserve settings and intent, show the safe path/operation and conflict category, inspect desired/current/previous owned entries, require an explicit ownership decision for ambiguous entries, and only then finalize or abandon the mutation through a validated recovery path. State that malformed metadata preserves evidence and cannot trigger pruning. Describe the outcome and retry step for both upgrade and uninstall; do not advise manually deleting all version state.

## OPTIONAL

- **O1 — Resolve the recommended lock's operational contract.** Specify lock location, acquisition order, bounded contention, holder identity, token-protected release, crash cleanup and stale-holder checks before implementation. State how the settings-file hash and version-state hash are revalidated under that lock, and retain the explicit limitation that an unrelated editor need not honor it. The existing open question already names the race but leaves these recovery details open.
- **O2 — Bound cloud warning repetition and define the status event.** Emit one bootstrap event with a stable reason for mismatch, missing stamp, missing artifact, malformed artifact or missing parser. Keep warning/continue and make the stamp-only scope visible in both matching and unavailable output. This improves grep diagnostics without adding an alert.
- **O3 — Make rollout completion observable.** Add the existing check/advisory surface that reports absent or stale OpenCode driver wiring and an old adopted bootstrap section. State what the owner runs or observes after refreshing it. The current draft says installation must report wiring changes, but does not name the completion signal.
- **O4 — Add a non-secret local mutation identifier.** Include it in intent, recovery and uninstall diagnostics so output from an interrupted attempt can be matched to its retry. This is local correlation, not a cross-service tracing requirement.

Every actual open decision in `Risks & Open Questions` has lettered options, a lettered recommendation and a default. The remaining bullets are declared risks rather than questions, so no format finding applies.

## OUT OF SCOPE

None. Dashboard readback, arbitrary-interpreter confinement and a centralized monitoring platform are outside the design's stated guarantee and are not proposed by this review.
