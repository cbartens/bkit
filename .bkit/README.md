# bkit — Agent Workflow System

**bkit** wires Claude Code (and Cursor) into five-phase tracker-integrated cycle: `/bkit-design` → `/bkit-plan` → `/bkit-build` → `/bkit-debug` → `/bkit-ship`. Hosts additive: `.claude/` + `.cursor/` always render (direct Anthropic); `bkit install --opencode=<provider>` adds opencode for non-Anthropic backends — seven providers: `ollama-local`, `nvidia`, `groq`, `cerebras`, `openrouter`, `ollama` (cloud), `opencode` (opencode-native Zen gateway; auth via `OPENCODE_API_KEY`) — same harness, inference backend only changes (see `.bkit/providers.md` § Hosts + Providers).

README: what bkit does, install, env / tracker setup. Workflow internals: `.bkit/workflows.md`; subagent metadata (effort, model, tools, `maxTurns`): `.bkit/prompts.md`.

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
CURSOR_API_KEY=""
ANTHROPIC_API_KEY=""
GH_BKIT_TOKEN=""
```

**Linear tracker (`bkit install --tracker=linear`):**

```env
# ==========================================
# BKIT: LINEAR CURSOR CLAUDE GITHUB INTEGRATION
# ==========================================
LINEAR_API_KEY=""
LINEAR_WEBHOOK_SECRET=""
CURSOR_API_KEY=""
ANTHROPIC_API_KEY=""
GH_BKIT_TOKEN=""
```

<!-- prettier-ignore -->
| Variable | Tracker | Where read | Purpose |
| --- | --- | --- | --- |
| `GH_BKIT_TOKEN` | all | GitHub MCP server (`Authorization: Bearer`) | Issue/label/PR writes via MCP. Fine-grained PAT (Contents, PRs, Issues, Actions, Workflows, Metadata — R/W). |
| `GH_TOKEN` | all | `gh` CLI inside **CI workflow Bash only** (`GH_TOKEN: ${{ github.token }}`) | Not seeded in `.bkit/.env` — local `gh` uses `gh auth login` keyring (#287). |
| `GITHUB_ISSUE_ID` | github | Injected from PR body `<!-- bkit:issue=#NNN -->` | Linked GitHub issue. Injected automatically — do not set manually. |
| `ANTHROPIC_API_KEY` | all | Claude Code (headless / CI) | Required when Claude invoked outside interactive session (cloud automation, CI). |
| `CURSOR_API_KEY` | all | Cursor Cloud Agent dashboard / programmatic invocation | Required for non-interactive Cursor sessions. |
| `LINEAR_API_KEY` | linear | Preflight hooks (`.{claude,cursor}/hooks/preflight.sh`); workflow Linear MCP via OAuth fallback | Query issue state + labels for `Auto` gate; fail-fast if absent. |
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
| `model` | `claude-opus-4-8-thinking-high`, `composer-2.5`, `gpt-5.5-high`, `gpt-5.3-codex-high`, … | Cursor model the orchestrator runs on |
| `repo` | `<owner>/<consumer-repo>` | repo the agent operates in |

Per-agent model assignments: `.bkit/prompts.md` § Models; Cursor reads subagent frontmatter `model:` directly. Linear `model:*` sub-labels = **orchestrator-session** model only. Keep in sync with `.bkit/providers.md` § Cursor model catalog.

Full Linear ↔ Cursor setup: <https://linear.app/docs/cursor>.

---

## Distribution & install

Consumer install, auth (`GH_BKIT_TOKEN_INSTALL` / `.npmrc` / GHA / Vercel), CLI verbs (`install` / `check` / `doctor` / `uninstall` / `upgrade`) in root `README.md`.

