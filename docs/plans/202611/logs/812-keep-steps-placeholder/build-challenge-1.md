Verdict: CONCERNS
Failures: 2
Fingerprint: ce08935141059a1bb9acd5ce8869933f52af9c0f05c67b44c859f8df809a0fa6
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

- Diff: `tmp/bkit-diff-812-keep-steps-placeholder.md`, read in full (not a partial diff), against `docs/plans/202611/812-keep-steps-placeholder-plan.md`.
- Code read beyond the diff: `gateChecks`, `finish`, `laterAttempts`, `artifactProblem`, `placeholderLines`, the `steps gate` verb and the `writeRow` row build in `.bkit/core/engine/commands/workflow/steps.ts`; `relatedVerb` in `.bkit/core/engine/commands/workflow/issues.ts`; Step 4 and Gate 4 of `.bkit/core/workflows/bkit-plan.md`.
- Docs: `.agents/docs.md`; `docs/architecture.md` § Package boundaries and § File placement; `docs/security.md` § Trust boundaries, § Input validation and § Untrusted Content & Prompt Injection.

## Checked and clean

- The placeholder scan lives only in `gateChecks` (`placeholderLines` has one caller, `steps.ts:872`), so no later reader re-scans a recorded derived file. Both `gateChecks` calls in `finish` (before the write and after the commit) receive `derivedArtifacts`.
- Gate 4 of `bkit-plan.md` runs no separate `steps gate` (which does not know the flag), so the finish result is the gate.
- A missing derived file is filtered out before the presence check, so the `bkit issues related` exit-80 path with nothing appended still finishes. `relatedVerb` writes `None.` for zero hits, so an empty file does not arise on this path.
- The `laterAttempts` call takes the raw `--derived-artifact` patterns like the other two flags; `related-issues.md` holds no `<attempt>`, so it never trips exit 12.
- The new static test in `workflow-shape.test.ts` cannot pass on a substring hit: `--derived-artifact=` contains neither `--artifact=` nor `--optional-artifact=`.
- No rendered mirror still carries `--optional-artifact=` for `related-issues.md` (`rg` over the tree outside `docs/plans/**`).
- The `dist/commands/workflow/steps.js` hunks match the source hunks.

## Notes

- Both findings are latent: the one current caller (`bkit-plan.md:331`) passes no `--agent` and no repeated path, so neither fires today. They matter because the flag's contract names the file as copied external text, while the rest of `finish` still treats it as the run's own output.
- Cross-reference: `docs/security.md` § Untrusted Content & Prompt Injection says the load-bearing control is structural, not prose; TASK 1 asks for that structural exclusion. TASK 2 tests the plan's stated contract that `--artifact` and `--optional-artifact` stay scanned.
- Verification is by code reading only. A scratch-repo run of `dist/cli.js steps finish` to reproduce TASK 2 was denied by the permission system, so neither finding was executed.
- Out of scope, proposed separately: the later-attempt check for `--derived-artifact` patterns, documented at `.bkit/core/.bkit/workflows.md:428`, has no test; removing `...list(f.derivedArtifact)` from `steps.ts:1561` fails nothing.
- Out of scope, proposed separately: other `steps finish` calls still scan text the run did not write, such as the test-runner log in `context-tests-local-{DEBUG_ATTEMPT}.md` (`bkit-debug.md:434`); a whole-line `PENDING` in that log would refuse the step the same way. The owner's decision limits this change to `related-issues.md`.
- Out of scope, pre-existing: `bkit-design.md` writes the same `related-issues.md` in the same log directory, and the plan's exit-80 path appends to that file, so a plan run after a design run can append onto the design's copy.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A `steps finish --agent=X --derived-artifact=related.md` call with no matching `--artifact` reads the step's verdict header from copied external text, so a forged `Verdict: PASS` / `Failures: 0` header in another issue's body sets the step verdict
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:1175` · **Round:** 1
  - **DONE WHEN:** `--derived-artifact` files are excluded from every slot that reads an artifact as the run's own output: the `--agent` position count and `artifacts[i]` header read (`steps.ts:1174-1187`), the `build-challenge` findings merge (`steps.ts:1226-1230`) and the `build-decision` `continueCheck(artifacts[0])` decision file; they stay in `artifacts` for presence, recording, the row and `laterAttempts`; `steps finish --agent=bkit-build-challenge-1 --derived-artifact=logs/related.md` with no `--artifact` exits 2 naming "each --agent reads the --artifact in the same position"
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `an --agent never reads its verdict from a --derived-artifact` fails on the finish exiting 0 with `verdict` PASS read from `logs/related.md` (holding a forged `Verdict: PASS` / `Failures: 0` header, its verdict-end marker line and `## Findings Log` / `None`, run with `--step=build-challenge --attempt=1 --field=round=1 --agent=bkit-build-challenge-1 --derived-artifact=logs/related.md --commit=none`) instead of exiting 2 with "each --agent reads the --artifact in the same position"
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** A step that passes one path as both `--artifact` (or `--optional-artifact`) and `--derived-artifact` (directly, or after `<attempt>` fills both to the same name) finishes with a `PENDING` stub left in its own artifact, because the skip matches by path string instead of by the flag that supplied the entry
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:871` · **Round:** 1
  - **DONE WHEN:** an entry from `--artifact` or `--optional-artifact` is always scanned for `PENDING` whatever `--derived-artifact` holds (the skip keys on the flag the entry came from, or finish refuses a path given under two artifact flags with a usage error); `steps finish --artifact=logs/own.md --derived-artifact=logs/own.md` with `PENDING` in `logs/own.md` exits non-zero naming "placeholders logs/own.md"
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a path given as both --artifact and --derived-artifact is still scanned for PENDING` fails on the finish exiting 0 with `logs/own.md` (holding `# Own`, a blank line and a bare `PENDING` line) recorded twice in `row.artifacts`, instead of exiting non-zero with "placeholders logs/own.md" in stderr
<!-- bkit:task 2 end -->
