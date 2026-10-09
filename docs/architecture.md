<!-- bkit:start -->

<!-- bkit:managed v4.12.0 — do NOT edit; run `bkit upgrade` to refresh -->

# Architecture

> [!CAUTION]
> **Purpose:** System design — service boundaries, deployment topology, integration sketch.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; NO filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Describe current state / rules, NOT reasons / history; state what to do, NOT why.
> - Check `.agents/docs.md` index first and confirm topic belongs in THIS doc, not another.
> - Topology / boundaries only; operational rules and library lists → domain docs.
> - Update on package add / remove or boundary shift.

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
│   ├── bkit-tiers.ts       # Format-aware file-write primitives (fully-managed / markered-text / create-if-missing) + deepContains/writeTier2JsonContained
│   ├── bkit-tokens.ts      # Token resolver (default branch, project name, managed-version marker)
│   ├── bkit-version.ts     # .bkit/version JSON schema (pinnedVersion, canonicalHashes, claudeAllowDerived)
│   ├── bkit-manifest.ts    # Per-module install-write manifest (drives uninstall + the upgrade walk)
│   ├── bkit-uninstall.ts   # `bkit uninstall` orchestrator — surgical format-aware removal
│   ├── bkit-upgrade.ts     # `bkit upgrade` diff engine + canonicalHashes drift detection
│   ├── bkit-package-json.ts # repointLegacyScripts (superseded bkit lint:prose / slop:delta values)
│   ├── bkit-paths.ts       # Single resolver seam — getTemplatesRoot / getPkgRoot / isDogfood
│   ├── bkit-paths-policy.ts # Single protected-path table (mirror prefixes + gate-config basenames); source of truth for the grader AND the committed generated .cjs
│   ├── bkit-launch.ts      # `bkit cursor` / `bkit opencode` launcher verbs — merges .bkit/.env over process.env and exec's the app binary directly (`open -a` routes via launchd, which DROPS the env — #279/#280)
│   ├── bkit-cloud-env.ts   # Resolves the `.claude/cloud.md` + `.cursor/cloud.md` env/secret blocks by FOLLOWING the consumer's .envrc (honours its `unset` lines, drops session-hijack keys) — one resolver, a per-cloud policy (Cursor+Linear adds BKIT_LINEAR_API_KEY; Claude adds autocompact); no hardcoded stack-specific key list, keeping the shipped surface stack-independent
│   ├── bkit-context-migrate.ts # Content-preserving relocation of consumer context-fetch blocks docs/observability.md -> .agents/context.md (#334). MOVE, never transform; wired into BOTH install and upgrade (separate engines)
│   ├── bkit-trackers.ts    # Tracker-provider substitution engine (github / linear / none)
│   ├── bkit-status.ts      # status.jsonl workflow-log contract + fold reducer + invariant validator (the `bkit status` verb lives in bkit-install.ts)
│   ├── bkit-telemetry.ts   # Unified JSONL telemetry codec — TelemetryEvent union, parse/fold/foldFrom/validate/appendLine, ARCHIVE_SHARD_TEMPLATE (#234 WS-1)
│   ├── bkit-comply.ts      # Compliance grader (#234 WS-2) — no-mirror-edit + skip-ci-not-head rules; emits kind:"compliance" rows; `bkit comply --phase <p>` (fail-open)
│   ├── bkit-harvest.ts     # Cross-repo harvest CLI (#234 WS-4, #343) — COPIES consumer .bkit/stats.jsonl (never modified); MOVES .bkit/friction.jsonl into harvest/ at repo root, pruning drained rows from the consumer; COUNT-ONLY for docs/{deferrals,failures}.jsonl; store keeps every distinct row, deduped by content (never rewritten from the fold); prune gated on byte-for-byte content (NOT identity — fold collapses colliding rows) after copy→fsync→read-back; store accumulates, never cleared; never commits in any repo; `bkit harvest`
│   ├── bkit-analysis.ts    # Analysis CLI (#234 WS-4) — counts/rates/elapsed, #183 size↔outcome regression, dispatch-size threshold, counterSource trust labelling, per-rule compliance rate over kind:"compliance" rows; rollup writer (writeRollupShard); `bkit analysis`
│   ├── bkit-telemetry-migrate.ts # Legacy .md → .jsonl migration CLI (#234 WS-5, #380) — parity-gated destructive migration of docs/knowledge.md, docs/decisions.md, docs/pending.md → deferrals.jsonl, .bkit/friction.md, docs/completed.md → .bkit/issues.jsonl (fifth pair, plus the in-flight bootstrap seed); KN-/DE- ids + legacy Related: graph preserved in references[]; Severity mapped onto CRITICAL|HIGH|MEDIUM|LOW; Description prose → description (title → summary); Discarded: → alternatives; friction Workflow:/Step: preserved as the envelope workflow/step (where it happened, not the migrate transport); `bkit telemetry migrate [--dry-run]`
│   ├── bkit-telemetry-lint.ts # Read-only alias-collision scan (#361) — flags one DE-<n>/KN-<n> claimed by >1 slug key (the retired scan-highest-and-increment race that merge=union appended silently) + minted keys written outside the one-shot migrate; `bkit telemetry validate` (exit 1 on collision); shared by the postinstall advisory + the normaliser
│   └── bkit-telemetry-normalise.ts # One-shot idempotent normaliser (#361) — drops deprecated aliases[] into references[], keeps ts, re-keys ONLY colliding rows (strip the shared number, preserve it as a references[] pointer); parity-gated (.bak + row-count), original untouched on abort; `bkit telemetry normalise [--dry-run]`
├── dist/                   # Compiled output (committed; published in tarball)
├── .bkit/workflows/      # Workflow markdown files (bkit-design, plan, build, debug, ship, auto)
├── .bkit/prompts/        # Subagent prompt files
├── .bkit/templates/        # Files templated into consumer repos on install
├── harvest/                # Central store for `bkit harvest` — consumer stats/friction rows (#343).
│                           # bkit-repo only; deliberately OUTSIDE .bkit/ (that is bkit's managed
│                           # install surface; harvested consumer data is neither managed nor shipped).
│                           # Holds every distinct row ever harvested; readers fold it by identity.
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
    ├─ Phase 2: Dispatch (writes — direct to destinations, NOT atomic across modules)
    │   ├─ .bkit-staging/<module>/ = per-run scratch for derived files; discardAllStaging in finally
    │   ├─ fully-managed    → full overwrite (bkit fully owns file)
    │   ├─ markered-text   → managed-block merge (bkit owns marker region; consumer owns rest)
    │   ├─ json            → deep-containment merge (writeTier2JsonContained; v2.0.0+); MCP configs → bkit's tracker entry only
    │   ├─ create-if-missing → write once when absent (.agents/context.md, skills.md), never again;
    │   │                      package.json bkit:gate:* / bkit:deps:* names added when missing, never overwritten
    │   ├─ templates       → raw copies into .bkit/templates/ only; never applied to the repo
    │   └─ On any error    → earlier modules' files stay written, .bkit/version not re-pinned — re-run install (idempotent)
    │
    └─ Phase 3: Post-install re-detection + commit
        ├─ Token-surface detectors (BKIT_GH_TOKEN_INSTALL at 4 surfaces)
        ├─ CI YAML env-var check
        ├─ Vale package sync check
        ├─ Render unified advisory checklist
        ├─ Phase 3 blockers (v0.7.0+) → exit 1 with recovery line; --auto-revert calls runUninstall first
        └─ Write .bkit-version JSON (pinnedVersion + canonicalHashes from this run's WriteSet)
```

CLI verbs:

- `pnpm bkit install` — all three phases. Requires ≥1 module flag (v4.0.0+); bare `bkit install` errors.
- `pnpm bkit check` — Phase 1 + Phase 3 read-only (v2.2.3+); exit 1 on Tier-1/Tier-2 drift, no writes.
- `pnpm bkit doctor` (v0.6.0+) — Phase 1 + Phase 3 detection; never writes; always exit 0.
- `pnpm bkit status` (v4.0.0+) — read-only; installed host (claude/cursor/opencode) + configured provider.
- `pnpm bkit uninstall` (v0.7.0+) — surgical format-aware removal: fully-managed delete / markered-text strip / byte-equal-text hash-guarded delete; `--dry-run`, `--force`, `--nuke`, `--keep-npmrc`. package.json scripts and devDeps are never removed (the `bkit` install-state block goes on a full uninstall).
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
├── .claude/settings.json   # json format — deep-containment (template scope ⊆ consumer; v2.0.0+)
├── .cursor/hooks.json      # json format — Cursor v1 keyed-object; deep-containment (v2.0.0+)
├── .agents/                # Cross-IDE agent runtime, populated by `pnpm bkit install`
│   ├── rules.md            # markered-text — bkit block + consumer Project section
│   ├── docs.md             # markered-text — doc index
│   ├── context.md          # create-if-missing — project context (consumer-owned after first install)
│   ├── skills.md           # create-if-missing — installed-skill registry
│   └── skills/             # installed agent skills (cross-IDE)
└── .bkit/                  # bkit install state + config (consumer-side)
    ├── version             # JSON: { pinnedVersion, canonicalHashes, claudeAllowDerived }
    ├── friction.md         # markered-text — friction log (consumer-owned outside block)
    ├── advisories.md       # generated artifact (gitignored) — last install/check findings
    ├── .env.example        # fully-managed — token placeholders
    ├── templates/          # raw template copies (ci.yml, hooks, tool configs …) — copy and own
    └── .env                # consumer secrets (gitignored), auto-loaded via .envrc/direnv
```

Workflow/prompt SOURCES not shipped into consumer `.agents/`; live in installed package `.bkit/workflows/` + `.bkit/prompts/`, read package-relative. IDE mirrors from those sources:

- `.claude/commands/` + `.claude/agents/` — byte-identical copies of `.bkit/workflows/` + `.bkit/prompts/`
- `.cursor/commands/` + `.cursor/agents/` — T1/T2/T3-transformed for Cursor
- `.opencode/commands/` + `.opencode/agents/` + `.opencode/opencode.json` + `.opencode/plugin/gateguard.js` — additive opencode host; opt-in `bkit install --opencode=<provider>`; four providers: `openrouter`, `ollama`, `opencode-zen`, `opencode-go`. See `docs/technology.md` § Execution Hosts.
- `.codex/agents/` + `.codex/hooks.json` + `.codex/hooks/` — additive Codex CLI host; opt-in `bkit install --codex`. No `.codex/config.toml`: `openai` is a reserved built-in provider id, so bkit has nothing to declare. Project-local hooks load only once the `.codex/` layer is TRUSTED.

`.claude/hooks/gateguard.cjs`, `.cursor/hooks/gateguard.cjs`, `.codex/hooks/gateguard.cjs` and `.opencode/plugin/gateguard.js` (the GateGuard pre-edit advisory hooks) plus `.claude/hooks/guardrails.cjs`, `.cursor/hooks/guardrails.cjs` and `.codex/hooks/guardrails.cjs` (shell gates: destructive ops, secret exposure, URL-host checks and shell-as-edit-channel) are markered-text (slash-comment: `// bkit:start` / `// bkit:end`) — bkit owns only the pure advisory engine between the markers; the stdin/stdout driver (Claude) or exported plugin (opencode) around it is consumer-owned from first install onward, so a consumer can add their own advisories without losing them on upgrade. A pre-markers install (no markers, hash matches a prior canonical hash) is replaced wholesale on the next install/upgrade; a genuinely consumer-authored file (no markers, unknown hash) gets the block appended plus printed wiring instructions.

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

## Roadmap Ledger & Board

`.bkit/issues.jsonl` (`kind:"feature"`) = canonical feature-state ledger, appended at every phase close. `docs/roadmap.md` = generated board, a pure projection of it. Consumer-inherited (`.gitattributes` managed block, `merge=union`). `docs/completed.md` is retired — deleted by the migration, no reader remains.

**Components:**

- `bkit roadmap fold` (`.bkit/src/commands/workflow/roadmap.ts`) — deterministic status tier, fail-open. It rewrites the whole generated region of `docs/roadmap.md` in one pass: the `bkit:roadmap-status` block from `.bkit/issues.jsonl`, the `bkit:roadmap-analysis` block carried through verbatim, and two consumer `## Notes` blocks carried through verbatim. Every phase close calls it. No tracker table is rendered — a wired tracker already shows its own issues, and a regenerated copy can only go stale. Everything above the first marker is preserved. `roadmap-notes-post` is last.
- `.bkit/prompts/bkit-utility-update-roadmap.md` (`@bkit-utility-update-roadmap`) — the only writer of the `roadmap-analysis` block. Runs `bkit roadmap fold` itself, then ranks from the board, in-flight `docs/plans/**` artifacts, open deferrals/failures, and — when a tracker is wired — its OPEN issues (read-only, never comments). Always names the next milestone and the next distinct umbrella; includes a child only when it is open, unblocked, and able to start now. Those two stay visible; the list stays priority order, one row per container. Length is `package.json` `bkit.roadmapNext` (positive integer; absent or invalid → 25). Due audits (`docs/templates/bkit-audit-*.md` cadence vs newest `docs/audits/` report) compete by priority (risk covered first, then how overdue) for at most 3 rows. The length hint sits in the generated `roadmap-status` header.
- `bkit-telemetry-migrate.ts` fifth pair — `docs/completed.md` → `.bkit/issues.jsonl` at `status:"SHIPPED"`, plus the bootstrap seed (one row per in-flight FID from `docs/plans/**`). Unreachable from `bkit upgrade`; the `completed-md-unmigrated` preflight advisory names the command (`docs/setup.md` § Roadmap ledger migration).

**Ownership boundary:** `docs/roadmap.md` is consumer-owned — `bkit install` never creates or overwrites it and `bkit check` drift stays clean. bkit rewrites only the mechanical `roadmap-status` tables; the two `## Notes` blocks and `roadmap-analysis` are carried through. `roadmap-notes-post` is last. `roadmap-analysis` is written ONLY by `@bkit-utility-update-roadmap`; the fold carries it through untouched, so a phase close never blanks it. Ship stages both roadmap paths through the frozen `BOOK_PATHS` allow-list.

Sensing is on-disk-first: every phase close full-regenerates the board from the ledger. Every roadmap branch exits 0 and never gates a close — grep keys in `docs/observability.md` § `[bkit-roadmap]`. Row contract: `.bkit/jsonl.md` § Per-Kind Fields. Test inventory: `docs/testing.md`.

## Distribution

`@cbartens/bkit` published to GitHub Packages on every git tag via `.github/workflows/release.yml`. Consumers auth with `BKIT_GH_TOKEN_INSTALL` PAT (`read:packages`). See `docs/deployments.md` (four-surface matrix) + `docs/decisions.jsonl` DE-3.
