# bkit — Agent Workflow System

**bkit** wires Claude Code (and Cursor) into five-phase tracker-integrated cycle: `/bkit-design` → `/bkit-plan` → `/bkit-build` → `/bkit-debug` → `/bkit-ship`. Hosts additive: `.claude/` + `.cursor/` always render (direct Anthropic); `bkit install --opencode=<provider>` adds opencode for non-Anthropic backends — four providers: `openrouter`, `ollama`, `opencode-zen` + `opencode-go` (opencode-native gateways; auth via `BKIT_OPENCODE_API_KEY`) — same harness, inference backend only changes (see `.bkit/providers.md` § Hosts + Providers).

README: what bkit does, env / tracker setup, upgrade paste + ongoing CLI. First-time install/auth deep-dive: `node_modules/@cbartens/bkit/README.md`. Workflow internals: `.bkit/workflows.md`; subagent metadata (effort, model, tools, `maxTurns`): `.bkit/prompts.md`.

---

## How a workflow runs (end-to-end example)

Typical cycle for `ISSUE-123` "Add feature X":

1. **Tracker issue** with **`bkit:auto`** label + non-terminal state (`Backlog`, `In Progress`).
2. **Trigger** — tracker comment (`@cursor /bkit-plan ISSUE-123`) or slash command (`/bkit-plan ISSUE-123`).
3. **Workflow Step 1** — preflight checks `bkit:auto`, acquires `.lock`, sets `bkit:plan` + `In Progress`, creates workflow comment.
4. **Step 2 — worktree** — git worktree at `.worktrees/issue-123-add-feature/` on `feat/issue-123-add-feature`. Env files (`.env*`) copied, `pnpm install --frozen-lockfile`.
5. **Phase steps** — dispatches subagents (`@bkit-plan-generate`, then `@bkit-plan-review-1` ‖ `-2` ‖ `-3` parallel triplet, etc.). Each writes `docs/plans/{YYYYMM}/logs/{FID}/` (`{YYYYMM}` = canonical month bucket at design start), appends fenced section to tracker comment.
6. **Phase summary** — verdict (`PASS` / `CONCERNS` / `FAIL`); commit `chore(issue-123-…): summary bkit [skip ci]` (design/plan) or `chore(issue-123-…): summary` (build/debug/ship) → push.
7. **Close Workflow** — tracker `In Review`; phase label persists. `/bkit-design` / `/bkit-plan`: prune worktree, delete `feat/issue-123-…` (merged into `dev`). `/bkit-build` / `/bkit-debug`: worktree persists.
8. **Human review** — design/plan at `docs/plans/{YYYYMM}/{FID}-{design,plan}.md` (canonical). Reviewer re-triggers or progresses to `/bkit-build`.
9. **`/bkit-build`** — re-creates worktree, executes plan, lint/typecheck/unit tests, opens PR to `dev`.
10. **CI** on PR. Red → `/bkit-debug` (PR mode: `gh run view --log-failed`). Green → `/bkit-ship`.
11. **`/bkit-ship`** — squash-merge PR, `@bkit-ship-update-docs` ‖ `@bkit-ship-summary` (parallel) on `dev`, prune worktree, issue `In Review` (`bkit:merged`; bkit never auto-closes). Plans stay at `docs/plans/{YYYYMM}/` — no archive move.

Throughout: workflows hold `.lock`, write `status.jsonl` (resume SoT), own tracker MCP calls — subagents are leaves (no tracker access), writes scoped by `tools:` allowlist.

---

## The five phases

<!-- prettier-ignore -->
| Phase | Command | Steps | Output | Hard stop? |
| --- | --- | --- | --- | --- |
| Design | `/bkit-design` | 10 | `docs/plans/{YYYYMM}/{FID}-design.md` | Yes — review before plan |
| Plan | `/bkit-plan` | 12 | `docs/plans/{YYYYMM}/{FID}-plan.md` (+ `-N.md` if split) | Yes — review before build |
| Build | `/bkit-build` | 17 | PR to `dev` | No — CI continues |
| Debug | `/bkit-debug` | 10 | Remediation commit on feature branch | No |
| Ship | `/bkit-ship` | 13 | Squash-merged PR, issue `In Review` + `bkit:merged` (plans stay canonical at `docs/plans/{YYYYMM}/`) | Yes |

Plus utilities: `/bkit-worktree-sync` (merge worktree branch into IDE branch), `/bkit-worktree-prune` (remove worktree, optionally branch).

**Per-step detail, verdict routing, retry / timeout constants, label flips, status.jsonl shape, comment lifecycle:** `.bkit/workflows.md`.

