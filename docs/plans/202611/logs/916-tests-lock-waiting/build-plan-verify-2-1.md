Verdict: PASS
Failures: 0
Fixable: false
Tasks: 6
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 6 satisfied against `build-diff-2-1.md` (commit `2664dc77b`):
  - `SHIPPED_MACHINE_LOCK_HASHES` and `migrateMachineLockCopy(dryRun, ws, logPrefix)` exist in `.bkit/core/engine/install/modules/core.ts`, called by `runBkitDocs` right after `migrateSlopTypeSuppression`. The four cases (absent or template-equal silent; symlink or non-file warns; shipped hash replaced as an unhashed `update`; other copy without `.queue` warns "out of arrival order") match the plan.
  - Hash list is complete: `git tag --list 'v6.*'` shows v6.0.0, v6.1.0, v6.1.1 only; v6.1.0 and v6.1.1 templates and `tests/fixtures/machine-lock/machine-lock-6.1.1.sh` all hash to `63ee5873795fd06b60e1f13c238c9e3c44d9f6dc76a50fe271793de6ad284e87`, the single listed value. The template contains `.queue`, so a merged copy is silent.
  - `pnpm bkit:test:file` on `core.integration.test.ts`, `upgrade.integration.test.ts` and `dogfood-templates.test.ts` under the `tests` machine lock: 3 files, 291 tests passed (includes the three `machine-lock copy migration` tests).
  - `dist/install/modules/core.js` carries the matching hunk in the same commit; `git diff HEAD -- dist/` is clean.
  - Dogfood in a fresh scratch consumer (`node dist/cli.js install --claude`, then the 6.1.1 fixture copied to `scripts/ci/bkit-machine-lock.sh`): first `upgrade` logged `[bkit-upgrade] core: scripts/ci/bkit-machine-lock.sh — machine lock now serves waiting runs in arrival order`; `cmp` with `.bkit/templates/scripts/ci/bkit-machine-lock.sh` exit 0; second `upgrade` printed no line naming the file.
  - `docs/migrations.md` § Migrations has the "Machine-lock copies without the queue" row (releases `6.1.0-6.1.x`, test file named).
- Test-first audit `build-tests-green-2-1.md`: Enforced true, Gaps 0, Unproven 0, no Updated tests or Already landed sections.
- No decision records, no earlier group-2 verify or remediation logs.
- Logging follows the sibling migration's `${logPrefix} core:` form, which `docs/observability.md` § Log Format allows (owning module's prefix).
- Out-of-scope observation for the owner, not a gap: the symlink check runs before the template-equality check (same order as `migrateSlopTypeSuppression`), so a `scripts/ci/bkit-machine-lock.sh` symlinked to a copy that already has the queue is warned about on every upgrade, with a warning saying waiting runs take the lock out of arrival order. The plan lists both "equal to the template → silent" and "under a symlink → warn" without ordering them for this corner.

## Identified Gaps Log

None
