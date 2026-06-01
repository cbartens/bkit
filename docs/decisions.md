<!-- bkit:start -->

# Decisions

> [!CAUTION]
> **Purpose:** ADRs — what was decided, why, discarded alternatives. Append-only.
> **ID:** `DE-{N}` — next = `max(grep 'DE-\d+') + 1`.
> **Categories:** `infra | agentic | backend | frontend | data | integrations | ai | testing | security | other`.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Append-only at EOF, do NOT overwrite.
> - Grep keywords/categories first → read only relevant, no dupes.
>
> **Format:**
>
> ```markdown
> ## DE-{N}: Title (YYYY-MM-DD)
>
> - **Category:** {one of above}
> - **Status:** active | superseded | deferred
> - **Decision:** what
> - **Why:** reasoning
> - **Discarded:** alternatives (omit if none)
> - **Superseded by:** DE-{N} (only if superseded)
> - **Source:** agent | human | phase
> - **Related:** {FID}, Linear IDs BAR-{N}, PRs PR-{N}, Commits {SHA}, Decisions DE-{N}, Knowledge KN-{N}, paths, etc
> ```

<!-- bkit:end -->

## DE-3: bkit Distribution via GitHub Packages npm Registry (2026-05-06)

- **Category:** infra
- **Status:** active
- **Decision:** Distribute `@cbartens/bkit` via GitHub Packages npm registry (`https://npm.pkg.github.com`) starting v0.4.0. v0.3.x remains consumable from git but is frozen. Consumer auth = PAT with `read:packages` scope + `.npmrc` at repo root.
- **Why:** Eliminates four friction classes from git-dep model: (1) private-repo clone requires git auth on two surfaces (GHA + Vercel); (2) `Configure private-repo auth` shim needed in every consumer CI workflow; (3) lifecycle-hook OOM trap via `prepare: tsc` (BAR-130 #5); (4) pnpm tag-drop bug strips `#vX.Y.Z` pin from `package.json`. Registry path uses standard scoped-package semantics — one `.npmrc` file + one env var — with no git ceremony.
- **Discarded:** (1) npmjs.org public registry — package is private; private-org plan adds cost. (2) Continue git-dep — all four friction classes persist. (3) GitHub Releases tarball URL — clunky version pinning, no semver resolution. (4) Vendor bkit per-consumer — N×duplication, manual sync. (5) Dual-publish git+registry — code-path drift; contradictory installer guidance during transition window.
- **Note:** `publishConfig.access: restricted` in `package.json` is silently ignored by GitHub Packages — package visibility tracks the linked repository's visibility (private repo = private package), not the npm `access` field. The field is kept for documentation intent but has no enforcement effect. If `cbartens/bkit` is ever made public the package becomes public regardless of this setting.
- **Note:** The `release.yml` publish job has no `environment:` protection by design (single-maintainer; no secondary approval needed). If a second maintainer is onboarded, gate the publish step behind `environment: production` with required-reviewer protection in GitHub repo settings.
- **Source:** phase
- **Related:** BAR-138, BAR-130, `docs/plans/202605/bar-138-gh-packages-distribution-design.md`, `package.json`, `.github/workflows/release.yml`, KN-1

## DE-5: BAR-139 — .bkit-version schema extension: tier3Hashes (2026-05-07)

- **Category:** agentic
- **Status:** active
- **Decision:** Extend `.agents/.bkit-version` from a plain-text semver pin to a JSON object `{ pinnedVersion: string; tier3Hashes: Record<path, sha256> }`. The sha256 map records the content hash of each Tier-3 file at install time. During `bkit uninstall`, `shouldDeleteTier3` checks whether current on-disk content matches the recorded hash — if so, safe to delete; if not (consumer modified), preserved. Backward-compat reader parses old plain-text payloads as `{ pinnedVersion, tier3Hashes: {} }` (unknown → preserve-default).
- **Why:** Tier-3 files (seed-or-print) are deleted during uninstall only if still in the exact state bkit wrote them. Without a recorded hash, `bkit uninstall` cannot distinguish a default-seeded `ci.yml` (safe to delete) from a consumer-customised one (must preserve). Plain-text format is insufficient; JSON is human-readable and extensible.
- **Discarded:** (1) Keep plain-text; detect "default content" by re-rendering the template at uninstall time — fails for Tier-3 files with token substitution bkit can no longer re-compute (consumer tokens may have changed). (2) Store hashes in a separate `.bkit-hashes.json` — two files to keep in sync; `.bkit-version` is the natural home.
- **Source:** phase
- **Related:** BAR-139, `.agents/scripts/bkit-version.ts`, `.agents/scripts/bkit-uninstall.ts`

## DE-6: BAR-142 §A2 — .bkitignore public contract (2026-05-07)

- **Category:** agentic
- **Status:** active
- **Decision:** `.bkitignore` is a new public file at the consumer repo root. Syntax: `#` comment, blank-line ignore, [picomatch](https://github.com/micromatch/picomatch) glob, optional `:dotted.key` suffix for per-key exclusion. Per-key is opt-in behind `BKIT_BKITIGNORE_PER_KEY=1` env var (off by default). Once shipped, the file and its syntax are a public contract.
- **Why:** Consumers legitimately override bkit-managed files (e.g. custom ci.yml jobs, additional `.claude/settings.json` hook events). `bkit check` currently reports false-positive drift for these. `.bkitignore` gives consumers a declarative escape hatch without touching the managed file itself. Per-key is opt-in because implementation cost is high and per-file covers the majority use-cases.
- **Discarded:** (1) Make per-key the default — implementation cost likely high; opt-in via env covers the primary use case. (2) Use a custom DSL instead of gitignore-style — picomatch is well-understood, has no shell-out, and is a pure-regex library (security: no injection risk). (3) Store in `.agents/.bkitignore` — consumer-owned files belong at repo root, not in the `.agents/` subtree (which is bkit-managed).
- **Source:** phase
- **Related:** BAR-142 §A2, `.agents/scripts/bkit-bkitignore.ts`, `docs/pending.md` (per-key deferred)

## DE-4: BAR-141 — Structured PreflightFinding replaces printSink (2026-05-06)

- **Category:** agentic
- **Status:** active
- **Decision:** Replace `ModuleContext.printSink: string[]` with `ModuleContext.advisories: PreflightFinding[]` (shape: `{id, severity, detect, action}`). Install restructured into three phases: Phase 1 preflight (read-only, blockers short-circuit before any writes), Phase 2 dispatch (unchanged), Phase 3 post-install re-detection (token surfaces, ci.yml, vale sync, devDeps). Findings deduplicated by `id` — Phase 3 wins on conflict.
- **Why:** `printSink: string[]` was unparseable by downstream tooling, emitted advisory strings during module execution (before post-install state was accurate), and had no structured `id` for deduplication. Structured shape enables: (1) stable `id` registry for downstream automation; (2) blocker short-circuit before any writes; (3) accurate post-install re-detection; (4) unified banner formatter reusable by BAR-139 (`bkit uninstall`).
- **Discarded:** (1) Keep `printSink` + add parallel `findings: PreflightFinding[]` — two sinks → drift risk; downstream tooling has to merge two shapes. (2) `--strict` flag promoting advisories to blockers — out of scope; consumer can use `bkit check` (exit-1-on-drift). (3) Auto-apply advisory fixes — violates consumer-value-wins principle.
- **Source:** phase
- **Related:** BAR-141, `docs/plans/202605/bar-141-preflight-checklist-plan.md`, `.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-postinstall.ts`, `.agents/scripts/bkit-install.ts`, `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-tiers.ts`, DE-3, KN-4

## DE-7: BAR-142 §A1 — Cursor v1 hooks.json schema spike outcome (2026-05-07) (superseded by DE-18, 2026-05-11)

- **Category:** agentic
- **Status:** active
- **Decision:** `__bkit__` envelope is safe to use as a top-level key in `.cursor/hooks.json`. Cursor's documented v1 schema uses `{"version": 1, "hooks": {eventName: [...commands]}}`. Cursor does NOT reserve a `__bkit__` key or any `__`-prefixed namespace. bkit's current shipped form (`{"hooks": [{event, command}]}`) is the legacy flat-array format; v1 schema uses an object-keyed form. No conflict exists with `__bkit__`. Spike blesses the `__bkit__` envelope shape for both `.cursor/hooks.json` and `.claude/settings.json`.
- **Why:** BAR-142 §A1 requires explicit verification that `__bkit__` doesn't clash with any Cursor-reserved key before implementing the Tier-2 deep-merge. Cursor docs (cursor.com/docs/context/rules) and `.cursor/hooks.json` schema at SchemaStore show no reserved `__*` keys. Claude Code's `settings.json` schema (`$schema: https://json.schemastore.org/claude-code-settings.json`) also has no `__bkit__` conflict.
- **Discarded:** (1) Use `_bkit` (single underscore) — `__bkit__` double-underscore convention is more clearly a reserved-by-tool namespace (Python dunder style); less likely to clash with consumer keys. (2) Use `$bkit` — `$` prefix sometimes special in JSON/YAML tools; `__` prefix safer. (3) Use `bkit` bare key — consumers may legitimately have a top-level `bkit` key in config.
- **Source:** phase
- **Related:** BAR-142 §A1, `.agents/templates/.claude/settings.json`, `.agents/templates/.cursor/hooks.json`, DE-8

## DE-8: BAR-142 §A1 — `__bkit__` envelope contract + `detectHooksConfigOverwriteRisk` DELETE disposition (2026-05-07) (superseded by DE-18, 2026-05-11)

- **Category:** agentic
- **Status:** active
- **Decision:** (1) `__bkit__` is a top-level key on `.claude/settings.json` and `.cursor/hooks.json` containing ONLY bkit-owned content as a JSON object. Shape: `{ "__bkit__": { ...bkitOwnedKeys } }`. The envelope is the recoverable record of bkit's shipped shape at install time. (2) Consumer-owned keys live OUTSIDE the `__bkit__` envelope (top-level siblings). (3) `writeTier2Json(template, existing, dryRun, ws)` deep-merges: reads `template.__bkit__` as the new bkit payload, reads `existing` as the consumer document, writes `{ ...consumer, __bkit__: template.__bkit__ }`. THROWS (does not swallow) if `template` lacks `__bkit__`. (4) `detectHooksConfigOverwriteRisk` is DELETED (not repurposed) — it becomes architecturally redundant once `__bkit__` is canonical SoT; the Tier-2 deep-merge guarantees consumer keys survive upgrades without a preflight blocker. (5) `extractBkitNamespace(doc)` returns `doc.__bkit__ ?? null`; `applyBkitNamespace(consumer, bkitPayload)` returns `{ ...consumer, __bkit__: bkitPayload }`. (6) `deepMergeJson(base, override)` is a recursive primitive: arrays in override replace arrays in base (not concat); objects merge recursively; primitives/null override.
- **Why:** Tier-1 full-overwrite is unsafe for consumer-extensible JSON (KN-8). The `__bkit__` envelope gives bkit a stable, inspectable, rollback-safe ownership record without requiring comment markers (JSON has no comments). DELETE of `detectHooksConfigOverwriteRisk` is correct: the blocker was a stopgap — once Tier-2 deep-merge ships, the risk it blocked no longer exists.
- **Discarded:** (1) JSON-merge-patch (RFC 7396) — cannot express bkit-owns-these-keys without a namespace. (2) Repurpose `detectHooksConfigOverwriteRisk` as a migration hint — architecturally confusing; the detector's job is done by Tier-2. (3) Separate migration file per consumer — too much ceremony; versioned-defaults SoT (`BKIT_TIER1_DEFAULTS_BY_VERSION`) enables auto-migration inline.
- **Type signatures:**
  ```ts
  type JsonValue = string | number | boolean | null | JsonValue[] | { [k: string]: JsonValue };
  function deepMergeJson(base: JsonValue, override: JsonValue): JsonValue;
  function extractBkitNamespace(doc: Record<string, JsonValue>): Record<string, JsonValue> | null;
  function applyBkitNamespace(
    consumer: Record<string, JsonValue>,
    bkitPayload: Record<string, JsonValue>,
  ): Record<string, JsonValue>;
  function writeTier2Json(srcPath: string, dstPath: string, dryRun: boolean, ws: WriteSet): void;
  function migrateTier1JsonToTier2(
    filePath: string,
    fileKey: ".claude/settings.json" | ".cursor/hooks.json",
  ): void;
  ```
- **Source:** phase
- **Related:** BAR-142 §A1, `.agents/scripts/bkit-tiers.ts`, `.agents/scripts/bkit-tier1-defaults.ts`, `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-preflight.ts`, KN-8, DE-7

## DE-9: BAR-142 §A4 — Transactional install via `.bkit-staging/` (2026-05-07)

- **Category:** agentic
- **Status:** active
- **Decision:** `bkit install` writes each module's output to `.bkit-staging/<module>/` before committing. After ALL modules complete without error, `commitStaging` atomically renames staged files to consumer destinations. On any mid-install failure, `discardAllStaging` removes all staging dirs — consumer files left byte-identical to pre-install state.
- **Why:** Prior to v0.9.0, a crash mid-install (e.g. `bkit-design-organise` lookup miss, BAR-141 regression) could leave partial writes in consumer dirs. Staging makes mid-failure the common case trivially safe: no staged file ever reaches a consumer destination unless the entire install succeeds.
- **Discarded:** (1) Backup-then-restore — requires the same file I/O as install, doubles disk use, and restoration is error-prone on large installs. (2) Transactional DB — overkill for a CLI file installer.
- **Key APIs:** `getStagingDir(module, cwd)`, `initStagingDir(stagingDir)`, `commitStaging(stagingDir, cwd)`, `discardStaging(stagingDir)`, `discardAllStaging(cwd)` — all exported from `bkit-install.ts`.
- **Source:** phase
- **Related:** BAR-142 §A4, `.agents/scripts/bkit-install.ts`, `.agents/scripts/bkit-install.integration.test.ts`

## DE-10: BAR-142 §A5 — `bkit upgrade` diff engine + `canonicalHashes` (2026-05-07)

- **Category:** agentic
- **Status:** active
- **Decision:** (1) `canonicalHashes` is an additive field in `.agents/.bkit-version` (v0.9.x+): map of consumer-relative path → sha256 of bkit-written content at install time. (2) `bkit upgrade` uses `isConsumerModified(relPath, absPath, canonicalHashes)` to detect consumer drift: if disk hash ≠ canonical hash → conflict, do NOT overwrite. (3) `--non-interactive`: auto-apply non-conflicting; emit conflict list to stderr; exit non-zero on any conflict. (4) `updateCanonicalHashesAfterUpgrade` updates hashes for upgraded files post-run.
- **Why:** Silent overwrite of consumer drift was the root cause of the Gether regression (KN-8). `canonicalHashes` gives the upgrade engine a per-file ownership record that survives across installs. Backward-compat: absent field → `{}` → all files appear "unknown" → conservative no-overwrite (safe).
- **Discarded:** (1) Three-way merge UI — OOS per plan. (2) Timestamp-based drift detection — unreliable across CI environments (git checkout resets mtime). (3) Storing full file content in `.bkit-version` — too large; sha256 is sufficient for drift detection.
- **Source:** phase
- **Related:** BAR-142 §A5, `.agents/scripts/bkit-upgrade.ts`, `.agents/scripts/bkit-version.ts`, `.agents/scripts/bkit-upgrade.test.ts`, `.agents/scripts/bkit-upgrade.integration.test.ts`, KN-8

## DE-11: BAR-131 — `setup-auth@v1` composite action design (2026-05-07)

- **Category:** infra
- **Status:** superseded by BAR-164 (PR #13, commit `28f04ec`, 2026-05-09) — composite action, meta-test workflow, and YAML-parse test all deleted; canonical pattern reverted to inline `env: GH_BKIT_TOKEN` block only. Cross-org private consumers cannot resolve `cbartens/bkit/.github/actions/setup-auth@v1` via the runner-scoped `GITHUB_TOKEN`, and both real consumers were on the env-var pattern, so the composite never earned its keep.
- **Decision:** Ship a GitHub Actions composite action at `.github/actions/setup-auth/action.yml`. Inputs: `token` (required), `registry` (optional, defaults to `https://npm.pkg.github.com`). The action exports `BKIT_READ_TOKEN` into the job env so the consumer's `.npmrc` (`//npm.pkg.github.com/:_authToken=${BKIT_READ_TOKEN:-}`) picks it up automatically. The multi-line bash PAT-shim in seeded `ci.yml` is RETAINED as a fallback (RETAIN-WITH-REASON, kill-date v1.1.0). Requires a `v1` annotated tag post-merge.
- **Why:** The composite action encapsulates the PAT-shim boilerplate so consumers can reference a single `uses:` line. The bash fallback is kept because non-Actions CI consumers (e.g. CircleCI, Buildkite) rely on the env var pattern in the seeded workflow — removing it would break them without a migration path.
- **Discarded:** (1) Bundle action into sub-plan-3 — orthogonal to P3 scope; `setup-auth` depends on `.bkit-version` schema (sub-plan-2) and consumer ship pattern. (2) Remove bash fallback — external contract, not safe until v1.1.0 after consumer migration guidance shipped.
- **Source:** phase
- **Related:** BAR-131 §1, BAR-164, PR #13, commit `28f04ec`, `.agents/templates/.github/workflows/ci.yml`, `bkit-modules.ts` `scanForeignBkitUses` guard

## DE-12: BAR-131 follow-up — `isConsumerModified` defaults missing canonical hash to drift (2026-05-08)

- **Category:** agentic
- **Status:** active
- **Decision:** Flip `isConsumerModified`'s default for unknown files: when `canonicalHashes` has no entry for `relPath`, return `true` (treat as modified) rather than `false`. `bkit upgrade`'s `diffFile` adds an idempotent `disk == template → skip` check before the drift branch so identical files are not flagged as spurious conflicts. Existing pre-v0.9.x consumers (or any managed file installed before BAR-142 introduced `canonicalHashes`) will see all-conflict on first `bkit upgrade` and must resolve each manually — this is the safe failure mode.
- **Why:** DE-10 stated the intent as "absent field → conservative no-overwrite (safe)" but the implementation returned `false` from `isConsumerModified` for unknown files, which `bkit upgrade` interpreted as "no drift → safe to overwrite". The result was the opposite of conservative: any managed file lacking a recorded canonical hash was silently overwritten with the current template. Verified during the v1.0.0 ship cycle when running `bkit upgrade` on the bkit repo itself queued a 700-line wipe across `docs/architecture.md`, `docs/decisions.md`, `docs/knowledge.md`, and others — none of which had recorded hashes because they had not been re-written by `bkit install` since the BAR-142 schema landed.
- **Discarded:** (1) Have `bkit install` retroactively populate `canonicalHashes` for every managed file (not just files in `ws.writes`) — larger surface change; can be added later as an opt-in `bkit install --reseed-hashes` flag. (2) Add a CLI prompt for unknown-hash files — `--non-interactive` flow has no human; conflict-by-default is the only honest answer there.
- **Source:** human
- **Related:** DE-10, BAR-131, `.agents/scripts/bkit-version.ts:168-181`, `.agents/scripts/bkit-upgrade.ts:79-116`, `.agents/scripts/bkit-version.test.ts`, `.agents/scripts/bkit-upgrade.test.ts`, commit 954e827

## DE-13: BAR-131 follow-up — auto-seed `canonicalHashes` for `bkit upgrade` skipped files (2026-05-08)

- **Category:** agentic
- **Status:** active
- **Decision:** Extend `updateCanonicalHashesAfterUpgrade` to record canonical hashes for files classified as `skip` by `diffFile` (where `disk == template`), in addition to the existing `update` path. Conflict files are explicitly NOT seeded — that would re-introduce the silent-overwrite bug DE-12 fixed. The install-side caller in `bkit-install.ts` was widened to invoke the function whenever `updated.length > 0 || skipped.length > 0`. After v1.0.1 ships, consumers running `bkit upgrade` once auto-heal the missing-hash gap; truly-customised files continue to surface as conflicts requiring manual resolution.
- **Why:** DE-12 made `bkit upgrade` safe-by-default but left every file without a recorded canonical hash flagging as a conflict on first run — including files that exactly match the template. For pre-v0.9.x consumers (or any repo where bkit-managed files had not been re-written by `bkit install` since BAR-142), this meant an all-conflict first upgrade. Reseeding only on confirmed `disk == template` matches is provably safe — the canonical hash equals the template hash by definition — and lets the engine distinguish true drift from no-drift on the next run. Verified locally: bkit repo `.bkit-version` `canonicalHashes` grew from 4 → 31 entries after one `bkit upgrade` run; 17 genuinely-customised files remain as conflicts.
- **Discarded:** (1) Auto-seed during `bkit install` (the option mentioned in DE-12) — install does not call `runUpgrade`, so adding it would require duplicating the candidate-enumeration logic. The upgrade-side fix covers the same consumer migration with less surface area. (2) Seed all bkit-managed files with current disk hash — re-introduces the silent-overwrite bug for any customised file (canonical=disk implies "no drift" on next upgrade, which then auto-overwrites with the new template).
- **Source:** human
- **Related:** DE-12, BAR-131, `.agents/scripts/bkit-upgrade.ts:209-249`, `.agents/scripts/bkit-install.ts:803-810`, `.agents/scripts/bkit-upgrade.test.ts`, commits e2889e1 (feature) + 20d63d6 (seeded `.bkit-version`)

## DE-14: BAR-148 — bkit-ci-router via `claude-code-action@v1` (Option 1) (2026-05-08)

- **Category:** agentic
- **Status:** active
- **Decision:** Adopt Anthropic's `claude-code-action@v1` GHA action as the dispatch surface for the `bkit-ci-router` post-CI workflow. Trigger half is a `workflow_run`-on-completed GHA workflow shipped as `.github/workflows/bkit-ci-router.yml`. The action runs Claude Code inside the GHA runner and invokes the leaf orchestrator `/bkit-ci-router {FID}`, which decides ship vs debug from PR `statusCheckRollup` and dispatches `/bkit-ship` or `/bkit-debug`. Consumer adds `ANTHROPIC_API_KEY` GHA secret; bkit installer ships the router workflow as byte-equal-text (seed-or-print).
- **Why:** Self-contained, no webhook bridge, no claude.ai dependency. Consumer needs only one new secret + one workflow file. Anthropic actively maintains the action — survives runtime / model changes. Gether's `ci-complete.yml` already proved the surrounding scaffold (PR lookup, branch filter, Linear comment-back); only the dispatch step changes.
- **Discarded:** (1) Anthropic Managed Agents Sessions API (Option 2) — gether attempted, decommissioned in `7475b499` as never functional. (2) `RemoteTrigger` to operator's claude.ai (Option 3) — couples to operator presence; not autonomous. (3) `schedule` skill cron poll (Option 4) — same operator-presence coupling. (4) Manual gate (Option 5) — defeats the purpose. (5) Step 18 in `bkit-build` — separate workflow chosen, see DE-15.
- **Source:** phase
- **Related:** BAR-148, BAR-120 (gether prior art `03b0c502`), BAR-124/125 (gether decommission `7475b499`), `.bkit/workflows/bkit-ci-router.md`, `.github/workflows/bkit-ci-router.yml`, `.agents/templates/.github/workflows/bkit-ci-router.yml`, `.agents/scripts/bkit-modules.ts` (`runCiRouterModule`)

## DE-15: BAR-148 — Router as separate workflow, not Step 18 of `bkit-build` (2026-05-08)

- **Category:** agentic
- **Status:** active
- **Decision:** `bkit-build` closes at Step 17 unchanged. The post-CI router runs as a fresh orchestrator (`/bkit-ci-router`) in a brand-new Claude Code session dispatched by GHA. State handoff is via canonical disk artifacts (`status.json`, plan files, Linear comment-id) — already the documented contract. Router context is small by design: read `status.json`, head-SHA stale-run guard, label gate, dispatch.
- **Why:** Chaining `bkit-ship` (~12 steps) or `bkit-debug` (loop bounded by `MAX_DEBUG_ATTEMPT`) into the same orchestrator session compounds context-window pressure: cumulative `COMMENT_BODY` per step, repeated `status.json` re-reads, gate verifications quoting earlier SHAs / PR numbers verbatim. Fresh-session split keeps every orchestrator's context bounded; downstream skills already implement Resume from `status.json`.
- **Discarded:** (1) Step 18 in `bkit-build` (chained orchestrator) — re-evaluate only if context budget grows materially and Resume contract is no longer canonical. (2) Embedded sub-agent inside `bkit-build` Failure Path — same context-window concern; Failure Path is for handover, not happy-path routing.
- **Source:** phase
- **Related:** BAR-148, DE-14, `.bkit/workflows/bkit-build.md` (Step 17 unchanged), `.bkit/docs/workflows.md` § "Resume" / § "status.json"

## DE-16: BAR-155 — Parallel `bkit-build-challenge` pair + reconcile (2026-05-09)

- **Category:** agentic
- **Status:** active
- **Decision:** Replace single-reviewer `bkit-build-challenge.md` with a parallel pair (`bkit-build-challenge-1.md` effort:high/Opus + `bkit-build-challenge-2.md` effort:medium/Sonnet) and a new xhigh/Opus reconciler (`bkit-build-challenge-reconcile.md`). `/bkit-build` Step 9 launches the pair in parallel; new Step 10 runs the reconciler; former Steps 10–17 shift to 11–18. Severity ladder: canonical challenge `CRITICAL > HIGH > MEDIUM > LOW`; verdict ladder: `FAIL > CONCERNS > PASS` (max-wins). Dedup heuristic: same `file:line` OR same root-cause cluster → merge finding citing both reviewers; else keep separate. Downgrade only with explicit `## Justification` block citing both reviewers' evidence.
- **Why:** Single-reviewer shape had same-model blind spots — identical to the regression that motivated `bkit-design-review-*` and `bkit-plan-review-*` parallel-pair convention. Cross-tier model diversity (Opus/high vs Sonnet/medium) reduces correlated misses without requiring focused-brief mode or sensitivity gating.
- **Discarded:** (1) Focused-brief mode for `bkit-build-challenge` — diversity over narrowing; dropped per Linear issue Out of Scope. (2) Retrofit of existing `bkit-design-review-*` and `bkit-plan-review-*` with explicit model/thinking diversity — already verified Opus/high vs Sonnet/medium; Out of Scope. (3) Retry/backoff harness redesign — prompt/structure changes only per BAR-155 scope. (4) Diff-size or sensitivity gating for parallel launch — always-on is cheaper than threshold logic that gets ignored when it doesn't trigger.
- **Source:** phase
- **Related:** BAR-155, `.bkit/prompts/bkit-build-challenge-1.md`, `.bkit/prompts/bkit-build-challenge-2.md`, `.bkit/prompts/bkit-build-challenge-reconcile.md`, `.bkit/workflows/bkit-build.md`

## DE-17: BAR-169 — Tiered rebase-conflict auto-recovery (2026-05-10)

- **Category:** agentic
- **Status:** active
- **Decision:** Three-tier conflict handling across all three orchestrator workflows (`bkit-ship`, `bkit-build`, `bkit-debug`):
  (a) **Append-only doc ledgers** (`docs/pending.md`, `docs/knowledge.md`, `docs/decisions.md`, `docs/completed.md`) → `merge=union` declared in `.gitattributes` (template at `.agents/templates/gitattributes`, installed to consumer roots via `bkit install`). Git auto-concatenates both sides at rebase/merge time; conflict never reaches the workflow.
  (b) **Lockfile (`pnpm-lock.yaml`)** → inline retry in Step 2 of all three workflows: `git checkout --theirs` + `pnpm install --lockfile-only` + `git add` + `rebase --continue`.
  (c) **Code / configs / everything else** → sentinel-file Failure Path. Ship's Failure Path additionally invokes `@bkit-ship-conflict-resolve` (mechanical-only, narrow-scope subagent) before `@bkit-debug-abort-handover` to catch non-overlapping additive edits / formatting drift / dep-version supersedes; on `Verdict: PASS` workflow resumes, on `FAIL`/`CONCERNS` falls through to handover. Build/debug do NOT get the resolver subagent — their conflicts usually point to a deeper problem worth a human glance.
- **Why:** Pre-fix shape was `git rebase || exit 1` in all three workflows — every conflict (additive or semantic) routed to the same dead-end abort. PR #17 (BAR-155) hit a single additive `docs/pending.md` conflict that bkit could not auto-recover, requiring manual resolution and CI re-trigger. Tiering by conflict shape lets the cheap mechanical cases self-heal while preserving human review on genuinely ambiguous code conflicts. Trade-off accepted: `merge=union` will silently produce duplicate `KN-N` / `DE-N` IDs if both branches allocate the same number — same renumbering hazard already deferred separately, not a regression introduced here.
- **Discarded:** (1) Single uniform sentinel→handover path for all conflicts — preserves current dead-end. (2) New full workflow Step for conflict resolution — adds status.json/gate/comment overhead for what is mechanical recovery; better as inline sub-step of Step 2. (3) Repurpose `bkit-debug` workflow for rebase conflicts — its diagnose/remediate subagents are scoped to test failures; verdict signal "tests pass" is necessary but not sufficient for a merge (tests can pass while one side's intent is silently dropped). (4) Wire `bkit-ship-conflict-resolve` into build/debug Failure Paths — those workflows operate on the feature branch in isolation; conflicts there are rarer and usually indicate deeper problems. (5) `.agents/friction.md` for `merge=union` — friction.md has post-write edits to `Recovery`/`Status` fields, breaking the strict-append contract that union-safety requires.
- **Source:** human
- **Related:** BAR-169, BAR-155, PR #17, `.agents/templates/gitattributes`, `.gitattributes`, `.bkit/workflows/bkit-ship.md` Step 2, `.bkit/workflows/bkit-build.md` Step 2, `.bkit/workflows/bkit-debug.md` Step 2, `.bkit/prompts/bkit-ship-conflict-resolve.md`, `.agents/scripts/bkit-install.ts` (`NPM_STRIP_REMAP`)

## DE-18: BAR-167 — Drop `__bkit__` envelope; adopt deep-containment ownership model (2026-05-11)

- **Category:** agentic
- **Status:** active
- **Decision:** Remove the `__bkit__` JSON envelope from `.claude/settings.json` and `.cursor/hooks.json`. Reverse DE-7 and DE-8. Replace with a **deep-containment** model: bkit declares a scope (the full template JSON tree) that must be present as a subset of the consumer document. New primitives: `deepContains(template, consumer)` (pure check), `writeTier2JsonContained(srcPath, dstPath, dryRun, ws)` (dest absent → write as-is; present → deepContains → ok no-op; fail → deepMergeJson template-wins), `migrateLegacyBkitEnvelope(doc, template)` (strips `__bkit__`, deep-merges if containment fails; idempotent), `stripTier2JsonScope(consumerDoc, templateDoc)` (uninstall helper — removes template scope, preserves consumer-only siblings). `.cursor/hooks.json` template migrated to Cursor v1 keyed-object schema. `bkit upgrade` runs `migrateLegacyBkitEnvelope` once per consumer JSON file on first v2.0.0 encounter. Preflight adds: advisory `legacy-bkit-envelope-detected` (`__bkit__` present), advisory `tier2-json-drift` (deepContains fails), blocker `pre-envelope-bkit-version-detected` (`pinnedVersion < 0.8.0` AND no `__bkit__`).
- **Why:** The `__bkit__` envelope caused two real-world failure modes on 2026-05-09 consumer audit: (1) duplicate content — the same hook block appeared inside `__bkit__` AND at the top level, causing confusion and bloat; (2) silent drift — `.github/workflows/ci.yml` lost its `pnpm bkit check` step with no detection. The envelope model required consumers to hold two copies of every bkit-owned key. Deep-containment eliminates the duplication: the template IS the declared scope; the consumer only needs to contain it. Consumer-added keys outside the template tree are never touched. `writeTier2Json` THROW (envelope guard) was a footgun — deep-containment removes the need for it entirely.
- **Discarded:** (1) Retain `__bkit__` envelope, fix drift detection separately — does not eliminate the duplicate-content failure mode. (2) Use comment markers in JSON — JSON has no comment syntax; marker approach requires a serialisation round-trip. (3) Separate ownership manifest per consumer file — too much ceremony; the template itself is the manifest. (4) Namespace all bkit keys under a prefix — requires renaming every key in every template; breaks existing consumer files without a migration path.
- **Type signatures (v2.0.0):**
  ```ts
  type DeepContainsResult = { ok: boolean; missing: string[]; mismatched: string[] };
  function deepContains(
    template: JsonValue,
    consumer: JsonValue,
    pathPrefix?: string,
  ): DeepContainsResult;
  function writeTier2JsonContained(
    srcPath: string,
    dstPath: string,
    dryRun: boolean,
    ws: WriteSet,
  ): void;
  function migrateLegacyBkitEnvelope(
    doc: Record<string, JsonValue>,
    template: Record<string, JsonValue>,
  ): {
    stripped: boolean;
    deepMerged: boolean;
    schemaFlipped: boolean;
    outDoc: Record<string, JsonValue>;
  };
  function stripTier2JsonScope(
    consumerDoc: Record<string, JsonValue>,
    templateDoc: Record<string, JsonValue>,
  ): Record<string, JsonValue>;
  function deepContains(
    template: JsonValue,
    consumer: JsonValue,
    pathPrefix?: string,
  ): DeepContainsResult;
  function writeTier2JsonContained(
    srcPath: string,
    dstPath: string,
    dryRun: boolean,
    ws: WriteSet,
  ): void;
  function migrateLegacyBkitEnvelope(
    doc: Record<string, JsonValue>,
    template: Record<string, JsonValue>,
  ): {
    stripped: boolean;
    deepMerged: boolean;
    schemaFlipped: boolean;
    outDoc: Record<string, JsonValue>;
  };
  function stripTier2JsonScope(
    consumerDoc: Record<string, JsonValue>,
    templateDoc: Record<string, JsonValue>,
  ): Record<string, JsonValue>;
  ```
- **Source:** phase
- **Related:** BAR-167, DE-7 (superseded), DE-8 (superseded), KN-8 (superseded by KN-17), `.agents/scripts/bkit-tiers.ts`, `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-uninstall.ts`, `.agents/templates/.claude/settings.json`, `.agents/templates/.cursor/hooks.json`

## DE-19: #160 — `.bkit/` is the install source of truth; `.agents/` is bkit's own runtime (2026-05-25)

- **Category:** infra
- **Status:** active
- **Decision:** Centralise all install-related code and payload under a new `.bkit/` root. Engine `.agents/scripts/bkit-*.ts` → `.bkit/src/`; install payload `.agents/templates/**` (incl. `.claude`/`.cursor`/`.github`/`.husky`/root dotfiles) → `.bkit/templates/**`. bkit's **own** runtime `.agents/` content (workflows, prompts, rules, docs, skills) **stays** in `.agents/` — it is dogfooded content an installed consumer also has, not install machinery. Source lookups funnel through one seam in `bkit-paths.ts`: `getTemplatesRoot()` (only place `.bkit/templates` is encoded), `getPkgRoot()` suffix extended from `.agents/scripts` to `.bkit/src`, new `isDogfood()` (`getPkgRoot() === process.cwd()`). `tsconfig` `rootDir`/`include` → `.bkit/src`; `outDir: dist` and `bin: ./dist/bkit-install.js` **unchanged** (`dist/` stays flat at repo root). `files[]` adds `.bkit`, drops `.agents` as install source. `NPM_STRIP_REMAP` (`gitignore`→`.gitignore`) unchanged, applies under `.bkit/templates/`. The `runPayload` templates arm is deleted (dead after move); the workflow/prompt arm keeps its `src === dst` dogfood no-op unchanged. No `.bkit-version` schema or consumer migration. Ships big-bang in one release, gated by a pre-refactor `.bkit-version` hash baseline + dry-run-parity check verifying byte-identical install AND upgrade on a packed tarball in a clean dir.
- **Why:** `.agents/` was three things at once (engine host, install source, bkit's own runtime), so the cross-agent/IDE files (`.claude`/`.cursor`/`.github`/`.husky`) sat mislocated under `.agents/templates/`. Drawing one line — "source of truth for what bkit ships" (`.bkit/`) vs "bkit's own working files" (`.agents/`) — makes the model honest and keeps "bkit's `.agents/` == a consumer's `.agents/`" for dogfooding. A single resolver seam makes the move auditable and 3am-diagnosable. The hash baseline makes a big-bang move safe without a staged fallback window.
- **Discarded:** (1) Two-release staged migration (alias-first then drop fallback) — its dual-ship safety net is made redundant by the hash oracle and it adds a dual-tree-divergence risk + permanent fallback resolver fork. (2) Full mirror moving workflows/prompts/rules under `.bkit/templates/` too — breaks the workflow/prompt `src === dst` no-op, turns bkit's own workflows into silently-reverting generated files, risks non-byte-identical self-install. (3) Engine-only lift (templates stay) — incomplete-refactor trap; adds a third location, leaves the headline mislocation untouched. (4) Move `dist/`→`.bkit/dist/` + inline literals — gratuitous `bin` change + missed-literal silent-skip risk. (5) Build-time payload staging / symlink bridge — keep the mislocation alive and add a dual-source fork or platform-fragile symlinks.
- **Source:** phase
- **Related:** #160, design `docs/plans/202605/logs/160-centralise-install-code/design-v1-draft.md`, DE-10 (`canonicalHashes`), DE-5 (`tier3Hashes`), `.agents/scripts/bkit-paths.ts`, `.agents/scripts/bkit-install.ts` (`runPayload`), `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-uninstall.ts`, `tsconfig.json`, `package.json` (`files[]`/`bin`), `.agents/rules.md` §"bkit Repo Authoring"

## DE-20: #168 — Final-workflow return: design-only outstanding questions + advisory next-step handoff (2026-05-25)

- **Category:** agentic
- **Status:** active
- **Decision:** Two additions to phase summary returns and final tracker comments. (A) **Outstanding Questions** — `## Outstanding Questions` section in the **design summary only** (`.bkit/prompts/bkit-design-summary.md`), sourced from the design artifact's existing `## Risks & Open Questions` (no new mid-run capture). Per item the summary subagent **generates a recommended answer**; these are advisory and MUST NOT influence the verdict (an explicit, scoped exception to the prompt's "base verdict only on read files" contract). Empty state renders `_None._`. Plan/build/debug/ship do NOT get this section. (B) **Recommended Next Step** — `## Recommended Next Step` section in **all five** summaries with a copy-paste-ready block carrying the next bkit command + issue/FID number + a 1–3 line brief, verdict-aware (e.g. build `FAIL`→`/bkit-debug`, build `PASS/CONCERNS`→`/bkit-ship`, plan complete→`/bkit-build`). Posted in **both** the chat final return **and** a **dedicated** tracker comment (its own `comment-post-step` marker block, separate from the `Step N — Summary` comment). Always **advisory — never auto-triggered**, including under `bkit:auto`.
- **Why:** (A) Open design decisions were buried in the artifact; surfacing them with a recommended default lets the human make the call without opening the doc. Scoped to design because plan is downstream of an already human-reviewed design, and build/debug/ship surface open items via verdict/risks/deferred findings. Subagent-generated recommendations are acceptable because the summary model has the artifact in context; isolating them from the verdict preserves the verdict contract. (B) Every phase ended with an implicit handoff forcing the human to recall the next command, issue number, and brief; a dedicated copy-paste comment makes the handoff durable and frictionless. Advisory-only is sufficient at every hop: design/plan are always human-reviewed, and build→debug/ship is already gated by PR CI pass/fail — so auto-chaining adds no value and would blur the human checkpoint.
- **Discarded:** (1) Outstanding Questions across all phases / including plan — redundant given the review gate and execution-phase verdict/risks. (2) New mid-run `questions.md` capture mechanism — unnecessary; the design artifact already records open questions. (3) Artifact carries the recommendations (written by design-generate) or list-questions-only — rejected in favour of subagent-generated recommendations (right context, no upstream prompt change). (4) Single combined summary+handoff tracker comment — buries the copy-paste block in prose; dedicated comment chosen. (5) Auto-trigger the next phase under `bkit:auto` — CI gating + mandatory human review already cover this; advisory is enough.
- **Source:** human
- **Related:** #168, `.bkit/prompts/bkit-design-summary.md`, `.bkit/prompts/bkit-{plan,build,debug,ship}-summary.md`, `.bkit/prompts/bkit-design-generate.md` (`Risks & Open Questions`), `.bkit/workflows/bkit-{design,plan,build,debug,ship}.md`, `.bkit/docs/trackers.md`

## DE-21: #141 — bkit-cloud rebuilt on the Claude GitHub App (2026-05-26)

- **Category:** infra
- **Status:** active
- **Decision:** Rebuild the GitHub-tracker cloud capability **on** the Claude GitHub App rather than around `github.token`. (1) **Auth = Claude App via OIDC:** `bkit-cloud.yml` grants `id-token: write`; `claude-code-action@v1` authenticates as the App; `ANTHROPIC_API_KEY` stays (LLM). Delete the "`github.token` handles all repo git/gh; no App" framing. (2) **App = base requirement** for `cloud=claude` (advisory + `bkit check` consistency, not a runtime API probe — a specific App's install isn't reliably detectable from a user PAT). (3) **`cloud=claude`/`cloud=cursor` module split** mirroring `tracker=`: explicit `--cloud=claude|cursor` (not auto-derived), **tracker-constrained** (github→claude, linear→cursor; symmetric mismatch hard-error). (4) **Enforcement off `package.json` recorded state** (`bkit.issueTracker` + `bkit.cloudAgents` field, value `"claude"|"cursor"|"none"` per DECISION-C AMENDED 2026-05-27 — no separate `bkit.cloud` field): first tracker-set free, switching an established tracker hard-blocks without `--force`. (5) **Triggers:** design/plan/build + manual ship/debug via `@claude /bkit-<phase>` (typed command = phase) wired in `claude.yml`; auto ship/debug via `bkit-cloud.yml` `workflow_run`, two-tier gated; bare issue assignment is NOT a phase carrier. (6) **Two-tier CI auto-route gate:** free tier = job `if:` on commit marker `bkit [auto route]` (zero runner minutes when absent); cheap tier = in-job `gh issue view --json labels` re-check of `bkit:auto` (live kill switch). Gate logic lives in YAML (`bkit:start/end`), phase routing + status.json + comments stay in the orchestrator. (7) **Marker `bkit [auto route]`** (`bkit` outside brackets, per `bkit [skip ci]`) on close-workflow + debug re-trigger commits, only when the issue carried `bkit:auto` at close time. Folds defects D1 (missing `id-token`), D2 (`worktree-setup`/`create-pr` lack `[skip ci]` → mid-build router fire), D3 (incoherent concurrency key → dispatch/CI race; reconcile to one FID-derived token). Couples with #184 (shared HEAD-subject assertion = SoT for the commit-tag contract; treats `bkit [auto route]` as legitimate, not a skip tag) — must land together. Drops the vestigial Linear render branch (`bkit-cloud.yml` is GitHub-only) and migrates Linear bare `Auto` → `bkit:auto`.
- **Why:** A live dispatch proved the CI-driven path never ran end-to-end (OIDC boot failure). Building on the App reuses identity, PR/issue context, comment posting, and `@claude` follow-ups instead of reinventing them; bkit adds only phase routing, opt-in gate, stale guard, status.json. Two-tier gating gives a free kill switch (zero runner minutes for non-opted-in commits) plus a live runtime kill switch.
- **Discarded:** (1) `github_token` bypass of the App — superseded; breaks `@claude` follow-ups and reinvents App surface. (2) Runtime App-presence detection from a user PAT — unreliable; use recorded-state + advisory + `bkit check`. (3) Auto-derive `--cloud` variant from tracker — explicit value required; tracker constrains but does not select. (4) Linear→`repository_dispatch`→`bkit-cloud` bridge — dropped; Linear cloud routing is Cursor-native.
- **Source:** human
- **Related:** #141 (FINAL SCOPE `issuecomment-4542046671`), #184, #119, #138, #139, `.github/workflows/bkit-cloud.yml` + `.agents/templates/.github/workflows/bkit-cloud.yml`, `.github/workflows/claude.yml`, `.agents/scripts/bkit-modules.ts` (`renderCloudWorkflow`/`runCloudModule`/`MODULE_REGISTRY`), `.agents/scripts/bkit-cli.ts`, `.agents/scripts/bkit-install.ts`, `.agents/scripts/bkit-manifest.ts`, `.bkit/workflows/bkit-{build,debug,ship,cloud}.md`, `.bkit/docs/cloud.md`, `.bkit/docs/trackers.md`, `.agents/templates/.claude/hooks/preflight.sh`, `.agents/templates/.cursor/hooks/preflight.sh`, `docs/deployments.md` § CI trigger on final workflow push, DE-14, DE-15, KN-11

## DE-22: #167 — rules.md equality gate is block-scoped to the managed bkit:start→bkit:end region (2026-05-28)

- **Category:** infra
- **Status:** active
- **Decision:** The CI gate asserting byte-equality between bkit's own `.agents/rules.md` and the canonical template `.bkit/templates/.agents/rules.md` compares the `<!-- bkit:start -->` … `<!-- bkit:end -->` managed block ONLY (inclusive of both markers). It does NOT compare the files whole. The `### bkit Repo Authoring` section that follows the closing `<!-- bkit:end -->` marker in `.agents/rules.md` (line 98+) is bkit-repo-only content — it documents bkit-internal authoring conventions (template sync, preflight advisory rules, etc.) that never ship to consumers and must never trip the equality gate. Implemented as `bkit-rules-sync.test.ts` (Vitest unit test) using `extractManagedBlock()` to isolate the block before comparison.
- **Why:** The `### bkit Repo Authoring` section intentionally diverges from the template (it contains bkit-repo-specific instructions that would be noise in a consumer's `rules.md`). A whole-file comparison would require either (a) duplicating the section into the template (wrong — it would then ship to consumers), or (b) permanently stripping it from `.agents/rules.md` (wrong — agents authoring bkit need it). Block-scoped comparison is the only design that keeps the two files in sync on consumer-facing rules while allowing the bkit-repo section to exist freely.
- **Discarded:** Whole-file comparison — forces either shipping bkit-repo-only content to consumers or deleting the authoring-convention section that bkit's own agents rely on. Neither is acceptable.
- **Source:** phase
- **Related:** #167, #160, D3 (rules.md block-scoped gate in 160-centralise-install-code-plan.md), `.bkit/src/bkit-rules-sync.test.ts`, `.agents/rules.md` §"bkit Repo Authoring", `.bkit/templates/.agents/rules.md`
