Verdict: FAIL
Failures: 2
Fixable: true
Tasks: 7, 9
Loosened: none
Fingerprint: e4320a54a851c6b01cb50431b7b0dd8911dd541cb95ebabcb55dd09eee9454ab
<!-- verdict:end -->

# Plan Verification

## Scope

Group 4

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode `Group`, judged against `build-diff-4-1.md`. No `Deviations` section in `build-brief-4-1.md`. No `build-plan-verify-4-*` or `build-plan-gaps-remediate-4-*-log.md` file exists. The decision records `build-decision-1-1.md` to `build-decision-1-3.md` cover Group 1 only and accept nothing here.
- Task 7 satisfied: `.bkit/allowlist.json` `fingerprint` `5b7f786f` equals `egressFingerprint(domains)` (checked with `dist/install/cloud-env.js`). The Claude paste section prints "Allowlist fingerprint" and the `BKIT_CLOUD_ALLOWLIST_FINGERPRINT` step. `renderWidenedNetworkList` (`cloud-env.ts:922`) is not touched by the diff and still calls the no-argument `egressFingerprint()`, which returns the same value as before. The three tests pass, and `pnpm bkit:check:dist` exits 0. The Task 7 gap logged below is a docs-wording gap outside its `DONE WHEN`.
- Task 8 not satisfied: five of the six fingerprint tests pass, `cmp` of the two hook copies exits 0, and `dogfood-templates.test.ts` passes. The sixth test fails at `:268` on this run as well (`pnpm bkit:test:file tests/shell/bkit-cloud-bootstrap-preflight.bats`: 21 of 22 pass). The code step's claim holds: `env -i PATH="$FAKE_BIN:/usr/bin:/bin" bash -c 'command -v jq'` prints `/usr/bin/jq`. A scratch run of the template hook with a PATH that truly has no jq printed the "expected fingerprint is unavailable" WARNING, so the hook behaves as planned and only the test is wrong. The test-first audit labels this gap `not-green`, `Fixable: true`. I logged it `Fixable: false` because no code step can close it: a hook change would be a workaround for the test, a code step may not rewrite a planned test (the engine's exit 11), and the workflow sends a test back to the tests step only through `Loosened`, which covers loosened tests, not new ones. The owner decides at the Decision Pause. Option A: allow the tests step to rewrite the second half so jq is really gone, for example by running it with a tools-only PATH like the file's `NO_GH_BIN` without jq. Option B: accept the failing half.
- Task 9 satisfied: `detectCloudBootstrapFingerprintMissing` matches on the variable name, not byte identity, and `runPreflight` pushes its finding. The files, check and doctor tests pass; they run `bkit check` and `bkit doctor` on a temp consumer and assert the id and the template path. bkit's own `node dist/cli.js check` exits 0, does not print `cloud-bootstrap-fingerprint-missing`, and leaves the working tree unchanged. `templates.md` row updated.
- Operator-assertion wording: no changed or shipped text says the allowlist fingerprint is verified. The hook logs "operator-asserted match; the deployed dashboard allowlist is unverified". `cloud.md:125` and the paste text in `cloud-env.ts` call the stamp an operator assertion. The `templates.md` row says only that the hook "compares" and "warns on a mismatch".
- Tests run, one invocation each: the bats file; then `network-allowlist.test.ts`, `cloud-env.test.ts`, `files.test.ts`, `check.integration.test.ts`, `doctor.integration.test.ts` and `dogfood-templates.test.ts` together (277 tests pass).
- `docs/testing.md` rows for the new tests belong to Task 10 (Group 5), so they are not a gap here. `docs/observability.md`: the hook keeps its `[cloud-bootstrap]` stderr prefix, as the plan's row asks.
- Out of scope, for a separate fix: the existing test `without jq, gh still logs in from BKIT_GH_TOKEN` (`:170`) has the same flaw, since `rm "$FAKE_BIN/jq"` leaves `/usr/bin/jq` on PATH. It passes only because it never checks behaviour that needs jq to be missing.
- No test-first audit gap is `null`, and the audit has no `Unproven`, `Updated tests` or `Already landed` section, so nothing is `test-loosened`.

## Identified Gaps Log

2 gaps.

- TASK 8: `tests/shell/bkit-cloud-bootstrap-preflight.bats` `fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent` — not-green: the second half (`rm "$FAKE_BIN/jq"`, `:265`) never makes jq absent, because `run_bootstrap` (`:74`) runs the hook with `PATH="$FAKE_BIN:/usr/bin:/bin"` and this host ships `/usr/bin/jq` (any host with jq in `/usr/bin` fails the same way), so the hook reads the fingerprint, logs the operator-asserted match and prints no WARNING (`:268`). The hook is correct: with a PATH that truly lacks jq it prints the "expected fingerprint is unavailable" WARNING and exits 0. Only a rewrite of this planned test can close the gap, no code step may rewrite a planned test, and the test is new rather than loosened, so the `Loosened` route back to the tests step does not apply; the owner decides between authorising the test rewrite and accepting the failing half — Fixable: false
- TASK 7: `.bkit/core/.bkit/cloud.md` `:125` — Documentation Updates row and Task 7 UPDATE field partly done: the text calls the Claude dashboard list an unverified operator assertion, but does not say the Cursor and Codex dashboard lists are unverified operator assertions too (the row asks for every cloud: Claude, Cursor, Codex); add that clause to the Cursor and Codex sentence and re-run `bkit upgrade` for the `.bkit/cloud.md` mirror — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 8: jq-absent half of a planned bats test never removes jq (/usr/bin/jq stays on run_bootstrap PATH); only a planned-test rewrite can fix it
  **Severity:** HIGH · **Class:** not-green · **Fixable:** false · **Location:** `tests/shell/bkit-cloud-bootstrap-preflight.bats:265` · **Round:** 1
  - **DONE WHEN:** the six tests below pass when `pnpm bkit:test:file tests/shell/bkit-cloud-bootstrap-preflight.bats` runs the file as its own invocation
  - **TEST FIRST:**
    - tests/shell/bkit-cloud-bootstrap-preflight.bats fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 7: cloud.md does not state that the Cursor and Codex dashboard lists are unverified operator assertions
  **Severity:** LOW · **Class:** docs-update-partial · **Fixable:** true · **Location:** `.bkit/core/.bkit/cloud.md:125` · **Round:** 1
  - **DONE WHEN:** Documentation Updates row for .bkit/core/.bkit/cloud.md: every cloud dashboard list (Claude, Cursor, Codex) is an operator assertion, unverified
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
