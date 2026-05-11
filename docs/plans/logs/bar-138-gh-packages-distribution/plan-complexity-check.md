Verdict: SPLIT

<!-- verdict:end -->

# Plan Complexity Check

## Counts

**Tasks:** 30 named tasks (A1–A5, B1–B15, B11.5, C0–C5, D1–D5) plus 5 mandatory testing/doc checklist items.

**Gates:** 4 hard gates (Gate 1 — prerequisites/human sign-off, A5 — pre.1 publish smoke, B15 — pre.2 publish smoke, C5 — scratch-consumer smoke, Gate 2 — code implementation, Gate 3 — testing/docs, Gate 4 — automated verification). Each gate is a real blocking checkpoint that requires live CI feedback or human confirmation before proceeding.

**Domain areas covered:**

- Infra / CI pipeline: new `release.yml`, edits to `ci.yml` and consumer template CI YAML
- Package manifest: `package.json` field changes + version cadence (pre.1 → pre.2 → 0.4.0)
- Installer / CLI code: 5 string constants rewritten in `.agents/scripts/bkit-modules.ts` + `runCoreModule` banner change
- Build: `dist/` regeneration with staleness-gate verification
- Tests: 4 new or extended Vitest test files (manifest, print constants, release-workflow structural, CI template snapshot)
- Docs: 5 doc files modified/appended (`README.md`, `.agents/README.md`, `docs/decisions.md`, `docs/pending.md`, `docs/knowledge.md`)
- Live registry / smoke: two pre-release tag publishes + scratch-consumer manual smoke in `tmp/bar-138-smoke/`
- PR / merge flow: feature branch → `dev` squash-merge → `dev` → `main` promotion → production tag

## Session Fit Estimate

**Estimated token budget breakdown:**

| Activity                                                                                                              | Tokens |
| --------------------------------------------------------------------------------------------------------------------- | ------ |
| Reading all relevant source files (package.json, bkit-modules.ts, 3 workflow YAMLs, 5 doc files, test files)          | ~25 K  |
| Writing/editing 5 source constants + package.json + 2 workflow YAMLs + consumer template                              | ~20 K  |
| Writing/editing 5 doc files (README, .agents/README, decisions, pending, knowledge)                                   | ~15 K  |
| Writing 4 new/extended Vitest test files with acceptance assertions                                                   | ~15 K  |
| dist/ rebuild reasoning + check:dist verification output                                                              | ~5 K   |
| Gates, gate failure diagnosis loops, and pre-release tag/publish verification (2 gates with possible re-tag recovery) | ~20 K  |
| Scratch-consumer smoke (setup, install, bkit install --full, transcript capture)                                      | ~10 K  |
| PR creation, merge operations, Linear comments                                                                        | ~5 K   |
| **Total**                                                                                                             | ~115 K |

The estimate is ~115 K tokens, exceeding the 100 K threshold. The primary drivers are the live-registry gate cycles (A5, B15, C5) which each require waiting on GHA run completion, iterating on failures, and capturing verbose transcript output — these inflate the execution loop substantially beyond a pure edit session.

## Rationale

The plan cannot reliably fit one session due to three compounding factors:

1. **Live blocking gates with async waits.** Tasks A4/A5, B14/B15, and C4/C5 each require pushing a tag, waiting for a GitHub Actions run to complete, and potentially diagnosing a live registry auth failure. Each gate can loop (delete-retag-repush), making token consumption non-deterministic and unbounded from a session perspective.

2. **Multi-phase dependency chain.** Phase A must green-light before Phase B starts; Phase B must green-light before Phase C; Phase C before Phase D. A single session cannot pre-execute phases in parallel, meaning dead time between phases accumulates.

3. **Breadth of artifacts.** 30 tasks touch 15+ distinct files across 4 layers (pipeline, code, tests, docs) plus 3 live CI runs. Even if all edits execute cleanly, reading, editing, and verifying each file uses tokens steadily across the full session.

**Proposed split into two sub-plans:**

| Sub-plan                                 | Phases                          | Key deliverables                                                                                                                                              | Estimated tokens |
| ---------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- |
| **Sub-plan 1 — Pipeline + code + tests** | Phase A, B1–B12, C0–C2          | `release.yml`, `package.json` manifest, `bkit-modules.ts` print constants, `dist/` rebuild, 4 Vitest test files, consumer template and bkit-self ci.yml edits | ~70 K            |
| **Sub-plan 2 — Docs + smoke + ship**     | B8–B11.5, B13–B15, C3–C5, D1–D5 | 5 doc rewrites/appends, full local check suite, pre.2 tag publish, scratch-consumer smoke, PR open, squash-merge, dev→main promotion, v0.4.0 production tag   | ~55 K            |

Note: B8–B11.5 (docs) straddle both because they are logically independent of code but must precede the pre.2 tag — they are placed in Sub-plan 2 to keep Sub-plan 1 under budget. Sub-plan 2 inherits Sub-plan 1's green state before starting.
