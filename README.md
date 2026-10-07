# bkit

Agent workflow system wiring Claude Code (and Cursor) into a five-phase Linear-integrated dev cycle: `/bkit-design` → `/bkit-plan` → `/bkit-build` → `/bkit-debug` → `/bkit-ship`.

## Why bkit

Every feature runs through the gated pipeline a senior engineering team would insist on — design review, plan critique, adversarial code challenge, test gate, release checklist — with human sign-off at every hard stop. Five slash commands (`/bkit-design` → `/bkit-plan` → `/bkit-build` → `/bkit-debug` → `/bkit-ship`) fan work out to 40+ specialised subagents. Rigor lives in the toolkit, not in one person's prompting.

### What makes bkit different

- **Independent parallel review before you see output.** The same diff, design, or plan is reviewed by multiple subagents at once under distinct lenses (bug-hunting vs security; tightness vs dependency-correctness vs regression-risk) — with a circular-reasoning guard so sibling reviewers can't read each other's output. Two independent reasoners catch what one misses; you see the reconciled verdict, not the raw fan-out. Cross-tier model diversity on every parallel pair (Opus + Sonnet on Claude; Grok + Composer on Cursor) means two different model families review the same work.
- **Every run isolated in its own git worktree.** Design one feature while building a second and shipping a third — no branch-switching, stashing, or conflicts. Many pipelines run concurrently against the same repo.
- **Non-negotiable human gates.** Hard stops after design, plan, and ship. bkit recommends, never decides — production merges need explicit human approval. Peer frameworks treat human-in-the-loop as advisory prose; bkit treats it as a contract.
- **Deterministic resume from state, not vendor session.** Every run's progress lives in `status.jsonl`; plan and design docs live under `docs/plans/`. A crashed or interrupted run picks up exactly where it left off. Nothing is tied to one IDE's session.
- **Cross-host and cross-provider continuity.** Every host renders from the same `.bkit/` source — so any phase, or a resumed run, executes on whichever host and provider you have capacity for, with identical gates, hooks, and per-agent model pins. Hit a Claude weekly limit or a provider free-tier mid-feature? Pick up in Cursor or on local/free inference — same gated pipeline, no re-setup, no lost context. Dogfood on free local models, ship on your primary model.
- **Per-agent model pins, immune to session drift.** Every subagent has an explicit model and effort tier — running `/bkit-plan` from a Sonnet session never silently downgrades the Opus-tier reviewers. Pins survive across hosts and providers.
- **Single canonical source, mirrored to every IDE tree.** One `.bkit/` source regenerates `.claude/`, `.cursor/`, and `.opencode/` trees. No hand-maintained 11-tree sprawl; edit once, every host converges. `bkit check` is the CI drift gate.
- **One feature in flight, enforced.** A repo-level concurrency lock prevents two pipelines from racing the same integration branch.

### The pipeline at a glance

```
/bkit-design  →  /bkit-plan  →  /bkit-build  →  /bkit-ship  →  merged
                                  ↑    ↓
                              /bkit-debug   (side-rail, on test failure)
```

Every phase dispatches subagents in parallel under distinct lenses; the diff, plan, or design is reviewed by independent reasoners before you see the reconciled verdict. Parallel groups per phase:

- **Design** — fetches related issues; 3 brainstorms (pragmatic / tradeoff / risk) + 2 reviews (feasibility, cross-tier)
- **Plan** — fetches related issues + prior deferrals + prior failures; 3 critiques (tightness / dependency / regression) + 2 scope-checks
- **Build** — execute ⇄ verify loop; 2 challenges (bug-hunting + security); local test gate (`bkit:gate:static-unit`, or `bkit:gate:static-unit-integration` where declared); CI runs the full multi-tier scaffold on the PR
- **Ship** — pre-merge completeness gate; waits for CI capstone (`bkit-tests-check`) green before merge; docs update + summary in parallel
- **Debug** — fetches CI failure logs + e2e reports + diff vs last-passing CI + runtime logs + related issues; diagnose (reads prior `knowledge.jsonl`) → remediate; broader test tier (adds integration + e2e + optional `@live` canary); soak mode for non-localisable failures
- **Autonomous loop (opt-in `bkit-auto`)** — CI completion auto-routes: `/bkit-ship` on green, `/bkit-debug` on red; debug re-pushes, CI re-runs, auto-routes again. Runs unattended in cloud (Claude Code on the web / Cursor Background Agents / opencode) until a human gate fires.
- **Audits** — no slash command. More than 30 read-only templates in `docs/templates/bkit-audit-*.md` (security, privacy, accessibility, architecture, performance, reliability, testing, database, LLM, cost, and others). `@bkit-audit-generate` runs one and writes `docs/audits/{YYYYMM}/{slug}.md`. `/bkit-plan` takes a design, one or more of those reports, or both.

