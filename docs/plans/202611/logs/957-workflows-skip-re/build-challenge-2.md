Verdict: CONCERNS
Failures: 2
Fingerprint: 01dbb17ce71a9367df22b9b92ec0601c9dc17b2863e8b8279e83833fb7472d9d
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- Round 2 of 2. Diff: `tmp/bkit-diff-957-workflows-skip-re.md` says `partial diff coverage` (origin/dev...HEAD, 197 files, mostly unrelated local dev commits). On the caller's direction, this run's own changes were reviewed with `git diff 3e08269f7..HEAD` and `git diff HEAD`, restricted to the plan's files: `.bkit/core/engine/commands/workflow/tasks.ts`, `step-table.ts`, `summary.ts`, their `dist/` builds, `.bkit/core/workflows/bkit-build.md`, `.bkit/core/.bkit/workflows.md` and `docs/decisions.jsonl`. `decisions.ts` is in the not-shown-whole list but this run did not change it.
- Plan: `docs/plans/202611/957-workflows-skip-re-plan.md`, group 3 (tasks 6-9). Deferral rows `957-workflows-skip-re-challenge-low-*` (three) were read and are not reported again.
- Docs loaded: `.agents/docs.md`, `docs/security.md` (§ Untrusted Content & Prompt Injection, § Scope).

## Notes

- Authentication, authorisation, sessions, tenancy, secrets, PII and supply chain: not applicable or unchanged. `docs/security.md` § Scope says bkit has no database, server or user-auth surface. Group 3 adds no dependency, credential, logged personal data or shell spawn.
- Task 1 is a gap in the Task 7 fix. `SOURCE_CHANGED` is held only in the session. The `openDecision` resume rule (`bkit-build.md:49`) rebuilds `DECISION`, `PAUSE_QUESTION`, `PAUSE_STEP`, `GROUP` and the attempts from the decision file, but not `SOURCE_CHANGED`. The `Pause step` header cannot stand in for it, because the Step 10 fix round (sub-step 10) also sets `PAUSE_STEP` = 10. Every holistic gap is a hard blocker that offers `Stop`, so the Stop-then-resume path is a normal owner path, not an edge case. Integrity failure (OWASP A04 / A08): edits no verify round has seen pass the verify gate.
- Task 2 restates the round-1 security LOW finding at `tasks.ts:219` (task number taken from anywhere in a title). It was neither fixed nor deferred: the challenge merge gave it the same location as round-1 Task 9, and Task 9's fix (`/\btask\s+(\d+)\b/i`) widened the match to lowercase prose. Gap descriptions come from verifier output derived from diffs, which is untrusted text (`docs/security.md` § Untrusted Content & Prompt Injection). It stays LOW because an agent can already tick any task with `--tasks`.
- The Task 8 fix (tick before `steps finish --step=build-decision`) and the Task 9 exit check (`exit != 0` → Failure Path) open no new security surface.
- The Task 6 fix identifies the loop item by the exact title `Holistic verify`. A gap whose title is exactly that would be read as the loop item and would have to be `Decide`, which an `Accept` is not, so the pause settles nothing. It fails safe. Not a finding.
- Outside this lens, not logged: when no accepted item names a task in `--group`, `tasks tick --decision` exits 0 with `ticked` = `[]`, so the exit check never fires and Step 7 re-enters the same group.
- Each test named below was read against the code this diff leaves. Task 1: `workflow-shape.test.ts` has no `Source changed` or `SOURCE_CHANGED` match, and `{HEADER_FLAGS}` (`bkit-build.md:167`) has no such header. Task 2: `/\btask\s+(\d+)\b/i` matches `task 2` inside `No test covers the retry path that task 2 adds`, so today task 2 is ticked. The existing fixtures (`Task 1 gap`, `TASK 3`) start with the number, so the anchored fix keeps them green.
- `Failures` and `Fingerprint` are left for `bkit steps stub --result-file` to fill in.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A fix round edits source and reports Fixed: 0, the owner picks Stop at the holistic pause, and the resumed run answers Accept and routes continue, because `SOURCE_CHANGED` lives only in session memory and the resume rebuilds every other pause variable but not this one, so the unverified edits skip the verify re-run
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:268` · **Round:** 1
  - **DONE WHEN:** The verify and holistic pauses write the source-change fact into the decision file header (`--header="Source changed={SOURCE_CHANGED}"` in `{HEADER_FLAGS}`), step 6's continue rule reads it from that header, and a decision file with no `Source changed: false` header line keeps the verify / holistic re-run, so a resumed pause (Stop, or a session that died mid-pause) never routes continue on a guess
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `the continue rule reads the source change from the decision file header` fails on `{HEADER_FLAGS}` carrying no `Source changed` header and the continue rule naming only the held `SOURCE_CHANGED`, which the `openDecision` resume never sets
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** An accepted verify gap with no task number, titled with its verifier-written description such as `No test covers the retry path that task 2 adds`, ticks task 2 as done, because the case-insensitive, unanchored title match added by the Task 9 fix finds a task number anywhere in the title, so an unfinished task passes the summary's unticked-task gate
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tasks.ts:219` · **Round:** 1
  - **DONE WHEN:** `tasks tick --decision` reads a task number only from a title that starts with it (`/^task\s+(\d+)\b/i`), so `TASK 3` and `Task 3 gap` still tick task 3 and a task number later in the title ticks nothing
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tasks.test.ts` `tick --decision ignores a task number inside an un-numbered gap's title` fails on `ticked` = `[2]` from an `Accept` item titled `No test covers the retry path that task 2 adds` in group 1
<!-- bkit:task 2 end -->
