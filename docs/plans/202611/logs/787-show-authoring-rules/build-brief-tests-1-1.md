# Brief: group 1 — Bounded evidence and shared advice (tests)

Plan: Show authoring rules before every edit Implementation Plan

## Why and what

### Context & Goals

Extend the shared shell detector and GateGuard, the hook that presents investigation and authoring reminders, so exact shell-edit targets use the existing advice and warning identity. Keep uncertain script effects explicit. Ship the shared code, tool coverage and authoring pointers to consumers while preserving stronger shell protections and the accepted host-delivery limitations.

**Workstreams:** WS-1 through WS-5, the whole design. Their dependency order is WS-1 → WS-2 → WS-3 → WS-4 → WS-5. No prerequisite feature plan is required.

**Related Issues:**

- [#787 — Show authoring rules before every edit, including shell edits](https://github.com/cbartens/bkit/issues/787) (open).
- [#356 — GateGuard reuse/anti-duplicate advisory for new-file Writes](https://github.com/cbartens/bkit/issues/356) (closed).
- [#628 — Add empty-read, shared-checkout and host-shell rules to audit prompt](https://github.com/cbartens/bkit/issues/628) (closed).
- [#521 — OpenCode 2.0 upgrade: GateGuard plugin, subagent tool calls, and DeepSeek agents](https://github.com/cbartens/bkit/issues/521) (closed).
- [#518 — GateGuard: widen config-file matching to cover non-JS toolchains](https://github.com/cbartens/bkit/issues/518) (closed).
- [#441 — Enforce shell-as-edit rule; settle the curl/wget divergence](https://github.com/cbartens/bkit/issues/441) (closed).
- [#428 — Doc rule headers invisible to agents grepping doc files](https://github.com/cbartens/bkit/issues/428) (closed).
- [#764 — Map each of the five harms to the hook or deny rule that blocks it](https://github.com/cbartens/bkit/issues/764) (open).

### Narrative

When an agent edits an agent-read file, I want the authoring reminder to appear before the edit, including edits made through shell commands or scripts. I want one general advisory across edit methods and supported hosts, keeping this change focused on reliable detection.

### Success Criteria

1. The shell check detects the script and command edit forms listed in the issue before execution, reporting exact targets where established and uncertainty elsewhere.
2. Known targets receive the existing per-file checklist and the same general authoring advisory used by edit tools, sharing the once-per-file warning record.
3. Scripts that might write to unknown targets receive a warning that their targets cannot be determined and authoring reads still apply. Clearly read-only commands are excluded.
4. Every supported host's edit tools are covered where hooks allow it; unavoidable gaps are documented with primary sources and the observed delivery boundary.
5. Consumer installs receive the hook improvements and applicable rules/header pointers. File-type-specific advisories are recorded as future work.

### Out of Scope

These exclusions are design non-goals, not required acceptance work. Existing ledger rows are reused.

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| File-type-specific selection/quotation | The accepted general advisory meets the contract without selecting sections. | `787-file-type-specific-authoring-advisories`; separate owner-approved feature. |
| New shell blocking/confirmation | The accepted shell reminder is advisory; stronger existing safeguards are preserved. | `787-no-new-shell-blocking`; separate authorization policy. |
| New after-edit or diff checks | Detection before execution satisfies the planned mechanism; after-edit analysis is expressly excluded. | `787-no-after-edit-checks`; separate design. |
| Prompt/workflow header pointers | The design limits pointer changes to shared rules and template editor notes. | `787-no-prompt-workflow-header-pointers`; separate authoring policy. |
| Repo-only project rules | Consumer-shipped behavior meets this plan's goals. | `787-no-repo-only-rule-edits`; existing repository ownership. |

Live model receipt, same-pending-edit opportunity and measured visibility thresholds remain unverified technical claims under the accepted decisions, not silently deferred required tests. Adapter output and cold-start timing are verified locally. This plan authorizes no external probe or driver migration.

## Where it fits

- Group 1: Bounded evidence and shared advice — this group
  - TASK 1: Replace description-only shell detection with structured lexical evidence — open
  - TASK 2: Recognize bounded patch and script effects — open
  - TASK 3: Bound inspection and preserve enforcement composition — open
  - TASK 4: Prepare one shared general reminder and normalized identity — open
  - TASK 5: Select complete blocks before truthful acknowledgement — open
- Group 2: Managed host integration — next
  - TASK 6: Integrate Claude shell advice and NotebookEdit payloads — open
  - TASK 7: Integrate Cursor Delete and shell advice inside managed ownership — open
  - TASK 8: Integrate Codex initial shell commands and complete patch batches — open
  - TASK 9: Integrate Antigravity multi-replace and preserve OpenCode boundaries — open
- Group 3: Consumer pointers and integrated evidence — later
  - TASK 10: Ship accurate authoring pointers and coverage guidance — open
  - TASK 11: Prove fresh-install and upgrade footprints with preserved drivers — open
  - TASK 12: Prove rendered parity, bounds and fresh-consumer dogfood — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Replace description-only shell detection with structured lexical evidence
  - **UPDATE:** `.bkit/core/hooks/guardrails-shell.js`: extend the existing scanner and detector with ordered unique exact targets, independent uncertainty, operation/existence evidence and effective-directory resolution. Preserve quote context, escaped separators, nested commands, heredoc association, existing quiet sinks and supported literal cd. Cover redirects, tee, sed/perl/awk/ruby in-place forms, cp destinations and both mv endpoints; unresolved directory/recursive/computed effects stay unknown.
  - **UPDATE:** `.bkit/core/hooks/guardrails-tiers.js`: update the existing detector-result consumer without changing stronger decisions.
  - **UPDATE:** `.bkit/core/.claude/hooks/bkit-guardrails.cjs`: adapt the direct shellEditTargets caller to structured evidence in this contract-changing task; preserve its existing context/output interface and shell-edit advice. Remove every existing array-result assumption across the callers before group 1 closes.
  - **DEPENDS ON:** None.
  - **DONE WHEN:** The four named rendered-hook cases pass for the full direct-command corpus and malformed/unsupported forms retain uncertainty without guessed targets; the direct Claude consumer and existing cross-host shell-advice assertions pass with structured evidence. Existing lexical/fetch/enforcement tests remain passing at this task and group boundary.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `retains lexical context for nested shell edits` fails on quoted separators or heredoc bodies being split into the wrong commands.
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `recognizes direct edit command families` fails on a required literal writer producing no exact-target evidence.
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `normalizes literal working directories without guessing` fails on a target being resolved against the workspace instead of the effective command directory.
    - `.bkit/core/engine/install/modules/index.integration.test.ts` `keeps existing shell consumers working with structured evidence` fails on the direct Claude caller suppressing shell-edit advice when the detector returns structured evidence.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Recognize bounded patch and script effects
  - **UPDATE:** `.bkit/core/hooks/guardrails-shell.js`: inspect literal patch input/direct patch files with supported strip/directory options; preserve add/delete/move targets. Recognize inline Python/Node, associated heredocs and directly named interpreter/scripts. Recognized writes yield literal targets; only the whole supported positive grammar establishes readOnly. Allow literals/comments/understood bindings/direct reads/stdout and recognized Node fs syntax; unknown imports, dynamic calls, subprocesses or unsupported control flow remain uncertain.
  - **DEPENDS ON:** 1.
  - **DONE WHEN:** The four named cases pass for positive, read-only and uncertain variants of every supported script/patch form; mixed exact and unknown results persist without source, command or environment text in output/state.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `extracts all literal patch effects` fails on multi-file additions, removals or moves being omitted.
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `classifies inline and named script effects` fails on literal Python/Node writers or direct script invocations escaping detection.
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `requires a positive whole-program reader grammar` fails on an unknown effect being treated as read-only because no writer was recognized.
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `retains exact targets beside uncertain script effects` fails on uncertainty replacing established targets or leaking inline source.

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Bound inspection and preserve enforcement composition
  - **UPDATE:** `.bkit/core/hooks/guardrails-shell.js`: inspect only directly named safe regular descriptors with bounded reads; do not execute source, follow imports, traverse directories or wait on special files. Use 256 KiB command input, 64 KiB plus one byte per source, depth 3, 64 exact targets and a cooperative 200 ms deadline. Stop at the first limit, retain prior targets and report analysis-limit; unavailable/racy/symlink-dependent source reports uncertainty.
  - **UPDATE:** `.bkit/core/hooks/guardrails-tiers.js`: preserve deny/ask/secret precedence and allowed fetch+edit composition, with safe uncertainty diagnostics and no new blocking.
  - **UPDATE:** `.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs`: consume the composed fetch/edit evidence in this task so an allowed fetch cannot hide a later edit. Preserve the established return envelope and retry transport; task 9 adds richer shared advice and new edit-tool coverage.
  - **DEPENDS ON:** 2.
  - **DONE WHEN:** All three named cases pass, including special-file/race/overflow fixtures, every limit and compound protection regressions through the rendered Antigravity adapter; allowed fetch+edit commands emit both notices without changing stronger decisions. Inspected scripts leave their sentinel side effects absent, and existing adapters pass before group 1 closes.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `bounds direct source inspection without executing it` fails on an unsafe or unavailable source being treated as inspected, executed or read without a bound.
    - `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` `stops analysis at each internal bound` fails on overflow erasing established targets or continuing analysis without a limit reason.
    - `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts` `preserves stronger shell decisions and compound advice` fails on edit context downgrading a stronger decision or an allowed fetch hiding a following edit.

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** Prepare one shared general reminder and normalized identity
  - **UPDATE:** `.bkit/core/hooks/gateguard-engine.js`: preserve existing/new/config checklists and extend agent-read matching to the design's directories/root files. Point to authoring.md and Which Sections Apply. Separate pure preparation from acknowledgement and normalize absolute/relative identity against effective cwd in both channels; preserve session/agent scope and existing state storage.
  - **READ:** `.bkit/core/.opencode/plugin/bkit-gateguard.js`: preserve the existing firstTouchAdvice call/return interface while introducing the shared preparation seam; replace its implementation in place rather than retaining a second record-before-return path. Later host tasks consume the new batching seam without leaving current callers broken at this group boundary.
  - **DEPENDS ON:** 3.
  - **DONE WHEN:** Both named cases pass across agent-read path classes, checklist selection, both shell/edit call orders and identity scopes; preparation alone leaves warning state unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` `prepares complete advice without acknowledging it` fails on preparation mutating warning state or missing the general reminder for a supported agent-read path.
    - `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` `shares normalized warning identity across edit channels` fails on the same verified reminder repeating because channels spell a path differently, or on one agent suppressing another's advice.

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Select complete blocks before truthful acknowledgement
  - **UPDATE:** `.bkit/core/hooks/gateguard-engine.js`: batch complete blocks within 8,000 characters for Claude and 2,000 UTF-8 bytes for Codex, Cursor and Antigravity. Count all composed advice and reserve 512 units for uncertainty/output-limit notices. Emit omitted-target counts, handle a zero-fit block and acknowledge only selected complete blocks on verified routes. Unknown, omitted, truncated and unverified paths remain eligible. Preserve off mode, edit deny-once, shell advisory under deny and in-process fallback.
  - **DEPENDS ON:** 4.
  - **DONE WHEN:** The three named cases pass at budget boundaries and with corrupt/unavailable state; no path without a complete selected verified block is acknowledged. Existing reminder semantics survive on established transports, while fixture output never promotes an unverified route to verified.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` `acknowledges only complete selected blocks on verified routes` fails on an unshown path suppressing a later reminder.
    - `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` `reserves notices inside conservative host budgets` fails on partial blocks, an incorrect omitted count or a complete response exceeding its budget.
    - `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` `preserves off deny and state-fallback semantics` fails on off mutating state, shell advice adding a denial or unavailable state causing a blocking retry loop.

<!-- bkit:task 5 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `retains lexical context for nested shell edits`: quotes, escapes, wrappers, substitutions and heredocs | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 1 |
| `recognizes direct edit command families`: redirects, tee, in-place sed/perl/awk/ruby, cp and mv | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 1 |
| `normalizes literal working directories without guessing`: absolute/relative identity, cd and unresolved directories | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 1 |
| `keeps existing shell consumers working with structured evidence`: direct Claude consumer and existing rendered cross-host shell advice | Integration | `.bkit/core/engine/install/modules/index.integration.test.ts` | 1 |
| `extracts all literal patch effects`: git apply/patch, strip/directory options, add/delete/move and unknown stdin | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 2 |
| `classifies inline and named script effects`: Python/Node literals and directly named scripts | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 2 |
| `requires a positive whole-program reader grammar`: reads/stdout versus imports, dynamic calls and control flow | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 2 |
| `retains exact targets beside uncertain script effects`: safe reasons without command/source/env disclosure | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 2 |
| `bounds direct source inspection without executing it`: descriptors, races and unavailable/special/symlink sources | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 3 |
| `stops analysis at each internal bound`: bytes, depth, target count and cooperative deadline | Integration | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | 3 |
| `preserves stronger shell decisions and compound advice`: deny/ask, secrets, fetch plus edit and quiet sinks | Integration | `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts` | 3 |
| `prepares complete advice without acknowledging it`: existing/new/config checklists and general agent-read reminder | Unit | `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` | 4 |
| `shares normalized warning identity across edit channels`: both call orders and session/agent separation | Unit | `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` | 4 |
| `acknowledges only complete selected blocks on verified routes`: unknown/omitted/truncated/unverified remain eligible | Unit | `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` | 5 |
| `reserves notices inside conservative host budgets`: omitted counts, zero-fit block and composed response | Unit | `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` | 5 |
| `preserves off deny and state-fallback semantics`: advisory shell, edit deny-once and corrupt/unavailable state | Unit | `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` | 5 |
| `routes Antigravity multi-replace and shell targets`: matcher/payload and established deny-once transport | Integration | `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts` | 9 |
| `leaves Antigravity targets eligible when retry transport cannot deliver`: real unavailable retry state, fail-open allowance and later deliverable warning | Integration | `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts` | 9 |
