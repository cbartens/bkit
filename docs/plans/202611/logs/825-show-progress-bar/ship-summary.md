Verdict: PASS
Failures: 0
<!-- verdict:end -->

# Ship Summary

## Verdict

PASS

- The PR is merged. The completed checks passed, with no new deferral.

## Steps

<!-- prettier-ignore -->
| Step | Verdict | Failures | Attempts | Artifact |
| --- | --- | --- | --- | --- |
| ship-start-workflow | - | - | 1 | - |
| ship-worktree-setup | - | - | 1 | `docs/plans/202611/logs/825-show-progress-bar/ship-input-1.md` |
| ship-regression-guard | PASS | - | 1 | - |
| ship-conflict-resolve | PASS | - | 1 | `docs/plans/202611/logs/825-show-progress-bar/ship-conflict-resolve.md` |
| ship-deferred-sweep | PASS | 0 | 1 | `docs/plans/202611/logs/825-show-progress-bar/ship-deferred-sweep.md` |
| ship-update-docs | - | - | 1 | `docs/plans/202611/logs/825-show-progress-bar/ship-update-docs.md` |
| ship-prune-skills | - | - | 1 | - |
| ship-bookkeeping-push | - | - | 1 | - |
| ship-merge-pr | PASS | 0 | 1 | - |
| ship-switch-to-dev | - | - | 1 | Local synchronization skipped; see below. |

## Pull Request

[PR #839](https://github.com/cbartens/bkit/pull/839) merged into `dev` at `eb636c2f3e41f5d798eb673cb6cd9d41f9c8494f`: +22,743 / -729 lines across 194 files.

## Verification

- The final real pre-push hook passed: 7,119 unit tests, two existing unit skips, 1,756 integration tests and 37 shell tests.
- The capability graph was regenerated in `docs/capabilities.md` and its README embedding.
- [CI run 41596164537](https://github.com/cbartens/bkit/actions/runs/41596164537) passed at the final feature head, `7e6ee4faba0230cec7e24cd466704ade3e9f701f`.

## Pending Items

- A live application status bar remains outside this feature's declared scope.
- Duration-weighted progress remains outside this feature's declared scope.

## Risks and Action Items

- Local `dev` synchronization was skipped because its eight local commits are represented in the remote squash merge. The local checkout and its uncommitted changes were preserved.

## Recommended Next Step

```text
No further bkit command is needed once post-merge CI passes and the ship workflow closes.
```
