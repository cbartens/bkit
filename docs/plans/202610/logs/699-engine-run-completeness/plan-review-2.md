Verdict: PASS
Failures: 0

<!-- verdict:end -->

# Plan Review

Lens: Regression risk, design-coverage.

## Surface-Area Map

Verified each task's claimed surfaces against the worktree; `plan-generate-check.md` (Problems 0, Existence 0, caps in limits) corroborates symbol existence. `✓` = claim confirmed in source.

- **TASK 1 (MARK_ROWS readers).** `run-facts.ts:354` `MARK_ROWS = {"session","owner-pause","owner-answer"}` ✓; `stepsBlock` filter at `run-facts.ts:117` ✓; harvest copy `bkit-harvest.mjs:1478` ✓; parity test `bkit-harvest.test.mjs:2937` (`MARK_ROWS is the engine's`) ✓. Consumers: `run-facts` step-timing, harvest `splitRuns` / `runRows` / `lastActivity` (TASK 2 audits the accepted `afterEnd` shift). **High-risk surface** (silent telemetry corruption, measured 1208.1 → 0.7) — covered by the step-timing case + parity test; lands before any writer (Group 1 first) ✓.
- **TASK 2 (reader audit + docs).** `fold` in `ledgers/status.ts` (`StatusRow = { type: string } & …` at :128, unknown types skipped) ✓; `readStatusRows` / `runStatusRows` in `commands/workflow/status.ts`; `splitRuns` in `bkit-harvest.mjs`; `.bkit/workflows.md` row table; `.bkit/jsonl.md` `run` row.
- **TASK 3 (journal leaf module).** New `ledgers/journal.ts` importing only `node:fs` / `node:path` / `./status.js` / `./telemetry.js` — no cycle into `commands/` ✓ (checked import directions). `validate` / `writerProblem` / `mintTs` / `APPEND_LEDGERS` in `telemetry.ts` ✓; `SHARED_EXIT_CODES` at `lib.ts:38` ✓; `KIND_WRITERS.friction.orchestrators = {design, plan, build, debug, ship, auto}` ✓ (verified — the 4-entry set at `telemetry.ts:399` is the `decision` kind, not friction; no writer-contract change needed).
- **TASK 4 (dispatch seam — highest-risk surface).** `runCommand` at `lib.ts:317` ✓, `statusLocation` at `lib.ts:559` ✓, `ctx.log` → `io.stderr` (`lib.ts:350` → `:284`) ✓. CLI-wide blast radius (every registered noun in every consumer repo). Mitigations present: injectable `journal` option, nested try/finally, exit-code-passthrough + one-stderr-line unit cases, and a non-mock Integration test (real temp git repo, real `runCommand`, row bytes asserted in the worktree's `.bkit/friction.jsonl`, nothing in the main checkout's — a ground-truth signal). `resolveActiveRun` confirmed absent today (no collisions).
- **TASK 5 (friction through commit + harvest).** `harvestConsumer` in `scripts/harvest/ledgers.ts`; Integration row asserts the seam-written row survives `ledgers commit` and reaches the harvested ledger — directly guards the known identity-gated-prune surface (see Knowledge below).
- **TASK 6 (deriver generalisation).** `status-holes.ts` exists (477 lines); deleted exports `deriveExpectedStepSetFromSource` (:135) / `checkSourceCanonicalDrift` (:193) — **backwards-compat check: only importer is `checks/status-holes.test.ts`** (grep across `.bkit` + `scripts` ✓), updated in the same task. `SHIP_STEP_ORDER` retained as data ✓. `--ship-md` override referenced only inside the module's own CLI; `package.json:94` `bkit:audit:status` and `bkit-ci.yml:510-511` pass no flag, so dropping it breaks no caller ✓. Promoted helpers `stepSections` (`workflow-shape.test.ts:632`) / `callWords` (:65) ✓; `unknownCalls` stays (avoids a `checks → commands/registry` edge) ✓.
- **TASK 7 (conditionality rule).** Deriver change + `.bkit/authoring.md` authoring rule + per-workflow fixture; no other consumers.
- **TASK 8/9 (checker).** Pure `check(rows, contract)` over `fold` row shapes; verdict contract consumed by TASK 10 (command), TASK 11 (close append), TASK 12 (start warning). Read path (last `completeness` row, recompute when rows follow) covered by matrix row → TASK 9.
- **TASK 10 (new noun).** `commands/registry.ts` `COMMANDS` ✓; `conventions.test.ts` reachability + exit-code-listing gate ✓; sibling `status.ts` `CommandSpec` / `FILE_FLAG` / `WORKFLOW_FLAG` reused ✓.
- **TASK 11 (close append — critical path).** `closeWorkflow` at `workflows.ts:1114` ✓, `appendStats` fail-open idiom at `:1025` ✓. Every phase close in every consumer repo — covered by close-ordering + forced-throw cases (still writes `workflow-done`, normal exit code).
- **TASK 12 (start warning — critical path).** `start` verb (`workflows.ts:1965-2017`, `resumed` / `lastDoneStep` confirmed) ✓; warning on stderr via `ctx.log`, stdout stays the single output object; holey-previous-run case pins it. Status file is per-FID across all five workflows, so "previous run whatever its workflow" is resolvable ✓.
- **TASK 13 (CI lane).** `Check Status Holes` (`bkit-ci.yml:510`) keeps `|| true`, gains a fail-closed liveness assertion (missing sweep-summary line fails the lane) — intentional, design-mandated (WS-7); fails in the safe direction.
- **TASK 14 (docs).** `docs/observability.md` (both already-registered prefixes), `docs/testing.md` § Tier-3 / static lane.
- **TASK 15 (generated artifacts).** `docs/capabilities.md` (graphify rollup, CI-gated), `dist/` (`bkit:check:dist`, CI-gated) — both regenerated in the same change ✓.

