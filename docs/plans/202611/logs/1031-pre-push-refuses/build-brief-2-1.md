# Brief: group 2 — Challenge round 1 findings

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

- Group 1: Refuse audit files in `[skip ci]` pushes to `main` — done
  - TASK 1: Add an audit check for `main` to `bkit ci min-push` — done
  - TASK 2: Run the audit check for `main` SHAs in the hook template and bkit's copy — done
  - TASK 3: Say the audit allowance covers `dev` only — done
- Group 2: Challenge round 1 findings — this group
  - TASK 4: In bkit's own repo (`bkit.testing.minPushPaths: ["docs/**"]`) and in any repo whose `minPushPaths` covers `docs/templates/**`, a `[skip ci]` push to `main` that changes an audit template's project section passes `--target=main`: `mainAuditFiles` hands `paths` (with `minPushPaths`) to `minPushOutside`, the template matches a min-push path, never lands in `outside`, so it never reaches `sections` and is never refused — open
  - TASK 5: A `[skip ci]` push to `main` carrying `docs/audits/202611/sécurité.md` (any non-ASCII, tab, double quote or backslash in the name) passes `min-push --target=main`, because `git diff --name-only` without `-z` prints the path C-quoted (`"docs/audits/202611/s\303\251curit\303\251.md"`), which fails `startsWith("docs/audits/")`, while today's `-z` pathspec check still counts it as a min-push file — open
  - TASK 6: After a `bkit upgrade` lands on `dev` (every audit template's managed block now differs from `origin/main`), a project-section edit pushed to `dev` under `[skip ci]` and then promoted to `main` under a `[skip ci]` plans-only head passes `--target=main`: against `origin/main` the template's managed head differs (or the template is new to `main`), so `minPushOutside` files it under `outside`, not `sections`, and `mainAuditFiles` only refuses `sections`. A template with more change than section-only escapes a check that refuses section-only — open

## The work

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** In bkit's own repo (`bkit.testing.minPushPaths: ["docs/**"]`) and in any repo whose `minPushPaths` covers `docs/templates/**`, a `[skip ci]` push to `main` that changes an audit template's project section passes `--target=main`: `mainAuditFiles` hands `paths` (with `minPushPaths`) to `minPushOutside`, the template matches a min-push path, never lands in `outside`, so it never reaches `sections` and is never refused
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/ci/ci.ts:678` · **Round:** 1
  - **DONE WHEN:** the template half of the `main` check ignores `minPushPaths` / `ciSkipPaths` (for example `minPushOutside(root, mb, sha, [])`, so every changed file is classified), matching the plan's edge case "the audit check does not read `minPushPaths`", and a project-section-only template change is refused on `main` whatever `minPushPaths` holds
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main refuses an audit template's project section even when minPushPaths matches docs/**` fails on exit 0 for `pushedToMain(belowOnly.before, belowOnly.after, { bkit: { testing: { minPushPaths: ["docs/**"] } } })` with `--target=main`, where it should exit 1 and name `T1` on stderr
<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->
- [ ] **TASK 5:** A `[skip ci]` push to `main` carrying `docs/audits/202611/sécurité.md` (any non-ASCII, tab, double quote or backslash in the name) passes `min-push --target=main`, because `git diff --name-only` without `-z` prints the path C-quoted (`"docs/audits/202611/s\303\251curit\303\251.md"`), which fails `startsWith("docs/audits/")`, while today's `-z` pathspec check still counts it as a min-push file
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/ci/ci.ts:676` · **Round:** 1
  - **DONE WHEN:** `mainAuditFiles` takes its audit list from NUL-delimited, unquoted names (for example `diff.changed`, which `minPushOutside` already returns from `git diff --name-only -z --no-renames`), the separate quoted `git diff --name-only` call is gone, and a non-ASCII `docs/audits/**` path is refused and named verbatim
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main refuses a docs/audits file whose name has non-ASCII characters` fails on exit 0 with `minPush: true` for `pushedToMain({}, { "docs/audits/202611/sécurité.md": "# Report\n" })` (set `GIT_CONFIG_COUNT=1`, `GIT_CONFIG_KEY_0=core.quotePath`, `GIT_CONFIG_VALUE_0=true` in `process.env` for the run so a machine with `core.quotePath=false` cannot mask it)
<!-- bkit:task 5 end -->

<!-- bkit:task 6 start -->
- [ ] **TASK 6:** After a `bkit upgrade` lands on `dev` (every audit template's managed block now differs from `origin/main`), a project-section edit pushed to `dev` under `[skip ci]` and then promoted to `main` under a `[skip ci]` plans-only head passes `--target=main`: against `origin/main` the template's managed head differs (or the template is new to `main`), so `minPushOutside` files it under `outside`, not `sections`, and `mainAuditFiles` only refuses `sections`. A template with more change than section-only escapes a check that refuses section-only
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/ci/ci.ts:681` · **Round:** 1
  - **DONE WHEN:** `mainAuditFiles` refuses every changed top-level `docs/templates/bkit-audit-*.md` whose text below `<!-- bkit:end -->` differs between the `origin/main` merge-base (absent counts as empty) and the pushed commit, whether or not its managed block also changed, the same way it finds an audit report already on `origin/dev` but not on `origin/main`
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main refuses an audit template project section already on origin/dev when its managed block also changed since origin/main` fails on exit 0: `origin/main` holds `auditTemplate("block", "old")` at `T1`, `origin/dev` holds `auditTemplate("block2", "new project text")`, the head adds only `docs/plans/202611/logs/1-x/status.jsonl` under `[skip ci]`; with `--target=main` it should exit 1 and name `T1`
    - `.bkit/core/engine/commands/ci/ci.test.ts` `--target=main refuses an audit template new to main whose project section was edited on origin/dev` fails on exit 0: `origin/main` lacks `T1`, `origin/dev` holds `auditTemplate("block", "new project text")`, the head adds only a plan log under `[skip ci]`; with `--target=main` it should exit 1 and name `T1`
<!-- bkit:task 6 end -->

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
