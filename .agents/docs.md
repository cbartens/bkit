<!-- bkit:start -->

# Document Index

> [!CAUTION]
> **Purpose:** Index of repo docs (`docs/` and `.agents/`) for agents. Workflow matrix tells agents what to read.
>
> **Rules:**
>
> - Read only docs relevant to current workflow/step/task.
> - Follow workflow based reading suggestions first, then read more docs as step/task warrants.
> - Token-efficient dense phrasing; agent readers only.
> - One row per doc — `path | one-line scope`. Pointers only — do NOT duplicate text from indexed docs.
> - New docs: add to **Workflow Matrix** AND **Full Catalog**; ensure the doc has a `Purpose` / `Rules` header.
> - When two docs cover the same topic, that's a bug — pick a canonical home, link from the other.

## Workflow Matrix

**Symbols:**

- `●` always read for this workflow
- `○` read if step/task touches this domain
- `—` irrelevant for this workflow

<!-- prettier-ignore -->
| Doc | Design | Plan | Build | Debug | Ship |
| --- | --- | --- | --- | --- | --- |
| `docs/architecture.md` | ● | ● | ● | ○ | ○ |
| `docs/technology.md` | ● | ● | ○ | ○ | ○ |
| `docs/decisions.md` | ● | ● | ○ | ○ | ○ |
| `docs/knowledge.md` | ○ | ● | ● | ● | ○ |
| `docs/data-schema.md` | ○ | ○ | ● | ○ | ○ |
| `docs/data-pipeline.md` | ○ | ○ | ○ | ○ | — |
| `docs/data-cron-jobs.md` | ○ | ○ | ○ | ○ | — |
| `docs/testing.md` | ○ | ● | ● | ● | — |
| `docs/deployments.md` | ○ | ○ | ○ | ● | ● |
| `docs/observability.md` | ○ | ○ | ● | ● | ○ |
| `docs/security.md` | ● | ● | ● | ○ | ○ |
| `docs/webhooks.md` | ○ | ○ | ○ | ○ | — |
| `docs/warnings.md` | — | — | ○ | ● | — |
| `docs/notifications.md` | ○ | ○ | ○ | — | — |
| `docs/styles.md` | ○ | ○ | ○ | — | — |
| `docs/completed.md` | — | — | — | — | ● |
| `docs/pending.md` | ● | ● | ● | ● | — |
| `.agents/skills.md` | — | — | ● | — | — |
| `.agents/workflows.md` | — | — | — | — | — |
| `.agents/cloud.md` | — | — | — | — | — |
| `docs/plans/template.md` | — | ● | — | — | — |
| `docs/audits/*.md` | ○ | ○ | — | — | — |
| `docs/setup.md` | — | — | — | — | — |

---

## Full Catalog

### Architecture

<!-- prettier-ignore -->
| File | Scope |
| --- | --- |
| `docs/architecture.md` | System design — service boundaries, deployment topology, integration sketch. |
| `docs/technology.md` | Chosen frameworks, libraries, styling systems, coding conventions. WHY a choice was made → `decisions.md`. |
| `docs/decisions.md` | ADRs — what was decided, why, discarded alternatives. Append-only. |
| `docs/knowledge.md` | Lessons, traps, post-mortems, gotchas (symptom → root cause → fix). Append-only. |

### Data

<!-- prettier-ignore -->
| File | Scope |
| --- | --- |
| `docs/data-schema.md` | Active production database schema — tables, columns, RLS, indices, triggers. |
| `docs/data-pipeline.md` | Data processing pipeline — phases, workers, concurrency, routing. |
| `docs/data-cron-jobs.md` | Registry of scheduled background tasks (cron / scheduled functions). |

### Infrastructure

<!-- prettier-ignore -->
| File | Scope |
| --- | --- |
| `docs/testing.md` | Testing strategy — tier boundaries, framework choices, naming conventions, CI execution. |
| `docs/deployments.md` | Deployment / environment config / CI/CD pipeline rules — secrets sync, branch protection, run-level tiers. |
| `docs/observability.md` | Logging architecture, correlation tracing, telemetry pipelines, log drains. |
| `docs/security.md` | Authentication, authorization, input validation, rate limiting, secrets management, PII handling. |
| `docs/webhooks.md` | Registry of inbound webhook endpoints — URLs, providers, secret env var names. |
| `docs/warnings.md` | Registry of intentional log-level downgrades with rationale. |

### User Interface

<!-- prettier-ignore -->
| File | Scope |
| --- | --- |
| `docs/notifications.md` | Notification model — tiers, types, severity, i18n key conventions. |
| `docs/styles.md` | Design system — palette, typography, components, spacing, a11y, layout tokens. |

### Project Tracking

<!-- prettier-ignore -->
| File | Scope |
| --- | --- |
| `docs/completed.md` | Ledger of shipped plans — one entry per merged feature. Append-only. |
| `docs/pending.md` | Ledger of deferred issues and future feature ideas. Append-only. |

### Audits

<!-- prettier-ignore -->
| File | Scope |
| --- | --- |
| `docs/audits/codebase-audit.md` | Codebase quality findings vs architecture / knowledge / decisions. Report-only. |
| `docs/audits/pipeline-audit.md` | Background-job pipeline audit — durability and flow-control compliance. |
| `docs/audits/security-audit.md` | Full-stack security audit — severity-ranked findings and status tracking. |
| `docs/audits/tests-audit.md` | Test coverage and framework version health. |
| `docs/audits/errors-audit.md` | Production error scan reports — signatures, post-deploy analysis, regression tracking. |

### Agent Tooling

<!-- prettier-ignore -->
| File | Scope |
| --- | --- |
| `.agents/skills.md` | Registry of installed agent skills and install/update commands. |
| `.agents/workflows.md` | Agent-pipeline reference — workflow conventions, execution patterns, IDE integration, subagent catalog. |
| `.agents/cloud.md` | Claude Code on the web — copy-paste recipe for cloud environment (setup script, env vars, network) + repo-side SessionStart hook. |
| `docs/plans/template.md` | Plan template — pre-flight, gates, runbook, verification, rollback. Clone for every new plan. |

### Setup

<!-- prettier-ignore -->
| File | Scope |
| --- | --- |
| `docs/setup.md` | Local dev — CLIs, configuration, secrets, troubleshooting. Humans only. |

<!-- bkit:end -->
