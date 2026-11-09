<!-- bkit:anchor
baseSha: 38102970a8a3a542798cc320c9691dced676efa2
baseRef: origin/dev
designPath: docs/plans/202611/787-show-authoring-rules-design.md
designBaseSha: fbc338ac6ab4f5ef01f489fc276dc7e2dff92284
bkitVersion: 6.0.0
bkitLatest: 6.0.0
-->

Verdict: PASS
<!-- verdict:end -->

# Show authoring rules before every edit Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

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

## 👤 ⚠️ Acceptance Scenario

### Narrative

When an agent edits an agent-read file, I want the authoring reminder to appear before the edit, including edits made through shell commands or scripts. I want one general advisory across edit methods and supported hosts, keeping this change focused on reliable detection.

### Success Criteria

1. The shell check detects the script and command edit forms listed in the issue before execution, reporting exact targets where established and uncertainty elsewhere.
2. Known targets receive the existing per-file checklist and the same general authoring advisory used by edit tools, sharing the once-per-file warning record.
3. Scripts that might write to unknown targets receive a warning that their targets cannot be determined and authoring reads still apply. Clearly read-only commands are excluded.
4. Every supported host's edit tools are covered where hooks allow it; unavoidable gaps are documented with primary sources and the observed delivery boundary.
5. Consumer installs receive the hook improvements and applicable rules/header pointers. File-type-specific advisories are recorded as future work.

### Process Sketch

- WHEN an edit tool first touches a file → THEN show its checklist and the general advisory on the host's established channel, subject to the documented timing boundary.
- WHEN a shell edit has exact targets → THEN prepare the same advice for each target not already acknowledged.
- WHEN the command also has unknown effects → THEN keep its exact targets and warn that authoring reads apply to every edited file.
- WHEN a script is positively read-only → THEN omit its shell-edit reminder.
- WHEN a budget cannot fit all complete blocks → THEN report the omitted count and leave those paths unacknowledged.
- WHEN the host route has no verified delivery contract → THEN retain the documented limitation and leave new advice unacknowledged.

### Concrete Example

**Setup:** An agent is updating a consumer's `docs/testing.md` through a literal Python write, in a session with no prior reminder for that path. The host invokes its pre-execution shell hook.

**Steps:**

1. The agent submits the shell command → the hook identifies `docs/testing.md` without executing the Python source.
2. The hook prepares the existing per-file investigation checklist and the general authoring reminder → the adapter selects complete blocks within its host budget.
3. The adapter emits its established response → a verified complete-delivery route may acknowledge the path; an unverified route leaves it unacknowledged.
4. The agent later uses an edit tool on the same normalized path → a previously acknowledged reminder is omitted, while an unacknowledged path remains eligible.

**Outcome:** Installed hooks detect the edit consistently and emit the shared reminder, with truthful state and explicit delivery limits. A fixture response alone does not prove that the model could act before the pending edit.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Computed script targets cannot always be determined before execution. A command can have both known targets and additional unknown writes. | Preserve exact targets and independent safe uncertainty reasons. |
| A file touched through both shell and edit tools should not receive duplicate first-touch advice within the same session and agent scope. | Both channels normalize paths and share sequential acknowledgement on verified routes. |
| Parallel calls and unavailable state can produce repeated advice; they must not falsely acknowledge an unshown target. | Tolerate repeats and use the existing in-process fallback; do not claim transactional exactly-once behavior. |
| A hook failure retains the existing fail-open behavior: the hook does not stop the command because its analysis failed. | Preserve independent stronger enforcement decisions and emit safe diagnostics where the protocol allows them. |
| This change adds no shell blocking, after-edit checks or file-type-specific rule selection. Existing host delivery mechanisms and stronger shell protections retain their contracts. | Shell advice stays non-blocking even in deny mode. |
| Some hosts cannot deliver a default advisory before an edit. Such a host is an explicit coverage exception, not a reason to count an after-edit result as before-edit coverage. | Keep the design's sourced host table and the current probe limitations. |
| Quoted separators, heredocs, wrappers and literal directory changes occur together. | Associate source and working directory correctly; unsupported forms become uncertain. |
| Script source is missing, oversized, replaced, symlink-dependent or a special file. | Inspect bounded regular descriptors only, never execute source or block on a FIFO/device. |
| Output exceeds the host budget. | Emit complete blocks plus the omitted count within the reserve; unshown paths remain unacknowledged. |
| Off mode is selected. | Suppress GateGuard output and state changes while independent shell safeguards remain active. |

