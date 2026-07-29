<!-- bkit:start -->

<!-- bkit:managed v4.11.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Architecture

> [!CAUTION]
> **Purpose:** System design — service boundaries, deployment topology, integration sketch.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Describe current state / rules, NOT reasons / history; state what to do; NOT why.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Topology/boundaries only; operational rules and library lists → domain docs.
> - Update on package add/remove or boundary shift.

<!-- bkit:end -->

## What bkit Is

bkit = **CLI tool + agent-stack payload** as npm package (`@cbartens/bkit` via GitHub Packages):

1. **Producer repo (this repo):** canonical `.bkit/` payload — engine (`.bkit/src`), mirrors (`.bkit/workflows`, `.bkit/prompts`), authoring docs (`.bkit/docs`), consumer templates (`.bkit/templates`).
2. **Consumer repos:** devDependency; `pnpm bkit install` regenerates IDE mirrors + bkit-managed blocks. Mirror sources + authoring docs read package-relative from installed `.bkit/` — NOT copied into consumer `.agents/`.

No server, database, or network service. Build-time / DX tool only.

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
│   ├── bkit-cloud-env.ts   # Resolves the `.claude/cloud.md` + `.cursor/cloud.md` env/secret blocks by FOLLOWING the consumer's .envrc (honours its `unset` lines, drops session-hijack keys) — one resolver, a per-cloud policy (Cursor+Linear adds LINEAR_API_KEY; Claude adds autocompact); no hardcoded stack-specific key list, keeping the shipped surface stack-independent
│   ├── bkit-config-migrate.ts # Content-preserving relocation of consumer debug-fetch blocks docs/observability.md -> .agents/config.md (#334). MOVE, never transform; wired into BOTH install and upgrade (separate engines)
│   ├── bkit-trackers.ts    # Tracker-provider substitution engine (github / linear / none)
│   ├── bkit-status.ts      # status.jsonl workflow-log contract + fold reducer + invariant validator (the `bkit status` verb lives in bkit-install.ts)
│   ├── bkit-telemetry.ts   # Unified JSONL telemetry codec — TelemetryEvent union, parse/fold/foldFrom/validate/appendLine, ARCHIVE_SHARD_TEMPLATE (#234 WS-1)
│   ├── bkit-comply.ts      # Compliance grader (#234 WS-2) — no-mirror-edit + skip-ci-not-head rules; emits kind:"compliance" rows; `bkit comply --phase <p>` (fail-open)
│   ├── bkit-harvest.ts     # Cross-repo harvest CLI (#234 WS-4, #343) — COPIES consumer .bkit/stats.jsonl (never modified); MOVES .bkit/friction.jsonl into harvest/ at repo root, pruning drained rows from the consumer; COUNT-ONLY for docs/{deferrals,failures}.jsonl; deduplicates by per-kind composite identity; prune gated on byte-for-byte content (NOT identity — fold collapses colliding rows) after copy→fsync→read-back; store accumulates, never cleared; never commits in any repo; `bkit harvest`
│   ├── bkit-analysis.ts    # Analysis CLI (#234 WS-4) — counts/rates/elapsed, #183 size↔outcome regression, dispatch-size threshold, counterSource trust labelling, per-rule compliance rate over kind:"compliance" rows; rollup writer (writeRollupShard); `bkit analysis`
│   ├── bkit-telemetry-migrate.ts # Legacy .md → .jsonl migration CLI (#234 WS-5) — parity-gated destructive migration of docs/knowledge.md, docs/decisions.md, docs/pending.md → deferrals.jsonl, .bkit/friction.md; KN-/DE- ids + legacy Related: graph preserved in references[]; Severity mapped onto CRITICAL|HIGH|MEDIUM|LOW; Description prose → description (title → summary); Discarded: → alternatives; friction Workflow:/Step: preserved as the envelope workflow/step (where it happened, not the migrate transport); `bkit telemetry migrate [--dry-run]`
│   ├── bkit-telemetry-lint.ts # Read-only alias-collision scan (#361) — flags one DE-<n>/KN-<n> claimed by >1 slug key (the retired scan-highest-and-increment race that merge=union appended silently) + minted keys written outside the one-shot migrate; `bkit telemetry validate` (exit 1 on collision); shared by the postinstall advisory + the normaliser
│   └── bkit-telemetry-normalise.ts # One-shot idempotent normaliser (#361) — drops deprecated aliases[] into references[], keeps ts, re-keys ONLY colliding rows (strip the shared number, preserve it as a references[] pointer); parity-gated (.bak + row-count), original untouched on abort; `bkit telemetry normalise [--dry-run]`
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

