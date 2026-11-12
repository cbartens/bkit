Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

Coverage: partial diff coverage. The diff file showed 20 of 85 files. Of the files not shown whole, those touching input handling, secrets or owner-approval state were read with `git diff origin/dev...HEAD`: `decisions.ts`, `workflows.ts`, `junit.ts`, `worktrees.ts`, `runtime.ts`, `ci/ci.ts`, `package-manager.ts`, `tests/fixtures/gates/pnpm.cjs`, `skills-lock.json`, `.claude/skills/*` and `.bkit/core/workflows/bkit-build.md`. The two new third-party skills (`vitest` from `antfu/skills`, `typescript-advanced-types` from `wshobson/agents`) are markdown only, with no install scripts, content-hashed in `skills-lock.json`, and a scan found no embedded agent directive. The round-1 findings now planned as Tasks 15, 17, 18 and 19 hold in the diff (push-event CI only, crash reads `unknown`, hooks off only on `worktree add`, `Gate:` read from the header block, CR/LF collapsed in item text), and `dist/` matches.

Cross-reference: Task 1 against `docs/security.md` § Untrusted Content & Prompt Injection ("the load-bearing control is structural"): `decisions apply --by=headless` already refuses hard blockers in the engine (`hard blockers need the owner`), while `--by=rerun` settles them with no such check, and the Decision Pause rule "Decide nothing on the owner's behalf" is prose only on this path.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** The owner stops at a red-gate verify pause that also holds hard-blocker gaps (`test-loosened`, `exception-refused`, `no-test-first`), fixes `dev` and resumes; the resume writes `Decision: Re-run gate` under Q1 (with no loop question, that is the first hard blocker itself), sets `Status: DECIDED`, forces `VERIFY_VERDICT` = PASS, and a green re-run builds the next group with every gap unanswered
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/decisions.ts:582`
  - **DONE WHEN:** `decisions apply --by=rerun` refuses, with a usage error naming each undecided question number and the file left byte for byte unchanged, any `Gate: FAIL` file whose Q1 is not a loop question (no `## Progress` block) or that holds a question other than the loop question without a `Decision:` line; and the Contract **Resume** route in `.bkit/core/workflows/bkit-build.md:43` takes the `OPEN_GATE` = `FAIL` re-run only for a pause whose only undecided question is the loop question, else resumes at **Decision Pause** step 3 as for any open pause. Today the Decision Pause writes `--header=Gate=FAIL` whenever the base check ran (`GATE_VERDICT` = FAIL), including a `VERIFY_GAPS` pause routed without `PAUSE_LOOP` (Step 8 sub-step 11, `VERIFY_FIXABLE` = false), whose items start at Q1 (`decisions.ts:513`); `--by=rerun` writes the re-run line under Q1 and `Status: DECIDED` without `statusOf`, and the Resume route sets `VERIFY_VERDICT` = PASS, so the hard blockers the workflow says only the owner may settle are closed by a fabricated decision. The existing test `bkit decisions apply --by=rerun > records the re-run under Q1 and closes the file` composes an item-only `Gate: FAIL` file (`[ITEMS[1]]`, no `--loop`) and expects success, so it encodes this bypass and must be reshaped to a loop-only file.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=rerun > refuses a Gate: FAIL file whose Q1 is an item, not the loop question` fails on a file composed with `--header=Gate=FAIL` and `[BLOCKER]` and no `--loop` being rewritten to `Status: DECIDED` with `Decision: Re-run gate` under the blocker and exit 0, instead of exit 2 naming Q1 and the file unchanged
    - `.bkit/core/engine/commands/workflow/decisions.test.ts` `bkit decisions apply --by=rerun > refuses a loop file with an undecided item question` fails on a file composed with `--header=Gate=FAIL`, `--loop=verify` and `[BLOCKER]` being rewritten to `Status: DECIDED` with Q2 undecided and exit 0, instead of exit 2 naming Q2 and the file unchanged
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `resume facts > build re-runs a red gate pause only when the loop question is its only undecided question` fails on the Resume bullet's `OPEN_GATE` = `FAIL` route holding no condition on the pause's undecided item questions

<!-- bkit:task 1 end -->

