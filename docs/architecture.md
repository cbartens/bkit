<!-- bkit:start -->

<!-- bkit:managed v4.5.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Architecture

> [!CAUTION]
> **Purpose:** System design — service boundaries, deployment topology, integration sketch.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Describe current state / rules, NOT reasons / history; state what to do; NOT why.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Topology and boundaries only. Operational rules and library lists belong in domain docs.
> - Update when packages are added/removed or domain boundaries shift.

<!-- bkit:end -->

## What bkit Is

bkit is a **CLI tool and agent-stack payload** distributed as an npm package (`@cbartens/bkit` via GitHub Packages):

1. **Producer repo (this repo):** houses the canonical `.bkit/` payload — engine source (`.bkit/src`), mirror sources (`.bkit/workflows`, `.bkit/prompts`), authoring docs (`.bkit/docs`), and consumer templates (`.bkit/templates`).
2. **Consumer repos:** install bkit as a devDependency; run `pnpm bkit install` to regenerate IDE-specific mirrors and bkit-managed blocks. Mirror sources and authoring docs are read package-relative from the installed `.bkit/` — they are NOT copied into the consumer's `.agents/` tree.

No server, no database, no network service. bkit is a build-time / developer-experience tool.

## Package Boundaries

```
cbartens/bkit (this repo)
├── .bkit/src/              # TypeScript source for the bkit CLI
│   ├── bkit-install.ts     # entry point (main); orchestrates phases 1–3 + staging primitives
│   ├── bkit-cli.ts         # CLI verb + module-flag parsing (install | check | doctor | status | uninstall | upgrade | cursor | opencode | comply | harvest | analysis | telemetry | help)
│   ├── bkit-preflight.ts   # Phase 1 — read-only blocker + advisory detectors
│   ├── bkit-modules.ts     # Phase 2 — module dispatcher (MODULE_REGISTRY)
│   ├── bkit-postinstall.ts # Phase 3 — post-install re-detection + checklist formatter
│   ├── bkit-tiers.ts       # Format-aware file-write primitives (fully-managed / markered-text / byte-equal-text) + deepContains/writeTier2JsonContained
│   ├── bkit-tokens.ts      # Token resolver (node version, pnpm major, git branch, etc.)
│   ├── bkit-version.ts     # .bkit-version JSON schema (pinnedVersion, tier3Hashes, canonicalHashes)
│   ├── bkit-manifest.ts    # Per-module install-write manifest (drives uninstall + key stripping)
│   ├── bkit-uninstall.ts   # `bkit uninstall` orchestrator — surgical format-aware removal
│   ├── bkit-upgrade.ts     # `bkit upgrade` diff engine + canonicalHashes drift detection
│   ├── bkit-bkitignore.ts  # `.bkitignore` parser (picomatch globs + per-key opt-in)
│   ├── bkit-package-json.ts # stripManagedKeys (manifest-driven package.json cleanup)
│   ├── bkit-paths.ts       # Single resolver seam — getTemplatesRoot / getPkgRoot / isDogfood
│   ├── bkit-paths-policy.ts # Single protected-path table (mirror prefixes + gate-config basenames); source of truth for the grader AND the committed generated .cjs
│   ├── bkit-launch.ts      # `bkit cursor` / `bkit opencode` launcher verbs — merges .bkit/.env over process.env and exec's the app binary directly (`open -a` routes via launchd, which DROPS the env — #279/#280)
│   ├── bkit-cloud-env.ts   # Resolves the `.claude/cloud.md` env block by FOLLOWING the consumer's .envrc (honours its `unset` lines, drops session-hijack keys) — no hardcoded stack-specific key list, keeping the shipped surface stack-independent
│   ├── bkit-config-migrate.ts # Content-preserving relocation of consumer debug-fetch blocks docs/observability.md -> .agents/config.md (#334). MOVE, never transform; wired into BOTH install and upgrade (separate engines)
│   ├── bkit-trackers.ts    # Tracker-provider substitution engine (github / linear / none)
│   ├── bkit-status.ts      # status.jsonl workflow-log contract + fold reducer + invariant validator (the `bkit status` verb lives in bkit-install.ts)
│   ├── bkit-telemetry.ts   # Unified JSONL telemetry codec — TelemetryEvent union, parse/fold/foldFrom/validate/appendLine, ARCHIVE_SHARD_TEMPLATE (#234 WS-1)
│   ├── bkit-comply.ts      # Compliance grader (#234 WS-2) — no-mirror-edit + skip-ci-not-head rules; emits kind:"compliance" rows; `bkit comply --phase <p>` (fail-open)
│   ├── bkit-harvest.ts     # Cross-repo harvest CLI (#234 WS-4, #343) — COPIES consumer .bkit/stats.jsonl (never modified); MOVES .bkit/friction.jsonl into harvest/ at repo root, pruning drained rows from the consumer; COUNT-ONLY for docs/{deferrals,failures}.jsonl; deduplicates by per-kind composite identity; prune gated on byte-for-byte content (NOT identity — fold collapses colliding rows) after copy→fsync→read-back; store accumulates, never cleared; never commits in any repo; `bkit harvest`
│   ├── bkit-analysis.ts    # Analysis CLI (#234 WS-4) — counts/rates/elapsed, #183 size↔outcome regression, dispatch-size threshold, counterSource trust labelling, per-rule compliance rate over kind:"compliance" rows; rollup writer (writeRollupShard); `bkit analysis`
│   └── bkit-telemetry-migrate.ts # Legacy .md → .jsonl migration CLI (#234 WS-5) — parity-gated destructive migration of docs/knowledge.md, docs/decisions.md, docs/pending.md → deferrals.jsonl, .bkit/friction.md; KN-/DE- ids + legacy Related: graph preserved in references[]; Severity mapped onto CRITICAL|HIGH|MEDIUM|LOW; Description prose → description (title → summary); Discarded: → alternatives; friction Workflow:/Step: preserved as the envelope workflow/step (where it happened, not the migrate transport); `bkit telemetry migrate [--dry-run]`
├── dist/                   # Compiled output (committed; published in tarball)
├── .bkit/workflows/      # Workflow markdown files (bkit-design, plan, build, debug, ship)
├── .bkit/prompts/        # Subagent prompt files
├── .bkit/templates/        # Files templated into consumer repos on install
├── harvest/                # Central store for `bkit harvest` — consumer stats/friction rows (#343).
│                           # bkit-repo only; deliberately OUTSIDE .bkit/ (that is bkit's managed
│                           # install surface; harvested consumer data is neither managed nor shipped).
│                           # Accumulates across runs and is never cleared — once harvest prunes a
│                           # consumer's friction row, this is the only copy until it is committed.
└── package.json            # bin: bkit → dist/bkit-install.js
```

