<!-- bkit:start -->

<!-- bkit:managed v4.2.1 — do NOT edit; run `bkit upgrade` to refresh -->

# Pending

> [!CAUTION]
> **Purpose:** Ledger of deferred issues and future feature ideas. Append-only.
> **Categories:** `infra | agentic | backend | frontend | data | integrations | ai | testing | security | other`.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Append-only at EOF, do NOT overwrite.
> - Cross-doc: grep any `DE-\d+`/`KN-\d+` across `decisions.md` / `knowledge.md`.
>
> **Format:**
>
> ```markdown
> ## Title (YYYY-MM-DD)
>
> - **Type:** issue | feature
> - **Category:** {one of above}
> - **Severity:** critical | normal | low
> - **Status:** open | resolved | deferred
> - **Description:** what's wrong/risky/planned
> - **Workaround:** mitigation (omit if none)
> - **Source:** agent | human | phase
> - **Related:** {FID}, Linear IDs BAR-{N}, PRs PR-{N}, Commits {SHA}, Decisions DE-{N}, Knowledge KN-{N}, paths, etc
> ```

<!-- bkit:end -->

## pnpm tag-drop README note for `@cbartens/bkit` install snippet (2026-05-06)

- **Type:** issue
- **Category:** infra
- **Severity:** low
- **Status:** open
- **Description:** pnpm normaliser strips `#vX.Y.Z` pin from `github:cbartens/bkit` git-dep entries in `package.json`. Document workaround in `README.md` install snippet or investigate upstream pnpm normaliser fix. Deferred to post-v0.7.
- **Source:** phase
- **Related:** BAR-131, BAR-130

## Factory-reset uninstall mode (2026-05-06)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** deferred
- **Description:** `bkit uninstall` surgical mode covers shipped scope. Full factory-reset (delete all bkit-managed files, restore consumer originals) is out-of-scope. Deferred post-v1.0 if consumer demand emerges.
- **Source:** phase
- **Related:** BAR-139

## `pnpm-lock.yaml` cleanup automation post-uninstall (2026-05-06)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** deferred
- **Description:** After `bkit uninstall`, `pnpm-lock.yaml` may retain stale entries for removed devDeps. Cleanup is consumer-managed lockfile state — outside bkit's contract. No automation planned.
- **Source:** phase
- **Related:** BAR-139

## Per-key `.bkitignore` drift exclusion (`dotted.key` syntax) (2026-05-06)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** open
- **Description:** Per-key drift exclusion ships gated behind `BKIT_BKITIGNORE_PER_KEY=1` env var (P2.T11). If not promoted to default before v1.0, general availability deferred to follow-up release.
- **Source:** phase
- **Related:** BAR-142

## Three-way merge UI for `bkit upgrade` conflicts (2026-05-06)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** deferred
- **Description:** Stderr conflict list is sufficient for v1.0. Rich three-way merge UI (e.g. patch preview, interactive resolution) deferred post-v1.0.
- **Source:** phase
- **Related:** BAR-142

## Wire staging primitives into bkit-modules.ts write call sites + add subprocess SIGTERM integration test (2026-05-08)

- **Type:** issue
- **Category:** agentic
- **Severity:** low
- **Status:** open
- **Description:** Staging primitives (`getStagingDir`, `commitStaging`, `discardStaging`) are exported from `bkit-install.ts` and unit-tested but NOT yet called from `bkit-modules.ts` `writeTier2Json` call sites (lines 432, 518). "Mid-failure leaves consumer files untouched" criterion is enforced only at API level + Scenario 9 direct-call test. Architectural foundation intact; gap is bounded. Surfaced in `build-plan-verify-holistic.md` CONCERN.
- **Source:** phase
- **Related:** BAR-131, BAR-142 §A4, DE-9, KN-12, `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-install.ts`

## Per-PR opt-in alternative to `bkit:auto-route` Linear label (2026-05-08)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** deferred
- **Description:** BAR-148 ships per-issue Linear label `bkit:auto-route` as the router opt-in (label survives across debug iterations on the same issue). Per-PR opt-in (e.g. PR-body marker, GHA repo variable, separate label) deferred — revisit if per-issue label proves too coarse during ship cycles where multiple PRs land per issue.
- **Source:** phase
- **Related:** BAR-148, DE-14, DE-15

