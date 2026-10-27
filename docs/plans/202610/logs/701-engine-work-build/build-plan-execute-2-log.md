Verdict: PASS

<!-- verdict:end -->

# Build Plan

## Execution Log

DONE — TASK 2: Create the `tasks` noun with `tick`, and wire the verifier, the tick and the holistic pass to it — `bkit tasks tick` created and registered (`--plan= --group= (--tasks= | --green=)`; exit 0 ticked, 1 a plan with no task blocks, 2 a bad flag value or plan, idempotent, other lines byte-identical); the verify prompt passes the satisfied numbers on its header `Tasks` line and writes no plan; build Step 7 holds `fields.Tasks` and ticks with `--green`, Step 9 ticks once per group (`.bkit/core/engine/commands/workflow/tasks.ts`, `.bkit/core/engine/commands/registry.ts`, `.bkit/core/prompts/bkit-build-plan-verify.md`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/engine/commands/workflow/tasks.test.ts`)
DONE — TASK 3: `tasks open` — the group tasks with no `DONE` / `BLOCKED` line — `open --plan= --group= --log=` prints them with `handover: true` only when one is open; `doneTasks(log, verbs)` widened so `open` reuses the one log parser (default reads `DONE` only, so `context brief` is unchanged); build Step 6 routes on the printed `handover`; the verify prompt Process 6-7 drop the `DONE` cross-reference (`.bkit/core/engine/commands/workflow/tasks.ts`, `.bkit/core/engine/commands/workflow/tests.ts`, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/prompts/bkit-build-plan-verify.md`, `.bkit/core/engine/commands/workflow/tasks.test.ts`)
