## Session Prompt — this run's, newer than everything below

#1031 publish=false

## Issue description — oldest

### Narrative

The pre-push hook (`.bkit/templates/.husky/pre-push`, with bkit's own adopted copy `.husky/pre-push`) blocks a push to `dev` or `main` whose last commit carries a CI-suppressing token such as `[skip ci]`, unless every changed file is one bkit itself writes. That "min push" list comes from `minPushPathspecs` in `.bkit/core/engine/commands/ci/ci.ts` and includes `docs/audits/**`. `minPushOutside` also accepts a `docs/templates/bkit-audit-*.md` template whose only change is its project section below `<!-- bkit:end -->`.

The guard (template lines 233-244) loops over `$PUSH_SHARED_SHAS`, which collects SHAs pushed to both `refs/heads/dev` and `refs/heads/main` (lines 123-125), and runs the same `bkit ci skip-token --ref` then `bkit ci min-push --ref` check for both. So an audit report reaches `main` under a `[skip ci]` head with no workflow run, exactly as it reaches `dev`.

The owner accepted that for `dev` only. Once done, the hook adds one check for `main`: any audit report, or audit-template project section, that the push brings onto `main` under a `[skip ci]` head is refused before any gate, and the message names the file and the trigger-commit fix. Everything else about the `main` guard stays as today. `dev` is unchanged. `docs/security.md` § Supply-Chain (GitHub Actions) names `dev` only.

### Success Criteria

- A push to `main` whose last commit carries `[skip ci]` and brings a file under `docs/audits/**` onto `main` exits non-zero before any gate, and the message names the file and the trigger-commit fix.
- A push to `main` whose last commit carries `[skip ci]` and brings only an audit template's project-section change onto `main` is refused the same way.
- The same two pushes to `dev` are still allowed with the light gate.
- A `[skip ci]` push to `main` that brings no audit file onto `main` behaves exactly as today, including a promotion whose range looks empty against `origin/dev`.
- `docs/security.md`, `docs/deployments.md` and `.bkit/core/.bkit/templates.md` say the audit allowance covers `dev` only.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Audit report to `main` under a `[skip ci]` head | Blocked before any gate; message names the audit path. |
| Audit-template project section to `main` under a `[skip ci]` head | Blocked before any gate. |
| Audit report already on `origin/dev` but not on `origin/main`, promoted to `main` under a `[skip ci]` head | Blocked: the audit check compares with `origin/main`, so it finds the report even though the range against `origin/dev` is empty. |
| Audit report to `dev` under a `[skip ci]` head | Allowed, light gate (unchanged). |
| Audit report to `main` with no skip token | Not affected by this guard; the normal gate runs. |
| `[skip ci]` promotion to `main` with no audit file, whose range looks empty against `origin/dev` | As today: the existing min-push check decides; the audit check finds nothing. |
| One push updates both `dev` and `main` with the same audit-only `[skip ci]` SHA | Blocked, because the `main` update is refused. |
| The repo's `bkit.testing.minPushPaths` also matches `docs/audits/**` (bkit's own `package.json` lists `docs/**`) | Still blocked on `main`; the audit check does not read `minPushPaths`. |
| `origin/main` does not resolve | The audit check cannot prove the push safe, so it blocks, as the existing guard does when no base resolves. |

### Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file |
| --- | --- | --- |
| --target=main refuses a docs/audits change even when minPushPaths matches it | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` |
| --target=main refuses a change to an audit template's project section only | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` |
| --target=main accepts a plans-only range | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` |
| --target=main finds an audit report already on origin/dev but not on origin/main | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` |
| --target=main accepts a range that looks empty against origin/dev and adds no audit file | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` |
| --target=main is not proven a min push when origin/main does not resolve | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` |
| without --target, an audit-only range is still a min push | Unit | `.bkit/core/engine/commands/ci/ci.test.ts` |
| audit report to main under a [skip ci] head → blocked before any gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` |
| audit-template project section to main under a [skip ci] head → blocked before any gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` |
| plans-only change to main under a [skip ci] head → allowed, light gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` |
| one push updating dev and main with an audit-only [skip ci] head → blocked before any gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` |
| audit report to dev under a [skip ci] head → allowed, light gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` |
| audit-template project section to dev under a [skip ci] head → allowed, light gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` |

### Tasks

