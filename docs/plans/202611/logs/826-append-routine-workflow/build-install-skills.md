# Build Skills Installed

## Technologies Identified

- TypeScript provides the engine source language.
- Node.js provides filesystem, crypto, subprocess and HTTP operations.
- Vitest runs the planned unit and integration tests.
- GitHub CLI and issue-comment APIs provide the GitHub transport.
- Linear GraphQL provides the Linear transport.
- Jira Rovo MCP provides the Jira transport.
- Markdown markers and generated host instructions carry the reporting contract.

## Already Installed

`bkit-auto`, `bkit-build`, `bkit-debug`, `bkit-design`, `bkit-plan`, `bkit-ship`, `brainstorming`, `dispatching-parallel-agents`, `executing-plans`, `find-skills`, `finishing-a-development-branch`, `graphql-operations`, `nodejs-core`, `property-based-testing`, `receiving-code-review`, `requesting-code-review`, `subagent-driven-development`, `systematic-debugging`, `test-driven-development`, `typescript-pro`, `using-git-worktrees`, `using-superpowers`, `verification-before-completion`, `vitest`, `writing-plans`, `writing-skills`.

The four matching technology skills have their folders, `SKILL.md` files, matching sources and nonempty `computedHash` values in `skills-lock.json`. They are reused. Their historical provenance is retained below; install and star counts are preceding-run observations, not fresh measurements.

<!-- prettier-ignore -->
| Folder | Exact package | Source | Qualification |
| --- | --- | --- | --- |
| `.agents/skills/vitest` | `antfu/skills@vitest` | [antfu/skills](https://github.com/antfu/skills) | Catalog: 45.6K installs. GitHub API: 6,034 repository stars. |
| `.agents/skills/graphql-operations` | `apollographql/skills@graphql-operations` | [apollographql/skills](https://github.com/apollographql/skills) | Apollo is the official publisher. Catalog: 3.7K installs. |
| `.agents/skills/nodejs-core` | `mcollina/skills@nodejs-core` | [mcollina/skills](https://github.com/mcollina/skills) | Catalog: 2K installs. GitHub API: 1,961 repository stars. |
| `.agents/skills/typescript-pro` | `jeffallan/claude-skills@typescript-pro` | [jeffallan/claude-skills](https://github.com/jeffallan/claude-skills) | Catalog: 14.4K installs. GitHub API: 12,182 repository stars. |

The preceding run recorded each named `npx skills add` command exiting 0 and all four lock entries. This run verified the folders, skill files and lock entries without reading skill contents or executing bundled scripts. The preceding installer reported a `Critical Risk` Gen assessment for `typescript-pro`, with `0 alerts` from Socket and `Low Risk` from Snyk; the installed content remains untrusted and this advisory is not a verified exploit finding.

## Newly Installed

None. Existing TypeScript, Node.js, Vitest and GraphQL skills cover the shared technologies.

## Not Found

Current searches for `github comments`, `linear graphql` and `jira rovo` produced no output within the bounded search window. Each was cancelled and exited 130. No current candidate was evaluated or installed; empty output does not prove that the catalog lacks a matching skill. Existing skills cover the shared techniques, and specialist discovery does not block this step. Provider schema and live contract verification remain implementation work under the plan.

The following candidate evaluations and catalog observations are historical records from preceding runs:

<!-- prettier-ignore -->
| Gap | Candidates considered | Outcome |
| --- | --- | --- |
| GitHub comment API contract implementation | `github/awesome-copilot@github-issues`, `github/awesome-copilot@create-github-action-workflow-specification`, `github/awesome-copilot@create-github-issues-feature-from-implementation-plan` | These cover issue management, workflow authoring or issue creation rather than the adapter's verified comment mutation/inspection contract. No additional skill was selected. |
| Linear-specific comment API contracts | `openai/skills@linear`, `linear/linear-release@linear-release-setup`, `stablyai/orca@orca-linear`, `schpet/linear-cli@linear-cli` | These target tracker operation or release tooling rather than verifying the existing raw GraphQL comment adapter. The installed GraphQL operations skill covers the shared request language; provider contract discovery remains required. |
| Jira Rovo comment API contracts | `affaan-m/ecc@jira-integration`, `claude-office-skills/skills@Jira Automation`, `softaworks/agent-toolkit@jira`, `netresearch/jira-skill@jira-syntax`, `netresearch/jira-skill@jira-communication`, `alirezarezvani/claude-skills@jira-expert`, `microsoft/hve-core@jira` | No candidate was accepted as an exact Rovo comment schema/inspection match. The nonofficial candidates below 1,000 installs also fail the installation threshold. Existing provider discovery remains required. |
| Jira Rovo narrowed search | `onnokh/atlassian-cli@atlassian-cli` (218 installs), `peetzweg/acli-skill@acli` (203), `thatjuan/agent-skills@atlassian-cli` (39), `jaltez/acli-skill@acli` (18), `skills.volces.com@acli` (11) | These command-line candidates do not establish the Rovo adapter contract and each is below 1,000 installs. None was accepted. |

The initial sandboxed catalog commands failed with `ENOTFOUND registry.npmjs.org` and could not write npm logs. The authorized network retry returned results. Searches were bounded to the leading candidates; the remaining catalog results were not evaluated. Missing specialist matches do not block this skills step.

A preceding run refreshed `npx skills find` searches for `github comments`, `linear graphql` and `jira rovo`; all three exited 0. GitHub's leading official candidates concern code comments or responding to review comments rather than implementing verified issue-comment transports. Linear's leading exact GraphQL candidates (`holon-run/uxc@linear-graphql-skill`, 27 installs, and `thelobbi/claude@Linear GraphQL Patterns`, 11 installs) fail the installation threshold; the installed Apollo skill already covers GraphQL operations. Rovo's leading command-line candidates remain below the installation threshold and do not establish the MCP comment schema. Search output was capped, so this is a review of leading candidates only, not a claim that the catalog has no other matches.
