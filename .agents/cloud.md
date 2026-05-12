# Claude Code on the web — cloud environment setup

> [!CAUTION]
> **Purpose:** Copy-paste recipe for creating a Claude Code on the web cloud environment that works with this repo (and the same shape for any bkit consumer).
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent + maintainer readers.
> - Cloud env config lives in the Claude app (not the repo); the SessionStart hook side lives in the repo.
> - Update this doc when the cloud's pre-installed toolchain or default allowlist changes (source: `code.claude.com/docs/en/claude-code-on-the-web`).

## Background

Cloud sessions run on Anthropic-managed Ubuntu 24.04 VMs (4 vCPU / 16 GB RAM / 30 GB disk). Custom Docker base images are **not yet supported**. Three customization surfaces, all configured per environment in the Claude app:

<!-- prettier-ignore -->
| Surface | What it does | Lives where |
| --- | --- | --- |
| **Setup script** | Bash, runs as root **once**, filesystem snapshotted, cache reused (~7d TTL). Use for binaries the cloud doesn't have. | Claude app → environment settings |
| **Environment variables** | `.env` format, plaintext, visible to anyone with edit access on the env. | Claude app → environment settings |
| **Network access** | `None` / `Trusted` (default allowlist) / `Full` / `Custom`. | Claude app → environment settings |

The cloud already ships Node 20–22 + pnpm/bun, Python + ruff, Docker, Postgres 16, Redis 7, git, jq, ripgrep. Vale, the `gh` CLI, and project deps are **not** included.

## In-repo side

- `.claude/hooks/cloud-bootstrap.sh` — SessionStart hook. Runs `pnpm install --frozen-lockfile` and `vale sync` when `CLAUDE_CODE_REMOTE=true`, no-ops locally.
- Registered in `.claude/settings.json` alongside `preflight.sh`.

You don't need to touch these; they ship with the repo.

## What to paste into the Claude app

Open claude.ai/code on the iOS app (or web) → environment selector → **+ Add environment**.

### Name

```
bkit-dev
```

(Or any per-project name. One env per repo is the common shape.)

### Network access

`Trusted` (the default). The default allowlist already covers npm, GitHub Packages, the Vale release tarball on `objects.githubusercontent.com`, Docker Hub, and PyPI. No custom domains required.

### Environment variables

Minimum to paste:

```
GH_TOKEN=<fine-grained PAT scoped to cbartens/bkit — see permissions below>
CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70
```

Add only when releasing from cloud:

```
GITHUB_TOKEN=<classic PAT with write:packages + repo — pnpm publish only>
```

#### `GH_TOKEN` — fine-grained PAT permissions

Use a **fine-grained** PAT scoped to `cbartens/bkit` only. Mandatory expiry, repo-scoped blast radius, granular permissions — all wins given env vars are stored as low-trust plaintext in the env config.

<!-- prettier-ignore -->
| Permission | Level | What it unlocks |
| --- | --- | --- |
| Contents | Read & write | `git push`, branch creation |
| Pull requests | Read & write | `gh pr create / view / merge / comment` |
| Issues | Read & write | `gh issue` |
| Actions | Read & write | `gh run view` logs, `gh workflow run` |
| Workflows | Read & write | `gh workflow` (edit `.github/workflows/*`) |
| Metadata | Read | mandatory, auto-included |

`gh` reads `GH_TOKEN` automatically; no `gh auth login` step needed.

#### When classic is still required

Fall back to a classic PAT only if you hit one of these:

- **`pnpm publish` to GitHub Packages.** Historically required classic `write:packages`; fine-grained packages support has edge cases on user-owned packages. If publish 401s, use a classic PAT with `write:packages` + `repo`, put it in `GITHUB_TOKEN` (separate from `GH_TOKEN`), and keep it only in release-flow sessions.
- **Cross-repo work in a single cloud session.** Fine-grained PATs only see their allowlist; classic sees everything your user can. Rare for bkit.

#### Notes

- The Claude app warns "don't add secrets" because env vars are visible to anyone with edit rights on the environment. Personal account: that's just you. Team account: treat the env as low-trust.
- `CLAUDE_AUTOCOMPACT_PCT_OVERRIDE=70` triggers auto-compaction earlier than the ~95% default — helpful on long cloud sessions.
- **Env vars set in the Claude app are NOT visible inside the setup script.** They're injected only after Claude Code starts (so they reach `SessionStart` hooks + the interactive shell, but the setup script runs at snapshot-build time before that). If a tool you install needs a token to bootstrap, you'd have to inline it into the setup-script body — which is the "no secrets store" trap. We avoid this today because vale/gh/corepack don't need auth.

### Setup script

Paste verbatim:

