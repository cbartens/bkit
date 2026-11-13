Verdict: CONCERNS
Failures: 3
Fingerprint: fe5863c86a0f84a60b2e7b4942c5b2571830e6027b528d2eb9872bbc0de43582
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

- partial diff coverage: `tmp/bkit-diff-903-build-owner-s.md` is a partial diff against a stale `origin/dev`. Per the caller's scope note (challenge round 2), this challenge reads this plan's own changes from `git diff dev...HEAD` and concentrates on what is new since round 1: `openDecision` and its `workflows start` caller in `.bkit/core/engine/commands/workflow/workflows.ts`, Decision Pause steps 3-6 and the Resume bullet in `.bkit/core/workflows/bkit-build.md`, `.bkit/core/.bkit/workflows.md` § Decision Pause, and the new `workflows.test.ts` cases. Round 1's findings (Tasks 8 and 9) and its two deferred LOW items are not re-raised.
- Docs loaded: `.agents/docs.md` (Build column), `.bkit/workflows.md` § Decision Pause (via `.bkit/core/.bkit/workflows.md`), `.bkit/jsonl.md` § Identity / Dedup, `docs/architecture.md`, `docs/security.md` (headings; nothing on the Decision Pause), `docs/testing.md` (headings). No `docs/knowledge.jsonl` row covers Decision Pause resume.

## Notes

Vectors checked with no finding:

- Path match: `workflows start` calls without `--file`, so `logDir` sits under `where.tree` (`git rev-parse --show-toplevel`) and `rel` is `docs/plans/...`, the same form `steps finish --artifact` records; no symlink or absolute-path mismatch reopens a finished file.
- Fold: `fold` keeps every `step-done` row, so every finished pause's artifact is in `finished`, not only the latest attempt's. A row with no `artifacts` gives `[undefined]` to `flatMap`, which matches nothing and does not throw.
- Order: files are walked highest number first; an `OPEN` or unfinished file always wins over lower finished ones.
- Only build writes `{workflow}-decision-{run}-{N}.md` files, so the new `${workflow}-decision` filter changes no other workflow.
- Headless reopen: `decisions apply --by=headless` on a fully decided file applies nothing and exits 0, so it goes to step 5 (see Task 2). A FAILED run starts a new run number, so its decided files never reopen.
- `counters grant` on a replayed step 6 grants nothing once the first pass's grant row exists; `ledgers commit --mode=commit` with no plan change returns `nothing-to-commit` without failing.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A red-gate pause (`Gate: FAIL`) whose answers step 6 wrote (`Status: DECIDED`, loop question answered `Try again` or items answered `Fix now`) and then stopped before `steps finish` is reopened by `openDecision`; the decided file has a `## Progress` block and no other question without a `Decision:` line, so the Resume bullet's red-gate test passes, the resume writes a `build-decision` row with route `verify`/`tests` (not the owner's `retry`/`fix`) and posts it, then `decisions apply --by=rerun` exits with `is Status: DECIDED, not OPEN`
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:49` · **Round:** 1
  - **DONE WHEN:** `openDecision` (`.bkit/core/engine/commands/workflow/workflows.ts:282`) returns the file's `status` (`OPEN`, `DECIDED` or `ASSUMED`), the `workflows start` output help names it, and the Resume bullet in `.bkit/core/workflows/bkit-build.md` and the `Resume into a red-gate pause` bullet in `.bkit/core/.bkit/workflows.md` § Decision Pause skip step 3 and re-run the gate only when that `status` = `OPEN`; a `DECIDED` / `ASSUMED` red-gate file resumes at Decision Pause step 3 like any reopened pause, so the owner's route is kept.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `workflows start reports the status of a reopened DECIDED decision file in openDecision` fails on `openDecision` having no `status` key, so the workflow cannot tell a decided red-gate file from an open one
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Resume re-runs a red gate only when openDecision status is OPEN` fails on the Resume bullet's red-gate branch testing only `OPEN_GATE` = `FAIL` and the undecided questions
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** A reopened `DECIDED` / `ASSUMED` pause always replays Decision Pause step 5 in full, because step 6 only runs after step 5 finished; only `Fix now` has a reuse rule, so every owner `Accept` appends a second `docs/decisions.jsonl` row (append-only, committed), every accepted challenge task gets ` — accepted by owner` (or ` — accepted (assumed)`) appended to its title a second time, and step 6 adds a second `Decision:` line under each answered item
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:220` · **Round:** 1
  - **DONE WHEN:** Decision Pause step 5 says that an `Accept` or `Accept (assumed)` item of a reopened `DECIDED` / `ASSUMED` file writes nothing already written (no second `docs/decisions.jsonl` row for that item, no second title suffix, no second `TEST EXCEPTION`), and step 6 adds a `Decision:` line only under an item that has none; `.bkit/core/.bkit/workflows.md` § Decision Pause `Resume after the answers` and the `.bkit/instructions.md` `#### bkit-build` entries say the same.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Decision Pause step 5 writes no second acceptance for a reopened DECIDED or ASSUMED pause` fails on step 5's `Accept` branch appending a `docs/decisions.jsonl` row and a title suffix with no check for an earlier pass, while only `Fix now` carries a reuse rule
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** A reopened `DECIDED` / `ASSUMED` pause resumed in a session reaches Decision Pause step 4 with no question lacking a `Decision:` line, yet step 4 still narrates `0 question(s)`, writes an `owner-pause` row and ends the turn waiting for answers, so the resumed run stalls on an empty question and logs a spurious owner stop
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:196` · **Round:** 1
  - **DONE WHEN:** Decision Pause step 4 (or step 3) routes a decision file with no question lacking a `Decision:` line straight to its route (step 6 for a loop question answered `Try again`, else step 5) without narrating, recording an `owner-pause` row or ending the turn.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `Decision Pause step 4 skips the ask when no question lacks a Decision line` fails on step 4 always narrating, recording `owner-pause` and ending the turn, with no branch for a file whose questions are all decided
<!-- bkit:task 3 end -->
