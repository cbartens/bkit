Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

Scope note: partial diff coverage. Findings are limited to the content the diff shows (`.bkit/templates/.github/workflows/bkit-cloud.yml` first 500 diff lines, its `.github/workflows/bkit-cloud.yml` copy, and the shown test files). Cross-referenced: plan § Security & Privacy (PII: "annotations carry reason + secret names, never values"), `docs/observability.md` § `[bkit-cloud] gate:` annotations, `docs/knowledge.jsonl` `kn-31` (pipefail kills a step on a no-match / broken pipe).

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A rejected tracker key is printed into the run's warning annotation: on `bkit issues fetch` exit 80 `reason=auth` with `BKIT_JIRA_API_KEY` (or `BKIT_LINEAR_API_KEY`, or `GH_TOKEN`) set, `${!secret_var:-empty or missing}` expands to the secret's value, so the warning reads `set but rejected<value>` and exposure rests on GitHub log masking alone
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:449`
  - **DONE WHEN:** the `reason=auth` warning names the secret and says `set but rejected` or `empty or missing` without ever expanding the secret's value (e.g. a `[ -n "${!secret_var:-}" ]` test choosing the wording); the adopted copy `.github/workflows/bkit-cloud.yml:449` matches the template.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `exit 80 reason=auth with BKIT_JIRA_API_KEY set names the secret but never prints its value` fails on stdout containing the fixture value (`BKIT_JIRA_API_KEY: "jira-secret-value"`, `STUB_FETCH_EXIT: "80"`, `STUB_FETCH_OUT: {"reason":"auth"}`, tracker `jira`) right after `set but rejected`

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A failed `Install bkit` on a post-merge `dev` CI failure is misreported: with `node_modules/.bin/bkit` absent the dev arm never reaches `bkit_gate`, so it logs the `::notice::Cannot derive FID by dev commit scope or linked PR` no-op instead of the `bkit-unavailable` warning, writes no gate summary row, and the in-code comment ("`bkit_gate` reports an absent bkit") is false
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:502`
  - **DONE WHEN:** a dev-arm run with `node_modules/.bin/bkit` absent emits `::warning::[bkit-cloud] gate: unreadable (bkit-unavailable)` and a `bkit-unavailable` summary row, exits green with `skip=true` and writes no dispatch-cap counter row (same outcome as the feat arm); the adopted copy `.github/workflows/bkit-cloud.yml` matches the template.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `dev arm with absent node_modules/.bin/bkit warns bkit unavailable and exits green` fails on stdout carrying only the `Cannot derive FID` notice, with no `::warning::` and no `bkit-unavailable` text or summary row (dev CI `failure`, subject `feat(363-widen-bkit-cloud-trigger): x bkit [auto route]`, `node_modules` removed from the fixture workspace)

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** A feat/** CI completion that lands after its branch was deleted (PR merged by ship, or deleted by hand) now fails red at `actions/checkout`, because the context checkout `ref` is the branch name; before this change the job checked out `dev`, found no open PR and exited as a green no-op
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:172`
  - **DONE WHEN:** a feat/** context run whose branch no longer exists on `origin` ends green with a no-op notice and no dispatch (e.g. the feat checkout pins `github.event.workflow_run.head_sha`, which still resolves after deletion and also stops the router reading `package.json` / `.bkit/issues.jsonl` from a newer tip than the CI run judged); the plan's checkout-`ref` matrix row and its `workflow-templates.integration.test.ts` pin are updated to the chosen ref; the adopted copy `.github/workflows/bkit-cloud.yml:172` matches.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `context checkout of a feat run still resolves after the branch is deleted` fails on the context checkout `ref` evaluating to `github.event.workflow_run.head_branch` for a `feat/**` run (asserts the feat-arm ref expression names `workflow_run.head_sha`, and `dev` stays the ref for dev runs and `workflow_dispatch`)

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** A squash commit message longer than the runner's pipe buffer (64 KiB on Linux; a long PR description becomes the squash body) kills the dev arm red: `printf '%s\n' "$COMMIT_MSG" | head -1 > "$SUBJECT_FILE"` runs under `set -euo pipefail` without the `|| true` the replaced line carried, so `head` closing early SIGPIPEs `printf` (exit 141) and the step aborts instead of reaching dispatch or the no-FID no-op
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:504`
  - **DONE WHEN:** the subject extraction cannot fail the step on a large message (e.g. `|| true` on the pipeline, or `${COMMIT_MSG%%$'\n'*}` with no pipe), so a 100 000-character squash body still dispatches on its subject's FID; the adopted copy `.github/workflows/bkit-cloud.yml` matches.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `dev arm reads the subject of a squash message larger than the pipe buffer` fails on the step exiting 141 with no `skip` / `phase` outputs (dev CI `failure`, `COMMIT_MSG` = `feat(363-widen-bkit-cloud-trigger): x bkit [auto route]` + newline + 100 000 `a` characters, kept under the 128 KiB single-env-string limit; expects status 0, `phase=debug`, `arg=363-widen-bkit-cloud-trigger`)

<!-- bkit:task 4 end -->