### Derived Test Matrix

The quoted names are planned test cases, parameterized over the variants in each row. Unit rows load an isolated shared module with real temporary files. Integration rows exercise rendered adapters or installation wiring. Live host visibility remains unverified under the accepted design decisions.

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
| `acknowledges only complete selected blocks on verified routes`: unknown/omitted/truncated/unverified remain eligible | Integration | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` | 5 |
| `reserves notices inside conservative host budgets`: omitted counts, zero-fit block and composed response | Integration | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` | 5 |
| `preserves off deny and state-fallback semantics`: advisory shell, edit deny-once and corrupt/unavailable state | Unit | `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` | 5 |
| `routes Claude notebook and shell targets through shared advice`: NotebookEdit/notebook_path and existing tools | Integration | `.bkit/core/engine/audits/hooks/gateguard-claude.integration.test.ts` | 6 |
| `routes Cursor delete and shell targets without replacing its driver`: payload/matcher and envelope limit | Integration | `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts` | 7 |
| `routes Codex complete patches and initial shell commands`: all patch paths, initial Bash and interactive boundary | Integration | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` | 8 |
| `routes Antigravity multi-replace and shell targets`: matcher/payload and established deny-once transport | Integration | `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts` | 9 |
| `preserves OpenCode edit coverage and after-execute boundary`: real V1/V2 drivers retain all patch targets, normalize alias paths and leave omitted blocks eligible | Integration | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` | 9 |
| `leaves Antigravity targets eligible when retry transport cannot deliver`: real unavailable retry state, fail-open allowance and later deliverable warning | Integration | `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts` | 9 |
| `keeps shipped authoring pointers in their editor context`: rules, every current template note and retired lite | Unit | `.bkit/core/engine/install/modules/core.test.ts` | 10 |
| `installs and upgrades shared hook behavior without replacing owned drivers`: fresh/default/customized footprint | Integration | `.bkit/core/engine/install/modules/core.integration.test.ts` | 11 |
| `keeps rendered classification advice and acknowledgement equivalent`: corpus across adapters and diagnostics | Integration | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` | 12 |
| `bounds rendered cold-start time and complete response size`: maximum/unavailable source inputs per adapter | Integration | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` | 12 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** The owner confirms the testable contract above.

## 👤 ⚠️ Breaking Changes & Naming Review

No public CLI, dependency or durable schema changes. The internal `shellEditTargets` result changes from descriptions to structured evidence (`targets`, `unknown`, `readOnly`), and its callers change together. Existing entry points and consumer-owned drivers retain their interfaces. Advice preparation, batching and acknowledgement replace record-before-return behavior inside the shared engine. No new file is proposed.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** The owner confirms the changes and names above.

## 👤 ⚠️ Open Questions & Assumptions

No outstanding owner questions. The owner already selected one general advisory and authorized proceeding with unverified host-delivery boundaries and conservative budgets.

- **Assumption:** The design's host contracts and limitations remain the implementation baseline → a changed host contract requires updating its adapter evidence and guidance before claiming support.
- **Assumption:** Existing managed entry points can carry the new shared behavior → an incompatible consumer-owned driver remains an explicitly documented limitation; overwriting it or adding a migration requires separate authorization.
- **Assumption:** Bounded recognition is sufficient for useful reminders → arbitrary dynamic effects remain uncertain, and a claim of complete script analysis would be incorrect.
- **Assumption:** Sequential shared state describes reminders on verified routes → unverified routes may repeat advice, and concurrent callers may repeat it even with available state.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** The owner confirms the assumptions above.

## Alternative Approaches & Recommendations

Use the accepted bounded scanner and existing GateGuard engine. Full shell/language parsers add runtime footprint without resolving arbitrary effects. Treating every script as opaque loses useful exact paths and creates reader noise. A separate shell advisory or warning map duplicates existing contracts. Automatic authoring-section selection and new shell blocking remain outside the accepted design.

## Out of Scope

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

## Suggested Scope Expansion

