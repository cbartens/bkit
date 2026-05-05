# BAR-130 — Plan v4 Split (Parent Index)

> **Source:** `plan-v3-checked.md` partitioned into three single-session-executable children per the complexity-check recommendation. No tasks dropped; no tasks duplicated; ordering preserved across children.

**FID:** `bar-130-ci-lint-scaffolding`
**Master plan (full v3 — checked):** [`plan-v3-checked.md`](./plan-v3-checked.md)
**Complexity-check basis:** [`plan-complexity-check.md`](./plan-complexity-check.md)
**Linear issue:** BAR-130

## Context (carried from parent — do NOT re-derive)

bkit `v0.1.1` extracted only the agent-orchestration core and shipped zero CI/lint discipline. This plan ships `v0.1.2` to close those gaps in one cut across three scopes (A/B/C):

- **(A) bkit-the-repo gates its own PRs** — `ci.yml`, Vale, slop-scan, prettier, lint scripts in bkit itself.
- **(B) bkit-the-installer scaffolds the same stack into consumers** — three-tier ownership model + token substitution + auth-shim.
- **(C) CLI redesign** — collapses `init` + `install` + `--host=` into composable module flags.

Each child preserves a verbatim subset of the master's Acceptance Scenario, Edge Cases, Derived Test Matrix, Supersession Inventory, Verification Plan, and DoD coverage so the child is single-session executable without reading the parent.

## Children — Index

<!-- prettier-ignore -->
| # | File | Scope | Tasks | Phases | Est. tokens |
| --- | --- | --- | --- | --- | --- |
| 1 | [`bar-130-ci-lint-scaffolding-plan-1.md`](./bar-130-ci-lint-scaffolding-plan-1.md) | **(A) bkit-the-repo self-gating** — `.github/workflows/ci.yml` for bkit, `.vale.ini`, `.vale/styles/House/`, `slop-scan.config.json`, `.prettierignore`, prettier devDep, lint scripts in bkit's `package.json`. | 4 | 7 | ~25K |
| 2 | [`bar-130-ci-lint-scaffolding-plan-2.md`](./bar-130-ci-lint-scaffolding-plan-2.md) | **(B) bkit-the-installer engine** — token resolver (`bkit-tokens.ts`), marker generalisation, tier writers (`bkit-tiers.ts`), dry-run parity fix + `WriteSet`, all `.agents/templates/` payloads. | 20 | 0, 1, 2, 5, 6 | ~60K |
| 3 | [`bar-130-ci-lint-scaffolding-plan-3.md`](./bar-130-ci-lint-scaffolding-plan-3.md) | **(C) CLI redesign + ship prep** — `bkit-cli.ts`, `bkit-modules.ts` dispatcher, `bkit-install.ts` `main()` refactor, delete `bkit-init.ts`, README + `.agents/README.md` rewrites, `decisions.md`, `pending.md`, version bump, smoke gates. | 17 | 3, 4, 8, 9, 10 | ~45K |

Total: 41 tasks (== master 41 — losslessness verified).

## Order-of-Execution Constraint

```
v4-1 (A: bkit self-gating)
  └─→ v4-2 (B: installer engine + templates)
        └─→ v4-3 (C: CLI redesign + ship prep)
```

- **v4-1 must precede v4-2 + v4-3** because subsequent automated verification (`pnpm format:check`, `pnpm lint:prose`, `pnpm lint:slop`) depends on the lint scripts and prettier devDep added by v4-1's Task 7.4. Bkit's own CI workflow (Task 7.1) must also be live so v4-2/v4-3 PR runs are gated.
- **v4-2 must precede v4-3** because `bkit-cli.ts` (v4-3 Phase 3) and `bkit-modules.ts` (v4-3 Phase 4) import the token resolver (`bkit-tokens.ts`) and tier writers (`bkit-tiers.ts`) created in v4-2. The module dispatcher in v4-3 Phase 4 also depends on the templates payload from v4-2 Phase 6 + the dry-run parity `WriteSet` accumulator from v4-2 Phase 5.

Each child ends in green tests + typecheck and is a preservable checkpoint per the master's own scope-size guidance.

## Cross-cutting: DoD Bullet Ownership

