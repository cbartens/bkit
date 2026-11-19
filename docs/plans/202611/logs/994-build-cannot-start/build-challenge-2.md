Verdict: CONCERNS
Failures: 1
Fingerprint: 0125c4adbec2a819435c81eb0f075ed3f05b2aca9908223c60c54da79e972368
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- Diff: `tmp/bkit-diff-994-build-cannot-start.md`, read in full. Its first line carries no `partial diff coverage` header, so every file was shown whole. The attack surface is `.bkit/core/engine/commands/workflow/branches.ts` (`isOwnPlanFile`, `classifyConflict`, `takeDevSide`, `keptBranchCopy`, the `planlog` arm of `resolveRebase`, `readRebaseState`, `rebasedFid`) and `.bkit/core/engine/commands/workflow/worktrees.ts` (`droppedLogsDir`, `keepAside`, `carryLeftovers`), with their `dist/` builds. The tests, docs, ledger rows and generated graph counts were read for secrets and consumer names.
- Plan: `docs/plans/202611/994-build-cannot-start-plan.md`, TASKS 1-6.
- Docs: `.agents/docs.md` (Build column), `docs/security.md` in full, `docs/observability.md:9` and `:100`, `docs/decisions.jsonl` and `docs/knowledge.jsonl` (searched for home-path and outbox rules), `docs/deferrals.jsonl` (the three `994-build-cannot-start-challenge-low-*` rows this diff adds).
- Code read beyond the diff: `outboxRoot` and `outboxRel` in `.bkit/core/engine/commands/lib.ts:1184-1195`; `fidOf` and `ownershipMarker` in `worktrees.ts:85-100`; `appendLog` and `rebaseVerb` in `branches.ts:850-917`; the setup resume rebase in `worktrees.ts:1465-1520`; `lowDeferralKey` and `lowDeferrals` in `challenge.ts:462-480`; the four workflow calls of `branches rebase --log-file="{LOG_DIR}/rebase-resolve-log.md"` (`.bkit/core/workflows/bkit-build.md:515`, `bkit-plan.md:235`, `bkit-design.md:221`, `bkit-debug.md:344`).

## Notes

- Checked with no finding:
  - Authentication and authorisation: the engine runs as the local user with no login, session or permission model; the diff adds none.
  - Data-access control and tenancy: no database (`docs/security.md` § RLS). The feature-folder boundary in `isOwnPlanFile` escapes the id, anchors the whole path and refuses other features, prefix-sharing ids and `{FID}-design.md` (all tested).
  - Resolution direction: every `planlog` resolution keeps the rebase target's copy (`dev`, the trusted side). A pushed branch cannot carry its own content onto `dev` this way; its copy only lands in the local outbox.
  - Path traversal in the keep-aside: `keepAside` joins a path git took from its index (git rejects `.`, `..` and `.git` components), and the feature id comes from a ref name (git rejects `..`, `//` and a component starting with `.`), so no write leaves `<git common dir>/bkit-outbox`. The kept copy is written from the git blob, not from the worktree, so no symlink is followed.
  - Resource limits: `keptBranchCopy` reads with `maxBuffer: OUTPUT_LIMIT` (64 MiB). A larger or unreadable blob (a gitlink, for example) leaves `kept` null and the rebase refuses.
  - Command and regex injection: every git call passes an argument array with no shell; the `:2:` / `:3:` prefixes keep a path from being read as an option; `isOwnPlanFile` has no nested quantifiers, and its `.+` matches no line terminator, so a file name holding a newline cannot reach a `RESOLVED` line.
  - `carryLeftovers` now copies a leftover with `fs.readFileSync` instead of `fs.cpSync`, so an untracked symlink at a plan-log path is kept as its target's content rather than as a link. Only a local actor can plant such a link, and nothing publishes the outbox, so no trust boundary is crossed.
  - Secrets and consumer names in the diff's text: none. The `docs/failures.jsonl`, `docs/deferrals.jsonl` and `.bkit/friction.jsonl` rows name only `cbartens/bkit`, issue numbers and repo paths.
  - Supply chain: no dependency added. `branches.ts` now imports `worktrees.ts`, which does not import `branches.ts` back.
