# Install, upgrade, and operate bkit

{{BKIT_MANAGED_MARKER}}

> [!CAUTION]
> **Purpose:** This file covers first-time install and upgrade, the install lifecycle, uninstall and recovery. It ships in the package at `node_modules/@cbartens/bkit/.bkit/core/.bkit/install.md` and is mirrored into the consumer repo at `.bkit/install.md`. Ongoing ops and triggering workflows are in `.bkit/README.md`.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - This file ships to every project that installs bkit. Describe the current setup only.
> - Leave out internal labels, such as tracker issue numbers, ledger keys and review-finding ids, and leave out project history. Decisions go in `docs/decisions.jsonl`, and incidents go in `docs/knowledge.jsonl`.

> [!IMPORTANT]
> **bkit installs from npmjs.** `@cbartens/bkit` is public on `https://registry.npmjs.org`, so `pnpm add -D @cbartens/bkit` resolves with no registry mapping, PAT, or CI / Vercel env.

## Quick install / upgrade — paste into your AI

There are two paste blocks below: install (first time) and upgrade (already on bkit). Both end the same way: apply advisories, reconcile templates, and verify with `bkit check`.

### Install — first time

No token or registry setup is needed, because `@cbartens/bkit` is public on npmjs. Copy the block below into Claude Code / Cursor / Codex / Antigravity / opencode.

````text
Install the latest `@cbartens/bkit` in this repo and finish setup.
1. `@cbartens/bkit` is public on npmjs — no registry mapping, no PAT, no env. Confirmed.
2. Install and seed hosts in one Bash call (`bkit install` requires named modules — core implicit; pick the hosts this repo uses from `--claude --cursor --codex --antigravity --opencode=<provider>`, provider = `openrouter` | `ollama` | `opencode-zen` | `opencode-go`; if `bkit` not on PATH use `pnpm bkit`):
   ```bash
   pnpm add -D @cbartens/bkit@latest && \
     bkit install --claude --cursor
   ```
   Writes `.agents/`, `.claude/`, `.cursor/` and the `bkit:gate:*` `package.json` scripts, and copies the templates (CI workflow, hooks, tool configs) into `.bkit/templates/` without applying them. `.bkit/templates.md` lists each template plus the tool scripts and devDeps the gates chain.
3. Read `.bkit/advisories.md` end-to-end. For every `[advisory]`/`[blocker]`: apply its **Action** unless truly N/A. If you skip, state advisory id and why. Then § Setup tips: follow each tip's **Agent steps** unless the person declines it.
4. Read `.bkit/templates.md`, then compare each template in `.bkit/templates/` (CI workflows, git hooks, lint and Vale configs, Cursor config, dependency updaters, etc.) with this repo. bkit never applies templates, so adoption is your job: adopt unless adoption would break existing functionality. For any template not adopted, state which and why.
5. Re-run `bkit check` (or `pnpm bkit check`). Fix remaining drift/advisories you can. End with: resolved version, advisories applied, advisories skipped (with reasons), templates adopted/skipped (with reasons).
````

### Upgrade — already installed

Copy this block when the repo already has `@cbartens/bkit`. Prefer `bkit upgrade --latest`, which bumps the package and resyncs the managed files. Do not run only `pnpm add`.

````text
Upgrade `@cbartens/bkit` to the latest version in this repo and finish the resync.
1. Bump and resync in one step (no token — npmjs is public). If `bkit` is not on PATH, use `pnpm bkit`:
   ```bash
   bkit upgrade --latest
   ```
   Do **not** only `pnpm add @cbartens/bkit@latest` — that refreshes the package without resyncing managed files.
2. Read `.bkit/advisories.md` end-to-end. For every `[advisory]`/`[blocker]`: apply its **Action** unless truly N/A. If you skip, state advisory id and why. Then § Setup tips: follow each tip's **Agent steps** unless the person declines it.
3. Read the template changes `bkit upgrade` printed (or `git diff .bkit/templates`), then `.bkit/templates.md`. bkit never applies templates, so adoption is your job: adopt each change unless it would break existing functionality. For any change not adopted, state which and why.
4. Re-run `bkit check` (or `pnpm bkit check`). Fix remaining drift/advisories you can. End with: resolved version, advisories applied, advisories skipped (with reasons), templates adopted/skipped (with reasons).
````

## Install

bkit is published publicly on npmjs (`https://registry.npmjs.org`). Add it to a consumer repo:

```bash
pnpm add -D @cbartens/bkit
```

### Adding a new consumer — checklist

Run these in order on a brand-new consumer repo.

