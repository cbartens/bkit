Verdict: CONCERNS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

`NORMAL`: Vale names both failing lines exactly, and a scratch-copy probe shows that the dev wording from `d423cd53b` clears both errors (`vale` exit 0).

## CI Run

NOT CHECKED: the red gate was the local `pnpm bkit:gate:static-unit-integration` run (`status.jsonl` row `test-run`, `"source":"local"`, log `run-tests-1.md`). That log names both errors, so no remote run was needed.

## Prior Attempts Reviewed

None

## Prior Knowledge

- kn-lint-prose-gitignored-styles-silently-disable-gate-in-worktrees: the prose gate repairs a missing gitignored `.vale/styles/write-good` in a worktree, or else fails; it never passes silently. Applied as: the log line `[bkit-ci] .vale/styles/write-good absent (fresh checkout or worktree) - restoring` is that repair at work, so the two errors come from a real check and are not a missing-style artefact (reproduced in Hypothesis 2).
- kn-29-bkit-lints-itself-with-a-narrower-lint-prose-than-it-ships: `bkit:lint:prose` covers the shipped `.md` sources by glob. Applied as: the rendered `.bkit/workflows.md` carries the same "So when" sentence but no glob covers it, so Vale flags only the source `.bkit/core/.bkit/workflows.md`. The fix therefore goes into the source, followed by a re-render.

## Related Issues

- #1076 — bkit's changed-files gate runs no prose check on changed .md files (OPEN). Its body reports this exact failure: "On `dev` at `c9dc729f1`, run `pnpm -s bkit:lint:prose`. It exits 1 and names two lines that commit `724848c61` wrote (rule `write-good.So`)."
- #958 — Agents and the orchestrator write their own .md files; the engine checks and counts (CLOSED). Both sentences were written under this issue in `724848c61`, and dev fixed them under it in `d423cd53b`.
- #765 — ci: fail prose lint when Vale or required styles are unavailable (CLOSED). This issue added the style repair seen in the log.

## Failures

`pnpm bkit:gate:static-unit-integration` exited 1 at its prose lint stage, `pnpm bkit:lint:prose` (`bkit ci prose`, Vale 3.24.0), reporting `✖ 2 errors, 0 warnings and 0 suggestions in 152 files.`:

- `.bkit/core/.bkit/workflows.md` `993:1012  error  Don't start a sentence with 'So '.  write-good.So`, in the "Resume into a red-gate pause" bullet.
- `docs/testing.md` `959:1344  error  Don't start a sentence with '; so '.  write-good.So`, in the `commands/workflow/decisions.test.ts` table row.

Both errors trip the same Vale rule and come from the same base commit. Every stage before prose lint passed: typecheck, lint, `format:check` ("All matched files use Prettier code style!") and `format:tables:check` ("0/156 files need formatting"). The `&&` chain stopped there, so `bkit:slop:delta`, `test:coverage:unit`, `bkit:test:bats`, `bkit:test:awake` and `test:integration` never ran. Their state is unknown.

## Root Cause

**Issue 1: two inherited prose-lint errors.**

- Proximate cause: `git blame` puts both lines (workflows.md:993 and testing.md:959) in `724848c61` ("feat(958-agents-orchestrator-write): agents write their own reports and the engine checks them"), which is an ancestor of the branch base `c9dc729f1` (`git merge-base HEAD dev`). The branch never edits either line: its only change to `.bkit/core/.bkit/workflows.md` is at lines 1253-1254 and 1499, and it does not change `docs/testing.md` at all. Each sentence opens a clause with "So" (`So when the checked file holds items ...`, `...header line; so a later ...`), which `write-good.So` rejects.
- Fix already on dev: `d423cd53b` ("docs(958-agents-orchestrator-write): two sentences pass the prose check") rewords both lines and is not an ancestor of HEAD (`NOT_IN_BRANCH`). The branch's current lines are byte-identical to the lines in `d423cd53b^`, so the same text replacement applies cleanly here.
- Design fragility: no gate on a build's own steps runs Vale. `bkit:gate:changed` has no prose stage (#1076), so a prose error passes its step's gate, verify and commit, and shows up only at a later full static gate. In this run, that later gate belongs to a different branch.
- Contributing factor: this branch was cut from `dev` at `c9dc729f1`, after `724848c61` and before `d423cd53b`, so it inherited a red static gate.

## Rot Signals

tests

- tests: `bkit:gate:changed` (`scripts/gate/bkit-gate-changed.mjs`) runs no prose stage, so the `write-good.So` errors from `724848c61` passed its step gates and turned this unrelated branch's full gate red (#1076, OPEN).

## Recommended Remediation

