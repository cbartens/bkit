# Design Brainstorm & Ideas

Lens: Risk premortem — failure modes, scale, time, handover.

## Approach A — Bounded detection with explicit uncertainty ⭐ Recommended

Extend the shared shell recognizer to return known targets and unresolved-write evidence, inspect only a directly named local script within explicit limits, and send known targets through the same advisory formatter and warning record as edit tools.

The failure this approach contains is false certainty: a detector that recognizes one write must not imply it has found every write in a compound command or script. A result can contain both known paths and unresolved targets. A clearly read-only result requires positive evidence within the supported grammar; absence of a familiar write API is insufficient for an arbitrary program.

The accepted scope controls the content. Both channels show one general authoring advisory. There is no file-kind-to-section mapper, no new shell denial policy, and no check after execution. File-specific investigation, new-file and configuration checklists remain distinct from the general authoring reminder.

### Premortems

<!-- prettier-ignore -->
| Scenario | What breaks | Observability | Recovery |
| --- | --- | --- | --- |
| 10x scale | Bulk commands produce hundreds of target advisories, or a large script consumes the hook timeout before any reminder is delivered. Per-target state reads and writes amplify the cost. | The detector reports a bounded reason such as `analysis-limit` rather than claiming no edits. Adapter fixtures distinguish complete target coverage from partial coverage. | Bound command bytes, directly named script bytes, nesting and target fan-out. Emit one uncertainty warning for the unexamined remainder. Mark only paths whose full advice was emitted; do not mark truncated targets as warned. |
| 6 months later | New Python APIs, shell quoting forms or host payload fields silently stop matching. Read-only exceptions grow until they suppress actual writers. | A shared corpus contains positive, negative and ambiguous cases for each supported command family, executed through generated host hooks. Unsupported syntax has an explicit unknown result. | Add the smallest recognizer for a demonstrated case. Keep arbitrary dynamic code unknown. Update the coverage description alongside the recognizer; do not teach the detector to execute or import scripts. |
| On-call at 3am | A broken state file, missing script or path-resolution error causes a silent hook no-op; users mistake no warning for successful analysis. | Existing fail-open boundaries remain visible in troubleshooting evidence. Safe reason codes identify unavailable script reads or unresolved paths without echoing script contents, arguments or environment values. | Let the command proceed under the existing fail-open contract. For a recoverable analysis limitation, emit the general uncertainty reminder. Retain the existing in-process state-write fallback and document state reset through the established hook troubleshooting path. |
| Author leaves | The next maintainer cannot tell why a path is known, why a script is read-only, or which shell syntax is intentionally unsupported. | Each recognition rule has an input/output example and an ambiguity case. Host coverage lists event, payload field and delivery channel separately. | Keep normalization, recognition, formatting and host delivery as named responsibilities within the existing shared parts. Preserve one advisory text source and one behavioral corpus; avoid a second detector per host. |

### Risk-mitigation guidance

- Represent uncertainty independently from the list of known paths. `python script.py && cp a.md docs/b.md` may need both a generic script warning and advice for `docs/b.md`.
- Read directly named scripts as data only. Do not execute them, follow imports, recurse into subprocess calls, fetch remote sources, or read arbitrary special files to infer targets. Missing, non-regular, oversized or unsupported scripts remain unknown.
- Resolve literal destinations against the tool's working directory and supported shell directory changes. An unresolved variable or directory destination is not a guessed file. For moves and patches, account for every relevant affected path rather than treating only the first header as the whole edit.
- Keep shell parsing used for an advisory from weakening existing destructive-command and secret guards. The guard's stronger decision takes precedence; a new advisory does not replace its result.
- Normalize file identity and session/agent scope consistently across shell and edit-tool calls. Do not collapse independent agents into a single global warned-file bucket.
- Preserve the existing `BKIT_GATEGUARD=off` behavior. Explicitly define shell behavior when `BKIT_GATEGUARD=deny` is set: shell remains advisory as the owner chose, while existing edit-tool denial behavior must not change accidentally through shared state consumption.
- Classify new files by pre-execution existence only when the destination is exact. Unknown existence must not claim the reuse checklist was selected accurately.
- Deliver warning text before treating a path as covered. If a host drops an advisory channel, recording that file as warned would suppress its next real reminder.

