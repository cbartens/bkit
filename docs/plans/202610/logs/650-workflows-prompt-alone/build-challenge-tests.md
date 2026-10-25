Verdict: PASS

<!-- verdict:end -->

# Build Challenge Testing

Run by the orchestrator in place of `@bkit-build-challenge-tests` (human instruction 2026-10-23: finish 650 without further subagents). The Step 12 remediate commit `5cd42f91` added a regression test for every finding in `build-challenge.md`; this step checked each finding against its tests and found no missing edge case, so it adds no new test file.

<!-- prettier-ignore -->
| Finding | Regression test(s) |
| --- | --- |
| 1 dev push with local `dev` behind `origin/dev` | `shared-checkout.integration.test.ts` "a local dev one remote commit behind origin/dev lands by replay, not a rejected push" |
| 2 record bound to FID, fail closed | `shared-checkout.integration.test.ts` "with the record gone, the dev push refuses…", "two records on dev: each push selects its own FID's commits"; `branches.test.ts` "refuses a dev push with no shared-checkout record (exit 20)…"; `runs.test.ts` "re-trigger on dev without a record…", "re-trigger on dev only uses the record of its own FID"; `steps.test.ts` "writeStepRow exits 14…"; `workflows.test.ts` "close exits 14…", "a second run's record does not let this FID's close commit"; `worktrees.test.ts` "setup refuses with EXIT_SHARED_BUSY for a closed run…", "setup refuses while another setup holds the guard…" |
| 3 re-trigger head re-held as `{DEV_SHA}` | `ci-dispatch-gate-alignment.test.ts` "debug Step 11 on dev pushes its own record and re-holds the dispatched head" |
| 4 no ledger row before the own-path refusal | `steps.test.ts` "writeStepRow refuses when a recorded path changed" (no row, re-run writes one); `workflows.test.ts` "close exits 10 when a recorded path changed during the run, writing no row and committing nothing" |
| 5 `--issue` must match the FID's id | `fids.test.ts` "check --issue=N requires the FID to embed that same issue"; `steps.test.ts` "gate --fid=123-foo --issue=456 fails…"; `prs.test.ts` "a marker with an issue needs the FID to embed that same issue" |
| 6 branch FID verbatim, issue via `.bkit/issues.jsonl` | `fids.test.ts` "fromBranch with the repo's known issue ids" (links a known id, takes any slug verbatim, refuses a non-slug), "featureIssueIds", "a branch with no issues.jsonl at all is issue-less", "a feature row for another issue does not link…"; `workflow-shape.test.ts` "the fids parse routes: hit, no issue, non-slug STOP"; `wording.test.ts` clause rows |
| 7 repeated mint takes a free `-b`, `-c` | `fids.test.ts` "bkit fids free" (7 rows: unused name, `-b` then `-c` across month buckets, IN_PROGRESS continues, exit 1, exit 5); `wording.test.ts` "the repeated issue-less mint clauses route through fids free" |
| 8 design / plan MCP merge asserts base `dev` | `workflow-shape.test.ts` `it.each(["design", "plan"])` base-assert row |
| 9 `main` guard spellings, merge base re-read | `prs.test.ts` `it.each(["refs/heads/main", "origin/main", "heads/main", "refs/remotes/origin/main"])`, "prs merge fails loudly when the base changed between the check and the merge" |
| 10 short `--sha` refused | `runs.test.ts` `it.each(["abc1234", …39 hex])` |
| 11 prefix hash with eol filter | `ledgers.test.ts` "a recorded ledger under an eol attribute still commits only the run's rows" |
| 12 user-staged ledger keeps run rows | `ledgers.test.ts` "a ledger the user staged before the run keeps their rows in the index after the run's commit" |

Runs: `pnpm exec vitest run` on the 12 changed test files → 1048 passed; `pnpm bkit:gate:static-unit-integration` exit 0 (integration: 46 files, 1527 tests).

## Blockers

None

## Bugs Discovered

None
