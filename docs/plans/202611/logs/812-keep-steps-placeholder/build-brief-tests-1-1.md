# Brief: group 1 — `--derived-artifact` in the engine and the plan workflow (tests)

Plan: Keep the steps placeholder gate off copied external text Implementation Plan

## Why and what

### Context & Goals

`bkit steps finish` refuses a step when an artifact holds a stub line (a bare `PENDING`, or a field whose whole value is `PENDING`). The scan runs on every artifact, `--optional-artifact` included. `bkit-plan.md:331` passes `related-issues.md` (other issues' bodies and comments, copied by `bkit issues related`) as an `--optional-artifact`, so a quoted stub in another issue refuses the plan's fetch-context step for text the run never wrote.

Goal, as the owner decided on 2026-11-18 (decision row `812-placeholder-scan-skips-only-flagged-derived-artifacts`, option C): `steps finish` gets a new `--derived-artifact` flag. A file passed that way may be missing, is recorded when it exists, and is not scanned for `PENDING`. `--artifact` and `--optional-artifact` stay scanned and keep their meaning. `bkit-plan.md:331` passes `related-issues.md` with the new flag.

**Related Issues:**

- #812 — this plan's issue
- #345 — Failures triage (parent of the audit finding failures-6)

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `steps finish` passes when a `--derived-artifact` file holds a whole-line `PENDING`, and the row records that file | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| `steps finish` still refuses a step's own `--artifact` holding `PENDING` when a `--derived-artifact` is passed too, and names only the `--artifact` | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| `steps finish` still refuses an `--optional-artifact` holding `PENDING` when a `--derived-artifact` is passed too | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| `steps finish` passes with a missing `--derived-artifact` file and records no row entry for it | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| Plan's fetch-context finish passes `related-issues.md` as `--derived-artifact`, not as `--optional-artifact` or `--artifact` | Static | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 2 |

## Where it fits

- Group 1: `--derived-artifact` in the engine and the plan workflow — this group
  - TASK 1: Add `--derived-artifact` to `steps finish`: recorded when the file exists, not scanned for `PENDING` — open
  - TASK 2: Pass `related-issues.md` as a derived artifact in plan's fetch-context, and add the flag to the `<attempt>` rule — open
  - TASK 3: Rebuild `dist/` and re-render the installed mirrors — done

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Add `--derived-artifact` to `steps finish`: recorded when the file exists, not scanned for `PENDING`
  - **READ:** `docs/security.md`: § Untrusted Content & Prompt Injection, the flag marks untrusted copied text
  - **READ:** `docs/testing.md`: § Test first, the red-first rule for the new tests
  - **READ:** `placeholderLines` in `.bkit/core/engine/commands/workflow/steps.ts`: the scan that stays unchanged
  - **UPDATE:** `GateOptions` in `.bkit/core/engine/commands/workflow/steps.ts`: a `derivedArtifacts` list of files that skip the placeholder scan
  - **UPDATE:** `gateChecks` in `.bkit/core/engine/commands/workflow/steps.ts`: an artifact in `derivedArtifacts` skips the `placeholders {file}` check but still gets the presence check
  - **UPDATE:** `stepsCommand` in `.bkit/core/engine/commands/workflow/steps.ts`: the `finish` verb gets a repeatable `derived-artifact` flag (help: copied external text, may be missing, recorded when present, not scanned); existing files are added to `artifacts`, filled with the attempt like the others, passed as `derivedArtifacts` to both `gateChecks` calls, and counted in the `laterAttempts` call
  - **UPDATE:** `.bkit/core/.bkit/cli.md`: the `finish` row lists `--derived-artifact`, regenerated with `pnpm cli:sync`
  - **UPDATE:** `.bkit/core/engine/commands/workflow/steps.test.ts`: four finish tests
  - **DONE WHEN:** `steps finish --derived-artifact=<file with a whole-line PENDING>` exits 0 and the row lists the file; `--artifact` and `--optional-artifact` files holding `PENDING` are still refused with `placeholders {file}`; a missing derived file is skipped; the `finish` row in `.bkit/core/.bkit/cli.md` names the flag and `pnpm cli:sync` reports no drift; the four tests pass
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a --derived-artifact holding a whole-line PENDING passes and is recorded` fails on the flag being refused as unknown, so the finish exits non-zero instead of 0
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a PENDING in --artifact still refuses while a --derived-artifact is passed` fails on the flag being refused as unknown, so the refusal never names "placeholders" for the `--artifact` file
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a PENDING in --optional-artifact still refuses while a --derived-artifact is passed` fails on the flag being refused as unknown, so the refusal never names "placeholders" for the optional file
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a missing --derived-artifact is skipped and not recorded` fails on the flag being refused as unknown, so the finish exits non-zero instead of 0

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Pass `related-issues.md` as a derived artifact in plan's fetch-context, and add the flag to the `<attempt>` rule
  - **READ:** `.bkit/authoring.md`: § Which Sections Apply and § Before You Save, for the workflow and doc edits
  - **READ:** `.bkit/instructions.md`: the shared-clause check before editing workflow sentences
  - **UPDATE:** `.bkit/core/workflows/bkit-plan.md`: line 331, `--optional-artifact=docs/plans/{YYYYMM}/logs/{FID}/related-issues.md` becomes `--derived-artifact=docs/plans/{YYYYMM}/logs/{FID}/related-issues.md`; nothing else on the line changes
  - **UPDATE:** `.bkit/core/.bkit/workflows.md`: `--derived-artifact` added to the line-428 list of flags that carry `<attempt>` patterns; no other line changes, because `cli.md` holds the flag list
  - **UPDATE:** `.bkit/core/engine/audits/workflows/workflow-shape.test.ts`: one test in `describe("plan")` on Step 4 — Fetch Context
  - **UPDATE:** `.bkit/core/engine/render/__snapshots__/bkit-plan.none.txt`: regenerated with `vitest run .bkit/core/engine/render -u` (a baseline, not a red test)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** the plan workflow's fetch-context finish carries `--derived-artifact=.../related-issues.md` and no `--optional-artifact`; `.bkit/core/.bkit/workflows.md:428` names `--derived-artifact`; the workflow-shape test and the render snapshot test pass
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Fetch Context passes related-issues.md as a derived artifact` fails on the finish line still carrying "--optional-artifact" for `related-issues.md`

<!-- bkit:task 2 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `steps finish` passes when a `--derived-artifact` file holds a whole-line `PENDING`, and the row records that file | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| `steps finish` still refuses a step's own `--artifact` holding `PENDING` when a `--derived-artifact` is passed too, and names only the `--artifact` | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| `steps finish` still refuses an `--optional-artifact` holding `PENDING` when a `--derived-artifact` is passed too | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| `steps finish` passes with a missing `--derived-artifact` file and records no row entry for it | Unit (boundary: real temp git repo) | `.bkit/core/engine/commands/workflow/steps.test.ts` | 1 |
| Plan's fetch-context finish passes `related-issues.md` as `--derived-artifact`, not as `--optional-artifact` or `--artifact` | Static | `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` | 2 |
