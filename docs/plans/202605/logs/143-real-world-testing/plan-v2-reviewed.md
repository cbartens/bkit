Verdict: PASS

<!-- verdict:end -->

<!-- Note: Plans live at `docs/plans/{YYYYMM}/{FID}-plan.md` (canonical month bucket). `{YYYYMM}` = creation month, set once at design start. Logs sit at `docs/plans/{YYYYMM}/logs/{FID}/` and are delete-eligible. -->

<!--
plan-generate verdict: PASS-WITH-BLOCKERS
- Translates the REVISED design body (authoritative over the stale top-of-file `Verdict: PASS`).
- WS numbering reconciled against the design body's `## Design Workstreams` (WS-1..WS-8) — matches the session prompt's revised taxonomy, NOT the stale 7-WS organise comment.
- Two human-gate blockers raised (see Breaking Changes section): (B1) the rename back-compat decision; (B2) the installer-managed-key rename blast radius is materially larger than the session prompt's enumerated caller list (grep-verified — see below).
- Flag name standardised to LIVE_API per C16; surface vocabulary stays `live`. No API_LIVE residue carried into plan tasks.
-->

# Live (Non-Mock) Testing Gates for Plan / Build / Debug — Implementation Plan

> [!CAUTION]
> **CRITICAL:** Do not hallucinate plan execution state.
>
> 1. ALWAYS read this actual `plan.md` file natively via the `read_file` tool _before_ executing any steps.
> 2. NEVER trust system-generated session summaries or previous conversation history to determine what has been completed.
> 3. Your source of truth is EXCLUSIVELY the literal `[x]` vs `[ ]` checkboxes in this physical document. If a box is `[ ]`, it is NOT DONE, regardless of what the conversation context implies.

## Context & Goals

