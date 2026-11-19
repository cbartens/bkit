Verdict: CONCERNS
Failures: 2
Fingerprint: 7f4d08c41c663da7acd33f32b90a98a32d832c54e5af4f42a316c38358211ac6
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- Diff: `tmp/bkit-diff-1031-pre-push-refuses.md`, 17 files, full coverage (no `partial diff coverage` line).
- Plan: `docs/plans/202611/1031-pre-push-refuses-plan.md`, tasks 1-6.
- Surfaces challenged: `mainAuditFiles`, `projectSection` and the `--target` flag in `.bkit/core/engine/commands/ci/ci.ts` (and its `dist/` build), the guard loop in `.bkit/templates/.husky/pre-push` and `.husky/pre-push`, and the security wording in `docs/security.md`, `docs/deployments.md` and `.bkit/core/.bkit/templates.md`.
- Docs loaded: `.agents/docs.md`, `docs/security.md` (whole), `docs/decisions.jsonl` key `920-audit-reports-may-skip-ci-on-dev`, `docs/knowledge.jsonl` key `d24-close-guard-scan-must-match-all-5-github-skip-tokens`, and the changed sections of `docs/deployments.md` and `.bkit/core/.bkit/templates.md`. Warning: the other Build-phase docs marked always-read (`.bkit/workflows.md`, `.bkit/prompts.md`, `.agents/skills.md`, `docs/architecture.md`, `docs/data-schema.md`, `docs/observability.md`, `docs/capabilities.md`) were not read in full, because this change has no workflow, prompt, skill, schema, logging or capability surface; `docs/security.md` § RLS says bkit has no database.

## Notes

**How the findings were checked.** Both were reproduced against the built CLI (`dist/cli.js ci min-push`) in throwaway repos in the session scratchpad, not in the worktree. Task 1: a `docs/audits/**` push exits 1 with only `refs/remotes/origin/main`, then exits 0 once `git branch origin/main <pushed sha>` or `git tag origin/main <pushed sha>` exists. Task 2: a template with one end marker exits 1; the same template with a second `<!-- bkit:end -->` line below the first exits 0, with or without `minPushPaths: ["docs/**"]`.

**Why both are LOW.** Each needs an unusual local state: a ref literally named `origin/main`, or a template whose markers do not parse. Three things also limit the damage. On bkit's own repo, `main` takes PRs only (`docs/security.md` § Repository controls), so a direct push is refused by GitHub anyway. GitHub push protection still rejects recognised secrets. `bkit-trivy.yml` also scans on a schedule. Cross-reference: task 1 makes the new `docs/deployments.md` sentence (it "diffs the pushed commit against its merge-base with `origin/main`") and `docs/security.md:101` ("On `main` the hook refuses it") untrue for that checkout. Task 2 is the unparseable-marker variant of plan task 6, whose DONE WHEN refuses every template whose text below `<!-- bkit:end -->` changed. Task 1 is separate from the open deferral about pushes to a remote other than `origin` (`ci.ts:673` row in `docs/deferrals.jsonl`). If the owner moves the check to the SHA the remote advertises, task 1 goes away with it.

**Checked, no finding.**

- Flags: `--target` accepts only `main`. The parser refuses a missing value, a repeat and an unknown flag. `--target=` (empty) reads as no target, the same as `--base=`, and only the hook passes the flag.
- The check fails closed: an unresolved `origin/main`, unrelated history (no merge-base) or a failed or oversized diff exits 7. An older engine that rejects `--target` exits 2. The hook blocks on any non-zero exit.
- `--base` cannot loosen the main check, because `mainAuditFiles` ignores it.
- Shell: the hook passes git's hex SHAs and one fixed word. The engine runs git through `spawnSync` argv (`docs/security.md` § Shell Injection).
- bkit's own hook has an early exit for nothing-new pushes. It never applies to `refs/heads/dev` or `refs/heads/main`.
- No engine command or workflow pushes to `main` directly or uses `--no-verify`.
- `bkit-ci.yml` and `bkit-trivy.yml` trigger on push to `main` / `dev` with no path filters.
- No secrets or new dependencies are in the diff. The new log line prints file names only, with no file content and no personal data.

