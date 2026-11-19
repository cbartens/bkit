# Pre-push dist check judges the pushed commit Implementation Plan

## Context & Goals

The source repo's `.husky/pre-push` runs `pnpm bkit:check:dist` on every push except a min push. That check (`scripts/gate/bkit-check-dist.mjs`) compiles the staged tree (the index) and compares it with the staged `dist/`. At push time the commits being pushed matter, not the index, so a staged-but-uncommitted fix hides a stale `dist/` in a pushed commit, and an unrelated staged edit blocks a correct push (issue #1048).

The fix: the script takes an optional `--ref=<commit>` and then compiles that commit's tree and compares it with that commit's `dist/`. With no `--ref` it reads the index exactly as today, because `.husky/pre-commit` needs that. The pre-push hook passes the commit it already resolves: `PUSH_DEV_SHA`, else `PUSH_BRANCH_SHA`.

**Decision on an empty `PUSH_DEV_SHA`** (settled by the orchestrator, option B): the hook passes `--ref` with `PUSH_DEV_SHA` when it is set, else `PUSH_BRANCH_SHA` (the commit pushed to the checked-out branch) when that is set. When both are empty (a tag push, a delete mixed into a push, a push of a branch that is not checked out) it keeps today's call with no argument and reads the index. It never passes an all-zero hash: the hook's ref loop only sets either variable for a non-zero local hash, and the new code also clears an all-zero value. The existing test `.husky/pre-push: a code push still runs them` pushes the checked-out feature branch, so its expectation changes from the exact line `bkit:check:dist` to `bkit:check:dist --ref=<pushed commit>`.

**Shipped hook template:** `.bkit/templates/.husky/pre-push` has no dist check (`grep -rln "check:dist\|check-dist" .bkit/templates` lists nothing), so nothing is added there.

**Removes:** Nothing. One check gains one option.

**Related Issues:**

- #1048 — Pre-push dist check reads the index, not the commit being pushed
- #819 — Build the pre-commit dist freshness check from the staged tree (closed; introduced the index read)

---

## Acceptance Scenario

### Narrative

A developer pushes a commit to `dev`. The dist check judges that commit's own `dist/`, not whatever is staged beside it.

### Success Criteria

- `node scripts/gate/bkit-check-dist.mjs --ref=<commit>` fails when the commit's `dist/` is stale, even if the fix is staged.
- The same call passes when the commit is correct, even if an unrelated engine edit is staged.
- With no `--ref` the script reads the index, as before.
- A `--ref` value that starts with `-`, or that git cannot resolve to a commit, is refused with exit 1 before any compile.
- `.husky/pre-push` passes `--ref=<pushed commit>`: `PUSH_DEV_SHA` for a push to `dev`, else `PUSH_BRANCH_SHA` for a push of the checked-out branch. A push with both empty keeps the no-argument call, and no all-zero hash is ever passed.

### Process Sketch

- **WHEN** `.husky/pre-push` sees a push that is not a min push and `PUSH_DEV_SHA` or `PUSH_BRANCH_SHA` is set **→ THEN** it runs `pnpm bkit:check:dist --ref="<that commit>"`, `PUSH_DEV_SHA` first.
- **WHEN** the script gets `--ref=<value>` **→ THEN** it resolves the value to a full hash with `git rev-parse --verify --end-of-options <value>^{commit}`, exports that commit's tree into the scratch folder, compiles it and compares with that commit's `dist/`.
- **IF** the value starts with `-`, is empty, or does not resolve **→ THEN** the script prints `[bkit] --ref value is not a commit: <value>`, exits 1 and leaves no scratch folder.
- **IF** both variables are empty (tag push, branch that is not checked out) **→ THEN** the hook calls the check with no argument and it reads the index.

### Concrete Example

**Setup:** A scratch repo whose commit `HEAD` holds `a.ts` changed and a `dist/` built from the old `a.ts`. The developer has rebuilt `dist/` and staged it, but not committed.

**Steps:**

1. Developer pushes `HEAD` to `dev` (or to the checked-out branch) → the hook runs `bkit:check:dist --ref=<HEAD hash>`.
2. Script compiles `HEAD`'s tree and compares it with `HEAD`'s `dist/` → they differ.

