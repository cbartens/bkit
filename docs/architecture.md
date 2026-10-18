<!-- bkit:start -->

<!-- bkit:managed v5.2.4 — do not edit; run `bkit upgrade` to refresh -->

# Architecture

> [!CAUTION]
> **Purpose:** System design — service boundaries, deployment topology, integration sketch.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Notation: one job per mark — `.bkit/prompts.md` § `Notation`.
> - Describe current state / rules, not reasons / history; state what to do, not why.
> - Check `.agents/docs.md` index first and confirm topic belongs in this doc, not another.
> - Topology / boundaries only; operational rules and library lists → domain docs.
> - Update on package add / remove or boundary shift.

<!-- bkit:end -->

## What bkit Is

bkit = **CLI tool + agent-stack payload** as npm package (`@cbartens/bkit` on npmjs):

1. **Producer repo (this repo):** canonical `.bkit/` payload — engine (`.bkit/core/engine`), mirrors (`.bkit/workflows`, `.bkit/prompts`), authoring docs (`.bkit/docs`), consumer templates (`.bkit/templates`).
2. **Consumer repos:** devDependency; `pnpm bkit install` regenerates IDE mirrors + bkit-managed blocks. Mirror sources + authoring docs read package-relative from installed `.bkit/` — NOT copied into consumer `.agents/`.

No server, database, or network service. Build-time / DX tool only.

**Stack-agnostic:** engine, workflows and prompts assume no app stack; stack-specific behaviour enters only through consumer-declared `package.json` scripts bkit calls by name (`.bkit/workflows.md` § Local gate scripts).

## Package Boundaries

