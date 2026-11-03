Verdict: FAIL

<!-- verdict:end -->

# Design Spike

Throwaway probes live under `docs/plans/202610/logs/699-engine-run-completeness/spike/` (8 probe files + their captured `.out`). Run at HEAD `27abf0829` in worktree `.worktrees/699-engine-run-completeness` on Node v24.16.0. Nothing was installed (the repo's own `tsx` / `vitest` were used); no tracked file outside the spike directory was touched; no dependency tree or build output was produced. Every classification below is settled by the captured output in `## Evidence`, not by reading source.

## Claims

Ordered by blast radius. The design element resting on each is named.

<!-- prettier-ignore -->
| # | Claim (falsifiable) | Design element resting on it | Verdict |
| --- | --- | --- | --- |
| C1 | Every `"{BKIT}"` call site in the six workflow markdowns resolves to a registered noun+verb, so `commands/lib.ts` `runCommand` is the single hook that covers all of them (no classic-verb fallback, no unrunnable call). | Journal seam placement (`Architecture` §2; the "verified, not assumed" Decisions row) | SETTLED |
| C2 | The seam's fail-safe contract holds on the real dispatch path: a throwing journal write leaves the command's exit code unchanged and emits one stderr line, and no path in the seam throws, blocks or changes a code. | The whole design's load-bearing guarantee (`Trade-offs Accepted` § "Seam on the shared dispatch path") | BLOCKED |
| C3 | The resolve-or-skip scan the seam runs on every command costs single-digit milliseconds, and the majority of call sites need it. | Hot-path acceptance; review Unknown 3 | SETTLED |
| C4 | The friction row lands in the run's own book root, so it rides the run's commits. | Success criterion 3; the "no `KIND_WRITERS` change" Decisions row | DISPROVEN |
| C5 | An engine-written friction row passes `validate` + `writerProblem` for every call the design expects to record, including the calls with no `--step=` flag. | Success criterion 3; the friction dedup-key Decisions row (CRITICAL 4) | DISPROVEN |
| C6 | Adding `engine-call` + `completeness` to `MARK_ROWS` leaves the step-timing readers' output identical, and a missed reader silently corrupts step minutes. | `MARK_ROWS` reader surgery; review Unknown 4 | SETTLED |
| C7 | `engine-call` + `completeness` rows are ignored by `fold` and leave a run's folded status unchanged. | `Data Model` § "additive … the fold skips unknown types" | SETTLED |
| C8 | The conditionality sources the design names (`Failure Path` / `Route:` / "Path X only" sections plus `resumeAt` / `resumeOnVerdict` on `WORKFLOW_STEPS`) classify every conditional step in all five workflows. | Step-hole rule (`Architecture` §1 bullet 3); success criterion 2 | DISPROVEN |
| C9 | The conditionality rule the review restates — a step is conditional iff its section's first body line is `**Run only if**`, or its heading carries a `(Path X only)` marker, and `**Skip if**` is never a step-level signal — classifies every conditional step. | The rule `design-update` will adopt from CRITICAL 1 | DISPROVEN |
| C10 | A generic column-0 marker rule (`**Run only if**` or `**Skip if**` anywhere at column 0 inside the step's section, or a `(Path X only)` heading marker) classifies every step-level conditional site across the five workflows with zero over-classification, and no conditional marker sits outside a step section. | The derivable alternative to C8 / C9; dissolves deferral `442`'s premise | SETTLED |
| C11 | The corpus's run logs are structurally compatible with positional attribution: file order equals `at` order and step rows never descend. | Positional attribution rule (`Decisions` § attribution) | SETTLED |
| C12 | Positional attribution buckets real journaled calls to the right step, including under group loops, repeated steps and rows landing after the run's terminator. | Positional attribution rule; review Unknown 2 | BLOCKED |
| C13 | The `completeness` row appended before `workflow-done` reflects the run's step set and is not superseded by later rows. | Close ordering (`Components / Flows` § close); the read-at-start path | DISPROVEN |
| C14 | An engine-written friction row survives `ledgers commit` into the run's commit and reaches the harvest's `.bkit/friction.jsonl` read. | Success criterion 3; review Unknown 5 | BLOCKED |
| C15 | The md-derived step universe (numbers + titles) equals the deduped `WORKFLOW_STEPS[workflow]` for all five workflows. | Contract deriver cross-check (`Architecture` §1) | SETTLED |

## Method

All probes are single files run with the repo's own `tsx` from the worktree root; each is one claim's smallest disproof attempt. No probe edits tracked source.

<!-- prettier-ignore -->
| # | Probe (in `…/spike/`) | What it does | Command |
| --- | --- | --- | --- |
| C1 | `probe-08-seam-coverage.ts` | Parses all six workflow mds, extracts every `"{BKIT}" <noun> <verb>` call, and replays `runCommand`'s routing predicate (`lib.ts` L325-327: bypass only when the verb is not one of the noun's verbs **and** the noun is also a classic verb) against `COMMANDS` and `CLASSIC_VERBS`. | `node_modules/.bin/tsx …/spike/probe-08-seam-coverage.ts` |
| C3 | `probe-07-resolve-cost.ts` | Implements the described scan (walk the cwd's toplevel for `docs/plans/*/logs/*/status.jsonl`, `readRuns` each, collect `IN_PROGRESS`), times it 200×, times the `git rev-parse --show-toplevel` spawn 200×, and runs the same scan from the main checkout. | `node_modules/.bin/tsx …/spike/probe-07-resolve-cost.ts` |
| C4 | `probe-06-repo-root.ts` | Calls `repoRoot(cwd)` and `statusLocation({…})` from inside the run's worktree and compares the two `.bkit/friction.jsonl` files by inode. | `node_modules/.bin/tsx …/spike/probe-06-repo-root.ts` |
| C5, C7 | `probe-05-friction-row.ts` | Runs six variants of the design's own example friction row through `validate` + `writerProblem` (design row verbatim; with envelope; no `scope`; `by.step: ""`; `by.step: "tests-run"`), and `fold`s a status row set carrying both new row types. | `node_modules/.bin/tsx …/spike/probe-05-friction-row.ts` |
| C6 | `probe-04-reader-stability.ts` | Takes the real corpus run in `650-workflows-prompt-alone` (63 rows), computes `stepsBlock`, inserts one `engine-call` row immediately before each of its 59 `step-done` rows, recomputes with `MARK_ROWS` unchanged and with the two types added, and runs the harvest's `splitRuns` over both. | `node_modules/.bin/tsx …/spike/probe-04-reader-stability.ts` |
| C8, C9, C10 | `probe-01-conditionality.ts` | Copies the `stepSections` idiom from `workflow-shape.test.ts`, classifies every step section by the design's sources and by the review's rule, flags misses and over-classifications, then enumerates every column-0 conditional marker with its owning section. | `node_modules/.bin/tsx …/spike/probe-01-conditionality.ts` |
| C11, C13 | `probe-03-attribution.ts` | Splits all four corpus `status.jsonl` files into runs on `workflow-started`, and per run reports file-order vs `at`-order violations, repeated step names, and step rows after the terminator. | `node_modules/.bin/tsx …/spike/probe-03-attribution.ts` |
| C15 | `probe-02-step-universe.ts` + the shipped drift test | Compares the derived step sections against deduped `WORKFLOW_STEPS`, and runs the existing test that pins the table to the headings. | `node_modules/.bin/tsx …/spike/probe-02-step-universe.ts`; `node_modules/.bin/vitest run .bkit/core/engine/audits/workflows/workflow-shape.test.ts` |

C2, C12 and C14 are `BLOCKED`: each needs the seam to exist inside tracked `commands/lib.ts` plus a live run in a scratch consumer, which is more than a single-file probe (see `## Unsettled`).

## Evidence

**C1 — SETTLED.** `probe-08.out`:

```
"{BKIT}" call sites: 358
distinct nouns used: 21 — branches, challenge, context, counters, decisions, fids, issues, ledgers, locks, prs, repo, roadmap, runs, runtime, skills, status, steps, tests, workflows, workstreams, worktrees
distinct noun+verb pairs: 79
registered nouns in COMMANDS: 24

call sites whose noun is also in CLASSIC_VERBS: 39
call sites that bypass runCommand (classic fallback or unrunnable): 0

unknown noun/verb call sites: 0

seam at runCommand covers every call site: true
```

39 call sites use the `status` noun, which **is** in `CLASSIC_VERBS` (`cli.ts` L41-55: `install, check, doctor, status, uninstall, upgrade, comply, stats, telemetry, tips, cursor, opencode, help`) — the review's list omits `status`. They still route through `runCommand` because each uses a registered `status` verb. `probe-08-shape-test.out`: `Test Files 1 passed (1) / Tests 228 passed (228)`, which includes the "engine calls" and "the step table matches the step headings and their `--step=` calls" cases.

**C3 — SETTLED.** `probe-07.out`:

```
IN_PROGRESS runs found from this toplevel: [{"file":"…/699-engine-run-completeness/docs/plans/202610/logs/699-engine-run-completeness/status.jsonl","workflow":"design"}]

scan (walk + fold every corpus log): 0.40 ms/call over 200 calls
git rev-parse --show-toplevel spawn  : 3.83 ms/call over 200 calls
resolve-or-skip total (git + scan)   : 4.23 ms/call

main checkout: /Users/christian/Documents/GitHub/bkit
IN_PROGRESS runs found from the main checkout: []

call sites: 357; carrying --file=: 169; needing the scan: 188
```

The scan from the main checkout finds no active run, so a command run outside the run's worktree is skipped rather than misattributed (Q12's requirement).

**C4 — DISPROVEN.** `probe-06.out`:

```
repoRoot(cwd)                 : /Users/christian/Documents/GitHub/bkit
worktree toplevel             : /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
statusLocation.bookRoot       : /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

repoRoot == worktree toplevel : false

main-checkout .bkit/friction.jsonl : /Users/christian/Documents/GitHub/bkit/.bkit/friction.jsonl  ino=373714637 size=0
worktree      .bkit/friction.jsonl : …/.worktrees/699-engine-run-completeness/.bkit/friction.jsonl  ino=375531166 size=0
same file (same inode)             : false
```

**C5 — DISPROVEN.** `probe-05.out`:

```
design example row, verbatim (no envelope)
  validate     : REFUSED — schema must be 3 (got: undefined)
envelope + design example row
  validate     : OK
  writerProblem: OK (admitted)
envelope + row, no scope
  validate     : OK
envelope + row, by.step = '' (the unknown-step case)
  validate     : REFUSED — by.step must be a non-empty string
envelope + row, by.step = 'tests-run' (noun-verb sentinel)
  validate     : OK
  writerProblem: OK (admitted)

KIND_WRITERS.friction.orchestrators = ["design","plan","build","debug","ship"]
```

`appendLedgerRows` (`commands/workflow/ledgers.ts` L1216-1219) re-runs `validate` then `writerProblem` and `throw refuse(...)` on either failure — so a refused row is a thrown `CommandError`, which the seam's swallow converts into "no friction row written".

**C6 — SETTLED.** `probe-04.out` (abridged to the decisive values; full per-step blocks in the `.out`):

```
BASELINE stepsBlock (no journal rows):
{"total":{"n":59,"totalMinutes":1208.1}, … "build-challenge-remediate":{"n":1,"totalMinutes":876.2}, …}

injected engine-call rows: 59

stepsBlock WITH journal rows, MARK_ROWS UNCHANGED (current 3 entries):
{"total":{"n":59,"totalMinutes":0.7}, … "build-challenge-remediate":{"n":1,"totalMinutes":0}, …}

stepsBlock WITH journal rows, MARK_ROWS EXTENDED with engine-call + completeness:
{"total":{"n":59,"totalMinutes":1208.1}, … "build-challenge-remediate":{"n":1,"totalMinutes":876.2}, …}

baseline == extended-MARK_ROWS output: true
baseline == unchanged-MARK_ROWS output: false

harvest splitRuns, last run:
  corpus : rows=61 afterEnd=2 last=2026-10-23T02:18:28Z (close-transport)
  journal: rows=116 afterEnd=6 last=2026-10-23T02:18:28Z (close-transport)
```

**C7 — SETTLED.** `probe-05.out`:

```
fold over rows with the two new types: [{"workflow":"build","startedAt":"2026-10-26T00:00:00Z","status":"DONE","steps":[]}]
```

**C8, C9 — DISPROVEN.** `probe-01.out` summary and the two misses:

```
  Step 11 Suggest Workstreams                col0-skip x1 *** MISS ***      | <!-- bkit:tracker true start -->
        missed marker: **Skip if** `ISSUE_ID` empty → Step 12.
        missed marker: **Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.
  Step  5 Install Skills                     col0-skip x1 *** MISS ***      | **Skip if** the session prompt or `DESCRIPTION` contains `[skills=false]`.

TOTAL rule-misses (step-level marker not classified conditional): 2
TOTAL over-classifications: 0
```

No step section is classified conditional by the design's named sources except ship Step 4, whose heading carries `(Path B only)` and whose first body line is also `**Run only if**`; the other 22 column-0 markers are invisible to it. The review's rule catches 20 of the 23 markers and misses both of design Step 11's (a `<!-- bkit:tracker true start -->` line precedes them) and build Step 5's.

**C10 — SETTLED.** `probe-01.out`, the marker census:

```
  design L 387 Step 7 Spike :: **Run only if** Step 6 `REVIEW_SPIKE` = true.
  design L 480 Step 11 Suggest Workstreams :: **Skip if** `ISSUE_ID` empty → Step 12.
  design L 481 Step 11 Suggest Workstreams :: **Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.
  design L 514 Step 12 Close Workflow :: **Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.
  plan   L 410 Step 8 Close Workflow :: **Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.
  build  L 424 Step 5 Install Skills :: **Skip if** the session prompt or `DESCRIPTION` contains `[skills=fals
  build  L 565 Step 8 Plan Gaps Remediate :: **Run only if** Step 7 sub-step 10 or the **Decision Pause** routed he
  build  L 748 Step 12 Failure Diagnose :: **Run only if** Step 11 tests FAIL.
  build  L 778 Step 13 Failure Remediate :: **Run only if** Step 11 tests FAIL.
  build  L 810 Step 14 Summary :: **Run only if** all Step 11 tests PASS.
  build  L 849 Step 15 Close Workflow & Create PR :: **Run only if** `SUMMARY_VERDICT` = PASS or CONCERNS.
  debug  L 352 Step 4 Fetch Context :: **Run only if** `TEST_VERDICT` = FAIL **or** `REPRO` = true.
  debug  L 415 Step 5 Failure Reproduce :: **Run only if** `TEST_VERDICT` = PASS **and** `REPRO` = true.
  debug  L 441 Step 6 Failure Diagnose :: **Run only if** `DEBUG_MODE` != SOAK.
  debug  L 475 Step 7 Failure Remediate :: **Run only if** `DEBUG_MODE` != SOAK.
  debug  L 503 Step 8 Failure Remediate Soak :: **Run only if** `DEBUG_MODE` = SOAK.
  debug  L 525 Step 9 Push Remediation :: **Run only if** `TEST_VERDICT` = PASS **and** Step 3 routed here.
  debug  L 550 Step 10 Summary :: **Run only if** `TEST_VERDICT` = PASS.
  debug  L 581 Step 11 Close Workflow :: **Run only if** `TEST_VERDICT` = PASS.
  ship   L 352 Step 4 Integrate (Path B only) :: **Run only if** `BASE_PATH` = B.
  ship   L 591 Step 11 Failure Diagnose :: **Run only if** `state` != MERGED.
  ship   L 628 Step 12 Failure Remediate :: **Run only if** `state` != MERGED.
  ship   L 665 Step 13 Update Local Dev :: **Run only if** `state` = MERGED.
TOTAL column-0 conditional markers: 23
```

Every one of the 23 is owned by a step section; none sits in a `Failure Path` / `Decision Pause` / `Group Loop` section. 21 are `**Run only if**`, 2 are `**Skip if**`. Classified by the column-0 rule, 23 of 23 sites are covered and 0 unconditional steps are over-classified.

**C11 — SETTLED.** `probe-03.out`:

```
  run  5 build  rows= 94 steps=9 repeatSteps=3 [build-task-red,build-plan-verify,build-plan-gaps-remediate] postDoneStepRows=21
  run  6 build  rows= 63 steps=21 repeatSteps=6 [build-task-red,build-plan-execute,build-plan-verify] postDoneStepRows=4

corpus files: 4
runs: 8
files with out-of-order 'at' in file order (merge=union interleave): 0/4
runs with a repeated step name (group loop / retry): 2/8
runs with step rows after workflow-done/failed: 2/8 (25 rows)
```

**C13 — DISPROVEN.** `probe-03.ts` run 6 in `650-workflows-prompt-alone`, rows 160-172, verbatim types/steps/`at`:

```
167 workflow-done  2026-10-23T01:49:07Z
168 step-done build-create-pr 2026-10-23T01:52:14Z DONE
169 step-done build-close-workflow 2026-10-23T01:56:31Z DONE
170 step-done build-close-workflow 2026-10-23T02:14:59Z DONE
171 step-done build-close-workflow 2026-10-23T02:18:28Z DONE
172 close-transport  2026-10-23T02:18:28Z
```

`workflow-done` is written by `workflows.ts` `closeWorkflow` (L1145), so the row the design appends the verdict before precedes two of that run's own final-step rows, and the run records three `build-close-workflow` rows — three closes.

**C15 — SETTLED.** `probe-02.out`:

```
design sections=12 tableEntries=12 dedup=12 numbers+titlesEqual=true …
plan   sections= 8 tableEntries= 8 dedup= 8 numbers+titlesEqual=true …
build  sections=15 tableEntries=19 dedup=15 numbers+titlesEqual=true …
debug  sections=11 tableEntries=12 dedup=11 numbers+titlesEqual=true …
ship   sections=14 tableEntries=16 dedup=14 numbers+titlesEqual=true …
all workflows: derived numbers+titles == deduped WORKFLOW_STEPS: true
```

Build's Steps 6-8 are `###` headings inside `## Group Loop — Steps 6-8`; the `stepSections` heading regex `^#{2,3} \S+ Step (\d+) — (.+)$` matches them, so the group loop is covered. `probe-02`'s additional reverse check (every `--step=` mention must sit in its own number's section) reports 15 hits; they are artifacts of a stricter rule than the shipped test's — e.g. design Step 2's block ends with `"{BKIT}" steps done --file="{STATUS}" --workflow=design --step=design-start-workflow …`, a legitimate cross-section call. The shipped forward-direction drift test is green (228 passed).

## Design Impact

- **C4 (friction write root).** Invalidates the design's unspecified `appendLedgerRows(root, …)` root as written: the only root helper its Reuse table names (`lib.ts statusLocation`, which itself starts from `repoRoot`) puts the row in the **main checkout**, a different file from the run's own `.bkit/friction.jsonl`, outside the run's commits and exposed to another `ledgers commit`. Evidence supports pinning the root to the run's `statusLocation.bookRoot` — the same root `statusLocation` resolves for the run's `status.jsonl`, and the root the workflow prose's own `bkit ledgers append` uses by default (`ledgers.ts` L161, `rootOf` = `ctx.cwd`; measured from the worktree it resolves to the worktree copy).
- **C5 (friction row shape).** Invalidates the friction-key row's silent degradation for step-less calls: with `by.step` absent or empty the row is refused by `validate`, thrown by `appendLedgerRows`, and swallowed by the seam — so success criterion 3 silently fails on exactly the calls (`ledgers append`, `branches land`, `repo …`, `status row`) the design expects to degrade. Evidence supports naming the `by.step` value for that case; the noun-verb sentinel (`tests-run`) is admitted. Also: the `Data Model` example row is refused as written (`schema must be 3`) because it is shown without the append-time envelope — cosmetic, since `appendLedgerRows` fills `repo`/`schema`/`ts`/`bkit` — and `.bkit/jsonl.md` L106 requires `scope`, which `validate` does not check (so its absence is a doc-contract gap, not a failure). The `KIND_WRITERS` claim holds: a row with `by.workflow: "build"` and no subagent is admitted.
- **C8 (the design's named conditionality sources).** Invalidates `Architecture` §1's sentence "a step's conditionality is read from the md structure (`Failure Path` / `Route:` / 'Path X only' sections) plus the `resumeAt` / `resumeOnVerdict` markers": only ship Step 4 is reachable that way, so a checker built to it would report a step hole for design Step 7, build Step 8, build Steps 12-15, all of debug Steps 4-11 and ship Steps 11-13 — the fatigue failure the design's own hole-class Decision row invokes to justify the split.
- **C9 (the review's restated rule).** Invalidates two clauses of CRITICAL 1: "the step section's first body line" (design Step 11's first body line is a `<!-- bkit:tracker true start -->` comment, so both of its markers are missed) and "`**Skip if**` … must not be read as one" (build Step 5's first body line is `**Skip if**` and it is a step-level skip). Evidence supports the C10 rule instead — "any column-0 `**Run only if**` / `**Skip if**` inside the step's section, or a `(Path X only)` heading marker" — which classifies all 23 sites with no over-classification. The authoring rule in `.bkit/authoring.md` and the per-workflow fixture should be written to that rule.
- **C13 (close ordering).** Invalidates `Components / Flows` § close's assumption that the run's step set is complete when `workflows close` runs: a real corpus run writes `workflow-done` before its own `build-create-pr` and `build-close-workflow` rows, and closes three times. Evidence supports (a) the read-at-start path preferring the **last** `completeness` row for a run, or recomputing when rows follow it; (b) the `completeness` row's "part of the run, not an after-end row" claim holding only for the first close — the harvest's `splitRuns` counts a later non-`close-workflow` row after the end row in `afterEnd` (measured 2 → 6 with injected journal rows), so a second `completeness` row appended after `workflow-done` would inflate `afterEnd` and `scan.rows`.

## Unsettled

- **C2 — the seam's fail-safe contract.** Needs the seam built inside tracked `commands/lib.ts` (a flag-gated hook) plus a forced journal throw, asserting exit-code passthrough and one stderr line. More than a single-file probe; the seam is the design's stated first thing to build. Risk carried: the seam sits on `runCommand`, the hot path of all 24 nouns in every consumer repo, so a bug escaping the swallow is a CLI-wide outage.
- **C12 — positional attribution end-to-end.** Needs `engine-call` rows produced by a real seam and a real run. What is measured is only the corpus's structural preconditions (C11) and the risk surface: 2/8 corpus runs repeat step names (`build-task-red` ×31 in one run) and 2/8 write step rows after the terminator, so a call journaled after `workflow-done` has no "step in progress" to belong to. Risk carried: mis-bucketing is silent — it changes which step a missing call is charged to, not whether the check runs.
- **C14 — friction end-to-end.** Needs a live run in a scratch consumer: engine writes the row → `ledgers commit` stages it into the run's commit → `pnpm harvest` reads `.bkit/friction.jsonl`. C4 shows the root must be pinned first or the row never enters the run's tree; C5 shows the row must carry a non-empty `by.step` or it is never written. Risk carried: without both fixes, success criterion 3 can pass its unit tests and record nothing in a real run.

## Verdict Reasoning

`FAIL`, not `CONCERNS`: five claims are `DISPROVEN` by captured output, and each invalidates a load-bearing statement in the design rather than a detail.

The design's step-hole rule (C8) is disproven — its named sources reach 1 of 23 conditional sites — and the review's replacement rule (C9) is disproven too, missing 2 of 23. Both were the design's answer to Unknown 1, and both would make the `holey` warning fire on nearly every run, which is the exact failure Acceptance Scenario criterion 2 exists to prevent. The good news is equally evidenced: the column-0 marker rule (C10) classifies all 23 sites with zero over-classification and no marker outside a step section, so the capability is real and the fix is one rule plus an authoring rule.

The friction write is disproven twice over: its root (C4) resolves to the main checkout from inside the run's worktree — a different inode from the run's own `.bkit/friction.jsonl` — and its row shape (C5) is refused outright for the calls the design expects to degrade, so the seam would swallow the refusal and write nothing. Close ordering (C13) is disproven by a real corpus run whose `workflow-done` precedes its own final-step rows and which closes three times.

Everything the design rests on that a single-file probe could reach holds: the seam's coverage (C1 — 358 call sites, 21 nouns, 0 bypasses), its hot-path cost (C3 — 4.23 ms/call, 188 of 357 call sites needing the scan), the `MARK_ROWS` reader surgery (C6 — total step minutes 1208.1 → 0.7 without it, byte-identical with it), the additive rows (C7), the corpus's `at`-ordering precondition (C11) and the drift-gated step universe (C15). No claim is `SETTLED` by weakened conditions: no dependency was stubbed, no service simulated, and the one injected row is an explicit stand-in for a row the seam will write, used only to test the reader's sensitivity.

Three claims stay `BLOCKED` (C2, C12, C14) because settling them needs the seam inside tracked source plus a live scratch-consumer run — build-phase work, not probe work. Had they been the only findings the verdict would be `CONCERNS`; the five disproofs set it to `FAIL`. All five are fixable inside the chosen approach with no scope change and no new artifact.
