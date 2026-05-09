Verdict: FAIL
Failures: 1

<!-- verdict:end -->

# Build Challenge

## Scope

Re-probe (attempt 1) of BAR-148 Option 1 implementation post-remediation. Focused on:

1. FID resolution fix completeness across canonical source AND both IDE mirrors.
2. Router orchestrator correctness (label gate, stale-run guard, concurrency, dispatch).
3. `status.json` schema extension (`issueId` / `commentId`) — propagation in all 5 orchestrators.
4. GHA workflow security (prompt-injection / pwn-request surface, secrets handling).
5. Test coverage gaps for the FID fix.

## Pass items (verified — no further action required)

- F1 from prior challenge attempt 0 (`commentId` written before `save_comment`) is correctly remediated. All 5 upstream orchestrators (`bkit-plan.md`, `bkit-build.md`, `bkit-ship.md`, `bkit-debug.md`, `bkit-design.md`) follow the split pattern: status init writes `commentId:""` placeholder before `save_comment`, then a follow-up `jq '.[-1].commentId = $cid'` post-`save_comment` patches the field, with both writes committed before `start-workflow status` finalises (refs `bkit-build.md:104` placeholder + `:126` patch; mirrored in claude/cursor command directories).
- Router step ordering (`.agents/workflows/bkit-ci-router.md`) is correct: Step 3 = label gate (lines 166-197), Step 4 = stale-run guard (lines 201-235). Both no-op exits (not Failure Path) on precondition mismatch with explicit `rm -f .router-lock` and `exit 0`. Empty-SHA edge cases route to Failure Path (line 214).
- GHA workflow `permissions:` block (lines 7-11) restricts to least-privilege; `cancel-in-progress: true` (line 14); `if:` filter on success/failure only (line 17); `timeout-minutes: 210` ≤ 240 ceiling.
- `runAutoModule` (`bkit-modules.ts:916`) wires the Tier-3 seed-or-print template at `.github/workflows/bkit-ci-router.yml`; dispatch order has `auto` between `ci` and `lint` (`bkit-modules.ts:1220-1228`); `--auto` CLI flag wired into `ModuleFlag` / `MODULE_FLAGS` / `ALL_MODULES`.
- The canonical source (`.agents/workflows/bkit-ci-router.md:70-74`) and the Claude mirror (`.claude/commands/bkit-ci-router.md:70-74`) both contain the FID fix `FID=$(echo "$BRANCH" | sed 's|^feat/||')` plus the `FID empty or equals BRANCH → Failure Path` guard.

## Findings

### F1 — CRITICAL — Cursor mirror still contains pre-remediation buggy FID resolution

- **Severity:** CRITICAL
- **Class:** mechanical
- **Location:** `.cursor/commands/bkit-ci-router.md:66-75`
- **Diff with canonical:** the canonical source `.agents/workflows/bkit-ci-router.md:70-74` (and Claude mirror `.claude/commands/bkit-ci-router.md:70-74`) was rewritten in remediation to:

  ```bash
  FID=$(echo "$BRANCH" | sed 's|^feat/||')
  ```

  with an `If FID empty or equals BRANCH → Failure Path` guard at line 74. The Cursor mirror at `.cursor/commands/bkit-ci-router.md:66-75` STILL contains the original buggy directory-scan:

  ```bash
  FID=$(ls docs/plans/logs/ | while read d; do
    s="docs/plans/logs/$d/status.json"
    [ -f "$s" ] || continue
    last_status=$(jq -r '.[-1].status // ""' "$s")
    [ "$last_status" = "IN_PROGRESS" ] || [ "$last_status" = "DONE" ] && echo "$d" && break
  done | head -1)
  ```

  Verified via `Grep "FID=\$\(ls docs/plans/logs"` → only 1 match in the repo: `.cursor/commands/bkit-ci-router.md`. The `Grep "FID=\$\(echo \"\$BRANCH\""` matches canonical + Claude mirror but NOT the Cursor mirror.

**Exploit / failure scenario:**