**Per-subagent scope, effort tier, tool surface, `maxTurns`, model assignment:** `.bkit/prompts.md`.

---

## Prerequisites

### Required tools

<!-- prettier-ignore -->
| Tool | Version | Used for |
| --- | --- | --- |
| `pnpm` | matches `package.json` `packageManager` | Workspace install (`pnpm install --frozen-lockfile`) in worktrees, lint/typecheck/test gates. Also bkit CLI (`bkit install`; `pnpm tsx .bkit/src/bkit-install.ts` in bkit dev). |
| `gh` | latest, authenticated | PR create / view / merge in `/bkit-build`, `/bkit-debug`, `/bkit-ship` |
| `git` >= 2.5 | — | Worktree operations |
| `jq` | latest | `status.jsonl` append in workflow Bash |
| Claude Code CLI | latest | Local-IDE workflow execution |
| Cursor (optional) | 2.4+ | Cloud Agent execution; honours `tools:` frontmatter allowlist |

### Shell alias

bkit = devDependency — add once for `bkit <verb>`:

```bash
# Add to ~/.zshrc (or ~/.bashrc), then: source ~/.zshrc
alias bkit='pnpm bkit'
```

`bkit doctor` emits `bkit-not-on-path` if alias absent. For `bkit cursor` / `bkit opencode` (GUI launchers), run from repo root in external terminal — not inside running app.

### Environment variables

Add to shell, Cursor Cloud Agent dashboard, `apps/web/.env.example` for contributors. Exact set depends on `bkit install --tracker=<name>`:

**GitHub tracker (default — `bkit install --tracker=github`):**

```env
# ==========================================
# BKIT: CURSOR CLAUDE GITHUB INTEGRATION
# ==========================================
BKIT_CURSOR_API_KEY=""
BKIT_ANTHROPIC_API_KEY=""
BKIT_GH_TOKEN=""
```

**Linear tracker (`bkit install --tracker=linear`):**

```env
# ==========================================
# BKIT: LINEAR CURSOR CLAUDE GITHUB INTEGRATION
# ==========================================
BKIT_LINEAR_API_KEY=""
LINEAR_WEBHOOK_SECRET=""
BKIT_CURSOR_API_KEY=""
BKIT_ANTHROPIC_API_KEY=""
BKIT_GH_TOKEN=""
```

<!-- prettier-ignore -->
| Variable | Tracker | Where read | Purpose |
| --- | --- | --- | --- |
| `BKIT_GH_TOKEN` | all | GitHub MCP server (`Authorization: Bearer`) | Issue/label/PR writes via MCP. Fine-grained PAT (Contents, PRs, Issues, Actions, Workflows, Metadata — R/W). |
| `GH_TOKEN` | all | `gh` CLI inside **CI workflow Bash only** (`GH_TOKEN: ${{ github.token }}`) | Not seeded in `.bkit/.env` — local `gh` uses `gh auth login` keyring. |
| `GITHUB_ISSUE_ID` | github | Injected from PR body `<!-- bkit:issue=#NNN -->` | Linked GitHub issue. Injected automatically — do not set manually. |
| `BKIT_ANTHROPIC_API_KEY` | all | Claude Code (headless / CI) | Required when Claude invoked outside interactive session (cloud automation, CI). |
| `BKIT_CURSOR_API_KEY` | all | Cursor Cloud Agent dashboard / programmatic invocation | Required for non-interactive Cursor sessions. |
| `BKIT_LINEAR_API_KEY` | linear | Preflight hooks (`.{claude,cursor}/hooks/preflight.sh`); workflow Linear MCP via OAuth fallback | Query issue state + labels for `Auto` gate; fail-fast if absent. |
| `LINEAR_WEBHOOK_SECRET` | linear | Linear → Cursor integration backend | Verifies webhook signatures on `@cursor` mentions. Set in Linear ↔ Cursor integration config. |

`LINEAR_ISSUE_ID` (Linear) and `GITHUB_ISSUE_ID` (GitHub) set automatically by workflow context — do not set manually.

### Tracker workspace setup

One custom label (`Auto`), plus integration label families. Setup depends on configured tracker.

#### Bkit custom label (`Auto`)

- **`Auto`** — issues approved for agent work. Preflight refuses if absent or terminal state (`Done` / `Cancelled` / closed). Add before any cloud / automation session.
  - **GitHub:** issue label `bkit:auto`. `bkit install --tracker=github` seeds via GitHub MCP on first run.
  - **Linear:** Linear label `Auto`. Add manually to workspace.

#### Phase labels (GitHub tracker)

