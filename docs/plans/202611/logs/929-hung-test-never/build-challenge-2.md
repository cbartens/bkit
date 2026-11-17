Verdict: PASS
Failures: 0
Fingerprint: 01a8fba14bd42191a5373c7a749f8ba1ab00eed1ba2d568549477109efa515af
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

Round 2. Whole diff, 24 files (`tmp/bkit-diff-929-hung-test-never.md`, no `partial diff coverage` line), so no `git diff` fallback was needed. Plan read: `docs/plans/202611/929-hung-test-never-plan.md` (Tasks 1-7; Tasks 6 and 7 are the round 1 fixes). Docs read: `.agents/docs.md`, `docs/security.md` (§ Scope, § Shell Injection, § Supply-Chain, § Untrusted Content & Prompt Injection, § PII, § RLS). Already recorded and not re-raised: the four `929-hung-test-never-challenge-low-*` rows in `docs/deferrals.jsonl` (bare `Error` on a stopped child, `timeout: Infinity`, `CI=false` bats limit, empty `computedHash` for `find-skills`).

## Notes

- Auth, sessions, permissions, tenancy, RLS and PII do not apply. The diff touches only bkit-only test harness files, two test runners, tests, `docs/testing.md`, `docs/deferrals.jsonl`, a pnpm patch for bats, one shipped template test (`.bkit/templates/scripts/ci/bkit-test-awake.test.mjs`) and a skill install. `docs/security.md` § Scope and § RLS confirm bkit has no database or user-auth surface.
- Shell injection (`docs/security.md` § Shell Injection): every new child call uses `spawnSync` with an argument array. The only new `execSync` is `execSync("sleep 30")` in a unit test, a constant literal. The nested-vitest integration tests build their config with `JSON.stringify` of a `mkdtemp` path plus constant test names, so nothing attacker-controlled reaches a command or a config file.
- New in round 2 (`vitest.setup.ts` hook-state accessor, `killSignal: "SIGKILL"` in `vitest.child-deadline.ts`): the accessor only observes Vitest's own `task.result.hooks` writes inside the worker, and crosses no trust boundary. SIGKILL cannot be trapped, so a killed `scripts/ci/bkit-machine-lock.sh run` owner skips `_lsl_run_cancel` (`scripts/ci/bkit-machine-lock.sh:382`). Its flock holder exits within a second (`scripts/ci/bkit-machine-lock.sh:35`), so the lock frees while the guarded command it started can keep running. That is a test-run reliability gap that `docs/testing.md` § Time limits already states ("A limit kills only the direct child"). It is not a security boundary, so it is outside this lens and not logged.
- Data exposure: the limit error names the command and its arguments. Node already prints the full command for `execSync` / `execFileSync` failures. The only new exposure is the `spawnSync` argument list, in local and CI test output only. No test passes a real credential as an argument.
- `patches/bats@1.13.0.patch`: `pnpm-lock.yaml` pins the patch hash, and pnpm checks it. Running `bash "$BATS_ROOT/libexec/bats-core/bats"` resolves `bash` from `PATH`, the same lookup the script's own `env bash` shebang already did, so this adds no new trust in `PATH`. Dropping `declare -r` on `BATS_killer_pid` lets test code overwrite the watchdog pid, but bats test code already runs arbitrary shell. `patchedDependencies` applies only to this repo's own install, not to consumers.
- `BATS_TEST_TIMEOUT` and `CI` come from the invoker's own environment, which crosses no trust boundary.
- Supply chain, skill `bats-testing-patterns` (`wshobson/agents`, no `ref`): markdown only, no install scripts, and no embedded directives in `SKILL.md` or `references/details.md`. `references/details.md` ends mid-section (`## Advanced Patterns` then `#`), which is a content-quality issue, not a security one. Upstream equality and CVE status were not checked live, because no network lookup was run.
- Out of scope and not introduced by this diff: `scripts/gate/bkit-gate-changed.mjs` passes changed file paths straight after `--test`, so a changed `.mjs` file whose name starts with `--` could be read as a node flag. That line predates this run. Propose it separately if wanted.

## Findings Log

None
