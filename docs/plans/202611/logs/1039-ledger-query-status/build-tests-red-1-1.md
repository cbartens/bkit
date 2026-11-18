Enforced: true
Red: 3
Accepted: 0
Updated: 0
Gaps: 0

<!-- verdict:end -->

# Tests Red — group 1, attempt 1

Plan: `docs/plans/202611/1039-ledger-query-status-plan.md`

<!-- prettier-ignore -->
| Task | Test | State | Detail |
| --- | --- | --- | --- |
| 1 | `.bkit/core/engine/ledgers/telemetry.test.ts` "a friction, deferral or failure winner with no status matches the OPEN filter" | red | failure: expected [ 'f-new' ] to deeply equal [ 'd-old', 'f-new', 'f-old', 'x-old' ] |
| 1 | `.bkit/core/engine/ledgers/telemetry.test.ts` "defaultStatus gives OPEN for severity kinds, ACTIVE for decision and knowledge, none otherwise" | red | failure: defaultStatus is not a function |
| 1 | `.bkit/core/engine/commands/workflow/ledgers.test.ts` "query --status=OPEN returns a deferral winner that has no status, printed as stored" | red | failure: expected [] to deeply equal [ '701-old-deferral' ] |

## Gaps

None.

## Lint output — `.bkit/core/engine/ledgers/telemetry.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1039-ledger-query-status
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/ledgers/telemetry.test.ts