## Install Lifecycle (Three Phases)

```
pnpm bkit install [--module-flags] [--auto-revert]
    │
    ├─ Phase 1: Preflight (read-only)
    │   ├─ Blocker detectors  → exit 1 before any writes if triggered
    │   └─ Advisory detectors → accumulate in ctx.advisories
    │
    ├─ Phase 2: Dispatch (writes — STAGED, v0.9.0+)
    │   ├─ Each module writes to .bkit-staging/<module>/  (atomic-rename on commit)
    │   ├─ fully-managed    → full overwrite (bkit fully owns file)
    │   ├─ markered-text   → managed-block merge (bkit owns marker region; consumer owns rest)
    │   ├─ json            → deep-containment merge (writeTier2JsonContained; v2.0.0+)
    │   ├─ byte-equal-text → seed-or-print (write only if absent; print diff otherwise)
    │   └─ On any error    → discardAllStaging removes .bkit-staging/ — consumer files untouched
    │
    └─ Phase 3: Post-install re-detection + commit
        ├─ Token-surface detectors (GH_BKIT_TOKEN_INSTALL at 4 surfaces)
        ├─ CI YAML env-var check
        ├─ Vale package sync check
        ├─ devDeps freshness check
        ├─ Render unified advisory checklist
        ├─ Phase 3 blockers (v0.7.0+) → exit 1 with recovery line; --auto-revert calls runUninstall first
        └─ Write .bkit-version JSON (pinnedVersion + canonicalHashes from this run's WriteSet)
```

CLI verbs:

