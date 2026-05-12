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

## Cursor Cloud Agent — CI router (auto-ship / auto-debug)

> [!CAUTION]
> **Where these live:** These two prompts are pasted into <https://cursor.com/automations> (Cursor's hosted automation UI) — **not** committed to `.github/workflows/`. Cursor's platform owns the CI trigger (it watches `workflow_run` completions on the linked GitHub repo) and the dispatch (it spawns the Cloud Agent with the matching prompt body). The bkit repo only owns the prompt text + the consumer-side prerequisites (Linear labels, `AGENT_METADATA` PR-body block).
>
> **Contrast with Claude Code:** Claude Code's equivalent (BAR-148, `docs/plans/drafts/bar-148-option-1-plan.md`) is the opposite shape — a `.github/workflows/bkit-ci-router.yml` checked into the repo that calls `anthropics/claude-code-action@v1` on `workflow_run: completed`. That file is in-flight (drafted, not built). For Cursor there is no repo-side YAML; the trigger + dispatch are configured per-environment in cursor.com.

Two router prompts close the loop after `bkit-build` pushes its CI-trigger commit: on green CI Cursor launches a Cloud Agent running `/bkit-ship`, on red CI it launches one running `/bkit-debug`. Each prompt runs in a fresh Claude Code session inside the Cursor agent (Linear MCP attached), reads `AGENT_METADATA` from the PR body, and POSTs `https://api.cursor.com/v0/agents` to spawn the actual ship/debug agent.

**Cursor-side config (cursor.com/automations):**

- One automation per prompt (Pass router, Fail router). Trigger: GitHub `workflow_run` completion on `feat/**` branches, conclusion filter (`success` for Pass, `failure` for Fail).
- Paste each prompt verbatim into the automation's prompt field.
- Model picker: `composer-2` (router itself); the dispatched agent body picks its own model (`composer-2` for Ship, `claude-4.6-opus-high-thinking` for Debug).
- Secrets: `CURSOR_API_KEY` (per-automation Cloud Agents API key — **not** the personal account key) and `GH_TOKEN` (already in this env per § Environment variables).

**Required Linear labels:** `Router`, `Failed`, `Automated` (opt-in gate). `Router` is already in bkit's mutually exclusive phase set (`.agents/rules.md`); create `Automated` and `Failed` in the workspace if absent.

**Required PR body block** (written by `bkit-build` Step 17 — `Create PR`):

```html
<!-- AGENT_METADATA {"linearIssueId":"BAR-260","debugAttempt":0} -->
```

### Prompt — CI Pass → Ship Router

> `composer-2` · Reasoning: low

````markdown
Role: CI router. PR metadata → Ship workflow. No code, no reasoning.

Output: Cursor Cloud Agent launch.
Linear: MCP server plugin-linear-linear.

> [!CAUTION]
> Read in full: .agents/rules.md.
>
> EXECUTION PROTOCOL: Strict procedure, do NOT deviate.
>
> - Order: Execute sequentially unless stated otherwise.
> - Placeholders: Assert {PLACEHOLDERS} such as {FID}, {ISSUE_ID}, {STATE}, {LABELS}, {PR_NUMBER}, {OWNER_REPO}, {BRANCH}, etc non-empty before tool calls → else Failure Path `Empty placeholder: {name}`.
> - Labels: Issue phase {LABELS} (`Design`, `Plan`, `Build`, `Debug`, `Ship`, `Review`, `Failed`, `Merged`, `Router`) mutually exclusive — drop old label before adding new one.
> - Tools: Verify every return, do NOT assume success.
> - Gates: Verify all gates before next step. Skipped gate = invalid work.
> - No Improv: No ad-hoc task lists, no skipping, no alternative approaches, or scope beyond this file.
> - Failures: Any step, tool, command fails, or gate cannot pass → Failure Path.

---

## 🤖 Failure Path

1. Add `Failed` phase to `{LABELS}`, drop old → `save_issue({ id: "{ISSUE_ID}", state: "In Review", labels: [{LABELS}] })`.
2. `save_comment({ issueId: "{ISSUE_ID}", body: })` — body = fenced block below:

   ```comment
   Router: Failure
   Step: {N} — {Step Name}
   Error: {error message / tool response}
   Time: {ISO timestamp}

   [{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
   ```

3. STOP, no further downstream steps.

---

## 🤖 Step 1 — Guards

1. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty.
2. `git branch --show-current` → extract `BRANCH`. Assert non-empty.
3. `gh pr view {PR_NUMBER} --json baseRefName` → if `baseRefName` is NOT `dev` → Failure Path.
4. `gh pr view {PR_NUMBER} --json body` → if PR body does NOT contain `AGENT_METADATA` block → Failure Path.
5. Parse `AGENT_METADATA` JSON in PR body (`<!-- AGENT_METADATA {"linearIssueId":"...","debugAttempt":N} -->` → `gh pr view {PR_NUMBER} --json body --jq '.body' | grep -oP '(?<=AGENT_METADATA ).*(?= -->)' | jq .`) → extract `linearIssueId`, `debugAttempt`. Assert `linearIssueId` non-empty.
6. `get_issue({ id: "{linearIssueId}" })` → extract `LABELS` → if `LABELS` does NOT contain `Automated` → Failure Path.

## 🤖 Step 2 — Agent Launch

**Run only if** all Step 1 guards pass.

1. `CURSOR_API_KEY` — Cloud Agents → agent-specific API Keys; NOT general Cursor account API key.
2. `gh pr view {PR_NUMBER} --json headRefName` → extract `headRefName`. Assert non-empty.
3. Launch agent via AGENTS.md entry point:

   ```bash
   curl --request POST \
     --url https://api.cursor.com/v0/agents \
     -u "${CURSOR_API_KEY}:" \
     --header 'Content-Type: application/json' \
     --data '{
       "prompt": {
         "text": "Linear issue: {linearIssueId}. Label is Ship. Follow AGENTS.md."
       },
       "model": "composer-2",
       "source": {
         "repository": "https://github.com/{OWNER_REPO}",
         "ref": "{headRefName}"
       }
     }'
   ```

4. Extract `id` from response. **If** `id` NOT present → Failure Path with `Agent launch returned no id`.
5. Add `Router` phase to `{LABELS}`, drop old → `save_issue({ id: "{linearIssueId}", state: "In Progress", labels: [{LABELS}] })`.
6. `save_comment({ issueId: "{linearIssueId}", body: })` — body = fenced block below:

   ```comment
   Router: Step 2 Agent Launch Complete
   [{id}](https://cursor.com/agents/{id})
   ```

### 🔒 Gate 2: Agent Launch Complete

- [ ] Cloud Agent launched, session ID extracted
- [ ] Issue state `In Progress` and label `Router`
- [ ] Step 2 comment posted

> ⛔ STOP after step 2. No code, no file edits.
````

### Prompt — CI Fail → Debug Router

> `composer-2` · Reasoning: low · launches `claude-4.6-opus-high-thinking` in the cloud agent

````markdown
Role: CI router. PR metadata → Debug workflow. No code, no reasoning.

Output: Cursor Cloud Agent launch.
Linear: MCP tool names `get_issue` · `save_issue` · `save_comment`.

> [!CAUTION]
> Read in full: .agents/rules.md.
>
> EXECUTION PROTOCOL: Strict procedure, do NOT deviate.
>
> - Order: Execute sequentially unless stated otherwise.
> - Placeholders: Assert {PLACEHOLDERS} such as {FID}, {ISSUE_ID}, {STATE}, {LABELS}, {PR_NUMBER}, {OWNER_REPO}, {BRANCH}, etc non-empty before tool calls → else Failure Path `Empty placeholder: {name}`.
> - Labels: Issue phase {LABELS} (`Design`, `Plan`, `Build`, `Debug`, `Ship`, `Review`, `Failed`, `Merged`, `Router`) mutually exclusive — drop old label before adding new one.
> - Tools: Verify every return, do NOT assume success.
> - Gates: Verify all gates before next step. Skipped gate = invalid work.
> - No Improv: No ad-hoc task lists, no skipping, no alternative approaches, or scope beyond this file.
> - Failures: Any step, tool, command fails, or gate cannot pass → Failure Path.

---

## 🤖 Failure Path

1. Add `Failed` phase to `{LABELS}`, drop old → `save_issue({ id: "{ISSUE_ID}", state: "In Review", labels: [{LABELS}] })`.
2. `save_comment({ issueId: "{ISSUE_ID}", body: })` — body = fenced block below:

   ```comment
   Router: Failure
   Step: {N} — {Step Name}
   Error: {error message / tool response}
   Time: {ISO timestamp}

   [{BRANCH}](https://github.com/{OWNER_REPO}/tree/{BRANCH})
   ```

3. STOP, no further downstream steps.

---

## 🤖 Step 1 — Guards

1. `gh repo view --json nameWithOwner --jq .nameWithOwner` → extract `OWNER_REPO`. Assert non-empty.
2. `git branch --show-current` → extract `BRANCH`. Assert non-empty.
3. `gh pr view {PR_NUMBER} --json baseRefName` → if `baseRefName` is NOT `dev` → Failure Path.
4. `gh pr view {PR_NUMBER} --json body` → if PR body does NOT contain `AGENT_METADATA` block → Failure Path.
5. Parse `AGENT_METADATA` JSON → extract `linearIssueId`, `debugAttempt`. Assert `linearIssueId` non-empty.
6. `get_issue({ id: "{linearIssueId}" })` → extract `LABELS` → if `LABELS` does NOT contain `Automated` → Failure Path.
7. **If** `debugAttempt >= 3` → Failure Path with `debugAttempt >= 3, cannot retry`.