<!-- bkit:group 1 start -->
### TASK GROUP 1: Refuse audit files in `[skip ci]` pushes to `main`

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** Add an audit check for `main` to `bkit ci min-push`
  - **UPDATE:** `minPush` in `.bkit/core/engine/commands/ci/ci.ts`: with `--target=main`, run today's check unchanged, then diff each `--ref` against its merge-base with `origin/main`; refuse and name every changed file under `docs/audits/**` and every file `minPushOutside` puts in `sections`; when `origin/main` does not resolve, report not proven, as today's no-base path does
  - **UPDATE:** the `min-push` verb spec in `.bkit/core/engine/commands/ci/ci.ts`: declares `--target` (only `main` accepted) and refuses it with `--update` as a usage error, like `--ref`
  - **READ:** `minPushPathspecs` in `.bkit/core/engine/commands/ci/ci.ts`: stays unchanged, since `land.ts:197` and `commands/workflow/tests.ts:2386` use it
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
  - **UPDATE:** `.bkit/templates/.husky/pre-push`: collect SHAs pushed to `refs/heads/main` in their own list next to `PUSH_SHARED_SHAS` (lines 123-125); in the CI-suppressor guard (lines 233-244) call `bkit ci min-push --ref="$push_sha" --target=main` for those SHAs and today's call for the rest; the `main` message says audit reports may skip CI on `dev` only and gives the trigger-commit fix
  - **UPDATE:** `.husky/pre-push`: the identical edit, since the guard region is the same in both files
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

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** Say the audit allowance covers `dev` only
  - **UPDATE:** `docs/security.md`: § Supply-Chain (GitHub Actions), line 25, says the hook lets an audit report reach `dev` under a `[skip ci]` head and refuses it on `main`
  - **UPDATE:** `docs/deployments.md`: § Pre-push checklist, line 579, adds that a `main` push also runs the audit check against `origin/main`
  - **UPDATE:** `.bkit/core/.bkit/templates.md`: § Git hooks — Husky, the `[skip ci]` guards bullet at lines 319-323, adds the same
  - **UPDATE:** `docs/testing.md`: § Key test files, the `commands/ci/ci.test.ts` row (line 842), adds the `--target=main` cases
  - **DEPENDS ON:** 2
  - **DONE WHEN:** no line in those four files says an audit report may reach `main` under a `[skip ci]` head, and `pnpm build` then `pnpm tsx .bkit/core/engine/cli.ts upgrade` have refreshed rendered copies (never edited by hand)
  - **TEST FIRST:** n/a — docs only
<!-- bkit:task 3 end -->
<!-- bkit:group 1 end -->

### Open Questions & Assumptions

Decisions already made: audit reports under `docs/audits/**` may reach `dev` under a `[skip ci]` head; the pre-push hook refuses a `[skip ci]` audit push to `main`; a narrower skip-CI allow-list is rejected (`docs/decisions.jsonl` key `920-audit-reports-may-skip-ci-on-dev`). This is settled.

- The deferral `920-build-agents-run-challenge-low-docs-security-md-25` points at `.bkit/templates/.husky/pre-push:115` and `:188`. Those line numbers are stale: line 115 is `PUSH_HAS_COMMITS=1` and line 188 sits in the feature-branch guard's comment. The dev/main guard is at lines 233-244, and `PUSH_SHARED_SHAS` is built at lines 123-125.
- The deferral's remediation also names "an audit template's project section". `minPushOutside` accepts that section through `AUDIT_TEMPLATE_RE`, so the `main` audit check covers it too.
- Assumption: the audit check compares with `origin/main` only to find audit files. Today's check keeps measuring from `pushBase` (`origin/dev` first), so nothing else about a `main` push changes.
- Assumption: the flag is named `--target=main`.
- Consumers' hooks change only when they re-copy the template, since the hook is copy-and-own. The engine flag ships with the next release; an old hook never passes it. No migration applies.

Removes: the allowance that lets an audit report or audit-template section reach `main` under a `[skip ci]` head.

### Breaking Changes & Naming

A `[skip ci]` push to `main` that brings an audit report or audit-template project section onto `main` is now refused. Every other `[skip ci]` push to `main` behaves as today. New flag `bkit ci min-push --target=main`; the default behaviour of `bkit ci min-push` is unchanged.

### Out of Scope

- The `dev` allowance for audit reports, which stays.
- A narrower skip-CI allow-list (rejected by the decision).
- Refusing other `[skip ci]` pushes to `main` that look empty against `origin/dev` (not decided).
- `bkit land` and `commands/workflow/tests.ts`, which use `minPushPathspecs` unchanged.
- Server-side branch protection on `main`.

### References

- `docs/decisions.jsonl` key `920-audit-reports-may-skip-ci-on-dev`
- `docs/deferrals.jsonl` key `920-build-agents-run-challenge-low-docs-security-md-25`
- `docs/security.md` § Supply-Chain (GitHub Actions)
- `docs/deployments.md` § Pre-push checklist
- `.bkit/core/.bkit/templates.md` § Git hooks — Husky
- `docs/testing.md` § Key test files
- #920 — Build agents run folder-wide tests mid-step and block other worktrees
