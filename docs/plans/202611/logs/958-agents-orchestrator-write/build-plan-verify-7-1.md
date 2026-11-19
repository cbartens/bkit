Verdict: CONCERNS
Failures: 2
Fixable: true
Tasks: none
Loosened: none
Fingerprint: bd145399643e87305ac91a0c565da6bd6186dcd5960410f632b37821b265d914
<!-- verdict:end -->

# Plan Verification

## Scope

Group 7

## Groups Verified

None

## Integration Gaps

None

## Previously Attempted

None

## Notes

- Task 25: `itemProblem` (`.bkit/core/engine/commands/workflow/decisions.ts:180-187`) refuses with exit 6 in both directions the DONE WHEN names: a question in the file beside a loop question offering `B) Stop`, and no question beside one offering `B) Decide`. The `problem` text names `decisions counts`. `check` counts questions with `ITEM_SPLIT`, the same split `parseDecisionItems` uses in `counts`, so a freshly counted pair always passes. The DONE WHEN test passes. The workflow wording at `bkit-build.md:214` and its rendered copies (`.claude`, `.cursor`, `.opencode`, `.agents` skills, the render snapshot, `.bkit/instructions.md`) changed together, and the ceiling went from 58001 to 57999. The only gap is the recovery sentence being unconditional (see Gaps Log).
- Task 26: `scrubSecrets` (`workflows.ts:366-392`) runs inside `scrubFailureFiles` on both files after `redact`. It replaces credential-named env values with `<NAME>` (longest value first), `scheme://user:password@` passwords with `<redacted>`, and the repo root, cwd and their real paths with relative paths, then the home directory with `~`. Both DONE WHEN tests and Task 23's test pass. The only gap is the misplaced and stale JSDoc.
- Observation, not a gap: `CREDENTIAL_NAME` also matches harmless names such as `TOKENIZERS_PARALLELISM=false`. Every `false` in the stderr would then become `<TOKENIZERS_PARALLELISM>`. This errs toward over-redacting and matches the DONE WHEN's name list.
- Test-first audit (`build-tests-green-7-1.md`): `Enforced: true`, `Gaps: 0`, `Unproven: 0`. It has no `Taken over`, `Changed by a code step`, `Updated tests` or `Already landed` sections. All three planned tests went red, then green.
- `pnpm exec vitest run` on `decisions.test.ts` and `workflows.test.ts`: 272 of 272 passed.
- Decision records `build-decision-1-1.md` (group 3 verify) and `build-decision-1-2.md` (challenge, Task 18) do not touch Tasks 25 or 26.
- The `docs/deferrals.jsonl` rows added in the diff are round-2 LOW challenge deferrals. They do not satisfy or belong to either task.

## Identified Gaps Log

2 gaps.

- TASK 25: `.bkit/core/workflows/bkit-build.md:214` — the exit-6 recovery now tells the orchestrator to re-run `decisions counts {COUNT_FLAGS}` on every pause, but a `CHALLENGE`, `CHANGED_TESTS` or `UNPROVEN` pause never runs `counts` and has no `{COUNT_FLAGS}`; `counts` with no flag exits 2 ("counts needs --source-changed, --base-check or --loop"), which the same sentence routes to Failure Path, so the first fixable refusal of those pauses (an en dash, a missing option) now ends the run where the old wording re-ran only `check`. Done when: the step re-runs `decisions counts` only when it ran for this pause (for example "re-run the commands above once"), and the rendered copies and the `.bkit/instructions.md` entry match — Fixable: true
- TASK 26: `.bkit/core/engine/commands/workflow/workflows.ts:356` — `CREDENTIAL_NAME`, `URL_PASSWORD` and `scrubSecrets` were inserted between `scrubFailureFiles`'s JSDoc and the function, so the comment "Rewrite the failure's error and stderr files in place ... configured secret values become `<NAME>`" now documents the `CREDENTIAL_NAME` regex and `scrubFailureFiles` has none; it also still describes only the configured secret keys. Done when: the JSDoc sits directly above `scrubFailureFiles` and names what it now scrubs (configured secrets, credential env values, URL passwords, checkout and home paths) — Fixable: true

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** TASK 25: exit-6 recovery re-runs decisions counts on pauses that never ran it
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:214` · **Round:** 1
  - **DONE WHEN:** Decision Pause step 2 re-runs decisions counts only when it ran for this pause (for example "re-run the commands above once"), so a CHALLENGE, CHANGED_TESTS or UNPROVEN pause re-runs only decisions check; rendered copies and the .bkit/instructions.md entry match
  - **TEST FIRST:**
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** TASK 26: scrubFailureFiles JSDoc now sits above CREDENTIAL_NAME and describes only configured secrets
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:356` · **Round:** 1
  - **DONE WHEN:** The JSDoc sits directly above scrubFailureFiles and names what it scrubs: configured secrets, credential env values, URL passwords, checkout and home paths
  - **TEST FIRST:**
<!-- bkit:task 2 end -->
