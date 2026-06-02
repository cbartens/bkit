Verdict: CONCERNS
Failures: 5

<!-- verdict:end -->

# Plan Review (lens 3 — regression risk + design-coverage)

Lens: regression risk across all touched surfaces (preflight, postinstall, ship/debug, fixtures, snapshots, version-hashes baseline) and design-coverage for the gether #403 backport.

## Surface-Area Map

### Layer-1 ci.yml (template)

- File: `.bkit/templates/.github/workflows/ci.yml` (Tier-3 seed-or-print).
- Consumers of its shape:
  - `.bkit/src/bkit-preflight.ts` lines 329–357 (`detectCiYmlVerboseCiBlockMissing`) — regex `/^\s*# bkit:start verbose-ci-env\b/m` (any indent tolerated). Plan calls out preservation.
  - `.bkit/src/bkit-templates.test.ts` lines 124–166 — extracts the verbose block by literal 4-space indent (`"    # bkit:start verbose-ci-env"`). Hard-coded indent — moving the block to a different job indent level breaks this.
  - `.bkit/src/bkit-templates.content.test.ts` line 61–63 — `expect(content).toMatchSnapshot()` against the WHOLE template body; snapshot file is `.bkit/src/__snapshots__/bkit-templates.content.test.ts.snap` (one giant snapshot rooted at the entire ci.yml). ANY rewrite of the template makes this test fail until the snapshot is regenerated.
  - `.bkit/src/bkit-postinstall.ts` `detectRunLevelsNotComposed` (line 708) — relies on the literal step name `"Detect Direct Push"` existing in `.github/workflows/ci.yml` to fire; if the step name is folded into `bkit-decide` but the detector still searches for the legacy name, the advisory will silently no-op.

### Layer-1 ci.yml (bkit's own — dogfood)

- File: `.github/workflows/ci.yml`.
- This rewrite RUNS on this very PR (self-CI risk).

### Protection script rename

- Engine + template copies: `scripts/ci/bkit-set-protection.sh`, `.bkit/templates/scripts/ci/bkit-set-protection.sh`.
- Consumers of the name:
  - `.bkit/src/bkit-postinstall.ts` lines 1622, 1625, 1636 (path constant + Quick-path string + status-checks string). Plan covers.
  - `dist/bkit-postinstall.js` lines 1467, 1470 (regenerated via `pnpm build` — covered in Task F1).
  - `.bkit/version` line 48 (`canonicalHashes["scripts/bkit-set-protection.sh"]`) — STALE LEGACY PATH (old `scripts/...` form, not `scripts/ci/...`). Plan does NOT touch this; orphan entry remains.
  - `CHANGELOG.md` line 339 — historical entry referencing the old name; correct to leave as history.

### Layer-2 ship/debug

- `.bkit/workflows/bkit-ship.md` Step 2 step 6 (line 290), Step 12 (lines 885–897, 952). Mirrors regenerated to `.claude/commands/*` and `.cursor/commands/*`.
- `.bkit/workflows/bkit-debug.md` Step 3 (line 362).

### Fixtures + tests

- `tests/fixtures/heavy-customised-ci/.github/workflows/ci.yml` — consumed by `.bkit/src/bkit-modules.upgrade.integration.test.ts` line 290+ asserting the `consumer-job:` block survives outside the `# bkit:start` / `# bkit:end` markers. The fixture today has the bkit-marked block from line 23–52 and the consumer-job from line 54–60 (no `bkit-tests-check`, no `bkit-decide`).

### Rules

- `.agents/rules.md` + `.bkit/templates/.agents/rules.md` — Git/CI/Merges section. Mirror enforced via `.bkit/src/bkit-rules-sync.test.ts`.

## CRITICAL

