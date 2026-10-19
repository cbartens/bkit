<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/bkit-hero-dark.svg">
    <img alt="bkit — from vibe coding to production code. A senior engineering team's process, ready-made, run by AI agents and battle-tested over more than 1,000 commits." src=".github/assets/bkit-hero-light.svg" width="100%">
  </picture>
</p>

<p align="center">
  <a href="https://github.com/cbartens/bkit/actions/workflows/bkit-ci.yml"><img alt="CI" src="https://github.com/cbartens/bkit/actions/workflows/bkit-ci.yml/badge.svg?branch=main"></a>
  <a href="https://www.npmjs.com/package/@cbartens/bkit"><img alt="npm version" src="https://img.shields.io/npm/v/@cbartens/bkit"></a>
  <a href="#license"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-blue"></a>
  <img alt="Node 24+" src="https://img.shields.io/badge/node-%E2%89%A524-339933">
  <img alt="Works with Claude Code, Cursor, Codex, Antigravity and opencode" src="https://img.shields.io/badge/works%20with-Claude%20Code%20%C2%B7%20Cursor%20%C2%B7%20Codex%20%C2%B7%20Antigravity%20%C2%B7%20opencode-8250df">
</p>

<p align="center">
  <a href="#how-it-works">How it works</a> ·
  <a href="#why-its-different">Why it's different</a> ·
  <a href="#memory">Memory</a> ·
  <a href="#audits">Audits</a> ·
  <a href="#templates">Templates</a> ·
  <a href="#token-costs">Token costs</a> ·
  <a href="#faq">FAQ</a> ·
  <a href="#quick-start">Quick start</a>
</p>

<p align="center">
  <a href=".bkit/install.md">Install guide ↗</a> ·
  <a href=".bkit/README.md">User guide ↗</a> ·
  <a href=".bkit/comparison.md#frameworks">Comparison ↗</a>
</p>

AI coding agents are fast, but on their own they skip what makes software safe to ship: a design someone challenged, a plan someone checked, a second pair of eyes on every change, tests that actually ran. **Vibe coding gets you a demo. Production takes a process.**

**bkit is that process, ready-made.** Describe a feature in a GitHub or Linear issue and type one command:

```text
/bkit-design ISSUE-123
```

AI agents design it, plan it, build it, have it reviewed by agents that didn't write it, fix what breaks and ship it, keeping project docs and memory current along the way. You read the design and the plan and make the call.

- **For solo founders and makers** who've outgrown vibe coding: a senior engineering team's habits, without hiring one. You need to read a plan and make a call, not write the code.
- **For engineers** who want a proven agentic process instead of building their own: rules, prompts, workflows, guardrails, audits and a CI pipeline that already work together.

