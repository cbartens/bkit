# bkit

Agent workflow system wiring Claude Code (and Cursor) into a five-phase Linear-integrated dev cycle: `/bkit-design` → `/bkit-plan` → `/bkit-build` → `/bkit-debug` → `/bkit-ship`.

## Why bkit

bkit runs a coding agent through the process a senior engineering team would insist on — design review, an adversarial code challenge, a test gate, and a release checklist — on every feature, with gates a human signs off on. Each phase fans work out to specialised subagents, several running in parallel under different lenses (one reviews for bugs while another reviews for security), so output is reviewed by independent agents before you see it.

Three things that change how you work:

- **Parallel by design.** Every run executes in its own isolated git worktree, so you can run many pipelines at once — design one feature while building a second and shipping a third — with no branch-switching, stashing, or conflicts between them.
- **Tied to your tracker.** bkit integrates with GitHub Issues or Linear: it reads the issue for context, posts progress per phase, moves the issue through its states, and links the resulting PR back. Project management stays the source of truth.
- **Consistent across the team.** Anyone, in Claude Code or Cursor, runs `/bkit-design` and gets the same reviewed, gated, tested pipeline. The rigor lives in the toolkit, not in one person's prompting.

Beyond the pipeline and its tracker integration, every `bkit install` wires in the engineering scaffolding a repo needs on day one:

- **A CI scaffold where green means validated.** A four-job GitHub Actions pipeline — `bkit-decide` (plans what should run) → `bkit-tests` → `bkit-tests-live` → `bkit-tests-check` — whose always-on capstone fails the build if any tier the plan expected was skipped. "CI is green" stops meaning "nothing visibly failed" and starts meaning "the planned tests actually ran and passed"; the capstone is the single branch-protection required check, so a partial, cached, or light run can't pass as validated. Direct pushes auto-escalate to a full run. The complete multi-tier scaffold ships documented step-by-step in the seeded `ci.yml`, ready to adopt as the project grows.
- **Quality gates, local and CI in lockstep.** Typecheck, Prettier, a Vale prose linter, an LLM-slop scanner, actionlint, and a mirror/drift gate run in the seeded pre-commit / pre-push hooks **and** in CI — the same commands in both places, so a green local push is a green CI run.
- **Dependency updates, pre-tuned.** Opt-in Renovate or Dependabot, shipped already configured: grouped auto-merge for non-major bumps, SHA-pinned GitHub Actions, lockfile maintenance, and CVE alerts that bypass the weekly schedule.
- **Cloud agents.** Opt-in autonomous routing: when CI finishes, a Claude Code or Cursor cloud agent picks up automatically — `bkit-ship` on green, `bkit-debug` on red — with no local session running.
- **Run the pipeline on any model, keep the harness.** Beyond the always-on Claude Code and Cursor hosts, `bkit install --opencode=<provider>` adds a third **opencode** execution host that talks to its backend directly — no router, no model-identity lie. Seven providers ship ready-to-run, curated per-agent pins: local **Ollama**, NVIDIA **NIM**, **Groq**, **Cerebras**, **OpenRouter**, cloud **Ollama**, and opencode's own managed **zen** gateway — spanning fully-local, free-tier, and paid inference. Hosts are additive (opencode installs alongside claude/cursor, never replacing them); the subagents, gates, hooks, and MCP config are unchanged, only the backend and per-agent model pins differ. `bkit status` shows installed hosts + active providers; `bkit doctor` checks credentials and tool reachability. (See `.bkit/providers.md` § Supported hosts + Providers.)
- **Switch IDE or provider mid-feature — continue with the same settings.** A run's state lives in `status.jsonl`, the plan/design docs under `docs/plans/`, and the tracker issue — never in one vendor's session — and every host renders from the same `.bkit/` source, so each phase — or a resumed run — can execute on whichever host and provider you have capacity for, with identical gates, hooks, and per-agent model pins. Exhaust a Claude weekly limit or a provider's free-tier quota partway through a feature? Pick it up in Cursor, or on a free/local opencode provider, and the same gated pipeline carries on — no re-setup, no lost context. The same portability makes it cheap to dogfood a feature on free or local inference and ship it on your primary model.

For the full pipeline and subagent reference, and a mapping against Antonio Gulli's _Agentic Design Patterns_ (12 of 22 patterns fully implemented, several beyond the book), see [`.bkit/comparison.md`](.bkit/comparison.md).