## Router dead-letter / retry policy if `claude-code-action@v1` crashes mid-step (2026-05-08)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** deferred
- **Description:** v1 of `bkit-cloud` surfaces dispatch-step crashes via GHA run log + existing Linear comment append (Failure Path mirror). No automated retry, dead-letter queue, or exponential backoff. Operator-triggered remediation only. Revisit if observed crash rate justifies added complexity.
- **Source:** phase
- **Related:** BAR-148, DE-14

## BAR-155 deferred — `task-range` parameter for `bkit-build-plan-execute` (2026-05-09)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** deferred
- **Description:** Add a `task-range` parameter to `bkit-build-plan-execute` so large plans (>15 tasks) can be executed in slices without splitting the plan file. Revisit only if the Fix 2 task-count gate (>15 → SPLIT) proves too strict and legitimate single-issue plans exceed 15 tasks. Current 15-task cap chosen as safety margin (18 = highest clean run observed; 20 = lowest dirty run).
- **Source:** phase
- **Related:** BAR-155, `.bkit/prompts/bkit-build-plan-execute.md`, `.bkit/workflows/bkit-plan.md` Step 8

## BAR-155 deferred — KN/DE auto-renumber on rebase conflicts (2026-05-09)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** deferred
- **Description:** Automate renumbering of `KN-{N}` / `DE-{N}` ID sequences on rebase conflict in `docs/knowledge.md` / `docs/decisions.md`. Deferred — sed regex / cross-platform fragility; manual resolution acceptable at current frequency. Revisit if rebase conflicts on these files become recurring.
- **Source:** phase
- **Related:** BAR-155

## BAR-155 deferred — focused-brief mode for `bkit-build-challenge` (2026-05-09)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** deferred
- **Description:** Add focused-brief mode to challenge prompts narrowing reviewer attention to a specific subsystem or diff slice. Dropped from BAR-155 scope — diversity over narrowing per DE-16 (parallel pair provides cross-model coverage; focused-brief risks correlated misses in both reviewers). Revisit if reconciler findings cluster around the same file:line across multiple runs.
- **Source:** phase
- **Related:** BAR-155, DE-16

## Cursor v1 keyed-object schema deeper validation if Task 0a spike surfaces issues (2026-05-09)

- **Type:** issue
- **Category:** infra
- **Severity:** low
- **Status:** deferred
- **Description:** BAR-167 Task 0a re-runs the DE-7 Cursor-v1 keyed-object hooks-schema spike against current Cursor stable channel. If the spike fails (hook does not fire OR Cursor reports schema-validation error), the plan's abort-branch reverts the template to the legacy flat-array shape and blocks v2.0.0. Deeper investigation (multi-version Cursor matrix, schema-doc cross-check with Cursor team, alternate keyed-array fallback) is parked here as a follow-up if the abort-branch fires. No work required if Task 0a passes cleanly.
- **Source:** phase
- **Related:** BAR-167, DE-7, DE-16

## bkit upgrade --prune flag — deferred post-v2.0.0 (2026-05-11)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** deferred
- **Description:** Add `bkit upgrade --prune` flag to remove consumer keys once part of bkit-declared scope but since removed from the template. Currently `bkit upgrade` only deep-merges (adds/updates template keys) — it does not prune consumer keys that were bkit-written in a prior version but absent from the current template. The `--prune` flag would walk the prior-version template tree and delete any consumer keys that exactly match the prior template's values and are absent from the current template. Deferred from BAR-167 Phase 1 scope — prune semantics require prior-template-version tracking not yet implemented.
- **Source:** phase
- **Related:** BAR-167, DE-18, `.agents/scripts/bkit-upgrade.ts`

## Drop decorative `.cursor/hooks.json` echo commands — deferred per Plan-Phase Decision 3 (2026-05-11)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** deferred
- **Description:** The `.cursor/hooks.json` template ships `echo '[bkit] session started'` and `echo '[bkit] session stopped'` hook commands. These are decorative (confirm hook firing) and produce visible output in the Cursor terminal. Plan-Phase Decision 3 resolved to KEEP these echoes (they provide actionable debugging value — consumer can confirm hooks fired). Tracks the open question: if consumer feedback emerges that the echoes are noisy/unwanted, add a bkit-config opt-out rather than removing from the template. No work required unless that feedback arrives.
- **Source:** phase
- **Related:** BAR-167, DE-18, `.agents/templates/.cursor/hooks.json`

