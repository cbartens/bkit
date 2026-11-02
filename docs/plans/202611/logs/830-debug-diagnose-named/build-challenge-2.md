Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A fork's green PR run can validate a still-red same-repository workflow at the pushed commit.
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/runs.ts:2138`
  - **DONE WHEN:** The additional selected-workflow gate accepts only runs whose repository and head repository match the saved repository, whose branch and commit match the verification target, and whose event matches an explicitly requested event. Missing or mismatched provenance cannot replace the same-repository result. Keep this scoped to the newly added selected-workflow verification path.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `rejects fork verification runs that shadow a red selected workflow at the same head` fails on the configured gate being green, selected-workflow run 301 being a red same-repository push, and newer run 302 being a green fork PR with the same workflow ID, head SHA and branch: the current gate returns exit 0, passed true and verifyingRunId 302. Require refusal both without an event flag and with `--event=push`, and require refusal when the head-repository identity is missing.
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `preserves the requested event for selected-workflow verification` fails on a newer green same-repository pull_request result masking the selected workflow's red push despite `--event=push`; require the push result to decide the gate and retain a same-repository matching-event success control.

<!-- bkit:task 1 end -->

Evidence: Executed a temporary, network-free fixture against the built `runsCommand.verbs.gate.run` with real argument-based subprocess execution and a fake GitHub read executable. It returned `{"code":0,"passed":true,"verifyingRunId":302}` for a green fork PR shadowing a red same-repository push, including with `event: push`. The scratch fixture was removed. The new filter checks only workflow ID and branch before `toRun` discards repository provenance; it also omits the event filter already used by the configured gate. The existing Task 8 test exercises conclusion, absence and SHA, but no fork provenance or event mismatch. Task 2's fork test covers initial selection, not this separate completion boundary.

Docs: `docs/security.md` § CI Auto-Route Trust explicitly distinguishes a same-repository trigger check from outbound lookup filtering; § Untrusted Content & Prompt Injection requires structural controls at privileged actions. `docs/testing.md` § Debug evidence and verification requires the selected workflow to pass at the exact pushed head. Repository/branch-name collisions from fork PRs must not discharge that proof.

Additional discrimination: separate temporary probes also returned exit 0 / passed true for (a) fork provenance with no event flag, (b) missing head-repository provenance, and (c) a same-repository PR event with `event: push`. The matching same-repository push success control returned exit 0. These demonstrate that both proposed tests fail on the current implementation rather than repeating its existing SHA/conclusion tests.

## Coverage and limits

This verdict has **partial diff coverage**. The supplied artifact describes `origin/dev...HEAD` as 16,032 diff lines across 97 files and contains a 7,409-line capped selection. That supplied selection was read in full. Additional targeted diffs covered every omitted production engine source touching this feature's input handling (`branches`, `worktrees`, `runs`, `status`, `tests`, `steps`, `context`, the status codec and status-hole check), their generated JavaScript, the GitHub CI/diff template and adopted context blocks, the managed context contract, and Debug/Auto workflows. The five host copies' changed lines were mechanically compared with the reviewed workflow deltas; only tracker-marker removal changed the close-comment line. The no-tracker snapshot shared the reviewed changes. Relevant changed validation tests were read to avoid duplicating planned coverage. Omitted non-security documentation, skill reference material and image/license assets were not an independent full review of their contents.

Checked security vectors: reference and repository validation, shell/process argument handling, branch adoption, fork/commit alignment, saved selection and generation boundaries, context receipt handling, output fencing and disclosure surfaces, and completion evidence integrity. No server authentication, session, database, tenant policy or cryptographic surface is introduced (`docs/security.md` § Scope / RLS and `docs/architecture.md` § What bkit Is). The retained external-content fence explicitly treats intermediate closing markers as forged; no new fence escape was established. No hardcoded secret or new outbound credential destination was found in the reviewed changes.

Supply chain: no runtime package or dependency-lock change appears in this diff. Five installed skill additions are recorded in `skills-lock.json`. Their publishers were checked at [wshobson/agents](https://github.com/wshobson/agents), [sickn33/agentic-awesome-skills](https://github.com/sickn33/agentic-awesome-skills), [antfu/skills](https://github.com/antfu/skills), and [openai/skills](https://github.com/openai/skills). The changed skill payload contains documentation and a Python GitHub read helper, with no package install lifecycle script; that helper uses subprocess argument arrays. An exact-name GitHub Advisory search returned no results, which does not establish absence of vulnerabilities or independently verify the installer download. Skill-body directives were treated as review data and were not executed.

Validation in this review was limited to the focused executable gate probes above and source/diff inspection. The full build, installation and test suite were not rerun. No fixes, source/test/plan changes, commits or pushes were made.