**Design-coverage:** design doc present (`docs/plans/202610/699-engine-run-completeness-design.md`). All eight workstreams map to the eight groups (WS-1→G3, WS-2→G4, WS-3→G2, WS-4→G1, WS-5→G5, WS-6→G6, WS-7→G7, WS-8→G8) with regression tests via the Derived Test Matrix (26 rows, each mapped to a task). WS-8's ledger bookkeeping sits outside the runbook by declaration; verified on disk: decisions `699-completeness-check-module-and-seam-files`, `384-tier3-promotion` (+12 more `699-*` rows) present; deferrals `442-…` CLOSED, `699-completeness-check-excludes-bkit-auto-router` / `699-completeness-verdict-no-success-axis` OPEN. Declared non-goals (promotion-to-gate, bkit-auto coverage, success axis) correctly excluded with `Exempt` rows.

**Knowledge cross-reference:** folded `docs/knowledge.jsonl` (84 winning rows). `identity-gated-prune-…-truncated-friction-keys-collide`: the plan's dedup key `<noun>-<verb>/<step>` (≤ ~40 chars on real step names) stays far under the ~68-char truncation point, `recurrenceCount` reads the raw prior row rather than trusting the fold, and TASK 5's harvest integration test guards the prune surface — no re-entry into the known-broken pattern. `kn-21-workflow-status-jsonl…`: rows ride the run's own commits per the append-only SoT contract ✓. `fail-open-empty-catch-is-a-documented-contract…`: each swallow logs one line and TASK 14 documents the contract ✓. `related-failures.md` = None. Caps verified: ≤3 tasks / ≤15 TEST FIRST tests per group; ≤10 tests across ≤3 files per task; plan-check Problems 0.

## CRITICAL

None. Every high-risk surface (the `runCommand` seam, both `MARK_ROWS` copies, the close/start critical path, the deleted module exports, the CI lane) carries regression coverage in the Derived Test Matrix mapped to its task; the backwards-compat deletion is verified single-importer and lands with its only consumer in the same task; both boundary-crossing tasks (4, 5) use non-mock integration tests asserting ground-truth signals; no mock-only boundary coverage, no unpassable TEST FIRST check found, no design surface parked out of scope, and no plan task re-enters a known-broken pattern.

## OPTIONAL

1. **TASK 2's inert-row test is a characterisation pin, not red-first.** `fold` / `readStatusRows` already tolerate unknown types (design spike C7), so `ignores a row type it does not know` passes on current code with no change to drive green. Consider a `TEST EXCEPTION`-style note in the task that it pins existing behaviour, so the red-first ledger stays honest.
2. **Pin the CI liveness grep to the summary line's format.** TASK 13's lane assertion greps sweep output for a line whose text only TASK 6's unit test asserts exists. If the printed format drifts from the CI pattern the lane fails closed (safe), but naming the exact line format in TASK 13 (or tying it to TASK 6's fixture) removes a spurious-failure mode.
3. **TASK 11 `DEPENDS ON: 4, 9, 10` is broader than the close path consumes.** The close append needs the checker (9) and the seam's readers/journal (4); the `completeness` command (10) is needed only by TASK 12's warning text. Harmless for build order, but a tighter `4, 9` would keep the dependency graph truthful for parallel scheduling.
4. **Note the friction-key truncation bound where the key is defined.** Knowledge `identity-gated-prune-…` records friction keys truncating at ~68 chars. The `<noun>-<verb>/<step>` shape is short by construction, but a one-line comment at `frictionKey` (or in `.bkit/jsonl.md`) stating the bound would stop a future long step name from silently colliding dedup keys.

## OUT OF SCOPE

1. **Friction-key truncation / identity-collision class fix** (knowledge `identity-gated-prune-destroys-fold-losers-truncated-friction-keys-collide`): a schema-level change to key minting / prune gating belongs to its own issue; this plan's key shape merely avoids the collision envelope.
2. **Outdated dev-only deps** (`vite` 6→8, `@types/node` 24→26, `vitest` patch, `oxlint` patch): named in Pre-Flight as upstream of this change and explicitly not taken — correct; any bump is a separate maintenance cycle.
