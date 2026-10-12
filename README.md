<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/bkit-hero-dark.svg">
    <img alt="bkit — from vibe coding to production code. A senior engineering team's process, ready-made, run by AI agents and battle-tested over more than 1,000 commits." src=".github/assets/bkit-hero-light.svg" width="100%">
  </picture>
</p>

<p align="center">
  <a href="https://github.com/cbartens/bkit/actions/workflows/bkit-ci.yml"><img alt="CI" src="https://github.com/cbartens/bkit/actions/workflows/bkit-ci.yml/badge.svg?branch=main"></a>
  <a href="https://www.npmjs.com/package/@cbartens/bkit"><img alt="npm version" src="https://img.shields.io/npm/v/@cbartens/bkit"></a>
  <a href="#license"><img alt="License: PolyForm Noncommercial or PolyForm Small Business" src="https://img.shields.io/badge/license-PolyForm%20Noncommercial%20%2F%20Small%20Business-blue"></a>
  <img alt="Node 20+" src="https://img.shields.io/badge/node-%E2%89%A520-339933">
  <img alt="Works with Claude Code, Cursor, Codex, Antigravity and opencode" src="https://img.shields.io/badge/works%20with-Claude%20Code%20%C2%B7%20Cursor%20%C2%B7%20Codex%20%C2%B7%20Antigravity%20%C2%B7%20opencode-8250df">
</p>

<p align="center">
  <a href="#quick-start">Quick start</a> ·
  <a href="#a-ready-made-workflow-for-every-job">Workflows</a> ·
  <a href="#a-ci-pipeline-built-the-way-senior-teams-build-them">CI template</a> ·
  <a href="#right-context-at-the-right-step">Context</a> ·
  <a href="#faq">FAQ</a> ·
  <a href=".bkit/install.md">Install guide</a>
</p>

AI coding agents are fast, but on their own they skip the parts that make software safe to ship: a design someone challenged, a plan someone checked, a second pair of eyes on every change, tests that actually ran. Vibe coding gets you a demo. Getting that demo to production takes a process.

**bkit is that process, ready-made.** You describe a feature in a GitHub or Linear issue. AI agents design it, plan it, build it, review it with agents that didn't write it, fix what breaks, and ship it, with project docs and memory kept up to date along the way.

- **For solo founders and makers** who have outgrown vibe coding: you get the habits of a senior engineering team without hiring one. You need to be able to read a plan and make a call, not write the code.
- **For engineers** who want a proven agentic process instead of building their own: rules, prompts, workflows, guardrails, audits and a CI pipeline that already work together.

**Battle-tested, not a weekend prompt pack.** bkit is built with bkit. Its rules, prompts and workflows have been refined over >1,000 commits, >500 issues and >100 merged pull requests run through its own pipeline, and that history is recorded in >200 lessons and >300 decisions agents read before they start.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/bkit-features-dark.svg">
    <img alt="What ships with bkit, one coloured row per phase. Design: three rival designs, probe code for the risky unknowns, reads your history, reviewed for failure modes. Plan: five reviewers, big work split up, learns from past bugs and postponed work, more than 30 audits. Build: writes and verifies, hunts bugs and security holes, checks the plan is still current, skills on demand. Debug: outside evidence from CI and your platforms, root cause first, hard-bug mode, knows when to stop. Ship: honest CI, nothing quietly dropped, docs and memory, never touches main. Every phase: any AI tool, best model per job, independent review, laptop to cloud." src=".github/assets/bkit-features-light.svg" width="100%">
  </picture>
</p>

## >200 files of best practice, ready to use

Everything a senior team would otherwise write down over years, in files you can read:

<!-- prettier-ignore -->
| What | How many | What it does for you |
| --- | --- | --- |
| Agents | >40 | Single-job specialists, each with its own model, thinking depth and tool list. A reviewer can read code but can't change it. |
| Workflows | 6 | The five phases plus a cloud router. Every step ends in a checklist and a mechanical check before the next one starts. |
| Agent rules | >70 | One shared rulebook every agent follows: read before editing, never defer silently, report honestly, never rewrite history. |
| Guardrails | >10 hook files | Block dangerous commands and make agents investigate before they edit, on all five AI tools. |
| Audits | >30 | Security, privacy, accessibility, performance, reliability, database, LLM usage, cost and more. Findings feed straight into a plan. |
| Project docs | 10 + index | Architecture, data schema, deployments, testing, security, monitoring, design system, tech stack, setup, and an index telling each agent what to read at each step. |
| Templates | >60 | A full CI pipeline, cloud agents, git hooks, linters, dependency updates, secrets sync, code search, and >10 ready-made connectors for your platforms. |

