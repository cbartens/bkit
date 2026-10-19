<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

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
| `.bkit/lite.md` | ○ | ○ | ○ | ○ | ○ | Lite workflows (`lite:<phase>`) — copy-paste prompts for small, understood changes. |
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
| `docs/setup.md` | — | — | — | — | — | Local dev — CLIs, configuration, secrets, troubleshooting. Humans only. |

> `Project Documents` below `bkit:end` is consumer-owned — `bkit install` never overwrites it, `bkit check` drift stays clean. Add project-specific docs there.

<!-- bkit:end -->

## Project Documents

<!-- prettier-ignore -->
| Doc | Design | Plan | Build | Debug | Ship | Scope |
| --- | --- | --- | --- | --- | --- | --- |
