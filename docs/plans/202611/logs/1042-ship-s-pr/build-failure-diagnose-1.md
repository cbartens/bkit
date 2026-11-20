Verdict: PASS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

`NORMAL`: Vale pinpoints both errors by file, line and column, and the fix is two exact sentence replacements already proven on `dev` (`d423cd53b`).

## CI Run

NOT CHECKED: the failure is the local gate `pnpm bkit:gate:static-unit-integration` (`status.jsonl` `test-run` row: `"source":"local"`, `"verdict":"FAIL"`, `"exitCode":1`); no remote CI run was requested or needed, since the local log pinpoints both errors.

## Prior Attempts Reviewed

None

## Prior Knowledge

- kn-lint-prose-gitignored-styles-silently-disable-gate-in-worktrees: in a worktree the prose gate once passed without checking because `.vale/styles/write-good` was absent; the gate now restores the styles or fails — applied as proof that this run's errors are real: the log shows `[bkit-ci] .vale/styles/write-good absent (fresh checkout or worktree) - restoring`, then Vale ran over 152 files.
- kn-29-bkit-lints-itself-with-a-narrower-lint-prose-than-it-ships: `bkit:lint:prose` covers every shipped `.md`, including `.bkit/core/.bkit/*.md` and `docs/*.md` — applied as the reason both files are in the gate's globs and must pass it.

## Related Issues

- #958 — Agents and the orchestrator write their own .md files; the engine checks and counts (CLOSED) — its commit `724848c61` introduced both failing sentences, and its follow-up `d423cd53b` on `dev` already rewrites them.
- #1042 — Ship's PR fallback lands a record when its branch is left on origin (OPEN) — this build.

## Failures

One stage failed: `pnpm bkit:lint:prose` (Vale) inside `pnpm bkit:gate:static`, with exactly two errors and no warnings:

- `.bkit/core/.bkit/workflows.md` `993:1012  error  Don't start a sentence with 'So '.  write-good.So`
- `docs/testing.md` `959:1344  error  Don't start a sentence with '; so '.  write-good.So`

Summary line: `✖ 2 errors, 0 warnings and 0 suggestions in 152 files.` The four `ELIFECYCLE  Command failed with exit code 1.` lines are the nested script wrappers (`bkit:lint:prose` → `bkit:gate:static` → `bkit:gate:static-unit` → `bkit:gate:static-unit-integration`) passing the same exit code up; they are not separate failures.

Stages that passed before it: `typecheck` (incl. `bkit:typecheck:tests`), `lint`, `format:check` (`All matched files use Prettier code style!`), `format:tables:check` (`0/156 files need formatting`).

Stages never reached, because the `&&` chain stopped: `bkit:slop:delta`, `test:coverage:unit`, `bkit:test:bats`, `bkit:test:awake`, `test:integration`. The log (57 lines, identical to `run-tests-1.md`) has no `>` start header for any of them; their names appear only inside the chain definitions on log lines 3, 7 and 11. Their results are therefore unknown, not green.

## Root Cause

- **Proximate cause:** two sentences break Vale rule `write-good.So`. `.bkit/core/.bkit/workflows.md:993` (bullet "Resume into a red-gate pause") has a sentence that starts "So when the checked file holds items against a `Stop` loop question, ...". `docs/testing.md:959` (the `commands/workflow/decisions.test.ts` row) joins two clauses with "header line; so a later `decision-counts` row finds no answer,".
- **Origin, not this branch:** `git log -S` shows both sentences arrived in `724848c61` (feat(958-agents-orchestrator-write)), which is the merge-base of this branch with `dev`. None of this branch's 39 commits touches line 959 of `docs/testing.md` (its hunk is at 965) or line 993 of `.bkit/core/.bkit/workflows.md` (its hunks are at 131, 150, 825, 1128, 1354). The branch was cut from a `dev` tip that already failed the prose check.
- **Already fixed upstream:** `dev` (`d423cd53b`, "docs(958-agents-orchestrator-write): two sentences pass the prose check") rewrites both sentences to exactly the wording prescribed below, and also updates the `.bkit/workflows.md` hash in `.bkit/version`. This branch does not contain that commit.
- **Design fragility / contributing factor:** pre-commit runs only `bkit:gate:format`; the prose check runs at pre-push (`.husky/pre-push:5-6`) and in this build gate. A commit that lands on local `dev` without a push therefore reaches a branch cut from it unchecked. That is the documented hook split, not a gate bypass, so it is not listed as rot.