`bkit.issueTracker = "github"` → Cursor reads PR phase label for dispatch: `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`. Cursor GitHub App on repo/org required. `/bkit-design` / `/bkit-plan` have no PR — local-IDE-only on Cursor cloud.

#### Linear ↔ Cursor integration labels (Linear tracker only)

Three **parent labels** (`branch`, `model`, `repo`) — sub-labels set Cursor Cloud Agent session context. Present sub-label → Cursor follows; else integration defaults.

<!-- prettier-ignore -->
| Parent | Example sub-labels in this workspace | What it controls |
| --- | --- | --- |
| `branch` | `dev` | git branch the agent works on |
| `model` | `cursor-grok-4.5-high`, `composer-2.5` (defaults); API Opus etc. via `prompts.md` § Model Overrides paste block | Cursor model the orchestrator runs on |
| `repo` | `<owner>/<consumer-repo>` | repo the agent operates in |

Per-agent model assignments: `.bkit/prompts.md` § Models; Cursor reads subagent frontmatter `model:` directly. Linear `model:*` sub-labels = **orchestrator-session** model only. Keep in sync with `.bkit/providers.md` § Cursor model catalog.

Full Linear ↔ Cursor setup: <https://linear.app/docs/cursor>.

---

## Distribution & install

`.agents/` = **canonical**. `bkit install` regenerates host outputs (`.claude/**`, `.cursor/**`) and rewrites bkit-managed blocks across consumer repo.

First-time install, `BKIT_GH_TOKEN_INSTALL` / `.npmrc` / GHA / Vercel auth, uninstall, `.bkitignore`: package root `README.md` at `node_modules/@cbartens/bkit/README.md` (not copied to consumer repo root). Ongoing ops below.

### Upgrade — paste into your AI

Prefer `bkit upgrade --latest` (bumps package **and** resyncs managed files) — do **not** only `pnpm add`. Replace `<ENV-FILE-PATH>` if token not already loaded (direnv / `.bkit/.env`).

````text
Upgrade `@cbartens/bkit` to the latest version in this repo and finish the resync.
1. Ensure `BKIT_GH_TOKEN_INSTALL` is available for the GitHub Packages bump. If not already in the environment, load without leaking (`source` is a shell builtin — not file I/O). `source` and the command MUST be the SAME Bash invocation:
   ```bash
   set -a; source <ENV-FILE-PATH> 2>/dev/null; set +a; \
     pnpm config set "//npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL" && \
     bkit upgrade --latest
   ```
   If token already exported (direnv / shell profile), skip `source`:
   ```bash
   bkit upgrade --latest
   ```
   If `bkit` not on PATH: `pnpm bkit upgrade --latest`. Do **not** only `pnpm add @cbartens/bkit@latest` — that refreshes the package without resyncing managed files.
2. Read `.bkit/advisories.md` end-to-end. For every `[advisory]`/`[blocker]`: apply its **Action** unless truly N/A. If you skip, state advisory id and why.
3. Read canonical templates at `node_modules/@cbartens/bkit/.bkit/templates/` (husky, CI, `.claude/settings.json`, `.cursor/`, renovate, vale, etc.). MUST reconcile against this repo and adopt unless adoption would break existing functionality — seed-or-print files (e.g. `ci.yml`) do NOT overwrite existing files, so adoption is your job. For any template not adopted, state which and why.
4. Re-run `bkit check` (or `pnpm bkit check`). Fix remaining drift/advisories you can. End with: resolved version, advisories applied, advisories skipped (with reasons), templates adopted/skipped (with reasons).
````

### Ongoing CLI

```bash
bkit upgrade              # re-render at CURRENT installed version (offline)
bkit upgrade --latest     # bump @cbartens/bkit + resync in one step (or --to=<version>)
bkit check                # drift gate — exits non-zero on drift
bkit doctor               # advisories only; exits 0; no managed-file writes
bkit install --claude --cursor --tooling   # (re)seed hosts + tooling; name ≥1 module
```

> **⚠️ Version bumps:** use `bkit upgrade --latest` (or `--to=<version>`). Bare `pnpm add @cbartens/bkit` / Renovate bumps refresh lockfile only — run `bkit upgrade` after and commit resync with the bump, or `bkit check` reds CI.

### Dogfood path (this repo only)

bkit repo runs install script via `tsx` instead of published bin:

```bash
pnpm tsx .bkit/src/bkit-install.ts install
pnpm tsx .bkit/src/bkit-install.ts check
```

CI drift gate (`.github/workflows/ci.yml`) fails PR if generated files diverge from `install` output.

## Three-tier file ownership

Three-tier model — different ownership without clobbering consumer customisations.

