# Design Input — bar-199-audit-workflow

## Session Prompt

`/bkit-design bar-199`

Linear issue ID: **BAR-199** — _Add bkit-audit workflow parallel best practice lens audits_
URL: https://linear.app/bartens/issue/BAR-199/add-bkit-audit-workflow-parallel-best-practice-lens-audits
Project: bkit · Milestone: _Workflow Agent Optimisation_ · Priority: High · State (pre-workflow): Todo
Branch (Linear-suggested): `christian/bar-199-add-bkit-audit-workflow-parallel-best-practice-lens-audits`
Branch (workflow-bound): `feat/bar-199-audit-workflow`

## Linear Description (verbatim)

## Context

Originally scoped (this issue, prior version) as a rewrite of `.agents/prompts/bkit-utility-audit-codebase.md` to add named debt-class lenses, motivated by the BAR-197 retro: would an audit pass have caught the catch-all-Lambda bundling + ESM-only `serverExternalPackages` debt before it shipped? With the original single-prompt audit, no. With sharpened lenses, yes.

On reflection the multi-lens-then-synthesize pattern from `bkit-design` and `bkit-plan` fits auditing better than tuning one prompt:

- Each lens is independent — parallelizable.
- Each lens benefits from a distinct charter (prompt-level variation), the same theory behind the three `bkit-design-brainstorm-ideate-{1,2,3}` agents.
- A synthesizer can dedup overlapping findings (e.g., error-handling shows up in reliability + observability lenses) and prioritize across classes.

**Scope expands to: a new** `bkit-audit` **workflow** that orchestrates ~12 parallel lens-subagents, then synthesizes + prioritizes + summarizes into a single audit report. The existing 9-lens taxonomy below becomes the codebase-audit subset; security, tests, observability/logs are pulled in as additional lenses so a single audit covers the full surface.

## Workflow shape (mirrors `bkit-design` / `bkit-plan`)

Full orchestrator ceremony — worktree, FID, status.json, lock, Linear issue lifecycle, comment-per-step. Read-only: no plan, no PR, no code changes.

<!-- prettier-ignore -->
| Step | Subagents | Output |
| --- | --- | --- |
| 1 Start Workflow | — | FID, lock, Linear comment seed |
| 2 Worktree Setup | — | `.worktrees/{FID}/`, `audit-input.md` |
| 3 Lens audits (parallel) | ~12 `bkit-audit-lens-{slug}` | `audit-lens-{slug}.md` per lens |
| 4 Synthesize | `bkit-audit-synthesize` | `audit-v1-synthesis.md` — cross-lens dedup |
| 5 Prioritize | `bkit-audit-prioritize` | `audit-v2-ranked.md` — Severity × Class matrix |
| 6 Summary | `bkit-audit-summary` | `audit-summary.md` — exec summary + verdict |
| 7 Close Workflow | — | `docs/audits/{FID}-audit.md`, merge to dev |

## Lens charter (~12 lenses, generic + stack-agnostic)

Each lens emits findings tagged `severity` (CRITICAL/HIGH/MEDIUM/LOW), `class` (lens slug), `location` (file:line or pattern), `what`, `why-it-matters`, `direction-of-fix`, `confidence`.

<!-- prettier-ignore -->
| # | Lens | Class | Universal probe |
| --- | --- | --- | --- |
| 1 | Architecture & coupling | maintainability | Import-graph shape; fan-in/out hotspots; layering breaks; circular deps; chokepoint entrypoints. |
| 2 | Hot-path / cold-path discipline | performance | Top-level static imports in entrypoints; sync I/O in async paths; heavy init eagerly loaded. |
| 3 | Configuration & runtime-shape alignment | compatibility | Build/runtime/deploy config matches actual code shape; manifest/code divergence; env assumptions in shared modules. |
| 4 | Error handling & failure modes | reliability | Silent swallows; broad catches; missing retries on idempotent ops; fallbacks that hide failures; unhandled rejections. |
| 5 | Observability gaps (structural) | operability | Failure surfaces with no logs/metrics; missing context tags; PII in logs; absent tracing on critical paths. |
| 6 | Resource lifecycle & concurrency | reliability | Unclosed handles; unbounded queues/caches; races on shared state; missing transactional boundaries. |
| 7 | Debt markers & expired workarounds | maintainability | `TODO\ | FIXME\ | HACK\ | XXX\ | workaround\ | band-aid\ | recovery` + ticket-ID grep; markers pointing at closed/rolled-back tickets; workarounds without exit conditions; commented-out code. |
| 8 | Dead / duplicate / over-abstracted code | maintainability | Unreferenced exports; orphan files; dupe utilities; single-caller wrappers; speculative generality. |
| 9 | Dependency hygiene | compatibility | `pnpm outdated/audit`; workspace cross-version drift; ESM/CJS interop traps; unmaintained packages; types out of sync. |
| 10 | Security posture | security | Auth holes; input validation; secrets handling; API exposure; data leakage; dep CVE surface. (Adapts `bkit-utility-audit-security`.) |
| 11 | Test coverage & signal quality | testability | Mocked-only critical paths; missing integration tests; flakes/skips without exit conditions; assertion strength. (Adapts `bkit-utility-audit-tests`.) |
| 12 | Documentation drift | maintainability | `.agents/docs.md` and project docs vs actual code domains; stale invariants; broken refs. |

