Verdict: PASS
Failures: 0
Fixable: false
Tasks: 7, 8, 9, 11
Loosened: none
Fingerprint: c22c4f710525e9f5eae367cd1b070989dbd0691ae26f032de5e23c84ebf97ecb
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
- `build-plan-gaps-remediate-4-1-log.md` (attempt 1): the `cloud.md` wording gap is `DONE`; the Task 8 test gap is `BLOCKED`, left for the owner.
- `build-plan-verify-4-2.md` (attempt 2, `FAIL`): Tasks 7 and 9 satisfied; the Task 8 jq-absent half still failed at `:268`, `Fixable: false`.
- `build-decision-1-4.md` (owner decision, Group 4, verify attempt 2): `Decision: Fix now`, creating Task 11. The jq-absent half builds its PATH the way `NO_GH_BIN` is built, leaving jq out. The `:170` test stays out of this run.

## Notes

- Mode `Group`, judged against `build-diff-4-3.md` (all of Group 4 since the group started). Since the attempt-2 verify commit `1bc5e10a8`, only `tests/shell/bkit-cloud-bootstrap-preflight.bats` (Task 11) and `.bkit/friction.jsonl` changed. Neither brief has a `Deviations` section. `build-plan-current.md` reports no affected tasks.
- Task 7 satisfied: the code is unchanged since attempt 2. `.bkit/allowlist.json` `fingerprint` is still `5b7f786f`. `network-allowlist.test.ts` and `cloud-env.test.ts` pass, and `pnpm bkit:check:dist` exits 0 on this run.
- Task 8 satisfied: all 22 tests pass when `pnpm bkit:test:file tests/shell/bkit-cloud-bootstrap-preflight.bats` runs the file as its own invocation, including the six fingerprint tests. `cmp .claude/hooks/bkit-cloud-bootstrap.sh .bkit/templates/.claude/hooks/bkit-cloud-bootstrap.sh` exits 0, and `dogfood-templates.test.ts` passes. The hooks are unchanged since attempt 2.
- Task 9 satisfied: the code is unchanged since attempt 2. The `files.test.ts`, `check.integration.test.ts` and `doctor.integration.test.ts` tests pass. bkit's own `bkit check` not printing the advisory was checked in attempt 1 and is unaffected by the later changes, which touch only the test file and the friction ledger.
- Task 11 satisfied: `setup()` builds `NO_JQ_BIN` from the fake `gh` plus `bash sh cat node git`, the same way `NO_GH_BIN` is built, and leaves jq out. The jq-absent half asserts `[ -z "$(PATH="$NO_JQ_BIN" command -v jq)" ]`, then runs the hook with `env -i PATH="$NO_JQ_BIN"`. This host has `/usr/bin/jq`, and a scratch rebuild of that PATH still resolves no jq, either inline or from inside `env -i ... bash`. The test name, its no-fingerprint half and every other test are unchanged; the only other change is the `teardown` cleanup of `NO_JQ_BIN`. The hook copies are unchanged, and `cmp` exits 0. The `:170` test stays as the owner decided.
- Test-first audit `build-tests-green-4-3.md`: `Enforced: true`, `Gaps: 0`, no `Unproven` or `Updated tests` section. Its `Already landed` section lists:
  - Task 8 `fingerprint: warns and continues when .bkit/allowlist.json has no fingerprint or jq is absent`. Reason given: the hook block landed before the tests ran, and the test reaches both halves.
  - Task 11, same test. Reason given: the hook already warns when jq is missing, and the test now builds a jq-free PATH and asserts jq is absent from it.
  - The reason in the Task 11 entry (and in `build-plan-tests-4-log.md`) also says "on this host jq is not in /usr/bin so the old test also passed". That is wrong: `/usr/bin/jq` exists here, and the old test failed in attempts 1 and 2. It does not change this verdict, because the rewritten test makes jq absent whatever the host has, and it passes.
- Decision records: `build-decision-1-1.md` to `build-decision-1-3.md` cover Group 1. `build-decision-1-4.md` directs the Task 11 fix (not an accept), and Task 11 meets it.
- Tests run, one invocation each: the bats file (22 pass); then `network-allowlist.test.ts`, `cloud-env.test.ts`, `files.test.ts`, `check.integration.test.ts`, `doctor.integration.test.ts` and `dogfood-templates.test.ts` together (277 pass); then `pnpm bkit:check:dist` (exit 0).
- Docs: the `docs/testing.md` rows for the new tests belong to Task 10 (Group 5). `docs/observability.md` is present, and the hook keeps its `[cloud-bootstrap]` stderr prefix. The Derived Test Matrix row for Task 11 is covered by its `DONE WHEN`.
- Out of scope, carried from earlier attempts: `without jq, gh still logs in from BKIT_GH_TOKEN` (`:170`) still deletes `$FAKE_BIN/jq` while `/usr/bin` stays on PATH. It passes only because it never checks behaviour that needs jq to be absent. The owner kept it out of this run.

## Identified Gaps Log

None
