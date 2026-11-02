<!-- bkit:anchor
baseSha: fbc338ac6ab4f5ef01f489fc276dc7e2dff92284
baseRef: origin/dev
bkitVersion: 6.0.0
bkitLatest: 6.0.0
-->
Verdict: PASS
<!-- verdict:end -->


# Design: Reliable edit detection with one authoring advisory

## Related Issues

- [#356 — GateGuard reuse/anti-duplicate advisory for new-file Writes (closed)](https://github.com/cbartens/bkit/issues/356): reuse the existing investigation and new-file checklists.
- [#628 — Add empty-read, shared-checkout and host-shell rules to audit prompt (closed)](https://github.com/cbartens/bkit/issues/628): command inspection must respect the host shell and must not treat an incomplete read as evidence of absence.
- [#521 — OpenCode 2.0 upgrade: GateGuard plugin, subagent tool calls, and DeepSeek agents (closed)](https://github.com/cbartens/bkit/issues/521): the history establishes that a loaded hook and written warning state do not prove the model received an advisory. OpenCode's current after-execute delivery is a material boundary.
- [#518 — GateGuard: widen config-file matching to cover non-JS toolchains (closed)](https://github.com/cbartens/bkit/issues/518): reuse the shared configuration advisory and its cross-host parity coverage.
- [#441 — Enforce shell-as-edit rule; settle the curl/wget divergence (closed)](https://github.com/cbartens/bkit/issues/441): extend the shared shell detector while preserving sanctioned script edits, quiet scratch sinks and existing enforcement tiers.
- [#428 — Doc rule headers invisible to agents grepping doc files (closed)](https://github.com/cbartens/bkit/issues/428): reminders must reach the model through a verified host channel; a hook event alone is insufficient.

## Acceptance Scenario

This is the initial design scenario, based on the owner's accepted interview draft. GateGuard means the hook that shows a per-file investigation checklist and an authoring reminder. Supported before-edit coverage means the model has an opportunity to receive the reminder and perform the authoring reads before the pending edit. A pre-execution hook event alone does not establish that opportunity. The host table below records supported mechanisms, documented limitations and unverified delivery separately; this design does not claim universal before-edit coverage.

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

Inspect directly named local scripts as data only. Accept only regular files whose bounded source is available; do not execute, import, follow imports, run an interpreter, traverse directories or fetch remote code. Establish regular-file status on the opened descriptor and read at most the source-byte limit plus one byte to detect overflow. Do not allocate an unbounded file read and truncate it afterward. Missing files, special files, symlink-dependent resolution and replacement races yield uncertainty; the reader must not wait on a FIFO or device. Unsupported control flow, dynamic calls, missing scripts and inspection limits yield uncertainty. A positive read-only classification requires the entire inspected operation to fit the supported read-only grammar; absence of a recognized writer is not enough.

The initial positive read-only grammar permits literals, comments, local bindings of understood values, direct reads and literal output to the host's standard output. Examples include Python `print('ready')` and `open('docs/a.md', 'r').read()`, and Node `console.log('ready')` and a direct `fs.readFileSync('docs/a.md', 'utf8')` with only the recognized built-in `node:fs` binding. The whole program must fit the grammar. A read followed by a computed call, an unknown import, a subprocess or unsupported control flow remains uncertain. The recognized built-in binding is inspected as syntax; the hook does not load it. Script names such as `check-*` do not establish read-only behavior.

Start with fixed internal limits of 256 KiB of shell command text, 64 KiB per directly named script, nesting depth 3, and 64 exact targets per invocation. Use a 200 ms internal analysis deadline checked between bounded scanning/read operations. Stop further analysis at the first byte, nesting, target or time limit, retain established targets, and emit `analysis-limit` for the remainder. The deadline is a cooperative analysis bound, not a claim that synchronous filesystem I/O can be preempted.

Measure cold-start wall time through every rendered supported host adapter using the maximum-input and unavailable-source cases. The complete response must finish within the smaller of one second and one quarter of that adapter's documented hook timeout; reduce the internal limits if it does not. Record the host version, timeout, elapsed time and complete response size. No supported timing result was measured by the design spike. These limits are internal constants, not user settings.

Batch complete advisory blocks against a host delivery budget before acknowledging any target. The initial Claude budget is 8,000 characters, below its documented 10,000-character spill threshold; the initial Codex budget is 2,000 UTF-8 bytes, conservatively below its documented approximate 2,500-token default. Cursor and Antigravity use a provisional 2,000-byte budget until their actual route is verified. Count the entire added context, including the shell introduction and other composed advice, and reserve 512 characters/bytes inside the applicable budget for uncertainty and output-limit notices. These are conservative design limits, not measured visibility guarantees. OpenCode has no new before-edit advisory budget because its current route does not provide that capability.

Emit only complete per-file blocks that fit. If known targets are omitted, emit `output-limit` with the number of omitted targets and a reminder that authoring reads apply to every edited file. Leave every omitted or host-truncated target unacknowledged. If even one complete block cannot fit, emit the short notice and acknowledge no target. Parity requires the same advisory content and classification, while host batching limits may differ. The spike did not validate any live threshold, so spilled previews and emitted JSON alone never justify a claim of complete model-visible delivery.

### Host and install boundaries

Keep tool registration, target extraction and delivery as separate checks. The review established these concrete changes and coverage boundaries from current primary documentation on 2026-11-02:

<!-- prettier-ignore -->
| Host | Tool/payload coverage | Before-edit delivery status |
| --- | --- | --- |
| Claude Code | Explicitly register `NotebookEdit` and accept its `notebook_path` in the shared adapter. The current unanchored `Edit` regex already matches its name, but the adapter rejects it. Preserve existing `Edit`, `Write` and `MultiEdit` targets. | The documented `PreToolUse.additionalContext` is read on the next model request beside the tool result. Pre-execution emission is supported; an opportunity to perform authoring reads before that same pending edit is not established by this channel. Record this as a documented limitation under default advisory mode. |
| Cursor | Include documented `Delete` alongside existing write/edit surfaces, and extract its documented target field. Exercise matcher and payload together. Keep edit and `beforeShellExecution` adapters separate. | The shipped edit driver emits allow-path `additional_context`, while current `preToolUse` docs describe `agent_message` for denied calls; shell hooks separately document `agent_message`. Both live timing routes are unverified. The spike reached authentication failure and the authenticated retries were rejected before execution. |
| Codex | Preserve `Bash` for shell/unified exec and `apply_patch` target extraction. Record later interactive input through `write_stdin` as outside new `PreToolUse` checks. | `PreToolUse.additionalContext` is documented as model-visible. Timing before the pending edit remains unverified: CLI 0.165.0 completed the scratch edit with zero scratch-hook invocations. That result neither proves nor disproves delivery. |
| Antigravity | Add `multi_replace_file_content` to both matcher and accepted-tool extraction, using its documented target fields alongside existing file tools. | Retain the existing deny-once/retry advisory transport established by the active decision `antigravity-advisories-deny-once`. This design introduces no new shell denial policy. Current docs support decision/reason output; the design spike did not run Antigravity. |
| OpenCode | Preserve existing write/edit/patch coverage and multi-file target extraction. Its shipped plugin does not guard shell tools. | The current V2 plugin delivers advisory text through after-execute result mutation. This is an explicit unsupported boundary for the requested before-edit outcome. Preserve existing behavior; add no post-tool inspection or shell subsystem to claim parity. |

Sources: [Claude context and timing](https://code.claude.com/docs/en/hooks#add-context-for-claude), [Claude matcher semantics](https://code.claude.com/docs/en/hooks#matcher-patterns), [Cursor hook contracts and tool inventory](https://cursor.com/docs/hooks), [Codex hooks and tool coverage](https://learn.chatgpt.com/docs/hooks), [Antigravity hook tools](https://antigravity.google/docs/hooks#supported-tools), and [OpenCode V2 server-plugin hooks](https://dev.opencode.ai/v2/docs/build/plugins/server/). `design-spike.md` records the bounded live attempts and their `BLOCKED` results. Arbitrary custom/MCP tools and interactive input are not inferred from a generic tool name. Patch adapters must extract every known target, rather than stop after the first path.

Keep new behavior inside the managed portions of existing hook entry points wherever possible, so existing shipped drivers continue calling the same entry points. Additive managed matcher updates and shared payload changes cover new tools without replacing consumer-authored code. Fresh installs and upgrades from the existing shipped layout must be checked independently.

The default Cursor installation needs the same caution as a customized driver. In `.cursor/hooks/bkit-gateguard.cjs`, the outer consumer-owned driver selects input fields and emits the `additional_context` envelope. Updating only its managed body cannot establish a supported allow-path delivery field or preserve omitted payload data. Its default edit delivery and equivalent upgrade behavior therefore remain unverified; the spike did not confirm a broken route and no automatic repair is authorized. Document that exact affected path and current envelope in `.bkit/providers.md`. Safe manual wiring guidance begins by checking the installed Cursor version's pre-tool response contract and preserving custom driver text; if it has no verified non-blocking before-edit route, retain the coverage limitation rather than rename a field by guesswork or use denied/post-tool delivery as a substitute. A future required driver migration needs separate owner approval.

A genuinely customized surrounding driver stays consumer-owned. If a managed update cannot carry the improved behavior, name the exact wiring boundary and do not advertise equivalent behavior for that install. Preserve the owner's no-new-shell-blocking decision and existing stronger protections on every host.

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

Retain the existing session and agent scope. Unknown targets never create a wildcard acknowledgement or mark the script filename as an edited file. Warning state is an acknowledgement of a complete block accepted for a verified delivery route; it is not a record that the command succeeded or every write was discovered. An unverified or known-dropped route does not establish that acknowledgement. Sequential calls on verified routes share the warning record. Existing state races may repeat advice; do not claim strict exactly-once behavior across concurrent processes.

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
4. Prepare complete existing checklists and the general authoring advisory without mutating warning state. Select the complete blocks that fit the host's context budget, including the reserved notice space. Emit one uncertainty warning for the invocation's unresolved remainder, saying that GateGuard cannot determine all targets and authoring reads apply to every file actually edited. If the budget omits known targets, also include the `output-limit` notice and omitted-target count.
5. Acknowledge only selected known paths on a route whose complete delivery contract is verified. Refactor the current record-before-return `firstTouchAdvice` seam so preparation, batch selection and acknowledgement occur in that order across all callers. Do not acknowledge omitted blocks, spilled previews, truncated blocks, or an unverified/known-dropped delivery route. For an already supported existing transport, preserve its established reminder semantics while changing this ordering. A state-write error follows the existing in-process fallback and fail-open behavior.
6. Keep shell output advisory under `BKIT_GATEGUARD=deny`. A shell warning counts as the shared first-touch reminder, so a later edit-tool call for the same file does not repeat that reminder or trigger a first-touch denial for it. This preserves the warning-based meaning of the state; deny mode is not a separate authorization record. Existing edit-tool deny behavior remains unchanged for files that have not yet received advice.
7. `BKIT_GATEGUARD=off` suppresses GateGuard checklist/authoring output and state mutation on either channel. Existing shell guardrails enforcement and the independent shell-as-edit explanation retain their contracts.

### Diagnostics and local recovery

Put this compact mapping in the existing `.bkit/providers.md` hook troubleshooting section when the feature is implemented. Use the owning hook's existing bracketed prefix and protocol-safe advisory channel. A JSON-only driver emits one valid response, rather than mixing raw stderr/stdout into its envelope. These are local diagnostic signatures, not a new counter, service or persistent command log.

<!-- prettier-ignore -->
| Signature | Meaning | Recovery and acknowledgement |
| --- | --- | --- |
| `analysis-unavailable` | A directly named source cannot be inspected safely or its working directory is unresolved. | Warn that targets are unknown; proceed under the existing advisory contract. Check the named source/directory separately if needed. Do not acknowledge unknown paths. |
| `analysis-limit` | The byte, nesting, target or time bound stopped inspection. | Retain exact targets already established and warn about the remainder. Keep authoring reads applicable to all edited files. Boundary-case evidence records elapsed time without command contents. |
| `output-limit` | The host budget omitted complete blocks for known targets. | Emit the omitted-target count and general reminder; leave those paths unacknowledged so a later exact edit can warn again. Do not treat the limited batch as complete coverage. |
| `state-fallback` | Warning state is corrupt or unavailable. | Use the existing in-process fallback, allow execution and tolerate repeated advice. Check the existing session/agent state location and permissions; use the documented session-state reset procedure rather than infer delivery from a partial file. |
| `delivery-unverified` | The host's route, project trust or model-visible timing has not been established. | Check event registration, tool payload, project trust and the host/version capability table. Retain the stated coverage limit and no new acknowledgement; a fixture response is not a live-delivery proof. |
| `driver-wiring` | A preserved driver has incompatible input or response wiring, including the default Cursor envelope boundary. | Compare that exact driver with the current documented host contract while preserving custom text. State the limitation when no supported route exists; do not overwrite consumer code or invent a field. |

Only safe reason codes, host/event labels, counts and necessary target display paths are included. Omit raw commands, inline source and environment values. If the transport itself cannot display a diagnostic, document that limitation rather than claim a runtime notice was delivered. `BKIT_GATEGUARD=off` remains an existing local mitigation for advice problems and does not disable independent shell protections.

### Rules and template headers

Extend the shipped `Authoring` rule to name `Doc Templates` for templates. Clarify the shipped `Edit tools` exception: generated-file and bulk-rewrite exceptions do not waive per-file authoring reads. Use the existing shared-instruction tooling so copies remain aligned.

Add a template-editor pointer to each current `.bkit/core/docs/templates/*.md` opening HTML note, inside its managed block. The pointer directs the editor to the applicable authoring sections and remains separate from the filling agent's Rules box. Keep pointers in prompt and workflow headers and bkit-repo-only project-rule changes outside this feature, as the issue specifies. The retired `lite.md` needs no edit.

### Evidence expected from implementation

Extend the existing rendered-hook corpus with positive, read-only and uncertain cases for every command family; nested/wrapped commands; quoted separators; heredocs; compound fetch/edit commands; changed working directories; moves and multi-file patches; first-touch deduplication in both call orders; multiple agents; off and deny modes; analysis limits; state failures; and truncated target batches. Exercise output-limit omission separately from analysis uncertainty, asserting the omitted count, complete blocks and absent acknowledgements. Measure the cold-start timing and complete response size against the bounds above. Matchers and payload extraction must be exercised together, including `NotebookEdit`, Cursor `Delete`, Antigravity `multi_replace_file_content` and multi-file patches. Fresh consumer installation and upgrade from the existing shipped hook layout must show the behavior on disk, including template pointers and preserved default/customized driver text. Record the Cursor response-envelope limitation explicitly; an updated managed block alone is not equivalent-delivery evidence. This section names verification obligations, not an implementation plan or a completed test result.

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
| Separate pre-execution emission, model receipt and an opportunity to act before the pending edit. | Count a hook event or generated JSON response as before-edit coverage. | The critical feasibility review and blocked C1 spike require the explicit host status table. This refines the accepted scenario's host-gap allowance without adding blocking. |
| Select complete host-budgeted blocks before acknowledging any target. | Retain record-before-return behavior with a common 64 KiB response limit. | Claude and Codex document lower context thresholds; C2 remains blocked. Conservative per-host limits and an omitted-target notice avoid falsely acknowledging unshown advice. |
| Include the documented missing tools and interactive-input boundary. | Leave tool inventory to an unspecified later audit. | The review identifies Claude `NotebookEdit` payload rejection, Cursor `Delete`, Antigravity `multi_replace_file_content` and Codex `write_stdin` as concrete cases. Matcher and payload coverage are both required. |
| Keep the default Cursor driver and its upgrade outcome explicitly unverified. | Claim a managed-body update repairs its consumer-owned output envelope. | C1 did not establish delivery or failure. The design names the affected path and safe wiring boundary without authorizing a migration. |
| Use bounded descriptor reads, a small positive read-only grammar, measured timing bounds and safe local recovery signatures. | Unbounded read-then-truncate, absence-of-writer classification, or a new monitoring subsystem. | These review improvements fit the accepted bounded advisory architecture and make failures diagnosable. |

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

- **Host delivery evidence:** The reviewed host table is the current evidence boundary. Claude's next-request timing is a documented limitation, Cursor and Codex live timing remain unverified, and OpenCode's current advisory route is after execution. Antigravity retains its established deny-once transport. No unverified claim is presented as owner approval or full before-edit coverage.
- **Parser regression:** The shared shell lexical helpers also support fetch and enforcement recognition. A richer scanner must retain those behaviors. Unsupported syntax yields uncertainty for the advisory, not a weakened enforcement verdict.
- **Runtime limits:** The proposed internal limits and cold-start acceptance bounds require implementation evidence. Reading a non-regular file, following imports or executing code is outside the analysis boundary even if it would yield a path. Cooperative time checks do not guarantee preemption of a stalled synchronous filesystem call.
- **Delivery acknowledgement:** A generated response fixture proves the adapter's output, not that a live host showed it to the model. Preparation, batching and acknowledgement must remain distinct. Unverified routes and omitted/truncated blocks do not suppress a later reminder.
- **Concurrency:** Existing read-modify-write warning storage can repeat advice during races. The feature's deduplication claim is sequential within a session/agent scope; it must not be advertised as transactional exactly-once delivery across processes.
- **Upgrade compatibility:** Default and customized drivers need separate installation evidence. The default Cursor outer driver emits `additional_context`, and a managed-body update does not validate or repair that envelope. Retain its stated limitation until verified; a necessary change outside managed ownership needs safe wiring guidance or a separately approved migration.
- **Secrets:** Safe reason codes and target paths are sufficient diagnostic output. Avoid command bodies, script source and environment values in output and state.

### Open Question 1 — Unsettled live delivery and Cursor upgrade outcome

Can a trusted Codex hook session and separately authorized Cursor edit/shell sessions establish that the model can read and act on the advisory before the pending edit, and that the default Cursor envelope carries it? C1 is `BLOCKED`: the Codex scratch hook fired zero times, and Cursor did not reach an authenticated session. Neither claim was disproven. The automatic approval reviewer rejected authenticated Cursor retries because the design request did not authorize sending the confined workspace prompt/data to the external Cursor destination. No further retry is part of this design run.

Options: A) Continue with the explicit unverified coverage boundaries and preserve current driver ownership — the core detection design can proceed without claiming live delivery. · B) Arrange a separately authorized and trusted live-host verification round before claiming coverage — this can settle timing and the default Cursor envelope, but requires the missing host setup and explicit Cursor destination/data approval.

Recommended: A) Continue with explicit boundaries, because the accepted scenario allows sourced host gaps and the probe did not establish a compatible live route.

Default if unanswered: A) Keep Cursor/Codex timing and the default Cursor upgrade outcome unverified; authorize no external probe or migration by silence.

### Open Question 2 — Unsettled complete-block visibility

Which complete advisory blocks remain visible around the actual host/version output thresholds? C2 is `BLOCKED` because no live scratch advisory hook ran, so no below/above-threshold visibility experiment took place. The common 64 KiB budget is not validated.

Options: A) Use the conservative per-host budgets and reserve/acknowledgement rules in this design — this bounds output using documented limits while retaining unverified visibility status. · B) After a live route is verified, measure its threshold behavior before increasing or claiming validated delivery budgets — this supplies stronger evidence but depends on resolving the live-session prerequisites.

Recommended: A) Use conservative budgets now, because their purpose is to avoid oversized responses while actual visibility remains unverified.

