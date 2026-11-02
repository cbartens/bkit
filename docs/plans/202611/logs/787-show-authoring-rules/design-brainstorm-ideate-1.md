# Design Brainstorm & Ideas

Lens: Pragmatic — existing code, minimal new infrastructure, fastest to ship.

## Approach A — Extend the shared detector and reuse GateGuard's first-touch engine ⭐ Recommended

Extend the existing shell detector to return known write targets and an explicit unknown-target outcome, then feed known paths through the existing GateGuard engine so shell edits and edit tools show the same checklist and general authoring advisory.

<!-- prettier-ignore -->
| Trade-off | Assessment |
| --- | --- |
| Complexity | `MEDIUM`. The integration is small, but quoted inline programs, heredocs, patch formats and destination arguments need careful static recognition. |
| Extensibility | Add recognition for another command in the shared shell detector. Add a host adapter only where the host uses a different payload or output envelope. |
| Risk | A detector can mistake a read for a write or infer the wrong target. Preserve uncertainty explicitly rather than asserting a path from an arbitrary string literal. |
| Maintenance | One detector, one advisory formatter and one file-touch record remain shared. Extend the existing generated-hook parity tables with examples that cross shell and edit-tool calls. |
| Reuse vs new | Extend `guardrails-shell.js`, `gateguard-engine.js`, the existing payload adapters, host templates and `render/parts.ts` composition. New behavior consists of write-target evidence and the bridge to `firstTouchAdvice`; no runtime dependency, service, configuration flag or separate hook is needed. |

### Existing seams and the bounded extension

- `.bkit/core/hooks/guardrails-shell.js:162-204` already contains `shellEditTargets` and `shellEditAdvisory`. Its current hits are human descriptions, not usable file targets. Replace that internal result with structured evidence carrying the known affected paths and whether a possible write remains unresolved. Update its callers together rather than keeping competing detectors.
- The same file already supplies `commandWords`, `commandLines` and `redirectTargets`. Extend its lexical handling before using it for inline Python or Node: the current `shellSegments` splits on semicolons and newlines without respecting quotes or heredoc bodies. A quoted Python program must stay one argument, and a heredoc body must stay associated with its interpreter invocation.
- Recognize direct destinations for redirection, `tee`, in-place editors including `ruby -i`, `cp` and `mv`, and patch targets when the command provides enough literal evidence. For `mv`, both removal of the old path and creation or replacement of the new path are affected writes. Directory copies, computed names, unresolved working-directory changes and patches supplied through unknown input produce the unknown-target warning rather than speculative traversal or invented file paths.
- Recognize common literal write forms in inline Python and Node programs, such as a literal path supplied to a write API or an `open` call with a write mode. A named script invocation is itself detectable. Resolve its targets only when bounded static inspection establishes them; otherwise use the unknown-target warning. Do not execute, import or evaluate the script to discover its behavior.
- Exclude only command forms that the detector can positively classify as read-only. An unreadable script or an unsupported language construct is uncertainty, not evidence of a read-only script. Keep the existing quiet behavior for scratch sinks and log capture.
- `.bkit/core/hooks/gateguard-engine.js:199-230` already chooses the investigation, new-file or gate-config checklist and records the first touch. Render that same engine into shell guardrails through the existing part mechanism and use its returned context for each known target. Shell delivery stays advisory even when the engine returns the existing edit-tool deny mode; do not mutate environment variables or add shell blocking.
- Share a normalized absolute path identity between the shell bridge and edit adapters, using the command's effective working directory or the host's workspace context. Preserve the existing session and agent scope through `dedupKey`. Unknown targets do not consume the touch record for any guessed file.
- Extend the agent-read path predicate enough to reach the scope named by the issue, rather than retaining the current `isDocsPath` restriction to markdown under `docs/` outside plans. Use one general authoring advisory for all matching files and both edit methods. It may direct an editor to the authoring document's applicability table; this change does not select or quote different sections for individual file kinds.
- `.bkit/core/hooks/guardrails-tiers.js:274-285` currently returns one winning tier, and fetch classification precedes shell-edit classification. Keep destructive and secret protections intact while ensuring an allowed compound command can receive both its applicable existing warning and shell-edit advice. Do not let a fetch in the same command silently mask an edit.

### Consumer delivery and host boundaries

`render/parts.ts` splices shared code into standalone generated hooks. Keep this model: the hook should not load the bkit package or a Python or JavaScript parser at runtime. The shared engine is copied code generated from one source, which is the existing architecture, not another implementation to maintain.

The issue's authoring-document discovery concern is resolved by existing installation code. `.bkit/core/engine/install/modules/core.ts:257-335` includes `authoring.md` in `BKIT_CANONICAL_DOCS`, and `runBkitDocs` mirrors it into the consumer's `.bkit/`. A generic advisory can point at `.bkit/authoring.md` without a package resolver or runtime file read.

Audit each host's edit matcher and payload extractor together. Adding `NotebookEdit` to a matcher alone is insufficient because `gateguard-edit-payload.js` currently accepts only `Edit`, `Write` and `MultiEdit` and extracts only `file_path` or `path`. Verify the notebook path field and add the corresponding adapter. Apply the same check to the other hosts' documented edit surfaces.

