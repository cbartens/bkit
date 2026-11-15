Verdict: CONCERNS
Failures: 2
Fingerprint: f340fc4197304ce694db56976c36090cc5c3d2c9448493ff24cbb5724730287e
<!-- verdict:end -->

## Scope

Inputs: `docs/plans/202611/951-build-repeat-whole-plan.md` and `tmp/bkit-diff-951-build-repeat-whole.md` (full diff; its first line is a `diff --git` header, so no partial-coverage handling applied). Docs loaded: `.agents/docs.md`, `docs/security.md`.

The diff also carries commits merged in from local `dev` that are not part of #951 (`fa0400fe6` 923 pre-push PR conflict check, `d8cee96cf` discovered gotchas, `a2c12d244`, `50146e288`); they were challenged as part of the supplied diff.

Surfaces challenged: `.bkit/core/engine/commands/ci/push-gate.ts` (receipt helper, tolerated dirt, new-branch receipt reuse), `.bkit/core/engine/commands/workflow/tests.ts` (`--changed-since`, receipt from `tests run`), `.bkit/core/engine/commands/workflow/tests-changed.ts`, `.bkit/core/engine/commands/workflow/status.ts` (`cleanBase`), `.bkit/core/engine/commands/workflow/counters.ts`, `.bkit/core/engine/install/modules/core.ts` (`lowerVerifyMaxAttempts`), `.bkit/core/engine/ledgers/telemetry.ts` (knowledge writers), `.bkit/templates/.husky/pre-push` and `.husky/pre-push` (open-PR lookup and PR conflict check), `.bkit/core/engine/checks/tips/catalogue.ts`, the workflow and prompt edits, `package.json`.

## Notes

- Checked, no finding: `--changed-since` and `--base` values pass `git rev-parse -q --verify {v}^{commit}` before reaching `git diff`; option-shaped values (`--output=foo`, `--git-dir=x`, `-h`, `--all`) all exit 1 in a scratch repo, so no git option injection reaches `changedFiles`.
- Checked, no finding: changed file names reach the gate as argv entries through `spawnSync` (same path as the existing `bkit tests changed`), and the `test-run` row records only the file count, not the list.
- Checked, no finding: new-branch reuse in `hasVerifiedIncrement` still requires a valid receipt bound to sha, tree, gate and fingerprint, a fingerprint match between the pushed and local `package.json`, an empty min-push-outside diff from the receipted ancestor and `noLaterFailure`.
- Checked, no finding: the pre-push hook validates the push-target owner and name against `[A-Za-z0-9._-]` before splicing them into the jq program, and every remote-derived value (`PR_BASE`, `OPEN_PR`) is quoted.
- Accepted by the owner, not logged: a Step 12 receipt tolerates uncommitted changes in `minPushPathspecs`, so the gate may run against bookkeeping files that differ from HEAD (plan Open Question 3, answer A). Task 1 is separate: it is a path outside `minPushPathspecs` that the count comparison lets through.
- Owner decision, not logged: any agent may append `knowledge` rows (`docs/decisions.jsonl` `any-agent-writes-knowledge`). It widens who can persist text that later Plan, Build and Debug agents read as guidance; the writer check is a policy guard, not an enforcement boundary, since agents with a shell can append directly.
- Observation, not logged: `cleanBase` in `.bkit/core/engine/commands/workflow/status.ts:209` does not check that `parentSha` is a sha, so a hand-written `parentSha` of `HEAD` narrows a holistic check to uncommitted files. The value comes from the engine-written `status.jsonl`, and Step 12 still runs the full suite, so the effect stays inside the build loop.
- No new dependency, no secret in the added lines (pattern scan for common key prefixes and private-key headers found none), no `execSync` added.
- Cross-reference: `docs/security.md` § Shell Injection is met by the new subprocess calls; `docs/security.md` holds no rule on push-gate receipts, so Task 1 and Task 2 are judged against the receipt contract the plan states (receipt proves the committed HEAD; a later failure blocks older proof).
- Tests were not run; Task 1's exploit was reproduced with plain git in a scratch repository only.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A staged rename between a code path and a bookkeeping path passes the tolerated-dirt check, so `tests run` writes a push receipt for a HEAD whose code the gate never tested, and the branch's next push skips the full gate
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/ci/push-gate.ts:46` · **Round:** 1
  - **DONE WHEN:** `cleanHead` compares status output with rename detection off (`git status --porcelain --no-renames ...` for both the unfiltered and the pathspec-filtered call), so a staged rename shows as a `D` line and an `A` line and any side outside `minPushPathspecs` blocks the receipt; `runPushGate`'s fully clean rule is unchanged. Exploit verified with git 2.56.0: after `git mv src/code.ts docs/plans/code.ts` the unfiltered status prints one line (`R  src/code.ts -> docs/plans/code.ts`) and the `:(glob)docs/plans/**` filtered status prints one line (`A  docs/plans/code.ts`), so the counts match; the reverse move (`git mv docs/plans/x.md src/new.ts`) matches the same way and adds untested code to the tree the gate runs on.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a staged rename out of a code path blocks the receipt` fails on a receipt being written for HEAD after `git mv` of a committed code file into `docs/plans/` and a passing required push gate
    - `.bkit/core/engine/commands/workflow/tests.test.ts` `a staged rename into a code path blocks the receipt` fails on a receipt being written for HEAD after `git mv` of a committed `docs/plans/` file to a code path and a passing required push gate
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** A `tests run` that ends in a tests-lock wait writes back the receipt and `.failed` state it read at its start, so a failure another run recorded for the same commit meanwhile is erased and an older passing receipt is restored over it
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/ci/push-gate.ts:108` · **Round:** 1
  - **DONE WHEN:** On a lock wait, `runWithReceipt` puts back the prior receipt and `.failed` marker only while the files still hold what this attempt itself left there (no other run has written a receipt or `.failed` marker for the commit since this attempt's start marker); a failure or receipt another run wrote during the wait stays as that run left it, and the existing lock-wait test in `push-gate.test.ts` (`records a failure marker when a full gate exits 81, and a lock wait leaves the earlier receipt as it was`) still passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/push-gate.test.ts` `a lock wait keeps a failure another run recorded during the wait` fails on the `.failed` marker being deleted and the earlier receipt rewritten, when `runWithReceipt` is called with a valid receipt for HEAD already present and a run callback that writes `{receipt}.failed`, removes the receipt (as a concurrent failing run does) and returns 81 with `waited` true
<!-- bkit:task 2 end -->