<!-- prettier-ignore -->
| Tier | Semantics | Files |
| --- | --- | --- |
| **Tier 1 — Fully managed** | Idempotent rewrite of whole file on every install. Consumer should not edit directly. | `.cursor/hooks.json`, `.vale/styles/House/**`, `.bkit/scripts/**` |
| **Tier 2 — Managed-block** | bkit owns content between `bkit:start`/`bkit:end` markers. Consumer owns everything outside. File absent → write whole file. File present without markers → append block at EOF (exception: the hook scripts, see below). | `.vale.ini`, `.gitignore`, `.prettierignore`, `rules.md`, `AGENTS.md`, `CLAUDE.md`, `.claude/hooks/preflight.sh`, `.cursor/hooks/preflight.sh`, `.claude/hooks/gateguard.cjs`, `.cursor/hooks/gateguard.cjs`, `.opencode/plugin/gateguard.js`, `.cursor/hooks/guardrails.cjs` |
| **Tier 3 — Seed-or-print** | Write if absent. If present, print suggested diff to stdout (never overwrite). | `.husky/pre-commit`, `.husky/pre-push` (v2.0.4+), `slop-scan.config.json`, `.cursor/settings.json`, `.github/workflows/ci.yml` |
| **Managed package.json keys** (v0.4.0) | Add-if-missing on `scripts` and `devDependencies`. Existing keys NEVER overwritten — consumer pins win. Drift via `bkit check` flags missing keys when parent module enabled. | All under `--typescript`: `scripts.typecheck` / `lint` / `format:check` / `lint:prose` / `lint:slop` / `slop:delta` / `bkit:gate:format` / `bkit:gate:static` / `bkit:gate:static-unit` / `bkit:gate:install-static-unit-build` / `bkit:deps:outdated` / `bkit:deps:audit` / `prepare`; `devDependencies.prettier` + `slop-scan` + `lint-staged` + `husky`. Stack-agnostic `--ci` adds NO package.json keys. |

**Marker syntax** format-specific:

- Markdown / `.gitignore`: `<!-- bkit:start -->` / `<!-- bkit:end -->`
- YAML / INI / shell: `# bkit:start` / `# bkit:end`
- JS / TS ES modules: `// bkit:start` / `// bkit:end` (HTML comments are a syntax error in an ES module)

Comment prefixes (`# `, `// `) before markers preserved on block updates.

**Hook scripts — Tier 2 with a migration policy.** A `.claude/hooks/gateguard.cjs`, `.cursor/hooks/gateguard.cjs`, `.opencode/plugin/gateguard.js` or `.cursor/hooks/guardrails.cjs` that exists with no markers is not appended to blind: content hashing to a bkit release is replaced wholesale (ours, unmodified — it predates marker adoption); anything else gets the block appended plus printed wiring instructions, because bkit cannot add the call into a consumer-authored driver for them. bkit's block is a pure advisory engine — no stdin read, no stdout write, no top-level call — so it cannot collide with a consumer's own emitter.

### What install writes

