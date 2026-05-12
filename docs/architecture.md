<!-- bkit:start -->

# Architecture

> [!CAUTION]
> **Purpose:** System design — service boundaries, deployment topology, integration sketch.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Topology and boundaries only. Operational rules and library lists belong in domain docs.
> - Update when packages are added/removed or domain boundaries shift.

<!-- bkit:end -->

## What bkit Is

bkit is a **CLI tool and agent-stack payload** distributed as an npm package (`@cbartens/bkit` via GitHub Packages):

1. **Producer repo (this repo):** houses canonical `.agents/` payload — workflows, prompts, templates, scripts.
2. **Consumer repos:** install bkit as a devDependency; run `pnpm bkit install` to sync the payload into their own `.agents/` tree and regenerate IDE-specific mirrors.

No server, no database, no network service. bkit is a build-time / developer-experience tool.

## Package Boundaries

```
cbartens/bkit (this repo)
├── .agents/scripts/        # TypeScript source for the bkit CLI
│   ├── bkit-install.ts     # entry point (main); orchestrates phases 1–3 + staging primitives
│   ├── bkit-cli.ts         # CLI verb + module-flag parsing (install | check | doctor | uninstall | upgrade | help)
│   ├── bkit-preflight.ts   # Phase 1 — read-only blocker + advisory detectors
│   ├── bkit-modules.ts     # Phase 2 — module dispatcher (MODULE_REGISTRY)
│   ├── bkit-postinstall.ts # Phase 3 — post-install re-detection + checklist formatter
│   ├── bkit-tiers.ts       # Format-aware file-write primitives (fully-managed / markered-text / byte-equal-text) + deepContains/writeTier2JsonContained (v2.0.0+)
│   │                       # bkit-tier1-defaults.ts DELETED (v2.0.0) — sole consumer migrateTier1JsonToTier2 removed (superseded by format-aware containment)
│   ├── bkit-tokens.ts      # Token resolver (node version, pnpm major, git branch, etc.)
│   ├── bkit-version.ts     # .bkit-version JSON schema (pinnedVersion, tier3Hashes, canonicalHashes)
│   ├── bkit-manifest.ts    # Per-module install-write manifest (drives uninstall + key stripping)
│   ├── bkit-uninstall.ts   # `bkit uninstall` orchestrator — surgical format-aware removal
│   ├── bkit-upgrade.ts     # `bkit upgrade` diff engine + canonicalHashes drift detection
│   ├── bkit-bkitignore.ts  # `.bkitignore` parser (picomatch globs + per-key opt-in)
│   ├── bkit-package-json.ts # stripManagedKeys (manifest-driven package.json cleanup)
│   └── bkit-status.ts      # status.json schema + invariant validator
├── dist/                   # Compiled output (committed; published in tarball)
├── .agents/workflows/      # Workflow markdown files (bkit-design, plan, build, debug, ship)
├── .agents/prompts/        # Subagent prompt files
├── .agents/templates/      # Files templated into consumer repos on install
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
        ├─ Token-surface detectors (GH_BKIT_TOKEN at 4 surfaces)
        ├─ CI YAML env-var check
        ├─ Vale package sync check
        ├─ devDeps freshness check
        ├─ Render unified advisory checklist
        ├─ Phase 3 blockers (v0.7.0+) → exit 1 with recovery line; --auto-revert calls runUninstall first
        └─ Write .bkit-version JSON (pinnedVersion + canonicalHashes from this run's WriteSet)
```

CLI verbs:

- `pnpm bkit install` — runs all three phases.
- `pnpm bkit check` — Phase 1 only (read-only); exits 1 on any drift without writes.
- `pnpm bkit doctor` (v0.6.0+) — Phase 1 + Phase 3 detection; never writes; always exits 0.
- `pnpm bkit uninstall` (v0.7.0+) — surgical format-aware removal: fully-managed delete / markered-text block strip / byte-equal-text hash-guarded delete; `--dry-run`, `--nuke`, `--keep-npmrc`, `--keep-tooling`.
- `pnpm bkit upgrade` (v0.9.0+) — diff engine compares old vs new template against `canonicalHashes`; non-conflicting changes auto-apply, conflicts emit to stderr (`--non-interactive` exits non-zero on any conflict).

## Consumer Integration Model

```
Consumer repo
├── package.json            # devDependencies: { "@cbartens/bkit": "^1.0.0" }
├── .npmrc                  # @cbartens:registry=npm.pkg.github.com + GH_BKIT_TOKEN ref
├── .bkitignore             # (optional, v0.7.0+) consumer escape hatch — picomatch globs
├── .claude/settings.json   # json format — deep-containment (template scope ⊆ consumer; v2.0.0+)
├── .cursor/hooks.json      # json format — Cursor v1 keyed-object; deep-containment (v2.0.0+)
└── .agents/                # Populated by `pnpm bkit install`
    ├── .bkit-version       # JSON: { pinnedVersion, tier3Hashes, canonicalHashes }
    ├── rules.md            # markered-text — bkit block + consumer Project section
    ├── workflows/          # fully-managed — bkit owns completely (bkit-*.md files)
    ├── prompts/            # fully-managed — bkit owns completely (bkit-*.md files)
    └── templates/          # byte-equal-text seed — bkit writes once; consumer customises after
```

IDE mirrors regenerated by bkit from `.agents/`:

- `.claude/commands/` — byte-identical copies of `workflows/` and `prompts/`
- `.cursor/commands/` — T1/T2/T3-transformed copies for Cursor compatibility

## Distribution

`@cbartens/bkit` is published to GitHub Packages npm registry on every git tag push via `.github/workflows/release.yml`. Consumers authenticate with a `GH_BKIT_TOKEN` PAT (`read:packages` scope). See `docs/deployments.md` for the four-surface token presence matrix and `docs/decisions.md` DE-3 for the registry choice rationale.