`.agents/` = **canonical**. `bkit install` regenerates host outputs (`.claude/**`, `.cursor/**`) and rewrites bkit-managed blocks across consumer repo.

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
| **Tier 1 — Fully managed** | Idempotent rewrite of whole file on every install. Consumer should not edit directly. | `.cursor/hooks.json`, `.claude/hooks/preflight.sh`, `.cursor/hooks/preflight.sh`, `.vale/styles/House/**` |
| **Tier 2 — Managed-block** | bkit owns content between `bkit:start`/`bkit:end` markers. Consumer owns everything outside. File absent → write whole file. File present without markers → append block at EOF. | `.vale.ini`, `.gitignore`, `.prettierignore`, `rules.md`, `AGENTS.md`, `CLAUDE.md` |
| **Tier 3 — Seed-or-print** | Write if absent. If present, print suggested diff to stdout (never overwrite). | `.husky/pre-commit`, `.husky/pre-push` (v2.0.4+), `slop-scan.config.json`, `.cursor/settings.json`, `.github/workflows/ci.yml` |
| **Managed package.json keys** (v0.4.0) | Add-if-missing on `scripts` and `devDependencies`. Existing keys NEVER overwritten — consumer pins win. Drift via `bkit check` flags missing keys when parent module enabled. | All under `--typescript` (#265): `scripts.typecheck` / `format:check` / `lint:prose` / `lint:slop` / `slop:delta` / `prepare`; `devDependencies.prettier` + `slop-scan` + `lint-staged` + `husky`. Stack-agnostic `--ci` adds NO package.json keys. |

**Marker syntax** format-specific:

- Markdown / `.gitignore`: `<!-- bkit:start -->` / `<!-- bkit:end -->`
- YAML / INI / shell: `# bkit:start` / `# bkit:end`

Comment prefixes (`# `, `// `) before markers preserved on block updates.

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
| `.claude/commands/bkit-*.md` | claude | `.bkit/workflows/` (byte-identical) | Host pass — always overwrite |
| `.claude/agents/bkit-*.md` | claude | `.bkit/prompts/` (byte-identical) | Host pass — always overwrite |
| `.cursor/commands/bkit-*.md` | cursor | `.bkit/workflows/` (T1+T2 transforms) | Host pass — always overwrite |
| `.cursor/agents/bkit-*.md` | cursor | `.bkit/prompts/` (T3 transforms) | Host pass — always overwrite |
| `.github/workflows/ci.yml` | ci | `.bkit/templates/.github/workflows/ci.yml` | Tier 3 (seed-or-print); tokens substituted on first write |
| `.github/renovate.json5` | renovate | `.bkit/templates/.github/renovate.json5` | Tier 1 (canonical-overwrite). **Opt-in via `bkit install --dependency=renovate`** — not default. Phase-gated against `origin/<default-branch>`: Phase A lands file, prompts merge; Phase B (re-run after merge) prints GitHub App install URL. `baseBranches: ["dev"]` per bkit branch protection. **Mutually exclusive with `--dependabot`**. |
| `.github/dependabot.yml` | dependabot | `.bkit/templates/.github/dependabot.yml` | Tier 1 (canonical-overwrite). **Opt-in via `bkit install --dependency=dependabot`** — not default. First-party GitHub; no App install or phase gate. **Mutually exclusive with `--renovate`**. Less monorepo-aware than Renovate but no third-party trust surface. |
| `.bkit/scripts/bkit-set-dependabot.sh` | dependabot | `.bkit/templates/.bkit/scripts/bkit-set-dependabot.sh` | Tier 1 (canonical-overwrite), executable. Enables repo-level Dependabot state via `gh api`. Run once after `bkit install --dependency=dependabot`. |
| `.vale.ini` | ci | `.bkit/templates/.vale.ini` | Tier 3 (seed-or-print). Stack-agnostic (#265) → ships with `--ci`. |
| `.vale/styles/House/**` | ci | `.bkit/templates/.vale/styles/House/` | Tier 1 (fully managed). Ships with `--ci` (#265). |
| `slop-scan.config.json` | lint | `.bkit/templates/slop-scan.config.json` | Tier 3 (seed-or-print) |
| `.bkit/scripts/bkit-slop-type-suppression.mjs` | lint | `.bkit/templates/.bkit/scripts/bkit-slop-type-suppression.mjs` | Tier 1 (canonical-overwrite). Slop plugin — `--typescript` only (#265). |
| `.bkit/scripts/bkit-slop-delta.sh` | lint | `.bkit/templates/.bkit/scripts/bkit-slop-delta.sh` | Tier 1 (canonical-overwrite), executable. `slop:delta` gate helper — `--typescript` only (#265). |
| `.prettierignore` | lint | `.bkit/templates/.prettierignore` | Tier 2 hash-comment |
| `package.json#scripts.typecheck` | lint | hardcoded default (`tsc --noEmit` if `tsconfig.json` present, else skip-noop) | Managed-key (add-if-missing). TS-exclusive (moved ci→lint, #265). |
| `package.json#scripts.format:check` / `lint:prose` / `lint:slop` / `slop:delta` | lint | hardcoded defaults | Managed-key (add-if-missing) |
| `package.json#devDependencies.prettier` / `slop-scan` / `lint-staged` | lint | hardcoded version-specs (`^3.5.3`, `^0.3.0`, `^15.2.10`) | Managed-key (add-if-missing) |
| `.husky/pre-commit` | git-hooks | `.bkit/templates/.husky/pre-commit` | Tier 3 (seed-or-print, v2.0.4+) |
| `.husky/pre-push` | git-hooks | `.bkit/templates/.husky/pre-push` | Tier 3 (seed-or-print, v2.0.4+) |
| `package.json#scripts.prepare` | git-hooks | hardcoded default (`husky install`) | Managed-key (add-if-missing) |
| `package.json#devDependencies.husky` | git-hooks | hardcoded version-spec (`^9.1.7`) | Managed-key (add-if-missing) |
| `.cursor/hooks.json` | cursor | `.bkit/templates/.cursor/hooks.json` | Tier 1 (fully managed) |
| `.cursor/settings.json` | cursor | `.bkit/templates/.cursor/settings.json` | Tier 3 (seed-or-print) |

### Optional post-install decisions (tracker + dependency updater + cloud agents)

Three capabilities **opt-in**, excluded from default install: **issue tracker** (`--tracker=github|linear`), **dependency updater** (`--dependency=renovate` or `--dependency=dependabot`, mutually exclusive), **cloud agents** (`--auto=claude|cursor|opencode`, ships phase-routed `bkit-cloud.yml` + cloud env scaffolding — `cloud-bootstrap.sh`, Cursor `Dockerfile`/`environment.json` — default install ships zero cloud footprint). Default wires none; post-install advisory emits `tracker-setup-none` / `dep-updater-none` / `cloud-router-none`. Choices persist in `package.json` (`bkit.issueTracker`, `bkit.depUpdater`, `bkit.cloudAgents`); `"none"` silences nudge. Cloud router split: each job inert without model-auth secret (`ANTHROPIC_API_KEY` claude, `OPENCODE_PROVIDER_KEY` opencode) + GHA write permissions + (Cursor) dashboard trigger; depends on opt-in GitHub tracker. Consumer rationale + decide/silence flow: root `README.md` § Optional post-install decisions. bkit-repo dogfoods neither updater by default.

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

**Requirements (Linear):** `Auto` label + non-terminal state. `LINEAR_API_KEY`, `CURSOR_API_KEY`, `ANTHROPIC_API_KEY`, `GH_BKIT_TOKEN` in Cursor Cloud Agent dashboard.

**Requirements (GitHub):** `GH_BKIT_TOKEN`, `CURSOR_API_KEY`, `ANTHROPIC_API_KEY` in dashboard. Cursor GitHub App on repo/org. `GITHUB_ISSUE_ID` from PR body `<!-- bkit:issue=#NNN -->` — no manual setup.

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

**Requirements:** `GH_BKIT_TOKEN`, active Claude Code session (subscription or `ANTHROPIC_API_KEY`). `LINEAR_API_KEY` when `bkit.issueTracker = "linear"`. Session model = orchestrator pin in `.bkit/prompts.md` § Orchestrators (Opus 4.8 for `/design` / `/plan` / `/debug`; Sonnet 4.6 for `/build` / `/ship`).

### From Cursor (interactive — local)

Cursor 2.4+ honours `.cursor/commands/bkit-*.md` and `.cursor/agents/bkit-*.md`:

```
/bkit-plan ISSUE-123
```

Orchestrator reads `.cursor/commands/` workflow. Subagents via `Task`, `model:` from frontmatter (no host override).

**Requirements:** `GH_BKIT_TOKEN` (GitHub, default) or `LINEAR_API_KEY` (Linear). Cursor account in good standing.

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
| `.bkit/providers.md` | Host differences (Claude/Cursor/opencode), transform rules, additive install, provider model IDs |
| `.bkit/comparison.md` | Pipeline reference + comparison to agentic design patterns / peer frameworks (repo-local, not seeded) |
| `.bkit/friction.jsonl` | Friction ledger — orchestrator-observed recovery moments. Appended by phase workflows at runtime (not seeded); drained by `bkit harvest` only. Row shape: `.bkit/jsonl.md`. |
| `.bkit/workflows/` | Canonical slash-command source (regenerated into `.{claude,cursor}/commands/`) |
| `.bkit/prompts/` | Canonical subagent source (regenerated into `.{claude,cursor}/agents/`) |
| `.bkit/templates/` | Bootstrap files copied / managed by `bkit install` (see § What install writes) |
| `.bkit/src/bkit-install.ts` | Install script — regenerates host outputs and applies templates |
| `docs/plans/{YYYYMM}/` | Canonical month bucket — `{FID}-design.md`, `{FID}-plan.md` (+ `-N.md` if split). Files never move; `{YYYYMM}` = creation month at design start. |
| `docs/plans/{YYYYMM}/logs/{FID}/` | Per-run workflow logs (status, subagent outputs). Delete-eligible — bulk cleanup `rm -rf docs/plans/{YYYYMM}/logs/`. Canonical artifacts unaffected. |
| `docs/audits/` | Audit reports from `bkit-utility-audit-*` agents |
| `docs/completed.md` | Shipped features index |
| `docs/deferrals.jsonl` | Deferred items |

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
