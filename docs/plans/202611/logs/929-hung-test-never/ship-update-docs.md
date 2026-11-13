# Docs Update

## Files Modified

- `docs/testing.md`
- `docs/technology.md`

## Drift Resolved

- `docs/testing.md`:
  - Sync: the **Time limits** bullet now says that `pnpm bkit:test:awake` runs its test file through `scripts/ci/bkit-test-file.mjs`, so it gets the `node --test` limits (the `package.json` script change shipped in this cycle).
  - Sync: the `test-file-script.integration.test.ts` inventory row now covers the never-exiting-child case (exit 1 within the limit, reported as a failure).
  - Sync: added an inventory row for `bats-setup-suite.integration.test.ts`, which holds the hanging-bats-test case this cycle added and had no row.
  - Reorganize, compress, cross-references: no change needed; the merge of local `dev` kept dev's `tests-lock` and `tests-jump` rows and this feature's three new rows in one table.
- `docs/technology.md`:
  - Sync: the bats row names the pinned `1.13.0` version and the `patches/bats@1.13.0.patch` patch applied through `pnpm.patchedDependencies`, so a version bump needs the patch remade.
  - Reorganize, compress, cross-references: no change needed.

## Unresolved Coverage

- `docs/data-schema.md` and `docs/noise.md` still hold only the starter text (`bkit check` advisory `project-docs-unpopulated`). Not applicable to this ship: the shipped files touch neither a database nor a signal downgrade.
- Not applicable, with the reason: `docs/architecture.md` (only bkit-only test harness files changed), `docs/security.md` (no auth, input or secret change), `docs/deployments.md` (its gate table already names `pnpm bkit:test:awake` correctly), `docs/observability.md`, `docs/design.md` and `docs/setup.md` (no logging, UI or local setup change).

## Pending Items

- `929-hung-test-never-challenge-low-vitest-setup-ts-152`: a hook given its own longer timeout has its setup child killed at the file's default hook timeout.
- `929-hung-test-never-challenge-low-skills-lock-json-35`: `skills-lock.json` has an empty `computedHash` for `find-skills`.
- `929-hung-test-never-challenge-low-tests-shell-setup-suite-bash-22`: `CI=false` or `CI=0` gets the strict 30s bats limit from `tests/shell/setup_suite.bash`.
- `929-hung-test-never-challenge-low-vitest-child-deadline-ts-39`: a test with `{ timeout: Infinity }` makes every child call throw `ERR_OUT_OF_RANGE`.
- `929-hung-test-never-challenge-low-vitest-child-deadline-ts-54`: the limit error thrown for a hung child does not carry the child's `stdout`, `stderr`, `status`, `signal` and `pid`.

## Blockers

None
