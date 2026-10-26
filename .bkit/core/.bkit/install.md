# Install, upgrade, and operate bkit

{{BKIT_MANAGED_MARKER}}

First-time install and upgrade, install lifecycle, uninstall and recovery. Ships in the package at `node_modules/@cbartens/bkit/.bkit/core/.bkit/install.md` and is mirrored into the consumer repo at `.bkit/install.md`. Ongoing ops and triggering workflows: `.bkit/README.md`.

> [!IMPORTANT]
> **bkit installs from npmjs.** `@cbartens/bkit` is public on `https://registry.npmjs.org`; `pnpm add -D @cbartens/bkit` resolves with no registry mapping, PAT, or CI/Vercel env.

## Quick install / upgrade — paste into your AI

Two paste blocks below — **install** (first time) and **upgrade** (already on bkit). Both end the same way: apply advisories, reconcile templates, verify with `bkit check`.

### Install — first time

No token or registry setup is needed — `@cbartens/bkit` is public on npmjs. Copy the block below into Claude Code / Cursor / Codex / Antigravity / opencode.

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

Same paste block ships in `.bkit/README.md` (mirrored into consumer repos on install — keep both in sync when editing). Copy when the repo already has `@cbartens/bkit`. Prefer `bkit upgrade --latest` (bumps the package **and** resyncs managed files) — do **not** only `pnpm add`.

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

bkit is published publicly on **npmjs** (`https://registry.npmjs.org`). Add to a consumer repo:

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

No CI step, secret, `.npmrc` mapping or Vercel env is needed — CI reaches npmjs anonymously.

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
bkit install --codex                     # Codex CLI host + core
bkit install --antigravity               # Google Antigravity host + core
bkit install --opencode=opencode-go      # additive opencode host (opencode-native gateway) + core
# opencode provider: openrouter | ollama | opencode-zen | opencode-go

# A bare install errors — name at least one module, or a tracker:
bkit install                             # ✗ error: requires ≥1 module flag
bkit install --tracker=github            # tracker alone: re-renders every installed host

# Ongoing sync — re-render everything installed at the CURRENT version (offline)
bkit upgrade

# Move to a newer bkit in ONE step — bumps @cbartens/bkit, then re-renders + re-pins
bkit upgrade --latest                    # newest published; or --to=<version> to pin one