## Approach B — Treat named scripts as opaque to avoid unsafe inference

Extend recognition of direct shell writes and literal inline write expressions, but treat a named script as potentially writing unknown files instead of reading and analyzing its source. Known direct destinations still receive the shared per-file advice; opaque scripts receive the general uncertainty reminder.

The failure this approach contains is overconfident source inspection: reading a script does not establish what imports, runtime branches or subprocesses will do. It has a smaller detector and predictable hook work, at the cost of more uncertainty warnings and fewer exact target advisories. This is viable only if the design's acceptance examples permit the explicit unknown-target fallback for named scripts whose files could have been found through simple source inspection.

### Premortems

<!-- prettier-ignore -->
| Scenario | What breaks | Observability | Recovery |
| --- | --- | --- | --- |
| 10x scale | A repository runs many harmless local scripts and the repeated uncertainty reminder becomes background noise. | The warning distinguishes an opaque named script from a known write. Read-only fixture cases ensure direct readers remain quiet. | Keep one uncertainty message per invocation, alongside known target advice. Do not suppress all future unknown scripts after the first warning, because that would also hide new writes. Reconsider bounded source inspection if real workflow evidence shows excessive noise. |
| 6 months later | Maintainers add filename-based exemptions such as `check-*` and accidentally bless scripts that write generated files. | The coverage contract says that a filename or script command name does not prove read-only behavior. A fixture with a misleading name remains unknown. | Remove unsupported exemptions and retain the conservative fallback. Read-only recognition must describe an actual bounded operation, not a naming convention. |
| On-call at 3am | A user sees a warning before a harmless script and assumes a failure, or sees no per-file checklist and assumes the script was exempt. | Text states that targets are unknown, the command is allowed, and authoring reads apply to each edited file. It does not label an unknown script as a confirmed writer. | Improve the shared explanation once for every host. Preserve fail-open behavior and leave the user-visible distinction between known write and possible write intact. |
| Author leaves | The fallback looks unfinished and a maintainer adds ad hoc script-language parsing independently in one host. | The design records opacity as a deliberate trade-off and the host parity corpus requires identical classification. | Add any later analysis to the shared detector, not to adapters. Reuse the same general advisory and warning record. |

### Risk-mitigation guidance

- Keep the same known/unknown/read-only distinction and shared warning identity as Approach A.
- Detect named script invocation forms regardless of extension where the interpreter invocation is explicit. A missing extension is not evidence of a read-only program.
- Preserve quiet handling for commands positively identified as readers, log capture and non-source sinks, without giving arbitrary scripts a clean classification.
- Do not claim that the general script warning delivered the per-file checklist for an unknown target. Leave those files absent from the once-per-file record so a later known edit still gets its advice.
- Apply the same source/header changes as Approach A. The simpler detector does not waive template-editor pointers or the clarification that script exceptions retain authoring reads.

## Approach C — None

A full cross-language static analyzer would add substantial maintenance and still could not prove the effects of arbitrary scripts. It does not fit the owner's request to keep detection and one general advisory simple.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Recommend Approach A with bounded direct-script inspection and an explicit uncertainty fallback. | Treat every named script as opaque under Approach B; attempt full cross-language analysis. | A bounded scan improves useful target detection without pretending to solve arbitrary program behavior. Approach B remains the smaller fallback if direct-script analysis adds little demonstrated value. |
| Use one general authoring advisory on shell and edit-tool paths. | Select and quote sections by file kind. | The owner explicitly chose Q1 B and Q3 A. Record file-type-specific advice as future work; do not implement its lookup indirectly. |
| Keep unknown-target warnings separate from known-path acknowledgement. | Mark the script path or a global wildcard as warned. | Neither a script filename nor a wildcard represents the files it may later edit. False acknowledgement suppresses the reminder at the next exact edit. |
| Share the existing GateGuard formatting and state semantics rather than duplicate them in each shell hook. | Independent warning text and state per host or channel. | Two copies drift and produce duplicate reminders. Shared behavior still needs host-specific transport validation. |
| Keep advisory classification separate from existing enforcement. | Forward a GateGuard deny result from every shell call, or replace the shell guard's decision with the advisory result. | The owner rejected new shell blocking, and stronger existing guards must retain their behavior. |
| Prefer extra reminders over silently losing a first reminder during concurrent state updates. | Treat all state errors as proof of prior delivery. | The current state code is a read-modify-write JSON file. Parallel writers can lose entries; pretending delivery occurred would create a more harmful failure. Do not promise strict exactly-once delivery without testing the state boundary. |