```

## Runner output — `.bkit/core/engine/ledgers/telemetry.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1039-ledger-query-status
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/ledgers/telemetry.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1039-ledger-query-status

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ❯ .bkit/core/engine/ledgers/telemetry.test.ts (303 tests | 2 failed) 633ms
   ✓ test-run status row validation (2)
     ✓ accepts bounded CI evidence rows while preserving local exit validation 4ms
     ✓ accepts a counted CI evidence round and refuses 0 1ms
   ✓ identity — per-kind composite tuples (7)
     ✓ compliance: keyed by (repo, by.workflow, run.parentSha, rule.id) 0ms
     ✓ outcome: keyed by (repo, by.workflow, run.parentSha) — run.pr fallback when no parentSha 0ms
     ✓ counter: keyed by (repo, by.workflow, run.parentSha, counter.name) 0ms
     ✓ friction: keyed by (kind, repo, key) 0ms
     ✓ deferral: keyed by (kind, repo, key) 0ms
     ✓ failure: keyed by (kind, repo, key) 0ms
     ✓ composite tuple is DISTINCT from bare ts — same ts, different key → different identity 1ms
   ✓ severity — per-kind requirement + closed enum (61)
     ✓ friction carries severity 0ms
     ✓ deferral carries severity 0ms
     ✓ failure carries severity 0ms
     ✓ compliance does NOT carry severity 0ms
     ✓ outcome does NOT carry severity 0ms
     ✓ counter does NOT carry severity 0ms
     ✓ knowledge does NOT carry severity 0ms
     ✓ decision does NOT carry severity 0ms
     ✓ VALID_SEVERITIES is exactly CRITICAL|HIGH|MEDIUM|LOW 0ms
     ✓ accepts severity CRITICAL 1ms
     ✓ accepts severity HIGH 0ms
     ✓ accepts severity MEDIUM 0ms
     ✓ accepts severity LOW 0ms
     ✓ rejects a friction row with severity missing 0ms
     ✓ rejects a deferral row with severity missing 0ms
     ✓ rejects a failure row with severity missing 0ms
     ✓ rejects off-enum severity "low" 0ms
     ✓ rejects off-enum severity "normal" 0ms
     ✓ rejects off-enum severity "critical" 0ms
     ✓ rejects off-enum severity "blocker" 0ms
     ✓ rejects off-enum severity "advisory" 0ms
     ✓ rejects off-enum severity "Critical" 0ms
     ✓ rejects off-enum severity "" 0ms
     ✓ rejects severity on a kind that must not carry it 0ms
     ✓ accepts triage status "OPEN" on the severity kinds 0ms
     ✓ accepts triage status "TRIAGED" on the severity kinds 0ms
     ✓ accepts triage status "CLOSED" on the severity kinds 0ms
     ✓ rejects off-ladder status "WORKED_AROUND" on a severity kind 0ms
     ✓ rejects off-ladder status "Resolving" on a severity kind 0ms
     ✓ rejects off-ladder status "resolved" on a severity kind 0ms
     ✓ rejects off-ladder status "open" on a severity kind 0ms
     ✓ rejects off-ladder status "ACTIVE" on a severity kind 0ms
     ✓ rejects off-ladder status "" on a severity kind 0ms
     ✓ accepts decision status "ACTIVE" 0ms
     ✓ accepts decision status "SUPERSEDED" 0ms
     ✓ rejects triage status "OPEN" on a decision 0ms
     ✓ rejects triage status "CLOSED" on a decision 0ms
     ✓ rejects triage status "TRIAGED" on a decision 0ms
     ✓ accepts knowledge status "ACTIVE" 0ms
     ✓ accepts knowledge status "SUPERSEDED" 0ms
     ✓ accepts a knowledge row with status absent 0ms
     ✓ rejects triage status "OPEN" on knowledge 0ms
     ✓ rejects triage status "CLOSED" on knowledge 0ms
     ✓ rejects triage status "TRIAGED" on knowledge 0ms
     ✓ rejects status on a kind that must not carry it 0ms
     ✓ DEFERRAL_REASONS is exactly the four justifications, low-severity and the adjudicator verdict 0ms
     ✓ accepts deferral reason "scope-declared" 0ms
     ✓ accepts deferral reason "hard-blocked" 0ms
     ✓ accepts deferral reason "needs-decision" 0ms
     ✓ accepts deferral reason "own-cycle" 0ms
     ✓ accepts deferral reason "low-severity" 0ms
     ✓ accepts deferral reason "unjustified" 0ms
     ✓ rejects a deferral row with reason missing 0ms
     ✓ rejects off-enum deferral reason "blocked" 0ms
     ✓ rejects off-enum deferral reason "out of scope" 0ms
     ✓ rejects off-enum deferral reason "no time" 0ms
     ✓ rejects off-enum deferral reason "SCOPE-DECLARED" 0ms
     ✓ rejects off-enum deferral reason "" 0ms
     ✓ rejects reason on a kind that must not carry it 0ms
     ✓ parse still reads legacy free-text status rows 1ms
     ✓ parse still reads pre-severity rows 0ms
   ✓ updating a row — supersede by same-key append (4)
     ✓ a later same-key row wins the fold; the earlier one stays as history 1ms
     ✓ fold is last-wins by ts, not by file order 1ms
     ✓ fold orders ISO-string and missing ts deterministically, whatever the file order 1ms
     ✓ a reworded key forks the entry instead of updating it 0ms
   ✓ triage ladder — OPEN -> TRIAGED -> CLOSED (3)
     ✓ TRIAGE_STATUSES is exactly OPEN|TRIAGED|CLOSED 0ms
     ✓ the triaged kinds are exactly the severity-carrying kinds 0ms
     ✓ a triage sweep appends TRIAGED, and the entry stays open 0ms
   ✓ feature kind — .bkit/issues.jsonl (#380) (13)
     ✓ is a valid kind, keyed by (kind, repo, key) 0ms
     ✓ FEATURE_STATUSES is exactly the six-value phase ladder 0ms
     ✓ accepts status DESIGNED 0ms
     ✓ accepts status PLANNED 0ms
     ✓ accepts status BUILT 0ms
     ✓ accepts status DEBUGGED 0ms
     ✓ accepts status SHIPPED 0ms
     ✓ accepts status ABANDONED 1ms
     ✓ rejects a missing status — the roadmap has no phase to project without it 0ms
     ✓ rejects an off-ladder status 0ms
     ✓ does not carry severity — feature is not in SEVERITY_KINDS 0ms
     ✓ requires key, category, and description 0ms
     ✓ a same-key append folds last-wins to the latest phase 0ms
   ✓ chat kind — .bkit/stats.jsonl chat rows (5)
     ✓ is a valid kind keyed by kind + repo + key 1ms
     ✓ rejects a row without the join keys readers depend on 0ms
     ✓ carries no severity or status 0ms
     ✓ a resumed chat's new row folds over the first one 0ms
     ✓ leaves a workflow's telemetry report unchanged 2ms
   ✓ run kind — .bkit/stats.jsonl run rows (6)
     ✓ is a valid kind keyed by kind + repo + key 0ms
     ✓ rejects a row without the join keys readers depend on 0ms
     ✓ takes only the five endings 0ms
     ✓ carries no severity or status 0ms
     ✓ a grown run log's new row folds over the first one 0ms
     ✓ leaves the telemetry report of the same workflow unchanged 0ms
   ✓ jsonl.md examples — validated against the codec (6)
     ✓ every full example row is a valid event 9ms
     ✓ every example field is a Generic Field or listed in its kind's Per-Kind Fields row 4ms
     ✓ every kind has a worked example 3ms
     ✓ no example puts an agent name in by.step 2ms
     ✓ by.model appears exactly where by.subagent does — never on an orchestrator row 4ms
     ✓ the triaged kinds' examples carry severity and references 7ms
   ✓ repo slug — one resolver, from the git remote (13)
     ✓ parses "https://github.com/owner/repo.git" -> "owner/repo" 0ms
     ✓ parses "https://github.com/owner/repo" -> "owner/repo" 0ms
     ✓ parses "git@github.com:owner/repo.git" -> "owner/repo" 0ms
     ✓ parses "ssh://git@github.com/owner/repo.git" -> "owner/repo" 0ms
     ✓ parses "  https://github.com/owner/repo.git\n" -> "owner/repo" 0ms
     ✓ returns empty rather than guessing for "" 0ms
     ✓ returns empty rather than guessing for "not-a-url" 0ms
     ✓ returns empty rather than guessing for "https://github.com/" 0ms
     ✓ returns empty rather than guessing for "reponame" 0ms
     ✓ a scoped npm package name must NEVER become the slug 0ms
     ✓ resolves the slug from a repo's origin remote 76ms
     ✓ returns empty for a git repo with no origin remote 48ms
     ✓ returns empty for a directory that is not a git repo 16ms
   ✓ resolveGitSha — parentSha must be a real SHA before it reaches a row (7)
     ✓ resolves a rev to a hex SHA the grader's guard accepts 19ms
     ✓ never returns the rev it was given 17ms
     ✓ gives DIFFERENT SHAs for different revs — so identity cannot collapse runs 34ms
     ✓ returns empty for unresolvable "no-such-rev" 18ms
     ✓ returns empty for unresolvable "HEAD~99999" 17ms
     ✓ returns empty for unresolvable "" 18ms
     ✓ returns empty outside a git repo rather than throwing 21ms
   ✓ workflowTelemetry — ledger-health readout (no workflow) (5)
     ✓ names the unknown-version bucket instead of leaving it empty 2ms
     ✓ reports 0 malformed as a single 0 when nothing is malformed 1ms
     ✓ counts malformed lines by parsing, not by regex 1ms
     ✓ counts per-workflow ENTITIES, so an updated row is not counted twice 1ms
     ✓ omits the chain line when no workflow is given 1ms
   ✓ validate — A2-mandatory envelope fields (19)
     ✓ accepts a valid compliance event 0ms
     ✓ accepts a valid outcome event 0ms
     ✓ accepts an outcome event with valid per-tier ship.coverage 0ms
     ✓ rejects an outcome event with non-object ship.coverage 0ms
     ✓ rejects an outcome event with a non-numeric coverage metric 0ms
     ✓ accepts a valid counter event 0ms
     ✓ accepts a valid friction event 0ms
     ✓ accepts a valid deferral event 0ms
     ✓ accepts a valid failure event 0ms
     ✓ rejects event missing mandatory field: ts 0ms
     ✓ rejects event missing mandatory field: kind 0ms
     ✓ rejects event missing mandatory field: repo 0ms
     ✓ rejects event missing mandatory field: bkit 0ms
     ✓ rejects event missing mandatory field: by 0ms
     ✓ rejects event missing by.step 0ms
     ✓ rejects event missing bkit.version 0ms
     ✓ rejects unknown kind 0ms
     ✓ rejects non-object input 0ms
     ✓ rejects counter with invalid counter.source 0ms
   ✓ fold — composite-identity dedup (6)
     ✓ folds same-key compliance rows to latest (higher ts) 0ms
     ✓ two same-ts same-key rows (merge=union duplicate) fold to ONE via composite identity 0ms
     ✓ two same-ts DIFFERENT-key rows (same ts, different rule) → TWO entries 0ms
     ✓ folds outcome rows by (repo, run.pr) 0ms
     ✓ folds friction rows by (kind, repo, key) 0ms
     ✓ empty events → empty state 0ms
   ✓ lineage — firstTs / updates on keyed rows (14)
     ✓ AGED_KINDS names the five keyed ledger kinds 0ms
     ✓ validate accepts firstTs <= ts and a positive-integer updates on every aged kind 0ms
     ✓ validate rejects a firstTs later than ts, or not a number 0ms
     ✓ validate rejects updates that is zero, negative or fractional 0ms
     ✓ validate rejects firstTs / updates on kinds outside AGED_KINDS 0ms
     ✓ lineage counts rows and takes the earliest ts 1ms
     ✓ lineage continues a stamped row's count and keeps its firstTs 1ms
     ✓ lineage counts same-ts rows once, keeping the larger stamped count 1ms
     ✓ lineage leaves firstTs out when no row carries a numeric ts 0ms
     ✓ placeLineage puts firstTs + updates right after ts, replacing stale values 0ms
     ✓ withLineage stamps a first row firstTs = ts, updates = 1 1ms
     ✓ withLineage carries forward from same-identity prior rows only 0ms
     ✓ withLineage replaces caller-supplied firstTs / updates 0ms
     ✓ withLineage passes keyless and non-aged rows through untouched 0ms
   ✓ parse — tolerant reader (8)
     ✓ parses valid NDJSON lines 0ms
     ✓ skips blank lines, does NOT count them as malformed 0ms
     ✓ counts a malformed (truncated trailing) line via malformedLineCount, does NOT throw 0ms
     ✓ counts a malformed line in the MIDDLE of the file, does NOT throw 1ms
     ✓ parses empty string → zero events, zero malformed 0ms
     ✓ NEVER throws on any input (fuzz) 1ms
     ✓ keeps ALL well-formed rows regardless of bkitVersion (no version gating) 0ms
     ✓ parse keeps an old row with subPlans 1ms
   ✓ outcome — shape and inline-jq parity (7)
     ✓ close-gate-shaped outcome validates successfully 0ms
     ✓ validate refuses plan.source brief on write 1ms
     ✓ accepts held in outcome and run endings 0ms
     ✓ keeps publish false on the outcome row 1ms
     ✓ rejects a non-boolean publish 0ms
     ✓ folds outcome by (repo, run.pr) 0ms
     ✓ inline-jq parity: jq-shaped row parses identically under parse() 1ms
   ✓ appendLine (1)
     ✓ serializes event to JSON string parseable back to same shape 0ms
   ✓ constants (1)
     ✓ MAX_ROWS_BEFORE_ROLLUP is a concrete number (not TODO) 0ms
   ✓ foldFrom — several ledger files (5)
     ✓ reads hot file and returns rowCount 2ms
     ✓ folds two files together 1ms
     ✓ missing paths are silently skipped 1ms
     ✓ emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP 44ms
     ✓ surfaces malformedLineCount from hot file 2ms
   ✓ workflowTelemetry — per-workflow summary signals (2)
     ✓ produces lines with rowCount, malformed, and per-version counts 1ms
     ✓ emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded 36ms
   ✓ workflowTelemetry — this-run vs med·5 baseline (7)
     ✓ shows THIS run's values against med·5 of the previous same-workflow runs 3ms
     ✓ workflowTelemetry splits the baseline on converted 2ms
     ✓ shows an ending row for a held close 2ms
     ✓ prints — for the baseline until at least 3 prior runs exist 2ms
     ✓ omits absent conditional metrics but shows ledgers.friction.added even at 0 2ms
     ✓ adds a this-run compliance line matched by run.parentSha 1ms
     ✓ adds the run's *_ATTEMPT counter matched by run.parentSha 2ms
   ✓ humanizeDuration (5)
     ✓ formats 45 seconds as 45s 0ms
     ✓ formats 480 seconds as 8m 0ms
     ✓ formats 1980 seconds as 33m 0ms
     ✓ formats 3600 seconds as 1h 0ms
     ✓ formats 7860 seconds as 2h11m 0ms
   ✓ telemetry-invariant (7)
     ✓ WS3-T4: bkit-telemetry-invariant — counters.verifyAttempt == count of plan-verify rows (7)
       ✓ invariant passes when verifyAttempt count matches plan-verify step count (1 attempt) 1ms
       ✓ invariant passes when verifyAttempt count matches plan-verify step count (3 attempts) 0ms
       ✓ fold deduplicates verifyAttempt counter by (repo, by.workflow, run.parentSha, counter.name) identity 0ms
       ✓ non-verifyAttempt counter rows do not count toward the invariant 0ms
       ✓ malformed JSONL lines are tolerated; invariant still passes over valid rows 0ms
       ✓ verifyAttempt counter.source must be shell-bus post-WS3 (structural trust tier) 0ms
       ✓ invariant holds with empty log (zero attempts == zero verify steps) 0ms
   ✓ mintTs (2)
     ✓ moves a whole-second clock reading 1 ms on 3ms
     ✓ follows `after` when the clock has not passed it, never landing on a whole second 1ms
   ✓ writerProblem (15)
     ✓ admits a listed subagent and the listed orchestrator 0ms
     ✓ admits a direct chat (utility) on decision rows 0ms
     ✓ admits a direct chat (utility) on deferral rows 0ms
     ✓ admits a direct chat (utility) on knowledge rows 0ms
     ✓ accepts a knowledge row written by bkit-build-plan-tests 0ms
     ✓ admits any agent on knowledge rows, as a discovered gotcha 0ms
     ✓ admits a direct chat (utility) on friction rows 0ms
     ✓ admits a direct chat (utility) on compliance rows 0ms
     ✓ admits a direct chat (utility) on counter rows 0ms
     ✓ admits a direct chat (utility) on outcome rows 0ms
     ✓ refuses an unlisted subagent or orchestrator 0ms
     ✓ admits the auto orchestrator on friction rows 0ms
     ✓ holds model to subagent rows 0ms
     ✓ admits any author on an any-agent kind 0ms
     ✓ admits each closing workflow on the stats kinds, and refuses audit and any subagent 0ms
   ✓ writer sets in telemetry.ts match the jsonl.md table (9)
     ✓ every kind appears in exactly one ledger 0ms
     ✓ decisions / decision: the doc row names docs/decisions.jsonl and the same writers 1ms
     ✓ deferrals / deferral: the doc row names docs/deferrals.jsonl and the same writers 1ms
     ✓ failures / failure: the doc row names docs/failures.jsonl and the same writers 1ms
     ✓ knowledge / knowledge: the doc row names docs/knowledge.jsonl and the same writers 1ms
     ✓ friction / friction: the doc row names .bkit/friction.jsonl and the same writers 1ms
     ✓ stats / compliance: the doc row names .bkit/stats.jsonl, a close-step writer and no subagent 1ms
     ✓ stats / counter: the doc row names .bkit/stats.jsonl, a close-step writer and no subagent 1ms
     ✓ stats / outcome: the doc row names .bkit/stats.jsonl, a close-step writer and no subagent 0ms
   ✓ normalize — schema-1 rows to schema 2 (13)
     ✓ compliance: rule / result / evidence / parentSha move into run and rule; phase is dropped 1ms
     ✓ counter: counterName / Value / Source and parentSha move into counter and run 1ms
     ✓ outcome: run fields move into their blocks; the fields with no place are dropped 1ms
     ✓ chat: every schema-1 field lands in its block, and the totals hold 2ms
     ✓ run: every schema-1 field lands in its block, and the totals hold 1ms
     ✓ a keyed kind (deferral) moves its top fields into bkit / by and keeps its payload 0ms
     ✓ a row carrying schema passes through unchanged 0ms
     ✓ bkitVersion "none" becomes bkit.version null 0ms
     ✓ a non-object reads as an empty row 0ms
     ✓ phase is dropped, outcome redTests moves into build, any kind's parentSha into run 0ms
     ✓ chat: an opencode row's bash categories land on its lowercase bash tool 0ms
     ✓ chat: usage.total.tokens is the sum of its models, as a fresh scan writes it 1ms
     ✓ null or empty workflow / subagent / model are left out of by 0ms
   ✓ fold — schema-1 and schema-2 rows of one identity (1)
     ✓ fold the two into one entry; the newer ts wins whichever shape it has 0ms
   ✓ totals — validate refuses a total that does not match its parts (22)
     ✓ lines.total.added = code + tests + docs 1ms
     ✓ lines.total.deleted = code + tests + docs 0ms
     ✓ lines.total.files = code + tests + docs 0ms
     ✓ lines.total.changed = added + deleted 0ms
     ✓ time.totalMinutes = end - start, within 0.1 0ms
     ✓ chat time.activeMinutes = the sum of time.spans 0ms
     ✓ usage.*.tokens.read = input + cacheWrite + cacheRead 0ms
     ✓ usage.total.turns / tokens = the sum of usage.byModel 0ms
     ✓ usage.total.compactions = usage.main + every agent's usage 0ms
     ✓ usage.total.context.peak = the max of usage.main and every agent instance 0ms
     ✓ agents.total.n = the sum of byAgent 0ms
     ✓ agents.total.errors = the sum of byAgent 0ms
     ✓ agents.byAgent.*.n = the length of its instances 0ms
     ✓ tools.total.calls = the sum of byTool 0ms
     ✓ tools.total.errors = the sum of byTool 0ms
     ✓ bkit.cli.total = the sum of byVerb 0ms
     ✓ steps.total.n = the sum of byStep 0ms
     ✓ steps.total.totalMinutes = the sum of byStep, within 0.1 per part 0ms
     ✓ steps.total.activeMinutes = the sum of byStep, within 0.1 per part 0ms
     ✓ totalsProblem sums groups 0ms
     ✓ build.redTests = steps.byStep["build-tests-red"].n 0ms
     ✓ build.challenge.findings.total = the sum of the four severities 0ms
   ✓ validate — schema-2 top section (18)
     ✓ refuses a row without schema: 3 0ms
     ✓ refuses a top-level bkitVersion 0ms
     ✓ refuses a top-level workflow 0ms
     ✓ refuses a top-level step 0ms
     ✓ refuses a top-level subagent 0ms
     ✓ refuses a top-level model 0ms
     ✓ refuses by.model without by.subagent 0ms
     ✓ accepts an outcome with time: null 0ms
     ✓ accepts bkit.version null on chat and run rows 0ms
     ✓ refuses bkit.version null on a compliance row 0ms
     ✓ refuses bkit.version null on a counter row 0ms
     ✓ refuses bkit.version null on a outcome row 0ms
     ✓ refuses bkit.version null on a friction row 0ms
     ✓ refuses bkit.version null on a deferral row 0ms
     ✓ refuses bkit.version null on a failure row 0ms
     ✓ refuses bkit.version null on a knowledge row 0ms
     ✓ refuses bkit.version null on a decision row 0ms
     ✓ refuses bkit.version null on a feature row 0ms
   ✓ verified model attribution (1)
     ✓ accepts verified unavailable model without confusing configured and observed models 0ms
   ✓ queryLedger — canonical winners before filtering (1)
     ✓ folds numeric timestamps and equal timestamp ties before filtering 2ms
   ❯ queryLedger — status default for rows with no status (2)
     × a friction, deferral or failure winner with no status matches the OPEN filter 14ms
     × defaultStatus gives OPEN for severity kinds, ACTIVE for decision and knowledge, none otherwise 1ms
   ✓ provenance compatibility through the ledger read paths (5)
     ✓ keeps a old row with no provenance row intact through validate, normalize, fold and compact 1ms
     ✓ keeps a observed model row intact through validate, normalize, fold and compact 0ms
     ✓ keeps a unavailable model row intact through validate, normalize, fold and compact 2ms
     ✓ keeps a unknown optional field row intact through validate, normalize, fold and compact 0ms
     ✓ diagnoses a row with no timestamp or no key instead of reading it as clean 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/ledgers/telemetry.test.ts > queryLedger — status default for rows with no status > a friction, deferral or failure winner with no status matches the OPEN filter
AssertionError: expected [ 'f-new' ] to deeply equal [ 'd-old', 'f-new', 'f-old', 'x-old' ]

- Expected
+ Received

  [
-   "d-old",
    "f-new",
-   "f-old",
-   "x-old",
  ]

 ❯ .bkit/core/engine/ledgers/telemetry.test.ts:3126:48
    3124|     ].join("\n");
    3125|     const open = queryLedger(raw, { status: "OPEN" });
    3126|     expect(open.rows.map((r) => r.key).sort()).toEqual(["d-old", "f-ne…
       |                                                ^
    3127|     // Stored as written: the read adds no status.
    3128|     expect(open.rows.find((r) => r.key === "f-old")).not.toHavePropert…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/2]⎯

 FAIL  .bkit/core/engine/ledgers/telemetry.test.ts > queryLedger — status default for rows with no status > defaultStatus gives OPEN for severity kinds, ACTIVE for decision and knowledge, none otherwise
TypeError: defaultStatus is not a function
 ❯ .bkit/core/engine/ledgers/telemetry.test.ts:3134:12
    3132|
    3133|   it("defaultStatus gives OPEN for severity kinds, ACTIVE for decision…
    3134|     expect(defaultStatus("friction")).toBe("OPEN");
       |            ^
    3135|     expect(defaultStatus("deferral")).toBe("OPEN");
    3136|     expect(defaultStatus("failure")).toBe("OPEN");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/2]⎯


 Test Files  1 failed (1)
      Tests  2 failed | 301 passed (303)
   Start at  14:23:16
   Duration  1.02s (tests 79%, setup 9%, import 7%, transform 4%, worker 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-zFdZQo/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```

## Lint output — `.bkit/core/engine/commands/workflow/ledgers.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:lint:file /Users/christian/Documents/GitHub/bkit/.worktrees/1039-ledger-query-status
> oxlint -c .oxlintrc.json --type-aware --tsconfig tsconfig.test.json --deny-warnings --no-error-on-unmatched-pattern .bkit/core/engine/commands/workflow/ledgers.test.ts

```

## Runner output — `.bkit/core/engine/commands/workflow/ledgers.test.ts`

```

> @cbartens/bkit@6.2.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/1039-ledger-query-status
> node scripts/ci/bkit-test-awake.mjs node scripts/ci/bkit-test-file.mjs .bkit/core/engine/commands/workflow/ledgers.test.ts


 RUN  v5.1.0 /Users/christian/Documents/GitHub/bkit/.worktrees/1039-ledger-query-status

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts (121 tests | 1 failed) 17644ms
   ✓ bkit ledgers commit (tests/book-commit.bats) (25)
     ✓ modified ledger under the FID logdir is staged and committed 377ms
     ✓ tracked-but-deleted skill mirror is staged as a deletion (scope=full) 320ms
     ✓ brand-new untracked ledger is staged and committed 310ms
     ✓ unmatched plan-logs glob does not abort the sweep of other ledgers 312ms
     ✓ path containing a space is staged and committed 270ms
     ✓ nothing changed: exit 0, 'nothing to commit', no new commit 227ms
     ✓ staging failure: exit 4 and no commit is created, no false success 163ms
     ✓ a leftover *.bkit-lock in a run's log folder is not staged by the bookkeeping commit 229ms
     ✓ empty pathspec list: exit 6, and an unrelated staged file is not swept into a commit 164ms
     ✓ empty pathspec list under commit-allow-empty also exits 6, no commit created 134ms
     ✓ --mode=stage stages the sweep but creates no commit 166ms
     ✓ top-level docs/*.md and the repo's ciSkipPaths are committed under scope=pr, not under scope=core or scope=full 505ms
     ✓ scope=pr reaches bkit.testing.ciSkipPaths from package.json, and nothing else outside the list 252ms
     ✓ scope=pr does not reach nested docs (another FID's plan, docs/templates/**) 243ms
     ✓ scope=pr refuses to commit on main (exit 12) with nothing committed 132ms
     ✓ scope=pr refuses to commit on dev (exit 12) with nothing committed 141ms
     ✓ scope=pr refuses to commit on a detached HEAD (exit 12) with nothing committed 131ms
     ✓ usage error ["--scope=wide","--mode=commit","--message=m"] exits 2 42ms
     ✓ usage error ["--scope=core","--mode=push","--message=m"] exits 2 39ms
     ✓ usage error ["--scope=core","--mode=commit"] exits 2 37ms
     ✓ root that is not a directory or not a repo exits 3 10ms
     ✓ --root defaults to the working directory 135ms
     ✓ --stage-tracked-updates also stages tracked non-bookkeeping changes, never untracked ones 228ms
     ✓ --stage-tracked-updates with --mode=commit commits the tracked changes with the bookkeeping 226ms
     ✓ --stage-tracked-updates with --mode=commit commits a tracked change even when no bookkeeping changed 209ms
   ✓ bkit ledgers commit --path (5)
     ✓ commits the named path alone, leaving every other change in the tree 205ms
     ✓ an unchanged path is nothing-to-commit under --mode=commit 135ms
     ✓ refuses --path with --mode=stage or --stage-tracked-updates 85ms
     ✓ a path outside the checkout exits 6 with nothing committed 108ms
     ✓ refuses a --path git ignores, naming the guard instead of leaking git's message 163ms
   ✓ commitOwnSet (1)
     ✓ refuses a gitignored path in the set instead of letting git fail opaquely 92ms
   ✓ bkit ledgers commit — a run in place on dev that shares its checkout (6)
     ✓ stageTrackedUpdates skips recorded paths 364ms
     ✓ --path records its commit on the run's record, like every other commit mode 397ms
     ✓ a recorded ledger commits only the rows the run appended 607ms
     ✓ a ledger the user staged before the run keeps their rows in the index after the run's commit 635ms
     ✓ a recorded ledger under an eol attribute still commits only the run's rows 488ms
     ✓ commitBookkeeping refuses when a recorded path changed 282ms
   ✓ --squash-of (tests/book-commit.bats, #493) (3)
     ✓ commits the squashed paths (deletion included) and bookkeeping, not another staged file 341ms
     ✓ under --mode=commit counts the squashed paths as something to commit 392ms
     ✓ stage mode exits 2; an unknown ref exits 3 with no commit 210ms
   ✓ --only-if-dirty-tracked (build / design / plan Step 2) (3)
     ✓ does nothing when only untracked files are present 144ms
     ✓ commits the bookkeeping, and only the bookkeeping, when a tracked file is dirty 205ms
     ✓ a dirty tree with no bookkeeping at all is nothing to commit, not exit 6 146ms
   ✓ bkit ledgers union (union-ledgers) (6)
     ✓ merges rows append-only without duplicating existing ones 113ms
     ✓ an unmatched glob in src does not abort; exits 0 with nothing unioned 108ms
     ✓ never carries .bkit/issues.jsonl (a pre-merge SHIPPED row must not reach dev) 108ms
     ✓ carries untracked ledgers too 107ms
     ✓ keeps rows on separate lines when the destination has no final newline 119ms
     ✓ src that is not a git repo exits 3 12ms
   ✓ bkit ledgers only-bookkeeping (6)
     ✓ docs, FID logs, ledgers and skill removals only: exit 0 220ms
     ✓ a bkit.testing.ciSkipPaths file counts as bookkeeping; without the setting it does not 314ms
     ✓ a source file in the range: exit 7, path listed 217ms
     ✓ another FID's plan file in the range: exit 7 226ms
     ✓ from not an ancestor of to: exit 7 216ms
     ✓ unknown commit exits 3; a missing flag exits 2 121ms
   ✓ bookPathspecs (2)
     ✓ grows core -> full -> pr 0ms
     ✓ appends the repo's extra bookkeeping paths as :(glob) pathspecs under pr only 0ms
   ✓ bookPathspecs — frozen bookkeeping allow-list (1)
     ✓ scope=pr reaches every frozen entry, the FID log dir, and the docs/*.jsonl ledger glob 0ms
   ✓ bkit ledgers append (24)
     ✓ append mints ts and fills the top section: schema, repo and bkit.version 67ms
     ✓ append keeps a row's own repo 67ms
     ✓ append refuses a supplied ts 53ms
     ✓ append refuses a supplied schema or bkit 76ms
     ✓ append refuses a flat top-level field the top section moved into by 69ms
     ✓ append writes nothing when one row is invalid 64ms
     ✓ append refuses a row whose kind is not the ledger's 54ms
     ✓ append --ledger=stats takes compliance, counter and outcome rows 63ms
     ✓ append --ledger=stats refuses another kind, a non-closing writer, and a total that does not match its parts 88ms
     ✓ append bumps a round-second mint 65ms
     ✓ append refuses an empty rows file 43ms
     ✓ append refuses an unknown or issues ledger 40ms
     ✓ append refuses a writer not listed for the kind 123ms
     ✓ append starts a new line when the ledger lacks its final newline 62ms
     ✓ append creates the ledger and its directory 69ms
     ✓ append stamps a keyed row's first write firstTs = ts, updates = 1 65ms
     ✓ append carries firstTs forward and counts updates, across calls and within one batch 90ms
     ✓ append replaces a supplied firstTs / updates with the computed values 67ms
     ✓ append continues the count from a compacted winner 68ms
     ✓ append leaves rows outside the five keyed-ledger kinds without firstTs / updates 63ms
     ✓ append writes status OPEN on a friction row given none 65ms
     ✓ append writes status OPEN on a deferral row given none 67ms
     ✓ append writes status OPEN on a failure row given none 69ms
     ✓ append keeps a given status next to a defaulted one 65ms
   ✓ bkit ledgers compact (5)
     ✓ compacts every keyed ledger by default and reports per-ledger counts 54ms
     ✓ --ledger narrows the run to one ledger 12ms
     ✓ --dry-run counts without writing 10ms
     ✓ a second run changes nothing 21ms
     ✓ refuses an unknown --ledger with a usage error 1ms
   ✓ bkit ledgers check (4)
     ✓ passes when every key on the Ledger rows line has a decision or deferral row 1ms
     ✓ names the keys no row carries and exits EXIT_ROWS_MISSING 1ms
     ✓ passes on None 1ms
     ✓ refuses a plan with no Ledger rows line or an unfilled one 1ms
   ✓ bkit ledgers triage (11)
     ✓ triage keeps a low-severity deferral exempt 93ms
     ✓ triage keeps an own-cycle deferral exempt 97ms
     ✓ triage marks an unjustified deferral lazy 127ms
     ✓ triage writes an unjustified row with a minted ts 113ms
     ✓ triage writes no row for a closed deferral 100ms
     ✓ triage reports an adjudicated unjustified row outside exempt 93ms
     ✓ triage ignores another feature's deferral rows 126ms
     ✓ triage writes nothing when the FID has no deferral row 93ms
     ✓ triage refuses a plan with no task blocks 134ms
     ✓ triage refuses a plan whose task blocks do not parse 134ms
     ✓ triage marks a scope-declared row whose only declaration is itself lazy 117ms
   ✓ bkit ledgers append --invocation (6)
     ✓ rejects conflicting attribution and retains legacy writer restrictions 367ms
     ✓ scopes a runless invocation to its declared step, agent and issuing checkout 220ms
     ✓ gives a runless invocation a correction scope and a bounded two-retry budget 277ms
     ✓ lands a standalone corrected candidate and reports the spend 172ms
     ✓ the correction-events file has mode 0600 179ms
     ✓ issues the same operation for rows whose keys are reordered 183ms
   ❯ bkit ledgers query (4)
     ✓ pages canonical winners with diagnostics and rejects stale cursors 46ms
     × query --status=OPEN returns a deferral winner that has no status, printed as stored 59ms
     ✓ a negative --cursor offset is refused 46ms
     ✓ marks a page with a next cursor as not clean 47ms
   ✓ bkit ledgers append --operation (6)
     ✓ returns durable append receipt and permits a deliberate same-key update 130ms
     ✓ a replayed operation whose rows are gone is not reported as recorded 88ms
     ✓ a replayed operation whose rows a rebase moved is still reported as recorded 86ms
     ✓ a replayed operation whose rows are gone says it was recorded and must not be retried under a new id 87ms
     ✓ keeps ledger operation intents and receipts out of committed book paths 278ms
     ✓ refuses --issue-operation without an invocation or beside --operation, writing nothing 71ms
   ✓ parked run commits (3)
     ✓ round-trips the record's start, commits and pushed list for its workflow 156ms
     ✓ reads null for a missing file, another workflow, an unreadable file and a bad fid 155ms
     ✓ is invisible to the record listing and removes by fid 160ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/ledgers.test.ts > bkit ledgers query > query --status=OPEN returns a deferral winner that has no status, printed as stored
AssertionError: expected [] to deeply equal [ '701-old-deferral' ]

- Expected
+ Received

- [
-   "701-old-deferral",
- ]
+ []

 ❯ .bkit/core/engine/commands/workflow/ledgers.test.ts:2311:62
    2309|     const res = await run(r, ["query", `--root=${r}`, "--ledger=deferr…
    2310|     expect(res.code).toBe(0);
    2311|     expect(res.json.rows.map((x: { key: string }) => x.key)).toEqual([…
       |                                                              ^
    2312|     expect(res.json.rows[0]).not.toHaveProperty("status");
    2313|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 120 passed (121)
   Start at  14:23:19
   Duration  18.20s (tests 98%, import 1%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-kTCFtw/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
```
