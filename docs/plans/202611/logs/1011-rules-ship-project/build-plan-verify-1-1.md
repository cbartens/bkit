Verdict: PASS
Failures: 0
Fixable: false
Tasks: 1, 2, 3
Loosened: none
Fingerprint: 82227e9a966b72304efac38886c4c1dedc1b356f23feac096713a4b4993a08bf
<!-- verdict:end -->

# Plan Verification

## Scope

Group 1

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- TASK 1: `git grep -c "^## Project Goals$" -- .bkit/core/.agents/rules.md` prints 1; the header box line and the commented-example `## Project Goals` section sit between `## Project Rules` and `## Project Settings`. `.bkit/core/engine/audits/repo/rules-sync.test.ts` passes in full, including the new heading-order test and the planned comment-stripping update to `the template ships NO project rules below bkit:end — only the empty group scaffold` (the brief's UPDATE line directs that change, so it is not a loosening).
- TASK 2: clause `rules-leaf` in `.bkit/instructions.md` carries the new sentence and the old one sits in its `retired` block; `git grep -l "break ties by its" -- .bkit/core/prompts` lists 40 of 40 files; `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` prints nothing and exits 0.
- TASK 2 test: `.bkit/core/engine/tools/instructions.test.ts` `rules-leaf reads only below bkit:end, breaks ties by Project Goals and skips Orchestrator Rules` replaces one exact `toBe` with three `toContain` checks. Judged against the Derived Test Matrix row (reads below `bkit:end`, breaks ties by `Project Goals`, skips `Orchestrator Rules`): each of the three behaviours is asserted, and the full sentence stays pinned by the sync check that every prompt matches the clause byte for byte. No gap.
- TASK 2 DONE WHEN names the grep and the sync tool, not the matrix test; the test is named in the task's TEST FIRST, was proved red and now passes (`build-tests-green-1-1.md`), so the row's test exists and passes. Plan wording only, no code gap.
- TASK 3: the `Central agent rules` row in `.bkit/core/.bkit/prompts.md` and entry `central-agent-rules-rules-bullet` in `.bkit/instructions.md` carry the same new text; the old sentence is found only at `.bkit/instructions.md:2577-2578`, inside the `retired` block that opens at line 2576. All three `Documentation Updates` rows are done (`.bkit/prompts.md` refreshed by upgrade).
- Tests: `rules-sync.test.ts`, `instructions.test.ts` and `instructions-coverage.test.ts` run together: 143 of 143 pass.
- Test-first audit (`build-tests-green-1-1.md`): `Enforced: true`, 0 gaps, 0 unproven, no Taken over / Changed by a code step / Updated tests / Already landed sections.
- The group diff also holds the re-rendered installed copies (`.agents/rules.md` header box, `.bkit/prompts.md`, `.bkit/version`, 40 files each under `.agents/plugins/bkit/agents`, `.claude/agents`, `.codex/agents`, `.cursor/agents`, `.opencode/agents`). That is part of TASK 5's work landing early; the rules-sync gate needs the installed managed block to match the template, and nothing below `bkit:end` changed in `.agents/rules.md`. No gap.
- No supplied decision records, earlier verify reports or remediation logs. No error-handling code in this group, so `docs/observability.md` does not apply.

## Identified Gaps Log

0 gaps.
