Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.

## Failure-Mode Enumeration

The failure domain is a local agent session, or every session using an affected generated hook after a release. The feature introduces no server, tenant store, network dependency or remote monitoring service.

<!-- prettier-ignore -->
| Component or flow | What fails | Detection | Blast radius and recovery |
| --- | --- | --- | --- |
| Shell recognition | Unsupported quoting, heredocs or nested commands lose a target, or a reader is classified as a writer. | Positive, read-only and uncertain rendered-hook fixtures; otherwise an unexpected or missing reminder reported by an agent or user. | One command initially; a shared detector regression reaches every host. Preserve uncertainty and existing enforcement results, then correct the shared recognizer. |
| Bounded source inspection | Script source is unavailable, dynamic, oversized or non-regular; analysis reaches a limit. | Safe uncertainty reason codes, including `analysis-limit`. | One command. Keep known targets, issue the general warning and allow execution. The design excludes executing scripts, following imports and traversing trees. |
| Hook resources | The permitted input, nesting or output consumes the host's hook timeout or exceeds its delivery budget. | The design requests measured hook evidence, but does not define a latency acceptance threshold. A timeout can otherwise appear as missing advice. | One invocation, or repeated invocations with the same input shape. Fall back before the delivery deadline; see OPTIONAL O2. |
| Advisory fan-out | The 64 KiB output budget omits complete advisory blocks for some known targets. | Unshown targets remain unacknowledged, but the design does not explicitly require an output-truncation warning. | One multi-file command. Retain later reminders for omitted paths and identify partial coverage in the current response; see OPTIONAL O3. |
| Warning state | Corrupt, unavailable or racing temporary state loses a warning record or repeats advice. | State-failure fixtures and repeated advice; safe runtime state-failure signatures are not specified. | One session/agent bucket. Fail open, use the existing in-process fallback and tolerate repeats rather than acknowledge unshown advice. |
| Host delivery | A matcher, payload adapter, trust boundary or model-visible output channel fails to deliver advice. | Matcher-plus-payload fixtures, current source/contract evidence and focused live probes where uncertain. A written state file alone does not prove delivery. | One host or installation. Do not acknowledge a known dropped route; document sourced capability gaps and repair supported wiring. |
| Consumer upgrade | A preserved consumer-owned driver cannot call the improved managed entry point. | Fresh-install and upgrade footprint checks, including preserved customized driver text. | An existing consumer installation. Name the required wiring; do not overwrite custom code or add an unapproved migration. Installation is idempotently rerunnable under `docs/deployments.md` § `bkit install` three-phase contract. |
| Diagnostic output | A reason message leaks inline code, command arguments or environment values. | Safe-output assertions and review of rendered-hook responses. | One transcript or retained artifact. Emit reason codes and necessary display paths only; avoid persisting source and raw arguments. |

## Observability Coverage

The design has local diagnostic categories and behavioral evidence rather than production telemetry. This matches `docs/observability.md` § Scope: bkit has no server-side telemetry pipeline, log drains or tracing.

<!-- prettier-ignore -->
| Failure class | Logs or visible evidence | Metrics or counters | Tracing / correlation |
| --- | --- | --- | --- |
| Unsupported or unavailable analysis | Safe reason categories and a general uncertainty reminder are specified. | No runtime metric; rendered-hook case results provide development evidence. | No cross-service flow. Existing session/agent identity is sufficient local context. |
| Analysis and output limits | `analysis-limit` is specified; output-budget omission needs an explicit visible marker. | No runtime counter; the implementation evidence should record elapsed time and target/output counts for boundary cases. | No distributed trace is needed. |
| Warning-state failure | Fail-open fallback is specified, but no searchable safe failure signature or recovery note is named. | No state-failure metric is proposed. This is an addressable diagnostic gap, not grounds for a monitoring service. | The existing session/agent scope is relevant; raw command content is unnecessary. |
| Host transport or upgrade wiring | Contract checks, generated-hook fixtures, installation footprint checks and focused probes are specified. | No runtime metric; a capability table distinguishes verified coverage and gaps. | Host and tool/event identify the boundary. Model-visible delivery cannot be inferred from a state write. |
| Parser or enforcement regression | Existing corpus and stronger-guard preservation obligations are explicit. | Test-case pass/failure counts are appropriate. | No cross-service trace is applicable. |

There is no `CRITICAL` operational failure requiring a missing metric, alert or trace. The hook remains an advisory aid with fail-open behavior and bounded local effects. Diagnostic text should reuse the owning hook's existing bracketed prefix, consistent with `docs/observability.md` § Log Format; adding raw stderr to a JSON-only protocol would itself break delivery.

## On-Call Ergonomics

