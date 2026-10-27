
> @cbartens/bkit@6.0.0 bkit:test:file /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert
> vitest run --reporter=default --reporter=junit --outputFile.junit="$BKIT_TEST_REPORT" .bkit/core/engine/render/trackers.test.ts


 RUN  v5.0.3 /Users/christian/Documents/GitHub/bkit/.worktrees/705-build-plan-convert

 ❯ .bkit/core/engine/render/trackers.test.ts (102 tests | 1 failed) 41ms
   ✓ substituteWorkflow — tracker groups (9)
     ✓ keeps the chosen tracker's block; none collapses to the generic skip message 1ms
     ✓ preserves a list-number prefix on the resolved pair 0ms
     ✓ uses a pair's trailing false block under none instead of the generic stub 1ms
     ✓ resolves multiple pairs 0ms
     ✓ does not jam content that follows a pair with no trailing false block 0ms
     ✓ keeps the jira block of a three-tracker group under jira 0ms
     ✓ leaves a group without a jira block whole under jira, so its markers are orphans 0ms
     ✓ flags a lone github block (no linear) as an orphan 0ms
     ✓ flags a lone jira block (no github, linear) as an orphan 0ms
   ✓ substituteWorkflow — true/false conditionals (9)
     ✓ `true` keeps content when wired (github), removes it entirely under none (no stub) 0ms
     ✓ `true` keeps content when wired (linear), removes it entirely under none (no stub) 0ms
     ✓ `true` keeps content when wired (jira), removes it entirely under none (no stub) 0ms
     ✓ `false` keeps content only under none, removes it when wired (github) 0ms
     ✓ `false` keeps content only under none, removes it when wired (linear) 0ms
     ✓ `false` keeps content only under none, removes it when wired (jira) 0ms
     ✓ resolves a pair nested inside a `true` block 0ms
     ✓ resolves a three-tracker group nested inside a `true` block under jira 0ms
     ✓ flags an unbalanced true marker as an orphan 0ms
   ✓ real workflow sources (37)
     ✓ bkit-build resolves cleanly for github 0ms
     ✓ bkit-build resolves cleanly for linear 0ms
     ✓ bkit-build resolves cleanly for jira 0ms
     ✓ bkit-build resolves cleanly for none 0ms
     ✓ bkit-ship resolves cleanly for github 0ms
     ✓ bkit-ship resolves cleanly for linear 0ms
     ✓ bkit-ship resolves cleanly for jira 1ms
     ✓ bkit-ship resolves cleanly for none 0ms
     ✓ bkit-debug resolves cleanly for github 0ms
     ✓ bkit-debug resolves cleanly for linear 0ms
     ✓ bkit-debug resolves cleanly for jira 0ms
     ✓ bkit-debug resolves cleanly for none 0ms
     ✓ bkit-design resolves cleanly for github 1ms
     ✓ bkit-design resolves cleanly for linear 0ms
     ✓ bkit-design resolves cleanly for jira 0ms
     ✓ bkit-design resolves cleanly for none 0ms
     ✓ bkit-plan resolves cleanly for github 0ms
     ✓ bkit-plan resolves cleanly for linear 0ms
     ✓ bkit-plan resolves cleanly for jira 0ms
     ✓ bkit-plan resolves cleanly for none 0ms
     ✓ bkit-auto resolves cleanly for github 0ms
     ✓ bkit-auto resolves cleanly for linear 0ms
     ✓ bkit-auto resolves cleanly for jira 0ms
     ✓ bkit-auto resolves cleanly for none 0ms
     ✓ every github block has a matching linear and jira block; no legacy none markers remain 1ms
     ✓ bkit-build leaks no tracker-only token into the none render (#202 guard) 1ms
     ✓ bkit-ship leaks no tracker-only token into the none render (#202 guard) 0ms
     ✓ bkit-debug leaks no tracker-only token into the none render (#202 guard) 0ms
     ✓ bkit-design leaks no tracker-only token into the none render (#202 guard) 0ms
     ✓ bkit-plan leaks no tracker-only token into the none render (#202 guard) 0ms
     ✓ bkit-auto leaks no tracker-only token into the none render (#202 guard) 0ms
     ✓ bkit-build has no identical github/linear pair (should be a true block) 0ms
     ✓ bkit-ship has no identical github/linear pair (should be a true block) 0ms
     ✓ bkit-debug has no identical github/linear pair (should be a true block) 0ms
     ✓ bkit-design has no identical github/linear pair (should be a true block) 0ms
     ✓ bkit-plan has no identical github/linear pair (should be a true block) 0ms
     ✓ bkit-auto has no identical github/linear pair (should be a true block) 0ms
   ✓ issue-less runs render only under a wired tracker (20)
     ✓ bkit-design: the none render carries none of the issue-less machinery 0ms
     ✓ bkit-design: the github render keeps the warning bullet once and the recovery in Step 1 0ms
     ✓ bkit-design: the linear render keeps the warning bullet once and the recovery in Step 1 0ms
     ✓ bkit-design: the jira render keeps the warning bullet once and the recovery in Step 1 0ms
     ✓ bkit-plan: the none render carries none of the issue-less machinery 0ms
     ✓ bkit-plan: the github render keeps the warning bullet once and the recovery in Step 1 0ms
     ✓ bkit-plan: the linear render keeps the warning bullet once and the recovery in Step 1 0ms
     ✓ bkit-plan: the jira render keeps the warning bullet once and the recovery in Step 1 0ms
     ✓ bkit-build: the none render carries none of the issue-less machinery 0ms
     ✓ bkit-build: the github render keeps the warning bullet once and the recovery in Step 1 0ms
     ✓ bkit-build: the linear render keeps the warning bullet once and the recovery in Step 1 0ms
     ✓ bkit-build: the jira render keeps the warning bullet once and the recovery in Step 1 0ms
     ✓ bkit-debug: the none render carries none of the issue-less machinery 0ms
     ✓ bkit-debug: the github render keeps the warning bullet once and the recovery in Step 1 0ms
     ✓ bkit-debug: the linear render keeps the warning bullet once and the recovery in Step 1 0ms
     ✓ bkit-debug: the jira render keeps the warning bullet once and the recovery in Step 1 0ms
     ✓ bkit-ship: the none render carries none of the issue-less machinery 0ms
     ✓ bkit-ship: the github render keeps the warning bullet once and the recovery in Step 1 0ms
     ✓ bkit-ship: the linear render keeps the warning bullet once and the recovery in Step 1 0ms
     ✓ bkit-ship: the jira render keeps the warning bullet once and the recovery in Step 1 0ms
   ❯ none render baselines (5)
     ✓ bkit-design: the none render matches its baseline byte for byte 1ms
     ✓ bkit-plan: the none render matches its baseline byte for byte 1ms
     × bkit-build: the none render matches its baseline byte for byte 3ms
     ✓ bkit-debug: the none render matches its baseline byte for byte 1ms
     ✓ bkit-ship: the none render matches its baseline byte for byte 1ms
   ✓ real prompt sources (10)
     ✓ every prompt resolves cleanly for github 6ms
     ✓ every prompt resolves cleanly for linear 2ms
     ✓ every prompt resolves cleanly for jira 1ms
     ✓ every prompt resolves cleanly for none 2ms
     ✓ source frontmatter carries no bare HTML-comment line (invalid YAML) 1ms
     ✓ roadmap agent gets only the chosen tracker's read tools 0ms
     ✓ tracker agent gets only the chosen tracker's read and field-write tools 0ms
     ✓ audit agent gets only the chosen tracker's comment and search tools 0ms
     ✓ audit agent searches for the template's audit parent only when a tracker is wired 0ms
     ✓ audit agent posts its summary only when a tracker is wired 0ms
   ✓ issue-scan call sites (#135) (12)
     ✓ bkit-design wires a github scan whose hits the engine reads 0ms
     ✓ bkit-design wires a linear scan whose hits the engine reads 0ms
     ✓ bkit-design wires a jira scan whose hits the engine reads 0ms
     ✓ bkit-design omits the scan entirely under none (no tracker call) 0ms
     ✓ bkit-plan wires a github scan whose hits the engine reads 0ms
     ✓ bkit-plan wires a linear scan whose hits the engine reads 0ms
     ✓ bkit-plan wires a jira scan whose hits the engine reads 0ms
     ✓ bkit-plan omits the scan entirely under none (no tracker call) 0ms
     ✓ bkit-debug wires a github scan whose hits the engine reads 0ms
     ✓ bkit-debug wires a linear scan whose hits the engine reads 0ms
     ✓ bkit-debug wires a jira scan whose hits the engine reads 0ms
     ✓ bkit-debug omits the scan entirely under none (no tracker call) 0ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  .bkit/core/engine/render/trackers.test.ts > none render baselines > bkit-build: the none render matches its baseline byte for byte
Error: Snapshot `none render baselines > bkit-build: the none render matches its baseline byte for byte 1` mismatched

- Expected
+ Received

@@ -322,30 +322,35 @@
  1. Resolve plan base commit and collect code landed since:
     ```bash
     "{BKIT}" branches anchor-read --file=docs/plans/{YYYYMM}/{FID}-plan.md --field=baseSha --against=origin/dev
     ```
     Route:
-    - **If** exit 12 → Step 6.
-    - **If** exit 0 → hold `value` as `{BASE_SHA}` → sub-step 2.
+    - **If** exit 12 → sub-step 2.
+    - **If** exit 0 → hold `value` as `{BASE_SHA}` → sub-step 3.
     - **Else** → **Failure Path**.
- 2. **Subagent:** Invoke `@bkit-build-plan-current` using `Agent` tool:
+ 2. No plan anchor: finish the step with no agent and no artifact, its comment naming the skip:
+    ```bash
+    "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --number=5 --post --title="Plan Current" --comment-field="Status=skipped (no plan anchor)" --message="chore({FID}): plan-current skipped"
+    ```
+    Every outcome → Step 6.
+ 3. **Subagent:** Invoke `@bkit-build-plan-current` using `Agent` tool:
     Context: You are a subagent in the Build phase. Switch into working directory `cd "{WORKTREE_PATH}"` → verify with `pwd` → use for all subsequent file operations. The plan was written against base commit `{BASE_SHA}`; judge it against `origin/dev`.
     Read: `docs/plans/{YYYYMM}/{FID}-plan.md`.
     Create: `docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md`.
- 3. Finish:
+ 4. Finish:
     ```bash
     "{BKIT}" steps finish --workflow=build --step=build-plan-current --file="{STATUS}" --attempt=1 --agent=bkit-build-plan-current --artifact=docs/plans/{YYYYMM}/logs/{FID}/build-plan-current.md --number=5 --post --title="Plan Current" --message="chore({FID}): plan-current"
     ```
- 4. **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 7`. Every verdict → Step 6.
+ 5. **If** `verdict` = CONCERNS or FAIL → emit plan-currency advisory `[bkit-build] plan currency {verdict} — {fields.Affected} affected task(s); build continues, findings carried into Step 7`. Every verdict → Step 6.

  ### 🔒 Gate 5 — Plan Current

- - [ ] Base commit resolved
- - [ ] Subagent invoked (`@bkit-build-plan-current`, no inline work)
+ - [ ] Base commit resolved, or the missing anchor named as the skip
+ - [ ] Subagent invoked (`@bkit-build-plan-current`, no inline work) when the base commit resolved
  - [ ] Mechanical checks passed (`steps finish`)
  - [ ] Plan not revised
- - [ ] Advisory emitted
+ - [ ] Advisory emitted when the base commit resolved

  ---

  ## 🧠 Step 6 — Install Skills


 ❯ .bkit/core/engine/render/trackers.test.ts:379:7
    377|     it(`${wf}: the none render matches its baseline byte for byte`, as…
    378|       const out = substituteWorkflow(source(wf), "none").output;
    379|       await expect(out).toMatchFileSnapshot(path.join(BASELINES, `${wf…
       |       ^
    380|     });
    381|   }

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


  Snapshots  1 failed
 Test Files  1 failed (1)
      Tests  1 failed | 101 passed (102)
   Start at  13:00:05
   Duration  125ms (tests 54%, transform 34%, setup 5%, import 5%, worker 2%)

JUNIT report written to /var/folders/td/lj74ml2d0jz3thjqszy13trh0000gn/T/bkit-test-report-gPcpaN/junit.xml
 ELIFECYCLE  Command failed with exit code 1.
