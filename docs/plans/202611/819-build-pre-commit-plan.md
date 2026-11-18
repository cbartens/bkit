# Check dist against the staged tree Implementation Plan

> [!CAUTION]
> **Purpose:** The implementation plan: pre-flight checks, gates, the runbook, verification and rollback.

## Context & Goals

`pnpm bkit:check:dist` (`package.json:89`) rebuilds `dist/` from the whole working tree and diffs it against the index, so another agent's unstaged engine edit refuses an unrelated commit and the check rewrites the shared `dist/`. The goal is a check that compiles only the staged tree, leaves the working tree's `dist/` alone, and still refuses a stale staged `dist/` with the same message.

**Related Issues:**

- #819 — Pre-commit dist check blocks parallel agents (open)
- #345 — Failures triage (tracker)

---

## 👤 ⚠️ Acceptance Scenario

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

### Narrative

An agent stages its own engine edit and a matching `dist/`, while another agent has an unstaged engine edit in the same checkout. The commit goes through, and the check does not touch the working tree's `dist/`.

### Success Criteria

- The dist check compiles the staged tree, not the working tree.
- An unstaged engine edit beside a staged one does not refuse the commit when the staged `dist/` matches the staged sources.
- A staged engine edit with a stale staged `dist/` is still refused with `[bkit] dist/ is stale — run pnpm build and commit the result`.
- The check leaves the working tree's `dist/` untouched.

### Process Sketch

- **WHEN** a commit stages a non-test engine `.ts` file **→ THEN** `.husky/pre-commit` runs `pnpm bkit:check:dist`, which exports the index into a scratch directory under `tmp/`, compiles it there and compares the output with `git ls-files -s dist/`.
- **WHEN** the compiled output equals the staged `dist/` **→ THEN** the check exits 0 and removes the scratch directory.
- **IF** the output differs from the staged `dist/` (changed, missing or extra file, or a changed file mode) **→ THEN** the check prints `[bkit] dist/ is stale — run pnpm build and commit the result` and exits 1.
- **IF** `tsc` fails on the staged tree **→ THEN** the check prints the compiler output and exits 1.

### Concrete Example

**Setup:** An agent stages `.bkit/core/engine/a.ts` and its rebuilt `dist/a.js`. Another agent has an unstaged edit to `.bkit/core/engine/b.ts`.

**Steps:**

1. Agent runs `git commit` → `.husky/pre-commit` runs `pnpm bkit:check:dist`.
2. The check exports the index to `tmp/check-dist-*`, compiles it and compares → the output matches the staged `dist/`, so the commit is allowed.

**Outcome:** The commit lands, the unstaged `b.ts` edit stays unstaged, and the working tree's `dist/` is byte-for-byte what it was before.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Staged source and staged `dist/` match; unstaged engine edit present | Commit allowed |
| Staged source changed, staged `dist/` stale | Commit refused with `[bkit] dist/ is stale — run pnpm build and commit the result` |
| Partially staged file (some hunks staged) | Only the staged hunks are compiled |
| Staged file deleted | Its output is expected to be gone from staged `dist/`; a leftover staged output refuses the commit |
| `tsc` fails on the staged tree | Commit refused with the compiler error |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay or Smoke. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| Dist check passes for the staged tree with an unstaged engine edit beside it | Integration | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` | 1 |
| Dist check refuses a stale staged dist | Integration | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` | 1 |
| Dist check leaves the working tree's dist untouched | Integration | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` | 1 |
| refuses a staged dist file shadowed by a tab-named twin | Integration | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` | 3 |
| refuses a staged dist that matches the build only through a gitattributes filter | Integration | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` | 4 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

New file `scripts/gate/bkit-check-dist.mjs` (next to the other bkit-repo-only gate script `bkit-gate-changed.mjs`) and new test file `.bkit/core/engine/audits/repo/check-dist.integration.test.ts`. The `bkit:check:dist` script name, its exit codes and its refusal message stay the same. No breaking changes.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

> [!CAUTION]
> 🛑 The owner reads and confirms this section.

- **Assumption:** `tsc` produces the same output in a scratch directory (a copy of the staged `.bkit/core/engine/**`, `tsconfig.json` and `package.json`, with `node_modules` linked) as in the checkout → the check would refuse a correct `dist/`. Task 1's `DONE WHEN` runs the script once on this repo's real tree to confirm it.
- **Assumption:** The check is bkit-repo only (`scripts/gate/` is never shipped, per `docs/architecture.md`) → a consumer would get a script it cannot run. The new script lives under `scripts/gate/`, outside every template.
- **Assumption:** The hook's `git commit` runs the check with `GIT_INDEX_FILE` set when a commit names paths, and the script's `git` calls inherit it → the check would read the wrong index. Every `git` call in the script runs with the inherited environment and no override.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

