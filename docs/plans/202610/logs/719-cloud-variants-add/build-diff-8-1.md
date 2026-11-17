diff --git a/.bkit/core/.bkit/README.md b/.bkit/core/.bkit/README.md
index 40aa93064..49fe5277a 100644
--- a/.bkit/core/.bkit/README.md
+++ b/.bkit/core/.bkit/README.md
@@ -329,7 +329,7 @@ The cloud workflow and the Cursor Background Agent files are templates the `--au
 
 ### Optional post-install decisions (tracker + cloud agents)
 
-Two capabilities are opt-in and left out of the default install: the **issue tracker** (`--tracker=github|linear|jira`) and **cloud agents** (`--auto=claude|cursor|opencode`). The default install ships zero cloud footprint. While a choice is undecided, its advisory fires (`tracker-setup-none` / `cloud-router-none`). Setting `"none"` in `bkit.tracker.default` / `bkit.cloud.agent` silences it. The dependency updater, security scan and test lint are copy-and-own templates. The choices, the defaults and how to decide are in `.bkit/install.md` § Optional post-install decisions. The template catalog is in `.bkit/templates.md`.
+Two capabilities are opt-in and left out of the default install: the **issue tracker** (`--tracker=github|linear|jira`) and **cloud agents** (`--auto=claude|opencode|codex|cursor`). The default install ships zero cloud footprint. While a choice is undecided, its advisory fires (`tracker-setup-none` / `cloud-router-none`). Setting `"none"` in `bkit.tracker.default` / `bkit.cloud.agent` silences it. The dependency updater, security scan and test lint are copy-and-own templates. The choices, the defaults and how to decide are in `.bkit/install.md` § Optional post-install decisions. The template catalog is in `.bkit/templates.md`.
 
 ### Updater PRs against your workflows
 
@@ -355,7 +355,7 @@ There are three paths: a Linear comment (cloud), Claude (interactive, local) and
 
 **GitHub tracker:** a PR label triggers the run, through the Cursor Automations trigger "Pull request label changed". `bkit:auto` on the PR (from `bkit-build`) triggers dispatch, and the phase label (`bkit:plan`, `bkit:build`, etc.) selects the workflow. Issue comments go through the GitHub MCP. `/bkit-design` / `/bkit-plan` have no PR, so with the GitHub tracker they are local-IDE-only on Cursor cloud.
 
-**Requirements (Linear):** the `Auto` label and a non-terminal state. `BKIT_LINEAR_API_KEY`, `BKIT_CURSOR_API_KEY`, `BKIT_ANTHROPIC_API_KEY` and `BKIT_GH_TOKEN` in the Cursor Cloud Agent dashboard.
+**Requirements (Linear):** the `bkit:auto` label and a state that is not finished (judged by state category). `BKIT_LINEAR_API_KEY`, `BKIT_CURSOR_API_KEY`, `BKIT_ANTHROPIC_API_KEY` and `BKIT_GH_TOKEN` in the Cursor Cloud Agent dashboard.
 
 **Requirements (GitHub):** `BKIT_GH_TOKEN`, `BKIT_CURSOR_API_KEY` and `BKIT_ANTHROPIC_API_KEY` in the dashboard. The Cursor GitHub App on the repo/org. `GITHUB_ISSUE_ID` comes from the PR body's `<!-- bkit:issue=#NNN -->`, with no manual setup.
 
@@ -378,7 +378,7 @@ Claude reads the issue, its comments and the plan files through the tracker MCP.
 
 **Manual batch of held builds:** merge the held `feat/{FID}` branches into one branch off `dev` yourself, push it and open one PR. You own the push, the PR, the CI gate, the sweep and the docs sync. One head commit means post-merge auto-debug sees only the last FID. Never batch migrations.
 
-**Requirements:** `BKIT_GH_TOKEN` and an active Claude session (subscription or `BKIT_ANTHROPIC_API_KEY`). `BKIT_LINEAR_API_KEY` as well when `bkit.tracker.default = "linear"`, and `BKIT_JIRA_API_KEY` when it is `"jira"`. The session model is the orchestrator pin in `.bkit/prompts.md` § Orchestrators (`Claude` column). Set it with `/model` before you invoke a command. This file does not repeat the pin.
+**Requirements:** `BKIT_GH_TOKEN` and an active Claude session (subscription or `BKIT_ANTHROPIC_API_KEY`). `BKIT_LINEAR_API_KEY` as well when `bkit.tracker.default = "linear"`, and `BKIT_JIRA_API_KEY` when it is `"jira"`. A session that carries an issue id (`GITHUB_ISSUE_ID`) is guarded: it stops when the issue lost `bkit:auto` or is finished, on GitHub, Linear and Jira. A session with no issue id is unguarded. The session model is the orchestrator pin in `.bkit/prompts.md` § Orchestrators (`Claude` column). Set it with `/model` before you invoke a command. This file does not repeat the pin.
 
 ### From Cursor (interactive — local)
 
diff --git a/.bkit/core/.bkit/cloud.md b/.bkit/core/.bkit/cloud.md
index af8a8e904..38ff0c40b 100644
--- a/.bkit/core/.bkit/cloud.md
+++ b/.bkit/core/.bkit/cloud.md
@@ -3,7 +3,7 @@
 {{BKIT_MANAGED_MARKER}}
 
 > [!CAUTION]
-> **Purpose:** The canonical reference for Claude on the web (mobile / web), Codex Cloud, Cursor Cloud Agents and OpenCode cloud runners. Environments do not depend on the tracker: every generated `<host>/bkit-cloud.md` carries the same env block (`BKIT_GH_TOKEN` plus whatever `.envrc` resolves, tracker keys included) for any tracker. Dispatch pairs each agent with one tracker: Claude and OpenCode with GitHub (one unified `bkit-cloud.yml`), and Cursor with Linear. Jira and Codex Cloud have no bkit dispatch, so you launch those runs by hand (§ Cloud-agent support matrix).
+> **Purpose:** The canonical reference for Claude on the web (mobile / web), Codex Cloud, Cursor Cloud Agents and OpenCode cloud runners. Environments do not depend on the tracker: every generated `<host>/bkit-cloud.md` carries the same env block (`BKIT_GH_TOKEN` plus whatever `.envrc` resolves, tracker keys included) for any tracker. Any agent pairs with any wired tracker: Claude, OpenCode and Codex dispatch from one unified `bkit-cloud.yml` (one agent per run), and Cursor uses its native triggers. Codex Cloud tasks have no bkit dispatch, so you launch those runs by hand (§ Cloud-agent support matrix).
 >
 > **Rules:**
 >
@@ -19,19 +19,19 @@
 
 ## Cloud-agent support matrix (read first)
 
-Dispatch pairs each agent with one tracker, while the environments (`<host>/bkit-cloud.md`) work with any tracker. Pick the row for the agent you run:
+Every agent works with any wired tracker (GitHub, Linear or Jira), and the environments (`<host>/bkit-cloud.md`) work with any tracker. Install refuses only tracker `none`. Pick the row for the agent you run:
 
 <!-- prettier-ignore -->
