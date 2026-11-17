Verdict: CONCERNS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

`NORMAL` — the gate names the exact rule, file and line (`defensive.empty-catch` at `husky-pre-push.integration.test.ts:1284`), and a concrete fix exists that removes the catch.

## CI Run

NOT CHECKED: the failure is local (status.jsonl row 295: `"source":"local"`, `"scope":"pnpm bkit:gate:static-unit-integration"`), and this branch has not been pushed in this build, so no remote run exists for it. The local gate log `run-tests-1.md` is the primary signal.

## Prior Attempts Reviewed

None

## Prior Knowledge

- fail-open-empty-catch-is-a-documented-contract-adding-console-error-triggers-defensive-error-swallowing: putting a `console.error` inside an empty catch to "improve" it trips `defensive.error-swallowing` and keeps `bkit:slop:delta` red — applied as: the fix removes the try/catch altogether, and must not log inside a catch.
- kn-32-slop-delta-scans-head-live-tree-against-a-clean-ba: `bkit ci slop` compares the live tree against a clean base checkout, so untracked build output can show up as phantom "added" findings — applied as: ruled out (Hypothesis 2); the flagged file is tracked and the base lacks the code.
- Ledger read gap: `bkit ledgers query` does not exist in this checkout (`[bkit-ledgers] unknown verb "query"`, exit 2). I folded `docs/knowledge.jsonl` by hand with `jq -s 'group_by(.key) | map(max_by(.ts))'`, keeping rows whose `status` is `ACTIVE` or absent: 180 lines on disk, 139 winning rows. Coverage is full for the file on disk, but the fold is mine, not the engine's.
- Related deferral (not a knowledge row): `docs/deferrals.jsonl:285` key `922-pre-push-load-challenge-low-bkit-core-engine-audits-templates-husky-pre-push-integration-test-ts-1282` (LOW) — `fs.readdirSync(d)` in the same helper sits outside the `try`. It stays deferred. The fix below does not change that line.
- Scar tissue: no `^Revert` commit touches `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts`, `.husky/pre-push` or `.bkit/templates/.husky/pre-push` (the same query finds `152991894 Revert "refactor(464): ..."` elsewhere, so the query works). The three `-i --grep=revert` hits (`935550ca9`, `24caa8147`, `950992850`) are about the revert-branch push bypass feature, not reverted attempts.

## Related Issues

