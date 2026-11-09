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
  - TASK 6: Integrate Claude shell advice and NotebookEdit payloads — done
  - TASK 7: Integrate Cursor Delete and shell advice inside managed ownership — open
  - TASK 8: Integrate Codex initial shell commands and complete patch batches — done
  - TASK 9: Integrate Antigravity multi-replace and preserve OpenCode boundaries — done
- Group 3: Consumer pointers and integrated evidence — next
  - TASK 10: Ship accurate authoring pointers and coverage guidance — open
  - TASK 11: Prove fresh-install and upgrade footprints with preserved drivers — open
  - TASK 12: Prove rendered parity, bounds and fresh-consumer dogfood — open

## The work

<!-- bkit:task 7 start -->

- [ ] **TASK 7:** Integrate Cursor Delete and shell advice inside managed ownership
  - **UPDATE:** `.bkit/core/hooks/gateguard-edit-payload.js`: accept the documented Delete target payload while retaining the shared Claude contract.
  - **UPDATE:** `.bkit/core/.cursor/hooks/bkit-gateguard.cjs`: extend managed handling without replacing the consumer-owned outer input/output driver.
  - **UPDATE:** `.bkit/core/.cursor/hooks/bkit-guardrails.cjs`: compose shared edit advice with existing shell decisions and output interface.
  - **UPDATE:** `.bkit/shared/.cursor/hooks.json`: register Delete with the existing edit surface.
  - **DEPENDS ON:** 6.
  - **DONE WHEN:** The named case passes for matcher+payload and shell advice; default/customized outer driver bytes remain preserved. The exact `.cursor/hooks/bkit-gateguard.cjs` additional_context envelope remains documented as unverified, with no guessed replacement field or new acknowledgement claim.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` `routes Cursor delete and shell targets while keeping its driver untouched` fails on Delete missing advice or a managed change overwriting the outer driver/envelope.

<!-- bkit:task 7 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `routes Cursor delete and shell targets while keeping its driver untouched`: payload/matcher and envelope limit | Integration | `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` | 7 |
