# Brief: group 1 — Check dist against the staged tree

Plan: Check dist against the staged tree Implementation Plan

## Why and what

### Context & Goals

`pnpm bkit:check:dist` (`package.json:89`) rebuilds `dist/` from the whole working tree and diffs it against the index, so another agent's unstaged engine edit refuses an unrelated commit and the check rewrites the shared `dist/`. The goal is a check that compiles only the staged tree, leaves the working tree's `dist/` alone, and still refuses a stale staged `dist/` with the same message.

**Related Issues:**

- #819 — Pre-commit dist check blocks parallel agents (open)
- #345 — Failures triage (tracker)

---

### Narrative

An agent stages its own engine edit and a matching `dist/`, while another agent has an unstaged engine edit in the same checkout. The commit goes through, and the check does not touch the working tree's `dist/`.

### Success Criteria

- The dist check compiles the staged tree, not the working tree.
- An unstaged engine edit beside a staged one does not refuse the commit when the staged `dist/` matches the staged sources.
- A staged engine edit with a stale staged `dist/` is still refused with `[bkit] dist/ is stale — run pnpm build and commit the result`.
- The check leaves the working tree's `dist/` untouched.

### Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The pre-push gates | The pre-push and CI runs of `bkit:check:dist` see an index equal to the tree, so the new script serves them unchanged | no follow-up |
| #707 (closed) | Fixed the build workflow's per-step commit against this check | closed |

## Where it fits

- Group 1: Check dist against the staged tree — this group
  - TASK 1: Compile the index into a scratch directory and compare with the staged `dist/` — open
  - TASK 2: Update `docs/testing.md` for the dist check — open

## The work

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Compile the index into a scratch directory and compare with the staged `dist/`
  - **CREATE:** `scripts/gate/bkit-check-dist.mjs`: exports the staged engine sources into `tmp/check-dist-*`, links `node_modules`, runs `tsc`, compares mode and blob hash of each output file with `git ls-files -s dist/`, and cleans up the scratch directory
  - **UPDATE:** `bkit:check:dist` in `package.json`: calls `node scripts/gate/bkit-check-dist.mjs` and drops the working-tree compile (`rm -rf dist && tsc && chmod +x dist/cli.js && git diff --exit-code dist/`) from that script line, so one dist check remains
  - **CREATE:** `.bkit/core/engine/audits/repo/check-dist.integration.test.ts`: the three tests, run against a scratch git repo
  - **READ:** `.husky/pre-commit`: lines 18-22, the caller
  - **READ:** `.bkit/core/engine/audits/repo/test-file-script.integration.test.ts`: the scratch-directory and `spawnSync` pattern for repo-script tests
  - **READ:** `tsconfig.json`: `rootDir`, `include` and `exclude` that the scratch copy must keep
  - **DONE WHEN:** the three tests in `check-dist.integration.test.ts` pass; `bkit:check:dist` in `package.json` calls `scripts/gate/bkit-check-dist.mjs` and no longer holds `rm -rf dist && tsc`; the script keeps the edge-case behaviour (only staged hunks of a partially staged file are compiled, a staged deletion whose output is still in the staged `dist/` is refused, a `tsc` failure on the staged tree is refused with the compiler error); `node scripts/gate/bkit-check-dist.mjs` exits 0 on this repo's real tree, which confirms on one real build that `tsc` gives the same output in the scratch copy with linked `node_modules` as in the checkout, and leaves no `tmp/check-dist-*` directory behind; and a real `git commit` of a staged engine file with a matching staged `dist/`, with another file's engine edit unstaged beside it, is allowed
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` `passes for the staged tree with an unstaged engine edit beside it` fails on the stub exiting 1 with "dist/ is stale" because the unstaged edit is compiled
    - `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` `refuses a stale staged dist` fails on a stale staged `dist/` being accepted with exit 0
    - `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` `leaves the working tree's dist untouched` fails on the working tree's `dist/` bytes changing after the check

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** Update `docs/testing.md` for the dist check
  - **UPDATE:** `docs/testing.md`: a Key test files row for `check-dist.integration.test.ts`, and the static-lane text near line 996
  - **READ:** `docs/failures.jsonl`: key `precommit-check-dist-blocks-parallel-agents`
  - **READ:** `docs/deployments.md`: lines 555 and 591-592, the other callers of `bkit:check:dist`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `docs/testing.md` lists `check-dist.integration.test.ts` in Key test files, and its static-lane text no longer describes `bkit:check:dist` as `rm -rf dist && tsc` on the working tree
  - **TEST FIRST:** n/a — documentation only, no behaviour change

