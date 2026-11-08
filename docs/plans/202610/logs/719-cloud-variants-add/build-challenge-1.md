Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Findings Log

Scope note: partial diff coverage. Findings are limited to the content the diff shows (`.bkit/templates/.github/workflows/bkit-cloud.yml` and its `.github/workflows/bkit-cloud.yml` copy, first 500 diff lines each; the shown parts of `cloud-ctx-step.integration.test.ts`, `workflow-templates.integration.test.ts` and `preflight-sh.integration.test.ts`). Cross-referenced: plan § Breaking Changes (row "Non-pnpm consumers → `bkit-unavailable` warning"), plan § Open Questions (assumption "a non-pnpm consumer … else every run reports `bkit-unavailable`"), Success Criterion 3 ("starts no agent, exits green"), `docs/observability.md:190` (`bkit-unavailable` = "lockfile install failed"), owner decision `build-decision-4-1.md` Q1 (config read from the feat/** head), `docs/knowledge.jsonl` `kn-31` (pipefail kills a step on a broken pipe / no-match).

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A consumer whose repo has no `packageManager` field or no `pnpm-lock.yaml` (or any run where the pnpm download or the pnpm cache restore fails) gets a red context job instead of the documented green `bkit-unavailable` no-op: `pnpm/action-setup` and `actions/setup-node` (`cache: pnpm`) sit before `Install bkit` without `continue-on-error`, so they abort the job before the gate can report anything
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:195`
  - **DONE WHEN:** a failure in any context-job tooling step before `Install bkit` (`pnpm/action-setup` `:195`, `actions/setup-node` `:198`) leaves the job running, so `bkit_gate` emits `::warning::[bkit-cloud] gate: unreadable (bkit-unavailable)` plus its summary row, no agent starts and the run is green, matching plan § Breaking Changes and `docs/observability.md:190`; the adopted copy `.github/workflows/bkit-cloud.yml` matches the template.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `context job tooling setup steps before Install bkit cannot fail the job` fails on the parsed `jobs.context.steps` entries whose `uses` starts with `pnpm/action-setup@` or `actions/setup-node@` having no `continue-on-error: true`

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A consumer records `--auto=codex` on `dev`, but every feature branch cut before that commit has no `bkit.cloud.agent` in its own `package.json`, so `Select agent job` reads `none` from `pr-head/`, starts nothing, and its notice tells them to "Run bkit install --auto=<claude|opencode|codex>", a command they already ran; the reverse also holds: setting `bkit.cloud.agent` to `none` (or another agent) on `dev` does not reach in-flight branches, which keep starting the agent their own `package.json` names
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:225`
  - **DONE WHEN:** the owner decides which copy of `bkit.cloud.agent` (and `bkit.tracker.default`, read the same way by `bkit_gate` `:417` and by bkit under `cd pr-head`) wins when the feat/** head and `dev` disagree, and the router and its notice match that decision. No agent can settle it because owner decision `build-decision-4-1.md` Q1 explicitly lists `bkit.cloud.agent` / `bkit.tracker.default` as data read from the feat/** head. The owner chooses one of: (a) read routing config from the `dev` checkout (workspace root) and only marker / branch / `.bkit/issues.jsonl` from `pr-head/`; (b) read the feat/** head first and fall back to `dev` when the head lacks the field, with the notice naming which copy decided; (c) keep the head-only read and make the notice say the branch predates the recording (merge `dev` into it) instead of telling the user to run `bkit install --auto=`.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `Select agent job dispatches the agent recorded on dev for a feat branch that predates the recording` fails on `codex=false` and the "Run bkit install --auto=" notice when the root `package.json` records `bkit.cloud.agent: "codex"`, `HEAD_DIR` points at a `package.json` with no `bkit.cloud.agent`, and `BKIT_OPENAI_API_KEY` is set

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** A feat/** CI run whose branch was deleted before the router starts (PR merged with auto-delete, or closed while CI ran) turns the context job red: the new `pr-head` checkout asks `actions/checkout` for `workflow_run.head_branch` by name, which no longer exists, and the step has no `continue-on-error`; before this diff the same run reached the feat arm's green "no open PR" no-op
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:184`
  - **DONE WHEN:** a feat/** run whose head branch is gone ends green with the existing no-op notice and no dispatch (the ctx step already degrades to tracker `none`, agent `none` and no FID when `pr-head/` is missing), while the owner-confirmed `ref` expression (`workflow_run` head branch on feat/**, `dev` otherwise) is unchanged; the adopted copy `.github/workflows/bkit-cloud.yml` matches the template.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/workflow-templates.integration.test.ts` `pr-head checkout cannot fail the context job when the feat branch is gone` fails on the parsed `jobs.context.steps` `actions/checkout` entry with `with.path: pr-head` having no `continue-on-error: true`

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** A post-merge `dev` CI failure whose squash commit message is larger than the pipe buffer (64 KB on Linux; a squash of a PR with thousands of commits) kills the context step red: `printf '%s\n' "$COMMIT_MSG" | head -1 > "$SUBJECT_FILE"` runs under `set -euo pipefail` with no `|| true`, so `printf` dies on the broken pipe once `head -1` exits; the replaced pipeline carried `|| true` for exactly this reason
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/templates/.github/workflows/bkit-cloud.yml:531`
  - **DONE WHEN:** writing the subject line cannot fail the step on any message size (e.g. `|| true` on the pipeline, or a bash `${COMMIT_MSG%%$'\n'*}` expansion with no pipe), so a large squash message still resolves the FID through `fids parse --prompt-file`; the adopted copy `.github/workflows/bkit-cloud.yml` matches the template.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/cloud-ctx-step.integration.test.ts` `dev arm resolves the FID from a squash message larger than the pipe buffer` fails on a non-zero step status (141 or 1) and no `arg` output for `COMMIT_MSG` = `feat(363-widen-bkit-cloud-trigger): x bkit [auto route]` + `\n` + 120000 `x` characters (above the 64 KB pipe buffer, below Linux's 128 KB per-env-string limit), dev CI `failure`, feature seeded

<!-- bkit:task 4 end -->
