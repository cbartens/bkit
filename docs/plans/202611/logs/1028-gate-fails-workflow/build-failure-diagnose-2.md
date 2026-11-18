Verdict: CONCERNS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

`NORMAL`: the slop finding names the file and both lines (63, 242), the rule's logic is read from `node_modules/slop-scan/dist/node-entry.js`, and a scratch copy with the fix scans clean.

## CI Run

NOT CHECKED: the failure is the local gate `pnpm bkit:gate:static-unit-integration` (`"source":"local"` in `status.jsonl`, tested `63a3898d0aacdefa2ab193109fb63d98f5f6d9c1`); no remote CI run was part of this build step.

## Prior Attempts Reviewed

None (`Strategy: STANDARD`, no `Repeat tests`). Note: `run-tests-1.md` failed on the same two findings at the same lines; `scripts/gate/bkit-text-ceiling.mjs` was last changed in `e45db98e5`, an ancestor of the run-tests-1 commit `70360e5f6`, so no fix round has touched these catches yet. Decision `build-decision-3-4.md`: `Decision: Try again`, so this round is the one fix round granted.

## Prior Knowledge

fail-open-empty-catch-is-a-documented-contract-adding-console-error-triggers-defensive-error-swallowing: swapping a catch for a log-and-continue shape trips `defensive.error-swallowing` instead — applied as: the recommended shapes do not log inside the catch, so they trip neither rule.
kn-32-slop-delta-scans-head-live-tree-against-a-clean-ba: `bkit ci slop` scans the live tree, so gitignored output can show up as phantom "added" findings — applied as: ruled out (Hypothesis 4); the script is tracked source and the findings reproduce on a lone copy.

## Related Issues

- #1028 — Gate fails when workflow and prompt text grows past its record (OPEN), the issue this build implements
- #294 — Slop audit (OPEN), the standing slop-scan audit; no prior incident for this file

## Failures

One failure, at one step. `pnpm bkit:slop:delta` (`bkit ci slop`, base `d421257ad14236532e99a74d44ff2d2562bc60bc` vs working tree) reported `added 2, resolved 0, worsened 0; net findings 1, net score 2.20` and `FAIL — change adds/worsens slop on net.`:

- `scripts/gate/bkit-text-ceiling.mjs:63  defensive.error-obscuring  Found 2 error-obscuring catch blocks`
- `scripts/gate/bkit-text-ceiling.mjs:242  defensive.error-obscuring  Found 2 error-obscuring catch blocks`

Both lines belong to one file-level finding (one finding, two locations, score 2.2). The `&&` chain in `bkit:gate:static` stopped there, so `pnpm test:coverage:unit`, `pnpm bkit:test:bats`, `pnpm bkit:test:awake` and `pnpm test:integration` did not run in this gate. A targeted run of `agent-text-ceiling.test.ts` and `package-json.test.ts` passes (`Tests  23 passed (23)`); the other tiers are still unchecked.

## Root Cause

**Proximate cause.** The new script has two catch blocks that slop-scan 0.3.0's `defensive.error-obscuring` rule flags (`node_modules/slop-scan/dist/node-entry.js:179295`, `findErrorObscuringSummaries`):

1. `loadRecord`, `scripts/gate/bkit-text-ceiling.mjs:63-69`: `try { return JSON.parse(fs.readFileSync(recordPath, "utf-8")); } catch { throw new CeilingError("... is not valid JSON ...") }`. The catch is a single `throw new ...` statement, which the rule calls `generic-rethrow`, with boundary `config|filesystem`. The error really is hidden: the try wraps the file read as well as the parse, so a read failure (`EISDIR`, `EACCES`) is reported as "not valid JSON (a merge conflict?)". Probe: with a directory at the record path, the current script prints the "not valid JSON" line.
2. `isEntryScript`, `scripts/gate/bkit-text-ceiling.mjs:242-246`: `try { return fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url); } catch { return false; }`. The catch is a single `return false`, which the rule calls `default-return`, with boundary `filesystem`. Any `realpathSync` error, not only a missing path, silently means "not the entry script", so the CLI just does nothing and exits 0.

**Design fragility.** The rule flags a catch whose body is exactly one `throw new X(...)` or one `return <literal>` (`catchThrowsGeneric` / `catchReturnsDefault` both need `catchStatements.length === 1`, `node-entry.js:178869-178870`). A catch that checks the error's type or code and rethrows everything else has two statements, so it is not flagged. That shape is also the honest one.

**Contributing factor.** The build's group and holistic gates run `pnpm bkit:gate:changed` (`scripts/gate/bkit-gate-changed.mjs`), which has no slop stage (`git grep -c slop -- scripts/gate/` finds nothing). Both holistic gates passed (`status.jsonl` rows at 23:14:17Z and 23:55:26Z), and the finding first showed up at `build-run-tests`.

## Rot Signals

observability, tests