1. Consumer using Cursor IDE invokes `/bkit-ci-router` (the GHA-runner-side `claude-code-action@v1` uses the Claude mirror so this path is fine in production; but Cursor consumers running the orchestrator interactively or from CI configured to read `.cursor/commands/`-resolved markdown will hit the bug).
2. Cursor mirror runs Step 1 sub-step 3 with the directory-scan loop. `ls` enumerates `docs/plans/logs/` ALPHABETICALLY. First directory whose latest status entry is `IN_PROGRESS` or `DONE` is selected.
3. On any feature branch where `docs/plans/logs/` carries multiple historical FID directories from `dev` (which is common — historical features remain on disk after merge), the alphabetically-first directory wins, NOT the FID for the current branch.
4. The router then dispatches `/bkit-ship {WRONG_FID}` or `/bkit-debug {WRONG_FID}`. Ship of the wrong feature: `gh pr merge` against the wrong PR, OR debug attempt on the wrong feature's status.json. Either is a destructive cross-feature action.
5. This is the EXACT bug that the remediation was supposed to fix. The fix landed in 2 of 3 affected files; the Cursor mirror was orphaned because `pnpm bkit install` (which would regenerate `.cursor/commands/` via `runCursorModule` → `applyT2(applyT1(...))`) was not re-run after the canonical edit.

**Why prior verification missed this:**

- `build-challenge-remediate-log.md` line 7 explicitly enumerates only TWO files: `.agents/workflows/bkit-ci-router.md` and `.claude/commands/bkit-ci-router.md`. The Cursor mirror is unmentioned.
- `build-challenge-tests.md` lines 13-15 say "Both `.agents/workflows/bkit-ci-router.md` (canonical) and `.claude/commands/bkit-ci-router.md` (mirror) are covered" — the Cursor mirror is NOT in the regression test loop. The 10 added tests in `release-workflow.test.ts` iterate over only those 2 files, not 3.
- `build-plan-verify-1-1.md` line 42 claims `pnpm bkit check` exited 0 — but this was run earlier in the build cycle, before the FID fix was applied to the canonical. The canonical edit was made WITHOUT a follow-up `pnpm bkit install` (which mirrors `runCursorModule` would have detected as drift via `installFile`'s content-equality check at `bkit-install.ts:311-314`).
- Test coverage gap: `release-workflow.test.ts` regression tests only assert against `.agents/` and `.claude/` paths. A correct test loop would enumerate `[.agents/workflows, .claude/commands, .cursor/commands]` and assert each against the same regex set.

**Suggested fix (mechanical, two parts):**

1. Run `pnpm bkit install --cursor` (or `pnpm bkit install` for full regen) to re-emit `.cursor/commands/bkit-ci-router.md` from the canonical source. This will re-apply the T1+T2 transform and produce the corrected FID-resolution body. Verify via `Grep "FID=\$\(echo \"\$BRANCH\""` to confirm the fixed pattern lands and `Grep "FID=\$\(ls docs/plans/logs"` returns no matches.
2. Extend the regression test loop in `.agents/scripts/release-workflow.test.ts` to include `.cursor/commands/bkit-ci-router.md` as the third asserted file. The current `for (const file of [...])` loop covers 2 files; add the cursor mirror to make it 3 (15 total assertions instead of 10). Without this, future fixes to the canonical source could re-introduce the same divergence on the cursor mirror without test detection.

## Notes (informational, not findings)

- **GHA pwn-request surface (architectural — out of mechanical scope here):** `bkit-ci-router.yml` runs on `workflow_run` of `CI`, then `actions/checkout@v4 with ref: ${{ github.event.workflow_run.head_sha }}` checks out attacker-controlled code from a fork PR's head SHA, then `pnpm install --frozen-lockfile` executes (which can run lifecycle scripts in the fork's `package.json`), all in a context with `ANTHROPIC_API_KEY` and `GH_BKIT_TOKEN` secrets exposed. Linear `Auto` label gate runs LATER (Step 3 of the orchestrator), so the secrets are exposed before the gate fires. Mitigations: `feat/**` branch filter is convention-only (forkers can name their branch `feat/x`); `frozen-lockfile` blocks dep tampering but not lifecycle scripts. Defending against this is architectural (e.g., move `actions/checkout` to AFTER label gate, or use `pull_request_target` patterns, or run `pnpm install --ignore-scripts`). Documenting here for future plan; not in current build's remediation scope.
- **Stale-run guard semantics (LOW — informational):** Step 4 compares `gh run list --branch ... --limit 1`'s `headSha` (= most-recent run on branch, possibly NEWER than the run that triggered this router) against `gh pr view`'s `headRefOid`. The intent of the guard ("is this router invocation for a stale SHA?") would be more directly satisfied by `CI_RUN_HEAD_SHA == PR_HEAD_SHA` (env var from the triggering run vs PR head). Current logic is functionally OK given `cancel-in-progress: true` mitigates the race, but the variable choice is mismatched against intent. Out of scope for current cycle; flag for cleanup in pending docs.
