# Brief: group 2 — Challenge round 1 findings

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
- Group 2: Challenge round 1 findings — this group
  - TASK 3: Ship Step 2 on the MCP path (exit 80) treats a PR whose only non-green check was cancelled as green and moves on, while the gh path stops on the same rollup — open
  - TASK 4: bkit-debug-failure-reproduce runs tests while it works ("with the repo's test runner and a file or name filter", a name filter alone collects the whole suite) but does not carry local-pre-commit, and the new carrier test cannot see it because it only looks for bkit:test:file or bkit tests changed — open
  - TASK 5: Three prompts now carry two rules that contradict each other while working: Local tests first says "Exhaust the local test suite", and the new Local pre-commit says never run the full suite while working — open
  - TASK 6: An audit report that quotes a leaked token lands on `dev` under a `[skip ci]` head, so no CI workflow (incl. the `bkit-trivy` secret scan) runs on that push — accepted by owner — done

## The work

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** Ship Step 2 on the MCP path (exit 80) treats a PR whose only non-green check was cancelled as green and moves on, while the gh path stops on the same rollup
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-ship.md:350` · **Round:** 1
  - **DONE WHEN:** the exit-80 sub-list of Step 2 sub-step 5 has an arm that sends a rollup holding any cancelled, action-required or stale check (none failed) to **Failure Path** without holding `/bkit-debug {FID}` as `NEXT_STEP`, placed before the **Else** → next sub-step arm, so both the `gh` path (`prs checks` counts them in `cancelled`, not green) and the MCP path stop on it; the rendered mirrors and `__snapshots__/bkit-ship.none.txt` carry the same text.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 2's exit-80 arm stops on a cancelled, action-required or stale check without naming /bkit-debug` fails on the current exit-80 sub-list, where the only bullet naming cancelled checks holds `/bkit-debug {FID}` and a cancelled-only rollup falls through to **Else** → next sub-step

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** bkit-debug-failure-reproduce runs tests while it works ("with the repo's test runner and a file or name filter", a name filter alone collects the whole suite) but does not carry local-pre-commit, and the new carrier test cannot see it because it only looks for bkit:test:file or bkit tests changed
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/instructions.md:1705` · **Round:** 1
  - **DONE WHEN:** the `### local-pre-commit` `carry` line names every build and debug prompt whose steps run tests or apply a fix (at least `bkit-debug-failure-reproduce`, plus `bkit-debug-failure-soak` if it runs tests outside its named `pnpm bkit:gate:static-unit`), `pnpm instructions:sync` has written the bullet into each, and the carrier test detects a test-running prompt by its run step (for example "Run only those tests", a test runner, or a fix-applying step), not only by the two command names.
  - **TEST FIRST:**
    - `.bkit/core/engine/tools/instructions.test.ts` `every debug prompt that runs tests by file or name filter carries local-pre-commit` fails on `bkit-debug-failure-reproduce` missing from the expanded `carry` list

<!-- bkit:task 4 end -->

<!-- bkit:task 5 start -->

- [ ] **TASK 5:** Three prompts now carry two rules that contradict each other while working: Local tests first says "Exhaust the local test suite", and the new Local pre-commit says never run the full suite while working
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/.agents/rules.md:121` · **Round:** 1
  - **DONE WHEN:** per the owner's direction, `Local tests first` stops asking for the whole local suite: it tells agents to run only the tests the change affects plus a targeted repro before remote CI, and the full suite runs only in the pre-push hook. The `local-tests-first` store entry in `.bkit/instructions.md`, `.bkit/core/.agents/rules.md` and every carrier (`bkit-build-plan-tasks`, `bkit-build-plan-verify`, `bkit-build-plan-gaps-remediate`, `bkit-debug-failure-reproduce`) hold that one wording, the old wording sits under `retired`, `pnpm instructions:sync` has nothing left to rewrite, and the rendered mirrors match.
  - **TEST FIRST:**
    - `.bkit/core/engine/tools/instructions.test.ts` `local-tests-first does not ask for the full local suite that local-pre-commit forbids while working` fails on the current `local-tests-first` text matching `/Exhaust the local test suite/`

<!-- bkit:task 5 end -->