**Outcome:** The push is blocked with `[bkit] dist/ is stale — run pnpm build and commit the result`. Today it passes.

### Edge Cases

<!-- prettier-ignore -->
| Scenario | Expected Behavior |
| --- | --- |
| Commit is correct, an unrelated engine edit is staged | `--ref` call exits 0; the no-`--ref` call still exits 1 (it reads the index) |
| `--ref=-x` or `--ref=--output=x` | Exit 1, "is not a commit" message, no git option is ever read from the value |
| `--ref=` (empty) or an unknown hash or name | Exit 1, "is not a commit" message |
| A ref name such as `HEAD` or a branch | Resolved to its full hash first; the hash is what the script uses |
| Another argument the script does not know | Exit 1 with a message; never silently ignored |
| Push to the checked-out branch, not `dev` | Hook passes `--ref` with `PUSH_BRANCH_SHA` |
| Push to `dev` and to the checked-out branch in one push | `PUSH_DEV_SHA` wins |
| Push with both variables empty (tag, other branch) | Hook keeps the no-argument call (reads the index), as today |
| Delete mixed into a push | The deleted ref's all-zero hash is never passed as `--ref` |

### Derived Test Matrix

`Type` is a tier from `docs/testing.md`: Static, Unit, Integration, @live (golden), E2E, fresh-DB replay or Smoke. `Task` is the one runbook task that lands the row's test.

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| `--ref` of a commit with a stale `dist/`, fix staged and not committed, fails as stale | Integration | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` | 1 |
| `--ref` of a correct commit passes while an unrelated engine edit is staged | Integration | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` | 1 |
| `--ref` values starting with `-`, empty, or not a commit are refused and leave no scratch folder | Integration | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` | 1 |
| Without `--ref` the check still reads the index, not the commit | Integration | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` | 1 |
| A code push of the checked-out branch runs the dist check with `--ref` of the pushed commit | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 2 |
| A push to `dev` runs the dist check with `--ref` of the commit pushed to `dev`, which wins over the branch commit | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 2 |
| A push with both variables empty runs the dist check with no argument | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 2 |

### 👤 ✅ Human Confirmation

- [ ] **Acceptance Scenario confirmed:** I have reviewed the Narrative, Success Criteria, Process Sketch, Concrete Example, Edge Cases, and Derived Test Matrix above. They correctly describe what "done" looks like.

---

## 👤 ⚠️ Breaking Changes & Naming Review

None — no breaking change. The new option name is `--ref`, as the issue says. A call with no argument behaves as before.

### 👤 ✅ Human Confirmation

- [ ] **Breaking Changes confirmed:** I have reviewed every breaking change and naming decision above.

---

## 👤 ⚠️ Open Questions & Assumptions

- **Assumption:** `pnpm bkit:check:dist --ref=<sha>` hands `--ref=<sha>` to the script unchanged, as `pnpm run` does for options placed after the script name → if wrong, `package.json` would need a `--` pass-through, which this run allows.
- **Assumption:** `git checkout-index` into the scratch folder reads `.gitattributes` the same way for a temporary index as for the real one → if wrong, a `.gitattributes` filter could change exported sources; the existing index-mode behaviour is unchanged.
- **Settled by the orchestrator — feature-branch push:** the hook passes `--ref` with `PUSH_DEV_SHA`, else `PUSH_BRANCH_SHA`, and no `--ref` when both are empty. `husky-pre-push.integration.test.ts` may change only for the tests named in TASK 2.

### 👤 ✅ Human Confirmation

- [ ] **Open Questions & Assumptions confirmed:** I have resolved or explicitly accepted every open question and assumption above.

---

## Alternative Approaches & Recommendations

Read the pushed commit through `git archive | tar` instead of a temporary index: rejected, because the temporary index lets the script keep its `checkout-index`, `ls-files -s` and duplicate-entry code unchanged for both modes.

## Out of Scope