> [!IMPORTANT]
> **`GH_BKIT_TOKEN` is required everywhere bkit installs.** Without it, `pnpm install` fails with an opaque 401 (or the silent-ignore-then-fall-back-to-npmjs footgun → 404). Set it in **all four** places before running `pnpm add -D @cbartens/bkit`:
>
> 1. **Local shell** — pick one of two flows (see § Local env setup for details):
>    - **(A) Quick:** `export GH_BKIT_TOKEN=<classic PAT>` in `~/.zshrc` or `~/.bashrc`. Works immediately, single-step. Same token leaks into every shell.
>    - **(B) direnv + `.bkit/.env` (recommended for daily use):** `brew install direnv` once per machine, then `.bkit/.env` (gitignored, scaffolded by `bkit install`) auto-loads on `cd`. Tokens scoped to the repo, not your whole shell. Note: `.bkit/.env` only exists _after_ `bkit install` runs, so for the first install you need either (A) or a one-off `export` in the current shell.
> 2. **`.npmrc` at repo root** — registry mapping only; token goes in pnpm user-level config via `pnpm config set` — see § Consumer CI auth below
> 3. **GitHub Actions repo secret** — `gh secret set GH_BKIT_TOKEN --body=<token>` per consumer repo
> 4. **Vercel env vars** (if applicable) — `vercel env add GH_BKIT_TOKEN preview/production`
>
> **Use a classic PAT, not fine-grained.** GitHub Packages npm registry currently rejects fine-grained PATs with HTTP 403 even when `Packages: read` is granted (verified 2026-05). Until GitHub fixes this, classic with `read:packages` scope is the only working option.

## Quick install — paste this into your AI

