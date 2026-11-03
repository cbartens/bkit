Verdict: CONCERNS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

NORMAL — failing tests pinpoint synchronous scanner/subprocess work, so feature-level instrument-and-fix soak is unwarranted. A scheduling control is verified, but its insufficiency for the child case leaves the infrastructure remediation unresolved.

## CI Run

NOT CHECKED: this diagnosis concerns the supplied local `build-run-tests` attempt 1, not a remote CI run. The status row records exit 1 and four failures for `pnpm bkit:gate:static-unit-integration`. Primary evidence is the full outbox `run-tests-1.log` and its `vitest-30696.xml` JUnit report. No new remote run was requested. The last passing CI comparison was not supplied; the unchanged-candidate-file comparison uses `origin/dev...HEAD`, not a claimed last-green CI baseline.

## Prior Attempts Reviewed

None — Strategy STANDARD. The latest supplied decision, `build-decision-1-2.md`, says the earlier group gate passed unchanged and its timing flake remains unresolved; that pass is not treated as a fix for this attempt.

## Prior Knowledge

- `local-pnpm-test-full-parallelism-integration-timeouts-flake`: isolated reproduction distinguishes resource-sensitive failures from assertion failures — applied as a hypothesis, not automatic proof.
- `spawn-heavy-unit-suite-needs-its-own-budget-under-load`: fixed child-process budgets and load-average scaling can miss real wall-time inflation — applied to inspect the actual fixed 30-second case. No timeout increase is recommended here.
- Failure ledger `ci-scripts-resolve-push-base-standalone-test-timeout-under-full-gate`, `instructions-retired-clause-timeout-under-full-gate`, `instructions-corpus-store-timeout-under-full-gate` are TRIAGED matching incidents. The retired-clause row incorrectly says its case spawns a CLI; the current body runs synchronous clause scans. The new `sync has nothing left to rewrite` timeout belongs to the same corpus-scanner class but is not explicitly named by those keys.
- Scar tissue: repository history is not shallow. Candidate-file searches found no revert commit for these scanner/harness/config paths. A broader `revert` text hit, `5f68cf202`, describes deliberately reverted mutation tests, not a reverted remediation; a known real revert (`152991894`) confirms history search works. No prior fix SHA is being reapplied.
- External vendor search was not triggered: evidence points to local execution cost and scheduling, not a dependency-version or vendor regression. No version-shaped hypothesis arose.

## Related Issues

- #814 — Give load-sensitive tests a budget that holds under the full gate (OPEN). Read directly from GitHub; it names all three pre-existing failure keys and records unmeasured budget shortfall. https://github.com/cbartens/bkit/issues/814

## Failures

The local gate passed static checks, then unit coverage reported 163 passing files, two failing files, 6983 passing tests, two skipped tests and four timeouts. Bats and integration were not reached because the package scripts chain with `&&`.

- `instructions.test.ts:213`: `has no findings`, timeout 70128 ms; JUnit duration 81.225956083 seconds.
- `instructions.test.ts:228`: `sync has nothing left to rewrite`, timeout 70128 ms; JUnit duration 168.567918208 seconds.
- `instructions.test.ts:1029`: retired output-cap sentence, timeout 5844 ms.
- `ci-scripts.test.ts:260`: standalone `ci/lanes/bkit-resolve-push-base.test.mjs`, timeout 30000 ms; JUnit duration 33.129955334 seconds.

No reported functional assertion mismatch, authentication failure or unreachable live boundary. Runtime/E2E evidence is not configured for this CLI repository in the supplied context.

## Root Cause

Proximate cause: elapsed-time limits are exceeded by synchronous test work. `checkClauses` and `syncClauses` repeatedly walk clauses and corpus lines, including word-level Levenshtein comparisons; the output-cap test calls both for one prompt. The standalone shipped test synchronously launches another Node test process, whose own runWithFakes repeatedly launches Node with temporary fake gh/git commands. These are local test fixtures, not vendor network/auth boundaries. The same four cases without coverage pass in 21.67 seconds, and covered one-worker corpus cases complete in 27476 ms and 30595 ms, below their original 70128 ms budget. A second covered one-worker probe proves the retired-clause assertion passes in 3122 ms but the child case still times out after 37725 ms against its fixed 30000 ms limit. Thus bounded file concurrency alone does not solve this failure.

Design fragility: these heavy checks share the covered unit runner with the rest of the suite. Corpus budgets sample load once at module load, and the child-script wrapper hard-codes 30000 ms. Load average is an indirect resource signal and cannot establish subprocess latency or memory pressure. The original run started at load 11.7 on 10 cores; diagnosis sampled 17.6/36.9/32.2. Other worktree processes were not identified: the read-only process inventory was denied, and no process was touched.

