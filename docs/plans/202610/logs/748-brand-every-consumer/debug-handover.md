# Debug Abort Handover

## The Short Version

The fix for the red CI run on #748 is written and passes locally, but it cannot be pushed yet. Before pushing, the run tried to bring the branch up to date with `origin/dev`. That hit a merge conflict in `docs/capabilities.md`, a generated file the automation is not allowed to resolve, so it stopped and put the branch back as it was.

## What's Actually Happening

- Symptom: CI run 41537770077 (`bkit-ci`, head 16a630e29) failed 19 tests in `bkit-tests-integration` with `AssertionError: fatal: invalid object name 'v6.0.0'.`. `bkit-tests-check` failed as a result.
- Trigger: four test helpers in `upgrade.integration.test.ts` and `core.integration.test.ts` ran `git show v6.0.0:.bkit/templates/...`. The CI checkout (`.github/workflows/bkit-ci.yml:672`) fetches one commit and no tags.
- Root cause (design fragility): the test data lived in git history instead of the repo tree, so the tests passed or failed depending on how the repo was cloned. Local runs always hid it because the tag exists there.
- Fix applied (debug-failure-remediate, PASS): 13 byte-exact v6.0.0 fixtures, helpers repointed, `__fixtures__` added to `.bkit/core/engine/.npmignore`, hash test `v6-fixtures.test.ts` added. Local gate attempt 2 passed.
- Abort cause: at 2026-11-03T00:48:13Z, `rebase onto origin/dev` stopped at commit 14 of 85 (4072ed57d, "brand the lint, slop, graph scripts and launchd templates") with `CONFLICT (content): Merge conflict in docs/capabilities.md`. The rebase helper logged `REFUSE docs/capabilities.md — not an append-only ledger or a recognised lockfile` and ran `git rebase --abort`. The branch is intact (`git status`: ahead 2 of its remote, 83 commits ahead of `origin/dev`, which has moved on from merge-base 9fe3aaf59).
- Contributing: `context-ci-github-1.md` wrongly said CI was green because `.agents/context.md:171` picked the newest run on the branch (the Trivy run, 41537770079) rather than the `bkit-ci` run.

## Rot Signals

tests, observability, reliability, debt

- tests: `upgrade.integration.test.ts:1087,1162` and `core.integration.test.ts:1786,1957` read their data from the `v6.0.0` tag, which a default CI checkout does not contain.
- observability: `.agents/context.md:171` takes the newest run on the branch from any workflow, so it reported success while `bkit-ci` on the same commit had failed.
- reliability: `instructions.test.ts:55` sets its load-scaled timeout once at import (63463ms); the case ran 112356ms under the loaded gate.
- debt: the same tag-reading helper was copied four times across the two integration test files.

## Out-of-Scope Recommendations

- `.bkit/core/engine/tools/instructions.test.ts:55` and `vitest.timeout-budget.ts`: the corpus case's budget is computed once at import and under-scales under a loaded gate. Belongs to #814, not #748.
- `.agents/context.md:171` (and its shipped source block if `bkit install` renders it): add `--workflow bkit-ci.yml`, or pick the newest non-success run for the head SHA. A sibling workflow's success hides a red CI run from `/bkit-debug`.
- `.github/workflows/bkit-ci.yml:672`: the `bkit-tests-integration` checkout fetches no history. Nothing needs it once the fixtures land; revisit only if a future integration test needs git history. Needs owner sign-off.

## Attempt History

<!-- prettier-ignore -->
| Strategy | What was tried | Outcome |
| --- | --- | --- |
| STANDARD (attempt 1) | Diagnose: CI failure is the missing tag. Remediate: byte-exact fixtures, helper repoint, `.npmignore`, hash test. | Fix verified locally: both integration files 198 pass, tsc and prettier clean, gate attempt 2 PASS. |
| Push step | Rebase onto `origin/dev` before pushing. | Aborted: conflict in `docs/capabilities.md` at commit 14 of 85. The helper refuses non-ledger files and restored the branch. |

## Verified Resolutions (do not roll back)

- 13 fixtures in `.bkit/core/engine/install/modules/__fixtures__/v6.0.0/`, written with `git show` so the bytes are exact.
- The four helpers (`shippedOldCiScript`, `shippedAtV6` x2, `shippedOld`) read the fixtures, with no git or tag.
- `__fixtures__` in `.bkit/core/engine/.npmignore` (`pnpm pack` lists 0 fixtures).
- `.bkit/core/engine/install/modules/v6-fixtures.test.ts` (8 pass).
- Local `instructions.test.ts` timeout was a known #814 flake and is not caused by this branch.

## Persistent Errors

- Rebase onto `origin/dev`: `CONFLICT (content): Merge conflict in docs/capabilities.md` while applying 4072ed57d. Log: `docs/plans/202610/logs/748-brand-every-consumer/rebase-resolve-log.md`.
- Sequence: CI red (19 tests, `invalid object name 'v6.0.0'`) -> fixtures fix -> local gate green -> rebase -> conflict -> `[bkit-rebase] ABORTED` -> `workflow-failed` at 00:48:41Z.
- The remote PR is still red. The fix has not been pushed, as far as the status log shows. Check `git log origin/feat/748-brand-every-consumer..HEAD`.

## Recommended Next Steps

1. Resolve the `docs/capabilities.md` conflict by hand and finish the rebase. Regenerate the file with the repo's generator (the capabilities graph refresh) instead of merging text, since the branch already has a "refresh capabilities graph" commit (0bc4c33d9). ✅ FIXES the blocked push. ❌ does not remove future conflicts on this file. ⚠️ COST: later commits among the 85 may conflict again; the capabilities.md hunk can recur at each branch commit that touches it.
2. Merge `origin/dev` into the branch instead of rebasing, resolve once, and regenerate `docs/capabilities.md`. ✅ FIXES with a single conflict round. ❌ adds a merge commit and may not match the repo's rebase-only convention. ⚠️ COST: needs the owner's OK on the history shape.
3. Push the fix without rebasing (if the PR is not blocked on being up to date) and let CI judge it. ✅ FIXES the red CI fast. ❌ leaves the branch behind dev. ⚠️ COST: needs the owner's approval for a push; the later merge conflict is still there.

## Recommended Path

Option 1. The fix is done and verified, so only the branch update is blocking. A regenerated `docs/capabilities.md` is the correct resolution for a generated file. Then run `pnpm bkit:graph:check`, `pnpm bkit:gate:static`, push (with approval), and read the `bkit-ci` run for the new head SHA with `--workflow bkit-ci.yml`.

## Reference Docs

- Diagnosis: `docs/plans/202610/logs/748-brand-every-consumer/debug-failure-diagnose-1.md`
- Remediation log: `docs/plans/202610/logs/748-brand-every-consumer/debug-failure-remediate-1-log.md`
- Rebase log: `docs/plans/202610/logs/748-brand-every-consumer/rebase-resolve-log.md`
- Debug summary: `docs/plans/202610/logs/748-brand-every-consumer/debug-summary.md`
- CI: https://github.com/cbartens/bkit/actions/runs/41537770077 (failing), https://github.com/cbartens/bkit/actions/runs/41405235221 (same failure earlier), run 41537770079 (Trivy, not CI)
- Issues: #748, #814, #345; failure row `instructions-corpus-store-timeout-under-full-gate`
- Issue comments: #748 issuecomment-6591218080, issuecomment-6592385267
