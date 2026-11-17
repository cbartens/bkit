# Brief: group 2 — Managed host integration (tests)

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

- Group 1: Bounded evidence and shared advice — done
  - TASK 1: Replace description-only shell detection with structured lexical evidence — done
  - TASK 2: Recognize bounded patch and script effects — done
  - TASK 3: Bound inspection and preserve enforcement composition — done
  - TASK 4: Prepare one shared general reminder and normalized identity — done
  - TASK 5: Select complete blocks before truthful acknowledgement — done
- Group 2: Managed host integration — this group
  - TASK 6: Integrate Claude shell advice and NotebookEdit payloads — open
  - TASK 7: Integrate Cursor Delete and shell advice inside managed ownership — open
  - TASK 8: Integrate Codex initial shell commands and complete patch batches — open
  - TASK 9: Integrate Antigravity multi-replace and preserve OpenCode boundaries — open
- Group 3: Consumer pointers and integrated evidence — next
  - TASK 10: Ship accurate authoring pointers and coverage guidance — open
  - TASK 11: Prove fresh-install and upgrade footprints with preserved drivers — open
  - TASK 12: Prove rendered parity, bounds and fresh-consumer dogfood — open

## The work

<!-- bkit:task 6 start -->

- [ ] **TASK 6:** Integrate Claude shell advice and NotebookEdit payloads
  - **UPDATE:** `.bkit/core/hooks/gateguard-edit-payload.js`: accept NotebookEdit/notebook_path and the existing edit payloads with shared preparation/batching identity.
  - **UPDATE:** `.bkit/core/.claude/hooks/bkit-gateguard.cjs`: retain the existing pure entry point and output contract while integrating complete advice.
  - **UPDATE:** `.bkit/core/.claude/hooks/bkit-guardrails.cjs`: render the shared engine and compose fetch/edit advice with effective cwd/session/agent context; preserve non-blocking behavior and a single response.
  - **UPDATE:** `.bkit/shared/.claude/settings.json`: explicitly register NotebookEdit alongside existing edit tools.
  - **DEPENDS ON:** 5.
  - **DONE WHEN:** The named rendered-hook case passes for matcher and payload together, including multiple existing targets and the shell/edit identity flow; default output has no new permission denial and guidance retains Claude's documented next-request timing limitation.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/gateguard-claude.integration.test.ts` `routes Claude notebook and shell targets through shared advice` fails on a registered NotebookEdit being rejected by payload extraction or shell/edit advice diverging.

