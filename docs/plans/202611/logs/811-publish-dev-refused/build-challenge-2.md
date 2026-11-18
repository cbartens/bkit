Verdict: PASS
Failures: 0
Fingerprint: 8ae4db3ca41b1360313d3006defb0175015cac8cd2d489ecced5d95325f4b12c
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- Diff: `tmp/bkit-diff-811-publish-dev-refused.md`, read in full (full coverage, not partial).
- Security surface: `closePr`, the `refused` handler in `landFailedRecord` and the `linkRef` change in `handoverVerb` in `.bkit/core/engine/commands/workflow/workflows.ts`. `dist/commands/workflow/workflows.js` was checked against that source and matches it.
- Code read with it: `pushToDev`, `landDir`, `checkLanding` and `REFUSED` in `.bkit/core/engine/commands/land.ts`; `probePr` and `mergePr` in `.bkit/core/engine/commands/workflow/prs.ts`; `runGit`, `runGh` and `runTool` in `.bkit/core/engine/commands/lib.ts`.
- Docs cross-referenced: `docs/security.md`; `docs/deployments.md` § Autonomous phase-close prerequisites; `.agents/docs.md`.

## Notes

These vectors were checked and produced no finding:

- **Branch protection.** The PR fallback merges with `gh pr merge --squash` and never passes `--admin` (`.bkit/core/engine/commands/workflow/prs.ts:699`). A `dev` rule that requires a review or checks therefore blocks the merge, and the PR stays open for a human. `mergePr` refuses any base other than `dev` (`prs.ts:681`). This is the same trust shape as the ship DONE close, and `docs/deployments.md:135-142` documents it as a prerequisite.
- **Merge integrity.** `closePr` pins `--match-head-commit` to the commit it built and pushed (`workflows.ts:1494`, `workflows.ts:1515`, `prs.ts:702`). If `gh pr list --head ship-failed/{FID}` returned a fork PR with the same branch name, GitHub would still refuse to merge anything but that commit. The lookup takes open PRs only (`workflows.ts:1510`), so an old merged PR is never reported as merged.
- **Gate bypass.** The `refused` handler runs inside `pushToDev`, after `checkLanding` has gated that same commit (`land.ts:246`, `land.ts:256`). The `ship-failed/{FID}` push therefore carries only a commit that passed the gate. Hooks are off there, exactly as they are for the `dev` push.
- **Injection.** `fid` passes the `SAFE_FID` guard in `landDir` (`land.ts:75-81`: no separators, no `..`) before any push. `workflow` can only be `ship` for `--flush` (`workflows.ts:866`). The branch, title and subject reach `spawnSync` as separate arguments with no shell, as `docs/security.md` § Shell Injection requires. No external text reaches the PR title, the PR body (empty) or the merge subject.
- **Secrets and data exposure.** The record published through the PR is the same commit the direct `dev` push publishes, with the same `[skip ci]` subject, so the scope of `docs/security.md:25` § Accepted risk is unchanged. The new log lines repeat the git push stderr that the old `stop` message already logged. No token and no new output field is printed or emitted.
- **CI triggers.** No workflow under `.github/workflows` or `.bkit/templates` uses `pull_request_target` or names `ship-close/` or `ship-failed/`. The `[skip ci]` head starts no `push` or `pull_request` run on the new branch or PR.
- **Supply chain.** No dependency was added or changed.
- **Tenancy and PII.** Not applicable: bkit has no database (`docs/security.md` § RLS, § PII). The new `.bkit/friction.jsonl` row names only this repo.

These points are uncertain and not counted:

- Two claims come from what I know of gh and git, not from a run here:
  - `gh pr list` returns the newest PR first.
  - git removes credentials from the remote URL in push stderr.
- Neither claim backs a finding. Merge integrity rests on `--match-head-commit`, which was read in the code, and the stderr was logged before this diff too.

These points are outside the security lens and are proposed separately, not counted:

- **Leftover branch.** If the branch push succeeds but `gh pr create` fails, or the PR stays open, `ship-failed/{FID}` stays on the remote. Every later flush of the same FID then fails its non-force branch push and exits 10. This is a correctness problem, not a security one.
- **Doc mismatch.** `docs/deployments.md:140` says the PR-path close does not pass `--delete-branch`. `closePr` does pass `deleteBranch: true` (`workflows.ts:1515`), and the new sentence at `docs/deployments.md:142` sends the FAILED flush to "the same two prerequisites". This is a doc accuracy problem, not a security one.