## 🤖 Step 2 — Agent Launch

**Run only if** all Step 1 guards pass.

1. `CURSOR_API_KEY` — Cloud Agents → agent-specific API Keys; NOT general Cursor account API key.
2. `gh pr view {PR_NUMBER} --json headRefName` → extract `headRefName`. Assert non-empty.
3. Launch agent via AGENTS.md entry point:

   ```bash
   curl --request POST \
     --url https://api.cursor.com/v0/agents \
     -u "${CURSOR_API_KEY}:" \
     --header 'Content-Type: application/json' \
     --data '{
       "prompt": {
         "text": "Linear issue: {linearIssueId}. Label is Debug. Follow AGENTS.md. PR #{PR_NUMBER} on branch {headRefName} failed CI on attempt {debugAttempt}."
       },
       "model": "claude-4.6-opus-high-thinking",
       "source": {
         "repository": "https://github.com/{OWNER_REPO}",
         "ref": "{headRefName}"
       }
     }'
   ```

4. Extract `id` from response. **If** `id` NOT present → Failure Path with `Agent launch returned no id`.
5. Add `Router` phase to `{LABELS}`, drop old → `save_issue({ id: "{linearIssueId}", state: "In Progress", labels: [{LABELS}] })`.
6. `save_comment({ issueId: "{linearIssueId}", body: })` — body = fenced block below:

   ```comment
   Router: Step 2 Agent Launch Complete
   [{id}](https://cursor.com/agents/{id})
   ```

### 🔒 Gate 2: Agent Launch Complete

- [ ] Cloud Agent launched, session ID extracted
- [ ] Issue state `In Progress` and label `Router`
- [ ] Step 2 comment posted

> ⛔ STOP after step 2. No code, no file edits.
````

### Drift notes — gether seed → bkit current

These prompts originated in gether's `docs/prompts/build.md` (`a2a9cd33`); below are the deltas you must reconcile before pasting them into cursor.com/automations for a bkit consumer:

<!-- prettier-ignore -->
| Drift | gether seed | bkit current | Action |
| --- | --- | --- | --- |
| Failure label | `Blocked` | `Failed` (additive per `afecb82`; cleared on `/bkit-debug` entry and on `Merged` per `b8d1ffe`) | Already adapted above (`Blocked` → `Failed`). |
| Opt-in label | `Automated` | BAR-148 plan proposes `bkit:auto-route`; not in `.agents/rules.md` phase set | Decide on one canonical label; update step 1.6 guard. |
| status.json shape | implicit | `parentSha` captured per step (bar-187); `issueId` + `commentId` proposed Path-A schema (BAR-148 A4-A8) | Router doesn't touch status.json; pass-through. |
| Debug close → PR | absent | `bkit-debug` close-workflow now opens PR when none exists (bar-188) | No router-side change; CI fires on next push regardless. |
| ReAct hypotheses | absent | bar-168 added Prior-Knowledge + ReAct to `bkit-debug-failure-diagnose` | No router-side change. |
| PR-base gates | absent | bar-170 added PR-base gates + rollback runbook | No router-side change. |
| `AGENT_METADATA` PR-body block | written by gether build | **not yet written** by `bkit-build` Step 17 | Add to `bkit-build.md` Step 17 PR body template before these prompts will pass Step 1.4. |
| Trigger surface | gether: `.github/workflows/ci-complete.yml` (Claude-Code-action shape) | bkit Cursor route: cursor.com/automations (no repo file); bkit Claude route: BAR-148 ci-router.yml (drafted, not built) | Two parallel implementations once both are live; same prompt bodies. |

## Sources

- Anthropic docs: <https://code.claude.com/docs/en/claude-code-on-the-web>
- Cursor Automations (CI trigger + dispatch UI): <https://cursor.com/automations>
- Cursor Cloud Agents API: <https://cursor.com/docs/agents/api>
- Zenn article on env-var/setup-script gotcha: <https://zenn.dev/harieshokunin/articles/b1064354319ce2?locale=en>
- Managed Agents environments (separate product, similar shape): <https://platform.claude.com/docs/en/managed-agents/environments>
- Linear BAR-191 (initial research and design)
- Linear BAR-148 + plan `docs/plans/drafts/bar-148-option-1-plan.md` (Claude-Code-action ci-router design — the in-repo trigger half)
- gether seed `docs/prompts/build.md` @ `a2a9cd33` (origin of the two router prompts)
