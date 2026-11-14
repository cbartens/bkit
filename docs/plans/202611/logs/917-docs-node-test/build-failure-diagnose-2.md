Verdict: CONCERNS
Mode: NORMAL

<!-- verdict:end -->

# Debug Failure Diagnosis

## Mode Reasoning

`NORMAL`: the failing assertion (`instructions-coverage.test.ts:278:42`) names the file, the section and both texts, and an in-memory run of every check with the one-line store edit applied returns no finding.

## CI Run

NOT CHECKED: this is a local gate failure (`pnpm bkit:gate:static-unit-integration`, log `run-tests-2.log`); no remote CI run exists for this attempt.

## Prior Attempts Reviewed

- Round 1 (`build-failure-diagnose-1.md`, remediation commit `eb0b10638`): fixed the uncovered-section failure by inserting `§ Test first; ` into `.bkit/core/docs/templates/bkit-audit-testing.md:42`, then ran the upgrade, which re-rendered `docs/templates/bkit-audit-testing.md:42` and `.bkit/version`. That fix worked: `templates.test.ts` is green in round 2, and the failure count fell from 2 to 1 (`ci-scripts.test.ts` also passed this round, `run-tests-2.log:178`).
- Why it left a red: `.bkit/instructions.md` § Local Instructions holds a word-for-word copy of every standing line of each audit template, and line 42 is one of them (`.bkit/instructions.md:14988`, under `#### bkit-audit-testing`). Round 1 told the remediator to run `pnpm instructions:show --file bkit-audit-testing` and concluded only that the line "is not a shared clause in that output". It did not check the local entry, and it did not apply the two ACTIVE knowledge rows on exactly this gotcha.
- Does this re-apply a prior commit SHA or debug log? No. Round 1 edited the template and its mirror; this round edits only the store copy in `.bkit/instructions.md`, which no earlier attempt touched. The template change stays as it is.

## Prior Knowledge

- instructions-store-clause-text-and-local-entries-need-hand-edits: editing a standing template / workflow / prompt line reds `instructions-coverage.test.ts` with the pair "no entry — add under ####" plus "local entry no longer in the file", and `pnpm instructions:sync` does not rewrite a local entry's line — applied as the fix route (hand-edit the entry) and as the verification route (check-only exit 0, then a sync that prints nothing).
- renumbering-a-workflow-leaves-instructions-md-local-entries-stale: `syncCoverage` adds no entry and drops no stale entry, so the `- source:` block must be rewritten by hand in the same change — applied as confirmation, matched against `instructions.ts:1660-1702`.
- dogfood-template-mirrors-need-install-after-a-core-template-or-core-bkit-doc-edit: a core template edit needs the upgrade re-render and a `.bkit/version` re-pin — applied as a check that round 1 already did both (`docs/templates/bkit-audit-testing.md:42` equals the source line; `.bkit/version` is in the branch diff), and that `.bkit/instructions.md` is not one of those mirrors.

## Related Issues

- #917 — Docs: how a Node test file reports test names to bkit:test:file (OPEN): this run's issue.
- #666 — Rename wording.md to instructions.md: one store for every instruction (CLOSED): created the store whose local entries cause this failure; it is background, not an earlier incident.
- A search for the error text "local entry no longer in the file" returned no issue; a second search with other terms returned results, so the search itself works.

## Failures

One failure in the unit tier of one gate run (`run-tests-2.log:3380-3392`): `.bkit/core/engine/tools/instructions-coverage.test.ts > the repo > has no coverage findings`, `AssertionError: expected [ …(2) ] to deeply equal []`. The two findings are one cause seen from both sides:

1. `.bkit/core/docs/templates/bkit-audit-testing.md:42: no entry — add under #### bkit-audit-testing: ...; § What each tier must do; § Test first; § Design assertions are a dimension, not a lane; ...`: the new source line has no store entry.
2. `bkit-audit-testing: local entry no longer in the file: ...; § What each tier must do; § Design assertions are a dimension, not a lane; ...`: the old store entry no longer matches any line of the file.

