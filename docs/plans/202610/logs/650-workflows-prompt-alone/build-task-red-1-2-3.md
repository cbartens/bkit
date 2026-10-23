> @cbartens/bkit@5.5.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/runs.test.ts

RUN v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/650-workflows-prompt-alone

❯ .bkit/core/engine/commands/workflow/runs.test.ts (145 tests | 1 failed) 20666ms
✓ fixture gh stub (10)
✓ runs?head_sha=green-capstone returns the captured workflow_runs list 344ms
✓ runs/<id>/jobs returns the captured jobs list, --paginate is accepted 13ms
✓ runs?head_sha=<unknown> returns total_count 0 (no-run shape) 8ms
✓ BKIT_FAKE_GH_API_ERROR=1: every api call exits 1 with stderr 7ms
✓ rate_limit returns the requested fixture state 9ms
✓ non-api argv exits non-zero (loud on an unmocked boundary) 8ms
✓ BKIT_FAKE_RATELIMITED=1: the run list fails rate-limit-shaped, rate_limit still answers 19ms
✓ --paginate emits one document per page; --slurp collapses them into an array 27ms
✓ rejects a '../'-laden SHA (no path traversal out of the runs dir) 7ms
✓ pr view is keyed by --repo; without it the checkout fixture is read 22ms
✓ bkit runs gate (56)
✓ accepts a green capstone at the head (exit 0) and says so 25ms
✓ rejects a failed run (12) 13ms
✓ rejects no run at the head (10) 13ms
✓ rejects runs that have not completed (11) 13ms
✓ rejects a green run at a superseded head (14), given --branch 20ms
✓ without --branch a superseded head is 10, not 14 (no invented attribution) 12ms
✓ rejects a run without the capstone job (13) 25ms
✓ rejects a cancelled run (15) 13ms
✓ rejects a green run whose capstone concluded 'cancelled' (12) 29ms
✓ rejects a green run whose capstone concluded 'skipped' (12) 28ms
✓ rejects a green run whose capstone concluded 'timed_out' (12) 26ms
✓ rejects a green run whose capstone concluded 'neutral' (12) 26ms
✓ rejects a green run whose capstone concluded 'action_required' (12) 26ms
✓ rejects a green run whose capstone concluded 'stale' (12) 26ms
✓ rejects a green run whose capstone concluded 'startup_failure' (12) 26ms
✓ --repo scopes --pr resolution (2)
✓ reads the head from the named repo, not the checkout's own PR 36ms
✓ logs the disagreement when the resolved repo differs from --repo 23ms
✓ skipped lanes (16 is opt-in) (5)
✓ a skipped lane alone does not refuse — the capstone's green settles it — but is reported 26ms
✓ refuses a skipped lane named in bkit.shipGateRequiredLanes (16) 26ms
✓ a required lane naming a different lane does not refuse 25ms
✓ refuses when any of several required lanes was skipped 25ms
✓ sees a skipped lane on page 2 of a paginated jobs list, and the capstone on page 1 31ms
✓ a newer in-flight re-dispatch does not mask a completed green at the head 33ms
✓ tells an API error (20) from no run (10) 52ms
✓ shapes a rate-limit refusal from rate_limit (20) 20ms
✓ stderr noise on a successful gh call does not corrupt the JSON read 25ms
✓ an unparseable jobs response is an API error (20), not a missing capstone (13) 26ms
✓ gh missing from PATH exits 80 (use the MCP fallback), not an API error 1ms
✓ BKIT_SHIP_GATE_OVERRIDE (4)
✓ pinned to the refused head turns the refusal into 0 and appends the audit row 14ms
✓ a different SHA is ignored — the refusal stands 13ms
✓ honoured with no status file (no crash), the row goes to stderr 13ms
✓ an unwritable status file still exits 0 and emits the row to stderr (never invisible) 13ms
✓ config (5)
✓ capstone and CI workflow resolve from package.json when not passed 50ms
✓ bkit.shipGateRequiredLanes resolves from package.json 25ms
✓ absent shipGateRequiredLanes means no refusal 26ms
✓ a malformed shipGateRequiredLanes falls back to none, never crashes 25ms
✓ a configured capstone that is a job in the run passes; one that is not is absent (13) 51ms
✓ missing --head is a usage error (2) 0ms
✓ an empty --head= is a usage error (2), not a gate refusal 4ms
✓ --event (5)
✓ --event push ignores a pull_request run: no push run is 10, not 11 17ms
✓ without --event the in-flight pull_request run reads as in progress (11) 16ms
✓ --event push selects the green push run beside an in-flight pull_request run 33ms
✓ --event push reds on a failed push run even when a newer pull_request run is green 20ms
✓ without --event the newer green pull_request run masks the failed push run 27ms
✓ --capstone-only (ship post-merge) (6)
✓ a failed run whose capstone passed passes: other jobs do not count 38ms
✓ a run still in progress whose capstone already passed passes 37ms
✓ a capstone still running is in progress (11) 26ms
✓ a failed capstone fails (12) even when every other job passed 27ms
✓ a cancelled capstone is 15; a completed run without the capstone is 13 53ms
✓ a required lane that was skipped does not refuse: the capstone alone decides 58ms
✓ --validated carry-forward (17) (6)
✓ bookkeeping-only commits on a green head pass without CI at the head 146ms
✓ a source change past the validated head refuses (17) and names the path 122ms
✓ the validated sha's own CI still has to be green (failed -> 12) 125ms
✓ --validated equal to --head is the plain head check 26ms
✓ --validated without --month / --fid is a usage error (2) 94ms
✓ a validated sha that is not an ancestor refuses (17) 99ms
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
✓ asks for the dev push run at the PR head, and BKIT_SHIP_GATE_OVERRIDE never reaches the gate 381ms
✓ asks the gate for the push run on dev at the PR head, in the named repo 374ms
✓ e2e: green push run beside the PR's own in-flight run -> 0 25ms
✓ e2e: a red push run is not masked by a newer green PR run -> 1 13ms
✓ e2e: only the PR's own run exists -> absent, not in progress (3) 20ms
✓ usage: missing --head or a non-numeric minute value exits 2 1ms
✓ bkit runs wait (10)
✓ the dispatch probe matches the capstone's lane namespace, case-insensitive, by name or context 0ms
✓ is bounded: ceil(budget / interval) attempts, no sleep after the last 0ms
✓ found stops polling; every poll erroring is err with allErrored 0ms
✓ a sleep that overruns its window is blocked: hand the poll to the agent 0ms
✓ PR completed = no open checks; run targets are head-anchored 0ms
✓ CLI: found exits 0; --once not found exits 81 (end the turn, call again) 731ms
✓ CLI: the run probe reads the configured CI workflow, and --dispatch-if-absent triggers it 380ms
✓ CLI: a failed gh workflow run exits 5 377ms
✓ CLI: gh not on PATH exits 80; budget exhausted exits 1 1393ms
✓ CLI: usage errors exit 2 9ms
✓ bkit runs dispatch (14)
✓ dispatched: a lane check on the pushed head within the budget; no reason, no re-trigger 127ms
✓ self-healed: one clean re-trigger commit is pushed, the re-poll finds the run 201ms
✓ no-ci only when no CI workflow is declared; a declared one's silence is ci-declared-no-run 366ms
✓ self-heal is capped at one re-trigger, and nothing is pushed after the verdict 249ms
✓ timeout-dirty: no run and the pushed head carries a suppressor — never re-triggers a dirty head 114ms
✓ gh-error: every poll errored 97ms
✓ retrigger-suppressed maps to unresolved only, never no-ci 159ms
✓ a re-poll that only errored is gh-error, not a no-ci pass 151ms
✓ a blocked sleep hands the poll to the agent (81); re-entry with the turn loop's result resumes 181ms
✓ a hand-off in the re-poll resumes with --retriggered and no second re-trigger commit 176ms
✓ the probe namespace follows bkit.capstoneJob 91ms
✓ CLI: verdict JSON, body scan, exit codes 533ms
✓ CLI: unresolved exits 1 with the verdict still on stdout; gh absent exits 80 472ms
✓ CLI: --poll-result is validated, --attempts needs it 88ms
✓ bkit runs declared (2)
✓ exit 0 when .github/workflows/<bkit.ciWorkflow> exists, 1 when not 12ms
✓ the default bkit-ci.yml counts when no bkit.ciWorkflow is configured 4ms
✓ scanBody (8)
✓ flags [skip ci] inherited into the landed commit body 24ms
✓ flags [ci skip] inherited into the landed commit body 24ms
✓ flags [no ci] inherited into the landed commit body 45ms
✓ flags [skip actions] inherited into the landed commit body 26ms
✓ flags [actions skip] inherited into the landed commit body 26ms
✓ flags [SKIP CI] inherited into the landed commit body 25ms
✓ passes a clean body, and a deliberate token in the SUBJECT (docs-only close) 48ms
✓ an empty or unreadable sha is an error, not a clean result 24ms
✓ bkit runs gate — PR heads, snapshot and audit rows (9)
✓ --pr gates the PR's current head 406ms
✓ --pr refuses a title carrying a skip token (18) and --record writes the refusal row 367ms
✓ --snapshot appends the pre-merge snapshot before the gate decides 436ms
✓ --snapshot scopes its run list and dev lookups to --repo 384ms
✓ --snapshot without --repo leaves its run list unscoped 383ms
✓ --squash-of gates the PR's squash commit; --capstone-only --record writes ship-merge-ci 404ms
✓ a refused capstone records FAIL with its reason 415ms
✓ an unreadable PR is an API error (20) with no head 361ms
✓ takes exactly one of --head, --pr, --squash-of 15ms
✓ bkit runs revalidate (6)
✓ --repo scopes every gh call (3)
✓ pr view, run list and the dev-protection lookups name the foreign repo 473ms
✓ without --repo no call gains a --repo flag 481ms
✓ repoScopedGh appends --repo to workflow run, leaves gh api alone, and is a no-op without a repo 0ms
✓ an unmoved head needs no CI wait: validated at the code head, nothing dispatched 436ms
✓ exits 1 when the PR head cannot be read, 80 when gh needs auth 815ms
✓ refuses an unknown --reason 73ms
❯ bkit runs context (10)
✓ BRIEF phases take the argument as the issue 399ms
✓ CI_DEV: a slug argument is the FID, on dev at origin/dev 444ms
✓ CI_DEV refuses the slug "../../etc" (exit 9) 416ms
✓ CI_DEV refuses the slug "12;rm -rf" (exit 9) 408ms
✓ CI_DEV refuses the slug "a/b" (exit 9) 415ms
✓ CI: the open PR, the CI run at its head, and the FID from the PR-body marker 454ms
✓ CI falls back to the feat/{FID} branch when the body has no marker 416ms
✓ CI refuses a PR that is not open (7) and a head with no CI run (8) 735ms
× runs context refuses an issue-less marker and branch naming the missing issue 444ms
✓ an unknown phase exits 3; gh needing auth exits 80 453ms
✓ bkit runs dispatch — the verdict row and the close transport (2)
✓ writes the step's row with its ciDispatch verdict, then the close-transport row 472ms
✓ --file and --step go together 858ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

FAIL .bkit/core/engine/commands/workflow/runs.test.ts > bkit runs context > runs context refuses an issue-less marker and branch naming the missing issue
AssertionError: expected '[bkit-runs] "dev-ci-failures" embeds …' to contain 'no issue in the PR-body marker or bra…'

- Expected

* Received

- no issue in the PR-body marker or branch FID

* [bkit-runs] "dev-ci-failures" embeds no github issue id
*

❯ .bkit/core/engine/commands/workflow/runs.test.ts:1882:27
1880| const viaMarker = await context(cwd, "ship", "42");
1881| expect(viaMarker.code).toBe(9);
1882| expect(viaMarker.err).toContain("no issue in the PR-body marker or…
| ^
1883| expect(viaMarker.json).not.toHaveProperty("issueId", null);
1884| fakeGhBin({

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

Test Files 1 failed (1)
Tests 1 failed | 144 passed (145)
Start at 12:57:32
Duration 20.88s (tests 99%, transform 1%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-dNzmTu/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