Default if unanswered: A) Keep the conservative limits, leave omitted/truncated/unverified blocks unacknowledged, and make no measured visibility claim.

These are unsettled technical verification questions with conservative defaults, not a request for the owner to guess host facts. The design preserves Q1/Q3 and the prohibition on new shell blocking whichever later evidence is obtained.

## Suggested Workstreams

### WS-1: Bounded shell and script edit recognition

#### Scope

Extend the shared shell recognition path and its enforcement consumers to preserve quoting, nested commands and heredocs while producing the transient `targets`, `unknown` and `readOnly` evidence. Cover every command family in Recognition coverage, the positive read-only grammar, exact working-directory/path normalization, mixed known/unknown writes and existing quiet sinks. Keep directly named script inspection bounded to safe regular-file reads, enforce the analysis limits and deadline, and preserve stronger destructive-command, secret-read and fetch protections. This workstream owns the detector-side parser, runtime and secret-safe uncertainty risks without adding a runtime dependency or executing inspected code.

#### Requires

[]

#### Rationale

Lexical recognition and evidence classification are one shared contract used by the shell guards. Their safety and uncertainty semantics must agree before callers consume richer target information.

### WS-2: Shared advice preparation, batching and warning state

#### Scope

Extend the existing GateGuard formatters and agent-read-file predicate to provide the same general authoring advisory for shell and edit-tool targets. Consume the WS-1 evidence through the shared advice path, retaining the investigation, new-file and configuration checklists. Separate preparation, host-budgeted selection and acknowledgement; reserve notice capacity, report omitted known targets and leave omitted, truncated, unknown or unverified-delivery targets unacknowledged. Normalize warning identity across channels in the existing session/agent scope. Preserve sequential deduplication, state fallback, concurrency limits, `off` behavior and the accepted shell-advisory/deny-mode interaction. Use the reviewed conservative host budgets while Open Question 2 remains unverified.