Totals: `Test Files  1 failed | 176 passed (177)`, `Tests  1 failed | 7661 passed | 2 skipped (7664)`. Because the unit step failed, `pnpm bkit:test:bats`, `pnpm bkit:test:awake` and `pnpm test:integration` did not run.

The check-only mode (`pnpm exec tsx .bkit/core/engine/tools/instructions.ts`, no flag) reproduces exactly the same two findings and exits 1, with no other finding.

## Root Cause

1. Stale local entry in the instruction store.
   - Proximate cause: `.bkit/instructions.md:14988` still holds the line as it read before round 1. `checkCoverage` (`instructions.ts:1351`) matches each standing line of a template to a store entry by exact text, so the edited line has no entry and the old entry has no line.
   - Design fragility: § Local Instructions keeps a verbatim copy of every standing line, but no tool rewrites those copies. `pnpm instructions:sync` runs `--write`, and its store step `syncCoverage` (`instructions.ts:1660-1702`) rewrites only `- carriers:` lines of shared entries and drift-item line numbers; it never adds, drops or rewrites a local entry's text. The store's own header says so in effect: "`instructions-coverage.test.ts` fails on a standing line with no entry and on an entry its file no longer holds" (`.bkit/instructions.md:9959`), and the failure message prints the entry to add.
   - What `--write` would change now: nothing. An in-memory run of the full `--write` pipeline (`syncSources`, `syncCarry`, `syncClauses`, `syncStore`, `syncCoverage`, with no file written) gave `syncSources changes store: false`, `syncCarry files: []`, `syncClauses files: []`, `store changed: false lines 15292 -> 15292`, `differing line positions: 0`, and the same two coverage findings afterwards. So the feared rewrite of about 40 prompts does not happen here, and running `pnpm instructions:sync` would not fix the test either.
   - Contributing factor: round 1's remediation checked the shared-clause side of the store (`instructions:show`) but not the local-entry side, and the plan (docs only) named no store edit.

## Rot Signals

debt

- debt: `.bkit/instructions.md` § Local Instructions holds a verbatim copy of every standing line, and `syncCoverage` (`instructions.ts:1660-1702`) never refreshes one, so every source-line edit needs a matching hand edit; two ACTIVE knowledge rows already record this gotcha, and this run hit it a third time.

## Recommended Remediation

1. `.bkit/instructions.md:14988` (inside the fenced `text` block under `#### bkit-audit-testing`, `- source: .bkit/core/docs/templates/bkit-audit-testing.md`): hand-edit the one line with the Edit tool. Replace `§ What each tier must do; § Design assertions are a dimension, not a lane;` with `§ What each tier must do; § Test first; § Design assertions are a dimension, not a lane;`. The old span occurs on this one store line only (checked: `store lines holding old span: [14988]`). The finished line must equal `.bkit/core/docs/templates/bkit-audit-testing.md:42` without its leading `- `.
   - Before the edit, follow `.bkit/authoring.md` § All Agent-Read Files and § Docs, which the store's header names for edits to this file.
   - Do not run `pnpm instructions:sync` as the fix: it changes 0 files and 0 lines now, and the two findings remain after it.
