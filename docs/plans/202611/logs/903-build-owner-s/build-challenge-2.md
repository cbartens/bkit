Verdict: CONCERNS
Failures: 1
Fingerprint: 5a4f585af24226870f9006b0a48581be60c7519ef5dd386891a9f528b74f5a84
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- partial diff coverage: `tmp/bkit-diff-903-build-owner-s.md` covers `origin/dev...HEAD` (46626 diff lines across 520 files, 20 largest shown), against a stale local `origin/dev`, so most of it is other issues' work. Per the caller's scope note, this round challenges only what changed in this plan's own commits since round 1 (`git diff 80f376b4e HEAD`, inside `dev...HEAD`).
- Files challenged: `.bkit/core/engine/commands/workflow/workflows.ts` (`openDecision` and the `workflows start` call that passes it the run's `build-decision` row artifacts), `.bkit/core/workflows/bkit-build.md` (the Resume and Owner decisions bullets, Decision Pause steps 5-6), `.bkit/core/.bkit/workflows.md` § Decision Pause, and the new tests in `workflows.test.ts` and `workflow-shape.test.ts`. The mirrors (`.claude/`, `.cursor/`, `.opencode/` commands, `SKILL.md` copies, the `bkit-build.none.txt` snapshot, `.bkit/workflows.md`, `.bkit/instructions.md`, `.bkit/version`) and `dist/` are generated copies of these.
- The not-shown-whole files that touch permissions or hooks (`.claude/hooks/bkit-gateguard.cjs` and its `.codex/`, `.cursor/`, `.opencode/` copies) are not changed by `dev...HEAD`; they belong to other issues' work and stay out of scope per the caller.
- Round 1's findings (Tasks 8 and 9, now built) and its two deferred LOW items (the `Fix task` placement check and the `Verify`-titled gap item in `summary.ts`) are not raised again.

## Vectors Checked

- Authentication / authorisation, sessions, tenancy, RLS: not applicable. bkit has no user auth, server or database (`docs/security.md` § Scope, § RLS). The owner's answer is the authority in a Decision Pause, so the integrity of a recorded owner answer is judged as the authorisation surface here.
- Path traversal in `openDecision`: the files it reads come only from `readdirSync(logDir)` names that match `^{workflow}-decision-{run}-([0-9]+)\.md$`, with `workflow` checked against `FEATURE_STATUS` by `workflowName` and `run` a number, so no `..` or `/` can reach `path.join`. The row-named artifacts (`finished`) are only compared with `includes`; they are never opened, joined or resolved, so a crafted artifact path in `status.jsonl` cannot redirect a read.
- Comparison / normalisation: `rel` = `path.relative(where.tree, ...)`, and `where.status` is `path.join(tree, statusRelPath(...))` because Step 2 calls `workflows start` without `--file`, so `rel` is always `docs/plans/{YYYYMM}/logs/{FID}/build-decision-{RUN}-{K}.md`. `steps finish` records `--artifact` as given, and the only `build-decision` finish block writes that same literal form (`fill` puts in the bare attempt number), so the strings match. `--attempt-of=build-decision:next` and Decision Pause step 1's `counters derive --position=next` give the same K for an unfinished file. A FAILED `build-decision` row would also count as finished, but `steps finish` only writes DONE rows. No mismatch found on the POSIX hosts bkit supports.
- Reopen scope: only the current run's files are read, and only on a resumed `IN_PROGRESS` run. An `OPEN` file is still returned whether or not a row names it, which the red-gate re-run path relies on. A `Stop` answer goes to step 8 without step 6, so a stopped pause stays `OPEN` and the new rule does not trap it.
- Integrity of recorded answers on reopen: a reopened `DECIDED` / `ASSUMED` file asks nothing again at step 4 (every question has a `Decision:` line), and step 5 replays idempotently: `TEST EXCEPTION` replaces rather than adds, `bkit ledgers append` skips a row with the same key and hash, a `Fix now` item reuses its `Fix task:` task, and `counters grant` grants nothing once the limit is no longer used up. One gap: the Resume rule's red-gate branch does not check `Status`, so it can override a reopened red-gate pause's recorded answer (Task 1).
- Decision Pause steps 5-6: the `Fix task: {N}` line is now written right after the task block and before `tests plan-check`, and step 6 adds only missing lines. No new trust surface. The line is still hand-written by the orchestrator, as in round 1.
- Input validation: no new parser. `openDecision`'s `Status` regex reads the first `Status:` line anywhere in the file, as before, and `decisions compose` writes `Status:` first.
- Secrets, PII, logging: none added. The new ledger rows (`docs/deferrals.jsonl`, `.bkit/friction.jsonl`) carry only step names, file paths and finding titles.
- Supply chain: no dependency added or changed.

## Notes

- Docs read: `.agents/docs.md` (Build column), `docs/security.md` (§ Untrusted Content & Prompt Injection: prose is defence-in-depth and the structural control must carry the load, which is why Task 1 asks `openDecision` to report `status` so that the branch the workflow chooses depends on a value the engine reports, not on the model's reading of prose), `.bkit/core/.bkit/workflows.md` § Decision Pause (**Resume into a red-gate pause**, **Resume after the answers**). `docs/architecture.md`, `docs/capabilities.md`, `docs/testing.md` and `docs/data-schema.md` (Build ●) were not loaded: nothing in this round's surface depends on them, and bkit has no database.
- Observation, not a finding: a file in the log directory that no `build-decision` row names, holding `Decision: Accept` lines the owner never gave, is now honoured on resume whether its status is `OPEN`, `DECIDED` or `ASSUMED`; before this change, `OPEN` files with pre-filled `Decision:` lines were already honoured the same way. The trust model (the orchestrator's hand-written `Decision:` lines are the owner's record) is unchanged and was accepted in round 1. Planting such a file needs write access to the log directory that every subagent already has.
- Observation, not a finding: the red-gate re-run path's own ordering (finish first, then `decisions apply --by=rerun`) means an interruption between them leaves an `OPEN` file that a row already names. The next resume runs finish again with the next attempt number, whose artifact does not exist. That behaviour is older than this branch.
- Verdict note: partial diff coverage.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A red-gate pause that was answered (`Try again`, or `Decide` with `Fix now` items) and stopped after Decision Pause step 6 is reopened as `DECIDED`; the Resume rule's red-gate test (a `## Progress` block and no other question without a `Decision:` line) still matches it, so the resume overrides the recorded answer: it writes a `build-decision` row with route `verify` or `tests` and re-runs the gate, and `decisions apply --by=rerun` then refuses the non-OPEN file
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-build.md:49` · **Round:** 1
  - **DONE WHEN:** `openDecision` also returns the decision file's `status` (`OPEN`, `DECIDED` or `ASSUMED`). The Resume bullet's red-gate re-run branch and its `another question is undecided` branch apply only when that `status` is `OPEN`. A reopened `DECIDED` or `ASSUMED` red-gate pause resumes at **Decision Pause** step 3 and keeps the route its recorded answers give. The `workflows start` `openDecision` output description names the new field.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `openDecision reports the status of a DECIDED red-gate decision file that no build-decision row names` fails on a `Status: DECIDED`, `Gate: FAIL` file with no `build-decision` row, where `openDecision` has no `status` field and `toMatchObject({ status: "DECIDED", gate: "FAIL" })` fails
    - `.bkit/core/engine/audits/workflows/workflow-shape.test.ts` `build re-runs a red gate pause only when the decision file is still OPEN` fails on the Resume bullet's text between ``**If** `OPEN_GATE` = `FAIL` **and**`` and `the pause asks about a red gate`, which tests only the `## Progress` block and the other questions' `Decision:` lines and never names `status` = `OPEN`
<!-- bkit:task 1 end -->
