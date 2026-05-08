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
- **Related:** BAR-138, BAR-130, `docs/plans/drafts/bar-138-gh-packages-distribution-design.md`, `package.json`, `.github/workflows/release.yml`, KN-1

## DE-5: BAR-139 — .bkit-version schema extension: tier3Hashes (2026-05-07)

- **Category:** agentic
- **Status:** active
- **Decision:** Extend `.agents/.bkit-version` from a plain-text semver pin to a JSON object `{ pinnedVersion: string; tier3Hashes: Record<path, sha256> }`. The sha256 map records the content hash of each Tier-3 file at install time. During `bkit uninstall`, `shouldDeleteTier3` checks whether the current on-disk content matches the recorded hash — if so, the file is safe to delete; if not (consumer modified), it is preserved. Backward-compat reader parses old plain-text payloads as `{ pinnedVersion, tier3Hashes: {} }` (unknown → preserve-default).
- **Why:** Tier-3 files (seed-or-print) are deleted during uninstall only if they are still in the exact state bkit wrote them. Without a recorded hash, `bkit uninstall` cannot distinguish between a default-seeded `ci.yml` (safe to delete) and a consumer-customised one (must preserve). Plain-text format is insufficient; JSON is human-readable and extensible.
- **Discarded:** (1) Keep plain-text; detect "default content" by re-rendering the template at uninstall time — fails for Tier-3 files with token substitution that bkit can no longer re-compute (consumer tokens may have changed). (2) Store hashes in a separate `.bkit-hashes.json` — two files to keep in sync; `.bkit-version` is the natural home.
- **Source:** phase
- **Related:** BAR-139, `.agents/scripts/bkit-version.ts`, `.agents/scripts/bkit-uninstall.ts`

## DE-6: BAR-142 §A2 — .bkitignore public contract (2026-05-07)

