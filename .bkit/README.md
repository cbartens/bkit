# bkit — Agent Workflow System

**bkit** wires Claude Code (and Cursor) into a five-phase tracker-integrated development cycle: `/bkit-design` → `/bkit-plan` → `/bkit-build` → `/bkit-debug` → `/bkit-ship`. Hosts are additive: `.claude/` + `.cursor/` always render (direct Anthropic); `bkit install --opencode=<provider>` adds an opencode host for non-Anthropic backends — seven providers: `ollama-local`, `nvidia`, `groq`, `cerebras`, `openrouter`, `ollama` (cloud), and `zen` (opencode-native gateway, alias `go`; auth via `OPENCODE_API_KEY`) — same harness, only the inference backend changes (see `.bkit/providers.md` § Hosts + Providers).

This README covers what bkit does, how to install it, and what env / tracker setup it expects. Workflow internals live in `.bkit/workflows.md`; subagent metadata (effort, model, tool surface, `maxTurns`) lives in `.bkit/prompts.md`.

---

## How a workflow runs (end-to-end example)

Typical cycle for issue `ISSUE-123` "Add feature X":

1. **Tracker issue** is created with the **`bkit:auto`** label and a non-terminal state (e.g. `Backlog`, `In Progress`).
2. **Trigger** — tracker comment (`@cursor /bkit-plan ISSUE-123`) or slash command in Claude Code / Cursor (`/bkit-plan ISSUE-123`).
3. **Workflow Step 1** — preflight hook checks the `bkit:auto` label, acquires `.lock`, sets tracker label `bkit:plan` + state `In Progress`, creates one workflow comment.
4. **Step 2 — worktree** — git worktree at `.worktrees/issue-123-add-feature/` on branch `feat/issue-123-add-feature`. Env files (`.env*`) copied across, `pnpm install --frozen-lockfile` run.
5. **Phase steps** — workflow dispatches subagents (`@bkit-plan-generate`, then `@bkit-plan-review-1` ‖ `-2` ‖ `-3` as a parallel triplet, etc.). Each writes to `docs/plans/{YYYYMM}/logs/{FID}/` (`{YYYYMM}` = canonical month bucket, set at design start) and appends one fenced section to the tracker comment.
6. **Phase summary** — subagent emits a verdict (`PASS` / `CONCERNS` / `FAIL`); workflow commits `chore(issue-123-…): summary bkit [skip build] bkit [skip ci]` (design / plan) or `chore(issue-123-…): summary` (build / debug / ship) → push.
7. **Close Workflow** — transitions tracker state to `In Review`; phase label persists. For `/bkit-design` and `/bkit-plan`, worktree is pruned and `feat/issue-123-…` deleted (changes merged into `dev`). For `/bkit-build` / `/bkit-debug`, worktree persists.
8. **Human review** — design / plan doc lives at `docs/plans/{YYYYMM}/{FID}-{design,plan}.md` (canonical, durable). Reviewer can re-trigger or progress to `/bkit-build`.
9. **`/bkit-build`** — re-creates worktree, executes plan, runs lint/typecheck/unit tests, opens PR to `dev`.
10. **CI** — runs on the PR. Red CI? Trigger `/bkit-debug` (PR debug mode pulls failed run logs via `gh run view --log-failed`). Green? Trigger `/bkit-ship`.
11. **`/bkit-ship`** — squash-merges PR, runs `@bkit-ship-update-docs` ‖ `@bkit-ship-summary` (parallel) on `dev`, prunes worktree, moves issue to `In Review` (adds `bkit:merged`; bkit never auto-closes — a human reviews and closes). Plans stay at canonical `docs/plans/{YYYYMM}/` — no archive move (files never move under the new layout).

Throughout: workflows hold the `.lock`, write `status.jsonl` (resume SoT), and own all tracker MCP calls — subagents are leaves with read-only tracker access (none) and write access scoped by their `tools:` allowlist.

---

## The five phases

<!-- prettier-ignore -->
| Phase | Command | Steps | Output | Hard stop? |
| --- | --- | --- | --- | --- |
| Design | `/bkit-design` | 10 | `docs/plans/{YYYYMM}/{FID}-design.md` | Yes — review before plan |
| Plan | `/bkit-plan` | 11 | `docs/plans/{YYYYMM}/{FID}-plan.md` (+ `-N.md` if split) | Yes — review before build |
| Build | `/bkit-build` | 18 | PR to `dev` | No — CI continues |
| Debug | `/bkit-debug` | 10 | Remediation commit on feature branch | No |
| Ship | `/bkit-ship` | 13 | Squash-merged PR, issue `In Review` + `bkit:merged` (plans stay canonical at `docs/plans/{YYYYMM}/`) | Yes |

