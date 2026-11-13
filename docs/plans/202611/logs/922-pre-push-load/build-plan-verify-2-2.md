Verdict: CONCERNS
Failures: 1
Fixable: true
Tasks: 4
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

## Notes

- Mode: Group. Judged TASK 4 and TASK 5 (`build-brief-2-1.md`) against `build-diff-2-2.md`. The brief has no `Deviations` section.
- Decision record `build-decision-1-1.md` (Status: DECIDED): the owner answered "Fix now — fix now for both" to Q1 (Task 4) and Q2 (Task 5), so both tasks are "build the fix", not owner-only gaps.
- Earlier gap 1 (TASK 4) is closed: `.bkit/core/.bkit/workflows.md:1184` now carries the "pre-push hook blocks the first push" wording, and its line is identical to the mirror `.bkit/workflows.md:1184`.
- Earlier gap 2 (TASK 5) is closed for the advisory: `runPostInstallCheck` skips `detectGhMcpToken` when `BKIT_PRE_PUSH_LOGGED` is set, with a test, and `dist/checks/after/index.js` matches. The `gh-mcp` setup tip carries the same false message and is logged as the one open gap.
- Earlier gap 3 (TASK 5) is closed: the `docs/decisions.jsonl` row `922-pre-push-gate-env-unsets-bkit-env-keys` (updates 2) describes the unset loop and lists `.bkit/core/.bkit/templates.md`. Its new sentence on `bkit check` staying quiet is wrong while the tip fires (part of the open gap).
- TASK 4 is satisfied: `allowDirenv` (`.bkit/core/engine/commands/workflow/worktrees.ts:645-667`) narrates "push will block" for a differing and for a failed `direnv allow`, `dist/` is rebuilt, the source and the mirror of `.bkit/workflows.md` § Worktree Setup match, and the test `setup with an .envrc differing from the main checkout's reports that the push will block` passes.
- TASK 5 is left off `Tasks` for the open gap only. Both hook copies carry the same unset loop, the source and the mirror of `templates.md` § Git hooks match (they differ only in the managed marker line), and the test `trusted .envrc → .bkit/.env tooling keys do not reach the gate` passes.
- Test-first audit (`build-tests-green-2-2.md`): Enforced: true, Verdict PASS, Gaps 0, Unproven 0. Both tests went red, then green. There is no `Updated tests` or `Already landed` section.
- Re-ran `vitest run` on `worktrees.integration.test.ts`, `husky-pre-push.integration.test.ts` and `checks/after/index.test.ts`: 3 files, 224 tests passed.
- Out of scope, proposed separately: in this worktree `bkit check` also prints the `pre-push-direnv` tip, although `.husky/pre-push` here contains `direnv exec`. The main checkout's `.husky/pre-push` on dev does not, so the tip may be reading a different root. That is group 1 (TASK 2) territory and was not investigated further.
- No `Derived Test Matrix` row maps to group 2; both tasks come from the challenge round. `docs/observability.md` adds nothing for a shell hook, a narration change and an advisory guard.

## Identified Gaps Log

Gaps: 1

- TASK 5: the gap-2 fix silences only the `gh-mcp-token-unset-shell` advisory (`runPostInstallCheck` in `.bkit/core/engine/checks/after/index.ts:112`); the `gh-mcp` setup tip (`.bkit/core/engine/checks/tips/catalogue.ts:156`, `fires` calls `detectGhMcpToken` directly) still fires inside the hook's inner run, so every push in a repo with a `.bkit/.env` and a `github` MCP server writes "bkit has no GitHub token ... Add my GitHub token as `BKIT_GH_TOKEN` in .bkit/.env" under "For an AI agent: follow each tip's Agent steps" into `tmp/pre-push.log` (reproduced: `env -u BKIT_GH_TOKEN BKIT_PRE_PUSH_LOGGED=1 node dist/cli.js check` prints tip 1 `gh-mcp`; with `BKIT_GH_TOKEN` set it does not). The `docs/decisions.jsonl` row `922-pre-push-gate-env-unsets-bkit-env-keys` (updates 2) also claims "bkit check stays quiet about BKIT_GH_TOKEN there", which is false while the tip fires. Fix: make the `gh-mcp` tip's `fires` skip when `BKIT_PRE_PUSH_LOGGED` is set (same guard as the advisory), with a test in `.bkit/core/engine/checks/tips/catalogue.test.ts`, then rebuild `dist/`. — Fixable: true
