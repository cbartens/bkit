<!-- bkit:start -->

<!-- bkit:managed v6.0.0 — do not edit; run `bkit upgrade` to refresh -->

# Document Index

> [!CAUTION]
> **Purpose:** Index of repo docs (`docs/`, `.agents/`, and `.bkit/` catalogs) for agents. Phase columns tell agents what to read per workflow.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; no filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Describe current state / rules, not reasons / history; state what to do, not why. only exceptions: Docs where purpose is the record.
> - Read only docs relevant to current workflow / step / task.
> - Follow workflow based reading suggestions first, then read more docs as step / task warrants.
> - Phase columns cover workflows only; audits and utilities pick docs as step / task warrants.
> - One row per doc — phase columns and one-line scope. Pointers only — do not duplicate text from indexed docs.
> - Local project docs → `Project Documents` below the bkit-managed block; universal docs stay in-block.
> - When two docs cover the same topic, that's a bug — pick a canonical home, link from the other.
>
> **Symbols:** `●` always read · `○` read if step / task touches this domain · `—` irrelevant.

## Universal Documents

<!-- prettier-ignore -->
| Doc | Design | Plan | Build | Debug | Ship | Scope |
| --- | --- | --- | --- | --- | --- | --- |
| `.bkit/workflows.md` | ● | ● | ● | ● | ● | Workflow catalog — when to run and when not to run each command (§ When to Run). |
| `.bkit/prompts.md` | ● | ● | ● | ● | ● | Subagent catalog — name, scope, effort, model, `maxTurns`. |
| `.bkit/cli.md` | ○ | ○ | ○ | ○ | ○ | `bkit` CLI — command contract, `{BKIT}` invocation, verb flags, by hand vs workflow-only. |
| `.bkit/router.md` | — | — | — | — | — | `bkit-{command}` workflow router — picks the workflow and each host's command file. |
| `.bkit/lite.md` | ○ | ○ | ○ | ○ | ○ | Lite workflows (`<phase>:lite`) — copy-paste prompts for small, understood changes. |
| `.agents/skills.md` | — | — | ● | — | — | Registry of installed agent skills and install / update commands. |
| `.agents/context.md` | ○ | ○ | ○ | ● | ○ | How to reach information outside repo — deployment logs, CI runs, e2e evidence, web search, cloud egress allowlist, CLI provisioning. |
| `docs/architecture.md` | ● | ● | ● | ○ | ○ | System design — service boundaries, deployment topology, integration sketch. |
| `docs/technology.md` | ● | ● | ○ | ○ | ○ | Chosen frameworks, libraries, styling systems, coding conventions. WHY a choice was made → `decisions.jsonl`. |
| `docs/data-schema.md` | ○ | ○ | ● | ○ | ○ | Active production database schema — entities / tables, fields, access policies (e.g. RLS), indices, functions, triggers. |
| `docs/security.md` | ● | ● | ● | ○ | ○ | Authentication, authorization, input validation, rate limiting, secrets management, PII handling, untrusted-content threat model. |
| `docs/design.md` | ○ | ○ | ○ | — | — | Design system — palette, typography, components, spacing, a11y, layout tokens. |
| `docs/testing.md` | ○ | ● | ● | ● | — | Testing strategy — tier boundaries, framework choices, naming conventions, CI lane graph (names, needs, when a lane runs). |
| `docs/deployments.md` | ○ | ○ | ○ | ● | ● | Deployment / CI/CD — secrets, branch protection, one-run concurrency, push base, promote after the capstone. |
| `docs/observability.md` | ○ | ○ | ● | ● | ○ | Logging architecture, correlation tracing, telemetry pipelines, log drains. |
| `docs/noise.md` | — | — | ○ | ● | ○ | Registry of intentional signal downgrades — log levels, error-tracker archives / mutes, alert thresholds. |
| `docs/decisions.jsonl` | ● | ● | ○ | ○ | ○ | ADRs — what was decided, why, discarded alternatives. Append-only. |
| `docs/knowledge.jsonl` | ○ | ● | ● | ● | ○ | Lessons, traps, post-mortems, gotchas (symptom → root cause → fix). Append-only. |
| `docs/failures.jsonl` | ○ | ○ | ○ | ○ | ○ | Ledger of discovered bugs. Append-only. |
| `docs/deferrals.jsonl` | ○ | ○ | ○ | ○ | — | Ledger of deferred issues and future feature ideas. Append-only. |
| `docs/plans/{YYYYMM}/*.md` | ○ | ● | ● | ○ | ○ | Feature designs and plans. |
| `docs/audits/{YYYYMM}/*.md` | — | ○ | ○ | — | — | Audit reports. `/bkit-plan` reads a design, these reports, or both. |
| `docs/roadmap.md` | ○ | ○ | ○ | ○ | ○ | Phase board and best-next-step analysis. |
| `.bkit/issues.jsonl` | ○ | ○ | ○ | ○ | ○ | Feature-state ledger. Folded into `docs/roadmap.md`. Append-only. |
| `docs/templates/bkit-plan.md` | — | ● | — | — | — | Plan template — pre-flight, gates, runbook, verification, rollback. |
| `docs/templates/bkit-audit-*.md` | — | ○ | — | — | — | Audit templates. Use with `@bkit-audit-generate` to generate reports. |
| `.bkit/jsonl.md` | ○ | ○ | ○ | ○ | ○ | Row format for the `*.jsonl` ledgers — envelope, per-kind fields, dedup tuples, write idiom. |
| `.bkit/authoring.md` | ○ | ○ | ○ | ○ | ○ | Authoring rules for agent-read markdown — docs, prompts, workflows; punctuation and capitals. |
| `docs/setup.md` | — | — | — | — | — | Local dev — CLIs, configuration, secrets, troubleshooting. Humans only. |

