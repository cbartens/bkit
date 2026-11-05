# Build Skills Installed

Run 2 verification: the four selected feature skills remain installed with the expected source and a nonempty lock hash. The plan requires the same technologies. Prior discovery and publisher evidence are reused; no searches, installs or removals were repeated.

## Technologies Identified

- TypeScript and native ESM for the workflow command engine.
- Node.js for filesystem operations and Git/gh subprocess execution.
- Git and GitHub CLI for branch reconciliation, pull requests and evidence checks.
- Vitest for unit tests and real-Git integration fixtures.
- pnpm for the existing build, test and render commands.
- Markdown workflow and prompt authoring under the repository's existing rules.

## Already Installed

The initial folder inventory contained these skills:

- `bkit-auto`
- `bkit-build`
- `bkit-debug`
- `bkit-design`
- `bkit-plan`
- `bkit-ship`
- `brainstorming`
- `dispatching-parallel-agents`
- `executing-plans`
- `find-skills`
- `finishing-a-development-branch`
- `property-based-testing`
- `receiving-code-review`
- `requesting-code-review`
- `subagent-driven-development`
- `systematic-debugging`
- `test-driven-development`
- `using-git-worktrees`
- `using-superpowers`
- `verification-before-completion`
- `writing-plans`
- `writing-skills`

The existing Git and bkit workflow skills cover branch-management techniques and repository-specific gh orchestration. Existing repository authoring rules govern the Markdown outputs.

Run 2 also found `typescript-best-practices`, `node`, `vitest` and `pnpm` in the folder inventory. Each has its `SKILL.md` and the expected `skills-lock.json` source. Their previously recorded activation boundaries remain applicable.

## Newly Installed

None in run 2. The following selections were installed in run 1 and verified again in run 2.

<!-- prettier-ignore -->
| Folder | Exact package | Source | Acceptance evidence |
| --- | --- | --- | --- |
| `typescript-best-practices` | `cursor/plugins@typescript-best-practices` | [Cursor plugins](https://github.com/cursor/plugins) | Official Cursor publisher; search reported 9.4K installs. |
| `node` | `mcollina/skills@node` | [Matteo Collina's skills](https://github.com/mcollina/skills) | Search reported 6K installs; GitHub API reported 1,963 repository stars and the owner's profile identified Matteo Collina, Platformatic and `nodeland.dev`. |
| `vitest` | `antfu/skills@vitest` | [Anthony Fu's skills](https://github.com/antfu/skills) | Search reported 46.3K installs; GitHub API reported 6,042 repository stars. Installed metadata identifies Anthony Fu and the Vitest upstream source. |
| `pnpm` | `antfu/skills@pnpm` | [Anthony Fu's skills](https://github.com/antfu/skills) | Search reported 22.7K installs; the same repository has 6,042 stars. Installed metadata identifies Anthony Fu and the pnpm upstream source. |

Each exact `npx skills add <owner/repo>@<skill> -y` command exited 0. Each final folder exists, and each corresponding `skills-lock.json` entry has the expected source and a nonempty `computedHash`. These are temporary feature skills; the permanent registry was unchanged. No bundled skill script was executed.

### Search outcomes and recovery

<!-- prettier-ignore -->
| Search | Initial outcome | Approved retry | Selection |
| --- | --- | --- | --- |
| `npx skills find typescript` | Exit 1, `ENOTFOUND registry.npmjs.org`; npm could not write its sandboxed log directory. | Exit 0. | Official Cursor TypeScript best practices. |
| `npx skills find nodejs` | The same sandbox DNS failure. | Exit 0. | Verified Node.js runtime guidance. |
| `npx skills find git` | The same sandbox DNS failure. | Exit 0. | Existing Git skills already match; no additional install. |
| `npx skills find vitest` | The same sandbox DNS failure. | Exit 0. | Anthony Fu's Vitest skill. |
| `npx skills find pnpm` | The same sandbox DNS failure. | Exit 0. | Anthony Fu's pnpm skill. |

The search output was capped; selection used the visible exact matches and their publisher evidence, without claiming that every search result was reviewed. A bounded Vitest reread confirmed its selected result and count. A process inspection also required one approved sandbox retry and succeeded.

The first Node selection, `mcollina/skills@nodejs-core`, installed successfully but its main file targets contributions to Node.js itself. It was removed with the skill installer and replaced by `mcollina/skills@node`; no pre-existing skill was removed. This is agent selection rework.

### Activation boundaries

- TypeScript guidance asks for additional principle skills and uses stricter modeling preferences. Those statements do not authorize further installs or changes beyond the plan; repository activation and scope rules control.
- Node guidance prefers native TypeScript stripping. The repository's established `tsc`, `tsx`, ESM import conventions and Vitest runner remain controlling; this skill does not authorize a toolchain migration or `node:test` harness.
- Vitest metadata targets version `5.1.0-beta.1`. Confirm each API against the installed project version before use.
- pnpm metadata targets versions 11 and 12. The repository's pinned version and existing commands remain controlling; do not apply newer configuration or migration advice by assumption.

## Not Found

None. Each identified domain has either a selected technology skill, an existing workflow skill, or the repository's explicit authoring contract.