```
cbartens/bkit (this repo)
├── .bkit/core/engine/       # TypeScript source for the bkit CLI
│   ├── cli.ts                   # entry point (the `bkit` bin); CLI verb + module-flag parsing (install | check | doctor | status | uninstall | upgrade | cursor | opencode | comply | harvest | analysis | telemetry | help)
│   ├── commands/                # what you type: one file or folder per verb / noun
│   │   ├── install/install.ts   # `bkit install`; orchestrates phases 1-3 + staging primitives (dispatch in cli.ts)
│   │   ├── install/check.ts     # `bkit check` — replays phase 1 + phase 3, writes the advisories artifact
│   │   ├── install/doctor.ts    # `bkit doctor` + `bkit status` verbs
│   │   ├── install/upgrade.ts   # `bkit upgrade` diff engine + canonicalHashes drift detection
│   │   ├── install/uninstall.ts # `bkit uninstall` orchestrator — surgical format-aware removal
│   │   ├── launch.ts            # `bkit cursor` / `bkit opencode` launcher verbs — merges .bkit/.env over process.env and exec's the app binary directly (`open -a` routes via launchd, which DROPS the env — #279/#280)
│   │   ├── comply.ts            # Compliance grader (#234 WS-2) — no-mirror-edit + skip-ci-not-head rules; emits kind:"compliance" rows; `bkit comply --phase <p>` (fail-open)
│   │   ├── harvest.ts           # Cross-repo harvest CLI (#234 WS-4, #343) — COPIES consumer .bkit/stats.jsonl (never modified); MOVES .bkit/friction.jsonl into harvest/ at repo root, pruning drained rows from the consumer; COUNT-ONLY for docs/{deferrals,failures}.jsonl; store keeps every distinct row, deduped by content (never rewritten from the fold); prune gated on byte-for-byte content (NOT identity — fold collapses colliding rows) after copy→fsync→read-back; store accumulates, never cleared; never commits in any repo; `bkit harvest`
│   │   ├── analysis.ts          # Analysis CLI (#234 WS-4) — counts/rates/elapsed, #183 size↔outcome regression, dispatch-size threshold, counterSource trust labelling, per-rule compliance rate over kind:"compliance" rows; `bkit analysis`
│   │   └── workflow/ ci/ setup/ # `bkit <noun> <verb>` workflow commands
│   ├── install/                 # what gets written into a consumer repo, and how
│   │   ├── modules/index.ts     # Phase 2 — module dispatcher (MODULE_REGISTRY)
│   │   ├── template-copies.ts   # Dotfile remap + whole-templates-root copy/delete sync (syncTemplateCopies)
│   │   ├── write.ts             # Format-aware file-write primitives (fully-managed / markered-text) + deepContains/writeTier2JsonContained
│   │   ├── placeholders.ts      # Token resolver (default branch, project name, managed-version marker)
│   │   ├── version-file.ts      # .bkit/version JSON schema (pinnedVersion, canonicalHashes, claudeAllowDerived)
│   │   ├── manifest.ts          # Per-module install-write manifest (drives uninstall + the upgrade walk)
│   │   └── cloud-env.ts         # Resolves the `.claude/bkit-cloud.md` + `.cursor/bkit-cloud.md` env/secret blocks by FOLLOWING the consumer's .envrc (honours its `unset` lines, drops session-hijack keys) — one resolver, a per-cloud policy (Cursor+Linear adds BKIT_LINEAR_API_KEY; Claude adds autocompact); no hardcoded stack-specific key list, keeping the shipped surface stack-agnostic
│   ├── render/                  # workflow and prompt sources → host agent and command copies
│   │   ├── hosts.ts             # Host transforms (T1/T2/T3, frontmatter, agent/command/skill renders)
│   │   ├── models.ts            # Model lookup, overrides, effort map and the gateway columns
│   │   └── trackers.ts          # Tracker-provider substitution engine (github / linear / none)
│   ├── checks/                  # detection before and after writes
│   │   ├── before/              # Phase 1 — index.ts runs one file per group of findings (repo, version,
│   │   │                        #   context-fetch, mcp, env, files)
│   │   └── after/               # Phase 3 — index.ts runs one file per group of findings (auth, github,
│   │                            #   vercel, ci-yml, tools, managed); checklist formatter
│   ├── ledgers/                 # JSONL ledger codecs
│   │   ├── status.ts            # status.jsonl workflow-log contract + fold reducer + invariant validator (the `bkit status` verb lives in commands/install/doctor.ts)
│   │   └── telemetry.ts         # Unified JSONL telemetry codec — TelemetryEvent union, parse/fold/foldFrom/validate/appendLine (#234 WS-1)
│   ├── shared/                  # helpers every folder uses
│   │   ├── package-roots.ts     # Single resolver seam — getCoreRoot / getSharedRoot / getTemplatesRoot / getPkgRoot / isDogfood
│   │   └── protected-paths.ts   # Single protected-path table (mirror prefixes + gate-config basenames); source of truth for the grader AND the committed generated .cjs
│   ├── tools/wording.ts         # repo-only `pnpm wording:sync`, not a bkit command
│   └── audits/                  # tests only: read shipped text (workflows/ templates/ hooks/ repo/)
├── dist/                   # Compiled output (committed; published in tarball)
├── .bkit/core/             # Payload bkit writes and keeps current: engine/, workflows/,
│                           #   prompts/, docs/templates/, the hooks, AGENTS.md and .agents/*.md,
│                           #   the .bkit/ reference docs, hooks/ (install skips the package-only
│                           #   subtrees)
├── .bkit/shared/           # Payload bkit writes and keeps current: CLAUDE.md, .mcp.json,
│                           #   .env.example, settings/hooks/mcp JSON, bkit-cloud.md, docs/*.md blocks
└── .bkit/templates/        # Copy-and-own templates: copied raw to the consumer's
                            #   .bkit/templates/, never applied
├── harvest/                # Central store for `bkit harvest` — consumer stats/friction rows (#343)
│                           # + consumers.md (maintainer-local consumer checkout paths, one per line).
│                           # bkit-repo only; deliberately OUTSIDE .bkit/ (that is bkit's managed
│                           # install surface; harvested consumer data is neither managed nor shipped).
│                           # Gitignored: private consumer content + local paths never enter the
│                           # public repo. Holds every distinct row ever harvested; readers fold it by
│                           # identity. Accumulates across runs and is never cleared — once harvest
│                           # prunes a consumer's friction row, this local store is the only copy.
└── package.json            # bin: bkit → dist/cli.js
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
    │   ├─ json            → deep-containment merge (writeTier2JsonContained); MCP configs → bkit's tracker entry only
    │   ├─ package.json    → bkit:gate:* / bkit:deps:* names added when missing, never overwritten
    │   ├─ templates       → raw copies into .bkit/templates/ only; never applied to the repo
    │   └─ On any error    → earlier modules' files stay written, .bkit/version not re-pinned — re-run install (idempotent)
    │
    └─ Phase 3: Post-install re-detection + commit
        ├─ Credential detectors (GitHub MCP token, cloud router secrets)
        ├─ Checks on the consumer's own bkit-ci.yml (actionlint, run injection, capstone contract, bkit-stub)
        ├─ Vale package sync check
        ├─ Render unified advisory checklist
        ├─ Phase 3 blockers → exit 1 with recovery line; --auto-revert calls runUninstall first
        └─ Write .bkit-version JSON (pinnedVersion + canonicalHashes from this run's WriteSet)
```