## A ready-made workflow for every job

One command per job. Each one runs a team of specialised agents, so you don't have to write prompts or remember steps.

<!-- prettier-ignore -->
| Job | Command | What happens |
| --- | --- | --- |
| Work out how to build it | `/bkit-design` | Reads related issues and past decisions, has three agents propose different approaches and two critique them, and writes throwaway code to test any risky unknowns the reviewers flag. You get one design to approve. |
| Plan the work | `/bkit-plan` | A step-by-step plan, stress-tested by five reviewers who also see past bugs and postponed work. Too big for one build? It's split into pieces. You approve it. |
| Build it | `/bkit-build` | Checks the plan still matches the code, writes it, verifies every task, hunts for bugs and security holes, adds edge-case tests, and opens a pull request. |
| Fix what broke | `/bkit-debug` | Pulls evidence from CI and your platforms, finds the root cause, fixes it, re-tests and records the lesson. Hard runtime bugs get their own mode; if it can't fix something, it stops and writes you a clear handover. |
| Ship it | `/bkit-ship` | Checks nothing planned was quietly dropped, waits for every test lane to pass, merges into `dev`, and updates the docs. |
| Health check | >30 audits | One specialist checklist per area. Findings feed straight into `/bkit-plan`. |
| Housekeeping | 7 utility agents | Keep docs, decisions, lessons and known bugs current, and rank what to work on next. |

## How it works

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/bkit-pipeline-dark.svg">
    <img alt="The bkit pipeline: design, plan, build and ship, with debug fixing failed tests. Each dot is one of 40 AI agents: 10 in design, 10 in plan, 11 in build, 5 in debug and 4 in ship. It waits for your sign-off after design, after plan and before merge, merges into dev, and leaves production to you. Runs on Claude Code, Cursor, Codex, Antigravity and opencode." src=".github/assets/bkit-pipeline-light.svg" width="100%">
  </picture>
</p>

## Why it's different

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/bkit-fences-dark.svg">
    <img alt="You don't steer AI, you build fences. AI agents start out scattered at design and are funnelled through plan, build, debug and ship into production-grade code. At design and plan, reviewer agents fence the work in; from build onwards, automated checks from the CI template (typecheck, lint, formatting, prose, tests) join them. Work that goes off target is sent back and retried, a failed test goes to debug, which finds the root cause, fixes it and re-runs the tests until they pass, and bkit waits for your sign-off after design, after plan and before merge." src=".github/assets/bkit-fences-light.svg" width="100%">
  </picture>
</p>

Rules and prompts only go so far: an agent can be talked into calling something done. Reviewer agents fence in the design and the plan. From the first line of code, automated checks join them, and those can't be argued with.

## A CI pipeline built the way senior teams build them

CI (continuous integration) is the robot that runs every check on every change, on GitHub's servers, before anything merges. It's the strongest fence there is, and most people who start with vibe coding have never set one up. bkit ships one ready to adopt, and its workflows are built around it:

- **Ready on day one.** Two lanes run side by side: quick checks (type checking, formatting, a prose checker, a scanner for junk code AI tends to write, a workflow-file checker, and `bkit check`) and unit tests.
- **A green tick means every test ran.** One final check joins all lanes and is the only one branch protection needs. It fails if any lane failed, was skipped or cancelled, or ran zero tests, so a half-finished run can't pass as tested.
- **Grows with your project.** >20 ready-to-enable building blocks: integration tests, end-to-end tests for web, iOS and Android, database migrations (locked once merged, with security-policy checks), coverage reports, waiting for preview deploys, live checks against the deployed site, smoke and health checks, and a planner that runs only what a change affects. `bkit check` reminds you of each one until you enable or delete it.
- **Safe by default.** Every third-party action is pinned to an exact commit, the downloaded prose checker is checksum-verified, and pull-request titles never reach a script unescaped.
- **Doesn't waste minutes.** A commit that already passed isn't re-tested, and a newer push cancels the older run, except on your production branch, where a deploy must never be cut off halfway.
- **Wired into the workflows.** `/bkit-ship` merges only when the final check is green, `/bkit-debug` reads its failed logs, the cloud router starts from its result, and the gates audit flags any check that can never fail.