<!-- prettier-ignore -->
| # | Step | Detail |
| --- | --- | --- |
| 1 | `pnpm add -D @cbartens/bkit` — no token, no registry mapping | this section |
| 2 | Run `bkit install --claude --cursor` to seed both hosts (writes `.bkit/.env.example`; `.envrc` is a template in `.bkit/templates/`) | this section |
| 3 | Set up direnv + `.bkit/.env` for `BKIT_GH_TOKEN` (GitHub MCP), `BKIT_LINEAR_API_KEY` or `BKIT_JIRA_API_KEY` — no registry token | [§ Local env setup](#local-env-setup) |
| 4 | Push to a feature branch and verify CI runs green | — |

No CI step, secret, `.npmrc` mapping or Vercel env is needed, because CI reaches npmjs anonymously.

### Then in the consumer repo

`bkit install` requires you to name at least one module, and a bare `bkit install` errors. Core (the stack-agnostic foundation) is always implicit. Re-run it, or run `bkit upgrade`, after package updates. Use `bkit check` as the CI drift gate.

> **Shell alias (add once to `~/.zshrc` or `~/.bashrc`, then `source ~/.zshrc`)**
>
> ```bash
> alias bkit='pnpm bkit'
> ```
>
> Type `bkit <verb>` from anywhere in the repo. Without the alias, prefix with `pnpm`: `pnpm bkit install --claude`. `bkit doctor` emits an advisory if it does not detect the alias.

```bash
# Name the host(s) + stack you want — core is implicit. Hosts compose.
bkit install --claude                    # .claude/** + CLAUDE.md + core
bkit install --cursor                    # .cursor/** + core
bkit install --codex                     # Codex CLI host + core
bkit install --antigravity               # Google Antigravity host + core
bkit install --opencode=opencode-go      # additive opencode host (opencode-native gateway) + core
# opencode provider: openrouter | ollama | opencode-zen | opencode-go

# A bare install errors — name at least one module, or a tracker:
bkit install                             # ✗ error: requires >=1 module flag
bkit install --tracker=github            # tracker alone: re-renders every installed host

# Ongoing sync — re-render everything installed at the CURRENT version (offline)
bkit upgrade

# Move to a newer bkit in ONE step — bumps @cbartens/bkit, then re-renders + re-pins
bkit upgrade --latest                    # newest published; or --to=<version> to pin one

# Drift detection — drift-checks everything installed; exits non-zero on drift (CI gate)
bkit check
```

**Module flags** (composable; install and uninstall are symmetric): `--claude` `--cursor` `--codex` `--antigravity` `--opencode=<provider>`. Any other module flag is an unknown-flag error.

- The CI workflow, the Vale config, the tool configs, the git hooks, the slop-scan type-suppression plugin (`scripts/slop/bkit-slop-type-suppression.mjs`), and the tool `package.json` scripts and devDeps are templates you copy from `.bkit/templates/` (`.bkit/templates.md`).
- Core, implicit on every install, seeds the `bkit:gate:*` / `bkit:deps:*` scripts every workflow runs. It adds them only if missing, and never touches a name that is already present. Point their values at your stack (see `.bkit/README.md` § Required tools).

**Opt-in flags:** `--tracker=github|linear|jira`, `--auto=claude|cursor|opencode` (cloud agents), `--opencode=<provider>` (additive opencode execution host: `openrouter`, `ollama`, `opencode-zen`, `opencode-go`). For dependency updaters, copy an example and own it. See [§ Optional post-install decisions](#optional-post-install-decisions).

### Payload view links — `.bkit/core` + `.bkit/shared`

Install and upgrade create two relative symlinks into the installed package, so the payload sources (workflows, prompts, hooks) can be browsed in the repo: `.bkit/core` → `../node_modules/@cbartens/bkit/.bkit/core`, and the same shape for `shared`. They are views, not copies, so they always show the installed version with zero drift. Rules:

- Both paths sit in the `.gitignore` managed block. They dangle on a fresh clone or in CI (no `node_modules`), and `bkit install` / `upgrade` recreates them. A missing or mis-pointed link is never `bkit check` drift, because links join no WriteSet.
- The `bkit` binary reads its payload from the package regardless, so the links are browse-only. Editors resolve them to the `node_modules/…` paths.
- A real directory at either path is never clobbered (advisory `payload-link-real-dir`). Remove it yourself and re-run install to get the link. A platform that refuses symlinks (Windows without Developer Mode) falls back to a junction, then to advisory `payload-link-failed`, and never fails.
- `bkit uninstall` removes the links. It removes symlinks only, and consumer content stays.

> **Moving bkit versions: use `bkit upgrade --latest` (or `--to=<version>`).** It bumps `@cbartens/bkit` and resyncs the `.agents/` payload + `.bkit/version` pin in one atomic step, so the two can never drift apart. A bare `pnpm add @cbartens/bkit` (or a Renovate / Dependabot bump) only refreshes `package.json` + the lockfile and does not resync. Skipping the resync reds CI on the `bkit check` drift gate. If you bump the package separately, run `bkit upgrade` afterward and commit the resync alongside the version bump in the same PR. A target equal to the installed version re-renders in place. The exception is when `package.json` declares `@cbartens/bkit` by a non-registry spec (`file:` tarball, `link:`, `workspace:`, `npm:` alias, git, URL, path): then it still runs `pnpm add` to swap in the published package.

### Local env setup

There are two flows. Pick one. Both put `BKIT_GH_TOKEN` in the shell for the GitHub MCP server. Linear repos also need `BKIT_LINEAR_API_KEY`, and Jira repos need `BKIT_JIRA_API_KEY` (`.bkit/trackers.md` § jira — setup and notes). Use `gh auth login` for the CLI.

#### Flow A — Shell export (quickest, no extra deps)

```bash
# Add to ~/.zshrc (or ~/.bashrc)
export BKIT_GH_TOKEN=<PAT — fine-grained (one owner) or classic (multiple owners)>   # GitHub MCP
export BKIT_LINEAR_API_KEY=<Linear personal API key>        # Linear MCP + preflight
export BKIT_JIRA_API_KEY=<Atlassian MCP V2 scoped token>   # Jira MCP

# Reload
source ~/.zshrc                                        # or: source ~/.bashrc
```

Pros: one step, no install. Cons: the tokens are in every shell on the machine, with no per-repo scoping.

#### Flow B — direnv + `.bkit/.env` (recommended for daily use)

`bkit install` writes `.bkit/.env.example` (placeholders + permission notes). bkit owns that file and overwrites edits, so real values go in `.bkit/.env`. `.envrc` (`dotenv_if_exists .bkit/.env`) is a template: copy it from `.bkit/templates/.envrc`. direnv loads `.bkit/.env` on `cd` and unloads it when you leave, so the tokens are scoped to the repo.

```bash
# 1. One-time per machine — install direnv
brew install direnv                                                # macOS
# Linux / other: https://direnv.net/docs/installation.html

# 2. One-time per machine — add the shell hook, then reload
echo 'eval "$(direnv hook zsh)"' >> ~/.zshrc && source ~/.zshrc
# bash: echo 'eval "$(direnv hook bash)"' >> ~/.bashrc && source ~/.bashrc

# 3. One-time per consumer repo (after `bkit install`)
cp .bkit/templates/.envrc .envrc                                   # unless you already have one
cp .bkit/.env.example .bkit/.env
# Edit .bkit/.env: set BKIT_GH_TOKEN, BKIT_LINEAR_API_KEY or BKIT_JIRA_API_KEY
direnv allow                                                       # trust the .envrc

# 4. Verify
echo "len=${#BKIT_GH_TOKEN}"                                            # non-zero → MCP token loaded
gh auth status                                                       # gh CLI uses keyring, not BKIT_GH_TOKEN
```

After step 4, restart any open Claude Code / Cursor sessions in this repo, so the new env reaches the MCP servers.

`.bkit/.env` is gitignored. NEVER commit it. For cloud sessions (Claude Code on the web, Cursor Background Agents), set the same names in each host's online dashboard (see `.bkit/cloud.md` § Tokens by session type). `bkit install` / `bkit check` advisories detect a missing direnv, blank required keys and an un-allowed `.envrc`. Follow whichever fires.

## Cloud agent environments (Claude Code on the web + Cursor Background Agents)

bkit ships repo-side scaffolding for both cloud agents:

- The opt-in `bkit install --auto=claude` writes no file.
- The per-session install hook (`.claude/hooks/bkit-cloud-bootstrap.sh`), the phase-routed `.github/workflows/bkit-cloud.yml` and the Cursor cloud image files (`.cursor/Dockerfile`, `.cursor/environment.json`) are templates in `.bkit/templates/` that you copy and own.
- `.cursor/hooks.json` (the Linear preflight wiring) ships with `--cursor`, not `--auto`.
- An install without `--auto` ships zero cloud footprint.

You configure the online-dashboard half (the Claude env in `claude.ai/code`, the Cursor env vars in `Cursor → Settings → Background Agents`) once per machine / account.

For post-CI auto-routing (ship-vs-debug after CI), bkit ships a single `.github/workflows/bkit-cloud.yml` template with two runtime-gated dispatch jobs, plus a `/bkit-auto` slash command that both clouds invoke from a single source:

- The **claude** job (`claude-code-action`) runs when the `ANTHROPIC_API_KEY` repo secret is set, or keyless through the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables.
- The **opencode** job (`opencode run` CLI) runs when `OPENCODE_PROVIDER_KEY` is set.
- Cursor wires the slash command through a dashboard trigger, with no GHA on the Cursor side.

`bkit install --auto=opencode` requires `tracker=github`.

`.bkit/cloud.md` holds the full recipe, the paste-in setup script, the env-var inventory, the Cursor dashboard config and the consumer customisation patterns. The host-delta matrix is in `.bkit/providers.md` § Runtime environment.

## JSON ownership model — deep-containment

`.claude/settings.json` and `.cursor/hooks.json` are managed through **deep-containment**: bkit declares a scope (the full template JSON tree) that must be present as a subset of the consumer's document. Consumer-added keys outside the template tree survive every `bkit install` byte-identically, with no special key or wrapper required.

```json
// .claude/settings.json
{
  "hooks": {
    "SessionStart": [
      { "hooks": [{ "type": "command", "command": "bash .claude/hooks/bkit-preflight.sh" }] }
    ],
    "Stop": [{ "hooks": [{ "type": "command", "command": "postflight.sh" }] }]
  },
  "failClosed": true
}
```

In this example, `hooks.SessionStart` is bkit-declared scope (from the template). `hooks.Stop` and `failClosed` are consumer-added, and bkit never touches them.

**Rules:**

- Consumer keys outside the template tree survive every `bkit install` byte-identically.
- `bkit install` uses `deepContains(template, consumer)`, which checks that every template leaf is present. On drift, it deep-merges with the template winning, and consumer-only siblings are preserved.
- `bkit check` surfaces the `tier2-json-drift` advisory when `deepContains` fails, and exits 1 (CI drift gate). It writes nothing. The consumer reviews and re-runs `bkit install` to reconverge.
- `.cursor/hooks.json` uses Cursor v1 keyed-object schema: `{"version": 1, "hooks": {"sessionStart": [...], "sessionStop": [...]}}`.

## Install lifecycle

`bkit install` runs three phases in sequence:

**Phase 1 — Preflight (read-only, before any writes)**

bkit checks preconditions and known advisory patterns before touching any file. When a blocker fires, install exits 1 immediately with a formatted `[blocker]` line and zero writes. Advisories are collected for Phase 3.

<!-- prettier-ignore -->
| Severity | When |
| --- | --- |
| Blocker | `package.json` absent or unparseable JSON |
| Blocker | core install requested but `.git/` absent (not a git repository) |
| Advisory | On-disk `.bkit/version` major > installing major (downgrade) |
| Advisory | `node_modules/@cbartens/bkit` version > `.bkit/version` (stale pin) |

**Phase 2 — Install**

Module dispatch writes managed files.

**Phase 3 — Post-install (re-detect + unified output)**

After the writes, bkit re-runs the credential and environment checks, because some are only accurate after install (for example the `bkit:gate:*` scripts core just seeded into `package.json`). The table also lists the module advisories that render in the same checklist.

<!-- prettier-ignore -->
| `id` | When |
| --- | --- |
| `bkit-managed-duplicate` | A managed markdown file holds an older unmarked copy of its block outside `bkit:start`/`bkit:end`: the block's `# ` title plus 10+ of its long lines verbatim, fenced code ignored. Install never updates that copy. Names each file and title line; delete the copy. |
| `gh-mcp-token-unset-shell` / `gh-mcp-token-empty-shell` | `BKIT_GH_TOKEN` (GitHub MCP auth) unset / empty in shell while a `github` MCP server is configured — the whole tracker/PR/board MCP surface fails to connect. Suppressed in CI. |
| `tracker-setup-none` / `-github` / `-linear` / `-jira` | Optional post-install decision — which issue tracker is wired (`bkit.tracker.default`). `none` nudges `bkit install --tracker=…`. See [§ Optional post-install decisions](#optional-post-install-decisions). |
| `github-project-board-sync-unconfigured` | GitHub tracker active but Projects v2 board sync is half-configured (`bkit.tracker.github.project` empty, absent or not a board URL, and/or `.mcp.json` lacks the `projects` toolset) — sync silently no-ops. Silence with `bkit.tracker.github.project: false`. |
| `github-project-token-scope` | A board is configured but `BKIT_GH_TOKEN` cannot reach it: a classic token lacks the `project` scope, or a fine-grained token's board query returns nothing. Board moves fall back to the MCP. Checked live via `gh`; skipped on cloud / CI. |
| `dep-updater-absent` | No Renovate or Dependabot config. Copy one example and own it. `bkit.dependencies.updater: "none"` silences this. See [§ Optional post-install decisions](#optional-post-install-decisions). |
| `dep-updater-both` | Both updater configs are present. Keep one. |
| `dep-updater-unset` | Blocker. One updater's config is present but `bkit.dependencies.updater` does not name it (empty or unrecognised). Set it, or run `bkit upgrade`, which fills an empty value. |
| `dep-updater-mismatch` | Blocker. `bkit.dependencies.updater` names one updater (or `none`) while the other's config is present, or names an updater with no config. Fix the value or the config. |
| `cloud-router-none` / `cloud-router` | Optional post-install decision — post-CI auto-routing (`bkit.cloud.agent`). `none` (undecided) nudges `bkit install --auto=<variant>`, except under the jira tracker (local runs only); `cloud-router` is informational once `bkit-cloud.yml` is present. See [§ Optional post-install decisions](#optional-post-install-decisions). |
| `actions-write-permissions-missing` | `bkit-cloud.yml` present but repo Actions permissions are read-only / PR creation disabled — `actions/checkout` + `gh pr create` 403. Repo-level check; org policy can override. |
| `opencode-setup` | opencode host installed (`--opencode=<provider>`) — names the provider key to set (e.g. `BKIT_OPENROUTER_API_KEY`; `BKIT_OPENCODE_API_KEY` for `opencode-zen` / `opencode-go`), confirms the pre-seeded base URL, and notes all four providers ship curated per-agent pins (re-pin via `.bkit/prompts.md` § Model Overrides). Verify with `bkit doctor` + `bkit status`. |
| `vale-package-not-synced` | vale on PATH but `.vale/styles/write-good/` absent |
| `gate-missing-called-scripts` | A `bkit:gate:*` script still at bkit's default chains a script `package.json` does not declare (e.g. `typecheck`, `format:check`, `test`). Add it (`.bkit/templates.md` lists the tool scripts and devDeps) or rewrite the gate. |
| `gate-commit-repeats-push` | `bkit:gate:format` (pre-commit) runs a script the push gate runs again (e.g. `lint:prose`), so it runs on every commit and again on the push. Drop it from `bkit:gate:format`. |
| `gate-noop` | A `bkit:gate:*` script is empty or cannot fail (`true`, `:`, `exit 0`, `echo …`), so every agent run and push passes it. Warn-only, at install, `bkit check` and `bkit upgrade`, on every branch. Point it at real checks, or delete it and run `bkit upgrade` to restore bkit's default. |
| `gate-tier-not-wired` | `package.json` declares a deeper test tier (`test:integration`, `test:e2e`, `test:live`) that no `bkit:gate:*` script runs; the advisory prints the gate line to add. |
| `test-file-script-missing` | `package.json` does not declare `bkit:test:file`, so `/bkit-build` reports test-first as not enforced. The advisory prints the script contract and a Vitest line. |
| `lint-file-script-missing` | `package.json` declares `bkit:test:file` but not `bkit:lint:file`, so `bkit tests red` records a task's red before the linter sees the test, and a lint fix after it pauses the build for an owner exception. The advisory prints the script contract and ESLint / Ruff lines. |

Every `gate-*` advisory ends with what a gate may run, which bkit cannot check: no test that needs a deployed boundary or remote service outside the two `…-e2e` gates (`.bkit/workflows.md` § Local gate scripts).

Phase 1 and Phase 3 findings are merged and deduplicated by `id`. Phase 3 wins on conflict, because re-detection is more accurate after the writes. Zero findings → no banner.

**`bkit check` (dry-run)** runs Phase 1 and Phase 3 (read-only): the same advisory set as `bkit install`, minus the writes. It changes no managed file (it regenerates the `.bkit/advisories.md` artifact), and it exits 1 when any managed-file write would occur in an installed module:

- Tier-2 JSON deep-containment or markered-block drift.
- A whole-file byte-equal mismatch.
- Host agent / command mirror content drift (would-write / orphan delete).
- Any file bkit writes (rendered agents / commands / skills, managed blocks, owned whole files) carrying a stale managed-version marker (`bkit-managed-stale`).
- A missing `bkit:gate:*` name, which counts as a write.

The gate covers the installed module set ({core, claude, cursor, codex, antigravity} plus opencode). Each module is detected by sentinel files: for a host, its `agents/` dir, and for antigravity, any of `.agents/plugins/bkit/{plugin.json,hooks.json,agents,skills,hooks}`, so a deleted plugin manifest is reported as a missing file, not an absent host. `bkit status` uses the same detection.

- **antigravity gated:** `.agents/plugins/bkit/**` (plugin manifest, hooks, agents, skills) and the root `GEMINI.md`.
- **opencode gated:** Drift in `.opencode/opencode.json` (the provider block + the recorded tracker's `mcp` entry + the permission sandbox) and in the `bkit-gateguard.js` / `bkit-readguard.js` / `bkit-rules.js` plugins fails `check`.
  - Another tracker's `mcp` entry that the consumer edited, kept by a tracker switch, is not drift. `mcp-extra-server-linear--opencode-opencode-json` advises removing it.
  - Render inputs fall back to the installed provider (`package.json` `bkit.providers.opencode.default`, authoritative for `opencode-zen` / `opencode-go`; all installed providers are tracked in `bkit.providers.opencode.installed: string[]`) and the recorded tracker. So a clean install across providers checks green, with no false drift.
- The remaining opt-in module (cloud) is not drift-gated.

A missing bkit-owned hook file also fails `check`, with one line per file naming it and the `bkit install` flag that restores it. This covers the hook files of every installed host (`.claude/hooks/*`, `.cursor/hooks/*`, `.codex/hooks/*`, `.agents/plugins/bkit/hooks/*`, `.opencode/plugin/bkit-gateguard.js`, `.opencode/plugin/bkit-readguard.js`, `.opencode/plugin/bkit-rules.js`). The hook commands skip a missing file (`test -f … || true`), so without this check the guard would be off with no signal.

Updater configs are not bkit files, so `bkit check` does not report them. Phase 3 stays read-only through read-only detector paths, not by being skipped.

**`bkit upgrade`** (not `--dry-run`) ends with the same read-only pass as `bkit check`: it prints the checklist and rewrites `.bkit/advisories.md` (`Mode: upgrade`). It only reports the drift and blockers it finds, and upgrade's exit code is unchanged.

**`PreflightFinding` shape** — a stable contract for downstream tooling:

```typescript
interface PreflightFinding {
  id: string; // stable kebab-case identifier
  severity: "blocker" | "advisory";
  detect: string; // one-line description of the detected condition
  action: string; // AI-pasteable fix instruction
}
```

Findings render as `--- i/N [severity] id ---` with `Detect:` and `Action:` lines. The console banner and the `.bkit/advisories.md` artifact render the same text, so copy either into a coding assistant to apply the fixes in sequence. After the findings, both list every firing setup tip (§ Setup tips).

**Dismissing an advisory (per package).** A detector can be right in general and still fire where the condition is deliberately not applicable, such as a rule-linter whose test titles mention `@live`, or an integration lane mocked by design. Opt the owning package out in its `package.json`:

```json
{
  "bkit": {
    "advisories": { "ignore": ["tagged-tests-no-ci-home"] }
  }
}
```

<!-- prettier-ignore -->
| Rule | Behaviour |
| --- | --- |
| Scope | Per package, read from the owning package's `package.json` — the package holding the test file for `tagged-tests-no-ci-home`, the repo root for `test-integration-env-not-asserted` (the only manifest it reads). A sibling package with a real finding stays flagged. |
| Severity | Advisory only. A `blocker` is never suppressible, whatever the manifest says. |
| Visibility | The console banner and `.bkit/advisories.md` carry one suppressed-advisory line per dismissal (`N advisory` / `N advisories`), so a stale opt-out cannot hide a finding silently. |
| Coverage | Per package: `tagged-tests-no-ci-home` and `test-integration-env-not-asserted`. Repo root: every setup tip id and every advisory a tip reuses (§ Setup tips). No other advisory is suppressible; an id matching no advisory or tip is ignored. |

## Optional post-install decisions

Two capabilities are opt-in, and a plain host / tooling install never wires them. The default install never enables them, and the post-install advisory banner nudges you to choose, once. Each choice is recorded in `package.json` (`bkit.tracker.default`, `bkit.cloud.agent`), so the nudge knows whether you've decided or deliberately opted out.

<!-- prettier-ignore -->
| Decision | Default | Opt-in command | Advisory when unset |
| --- | --- | --- | --- |
| **Issue tracker** | `none` (workflows run; tracker calls are no-ops) | `bkit install --tracker=github` (`BKIT_GH_TOKEN`) `--tracker=linear` (`BKIT_LINEAR_API_KEY`) or `--tracker=jira` (`BKIT_JIRA_API_KEY` + `bkit.tracker.jira.site` / `bkit.tracker.jira.project`) | `tracker-setup-none` |
| **Cloud agents** | none (zero cloud footprint) | `bkit install --auto=claude\|cursor\|opencode` — records the choice and points at the copy-and-own templates: `.claude/hooks/bkit-cloud-bootstrap.sh` (claude), the `bkit-cloud.yml` (claude + opencode jobs, secret-gated) and the Cursor Dockerfile/environment.json | `cloud-router-none` |

**Dependency updater.** Copy one example and own it.

<!-- prettier-ignore -->
| Updater | Copy from |
| --- | --- |
| Renovate rules | `.bkit/templates/.github/renovate.json5` |
| Renovate self-hosted runner | `.bkit/templates/.github/workflows/bkit-renovate.yml` |
| Dependabot | `.bkit/templates/.github/dependabot.yml` |

Use one, and record it in `bkit.dependencies.updater` (`"renovate"` / `"dependabot"`). Install and upgrade fill an empty value from the config present. `"none"` skips the install-time absence advisory. `bkit check` emits `dep-updater-absent` and `dep-updater-both`, and blocks on `dep-updater-unset` / `dep-updater-mismatch` when the value and the configs disagree. Setup: `docs/deployments.md` § Dependency updaters.

**Security scan.** An updater only offers fixes once a fixed release exists. To fail CI on known-vulnerable packages, risky config or committed secrets, copy `.bkit/templates/.github/workflows/bkit-trivy.yml` and own it. It also runs daily, and you accept findings in `.trivyignore.yaml`. There is no advisory, and `bkit tips` suggests it. Setup: `.bkit/templates.md` § Trivy.

**Test lint.** In JS / TS repos, to fail `lint` on a test that cannot fail (no assertion, a branch inside a test, an unawaited promise):

1. Copy and own `.bkit/templates/.oxlintrc.json`.
2. Add `oxlint` + `oxlint-tsgolint`.
3. Set `lint` to `oxlint -c .oxlintrc.json --type-aware --deny-warnings`.

There is no advisory, and `bkit tips` suggests it. Setup: `.bkit/templates.md` § Oxlint.

**All templates.** You copy and own them, and they are never installed. Catalog and install steps: `.bkit/templates.md`.

**Why opt-in, not part of a default install:**

- **Tracker** wires real credentials and MCP servers into workflows, so the consumer must choose the provider. bkit can't guess.
- **Cloud agents** run through the phase-routed `bkit-cloud.yml` template plus the cloud env scaffolding (`.claude/hooks/bkit-cloud-bootstrap.sh`, and the `.cursor/Dockerfile` + `.cursor/environment.json` templates). The template auto-dispatches bkit-ship on CI pass and bkit-debug on CI fail, runs plan / build through `workflow_dispatch`, and leaves design local-only.
  - The workflow carries a claude job and an opencode job, each runtime-gated on its provider secret, so each is inert without its key. claude needs the `ANTHROPIC_API_KEY` repo secret or the federation repo variables (+ the Claude GitHub App). opencode needs `OPENCODE_PROVIDER_KEY`.
  - Both need GitHub Actions write permissions, the GitHub tracker, and (for the Cursor half) a dashboard trigger, and the tracker itself is opt-in.
  - The env scaffolding is inert until the Claude / Cursor cloud env is wired in the dashboard.
  - Autonomous routing by default, wired to an unconfigured tracker, is the wrong default. So an install without `--auto` ships zero cloud footprint.

**How to decide:**

1. Run `bkit install --claude --cursor` (or whichever modules you want). If you have not decided yet, the post-install banner lists `tracker-setup-none`, `dep-updater-absent` and `cloud-router-none`.
2. Pick a tracker: `bkit install --tracker=github` (or `linear` / `jira`). It needs no host flag, and it re-renders every installed host. The choice is persisted to `bkit.tracker.default`, and future installs preserve it (switching is free).
3. Copy one updater example (table above). Land the Renovate config on the default branch before installing the App. The next `bkit install` / `bkit upgrade` sets `bkit.dependencies.updater` to it.
4. Enable cloud agents: `bkit install --auto=claude|cursor|opencode`. The choice is persisted to `bkit.cloud.agent`, and install prints the secrets + permissions + dashboard checklist (`bkit-auto-setup`). The shipped `bkit-cloud.yml` carries a claude job (`ANTHROPIC_API_KEY` repo secret or federation repo variables, see `.bkit/cloud.md` § Claude — workload identity federation) and an opencode job (`OPENCODE_PROVIDER_KEY`), each runtime-gated.
5. **To opt out and silence the nudge**, set the field to `"none"` in `package.json` (`bkit.tracker.default` / `bkit.dependencies.updater` / `bkit.cloud.agent`). The advisory then stays quiet. The `""` that install seeds means undecided, and keeps the nudge.

To reverse the tracker or cloud-agent choice, re-run install with the other flag. Updater files stay until you delete them.

**GitHub notifications.** bkit's agents comment as you, so every workflow those comments trigger notifies you, even ones that skip. To see only failures: GitHub → Settings → Notifications → System → Actions → "Only notify for failed workflows".

## Setup tips

`bkit tips` prints what the repo has not set up yet — tracker, tokens, templates, cost settings — most useful first, each with a plain-English line and a sentence to ask your agent. Each workflow runs it with its own name at its close and appends what it prints under `## bkit Tips`; `@bkit-audit-generate` does the same with `audit`, and every `@bkit-utility-update-*` agent with `utility`.

```bash
bkit tips                    # top three
bkit tips --workflow=debug   # the one tip that matters most in /bkit-debug
bkit tips --workflow=audit   # the one tip that matters most at an audit's close
bkit tips --all              # every firing tip
```

<!-- prettier-ignore -->
| Rule | Behaviour |
| --- | --- |
| Order | One fixed priority list. `--workflow=<name>` moves the tips that matter in that workflow to the front: tracker, GitHub token, `.bkit/.env` and direnv matter in every workflow, so they lead until fixed; then e.g. context-fetch for debug, Husky / slop-scan / Oxlint for build, CI workflow / cloud for ship, Serena / CI workflow / graphify / updater / Trivy for `audit`, Serena for `utility`. |
| Detection | Local only — files, settings, environment; no network. A tip clears once its local half exists; dashboard steps live in the tip text. |
| Reuse | A tip for a gap an advisory already detects calls that advisory's detector — tip and advisory never disagree. |
| Artifact | `bkit install` / `check` / `upgrade` / `doctor` list every firing tip, with its id, in `.bkit/advisories.md` § Setup tips and the console banner: line, why, caution, ask-your-agent sentence, agent steps. |
| Star line | `Do you like bkit? Then give it a star at [https://github.com/cbartens/bkit](https://github.com/cbartens/bkit)!` (markdown link) closes bare `bkit tips`, after the tips and outside the cap; in a phase workflow it follows the tip with `Do you like bkit?` in bold, and the silence line follows it. Never under `--workflow=audit` / `utility` (those agents often run back to back), in `.bkit/advisories.md` or the console banner. |
| Silence | Root `package.json` `bkit.advisories.ignore`: a tip id (a workflow's `## bkit Tips` ends with `` **Want to silence these tips?** Ask your agent to "add `<id>` and `bkit-star` to `bkit.advisories.ignore` in package.json". ``, naming what it showed), or an advisory id the tip reuses, silences the tip and those advisories together; both show in the suppressed block. `bkit-star` (or the older `star`) silences the star line. |
| Exit | Always 0. Prints nothing when no tip fires and no star line shows. |

## Doctor

`bkit doctor` is the **diagnostic verb**: it runs the Phase 1 preflight + Phase 3 credential detectors, and exits 0. It changes no managed file. Like `bkit check`, it regenerates the `.bkit/advisories.md` artifact, and it creates `.bkit/` if absent, so a repo that never installed bkit gains that one file.

```bash
# Diagnose drift without running install
bkit doctor
```

Use `bkit doctor` to:

- Check that `BKIT_GH_TOKEN` is present in the shell (GitHub MCP auth), and check the cloud-router claude credential (`ANTHROPIC_API_KEY` repo secret or federation repo variables). It also flags a key shadowing federation, and an adopted `bkit-cloud.yml` too old for federation.
- Surface the `bkit-version-pin-stale` advisory (installed version ahead of `.bkit/version`).
- Preview all the advisories `bkit install` would show after install, without triggering writes.
- Verify the environment is ready before `bkit install` on a new machine.
- Detect macOS GUI-isolation (`bkit cursor` / `bkit opencode`): see `.bkit/providers.md` § macOS GUI-isolation.

`bkit doctor` always exits 0. When it finds advisories, it prints them in the same checklist banner format as `bkit install`. When it finds none, it prints `[bkit-doctor] No advisories found.`

## Uninstall

`bkit uninstall` surgically removes bkit-managed content while preserving consumer customisations. The `.bkit/core` / `.bkit/shared` payload view links go with a full / core uninstall. It removes symlinks only, because a real directory at either path is consumer content and stays.

```bash
# Uninstall EVERYTHING — all modules, including the cloud add-on if present.
# The inverse of install is asymmetric: a full *install* skips cloud, a full
# *uninstall* removes it. Your copies of templates (bkit-ci.yml, hooks, tool configs,
# updater configs) and every package.json script and devDep (the bkit:gate:* names
# included) are left in place; only the `bkit` install-state block is removed.
bkit uninstall

# Preview what would be removed (no writes)
bkit uninstall --dry-run

# Uninstall specific modules (targeted — leaves core + the other modules intact)
bkit uninstall --claude       # removes the claude host only
bkit uninstall --auto         # clears the bkit.cloud.agent key (cloud files are copy-and-own)

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
| `markered-text` | bkit block stripped; consumer content above / below preserved. File deleted if only whitespace remains — or, for a bkit-seeded markdown file (`AGENTS.md`/`CLAUDE.md`), if only its `# Title` heading husk remains. |
| `byte-equal-text` | Deleted only if current hash matches the hash `.bkit/version` recorded when bkit last wrote it (`canonicalHashes`). Consumer modifications → preserved. `canonicalHashes` is internal state `bkit check` does not verify: a hand-edited or corrupted entry makes uninstall keep that file as consumer-modified (`--force` deletes it anyway) and upgrade's whole-file diff report a conflict instead of updating it. Rendered `.bkit/*.md` skip that diff: upgrade always re-renders them, and `bkit check` flags a hand edit. |
| `json` | bkit's keys stripped; consumer keys preserved. `.mcp.json` / `.cursor/mcp.json`: only bkit's tracker entry is removed, and only while it still equals the template. `.opencode/opencode.json`: every `mcp` tracker entry (`github`, `linear`, `jira`) and every `provider` block of a supported provider is removed while it still equals what install renders — all the earlier installs left, not just the active one; an edited entry is kept whole. File deleted when nothing is left. |

### Idempotency

Running `bkit uninstall` twice is safe, because later runs skip absent files and produce zero writes.

### What a full uninstall preserves

A bare uninstall removes bkit-managed files and strips bkit-managed blocks, but it is not a guaranteed zero-footprint wipe. In `docs/`, bkit's block (managed marker included) is stripped from every installed `docs/*.md`, a file holding nothing else is deleted, and the owned `docs/templates/bkit-*.md` are deleted. It deliberately leaves:

- everything outside `bkit:start` / `bkit:end` in `docs/*.md`, `.agents/context.md`, `.agents/skills.md` and the other managed-block files;
- your own files in `docs/` and `docs/templates/`;
- every file you copied from `.bkit/templates/`;
- any owned whole-file the consumer modified (hash mismatch → preserved);
- generated artefacts that are not manifest-tracked (`.bkit/advisories.md`, `.bkit/friction.jsonl`, the newest-release cache `.git/bkit-latest-version.json`).

Use `--nuke` to force-remove every manifest-listed bkit file regardless of consumer modifications. The generated artefacts are still yours to delete by hand.

## Phase 3 exit-1 and recovery

When `bkit install` detects a blocker-severity finding in Phase 3 (for example `owned-hook-missing`: a bkit-owned hook file is gone, so the guard or setup step it holds does not run), it exits 1 and prints a single-line recovery command:

```
[bkit-install] 1 Phase 3 blocker(s) detected. Recovery:
  bkit uninstall <flags> && <fix the issue> && bkit install <flags>
```

Advisories (non-blockers) are informational only, and do not trigger exit-1.

### --auto-revert

Add `--auto-revert` to `bkit install` to automatically run `bkit uninstall` in-process when a Phase 3 blocker fires:

```bash
bkit install --auto-revert
```

This is useful in CI scripts to guarantee a clean state on failure.

## Install staging directory

`bkit install` renders derived files (for example `.opencode/opencode.json`) into the `.bkit-staging/` scratch directory before merging them into the consumer destinations. The scratch directory is cleaned up after every run, on success and failure alike, and never persists in committed consumer repo state.

**Not a cross-module transaction.** Modules write directly to their destinations, so `bkit install` is not atomic across modules. A failure partway (for example a hand-broken `.claude/settings.json` that makes the JSON merge throw) leaves the earlier modules' files written and `.bkit/version` unpinned. The error is surfaced, not swallowed.

**Recovery is re-run.** `bkit install` is idempotent: fix the offending file and re-run to complete. `bkit uninstall` removes whatever was written.
