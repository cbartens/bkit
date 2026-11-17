# Brief: group 3 — Consumer pointers and integrated evidence

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
- Group 2: Managed host integration — done
  - TASK 6: Integrate Claude shell advice and NotebookEdit payloads — done
  - TASK 7: Integrate Cursor Delete and shell advice inside managed ownership — done
  - TASK 8: Integrate Codex initial shell commands and complete patch batches — done
  - TASK 9: Integrate Antigravity multi-replace and preserve OpenCode boundaries — done
- Group 3: Consumer pointers and integrated evidence — this group
  - TASK 10: Ship accurate authoring pointers and coverage guidance — done
  - TASK 11: Prove fresh-install and upgrade footprints with preserved drivers — done
  - TASK 12: Prove rendered parity, bounds and fresh-consumer dogfood — done
  - TASK 13: Keep consumer-added list entries when a managed JSON file reconverges — open

## The work

<!-- bkit:task 13 start -->

- [ ] **TASK 13:** Keep consumer-added list entries when a managed JSON file reconverges
  - **READ:** `.bkit/core/engine/install/write.ts`: `deepMergeJson` stays as it is (its array-replaces contract is tested); `writeTier2JsonContained` is the only caller that needs list-aware merging.
  - **UPDATE:** `.bkit/core/engine/install/write.ts`: add one exported helper (`mergeManagedJson`) that `writeTier2JsonContained` calls in place of `deepMergeJson` on drift. It merges objects the same way, and merges lists as follows: a list of plain values (such as `permissions.allow`) keeps the template's entries in template order, then appends consumer-only entries; a list of objects (hook groups) replaces a consumer group when it holds a hook `command` that the template group also holds, and keeps every other consumer group after the template's groups.
  - **UPDATE:** `.bkit/core/.bkit/install.md`: in the JSON ownership model section, state the list rule beside the existing deep-containment rules.
  - **UPDATE:** `.bkit/core/engine/install/modules/core.integration.test.ts`: add one upgrade case that starts from the shipped (pre-change) Claude, Cursor and Antigravity registration files plus a custom hook group and a custom `permissions.allow` entry, runs the install, and asserts the new matchers arrive while the custom group and entry survive.
  - **DEPENDS ON:** 11.
  - **DONE WHEN:** After an upgrade from the shipped layout, the new matchers (Claude `NotebookEdit`, Cursor `Write|Delete`, Antigravity `multi_replace_file_content`) are present, a consumer's own hook group and own `permissions.allow` entries are byte-preserved, no duplicate bkit group appears, a second install is a no-op, `deepMergeJson` behaves as before, and `.bkit/core/.bkit/install.md` states the list rule. No migration is added. Task 11's named case still passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/write.test.ts` `merges managed lists while keeping consumer-added entries` fails on a drift merge that drops a consumer's own list entry, duplicates a bkit entry or reorders the template's entries.
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `upgrades shipped registrations without dropping consumer hook groups or permissions` fails on an upgrade from the shipped layout that loses a custom hook group or custom permission entry on any host.

<!-- bkit:task 13 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Behavioral and install evidence | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts`, `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts`, `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts`, `.bkit/core/engine/audits/hooks/gateguard-claude.integration.test.ts`, `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts`, `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts`, `.bkit/core/engine/install/modules/index.integration.test.ts`, `.bkit/core/engine/install/modules/core.test.ts`, `.bkit/core/engine/install/modules/core.integration.test.ts` | `rg -l --hidden 'gateguard\|guardrails\|hook-driver' .bkit/core/engine/audits/hooks .bkit/core/engine/install/modules`; direct header/helper reads, including `sed -n '1,28p'` on parity, `sed -n '1,22p'` on Antigravity and `sed -n '1,20p'` on core integration; review traced cross-host assertions in index integration lines 900–923 | Real rendered-hook and scratch-consumer suites | EXTEND | Extend the exact matrix owners and their current fixtures; no new harness or baseline-only red; tasks 1–12. |

### Architecture entries

#### [MODIFY] `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts`, `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts`, `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts`, `.bkit/core/engine/audits/hooks/gateguard-claude.integration.test.ts`, `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts`, `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts`, `.bkit/core/engine/install/modules/index.integration.test.ts`, `.bkit/core/engine/install/modules/core.test.ts`, `.bkit/core/engine/install/modules/core.integration.test.ts`

Extend the exact Reuse Inventory test owners with the matrix cases. Isolated shared-module cases use bounded temporary fixtures; wired driver and install cases use Integration. Retain existing patch/shell-boundary regression assertions alongside the new discriminating cases.