## Right context at the right step

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/bkit-context-dark.svg">
    <img alt="What it knows: right context, right step, written back as it learns. In your repo, bkit reads project docs at every step and updates them at ship; reads and writes lessons, decisions, postponed work and known bugs; writes designs and plans that later steps read; reads audit reports at plan and a code map at every step; keeps run state and stats at every step; adds skills at build and removes them at ship. Outside your repo, it reads and updates the GitHub or Linear issue at every step, searches related issues at design, plan and debug, searches the web at design and debug, reads CI runs and test reports at debug and ship, reads runtime platforms such as Sentry, Vercel, Supabase and Stripe at debug, and opens, fixes and merges the pull request." src=".github/assets/bkit-context-light.svg" width="100%">
  </picture>
</p>

Most AI tools forget everything when the chat ends. bkit keeps what it knows in plain files in your repo, and each step reads what it needs and writes back what it learned:

- **Documentation that keeps itself current.** Install sets up the docs a professional project keeps: architecture, data schema, deployments, testing, security, monitoring, design system, tech stack and local setup. Agents fill them in as they work, `/bkit-ship` brings them up to date after every feature, and an index tells each agent which docs to read at each step. The docs stay current because the agents depend on them.
- **Project memory agents actually read.** Four ledgers record lessons from every fix (`docs/knowledge.jsonl`), decisions and the reasons behind them (`docs/decisions.jsonl`), work consciously postponed (`docs/deferrals.jsonl`) and known bugs (`docs/failures.jsonl`). Planning reviewers see the past bugs and postponed work closest to the new feature, debug reads the lessons first, and `/bkit-ship` checks nothing postponed was quietly dropped.
- **Evidence from outside, when it's needed.** Design searches your backlog for related issues and checks the web for feasibility. Debug pulls failed CI logs, the diff since the last green run, end-to-end reports and runtime errors. >10 ready-made connectors cover GitHub, Sentry, Vercel, Supabase, Stripe, Expo, Playwright, Maestro, Inngest, Resend, Cloud Run, Tavily web search and Serena, each easy to customise, extend or leave out. A connector that isn't set up is reported as such, never read as "all clear".
- **Progress lives in your repo, not a chat window.** Run state is saved after every step, so a crashed run resumes where it stopped, on any tool.

## What else you get

### The quality is real

- **Everything is checked by an agent that didn't write it.** An AI checking its own work tends to approve it. bkit gives every design, plan and code change to separate reviewers, each with one job (one hunts bugs, another security holes). They never see each other's verdicts, and several review groups mix models on purpose, so one model's blind spot is less likely to get past all of them.
- **"Done" is checked by code, not taken on trust.** Every step's output is verified before the next step starts, a task is ticked only when its result really exists, and a silent TODO or skipped test blocks the merge.
- **Broken builds fix themselves, and stay fixed.** `/bkit-debug` finds the root cause before it changes anything, fixes it, re-runs the tests and records the lesson. Bugs that only show up at runtime get a dedicated mode that adds logging, fixes on evidence and removes the logging again.
- **It knows when to stop.** If a failure can't be fixed, bkit writes a clear handover and stops, instead of guessing over and over.

### Engineering know-how, built in

- **Best model for each job, on every tool.** Each agent has its own model and thinking depth, chosen per tool and provider. Deep reasoning models do architecture and security review; quick ones write summaries. Starting a session on a cheaper model never quietly downgrades the reviewers.
- **It tests ideas before you commit to them.** When reviewers flag an unknown a design depends on, design writes throwaway probe code to settle it before you approve, and a design reviewer checks failure modes and monitoring, not just whether it can be built.
- **Big features are split up.** A plan too big for one build becomes a sequence of smaller plans, and each is re-checked against the current code right before it's built.
- **Numbers on your own work.** Every run records its time, size of change and retries in `.bkit/stats.jsonl`, and posts them to the issue next to the median of your last five runs.
- **Health checks on demand.** >30 audit checklists act like hiring a specialist for a day.

### It fits how you work

