Verdict: PASS
Failures: 0
Fixable: false
Tasks: 4, 5
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

- `build-plan-verify-2-1.md`: CONCERNS, 3 gaps, all `Fixable: true`. `build-plan-gaps-remediate-2-1-log.md` closed all 3 (Fixed: 3, group gate exit 0).
- `build-plan-verify-2-2.md`: CONCERNS, 1 gap (TASK 5, the `gh-mcp` setup tip fired inside the hook's inner run), `Fixable: true`. `build-plan-gaps-remediate-2-2-log.md` closed it (Fixed: 1, group gate PASS).

## Notes

- Mode: Group. Judged TASK 4 and TASK 5 (`build-brief-2-1.md`) against `build-diff-2-3.md`. The brief has no `Deviations` section.
- Decision record `build-decision-1-1.md` (Status: DECIDED): the owner answered "Fix now — fix now for both" to Q1 (Task 4) and Q2 (Task 5), so both tasks are "build the fix", not owner-only gaps.
- The gap from attempt 2 is closed: the `gh-mcp` tip's `fires` in `.bkit/core/engine/checks/tips/catalogue.ts:166-169` skips the token branch when `BKIT_PRE_PUSH_LOGGED` is set, the test `gh-mcp stays quiet about the token inside the pre-push hook's inner run` in `catalogue.test.ts` passes, and `dist/checks/tips/catalogue.js` matches. Both callers of `detectGhMcpToken` (`checks/after/index.ts:366`, `checks/tips/catalogue.ts:169`) now carry the guard.
- Reproduced against `dist/`: `env -u BKIT_GH_TOKEN BKIT_PRE_PUSH_LOGGED=1 node dist/cli.js check` prints neither the `gh-mcp-token-unset-shell` advisory nor the `gh-mcp` tip; without `BKIT_PRE_PUSH_LOGGED` the advisory still prints, so a real missing token is still reported outside the hook. The `BKIT_GH_TOKEN` mentions that remain (`cursor-gui-isolation`, `tracker-setup-github`) also print when the token is set, so they do not claim a token is missing.
- The `docs/decisions.jsonl` row `922-pre-push-gate-env-unsets-bkit-env-keys` (updates 2) now holds: it describes the unset loop, lists `.bkit/core/.bkit/templates.md`, and its sentence "bkit check stays quiet about BKIT_GH_TOKEN there" matches the behaviour.
- TASK 4 is satisfied: `allowDirenv` (`.bkit/core/engine/commands/workflow/worktrees.ts:645-667`) narrates "push will block" for a differing `.envrc` and for a failed `direnv allow`, exit stays 0, `dist/commands/workflow/worktrees.js` matches, line 1184 of `.bkit/core/.bkit/workflows.md` and the mirror `.bkit/workflows.md` are identical, and the test `setup with an .envrc differing from the main checkout's reports that the push will block` passes.
- TASK 5 is satisfied: both hook copies (`.bkit/templates/.husky/pre-push`, `.husky/pre-push`) carry the same unset loop at the top of the inner run (they differ elsewhere only in the bkit-repo-only blocks), the source and the mirror of `templates.md` § Git hooks carry the same sentence, the decision is recorded, and the test `trusted .envrc → .bkit/.env tooling keys do not reach the gate` passes for both hooks.
- Test-first audit (`build-tests-green-2-3.md`): Enforced: true, Verdict PASS, Gaps 0, Unproven 0. Both tests went red, then green. There is no `Updated tests` or `Already landed` section.
- Re-ran `vitest run` on `worktrees.integration.test.ts`, `husky-pre-push.integration.test.ts`, `checks/after/index.test.ts` and `checks/tips/catalogue.test.ts`: 4 files, 288 tests passed.
- No `Derived Test Matrix` row maps to group 2; both tasks come from the challenge round. `docs/observability.md` adds nothing for a shell hook, a narration change and two advisory guards.
- Out of scope, proposed separately (repeats attempt 2's note): in this worktree `bkit check` still prints the `pre-push-direnv` tip although `.husky/pre-push` here contains `direnv exec`. That is group 1 (TASK 2) territory and was not investigated further.

## Identified Gaps Log

None
