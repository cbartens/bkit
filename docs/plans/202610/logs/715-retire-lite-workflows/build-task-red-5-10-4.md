
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/ledgers/telemetry.test.ts

[test-timeout-budget] load average 10.3 on 10 cores: unit limits 5150ms per test, 10300ms per hook (x1.03)

 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/715-retire-lite-workflows

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > foldFrom — several ledger files > emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

stderr | .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — per-workflow summary signals > emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded
[bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP exceeded: 5001 rows > 5000.

 ❯ .bkit/core/engine/ledgers/telemetry.test.ts (283 tests | 4 failed) 842ms
   ✓ identity — per-kind composite tuples (7)
     ✓ compliance: keyed by (repo, by.workflow, run.parentSha, rule.id) 2ms
     ✓ outcome: keyed by (repo, by.workflow, run.parentSha) — run.pr fallback when no parentSha 0ms
     ✓ counter: keyed by (repo, by.workflow, run.parentSha, counter.name) 0ms
     ✓ friction: keyed by (kind, repo, key) 1ms
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
     ✓ fold is last-wins by ts, not by file order 0ms
     ✓ fold orders ISO-string and missing ts deterministically, whatever the file order 0ms
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
     ✓ accepts status ABANDONED 0ms
     ✓ rejects a missing status — the roadmap has no phase to project without it 0ms
     ✓ rejects an off-ladder status 0ms
     ✓ does not carry severity — feature is not in SEVERITY_KINDS 0ms
     ✓ requires key, category, and description 0ms
     ✓ a same-key append folds last-wins to the latest phase 0ms
   ✓ chat kind — .bkit/stats.jsonl chat rows (5)
     ✓ is a valid kind keyed by kind + repo + key 0ms
     ✓ rejects a row without the join keys readers depend on 0ms
     ✓ carries no severity or status 0ms
     ✓ a resumed chat's new row folds over the first one 0ms
     ✓ leaves a workflow's telemetry report unchanged 1ms
   ✓ run kind — .bkit/stats.jsonl run rows (6)
     ✓ is a valid kind keyed by kind + repo + key 0ms
     ✓ rejects a row without the join keys readers depend on 0ms
     ✓ takes only the five endings 0ms
     ✓ carries no severity or status 0ms
     ✓ a grown run log's new row folds over the first one 0ms
     ✓ leaves the telemetry report of the same workflow unchanged 0ms
   ✓ jsonl.md examples — validated against the codec (6)
     ✓ every full example row is a valid event 4ms
     ✓ every example field is a Generic Field or listed in its kind's Per-Kind Fields row 6ms
     ✓ every kind has a worked example 3ms
     ✓ no example puts an agent name in by.step 2ms
     ✓ by.model appears exactly where by.subagent does — never on an orchestrator row 1ms
     ✓ the triaged kinds' examples carry severity and references 1ms
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
     ✓ resolves the slug from a repo's origin remote 134ms
     ✓ returns empty for a git repo with no origin remote 158ms
     ✓ returns empty for a directory that is not a git repo 32ms
   ✓ resolveGitSha — parentSha must be a real SHA before it reaches a row (7)
     ✓ resolves a rev to a hex SHA the grader's guard accepts 21ms
     ✓ never returns the rev it was given 21ms
     ✓ gives DIFFERENT SHAs for different revs — so identity cannot collapse runs 40ms
     ✓ returns empty for unresolvable "no-such-rev" 20ms
     ✓ returns empty for unresolvable "HEAD~99999" 23ms
     ✓ returns empty for unresolvable "" 17ms
     ✓ returns empty outside a git repo rather than throwing 18ms
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
     ✓ lineage counts rows and takes the earliest ts 0ms
     ✓ lineage continues a stamped row's count and keeps its firstTs 0ms
     ✓ lineage counts same-ts rows once, keeping the larger stamped count 0ms
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
     ✓ counts a malformed line in the MIDDLE of the file, does NOT throw 0ms
     ✓ parses empty string → zero events, zero malformed 0ms
     ✓ NEVER throws on any input (fuzz) 1ms
     ✓ keeps ALL well-formed rows regardless of bkitVersion (no version gating) 0ms
     ✓ parse keeps an old row with subPlans 1ms
   ❯ outcome — shape and inline-jq parity (7)
     ✓ close-gate-shaped outcome validates successfully 0ms
     ✓ validate refuses plan.source brief on write 0ms
     × accepts held in outcome and run endings 12ms
     × keeps publish false on the outcome row 1ms
     × rejects a non-boolean publish 3ms
     ✓ folds outcome by (repo, run.pr) 0ms
     ✓ inline-jq parity: jq-shaped row parses identically under parse() 0ms
   ✓ appendLine (1)
     ✓ serializes event to JSON string parseable back to same shape 0ms
   ✓ constants (1)
     ✓ MAX_ROWS_BEFORE_ROLLUP is a concrete number (not TODO) 0ms
   ✓ foldFrom — several ledger files (5)
     ✓ reads hot file and returns rowCount 1ms
     ✓ folds two files together 2ms
     ✓ missing paths are silently skipped 1ms
     ✓ emits maxRowsWarning when rowCount exceeds MAX_ROWS_BEFORE_ROLLUP 48ms
     ✓ surfaces malformedLineCount from hot file 2ms
   ✓ workflowTelemetry — per-workflow summary signals (2)
     ✓ produces lines with rowCount, malformed, and per-version counts 2ms
     ✓ emits grep-able [bkit-telemetry] MAX_ROWS_BEFORE_ROLLUP WARNING when exceeded 38ms
   ❯ workflowTelemetry — this-run vs med·5 baseline (7)
     ✓ shows THIS run's values against med·5 of the previous same-workflow runs 2ms
     ✓ workflowTelemetry splits the baseline on converted 3ms
     × shows an ending row for a held close 3ms
     ✓ prints — for the baseline until at least 3 prior runs exist 1ms
     ✓ omits absent conditional metrics but shows ledgers.friction.added even at 0 1ms
     ✓ adds a this-run compliance line matched by run.parentSha 4ms
     ✓ adds the run's *_ATTEMPT counter matched by run.parentSha 2ms
   ✓ humanizeDuration (5)
     ✓ formats 45 seconds as 45s 0ms
     ✓ formats 480 seconds as 8m 0ms
     ✓ formats 1980 seconds as 33m 0ms
     ✓ formats 3600 seconds as 1h 0ms
     ✓ formats 7860 seconds as 2h11m 0ms
   ✓ telemetry-invariant (7)
     ✓ WS3-T4: bkit-telemetry-invariant — counters.verifyAttempt == count of plan-verify rows (7)
       ✓ invariant passes when verifyAttempt count matches plan-verify step count (1 attempt) 0ms
       ✓ invariant passes when verifyAttempt count matches plan-verify step count (3 attempts) 0ms
       ✓ fold deduplicates verifyAttempt counter by (repo, by.workflow, run.parentSha, counter.name) identity 0ms
       ✓ non-verifyAttempt counter rows do not count toward the invariant 0ms
       ✓ malformed JSONL lines are tolerated; invariant still passes over valid rows 0ms
       ✓ verifyAttempt counter.source must be shell-bus post-WS3 (structural trust tier) 0ms
       ✓ invariant holds with empty log (zero attempts == zero verify steps) 0ms
   ✓ mintTs (2)
     ✓ moves a whole-second clock reading 1 ms on 2ms
     ✓ follows `after` when the clock has not passed it, never landing on a whole second 0ms
   ✓ writerProblem (6)
     ✓ admits a listed subagent and the listed orchestrator 0ms
     ✓ refuses an unlisted subagent or orchestrator 0ms
     ✓ admits the auto orchestrator on friction rows 0ms
     ✓ holds model to subagent rows 0ms
     ✓ admits any author on an any-agent kind 0ms
     ✓ admits each closing workflow on the stats kinds, and refuses audit and any subagent 0ms
   ✓ writer sets in telemetry.ts match the jsonl.md table (9)
     ✓ every kind appears in exactly one ledger 0ms
     ✓ decisions / decision: the doc row names docs/decisions.jsonl and the same writers 1ms
     ✓ deferrals / deferral: the doc row names docs/deferrals.jsonl and the same writers 0ms
     ✓ failures / failure: the doc row names docs/failures.jsonl and the same writers 0ms
     ✓ knowledge / knowledge: the doc row names docs/knowledge.jsonl and the same writers 0ms
     ✓ friction / friction: the doc row names .bkit/friction.jsonl and the same writers 1ms
     ✓ stats / compliance: the doc row names .bkit/stats.jsonl, a close-step writer and no subagent 0ms
     ✓ stats / counter: the doc row names .bkit/stats.jsonl, a close-step writer and no subagent 0ms
     ✓ stats / outcome: the doc row names .bkit/stats.jsonl, a close-step writer and no subagent 0ms
   ✓ normalize — schema-1 rows to schema 2 (13)
     ✓ compliance: rule / result / evidence / parentSha move into run and rule; phase is dropped 1ms
     ✓ counter: counterName / Value / Source and parentSha move into counter and run 0ms
     ✓ outcome: run fields move into their blocks; the fields with no place are dropped 1ms
     ✓ chat: every schema-1 field lands in its block, and the totals hold 3ms
     ✓ run: every schema-1 field lands in its block, and the totals hold 3ms
     ✓ a keyed kind (deferral) moves its top fields into bkit / by and keeps its payload 1ms
     ✓ a row carrying schema passes through unchanged 0ms
     ✓ bkitVersion "none" becomes bkit.version null 0ms
     ✓ a non-object reads as an empty row 0ms
     ✓ phase is dropped, outcome redTests moves into build, any kind's parentSha into run 1ms
     ✓ chat: an opencode row's bash categories land on its lowercase bash tool 1ms
     ✓ chat: usage.total.tokens is the sum of its models, as a fresh scan writes it 0ms
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
     ✓ build.redTests = steps.byStep["build-task-red"].n 0ms
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

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/ledgers/telemetry.test.ts > outcome — shape and inline-jq parity > accepts held in outcome and run endings
AssertionError: expected { ok: false, …(1) } to deeply equal { ok: true }

- Expected
+ Received

  {
-   "ok": true,
+   "ok": false,
+   "reason": "outcome ending must be done|close-failed (got: held)",
  }

 ❯ .bkit/core/engine/ledgers/telemetry.test.ts:1441:56
    1439|
    1440|   it("accepts held in outcome and run endings", () => {
    1441|     expect(validate(outcomeEvent({ ending: "held" }))).toEqual({ ok: t…
       |                                                        ^
    1442|     expect(OUTCOME_ENDINGS.has("held")).toBe(true);
    1443|     expect(RUN_ENDINGS.has("held")).toBe(true);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/4]⎯

 FAIL  .bkit/core/engine/ledgers/telemetry.test.ts > outcome — shape and inline-jq parity > keeps publish false on the outcome row
AssertionError: expected { ok: false, …(1) } to deeply equal { ok: true }

- Expected
+ Received

  {
-   "ok": true,
+   "ok": false,
+   "reason": "outcome ending must be done|close-failed (got: held)",
  }

 ❯ .bkit/core/engine/ledgers/telemetry.test.ts:1452:25
    1450|   it("keeps publish false on the outcome row", () => {
    1451|     const e = outcomeEvent({ ending: "held", publish: false });
    1452|     expect(validate(e)).toEqual({ ok: true });
       |                         ^
    1453|     expect(parse(JSON.stringify(e)).events[0]).toMatchObject({ ending:…
    1454|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/4]⎯

 FAIL  .bkit/core/engine/ledgers/telemetry.test.ts > outcome — shape and inline-jq parity > rejects a non-boolean publish
AssertionError: expected 'outcome ending must be done|close-fai…' to be 'outcome publish must be a boolean (go…' // Object.is equality

Expected: "outcome publish must be a boolean (got: false)"
Received: "outcome ending must be done|close-failed (got: held)"

 ❯ .bkit/core/engine/ledgers/telemetry.test.ts:1459:24
    1457|     const bad = validate(outcomeEvent({ ending: "held", publish: "fals…
    1458|     expect(bad.ok).toBe(false);
    1459|     expect(bad.reason).toBe("outcome publish must be a boolean (got: f…
       |                        ^
    1460|   });
    1461|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/4]⎯

 FAIL  .bkit/core/engine/ledgers/telemetry.test.ts > workflowTelemetry — this-run vs med·5 baseline > shows an ending row for a held close
AssertionError: expected false to be true // Object.is equality

- Expected
+ Received

- true
+ false

 ❯ .bkit/core/engine/ledgers/telemetry.test.ts:1725:67
    1723|     const run = outcomeEvent({ run: { parentSha: "held-sha" }, ending:…
    1724|     const s = workflowTelemetry(foldFrom([writeStats([run])]), "build"…
    1725|     expect(s.lines.some((l) => l.startsWith("| ending | held "))).toBe…
       |                                                                   ^
    1726|   });
    1727|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/4]⎯


 Test Files  1 failed (1)
      Tests  4 failed | 279 passed (283)
   Start at  12:14:34
   Duration  1.26s (tests 75%, transform 17%, setup 4%, import 3%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-pL2cWb/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
