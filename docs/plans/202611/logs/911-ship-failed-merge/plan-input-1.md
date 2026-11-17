## Session Prompt — this run's, newer than everything below

/bkit-plan #911

## Issue description — oldest

### Failing test or CI run

none yet. Both defects were found by reading `.bkit/core/workflows/bkit-ship.md`. Neither has been seen in a run.

### What happened

`/bkit-ship` has two steps for a merge that fails: Step 11 — Failure Diagnose (an agent works out why) and Step 12 — Failure Remediate (an agent applies the fix). Read as written, they cannot do their job, for two separate reasons.

**1. No route leads to them.** Every route out of Step 10 — Merge Gate + Merge PR goes somewhere else (`bkit-ship.md:764-783`):

- merged → Step 13;
- the gate asks for a new CI run → Step 9;
- the branch needs the base merged in → Step 3;
- the limit is used up → the Merge Question or the Failure Path;
- anything else → the Failure Path.

Line 783 says it outright: "Recoverable merge refusals never enter Steps 11–12." No step routes to Step 11. Step 12 is named only by Step 11 and by the Resume rule in the header (`bkit-ship.md:42`). So the only way in is a resumed run whose last finished step happens to be 10 or 11.

A run that arrives that way is missing what Step 11 needs. Its sub-step 3 (`bkit-ship.md:861`) tests `MERGE_ASK` and narrates `MERGE_ROUNDS` and `MERGE_MAX`. Only Step 10's `counters route` call sets those three, and a resumed run does not hold them.

**2. Step 11 starts the diagnose agent without a value it requires.** The Context that Step 11 hands to `bkit-debug-failure-diagnose` names no `Strategy` (`bkit-ship.md:851-854`). The agent's prompt says what to do then (`.bkit/core/prompts/bkit-debug-failure-diagnose.md:67`): set `Verdict` = `FAIL`, change no other file, and return. So the diagnosis file comes back with every section still `PENDING`.

What follows depends on the setting `bkit.workflows.ship.merge.ask`:

- on → Step 11 asks the owner the Merge Question as if no clear cause had been found;
- off → Step 12 runs `bkit-debug-failure-remediate` against a diagnosis that contains no fix.

Build Step 13 and debug Step 6 pass `Strategy` to the same agent. Ship passes it only to the fix agent in Step 12.

### What should happen

One of two things, and the choice is the first thing to decide:

- **A failed merge gets a diagnose-and-fix round.** Step 10 routes to Step 11, Step 11 holds the three counter values itself, and the diagnose agent gets every value its prompt requires.
- **A failed merge does not get one.** Steps 11 and 12 are removed, together with the Merge Question's Step 11 entry (`bkit-ship.md:798`) and the `ship-failure-diagnose` / `ship-failure-remediate` step rows.

Either way, no step is left in the file that no route can reach.

### Steps to reproduce

Not reproduced. A first attempt:

1. In a test repo, start `/bkit-ship` on a PR whose merge is refused for a reason Step 10 treats as terminal.
2. Check which step runs next. The file says the Failure Path, never Step 11.
3. Separately, start `bkit-debug-failure-diagnose` with the Context from `bkit-ship.md:851-854` and check that it returns `FAIL` with a `PENDING` report.

### How often

Defect 1: every ship run whose merge fails. Defect 2: every run that does reach Step 11.

### Affected area

- `.bkit/core/workflows/bkit-ship.md` Step 10 (routes), Step 11, Step 12, the Merge Question and the Resume rule.
- `.bkit/core/prompts/bkit-debug-failure-diagnose.md` Process step 5.
- `.bkit/core/engine/commands/workflow/steps.ts` and `status.ts` (the step rows, and what `status resume` returns).

### Where and when

Read on `dev`, 2026-11-10, bkit 6.1.1.

### Evidence

- `docs/failures.jsonl` key `ship-failure-diagnose-remediate-steps-reachable-only-on-resume`
- `docs/failures.jsonl` key `ship-failure-diagnose-invoked-without-strategy`
- Not checked: whether `status resume` can return step number 11 at all. If it cannot, Steps 11 and 12 are fully dead.
- Not written down anywhere: why line 783 keeps recoverable refusals out of Steps 11-12 while the steps stay in the file.

### References

