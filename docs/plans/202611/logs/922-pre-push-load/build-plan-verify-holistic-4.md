Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: 1, 2, 3, 4, 7, 8
Loosened: none

<!-- verdict:end -->

# Plan Verification

## Scope

Holistic

## Groups Verified

3 of 3 (the plan has 3 groups).

## Integration Gaps

2.

1. TASK 6 (group 3): the planned test `the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED` in `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1523-1524` fails `tsc -p tsconfig.test.json` (TS2339 on `delete env.CI` and `delete env.GITHUB_ACTIONS`), so the gate's `types` stage fails. Vitest runs the test green, which is why the group verify missed it; group 3's gate never ran.
2. TASK 5 (group 2) and TASK 8 (group 3): the latest `docs/decisions.jsonl` row `922-pre-push-gate-env-unsets-bkit-env-keys` (updates 2) records that the gate loses only the keys `.bkit/.env` names. After TASK 8, the hooks also unset the fixed nine-key list on every path, so the recorded decision on which variables the gate may receive no longer matches the hook.

Checked and consistent across groups:

- The worktree narration (TASK 4) says the push will block in exactly the case where the hook (TASK 1) blocks: an `.envrc` that is present and untrusted, with `direnv` on `PATH`.
- The unset loops (TASKS 5, 7 and 8) run at the top of the inner run, after `direnv exec .` (TASK 1) has loaded `.envrc`. The `BKIT_PRE_PUSH_LOGGED` guards on the `gh-mcp` advisory and tip silence the missing-token warnings that this unset would otherwise trigger. The `vitest.setup.ts` scrub (TASK 6) keeps those guards from leaking into the gate's own tests.
- Both hook copies are identical on lines 20-75. The `## Git hooks` section is identical in `.bkit/core/.bkit/templates.md` and the mirror `.bkit/templates.md`, and `node dist/cli.js check` exits 0 with no drift.
- The `pre-push-direnv` tip `why` and `ask` (source and `dist/checks/tips/catalogue.js`) name both unset loops. `fires(<this worktree>)` returns `false`.

## Previously Attempted

- `build-plan-verify-holistic-1.md`: PASS, Tasks 1, 2, 3 (1 group existed).
- `build-plan-verify-holistic-2.md`: CONCERNS, 2 integration gaps (tip ignored the unset block; hand-typed `ts` on `docs/decisions.jsonl:802`). Closed by `build-plan-gaps-remediate-holistic-2-log.md`.
- `build-plan-verify-holistic-3.md`: PASS, Tasks 1-5 (2 groups existed).
- Group 3: `build-plan-verify-3-1.md` CONCERNS (1 gap, `templates.md:293`), closed by `build-plan-gaps-remediate-3-1-log.md`, whose render step and group gate were BLOCKED on the machine tests lock; `build-plan-verify-3-2.md` PASS, Tasks 6, 7, 8, judged on vitest runs only.
- Groups 1 and 2: `build-plan-verify-1-1.md` PASS; `build-plan-verify-2-1.md`, `-2-2.md` CONCERNS, closed by their remediation logs; `build-plan-verify-2-3.md` PASS.

## Notes

