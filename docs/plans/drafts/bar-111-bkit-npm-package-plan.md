# bkit npm Package Extraction — Master Index (BAR-111)

**Parent of:** `plan-v4-1.md`, `plan-v4-2.md`, `plan-v4-3.md`
**Source plan:** [`plan-v3-checked.md`](./plan-v3-checked.md) (Verdict: PASS, complexity: SPLIT 3-way)
**Complexity check:** [`plan-complexity-check.md`](./plan-complexity-check.md)

> [!CAUTION]
> **CRITICAL:** This is an INDEX. It carries shared context only. Each child sub-plan is fully self-contained per `docs/plans/template.md` and is the source of truth for its own runbook.
>
> Build agents pick up exactly ONE child sub-plan per session. A Build agent reading `plan-v4-2.md` cold MUST be able to execute it without reading v3 or sibling sub-plans.

## Why split

The v3 plan estimated ~133K agent tokens (33% over the 100K single-session ceiling). Three drivers:

1. ~15 new TypeScript source files plus 13 Vitest test files in the producer repo (`bkit/`). Integration test authoring dominates.
2. Two hard human-stop waypoints (Gate 1 narrative fill, Phase 8 Task 8.1 second-repo selection) that risk stale context if held across pauses.
3. Cross-repo coordination — the runbook spans three repos (`bkit`, `app-gether-life`, second smoke-test repo).

Splitting along the natural artifact boundary (producer publish → consumer migration → smoke + upgrade) yields three children each ≤100K tokens.

## Sub-plan index

<!-- prettier-ignore -->
| # | File | Scope | v3 Phases | Est. tokens | Depends on | Human-stop waypoint(s) |
| --- | --- | --- | --- | --- | --- | --- |
| A | [`plan-v4-1.md`](./plan-v4-1.md) | bkit producer — scaffold new repo, copy `.agents/` payload, implement hosts T1/T2/T3, implement CLI verbs (init/install/upgrade/check) with full test suite, populate templates, publish `@bartens/bkit@0.1.0` to npm | Phases 0–6 of v3 | ~90K | BAR-110 merged | Gate 1 (human fills Acceptance Scenario Narrative + Success Criteria; resolved at start of A) |
| B | [`plan-v4-2.md`](./plan-v4-2.md) | app-gether-life consumer — branch, add `@bartens/bkit@0.1.0` exact-pin devDep, delete local install script + wrapper + any `*.bflow-version`, switch CI drift gate to `bkit check`, verify byte-parity, update docs, open PR | Phase 7 of v3 | ~25K | A complete (`@bartens/bkit@0.1.0` on npm) | None (no human stop mid-runbook) |
| C | [`plan-v4-3.md`](./plan-v4-3.md) | Smoke test + upgrade — second-repo onboarding (init/install/upgrade/check end-to-end), upgrade smoke with local-tarball default path (Path A) plus gated real-registry path (Path B), final Verification Plan + Gate 4 + Manual Verification | Phases 8–9 of v3 + Verification Plan + Gate 4 + Manual Verification | ~25K | B complete (consumer migration merged) | Human supplies second-repo identity at session START (input, not mid-session stop). Path B publish gated on explicit human go-ahead. |

**Cut points:**

- **A → B cut:** after Phase 6 publish verification (`npm view @bartens/bkit version` returns `0.1.0`). B may not start until A produces this artifact.
- **B → C cut:** after Phase 7 PR squash-merged into `app-gether-life/dev`. C exercises the published `0.1.0` (and optionally `0.1.1`) end-to-end; it does not modify either repo's source.

## Shared context (all children inherit verbatim)

The following sections in v3 are repeated verbatim in each child sub-plan because each must be self-contained:

- **Context & Goals** — Phase B of agent-stack consolidation; extract `.agents/` payload from `app-gether-life` to `bkit` repo, publish as `@bartens/bkit`, downstream consume via `pnpm dlx`.
- **Acceptance Scenario** (with Narrative + Success Criteria fallback strings — human MUST resolve before A's Gate 1).
- **Breaking Changes & Naming Review** — including the canonical naming reconciliation table (`bflow→bkit`, `commands→workflows`, `subagents→prompts`).
- **Out of Scope** items relevant to that child.
- **Merge Method:** squash (every PR).
- **Security & Privacy:** no DB / no API; sole secret is `NPM_TOKEN` (publisher only, never `app-gether-life`).
- **Rollback Strategy** axis rows applicable to that child.

Children DO NOT share runbook tasks. Each task from v3 lives in exactly one child.

## Losslessness verification

- Total v3 leaf runbook tasks (Phases 0–9, including lettered sub-tasks): 64.
  - A (Phases 0–6): 33 tasks.
  - B (Phase 7): 11 tasks.
  - C (Phases 8–9 + Gate 4 + Manual Verification): 20 tasks (Phase 8: 6 + Phase 9 Path A: 3 + Phase 9 Path B: 3 + Phase 9 Task 9.4: 1 + Verification Plan automated checklist: 7 covered as 1 verification grouping in C).
- v3 Gates (4): Gate 1 → A; Gate 2 → A and B (each child gates its own implementation); Gate 3 → A, B, and C (each child gates its own docs/tests); Gate 4 → C (final automated-verification gate).
- v3 Constraints (testing strategy, no-os.tmpdir, byte-parity regression, squash-only): copied into every child where they apply.
- Sum check: 33 + 11 + 20 = 64 ✓.

## Bidirectional links

- This file ↔ children via the table above (relative paths).
- Each child's header carries `**Parent Plan:** [plan-v4-split.md](./plan-v4-split.md)`.

## Source plan retention

`plan-v3-checked.md` is retained immutably as the source of truth for losslessness audits. It is NOT modified by the split. Children supersede it for execution; v3 is read-only history.