## Rot Signals

None

## Recommended Remediation

Both files are named work targets in the plan (§ Documentation, `[MODIFY] .bkit/core/.bkit/workflows.md, docs/deployments.md, docs/testing.md, docs/decisions.jsonl`).

1. `.bkit/core/.bkit/workflows.md:993` (the source; do not hand-edit the rendered `.bkit/workflows.md`). Replace, word for word:
   - old: "So when the checked file holds items against a `Stop` loop question, or no item against a `Decide` one, check exits 6 after the one fix and the run ends in the **Failure Path**."
   - new: "A checked file that holds items against a `Stop` loop question, or no item against a `Decide` one, therefore makes check exit 6 after the one fix, and the run ends in the **Failure Path**."
2. `docs/testing.md:959`. Replace, word for word:
   - old: "header line; so a later `decision-counts` row finds no answer,"
   - new: "header line, which leaves a later `decision-counts` row with no answer,"
3. Re-render the installed copies: `pnpm tsx .bkit/core/engine/cli.ts upgrade` (rewrites `.bkit/workflows.md:993` and the `.bkit/workflows.md` hash in `.bkit/version`), then `pnpm build`. Stage `.bkit/workflows.md` and `.bkit/version` with the two sources.

Both replacements are byte-identical to `dev`'s `d423cd53b`, checked with `git show dev:...`. A later merge of `dev` into this branch therefore sees the same change on both sides and does not conflict on these lines.

## Out-of-Scope Recommendations

None

## Blast Radius

- `.bkit/workflows.md` (rendered mirror of the source): regenerated by `upgrade`; `git grep` finds the old sentence only in the source and this mirror, so no other mirror carries it — compatible.
- `.bkit/version` (per-file hash register; `".bkit/workflows.md": "20e329f9..."` at line 214): `upgrade` recomputes it; `bkit check` would report drift if the mirror were edited without it — compatible once step 3 runs.
- Tests: `decisions.test.ts:2409`, `:2453` and `:2761` share words with the sentences ("check exits 6", "finds no answer") only in `it(...)` titles; no test reads `docs/testing.md` or `.bkit/workflows.md` text for these sentences — compatible.
- `dist/`: `git grep` finds neither sentence under `dist/`; `pnpm build` is a no-op for this text — compatible.

## Suggested Tests

None new. The failing check is itself the regression guard: `pnpm bkit:lint:prose` with `write-good.So` already covers both files through its `--glob='.bkit/core/.bkit/*.md'` and `--glob='docs/*.md'` patterns. A string-presence test on the new wording would pin wording, not behaviour (`docs/testing.md` § shape guards).

## Verification Commands

```bash
cd "/Users/christian/Documents/GitHub/bkit/.worktrees/1042-ship-s-pr"
pnpm tsx .bkit/core/engine/cli.ts upgrade
pnpm build
git grep -n -F 'So when the checked file holds items' ; git grep -n -F 'header line; so a later'   # expect no output
git grep -c -F 'therefore makes check exit 6 after the one fix' -- .bkit/core/.bkit/workflows.md .bkit/workflows.md   # expect 1 each
pnpm bkit:lint:prose        # expect passed: true, 0 errors
node dist/cli.js check      # expect no drift on .bkit/workflows.md / .bkit/version
pnpm bkit:gate:static-unit-integration   # the full gate; slop:delta, unit, bats, awake and integration have not yet run
```

## Hypotheses

### Hypothesis 1: The prose check's two write-good.So errors are the only failures, and no later gate stage ran

#### Reason

The gate is one `&&` chain; the log ends at `bkit:lint:prose` with four ELIFECYCLE lines, which suggests the chain stopped there.

#### Act

