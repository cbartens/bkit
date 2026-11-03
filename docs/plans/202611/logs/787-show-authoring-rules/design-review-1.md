Verdict: CONCERNS
Spike: true

<!-- verdict:end -->

# Design Review

Lens: Buildability — prior art, stack feasibility, library fit, integration risk.

## Prior Art Search

The repository candidates support the proposed extension. No `NEW` verdict requires replacement, and no external parser is justified by the agreed advisory scope.

<!-- prettier-ignore -->
| Capability | Existing solution and fit | Recommendation |
| --- | --- | --- |
| Shell recognition | `.bkit/core/hooks/guardrails-shell.js` owns `shellSegments`, `shellWords`, `commandLines`, redirect detection and `shellEditTargets`; `guardrails-tiers.js` consumes the result. The existing separator-first split loses quoted program boundaries, so recognizers alone do not close the gap. | `EXTEND-EXISTING`: retain one shared recognition path and extend it to structured known/unknown evidence. Preserve enforcement consumers when changing lexical helpers. |
| Checklist and authoring text | `gateguard-engine.js` already owns investigation, reuse, configuration and document advice. This covers most presentation requirements; the missing work is the broad agent-read predicate and a general applicability-table pointer. | `EXTEND-EXISTING`: reuse these formatters rather than create shell-specific copies. |
| First-touch state | `dedupKey`, `alreadyWarned`, `markWarned` and `firstTouchAdvice` provide the existing record. `firstTouchAdvice` writes state before returning, so merely calling it for every candidate violates the draft's later output-budget rule. | `EXTEND-EXISTING`: separate advice preparation from acknowledgement, or otherwise choose the complete deliverable batch before recording any path. |
| Standalone packaging | `render/parts.ts` splices shared source into host templates through `readTemplate`. It is used by installed hooks and existing tests. | `USE-AS-IS`: add shared parts at existing template seams; keep runtime package resolution and parser dependencies absent. |
| Payload extraction | The shared Claude/Cursor adapter accepts `Edit`, `Write`, `MultiEdit` and `file_path`/`path`; the Antigravity adapter reads `TargetFile`; Codex and OpenCode already parse patch targets. | `EXTEND-EXISTING`: update matcher, accepted tool names and target extraction together. The documented omissions below need explicit design coverage. |
| Consumer documents | `BKIT_CANONICAL_DOCS` in `install/modules/core.ts` includes `authoring.md`. The existing template opening-note convention provides a home for editor pointers. | `USE-AS-IS` for the installed authoring document; `EXTEND-EXISTING` for rules and template pointers. Do not recreate retired `lite.md`. |
| Verification | `gateguard-parity.integration.test.ts`, host-specific GateGuard/guardrails tests and install fixtures already exercise generated hooks. Their adapters normalize emitted JSON; they do not establish when a live model receives it. | `EXTEND-EXISTING`: retain behavioral tests and add a narrowly scoped transport check where documentation and existing assumptions differ. |

Repository evidence came from scoped reads in the assigned worktree. Serena confirmed it was attached to the parent checkout and rejected the ignored worktree path; it was unavailable for worktree symbol references. `docs/capabilities.md` was consulted, but its matching search did not provide a hook capability entry; actual source and sibling test files established the candidates. No absence conclusion depends on that map.

