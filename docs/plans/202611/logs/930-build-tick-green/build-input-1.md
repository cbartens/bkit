## Session Prompt — this run's, newer than everything below

#930

## Issue description — oldest

### Failing test or CI run

none yet

### What happened

After a group passes verification, the build ticks that group's tasks with `bkit tasks tick --green=<report>` (`.bkit/core/workflows/bkit-build.md:701`). The `--green` flag reads the `bkit tests green` report and is meant to skip only the tasks that report lists under `## Gaps`.

Instead it reads every line in the whole report that starts with `- Task N` followed by a backtick. Two other sections use that same line shape:

- `## Already landed`: tests that already passed before the group's code was written, which the tests step accepted.
- `## Updated tests`: existing tests the tests step changed.

So any task listed in either section is treated as gapped and left unticked, even when the report's header says `Gaps: 0`.

The cause is `REPORT_GAP` at `.bkit/core/engine/commands/workflow/tasks.ts:36` (`/^-\s+Task\s+(\d+)\s+`/gm`). `gappedTasks` at `tasks.ts:100` runs it over the full text. The function's own doc comment says it reads "the `- Task {N} \`{kind}\`` lines of its `## Gaps` section", but the code does not limit itself to that section.

### What should happen

`tasks tick --green` skips only the tasks named under `## Gaps`. A task listed only under `## Already landed` or `## Updated tests` gets ticked like any other gap-free task.

### Steps to reproduce

1. Take a plan with one group holding one task, TASK 9.
2. Write a `tests green` report for it with `Gaps: 0`, `## Gaps` reading `None.`, and an `## Updated tests` section with the line ``- Task 9 `some.test.ts` "name" — an existing test the tests step changed…`` (the exact format `tests.ts:1592-1605` writes).
3. Run `bkit tasks tick --plan=<plan> --group=1 --tasks=9 --green=<report>`.
4. TASK 9 stays `[ ]` and is not in the printed `ticked` list. The same happens with a line under `## Already landed` (format at `tests.ts:1587-1591`).

### How often

Every time a group's report has an `## Already landed` or `## Updated tests` section.

### Affected area

- `gappedTasks` / `REPORT_GAP` in `.bkit/core/engine/commands/workflow/tasks.ts`, and the rebuilt `dist/commands/workflow/tasks.js`.
- Its tests in `.bkit/core/engine/commands/workflow/tasks.test.ts`, which have no case with these two sections.
- The `--json` path of `gappedTasks` reads the `gaps` array, so it is not affected.

### Where and when

Seen on 2026-11-13 in the `/bkit-build` run for #922 — Pre-push: load direnv itself; block in seconds if untrusted (https://github.com/cbartens/bkit/issues/922). Group 4's report `docs/plans/202611/logs/922-pre-push-load/build-tests-green-4-1.md` on branch `feat/922-pre-push-load` reads `Gaps: 0`. It lists TASK 9 only under `## Updated tests`, but the tick left TASK 9 unticked.

The run still finished, only because the whole-plan check ticks tasks later without `--green` (`bkit-build.md:858`). Until then, the plan showed a verified task as not done.

### Evidence

Report header and sections, from `build-tests-green-4-1.md`:

```text
Verdict: PASS
Gaps: 0
Unproven: 0
...
## Gaps

None.

## Updated tests

- Task 9 `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` "the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED" — an existing test the tests step changed since `c88e5c05a`; ...
```

### References

- `.bkit/core/engine/commands/workflow/tasks.ts:36` — `REPORT_GAP`
- `.bkit/core/engine/commands/workflow/tasks.ts:100` — `gappedTasks`
- `.bkit/core/engine/commands/workflow/tests.ts:1574-1605` — where the report's `## Gaps`, `## Already landed` and `## Updated tests` lines are written
- `.bkit/core/workflows/bkit-build.md:701` (per-group tick with `--green`), `:858` (whole-plan tick without it)
- #922 — Pre-push: load direnv itself; block in seconds if untrusted (https://github.com/cbartens/bkit/issues/922)