2. Then run the check-only mode: `pnpm exec tsx .bkit/core/engine/tools/instructions.ts`. Expected: exit 0 and no output. An in-memory run with this edit applied gave `coverage: []`, `clauses: 0`, `blocks: 0`, `sources: []`, `similar: []`, no carry findings, `ruleCopies: []`, `storeStale: false`.
3. Optional confirmation from the knowledge row: `pnpm instructions:sync` after the edit. The same in-memory run showed it would write nothing (`writeWouldChangeStore: false`, `writeCarryFiles: []`, `writeClauseFiles: []`). Expect no output and no new `git status` entry; if it prints any `rewrote` line, stop and report it.
4. No `bkit upgrade` and no `.bkit/version` refresh: `.bkit/instructions.md` is a repo-only file, not a rendered mirror (no `.bkit/core/.bkit/instructions.md` or `.bkit/shared/instructions.md` source exists), `.bkit/version` holds no `instructions.md` entry (0 matches), and `package.json` `files` does not ship it. Round 1 already re-rendered `docs/templates/bkit-audit-testing.md` and re-pinned `.bkit/version`.
5. No source file change: keep `.bkit/core/docs/templates/bkit-audit-testing.md:42` as round 1 left it.

## Out-of-Scope Recommendations

- `.bkit/core/engine/tools/instructions.ts:1660` (`syncCoverage`): consider letting `pnpm instructions:sync` add the missing entry and drop the stale one when one standing line of a file changed (the checker already prints the entry to add). Rationale: appears only in the failure path; an engine change is outside this docs-only run; the debt is recorded in two knowledge rows.
- `.bkit/templates/scripts/ci/bkit-test-awake.test.mjs:35` (and `scripts/ci/bkit-test-awake.test.mjs`): carried over from round 1; the non-atomic `cancelled` write is still a flake risk, although the test passed this round (`run-tests-2.log:178`). Rationale: not touched by this run; record it on #481.

## Blast Radius

Localised. `.bkit/instructions.md` is read only by bkit's own instruction tools and tests (`instructions.ts`, `instructions-coverage.test.ts`, `instructions.test.ts`, `instructions-sources.test.ts`, `pnpm instructions:show`). It is not shipped (`package.json` `files`: `.bkit/core`, `.bkit/shared`, `.bkit/templates`, `dist`, `README.md`, `DETAILS.md`, `CHANGELOG.md`), not rendered by install, and not pinned in `.bkit/version`. The in-memory run of every check after the edit showed no new finding in any of them.

## Suggested Tests

- No new test: `instructions-coverage.test.ts` "has no coverage findings" already guards this and goes green with the edit.

## Verification Commands

- `pnpm exec tsx .bkit/core/engine/tools/instructions.ts` (expect exit 0, no output)
- `pnpm bkit:test:file .bkit/core/engine/tools/instructions-coverage.test.ts`
- `pnpm bkit:test:file .bkit/core/engine/tools/instructions.test.ts`
- `pnpm bkit:test:file .bkit/core/engine/tools/instructions-sources.test.ts`
- `pnpm bkit:test:file .bkit/core/engine/audits/templates/templates.test.ts`
- `pnpm bkit:gate:static-unit-integration`

## Documentation Warnings

```jsonl
{"topic": "noise", "gap": "starter-only: the registry holds its header and rules but no entries", "recommendedPath": "docs/noise.md", "alternativeEvidence": "None available", "action": "Add entries when a signal is deliberately downgraded; nothing in this failure needs one."}
{"topic": "deployments / observability", "gap": "not loaded: listed for Debug in .agents/docs.md but irrelevant to a local unit-test failure with no deploy or runtime signal", "recommendedPath": "docs/deployments.md", "alternativeEvidence": "The gate log run-tests-2.log and docs/testing.md:819 (the instructions-coverage.test.ts row) cover this failure.", "action": "None for this run."}
```

## Hypotheses

### Hypothesis 1: The store's local entry for `bkit-audit-testing.md:42` still holds the pre-round-1 text, so coverage reports one missing and one stale entry

#### Reason

Round 1 inserted `§ Test first; ` into `.bkit/core/docs/templates/bkit-audit-testing.md:42`, and the two findings differ by exactly that span. The knowledge row `instructions-store-clause-text-and-local-entries-need-hand-edits` predicts this pair.

#### Act

