> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/runs.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/runs.test.ts (150 tests | 3 failed) 24120ms
✓ fixture gh stub (10)
✓ runs?head_sha=green-capstone returns the captured workflow_runs list 19ms
✓ runs/<id>/jobs returns the captured jobs list, --paginate is accepted 15ms
✓ runs?head_sha=<unknown> returns total_count 0 (no-run shape) 10ms
✓ BKIT_FAKE_GH_API_ERROR=1: every api call exits 1 with stderr 10ms
✓ rate_limit returns the requested fixture state 11ms
✓ non-api argv exits non-zero (loud on an unmocked boundary) 10ms
✓ BKIT_FAKE_RATELIMITED=1: the run list fails rate-limit-shaped, rate_limit still answers 20ms
✓ --paginate emits one document per page; --slurp collapses them into an array 30ms
✓ rejects a '../'-laden SHA (no path traversal out of the runs dir) 9ms
✓ pr view is keyed by --repo; without it the checkout fixture is read 27ms
✓ bkit runs gate (56)
✓ accepts a green capstone at the head (exit 0) and says so 32ms
✓ rejects a failed run (12) 17ms
✓ rejects no run at the head (10) 17ms
✓ rejects runs that have not completed (11) 17ms
✓ rejects a green run at a superseded head (14), given --branch 25ms
✓ without --branch a superseded head is 10, not 14 (no invented attribution) 14ms
✓ rejects a run without the capstone job (13) 32ms
✓ rejects a cancelled run (15) 16ms
✓ rejects a green run whose capstone concluded 'cancelled' (12) 34ms
✓ rejects a green run whose capstone concluded 'skipped' (12) 32ms
✓ rejects a green run whose capstone concluded 'timed_out' (12) 31ms
✓ rejects a green run whose capstone concluded 'neutral' (12) 30ms
✓ rejects a green run whose capstone concluded 'action_required' (12) 30ms
✓ rejects a green run whose capstone concluded 'stale' (12) 30ms
✓ rejects a green run whose capstone concluded 'startup_failure' (12) 31ms
✓ --repo scopes --pr resolution (2)
✓ reads the head from the named repo, not the checkout's own PR 50ms
✓ logs the disagreement when the resolved repo differs from --repo 31ms
✓ skipped lanes (16 is opt-in) (5)
✓ a skipped lane alone does not refuse — the capstone's green settles it — but is reported 39ms
✓ refuses a skipped lane named in bkit.shipGateRequiredLanes (16) 36ms
✓ a required lane naming a different lane does not refuse 40ms
✓ refuses when any of several required lanes was skipped 34ms
✓ sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1 33ms
✓ a newer in-flight re-dispatch does not mask a completed green at the head 34ms
✓ tells an API error (20) from no run (10) 68ms
✓ shapes a rate-limit refusal from rate_limit (20) 30ms
✓ stderr noise on a successful gh call does not corrupt the JSON read 33ms
✓ an unparseable jobs response is an API error (20), not a missing capstone (13) 34ms
✓ gh missing from PATH exits 80 (use the MCP fallback), not an API error 1ms
✓ BKIT_SHIP_GATE_OVERRIDE (4)
✓ pinned to the refused head turns the refusal into 0 and appends the audit row 18ms
✓ a different SHA is ignored — the refusal stands 17ms
✓ honoured with no status file (no crash), the row goes to stderr 18ms
✓ an unwritable status file still exits 0 and emits the row to stderr (never invisible) 16ms
✓ config (5)
✓ capstone and CI workflow resolve from package.json when not passed 61ms
✓ bkit.shipGateRequiredLanes resolves from package.json 31ms
✓ absent shipGateRequiredLanes means no refusal 31ms
✓ a malformed shipGateRequiredLanes falls back to none, never crashes 31ms
✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 72ms
✓ missing --head is a usage error (2) 1ms
✓ an empty --head= is a usage error (2), not a gate refusal 5ms
✓ --event (5)
✓ --event push ignores a pull_request run: no push run is 10, not 11 16ms
✓ without --event the in-flight pull_request run reads as in progress (11) 17ms
✓ --event push selects the green push run beside an in-flight pull_request run 34ms
✓ --event push reds on a failed push run even when a newer pull_request run is green 17ms
✓ without --event the newer green pull_request run masks the failed push run 30ms
✓ --capstone-only (ship post-merge) (6)
✓ a failed run whose capstone passed passes: other jobs do not count 46ms
✓ a run still in progress whose capstone already passed passes 46ms
✓ a capstone still running is in progress (11) 31ms
✓ a failed capstone fails (12) even when every other job passed 33ms
✓ a cancelled capstone is 15; a completed run without the capstone is 13 62ms
✓ a required lane that was skipped does not refuse: the capstone alone decides 62ms
✓ --validated carry-forward (17) (6)
✓ bookkeeping-only commits on a green head pass without CI at the head 156ms
✓ a source change past the validated head refuses (17) and names the path 135ms
✓ the validated sha's own CI still has to be green (failed -> 12) 144ms
✓ --validated equal to --head is the plain head check 29ms
✓ --validated without --month / --fid is a usage error (2) 103ms
✓ a validated sha that is not an ancestor refuses (17) 121ms
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
✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 369ms
✓ asks the gate for the push run on dev at the PR head, in the named repo 388ms
✓ e2e: green push run beside the PR's own in-flight run -> 0 33ms
✓ e2e: a red push run is not masked by a newer green PR run -> 1 15ms
✓ e2e: only the PR's own run exists -> absent, not in progress (3) 21ms
✓ usage: missing --head or a non-numeric minute value exits 2 1ms
✓ bkit runs wait (10)
✓ the dispatch probe matches the capstone's lane namespace, case-insensitive, by name or context 0ms
✓ is bounded: ceil(budget / interval) attempts, no sleep after the last 0ms
✓ found stops polling; every poll erroring is err with allErrored 0ms
✓ a sleep that overruns its window is blocked: hand the poll to the agent 0ms
✓ PR completed = no open checks; run targets are head-anchored 0ms
✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 699ms
✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 361ms
✓ CLI: a failed gh workflow run exits 5 350ms
✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1374ms
✓ CLI: usage errors exit 2 8ms
✓ bkit runs dispatch (14)
✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 122ms
✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 189ms
✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 334ms
✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 180ms
✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 103ms
✓ gh-error: every poll errored 96ms
✓ retrigger-suppressed maps to unresolved only, never no-ci 163ms
✓ a re-poll that only errored is gh-error, not a no-ci pass 166ms
✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 262ms
✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 192ms
✓ the probe namespace follows bkit.capstoneJob 102ms
✓ CLI: verdict JSON, body scan, exit codes 524ms
✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 449ms
✓ CLI: --poll-result is validated, --attempts needs it 93ms
❯ bkit runs dispatch on dev (a debug run in place) (5)
✓ dispatch on dev with a pushed sha and no pr proves the run started 615ms
× re-trigger on dev with a record pushes through the own-commit push 195ms
× re-trigger on dev with a record never commits a foreign staged path 205ms
✓ dispatch on dev with no pr and a record follows the landed sha through the re-trigger 208ms
✓ re-trigger on dev without a record stays a plain commit and a plain push 217ms
✓ bkit runs declared (2)
✓ exit 0 when .github/workflows/<bkit.ciWorkflow> exists, 1 when not 13ms
✓ the default bkit-ci.yml counts when no bkit.ciWorkflow is configured 5ms
✓ scanBody (8)
✓ flags [skip ci] inherited into the landed commit body 27ms
✓ flags [ci skip] inherited into the landed commit body 29ms
✓ flags [no ci] inherited into the landed commit body 36ms
✓ flags [skip actions] inherited into the landed commit body 39ms
✓ flags [actions skip] inherited into the landed commit body 38ms
✓ flags [SKIP CI] inherited into the landed commit body 37ms
✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 75ms
✓ an empty or unreadable sha is an error, not a clean result 40ms
✓ bkit runs gate — PR heads, snapshot and audit rows (9)
✓ --pr gates the PR's current head 429ms
✓ --pr refuses a title carrying a skip token (18) and --record writes the refusal row 372ms
✓ --snapshot appends the pre-merge snapshot before the gate decides 442ms
✓ --snapshot scopes its run list and dev lookups to --repo 404ms
✓ --snapshot without --repo leaves its run list unscoped 379ms
✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 440ms
✓ a refused capstone records FAIL with its reason 538ms
✓ an unreadable PR is an API error (20) with no head 472ms
✓ takes exactly one of --head, --pr, --squash-of 29ms
✓ bkit runs revalidate (6)
✓ --repo scopes every gh call (3)
✓ pr view, run list and the dev-protection lookups name the foreign repo 873ms
✓ without --repo no call gains a --repo flag 948ms
✓ repoScopedGh appends --repo to workflow run, leaves gh api alone, and is a no-op without a repo 1ms
✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 637ms
✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 937ms
✓ refuses an unknown --reason 104ms
❯ bkit runs context (10)
✓ BRIEF phases take the argument as the issue 409ms
✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 419ms
✓ CI_DEV refuses the slug "../../etc" (exit 9) 374ms
✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 392ms
✓ CI_DEV refuses the slug "a/b" (exit 9) 456ms
✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 566ms
✓ CI falls back to the feat/{FID} branch when the body has no marker 580ms
✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 1089ms
✓ an unknown phase exits 3; gh needing auth exits 80 511ms
× runs context refuses an issue-less marker and branch naming the missing issue 471ms
✓ bkit runs dispatch — the verdict row and the close transport (2)
✓ writes the step's row with its ciDispatch verdict, then the close-transport row 550ms
✓ --file and --step go together 518ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs dispatch on dev (a debug run in place) > re-trigger on dev with a record pushes through the own-commit push
AssertionError: expected [ 'chore(1-x): re-trigger', …(3) ] to not include 'foreign local commit'
❯ .bkit/core/engine/commands/workflow/runs.test.ts:1460:29
1458| });
1459| // The foreign local commit never reaches origin; the run's commit…
1460| expect(remoteLog()).not.toContain("foreign local commit");
| ^
1461| expect(remoteLog()).toContain(`chore(${FID}): run commit`);
1462| expect(remoteLog()[0]).toBe(`chore(${FID}): re-trigger`);

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/3]⎯

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

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[2/3]⎯

FAIL .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs context > runs context refuses an issue-less marker and branch naming the missing issue
AssertionError: expected '' to contain 'dev-ci-failures names no issue'

- Expected

* Received

- dev-ci-failures names no issue

❯ .bkit/core/engine/commands/workflow/runs.test.ts:2018:21
2016| fakeGhBin({ "pr-view": prJson(pr), "run-list": runs });
2017| const r = await context(cwd, "ship", "42");
2018| expect(r.err).toContain("dev-ci-failures names no issue");
| ^
2019| expect(r.code).toBe(9);
2020| expect(r.json.fid).toBeNull();

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[3/3]⎯

Test Files 1 failed (1)
Tests 3 failed | 147 passed (150)
Start at 15:46:44
Duration 24.42s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-brymQu/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
