# Design Input — 80-audit-workflow

## Session Brief (AUTHORITATIVE — overrides any stale framing in the issue body below)

Re-design the `/bkit-audit` workflow per the **architecture direction change** recorded in issue #80's first comment (2026-05-18). The original issue body (reproduced below) describes a now-**superseded** v1 in which each of 11 lens prompts did its own stack detection (`IS_PNPM`, logger lists, validator lists, deprecated-package lists, etc.). That approach was judged "still meaningfully stack-leaky" — Node/TS-ecosystem assumptions baked into every prompt file.

**Decision for THIS design (v1 scope = full new direction, Phases 1+2 of the direction-change comment):**

1. **Stack-detect step (NEW).** A single subagent runs before the lens fan-out, reads `package.json`, `tsconfig.json`, `*.config.*`, lockfiles, `.github/workflows/`, etc., and emits a structured `audit-stack.md` (language / runtime / package manager / frameworks / build tools / CI / deployment / db / orm).
2. **Skill-install step (NEW, conditional).** Uses the stack report to install matching audit skills via the `skills` tooling (`npx skills find audit-{stack}` / `npx skills add`). E.g. detected `next` → `audit-nextjs`; `vitest` → `audit-vitest`; `pnpm` → `audit-pnpm`. Infrastructure that now exists to lean on: the `find-skills` skill, the `bkit-build-install-skills` agent, and the `npx skills` CLI.
3. **Universal-pattern lens prompts.** All 11 lens prompts are restructured to PURELY abstract universal patterns (e.g. "find module-system mismatches", "find catches that swallow errors") with **no library names anywhere**. They read `audit-stack.md` + the target repo's `.agents/docs.md` + `docs/knowledge.md`. Installed skills augment them with stack-specific deep knowledge.

**Knowledge layering** (target model):

| Layer               | Knowledge owner  | Scope                                                    |
| ------------------- | ---------------- | -------------------------------------------------------- |
| Lens prompts        | bkit             | Universal patterns ONLY (no library names)               |
| Stack-detect output | bkit             | Run-time structured report of THIS repo                  |
| Skills              | community / bkit | Stack-specific deep knowledge (extensible per framework) |
| `docs/knowledge.md` | audited project  | Project-specific lessons-learned (`KN-*`)                |
| WebSearch           | community        | Fresh best-practice signal                               |

**Explicitly DEFERRED (out of scope for this design):**

