# Design Brainstorm & Ideas

Lens: Optimal trade-off — best long-term shape, legacy constraints set aside.

## Approach A — Bounded edit detection with one advisory path ⭐ Recommended

Separate the question “could this command edit a file?” from the question “what should the agent see?”, and send both shell edits and edit tools through the same checklist and general authoring advisory.

<!-- prettier-ignore -->
| Trade-off | Assessment |
| --- | --- |
| Complexity | `MEDIUM`. Shell syntax and script inspection need explicit limits, but advisory text and first-touch state stay in one place. |
| Extensibility | Each command recognizer adds evidence to a common result: known target paths, whether other targets remain unknown, and the evidence of a possible write. New host adapters translate payloads rather than reproduce detection or authoring rules. |
| Risk | An incomplete detector can mistake an unresolved write for a read-only command. Preserve uncertainty in the result instead of treating failure to extract a path as proof that nothing changes. |
| Maintenance | A small corpus of supported write forms and read-only counterexamples grows with actual failures. One common advisory avoids a growing file-kind rules map. |
| Friction vs ideal | Extend the existing shared shell detector, GateGuard engine and host adapters. Their present interfaces do not carry enough information: `shellEditTargets` returns descriptions rather than usable paths, while `firstTouchAdvice` both creates advice and records state. All callers and rendered hooks must change together. No new runtime package or user configuration is needed. |

The ideal boundary is a small structured detection result, not a universal shell interpreter. Known paths and an unknown-target flag can coexist: a command may visibly write one literal file and also call a helper whose outputs cannot be determined. Emit first-touch advice for the known files and one uncertainty warning for the remaining possible writes. Do not create a fictitious file entry for an unknown target, because that would suppress advice when the real target becomes visible later.

Use syntax-aware shell scanning sufficient to preserve quoting, heredocs and nested commands before inspecting operands. The existing `shellSegments` splits on newlines and separators without preserving quote context, so adding more expressions to that splitter alone would not provide a sound base for Python or Node snippets. Recognize the required commands and a bounded set of literal write forms in inline scripts. For a directly named script, inspect its source without executing it and treat unresolved imports, computed paths or unreadable source as uncertainty. Bound reads and recursion so a hook stays fast. A command is quiet only when its inspected form is clearly read-only; the absence of a recognized writer is not enough for an opaque script.

The existing `firstTouchAdvice` is the strongest reuse point for investigation, new-file and quality-gate checklists. Give shell callers access to that same policy and state while keeping shell delivery advisory even when `BKIT_GATEGUARD=deny`. Normalize target paths and session/agent identity identically across edit methods before checking the shared record. Existing host-specific delivery remains a transport detail; Antigravity's already documented deny-once mechanism does not authorize a new shell-blocking policy elsewhere.

The owner chose one general advisory in Q1 and Q3. Extend its applicability to the agent-read files in scope without selecting or quoting different rule sections for different file kinds. Include a general instruction to use the authoring document's “Which Sections Apply” table, leaving section selection to the agent. This removes the original need for a runtime authoring-section lookup or package-relative rule extraction. Template opening notes and the shipped `lite.md` header remain direct pointers, and the shared rules clarify that permitted script edits still require authoring reads.

Host coverage needs two checks per host: the hook matcher must receive every documented editing tool, and its payload adapter must extract that tool's targets. Adding `NotebookEdit` only to Claude's matcher would leave the current shared `EDIT_TOOLS` adapter rejecting it. Treat each host's documented hook limits as a supported boundary and record a sourced gap where interception is unavailable.

## Approach B — Full shell and script parsing before every command

Parse shell commands and embedded Python, JavaScript and other scripts into syntax trees, then perform static analysis to infer their file effects before rendering the same general advisory.

<!-- prettier-ignore -->
| Trade-off | Assessment |
| --- | --- |
| Complexity | `HIGH`. Shell grammar, multiple scripting languages, imports and data flow become a tooling subsystem. |
| Extensibility | Structured parsers handle richer syntax within a supported language, but each language and shell variant needs its own parser and effect rules. |
| Risk | A polished parser can imply completeness while runtime values, subprocesses, imports and dynamic dispatch still make output targets unknowable. It still needs the same unknown-target warning as Approach A. |
| Maintenance | Parser versions, language compatibility, performance limits and packaging become ongoing obligations. A parser cannot replace the write-operation catalogue. |
| Friction vs ideal | Existing hooks are shared JavaScript fragments rendered into standalone host hooks, and the package currently has no runtime dependencies. Parser libraries or host-interpreter subprocesses change that footprint and increase cold-start and installation failure surfaces. |

From first principles, parsing is attractive when the product needs precise rewrites or enforcement. Here the product needs an early reminder and explicitly allows a warning when targets cannot be determined. Full analysis pays a large cost without removing the decisive uncertainty. Consider it later only if measured misses show that a bounded detector cannot meet the agreed command coverage without excessive noise. Do not add it to this change.

## Approach C — None

The two approaches cover the meaningful choice between bounded evidence and a language-analysis subsystem. Requiring callers to declare targets would add a new agent contract and would not detect edits made through existing unmodified commands, so it is not a separate candidate for the requested outcome.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Recommend bounded detection feeding one advisory path. | Full multi-language parsing. | The required result is a useful reminder before the command. Unknown-target warnings are accepted, so complete static analysis adds cost without guaranteeing complete target discovery. |
| Preserve known targets and unresolved writes independently. | Treat an empty target list as read-only, or emit only a generic warning for the whole command. | A mixed command must retain useful per-file advice while acknowledging what the hook cannot determine. |
| Keep one general authoring advisory across edit methods and supported hosts. | Select sections by file kind or quote different rules for shell targets. | Q1 and Q3 explicitly settle this. Record the file-kind idea for future consideration; it is outside this design's implementation scope. |
| Share first-touch state across shell and edit tools while keeping shell delivery advisory. | A separate shell seen-file map, or applying edit-tool deny mode to shell calls. | A separate map repeats warnings, and new shell blocking was explicitly excluded. |
| Exclude commands clearly identified as read-only, and warn for opaque possible script writes. | Warn for every script invocation, or require a recognized literal writer before warning. | Q2 chooses a useful uncertainty warning without routine noise from demonstrably read-only commands. |
| Keep producer-owned changes in shipped shared hooks, host source adapters, rules and template/doc headers. | Add logic only to bkit's own installed hooks. | The result must reach consumer installs, and installed mirrors are generated outputs. |

Evidence considered: `.bkit/core/hooks/guardrails-shell.js` contains the current command scanning, description-only edit detection and generic shell advisory; `.bkit/core/hooks/gateguard-engine.js` owns the existing checklists and first-touch record; `.bkit/core/hooks/gateguard-edit-payload.js` currently accepts `Edit`, `Write` and `MultiEdit`; `docs/architecture.md` describes shared payload rendering and package-relative authoring sources; `docs/technology.md` records the absence of runtime dependencies. Relevant active decisions include `guardrails-shell-advisory-scope-and-detection`, `gateguard-first-touch-advisory-checklists`, `antigravity-advisories-deny-once` and `588-gate-config-list-lives-only-in-gateguard-engine`.
