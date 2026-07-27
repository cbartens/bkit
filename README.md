# bkit

Agent workflow system wiring Claude Code (and Cursor) into a five-phase Linear-integrated dev cycle: `/bkit-design` → `/bkit-plan` → `/bkit-build` → `/bkit-debug` → `/bkit-ship`.

## Why bkit

bkit runs a coding agent through what a senior engineering team would insist on — design review, adversarial code challenge, test gate, release checklist — on every feature, with gates a human signs off on. Each phase fans work to specialised subagents, several in parallel under different lenses (bugs vs security), so output is reviewed by independent agents before you see it.

Three things that change how you work:

- **Parallel by design.** Every run executes in its own isolated git worktree — run many pipelines at once (design one feature while building a second and shipping a third) with no branch-switching, stashing, or conflicts.
- **Tied to your tracker.** bkit integrates with GitHub Issues or Linear: reads the issue for context, posts progress per phase, moves issue through states, links resulting PR back. Project management stays the source of truth.
- **Consistent across the team.** Anyone, in Claude Code or Cursor, runs `/bkit-design` and gets the same reviewed, gated, tested pipeline. Rigor lives in the toolkit, not one person's prompting.

Beyond pipeline and tracker integration, every `bkit install` wires engineering scaffolding a repo needs day one:

- **A CI scaffold where green means validated.** Flat, wide GitHub Actions pipeline — `bkit-tests-scope` (plans what should run) fans out to every lane at once (`static` / `unit` / `build` / `integration` / `e2e` / `live` / `migration`); always-on `bkit-tests-check` capstone joins them and fails the build if any tier the plan expected was skipped. Nothing waits but the planner — wall-clock is the slowest lane, not the sum. "CI is green" means planned tests actually ran and passed; capstone is the single branch-protection required check, so partial/cached/light runs can't pass as validated. Direct pushes auto-escalate to full run. Complete multi-tier scaffold ships step-by-step in seeded `ci.yml`, ready to adopt as the project grows.
- **Quality gates, local and CI in lockstep.** Typecheck, Prettier, Vale prose linter, LLM-slop scanner, actionlint, mirror/drift gate in seeded pre-commit/pre-push hooks **and** CI — same commands both places, so green local push = green CI run.
- **Dependency updates, pre-tuned.** Opt-in Renovate or Dependabot, pre-configured: grouped auto-merge for non-major bumps, SHA-pinned GitHub Actions, lockfile maintenance, CVE alerts bypass weekly schedule.
- **Cloud agents.** Opt-in autonomous routing: CI finishes → Claude Code or Cursor cloud agent picks up — `bkit-ship` on green, `bkit-debug` on red — no local session.
- **Run the pipeline on any model, keep the harness.** Beyond Claude Code and Cursor hosts, `bkit install --opencode=<provider>` adds third **opencode** execution host talking to backend directly — no router, no model-identity lie. Ten providers ship ready-to-run, curated per-agent pins: local **Ollama**, NVIDIA **NIM**, **Groq**, **Cerebras**, **OpenRouter**, cloud **Ollama**, **Z.AI** (GLM), **Moonshot** (Kimi), opencode **opencode-native** Zen + Go gateways (`OPENCODE_API_KEY`) — fully-local, free-tier, paid inference. Hosts additive (opencode alongside claude/cursor); subagents, gates, hooks, MCP config unchanged — only backend and per-agent model pins differ. `bkit status` shows installed hosts + active providers; `bkit doctor` checks credentials and tool reachability. (See `.bkit/providers.md` § Supported hosts + Providers.)
- **Switch IDE or provider mid-feature — continue with same settings.** Run state lives in `status.jsonl`, plan/design docs under `docs/plans/`, tracker issue — never one vendor's session — every host renders from same `.bkit/` source, so each phase or resumed run executes on whichever host and provider you have capacity for, with identical gates, hooks, per-agent model pins. Hit Claude weekly limit or provider free-tier mid-feature? Pick up in Cursor or free/local opencode — same gated pipeline, no re-setup, no lost context. Cheap to dogfood on free/local inference and ship on primary model.

For full pipeline and subagent reference, and mapping against Antonio Gulli's _Agentic Design Patterns_ (12 of 22 patterns fully implemented, several beyond the book), see `.bkit/comparison.md`.