<!-- prettier-ignore -->
| Candidate | Source | Overlaps | Recommendation |
| --- | --- | --- | --- |
| First-action deny gate | `docs/deferrals.jsonl`, `700-first-action-deny-gate` | Hook warning state and rules reads | Keep separate; it needs a cross-host gate primitive and changes authorization. |
| File-type-specific authoring advice | `docs/deferrals.jsonl`, `787-file-type-specific-authoring-advisories` | General authoring formatter | Keep deferred as the owner chose. |
| Cursor ask-rate signal | `docs/deferrals.jsonl`, `381-cursor-hook-ask-rate-signal` | Shell hook diagnostics | Keep separate; this plan adds only the design's safe diagnostic signatures. |
| Comment-aware workflow quote mask | `docs/failures.jsonl`, `block-locality-audit-quote-mask-pairs-comment-apostrophe-across-lines` | Lexical scanning concepts | Keep separate; the workflow-audit helper is outside the hook path. |
| Hard-limit enforcement map | [#764 — Map each of the five harms to the hook or deny rule that blocks it](https://github.com/cbartens/bkit/issues/764) (open) | Shared guardrails and approval policy | Keep separate; this feature's advisory boundaries supply evidence but do not require a new enforcement policy. |
| OpenCode shell guardrails and URL-host matching | `docs/deferrals.jsonl`, `opencode-has-no-script-hook-so-two-gates-are-inexpressible-there` | Shared detector and plugin | Keep separate; preserve the explicit shell/before-edit coverage exception. |
| Codex read-tier gates | `docs/deferrals.jsonl`, `codex-read-tier-gates-not-wired-file-read-tool-name-unverified` | Host hook registration | Keep separate until its read-tool contract is verified; it is not an edit-tool requirement. |
| OpenCode patch tests under parallel load | `docs/failures.jsonl`, `gateguard-opencode-patch-tests-flaky-under-full-audits-run` (TRIAGED) | The exact patch/deny unit suite extended here | Keep visible as a validation risk; reproduce and repair if encountered in this implementation, without accepting retry-only passes or adding an unrelated runner redesign. |

## Security & Privacy

- [x] **User Input:** Treat shell text, script/patch source and payload paths as untrusted data. Inspect syntax only; never execute, import, traverse or fetch inspected source.
- [x] **PII:** Emit only safe reason codes, counts, host/event labels and necessary display paths; persist no command, inline source or environment values.
- [x] **Filesystem boundary:** Open only safe directly named regular files, establish type on the descriptor and read at most 64 KiB plus one byte. Unsupported symlinks/races/special files become uncertain without blocking on a FIFO/device.
- [x] **Enforcement:** Preserve deny, ask, secret and fetch precedence. Analysis errors fail open only for this advisory and never downgrade stronger decisions.

No new route, database, secret, redirect, webhook or role mutation applies.

## Pre-Flight / Dependencies

### Core

- [x] **Package Management:** `package.json` and the existing lockfile are accessible; the plan adds no dependency.
- [x] **Dependency Versions:** Node v24.16.0 meets `>=24`; pnpm 10.34.7 matches `packageManager`. `pnpm bkit:deps:outdated` ran on 2026-11-03 and returned exit 1 for available updates: oxlint-tsgolint 7.0.2004→7.0.2005, oxlint 1.89.0→1.90.0, @types/node 24.19.2→26.6.5 and vite 6.4.5→8.3.5. None blocks this dependency-free hook change; upgrades are not bundled.
- [x] **Existing-Solution Search:** Shared hook code, callers, render/install paths and existing audit suites were inspected; see Reuse Inventory.
- [x] **User Context:** The issue, design, existing decisions and input files are accessible. No missing owner information remains.
- [x] **Project Context:** Folded active decisions/knowledge confirm advisory defaults, shared state, Antigravity deny-once and consumer-owned drivers. Existing 787 design-choice, budget and host-boundary decisions are reused.
- [x] **Testing & Quality:** Rendered hooks and installation flows use Integration; isolated engine and payload checks use Unit; source consistency uses Static. No live/deployed tier exists for bkit.
- [x] **Prerequisite Plans:** None. The accepted design is `docs/plans/202611/787-show-authoring-rules-design.md`.

### Conditional

- [x] **Architecture:** Standalone rendered hooks remain dependency-free and use installed `.bkit/authoring.md`; no runtime package lookup is added.
- [x] **Observability:** Use existing hook protocol channels and prefixes with `analysis-unavailable`, `analysis-limit`, `output-limit`, `state-fallback`, `delivery-unverified` and `driver-wiring`; no new service/log store.
- [x] **Secrets, schema, UI and notifications:** Not applicable; no credentials, database, interface or notification service is introduced.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** The owner has confirmed this plan's acceptance section.
- [ ] **Breaking Changes confirmed:** The owner has confirmed this plan's naming review.
- [ ] **Open Questions confirmed:** The owner has accepted the assumptions.
- [x] **Security & Privacy checked:** Applicable local-input and filesystem risks are addressed.
- [x] **Reuse Inventory complete:** Each capability extends an existing artifact.
- [x] **Reuse reasons:** No new implementation file is planned.
- [ ] **Gate 1 — Verified:** All applicable prerequisites and owner confirmations are checked.

## Data Schema Integration

No database or durable project schema changes. The transient detector evidence contains ordered unique `targets` with operation/existence evidence, independent safe `unknown` reasons and positive `readOnly` classification. Existing temporary session/agent warning state remains the only persistence.

### Data Schema Usage

None.

### Data Schema Changes

None.

## Reuse Inventory

Searches used language-server lookup for `shellEditTargets`, scoped `rg -l --hidden` for its callers and `firstTouchAdvice`, the capability register, host template reads, install-module reads and existing test headers. The design's prior-art review considered parser dependencies; Node's existing filesystem/path facilities already provide bounded descriptor operations. No framework or external parser is required.

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Structured shell/script/patch evidence | `.bkit/core/hooks/guardrails-shell.js` | `find_symbol shellEditTargets`; scoped caller search and lexical helper reads | Existing shell detector, word/redirect helpers | EXTEND | Replace the old descriptions in the existing path; tasks 1–3. |
| Stronger shell classification | `.bkit/core/hooks/guardrails-tiers.js` | Scoped caller search and `classifyShell` read | Existing precedence and tier result | EXTEND | Compose advice without erasing enforcement; task 3. |
| Shared general advice and acknowledgement | `.bkit/core/hooks/gateguard-engine.js` | `rg firstTouchAdvice/alreadyWarned/markWarned`; formatter/state reads | Existing checklist, docs reminder and temporary state | EXTEND | Prepare/batch/acknowledge in the existing engine; tasks 4–5. |
| Common edit payloads | `.bkit/core/hooks/gateguard-edit-payload.js` | Payload adapter read and scoped callers | Existing Edit/Write/MultiEdit extraction | EXTEND | Add verified tool fields and batching integration; tasks 6–7. |
| Host shell/edit bridges | `.bkit/core/.claude/hooks/bkit-gateguard.cjs`, `.bkit/core/.claude/hooks/bkit-guardrails.cjs`, `.bkit/core/.cursor/hooks/bkit-gateguard.cjs`, `.bkit/core/.cursor/hooks/bkit-guardrails.cjs`, `.bkit/core/.codex/hooks/bkit-gateguard.cjs`, `.bkit/core/.codex/hooks/bkit-guardrails.cjs`, `.bkit/core/.agents/plugins/bkit/hooks/bkit-gateguard.cjs`, `.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs`, `.bkit/core/.opencode/plugin/bkit-gateguard.js` | `rg -l --hidden 'shellEditTargets\|firstTouchAdvice\|shellEditAdvisory\|adviseOnce' .bkit/core/hooks .bkit/core/.claude/hooks .bkit/core/.cursor/hooks .bkit/core/.codex/hooks .bkit/core/.agents/plugins/bkit/hooks .bkit/core/.opencode/plugin`; direct reads of the matched managed entry points, including Claude lines 50–90 and Antigravity guardrails lines 103–130 | Existing managed entry points, output drivers and patch extractors | EXTEND | Adapt existing contract consumers in tasks 1/3, then integrate richer shared advice and tool coverage in tasks 6–9. |
| Antigravity transport acceptance | `.bkit/core/hooks/antigravity-hook.js` | `sed -n '55,90p' .bkit/core/hooks/antigravity-hook.js`; `sed -n '55,90p' .bkit/core/.agents/plugins/bkit/hooks/bkit-gateguard.cjs` | Existing hashed `adviseOnce` retry store and deny-once transport | EXTEND | Commit acknowledgement only after the transport accepts a complete block; task 9 preserves its fail-open contract and hashed signature. |
| Hook registration | `.bkit/shared/.claude/settings.json`, `.bkit/shared/.cursor/hooks.json`, `.bkit/shared/.codex/hooks.json`, `.bkit/shared/.agents/plugins/bkit/hooks.json` | `rg -l --hidden 'NotebookEdit\|MultiEdit\|multi_replace_file_content\|apply_patch\|Delete' .bkit/shared/.claude .bkit/shared/.cursor .bkit/shared/.codex .bkit/shared/.agents/plugins/bkit`; `cat .bkit/shared/.cursor/hooks.json .bkit/shared/.agents/plugins/bkit/hooks.json`; existing Claude/Codex registration reads | Existing deep-contained groups | EXTEND | Add missing documented edit tools while preserving current shell and patch registrations; tasks 6–9. |
| Shipped authoring pointers | `.bkit/core/.agents/rules.md`, `.bkit/instructions.md`, `.bkit/core/docs/templates/*.md` | Existing rules/clause search and template opening-note read | Existing shared instruction sync and editor notes | EXTEND | Add wording at its current source; task 10. |
| Coverage and recovery guidance | `.bkit/core/.bkit/providers.md`, `.bkit/core/.bkit/workflows.md`, `docs/testing.md` | Hook guidance search and phase documentation reads | Existing host/provider catalog and testing stack | EXTEND | Record limitations and diagnostics where operators find them; tasks 10–12. |
| Behavioral and install evidence | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts`, `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts`, `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts`, `.bkit/core/engine/audits/hooks/gateguard-claude.integration.test.ts`, `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts`, `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts`, `.bkit/core/engine/install/modules/index.integration.test.ts`, `.bkit/core/engine/install/modules/core.test.ts`, `.bkit/core/engine/install/modules/core.integration.test.ts` | `rg -l --hidden 'gateguard\|guardrails\|hook-driver' .bkit/core/engine/audits/hooks .bkit/core/engine/install/modules`; direct header/helper reads, including `sed -n '1,28p'` on parity, `sed -n '1,22p'` on Antigravity and `sed -n '1,20p'` on core integration; review traced cross-host assertions in index integration lines 900–923 | Real rendered-hook and scratch-consumer suites | EXTEND | Extend the exact matrix owners and their current fixtures; no new harness or baseline-only red; tasks 1–12. |

## Architecture & Component Changes

**Ledger rows:** `787-unverified-host-delivery-boundaries`, `787-conservative-host-advisory-budgets`, `787-design-choice-01`, `787-design-choice-02`, `787-design-choice-03`, `787-design-choice-04`, `787-design-choice-05`, `787-design-choice-06`, `787-design-choice-07`, `787-design-choice-08`, `787-design-choice-09`, `787-design-choice-10`, `787-design-choice-11`, `787-design-choice-12`, `787-design-choice-13`, `787-design-choice-14`, `787-design-choice-15`, `787-design-choice-16`, `787-design-choice-17`, `787-file-type-specific-authoring-advisories`, `787-no-new-shell-blocking`, `787-no-after-edit-checks`, `787-no-prompt-workflow-header-pointers`, `787-no-repo-only-rule-edits`. These existing rows are reused; no new decision or deferral row is required.

### Database Migrations

None.

### Hook runtime and payload

#### [MODIFY] `.bkit/core/hooks/guardrails-shell.js`

The existing detector returns exact targets and uncertainty together. Preserve lexical context, effective working directory and positive reader classification. Bound command/source bytes, nesting, targets and analysis time as tasks 1–3 specify.

#### [MODIFY] `.bkit/core/hooks/guardrails-tiers.js`

Preserve stronger decisions while retaining edit evidence for allowed compound fetch/edit commands. Replace all description-array assumptions.

#### [MODIFY] `.bkit/core/hooks/gateguard-engine.js`

Keep existing checklist formatters and temporary identity. Separate preparation, complete-block selection and acknowledgement. The general reminder points to `.bkit/authoring.md` and `Which Sections Apply` for `.agents/**`, `.bkit/**`, `docs/**`, `AGENTS.md`, `CLAUDE.md` and `GEMINI.md`; it selects no file-kind sections.

#### [MODIFY] `.bkit/core/hooks/gateguard-edit-payload.js`

Keep the common payload adapter and add NotebookEdit/notebook_path and Cursor Delete extraction with their registrations. Preserve effective-directory identity.

#### [MODIFY] `.bkit/core/.claude/hooks/bkit-gateguard.cjs`, `.bkit/core/.claude/hooks/bkit-guardrails.cjs`, `.bkit/core/.cursor/hooks/bkit-gateguard.cjs`, `.bkit/core/.cursor/hooks/bkit-guardrails.cjs`, `.bkit/core/.codex/hooks/bkit-gateguard.cjs`, `.bkit/core/.codex/hooks/bkit-guardrails.cjs`, `.bkit/core/.agents/plugins/bkit/hooks/bkit-gateguard.cjs`, `.bkit/core/.agents/plugins/bkit/hooks/bkit-guardrails.cjs`, `.bkit/core/.opencode/plugin/bkit-gateguard.js`

These existing managed entry points extend the shared engine while preserving outer output interfaces. Adapt every existing structured-evidence consumer in group 1, including Claude's direct detector call and Antigravity's compound-advice selection. Add tool inventory and richer batching in group 2. Codex and OpenCode patches retain every target. Consumer-owned drivers stay preserved, and the Cursor default envelope remains explicitly unverified.

#### [MODIFY] `.bkit/core/hooks/antigravity-hook.js`

Use the existing transport's accepted complete-block outcome before acknowledging targets. A bare allow from identical retry or retry-store failure does not acknowledge newly prepared advice. Preserve the hashed retry signature, deny-once mechanism and fail-open allowance.

#### [MODIFY] `.bkit/shared/.claude/settings.json`, `.bkit/shared/.cursor/hooks.json`, `.bkit/shared/.codex/hooks.json`, `.bkit/shared/.agents/plugins/bkit/hooks.json`

Register NotebookEdit, Delete and multi-replace with the corresponding extraction changes. Codex's existing Bash/apply_patch registrations remain the reference boundary rather than adding interactive-input coverage.

#### [MODIFY] `.bkit/core/.agents/rules.md`, `.bkit/instructions.md`, `.bkit/core/docs/templates/bkit-plan.md` and the 35 exact audit-template paths in task 10, `.bkit/core/.bkit/providers.md`, `.bkit/core/.bkit/workflows.md`, `docs/testing.md`

Extend the existing authoring pointers and canonical guidance through the current install/render pipeline. Do not recreate retired `lite.md` or introduce a migration. Regenerate installed copies and affected `dist/` from source.

#### [MODIFY] `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts`, `.bkit/core/engine/audits/hooks/guardrails-antigravity.integration.test.ts`, `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts`, `.bkit/core/engine/audits/hooks/gateguard-claude.integration.test.ts`, `.bkit/core/engine/audits/hooks/gateguard-cursor.integration.test.ts`, `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts`, `.bkit/core/engine/install/modules/index.integration.test.ts`, `.bkit/core/engine/install/modules/core.test.ts`, `.bkit/core/engine/install/modules/core.integration.test.ts`

Extend the exact Reuse Inventory test owners with the matrix cases. Isolated shared-module cases use bounded temporary fixtures; wired driver and install cases use Integration. Retain existing patch/shell-boundary regression assertions alongside the new discriminating cases.

### Cron Jobs & Scheduled Tasks

None.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| Description-only result inside `shellEditTargets` | Structured evidence in the same function/file | DELETE | Remove the old array contract and every existing caller assumption in tasks 1–3 before group 1 closes; later host tasks add tool inventory and shared-advice wiring. |
| Record-before-return logic inside `firstTouchAdvice` | Prepare/select/acknowledge flow in the same engine | DELETE | An unshown target must remain eligible; tasks 4–5 replace the old ordering. |

No file is superseded, so there is no whole-file deletion. Consumer-owned drivers are retained as active external integration contracts, not deprecated parallel implementations.

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `.bkit/core/.agents/rules.md` and `.bkit/instructions.md` | Clarify script exceptions and template authoring sections through shared tooling. |
| Every `.bkit/core/docs/templates/*.md` | Add editor pointer inside the opening HTML note, separate from filling-agent rules. |
| `.bkit/core/.bkit/providers.md` | Sourced host tool/delivery table, Cursor exact driver/envelope boundary, budgets, safe signatures and recovery. |
| `.bkit/core/.bkit/workflows.md` | Align existing shell-advisory behavior description with composed advice and supported limits. |
| `docs/testing.md` | Record the added detector, adapter, timing and install evidence within existing tiers. |

Existing indexed docs retain their locations and scope; `.agents/docs.md` stays accurate without a new document row.

## Rollback Strategy

Code-only — `git revert` is sufficient. Rebuild and re-render the reverted source through the standard upgrade path; inspect a scratch consumer. Warning state is temporary and requires no data migration. Preserve consumer-owned drivers and independent enforcement throughout rollback.

## Agent Execution Runbook

One PR for all groups is appropriate. Groups are implementation order, not merge gates. Every logic task lands and repairs its own tests. The complete test corpus is parameterized within the named test cases.

<!-- bkit:group 1 start -->

### TASK GROUP 1: Bounded evidence and shared advice

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Replace description-only shell detection with structured lexical evidence
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

- [x] **TASK 2:** Recognize bounded patch and script effects
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

- [x] **TASK 3:** Bound inspection and preserve enforcement composition
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

- [x] **TASK 4:** Prepare one shared general reminder and normalized identity
  - **UPDATE:** `.bkit/core/hooks/gateguard-engine.js`: preserve existing/new/config checklists and extend agent-read matching to the design's directories/root files. Point to authoring.md and Which Sections Apply. Separate pure preparation from acknowledgement and normalize absolute/relative identity against effective cwd in both channels; preserve session/agent scope and existing state storage.
  - **READ:** `.bkit/core/.opencode/plugin/bkit-gateguard.js`: preserve the existing firstTouchAdvice call/return interface while introducing the shared preparation seam; replace its implementation in place rather than retaining a second record-before-return path. Later host tasks consume the new batching seam without leaving current callers broken at this group boundary.
  - **DEPENDS ON:** 3.
  - **DONE WHEN:** Both named cases pass across agent-read path classes, checklist selection, both shell/edit call orders and identity scopes; preparation alone leaves warning state unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` `prepares complete advice without acknowledging it` fails on preparation mutating warning state or missing the general reminder for a supported agent-read path.
    - `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` `shares normalized warning identity across edit channels` fails on the same verified reminder repeating because channels spell a path differently, or on one agent suppressing another's advice.

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [x] **TASK 5:** Select complete blocks before truthful acknowledgement
  - **UPDATE:** `.bkit/core/hooks/gateguard-engine.js`: batch complete blocks within 8,000 characters for Claude and 2,000 UTF-8 bytes for Codex, Cursor and Antigravity. Count all composed advice and reserve 512 units for uncertainty/output-limit notices. Emit omitted-target counts, handle a zero-fit block and acknowledge only selected complete blocks on verified routes. Unknown, omitted, truncated and unverified paths remain eligible. Preserve off mode, edit deny-once, shell advisory under deny and in-process fallback.
  - **DEPENDS ON:** 4.
  - **DONE WHEN:** The three named cases pass at budget boundaries and with corrupt/unavailable state; no path without a complete selected verified block is acknowledged. Existing reminder semantics survive on established transports, while fixture output never promotes an unverified route to verified.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` `acknowledges only complete selected blocks on verified routes` fails on an unshown path suppressing a later reminder.
    - `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` `reserves notices inside conservative host budgets` fails on partial blocks, an incorrect omitted count or a complete response exceeding its budget.
    - `.bkit/core/engine/audits/hooks/gateguard-opencode.test.ts` `preserves off deny and state-fallback semantics` fails on off mutating state, shell advice adding a denial or unavailable state causing a blocking retry loop.

<!-- bkit:task 5 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Managed host integration

<!-- bkit:task 6 start -->

- [x] **TASK 6:** Integrate Claude shell advice and NotebookEdit payloads
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

- [x] **TASK 7:** Integrate Cursor Delete and shell advice inside managed ownership
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

- [x] **TASK 8:** Integrate Codex initial shell commands and complete patch batches
  - **UPDATE:** `.bkit/core/.codex/hooks/bkit-gateguard.cjs`: consume every exact add/update/delete/move target, not only the first eligible target; batch through the shared engine and preserve payload cwd identity.
  - **UPDATE:** `.bkit/core/.codex/hooks/bkit-guardrails.cjs`: compose richer shell evidence and general advice within the existing protocol and protections.
  - **READ:** `.bkit/shared/.codex/hooks.json`: retain existing apply_patch and Bash registration; interactive write_stdin is outside this pre-tool coverage.
  - **DEPENDS ON:** 7.
  - **DONE WHEN:** The named case passes for all patch targets and initial Bash payloads; omitted targets remain eligible, trusted-layer and interactive-input boundaries are explicit, and no live-before-pending-edit claim is introduced.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts` `routes Codex complete patches and initial shell commands` fails on later patch targets being skipped or initial shell evidence failing to reach the shared formatter.

<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->

- [x] **TASK 9:** Integrate Antigravity multi-replace and preserve OpenCode boundaries
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

<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Consumer pointers and integrated evidence

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

<!-- bkit:group 3 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** Every capability extends its Reuse Inventory owner.
- [ ] **Extensions landed:** Each EXTEND row is implemented in its named artifact.
- [ ] **No gate weakened:** Existing stronger protections and failure contracts remain passing.
- [ ] **Red before code:** The build workflow records each planned Unit/Integration test red or as an updated existing test before implementation.
- [ ] **Tests unchanged:** Planned cases match their recorded red evidence.
- [ ] **Unproven tests:** Only an owner-approved TEST EXCEPTION may clear missing red evidence.
- [ ] **Gate 2 — Verified:** The checks above pass.

### Mandatory Tasks (Testing & Documentation)

These advisory checklist entries summarize runbook obligations; they add no separate work or merge gate.

- [ ] **Coverage:** Every matrix row maps to its task's named test and DONE WHEN.
- [ ] **Existing tests:** Affected tests and the declared Unit/Integration suites pass.
- [ ] **New tests:** All planned cases execute and pass.
- [ ] **Observability:** Safe signatures appear through protocol-valid owning-hook channels.
- [ ] **Documentation:** Every documentation row matches the delivered behavior.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** The shipped guidance and pointers match the installed footprint.
- [ ] **Docs index accurate:** Existing index entries remain accurate.
- [ ] **Gate 3 — Verified:** The checks above pass.

## Verification Plan

### Automated Tests

- [ ] **Static:** Run the declared type/lint/format/prose/drift checks through the build workflow's gates; run shared instruction checks after wording changes.
- [ ] **Unit:** Run planned isolated engine/payload and source-contract cases plus existing affected unit suites. Bound each new shared-module fixture and isolate its state/module instance. The TRIAGED `gateguard-opencode-patch-tests-flaky-under-full-audits-run` records patch/deny failures under parallel full-audit load that pass alone; reproduce and repair if encountered in the implementation, preserve the first failure evidence, and do not count a passing retry as proof of success. Keep global timeout-policy changes separate unless this implementation demonstrates they are required.
- [ ] **Integration:** Run every matrix case that drives a rendered hook or installed consumer, then `pnpm test:integration`.
- [ ] **Full Local Gate Suite:** The build workflow runs the declared gate through `bkit:gate:static-unit-integration`, with `pnpm bkit check` and generated-output checks.
- [ ] **Build Configuration:** Preserve existing tsconfig test exclusions and no runtime dependencies; regenerate render snapshots only after behavior is verified.
- [ ] **Dogfood:** Build, invoke `node dist/cli.js install` on a fresh scratch consumer under `tmp/` with supported host flags from current CLI help, inspect hooks/rules/templates/authoring.md and run built-CLI check there.
- [ ] **Timing and size:** Record the host version/documented timeout, runtime, machine/load, repetition count, elapsed cold-start duration and full serialized response size for maximum/unavailable inputs. Measure serially with no parallel audit/test workers so scheduler contention is visible rather than silently attributed to detector cost; retain any failure evidence. The result proves local adapter execution only.
- [ ] **Synchronization:** Existing hook parity, dogfood, install and instruction tests are repaired in their owning tasks. No database replay, E2E or deployed @live tier applies to this package.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** Automated checks have concrete output; unavailable live host visibility remains explicitly unverified.

### Manual Verification

Owner-run acceptance checks are advisory. Unticked checks do not block plan approval or merge.

- [ ] Inspect the fresh/upgrade consumer's matching tool registrations and the shared advice from safe literal shell/edit examples.
- [ ] Confirm preserved custom driver text and the documented default Cursor additional_context boundary.
- [ ] Read the host table as separate interception, delivery and timing claims; do not infer live visibility from local fixture responses.