<!-- prettier-ignore -->
| Path | Module | Source | Tier |
| --- | --- | --- | --- |
| `.agents/{rules,docs,skills}.md` | core | `.bkit/templates/.agents/` | Tier 2 html-comment (via templates pass — NOT additive payload copy) |
| `.bkit/.env.example` | core | `.bkit/templates/.bkit/` | Tier 3 seed |
| `.agents/` + `.bkit/` (payload cleanup/migration pass) | core | — | Removes relocated old-layout orphans (`.agents/workflows`, `.agents/prompts`, moved reference docs) and migrates `.agents/{.bkit-version,.env,.env.example,friction.md}` → `.bkit/` for old-layout consumers (content-preserving) |
| `.bkit/version` | core | package.json version | Written LAST (partial installs detectable) |
| `.gitignore` | core | `.bkit/templates/gitignore` | Tier 2 html-comment |
| `AGENTS.md`, `CLAUDE.md` | core | `.bkit/templates/` | Tier 2 html-comment |
| `docs/**` | core | `.bkit/templates/docs/` | Tier 2 html-comment |
| `.agents/context.md` | core | `.bkit/templates/.agents/` | Tier 2 html-comment. Consumer `allowed-domains` block lives after `bkit:end`. |
| `.gitattributes` | core | `.bkit/templates/.gitattributes` | Tier 2 html-comment (`merge=union` for the append-only ledgers) |
| `.envrc` | core | `.bkit/templates/.envrc` | Tier 2 hash-comment |
| `.mcp.json` | core | `.bkit/templates/.mcp.json` | Tier 2 JSON deep-containment (consumer servers preserved) |
| `.bkit/{cloud,jsonl,providers,prompts,trackers,workflows,README}.md` | core | mirrored from the installed package | Tier 1 (canonical-overwrite). The reference docs agents read at runtime. |
| `.bkit/scripts/*.sh` | core | `.bkit/templates/.bkit/scripts/` | Tier 1 (canonical-overwrite), executable. `bkit-ship-gate.sh`, `bkit-counter-bus.sh`, `bkit-counter-bus-config.sh`, `bkit-status-fold.sh`, `bkit-status-route.sh`, `bkit-rebase-resolve.sh`, `bkit-protect-main.sh`, `bkit-context-clamp.sh`, `bkit-runtime.sh`, `bkit-workflow-telemetry.sh`, `bkit-ship-timeouts.sh` — bkit-owned, no consumer-editable region; drift is re-rendered, not merged. |
| `.claude/commands/bkit-*.md` | claude | `.bkit/workflows/` (byte-identical) | Host pass — always overwrite |
| `.claude/agents/bkit-*.md` | claude | `.bkit/prompts/` (byte-identical) | Host pass — always overwrite |
| `.claude/settings.json` | claude | `.bkit/templates/.claude/settings.json` | Tier 2 JSON deep-containment. Permission allow/deny/ask + SessionStart / PreToolUse hook wiring. |
| `.claude/hooks/preflight.sh` | claude | `.bkit/templates/.claude/hooks/` | Tier 2 hash-comment |
| `.claude/hooks/gateguard.cjs` | claude | `.bkit/templates/.claude/hooks/` | Tier 2 slash-comment (migration policy — see above) |
| `.cursor/commands/bkit-*.md` | cursor | `.bkit/workflows/` (T1+T2 transforms) | Host pass — always overwrite |
| `.cursor/agents/bkit-*.md` | cursor | `.bkit/prompts/` (T3 transforms) | Host pass — always overwrite |
| `.github/workflows/ci.yml` | ci | `.bkit/templates/.github/workflows/ci.yml` | Tier 3 (seed-or-print); tokens substituted on first write |
| `.github/renovate.json5` | renovate | `.bkit/templates/.github/renovate.json5` | Tier 1 (canonical-overwrite). **Opt-in via `bkit install --dependency=renovate`** — not default. Phase-gated against `origin/<default-branch>`: Phase A lands file, prompts merge; Phase B (re-run after merge) prints GitHub App install URL. `baseBranches: ["dev"]` per bkit branch protection. **Mutually exclusive with `--dependabot`**. |
| `.github/dependabot.yml` | dependabot | `.bkit/templates/.github/dependabot.yml` | Tier 1 (canonical-overwrite). **Opt-in via `bkit install --dependency=dependabot`** — not default. First-party GitHub; no App install or phase gate. **Mutually exclusive with `--renovate`**. Less monorepo-aware than Renovate but no third-party trust surface. |
| `.bkit/scripts/bkit-set-dependabot.sh` | dependabot | `.bkit/templates/.bkit/scripts/bkit-set-dependabot.sh` | Tier 1 (canonical-overwrite), executable. Enables repo-level Dependabot state via `gh api`. Run once after `bkit install --dependency=dependabot`. |
| `.vale.ini` | ci | `.bkit/templates/.vale.ini` | Tier 3 (seed-or-print). Stack-agnostic → ships with `--ci`. |
| `.vale/styles/House/**` | ci | `.bkit/templates/.vale/styles/House/` | Tier 1 (fully managed). Ships with `--ci`. |
| `slop-scan.config.json` | lint | `.bkit/templates/slop-scan.config.json` | Tier 3 (seed-or-print) |
| `.bkit/scripts/bkit-slop-type-suppression.mjs` | lint | `.bkit/templates/.bkit/scripts/bkit-slop-type-suppression.mjs` | Tier 1 (canonical-overwrite). Slop plugin — `--typescript` only. |
| `.bkit/scripts/bkit-slop-delta.sh` | lint | `.bkit/templates/.bkit/scripts/bkit-slop-delta.sh` | Tier 1 (canonical-overwrite), executable. `slop:delta` gate helper — `--typescript` only. |
| `.prettierignore` | lint | `.bkit/templates/.prettierignore` | Tier 2 hash-comment |
| `package.json#scripts.typecheck` | lint | hardcoded default (`tsc --noEmit` if `tsconfig.json` present, else skip-noop) | Managed-key (add-if-missing). TS-exclusive, under `lint`. |
| `package.json#scripts.lint` | lint | hardcoded default (`npx eslint .` if an eslint config is present, else a skip line) | Managed-key (add-if-missing). bkit ships no linter, but without this key `bkit:gate:static`'s `pnpm lint` falls through to whatever `lint` binary is on PATH and the gate goes green through the wrong program. Your own `lint` always wins. |
| `package.json#scripts.format:check` / `lint:prose` / `lint:slop` / `slop:delta` | lint | hardcoded defaults | Managed-key (add-if-missing) |
| `package.json#scripts.bkit:gate:format` / `bkit:gate:static` / `bkit:gate:static-unit` / `bkit:gate:install-static-unit-build` | lint | hardcoded defaults | Managed-key (add-if-missing). What hooks, workflows and prompts run; the name states which tiers. |
| `package.json#scripts.bkit:deps:outdated` / `bkit:deps:audit` | lint | hardcoded defaults | Managed-key (add-if-missing). Read-only dependency inspection the audit / diagnose agents call. |
| `package.json#devDependencies.prettier` / `slop-scan` / `lint-staged` | lint | hardcoded version-specs (`^3.5.3`, `^0.3.0`, `^15.2.10`) | Managed-key (add-if-missing) |
| `.husky/pre-commit` | git-hooks | `.bkit/templates/.husky/pre-commit` | Tier 3 (seed-or-print, v2.0.4+) |
| `.husky/pre-push` | git-hooks | `.bkit/templates/.husky/pre-push` | Tier 3 (seed-or-print, v2.0.4+) |
| `package.json#scripts.prepare` | git-hooks | hardcoded default (`husky install`) | Managed-key (add-if-missing) |
| `package.json#devDependencies.husky` | git-hooks | hardcoded version-spec (`^9.1.7`) | Managed-key (add-if-missing) |
| `.cursor/hooks.json` | cursor | `.bkit/templates/.cursor/hooks.json` | Tier 1 (fully managed) |
| `.cursor/settings.json` | cursor | `.bkit/templates/.cursor/settings.json` | Tier 3 (seed-or-print) |
| `.cursor/mcp.json` | cursor | `.bkit/templates/.cursor/mcp.json` | Tier 3 (seed-or-print) |
| `.cursor/rules/00-shared-rules.mdc` | cursor | `.bkit/templates/.cursor/rules/` | Tier 2 html-comment |
| `.cursor/hooks/preflight.sh` | cursor | `.bkit/templates/.cursor/hooks/` | Tier 2 hash-comment |
| `.cursor/hooks/guardrails.cjs` | cursor | `.bkit/templates/.cursor/hooks/` | Tier 2 slash-comment (migration policy). Destructive-op + curl/wget host gates. |
| `.cursor/hooks/gateguard.cjs` | cursor | `.bkit/templates/.cursor/hooks/` | Tier 2 slash-comment (migration policy) |
| `.cursor/allowlist.json` | cursor | derived from bkit's shipped egress registry, union `.agents/context.md` allowed-domains | Tier 1 (canonical-overwrite). Curl/wget host allowlist `guardrails.cjs` reads at runtime. |
| `.opencode/opencode.json` | opencode | `.bkit/templates/.opencode/opencode.json` | Tier 2 JSON deep-containment; `@@OPENCODE_*@@` sentinels rendered to the chosen tracker + provider. **Opt-in via `bkit install --opencode=<provider>`**. |
| `.opencode/commands/bkit-*.md` | opencode | `.bkit/workflows/` | Host pass — always overwrite |
| `.opencode/agents/bkit-*.md` | opencode | `.bkit/prompts/` | Host pass — always overwrite |
| `.opencode/plugin/gateguard.js` | opencode | `.bkit/templates/.opencode/plugin/` | Tier 2 slash-comment (migration policy) |