- Stash the unstaged edits around the check: rejected, a stash is shared with every other agent and touches their work.
- Run `git worktree add` for the staged tree: rejected, it is heavier than exporting only the engine sources and checks out every tracked file.
- Check out the whole index (`git checkout-index -a`): rejected, only `.bkit/core/engine/**`, `tsconfig.json` and `package.json` affect `tsc` output.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| The pre-push gates | The pre-push and CI runs of `bkit:check:dist` see an index equal to the tree, so the new script serves them unchanged | no follow-up |
| #707 (closed) | Fixed the build workflow's per-step commit against this check | closed |

## Suggested Scope Expansion

None.

## Security & Privacy

None — no new routes, DB writes, secrets, or user input. The script reads the repo's own index and writes only under the git-ignored `tmp/`, which it removes on exit.

## Pre-Flight / Dependencies

### Core

- [ ] **Package Management:** no new package; `tsc` is the repo's existing `typescript` dev dependency.
- [ ] **Dependency Versions:** no dependency change.
- [ ] **Existing-Solution Search (reuse over duplicate):** recorded in `Reuse Inventory`.
- [ ] **User Context:** the files are readable.
- [ ] **Project Context:** `docs/failures.jsonl` key `precommit-check-dist-blocks-parallel-agents` is read.
- [ ] **Project Documents:** assessed in `Documentation Consultation`.
- [ ] **Prerequisite Plans:** None.

### Conditional

- [ ] **Deployments & Setup:** `docs/deployments.md` is read only; the pre-push and CI callers keep the `bkit:check:dist` name.

### 🔒 Gate 1: Prerequisites Check

- [ ] **Acceptance Scenario confirmed:** the `👤 ⚠️ Acceptance Scenario` checkbox is `[x]`, ticked by a human.
- [ ] **Breaking Changes confirmed:** the `👤 ⚠️ Breaking Changes & Naming Review` checkbox is `[x]`, ticked by a human.
- [ ] **Open Questions confirmed:** the `👤 ⚠️ Open Questions & Assumptions` checkbox is `[x]`, ticked by a human.
- [ ] **Security & Privacy checked:** `None` is justified.
- [ ] **Reuse Inventory complete:** every capability has a row with `Search performed` and `Decision` filled in.
- [ ] **Reuse reasons:** every `NEW` row cites its reason.
- [ ] **Gate 1 — Verified:** every item above, every Core item and every applicable Conditional item is checked.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | yes — where repo scripts live | `docs/architecture.md` file tree, `scripts/gate/` entry | covered | Read only. The `scripts/gate/` entry does not list `bkit-check-dist.mjs`; this run's file scope excludes the file, so the entry stays as is. |
| technology | `docs/technology.md` | yes — describes `bkit:check:dist` | `docs/technology.md:37` | covered | Read only. Its "rebuilds" wording is out of this run's file scope and stays as is. |
| security | `docs/security.md` | no — no auth, input, secret or PII surface | none | none | None. |
| testing | `docs/testing.md` | yes — new integration test file | `docs/testing.md` § Key test files (`:742`, row `:789`) and the CI static lane (`:996`) | covered | Task 2 adds a Key test files row and updates the lane text. |
| deployments | `docs/deployments.md` | yes — pre-push row 8 and CI "Assert Dist Freshness" | `docs/deployments.md:555`, `:591-592` | covered | Read only. Both lines are out of this run's file scope and stay as is. |
| setup | `docs/setup.md` | yes — lists `pnpm bkit:check:dist` | `docs/setup.md:103` | covered | One-line comment stays accurate; no change. |
| data-schema | `docs/data-schema.md` | no — no database | none | none | None. |
| design | `docs/design.md` | no — no UI | none | none | None. |
| observability | `docs/observability.md` | no — no logging change | none | none | None. |
| noise | `docs/noise.md` | no — no signal downgrade | none | none | None. |

Carry each required read and each doc update into the runbook task that needs it (`READ:` and `UPDATE:` lines).

## Documentation Warnings

None

## Data Schema Integration

None — no database.

### Data Schema Usage

None

### Data Schema Changes

