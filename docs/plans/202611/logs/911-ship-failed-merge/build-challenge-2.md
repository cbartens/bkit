Verdict: PASS
Failures: 0
Fingerprint: 6ca5b7d8bbb1a9372d6c32e23da03a12204b0affe4ab7b0a41e8f93a5cf1d478
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- Supplied diff `tmp/bkit-diff-911-ship-failed-merge.md`: partial diff coverage (origin/dev...HEAD, 536 files, 20 largest shown). The shown files are local-`dev` commits outside this feature, so the review covers the feature range `git diff e4927f84e..HEAD`.
- Challenged in full from git: `failVerb` in `.bkit/core/engine/commands/workflow/workflows.ts` and `dist/commands/workflow/workflows.js` (the `--next-step` check, the new exit code 6, the comment line, the `nextStep` output), the `bkit-ship.md` Failure Path (exit-6 retry), Step 2, Step 10, Merge Question Stop arm and Step 12 routes, `.husky/pre-push` and its template, `.bkit/version`, the `utility-pre-release-check` copy, and every added line in the feature range (secret-pattern scan).
- Read for context: `failState`, `EXIT_LOCK_NOT_HELD` (the other exit 6 in `workflows.ts`, used by `start --lock-held` only), `EXIT_SPLIT_BUCKET` (7) and `EXIT_REMOVE_FAILED` (5) in `locks.ts`, `docs/security.md` § Untrusted Content & Prompt Injection, § Workflow comment ownership, § Shell Injection and § CI Auto-Route Trust.

## Notes

- Verdict note: partial diff coverage.
- Round 1's security finding (a backtick in `--next-step` breaks out of its code span) is still open in the code at `.bkit/core/engine/commands/workflow/workflows.ts:411`, and it is recorded as a LOW deferral in `docs/deferrals.jsonl` (key `911-ship-failed-merge-challenge-low-bkit-core-engine-commands-workflow-workflows-ts-408`). Its done-when also covers other control and Unicode line-separator characters, so it is not reported again.
- Checked, no finding: `failVerb` refuses a bad `--next-step` with exit 6 before `failState` writes the row or releases the lock. Nothing called after the check (`failState`, `probePr`, `buildComment`, `postForVerb`, `writeFailedLabels`) throws exit 6, so the Failure Path retry cannot fire after a tracker post and cannot post a second comment.
- Checked, no finding: no engine code, CI workflow or router reads a `Next step:` line back from a tracker comment or a handover, so the line triggers no automated action. The only value ship holds is `/bkit-debug {FID}`, and `{FID}` already reaches the same shell fence as `--fid={FID}`.
- Checked, no finding: removing Steps 11-12 removes one agent spawn and one remediation route from ship; no guard that other steps rely on lived only in them. The `.husky/pre-push`, `.bkit/version` and `utility-pre-release-check` edits change only comments, examples and hashes.
- Checked, no finding: no added line in the feature range matches a token or private-key pattern; the two matching files match only in lines that were already there before this feature. No dependency was added or changed, so no supply-chain review is needed.

## Findings Log

None