Master `plan-input.md` lists 16 DoD bullets. Each is owned by exactly one child below. (Bullet ordering matches `plan-input.md` § DoD top-to-bottom.)

<!-- prettier-ignore -->
| # | DoD bullet (paraphrased from `plan-input.md`) | Owner |
| --- | --- | --- |
| 1 | bkit's own PRs run typecheck + vitest + Vale + slop-scan + self-test | **v4-1** (Tasks 7.1, 7.2, 7.3, 7.4) |
| 2 | `bkit install` (no flags) on empty repo seeds full stack across 3 tiers | **v4-3** (Phase 4 — module dispatcher + integration tests) |
| 3 | `bkit install --claude` on empty repo seeds only `.claude/**` + core | **v4-3** (Task 4.1 integration test) |
| 4 | `bkit install --ci --lint` seeds CI + lint stack + core; nothing else | **v4-3** (Task 4.1 integration test) |
| 5 | `bkit install --ci` on existing customised `ci.yml` injects bkit-managed block w/ substituted tokens | **v4-2** (Task 6.1 + Task 6.1b end-to-end substitution test) |
| 6 | `bkit install` on repo w/ existing `slop-scan.config.json` (Tier 3) preserves it + prints suggestion | **v4-2** (Task 2.3, 2.4 Tier 3 writer; Task 6.3 template) |
| 7 | `bkit install` (any module set) is idempotent — second run zero diff | **v4-3** (Task 4.1 idempotence integration test) |
| 8 | `bkit check --full` ≡ `bkit install --full` writeset (regression of 14-vs-15 bug) | **v4-2** (Phase 5 — Tasks 5.1, 5.2, 5.3) |
| 9 | Token substitution: seeded `ci.yml` has consumer's `.nvmrc` value + default branch | **v4-2** (Task 1.1, 1.2, 1.3 token resolver + Task 6.1b end-to-end assertion) |
| 10 | `bkit init` prints deprecation warn + runs `install --full` | **v4-3** (Tasks 3.1, 3.2, 3.3) |
| 11 | `bkit install --host=claude` prints deprecation warn + runs `--claude` | **v4-3** (Tasks 3.1, 3.2, 3.3) |
| 12 | Seeded `ci.yml` includes auth-shim step; README documents `BKIT_READ_TOKEN` | **v4-2** (Task 6.1 auth-shim assertion) + **v4-3** (Task 8.1 README) |
| 13 | `app-gether-life` re-installs at v0.1.2 with no surprise drift; CI passes | **v4-3** (Task 10.3 + Gate 4.5a) |
| 14 | At least one second consumer onboards via `bkit install --full` | **v4-3** (Gate 4.5b) |
| 15 | `package.json` bumped to `0.1.2`; tag pushed | **v4-3** (Task 10.1 bumps; Task 10.4 hands tag-push to `bkit-ship`) |
| 16 | README + `.agents/README.md` document three-tier model, module-flag CLI, `init` deprecation | **v4-3** (Tasks 8.1, 8.2) |

## Cross-cutting: Manual Smoke Gate Ownership

Gate 4.5 (Manual Smoke Confirmation — DoD bullets 13 + 14) is a single human-gate that lives in **v4-3 only**. Children v4-1 and v4-2 each have their own Gate 1/2/3/4 cycles but do NOT carry Gate 4.5 (no smoke step belongs to those scopes).

- **Gate 4.5a** — `app-gether-life` smoke (per v4-3 Task 10.3) → smoke log committed at `docs/plans/logs/bar-130-ci-lint-scaffolding/smoke-install.md`.
- **Gate 4.5b** — second-consumer onboarding (per v4-3 Manual Verification Step 8) → log appended to same file (or sibling `second-consumer.md`).

## Cross-cutting: Supersession Inventory Distribution

All six supersession rows from the master target files inside scope C (CLI redesign). Therefore the **entire Supersession Inventory lives in `bar-130-ci-lint-scaffolding-plan-3.md`**; v4-1 and v4-2 list `None` (with cross-link to v4-3 for awareness). Distribution:

