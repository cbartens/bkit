# Docs Update

## Files Modified

- `docs/testing.md`

## Drift Resolved

- `docs/testing.md` (sync, compress, cross-references; `docs/*.md` link check found nothing to change):
  - `ship-invariants.test.ts` row: added the three Step 2 exit-80 (MCP) checks shipped this cycle. The arm reads check-run conclusions (`get_check_runs` or `actions_list`, not `get_status`), stops on cancelled / action-required / stale, sends failed / timed-out / startup-failure / error to `/bkit-debug`, and continues only when every check passed.
  - `instructions.test.ts` row: added the `local-pre-commit` and `local-tests-first` corpus checks (text covers runs made while working, same bullet in store and `rules.md`, old text retired, carrier list, `bkit-debug-failure-reproduce` step 6 names each test file).
  - `## Tests lock`: added one bullet saying agents' own runs name each test file and a `/bkit-*` step's named command is the only wider run, so only those commands queue for the lock.
- `docs/security.md`: already carries the accepted-risk paragraph for audit reports under `[skip ci]` (written during the build); it matches `docs/decisions.jsonl` key `920-audit-reports-may-skip-ci-on-dev`. No edit needed.
- Memory: `MEMORY.md` holds pointers only; no duplicate or stale content found.
- History: the repo is not shallow (`git rev-parse --is-shallow-repository` printed `false`), so no history is unread.

## Unresolved Coverage

- `docs/testing.md` has no row for `.bkit/core/engine/ledgers/telemetry.test.ts`, which gained a test this cycle (any agent may write `knowledge` rows). The file already lacked a row before this ship; adding one would widen scope beyond the shipped change.
- The knowledge-ledger writer rule change (any agent on a discovered gotcha) is recorded in `.bkit/jsonl.md` and `docs/decisions.jsonl`. No `docs/*.md` topic page states writer permissions, so there was nothing to sync.
- Topics: architecture, technology, data-schema, deployments, observability, design, noise and setup are not touched by the shipped files (no boundary, library, schema, CI, logging, UI or local-setup change). `docs/security.md` and `docs/testing.md` are present, indexed in `.agents/docs.md` and hold project content.
- `.bkit/*.md` files changed this cycle (`.bkit/instructions.md`, `.bkit/jsonl.md`) are outside this agent's `docs/` scope; the build updated them directly.

## Pending Items

- `920-build-agents-run-challenge-low-docs-security-md-25` (LOW, `docs/security.md:25`): the accepted-risk text says `dev` or `main`, but the decision accepted `dev` only; the pre-push hook (`.bkit/templates/.husky/pre-push:115`, `:188`) applies the same allowance to `main`. The owner decides whether `main` is accepted too, or the hook blocks a `[skip ci]` head to `main` and `docs/security.md` says `dev` only.
- `920-build-agents-run-challenge-low-bkit-core-agents-rules-md-123` (LOW, `.bkit/core/.agents/rules.md:123`): on a stack whose runner runs by package or folder (for example `go test ./internal/foo/`), `Local pre-commit` allows no valid run. The owner decides between routing per-file runs through `bkit:test:file` or allowing the narrowest unit the runner supports.
- `920-build-agents-run-challenge-low-bkit-core-agents-rules-md-121` (LOW, `.bkit/core/.agents/rules.md:121`): `Local tests first` says the full suite runs only in the pre-push hook with no exception, so it contradicts the named full-suite runs of steps that carry it and the no-hook arm of `Local pre-push`. The fix is a wording change in the store entry, `rules.md` and every carrier, with the old text under `retired`.
- `920-build-agents-run-challenge-low-vitest-setup-ts-171` (LOW, `vitest.setup.ts:171`): a hook given its own longer timeout, such as `beforeAll(fn, 120_000)`, has synchronous child calls without a timeout killed at the file's `hookTimeout`. The owner decides between reading the hook's timeout through a Vitest internal, documenting that slow children in hooks pass their own `timeout`, or leaving file-level and `*All` hook calls unlimited.

## Blockers

None