### Optional post-install decisions (tracker + dependency updater + cloud agents)

Three capabilities **opt-in**, excluded from default install: **issue tracker** (`--tracker=github|linear`), **dependency updater** (`--dependency=renovate` or `--dependency=dependabot`, mutually exclusive), **cloud agents** (`--auto=claude|cursor|opencode`, ships phase-routed `bkit-cloud.yml` + cloud env scaffolding — `cloud-bootstrap.sh`, Cursor `Dockerfile`/`environment.json` — default install ships zero cloud footprint). Default wires none; post-install advisory emits `tracker-setup-none` / `dep-updater-none` / `cloud-router-none`. Choices persist in `package.json` (`bkit.issueTracker`, `bkit.depUpdater`, `bkit.cloudAgents`); `"none"` silences nudge. Cloud router split: each job inert without model-auth secret (`BKIT_ANTHROPIC_API_KEY` claude, `OPENCODE_PROVIDER_KEY` opencode) + GHA write permissions + (Cursor) dashboard trigger; depends on opt-in GitHub tracker. Decide: run install → pick via flags above → or set `"none"` to silence. Full rationale: `node_modules/@cbartens/bkit/README.md` § Optional post-install decisions. bkit-repo dogfoods neither updater by default.

### dogfood rule — updater PRs against workflows (only if you opt in)

