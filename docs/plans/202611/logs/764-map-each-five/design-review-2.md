Verdict: CONCERNS

<!-- verdict:end -->

# Design Review

Lens: Operability — failure modes, observability, on-call ergonomics.

## Failure-Mode Enumeration

This phase produces a decision record and follow-up proposals. It introduces no running service. The runtime failure modes below therefore assess whether the selected proposals carry enough operational requirements for later work; they are not claims that those guards already exist.

<!-- prettier-ignore -->
| Flow | What fails | Detection described by the draft | Blast radius and recovery |
| --- | --- | --- | --- |
| Enforcement register | Source, host mode or consumer driver changes after the inspected baseline | Source revision, evidence levels and host prerequisites expose the boundary. Stale evidence is downgraded to unverified | A wrong claim can affect every consumer relying on that host. Reinspect the affected adapter/mode and correct that claim |
| Host interception | Hook is disabled, untrusted, given incompatible input, or permits execution after an internal error | The draft records these limits explicitly, including Codex advice and OpenCode automatic approval. It specifies no new detection event | The current route loses the assumed protection. Restore and verify the supported configuration; do not relabel advice as approval |
| G1 push authorization | Approval is absent, stale, transferred across runs, or bound to a different target | Rule/operation/target/outcome/reason are proposed; unavailable authorization is distinguished from denial | One repository or remote ref can be published without valid consent. Require the supported owner-controlled path for the actual operation; the retry contract needs C2 |
| G2 target and flag safety | Remote/ref defaults cannot be resolved, a shared destination is misclassified, or a hook-bypass flag is missed | Unresolved force targets cannot receive the personal-branch exception; native/script matching limits remain explicit | Shared history or required checks can be bypassed. Correct the invocation or resolution before retrying; retain ordinary shared pushes and authorized personal lease operations |
| G3 staged-secret check | Wrong bytes are inspected, a rename/forced path is missed, detector fails or exhausts resources, or an example is falsely matched | Inspect the actual staged snapshot, reject configured matches, and report location without value | A covered commit can publish a secret or a legitimate commit can be blocked. Remove the secret or apply narrow reviewed example treatment, then rescan; error behavior is left unspecified and needs C2 |
| G4 outgoing payload check | Wrong or later-modified bytes are sent, a fallback bypasses the scan, detector fails, or a false positive is reported | Named bkit routes scan received bytes before transmission; direct MCP and later modification remain explicit gaps | A tracker/PR/commit publication can disclose a secret. Rebuild and rescan the exact payload before retry; use the existing owner-run incident process if disclosure occurred |
| Diagnostics | Error text or retained failure evidence exposes the matched value, or an allowed retry cannot be related to the refusal | Value-free diagnostic intent is stated. Output format, counts and retry correlation are not defined | Diagnostic disclosure can repeat the original harm; insufficient evidence leaves the owner unable to tell refusal from an unobserved route. C1 defines the minimum contract |
| Parsed contracts | Working-tree content is consumed before commit validation, or a direct edit bypasses the validator | The draft explicitly records route/timing limits | One workflow/artifact can be misread. Use the validating producer/consumer before relying on its result; commit-time validation does not retroactively protect earlier reads |

## Observability Coverage

The existing observability model is local CLI stdout/stderr, not a server monitoring stack. `docs/observability.md` § Scope and § Log Format require owning `[bkit-<noun>]` stderr prefixes and one structured stdout result. Existing workflow status rows provide run context. These are suitable seams for the proposed guards.

<!-- prettier-ignore -->
| Failure class | Logs | Metric/counter | Correlation | Assessment |
| --- | --- | --- | --- | --- |
| Stale register evidence | Source revision and limitations are present in the decision record | A row count establishes inventory coverage; no runtime rate is needed for a static artifact | Source revision, host and rule identify the claim | Sufficient for this phase |
| Disabled/untrusted/mode-dependent host control | Current limitations are documented | No runtime event/count is promised | Host/mode prerequisites are stated | Honest limitation; do not invent a detection guarantee |
| G1/G2 refusal or uncertain authorization/target | Generic fields are proposed at draft line 209 | No allow/deny/unavailable/error counts are specified | No operation identifier or run/retry binding is specified | C1: require a minimal local decision record in follow-up acceptance |
| G3/G4 match, detector error or resource failure | Redaction is required, but the owning output convention and failure categories are incomplete | No match/error/unavailable summary is specified | No binding to staged snapshot or outgoing payload retry is specified | C1 and C2: severe publication failures need diagnosable safe outcomes |
| A secret actually disclosed | Existing security incident runbook supplies revocation and private remediation | No new central monitoring is introduced | Existing publication/provider records identify the incident, where available | Link the existing owner-run runbook in the proposal's recovery requirement; avoid copying its commands |