<!-- bkit:task 2 end -->

### Reuse Inventory rows

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Run the dist check from `bkit:check:dist` | `package.json` | `grep -n 'check:dist' package.json .husky/pre-commit .husky/pre-push`; `grep -rl 'check:dist' . --exclude-dir=node_modules --exclude-dir=dist` | `package.json:89` — the inline `rm -rf dist && tsc && ... git diff --exit-code dist/` chain | EXTEND | Replace the chain with a call to the new script, keeping the script name so the hook, pre-push and CI callers stay unchanged. |
| Export the index, compile it in a scratch directory, compare with `git ls-files -s dist/` | `scripts/gate/bkit-check-dist.mjs` | `grep -rln 'checkout-index' .bkit/core/engine scripts .husky package.json`; `grep -rln 'ls-files -s' .bkit/core/engine scripts`; `ls scripts/gate scripts/ci scripts/cleanup` | None — no script compiles or exports the index; `scripts/gate/bkit-gate-changed.mjs` runs checks on named working-tree files | NEW | (a) The searches find no candidate; the only existing dist check is the inline `package.json` chain, which task 1 replaces. |
| Integration test of the check in a scratch git repo | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` | `ls .bkit/core/engine/audits/repo/`; `grep -rln 'check-dist' .bkit/core/engine --include=*.test.ts`; `grep -rln 'check:dist' .bkit/core/engine --include=*.test.ts` | None — `test-file-script.integration.test.ts` and `agent-text-ceiling.test.ts` cover other scripts; none runs a dist check | NEW | (a) No test exercises the dist check. |

### Architecture entries

#### [MODIFY] `package.json`

- **Existence Check:** the file exists; `bkit:check:dist` is at line 89.
- `bkit:check:dist` becomes `node scripts/gate/bkit-check-dist.mjs`.

#### [new] `scripts/gate/bkit-check-dist.mjs`

- **Reuse Check:** `Reuse Inventory` row 2, reason (a).
- Finds the repo root with `git rev-parse --show-toplevel`, makes `tmp/check-dist-*` under it, exports the staged `.bkit/core/engine/**`, `tsconfig.json` and `package.json` with `git checkout-index --prefix=` (a copy of the index, so a partially staged file is compiled as staged), links the repo's `node_modules`, and runs `node_modules/.bin/tsc` there. Sets the executable bit on `dist/cli.js` as `bkit:check:dist` did. Compares every generated `dist/` file's mode and blob hash with `git ls-files -s dist/`; a changed, missing or extra file prints `[bkit] dist/ is stale — run pnpm build and commit the result` and exits 1. A `tsc` failure prints the compiler output and exits 1. Removes the scratch directory on every exit path and never writes to the working tree's `dist/`.

#### [new] `.bkit/core/engine/audits/repo/check-dist.integration.test.ts`

- **Reuse Check:** `Reuse Inventory` row 3, reason (a).
- Builds a scratch git repo with a small engine source, `tsconfig.json`, `package.json` and a linked `node_modules`, runs the script with `cwd` set to it, and asserts on exit code, message and the working tree's `dist/` bytes.

## Deviations

- Files in scope: a new repo-only script for the check (beside the other gate scripts under `scripts/gate/`, unless `docs/architecture.md` names another home), `package.json` (`bkit:check:dist` calls it), the new test `.bkit/core/engine/audits/repo/check-dist.integration.test.ts`, `docs/testing.md`. The check is bkit-repo only: nothing goes into `dist`, `.bkit/core`, `.bkit/shared` or `.bkit/templates` except that one test file. Two other builds are running (1018 and 1039). Do not edit `.bkit/core/engine/commands/workflow/*.ts`, `.bkit/core/engine/ledgers/telemetry.ts`, `.bkit/core/engine/checks/tips/detect.ts`, `.bkit/core/workflows/*.md` or `.bkit/instructions.md`; if the work needs one of them, stop and message me.
- Removes: the working-tree compile inside the `bkit:check:dist` script line in `package.json` (`rm -rf dist && tsc && ...`); the new script replaces it, so there is still one dist check.
- No test may be weakened, skipped or given a longer timeout.
- Subagents do not commit.
- Never run `pnpm bkit:text:ceiling raise`.
