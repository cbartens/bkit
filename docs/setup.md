# Setup

> [!CAUTION]
> **Purpose:** How contributors set up the bkit source repository, run its CLI and check their changes.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - Write credential names and where to obtain them. NEVER include a secret value.
> - Local seed data and test fixtures must NEVER run against a remote project.
>
> **Not here:** [Security](security.md#secrets) covers secret storage and rotation. [Deployments](deployments.md) covers deployed configuration. [The installation guide](../.bkit/install.md) covers consumer projects. <a id="templates"></a>[The template catalog](../.bkit/templates.md) lists optional files a project can copy and own.
>
> **Update when:** A prerequisite, setup command, environment variable, local service or project script changes.

## Prerequisites

<!-- prettier-ignore -->
| Tool | Needed for | Version from |
| --- | --- | --- |
| Git | Clone the repository, install hooks and create worktrees. | [.bkit/README.md](../.bkit/README.md#required-tools) gives the worktree minimum. |
| Node.js | Build and run the CLI. | [.nvmrc](../.nvmrc) selects the development major. [package.json](../package.json) declares the supported range in `engines.node`. |
| pnpm | Install dependencies and run package scripts. With Corepack, run `corepack enable` once on the machine. | `packageManager` in [package.json](../package.json) pins the version. |
| Vale | Check Markdown prose. Install the binary before syncing styles. | `VALE_VERSION` in [the CI workflow](../.github/workflows/bkit-ci.yml) pins the CI release. |
| GitHub CLI and jq | Run tracker and pull request workflows. Sign in with `gh auth login` for interactive GitHub commands. | [The operator guide](../.bkit/README.md#required-tools) calls for current versions. |
| direnv | Load repository credentials when starting a local host or pushing from a worktree. Enable the direnv hook for your shell. | [The local environment guide](../.bkit/install.md#local-env-setup) describes installation. The repository has no version pin. |

## First-time setup

From the root of a clean checkout with the prerequisites on your path, run these commands in order. The source repository already tracks its installed agent files. Building and checking it requires no service credentials.

```bash
pnpm install --frozen-lockfile
pnpm build
pnpm bkit check
vale sync
```

The install uses the lockfile and runs Husky's `prepare` hook. The build writes the executable to `dist/cli.js`. The check reports how many managed files would change and writes local advisories. A matching checkout reports `0 write(s) would occur`. Vale downloads the styles named in `.vale.ini`.

## Environment variables

When a task needs a provider, create the ignored `.bkit/.env` from [the example file](../.bkit/.env.example) and fill in the entries for that provider. After reviewing `.envrc`, run `direnv allow .` in that checkout. To check the GitHub token without printing its value, run `test -n "$BKIT_GH_TOKEN"` in the loaded shell. Cloud sessions receive their settings through their dashboards. `LINEAR_ISSUE_ID` comes from the cloud session.

<!-- prettier-ignore -->
| Variable | Used by | Where the value comes from |
| --- | --- | --- |
| `BKIT_GH_TOKEN` | GitHub tracker, GitHub MCP and workflow access | A GitHub personal access token with the permissions listed in the example file. |
| `BKIT_LINEAR_API_KEY` | Linear tracker | A personal API key from Linear settings. |
| `BKIT_JIRA_API_KEY` | Jira tracker | An Atlassian API token scoped to the Atlassian MCP V2 app. |
| `BKIT_ANTHROPIC_API_KEY` | Claude API billing when selected | The developer's Anthropic Console account. Subscription users leave it blank. |
| `BKIT_OPENAI_API_KEY` | Codex cloud router when selected | An OpenAI API key configured for the router job. The router reads its Actions secret. |
| `BKIT_CURSOR_API_KEY` | Programmatic Cursor cloud dispatch | A key created in Cursor account settings. |
| `BKIT_OPENCODE_API_KEY` | OpenCode Zen or Go | The selected OpenCode gateway account. |
| `BKIT_OPENROUTER_API_KEY` | OpenCode with OpenRouter | The developer's OpenRouter account. |
| `BKIT_OLLAMA_API_KEY` | OpenCode with Ollama Cloud | The developer's Ollama account. |
| `BKIT_TAVILY_API_KEY` | Optional web evidence during debugging | The developer's Tavily account. |

<a id="agent-hosts"></a>

Launch each CLI host from its own direnv-loaded terminal so it inherits the checkout's variables and can restart independently. [Agent hosts](../.bkit/install.md#agent-hosts-and-remote-access)

<a id="remote-access"></a>

For optional remote OpenCode access, the install guide covers binding the service to a private network, pinning its port, serving it over HTTPS and pairing a client with a one-time link. [OpenCode remote access and pairing](../.bkit/install.md#remote-access)

## Local services

Not applicable: bkit runs as a CLI. Its integration tests create disposable local Git repositories and filesystem fixtures. A contributor can run them without starting or resetting a server or database. [Environments](architecture.md#environments) · [Testing](testing.md)

## Everyday commands

<!-- prettier-ignore -->
| Task | Command |
| --- | --- |
| Build the CLI after an engine change | `pnpm build` |
| Check the installed payload for drift | `pnpm bkit check` |
| Refresh installed host files after editing the managed sources | `pnpm tsx .bkit/core/engine/cli.ts upgrade` |
| Inspect prerequisites and configuration advisories | `pnpm bkit doctor` |
| Run type checking or linting | `pnpm typecheck` or `pnpm lint` |
| Run one test file | `pnpm bkit:test:file` followed by its path |
| Run the integration tests | `pnpm test:integration` |
| Run the full local pre-push test gate | `pnpm bkit:gate:static-unit-integration` |
| Verify that committed distribution files match the source | `pnpm bkit:check:dist` |

## Troubleshooting

<!-- prettier-ignore -->
| Symptom | Cause | Fix |
| --- | --- | --- |
| The pre-push hook reports an untrusted `.envrc`. | direnv authorizes each checkout separately. | Review the file and run `direnv allow .` in the folder you push from. `bkit worktrees setup` can authorize a linked worktree when both copies match. |
| GitHub works in a terminal but the host cannot see its token. | A macOS app started from the Dock can miss the shell environment. | Launch the host from the direnv-loaded shell. For Cursor, quit it first and run `pnpm bkit cursor`. |
| A clean checkout reports missing Vale styles. | The downloaded `write-good` directory is ignored by Git. | Run `vale sync` with access to the style package, then `pnpm bkit:lint:prose`. |
| `bkit check` reports drift after a package update. | The managed files still reflect the previous install. | Review and refresh them with `pnpm bkit upgrade`, then rerun `pnpm bkit check`. |
| A bare `bkit install` exits with a usage error. | A new installation needs a host or tracker selection. | Select the desired host from [the installation guide](../.bkit/install.md). Use `pnpm bkit upgrade` to refresh the hosts already installed. |
| A workflow encounters a lockfile merge conflict. | Both branches changed the lockfile. | The ship workflow's `bkit branches sync --merge` regenerates it using the project's package manager. See [the workflow catalog](../.bkit/workflows.md). |

## Open questions

None.
