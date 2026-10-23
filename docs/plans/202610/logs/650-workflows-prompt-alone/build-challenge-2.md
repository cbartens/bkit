Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Findings Log

Coverage: partial diff coverage — `git diff origin/dev..HEAD` = 195098 lines (> 10000), per-file budget mode. Reviewed in full: every non-log source file under `.bkit/core/engine/**` (`fids.ts`, `prs.ts`, `branches.ts`, `ledgers.ts`, `worktrees.ts`, `runs.ts`, `workflows.ts`, `steps.ts`, `locks.ts`, `land.ts`, `shared/branches.ts`, `lib.ts`), the security-relevant `+` lines of `.bkit/core/workflows/bkit-{ship,debug,build}.md`, `skills-lock.json` + `.agents/skills/vitest/**` (new skill), `.prettierignore`. Whole-diff `+` lines grepped for secrets (`ghp_`, `github_pat_`, `sk-`, `AKIA`, `Bearer`, private keys, Linear / Atlassian tokens) and consumer names: none found. `docs/plans/202610/logs/**` (run logs, ~180k lines) not read beyond the grep.

### 1. MEDIUM — in-place `dev` run fails open to wholesale commit / push when its shared-checkout record is gone

- **severity:** MEDIUM
- **class:** mechanical
- **location:** `.bkit/core/engine/commands/workflow/branches.ts:618`; `.bkit/core/engine/commands/workflow/runs.ts:436-441`; `.bkit/core/engine/commands/workflow/steps.ts:431`; `.bkit/core/engine/commands/workflow/workflows.ts:1017`; record removal at `.bkit/core/engine/commands/workflow/worktrees.ts:128-134` via `.bkit/core/engine/commands/workflow/locks.ts:174`
- **exploit scenario:** Every own-path / own-commit guard keys on `recordOnBranch` / `activeRecord` returning non-null; when null on `dev`, the code silently falls back to the pre-#650 path: `git add -A` + commit (`steps.ts:431`, `workflows.ts:1017`), plain `git push origin dev` of all of local `dev` (`branches.ts` after L618), and the CI re-trigger's `git commit --allow-empty` + `pushCurrentBranch` (`runs.ts:441`). The record disappears in a reachable window: debug on `dev` runs `workflows close` (appends `workflow-done`, so the run folds to `DONE`) and then pushes, dispatches, re-triggers and waits for CI with the lock still held. During that window `workflowLockLive` → `liveReason` returns `finished` (`locks.ts:174`), so a second in-place run on `dev` with another FID (`openSharedRecord`, `worktrees.ts:128-134`) treats the first run's record as left over and deletes it. If the first run's dispatch then re-triggers, it pushes local `dev` wholesale: the maintainer's unpushed local commits (WIP, possibly secrets) reach `origin/dev` (public for bkit) — the exact exposure the feature exists to prevent. A corrupt record (`readRecord` → `parseJson` fails → null) or a branch switch (`activeRecord` → null) produce the same fallback.
- **suggested fix:** Fail closed on a shared branch: (a) `branches push --mode=dev` (only debug-on-`dev` calls it) refuses with a new exit when `recordOnBranch` is null; (b) `ciDispatchGate`'s re-trigger on a shared branch (`byRun`) refuses instead of the `pushCurrentBranch` fallback when `rec === null`; (c) `writeStepRow` / `closeWorkflow` refuse `git add -A` on `dev` / `main` when the status file's FID has no active record. And (d) in `openSharedRecord`, treat another FID's record as live while its workflow lock file exists and is younger than `WORKFLOW_LOCK_IDLE_S`, not only while its run is `IN_PROGRESS`, because debug on `dev` deliberately holds the lock past `workflow-done` through the CI wait. Add `shared-checkout.integration.test.ts` rows: record removed after close → push / re-trigger exit non-zero, foreign local commit not on `origin/dev`.

### 2. LOW — design / plan `branches land` MCP merge fallback merges without asserting base `dev`