# Drift detection — drift-checks everything installed; exits non-zero on drift (CI gate)
bkit check
```

**Module flags** (composable; symmetric install ↔ uninstall): `--claude` `--cursor` `--codex` `--antigravity` `--opencode=<provider>`. The CI workflow, the Vale config, the tool configs, the git hooks, the slop-scan type-suppression plugin (`scripts/slop/bkit-slop-type-suppression.mjs`), and the tool `package.json` scripts and devDeps are templates you copy from `.bkit/templates/` (`.bkit/templates.md`). Core, implicit on every install, seeds the `bkit:gate:*` / `bkit:deps:*` scripts every workflow runs (add-if-missing; a name already present is never touched); point their values at your stack, see `.bkit/README.md` § Required tools. Any other module flag is an unknown-flag error.

**Opt-in flags:** `--tracker=github|linear|jira`, `--auto=claude|cursor|opencode` (cloud agents), `--opencode=<provider>` (additive opencode execution host — `openrouter`, `ollama`, `opencode-zen`, `opencode-go`). Dependency updaters: copy an example and own it. See [§ Optional post-install decisions](#optional-post-install-decisions).

### Payload view links — `.bkit/core` + `.bkit/shared`

Install and upgrade create two **relative symlinks** into the installed package, so the payload sources (workflows, prompts, hooks) are browsable in-repo: `.bkit/core` → `../node_modules/@cbartens/bkit/.bkit/core`, same shape for `shared`. Views, not copies — always the installed version, zero drift. Rules:

- Both paths sit in the `.gitignore` managed block — they dangle on a fresh clone or in CI (no `node_modules`); `bkit install` / `upgrade` recreates them. A missing or mis-pointed link is never `bkit check` drift (links join no WriteSet).
- The `bkit` binary reads its payload from the package regardless; the links are browse-only. Editors resolve them to the `node_modules/…` paths.
- A real directory at either path is never clobbered (advisory `payload-link-real-dir`) — remove it yourself and re-run install to get the link. A platform that refuses symlinks (Windows without Developer Mode) falls back to a junction, then to advisory `payload-link-failed` — never a failure.
- `bkit uninstall` removes the links (symlinks only — consumer content stays).

> **⚠️ Moving bkit versions: use `bkit upgrade --latest` (or `--to=<version>`).** Bumps `@cbartens/bkit` **and** resyncs `.agents/` payload + `.bkit/version` pin in one atomic step — two can never drift apart. Bare `pnpm add @cbartens/bkit` (or Renovate/Dependabot bump) only refreshes `package.json` + lockfile — does **not** resync; skipping resync reds CI on `bkit check` drift gate. If you bump package separately, run `bkit upgrade` afterward and commit resync alongside version bump in same PR. A target equal to the installed version re-renders in place, unless `package.json` declares `@cbartens/bkit` by a non-registry spec (`file:` tarball, `link:`, `workspace:`, `npm:` alias, git, URL, path) — then it still runs `pnpm add` to swap in the published package.

### Local env setup

Two flows — pick one. Both put `BKIT_GH_TOKEN` in shell for the GitHub MCP server; Linear repos also need `BKIT_LINEAR_API_KEY`, Jira repos `BKIT_JIRA_API_KEY` (`.bkit/trackers.md` § jira — setup and notes). Use `gh auth login` for CLI.

#### Flow A — Shell export (quickest, no extra deps)

```bash
# Add to ~/.zshrc (or ~/.bashrc)
export BKIT_GH_TOKEN=<PAT — fine-grained (one owner) or classic (multiple owners)>   # GitHub MCP
export BKIT_LINEAR_API_KEY=<Linear personal API key>        # Linear MCP + preflight
export BKIT_JIRA_API_KEY=<Atlassian MCP V2 scoped token>   # Jira MCP

