Verdict: PASS
Failures: 0
Fingerprint: 460ed50baf22017cf90b3127af4e34fa2979555940dbf63449a7bc495740d018
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

Whole diff `tmp/bkit-diff-921-tests-lock-default.md` (cut from `1ae01d449`; its first line is not `partial diff coverage`): `.bkit/templates/scripts/ci/bkit-machine-lock.sh` and its copy `scripts/ci/bkit-machine-lock.sh` (`cmp` confirms they are byte-identical), three integration test files, `.bkit/core/.bkit/templates.md` / `.bkit/core/.bkit/workflows.md` and their mirrors, `docs/testing.md`, two `docs/decisions.jsonl` rows for `724-tests-lock-fixed-slots-not-live-load` and three `.bkit/friction.jsonl` rows. This round adds the Task 6 per-process override wording to the five docs and the second decision row.

## Notes

- Input validation: a set `BKIT_TEST_SLOTS` still passes the unchanged digits-only `case` filter before `$((10#...))` (`bkit-machine-lock.sh:115-118`), so no arithmetic or command injection reaches the shell. Set-vs-unset uses `${BKIT_TEST_SLOTS+x}` (`:110`), which is safe under `set -u`.
- Core probe: `_local_stack_lock_cores` (`:92-105`) keeps the old probe order and filters the result to digits, non-zero, else 1, before `[ "$_lsl_cores" -ge 8 ]` (`:109`) or the workers division (`:129`). A digit string too large for `test` makes `[` fail and leaves the default at 1, so it fails safe. The probe resolves `getconf` / `nproc` / `sysctl` through `PATH` exactly as before; anyone who controls `PATH` already runs code, so this adds no trust surface.
- Variable scope: `_lsl_cores` is declared `local` in `_local_stack_lock` (`:154`) and set only through `_local_stack_lock_cores` on the `tests` path (`:161-163`), so nothing leaks into the caller's shell. The slot count handed to the perl holder (`:425`) is always a validated whole number.
- Tests: the fake `getconf` / `nproc` / `sysctl` fixtures are written under the per-run `mkdtemp` folder with a numeric-only interpolated body; the pinned `BKIT_TEST_SLOTS: "1"` in `tests-lock.integration.test.ts` and `branches-lock.integration.test.ts` is a test env value only.
- Secrets, PII and consumer names: none in the script, docs, decision rows or friction rows. The rows name only bkit's own repository. No new dependency, so no supply-chain review is needed.
- Docs cross-check: `docs/security.md` § Shell Injection covers TypeScript subprocess calls, which this change does not touch; § PII is respected (the stderr note names only the variable and the count); § Scope and § RLS say there is no auth, database or tenancy surface, so the auth, RLS and tenancy vectors do not apply.
