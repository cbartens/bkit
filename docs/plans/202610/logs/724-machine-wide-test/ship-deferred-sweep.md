Verdict: FAIL
Failures: 107
Lazy: 0

<!-- verdict:end -->

# Deferred Sweep

## Planned vs Delivered

The plan is `docs/plans/202610/724-machine-wide-test-plan.md`. Its Acceptance Scenario sections (from line 67), task DONE WHEN criteria (lines 749–1032), and newer owner answers in `ship-input-1.md` define the intended outcomes. The newer owner answers govern worker arithmetic, cancellation, adoption, and push retry behavior. Review date: 2026-11-03. No design file was present.

| Intended deliverable and plan source | Status | Source evidence and assessment |
| --- | --- | --- |
| Task 1: general named machine lock, rename, preserved unnamed stack compatibility; DONE WHEN line 749 | Delivered | `.bkit/templates/scripts/ci/bkit-machine-lock.sh`, functions `bkit_lock_file`, holder reporting and unnamed compatibility branch; adopted `scripts/ci/bkit-machine-lock.sh`. Fresh `/bin/bash -n` and template/adopted `cmp` both exited 0. The legacy compatibility scenarios survive in `.bkit/core/engine/audits/templates/machine-lock.integration.test.ts`; Group 1 verification attempt 3 passed. The scanner separately treats the old test path deletion as blocking below. |
| Task 12: caller checkout controls unnamed lock resolution; line 768 | Delivered | Template lock resolution uses the caller's current directory when resolving git checkout; the Group 1 attempt 3 verification records the cwd regression and compatibility fixture passing. |
| Task 2: bounded slots, safe workers, ordering, holder reporting, history and non-TTY waits; line 787 | Delivered | Lock template `bkit_lock_slots`, `bkit_lock_workers`, main acquire flow and Perl flock/history implementation. Workers follow the newer owner formula max(1, floor(cores/slots) − 1), default slot count is one, and non-TTY raw acquisition is bounded. Holder enumeration includes numbered slots even without a primary slot; the earlier Group 2 concern was resolved in later holistic verification. |
| Task 3: active references, catalogs and host mirrors use renamed lock; line 812 | Delivered | `.bkit/templates.md` machine-lock catalog, `docs/testing.md` tests-lock guidance, source prompts and generated workflows reference the new script. Older name occurrences in historical records and compatibility fixtures explain retained references. Group 1 attempt 3 and Group 4 verification passed. |
| Task 4: shared wait parsing, exact tests-wait classification and help; line 835 | Delivered | `.bkit/core/engine/commands/lib.ts` `wholeNumber`, `testsLockHolder`, `classifyLockExit`; classifier requires the tests holder signature and exit 75, and separately classifies refusal. Group 3 verification attempt 2 passed. |
| Task 5: test verb propagates effective wait and maps gate waits without artifacts or test-run rows; line 860 | Delivered | `.bkit/core/engine/commands/workflow/tests.ts:1698` parses wait, line 1710 selects its source, lines 1830–1932 run the gate with environment, classify its result and suppress artifact/status recording for waits, returning 81. It runs the configured gate rather than directly executing the lock script. |
| Task 10: changed-tests verb follows the same wait/no-row contract and retry guidance; line 895 | Delivered | `.bkit/core/engine/commands/workflow/tests-changed.ts:128` parses wait; its gate environment and classification around lines 182–192 return the structured wait result. Build and debug source workflow retries cover the changed-tests path. Group 3 attempt 2 and Group 4 verification passed. |
| Task 6: four root gates opt in and pass worker limits; line 918 | Delivered | `package.json:59`, lines 60–61 and line 65 wrap the static, unit, Bats and integration gates with the adopted tests lock. The targeted single-file gate remains unwrapped as specified. Group 4 verification passed. |
| Task 7: workflows retry structured waits without treating them as test failures; line 936 | Delivered | `.bkit/workflows/bkit-build.md` and sibling source workflows contain bounded wait/retry branches; generated host workflow coverage was checked by Group 4 verification. Build status records a later successful actual run rather than a wait being counted as passing tests. |
| Task 11: push plumbing propagates effective wait, recognizes hook waits and retries the push; line 966 | Delivered | `.bkit/core/engine/commands/branches.ts:871` `runPush`, environment at line 875 and hook classification at line 885; callers check `notPushed` before replay. Final Group 6 verification records the corrected inventory of 14 push blocks after the dev merge. |
| Task 8: pure Vitest decision and worker helpers; line 986 | Delivered | `vitest.test-lock.ts:14` `testLockDecision` and line 30 `testWorkers` cover CI, existing-file filters including line suffixes, watch mode and live nested ownership; worker parsing requires positive safe integers. Group 5 verification passed. |
| Task 9: heavy raw Vitest setup acquires and releases the adopted lock; line 1006 | Delivered | `vitest.test-lock.ts:46` setup uses actual config filters, checks existing filenames and live owner status, waits for readiness, preserves owner/wait variables and releases through teardown. `vitest.config.ts:35` installs global setup and line 36 workers. Group 5 verification passed. |
| Task 13: cancellation keeps the lock until foreground work finishes; line 1023 | Delivered | The lock template's `bkit_lock_run` traps termination after acquisition, runs the foreground command, releases afterwards and returns the signal-derived status. This matches the latest owner answer; Group 6 verification passed. |
| Task 14: successful tests are closed once before a separate push retry fence; line 1032 | Delivered | `.bkit/workflows/bkit-build.md:1160` closes the test fence, retains result fields around line 1170, opens the push fence at line 1176 and retries it at line 1180. Group 6 verification passed. |

