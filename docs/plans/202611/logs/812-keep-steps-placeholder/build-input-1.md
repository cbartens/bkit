## Session Prompt — this run's, newer than everything below

/bkit-build #812 publish=false

## Issue description — oldest

### Problem

`bkit steps finish` refuses to finish a step when one of its artifacts still holds a stub placeholder: a line that is just `PENDING`, or a field whose whole value is `PENDING`. The check is `placeholderLines` (`.bkit/core/engine/commands/workflow/steps.ts:235`), with the pattern `PLACEHOLDER` at `steps.ts:161`.

It runs on every artifact, including `--optional-artifact` files (`steps.ts:928-933` adds them, `:1005-1012` passes them to `gateChecks`, `:655-667` scans them). `bkit-plan.md:298` passes `related-issues.md` as an optional artifact. That file is a dump of other issues' bodies and comments. When one of those issues quotes a stub line, for example a design or audit body with a `PENDING` field, the plan's fetch-context step is refused for text the run never wrote.

`docs/failures.jsonl` key `steps-placeholder-gate-false-positive-on-derived-issue-dump` records it. Its locator `steps.ts:121` has drifted; the function is now at `:235`. No open issue carries it.

### Outcome

The placeholder check catches stubs a step forgot to fill, and never fires on external text the step only copied.

### Success criteria

- `steps finish` passes when an optional artifact quotes a whole-line `PENDING` from another issue.
- `steps finish` still refuses a step's own artifact with a `PENDING` left in it.
- A unit test covers both cases.

### Constraints and non-goals

- The check keeps its meaning for every artifact a step writes itself.
- The fix holds for every workflow that passes a derived dump, not just plan's fetch-context.

### Open questions

1. Where does the line sit?
   - A) Skip the placeholder scan for `--optional-artifact` files.
   - B) Have the writer of `related-issues.md` (`bkit issues related`) quote external text, for example as a fenced or indented block, so it never matches as a whole line.
   - C) Add a flag such as `--derived-artifact` that marks a file as external content, and skip the scan only there.
   - Recommended: B. It fixes the cause at the one writer, and keeps the scan on every artifact.
2. Which other steps pass a file of external text today? The fix should cover all of them.

### References

**Audit reports:** docs/audits/202611/failures.md (findings failures-6)

- #345 — Failures triage (https://github.com/cbartens/bkit/issues/345)
- `docs/failures.jsonl` key `steps-placeholder-gate-false-positive-on-derived-issue-dump`
- `.bkit/core/workflows/bkit-plan.md:298`

## Issue comment — posted 2026-11-18T06:49:18.000Z

**Owner answer, 2026-11-18, to open question 1: option C, exactly as written.**

`bkit steps finish` gets a flag such as `--derived-artifact` that marks a file as copied external content. The `PENDING` placeholder scan is skipped only on a file passed that way. Every `--artifact` and `--optional-artifact` file stays scanned.

Recorded as decision row `812-placeholder-scan-skips-only-flagged-derived-artifacts` in `docs/decisions.jsonl`.

Still open: the owner asked whether the flag should be turned round, so that a call marks what must be checked (for example `--check-pending`) instead of what may be skipped. That is being answered in the orchestrator session and is not settled here.

Open question 2 (which other steps pass a file of external text): on `dev` at `1d0f619ea` the only such file is `related-issues.md`, written by `bkit issues related` in `bkit-plan.md` and `bkit-design.md`. Only `bkit-plan.md` passes it to `steps finish` (as `--optional-artifact`). The other `--optional-artifact`, `build-plan-check.md` in `bkit-build.md`, is written by the engine, not copied.

Label moved from `next:design` to `next:build`. The build has not started: it changes `.bkit/core/engine/commands/workflow/steps.ts`, which a running build also changes, so it waits for that one to land.

## Issue comment — posted 2026-11-18T06:56:04.000Z

**Owner confirmed, 2026-11-18: option C with a new `--derived-artifact` flag.** This settles the follow-up left open in the comment above.

The three flags of `bkit steps finish` after this change:

- `--artifact`: the file must exist, and it is scanned for leftover `PENDING` stubs. Unchanged.
- `--optional-artifact`: the file may be missing; when it exists it is scanned. Unchanged.
- `--derived-artifact`: new. The file may be missing; when it exists it is recorded but not scanned, because the step only copied its text from outside.

Two other shapes were considered and set aside:

- A flag that marks what must be scanned (for example `--check-pending`). A forgotten flag would let a stub through with a green step, and nearly all of the 111 `steps finish` calls in the workflows would need it.
- Making `--optional-artifact` itself skip the scan (option A). Same result today, but "may be missing" and "copied from outside" would share one flag, and a future optional file a step writes itself would lose its stub check.

The decision row `812-placeholder-scan-skips-only-flagged-derived-artifacts` in `docs/decisions.jsonl` has a newer row saying the same.

The only call that changes is `bkit-plan.md:331`, which passes `related-issues.md`.