- `node dist/cli.js tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exited 1, verdict FAIL, `failed: named, types`. There was no exit 81. Related run: 229 files, 9362 passed, 2 skipped. Named run: 1 failed, 226 files passed (9330 passed, 2 skipped). Bats, node tests, lint and prettier passed. The `types` failure is integration gap 1.
- The named-run failure is `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `preserves substantive step results under every comment boundary fault`, which timed out at 78.6 s. It is not logged as a gap, for three reasons. The branch touches no tracker file (`git diff --name-only origin/dev...HEAD`). Run alone here it passes, in 70.4 s with the 1-minute load average at 28. `build-plan-verify-holistic-3.md` saw the same timeout. It is a load-sensitive timeout, not something this plan caused. Proposed separately: the timeout headroom of this test.
- TASK 1 satisfied: both hook copies carry the direnv log block. The six matrix rows in `describe(".husky/pre-push direnv")` loop over both hooks and passed in the gate run.
- TASK 2 satisfied: the tip is in the source and `dist/`, its matrix test passed, and it does not fire in this repo.
- TASK 3 satisfied: both sections describe the shipped behaviour, the mirror is identical and `bkit check` reports no drift.
- TASK 4 satisfied: `allowDirenv` narrates "push will block". `.bkit/core/.bkit/workflows.md:1184` and its mirror match. The matrix test passed.
- TASK 5 left off `Tasks` for integration gap 2. The code half still holds: the `.bkit/.env` loop stays, and its matrix test passed.
- TASK 6 left off `Tasks` for integration gap 1. `vitest.setup.ts:111` deletes `BKIT_PRE_PUSH_LOGGED` beside `CI` / `GITHUB_ACTIONS`, and the planned test passes under vitest.
- TASK 7 satisfied: checked by hand, the extractor returns `A_KEY`, `B_KEY`, `C_KEY` and `D_KEY` for `A_KEY = spaced`, `B_KEY: colon`, `export C_KEY=x` and `D_KEY=y`, and skips a `#` line. Its matrix test passed.
- TASK 8 satisfied: both hooks unset the nine keys that `docs/security.md:78` lists, with or without `.bkit/.env`. `templates.md:293` ("On every path, with or without direnv ...") and the tip `why` match the hook. Its matrix test passed.
- Decision record `build-decision-1-1.md` (Q1 and Q2 "Fix now") accepts neither gap.
- No test-first audit report was supplied to this step. The group audits (`build-tests-green-*.md`) were decided in the group verify reports, so no `Loosened` tests.
- Derived Test Matrix: all 12 rows have a test in the named file, each tied to its task's `DONE WHEN`, and all passed in the gate run. The plan has no `Documentation Updates` section. `docs/testing.md` and `docs/observability.md` exist. The hook adds no new error path beyond its `[pre-push]` message.
- No `Result:` file was named in the Context, so none was written.
- Out of scope, proposed separately:
  - The hook header comment at `.husky/pre-push:29` and `.bkit/templates/.husky/pre-push:29` still says only "The keys in `.bkit/.env` are unset for the gate". No task's `DONE WHEN` names it.
  - The deferral `922-pre-push-load-challenge-low-bkit-core-engine-checks-after-github-ts-358` records that the project-scope advisory probes the wrong token inside the inner run.

## Identified Gaps Log

2 gaps.

INTEGRATION: TASK 6 (group 3) breaks the gate's `types` stage — `bkit tests changed --base=origin/dev --fallback=bkit:gate:static-unit` exits 1 with `failed: named, types`, and `pnpm exec tsc -p tsconfig.test.json` reproduces it alone: `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts(1523,16): error TS2339: Property 'CI' does not exist on type '{ BKIT_PRE_PUSH_LOGGED: string; }'` and `(1524,16)` the same for `GITHUB_ACTIONS`. The lines are in the planned test `the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED` (written by the group 3 tests step, commit 1a50af650): `const env = { ...process.env, BKIT_PRE_PUSH_LOGGED: "1" }` is inferred without an index signature, so `delete env.CI` / `delete env.GITHUB_ACTIONS` do not type-check. Vitest does not type-check, so the test itself passes; group 3's gate never ran (BLOCKED in `build-plan-gaps-remediate-3-1-log.md`), and `build-plan-verify-holistic-3.md` ran before group 3 existed. Fix: give the declaration a type (`const env: NodeJS.ProcessEnv = { ...process.env, BKIT_PRE_PUSH_LOGGED: "1" };`), with no change to the test's name, steps or assertions, then re-run `pnpm typecheck`. — Fixable: true
INTEGRATION: TASK 5 (group 2) and TASK 8 (group 3) — the recorded decision no longer matches the hook. TASK 5's DONE WHEN has the owner's choice of "which variables the pre-push gate may receive" recorded in `docs/decisions.jsonl` and the hook copies match it. The latest row `922-pre-push-gate-env-unsets-bkit-env-keys` (`docs/decisions.jsonl:802`, updates 2) says the inner run "unsets every key named in .bkit/.env" and "starts with a loop that reads the key names from .bkit/.env". After TASK 8, both hook copies (`.bkit/templates/.husky/pre-push:61-64`, `.husky/pre-push:61-64`) first unset the fixed nine-key list from `docs/security.md` § `.bkit/.env` scope whether or not `.bkit/.env` exists, and the extractor (TASK 7) also reads `KEY = v`, `KEY: v` and `export KEY=v`. The row's claim that this keeps `BKIT_GH_TOKEN` from the gate is the claim TASK 8 showed false on the cloud path. Fix: append an updated row through the ledger write idiom in `.bkit/jsonl.md` (same key, `updates` 3, real millisecond `ts`, `firstTs` 1794437893959) whose summary and description name both unset sources, the fixed list and every key `.bkit/.env` names in direnv's dotenv grammar, then re-run `.bkit/core/engine/audits/repo/ledger-integrity.test.ts`. — Fixable: true
