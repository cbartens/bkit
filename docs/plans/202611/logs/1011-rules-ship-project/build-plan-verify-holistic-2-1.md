Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3, 4, 5
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

2 of 2 (plan group count: 2).

## Integration Gaps

0. The groups fit together:

- Template and tip agree. The `## Project Goals` section in `.bkit/core/.agents/rules.md` (lines 184-192) holds only an intro sentence and commented examples, and `hasNoProjectGoals` in `.bkit/core/engine/checks/tips/detect.ts` strips HTML comments below `bkit:end`, so a fresh install fires the tip until the owner adds a bullet. The tip's `ask` names the same placement as the template and the header box line (between Project Rules and Project Settings).
- Clause and docs agree. Clause `rules-leaf`, the 40 prompt sources, the 200 installed copies (40 each in `.claude/agents`, `.cursor/agents`, `.opencode/agents`, `.codex/agents`, `.agents/plugins/bkit/agents`), the `Central agent rules` row in `.bkit/core/.bkit/prompts.md` and `.bkit/prompts.md`, and entry `central-agent-rules-rules-bullet` all carry the same sentence.
- The tip's `steps` pointer (`.bkit/prompts.md` § Special Behaviors) resolves to the row group 1 rewrote, and that row names `Project Goals`.
- bkit's own `.agents/rules.md` keeps its filled `## Project Goals` (line 209), and only its header box changed; `node dist/cli.js tips --all` in this repo does not list `project-goals`.

## Previously Attempted

None (holistic attempt 1). Group reports: `build-plan-verify-1-1.md` (PASS, tasks 1-3), `build-plan-verify-2-1.md` (PASS, tasks 4-5).

## Notes

- Docs: `.agents/docs.md` read; `docs/testing.md` and `docs/observability.md` present. No task adds an error path or log line, so observability does not apply. All tests are unit tier; no task crosses a DB, API, network or migration boundary.
- TASK 1: `git grep -c "^## Project Goals$" -- .bkit/core/.agents/rules.md` prints 1; headings below `bkit:end` run Project Rules (178), Project Goals (184), Project Settings (194).
- TASK 2: `git grep -l "break ties by its" -- .bkit/core/prompts` lists 40 of 40 files; `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` prints nothing and exits 0.
- TASK 3: the old sentence appears only at `.bkit/instructions.md:2577-2578`, inside the `rules-leaf` `retired` block. All three `Documentation Updates` rows are done.
- TASK 4: `hasNoProjectGoals` and the `project-goals` entry are present, and `dist/checks/tips/detect.js` and `dist/checks/tips/catalogue.js` carry them (commit c3fc44134). The `steps` deviation from the issue's target table, judged in `build-plan-verify-2-1.md`, stands: the issue's `.agents/rules.md` pointer would fail `every docs pointer in steps resolves to a heading`.
- TASK 5: `node dist/cli.js check` exits 0. A scratch-repo probe with `node dist/cli.js tips --all` matched the plan: the tip fired with no `## Project Goals` heading, fired with the shipped commented starter, and stayed quiet once the section held one `- ` bullet. `.bkit/core/engine/install/write.test.ts` (`preserves consumer content above AND below the block`) passes 85/85. The verifier ran no tarball install, because its mandate forbids installs; that part rests on the execute log in `build-plan-tasks-2-log.md`.
- Tests run together: `rules-sync.test.ts`, `instructions.test.ts`, `instructions-coverage.test.ts`, `catalogue.test.ts`, `detect.test.ts` pass 256/256. Group 1's gate (`build-group-gate-1-1.md`) passed every stage. Group 2 has no group gate (it is the last group), so the holistic gate covers the full suite.
- Derived Test Matrix: rows 1 and 3-5 are covered by the files named in TASK 1 and TASK 4 `DONE WHEN`. The row 2 test (`instructions.test.ts`) is named in TASK 2's `TEST FIRST`, not its `DONE WHEN`. It exists, was proved red and passes, so this is plan wording only and not a code gap (same call as `build-plan-verify-1-1.md`).
- Test-first audits: `build-tests-green-1-1.md` and `build-tests-green-2-1.md` are both Enforced true with 0 gaps and 0 unproven tests, and have no Taken over, Changed by a code step, Updated tests or Already landed sections.
- The run diff also holds an orchestrator row in `.bkit/friction.jsonl` and `.bkit/version` hash updates; neither is task work.
- No decision records and no remediate logs exist for this run.
- Out-of-scope proposal: `hasNoProjectGoals` counts only `- ` bullets, while the `rules-sync.test.ts` heading test treats `-` or `*` as a bullet. A goal written as `* ` would leave the tip firing. Every bkit rules file uses `- `, so this is not a gap here.

## Identified Gaps Log

None