`grep -n -F 'bkit block of `docs/testing.md` (bkit version' .bkit/instructions.md .bkit/core/docs/templates/bkit-audit-testing.md docs/templates/bkit-audit-testing.md`, then the check-only mode `pnpm exec tsx .bkit/core/engine/tools/instructions.ts`.

#### Observe

`.bkit/instructions.md:14988:bkit block of ... § What each tier must do; § Design assertions are a dimension, not a lane; ...` versus `.bkit/core/docs/templates/bkit-audit-testing.md:42:- bkit block of ... § What each tier must do; § Test first; § Design assertions are a dimension, not a lane; ...`. Check-only: `exit=1`, two lines, `[bkit-instructions] .bkit/instructions.md .bkit/core/docs/templates/bkit-audit-testing.md:42: no entry — add under #### bkit-audit-testing: ...` and `[bkit-instructions] .bkit/instructions.md bkit-audit-testing: local entry no longer in the file: ...`.

#### Result

CONFIRMED — the store line is the only place still holding the old text, and the check-only mode reproduces the test's two findings exactly.

### Hypothesis 2: `pnpm instructions:sync` (`--write`) fixes the stale entry

#### Reason

The caller asked which sanctioned command brings the entry in line, and the script name suggests sync covers it. The memory rule warns that `--write` with a missing entry can rewrite about 40 prompts.

#### Act

Read `main` and `syncCoverage` (`instructions.ts:1660-1800`). Ran the `--write` pipeline in memory with `pnpm exec tsx -e` (imports `syncSources`, `syncCarry`, `syncClauses`, `syncStore`, `syncCoverage`; writes no file), then `git status --porcelain` before and after.

#### Observe

`syncCoverage` touches only `- carriers:` lines of shared entries and drift-item line numbers. Probe output: `syncSources changes store: false`, `syncCarry files: []`, `syncClauses files: []`, `store changed: false lines 15292 -> 15292`, `differing line positions: 0`, `coverage findings after simulated write: [".bkit/core/docs/templates/bkit-audit-testing.md:42: no entry — add under #### bkit-audit-testing: ...","bkit-audit-testing: local entry no longer in the file: ..."]`. `git status --porcelain` unchanged (` M .../status.jsonl`, `?? .../build-failure-diagnose-2.md`).

#### Result

REFUTED — `--write` would change 0 files and 0 lines and leave both findings; the 40-prompt rewrite does not happen here, but sync is not the fix.

### Hypothesis 3: A hand edit of `.bkit/instructions.md:14988` alone clears every instruction check, with no mirror or version refresh

#### Reason

The store header (`.bkit/instructions.md:9959`) and both knowledge rows name the hand edit. The store may still have other checks (carriers, similarity, sources) that the edit could trip.

#### Act

In-memory probe: replaced the span on store line 14988 only, then ran every check `main` runs (`checkClauses`, `checkBlocks`, `checkSources`, `checkCoverage`, `similarEntries`, `checkCarry`, `checkRuleCopies`, `syncStore` equality) plus a simulated `--write`. Checked `.bkit/version` and `package.json` `files` for the store, and looked for a core or shared source of it.

#### Observe

`store lines holding old span: [14988]`; `{"clauses":0,"blocks":0,"sources":[],"coverage":[],"similar":[],"carryMissing":[],"carryUndeclared":[],"carryEmpty":[],"ruleCopies":[],"storeStale":false,"writeWouldChangeStore":false,"writeCarryFiles":[],"writeClauseFiles":[]}`. `ls: .bkit/core/.bkit/instructions.md: No such file or directory`, `ls: .bkit/shared/instructions.md: No such file or directory`; `grep -c 'instructions.md' .bkit/version` gave `0`; `files`: `[".bkit/core",".bkit/shared",".bkit/templates","dist","README.md","DETAILS.md","CHANGELOG.md"]`.

#### Result

CONFIRMED — the one-line edit clears every check in memory, and the store is neither a mirror, nor pinned, nor shipped, so no upgrade or `.bkit/version` change follows from it.
