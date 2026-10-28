# bkit — Agent Workflow System

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

**bkit** wires Claude Code, Cursor, Codex, Google Antigravity and opencode into five-phase tracker-integrated cycle: `/bkit-design` → `/bkit-plan` → `/bkit-build` → `/bkit-debug` → `/bkit-ship`. Hosts additive, one flag each: `--claude`, `--cursor`, `--codex`, `--antigravity`, `--opencode=<provider>` — opencode providers: `openrouter`, `ollama`, `opencode-zen` + `opencode-go` (opencode-native gateways; auth via `BKIT_OPENCODE_API_KEY`). Same harness on every host; state lives in the repo, so a feature moves between hosts mid-run (see `.bkit/providers.md` § Hosts + Providers).

README: what bkit does, env / tracker setup, upgrade paste + ongoing CLI. First-time install/auth deep-dive: `.bkit/install.md`. Workflow internals: `.bkit/workflows.md`; subagent metadata (effort, model, tools, `maxTurns`): `.bkit/prompts.md`.

---

## How a workflow runs (end-to-end example)

Typical cycle for `ISSUE-123` "Add feature X":

1. **Tracker issue** with **`bkit:auto`** label + non-terminal state (`Backlog`, `In Progress`).
2. **Trigger** — tracker comment (`@cursor /bkit-plan ISSUE-123`) or slash command (`/bkit-plan ISSUE-123`).
3. **Workflow Step 1** — preflight checks `bkit:auto`, acquires `.lock`, sets `bkit:plan` + `In Progress`, creates workflow comment.
4. **Step 2 — worktree** — git worktree at `.worktrees/issue-123-add-feature/` on `feat/issue-123-add-feature`, cut from `origin/dev` (local `dev` when it holds unpushed commits on top). Copies each `bkit.workflows.worktree.copy` path from the main checkout (a `package.json` setting; default `.env`, `.env.local`; exact paths, folders copy recursively; a missing one is logged, never fatal), links `.bkit/.env` (bkit's own token file) to the main checkout's copy so a worktree can sign in, runs `direnv allow` when the worktree's `.envrc` matches the main checkout's, then `pnpm install --frozen-lockfile` unless `bkit.workflows.worktree.install: false`.
5. **Phase steps** — dispatches subagents (`@bkit-plan-generate`, then `@bkit-plan-review-1` ‖ `-2` ‖ `@bkit-plan-scope-check` in parallel, etc.). Each writes `docs/plans/{YYYYMM}/logs/{FID}/` (`{YYYYMM}` = canonical month bucket at design start), appends fenced section to tracker comment.
6. **Phase summary** — `bkit workflows summary` writes it from the run's status rows; verdict (`PASS` / `CONCERNS` / `FAIL`); commit `chore(issue-123-…): summary bkit [skip ci]` (design/plan) or `chore(issue-123-…): summary` (build/debug/ship) → push.
7. **Close Workflow** — tracker `In Review`; phase label persists. `/bkit-design` / `/bkit-plan`: prune worktree, delete `feat/issue-123-…` (merged into `dev`). `/bkit-build` / `/bkit-debug`: worktree persists.
8. **Human review** — design/plan at `docs/plans/{YYYYMM}/{FID}-{design,plan}.md` (canonical). Reviewer re-triggers or progresses to `/bkit-build`.
9. **`/bkit-build`** — re-creates worktree, executes plan test-first (each task's tests fail before its code, then pass), lint/typecheck/unit tests, opens PR to `dev`.
10. **CI** on PR. Red → `/bkit-debug` (PR mode: `gh run view --log-failed`). Green → `/bkit-ship`.
11. **`/bkit-ship`** — squash-merge PR, `@bkit-ship-update-docs` then the ship summary on `dev`, prune worktree, issue `In Review` (`bkit:merged`; bkit never auto-closes). Plans stay at `docs/plans/{YYYYMM}/` — no archive move.

Throughout: workflows hold `.lock`, write `status.jsonl` (resume SoT), own tracker MCP calls — subagents are leaves (no tracker access), writes scoped by `tools:` allowlist.

Every point where a run can ask you has two settings under `bkit.workflows` in `package.json`: `ask` (stop and ask, or carry on with the recommendation) and a hard limit (`maxAttempts`, or `maxTurns` for the design grill). Defaults: `ask: true` everywhere, 2 attempts, 6 grill turns. A limit used up always ends in the Failure Path, and a question never resets a count. With `ask: false`, or in a headless GitHub Actions run, the run takes each recommendation and records any `Accept` as assumed; `/bkit-ship` asks you to confirm assumed items and writes the ones you don't confirm as `needs-decision` deferrals. `.bkit/workflows.md` § Ask points.

Plans are sized by `bkit.workflows.tasks` in `package.json`: up to `bkit.workflows.tasks.maxPerGroup` tasks (default 3) and `bkit.workflows.tasks.maxTestsPerGroup` TEST FIRST tests (default 15) per group; per task `bkit.workflows.tasks.maxTestsPerTask` tests (default 10) across `bkit.workflows.tasks.maxTestFilesPerTask` test files (default 3). Install and upgrade write the defaults when missing; a value already set is never touched; a value that is not a whole number of 1 or more falls back to its default and `bkit check` says so. `.bkit/workflows.md` § Test-first.

---

## The five phases

<!-- prettier-ignore -->
| Phase | Command | Steps | Output | Hard stop? |
| --- | --- | --- | --- | --- |
| Design | `/bkit-design` | 12 | `docs/plans/{YYYYMM}/{FID}-design.md` | Yes — review before plan |
| Plan | `/bkit-plan` | 8 | `docs/plans/{YYYYMM}/{FID}-plan.md` | Yes — review before build |
| Build | `/bkit-build` | 15 | PR to `dev` | No — CI continues |
| Debug | `/bkit-debug` | 11 | Remediation commit on feature branch | No |
| Ship | `/bkit-ship` | 14 | Squash-merged PR, issue `In Review` + `bkit:merged` (plans stay canonical at `docs/plans/{YYYYMM}/`) | Yes |

**Where an issue starts.** Issue body + comments = every workflow's first input; shapes and machine-read lines: `.bkit/trackers.md` § Issue shapes; example forms: `.bkit/templates.md` § Issue forms.

<!-- prettier-ignore -->
| Issue | Start with |
| --- | --- |
| Idea — how it should work still open | `/bkit-design` |
| Change — what to build and "done" known | `/bkit-plan`; or `/bkit-build` / `build:lite` with no plan (`/bkit-build` first writes `{FID}-plan.md` from the issue, then checks each `TEST FIRST` red; an existing plan wins over the issue; `build:lite` checks nothing) |
| Bug — a test or CI run already fails | `/bkit-debug`, on the branch the fix lands on |
| Bug — nothing fails yet | `/bkit-debug [repro]` (writes a failing test first, then fixes) |

**Per-step detail, verdict routing, retry / timeout constants, label flips, status.jsonl shape, comment lifecycle:** `.bkit/workflows.md`.

**Per-subagent scope, effort tier, tool surface, `maxTurns`, model assignment:** `.bkit/prompts.md`.

---

## Audits

No `/bkit-audit` command and no phase label. More than 30 procedures ship as `docs/templates/bkit-audit-*.md`. Invoke `@bkit-audit-generate` and name exactly one template.

<!-- prettier-ignore -->
| Item | Contract |
| --- | --- |
| Report | `docs/audits/{YYYYMM}/{slug}.md`. `{slug}` = template basename without `bkit-audit-`. Same slug already in that month → `{slug}-{TIMESTAMP}.md` (`date -u +%Y%m%dT%H%M%SZ`). Never overwrite. |
| Writes | The report (template through `bkit:end`) and that template's `Project Instructions` below `bkit:end`. Product code, config, and other docs stay untouched. Fixing findings starts at `/bkit-plan`. |
| Issue comment | Invocation names an issue (`#123`, `ABC-123`) and a tracker is wired → the final summary lands on it as one comment, stopped runs included. Never files, edits, or relabels issues. |
| Audit parent | One standing issue per template; every run of that template reports to it and its filed issues become its sub-issues (`.bkit/trackers.md` § Issue shapes). No issue named + tracker wired → the agent searches for it and posts the summary there; none open → the final message suggests one, ready to file, plus the saved summary to post as its first comment. |
| Plan input | `/bkit-plan` takes a design doc, one or more reports, or both. The issue names a report with an `**Audit reports:**` line; the session prompt or issue names which findings to plan (for example only `CRITICAL` and `HIGH`). The rest of each report stays context. |

Each template's `Purpose` is its scope. Main ones: security, privacy, accessibility, architecture, performance, reliability, testing, database, LLM, cost. Full catalogue: `.bkit/prompts.md` § Audit (Ad-hoc).

---

## Prerequisites

### Required tools

<!-- prettier-ignore -->
| Tool | Version | Used for |
| --- | --- | --- |
| Node | >= 24 (`engines.node`) | Runs the bkit CLI. |
| `pnpm` | matches `package.json` `packageManager` | Required in every consumer repo, whatever the stack: bkit installs and upgrades itself with pnpm, which makes the repo a pnpm repo. Runs the worktree install (`pnpm install --frozen-lockfile`) and the `bkit:gate:*` scripts. Non-Node stack → stub `package.json` whose `bkit:gate:*` scripts wrap the stack's own commands (e.g. `ruff check && pytest`). Also bkit CLI (`bkit install`; `pnpm tsx .bkit/core/engine/cli.ts` in bkit dev). |
| `gh` | latest, authenticated | PR create / view / merge in `/bkit-build`, `/bkit-debug`, `/bkit-ship` |
| `git` >= 2.5 | — | Worktree operations |
| `jq` | latest | Reads the JSON that `bkit` commands print, in workflow Bash |
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

**Jira tracker (`bkit install --tracker=jira`, local runs only):**

```env
# ==========================================
# BKIT: JIRA GITHUB INTEGRATION
# ==========================================
BKIT_JIRA_API_KEY=""
BKIT_GH_TOKEN=""
```

<!-- prettier-ignore -->
| Variable | Tracker | Where read | Purpose |
| --- | --- | --- | --- |
| `BKIT_GH_TOKEN` | all | GitHub MCP server (`Authorization: Bearer`) | Issue/label/PR writes via MCP. Fine-grained PAT when every target repo sits under one owner (Contents, PRs, Issues, Actions, Workflows, Metadata — R/W); classic PAT when one token must span owners (scopes `repo`, `workflow`, `read:org`, `project`, `security_events`). |
| `GH_TOKEN` | all | `gh` CLI inside **CI workflow Bash only** (`GH_TOKEN: ${{ github.token }}`) | Not seeded in `.bkit/.env` — local `gh` uses `gh auth login` keyring. |
| `GITHUB_ISSUE_ID` | github | Injected from PR body `<!-- bkit:issue=#NNN -->` | Linked GitHub issue. Injected automatically — do not set manually. |
| `BKIT_ANTHROPIC_API_KEY` | all | Claude Code (headless / CI) | Required when Claude invoked outside interactive session (cloud automation, CI). |
| `BKIT_CURSOR_API_KEY` | all | Cursor Cloud Agent dashboard / programmatic invocation | Required for non-interactive Cursor sessions. |
| `BKIT_LINEAR_API_KEY` | linear | Preflight hooks (`.{claude,cursor}/hooks/bkit-preflight.sh`); workflow Linear MCP via OAuth fallback | Query issue state + labels for `Auto` gate; fail-fast if absent. |
| `BKIT_JIRA_API_KEY` | jira | Jira MCP server (`Authorization: Bearer`) | Atlassian MCP V2 scoped API token; site admin enables API-token sign-in for the Rovo MCP server first. Setup: `.bkit/trackers.md` § jira. |
| `LINEAR_WEBHOOK_SECRET` | linear | Linear → Cursor integration backend | Verifies webhook signatures on `@cursor` mentions. Set in Linear ↔ Cursor integration config. |

`GITHUB_ISSUE_ID` (GitHub) and `LINEAR_ISSUE_ID` (Linear) set automatically by workflow context — do not set manually.

### Tracker workspace setup

One custom label (`Auto`), plus integration label families. Setup depends on configured tracker.

#### Bkit custom label (`Auto`)

- **`Auto`** — issues approved for agent work. Preflight refuses if absent or terminal state (`Done` / `Cancelled` / closed). Add before any cloud / automation session.
  - **GitHub:** issue label `bkit:auto`. `bkit install --tracker=github` seeds via GitHub MCP on first run.
  - **Linear:** Linear label `Auto`. Add manually to workspace.

#### Phase labels (GitHub tracker)

`bkit.tracker.default = "github"` → Cursor reads PR phase label for dispatch: `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`. Cursor GitHub App on repo/org required. `/bkit-design` / `/bkit-plan` have no PR — local-IDE-only on Cursor cloud.

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

First-time install and upgrade, uninstall: `.bkit/install.md`. Ongoing ops below.

### Upgrade — paste into your AI

Prefer `bkit upgrade --latest` (bumps package **and** resyncs managed files) — do **not** only `pnpm add`.

````text
Upgrade `@cbartens/bkit` to the latest version in this repo and finish the resync.
1. Bump and resync in one step (no token — npmjs is public). If `bkit` is not on PATH, use `pnpm bkit`:
   ```bash
   bkit upgrade --latest
   ```
   Do **not** only `pnpm add @cbartens/bkit@latest` — that refreshes the package without resyncing managed files.
2. Read `.bkit/advisories.md` end-to-end. For every `[advisory]`/`[blocker]`: apply its **Action** unless truly N/A. If you skip, state advisory id and why.
3. Read the template changes `bkit upgrade` printed (or `git diff .bkit/templates`), then `.bkit/templates.md`. bkit never applies templates, so adoption is your job: adopt each change unless it would break existing functionality. For any change not adopted, state which and why.
4. Re-run `bkit check` (or `pnpm bkit check`). Fix remaining drift/advisories you can. End with: resolved version, advisories applied, advisories skipped (with reasons), templates adopted/skipped (with reasons).
````

### Ongoing CLI

```bash
bkit upgrade              # re-render at CURRENT installed version (offline)
bkit upgrade --latest     # bump @cbartens/bkit + resync in one step (or --to=<version>)
bkit check                # drift gate — exits non-zero on drift
bkit doctor               # advisories only; exits 0; no managed-file writes
bkit tips [--all]         # what is not set up yet, most useful first; exits 0
bkit stats                # this repo's stats report, agent context peaks included → .bkit/stats.md (commit it); exits 0
bkit install --claude --cursor               # (re)seed hosts; name ≥1 module
```

**Outdated-version warning:** Step 1 of every phase workflow (`bkit repo info`) and every design / plan / audit doc stamp compare `.bkit/version` `pinnedVersion` with the newest published `@cbartens/bkit`; older → a warning naming the upgrade command, and stamped docs carry a visible `Outdated bkit` line under their `bkit:anchor` block. Never a stop. Registry asked at most once a day (cache: `<git common dir>/bkit-latest-version.json`); offline → no warning. `BKIT_NO_UPDATE_CHECK=1` skips the lookup (air-gapped machines, CI).

> **⚠️ Version bumps:** use `bkit upgrade --latest` (or `--to=<version>`). Bare `pnpm add @cbartens/bkit` / Renovate bumps refresh lockfile only — run `bkit upgrade` after and commit resync with the bump, or `bkit check` reds CI.

### Dogfood path (this repo only)

bkit repo runs install script via `tsx` instead of published bin:

```bash
pnpm tsx .bkit/core/engine/cli.ts install
pnpm tsx .bkit/core/engine/cli.ts check
```

CI drift gate (`.github/workflows/bkit-ci.yml`) fails PR if generated files diverge from `install` output.

## File ownership

bkit owns some files outright, owns one part of others, and ships the rest as templates it never applies.

<!-- prettier-ignore -->
| Kind | Semantics | Files |
| --- | --- | --- |
| **Tier 1 — Fully managed** | Idempotent rewrite of whole file on every install. A consumer edit is overwritten. Uninstall deletes the file while it still matches the hash bkit recorded. | `.cursor/hooks.json`, `.bkit/*.md` (except `prompts.md` and `lite.md`, Tier 2), `.bkit/.env.example`, `.bkit/allowlist.json`, `.cursor/cli.json` |
| **Tier 2 — Managed-block** | bkit owns content between `bkit:start`/`bkit:end` markers. Consumer owns everything outside. File absent → write whole file. File present without markers → append block at EOF, unless the markdown file already holds an older unmarked copy of the block (its `# ` title plus 10+ long lines verbatim) → warn + skip. A full uninstall strips the block and deletes a file left with nothing else; `docs/templates/bkit-*.md` are bkit's whole and are deleted. | `docs/*.md`, `docs/templates/bkit-*.md`, `.gitignore`, `.agents/rules.md`, `.agents/context.md`, `.agents/docs.md`, `.agents/skills.md`, `AGENTS.md`, `CLAUDE.md`, `.claude/hooks/bkit-preflight.sh`, `.cursor/hooks/bkit-preflight.sh`, `.claude/hooks/bkit-gateguard.cjs`, `.cursor/hooks/bkit-gateguard.cjs`, `.opencode/plugin/bkit-gateguard.js`, `.cursor/hooks/bkit-guardrails.cjs`, `.codex/hooks/bkit-gateguard.cjs`, `.codex/hooks/bkit-guardrails.cjs` |
| **Shared JSON** | bkit owns the keys its template sets; every other key is yours. `.mcp.json` / `.cursor/mcp.json`: bkit owns exactly one entry, `mcpServers.<tracker>`, and resets it to the template on every install and upgrade. | `.claude/settings.json`, `.opencode/opencode.json`, `.mcp.json`, `.cursor/mcp.json` |
| **Seeded package.json scripts** | Every install and upgrade adds a missing name with bkit's default; a name already present is never touched, whatever its value. `bkit check` reports a missing name. Uninstall leaves them. | `scripts.bkit:gate:format` / `bkit:gate:static` / `bkit:gate:static-unit` / `bkit:gate:install-static-unit-build` / `bkit:deps:outdated` / `bkit:deps:audit` |
| **Seeded bkit settings** | Every install and upgrade writes every `bkit` setting, so each one is visible where you look for it. A missing key gets its default; a choice not made yet (tracker, cloud agents, board, opencode provider) gets `""` or `[]`, which reads the same as absent. A key already present is never touched, whatever its value; nested blocks get their missing keys. `bkit check` reports a missing key. | every key under `bkit`: `SEEDED_BKIT_DEFAULTS` in `.bkit/core/engine/install/modules/core.ts` |
| **Templates** | Never written into your repo. Install and upgrade copy them, raw, into `.bkit/templates/`; you copy what you want and own it. Catalog: `.bkit/templates.md`. | `.github/workflows/bkit-ci.yml`, `.github/workflows/bkit-cloud.yml`, `.husky/*`, `.vale.ini`, `.vale/styles/House/*`, `.lintstagedrc.json`, `slop-scan.config.json`, `.oxlintrc.json`, `.prettierignore`, `.envrc`, `.cursor/{settings.json,environment.json,Dockerfile}`, dependency-updater examples, `.github/workflows/bkit-trivy.yml`, the per-provider context-fetch blocks (`context/bkit-*.md`), `scripts/slop/bkit-slop-type-suppression.mjs`. Also the tool `package.json` scripts (`typecheck`, `lint`, `format:check`, `lint:prose`, `lint:slop`, `slop:delta`, `prepare`) and devDeps (prettier, slop-scan, lint-staged, husky): `.bkit/templates.md` lists them, install never adds them. |

**Marker syntax** format-specific:

- Markdown: `<!-- bkit:start -->` / `<!-- bkit:end -->`
- Shell / `.gitignore` / `.gitattributes`: `# <!-- bkit:start -->` / `# <!-- bkit:end -->`
- JS / TS ES modules: `// bkit:start` / `// bkit:end` (HTML comments are a syntax error in an ES module)

Comment prefixes (`# `, `// `) before markers preserved on block updates.

**Managed-version marker.** Every non-JSON file bkit writes carries `bkit:managed vX.Y.Z` — first line inside the `bkit:start` block, or near the top of a whole file — in its comment syntax: `<!-- … -->` (markdown), `# <!-- … -->` (shell, `.gitignore`, `.gitattributes`, `.env.example`, TOML), `// …` (JS). The full MIT text and copyright notice travel at `.bkit/LICENSE.md`. Install and upgrade restamp it; `bkit check` reports `bkit-managed-stale` for a marker that differs from the installed version (blocker on `main` / `dev`, advisory on feature branches). Templates carry no marker and no block.

**Hook scripts.** Install generates each host's `bkit-preflight.sh`, `gateguard`, `readguard`, `guardrails` and `rules` hook from its template plus the code the hosts share (`.bkit/core/hooks/`, `.bkit/providers.md` § Hooks). bkit's block in the `bkit-gateguard` / `bkit-readguard` / `bkit-rules` hooks and plugins and the `bkit-guardrails.cjs` hooks is a pure advisory engine — no stdin read, no stdout write, no top-level call — so it cannot collide with a consumer's own emitter. Delivery is per host: Claude / Cursor / Codex inject the checklist before the edit, opencode appends it to the tool result in `execute.after` (`BKIT_GATEGUARD=deny` is the only pre-edit block); the rules-read advisory rides the two `bkit-preflight.sh` hooks at session start and the `bkit-rules` hook at the first tool call — see `.bkit/providers.md` § Hooks. A consumer file with no markers gets the block appended; wire its exported function into your driver.

### What install writes

<!-- prettier-ignore -->
| Path | Module | Source | Tier |
| --- | --- | --- | --- |
| `.agents/{rules,docs,context,skills}.md` | core | `.bkit/core/.agents/` | Tier 2 html-comment (via the core payload pass — not the additive `.agents/` copy). Consumer `context-fetch`, `allowed-domains` and `mcp-servers` blocks live below `bkit:end` in `context.md`; `Project Skills` below `bkit:end` in `skills.md`. |
| `.bkit/version` | core | package.json version | Written last (partial installs detectable) |
| `.bkit/allowlist.json` | core | derived from bkit's shipped egress registry, union `.agents/context.md` allowed-domains | Tier 1 (canonical-overwrite). Curl/wget host allowlist every host's `bkit-guardrails.cjs` reads at runtime. |
| `.gitignore` | core | `.bkit/shared/gitignore` | Tier 2 html-comment |
| `AGENTS.md` | core | `.bkit/core/AGENTS.md` | Tier 2 html-comment |
| `CLAUDE.md` | claude | `.bkit/shared/CLAUDE.md` | Tier 2 html-comment |
| `docs/*.md` (blocks) | core | `.bkit/shared/docs/` | Tier 2 html-comment |
| `docs/templates/bkit-*.md` | core | `.bkit/core/docs/templates/` | Tier 2 html-comment |
| `.gitattributes` | core | `.bkit/shared/.gitattributes` | Tier 2 html-comment (`merge=union` for the append-only ledgers) |
| `.bkit/templates/**` | — | the whole `.bkit/templates/` root | Raw copies, refreshed on every install and upgrade; never hashed. Upgrade prints the changed paths. |
| `.bkit/{core,shared}` | core | symlink into `node_modules/@cbartens/bkit/.bkit/{core,shared}` | View link, not a copy — browse the payload in-repo; always the installed version. Gitignored (dangles on a fresh clone / CI; install recreates). A real directory is never clobbered; `bkit uninstall` removes the link. |
| `.bkit/{authoring,cloud,comparison,install,jsonl,LICENSE,lite,pipeline,providers,prompts,router,trackers,workflows,README}.md` | core | `.bkit/core/.bkit/` | Tier 1 (canonical-overwrite); `prompts.md` and `lite.md` Tier 2 html-comment. The reference docs agents read at runtime (`router.md`: the workflow router `AGENTS.md` sends `bkit-{command}` prompts to), plus `LICENSE.md`: the MIT text and copyright notice that travel with every file bkit writes. |
| `.claude/commands/bkit-*.md` | claude | `.bkit/core/workflows/` (byte-identical) | Host pass — always overwrite |
| `.claude/agents/bkit-*.md` | claude | `.bkit/core/prompts/` (byte-identical) | Host pass — always overwrite |
| `.claude/settings.json` | claude | `.bkit/shared/.claude/settings.json` | Tier 2 JSON deep-containment. Permission allow/deny/ask + SessionStart / PreToolUse hook wiring. |
| `.claude/hooks/bkit-preflight.sh` | claude | `.bkit/core/.claude/hooks/` | Tier 2 html-comment (`# ` prefix) |
| `.claude/hooks/bkit-gateguard.cjs` | claude | `.bkit/core/.claude/hooks/` | Tier 2 slash-comment |
| `.claude/hooks/bkit-readguard.cjs` | claude | `.bkit/core/.claude/hooks/` | Tier 2 slash-comment. Repeat-read advisory. |
| `.mcp.json` | claude | `.bkit/shared/.mcp.json` | Shared JSON: bkit owns `mcpServers.<tracker>` only; absent file → the tracker-filtered render |
| `.bkit/.env.example` | claude | `.bkit/shared/.bkit/.env.example` | Tier 1 (fully managed). Real values go in `.bkit/.env`. |
| `.cursor/commands/bkit-*.md` | cursor | `.bkit/core/workflows/` (T1+T2 transforms) | Host pass — always overwrite |
| `.cursor/agents/bkit-*.md` | cursor | `.bkit/core/prompts/` (T3 transforms) | Host pass — always overwrite |
| `package.json#scripts.bkit:gate:format` / `bkit:gate:min` / `bkit:gate:static` / `bkit:gate:static-unit` / `bkit:gate:install-static-unit-build` | core | hardcoded defaults | Seeded (add-if-missing; install and upgrade). What hooks, workflows and prompts run; the name states which tiers. The tool scripts the defaults chain (`typecheck`, `lint`, `format:check`, `lint:prose`, `slop:delta`) and their devDeps are templates: `.bkit/templates.md`. |
| `package.json#scripts.bkit:deps:outdated` / `bkit:deps:audit` | core | hardcoded defaults | Seeded (add-if-missing; install and upgrade). Read-only dependency inspection the remediate / diagnose agents call. |
| `package.json#bkit` (every key) | core | `SEEDED_BKIT_DEFAULTS` | Seeded (add-if-missing, nested blocks included; install and upgrade). Defaults where a key has one; `""` / `[]` for a choice not made yet. |
| `.cursor/hooks.json` | cursor | `.bkit/shared/.cursor/hooks.json` | Tier 1 (fully managed) |
| `.cursor/mcp.json` | cursor | `.bkit/shared/.cursor/mcp.json` | Shared JSON: bkit owns `mcpServers.<tracker>` only |
| `.cursor/rules/bkit-rules.mdc` | cursor | `.bkit/shared/.cursor/rules/bkit-rules.mdc` | Tier 2 html-comment |
| `.cursor/hooks/bkit-preflight.sh` | cursor | `.bkit/core/.cursor/hooks/` | Tier 2 html-comment (`# ` prefix) |
| `.cursor/hooks/bkit-guardrails.cjs` | cursor | `.bkit/core/.cursor/hooks/` | Tier 2 slash-comment. Destructive-op + curl/wget host gates. |
| `.cursor/hooks/bkit-gateguard.cjs` | cursor | `.bkit/core/.cursor/hooks/` | Tier 2 slash-comment |
| `.cursor/hooks/bkit-readguard.cjs` | cursor | `.bkit/core/.cursor/hooks/` | Tier 2 slash-comment. Repeat-read advisory. |
| `.cursor/cli.json` | cursor | derived from `.agents/context.md` mcp-servers | Tier 1 (canonical-overwrite). Cursor CLI / cloud-agent `Mcp(<server>:*)` allows. |
| `.opencode/opencode.json` | opencode | `.bkit/shared/.opencode/opencode.json` | Tier 2 JSON deep-containment; `@@OPENCODE_*@@` sentinels rendered to the chosen tracker + provider. **Opt-in via `bkit install --opencode=<provider>`**. |
| `.opencode/commands/bkit-*.md` | opencode | `.bkit/core/workflows/` | Host pass — always overwrite |
| `.opencode/agents/bkit-*.md` | opencode | `.bkit/core/prompts/` | Host pass — always overwrite |
| `.opencode/plugin/bkit-gateguard.js` | opencode | `.bkit/core/.opencode/plugin/` | Tier 2 slash-comment |
| `.opencode/plugin/bkit-readguard.js` | opencode | `.bkit/core/.opencode/plugin/` | Tier 2 slash-comment. Repeat-read advisory. |
| `.claude/hooks/bkit-cloud-bootstrap.sh` | — | `.bkit/templates/.claude/hooks/` | Copy-and-own template: no module writes it; adopt it from `.bkit/templates/` (the SessionStart entry runs it only when present). |

The cloud workflow and the Cursor Background Agent files are templates the `--auto` setup advisory points at.

### Optional post-install decisions (tracker + cloud agents)

Two capabilities **opt-in**, excluded from default install: **issue tracker** (`--tracker=github|linear|jira`), **cloud agents** (`--auto=claude|cursor|opencode`: records the choice and points at the copy-and-own templates — `bkit-cloud.yml`, `.claude/hooks/bkit-cloud-bootstrap.sh`, and the Cursor `Dockerfile`/`environment.json`; default install ships zero cloud footprint). Default wires neither; post-install advisory emits `tracker-setup-none` / `cloud-router-none`. Choices persist in `package.json` (`bkit.tracker.default`, `bkit.cloud.agent`; install seeds `""` = undecided); `"none"` silences the nudge. Cloud router split: each job inert without model-auth repo secret (`ANTHROPIC_API_KEY` claude, `OPENCODE_PROVIDER_KEY` opencode) + GHA write permissions + (Cursor) dashboard trigger; depends on opt-in GitHub tracker.

**Dependency updaters.** Copy one example and own it: `.bkit/templates/.github/renovate.json5`, `.bkit/templates/.github/workflows/bkit-renovate.yml` (self-hosted runner only), or `.bkit/templates/.github/dependabot.yml`. `bkit.dependencies.updater: "none"` skips the install-time absence advisory. `bkit check` emits `dep-updater-absent` and `dep-updater-both`. See `docs/deployments.md` § Dependency updaters.

**Security scan.** `.bkit/templates/.github/workflows/bkit-trivy.yml` fails CI on a HIGH or CRITICAL vulnerable package, risky config or committed secret, and runs daily. Copy it and own it; accept findings in `.trivyignore.yaml`. `bkit check` does not report its absence; `bkit tips` suggests it. See `.bkit/templates.md` § Trivy.

**Test lint.** `.bkit/templates/.oxlintrc.json`: five Oxlint rules on JS / TS test files; `lint` fails on a test that cannot fail. Copy and own; set `lint` to `oxlint -c .oxlintrc.json --type-aware --deny-warnings`. Absent → `bkit check` silent, `bkit tips` suggests it. `.bkit/templates.md` § Oxlint.

**All templates.** Copy and own, never installed. Catalog and install steps: `.bkit/templates.md`.

### dogfood rule — updater PRs against workflows (only if you opt in)

bkit dogfoods templates: `.bkit/templates/.github/workflows/*.yml` (canonical) and `.github/workflows/*.yml` (bkit copy) must stay byte-equal where they overlap. Updater scans `.github/workflows/` only, not template path. Applies only if bkit-repo opted into updater. When updater PR opens against bkit workflows:

1. Before merge, edit matching `.bkit/templates/.github/workflows/*.yml` with same SHA bump (one `Edit` per file).
2. Run `pnpm test` (`.bkit/core/engine/audits/templates/template-action-pins.test.ts` fails when a template pin drifts from the repo's).
3. Push template-side change to updater PR branch (or follow-up commit on `dev` if branch read-only).

Consumers: `.github/workflows/bkit-ci.yml` and `bkit-cloud.yml` are your copies of templates, so updater bumps survive install and upgrade. New pins in the templates arrive in `.bkit/templates/` on `bkit upgrade`; adopt them like any other template change.

---

## Triggering workflows

Three paths: Linear comment (cloud), Claude Code (interactive local), Cursor (interactive local). Same workflow from `.bkit/core/workflows/` — compute source and orchestrator model differ.

### From a tracker comment (cloud — Cursor Cloud Agent)

**Linear tracker:** `@cursor` in Linear comment with slash command + issue ID:

```
@cursor /bkit-plan ISSUE-123
@cursor /bkit-build ISSUE-123
@cursor /bkit-ship ISSUE-123
```

`@cursor` = **Cursor's standard Linear integration** — not bkit hook; bkit runs no Linear webhook. Native integration spawns Cloud Agent, posts session URL as Linear comment; agent runs bkit workflow because Cursor cloud agents read root `AGENTS.md`, routing `/bkit-*` to `.bkit/core/workflows/`. Progress in subsequent comments per step.

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

**Requirements:** `BKIT_GH_TOKEN`, active Claude Code session (subscription or `BKIT_ANTHROPIC_API_KEY`). `BKIT_LINEAR_API_KEY` when `bkit.tracker.default = "linear"`; `BKIT_JIRA_API_KEY` when `"jira"`. Session model = orchestrator pin in `.bkit/prompts.md` § Orchestrators (`Claude` column) — set via `/model` before invoking; not duplicated here.

### From Cursor (interactive — local)

Cursor 2.4+ honours `.cursor/commands/bkit-*.md` and `.cursor/agents/bkit-*.md`:

```
/bkit-plan ISSUE-123
```

Orchestrator reads `.cursor/commands/` workflow. Subagents via `Task`, `model:` from frontmatter (no host override).

**Requirements:** `BKIT_GH_TOKEN` (GitHub, default) or `BKIT_LINEAR_API_KEY` (Linear) or `BKIT_JIRA_API_KEY` (Jira). Cursor account in good standing.

---

## Adding or updating skills

> **Skills must be installed before first use** — initial setup in `docs/setup.md`. Inventory and registry rules: `.agents/skills.md`.

Skills = third-party instruction sets loaded at invocation.

```bash
npx skills find [query]                  # search the registry (check publisher / installs / stars)
npx skills add <owner/repo>@<skill> -y   # install one named skill, project-locally into .agents/skills/
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
| `.bkit/prompts.md` | Per-subagent description, effort tier, model, `maxTurns`. Audit template catalogue (§ Audit (Ad-hoc)). |
| `.bkit/authoring.md` | Authoring rules for every agent-read markdown file — docs, prompts, workflows; punctuation and capitals (§ Notation) |
| `.agents/docs.md` | Document index and phase-matrix (what to read per phase) |
| `.agents/skills.md` | Installed skills registry |
| `.bkit/providers.md` | Host differences (Claude/Cursor/opencode), transform rules, additive install, provider model IDs, pin process (§ Selecting pins), network allowlist encodings (`.bkit/allowlist.json` vs baked settings) |
| `.bkit/friction.jsonl` | Friction ledger — orchestrator-observed recovery moments. Created on first append by a phase workflow, not by install; drained only by bkit's harvest (run from the bkit repo). Row shape: `.bkit/jsonl.md`. |
| `.bkit/stats.jsonl` | Stats ledger — `outcome` / `compliance` / `counter` rows appended at every workflow close. Append-only. Row shape: `.bkit/jsonl.md`. |
| `.bkit/stats.md` | This repo's stats report, written by `bkit stats` from `.bkit/stats.jsonl`, `.bkit/friction.jsonl` and `docs/deferrals.jsonl`. Committed; holds no timestamp, so it changes only when the ledgers do. |
| `docs/plans/{YYYYMM}/` | Canonical month bucket — `{FID}-design.md`, `{FID}-plan.md`. Files never move; `{YYYYMM}` = creation month at design start. Created by the design phase. |
| `docs/templates/bkit-audit-*.md` | Read-only audit procedures, one per lens. Run with `@bkit-audit-generate`. |
| `docs/audits/{YYYYMM}/` | Audit reports. Input to `/bkit-plan`, with or without a design. |
| `docs/plans/{YYYYMM}/logs/{FID}/` | Per-run workflow logs (status, subagent outputs). Delete-eligible — bulk cleanup `rm -rf docs/plans/{YYYYMM}/logs/`. Canonical artifacts unaffected. |
| `.bkit/issues.jsonl` | Issue-state ledger — appended at every phase close. Append-only. |
| `docs/roadmap.md` | Phase-sectioned board + analysis. No tracker list — a wired tracker shows its own issues. Two consumer `## Notes` blocks (above the bkit list, last after analysis) survive every regenerate. Consumer-owned — never seeded/overwritten by `bkit install` |
| `docs/deferrals.jsonl` | Deferred items |

### In the installed package, not your repo

`bkit install` does not copy these out of `node_modules`. Read them at the path below — or
in-repo through the `.bkit/core` / `.bkit/shared` view links install creates (symlinks into
the package, so editors resolve them to the `node_modules/…` paths).

<!-- prettier-ignore -->
| File | Purpose |
| --- | --- |
| `.bkit/install.md` | First-time install and upgrade, install lifecycle, uninstall |
| `.bkit/pipeline.md` | Pipeline reference: every subagent in execution order, CI scaffold, every audit template |
| `.bkit/comparison.md` | Comparison to peer frameworks / agentic design patterns |
| `node_modules/@cbartens/bkit/.bkit/core/workflows/` | Canonical slash-command source (rendered into `.claude/commands/`, `.cursor/commands/`, `.opencode/commands/`) |
| `node_modules/@cbartens/bkit/.bkit/core/prompts/` | Canonical subagent source (rendered into `.claude/agents/`, `.cursor/agents/`, `.opencode/agents/`) |
| `node_modules/@cbartens/bkit/.bkit/{core,shared}/` | Sources `bkit install` writes from (see § What install writes) |
| `node_modules/@cbartens/bkit/.bkit/templates/` | Copy-and-own templates copied raw into the consumer's `.bkit/templates/` (see `.bkit/templates.md`) |
| `node_modules/@cbartens/bkit/dist/cli.js` | Install engine — renders host outputs and applies templates (`.bkit/core/engine/cli.ts` is the TypeScript source, not shipped as such) |

---

## Editing workflows or prompts

Edit `.bkit/core/workflows/` (orchestrators) or `.bkit/core/prompts/` (subagents), then re-run install:

```bash
# Edit source
vim .bkit/core/workflows/bkit-build.md

# Regenerate (run dist binary; faster than tsx and matches what consumers run)
pnpm build && node dist/cli.js install

# Commit both source and generated output together
git add .bkit/core/workflows/bkit-build.md .claude/commands/bkit-build.md .cursor/commands/bkit-build.md
git commit -m "chore: update build command"
```

New subagent? Update `.bkit/core/.bkit/prompts.md` (the package source; install mirrors it to `.bkit/prompts.md`) with row (frontmatter rationale + `maxTurns` calibration + model assignment) before re-run install — single source of truth for agent metadata; CI drift gate enforces consistency.
