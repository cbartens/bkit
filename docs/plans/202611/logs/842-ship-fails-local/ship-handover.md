# Debug Abort Handover

## The Short Version

The ship run for #842 stopped at the deferred sweep (step 3). The change makes the tool keep a feature branch on the remote after its work has landed, where it used to delete it. Two old tests that required deletion were rewritten to expect the opposite, and nobody with authority (the owner) signed off on that. No debug attempt ran, so no fix was tried; the owner has to decide.

## What's Actually Happening

- **Symptom:** `ship-deferred-sweep` returned `FAIL` with 2 failures (`status.jsonl`, 2026-11-09T22:04:31Z). `workflows fail` then posted the failure comment on #842.
- **Trigger:** `branches scan-diff --disabled-tests --base=origin/dev` found removed assertions in two tests that had no owner-approved retirement.
- **Proximate cause:** `close-squash.integration.test.ts:241` (remote ref empty after design/plan close) and `worktrees.test.ts:868` (`remoteDeleted: true`) were rewritten. The new tests (`:230`, `:852`) assert the remote ref is kept.
- **Root cause:** the plan reviews (`plan-review-1.md` item 2, `plan-review-2.md` R1) chose to keep the remote branch whenever conditional deletion is unavailable. That went into plan line 143 and decision `842-ship-preserves-unlanded-work` (`docs/decisions.jsonl:613`), authored by `bkit-plan-update`. The owner's issue text only asks that close call `notOnDev` before deleting (`ship-input-3.md:60`, `:116`), which still deletes a landed branch.
- **Contributing:** the plan's "Breaking Changes confirmed" box and all Gate 1 boxes are unticked, and `status.jsonl` has no owner-pause or decision-accept row. Consumers would see remote `feat/{FID}` branches pile up after every close.

Everything else passed: Tasks 1-10 are Delivered, 14 test files pass (1342 passed, 2 skipped, none newly skipped), `check` and the CLI-doc check are clean.

Note: `ship-summary.md` says PASS, but it was written earlier and is stale. `status.jsonl` is newer and shows the run failed.

## Rot Signals

None. No diagnose attempts ran, so there is nothing to aggregate.

## Out-of-Scope Recommendations

None. (The duplicate OPEN `842-sync-with-origin-dev` rows, `docs/deferrals.jsonl:222` and `:246`, can be closed: `origin/dev` is now an ancestor of HEAD. This does not block.)

## Attempt History

<!-- prettier-ignore -->
| Strategy | What was tried | Why it failed |
| --- | --- | --- |
| None | No `ship-failure-diagnose-*` or `ship-failure-remediate-*` files exist. The sweep is a gate, not a code failure. | Not applicable. It needs an owner decision, not a code fix. |

## Verified Resolutions (do not roll back)

- Tasks 1-10 of the plan, all Delivered with named passing tests (`ship-deferred-sweep.md` § Planned vs Delivered).
- The three tightened tests (`worktrees.test.ts:725`, `worktrees.integration.test.ts:1167`, `ship-invariants.test.ts:213`) are properly retired against owner sources. Keep them.
- The shared `notOnDev` helper (`worktrees.ts:711`) and the merge-gate ancestry guard (`runs.ts:2130-2142`, `:2236-2244`).
- Merge of `origin/dev` (`235da766b`) and the docs port (`c41659b04`).

## Persistent Errors

- Failed requirement: "retirement approval not proven" for two tests.
  - `.bkit/core/engine/audits/workflows/close-squash.integration.test.ts:241`, removed `expect(git(fx.repo, "ls-remote", "origin", "refs/heads/feat/${FID}")).toBe("")`.
  - `.bkit/core/engine/commands/workflow/worktrees.test.ts:868`, removed `remoteDeleted: true` and the remote-branch-gone check.
- Event sequence: scan-diff (21:59:52Z), ledgers triage (22:03:12Z), `step-done` with `verdict: FAIL, failures: 2` (22:04:31Z), `workflow-failed` (22:04:32Z).
- Uncommitted: `ship-deferred-sweep.md` and `status.jsonl` changes in the worktree.

## Recommended Next Steps

1. **Owner approves retention.** Add an issue comment or a decision row written with `--by=owner` that names "a landed remote branch is kept when conditional deletion is unavailable", then re-run the sweep citing it.
   - ✅ FIXES both blocks. Lowest effort.
   - ❌ Does not stop remote branches from accumulating in consumers.
   - ⚠️ COST: a permanent, visible behaviour change; the owner must accept it.
2. **Restore deletion of landed remote branches.** Delete the remote only when the fresh tip equals the proven tip; keep it only when the tip moved. Restore the two old assertions.
   - ✅ FIXES both blocks and matches the issue's own proposal. No pile-up.
   - ❌ Does not settle the plan's "conditional deletion unavailable" case.
   - ⚠️ COST: code, test and docs rework across close, ship and `worktrees remove`; a new build and ship cycle.
3. **Split the work.** Ship everything except the retention change, and move retention to a follow-up issue.
   - ✅ FIXES the blocker for the rest of #842 quickly.
   - ❌ Does not decide retention.
   - ⚠️ COST: surgery on a 123-file branch; the tests and docs are entangled.

## Recommended Path

Option 1 if the owner is happy for landed remote branches to stay (the plan reviews judged that safer). Otherwise Option 2. The sweep found nothing else wrong. Ask the owner first; do not guess.

## Reference Docs

- `docs/plans/202611/logs/842-ship-fails-local/ship-deferred-sweep.md` (§ Blocking Deferrals, § Handover Notes)
- `docs/plans/202611/logs/842-ship-fails-local/ship-input-3.md` (issue text, lines 60, 85, 103-116)
- `docs/plans/202611/logs/842-ship-fails-local/plan-review-1.md`, `plan-review-2.md`
- `docs/decisions.jsonl:613` (`842-ship-preserves-unlanded-work`)
- `docs/plans/202611/842-ship-fails-local-plan.md` (line 143)
- Failure comment: https://github.com/cbartens/bkit/issues/842#issuecomment-6752684307
- PR #896