Keep host delivery claims precise. The shipped OpenCode plugin explicitly documents advisory delivery in its after-execute hook and says its terminal tool is not guarded. Antigravity currently delivers advisories by denying once and allowing an identical retry. These are existing host limits, not permission to claim that every host shows a default advisory before an edit. The design should carry sourced boundary notes after checking current upstream contracts, and add before-execution coverage only through a delivery channel the host actually supplies. Do not introduce a new OpenCode shell subsystem merely to manufacture nominal parity where this workflow's scope is the hosts that already run the shell guard.

### Rules, headers and evidence

Put each template editor pointer in its existing opening HTML note, inside the managed block. This distinguishes instructions for editing the template from rules for filling it. Add the `Doc Templates` pointer to the shipped authoring rule and clarify that allowed script-edit exceptions still require authoring reads. Keep the generic runtime advisory common across file kinds.

The issue's `lite.md` pointer item is stale: `.bkit/core/engine/install/modules/core.ts` migrates retired lite content, and `core.integration.test.ts` explicitly asserts that installation does not ship `lite.md`. Record the item as inapplicable to the current source tree; do not recreate a retired document or add a migration in this design.

Use the existing generated-hook parity integration suite to verify the behavior as seen by the model. Relevant cases are literal and dynamic script targets, read-only scripts, wrapped commands, quoted semicolons, heredocs, patch input, different working directories, new and existing files, shell-then-edit and edit-then-shell deduplication, off mode, shell behavior under deny mode, and existing failure handling. Validate rules and pointers in a fresh consumer install, including every installed host and every current template, without relying only on source-text assertions.

## Approach B — Add a dedicated shell GateGuard adapter beside guardrails

Register an additional pre-shell hook that owns shell edit detection and delegates to the existing GateGuard engine, leaving the guardrails hook to its current destructive, secret and network checks.

<!-- prettier-ignore -->
| Trade-off | Assessment |
| --- | --- |
| Complexity | `HIGH` relative to Approach A. The detector work remains, and each host gains another registration, driver and installation surface. |
| Extensibility | Shell and direct-edit GateGuard adapters have a clear conceptual home, but every supported host must preserve the extra registration. |
| Risk | Hook ordering and duplicated shell analysis can cause repeated warnings or missed first-touch records. A second hook does not solve a host lacking a before-edit advisory channel. |
| Maintenance | More manifests, hook registrations, consumer composition points and parity adapters must stay aligned. |
| Reuse vs new | Reuses `firstTouchAdvice`, `dedupKey`, the shared shell scanner and part rendering. Adds dedicated hook entry points, drivers and installation wiring that the current shell hooks already provide. |

This is viable only if integrating the existing engines exposes an actual dependency cycle or composition problem. The current shared-part architecture does not show such a need, so the additional surface is not justified for this scope.

## Approach C — None

## Decisions

<!-- prettier-ignore -->
| Decided | Alternatives | Why |
| --- | --- | --- |
| Recommend Approach A. | A dedicated shell GateGuard hook. | The existing shell hook already sees the command before execution and is built from shared parts. Extending it is the shortest route with the fewest consumer-owned interfaces. |
| Follow the owner's Q1 and Q3: one general authoring advisory. | Select authoring sections by file kind for shell edits or edit tools. | The owner explicitly chose reliable detection and simplicity. Record file-kind section selection as future work, rather than including its lookup now. |
| Follow the owner's Q2: warn on possible writes with unknown targets and exclude positively identified read-only forms. | Warn on every script invocation or stay silent without a literal target. | This preserves visibility for opaque scripts while reducing warnings for recognized reads. |
| Reuse GateGuard's first-touch record across edit channels. | Separate shell records or a second checklist formatter. | A file touched by both channels should receive the same advice once within the existing session and agent scope. |
| Treat detection as static evidence with an explicit uncertain outcome. | Execute scripts, infer arbitrary expressions or introduce a full cross-language parser. | A before-execution hook must remain fast, standalone and safe, and unknown-target warnings are an accepted outcome. |
| Keep shell delivery advisory and preserve existing host protections. | Extend `BKIT_GATEGUARD=deny` to shell edits or add after-edit checks. | Both changes are excluded by the issue and accepted interview. |
| Use the already-installed `.bkit/authoring.md`. | Add a package resolver or load authoring documents inside hooks. | `runBkitDocs` already mirrors the reference document to consumers. |
| Treat the retired `lite.md` item as inapplicable. | Recreate it to add a header pointer. | Current installation code and its integration test expressly retire that surface. |
| Put template editor pointers in opening HTML notes. | Add them to the filling agent's Rules box. | The pointer governs an editor of the template, while the existing Rules box governs the audit or document produced from it. |
| Document real host delivery limits after upstream verification. | Assert pre-edit parity from installed hook names alone. | Existing OpenCode advisory delivery occurs after execution, and installed registration does not prove a host exposes the needed before-edit channel. |

## Research Boundary

The configured language server is attached to the primary checkout and rejects the task's worktree as ignored. Source findings above use bounded reads from the required worktree after narrow text location. Host delivery statements describe the shipped code and repository provider documentation; current upstream tool names and hook capabilities still require the design review's source verification. No code, implementation plan, runtime configuration, or ledger was changed by this exploration.