The ecosystem search considered language parsing and static-analysis guidance. Python's standard `ast` module parses Python syntax, but using it here adds an interpreter dependency and does not solve shell or JavaScript effects. It is therefore not a better fit than the existing shared JavaScript hooks. [Python AST documentation](https://docs.python.org/3/library/ast.html). Static analysis has false-positive and false-negative limits, especially around dynamic configuration and cross-file behavior; that supports the design's explicit uncertainty result rather than a claim of complete inference. [OWASP static-analysis overview](https://devguide.owasp.org/en/05-implementation/05-static-analysis/).

## Stack Feasibility

The bounded detector, shared advice and header changes are buildable in the approved Node.js stack without a new dependency. The central feasibility caveat is delivery: running a hook before execution does not establish that the model can read its advice and act before that same execution.

The design already permits sourced host gaps, which makes this addressable without new blocking. It must replace the generic host-audit instruction with the concrete capability table below and the spike results. Do not classify an emitted response, a spilled preview or a later model request as a completed before-edit reminder.

<!-- prettier-ignore -->
| Host | Verified source boundary on 2026-11-02 | Design consequence |
| --- | --- | --- |
| Claude Code | `PreToolUse` supports `additionalContext`, but the documentation places it beside the tool result and says the model reads it on its next request. | Distinguish pre-execution hook emission from an opportunity for the model to perform authoring reads before the pending edit. Default advisory is not evidence of that opportunity. |
| Cursor | `preToolUse` documents `agent_message` for denied calls. The current bkit edit driver emits `additional_context` on allow, while the documented context field is on post-tool events. `beforeShellExecution` separately accepts `agent_message`. | Probe the installed edit and shell transports independently; neither an allow JSON fixture nor the historical driver comment proves current delivery. |
| Codex | `PreToolUse.additionalContext` is documented as model-visible. Shell/unified exec match as `Bash`; patches match `apply_patch`. Input sent later through `write_stdin` does not trigger another `PreToolUse`. | Preserve the known payload seam, verify timing where the requirement depends on it, and document interactive-stdin edits as a coverage boundary. |
| Antigravity | `PreToolUse` has decision/reason output, and documented file tools include `multi_replace_file_content`. Existing bkit transport uses deny-once; no new policy is needed. | Retain the existing transport and add the missing edit-tool name to both matcher and adapter. |
| OpenCode | V2 documents before-execute inspection/input replacement and after-execute result mutation. The shipped plugin uses the latter for advisory text. | Keep its sourced default-advisory limitation explicit. No new shell subsystem or after-edit inspection is needed to claim coverage. |

Sources: [Claude hook context](https://code.claude.com/docs/en/hooks#add-context-for-claude), [Cursor hooks](https://cursor.com/docs/hooks), [Codex hooks](https://learn.chatgpt.com/docs/hooks), [Antigravity hooks](https://antigravity.google/docs/hooks), [OpenCode server plugin hooks](https://dev.opencode.ai/v2/docs/build/plugins/server/).

## Library / API Evaluation

<!-- prettier-ignore -->
| API / dependency | Maturity, footprint, types and license | Fit |
| --- | --- | --- |
| Node `fs`, `path`, `os` | Existing built-ins used by the shipped JavaScript hooks; no new package or binary. The project already uses Node `>=24`, TypeScript for the engine and plain JavaScript for standalone hooks. | Suitable for bounded local reads, regular-file checks, normalization and existing temporary state. |
| Existing hook parts and renderer | Internal MIT-licensed repository code, already exercised through generated-hook fixtures. Existing JavaScript call contracts must stay compatible with consumer-owned drivers. | Reuse; do not introduce a parallel shell advisory engine. |
| Host hook APIs | Vendor-specific and version-sensitive JSON/plugin contracts. There is no additional redistributed runtime library in the proposal. OpenCode's dual export avoids an `@opencode/plugin` runtime import. | Keep host adaptation at the existing boundary and pin evidence to the tested host version. |
| Python AST or multi-language parser packages | Python AST requires a Python runtime; full shell/JavaScript parsing would add dependencies or parser maintenance. The design introduces neither, so no new dependency-license review is required. | Do not adopt for this bounded advisory feature. |

Node provides `fs.readSync` with a byte-length bound and `Stats.isFile()` for regular-file checks. Use bounded reads, not an unbounded `readFileSync` followed by truncation. File replacement between inspection and open must remain an uncertainty/fail-open case. [Node 24 filesystem API](https://nodejs.org/docs/latest-v24.x/api/fs.html).

## Integration Risk

The blast radius includes every rendered shell guard, the shared enforcement classifier, edit adapters, hook registrations, temporary warning-state semantics, shared rules and all current template opening notes. This is a single-package repository; no monorepo boundary is introduced.

The largest integration risks are:

- A lexical change can weaken existing destructive-command or fetch classification if the enforcement caller treats an uncertain parse as clean. The design correctly keeps its stronger decisions separate.
- `firstTouchAdvice` currently acknowledges before return. Its contract must change coherently across all callers so omitted or host-truncated blocks never become acknowledged paths.
- The default Cursor driver strips the original payload down to its current file fields and emits a fixed response envelope outside the managed block. A managed-engine update cannot repair an unsupported output field by itself. Upgrade feasibility therefore depends on the transport result, not only on preserving the entry-point name.
- A shell warning intentionally consumes the first-touch record used by deny mode. This is explicit in the draft and follows the owner's shared-reminder choice; preserve both call orders in verification rather than silently introducing separate authorization state.
- Runtime output limits differ by host. A 64 KiB application budget is insufficient evidence that complete blocks reached the model.

## PoC Approach

Use one disposable workspace and a harmless sentinel-file edit per available host. Have the pre-tool hook emit a unique marker asking the model to record that marker before modifying the sentinel. Inspect the host event/transcript ordering and final file state to distinguish hook execution, model receipt and a model opportunity before execution. Test Cursor's edit `additional_context` and shell `agent_message` routes separately; test Codex's documented context route. Do not substitute a JSON-only harness for a live result. Record unavailable hosts as blocked. Separately exercise a response just below and above each documented output threshold to confirm which complete blocks remain visible. The spike changes no production source, installs nothing and does not weaken guards. Existing generated-hook fixtures provide the later implementation verification, not proof of live delivery timing.

## Unknowns & Blockers

1. **Live transport timing and visibility:** Can the currently installed Cursor edit and shell channels and Codex context channel provide the model an opportunity to consume the reminder before the same file edit proceeds? The docs establish shapes but not all of the required ordering. A live trace with a harmless sentinel settles this. If unavailable, retain an unverified coverage boundary rather than claim support. Claude's documented next-request timing is already a source-resolved limitation, not a claim the spike should try to assume away.
2. **Output truncation:** Which complete per-file blocks are visible under the selected host/version's response limits? Source documents spilling, but the visible payload and ordering for a representative batch require an actual host run. The implementation must use a conservative host delivery budget even if this experiment is blocked.

These justify `Spike: true`. Missing matcher names, adapter payload fields, existing driver ownership and the installed authoring path resolve through source/documentation and do not require experimental code.

## Verdict Reasoning

`CONCERNS`: the core architecture is feasible and reuses the right repository components. Four addressable caveats remain: the before-edit delivery contract is not established across the assumed transports; the common output budget can exceed host visibility limits; the tool inventory still omits known documented write surfaces; and the default-driver upgrade claim depends on a possibly unsupported Cursor envelope. None requires file-type-specific rules, a new runtime package, new shell blocking or an automatic migration. The accepted host-gap allowance permits an honest bounded design once those cases are made explicit.

## CRITICAL

1. **Separate hook timing from model timing and finalize the host coverage table.** Claude's documented context timing already contradicts treating `PreToolUse` emission as proof that the model saw the advisory before the pending edit. Cursor's allow-path edit field is not in its current documented pre-tool output. Resolve these as explicit supported/unverified/unsupported boundaries using the sources and spike above. Preserve the owner's no-new-blocking choice; do not use a post-tool hook as a replacement. [Claude hooks](https://code.claude.com/docs/en/hooks#add-context-for-claude), [Cursor hooks](https://cursor.com/docs/hooks).

2. **Budget for host-visible complete blocks before acknowledgement.** Claude spills context above 10,000 characters to a file with only a short preview; Codex defaults to roughly 2,500 tokens and can provide a truncated preview if spilling fails. The proposed 64 KiB budget can therefore acknowledge advice the model did not receive in full. Define a conservative per-host budget or verified host configuration, reserve room for the uncertainty notice, and leave every omitted/truncated target unacknowledged. This also requires changing the current record-before-return `firstTouchAdvice` seam. [Claude context limits](https://code.claude.com/docs/en/hooks#add-context-for-claude), [Codex large hook output](https://learn.chatgpt.com/docs/hooks#large-hook-output).

3. **Replace the deferred inventory audit with explicit known tool changes and gaps.** Cursor documents `Delete`, and Antigravity documents `multi_replace_file_content`; their current bkit matchers and accepted-tool sets omit them. Include their payload extraction alongside registration. Record Codex `write_stdin` as a hook coverage boundary. Claude's unanchored `Edit|Write|MultiEdit` matcher already matches the `Edit` substring in `NotebookEdit` under the documented regex semantics, while its adapter rejects that tool; explicit registration is still useful, but the adapter is the decisive repair. [Cursor tool matchers](https://cursor.com/docs/hooks), [Antigravity supported tools](https://antigravity.google/docs/hooks#supported-tools), [Codex tool coverage](https://learn.chatgpt.com/docs/hooks#tool-coverage), [Claude matchers](https://code.claude.com/docs/en/hooks#matcher-patterns).

4. **State the upgrade outcome for the default Cursor driver, not only custom drivers.** `.bkit/core/.cursor/hooks/bkit-gateguard.cjs` emits `additional_context` in consumer-owned code. If the live probe confirms this route does not deliver, changing the managed engine cannot fix the default installed driver while preserving its output contract. Apply-review must identify the exact affected default install and its safe manual wiring/coverage boundary, or present a specific migration proposal for owner approval. Do not imply that every default upgrade receives equivalent behavior merely because its shared block updates.

## OPTIONAL

- Specify a small positive read-only grammar with examples for Python and Node. This keeps “unknown” useful and prevents future additions from treating any unrecognized statement as harmless.
- State the regular-file read bound as an I/O bound, including replacement races and special files, rather than only a source-length limit after allocation.
- Keep the same shared general advisory text but permit host-specific batching limits; parity concerns content and classification, not an identical maximum response size.

## OUT OF SCOPE

Automatic file-kind rule selection remains deferred under the owner's explicit choice. Full language analysis, new shell denial/approval policy, new post-tool checking, arbitrary custom/MCP tool effect inference and unapproved driver migrations are outside this design. The host inventory should describe these boundaries without treating them as permission to expand the feature.