- **Never blocked by usage limits.** Out of Claude for the week? Carry on in Cursor, Codex, Antigravity or opencode, or on free models on your own machine through Ollama. Same feature, same checks, nothing to set up again.
- **Start on your laptop, check in from your phone.** A feature started at your desk can continue in a cloud session (Claude Code on the web or the Claude app, Cursor cloud agents, or opencode on GitHub Actions), or start by itself when CI finishes: ship on green, debug on red. The cloud setup ships ready to adopt.
- **Run several features at once.** Each one works in its own copy of the repo (a git worktree), so they never trip over each other.
- **Your issue tracker is the control panel.** bkit reads the GitHub or Linear issue, posts progress as it goes, moves the issue along and links the pull request.
- **The right expertise for each feature.** When a plan needs, say, Stripe or Supabase, bkit installs a matching skill for the build and removes it when the feature ships.

### You stay in control

- **Decide in plain English, not code.** Before any code is written you approve two short documents: a design ("three ways to build this; we recommend this one, because…") and a plan ("these twelve steps, and how we'll know each is done").
- **Three sign-offs, and production stays yours.** bkit stops after the design, after the plan and before merging. It merges into your `dev` branch and never touches `main`: promoting to production is always your call. Cloud mode can ship on green without you, but only for issues you've labelled `bkit:auto`, and removing the label stops it.
- **Guardrails on the AI itself.** Dangerous commands like force-pushing or rewriting history are blocked. Each agent only gets the tools its job needs.

## Templates ready to adopt

bkit installs only what its workflows run. Everything else, the things you or another tool run, ships as a template: install puts the latest set in your `.bkit/templates/`, and every upgrade lists which ones changed. Copy in what you want and own it; bkit never writes over your copy. The install prompt asks your AI to adopt what fits. Catalogue, install steps and known traps: [`.bkit/templates.md`](.bkit/templates.md).

