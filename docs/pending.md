<!-- bkit:start -->

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

## Consumer migration to @cbartens/bkit registry path — app-gether-life (2026-05-06)

- **Type:** issue
- **Category:** infra
- **Severity:** normal
- **Status:** open
- **Description:** `app-gether-life` still consumes `@cbartens/bkit` via `github:cbartens/bkit#vX.Y.Z` (v0.3.x). Migrate to `^0.4.0` from GH Packages registry: add `.npmrc` (`@cbartens:registry=https://npm.pkg.github.com` + `_authToken`), expand `GH_BKIT_TOKEN` PAT scope to `read:packages`, drop GHA `Configure private-repo auth` step, drop Vercel `installCommand` git-shim.
- **Source:** phase
- **Related:** BAR-138, DE-3, `docs/plans/completed/202605/bar-138-gh-packages-distribution-design.md`

## Consumer migration to @cbartens/bkit registry path — www-visitfrasercoast-com (2026-05-06)

- **Type:** issue
- **Category:** infra
- **Severity:** normal
- **Status:** open
- **Description:** `www-visitfrasercoast-com` still consumes `@cbartens/bkit` via `github:cbartens/bkit#vX.Y.Z` (v0.3.x). Migrate to `^0.4.0` from GH Packages registry: add `.npmrc` (`@cbartens:registry=https://npm.pkg.github.com` + `_authToken`), expand `GH_BKIT_TOKEN` PAT scope to `read:packages`, drop GHA `Configure private-repo auth` step, drop Vercel `installCommand` git-shim.
- **Source:** phase
- **Related:** BAR-138, DE-3, `docs/plans/completed/202605/bar-138-gh-packages-distribution-design.md`

## bkit doctor verb — standalone preflight CLI subcommand (2026-05-06)

- **Type:** feature
- **Category:** dx
- **Severity:** normal
- **Status:** open
- **Description:** Expose `runPreflight()` (built in BAR-141) as a standalone `pnpm bkit doctor` (or similar) CLI verb. Runs Phase 1 + Phase 3 detection without touching disk, prints the unified checklist, exits 0. Lets consumers diagnose drift between `bkit install` runs (e.g. stale version pin, missing token surfaces) without re-running a full install. Architecture is already factored — preflight is a pure function — so this is a thin CLI wrapper. Out of scope for BAR-141 (new CLI surface).
- **Source:** phase
- **Related:** BAR-141

## pnpm tag-drop README note for `@cbartens/bkit` install snippet (2026-05-06)

- **Type:** issue
- **Category:** infra
- **Severity:** low
- **Status:** open
- **Description:** pnpm normaliser strips `#vX.Y.Z` pin from `github:cbartens/bkit` git-dep entries in `package.json`. Document workaround in `README.md` install snippet or investigate upstream pnpm normaliser fix. Low cost; deferred to post-v0.7.
- **Source:** phase
- **Related:** BAR-131, BAR-130

## Factory-reset uninstall mode (2026-05-06)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** deferred
- **Description:** `bkit uninstall` surgical mode covers shipped scope. Full factory-reset (delete all bkit-managed files, restore consumer originals) is explicitly out-of-scope. Deferred post-v1.0 if consumer demand emerges.
- **Source:** phase
- **Related:** BAR-139

## `pnpm-lock.yaml` cleanup automation post-uninstall (2026-05-06)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** deferred
- **Description:** After `bkit uninstall`, `pnpm-lock.yaml` may retain stale entries for removed devDeps. Cleanup is consumer-managed lockfile state — outside bkit's contract. Decision deferred; no automation planned.
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

## `bkit init` scaffolder for consumer CI variants (2026-05-06)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** deferred
- **Description:** Composite vs. reusable workflow CI templating via `bkit init` is post-v1.0. Current `bkit install --ci` covers the common case.
- **Source:** phase
- **Related:** BAR-131

## `setup-auth@v1` bash PAT-shim removal (2026-05-06)

