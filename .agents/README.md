# bkit — Agent Workflow System

**bkit** wires Claude Code (and Cursor) into a five-phase Linear-integrated development cycle: `/bkit-design` → `/bkit-plan` → `/bkit-build` → `/bkit-debug` → `/bkit-ship`.

This README covers what bkit does, how to install it, and what env / Linear setup it expects. Workflow internals live in [`.agents/workflows.md`](workflows.md); subagent metadata (effort, model, tool surface, `maxTurns`) lives in [`.agents/prompts.md`](prompts.md).

---

## How a workflow runs (end-to-end example)

A typical cycle for issue `BAR-123` "Add feature X":

1. **Linear issue** is created with the **`Automated`** label and a non-terminal state (e.g. `Backlog`, `In Progress`).
2. **Trigger** — either a comment in Linear (`@curspr /bkit-plan BAR-123`) or a slash command in Claude Code / Cursor (`/bkit-plan BAR-123`).
3. **Workflow Step 1** — preflight hook checks the `Automated` label, acquires `.lock`, sets Linear label `Plan` + state `In Progress`, creates one workflow comment.
4. **Step 2 — worktree** — git worktree at `.worktrees/bar-123-add-feature/` on branch `feat/bar-123-add-feature`. Env files (`.env*`) copied across, `pnpm install --frozen-lockfile` run.
5. **Phase steps** — workflow dispatches subagents (`@bkit-plan-generate`, `@bkit-plan-review-1` ‖ `@bkit-plan-review-2`, etc.). Each writes to `docs/plans/logs/{FID}/` and appends one fenced section to the Linear comment.
6. **Phase summary** — subagent emits a verdict (`PASS` / `CONCERNS` / `FAIL`); workflow commits `docs(bar-123-…): plan complete [skip build] [skip ci]` → push.
7. **Close Workflow** — flips Linear label to `Review`, state `In Review`. For `/bkit-design` and `/bkit-plan`, the worktree is pruned and `feat/bar-123-…` deleted (changes are merged into `dev`). For `/bkit-build` / `/bkit-debug`, the worktree persists.
8. **Human review** — design / plan doc lives at `docs/plans/drafts/{FID}-{design,plan}.md`. Reviewer can re-trigger or progress to `/bkit-build`.
9. **`/bkit-build`** — re-creates the worktree, executes the plan, runs lint/typecheck/unit tests, opens a PR to `dev`.
10. **CI** — runs on the PR. Red CI? Trigger `/bkit-debug` (PR debug mode pulls failed run logs via `gh run view --log-failed`). Green? Trigger `/bkit-ship`.
11. **`/bkit-ship`** — squash-merges the PR, runs `@bkit-ship-update-docs` ‖ `@bkit-ship-summary` (parallel) on `dev`, archives plans to `docs/plans/completed/{YYYYMM}/`, prunes the worktree, closes the issue (`Done`).

Throughout: workflows hold the `.lock`, write `status.json` (resume SoT), and own all Linear MCP calls — subagents are leaves with read-only Linear access (none) and write access scoped by their `tools:` allowlist.

---

## The five phases

<!-- prettier-ignore -->
| Phase | Command | Steps | Output | Hard stop? |
| --- | --- | --- | --- | --- |
| Design | `/bkit-design` | 7 | `docs/plans/drafts/{FID}-design.md` | Yes — review before plan |
| Plan | `/bkit-plan` | 11 | `docs/plans/drafts/{FID}-plan.md` (+ `-N.md` if split) | Yes — review before build |
| Build | `/bkit-build` | 17 | PR to `dev` | No — CI continues |
| Debug | `/bkit-debug` | 8 | Remediation commit on feature branch | No |
| Ship | `/bkit-ship` | 10 | Squash-merged PR, plans archived, issue `Done` | Yes |

Plus two human-triggered utilities: `/bkit-worktree-sync` (merge worktree branch into IDE branch) and `/bkit-worktree-prune` (remove worktree and optionally branch).

