<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

# Centralise install code into `.bkit/` — Sub-Plan 4: Docs/prose atomic update + rules.md byte-equality CI gate (WS-6, WS-7 / #166, #167)

**Parent Plan:** [`160-centralise-install-code-plan.md`](./160-centralise-install-code-plan.md)

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual `160-centralise-install-code-plan-4.md` file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

> [!CAUTION]
> **DEPENDENCY — Sub-Plan 2 first; MERGE-GATED, same PR.** This sub-plan edits prose that references the relocated paths and adds the rules.md byte-equality gate against `.bkit/templates/.agents/rules.md`. It MUST NOT begin until [`160-centralise-install-code-plan-2.md`](./160-centralise-install-code-plan-2.md) Gate WS-3 (move complete) is `[x]` — the paths must exist before prose can point at them. Per the umbrella Merge Method, these doc/shipped-config updates are **merge-gated with the code move** (stale paths would ENOENT setup commands and silently drift consumer `rules.md`): WS-6 + WS-7 ship in the SAME squash PR as Sub-Plan 2's move. This sub-plan is INDEPENDENT of Sub-Plan 3 (verification) — either order after Sub-Plan 2 — but BOTH must complete before merge.

## Context & Goals

Issue #160 centralises bkit's install machinery into a single `.bkit/` root. Sub-Plan 2 physically relocated the trees and re-pointed all ENGINE-SOURCE references. This sub-plan covers the **consumer-facing prose, setup commands, shipped config, and the CI gate** that keep external surfaces consistent with the move, plus the new `decisions.md` entry.

**This sub-plan covers WS-6 (authoring-rule, docs & shipped-config drift) and WS-7 (rules.md byte-equality CI assertion).** It re-points `.agents/rules.md`, `docs/setup.md`, `docs/architecture.md`, `docs/deployments.md` (incl. the shipped `renovate.json5` template), `docs/testing.md`, `docs/technology.md`, `docs/knowledge.md` (forward-looking only), and greps the remaining prose surfaces; then adds the `bkit-rules-sync.test.ts` managed-block byte-equality gate (block-scoped, D3) and a new `docs/decisions.md` entry. It also carries the final Gate 2 / Gate 3 implementation + docs checkpoints for the whole #160 workstream.

**Success Criteria (this sub-plan):**

- No setup/authoring doc points at a relocated source path; shipped `renovate.json5` `ignorePaths` updated to `.bkit/templates/**` in lockstep with the move.
- `bkit-rules-sync.test.ts` (or CI lint) asserts the managed `bkit:start`→`bkit:end` block byte-equals between `.agents/rules.md` and `.bkit/templates/.agents/rules.md`; the `### bkit Repo Authoring` section is never compared (D3).
- A new `docs/decisions.md` DE-\* entry records the block-scoped gate; DE-19 unmodified.

## Binding Decisions (apply in this sub-plan)

- **D1 — drop + upgrade auto-clean:** WS6-T2 fixes the `docs/deployments.md` Renovate note AND the shipped `renovate.json5` comment block (lines 66-70) that falsely describes `.agents/templates/**` as a consumer-written mirror — post-D1 consumers no longer receive `.agents/templates/`.
- **D2 — `dist/` stays at root:** doc topology updates describe `.bkit/src` + `.bkit/templates` but keep `dist/` flat at root.
- **D3 — `rules.md` block-scoped gate:** WS7-T1 compares the managed `bkit:start`→`bkit:end` block ONLY; the `### bkit Repo Authoring` section (`.agents/rules.md:98`, outside markers) is bkit-repo-only — never ships, never compared. There is nothing to "reconcile."

## Acceptance Scenario slice (relevant to this sub-plan)

> The full Acceptance Scenario + Human Confirmation live in the root sub-plan ([`160-centralise-install-code-plan-1.md`](./160-centralise-install-code-plan-1.md)). The slice this sub-plan realises:

- Concrete Example step 1 — the shipped `renovate.json5` `ignorePaths` glob change (`.agents/templates/**` → `.bkit/templates/**`) that prevents consumer Renovate onboarding-PR noise (WS6-T2).
- Edge case: `rules.md` `### bkit Repo Authoring` section never ships / never trips the gate (WS7-T1, D3); the `renovate.json5` source edit vs the WS-4 empty-diff gate (the flag-parity invariant — the source-template edit is opt-in and absent from the default-flow hashed set, so it does not perturb Sub-Plan 3's WS4-T1/T3).

## Edge Cases (relevant slice)

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| `rules.md` `### bkit Repo Authoring` section (outside `bkit:start/end`) ships to consumers or trips the WS-7 gate | WS-7 gate compares the managed `bkit:start`→`bkit:end` block ONLY; the bkit-repo-only section at `rules.md:98` is never shipped, never compared (D3). (WS7-T1.) |
| WS-6 `renovate.json5` `ignorePaths` source edit vs WS-4 "hash-set diff is empty" | `.github/renovate.json5` is opt-in (`bkit install --renovate`), absent from the default-flow writes — so the source-template edit never perturbs the default-flow hashed set Sub-Plan 3 verifies. If `--renovate` IS exercised, the lone permitted delta is `.github/renovate.json5` reflecting `ignorePaths: [".bkit/templates/**"]`. (WS6-T2.) |

## Derived Test Matrix (row owned by this sub-plan)

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| (WS-7) bkit's own `.agents/rules.md` managed block byte-equals `.bkit/templates/.agents/rules.md` block | Unit (Vitest) or CI lint | `.bkit/src/bkit-rules-sync.test.ts` (NEW) (WS7-T1) |

## Out of Scope

- The physical move + engine-source re-points (Sub-Plan 2) — engine-source prose under `.bkit/src/**` is covered by Sub-Plan 2's WS3-T11 / Gate WS-3, NOT this sub-plan.
- The seam + baseline (Sub-Plan 1); the two-axis verification (Sub-Plan 3).
- Rewriting historic `KN-*` incident narrative or commit-hashed `Related:` refs in `docs/knowledge.md` (only forward-looking rules text is updated).
- `.agents/skills.md` stays curated manually (no auto-registration) — no change.

## Merge Method

**Merge method: always squash.** These doc/shipped-config updates are merge-gated with the code move — they ship in the SAME atomic PR as Sub-Plan 2. WS-7 may be a separate commit within that PR or a follow-up PR, but the move + docs + verification ship together. No `rebase`/`merge-commit`.

## Supersession Inventory

None executed in this sub-plan — the DELETE rows (`.agents/scripts/**`, `.agents/templates/**`, dead arm, inline literals, consumer orphan) are executed in Sub-Plan 2 / asserted in Sub-Plan 3. This sub-plan re-points prose and adds the gate.

## Security & Privacy

None — docs/prose + a CI lint test; no new routes, DB writes, secrets, or user input.

## Architecture & Component Changes

### rules.md byte-equality gate (WS-7)

#### [NEW] `.bkit/src/bkit-rules-sync.test.ts`

- Asserts bkit's own `.agents/rules.md` managed `bkit:start`→`bkit:end` block byte-equals `.bkit/templates/.agents/rules.md`'s block. Compare the MANAGED BLOCK ONLY (never the whole file); the `### bkit Repo Authoring` section (line 98, outside markers) must never be compared (D3). (WS7-T1.)

## Documentation Updates

> Index: `.agents/docs.md`. These are **merge-gated with the code move** (Sub-Plan 2) — not follow-ups.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `.agents/rules.md` | Re-point two-way sync rule (line 102) → `.agents/rules.md ↔ .bkit/templates/.agents/rules.md`; add central principle ("install source of truth lives in `.bkit/`; bkit's own agent runtime lives in `.agents/` exactly as a consumer's does"); re-point preflight ref (line 106) → `.bkit/src/bkit-preflight.ts`. NOTE: the `### bkit Repo Authoring` section is OUTSIDE `bkit:start/end` (line 98) — edit it directly; it never ships. (WS6-T1.) |
| `docs/setup.md` (53-54) | Dogfood commands → `pnpm tsx .bkit/src/bkit-install.ts install` / `... check`. (WS6-T2.) |
| `docs/architecture.md` (30, 48) | Tree entries `.agents/scripts/` → `.bkit/src/`; `.agents/templates/` → `.bkit/templates/`. (WS6-T2.) |
| `docs/technology.md` (22, 39) | Source-language row + `tsc` compile-target row: `.agents/scripts/*.ts` → `.bkit/src/*.ts`. (WS6-T2.) |
| `docs/testing.md` (37, 51) | Test-colocation rule (37) + CI-parity rule (51): `.agents/scripts/` → `.bkit/src/`. (WS6-T2.) |
| `docs/deployments.md` | Build-freshness rule (193) → `.bkit/src/*.ts`; ci.yml/template/husky refs (197, 202, 214, 260) → `.bkit/templates/...`; Renovate `ignorePaths` note (211) → `.bkit/templates/**` AND the shipped `renovate.json5` template glob (line 81) AND its lines 66-70 comment block (which falsely describes `.agents/templates/**` as a consumer-written mirror post-D1) in lockstep. (WS6-T2.) |
| `docs/knowledge.md` | Forward-looking rules text ONLY (e.g. KN-7, line 162 `.agents/scripts/*.ts` build rule). Do NOT rewrite historic KN-* narrative or commit-hashed `Related:` refs. (WS6-T2.) |
| `README.md`, `.agents/docs.md`, `.agents/workflows.md`, `.bkitignore` (header comment), `.github/workflows/ci.yml:82` (+ its template source) | Grep `\.agents/(templates\|scripts)` and re-point any hits. (WS6-T3.) |
| `docs/decisions.md` | Append the WS-7 rules.md byte-equality gate decision (block-scoped) if not already recorded. (WS7-T2.) |
| `docs/completed.md` | (Ship phase) one entry for #160 on merge. |

_`.agents/skills.md` stays curated manually (no auto-registration) — no change._

## Hand-off artifacts

**CONSUMED from Sub-Plan 2:** the relocated `.bkit/src/` + `.bkit/templates/` trees (so prose can point at real paths), and `.bkit/templates/.agents/rules.md` (created by WS3-T1 `git mv`) — the WS7-T1 gate's source-of-truth target.

**PRODUCED:** atomically-updated docs + shipped `renovate.json5`, the `bkit-rules-sync.test.ts` gate, and the new `decisions.md` entry. No further child depends on this sub-plan; it is a leaf (alongside Sub-Plan 3).

## Rollback Strategy

Code-only — `git revert {squash-merge SHA}` restores prose, shipped config, and the gate atomically with the move.

## Agent Execution Runbook

[Chronological. This sub-plan starts ONLY after Sub-Plan 2 Gate WS-3 is green and committed; it ships in the SAME squash PR as the move.]

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, DO NOT fail silently. Create a tracker issue (label `blocker`) with context before stopping.
> **Step Isolation:** Complete each task fully (including its verification) before starting the next.
> **No per-edit `bkit install`:** Do NOT run `pnpm bkit install`/mirror-regen after every edit. Defer mirror regeneration to end-of-session (per MEMORY).

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable.

### Phase WS-6 — Authoring-rule, docs & shipped-config drift (#166; requires Sub-Plan 2; merge-gated, same PR)

- [ ] **WS6-T1:** Update `.agents/rules.md` (sync rule line 102, central principle, preflight ref line 106).
  - **Done when:** line 102 reads `.agents/rules.md ↔ .bkit/templates/.agents/rules.md`; central principle present; line 106 reads `.bkit/src/bkit-preflight.ts`.
- [ ] **WS6-T2:** Update `docs/setup.md`, `docs/architecture.md`, `docs/deployments.md` (incl. Renovate `ignorePaths` note AND the shipped template at `.bkit/templates/.github/renovate.json5` — moved from `.agents/templates/.github/renovate.json5` by WS3-T1 — both the `ignorePaths` glob entry at line 81 (`.agents/templates/**` → `.bkit/templates/**`) AND the comment block at lines 66-70 that falsely describes `.agents/templates/**` as a consumer mirror "written into the consumer working tree by `bkit install`/`bkit upgrade`" — post-D1 consumers no longer receive `.agents/templates/`; leave the `.agents/skills/**` line correct), `docs/testing.md` (37 test-colocation rule, 51 CI-parity rule), `docs/technology.md` (22 source-language row, 39 `tsc` compile target), `docs/knowledge.md` (forward-looking only).
  - **Done when:** no `.agents/scripts`/`.agents/templates` references remain in those docs except historic KN-\* narrative; the shipped `.bkit/templates/.github/renovate.json5` `ignorePaths` entry reads `.bkit/templates/**` (no `.agents/templates/**` entry remains) AND its lines 66-70 comment no longer describes `.agents/templates/**` as a consumer-written mirror. (This SOURCE-template content change is the one expected hash delta IF `--renovate` is exercised — see Sub-Plan 3 WS4-T1; it does not perturb the default-flow hashed set.)
- [ ] **WS6-T3:** Grep `\.agents/(templates|scripts)` across `docs/`, `README.md`, `.agents/docs.md`, `.agents/workflows.md`, `.bkitignore`, `.github/workflows/ci.yml` (+ its template source) and re-point all hits. (Engine-source prose under `.bkit/src/**` is NOT in this task's scope — it is covered by Sub-Plan 2's WS3-T11 / Gate WS-3.)
  - **Done when:** `rg '\.agents/(templates|scripts)'` across those paths returns zero non-historic, non-dest-relative hits.

### 🔒 Gate WS-6: docs atomic with move

- [ ] **Gate WS-6 - Verified:** No setup/authoring doc points at a relocated source path; shipped-config (`renovate.json5`) updated in lockstep.

### Phase WS-7 — rules.md byte-equality CI assertion (#167; requires WS-6; bundled per D3)

- [ ] **WS7-T1:** Add a CI gate/test asserting bkit's own `.agents/rules.md` managed `bkit:start`→`bkit:end` block byte-equals `.bkit/templates/.agents/rules.md`'s block. Compare the MANAGED BLOCK ONLY (never the whole file); the `### bkit Repo Authoring` section (line 98, outside markers) must never be compared.
  - **Done when:** `bkit-rules-sync.test.ts` (or CI lint) passes; deliberately mutating the managed block of one file makes it fail; mutating the `### bkit Repo Authoring` section does NOT fail it.
- [ ] **WS7-T2:** Append a NEW `docs/decisions.md` entry for the block-scoped rules.md equality gate (the core move is already DE-19; do NOT rewrite DE-19). Cite the D3 constraint (managed block only; `### bkit Repo Authoring` excluded).
  - **Done when:** a new DE-\* entry exists describing the gate, its block-scoped constraint, and the discarded whole-file-comparison alternative; DE-19 unmodified.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below.

- [ ] **Gate 2 - Verified:** Every WS-1/WS-3/WS-5/WS-6/WS-7 implementation task (across all four sub-plans) independently verified and checked off.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** Every matrix row maps 1:1 to a checked-off task — dogfood no-op (WS1-T6), fail-loud guard (WS1-T5), getPkgRoot 3-context unit test (WS1-T7), install/upgrade two-axis (WS4-T1..T4), dry-run-parity (WS3-T10 re-point + WS4-T6 re-verify of the EXISTING file), pack-filelist (WS4-T5), doctor line (WS5-T1), snapshot (WS3-T10), WS-7 block equality (WS7-T1).
- [ ] **Update existing tests:** every test file reported by `rg '\.agents.{0,2}templates' .bkit/src --glob '*.test.ts'` (the live grep set — NOT a count-pinned number; incl. `bkit-preflight.test.ts` and the EXISTING `bkit-dry-run-parity.integration.test.ts`) re-pointed and green.
- [ ] **Engine-source prose re-pointed (WS3-T11):** consumer-facing error message at `bkit-modules.ts:1255` re-points to `.bkit/templates/.github/workflows/ci.yml`; engine-source comment/docstring references re-pointed; Gate WS-3 source-grep returns dest-only.
- [ ] **Write new tests:** dogfood-noop integration test (WS1-T6); getPkgRoot 3-context unit test (WS1-T7, dist arm explicitly asserted); WS3-T5 orphan-removal smoke test; WS-7 rules-sync test. (Dry-run-parity and doctor tests already EXIST — re-pointed, not authored.)
- [ ] **Verify observability:** `bkit doctor` templates-root line + fail-loud guard message both follow `[Context] Message`.
- [ ] **Update documentation:** WS-6 doc updates complete; `.agents/docs.md` still accurate (no new doc files added).

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** Every `Documentation Updates` row completed.
- [ ] **Gate 3 - Verified:** Every checkbox above independently verified.

> [!IMPORTANT]
> **Final merge readiness:** This sub-plan's Gate WS-6 / Gate 2 / Gate 3, together with Sub-Plan 3's Gate WS-4 (byte-identical oracle) and Gate 4 (automated verification), must ALL be green before the single squash PR merges (per the umbrella Merge Method). Both Sub-Plan 3 and Sub-Plan 4 are leaves depending on Sub-Plan 2; neither blocks the other, but both gate the merge.