bkit dogfoods templates: `.bkit/templates/.github/workflows/*.yml` (canonical) and `.github/workflows/*.yml` (bkit copy) must stay byte-equal where they overlap. Updater scans `.github/workflows/` only, not template path. Applies ONLY if bkit-repo opted into updater. When updater PR opens against bkit workflows:

1. Before merge, edit matching `.bkit/templates/.github/workflows/*.yml` with same SHA bump (one `Edit` per file).
2. Run `pnpm test` (`bkit-templates-content.test.ts` snapshot regenerates via `pnpm vitest run .bkit/src/bkit-templates-content.test.ts -u` if ci.yml shape changed; commit snapshot).
3. Push template-side change to updater PR branch (or follow-up commit on `dev` if branch read-only).

Consumers: no templates; `.github/workflows/ci.yml` Tier 3 (seed-or-print) → updater bumps survive install. `bkit-cloud.yml` Tier 1 (auto-overwrite) → consumers get new SHA pins on `bkit install`. Shipped `renovate.json5` has `matchFileNames: [".github/workflows/bkit-cloud.yml"]` + `enabled: false`; shipped `dependabot.yml` covers `github-actions` at `/` (consumers tune ignore patterns for bkit-managed files if needed).

---

## Triggering workflows

Three paths: Linear comment (cloud), Claude Code (interactive local), Cursor (interactive local). Same workflow from `.bkit/workflows/` — compute source and orchestrator model differ.

### From a tracker comment (cloud — Cursor Cloud Agent)

**Linear tracker:** `@cursor` in Linear comment with slash command + issue ID:

```
@cursor /bkit-plan ISSUE-123
@cursor /bkit-build ISSUE-123
@cursor /bkit-ship ISSUE-123
```

`@cursor` = **Cursor's standard Linear integration** — not bkit hook; bkit runs no Linear webhook. Native integration spawns Cloud Agent, posts session URL as Linear comment; agent runs bkit workflow because Cursor cloud agents read root `AGENTS.md`, routing `/bkit-*` to `.bkit/workflows/`. Progress in subsequent comments per step.

**GitHub tracker:** PR-label trigger — Cursor Automations "Pull request label changed". `bkit:auto` on PR (from `bkit-build`) triggers dispatch; phase label (`bkit:plan`, `bkit:build`, etc.) selects workflow. Issue comments via GitHub MCP. `/bkit-design` / `/bkit-plan` no PR → local-IDE-only on Cursor cloud for GitHub tracker.

**Requirements (Linear):** `Auto` label + non-terminal state. `BKIT_LINEAR_API_KEY`, `BKIT_CURSOR_API_KEY`, `BKIT_ANTHROPIC_API_KEY`, `BKIT_GH_TOKEN` in Cursor Cloud Agent dashboard.

**Requirements (GitHub):** `BKIT_GH_TOKEN`, `BKIT_CURSOR_API_KEY`, `BKIT_ANTHROPIC_API_KEY` in dashboard. Cursor GitHub App on repo/org. `GITHUB_ISSUE_ID` from PR body `<!-- bkit:issue=#NNN -->` — no manual setup.

### From Claude Code (interactive — local)

Slash commands at repo root:

```
/bkit-design ISSUE-123      # produce a design doc
/bkit-plan ISSUE-123        # produce an implementation plan
/bkit-build ISSUE-123       # execute the plan in a worktree, open a PR
/bkit-debug ISSUE-123       # diagnose and remediate CI failures
/bkit-ship ISSUE-123        # merge the PR for the current branch, archive, close the issue
```

Claude reads issue, comments, plan files via tracker MCP.

**Requirements:** `BKIT_GH_TOKEN`, active Claude Code session (subscription or `BKIT_ANTHROPIC_API_KEY`). `BKIT_LINEAR_API_KEY` when `bkit.issueTracker = "linear"`. Session model = orchestrator pin in `.bkit/prompts.md` § Orchestrators (`Claude` column) — set via `/model` before invoking; not duplicated here.

### From Cursor (interactive — local)

Cursor 2.4+ honours `.cursor/commands/bkit-*.md` and `.cursor/agents/bkit-*.md`:

```
/bkit-plan ISSUE-123
```