> [!IMPORTANT]
> **`GH_BKIT_TOKEN_INSTALL` is required everywhere bkit installs.** Without it, `pnpm install` fails with an opaque 401 (or the silent-ignore-then-fall-back-to-npmjs footgun → 404). Set it in **all four** places before running `pnpm add -D @cbartens/bkit`:
>
> 1. **Local shell** — pick one of two flows (see § Local env setup for details):
>    - **(A) Quick:** `export GH_BKIT_TOKEN_INSTALL=<classic PAT>` in `~/.zshrc` or `~/.bashrc`. Works immediately, single-step. Same token leaks into every shell.
>    - **(B) direnv + `.bkit/.env` (recommended for daily use):** `brew install direnv` once per machine, then `.bkit/.env` (gitignored, scaffolded by `bkit install`) auto-loads on `cd`. Tokens scoped to the repo, not your whole shell. Note: `.bkit/.env` only exists _after_ `bkit install` runs, so for the first install you need either (A) or a one-off `export` in the current shell.
> 2. **`.npmrc` at repo root** — registry mapping only; token goes in pnpm user-level config via `pnpm config set` — see § Consumer CI auth below
> 3. **GitHub Actions repo secret** — `gh secret set GH_BKIT_TOKEN_INSTALL --body=<token>` per consumer repo
> 4. **Vercel env vars** (if applicable) — `vercel env add GH_BKIT_TOKEN_INSTALL preview/production`
>
> **Use a classic PAT, not fine-grained.** GitHub Packages npm registry currently rejects fine-grained PATs with HTTP 403 even when `Packages: read` is granted (verified 2026-05). Until GitHub fixes this, classic with `read:packages` scope is the only working option.

## Quick install — paste this into your AI

