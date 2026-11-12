## Session Prompt — this run's, newer than everything below

/bkit-build #901

## Issue description — oldest

### Failing test or CI run

none yet (reproduced with a scratch copy of the existing test, not committed; see Evidence)

### What happened

During `/bkit-build` Step 11, `bkit challenge merge` adds one `Derived Test Matrix` row for each test the new finding tasks name. `matrixRows` in `.bkit/core/engine/commands/workflow/challenge.ts:271` always writes the same four cells in the same order:

```
| {test name} | {tier} | `{file}` | {task} |
```

It never reads the plan's own matrix header. The plan check (`checkPlanText`, `.bkit/core/engine/commands/workflow/tests.ts:820`) finds the `Task` column by its header name, wherever it sits. When the plan's matrix isn't exactly `Test description | Type | Target file | Task`, the new rows put the task number in the wrong column. The check then reports `Derived Test Matrix row maps to no task` and `TASK N names TEST FIRST tests but no Derived Test Matrix row maps to it`, and the merge exits 23 without writing anything.

The plan check accepts any header that has a `Task` column. So the merge fails on plans that bkit's own gate has passed.

The workflow makes it worse. `.bkit/core/workflows/bkit-build.md` Step 11 sub-step 5 treats every exit 23 as the reviewers' fault ("a finding names no test or exceeds the test caps"). It sends both challenge reviewers back for the one allowed reformat round. Their rewrite can't fix a plan-shape problem, so the second merge fails the same way and the build goes to the Failure Path.