Confidence is high in test-budget exhaustion and moderate in the precise allocation of cost among full-suite contention, coverage and host pressure; coverage and load were not controlled independently. The feature changes the Narrate clause, so an incremental scanner cost is possible, but the identical current assertions pass in isolation; the scanner, tests, shipped script and timeout configuration themselves are unchanged versus origin/dev. No evidence justifies changing the progress-bar implementation. No concrete permanent fix is established for the child-process wrapper, and the required gate remains red.

## Rot Signals

tests, reliability

- tests: repeated whole-corpus scans and a nested synchronous test suite have resource-sensitive wall-clock budgets; three signatures already recur in the ledger.
- reliability: the required local gate intermittently fails without assertion differences, blocking unrelated feature delivery; #814 remains open.

## Recommended Remediation

1. Keep this gate blocked; do not launch another blind full-suite retry. `VITEST_MAX_WORKERS=1` is supported and helps the scanner probes, but the child case still times out with it. A remediator needs a measured child-process/performance diagnosis under coverage before a full gate rerun. No timeout, assertion, selection or config weakening is authorised.
2. In-scope `.bkit/instructions.md:2590` and the six workflow Narrate copies: preserve the feature wording; the exact current clause assertions pass in the focused checks. No code/text remediation is justified by these timeout-only failures.
3. In-scope `.bkit/core/engine/commands/workflow/tests.ts:114`: retain environment forwarding and normal gate accounting; do not replace the full gate with the diagnostic filter or classify its intentionally incomplete coverage run as green.

## Out-of-Scope Recommendations

- `.bkit/core/engine/tools/instructions.ts:763,978`: under #814, profile and reduce redundant corpus/clause work while preserving exact findings and sync output. This implementation appears through failure paths, not as a #825 work target.
- `.bkit/core/engine/tools/instructions.test.ts:55,213,228,1029` and `.bkit/core/engine/audits/templates/ci-scripts.test.ts:260`: include the newly observed sync timeout in #814 evidence and validate any scheduling/performance change against the covered full gate. Do not weaken assertions, skip tests or increase budgets in #825.
- `vitest.config.ts`, `vitest.timeout-budget.ts`, `vitest.setup.ts`: a permanent shared runner scheduling solution belongs to #814; this diagnosis only verifies the existing environment control.
- `docs/failures.jsonl`: correct the retired-clause entry's stale CLI-spawn explanation separately and extend the corpus incident with the sync case. No ledger changes were made by this diagnosis.

The remaining work is to measure the nested runWithFakes child launches and file operations under coverage, identify which operation accounts for the 37.725-second elapsed run, and reduce that cost or independently control host contention without changing assertions/budgets. Exact slow sub-operation is not established by existing output. This is #814 infrastructure work, not a diagnosed #825 feature defect; no permanent patch is prescribed without that evidence.

## Blast Radius

The optional invocation environment affects Vitest file-worker scheduling in both unit coverage and integration processes launched by the required gate. Source inspection verifies package scripts preserve selection, coverage includes, the 78% unit branch floor and stage ordering. Configuration resolution confirms one worker; Bats and static checks do not consume this Vitest variable. Test-created subprocesses and explicit within-test concurrency remain unchanged. No application contracts, schemas or feature files change. Its sufficiency is refuted by the child timeout; it cannot be represented as a handled full-gate fix. No code remediation with an unhandled contract break is recommended.

## Suggested Tests

No #825 test rewrite is warranted. For #814, retain these exact four assertions and compare their covered-run durations under bounded scheduling; add equivalence tests only if corpus traversal is optimised. The decisive verification is the complete unchanged required gate, including coverage, Bats and integration, with one worker and no test-name filter.

## Verification Commands

Supported complete command, only after the remaining child-case problem has been resolved or an independently verified environment change justifies revalidation; this is not a recommendation to retry now:

```sh
VITEST_MAX_WORKERS=1 pnpm bkit:gate:static-unit-integration
```

For normal workflow accounting, prefix the existing `bkit tests run --gate=bkit:gate:static-unit-integration ...` invocation with the same environment assignment and keep its normal output/artifact/status flags. Do not append `--maxWorkers` to the compound package gate: that is not verified argument forwarding.

Diagnostics executed: the four named cases via `pnpm exec vitest run ... --maxWorkers=1 -t ...` passed 4/4 in 21.67 seconds. Covered probes use the original `pnpm test:coverage:unit` script and `VITEST_MAX_WORKERS=1`. The first probe's retained output verifies corpus assertions at 27476/30595 ms and a global branch-coverage error (`1.85%` versus `78%`); its verbose middle was capped, so no unseen per-case outcome is claimed. A second narrow probe for only the retired-clause and child cases reports one pass, one timeout, 123 skipped, 45.14 seconds, and a 1.44% branch-coverage error. Filtered runs inherently cannot satisfy the global floor; these failures are not waived or called a passing gate. No full suite was re-run during diagnosis.