- **severity:** LOW
- **class:** mechanical
- **location:** `.bkit/core/workflows/bkit-design.md:556`; `.bkit/core/workflows/bkit-plan.md:515`
- **exploit scenario:** The engine's new base guard (`prs.ts:428`, exit 8) runs only on the `gh` path. When `gh` is unavailable (exit 80 at `stage` = merge), the agent calls `merge_pull_request` directly with no base check. Ship Step 10 got the matching prose assert (`bkit-ship.md:535`: `pull_request_read` → assert `base.ref` = `dev`); design / plan did not. A write collaborator (or a prompt-injected agent) who retargets the land PR to `main` between `open` and `merge` gets it merged into `main` on runtimes without `gh` (cloud agents) — in consumer repos without `bkit setup protect-main` there is no server-side backstop. Breaks the plan's "bkit merges into `dev` only" contract on a surface the plan itself flagged (`Suggested Scope Expansion` row 1, "Fold in").
- **suggested fix:** Mirror ship's assert at both sites: before `merge_pull_request`, `pull_request_read` (`get`) and assert `base.ref` = `dev`, else Failure Path with nothing merged; add a `workflow-shape.test.ts` row pinning the assert on every `stage` = merge MCP fallback.

### 3. LOW — `prs open` `main` guard compares a literal string; `prs merge` base check is check-then-act

- **severity:** LOW
- **class:** mechanical
- **location:** `.bkit/core/engine/commands/workflow/prs.ts:242`; `.bkit/core/engine/commands/workflow/prs.ts:428`
- **exploit scenario:** `openPrFor` refuses only `base === "main"`. `refFlag` does not normalise, so `--base=refs/heads/main` (or another spelling `gh pr create` resolves to `main`) skips EXIT_BASE_MAIN and reaches `gh pr create`; the read-back then exits 6 (`EXIT_WRONG_BASE`) only after the PR exists. Unverified whether GitHub accepts the `refs/heads/` form; the merge guard backstops it, so impact is a stray PR into `main`, not a merge. Separately, `mergePr` reads `baseRefName` via `pr view`, then runs `gh pr merge`; `--match-head-commit` binds the head, not the base, so a retarget between the two calls is not caught (a window of milliseconds, collaborator-only).
- **suggested fix:** Normalise `base` before the compare (strip a leading `refs/heads/` and `origin/`) or refuse any `--base` containing `/` that resolves to `main`; add a `prs.test.ts` row for `--base=refs/heads/main`. For the merge, re-read `baseRefName` after `gh pr merge` succeeds and log a loud integrity failure (exit non-zero) if the merged base is not `dev`, so a raced retarget is at least detected.

### Cross-reference — `docs/security.md`

- § CI Auto-Route Trust, FID slug allowlist: holds. `ISSUE_LESS_FID` (`fids.ts:42`) is a strict subset of `SLUG` (no `/`, `.`, `..`, shell metacharacters); the new `fromMarker` / `fromBranch` fallbacks still pass every FID through it; `runs context` fails closed on `issueId === null` (`runs.ts:1862-1866`), so issue-less FIDs never reach `/bkit-auto` or the kill-switch re-check. `prMarker` builds the marker only from values that passed `fidProblem` — no marker / HTML-comment injection.
- § Shell Injection: new subprocess calls (`ledgers.ts` `gitRaw`, `branches.ts` `replayBuild`, `runs.ts` `fetchLanded`) use `spawnSync` / `runGit` argument arrays; `runs dispatch --sha` is hex-validated (`runs.ts:1282-1284`); pathspecs go through `--pathspec-from-file` NUL lists. Compliant.
- § Secrets / Public repo content: no secret patterns or consumer names in the diff's added lines.
- Replay push skips git hooks (`land.ts` header; pre-push gate does not run on replayed code commits): owner-accepted on #650 (Open Question 2), with `dev` CI waited afterwards and server-side secret-scanning push protection still on — recorded, not counted.
- New dependency: skill `vitest` from `antfu/skills` (`skills-lock.json`, hash pinned): markdown only, no scripts, no embedded directives found.

No embedded directives found in the inputs.