- **Type:** issue
- **Category:** infra
- **Severity:** low
- **Status:** open
- **Description:** Bash PAT-shim retained until v1.1.0 per Supersession Inventory. Create Linear issue post-v1.0 ship to track removal of `cbartens/bkit/.github/actions/setup-auth@v1`.
- **Source:** phase
- **Related:** BAR-131, BAR-142

## Wire staging primitives into bkit-modules.ts write call sites + add subprocess SIGTERM integration test (2026-05-08)

- **Type:** issue
- **Category:** agentic
- **Severity:** low
- **Status:** open
- **Description:** Staging primitives (`getStagingDir`, `commitStaging`, `discardStaging`) are exported from `bkit-install.ts` and unit-tested but NOT yet called from `bkit-modules.ts` `writeTier2Json` call sites (lines 432, 518). Master "mid-failure leaves consumer files untouched" criterion is currently enforced only at API level + Scenario 9 direct-call test. Architectural foundation intact; gap is bounded. Surfaced in `build-plan-verify-holistic.md` CONCERN.
- **Source:** phase
- **Related:** BAR-131, BAR-142 §A4, DE-9, KN-12, `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-install.ts`

## Per-PR opt-in alternative to `bkit:auto-route` Linear label (2026-05-08)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** deferred
- **Description:** BAR-148 ships per-issue Linear label `bkit:auto-route` as the router opt-in (label survives across debug iterations on the same issue). Per-PR opt-in (e.g. PR-body marker, GHA repo variable, separate label) is deferred — revisit if the per-issue label proves too coarse during ship cycles where multiple PRs land per issue.
- **Source:** phase
- **Related:** BAR-148, DE-14, DE-15

## Router dead-letter / retry policy if `claude-code-action@v1` crashes mid-step (2026-05-08)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** deferred
- **Description:** v1 of `bkit-ci-router` surfaces dispatch-step crashes via the GHA run log + the existing Linear comment append (Failure Path mirror). No automated retry, no dead-letter queue, no exponential backoff. Operator-triggered remediation only. Revisit if observed crash rate justifies the additional complexity.
- **Source:** phase
- **Related:** BAR-148, DE-14

## BAR-155 deferred — `task-range` parameter for `bkit-build-plan-execute` (2026-05-09)

- **Type:** feature
- **Category:** agentic
- **Severity:** low
- **Status:** deferred
- **Description:** Add a `task-range` parameter to `bkit-build-plan-execute` so large plans (>15 tasks) can be executed in slices without splitting the plan file. Revisit only if the Fix 2 task-count gate (>15 → SPLIT) proves too strict and legitimate single-issue plans legitimately exceed 15 tasks. Current 15-task cap chosen as safety margin (18 = highest clean run observed; 20 = lowest dirty run).
- **Source:** phase
- **Related:** BAR-155, `.agents/prompts/bkit-build-plan-execute.md`, `.agents/workflows/bkit-plan.md` Step 8

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
- **Description:** Add a focused-brief mode to challenge prompts that narrows reviewer attention to a specific subsystem or diff slice. Dropped from BAR-155 scope — diversity over narrowing per DE-16 (parallel pair provides cross-model coverage; focused-brief risks correlated misses in both reviewers). Revisit if reconciler findings cluster around the same file:line across multiple runs.
- **Source:** phase
- **Related:** BAR-155, DE-16

## BAR-155 deferred — `bkit-build.md` Step 2 `git rebase || exit 1` anti-pattern carry-over (2026-05-09)

- **Type:** issue
- **Category:** agentic
- **Severity:** normal
- **Status:** deferred
- **Description:** `bkit-build.md` Step 2 (Branch Sync) still uses the bare `git rebase origin/dev || { echo ...; exit 1; }` anti-pattern (same shape as the Fix 5 target in `bkit-ship.md` Step 2). BAR-155 Fix 5 scoped to `bkit-ship.md` only. Carry-over as a follow-up issue — replace with sentinel-file Failure Path routing identical to `bkit-ship.md` Step 2 post-fix.
- **Source:** phase
- **Related:** BAR-155, `.agents/workflows/bkit-build.md` Step 2, `.agents/workflows/bkit-ship.md` Step 2
