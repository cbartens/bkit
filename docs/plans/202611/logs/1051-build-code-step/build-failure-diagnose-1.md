Verdict: CONCERNS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

`NORMAL`: the failing check names both file:line:column spans, a direct `vale` run reproduces them, and the fix is a two-sentence rewording.

## CI Run

NOT CHECKED: the failure is the local `build-run-tests` gate (`pnpm bkit:gate:static-unit-integration`, `run-tests-1.md`), not a remote run; the introducing commit `724848c61` is on local `dev` only (`git merge-base --is-ancestor 724848c61 origin/dev` → not an ancestor), so no remote CI run has linted it. The latest `origin/dev` CI run (`bkit-ci` run 44572945242 at `c92ba6ea1`, success) predates it.

## Prior Attempts Reviewed

None

## Prior Knowledge

kn-29-bkit-lints-itself-with-a-narrower-lint-prose-than-it-ships: bkit's own `bkit:lint:prose` must cover every shipped `.md` — applied as confirmation that `.bkit/core/.bkit/*.md` and `docs/*.md` sit in the prose glob by design, so the fix is the wording, never a narrower glob or a `.vale.ini` exemption.
kn-23-server-side-ci-is-the-only-quality-gate-agent-self-verifica: a local PASS is narrower than the full gate — applied as the explanation for why three green `bkit:gate:changed` holistic runs did not predict this red: that gate runs lint, format, types and named tests, never Vale.
Reverted-commit search (`git log -i --grep=revert -- .bkit/core/.bkit/workflows.md docs/testing.md .vale.ini`): no revert touches the two sentences or the write-good rule set; the only true revert hit (`152991894`, roadmap machinery) is unrelated. External signal not searched: the failure is in-repo text, not a third-party issue (step 10 condition not met).

## Related Issues

