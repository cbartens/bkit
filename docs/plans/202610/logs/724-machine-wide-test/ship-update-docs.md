# Docs Update

## Files Modified

- `CHANGELOG.md`
- `docs/testing.md`
- `docs/plans/202610/logs/724-machine-wide-test/ship-scan-reconciliation.md`

## Drift Resolved

- `CHANGELOG.md`: Synced the Unreleased fixes with the literal-marker filter, assertion-move matching and evidence requirements for removed coverage. Documented automatic refresh of byte-identical v6.0.0 slop-plugin copies, preservation and visible manual guidance for customized or symlinked copies, dry-run behavior and idempotence. Kept the fixes together, compressed the wording and linked the existing `docs/migrations.md` section. No published release is claimed.
- `docs/testing.md`: Synced the scanner coverage row with occurrence counting, original-test attribution and test-context requirements. Replaced the stale file-wide assertion-count description in its existing row, compressed the wording and checked the existing cross-references.
- `docs/plans/202610/logs/724-machine-wide-test/ship-scan-reconciliation.md`: Corrected the original 107 findings to 95 preserved and 12 restored, with no retirements. Added the direct enabled upgrade-test proof for B105 and retained the superseded classification as historical context. Updated the remaining-work section to the current scan disposition and checked the evidence paths.
- Existing machine-lock guidance, migration registration and package documentation already describe the delivered behavior. No agent `MEMORY.md` or `memory/*.md` files were found in the repository or the available Codex memory search. The repository is not shallow; no older history boundary applies.

## Pending Items

- 724: `724-host-hook-catches-raw-test-runners` — Host-level hook that routes a raw `npx vitest` (or any runner) in a consumer repo through the tests lock.
- 724: `724-gate-templates-pass-test-workers` — Shipped gate-script templates pass `BKIT_TEST_WORKERS` to the consumer's test runner (`--maxWorkers`).
- 724: `724-timeout-budget-and-ci-serialisation-unchanged` — Retuning `vitest.timeout-budget.ts` once the tests lock lowers local load, and any CI serialisation, stay outside the machine-wide tests-lock change.
- 724: `724-upstream-consumer-load-gate` — Upstream a consumer's load-gate script (one runner deciding whether to overlap its own jobs by projected load and memory pressure).

## Blockers

None.
