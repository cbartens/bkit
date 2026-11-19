# Brief: group 1 — Refuse audit files in `[skip ci]` pushes to `main` (tests)

Plan: Pre-push refuses audit files in `[skip ci]` pushes to `main` Implementation Plan

## Why and what

### Context & Goals

The pre-push hook lets an audit report (`docs/audits/**`) or an audit template's project section reach `dev` or `main` under a `[skip ci]` head, so no workflow runs on that push. The owner accepted that for `dev` only. Goal: the hook adds one check for `main` that refuses such a push before any gate, names the file and gives the trigger-commit fix; `dev` and every other `main` push behave as today; the three docs say the allowance covers `dev` only.

**Related Issues:**

- #1031 — pre-push refuses audit files in `[skip ci]` pushes to `main`
- #920 — Build agents run folder-wide tests mid-step and block other worktrees

---

### Narrative

A maintainer pushes to `main` a commit whose message carries `[skip ci]` and which brings an audit report or an audit template's project section onto `main`. The hook stops the push before any gate and says which file caused it and how to fix it with a trigger commit. The same push to `dev` still goes through on the light gate.

### Success Criteria

- A push to `main` whose last commit carries `[skip ci]` and brings a file under `docs/audits/**` onto `main` exits non-zero before any gate, and the message names the file and the trigger-commit fix.
- A push to `main` whose last commit carries `[skip ci]` and brings only an audit template's project-section change onto `main` is refused the same way.
- The same two pushes to `dev` are still allowed with the light gate.
- A `[skip ci]` push to `main` that brings no audit file onto `main` behaves exactly as today, including a promotion whose range looks empty against `origin/dev`.
- `docs/security.md`, `docs/deployments.md` and `.bkit/core/.bkit/templates.md` say the audit allowance covers `dev` only.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The `dev` allowance for audit reports | The owner accepted it | `docs/decisions.jsonl` key `920-audit-reports-may-skip-ci-on-dev` |
| A narrower skip-CI allow-list | Rejected by the decision | `docs/decisions.jsonl` key `920-audit-reports-may-skip-ci-on-dev` |
| Refusing other `[skip ci]` pushes to `main` that look empty against `origin/dev` | Not decided | A future design decision |
| `bkit land` and `commands/workflow/tests.ts` | They use `minPushPathspecs` unchanged | Unchanged |
| Server-side branch protection on `main` | Not part of the hook change | `docs/deployments.md` |

## Where it fits

- Group 1: Refuse audit files in `[skip ci]` pushes to `main` — this group
  - TASK 1: Add an audit check for `main` to `bkit ci min-push` — open
  - TASK 2: Run the audit check for `main` SHAs in the hook template and bkit's copy — open
  - TASK 3: Say the audit allowance covers `dev` only — done

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Add an audit check for `main` to `bkit ci min-push`
  - **UPDATE:** `minPush` in `.bkit/core/engine/commands/ci/ci.ts`: with `--target=main`, run today's check unchanged, then diff each `--ref` against its merge-base with `origin/main`; refuse and name every changed file under `docs/audits/**` and every file `minPushOutside` puts in `sections`; when `origin/main` does not resolve, report not proven, as today's no-base path does
  - **UPDATE:** `.bkit/core/engine/commands/ci/ci.ts`: the `min-push` verb spec declares `--target` (only `main` accepted) and refuses it with `--update` as a usage error, like `--ref`
  - **READ:** `minPushPathspecs` in `.bkit/core/engine/commands/ci/ci.ts`: stays unchanged, since `land.ts:197` and `commands/workflow/tests.ts:2386` use it
  - **READ:** `docs/testing.md`: § Key test files and § Unit, for the tier of the new cases
  - **UPDATE:** `.bkit/core/engine/commands/ci/ci.test.ts`: the `--target=main` cases inside `describe("bkit ci min-push")`
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/commands/ci/ci.test.ts` passes, and `pnpm build` then `pnpm tsx .bkit/core/engine/cli.ts upgrade` have run
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main refuses a docs/audits change even when minPushPaths matches it` fails on the audit report being accepted
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main refuses a change to an audit template's project section only` fails on the section exception still applying for `main`
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main accepts a plans-only range` fails on a non-audit min push being refused
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main finds an audit report already on origin/dev but not on origin/main` fails on the check measuring only from `origin/dev`
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main accepts a range that looks empty against origin/dev and adds no audit file` fails on the `main` check being stricter than today for non-audit files
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main is not proven a min push when origin/main does not resolve` fails on a missing base being treated as safe
    - `.bkit/core/engine/commands/ci/ci.test.ts` `without --target, an audit-only range is still a min push` fails on the default behaviour changing

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Run the audit check for `main` SHAs in the hook template and bkit's copy
  - **UPDATE:** `.bkit/templates/.husky/pre-push`: collect SHAs pushed to `refs/heads/main` in their own list next to `PUSH_SHARED_SHAS` (set at line 107, appended at line 124); in the CI-suppressor guard loop (lines 236-244) call `bkit ci min-push --ref="$push_sha" --target=main` for those SHAs and today's call for the rest; the `main` message says audit reports may skip CI on `dev` only and gives the trigger-commit fix
  - **UPDATE:** `.husky/pre-push`: the identical edit; this copy's `PUSH_SHARED_SHAS` is at lines 164 and 181 and its guard loop at lines 293-302
  - **READ:** `docs/deployments.md`: § Pre-push checklist, for the guard's current wording
  - **UPDATE:** `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`: the `main` cases inside `describe(".husky/pre-push min push")`, run for both hook copies, each name prefixed `${hook}: ` like its neighbours
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `pnpm vitest run .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` passes for both hook copies
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `audit report to main under a [skip ci] head → blocked before any gate` fails on the push reaching the gates or succeeding
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `audit-template project section to main under a [skip ci] head → blocked before any gate` fails on the section exception still applying for `main`
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `plans-only change to main under a [skip ci] head → allowed, light gate` fails on a non-audit min push to `main` being blocked
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `one push updating dev and main with an audit-only [skip ci] head → blocked before any gate` fails on the `dev` update hiding the `main` one
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `audit report to dev under a [skip ci] head → allowed, light gate` fails on the `main` check leaking onto `dev` — existing test, taken over because this task changes the loop it runs through
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `audit-template project section to dev under a [skip ci] head → allowed, light gate` fails on the `main` check leaking onto `dev` — existing test, taken over for the same reason