<!-- prettier-ignore -->
| Excluded item | Why `Exempt` | Where it belongs |
| --- | --- | --- |
| Changing CI's `Assert Dist Freshness` step or `release.yml` | A clean checkout already makes index equal commit | Not needed |
| Adding a dist check to `.bkit/templates/.husky/pre-push` | Consumers have no `dist/` gate (`docs/deployments.md` § check order, row 8) | Not needed |

## Suggested Scope Expansion

None

## Security & Privacy

None — no new routes, DB writes, secrets or user input beyond one command-line value. The `--ref` value is validated before it reaches git: it is refused when it starts with `-`, and it is resolved with `git rev-parse --verify --end-of-options <value>^{commit}`. Only the resolved full hash goes into later git calls.

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Recommended path | Applies | Source used (path and section) | Coverage | Gap and action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | no — no component or topology change; a gate script gains an option | none | none | Not applicable: no topology change. |
| technology | `docs/technology.md` | yes — it names `bkit:check:dist` | `docs/technology.md` line 51 (compiled `dist/` and `bkit:check:dist`) | covered | None; the line stays true. |
| security | `docs/security.md` | yes — a command-line value reaches git | `.agents/rules.md` External input rule; the validation is in Security & Privacy above | partial | `docs/security.md` was not read for this plan; the checks come from the run brief. Action: none, repository evidence is enough. |
| testing | `docs/testing.md` | yes — the check-dist test row changes | `docs/testing.md` line 924 (check-dist test row) | covered | None. |
| data-schema | `docs/data-schema.md` | no — no database | none | none | Not applicable. |
| design | `docs/design.md` | no — no UI | none | none | Not applicable. |
| observability | `docs/observability.md` | no — no log or span change | none | none | Not applicable. |
| deployments | `docs/deployments.md` | yes — it states how the check and the hooks work | `docs/deployments.md` lines 581, 607, 617, 619, 625 | covered | Lines 617 and 619 are updated in TASK 3. |

## Documentation Warnings

None

## Data Schema Integration

None — no database.

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | File | Search performed | Existing candidates | Decision | Justification |
| --- | --- | --- | --- | --- | --- |
| Read a commit's tree instead of the index in the dist check | `scripts/gate/bkit-check-dist.mjs` | `grep -rln "bkit:check:dist\|check-dist" scripts .husky .bkit package.json`, read the whole script, `git rev-parse` docs for `--end-of-options` | `scripts/gate/bkit-check-dist.mjs` — compiles the index; export, compile and compare code fits a commit's tree through a temporary index | EXTEND | Add argument parsing, ref validation and a temporary index (`GIT_INDEX_FILE` with `git read-tree`) that feeds the existing `checkout-index` and `ls-files -s` calls. |
| Tests for the `--ref` option | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` | read the whole file, `grep -rn "check-dist" .bkit/core/engine --include=*.test.ts -l` | `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` — has `scratchRepo`, `check`, `build`, `write`, `git` helpers and per-test timeouts | EXTEND | Add tests in the same file with the same helpers; `check` gains optional arguments. |
| Pre-push call with the pushed commit | `.husky/pre-push` | `grep -n "PUSH_DEV_SHA\|PUSH_BRANCH_SHA\|check:dist" .husky/pre-push`, `grep -rln "check:dist\|check-dist" .bkit/templates` | `.husky/pre-push` — resolves `PUSH_DEV_SHA` and `PUSH_BRANCH_SHA` already; `.bkit/templates/.husky/pre-push` — has no dist check | EXTEND | Change the existing "bkit repo only" call to pass `--ref` with `PUSH_DEV_SHA`, else `PUSH_BRANCH_SHA`. |
| Hook tests for the `--ref` call | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | `grep -n "bkit:check:dist" .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`, read the `push` helper near line 1114 | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` — the `.husky/pre-push min push` block has `push(hook, sha, remoteRef, remoteSha, extraRefs)`, a stub `pnpm` that logs each call and `commitFiles` | EXTEND | Change one expectation, add two tests in the same block with the same helpers. |
| Doc lines describing the check | `docs/deployments.md` | `grep -n "check:dist\|check-dist" docs/testing.md docs/deployments.md docs/setup.md docs/technology.md` | `docs/deployments.md` lines 617, 619; `docs/testing.md` line 924 — state the index-only rule | EXTEND | Reword those lines to state the `--ref` rule. |