Hard stops after Design, Plan, and Ship. For every subagent step in execution order (40+ distinct agents total), see `.bkit/comparison.md`. Full audit catalogue: `.bkit/prompts.md` § Audit (Ad-hoc).

### What ships with every install

- **Tracker as source of truth.** GitHub Issues or Linear: bkit reads the issue for context, posts progress per phase, moves the issue through states, and links the resulting PR back. Project management stays where it already lives.
- **Multi-tier CI scaffold where green means validated.** Flat, wide GitHub Actions pipeline — a planner fans out to lanes (`static` / `unit` / `build-web` / `integration` / `migration`, then `e2e-web` / `live-web` after an optional shared-resource reset, plus optional device lanes); an always-on capstone joins them and fails the build if any planned tier was skipped. Wall-clock is the slowest lane, not the sum. The capstone is the single branch-protection check, so partial or cached runs can't pass as validated. A default-branch deploy job promotes the build lane's deployment and is not a required check. Ships step-by-step in seeded `ci.yml`. Lane contract: `docs/testing.md`. Concurrency and promotion: `docs/deployments.md`.
- **Quality gates, local and CI in lockstep.** Typecheck, Prettier, Vale prose linter, LLM-slop scanner, actionlint, and mirror/drift gate run in seeded pre-commit and pre-push hooks **and** in CI — same commands in both places, so a green local push is a green CI run.
- **Dependency updates, as examples.** Copy Renovate or Dependabot config and own it. The examples group non-major bumps, pin GitHub Actions, maintain the lockfile, and let CVE alerts bypass the weekly schedule.
- **Cloud agents — autonomous ship-on-green / debug-on-red.** Opt-in: when CI finishes, a Claude Code or Cursor cloud agent picks up — `bkit-ship` on green, `bkit-debug` on red — with no local session required.
- **Any model, same harness.** Beyond Claude Code and Cursor, `bkit install --opencode=<provider>` adds a third execution host talking to the backend directly — no router, no model-identity lie. Four providers ship ready-to-run with curated per-agent pins (OpenRouter, Ollama, opencode Zen + Go gateways). Subagents, gates, hooks, and MCP config stay unchanged — only the backend and per-agent pins differ. See `.bkit/providers.md`.
- **More than 30 read-only audit templates.** Security, privacy, accessibility, architecture, performance, reliability, testing, database, LLM, cost, and others under `docs/templates/bkit-audit-*.md`. Invoke `@bkit-audit-generate` on one template; it writes a report under `docs/audits/`. `/bkit-plan` plans the findings the session prompt names. Full catalogue: `.bkit/prompts.md` § Audit (Ad-hoc).

For the full pipeline reference, every subagent in execution order, and the mapping against Antonio Gulli's _Agentic Design Patterns_ (12 of 22 patterns fully implemented, several beyond the book), see `.bkit/comparison.md`.

> [!IMPORTANT]
> **`BKIT_GH_TOKEN_INSTALL` is required everywhere bkit installs.** Without it, `pnpm install` fails with an opaque 401 (or the silent-ignore-then-fall-back-to-npmjs footgun → 404). Set it in **all four** places before running `pnpm add -D @cbartens/bkit`:
>
> 1. **Local shell** — pick one of two flows (see § Local env setup for details):
>    - **(A) Quick:** `export BKIT_GH_TOKEN_INSTALL=<classic PAT>` in `~/.zshrc` or `~/.bashrc`. Works immediately, single-step. Same token leaks into every shell.
>    - **(B) direnv + `.bkit/.env` (recommended for daily use):** `brew install direnv` once per machine, then `.bkit/.env` (gitignored, scaffolded by `bkit install`) auto-loads on `cd`. Tokens scoped to the repo, not your whole shell. Note: `.bkit/.env` only exists _after_ `bkit install` runs, so for the first install you need either (A) or a one-off `export` in the current shell.
> 2. **`.npmrc` at repo root** — registry mapping only; token goes in pnpm user-level config via `pnpm config set` — see § Consumer CI auth below
> 3. **GitHub Actions repo secret** — `gh secret set BKIT_GH_TOKEN_INSTALL --body=<token>` per consumer repo
> 4. **Vercel env vars** (if applicable) — `vercel env add BKIT_GH_TOKEN_INSTALL preview/production`
>
> **Use a classic PAT, not fine-grained.** GitHub Packages npm registry currently rejects fine-grained PATs with HTTP 403 even when `Packages: read` is granted (verified 2026-05). Until GitHub fixes this, classic with `read:packages` scope is the only working option.

