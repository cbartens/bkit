# Brief: group 2 — Challenge round 1 findings

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

- Group 1: Check dist against the staged tree — done
  - TASK 1: Compile the index into a scratch directory and compare with the staged `dist/` — done
  - TASK 2: Update `docs/testing.md` for the dist check — done
- Group 2: Challenge round 1 findings — this group
  - TASK 3: A committer ships a payload in `dist/cli.js` past CI and the release gate by committing a legit copy as `dist/cli.js<TAB>x`; the parser drops everything after the tab, so the twin's hash overwrites the payload's in `expected` and the sizes still match — open
  - TASK 4: A committer ships executable code in `dist/cli.js` past CI and the release gate by adding a `.gitattributes` rule such as `tmp/**/dist/cli.js working-tree-encoding=UTF-7`; `git hash-object` runs that rule on the scratch output, so a source comment `// +AAo-console.log(+ACI-PWNED+ACI-)+ADs-` hashes as the committed file with `console.log("PWNED");` on its own line — open

## The work

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** A committer ships a payload in `dist/cli.js` past CI and the release gate by committing a legit copy as `dist/cli.js<TAB>x`; the parser drops everything after the tab, so the twin's hash overwrites the payload's in `expected` and the sizes still match
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `scripts/gate/bkit-check-dist.mjs:73` · **Round:** 1
  - **DONE WHEN:** the staged-entry parser keeps the whole path after the first tab (`line.slice(line.indexOf("\t") + 1)`), a repeated path in `git ls-files -s` output refuses the check, and the comparison checks both directions (every `expected` key is in `actual` and every `actual` key is in `expected`), so a staged `dist/` file with a payload and a tab-named twin holding the built bytes exits 1 with `[bkit] dist/ is stale — run pnpm build and commit the result`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` `refuses a staged dist file shadowed by a tab-named twin` fails on the check exiting 0 after `dist/a.js` is staged with a payload and `dist/a.js\tx` is staged with the built `a.js` bytes (reproduced in a scratch repo: the new script exits 0, the old `rm -rf dist && tsc && git diff --exit-code dist/` chain exits 1)
<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->
- [ ] **TASK 4:** A committer ships executable code in `dist/cli.js` past CI and the release gate by adding a `.gitattributes` rule such as `tmp/**/dist/cli.js working-tree-encoding=UTF-7`; `git hash-object` runs that rule on the scratch output, so a source comment `// +AAo-console.log(+ACI-PWNED+ACI-)+ADs-` hashes as the committed file with `console.log("PWNED");` on its own line
  **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `scripts/gate/bkit-check-dist.mjs:83` · **Round:** 1
  - **DONE WHEN:** the scratch outputs are hashed as raw bytes (`git hash-object --no-filters`), so no `.gitattributes` rule on the scratch path can change what is compared, and a committed `dist/` file that differs in bytes from the scratch compile exits 1 with `[bkit] dist/ is stale — run pnpm build and commit the result` (reproduced in a scratch repo: the new script exits 0 and `node dist/cli.js` prints `PWNED`, the old chain refuses)
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` `refuses a staged dist that matches the build only through a gitattributes filter` fails on the check exiting 0 after `.gitattributes` with `tmp/**/dist/a.js working-tree-encoding=UTF-7`, an `a.ts` comment `// +AAo-console.log(+ACI-PWNED+ACI-)+ADs-` and a `dist/a.js` holding the UTF-7-decoded build are staged
<!-- bkit:task 4 end -->

## Deviations

- Files in scope: a new repo-only script for the check (beside the other gate scripts under `scripts/gate/`, unless `docs/architecture.md` names another home), `package.json` (`bkit:check:dist` calls it), the new test `.bkit/core/engine/audits/repo/check-dist.integration.test.ts`, `docs/testing.md`. The check is bkit-repo only: nothing goes into `dist`, `.bkit/core`, `.bkit/shared` or `.bkit/templates` except that one test file. Two other builds are running (1018 and 1039). Do not edit `.bkit/core/engine/commands/workflow/*.ts`, `.bkit/core/engine/ledgers/telemetry.ts`, `.bkit/core/engine/checks/tips/detect.ts`, `.bkit/core/workflows/*.md` or `.bkit/instructions.md`; if the work needs one of them, stop and message me.
- Removes: the working-tree compile inside the `bkit:check:dist` script line in `package.json` (`rm -rf dist && tsc && ...`); the new script replaces it, so there is still one dist check.
- No test may be weakened, skipped or given a longer timeout.
- Subagents do not commit.
- Never run `pnpm bkit:text:ceiling raise`.