Both files are in scope: TASK 4's DONE WHEN in `docs/plans/202611/1032-verbose-ci-head-plan.md` names `.bkit/core/.bkit/workflows.md` and `docs/testing.md`. Find each edit by its text, not by its line number. Each edited line must end byte-identical to the same line in `d423cd53b`.

1. `.bkit/core/.bkit/workflows.md`, the "Resume into a red-gate pause" bullet (currently line 993). Replace
   `So when the checked file holds items against a `Stop` loop question, or no item against a `Decide` one, check exits 6 after the one fix and the run ends in the **Failure Path**.`
   with
   `A checked file that holds items against a `Stop` loop question, or no item against a `Decide` one, therefore makes check exit 6 after the one fix, and the run ends in the **Failure Path**.`
   The `d423cd53b` change has one more word change than the caller's summary gives: it also adds a comma, so "after the one fix and the run ends" becomes "after the one fix, and the run ends". A word-level `git show d423cd53b --word-diff=porcelain` lists `-fix` / `+fix,`. Copy that comma too, so the line matches dev exactly.
2. `docs/testing.md`, the `commands/workflow/decisions.test.ts` row (currently line 959). Replace
   `header line; so a later `decision-counts` row finds no answer, while`
   with
   `header line, which leaves a later `decision-counts` row with no answer, while`
   Leave the rest of the row unchanged.
3. Re-render the mirrors with `pnpm tsx .bkit/core/engine/cli.ts upgrade` (`.agents/rules.md` § Install to mirror). `package.json` has no `upgrade` script, and `pnpm bkit upgrade` runs the built `node dist/cli.js upgrade` instead. Never hand-edit `.bkit/workflows.md`.
   - The expected footprint is exactly four files: the two sources, `.bkit/workflows.md` (one line) and `.bkit/version` (the `".bkit/workflows.md"` entry in `canonicalHashes`). `.bkit/version` changing is part of the re-render, not an extra edit. `d423cd53b` changed it for the same reason, and so did this branch's own earlier workflows.md render (`git diff --stat c9dc729f1..HEAD -- .bkit/version`). The caller's rule "No other file may change" has to allow this one file, or the install-drift check reports a hash mismatch.
   - **If** `git status --short` after the upgrade shows any changed file beyond those four and this run's log files → stop and report it; do not commit it.
   - Do not touch `.bkit/core/workflows/`, `.bkit/core/prompts/`, `.bkit/instructions.md` or `scripts/**`.

## Out-of-Scope Recommendations

- `scripts/gate/bkit-gate-changed.mjs`: add a Vale stage limited to the changed `.md` files the prose globs cover, so a step catches its own prose error at its own gate. #1076 already tracks this.

## Blast Radius

- `.bkit/workflows.md` (the rendered copy of the source): the upgrade regenerates it. Compatible.
- `.bkit/version` `canonicalHashes`: the upgrade rewrites the one `.bkit/workflows.md` hash, which is what `bkit check` compares against for install drift. Compatible, as long as the upgrade runs after the edit.
- Tests that pin the text: `git grep -l -F 'So when the checked file holds items'` and `git grep -l -F 'header line; so a later'` (excluding `docs/plans/**`) hit only `.bkit/core/.bkit/workflows.md`, `.bkit/workflows.md` and `docs/testing.md`. No test asserts either sentence. Compatible.
- Merging into `dev`: `dev` already holds byte-identical lines from `d423cd53b`. When both sides make the same change to a line, git merges it without a conflict. Compatible.

## Suggested Tests

