Verdict: CONCERNS
Failures: 1
Fingerprint: 61210641b758eac0410ef39a435c3d1a429b34df51d990afb64c602d77090d71
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- Diff: `tmp/bkit-diff-1018-subagent-commits-makes.md`, read in full (1324 lines). Its first line carries no `partial diff coverage` marker, so no targeted `git diff` was run.
- Plan: `docs/plans/202611/1018-subagent-commits-makes-plan.md`, read in full, including the round-1 challenge tasks 6 to 8 in group 3.
- Docs: `.agents/docs.md` read. `docs/security.md` read (§ Untrusted Content & Prompt Injection, § Workflow comment ownership, § Scope, § Public repo content, § Shell Injection, § Shell-Edit Inspection, § CI Auto-Route Trust, § PII, § RLS). `docs/observability.md` and `docs/data-schema.md` checked for logging and data-access rules.
- Warning: `docs/data-schema.md` is a 10-line starter. bkit has no database, and `docs/security.md` § RLS says RLS does not apply.
- Not loaded: the other Build-column docs (`docs/architecture.md`, `docs/testing.md`, `docs/capabilities.md`, `docs/knowledge.jsonl`, `.bkit/workflows.md`, `.bkit/prompts.md`, `.agents/skills.md`), because they carry no security rule this diff touches.
- Surfaces challenged: `.bkit/core/engine/commands/workflow/step-base.ts` (new), `tests-changed.ts`, `branches.ts` (`scan-diff --since-step` and `--file`), `steps.ts` (the `uncommitted` stamp), the two `bkit-build.md` calls and their mirrors, the `dist/` copies (they match the sources), and the docs and ledger rows.

## Notes

- Argument injection, checked and closed: a forged `parentSha` in `status.jsonl` (for example `--output=/tmp/x`) reaches `git diff {base}...HEAD`, but both callers first run `git rev-parse -q --verify {base}^{commit}`, which exits 1 on an option-shaped value (probed in a scratch repo). `commitOfRow` passes `-S{at}` as one argument and the file after `--`. Every new git and gate call goes through `spawnSync` with an argument array and no shell, as `docs/security.md` § Shell Injection requires.
- No network call from ledger data: `scan-diff --since-step` never fetches the base (`fetched` is null when `stepStart` is set), so a forged row cannot trigger a `git fetch`.
- `readRecord` validates its FID (`RECORD_FID`, no `..`), so the in-place check in `tests-changed.ts` builds no path from an unchecked directory name.
- Git refuses `..` and leading-dot components in branch names (checked with `git check-ref-format --branch`), so the finding above cannot climb out of the repository. It still reads a status file the branch name spells, against the documented allowlist rule.
- Ledger trust, not logged as a finding: the base of both checks now comes from `status.jsonl`, a file the measured subagent can edit. Before the change the subagent could pass the same no-progress check by leaving any source edit for the finish commit. The check fails closed on a bad base (exit 23 goes to the Failure Path), and Step 8 re-judges every fix. `docs/security.md` § CI Auto-Route Trust already treats `status.jsonl` budgets as advisory among cooperating agents.
- No secrets, PII, new dependencies, install scripts, auth or tenancy surface in the diff. No embedded directives found in the diff or in the deferral rows it adds.
- The round-1 LOW rows already in `docs/deferrals.jsonl` (`step-base.ts:48`, `step-base.ts:20`, `steps.ts:452`, `tests-changed.ts:207`) are not repeated.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A collaborator pushes a branch named `feat/1-x/nested` (git accepts nested names and characters such as `;$(id)`), and `stepBase` takes everything after `feat/` as the FID with no slug allowlist, so `statusLocation` builds a path from it and a status file the branch name spells, in the main checkout or a nested log folder, sets the base of `bkit tests changed`
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/step-base.ts:19` · **Round:** 1
  - **DONE WHEN:** `branchFid` returns a FID only for a branch that matches the engine's FID slug allowlist (`^feat/([a-z0-9][a-z0-9-]*)$`, as `FEAT_BRANCH` in `.bkit/core/engine/commands/ci/ci.ts` and the branch pattern in `fids.ts` use), so a branch name that is not a FID slug never reaches `statusLocation` path construction and `stepBase` falls back to the in-progress-run scan, as `docs/security.md` § CI Auto-Route Trust requires of every FID resolution site.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/step-base.test.ts` `on a feat branch whose name is not a FID slug, reads no status file at the path the name spells` fails on `stepBase({ cwd })` returning the commit of a `step-done` row instead of null: on branch `feat/1-x/nested`, commit an in-progress run (a `workflow-started` row, then a `step-done` row) at `docs/plans/${utcMonth()}/logs/1-x/nested/status.jsonl`; `branchFid` yields `1-x/nested`, `resolveActiveRun({ fid })` reads that nested file through `statusLocation`, while the allowlisted lookup finds no run and returns null
<!-- bkit:task 1 end -->
