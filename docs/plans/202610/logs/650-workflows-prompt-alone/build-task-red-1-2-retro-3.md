> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/runs.test.ts

[test-timeout-budget] load average 10.3 on 10 cores: unit limits 5127ms per test, 10253ms per hook (x1.03)

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/runs.test.ts (150 tests | 5 failed) 26973ms
✓ fixture gh stub (10)
✓ runs?head_sha=green-capstone returns the captured workflow_runs list 29ms
✓ runs/<id>/jobs returns the captured jobs list, --paginate is accepted 31ms
✓ runs?head_sha=<unknown> returns total_count 0 (no-run shape) 22ms
✓ BKIT_FAKE_GH_API_ERROR=1: every api call exits 1 with stderr 19ms
✓ rate_limit returns the requested fixture state 29ms
✓ non-api argv exits non-zero (loud on an unmocked boundary) 30ms
✓ BKIT_FAKE_RATELIMITED=1: the run list fails rate-limit-shaped, rate_limit still answers 61ms
✓ --paginate emits one document per page; --slurp collapses them into an array 79ms
✓ rejects a '../'-laden SHA (no path traversal out of the runs dir) 19ms
✓ pr view is keyed by --repo; without it the checkout fixture is read 64ms
✓ bkit runs gate (56)
✓ accepts a green capstone at the head (exit 0) and says so 66ms
✓ rejects a failed run (12) 36ms
✓ rejects no run at the head (10) 39ms
✓ rejects runs that have not completed (11) 31ms
✓ rejects a green run at a superseded head (14), given --branch 50ms
✓ without --branch a superseded head is 10, not 14 (no invented attribution) 31ms
✓ rejects a run without the capstone job (13) 63ms
✓ rejects a cancelled run (15) 37ms
✓ rejects a green run whose capstone concluded 'cancelled' (12) 66ms
✓ rejects a green run whose capstone concluded 'skipped' (12) 64ms
✓ rejects a green run whose capstone concluded 'timed_out' (12) 64ms
✓ rejects a green run whose capstone concluded 'neutral' (12) 72ms
✓ rejects a green run whose capstone concluded 'action_required' (12) 70ms
✓ rejects a green run whose capstone concluded 'stale' (12) 63ms
✓ rejects a green run whose capstone concluded 'startup_failure' (12) 61ms
✓ --repo scopes --pr resolution (2)
✓ reads the head from the named repo, not the checkout's own PR 89ms
✓ logs the disagreement when the resolved repo differs from --repo 53ms
✓ skipped lanes (16 is opt-in) (5)
✓ a skipped lane alone does not refuse — the capstone's green settles it — but is reported 66ms
✓ refuses a skipped lane named in bkit.shipGateRequiredLanes (16) 56ms
✓ a required lane naming a different lane does not refuse 60ms
✓ refuses when any of several required lanes was skipped 55ms
✓ sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1 59ms
✓ a newer in-flight re-dispatch does not mask a completed green at the head 56ms
✓ tells an API error (20) from no run (10) 122ms
✓ shapes a rate-limit refusal from rate_limit (20) 46ms
✓ stderr noise on a successful gh call does not corrupt the JSON read 57ms
✓ an unparseable jobs response is an API error (20), not a missing capstone (13) 56ms
✓ gh missing from PATH exits 80 (use the MCP fallback), not an API error 2ms
✓ BKIT_SHIP_GATE_OVERRIDE (4)
✓ pinned to the refused head turns the refusal into 0 and appends the audit row 31ms
✓ a different SHA is ignored — the refusal stands 30ms
✓ honoured with no status file (no crash), the row goes to stderr 30ms
✓ an unwritable status file still exits 0 and emits the row to stderr (never invisible) 27ms
✓ config (5)
✓ capstone and CI workflow resolve from package.json when not passed 84ms
✓ bkit.shipGateRequiredLanes resolves from package.json 48ms
✓ absent shipGateRequiredLanes means no refusal 47ms
✓ a malformed shipGateRequiredLanes falls back to none, never crashes 41ms
✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 72ms
✓ missing --head is a usage error (2) 0ms
✓ an empty --head= is a usage error (2), not a gate refusal 6ms
✓ --event (5)
✓ --event push ignores a pull_request run: no push run is 10, not 11 18ms
✓ without --event the in-flight pull_request run reads as in progress (11) 18ms
✓ --event push selects the green push run beside an in-flight pull_request run 34ms
✓ --event push reds on a failed push run even when a newer pull_request run is green 18ms
✓ without --event the newer green pull_request run masks the failed push run 37ms
✓ --capstone-only (ship post-merge) (6)
✓ a failed run whose capstone passed passes: other jobs do not count 46ms
✓ a run still in progress whose capstone already passed passes 53ms
✓ a capstone still running is in progress (11) 37ms
✓ a failed capstone fails (12) even when every other job passed 34ms
✓ a cancelled capstone is 15; a completed run without the capstone is 13 70ms
✓ a required lane that was skipped does not refuse: the capstone alone decides 71ms
✓ --validated carry-forward (17) (6)
✓ bookkeeping-only commits on a green head pass without CI at the head 186ms
✓ a source change past the validated head refuses (17) and names the path 141ms
✓ the validated sha's own CI still has to be green (failed -> 12) 146ms
✓ --validated equal to --head is the plain head check 33ms
✓ --validated without --month / --fid is a usage error (2) 112ms
✓ a validated sha that is not an ancestor refuses (17) 139ms
✓ bkit runs mirror (18)
✓ green push run capstone -> 0 0ms
✓ waits through in-progress polls, then mirrors green 0ms
✓ waits through in-progress polls, then mirrors red (1) 0ms
✓ gate 12 (red) -> 1 with the gate's reason 0ms
✓ gate 15 (cancelled) -> 1 with the gate's reason 0ms
✓ gate 13 (capstone absent) -> 1 with the gate's reason 0ms
✓ gate 16 (required lane skipped) -> 1 with the gate's reason 0ms
✓ gate 7 (unknown gate exit (never a pass)) -> 1 with the gate's reason 0ms
✓ no push run past the absent window -> 3 naming [skip ci]; a superseded answer (14) counts as absent 0ms
✓ no push run yet inside the absent window keeps waiting 0ms
✓ still in progress at --max-minutes -> 4 0ms
✓ two API errors are retried; the third in a row -> 20 0ms
✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 440ms
✓ asks the gate for the push run on dev at the PR head, in the named repo 381ms
✓ e2e: green push run beside the PR's own in-flight run -> 0 45ms
✓ e2e: a red push run is not masked by a newer green PR run -> 1 24ms
✓ e2e: only the PR's own run exists -> absent, not in progress (3) 37ms
✓ usage: missing --head or a non-numeric minute value exits 2 1ms
✓ bkit runs wait (10)
✓ the dispatch probe matches the capstone's lane namespace, case-insensitive, by name or context 0ms
✓ is bounded: ceil(budget / interval) attempts, no sleep after the last 0ms
✓ found stops polling; every poll erroring is err with allErrored 0ms
✓ a sleep that overruns its window is blocked: hand the poll to the agent 0ms
✓ PR completed = no open checks; run targets are head-anchored 0ms
✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 758ms
✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 391ms
✓ CLI: a failed gh workflow run exits 5 389ms
✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1385ms
✓ CLI: usage errors exit 2 6ms
✓ bkit runs dispatch (14)
✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 147ms
✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 274ms
✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 516ms
✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 300ms
✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 179ms
✓ gh-error: every poll errored 151ms
✓ retrigger-suppressed maps to unresolved only, never no-ci 287ms
✓ a re-poll that only errored is gh-error, not a no-ci pass 331ms
✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 324ms
✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 308ms
✓ the probe namespace follows bkit.capstoneJob 156ms
✓ CLI: verdict JSON, body scan, exit codes 597ms
✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 553ms
✓ CLI: --poll-result is validated, --attempts needs it 182ms
❯ bkit runs dispatch on dev (a debug run in place) (5)
× dispatch on dev with a pushed sha and no pr proves the run started 489ms
× re-trigger on dev with a record pushes through the own-commit push 503ms
× re-trigger on dev with a record never commits a foreign staged path 415ms
× dispatch on dev with no pr and a record follows the landed sha through the re-trigger 268ms
✓ re-trigger on dev without a record stays a plain commit and a plain push 340ms
✓ bkit runs declared (2)
✓ exit 0 when .github/workflows/<bkit.ciWorkflow> exists, 1 when not 24ms
✓ the default bkit-ci.yml counts when no bkit.ciWorkflow is configured 8ms
✓ scanBody (8)
✓ flags [skip ci] inherited into the landed commit body 46ms
✓ flags [ci skip] inherited into the landed commit body 44ms
✓ flags [no ci] inherited into the landed commit body 44ms
✓ flags [skip actions] inherited into the landed commit body 44ms
✓ flags [actions skip] inherited into the landed commit body 45ms
✓ flags [SKIP CI] inherited into the landed commit body 49ms
✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 88ms
✓ an empty or unreadable sha is an error, not a clean result 42ms
✓ bkit runs gate — PR heads, snapshot and audit rows (9)
✓ --pr gates the PR's current head 441ms
✓ --pr refuses a title carrying a skip token (18) and --record writes the refusal row 382ms
✓ --snapshot appends the pre-merge snapshot before the gate decides 502ms
✓ --snapshot scopes its run list and dev lookups to --repo 485ms
✓ --snapshot without --repo leaves its run list unscoped 469ms
✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 479ms
✓ a refused capstone records FAIL with its reason 467ms
✓ an unreadable PR is an API error (20) with no head 393ms
✓ takes exactly one of --head, --pr, --squash-of 9ms
✓ bkit runs revalidate (6)
✓ --repo scopes every gh call (3)
✓ pr view, run list and the dev-protection lookups name the foreign repo 539ms
✓ without --repo no call gains a --repo flag 531ms
✓ repoScopedGh appends --repo to workflow run, leaves gh api alone, and is a no-op without a repo 0ms
✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 465ms
✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 840ms
✓ refuses an unknown --reason 111ms
❯ bkit runs context (10)
✓ BRIEF phases take the argument as the issue 426ms
✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 462ms
✓ CI_DEV refuses the slug "../../etc" (exit 9) 477ms
✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 486ms
✓ CI_DEV refuses the slug "a/b" (exit 9) 466ms
✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 529ms
✓ CI falls back to the feat/{FID} branch when the body has no marker 525ms
✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 970ms
× runs context refuses an issue-less marker and branch naming the missing issue 551ms
✓ an unknown phase exits 3; gh needing auth exits 80 522ms
✓ bkit runs dispatch — the verdict row and the close transport (2)
✓ writes the step's row with its ciDispatch verdict, then the close-transport row 629ms
✓ --file and --step go together 613ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs dispatch on dev (a debug run in place) > dispatch on dev with a pushed sha and no pr proves the run started
AssertionError: expected 2 to be +0 // Object.is equality

