# Docs Update

## Files Modified

- `docs/testing.md`
- `docs/deployments.md` (edited earlier in this ship; no further change this round)

## Drift Resolved

- `docs/testing.md` (sync pass): the `worktrees.integration.test.ts` row in the ship test-coverage table now says the remote ref is deleted with a lease-guarded push at its proved tip (kept and reported when origin refuses). The row still said only "expected-tip deletion", which no longer covered the remote delete restored in commit `8c24ba7a6`.
- `docs/deployments.md` (earlier edit, unchanged now): § Ship gate + bookkeeping covers feature reconciliation, the inherited-`dev` refusal, the new-PR rule, `--fresh-base` exits 19 / 20, `prs merge --ship-retry` routing and the shared `ship.merge.maxAttempts` allowance.
- Already in sync after commit `8c24ba7a6`, no change: `docs/observability.md` (`remote origin/{branch} not deleted — preserved`), `.bkit/workflows.md`, `.bkit/cli.md`, `.bkit/prompts.md`, `.bkit/instructions.md`, `docs/capabilities.md`. No doc still says the remote branch is retained for lack of conditional deletion (searched `docs/`, `.bkit/*.md`, `.bkit/core/`, `.agents/skills/bkit-ship`).
- `docs/deployments.md:144` (the "Automatically delete head branches" setting) describes the PR-path close and stays accurate, so it was left alone.
- Agent memory: `MEMORY.md` holds only pointers and nothing about #842, so no change.
- History check: the repository is not shallow (`git rev-parse --is-shallow-repository` printed `false`), so the history is complete.

## Pending Items

From `ship-pending-items.md`, deduplicated by key (latest row per key).

- `842-sync-with-origin-dev` (needs-decision, OPEN, listed twice). Moot: `origin/dev` is an ancestor of HEAD after the Step 4 merge. Human review can close it.
- `842-cloud-concurrency-queue-non-goal` (scope-declared, OPEN). The cloud Actions concurrency group is out of scope per the plan.
- `842-docs-only-dev-movement-ci-optimization` (scope-declared, OPEN). Skipping full CI for docs-only `dev` movement is out of scope per the plan.
- `842-remote-branch-retention-owner-approval`: the latest row is CLOSED (owner chose deletion), but an older OPEN row from the deferred sweep is also in the file. Nothing is left to review.

## Blockers

None