- None in scope: the fix is a two-sentence prose change that `pnpm bkit:lint:prose` already checks.
- Out of scope (#1076): a `bkit-gate-changed` test showing that a changed covered `.md` file with a `write-good.So` sentence fails the changed-files gate.

## Verification Commands

```bash
git grep -n -F -e 'So when the checked file holds items' -e 'header line; so a later' -- .bkit/core/.bkit/workflows.md .bkit/workflows.md docs/testing.md   # expect no output, exit 1
diff <(grep -F 'A checked file that holds items' .bkit/core/.bkit/workflows.md) <(git show d423cd53b:.bkit/core/.bkit/workflows.md | grep -F 'A checked file that holds items')   # expect no diff
diff <(grep -F 'which leaves a later `decision-counts` row' docs/testing.md) <(git show d423cd53b:docs/testing.md | grep -F 'which leaves a later `decision-counts` row')   # expect no diff
pnpm tsx .bkit/core/engine/cli.ts upgrade
git status --short   # expect only the two sources, .bkit/workflows.md, .bkit/version, plus run logs
pnpm bkit:lint:prose   # expect passed: true, 0 errors
pnpm bkit check   # expect no install-drift finding for .bkit/workflows.md
pnpm bkit:gate:static-unit-integration   # the stages after prose lint have not run yet
```

## Hypotheses

### Hypothesis 1: This branch wrote the two failing sentences

#### Reason

A red gate on a feature branch usually points at the branch's own diff, and the branch does edit `.bkit/core/.bkit/workflows.md`.

#### Act

`git diff -U0 c9dc729f1..HEAD -- .bkit/core/.bkit/workflows.md`, `git diff --stat c9dc729f1..HEAD -- docs/testing.md`, `git blame -L 993,993` / `-L 959,959` and `git merge-base --is-ancestor 724848c61 c9dc729f1`.

#### Observe

```text
@@ -1253,2 +1253,2 @@ ...
@@ -1499 +1499 @@ ...
724848c619c2d37d7cd492552c0a24e37f0228d5 993 993 1
724848c619c2d37d7cd492552c0a24e37f0228d5 959 959 1
BLAME_IN_BASE
```

The `--stat` for the two files listed only `.bkit/core/.bkit/workflows.md | 6 +++---`, so the branch does not change `docs/testing.md`.

#### Result

REFUTED — both lines come from `724848c61`, which is already in the base `c9dc729f1`, and the branch edits neither line.

### Hypothesis 2: The errors are an artefact of the worktree's missing write-good styles

#### Reason

kn-lint-prose-gitignored-styles-silently-disable-gate-in-worktrees: `.vale/styles/write-good` is gitignored and absent in worktrees, and the log shows the gate restoring it.

#### Act

Ran `vale --config=.vale.ini --output=line` on untouched scratch copies of both files (scratchpad only, no repo file touched).

#### Observe

```text
vale version 3.24.0
.../probe/workflows.md:993:1012:write-good.So:Don't start a sentence with 'So '.
.../probe/testing.md:959:1344:write-good.So:Don't start a sentence with '; so '.
before rc=1
```

#### Result

REFUTED — after the restore, a separate Vale run reports the same two errors at the same positions, so they are real prose findings.

### Hypothesis 3: The dev wording from d423cd53b clears both errors and applies cleanly here

#### Reason

`d423cd53b` on `dev` ("two sentences pass the prose check") rewords exactly these two lines, and it is not in this branch.

#### Act

Ran `git merge-base --is-ancestor d423cd53b HEAD`, compared the branch lines with `d423cd53b^` using `cmp`, listed the word changes with `git show d423cd53b --word-diff=porcelain`, then put the `d423cd53b` lines into the scratch copies and re-ran Vale.

#### Observe

```text
NOT_IN_BRANCH
.bkit/core/.bkit/workflows.md:993 IDENTICAL_TO_DEV_PREFIX
docs/testing.md:959 IDENTICAL_TO_DEV_PREFIX
-So when the
+A
+that
+therefore makes
-exits
+exit
-fix
+fix,
-line; so
+line, which leaves
-finds
+with
after rc=0
```

#### Result

CONFIRMED — the `d423cd53b` lines clear Vale (exit 0). The workflows.md change also includes a comma (`fix` to `fix,`) that the caller's summary leaves out.

### Hypothesis 4: The rendered .bkit/workflows.md also fails prose lint and needs its own edit

#### Reason

`git grep` finds the "So when the checked file holds items" sentence in `.bkit/workflows.md` as well as in its source.

#### Act

Compared the `bkit:lint:prose` globs in `package.json` with the gate output, and read `git show d423cd53b --stat`.

#### Observe

The globs are `'.agents/*.md' '.bkit/core/.bkit/*.md' ... 'docs/*.md' '*.md'`, and the gate flagged only `.bkit/core/.bkit/workflows.md` and `docs/testing.md` among its 152 files. The `d423cd53b` stat lists `.bkit/core/.bkit/workflows.md | 2 +-`, `.bkit/version | 2 +-`, `.bkit/workflows.md | 2 +-` and `docs/testing.md | 2 +-`.

#### Result

REFUTED — no glob covers the rendered copy, so it needs no hand edit. It still has to be re-rendered by `upgrade`, which also rewrites its hash in `.bkit/version`.

### Hypothesis 5: Other gate stages hide further failures behind the prose stage

#### Reason

The `&&` chain stopped at `bkit:lint:prose`, so the later stages produced no evidence.

#### Act

Read `run-tests-1.md` for the stages that ran.

#### Observe

```text
> pnpm typecheck && pnpm lint && pnpm format:check && pnpm format:tables:check && pnpm bkit:lint:prose && pnpm bkit:slop:delta
✖ 2 errors, 0 warnings and 0 suggestions in 152 files.
 ELIFECYCLE  Command failed with exit code 1.
```

#### Result

INCONCLUSIVE — `bkit:slop:delta`, `test:coverage:unit`, `bkit:test:bats`, `bkit:test:awake` and `test:integration` never ran. Re-run the full gate after the fix; confidence that the gate goes fully green is capped until then.