No new paging alert is proposed, and there is no alert-storm vector. Unknown-target reminders are synchronous user-facing advice, with one uncertainty warning per invocation. The design intentionally keeps arbitrary scripts uncertain and quiets only positively understood readers, so it avoids filename-based exemptions that would hide writes.

Recovery is generally local and repeatable: correct the shared recognizer, rerun an idempotent installation after partial install failure, preserve stronger shell protections, or repair a documented consumer-owned driver. `BKIT_GATEGUARD=off` is an existing temporary mitigation for GateGuard output problems; it must not turn off the independent shell guards. The design already preserves that separation.

The missing operator aid is a short mapping from safe reason codes to these actions, especially for temporary-state failure, host trust/wiring and output truncation. A missing reminder currently risks forcing the maintainer to chase hook registration, host delivery and state separately without an obvious starting point. See OPTIONAL O1.

## Operational Dependencies

No dashboard, alert, remote collector or tracing service.

The added maintenance burden is a cross-host recognition corpus, boundary-case latency evidence, and fresh-install/upgrade coverage. The design also needs small additions to the existing provider-hook troubleshooting documentation rather than a new standalone operations manual.

## Verdict Reasoning

The design is operable with addressable caveats. It bounds static inspection, keeps uncertainty separate from known targets, preserves stronger protections, avoids executing inspected scripts, and treats delivery and consumer upgrades as evidence obligations. Its concurrency and fail-open limitations are explicit rather than hidden behind an exactly-once claim.

Three details should be made concrete before implementation: safe diagnostic/recovery behavior, a measurable delivery-time budget, and visible acknowledgement of output-budget truncation. They fit the existing architecture and the owner's simple general-advisory scope.

`Risks & Open Questions` covers the enumerated failure classes. It explicitly states that no owner questions remain; its entries are technical evidence obligations and risks. Lettered choices, a recommended option and an unanswered default are therefore not missing from an actual open owner question.

## CRITICAL

None.

## OPTIONAL

### O1 — Define safe diagnostic signatures and local recovery

- **Severity:** `MEDIUM`.
- **Evidence:** `Data Model` defines safe analysis reason codes, and `Advisory and state flow` specifies a state-write fallback, but neither identifies a safe state-failure signature or maps these outcomes to recovery. `Risks & Open Questions` names the same delivery and upgrade risks without an operator entry point.
- **Impact:** A missing or repeated reminder is hard to distinguish from a disabled hook, untrusted host layer, preserved old driver or broken temporary state. On-call must reconstruct the failure from several documents.
- **Recommendation:** Add a compact diagnostic/recovery table to the design and name the existing `.bkit/providers.md` hook documentation as its eventual home. Reuse the owning hook's bracketed prefix and protocol-safe output channel. Cover analysis unavailable/limited, state fallback, host delivery unavailable and incompatible driver wiring. Retain safe reason codes and omit command bodies, script source and environment values. No dashboard or remote counter is needed.

### O2 — Make the hook-time budget measurable

- **Severity:** `MEDIUM`.
- **Evidence:** `Static inspection boundary` bounds bytes, nesting, targets and output, while `Risks & Open Questions` leaves measured hook behavior to later evidence. The design does not state what elapsed time is acceptable relative to each host's hook deadline.
- **Impact:** A recognizer can obey every size limit yet miss the host deadline, losing both its exact-target advice and its uncertainty fallback. This appears as a silent failure of the feature.
- **Recommendation:** Require boundary-case cold-start timing through the rendered hook on each supported host adapter. Choose a shared analysis deadline with headroom below the shortest supported hook timeout, retain host-specific delivery overhead in the measurement, and specify early uncertainty fallback when the analysis budget expires. Keep the deadline an internal constant rather than a user setting.

### O3 — Make partial advisory output visible

- **Severity:** `MEDIUM`.
- **Evidence:** `Static inspection boundary` caps advisory output at 64 KiB and correctly forbids marking an omitted target as warned. `Advisory and state flow` emits an uncertainty warning for unresolved analysis, but does not explicitly include known targets omitted solely because their complete advisory blocks exceed the output budget.
- **Impact:** A large multi-file edit can receive advice for only a subset of known targets without a visible statement that the current response is partial. Leaving those paths unmarked protects a later call, but does not tell the agent about the current omission.
- **Recommendation:** Reserve space for one safe output-limit reminder with the number of omitted known targets. State that authoring reads apply to all edited files, emit complete per-file blocks only, and leave every omitted path unacknowledged. Do not echo omitted script source or raw commands. Exercise the output-limit branch separately from analysis-limit cases.

## OUT OF SCOPE

Remote hook telemetry, dashboards, paging alerts and distributed tracing. This local advisory feature does not introduce a service boundary that warrants them.

New shell blocking, host enforcement changes, automatic file-type-specific section selection and a broad rewrite of consumer-owned drivers are outside the accepted scope. This review does not reopen those owner decisions.