- Expected

* Received

- 0

* 2

❯ .bkit/core/engine/commands/workflow/runs.test.ts:1443:20
1441| });
1442| const r = await cli(cwd, ["dispatch", `--fid=${FID}`, `--sha=${sha…
1443| expect(r.code).toBe(0);
| ^
1444| expect(r.json).toMatchObject({
1445| ciDispatch: { outcome: "dispatched", head: sha, retrigger: false…

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/5]⎯

FAIL .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs dispatch on dev (a debug run in place) > re-trigger on dev with a record pushes through the own-commit push
AssertionError: expected [ 'chore(1-x): re-trigger', …(3) ] to not include 'foreign local commit'
❯ .bkit/core/engine/commands/workflow/runs.test.ts:1460:29
1458| });
1459| // The foreign local commit never reaches origin; the run's commit…
1460| expect(remoteLog()).not.toContain("foreign local commit");
| ^
1461| expect(remoteLog()).toContain(`chore(${FID}): run commit`);
1462| expect(remoteLog()[0]).toBe(`chore(${FID}): re-trigger`);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/5]⎯

FAIL .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs dispatch on dev (a debug run in place) > re-trigger on dev with a record never commits a foreign staged path
AssertionError: expected 'foreign.txt' to be '' // Object.is equality

- Expected

* Received

* foreign.txt

❯ .bkit/core/engine/commands/workflow/runs.test.ts:1479:71
1477| });
1478| const retrigger = gitIn(cwd, "log", "-1", "--format=%H", "--grep=r…
1479| expect(gitIn(cwd, "show", "--name-only", "--format=", retrigger)).…
| ^
1480| expect(gitIn(cwd, "diff", "--cached", "--name-only")).toBe("foreig…
1481| expect(remoteLog()).not.toContain("foreign local commit");

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/5]⎯

FAIL .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs dispatch on dev (a debug run in place) > dispatch on dev with no pr and a record follows the landed sha through the re-trigger
AssertionError: expected { outcome: 'unresolved', …(4) } to match object { outcome: 'self-healed', …(2) }
(2 matching properties omitted from actual)

- Expected

* Received

  {

- "head": "674b9163db2a3e7edd814c1ce716c00e6fbd31fd",
- "outcome": "self-healed",
- "retrigger": true,

* "head": "c98061c3be3f19b8ca69a7958f0acd664ac3f4ae",
* "outcome": "unresolved",
* "retrigger": false,
  }

❯ .bkit/core/engine/commands/workflow/runs.test.ts:1490:26
1488| { gh: runAtRemoteTip(remote, 6), ...quiet },
1489| );
1490| expect(r.ciDispatch).toMatchObject({
| ^
1491| outcome: "self-healed",
1492| retrigger: true,

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[4/5]⎯

FAIL .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs context > runs context refuses an issue-less marker and branch naming the missing issue
AssertionError: expected '[bkit-runs] "dev-ci-failures" embeds …' to contain 'no issue in the PR-body marker or bra…'

- Expected

* Received

- no issue in the PR-body marker or branch FID

* [bkit-runs] "dev-ci-failures" embeds no github issue id
*

❯ .bkit/core/engine/commands/workflow/runs.test.ts:2014:27
2012| const viaMarker = await context(cwd, "ship", "42");
2013| expect(viaMarker.code).toBe(9);
2014| expect(viaMarker.err).toContain("no issue in the PR-body marker or…
| ^
2015| expect(viaMarker.json.fid).toBeNull();
2016| fakeGhBin({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[5/5]⎯

Test Files 1 failed (1)
Tests 5 failed | 145 passed (150)
Start at 14:22:40
Duration 27.56s (tests 98%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-3Kxcx3/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