#### Requires

[WS-1]

#### Rationale

Advice content, complete-block selection and warning acknowledgement jointly determine whether the shared record truthfully represents a delivered reminder. They belong to the existing GateGuard engine rather than separate shell or host implementations.

### WS-3: Host payload coverage and managed delivery integration

#### Scope

Integrate the shared detector/advice contracts through the existing rendered host hooks and matcher/payload adapters. Include Claude `NotebookEdit` and `notebook_path`, Cursor `Delete`, Antigravity `multi_replace_file_content`, existing Codex shell/patch targets and complete multi-file patch handling. Preserve each existing delivery mechanism, stronger shell decisions and the no-new-blocking/no-after-edit-check boundaries. Carry the reviewed host capability table into the delivered behavior: distinguish pre-execution emission, model receipt and an opportunity to act before the pending edit. Retain Codex interactive-input and OpenCode before-edit coverage limits. Preserve consumer-owned drivers, including the default Cursor input/output envelope, and keep its delivery/upgrade outcome unverified under Open Question 1's default. No live-host retry, external destination authorization or driver migration is implied by this workstream.

#### Requires

[WS-1, WS-2]

#### Rationale

Tool registration, target extraction, response envelopes and managed rendering must agree for any host to receive the shared behavior. Host-specific limits are part of this integration boundary and cannot be repaired by detector changes alone.