## Architecture & Component Changes

### Gate script

#### [MODIFY] `scripts/gate/bkit-check-dist.mjs`

- **Existence Check:** the file exists.
- Parse `process.argv.slice(2)`: only `--ref=<value>` is known; anything else exits 1 with a message.
- Validate `<value>`: refuse an empty value or one starting with `-`; otherwise run `git rev-parse --verify --end-of-options <value>^{commit}` (via `spawnSync`, no shell) and keep the resolved full hash. A failure prints `[bkit] --ref value is not a commit: <value>` and exits 1 before any scratch folder exists.
- With a ref: build a temporary index file beside the scratch folder (`tmp/check-dist-*.index`, removed in `finally`), fill it with `git read-tree <hash>` under `GIT_INDEX_FILE`, and run the existing `ls-files`, `checkout-index` and `ls-files -s -- dist/` calls with that variable set. Without a ref: the calls run against the real index, as today.
- Update the header comment to say it reads the index, or the commit named by `--ref`.

### Hook

#### [MODIFY] `.husky/pre-push`

- **Existence Check:** the file exists.
- In the "bkit repo only" block (near line 391), set `DIST_REF` to `PUSH_DEV_SHA`, else `PUSH_BRANCH_SHA`, and clear it when it is all zeros. When `DIST_REF` is non-empty run `pnpm bkit:check:dist --ref="$DIST_REF" < /dev/null`; when it is empty run `pnpm bkit:check:dist < /dev/null`. `bkit:lint:workflows` stays. Update the comment above the block to say the dist check judges the commit pushed to `dev`, else to the checked-out branch.

### Tests

#### [MODIFY] `.bkit/core/engine/audits/repo/check-dist.integration.test.ts`

- **Existence Check:** the file exists.
- `check(cwd, ...args)` passes extra arguments to the script. Four new tests; the file's header comment names `--ref`.

#### [MODIFY] `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`

- **Existence Check:** the file exists.
- In the `.husky/pre-push min push` block: the test `.husky/pre-push: a code push still runs them` expects `bkit:check:dist --ref=<pushed commit>`; two tests are added next to it. Nothing else in the file changes.

### Docs

#### [MODIFY] `docs/deployments.md`

- **Existence Check:** the file exists.
- Lines 617 and 619: the check reads the index, or the commit `--ref` names; source-repo pre-push passes the commit pushed to `dev`, else to the checked-out branch.

#### [MODIFY] `docs/testing.md`

- **Existence Check:** the file exists.
- Line 924: the check-dist test row lists the `--ref` probes.

**Ledger rows:** None

### Cron Jobs & Scheduled Tasks

None

## Supersession Inventory

None

## Documentation Updates

<!-- prettier-ignore -->
| Doc | Change required |
| --- | --- |
| `docs/deployments.md` | § check order (lines 617, 619): the check reads the index, or the commit `--ref` names; pre-push passes the commit pushed to `dev`, else to the checked-out branch. |
| `docs/testing.md` | Line 924: the check-dist test row lists the `--ref` probes. |

## Rollback Strategy