## Hypotheses

### Hypothesis 1: #825 introduced a deterministic clause mismatch or broken shipped script

#### Reason

The instruction store and workflow narration changed in this feature, and the full gate reported failures in their corpus checks.

#### Act

Read the four failing bodies and gate log; compare scanner, test harness, shipped script and timeout configuration against origin/dev; run only the four failing cases with one worker and no coverage.

#### Observe

The original gate reports `Error: Test timed out in 70128ms.`, `Error: Test timed out in 5844ms.` and `Error: Test timed out in 30000ms.` rather than assertion differences. The focused run printed `Test Files  2 passed (2)`, `Tests  4 passed | 121 skipped (125)` and `Duration  21.67s (tests 99%)`. The candidate scanner/harness/config/script paths have no diff against origin/dev; `.bkit/instructions.md` has `1 file changed, 3 insertions(+), 2 deletions(-)`.

#### Result

REFUTED — the exact functional assertions pass unchanged in isolation. This does not refute a coverage/performance interaction with the expanded narration, because that first probe omitted coverage.

### Hypothesis 2: synchronous CPU scans and child processes exceed budgets under the covered full gate

#### Reason

Three signatures recur in the failure ledger and open issue #814. The corpus checks execute nested file/clause/line scans and word-level Levenshtein comparisons; the retired-clause case executes the same scanner for one prompt. The shipped-script case blocks on spawnSync. The latter has a fixed 30-second timeout; corpus budgets are sampled once at file load.

#### Act

Read instructions.ts:571,663,763,978, instructions.test.ts:55,213,228,1029, ci-scripts.test.ts:260, vitest.timeout-budget.ts and vitest.setup.ts. Read original JUnit timings and sampled current host load; attempt read-only process inventory.

#### Observe

Original gate: `[test-timeout-budget] load average 11.7 on 10 cores: unit limits 5844ms per test, 11688ms per hook (x1.17)`.

Original JUnit: `time="81.225956083"` for has-no-findings, `time="168.567918208"` for sync, `time="33.129955334"` for the shipped child test. Diagnosis host sample: `{"load":[17.5693359375,36.8935546875,32.1884765625],"cores":10,"freeMem":163807232}`. Process inventory failed: `zsh:1: operation not permitted: ps`.

#### Result

CONFIRMED — the immediate failure is elapsed-time exhaustion on synchronous work; load sensitivity is supported by history and the isolated probe. Specific competing processes and their contribution at the original failure time remain unmeasured. The historical retired-clause row's assertion that this case spawns a CLI is contradicted by its actual body.

### Hypothesis 3: one worker can run the unchanged required gate without weakening its checks

#### Reason

The supported remedy to investigate is execution scheduling, preserving all assertions, coverage thresholds and timeouts. An isolated noncoverage pass is insufficient evidence for the covered gate.

#### Act

Inspect package scripts, installed Vitest configuration resolver, and bkit tests runToLog environment forwarding. Resolve the real unit configuration through createVitest with VITEST_MAX_WORKERS=1. Run only the four failing cases using the original test:coverage:unit script with that environment variable.

#### Observe

Installed Vitest resolver: `if (process.env.VITEST_MAX_WORKERS) {` followed by `resolved.maxWorkers = Number.parseInt(process.env.VITEST_MAX_WORKERS);`.

Configuration probe: `{"maxWorkers":1,"pool":"forks","branchThreshold":78}`.

Coverage probe: `Coverage enabled with v8`.

First covered probe: `has no findings 27476ms` and `sync has nothing left to rewrite 30595ms`; exit 1 with `ERROR: Coverage for branches (1.85%) does not meet global threshold (78%)`. The capped middle of that output did not preserve the other two case results.

Second covered probe, limited to those two cases: `[test-timeout-budget] load average 20.4 on 10 cores: unit limits 10196ms per test, 20391ms per hook (x2.04)`; `output-cap's sentence stays inline in the abort handover prompt 3122ms`; `ci/lanes/bkit-resolve-push-base.test.mjs passes when run on its own 37725ms`; `Error: Test timed out in 30000ms.`; `Tests  1 failed | 1 passed | 123 skipped (125)`; `Duration  45.14s (tests 99%, import 1%)`.

#### Result

REFUTED — VITEST_MAX_WORKERS=1 is supported and the scanner probes pass, but the child case still times out under coverage. This is not a sufficient full-gate remedy; changing concurrency, coverage and host load simultaneously does not isolate the remaining slow operation.