### WS-4: Shipped authoring pointers and operational guidance

#### Scope

Update the shipped Authoring and Edit tools rules and their shared wording so template editing names `Doc Templates` and script exceptions retain authoring-read obligations. Add editor pointers to every current template opening HTML note while preserving the filling-agent Rules boxes. Use the already installed `.bkit/authoring.md`; retain the retired `lite.md` outcome. Update the canonical provider/hook guidance with the sourced coverage table, safe diagnostic/recovery signatures, conservative analysis/output limits, default/customized driver ownership and exact Cursor wiring limitation. Preserve both open verification questions and their defaults, the accepted decisions and the existing future-work record for file-type-specific advisories. Keep prompt/workflow header pointers and repo-only rules outside scope.

#### Requires

[WS-3]

#### Rationale

The authoring reminders and operator guidance are shipped text whose accuracy depends on the integrated host behavior. They form the consumer-facing explanation of the same release, including its explicit evidence limits.

### WS-5: Rendered-hook and consumer-install evidence

#### Scope

Extend the existing behavioral, parity and install fixtures to cover the complete Evidence expected from implementation section. Establish recognition positives/readers/uncertainty, enforcement preservation, both cross-channel call orders, identity scope, off/deny behavior, state failures, complete-block batching and omitted-target acknowledgement. Measure cold-start timing and response size against the reviewed bounds. Check fresh installs and upgrades on disk, including current template pointers, preserved default/customized driver text and explicit Cursor limitations. Confirm shared advisory content and classification across host adapters while respecting different batching budgets. Keep fixture output distinct from live model visibility; carry C1/C2 and Open Questions 1/2 as unverified wherever their authorized prerequisites remain unavailable. No external probe or migration is authorized by this evidence workstream.

#### Requires

[WS-1, WS-2, WS-3, WS-4]

#### Rationale

The deliverable is the behavior of installed, rendered hooks and shipped guidance. Integrated evidence must cover that combined footprint; isolated detector or formatter checks cannot establish the consumer outcome.

## Suggested Plans

### P-1: Reliable edit detection with one shared authoring advisory

#### Deliverable

Ship the bounded shared shell/script detector, unified checklist/advisory and warning-state flow, documented host payload coverage, consumer authoring pointers and operational guidance as one verified package change. Preserve the conservative defaults and explicit unverified host boundaries from Open Questions 1 and 2. The workstreams share changed call contracts, rendered artifacts and consumer-install verification, so they form one release and rollback unit rather than independently releasable features.

#### Covers

[WS-1, WS-2, WS-3, WS-4, WS-5]

#### Requires

[]