Orchestrator reads `.cursor/commands/` workflow. Subagents via `Task`, `model:` from frontmatter (no host override).

**Requirements:** `BKIT_GH_TOKEN` (GitHub, default) or `BKIT_LINEAR_API_KEY` (Linear). Cursor account in good standing.

---

## Adding or updating skills

> **Skills must be installed before first use** — initial setup in `docs/setup.md`. Inventory and registry rules: `.agents/skills.md`.

Skills = third-party instruction sets loaded at invocation.

```bash
npx skills find [query]           # search the registry
npx skills add <owner/repo> -y    # install project-locally into .agents/skills/
npx skills update                 # update all installed
```

Installed list: `.agents/skills.md`. Skills in `.agents/skills/` not listed → pruned by ship workflow archive step.

---

## Key files

<!-- prettier-ignore -->
| File | Purpose |
| --- | --- |
| `.agents/rules.md` | Universal agent rules — read first by every workflow |
| `.bkit/workflows.md` | Workflow pipeline reference (steps, verdicts, contracts) |
| `.bkit/prompts.md` | Per-subagent description, effort tier, model, `maxTurns` |
| `.agents/docs.md` | Document index and phase-matrix (what to read per phase) |
| `.agents/skills.md` | Installed skills registry |
| `.bkit/providers.md` | Host differences (Claude/Cursor/opencode), transform rules, additive install, provider model IDs, pin process (§ Selecting pins), network allowlist encodings (`.cursor/allowlist.json` vs baked settings) |
| `.bkit/friction.jsonl` | Friction ledger — orchestrator-observed recovery moments. Created on first append by a phase workflow, not by install; drained by `bkit harvest` only. Row shape: `.bkit/jsonl.md`. |
| `docs/plans/{YYYYMM}/` | Canonical month bucket — `{FID}-design.md`, `{FID}-plan.md` (+ `-N.md` if split). Files never move; `{YYYYMM}` = creation month at design start. Created by the design phase. |
| `docs/plans/{YYYYMM}/logs/{FID}/` | Per-run workflow logs (status, subagent outputs). Delete-eligible — bulk cleanup `rm -rf docs/plans/{YYYYMM}/logs/`. Canonical artifacts unaffected. |
| `docs/audits/` | Audit reports from `bkit-utility-audit-*` agents. Created on the first audit run. |
| `docs/roadmap.jsonl` | Issue-state ledger — appended at every phase close. Append-only. |
| `docs/roadmap.md` | Phase-sectioned board + analysis. No tracker list — a wired tracker shows its own issues. Two consumer `## Notes` blocks (above the bkit list, last after analysis) survive every regenerate. Consumer-owned — never seeded/overwritten by `bkit install` |
| `docs/deferrals.jsonl` | Deferred items |

### In the installed package, not your repo

`bkit install` does NOT copy these out of `node_modules`. Read them at the path below — a
bare `.bkit/comparison.md` or `.bkit/prompts/` in your own repo will not resolve.

<!-- prettier-ignore -->
| File | Purpose |
| --- | --- |
| `node_modules/@cbartens/bkit/.bkit/comparison.md` | Pipeline reference + comparison to agentic design patterns / peer frameworks |
| `node_modules/@cbartens/bkit/.bkit/workflows/` | Canonical slash-command source (rendered into `.claude/commands/`, `.cursor/commands/`, `.opencode/commands/`) |
| `node_modules/@cbartens/bkit/.bkit/prompts/` | Canonical subagent source (rendered into `.claude/agents/`, `.cursor/agents/`, `.opencode/agents/`) |
| `node_modules/@cbartens/bkit/.bkit/templates/` | Bootstrap files copied / managed by `bkit install` (see § What install writes) |
| `node_modules/@cbartens/bkit/dist/bkit-install.js` | Install engine — renders host outputs and applies templates (`.bkit/src/bkit-install.ts` is the TypeScript source, not shipped as such) |

---

## Editing workflows or prompts

Edit `.bkit/workflows/` (orchestrators) or `.bkit/prompts/` (subagents), then re-run install:

```bash
# Edit source
vim .bkit/workflows/bkit-build.md

# Regenerate (run dist binary; faster than tsx and matches what consumers run)
pnpm build && node dist/bkit-install.js install

# Commit both source and generated output together
git add .bkit/workflows/bkit-build.md .claude/commands/bkit-build.md .cursor/commands/bkit-build.md
git commit -m "chore: update build command"
```

New subagent? Update `.bkit/prompts.md` with row (frontmatter rationale + `maxTurns` calibration + model assignment) before re-run install — single source of truth for agent metadata; CI drift gate enforces consistency.
