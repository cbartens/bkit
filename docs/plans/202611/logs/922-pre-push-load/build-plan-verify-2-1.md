Verdict: CONCERNS
Failures: 3
Fixable: true
Tasks: none
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 2

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Mode: Group. Judged TASK 4 and TASK 5 (`build-brief-2-1.md`) against `build-diff-2-1.md`. The brief has no `Deviations` section.
- Decision record `build-decision-1-1.md` (Status: DECIDED): the owner answered "Fix now — fix now for both" to Q1 (Task 4) and Q2 (Task 5). That answer moves both tasks from "the owner decides" to "build the fix", so neither is an owner-only gap now.
- TASK 4: the code half is done. In `allowDirenv` (`.bkit/core/engine/commands/workflow/worktrees.ts:645-667`), a differing `.envrc` and a failed `direnv allow` both narrate "push will block", exit stays 0, and `dist/` was rebuilt. The test `setup with an .envrc differing from the main checkout's reports that the push will block` exists and passes. The task is left off `Tasks` only because the `.bkit/workflows.md` reword landed in the mirror, not in its source (gap 1).
- TASK 5: the owner picked "Fix now" but not which fix, although Q2 asked "say which". The build step chose the first option offered (unset the tooling keys before the inner run), widened to every key named in `.bkit/.env`. That stays inside the owner's answer, so it is no gap. Both hook copies carry the same block, `.bkit/core/.bkit/templates.md` § Git hooks matches it, and the test `trusted .envrc → .bkit/.env tooling keys do not reach the gate` exists and passes for both hooks. The task is left off `Tasks` for gaps 2 and 3.
- Test-first audit (`build-tests-green-2-1.md`): Enforced: true, Verdict PASS, Gaps 0, Unproven 0. Both tests went red, then green. There is no `Updated tests` or `Already landed` section.
- Re-ran `vitest run` on `worktrees.integration.test.ts` and `husky-pre-push.integration.test.ts`: 2 files, 170 tests passed. No other test or source still asserts the old "read it, then run direnv allow" message.
- Advisory, not a gap: `.bkit/templates.md` (the mirror) still lacks the Task 5 sentence that the source `.bkit/core/.bkit/templates.md:293` gained. Per `.agents/rules.md` § Install to mirror, that is the end-of-session `bkit upgrade` step.
- No `Derived Test Matrix` row maps to group 2; both tasks come from the challenge round. `docs/observability.md` adds nothing for a shell hook and a narration change.

## Identified Gaps Log

Gaps: 3

- TASK 4: `.bkit/workflows.md` § Worktree Setup (line 1184) was reworded in the installed mirror only; the source `.bkit/core/.bkit/workflows.md:1184` still says "A differing `.envrc`, direnv missing or failing → narrated, never fatal; a human reads it and runs `direnv allow`", so the next `bkit upgrade` re-renders the mirror from the source and drops the "push will block" wording the DONE WHEN requires. Fix: apply the same reword to `.bkit/core/.bkit/workflows.md`. — Fixable: true
- TASK 5: the new unset loop in `.bkit/templates/.husky/pre-push:56-62` and `.husky/pre-push:56-62` runs before `pnpm bkit check` (`.bkit/templates/.husky/pre-push:197`), so in any repo with a `github` MCP server every local push now logs the false `gh-mcp-token-unset-shell` advisory ("BKIT_GH_TOKEN is not set ... Set BKIT_GH_TOKEN in .bkit/.env") into `tmp/pre-push.log`, telling the agent that reads it to set a token that is already set (reproduced: `env -u BKIT_GH_TOKEN node dist/cli.js check` prints advisory 8/15 `gh-mcp-token-unset-shell`; `detectGhMcpToken` in `.bkit/core/engine/checks/after/auth.ts:56`). Fix without reopening the decision: keep the keys unset for the gate and have the advisory stay quiet inside the hook's inner run (e.g. skip when `BKIT_PRE_PUSH_LOGGED` is set), with a test. — Fixable: true
- TASK 5: the `docs/decisions.jsonl` row `922-pre-push-gate-env-unsets-bkit-env-keys` says the hook "runs the gate as direnv exec . env -u KEY ... sh", but the hook copies unset the keys with a `for gate_key in $(sed ...)` loop at the top of the inner run; the DONE WHEN requires the hook copies to match the recorded decision, and its `references` omit `.bkit/core/.bkit/templates.md`. Fix: append an updated row (same key, `updates` +1) whose description matches the shipped mechanism. — Fixable: true
