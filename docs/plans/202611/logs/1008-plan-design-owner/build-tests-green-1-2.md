Enforced: true
Verdict: null
Gaps: 4
Unproven: 0

<!-- verdict:end -->

# Test-First Audit

Plan: `docs/plans/202611/1008-plan-design-owner-plan.md`

<!-- prettier-ignore -->
| Task | Test | Red | Green |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/ledgers/status.test.ts` "carries the workflow-started progress link onto its run" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/repo.test.ts` "writes a random progress id into each new session folder" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "gives two session folders holding the same progress id the same link" | red | passed |
| 2 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "throws for a session folder whose progress id is missing or empty" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "start with --session-dir writes the session's link as progress on the workflow-started row" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "a resumed start with another session keeps the run's first link" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/workflows.test.ts` "start with a session folder that holds no progress id writes the row without progress and records association friction" | red | passed |
| 3 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "keeps one progress comment when the status file moves to the main checkout" | red | not passed |
| 3 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "keeps one progress comment across checkouts for a run started with no session" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "runActionKey names the latest run after it ended" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "joins the run's progress comment with the Owner Answers after workflows close" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "keeps two Owner Answers rounds in one comment after a terminal close comment" | red | passed |

## Gaps

- Task 3 `not-green` — "keeps one progress comment when the status file moves to the main checkout" failure: expected 'engine-action' to be 'workflow-started' // Object.is equality — Fixable: true — log: TASK 3: `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `keeps one progress comment when the status file moves to the main checkout` — not-green — Fixable: true
- Task 3 `delete-still-referenced` — DELETE `bindRunPublication` in `.bkit/core/engine/commands/workflow/tracker.ts` is still referenced: `docs/decisions.jsonl:948`, `docs/decisions.jsonl:951` — Fixable: null — log: TASK 3: delete-still-referenced — Fixable: null
- Task 3 `delete-still-referenced` — DELETE `runPublicationFile` in `.bkit/core/engine/commands/workflow/tracker.ts` is still referenced: `docs/decisions.jsonl:948`, `docs/decisions.jsonl:951` — Fixable: null — log: TASK 3: delete-still-referenced — Fixable: null
- Task 4 `delete-still-referenced` — DELETE `endedRunActionKey` in `.bkit/core/engine/commands/workflow/tracker.ts` is still referenced: `docs/decisions.jsonl:950` — Fixable: null — log: TASK 4: delete-still-referenced — Fixable: null

## Runner output — `.bkit/core/engine/commands/workflow/tracker.integration.test.ts`

```
     ✓ preserves substantive step results under a append comment boundary fault 4260ms
     ✓ preserves substantive step results under a create comment boundary fault 4168ms
     ✓ preserves substantive step results under a reconciliation comment boundary fault 4527ms
     ✓ preserves substantive step results under a diagnostic comment boundary fault 4792ms
     ✓ keeps clean build progress and completion to two comments 6858ms
     ✓ preserves legacy receipts issue less skips and exact fallback through resume 4402ms
     ✓ an ad-hoc comment with no run proof exits 2 and reaches no tracker 558ms
     ✓ accepts a session minted in the main checkout from a linked worktree 1393ms
     × keeps one progress comment when the status file moves to the main checkout 2540ms
     ✓ keeps one progress comment across checkouts for a run started with no session 1997ms
     ✓ joins the run's progress comment with the Owner Answers after workflows close 3825ms
     ✓ keeps two Owner Answers rounds in one comment after a terminal close comment 4364ms
     ✓ a --file post whose status file holds no run of the workflow exits 2 1424ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/tracker.integration.test.ts > workflow comment lifecycle across real CLI processes > keeps one progress comment when the status file moves to the main checkout
AssertionError: expected 'engine-action' to be 'workflow-started' // Object.is equality

Expected: "workflow-started"
Received: "engine-action"

 ❯ .bkit/core/engine/commands/workflow/tracker.integration.test.ts:800:36
    798|     expect(remote().comments[0]?.body).toContain("Worktree Setup");
    799|     expect(remote().comments[0]?.body).toContain("Plan Execute");
    800|     expect(rows(cwd).at(-1)?.type).toBe("workflow-started");
       |                                    ^
    801|   });
    802|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 27 passed (28)
   Start at  21:20:43
   Duration  103.20s (tests 100%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-Q2zunP/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
