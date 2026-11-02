# Docs Update

## Files Modified

None.

## Drift Resolved

None. The build (Task 9) already synced the docs this cycle, and I found no remaining drift in a four-pass check:

- `docs/testing.md`: the Debug bullet and the new § Debug CI evidence verification describe the shipped behaviour. They cover CI evidence as the first round, `[repro]`, `[local]`, generation-scoped fixes, `[live=off]` and pushed-head proof. The commands they cite exist (`bkit:test:file` and `bkit:gate:static-unit-integration` in `package.json`).
- `docs/deployments.md` § Post-merge dev CI auto-routing: no statement conflicts with evidence-first debug.
- `docs/decisions.jsonl` has the `830-red-ci-run-is-the-first-test-round` row. `docs/knowledge.jsonl` has the status-identity lesson. I did not touch either ledger.
- `.bkit/workflows.md`, `.bkit/templates.md`, `.bkit/cli.md` and `.agents/context.md` carry the 830 changes, so they are not stale. They are outside the `docs/` scope of this agent and were left as they are.
- `.agents/docs.md` index: no doc was added or removed, so no row changes.
- Agent memory (`MEMORY.md` plus `memory/*.md`): all entries are pointers and none mention #830. No duplicate or stale content found.

History check: the repo is not shallow (`git rev-parse --is-shallow-repository` printed `false`), so no history is unread.

## Pending Items

None. `ship-pending-items.md` for `830-debug-diagnose-named` contains `None.` The deferred-sweep report lists only scope-declared exempt items (see `ship-deferred-sweep.md`).

## Blockers

None.
