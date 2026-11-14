# Build agents' test runs while working Implementation Plan

## Context & Goals

The `Local pre-commit` rule covers only the run before a commit, so build and debug agents pick their own wide test commands while they work and hold the machine-wide tests lock (#920). The rule is reworded to cover runs made while working, and the five build and debug prompts that run tests each carry the whole bullet.

**Related Issues:**

- #920 — Build agents' test runs while working (open)
- #744 — Build agents re-run the whole unit suite after every change
- #822 — Route raw test-runner commands through the tests lock per host (out of scope)
- #916 — Tests lock: waiting runs win at random (out of scope)

## Documentation Consultation

<!-- prettier-ignore -->
| Topic | Path | Section used | Coverage | Gap | Action |
| --- | --- | --- | --- | --- | --- |
| architecture | `docs/architecture.md` | n/a | not applicable: no boundary or package changes | none | none |
| technology | `docs/technology.md` | n/a | not applicable: no new library or convention | none | none |
| security | `docs/security.md` | n/a | not applicable: no auth, input or secret change | none | none |
| testing | `docs/testing.md` | `## Tests lock` | covers which runs take the lock (light runs take none) | none | none; the rule text lives in `.agents/rules.md` and `.bkit/instructions.md` |

## Documentation Warnings

```jsonl

```

## Reuse Inventory

<!-- prettier-ignore -->
| Capability | Searches run | Decision | File | Reason |
| --- | --- | --- | --- | --- |
| Rule text covering test runs made while working | text search for `Local pre-commit` in `.bkit/core/.agents/rules.md` and `.bkit/instructions.md`; read both | EXTEND | `.bkit/core/.agents/rules.md` | reword the existing bullet |
| Store entry, retired wording and `carry` list | read `### local-pre-commit` and the `### local-tests-first` `carry` example in `.bkit/instructions.md` | EXTEND | `.bkit/instructions.md` | existing entry gains text, retired line and `carry` |
| Corpus checks for the rule and its carriers | read `.bkit/core/engine/tools/instructions.test.ts` | EXTEND | `.bkit/core/engine/tools/instructions.test.ts` | existing corpus suite gains two tests |
| Rule bullet in the five prompts | read `**Rules:**` blocks; `pnpm instructions:sync` writes carried bullets | EXTEND | `.bkit/core/prompts/bkit-build-plan-tasks.md` | existing prompt gains the bullet |

## Derived Test Matrix

<!-- prettier-ignore -->
| Test description | Type | Target file | Task |
| --- | --- | --- | --- |
| every build and debug prompt that runs tests carries `local-pre-commit` | Unit | `.bkit/core/engine/tools/instructions.test.ts` | 1 |
| `local-pre-commit` covers test runs made while working, not only before a commit | Unit | `.bkit/core/engine/tools/instructions.test.ts` | 1 |
| Step 2's exit-80 arm stops on a cancelled, action-required or stale check without naming /bkit-debug | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 3 |
| every debug prompt that runs tests by file or name filter carries local-pre-commit | Unit | `.bkit/core/engine/tools/instructions.test.ts` | 4 |
| local-tests-first does not ask for the full local suite that local-pre-commit forbids while working | Unit | `.bkit/core/engine/tools/instructions.test.ts` | 5 |
| .bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → blocked before any gate | Integration | `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` | 6 |
| Step 2's exit-80 arm continues only when every check passed and sends a timed-out, startup-failure or error check to /bkit-debug | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 7 |
| bkit-debug-failure-reproduce runs its tests by naming each test file and asks for no unnamed wider run | Unit | `.bkit/core/engine/tools/instructions.test.ts` | 8 |
| Step 2's exit-80 arm reads check-run conclusions, not the combined commit status | Unit | `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` | 9 |

## Agent Execution Runbook

<!-- bkit:group 1 start -->

### TASK GROUP 1: Narrow test runs while agents work

<!-- bkit:task 1 start -->

- [x] **TASK 1:** Reword `Local pre-commit` to cover runs made while working, and make the build and debug prompts carry it
  - **UPDATE:** `.bkit/core/.agents/rules.md`: reword the `Local pre-commit` bullet: before a commit and while working, run only the tests the change affects, naming each test file, never a folder, a pattern, the full suite or a `bkit:gate:*` script; a `/bkit-*` step's named command is its only wider run; no test runner or stack named
  - **UPDATE:** `.bkit/instructions.md`: in `### local-pre-commit`, the new text, the old text added under `retired`, and a `- carry:` line naming `bkit-build-plan-tasks`, `bkit-build-plan-tests`, `bkit-build-plan-verify`, `bkit-build-plan-gaps-remediate` and `bkit-debug-failure-remediate`
  - **UPDATE:** `.bkit/core/engine/tools/instructions.test.ts`: add the two tests below
  - **READ:** `.bkit/instructions.md`: `## Format` (rule section lines, the `carry` relation)
  - **READ:** `.bkit/authoring.md`: § Which Sections Apply, § Before You Save
  - **DONE WHEN:** the store entry and the `rules.md` bullet hold the same new text, and the five prompts are listed under `carry`
  - **TEST FIRST:**
    - `.bkit/core/engine/tools/instructions.test.ts` `every build and debug prompt that runs tests carries local-pre-commit` fails on a prompt that runs tests but is missing from the rule's `carry` list
    - `.bkit/core/engine/tools/instructions.test.ts` `local-pre-commit covers test runs made while working, not only before a commit` fails on rule text that limits itself to before a commit

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [x] **TASK 2:** Copy the reworded rule into the prompts, mirrors and installed rules file
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-tasks.md`: the `**Rules:**` block gains the bullet, written by `pnpm instructions:sync`, not by hand
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-tests.md`: same, written by `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-verify.md`: same, written by `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/prompts/bkit-build-plan-gaps-remediate.md`: same, written by `pnpm instructions:sync`
  - **UPDATE:** `.bkit/core/prompts/bkit-debug-failure-remediate.md`: same, written by `pnpm instructions:sync`
  - **UPDATE:** `.agents/rules.md`: rewritten by `pnpm bkit:generate`, along with the host mirrors
  - **DEPENDS ON:** 1
  - **DONE WHEN:** `.bkit/core/engine/tools/instructions.test.ts` `has no findings` and `sync has nothing left to rewrite` pass, and `bkit check` reports no mirror drift
  - **TEST FIRST:** n/a — generated copies, checked by the existing corpus tests named in DONE WHEN

<!-- bkit:task 2 end -->

<!-- bkit:group 1 end -->

<!-- bkit:group 2 start -->

### TASK GROUP 2: Challenge round 1 findings

<!-- bkit:task 3 start -->

- [x] **TASK 3:** Ship Step 2 on the MCP path (exit 80) treats a PR whose only non-green check was cancelled as green and moves on, while the gh path stops on the same rollup
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-ship.md:350` · **Round:** 1
  - **DONE WHEN:** the exit-80 sub-list of Step 2 sub-step 5 has an arm that sends a rollup holding any cancelled, action-required or stale check (none failed) to **Failure Path** without holding `/bkit-debug {FID}` as `NEXT_STEP`, placed before the **Else** → next sub-step arm, so both the `gh` path (`prs checks` counts them in `cancelled`, not green) and the MCP path stop on it; the rendered mirrors and `__snapshots__/bkit-ship.none.txt` carry the same text.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 2's exit-80 arm stops on a cancelled, action-required or stale check without naming /bkit-debug` fails on the current exit-80 sub-list, where the only bullet naming cancelled checks holds `/bkit-debug {FID}` and a cancelled-only rollup falls through to **Else** → next sub-step

<!-- bkit:task 3 end -->
<!-- bkit:task 4 start -->

- [x] **TASK 4:** bkit-debug-failure-reproduce runs tests while it works ("with the repo's test runner and a file or name filter", a name filter alone collects the whole suite) but does not carry local-pre-commit, and the new carrier test cannot see it because it only looks for bkit:test:file or bkit tests changed
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/instructions.md:1705` · **Round:** 1
  - **DONE WHEN:** the `### local-pre-commit` `carry` line names every build and debug prompt whose steps run tests or apply a fix (at least `bkit-debug-failure-reproduce`, plus `bkit-debug-failure-soak` if it runs tests outside its named `pnpm bkit:gate:static-unit`), `pnpm instructions:sync` has written the bullet into each, and the carrier test detects a test-running prompt by its run step (for example "Run only those tests", a test runner, or a fix-applying step), not only by the two command names.
  - **TEST FIRST:**
    - `.bkit/core/engine/tools/instructions.test.ts` `every debug prompt that runs tests by file or name filter carries local-pre-commit` fails on `bkit-debug-failure-reproduce` missing from the expanded `carry` list

<!-- bkit:task 4 end -->
<!-- bkit:task 5 start -->

- [x] **TASK 5:** Three prompts now carry two rules that contradict each other while working: Local tests first says "Exhaust the local test suite", and the new Local pre-commit says never run the full suite while working
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/.agents/rules.md:121` · **Round:** 1
  - **DONE WHEN:** per the owner's direction, `Local tests first` stops asking for the whole local suite: it tells agents to run only the tests the change affects plus a targeted repro before remote CI, and the full suite runs only in the pre-push hook. The `local-tests-first` store entry in `.bkit/instructions.md`, `.bkit/core/.agents/rules.md` and every carrier (`bkit-build-plan-tasks`, `bkit-build-plan-verify`, `bkit-build-plan-gaps-remediate`, `bkit-debug-failure-reproduce`) hold that one wording, the old wording sits under `retired`, `pnpm instructions:sync` has nothing left to rewrite, and the rendered mirrors match.
  - **TEST FIRST:**
    - `.bkit/core/engine/tools/instructions.test.ts` `local-tests-first does not ask for the full local suite that local-pre-commit forbids while working` fails on the current `local-tests-first` text matching `/Exhaust the local test suite/`

<!-- bkit:task 5 end -->
<!-- bkit:task 6 start -->

- [x] **TASK 6:** An audit report that quotes a leaked token lands on `dev` under a `[skip ci]` head, so no CI workflow (incl. the `bkit-trivy` secret scan) runs on that push — accepted by owner
      **Severity:** MEDIUM · **Class:** architectural · **Fixable:** false · **Location:** `.bkit/core/engine/commands/ci/ci.ts:614` · **Round:** 1
  - **DONE WHEN:** No agent can settle it: `minPushPathspecs` feeds both the light local gate and the `.husky/pre-push` dev / main skip-CI guard, so adding `docs/audits/**` to the floor also lets audit reports (written from untrusted logs, CI runs and runtime evidence) reach `dev` with every workflow suppressed. The owner decides whether audit reports may skip CI on `dev` (record the accepted risk in `docs/decisions.jsonl` and `docs/security.md`), or whether the skip-CI guard gets its own narrower allow-list that keeps `docs/audits/**` and the audit-template project-section exception on the light local gate but requires a CI run on `dev` / `main`.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → blocked before any gate` fails on the pre-push hook exiting 0 for a `docs/audits/202611/security.md`-only push to `refs/heads/dev` whose head carries `[skip ci]`, because `bkit ci min-push --ref` now counts `docs/audits/**` as what bkit writes
  - **TEST EXCEPTION:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.bkit/templates/.husky/pre-push: audit report to dev under a [skip ci] head → blocked before any gate` — the owner's q2 answer accepted that audit reports may skip CI on `dev`, so the behaviour this test describes no longer exists and it cannot fail first; the `allowed, light gate` test covers the accepted behaviour (owner, 2026-11-14)

<!-- bkit:task 6 end -->
<!-- bkit:group 2 end -->

<!-- bkit:group 3 start -->

### TASK GROUP 3: Challenge round 2 findings

<!-- bkit:task 7 start -->

- [x] **TASK 7:** On the MCP path (exit 80) a PR whose only non-green check timed out, hit a startup failure or reports a commit status of `error` matches none of the stop arms and falls to Else → next sub-step as green, while the gh path counts the same check as failed
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-ship.md:353` · **Round:** 2
  - **DONE WHEN:** the exit-80 sub-list of Step 2 sub-step 5 continues to the next sub-step only when every check passed (success, neutral or skipped, the `PASS_STATES` of `checksFor` in `.bkit/core/engine/commands/workflow/prs.ts:839`), and any other finished check that is not cancelled, action required or stale (failure, timed out, startup failure, a commit status of `error`) holds `/bkit-debug {FID}` as `NEXT_STEP` → **Failure Path**, so the MCP path denies by default the way the gh path does; the rendered mirrors and `__snapshots__/bkit-ship.none.txt` carry the same text.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 2's exit-80 arm continues only when every check passed and sends a timed-out, startup-failure or error check to /bkit-debug` fails on the current exit-80 sub-list, where no sub-bullet names timed out, startup failure or error and the `- **Else** → next sub-step` bullet has no every-check-passed condition

<!-- bkit:task 7 end -->
<!-- bkit:task 8 start -->

- [x] **TASK 8:** bkit-debug-failure-reproduce now carries Local pre-commit, but its step 6 still allows "a file or name filter" with the raw test runner and its PASS mapping asks it to show "other tests are unaffected", so the agent runs a name filter alone or a wider suite (the whole suite collected) with no named command to excuse it
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/prompts/bkit-debug-failure-reproduce.md:74` · **Round:** 2
  - **DONE WHEN:** step 6 runs the new tests by naming each test file (through `bkit:test:file` when `package.json` declares it, a name filter only on top of the file), and the `PASS` mapping at `:84` drops "other tests are unaffected" or names the command that checks it; the corpus tests stay green and the rendered mirrors match.
  - **TEST FIRST:**
    - `.bkit/core/engine/tools/instructions.test.ts` `bkit-debug-failure-reproduce runs its tests by naming each test file and asks for no unnamed wider run` fails on the current prompt holding "a file or name filter" in step 6 and "other tests are unaffected" in the `PASS` mapping

<!-- bkit:task 8 end -->
<!-- bkit:task 9 start -->

- [x] **TASK 9:** On the MCP path (exit 80) ship Step 2 reads `pull_request_read` `get_status`, the combined commit status, which carries no GitHub Actions check runs and no cancelled, action-required or stale state, so a PR whose `bkit-trivy` secret scan was cancelled, awaits approval or failed reaches Step 3 when any other commit status is green
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-ship.md:349` · **Round:** 2
  - **DONE WHEN:** Step 2 sub-step 5's exit-80 arm and the **gh MCP fallback** mapping for `bkit prs checks --number` (the shared clause in `.bkit/instructions.md`, carried into `bkit-ship`, `bkit-build`, `bkit-debug`, `bkit-plan`, `bkit-design`) read check-run conclusions for the PR head (`pull_request_read` `get_check_runs`, or `actions_list` runs for the head SHA), not `get_status`, so the cancelled / action-required / stale arm and the concluded-failure arm can match on the MCP path as they do on the `gh` path; mirrors and `__snapshots__/bkit-ship.none.txt` carry the same text.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 2's exit-80 arm reads check-run conclusions, not the combined commit status` fails on the exit-80 arm line naming `get_status` and naming neither `get_check_runs` nor `actions_list`

<!-- bkit:task 9 end -->
<!-- bkit:group 3 end -->
