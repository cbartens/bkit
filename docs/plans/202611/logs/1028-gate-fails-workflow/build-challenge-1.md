Verdict: CONCERNS
Failures: 3
Fingerprint: 74858f91f34541bfebd8929199124072ba31fcbe4ed80237e048d80ee38f6b3d
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

The full run diff `tmp/bkit-diff-1028-gate-fails-workflow.md` (759 lines, full coverage, no `partial diff coverage` line): `scripts/gate/bkit-text-ceiling.mjs`, `scripts/gate/bkit-text-ceiling.json`, `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts`, the `bkit:text:ceiling` pin in `.bkit/core/engine/audits/repo/package-json.test.ts`, the `package.json` script line, the ceiling rule in `scripts/gate/bkit-gate-changed.mjs` and its test in `scripts/gate/bkit-gate-changed.test.mjs`, `docs/testing.md`, `docs/architecture.md`, and the ledger rows appended to `.bkit/friction.jsonl`, `docs/decisions.jsonl` and `docs/deferrals.jsonl`. Plan: `docs/plans/202611/1028-gate-fails-workflow-plan.md` (Tasks 1 to 11). The on-disk script and test file match the diff byte for byte.

## Notes

- Evidence (probes in the session scratchpad, outside the worktree):
  - Task 1: a fixture repo (record committed, then a commit that grows `grew.md`) cloned with `git clone --depth 1 file://...` gives `recordsha` = `HEAD` = the shallow boundary; `check` there exits 1 with an empty `Files that grew most:` list, while the same `check` on the full repo lists `.bkit/core/workflows/grew.md (+5, 10 words)`. The CI job `bkit-tests-unit` checks out with no `fetch-depth` (`.github/workflows/bkit-ci.yml:582`) and runs `pnpm test:coverage:unit` (`:626`), so it is a depth-1 clone. `docs/testing.md:360` already warns that history-based selection in a shallow clone fails open.
  - Task 2: `changedFiles` in `.bkit/core/engine/commands/workflow/tests-changed.ts:33` keeps existing files only, and `bkit tests changed` adds no files that mention a deleted one (`.bkit/workflows.md` § Local gate scripts: "A deleted file is left out."); `bkit-gate-changed.mjs:24` also drops paths that no longer exist. `tests run --changed-since` adds the files that mention the deleted stem, which usually include a workflow file, so the group gate and build Step 12 usually still catch it; the per-step agent gate does not.
  - Task 3: `node_modules/.bin/vitest run --passWithNoTests .bkit/core/engine/audits/repo/agent-text-ceiling-renamed.test.ts` printed `No test files found, exiting with code 0` and exited 0. The other two `named` sources are existence-filtered (`bkit-gate-changed.mjs:24` and `:58`); `CEILING_TEST` is not.
  - `node scripts/gate/bkit-text-ceiling.mjs check` on the worktree prints `ok — prompts 86494, workflows 58536`, equal to `cat ... | wc -w` for both folders (also under `LC_ALL=C`).
- Checked and clean: null and shape guards on the record (`null`, arrays, a missing folder, a non-number ceiling all fail closed); the equal / above / below boundaries; `lower`'s refusal when any total is above or the record lacks a ceiling; the reason kept on `lower` and stored on changed folders on `raise`; the `raise` terminal check order (record, folders, reason, then terminal); the engine's install reads only top-level `bkit-*.md` (`.bkit/core/engine/install/modules/core.ts:58`), so counting only top-level `*.md` misses no shipped text; no prompt include mechanism pulls text from outside the two folders; the record is not under a `merge=union` rule; CI run level depends on markers and events, not on file types, so a prompt-only PR still runs the unit tier.
- Not re-raised, because the diff's own `docs/deferrals.jsonl` rows already defer them as LOW: the invalid-JSON message's hard-coded record name and its "take either side" advice, the real-repo case dropping the script's output, `--preserve-symlinks-main` skipping `main`, EOF at the `Type RAISE` prompt exiting 0, the pseudo-terminal and `raiseCeilings` import bypasses of the terminal check, and `lower`'s refusal still printing the ready-to-paste `raise --reason "<why>"` line. Plan Tasks 5 and 7 (record merge conflicts, `lower` counting other agents' uncommitted edits) are accepted by the owner and not re-raised.
- Outside this lens and this change: the appended `owner-pause/build.decision` friction row carries `recurrenceCount: 30`, the same count as the base's row at `.bkit/friction.jsonl:335`, so the recurrence counter undercounts across branches; the engine writes these rows, not this plan.
- No CRITICAL finding; all three findings are LOW, mechanical and fixable.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A PR grows a workflow above its ceiling, and the CI unit job (a `fetch-depth: 1` checkout) prints `Files that grew most:` with no file under it, because `git log -1 -- {record}` in a shallow clone returns the shallow boundary commit, so every file's delta against it is 0
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `scripts/gate/bkit-text-ceiling.mjs:47` · **Round:** 1
  - **DONE WHEN:** `grownFiles` treats a record commit that is a shallow boundary (the clone is shallow and the commit is listed in its `shallow` file) as no commit and falls back to the five largest files, so an above-ceiling `check` in a shallow clone names files under `Files that grew most:`; the existing `names only the files that grew since the record's last commit` test still passes
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` `names the grown files when run in a shallow clone` fails on the growth list being empty when `check` runs in a `git clone --depth 1 file://{fixture}` of a fixture repo whose record was committed one commit before the commit that grew `grew.md`
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** An agent step deletes an unused prompt file and updates `.bkit/prompts.md`; `bkit tests changed` passes only files that still exist, so `bkit-gate-changed.mjs` never sees the deleted path, skips the ceiling test and goes green, and the below-ceiling failure first shows at a later gate that runs the whole unit tier
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `scripts/gate/bkit-gate-changed.mjs:72` · **Round:** 1
  - **DONE WHEN:** a `bkit:gate:changed` run whose arguments name no file under `.bkit/core/workflows/` or `.bkit/core/prompts/`, in a checkout where a tracked file there (or `scripts/gate/bkit-text-ceiling.json`) is deleted against `HEAD`, runs `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` in its `named` stage; the `Changed files` bullet of `docs/testing.md` says a deleted text file also runs it
  - **TEST FIRST:**
    - `scripts/gate/bkit-gate-changed.test.mjs` `a deleted workflow or prompt file runs the text ceiling test` fails on a fixture git checkout (the gate script and its `scripts/ci/` imports copied in, stub `node_modules/.bin/vitest` and `prettier` that print their arguments), where a committed `.bkit/core/prompts/old.md` is deleted and the gate is given only `.bkit/prompts.md`, printing a `named:` line with no `agent-text-ceiling.test.ts`
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** The ceiling test file is renamed or moved and `CEILING_TEST` keeps the old path; the `named` stage hands it to `vitest run --passWithNoTests`, which prints `No test files found, exiting with code 0`, so every workflow or prompt change passes the changed-file gate with no ceiling check
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `scripts/gate/bkit-gate-changed.mjs:81` · **Round:** 1
  - **DONE WHEN:** when a changed path touches the ceiling and `CEILING_TEST` does not exist under the root, the `named` stage fails with one `[bkit:gate:changed]` line naming the missing ceiling test and the gate exits 1, the same fail-closed handling the other `named` sources get from their existence filter
  - **TEST FIRST:**
    - `scripts/gate/bkit-gate-changed.test.mjs` `a missing text ceiling test fails the named stage` fails on a fixture copy of the gate with no `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts` and a stub `vitest` that exits 0, given a changed `.bkit/core/prompts/a.md`, where the gate exits 0
<!-- bkit:task 3 end -->
