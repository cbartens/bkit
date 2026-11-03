Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 1: Split Branch Sync and Plan Convert into Steps 3 and 4 and renumber the build to sixteen steps — 16 headings (Step 3 Branch Sync keeps only `branches sync --merge-docs`, new Step 4 Plan Convert holds the plan check, the `@bkit-build-plan-convert` dispatch and the re-check, Steps 4→5…15→16 shift), WORKFLOW_STEPS.build 1-16 with `build-plan-convert` at 4 titled Plan Convert and `resumeAt: "build-plan-convert"`, 8 new tests plus the regenerated `bkit-build.none.txt` baseline, 9 reds recorded, the four DONE WHEN suites pass (451 tests) and `pnpm bkit:gate:static` passes (.bkit/core/workflows/bkit-build.md, .bkit/core/engine/commands/workflow/step-table.ts, .bkit/core/engine/commands/workflow/step-table.test.ts, .bkit/core/engine/audits/workflows/workflow-shape.test.ts, .bkit/core/engine/render/**snapshots**/bkit-build.none.txt, docs/knowledge.jsonl)

## Carry-overs

<!-- prettier-ignore -->
| Item | State after this task | Owner |
| --- | --- | --- |
| `.bkit/instructions.md` local entries for `bkit-build` | 32 entries quote lines the renumbered workflow no longer holds, so `pnpm vitest run .bkit/core/engine/tools/instructions-coverage.test.ts` fails with `local entry no longer in the file`; `pnpm instructions:sync` exits 1 and does not drop them (only a hand rewrite of the file's `- source:` block does) | TASK 3 (its Documentation Updates row and `.bkit/instructions.md` UPDATE) |
| Red evidence for the five `workflow-shape.test.ts` tests | Reds 1-5 were recorded against the file as written, then the file was refactored onto a module-level helper to satisfy `vitest(no-conditional-in-test)` in `bkit:gate:static`; `bkit tests green` therefore reports `test-changed` for those five, `testOrderOnly: true` — the assertions are unchanged in substance | owner decision at the Decision Pause (TEST EXCEPTION) |
| Red 9 (`bkit-build: the none render matches its baseline byte for byte`) | Recorded after the workflow edit and before `vitest -u`: a baseline test cannot fail before the source it snapshots changes | none — recorded, then the baseline regenerated |
| `build-brief-1-1.md`, `build-tests-green-1-1.md` | `pnpm format:check` flagged both run artefacts; reformatted with prettier, no content change | none |
| Whole suite | 7854 pass; the only failure is `instructions-coverage.test.ts` above (three `resolve-push-base` / `ci-scripts` / `runs` files that failed once under full-suite load pass on their own and on the re-run) | TASK 3 |

Flags moved to the end of every build `steps finish` line (`--message` last) so each `--title` is followed by a flag, which the number/title test's boundary check needs; no flag changed value.
