Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 4, 5
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Group 3 — tasks 4, 5 and 6, judged against `build-brief-3-1.md` and `build-diff-3-1.md`.

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None for group 3. The supplied `build-decision-1-{1,2,3}.md` records concern group 1 and accept no group 3 gap.

## Notes

- TASK 4 is satisfied. Source and built `CLOUD_MODES` / `CLOUD_VARIANTS` include codex; both `CLASSIC_VERB_HELP` entries and the generated CLI reference include it. The three named tests passed in `build-tests-green-3-1.md`; the execution log reports 201 parser/CLI tests passed. Independently running `node dist/cli.js install --help` exited 0 and listed codex with the wired-tracker guidance. The required `git grep` for `OPENCODE_PROVIDER_KEY` in `cli.ts` returned no matches. The currency report's additional help-table requirement is implemented. The affected nonplanned CLI-doc assertion was updated to the new supported values and its seven-test suite passed.
- TASK 5 is satisfied. `runCloudModule` uses a variant table and `trackerAdvisoryLines`, reuses `OPENCODE_PROVIDER_DEFAULTS` for the provider key, preserves copy-and-own setup, and records the selected variant. The env template and installed copy contain the commented `BKIT_OPENAI_API_KEY` row. All five named tests passed in the green report; the execution log reports 115 advisory/template tests passed. The real-filesystem integration cases cover the variant/tracker matrix and persisted cloud fact.
- TASK 6 is not satisfied because one required named test is red. The implementation rejects only tracker none, checks Codex/OpenCode prerequisites before package writes, permits a host installed in the same invocation, logs actionable bracket-prefixed errors, and removes the old validator name (the required `git grep` returned no matches). Five of its six named tests passed. The failed test reaches and passes exit 0, Jira tracker and codex cloud assertions before failing at `install.integration.test.ts:883` on `.codex/config.toml`. `install/modules/codex.ts:64` explicitly excludes that retired surface; `runCodexModule` writes `.codex/hooks.json` at lines 160–168. Scratch-install evidence in the execution log agrees. Creating a retired config solely for this assertion is not a valid implementation fix. The planned case remains locked: a code remediation agent cannot rewrite it. The audit's supplied `Fixable: true` is retained; the workflow must resolve the test-contract mismatch through its authorized route.
- Test-first enforcement is active. All 14 planned cases have red evidence; there are no Unproven, Already landed or Updated tests entries to adjudicate. No test-loosened finding is raised. The task 5 vendor-key test changes add expectations. Group and task counts are within the supplied caps.
- Every Derived Test Matrix row for tasks 4–6 maps to a named test in its task's DONE WHEN. Documentation Updates rows belong to later tasks or ledger writers; none adds an unfinished documentation requirement to this group. Relevant architecture, security, testing, observability and workflow contracts were checked. No database or new external request boundary is introduced by this group.
- Generation and the three fresh-consumer dogfood scenarios are recorded as successful in `build-plan-tasks-3-log.md`. The mandatory broader verification remains incomplete: the changed gate was cancelled with exit 130 after its named stage stalled. Related tests reported 5167 passing and two failing; the CLI-doc failure was subsequently fixed and retested, while the planned Codex case remains red. Named-stage completion and static checks are unverified. `docs/failures.jsonl` records `lib-output-limit-fixture-git-stdin-stall`; that record does not discharge the check. No full gate was repeated in this verification. Independent `git diff --check` exited 0.

## Identified Gaps Log

TASK 6: `.bkit/core/engine/commands/install/install.integration.test.ts` `--tracker=jira --codex --auto=codex exits 0 and records codex` — not-green — Fixable: true

TASK 6: `build-plan-tasks-3-log.md` required changed gate — incomplete-verification: cancelled exit 130 after the named stage stalled in `.bkit/core/engine/commands/lib.test.ts:704` synchronous Git fixture; no completed named-stage or static result exists. Resolve the recorded fixture/check blockage and obtain a completed passing required gate; the failure ledger alone does not satisfy verification — Fixable: true
