Verdict: FAIL
Failures: 1
Fixable: false
Tasks: 7, 9
Loosened: none
Fingerprint: 7265fcd11b0231fc9c10f60534c985f953ea6c2242a452c99d4d43a6ed3495c4
<!-- verdict:end -->

# Plan Verification

## Scope

Group 4

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

- `build-plan-verify-4-1.md` (attempt 1, `FAIL`): Task 7 `cloud.md:125` wording gap (`Fixable: true`) and the Task 8 jq-absent test gap (`Fixable: false`).
- `build-plan-gaps-remediate-4-1-log.md` (attempt 1, `FAIL`): the `cloud.md` wording gap is `DONE`; the Task 8 test gap is `BLOCKED`, left for the owner.

## Notes

- Mode `Group`, judged against `build-diff-4-2.md`. No `Deviations` section in `build-brief-4-1.md`. `build-plan-current.md` reports no affected tasks. The decision records `build-decision-1-1.md` to `build-decision-1-3.md` cover Group 1 only; no Group 4 decision record exists, so nothing here is accepted.
- Task 7 satisfied: `.bkit/allowlist.json` `fingerprint` `5b7f786f` is unchanged since attempt 1, where it was checked equal to `egressFingerprint(domains)`. The three tests pass, and `pnpm bkit:check:dist` exits 0 on this run. The attempt-1 wording gap is closed: `.bkit/core/.bkit/cloud.md` § Network access now says every cloud's dashboard list (Claude, Cursor and Codex) is an unverified operator assertion, and `.bkit/cloud.md` matches it except for the rendered managed marker on line 3.
- Task 8 not satisfied: 21 of 22 tests in `pnpm bkit:test:file tests/shell/bkit-cloud-bootstrap-preflight.bats` pass, and `fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent` still fails at `:268`. The test and the hook are byte-identical to attempt 1. `cmp` of the two hook copies exits 0, and `dogfood-templates.test.ts` passes.
- Fixable decision for Task 8: the test-first audit (`build-tests-green-4-2.md`) labels this gap `not-green`, `Fixable: true`. I logged it `Fixable: false`, as attempt 1 did, because the attempt-1 fix round already showed no code step can close it. The hook is correct, a code step may not rewrite a planned test, and `Loosened` covers only loosened tests, not new ones. The owner chooses at the Decision Pause. Option A: authorise the tests step to rewrite the second half so jq is really absent, for example with a tools-only PATH like the file's `NO_GH_BIN` that leaves jq out. Option B: accept the failing half.
- Task 9 satisfied: unchanged since attempt 1. `detectCloudBootstrapFingerprintMissing` matches on the variable name, `runPreflight` pushes the finding, and the files, check and doctor tests pass.
- Tests run, one invocation each: the bats file, then `network-allowlist.test.ts`, `cloud-env.test.ts`, `files.test.ts`, `check.integration.test.ts`, `doctor.integration.test.ts` and `dogfood-templates.test.ts` together (277 pass).
- Docs: `docs/testing.md` rows for the new tests belong to Task 10 (Group 5). `docs/observability.md` is present, and the hook keeps its `[cloud-bootstrap]` stderr prefix.
- The test-first audit has no `null` gap and no `Unproven`, `Updated tests` or `Already landed` section, so no test is `test-loosened`.
- Out of scope, as attempt 1 noted: `without jq, gh still logs in from BKIT_GH_TOKEN` (`:170`) has the same `/usr/bin/jq` flaw but passes, because it never checks behaviour that needs jq to be absent.

## Identified Gaps Log

1 gap.

- TASK 8: `tests/shell/bkit-cloud-bootstrap-preflight.bats` `fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent` — not-green: still fails at `:268` (21 of 22 pass). The second half removes `$FAKE_BIN/jq` (`:265`), but `run_bootstrap` (`:74`) keeps `/usr/bin` on PATH and this host ships `/usr/bin/jq`, so jq is never absent and the hook logs the operator-asserted match instead of the WARNING. The hook is correct; only a rewrite of this planned test closes the gap, no code step may rewrite a planned test, the test is new rather than loosened so `Loosened` does not route it back, the attempt-1 remediation returned BLOCKED on it, and no owner decision record for Group 4 exists; the owner decides between authorising the test rewrite (for example a tools-only PATH without jq, like `NO_GH_BIN`) and accepting the failing half — Fixable: false

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 8: jq-absent half of a planned bats test never removes jq (/usr/bin/jq stays on run_bootstrap PATH); only an owner-authorised rewrite of the planned test can fix it
  **Severity:** HIGH · **Class:** not-green · **Fixable:** false · **Location:** `tests/shell/bkit-cloud-bootstrap-preflight.bats:265` · **Round:** 1
  - **DONE WHEN:** the six tests below pass when `pnpm bkit:test:file tests/shell/bkit-cloud-bootstrap-preflight.bats` runs the file as its own invocation
  - **TEST FIRST:**
    - tests/shell/bkit-cloud-bootstrap-preflight.bats fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent
<!-- bkit:task 1 end -->
