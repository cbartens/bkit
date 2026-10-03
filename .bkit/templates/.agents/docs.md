<!-- bkit:start -->

# Document Index

> [!CAUTION]
> **Purpose:** Index of repo docs (`docs/` and `.agents/`) for agents. Phase columns tell agents what to read per workflow.
>
> **Rules:**
>
> - Use dense token-efficient phrasing; NO filler / hedging / restating; tables > prose, bullets > paragraphs.
> - Describe current state / rules, NOT reasons / history; state what to do, NOT why. ONLY exceptions: Docs where purpose IS the record.
> - Read only docs relevant to current workflow / step / task.
> - Follow workflow based reading suggestions first, then read more docs as step / task warrants.
> - One row per doc — phase columns and one-line scope. Pointers only — do NOT duplicate text from indexed docs.
> - Local project docs → `Project Documents` below the bkit-managed block; universal docs stay in-block.
> - When two docs cover the same topic, that's a bug — pick a canonical home, link from the other.
>
> **Symbols:** `●` always read · `○` read if step / task touches this domain · `—` irrelevant.

## Universal Documents

<!-- prettier-ignore -->
| Doc | Design | Plan | Build | Debug | Ship | Scope |
| --- | --- | --- | --- | --- | --- | --- |
| `.agents/context.md` | ○ | ○ | ○ | ● | ○ | How to reach information outside repo — deployment logs, CI runs, e2e evidence, web search, cloud egress allowlist, CLI provisioning. |
| `.agents/skills.md` | — | — | ● | — | — | Registry of installed agent skills and install/update commands. |
| `docs/architecture.md` | ● | ● | ● | ○ | ○ | System design — service boundaries, deployment topology, integration sketch. |
| `docs/technology.md` | ● | ● | ○ | ○ | ○ | Chosen frameworks, libraries, styling systems, coding conventions. WHY a choice was made → `decisions.jsonl`. |
| `docs/data-schema.md` | ○ | ○ | ● | ○ | ○ | Active production database schema — tables, columns, RLS, indices, triggers. |
| `docs/security.md` | ● | ● | ● | ○ | ○ | Authentication, authorization, input validation, rate limiting, secrets management, PII handling, untrusted-content threat model. |
| `docs/design.md` | ○ | ○ | ○ | — | — | Design system — palette, typography, components, spacing, a11y, layout tokens. |
| `docs/testing.md` | ○ | ● | ● | ● | — | Testing strategy — tier boundaries, framework choices, naming conventions, CI execution. |
| `docs/deployments.md` | ○ | ○ | ○ | ● | ● | Deployment / environment config / CI/CD pipeline rules — secrets sync, branch protection, run-level tiers. |
| `docs/observability.md` | ○ | ○ | ● | ● | ○ | Logging architecture, correlation tracing, telemetry pipelines, log drains. |
| `docs/noise.md` | — | — | ○ | ● | ○ | Registry of intentional signal downgrades — log levels, error-tracker archives / mutes, alert thresholds. |
| `docs/decisions.jsonl` | ● | ● | ○ | ○ | ○ | ADRs — what was decided, why, discarded alternatives. Append-only. |
| `docs/knowledge.jsonl` | ○ | ● | ● | ● | ○ | Lessons, traps, post-mortems, gotchas (symptom → root cause → fix). Append-only. |
| `docs/plans/template.md` | — | ● | — | — | — | Plan template — pre-flight, gates, runbook, verification, rollback. Clone for every new plan. |
| `docs/roadmap.md` | ○ | ○ | ○ | ○ | ○ | Phase board and best-next-step analysis. |
| `docs/deferrals.jsonl` | ○ | ○ | ○ | ○ | — | Ledger of deferred issues and future feature ideas. Append-only. |
| `docs/failures.jsonl` | ○ | ○ | ○ | ○ | ○ | Ledger of discovered bugs. Append-only. |
| `.bkit/jsonl.md` | ○ | ○ | ○ | ○ | ○ | Row format for the `*.jsonl` ledgers — envelope, per-kind fields, dedup tuples, write idiom. |
| `docs/setup.md` | — | — | — | — | — | Local dev — CLIs, configuration, secrets, troubleshooting. Humans only. |

> `Project Documents` below `bkit:end` is consumer-owned — `bkit install` never overwrites it, `bkit check` drift stays clean. Add project-specific docs there.

<!-- bkit:end -->

## Project Documents

<!-- prettier-ignore -->
| Doc | Design | Plan | Build | Debug | Ship | Scope |
| --- | --- | --- | --- | --- | --- | --- |
