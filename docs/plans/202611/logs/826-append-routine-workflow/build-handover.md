# Debug Abort Handover

## The Short Version

The resumed build stopped before implementation restarted. Updating the feature branch conflicted with generated files, and the prescribed recovery command refused `.bkit/version` and safely aborted the rebase.

## What's Actually Happening

Resuming worktree setup rebased onto newer `origin/dev`. Applying the saved partial-build commit conflicted in `.bkit/version`, `README.md` and `docs/capabilities.md`. Recovery rejected `.bkit/version` outside its allowed automatic-resolution classes. This is a recovery-policy boundary; no source defect or upstream cause was established. The workflow requires its Failure Path after recovery fails.

## Rot Signals

None. No diagnosis attempts supplied rot signals.

## Out-of-Scope Recommendations

None. No diagnosis attempts supplied recommendations.

## Attempt History

<!-- prettier-ignore -->
| Strategy | Attempt | Outcome |
| --- | --- | --- |
| STANDARD | Resume worktree setup, then prescribed `branches rebase` recovery | Exit 3; refused `.bkit/version`; rebase aborted. |

## Verified Resolutions (do not roll back)

The prior partial implementation and Jira authentication documentation remain local. Earlier focused unit tests passed 237 cases; this resume ran no tests and makes no new verification claim. The workflow lock was released, failure comment posted and session removed.

## Persistent Errors

Exact recovery error: `REFUSE .bkit/version — not an append-only ledger, a recognised lockfile or a generated register; routing to Failure Path`.

The earlier four missing planned tests, Jira `invalid_token`, commit-guard refusal and broad-suite timeouts remain recorded in the prior reports. This attempt did not investigate or resolve them.

## Recommended Next Steps

1. Resolve the generated-file rebase boundary through a reviewed recovery change or separately authorized manual resolution. ✅ FIXES branch synchronization. ❌ does not FIX feature gaps. ⚠️ COST: inspect conflicts and regenerate consistent outputs.
2. Resume the build after synchronization succeeds. ✅ FIXES access to remaining implementation steps. ❌ does not FIX Jira credentials automatically. ⚠️ COST: remaining tests and implementation.
3. Verify Jira's scoped token locally using `.bkit/trackers.md` § Authentication troubleshooting. ✅ FIXES provider access when credential configuration is corrected. ❌ does not FIX rebase recovery. ⚠️ COST: provider verification.

## Recommended Path

Take option 1 first. Repeating the unchanged resume will encounter the same recovery boundary. Preserve the feature commits and regenerate dependent outputs rather than discarding either side blindly.

## Reference Docs

- `rebase-resolve-log.md` and `status.jsonl` in this directory.
- `build-plan-tasks-1-log.md`, `build-plan-tests-1-log.md` and `build-provider-contracts.md` for prior evidence.
- `../../826-append-routine-workflow-plan.md` for remaining scope.
- `tmp/bkit-diff-826-append-routine-workflow.md`: partial diff coverage; no full-diff audit claimed.