- **Phase 3 — WebSearch augmentation** gated behind a `--with-websearch` flag. Note it as a follow-up; do not design it in.
- Per-lens fixers (audit stays read-only), CI scheduling, cross-repo aggregation, live runtime-signal lens (#83), `/bkit-debug` hint integration (#94).

**Carry forward unchanged from the original design (still valid):**

- Ad-hoc-only invocation (behaves like `/bkit-design`; NOT in the auto-cycle).
- The 11-lens charter (which lenses exist + what each probes) — reuse it; only the _detection mechanism_ changes (upstream stack report + skills instead of per-lens detection).
- Output shape: master issue = the report; per-workstream sub-issues; one master comment per workflow step; on-disk `docs/audits/{FID}-audit.md`; severity x class matrix + ranked list + per-class appendix.
- Authoring constraints: `.agents/rules.md`, `.agents/workflows.md` (Two-Layer Separation, FID/lock/status ceremony, Failure Path), `.agents/prompts.md` (standalone-runnable, models table, tools, effort). Pattern-match `bkit-design.md` + `bkit-design-*.md`. NO audit-specific deviations.
- Legacy `bkit-utility-audit-{codebase,security,tests,logs}.md`: deprecation header only in v1 (deletion target later).

**Housekeeping context:** The prior implementation lives only on the stale `feat/bar-199-audit-workflow` branch (1 commit, ~115 behind dev, old approach) and is being abandoned — do not depend on it. Nothing audit-related has landed on `dev` except the prior design doc, which this design supersedes. The workstream decomposition the design-organise step produces will re-cut the old WS-1..WS-13 (#103–#107) to fit the new shape.

The pipeline now has two extra steps before the lens fan-out, so the workflow step numbering shifts vs. the table in the issue body. Design the full revised orchestrator shape.

---

## Issue #80 — Description (ORIGINAL; superseded where it conflicts with the Session Brief above)

> **Title:** Add bkit-audit workflow parallel best practice lens audits
> **Status (original):** Design phase complete for the OLD approach. Linear: BAR-199.

### Scope (v1, as originally finalised — now revised per Session Brief)

Build a new `/bkit-audit` workflow that runs 11 parallel best-practice lens audits over a codebase and synthesises them into a single severity x class prioritised report. Ad-hoc only — triggered by human invocation, behaves like `/bkit-design`. NOT part of the design → plan → build → debug → ship auto-cycle.

Each audit run produces: a master issue (= the audit report); one sub-issue per workstream (logical groupings of findings); ONE master comment with one appended section per workflow step (Step N section contains `audit-summary.md` verbatim); on-disk artifact `docs/audits/{FID}-audit.md`.

### Original workflow shape (mirrors bkit-design) — NOTE: now gains stack-detect + skill-install steps

| Step                     | Subagents                     | Output                                                                            |
| ------------------------ | ----------------------------- | --------------------------------------------------------------------------------- |
| 1 Start Workflow         | —                             | FID, lock, master issue init, master comment seed                                 |
| 2 Worktree Setup         | —                             | `.worktrees/{FID}/`, `audit-input.md`                                             |
| 3 Lens audits (parallel) | 11 x `bkit-audit-lens-{slug}` | `audit-lens-{slug}.md` per lens                                                   |
| 4 Synthesise             | `bkit-audit-synthesise`       | `audit-v1-synthesis.md` — cross-lens dedup                                        |
| 5 Organise               | `bkit-audit-organise`         | `audit-v2-ranked.md` — severity x class matrix + workstreams + sub-issue spawning |
| 6 Summary                | `bkit-audit-summary`          | `audit-summary.md` — exec summary + verdict                                       |
| 7 Close Workflow         | —                             | `docs/audits/{FID}-audit.md`, state → In Review                                   |

### Lens charter (11 lenses, stack-agnostic) — REUSE; only detection mechanism changes

| WS    | Slug          | Class           | Probe summary                                                              |
| ----- | ------------- | --------------- | -------------------------------------------------------------------------- |
| WS-2  | architecture  | maintainability | Import-graph fan-in/out hotspots; layering breaks; circular deps.          |
| WS-3  | hotpath       | performance     | Top-level static imports in entrypoints; sync I/O in async paths.          |
| WS-4  | config        | compatibility   | Build/runtime/deploy config vs actual code shape; manifest divergence.     |
| WS-5  | reliability   | reliability     | Silent swallows; broad catches; unbounded queues; races.                   |
| WS-6  | observability | operability     | Failure surfaces with no logs/metrics; missing context tags; PII in logs.  |
| WS-7  | debt          | maintainability | TODO/FIXME/HACK + ticket-ID grep; workarounds without exit conditions.     |
| WS-8  | dead-code     | maintainability | Unreferenced exports; orphan files; dupe utilities.                        |
| WS-9  | deps          | compatibility   | Manifest-driven dep hygiene; ESM/CJS interop traps; unmaintained packages. |
| WS-10 | security      | security        | Auth holes; input validation; secrets handling; data leakage.              |
| WS-11 | tests         | testability     | Mocked-only critical paths; missing integration tests; assertion strength. |
| WS-12 | docs-drift    | maintainability | `.agents/docs.md` + project docs vs actual code domains; stale invariants. |

Probes stack-agnostic; reports stack-aware (each lens reads target repo's `.agents/docs.md`). Each lens caps output at 25 findings (severity-sorted).

### Out of scope (v1)

Per-lens fixers (audit is read-only); CI scheduling / automated audits; live runtime-signal lens (→ #83); cross-repo aggregation; deleting standalone `bkit-utility-audit-*` prompts (deprecation header only in v1); A11y / i18n / migrations / api-contracts / rate-limiting / caching lenses; cross-workflow hooks (Phase 2 integration tracked in #94); tests/scripts/JSON schemas/helper modules (only workflow + prompts + minimal registry edits); `Audit` Linear phase label; per-finding Linear comments.

### Acceptance (original; adapt to revised pipeline)

- `.agents/workflows/bkit-audit.md` exists (orchestrator, now with stack-detect + skill-install steps).
- Lens prompts (11) + `bkit-audit-synthesise.md` + `bkit-audit-organise.md` + `bkit-audit-summary.md` exist; PLUS the two new pipeline prompts (`bkit-audit-stack-detect.md` and the skill-install step prompt).
- Lens prompts portable across repos (universal patterns, no library names); output tailored to encountered stack via the stack report + installed skills.
- Output format: severity x class matrix + ranked list + per-class appendix + workstream decomposition.
- `.agents/prompts.md` adds Audit Phase section (after Ship, before Utility).
- `.agents/docs.md` Workflow Matrix gains an `Audit` column.
- Standalone `bkit-utility-audit-{codebase,security,tests,logs}.md` get a deprecation header.
- `bkit install` regenerates `.claude/` and `.cursor/` mirrors at session end.

---

## Issue #80 — Comments

### Comment 1 (2026-05-18) — Architecture direction change: stack-detect + skill-install + universal-pattern prompts [PRIMARY INPUT]

After designing the v1 lens prompts with "ecosystem-level conditional probes" (drop `HAS_NEXT`/`HAS_VITEST`, keep `IS_PNPM`/`IS_MONOREPO`), it became clear the prompts are still meaningfully stack-leaky: logger lists (`pino`/`winston`/…), validator lists (`zod`/`joi`/…), deprecated-package lists, package-manager CLI invocations, test directory conventions, build-output names — all Node/TS-ecosystem assumptions baked into the prompt file.

**Proposed pipeline (truly stack-agnostic):**

1. Stack-detect step (NEW, before lens fan-out) — single subagent reads manifests/configs/lockfiles/CI; outputs structured `audit-stack.md`.
2. Skill-install step (NEW, conditional, after stack-detect) — uses stack report to install matching audit skills via `npx skills find audit-{stack}` / `npx skills add`.
3. Lens audit step (fan-out) — 11 lens prompts read `audit-stack.md` + `.agents/docs.md` + `docs/knowledge.md`; probes are PURELY abstract universal patterns; installed skills augment with stack-specific knowledge.
4. WebSearch augmentation (optional) — `"{stack} {lens} best practice 2026"` for fresh community signal.

**Phased rollout:** Phase 1 = add stack-detect step, lenses read upstream report (keep ecosystem conditionals for now). Phase 2 = skill-install step + author audit-skills + strip all stack-specific lists from lens prompts (genuinely universal). Phase 3 = WebSearch gated by `--with-websearch`.

**Decision pending (original):** (A) pull Phase 1 into v1 now, or (B) ship v1 as-is and split Phases 1-3 into follow-ups.

**>>> RESOLVED IN THIS SESSION: full new direction — Phases 1+2 BOTH land in v1. Phase 3 deferred. <<<**

### Comment 2 (2026-05-16) — Audit-hint injection: where does the signal belong? [DEFERRED — context only]

Follow-on to #94. Walked design + plan workflows; conclusion: review prompts score what's on paper and would be guessing at rot — wrong hook. Best single hook is `bkit-plan-generate` (it walks the named surface file-by-file to enumerate tasks); `bkit-debug-failure-diagnose` tracked separately in #94. Recommendation: add an `Audit Recommendation: <none|/bkit-audit "..." — rationale>` field to `bkit-plan-generate` only, with a slot in the plan template. NOT in scope for this design — recorded for awareness; it's a separate integration.

### Comment 3 (2026-05-14) — Original design workflow run log [HISTORICAL]

Record of the original BAR-199 design run (brainstorm → generate → review CONCERNS → apply PASS → organise PASS → summary PASS → workstream issues WS-1..WS-5 #103–#107 → squash-merged to dev `9b48bec`, branch deleted). The canonical design it produced is the one this re-design supersedes.
