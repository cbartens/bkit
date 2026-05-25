Verdict: PASS

<!-- verdict:end -->

<!-- Note: child sub-plan 1 of 4. Split from the master per the WS DAG. -->

# Live Testing Gates — Sub-Plan 1: Pin Decisions + WS-1 Script-Naming Standard (ATOMIC RENAME)

**Parent Plan:** [`143-real-world-testing-plan.md`](./143-real-world-testing-plan.md)
**Source master:** [`plan-v3-checked.md`](./plan-v3-checked.md)
**Requires (merged):** — (root; this is the FIRST child to land)
**Blocks:** plan-v4-2, plan-v4-3, plan-v4-4 (all depend on the renamed names + `LIVE_API` flag + B1=a probe-both convention)

> [!CAUTION]
> **CRITICAL — do not hallucinate plan execution state.**
>
> 1. ALWAYS read this file natively before executing any step.
> 2. NEVER trust session summaries or conversation history for completion state.
> 3. Source of truth = literal `[x]` vs `[ ]` checkboxes in THIS document.

> [!IMPORTANT]
> **This is the "atomic-or-red-CI" workstream.** Every caller of `typecheck`/`format:check` is renamed in ONE change or CI goes red / a gate silently no-ops. This child MUST land as one self-contained, independently mergeable squash PR.

## Context & Goals

