<!-- bkit:start -->

<!-- bkit:managed v4.1.1 — do NOT edit; run `bkit upgrade` to refresh -->

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

1. **Producer repo (this repo):** houses the canonical `.bkit/` payload — engine source (`.bkit/src`), mirror sources (`.bkit/workflows`, `.bkit/prompts`), authoring docs (`.bkit/docs`), and consumer templates (`.bkit/templates`).
2. **Consumer repos:** install bkit as a devDependency; run `pnpm bkit install` to regenerate IDE-specific mirrors and bkit-managed blocks. Mirror sources and authoring docs are read package-relative from the installed `.bkit/` — they are NOT copied into the consumer's `.agents/` tree.

No server, no database, no network service. bkit is a build-time / developer-experience tool.

## Package Boundaries

```
cbartens/bkit (this repo)
├── .bkit/src/              # TypeScript source for the bkit CLI
│   ├── bkit-install.ts     # entry point (main); orchestrates phases 1–3 + staging primitives
│   ├── bkit-cli.ts         # CLI verb + module-flag parsing (install | check | doctor | status | uninstall | upgrade | help)
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
│   ├── bkit-trackers.ts    # Tracker-provider substitution engine (github / linear / none)
│   └── bkit-status.ts      # status.jsonl workflow-log contract + fold reducer + invariant validator (the `bkit status` verb lives in bkit-install.ts)
├── dist/                   # Compiled output (committed; published in tarball)
├── .bkit/workflows/      # Workflow markdown files (bkit-design, plan, build, debug, ship)
├── .bkit/prompts/        # Subagent prompt files
├── .bkit/templates/        # Files templated into consumer repos on install
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

- `pnpm bkit install` — runs all three phases. Requires ≥1 module flag (v4.0.0+); bare `bkit install` errors.
- `pnpm bkit check` — Phase 1 + Phase 3 (read-only, v2.2.3+); exits 1 on any Tier-1/Tier-2 drift without writes.
- `pnpm bkit doctor` (v0.6.0+) — Phase 1 + Phase 3 detection; never writes; always exits 0.
- `pnpm bkit status` (v4.0.0+) — read-only; prints each installed host (claude / cursor / opencode) and its configured provider.
- `pnpm bkit uninstall` (v0.7.0+) — surgical format-aware removal: fully-managed delete / markered-text block strip / byte-equal-text hash-guarded delete; `--dry-run`, `--force`, `--nuke`, `--keep-npmrc`, `--keep-tooling`.
- `pnpm bkit upgrade` (v0.9.0+) — diff engine compares old vs new template against `canonicalHashes`; non-conflicting changes auto-apply, conflicts emit to stderr (`--auto-apply` exits non-zero on any conflict). Module-scoped to installed modules (v4.0.0+).

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

Workflow/prompt SOURCES are NOT shipped into the consumer `.agents/`; they live in the installed bkit package under `.bkit/workflows/` + `.bkit/prompts/` and are read package-relative. IDE mirrors regenerated by bkit from those sources:

- `.claude/commands/` + `.claude/agents/` — byte-identical copies of `.bkit/workflows/` and `.bkit/prompts/`
- `.cursor/commands/` + `.cursor/agents/` — T1/T2/T3-transformed copies for Cursor compatibility
- `.opencode/commands/` + `.opencode/agents/` + `.opencode/opencode.json` + `.opencode/plugin/gateguard.js` — additive opencode host; opt-in via `bkit install --opencode=<provider>`; provider-pluggable (seven allowlisted providers: `ollama-local`, `nvidia`, `groq`, `cerebras`, `openrouter`, `ollama`, `zen`)

Every rendered agent/command file — and every bkit-managed `docs/*.md` block (the first line of its `bkit:start` region, via the `{{BKIT_MANAGED_MARKER}}` token) — carries a `<!-- bkit:managed vX.Y.Z … -->` version marker stamped by `bkit install`/`upgrade` (v4.0.0+). `bkit check` hard-fails with `bkit-rendered-prompts-stale` (prompts/workflows) or `bkit-managed-docs-stale` (docs, scoped to the canonical doc set, never consumer plans) when a marker drifts from the installed version.

## Distribution

`@cbartens/bkit` is published to GitHub Packages npm registry on every git tag push via `.github/workflows/release.yml`. Consumers authenticate with a `GH_BKIT_TOKEN` PAT (`read:packages` scope). See `docs/deployments.md` for the four-surface token presence matrix and `docs/decisions.md` DE-3 for the registry choice rationale.