<!-- bkit:task 6 end -->

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Integrate Cursor Delete and shell advice inside managed ownership
  - **UPDATE:** `.bkit/core/hooks/gateguard-edit-payload.js`: accept the documented Delete target payload while retaining the shared Claude contract.
  - **UPDATE:** `.bkit/core/.cursor/hooks/bkit-gateguard.cjs`: extend managed handling without replacing the consumer-owned outer input/output driver.
  - **UPDATE:** `.bkit/core/.cursor/hooks/bkit-guardrails.cjs`: compose shared edit advice with existing shell decisions and output interface.
  - **UPDATE:** `.bkit/shared/.cursor/hooks.json`: register Delete with the existing edit surface.
  - **DEPENDS ON:** 6.
  - **DONE WHEN:** The named case passes for matcher+payload and shell advice; default/customized outer driver bytes remain preserved. The exact `.cursor/hooks/bkit-gateguard.cjs` additional_context envelope remains documented as unverified, with no guessed replacement field or new acknowledgement claim.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` `routes Cursor delete and shell targets without replacing its driver` fails on Delete missing advice or a managed change overwriting the outer driver/envelope.

<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->

- [ ] **TASK 8:** Integrate Codex initial shell commands and complete patch batches
  - **UPDATE:** `.bkit/core/.codex/hooks/bkit-gateguard.cjs`: consume every exact add/update/delete/move target, not only the first eligible target; batch through the shared engine and preserve payload cwd identity.
  - **UPDATE:** `.bkit/core/.codex/hooks/bkit-guardrails.cjs`: compose richer shell evidence and general advice within the existing protocol and protections.
  - **READ:** `.bkit/shared/.codex/hooks.json`: retain existing apply_patch and Bash registration; interactive write_stdin is outside this pre-tool coverage.
  - **DEPENDS ON:** 7.
  - **DONE WHEN:** The named case passes for all patch targets and initial Bash payloads; omitted targets remain eligible, trusted-layer and interactive-input boundaries are explicit, and no live-before-pending-edit claim is introduced.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` `routes Codex complete patches and initial shell commands` fails on later patch targets being skipped or initial shell evidence failing to reach the shared formatter.

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [ ] **TASK 9:** Integrate Antigravity multi-replace and preserve OpenCode boundaries
  - **UPDATE:** `.bkit/core/.agents/plugins/bkit/hooks/bkit-gateguard.cjs`: accept multi_replace_file_content and its documented targets alongside existing edit tools; batch shared advice with the existing transport.
  - **UPDATE:** `.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs`: integrate shared shell advice without changing the established advisory deny-once/retry transport or stronger decisions.
  - **UPDATE:** `.bkit/core/hooks/antigravity-hook.js`: retain the existing hashed retry signature and expose transport acceptance internally so acknowledgement follows a complete selected block's acceptance. An identical retry or unavailable retry-store location returns the existing bare allow and does not acknowledge newly prepared targets; keep the public driver envelope and fail-open behavior unchanged.
  - **UPDATE:** `.bkit/shared/.agents/plugins/bkit/hooks.json`: add multi_replace_file_content to the relevant edit matcher.
  - **UPDATE:** `.bkit/core/.opencode/plugin/bkit-gateguard.js`: consume shared preparation/batching for all existing edit/patch targets without adding shell interception or after-edit inspection.
  - **DEPENDS ON:** 8.
  - **DONE WHEN:** All three named integration cases pass, including Antigravity matcher/payload agreement and real unavailable retry-state recovery. A silent allow leaves the target unacknowledged and a later deliverable call still warns; only accepted complete blocks are acknowledged. Both real OpenCode driver versions preserve every patch target and the after-execute boundary while sharing normalized alias identity and leaving budget-omitted targets eligible. Existing preservation assertions remain passing, both state stores contain no raw command text, and transport/driver interfaces survive without a new shell denial policy or before-edit claim.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts` `routes Antigravity multi-replace and shell targets` fails on a registered multi-replace payload losing a target or changing established retry semantics.
    - `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` `preserves OpenCode edit coverage and after-execute boundary` fails on the real V1/V2 driver acknowledging an omitted patch block or repeating a complete reminder because later edits use an absolute/relative alias; retain all patch-target, no-shell and after-execute assertions as regression coverage within this stronger case.
    - `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts` `leaves Antigravity targets eligible when retry transport cannot deliver` fails on an unavailable real retry-store location silently allowing the call after its target has been acknowledged, suppressing a later deliverable warning.

<!-- bkit:task 9 end -->

### Earlier tasks this group depends on

- TASK 5 (group 1, done): Select complete blocks before truthful acknowledgement — `.bkit/core/hooks/gateguard-engine.js`

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `preserves stronger shell decisions and compound advice`: deny/ask, secrets, fetch plus edit and quiet sinks | Integration | `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts` | 3 |
| `acknowledges only complete selected blocks on verified routes`: unknown/omitted/truncated/unverified remain eligible | Integration | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` | 5 |
| `reserves notices inside conservative host budgets`: omitted counts, zero-fit block and composed response | Integration | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` | 5 |
| `routes Claude notebook and shell targets through shared advice`: NotebookEdit/notebook_path and existing tools | Integration | `.bkit/core/engine/audits/hooks/gateguard-claude.integration.test.ts` | 6 |
| `routes Cursor delete and shell targets without replacing its driver`: payload/matcher and envelope limit | Integration | `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` | 7 |
| `routes Codex complete patches and initial shell commands`: all patch paths, initial Bash and interactive boundary | Integration | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` | 8 |
| `routes Antigravity multi-replace and shell targets`: matcher/payload and established deny-once transport | Integration | `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts` | 9 |
| `preserves OpenCode edit coverage and after-execute boundary`: real V1/V2 drivers retain all patch targets, normalize alias paths and leave omitted blocks eligible | Integration | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` | 9 |
| `leaves Antigravity targets eligible when retry transport cannot deliver`: real unavailable retry state, fail-open allowance and later deliverable warning | Integration | `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts` | 9 |
| `keeps rendered classification advice and acknowledgement equivalent`: corpus across adapters and diagnostics | Integration | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` | 12 |
| `bounds rendered cold-start time and complete response size`: maximum/unavailable source inputs per adapter | Integration | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` | 12 |