```bash
#!/bin/bash
set -euo pipefail

VALE_VERSION="3.9.1"
if ! command -v vale >/dev/null 2>&1; then
  cd /tmp
  curl -sfLO "https://github.com/errata-ai/vale/releases/download/v${VALE_VERSION}/vale_${VALE_VERSION}_Linux_64-bit.tar.gz"
  tar -xzf "vale_${VALE_VERSION}_Linux_64-bit.tar.gz" -C /usr/local/bin vale
  chmod +x /usr/local/bin/vale
fi

apt-get update -qq && apt-get install -y --no-install-recommends gh

corepack enable && corepack prepare pnpm@10.33.0 --activate

echo "bkit-dev ready: $(vale --version), $(gh --version | head -1), pnpm $(pnpm -v)"
```

What this does and why it's split from the in-repo hook:

- **Vale + gh** install once into the snapshot — they're binaries the cloud lacks but your laptop already has, so they don't belong in a repo-level hook.
- **pnpm corepack pin** ensures the snapshot matches `packageManager` in `package.json`.
- `pnpm install` and `vale sync` are **not** here — they belong in `.claude/hooks/cloud-bootstrap.sh` so they re-run on resumed sessions when the lockfile or styles have drifted.

Keep total runtime under ~5 minutes or the snapshot won't build.

## After saving the env

1. Trigger a session: `claude --remote "echo ready"` from this repo, or tap the env in the iOS app and start a session.
2. First session is slow (setup script runs once + snapshot builds). Subsequent sessions start from the snapshot.
3. Verify in-session: `vale --version && gh --version && pnpm -v && which corepack`.
4. The next session rebuilds the snapshot when: the setup-script body changes, the allowed-hosts list changes, or the ~7-day TTL expires. Editing env vars or hook scripts in-repo does **not** invalidate the snapshot.
5. **Force a rebuild without semantic changes**: add a `# cache-bust YYYY-MM-DD-N` comment line at the top of the setup script and save. The body differs, so the next session reruns it — useful after upgrading vale/gh manually or fixing a flaky first run.

## Consumer variant

For repos that consume `@cbartens/bkit` but don't develop it, the recipe is the same except:

- Setup script can drop `corepack prepare pnpm@10.33.0 --activate` if the consumer pins its own pnpm version.
- Add `GH_BKIT_TOKEN=<classic PAT with read:packages>` as an env var — required for `pnpm install` / `bkit install` to pull `@cbartens/bkit` from GitHub Packages. pnpm's `.npmrc` substitutes `${GH_BKIT_TOKEN}` with **no fallback**, so an unset var 401s silently. See root `README.md` for the consumer auth flow.
- `gh` is optional unless the consumer's workflow uses it.

## Caveats

- **No secrets store yet.** Env vars and setup-script body are stored as plaintext in the env config. Rotate PATs regularly.
- **Env vars don't reach the setup script** (covered above). Any auth needed at snapshot-build time has to be inlined into the script body — exactly the leak you want to avoid. Design around it: install only public binaries in the setup script; defer auth-bearing work to the SessionStart hook.
- **Cache invalidation is body-based.** Editing the env-vars block or repo-side hook scripts doesn't trigger a rebuild. Use the `# cache-bust` comment trick to force one.
- **Husky runs on `pnpm install`.** The `prepare` script (`husky`) registers git hooks during the SessionStart hook's `pnpm install`. Pre-commit hooks (`lint-staged`, `lint:prose`, `lint:slop`) then run when Claude commits. `slop-scan` is a devDep so `pnpm install` puts it on PATH via `node_modules/.bin`; `vale` is a system binary so it has to come from the setup script. Both must exist before the first commit, which is why setup-script (vale) must run before SessionStart-hook (`pnpm install`) — the ordering is correct by default.
- **Bun has known proxy issues** with the cloud's security proxy. bkit uses pnpm so this doesn't hit us; flag it for consumers on bun.
- **Custom base image not supported.** Escape hatch per Anthropic docs is `docker compose` sidecars. Not needed for bkit's stack today.
- **GitHub App vs `/web-setup`.** Auto-fix PRs require the GitHub App. `/web-setup` (sync `gh` token to your Claude account) is enough for cloning + pushing but not for auto-fix.
- **IP allowlists** on org GitHub/Anthropic accounts will block cloud sessions — contact Anthropic support to exempt their managed infra.

## Sources

- Anthropic docs: <https://code.claude.com/docs/en/claude-code-on-the-web>
- Zenn article on env-var/setup-script gotcha: <https://zenn.dev/harieshokunin/articles/b1064354319ce2?locale=en>
- Managed Agents environments (separate product, similar shape): <https://platform.claude.com/docs/en/managed-agents/environments>
- Linear BAR-191 (initial research and design)