Plus two human-triggered utilities: `/bkit-worktree-sync` (merge worktree branch into IDE branch) and `/bkit-worktree-prune` (remove worktree and optionally branch).

**Per-step detail, verdict routing, retry / timeout constants, label flips, status.jsonl shape, comment lifecycle:** `.bkit/workflows.md`.

**Per-subagent scope, effort tier, tool surface, `maxTurns`, model assignment:** `.bkit/prompts.md`.

---

## Prerequisites

### Required tools

<!-- prettier-ignore -->
| Tool | Version | Used for |
| --- | --- | --- |
| `pnpm` | matches `package.json` `packageManager` | Workspace install (`pnpm install --frozen-lockfile`) inside worktrees, lint/typecheck/test gates. Also runs the bkit CLI (`bkit install` with the alias below; `pnpm tsx .bkit/src/bkit-install.ts` in bkit's own dev). |
| `gh` | latest, authenticated | PR create / view / merge in `/bkit-build`, `/bkit-debug`, `/bkit-ship` |
| `git` >= 2.5 | — | Worktree operations |
| `jq` | latest | `status.jsonl` append operations in workflow Bash |
| Claude Code CLI | latest | Local-IDE workflow execution |
| Cursor (optional) | 2.4+ | Cloud Agent execution; honours `tools:` frontmatter allowlist |

### Shell alias

bkit is a devDependency — add this alias once so you can type `bkit <verb>` directly:

```bash
# Add to ~/.zshrc (or ~/.bashrc), then: source ~/.zshrc
alias bkit='pnpm bkit'
```

`bkit doctor` emits a `bkit-not-on-path` advisory if the alias is absent. For `bkit cursor` / `bkit opencode` (GUI app launchers), run from the repo root in an external terminal — not from inside the running app.

### Environment variables

Add to your shell, the Cursor Cloud Agent dashboard, and `apps/web/.env.example` so contributors know what's needed. The exact set depends on which issue tracker you configure via `bkit install --tracker=<name>`:

**GitHub tracker (default — `bkit install --tracker=github`):**

```env
# ==========================================
# BKIT: CURSOR CLAUDE GITHUB INTEGRATION
# ==========================================
CURSOR_API_KEY=""
ANTHROPIC_API_KEY=""
GH_MCP_TOKEN=""
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
GH_MCP_TOKEN=""
```

<!-- prettier-ignore -->
| Variable | Tracker | Where read | Purpose |
| --- | --- | --- | --- |
| `GH_MCP_TOKEN` | all | GitHub MCP server (`Authorization: Bearer`) | Issue/label/PR writes via MCP. Fine-grained PAT (Contents, PRs, Issues, Actions, Workflows, Metadata — R/W). |
| `GH_TOKEN` | all | `gh` CLI inside **CI workflow Bash only** (`GH_TOKEN: ${{ github.token }}`) | Not seeded in `.bkit/.env` — local `gh` uses `gh auth login` keyring (#287). |
| `GITHUB_ISSUE_ID` | github | Injected from PR body metadata marker `<!-- bkit:issue=#NNN -->` | Identifies the linked GitHub issue. Injected automatically — do not set manually. |
| `ANTHROPIC_API_KEY` | all | Claude Code (headless / CI) | Required when Claude is invoked outside an interactive session (e.g. cloud automation, CI runs). |
| `CURSOR_API_KEY` | all | Cursor Cloud Agent dashboard / programmatic invocation | Required for non-interactive Cursor sessions. |
| `LINEAR_API_KEY` | linear | Preflight hooks (`.{claude,cursor}/hooks/preflight.sh`); workflow Linear MCP via OAuth fallback | Query issue state + labels for the `Auto` gate; fail-fast if absent. |
| `LINEAR_WEBHOOK_SECRET` | linear | Linear → Cursor integration backend | Verifies webhook signatures on `@cursor` mentions. Set in the Linear ↔ Cursor integration config. |

`LINEAR_ISSUE_ID` (Linear tracker) and `GITHUB_ISSUE_ID` (GitHub tracker) are set automatically by the workflow context — do not set them manually.

### Tracker workspace setup

Bkit uses one custom label (`Auto`), plus integration label families. The setup depends on your configured tracker.

#### Bkit custom label (`Auto`)

- **`Auto`** — present on issues approved for agent work. Preflight hooks check this label and refuse the session if it is absent or the issue is in a terminal state (`Done` / `Cancelled` / closed). Add this label to your tracker workspace before running any cloud / automation session.
  - **GitHub:** the label is a GitHub issue label named `bkit:auto`. `bkit install --tracker=github` seeds the label via the GitHub MCP on first run.
  - **Linear:** the label is a Linear label named `Auto`. Add it manually to your Linear workspace.

#### Phase labels (GitHub tracker)

When `bkit.issueTracker = "github"`, Cursor reads the phase label on the PR to know which workflow to dispatch. Labels: `bkit:design`, `bkit:plan`, `bkit:build`, `bkit:debug`, `bkit:ship`. The Cursor GitHub App must be installed on the consumer's repo or org (prerequisite for GitHub dispatch). `/bkit-design` and `/bkit-plan` have no PR — they are local-IDE-only on Cursor cloud.

#### Linear ↔ Cursor integration labels (Linear tracker only)

Three **parent labels** (`branch`, `model`, `repo`) — sub-labels under each set context for the Cursor Cloud Agent session. If a sub-label is present on the issue, Cursor follows it; otherwise the integration's defaults apply.

<!-- prettier-ignore -->
| Parent | Example sub-labels in this workspace | What it controls |
| --- | --- | --- |
| `branch` | `dev` | git branch the agent works on |
| `model` | `claude-opus-4-8-thinking-high`, `composer-2.5`, `gpt-5.5-high`, `gpt-5.3-codex-high`, … | Cursor model the orchestrator runs on |
| `repo` | `<owner>/<consumer-repo>` | repo the agent operates in |

Per-agent (subagent) model assignments live in `.bkit/prompts.md` § Models; Cursor Cloud Agent reads each subagent file's frontmatter `model:` directly. The Linear `model:*` sub-labels only set the **orchestrator-session** model. Keep them in sync with `.bkit/providers.md` § Cursor model catalog.

For full Linear ↔ Cursor integration setup (webhook routing, dashboard env vars, parent-label families), see Linear's official integration docs: <https://linear.app/docs/cursor>.

---

## Distribution & install

Consumer-facing install, auth (`GH_BKIT_TOKEN` / `.npmrc` / GHA / Vercel), and CLI verbs (`install` / `check` / `doctor` / `uninstall` / `upgrade`) live in the root `README.md`.

The `.agents/` directory is **canonical**. `bkit install` regenerates host-specific outputs (`.claude/**`, `.cursor/**`) and rewrites bkit-managed blocks across the consumer repo.

### Dogfood path (this repo only)

bkit's own repo runs the install script directly via `tsx` instead of the published bin:

```bash
pnpm tsx .bkit/src/bkit-install.ts install
pnpm tsx .bkit/src/bkit-install.ts check
```

The CI drift gate (`.github/workflows/ci.yml`) fails the PR if generated files diverge from what `install` would produce.

## Three-tier file ownership

bkit uses a three-tier model to handle different file ownership scenarios without clobbering consumer customizations.

<!-- prettier-ignore -->
| Tier | Semantics | Files |
| --- | --- | --- |
| **Tier 1 — Fully managed** | Idempotent rewrite of whole file on every install. Consumer should not edit directly. | `.cursor/hooks.json`, `.claude/hooks/preflight.sh`, `.cursor/hooks/preflight.sh`, `.vale/styles/House/**` |
| **Tier 2 — Managed-block** | bkit owns content between `bkit:start`/`bkit:end` markers. Consumer owns everything outside. File absent → write whole file. File present without markers → append block at EOF. | `.vale.ini`, `.gitignore`, `.prettierignore`, `rules.md`, `AGENTS.md`, `CLAUDE.md` |
| **Tier 3 — Seed-or-print** | Write if absent. If present, print suggested diff to stdout (never overwrite). | `.husky/pre-commit`, `.husky/pre-push` (v2.0.4+), `slop-scan.config.json`, `.cursor/settings.json`, `.github/workflows/ci.yml` |
| **Managed package.json keys** (v0.4.0) | Add-if-missing semantics on the `scripts` and `devDependencies` blocks. Existing keys are NEVER overwritten — consumer pins always win. Drift detection via `bkit check` flags missing keys when their parent module is enabled. | All under `--typescript` (#265): `scripts.typecheck` / `format:check` / `lint:prose` / `lint:slop` / `slop:delta` / `prepare`; `devDependencies.prettier` + `slop-scan` + `lint-staged` + `husky`. The stack-agnostic `--ci` adds NO package.json keys. |

**Marker syntax** is format-specific:

- Markdown / `.gitignore`: `<!-- bkit:start -->` / `<!-- bkit:end -->`
- YAML / INI / shell: `# bkit:start` / `# bkit:end`

Comment prefixes (`# `, `// `) before markers are preserved on block updates.

### What install writes

<!-- prettier-ignore -->
| Path | Module | Source | Tier |
| --- | --- | --- | --- |
| `.agents/{rules,docs,skills}.md` | core | `.bkit/templates/.agents/` | Tier 2 html-comment (via templates pass — NOT the additive payload copy) |
| `.bkit/friction.md`, `.bkit/.env.example` | core | `.bkit/templates/.bkit/` | Tier 2 html-comment / Tier 3 seed |
| `.agents/` + `.bkit/` (payload cleanup/migration pass) | core | — | Removes relocated old-layout orphans (`.agents/workflows`, `.agents/prompts`, the moved reference docs) and migrates `.agents/{.bkit-version,.env,.env.example,friction.md}` → `.bkit/` for old-layout consumers (content-preserving) |
| `.bkit/version` | core | package.json version | Written LAST (so partial installs are detectable) |
| `.gitignore` | core | `.bkit/templates/gitignore` | Tier 2 html-comment |
| `AGENTS.md`, `CLAUDE.md` | core | `.bkit/templates/` | Tier 2 html-comment |
| `docs/**` | core | `.bkit/templates/docs/` | Tier 2 html-comment |
| `.claude/commands/bkit-*.md` | claude | `.bkit/workflows/` (byte-identical) | Host pass — always overwrite |
| `.claude/agents/bkit-*.md` | claude | `.bkit/prompts/` (byte-identical) | Host pass — always overwrite |
| `.cursor/commands/bkit-*.md` | cursor | `.bkit/workflows/` (T1+T2 transforms) | Host pass — always overwrite |
| `.cursor/agents/bkit-*.md` | cursor | `.bkit/prompts/` (T3 transforms) | Host pass — always overwrite |
| `.github/workflows/ci.yml` | ci | `.bkit/templates/.github/workflows/ci.yml` | Tier 3 (seed-or-print); tokens substituted on first write |
| `.github/renovate.json5` | renovate | `.bkit/templates/.github/renovate.json5` | Tier 1 (canonical-overwrite). **Opt-in via `bkit install --dependency=renovate`** — not part of a default install. Phase-gated against `origin/<default-branch>`: Phase A lands the file and prompts merge to default branch; Phase B (re-run after merge) prints the GitHub App install URL. `baseBranches: ["dev"]` per bkit branch protection. **Mutually exclusive with `--dependabot`**. |
| `.github/dependabot.yml` | dependabot | `.bkit/templates/.github/dependabot.yml` | Tier 1 (canonical-overwrite). **Opt-in via `bkit install --dependency=dependabot`** — not part of a default install. First-party GitHub feature; no App install or phase gate. **Mutually exclusive with `--renovate`**. Less monorepo-aware than Renovate but no third-party trust surface and no onboarding race. |
| `.bkit/scripts/bkit-set-dependabot.sh` | dependabot | `.bkit/templates/.bkit/scripts/bkit-set-dependabot.sh` | Tier 1 (canonical-overwrite), executable. Enables repo-level Dependabot state (auto-fixes-enabled, vulnerability-alerts, never-auto-merge-on-main policy) via `gh api`. Run once after `bkit install --dependency=dependabot`. |
| `.vale.ini` | ci | `.bkit/templates/.vale.ini` | Tier 3 (seed-or-print). Vale is stack-agnostic (#265) → ships with `--ci`. |
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

Three capabilities are **opt-in** and excluded from a default install: the **issue tracker** (`--tracker=github|linear`), the **dependency updater** (`--dependency=renovate` or `--dependency=dependabot`, mutually exclusive), and **cloud agents** (`--auto=claude|cursor|opencode`, ships the phase-routed `bkit-cloud.yml` + cloud env scaffolding — `cloud-bootstrap.sh`, Cursor `Dockerfile`/`environment.json` — so a default install ships zero cloud footprint). A default install wires none; the post-install advisory banner emits `tracker-setup-none` / `dep-updater-none` / `cloud-router-none` to nudge the consumer to choose once. Choices persist in `package.json` (`bkit.issueTracker`, `bkit.depUpdater`, `bkit.cloudAgents`); setting any to `"none"` silences its nudge. The cloud router is split out because each job is inert without its model-auth secret (`ANTHROPIC_API_KEY` for the claude job, `OPENCODE_PROVIDER_KEY` for the opencode job) + GHA write permissions + (Cursor half) a dashboard trigger, and it depends on the opt-in GitHub tracker . Full consumer-facing rationale and the decide/silence flow live in the root `README.md` § Optional post-install decisions. bkit-repo itself dogfoods neither updater by default — opt in explicitly when testing.

### dogfood rule — updater PRs against workflows (only if you opt in)

bkit dogfoods its own templates: `.bkit/templates/.github/workflows/*.yml` (canonical) and `.github/workflows/*.yml` (bkit's own copy) must stay byte-equal where they overlap. An updater (Renovate/Dependabot) scans only the actual workflow path (`.github/workflows/`), not the template path. This dance applies ONLY if bkit-repo has opted into an updater (`bkit install --dependency=renovate` / `--dependency=dependabot`) — by default it ships neither. When an updater PR opens against bkit's own workflows:

1. Before merging, manually edit the matching `.bkit/templates/.github/workflows/*.yml` file with the same SHA bump (one `Edit` call per file).
2. Run `pnpm test` (the `bkit-templates.content.test.ts` snapshot will regenerate via `pnpm vitest run .bkit/src/bkit-templates.content.test.ts -u` if the ci.yml shape changed; commit the updated snapshot).
3. Push the template-side change to the updater PR's branch (or land both in a single follow-up commit on `dev` if the branch is read-only).

This only applies to the bkit repo itself — consumers don't have the templates; their `.github/workflows/ci.yml` is Tier 3 (seed-or-print), so updater bumps survive every install. `bkit-cloud.yml` is Tier 1 (auto-overwrite); consumers receive new SHA pins automatically on each `bkit install`. The shipped `renovate.json5` includes a packageRule with `matchFileNames: [".github/workflows/bkit-cloud.yml"]` + `enabled: false`; the shipped `dependabot.yml` covers the `github-actions` ecosystem at `/` (consumers tune ignore patterns for bkit-managed files if needed).

---

## Triggering workflows

Three trigger paths: Linear comment (cloud), Claude Code (interactive local), Cursor (interactive local). All execute the same workflow file from `.bkit/workflows/` — differences are compute source and orchestrator model.

### From a tracker comment (cloud — Cursor Cloud Agent)

**Linear tracker:** Mention `@cursor` in any Linear comment with a slash command and the issue ID:

```
@cursor /bkit-plan ISSUE-123
@cursor /bkit-build ISSUE-123
@cursor /bkit-ship ISSUE-123
```

`@cursor` is **Cursor's standard Linear integration** — not a bkit-specific hook, and bkit runs no Linear webhook of its own. The native integration spawns a Cloud Agent session and posts the session URL back as a Linear comment; that agent runs the bkit workflow only because every Cursor cloud agent reads root `AGENTS.md`, which routes the `/bkit-*` slash command from the comment to the matching file in `.bkit/workflows/`. Progress lands in subsequent comments as each step completes.

**GitHub tracker:** Dispatch is via PR-label trigger — Cursor Automations "Pull request label changed" event. The `bkit:auto` label on the PR (written by `bkit-build`) triggers the dispatch; the phase label (`bkit:plan`, `bkit:build`, etc.) tells Cursor which workflow to run. Issue comments are posted via the GitHub MCP. `/bkit-design` and `/bkit-plan` have no PR so they are local-IDE-only on Cursor cloud for the GitHub tracker.

**Requirements (Linear):** issue must carry the `Auto` label and a non-terminal state (preflight refuses otherwise). `LINEAR_API_KEY`, `CURSOR_API_KEY`, `ANTHROPIC_API_KEY`, and `GH_MCP_TOKEN` must all be set in the Cursor Cloud Agent dashboard env.

**Requirements (GitHub):** `GH_MCP_TOKEN`, `CURSOR_API_KEY`, `ANTHROPIC_API_KEY` in the dashboard env. Cursor GitHub App must be installed on the repo/org. `GITHUB_ISSUE_ID` is injected from the PR body metadata marker `<!-- bkit:issue=#NNN -->` — no manual setup.

### From Claude Code (interactive — local)

Open repo root in Claude Code (or run headless via CLI) and run a slash command:

```
/bkit-design ISSUE-123      # produce a design doc
/bkit-plan ISSUE-123        # produce an implementation plan
/bkit-build ISSUE-123       # execute the plan in a worktree, open a PR
/bkit-debug ISSUE-123       # diagnose and remediate CI failures
/bkit-ship ISSUE-123        # merge the PR for the current branch, archive, close the issue
```

Claude reads issue details, comments, and plan files automatically via the tracker MCP.

**Requirements:** `GH_MCP_TOKEN`, and an active Claude Code session (subscription or `ANTHROPIC_API_KEY`). `LINEAR_API_KEY` additionally required when `bkit.issueTracker = "linear"`. Session model should match the orchestrator pin in `.bkit/prompts.md` § Orchestrators (Opus 4.8 for `/design` / `/plan` / `/debug`; Sonnet 4.6 for `/build` / `/ship`).

### From Cursor (interactive — local)

Cursor 2.4+ honours `.cursor/commands/bkit-*.md` and `.cursor/agents/bkit-*.md`. Trigger the same way:

```
/bkit-plan ISSUE-123
```

Orchestrator session reads workflow file from `.cursor/commands/`. Subagents are dispatched via `Task` and run with whatever `model:` value is pinned in their frontmatter (no host-side override).

**Requirements:** `GH_MCP_TOKEN` (GitHub tracker, default) or `LINEAR_API_KEY` (Linear tracker). Cursor account in good standing.

---

## Adding or updating skills

> **Skills must be installed before first use** — initial setup is in `docs/setup.md`. Inventory and registry rules: `.agents/skills.md`.

Skills are third-party instruction sets loaded into the agent at invocation time.

```bash
npx skills find [query]           # search the registry
npx skills add <owner/repo> -y    # install project-locally into .agents/skills/
npx skills update                 # update all installed
```

The installed skill list lives in `.agents/skills.md`. Skills in `.agents/skills/` not listed there are pruned by the ship workflow's archive step.

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
| `.bkit/friction.md` | Friction log — orchestrator-observed recovery moments |
| `.bkit/workflows/` | Canonical slash-command source (regenerated into `.{claude,cursor}/commands/`) |
| `.bkit/prompts/` | Canonical subagent source (regenerated into `.{claude,cursor}/agents/`) |
| `.bkit/templates/` | Bootstrap files copied / managed by `bkit install` (see § What install writes) |
| `.bkit/src/bkit-install.ts` | Install script — regenerates host outputs and applies templates |
| `docs/plans/{YYYYMM}/` | Canonical month bucket — `{FID}-design.md`, `{FID}-plan.md` (+ `-N.md` if split). Files never move; `{YYYYMM}` = creation month, set once at design start. |
| `docs/plans/{YYYYMM}/logs/{FID}/` | Per-run workflow logs (status, subagent outputs). Delete-eligible — bulk cleanup is `rm -rf docs/plans/{YYYYMM}/logs/`. Canonical artifacts above are not affected. |
| `docs/audits/` | Audit reports written/updated by `bkit-utility-audit-*` agents |
| `docs/completed.md` | Shipped features index |
| `docs/pending.md` | Deferred items |

---

## Editing workflows or prompts

Edit source in `.bkit/workflows/` (slash-command orchestrators) or `.bkit/prompts/` (subagent files), then re-run install:

```bash
# Edit source
vim .bkit/workflows/bkit-build.md

# Regenerate (run dist binary; faster than tsx and matches what consumers run)
pnpm build && node dist/bkit-install.js install

# Commit both source and generated output together
git add .bkit/workflows/bkit-build.md .claude/commands/bkit-build.md .cursor/commands/bkit-build.md
git commit -m "chore: update build command"
```

Adding a new subagent? Update `.bkit/prompts.md` with the row (frontmatter rationale + `maxTurns` calibration + model assignment) before re-running install — the file is the single source of truth for agent metadata, and the CI drift gate enforces consistency.