**Per-step detail, verdict routing, retry / timeout constants, label flips, status.json shape, comment lifecycle:** [`.agents/workflows.md`](workflows.md).

**Per-subagent scope, effort tier, tool surface, `maxTurns`, model assignment:** [`.agents/prompts.md`](prompts.md).

---

## Prerequisites

### Required tools

<!-- prettier-ignore -->
| Tool | Version | Used for |
| --- | --- | --- |
| `bun` | latest | Run `bkit-install.ts` |
| `pnpm` | matches `package.json` `packageManager` | Workspace install (`pnpm install --frozen-lockfile`) inside worktrees, lint/typecheck/test gates |
| `gh` | latest, authenticated | PR create / view / merge in `/bkit-build`, `/bkit-debug`, `/bkit-ship` |
| `git` ≥ 2.5 | — | Worktree operations |
| `jq` | latest | `status.json` mutations in workflow Bash |
| Claude Code CLI | latest | Local-IDE workflow execution |
| Cursor (optional) | 2.4+ | Cloud Agent execution; honours `tools:` frontmatter allowlist |

### Environment variables

Used by workflows, preflight hooks, and the underlying CLIs. Add to your shell, the Cursor Cloud Agent dashboard, and `apps/web/.env.example` so contributors know what's needed:

```env
# ==========================================
# BKIT: LINEAR CURSOR CLAUDE GITHUB INTEGRATION
# ==========================================
LINEAR_API_KEY=""
LINEAR_WEBHOOK_SECRET=""
CURSOR_API_KEY=""
ANTHROPIC_API_KEY=""
GH_TOKEN=""
```

<!-- prettier-ignore -->
| Variable | Where read | Purpose |
| --- | --- | --- |
| `LINEAR_API_KEY` | Preflight hooks (`.{claude,cursor}/hooks/preflight.sh`); workflow Linear MCP via OAuth fallback | Query issue state + labels for the `Automated` gate; fail-fast if absent. |
| `LINEAR_WEBHOOK_SECRET` | Linear → Cursor integration backend | Verifies webhook signatures on `@curspr` mentions. Set in the Linear ↔ Cursor integration config. |
| `CURSOR_API_KEY` | Cursor Cloud Agent dashboard / programmatic invocation | Required for non-interactive Cursor sessions. |
| `ANTHROPIC_API_KEY` | Claude Code (headless / CI) | Required when Claude is invoked outside an interactive session (e.g. cloud automation, CI runs). |
| `GH_TOKEN` | `gh` CLI inside workflow Bash | PR create/view/merge, run-log fetch. Use a fine-grained PAT with `repo` + `workflow` scopes. |

`LINEAR_ISSUE_ID` is set automatically by the workflow context (Cursor Cloud Agent / Linear webhook); it doubles as the Claude IDE-vs-cloud detection signal in preflight. Don't set it manually.

### Linear workspace setup

Bkit uses one custom Linear label, plus the standard Linear ↔ Cursor integration label families.

#### Bkit custom label

- **`Automated`** — present on issues approved for agent work. The preflight hooks call the Linear GraphQL API and refuse the session if the label is absent or the issue is in `Done` / `Cancelled`. Add this label to your Linear workspace before running any cloud / automation session.

#### Linear ↔ Cursor integration labels (standard, not bkit-specific)

Three **parent labels** (`branch`, `model`, `repo`) — sub-labels under each set context for the Cursor Cloud Agent session. If a sub-label is present on the issue, Cursor follows it; otherwise the integration's defaults apply.

<!-- prettier-ignore -->
| Parent | Example sub-labels in this workspace | What it controls |
| --- | --- | --- |
| `branch` | `dev` | git branch the agent works on |
| `model` | `claude-4.7-opus-high-thinking`, `composer-2`, `gpt-5.4-high`, `gpt-5.3-codex-high`, … | Cursor model the orchestrator runs on |
| `repo` | `gether-life/app-gether-life` | repo the agent operates in |

