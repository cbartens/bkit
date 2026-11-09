<!-- bkit:start -->

{{BKIT_MANAGED_MARKER}}

# Document Index

> [!CAUTION]
> **Purpose:** The index agents use to find the repo's docs (`docs/`, `.agents/` and the `.bkit/` catalogs). The phase columns tell an agent what to read in each workflow.
>
> **Rules:**
>
> - Follow `.bkit/authoring.md` § All Agent-Read Files and § Docs when you edit this file.
> - Read only the docs relevant to the current workflow, step or task.
> - Follow the workflow's reading suggestions first. Then read more docs as the step or task warrants.
> - The phase columns cover workflows only. Audits and utilities pick docs as the step or task warrants.
> - Give each doc one row, with its phase columns and a one-line scope.
> - Write pointers only, and do not duplicate text from the indexed docs.
> - Local project docs → `Project Documents` below the bkit-managed block.
> - Universal docs stay in the block.
> - Two docs that cover the same topic are a bug. Pick a canonical home, and link to it from the other doc.
>
> **Symbols:** `●` means always read. `○` means read when the step or task touches this domain. `—` means irrelevant.

## Universal Documents

<!-- prettier-ignore -->
| Doc | Design | Plan | Build | Debug | Ship | Scope |
| --- | --- | --- | --- | --- | --- | --- |
| `.bkit/workflows.md` | ● | ● | ● | ● | ● | Workflow catalog — when to run and when not to run each command (§ When to Run). |
| `.bkit/prompts.md` | ● | ● | ● | ● | ● | Subagent catalog — name, scope, effort, model, `maxTurns`. |
| `.bkit/cli.md` | ○ | ○ | ○ | ○ | ○ | `bkit` CLI — command contract, `{BKIT}` invocation, verb flags, by hand vs workflow-only. |
| `.bkit/router.md` | — | — | — | — | — | `bkit-{command}` workflow router — picks the workflow and each host's command file. |
| `.agents/skills.md` | ○ | ○ | ● | ○ | ○ | Permanent skill registry, installation checks and activation boundaries. |
| `.agents/context.md` | ○ | ○ | ○ | ● | ○ | How to reach information outside repo — deployment logs, CI runs, e2e evidence, web search, cloud egress allowlist, CLI provisioning. |
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

> `Project Documents` below `bkit:end` belongs to the project, so `bkit install` never overwrites it and `bkit check` reports no drift for it. Add project-specific docs there. The ten recommended project documents (`docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/testing.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md`) start as copies of `.bkit/templates/docs/`. Copy one into `docs/` and add its row there; an indexed document at another path stands in for its topic when its Scope names the recommended path (`Equivalent to docs/security.md`).

<!-- bkit:end -->

## Project Documents

<!-- prettier-ignore -->
| Doc | Design | Plan | Build | Debug | Ship | Scope |
| --- | --- | --- | --- | --- | --- | --- |
