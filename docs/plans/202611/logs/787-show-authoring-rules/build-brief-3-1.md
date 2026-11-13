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
  - TASK 10: Ship accurate authoring pointers and coverage guidance — open
  - TASK 11: Prove fresh-install and upgrade footprints with preserved drivers — open
  - TASK 12: Prove rendered parity, bounds and fresh-consumer dogfood — open

## The work

<!-- bkit:task 10 start -->

- [ ] **TASK 10:** Ship accurate authoring pointers and coverage guidance
  - **UPDATE:** `.bkit/core/.agents/rules.md`: clarify that script/bulk exceptions preserve authoring reads and template editing also follows Doc Templates.
  - **UPDATE:** `.bkit/instructions.md`: use instructions:show/sync to align shared wording and its current source copies.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-accessibility.md`: add the template-editor pointer to the opening HTML note inside its managed block, preserving filling-agent rules.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-adoption.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-agents.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-aio-seo.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-analytics.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-annotations.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-app-performance.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-app-store.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-architecture.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-ci-performance.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-config.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-cost.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-coverage.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-database.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-dead-code.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-deferrals.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-dependencies.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-documentation.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-duplication.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-failures.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-flakes.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-gates.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-issues.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-llm.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-logs.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-models.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-privacy.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-prompts.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-red-team.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-reliability.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-repo.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-security.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-slop.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-testing.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-audit-usability.md`: add the same opening-note editor pointer.
  - **UPDATE:** `.bkit/core/docs/templates/bkit-plan.md`: add the same opening-note editor pointer while retaining its plan-anchor contract.
  - **UPDATE:** `.bkit/core/.bkit/providers.md`: carry the design's primary-source host table, exact Cursor default/customized driver boundaries, Codex interactive boundary, conservative budgets and six safe diagnostic/recovery signatures. Distinguish emission, receipt and opportunity before the pending edit.
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: align its existing shell-advisory guidance with composed advice and limits.
  - **UPDATE:** `docs/testing.md`: describe the existing-tier detector/adapter/install/timing additions and the continuing live-visibility limitations.
  - **DEPENDS ON:** 9.
  - **DONE WHEN:** The named source-contract test passes for every current template and both rule changes; shared instruction checks pass; guidance includes analysis-unavailable/analysis-limit/output-limit/state-fallback/delivery-unverified/driver-wiring with safe recovery and no recreated lite.md. All Documentation Updates rows are represented.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.test.ts` `keeps shipped authoring pointers in their editor context` fails on a missing template-editor pointer, a waived authoring read or a pointer placed only in filling-agent rules.

<!-- bkit:task 10 end -->

<!-- bkit:task 11 start -->

- [ ] **TASK 11:** Prove fresh-install and upgrade footprints with preserved drivers
  - **READ:** `.bkit/core/engine/render/parts.ts`: use the existing shared-part renderer; runtime hooks remain standalone.
  - **READ:** `.bkit/core/engine/install/modules/core.ts`: use existing canonical authoring-doc and template installation.
  - **UPDATE:** `.bkit/core/engine/install/modules/core.integration.test.ts`: extend real temporary consumer fixtures for fresh install and upgrade from the shipped layout across hosts, including default/customized outer drivers and custom registration groups.
  - **DEPENDS ON:** 10.
  - **DONE WHEN:** The named integration case passes against actual rendered/installed files: shared hook behavior and pointers arrive, authoring.md resolves locally, custom driver text is byte-preserved, default Cursor envelope remains unchanged/unverified, and no migration or runtime package dependency is introduced. Upgrade fixtures retain byte-for-byte old outer drivers and custom registration groups from the shipped layout, rather than generating them from the new template; managed behavior changes while owned bytes stay identical. Build and standard source-to-mirror upgrade complete; affected generated dist and installed snapshots are included with their source changes.
  - **TEST FIRST:**
    - `.bkit/core/engine/install/modules/core.integration.test.ts` `installs and upgrades shared hook behavior without replacing owned drivers` fails on a fresh/upgrade footprint losing shared behavior or overwriting consumer-owned text.

<!-- bkit:task 11 end -->

<!-- bkit:task 12 start -->

- [ ] **TASK 12:** Prove rendered parity, bounds and fresh-consumer dogfood
  - **UPDATE:** `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts`: run the common detection/advice/acknowledgement corpus across every adapter and measure cold-start maximum-input/unavailable-source cases. Keep host-specific envelopes, budgets and explicit exceptions visible.
  - **DEPENDS ON:** 11.
  - **DONE WHEN:** Both named cases pass; each rendered adapter finishes within min(1 second, one quarter of its documented timeout), with version/timeout/elapsed/complete-response-size evidence. Measure cold starts serially in a controlled run with no parallel audit/test workers, record runtime, machine/load and repetition count, and keep any contention failures visible. Reduce internal limits if needed. Every response respects its budget and complete-block reserve; existing parity/dogfood tests pass. `pnpm build`, a real built-CLI fresh scratch-consumer install under tmp/, on-disk inspection and `pnpm bkit check` pass, with all planned Unit and Integration cases passing and live delivery claims explicitly unverified. Report known load-dependent failures from the full suite; an isolated or retry pass does not establish full-suite success.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` `keeps rendered classification advice and acknowledgement equivalent` fails on one host dropping exact/unknown evidence, changing shared content or acknowledging an unshown block.
    - `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` `bounds rendered cold-start time and complete response size` fails on a maximum or unavailable-source input exceeding the adapter's time or complete-response bound.

<!-- bkit:task 12 end -->

### Earlier tasks this group depends on

- TASK 9 (group 2, done): Integrate Antigravity multi-replace and preserve OpenCode boundaries — `.bkit/core/.agents/plugins/bkit/hooks/bkit-gateguard.cjs`, `.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs`, `.bkit/core/hooks/antigravity-hook.js`, `.bkit/shared/.agents/plugins/bkit/hooks.json`, `.bkit/core/.opencode/plugin/bkit-gateguard.js`

Reuse Inventory rows left out: 3; Architecture entries left out: 2 — read them in docs/plans/202611/787-show-authoring-rules-plan.md § Reuse Inventory and § Architecture & Component Changes.