> `Project Documents` below `bkit:end` is consumer-owned — `bkit install` never overwrites it, `bkit check` drift stays clean. Add project-specific docs there.

<!-- bkit:end -->

## Project Documents

<!-- prettier-ignore -->
| Doc | Design | Plan | Build | Debug | Ship | Scope |
| --- | --- | --- | --- | --- | --- | --- |
| `.bkit/README.md` | ○ | ○ | ○ | ○ | ○ | Operator guide — workflow run, prerequisites, env, tracker setup, CLI. |
| `.bkit/install.md` | — | — | — | — | ○ | First-time install / upgrade paste, local env setup, install lifecycle, uninstall. |
| `.bkit/providers.md` | ○ | ○ | ○ | ○ | ○ | IDE host differences — install transforms, hosts, providers, model pins. |
| `.bkit/trackers.md` | ○ | ○ | ○ | ○ | ○ | Tracker marker contract — `github` / `linear` / `jira` / `none` blocks in workflow sources; issue shapes (idea / change / bug) + machine-read body lines. |
| `.bkit/cloud.md` | ○ | ○ | ○ | ○ | ○ | Cloud agents — Claude on the web, Cursor Cloud, opencode. Setup and support matrix. |
| `.bkit/templates.md` | — | — | ○ | — | ○ | Copy-and-own templates — what each does, how to install; `bkit install` / `bkit upgrade` never write the templates themselves. |
| `.bkit/instructions.md` | — | ○ | ○ | ○ | ○ | Every shipped agent instruction and the files carrying it — rules, shared clauses, hook text, permissions. |
| `docs/migrations.md` | ○ | ○ | ○ | ○ | ○ | Register of every upgrade migration in the engine — what it rewrites, release range, where it runs. |
| `docs/capabilities.md` | ○ | ○ | — | — | — | Capability register + module map, generated by `pnpm graph:rollup` (graphify). Confirms presence, never absence. |
| `.bkit/friction.jsonl` | ○ | ○ | ○ | ○ | ○ | Observed workflow friction. Drained by `pnpm harvest`. |
| `.bkit/stats.jsonl` | ○ | ○ | ○ | ○ | ○ | Run telemetry — `compliance`, `outcome`, `counter`. Append-only. |
| `.bkit/stats.md` | — | — | — | — | — | This repo's stats report, written by `bkit stats`. Committed. Humans only. |
| `harvest/consumers.md` | — | — | — | — | — | Maintainer-local dogfood checkout paths. `pnpm harvest` reads it. Gitignored, not shipped. |
| `harvest/friction.jsonl` | — | — | — | — | — | Workflow friction harvested from every dogfood checkout. Written by `pnpm harvest`. Gitignored, not shipped. |
| `harvest/stats.jsonl` | — | — | — | — | — | Run telemetry harvested from every dogfood checkout, repos and issues stored as fingerprints. Written by `pnpm harvest`. Gitignored, not shipped. |
| `harvest/stats.md` | — | — | — | — | — | Cross-repo stats report from every dogfood checkout, written by `pnpm harvest`; names repos and issues. Gitignored, not shipped. |
| `README.md` | — | — | — | — | ○ | Package page — pitch, what ships, quick start. Humans only. |
| `CHANGELOG.md` | — | — | — | ○ | ○ | Release record — notable changes per version. |
| `.bkit/pipeline.md` | — | — | — | — | — | Pipeline in execution order, every subagent, every audit template. Humans only. |
| `.bkit/comparison.md` | — | — | — | — | — | Peer-framework + agentic-patterns comparison. Humans only. |
