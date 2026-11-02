# Build Skills Installed

## Technologies Identified

- Bash 3.2-compatible shell scripts, named locks and process lifecycle handling.
- Perl `flock` holders embedded in the shell script.
- TypeScript and Node.js workflow commands and subprocess handling.
- Vitest unit and integration tests, global setup and worker configuration.

## Already Installed

`using-git-worktrees`, `bkit-ship`, `test-driven-development`, `systematic-debugging`, `bkit-design`, `using-superpowers`, `dispatching-parallel-agents`, `find-skills`, `executing-plans`, `finishing-a-development-branch`, `bkit-plan`, `bkit-build`, `bkit-auto`, `bkit-debug`, `brainstorming`, `writing-plans`, `requesting-code-review`, `receiving-code-review`, `writing-skills`, `verification-before-completion`, `subagent-driven-development`.

## Newly Installed

<!-- prettier-ignore -->
| Folder | Package | Source | Quality evidence |
| --- | --- | --- | --- |
| `.agents/skills/bash-defensive-patterns` | `wshobson/agents@bash-defensive-patterns` | https://skills.sh/wshobson/agents/bash-defensive-patterns | Registry: 13.8K installs. GitHub: 42,094 stars. |
| `.agents/skills/perl-patterns` | `affaan-m/ecc@perl-patterns` | https://skills.sh/affaan-m/ecc/perl-patterns | Registry: 10K installs. GitHub: 295,017 stars. |
| `.agents/skills/typescript-pro` | `jeffallan/claude-skills@typescript-pro` | https://skills.sh/jeffallan/claude-skills/typescript-pro | Registry: 14.4K installs. GitHub: 12,172 stars. |
| `.agents/skills/vitest` | `antfu/skills@vitest` | https://skills.sh/antfu/skills/vitest | Registry: 45.5K installs. GitHub: 6,032 stars. |

Each named install exited 0, and all four folders are present. The installer updated `skills-lock.json`. No bundled scripts were executed.

The installer reported `typescript-pro` as `Critical Risk` in its Gen assessment, with zero Socket alerts and Snyk `Low Risk`. Its content was not loaded or executed by this install step; implementation agents must review it under the standing untrusted-content contract before use. The other three installs reported Gen `Safe`, zero Socket alerts and Snyk `Low Risk`.

## Not Found

None. Each technology has one accepted matching skill. More specialised, unrelated search results were not installed.

The initial sandboxed registry requests failed with `ENOTFOUND registry.npmjs.org`; the bounded retry with network access succeeded for all four searches. Publisher repository names and star counts were independently checked through the GitHub API.