- observability: `scripts/gate/bkit-text-ceiling.mjs:63` reports every read failure of the record as "not valid JSON (a merge conflict?)"; probed with a directory at the record path, the current script prints that line instead of the real `EISDIR`.
- tests: `scripts/gate/bkit-gate-changed.mjs` (the build's group and holistic gate) runs no slop-delta stage, so a slop failure in new code is caught only at `build-run-tests`, after both holistic gates had passed.

## Recommended Remediation

In scope: `scripts/gate/bkit-text-ceiling.mjs` (plan TASK 1 CREATE). Edit only these two catch blocks. Add no suppression comment, no `slop-scan.config.json` override and no exemption entry, and do not touch `agent-text-ceiling.test.ts`.

1. **`loadRecord`, lines 61-70.** Move the read out of the try, and handle only the parse error by its class:
   ```js
   function loadRecord(recordPath) {
     if (!fs.existsSync(recordPath)) return null;
     const text = fs.readFileSync(recordPath, "utf-8");
     try {
       return JSON.parse(text);
     } catch (e) {
       if (!(e instanceof SyntaxError)) throw e;
       throw new CeilingError(
         `${RECORD_REL} is not valid JSON (a merge conflict?). Take either side of the conflict and run: pnpm bkit:text:ceiling lower`,
       );
     }
   }
   ```
   Keep the message text exactly as it is: the test `check, lower and raise each fail with one line naming the record when it is not valid JSON` asserts it. Read errors now propagate with their real code.
2. **`isEntryScript`, lines 240-247.** Handle only the missing-path error by its code, and rethrow the rest:
   ```js
   try {
     return fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);
   } catch (e) {
     if (e.code === "ENOENT") return false;
     throw e;
   }
   ```
   The other acceptable fix is to drop the try and let `realpathSync` propagate (`return fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url);`). That also scans clean, but it throws at import time if a runner hands Node a `process.argv[1]` that does not exist. The by-code version is safer.

Both shapes were applied to scratch copies and scanned with the repo's slop-scan (`node_modules/.bin/slop-scan scan . --json`, default rules, since the repo config's plugin path does not resolve outside the repo). The as-is copy gives `"defensive.error-obscuring","l":[63,242] ... "score":2.2`, which reproduces the gate. The fixed copy and the drop-the-try copy both give `[]`.

## Out-of-Scope Recommendations

- `scripts/gate/bkit-gate-changed.mjs`: add a slop-delta stage (or have the holistic gate run `bkit ci slop`), so new error-obscuring catches fail at the group or holistic gate rather than at run-tests. Out of scope: plan TASK 10 limits this file to one rule in the `named` stage ("No new stage, no new script and no other change to that gate"), so this needs an owner decision.
- `scripts/gate/bkit-text-ceiling.mjs:67`: the invalid-JSON message always names `RECORD_REL` (`scripts/gate/bkit-text-ceiling.json`), even when `--record` points at another file. Out of scope: the test pins the default name and no failure comes from it.

## Blast Radius

Localised. Both edits are inside private functions (`loadRecord`, `isEntryScript`) of `scripts/gate/bkit-text-ceiling.mjs`. The exported `raiseCeilings` signature and its `CeilingError` messages do not change. Surfaces checked (`git grep -l bkit-text-ceiling`, excluding plans):

- `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts`: compatible. The invalid-JSON test still gets the same one line with exit 1 (probe: fixed copy, `check` on a conflict-marker record prints `[bkit:text:ceiling] scripts/gate/bkit-text-ceiling.json is not valid JSON ...`, `rc=1`). The symlinked-script test still starts the CLI (probe via a symlink: `rc=1` with the same line). The declining-confirmation test is unaffected, because `raise cancelled` is thrown outside both catches and the record write still comes only after `confirm` returns true.
- `.bkit/core/engine/audits/repo/package-json.test.ts`, `package.json`: compatible; the script line does not change.
- `scripts/gate/bkit-gate-changed.mjs`: compatible; it names the test file, not these functions.
- `docs/testing.md:574`, `docs/architecture.md`: compatible; neither describes the JSON-error or entry-script handling (`git grep` for `valid JSON|realpath|entry script` finds nothing; the looser pattern hits `docs/testing.md:572,574`).
- Behaviour change: a record that cannot be read (directory, no permission) now fails with Node's real error and a stack trace instead of the misleading "not valid JSON" line. This is intended under the brief ("keeps the error visible").

## Suggested Tests

- Optional regression in `.bkit/core/engine/audits/repo/agent-text-ceiling.test.ts`: `check` with a directory at the `--record` path exits non-zero, and its output does not contain "not valid JSON" (pins that a read error is no longer passed off as a parse error). Only add it if the plan allows adding a case to this round. The fix itself needs no test change.
- The existing `check, lower and raise each fail with one line naming the record when it is not valid JSON` and `check run through a symlinked script path still starts and exits 1 above the ceiling` already pin the behaviour that must not change.

## Verification Commands

```bash
cd "/Users/christian/Documents/GitHub/bkit/.worktrees/1028-gate-fails-workflow"
pnpm bkit:slop:delta            # = bkit ci slop alone; expect added 0 for scripts/gate/bkit-text-ceiling.mjs and passed: true
pnpm exec vitest run .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts .bkit/core/engine/audits/repo/package-json.test.ts
pnpm exec oxlint -c .oxlintrc.json --deny-warnings scripts/gate/bkit-text-ceiling.mjs
pnpm exec prettier --check scripts/gate/bkit-text-ceiling.mjs
```