Per-agent (subagent) model assignments live in [`.agents/prompts.md`](prompts.md) § Models; Cursor Cloud Agent reads each subagent file's frontmatter `model:` directly. The Linear `model:*` sub-labels only set the **orchestrator-session** model. Keep them in sync with [`.agents/IDEs.md`](IDEs.md) § Cursor model catalog.

For full Linear ↔ Cursor integration setup (webhook routing, dashboard env vars, parent-label families), see Linear's official integration docs: <https://linear.app/docs/cursor>.

---

## Distribution

bkit is **not** published to the npm registry. It's installed as a git dependency from `github.com/cbartens/bkit` (private repo). Consumers add it via:

```bash
pnpm add -D github:cbartens/bkit#v0.1.2
```

On install, pnpm clones the repo, runs the `prepare` lifecycle script (which runs `tsc` to compile `dist/`), and exposes the `bkit` bin. Auth = standard git auth (SSH or HTTPS PAT) — pnpm uses whatever your `git clone` would.

### Required consumer config — pnpm 10 build-script allowlist

pnpm 10 blocks `prepare` (and other lifecycle scripts) on git-hosted deps by default for security (`ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`). bkit relies on `prepare: "tsc"` to materialise `dist/` at install time, so the consumer must allowlist it. Pick one:

```yaml
# pnpm-workspace.yaml
onlyBuiltDependencies:
  - "@cbartens/bkit"
```

```json
// package.json (alternative)
{
  "pnpm": {
    "onlyBuiltDependencies": ["@cbartens/bkit"]
  }
}
```

Re-run `pnpm install` after adding. Without this, the package installs but `dist/bkit-install.js` won't exist and the `bkit` bin entry will fail with `ENOENT`.

## Install / regenerate

The `.agents/` directory is canonical. `bkit install` regenerates the host-specific outputs and rewrites bkit-managed blocks across the repo.

In a consumer repo (after `pnpm add -D github:cbartens/bkit`):

```bash
# Full install — all modules (core + claude + cursor + ci + lint + git-hooks)
pnpm exec bkit install

# Selective install — only specified modules + core (implicit)
pnpm exec bkit install --claude         # .claude/** + core
pnpm exec bkit install --ci --lint      # CI + lint stack + core
pnpm exec bkit install --cursor         # .cursor/** + core
pnpm exec bkit install --full           # all modules (same as no flags)

# Drift detection — exits non-zero on drift (CI gate)
pnpm exec bkit check --full
```

**Deprecated (v0.1.x; removed in v0.2):**

```bash
pnpm exec bkit init                    # → use `bkit install` instead
pnpm exec bkit install --host=claude   # → use `bkit install --claude` instead
```

