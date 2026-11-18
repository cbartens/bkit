# Technology

> [!CAUTION]
> **Purpose:** Which technologies bkit uses to deliver its CLI, agent instructions and project tooling, and which conventions reviewers enforce.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs.
> - Name the file that holds each version and list each technology once.
>
> **Not here:** Decision rationale belongs in `docs/decisions.jsonl`, service boundaries in `docs/architecture.md` and setup commands in `docs/setup.md`.
>
> **Update when:** A dependency, tool, host integration or enforced convention changes.

## Stack

For tools supplied by a host, the version column identifies the file that declares the integration and states who supplies the installed version.

<!-- prettier-ignore -->
| Layer | Technology | Version from | Chosen for |
| --- | --- | --- | --- |
| CLI runtime | Node.js with native ECMAScript modules | `.nvmrc` pins the development runtime. `package.json` declares the engine range and module type. | Runs the CLI, hooks and project utilities. |
| Engine and coordination | TypeScript and its compiler | `package.json` | Builds the commands that install payloads, coordinate workflows, validate evidence and report outcomes. |
| Package management | pnpm | `package.json` | Installs the locked toolchain and runs the project's named gates. |
| Package distribution | npm CLI | `.github/workflows/release.yml` selects the Node distribution that supplies npm. | Publishes the package to the public registry using trusted publishing. |
| Workflow and review | Markdown workflows, prompts, rules and copy-and-own templates | `package.json` versions the shipped payload. | Defines the five phases, independent reviews, audits and shared instructions. |
| Host adaptation | Claude Code, Cursor, Codex, Antigravity and OpenCode | `.bkit/core/engine/render/hosts.ts` declares the transforms. The operator supplies the host version. | Renders shared instructions for the selected assistant. |
| Model configuration | bkit's model registry | `.bkit/core/.bkit/prompts.md` | Selects a model and reasoning effort for each role and gateway. |
| Source control and tracker access | Git, GitHub CLI and tracker adapters | `.bkit/core/engine/commands/workflow/tracker.ts` declares the integration. The environment supplies the clients. | Isolates worktrees, reads pull requests and synchronizes work items with GitHub, Linear or Jira. |
| Project memory and reporting | JSON Lines and Markdown | `.bkit/core/.bkit/jsonl.md` declares the record schema. | Stores status, decisions, findings and measurements, then projects them into reports and the roadmap. |
| Verification and cloud continuation | GitHub Actions | `.github/workflows/bkit-ci.yml` and `.github/workflows/bkit-cloud.yml` pin the actions. | Runs project checks and routes eligible cloud work. |
| Process launching | cross-spawn | `package.json` | Launches commands from the sleep-prevention wrapper, including Windows command shims. |
| TypeScript execution | tsx | `package.json` | Runs engine source and fixture CLIs directly. |
| Engine tests | Vitest and its V8 coverage provider | `package.json` | Runs unit and integration suites and measures coverage by tier. |
| Test fixture parsing | yaml | `package.json` | Parses workflow and configuration fixtures in tests. |
| Shell tests | Bats | `package.json` | Exercises shell commands and hooks against temporary repositories and stub binaries. |
| Formatting | Prettier | `package.json` | Formats code and Markdown using `.prettierrc.json`. |
| Prose checks | Vale | `.github/workflows/bkit-ci.yml` | Checks agent-read prose with the rules in `.vale.ini`. |
| Workflow checks | actionlint | `.github/workflows/bkit-ci.yml` | Checks GitHub Actions syntax, expressions and shell bodies. |
| Test linting | Oxlint and oxlint-tsgolint | `package.json` | Enforces assertions and checks unhandled promises in test files using `.oxlintrc.json`. |
| Code quality | slop-scan | `package.json` | Detects new findings against the base with `bkit:slop:delta`. |
| Git hooks | Husky and lint-staged | `package.json` | Runs the staged-file checks and the pre-push gate. |
| Capability maps | graphify | `scripts/graphify/bkit-graphify.sh` | Generates the capability register and checks it against the code. |
| Repository artwork | SVG | `scripts/readme/readme-art.mjs` defines the generated art. | Draws the assets embedded in the package overview. |
| Documentation diagrams | Mermaid | `scripts/graphify/bkit-graphify-rollup.py` emits diagram source. The Markdown viewer supplies the renderer. | Shows relationships and flows in the capability register and project guides. |
| Security scans | Trivy | `.github/workflows/bkit-trivy.yml` | Scans tracked files against the project's accepted findings. |
| Dependency upkeep | Renovate | `.github/workflows/bkit-renovate.yml` | Applies the update policy in `.github/renovate.json5`. |

### Build & Output

`tsconfig.json` compiles the engine to the committed `dist/` tree. `tsconfig.test.json` type-checks tests without emitting files. Runtime packages reachable from the distributed code belong in `dependencies`. The source repository checks the compiled output with `bkit:check:dist`.

### Execution Hosts

The installer always includes core. Select Claude, Cursor, Codex, Antigravity or OpenCode with its install flag. The host and gateway catalog covers install flags, supported providers, model overrides and the hooks each host can enforce. [Host and provider catalog](../.bkit/providers.md)

## Conventions

<!-- prettier-ignore -->
| Convention | Rule | Enforced by |
| --- | --- | --- |
| Runtime packages | Declare dependencies used by shipped code and commit the matching lockfile and compiled output. | Dependency audit, frozen install and the static lane's dist freshness check. |
| Dependency pinning | Pin development dependencies and apply the release-age, trust and build-script policies. | `package.json`, `pnpm-workspace.yaml` and the dependency audit. |
| Canonical sources | Edit payload sources and regenerate installed mirrors. | `bkit check`, the compliance grader and code review. |
| Stack independence | Expose consumer checks through named package scripts. | Project rules and review of engine or workflow changes. |
| Test placement | Name unit tests `*.test.ts` and integration tests `*.integration.test.ts`. | `vitest.config.ts`, tier-specific scripts and code review. |
| Consumer-facing names | Prefix bkit-owned consumer commands and files as specified by the project naming rules. | `.bkit/core/engine/audits/templates/branding.test.ts`. |
| Formatting and prose | Format source and Markdown, preserve compact tables and follow the agent-read authoring rules. | `format:check`, `format:tables:check`, `bkit:lint:prose` and review. |

## Not used

<!-- prettier-ignore -->
| Technology | Use instead |
| --- | --- |
| Application server and web framework | The installed CLI and the selected agent host run workflows. |
| Database or ORM | Versioned files hold shared records. Git's common directory holds private, cross-worktree state. |
| Monorepo task orchestrator | Package scripts and the GitHub Actions job graph run this single package's checks. |

## Open questions

None.