Three runtime-only bugs (#143) shipped green because every test was mocked: a typmod defect, a nil-UUID injection, and a token-budget overrun all passed CI and shipped. The fix is one missing invariant:

> A test that exercises the real integration boundary must EXIST, must FAIL before a fix, and must PASS after it — and when that test cannot be run, the green result must be loud, auditable, and never silently equated with "works."

This sub-plan installs the prerequisite **script-naming standard** (three groups `lint:*` / `check:*` / `test:*` + umbrella aggregates) plus the pre-WS decision records (back-compat probing B1=a; soak shared-budget) the whole feature builds on. WS-2..WS-8 (later children) all rely on the renamed names + the `LIVE_API` flag + the probe-both convention established here.

**Success criteria for THIS child:**

- `typecheck` -> `check:type`, `format:check` -> `check:format` renamed across EVERY caller (installer source, manifests, CI/release/husky, workflow/prompt discovery-seam loops, templates, reference docs) in one atomic change; old minted keys gone; legacy names survive ONLY as probe aliases in discovery loops.
- `pnpm test` green after the rename; back-compat probing (B1=a) proven by a test.
- The two pre-WS DE entries exist in `docs/decisions.md`; no `API_LIVE` residue.

## 👤 ⚠️ Human-Gate Blockers (carried with this child)

> [!CAUTION]
> **🚩 BLOCKER B1 — back-compat strategy for the script rename. HUMAN MUST PICK.**
>
> bkit's workflows discover scripts by existence (`jq -e .scripts[...]` and `for s in typecheck test format:check ...` fallback loops). Renaming the shipped convention breaks existing consumers still on the old names. **Plan recommendation: (a) probe BOTH legacy and new names** in the workflow discovery loops and the installer's managed-key reconciliation — because bkit CANNOT rename a consumer's `package.json` script names, so a probe-new-only design silently stops gating every un-migrated consumer (recreating the exact #143 silent-gate failure at `docs/knowledge.md:365`). The installer continues to seed the NEW names for fresh installs + upgrade (managed-key add-if-missing); discovery loops probe `check:type OR typecheck` / `check:format OR format:check` until a future major drops the alias. Option (b) is a breaking major bump + a migration advisory. Recorded as a DE entry (Task 0a).

> [!CAUTION]
> **🚩 BLOCKER B2 — the rename's caller surface is materially larger than first enumerated. HUMAN MUST ACK the expanded scope.**
>
> Beyond `package.json`/`ci.yml`/`release.yml`/husky/`.agents/workflows.md`, the rename ALSO touches the installer machinery + mirrors because `typecheck`/`format:check` are bkit-MANAGED keys minted by the installer:
>
> - `.agents/scripts/bkit-manifest.ts` (`CI_MANIFEST` `scripts.typecheck`, `LINT_MANIFEST` `scripts["format:check"]`).
> - `.agents/scripts/bkit-modules.ts` (`runCiModule`/`runLintModule` defaults + no-op-note prose + pre-push advisory strings).
> - **The workflow/prompt DISCOVERY-SEAM callers — the `pnpm turbo lint typecheck test` aggregate lines AND the single-package `for s in typecheck test format:check ...` fallback LOOPS that iterate LITERAL script names.** These ARE the seam B1 protects; after bkit renames its OWN `package.json`, a loop still listing only the old names makes `jq -e .scripts["typecheck"]` non-zero -> the gate silently no-ops = the exact #143 silent-gate-disablement (`docs/knowledge.md:365`). Grep-verified sites: `bkit-debug.md` 303, 493/496, 637/640, 746/748; `bkit-build.md` 710/713; eight `.agents/prompts/*.md` (`bkit-build-plan-execute` 47, `bkit-build-plan-gaps-remediate` 49, `bkit-build-challenge-remediate` 46, `bkit-build-challenge-tests` 45, `bkit-debug-failure-remediate` 52, `bkit-debug-observe-instrument` 49, `bkit-ship-conflict-resolve` 56/58, `bkit-utility-compress-markdown` 79 — example string); `.agents/workflows.md` NON-catalog 523/636/643/649/651 (the catalog rows 621/646/972/975 are owned by WS-8 in plan-v4-4).
> - Per B1=(a): aggregate `pnpm turbo lint typecheck test` -> `pnpm turbo lint check test`; the literal `for s in ...` lists gain BOTH `check:type typecheck check:format format:check` (probe-both). ALL in the SAME atomic change or it is red-CI / silent-gate on first run.
> - Test suite (`bkit-tiers.test.ts`, `bkit-package-json.test.ts`, `bkit-manifest.test.ts`, `bkit-modules.integration.test.ts`, `bkit-release-workflow.test.ts`); the snapshot `__snapshots__/bkit-templates.content.test.ts.snap`; the SHIPPED `dist/bkit-manifest.js` + `dist/bkit-modules.js` (regenerated by `pnpm build`); consumer templates; `.claude/` + `.cursor/` mirrors (regenerated by `pnpm bkit install`); reference docs; `tests/fixtures/**` (deliberately KEPT on legacy names to PROVE back-compat).
>
> **Consequence:** the rename is genuinely "atomic-or-red-CI". Every caller in the SAME PR. Mirrors + dist regenerated (NOT hand-edited), batched at session end (per the no-per-edit-`bkit install` rule).

> [!WARNING]
> **bkit declares ALL `:live`/smoke scripts ABSENT by design.** Do NOT add `test:smoke` / `:live` script BODIES to bkit's own `package.json`, and do NOT add live test files. The `check:dist` / `check:bkit` / absent-live declaration sit OUTSIDE the `bkit:start/end` markers.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed BLOCKER B1 (back-compat strategy) + BLOCKER B2 (expanded caller surface) above.

> [!CAUTION]
> **Agent:** Do NOT pass Gate 1 until this checkbox is `[x]`.

## Out of Scope (this child)

- Writing live test BODIES / adding `test:smoke` / `:live` bodies to bkit's own `package.json`.
- A future major that DROPS the legacy `typecheck`/`format:check` probe aliases — deferred to `docs/pending.md`.
- A `lint:no-tier-terms`-style CI guard that fails on an un-paired legacy script name — separate tooling issue.
- WS-2..WS-8 (later children): taxonomy docs, capability resolver, gates, soak, canonical-mirror catalog rows.

## Invariants (this child)

- `LIVE_API` is the in-code env var (per C16) — NO `API_LIVE` residue (Task 0c).
- bkit-repo-only `check:dist` / `check:bkit` / absent-live sit OUTSIDE `bkit:start/end`.
- NO live test bodies in bkit's own `package.json`.
- ASCII operators (`!=` `>=` `<=`) in `.agents/workflows/*` + `.agents/prompts/*` — never Unicode.
- No `KN-` / `BAR-` / issue refs in consumer-facing text.

## Merge Method

**Merge method: always squash.** This child lands as ONE squash-merged PR (the atomic rename).

## Supersession Inventory (slice relevant to this child)

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| `package.json#scripts.typecheck` (+ all managed-key/manifest/mirror occurrences) | `check:type` | DELETE (rename) | Single naming standard; `typecheck` retained ONLY as a legacy probe ALIAS in workflow discovery loops under B1=(a), not as a minted key. |
| `package.json#scripts.format:check` (+ all managed-key/manifest/mirror occurrences) | `check:format` | DELETE (rename) | Same naming standard; `format:check` retained ONLY as a legacy probe ALIAS under B1=(a). |
| Workflow/prompt discovery-seam aggregate lines + `for s in typecheck test format:check ...` fallback LOOPS (`bkit-debug.md` 303/493/496/637/640/746/748, `bkit-build.md` 710/713, seven discovery-loop `.agents/prompts/*.md`, `.agents/workflows.md` non-catalog 523/636/643/649/651) | `pnpm turbo lint check test` aggregate + `for s in` lists carrying BOTH `check:type typecheck check:format format:check` | DELETE (rename, probe-both) | The literal-name loops are the discovery seam B1 protects; un-renamed = silent gate-disablement (the #143 failure at `docs/knowledge.md:365`). Owned by WS1-8 (atomic with the rename); the `.agents/workflows.md` CATALOG rows 621/646/972/975 stay with WS-8 in plan-v4-4. |
| `.agents/prompts/bkit-utility-compress-markdown.md` example string (line ~79 `pnpm turbo lint typecheck test --filter='...[origin/dev]'`) | `pnpm turbo lint check test --filter='...[origin/dev]'` (NO probe-alias — illustrative prose, not a discovery loop) | DELETE (rename, NO alias) | The ONE exception to probe-both: an example string showing the canonical command must read the renamed aggregate; a probe-alias is semantically wrong in prose. Owned by WS1-8. |

> [!CAUTION]
> **Default = `DELETE`.** The two script-rename rows are `DELETE` of the OLD minted key — the legacy NAME survives only as a discovery-probe alias under B1=(a), a runtime probe list, not a retained `@deprecated` export.

## 🚨 Pre-Flight / Dependencies 🚨

**CRITICAL:** Check off ALL core items. Abort if anything required is missing.

### Core (always verify)

- [ ] **Package Management:** No new runtime deps. Verify `pnpm-lock.yaml` unchanged after edits (rename is scripts-only). `picomatch` stays the sole runtime dep.
- [ ] **Dependency Versions:** Spot-check `pnpm --version` (10.33.0), `tsc --version`.
- [ ] **User Context:** Read/write access to `.agents/**`, `docs/**`, `.github/workflows/**`, `.husky/**`, `package.json`, the `.claude/` + `.cursor/` mirror dirs (regenerated, not hand-edited).
- [ ] **Pending Blockers:** Query tracker for open `blocker`-labelled issues touching script naming.
- [ ] **Project Context:** Re-read `docs/knowledge.md` (KN entries on dist freshness, hook bypass) and `docs/decisions.md` before WS-1.
- [ ] **Prerequisite Plans:** None — this is the root child.

### 🔒 Gate 1: Prerequisites Check

**CRITICAL AI AGENT INSTRUCTION:** 🛑 CHECKPOINT. Verify and check `[x]` all applicable boxes above. **DO NOT stop for user permission.**

- [ ] **Breaking Changes confirmed:** Human confirmed the `👤 Human-Gate Blockers` section above, including BLOCKER B1 + B2 (checkbox is `[x]`). _(Unchecked → Summary must issue `REVISE`.)_
- [ ] **Gate 1 - Verified:** All Core items checked.

## Architecture & Component Changes (WS-1)

> Topology: bkit is a single-package CLI + a markdown agent-workflow corpus under `.agents/`, with consumer templates under `.agents/templates/` and IDE-surface mirrors under `.claude/` + `.cursor/` (REGENERATED by `pnpm bkit install`, never hand-edited). Compiled CLI in `dist/` (regenerated by `pnpm build`).

### WS-1 — Script-naming standard (installer + CI + hooks)

#### [MODIFY] `package.json`

- **Existence Check:** exists. Rename `typecheck`->`check:type`, `format:check`->`check:format`. `format` (prettier `--write`) UNCHANGED. Add umbrella aggregates `lint` (-> all `lint:*`), `check` (-> all `check:*`; on bkit-repo also `check:dist` + `check:bkit`, OUTSIDE any consumer marker since bkit's root package.json is not a markered template), `test` (-> mocked tiers; bkit has only `test` today — keep `test` as the bkit suite runner, do NOT fold live tiers). Rename the `pnpm bkit check` invocation to a `check:bkit` script (bkit-repo only).

#### [MODIFY] `.github/workflows/ci.yml`

- **Existence Check:** exists (lines 61-91). Update `pnpm typecheck`->`pnpm check:type`, `pnpm format:check`->`pnpm check:format` (or re-express as the `lint`/`check` aggregates). Add a `test:smoke` step gated `if: github.event_name == 'push'`. bkit's own `test:smoke` is ABSENT so the step no-ops on bkit.

#### [MODIFY] `.github/workflows/release.yml`

- **Existence Check:** exists (lines 43, 49). Update `pnpm typecheck`->`pnpm check:type`, `pnpm format:check`->`pnpm check:format`.

#### [MODIFY] `.husky/pre-push`

- **Existence Check:** exists (lines 18-21, 25, 29). Update `pnpm typecheck`/`pnpm format:check` references (revert-branch bypass + normal line). Keep `pnpm bkit check` / `pnpm check:dist` (or `check:bkit`) bkit-repo-only lines outside any marker.

#### [MODIFY] `.husky/pre-commit`

- **Existence Check:** exists. Currently `pnpm lint-staged && pnpm lint:prose && pnpm lint:slop` — no rename needed unless re-expressed as `pnpm lint`. Verify `package.json#lint-staged` needs no key change (it globs `*`, not script names).

#### [MODIFY] `.agents/scripts/bkit-manifest.ts`

- **Existence Check:** exists. `CI_MANIFEST` `packageJsonKeys.scripts.typecheck`->`check:type` (line ~190); `LINT_MANIFEST` `packageJsonKeys.scripts["format:check"]`->`check:format` (line ~251). The minted-key SOURCE OF TRUTH.

#### [MODIFY] `.agents/scripts/bkit-modules.ts`

- **Existence Check:** exists. `runCiModule` default (line ~1290-1295 `typecheck`->`check:type`), `runLintModule` default (line ~1449 `format:check`->`check:format`), advisory/no-op-note strings (lines ~490, ~509, ~922, ~1004, ~1039-1043, ~1473). The `for s in ...` loops live in the workflow files; modules only mint package.json keys.

#### [MODIFY] workflow/prompt DISCOVERY-SEAM loops + aggregate lines (B1=a probe-both)

- **Existence Check:** all exist (grep-verified). Literal `for s in typecheck test format:check ...` single-package fallback LOOPS + `pnpm turbo lint typecheck test` aggregate lines. For EACH site: (a) aggregate `pnpm turbo lint typecheck test` -> `pnpm turbo lint check test`; (b) literal `for s in ...` list gains BOTH `check:type typecheck check:format format:check`. Sites: `bkit-debug.md` 303, 493/496, 637/640, 746/748; `bkit-build.md` 710/713; eight `.agents/prompts/*.md`; `.agents/workflows.md` NON-catalog 523/636/643/649/651 (catalog rows 621/646/972/975 are WS-8/plan-v4-4).

#### [MODIFY] installer test suite (rename assertions)

- `bkit-manifest.test.ts`, `bkit-tiers.test.ts`, `bkit-package-json.test.ts`, `bkit-modules.integration.test.ts`, `bkit-release-workflow.test.ts` — update every assertion on `typecheck`/`format:check`; add a back-compat-probing assertion (B1=a).

#### [MODIFY] templates + reference docs

- `.agents/templates/.github/workflows/ci.yml`, `.agents/templates/.husky/pre-push`, `.agents/templates/.agents/rules.md`, `.agents/templates/docs/{testing,security,deployments}.md`; `.agents/rules.md`; `docs/{technology,setup,deployments,knowledge,testing,security}.md`; `docs/bkit-comparison.md` (line 68); `.agents/README.md`; `.agents/prompts.md`. (knowledge.md / CHANGELOG: leave historical narrative; only update forward-looking command references.)

#### [REGENERATE — do NOT hand-edit] `dist/`, `.claude/`, `.cursor/`, snapshots

- `dist/bkit-manifest.js`, `dist/bkit-modules.js` via `pnpm build`. `.claude/**`, `.cursor/**` via `pnpm bkit install`. `__snapshots__/bkit-templates.content.test.ts.snap` via `vitest -u`. Batch at session end.

#### [RETAIN — deliberately on legacy names] `tests/fixtures/**`

- `tests/fixtures/heavy-customised-consumer/package.json`, `.../heavy-customised-prepush/.husky/pre-push`, `.../heavy-customised-ci/.github/workflows/ci.yml`, `.../heavy-customised-consumer/husky-pre-commit`, `.../heavy-customised-consumer/AGENTS.md` — KEEP on `typecheck`/`format:check` to PROVE back-compat (B1=a).

## Agent Execution Runbook

> [!IMPORTANT]
> **Continuous Execution:** Work through autonomously. Do not pause for user permission at any Gate.
> **Blockers:** If a task cannot be completed, create a tracker issue (label `blocker`) before stopping.
> **Step Isolation:** Complete each task fully (incl. verification + checking its box) before the next.
> **Sequencing:** Task 0 -> WS-1 (atomic). Mirror regen (`dist/`, `.claude/`, `.cursor/`, snapshots) is BATCHED at session end, NOT per edit.

> Every task MUST include a `**Done when:**` line.

### Task 0 — Pin decisions (pre-WS)

- [ ] **Task 0a — Record back-compat decision (B1).** Append a `docs/decisions.md` DE entry: workflow discovery probes BOTH legacy (`typecheck`/`format:check`) and new (`check:type`/`check:format`) names (option a), with rationale (bkit cannot rename consumer scripts; silent gate-disablement recreates #143). **Done when:** a new DE-\* row exists in `docs/decisions.md` naming option (a) and its rationale — `rg -ni 'back-compat|probe both|probe-both' docs/decisions.md` returns the new entry referencing both legacy + new names; the chosen option is referenced by WS-1/WS-3 tasks.
- [ ] **Task 0b — Record soak-budget decision.** Append a `docs/decisions.md` DE entry: soak reuses `MAX_DEBUG_ATTEMPT` (= 3, verified at `.agents/workflows/bkit-debug.md:38`) as the single shared cap; no new constant. **Done when:** the DE row exists and cites the verified `MAX_DEBUG_ATTEMPT = 3` location — `rg -n 'MAX_DEBUG_ATTEMPT' docs/decisions.md` returns the new entry naming the shared cap and the `bkit-debug.md:38` source.
- [ ] **Task 0c — Confirm flag name.** Verify the design body / any residue uses `LIVE_API` (not `API_LIVE`) for the in-code env var; surface vocab stays `live`. **Done when:** a grep of the worktree for `API_LIVE` returns ZERO hits in plan-authored/edited files; all new env-var references use `LIVE_API`.

### WS-1 — Script-naming standard (ATOMIC — all callers in one change)

- [ ] **WS1-1 — Rename + aggregate in `package.json`.** `typecheck`->`check:type`, `format:check`->`check:format`; add `lint`/`check`/`test` aggregates; `check:bkit` (bkit-repo only) for `pnpm bkit check`; keep `check:dist` bkit-only. The `lint` aggregate MUST fold ALL three `lint:*` scripts (`lint:slop` + `lint:prose` + `lint:no-tier-terms`) — do NOT hand-write a partial `lint` that silently drops `lint:no-tier-terms`. **Done when:** `jq -e '.scripts["check:type"] and .scripts["check:format"] and .scripts.lint and .scripts.check' package.json` exits 0; `jq -e '.scripts.typecheck or .scripts["format:check"]' package.json` exits NON-zero (old keys gone); the `lint` aggregate's body references `lint:slop`, `lint:prose`, AND `lint:no-tier-terms`.
- [ ] **WS1-2 — Update `bkit-manifest.ts` minted keys.** `CI_MANIFEST` -> `check:type`; `LINT_MANIFEST` -> `check:format`. **Done when:** `.agents/scripts/bkit-manifest.ts` contains `"check:type"` and `"check:format"` in the respective manifests and no longer mints `typecheck`/`format:check`.
- [ ] **WS1-3 — Update `bkit-modules.ts` defaults + advisory prose.** `runCiModule`/`runLintModule` defaults + the no-op-note/advisory strings. **Done when:** `bkit-modules.ts` references the new names; no forward-looking string mints the old names.
- [ ] **WS1-4 — Update CI + release + husky callers.** `ci.yml` (rename + add push-only `test:smoke` step), `release.yml`, `.husky/pre-push`, verify `.husky/pre-commit`/lint-staged. **Done when:** `rg 'pnpm (typecheck|format:check)' .github/workflows .husky` returns ZERO hits; `ci.yml` has a `test:smoke` step with `if: github.event_name == 'push'`.
- [ ] **WS1-5 — Update installer test assertions + add back-compat test.** The five test files; add an assertion proving discovery probes both legacy + new names. **Done when:** the updated tests reference the new names; a test asserts back-compat probing (B1=a); `pnpm test` green after WS-1.
- [ ] **WS1-6 — Update templates + reference docs.** `.agents/templates/**`, `.agents/rules.md`, `docs/{technology,setup,deployments,testing,security}.md`, `docs/bkit-comparison.md` (line ~68 agent-role prose `iterates edit -> lint/typecheck/test -> edit` -> `lint/check/test`), `.agents/README.md`, `.agents/prompts.md`. **Done when:** forward-looking command references use `lint check test` naming; `rg 'pnpm typecheck|pnpm format:check' .agents docs --glob '!docs/plans/**' --glob '!**/CHANGELOG.md' --glob '!docs/knowledge.md'` returns ZERO non-historical hits AND `rg -n 'lint/typecheck/test' docs/bkit-comparison.md` returns ZERO hits (the convention prose is renamed, no ownerless stale reference).
- [ ] **WS1-7 — Leave `tests/fixtures/**`on legacy names (back-compat proof).** **Done when:**`tests/fixtures/heavy-customised-{consumer,prepush,ci}`retain`typecheck`/`format:check`, and a test asserts the installer/discovery handles them via back-compat.
- [ ] **WS1-8 — Convert the workflow/prompt DISCOVERY-SEAM loops + aggregate lines (B1=a probe-both).** For EACH grep-verified site, (a) rename the aggregate `pnpm turbo lint typecheck test` -> `pnpm turbo lint check test`; (b) update the literal `for s in typecheck test format:check ...` list to carry BOTH `check:type typecheck check:format format:check` (probe-both). Sites: `.agents/workflows/bkit-debug.md` (303, 493/496, 637/640, 746/748), `.agents/workflows/bkit-build.md` (710/713 — WS-5 in plan-v4-3 also narrows `test`->`test:unit` + appends `test:smoke` here), the eight `.agents/prompts/*.md` (`bkit-build-plan-execute`, `bkit-build-plan-gaps-remediate`, `bkit-build-challenge-remediate`, `bkit-build-challenge-tests`, `bkit-debug-failure-remediate`, `bkit-debug-observe-instrument`, `bkit-ship-conflict-resolve`, and `bkit-utility-compress-markdown`), and the `.agents/workflows.md` NON-catalog lines 523/636/643/649/651 (catalog rows 621/646/972/975 are owned by WS-8 in plan-v4-4). **`bkit-utility-compress-markdown.md` is the ONE EXCEPTION:** its hit (line ~79) is an illustrative BAD-compression EXAMPLE STRING (`pnpm turbo lint typecheck test --filter='...[origin/dev]'`), NOT a discovery loop — it must read the renamed aggregate `pnpm turbo lint check test ...` with NO probe-alias (a probe-alias is semantically wrong in example prose). This closes the #143-class silent-gate-disablement (`docs/knowledge.md:365`): an un-renamed loop makes `jq -e .scripts["typecheck"]` non-zero on the renamed bkit repo so the gate silently no-ops. **Done when:** `rg -n 'pnpm turbo lint typecheck test' .agents` returns ZERO hits (every aggregate reads `lint check test`); every `for s in` discovery loop that listed `typecheck`/`format:check` now ALSO lists `check:type`/`check:format`; `rg -n '\b(typecheck|format:check)\b' .agents/prompts/bkit-utility-compress-markdown.md` returns ZERO hits (the example string is renamed, NO probe-alias); for the OTHER seven prompts + two workflow files, `rg -n '\b(typecheck|format:check)\b' .agents/prompts .agents/workflows .agents/workflows.md --glob '!**/bkit-utility-compress-markdown.md'` shows every remaining hit is a probe-alias paired with its renamed `check:*` name on the SAME line (no bare legacy name without its pair). ASCII operators; no internal refs.

### 🔒 Gate WS-1: Atomic rename verified

- [ ] **No old-name callers remain (except deliberate fixtures + historical docs + probe-aliases).** `rg '\b(typecheck|format:check)\b' --glob '!docs/plans/**' --glob '!**/CHANGELOG.md' --glob '!docs/knowledge.md' --glob '!docs/completed.md' --glob '!tests/fixtures/**' --glob '!dist/**' --glob '!.claude/**' --glob '!.cursor/**'` reviewed; EVERY remaining hit is EITHER a back-compat probe alias paired with its `check:*` name (owned by WS1-8 for the discovery loops) OR a converted reference-doc mention (WS1-6) — there is NO bare legacy name without an owning task. A faithful executor must NOT wave a hit through as "alias" unless WS1-8/WS1-6 converted it; if a hit has no owning task, the gate FAILS. **Sequencing note:** the `.agents/workflows.md` CATALOG rows 621/646/972/975 are owned by WS-8 (which runs AFTER WS-1 in the DAG, in plan-v4-4), so a hit on exactly those four catalog lines is EXPECTED-and-deferred-to-WS-8, not a Gate WS-1 failure; every OTHER hit must map to a completed WS1-2..WS1-8 task. **Done when:** reviewed and confirmed every hit maps to WS1-2..WS1-8 (probe-alias, fixture, or historical-doc exclusion) OR is one of the four WS-8-deferred catalog rows.

## Hand-off to next child

On merge, plan-v4-2 (WS-2 + WS-3) may start. It relies on: the renamed `check:type`/`check:format`/`lint`/`check`/`test` scripts existing; the B1=(a) probe-both convention in the discovery loops; the `LIVE_API` flag name confirmed (Task 0c); the two DE entries recorded (Tasks 0a/0b). The mirror regen (`dist/`, `.claude/`, `.cursor/`, snapshots) for the rename surface is part of THIS child's session-end batch.