In **this repo** (bkit's own dogfood — runs the script directly via tsx, not the bin):

```bash
pnpm tsx .agents/scripts/bkit-install.ts install
pnpm tsx .agents/scripts/bkit-install.ts check
```

The CI drift gate (`.github/workflows/ci.yml`) fails the PR if generated files diverge from what `install` would produce.

## Three-tier file ownership

bkit uses a three-tier model to handle different file ownership scenarios without clobbering consumer customizations.

<!-- prettier-ignore -->
| Tier | Semantics | Files |
| --- | --- | --- |
| **Tier 1 — Fully managed** | Idempotent rewrite of whole file on every install. Consumer should not edit directly. | `.cursor/hooks.json`, `.claude/hooks/preflight.sh`, `.cursor/hooks/preflight.sh`, `.vale/styles/House/**` |
| **Tier 2 — Managed-block** | bkit owns content between `bkit:start`/`bkit:end` markers. Consumer owns everything outside. File absent → write whole file. File present without markers → append block at EOF. | `.github/workflows/ci.yml`, `.vale.ini`, `.gitignore`, `.husky/pre-commit`, `.husky/pre-push`, `.prettierignore`, `rules.md`, `AGENTS.md`, `CLAUDE.md` |
| **Tier 3 — Seed-or-print** | Write if absent. If present, print suggested diff to stdout (never overwrite). | `slop-scan.config.json`, `.cursor/settings.json`, `package.json` script entries |

**Marker syntax** is format-specific:

- Markdown / `.gitignore`: `<!-- bkit:start -->` / `<!-- bkit:end -->`
- YAML / INI / shell: `# bkit:start` / `# bkit:end`

Comment prefixes (`# `, `// `) before markers are preserved on block updates.

### What install writes

<!-- prettier-ignore -->
| Path | Module | Source | Tier |
| --- | --- | --- | --- |
| `.agents/` (additive copy) | core | `PKG_AGENTS` (package's `.agents/`) | Additive copy — write-if-missing |
| `.bkit-version` | core | package.json version | Written LAST (so partial installs are detectable) |
| `.gitignore` | core | `.agents/templates/gitignore` | Tier 2 html-comment |
| `AGENTS.md`, `CLAUDE.md` | core | `.agents/templates/` | Tier 2 html-comment |
| `docs/**` | core | `.agents/templates/docs/` | Tier 2 html-comment |
| `.claude/commands/bkit-*.md` | claude | `.agents/workflows/` (byte-identical) | Host pass — always overwrite |
| `.claude/agents/bkit-*.md` | claude | `.agents/prompts/` (byte-identical) | Host pass — always overwrite |
| `.cursor/commands/bkit-*.md` | cursor | `.agents/workflows/` (T1+T2 transforms) | Host pass — always overwrite |
| `.cursor/agents/bkit-*.md` | cursor | `.agents/prompts/` (T3 transforms) | Host pass — always overwrite |
| `.github/workflows/ci.yml` | ci | `.agents/templates/.github/workflows/ci.yml` | Tier 2 hash-comment; tokens substituted |
| `.vale.ini` | lint | `.agents/templates/.vale.ini` | Tier 2 hash-comment |
| `.vale/styles/House/**` | lint | `.agents/templates/.vale/styles/House/` | Tier 1 (fully managed) |
| `slop-scan.config.json` | lint | `.agents/templates/slop-scan.config.json` | Tier 3 (seed-or-print) |
| `.prettierignore` | lint | `.agents/templates/.prettierignore` | Tier 2 hash-comment |
| `.husky/pre-commit` | git-hooks | `.agents/templates/.husky/pre-commit` | Tier 2 hash-comment |
| `.husky/pre-push` | git-hooks | `.agents/templates/.husky/pre-push` | Tier 2 hash-comment |
| `.cursor/hooks.json` | cursor | `.agents/templates/.cursor/hooks.json` | Tier 1 (fully managed) |
| `.cursor/settings.json` | cursor | `.agents/templates/.cursor/settings.json` | Tier 3 (seed-or-print) |

---

## Triggering workflows

Workflows can be triggered three ways: from a Linear comment (cloud), from Claude Code (interactive on laptop), or from Cursor (interactive on laptop). All paths execute the same workflow file from `.agents/workflows/` — the only differences are who pays for the compute and which model runs the orchestrator session.

### From Linear (cloud — Cursor Cloud Agent)

Mention `@curspr` in any Linear comment with a slash command and the issue ID:

```
@curspr /bkit-plan BAR-123
@curspr /bkit-build BAR-123
@curspr /bkit-ship BAR-123
```

The Linear ↔ Cursor integration spawns a Cloud Agent session, posts the session URL back as a Linear comment, and the workflow runs unattended. Progress lands in subsequent comments as each step completes.

**Requirements:** issue must carry the `Automated` label and a non-terminal state (preflight refuses otherwise). `LINEAR_API_KEY`, `CURSOR_API_KEY`, `ANTHROPIC_API_KEY`, and `GH_TOKEN` must all be set in the Cursor Cloud Agent dashboard env.

### From Claude Code (interactive — local)

Open the repo root in Claude Code (or run headless via the CLI) and run a slash command:

```
/bkit-design BAR-123        # produce a design doc
/bkit-plan BAR-123          # produce an implementation plan
/bkit-build BAR-123         # execute the plan in a worktree, open a PR
/bkit-debug BAR-123         # diagnose and remediate CI failures
/bkit-ship BAR-123          # merge the PR for the current branch, archive, close the issue
```

Claude reads issue details, comments, and plan files automatically via the Linear MCP (`mcp__claude_ai_Linear__*`).

**Requirements:** `LINEAR_API_KEY`, `GH_TOKEN`, and an active Claude Code session (subscription or `ANTHROPIC_API_KEY`). The session model should match the orchestrator pin in [`.agents/prompts.md`](prompts.md) § Orchestrators (Opus 4.7 for `/design` / `/plan` / `/debug`; Sonnet 4.6 for `/build` / `/ship`).

### From Cursor (interactive — local)

Cursor 2.4+ honours `.cursor/commands/bkit-*.md` and `.cursor/agents/bkit-*.md`. Trigger the same way:

```
/bkit-plan BAR-123
```

The orchestrator session reads the workflow file from `.cursor/commands/`. Subagents are dispatched via `Task` and run with whatever `model:` value is pinned in their frontmatter (no host-side override).

**Requirements:** `LINEAR_API_KEY`, `GH_TOKEN`. Cursor account in good standing.

---

## Adding or updating skills

> **Skills must be installed before first use** — initial setup is in `docs/setup.md`. Inventory and registry rules: [`.agents/skills.md`](skills.md).

Skills are third-party instruction sets loaded into the agent at invocation time.

```bash
npx skills find [query]           # search the registry
npx skills add <owner/repo> -y    # install project-locally into .agents/skills/
npx skills update                 # update all installed
```

The installed skill list lives in `.agents/skills.md`. Skills in `.agents/skills/` that are not listed there are pruned by the ship workflow's archive step.

---

## Key files

<!-- prettier-ignore -->
| File | Purpose |
| --- | --- |
| `.agents/rules.md` | Universal agent rules — read first by every workflow |
| `.agents/workflows.md` | Workflow pipeline reference (steps, verdicts, contracts) |
| `.agents/prompts.md` | Per-subagent description, effort tier, model, `maxTurns` |
| `.agents/docs.md` | Document index and phase-matrix (what to read per phase) |
| `.agents/skills.md` | Installed skills registry |
| `.agents/IDEs.md` | Claude vs Cursor differences and transform rules |
| `.agents/friction.md` | Friction log — orchestrator-observed recovery moments |
| `.agents/workflows/` | Canonical slash-command source (regenerated into `.{claude,cursor}/commands/`) |
| `.agents/prompts/` | Canonical subagent source (regenerated into `.{claude,cursor}/agents/`) |
| `.agents/templates/` | Bootstrap files copied / managed by `bkit install` (see § What install writes) |
| `.agents/scripts/bkit-install.ts` | Install script — regenerates host outputs and applies templates |
| `docs/plans/drafts/` | In-progress design and plan docs |
| `docs/plans/active/` | Approved plans (cleared for `/bkit-build`) |
| `docs/plans/completed/YYYYMM/` | Archived plans post-ship |
| `docs/plans/logs/{FID}/` | Per-run workflow logs (status, subagent outputs) |
| `docs/audits/` | Audit reports written/updated by `bkit-utility-audit-*` agents |
| `docs/completed.md` | Shipped features index |
| `docs/pending.md` | Deferred items |

---

## Editing workflows or prompts

Edit the source in `.agents/workflows/` (slash-command orchestrators) or `.agents/prompts/` (subagent files), then re-run install:

```bash
# Edit source
vim .agents/workflows/bkit-build.md

# Regenerate
bun .agents/scripts/bkit-install.ts install

# Commit both source and generated output together
git add .agents/workflows/bkit-build.md .claude/commands/bkit-build.md .cursor/commands/bkit-build.md
git commit -m "chore: update build command"
```

Adding a new subagent? Update [`.agents/prompts.md`](prompts.md) with the row (frontmatter rationale + `maxTurns` calibration + model assignment) before re-running install — the file is the single source of truth for agent metadata, and the CI drift gate enforces consistency.