Seen in the build of [gether-life/app-gether-life#1517 "Local E2E runs fully local, spends no Inngest cloud runs"](https://github.com/gether-life/app-gether-life/issues/1517) (`docs/plans/202610/1517-fully-local-e2e-plan.md`). Its matrix is `| # | Test description | Type | Target file | Task |`, with `M1`-`M47` in the first column.

### What should happen

Every plan has the template's matrix header, `| Test description | Type | Target file | Task |` (`.bkit/core/docs/templates/bkit-plan.md:71`), and the plan check refuses any other header. Then the challenge merge's fixed four-cell row is always right, and the merge needs no change.

A plan with a different header is refused at plan time, or at build Step 4 for a plan written before this change. In both places an agent already rewrites a plan the check refuses, so nobody edits a plan by hand.

### Scope decision (2026-11-10)

**Pin the one shape. Do not teach the merge every shape.** The earlier proposal had `matrixRows` fill cells by column name and recognise synonyms (`Behaviour`, `Tier`, `File`, `Test`). That handles plan shapes a plan-writing agent made up on its own, and keeps them valid forever. One shape, checked where plans are written, is simpler and catches the problem before a build starts.

**Is this only a problem for old plans? Not today, but it will be once the shape is pinned.**

- New plans can hit it now, because nothing pins the shape. `bkit-plan-generate` asks only for "a `Task` cell" (`.bkit/core/prompts/bkit-plan-generate.md:46`). `bkit-build-plan-convert` says `Task` sits "beside" the other three columns, with no order and no ban on extra columns (`.bkit/core/prompts/bkit-build-plan-convert.md:36`). The plan check accepts any header with a `Task` column.
- Once the plan check pins the header, only plans written before the change can have another shape.

**Why not hand-edit the old plans instead?**

- In `app-gether-life`, only 3 of the 12 plans with the extra `#` column still have open issues: #1181, #1517 and #1527. The other 9 are done and will never go through a challenge merge again.
- Hand-editing those 3 fixes this one repo only. bkit is public, and other consumers' plans would still break in the middle of a build.
- Pinning makes hand edits unnecessary anyway. Build Step 4 already runs the plan check, and on a `matrix` problem it sends the plan to `@bkit-build-plan-convert`, which rewrites it (`.bkit/core/workflows/bkit-build.md:496`). An old plan gets fixed the first time it is built, with no migration and no manual step.

### The fix

1. `checkPlanText` (`.bkit/core/engine/commands/workflow/tests.ts:820`) reports a `matrix` problem when the `Derived Test Matrix` header is not exactly `Test description | Type | Target file | Task`, ignoring case and spaces around cells. The problem text names the expected header. `derivedTestMatrix` (`.bkit/core/engine/commands/workflow/plan-blocks.ts:213`) already parses the header.
2. `bkit-plan-generate.md:46` and `bkit-build-plan-convert.md:36` name the exact header and column order, and forbid extra columns. A change-shape issue's 3-column matrix (`.bkit/trackers.md` § Issue shapes) becomes these four columns, with `Task` last.
3. `matrixRows` and `appendTasks` in `challenge.ts` stay as they are.
4. Tests: the plan check refuses each off-template header with a `matrix` problem (an extra leading `#` column, `Task` not last, synonym names such as `Behaviour | Tier`, no `Task` column), and accepts the template header.

Not needed with this fix: the Step 11 exit-23 split between "the reviewers' fault" and "the plan's fault". A plan that reaches Step 11 has already passed the pinned check at Step 4.

### Steps to reproduce

1. In `.bkit/core/engine/commands/workflow/challenge.test.ts`, copy the test `challenge merge writes a matrix row for each appended finding task` (line 265).
2. Change its matrix to `| # | Test description | Type | Target file | Task |`, add the extra `| --- |`, and add `M1` / `M2` to the two rows.
3. Run it: `r.code` is 23, not 0 (assertion at line 283).

### How often

Every challenge round that has findings, on any plan whose matrix header differs from the template's four columns in content or order.

### Affected area

- `checkPlanText` in `.bkit/core/engine/commands/workflow/tests.ts` (the check that should pin the shape)
- `.bkit/core/prompts/bkit-plan-generate.md` and `.bkit/core/prompts/bkit-build-plan-convert.md` (the matrix shape rules)
- `matrixRows` in `.bkit/core/engine/commands/workflow/challenge.ts` (where it fails today; unchanged by the fix)

### Where and when

bkit 6.1.1. Seen 2026-11-09 in `app-gether-life`.

Matrix header shapes found under `app-gether-life/docs/plans/**`, first table under the matrix heading: `Test description | Type | Target file` (19), `# | Test description | Type | Target file | Task` (12), `# | Behaviour | Type | Target file` (1), `Behaviour | Tier | Target file` (1). bkit's plan template never had the `#` column (`git log -S'| # | Test description'` finds nothing), so the plan-writing agent most likely added it on its own. Nothing records why.

### Evidence

Scratch reproduction (file deleted afterwards):

```
× challenge merge writes a matrix row for each appended finding task
  283|     expect(r.code).toBe(0);
Tests  1 failed | 36 skipped (37)
```

### References

- [gether-life/app-gether-life#1517 "Local E2E runs fully local, spends no Inngest cloud runs"](https://github.com/gether-life/app-gether-life/issues/1517): build Step 11 round 1 (merge exit 23, reformat round sent to both reviewers)
- `.bkit/core/docs/templates/bkit-plan.md:71` (template matrix header)
- `.bkit/core/prompts/bkit-build-plan-convert.md:36` (matrix shape rule)
- `.bkit/core/workflows/bkit-build.md` § Step 4 — Plan Convert (the existing rewrite of a refused plan)
- #885 — Necessity and simplicity across design and review: this issue is one of its worked examples

## Issue comment — posted 2026-11-10T06:11:15.000Z

**Label changed: `next:debug` → `next:build`**

`/bkit-debug` is for something that is actually failing with a cause nobody knows yet (`.bkit/workflows.md:61`). This issue has neither. Nothing is red in CI, and the "Scope decision (2026-11-10)" and "The fix" sections already say what to change and which tests to add. The fix also leaves `challenge.ts` as it is, so it would not turn the scratch reproduction green. Debug's "make the red test pass" loop would be aiming at the wrong target.

`/bkit-build 901` fits: what to build is clear, and build Step 4 turns the issue into a plan.