- #750 — Workflow optimisation (https://github.com/cbartens/bkit/issues/750): parent.
- #907 — Fix loops: drop the STANDARD / PIVOT / FINAL strategy labels (https://github.com/cbartens/bkit/issues/907): would remove the `Strategy` field, which ends defect 2 by another route. It is blocked and far off, so this issue does not wait for it.
- #904 — Question advisor: a fresh top-tier agent behind every owner question (https://github.com/cbartens/bkit/issues/904): its open question 6 is whether the advisor covers the Merge Question, which Step 11 asks.
- `.bkit/core/workflows/bkit-ship.md`, `.bkit/core/workflows/bkit-build.md` Step 13, `.bkit/core/workflows/bkit-debug.md` Step 6

## Issue comment — posted 2026-11-10T06:11:17.000Z

**Label changed: `next:debug` → `next:design`**

Both defects were found by reading `bkit-ship.md`, and nothing has failed in a run, so debug has no failure to diagnose. The issue's first step is a choice between two options: wire a failed merge into Steps 11-12, or remove those steps. That choice is design's job (`.bkit/workflows.md:58`).

If the owner makes the choice in a comment here, design is no longer needed and the next step becomes `/bkit-plan 911`.

## Issue comment — posted 2026-11-10T06:50:12.000Z

### Owner decision: remove Steps 11-12 (design no longer needed)

**Decision:** a failed merge does not get a diagnose-and-fix round inside ship. Steps 11 and 12 are removed. When ship stops on a failure, the fix is a separate `/bkit-debug` run.

**Why.**

- **Nothing reaches the steps any more, and the cases that used to are now handled elsewhere.** Before #896, Step 11 ran only when the merge gate had passed (CI green) and GitHub still refused the merge. #896 moved the two cases a code fix could help with to their own routes: head moved after the gate → Step 9 (re-validate), conflict with `dev` → Step 3 (integrate). What is left goes to a stop: base not `dev`, PR not open, head unreadable, or GitHub refusing for a policy reason such as a missing review or a branch rule. An agent editing code cannot fix any of those.
- **A failing CI run never went to Step 11.** At least since `3b8d94681` (2026-10-11), the merge gate in Step 10 sub-step 1 sends a red run (exit 12) to the Failure Path, unless every failed step is a generated file, which ship regenerates. That is unchanged.
- **Debug is the right tool for a red CI run at ship time.** The change already passed build's local tests, so a CI failure in ship is usually CI-only (machine, environment, secrets, a test that fails at random), or new code brought in from `dev` by the Step 3 merge. `/bkit-debug` has steps for that which Steps 11-12 never had: Step 4 reads the actual CI run's evidence, Step 5 reproduces the failure as a failing test, and Step 8 soaks causes nobody has found yet. Steps 11-12 were diagnose and fix only, with no CI evidence and no `Strategy` value. Copying the rest of debug into ship would mean keeping two copies in step.
- Build keeps its own Steps 13-14. There the failing tests come from code the same run just wrote, with the plan at hand, so a diagnose-and-fix loop fits.

**Scope for the plan.**

- `.bkit/core/workflows/bkit-ship.md`: remove Steps 11 and 12, the Merge Question's "diagnosis found no clear cause" branch (keep the used-up-limit branch), the "Recoverable merge refusals never enter Steps 11-12" sentence, and Step 11/12 from the Resume rule. Renumber the steps that follow, or say why the numbers stay.
- Step names `ship-failure-diagnose` and `ship-failure-remediate`: remove from `.bkit/core/engine/commands/workflow/step-table.ts`, `steps.ts`, `.bkit/core/engine/checks/status-holes.ts`, their tests, the workflow checks (`ship-invariants.test.ts`, `workflow-shape.test.ts`, `counter-prose-audit.test.ts`) and the `bkit-ship.none.txt` snapshot.
- Docs that name the steps: `.bkit/workflows.md` and `.bkit/instructions.md`. `utility-pre-release-check` names them too; it is hand-authored in three copies (`.claude/agents/`, `.opencode/agents/`, `.codex/agents/`).
- Keep the shared agents `bkit-debug-failure-diagnose` and `bkit-debug-failure-remediate`. Debug uses both, and build Step 13 uses the diagnose agent.
- Status files from runs started before the change can still hold `ship-failure-*` rows. A resumed run, and `bkit workflows summary`, must still handle them.
- When ship stops on a red CI run, the stop message names `/bkit-debug {FID}` as the next step. Check whether the Failure Path handover already says this; add it if not.
- Defect 2 (Step 11 starting the diagnose agent without `Strategy`) goes away with Step 11. Nothing else is needed for it.

**Side effect:** #902's table loses its ship Step 11 row.

Next step: `/bkit-plan 911`.