After creating a classic GitHub PAT with `read:packages` scope ([Tokens (classic)](https://github.com/settings/tokens)) and saving it as `GH_BKIT_TOKEN=<token>` in a local env file in this repo (e.g. `.env.local`, `apps/web/.env.preview`), copy the block below into Claude Code / Cursor / any coding agent. Replace `<ENV-FILE-PATH>` with your env file's path.

````text
Please install the latest `@cbartens/bkit` in this repo.

1. I've created a classic GitHub PAT with `read:packages` scope and saved it as `GH_BKIT_TOKEN=<token>` in `<ENV-FILE-PATH>` (for example `.env.local` or `apps/web/.env.preview`). Confirmed.

2. To access `GH_BKIT_TOKEN` without leaking it into your context: `source` is a shell builtin, not file I/O — the permission layer that gates `Read` / `grep` / `cat` does NOT see it, and the token text never enters your context. Use this pattern in a single Bash tool call:

   ```bash
   set -a; source <ENV-FILE-PATH> 2>/dev/null; set +a; <command that needs the token>
   ```

   Verify the token loaded without leaking the value: `echo "len=${#GH_BKIT_TOKEN}"`.

   Caveat: shell state does NOT persist between separate Bash tool calls. The `source` and the consuming command MUST run in the SAME invocation — chain with `;` or `&&`.

3. Ensure `.npmrc` at the repo root contains the registry mapping (create or update). The auth token is **NOT** stored here — pnpm >=10.34.3 401s on a project-`.npmrc` `${GH_BKIT_TOKEN}` env-substitution:

   ```
   @cbartens:registry=https://npm.pkg.github.com
   ```

   Then write the token into pnpm's user-level config, resolve and install the latest `@cbartens/bkit`, and seed both hosts + the tooling stack in a single Bash call (`bkit install` requires you to name the modules — core is implicit):

   ```bash
   set -a; source <ENV-FILE-PATH>; set +a; \
     pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN" && \
     pnpm add -D @cbartens/bkit@latest && \
     pnpm exec bkit install --claude --cursor --tooling
   ```

   `pnpm exec bkit install --claude --cursor --tooling` seeds `.agents/`, `.claude/`, `.cursor/`, CI workflows, lint, and git-hooks. Report the resolved version and any advisories printed by `bkit install`.

4. After install, read bkit's canonical templates at `node_modules/@cbartens/bkit/.bkit/templates/` (husky hooks, CI workflows, `.claude/settings.json`, `.cursor/` config, renovate, vale, etc.). You MUST reconcile them against this repo's existing config and adopt as much as possible without breaking existing functionality — bkit's seed-or-print files (e.g. `ci.yml`) do NOT overwrite an existing file, so adoption is your job. For any template you choose not to adopt, state which one and why.
````

## Install

bkit is distributed via the **GitHub Packages npm registry** (`https://npm.pkg.github.com`). Add to a consumer repo:

```bash
pnpm add -D @cbartens/bkit@^4.0.0
```

### Adding a new consumer — checklist

Run these in order on a brand-new consumer repo. Each step links to its detail section below.

<!-- prettier-ignore -->
| # | Step | Detail |
| --- | --- | --- |
| 1 | Create a classic PAT with `read:packages` (fine-grained PATs are rejected by GitHub Packages) | [§ Consumer CI auth](#consumer-ci-auth) step 1 |
| 2 | Add `GH_BKIT_TOKEN` repo secret | [§ Consumer CI auth](#consumer-ci-auth) step 2 |
| 3 | Commit `.npmrc` at repo root (registry mapping only; token goes in pnpm user-level config) | [§ Consumer CI auth](#consumer-ci-auth) step 3 |
| 4 | Export `GH_BKIT_TOKEN` for the `pnpm add` step (one-off — `export GH_BKIT_TOKEN=<classic PAT>` in this shell only), then run `pnpm add -D @cbartens/bkit` | [§ Install](#install) (this section) |
| 5 | Run `pnpm exec bkit install --claude --cursor --tooling` to seed both hosts + tooling (creates `.bkit/.env.example` + `.envrc`) | [§ Install](#install) (this section) |
| 5a | Set up direnv + `.bkit/.env` so every subsequent shell auto-loads `GH_BKIT_TOKEN`, `GH_TOKEN`, `LINEAR_API_KEY` | [§ Local env setup](#local-env-setup) |
| 6 | If deploying to Vercel: add `GH_BKIT_TOKEN` to Vercel env vars | [§ Consumer Vercel auth](#consumer-vercel-auth) |
| 7 | Push to a feature branch and verify CI runs green | — |

The seeded `.github/workflows/ci.yml` install step writes the token into pnpm's user-level config (`pnpm config set …`) before `pnpm install` and carries the `GH_BKIT_TOKEN` env block — the only thing CI needs to authenticate `@cbartens/bkit` is the `GH_BKIT_TOKEN` secret set in step 2. No cross-org `uses:` reference is added; `bkit` stays private without affecting consumer auth.

### Then in the consumer repo

`bkit install` requires you to name the modules to install (at least one) — a bare `bkit install` errors. Core (the stack-agnostic foundation) is always implicit. Re-run / `bkit upgrade` after package updates. Use `bkit check` as a CI drift gate.

```bash
# Name the host(s) + stack you want — core is implicit. Hosts compose.
pnpm exec bkit install --claude                    # .claude/** + CLAUDE.md + core
pnpm exec bkit install --cursor                    # .cursor/** + core
pnpm exec bkit install --claude --cursor --tooling # both hosts + ci/lint/git-hooks + core
pnpm exec bkit install --opencode=nvidia           # additive opencode host (nvidia) + core
pnpm exec bkit install --tooling                   # ci.yml + Vale/slop/prettier + husky hooks + core

# A bare install errors — name at least one module:
pnpm exec bkit install                             # ✗ error: requires ≥1 module flag

# Ongoing sync — operates on everything installed (MANDATORY after a version bump)
pnpm exec bkit upgrade

# Drift detection — drift-checks everything installed; exits non-zero on drift (CI gate)
pnpm exec bkit check
```

**Module flags** (composable; symmetric install ↔ uninstall): `--claude` `--cursor` `--opencode=<provider>` `--tooling`. `--tooling` is the interdependent `ci + lint + git-hooks` bundle. Core is implicit on every install — there is no `--core`/`--full`/`--ci`/`--lint`/`--git-hooks` flag.

**Opt-in flags:** `--tracker=github|linear`, `--dependency=renovate|dependabot`, `--auto=claude|cursor` (cloud agents), `--opencode=<provider>` (the additive opencode execution host — `ollama-local`, `nvidia`, `groq`, `cerebras`, `openrouter`, `ollama`, `zen`). These are post-install decisions — see [§ Optional post-install decisions](#optional-post-install-decisions).

> **⚠️ Always run `pnpm exec bkit upgrade` after bumping `@cbartens/bkit`.** A plain version bump only refreshes `package.json` + lockfile — it does **not** resync `.agents/` payload or update the version pin in `.bkit/version`. Skipping the resync will red CI on the `bkit check` drift gate. Commit the resync changes alongside the version bump in the same PR.

### Local env setup

Two flows — pick one. Both end with the same env vars (`GH_BKIT_TOKEN`, `GH_TOKEN`, `LINEAR_API_KEY`) available to your shell, `gh` CLI, `pnpm`, and Claude/Cursor MCP servers.

#### Flow A — Shell export (quickest, no extra deps)

```bash
# Add to ~/.zshrc (or ~/.bashrc)
export GH_BKIT_TOKEN=<classic PAT, read:packages>      # pnpm → npm.pkg.github.com
export GH_TOKEN=<fine-grained PAT>                     # gh CLI + GitHub MCP
export LINEAR_API_KEY=<Linear personal API key>        # Linear MCP + preflight

# Reload
source ~/.zshrc                                        # or: source ~/.bashrc
```

Pros: one step, no install. Cons: tokens live in every shell on this machine; no per-repo scoping.

#### Flow B — direnv + `.bkit/.env` (recommended for daily use)

`bkit install` seeds `.bkit/.env.example` (placeholders + permission notes) and `.envrc` (`dotenv_if_exists .bkit/.env`). direnv loads `.bkit/.env` automatically when you `cd` into the repo, and unloads when you leave — tokens stay scoped to the repo.

```bash
# 1. One-time per machine — install direnv
brew install direnv                                                # macOS
# Linux / other: https://direnv.net/docs/installation.html

# 2. One-time per machine — add the shell hook, then reload
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc && source ~/.zshrc
# bash: echo 'eval "$(direnv hook bash)"' >> ~/.bashrc && source ~/.bashrc

# 3. One-time per consumer repo (after `bkit install` has seeded the templates)
cp .bkit/.env.example .bkit/.env
# Edit .bkit/.env: set GH_BKIT_TOKEN, GH_TOKEN, LINEAR_API_KEY
direnv allow                                                       # trust the .envrc

# 4. Verify
echo "len=${#GH_TOKEN}"                                            # non-zero → loaded
```

After step 4, restart any open Claude Code / Cursor sessions in this repo so the new env reaches their MCP servers.

`.bkit/.env` is gitignored — never commit it. For cloud sessions (Claude Code on the web, Cursor Background Agents) set the same names in the respective online dashboards instead; see [`.bkit/cloud.md`](.bkit/cloud.md) § Environment variables. `bkit install` / `bkit check` advisories detect missing direnv, blank required keys, and an un-allowed `.envrc` — follow whichever fires.

#### One-time per machine — register the GH Packages token with pnpm

After either flow makes `GH_BKIT_TOKEN` available in your shell, write it into pnpm's user-level auth config so a local `pnpm install` can resolve `@cbartens/bkit`:

```bash
pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN"
```

pnpm >=10.34.3 no longer authenticates a project-`.npmrc` `${GH_BKIT_TOKEN}` env-substitution (it 401s on download), so this user-level step is required — the committed `.npmrc` carries only the registry mapping. `pnpm config set` writes `~/.npmrc` on pnpm 10.x and `~/.config/pnpm/auth.ini` on pnpm 11.x (whichever your pnpm reads), so the same command is correct across pnpm versions.

## Cloud agent environments (Claude Code on the web + Cursor Background Agents)

bkit ships repo-side scaffolding for both cloud agents via the opt-in `bkit install --auto=<variant>` module — `.claude/hooks/cloud-bootstrap.sh` (per-session install), `.cursor/Dockerfile` + `.cursor/environment.json` (Cursor cloud image), and the phase-routed `.github/workflows/bkit-cloud.yml`. (`.cursor/hooks.json` — the Linear preflight wiring — ships with `--cursor`, not `--auto`.) An install without `--auto` ships zero cloud footprint. The **online-dashboard** half (Claude env in `claude.ai/code`, Cursor env vars in `Cursor → Settings → Background Agents`) is configured once per machine / account.

For **post-CI auto-routing** (the loop that decides ship-vs-debug after CI), bkit also ships a single `.github/workflows/bkit-cloud.yml` carrying TWO runtime-gated dispatch jobs — a **claude** job (via `claude-code-action`, runs when `ANTHROPIC_API_KEY` is set) and an **opencode** job (via the `opencode run` CLI, runs when `OPENCODE_PROVIDER_KEY` is set) — plus a `/bkit-auto` slash command that both clouds invoke from a single source of truth (Cursor wires it up via a dashboard trigger; no GHA needed on the Cursor side). `bkit install --auto=opencode` requires `tracker=github` and a remote (non-local) provider — a `--opencode=ollama-local` install cannot back the cloud job (no Ollama server on the runner).

Full recipe + paste-in setup script + env-var inventory + Cursor dashboard config + consumer customisation patterns: [`.bkit/cloud.md`](.bkit/cloud.md). Host-delta matrix: [`.bkit/providers.md`](.bkit/providers.md) § Runtime environment.

## JSON ownership model — deep-containment

`.claude/settings.json` and `.cursor/hooks.json` are managed via **deep-containment**. bkit declares a scope (the full template JSON tree) that must be present as a subset of the consumer document. Consumer-added keys outside the template tree survive every `bkit install` byte-identically — no special key or wrapper required.

```json
// .claude/settings.json
{
  "hooks": {
    "SessionStart": [
      { "hooks": [{ "type": "command", "command": "bash .claude/hooks/preflight.sh" }] }
    ],
    "Stop": [{ "hooks": [{ "type": "command", "command": "postflight.sh" }] }]
  },
  "failClosed": true
}
```

In this example, `hooks.SessionStart` is the bkit-declared scope (from the template). `hooks.Stop` and `failClosed` are consumer-added keys — bkit never touches them.

**Rules:**

- Consumer keys outside the template tree survive every `bkit install` byte-identically.
- `bkit install` uses `deepContains(template, consumer)` to check that every template leaf is present. On drift, it deep-merges template-wins — consumer-only siblings are preserved.
- `bkit check` surfaces a `tier2-json-drift` advisory when `deepContains` fails and **exits 1** (the CI drift gate); it writes nothing, so the consumer reviews and re-runs `bkit install` to reconverge.
- `.cursor/hooks.json` uses the Cursor v1 keyed-object schema: `{"version": 1, "hooks": {"sessionStart": [...], "sessionStop": [...]}}`.

## Consumer CI auth

bkit resolves from the **GitHub Packages npm registry**. Authentication requires:

1. **Create a classic PAT** on GitHub with `read:packages` scope:
   - GitHub Settings → Developer settings → Personal access tokens → **Tokens (classic)** → Scope: `read:packages`
   - Copy the generated token

   > **⚠️ Use a classic PAT, not fine-grained.** GitHub Packages npm registry currently rejects fine-grained PATs with HTTP 403, even when `Packages: read` is granted. Confirmed against `npm.pkg.github.com` 2026-05-06. If/when GitHub fixes this, fine-grained PATs will become preferred (narrower scope); for now classic is the only working option.

2. **Add the secret** to your consumer repo:
   - GitHub repo → Settings → Secrets and variables → Actions → New repository secret
   - Name: `GH_BKIT_TOKEN`
   - Value: paste the PAT

3. **Add `.npmrc`** at your repo root (committed, no secrets) — the registry mapping ONLY. The auth token is **not** stored here:

   ```
   @cbartens:registry=https://npm.pkg.github.com
   ```

4. The seeded `ci.yml` install step writes the token into pnpm's user-level config before install (added by `bkit install`):

   ```yaml
   - name: Install Dependencies
     run: |
       pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN"
       pnpm install --frozen-lockfile
     env:
       GH_BKIT_TOKEN: ${{ secrets.GH_BKIT_TOKEN }}
   ```

> **⚠️ Why `pnpm config set`, not `.npmrc`:** pnpm >=10.34.3 no longer authenticates a project-`.npmrc` `${GH_BKIT_TOKEN}` env-substitution — `pnpm install` 401s on the `@cbartens/bkit` download (`ERR_PNPM_FETCH_401`) even when the token is set. `pnpm config set` writes the token to pnpm's user-level config (`~/.npmrc` on pnpm 10.x, `~/.config/pnpm/auth.ini` on pnpm 11.x). A leftover `_authToken` line in the project `.npmrc` must be **removed** — it 401s and, by config precedence (project > user), shadows the user-level token. Note: `pnpm view @cbartens/bkit` (metadata) may still resolve with the broken setup, so verify with a real `pnpm install`, not `view`.

### Agent access to `GH_BKIT_TOKEN`

If permission rules block direct reads of `.env*` files (e.g. `Read(./.env*)`, `Bash(grep ... .env*)` denied), the token still cannot be read — but it **can** be exported into a child process for the duration of a single command. Use this pattern in a single Bash tool call:

```bash
set -a; source apps/web/.env.preview 2>/dev/null; set +a; <command that needs the token>
```

- `source` is a shell builtin, not file I/O — the agent's permission layer (which gates `Read` / `grep` / `cat`) does not see it. The token text never enters the agent's context.
- `<command>` (e.g. `pnpm view @cbartens/bkit`, `pnpm exec bkit check`) inherits `GH_BKIT_TOKEN` via the environment.
- Verify the token loaded **without leaking the value**: `echo "len=${#GH_BKIT_TOKEN}"`.

**Caveat:** shell state does not persist between separate Bash tool calls. The `source` and the consuming command MUST run in the **same** invocation — chain with `;` or `&&`. When directing another agent, name the file path explicitly (e.g. _"source `apps/web/.env.preview` in-line; the registry needs `GH_BKIT_TOKEN`"_).

## Consumer Vercel auth

Vercel runs its own `pnpm install` in a fresh build container and cannot run a pre-install shell step. Since pnpm >=10.34.3 no longer authenticates a project-`.npmrc` `${GH_BKIT_TOKEN}` env-substitution, set the token via a one-line `installCommand` that writes pnpm's user-level config before install.

1. **Add `GH_BKIT_TOKEN` to Vercel env vars** for each environment that builds (preview + production at minimum):

   ```bash
   vercel env add GH_BKIT_TOKEN preview
   vercel env add GH_BKIT_TOKEN production
   ```

   Or via web: Vercel project → Settings → Environment Variables. Token value is the same PAT used for the GitHub Actions secret (scope: `read:packages`).

2. **Set the `installCommand` in `vercel.json`** so the token reaches pnpm's user-level auth config before install (and remove any pre-existing git-shim `installCommand`):

   ```json
   {
     "installCommand": "pnpm config set //npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN && pnpm install"
   }
   ```

   If a legacy git-shim `installCommand` is present (`git config --global url."https://x-access-token:$GH_BKIT_TOKEN@github.com/cbartens/bkit/".insteadOf …`), remove it — the `pnpm config set` line replaces it entirely. (This is a registry-auth shim, not the obsolete git-auth shim; see `docs/decisions.md` DE-31.)

3. **Trigger a redeploy** (push a commit) and watch the Vercel build log for `pnpm install` resolving `@cbartens/bkit` from `npm.pkg.github.com`.

## Install lifecycle

`bkit install` runs three phases in sequence:

**Phase 1 — Preflight (read-only, before any writes)**

bkit checks preconditions and known advisory patterns before touching any file. If a blocker fires, install exits 1 immediately with a formatted `[blocker]` line and zero writes. Advisories are accumulated for Phase 3.

<!-- prettier-ignore -->
| Severity | When |
| --- | --- |
| Blocker | `package.json` absent or unparseable JSON |
| Blocker | core install requested but `.git/` absent (not a git repository) |
| Advisory | `.husky/pre-commit` or `pre-push` exists without bkit markers |
| Advisory | `.prettierignore` exists without bkit markers |
| Advisory | `lint:prose` script lacks the write-good guard (`[ -d .vale/styles/write-good ]`) |
| Advisory | On-disk `.bkit/version` major > installing major (downgrade) |
| Advisory | `node_modules/@cbartens/bkit` version > `.bkit/version` (stale pin) |

**Phase 2 — Install (current behaviour)**

Module dispatch writes managed files. Same as before this feature shipped.

**Phase 3 — Post-install (re-detect + unified output)**

After writes, bkit re-runs token-surface and environment checks — some are only accurate post-install (e.g. `.npmrc` content written by the CI module, devDeps added to `package.json`).

<!-- prettier-ignore -->
| `id` | When |
| --- | --- |
| `gh-bkit-token-unset-shell` / `gh-bkit-token-empty-shell` | `GH_BKIT_TOKEN` unset (or set but empty) in shell |
| `npmrc-missing-gh-packages` | `.npmrc` exists but lacks the `@cbartens` registry mapping |
| `npmrc-legacy-authtoken` | `.npmrc` still carries a legacy `//npm.pkg.github.com/:_authToken=…` line (401s on pnpm >=10.34.3; move it to pnpm user-level config) |
| `gh-bkit-token-secret-missing` | `gh secret list` confirms secret absent |
| `gh-bkit-token-secret-unknown` | `gh` CLI unavailable/unauthenticated |
| `gh-token-unset-shell` / `gh-token-empty-shell` | `GH_TOKEN` (GitHub MCP auth) unset/empty in shell while a `github` MCP server is configured — the whole tracker/PR/board MCP surface fails to connect. Suppressed in CI. |
| `vercel-env-missing-preview` | `vercel.json` detected; token absent in preview |
| `vercel-env-missing-production` | `vercel.json` detected; token absent in production |
| `ci-yml-missing-token-env` | ci.yml install step lacks the `pnpm config set` auth step and/or the `GH_BKIT_TOKEN` env mapping |
| `tracker-setup-none` / `-github` / `-linear` | Optional post-install decision — which issue tracker is wired (`bkit.issueTracker`). `none` nudges `bkit install --tracker=…`. See [§ Optional post-install decisions](#optional-post-install-decisions). |
| `github-project-board-sync-unconfigured` | GitHub tracker active but Projects v2 board sync is half-configured (`bkit.githubProject` absent and/or `.mcp.json` lacks the `projects` toolset) — sync silently no-ops. Silence with `bkit.githubProject: false`. |
| `github-project-status-field-id-format` | `bkit.githubProject` is configured but `statusFieldId` holds a GraphQL node id (`PVTSSF_…`) or non-number — `projects_write` needs the numeric field id, so board sync silently no-ops. Re-derive via `gh api /orgs/<org>/projectsV2/<number>/fields`. |
| `dep-updater-none` / `-renovate` / `-dependabot` | Optional post-install decision — which dependency updater is wired. `none` nudges `bkit install --dependency=renovate` or `--dependency=dependabot` (mutually exclusive). See [§ Optional post-install decisions](#optional-post-install-decisions). |
| `cloud-router-none` / `cloud-router` | Optional post-install decision — post-CI auto-routing (`bkit.cloudAgents`). `none` (undecided) nudges `bkit install --auto=<variant>`; `cloud-router` is informational once `bkit-cloud.yml` is present. See [§ Optional post-install decisions](#optional-post-install-decisions). |
| `actions-write-permissions-missing` | `bkit-cloud.yml` present but repo Actions permissions are read-only / PR creation disabled — `actions/checkout` + `gh pr create` 403. Repo-level check; org policy can override. |
| `opencode-setup` | opencode host installed (`--opencode=<provider>`) — names the provider key to set (e.g. `NVIDIA_API_KEY`; none for `ollama-local`; `opencode auth login` for `zen`), confirms the pre-seeded base URL, and notes all seven providers ship curated per-agent pins (re-pin via `.bkit/prompts.md` § Model Overrides). Verify with `bkit doctor` + `bkit status`. |
| `vale-package-not-synced` | vale on PATH but `.vale/styles/write-good/` absent |
| `devdeps-need-fetch` | bkit added devDeps in this run — `pnpm install` needed |

Phase 1 and Phase 3 findings are merged and deduplicated by `id` (Phase 3 wins on conflict — re-detection is more accurate post-write). If zero findings, no banner is printed.

**`bkit check` (dry-run)** runs Phase 1 and Phase 3 (read-only) — same advisory set as `bkit install` minus the writes (v2.2.3+). It writes nothing and **exits 1 when any managed-file write would occur** in an installed module — a Tier-2 JSON deep-containment or markered-block drift, or a whole-file byte-equal mismatch — or when the rendered prompts/workflows carry a stale managed-version marker (#256). The gate covers the **installed** module set ({core, claude, cursor, ci, lint, git-hooks} plus **opencode**, each detected by sentinel files). opencode is gated (#255 #8): `.opencode/opencode.json` (provider block + tracker-filtered mcp + permission sandbox) and `gateguard.js` drift fail `check` — the render inputs fall back to the installed provider (`package.json` `bkit.opencodeProvider`, the only signal for managed-auth `zen`) and recorded tracker, so a clean install across providers checks green (no false drift). The remaining **opt-in** modules (renovate/dependabot/cloud) are NOT drift-gated, and the host agent/command mirrors are untracked force-overwrites that surface as the `bkit-rendered-prompts-stale` blocker rather than in the writeset. See `docs/knowledge.md` KN-4 for the original design (Phase 3 read-only semantics now enforced via read-only detector paths, not by skipping Phase 3).

**`PreflightFinding` shape** — the stable contract for downstream tooling:

```typescript
interface PreflightFinding {
  id: string; // stable kebab-case identifier
  severity: "blocker" | "advisory";
  detect: string; // one-line description of the detected condition
  action: string; // AI-pasteable fix instruction
}
```

Findings are rendered in the format `--- i/N [severity] id ---` with `DETECT:` and `ACTION:` sections — copy-paste the whole banner into a coding assistant to apply fixes in sequence.

For the four-surface token sweep, see [§ Consumer CI auth](#consumer-ci-auth).

## Optional post-install decisions

Three capabilities are **opt-in** and never wired by a plain host/tooling install. A default install never enables them — instead, the post-install advisory banner nudges you to choose, once. Each is recorded in `package.json` (`bkit.issueTracker`, `bkit.depUpdater`, `bkit.cloudAgents`) so the nudge knows whether you've decided or deliberately opted out.

<!-- prettier-ignore -->
| Decision | Default | Opt-in command | Advisory when unset |
| --- | --- | --- | --- |
| **Issue tracker** | `none` (workflows run; tracker calls are no-ops) | `bkit install --tracker=github` (browser OAuth, no PAT) or `--tracker=linear` (`LINEAR_API_KEY`) | `tracker-setup-none` |
| **Dependency updater** | none (no auto dep PRs) | `bkit install --dependency=renovate` (recommended) **or** `--dependency=dependabot` — mutually exclusive | `dep-updater-none` |
| **Cloud agents** | none (zero cloud footprint) | `bkit install --auto=claude\ | cursor\ | opencode` — installs `bkit-cloud.yml` (claude + opencode jobs, secret-gated) + cloud env scaffolding (cloud-bootstrap.sh, Cursor Dockerfile/environment.json) | `cloud-router-none` |

**Why opt-in, not part of a default install:**

- **Tracker** wires real credentials and MCP servers into workflows — a consumer must choose their provider; bkit can't guess.
- **Dependency updater** requires a deliberate choice between two tools (and, for Renovate, a one-time GitHub App install that can't be scripted). Shipping one by default would force a tool the consumer may not want and, for Renovate, create a broken onboarding PR if the App is installed before the config reaches the default branch (see `docs/deployments.md` § GitHub Actions pinning).
- **Cloud agents** install the phase-routed `bkit-cloud.yml` (auto-dispatches bkit-ship on CI pass, bkit-debug on CI fail; design/plan/build via `workflow_dispatch`) plus the cloud env scaffolding (`.claude/hooks/cloud-bootstrap.sh`, `.cursor/Dockerfile`, `.cursor/environment.json`). The workflow carries a claude job and an opencode job, each runtime-gated on its provider secret, so each is inert without its key: the claude job needs `ANTHROPIC_API_KEY` (+ the Claude GitHub App), the opencode job needs `OPENCODE_PROVIDER_KEY`. Both need GitHub Actions write permissions, the GitHub tracker, and (for the Cursor half) a dashboard trigger — and the tracker is itself opt-in. The env scaffolding is inert until a Claude/Cursor cloud env is wired in the dashboard. Shipping autonomous routing by default, wired to a tracker that may not be configured, is the wrong default — so an install without `--auto` ships zero cloud footprint.

**How to decide:**

1. Run `bkit install --claude --cursor --tooling` (or whichever modules you want) as normal. The post-install banner lists `tracker-setup-none`, `dep-updater-none` and `cloud-router-none` if undecided.
2. Pick a tracker: `bkit install --tracker=github` (or `linear`). Persisted to `bkit.issueTracker`; future installs preserve it (switching is free).
3. Pick a dependency updater: `bkit install --dependency=renovate` (or `--dependency=dependabot`). Persisted to `bkit.depUpdater`. For Renovate, re-run after merging the config to your default branch to get the App-install URL (Phase B).
4. Enable cloud agents: `bkit install --auto=claude|cursor|opencode`. Persisted to `bkit.cloudAgents`; the install prints the secrets + permissions + dashboard checklist (`bkit-auto-setup`). The shipped `bkit-cloud.yml` carries both a claude job (`ANTHROPIC_API_KEY`) and an opencode job (`OPENCODE_PROVIDER_KEY`), each runtime-gated on its provider secret.
5. **To opt out and silence a nudge**, set the field to `"none"` in `package.json` (`bkit.issueTracker` / `bkit.depUpdater` / `bkit.cloudAgents`). The advisory then stays quiet.

All three decisions are reversible — re-run the install with the relevant flag. Renovate ↔ Dependabot are mutually exclusive: bkit refuses to install one while the other's config is present, with a cleanup advisory.

## Doctor

`bkit doctor` is a **read-only diagnostic verb** — runs Phase 1 preflight + Phase 3 token-surface detectors without writing any files and exits 0.

```bash
# Diagnose drift without running install
pnpm exec bkit doctor
```

Use `bkit doctor` to:

- Check whether `GH_BKIT_TOKEN` is set in the shell and on the GitHub repo.
- Surface `bkit-version-pin-stale` advisory (installed version ahead of `.bkit/version`).
- Preview all advisories that `bkit install` would show post-install, without triggering writes.
- Verify the environment is ready before running `bkit install` on a new machine.
- Detect macOS GUI-isolation (`bkit cursor` / `bkit opencode`): see `.bkit/providers.md` § macOS GUI-isolation.
  `bkit doctor` always exits 0. Advisories found → printed in the same checklist banner format as `bkit install`. None found → prints `[bkit-doctor] No advisories found.`

## Uninstall

`bkit uninstall` surgically removes bkit-managed content while preserving consumer customisations.

```bash
# Uninstall EVERYTHING — all modules, including the opt-in add-ons
# (renovate / dependabot / cloud) if present. The inverse of install is
# asymmetric: a full *install* skips the opt-in add-ons, a full *uninstall*
# removes them too.
pnpm exec bkit uninstall

# Preview what would be removed (no writes)
pnpm exec bkit uninstall --dry-run

# Uninstall specific modules (targeted — leaves core + the other modules intact)
pnpm exec bkit uninstall --tooling      # removes ci.yml + lint + husky hooks only
pnpm exec bkit uninstall --auto         # removes only bkit-cloud.yml + the cloudAgents key

# Also strip managed package.json scripts/devDeps
pnpm exec bkit uninstall --package

# Force-delete byte-equal-text files even if consumer modified them
pnpm exec bkit uninstall --force

# Delete ALL bkit files regardless of consumer modifications (confirm prompt)
pnpm exec bkit uninstall --nuke
# Skip interactive confirm:
pnpm exec bkit uninstall --nuke --yes
```

### Format semantics during uninstall

<!-- prettier-ignore -->
| Format | Behaviour |
| --- | --- |
| `fully-managed` | Always deleted (bkit owns 100% of the file). |
| `markered-text` | bkit block stripped; consumer content above/below preserved. File deleted if only whitespace remains — or, for a bkit-seeded markdown file (`AGENTS.md`/`CLAUDE.md`), if only its `# Title` heading husk remains. |
| `byte-equal-text` | Deleted only if current hash matches the hash recorded at install time. Consumer modifications → preserved. |

### Idempotency

Running `bkit uninstall` twice is safe — subsequent runs skip absent files and produce zero writes.

### What a full uninstall preserves

A bare uninstall removes bkit-managed files and strips bkit-managed blocks, but is **not** a guaranteed zero-footprint wipe. It deliberately leaves: the `docs/` reference payload (consumer-editable, often customised); any file the consumer has modified (Tier-3 hash mismatch → preserved); and generated artefacts that are not manifest-tracked (`.bkit/advisories.md`, `.bkit/friction.md`). Use `--nuke` to force-remove every manifest-listed bkit file regardless of consumer modifications; the generated artefacts and `docs/` are still yours to delete by hand.

## Phase 3 exit-1 and recovery

When `bkit install` detects a **blocker-severity** finding in Phase 3 (e.g. `ci.yml` missing `GH_BKIT_TOKEN` env mapping with `.npmrc` referencing the token), it exits 1 and prints a single-line recovery command:

```
[bkit-install] 1 Phase 3 blocker(s) detected. Recovery:
  pnpm bkit uninstall <flags> && <fix the issue> && pnpm bkit install <flags>
```

Advisories (non-blockers) are informational only and do NOT trigger exit-1.

### --auto-revert

Add `--auto-revert` to `bkit install` to automatically run `bkit uninstall` in-process when a Phase 3 blocker fires:

```bash
pnpm exec bkit install --auto-revert
```

Useful in CI scripts to guarantee a clean state on failure.

## .bkitignore

Create a `.bkitignore` file at your repo root to suppress `bkit check` drift for specific files or JSON keys.

### Syntax

- Lines starting with `#` are comments.
- Blank lines are ignored.
- All other lines are [picomatch](https://github.com/micromatch/picomatch) glob patterns.
- Append `:dotted.key` to ignore a specific JSON key (opt-in, requires `BKIT_BKITIGNORE_PER_KEY=1`).

### Examples

```
# Suppress ci.yml drift entirely (consumer has custom jobs)
.github/workflows/ci.yml

# Suppress all Vale style drift
.vale/**

# Suppress specific JSON key drift (requires BKIT_BKITIGNORE_PER_KEY=1)
.claude/settings.json:hooks.Stop
```

### Per-key mode

Per-key (`:dotted.key`) matching is off by default. Enable with:

```bash
BKIT_BKITIGNORE_PER_KEY=1 pnpm exec bkit check
```

This allows consumers to add their own JSON keys (e.g. `hooks.Stop` in `.claude/settings.json`) without triggering drift detection, while still letting bkit manage its own keys in the same file.

## Install staging directory

`bkit install` renders derived files (e.g. `.opencode/opencode.json`) into a `.bkit-staging/` scratch directory before merging them into their consumer destinations. The scratch directory is cleaned up after every run — on success and on failure alike — so it never persists in a committed consumer repo state.

**Not a cross-module transaction.** Modules write directly to their destinations, so `bkit install` is not atomic across modules: if a run fails partway (e.g. a hand-broken `.claude/settings.json` makes a JSON merge throw), files written by earlier modules remain and `.bkit/version` is not pinned. The error is surfaced, not swallowed.

**Recovery is re-run.** `bkit install` is idempotent — fix the offending file and re-run to complete the install. `bkit uninstall` removes whatever was written.

## Documentation

**Full reference:** [`.bkit/README.md`](.bkit/README.md) — what bkit does, prerequisites, triggering workflows, key files.

**Workflow internals:** [`.bkit/workflows.md`](.bkit/workflows.md).

**Subagent metadata:** [`.bkit/prompts.md`](.bkit/prompts.md).