- `pnpm bkit install` — runs all three phases. Requires ≥1 module flag (v4.0.0+); bare `bkit install` errors.
- `pnpm bkit check` — Phase 1 and Phase 3 (read-only, v2.2.3+); exits 1 on any Tier-1/Tier-2 drift without writes.
- `pnpm bkit doctor` (v0.6.0+) — Phase 1 and Phase 3 detection; never writes; always exits 0.
- `pnpm bkit status` (v4.0.0+) — read-only; prints each installed host (claude / cursor / opencode) and its configured provider.
- `pnpm bkit uninstall` (v0.7.0+) — surgical format-aware removal: fully-managed delete / markered-text block strip / byte-equal-text hash-guarded delete; `--dry-run`, `--force`, `--nuke`, `--keep-npmrc`, `--keep-tooling`.
- `pnpm bkit upgrade` (v0.9.0+) — diff engine compares old vs new template against `canonicalHashes`; non-conflicting changes auto-apply, conflicts emit to stderr (`--auto-apply` exits non-zero on any conflict). Module-scoped to installed modules (v4.0.0+). Re-renders at the **currently installed** version (offline). `--to=<version>` / `--latest` (#296) additionally bump `@cbartens/bkit` (`pnpm add`) then re-exec the freshly-installed binary to re-render and re-pin in one atomic step — so a version bump can never drift from its rendered mirrors; a bare `pnpm add` does not re-render.
- `pnpm bkit comply --phase <p>` (#234 WS-2) — compliance grader over `git diff parentSha..HEAD`; advisory-only, fail-open (never gates).
- `pnpm bkit harvest` (#234 WS-4, #343) — bkit-repo only; pulls consumer telemetry into `harvest/`. COPIES `stats.jsonl`, MOVES `friction.jsonl` (prunes drained rows from the consumer), count-only for `docs/{deferrals,failures}.jsonl`. Never commits in any repo.
- `pnpm bkit analysis` (#234 WS-4) — counts/rates/elapsed over the harvested store; size↔outcome regression, per-rule compliance rate, rollup shard writer.
- `pnpm bkit telemetry <migrate|summary>` (#234 WS-5) — `migrate` is the one-time parity-gated legacy `.md` → `.jsonl` port (`--dry-run`).
- `pnpm bkit cursor` / `pnpm bkit opencode` — launch the host app with `.bkit/.env` merged into its environment (macOS GUI apps do not inherit the login-shell / direnv env).

## Consumer Integration Model

```
Consumer repo
├── package.json            # devDependencies: { "@cbartens/bkit": "^4.0.0" }
├── .npmrc                  # @cbartens:registry=npm.pkg.github.com (registry only; token in pnpm user-level config)
├── .bkitignore             # (optional, v0.7.0+) consumer escape hatch — picomatch globs
├── .claude/settings.json   # json format — deep-containment (template scope ⊆ consumer; v2.0.0+)
├── .cursor/hooks.json      # json format — Cursor v1 keyed-object; deep-containment (v2.0.0+)
├── .agents/                # Cross-IDE agent runtime, populated by `pnpm bkit install`
│   ├── rules.md            # markered-text — bkit block + consumer Project section
│   ├── docs.md             # markered-text — doc index
│   ├── skills.md           # markered-text — installed-skill registry
│   └── skills/             # installed agent skills (cross-IDE)
└── .bkit/                  # bkit install state + config (consumer-side)
    ├── version             # JSON: { pinnedVersion, tier3Hashes, canonicalHashes }
    ├── friction.md         # markered-text — friction log (consumer-owned outside block)
    ├── advisories.md       # generated artifact (gitignored) — last install/check findings
    ├── .env.example        # byte-equal-text seed — token placeholders
    └── .env                # consumer secrets (gitignored), auto-loaded via .envrc/direnv
```

Workflow/prompt SOURCES are NOT shipped into the consumer `.agents/`; they live in the installed bkit package under `.bkit/workflows/` and `.bkit/prompts/` and are read package-relative. IDE mirrors regenerated by bkit from those sources:

- `.claude/commands/` and `.claude/agents/` — byte-identical copies of `.bkit/workflows/` and `.bkit/prompts/`
- `.cursor/commands/` and `.cursor/agents/` — T1/T2/T3-transformed copies for Cursor compatibility
- `.opencode/commands/` and `.opencode/agents/` and `.opencode/opencode.json` and `.opencode/plugin/gateguard.js` — additive opencode host; opt-in via `bkit install --opencode=<provider>`; provider-pluggable (seven allowlisted providers: `ollama-local`, `nvidia`, `groq`, `cerebras`, `openrouter`, `ollama`, `opencode`). See `docs/technology.md` § Execution Hosts.

Every rendered agent/command file — and every bkit-managed `docs/*.md` block (the first line of its `bkit:start` region, via the `{{BKIT_MANAGED_MARKER}}` token) — carries a `<!-- bkit:managed vX.Y.Z … -->` version marker stamped by `bkit install` / `upgrade` (v4.0.0+). When a marker drifts from the installed version, `bkit check` emits `bkit-rendered-prompts-stale` (prompts/workflows) or `bkit-managed-docs-stale` (docs, scoped to the canonical doc set, never consumer plans). These two gates are **branch-scoped** (`isOnProtectedBranch`): a hard-failing `blocker` on `main` / `dev` (or a PR into them, via `GITHUB_BASE_REF`), and a non-blocking `advisory` on feature branches — because a stale render is almost always _inherited_ from a base where bkit was bumped without an atomic re-render, not created by the feature branch. The advisory is still surfaced in the checklist so the drift is visible; it just no longer blocks an intermediate push.

## Compliance Grader Subsystem (#234 WS-2)

The compliance grader is a deterministic, advisory-only (never-gating) subsystem that checks `git diff parentSha..HEAD` for rule violations and emits `kind:"compliance"` rows to `.bkit/stats.jsonl`.

**Components:**

- `.bkit/src/bkit-comply.ts` — pure grader functions (`ruleNoMirrorEdit`, `ruleSkipCiNotHead`, `runGrader`, `buildComplianceRows`); no side effects, no process.exit. CLI dispatch calls these.
- `.bkit/src/bkit-paths-policy.ts` — single protected-path table (mirror-path prefixes and gate-config basename patterns). Shared by the grader and the committed generated `.cjs`. Source of truth for both.
- `.claude/hooks/gate-paths.generated.cjs` — committed generated file from `bkit-paths-policy.ts`; drift-detected by `bkit-paths-policy.test.ts`. Install stays a byte-equal Tier-1 copy — NOT install-time codegen.
- `bkit-cli.ts` — `comply` verb and `--phase` flag dispatch (shared entrypoint per DE-34).

**Crash isolation (DE-34):** The `comply` dispatch branch is wrapped in try/catch; grader crashes log `[bkit-comply] internal error: …` and exit 0. Workflow wiring additionally pins `|| echo "[bkit-comply] grader unavailable, skipping"` so even a non-zero exit is silent.

**Rollout (DE-35):** Ship-only in P2; design / plan / build / debug phases wired in future sub-plans.

## Knowledge/Decisions JSONL Ledgers (#234 WS-5)

`docs/knowledge.jsonl` (`kind:"knowledge"`) and `docs/decisions.jsonl` (`kind:"decision"`) are the NDJSON successors to `docs/knowledge.md` / `docs/decisions.md`. They are consumer-inherited ledgers (installed inside the `.gitattributes` managed block with `merge=union`) populated by `bkit telemetry migrate`.

**Migration (one-time, destructive per A5):** `bkit telemetry migrate [--dry-run]` ports the markdown corpus to NDJSON rows, preserves all `KN-N` / `KN-CORE-N` / `DE-N` ids plus the legacy `**Related:**` graph in `references[]`, then DELETES the `.md` only after row-count parity is confirmed against a transient `.md.bak`. A parity mismatch or absent `.md.bak` ABORTS with ZERO `.md` deleted. Re-run is idempotent (no-op if already migrated). The destructive delete is provably unreachable from `bkit upgrade` — pinned by a boundary test (KN-8 regression vector, DE-39).

**Data topology:** both ledgers carry the shared `TelemetryEnvelope` fields (ts, kind, repo, bkitVersion, workflow, step, key, references[]) plus kind-specific payloads (`KnowledgePayload` / `DecisionPayload`) defined in `bkit-telemetry.ts`. Agents read these files instead of the markdown ledgers post-migration.

`references[]` is the single cross-entry pointer for EVERY kind — it lives on the envelope, not a payload. It holds any pointer at all (feature ids, tracker ids, PRs, commit SHAs, file paths, a sibling row's `ts`, and a migrated row's own legacy `KN-N`/`DE-N`). There is no separate identity field: the design's `aliases[]` folded into it once sequential `DE-{N}` ids proved un-mintable under concurrency — two runs read the same max from their own base commit and mint the same id, so an alias could never be a reliable identity. `ts` is the id; everything in `references[]` is a pointer. Full contract: `.bkit/jsonl.md` § Key & References.

## Distribution

`@cbartens/bkit` is published to GitHub Packages npm registry on every git tag push via `.github/workflows/release.yml`. Consumers authenticate with a `GH_BKIT_TOKEN_INSTALL` PAT (`read:packages` scope). See `docs/deployments.md` for the four-surface token presence matrix and `docs/decisions.jsonl` DE-3 for the registry choice rationale.