CLI verbs:

- `pnpm bkit install` — all three phases. Requires ≥1 module flag; bare `bkit install` errors.
- `pnpm bkit check` — Phase 1 + Phase 3 read-only; exit 1 on Tier-1 / Tier-2 drift, no writes.
- `pnpm bkit doctor` — Phase 1 + Phase 3 detection; never writes; always exit 0.
- `pnpm bkit status` — read-only; installed host (claude / cursor / opencode) + configured provider.
- `pnpm bkit uninstall` — surgical format-aware removal: fully-managed delete / markered-text strip / byte-equal-text hash-guarded delete; `--dry-run`, `--force`, `--nuke`, `--yes`. package.json scripts and devDeps are never removed (the `bkit` install-state block goes on a full uninstall).
- `pnpm bkit upgrade` — diff engine vs `canonicalHashes`; non-conflicts auto-apply, conflicts stderr (`--auto-apply` non-zero on conflict). Module-scoped. Re-renders at **installed** version (offline). `--to=<version>` / `--latest` (#296) bump `@cbartens/bkit` (`pnpm add`) → re-exec fresh binary → re-render + re-pin atomically, so version bump cannot drift mirrors; bare `pnpm add` does not re-render.
- `pnpm bkit comply --phase <p>` (#234 WS-2) — grader over `git diff parentSha..HEAD`; advisory-only, fail-open.
- `pnpm bkit harvest` (#234 WS-4, #343) — bkit-repo only; COPIES `stats.jsonl`, MOVES `friction.jsonl` (prunes consumer), count-only `docs/{deferrals,failures}.jsonl`. Never commits.
- `pnpm bkit analysis` (#234 WS-4) — harvested store counts / rates; size↔outcome regression, per-rule compliance.
- `pnpm bkit telemetry summary [--phase=<workflow>]` (#234 WS-5) — per-workflow telemetry report against the median of the previous 5 runs; read-only.
- `pnpm bkit cursor` / `pnpm bkit opencode` — launch host with `.bkit/.env` merged (macOS GUI apps skip login-shell / direnv env).

## Consumer Integration Model

```
Consumer repo
├── package.json            # devDependencies: { "@cbartens/bkit": "^5.1.0" }
├── .claude/settings.json   # json format — deep-containment (template scope ⊆ consumer)
├── .cursor/hooks.json      # json format — Cursor v1 keyed-object; deep-containment
├── .agents/                # Cross-IDE agent runtime, populated by `pnpm bkit install`
│   ├── rules.md            # markered-text — bkit block + consumer Project section
│   ├── docs.md             # markered-text — doc index
│   ├── context.md          # markered-text — context-fetch / allowed-domains / mcp-servers rules; consumer blocks below bkit:end
│   ├── skills.md           # markered-text — installed-skill registry; consumer Project Skills below bkit:end
│   └── skills/             # installed agent skills (cross-IDE)
└── .bkit/                  # bkit install state + config (consumer-side)
    ├── version             # JSON: { pinnedVersion, canonicalHashes, claudeAllowDerived }
    ├── friction.jsonl      # friction ledger — appended by phase workflows, drained by bkit harvest
    ├── advisories.md       # generated artifact (gitignored) — last install/check findings
    ├── .env.example        # fully-managed — token placeholders
    ├── templates/          # raw template copies (bkit-ci.yml, hooks, tool configs, context/<provider>.md …) — copy and own
    └── .env                # consumer secrets (gitignored), auto-loaded via .envrc/direnv
```

Workflow / prompt SOURCES not shipped into consumer `.agents/`; live in installed package `.bkit/core/workflows/` + `.bkit/core/prompts/`, read package-relative. IDE mirrors from those sources:

- `.claude/commands/` + `.claude/agents/` — byte-identical copies of `.bkit/core/workflows/` + `.bkit/core/prompts/`
- `.cursor/commands/` + `.cursor/agents/` — T1 / T2 / T3-transformed for Cursor
- `.opencode/commands/` + `.opencode/agents/` + `.opencode/opencode.json` + `.opencode/plugin/bkit-gateguard.js` — additive opencode host; opt-in `bkit install --opencode=<provider>`; four providers: `openrouter`, `ollama`, `opencode-zen`, `opencode-go`. See `docs/technology.md` § Execution Hosts.
- `.codex/agents/` + `.codex/hooks.json` + `.codex/hooks/` — additive Codex CLI host; opt-in `bkit install --codex`. No `.codex/config.toml`: `openai` is a reserved built-in provider id, so bkit has nothing to declare. Project-local hooks load only once the `.codex/` layer is TRUSTED.
- `.agents/plugins/bkit/` (`plugin.json` + `skills/bkit-*/SKILL.md` + `agents/bkit-*.md` + `hooks.json` + `hooks/`) + `GEMINI.md` — additive Google Antigravity host installed as a workspace **plugin**; opt-in `bkit install --antigravity`; `.agents/` root stays the dedicated Codex install; workflows ship as plugin skills, subagents as in-session prompts loaded with `view_file`. See `docs/technology.md` § Execution Hosts.

`.claude/hooks/bkit-gateguard.cjs`, `.cursor/hooks/bkit-gateguard.cjs`, `.codex/hooks/bkit-gateguard.cjs`, `.agents/plugins/bkit/hooks/bkit-gateguard.cjs` and `.opencode/plugin/bkit-gateguard.js` (the GateGuard advisory hooks — pre-edit on Claude / Cursor / Codex / Antigravity, appended to the tool result on opencode), the same five paths with `bkit-readguard` (the ReadGuard repeat-read advisory hooks, `.bkit/providers.md` § ReadGuard) plus `.claude/hooks/bkit-guardrails.cjs`, `.cursor/hooks/bkit-guardrails.cjs`, `.codex/hooks/bkit-guardrails.cjs` and `.agents/plugins/bkit/hooks/bkit-guardrails.cjs` (shell gates: destructive ops, secret exposure, URL-host checks and shell-as-edit-channel) — like the two `bkit-preflight.sh` hooks, generated at install from a per-host template plus the shared `.bkit/core/hooks/` (`render/parts.ts`) — are markered-text (slash-comment: `// bkit:start` / `// bkit:end`) — bkit owns only the pure advisory engine between the markers; the stdin / stdout driver (Claude) or exported plugin (opencode) around it is consumer-owned from first install onward, so a consumer can add their own advisories without losing them on upgrade. A pre-markers install (no markers, hash matches a prior canonical hash) is replaced wholesale on the next install / upgrade; a genuinely consumer-authored file (no markers, unknown hash) gets the block appended plus printed wiring instructions.

Every non-JSON file bkit writes or refreshes carries the managed-version marker, one text in the file's comment syntax: `<!-- bkit:managed vX.Y.Z … -->` (markdown), `# <!-- bkit:managed vX.Y.Z … -->` (shell, `.gitignore`, `.gitattributes`, `.env.example`, codex TOML), `// bkit:managed vX.Y.Z …` (JS hooks, `.mjs`). The full MIT text and copyright notice travel at `.bkit/LICENSE.md` (`runBkitDocs`). Rendered agents / commands / skills are stamped by `stampManagedVersion`; every other file carries `{{BKIT_MANAGED_MARKER}}` in its source, resolved by `applyTokens`. The marker sits on the first line inside the `bkit:start` block, or below the first heading of a whole file. `listStampedFiles` (`.bkit/core/engine/install/modules/index.ts`) derives the set from the core templates, the manifest and the rendered mirrors; marker drift on any of them → `bkit check` emits `bkit-managed-stale` (never consumer plans). **Branch-scoped** (`isOnProtectedBranch`): blocker on `main` / `dev` (or PR into them via `GITHUB_BASE_REF`); advisory on feature branches (listed in the checklist, does not block push).

## Compliance Grader Subsystem (#234 WS-2)

Deterministic, advisory-only grader on `git diff parentSha..HEAD` → `kind:"compliance"` rows in `.bkit/stats.jsonl`.

**Components:**

- `.bkit/core/engine/commands/comply.ts` — pure grader (`ruleNoMirrorEdit`, `ruleSkipCiNotHead`, `runGrader`, `buildComplianceRows`); no side effects, no `process.exit`.
- `.bkit/core/engine/shared/protected-paths.ts` — protected-path table (mirror prefixes + gate-config basenames); shared by grader + committed `.cjs`.
- `.claude/hooks/gate-paths.generated.cjs` — generated from `.bkit/core/engine/shared/protected-paths.ts`; drift in `.bkit/core/engine/shared/protected-paths.test.ts`. bkit's own repo only; install never writes it.
- `.bkit/core/engine/cli.ts` — `comply` verb + `--phase` dispatch (DE-34).

**Crash isolation (DE-34):** `comply` dispatch try/catch; crash → `[bkit-comply] internal error: …`, exit 0. Workflow wiring: `|| echo "[bkit-comply] grader unavailable, skipping"` silences non-zero.

**Wiring:** every phase workflow (design, plan, build, debug, ship) runs `bkit comply --phase=<p>`.

## Knowledge / Decisions JSONL Ledgers (#234 WS-5)

`docs/knowledge.jsonl` (`kind:"knowledge"`) + `docs/decisions.jsonl` (`kind:"decision"`) = NDJSON ledgers. Consumer-inherited (`.gitattributes` managed block, `merge=union`).

**Data topology:** shared `TelemetryEnvelope` (ts, kind, repo, bkitVersion, workflow, step, key, references[]) + kind payloads (`KnowledgePayload` / `DecisionPayload`) in `.bkit/core/engine/ledgers/telemetry.ts`.

`references[]` = single cross-entry pointer for EVERY kind (envelope, not payload) — feature ids, tracker ids, PRs, SHAs, paths, sibling `ts`, `KN-N` / `DE-N` ids. No separate identity field. `ts` = id; `references[]` = pointers. Contract: `.bkit/jsonl.md` § Key & References. Cite slug `key`, never bare number.

## Roadmap Ledger & Board

`.bkit/issues.jsonl` (`kind:"feature"`) = canonical feature-state ledger, appended at every phase close. `docs/roadmap.md` = generated board, a pure projection of it. Consumer-inherited (`.gitattributes` managed block, `merge=union`).

**Components:**

- `bkit roadmap fold` (`.bkit/core/engine/commands/workflow/roadmap.ts`) — deterministic status tier, fail-open. It rewrites the whole generated region of `docs/roadmap.md` in one pass: the `bkit:roadmap-status` block from `.bkit/issues.jsonl`, the `bkit:roadmap-analysis` block carried through verbatim, and two consumer `## Notes` blocks carried through verbatim. Every phase close calls it. No tracker table is rendered, because a wired tracker already shows its own issues, and a regenerated copy can only go stale. Everything above the first marker is preserved. `roadmap-notes-post` is last.
- `.bkit/core/prompts/bkit-utility-update-roadmap.md` (`@bkit-utility-update-roadmap`) — the only writer of the `roadmap-analysis` block. Runs `bkit roadmap fold` itself, then ranks from the board, in-flight `docs/plans/**` artifacts, open deferrals / failures, and — when a tracker is wired — its OPEN issues (read-only, never comments). Always names the next milestone and the next distinct umbrella; includes a child only when it is open, unblocked, and able to start now. Those two stay visible; the list stays priority order, one row per container. Length is `package.json` `bkit.roadmapNext` (positive integer; absent or invalid → 25). Due audits (`docs/templates/bkit-audit-*.md` cadence vs newest `docs/audits/` report) compete by priority (risk covered first, then how overdue) for at most 3 rows. The length hint sits in the generated `roadmap-status` header.

**Ownership boundary:** `docs/roadmap.md` is consumer-owned — `bkit install` never creates or overwrites it and `bkit check` drift stays clean. bkit rewrites only the mechanical `roadmap-status` tables; the two `## Notes` blocks and `roadmap-analysis` are carried through. `roadmap-notes-post` is last. `roadmap-analysis` is written ONLY by `@bkit-utility-update-roadmap`; the fold carries it through untouched, so a phase close never blanks it. Ship stages both roadmap paths through the frozen `BOOK_PATHS` allow-list.

Sensing is on-disk-first: every phase close full-regenerates the board from the ledger. Every roadmap branch exits 0 and never gates a close — grep keys in `docs/observability.md` § `[bkit-roadmap]`. Row contract: `.bkit/jsonl.md` § Per-Kind Fields. Test inventory: `docs/testing.md`.

## Distribution

`@cbartens/bkit` published publicly to npmjs (`https://registry.npmjs.org`) on every git tag via `.github/workflows/release.yml` (npm OIDC trusted publishing — no long-lived token); same run creates the tag's GitHub Release from its `CHANGELOG.md` block. Consumers install with no registry mapping or PAT. See `docs/deployments.md` § Dependency updaters.