Then the build's own `build-run-tests` step re-runs the full gate. Do not run `bkit:gate:*` by hand on this shared machine.

## Hypotheses

### Hypothesis 1: the two catch blocks in the new script are what the slop gate flags

#### Reason

The gate names `scripts/gate/bkit-text-ceiling.mjs:63` and `:242` with `defensive.error-obscuring`. The file is new in this branch (plan TASK 1 CREATE), so every catch in it counts as net-new.

#### Act

Read `scripts/gate/bkit-text-ceiling.mjs:61-70` and `:240-247`, and the rule in `node_modules/slop-scan/dist/node-entry.js:179285-179325` plus the summary builder at `:178862-178895`. Copied the script into a scratch dir and ran `node_modules/.bin/slop-scan scan . --json`.

#### Observe

Rule: `summary.catchReturnsDefault || summary.catchThrowsGeneric || summary.catchHasLogging && summary.catchHasDefaultReturn`; `catchThrowsGeneric = catchStatements.length === 1 && ts6.isThrowStatement(catchStatements[0]) && ... ts6.isNewExpression(...)`.
Scratch scan of the as-is copy: `[{"r":"defensive.error-obscuring","l":[63,242],"e":["line 63: generic-rethrow, boundary=config|filesystem","line 242: default-return, boundary=filesystem"],"score":2.2}]`. That is the same as the gate's `net score 2.20`.

#### Result

CONFIRMED — both lines reproduce on a lone copy with the same rule, kinds and score.

### Hypothesis 2: handling one expected error by type or code and rethrowing the rest clears the rule and keeps the tested behaviour

#### Reason

The rule flags only one-statement catches (one `throw new` or one `return <literal>`). The brief allows "handle the one expected error by its code and rethrow the rest".

#### Act

Wrote two scratch variants with a Python script into the scratchpad: `fixed` (read outside the try; `if (!(e instanceof SyntaxError)) throw e;` then the `CeilingError`; `if (e.code === "ENOENT") return false; throw e;`) and `prop` (same `loadRecord`, `isEntryScript` without a try). Scanned both. Ran the fixed copy's `check` on a conflict-marker record, on a directory record and through a symlink.

#### Observe

`== fixed` -> `[]`; `== prop` -> `[]`.
Fixed, conflict markers: `[bkit:text:ceiling] scripts/gate/bkit-text-ceiling.json is not valid JSON (a merge conflict?). Take either side of the conflict and run: pnpm bkit:text:ceiling lower` / `rc=1`.
As-is, directory record: `[bkit:text:ceiling] scripts/gate/bkit-text-ceiling.json is not valid JSON (a merge conflict?). ...`. Fixed, directory record: `node:fs:441 ... return binding.readFileUtf8(path, stringToFlags(options.flag));` (the real read error propagates).
Fixed via symlink: same one-line message, `rc=1`.

#### Result

CONFIRMED — both variants scan clean. The invalid-JSON message and the symlink start are unchanged, and the hidden read error now shows.

### Hypothesis 3: the failure is flaky or caused by machine load

#### Reason

Three other builds share the machine, and earlier runs on this machine timed out under load.

#### Act

Compared `run-tests-1.md` and `run-tests-2.md`, and checked `git log` for the script between the two runs.

#### Observe

Both runs: `added     scripts/gate/bkit-text-ceiling.mjs:63  defensive.error-obscuring` and `:242`. `git merge-base --is-ancestor e45db98e5 70360e5f6` -> `script last changed before run-tests-1`.

#### Result

REFUTED — a static scan gives the same result on unchanged source; it is not a timing failure.

### Hypothesis 4: phantom findings from slop delta scanning the live tree (gitignored output)

#### Reason

Prior knowledge `kn-32-slop-delta-scans-head-live-tree-against-a-clean-ba` says untracked or ignored files can surface as phantom "added" findings.

#### Act

Checked that the file is tracked source and scanned it on its own (Hypothesis 1).

#### Observe

`git log --oneline -- scripts/gate/bkit-text-ceiling.mjs` -> `e45db98e5`, `240f2e0d2`, `465248082`; the lone-copy scan reproduces lines 63 and 242.

#### Result

REFUTED — the findings are in committed source code, not build output.

### Hypothesis 5: other test tiers are also red, hidden behind the slop step

#### Reason

`bkit:gate:static` chains with `&&`, so after `bkit:slop:delta` failed, unit coverage, bats, awake and integration never ran.

#### Act

`pnpm exec vitest run .bkit/core/engine/audits/repo/agent-text-ceiling.test.ts .bkit/core/engine/audits/repo/package-json.test.ts` (targeted only, as the brief requires).

#### Observe

`Test Files  2 passed (2)` / `Tests  23 passed (23)`.

#### Result

INCONCLUSIVE — the build's own test files pass. The full unit, bats, awake and integration tiers were not run (the brief forbids `bkit:gate:*` here), so failures there are still possible.
