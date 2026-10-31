# bkit — Pipeline Reference

{{BKIT_MANAGED_MARKER}}

> [!CAUTION]
> **Purpose:** A reference for people: the five-phase pipeline, every subagent (the phases in the order they run, then the audit and the utilities) and every audit template. It serves evaluation and onboarding, and it is not one of the docs agents load during a workflow. How bkit compares with other frameworks and with _Agentic Design Patterns_ is in `.bkit/comparison.md`.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - Keep the prose factual, with no hype adjectives. The house and write-good linters apply to `*.md`.
> - A heading linked from outside this file carries a fixed `<a id>` above it. Keep the id when you reword the heading.
> - Leave out each subagent's model, effort and tier. Those live only in `.bkit/prompts.md` § Models.
> - **If** the pipeline or the subagents change → update this file to match `.bkit/core/workflows/*` and `.bkit/core/.bkit/prompts.md`.
> - **If** an audit template is added, removed or renamed → update § Audits to match `.bkit/core/docs/templates/bkit-audit-*.md`.

**Contents**

- [What this is](#what-this-is)
- [Pipeline map](#pipeline-map) · [CI test scaffold](#ci-scaffold)
- [Design](#bkit-design) · [Plan](#bkit-plan) · [Build](#bkit-build) · [Debug](#bkit-debug) · [Ship](#bkit-ship)
- [Audits: every template](#audits) · [Utilities](#utilities)

## What this is

bkit turns a single coding-agent request into gated, peer-reviewed engineering. Each of its five commands, `/bkit-design` → `/bkit-plan` → `/bkit-build` → `/bkit-debug` → `/bkit-ship`, fans out to specialised single-purpose subagents: 39 in total, counting the phases, the audit and the utilities. Many run in parallel under different lenses, such as bug review and security review, so the output gets an independent review before a person sees it. The same pipeline runs on five hosts: Claude Code, Cursor, Codex, Google Antigravity and opencode.

Beside those commands, 35 read-only audit templates live at `docs/templates/bkit-audit-*.md`. `@bkit-audit-generate` runs one and writes `docs/audits/{YYYYMM}/{slug}.md`. `/bkit-plan` takes a design, one or more of those reports, or both.

Each phase below lists its subagents in the order they run. "Parallel" means the subagents run at the same time and their outputs are merged afterwards. Distinct lenses mean the review comes from several perspectives. Orchestrator steps (git, worktree, tracker) are noted but not listed as subagents. The model and thinking depth of each subagent on each host are in `.bkit/prompts.md` § Models.

<a id="pipeline-map"></a>

## Pipeline map (key steps only)

```
┌────────────────────── bkit-auto (opt-in cloud router) ─────────────────┐
│ workflow_run on feat/**  → ship (CI green) / debug (CI red)            │
│ workflow_dispatch        → ship|debug|design|plan|build                │
│ Dispatches the matching /bkit-* skill — runs unattended in cloud       │
│ (Claude Code on the web / Cursor cloud agents / opencode).               │
│ Opt-in: `bkit install --auto=claude|cursor|opencode`. See `.bkit/cloud.md`. │
└────────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼

/bkit-design ───── output: detailed design ───────────────────────────────────
  1. grill              (human interview, one decision frontier per round;
                         last round confirms a DRAFT acceptance scenario;
                         skipped headless: recommended answers recorded as assumed)
  2. fetch related       (semantic tracker search, rank order → related-issues.md)
  3. brainstorm x 3 (parallel, distinct lenses, no sibling reads)
     • pragmatic  • optimal-tradeoff  • risk / pre-mortem
  4. generate design     (synthesise across lenses + related issues)
  5. review x 2 (parallel, distinct lenses, on different models)
     • feasibility (web)  • operability (failure modes, observability, on-call)
  6. spike               (only if review flags load-bearing unknowns:
                         throwaway probe code, confined to the run's log folder)
  7. update design       (fold reviews + spike back in)
  8. organise            (workstreams + DAG, grouped into plans: the filed unit)
  9. summary             (engine-written from status rows, tracker-facing)

/bkit-plan ───── output: detailed plan ───────────────────────────────────────
  1. generate plan       (task groups within bkit.workflows.tasks caps, in build order;
                         engine plan-check right after, one fix retry)
  2. fetch context       (tracker: related issues; ledgers: prior deferrals,
                         prior failures, strongest term-overlap first, top 40
                         → feeds all three reviewers below)
  3. review x 2 + scope-check (parallel, one round, distinct lenses)
     • plan text: tightness, dependency order  • code: regression risk
     • scope check: template, criteria, verification
  4. update plan         (merge all three in one pass, max-wins on CRITICAL;
                         engine plan-check right after, one fix retry)
  5. summary             (engine-written from status rows, tracker-facing)

/bkit-build ─── output: code, PR to dev, CI takes over ──────────────────────
  1. plan-check          (engine: plan in group and task blocks, within caps?)
    ↳ no plan, no task markers, or comments newer than the plan → plan-convert writes {FID}-plan.md
      (from the prompt, issue and any plan; where they disagree, the newer text wins)
  2. plan-current        (plan still executable against code landed since it was written?)
  3. install-skills
  ┌ per task group, in order ─────────────────────────────────────────────
  │ 4. brief             (engine: the group's open tasks + plan context)
  │ 5. execute group     (producer — implement the group's tasks, reds first;
  │                       turn cap near → HANDOVER, re-run once)
  │ 6. verify group      (critic — the group's own diff; passes satisfied task numbers, engine ticks)
  │                       ↶ producer-critic loop, capped 3 attempts;
  │                         unfixable gaps / no progress → Decision Pause (human, in session)
  │ 7. gaps-remediate    (fix verifier gaps, re-verify)
  └ group gate between groups (static + unit) ─────────────────────────────
  8. verify build        (holistic second pass across whole plan, once)
  9. challenge           (size gate first: under 300 lines and 10 files → security only;
                         else both in parallel, distinct lenses, no sibling reads)
    • bug-hunting (large changes)  • security (always)
  10. challenge merge    (engine: findings become plan tasks, each with a test first;
                         a repeated finding reopens its open task; LOW → deferred;
                         fixable → back to the group loop, a last-round fix not
                         challenged again; unfixable → Decision Pause; two rounds at most)
  11. run tests          (local tier: lint + typecheck + unit + slop:delta + bkit check;
                         no integration / e2e / @live — those run in CI)
    ↳ on test failure → /bkit-debug (debug-failure-diagnose + remediate)
  12. summary            (engine-written from status rows + plan tasks, tracker-facing;
                         no plan file or an unticked task → FAIL)
  → PR opened; CI runs the full multi-tier scaffold (see "CI test scaffold" below)

/bkit-debug ─── side-rail, invoked on test/CI failure ────────────────────────
  1. run tests          (broader tier than build: lint + typecheck + unit
                        + integration + e2e + optional @live canary —
                        reproduces against the deployed boundary)
  2. fetch context       (only if tests FAIL; CI: failed jobs/steps + error
                         annotations + failed-step logs; e2e test reports; local
                         test output; diff vs last-passing CI; runtime logs via
                         context-fetch blocks; tracker: related issues by error
                         signature → feeds diagnose below)
  [repro] (first run passes — bug not reproduced yet):
  2. fetch context, then reproduce (tests that fail on the reported
                        symptoms → back to 1; can't reproduce → summary)
  Normal mode (localisable failure):
  3. diagnose           (reads docs/knowledge.jsonl for prior failures;
                        Standard → Pivot → Final strategy escalation)
  4. remediate          (apply diagnosis fix)
  5. re-run tests
  6. summary            (engine-written from status rows)
    ↳ if diagnose can't localise, or loop exhausts 3 strategies → Soak mode
  Soak mode (non-localisable / runtime-only failure):
  1. soak loop          (one accumulating context per iteration:
                        instrument OR smallest evidence-backed fix;
                        strips all scaffolding before declaring a fix)
  Escape hatch:
  abort-handover       (unrecoverable failure → human handover doc + stop)

/bkit-ship ─── output: squash-merged PR, hard stop before main ──────────────
  1. conflict-resolve    (only if rebase sentinels exist)
  2. deferred-sweep      (pre-merge completeness gate; FAIL blocks merge)
  3. run tests           (wait for CI on squash-merge SHA; bkit-tests-check
                         must be green — every planned tier ran and passed;
                         a planned bkit-tests-live-web failure reds it)
  4. merge               (orchestrator-only guarded git op)
    ↳ on post-merge failure → /bkit-debug (diagnose + remediate)
  5. update-docs, then summary (engine-written, with PR size)
  6. prune skills + update local dev + close  (orchestrator-only;
                         close removes the worktree)
```

<a id="ci-scaffold"></a>

## CI test scaffold (runs on every PR + push)

The template `bkit-ci.yml` is copied into `.bkit/templates/`, and the consumer adopts and owns it. It is static: two lanes run in parallel, and the `bkit-tests-check` capstone joins them as the single branch-protection check. There is no planner. The capstone fails unless both lanes concluded `success`, and it fails when the unit lane reports zero executed tests.

```
bkit-tests-static   (typecheck, lint, format, prose lint, slop, actionlint, bkit check)
bkit-tests-unit     (unit tests; writes the executed-test count)
        │
        ▼
bkit-tests-check    (capstone: needs both lanes; sole required check)
```

Add the lanes the repo has (integration, E2E, migration, live) as further `needs:` of the capstone. The full tier rules are in `docs/testing.md`.

The pipeline stops hard after Design, Plan and Ship. A production merge needs explicit human approval. Some subagents are shared across phases: `bkit-debug-failure-diagnose` and `bkit-debug-failure-remediate` run inside the Build and Ship failure paths as well as in the Debug phase.

With `bkit-auto` enabled, the loop runs unattended. Build opens a PR, and CI runs. On green, `bkit-auto` dispatches `/bkit-ship`. On red, it dispatches `/bkit-debug`, debug re-pushes, CI re-runs, and `bkit-auto` routes again. No local session is needed until a human gate fires.

<a id="bkit-design"></a>

## Phase 1 — `/bkit-design`

Output: the reviewed design (`docs/plans/{YYYYMM}/{FID}-design.md`). The phase stops hard for human approval.

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-design-brainstorm-ideate-1` | Pragmatic | Independent design exploration. Forbidden from reading its siblings, as a guard against circular reasoning. |
| `bkit-design-brainstorm-ideate-2` | Optimal-tradeoff | Same task, different lens, on a different model from its siblings. |
| `bkit-design-brainstorm-ideate-3` | Risk / pre-mortem | Same task, failure-mode lens. |
| `bkit-design-generate` | Synthesiser | Merges three brainstorms into one design. Merges across lenses rather than collapsing to consensus. |
| `bkit-design-review-1` | Feasibility (web) | Adversarial review with live web search; checks ecosystem feasibility per capability. |
| `bkit-design-review-2` | Operability | Parallel review on a different model from review-1: failure modes, observability, on-call ergonomics. |
| `bkit-design-spike` | Probe unknowns | Only when a review flags load-bearing unknowns: settles them with throwaway probe code, confined to the run's log folder. |
| `bkit-design-update` | Apply review | Folds both reviews (and the spike, if run) back into the design. |
| `bkit-design-organise` | Structure | Splits the reviewed design into dependency-annotated workstreams and plans. |

<a id="bkit-plan"></a>

## Phase 2 — `/bkit-plan`

Output: an executable plan (`{FID}-plan.md`), its tasks in groups the build runs one at a time. The phase consumes the design, and stops hard.

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-plan-generate` | Generate | Turns the design into groups of task blocks, in build order. |
| `bkit-plan-review-1` | Tightness + dependency order + design-coverage | Read-only critique of the plan text; flags drift, out-of-order tasks and missing prerequisites as CRITICAL. Parallel. |
| `bkit-plan-review-2` | Regression-risk | Same scope, reads the code: traces each task's surfaces to their consumers. Parallel. |
| `bkit-plan-scope-check` | Internal-completeness | Mechanical scope audit: verifies the template structure, and each task's scope and verification. Each task's `DONE WHEN` / `TEST FIRST` belong to `bkit tests plan-check`. Parallel. |
| `bkit-plan-update` | Apply review (merge) | Merges all three critiques in one pass, max-wins on CRITICAL findings. |

<a id="bkit-build"></a>

## Phase 3 — `/bkit-build`

Output: a PR to `dev`. This is the heaviest phase: most of its steps verify rather than produce. CI takes over after the PR.

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-build-plan-convert` | Plan writer | Runs only when the plan is missing, has no task markers, or is older than an issue comment. Writes `{FID}-plan.md` as groups of task blocks within the `bkit.workflows.tasks` caps, from the build-input file (prompt and issue) and any existing plan, whose other sections it keeps. Where they disagree, the newer text wins. |
| `bkit-build-plan-current` | Plan freshness | Judges whether changes landed since the plan was written leave it executable; findings feed execute. |
| `bkit-build-install-skills` | Setup | Installs the skills the plan needs for this build. |
| `bkit-build-plan-execute` | Producer | Implements one task group's tasks from its brief, seeing each task's tests fail first. Iterates edit → lint/typecheck/test → edit. Near its turn cap it hands over (`HANDOVER`), and the group re-runs once. |
| `bkit-build-plan-verify` | Critic | Verifies each task of one group against the group's own diff. Passes the satisfied task numbers, and `bkit tasks tick` sets the boxes. Producer-critic loop, capped at 3 attempts per group. |
| `bkit-build-plan-gaps-remediate` | Gap-fixer | Fills gaps the verifier found, then re-verifies. |
| `bkit-build-plan-verify` | Holistic critic | Second, whole-of-plan verification pass across everything built. |
| `bkit-build-challenge-1` | Bug-hunting | Adversarial review of the full diff. Writes each finding as a plan task with a test first. Forbidden from reading its sibling. Parallel. Runs only on a large change (300+ lines or 10+ files, `docs/plans/**` excluded, measured by `bkit challenge gate`). A small change runs `-2` alone. `bkit challenge merge` then appends the findings to the plan, and execute and verify fix them. |
| `bkit-build-challenge-2` | Security | Same diff, security lens. Runs on every change, alone on a small one. |
| `bkit-debug-failure-diagnose` | Diagnostician | When tests fail, diagnoses with Standard / Pivot / Final strategy escalation. Shared with debug. |
| `bkit-debug-failure-remediate` | Fixer | When tests fail, applies the diagnosed fix. |

<a id="bkit-debug"></a>

## Phase 4 — `/bkit-debug`

Output: a remediated commit on the feature branch. The phase has two modes:

- Normal mode diagnoses a failure that can be localised, then remediates it.
- Soak mode runs one accumulating-context instrument-or-fix loop for failures that cannot be localised or that appear only at runtime.

Normal mode escalates to soak when diagnose cannot localise the failure, or when the normal loop exhausts three strategies. Soak mode adds observation logging (`[DEBUG-OBSERVE]`), and strips it before the fix ships.

**Context fetch.** On each failed attempt, `/bkit-debug` runs each `context-fetch` bash block below `<!-- bkit:end -->` in `.agents/context.md`. The contexts are failing CI logs, the diff since the last green run, end-to-end reports, runtime errors (Sentry, Vercel, Supabase, Stripe and more) and web search (Tavily). It writes one artifact per context, and narrates `CHECKED` / `SELF-SKIPPED` / `NOT CONFIGURED` before fetching. The fetch is fail-soft and driven by the blocks: bkit hardcodes no CI host, workflow filename or test framework, and a context with no block is never read as a clean result.

**Normal mode**

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-debug-failure-reproduce` | Reproducer (`[repro]` only) | Nothing fails yet → writes tests that fail on the reported symptoms, never a fix. In soak mode, the tests repeat the scenario. Not reproduced → the tests are removed, and the run ends at Summary. Reproduced, but the re-run passes with no fix → Summary. |
| `bkit-debug-failure-diagnose` | Diagnostician | Reproduces and diagnoses. Accumulates per-attempt context; escalates Standard → Pivot → Final. |
| `bkit-debug-failure-remediate` | Fixer | Applies whatever the strategy-aware diagnosis produced, with a test loop. |

**Soak mode**

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-debug-failure-soak` | Instrument-or-fix loop | One accumulating context against the failing boundary; each iteration either adds `[DEBUG-OBSERVE]` instrumentation or applies the smallest evidence-backed fix, stripping all scaffolding before declaring a fix. Bounded by `SOAK_ATTEMPT` (counted across every debug run of the feature). |

**Escape hatch**

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-debug-abort-handover` | Handover | On unrecoverable failure: writes a human handover doc and stops cleanly. Shared across phases. |

<a id="bkit-ship"></a>

## Phase 5 — `/bkit-ship`

Output: a squash-merged PR, updated docs, pruned skills and a torn-down worktree. The phase is safety-critical: it has hard guards on the production branch, and touching `main` needs explicit human approval.

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-ship-conflict-resolve` | Conflict resolver | Resolves merge conflicts against the integration branch, then runs the tests. |
| `bkit-ship-deferred-sweep` | Pre-merge completeness gate | Builds the intended-delivery set from the plan's `Acceptance Scenario` sections and `DONE WHEN` fields. FAILs the merge if it finds any unplanned gap (a silent `TODO`, a skipped test). Declared deferrals are resurfaced, never blocking. Gates only what the repo can prove: plan gate checkboxes, `Verification Plan` boxes and `Manual Verification` steps are build-phase process and never gated, and no plan precondition or merge condition blocks, however a log or summary restates it. |
| `bkit-debug-failure-diagnose` | Diagnostician | When post-merge checks fail, diagnoses the regression. Shared with debug. |
| `bkit-debug-failure-remediate` | Fixer | When post-merge checks fail, applies the fix. |
| `bkit-ship-update-docs` | Docs | Updates knowledge / decisions / completed docs. |

Orchestrator-only ship steps: regression guard, merge, skill pruning, update local dev (`bkit branches sync-dev`, which never checks out `dev`) and close (which removes the worktree). The orchestrator performs the guarded git and tracker operations itself, not through subagents.

## Audits

Audits have no command and no phase label. One subagent runs one template per run.

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-audit-generate` | One template | Runs `docs/templates/bkit-audit-*.md`. Writes `docs/audits/{YYYYMM}/{slug}.md` (`{slug}` = basename without `bkit-audit-`; same slug already in that month → `{slug}-{TIMESTAMP}.md`). The report is the template through `bkit:end`. Refines that template's `Project Instructions` below `bkit:end`. Issue named in the invocation and tracker wired → posts the final summary there as one comment. No issue named and tracker wired → searches for the template's audit parent and posts there. None open → suggests one, with the summary saved for its first comment. |

`/bkit-plan` reads a design doc, one or more reports, or both. The invocation names which findings are in scope. The rest of each report stays context. With neither, the issue is the plan's source: a well-defined change issue carries its narrative, success criteria, edge cases, tests and tasks into the plan.

All 35 templates, by area. Each template's file is `docs/templates/bkit-audit-{template}.md`.

<!-- prettier-ignore -->
| Area | Audit | Template | What it finds |
| --- | --- | --- | --- |
| **Security and privacy** | Security | `security` | Holes in sign-in, permissions, secrets and input checks, plus documented protections that never run. |
|  | Red team | `red-team` | Attacks a test copy of the app, never production, one hostile request at a time. Keeps each request and response, then cleans up. |
|  | Privacy | `privacy` | Where personal data goes and how long it stays, whether deleting an account removes the person, whether the privacy policy matches the code. |
| **Code quality** | Architecture | `architecture` | Code that breaks the intended layers: server code reaching the client, modules tied together with no visible import. |
|  | Duplication | `duplication` | One behaviour built more than once: copied rules, competing mechanisms, restated types, merges that should not have happened. |
|  | Dead code | `dead-code` | Code, settings, routes, events, tables and assets that look live and never run. |
|  | Slop | `slop` | Every switched-off check: disabled lint rules, casts that hide type errors, skipped tests, config opt-outs. |
|  | Documentation | `documentation` | Docs that disagree with the code, links that land nowhere, facts agents rely on that nobody wrote down. |
|  | Dependencies | `dependencies` | Pending dependency updates merged as one verified batch; security advisories, licences, end-of-life packages, supply-chain settings. |
| **Tests and CI** | Testing | `testing` | Tests that can't fail, don't run, or skip what the product must and must never do. |
|  | Coverage | `coverage` | How much code the tests reach, against the minimum CI enforces, and the next minimum to set. |
|  | Flaky tests | `flakes` | Tests that pass only on retry or fail on one platform, and the change that makes each one reliable. |
|  | Gates | `gates` | Problems audits keep finding by hand that an automatic check could block, and the order to add those checks. |
|  | Annotations | `annotations` | Warnings buried in green CI runs: silent failures, deprecations with a deadline, ignored lint warnings. |
|  | CI performance | `ci-performance` | The lane that makes CI slow or expensive, and what each change would save. |
| **Running in production** | Reliability | `reliability` | What breaks when a service is slow, down or answers twice: missing timeouts, unsafe retries, races, failures no alert reports. |
|  | Database | `database` | Who can read and write what, migrations, data integrity, capacity, and whether a restore works. |
|  | Logs | `logs` | Error-tracker issues and logs sorted into real bugs, noise at the wrong level, and failures that never got reported. |
|  | App performance | `app-performance` | Web, phone and server speed, measured against published targets and your own budgets. |
|  | Config | `config` | Settings outside the code that disagree across environments, dashboards, repo and docs; anything with an expiry date. |
|  | Cost | `cost` | Vendor plans that don't fit your usage, what drives each bill, whether a spike shows up before the invoice. |
| **Users and reach** | Accessibility | `accessibility` | What automated accessibility checks miss against WCAG 2.2 AA, plus the manual checks nothing automates. |
|  | Usability | `usability` | Screens that don't match their design or the other platforms, and main flows a person can't finish. |
|  | Analytics | `analytics` | Product events that don't fire, differ between web and phone, fire before consent, or carry personal data. |
|  | AI search & SEO | `aio-seo` | Whether search engines and AI answer engines can find, read and describe your public pages. |
|  | App Store | `app-store` | What keeps an iOS or Android app listed: deadlines, privacy declarations, permissions, signing, review readiness, crashes, ratings. |
| **AI features** | LLM | `llm` | What each AI model call can make happen, and what stops it when the input is hostile: prompts, tool limits, output checks, evals. |
|  | Models | `models` | Whether each AI call uses the best current model for the job, whether models and fallbacks still exist, whether one list holds them all. |
|  | Prompts | `prompts` | Product prompts that are unclear, badly structured, or off the model maker's current guide. |
| **Project upkeep** | Issues | `issues` | Size and priority for every open issue, by rules a later run applies the same way; board, parent, milestone and blocking links. |
|  | Deferrals | `deferrals` | Postponed work sorted into done, replaced, tracked, parked, or in scope and never finished. |
|  | Failures | `failures` | Known bugs sorted into still reachable, already fixed, misdescribed, unconfirmed, or a repeat of an earlier one. |
|  | Repo | `repo` | Leftovers and layout: stale worktrees, branches and stashes, ignored files, files in the wrong place. |
|  | Agents | `agents` | Each AI tool's setup: which instructions load, permissions, hooks, tool servers, model choices, untrusted input each agent reads. |
|  | Adoption | `adoption` | Whether every file bkit installed is used and used correctly: install current, docs filled in, audits run on schedule, each template adopted or declined with a reason. |

The agent-facing scope of each template is in `.bkit/prompts.md` § Audit (Ad-hoc).

<a id="utilities"></a>

## Utilities

Utilities have no command and no phase label. They run on demand, one subagent per run.

<!-- prettier-ignore -->
| Subagent | Lens / focus | What it does |
| --- | --- | --- |
| `bkit-utility-update-roadmap` | Roadmap | Ranks the next items to work on from the board, the ledgers and due audits. Rewrites only the `roadmap-analysis` block. |
| `bkit-utility-update-tracker` | Tracker hygiene | Brings open issues in line with the tracker rules: short titles, labels, board status, priority, size, milestone, parent and blocked-by, from the latest issues audit and the roadmap. Suggests new milestones and parent issues; never creates or closes issues. |
| `bkit-utility-update-documentation` | Docs drift | Syncs every doc listed in `.agents/docs.md` with the current system — drift cleanup across several plans. |
| `bkit-utility-update-decisions` | Decisions ledger | Checks each active `docs/decisions.jsonl` entry against the docs and the code; appends a corrected or superseded row where it no longer holds. Lists rows in the other three ledgers that point at a corrected entry, for the caller to hand on. Never writes another ledger. |
| `bkit-utility-update-knowledge` | Gotchas ledger | Same over `docs/knowledge.jsonl`. Never retracts an entry about upstream behaviour for lack of local evidence. |
| `bkit-utility-update-deferrals` | Deferrals ledger | Closes `docs/deferrals.jsonl` entries the code already resolves, with evidence. An entry an open tracker issue covers is marked triaged, not closed. Same cross-ledger listing. |
| `bkit-utility-update-failures` | Failures ledger | Same over `docs/failures.jsonl`, judged on whether the bug still reproduces from the code. A flaky entry closes only on a landed determinism fix. |
| `bkit-utility-compress-markdown` | Compressor | Rewrites one markdown file in fewer tokens without changing its meaning. Overwrites the file. |

The agent-facing scope of each utility is in `.bkit/prompts.md` § Utility (Ad-hoc).

---

Sources: bkit workflow and prompt definitions (`.bkit/core/workflows/*`, `.bkit/core/.bkit/prompts.md`).