None

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Run the dist check from `bkit:check:dist` | `package.json` | `grep -n 'check:dist' package.json .husky/pre-commit .husky/pre-push`; `grep -rl 'check:dist' . --exclude-dir=node_modules --exclude-dir=dist` | `package.json:89` — the inline `rm -rf dist && tsc && ... git diff --exit-code dist/` chain | EXTEND | Replace the chain with a call to the new script, keeping the script name so the hook, pre-push and CI callers stay unchanged. |
| Export the index, compile it in a scratch directory, compare with `git ls-files -s dist/` | `scripts/gate/bkit-check-dist.mjs` | `grep -rln 'checkout-index' .bkit/core/engine scripts .husky package.json`; `grep -rln 'ls-files -s' .bkit/core/engine scripts`; `ls scripts/gate scripts/ci scripts/cleanup` | None — no script compiles or exports the index; `scripts/gate/bkit-gate-changed.mjs` runs checks on named working-tree files | NEW | (a) The searches find no candidate; the only existing dist check is the inline `package.json` chain, which task 1 replaces. |
| Integration test of the check in a scratch git repo | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` | `ls .bkit/core/engine/audits/repo/`; `grep -rln 'check-dist' .bkit/core/engine --include=*.test.ts`; `grep -rln 'check:dist' .bkit/core/engine --include=*.test.ts` | None — `test-file-script.integration.test.ts` and `agent-text-ceiling.test.ts` cover other scripts; none runs a dist check | NEW | (a) No test exercises the dist check. |

## Architecture & Component Changes

**Ledger rows:** None

### Gate scripts

#### [MODIFY] `package.json`

- **Existence Check:** the file exists; `bkit:check:dist` is at line 89.
- `bkit:check:dist` becomes `node scripts/gate/bkit-check-dist.mjs`.

#### [new] `scripts/gate/bkit-check-dist.mjs`

- **Reuse Check:** `Reuse Inventory` row 2, reason (a).
- Finds the repo root with `git rev-parse --show-toplevel`, makes `tmp/check-dist-*` under it, exports the staged `.bkit/core/engine/**`, `tsconfig.json` and `package.json` with `git checkout-index --prefix=` (a copy of the index, so a partially staged file is compiled as staged), links the repo's `node_modules`, and runs `node_modules/.bin/tsc` there. Sets the executable bit on `dist/cli.js` as `bkit:check:dist` did. Compares every generated `dist/` file's mode and blob hash with `git ls-files -s dist/`; a changed, missing or extra file prints `[bkit] dist/ is stale — run pnpm build and commit the result` and exits 1. A `tsc` failure prints the compiler output and exits 1. Removes the scratch directory on every exit path and never writes to the working tree's `dist/`.

#### [new] `.bkit/core/engine/audits/repo/check-dist.integration.test.ts`

- **Reuse Check:** `Reuse Inventory` row 3, reason (a).
- Builds a scratch git repo with a small engine source, `tsconfig.json`, `package.json` and a linked `node_modules`, runs the script with `cwd` set to it, and asserts on exit code, message and the working tree's `dist/` bytes.

### Cron Jobs & Scheduled Tasks

None

## Supersession Inventory

<!-- prettier-ignore -->
| Existing artifact | Replaced by | Decision | Justification |
| --- | --- | --- | --- |
| The inline `rm -rf dist && tsc && chmod +x dist/cli.js && git diff --exit-code dist/` chain in `package.json` `bkit:check:dist` | `scripts/gate/bkit-check-dist.mjs` | EXTEND | The script name stays; only its body moves into a script that reads the index. |

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/testing.md` | Key test files row for `check-dist.integration.test.ts`; the CI static lane text no longer spells the `rm -rf dist && tsc` chain. |

## Rollback Strategy

Code-only — `git revert` sufficient.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Check dist against the staged tree

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Compile the index into a scratch directory and compare with the staged `dist/`
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

- [x] **TASK 2:** Update `docs/testing.md` for the dist check
  - **UPDATE:** `docs/testing.md`: a Key test files row for `check-dist.integration.test.ts`, and the static-lane text near line 996
  - **READ:** `docs/failures.jsonl`: key `precommit-check-dist-blocks-parallel-agents`
  - **READ:** `docs/deployments.md`: lines 555 and 591-592, the other callers of `bkit:check:dist`
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `docs/testing.md` lists `check-dist.integration.test.ts` in Key test files, and its static-lane text no longer describes `bkit:check:dist` as `rm -rf dist && tsc` on the working tree
  - **TEST FIRST:** n/a — documentation only, no behaviour change

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Challenge round 1 findings

<!-- bkit:task 3 start -->

- [x] **TASK 3:** A committer ships a payload in `dist/cli.js` past CI and the release gate by committing a legit copy as `dist/cli.js<TAB>x`; the parser drops everything after the tab, so the twin's hash overwrites the payload's in `expected` and the sizes still match
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `scripts/gate/bkit-check-dist.mjs:73` · **Round:** 1
  - **DONE WHEN:** the staged-entry parser keeps the whole path after the first tab (`line.slice(line.indexOf("\t") + 1)`), a repeated path in `git ls-files -s` output refuses the check, and the comparison checks both directions (every `expected` key is in `actual` and every `actual` key is in `expected`), so a staged `dist/` file with a payload and a tab-named twin holding the built bytes exits 1 with `[bkit] dist/ is stale — run pnpm build and commit the result`
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` `refuses a staged dist file shadowed by a tab-named twin` fails on the check exiting 0 after `dist/a.js` is staged with a payload and `dist/a.js\tx` is staged with the built `a.js` bytes (reproduced in a scratch repo: the new script exits 0, the old `rm -rf dist && tsc && git diff --exit-code dist/` chain exits 1)

<!-- bkit:task 3 end -->
<!-- bkit:task 4 start -->

- [x] **TASK 4:** A committer ships executable code in `dist/cli.js` past CI and the release gate by adding a `.gitattributes` rule such as `tmp/**/dist/cli.js working-tree-encoding=UTF-7`; `git hash-object` runs that rule on the scratch output, so a source comment `// +AAo-console.log(+ACI-PWNED+ACI-)+ADs-` hashes as the committed file with `console.log("PWNED");` on its own line
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `scripts/gate/bkit-check-dist.mjs:83` · **Round:** 1
  - **DONE WHEN:** the scratch outputs are hashed as raw bytes (`git hash-object --no-filters`), so no `.gitattributes` rule on the scratch path can change what is compared, and a committed `dist/` file that differs in bytes from the scratch compile exits 1 with `[bkit] dist/ is stale — run pnpm build and commit the result` (reproduced in a scratch repo: the new script exits 0 and `node dist/cli.js` prints `PWNED`, the old chain refuses)
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` `refuses a staged dist that matches the build only through a gitattributes filter` fails on the check exiting 0 after `.gitattributes` with `tmp/**/dist/a.js working-tree-encoding=UTF-7`, an `a.ts` comment `// +AAo-console.log(+ACI-PWNED+ACI-)+ADs-` and a `dist/a.js` holding the UTF-7-decoded build are staged

