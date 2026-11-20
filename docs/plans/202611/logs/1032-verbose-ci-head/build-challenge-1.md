Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A person writes `[Verbose CI]` in a commit: the push run goes verbose, because the job-level `contains()` ignores case, but a manual run on the same commit stays quiet, because the new step's `case` match is case-sensitive
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.github/workflows/bkit-ci.yml:84`
  - **DONE WHEN:** The "Read Verbose Marker (Manual Run)" step turns verbose on for every head commit message that the job-level `contains(github.event.head_commit.message, '[verbose ci]')` matches on a push, so a case variant such as `[Verbose CI]` acts on a manual run too. The runner's `contains()` compares with `StringComparison.OrdinalIgnoreCase` (`src/Sdk/Expressions/Sdk/Functions/Contains.cs` in `actions/runner`), while the step's `case "$msg" in *"[verbose ci]"*)` is case-sensitive; reproduced: a fixture commit `fix: flaky test [Verbose CI]` makes the step exit 0 and write 0 bytes to `$GITHUB_ENV`. The match is fixed at `.bkit/templates/.github/workflows/bkit-ci.yml:84` and `:354` and at `.github/workflows/bkit-ci.yml:374` and `:617`, and the two copies of the step stay byte-identical. The match stays POSIX-portable (for example, lowercase a copy of the message with `tr '[:upper:]' '[:lower:]'` before the `case`, with no `shopt` and no `${msg,,}`), because a runner without bash falls back to `sh`. The message is still never expanded as code and still never written to `$GITHUB_ENV` (`docs/security.md` § Shell Injection). The sentence "They are case-sensitive" in § Commit-message force tags of `.bkit/core/.bkit/workflows.md` and `docs/deployments.md` names `[verbose ci]` as matched without regard to case. The four existing marker-step tests in `ci-scripts.test.ts` still pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/ci-scripts.test.ts` `verbose marker step turns verbose on for a marker that differs only in case, as the job-level contains() does` fails on the step writing nothing to the `GITHUB_ENV` file for the head commit `fix: flaky test [Verbose CI]` in `bkit-tests-static` and `bkit-tests-unit` (the test runs `markerScript(job)` through `runStep` and expects the lines `VERBOSE_CI=1`, `TURBO_LOG_LEVEL=full` and `DEBUG=vercel:*,supabase:*`)

<!-- bkit:task 1 end -->