# Reload
source ~/.zshrc                                        # or: source ~/.bashrc
```

Pros: one step, no install. Cons: tokens in every shell on machine; no per-repo scoping.

#### Flow B — direnv + `.bkit/.env` (recommended for daily use)

`bkit install` writes `.bkit/.env.example` (placeholders + permission notes; bkit owns it and overwrites edits — real values go in `.bkit/.env`). `.envrc` (`dotenv_if_exists .bkit/.env`) is a template: copy it from `.bkit/templates/.envrc`. direnv loads `.bkit/.env` on `cd`, unloads on leave — tokens scoped to repo.

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

After step 4, restart open Claude Code / Cursor sessions in this repo so new env reaches MCP servers.

`.bkit/.env` gitignored — never commit. Cloud sessions (Claude Code on the web, Cursor Background Agents): set same names in respective online dashboards; see `.bkit/cloud.md` § Environment variables. `bkit install` / `bkit check` advisories detect missing direnv, blank required keys, un-allowed `.envrc` — follow whichever fires.

## Cloud agent environments (Claude Code on the web + Cursor Background Agents)

bkit ships repo-side scaffolding for both cloud agents. Opt-in `bkit install --auto=claude` writes no file; the per-session install hook (`.claude/hooks/bkit-cloud-bootstrap.sh`), the phase-routed `.github/workflows/bkit-cloud.yml` and the Cursor cloud image files (`.cursor/Dockerfile`, `.cursor/environment.json`) are templates in `.bkit/templates/` that you copy and own. (`.cursor/hooks.json` — Linear preflight wiring — ships with `--cursor`, not `--auto`.) Install without `--auto` ships zero cloud footprint. **Online-dashboard** half (Claude env in `claude.ai/code`, Cursor env vars in `Cursor → Settings → Background Agents`) configured once per machine / account.

For **post-CI auto-routing** (ship-vs-debug after CI), bkit ships a single `.github/workflows/bkit-cloud.yml` template with TWO runtime-gated dispatch jobs — **claude** job (`claude-code-action`, runs when the `ANTHROPIC_API_KEY` repo secret is set, or keyless via the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables) and **opencode** job (`opencode run` CLI, runs when `OPENCODE_PROVIDER_KEY` set) — plus `/bkit-auto` slash command both clouds invoke from single source (Cursor wires via dashboard trigger; no GHA on Cursor side). `bkit install --auto=opencode` requires `tracker=github`.

Full recipe + paste-in setup script + env-var inventory + Cursor dashboard config + consumer customisation patterns: `.bkit/cloud.md`. Host-delta matrix: `.bkit/providers.md` § Runtime environment.

## JSON ownership model — deep-containment

`.claude/settings.json` and `.cursor/hooks.json` managed via **deep-containment**. bkit declares scope (full template JSON tree) that must be present as subset of consumer document. Consumer-added keys outside template tree survive every `bkit install` byte-identically — no special key or wrapper required.

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

In this example, `hooks.SessionStart` is bkit-declared scope (from template). `hooks.Stop` and `failClosed` are consumer-added — bkit never touches them.

**Rules:**

- Consumer keys outside template tree survive every `bkit install` byte-identically.
- `bkit install` uses `deepContains(template, consumer)` — every template leaf present. On drift, deep-merges template-wins; consumer-only siblings preserved.
- `bkit check` surfaces `tier2-json-drift` advisory when `deepContains` fails and **exits 1** (CI drift gate); writes nothing — consumer reviews and re-runs `bkit install` to reconverge.
- `.cursor/hooks.json` uses Cursor v1 keyed-object schema: `{"version": 1, "hooks": {"sessionStart": [...], "sessionStop": [...]}}`.

## Install lifecycle

`bkit install` runs three phases in sequence:

**Phase 1 — Preflight (read-only, before any writes)**

bkit checks preconditions and known advisory patterns before touching any file. Blocker fires → install exits 1 immediately with formatted `[blocker]` line and zero writes. Advisories accumulated for Phase 3.

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

After writes, bkit re-runs credential and environment checks — some only accurate post-install (e.g. the `bkit:gate:*` scripts core just seeded into `package.json`). The table also lists the module advisories that render in the same checklist.

<!-- prettier-ignore -->
| `id` | When |
| --- | --- |
| `bkit-managed-duplicate` | A managed markdown file holds an older unmarked copy of its block outside `bkit:start`/`bkit:end`: the block's `# ` title plus 10+ of its long lines verbatim, fenced code ignored. Install never updates that copy. Names each file and title line; delete the copy. |
| `gh-mcp-token-unset-shell` / `gh-mcp-token-empty-shell` | `BKIT_GH_TOKEN` (GitHub MCP auth) unset/empty in shell while a `github` MCP server is configured — the whole tracker/PR/board MCP surface fails to connect. Suppressed in CI. |
| `tracker-setup-none` / `-github` / `-linear` / `-jira` | Optional post-install decision — which issue tracker is wired (`bkit.tracker.default`). `none` nudges `bkit install --tracker=…`. See [§ Optional post-install decisions](#optional-post-install-decisions). |
| `github-project-board-sync-unconfigured` | GitHub tracker active but Projects v2 board sync is half-configured (`bkit.tracker.github.project` empty, absent or not a board URL, and/or `.mcp.json` lacks the `projects` toolset) — sync silently no-ops. Silence with `bkit.tracker.github.project: false`. |
| `github-project-token-scope` | A board is configured but `BKIT_GH_TOKEN` cannot reach it: a classic token lacks the `project` scope, or a fine-grained token's board query returns nothing. Board moves fall back to the MCP. Checked live via `gh`; skipped on cloud / CI. |
| `dep-updater-absent` | No Renovate or Dependabot config. Copy one example and own it. `bkit.dependencies.updater: "none"` silences this. See [§ Optional post-install decisions](#optional-post-install-decisions). |
| `dep-updater-both` | Both updater configs are present. Keep one. |
| `cloud-router-none` / `cloud-router` | Optional post-install decision — post-CI auto-routing (`bkit.cloud.agent`). `none` (undecided) nudges `bkit install --auto=<variant>`, except under the jira tracker (local runs only); `cloud-router` is informational once `bkit-cloud.yml` is present. See [§ Optional post-install decisions](#optional-post-install-decisions). |
| `actions-write-permissions-missing` | `bkit-cloud.yml` present but repo Actions permissions are read-only / PR creation disabled — `actions/checkout` + `gh pr create` 403. Repo-level check; org policy can override. |
| `opencode-setup` | opencode host installed (`--opencode=<provider>`) — names the provider key to set (e.g. `BKIT_OPENROUTER_API_KEY`; `BKIT_OPENCODE_API_KEY` for `opencode-zen` / `opencode-go`), confirms the pre-seeded base URL, and notes all four providers ship curated per-agent pins (re-pin via `.bkit/prompts.md` § Model Overrides). Verify with `bkit doctor` + `bkit status`. |
| `vale-package-not-synced` | vale on PATH but `.vale/styles/write-good/` absent |
| `gate-missing-called-scripts` | A `bkit:gate:*` script still at bkit's default chains a script `package.json` does not declare (e.g. `typecheck`, `format:check`, `test`). Add it (`.bkit/templates.md` lists the tool scripts and devDeps) or rewrite the gate. |
| `gate-commit-repeats-push` | `bkit:gate:format` (pre-commit) runs a script the push gate runs again (e.g. `lint:prose`), so it runs on every commit and again on the push. Drop it from `bkit:gate:format`. |
| `gate-noop` | A `bkit:gate:*` script is empty or cannot fail (`true`, `:`, `exit 0`, `echo …`), so every agent run and push passes it. Warn-only, at install, `bkit check` and `bkit upgrade`, on every branch. Point it at real checks, or delete it and run `bkit upgrade` to restore bkit's default. |
| `gate-tier-not-wired` | `package.json` declares a deeper test tier (`test:integration`, `test:e2e`, `test:live`) that no `bkit:gate:*` script runs; the advisory prints the gate line to add. |
| `test-file-script-missing` | `package.json` does not declare `bkit:test:file`, so `/bkit-build` reports test-first as not enforced. The advisory prints the script contract and a Vitest line. |

Phase 1 and Phase 3 findings merged and deduplicated by `id` (Phase 3 wins on conflict — re-detection more accurate post-write). Zero findings → no banner.

**`bkit check` (dry-run)** runs Phase 1 and Phase 3 (read-only) — same advisory set as `bkit install` minus writes. Changes no managed file (regenerates `.bkit/advisories.md` artifact) and **exits 1 when any managed-file write would occur** in installed module — Tier-2 JSON deep-containment or markered-block drift, whole-file byte-equal mismatch, **host agent/command mirror content drift** (would-write / orphan delete), or when any file bkit writes (rendered agents / commands / skills, managed blocks, owned whole files) carries a stale managed-version marker (`bkit-managed-stale`). Gate covers the **installed** module set ({core, claude, cursor, codex, antigravity} plus **opencode**, each detected by sentinel files: a host's `agents/` dir; antigravity any of `.agents/plugins/bkit/{plugin.json,hooks.json,agents,skills,hooks}`, so a deleted plugin manifest is reported as a missing file, not an absent host; `bkit status` uses the same detection). A missing `bkit:gate:*` name counts as a write. antigravity gated: `.agents/plugins/bkit/**` (plugin manifest, hooks, agents, skills) and root `GEMINI.md`. opencode gated: `.opencode/opencode.json` (provider block + the recorded tracker's `mcp` entry + permission sandbox; another tracker's `mcp` entry the consumer edited, kept by a tracker switch, is not drift — `mcp-extra-server-linear--opencode-opencode-json` advises removing it) and the `bkit-gateguard.js` / `bkit-readguard.js` / `bkit-rules.js` plugins drift fail `check` — render inputs fall back to installed provider (`package.json` `bkit.providers.opencode.default`, authoritative for `opencode-zen` / `opencode-go`; all installed providers tracked in `bkit.providers.opencode.installed: string[]`) and recorded tracker, so clean install across providers checks green (no false drift). Remaining **opt-in** module (cloud) is not drift-gated. A missing bkit-owned hook file also fails `check`, one line per file naming it and the `bkit install` flag that restores it: the hook files of every installed host (`.claude/hooks/*`, `.cursor/hooks/*`, `.codex/hooks/*`, `.agents/plugins/bkit/hooks/*`, `.opencode/plugin/bkit-gateguard.js`, `.opencode/plugin/bkit-readguard.js`, `.opencode/plugin/bkit-rules.js`) — the hook commands skip a missing file (`test -f … || true`), so without this the guard would be off with no signal. Updater configs are not bkit files, so `bkit check` does not report them. Phase 3 stays read-only through read-only detector paths, not by being skipped.

**`bkit upgrade`** (not `--dry-run`) ends with the same read-only pass as `bkit check`: prints the checklist and rewrites `.bkit/advisories.md` (`Mode: upgrade`). Drift and blockers it finds are reported only — upgrade's exit code is unchanged.

**`PreflightFinding` shape** — stable contract for downstream tooling:

```typescript
interface PreflightFinding {
  id: string; // stable kebab-case identifier
  severity: "blocker" | "advisory";
  detect: string; // one-line description of the detected condition
  action: string; // AI-pasteable fix instruction
}
```

Findings render as `--- i/N [severity] id ---` with `Detect:` and `Action:` lines. The console banner and the `.bkit/advisories.md` artifact render the same text — copy either into a coding assistant to apply fixes in sequence. After the findings, both list every firing setup tip (§ Setup tips).

**Dismissing an advisory (per package).** A detector can be right in general and still fire where the condition is deliberately not applicable — a rule-linter whose test titles mention `@live`, an integration lane mocked by design. Opt the owning package out in its `package.json`:

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
| Scope | Per package, read from the **owning** package's `package.json` — the package holding the test file for `tagged-tests-no-ci-home`, the repo root for `test-integration-env-not-asserted` (the only manifest it reads). A sibling package with a real finding stays flagged. |
| Severity | Advisory only. A `blocker` is never suppressible, whatever the manifest says. |
| Visibility | The console banner and `.bkit/advisories.md` carry one suppressed-advisory line per dismissal (`N advisory` / `N advisories`), so a stale opt-out cannot hide a finding silently. |
| Coverage | Per package: `tagged-tests-no-ci-home` and `test-integration-env-not-asserted`. Repo root: every setup tip id and every advisory a tip reuses (§ Setup tips). No other advisory is suppressible; an id matching no advisory or tip is ignored. |

## Optional post-install decisions

Two capabilities **opt-in** — never wired by plain host/tooling install. Default install never enables them; post-install advisory banner nudges you to choose, once. Each recorded in `package.json` (`bkit.tracker.default`, `bkit.cloud.agent`) so the nudge knows whether you've decided or deliberately opted out.

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

Use one. `bkit.dependencies.updater: "none"` skips the install-time absence advisory. Setup: `docs/deployments.md` § Dependency updaters.

**Security scan.** Updater only offers fixes once a fixed release exists. To fail CI on known-vulnerable packages, risky config or committed secrets, copy `.bkit/templates/.github/workflows/bkit-trivy.yml` and own it. No advisory; `bkit tips` suggests it. Setup: `.bkit/templates.md` § Trivy.

**Test lint.** JS / TS repos, to fail `lint` on a test that cannot fail (no assertion, branch inside a test, unawaited promise): copy and own `.bkit/templates/.oxlintrc.json`, add `oxlint` + `oxlint-tsgolint`, set `lint` to `oxlint -c .oxlintrc.json --type-aware --deny-warnings`. No advisory; `bkit tips` suggests it. Setup: `.bkit/templates.md` § Oxlint.

**All templates.** Copy and own, never installed. Catalog and install steps: `.bkit/templates.md`.

**Why opt-in, not part of a default install:**

- **Tracker** wires real credentials and MCP servers into workflows — consumer must choose provider; bkit can't guess.
- **Cloud agents** run through the phase-routed `bkit-cloud.yml` template (auto-dispatches bkit-ship on CI pass, bkit-debug on CI fail; plan/build via `workflow_dispatch`; design is local-only) plus cloud env scaffolding (`.claude/hooks/bkit-cloud-bootstrap.sh`, and the `.cursor/Dockerfile` + `.cursor/environment.json` templates). Workflow carries claude job and opencode job, each runtime-gated on provider secret — inert without key: claude needs the `ANTHROPIC_API_KEY` repo secret or the federation repo variables (+ Claude GitHub App), opencode needs `OPENCODE_PROVIDER_KEY`. Both need GitHub Actions write permissions, GitHub tracker, and (Cursor half) dashboard trigger — tracker itself opt-in. Env scaffolding inert until Claude/Cursor cloud env wired in dashboard. Autonomous routing by default, wired to unconfigured tracker, is wrong default — install without `--auto` ships zero cloud footprint.

**How to decide:**

1. Run `bkit install --claude --cursor` (or whichever modules you want). Post-install banner lists `tracker-setup-none`, `dep-updater-absent`, `cloud-router-none` if undecided.
2. Pick tracker: `bkit install --tracker=github` (or `linear` / `jira`). Needs no host flag; re-renders every installed host. Persisted to `bkit.tracker.default`; future installs preserve (switching free).
3. Copy one updater example (table above). Land Renovate config on the default branch before installing the App.
4. Enable cloud agents: `bkit install --auto=claude|cursor|opencode`. Persisted to `bkit.cloud.agent`; install prints secrets + permissions + dashboard checklist (`bkit-auto-setup`). Shipped `bkit-cloud.yml` carries claude job (`ANTHROPIC_API_KEY` repo secret or federation repo variables — `.bkit/cloud.md` § Claude — workload identity federation) and opencode job (`OPENCODE_PROVIDER_KEY`), each runtime-gated.
5. **To opt out and silence the nudge**, set the field to `"none"` in `package.json` (`bkit.tracker.default` / `bkit.dependencies.updater` / `bkit.cloud.agent`). Advisory stays quiet. The `""` install seeds means undecided and keeps the nudge.

Tracker and cloud agents reverse by re-running install with the other flag. Updater files stay until you delete them.

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

`bkit doctor` is **diagnostic verb** — runs Phase 1 preflight + Phase 3 credential detectors, exits 0. Changes no managed file; like `bkit check` regenerates `.bkit/advisories.md` artifact (creates `.bkit/` if absent — repo that never installed bkit gains that one file).

```bash
# Diagnose drift without running install
bkit doctor
```

Use `bkit doctor` to:

- Check `BKIT_GH_TOKEN` presence in shell (GitHub MCP auth) and the cloud-router claude credential (`ANTHROPIC_API_KEY` repo secret or federation repo variables; flags a key shadowing federation and an adopted `bkit-cloud.yml` too old for federation).
- Surface `bkit-version-pin-stale` advisory (installed version ahead of `.bkit/version`).
- Preview all advisories `bkit install` would show post-install, without triggering writes.
- Verify environment ready before `bkit install` on new machine.
- Detect macOS GUI-isolation (`bkit cursor` / `bkit opencode`): see `.bkit/providers.md` § macOS GUI-isolation.
  `bkit doctor` always exits 0. Advisories found → printed in same checklist banner format as `bkit install`. None found → prints `[bkit-doctor] No advisories found.`

## Uninstall

`bkit uninstall` surgically removes bkit-managed content while preserving consumer customisations. The `.bkit/core` / `.bkit/shared` payload view links go with a full/core uninstall (symlinks only — a real directory at either path is consumer content and stays).

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
| `markered-text` | bkit block stripped; consumer content above/below preserved. File deleted if only whitespace remains — or, for a bkit-seeded markdown file (`AGENTS.md`/`CLAUDE.md`), if only its `# Title` heading husk remains. |
| `byte-equal-text` | Deleted only if current hash matches the hash `.bkit/version` recorded when bkit last wrote it (`canonicalHashes`). Consumer modifications → preserved. `canonicalHashes` is internal state `bkit check` does not verify: a hand-edited or corrupted entry makes uninstall keep that file as consumer-modified (`--force` deletes it anyway) and upgrade's whole-file diff report a conflict instead of updating it. Rendered `.bkit/*.md` skip that diff: upgrade always re-renders them, and `bkit check` flags a hand edit. |
| `json` | bkit's keys stripped; consumer keys preserved. `.mcp.json` / `.cursor/mcp.json`: only bkit's tracker entry is removed, and only while it still equals the template. `.opencode/opencode.json`: every `mcp` tracker entry (`github`, `linear`, `jira`) and every `provider` block of a supported provider is removed while it still equals what install renders — all the earlier installs left, not just the active one; an edited entry is kept whole. File deleted when nothing is left. |

### Idempotency

Running `bkit uninstall` twice is safe — subsequent runs skip absent files and produce zero writes.

### What a full uninstall preserves

Bare uninstall removes bkit-managed files and strips bkit-managed blocks, but **not** guaranteed zero-footprint wipe. `docs/`: bkit's block (managed marker included) is stripped from every installed `docs/*.md` — a file holding nothing else is deleted — and the owned `docs/templates/bkit-*.md` are deleted. Deliberately leaves: everything outside `bkit:start` / `bkit:end` in `docs/*.md`, `.agents/context.md`, `.agents/skills.md` and the other managed-block files; your own files in `docs/` and `docs/templates/`; every file you copied from `.bkit/templates/`; any owned whole-file the consumer modified (hash mismatch → preserved); generated artefacts not manifest-tracked (`.bkit/advisories.md`, `.bkit/friction.jsonl`, the newest-release cache `.git/bkit-latest-version.json`). Use `--nuke` to force-remove every manifest-listed bkit file regardless of consumer modifications; generated artefacts still yours to delete by hand.

## Phase 3 exit-1 and recovery

When `bkit install` detects **blocker-severity** finding in Phase 3 (e.g. `owned-hook-missing` — a bkit-owned hook file is gone, so the guard or setup step it holds does not run), exits 1 and prints single-line recovery command:

```
[bkit-install] 1 Phase 3 blocker(s) detected. Recovery:
  bkit uninstall <flags> && <fix the issue> && bkit install <flags>
```

Advisories (non-blockers) informational only — do not trigger exit-1.

### --auto-revert

Add `--auto-revert` to `bkit install` to automatically run `bkit uninstall` in-process when Phase 3 blocker fires:

```bash
bkit install --auto-revert
```

Useful in CI scripts to guarantee clean state on failure.

## Install staging directory

`bkit install` renders derived files (e.g. `.opencode/opencode.json`) into `.bkit-staging/` scratch directory before merging into consumer destinations. Scratch directory cleaned up after every run — success and failure alike — never persists in committed consumer repo state.

**Not a cross-module transaction.** Modules write directly to destinations — `bkit install` not atomic across modules: failure partway (e.g. hand-broken `.claude/settings.json` makes JSON merge throw) leaves earlier-module files written and `.bkit/version` unpinned. Error surfaced, not swallowed.

**Recovery is re-run.** `bkit install` idempotent — fix offending file and re-run to complete. `bkit uninstall` removes whatever was written.