- #958 — Agents and the orchestrator write their own .md files; the engine checks and counts (CLOSED) — the issue whose commit `724848c61` introduced both flagged sentences.
- No prior-incident issue matches (`gh issue list --search 'write-good So prose'` returned five unrelated review issues: #949, #410, #964, #551, #1012).

## Failures

One failing check: `bkit:lint:prose` (Vale, rule `write-good.So`) inside `pnpm bkit:gate:static`, the first stage of `pnpm bkit:gate:static-unit-integration`.

```
 .bkit/core/.bkit/workflows.md
 993:1012  error  Don't start a sentence with 'So '.  write-good.So

 docs/testing.md
 959:1344  error  Don't start a sentence with '; so '.  write-good.So

✖ 2 errors, 0 warnings and 0 suggestions in 152 files.
```

The two errors are independent instances of the same rule. `typecheck`, `lint`, `format:check` and `format:tables:check` passed before it. Because `bkit:gate:static` chains with `&&`, `bkit:slop:delta`, `test:coverage:unit`, `bkit:test:bats`, `bkit:test:awake` and `test:integration` never ran in this attempt: their state for this tree is unknown from this run (the holistic gate attempt 3 ran the named Vitest files, including `steps.test.ts`, and passed).

## Root Cause

**Issue 1 — two sentences break `write-good.So`, both inherited from the branch base, not written by this build.**

- Proximate cause: `.bkit/core/.bkit/workflows.md:993` holds "… only for an uncounted pause. So when the checked file holds items against a `Stop` loop question …", and `docs/testing.md:959` (the `commands/workflow/decisions.test.ts` row of Key test files) holds "… gained a `Source changed:` header line; so a later `decision-counts` row finds no answer …". The rule's pattern (`.vale/styles/write-good/So.yml`) is `'(?:[;-]\s)so[\s,]|\bSo[\s,]'` at level `error`; `.vale.ini` `[*.md]` enables write-good and only `[**/docs/plans/**/*.md]` turns `write-good.So` off.
- Origin: `git blame` puts both lines on `724848c61` (`feat(958-agents-orchestrator-write): agents write their own reports and the engine checks them`); its parent holds neither phrase (`grep -c` = 0 on `724848c61^` for both). `724848c61` is the merge base of this branch with `dev`, and `dev` still carries both lines unchanged. This branch's own edits to these two files (tasks 2–5) are elsewhere in them.
- Design fragility: `724848c61` sits on local `dev` unpushed. `.husky/pre-commit` runs only `pnpm bkit:gate:format`, and Vale runs only in `bkit:gate:static` (pre-push, CI, build Step 12). So a prose error committed to local `dev` stays invisible until the next full gate, and every branch cut from `dev` after it inherits a red full gate.
- Contributing factor: this build's per-group and holistic gates ran `bkit:gate:changed` (`scripts/gate/bkit-gate-changed.mjs`: lint, format, types, named tests — no Vale), so `run-tests` is the first stage of the build that runs prose lint.

## Rot Signals

tests — `724848c61` landed on local `dev` with two `error`-level Vale findings because no gate below pre-push runs `bkit:lint:prose`; every branch cut from `dev` since inherits a red `bkit:gate:static` (`git blame` + `git merge-base --is-ancestor 724848c61 origin/dev` → not pushed).

## Recommended Remediation

Both files are plan work targets (task 2 UPDATE `.bkit/core/.bkit/workflows.md` and `docs/testing.md`; tasks 3–5 again), so both are in scope. Reword only the two flagged sentences; keep their meaning; no `.vale.ini` exemption and no glob change (kn-29).

1. `.bkit/core/.bkit/workflows.md:993` (the **Resume into a red-gate pause** bullet, column 1012): replace "So when the checked file holds items against a `Stop` loop question, or no item against a `Decide` one, check exits 6 after the one fix and the run ends in the **Failure Path**." with a sentence that does not use `So` as a word anywhere, for example "A checked file that holds items against a `Stop` loop question, or no item against a `Decide` one, therefore makes check exit 6 after the one fix, and the run ends in the **Failure Path**." (this shape passed the repo's `.vale.ini` in a scratch probe, while the original shape in the same probe was flagged).
2. `.bkit/workflows.md`: the rendered copy of the same sentence; regenerate it with `pnpm tsx .bkit/core/engine/cli.ts upgrade` (rule `Install to mirror`), never hand-edit it.
3. `docs/testing.md:959` (the `commands/workflow/decisions.test.ts` row, column 1344): replace "header line; so a later `decision-counts` row finds no answer, while" with a clause that avoids `; so` and `- so`, for example "header line, which leaves a later `decision-counts` row with no answer, while" (passed the same probe).
4. Mind the rule's pattern `'(?:[;-]\s)so[\s,]|\bSo[\s,]'`: capital `So` followed by a space or comma fails anywhere in a line, and lowercase `so` fails after `; ` or `- `.

## Out-of-Scope Recommendations

- `dev` (local, commit `724848c61`): `dev` carries the same two sentences, so any other branch cut from it after that commit hits this red gate until this branch lands; the orchestrator may want the same two-sentence fix on `dev` directly rather than waiting.
- `.husky/pre-commit` / `scripts/gate/bkit-gate-changed.mjs`: neither runs Vale on changed `.md` files, so a prose error reaches local `dev` unseen; propose a changed-files Vale stage in `bkit:gate:changed` separately (gate-design change, not this build's task).

## Blast Radius

- `.bkit/workflows.md` (rendered mirror of `.bkit/core/.bkit/workflows.md`): must be re-rendered by `upgrade`; `bkit check` mirror drift catches a miss — compatible once re-rendered.
- Tests that read the reworded text: `git grep -l -F` for "only for an uncounted pause" and "finds no answer" hits only the two docs, the mirror, and `decisions.test.ts:2761` (a test name, not a doc read) — compatible.
- No engine code, schema, contract or CLI help changes — otherwise localised.

## Suggested Tests

None new: `bkit:lint:prose` already covers both files and is the regression guard. No test should pin the new wording (docs/testing.md "Pin the mechanism, not the wording").

## Verification Commands

```bash
vale --output=line .bkit/core/.bkit/workflows.md docs/testing.md
pnpm tsx .bkit/core/engine/cli.ts upgrade
pnpm bkit:lint:prose
pnpm bkit check
pnpm bkit:gate:static-unit-integration
```

The last command is the gate that failed; it must also run the stages this attempt never reached (`bkit:slop:delta`, `test:coverage:unit`, `bkit:test:bats`, `bkit:test:awake`, `test:integration`).

## Hypotheses

### Hypothesis 1: The gate fails only on two `write-good.So` prose errors, not on any engine change of this build

#### Reason

`run-tests-1.md` ends at `bkit:lint:prose` with two Vale errors and four `ELIFECYCLE` lines; the stages before it passed.

#### Act

Read `run-tests-1.md`; ran `vale --output=line .bkit/core/.bkit/workflows.md docs/testing.md`; ran `vale` on `AGENTS.md README.md` as a known-clean control.

#### Observe

```
.bkit/core/.bkit/workflows.md:993:1012:write-good.So:Don't start a sentence with 'So '.
docs/testing.md:959:1344:write-good.So:Don't start a sentence with '; so '.
exit=1
known-clean exit=0
```

#### Result

CONFIRMED — the only failures are the two Vale findings, reproduced outside the gate; later stages never ran, so their state is unknown from this run.

### Hypothesis 2: This build introduced the two flagged sentences

#### Reason

Tasks 2–5 edited both files, so the build is the first suspect.

#### Act

`git blame -L 993,993 .bkit/core/.bkit/workflows.md`, `git blame -L 959,959 docs/testing.md`, `git merge-base HEAD dev`, `grep -c` on `724848c61^` for both phrases, `git show dev:<file> | grep` for both phrases.

#### Observe

```
724848c619c2d37d7cd492552c0a24e37f0228d5 993 993 1
summary feat(958-agents-orchestrator-write): agents write their own reports and the engine checks them
724848c619c2d37d7cd492552c0a24e37f0228d5 959 959 1
```

`git merge-base HEAD dev` → `724848c619c2d37d7cd492552c0a24e37f0228d5`; parent counts `0` and `0`; `dev` still holds both lines (993 and 959).

#### Result

REFUTED — both sentences come from `724848c61` (#958), the branch base, and `dev` carries them unchanged.

### Hypothesis 3: Vale or the write-good style drifted (a newer style or binary made old text fail)

#### Reason

The log shows `[bkit-ci] .vale/styles/write-good absent (fresh checkout or worktree) - restoring`, so the worktree's style set was fetched fresh this run.

#### Act

`diff -r .vale/styles/write-good /Users/christian/Documents/GitHub/bkit/.vale/styles/write-good`; `cat .vale/styles/write-good/So.yml`; `vale --version`.

#### Observe

```
IDENTICAL
raw:
  - '(?:[;-]\s)so[\s,]|\bSo[\s,]'
vale version 3.24.0
```

#### Result

REFUTED — the restored style is byte-identical to the main checkout's; the text, not the tool, changed (the parent of `724848c61` has neither phrase). `pnpm bkit:deps:outdated` not run: no version difference surfaced to probe.

### Hypothesis 4: Remote `dev` CI is green on these sentences, so the gate config differs between local and CI

#### Reason

`gh run list --branch dev` shows `bkit-ci` success at `c92ba6ea1`.

#### Act

`git merge-base --is-ancestor 724848c61 c92ba6ea1` and against `origin/dev`; `git log --oneline origin/dev..dev | wc -l`.

#### Observe

```
NOT-IN-PUSHED
not-in-origin-dev
      15
```

#### Result

REFUTED — the green remote run never saw `724848c61`; it is one of 15 unpushed local `dev` commits, so no gate difference is implied.

### Hypothesis 5: The build's earlier gates should have caught this, so a gate was skipped

#### Reason

Three holistic gate runs (`bkit:gate:changed`, 24/33/39 changed files) passed while both files were in the changed set.

#### Act

`grep -n -i -E 'prose|vale' scripts/gate/bkit-gate-changed.mjs` (empty), corroborated with `grep -c -i vitest` (6 hits) and a stage grep; read `.husky/pre-commit` stage lines.

#### Observe

```
9: *   lint     → oxlint on the changed engine .ts files (the `lint` script's scope)
10: *   format   → prettier --check on every changed file it knows, symlinks excluded
11: *   types    → pnpm typecheck when a .ts file changed (tsc checks whole projects only)
```

`.husky/pre-commit`: `16:pnpm bkit:gate:format`.

#### Result

CONFIRMED — no gate was skipped; `bkit:gate:changed` and pre-commit run no Vale by design, so `run-tests` is the first prose check of this build (recorded as the `tests` rot signal).

### Hypothesis 6: A plain rewording clears the rule without a config exemption

#### Reason

The rule is a regex on `So` / `; so` / `- so`; rewording avoids it.

#### Act

Scratch probe file in the session scratchpad with the original shape as a known hit plus both proposed rewrites, run with `vale --config .vale.ini --output=line`.

#### Observe

```
.../vprobe/probe.md:1:72:write-good.So:Don't start a sentence with 'So '.
exit=1
```

Only line 1 (the original shape) is flagged; lines 3 and 5 (the rewrites) produce no finding.

#### Result

CONFIRMED — both proposed rewrites pass the repo's Vale config; the remediator must still re-run Vale on the real files.