Code-only — `git revert` sufficient.

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: `--ref` for the dist check, the pre-push call and the docs

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Give `bkit-check-dist.mjs` an optional `--ref=<commit>` that judges that commit's tree, and test it
  - **UPDATE:** `scripts/gate/bkit-check-dist.mjs`: parse `--ref=<value>` (any other argument exits 1); refuse an empty value or one starting with `-`; resolve with `git rev-parse --verify --end-of-options <value>^{commit}` and use the full hash; with a ref, fill a temporary index (`GIT_INDEX_FILE`, `git read-tree`) that the existing export and `ls-files -s` calls read, and remove it in `finally`; with no ref, read the real index as today
  - **UPDATE:** `.bkit/core/engine/audits/repo/check-dist.integration.test.ts`: `check` takes extra script arguments; add the four tests below, built with the file's `scratchRepo`, `build`, `write` and `git` helpers
  - **READ:** `docs/testing.md`: § Test first and the check-dist row, for the tier and naming
  - **DONE WHEN:** `pnpm exec vitest run .bkit/core/engine/audits/repo/check-dist.integration.test.ts` passes, including the four new tests and the six existing ones; `node scripts/gate/bkit-check-dist.mjs --ref=-x` exits 1 with `[bkit] --ref value is not a commit`; the test `without --ref the check still reads the index and not the commit` (a correct commit, an unrelated engine edit staged, no `--ref` → exit 1 as stale) exists and passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` `--ref of a commit with a stale dist fails as stale while the fix is only staged` fails on today's check ignoring `--ref`, reading the staged fix and exiting 0
    - `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` `--ref of a correct commit passes while an unrelated engine edit is staged` fails on today's check ignoring `--ref`, reading the staged edit and exiting 1 as stale
    - `.bkit/core/engine/audits/repo/check-dist.integration.test.ts` `--ref values starting with a dash, empty or not a commit are refused with no scratch folder left` fails on today's check ignoring `--ref` and exiting 0 on a clean index

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Make the pre-push hook pass the pushed commit to the dist check, and test it
  - **UPDATE:** `.husky/pre-push`: in the "bkit repo only" block near line 391, set `DIST_REF` to `PUSH_DEV_SHA`, else `PUSH_BRANCH_SHA`, cleared when all zeros; run `pnpm bkit:check:dist --ref="$DIST_REF" < /dev/null` when it is non-empty and `pnpm bkit:check:dist < /dev/null` when it is empty; reword the comment above it
  - **UPDATE:** `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`: in the `.husky/pre-push min push` block, change the expectation of `.husky/pre-push: a code push still runs them` and add the two tests below; nothing else in the file changes
  - **READ:** `.husky/pre-push`: lines 140-180, where `PUSH_DEV_SHA` and `PUSH_BRANCH_SHA` are set
  - **READ:** `.bkit/templates/.husky/pre-push`: confirm it has no dist check (nothing is added there)
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `grep -n 'bkit:check:dist' .husky/pre-push` shows the `--ref="$DIST_REF"` call and the no-argument call; `grep -rln "check:dist" .bkit/templates` lists nothing; `pnpm exec vitest run .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` passes; the test `.husky/pre-push: a push with no dev or branch commit runs the dist check with no argument` (push to `refs/heads/other` from the checked-out `feat/1-x`: the logged line is exactly `bkit:check:dist`) exists and passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.husky/pre-push: a code push still runs them` fails on the hook still logging the exact line `bkit:check:dist` with no `--ref` of the pushed commit
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.husky/pre-push: a push to dev checks the commit pushed to dev, which wins over the branch commit` fails on the hook still logging the exact line `bkit:check:dist` with no `--ref` of the commit pushed to `dev`

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Update the docs that state the index-only rule
  - **UPDATE:** `docs/deployments.md`: lines 617 and 619 say the check reads the index, or the commit `--ref` names, and that pre-push passes the commit pushed to `dev`
  - **UPDATE:** `docs/testing.md`: line 924, the check-dist test row, lists the `--ref` probes and the no-`--ref` index probe
  - **READ:** `.bkit/authoring.md`: § Docs
  - **DEPENDS ON:** 1, 2
  - **DONE WHEN:** `grep -n -- "--ref" docs/deployments.md docs/testing.md` finds the new text in both files; `pnpm bkit:text:ceiling check` passes
  - **TEST FIRST:** n/a — docs

<!-- bkit:task 3 end -->

<!-- bkit:group 1 end -->

## Verification Plan

### Automated Tests

- [ ] **Full Local Gate Suite:** the deepest declared `bkit:gate:*` script and `bkit check` pass; `pnpm bkit:text:ceiling check` passes and `raise` is never run.
- [ ] **Run all tests:** `check-dist.integration.test.ts` and `husky-pre-push.integration.test.ts` pass.

### Manual Verification

- [ ] **Step 1:** In a clone with a stale committed `dist/` and the fix staged, `node scripts/gate/bkit-check-dist.mjs --ref=HEAD` exits 1 and the call with no argument exits 0.