1. **Snapshot regression NOT in the plan** — `.bkit/src/__snapshots__/bkit-templates.content.test.ts.snap` is a SINGLE full-file snapshot of the entire current template (one `exports[...] = \`...\``block of ~300 lines). The plan modifies`.bkit/src/bkit-templates.content.test.ts`(Task E1) to add NEW assertions but never instructs the agent to regenerate / update / accept the existing snapshot, nor to run`pnpm test -- bkit-templates.content -u`. After Task A2 rewrites the template, this snapshot test goes RED until the snapshot is regenerated. `pnpm test`in Phase F3 will fail. Add an explicit task: "Run`pnpm test -- bkit-templates.content -u` to regenerate the full-template snapshot after Phase A2, then human-review the snapshot diff against the new 4-job shape." (Without this, Gate 4 cannot pass.)

2. **`detectRunLevelsNotComposed` preflight will silently no-op after rewrite** — `.bkit/src/bkit-postinstall.ts` line 713 fires only when ci.yml contains the literal step name `"Detect Direct Push"`. Architecture § Layer 1 says "delete from `bkit-tests`" (the Detect Direct Push step folds INTO `bkit-decide`); if the new `bkit-decide` job does not retain the step _name_ `Detect Direct Push`, the existing preflight + its 11 test cases in `.bkit/src/bkit-postinstall.test.ts` (lines 1182+) become dead code in consumer repos — and worse, the advisory it provides ("you ship the outputs but no consumer-side step gates on them") silently disappears for any consumer who had been relying on the advisory. Plan must either: (a) keep a step inside `bkit-decide` named exactly `Detect Direct Push` so the legacy preflight still fires (cheapest), OR (b) refactor `detectRunLevelsNotComposed` to key off the new `bkit-decide` job and `plan.run_level` outputs and update its tests. Currently neither is in the runbook.

3. **`tests/fixtures/heavy-customised-ci` test contract not protected** — `.bkit/src/bkit-modules.upgrade.integration.test.ts` lines 294–319 asserts (i) `# bkit:start` / `# bkit:end` markers AND `consumer-job` block survive AND (ii) the consumer-added `NODE_AUTH_TOKEN` env line INSIDE the marker block triggers `detectTier2TextDrift`. The plan's Task E5 upgrades the fixture to 4-job shape "preserving the `consumer-job:` block and the `bkit:start` / `bkit:end` markers" — but the (ii) drift test depends on the marker block being byte-comparable to the TEMPLATE's marker block. After Phase A2 the template no longer has bare `# bkit:start` / `# bkit:end` markers around `Install Dependencies` (the template only carries the named `verbose-ci-env` block per `.bkit/src/bkit-templates.test.ts` lines 146–150 "carries no bare whole-file bkit markers (Tier-3 regression guard)") — yet the fixture is REQUIRED to carry bare markers for test (i) to pass. The plan does not explain how the fixture's bare-marker contract co-exists with the template's no-bare-marker contract under the new shape. This is a coverage gap: either the fixture diverges intentionally from template shape (document it + ensure test (ii) still has a stable text-drift trigger), or the test needs to be re-grounded. Currently Task E5 + E6 will both compile but the semantic contract is undefined.

4. **Self-CI sequencing risk on the dogfood ci.yml** — Phase A3 rewrites `.github/workflows/ci.yml` to a degenerate 3-job shape on the very branch CI runs against. The plan does NOT discuss what happens if the new `bkit-decide` shell logic in bkit's own ci.yml has a bug: bkit's CI wedges on its own PR; ship/debug agents cannot validate; the only way forward is `[skip ci]` + force-merge. No staged-rollout, no preview-branch test, no rollback plan inside Phase A. Add a step: BEFORE Task A3 lands, push a NO-OP test of the degenerate `bkit-decide` step (e.g., on a throwaway branch) and inspect the `plan-table-v1` summary, OR explicitly accept the risk in writing as the human-gate in Security & Privacy. The two-task A3+A4 sequence with only `actionlint` as the verification is insufficient — `actionlint` does not run shell logic, only validates syntax.

