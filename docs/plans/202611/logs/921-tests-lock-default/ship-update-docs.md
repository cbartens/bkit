# Docs Update

## Files Modified

- `docs/testing.md` (line 558, § Raw Vitest bullet): added that with `BKIT_TEST_SLOTS` unset the Vitest global setup (`vitest.test-lock.ts`) takes the lock with one slot, so a raw run queues behind any holder of `tests.lock`; an explicit `BKIT_TEST_SLOTS` passes through unchanged. Edit left unstaged.

Already correct from the build, left as is: `docs/testing.md:325`, `.bkit/core/.bkit/templates.md:966`, `.bkit/core/.bkit/workflows.md:1232`, and the mirrors `.bkit/templates.md` and `.bkit/workflows.md` (core-count default, override, per-process advice, `BKIT_TEST_WORKERS` follows the slot count). `docs/decisions.jsonl` key `724-tests-lock-fixed-slots-not-live-load` carries the rule and the per-process advice (not touched; excluded by contract).

## Drift Resolved

- `docs/testing.md`: sync pass closed one gap. Task 7 (the global setup runs the lock command with `BKIT_TEST_SLOTS=1` when unset) was in code (`vitest.test-lock.ts:81-89`) but in no doc. The reorganize, compress and cross-reference passes needed nothing: the new sentence sits in the one existing raw Vitest bullet, and the `Raw Vitest` lines at `:747-748` already point to the test files.
- Other docs checked for stale "default 1" wording: `docs/testing.md`, `.bkit/templates.md`, `.bkit/workflows.md`, `.bkit/core/.bkit/templates.md`, `.bkit/core/.bkit/workflows.md`, `DETAILS.md`, `README.md`, `.bkit/providers.md`, `.bkit/install.md`. None left.
- Agent memory (`MEMORY.md`, `memory/*.md`): no entry mentions the tests lock or `BKIT_TEST_SLOTS`; nothing to change.
- History check: `git rev-parse --is-shallow-repository` printed `false`, so no older history is unread. `git log origin/dev..HEAD` lists the build commits and local `e0325bd7c`; the feature's non-log files are staged and uncommitted.

## Unresolved Coverage

None. Topics the ship touches:

<!-- prettier-ignore -->
| Topic | Status |
| --- | --- |
| `docs/testing.md` | Present, indexed in `.agents/docs.md`, project content; updated. |
| `docs/architecture.md`, `docs/technology.md`, `docs/security.md`, `docs/data-schema.md`, `docs/deployments.md`, `docs/observability.md`, `docs/design.md`, `docs/noise.md`, `docs/setup.md` | Not applicable: a shell lock script, its tests and its docs; no service, library, credential, schema, deploy, logging, design or setup change. All nine are indexed. |

## Pending Items

None. The deferral scan `ship-pending-items-921.md` is empty.

## Blockers

None.
