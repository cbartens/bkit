# bkit — Agent Workflow System

{{BKIT_MANAGED_MARKER}}

> [!CAUTION]
> **Purpose:** What bkit does, the environment and tracker setup, the upgrade paste and the ongoing CLI. First-time install and the full auth setup are in `.bkit/install.md`. Workflow internals are in `.bkit/workflows.md`, and subagent metadata (effort, model, tools, `maxTurns`) is in `.bkit/prompts.md`.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - This file ships to every project that installs bkit. Describe the current setup only.
> - Leave out internal labels, such as tracker issue numbers, ledger keys and review-finding ids, and leave out project history. Decisions go in `docs/decisions.jsonl`, and incidents go in `docs/knowledge.jsonl`.
> - Give a topic that another `.bkit/*.md` doc owns a short summary here and a pointer to that doc. Keep the detail in that doc only.

**bkit** wires Claude Code, Cursor, Codex, Google Antigravity and opencode into a five-phase cycle integrated with the issue tracker: `/bkit-design` → `/bkit-plan` → `/bkit-build` → `/bkit-debug` → `/bkit-ship`. Hosts are additive, with one flag each: `--claude`, `--cursor`, `--codex`, `--antigravity` and `--opencode=<provider>`. The opencode providers are `openrouter`, `ollama`, and `opencode-zen` + `opencode-go` (opencode's own gateways, which authenticate with `BKIT_OPENCODE_API_KEY`). Every host runs the same harness. State lives in the repo, so a feature moves between hosts mid-run (see `.bkit/providers.md` § Supported hosts).

---

## How a workflow runs (end-to-end example)

Here is a typical cycle for `ISSUE-123` "Add feature X":

1. **Tracker issue** — the issue has the `bkit:auto` label and a non-terminal state (`Backlog`, `In Progress`).
2. **Trigger** — a tracker comment (`@cursor /bkit-plan ISSUE-123`) or a slash command (`/bkit-plan ISSUE-123`) starts the workflow.
3. **Workflow Step 1** — the preflight checks for `bkit:auto`, takes the `.lock`, sets `bkit:plan` and `In Progress`, and creates the workflow comment.
4. **Step 2 — worktree** — the workflow creates a git worktree at `.worktrees/issue-123-add-feature/` on `feat/issue-123-add-feature`. It cuts the branch from `origin/dev`, or from local `dev` when that branch holds unpushed commits on top. Then it:
   - Copies each `bkit.workflows.worktree.copy` path from the main checkout. This `package.json` setting defaults to `.env`, `.env.local`. Paths are exact, and folders copy recursively. A missing path is logged, and is never fatal.
   - Links `.bkit/.env` (bkit's own token file) to the main checkout's copy, so the worktree can sign in.
   - Runs `direnv allow` when the worktree's `.envrc` matches the main checkout's.
   - Runs `pnpm install --frozen-lockfile`, unless `bkit.workflows.worktree.install: false`.
5. **Phase steps** — the workflow dispatches subagents: `@bkit-plan-generate`, then `@bkit-plan-review-1`, `-2` and `@bkit-plan-scope-check` in parallel, and so on. Each one writes to `docs/plans/{YYYYMM}/logs/{FID}/` and appends a fenced section to the tracker comment. `{YYYYMM}` is the canonical month bucket, taken at design start.
6. **Phase summary** — `bkit workflows summary` writes the summary from the run's status rows, with a verdict (`PASS` / `CONCERNS` / `FAIL`). The workflow commits it as `chore(issue-123-…): summary bkit [skip ci]` for design / plan, or as `chore(issue-123-…): summary` for build/debug/ship, and then pushes.
7. **Close Workflow** — the tracker issue moves to `In Review`, and the phase label stays. `/bkit-design` / `/bkit-plan` prune the worktree and delete `feat/issue-123-…`, which is merged into `dev`. `/bkit-build` / `/bkit-debug` keep the worktree.
8. **Human review** — the design / plan sits at its canonical path, `docs/plans/{YYYYMM}/{FID}-{design,plan}.md`. The reviewer re-triggers the workflow or moves on to `/bkit-build`.
9. **`/bkit-build`** — re-creates the worktree and executes the plan test-first: each task's tests fail before its code exists, then pass. It runs lint, typecheck and unit tests, and opens a PR to `dev`.
10. **CI** — runs on the PR. Red → `/bkit-debug`, in PR mode (`gh run view --log-failed`). Green → `/bkit-ship`.
11. **`/bkit-ship`** — squash-merges the PR, runs `@bkit-ship-update-docs` and then the ship summary on `dev`, prunes the worktree, and moves the issue to `In Review` with `bkit:merged`. bkit never closes an issue automatically. Plans stay at `docs/plans/{YYYYMM}/`, with no archive move.

Throughout the run, the workflow holds `.lock`, writes `status.jsonl` (the source of truth for resuming) and owns the tracker MCP calls. Subagents are leaves: they have no tracker access, and their `tools:` allowlist scopes their writes.

Every point where a run can ask you has two settings under `bkit.workflows` in `package.json`: `ask` (stop and ask, or carry on with the recommendation) and a hard limit (`maxAttempts`, or `maxTurns` for the design grill). The defaults are `ask: true` everywhere, 2 attempts and 6 grill turns. A limit used up always ends in the Failure Path, and a question never resets a count. With `ask: false`, or in a headless GitHub Actions run, the run takes each recommendation and records any `Accept` as assumed. `/bkit-ship` then asks you to confirm the assumed items, and writes the ones you don't confirm as `needs-decision` deferrals. See `.bkit/workflows.md` § Ask points.

Plans are sized by `bkit.workflows.tasks` in `package.json`. Each group holds up to `bkit.workflows.tasks.maxPerGroup` tasks (default 3) and up to `bkit.workflows.tasks.maxTestsPerGroup` `TEST FIRST` tests (default 15). Each task holds up to `bkit.workflows.tasks.maxTestsPerTask` tests (default 10), across up to `bkit.workflows.tasks.maxTestFilesPerTask` test files (default 3). Install and upgrade write the defaults when they are missing, and never touch a value already set. A value that is not a whole number of 1 or more falls back to its default, and `bkit check` says so. See `.bkit/workflows.md` § Test-first.

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

**Where an issue starts.** The issue body and its comments are every workflow's first input. Issue shapes and the lines a machine reads are in `.bkit/trackers.md` § Issue shapes, and example forms are in `.bkit/templates.md` § Issue forms.

<!-- prettier-ignore -->
| Issue | Start with |
| --- | --- |
| Idea — how it should work still open | `/bkit-design` |
| Change — what to build and "done" known | `/bkit-plan`, or `/bkit-build` / `build:lite` with no plan. With no plan, `/bkit-build` first writes `{FID}-plan.md` from the issue, then checks that each `TEST FIRST` is red. An existing plan wins over the issue. `build:lite` checks nothing. |
| Bug — a test or CI run already fails | `/bkit-debug`, on the branch the fix lands on |
| Bug — nothing fails yet | `/bkit-debug [repro]` (writes a failing test first, then fixes) |

Per-step detail, verdict routing, retry / timeout constants, label flips, the status.jsonl shape and the comment lifecycle are in `.bkit/workflows.md`.

Per-subagent scope, effort tier, tool surface, `maxTurns` and model assignment are in `.bkit/prompts.md`.

---

## Audits

Audits have no `/bkit-audit` command and no phase label. More than 30 procedures ship as `docs/templates/bkit-audit-*.md`. To run one, invoke `@bkit-audit-generate` and name exactly one template.

<!-- prettier-ignore -->
| Item | Contract |
| --- | --- |
| Report | `docs/audits/{YYYYMM}/{slug}.md`. `{slug}` = template basename without `bkit-audit-`. Same slug already in that month → `{slug}-{TIMESTAMP}.md` (`date -u +%Y%m%dT%H%M%SZ`). Never overwrite. |
| Writes | The report (template through `bkit:end`) and that template's `Project Instructions` below `bkit:end`. Product code, config, and other docs stay untouched. Fixing findings starts at `/bkit-plan`. |
| Issue comment | When the invocation names an issue (`#123`, `ABC-123`) and a tracker is wired, the final summary lands on that issue as one comment, stopped runs included. The agent never files, edits or relabels issues. |
| Audit parent | Each template has one standing issue. Every run of that template reports to it, and the issues a run files become sub-issues of the standing issue (`.bkit/trackers.md` § Issue shapes). When no issue is named and a tracker is wired, the agent searches for the standing issue and posts the summary there. When none is open, the final message suggests one, ready to file, plus the saved summary to post as its first comment. |
| Plan input | `/bkit-plan` takes a design doc, one or more reports, or both. The issue names a report with an `**Audit reports:**` line. The session prompt or the issue names which findings to plan (for example only `CRITICAL` and `HIGH`). The rest of each report stays context. |

Each template's `Purpose` is its scope. The main ones cover security, privacy, accessibility, architecture, performance, reliability, testing, database, LLM and cost. The full catalogue is in `.bkit/prompts.md` § Audit (Ad-hoc).

---

## Prerequisites

### Required tools

<!-- prettier-ignore -->
| Tool | Version | Used for |
| --- | --- | --- |
| Node | >= 24 (`engines.node`) | Runs the bkit CLI. |
| `pnpm` | matches `package.json` `packageManager` | Required in every consumer repo, whatever the stack: bkit installs and upgrades itself with pnpm, which makes the repo a pnpm repo. Runs the worktree install (`pnpm install --frozen-lockfile`) and the `bkit:gate:*` scripts. A non-Node stack uses a stub `package.json` whose `bkit:gate:*` scripts wrap the stack's own commands (e.g. `ruff check && pytest`). It also runs the bkit CLI (`bkit install`, or `pnpm tsx .bkit/core/engine/cli.ts` in bkit dev). |
| `gh` | latest, authenticated | PR create / view / merge in `/bkit-build`, `/bkit-debug`, `/bkit-ship` |
| `git` >= 2.5 | — | Worktree operations |
| `jq` | latest | Reads the JSON that `bkit` commands print, in workflow Bash |
| Claude Code CLI | latest | Local-IDE workflow execution |
| Cursor (optional) | 2.4+ | Cloud Agent execution; honours `tools:` frontmatter allowlist |

### Shell alias

bkit is a devDependency. Add this alias once to run `bkit <verb>`:

```bash
# Add to ~/.zshrc (or ~/.bashrc), then: source ~/.zshrc
alias bkit='pnpm bkit'
```

`bkit doctor` emits `bkit-not-on-path` when the alias is missing. Run `bkit cursor` / `bkit opencode` (the GUI launchers) from the repo root in an external terminal, not inside the running app.

### Environment variables

Add these to your shell, to the Cursor Cloud Agent dashboard, and to `apps/web/.env.example` for contributors. The exact set depends on `bkit install --tracker=<name>`:

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
| `GH_TOKEN` | all | `gh` CLI inside CI workflow Bash only (`GH_TOKEN: ${{ github.token }}`) | Not seeded in `.bkit/.env`. Local `gh` uses the `gh auth login` keyring. |
| `GITHUB_ISSUE_ID` | github | Injected from PR body `<!-- bkit:issue=#NNN -->` | Linked GitHub issue. Injected automatically, so do not set it manually. |
| `BKIT_ANTHROPIC_API_KEY` | all | Claude Code (headless / CI) | Required when Claude is invoked outside an interactive session (cloud automation, CI). |
| `BKIT_CURSOR_API_KEY` | all | Cursor Cloud Agent dashboard / programmatic invocation | Required for non-interactive Cursor sessions. |
| `BKIT_LINEAR_API_KEY` | linear | Preflight hooks (`.{claude,cursor}/hooks/bkit-preflight.sh`); workflow Linear MCP via OAuth fallback | Queries issue state and labels for the `Auto` gate. Fails fast if absent. |
| `BKIT_JIRA_API_KEY` | jira | Jira MCP server (`Authorization: Bearer`) | An Atlassian MCP V2 scoped API token. A site admin first enables API-token sign-in for the Rovo MCP server. Setup: `.bkit/trackers.md` § jira. |
| `LINEAR_WEBHOOK_SECRET` | linear | Linear → Cursor integration backend | Verifies webhook signatures on `@cursor` mentions. Set in the Linear + Cursor integration config. |

The workflow context sets `GITHUB_ISSUE_ID` (GitHub) and `LINEAR_ISSUE_ID` (Linear) automatically. Do not set them manually.

### Tracker workspace setup

bkit uses one custom label (`Auto`), plus families of integration labels. The setup depends on the configured tracker.

#### Bkit custom label (`Auto`)

- **`Auto`** — marks issues approved for agent work. The preflight refuses an issue that lacks it or is in a terminal state (`Done` / `Cancelled` / closed). Add it before any cloud / automation session.
  - **GitHub:** the issue label `bkit:auto`. `bkit install --tracker=github` seeds it through the GitHub MCP on the first run.
  - **Linear:** the Linear label `Auto`. Add it to the workspace manually.

#### Phase labels (GitHub tracker)

When `bkit.tracker.default = "github"`, Cursor reads the PR's phase label to dispatch: `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`. The Cursor GitHub App is required on the repo / org. `/bkit-design` / `/bkit-plan` have no PR, so they are local-IDE-only on Cursor cloud.

#### Linear + Cursor integration labels (Linear tracker only)

Three **parent labels** (`branch`, `model`, `repo`) take sub-labels that set the Cursor Cloud Agent's session context. When a sub-label is present, Cursor follows it. Otherwise the integration's defaults apply.

<!-- prettier-ignore -->
| Parent | Example sub-labels in this workspace | What it controls |
| --- | --- | --- |
| `branch` | `dev` | git branch the agent works on |
| `model` | `cursor-grok-4.5-high`, `composer-2.5` (defaults); API Opus etc. via `prompts.md` § Model Overrides paste block | Cursor model the orchestrator runs on |
| `repo` | `<owner>/<consumer-repo>` | repo the agent operates in |

Per-agent model assignments are in `.bkit/prompts.md` § Models. Cursor reads each subagent's frontmatter `model:` directly. Linear `model:*` sub-labels set the orchestrator session's model only. Keep them in sync with `.bkit/providers.md` § Cursor model catalog.

The full Linear + Cursor setup is at <https://linear.app/docs/cursor>.

---

## Distribution & install

`.agents/` is canonical. `bkit install` regenerates the host outputs (`.claude/**`, `.cursor/**`) and rewrites the bkit-managed blocks across the consumer repo.

First-time install, upgrade and uninstall are in `.bkit/install.md`. Ongoing operations follow below.

### Upgrade

`bkit upgrade --latest` bumps the package and resyncs the managed files. `pnpm add` alone refreshes the package only. The paste block for your AI is in `.bkit/install.md` § Upgrade — already installed.

### Ongoing CLI

Every `bkit` command with its flags (`bkit install`, `bkit upgrade`, `bkit check`, `bkit doctor`, `bkit tips`, `bkit stats`, and the `bkit <noun> <verb>` commands) is in `.bkit/cli.md`.

**Outdated-version warning:** Step 1 of every phase workflow (`bkit repo info`) and every design / plan / audit doc stamp compare `.bkit/version` `pinnedVersion` with the newest published `@cbartens/bkit`. When the pinned version is older, a warning names the upgrade command, and stamped docs carry a visible `Outdated bkit` line under their `bkit:anchor` block. The warning never stops a run. The registry is asked at most once a day, and the answer is cached in `<git common dir>/bkit-latest-version.json`. Offline, there is no warning. `BKIT_NO_UPDATE_CHECK=1` skips the lookup (air-gapped machines, CI).

> **Version bumps:** use `bkit upgrade --latest` (or `--to=<version>`). A bare `pnpm add @cbartens/bkit` / Renovate bump refreshes only the lockfile. Run `bkit upgrade` after it, and commit the resync with the bump. Otherwise `bkit check` turns CI red.

### Dogfood path (this repo only)

The bkit repo runs the install script through `tsx` instead of the published bin:

```bash
pnpm tsx .bkit/core/engine/cli.ts install
pnpm tsx .bkit/core/engine/cli.ts check
```

The CI drift gate (`.github/workflows/bkit-ci.yml`) fails a PR when the generated files diverge from the `install` output.

## File ownership

bkit owns some files outright, owns one part of others, and ships the rest as templates it never applies.

<!-- prettier-ignore -->
| Kind | Semantics | Files |
| --- | --- | --- |
| **Tier 1 — Fully managed** | Idempotent rewrite of whole file on every install. A consumer edit is overwritten. Uninstall deletes the file while it still matches the hash bkit recorded. | `.bkit/*.md` (except `prompts.md` and `lite.md`, Tier 2), `.bkit/.env.example`, `.bkit/allowlist.json`, `.cursor/cli.json` |
| **Tier 2 — Managed-block** | bkit owns content between `bkit:start`/`bkit:end` markers. Consumer owns everything outside. File absent → write whole file. File present without markers → append block at EOF, unless the markdown file already holds an older unmarked copy of the block (its `# ` title plus 10+ long lines verbatim) → warn + skip. A full uninstall strips the block and deletes a file left with nothing else; `docs/templates/bkit-*.md` are bkit's whole and are deleted. | `docs/*.md`, `docs/templates/bkit-*.md`, `.gitignore`, `.agents/rules.md`, `.agents/context.md`, `.agents/docs.md`, `.agents/skills.md`, `AGENTS.md`, `CLAUDE.md`, `.claude/hooks/bkit-preflight.sh`, `.cursor/hooks/bkit-preflight.sh`, `.claude/hooks/bkit-gateguard.cjs`, `.cursor/hooks/bkit-gateguard.cjs`, `.opencode/plugin/bkit-gateguard.js`, `.cursor/hooks/bkit-guardrails.cjs`, `.codex/hooks/bkit-gateguard.cjs`, `.codex/hooks/bkit-guardrails.cjs` |
| **Shared JSON** | bkit owns the keys its template sets; every other key is yours. `.mcp.json` / `.cursor/mcp.json`: bkit owns exactly one entry, `mcpServers.<tracker>`, and resets it to the template on every install and upgrade. | `.claude/settings.json`, `.cursor/hooks.json`, `.opencode/opencode.json`, `.mcp.json`, `.cursor/mcp.json` |
| **Seeded package.json scripts** | Every install and upgrade adds a missing name with bkit's default; a name already present is never touched, whatever its value. `bkit check` reports a missing name. Uninstall leaves them. | `scripts.bkit:gate:format` / `bkit:gate:static` / `bkit:gate:static-unit` / `bkit:gate:install-static-unit-build` / `bkit:deps:outdated` / `bkit:deps:audit` |
| **Seeded bkit settings** | Every install and upgrade writes every `bkit` setting, so each one is visible where you look for it. A missing key gets its default; a choice not made yet (tracker, cloud agents, board, opencode provider) gets `""` or `[]`, which reads the same as absent. A key already present is never touched, whatever its value; nested blocks get their missing keys. `bkit check` reports a missing key. | every key under `bkit`: `SEEDED_BKIT_DEFAULTS` in `.bkit/core/engine/install/modules/core.ts` |
| **Templates** | Never written into your repo. Install and upgrade copy them, raw, into `.bkit/templates/`; you copy what you want and own it. Catalog: `.bkit/templates.md`. | `.github/workflows/bkit-ci.yml`, `.github/workflows/bkit-cloud.yml`, `.husky/*`, `.vale.ini`, `.vale/styles/House/*`, `.lintstagedrc.json`, `slop-scan.config.json`, `.oxlintrc.json`, `.prettierignore`, `.envrc`, `.cursor/{settings.json,environment.json,Dockerfile}`, dependency-updater examples, `.github/workflows/bkit-trivy.yml`, the per-provider context-fetch blocks (`context/bkit-*.md`), `scripts/slop/bkit-slop-type-suppression.mjs`. Also the tool `package.json` scripts (`typecheck`, `lint`, `format:check`, `lint:prose`, `lint:slop`, `slop:delta`, `prepare`) and devDeps (prettier, slop-scan, lint-staged, husky): `.bkit/templates.md` lists them, install never adds them. |

**Marker syntax** depends on the file format:

- Markdown: `<!-- bkit:start -->` / `<!-- bkit:end -->`
- Shell / `.gitignore` / `.gitattributes`: `# <!-- bkit:start -->` / `# <!-- bkit:end -->`
- JS / TS ES modules: `// bkit:start` / `// bkit:end`, because HTML comments are a syntax error in an ES module.

Block updates keep the comment prefixes (`# `, `// `) before the markers.

**Managed-version marker.** Every non-JSON file bkit writes carries `bkit:managed vX.Y.Z` in its comment syntax, as the first line inside the `bkit:start` block or near the top of a whole file: `<!-- … -->` (markdown), `# <!-- … -->` (shell, `.gitignore`, `.gitattributes`, `.env.example`, TOML), `// …` (JS). The full MIT text and copyright notice travel at `.bkit/LICENSE.md`. Install and upgrade restamp the marker. `bkit check` reports `bkit-managed-stale` for a marker that differs from the installed version: a blocker on `main` / `dev`, and an advisory on feature branches. Templates carry no marker and no block.

**Hook scripts.** Install generates each host's `bkit-preflight.sh`, `gateguard`, `readguard`, `guardrails` and `rules` hook from its template plus the code the hosts share (`.bkit/core/hooks/`, `.bkit/providers.md` § Hooks). bkit's block in the `bkit-gateguard` / `bkit-readguard` / `bkit-rules` hooks and plugins and the `bkit-guardrails.cjs` hooks is a pure advisory engine. It reads no stdin, writes no stdout and makes no top-level call, so it cannot collide with a consumer's own emitter. Delivery differs by host. Claude / Cursor / Codex inject the checklist before the edit. opencode appends it to the tool result in `execute.after` (`BKIT_GATEGUARD=deny` is the only pre-edit block). The rules-read advisory rides the two `bkit-preflight.sh` hooks at session start and the `bkit-rules` hook at the first tool call. See `.bkit/providers.md` § Hooks. A consumer file with no markers gets the block appended. Wire its exported function into your driver.

### What install writes

<!-- prettier-ignore -->
| Path | Module | Source | Tier |
| --- | --- | --- | --- |
| `.agents/{rules,docs,context,skills}.md` | core | `.bkit/core/.agents/` | Tier 2 html-comment (via the core payload pass — not the additive `.agents/` copy). Consumer `context-fetch`, `allowed-domains` and `mcp-servers` blocks live below `bkit:end` in `context.md`; `Project Skills` below `bkit:end` in `skills.md`. |
| `.bkit/version` | core | package.json version | Written last (partial installs detectable) |
| `.bkit/allowlist.json` | core | derived from bkit's shipped egress registry, union `.agents/context.md` allowed-domains | Tier 1 (canonical-overwrite). Curl / wget host allowlist every host's `bkit-guardrails.cjs` reads at runtime. |
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
| `.cursor/hooks.json` | cursor | `.bkit/shared/.cursor/hooks.json` | Tier 2 JSON deep-containment |
| `.cursor/mcp.json` | cursor | `.bkit/shared/.cursor/mcp.json` | Shared JSON: bkit owns `mcpServers.<tracker>` only |
| `.cursor/rules/bkit-rules.mdc` | cursor | `.bkit/shared/.cursor/rules/bkit-rules.mdc` | Tier 2 html-comment |
| `.cursor/hooks/bkit-preflight.sh` | cursor | `.bkit/core/.cursor/hooks/` | Tier 2 html-comment (`# ` prefix) |
| `.cursor/hooks/bkit-guardrails.cjs` | cursor | `.bkit/core/.cursor/hooks/` | Tier 2 slash-comment. Destructive-op + curl / wget host gates. |
| `.cursor/hooks/bkit-gateguard.cjs` | cursor | `.bkit/core/.cursor/hooks/` | Tier 2 slash-comment |
| `.cursor/hooks/bkit-readguard.cjs` | cursor | `.bkit/core/.cursor/hooks/` | Tier 2 slash-comment. Repeat-read advisory. |
| `.cursor/cli.json` | cursor | derived from `.agents/context.md` mcp-servers | Tier 1 (canonical-overwrite). Cursor CLI / cloud-agent `Mcp(<server>:*)` allows. |
| `.opencode/opencode.json` | opencode | `.bkit/shared/.opencode/opencode.json` | Tier 2 JSON deep-containment; `@@OPENCODE_*@@` sentinels rendered to the chosen tracker + provider. Opt-in via `bkit install --opencode=<provider>`. |
| `.opencode/commands/bkit-*.md` | opencode | `.bkit/core/workflows/` | Host pass — always overwrite |
| `.opencode/agents/bkit-*.md` | opencode | `.bkit/core/prompts/` | Host pass — always overwrite |
| `.opencode/plugin/bkit-gateguard.js` | opencode | `.bkit/core/.opencode/plugin/` | Tier 2 slash-comment |
| `.opencode/plugin/bkit-readguard.js` | opencode | `.bkit/core/.opencode/plugin/` | Tier 2 slash-comment. Repeat-read advisory. |
| `.claude/hooks/bkit-cloud-bootstrap.sh` | — | `.bkit/templates/.claude/hooks/` | Copy-and-own template: no module writes it; adopt it from `.bkit/templates/` (the SessionStart entry runs it only when present). |

The cloud workflow and the Cursor Background Agent files are templates the `--auto` setup advisory points at.

### Optional post-install decisions (tracker + cloud agents)

Two capabilities are opt-in and left out of the default install: the **issue tracker** (`--tracker=github|linear|jira`) and **cloud agents** (`--auto=claude|cursor|opencode`). The default install ships zero cloud footprint. While a choice is undecided, its advisory fires (`tracker-setup-none` / `cloud-router-none`). Setting `"none"` in `bkit.tracker.default` / `bkit.cloud.agent` silences it. The dependency updater, security scan and test lint are copy-and-own templates. The choices, the defaults and how to decide are in `.bkit/install.md` § Optional post-install decisions. The template catalog is in `.bkit/templates.md`.

### dogfood rule — updater PRs against workflows (only if you opt in)

bkit dogfoods its templates: `.bkit/templates/.github/workflows/*.yml` (canonical) and `.github/workflows/*.yml` (bkit's copy) must stay byte-equal where they overlap. The updater scans `.github/workflows/` only, not the template path. This rule applies only if the bkit repo opted into the updater. When an updater PR opens against bkit's workflows:

1. Before the merge, apply the same SHA bump to the matching `.bkit/templates/.github/workflows/*.yml` (one `Edit` per file).
2. Run `pnpm test` (`.bkit/core/engine/audits/templates/template-action-pins.test.ts` fails when a template pin drifts from the repo's).
3. Push the template-side change to the updater PR's branch. If that branch is read-only, make a follow-up commit on `dev` instead.

For consumers, `.github/workflows/bkit-ci.yml` and `bkit-cloud.yml` are your own copies of templates, so updater bumps survive install and upgrade. New pins in the templates arrive in `.bkit/templates/` on `bkit upgrade`. Adopt them like any other template change.

---

## Triggering workflows

There are three paths: a Linear comment (cloud), Claude Code (interactive, local) and Cursor (interactive, local). All three run the same workflow from `.bkit/core/workflows/`. The compute source and the orchestrator model differ.

### From a tracker comment (cloud — Cursor Cloud Agent)

**Linear tracker:** write `@cursor` in a Linear comment, with the slash command and the issue ID:

```
@cursor /bkit-plan ISSUE-123
@cursor /bkit-build ISSUE-123
@cursor /bkit-ship ISSUE-123
```

`@cursor` is Cursor's standard Linear integration, not a bkit hook. bkit runs no Linear webhook. The native integration spawns a Cloud Agent and posts the session URL as a Linear comment. The agent runs the bkit workflow because Cursor cloud agents read the root `AGENTS.md`, which routes `/bkit-*` to `.bkit/core/workflows/`. Progress for each step appears in later comments.

**GitHub tracker:** a PR label triggers the run, through the Cursor Automations trigger "Pull request label changed". `bkit:auto` on the PR (from `bkit-build`) triggers dispatch, and the phase label (`bkit:plan`, `bkit:build`, etc.) selects the workflow. Issue comments go through the GitHub MCP. `/bkit-design` / `/bkit-plan` have no PR, so with the GitHub tracker they are local-IDE-only on Cursor cloud.

**Requirements (Linear):** the `Auto` label and a non-terminal state. `BKIT_LINEAR_API_KEY`, `BKIT_CURSOR_API_KEY`, `BKIT_ANTHROPIC_API_KEY` and `BKIT_GH_TOKEN` in the Cursor Cloud Agent dashboard.

**Requirements (GitHub):** `BKIT_GH_TOKEN`, `BKIT_CURSOR_API_KEY` and `BKIT_ANTHROPIC_API_KEY` in the dashboard. The Cursor GitHub App on the repo/org. `GITHUB_ISSUE_ID` comes from the PR body's `<!-- bkit:issue=#NNN -->`, with no manual setup.

### From Claude Code (interactive — local)

Run the slash commands at the repo root:

```
/bkit-design ISSUE-123      # produce a design doc
/bkit-plan ISSUE-123        # produce an implementation plan
/bkit-build ISSUE-123       # execute the plan in a worktree, open a PR
/bkit-debug ISSUE-123       # diagnose and remediate CI failures
/bkit-ship ISSUE-123        # merge the PR for the current branch, set the issue In Review
```

Claude reads the issue, its comments and the plan files through the tracker MCP.

**Requirements:** `BKIT_GH_TOKEN` and an active Claude Code session (subscription or `BKIT_ANTHROPIC_API_KEY`). `BKIT_LINEAR_API_KEY` as well when `bkit.tracker.default = "linear"`, and `BKIT_JIRA_API_KEY` when it is `"jira"`. The session model is the orchestrator pin in `.bkit/prompts.md` § Orchestrators (`Claude` column). Set it with `/model` before you invoke a command. This file does not repeat the pin.

### From Cursor (interactive — local)

Cursor 2.4+ honours `.cursor/commands/bkit-*.md` and `.cursor/agents/bkit-*.md`:

```
/bkit-plan ISSUE-123
```

The orchestrator reads the workflow in `.cursor/commands/`. It runs subagents through `Task`, and each subagent takes its `model:` from its frontmatter, with no host override.

**Requirements:** `BKIT_GH_TOKEN` (GitHub, default) or `BKIT_LINEAR_API_KEY` (Linear) or `BKIT_JIRA_API_KEY` (Jira). A Cursor account in good standing.

---

## Adding or updating skills

> Skills must be installed before their first use. The initial setup is in `docs/setup.md`, and the inventory and registry rules are in `.agents/skills.md`.

Skills are third-party instruction sets, loaded when invoked.

```bash
npx skills find [query]                  # search the registry (check publisher / installs / stars)
npx skills add <owner/repo>@<skill> -y   # install one named skill, project-locally into .agents/skills/
npx skills update                 # update all installed
```

The installed list is `.agents/skills.md`. Ship Step 7 (Prune Skills) prunes each skill in `.agents/skills/` that the list does not name.

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
| `docs/roadmap.md` | Phase-sectioned board + analysis. No tracker list — a wired tracker shows its own issues. Two consumer `## Notes` blocks (above the bkit list, last after analysis) survive every regenerate. Consumer-owned — never seeded / overwritten by `bkit install` |
| `docs/deferrals.jsonl` | Deferred items |

### In the installed package, not your repo

`bkit install` does not copy these out of `node_modules`. Read them at the path below, or in
the repo through the `.bkit/core` / `.bkit/shared` view links that install creates. The view
links are symlinks into the package, so editors resolve them to the `node_modules/…` paths.

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

For a new subagent, add its row to `.bkit/core/.bkit/prompts.md` before you re-run install, with its frontmatter rationale, `maxTurns` calibration and model assignment. That file is the package source, and install mirrors it to `.bkit/prompts.md`. It is the single source of truth for agent metadata, and the CI drift gate enforces consistency.
