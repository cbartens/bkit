# Docs Update

## Files Modified

None

## Drift Resolved

None. The history is complete: `git rev-parse --is-shallow-repository` printed `false`. Four passes ran on every doc this cycle touched: `docs/architecture.md`, `docs/observability.md`, `docs/security.md`, `docs/testing.md`, `docs/capabilities.md`, plus the authoring sources `.bkit/core/.bkit/trackers.md`, `workflows.md` and `cli.md`. No file needed an edit.

- Sync content: the new sections match the shipped code. Checked: the Git-common `bkit-outbox` location and private `0o600` file mode (`tracker.ts:1409-1469`, `:1580`), the `[bkit-tracker]` diagnostics and friction (`tracker.ts:1625-1721`), the per-provider budgets (GitHub 65,536, Linear 100,000, Jira 32,767) against the plan evidence, and the new flags `--purpose` and `--session-dir` in `.bkit/core/.bkit/cli.md`.
- Mirrors: `.bkit/trackers.md`, `.bkit/workflows.md` and `.bkit/cli.md` match their `.bkit/core/.bkit/` sources apart from the managed-marker line.
- `docs/capabilities.md`: `pnpm bkit:graph:check` reports "matches a rebuild at 783234615".
- `docs/testing.md` and `.bkit/templates.md`: the debug fix to `scripts/ci/bkit-test-awake.test.mjs` (a test-only change) alters no documented contract.
- Structure, wording and cross-references: no duplicate content, no misplaced sections and no broken inline `docs/*.md` links. `docs/security.md` links to `observability.md` § Tracker reporting diagnostics, and that section exists.
- Agent memory: `MEMORY.md` holds pointers only and has no entry about this FID. No change.

## Pending Items

None. `ship-pending-items.md` reports `None.`

## Blockers

None
