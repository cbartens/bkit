# Docs Update

## Files Modified

- `docs/testing.md`

## Drift Resolved

- `docs/testing.md`: sync pass only (reorganize, compress and cross-reference passes found nothing to change).
  - Verified against `vitest.timeout-budget.ts`, `vitest.setup.ts`, `scripts/ci/bkit-test-limits.mjs` and `tests/shell/setup_suite.bash`: the `ci-strict-time-limits` row and the **Time limits** bullet (written by the build) match the shipped code (CI 5s / 10s / 30s, local 6x = 30s / 60s / 180s, `localLimit`, `BKIT_LIMIT_FACTOR`). Left as is.
  - Closed a gap in the test inventory (§ Test files table): the `scripts/ci/bkit-test-limits.test.mjs` row now says the local values are exactly 180s (`--test-timeout=180000`, 180 seconds). Added rows for `.bkit/core/engine/audits/repo/vitest-timeout-budget.test.ts` and `.bkit/core/engine/audits/repo/vitest-timeout-budget.integration.test.ts`, which had none.
- `.bkit/templates/docs/testing.md`: the build's `ci-strict-time-limits` row is accurate and stack-neutral. No change.
- Shipped audit templates (`.bkit/core/docs/templates/bkit-audit-flakes.md` and the adopted copies in `docs/templates/`): reworded by the build. The plan's grep for `load-scaled|loadFactor|planUnitLoad|MAX_LOAD_FACTOR|UNIT_PLANNED_LOAD_PER_CORE|laptop's load` (outside `docs/audits/**`, `docs/plans/**`, `*.jsonl`, `floorplan/**`) finds only two negative-assertion fixtures in `vitest-timeout-budget.test.ts`. No stale doc text remains.
- Memory (`MEMORY.md`): holds no entry on load-scaled limits; no change.
- The edit to `docs/testing.md` went through a short `python3` replace in the shell instead of the Edit tool. It is a single three-row change and the result was checked with `git diff`. Left uncommitted.

## Unresolved Coverage

None. Only the testing topic is touched by this ship (`docs/testing.md` exists, is indexed and holds project content). Architecture, technology, security, data-schema, deployments, observability, design, noise and setup are not applicable: the change is a test-harness constant and guard-test change with no component boundary, dependency, credential, schema, deploy or CI-limit change.

## Pending Items

- `814-local-test-limits-challenge-low-tests-shell-setup-suite-bash-22` (LOW, low-severity, `tests/shell/setup_suite.bash:22`): with `CI=false` exported, bats takes the 30s CI branch (`[ -n "${CI:-}" ]`) while Vitest and `node --test` take the 180s local limit (`limitFactor` matches only `true` / `1`), and the bats parity test reads only the else branch. Done when `setup_suite` treats only `CI=true` / `CI=1` as CI and the parity test asserts the match.

## Blockers

None
