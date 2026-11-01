
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/commands/workflow/run-facts.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/699-engine-run-completeness

 ❯ .bkit/core/engine/commands/workflow/run-facts.test.ts (41 tests | 1 failed) 687ms
   ✓ lineClass (1)
     ✓ splits changed files into code, tests and docs 1ms
   ✓ timeBlock / minutesOf (1)
     ✓ is start to end in minutes, to one decimal 0ms
   ✓ runLines (5)
     ✓ counts code, tests and docs apart, and leaves out plans, run logs and the ledgers 108ms
     ✓ counts deleted lines into changed 121ms
     ✓ cuts at each merge on the first-parent chain, so merged-in work is not counted 206ms
     ✓ is null when first is not an ancestor of last, or either is missing 130ms
     ✓ is all zero for an empty range 56ms
   ❯ runStatusRows / stepsBlock / ciList (6)
     ✓ takes the workflow's rows from its start on, in time order 0ms
     ✓ leaves out engine-action rows (they carry no workflow) 1ms
     ✓ counts each step's rows and the minutes since the row before each; total = sum of byStep 0ms
     × leaves a run's step minutes unchanged when journal rows land between step rows 3ms
     ✓ is empty when the run has only its start row 0ms
     ✓ lists every close step's CI dispatch, in order, with outcome as status 0ms
   ✓ planBlock (6)
     ✓ counts task headings, not every `- [` line: sub-step checkboxes are not tasks 2ms
     ✓ planBlock reports converted when a convert row exists 1ms
     ✓ planBlock reads groups from the plan 1ms
     ✓ reads per task its Test first tests and distinct test files; null for a task without the field 1ms
     ✓ planTasks counts tasks per group 0ms
     ✓ is undefined when the feature has no plan file 1ms
   ✓ buildBlock (6)
     ✓ reads every verify and gaps-remediate round, the last holistic and challenge, and the red-test runs 1ms
     ✓ buildBlock keys verify attempts by group 1ms
     ✓ its totals match their parts: findings total = the four severities, redTests = the build-task-red rows 1ms
     ✓ carries the latest challenge size gate on the challenge block 1ms
     ✓ counts challenge findings from appended tasks 1ms
     ✓ counts findings once the merge ran; empty without the build's steps 1ms
   ✓ restateOutcome (3)
     ✓ appends the run's outcome again with the dispatch added to ci; it supersedes the close's 15ms
     ✓ ending is close-failed when the dispatch is unresolved 13ms
     ✓ is logged and returns false with no workflow-done row carrying parentSha, or no outcome row for it 7ms
   ✓ agentContextBlock (10)
     ✓ per agent type: the largest context of any of its subagents and how many ran 2ms
     ✓ leaves out model calls outside the run, synthetic messages and malformed lines 2ms
     ✓ context block counts calls by their own time across the run's chats 2ms
     ✓ a chat fingerprint is fp: and the first 12 hex of sha256 of `<platform>:<id>` 0ms
     ✓ runChats: the run's session fingerprints, each once, in row order 0ms
     ✓ stepsBlock skips session and owner rows when timing a step 0ms
     ✓ a subagent without a meta file counts as `unknown` 1ms
     ✓ undefined, never a throw, without a session id, a transcript or a subagent in the run 2ms
     ✓ undefined, never a throw, when a folder cannot be read 2ms
     ✓ the block passes outcome-row validation 1ms
   ✓ claudeTranscripts (1)
     ✓ reads the session id from CLAUDE_CODE_SESSION_ID and the dir from CLAUDE_CONFIG_DIR 0ms
   ✓ planFiles (2)
     ✓ a single plan is the plan file 1ms
     ✓ reads only the plan file, never {FID}-plan-N.md files; none without it 2ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/commands/workflow/run-facts.test.ts > runStatusRows / stepsBlock / ciList > leaves a run's step minutes unchanged when journal rows land between step rows
AssertionError: expected { …(2) } to deeply equal { …(2) }

- Expected
+ Received

@@ -4,13 +4,13 @@
        "n": 1,
        "totalMinutes": 1,
      },
      "build-b": {
        "n": 1,
-       "totalMinutes": 3,
+       "totalMinutes": 1,
      },
    },
    "total": {
      "n": 2,
-     "totalMinutes": 4,
+     "totalMinutes": 2,
    },
  }

 ❯ .bkit/core/engine/commands/workflow/run-facts.test.ts:233:35
    231|       step(4, "build-b"),
    232|     ];
    233|     expect(stepsBlock(journaled)).toEqual(stepsBlock(plain));
       |                                   ^
    234|   });
    235|

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed (1)
      Tests  1 failed | 40 passed (41)
   Start at  22:57:40
   Duration  1.04s (tests 70%, transform 23%, import 4%, setup 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-EHJL5E/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