<!-- bkit:task 4 end -->
<!-- bkit:group 2 end -->

### 🔒 Gate 2: Code Implementation Check

- [ ] **No bolt-on:** every `[NEW]` file traces to a `Reuse Inventory` `NEW` row.
- [ ] **Extensions landed:** every `EXTEND` landed in the artifact its row names.
- [ ] **No gate weakened:** no gate was weakened.
- [ ] **Red before code:** the tests step recorded every planned test of the group red before its code step ran.
- [ ] **Tests unchanged:** every planned test case matches the lines its red row recorded, or a code step's `BLOCKED` line names the change for the owner.
- [ ] **Unproven tests:** each planned test with no proven red is cleared only by a human-committed `TEST EXCEPTION` field.
- [ ] **Gate 2 — Verified:** every box above is checked.

**Mandatory Tasks (Testing & Documentation):**

- [ ] **Verify test coverage against Derived Test Matrix:** each row's test is in task 1's `DONE WHEN`.
- [ ] **Sweep existing tests:** broken tests are fixed, and the full suite passes.
- [ ] **Sweep new tests:** every test a task's `DONE WHEN` names exists and passes.
- [ ] **Verify observability:** None — no logging change.
- [ ] **Update documentation:** the affected docs are rewritten to match.

### 🔒 Gate 3: Testing & Documentation Check

- [ ] **Docs updated:** every `Documentation Updates` row is done.
- [ ] **Docs index accurate:** `.agents/docs.md` is accurate.
- [ ] **Gate 3 — Verified:** every box above is checked.

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** the deepest declared `bkit:gate:*` script and `bkit check` pass.
- [ ] **Test Synchronization:** no existing E2E test changes.
- [ ] **Build Configuration:** the scratch directory sits under the git-ignored `tmp/`, which `tsconfig.json` excludes.
- [ ] **Integration (`.bkit/core/engine/audits/repo/check-dist.integration.test.ts`):** the three tests pass; each runs in a temporary git repo removed afterwards.
- [ ] **Apply local migrations:** None — no database.
- [ ] **Run all tests:** `pnpm test` and `pnpm test:integration` pass.

### 🔒 Gate 4: Automated Verification Check

- [ ] **Gate 4 — Verified:** every Automated Tests box is checked, with proof (test output, a CLI result or an API response).

### Manual Verification

> [!CAUTION]
> **Owner-run acceptance checks, advisory only.** An unticked box blocks nothing: not the merge, and not plan approval. This is not a Gate 1 human-confirmation section.

- [ ] **Step 1:** Stage an engine change with its rebuilt `dist/`, leave an unrelated engine edit unstaged, and run `git commit`; the commit is allowed and `git diff -- dist/` shows no change.