After creating a classic GitHub PAT with `read:packages` scope ([Tokens (classic)](https://github.com/settings/tokens)) and saving it as `GH_BKIT_TOKEN_INSTALL=<token>` in a local env file in this repo (e.g. `.env.local`, `apps/web/.env.preview`), copy the block below into Claude Code / Cursor / any coding agent. Replace `<ENV-FILE-PATH>` with your env file's path.

````text
Please install the latest `@cbartens/bkit` in this repo.

1. I've created a classic GitHub PAT with `read:packages` scope and saved it as `GH_BKIT_TOKEN_INSTALL=<token>` in `<ENV-FILE-PATH>` (for example `.env.local` or `apps/web/.env.preview`). Confirmed.

2. To access `GH_BKIT_TOKEN_INSTALL` without leaking it into your context: `source` is a shell builtin, not file I/O — the permission layer that gates `Read` / `grep` / `cat` does NOT see it, and the token text never enters your context. Use this pattern in a single Bash tool call:

   ```bash
   set -a; source <ENV-FILE-PATH> 2>/dev/null; set +a; <command that needs the token>
   ```

   Verify the token loaded without leaking the value: `echo "len=${#GH_BKIT_TOKEN_INSTALL}"`.

   Caveat: shell state does NOT persist between separate Bash tool calls. The `source` and the consuming command MUST run in the SAME invocation — chain with `;` or `&&`.

3. Ensure `.npmrc` at the repo root contains the registry mapping (create or update). The auth token is **NOT** stored here — pnpm >=10.34.3 401s on a project-`.npmrc` `${GH_BKIT_TOKEN_INSTALL}` env-substitution:

   ```
   @cbartens:registry=https://npm.pkg.github.com
   ```

   Then write the token into pnpm's user-level config, resolve and install the latest `@cbartens/bkit`, and seed both hosts + the tooling stack in a single Bash call (`bkit install` requires you to name the modules — core is implicit):

   ```bash
   set -a; source <ENV-FILE-PATH>; set +a; \
     pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN_INSTALL" && \
     pnpm add -D @cbartens/bkit@latest && \
     bkit install --claude --cursor --tooling
   ```

   `bkit install --claude --cursor --tooling` seeds `.agents/`, `.claude/`, `.cursor/`, CI workflows, lint, and git-hooks. Report the resolved version and any advisories printed by `bkit install`.

4. After install, read bkit's canonical templates at `node_modules/@cbartens/bkit/.bkit/templates/` (husky hooks, CI workflows, `.claude/settings.json`, `.cursor/` config, renovate, vale, etc.). You MUST reconcile them against this repo's existing config and adopt as much as possible without breaking existing functionality — bkit's seed-or-print files (e.g. `ci.yml`) do NOT overwrite an existing file, so adoption is your job. For any template you choose not to adopt, state which one and why.
````

## Install

bkit is distributed via **GitHub Packages npm registry** (`https://npm.pkg.github.com`). Add to a consumer repo:

```bash
pnpm add -D @cbartens/bkit@^4.0.0
```

### Adding a new consumer — checklist

Run these in order on a brand-new consumer repo. Each step links to its detail section below.

<!-- prettier-ignore -->
| # | Step | Detail |
| --- | --- | --- |
| 1 | Create a classic PAT with `read:packages` (fine-grained PATs are rejected by GitHub Packages) | [§ Consumer CI auth](#consumer-ci-auth) step 1 |
| 2 | Add `GH_BKIT_TOKEN_INSTALL` repo secret | [§ Consumer CI auth](#consumer-ci-auth) step 2 |
| 3 | Commit `.npmrc` at repo root (registry mapping only; token goes in pnpm user-level config) | [§ Consumer CI auth](#consumer-ci-auth) step 3 |
| 4 | Export `GH_BKIT_TOKEN_INSTALL` for the `pnpm add` step (one-off — `export GH_BKIT_TOKEN_INSTALL=<classic PAT>` in this shell only), then run `pnpm add -D @cbartens/bkit` | [§ Install](#install) (this section) |
| 5 | Run `bkit install --claude --cursor --tooling` to seed both hosts + tooling (creates `.bkit/.env.example` + `.envrc`) | [§ Install](#install) (this section) |
| 5a | Set up direnv + `.bkit/.env` so every subsequent shell auto-loads `GH_BKIT_TOKEN_INSTALL`, `GH_BKIT_TOKEN`, `LINEAR_API_KEY` | [§ Local env setup](#local-env-setup) |
| 6 | If deploying to Vercel: add `GH_BKIT_TOKEN_INSTALL` to Vercel env vars | [§ Consumer Vercel auth](#consumer-vercel-auth) |
| 7 | Push to a feature branch and verify CI runs green | — |

Seeded `.github/workflows/ci.yml` install step writes token into pnpm user-level config (`pnpm config set …`) before `pnpm install` and carries `GH_BKIT_TOKEN_INSTALL` env block — only thing CI needs to authenticate `@cbartens/bkit` is `GH_BKIT_TOKEN_INSTALL` secret from step 2. No cross-org `uses:` reference; `bkit` stays private without affecting consumer auth.

### Then in the consumer repo

`bkit install` requires you to name modules (at least one) — bare `bkit install` errors. Core (stack-agnostic foundation) always implicit. Re-run / `bkit upgrade` after package updates. Use `bkit check` as CI drift gate.

> **Shell alias (add once to `~/.zshrc` or `~/.bashrc`, then `source ~/.zshrc`)**
>
> ```bash
> alias bkit='pnpm bkit'
> ```
>
> Type `bkit <verb>` from anywhere in repo. Without alias, prefix with `pnpm`: `pnpm bkit install --claude`. `bkit doctor` emits advisory if alias not detected.

```bash
# Name the host(s) + stack you want — core is implicit. Hosts compose.
bkit install --claude                    # .claude/** + CLAUDE.md + core
bkit install --cursor                    # .cursor/** + core
bkit install --ci                        # stack-agnostic CI skeleton + Vale prose-lint + core
bkit install --claude --typescript       # Claude host + full Node/TS toolchain (implies --ci) + core
bkit install --opencode=opencode-go      # additive opencode host (opencode-native gateway) + core
bkit install --claude --cursor --tooling # both hosts + ci/lint/git-hooks + core (alias for --ci --typescript)

# A bare install errors — name at least one module:
bkit install                             # ✗ error: requires ≥1 module flag

# Ongoing sync — re-render everything installed at the CURRENT version (offline)
bkit upgrade

# Move to a newer bkit in ONE step — bumps @cbartens/bkit, then re-renders + re-pins
bkit upgrade --latest                    # newest published; or --to=<version> to pin one

# Drift detection — drift-checks everything installed; exits non-zero on drift (CI gate)
bkit check
```

**Module flags** (composable; symmetric install ↔ uninstall): `--claude` `--cursor` `--opencode=<provider>` `--ci` `--typescript` `--tooling`. `--ci` = stack-agnostic CI/quality foundation (ci.yml skeleton with Node/TS steps as commented examples + Vale prose-lint; no package.json footprint, runs green on any repo). `--typescript` adds Node/TS toolchain (tsc/slop-scan/prettier/husky + wired ci.yml step bodies), implies `--ci`. `--tooling` = back-compat alias for `--ci --typescript` (interdependent `ci + lint + git-hooks` bundle). Core implicit on every install — no `--core`/`--full`/`--lint`/`--git-hooks` flag.

**Opt-in flags:** `--tracker=github|linear`, `--dependency=renovate|dependabot`, `--auto=claude|cursor` (cloud agents), `--opencode=<provider>` (additive opencode execution host — `ollama-local`, `nvidia`, `groq`, `cerebras`, `openrouter`, `ollama`, `zai`, `moonshot`, `opencode-zen`, `opencode-go`). Post-install decisions — see [§ Optional post-install decisions](#optional-post-install-decisions).

> **⚠️ Moving bkit versions: use `bkit upgrade --latest` (or `--to=<version>`).** Bumps `@cbartens/bkit` **and** resyncs `.agents/` payload + `.bkit/version` pin in one atomic step — two can never drift apart. Bare `pnpm add @cbartens/bkit` (or Renovate/Dependabot bump) only refreshes `package.json` + lockfile — does **not** resync; skipping resync reds CI on `bkit check` drift gate. If you bump package separately, run `bkit upgrade` afterward and commit resync alongside version bump in same PR.

### Local env setup

Two flows — pick one. Both end with `GH_BKIT_TOKEN_INSTALL` and `GH_BKIT_TOKEN` in shell for pnpm and GitHub MCP. Linear repos also need `LINEAR_API_KEY`. Use `gh auth login` for CLI.

#### Flow A — Shell export (quickest, no extra deps)

```bash
# Add to ~/.zshrc (or ~/.bashrc)
export GH_BKIT_TOKEN_INSTALL=<classic PAT, read:packages>      # pnpm → npm.pkg.github.com
export GH_BKIT_TOKEN=<fine-grained PAT>                 # GitHub MCP
export LINEAR_API_KEY=<Linear personal API key>        # Linear MCP + preflight

# Reload
source ~/.zshrc                                        # or: source ~/.bashrc
```

Pros: one step, no install. Cons: tokens in every shell on machine; no per-repo scoping.

#### Flow B — direnv + `.bkit/.env` (recommended for daily use)

`bkit install` seeds `.bkit/.env.example` (placeholders + permission notes) and `.envrc` (`dotenv_if_exists .bkit/.env`). direnv loads `.bkit/.env` on `cd`, unloads on leave — tokens scoped to repo.

```bash
# 1. One-time per machine — install direnv
brew install direnv                                                # macOS
# Linux / other: https://direnv.net/docs/installation.html

# 2. One-time per machine — add the shell hook, then reload
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc && source ~/.zshrc
# bash: echo 'eval "$(direnv hook bash)"' >> ~/.bashrc && source ~/.bashrc

# 3. One-time per consumer repo (after `bkit install` has seeded the templates)
cp .bkit/.env.example .bkit/.env
# Edit .bkit/.env: set GH_BKIT_TOKEN_INSTALL, GH_BKIT_TOKEN, LINEAR_API_KEY
direnv allow                                                       # trust the .envrc

# 4. Verify
echo "len=${#GH_BKIT_TOKEN}"                                            # non-zero → MCP token loaded
gh auth status                                                       # gh CLI uses keyring, not GH_BKIT_TOKEN
```

After step 4, restart open Claude Code / Cursor sessions in this repo so new env reaches MCP servers.

`.bkit/.env` gitignored — never commit. Cloud sessions (Claude Code on the web, Cursor Background Agents): set same names in respective online dashboards; see `.bkit/cloud.md` § Environment variables. `bkit install` / `bkit check` advisories detect missing direnv, blank required keys, un-allowed `.envrc` — follow whichever fires.

#### One-time per machine — register the GH Packages token with pnpm

After either flow makes `GH_BKIT_TOKEN_INSTALL` available in shell, write into pnpm user-level auth config so local `pnpm install` resolves `@cbartens/bkit`:

```bash
pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN_INSTALL"
```

pnpm >=10.34.3 no longer authenticates project-`.npmrc` `${GH_BKIT_TOKEN_INSTALL}` env-substitution (401s on download) — user-level step required; committed `.npmrc` carries only registry mapping. `pnpm config set` writes `~/.npmrc` on pnpm 10.x and `~/.config/pnpm/auth.ini` on pnpm 11.x (whichever pnpm reads) — same command across pnpm versions.

## Cloud agent environments (Claude Code on the web + Cursor Background Agents)

bkit ships repo-side scaffolding for both cloud agents via opt-in `bkit install --auto=<variant>` — `.claude/hooks/cloud-bootstrap.sh` (per-session install), `.cursor/Dockerfile` + `.cursor/environment.json` (Cursor cloud image), phase-routed `.github/workflows/bkit-cloud.yml`. (`.cursor/hooks.json` — Linear preflight wiring — ships with `--cursor`, not `--auto`.) Install without `--auto` ships zero cloud footprint. **Online-dashboard** half (Claude env in `claude.ai/code`, Cursor env vars in `Cursor → Settings → Background Agents`) configured once per machine / account.

For **post-CI auto-routing** (ship-vs-debug after CI), bkit ships single `.github/workflows/bkit-cloud.yml` with TWO runtime-gated dispatch jobs — **claude** job (`claude-code-action`, runs when `ANTHROPIC_API_KEY` set) and **opencode** job (`opencode run` CLI, runs when `OPENCODE_PROVIDER_KEY` set) — plus `/bkit-auto` slash command both clouds invoke from single source (Cursor wires via dashboard trigger; no GHA on Cursor side). `bkit install --auto=opencode` requires `tracker=github` and remote (non-local) provider — `--opencode=ollama-local` cannot back cloud job (no Ollama server on runner).

Full recipe + paste-in setup script + env-var inventory + Cursor dashboard config + consumer customisation patterns: `.bkit/cloud.md`. Host-delta matrix: `.bkit/providers.md` § Runtime environment.

## JSON ownership model — deep-containment

`.claude/settings.json` and `.cursor/hooks.json` managed via **deep-containment**. bkit declares scope (full template JSON tree) that must be present as subset of consumer document. Consumer-added keys outside template tree survive every `bkit install` byte-identically — no special key or wrapper required.

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

In this example, `hooks.SessionStart` is bkit-declared scope (from template). `hooks.Stop` and `failClosed` are consumer-added — bkit never touches them.

**Rules:**

- Consumer keys outside template tree survive every `bkit install` byte-identically.
- `bkit install` uses `deepContains(template, consumer)` — every template leaf present. On drift, deep-merges template-wins; consumer-only siblings preserved.
- `bkit check` surfaces `tier2-json-drift` advisory when `deepContains` fails and **exits 1** (CI drift gate); writes nothing — consumer reviews and re-runs `bkit install` to reconverge.
- `.cursor/hooks.json` uses Cursor v1 keyed-object schema: `{"version": 1, "hooks": {"sessionStart": [...], "sessionStop": [...]}}`.

## Consumer CI auth

bkit resolves from **GitHub Packages npm registry**. Authentication requires:

1. **Create a classic PAT** on GitHub with `read:packages` scope:
   - GitHub Settings → Developer settings → Personal access tokens → **Tokens (classic)** → Scope: `read:packages`
   - Copy the generated token

   > **⚠️ Use a classic PAT, not fine-grained.** GitHub Packages npm registry currently rejects fine-grained PATs with HTTP 403, even when `Packages: read` is granted. Confirmed against `npm.pkg.github.com` 2026-05-06. If/when GitHub fixes this, fine-grained PATs will become preferred (narrower scope); for now classic is the only working option.

2. **Add the secret** to your consumer repo:
   - GitHub repo → Settings → Secrets and variables → Actions → New repository secret
   - Name: `GH_BKIT_TOKEN_INSTALL`
   - Value: paste the PAT

3. **Add `.npmrc`** at your repo root (committed, no secrets) — registry mapping ONLY. Auth token **not** stored here:

   ```
   @cbartens:registry=https://npm.pkg.github.com
   ```

4. Seeded `ci.yml` install step writes token into pnpm user-level config before install (added by `bkit install`):

   ```yaml
   - name: Install Dependencies
     run: |
       pnpm config set "//npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN_INSTALL"
       pnpm install --frozen-lockfile
     env:
       GH_BKIT_TOKEN_INSTALL: ${{ secrets.GH_BKIT_TOKEN_INSTALL }}
   ```

> **⚠️ Why `pnpm config set`, not `.npmrc`:** pnpm >=10.34.3 no longer authenticates project-`.npmrc` `${GH_BKIT_TOKEN_INSTALL}` env-substitution — `pnpm install` 401s on `@cbartens/bkit` download (`ERR_PNPM_FETCH_401`) even when token set. `pnpm config set` writes token to pnpm user-level config (`~/.npmrc` on pnpm 10.x, `~/.config/pnpm/auth.ini` on pnpm 11.x). Leftover `_authToken` line in project `.npmrc` must be **removed** — 401s and, by config precedence (project > user), shadows user-level token. Note: `pnpm view @cbartens/bkit` (metadata) may still resolve with broken setup — verify with real `pnpm install`, not `view`.

### Agent access to `GH_BKIT_TOKEN_INSTALL`

If permission rules block direct reads of `.env*` files (e.g. `Read(./.env*)`, `Bash(grep ... .env*)` denied), token still cannot be read — but **can** be exported into child process for duration of single command. Use in single Bash tool call:

```bash
set -a; source apps/web/.env.preview 2>/dev/null; set +a; <command that needs the token>
```

- `source` is shell builtin, not file I/O — agent permission layer (gates `Read` / `grep` / `cat`) does not see it. Token text never enters agent context.
- `<command>` (e.g. `pnpm view @cbartens/bkit`, `bkit check`) inherits `GH_BKIT_TOKEN_INSTALL` via environment.
- Verify token loaded **without leaking value**: `echo "len=${#GH_BKIT_TOKEN_INSTALL}"`.

**Caveat:** shell state does not persist between separate Bash tool calls. `source` and consuming command MUST run in **same** invocation — chain with `;` or `&&`. When directing another agent, name file path explicitly (e.g. _"source `apps/web/.env.preview` in-line; registry needs `GH_BKIT_TOKEN_INSTALL`"_).

## Consumer Vercel auth

Vercel runs own `pnpm install` in fresh build container — cannot run pre-install shell step. Since pnpm >=10.34.3 no longer authenticates project-`.npmrc` `${GH_BKIT_TOKEN_INSTALL}` env-substitution, set token via one-line `installCommand` writing pnpm user-level config before install.

1. **Add `GH_BKIT_TOKEN_INSTALL` to Vercel env vars** for each environment that builds (preview + production at minimum):

   ```bash
   vercel env add GH_BKIT_TOKEN_INSTALL preview
   vercel env add GH_BKIT_TOKEN_INSTALL production
   ```

   Or via web: Vercel project → Settings → Environment Variables. Token value = same PAT as GitHub Actions secret (scope: `read:packages`).

2. **Set `installCommand` in `vercel.json`** so token reaches pnpm user-level auth config before install (remove any pre-existing git-shim `installCommand`):

   ```json
   {
     "installCommand": "pnpm config set //npm.pkg.github.com/:_authToken=$GH_BKIT_TOKEN_INSTALL && pnpm install"
   }
   ```

   If legacy git-shim `installCommand` present (`git config --global url."https://x-access-token:$GH_BKIT_TOKEN_INSTALL@github.com/cbartens/bkit/".insteadOf …`), remove it — `pnpm config set` line replaces it entirely. (Registry-auth shim, not obsolete git-auth shim; see `docs/decisions.jsonl` DE-31.)

3. **Trigger redeploy** (push commit) and watch Vercel build log for `pnpm install` resolving `@cbartens/bkit` from `npm.pkg.github.com`.

## Install lifecycle

`bkit install` runs three phases in sequence:

**Phase 1 — Preflight (read-only, before any writes)**

bkit checks preconditions and known advisory patterns before touching any file. Blocker fires → install exits 1 immediately with formatted `[blocker]` line and zero writes. Advisories accumulated for Phase 3.

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

After writes, bkit re-runs token-surface and environment checks — some only accurate post-install (e.g. `.npmrc` content written by CI module, devDeps added to `package.json`).

<!-- prettier-ignore -->
| `id` | When |
| --- | --- |
| `gh-bkit-token-unset-shell` / `gh-bkit-token-empty-shell` | `GH_BKIT_TOKEN_INSTALL` unset (or set but empty) in shell |
| `npmrc-missing-gh-packages` | `.npmrc` exists but lacks the `@cbartens` registry mapping |
| `npmrc-legacy-authtoken` | `.npmrc` still carries a legacy `//npm.pkg.github.com/:_authToken=…` line (401s on pnpm >=10.34.3; move it to pnpm user-level config) |
| `gh-bkit-token-secret-missing` | `gh secret list` confirms secret absent |
| `gh-bkit-token-secret-unknown` | `gh` CLI unavailable/unauthenticated |
| `gh-mcp-token-unset-shell` / `gh-mcp-token-empty-shell` | `GH_BKIT_TOKEN` (GitHub MCP auth) unset/empty in shell while a `github` MCP server is configured — the whole tracker/PR/board MCP surface fails to connect. Suppressed in CI. |
| `vercel-env-missing-preview` | `vercel.json` detected; token absent in preview |
| `vercel-env-missing-production` | `vercel.json` detected; token absent in production |
| `ci-yml-missing-token-env` | ci.yml install step lacks the `pnpm config set` auth step and/or the `GH_BKIT_TOKEN_INSTALL` env mapping |
| `tracker-setup-none` / `-github` / `-linear` | Optional post-install decision — which issue tracker is wired (`bkit.issueTracker`). `none` nudges `bkit install --tracker=…`. See [§ Optional post-install decisions](#optional-post-install-decisions). |
| `github-project-board-sync-unconfigured` | GitHub tracker active but Projects v2 board sync is half-configured (`bkit.githubProject` absent and/or `.mcp.json` lacks the `projects` toolset) — sync silently no-ops. Silence with `bkit.githubProject: false`. |
| `github-project-status-field-id-format` | `bkit.githubProject` is configured but `statusFieldId` holds a GraphQL node id (`PVTSSF_…`) or non-number — `projects_write` needs the numeric field id, so board sync silently no-ops. Re-derive via `gh api /orgs/<org>/projectsV2/<number>/fields`. |
| `dep-updater-none` / `-renovate` / `-dependabot` | Optional post-install decision — which dependency updater is wired. `none` nudges `bkit install --dependency=renovate` or `--dependency=dependabot` (mutually exclusive). See [§ Optional post-install decisions](#optional-post-install-decisions). |
| `cloud-router-none` / `cloud-router` | Optional post-install decision — post-CI auto-routing (`bkit.cloudAgents`). `none` (undecided) nudges `bkit install --auto=<variant>`; `cloud-router` is informational once `bkit-cloud.yml` is present. See [§ Optional post-install decisions](#optional-post-install-decisions). |
| `actions-write-permissions-missing` | `bkit-cloud.yml` present but repo Actions permissions are read-only / PR creation disabled — `actions/checkout` + `gh pr create` 403. Repo-level check; org policy can override. |
| `opencode-setup` | opencode host installed (`--opencode=<provider>`) — names the provider key to set (e.g. `NVIDIA_API_KEY`; none for `ollama-local`; `OPENCODE_API_KEY` for `opencode-zen` / `opencode-go`), confirms the pre-seeded base URL, and notes all ten providers ship curated per-agent pins (re-pin via `.bkit/prompts.md` § Model Overrides). Verify with `bkit doctor` + `bkit status`. |
| `vale-package-not-synced` | vale on PATH but `.vale/styles/write-good/` absent |
| `devdeps-need-fetch` | bkit added devDeps in this run — `pnpm install` needed |

Phase 1 and Phase 3 findings merged and deduplicated by `id` (Phase 3 wins on conflict — re-detection more accurate post-write). Zero findings → no banner.

**`bkit check` (dry-run)** runs Phase 1 and Phase 3 (read-only) — same advisory set as `bkit install` minus writes (v2.2.3+). Changes no managed file (regenerates `.bkit/advisories.md` artifact) and **exits 1 when any managed-file write would occur** in installed module — Tier-2 JSON deep-containment or markered-block drift, whole-file byte-equal mismatch, **host agent/command mirror content drift** (would-write / orphan delete), or when rendered prompts/workflows / managed docs carry a stale managed-version marker (`bkit-rendered-prompts-stale` / `bkit-managed-docs-stale`, #256). Gate covers **installed** module set ({core, claude, cursor, ci, lint, git-hooks} plus **opencode**, each detected by sentinel files). opencode gated (#255 #8): `.opencode/opencode.json` (provider block + tracker-filtered mcp + permission sandbox) and `gateguard.js` drift fail `check` — render inputs fall back to installed provider (`package.json` `bkit.opencodeProvider`, authoritative for `opencode-zen` / `opencode-go`; all installed providers tracked in `bkit.opencodeProviders: string[]`) and recorded tracker, so clean install across providers checks green (no false drift). Remaining **opt-in** modules (renovate/dependabot/cloud) NOT drift-gated. See `docs/knowledge.jsonl` KN-4 for original design (Phase 3 read-only semantics now enforced via read-only detector paths, not by skipping Phase 3).

**`PreflightFinding` shape** — stable contract for downstream tooling:

```typescript
interface PreflightFinding {
  id: string; // stable kebab-case identifier
  severity: "blocker" | "advisory";
  detect: string; // one-line description of the detected condition
  action: string; // AI-pasteable fix instruction
}
```

Findings rendered as `--- i/N [severity] id ---` with `DETECT:` and `ACTION:` sections — copy-paste whole banner into coding assistant to apply fixes in sequence.

For four-surface token sweep, see [§ Consumer CI auth](#consumer-ci-auth).

## Optional post-install decisions

Three capabilities **opt-in** — never wired by plain host/tooling install. Default install never enables them; post-install advisory banner nudges you to choose, once. Each recorded in `package.json` (`bkit.issueTracker`, `bkit.depUpdater`, `bkit.cloudAgents`) so nudge knows whether you've decided or deliberately opted out.

<!-- prettier-ignore -->
| Decision | Default | Opt-in command | Advisory when unset |
| --- | --- | --- | --- |
| **Issue tracker** | `none` (workflows run; tracker calls are no-ops) | `bkit install --tracker=github` (browser OAuth, no PAT) or `--tracker=linear` (`LINEAR_API_KEY`) | `tracker-setup-none` |
| **Dependency updater** | none (no auto dep PRs) | `bkit install --dependency=renovate` (recommended) **or** `--dependency=dependabot` — mutually exclusive | `dep-updater-none` |
| **Cloud agents** | none (zero cloud footprint) | `bkit install --auto=claude\|cursor\|opencode` — installs `bkit-cloud.yml` (claude + opencode jobs, secret-gated) + cloud env scaffolding (cloud-bootstrap.sh, Cursor Dockerfile/environment.json) | `cloud-router-none` |

**Why opt-in, not part of a default install:**

- **Tracker** wires real credentials and MCP servers into workflows — consumer must choose provider; bkit can't guess.
- **Dependency updater** requires deliberate choice between two tools (Renovate needs one-time GitHub App install that can't be scripted). Shipping one by default forces a tool consumer may not want and, for Renovate, creates broken onboarding PR if App installed before config reaches default branch (see `docs/deployments.md` § GitHub Actions pinning).
- **Cloud agents** install phase-routed `bkit-cloud.yml` (auto-dispatches bkit-ship on CI pass, bkit-debug on CI fail; design/plan/build via `workflow_dispatch`) plus cloud env scaffolding (`.claude/hooks/cloud-bootstrap.sh`, `.cursor/Dockerfile`, `.cursor/environment.json`). Workflow carries claude job and opencode job, each runtime-gated on provider secret — inert without key: claude needs `ANTHROPIC_API_KEY` (+ Claude GitHub App), opencode needs `OPENCODE_PROVIDER_KEY`. Both need GitHub Actions write permissions, GitHub tracker, and (Cursor half) dashboard trigger — tracker itself opt-in. Env scaffolding inert until Claude/Cursor cloud env wired in dashboard. Autonomous routing by default, wired to unconfigured tracker, is wrong default — install without `--auto` ships zero cloud footprint.

**How to decide:**

1. Run `bkit install --claude --cursor --tooling` (or whichever modules you want). Post-install banner lists `tracker-setup-none`, `dep-updater-none`, `cloud-router-none` if undecided.
2. Pick tracker: `bkit install --tracker=github` (or `linear`). Persisted to `bkit.issueTracker`; future installs preserve (switching free).
3. Pick dependency updater: `bkit install --dependency=renovate` (or `--dependency=dependabot`). Persisted to `bkit.depUpdater`. Renovate: re-run after merging config to default branch for App-install URL (Phase B).
4. Enable cloud agents: `bkit install --auto=claude|cursor|opencode`. Persisted to `bkit.cloudAgents`; install prints secrets + permissions + dashboard checklist (`bkit-auto-setup`). Shipped `bkit-cloud.yml` carries claude job (`ANTHROPIC_API_KEY`) and opencode job (`OPENCODE_PROVIDER_KEY`), each runtime-gated.
5. **To opt out and silence nudge**, set field to `"none"` in `package.json` (`bkit.issueTracker` / `bkit.depUpdater` / `bkit.cloudAgents`). Advisory stays quiet.

All three reversible — re-run install with relevant flag. Renovate ↔ Dependabot mutually exclusive: bkit refuses one while other's config present, with cleanup advisory.

## Doctor

`bkit doctor` is **diagnostic verb** — runs Phase 1 preflight + Phase 3 token-surface detectors, exits 0. Changes no managed file; like `bkit check` regenerates `.bkit/advisories.md` artifact (creates `.bkit/` if absent — repo that never installed bkit gains that one file).

```bash
# Diagnose drift without running install
bkit doctor
```

Use `bkit doctor` to:

- Check whether `GH_BKIT_TOKEN_INSTALL` is set in shell and on GitHub repo.
- Surface `bkit-version-pin-stale` advisory (installed version ahead of `.bkit/version`).
- Preview all advisories `bkit install` would show post-install, without triggering writes.
- Verify environment ready before `bkit install` on new machine.
- Detect macOS GUI-isolation (`bkit cursor` / `bkit opencode`): see `.bkit/providers.md` § macOS GUI-isolation.
  `bkit doctor` always exits 0. Advisories found → printed in same checklist banner format as `bkit install`. None found → prints `[bkit-doctor] No advisories found.`

## Uninstall

`bkit uninstall` surgically removes bkit-managed content while preserving consumer customisations.

```bash
# Uninstall EVERYTHING — all modules, including the opt-in add-ons
# (renovate / dependabot / cloud) if present. The inverse of install is
# asymmetric: a full *install* skips the opt-in add-ons, a full *uninstall*
# removes them too.
bkit uninstall

# Preview what would be removed (no writes)
bkit uninstall --dry-run

# Uninstall specific modules (targeted — leaves core + the other modules intact)
bkit uninstall --tooling      # removes ci.yml + lint + husky hooks only
bkit uninstall --auto         # removes only bkit-cloud.yml + the cloudAgents key

# Also strip managed package.json scripts/devDeps
bkit uninstall --package

# Force-delete byte-equal-text files even if consumer modified them
bkit uninstall --force

# Delete ALL bkit files regardless of consumer modifications (confirm prompt)
bkit uninstall --nuke
# Skip interactive confirm:
bkit uninstall --nuke --yes
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

Bare uninstall removes bkit-managed files and strips bkit-managed blocks, but **not** guaranteed zero-footprint wipe. Deliberately leaves: `docs/` reference payload (consumer-editable, often customised); any file consumer modified (Tier-3 hash mismatch → preserved); generated artefacts not manifest-tracked (`.bkit/advisories.md`, `.bkit/friction.jsonl`). Use `--nuke` to force-remove every manifest-listed bkit file regardless of consumer modifications; generated artefacts and `docs/` still yours to delete by hand.

## Phase 3 exit-1 and recovery

When `bkit install` detects **blocker-severity** finding in Phase 3 (e.g. `ci.yml` missing `GH_BKIT_TOKEN_INSTALL` env mapping with `.npmrc` referencing token), exits 1 and prints single-line recovery command:

```
[bkit-install] 1 Phase 3 blocker(s) detected. Recovery:
  bkit uninstall <flags> && <fix the issue> && bkit install <flags>
```

Advisories (non-blockers) informational only — do NOT trigger exit-1.

### --auto-revert

Add `--auto-revert` to `bkit install` to automatically run `bkit uninstall` in-process when Phase 3 blocker fires:

```bash
bkit install --auto-revert
```

Useful in CI scripts to guarantee clean state on failure.

## .bkitignore

Create `.bkitignore` at repo root to suppress `bkit check` drift for specific files or JSON keys.

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

Per-key (`:dotted.key`) matching off by default. Enable with:

```bash
BKIT_BKITIGNORE_PER_KEY=1 bkit check
```

Lets consumers add own JSON keys (e.g. `hooks.Stop` in `.claude/settings.json`) without triggering drift detection, while bkit still manages its own keys in same file.

## Install staging directory

`bkit install` renders derived files (e.g. `.opencode/opencode.json`) into `.bkit-staging/` scratch directory before merging into consumer destinations. Scratch directory cleaned up after every run — success and failure alike — never persists in committed consumer repo state.

**Not a cross-module transaction.** Modules write directly to destinations — `bkit install` not atomic across modules: failure partway (e.g. hand-broken `.claude/settings.json` makes JSON merge throw) leaves earlier-module files written and `.bkit/version` unpinned. Error surfaced, not swallowed.

**Recovery is re-run.** `bkit install` idempotent — fix offending file and re-run to complete. `bkit uninstall` removes whatever was written.

## Documentation

**Full reference:** `.bkit/README.md` — what bkit does, prerequisites, triggering workflows, key files.

**Workflow internals:** `.bkit/workflows.md`.

**Subagent metadata:** `.bkit/prompts.md`.