An operation identifier can be local and opaque. For an external publication, carry that identifier through the scan, refusal/approval, transport handoff and outcome where the route exposes those events. It must not contain payload bytes, matched values or secret-derived material. A new tracing service or persistent telemetry database is unnecessary.

## On-Call Ergonomics

No new paging alert is proposed, which fits a local CLI and this design-only scope. A normal approval request or scanner match should be actionable command output rather than an alert storm.

The proposed diagnostic fields can explain what was stopped, but C1 is needed to make output consistent with existing log conventions and to relate retries. C2 is needed so the owner knows whether to correct an invocation, repair a scanner/configuration, obtain a fresh scoped approval, or handle an actual leak. Repeating the identical command after a scanner error must not be presented as a successful scan.

Recovery should preserve existing authorization scope. A false-positive exception belongs to the specific detector/example and relevant snapshot or payload, rather than an environment switch that disables every guard. A host that cannot supply the required approval path remains a documented limitation; the design does not authorize an agent-generated approval substitute.

If a value was already disclosed, point to `docs/deployments.md` § Security incident runbook. That runbook assigns incident actions to the owner. Routine guard refusal is not itself an incident and should not trigger those actions automatically.

## Operational Dependencies

None for this phase: no dashboard, paging alert, hosted monitoring dependency or runtime runbook is added by the evidence map.

The four selected follow-ups need concise owner recovery instructions at their existing command/hook boundaries. C1 asks for local diagnostic records and per-invocation summaries using existing facilities, not a new on-call service. Later implementation must keep provider compatibility evidence current when the relevant adapter or host mode changes.

## Verdict Reasoning

The design is operable as a static decision record and is appropriately candid about source-only evidence, fail-open hooks, unrestricted alternate routes and host-mode limitations. The risks section covers the main failure classes, and no unsettled owner question is disguised as an unformatted open question.

The four follow-up proposals are worth preserving, but their operational acceptance currently leaves severe scanner/error outcomes and diagnostic evidence to later specification. These gaps are addressable by adding explicit design requirements before the proposals are handed to implementation. They do not require running code or adding monitoring infrastructure in this issue, so the verdict is CONCERNS rather than FAIL.

## CRITICAL

1. C1 — Add the minimum diagnostic contract for selected guard failures. Draft line 209 specifies generic fields but omits the existing `[bkit-<noun>]` output convention, a bounded per-invocation decision/error count, and an operation correlation identifier. A scanner failure or an uncertain approval can lead to irreversible publication, so an owner needs to distinguish an actual refusal, an unavailable control and an allowed retry. Add these as acceptance requirements for G1-G4: use the owning command's prefixed stderr and structured result; include safe rule/operation/outcome/reason plus host/mode when relevant; summarize decision/error counts without payload content; correlate retries and external handoffs where observed. Define how a diagnostic-write failure behaves without treating missing evidence as authorization or a clean scan. Reuse current CLI/workflow facilities and add no central telemetry service.

2. C2 — State safe outcomes and narrow recovery for unavailable authorization and scanner errors. G1 at line 173 allows an owner-controlled route or documented limitation, and G3 at line 175 says to specify scanner errors and false-positive recovery, while line 209 leaves recovery to each follow-up. The proposal should already distinguish a detector match, scanner timeout/internal error, unavailable interception, unresolved target and absent/expired approval. Require that an unavailable or failed new check on a route advertised as protected does not produce a successful scan or execute under a fabricated approval. The protected operation stays unperformed until the same operation has a supported scoped approval and valid check result, or the route is explicitly classified unsupported; that classification alone does not authorize an automatic retry. Rescan changed staged/outgoing bytes and obtain fresh approval when the authorized operation changes. Describe narrow false-positive review and link the existing owner-run secret incident process for actual disclosure. This requirement applies to the selected future guards and does not silently change every existing hook's fail-open contract.

## OPTIONAL

1. O1 — Add a maintenance trigger for the evidence map. The draft records the inspected revision and says to downgrade stale claims, but does not say when a maintainer should reconsider a row. State that changes to a cited rule, shared classifier, permission table, host adapter, registration/trust prerequisite or auto-approval mode trigger review of the affected claims. No new scheduler, generator or broad test catalog is needed.

2. O2 — Include interrupted-operation recovery in G3/G4 acceptance. Scans may finish while the commit or remote publication fails or returns an uncertain outcome. Require the owner-facing result to distinguish scan success from publication success and preserve the existing route's independent read-back or idempotency behavior before a retry. A passed scan alone neither proves publication nor authorizes replay. This can remain a concise constraint on existing command behavior rather than a new transport subsystem.

## OUT OF SCOPE

None. This review requests operational requirements for the four already selected proposals. Implementing detectors, adding host hooks, introducing a trusted authorization broker and building a monitoring pipeline remain outside this design phase.