- Not raised again: both LOW findings of round 1 are still in the code, and this diff already records each as an OPEN deferral. A new task block would only write a second row under a new line key.
  - `takeDevSide` (`branches.ts:550`) still passes the conflicted path to `git checkout`, `git add` and `git rm` as a pathspec, not a literal name: key `994-build-cannot-start-challenge-low-bkit-core-engine-commands-workflow-branches-ts-553`.
  - `rebasedFid` (`branches.ts:935`) still takes any `feat/` suffix, `/` included: key `994-build-cannot-start-challenge-low-bkit-core-engine-commands-workflow-branches-ts-907`. The keep-aside adds one effect: such a suffix nests the kept copy inside another feature's outbox folder (`bkit-outbox/995-y/x/dropped-logs/`), still inside the outbox. The deferral's done-when (a FID-slug check in `rebasedFid`) fixes both.
- Accepted by the owner, not raised: `dev`'s copy replaces a branch edit to the plan file or a log, an appended challenge task included. TASK 6 (`build-decision-1-1.md`, direction (a)) keeps the branch copy aside instead of refusing.
- Cross-references for TASK 1:
  - `docs/security.md:291` ("Keep consumer names and paths out of tracked records") and `:299` (published rows use relative paths; private receipts keep the absolute ones).
  - `docs/observability.md:9` ("NEVER log PII") and `:100` (keep personal identifiers out of diagnostics).
  - The repo already has the fix for this case: `outboxRel` (`.bkit/core/engine/commands/lib.ts:1190`), used by `context.ts:526`, `:1020` and `:2139`.
  - None of the 16 tracked `rebase-resolve-log.md` files holds a home path today, so this line would be the first. The cloud lane writes the same line with the runner's checkout path.
- Severity: TASK 1 is MEDIUM. It needs no attacker and no unusual name: any plan-log conflict whose branch copy differs, the case TASK 6 exists for, writes the line. Once the log is pushed, the user name stays in public git history (`docs/security.md:235`: pre-redaction copies remain in history). It is not CRITICAL because no secret or credential is exposed.
- Verification: reproduced with real git in a scratch repo outside the checkout (deleted afterwards), running the built `dist/cli.js branches rebase --json --log-file=docs/plans/202611/logs/994-x/rebase-resolve-log.md` on `feat/994-x` with a differing branch copy. It exited 0, and the log file, untracked and not ignored, held `kept at {scratch dir}/.git/bkit-outbox/994-x/dropped-logs/{time}/docs/plans/202611/logs/994-x/plan-v2-reviewed.md`. No test gate was run and no code was written to the repo.
- Parallel run: the earlier round's copy of this report was read once before the stub replaced it; no other agent's output was read.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A plan-log conflict whose branch copy differs makes `bkit branches rebase` write the absolute outbox path (`/Users/{name}/.../.git/bkit-outbox/{FID}/dropped-logs/...`) into `{LOG_DIR}/rebase-resolve-log.md`, a tracked plan log the build commits and ship lands on public `dev`, so the operator's OS user name and checkout layout enter permanent git history
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/branches.ts:637` · **Round:** 1
  - **DONE WHEN:** the `RESOLVED {path}` line names the kept copy through `outboxRel` (`.bkit/core/engine/commands/lib.ts:1190`, "relative to the main checkout, never a home path"), as `.git/bkit-outbox/{FID}/dropped-logs/{time}/{path}`, so no line `branches rebase` appends to `--log-file` holds an absolute path; the test `keeps a differing branch copy larger than 1 MiB aside and names it` resolves the named path against the repo before its `statSync`; `docs/security.md` § PII ("Keep consumer names and paths out of tracked records") holds for the rebase log
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/branches.test.ts` `names the kept branch copy in the rebase log by an outbox-relative path, never an absolute one` fails on the `--log-file=docs/plans/202611/logs/994-x/rebase-resolve-log.md` line reading `kept at {dir}/.git/bkit-outbox/994-x/dropped-logs/...` (`path.isAbsolute` true) for `feat/994-x` with a differing branch copy of `plan-v2-reviewed.md` (verified in a scratch repo with `dist/cli.js branches rebase`: exit 0, the log file untracked and not ignored)
<!-- bkit:task 1 end -->