- #922 — Pre-push: load direnv itself; block in seconds if untrusted (OPEN) — the feature under build; not a prior incident.
- No prior-incident match: `gh issue list --search 'empty-catch in:title,body'` returned only full-text noise (#822, #849, #559, #543, #356), none about this finding.

## Failures

One failure, and nothing else failed:

- `pnpm bkit:slop:delta` (`bkit ci slop`), inside `bkit:gate:static`: `added .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1284  defensive.empty-catch  Found 1 empty catch block` → `FAIL — change adds/worsens slop on net.` (`added: 1`, `netFindingCount: 1`, `netScore: 1.8999999999999986`, base `af0f02ba0b6c5a735e9ee1b5747e731085663c0a`).
- Before it, in the same gate: `typecheck` (including `tsc -p tsconfig.test.json`), `lint`, `format:check` ("All matched files use Prettier code style!"), `format:tables:check` ("0/166 files need formatting") and `bkit:lint:prose` (`✖ 0 errors, 47 warnings`, `passed: true`) all passed. The 47 `write-good.ThereIs` warnings are warnings only, and none of them blocked the gate.
- Not run: the gate is chained with `&&`, so `test:coverage:unit`, `bkit:test:bats`, `bkit:test:awake` and `test:integration` never started. This run says nothing about whether the tests pass, in either direction. The four `ELIFECYCLE` lines are the nested pnpm scripts passing up the one exit code 1.
- The run waited about 15 minutes for the machine-wide tests lock (held by other worktrees: 929, 915, 916) before it started. That wait did not cause the failure.

## Root Cause

**Proximate cause:** the `pathWithoutDirenv` helper in the `direnv` suite of `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` (lines 1277-1292) wraps `fs.symlinkSync(path.join(d, name), path.join(dir, name))` in `try { ... } catch { // already linked from an earlier PATH entry }`. A catch whose only content is a comment counts as an empty catch for slop-scan. `slop-scan.config.json` turns `defensive.empty-catch` on for every file (line 42-44), and there is no override for this test file, so the delta gate counts it as one net-new finding. `git log -S 'already linked from an earlier PATH entry'` shows it was added in `887e73c99` (`chore(922-pre-push-load): plan-tests group 1 attempt 1`, 2026-11-11). The base `af0f02ba0` does not have it.

**Design fragility:** the catch is there to skip a tool name that an earlier `PATH` folder already supplied (the `EEXIST` case), but it silently drops every other `symlinkSync` error too (for example `EACCES` or `ENOENT`). The same file already does this properly elsewhere: `pathWithoutGh` (lines 881-892) checks before it links and never needs a catch.

**Contributing factor (by design, not a bug):** nothing before Step 12 ran slop:delta on this branch. status.jsonl has exactly one `"verb":"slop"` call (row 294, this run), and zero `build-group-gate` steps. Build Step 8 sub-step 7 runs the group gate only when the plan has a group numbered above the current one. Each of Groups 1-4 was the last group when it was verified (Groups 2-4 were added later by the challenge and holistic rounds), so every group gate was `SKIPPED` and handed off to Step 12. The per-task gate `bkit:gate:changed` (`scripts/gate/bkit-gate-changed.mjs`) runs vitest, oxlint and typecheck on the changed files, but not slop:delta. So a slop finding written in Group 1 first met an enforcing check here.

## Rot Signals

reliability

- reliability: `husky-pre-push.integration.test.ts:1284-1288` throws away every `fs.symlinkSync` error, not only the "already linked" `EEXIST` case its comment names, so a broken stub-`PATH` setup would show up later as a confusing hook failure and not at the line that broke. The remediation below removes the pattern.

## Recommended Remediation

1. **`.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1281-1289`** (in scope: the plan names this file as the target of Tasks 1 and 5-9). In `pathWithoutDirenv`, replace the `try { fs.symlinkSync(...) } catch { // already linked ... }` with an explicit first-folder-wins skip and no catch, matching how `PATH` itself resolves names:
   ```ts
   const linked = new Set<string>();
   for (const d of (process.env.PATH ?? "").split(path.delimiter)) {
     if (!d || !fs.existsSync(d)) continue;
     for (const name of fs.readdirSync(d)) {
       if (name === "direnv" || linked.has(name)) continue;
       linked.add(name);
       fs.symlinkSync(path.join(d, name), path.join(dir, name));
     }
   }
   ```
   - Declare `linked` inside the helper, after `fs.mkdirSync(dir)`, so each call starts empty.
   - Use a `Set` of names, not `fs.existsSync(path.join(dir, name))`. `existsSync` follows the link, so a dangling symlink found in an earlier `PATH` folder would read as "not linked" and the next `symlinkSync` would throw `EEXIST`.
   - Do NOT keep the catch and add a `console.error`, a comment or an `if (code !== "EEXIST") throw` inside it. Logging inside the catch trips `defensive.error-swallowing` (Prior Knowledge, fail-open row), and a catch that rethrows is still a catch the rule judges. Removing the catch removes the finding.
   - Do NOT add a `slop-scan.config.json` override for this file. The bkit-ci output says "Fix in place"; an override would only hide the finding.
   - Leave the `fs.readdirSync(d)` line as it is (deferral `docs/deferrals.jsonl:285`, LOW, stays deferred).
   - Leave the test's steps, assertions and the returned `PATH` string (`${path.join(tmp, "bin-pnpm")}:${dir}`) unchanged.
2. Re-run the whole Step 12 gate, not just slop. The unit, bats, awake and integration tiers did not run this time, so they are still unverified for this branch.

## Out-of-Scope Recommendations

- `.bkit/core/workflows/bkit-build.md` (Step 8 sub-step 7) / `scripts/gate/bkit-gate-changed.mjs`: when every group is the last group at verify time, slop:delta first runs at Step 12, after all groups are built. Consider having the per-task `bkit:gate:changed` or the test-writing step run `bkit ci slop` on the files it touched, so a test-only slop finding is caught in the group that wrote it. This is a workflow design decision for the owner; this build does not need it.
- `.agents/rules.md` / the bkit-debug-failure-diagnose prompt: step 6 says to run `bkit ledgers query --ledger=knowledge --status=ACTIVE`, but this checkout's engine has no `query` verb (`unknown verb "query"`, exit 2). Either the verb needs to land, or the prompt and rule need to name the command that exists.

## Blast Radius

Localised. `pathWithoutDirenv` is a closure inside one `describe` block of one test file, with one caller (`husky-pre-push.integration.test.ts:1318`, the `noDirenv` path of `runHook`). Nothing outside the file imports it (`git grep -l pathWithoutDirenv` lists only this file plus docs and log files). The returned `PATH` string and the set of linked names stay the same: first `PATH` folder wins, `direnv` is left out. No shipped code, hook copy, schema or config changes.

## Suggested Tests

- None new. The existing `direnv not on PATH → gates run, no warning` test (the helper's only caller) already exercises the changed path for both `.bkit/templates/.husky/pre-push` and `.husky/pre-push`. It must still pass after the change. On a typical macOS `PATH`, names repeat across folders (for example `/usr/bin` and `/bin`), so the duplicate-name branch gets exercised too.

## Verification Commands

```bash
cd "/Users/christian/Documents/GitHub/bkit/.worktrees/922-pre-push-load"
pnpm bkit:slop:delta          # expect: passed: true, added 0 (or net findings <= 0)
pnpm exec vitest run .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts -t "direnv"
pnpm exec tsc -p tsconfig.test.json --noEmit
pnpm bkit:gate:static-unit-integration   # the full Step 12 gate; the test tiers did not run this time
```

## Documentation Warnings

```jsonl
{"topic": "knowledge ledger query", "gap": "`bkit ledgers query` named by the diagnose prompt does not exist in this checkout's engine (`[bkit-ledgers] unknown verb \"query\"`, exit 2)", "recommendedPath": ".bkit/cli.md", "alternativeEvidence": "Folded docs/knowledge.jsonl by hand with jq (group_by key, max_by ts, status ACTIVE or absent): 139 winning rows of 180 lines.", "action": "Ship the `ledgers query` verb, or change the prompt and rules to name the existing read path."}
```

## Hypotheses

### Hypothesis 1: The only blocker is one real net-new empty catch in the Group 1 test helper `pathWithoutDirenv`

#### Reason

`run-tests-1.md` reports exactly one added finding and no resolved or worsened ones, and every check before slop:delta passed.

#### Act

Read `husky-pre-push.integration.test.ts:1255-1310` and `:1283-1289`; ran `git log -S 'already linked from an earlier PATH entry'` on the file; checked `slop-scan.config.json` for a `defensive.empty-catch` override on the file.

#### Observe

```
[bkit-ci]   added     .bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts:1284  defensive.empty-catch  Found 1 empty catch block
```

```
        try {
          fs.symlinkSync(path.join(d, name), path.join(dir, name));
        } catch {
          // already linked from an earlier PATH entry
        }
```

`887e73c99 2026-11-11 17:18:04 +1000 chore(922-pre-push-load): plan-tests group 1 attempt 1`. `slop-scan.config.json:42-44`: `"defensive.empty-catch": { "enabled": true }`. The empty-catch overrides cover other files, not this one.

#### Result

CONFIRMED — line 1284 is the `try {` of a comment-only catch added on this branch in `887e73c99`, with no config override.

### Hypothesis 2: The finding is a phantom from the live-tree-vs-clean-base asymmetry (kn-32)

#### Reason

Prior knowledge row kn-32 records slop:delta reporting untracked or ignored files as "added".

#### Act

Checked that the file is tracked and that the base lacks the code: `git log -S` on the comment string, and `git status --short`.

#### Observe

`git log -S` shows the string first appears in `887e73c99`, a commit on this branch after base `af0f02ba0`. `git status --short` shows only `M docs/plans/202611/logs/922-pre-push-load/status.jsonl` and this report as untracked; the test file is tracked and clean.

#### Result

REFUTED — the file is tracked, and the base checkout really does not have this catch, so the finding is real.

### Hypothesis 3: Logging or narrowing inside the catch (console.error, or rethrow unless EEXIST) clears the gate

#### Reason

It is the obvious one-line change, and a past verify step made the same move.

#### Act

Dismissed a priori — see fail-open-empty-catch-is-a-documented-contract-adding-console-error-triggers-defensive-error-swallowing

#### Observe

Ledger row: "Documented fail-open empty catches must stay empty; adding console.error to improve them triggers defensive.error-swallowing and turns a GREEN bkit:slop:delta RED". bkit-ci output: "Structure/defensive (over-fragmentation, pass-through-wrapper, empty-catch, ...): Fix in place".

#### Result

REFUTED — logging inside the catch swaps one defensive finding for another. Removing the catch with a first-folder-wins `Set` (the same check-first shape as `pathWithoutGh` at lines 881-892) is the fix.

### Hypothesis 4: Tests in the changed files are also failing, hidden behind the slop failure

#### Reason

The gate is chained with `&&`, so a later failure would not show.

#### Act

Read the gate command in `run-tests-1.md:23` and the Task 9 result in `build-tests-green-4-1.md`.

#### Observe

`sh -c 'pnpm bkit:gate:static && pnpm test:coverage:unit && pnpm bkit:test:bats && pnpm bkit:test:awake'`, and then `&& pnpm test:integration`. No test output appears after `bkit:slop:delta`. `build-tests-green-4-1.md:15`: `| 9 | ... "the gate's vitest run does not inherit BKIT_PRE_PUSH_LOGGED" | updated | passed |`.

#### Result

INCONCLUSIVE — the unit, bats, awake and integration tiers never ran in this run. The per-group green logs passed, but the full tiers are still unverified until Step 12 runs again.

### Hypothesis 5: An earlier gate in this build should have caught the finding

#### Reason

Build Step 8 runs `bkit:gate:static-unit` (which includes slop:delta) as a group gate, so a Group 1 finding would normally be caught in Group 1.

#### Act

Counted steps and engine calls in `status.jsonl`; read `.bkit/core/workflows/bkit-build.md:700-730` (Step 8 sub-steps 7-10) and `scripts/gate/bkit-gate-changed.mjs`.

#### Observe

`grep -c 'group-gate' status.jsonl` → `0`; only one `"verb":"slop"` engine call (row 294). `bkit-build.md`: "**If** the printed `groups` hold a group numbered above `GROUP` → sub-step 8." / "**Else** → `GATE_VERDICT` = SKIPPED → sub-step 10." `bkit-gate-changed.mjs` stages: `related`, `named`, `lint` (oxlint), `types` (typecheck). No slop stage.

#### Result

CONFIRMED (contributing factor, working as designed) — each group was the last group at verify time, so every group gate was skipped and the per-task gate has no slop stage. This run was the first slop:delta pass of the build.