- **Category:** agentic
- **Status:** active
- **Decision:** `.bkitignore` is a new public file at the consumer repo root. Syntax: `#` comment, blank-line ignore, [picomatch](https://github.com/micromatch/picomatch) glob, optional `:dotted.key` suffix for per-key exclusion. Per-key is opt-in behind `BKIT_BKITIGNORE_PER_KEY=1` env var (off by default). Once shipped, the file and its syntax are a public contract.
- **Why:** Consumers legitimately override bkit-managed files (e.g. custom ci.yml jobs, additional `.claude/settings.json` hook events). `bkit check` currently reports false-positive drift for these. `.bkitignore` gives consumers a declarative escape hatch without touching the managed file itself. Per-key is opt-in because implementation cost is high and per-file covers the majority use-cases (gether-life scenario).
- **Discarded:** (1) Make per-key the default — implementation cost likely high; opt-in via env covers the primary use case. (2) Use a custom DSL instead of gitignore-style — picomatch is well-understood, has no shell-out, and is a pure-regex library (security: no injection risk). (3) Store in `.agents/.bkitignore` — consumer-owned files belong at repo root, not in the `.agents/` subtree (which is bkit-managed).
- **Source:** phase
- **Related:** BAR-142 §A2, `.agents/scripts/bkit-bkitignore.ts`, `docs/pending.md` (per-key deferred)

## DE-4: BAR-141 — Structured PreflightFinding replaces printSink (2026-05-06)

- **Category:** agentic
- **Status:** active
- **Decision:** Replace `ModuleContext.printSink: string[]` with `ModuleContext.advisories: PreflightFinding[]` (shape: `{id, severity, detect, action}`). Install is restructured into three phases: Phase 1 preflight (read-only, blockers short-circuit before any writes), Phase 2 dispatch (unchanged), Phase 3 post-install re-detection (token surfaces, ci.yml, vale sync, devDeps). Findings deduplicated by `id` — Phase 3 wins on conflict.
- **Why:** `printSink: string[]` was unparseable by downstream tooling, emitted advisory strings during module execution (before post-install state was accurate), and had no structured `id` for deduplication. The structured shape enables: (1) stable `id` registry for downstream automation; (2) blocker short-circuit before any writes; (3) accurate post-install re-detection; (4) unified banner formatter reusable by BAR-139 (`bkit uninstall`).
- **Discarded:** (1) Keep `printSink` + add parallel `findings: PreflightFinding[]` — two sinks → drift risk; downstream tooling has to merge two shapes. (2) `--strict` flag promoting advisories to blockers — out of scope; consumer can use `bkit check` (exit-1-on-drift). (3) Auto-apply advisory fixes — violates consumer-value-wins principle.
- **Source:** phase
- **Related:** BAR-141, `docs/plans/active/bar-141-preflight-checklist-plan.md`, `.agents/scripts/bkit-preflight.ts`, `.agents/scripts/bkit-postinstall.ts`, `.agents/scripts/bkit-install.ts`, `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-tiers.ts`, DE-3, KN-4

## DE-7: BAR-142 §A1 — Cursor v1 hooks.json schema spike outcome (2026-05-07)

- **Category:** agentic
- **Status:** active
- **Decision:** `__bkit__` envelope is safe to use as a top-level key in `.cursor/hooks.json`. Cursor's documented v1 schema uses `{"version": 1, "hooks": {eventName: [...commands]}}`. Cursor does NOT reserve a `__bkit__` key or any `__`-prefixed namespace. bkit's current shipped form (`{"hooks": [{event, command}]}`) is the legacy flat-array format; v1 schema uses an object-keyed form. No conflict exists with `__bkit__`. Spike blesses the `__bkit__` envelope shape for both `.cursor/hooks.json` and `.claude/settings.json`.
- **Why:** BAR-142 §A1 requires explicit verification that `__bkit__` doesn't clash with any Cursor-reserved key before implementing the Tier-2 deep-merge. Cursor docs (cursor.com/docs/context/rules) and `.cursor/hooks.json` schema at SchemaStore show no reserved `__*` keys. Claude Code's `settings.json` schema (`$schema: https://json.schemastore.org/claude-code-settings.json`) also has no `__bkit__` conflict.
- **Discarded:** (1) Use `_bkit` (single underscore) — `__bkit__` double-underscore convention is more clearly a reserved-by-tool namespace (Python dunder style); less likely to clash with consumer keys. (2) Use `$bkit` — `$` prefix sometimes special in JSON/YAML tools; `__` prefix safer. (3) Use `bkit` bare key — consumers may legitimately have a top-level `bkit` key in config.
- **Source:** phase
- **Related:** BAR-142 §A1, `.agents/templates/.claude/settings.json`, `.agents/templates/.cursor/hooks.json`, DE-8

## DE-8: BAR-142 §A1 — `__bkit__` envelope contract + `detectHooksConfigOverwriteRisk` DELETE disposition (2026-05-07)

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
  function applyBkitNamespace(consumer: Record<string, JsonValue>, bkitPayload: Record<string, JsonValue>): Record<string, JsonValue>;
  function writeTier2Json(srcPath: string, dstPath: string, dryRun: boolean, ws: WriteSet): void;
  function migrateTier1JsonToTier2(filePath: string, fileKey: ".claude/settings.json" | ".cursor/hooks.json"): void;
  ```
- **Source:** phase
- **Related:** BAR-142 §A1, `.agents/scripts/bkit-tiers.ts`, `.agents/scripts/bkit-tier1-defaults.ts`, `.agents/scripts/bkit-modules.ts`, `.agents/scripts/bkit-preflight.ts`, KN-8, DE-7

## DE-9: BAR-142 §A4 — Transactional install via `.bkit-staging/` (2026-05-07)

- **Category:** agentic
- **Status:** active
- **Decision:** `bkit install` writes each module's output to `.bkit-staging/<module>/` before committing. After ALL modules complete without error, `commitStaging` atomically renames staged files to consumer destinations. On any mid-install failure, `discardAllStaging` removes all staging dirs — consumer files left byte-identical to pre-install state.
- **Why:** Prior to v0.9.0, a crash mid-install (e.g. `bkit-design-organise` lookup miss, BAR-141 regression) could leave partial writes in consumer dirs. The staging design makes mid-failure the common case trivially safe: no staged file ever reaches a consumer destination unless the entire install succeeds.
- **Discarded:** (1) Backup-then-restore: copies all destination files before writing, restores on failure. Rejected — requires the same file I/O as install, doubles disk use, and restoration is error-prone on large installs. (2) Transactional DB: overkill for a CLI file installer.
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
- **Status:** active
- **Decision:** Ship a GitHub Actions composite action at `.github/actions/setup-auth/action.yml`. Inputs: `token` (required), `registry` (optional, defaults to `https://npm.pkg.github.com`). The action exports `BKIT_READ_TOKEN` into the job env so the consumer's `.npmrc` (`//npm.pkg.github.com/:_authToken=${BKIT_READ_TOKEN:-}`) picks it up automatically. The multi-line bash PAT-shim in seeded `ci.yml` is RETAINED as a fallback (RETAIN-WITH-REASON, kill-date v1.1.0). Requires a `v1` annotated tag post-merge.
- **Why:** The composite action encapsulates the PAT-shim boilerplate so consumers can reference a single `uses:` line. The bash fallback is kept because non-Actions CI consumers (e.g. CircleCI, Buildkite) rely on the env var pattern in the seeded workflow — removing it would break them without a migration path.
- **Discarded:** (1) Bundle action into sub-plan-3 — orthogonal to P3 scope; `setup-auth` depends on `.bkit-version` schema (sub-plan-2) and consumer ship pattern. (2) Remove bash fallback — external contract, not safe until v1.1.0 after consumer migration guidance shipped.
- **Source:** phase
- **Related:** BAR-131 §1, `.github/actions/setup-auth/action.yml`, `.agents/templates/.github/workflows/ci.yml`, `.agents/scripts/bkit-action-yaml.test.ts`

## DE-12: BAR-131 follow-up — `isConsumerModified` defaults missing canonical hash to drift (2026-05-08)

- **Category:** agentic
- **Status:** active
- **Decision:** Flip `isConsumerModified`'s default for unknown files: when `canonicalHashes` has no entry for `relPath`, return `true` (treat as modified) rather than `false`. `bkit upgrade`'s `diffFile` adds an idempotent `disk == template → skip` check before the drift branch so identical files are not flagged as spurious conflicts. Existing pre-v0.9.x consumers (or any managed file installed before BAR-142 introduced `canonicalHashes`) will see all-conflict on first `bkit upgrade` and must resolve each manually — this is the safe failure mode.
- **Why:** DE-10 stated the intent as "absent field → conservative no-overwrite (safe)" but the implementation returned `false` from `isConsumerModified` for unknown files, which `bkit upgrade` interpreted as "no drift → safe to overwrite". The result was the opposite of conservative: any managed file lacking a recorded canonical hash was silently overwritten with the current template. Verified during the v1.0.0 ship cycle when running `bkit upgrade` on the bkit repo itself queued a 700-line wipe across `docs/architecture.md`, `docs/decisions.md`, `docs/knowledge.md`, and others — none of which had recorded hashes because they had not been re-written by `bkit install` since the BAR-142 schema landed.
- **Discarded:** (1) Have `bkit install` retroactively populate `canonicalHashes` for every managed file (not just files in `ws.writes`) — larger surface change; can be added later as an opt-in `bkit install --reseed-hashes` flag. (2) Add a CLI prompt for unknown-hash files — `--non-interactive` flow has no human; conflict-by-default is the only honest answer there.
- **Source:** human
- **Related:** DE-10, BAR-131, `.agents/scripts/bkit-version.ts:168-181`, `.agents/scripts/bkit-upgrade.ts:79-116`, `.agents/scripts/bkit-version.test.ts`, `.agents/scripts/bkit-upgrade.test.ts`, commit 954e827