5. **The capstone's `!cancelled()` choice is asserted but the concurrency-cancel edge is NOT verified** — Plan declares (Edge Cases row "Concurrency cancel") that `bkit-tests-check` reports `cancelled` and ship gates treat it as non-green. But under `if: !cancelled()` the capstone job does NOT run when the WORKFLOW is cancelled — so `statusCheckRollup` will show `bkit-tests-check` as `cancelled` (correct) only if upstream cancellation propagates as `cancelled` to the capstone job itself; if the capstone is mid-execution when cancellation arrives, behavior differs from `always()`. The Derived Test Matrix has NO row exercising this. Either: add a Vitest assertion that ship-gate Step 6 explicitly treats `cancelled` as non-green (the plan text says it does, but Task C1's `Done when` only greps for `bkit-tests-check` literal and "SUCCESS" assertion — does not verify the cancelled/skipped/neutral/missing fall-through is exercised by a test), OR add an integration scenario. Without test coverage, a future refactor that loosens the gate to `conclusion != "FAILURE"` (silently re-introducing the bug) will ship green — which is literally the issue's own theme (per KN-CORE pattern "Validate shipped config with the real tool").

## OPTIONAL

- **Stale `.bkit/version` entry:** line 48 `"scripts/bkit-set-protection.sh"` (old path, not `scripts/ci/...`) is dead data — neither install nor upgrade reads it for an extant file. The rename is a good moment to scrub it. Not blocking — entry is orphan-by-path already.
- **Status-checks string is exact-match-tested:** Task E2 adds an assertion on the literal `"Require status checks: bkit-tests-check\n"` — note `bkit-tests-check` is a prefix of `bkit-tests`, so any future substring search for `"bkit-tests"` (without the `-check` suffix) in `bkit-postinstall.ts` will match BOTH and confuse readers. Recommend using word-boundary regex in any new assertion, e.g. `/\bbkit-tests\b(?!-)/` to specifically isolate the old name without the `-check` suffix.
- **`bkit-protect-main.sh` `--print` mode advisory in postinstall:** plan updates `protectionScript` constant + 2 strings, but the `bkit-set-protection` log prefix (now `bkit-protect-main`) appears on stderr lines that ship/debug parsing could regex-match. No current consumer parses these, but worth noting in CHANGELOG.
- **Dist-mirror parity test:** plan runs `pnpm check:dist` in F1 but does not assert the new strings made it into `dist/bkit-postinstall.js`. Add a unit assertion against `dist/bkit-postinstall.js` for `bkit-protect-main.sh` to prevent stale-dist regression.
- **Capstone's `Done when` does not assert ordering** — Task A2's `Done when` only counts the 4 `jobs:` entries; does not assert `bkit-tests-check` appears AFTER `bkit-tests-live` in the file (cosmetic) and does not assert the `needs:` array contains all three names. Tighten Task E1's assertions accordingly.

## OUT OF SCOPE

- Migrating the existing `gh` CLI calls in `.bkit/workflows/bkit-ship.md` to MCP-only (plan correctly defers this; the memory note "Workflows are MCP-only for GitHub/Linear" applies to `.agents/workflows/*.md`, which does not exist).
- Auto-flipping branch protection on `cbartens/bkit` `main` (plan correctly defers — 403 on non-Pro).
- Renovate / external-caller alias drops (gether D14 / WS-4).
- Sub-issue #209 plumbing defects (status.jsonl + `[skip ci]` tip guard).

---

**Cross-reference with `docs/knowledge.md`:** KN-CORE-2 (pnpm `${VAR:-default}`), KN-CORE-3 (default-branch config), KN-CORE-4 (pnpm narrow specifier) — none of these touch the CI-shape surface this plan changes. No prior `KN-CORE-*` flags a regression in the surfaces touched here. Plan does NOT re-enter any known-broken pattern from the knowledge base.

**Design-coverage:** No `docs/plans/202606/203-ci-green-validated-design.md` exists; canonical reference is `/Users/christian/Documents/GitHub/app-gether-life/docs/plans/202605/403-ci-simplification-design.md`. The plan covers Layers 1-3 of #203 + the 403-backport scope. PRIMARY STEER from `plan-input.md` ("copy as much of gether's ci.yml as makes sense — fidelity over abstraction") IS respected in plan text (Architecture § Layer 1 calls out `bkit-decide` canonical, stubs only the not-universal tiers). No design section identifying touched surfaces lacks a plan task EXCEPT the snapshot regeneration noted in CRITICAL #1.