<!-- prettier-ignore -->
| Template | What it gives you |
| --- | --- |
| **CI pipeline** | Two lanes ready to go and >20 building blocks for the rest ([above](#a-ci-pipeline-built-the-way-senior-teams-build-them)). One final check is the only one branch protection needs. |
| **Quality checks** | Type checking, formatting, a prose checker, a scanner for junk code AI tends to write, and a workflow-file checker, wired into git hooks and CI. Your `bkit:gate:*` scripts in `package.json` define what "the checks" are, and the gates audit flags any check that can never fail. |
| **Context connectors** | >10 ready-made connectors that let `/bkit-debug` read CI, error trackers, hosting, databases, payments, email, queues and the web. |
| **Cloud agents** | When CI finishes, a cloud agent picks up: ship on green, debug on red. No laptop needed. |
| **Dependency updates** | Ready-made Renovate or Dependabot setups: grouped minor updates, pinned GitHub Actions, and security fixes that skip the weekly queue. |
| **Secrets sync** | One local file holds every key. One command pushes them to Vercel, GitHub Actions, Google Cloud, Supabase and Expo; another proves every copy matches without printing a value. |
| **Serena** | Lets agents look up code the way your editor does ("where is this used?") instead of guessing from text search. Read-only. |
| **graphify** | Draws a map of how your codebase fits together (`docs/capabilities.md`), so agents check what already exists before building it again. |

## Quick start

You need a GitHub repo, Node 20+, pnpm, and at least one of Claude Code, Cursor, Codex, Google Antigravity or opencode.

**Easiest:** copy the [install prompt](.bkit/install.md#install--first-time) into your AI coding tool and let it do the setup.

**By hand:** no token or registry setup — bkit is public on npmjs and installs like any other package.

```bash
pnpm add -D @cbartens/bkit
pnpm bkit install --claude    # pick your tools: --claude --cursor --codex --antigravity --opencode=<provider>
```

Adopt the templates you want from `.bkit/templates/`, then open an issue and run the first step from your AI tool:

```text
/bkit-design ISSUE-123
```

Full install, upgrade and CI setup: [`.bkit/install.md`](.bkit/install.md).

## FAQ

**Do I need to know how to code?**
No, but you do need to read a design and a plan and decide whether they're right. Setup takes a few terminal commands, or one pasted prompt.

**Who is it not for?**
bkit is heavier than a single prompt. For a one-off script or a quick experiment, just ask your AI. bkit pays off on a project you'll keep changing and want to trust.

**What does it cost?**
bkit is free for personal use, non-profits and small businesses (fewer than 100 people and under US$1M revenue); larger companies need a commercial licence ([License](#license)). It runs on AI subscriptions you already have (Claude, Cursor, ChatGPT for Codex, Google Antigravity), on pay-as-you-go providers through opencode, or on free local models. Several agents reviewing in parallel uses more of your quota than a single chat; that's the price of the second opinions.

**Can it break my live site?**
Not without your sign-off. Work happens in a separate copy of the repo, goes through a pull request, must pass every test, and merges into `dev`, never `main`.

**Which issue tracker?**
GitHub Issues or Linear.

<details>
<summary><strong>For engineers: what's under the hood</strong></summary>

- **Isolation.** Every run gets its own git worktree; a per-feature lock blocks duplicate runs of the same feature, and a short repo-wide lock serialises only the moments that write to `dev`.
- **Resume from state, not session.** Run state lives in `status.jsonl` and `docs/plans/`. A crashed or interrupted run resumes from its last completed step, on any host.
- **Mechanical step gates.** `bkit steps finish` checks each step's verdict and artifacts before the workflow moves on; build ticks a task only on a confirmed artifact; ship's deferred sweep fails the merge on an unplanned gap.
- **Engine.** The `bkit` CLI is TypeScript in [`.bkit/core/engine/`](.bkit/core/engine/), built to `dist/`, covered by >3,000 tests. `commands/` holds what you type; `install/`, `render/`, `checks/`, `ledgers/` and `shared/` hold the code underneath; `audits/` holds the tests that read shipped text.
- **One source, every host.** `.bkit/` renders `.claude/`, `.cursor/`, `.codex/`, `.agents/` (Antigravity) and `.opencode/`. `bkit check` is the CI drift gate.
- **Reviewer independence.** Parallel reviewers can't read sibling output. Design brainstorm, design review and plan scope-check groups also cross models (Opus + Sonnet on Claude; Grok + Composer on Cursor); depth-sensitive lenses (plan review, build challenge) stay on the top tier.
- **Per-agent pins.** Model and effort per agent, per provider ([`.bkit/prompts.md`](.bkit/prompts.md) § Models), immune to the session default.
- **Against the literature.** bkit fully implements 13 of the 22 patterns in Antonio Gulli's _Agentic Design Patterns_, partly implements 7 (scoped to shipping code), leaves 2 out by design, and goes beyond the book in 8 places. Full mapping and every agent in execution order: [`.bkit/comparison.md`](.bkit/comparison.md).

</details>

## Documentation

<!-- prettier-ignore -->
| Read | For |
| --- | --- |
| [`.bkit/install.md`](.bkit/install.md) | Install, upgrade, CI auth, uninstall, recovery |
| [`.bkit/README.md`](.bkit/README.md) | Day-to-day use: running workflows, environment, tracker setup, CLI |
| [`.bkit/workflows.md`](.bkit/workflows.md) | Every workflow step, verdict and contract |
| [`.bkit/providers.md`](.bkit/providers.md) | Tool and provider differences, model pins |
| [`.bkit/cloud.md`](.bkit/cloud.md) | Cloud agents: Claude Code on the web, Cursor, opencode |
| [`.bkit/templates.md`](.bkit/templates.md) | Templates ready to adopt |
| [`.bkit/comparison.md`](.bkit/comparison.md) | Full pipeline reference and agentic-patterns comparison |
| [`CHANGELOG.md`](CHANGELOG.md) | What changed in each release |

## License

bkit is source-available, not open source: anyone can read all of it, and it's free under either of two licences, whichever fits you.

- **[PolyForm Noncommercial 1.0.0](https://polyformproject.org/licenses/noncommercial/1.0.0):** personal and hobby use, and charities, schools, research bodies and government, whatever their size.
- **[PolyForm Small Business 1.0.0](https://polyformproject.org/licenses/small-business/1.0.0):** any use, commercial included, by a person or company with fewer than 100 people and under US$1M revenue.

If neither fits, email bkit@bartens.biz for a commercial licence.

**The code bkit's agents write for you is yours.** The licences cover bkit itself, not what its agents produce in your repo.

**Small pieces are MIT-0.** Everything in [`.bkit/shared/`](.bkit/shared/) and [`.bkit/templates/`](.bkit/templates/) is [MIT-0](https://opensource.org/license/mit-0): use it however you like, and a template you copy into your repo is yours. Every file bkit writes carries the licence and its URL in its marker, and the full PolyForm texts travel in the repo at [`.bkit/LICENSE.md`](.bkit/LICENSE.md) after install.

Full terms: [`LICENSE.md`](LICENSE.md).