`diff run-tests-1.md run-tests-1.log` (identical), `grep -n -c 'error'` on the log, and `grep -n -E 'slop|coverage|vitest|bats|integration'` on the log to look for a `>` start header of any later stage.

#### Observe

```text
 993:1012  error  Don't start a sentence with 'So '.  write-good.So
 959:1344  error  Don't start a sentence with '; so '.  write-good.So
✖ 2 errors, 0 warnings and 0 suggestions in 152 files.
passed: false
```

The only lines that name `slop`, `coverage`, `bats` or `integration` are log lines 3, 7 and 11, the chain definitions (`sh -c 'pnpm bkit:gate:static-unit && pnpm test:integration'`, etc.); there is no `> @cbartens/bkit@6.2.0 bkit:slop:delta` or similar header.

#### Result

CONFIRMED — exactly two errors; `bkit:slop:delta`, `test:coverage:unit`, `bkit:test:bats`, `bkit:test:awake` and `test:integration` never started.

### Hypothesis 2: This branch's own doc edits introduced the two sentences

#### Reason

The plan has this branch edit both `.bkit/core/.bkit/workflows.md` and `docs/testing.md`.

#### Act

`git log -S` for each sentence; `git diff -U0 724848c61 HEAD` hunk headers for both files.

#### Observe

```text
724848c61 feat(958-agents-orchestrator-write): agents write their own reports and the engine checks them
mb=724848c619c2d37d7cd492552c0a24e37f0228d5
@@ -965 +965 @@   (docs/testing.md)
@@ -131,2 +131,2 @@ / @@ -150 +150 @@ / @@ -825 +825 @@ / @@ -1128 +1128 @@ / @@ -1354 +1354 @@   (.bkit/core/.bkit/workflows.md)
```

#### Result

REFUTED — both sentences come from the merge-base commit `724848c61` on `dev`; the branch's hunks do not touch lines 959 or 993.

### Hypothesis 3: The prose gate is broken in this worktree (missing styles) and reports false errors

#### Reason

Ledger row kn-lint-prose-gitignored-styles-silently-disable-gate-in-worktrees records Vale styles missing in worktrees.

#### Act

Read the log lines around the prose run, and read the flagged sentences at the reported columns.

#### Observe

```text
[bkit-ci] .vale/styles/write-good absent (fresh checkout or worktree) - restoring
```

`.bkit/core/.bkit/workflows.md:993`: "... only for an uncounted pause. So when the checked file holds items against a `Stop` loop question ..."; `docs/testing.md:959`: "... a `Source changed:` header line; so a later `decision-counts` row finds no answer, ...".

#### Result

REFUTED — the styles were restored and Vale ran over 152 files; both flagged sentences really do start with "So" / "; so", so the errors are true positives.

### Hypothesis 4: dev already carries the fix, in exactly the prescribed wording

#### Reason

The orchestrator states the same two sentences fail on the integration branch and that the fix there is fixed wording.

#### Act

`git log 724848c61..dev`, `git show d423cd53b --word-diff`, `git show dev:<file> | grep` for the new wording, `grep -c` for the old wording on `dev`.

#### Observe

```text
d423cd53b docs(958-agents-orchestrator-write): two sentences pass the prose check
[-So when the-]{+A+} ... [-exits-]{+exit+} [-fix-]{+fix,+}
[-line; so-]{+line, which leaves+} [-finds-]{+with+}
A checked file that holds items against a `Stop` loop question, or no item against a `Decide` one, therefore makes check exit 6 after the one fix, and the run ends in the **Failure Path**.
header line, which leaves a later `decision-counts` row with no answer,
.bkit/core/.bkit/workflows.md dev: 0
testing dev: 0
```

`d423cd53b` also changes `.bkit/version`: `-".bkit/workflows.md": "5fb2da0d..."` / `+".bkit/workflows.md": "ffad6859..."`.

#### Result

CONFIRMED — `dev`'s `d423cd53b` uses the prescribed wording byte for byte; this branch lacks that commit, and the fix must also re-render `.bkit/workflows.md` and its `.bkit/version` hash.