## Enable `main` branch protection ruleset on `cbartens/bkit` (2026-05-12)

- **Type:** issue
- **Category:** infra
- **Severity:** normal
- **Status:** deferred
- **Description:** `main` currently has no GitHub-side protection — both classic branch protection (`repos/.../branches/main/protection`) and rulesets (`repos/.../rulesets`) return `403 Upgrade to GitHub Pro or make this repository public`. Dev→main PR flow is enforced only by bkit workflow discipline, not by GitHub. Apply once the repo is either made public or upgraded to GitHub Pro. **Quick path:** `bash .bkit/scripts/bkit-protect-main.sh` (require PR, required check `bkit-tests-check` — the always-on capstone, so green means validated — enforce-for-admins, linear history, no force-push/deletion; pre-flights that a `bkit-tests-check` job exists in `ci.yml`). Equivalent ruleset JSON staged at `/tmp/main-ruleset.json`: target `refs/heads/main`, enforcement `active`, rules = `deletion` + `non_fast_forward` + `pull_request` (0 approvals so the release agent can self-merge, no stale-dismiss, no code-owner, no last-push-approval, no thread resolution) + `required_status_checks` (non-strict, context `bkit-tests-check`), **zero bypass actors** (enforce-for-admins is load-bearing — agents act with the owner's admin token). CI job renamed `run-tests` → `bkit-tests` (#140; `.github/workflows/ci.yml`). Apply with `gh api -X POST repos/cbartens/bkit/rulesets --input /tmp/main-ruleset.json`.
- **Workaround:** Agents follow bkit workflow rules — never push directly to `main`; PRs always base=main head=dev (or feature→dev→main); humans approve+merge; surface PR URL and stop if blocked.
- **Source:** human
- **Related:** `.github/workflows/ci.yml`

## BAR-167 Phase 2 — indented YAML marker drift detection not implemented (2026-05-11)

- **Type:** issue
- **Category:** agentic
- **Severity:** low
- **Status:** resolved
- **Description:** `ci.yml` uses 6-space-indented `# bkit:start` / `# bkit:end` markers (Group B partial-ownership). `extractManagedBlock` only detects line-anchored markers (column-0 or comment-prefix position), so `detectTier2TextDrift` returns `null` for `ci.yml` — no drift is flagged even if a consumer edits the block. The Phase 2 acceptance promise ("teammate deletes `pnpm bkit check` from ci.yml → `bkit check` flags tier2-text-drift") is therefore NOT enforced for the ci.yml indented-marker case. Both `bkit-modules.integration.test.ts` (line 1216) and `bkit-modules.upgrade.integration.test.ts` (line 331) assert `result === null` and document this boundary. Fix requires a dedicated indented-YAML-marker parser, deferred to sub-plan C or a follow-up issue.
- **Resolution:** WONTFIX-by-design. The `ci.yml` Tier-2→Tier-3 migration was finished — the decorative whole-file `# bkit:start` / `# bkit:end` markers were removed from `.agents/templates/.github/workflows/ci.yml` (only the named `verbose-ci-env` block remains). `ci.yml` is now byte-equal seed-or-print: seeded once, fully consumer-owned afterward, so drift is expected and is correctly NOT flagged. No indented-marker parser is needed. Legacy consumers seeded with the old markers keep their files unchanged (seed-or-print never overwrites); `detectTier2TextDrift` returning `null` for them is now the intended Tier-3 contract, not a gap.
- **Source:** phase
- **Related:** BAR-167, `.agents/scripts/bkit-modules.integration.test.ts`, `.agents/scripts/bkit-modules.upgrade.integration.test.ts`, `.agents/scripts/bkit-install.ts` `extractManagedBlock`, `.agents/templates/.github/workflows/ci.yml`

## CI lint guarding against `.agents/scripts`/`.agents/templates` source-literal re-introduction in `.bkit/src` (2026-05-26)

- **Type:** feature
- **Category:** testing
- **Severity:** low
- **Status:** open
- **Description:** After #160 relocates the engine/payload to `.bkit/`, a standing CI lint asserting no `.agents/scripts`/`.agents/templates` SOURCE-root literal creeps back into `.bkit/src` (and `tsconfig.json`/`vitest.config.ts`/`package.json`) would prevent regression of the single-source-of-truth seam. #160's Gate WS-3 grep is a one-time check, not a recurring guard; WS-7 only adds a rules.md block-equality gate. Out of scope for #160 (pattern-prevention beyond the stated refactor). Revisit if a stale source-root literal re-appears post-merge.
- **Source:** phase
- **Related:** #160, `.bkit/src/bkit-paths.ts` (`BKIT_SRC_SUBPATH` seam)

## bkit-repo-own `renovate-local.json5` parallel update if Renovate noise emerges post-`.bkit/` move (2026-05-26)

- **Type:** issue
- **Category:** infra
- **Severity:** low
- **Status:** deferred
- **Description:** #160 re-points the SHIPPED `renovate.json5` template `ignorePaths` `.agents/templates/** → .bkit/templates/**`. The bkit repo's OWN Renovate config (`renovate-local.json5` / repo-level overrides) is not touched by #160. If, after the move, Renovate on the bkit repo itself emits onboarding-PR noise scanning the relocated `.bkit/` tree, add a parallel `ignorePaths`/fence to the bkit repo's own Renovate config. Out of scope for #160. No work required unless noise is observed.
- **Source:** phase
- **Related:** #160, `.github/renovate-local.json5`

## Unify the #143 `LIVE_API`/`@smoke` convention with the #203 `@live`/`run_live` scaffold (2026-06-03)

- **Type:** feature
- **Category:** agentic
- **Severity:** normal
- **Status:** deferred
- **Description:** #143 was built keyed on the EXISTING #203 vocabulary (`@live` tier, `test:live` suffix, `run_live` gate, `bkit-tests-live` job) rather than the plan's `LIVE_API` flag + `@smoke` tag + `test:smoke` script. The gether consumer (gether-life/app-gether-life#399/#403/#422) adopted the `LIVE_API`/`@smoke`/`test:smoke` side and validated it green — bkit's scaffold and a real consumer now speak two overlapping live-test dialects. A future pass should pick ONE (likely consumer-first, since gether already migrated): either teach bkit's live-tier probe + docs to recognise `test:smoke`/`@smoke`/`LIVE_API`, or migrate gether to `test:live`/`@live`. The #143 gates are vocabulary-agnostic (they probe for whatever live script the consumer declares), so this is convention-alignment, not a gate rewrite.
- **Source:** human
- **Related:** #143, #203, DE-23, gether-life/app-gether-life#399, `docs/testing.md`, `.bkit/templates/.github/workflows/ci.yml`

## #143 script-naming rename (typecheck -> check:type, format:check -> check:format, lint/check/test umbrellas) (2026-06-03)

- **Type:** feature
- **Category:** infra
- **Severity:** low
- **Status:** deferred
- **Description:** The #143 plan's WS-1 atomic script rename + umbrella aggregates was intentionally NOT built (decision: keep what's in dev; the rename is the exact atomic-or-red-CI blast radius across installer TS / manifests / CI / husky / templates / dist / mirrors / tests to avoid, and #203 already shipped a working naming/CI standard). If a single naming standard is later wanted, do it as its own atomic change with probe-both back-compat (legacy names survive as discovery-loop aliases) so un-migrated consumers keep gating.
- **Source:** human
- **Related:** #143, DE-23, `docs/decisions.md`

## Tighter per-paid-endpoint soak-iteration cap for `DEBUG_MODE = SOAK` (2026-06-03)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** deferred
- **Description:** Soak loops the live test on the dedicated `MAX_SOAK_ATTEMPT` (= 3) budget (reset to 0 on each SOAK entry). For paid endpoints (real model / API calls), three full instrument->fix->re-verify iterations per invocation can be costly. A future refinement could add a per-endpoint or per-cost soak-iteration cap (tighter than the SOAK budget) for expensive live boundaries. Out of scope for #143 (the cap bounds spend adequately for the common case).
- **Source:** human
- **Related:** #143, DE-24, DE-25, `.bkit/workflows/bkit-debug.md` (Step 7 soak-remediate), `.bkit/prompts/bkit-debug-failure-soak.md`
