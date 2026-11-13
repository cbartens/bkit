Verdict: CONCERNS
Failures: 1
Fingerprint: 38b37722230b24dfb7c03380ba94de6eeb3ce8649d2737a003c3a5b1ebd64a2e
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

Full diff `tmp/bkit-diff-930-build-tick-green.md` (not partial): `gappedTasks` in `.bkit/core/engine/commands/workflow/tasks.ts`, its `dist/commands/workflow/tasks.js` build, and two new cases in `.bkit/core/engine/commands/workflow/tasks.test.ts`. Docs read: `.agents/docs.md`, `docs/security.md` (§ Untrusted Content & Prompt Injection, § Shell Injection, § PII, § RLS).

## Notes

- The finding is an integrity weakening of a mechanical gate. The green report is written by `writeAuditReport` (`.bkit/core/engine/commands/workflow/tests.ts:1461`), which interpolates `g.detail` raw into each gap line. For a `not-green` gap, `detail` comes from `judgeGreen` and carries the JUnit failure `message` attribute (`.bkit/core/engine/commands/workflow/junit.ts:122`, XML-decoded, so `&#10;` becomes a real newline). Test code is written by the build agent, which ingests untrusted text, so the failure message is agent-controlled. Before this diff a whole-text scan still caught later gap lines; the new section slice stops at the first line starting `## `, so one crafted or merely markdown-heavy failure message hides every gap rendered after it. Impact is bounded: `tasks tick` also intersects with the verifier's `VERIFIED_TASKS`, and routing still follows the verify verdict and group gate, so the result is a wrongly ticked task box rather than a bypassed merge gate. Hence LOW.
- Checked and not a finding: a report with no `## Gaps` heading now yields no gaps (fail-open), but the engine writer always emits the heading and any agent able to edit the report could delete gap lines anyway, so it opens no new path. A forged earlier `## Gaps` heading is not reachable: everything rendered before the real heading (header, plan path, table cells of task number, test path and state) is single-line engine or plan text.
- No change to auth, sessions, permissions, data-access policies, secrets, logging, dependencies or subprocess calls. The three new regexes are linear (no ReDoS). `--green` path handling (`path.resolve` + `readFileSync`) is unchanged by the diff. `dist/commands/workflow/tasks.js` matches the source change.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A failing test whose JUnit failure message holds a line starting `## ` ends the parsed `## Gaps` section early, so every later gap in the report is dropped and `bkit tasks tick --green` ticks those not-green tasks as done
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tasks.ts:112` · **Round:** 1
  - **DONE WHEN:** `gappedTasks` returns every `- Task N` gap line of the report even when an earlier gap's detail spans lines and one of them starts with `## ` (for example the writer at `.bkit/core/engine/commands/workflow/tests.ts:1498` folds newlines in `detail` and `logLine` onto the gap line, or the parser fails closed when it finds fewer gap lines than the header `Gaps: N`), and the new test passes
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `keeps a later Gaps task unticked when an earlier gap detail holds a ## line` fails on task 9 appearing in `ticked` for a `Gaps: 2` report whose task 8 gap detail carries a `\n## Updated tests\n` line before the task 9 gap line
<!-- bkit:task 1 end -->
