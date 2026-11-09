# Docs Update

## Files Modified

- `docs/deployments.md`

## Drift Resolved

- `docs/deployments.md` (sync, compress, cross-reference passes):
  - § Ship gate + bookkeeping intro: added the feature reconciliation step (`branches sync --reconcile-feature`), the inherited-`dev` refusal and the new-PR rule for a merged PR with newer work.
  - Gate paragraph: now names `--fresh-base` (stale `dev` exits 19, missing evidence exits 20), `prs merge --ship-retry` routing (moved head to validation, new conflict to integration, other refusals terminal), the shared `ship.merge.maxAttempts` allowance and the residual base race. It links to `docs/observability.md` § `[bkit-runs]` prefix — ship merge gate.
  - "No duplicate dispatch" paragraph: codes 10 / 11 / 14 re-enter probe-and-poll only. Codes 17, 19 and 21 now return to Step 3 or Step 4.
  - Carry-forward bullet: code 17 now returns to Step 3 reconciliation.
- Already in sync, no change: `docs/testing.md` and `docs/observability.md` (updated in Task 8), `.bkit/workflows.md`, `.bkit/prompts.md`, `.bkit/cli.md`, `docs/capabilities.md`. The `docs/deployments.md` § Autonomous phase-close prerequisites text on `--delete-branch` covers the design/plan close, not ship, so it is still accurate.
- Agent memory: `MEMORY.md` holds only pointers and nothing about #842, so no change.

## Pending Items

From `ship-pending-items.md`. One row is duplicated in the file.

- `842-sync-with-origin-dev` (needs-decision, OPEN, listed twice). The deferred sweep notes it is moot now: `origin/dev` is an ancestor of HEAD after the Step 4 merge. Human review can close it.
- `842-cloud-concurrency-queue-non-goal` (scope-declared, OPEN). The cloud Actions concurrency group is out of scope per the plan.
- `842-docs-only-dev-movement-ci-optimization` (scope-declared, OPEN). Skipping full CI for docs-only `dev` movement is out of scope per the plan.

## Blockers

None

Note: the repository is not shallow (`git rev-parse --is-shallow-repository` printed `false`), so the history is complete.