## Quick install / upgrade — paste into your AI

Two paste blocks below — **install** (first time) and **upgrade** (already on bkit). Both end the same way: apply advisories, reconcile templates, verify with `bkit check`.

### Install — first time

After creating a classic GitHub PAT with `read:packages` scope ([Tokens (classic)](https://github.com/settings/tokens)) and saving it as `BKIT_GH_TOKEN_INSTALL=<token>` in a local env file in this repo (e.g. `.env.local`, `apps/web/.env.preview`), copy the block below into Claude Code / Cursor / any coding agent. Replace `<ENV-FILE-PATH>` with your env file's path.

````text
Install the latest `@cbartens/bkit` in this repo and finish setup.
1. I've created a classic GitHub PAT with `read:packages` scope and saved it as `BKIT_GH_TOKEN_INSTALL=<token>` in `<ENV-FILE-PATH>` (e.g. `.env.local` or `apps/web/.env.preview`). Confirmed.
2. Access `BKIT_GH_TOKEN_INSTALL` without leaking it into context: `source` is a shell builtin (not file I/O) — permission gates on `Read`/`grep`/`cat` do NOT see it. Pattern (same Bash invocation — shell state does NOT persist between tool calls):
   ```bash
   set -a; source <ENV-FILE-PATH> 2>/dev/null; set +a; <command that needs the token>
   ```
   Verify without leaking: `echo "len=${#BKIT_GH_TOKEN_INSTALL}"`.
3. Ensure root `.npmrc` has registry mapping only (token NOT stored here — pnpm >=10.34.3 401s on project-`.npmrc` `${BKIT_GH_TOKEN_INSTALL}` substitution):
   ```
   @cbartens:registry=https://npm.pkg.github.com
   ```
   Then auth + install + seed hosts/tooling in one Bash call (`bkit install` requires named modules — core implicit; if `bkit` not on PATH use `pnpm bkit`):
   ```bash
   set -a; source <ENV-FILE-PATH>; set +a; \
     pnpm config set "//npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL" && \
     pnpm add -D @cbartens/bkit@latest && \
     bkit install --claude --cursor --tooling
   ```
   Seeds `.agents/`, `.claude/`, `.cursor/`, CI, lint, git-hooks.
4. Read `.bkit/advisories.md` end-to-end. For every `[advisory]`/`[blocker]`: apply its **Action** unless truly N/A. If you skip, state advisory id and why.
5. Read canonical templates at `node_modules/@cbartens/bkit/.bkit/templates/` (husky, CI, `.claude/settings.json`, `.cursor/`, renovate, vale, etc.). MUST reconcile against this repo and adopt unless adoption would break existing functionality — seed-or-print files (e.g. `ci.yml`) do NOT overwrite existing files, so adoption is your job. For any template not adopted, state which and why.
6. Re-run `bkit check` (or `pnpm bkit check`). Fix remaining drift/advisories you can. End with: resolved version, advisories applied, advisories skipped (with reasons), templates adopted/skipped (with reasons).
````

### Upgrade — already installed

Same paste block ships in `.bkit/README.md` (mirrored into consumer repos on install — keep both in sync when editing). Copy when the repo already has `@cbartens/bkit`. Prefer `bkit upgrade --latest` (bumps the package **and** resyncs managed files) — do **not** only `pnpm add`. Replace `<ENV-FILE-PATH>` if the token is not already loaded in the shell (direnv / `.bkit/.env`).

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
| 2 | Add `BKIT_GH_TOKEN_INSTALL` repo secret | [§ Consumer CI auth](#consumer-ci-auth) step 2 |
| 3 | Commit `.npmrc` at repo root (registry mapping only; token goes in pnpm user-level config) | [§ Consumer CI auth](#consumer-ci-auth) step 3 |
| 4 | Export `BKIT_GH_TOKEN_INSTALL` for the `pnpm add` step (one-off — `export BKIT_GH_TOKEN_INSTALL=<classic PAT>` in this shell only), then run `pnpm add -D @cbartens/bkit` | [§ Install](#install) (this section) |
| 5 | Run `bkit install --claude --cursor --tooling` to seed both hosts + tooling (creates `.bkit/.env.example` + `.envrc`) | [§ Install](#install) (this section) |
| 5a | Set up direnv + `.bkit/.env` so every subsequent shell auto-loads `BKIT_GH_TOKEN_INSTALL`, `BKIT_GH_TOKEN`, `BKIT_LINEAR_API_KEY` | [§ Local env setup](#local-env-setup) |
| 6 | If deploying to Vercel: add `BKIT_GH_TOKEN_INSTALL` to Vercel env vars | [§ Consumer Vercel auth](#consumer-vercel-auth) |
| 7 | Push to a feature branch and verify CI runs green | — |

Seeded `.github/workflows/ci.yml` install step writes token into pnpm user-level config (`pnpm config set …`) before `pnpm install` and carries `BKIT_GH_TOKEN_INSTALL` env block — only thing CI needs to authenticate `@cbartens/bkit` is `BKIT_GH_TOKEN_INSTALL` secret from step 2. No cross-org `uses:` reference; `bkit` stays private without affecting consumer auth.

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

**Opt-in flags:** `--tracker=github|linear`, `--auto=claude|cursor` (cloud agents), `--opencode=<provider>` (additive opencode execution host — `openrouter`, `ollama`, `opencode-zen`, `opencode-go`). Dependency updaters: copy an example and own it. See [§ Optional post-install decisions](#optional-post-install-decisions).

> **⚠️ Moving bkit versions: use `bkit upgrade --latest` (or `--to=<version>`).** Bumps `@cbartens/bkit` **and** resyncs `.agents/` payload + `.bkit/version` pin in one atomic step — two can never drift apart. Bare `pnpm add @cbartens/bkit` (or Renovate/Dependabot bump) only refreshes `package.json` + lockfile — does **not** resync; skipping resync reds CI on `bkit check` drift gate. If you bump package separately, run `bkit upgrade` afterward and commit resync alongside version bump in same PR.

### Local env setup

Two flows — pick one. Both end with `BKIT_GH_TOKEN_INSTALL` and `BKIT_GH_TOKEN` in shell for pnpm and GitHub MCP. Linear repos also need `BKIT_LINEAR_API_KEY`. Use `gh auth login` for CLI.

#### Flow A — Shell export (quickest, no extra deps)

```bash
# Add to ~/.zshrc (or ~/.bashrc)
export BKIT_GH_TOKEN_INSTALL=<classic PAT, read:packages>      # pnpm → npm.pkg.github.com
export BKIT_GH_TOKEN=<fine-grained PAT>                 # GitHub MCP
export BKIT_LINEAR_API_KEY=<Linear personal API key>        # Linear MCP + preflight

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
# Edit .bkit/.env: set BKIT_GH_TOKEN_INSTALL, BKIT_GH_TOKEN, BKIT_LINEAR_API_KEY
direnv allow                                                       # trust the .envrc

# 4. Verify
echo "len=${#BKIT_GH_TOKEN}"                                            # non-zero → MCP token loaded
gh auth status                                                       # gh CLI uses keyring, not BKIT_GH_TOKEN
```

After step 4, restart open Claude Code / Cursor sessions in this repo so new env reaches MCP servers.

`.bkit/.env` gitignored — never commit. Cloud sessions (Claude Code on the web, Cursor Background Agents): set same names in respective online dashboards; see `.bkit/cloud.md` § Environment variables. `bkit install` / `bkit check` advisories detect missing direnv, blank required keys, un-allowed `.envrc` — follow whichever fires.

#### One-time per machine — register the GH Packages token with pnpm

After either flow makes `BKIT_GH_TOKEN_INSTALL` available in shell, write into pnpm user-level auth config so local `pnpm install` resolves `@cbartens/bkit`:

```bash
pnpm config set "//npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL"
```

pnpm >=10.34.3 no longer authenticates project-`.npmrc` `${BKIT_GH_TOKEN_INSTALL}` env-substitution (401s on download) — user-level step required; committed `.npmrc` carries only registry mapping. `pnpm config set` writes `~/.npmrc` on pnpm 10.x and `~/.config/pnpm/auth.ini` on pnpm 11.x (whichever pnpm reads) — same command across pnpm versions.

## Cloud agent environments (Claude Code on the web + Cursor Background Agents)

bkit ships repo-side scaffolding for both cloud agents via opt-in `bkit install --auto=<variant>` — `.claude/hooks/cloud-bootstrap.sh` (per-session install), `.cursor/Dockerfile` + `.cursor/environment.json` (Cursor cloud image), phase-routed `.github/workflows/bkit-cloud.yml`. (`.cursor/hooks.json` — Linear preflight wiring — ships with `--cursor`, not `--auto`.) Install without `--auto` ships zero cloud footprint. **Online-dashboard** half (Claude env in `claude.ai/code`, Cursor env vars in `Cursor → Settings → Background Agents`) configured once per machine / account.

For **post-CI auto-routing** (ship-vs-debug after CI), bkit ships single `.github/workflows/bkit-cloud.yml` with TWO runtime-gated dispatch jobs — **claude** job (`claude-code-action`, runs when `BKIT_ANTHROPIC_API_KEY` set) and **opencode** job (`opencode run` CLI, runs when `OPENCODE_PROVIDER_KEY` set) — plus `/bkit-auto` slash command both clouds invoke from single source (Cursor wires via dashboard trigger; no GHA on Cursor side). `bkit install --auto=opencode` requires `tracker=github`.

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
   - Name: `BKIT_GH_TOKEN_INSTALL`
   - Value: paste the PAT

3. **Add `.npmrc`** at your repo root (committed, no secrets) — registry mapping ONLY. Auth token **not** stored here:

   ```
   @cbartens:registry=https://npm.pkg.github.com
   ```

4. Seeded `ci.yml` install step writes token into pnpm user-level config before install (added by `bkit install`):

   ```yaml
   - name: Install Dependencies
     run: |
       pnpm config set "//npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL"
       pnpm install --frozen-lockfile
     env:
       BKIT_GH_TOKEN_INSTALL: ${{ secrets.BKIT_GH_TOKEN_INSTALL }}
   ```

> **⚠️ Why `pnpm config set`, not `.npmrc`:** pnpm >=10.34.3 no longer authenticates project-`.npmrc` `${BKIT_GH_TOKEN_INSTALL}` env-substitution — `pnpm install` 401s on `@cbartens/bkit` download (`ERR_PNPM_FETCH_401`) even when token set. `pnpm config set` writes token to pnpm user-level config (`~/.npmrc` on pnpm 10.x, `~/.config/pnpm/auth.ini` on pnpm 11.x). Leftover `_authToken` line in project `.npmrc` must be **removed** — 401s and, by config precedence (project > user), shadows user-level token. Note: `pnpm view @cbartens/bkit` (metadata) may still resolve with broken setup — verify with real `pnpm install`, not `view`.

### Agent access to `BKIT_GH_TOKEN_INSTALL`

If permission rules block direct reads of `.env*` files (e.g. `Read(./.env*)`, `Bash(grep ... .env*)` denied), token still cannot be read — but **can** be exported into child process for duration of single command. Use in single Bash tool call:

```bash
set -a; source apps/web/.env.preview 2>/dev/null; set +a; <command that needs the token>
```

- `source` is shell builtin, not file I/O — agent permission layer (gates `Read` / `grep` / `cat`) does not see it. Token text never enters agent context.
- `<command>` (e.g. `pnpm view @cbartens/bkit`, `bkit check`) inherits `BKIT_GH_TOKEN_INSTALL` via environment.
- Verify token loaded **without leaking value**: `echo "len=${#BKIT_GH_TOKEN_INSTALL}"`.

**Caveat:** shell state does not persist between separate Bash tool calls. `source` and consuming command MUST run in **same** invocation — chain with `;` or `&&`. When directing another agent, name file path explicitly (e.g. _"source `apps/web/.env.preview` in-line; registry needs `BKIT_GH_TOKEN_INSTALL`"_).

## Consumer Vercel auth

Vercel runs own `pnpm install` in fresh build container — cannot run pre-install shell step. Since pnpm >=10.34.3 no longer authenticates project-`.npmrc` `${BKIT_GH_TOKEN_INSTALL}` env-substitution, set token via one-line `installCommand` writing pnpm user-level config before install.

1. **Add `BKIT_GH_TOKEN_INSTALL` to Vercel env vars** for each environment that builds (preview + production at minimum):

   ```bash
   vercel env add BKIT_GH_TOKEN_INSTALL preview
   vercel env add BKIT_GH_TOKEN_INSTALL production
   ```

   Or via web: Vercel project → Settings → Environment Variables. Token value = same PAT as GitHub Actions secret (scope: `read:packages`).

2. **Set `installCommand` in `vercel.json`** so token reaches pnpm user-level auth config before install (remove any pre-existing git-shim `installCommand`):

   ```json
   {
     "installCommand": "pnpm config set //npm.pkg.github.com/:_authToken=$BKIT_GH_TOKEN_INSTALL && pnpm install"
   }
   ```

   If legacy git-shim `installCommand` present (`git config --global url."https://x-access-token:$BKIT_GH_TOKEN_INSTALL@github.com/cbartens/bkit/".insteadOf …`), remove it — `pnpm config set` line replaces it entirely. (Registry-auth shim, not obsolete git-auth shim; see `docs/decisions.jsonl` DE-31.)

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
| `gh-bkit-token-unset-shell` / `gh-bkit-token-empty-shell` | `BKIT_GH_TOKEN_INSTALL` unset (or set but empty) in shell |
| `npmrc-missing-gh-packages` | `.npmrc` exists but lacks the `@cbartens` registry mapping |
| `npmrc-legacy-authtoken` | `.npmrc` still carries a legacy `//npm.pkg.github.com/:_authToken=…` line (401s on pnpm >=10.34.3; move it to pnpm user-level config) |
| `gh-bkit-token-secret-missing` | `gh secret list` confirms secret absent |
| `gh-bkit-token-secret-unknown` | `gh` CLI unavailable/unauthenticated |
| `gh-mcp-token-unset-shell` / `gh-mcp-token-empty-shell` | `BKIT_GH_TOKEN` (GitHub MCP auth) unset/empty in shell while a `github` MCP server is configured — the whole tracker/PR/board MCP surface fails to connect. Suppressed in CI. |
| `vercel-env-missing-preview` | `vercel.json` detected; token absent in preview |
| `vercel-env-missing-production` | `vercel.json` detected; token absent in production |
| `ci-yml-missing-token-env` | ci.yml install step lacks the `pnpm config set` auth step and/or the `BKIT_GH_TOKEN_INSTALL` env mapping |
| `tracker-setup-none` / `-github` / `-linear` | Optional post-install decision — which issue tracker is wired (`bkit.issueTracker`). `none` nudges `bkit install --tracker=…`. See [§ Optional post-install decisions](#optional-post-install-decisions). |
| `github-project-board-sync-unconfigured` | GitHub tracker active but Projects v2 board sync is half-configured (`bkit.githubProject` absent and/or `.mcp.json` lacks the `projects` toolset) — sync silently no-ops. Silence with `bkit.githubProject: false`. |
| `github-project-status-field-id-format` | `bkit.githubProject` is configured but `statusFieldId` holds a GraphQL node id (`PVTSSF_…`) or non-number — `projects_write` needs the numeric field id, so board sync silently no-ops. Re-derive via `gh api /orgs/<org>/projectsV2/<number>/fields`. |
| `dep-updater-absent` | No Renovate or Dependabot config. Copy one example and own it. `bkit.depUpdater: "none"` silences this. See [§ Optional post-install decisions](#optional-post-install-decisions). |
| `dep-updater-both` | Both updater configs are present. Keep one. |
| `dep-updater-touches-bkit` | Updater config does not exclude `.github/workflows/bkit-cloud.yml`, which `bkit install` rewrites. |
| `cloud-router-none` / `cloud-router` | Optional post-install decision — post-CI auto-routing (`bkit.cloudAgents`). `none` (undecided) nudges `bkit install --auto=<variant>`; `cloud-router` is informational once `bkit-cloud.yml` is present. See [§ Optional post-install decisions](#optional-post-install-decisions). |
| `actions-write-permissions-missing` | `bkit-cloud.yml` present but repo Actions permissions are read-only / PR creation disabled — `actions/checkout` + `gh pr create` 403. Repo-level check; org policy can override. |
| `opencode-setup` | opencode host installed (`--opencode=<provider>`) — names the provider key to set (e.g. `BKIT_OPENROUTER_API_KEY`; `BKIT_OPENCODE_API_KEY` for `opencode-zen` / `opencode-go`), confirms the pre-seeded base URL, and notes all four providers ship curated per-agent pins (re-pin via `.bkit/prompts.md` § Model Overrides). Verify with `bkit doctor` + `bkit status`. |
| `vale-package-not-synced` | vale on PATH but `.vale/styles/write-good/` absent |
| `devdeps-need-fetch` | bkit added devDeps in this run — `pnpm install` needed |

Phase 1 and Phase 3 findings merged and deduplicated by `id` (Phase 3 wins on conflict — re-detection more accurate post-write). Zero findings → no banner.

**`bkit check` (dry-run)** runs Phase 1 and Phase 3 (read-only) — same advisory set as `bkit install` minus writes (v2.2.3+). Changes no managed file (regenerates `.bkit/advisories.md` artifact) and **exits 1 when any managed-file write would occur** in installed module — Tier-2 JSON deep-containment or markered-block drift, whole-file byte-equal mismatch, **host agent/command mirror content drift** (would-write / orphan delete), or when rendered prompts/workflows / managed docs carry a stale managed-version marker (`bkit-rendered-prompts-stale` / `bkit-managed-docs-stale`, #256). Gate covers **installed** module set ({core, claude, cursor, ci, lint, git-hooks} plus **opencode**, each detected by sentinel files). opencode gated (#255 #8): `.opencode/opencode.json` (provider block + tracker-filtered mcp + permission sandbox) and `gateguard.js` drift fail `check` — render inputs fall back to installed provider (`package.json` `bkit.opencodeProvider`, authoritative for `opencode-zen` / `opencode-go`; all installed providers tracked in `bkit.opencodeProviders: string[]`) and recorded tracker, so clean install across providers checks green (no false drift). Remaining **opt-in** module (cloud) is NOT drift-gated. Updater configs are not bkit files, so `bkit check` does not report them. See `docs/knowledge.jsonl` KN-4 for original design (Phase 3 read-only semantics now enforced via read-only detector paths, not by skipping Phase 3).

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

Two capabilities **opt-in** — never wired by plain host/tooling install. Default install never enables them; post-install advisory banner nudges you to choose, once. Each recorded in `package.json` (`bkit.issueTracker`, `bkit.cloudAgents`) so the nudge knows whether you've decided or deliberately opted out.

<!-- prettier-ignore -->
| Decision | Default | Opt-in command | Advisory when unset |
| --- | --- | --- | --- |
| **Issue tracker** | `none` (workflows run; tracker calls are no-ops) | `bkit install --tracker=github` (browser OAuth, no PAT) or `--tracker=linear` (`BKIT_LINEAR_API_KEY`) | `tracker-setup-none` |
| **Cloud agents** | none (zero cloud footprint) | `bkit install --auto=claude\|cursor\|opencode` — installs `bkit-cloud.yml` (claude + opencode jobs, secret-gated) + cloud env scaffolding (cloud-bootstrap.sh, Cursor Dockerfile/environment.json) | `cloud-router-none` |

**Dependency updater.** Copy one example and own it.

<!-- prettier-ignore -->
| Updater | Copy from |
| --- | --- |
| Renovate rules | `node_modules/@cbartens/bkit/.bkit/templates/.github/renovate.json5` |
| Renovate self-hosted runner | `node_modules/@cbartens/bkit/.bkit/templates/.github/workflows/renovate.yml` |
| Dependabot | `node_modules/@cbartens/bkit/.bkit/templates/.github/dependabot.yml` |

Use one. The examples exclude `.github/workflows/bkit-cloud.yml` (`ignorePaths` / `exclude-paths`). `enabled: false` does not stop Renovate's digest pin. `bkit.depUpdater: "none"` skips the install-time absence advisory. Setup: `docs/deployments.md` § Dependency updaters.

**All templates.** Copy and own, never installed. Catalog and install steps: `.bkit/templates.md`.

**Why opt-in, not part of a default install:**

- **Tracker** wires real credentials and MCP servers into workflows — consumer must choose provider; bkit can't guess.
- **Cloud agents** install phase-routed `bkit-cloud.yml` (auto-dispatches bkit-ship on CI pass, bkit-debug on CI fail; design/plan/build via `workflow_dispatch`) plus cloud env scaffolding (`.claude/hooks/cloud-bootstrap.sh`, `.cursor/Dockerfile`, `.cursor/environment.json`). Workflow carries claude job and opencode job, each runtime-gated on provider secret — inert without key: claude needs `BKIT_ANTHROPIC_API_KEY` (+ Claude GitHub App), opencode needs `OPENCODE_PROVIDER_KEY`. Both need GitHub Actions write permissions, GitHub tracker, and (Cursor half) dashboard trigger — tracker itself opt-in. Env scaffolding inert until Claude/Cursor cloud env wired in dashboard. Autonomous routing by default, wired to unconfigured tracker, is wrong default — install without `--auto` ships zero cloud footprint.

**How to decide:**

1. Run `bkit install --claude --cursor --tooling` (or whichever modules you want). Post-install banner lists `tracker-setup-none`, `dep-updater-absent`, `cloud-router-none` if undecided.
2. Pick tracker: `bkit install --tracker=github` (or `linear`). Persisted to `bkit.issueTracker`; future installs preserve (switching free).
3. Copy one updater example (table above). Land Renovate config on the default branch before installing the App.
4. Enable cloud agents: `bkit install --auto=claude|cursor|opencode`. Persisted to `bkit.cloudAgents`; install prints secrets + permissions + dashboard checklist (`bkit-auto-setup`). Shipped `bkit-cloud.yml` carries claude job (`BKIT_ANTHROPIC_API_KEY`) and opencode job (`OPENCODE_PROVIDER_KEY`), each runtime-gated.
5. **To opt out and silence the nudge**, set the field to `"none"` in `package.json` (`bkit.issueTracker` / `bkit.depUpdater` / `bkit.cloudAgents`). Advisory stays quiet.

Tracker and cloud agents reverse by re-running install with the other flag. Updater files stay until you delete them.

## Doctor

`bkit doctor` is **diagnostic verb** — runs Phase 1 preflight + Phase 3 token-surface detectors, exits 0. Changes no managed file; like `bkit check` regenerates `.bkit/advisories.md` artifact (creates `.bkit/` if absent — repo that never installed bkit gains that one file).

```bash
# Diagnose drift without running install
bkit doctor
```

Use `bkit doctor` to:

- Check whether `BKIT_GH_TOKEN_INSTALL` is set in shell and on GitHub repo.
- Surface `bkit-version-pin-stale` advisory (installed version ahead of `.bkit/version`).
- Preview all advisories `bkit install` would show post-install, without triggering writes.
- Verify environment ready before `bkit install` on new machine.
- Detect macOS GUI-isolation (`bkit cursor` / `bkit opencode`): see `.bkit/providers.md` § macOS GUI-isolation.
  `bkit doctor` always exits 0. Advisories found → printed in same checklist banner format as `bkit install`. None found → prints `[bkit-doctor] No advisories found.`

## Uninstall

`bkit uninstall` surgically removes bkit-managed content while preserving consumer customisations.

```bash
# Uninstall EVERYTHING — all modules, including the cloud add-on if present.
# The inverse of install is asymmetric: a full *install* skips cloud, a full
# *uninstall* removes it. Renovate and Dependabot files are left in place.
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

When `bkit install` detects **blocker-severity** finding in Phase 3 (e.g. `ci.yml` missing `BKIT_GH_TOKEN_INSTALL` env mapping with `.npmrc` referencing token), exits 1 and prints single-line recovery command:

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

**Full reference:** `.bkit/README.md` — what bkit does, prerequisites, upgrade paste + ongoing CLI, triggering workflows, key files. First-time install/auth stays in this root `README.md` (package README only — not copied to consumer repo root).

**Workflow internals:** `.bkit/workflows.md`.

**Subagent metadata:** `.bkit/prompts.md`.