Three runtime-only bugs (#143) shipped green because every test was mocked: the mocks asserted the world the code _assumed_, so a typmod defect, a nil-UUID injection, and a token-budget overrun all passed CI and shipped. The fix is one missing invariant, not a new subsystem:

> A test that exercises the real integration boundary must EXIST, must FAIL before a fix, and must PASS after it — and when that test cannot be run, the green result must be loud, auditable, and never silently equated with "works."

This plan installs that invariant across plan (mandate the live test exists), build (it exists and passes before a PR is raised), and debug (it fails-then-passes around a fix, with a soak loop for iterative bug chains), reusing existing bkit machinery (the `jq -e .scripts[...]` discovery seam, the `OBSERVE_MODE` axis, the diagnose→remediate→run-tests retry loop, status.json per-step verdicts). It also installs a single script-naming standard (three groups `lint:*` / `check:*` / `test:*` + umbrella aggregates) and a two-axis testing taxonomy (tier × liveness via the `LIVE_API` env flag).

**This is the parent #143 plan covering the full workstream set WS-1..WS-8.**

**Success Criteria:**

- A plan task crossing an external boundary is flagged at plan-review if it lacks a paired non-mock test task with a ground-truth `Done when`.
- When a `:live`/smoke script is declared, build will not raise a PR and debug will not close green unless the live test passes; in debug it must be observed to FAIL before the fix and PASS after.
- When no `:live`/smoke script is declared (or `[live=off]`), all three gates degrade to CONCERNS, the workflow completes, and the skip is recorded in status.json AND on the always-written summary artifact / PR body.
- Soak mode is selectable for unknown-cause non-functional bugs; bounded by the existing `MAX_DEBUG_ATTEMPT` (= 3) cap shared across normal+soak.
- No new magic-number constant, no new config file type, no Unicode comparison operators; all consumer-facing text is free of internal refs.

---

## 👤 ⚠️ Acceptance Scenario — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> This is the testable contract for the feature. Everything below — implementation, tests, verification — is derived from what you confirm here. If this is wrong, everything downstream is wrong.
>
> **You do NOT need to read the rest of this plan.** Focus here. The agent handles the rest.

### Narrative _(inherited from design — do not rewrite)_

As a maintainer running bkit's plan/build/debug workflows, when my feature touches a real integration boundary I want the workflow to insist a non-mock test exists, fail before my fix and pass after it, so a runtime-only defect cannot ship green behind mocked tests. When my repo has no runnable live stack, I want the gate to step aside loudly and on the record rather than block me or pretend the green result proves the feature works.

### Success Criteria _(inherited from design — do not rewrite)_

- A plan whose tasks cross an external boundary (DB / API / model / network / migration) is flagged at plan-review time if it lacks a paired non-mock test task with a ground-truth `Done when`.
- When a `:live`/smoke script is declared, build will not raise a PR and debug will not close green unless the live test passes; in debug it must be observed to fail before the fix and pass after.
- When no `:live`/smoke script is declared (or `[live=off]`), all three gates degrade to CONCERNS, the workflow still completes, and the skip is recorded in status.json and stated in the close comment.
- Soak mode is selectable for unknown-cause non-functional bugs, running one accumulating-context agent that loops against the live test until green, bounded by the existing attempt cap.
- No new magic-number constant, no new config file type, and no Unicode comparison operators are introduced; all consumer-facing advisory text is free of internal refs.

### Concrete Example _(plan expands from design)_

**Setup:** A maintainer runs `/bkit-debug` on a feature whose e2e test passes mocked but the feature is non-functional against the real model. The consumer repo declares `test:smoke` in `package.json`.

**Steps:**

1. Maintainer invokes `/bkit-debug` → Worktree Setup resolves `LIVE_STACK = live` (a `test:smoke` script exists), persists `liveStack: live` onto the `debug-worktree-setup` status entry.
2. Step 4 area runs the `debug-reproduce` mini-step → `pnpm test:smoke` exits non-zero, the output has no infra signature → records `repro: fail`, `reproKind: functional`. Diagnose anchors on this ground truth, does not theorise past it.
3. A fix lands; Step 6 run-tests appends the live tiers LAST → the live test now passes → records `liveVerdict: PASS`, `repro: pass`. The fail-then-pass transition is satisfied → workflow closes green.
4. On a different repo with NO `test:smoke` declared, the same run resolves `LIVE_STACK = absent` → all live gates degrade to CONCERNS → the close comment / PR body / summary artifact carries `Live verification skipped - runtime-only defects not gated (no live test declared, or opted out).`

**Outcome:** The maintainer sees a debug run that empirically proved the feature works against the real boundary (fail-then-pass), or — on a stackless repo — a green result explicitly marked as mock-only on an always-written surface.

### Edge Cases _(plan expands from design's Key Edge Cases)_

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Vacuous pass — live test exits 0 without reaching the stack (creds absent) | reproduce-first records `repro: pass`, so empirical-verify's required fail-then-pass transition is absent → flagged; cannot satisfy the gate. |
| Live boundary reached but verification fails | The ONE case that does NOT degrade — hard FAIL routed into the existing retry loop (back to diagnose if `TEST_ATTEMPT <= MAX_TEST_ATTEMPT`). |
| Credentials missing in CI | Capability checks EXISTENCE only → resolves `live`; creds failure surfaces at run time as non-zero classified `reproKind: infra` → CONCERNS reason `live-stack-infra-failure`, NOT a hard FAIL nor a misleading `repro: fail`. Diagnose told to treat as environment problem. |
| `[live=off]` opt-out flag in input artifact | `LIVE_STACK = off` → all gates degrade to CONCERNS; skip recorded + audited on the always-written surface. |
| No `:live`/smoke script declared at all | `LIVE_STACK = absent` → CONCERNS; audited. |
| Soak requested without a live stack | Step 2 capability resolution downgrades `OBSERVE_MODE` from `soak` to `off` BEFORE any guard runs, persists `soakDowngradeReason: live-stack-unavailable`, records CONCERNS → standard `off` diagnose→remediate path runs; the downgrade is surfaced in the always-written summary. Never a mock-only soak. |
| Soak loop exhausts shared `MAX_DEBUG_ATTEMPT` budget with live test still failing | Records `liveVerdict: FAIL` → routes to Failure Path / `@bkit-debug-abort-handover`; handover carries accumulated context + fixes-so-far; fresh `/bkit-debug` (new budget 3) continues a deeper chain. |
| Diagnose subagent detects the failure SIGNATURE moved mid-run | Emits machine-parseable `Handoff: soak` verdict; orchestrator switches REMAINING shared budget to soak IF budget remains AND `liveStack == live`; ONE-WAY only; the handoff diagnosis does NOT burn an attempt. |
| Resume mid-run | `liveStack` resolved once and persisted; resumed workflow reads the same capability + `OBSERVE_MODE` (now incl. `soak`). |
| Mislabeled mock suite declared as a `:live`/smoke script | Accepted residual limit — bkit cannot know which deps are external; surfaced as an open risk, not silently assumed away. |
| Gate 4 verdict-enum collision | The `debug-reproduce` CONCERNS (`REPRO=pass` / `reproKind=infra`) rides the new `debug-reproduce` step's own verdict (`PASS \| CONCERNS \| skip`), NOT routed through Gate 4's narrower `DIAGNOSE_VERDICT in PASS\|FAIL` assertion. Gate 4 is NOT widened (out of scope). |

### Derived Test Matrix

> Each row → one Agent Execution Runbook task. bkit is a markdown-workflow + installer CLI toolkit; "tests" here are the installer/manifest unit+integration test suite (vitest), snapshot tests, and the existing release-workflow assertions — NOT live API tests (bkit declares all `:live`/smoke scripts ABSENT by design — see Out of Scope).

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| CI manifest mints `check:type` (not `typecheck`) as the managed CI script key | Unit (Vitest) | `.agents/scripts/bkit-manifest.test.ts` |
| Lint manifest mints `check:format` (not `format:check`) as the managed lint script key | Unit (Vitest) | `.agents/scripts/bkit-manifest.test.ts` |
| `ensurePackageJsonScripts` adds/preserves the renamed `check:type` / `check:format` keys | Unit (Vitest) | `.agents/scripts/bkit-tiers.test.ts` |
| Package-json prune removes renamed keys when value matches bkit default | Unit (Vitest) | `.agents/scripts/bkit-package-json.test.ts` |
| `runCiModule` seeds `check:type`; `runLintModule` seeds `check:format` | Integration (Vitest) | `.agents/scripts/bkit-modules.integration.test.ts` |
| Discovery resolves a legacy-named consumer (`typecheck`/`format:check`) under back-compat probing (B1=a) — a `:live`/smoke AND an un-migrated consumer are still discovered/gated after the rename (the load-bearing B1 invariant; bound to WS1-5's back-compat assertion + the WS1-7 legacy fixtures) | Unit/Integration (Vitest) | `.agents/scripts/bkit-tiers.test.ts` (the discovery-probe test) |
| Seeded ci.yml runs `lint check test` on PR + a `test:smoke` step gated `if: github.event_name == 'push'` | Integration (Vitest) | `.agents/scripts/bkit-release-workflow.test.ts` + ci.yml content/snapshot test |
| Templates content snapshot reflects renamed scripts + new ci.yml smoke job | Snapshot (Vitest) | `.agents/scripts/__snapshots__/bkit-templates.content.test.ts.snap` |
| Seeded `test` umbrella expands to MOCKED tiers only — never `:live`/`test:smoke` (guards the cost-blast-radius invariant: a bare `pnpm test` must never hit live APIs/spend) | Snapshot/Content (Vitest) | `.agents/scripts/__snapshots__/bkit-templates.content.test.ts.snap` (or the template-content test) |
| `dist/` mirror regenerated and byte-fresh after `bkit-manifest.ts` / `bkit-modules.ts` edits | Verification | `pnpm check:dist` (CI gate) |
| `docs/testing.md` managed block carries the full tier table + `lint`/`check`/`test` groups + `@live`/`@smoke` tags + `LIVE_API` flag | Content assertion | existing `bkit-templates.content.test.ts` (or equivalent template-content test) |
| `bkit check` reports zero template/mirror drift after all `.agents/` edits | Verification | `pnpm bkit check` (CI gate) |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## 👤 ⚠️ Breaking Changes & Naming Review — HUMAN REVIEW REQUIRED

> [!CAUTION]
> **🛑 HUMAN MUST READ AND CONFIRM THIS SECTION.**
> Review proposed names and breaking changes below. This is the only other section requiring your attention.

### Proposed names (new / renamed)

- **Script renames (bkit-managed convention):** `typecheck` → `check:type`; `format:check` → `check:format`. `format` (prettier `--write`) is UNCHANGED (mutating action, not a check).
- **bkit-repo-only scripts (outside `bkit:start/end`):** `check:dist` (unchanged name, already bkit-only); `check:bkit` (NEW name for the former `pnpm bkit check` invocation; bkit-repo only).
- **New umbrella aggregates:** `lint` → all `lint:*`; `check` → all `check:*`; `test` → MOCKED tiers ONLY (`test:unit` + `test:integration` + `test:e2e`).
- **New test-tier scripts (consumer convention, bodies are the consumer's job):** `test:unit`, `test:integration`, `test:e2e`, `test:integration:live`, `test:e2e:live`, `test:smoke`.
- **In-code env var: `LIVE_API`** (per C16 — NOT `API_LIVE`). Surface vocabulary stays `live`: `:live` script suffix, `@live`/`@smoke` tags, `.env.live`.
- **New `OBSERVE_MODE` value: `soak`** (extends `off | instrument | analyse`).
- **New prompt file:** `.agents/prompts/bkit-debug-soak.md` (+ its `.claude/` / `.cursor/` mirrors).
- **New status.json step kinds:** `debug-reproduce`, `debug-soak`. New optional fields: `liveStack`, `repro`, `reproKind`, `liveVerdict`, `failureSignatureMoved`, `liveReason`, `soakDowngradeReason`, `soakIterations`.

> [!CAUTION]
> **🚩 BLOCKER B1 — back-compat strategy for the script rename (the design-input UNRESOLVED item). HUMAN MUST PICK.**
>
> bkit's workflows discover scripts by existence (`jq -e .scripts[...]` and the `for s in typecheck test format:check ...` fallback loops). Renaming the shipped convention (`typecheck`→`check:type`, `format:check`→`check:format`) breaks existing consumers still on the old names. The plan's RECOMMENDED option is **(a) probe BOTH legacy and new names** in the workflow discovery loops and the installer's managed-key reconciliation (back-compat) — because bkit CANNOT rename a consumer's scripts, so a probe-new-only design silently stops gating every un-migrated consumer. Option (b) is a breaking major bump + a migration advisory.
>
> **Plan recommendation: (a) back-compat probing.** Rationale: (1) bkit ships TO consumers and cannot mutate their `package.json` script names; (2) the discovery seam already iterates a list, so adding the legacy name to the probe set is low-cost; (3) a silent gate-disablement on un-migrated repos recreates the exact #143 failure (a gate that quietly stops firing). The installer continues to seed the NEW names for fresh installs and on upgrade (managed-key add-if-missing), while the workflow discovery loops probe `check:type OR typecheck` and `check:format OR format:check` until a future major drops the legacy alias. **If you judge this needs design escalation rather than a plan decision, say so — the plan flags it as a decision that materially shapes WS-1/WS-3 and is recorded in `docs/decisions.md` (DE entry, Task 0).**

> [!CAUTION]
> **🚩 BLOCKER B2 — the rename's caller surface is materially larger than the session prompt enumerated. HUMAN MUST ACK the expanded scope.**
>
> The session prompt listed callers as: `package.json`, `ci.yml`, `release.yml`, husky/lint-staged, `.agents/workflows.md`. A grep of the worktree shows the rename ALSO touches the **installer machinery and its mirrors**, because `typecheck`/`format:check` are bkit-MANAGED keys minted by the installer:
>
> - `.agents/scripts/bkit-manifest.ts` (`CI_MANIFEST` `scripts: { typecheck }`, `LINT_MANIFEST` `scripts: { "format:check" }`)
> - `.agents/scripts/bkit-modules.ts` (the `runCiModule` / `runLintModule` defaults + the no-op-note prose + pre-push advisory strings referencing the names)
> - **The workflow/prompt DISCOVERY-SEAM callers — the `pnpm turbo lint typecheck test` aggregate lines AND the single-package `for s in typecheck test format:check ...` fallback LOOPS that iterate LITERAL script names (NOT aggregates).** These ARE the seam B1 exists to protect; after bkit renames its OWN `package.json` away from `typecheck`/`format:check`, a loop still listing only the old names makes `jq -e .scripts["typecheck"]` return non-zero → the gate silently no-ops = the exact #143 silent-gate-disablement (recorded at `docs/knowledge.md:365`). Grep-verified sites:
>   - `.agents/workflows/bkit-debug.md` lines 303 (Step 3 context-fetch aggregate), 493/496 (Step 6 aggregate + fallback loop), 637/640 (Step 9 instrument aggregate + loop), 746/748 (Step 11 revert aggregate + loop).
>   - `.agents/workflows/bkit-build.md` lines 710/713 (Step 13 aggregate + fallback loop).
>   - Eight `.agents/prompts/*.md`: `bkit-build-plan-execute.md` (47), `bkit-build-plan-gaps-remediate.md` (49), `bkit-build-challenge-remediate.md` (46), `bkit-build-challenge-tests.md` (45), `bkit-debug-failure-remediate.md` (52), `bkit-debug-observe-instrument.md` (49), `bkit-ship-conflict-resolve.md` (56,58), `bkit-utility-compress-markdown.md` (79 — example string).
>   - `.agents/workflows.md` NON-catalog lines 523, 636, 643, 649, 651 (prose/sub-fetch mentions) IN ADDITION to the catalog rows 621/646/972/975 already in WS-8.
>   - Per B1=(a): aggregate path `pnpm turbo lint typecheck test` -> `pnpm turbo lint check test`; the literal `for s in ...` lists gain BOTH `check:type typecheck check:format format:check` (probe-both). ALL in the SAME atomic WS-1 change or it is red-CI / silent-gate on first run.
> - `.agents/scripts/bkit-tiers.test.ts`, `bkit-package-json.test.ts`, `bkit-manifest.test.ts`, `bkit-modules.integration.test.ts`, `bkit-release-workflow.test.ts` (test fixtures/assertions on the names)
> - `.agents/scripts/__snapshots__/bkit-templates.content.test.ts.snap` (snapshot of seeded ci.yml + scripts)
> - `dist/bkit-manifest.js`, `dist/bkit-modules.js` (the SHIPPED compiled mirror — regenerated by `pnpm build`)
> - `.agents/templates/.github/workflows/ci.yml`, `.agents/templates/.husky/pre-push`, `.agents/templates/.agents/rules.md`, `.agents/templates/docs/{testing,security,deployments}.md` (consumer templates)
> - `.claude/commands/*`, `.claude/agents/*`, `.cursor/commands/*`, `.cursor/agents/*` (the IDE-surface mirrors of every workflow/prompt — regenerated by `pnpm bkit install`)
> - `docs/{technology,setup,deployments,knowledge,testing,security}.md`, `.agents/rules.md`, `.agents/prompts.md`, `.agents/README.md`, `CHANGELOG.md` (reference-doc mentions)
> - `tests/fixtures/**` (consumer-shape fixtures — note: these encode CONSUMER package.json/husky on the OLD names; with back-compat (B1=a) they should KEEP the old names to PROVE back-compat probing works, NOT be renamed).
>
> **Consequence:** the rename is genuinely "atomic-or-red-CI". Every caller in the SAME PR. The `.claude/` / `.cursor/` mirrors and `dist/` are regenerated (NOT hand-edited) via `pnpm bkit install` + `pnpm build`, batched at session end (per the no-per-edit-`bkit install` rule). The `tests/fixtures/**` back-compat fixtures are deliberately left on legacy names to assert option (a).

> [!WARNING]
> **`bkit-repo declares ALL `:live`/smoke scripts ABSENT by design.`** bkit's own suite tests the install scripts and has no live boundary, so the plan must NOT add `test:smoke` / `:live` script BODIES to bkit's own `package.json`, and must NOT add live test files. bkit's live gates degrade to CONCERNS by design. The `check:dist` / `check:bkit` / absent-live-stack declaration sit OUTSIDE the `bkit:start/end` markers per the bkit-repo-vs-consumer scoping rule.

> [!IMPORTANT]
> **Merge / sequencing note:** This parent plan covers WS-1..WS-8. The DAG (WS-1 → WS-2 → WS-3 → {WS-4, WS-5, WS-6} → WS-7 → WS-8) implies multiple commit-boundary-sensitive units. WS-1 (the atomic rename) MUST land as one self-contained change. If this plan is executed as sub-issues, decompose along WS seams into separate PRs rather than requesting a non-squash merge (see Merge Method).

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed all breaking changes and naming decisions above, including BLOCKER B1 (back-compat strategy) and BLOCKER B2 (expanded caller surface).

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`. Summary must issue `REVISE` if unchecked.

---

## Alternative Approaches & Recommendations

Rejected paths (from the design's `Approaches Considered` / `Decisions`, recorded so the implementer does not relitigate):

- **Structured `bkit-real-stack.md` config file** (B2-A) — REJECTED: new file type + parser + drift surface. The one load-bearing benefit (vacuous-pass detection) is preserved via the status.json fail-then-pass record.
- **Soak collapsed into the existing retry loop** (B3) — REJECTED: loses the accumulating-context property the issue credits with cracking the bugs. Soak stays a fourth `OBSERVE_MODE` value reusing `MAX_DEBUG_ATTEMPT` (no new constant).
- **Hard non-skippable live gate** (B1-B) — REJECTED: unsatisfiable on stackless consumers → ripped out wholesale. Replaced by capability-degrade-to-CONCERNS + loud audit.
- **Cross-workflow capability engine** (B1-C) — REJECTED as a subsystem; kept only as one persisted `liveStack` field (~15 lines of shell).
- **Two new standalone workflow steps for reproduce + verify** — REJECTED: gates on existing steps are cheaper and harder to skip. Only ONE new `debug-reproduce` mini-step is justified (the `repro` transition must be a status.json artifact).

**Future-phase recommendation (out of scope here):** a `[soak]`-iteration cap tighter than `MAX_DEBUG_ATTEMPT` for paid endpoints (open question in Risks) — deferred to `docs/pending.md`.

## Out of Scope

- **Writing live test BODIES or adding `test:smoke` / `:live` script bodies to bkit's own `package.json`.** bkit declares all `:live`/smoke scripts ABSENT by design; populating live tests is the consumer's (gether's) job.
- **Adding mocked `test:integration` / `test:e2e` to build's OWN run-tests step** — build's own step is `lint check test:unit` + `test:smoke` last; CI covers the mocked integration/e2e tiers on the resulting PR.
- **Widening Gate 4's `DIAGNOSE_VERDICT in PASS|FAIL` assertion** — pre-existing narrowing; the `debug-reproduce` CONCERNS rides its own step verdict instead (§I).
- **Issue #135 (bounded issue-scan)** — orthogonal invariant; only shared touchpoint is the `bkit-debug-failure-diagnose.md` edit (coordination note, not a merge). Do NOT assume sole ownership of that prompt.
- **A two-way soak↔normal crossover** — soak never hands back (would discard accumulating context).
- **A tighter per-paid-endpoint soak-iteration cap** — deferred to `docs/pending.md`.
- **A future major that DROPS the legacy `typecheck`/`format:check` probe aliases.** Under B1=(a) the discovery loops carry both names indefinitely; retiring the aliases once consumers migrate is a follow-up issue deferred to `docs/pending.md`, not this plan.
- **A `lint:no-tier-terms`-style CI guard that fails when a discovery loop lists a bare legacy script name without its renamed pair.** Mechanical guard that would have caught CRITICAL-1; worth a separate tooling issue, out of scope for #143.

## Merge Method

**Merge method: always squash.** Plans MUST NOT propose `rebase` or `merge-commit`. If executed as WS sub-issues, decompose along the WS DAG into separate squash-merged PRs rather than requesting a non-squash merge to preserve commit boundaries.

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `package.json#scripts.typecheck` (+ all managed-key/manifest/mirror occurrences) | `check:type` | DELETE (rename) | Single naming standard; `typecheck` retained ONLY as a legacy probe ALIAS in workflow discovery loops under B1=(a), not as a minted key. |
| `package.json#scripts.format:check` (+ all managed-key/manifest/mirror occurrences) | `check:format` | DELETE (rename) | Same naming standard; `format:check` retained ONLY as a legacy probe ALIAS under B1=(a). |
| `docs/testing.md` managed-block single `Real` Tiers row | Full tier table + `lint`/`check`/`test` groups + `@live`/`@smoke` tags + `LIVE_API` flag | DELETE (replace) | The single ad-hoc live-test row is superseded by the two-axis taxonomy. |
| `.agents/workflows.md` Debug Step 6 catalog row `lint typecheck test test:integration test:e2e` | `lint check test test:integration test:e2e test:integration:live test:e2e:live` | DELETE (replace) | Mirror must track the step edit (§H anti-drift). |
| `.agents/workflows.md` Build Step 13 catalog row `lint typecheck test` | `lint check test:unit test:smoke` | DELETE (replace) | Same anti-drift mirror. |
| `.agents/workflows.md` "Pre-PR vs debug" note (`lint+typecheck+unit`) | `lint check` aggregate naming + build/debug tier distinction | DELETE (replace) | Same anti-drift mirror. |
| Workflow/prompt discovery-seam aggregate lines + `for s in typecheck test format:check ...` fallback LOOPS (`bkit-debug.md` 303/493/496/637/640/746/748, `bkit-build.md` 710/713, eight `.agents/prompts/*.md`, `.agents/workflows.md` non-catalog 523/636/643/649/651) | `pnpm turbo lint check test` aggregate + `for s in` lists carrying BOTH `check:type typecheck check:format format:check` | DELETE (rename, probe-both) | The literal-name loops are the discovery seam B1 protects; un-renamed = silent gate-disablement (the #143 failure at `docs/knowledge.md:365`). Owned by WS1-8 (atomic with the rename); the `.agents/workflows.md` CATALOG rows 621/646/972/975 stay with WS-8 mirror lockstep. |

> [!CAUTION]
> **Default = `DELETE`.** The two script-rename rows are `DELETE` of the OLD minted key — the legacy NAME survives only as a discovery-probe alias under back-compat (B1=a), which is a runtime probe list, not a retained `@deprecated` export. Each row is mirrored in `Architecture & Component Changes` and the Runbook.

## Security & Privacy

None — no new routes, DB writes, secrets, or user input. The only env var introduced (`LIVE_API`) is a test-mode toggle read in-code by consumer test files; it is not a secret and is not added to bkit's own env schema (bkit has none). Consumer-facing advisory text introduced by this plan (the escape-hatch skip line) is verified to contain NO internal refs (no `KN-`/`BAR-`/issue numbers).

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Check conditional items only when applicable. Abort if anything required is missing.

### Core (always verify)

- [ ] **Package Management:** No new runtime deps. Verify `pnpm-lock.yaml` unchanged after edits (rename is scripts-only). `picomatch` stays the sole runtime dep.
- [ ] **Dependency Versions:** Pinned turbo version unknown until the WS-3 build-time spike runs (`pnpm turbo --version`); the `--dry-run` existence-probe MUST be validated against it or fall back to `jq -e` (see Task WS3-1). Spot-check `pnpm --version` (10.33.0), `tsc --version`.
- [ ] **User Context:** Read/write access to `.agents/**`, `docs/**`, `.github/workflows/**`, `.husky/**`, `package.json`, the `.claude/` + `.cursor/` mirror dirs (regenerated, not hand-edited).
- [ ] **Pending Blockers:** Query tracker for open `blocker`-labelled issues touching the testing taxonomy / script naming.
- [ ] **Project Context:** Re-read `docs/knowledge.md` (KN entries on dist freshness, hook bypass) and `docs/decisions.md` before WS-1.
- [ ] **Testing & Quality:** This plan REWRITES `docs/testing.md` (WS-2); align the strategy section with the new tier table.
- [ ] **Prerequisite Plans:** None — this is a root parent plan. Internal prerequisite is the WS DAG (WS-1 first).

### Conditional (verify only when applicable)

- [ ] **Architecture & UI** _(new files)_: New prompt `.agents/prompts/bkit-debug-soak.md` must follow the existing prompt-file shape (machine-parseable verdict header + `<!-- verdict:end -->`); validate against `bkit-debug-failure-diagnose.md` as the reference shape.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.** Once saved, immediately proceed to `Data Schema Integration`.

- [ ] **Acceptance Scenario confirmed:** Human confirmed `👤 Acceptance Scenario` section (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Breaking Changes confirmed:** Human confirmed `⚠️ Breaking Changes & Naming Review` section, including BLOCKER B1 + B2 (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Gate 1 - Verified:** All Core items checked. All applicable Conditional items checked.

## Data Schema Integration

### Data Schema Usage (Inputs & Outputs)

None — bkit is a markdown-workflow + installer CLI toolkit. The "schema" is the status.json shape and the consumer-facing `docs/testing.md` convention. No application database.

### Data Schema Changes

status.json additions (all optional fields layered onto existing step entries — no breaking change to the existing reader). `liveStack` cross-field invariant: `liveVerdict` is only meaningful when `liveStack == "live"`.

- **ADD field `liveStack`** on `debug-worktree-setup` / `build-worktree-setup` — `live | absent | off`.
- **ADD field `repro`** on `debug-reproduce` (new), `debug-run-tests`, `build-run-tests` — `fail | pass | skip`.
- **ADD field `reproKind`** on `debug-reproduce` (new) — `functional | infra | none`.
- **ADD field `liveVerdict`** on `debug-run-tests`, `build-run-tests`, `debug-soak` — `PASS | FAIL | CONCERNS | skip`.
- **ADD field `failureSignatureMoved`** on `debug-run-tests`, `debug-reproduce`, `debug-soak` — boolean.
- **ADD field `liveReason`** on `debug-close-workflow`, `build-close-workflow` — string (consumer-neutral).
- **ADD field `soakDowngradeReason`** on `debug-worktree-setup` — string (`live-stack-unavailable`).
- **ADD field `soakIterations`** on `debug-soak` — integer.
- **ADD step kind `debug-reproduce`** — reproduce-first gate execution.
- **ADD step kind `debug-soak`** — one soak-mode pass.
- **EXTEND `OBSERVE_MODE` enum** from `off | instrument | analyse` to `off | instrument | analyse | soak`.

## Architecture & Component Changes

> Topology: bkit is a single-package CLI + a markdown agent-workflow corpus under `.agents/`, with consumer templates under `.agents/templates/` and IDE-surface mirrors under `.claude/` and `.cursor/` (both REGENERATED by `pnpm bkit install`, never hand-edited). The compiled CLI lives in `dist/` (regenerated by `pnpm build`). Edits below are grouped by workstream.

### WS-1 — Script-naming standard (installer + CI + hooks)

#### [MODIFY] `package.json`

- **Existence Check:** exists. Rename `typecheck`→`check:type`, `format:check`→`check:format`. Add umbrella aggregates `lint` (→ all `lint:*`), `check` (→ all `check:*`; on bkit-repo also `check:dist` + `check:bkit`, OUTSIDE any consumer marker since bkit's root package.json is not a markered template), `test` (→ mocked tiers; bkit has only `test` today — keep `test` as the bkit suite runner, do NOT fold live tiers). Rename the `pnpm bkit check` invocation usage to a `check:bkit` script (bkit-repo only).

#### [MODIFY] `.github/workflows/ci.yml`

- **Existence Check:** exists (lines 61-91). Update step run-lines `pnpm typecheck`→`pnpm check:type`, `pnpm format:check`→`pnpm check:format` (or re-express as the `lint`/`check` aggregates). Add a `test:smoke` step gated `if: github.event_name == 'push'` (dev/main push only). bkit's own `test:smoke` is ABSENT so the step no-ops on bkit — but the SEEDED consumer ci.yml template carries it.

#### [MODIFY] `.github/workflows/release.yml`

- **Existence Check:** exists (lines 43, 49). Update `pnpm typecheck`→`pnpm check:type`, `pnpm format:check`→`pnpm check:format`.

#### [MODIFY] `.husky/pre-push`

- **Existence Check:** exists (lines 18-21, 25, 29). Update `pnpm typecheck`/`pnpm format:check` references (both the revert-branch bypass line and the normal line). Keep `pnpm bkit check` / `pnpm check:dist` (or `check:bkit`) bkit-repo-only lines outside any marker.

#### [MODIFY] `.husky/pre-commit`

- **Existence Check:** exists. Currently `pnpm lint-staged && pnpm lint:prose && pnpm lint:slop` — no rename needed unless re-expressed as `pnpm lint`. Verify lint-staged config (`package.json#lint-staged`) needs no key change (it globs `*`, not script names).

#### [MODIFY] `.agents/scripts/bkit-manifest.ts`

- **Existence Check:** exists. `CI_MANIFEST` `packageJsonKeys.scripts.typecheck`→`check:type` (line ~190); `LINT_MANIFEST` `packageJsonKeys.scripts["format:check"]`→`check:format` (line ~251). These are the minted-key SOURCE OF TRUTH for the installer.

#### [MODIFY] `.agents/scripts/bkit-modules.ts`

- **Existence Check:** exists. `runCiModule` default key (line ~1290-1295 `typecheck`→`check:type`), `runLintModule` default (line ~1449 `format:check`→`check:format`), and the advisory/no-op-note prose strings (lines ~490, ~509, ~922, ~1004, ~1039-1043, ~1473) referencing the old names. Under B1=(a), the workflow-discovery seam these modules emit must probe BOTH legacy + new names — verify whether discovery is emitted here or only in the workflow markdown (the `for s in ...` loops live in the workflow files; modules only mint the package.json keys).

#### [MODIFY] workflow/prompt DISCOVERY-SEAM loops + aggregate lines (B1=a probe-both)

- **Existence Check:** all exist (grep-verified). These are the literal `for s in typecheck test format:check ...` single-package fallback LOOPS and the `pnpm turbo lint typecheck test` aggregate lines — the actual workflow-discovery seam B1 protects. After WS1-1 renames bkit's own `package.json`, a loop still listing only `typecheck`/`format:check` makes `jq -e .scripts["typecheck"]` non-zero → the gate silently no-ops (the #143 silent-gate-disablement at `docs/knowledge.md:365`). For EACH site: (a) aggregate path `pnpm turbo lint typecheck test` -> `pnpm turbo lint check test`; (b) literal `for s in ...` list gains BOTH `check:type typecheck check:format format:check` (probe-both per B1=a). Sites:
  - `.agents/workflows/bkit-debug.md` lines 303 (Step 3 context-fetch), 493/496 (Step 6 — note WS-6 also appends live tiers here; keep the renames consistent), 637/640 (Step 9 instrument gate), 746/748 (Step 11 revert gate).
  - `.agents/workflows/bkit-build.md` lines 710/713 (Step 13 — note WS-5 also narrows `test`->`test:unit` + appends `test:smoke` here).
  - Eight `.agents/prompts/*.md`: `bkit-build-plan-execute.md`, `bkit-build-plan-gaps-remediate.md`, `bkit-build-challenge-remediate.md`, `bkit-build-challenge-tests.md`, `bkit-debug-failure-remediate.md`, `bkit-debug-observe-instrument.md`, `bkit-ship-conflict-resolve.md`, `bkit-utility-compress-markdown.md` (example string — update to keep the copied command in sync).
  - `.agents/workflows.md` NON-catalog lines 523, 636, 643, 649, 651 (the prose/sub-fetch aggregate mentions) — the catalog rows 621/646/972/975 are handled in WS-8; these non-catalog lines belong to WS-1's atomic rename so the Gate WS-1 grep finds no unowned hit.

#### [MODIFY] installer test suite (rename assertions)

- `.agents/scripts/bkit-manifest.test.ts`, `.agents/scripts/bkit-tiers.test.ts`, `.agents/scripts/bkit-package-json.test.ts`, `.agents/scripts/bkit-modules.integration.test.ts`, `.agents/scripts/bkit-release-workflow.test.ts` — update every assertion on `typecheck` / `format:check` to the new names; add an assertion proving back-compat probing (B1=a) where the discovery loop is tested.

#### [MODIFY] templates + reference docs

- `.agents/templates/.github/workflows/ci.yml`, `.agents/templates/.husky/pre-push`, `.agents/templates/.agents/rules.md`, `.agents/templates/docs/{testing,security,deployments}.md`; `.agents/rules.md`; `docs/{technology,setup,deployments,knowledge,testing,security}.md`; `docs/bkit-comparison.md` (line 68 — forward-looking `edit -> lint/typecheck/test -> edit` convention mention); `.agents/README.md`; `.agents/prompts.md` — update the `typecheck`/`format:check` mentions to the new aggregate naming. (knowledge.md / CHANGELOG historical entries: leave historical narrative intact; only update forward-looking command references.)

#### [REGENERATE — do NOT hand-edit] `dist/`, `.claude/`, `.cursor/`, snapshot files

- `dist/bkit-manifest.js`, `dist/bkit-modules.js` via `pnpm build`. `.claude/**`, `.cursor/**` via `pnpm bkit install`. `.agents/scripts/__snapshots__/bkit-templates.content.test.ts.snap` via `vitest -u`. Batch at session end (per the no-per-edit-`bkit install` rule).

#### [RETAIN — deliberately on legacy names] `tests/fixtures/**`

- `tests/fixtures/heavy-customised-consumer/package.json`, `tests/fixtures/heavy-customised-prepush/.husky/pre-push`, `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml`, `tests/fixtures/heavy-customised-consumer/husky-pre-commit`, `tests/fixtures/heavy-customised-consumer/AGENTS.md` — KEEP on `typecheck`/`format:check` to PROVE back-compat (B1=a) handles un-migrated consumers. (If B1=(b) is chosen instead, these become migration-advisory fixtures.)

### WS-2 — Consumer testing-taxonomy convention

#### [MODIFY] `docs/testing.md` + `.agents/templates/docs/testing.md`

- **Existence Check:** both exist. Inside the `<!-- bkit:start -->` managed block, REPLACE the single `Real` Tiers row with the full tier table (Unit / Integration / E2E + `:live` variants + Smoke), the `lint`/`check`/`test` script groups, the `@live`/`@smoke` tags, and the `LIVE_API` mode flag — consumer-neutral, NO internal refs. Record the bkit-repo "all `:live`/smoke ABSENT by design" choice OUTSIDE the markers.

### WS-3 — Capability-resolution + status.json + OBSERVE_MODE foundation

#### [MODIFY] `.agents/workflows/bkit-debug.md` (Worktree Setup, Step 2)

- **Existence Check:** exists. Append the `LIVE_STACK in {live, absent, off}` resolver after `pnpm install --frozen-lockfile` (line ~228), before the status-update sub-step (line 235-251). Read `[live=off]` from the input ARTIFACT (`debug-input-{DEBUG_ATTEMPT}.md`), then probe EXISTENCE of `test:integration:live | test:e2e:live | test:smoke` via `jq -e` (single-package) and `pnpm turbo run <task> --dry-run` (monorepo, WITH the validate-or-fallback spike). Persist `liveStack` + (when applicable) `soakDowngradeReason: live-stack-unavailable` and the soak→off downgrade onto the `debug-worktree-setup` jq object (line 248-249). Add gate-checklist item `[ ] LIVE_STACK resolved (live | absent | off)`.

#### [MODIFY] `.agents/workflows/bkit-build.md` (Worktree Setup)

- **Existence Check:** exists. Same resolver appended to build Worktree Setup; persist `liveStack` onto `build-worktree-setup`.

#### [STATUS.JSON SCHEMA] (documented in the workflow step text + summary prompts)

- The full field/step-kind/enum envelope (see Data Schema Changes) is introduced here as the shared foundation. There is no central schema file — the shape lives in the jq writes within the workflow steps and is read by the summary prompts; introduce the field NAMES + the `liveVerdict`-only-when-`liveStack==live` invariant + the shared-`MAX_DEBUG_ATTEMPT` semantics as the foundation other WS write to.

### WS-4 — Plan-phase non-mock mandate

#### [MODIFY] `.agents/prompts/bkit-plan-generate.md`

- **Existence Check:** exists. Add a Process instruction: for each `Agent Execution Runbook` task crossing an external boundary (DB/API/model/network/migration), include a paired non-mock test task whose `Done when` names the boundary AND the ground-truth signal. Pure-function tasks exempt (no forced live test). ASCII operators only.

#### [MODIFY] `.agents/prompts/bkit-plan-review-3.md`

- **Existence Check:** exists (regression-risk / design-coverage lens). Add a check: for each boundary-crossing task, assert a paired non-mock test task exists with a ground-truth `Done when`; mock-only or absent → CRITICAL reason `mock-only-coverage`. Static plan-task check; no runnable stack. Absorbed by the existing three-reviewer + max-wins merge — NO new agent/step.

#### [MODIFY] `.agents/workflows/bkit-plan.md`

- **Existence Check:** exists. Reflect the mandate + the new review-3 lens where the workflow describes `@bkit-plan-generate` / `@bkit-plan-review-3` scope (boundary-crossing tasks only).

### WS-5 — Build empirical-verify + e2e-smoke gate + escape-hatch audit

#### [MODIFY] `.agents/workflows/bkit-build.md` (Step 13 run-tests + Step 18 Close Workflow)

- **Existence Check:** exists (run-tests around line ~710-713). Append `test:smoke` LAST to `pnpm turbo lint check test:unit ...` and to the single-package fallback loop; run only when `LIVE_STACK = live` (build's own step has NO mocked integration/e2e — CI covers on PR). Record `liveVerdict` + the fail-then-pass `repro` transition on `build-run-tests`; hard-FAIL-only-on-live-and-failed routes into the existing FAIL branch; the e2e-smoke gate folded into Step 13 verdict gates Step 16 Summary → Step 17 Create PR. Add Gate 13 checklist items `[ ] liveVerdict recorded` and `[ ] empirical fail-then-pass transition recorded when LIVE_STACK = live`. Escape-hatch audit at Close Workflow (Step 18): record `liveReason`; emit the consumer-neutral skip line.

#### [MODIFY] `.agents/prompts/bkit-build-summary.md`

- **Existence Check:** exists. When `liveStack = absent | off` (or a soak-to-off downgrade), the always-written `build-summary.md` MUST include the consumer-neutral skip line (no internal refs); the summary body propagates to the PR body + tracker comment when wired.

### WS-6 — Debug reproduce-first + empirical-verify + escape-hatch audit (non-soak)

#### [MODIFY] `.agents/workflows/bkit-debug.md` (Step 4 area + Step 6 + Close Workflow)

- **Existence Check:** exists. New `debug-reproduce` mini-step in the Step 4 area, guarded `(OBSERVE_MODE = off OR OBSERVE_MODE = soak) AND LIVE_STACK = live` (the soak arm is wired in WS-7 but the guard shape is introduced here): run the live test once, classify `repro` (fail/pass/skip) + `reproKind` (functional/infra/none) per the §B classifier, route the four outcomes (functional-fail→diagnose; infra-fail→CONCERNS `live-stack-infra-failure`; pass→soft CONCERNS `empirical-unverified`; skip→degrade). Step 6 run-tests: append `test:integration:live test:e2e:live` LAST to `pnpm turbo lint check test test:integration test:e2e ... --continue` + the single-package fallback; record `liveVerdict`; require fail-then-pass; hard-FAIL-on-live-and-failed routes into the diagnose retry branch. The §I rule: reproduce CONCERNS rides the `debug-reproduce` step's OWN verdict (`PASS | CONCERNS | skip`), NOT Gate 4's `DIAGNOSE_VERDICT in PASS|FAIL` (Gate 4 NOT widened). Add Gate 6 checklist items. Escape-hatch audit at Close Workflow: `liveReason` + skip line.

#### [MODIFY] `.agents/prompts/bkit-debug-failure-diagnose.md`

- **Existence Check:** exists. Add a Process pre-condition BEFORE the strategy step: anchor diagnosis on a `repro: fail` + `reproKind: functional` ground truth; do NOT theorise past a green live repro; treat `reproKind: infra` as an environment/credential problem, never as the feature being broken. (Coordination: #135 also edits this prompt — do not assume sole ownership.)

#### [MODIFY] `.agents/prompts/bkit-debug-failure-remediate.md`

- **Existence Check:** exists (local-test gate around line ~52). Add the empirical-verify item to its local-test gate (the fix is "done" only when the same live test that recorded `repro: fail` now records `repro: pass`).

#### [MODIFY] `.agents/prompts/bkit-debug-summary.md`

- **Existence Check:** exists. Same always-written skip-line behaviour as the build summary.

### WS-7 — Soak orchestration (fourth OBSERVE_MODE value) + guard coverage

#### [MODIFY] `.agents/workflows/bkit-debug.md` (Step 1 decision, new Step 9-soak, full guard table)

- **Existence Check:** exists. Wire the EXHAUSTIVE OBSERVE_MODE→soak guard table (§D) — each row a discrete checklist item below. Add the orchestrator soak-entry branch + `[soak]` override at the Step 1 OBSERVE_MODE decision (line 142-145, BEFORE the attempt-exhaustion branch). Add the new Step 9-soak block (`Run only if OBSERVE_MODE = soak`) invoking `@bkit-debug-soak` with one accumulating context, looping on the SHARED `MAX_DEBUG_ATTEMPT` (= 3, line 38) budget. Widen the §B `debug-reproduce` guard's soak arm. Wire soak exhaustion routing → `liveVerdict: FAIL` → Failure Path / `@bkit-debug-abort-handover`; green exit → soak-aware Close Workflow.

#### [MODIFY] `.agents/prompts/bkit-debug-failure-diagnose.md` (Handoff: soak verdict)

- Add the machine-parseable `Handoff: soak` verdict + reason on criteria 1-3 (esp. #3 the `failureSignatureMoved` chain smell). ONE-WAY; a `Handoff: soak` with no fix applied does NOT burn an attempt.

#### [NEW] `.agents/prompts/bkit-debug-soak.md`

- New prompt mirroring the failure-diagnose/remediate log shape: machine-parseable verdict header + `<!-- verdict:end -->` + accumulating ReAct-style instrument→fix→re-verify log against the live test; each iteration burns one unit of the shared `MAX_DEBUG_ATTEMPT` budget; appends `repro: fail|pass` and sets `failureSignatureMoved`. ASCII operators; no internal refs. (Regenerate `.claude/` + `.cursor/` mirrors at session end.)

### WS-8 — Canonical-mirror lockstep edits

#### [MODIFY] `.agents/workflows.md`

- **Existence Check:** exists. Debug Step 6 catalog row (line ~646): fold `typecheck`→`check`, append `test:integration:live test:e2e:live`. Build Step 13 catalog row (line ~621): `lint check test:unit` + `test:smoke` (no mocked integration/e2e in build's own step). "Turbo command (verbatim)" / "Pre-PR vs debug" note (line ~972-975): `lint check` naming + build-vs-debug tier distinction + debug appends live tiers when `LIVE_STACK = live`. `/bkit-debug` mode-detection note + catalog rows (line ~634, ~641-652): teach `soak`, add a Step 9-soak catalog row (`@bkit-debug-soak` _(only if `OBSERVE_MODE = soak`)_), widen the Gate-1 enum mention. Land the single canonical OBSERVE-vs-SOAK boundary sentence. ASCII operators; no internal refs.

### Cron Jobs & Scheduled Tasks

None.

## Documentation Updates

> Index: `.agents/docs.md`. Treat as code changes — rewrite prose, no lazy bullet appends.

<!-- prettier-ignore -->
| File | Change required |
| --- | --- |
| `docs/testing.md` | Full tier table + `lint`/`check`/`test` groups + `@live`/`@smoke` tags + `LIVE_API` flag (WS-2 — the canonical home). |
| `docs/technology.md` | `pnpm format:check` → `pnpm check:format` reference (line ~57); pre-push hook description (line ~67) rename. |
| `docs/deployments.md` | CI/pre-push tier table (lines ~53, ~180-196): rename `typecheck`/`format:check`; add the push-only `test:smoke` CI tier. |
| `docs/setup.md` | Pre-PR gate command (line ~63): `lint check test` naming; line ~24 lint/typecheck/test mention. |
| `docs/knowledge.md` | Forward-looking command references only; leave historical KN narrative intact. Add a KN entry on the rename-atomicity trap if a regression is hit during build. |
| `docs/decisions.md` | New DE entry: back-compat probing decision (B1=a) + the soak shared-budget reuse of `MAX_DEBUG_ATTEMPT` (Task 0). |
| `.agents/rules.md` | Pre-PR gate line (line ~72): `lint typecheck format:check test` → `lint check test` naming. |
| `.agents/prompts.md` | L-tier description (line ~112) + agent rows referencing `lint/typecheck/test` → `lint/check/test`. |
| `.agents/README.md` | Lines ~21, ~55, ~187, ~192: rename references; managed-key table reflects `check:type`/`check:format`. |
| `docs/bkit-comparison.md` | Line ~68 agent-role prose `edit -> lint/typecheck/test -> edit`: rename to `lint/check/test` (forward-looking convention mention; owned by WS1-8 so the Gate WS-1 grep finds no unowned hit). |
| `.agents/docs.md` | Verify the index still accurate after the new prompt `bkit-debug-soak.md` (prompts are catalogued in `.agents/prompts.md`, not `.agents/docs.md` — confirm no new doc row needed). |

_pending.md: append the future-phase tighter-soak-cap idea + the future-major legacy-alias-retirement follow-up (B1=a aliases carried indefinitely until consumers migrate). decisions.md: append the two DE entries above (check existing entries first — none found at plan time)._

## Rollback Strategy

<!-- prettier-ignore -->
| Axis | Action | Notes |
| --- | --- | --- |
| **DB** | N/A | No DB. |
| **Code** | `git revert {COMMIT}` per WS PR | Code-only — `git revert` sufficient. The rename (WS-1) is the only blast-radius commit; revert restores `typecheck`/`format:check` atomically (callers reverted in the same squash). |
| **Risk window** | None | No deploy / migration. After revert, run `pnpm build` + `pnpm bkit install` to regenerate `dist/` + mirrors to the reverted state. |

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work through this runbook autonomously. Do not pause for user permission at any Gate. Continuously check off `[x]` tasks as you go.
> **Blockers:** If a task cannot be completed, **DO NOT fail silently**. Create a tracker issue (label `blocker`) with context before stopping.
> **Step Isolation:** Do NOT jump ahead. Complete each task fully (including its specific verification and checking its box) before starting the next.
> **Sequencing:** Follow the WS DAG — WS-1 → WS-2 → WS-3 → {WS-4, WS-5, WS-6} → WS-7 → WS-8. Mirror regen (`dist/`, `.claude/`, `.cursor/`, snapshots) is BATCHED at session end, NOT per edit.

> Every task MUST include a `**Done when:**` line — terse, testable, codebase-verifiable.

### Task 0 — Pin decisions (pre-WS)

- [ ] **Task 0a — Record back-compat decision (B1).** Append a `docs/decisions.md` DE entry: workflow discovery probes BOTH legacy (`typecheck`/`format:check`) and new (`check:type`/`check:format`) names (option a), with rationale (bkit cannot rename consumer scripts; silent gate-disablement recreates #143). **Done when:** a new DE-\* row exists in `docs/decisions.md` naming option (a) and its rationale; the chosen option is referenced by WS-1/WS-3 tasks.
- [ ] **Task 0b — Record soak-budget decision.** Append a `docs/decisions.md` DE entry: soak reuses `MAX_DEBUG_ATTEMPT` (= 3, verified at `.agents/workflows/bkit-debug.md:38`) as the single shared cap; no new constant. **Done when:** the DE row exists and cites the verified `MAX_DEBUG_ATTEMPT = 3` location.
- [ ] **Task 0c — Confirm flag name.** Verify the design body / any residue uses `LIVE_API` (not `API_LIVE`) for the in-code env var; surface vocab stays `live`. **Done when:** a grep of the worktree for `API_LIVE` returns ZERO hits in plan-authored/edited files; all new env-var references use `LIVE_API`.

### WS-1 — Script-naming standard (ATOMIC — all callers in one change)

- [ ] **WS1-1 — Rename + aggregate in `package.json`.** `typecheck`→`check:type`, `format:check`→`check:format`; add `lint`/`check`/`test` aggregates; `check:bkit` (bkit-repo only) for `pnpm bkit check`; keep `check:dist` bkit-only. The `lint` aggregate MUST fold ALL three `lint:*` scripts (`lint:slop` + `lint:prose` + `lint:no-tier-terms`) — do NOT hand-write a partial `lint` that silently drops `lint:no-tier-terms`. **Done when:** `jq -e '.scripts["check:type"] and .scripts["check:format"] and .scripts.lint and .scripts.check' package.json` exits 0; `jq -e '.scripts.typecheck or .scripts["format:check"]' package.json` exits NON-zero (old keys gone); the `lint` aggregate's body references `lint:slop`, `lint:prose`, AND `lint:no-tier-terms`.
- [ ] **WS1-2 — Update `bkit-manifest.ts` minted keys.** `CI_MANIFEST` → `check:type`; `LINT_MANIFEST` → `check:format`. **Done when:** `.agents/scripts/bkit-manifest.ts` contains `"check:type"` and `"check:format"` in the respective manifests and no longer mints `typecheck`/`format:check`.
- [ ] **WS1-3 — Update `bkit-modules.ts` defaults + advisory prose.** `runCiModule`/`runLintModule` defaults + the no-op-note/advisory strings. **Done when:** `bkit-modules.ts` references the new names; no forward-looking string mints the old names.
- [ ] **WS1-4 — Update CI + release + husky callers.** `ci.yml` (rename + add push-only `test:smoke` step), `release.yml`, `.husky/pre-push`, verify `.husky/pre-commit`/lint-staged. **Done when:** `rg 'pnpm (typecheck|format:check)' .github/workflows .husky` returns ZERO hits; `ci.yml` has a `test:smoke` step with `if: github.event_name == 'push'`.
- [ ] **WS1-5 — Update installer test assertions + add back-compat test.** The five test files; add an assertion proving discovery probes both legacy + new names. **Done when:** the updated tests reference the new names; a test asserts back-compat probing (B1=a); `pnpm test` green after WS-1.
- [ ] **WS1-6 — Update templates + reference docs.** `.agents/templates/**`, `.agents/rules.md`, `docs/{technology,setup,deployments,testing,security}.md`, `.agents/README.md`, `.agents/prompts.md`. **Done when:** forward-looking command references use `lint check test` naming; `rg 'pnpm typecheck|pnpm format:check' .agents docs --glob '!docs/plans/**' --glob '!**/CHANGELOG.md' --glob '!docs/knowledge.md'` returns ZERO non-historical hits.
- [ ] **WS1-7 — Leave `tests/fixtures/**`on legacy names (back-compat proof).** **Done when:**`tests/fixtures/heavy-customised-{consumer,prepush,ci}`retain`typecheck`/`format:check`, and a test asserts the installer/discovery handles them via back-compat.
- [ ] **WS1-8 — Convert the workflow/prompt DISCOVERY-SEAM loops + aggregate lines (B1=a probe-both).** For EACH grep-verified site, (a) rename the aggregate `pnpm turbo lint typecheck test` -> `pnpm turbo lint check test`; (b) update the literal `for s in typecheck test format:check ...` list to carry BOTH `check:type typecheck check:format format:check` (probe-both). Sites: `.agents/workflows/bkit-debug.md` (303, 493/496, 637/640, 746/748), `.agents/workflows/bkit-build.md` (710/713 — WS-5 also narrows `test`->`test:unit` + appends `test:smoke` here), the eight `.agents/prompts/*.md` (`bkit-build-plan-execute`, `bkit-build-plan-gaps-remediate`, `bkit-build-challenge-remediate`, `bkit-build-challenge-tests`, `bkit-debug-failure-remediate`, `bkit-debug-observe-instrument`, `bkit-ship-conflict-resolve`, `bkit-utility-compress-markdown`), and the `.agents/workflows.md` NON-catalog lines 523/636/643/649/651 (catalog rows 621/646/972/975 are owned by WS-8). This closes the #143-class silent-gate-disablement (`docs/knowledge.md:365`): an un-renamed loop makes `jq -e .scripts["typecheck"]` non-zero on the renamed bkit repo so the gate silently no-ops. **Done when:** `rg -n 'pnpm turbo lint typecheck test' .agents` returns ZERO hits (every aggregate reads `lint check test`); every `for s in` discovery loop that listed `typecheck`/`format:check` now ALSO lists `check:type`/`check:format`; `rg -n '\b(typecheck|format:check)\b' .agents/prompts .agents/workflows .agents/workflows.md` shows every remaining hit is a probe-alias paired with its renamed name (no bare legacy name without its `check:*` pair). ASCII operators; no internal refs.

### 🔒 Gate WS-1: Atomic rename verified

- [ ] **No old-name callers remain (except deliberate fixtures + historical docs + probe-aliases).** `rg '\b(typecheck|format:check)\b' --glob '!docs/plans/**' --glob '!**/CHANGELOG.md' --glob '!docs/knowledge.md' --glob '!docs/completed.md' --glob '!tests/fixtures/**' --glob '!dist/**' --glob '!.claude/**' --glob '!.cursor/**'` reviewed; EVERY remaining hit is EITHER a back-compat probe alias paired with its `check:*` name (owned by WS1-8 for the discovery loops) OR a converted reference-doc mention (WS1-6) — there is NO bare legacy name without an owning task. A faithful executor must NOT wave a hit through as "alias" unless WS1-8/WS1-6 converted it; if a hit has no owning task, the gate FAILS. **Done when:** reviewed and confirmed every hit maps to WS1-2..WS1-8 (probe-alias, fixture, or historical-doc exclusion).

### WS-2 — Consumer testing-taxonomy convention (Requires WS-1)

- [ ] **WS2-1 — Rewrite `docs/testing.md` managed block.** Full tier table + `lint`/`check`/`test` groups + `@live`/`@smoke` tags + `LIVE_API` flag, consumer-neutral; bkit-repo "absent by design" note OUTSIDE markers. Mirror in `.agents/templates/docs/testing.md`. **Done when:** the `<!-- bkit:start -->` block in both files contains the 6-row tier table and the `LIVE_API` flag description; no `KN-`/`BAR-` refs inside the markers; the bkit-absent note is outside the markers.

### WS-3 — Capability + status.json + OBSERVE_MODE foundation (Requires WS-1, WS-2)

- [ ] **WS3-1 — Build-time spike: validate the turbo `--dry-run` existence probe.** Run `pnpm turbo --version` then test `pnpm turbo run <nonexistent-task> --dry-run` exit behaviour against the pinned version. **Done when:** EITHER the `--dry-run` exit-status reliably distinguishes present/absent tasks (documented in the step comment) OR the step falls back to the established single-package `jq -e` path + "let turbo no-op" for monorepos; the chosen path AND the resolved turbo version + observed `--dry-run` exit semantics are recorded in the workflow step text (so the fallback decision is reproducible if turbo is later bumped).
- [ ] **WS3-2 — Add `LIVE_STACK` resolver to debug Worktree Setup.** Append after `pnpm install`, before status-update; read `[live=off]` from the input artifact; probe `test:integration:live | test:e2e:live | test:smoke` existence; persist `liveStack` + soak→off downgrade + `soakDowngradeReason`. **Done when:** `bkit-debug.md` Step 2 contains the resolver shell, persists `liveStack` onto `debug-worktree-setup`, and the Gate-1/Gate-2 checklist gains `[ ] LIVE_STACK resolved (live | absent | off)`.
- [ ] **WS3-3 — Add `LIVE_STACK` resolver to build Worktree Setup.** **Done when:** `bkit-build.md` Worktree Setup contains the resolver and persists `liveStack` onto `build-worktree-setup`.
- [ ] **WS3-4 — Document the status.json envelope + OBSERVE_MODE enum extension.** Introduce field names + `debug-reproduce`/`debug-soak` step kinds + `off|instrument|analyse|soak` enum + the `liveVerdict`-only-when-`liveStack==live` invariant + shared-`MAX_DEBUG_ATTEMPT` semantics in the step text consumed downstream. **Done when:** the workflow step text + summary-prompt reads reference all eight new fields and both new step kinds; the OBSERVE_MODE enum text reads `off | instrument | analyse | soak`.

### 🔒 Gate WS-3: Foundation verified

- [ ] **Resolver + schema envelope land before any gate reads them.** `liveStack` is persisted in BOTH workflows; the soak→off downgrade runs at capability-resolution time (before any guard). **Done when:** reviewed; no gate task in WS-4/5/6/7 reads a field WS-3 has not introduced.

### WS-4 — Plan non-mock mandate (Requires WS-2) — parallelisable with WS-5/WS-6

- [ ] **WS4-1 — Add the generate mandate.** `bkit-plan-generate.md` Process instruction: paired non-mock test task with a named ground-truth `Done when` for boundary-crossing tasks; pure-function tasks exempt. **Done when:** the prompt contains the boundary-scoped mandate; ASCII operators only.
- [ ] **WS4-2 — Add the review-3 lens.** `bkit-plan-review-3.md`: boundary-crossing task without a paired non-mock test task → CRITICAL reason `mock-only-coverage`. **Done when:** the prompt contains the lens and the `mock-only-coverage` reason string; no new agent/step added.
- [ ] **WS4-3 — Reflect scope in `bkit-plan.md`.** **Done when:** the plan workflow describes the mandate + lens scoped to boundary-crossing tasks.

### WS-5 — Build empirical-verify + e2e-smoke gate + audit (Requires WS-3)

> This gate IS the structural fix for the #143-class regression recorded at `docs/knowledge.md:365` (a subagent declaring PASS after `pnpm turbo lint typecheck test` while integration/e2e still fail on the same SHA). The empirical fail-then-pass requirement prevents a future executor re-deriving the same gate.

- [ ] **WS5-1 — Append `test:smoke` LAST to build Step 13 + narrow `test`->`test:unit`.** Turbo path + single-package fallback; run only when `LIVE_STACK = live`. This INTENTIONALLY narrows build's own run-tests step from the `test` umbrella to `test:unit` (the mocked integration/e2e tiers move to CI-on-PR — NOT a coverage drop; CI covers them on the resulting PR). The single-package fallback ENUMERATED list must also be renamed, not just the turbo path: `typecheck`->`check:type` (probe-both per WS1-8), `format:check`->`check:format` (probe-both), `test`->`test:unit`. **Done when:** `bkit-build.md` Step 13 turbo command reads `pnpm turbo lint check test:unit ... test:smoke` (smoke last); the single-package fallback loop enumerates `check:type test:unit check:format ...` (+ legacy probe-aliases) and appends `test:smoke`; no mocked integration/e2e in build's own step.
- [ ] **WS5-2 — Record `liveVerdict` + fail-then-pass + hard-FAIL routing; gate PR creation.** **Done when:** `build-run-tests` records `liveVerdict`; live-and-failed routes into the existing FAIL branch; the e2e-smoke verdict gates Step 16→17; Gate 13 has `[ ] liveVerdict recorded` + `[ ] empirical fail-then-pass transition recorded when LIVE_STACK = live`.
- [ ] **WS5-3 — Build escape-hatch audit.** Close Workflow records `liveReason`; `bkit-build-summary.md` always-writes the consumer-neutral skip line on `absent|off`/downgrade. **Done when:** `build-close-workflow` records `liveReason`; the summary prompt emits the exact line `Live verification skipped - runtime-only defects not gated (no live test declared, or opted out).` with no internal refs.

### WS-6 — Debug reproduce-first + empirical-verify + audit (Requires WS-3)

- [ ] **WS6-1 — Add the `debug-reproduce` mini-step.** Step 4 area; guard `(OBSERVE_MODE = off OR OBSERVE_MODE = soak) AND LIVE_STACK = live`; classify `repro` + `reproKind`; route the four outcomes. **Done when:** `bkit-debug.md` has a `debug-reproduce` step writing `repro` + `reproKind` with the §B classifier and the four routing branches (functional-fail / infra-fail / pass / skip); ASCII operators.
- [ ] **WS6-2 — Diagnose reproduce-first pre-condition.** `bkit-debug-failure-diagnose.md`: anchor on functional ground truth; treat `reproKind: infra` as environment, never feature-broken. **Done when:** the prompt's Process has the pre-condition before the strategy step. (Note #135 shared edit.)
- [ ] **WS6-3 — Append live tiers LAST to debug Step 6 + record `liveVerdict` + fail-then-pass + hard-FAIL routing.** **Done when:** Step 6 turbo command reads `... test:integration test:e2e test:integration:live test:e2e:live` (live last); `debug-run-tests` records `liveVerdict`; live-and-failed routes into the diagnose retry branch; Gate 6 gains the two checklist items.
- [ ] **WS6-4 — §I Gate-4 non-collision.** The `debug-reproduce` CONCERNS rides its own step verdict (`PASS | CONCERNS | skip`), NOT Gate 4's `DIAGNOSE_VERDICT in PASS|FAIL`; Gate 4 NOT widened. **Done when:** the `debug-reproduce` step has its own verdict field and the workflow text explicitly states reproduce CONCERNS does not feed `DIAGNOSE_VERDICT`.
- [ ] **WS6-5 — Remediate empirical-verify item.** `bkit-debug-failure-remediate.md` local-test gate requires the same live test's fail-then-pass. **Done when:** the prompt's local-test gate names the fail-then-pass requirement.
- [ ] **WS6-6 — Debug escape-hatch audit.** Close Workflow `liveReason` + `bkit-debug-summary.md` always-writes the skip line, including the soak-downgrade VARIANT line when `soakDowngradeReason` is set (debug-only — soak is debug-only). **Done when:** `debug-close-workflow` records `liveReason`; the debug summary emits the exact standard line `Live verification skipped - runtime-only defects not gated (no live test declared, or opted out).` AND the soak-downgrade variant line `Soak requested but no live stack available - ran standard diagnose path; runtime-only defects not gated.` when a soak-to-off downgrade occurred; both with no internal refs.

### WS-7 — Soak orchestration + guard coverage (Requires WS-3, WS-6)

> [!CAUTION]
> **Highest-risk workstream — a half-wired `OBSERVE_MODE=soak` branch is the design's named top risk.** Each guard-site below is a DISCRETE checklist item. Do NOT collapse them. Reuse `MAX_DEBUG_ATTEMPT` (= 3, `bkit-debug.md:38`) as the single shared cap; mint NO new constant.

- [ ] **WS7-1 — Step 1 orchestrator soak-entry + `[soak]` override.** Score criteria 1-2 from the report + `LIVE_STACK = live` → `OBSERVE_MODE = soak`; `[soak]` flag = unconditional override (still subject to the Step-2 downgrade); both BEFORE the attempt-exhaustion branch (line 142-145). **Done when:** Step 8 OBSERVE_MODE decision lists the soak entry + `[soak]` override before the `DEBUG_ATTEMPT > MAX_DEBUG_ATTEMPT → instrument` branch.
- [ ] **WS7-2 — `Handoff: soak` crossover.** `bkit-debug-failure-diagnose.md` emits the machine-parseable `Handoff: soak` verdict + reason (criteria 1-3, esp. #3 `failureSignatureMoved`); the workflow switches REMAINING shared budget to soak IF budget remains AND `liveStack == live`; ONE-WAY; handoff diagnosis does NOT burn an attempt. **Done when:** the prompt emits a parseable `Handoff: soak` verdict; the workflow Step 4 area has the one-way crossover wiring with the no-burn rule.
- [ ] **WS7-3 — New Step 9-soak block.** `Run only if OBSERVE_MODE = soak`; invoke `@bkit-debug-soak` with one accumulating context; reproduce-first runs first (the widened §B guard); loop instrument→fix→re-verify against the live test, each iteration burning one shared-budget unit; record `debug-soak` with `liveVerdict`, `soakIterations`, `failureSignatureMoved`. NOTE (anti-footgun): the existing `## 🤖 Step 9 — Observe Instrument` (`bkit-debug.md:624`) RETAINS its number — use an unambiguous heading for the new block (e.g. "Step 9S — Soak Loop") so an implementer does not renumber or overwrite Observe Instrument. **Done when:** `bkit-debug.md` has the soak block (distinct heading, NOT overwriting Step 9 Observe Instrument) gated `OBSERVE_MODE = soak` invoking `@bkit-debug-soak`, anchored on a prior `repro: fail`, looping on the shared `MAX_DEBUG_ATTEMPT` budget.
- [ ] **WS7-4 — Widen the `debug-reproduce` guard's soak arm.** Confirm the WS6-1 guard reads `(OBSERVE_MODE = off OR OBSERVE_MODE = soak) AND LIVE_STACK = live` and that `repro: pass`/`infra` short-circuits soak (route as the §B CONCERNS case, soak loop does NOT start). **Done when:** the reproduce guard includes the soak arm and the short-circuit is wired.
- [ ] **WS7-5 — Soak exhaustion routing.** Shared budget exhausted + live test failing → `liveVerdict: FAIL` → Failure Path / `@bkit-debug-abort-handover` (handover carries accumulated context + fixes-so-far); green exit → soak-aware Close Workflow. The green-soak exit's satisfaction signal is the `repro: fail -> pass` transition (seeded `repro: fail` by `debug-reproduce`, flipped to `repro: pass` by the final soak iteration) — matching the non-soak Step 6 fail-then-pass contract so the soak path is auditable from state. **Done when:** the soak FAIL terminal state routes to `@bkit-debug-abort-handover`; green exit reaches Step 12 Close AND the final soak iteration records `liveVerdict: PASS` + the `repro: fail -> pass` transition.
- [ ] **WS7-6 — Create `.agents/prompts/bkit-debug-soak.md`.** Machine-parseable verdict header + `<!-- verdict:end -->` + accumulating ReAct log; ASCII operators; no internal refs. **Done when:** the file exists with the verdict header + `<!-- verdict:end -->` and the iterate-against-live-test loop description.
- [ ] **WS7-7 — Full OBSERVE_MODE guard-coverage table (DISCRETE per site).** Each sub-item below is verified independently:
  - [ ] Failure Path branch (line 73): confirm soak exhaustion reaches handover (EXTEND — no new condition). **Done when:** the soak `debug-soak` FAIL path reaches the line-73 branch.
  - [ ] Step 1 OBSERVE_MODE decision (line 142-145): orchestrator + `[soak]` added (WS7-1). **Done when:** present.
  - [ ] `Handoff: soak` crossover (new, Step 4 area) (WS7-2). **Done when:** present.
  - [ ] Gate 1 enum text (line 176): WIDEN to `(off | instrument | analyse | soak)`. **Done when:** the Gate-1 checklist enum reads all four values.
  - [ ] debug-input echo (line 163/234): no change (echoes whatever value). **Done when:** confirmed unchanged.
  - [ ] worktree-setup persist (line 248-249): soak→off downgrade + `liveStack` persist (WS3-2). **Done when:** present.
  - [ ] Step 4 Failure Diagnose guard (line ~390): KEEP `off` only; diagnose may still emit `Handoff: soak`. **Done when:** guard unchanged at `off`.
  - [ ] Step 5 Failure Remediate guard (line ~441): KEEP `off` only. **Done when:** unchanged.
  - [ ] Step 6 Run Tests guard (line ~487): KEEP `off` only. **Done when:** unchanged.
  - [ ] Step 7 Push Remediation guard (line ~536): KEEP `off and Step 5 PASS`. **Done when:** unchanged.
  - [ ] Step 8 Summary guard (line ~580): KEEP `off and Step 5 PASS`. **Done when:** unchanged.
  - [ ] Step 9 Observe Instrument guard (line ~626): KEEP `instrument`. **Done when:** unchanged.
  - [ ] Step 10 Observe Analyse guard (line ~694): KEEP `analyse`. **Done when:** unchanged.
  - [ ] Step 11 Observe Revert guard (line ~734): KEEP `analyse`. **Done when:** unchanged.
  - [ ] Step 12 Close Workflow guard (line ~785): EXTEND to `off OR instrument OR soak` (green soak reaches close). **Done when:** the guard reads `off OR instrument OR soak`.
  - [ ] Step 12 INNER tracker issue-update sub-step (line ~856, `11. If OBSERVE_MODE = off:`): EXTEND to `off OR soak` so a green soak close updates the tracker (issue-update-review + issue-update-status, state -> `In Review`) exactly as a normal-off close does; `instrument` close intentionally still does NOT update (preserve existing line-856 semantics). Without this, a green soak crosses the OUTER guard but its tracker update silently no-ops — a half-wired branch. **Done when:** the line-856 sub-step guard reads `off OR soak` and `instrument` remains excluded.
  - [ ] Step 12 INNER Gate checklist item (line ~894, `If OBSERVE_MODE = off issue update attempted`): WIDEN to `off OR soak` to match the line-856 sub-site. **Done when:** the Gate-12 checklist item reads `If OBSERVE_MODE = off OR soak issue update attempted`.
  - [ ] New Step 9-soak gate: `OBSERVE_MODE = soak` (the only step on the new value) (WS7-3). **Done when:** present.

### 🔒 Gate WS-7: No half-wired soak branch

- [ ] **Every guard site in WS7-7 verified.** All 18 sub-items checked (including the two INNER Step-12 sub-sites at lines ~856 / ~894); the shared `MAX_DEBUG_ATTEMPT` budget (no new constant) governs both paths; the crossover is one-way. **Done when:** all WS7-7 sub-boxes `[x]` and no `OBSERVE_MODE = off`-assumption guard (outer OR inner) is left orphaned on a green soak close.

### WS-8 — Canonical-mirror lockstep edits (Requires WS-5, WS-6, WS-7)

- [ ] **WS8-1 — Debug Step 6 catalog row.** Fold `typecheck`→`check`; append `test:integration:live test:e2e:live`. **Done when:** `.agents/workflows.md` line ~646 row matches the WS-6 step command exactly.
- [ ] **WS8-2 — Build Step 13 catalog row.** `lint check test:unit` + `test:smoke`; no mocked integration/e2e in build's own step. The catalog row's ENUMERATED single-package fallback list (`.agents/workflows.md:621`, currently `(typecheck, test, format:check, lint:slop, lint:prose)`) must also be renamed to match WS5-1: `check:type`/`check:format` (+ legacy probe-aliases) and `test`->`test:unit`. **Done when:** the row matches the WS-5 step command exactly, including the renamed enumerated fallback list (no bare `typecheck`/`format:check` without its `check:*` pair, `test` shown as `test:unit`).
- [ ] **WS8-3 — "Turbo command (verbatim)" / "Pre-PR vs debug" note.** `lint check` naming; build-vs-debug tier distinction; debug appends live tiers when `LIVE_STACK = live`. **Done when:** line ~972-975 reflects the new naming + the distinction.
- [ ] **WS8-4 — `/bkit-debug` mode-detection + catalog learns `soak`.** Add a Step 9-soak catalog row; widen the Gate-1 enum mention. **Done when:** a `@bkit-debug-soak` _(only if `OBSERVE_MODE = soak`)_ row exists and the enum mention reads all four values.
- [ ] **WS8-5 — Land the canonical OBSERVE-vs-SOAK boundary sentence.** **Done when:** `.agents/workflows.md` contains the single boundary sentence (orchestrator + `[soak]` + one-way `Handoff: soak`, shared `MAX_DEBUG_ATTEMPT` budget); ASCII operators; no internal refs.

### 🔒 Gate 2: Code Implementation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Testing & Documentation`.

- [ ] **Gate 2 - Verified:** Every WS task above independently verified and checked off. Mirror regen (`dist/`, `.claude/`, `.cursor/`, snapshots) performed ONCE at session end.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** every row has a corresponding checked-off task (installer/manifest/snapshot/release-workflow tests). Add tasks if any row is uncovered. **Done when:** every matrix row maps to a task.
- [ ] **Update existing tests:** the five installer test files reflect the renamed keys + back-compat probing. **Done when:** `pnpm test` green.
- [ ] **Regenerate mirrors + snapshots (session-end batch):** `pnpm build` (dist), `pnpm bkit install` (.claude/.cursor), `vitest -u` (snapshots) — then re-run `pnpm test`. **Done when:** `pnpm check:dist` clean; `pnpm bkit check` reports zero drift; snapshot test green.
- [ ] **Verify observability:** N/A — no runtime logging. Confirm no `console.error` paths introduced.
- [ ] **Update documentation:** all rows in `Documentation Updates` completed; `docs/decisions.md` + `docs/pending.md` appended. **Done when:** the doc table rows are done and `.agents/docs.md` still accurate.

### 🔒 Gate 3: Testing & Documentation Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Verification Plan`.

- [ ] **Docs updated:** every row in `Documentation Updates` completed. `.agents/docs.md` still accurate.
- [ ] **Gate 3 - Verified:** every checkbox above independently verified.

## Verification Plan

### Automated Tests

- [ ] **Type Check & Lint:** `pnpm check:type` (renamed) + `pnpm lint` aggregate pass on the renamed scripts.
- [ ] **Discovery-seam rename complete:** `rg -n 'pnpm turbo lint typecheck test' .agents` returns ZERO hits; every `for s in ...` discovery loop in `.agents/workflows` + `.agents/prompts` that listed `typecheck`/`format:check` now also lists `check:type`/`check:format` (no bare legacy name without its `check:*` pair). **Done when:** both greps confirm WS1-8 left no un-renamed aggregate or un-paired legacy loop name.
- [ ] **Test Synchronization:** the five installer test files + the snapshot are updated synchronously so CI does not fail on a stale assertion.
- [ ] **Build Configuration:** N/A (no tsconfig exclude changes; no new mock files).
- [ ] **Installer suite (`.agents/scripts/*.test.ts`, `*.integration.test.ts`):** rename + back-compat + ci.yml smoke-job assertions pass. **Done when:** `pnpm test` green.
- [ ] **Dist freshness:** `pnpm check:dist` clean after `pnpm build`. **Done when:** exits 0.
- [ ] **Mirror drift:** `pnpm bkit check` (a.k.a. `check:bkit`) reports zero template/mirror drift. **Done when:** exits 0.
- [ ] **Run all tests:** execute locally; pass `pnpm test`, `pnpm check:type`, `pnpm check:format`, `pnpm lint`, `pnpm check:dist`, `pnpm bkit check`. bkit's own `test:smoke` / `:live` are ABSENT by design — do NOT attempt to run them. Fix all failures before Gate 4.

> [!IMPORTANT]
> **No Architectural Downgrades:** if a build/test error appears during verification, follow `docs/architecture.md` / `docs/knowledge.md` best practices; never hot-fix. Halt if stuck.

### 🔒 Gate 4: Automated Verification Confirmed

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all boxes below. **DO NOT stop for user permission.** Once saved, immediately proceed to `Manual Verification`.

- [ ] **Gate 4 - Verified:** every checkbox in Automated Tests independently verified; explicit proof (CLI outputs) gathered.

### Manual Verification

> [!WARNING]
> **Dashboard Ban:** use local CLIs (`gh`, `pnpm`) to verify CI/CD instead of asking users to check dashboards.

- [ ] **Step 1 — Dogfood the rename via a packed tarball in a clean dir (not the repo).** `pnpm pack` → fresh consumer install → `pnpm bkit install` → confirm the seeded `package.json` has `check:type`/`check:format` + the ci.yml `test:smoke` push-only step, and that a consumer still on legacy `typecheck`/`format:check` still gets gated (back-compat probing). **Done when:** the clean-dir install seeds the new names AND a legacy-named fixture is still discovered.
- [ ] **Step 2 — Verify install AND upgrade live (separate engines).** Run both `bkit install` and `bkit upgrade` on a dogfood dir; confirm the renamed managed keys reconcile identically on both paths. **Done when:** install and upgrade both produce the renamed keys with no drift.
- [ ] **Step 3 — Soak guard smoke-read.** Re-read `bkit-debug.md` and confirm all 18 WS7-7 guard sites are wired (including the two INNER Step-12 sub-sites at lines ~856 / ~894 that update the tracker on a green soak close) and the OBSERVE_MODE enum reads four values everywhere it appears (workflow + `.agents/workflows.md` mirror). **Done when:** no guard site references only three values AND no `OBSERVE_MODE = off`-only inner guard is left orphaned on the soak-green close path.

<!-- bkit:start -->

<!-- This managed block is intentionally NOT cloned for this plan. bkit's plan template ships a duplicate managed copy for consumer installs; the active plan above is the source-repo (non-managed) copy. No edits needed here for #143. -->

<!-- bkit:end -->