-| Agent (the agent, not the editor) | Ways to launch a cloud agent | Tracker | not supported |
-| --- | --- | --- | --- |
-| **Claude** (terminal — any IDE host) | **A)** Claude iOS / desktop app → Claude-on-web env (`.claude/hooks/bkit-cloud-bootstrap.sh` + the env defined in `claude.ai/code`) · **B)** manual `workflow_dispatch` on `bkit-cloud.yml` (pick phase + issue) · **C)** GitHub CI pass / fail → `bkit-cloud.yml` claude job · **D)** `@claude` mention on a GitHub issue / PR (needs `/install-github-app`, the base requirement for `cloud=claude`) | GitHub | Linear |
-| **Codex** (Codex Cloud) | **A)** ChatGPT Codex → task on the env from `.codex/bkit-cloud.md` (manual; no bkit dispatch) | any (tracker MCP + env block) | bkit-triggered runs |
-| **Cursor** (native agent) | **A)** Cursor's built-in cloud-agent launch · **B)** Cursor's GitHub integration on PR events (CI pass / fail) · **C)** Linear → Cursor integration | Linear (+ GitHub PR events) | GitHub Projects / Issues |
-| **OpenCode** (GitHub runner) | **A)** manual `workflow_dispatch` on `bkit-cloud.yml` (pick phase + issue) · **B)** GitHub CI pass / fail → `bkit-cloud.yml` OpenCode job (requires `OPENCODE_PROVIDER_KEY` secret) · **C)** reactive `/oc` comment handler (self-installed, not bkit's: § Reactive comment handlers) | GitHub | Linear |
+| Agent (the agent, not the editor) | Ways to launch a cloud agent | not supported |
+| --- | --- | --- |
+| **Claude** (terminal — any IDE host) | **A)** Claude iOS / desktop app → Claude-on-web env (`.claude/hooks/bkit-cloud-bootstrap.sh` + the env defined in `claude.ai/code`) · **B)** manual `workflow_dispatch` on `bkit-cloud.yml` (pick phase + issue) · **C)** GitHub CI pass / fail → `bkit-cloud.yml` claude job · **D)** `@claude` mention on a GitHub issue / PR (needs `/install-github-app`, the base requirement for `cloud=claude`) | none |
+| **Codex** (Codex Cloud and GitHub runner) | **A)** ChatGPT Codex → task on the env from `.codex/bkit-cloud.md` (manual; no bkit dispatch) · **B)** manual `workflow_dispatch` on `bkit-cloud.yml` (pick phase + issue) · **C)** CI pass / fail → `bkit-cloud.yml` codex job (`openai/codex-action`; requires the `BKIT_OPENAI_API_KEY` secret; install with `--auto=codex --codex`) | Codex Cloud tasks started by bkit |
+| **Cursor** (native agent) | **A)** Cursor's built-in cloud-agent launch · **B)** Cursor's GitHub integration on PR events (CI pass / fail) · **C)** tracker integration (Cursor's Linear integration) | bkit-triggered runner jobs |
+| **OpenCode** (GitHub runner) | **A)** manual `workflow_dispatch` on `bkit-cloud.yml` (pick phase + issue) · **B)** GitHub CI pass / fail → `bkit-cloud.yml` OpenCode job (requires one provider `BKIT_` secret: `BKIT_OPENCODE_API_KEY`, `BKIT_OPENROUTER_API_KEY` or `BKIT_OLLAMA_API_KEY`) · **C)** reactive `/oc` comment handler (self-installed, not bkit's: § Reactive comment handlers) | none |
 
-**Unified file — additive coexistence:** Claude and OpenCode share one `bkit-cloud.yml`. A `context` job resolves the phase once, and two runner jobs follow, each gated at run time on its own credential: the claude job on the `ANTHROPIC_API_KEY` secret or the federation variables, and the OpenCode job on `OPENCODE_PROVIDER_KEY`. Both jobs can fire on the same CI event. With both credentials set, both agents run, and with one set, only that agent runs. Cursor is separate: it has no GitHub Action and uses its native triggers. Cursor cloud pairs with Linear.
+**Unified file — one agent per run:** Claude, OpenCode and Codex share one `bkit-cloud.yml`. A `context` job resolves the phase once and its `Select agent job` step reads `bkit.cloud.agent` from `package.json`. Only the job that names the recorded agent starts, and only when its `BKIT_` credential is set: the claude job on `BKIT_ANTHROPIC_API_KEY` or the federation variables, the opencode job on one provider `BKIT_` key, and the codex job on `BKIT_OPENAI_API_KEY`. A credential set for another agent is ignored, and the log names it. Cursor is separate: it has no GitHub Action and uses its native triggers.
 
-**Manual dispatch (Claude or OpenCode, path A):** GitHub → **Actions** → **bkit-cloud** → **Run workflow**, then pick `phase` (`ship` / `debug` / `design` / `plan` / `build`) and `issue`. Use it on demand, or as a smoke test, for `design` / `plan` / `build`. `ship` / `debug` normally fire from CI. A dispatched `design` runs headless (`runtimeHeadless` = true on a GitHub runner): Grill asks nothing, records each recommended answer as `Assumed, not confirmed`, and records the draft acceptance scenario as not reviewed by a human. A dispatched `/bkit-auto` orchestrator hands off to the matching phase skill, which takes its brief from the GitHub issue through the MCP.
+**Manual dispatch (Claude, OpenCode or Codex):** GitHub → **Actions** → **bkit-cloud** → **Run workflow**, then pick `phase` (`ship` / `debug` / `design` / `plan` / `build`) and `issue`. Use it on demand, or as a smoke test, for `design` / `plan` / `build`. `ship` / `debug` normally fire from CI. A dispatched `design` runs headless (`runtimeHeadless` = true on a GitHub runner): Grill asks nothing, records each recommended answer as `Assumed, not confirmed`, and records the draft acceptance scenario as not reviewed by a human. A dispatched `/bkit-auto` orchestrator hands off to the matching phase skill, which takes its brief from the GitHub issue through the MCP.
 
 ### Reactive comment handlers (`claude.yml` + `opencode.yml`) — separately managed, not bkit
 
@@ -43,7 +43,7 @@ Dispatch pairs each agent with one tracker, while the environments (`<host>/bkit
 | `.github/workflows/claude.yml` | `/install-github-app` (Claude CLI → official Claude GitHub App) | OIDC as the App (`bkit-cloud.yml` grants `id-token: write`; no App installed → OIDC error at boot) | comment `@claude /bkit-plan` (or any phase) on an issue / PR |
 | `.github/workflows/opencode.yml` | `opencode github install` (OpenCode CLI) | your provider key (`BKIT_OPENCODE_API_KEY` / `BKIT_OPENROUTER_API_KEY` / etc.) — no App, no OIDC | comment `/oc` or `/opencode` on an issue / PR |
 
-You maintain these files, not bkit. `opencode.yml` hardcodes a `model:` and a provider-secret `env:`. Keep both in sync with your installed OpenCode provider. `bkit check` and postinstall raise a non-fatal advisory when they drift. Fix the file by hand, because bkit will not rewrite it. `claude.yml` has no equivalent check, because its `@claude` handler is fixed to Claude as its provider. For Claude, the `@claude` path is the base requirement for `cloud=claude`. Enable it with `bkit install --auto=claude`, which works with the GitHub tracker only. The App also gives the runner a GitHub identity for the `mcp__github__*` surface.
+You maintain these files, not bkit. `opencode.yml` hardcodes a `model:` and a provider-secret `env:`. Keep both in sync with your installed OpenCode provider. `bkit check` and postinstall raise a non-fatal advisory when they drift. Fix the file by hand, because bkit will not rewrite it. `claude.yml` has no equivalent check, because its `@claude` handler is fixed to Claude as its provider. For Claude, the `@claude` path is the base requirement for `cloud=claude`. Enable it with `bkit install --auto=claude`. The App also gives the runner a GitHub identity for the `mcp__github__*` surface.
 
 ## What lives where (orient first)
 
@@ -392,6 +392,24 @@ BKIT_GH_TOKEN=<PAT — fine-grained for one owner, classic across owners; same p
 3. `sessionStart` fires `bkit-preflight.sh`. With `failClosed: true`, a non-zero exit hard-stops the agent before work.
 4. Preflight skips IDE sessions (`is_background_agent !== true`), so the local Cursor IDE is unaffected.
 
+## Session guard per tracker
+
+`.cursor/hooks/bkit-preflight.sh` (Cursor background sessions) and `.claude/hooks/bkit-preflight.sh` (Claude sessions that carry `GITHUB_ISSUE_ID`) share one tracker part, `preflight-tracker.sh`. It stops the session when the issue lost `bkit:auto` or is finished, judged by the tracker's state category (the `terminal` fact of `bkit issues fetch`), not by a state name:
+
+- **GitHub:** the issue's labels and open / closed state.
+- **Linear:** the issue's labels and state type (`completed` or `canceled` is finished). Needs `BKIT_LINEAR_API_KEY`.
+- **Jira:** the issue's labels and status category (`Done` is finished). Needs `BKIT_JIRA_API_KEY`. On Cursor, the guard hard-stops when the `bkit` binary is not present at `sessionStart`.
+
+A session that carries no issue id is unguarded: the guard prints a line saying so and exits 0. Codex Cloud tasks are unguarded, because hooks there are unproven (§ Codex Cloud → Hooks in cloud tasks).
+
+## Not yet verified live
+
+These paths are built and covered by recorded-reply or fixture tests, and have not run against a live service. Report a failure through `/bkit-debug`:
+
+- Linear and Jira router dispatch (the `context` job label read, not yet verified live).
+- The codex router job (`openai/codex-action` dispatch with `BKIT_OPENAI_API_KEY`, not yet verified live).
+- The Cursor Jira guard, with the `bkit` binary present at `sessionStart` (not yet verified live).
+
 ## Required env vars (Cursor side)
 
 Set these in the Cloud Agents dashboard (`cursor.com/dashboard/cloud-agents` → your environment → **Secrets** tab) as **Runtime Secret**s (loaded as env vars, redacted from the agent's transcript), not in `.cursor/environment.json`:
@@ -479,9 +497,10 @@ The routing logic lives in a single bkit-managed slash-command orchestrator (`.b
 <!-- prettier-ignore -->
 |  | Lives in the repo (bkit-managed) | Lives in the online dashboard / GitHub (manual, one-time) |
 | --- | --- | --- |
-| **Claude** | `.github/workflows/bkit-cloud.yml` — `claude` job (opt-in via `bkit install --auto=claude`; GitHub-tracker only). Two-tier gate: (1) free tier — job `if: contains(head_commit.message, 'bkit [auto route]')` (zero runner minutes for non-opted-in commits); (2) cheap tier — in-job `gh issue view {ISSUE} --json labels` re-checks `bkit:auto` (live kill switch); then dispatches `claude-code-action` as the Claude GitHub App (OIDC, `id-token: write`). | Claude credential: GitHub repo secret `ANTHROPIC_API_KEY` (`.bkit/.env` holds the same value as `BKIT_ANTHROPIC_API_KEY`) or keyless federation repo variables (§ Claude — workload identity federation). Claude GitHub App required (`/install-github-app`). The linked **GitHub issue** must carry `bkit:auto`. |
+| **Claude** | `.github/workflows/bkit-cloud.yml` — `claude` job (opt-in via `bkit install --auto=claude`; any wired tracker). Two-tier gate: (1) free tier — job `if: contains(head_commit.message, 'bkit [auto route]')` (zero runner minutes for non-opted-in commits); (2) cheap tier — the `context` job reads the issue's labels through `bkit issues fetch` on the tracker the repo records and re-checks `bkit:auto` (live kill switch); then dispatches `claude-code-action` as the Claude GitHub App (OIDC, `id-token: write`). | Claude credential: GitHub repo secret `BKIT_ANTHROPIC_API_KEY` (the same name `.bkit/.env` uses) or keyless federation repo variables (§ Claude — workload identity federation). Claude GitHub App required (`/install-github-app`). The linked tracker issue must carry `bkit:auto`. |
 | **Cursor** | Nothing — Cursor cloud agents have native triggers. | Cursor → Cloud Agents dashboard → Triggers → + Add trigger. Event: CI workflow completion on `feat/**` branches. Prompt (paste literally, no edits): `/bkit-auto $CI_STATUS $PR_NUMBER`. Concurrency: latest-supersedes. |
-| **OpenCode** | Same `.github/workflows/bkit-cloud.yml` — `opencode` job (opt-in via `bkit install --auto=opencode`; GitHub-tracker only). Same two-tier gate (same file, separate job). Dispatches via `opencode run "/bkit-auto $PHASE $ARG"`. No `id-token: write` — no OIDC; uses `github.token` for repo ops. | GitHub repo secret: `OPENCODE_PROVIDER_KEY` (set to your provider API key). Provider model committed in `.opencode/opencode.json`. The linked **GitHub issue** must carry `bkit:auto`. |
+| **OpenCode** | Same `.github/workflows/bkit-cloud.yml` — `opencode` job (opt-in via `bkit install --auto=opencode`; any wired tracker). Same two-tier gate (same file, separate job). Dispatches via `opencode run "/bkit-auto $PHASE $ARG"`. No `id-token: write` — no OIDC; uses `github.token` for repo ops. | GitHub repo secret: the installed provider's `BKIT_` key (`BKIT_OPENCODE_API_KEY`, `BKIT_OPENROUTER_API_KEY` or `BKIT_OLLAMA_API_KEY`). Provider model committed in `.opencode/opencode.json`. The linked tracker issue must carry `bkit:auto`. |
+| **Codex** | Same `.github/workflows/bkit-cloud.yml` — `codex` job (opt-in via `bkit install --auto=codex --codex`; any wired tracker). Same two-tier gate (same file, separate job). Dispatches `/bkit-auto $PHASE $ARG` through `openai/codex-action` with `sandbox: danger-full-access` (the runner is the sandbox) and a codex-home that trusts the workspace. | GitHub repo secret: `BKIT_OPENAI_API_KEY`. The linked tracker issue must carry `bkit:auto`. |
 
 **Why the dashboard prompt never needs re-pasting:** Cursor substitutes `$CI_STATUS` and `$PR_NUMBER` from the event payload at dispatch, so the pasted string is generic and timeless. When bkit's routing logic evolves, only the mirrored `.cursor/commands/bkit-auto.md` changes, and the dashboard stays untouched.
 
@@ -505,18 +524,39 @@ Flip the setting on both the org and the repo before the first router run. Other
 <!-- prettier-ignore -->
 | Secret / variable | Job | Why | Scope |
 | --- | --- | --- | --- |
-| `ANTHROPIC_API_KEY` secret | `claude` | `claude-code-action` authenticates against Anthropic. | API key with Claude access. Omit when using federation. |
+| `BKIT_ANTHROPIC_API_KEY` secret | `claude` | `claude-code-action` authenticates against Anthropic. | API key with Claude access. Omit when using federation. |
 | `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` variables | `claude` | Keyless alternative: the action trades the job's GitHub OIDC token for a short-lived Claude API token. | IDs, not secrets — repo **variables**. Optional `ANTHROPIC_SERVICE_ACCOUNT_ID` / `ANTHROPIC_WORKSPACE_ID`. § Claude — workload identity federation. |
-| `OPENCODE_PROVIDER_KEY` | `opencode` | Fanned out to every cloud provider's env var name (`BKIT_OPENROUTER_API_KEY`, `BKIT_OLLAMA_API_KEY`, `BKIT_OPENCODE_API_KEY`) so the `.opencode/opencode.json` `{env:VAR}` reference resolves whichever provider is installed. | Provider API key for whichever provider you configured. |
+| `BKIT_OPENCODE_API_KEY` / `BKIT_OPENROUTER_API_KEY` / `BKIT_OLLAMA_API_KEY` secret | `opencode` | The job passes each provider key under its own name, so the `.opencode/opencode.json` `{env:VAR}` reference resolves whichever provider is installed. | Set the key of the provider you configured. |
+| `BKIT_OPENAI_API_KEY` secret | `codex` | `openai/codex-action` authenticates against OpenAI. | OpenAI API key. |
+| `BKIT_LINEAR_API_KEY` secret | `context`, agent jobs | The label read and the agent's tracker verbs under `bkit.tracker.default` = `linear`. | Linear API key; step-scoped, never job-wide. |
+| `BKIT_JIRA_API_KEY` secret | `context`, agent jobs | Same, under `bkit.tracker.default` = `jira` (Jira needs the key only; site and email come from `package.json`). | Jira API token; step-scoped. |
+
+A `context` job (`Check runner credentials` and `Select agent job` steps) checks the credentials and resolves the phase + arg once. It reads the issue id from the branch or commit through `bkit fids parse` and the `bkit:auto` label through `bkit issues fetch`, both from the consumer's own bkit installed from its lockfile, on whichever tracker `bkit.tracker.default` names (GitHub, Linear or Jira). Each runner job needs `context`, and exactly one starts: the one `bkit.cloud.agent` names, when its credential is set.
+
+- The Claude credential is `BKIT_ANTHROPIC_API_KEY`, or both federation variables. With only one of the two variables set, the job prints a `::notice::` naming the missing one, and the claude job does nothing.
+- Recorded agent `claude`, `opencode` or `codex` with its credential set → only that job runs.
+- Recorded agent with no credential → nothing starts; the log names the missing secret.
+- Recorded agent `cursor` or none → no router job starts.
+- A credential set for another agent is ignored, and the log lists it.
+
+The tracker keys are read at step scope, never job-wide. The workflow grants `id-token: write` per job, for claude only (Claude GitHub App + federation token exchange). OpenCode and Codex have no OIDC.
 
-A `context` job (`Check runner credentials` step) checks both credentials and resolves the phase + arg once. It does nothing unless `package.json` `bkit.tracker.default` is `github` or unset, because Linear cloud runs start from Cursor's Linear integration and Jira runs locally only. Each runner job needs it, and runs only when its own credential is set:
+**Codex runner notes:** the `drop-sudo` step in `openai/codex-action` is irreversible, so a reused self-hosted runner loses sudo for later jobs: use an ephemeral runner. The action puts its own Node 24 on PATH. The job runs unguarded diffs (`sandbox: danger-full-access`), because the runner is the sandbox and the phase needs git, network and the repo's dependencies. Repo dependencies install before the action.
 
-- The Claude credential is `ANTHROPIC_API_KEY`, or both federation variables. With only one of the two variables set, the job prints a `::notice::` naming the missing one, and the claude job does nothing.
-- Only the claude credential set → only the claude job runs.
-- Only `OPENCODE_PROVIDER_KEY` set → only the OpenCode job runs.
-- Both set → both jobs run (additive coexistence).
+**Gate outcomes (log and job summary):** the `context` job writes one `### bkit-cloud gate` row (`tracker | issue | verdict | reason | jobs`) and a log line. Every unreadable outcome starts no agent and exits green.
+
+<!-- prettier-ignore -->
+| Verdict / reason | Cause | Action |
+| --- | --- | --- |
+| `pass` | The issue carries `bkit:auto`. | None. |
+| `label-absent` | The issue lost `bkit:auto` (kill switch). | Re-add the label to resume. |
+| `no-issue` | No tracker issue is recorded for the run. | Link the issue (`bkit:fid=` marker or branch FID). |
+| `no-agent` | `bkit.cloud.agent` names no router job, or its credential is missing; the `jobs` column names the missing secret. | Set the named `BKIT_` secret, or run `bkit install --auto=<agent>`. |
+| `unreadable` `bkit-unavailable` | `node_modules/.bin/bkit` is absent: the lockfile install failed. | Fix the install step. |
+| `unreadable` `reason=auth` | The tracker refused the read; the line names the secret (`BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY` or `GH_TOKEN`) and whether it is set. | Rotate or set that secret. |
+| `unreadable` `reason=<other>` / `exit-<N>` / `output-unparseable` | Service down, issue not found, or output the router cannot parse. | Re-run once the tracker answers. |
 
-No `BKIT_LINEAR_API_KEY` is needed, because `bkit-cloud.yml` is GitHub-tracker only for both jobs. The workflow grants `id-token: write` per job, for claude only (Claude GitHub App + federation token exchange). OpenCode has no OIDC.
+The codex job writes a `### bkit-cloud codex` summary row: the action outcome, commits and comments landed since it started (`-` when unknown).
 
 ## Claude — workload identity federation
 
@@ -569,8 +609,8 @@ The slash command takes two args: `$CI_STATUS` in `success|failure|pass|fail` (n
 1. With a PR-number arg, it reads `gh pr view $ARG` for `headRefName`, `headRefOid`, `state`, and refuses non-open PRs. With a slug arg, it skips the PR lookup entirely.
 2. It extracts `{FID}` from the head branch (`feat/{FID}` convention). With a slug arg, `{ARG}` is the `{FID}`, allowlist-asserted before use. On the `dev` surface the workflow recovers it from the squash-merge commit scope (`feat({FID}): …`, tracker-agnostic), and falls back to the linked PR body's `bkit:fid=` marker. If either path fails → no-op, no dispatch.
 3. Stale-run guard. Pre-merge, it compares the latest CI run's `headSha` against the PR's current `headRefOid`. Post-merge on `dev`, it compares the most recently completed `dev` CI run's `headSha` against the triggering run's head SHA. A `git rev-parse origin/dev` comparison would mismatch on every legitimate dispatch, because ship's terminal close commit lands on `dev` while that CI run is still going. Close commits carry `[skip ci]`, so they never trigger CI and never become that most-recent-completed head. An empty run list fails open (dispatches).
-4. Opt-in gate: it refuses dispatch unless the linked GitHub issue carries the `bkit:auto` label.
-5. It appends a `bkit-auto → /bkit-{ship,debug}` line to the GitHub issue / PR comment thread.
+4. Opt-in gate: it refuses dispatch unless the linked tracker issue (GitHub, Linear or Jira) carries the `bkit:auto` label.
+5. It appends a `bkit-auto → /bkit-{ship,debug}` line to the issue / PR comment thread.
 6. It invokes `/bkit-ship {FID}` (CI pass) or `/bkit-debug {FID} DEBUG_MODE=pr` (CI fail) through the `Skill` / `Task` tool. The dispatched skill owns the session lifecycle from there.
 
 Skip conditions emit a single GitHub-comment no-op line and exit 0. Only real failures (missing args, GitHub API unreachable, malformed state) take the Failure Path.
diff --git a/.bkit/core/.bkit/install.md b/.bkit/core/.bkit/install.md
index 53084e98a..8fa9f0eaa 100644
--- a/.bkit/core/.bkit/install.md
+++ b/.bkit/core/.bkit/install.md
@@ -117,7 +117,7 @@ bkit check
 - The CI workflow, the Vale config, the tool configs, the git hooks, the slop-scan type-suppression plugin (`scripts/slop/bkit-slop-type-suppression.mjs`), and the tool `package.json` scripts and devDeps are templates you copy from `.bkit/templates/` (`.bkit/templates.md`).
 - Core, implicit on every install, seeds the `bkit:gate:*` / `bkit:deps:*` scripts every workflow runs. It adds them only if missing, and never touches a name that is already present. Point their values at your stack (see `.bkit/README.md` § Required tools).
 
-**Opt-in flags:** `--tracker=github|linear|jira`, `--auto=claude|cursor|opencode` (cloud agents), `--opencode=<provider>` (additive OpenCode execution host: `openrouter`, `ollama`, `opencode-zen`, `opencode-go`). For dependency updaters, copy an example and own it. See [§ Optional post-install decisions](#optional-post-install-decisions).
+**Opt-in flags:** `--tracker=github|linear|jira`, `--auto=claude|opencode|codex|cursor` (cloud agents), `--opencode=<provider>` (additive OpenCode execution host: `openrouter`, `ollama`, `opencode-zen`, `opencode-go`). For dependency updaters, copy an example and own it. See [§ Optional post-install decisions](#optional-post-install-decisions).
 
 ### Payload view links — `.bkit/core` + `.bkit/shared`
 
@@ -187,10 +187,11 @@ bkit ships repo-side scaffolding for both cloud agents:
 
 You configure the online-dashboard half (the Claude env in `claude.ai/code`, the Cursor env vars in `Cursor → Settings → Background Agents`) once per machine / account.
 
-For post-CI auto-routing (ship-vs-debug after CI), bkit ships a single `.github/workflows/bkit-cloud.yml` template with two runtime-gated dispatch jobs, plus a `/bkit-auto` slash command that both clouds invoke from a single source:
+For post-CI auto-routing (ship-vs-debug after CI), bkit ships a single `.github/workflows/bkit-cloud.yml` template with one dispatch job per router agent, plus a `/bkit-auto` slash command that every cloud invokes from a single source. Only the job `bkit.cloud.agent` names starts, and only when its credential is set. The gate reads the `bkit:auto` label on the tracker the repo records (GitHub, Linear or Jira):
 
-- The **claude** job (`claude-code-action`) runs when the `ANTHROPIC_API_KEY` repo secret is set, or keyless through the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables.
-- The **OpenCode** job (`opencode run` CLI) runs when `OPENCODE_PROVIDER_KEY` is set.
+- The **claude** job (`claude-code-action`) runs when the `BKIT_ANTHROPIC_API_KEY` repo secret is set, or keyless through the `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` repo variables.
+- The **OpenCode** job (`opencode run` CLI) runs when the installed provider's `BKIT_` key is set.
+- The **codex** job (`openai/codex-action`) runs when `BKIT_OPENAI_API_KEY` is set.
 - Cursor wires the slash command through a dashboard trigger, with no GHA on the Cursor side.
 
 `bkit install --auto=opencode` requires `tracker=github`.
@@ -337,7 +338,7 @@ Two capabilities are opt-in, and a plain host / tooling install never wires them

<!-- prettier-ignore -->
 | Decision | Default | Opt-in command | Advisory when unset |
 | --- | --- | --- | --- |
 | **Issue tracker** | `none` (workflows run; tracker calls are no-ops) | `bkit install --tracker=github` (`BKIT_GH_TOKEN`) `--tracker=linear` (`BKIT_LINEAR_API_KEY`) or `--tracker=jira` (`BKIT_JIRA_API_KEY` + `bkit.tracker.jira.site` / `bkit.tracker.jira.project`) | `tracker-setup-none` |
-| **Cloud agents** | none (zero cloud footprint) | `bkit install --auto=claude\|cursor\|opencode` — records the choice and points at the copy-and-own templates: `.claude/hooks/bkit-cloud-bootstrap.sh` (claude), the `bkit-cloud.yml` (claude + OpenCode jobs, secret-gated) and the Cursor Dockerfile/environment.json | `cloud-router-none` |
+| **Cloud agents** | none (zero cloud footprint) | `bkit install --auto=claude\|opencode\|codex\|cursor` — records the choice and points at the copy-and-own templates: `.claude/hooks/bkit-cloud-bootstrap.sh` (claude), the `bkit-cloud.yml` (claude, OpenCode and codex jobs; the recorded agent's job runs when its secret is set) and the Cursor Dockerfile/environment.json | `cloud-router-none` |
 
 **Dependency updater.** Copy one example and own it.
 
@@ -366,8 +367,8 @@ There is no advisory, and `bkit tips` suggests it. Setup: `.bkit/templates.md` 
 
 - **Tracker** wires real credentials and MCP servers into workflows, so the consumer must choose the provider. bkit can't guess.
 - **Cloud agents** run through the phase-routed `bkit-cloud.yml` template plus the cloud env scaffolding (`.claude/hooks/bkit-cloud-bootstrap.sh`, and the `.cursor/Dockerfile` + `.cursor/environment.json` templates). The template auto-dispatches bkit-ship on CI pass and bkit-debug on CI fail, and runs design / plan / build only through `workflow_dispatch`.
-  - The workflow carries a claude job and an OpenCode job, each runtime-gated on its provider secret, so each is inert without its key. claude needs the `ANTHROPIC_API_KEY` repo secret or the federation repo variables (+ the Claude GitHub App). OpenCode needs `OPENCODE_PROVIDER_KEY`.
-  - Both need GitHub Actions write permissions, the GitHub tracker, and (for the Cursor half) a dashboard trigger, and the tracker itself is opt-in.
+  - The workflow carries a claude, an OpenCode and a codex job. Only the recorded agent's job starts, and it is inert without its key. claude needs the `BKIT_ANTHROPIC_API_KEY` repo secret or the federation repo variables (+ the Claude GitHub App). OpenCode needs its provider's `BKIT_` key. codex needs `BKIT_OPENAI_API_KEY`.
+  - Each needs GitHub Actions write permissions and a wired tracker (GitHub, Linear or Jira, with its `BKIT_` key under Linear / Jira); Cursor needs a dashboard trigger. The tracker itself is opt-in.
   - The env scaffolding is inert until the Claude / Cursor cloud env is wired in the dashboard.
   - Autonomous routing by default, wired to an unconfigured tracker, is the wrong default, so an install without `--auto` ships zero cloud footprint.
 
@@ -376,7 +377,7 @@ There is no advisory, and `bkit tips` suggests it. Setup: `.bkit/templates.md` 
 1. Run `bkit install --claude --cursor` (or whichever modules you want). If you have not decided yet, the post-install banner lists `tracker-setup-none`, `dep-updater-absent` and `cloud-router-none`.
 2. Pick a tracker: `bkit install --tracker=github` (or `linear` / `jira`). It needs no host flag, and it re-renders every installed host. The choice is persisted to `bkit.tracker.default`, and future installs preserve it (switching is free).
 3. Copy one updater example (table above). Land the Renovate config on the default branch before installing the App. The next `bkit install` / `bkit upgrade` sets `bkit.dependencies.updater` to it.
-4. Enable cloud agents: `bkit install --auto=claude|cursor|opencode`. The choice is persisted to `bkit.cloud.agent`, and install prints the secrets + permissions + dashboard checklist (`bkit-auto-setup`). The shipped `bkit-cloud.yml` carries a claude job (`ANTHROPIC_API_KEY` repo secret or federation repo variables, see `.bkit/cloud.md` § Claude — workload identity federation) and an OpenCode job (`OPENCODE_PROVIDER_KEY`), each runtime-gated.
+4. Enable cloud agents: `bkit install --auto=claude|opencode|codex|cursor` (codex also needs `--codex`). The choice is persisted to `bkit.cloud.agent`, and install prints the secrets + permissions + dashboard checklist (`bkit-auto-setup`). The shipped `bkit-cloud.yml` carries a claude job (`BKIT_ANTHROPIC_API_KEY` repo secret or federation repo variables, see `.bkit/cloud.md` § Claude — workload identity federation), an OpenCode job (the provider's `BKIT_` key) and a codex job (`BKIT_OPENAI_API_KEY`); only the recorded agent's job starts.
 5. **To opt out and silence the nudge**, set the field to `"none"` in `package.json` (`bkit.tracker.default` / `bkit.dependencies.updater` / `bkit.cloud.agent`). The advisory then stays quiet. The `""` that install seeds means undecided, and keeps the nudge.
 
 To reverse the tracker or cloud-agent choice, re-run install with the other flag. Updater files stay until you delete them.
@@ -416,7 +417,7 @@ bkit doctor
 
 Use `bkit doctor` to:
 
-- Check that `BKIT_GH_TOKEN` is present in the shell (GitHub MCP auth), and check the cloud-router claude credential (`ANTHROPIC_API_KEY` repo secret or federation repo variables). It also flags a key shadowing federation, and an adopted `bkit-cloud.yml` too old for federation.
+- Check that `BKIT_GH_TOKEN` is present in the shell (GitHub MCP auth), and check the cloud-router credential of the recorded agent (claude: `BKIT_ANTHROPIC_API_KEY` repo secret or federation repo variables; opencode: a provider `BKIT_` key; codex: `BKIT_OPENAI_API_KEY`). It also flags a key shadowing federation, a secret still under its old name, and an adopted `bkit-cloud.yml` older than the shipped router.
 - Surface the `bkit-version-pin-stale` advisory (installed version ahead of `.bkit/version`).
 - Preview all the advisories `bkit install` would show after install, without triggering writes.
 - Verify the environment is ready before `bkit install` on a new machine.
diff --git a/.bkit/core/.bkit/pipeline.md b/.bkit/core/.bkit/pipeline.md
index ee6eda5ce..b7776f6fe 100644
--- a/.bkit/core/.bkit/pipeline.md
+++ b/.bkit/core/.bkit/pipeline.md
@@ -39,7 +39,7 @@ Each phase below lists its subagents in the order they run. "Parallel" means the
 │ workflow_dispatch        → ship|debug|design|plan|build                │
 │ Dispatches the matching /bkit-* skill — runs unattended in cloud       │
 │ (Claude on the web / Cursor cloud agents / OpenCode).                    │
-│ Opt-in: `bkit install --auto=claude|cursor|opencode`. See `.bkit/cloud.md`. │
+│ Opt-in: `bkit install --auto=claude|opencode|codex|cursor`. See `.bkit/cloud.md`. │
 └────────────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
diff --git a/.bkit/core/.bkit/providers.md b/.bkit/core/.bkit/providers.md
index dbd279157..7ff1b3843 100644
--- a/.bkit/core/.bkit/providers.md
+++ b/.bkit/core/.bkit/providers.md
@@ -306,7 +306,7 @@ Per-action gates on all five hosts, subagents included. This section is an overv
 | `guardrails-shell.js` | Claude, Codex, Antigravity, Cursor `guardrails` | shell parsing (`shellSegments`, `shellWords`, `commandWords`, `commandLines`: `sh -c` scripts, `$(…)`, backticks, `( … )`), curl / wget host allowlist (`.bkit/allowlist.json` located from `hookDirs(payload)`), shell-as-edit-channel detection (quote-aware redirects) |
 | `guardrails-tiers.js` | Codex, Antigravity, Cursor `guardrails` | git parsing (`parseGit`), deny + ask rules, `secretFileKind`, shell secret-read detection, `classifyShell` precedence |
 | `guardrails-read.js` | Antigravity, Cursor `guardrails` | `classifyRead` over `secretFileKind`: deny `*.pem` / `*.p12` / `id_rsa`, ask `.env` / `.env.*` (not `.env.example`) |
-| `preflight-tracker.sh` | Claude, Cursor `preflight` | Tracker guard: GitHub (REST) and Linear (GraphQL) key / issue checks, `bkit:auto` + terminal-by-category guards |
+| `preflight-tracker.sh` | Claude, Cursor `preflight` | Tracker guard: GitHub (REST), Linear (GraphQL) and Jira (`bkit issues fetch`) key / issue checks, `bkit:auto` + terminal-by-category guards; a session with no issue id is unguarded |
 | `preflight-rules.sh` | Claude, Cursor `preflight` | the rules-read advisory sentence and its `emit_context` call, merged into the one SessionStart JSON document |
 | `session-rules-advisory.js` | Codex, Antigravity, OpenCode `rules` | the rules-read advisory sentence plus the once-per-session helper (`rulesReadAdviceOnce`, per-user OS-temp state, 24h GC) |
 
@@ -575,7 +575,7 @@ bkit ships no default: the setting also hides each person's own connectors (mail
 | Default network | `Trusted` allowlist (npm, GitHub, PyPI, Docker Hub, vale tarball) | **Internet access**: package-manager domains + **Additional allowed domains** (`*.` entries untested), or all public internet | Outbound open in the sandbox |
 | Reusable across repos | Setup script yes (generic snapshot); environment no — one per repo (secrets / PAT scope are per-repo) | Install script yes; environment one per repo; **Personal vault** shares chosen secrets | No — Dockerfile per repo (copied from the bkit template and owned by the repo) |
 | Secrets | Env vars in Claude app (plaintext; rotate PATs) | **Environment variables**; **Network secrets** = proxy-substituted, HTTP-only | Cursor Cloud env vars (Settings → Background Agents → Environment Variables) |
-| Linear preflight + rules advisory | `.claude/hooks/bkit-preflight.sh` (SessionStart, non-blocking — one document carrying the rules-read advisory always, plus the guard's `additionalContext` HARD STOP when a tracker issue id is set) | `.codex/hooks/bkit-rules.cjs` advisory — unproven in cloud tasks | `.cursor/hooks/bkit-preflight.sh` (`sessionStart`, `failClosed: true`, blocks on non-zero; the same advisory + guard document) |
+| Tracker preflight + rules advisory | `.claude/hooks/bkit-preflight.sh` (SessionStart, non-blocking — one document carrying the rules-read advisory always, plus the guard's `additionalContext` HARD STOP when a tracker issue id is set) | `.codex/hooks/bkit-rules.cjs` advisory — unproven in cloud tasks; no tracker guard (Codex Cloud is unguarded). Router: `bkit install --auto=codex --codex` adds the `codex` job in `bkit-cloud.yml` (`openai/codex-action`, `BKIT_OPENAI_API_KEY`) | `.cursor/hooks/bkit-preflight.sh` (`sessionStart`, `failClosed: true`, blocks on non-zero; the same advisory + guard document) |
 
 **Install behaviour:** template drops, with project tokens filled at install. bkit aligns all clouds on vale 3.9.1, pnpm (corepack-pinned `package.json#packageManager`) and the gh CLI. See `.bkit/cloud.md` for the paste-in recipe and the sharing pattern.
 
diff --git a/.bkit/core/.bkit/templates.md b/.bkit/core/.bkit/templates.md
index e0ca95a3f..d9f78c1e1 100644
--- a/.bkit/core/.bkit/templates.md
+++ b/.bkit/core/.bkit/templates.md
@@ -269,13 +269,16 @@ A post-CI router that runs bkit workflows:
 - Failed `dev` CI → `/bkit-debug {FID}`.
 - `workflow_dispatch` runs any phase.
 
-A `context` job resolves the phase and argument once. Then two runner jobs follow, each skipped without its secret: `claude` (`claude-code-action`, https://github.com/anthropics/claude-code-action) and `opencode` (`opencode run`, https://opencode.ai/docs/github/). `bkit install --auto=claude|opencode` points at this file. The full recipe is in `.bkit/cloud.md` § Post-CI auto-routing.
+A `context` job resolves the phase and argument once. Then three runner jobs follow, and only the one `bkit.cloud.agent` names starts, when its secret is set: `claude` (`claude-code-action`, https://github.com/anthropics/claude-code-action), `opencode` (`opencode run`, https://opencode.ai/docs/github/) and `codex` (`openai/codex-action`, https://github.com/openai/codex-action). `bkit install --auto=claude|opencode|codex` points at this file. The full recipe is in `.bkit/cloud.md` § Post-CI auto-routing.
 
-- Install: `bkit install --auto=claude` (points at the `.claude/hooks/bkit-cloud-bootstrap.sh` template) or `--auto=opencode` (needs `--opencode=<provider>` first). Both need `--tracker=github`.
-- Secrets for `claude`: `ANTHROPIC_API_KEY`, or keyless with the `ANTHROPIC_FEDERATION_RULE_ID` and `ANTHROPIC_ORGANIZATION_ID` repo variables, plus the Claude GitHub App (`/install-github-app`).
-- Secrets for `opencode`: `OPENCODE_PROVIDER_KEY`.
+- Install: `bkit install --auto=claude` (points at the `.claude/hooks/bkit-cloud-bootstrap.sh` template), `--auto=opencode` (needs `--opencode=<provider>` first) or `--auto=codex` (needs `--codex`). Each works with any wired tracker (GitHub, Linear or Jira).
+- Secrets for `claude`: `BKIT_ANTHROPIC_API_KEY`, or keyless with the `ANTHROPIC_FEDERATION_RULE_ID` and `ANTHROPIC_ORGANIZATION_ID` repo variables, plus the Claude GitHub App (`/install-github-app`).
+- Secrets for `opencode`: the installed provider's key, one of `BKIT_OPENCODE_API_KEY`, `BKIT_OPENROUTER_API_KEY`, `BKIT_OLLAMA_API_KEY`.
+- Secrets for `codex`: `BKIT_OPENAI_API_KEY`.
+- Tracker secrets: `BKIT_LINEAR_API_KEY` under Linear, `BKIT_JIRA_API_KEY` under Jira. The workflow reads them at step scope.
 - Repo Actions permissions: read and write, with PR creation allowed.
-- Adapt: `{{CLOUD_RUNNER}}` in all three jobs.
+- Adapt: `{{CLOUD_RUNNER}}` in all four jobs.
+- The `codex` job runs `drop-sudo` on the runner (irreversible), so use an ephemeral runner.
 - Traps:
   - The file runs bkit by command name, so a changed invocation reaches you only as a changed template path on `bkit upgrade`. Diff it on every upgrade.
   - The OpenCode install version is a plain argument. The `# renovate:` comment above it lets the example `renovate.json5` bump it.
@@ -623,7 +626,7 @@ The PyPI name is `serena-agent`, and the CLI is `serena`. PyPI `serena` is an un
 
 ## Issue forms — `.github/ISSUE_TEMPLATE/`
 
-Issues are the first input every workflow reads. There is one form per way work starts, and each form's intro names its next command. The section names, syntax and machine-read lines are in `.bkit/trackers.md` § Issue shapes. The forms are for the GitHub tracker only, because Linear and Jira have their own templates. Reference: https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms.
+Issues are the first input every workflow reads. There is one form per way work starts, and each form's intro names its next command. The section names, syntax and machine-read lines are in `.bkit/trackers.md` § Issue shapes. These forms serve the GitHub tracker alone, because Linear and Jira have their own templates. Reference: https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms.
 
 <!-- prettier-ignore -->
 | Form | Use when | Next step | Asks for |
diff --git a/.bkit/core/engine/checks/tips/catalogue.test.ts b/.bkit/core/engine/checks/tips/catalogue.test.ts
index 131488f61..e33182015 100644
--- a/.bkit/core/engine/checks/tips/catalogue.test.ts
+++ b/.bkit/core/engine/checks/tips/catalogue.test.ts
@@ -9,7 +9,13 @@ import { buildTrackerSetupAdvisory } from "../after/github";
 import { buildDepUpdaterSetupAdvisory } from "../after/tools";
 import { COMPLY_PHASES, TIPS_CONTEXTS } from "../../cli";
 import { ALL_WORKFLOWS, EVERY_CONTEXT, SETUP_TIPS, type SetupTip } from "./catalogue";
-import { STAR_TIP_ID, dropTipSilencedAdvisories, isTipSilenced, orderForWorkflow } from "./index";
+import {
+  STAR_TIP_ID,
+  collectTips,
+  dropTipSilencedAdvisories,
+  isTipSilenced,
+  orderForWorkflow,
+} from "./index";
 import type { PreflightFinding } from "../before/index";
 
 const tip = (id: string): SetupTip => SETUP_TIPS.find((t) => t.id === id)!;
@@ -354,6 +360,33 @@ describe("SETUP_TIPS — detection", () => {
     expect(tip("cloud").fires(cwd)).toBe(false);
   });
 
+  it("cloud tip names the Claude GitHub App and BKIT_ANTHROPIC_API_KEY only for cloud.agent claude", () => {
+    const cloudText = (): string => {
+      const t = collectTips(cwd).tips.find((x) => x.id === "cloud")!;
+      return `${t.ask} ${t.steps}`;
+    };
+    pkg({ cloud: { agent: "claude" } });
+    const claude = cloudText();
+    expect(claude).toContain("BKIT_ANTHROPIC_API_KEY");
+    expect(claude).toContain("Claude");
+    expect(claude).toContain("bkit-cloud-bootstrap.sh");
+    for (const agent of ["opencode", "codex", "cursor"]) {
+      pkg({ cloud: { agent } });
+      const variant = cloudText();
+      expect(variant, agent).not.toContain("BKIT_ANTHROPIC_API_KEY");
+      expect(variant, agent).not.toContain("bkit-cloud-bootstrap.sh");
+      expect(variant, agent).not.toMatch(/Claude (GitHub )?App/);
+    }
+  });
+
+  it("cloud tip for codex names --codex and BKIT_OPENAI_API_KEY", () => {
+    pkg({ cloud: { agent: "codex" } });
+    const t = collectTips(cwd).tips.find((x) => x.id === "cloud")!;
+    const text = `${t.ask} ${t.steps}`;
+    expect(text).toContain("--codex");
+    expect(text).toContain("BKIT_OPENAI_API_KEY");
+  });
+
   it("ci-workflow follows a renamed bkit.testing.ciWorkflow", () => {
     pkg({ testing: { ciWorkflow: "ci.yml" } });
     expect(tip("ci-workflow").fires(cwd)).toBe(true);
diff --git a/.bkit/core/engine/checks/tips/catalogue.ts b/.bkit/core/engine/checks/tips/catalogue.ts
index 18db71fd1..ffe4ba010 100644
--- a/.bkit/core/engine/checks/tips/catalogue.ts
+++ b/.bkit/core/engine/checks/tips/catalogue.ts
@@ -74,6 +74,8 @@ export interface SetupTip {
   ask: string;
   /** Where the agent finds the exact steps. */
   steps: string;
+  /** Per-repo `ask` / `steps`; `collectTips` applies it before returning the tip. */
+  resolve?: (cwd: string) => { ask: string; steps: string };
   /** False when no `bkit.advisories.ignore` entry may silence the tip. */
   silenceable?: false;
   /** Advisory ids this tip reuses the check of; a trailing `*` matches an id prefix. */
@@ -90,6 +92,37 @@ export const ALL_WORKFLOWS: readonly ComplyPhase[] = ["design", "plan", "build",
 /** Every `bkit tips --workflow=` context: the phase workflows, then the two agent closes. */
 export const EVERY_CONTEXT: readonly TipsContext[] = [...ALL_WORKFLOWS, "audit", "utility"];
 
+const CLOUD_STEPS = "`.bkit/cloud.md`; `.bkit/templates.md` § Cloud-agent workflow and § Cursor.";
+
+/** The `cloud` tip's `ask` / `steps` for the recorded `bkit.cloud.agent`. */
+function cloudTipText(agent: string): { ask: string; steps: string } {
+  const copy =
+    "copy .bkit/templates/.github/workflows/bkit-cloud.yml to .github/workflows/bkit-cloud.yml";
+  const tail = "then tell me which dashboard settings are left.";
+  switch (agent) {
+    case "claude":
+      return {
+        ask: `Check my cloud-agent setup against .bkit/cloud.md: install the Claude GitHub App on the repo, ${copy} and .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh to .claude/hooks/, run \`gh secret set BKIT_ANTHROPIC_API_KEY\` (or, keyless, \`gh variable set\` ANTHROPIC_FEDERATION_RULE_ID and ANTHROPIC_ORGANIZATION_ID from a Claude Console federation rule), ${tail}`,
+        steps: CLOUD_STEPS,
+      };
+    case "codex":
+      return {
+        ask: `Check my cloud-agent setup against .bkit/cloud.md: confirm bkit was installed with --codex, ${copy}, run \`gh secret set BKIT_OPENAI_API_KEY\`, ${tail}`,
+        steps: CLOUD_STEPS,
+      };
+    case "opencode":
+      return {
+        ask: `Check my cloud-agent setup against .bkit/cloud.md: ${copy}, set the opencode provider's BKIT_ API key as a repo secret (the name is in .bkit/cloud.md), ${tail}`,
+        steps: CLOUD_STEPS,
+      };
+    default:
+      return {
+        ask: `Check my cloud-agent setup against .bkit/cloud.md: copy .bkit/templates/.cursor/environment.json and .bkit/templates/.cursor/Dockerfile to .cursor/, ${tail}`,
+        steps: CLOUD_STEPS,
+      };
+  }
+}
+
 export const SETUP_TIPS: readonly SetupTip[] = [
   // --- current: is bkit itself up to date ---------------------------------------------
   {
@@ -259,8 +292,9 @@ export const SETUP_TIPS: readonly SetupTip[] = [
     title: "Finish cloud setup",
     line: "You've turned on cloud agents, but setup isn't finished, so cloud runs will stop partway. Finish the remaining steps.",
     why: "With cloud agents, bkit runs on its own: a change that passes its checks gets shipped and one that fails gets investigated, with nobody at the keyboard. That only works once every piece is in place.",
-    ask: "Check my cloud-agent setup against .bkit/cloud.md: copy .bkit/templates/.github/workflows/bkit-cloud.yml to .github/workflows/bkit-cloud.yml and .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh to .claude/hooks/ (for Cursor: .bkit/templates/.cursor/environment.json and .bkit/templates/.cursor/Dockerfile to .cursor/), run `gh secret set ANTHROPIC_API_KEY` (or, keyless, `gh variable set` ANTHROPIC_FEDERATION_RULE_ID and ANTHROPIC_ORGANIZATION_ID from a Claude Console federation rule), then tell me which dashboard settings are left.",
+    ask: "Check my cloud-agent setup against .bkit/cloud.md: copy .bkit/templates/.github/workflows/bkit-cloud.yml to .github/workflows/bkit-cloud.yml, set the agent's credential as a repo secret under its BKIT_ name, then tell me which dashboard settings are left.",
     steps: "`.bkit/cloud.md`; `.bkit/templates.md` § Cloud-agent workflow and § Cursor.",
+    resolve: (cwd) => cloudTipText(readBkitConfig(cwd).cloudAgents),
     fires: (cwd) => {
       const cloud = readBkitConfig(cwd).cloudAgents;
       if (cloud === "none") return false;
diff --git a/.bkit/core/engine/checks/tips/index.ts b/.bkit/core/engine/checks/tips/index.ts
index 6f5f9bc57..9d8e3f48b 100644
--- a/.bkit/core/engine/checks/tips/index.ts
+++ b/.bkit/core/engine/checks/tips/index.ts
@@ -124,7 +124,7 @@ export function collectTips(cwd: string, catalogue: readonly SetupTip[] = SETUP_
   for (const tip of catalogue) {
     if (!tip.fires(base)) continue;
     if (isTipSilenced(tip, ignored)) suppressed.push({ id: tip.id, scope: "." });
-    else tips.push(tip);
+    else tips.push(tip.resolve ? { ...tip, ...tip.resolve(base) } : tip);
   }
   const star = !ignored.has(STAR_TIP_ID) && !ignored.has(STAR_TIP_OLD_ID);
   return { tips, suppressed, star };
diff --git a/.bkit/core/engine/install/modules/opencode.ts b/.bkit/core/engine/install/modules/opencode.ts
index 542bbed8b..e9b521ea9 100644
--- a/.bkit/core/engine/install/modules/opencode.ts
+++ b/.bkit/core/engine/install/modules/opencode.ts
@@ -159,8 +159,9 @@ export function opencodeProviderEnvVar(providerKey: string): string {
  * secret `env:` var. `bkit install --opencode=<provider>` rewrites neither; this advisory names
  * the hand-edit.
  *
- * bkit-cloud.yml runs `opencode run` against the committed `.opencode/` config and fans one
- * `OPENCODE_PROVIDER_KEY` secret out to every provider env var, so it is not checked.
+ * bkit-cloud.yml runs `opencode run` against the committed `.opencode/` config and passes
+ * the provider's `BKIT_` secret (`BKIT_OPENCODE_API_KEY`, `BKIT_OPENROUTER_API_KEY` or
+ * `BKIT_OLLAMA_API_KEY`) under its own env var name, so it is not checked.
  *
  * No-op when opencode.yml is absent. No equivalent check for claude.yml (provider-fixed to
  * Claude). Severity "advisory": never gates `bkit check`; surfaces on both check and postinstall.
@@ -222,7 +223,7 @@ export function detectOpencodeYmlProviderDrift(cwd: string): PreflightFinding |
       "        model: " +
       expectedPrefix +
       "/<model>   # a model your provider serves (see .opencode/opencode.json)\n\n" +
-      "Keep opencode.yml in sync with .opencode/opencode.json on every provider switch. (bkit-cloud.yml needs no such edit: it reads .opencode/ and fans OPENCODE_PROVIDER_KEY out to every provider env var.)",
+      "Keep opencode.yml in sync with .opencode/opencode.json on every provider switch. (bkit-cloud.yml needs no such edit: it reads .opencode/ and passes the provider's BKIT_ secret under its own name.)",
   };
 }
 
diff --git a/.bkit/shared/docs/security.md b/.bkit/shared/docs/security.md
index 6a701f120..77e893c6e 100644
--- a/.bkit/shared/docs/security.md
+++ b/.bkit/shared/docs/security.md
@@ -19,7 +19,7 @@ Action SHA-pinning and the dependency-update pipeline (Renovate / Dependabot, Tr
 **Token isolation:**
 
 - Renovate PRs get a restricted `GITHUB_TOKEN`.
-- They have no access to the cloud lane's model-auth secrets (`secrets.ANTHROPIC_API_KEY` / `secrets.OPENCODE_PROVIDER_KEY`).
+- They have no access to the cloud lane's model-auth secrets (`secrets.BKIT_ANTHROPIC_API_KEY` / the provider `BKIT_` keys / `secrets.BKIT_OPENAI_API_KEY`).
 - They have no access to federated Claude tokens either. Only a `bkit-cloud.yml` job that matches the federation rule mints those.
 - `bkit-cloud.yml` does not dispatch on Renovate PRs.
 - As a result, a compromised dependency PR cannot reach agent API credentials.
diff --git a/dist/checks/tips/catalogue.js b/dist/checks/tips/catalogue.js
index 57fdf0537..efbf3e092 100644
--- a/dist/checks/tips/catalogue.js
+++ b/dist/checks/tips/catalogue.js
@@ -39,6 +39,34 @@ const hosts = (cwd) => detectInstalledHostModules(cwd);
 export const ALL_WORKFLOWS = ["design", "plan", "build", "debug", "ship"];
 /** Every `bkit tips --workflow=` context: the phase workflows, then the two agent closes. */
 export const EVERY_CONTEXT = [...ALL_WORKFLOWS, "audit", "utility"];
+const CLOUD_STEPS = "`.bkit/cloud.md`; `.bkit/templates.md` § Cloud-agent workflow and § Cursor.";
+/** The `cloud` tip's `ask` / `steps` for the recorded `bkit.cloud.agent`. */
+function cloudTipText(agent) {
+    const copy = "copy .bkit/templates/.github/workflows/bkit-cloud.yml to .github/workflows/bkit-cloud.yml";
+    const tail = "then tell me which dashboard settings are left.";
+    switch (agent) {
+        case "claude":
+            return {
+                ask: `Check my cloud-agent setup against .bkit/cloud.md: install the Claude GitHub App on the repo, ${copy} and .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh to .claude/hooks/, run \`gh secret set BKIT_ANTHROPIC_API_KEY\` (or, keyless, \`gh variable set\` ANTHROPIC_FEDERATION_RULE_ID and ANTHROPIC_ORGANIZATION_ID from a Claude Console federation rule), ${tail}`,
+                steps: CLOUD_STEPS,
+            };
+        case "codex":
+            return {
+                ask: `Check my cloud-agent setup against .bkit/cloud.md: confirm bkit was installed with --codex, ${copy}, run \`gh secret set BKIT_OPENAI_API_KEY\`, ${tail}`,
+                steps: CLOUD_STEPS,
+            };
+        case "opencode":
+            return {
+                ask: `Check my cloud-agent setup against .bkit/cloud.md: ${copy}, set the opencode provider's BKIT_ API key as a repo secret (the name is in .bkit/cloud.md), ${tail}`,
+                steps: CLOUD_STEPS,
+            };
+        default:
+            return {
+                ask: `Check my cloud-agent setup against .bkit/cloud.md: copy .bkit/templates/.cursor/environment.json and .bkit/templates/.cursor/Dockerfile to .cursor/, ${tail}`,
+                steps: CLOUD_STEPS,
+            };
+    }
+}
 export const SETUP_TIPS = [
     // --- current: is bkit itself up to date ---------------------------------------------
     {
@@ -199,8 +227,9 @@ export const SETUP_TIPS = [
         title: "Finish cloud setup",
         line: "You've turned on cloud agents, but setup isn't finished, so cloud runs will stop partway. Finish the remaining steps.",
         why: "With cloud agents, bkit runs on its own: a change that passes its checks gets shipped and one that fails gets investigated, with nobody at the keyboard. That only works once every piece is in place.",
-        ask: "Check my cloud-agent setup against .bkit/cloud.md: copy .bkit/templates/.github/workflows/bkit-cloud.yml to .github/workflows/bkit-cloud.yml and .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh to .claude/hooks/ (for Cursor: .bkit/templates/.cursor/environment.json and .bkit/templates/.cursor/Dockerfile to .cursor/), run `gh secret set ANTHROPIC_API_KEY` (or, keyless, `gh variable set` ANTHROPIC_FEDERATION_RULE_ID and ANTHROPIC_ORGANIZATION_ID from a Claude Console federation rule), then tell me which dashboard settings are left.",
+        ask: "Check my cloud-agent setup against .bkit/cloud.md: copy .bkit/templates/.github/workflows/bkit-cloud.yml to .github/workflows/bkit-cloud.yml, set the agent's credential as a repo secret under its BKIT_ name, then tell me which dashboard settings are left.",
         steps: "`.bkit/cloud.md`; `.bkit/templates.md` § Cloud-agent workflow and § Cursor.",
+        resolve: (cwd) => cloudTipText(readBkitConfig(cwd).cloudAgents),
         fires: (cwd) => {
             const cloud = readBkitConfig(cwd).cloudAgents;
             if (cloud === "none")
diff --git a/dist/checks/tips/index.js b/dist/checks/tips/index.js
index 3400b5589..472142d1d 100644
--- a/dist/checks/tips/index.js
+++ b/dist/checks/tips/index.js
@@ -94,7 +94,7 @@ export function collectTips(cwd, catalogue = SETUP_TIPS) {
         if (isTipSilenced(tip, ignored))
             suppressed.push({ id: tip.id, scope: "." });
         else
-            tips.push(tip);
+            tips.push(tip.resolve ? { ...tip, ...tip.resolve(base) } : tip);
     }
     const star = !ignored.has(STAR_TIP_ID) && !ignored.has(STAR_TIP_OLD_ID);
     return { tips, suppressed, star };
diff --git a/dist/install/modules/opencode.js b/dist/install/modules/opencode.js
index 81e71694d..3c38ba490 100644
--- a/dist/install/modules/opencode.js
+++ b/dist/install/modules/opencode.js
@@ -116,8 +116,9 @@ export function opencodeProviderEnvVar(providerKey) {
  * secret `env:` var. `bkit install --opencode=<provider>` rewrites neither; this advisory names
  * the hand-edit.
  *
- * bkit-cloud.yml runs `opencode run` against the committed `.opencode/` config and fans one
- * `OPENCODE_PROVIDER_KEY` secret out to every provider env var, so it is not checked.
+ * bkit-cloud.yml runs `opencode run` against the committed `.opencode/` config and passes
+ * the provider's `BKIT_` secret (`BKIT_OPENCODE_API_KEY`, `BKIT_OPENROUTER_API_KEY` or
+ * `BKIT_OLLAMA_API_KEY`) under its own env var name, so it is not checked.
  *
  * No-op when opencode.yml is absent. No equivalent check for claude.yml (provider-fixed to
  * Claude). Severity "advisory": never gates `bkit check`; surfaces on both check and postinstall.
@@ -174,7 +175,7 @@ export function detectOpencodeYmlProviderDrift(cwd) {
             "        model: " +
             expectedPrefix +
             "/<model>   # a model your provider serves (see .opencode/opencode.json)\n\n" +
-            "Keep opencode.yml in sync with .opencode/opencode.json on every provider switch. (bkit-cloud.yml needs no such edit: it reads .opencode/ and fans OPENCODE_PROVIDER_KEY out to every provider env var.)",
+            "Keep opencode.yml in sync with .opencode/opencode.json on every provider switch. (bkit-cloud.yml needs no such edit: it reads .opencode/ and passes the provider's BKIT_ secret under its own name.)",
     };
 }
 // Sentinel values used in the opencode.json template for tracker-filtered mcp injection.
diff --git a/docs/deployments.md b/docs/deployments.md
index 80b9f0a61..22238a005 100644
--- a/docs/deployments.md
+++ b/docs/deployments.md
@@ -662,23 +662,26 @@ Or Actions tab → CI → Run workflow → select branch. Same pattern as consum
 
 `pnpm bkit install` — all three phases. `pnpm bkit check` / `pnpm bkit doctor` — Phase 1 + 3; write only `.bkit/advisories.md`. `check` exits 1 on Tier-1 / Tier-2 drift. `pnpm bkit upgrade` — diff vs `canonicalHashes`; conflicts stderr (`--auto-apply` non-zero). Offline re-render at installed version; `--latest`/`--to=<version>` bump + re-exec atomically. Also re-renders output outside `.bkit/templates/` — host agents / commands + `.bkit/*.md` (`runBkitDocs`) per installed host (by `agents/` dir). Force-overwritten; `.bkit/prompts.md` markered — consumer overrides below `bkit:end` block-merge-preserved.
 
-### `bkit-cloud.yml` — dual-job cloud-agent lane
+### `bkit-cloud.yml` — cloud-agent lane (one agent per run)
 
-The `bkit-cloud.yml` template (`bkit install --auto=…` points at it; copy it to `.github/workflows/bkit-cloud.yml`) carries two runtime-gated dispatch jobs so one GitHub-tracker repo can run claude and OpenCode cloud agents from one file (additive):
+The `bkit-cloud.yml` template (`bkit install --auto=…` points at it; copy it to `.github/workflows/bkit-cloud.yml`) carries one dispatch job per router agent (claude, OpenCode, codex). A `context` job reads `bkit.cloud.agent` and starts only that agent's job, on any wired tracker (GitHub, Linear or Jira):
 
 <!-- prettier-ignore -->
 | Job | Dispatch | Gated on | LLM credential |
 | --- | --- | --- | --- |
-| `claude` | `claude-code-action` (OIDC via Claude GitHub App) | `context` job's `Check runner credentials` step sets `claude=true` when `ANTHROPIC_API_KEY` is non-empty or both `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` vars are; absent / one var alone → `::notice::… no-op` | `ANTHROPIC_API_KEY` secret, or workload identity federation (vars → OIDC exchange for a short-lived token; set key wins) |
-| `opencode` | `opencode run` CLI (installed in-job) | same step sets `opencode=true` only when `OPENCODE_PROVIDER_KEY` is non-empty; absent → no-op | `OPENCODE_PROVIDER_KEY` |
+| `claude` | `claude-code-action` (OIDC via Claude GitHub App) | `Select agent job` picks `claude` and the `Check runner credentials` step sets `claude=true`: `BKIT_ANTHROPIC_API_KEY` is non-empty or both `ANTHROPIC_FEDERATION_RULE_ID` + `ANTHROPIC_ORGANIZATION_ID` vars are; absent / one var alone → `::notice::… no-op` | `BKIT_ANTHROPIC_API_KEY` secret, or workload identity federation (vars → OIDC exchange for a short-lived token; set key wins) |
+| `opencode` | `opencode run` CLI (installed in-job, after the repo's dependencies) | agent is `opencode` and one of `BKIT_OPENCODE_API_KEY` / `BKIT_OPENROUTER_API_KEY` / `BKIT_OLLAMA_API_KEY` is non-empty; absent → no-op | the provider's `BKIT_` secret |
+| `codex` | `openai/codex-action` (`sandbox: danger-full-access`, workspace trusted through codex-home) | agent is `codex` and `BKIT_OPENAI_API_KEY` is non-empty; absent → no-op | `BKIT_OPENAI_API_KEY` secret |
 
 **Rules:**
 
-- **Credential-gated, never branch-gated.** Missing credential → no-op (not fail). Both → both jobs; serialise via `concurrency.group` (`bkit-auto-${{ inputs.issue || …head_branch }}`).
-- **`--auto=opencode` requires `tracker=github`.**
-- **Single fanned-out `OPENCODE_PROVIDER_KEY`** under committed `opencode.json` `envVar`; no `BKIT_ANTHROPIC_API_KEY` in OpenCode job. GHA-injection hardened, with `PHASE` / `ARG` via `env:`; `ARG` validated `^[0-9A-Za-z.*/-]+$`.
+- **Credential-gated, never branch-gated.** Missing credential → no-op (not fail). Only the recorded agent's job starts; a credential set for another agent is ignored and named in the log. Serialise via `concurrency.group` (`bkit-auto-${{ inputs.issue || …head_branch }}`, `-codex` suffix on the codex job).
+- **The `context` job installs bkit from the consumer's lockfile.** The gate reads the issue id with `bkit fids parse` and the `bkit:auto` label with `bkit issues fetch`; an unreadable label starts no agent and the log + job summary name the reason.
+- **Tracker keys** (`BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY`) are set at step scope, never job-wide.
+- **Every router secret carries its `BKIT_` name.** The OpenCode job passes each provider key under its own name to the committed `opencode.json` `envVar`; no `BKIT_ANTHROPIC_API_KEY` in the OpenCode job. GHA-injection hardened, with `PHASE` / `ARG` via `env:`; `ARG` validated `^[0-9A-Za-z.*/-]+$`.
+- **The `codex` job runs `drop-sudo`** (irreversible on a reused self-hosted runner): use an ephemeral runner.
 - **SHA pins** follow § GitHub Actions pinning; your updater refreshes them in your copy. **`bkit [auto route]` gate** — commit-tag taxonomy.
-- **Disabled in bkit's own repo.** `.github/workflows/bkit-cloud.yml` (the dogfood copy of the template) is disabled in repo settings (`gh workflow list --all` shows `disabled_manually`); no `ANTHROPIC_API_KEY` / `OPENCODE_PROVIDER_KEY` secret or federation variable is set. Re-enable with `gh workflow enable bkit-cloud.yml` after setting a credential.
+- **Disabled in bkit's own repo.** `.github/workflows/bkit-cloud.yml` (the dogfood copy of the template) is disabled in repo settings (`gh workflow list --all` shows `disabled_manually`); no `BKIT_ANTHROPIC_API_KEY` / provider `BKIT_` / `BKIT_OPENAI_API_KEY` secret or federation variable is set. Re-enable with `gh workflow enable bkit-cloud.yml` after setting a credential.
 
 ### Release test runs
 
diff --git a/docs/security.md b/docs/security.md
index cf66daa64..d477dca01 100644
--- a/docs/security.md
+++ b/docs/security.md
@@ -88,7 +88,7 @@ App / stack credentials do not belong here — runtime keys and `/bkit-debug` ob
 | --- | --- | --- |
 | `BKIT_GH_TOKEN` | GitHub MCP server; engine tracker calls (`gh` with `GH_TOKEN` set from it); self-hosted Renovate platform auth | Write PAT. Fine-grained (one owner) when bkit touches a single repo / owner; classic when one token must span owners. Always set an expiry (max 30 days); re-mint before it lapses and update local `.bkit/.env` + the repo Actions secret together (only repo secret). Classic scopes: `repo`, `workflow`, `project`, `read:org`, `notifications`, `gist`, `write:discussion`, `write:packages`, `audit_log`; Renovate minimum → `docs/deployments.md` § Dependency updaters. |
 | npm publish | `.github/workflows/release.yml` | No npm token anywhere. OIDC trusted publishing only; package publishing access = "Require two-factor authentication and disallow tokens". |
-| OpenCode provider keys | OpenCode host model access | Referenced as `{env:KEY}` in `.opencode/opencode.json` — never inlined. In CI the single `OPENCODE_PROVIDER_KEY` secret fans out to the configured provider's env-var name. |
+| OpenCode provider keys | OpenCode host model access | Referenced as `{env:KEY}` in `.opencode/opencode.json` — never inlined. In CI the provider's `BKIT_` secret (`BKIT_OPENCODE_API_KEY`, `BKIT_OPENROUTER_API_KEY` or `BKIT_OLLAMA_API_KEY`) reaches the OpenCode job under that same name. |
 | `BKIT_ANTHROPIC_API_KEY` / `BKIT_CURSOR_API_KEY` / `BKIT_LINEAR_API_KEY` / `BKIT_JIRA_API_KEY` | Cloud agents and tracker | Optional; opt-in surfaces only. The engine sends the Linear key to `api.linear.app/graphql` and the Jira key as a bearer to `mcp.atlassian.com/v2/mcp`; it never prints a key, and tracker failure reasons carry no request headers. |
 
 ### `.claude/bkit-cloud.md` + `.cursor/bkit-cloud.md` + `.codex/bkit-cloud.md` — generated, hold live secrets
@@ -172,6 +172,12 @@ GHA-injection: user-controlled text (commit message, PR title, dispatch inputs)
 
 ## CI Auto-Route Trust (bkit-cloud)
 
+**Engine-owned FID parse:** the router never matches a FID with its own regex. `bkit fids parse` (the consumer's own bkit, installed from its lockfile) returns the FID and issue id, and `bkit_dev_dispatch_guard` asserts the FID charset again before the counter write. The `dev` subject goes through `fids parse --prompt-file`, never an argument.
+
+**Kill switch on every tracker:** the `bkit:auto` label is read through `bkit issues fetch` on GitHub, Linear and Jira alike. An unreadable label (missing key, service down, issue not found, bkit not installable, unparseable output) starts no agent and exits green, with the reason in the log and job summary. Tracker keys (`BKIT_LINEAR_API_KEY`, `BKIT_JIRA_API_KEY`) are set at step scope, never job-wide.
+
+**Same-repo PR steering its own routing:** a same-repo PR's head `package.json` (`bkit.cloud.agent`, `bkit.tracker.default`) steers the routing run for that PR. The author is collaborator-trusted (write access), so this widens nothing: the same collaborator can edit the workflow file.
+
 **Same-repo trigger gate:** every CI-driven dispatch job additionally requires `workflow_run.head_repository.full_name == github.repository`, so a fork PR's CI completion never boots one. `workflow_run` runs in the base repo with the workflow's own `permissions:`, and the `dev` arm performs a privileged `git push origin dev` (the dispatch-counter row) before any agent boots — without the guard, a fork-triggered run reaches that write with `contents: write`. The guard gates the trigger only; outbound lookups made inside the job filter their own results (see the `dev` arm exception below).
 
 **PR-body marker trust:** `bkit-cloud.yml` SHARED-DERIV parses `bkit:issue=#N` / `bkit:fid=X` from PR body to resolve which issue's `bkit:auto` label to re-check (kill switch). PR body is collaborator-trusted (triage / write), not commit-signed, so editing it to point at another issue could defeat the kill switch for the original (if replacement still carries `bkit:auto`). Mitigation: `bkit [auto route]` commit marker (free tier) must be on HEAD; PR body cannot forge commit markers. Gap is collaborator-vs-collaborator only; branch-derived FID fallback when body markers absent. **Exception — the `dev` arm:** the `dev` arm's fallback resolves the PR body via `GET /repos/{o}/{r}/commits/{sha}/pulls`, which returns PRs merely associated with the commit — for a non-default-branch commit that includes OPEN **fork** PRs branched at that SHA, which are not collaborator-trusted, and which the job-level `head_repository` guard does not cover (it gates the trigger, not this outbound lookup). That lookup therefore filters to same-repo `merged_at != null` PRs before reading a body. Future hardening: cross-check `bkit:issue` vs `gh pr view --json closingIssuesReferences`.
diff --git a/docs/testing.md b/docs/testing.md
index 4315adbf8..daeb0adb6 100644
--- a/docs/testing.md
+++ b/docs/testing.md
@@ -738,7 +738,9 @@ The machine-lock integration tests in `audits/templates/machine-lock.integration
 | `.bkit/core/engine/audits/repo/dogfood-templates.test.ts` | Unit | Every template has an entry; each repo-root copy equals the template after its listed edits (placeholder / adapt / bkit-only), else the test fails. Change a copy → list the edit there. |
 | `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts` | Integration | bkit's own `bkit:test:file` (`scripts/ci/bkit-test-file.mjs`) on a `.bats`, a `node:test` `.mjs` and a Vitest file: the JUnit report at `$BKIT_TEST_REPORT` holds the named test passed (read with the audit's `parseJunit` / `judgeGreen`); unset report path leaves the test file untouched; files of two runners → exit 2. `bkit:lint:file` exits 0 on each kind. |
 | `.bkit/core/engine/audits/hooks/guardrails-cursor.integration.test.ts` | Integration | Cursor destructive-op / secret-exposure hook (`.cursor/hooks/bkit-guardrails.cjs`, spawned): shell deny / ask patterns, curl-wget host allowlist, private-key and `.env` reads, managed-block boundary. |
-| `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | Integration | Claude and Cursor `bkit-preflight.sh` as generated (spawned under bash): the rules-read advisory on an IDE session and merged with the Linear guard result in the one session-start document on a cloud session, missing key / issue hard-stops in each host's output shape, the shared Linear guard carried verbatim, no call into bkit. |
+| `.bkit/core/engine/audits/hooks/preflight-sh.integration.test.ts` | Integration | Claude and Cursor `bkit-preflight.sh` as generated (spawned under bash): the rules-read advisory on an IDE session and merged with the tracker guard result in the one session-start document on a cloud session, missing key / issue hard-stops in each host's output shape, the shared `preflight-tracker.sh` guard carried verbatim (GitHub, Linear by state category, Jira through `bkit issues fetch`, no-id sessions unguarded). |
+| `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` | Integration | The real `bkit-cloud.yml` `context` job step bash, extracted from the template and run against a git fixture, a stubbed `gh` and recorded `bkit` replies: runner credential gate and agent selection, FID recovery, the gate outcomes (pass, label-absent, no-issue, unreadable reasons) and the dev-arm cap. |
+| `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` | Integration | The shipped `bkit-cloud.yml` and `bkit-ci.yml` templates: job shape, `BKIT_` secret names, step-scoped tracker keys, the codex and opencode jobs. |
 | `.bkit/core/engine/audits/hooks/session-rules-advisory.integration.test.ts` | Integration | The rules-read advisory on the hosts with no session-start event: the OpenCode plugin driven through both the 1.x `server()` and 2.0 `setup()` shapes, and the rendered Codex and Antigravity `bkit-rules.cjs` hooks spawned as their host runs them — advisory once per session (also when the state dir cannot be written: per-user state dir, in-process memory for OpenCode), fail-open, no `AGENTS.md`; the shell and JS parts hold the byte-identical advisory string. |
 | `.bkit/core/engine/render/parts.test.ts` | Unit | `renderParts` part-line splicing (JS and shell markers, no nesting, missing part throws); the host hook templates splice parts only inside the managed block, every part is used by two or more hosts, and every generated hook passes `node --check` / `bash -n`. |
 | `.bkit/core/engine/install/modules/index.integration.test.ts` | Integration | One canonical permission-gate table asserted across Claude `settings.json`, OpenCode `opencode.json`, Cursor `bkit-guardrails.cjs` and Codex `bkit-guardrails.cjs` — same verdict for every destructive command on all four hosts; secret reads asserted on Antigravity, Cursor and OpenCode `bkit-guardrails.cjs` (Codex has no read gate, see deferrals). Plus shell-as-edit-channel advisories, curl / wget host matching, every hook finding `.bkit/allowlist.json` from payload dirs whatever its cwd, every reader host's install writing it (and moving a recorded `.cursor/allowlist.json`), and the documented per-host divergences. |