Evidence boundaries: supplied `tmp/bkit-diff-724-machine-wide-test.md` is explicitly partial: the full diff has 16,747 lines across 175 files and exceeds its collection guard. This sweep inspected the relevant source surfaces and representative scanner diffs, not every line of that full diff. Earlier verification/challenge reports and `status.jsonl` are historical execution evidence; they are not represented as fresh executions by this sweep. The recorded build test attempt 3 passed on 2026-11-03, and final Group 6 verification closed the earlier decision-ledger concerns. Fresh checks here were shell syntax, adopted-template byte parity, the required disabled-test scan and deferral triage. No complete test suite was rerun by this reviewer.

## Blocking Deferrals

All entries below are **Blocked** under Process 8. The exact required command was:

`/Users/christian/Documents/GitHub/bkit/node_modules/.bin/bkit branches scan-diff --disabled-tests --base=origin/dev`

It exited 1 and returned 107 disabled-test hits in 12 files. The first attempt could not write fetch state in the sandbox; an escalated retry fetched successfully and still exited 1 with the same findings. The FAIL verdict was set immediately. Each table row is one returned hit, including repeated identical source coordinates; counts therefore preserve scanner multiplicity.

These are scanner findings, not 107 independently established runtime regressions. The scanner also detects assertion deletion during a file rename and can associate a removed assertion with an adjacent test name. In particular, the legacy stack-lock test file was renamed and its compatibility scenarios are present in the machine-lock suite. Representative diffs also show deletion of the resolve-push-base test file, removal of accepted-divergence tests from ci-scripts, and removal of workflow-shape checks. The prescribed rule does not authorize waiving these returned entries based on relocation or attribution concerns.