<!-- prettier-ignore -->
| Existing artifact | Owner |
| --- | --- |
| `parseArgs()` in `bkit-install.ts` (verb + `--host=` model) | **v4-3** |
| `bkit-init.ts` file (84 LOC standalone) | **v4-3** (Task 4.4 deletes) |
| CLI verb `bkit init` | **v4-3** (RETAIN-WITH-REASON deprecation stub) |
| CLI flag `--host=claude\|cursor` | **v4-3** (RETAIN-WITH-REASON deprecation stub) |
| `runHost()` in `bkit-install.ts` | **v4-3** (Task 4.5 verifies removal) |
| `printUsage()` in `bkit-install.ts` (old help string) | **v4-3** (Task 4.3 verifies removal) |

## Cross-cutting: Acceptance Scenario Inheritance

Each child carries the SAME Narrative + Success Criteria as the master (the feature contract is one feature, not three). What differs per child:

- **Concrete Example** — each child uses a scenario subset that exercises only that child's surface. v4-1 uses bkit's own PR running its own CI; v4-2 uses a token-substitution + tier-write scenario; v4-3 uses the user-facing `bkit install --full` end-to-end flow.
- **Derived Test Matrix** — partitioned per the test-file ownership in master Phase 0 (every test file is owned by exactly one child):
  - **v4-2 owns** test files: `bkit-tokens.test.ts`, `bkit-tiers.test.ts`, `bkit-dry-run-parity.integration.test.ts`, plus the marker-generalisation extensions to `bkit-install.test.ts`, plus the `ci.yml` auth-shim assertion in `bkit-install.test.ts`, plus the substituted-`ci.yml` integration test in `bkit-modules.integration.test.ts` (Task 6.1b).
  - **v4-3 owns** test files: `bkit-cli.test.ts`, the bulk of `bkit-modules.integration.test.ts` (module dispatch + idempotence + `.bkit-version` first-run + write-order tests).
  - Note on the cross-file write — v4-2 Task 6.1b authors a single integration test in `bkit-modules.integration.test.ts` (which v4-3 fully owns). v4-3's runbook acknowledges this pre-existing test and does NOT re-author it; v4-3 Phase 4 tasks add tests to the same file alongside.

## Cross-cutting: Edge Cases Inheritance

All 9 master Edge Cases reproduced verbatim in each child where relevant (each child filters to the rows its surface can express):

- **v4-1** carries the Vale-binary-not-in-PATH row only.
- **v4-2** carries: existing `ci.yml` + no markers, existing `slop-scan.config.json`, `.nvmrc` absent fallback, `package.json.name` absent hard-fail, mid-install crash + `.bkit-version` order, stale `ci.yml` block.
- **v4-3** carries: `--full` redundancy / idempotent dispatch, `bkit init --host=cursor` deprecation, mid-install crash + `.bkit-version` order (shared awareness with v4-2), stale `ci.yml` block (re-running `bkit install --ci`).

## Self-Verification

- **Task losslessness:** master 41 tasks → v4-1 (4) + v4-2 (20) + v4-3 (17) = 41. PASS.
- **Phase coverage:** master Phases 0–10 → v4-1 (Phase 7), v4-2 (Phases 0, 1, 2, 5, 6), v4-3 (Phases 3, 4, 8, 9, 10). All 11 phases assigned exactly once. PASS.
- **Gate coverage:** Gates 1/2/3/4 reproduced in all three children; Gate 4.5 + sub-gates 4.5a/4.5b in v4-3 only. PASS.
- **Supersession losslessness:** 6/6 rows assigned to v4-3 (with cross-link from v4-1/v4-2 noting `None — see v4-3`). PASS.
- **DoD losslessness:** 16/16 DoD bullets assigned via the ownership table above. PASS.
- **Per-child token budget:** v4-1 ~25K, v4-2 ~60K, v4-3 ~45K — each ≤100K. PASS.
- **Template invariants:** each child contains Context, Acceptance Scenario, Breaking Changes, Out of Scope, Pre-flight + Gate 1, Architecture, Documentation, Rollback, Runbook with Gate 2/3, Verification Plan with Gate 4 (Gate 4.5 in v4-3 only), and `**Parent Plan:**` link. PASS.

## Blockers

None.