**It ships what other frameworks leave to you:** a full CI pipeline for your project (none of the frameworks in [our comparison](.bkit/comparison.md#frameworks) has one), and 35 [audits](#audits) that find the bugs passing tests miss.

**Researched and battle-tested, not a weekend prompt pack.** bkit is built with bkit: months of research into how agentic engineering works best, refined over **1,700+ commits, 300+ issues and 100+ merged pull requests** run through its own pipeline. Along the way it recorded **300+ lessons and 600+ decisions**. They shaped the rules and prompts you install, and your own repo starts its own record from the first feature.

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/bkit-features-dark.svg">
    <img alt="What ships with bkit, one coloured row per phase. Design: three rival designs, probe code for the risky unknowns, reads your history, reviewed for failure modes. Plan: five reviewers, big work split up, learns from past bugs and postponed work, more than 30 audits. Build: test first and verified, hunts bugs and security holes, checks the plan is still current, skills on demand. Debug: outside evidence from CI and your platforms, root cause first, hard-bug mode, knows when to stop. Ship: honest CI, nothing quietly dropped, docs and memory, never touches main. Every phase: any AI tool, best model per job, independent review, laptop to cloud." src=".github/assets/bkit-features-light.svg" width="100%">
  </picture>
</p>

<a id="whats-inside"></a>

## What's inside: 200+ files of best practice

Everything a senior team would otherwise write down over years, in files you can read:

<!-- prettier-ignore -->
| What | How many | What it does for you |
| --- | --- | --- |
| [Agents](.bkit/prompts.md) | 40+ | Single-job specialists, each with its own model, thinking depth and tool list. A reviewer can read code but can't change it. |
| [Workflows](.bkit/workflows.md) | 6 | The five phases plus a cloud router. Every step ends in a checklist and a mechanical check before the next one starts. |
| [Agent rules](.agents/rules.md) | 70+ | One rulebook every agent follows: read before editing, never defer silently, report honestly, never rewrite history. |
| [Guardrails](.bkit/providers.md#guardrails) | 10+ hook files | Block dangerous commands and secret reads, and make agents investigate before they edit, on all five AI tools. |
| [Audits](.bkit/pipeline.md#audits) | 35 | Security, privacy, accessibility, performance, reliability, database, LLM usage, cost and more. Findings feed straight into a plan. |
| [Project docs](.bkit/shared/docs/) | 10 + [index](.agents/docs.md) | Architecture, data schema, deployments, testing, security, monitoring, design system, tech stack, setup, and an index telling each agent what to read at each step. |
| [Templates](.bkit/templates.md) | 60+ | A full CI pipeline, cloud agents, git hooks, linters, dependency updates, secrets sync, code search, and 10+ ready-made connectors for your platforms. |

**These are the files your agents read, so they're written for agents:** short, dense, tables over prose. For day-to-day use, start with [`.bkit/README.md`](.bkit/README.md); for every agent in the order it runs, see the [pipeline reference](.bkit/pipeline.md).

<a id="how-it-works"></a>

## How it works

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/bkit-pipeline-dark.svg">
    <img alt="The bkit pipeline: design, plan, build and ship, with debug fixing failed tests. Each dot is one of 41 AI agents: 10 in design, 10 in plan, 11 in build, 6 in debug and 4 in ship. It waits for your sign-off after design, after plan and before merge, merges into dev, and leaves production to you. Runs on Claude Code, Cursor, Codex, Antigravity and opencode." src=".github/assets/bkit-pipeline-light.svg" width="100%">
  </picture>
</p>

**One command per job.** Each runs a team of specialised agents, so there are no prompts to write and no steps to remember.

<!-- prettier-ignore -->
| Job | Command | What happens |
| --- | --- | --- |
| Work out how to build it | [`/bkit-design`](.bkit/pipeline.md#bkit-design) | Reads related issues and past decisions. Three agents propose different approaches, two critique them, and throwaway code tests any risky unknown the reviewers flag. **You approve one design.** |
| Plan the work | [`/bkit-plan`](.bkit/pipeline.md#bkit-plan) | A step-by-step plan, stress-tested by five reviewers who also see past bugs and postponed work. Too big for one build? It's split into pieces. **You approve it.** |
| Build it | [`/bkit-build`](.bkit/pipeline.md#bkit-build) | Checks the plan still matches the code, writes each task's tests before its code, verifies every task, hunts for bugs and security holes, adds edge-case tests and opens a pull request. |
| Fix what broke | [`/bkit-debug`](.bkit/pipeline.md#bkit-debug) | Pulls evidence from CI and your platforms, fixes the root cause, re-tests and records the lesson. Hard runtime bugs get their own mode; if it can't fix something, it stops and writes you a clear handover. |
| Ship it | [`/bkit-ship`](.bkit/pipeline.md#bkit-ship) | Checks nothing planned was quietly dropped, waits for every test lane to pass, merges into `dev` and updates the docs. |
| Small, clearly safe change | [`lite:*`](.bkit/lite.md) | One prompt to paste per phase (`lite:design` to `lite:ship`). The agent keeps only the steps and reviewers the change needs and works on the current branch: no separate repo copy, pull request, CI or sign-off stops. Never for schema changes, public APIs, dependencies, secrets, auth or large refactors. |
| Health check | [35 audits](#audits) | One specialist checklist per area. Findings feed straight into `/bkit-plan`. |
| Housekeeping | 7 utility agents | Keep docs, decisions, lessons and known bugs current, and rank what to work on next. |

Every agent in each phase, in the order it runs and what it checks: [pipeline reference](.bkit/pipeline.md#pipeline-map). Every step, verdict and contract: [`.bkit/workflows.md`](.bkit/workflows.md).

<a id="models"></a>

## Which model does each job

**Claude sets the bar, and every other tool gets the model that comes closest to it.** On every other tool, each agent runs on the model that does the same job about as well as Claude, for the least money. You don't pick: install sets each agent's model.

**How the picks are made.** Each kind of job has a bar: Claude's score on [LiveBench Agentic Coding](https://livebench.ai/#/?cats=Agentic+Coding), a public test where models fix real code in JavaScript, TypeScript and Python. For each tool, bkit takes the **cheapest model that reaches the bar**. Where nothing reaches it, the tool's best model gets the job. One model can fill two columns: on opencode, DeepSeek V4.1 Flash clears the bar for the hardest jobs, so it does the everyday jobs too, for a fraction of Claude's cost. Claude is never used on opencode, because opencode is where work goes when your Claude allowance runs out.

<!-- prettier-ignore -->
| Tool | Hardest jobs: design, plans, reviews, security, audits | Everyday jobs: writing code and docs, the second model in each review pair | Summaries |
| --- | --- | --- | --- |
| Claude Code | `claude-opus-5-5` · bar **65.2** | `claude-sonnet-5-5` · bar **59.4** | `claude-haiku-5-5` · bar **~51** |
| Cursor | `cursor-grok-4.5-high` · 56.5 | `composer-2.5` · not measured | `composer-2.5` · not measured |
| opencode + OpenRouter | `deepseek/deepseek-v4.1-flash` · 77.3; `moonshotai/kimi-k3` · 62.2 for risk, security and root-cause agents | `deepseek/deepseek-v4.1-flash` · 77.3 | `z-ai/glm-5.3-flash` · 56.8 |
| opencode + Ollama | `deepseek-v4.1-flash` · 77.3; `kimi-k3` · 62.2 for risk, security and root-cause agents | `deepseek-v4.1-flash` · 77.3 | `deepseek-v4.1-flash` · 77.3 |
| opencode + OpenCode Zen | `deepseek-v4.1-flash` · 77.3; `kimi-k3` · 62.2 for risk, security and root-cause agents | `deepseek-v4.1-flash` · 77.3 | `glm-5.3-flash` · 56.8 |
| opencode + OpenCode Go | `deepseek-v4.1-flash` · 77.3; `kimi-k3` · 62.2 for risk, security and root-cause agents | `deepseek-v4.1-flash` · 77.3 | `deepseek-v4.1-flash` · 77.3 |
| Codex | `gpt-6-astra` · not measured | `gpt-5.6-terra` · not measured | `gpt-6-luna` · 51.2 |
| Google Antigravity | `gemini-3.8-pro` · not measured | `gemini-3.8-pro` · not measured | `gemini-3.8-flash` · not measured |

**Reading the table:**

- **The bars are Claude Opus 5 and Sonnet 5 scores.** bkit runs the 5.5 versions. Opus 5.5 scores level with Opus 5. Sonnet 5.5 scores below Sonnet 5 on LiveBench, but one of its runs stopped early and other benchmarks put it above, so the bar stays at Sonnet 5. Every score and why: [the score board](.bkit/providers.md#agentic-coding-parity-board).
- **Risk, security and root-cause agents get a second model** that reasons differently from the main one, so they don't share its blind spots. On every opencode provider that second model is Kimi K3, which scores a little under the bar for the hardest jobs.
- **Cursor's own models don't reach the bar.** Claude models in Cursor spend paid API credits, so they're opt-in: paste the ready-made Opus block from [Model Overrides](.bkit/prompts.md#model-overrides).
- **"Not measured" means LiveBench hasn't scored that model.** Those Codex, Antigravity and Cursor picks follow each vendor's own description of the model. Check them before you rely on them.
- **Ollama needs a paid plan for every column.** The free models are far below the bar or not scored.
- **Want a different model for one agent?** On Cursor and opencode, add a row to [Model Overrides](.bkit/prompts.md#model-overrides) and run `bkit install` again. Every agent with its model and thinking depth: [`.bkit/prompts.md` § Models](.bkit/prompts.md#models).

<a id="why-its-different"></a>

## Why it's different

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/bkit-fences-dark.svg">
    <img alt="You don't steer AI, you build fences. AI agents start out scattered at design and are funnelled through plan, build, debug and ship into production-grade code. At design and plan, reviewer agents fence the work in; from build onwards, automated checks from the CI template (typecheck, lint, formatting, prose, tests) join them. Work that goes off target is sent back and retried, a failed test goes to debug, which finds the root cause, fixes it and re-runs the tests until they pass, and bkit waits for your sign-off after design, after plan and before merge." src=".github/assets/bkit-fences-light.svg" width="100%">
  </picture>
</p>

**Most AI development frameworks are prompts:** they describe good work and trust the agent to deliver it. But an agent can be talked into calling something done, and a prompt can't stop it. **bkit builds fences instead.** Reviewer agents that didn't write the work fence in the design and the plan. They never see each other's verdicts, and several review groups mix models on purpose, so one model's blind spot is less likely to get past all of them. From the first line of code, automated checks join them, and those can't be argued with.

<a id="agents-and-ci"></a>

## Agents and CI, built to work together

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/bkit-fences-details-dark.svg">
    <img alt="Every change hits the same fences. They never argue, and they grow. On the left, the agents. Every agent in every workflow looks up every definition and caller with code search before a change, is nudged by the agent hooks on every edit, has every workflow step checked by the step gates, and has its code formatted by the pre-commit hook on every commit. /bkit-plan decides the tests each feature adds to the fences (unit, integration or end-to-end). /bkit-build writes each test first, sees it fail, then hits every fence; the pre-push hook sends problems back before they leave your laptop. When a CI lane goes red, its logs give /bkit-debug the context to fix it. When CI is green, the change passes through and /bkit-ship merges it, re-checked on the merge commit. On the right, the fences, nearest and lightest first: code search on every lookup, agent hooks on every edit, step gates on every step, the pre-commit hook on every commit, the pre-push hook on every push, and CI, the strongest, on every push and pull request. The step gates are scripts, not prompts: a step missing its verdict or files can't finish, whatever the agent says. The pre-commit hook formats only the files being committed, so it takes seconds, and your own quick checks can go there too. CI runs integration, end-to-end and live-site tests, and one check fails if any lane failed, was skipped or ran no tests. Hooks, agents and CI run the same commands, and in cloud mode CI's answer starts debug or ship by itself." src=".github/assets/bkit-fences-details-light.svg" width="100%">
  </picture>
</p>

**The strongest fence is CI** (continuous integration): the robot that runs every check on every change, on GitHub's servers, before anything merges. Where other frameworks stop at a pull request and leave CI to you, bkit's workflows are built around it and around the checks that run before it. Every change passes the same fences, nearest and lightest first:

- **Every agent** looks code up before changing it, is nudged by the agent hooks on each edit, can't finish a step until the step gates (scripts, not prompts) find its verdict and files, and has its code formatted on each commit.
- **`/bkit-plan`** decides which tests each feature needs and where each one runs: unit, integration or end-to-end.
- **`/bkit-build`** writes each test before its code and runs it to prove it fails, so a test that can't fail is never added. The pre-push hook sends back anything that fails on your machine; then build opens a pull request, which starts CI.
- **`/bkit-debug`** works from what came back: the logs of the failed lanes, the diff since the last green run, end-to-end reports. It fixes the root cause and pushes, and CI runs again.
- **`/bkit-ship`** checks nothing planned was quietly dropped, then merges into `dev` only when CI's final check is green on the exact commit being merged.
- **On autopilot,** for issues labelled `bkit:auto`, CI's result starts ship (green) or debug (red) in a cloud session, with no laptop open ([cloud setup](.bkit/cloud.md#post-ci-auto-routing)).

What that gets you:

- **The fences grow with every feature.** Each build adds tests every later change has to pass. A prompt-only framework is as strict on your fiftieth feature as on your first; bkit gets stricter.
- **What's sent back is evidence, not a verdict.** A red lane hands debug the failing logs and what changed since the last green run, so the fix starts from the actual error, not a guess.
- **Agents look before they change anything.** Code search ([Serena](https://github.com/oraios/serena)) shows every definition and caller of the code about to change, not just lines with matching words, and [graphify](https://github.com/Graphify-Labs/graphify)'s code map shows what already exists. Fewer bad changes reach the fences at all.
- **Problems are caught at the nearest fence.** Agent hooks nudge on every edit: read a file before changing it, fix the code rather than loosen a check. The pre-commit hook formats in seconds. The pre-push hook runs type checks, unit tests, the prose checker and the junk-code scanner before anything leaves your laptop. CI keeps only what can't run there: integration, end-to-end and live-site tests. Hooks, agents and CI's quick-checks lane all run the same `bkit:gate:*` scripts, so most failures show up on your machine first.

The agent hooks come with install. Serena, graphify and the git hooks are [templates](#templates) you adopt. Compared with other frameworks: [agents and CI](.bkit/comparison.md#agents-and-ci).

<a id="ci-pipeline"></a>

### The CI pipeline

**None of the AI development frameworks in our [comparison](.bkit/comparison.md#frameworks) ships a full test pipeline for your project.** bkit ships one ready to adopt:

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/bkit-ci-dark.svg">
    <img alt="bkit's CI pipeline, flowing left to right: plan the run (work out what to test); check and build (quick checks, unit tests, integration tests, web, iOS and Android builds, database migrations); set the stage (preview deploy, reset test data); test like a user (web, iOS and Android end-to-end tests, and a live-site check); tidy up. Every lane feeds one final check, the only one merging needs, which fails if any lane failed, was skipped or ran zero tests. /bkit-build starts CI by opening the pull request, /bkit-debug reads the logs of any lane that fails and fixes it, and /bkit-ship merges only when the final check is green." src=".github/assets/bkit-ci-light.svg" width="100%">
  </picture>
</p>

- **Ready on day one.** Two lanes run side by side: unit tests, and quick checks (type checking, formatting, a prose checker, a scanner for junk code AI tends to write, a workflow-file checker and `bkit check`).
- **A green tick means every test ran.** One final check joins all lanes and is the only one branch protection needs. It fails if any lane failed, was skipped or cancelled, or ran zero tests, so a half-finished run can't pass as tested. The gates audit flags any check that can never fail.
- **Grows with your project.** 20+ ready-to-enable building blocks: integration tests; end-to-end tests for web, iOS and Android; database migrations (locked once merged, with security-policy checks); coverage reports; waiting for preview deploys; live, smoke and health checks against the deployed site; and a planner that runs only what a change affects. `bkit check` reminds you of each one until you enable or delete it.
- **Safe by default.** Every third-party action is pinned to an exact commit, the downloaded prose checker is checksum-verified, and pull-request titles never reach a script unescaped.
- **Doesn't waste minutes.** A commit that already passed isn't re-tested, and a newer push cancels the older run, except on your production branch, where a deploy must never be cut off halfway.

How the lanes join into the one final check, and what happens on green or red: [CI test scaffold](.bkit/pipeline.md#ci-scaffold).

<a id="memory"></a>

## Right context at the right step

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/bkit-context-dark.svg">
    <img alt="What it knows: right context, right step, written back as it learns. In your repo, bkit reads project docs at every step and updates them at ship; reads and writes lessons, decisions, postponed work and known bugs; writes designs and plans that later steps read; reads audit reports at plan and a code map at every step; keeps run state and stats at every step; adds skills at build and removes them at ship. Outside your repo, it reads and updates the GitHub or Linear issue at every step, searches related issues at design, plan and debug, searches the web at design and debug, reads CI runs and test reports at debug and ship, reads runtime platforms such as Sentry, Vercel, Supabase and Stripe at debug, and opens, fixes and merges the pull request." src=".github/assets/bkit-context-light.svg" width="100%">
  </picture>
</p>

**A chat forgets everything when it ends; bkit doesn't.** It keeps what it knows in plain files in your repo and on your tracker issues. Each step reads what it needs and writes back what it learned:

- **Docs that keep themselves current.** Install sets up the docs a professional project keeps: architecture, data schema, deployments, testing, security, monitoring, design system, tech stack and local setup. Agents fill them in as they work, `/bkit-ship` updates them after every feature, and [an index](.agents/docs.md) tells each agent which docs to read at each step. They stay current because the agents depend on them.
- **Project memory agents actually read.** Four ledgers record lessons from every fix (`docs/knowledge.jsonl`), decisions and their reasons (`docs/decisions.jsonl`), work consciously postponed (`docs/deferrals.jsonl`) and known bugs (`docs/failures.jsonl`). Plan reviewers see the past bugs and postponed work closest to the new feature, debug reads the lessons first, and `/bkit-ship` checks nothing postponed was quietly dropped. Four utility agents keep them honest: they correct lessons and decisions the code has since contradicted, and close postponed work and known bugs that have already been fixed.
- **Tracker issues are memory too.** Every step reads the whole tracker issue (e.g. GitHub, Linear), comments included, and adds what it did as a new comment without editing earlier ones, so the issue becomes the feature's running record. bkit skips its own comments when it reads, so agents act on what people wrote. Design, plan and debug also search your other tracker issues, closed ones included, for earlier designs, duplicate work and past incidents.
- **Outside evidence, when it's needed.** Design searches the web for feasibility. Debug pulls failed CI logs, the diff since the last green run, end-to-end reports and runtime errors. 10+ ready-made connectors cover GitHub, Sentry, Vercel, Supabase, Stripe, Expo, Playwright, Maestro, Inngest, Resend, Cloud Run, Tavily web search and Serena, each easy to customise, extend or leave out. A connector that isn't set up is reported as such, never read as "all clear".
- **Progress lives in your repo, not a chat window.** Run state is saved after every step, so a crashed run resumes where it stopped, on any tool.

<a id="audits"></a>

## Audits find what green tests miss

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/bkit-audits-dark.svg">
    <img alt="The tests were green. The bugs were still there. A map of an app that adopted bkit, in four columns: screens (web and phone), API, services and outside services, with thin lines for the calls between them. Red circles mark what bkit's audit templates found, bigger for bigger problems. Testing audit: tests that could never fail, about 100 of which read the code as text instead of running it; a security hole, where a sign-in link could send people to another website; no test made a request fail, so a failed save could still show “Saved”; a fix in dead code, while the live screen next to it stayed broken; phone tests that weren't, with 23 of 33 actually running as web pages. Duplication audit: one rule written 8 times, whose copies drifted so some billed accounts users had left; one database read in 4 copies, word for word, one inside the API itself. This map used 2 of the more than 30 audit templates bkit ships." src=".github/assets/bkit-audits-light.svg" width="100%">
  </picture>
</p>

**A green tick proves the tests passed, not that they test the right things.** Every finding on this map sat in an app whose tests were passing, and just two of bkit's audit templates found them all.

**Each template is a specialist's checklist for one area:** what to check, how, and what counts as a problem. Ten to start with:

<!-- prettier-ignore -->
| Audit | What it checks | For example |
| --- | --- | --- |
| **Testing** | Whether tests can fail, actually run, and cover what the product must and must never do | Tests that read the code as text instead of running it |
| **Duplication** | Rules and logic built more than once | A billing rule in eight copies that have drifted apart |
| **Security** | Sign-in, permissions, secrets, input checks, and protections the docs promise | A sign-in link that can send people to another website |
| **Red team** | Real attacks on a test copy of your app, never production, one request at a time | One signed-in user reading another user's data |
| **Reliability** | What happens when a service is slow, down or answers twice | A payment retried with no guard against charging twice |
| **Privacy** | Where personal data goes, how long it stays, and whether deletion works | A deleted account still sitting in the logs |
| **Dead code** | Code, settings and routes that look live but never run | A fix made in a file nothing calls |
| **LLM** | Every AI model call, and what stops it when the input is hostile | A pasted document that talks the model into calling a tool |
| **Accessibility** | What automated accessibility checks miss, against WCAG 2.2 AA | A form a screen reader can't get through |
| **Cost** | Vendor plans against what you actually use | A plan two tiers above your usage |

All 35, grouped by area, with what each one finds: [the full audit list](.bkit/pipeline.md#audits).

- **Run one whenever you want.** Name a template to `@bkit-audit-generate` and it writes a report to `docs/audits/{YYYYMM}/`. It reads your code and, where you've connected them, your live platforms, and lists anything it couldn't check rather than calling it clean.
- **Findings turn into work.** Hand the report to `/bkit-plan` and the fixes are planned, built, tested and shipped like any other feature.

<a id="templates"></a>

## Templates ready to adopt

**bkit installs only what its workflows run.** Everything you or another tool runs ships as a template: install puts the latest set in your `.bkit/templates/`, and every upgrade lists which ones changed. **Copy in what you want and own it;** bkit never writes over your copy. The install prompt asks your AI to adopt what fits, and each workflow ends with a tip on the next one worth adding. Audit templates fall under the first rule: bkit's own audit agent runs them, so install puts them straight into `docs/templates/` and there's nothing to copy.

The ones that matter most, in the order to adopt them:

<!-- prettier-ignore -->
| Template | What it's for |
| --- | --- |
| **Serena** | Agents look up code the way your editor does ("where is this defined, and what uses it?") instead of searching for words and reading whole files. Fewer accidental changes, and lower running costs because agents read less. Read-only. |
| **CI pipeline** | Runs every check on GitHub on every change, and `/bkit-ship` waits for it before merging. Without it, "shipped" only means merged, not checked. Two lanes ready to go and 20+ building blocks for the rest ([above](#ci-pipeline)). |
| **Quality checks** | Catches problems on your own machine in seconds, before they reach GitHub: type checking, formatting, a prose checker, a scanner for junk code AI tends to write and a test linter that fails tests which cannot fail, wired into git hooks and CI. Your `bkit:gate:*` scripts in `package.json` define what "the checks" are. |
| **Cloud agents** | When CI finishes, a cloud agent picks up: ship on green, debug on red. No laptop needed. |
| **Context connectors** | `/bkit-debug` reads the real errors instead of guessing from the code: 10+ ready-made connectors for CI, error trackers, hosting, databases, payments, email, queues and the web. |
| **Secrets sync** | Keeps every password and key the same everywhere: one local file, one command to push it to Vercel, GitHub Actions, Google Cloud, Supabase, Expo and Cursor's cloud agents, another to prove every copy matches without printing a value. Prevents "works for me, broken in production". |
| **graphify** | Keeps a map of how your code fits together (`docs/capabilities.md`), so agents check what already exists before building it again. |
| **Dependency updates** | Small, grouped update pull requests from Renovate or Dependabot instead of one big risky upgrade later. GitHub Actions stay pinned, and security fixes skip the queue. |
| **Security scan** | Trivy fails the check when a change adds a known-vulnerable library in any language, a risky container or cluster setting, or a committed password. A daily run catches problems that have no fix yet, which an updater never shows. |
| **Audits** | 35 specialist checklists, one per area: testing, security, privacy, reliability, cost and more. Already installed in `docs/templates/`, so there's nothing to copy: name one to `@bkit-audit-generate` and hand its report to `/bkit-plan` ([above](#audits)). |

All templates, what each is for, and how to install them: [`.bkit/templates.md`](.bkit/templates.md).

## What else you get

### Engineering know-how, built in

- **Best model for each job, on every tool.** Each agent has its own model and thinking depth, per tool and provider: deep reasoning models for architecture and security review, quick ones for summaries. Starting a session on a cheaper model never quietly downgrades the reviewers. [Which model does each job](#models).
- **It tests ideas before you commit to them.** When reviewers flag an unknown a design depends on, design writes throwaway probe code to settle it before you approve. A design reviewer also checks failure modes and monitoring, not just whether it can be built.
- **Big features are split up.** A plan too big for one build becomes a sequence of smaller plans, each re-checked against the current code right before it's built.
- **Numbers on your own work.** Every run records its time, size of change and retries in `.bkit/stats.jsonl`, and posts them to the issue next to the median of your last five runs.

### It fits how you work

- **Never blocked by usage limits.** Out of Claude for the week? Carry on in Cursor, Codex or Antigravity, or point opencode at your own key: OpenRouter, Ollama or the opencode gateways. Same feature, same checks, nothing to set up again. [Tool differences](.bkit/providers.md).
- **Start on your laptop, check in from your phone.** A feature started at your desk can continue in a cloud session (Claude Code on the web or the Claude app, Cursor cloud agents, or opencode on GitHub Actions), or start by itself when CI finishes: ship on green, debug on red. The cloud setup ships ready to adopt: [`.bkit/cloud.md`](.bkit/cloud.md).
- **Run several features at once.** Each works in its own copy of the repo (a git worktree), so they never trip over each other.
- **The right expertise for each feature.** When a plan needs, say, Stripe or Supabase, bkit installs a matching skill for the build and removes it when the feature ships.

### Your tracker is the control panel

- **Every run lives on the tracker issue.** bkit reads the tracker issue (e.g. GitHub, Linear), posts progress as it goes, moves the issue along and links the pull request.
- **Issues that start the right step.** Optional issue forms for a new idea, a well-defined change or a bug ask for what the agents read first, and each names the command to run next. A well-defined change can be the plan itself: what done looks like, the tests and the tasks.
- **It tells you what to work on next.** `@bkit-utility-update-roadmap` reads your board and the open known bugs and postponed work from the ledgers, then writes a ranked shortlist into `docs/roadmap.md`.
- **See it live:** [bkit's own board](https://github.com/users/cbartens/projects/1/views/1), and the shortlist bkit ranked from it in [`docs/roadmap.md`](docs/roadmap.md).

### You stay in control

- **Decide in plain English, not code.** Before any code is written you approve two short documents: a design ("three ways to build this; we recommend this one, because…") and a plan ("these twelve steps, and how we'll know each is done").
- **Three sign-offs, and production stays yours.** The full workflows stop after the design, after the plan and before merging. bkit merges into your `dev` branch and never touches `main`: promoting to production is always your call. Cloud mode ships on green without you only for issues you've labelled `bkit:auto`; removing the label stops it. Lite workflows skip the stops, and only run when you choose them for a small change.
- **Guardrails on the AI itself.** Dangerous commands like force-pushing or rewriting history are blocked, private keys can't be read, and each agent only gets the tools its job needs. [What each guard does](.bkit/providers.md#guardrails) and [what it tells agents](.bkit/prompts.md#hook-injected-text).

<a id="token-costs"></a>

## Spending fewer tokens

<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset=".github/assets/bkit-tokens-dark.svg">
    <img alt="Compression saves 1 to 3 percent; the risks cost more. Where Claude Code's cost goes across 456 real bkit transcripts: 69 percent is the model re-reading the system prompt, rules, tool list and conversation on every request; 4 percent is the model's own writing; 27 percent is big tool output, the only part a compressor can touch; the tools remove 1 to 3 percent of the bill. What you gain: 1 to 3 percent of the bill saved, big cuts on huge logs, prompt cache intact. What it costs you: wrong answers from compressed logs, broken code when lines are rewritten or cut, hidden content that costs tokens to fetch back, silent failures that turn compression off, a proxy that sees all your model traffic, and clashes with bkit's own setup." src=".github/assets/bkit-tokens-light.svg" width="100%">
  </picture>
</p>

**Most of what a session costs is the model re-reading, not writing code.** On every request, Claude Code sends the system prompt, rules, tool list and the whole conversation so far, and the model reads all of it again. Across 456 real Claude Code transcripts from a repo that uses bkit, re-reading was **69% of the bill**. The model's own writing was 4%.

**Why bkit doesn't use compression tools.** They shorten the output of commands and file reads before the model sees it. That output was 27% of the bill, and most of it is code the agent needs word for word, so there's little a tool can safely cut. We measured three: none saved more than 3% of the bill, and the ones that saved most did it by changing what the agent reads. One made an agent answer a question wrongly; another rewrote code.

<details>
<summary><strong>The three tools, how we measured, and why the risks outweigh the saving</strong></summary>

<!-- prettier-ignore -->
| Tool | How it works | Share of the bill saved | What went wrong |
| --- | --- | --- | --- |
| [caveman](https://www.npmjs.com/package/@caveman-ai/cli) | Sits between Claude Code and the model and shortens tool output | 1.3% | An agent answered a question wrongly from a compressed log |
| [Headroom](https://pypi.org/project/headroom-ai/) | Same idea, plus an optional text model that rewrites output | 2.8% with the text model, 0.8% without | The text model rewrote code: `(preset) => void` came back as `(preset) void` |
| [RTK](https://github.com/rtk-ai/rtk) | A hook that swaps shell commands for versions that print less | 0.7–2.1% | Its `grep` strips indentation and cuts lines at 80 characters |

**How we measured.** The cost split above comes from all 456 transcripts. The table compares the three tools on the 314 of them still on disk when RTK was tested, so all three are measured on the same data. We ran each tool over the large tool results, with no model calls. Each result counts by how often the model re-read it later, because that's what it cost. RTK acts before a command runs, so we re-ran the read-only commands with and without it. Full method, every result with its 95% range, and the scripts: [the comparison](tests/compression/bkit-caveman-headroom-compression-proxy-comparison.md). Your sessions may differ: run the scripts on your own transcripts before you choose.

**Why the risks outweigh the saving, for now.** The saving is real but small, and the tools that save most get there by changing what the agent reads. An agent reading a shortened log can answer wrongly. An edit quoting a rewritten or cut-off line won't match the file. Either way the agent goes round again, and every extra round re-reads the whole conversation, so it doesn't take many to wipe out a 1–3% saving. On top of that, a proxy sees all your model traffic, and when one of these tools breaks, it tends to switch itself off without telling you. That could change if a tool learns to leave code alone and fail loudly.

</details>

**What bkit does instead: read less.** Cutting what gets read loses nothing, and a line an agent never reads is a line it never re-reads on every later request.

- **Find the definition first, then read only those lines.** Reading files through the shell (`sed`, `grep`, `cat`) was about 60% of what shell output cost in our transcripts. A whole file can be thousands of lines when the change needs ten.
- **List matching files first, then search inside them.** A broad search can return hundreds of lines the agent never needed, and they stay in the conversation.
- **Ask commands, APIs and databases for short, structured output.** An unfiltered log or API response can run to thousands of lines, re-read on every later request.
- **Flag re-reads of a file that hasn't changed,** with a [hook](.bkit/prompts.md#hook-injected-text) on all five supported tools. 41% of file reads in our transcripts were repeats, each adding a second copy to the conversation.
- **Prefer command-line tools to MCP servers** for logs, errors and database data. Every connected MCP server's tool list is re-sent with every request, used or not.
- **Each step reads only the project docs it needs.** Whatever a step reads at the start is re-read on every request in that step.
- **A utility agent shortens markdown files without changing what they say.** Rules and prompts go out with every request of every agent, so a line cut there is saved many thousands of times.

**Or run fewer steps.** For a change that's clearly small, the [lite workflows](.bkit/lite.md) keep only the steps and reviewers it needs, so fewer requests re-read the conversation. You give up the safety checks, so the full workflow stays the default.

**What [`bkit tips`](.bkit/README.md#ongoing-cli) suggests for your repo:**

- **Set up Serena,** so agents ask where code is defined and what uses it, like your editor does. That's cheaper than reading whole files, and it doesn't miss callers that text search would.
- **Switch off claude.ai connectors** (MCP servers from your claude.ai account) in Claude Code for this project: `"disableClaudeAiConnectors": true` in `.claude/settings.json`. Otherwise their tool lists are re-sent with every request, used or not.
- **Lock MCP servers to this project.** A server that can see your whole account makes agents look up account and project IDs before every task; locked, those extra calls disappear.
- **Summarise long sessions earlier:** `"autoCompactWindow": 300000` in `.claude/settings.json`, or `model_auto_compact_token_limit` in `.codex/config.toml`. By default a session grows close to the model's full size before it summarises, and every request re-reads all of it. Summaries lose some detail, so bkit suggests this rather than setting it.

## FAQ

**Do I need to know how to code?**
No, but you need to read a design and a plan and decide whether they're right. Setup is a few terminal commands, or one pasted prompt.

**Who is it not for?**
bkit is heavier than a single prompt. For a one-off script or a quick experiment, just ask your AI. bkit pays off on a project you'll keep changing and want to trust.

**Does it work on an existing project?**
Yes. Install needs a git repo with a `package.json`, because bkit installs as an npm package. It adds its own files and writes into shared ones such as `CLAUDE.md`, `.gitignore` and `docs/*.md` only between `bkit:start` and `bkit:end` markers, leaving the rest alone. The project docs fill in as agents work on your code.

**What does install change, and can I remove it?**
Every file it writes is listed in [what install writes](.bkit/README.md#what-install-writes). `bkit uninstall` removes bkit's files and blocks, and keeps your own edits and every template you copied ([uninstall](.bkit/install.md#uninstall)).

**What does it cost?**
**bkit is free and open source** under the MIT licence, commercial use included ([License](#license)). It runs on AI subscriptions you already have (Claude, Cursor, ChatGPT for Codex, Google Antigravity), on Antigravity's free tier, or with your own key on pay-as-you-go providers through opencode (OpenRouter, Ollama or the opencode gateways). Several agents reviewing in parallel use more of your quota than a single chat; that's the price of the second opinions.

**How long does a feature take?**
No full run, from design to merge, has taken longer than a day. Each run posts its own time to the issue, next to the median of your last five runs, so you can see how yours compare.

**Can it break my live site?**
**Not without your sign-off.** In the full workflows, work happens in a separate copy of the repo, goes through a pull request, must pass every test, and merges into `dev`, never `main`. Lite workflows skip the pull request and CI, which is why they're only for small, clearly safe changes.

**Which issue tracker, and which code host?**
GitHub Issues or Linear for the tracker. The code has to live on GitHub: pull requests, CI and cloud mode run there.

**Is this the bkit Vibecoding Kit?**
No. [bkit Vibecoding Kit](https://github.com/popup-studio-ai/bkit-claude-code) is a separate project that shares the name. This bkit is `@cbartens/bkit` on npm, at [github.com/cbartens/bkit](https://github.com/cbartens/bkit).

**How does it compare with other tools?**
Feature by feature against the main AI development frameworks, from spec toolkits to autonomous agents: [`.bkit/comparison.md`](.bkit/comparison.md#frameworks).

**Why doesn't bkit use a compression tool like caveman, Headroom or RTK?**
On real bkit sessions they saved 1–3% of the bill, and each changes what the agent reads in ways that can lead to wrong answers or broken edits. bkit cuts reading instead, which loses nothing. Numbers, risks and what bkit does instead: [Spending fewer tokens](#token-costs).

<details>
<summary><strong>For engineers: what's under the hood</strong></summary>

- **Isolation.** Every run gets its own git worktree; a per-feature lock blocks duplicate runs of the same feature, and a short repo-wide lock serialises only the moments that write to `dev`.
- **Resume from state, not session.** Run state lives in `status.jsonl` and `docs/plans/`. A crashed or interrupted run resumes from its last completed step, on any host.
- **Mechanical step gates.** `bkit steps finish` checks each step's verdict and artifacts before the workflow moves on; build ticks a task only on a confirmed artifact; ship's deferred sweep fails the merge on an unplanned gap.
- **Engine.** The `bkit` CLI is TypeScript in [`.bkit/core/engine/`](.bkit/core/engine/), built to `dist/`, covered by 5,800+ tests. `commands/` holds what you type; `install/`, `render/`, `checks/`, `ledgers/` and `shared/` hold the code underneath; `audits/` holds the tests that read shipped text.
- **One source, every host.** `.bkit/` renders `.claude/`, `.cursor/`, `.codex/`, `.agents/` (Antigravity) and `.opencode/`. `bkit check` is the CI drift gate.
- **Reviewer independence.** Parallel reviewers can't read sibling output. Design brainstorm, design review and plan scope-check groups also cross models (Opus + Sonnet on Claude; Grok + Composer on Cursor); depth-sensitive lenses (plan review, build challenge) stay on the top tier.
- **Per-agent pins.** Model and effort per agent, per provider ([`.bkit/prompts.md`](.bkit/prompts.md) § Models), immune to the session default.
- **Against the literature.** bkit fully implements 13 of the 22 patterns in Antonio Gulli's _Agentic Design Patterns_, partly implements 7 (scoped to shipping code), leaves 2 out by design, and goes beyond the book in 8 places. Full mapping: [patterns comparison](.bkit/comparison.md#patterns), with [where bkit goes beyond the book](.bkit/comparison.md#beyond-the-book) and its [known gaps](.bkit/comparison.md#known-gaps). Every agent in execution order: [pipeline reference](.bkit/pipeline.md).

</details>

## Documentation

<!-- prettier-ignore -->
| Read | For |
| --- | --- |
| [`.bkit/install.md`](.bkit/install.md) | Install, upgrade, CI auth, uninstall, recovery |
| [`.bkit/README.md`](.bkit/README.md) | Day-to-day use: running workflows, environment, tracker setup, CLI |
| [`.bkit/workflows.md`](.bkit/workflows.md) | Every workflow step, verdict and contract |
| [`.bkit/providers.md`](.bkit/providers.md) | Tool and provider differences, guardrails, model pins |
| [`.bkit/cloud.md`](.bkit/cloud.md) | Cloud agents: Claude Code on the web, Cursor, opencode |
| [`.bkit/templates.md`](.bkit/templates.md) | Templates ready to adopt |
| [`.bkit/lite.md`](.bkit/lite.md) | Lite workflows: shorter prompts for small changes |
| [`.bkit/pipeline.md`](.bkit/pipeline.md) | Every agent in the order it runs, the CI scaffold, every audit template |
| [`.bkit/comparison.md`](.bkit/comparison.md) | Comparison with other AI development frameworks and with _Agentic Design Patterns_ |
| [`CHANGELOG.md`](CHANGELOG.md) | What changed in each release |

<a id="quick-start"></a>

## Quick start

**You need** a GitHub repo with a `package.json`, Node 24+, pnpm, and at least one of Claude Code, Cursor, Codex, Google Antigravity or opencode.

**Easiest:** copy the [install prompt](.bkit/install.md#install--first-time) into your AI coding tool and let it do the setup.

**By hand:** bkit is public on npm and installs like any other package, with no token or registry setup.

```bash
pnpm add -D @cbartens/bkit
pnpm bkit install --claude    # pick your tools: --claude --cursor --codex --antigravity --opencode=<provider>
# opencode provider: openrouter | ollama | opencode-zen | opencode-go
```

**Check it worked:** `pnpm bkit check` confirms every installed file matches the version you pinned (CI runs the same check), and `pnpm bkit tips` lists what isn't set up yet, most useful first.

Adopt the [templates](#templates) you want from `.bkit/templates/`, open an issue, and run the first step from your AI tool:

```text
/bkit-design ISSUE-123
```

Already know exactly what to build? Start at `/bkit-plan`. Something broken? `/bkit-debug`; add `[repro]` if nothing fails yet, and it writes the failing test first.

Full install, upgrade and CI setup: [`.bkit/install.md`](.bkit/install.md). Tracker labels and environment variables: [`.bkit/README.md`](.bkit/README.md#prerequisites).

## Credits

bkit's process was worked out over months of building real products with it. These projects sharpened specific ideas along the way:

<!-- prettier-ignore -->
| Project | Idea bkit took |
| --- | --- |
| [everything-claude-code](https://github.com/affaan-m/ECC) (affaan-m) | [GateGuard](.bkit/prompts.md#hook-injected-text), the hook that makes an agent investigate before it edits, name included; the warning when an agent edits lint or type-check settings; confidence and scope on recorded lessons; the untrusted-input notice on agents that read outside content. |
| [gstack](https://github.com/garrytan/gstack) (Garry Tan) | Writing the setup once and generating every AI tool's copy from it, with a check that the copies match; the completeness and search-before-building principles in the shared rules; resuming a run from saved state. |
| _Agentic Design Patterns_ (Antonio Gulli) | A "done when" line on every plan task, and testing hypotheses before fixing in debug. The book is also the yardstick in the [patterns comparison](.bkit/comparison.md#patterns). |
| [skills](https://github.com/mattpocock/skills) (Matt Pocock) | The interview that opens `/bkit-design`, adapted from `grill-me`: open questions are settled with you before any design work starts. |

**Built on.** The templates set up these tools; thanks to their maintainers: [Serena](https://github.com/oraios/serena), [graphify](https://github.com/Graphify-Labs/graphify), [slop-scan](https://github.com/modem-dev/slop-scan), [Vale](https://github.com/vale-cli/vale) with [write-good](https://github.com/vale-cli/write-good), [Renovate](https://github.com/renovatebot/renovate), [Dependabot](https://docs.github.com/en/code-security/dependabot), [Trivy](https://github.com/aquasecurity/trivy), [Husky](https://github.com/typicode/husky), [lint-staged](https://github.com/lint-staged/lint-staged), [Prettier](https://github.com/prettier/prettier), [actionlint](https://github.com/rhysd/actionlint) and [direnv](https://github.com/direnv/direnv).

## License

bkit is [MIT](LICENSE.md): use it, change it and share it for any purpose, commercial included, as long as the copyright and licence notice stay with it.

**The code bkit's agents write for you is yours.** The licence covers bkit itself, not what its agents produce in your repo.

The full text travels in your repo at [`.bkit/LICENSE.md`](.bkit/LICENSE.md) after install.
