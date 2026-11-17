# Brief: group 3 — Challenge round 2 findings

Plan: Build agents' test runs while working Implementation Plan

## Why and what

### Context & Goals

The `Local pre-commit` rule covers only the run before a commit, so build and debug agents pick their own wide test commands while they work and hold the machine-wide tests lock (#920). The rule is reworded to cover runs made while working, and the five build and debug prompts that run tests each carry the whole bullet.

**Related Issues:**

- #920 — Build agents' test runs while working (open)
- #744 — Build agents re-run the whole unit suite after every change
- #822 — Route raw test-runner commands through the tests lock per host (out of scope)
- #916 — Tests lock: waiting runs win at random (out of scope)

## Where it fits

- Group 1: Narrow test runs while agents work — done
  - TASK 1: Reword `Local pre-commit` to cover runs made while working, and make the build and debug prompts carry it — done
  - TASK 2: Copy the reworded rule into the prompts, mirrors and installed rules file — done
- Group 2: Challenge round 1 findings — done
  - TASK 3: Ship Step 2 on the MCP path (exit 80) treats a PR whose only non-green check was cancelled as green and moves on, while the gh path stops on the same rollup — done
  - TASK 4: bkit-debug-failure-reproduce runs tests while it works ("with the repo's test runner and a file or name filter", a name filter alone collects the whole suite) but does not carry local-pre-commit, and the new carrier test cannot see it because it only looks for bkit:test:file or bkit tests changed — done
  - TASK 5: Three prompts now carry two rules that contradict each other while working: Local tests first says "Exhaust the local test suite", and the new Local pre-commit says never run the full suite while working — done
  - TASK 6: An audit report that quotes a leaked token lands on `dev` under a `[skip ci]` head, so no CI workflow (incl. the `bkit-trivy` secret scan) runs on that push — accepted by owner — done
- Group 3: Challenge round 2 findings — this group
  - TASK 7: On the MCP path (exit 80) a PR whose only non-green check timed out, hit a startup failure or reports a commit status of `error` matches none of the stop arms and falls to Else → next sub-step as green, while the gh path counts the same check as failed — open
  - TASK 8: bkit-debug-failure-reproduce now carries Local pre-commit, but its step 6 still allows "a file or name filter" with the raw test runner and its PASS mapping asks it to show "other tests are unaffected", so the agent runs a name filter alone or a wider suite (the whole suite collected) with no named command to excuse it — open
  - TASK 9: On the MCP path (exit 80) ship Step 2 reads `pull_request_read` `get_status`, the combined commit status, which carries no GitHub Actions check runs and no cancelled, action-required or stale state, so a PR whose `bkit-trivy` secret scan was cancelled, awaits approval or failed reaches Step 3 when any other commit status is green — open

## The work

<!-- bkit:task 7 start -->
- [ ] **TASK 7:** On the MCP path (exit 80) a PR whose only non-green check timed out, hit a startup failure or reports a commit status of `error` matches none of the stop arms and falls to Else → next sub-step as green, while the gh path counts the same check as failed
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-ship.md:353` · **Round:** 2
  - **DONE WHEN:** the exit-80 sub-list of Step 2 sub-step 5 continues to the next sub-step only when every check passed (success, neutral or skipped, the `PASS_STATES` of `checksFor` in `.bkit/core/engine/commands/workflow/prs.ts:839`), and any other finished check that is not cancelled, action required or stale (failure, timed out, startup failure, a commit status of `error`) holds `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**, so the MCP path denies by default the way the gh path does; the rendered mirrors and `__snapshots__/bkit-ship.none.txt` carry the same text.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 2's exit-80 arm continues only when every check passed and sends a timed-out, startup-failure or error check to /bkit-debug` fails on the current exit-80 sub-list, where no sub-bullet names timed out, startup failure or error and the `- **Else** → next sub-step` bullet has no every-check-passed condition
<!-- bkit:task 7 end -->

<!-- bkit:task 8 start -->
- [ ] **TASK 8:** bkit-debug-failure-reproduce now carries Local pre-commit, but its step 6 still allows "a file or name filter" with the raw test runner and its PASS mapping asks it to show "other tests are unaffected", so the agent runs a name filter alone or a wider suite (the whole suite collected) with no named command to excuse it
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/prompts/bkit-debug-failure-reproduce.md:74` · **Round:** 2
  - **DONE WHEN:** step 6 runs the new tests by naming each test file (through `bkit:test:file` when `package.json` declares it, a name filter only on top of the file), and the `PASS` mapping at `:84` drops "other tests are unaffected" or names the command that checks it; the corpus tests stay green and the rendered mirrors match.
  - **TEST FIRST:**
    - `.bkit/core/engine/tools/instructions.test.ts` `bkit-debug-failure-reproduce runs its tests by naming each test file and asks for no unnamed wider run` fails on the current prompt holding "a file or name filter" in step 6 and "other tests are unaffected" in the `PASS` mapping
<!-- bkit:task 8 end -->

<!-- bkit:task 9 start -->
- [ ] **TASK 9:** On the MCP path (exit 80) ship Step 2 reads `pull_request_read` `get_status`, the combined commit status, which carries no GitHub Actions check runs and no cancelled, action-required or stale state, so a PR whose `bkit-trivy` secret scan was cancelled, awaits approval or failed reaches Step 3 when any other commit status is green
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-ship.md:349` · **Round:** 2
  - **DONE WHEN:** Step 2 sub-step 5's exit-80 arm and the **gh MCP fallback** mapping for `bkit prs checks --number` (the shared clause in `.bkit/instructions.md`, carried into `bkit-ship`, `bkit-build`, `bkit-debug`, `bkit-plan`, `bkit-design`) read check-run conclusions for the PR head (`pull_request_read` `get_check_runs`, or `actions_list` runs for the head SHA), not `get_status`, so the cancelled / action-required / stale arm and the concluded-failure arm can match on the MCP path as they do on the `gh` path; mirrors and `__snapshots__/bkit-ship.none.txt` carry the same text.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 2's exit-80 arm reads check-run conclusions, not the combined commit status` fails on the exit-80 arm line naming `get_status` and naming neither `get_check_runs` nor `actions_list`
<!-- bkit:task 9 end -->