<!-- bkit:task 2 end -->

### Derived Test Matrix rows

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| --target=main refuses a docs/audits change even when minPushPaths matches it | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 1 |
| --target=main refuses a change to an audit template's project section only | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 1 |
| --target=main accepts a plans-only range | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 1 |
| --target=main finds an audit report already on origin/dev but not on origin/main | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 1 |
| --target=main accepts a range that looks empty against origin/dev and adds no audit file | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 1 |
| --target=main is not proven a min push when origin/main does not resolve | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 1 |
| without --target, an audit-only range is still a min push | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` | 1 |
| audit report to main under a [skip ci] head → blocked before any gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 2 |
| audit-template project section to main under a [skip ci] head → blocked before any gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 2 |
| plans-only change to main under a [skip ci] head → allowed, light gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 2 |
| one push updating dev and main with an audit-only [skip ci] head → blocked before any gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 2 |
| audit report to dev under a [skip ci] head → allowed, light gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 2 |
| audit-template project section to dev under a [skip ci] head → allowed, light gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 2 |

### Planned tests that already exist

- TASK 2 `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `audit report to dev under a [skip ci] head → allowed, light gate` — exists at `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1220`; update that test in place: add expectations, never remove or loosen one
- TASK 2 `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `audit-template project section to dev under a [skip ci] head → allowed, light gate` — exists at `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1232`; update that test in place: add expectations, never remove or loosen one

## Deviations

- Cut the worktree from local `dev` at the commit the orchestrator's message names. Local `dev` is ahead of `origin/dev`. Do not fetch or push.
- The line numbers in the issue are older than the landed build of "Pre-push dist check judges the index, not the commits being pushed" (https://github.com/cbartens/bkit/issues/1048), which changed the bkit-repo-only block of `.husky/pre-push` and the hook test file. Find each place by its text, not by its number.
- Files you may change: `.bkit/templates/.husky/pre-push`, `.husky/pre-push` (the same lines; the two stay byte-identical outside the bkit-only block), `.bkit/core/engine/commands/ci/ci.ts`, `.bkit/core/engine/commands/ci/ci.test.ts`, `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`, `docs/security.md`, `docs/deployments.md`, `.bkit/core/.bkit/templates.md`, `.bkit/core/.bkit/cli.md` only if the new flag is listed there, the built `dist/`, and the rendered copies that `pnpm tsx .bkit/core/engine/cli.ts upgrade` rewrites (never edit a rendered copy by hand).
- Files you must not change: every other file under `.bkit/core/engine/commands/` (the build of issue 958 runs beside you and changes the workflow command files, not `ci/ci.ts`), `.bkit/core/engine/ledgers/`, `.bkit/instructions.md`, every workflow and prompt file, `.github/workflows/*`, `.bkit/core/engine/commands/workflow/worktrees.ts` and `branches.ts` (another build may change them beside you). If the fix cannot be done without one of these, stop and message the orchestrator with what you found.
- `dev` behaviour must not change: the owner accepted the audit allowance for `dev`. The new check is for `main` only and compares with `origin/main`. Prove both sides in the tests the issue lists.
- One home for the path rule: the audit paths come from the code that already knows them (`minPushPathspecs` / `minPushOutside` in `ci.ts`). Do not write a second list of audit paths into the hook.
- Shell stays POSIX `sh` (the hook's shebang); no bash-only syntax. Check the hook with `sh -n` and with `shellcheck` if it is installed.
- This change touches a shipped template. At the end, before your final report, do the packed-tarball check: `pnpm pack` into `tmp/`, install the tarball in an empty scratch project under `tmp/`, run `bkit install` there, and confirm the installed `.husky/pre-push` holds the new lines and that `bkit ci min-push --target=main` (or the name the plan gives the flag) runs there. Say what you ran and what you saw.
- Old installs: an install that keeps its old hook simply does not get the new `main` check; that is not a break. If you find a case where an old hook would fail against the new engine (for example a flag it passes that the engine no longer accepts), stop and message the orchestrator: a migration needs the owner's approval.
- Word counts: no change expected. `pnpm bkit:text:ceiling check` must still pass. Never `raise`.