**Out-of-scope proposals.** These are pre-existing and not caused by this diff, so they are not task blocks:

1. `SKIP_CI_TOKEN` (`.bkit/core/engine/commands/lib.ts:1219`) matches the five bracket tokens but not GitHub's `skip-checks: true` commit trailer. GitHub's "Skipping workflow runs" docs say that trailer also suppresses push workflows (recalled from memory, not re-checked in this run). A head commit with that trailer skips the whole `dev` / `main` guard, including the new `main` check. The fix belongs in the shared regex, which `bkit prs`, `bkit runs` and `bkit branches` also use.
2. `pushBase` (`ci.ts:619-626`) resolves the bare names `origin/dev` and `origin/main`, so a local ref with either name can shadow them, as in task 1.
3. No git call in `skip-token` or `min-push` sets `GIT_NO_REPLACE_OBJECTS`. A local `refs/replace/*` entry can make the checks read a different commit or tree from the one the push sends.
4. Plan logs, gate-log artifacts under `docs/plans/**/logs/` and `docs/*.jsonl` still reach `main` under a skip-CI head. They are also written from CI and test output. The plan keeps plans-only `main` pushes allowed, so widening the check is a design call for the owner.
5. `projectSection` returns null when `git cat-file` fails for any reason, and the check reads null as "file absent". In a blobless partial clone whose lazy fetch fails, a template blob that cannot be read would be skipped rather than reported not proven. This was reasoned from the code and not reproduced.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A `[skip ci]` push of `docs/audits/202611/security.md` to `main` passes `min-push --target=main` (exit 0, `minPush: true`) when the checkout holds a local branch or tag named `origin/main` at the pushed commit (`git checkout -b origin/main`, `git tag origin/main`), because `mainAuditFiles` passes the bare name `origin/main` to `rev-parse` and `merge-base`, git resolves it as `refs/tags/origin/main` or `refs/heads/origin/main` before `refs/remotes/origin/main`, so the merge-base is the pushed commit itself and the audit diff is empty
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/ci/ci.ts:683` · **Round:** 1
  - **DONE WHEN:** `mainAuditFiles` resolves `refs/remotes/origin/main` and takes its merge-base against that full ref, so no local branch or tag named `origin/main` can move the base: a `[skip ci]` push carrying a `docs/audits/**` file is refused on `main` and the file is named, whatever `refs/heads/origin/main` or `refs/tags/origin/main` hold, and a missing `refs/remotes/origin/main` still exits 7
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main refuses a docs/audits change when a local branch named origin/main shadows the remote-tracking ref` fails on exit 0 with `minPush: true` for `pushedToMain({}, { "docs/audits/202611/security.md": "# Report\n" })` after `git(cwd, "branch", "origin/main", head)`, where it should exit 1 and name the file on stderr
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main refuses a docs/audits change when a local tag named origin/main shadows the remote-tracking ref` fails on exit 0 for the same repo after `git(cwd, "tag", "origin/main", head)`, where it should exit 1 and name the file on stderr
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** An audit template on `origin/dev` but not on `origin/main` whose project text sits below a second `<!-- bkit:end -->` line is promoted to `main` under a `[skip ci]` plans-only head and passes `min-push --target=main` (exit 0), because `projectSection` maps a managed block that does not parse (`managedHead` null: no start marker, or a second start or end marker) to an empty project section, which equals the empty section an absent file counts as; the same template with one end marker is refused (exit 1)
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/ci/ci.ts:672` · **Round:** 1
  - **DONE WHEN:** `mainAuditFiles` refuses and names every changed top-level `docs/templates/bkit-audit-*.md` that is present at the pushed commit and whose managed block does not parse there, counting the whole file as project text, so the only templates it leaves out are those absent at the pushed commit and those whose parsed project section is unchanged against the `origin/main` merge-base (absent counts as empty)
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main refuses an audit template new to main whose project section sits below a duplicated bkit:end marker` fails on exit 0: `origin/main` lacks `T1`, `origin/dev` holds `auditTemplate("block", "<!-- bkit:end -->\nnew project text")`, the head adds only `docs/plans/202611/logs/1-x/status.jsonl` under `[skip ci]`; with `--target=main` it should exit 1 and name `T1`
<!-- bkit:task 2 end -->
