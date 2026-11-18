Enforced: true
Verdict: null
Gaps: 3
Unproven: 1

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
| 3 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "keeps one progress comment when the status file moves to the main checkout" | vacuous | passed |
| 3 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "keeps one progress comment across checkouts for a run started with no session" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tracker.test.ts` "runActionKey names the latest run after it ended" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "joins the run's progress comment with the Owner Answers after workflows close" | red | passed |
| 4 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "keeps two Owner Answers rounds in one comment after a terminal close comment" | red | passed |
| 7 | `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "keeps one progress comment when the status file moves to the main checkout" | taken-over | passed |
| 5 | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` "plan and design post the Owner Answers comment with the run's status file before the round's commit" | red | passed |

## Gaps

- Task 3 `delete-still-referenced` — DELETE `bindRunPublication` in `.bkit/core/engine/commands/workflow/tracker.ts` is still referenced: `docs/decisions.jsonl:948`, `docs/decisions.jsonl:951` — Fixable: null — log: TASK 3: delete-still-referenced — Fixable: null
- Task 3 `delete-still-referenced` — DELETE `runPublicationFile` in `.bkit/core/engine/commands/workflow/tracker.ts` is still referenced: `docs/decisions.jsonl:948`, `docs/decisions.jsonl:951` — Fixable: null — log: TASK 3: delete-still-referenced — Fixable: null
- Task 4 `delete-still-referenced` — DELETE `endedRunActionKey` in `.bkit/core/engine/commands/workflow/tracker.ts` is still referenced: `docs/decisions.jsonl:950` — Fixable: null — log: TASK 4: delete-still-referenced — Fixable: null

## Taken over

- Task 7 `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "keeps one progress comment when the status file moves to the main checkout" — taken over from Task 3; changed hands and passes after the rewrite: not proven failing, and never a gap

  ```diff
     it("keeps one progress comment when the status file moves to the main checkout", () => {
       const dir = session();
       const linked = path.join(root, "moved-worktree");
       git(cwd, "worktree", "add", "-q", "-b", "feat/moved", linked);
       start(linked, dir);
       report(linked, "Worktree Setup", { file: REL, number: 2 });
       write(path.join(cwd, REL), fs.readFileSync(path.join(linked, REL), "utf8"));
       report(cwd, "Plan Execute", { file: REL, number: 7 });
       expect(remote().comments).toHaveLength(1);
       expect(remote().comments[0]?.body).toContain("Worktree Setup");
       expect(remote().comments[0]?.body).toContain("Plan Execute");
       const events = rows(cwd).filter((row) => row.type !== "engine-action") as StatusEvent[];
       expect(lastRun(fold(events), "build")?.status).toBe("IN_PROGRESS");
     });
  ```


## Unproven

- Task 3 `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` "keeps one progress comment when the status file moves to the main checkout" — the tests step left it as `vacuous`, not red; the owner answers it at the end of the build
