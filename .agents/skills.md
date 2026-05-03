<!-- bkit:start -->

# Skills

> [!CAUTION]
> **Purpose:** Registry of installed agent skills and install/update commands.
>
> **Rules:**
>
> - Token-efficient dense phrasing; agent readers only.
> - Before writing, cross-check `.agents/docs.md` — verify topic does NOT belong in other doc.
> - Only invoke skills relevant to current workflow/task/step.
> - Discover via `npx skills find [query]` — do NOT hand-curate.
> - Update when adopting/retiring core technologies.
> - Managed via [skills.sh](https://skills.sh). Installed to `.agents/skills/`.

## Install / Update

```bash
npx skills find [query]          # search
npx skills add <owner/repo> -y   # install (project-local)
npx skills update                # update all installed
```

## Universal Skills

Universal best-practice skills bkit recommends for every project.

<!-- prettier-ignore -->
| Package | Skills | Purpose |
| --- | --- | --- |
| `obra/superpowers` | brainstorming, writing-plans, executing-plans, systematic-debugging, test-driven-development, verification-before-completion, using-git-worktrees, finishing-a-development-branch, requesting-code-review, receiving-code-review, dispatching-parallel-agents, subagent-driven-development, writing-skills, using-superpowers | Agent best practices used by every bkit phase |
| `vercel-labs/skills` | find-skills | Skill discovery meta-utility |

## Project Skills

<!-- bkit:end -->

Stack-dependent skills for this project. Add/remove as the project's stack evolves; bkit does not manage rows here.

<!-- prettier-ignore -->
| Package | Skills | Installs |
| --- | --- | --- |
| `vercel-labs/agent-skills` | vercel-react-best-practices, vercel-composition-patterns, vercel-react-view-transitions, vercel-react-native-skills, web-design-guidelines, deploy-to-vercel, vercel-cli-with-tokens | 229K+ |
| `vercel-labs/next-skills` | next-best-practices, next-cache-components, next-upgrade | 50K+ |
| `shadcn/ui` | shadcn | 69K |
| `supabase/agent-skills` | supabase, supabase-postgres-best-practices | 75K |
| `vercel/turborepo` | turborepo | 15K |
| `expo/skills` | building-native-ui, expo-module, expo-api-routes, expo-cicd-workflows, expo-deployment, expo-dev-client, expo-tailwind-setup, native-data-fetching, upgrading-expo, use-dom | 25K |
| `currents-dev/playwright-best-practices-skill` | playwright-best-practices | 21K |
| `microsoft/playwright-cli` | playwright-cli, dev | 15K |
| `stripe/ai` | stripe-best-practices, stripe-projects, upgrade-stripe | 5K |
| `inngest/inngest-skills` | inngest-durable-functions, inngest-steps, inngest-setup, inngest-events, inngest-flow-control, inngest-middleware | 358 |
| `tanstack-skills/tanstack-skills` | tanstack-query, tanstack-router, tanstack-start, tanstack-form, tanstack-table, tanstack-virtual, tanstack-store, tanstack-config, tanstack-cli, tanstack-db, tanstack-devtools, tanstack-pacer, tanstack-ranger, tanstack-ai | 768 |
| `bobmatnyc/claude-mpm-skills` | hono-core, zustand, zod | 357 |
| `giuseppe-trisciuoglio/developer-kit` | tailwind-css-patterns | 5K |
| `wshobson/agents` | typescript-advanced-types, github-actions-templates | 24K + 7.7K |
