# Design: Reliable edit detection with one authoring advisory

## Related Issues

- [#356 — GateGuard reuse/anti-duplicate advisory for new-file Writes (closed)](https://github.com/cbartens/bkit/issues/356): reuse the existing investigation and new-file checklists.
- [#628 — Add empty-read, shared-checkout and host-shell rules to audit prompt (closed)](https://github.com/cbartens/bkit/issues/628): command inspection must respect the host shell and must not treat an incomplete read as evidence of absence.
- [#521 — OpenCode 2.0 upgrade: GateGuard plugin, subagent tool calls, and DeepSeek agents (closed)](https://github.com/cbartens/bkit/issues/521): the history establishes that a loaded hook and written warning state do not prove the model received an advisory. OpenCode's current after-execute delivery is a material boundary.
- [#518 — GateGuard: widen config-file matching to cover non-JS toolchains (closed)](https://github.com/cbartens/bkit/issues/518): reuse the shared configuration advisory and its cross-host parity coverage.
- [#441 — Enforce shell-as-edit rule; settle the curl/wget divergence (closed)](https://github.com/cbartens/bkit/issues/441): extend the shared shell detector while preserving sanctioned script edits, quiet scratch sinks and existing enforcement tiers.
- [#428 — Doc rule headers invisible to agents grepping doc files (closed)](https://github.com/cbartens/bkit/issues/428): reminders must reach the model through a verified host channel; a hook event alone is insufficient.

## Acceptance Scenario

This is the initial design scenario, based on the owner's accepted interview draft. GateGuard means the hook that shows a per-file investigation checklist and an authoring reminder. Supported coverage means a host provides a verified channel that reaches the model before the edit; the host capability audit records any unavoidable exception.

### Narrative

When an agent edits an agent-read file, I want the authoring reminder to appear before the edit, including edits made through shell commands or scripts. I want one general advisory across edit methods and supported hosts, keeping this change focused on reliable detection.

### Success Criteria

1. The shell check detects the script and command edit forms listed in the issue before execution, reporting exact targets where established and uncertainty elsewhere.
2. Known targets receive the existing per-file checklist and the same general authoring advisory used by edit tools, sharing the once-per-file warning record.
3. Scripts that might write to unknown targets receive a warning that their targets cannot be determined and authoring reads still apply. Clearly read-only commands are excluded.
4. Every supported host's edit tools are covered where hooks allow it; unavoidable gaps are documented with primary sources and the observed delivery boundary.
5. Consumer installs receive the hook improvements and applicable rules/header pointers. File-type-specific advisories are recorded as future work.

### Key Edge Cases

- Computed script targets cannot always be determined before execution. A command can have both known targets and additional unknown writes.
- A file touched through both shell and edit tools should not receive duplicate first-touch advice within the same session and agent scope.
- Parallel calls and unavailable state can produce repeated advice; they must not falsely acknowledge an unshown target.
- A hook failure retains the existing fail-open behavior: the hook does not stop the command because its analysis failed.
- This change adds no shell blocking, after-edit checks or file-type-specific rule selection. Existing host delivery mechanisms and stronger shell protections retain their contracts.
- Some hosts cannot deliver a default advisory before an edit. Such a host is an explicit coverage exception, not a reason to count an after-edit result as before-edit coverage.

### Process Sketch

- WHEN an edit tool first touches a file → THEN show its checklist and the general advisory before the edit on hosts with that channel.
- WHEN a shell edit has known targets → THEN show the same advice for each target not already recorded.
- WHEN a script might write but its targets are unknown → THEN warn about that uncertainty and the required authoring reads.
- WHEN a command is clearly read-only → THEN omit the shell-edit warning.
- WHEN a host cannot intercept an edit method and deliver the reminder before execution → THEN document the supported boundary.

## Reuse & Prior Art

<!-- prettier-ignore -->
| Capability | Prior art | Verdict | Why |
| --- | --- | --- | --- |
| Shell command recognition and target evidence | `.bkit/core/hooks/guardrails-shell.js`: `shellEditTargets`, `commandLines`, `shellWords`, `redirectTargets`; `.bkit/core/hooks/guardrails-tiers.js`: `classifyShell` | EXTEND | One shared detector already runs in each shell guard. Replace its description-only internal result rather than create a competing detector. |
| Per-file checklist and general authoring reminder | `.bkit/core/hooks/gateguard-engine.js`: `firstTouchAdvice`, investigation/reuse/configuration formatters, `docAuthoringAdvisory` | EXTEND | Preserve checklist selection and one advisory text source. Widen the agent-read-file predicate without selecting sections by file kind. |
| Warning identity and storage | `gateguard-engine.js`: `dedupKey`, `alreadyWarned`, `markWarned`, in-process fallback and existing temporary state | EXTEND | Shell and edit tools need the same path identity and warning record. A second shell map would repeat warnings. |
| Standalone generated hooks | `.bkit/core/engine/render/parts.ts`: `renderParts`, `readTemplate`; existing host hook templates | EXTEND | Shared parts are already rendered into standalone hooks. Consumers need neither the package nor a language parser available at hook runtime. |
| Host edit payloads and patch targets | `.bkit/core/hooks/gateguard-edit-payload.js`, Codex payload adapter and the OpenCode plugin's patch handling | EXTEND | Matchers and payload extraction must evolve together; existing multi-file patch parsing is prior art for literal shell patch input. |
| Consumer authoring document | `.bkit/core/engine/install/modules/core.ts`: `BKIT_CANONICAL_DOCS`, `runBkitDocs` | EXTEND | The installed consumer already has `.bkit/authoring.md`. A runtime package resolver or rule-section extraction is unnecessary. |
| Template-editor and shared rules pointers | `.bkit/core/.agents/rules.md`, `.bkit/core/docs/templates/*.md` opening notes, `.bkit/instructions.md` shared clauses | EXTEND | Extend their existing ownership and rendering contracts. The opening note is for template editors; the Rules box remains for agents filling the template. |
| Behavioral verification | Existing `audits/hooks` GateGuard, guardrails, parity and dogfood suites; install integration fixtures | EXTEND | Exercise the actual rendered hooks and existing consumer upgrades rather than only assert that strings occur in sources. |

The package declares no runtime dependencies. Node's existing filesystem and path facilities are sufficient for bounded local source inspection and target normalization. The ecosystem alternative is a shell parser plus language-specific syntax-tree analysis; it still cannot establish arbitrary dynamic script effects and would change the standalone hook footprint. No new architecture component or runtime dependency is proposed.

## Architecture

### Shared responsibilities

Keep the existing sequence of shared parts and host adapters. The shared shell code recognizes possible edits; the GateGuard engine builds per-file advice and manages warning identity; the host adapter delivers one result through its established channel. Rendering remains build/install work, with no package lookup or subprocess in the live hook.

Replace `shellEditTargets`'s human-description list with structured evidence that retains both exact targets and unresolved possible writes. Update all its callers together. Do not retain an old detector beside a new script detector. The user-facing shell explanation may remain a short introduction, but the per-file checklist and general authoring advisory come from GateGuard's existing formatters.

Give `firstTouchAdvice` and its edit adapters a common normalized path identity. Its context remains the existing investigation, reuse or configuration checklist, followed by one general authoring advisory for an agent-read file. The general advisory directs the editor to `.bkit/authoring.md` and its `Which Sections Apply` table; it does not choose or quote different sections. Agent-read matching covers files below `.agents/`, `.bkit/` and `docs/`, plus `AGENTS.md`, `CLAUDE.md` and `GEMINI.md`, matching the authoring document's stated scope. Plan artifacts retain their own template contract; the general authoring reminder does not replace it.

### Static inspection boundary

Use bounded lexical scanning that preserves quote context, escaped separators, nested shell commands and heredoc association. The current separator-first splitter is not sufficient for `python3 - <<EOF` or an inline program containing a quoted semicolon. Shared lexical changes must preserve the stronger destructive-command and secret-read recognizers; they must not reinterpret an unrecognized command as allowed by a protection that currently denies it.

Inspect directly named local scripts as data only. Accept only regular files whose bounded source is available; do not execute, import, follow imports, run an interpreter, traverse directories or fetch remote code. Unsupported control flow, dynamic calls, missing scripts and inspection limits yield uncertainty. A positive read-only classification requires the entire inspected operation to fit the supported read-only grammar; absence of a recognized writer is not enough.

Start with fixed internal limits of 256 KiB of shell command text, 64 KiB per directly named script, nesting depth 3, and 64 exact targets per invocation. These are implementation constants, not user settings. Hitting a limit preserves already established targets and produces one `analysis-limit` uncertainty warning for the remainder. Emit only complete per-file advisory blocks within a 64 KiB advisory budget; do not record a target whose block was omitted. Review may adjust these initial limits from measured hook behavior without expanding the analysis boundary.

### Host and install boundaries

Audit documented edit tools, matcher names, input fields and model-visible delivery separately for Claude, Cursor, Codex, Antigravity and OpenCode. Claude's `NotebookEdit` needs both matcher registration and extraction of its documented notebook path. An added name that the adapter rejects is not coverage. Patch adapters must handle all known targets, not only the first path.

The checked-in OpenCode plugin says its advisory is delivered through the after-execute result and its shell tool is not guarded. Antigravity's existing advisory transport denies once and allows an identical retry. Preserve the owner's no-new-shell-blocking decision and the existing transport contract. Current official host documentation and any focused probes in review decide the final coverage table. No new OpenCode shell subsystem, after-execute inspection or denial policy is included merely to claim parity. Document a sourced unsupported boundary when no compatible before-edit channel exists.

Keep new behavior inside the managed portions of existing hook entry points wherever possible, so existing shipped drivers continue calling the same entry points. Additive managed matcher updates and shared payload changes cover new tools without replacing consumer-authored code. Fresh installs and upgrades from the existing shipped layout must be checked independently. A genuinely customized surrounding driver stays consumer-owned; if current delivery cannot be carried by a managed change, surface the precise wiring requirement rather than silently overwrite it or introduce an unapproved migration.

`runBkitDocs` already mirrors `.bkit/authoring.md` into consumers. The issue's `lite.md` item is inapplicable: it has been retired and installation migrates it away. Do not recreate it.

## Data Model

No database or durable project schema changes are needed. The hook uses existing temporary warning state and a proposed transient detection result within the shared shell part.

<!-- prettier-ignore -->
| Transient field | Meaning |
| --- | --- |
| `targets` | Ordered, unique exact affected paths, with operation evidence and pre-execution existence when established. |
| `unknown` | Safe reason codes for possible additional writes, independent of whether `targets` is empty. |
| `readOnly` | Positive classification for a fully understood read-only operation; never a default after target extraction fails. |

Reason codes distinguish computed targets, unavailable script source, unsupported syntax, unresolved working directory and analysis limits. They are diagnostic categories, not a new telemetry service. Do not persist command text, inline source or environment values. File paths are display data and must not be reinterpreted as code or instructions.

Normalize literal paths against the tool's effective working directory, using supported literal directory changes inside the command. Workspace roots locate the repository and its authoring document; they do not replace a command's explicit working directory. Unsupported directory changes, variables, globs and unknown directory destinations remain unresolved rather than becoming guessed paths. Normalize absolute/relative spelling consistently in both edit channels; do not follow arbitrary symlinks to infer script effects.

Retain the existing session and agent scope. Unknown targets never create a wildcard acknowledgement or mark the script filename as an edited file. Warning state means that advice was emitted, not that the command succeeded or that every write was discovered. Sequential calls share the warning record. Existing state races may repeat advice; do not claim strict exactly-once behavior across concurrent processes.

## Components / Flows

### Recognition coverage

<!-- prettier-ignore -->
| Command family | Exact evidence | Uncertainty and quiet cases |
| --- | --- | --- |
| `>` / `>>`, `tee` | Literal destination operands that identify source or agent-read files | Quoted `>` remains text. Existing scratch, environment and log sinks stay quiet. Computed possible source destinations stay unknown. |
| `sed -i`, `perl -i`, `awk -i inplace`, `ruby -i` | Literal input paths that the command rewrites | Resolve supported argument forms; variables, globs and ambiguous operand roles remain unknown. Preserve sanctioned bulk rewrites. |
| `cp`, `mv` | An exact destination file; `mv` also affects the exact source path | Existing literal directory operands can identify a simple file destination only when unambiguous. Recursive copies and unresolved directory effects stay unknown; do not enumerate trees. |
| `git apply`, `patch` | Targets in bounded literal patch input or a directly named regular patch file, with supported strip/directory options applied | Unknown stdin, unsupported patch formats/options or computed patch paths stay unknown. Include additions, removals and moves; inspect no diff after execution. |
| Inline Python and Node | Bounded, recognized write operations whose target literals and modes are established, including attached heredoc bodies | Computed paths, dynamic calls, imports and unsupported syntax stay unknown. A mention of a writer in a quoted string or comment is not a write. |
| Directly named scripts | Explicit interpreter/script invocations and bounded local source that establishes a literal writer or a positively read-only operation | Missing, oversized, non-regular or unsupported source gets the uncertainty reminder. No filename-based read-only exemptions. |

The recognized command family itself is detected even when exact targets are unavailable. The detector is an advisory aid, not a proof that arbitrary shell or script execution is safe.

### Advisory and state flow

1. The host adapter obtains the command, effective directory and session/agent identity without echoing raw arguments.
2. Existing stronger protections retain precedence. An edit advisory never changes a deny or confirmation decision. For an allowed compound command, a fetch warning and an edit warning may both be emitted; an allowed fetch must not hide a later edit.
3. The shared detector produces known paths plus independent uncertainty. The bridge uses pre-execution existence only for exact targets to choose the current checklist.
4. For each not-yet-warned path, render the complete existing checklist and general authoring advisory. Emit one uncertainty warning for the invocation's unresolved remainder, saying that GateGuard cannot determine all targets and authoring reads apply to every file actually edited.
5. Record only known paths whose complete advisory is included in the host response. Do not acknowledge paths on a delivery route already known to discard advice. A state-write error follows the existing in-process fallback and fail-open behavior.
6. Keep shell output advisory under `BKIT_GATEGUARD=deny`. A shell warning counts as the shared first-touch reminder, so a later edit-tool call for the same file does not repeat that reminder or trigger a first-touch denial for it. This preserves the warning-based meaning of the state; deny mode is not a separate authorization record. Existing edit-tool deny behavior remains unchanged for files that have not yet received advice.
7. `BKIT_GATEGUARD=off` suppresses GateGuard checklist/authoring output and state mutation on either channel. Existing shell guardrails enforcement and the independent shell-as-edit explanation retain their contracts.

### Rules and template headers

Extend the shipped `Authoring` rule to name `Doc Templates` for templates. Clarify the shipped `Edit tools` exception: generated-file and bulk-rewrite exceptions do not waive per-file authoring reads. Use the existing shared-instruction tooling so copies remain aligned.

Add a template-editor pointer to each current `.bkit/core/docs/templates/*.md` opening HTML note, inside its managed block. The pointer directs the editor to the applicable authoring sections and remains separate from the filling agent's Rules box. Keep pointers in prompt and workflow headers and bkit-repo-only project-rule changes outside this feature, as the issue specifies. The retired `lite.md` needs no edit.

### Evidence expected from implementation

Extend the existing rendered-hook corpus with positive, read-only and uncertain cases for every command family; nested/wrapped commands; quoted separators; heredocs; compound fetch/edit commands; changed working directories; moves and multi-file patches; first-touch deduplication in both call orders; multiple agents; off and deny modes; analysis limits; state failures; and truncated target batches. Matchers and payload extraction must be exercised together. Fresh consumer installation and upgrade from the existing shipped hook layout must show the behavior on disk, including template pointers and preserved customized driver text. This section names verification obligations, not an implementation plan or a completed test result.

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Follow Q1 B and Q3 A: one general authoring advisory across shell and edit tools. | A file-kind-to-section lookup, rule extraction or different shell advisory content. | The owner explicitly chose simplicity. File-type-specific advice is outside this change and is recorded for future consideration. |
| Follow Q2 A: warn for possible writes with unknown targets and exclude positively read-only operations. | Warn for every script; warn only for recognized literal writers. | The accepted option balances useful uncertainty against routine reader noise. |
| Use bounded direct-script inspection with explicit uncertainty. | Treat every named script as opaque; introduce full multi-language parsing. | The bounded approach can recover useful literal targets without executing user code or changing runtime dependencies. |
| Preserve known and unknown writes in the same result. | Empty targets means no edits; one generic message replaces all per-file advice. | A partial analysis must not erase exact targets or falsely imply completeness. |
| Share existing checklist formatters and first-touch warning state. | Independent shell checklists and warning maps. | The accepted scenario requires the same advice and no repeat reminder across channels. |
| Keep shell delivery advisory, including under deny mode; a delivered shell reminder consumes shared first-touch state. | Block shell edits; deny an edit tool again after its file already received shell advice. | The owner excluded new blocking and accepted one warning record. Existing deny mode is a first-touch reminder policy, not an authorization boundary. |
| Retain existing stronger shell decisions while composing non-blocking edit context. | Let the winning fetch classification suppress edits or replace enforcement with an advisory. | Detection must improve without weakening the current deny, confirmation and secret safeguards. |
| Adjust the accepted draft's Success Criteria 1 and Key Edge Cases to state the unknown-target fallback and partial analysis explicitly. | Imply exact detection of every effect of arbitrary scripts. | All three explorations identify dynamic targets and unsupported syntax; Q2 already authorizes this fallback. |
| Adjust the accepted draft's Success Criteria 4 and Process Sketch to distinguish interception from visible before-edit delivery. | Count after-edit output, silent allow responses or hook invocation alone as coverage. | The OpenCode and Antigravity evidence shows these are different properties. This follows the draft's existing allowance for unavoidable sourced host gaps. |
| Adjust the accepted draft's Success Criteria 5 to apply only current header requirements. | Recreate `lite.md` to add a pointer. | `BKIT_CANONICAL_DOCS` already ships `authoring.md`; installation explicitly retires `lite.md`. The source tree supersedes stale issue details. |
| Add safe bounded diagnostics without a new telemetry service. | Echo script bodies or commands; add counters/configuration. | Unknown-target reminders need a reason but must not disclose secrets or expand the feature. |
| Extend managed hook entry points and preserve consumer-owned drivers. | Replace customized drivers or add an unrequested migration. | Consumer ownership is a current install contract. Any unavoidable delivery limitation must be explicit. |

## Approaches Considered

<!-- prettier-ignore -->
| Approach | Verdict | Why |
| --- | --- | --- |
| Bounded edit detection feeding the existing shared advisory and state | KEPT | Strong pragmatic and long-term fit. It extends existing seams, covers required command families and makes uncertainty explicit. |
| Treat named scripts as opaque possible writers | MERGED | Its conservative fallback is used whenever bounded inspection cannot establish effects. Making all scripts opaque would unnecessarily warn on simple demonstrable readers and lose useful exact paths. |
| Full shell and multi-language static analysis | REJECTED | Adds parser/runtime footprint and maintenance without resolving dynamic effects. It does not fit the owner's requested simplicity. |

The risk exploration's bounds, delivery checks, safe diagnostics, state acknowledgement rules and upgrade ownership constraints are part of the kept approach rather than a competing architecture.

## Trade-offs Accepted

- Bounded detection gains useful exact-target advice at the cost of uncertainty for unsupported or dynamic programs. It does not promise complete analysis of arbitrary scripts.
- One general advisory gains consistent content and avoids a rule-selection subsystem. The agent still chooses its authoring sections from the applicability table.
- Existing temporary warning state keeps the shared first-touch behavior. Concurrent processes can repeat advice, and a delivered shell reminder intentionally satisfies the same first-touch record used by edit-tool deny mode.
- Current standalone hook rendering avoids runtime package and parser dependencies. Shared parts are repeated in generated outputs by design, while their source remains singular.
- Preserving consumer-owned drivers avoids overwriting custom checks. Fresh-install coverage does not by itself prove upgrade coverage, and genuinely incompatible custom wiring must be named.
- A sourced host limitation is preferable to claiming before-edit behavior through a channel that delivers after the edit. Existing OpenCode behavior remains available, but it cannot satisfy this feature's before-edit criterion on the currently documented implementation.

### Out of scope

- File-type-specific authoring advisories, including automatic section selection or quoting, are deferred by the owner's Q1 and Q3 answers. Future work is recorded under `787-file-type-specific-authoring-advisories` in `docs/deferrals.jsonl`.
- New shell blocking, new after-edit checks, prompt/workflow header pointers and bkit-repo-only project-rule edits remain outside the requested feature. The design preserves existing host transports and stronger safeguards.

## Risks & Open Questions

- **Host delivery evidence:** Review must check current primary host documentation and payloads before the coverage table is final. The current OpenCode plugin source and the related issue's verified history report no non-blocking before-edit context channel. Antigravity's existing deny-once transport is not a new policy introduced here. Any unsupported boundary gets a source and a precise description; no unresolved factual claim should be presented as owner approval.
- **Parser regression:** The shared shell lexical helpers also support fetch and enforcement recognition. A richer scanner must retain those behaviors. Unsupported syntax yields uncertainty for the advisory, not a weakened enforcement verdict.
- **Runtime limits:** The proposed internal limits need measured hook execution evidence. Reading a non-regular file, following imports or executing code is outside the analysis boundary even if it would yield a path.
- **Delivery acknowledgement:** A generated response fixture proves the adapter's output, not that a live host showed it to the model. Source/contract checks and a focused live probe are needed wherever the transport is uncertain. State must not suppress a later reminder after a known dropped message.
- **Concurrency:** Existing read-modify-write warning storage can repeat advice during races. The feature's deduplication claim is sequential within a session/agent scope; it must not be advertised as transactional exactly-once delivery across processes.
- **Upgrade compatibility:** Verify default shipped drivers can call the improved managed entry points without an external driver rewrite. A necessary change outside managed ownership must be surfaced with its specific effect and safe wiring guidance. No migration is authorized by this design.
- **Secrets:** Safe reason codes and target paths are sufficient diagnostic output. Avoid command bodies, script source and environment values in output and state.

There are no outstanding owner questions in this draft. The remaining items are technical evidence for design review, with the accepted host-gap allowance and uncertainty fallback defining their boundaries.