| ID | Source evidence reported by scan | Test name or assertion reported by scan |
| --- | --- | --- |
| B001 | `.bkit/core/engine/audits/hooks/gateguard-parity.integration.test.ts:450` | ${host}: an edit payload with no file path is ignored |
| B002 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:58` | uses the last green run's head, not event.before, so a cancelled push stays in scope |
| B003 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:63` | falls back to event.before when there is no green run on the branch |
| B004 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:72` | falls back to event.before when the last green head is not an ancestor (force-push) |
| B005 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:73` | falls back to event.before when the last green head is not an ancestor (force-push) |
| B006 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:78` | returns an empty base when there is nothing at all (planner run-to-be-safe path) |
| B007 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:87` | picks the newest run by run number, whatever order the API lists them in |
| B008 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:97` | names a run list that could not be read in the source |
| B009 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:107` | names origin/<branch> as the fallback in local mode |
| B010 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:111` | reads owner/repo from https, ssh and scp-style remote URLs |
| B011 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:112` | reads owner/repo from https, ssh and scp-style remote URLs |
| B012 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:113` | reads owner/repo from https, ssh and scp-style remote URLs |
| B013 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:114` | reads owner/repo from https, ssh and scp-style remote URLs |
| B014 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:115` | reads owner/repo from https, ssh and scp-style remote URLs |
| B015 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:116` | reads owner/repo from https, ssh and scp-style remote URLs |
| B016 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:120` | reads --local, --branch and --head from argv |
| B017 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:125` | reads --local, --branch and --head from argv |
| B018 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:129` | returns an empty sha for a missing or malformed run list |
| B019 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:130` | returns an empty sha for a missing or malformed run list |
| B020 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:131` | returns an empty sha for a missing or malformed run list |
| B021 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:167` | falls back to event.before when git fails unexpectedly |
| B022 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:168` | falls back to event.before when git fails unexpectedly |
| B023 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:169` | falls back to event.before when git fails unexpectedly |
| B024 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:174` | falls back to event.before when gh prints unparseable output |
| B025 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:175` | falls back to event.before when gh prints unparseable output |
| B026 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:176` | falls back to event.before when gh prints unparseable output |
| B027 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:181` | reports last-green-run as the source when the green head is an ancestor |
| B028 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:186` | CI mode: falls back to event.before and says so when the run list is unreadable |
| B029 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:187` | CI mode: falls back to event.before and says so when the run list is unreadable |
| B030 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:206` | uses the last green run when it is an ancestor of --head, looked up on origin's repo |
| B031 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:207` | uses the last green run when it is an ancestor of --head, looked up on origin's repo |
| B032 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:208` | uses the last green run when it is an ancestor of --head, looked up on origin's repo |
| B033 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:213` | tests ancestry against --head, not HEAD |
| B034 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:214` | tests ancestry against --head, not HEAD |
| B035 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:219` | falls back to origin/dev with the reason on stderr when gh fails |
| B036 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:220` | falls back to origin/dev with the reason on stderr when gh fails |
| B037 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:221` | falls back to origin/dev with the reason on stderr when gh fails |
| B038 | `.bkit/core/engine/audits/repo/resolve-push-base.test.ts:222` | falls back to origin/dev with the reason on stderr when gh fails |
| B039 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | expect(keys).toContain("bkit-tests-static#Check Default Branch Lags Dev#github.event_name"); |
| B040 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | expect(keys).toContain("bkit-tests-static#Check Default Branch Lags Dev#github.ref"); |
| B041 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | expect(collectSites(dir)).toHaveLength(2); |
| B042 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | expect(keys).toContain("(workflow)#concurrency#github.event_name"); |
| B043 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | expect(keys).toContain("(workflow)#concurrency#github.ref"); |
| B044 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | expect(keys).toContain("j#Named After Id#github.ref_name"); |
| B045 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | expect(keys).toContain("j#step-2#github.base_ref"); |
| B046 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | expect(keys).toContain("j#actions/checkout@v4#github.head_ref"); |
| B047 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | expect(keys).toHaveLength(5); |
| B048 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | expect(r.missing).toHaveLength(1); |
| B049 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | expect(r.stale).toHaveLength(0); |
| B050 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | expect(r.stale).toHaveLength(1); |
| B051 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | expect(r.badDecision).toHaveLength(1); |
| B052 | `.bkit/core/engine/audits/templates/ci-scripts.test.ts:20` | expect(r).toEqual({ missing: [], stale: [], badDecision: [] }); |
| B053 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:83` | expect(r.status, \`git ${args.join(" ")}: ${r.stderr}\`).toBe(0); |
| B054 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:92` | a second run cannot take the lock while the first holds it, and is told who holds it |
| B055 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:93` | a second run cannot take the lock while the first holds it, and is told who holds it |
| B056 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:94` | a second run cannot take the lock while the first holds it, and is told who holds it |
| B057 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:104` | a killed holder leaves no stale lock |
| B058 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:105` | a killed holder leaves no stale lock |
| B059 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:106` | a killed holder leaves no stale lock |
| B060 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:115` | a waiting run starts as soon as the holder finishes, having said who it waits for |
| B061 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:116` | a waiting run starts as soon as the holder finishes, having said who it waits for |
| B062 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:117` | a waiting run starts as soon as the holder finishes, having said who it waits for |
| B063 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:118` | a waiting run starts as soon as the holder finishes, having said who it waits for |
| B064 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:129` | the wait gives up at LOCAL_STACK_LOCK_WAIT_S, naming the holder |
| B065 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:130` | the wait gives up at LOCAL_STACK_LOCK_WAIT_S, naming the holder |
| B066 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:141` | release frees the lock before the caller exits |
| B067 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:142` | release frees the lock before the caller exits |
| B068 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:150` | a caller under \`set -e\` survives a refused try |
| B069 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:158` | a caller under \`set -e\` survives releasing a holder that is already gone |
| B070 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:167` | a runner started by the holder does not wait on its parent |
| B071 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:168` | a runner started by the holder does not wait on its parent |
| B072 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:179` | a stack named by BKIT_LOCAL_STACK never waits on the shared one |
| B073 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:180` | a stack named by BKIT_LOCAL_STACK never waits on the shared one |
| B074 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:199` | every worktree of one repo resolves the main checkout's lock, and waits on it |
| B075 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:200` | every worktree of one repo resolves the main checkout's lock, and waits on it |
| B076 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:205` | every worktree of one repo resolves the main checkout's lock, and waits on it |
| B077 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:206` | every worktree of one repo resolves the main checkout's lock, and waits on it |
| B078 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:218` | outside a git checkout with no BKIT_LOCAL_STACK it refuses, saying why |
| B079 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:219` | outside a git checkout with no BKIT_LOCAL_STACK it refuses, saying why |
| B080 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:220` | outside a git checkout with no BKIT_LOCAL_STACK it refuses, saying why |
| B081 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:226` | a holder that stops before it answers fails the take at once instead of hanging |
| B082 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:229` | a holder that stops before it answers fails the take at once instead of hanging |
| B083 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:230` | a holder that stops before it answers fails the take at once instead of hanging |
| B084 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:231` | a holder that stops before it answers fails the take at once instead of hanging |
| B085 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:236` | a holder that stops before it answers fails the take at once instead of hanging |
| B086 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:237` | a holder that stops before it answers fails the take at once instead of hanging |
| B087 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:238` | a holder that stops before it answers fails the take at once instead of hanging |
| B088 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:255` | \`run\` holds the lock for the command and passes its exit status on |
| B089 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:256` | \`run\` holds the lock for the command and passes its exit status on |
| B090 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:261` | \`run\` with no arguments prints usage and exits 2 |
| B091 | `.bkit/core/engine/audits/templates/local-stack-lock.integration.test.ts:262` | \`run\` with no arguments prints usage and exits 2 |
| B092 | `.bkit/core/engine/audits/templates/templates-content.test.ts:97` | still contains token placeholders {{DEFAULT_BRANCH}} and {{NODE_VERSION}} |
| B093 | `.bkit/core/engine/audits/templates/templates.test.ts:419` | the root README points small changes at /bkit-build |
| B094 | `.bkit/core/engine/audits/templates/templates.test.ts:419` | the root README points small changes at /bkit-build |
| B095 | `.bkit/core/engine/audits/templates/templates.test.ts:419` | the root README points small changes at /bkit-build |
| B096 | `.bkit/core/engine/audits/templates/templates.test.ts:419` | the root README points small changes at /bkit-build |
| B097 | `.bkit/core/engine/audits/templates/templates.test.ts:420` | the root README points small changes at /bkit-build |
| B098 | `.bkit/core/engine/audits/workflows/catalog-parity.test.ts:56` | every .bkit/prompts/*.md agent is referenced in the prompts.md catalog |
| B099 | `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts:405` | every multi-word verdict name has no conflict-free shortening |
| B100 | `.bkit/core/engine/audits/workflows/verdict-vocabulary.test.ts:405` | every multi-word verdict name has no conflict-free shortening |
| B101 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts:587` | Branch Sync merges docs and finishes as its own step |
| B102 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts:1086` | plan caps |
| B103 | `.bkit/core/engine/commands/workflow/steps.test.ts:918` | ledger writer references |
| B104 | `.bkit/core/engine/commands/workflow/steps.test.ts:929` | every configured writer has a prompt file |
| B105 | `.bkit/core/engine/install/write.integration.test.ts:44` | consumer customizations — contained write |
| B106 | `.bkit/core/engine/tools/instructions-sources.test.ts:174` | Hook Text |
| B107 | `.bkit/core/engine/tools/instructions-sources.test.ts:174` | Hook Text |

## Exempt Deferrals

The plan declares the following scope exclusions at lines 397–400. The first three also trace to the issue input; later plan/owner updates govern the final scope. `bkit ledgers triage --fid=724-machine-wide-test --plan=docs/plans/202610/724-machine-wide-test-plan.md` exited 0, classified all four rows Exempt, and wrote zero rows.

| Key | Status; declared where and when | Uncovered work and verified reason |
| --- | --- | --- |
| `724-upstream-consumer-load-gate` | Exempt; `docs/deferrals.jsonl:99`, 2026-10-29; plan Out of Scope | Upstreaming a consumer's projected-load/memory overlap gate remains separate. Reason `scope-declared`. Triage: bounded-remediation=true, in-scope-surface=false, no-external-blocker=true, own-declaration=false. |
| `724-timeout-budget-and-ci-serialisation-unchanged` | Exempt; `docs/deferrals.jsonl:100`, 2026-10-29; plan Out of Scope | Retuning `vitest.timeout-budget.ts` and adding CI serialization remain separate; CI bypass is an intended delivered behavior. Reason `scope-declared`. Triage: bounded-remediation=true, in-scope-surface=true, no-external-blocker=true, own-declaration=false. No timeout-budget change was observed in the reviewed diff. |
| `724-gate-templates-pass-test-workers` | Exempt; `docs/deferrals.jsonl:101`, 2026-10-29; plan Out of Scope | Generic shipped consumer gate templates passing `BKIT_TEST_WORKERS` to arbitrary runners remain follow-up work; bkit's own gates are delivered. Reason `scope-declared`. Triage: bounded-remediation=true, in-scope-surface=true, no-external-blocker=true, own-declaration=false. |
| `724-host-hook-catches-raw-test-runners` | Exempt; latest `docs/deferrals.jsonl:139`, 2026-11-02, first declared 2026-10-29; plan Out of Scope | Host hooks intercepting raw consumer test runners remain separate and are tracked by #822. The requested repository-specific Vitest setup is delivered. Reason `scope-declared`, latest status TRIAGED. Triage: bounded-remediation=true, in-scope-surface=false, no-external-blocker=true, own-declaration=false. |
| Plan execution and merge preconditions | Exempt; plan Gate 2/3/4 and manual execution checkboxes, reviewed 2026-11-03 | Unchecked process boxes, native-host manual checks and merge/CI prerequisites are advisory under this sweep's Process 6. They are not independent missing product deliverables, and this sweep does not claim those unexecuted checks passed. |

## Lazy Deferrals

None. All intended product deliverables were supported by source and recorded verification evidence. All four existing plan-related ledger rows passed triage as Exempt. No unjustified/TRIAGED row was required or appended.

## Handover Notes

Resolve the scanner findings before the next ship. Each B001–B107 entry above blocks under the mandated disabled-test gate. Preserve the source coordinates and reported names when resolving them; the reported names are not always the actual removed test's name.

- For the legacy local-stack-lock test path, compare the carried compatibility tests in `machine-lock.integration.test.ts` with every reported deleted assertion and resolve rename handling through the normal approved change process.
- For resolve-push-base and ci-scripts, establish whether replacement coverage exists and restore any genuinely lost assertions or tests.
- For gateguard, workflow-shape, template/catalog/vocabulary, steps, install and instruction-source findings, reconcile each listed deletion against intended test coverage and restore coverage where absent.
- If a removed capability is genuinely outside the intended change, make that scope decision explicit and review its test impact. Declaring scope alone does not waive Process 8's disabled-test scan.
- Re-run the required scan against the current `origin/dev` and the applicable checks after remediation. The sweep did not modify tests, source code, gates, or deferral rows.

No fixes were applied. The report stops at adjudication; the caller owns the workflow failure path.