## Cross-Approach Risks

1. **Before-edit delivery differs by host.** The inspected OpenCode source describes advisory delivery through `execute.after`; its `execute.before` path currently supports deny mode by throwing. The inspected Antigravity helper delivers advice by denying once because an allow reason is dropped. The accepted before-edit and no-new-shell-blocking constraints therefore need an explicit host capability decision backed by current official documentation or a focused probe. Preserve the owner's constraints and document a verified unsupported host boundary if no compatible channel exists. Do not count an after-edit message or a silent allow as satisfying the requirement.
2. **Install ownership can preserve an old driver.** `docs/architecture.md` says shared hook engines are managed, while surrounding host drivers become consumer-owned. Updating a shared part does not prove an existing consumer's driver calls the new shell path or subscribes to added tools. The design needs fresh-install and upgrade evidence, with an explicit compatibility boundary if a driver change cannot be installed safely. This does not authorize a migration that the owner has not requested.
3. **Warning acknowledgement can affect deny mode.** `firstTouchAdvice` currently records a path before returning its advisory/deny result. Reusing it from the shell may consume the state that edit-tool deny mode uses. State what "already warned" means across channels and test both call orders. Do not silently introduce a second denial policy or promise unchanged semantics without checking this interaction.
4. **Partial target batches can disappear.** Each known file needs advice before execution. A first-target-only adapter, output cap or early return must not mark unshown targets as covered. The general unknown warning cannot replace a known target's checklist without making that loss explicit.
5. **Path aliases and concurrency weaken deduplication.** Relative/absolute spellings, changed working directories, missing session identifiers and parallel read-modify-write state updates can cause either repeat advice or false sharing. Define the identity boundary once and exercise both edit channels against it. Do not claim strict once-per-file delivery across racing processes from sequential fixtures alone.
6. **Read-only is a supported proof, not the default bucket.** A script can call an imported writer without containing a familiar write token. Dynamic targets, unsupported syntax and bounded-analysis exhaustion remain unknown. The detector is advisory assistance, not a security boundary or a guarantee that every edit was identified.
7. **Diagnostics can leak code or credentials.** Shell commands and inline scripts can contain secrets. Unknown-target explanations should carry a safe reason and interpreter/command class, not the entire command, script body or environment values. Recognized file paths are the minimum required output and must be treated as display data.
8. **General advice must reach the whole intended scope.** The inspected `isDocsPath` only appends authoring advice for `.md` files under `docs/`, excluding `docs/plans/`. The accepted input names agent-read files more broadly. A broad agent-read-file predicate may be needed, but it must not grow into the deferred per-file-kind section selector. Clarify the predicate's coverage in the final design.

### Evidence boundaries

- Source read: `.bkit/core/hooks/guardrails-shell.js` `shellEditTargets` and `shellEditAdvisory`; `.bkit/core/hooks/gateguard-engine.js` `isDocsPath`, `docAuthoringAdvisory`, `dedupKey`, `readState`, `markWarned`, and `firstTouchAdvice`; `.bkit/core/.opencode/plugin/bkit-gateguard.js` delivery comments and before/after entry points; `.bkit/core/hooks/antigravity-hook.js` advisory delivery comments.
- Documentation read: the design input, `.agents/docs.md`, the applicable project rules, design catalog sections, `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `.agents/context.md`, and the relevant authoring sections. Relevant folded decision evidence includes `gateguard-first-touch-advisory-checklists`, `antigravity-advisories-deny-once`, and `700-session-start-rules-read-advisory`.
- The language-server query could not enter the ignored worktree path, so scoped source reads supplied the evidence. No host capability was verified against current upstream documentation or by executing a probe in this exploration. The transport claims above describe the checked-in implementation and identify what review must settle.
- This artifact proposes approaches only. No implementation code, tests, design document or plan was written.