Optional 13th: **Live runtime signal** — pulls last N days of error signatures (adapts `bkit-utility-audit-logs`). Gated on log infra; defer to v2 if absent.

## Output shape

Severity × Class matrix at top → single ranked list (CRITICAL → HIGH → MEDIUM → LOW) → per-class appendix.

Per-finding format:

```
## [CRITICAL][reliability] apps/web/foo.ts:42 — broad catch swallows DB lock errors
**Why it matters:** Lock contention currently fails silently; user sees stale data.
**Direction of fix:** Narrow catch to known recoverable errors; log + rethrow on others.
**Confidence:** high — pattern matches the catch-all bundling incident class.
```

## Decisions (carried into design phase)

1. **Workflow ceremony:** Full mirror of `bkit-design` / `bkit-plan` — worktree, FID, status.json, lock, Linear lifecycle.
2. **Lens count:** ~12. Re-absorb security / tests / observability into the workflow so a single run covers the full audit surface.
3. **Output:** Severity × Class matrix + single ranked list + per-class appendix.
4. **Model strategy:** All-Opus parallel lens-subagents. Diversity comes from prompt-level lens charter, not model variation (same pattern as `bkit-design-brainstorm-ideate-*`). Revisit if cost becomes a constraint.
5. **Standalone** `bkit-utility-audit-*` **prompts:** Workflow ships **new** lens-subagent prompts (`bkit-audit-lens-{slug}.md`) with workflow-bound output discipline (fixed paths, verdict lines, no commits). Existing standalone utility prompts marked deprecated with a pointer to `/bkit-audit`; deletion deferred until workflow is battle-tested.
6. **Portability:** All probes stack-agnostic ("entrypoint files", "build config files"), not pinned to Next.js / Vercel / pnpm. The agent discovers local instances.

## Open questions (resolve in design phase)

1. **Loop hooks:** Should `bkit-debug-summary` queue an audit when a debug cycle closed with a workaround? Should `bkit-design-review-*` reference the lens checklist when introducing new heavy deps? Or keep audit standalone for v1.
2. **CI integration:** v1 = manual `/bkit-audit` only. v2 could add scheduled audits.
3. **Report consumers:** Does anything downstream read `docs/audits/{FID}-audit.md`? If not, keep it as a static artifact for now.

## Acceptance

- `.agents/workflows/bkit-audit.md` exists with full 7-step orchestrator pattern (Failure Path, lock, Gates, status.json, Linear comment-per-step).
- `.agents/prompts/bkit-audit-lens-{slug}.md` exists for each of the 12 lenses + `bkit-audit-synthesize.md` + `bkit-audit-prioritize.md` + `bkit-audit-summary.md`.
- Each lens prompt portable across repos (no stack pinning).
- Output format conforms to Severity × Class matrix + ranked list + per-class appendix.
- Smoke-test: run the new workflow against bkit repo at pre-BAR-197 dev tip → lenses 1, 2, 3, 7 surface known debt; security/tests/deps surface nothing unexpected.
- `.agents/skills.md` index registers the new workflow.
- `.agents/prompts.md` index registers new lens / synthesize / prioritize / summary prompts.
- Standalone `bkit-utility-audit-{codebase,security,tests,logs}.md` get a "Deprecated → see /bkit-audit" header.
- `bkit install` regenerates `.claude/` and `.cursor/` mirrors at session end.

## Out of scope

- Per-lens fixers — audit is read-only.
- CI scheduling — manual invocation only in v1.
- Live log analysis lens — defer to v2 (gated on runtime log infra).
- Cross-repo aggregation.
- Deleting the standalone `bkit-utility-audit-*` prompts (only deprecation header in v1).
- A11y / i18n / migrations lenses — defer to dedicated audits if needed.

## Linear Comments

(none — issue had no prior comments at workflow start)