- `pnpm bkit install` — all three phases. Requires ≥1 module flag (v4.0.0+); bare `bkit install` errors.
- `pnpm bkit check` — Phase 1 + Phase 3 read-only (v2.2.3+); exit 1 on Tier-1/Tier-2 drift, no writes.
- `pnpm bkit doctor` (v0.6.0+) — Phase 1 + Phase 3 detection; never writes; always exit 0.
- `pnpm bkit status` (v4.0.0+) — read-only; installed host (claude/cursor/opencode) + configured provider.
- `pnpm bkit uninstall` (v0.7.0+) — surgical format-aware removal: fully-managed delete / markered-text strip / byte-equal-text hash-guarded delete; `--dry-run`, `--force`, `--nuke`, `--keep-npmrc`, `--keep-tooling`.
- `pnpm bkit upgrade` (v0.9.0+) — diff engine vs `canonicalHashes`; non-conflicts auto-apply, conflicts stderr (`--auto-apply` non-zero on conflict). Module-scoped (v4.0.0+). Re-renders at **installed** version (offline). `--to=<version>` / `--latest` (#296) bump `@cbartens/bkit` (`pnpm add`) → re-exec fresh binary → re-render + re-pin atomically — version bump cannot drift mirrors; bare `pnpm add` does not re-render.
- `pnpm bkit comply --phase <p>` (#234 WS-2) — grader over `git diff parentSha..HEAD`; advisory-only, fail-open.
- `pnpm bkit harvest` (#234 WS-4, #343) — bkit-repo only; COPIES `stats.jsonl`, MOVES `friction.jsonl` (prunes consumer), count-only `docs/{deferrals,failures}.jsonl`. Never commits.
- `pnpm bkit analysis` (#234 WS-4) — harvested store counts/rates; size↔outcome regression, per-rule compliance, rollup shard.
- `pnpm bkit telemetry <migrate|summary|validate|normalise>` (#234 WS-5, #361) — `migrate`: one-time parity-gated `.md` → `.jsonl` (`--dry-run`); `validate`: alias collision scan, exit 1; `normalise`: idempotent fix (`aliases[]` → `references[]`, re-key collisions, parity-gated, `--dry-run`).
- `pnpm bkit cursor` / `pnpm bkit opencode` — launch host with `.bkit/.env` merged (macOS GUI apps skip login-shell/direnv env).

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

Workflow/prompt SOURCES not shipped into consumer `.agents/`; live in installed package `.bkit/workflows/` + `.bkit/prompts/`, read package-relative. IDE mirrors from those sources:

- `.claude/commands/` + `.claude/agents/` — byte-identical copies of `.bkit/workflows/` + `.bkit/prompts/`
- `.cursor/commands/` + `.cursor/agents/` — T1/T2/T3-transformed for Cursor
- `.opencode/commands/` + `.opencode/agents/` + `.opencode/opencode.json` + `.opencode/plugin/gateguard.js` — additive opencode host; opt-in `bkit install --opencode=<provider>`; ten providers: `ollama-local`, `nvidia`, `groq`, `cerebras`, `openrouter`, `ollama`, `zai`, `moonshot`, `opencode-zen`, `opencode-go`. See `docs/technology.md` § Execution Hosts.

Every rendered agent/command file — and every bkit-managed `docs/*.md` block (first line of `bkit:start` via `{{BKIT_MANAGED_MARKER}}`) — carries `<!-- bkit:managed vX.Y.Z … -->` stamped by `bkit install`/`upgrade` (v4.0.0+). Marker drift → `bkit check` emits `bkit-rendered-prompts-stale` (prompts/workflows) or `bkit-managed-docs-stale` (canonical doc set, never consumer plans). **Branch-scoped** (`isOnProtectedBranch`): blocker on `main`/`dev` (or PR into them via `GITHUB_BASE_REF`); advisory on feature branches — stale render usually inherited from base bump without atomic re-render, not created on feature branch. Advisory still in checklist for visibility; no longer blocks intermediate push.

## Compliance Grader Subsystem (#234 WS-2)

Deterministic, advisory-only grader on `git diff parentSha..HEAD` → `kind:"compliance"` rows in `.bkit/stats.jsonl`.

**Components:**

- `.bkit/src/bkit-comply.ts` — pure grader (`ruleNoMirrorEdit`, `ruleSkipCiNotHead`, `runGrader`, `buildComplianceRows`); no side effects, no `process.exit`.
- `.bkit/src/bkit-paths-policy.ts` — protected-path table (mirror prefixes + gate-config basenames); shared by grader + committed `.cjs`.
- `.claude/hooks/gate-paths.generated.cjs` — generated from `bkit-paths-policy.ts`; drift in `bkit-paths-policy.test.ts`. Install = byte-equal Tier-1 copy, NOT install-time codegen.
- `bkit-cli.ts` — `comply` verb + `--phase` dispatch (DE-34).

**Crash isolation (DE-34):** `comply` dispatch try/catch; crash → `[bkit-comply] internal error: …`, exit 0. Workflow wiring: `|| echo "[bkit-comply] grader unavailable, skipping"` silences non-zero.

**Rollout (DE-35):** Ship-only in P2; other phases in future sub-plans.

## Knowledge/Decisions JSONL Ledgers (#234 WS-5)

`docs/knowledge.jsonl` (`kind:"knowledge"`) + `docs/decisions.jsonl` (`kind:"decision"`) = NDJSON successors to markdown ledgers. Consumer-inherited (`.gitattributes` managed block, `merge=union`), populated by `bkit telemetry migrate`.

**Migration (one-time, destructive per A5):** `bkit telemetry migrate [--dry-run]` ports markdown → NDJSON, preserves `KN-N`/`KN-CORE-N`/`DE-N` + legacy `**Related:**` graph in `references[]`, DELETES `.md` only after row-count parity vs transient `.md.bak`. Mismatch or missing `.bak` → ABORT, zero `.md` deleted. Re-run idempotent. Destructive delete unreachable from `bkit upgrade` (boundary test, KN-8/DE-39).

**Data topology:** shared `TelemetryEnvelope` (ts, kind, repo, bkitVersion, workflow, step, key, references[]) + kind payloads (`KnowledgePayload`/`DecisionPayload`) in `bkit-telemetry.ts`. Agents read JSONL post-migration.

`references[]` = single cross-entry pointer for EVERY kind (envelope, not payload) — feature ids, tracker ids, PRs, SHAs, paths, sibling `ts`, legacy `KN-N`/`DE-N`. No separate identity: design `aliases[]` folded in once sequential `DE-{N}` proved un-mintable under concurrency. `ts` = id; `references[]` = pointers. Contract: `.bkit/jsonl.md` § Key & References.

Legacy consumer ledgers (`de-<n>-…` keys + `aliases:["DE-<n>"]`) kept the race live (#361). Close via `bkit telemetry validate` (exit 1 on `DE-<n>`/`KN-<n>` claimed by >1 slug `key`; postinstall advisory) + `bkit telemetry normalise` (drops `aliases[]` → `references[]`, keeps `ts`, re-keys colliding rows only). Cite slug `key`, never bare number.

## Distribution

`@cbartens/bkit` published to GitHub Packages on every git tag via `.github/workflows/release.yml`. Consumers auth with `GH_BKIT_TOKEN_INSTALL` PAT (`read:packages`). See `docs/deployments.md` (four-surface matrix) + `docs/decisions.jsonl` DE-3.
