Verdict: CONCERNS
Failures: 1
Fingerprint: 5580ea82e0d31694ad18e3d71aceda36f44e67a19b4c654d6d64dc6bcbcea5ab
<!-- verdict:end -->

# Build Challenge

Lens: Bugs and edge cases — null safety, off-by-one, error paths, data integrity.

## Scope

partial diff coverage: the supplied `tmp/bkit-diff-918-ad-hoc-agent.md` opens with the partial-coverage line and also carries unrelated local `dev` work, so the feature was judged from `git diff 90251a7c4 HEAD` as the caller directed: `commentRunProof`, `sessionsRoot`, `canonicalPath` and the widened `endedRunActionKey` in `.bkit/core/engine/commands/workflow/tracker.ts`; the guard and summary in `.bkit/core/engine/commands/workflow/issues.ts`; the `dist/` rebuild; the `bkit-auto` `SESSION_DIR` hold and the rewritten Comments clause; the new and updated tests in `issues.test.ts`, `tracker.integration.test.ts`, `catalog-parity.test.ts`, `rules-sync.test.ts` and `journal.integration.test.ts`.

## Notes

- Probed the built CLI (`dist/cli.js`) in a scratch Git repo: a bare call and an audit call with a body file outside the outbox are refused with the "workflow steps only" message; a fabricated `--session-dir=.git/bkit-outbox/sessions/made-up` is accepted and prints the marked body; the sessions root itself (`.../sessions/`) is refused; `--audit-slug=x/../../..` passes the guard and is stopped only by `buildComment`'s slug regex (Task 1).
- Not logged as findings, because the owner-confirmed plan already accepts them: a hand-minted or fabricated session path and any `status.jsonl` holding a run pass the guard (plan Open Questions & Assumptions, "speed bump"); released 6.1.1 mirrors are refused until `bkit upgrade` with no friction row or `commentFile` (Open Question 6, option A); one lookup error (for example a missing `--file`) returns null before later proofs are tried, which matches the plan's "null on any lookup error".
- Checked and clean: every `issues comment` call in `.bkit/core/workflows/*.md` carries `--session-dir="{SESSION_DIR}"` or `--file="{STATUS}"`, and each `--file` call runs after `workflows start` wrote its run; `repo info` always emits `sessionDir`, including with `--allow-detached`; no template, CI file or engine verb calls the CLI verb; the guard throws outside the `commentBody` try, so the exit-0 `preparation` fallback never swallows it; `commentFileOf` writes to `<repo>/tmp/`, which the no-post test checks; `dist/` carries the guard.
- A `--kind=audit --result-file` call without `--audit-slug` is refused even with an outbox body file. `.bkit/workflows.md` § Comment Lifecycle documents `--audit-slug` as required and no shipped caller omits it, so this is not logged.
- Docs read: `.agents/docs.md` (Build column), `docs/architecture.md` § Tracker reporting boundary, `docs/security.md` § Workflow comment ownership. Task 1 cross-references the plan's Architecture § `commentRunProof` audit bullet and `docs/security.md` § Workflow comment ownership (session and outbox paths must resolve inside the Git-common outbox).
- The output stub was first written with a shell heredoc rather than the write tool; its content matches the format.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** An ad-hoc agent passes --kind=audit --audit-slug=x/../../.. --body-file=notes.md (a file at the repo root) and the run-proof guard accepts it, because the audit proof joins an unvalidated slug into the outbox path; only buildComment's later slug check stops the body today
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tracker.ts:2026` · **Round:** 1
  - **DONE WHEN:** commentRunProof returns null unless --audit-slug matches ^[a-z0-9-]+$ before the slug is joined into <outbox>/audit-{slug}, as the plan's Architecture commentRunProof "audit" bullet specifies; a path-traversing slug is refused by the guard itself with the "workflow steps only" message, not by the later "--kind=audit needs --audit-slug" usage error.
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/issues.test.ts `audit proof refuses a path-traversing audit slug` fails on `issues comment --kind=audit --audit-slug=x/../../.. --body-file=plain.md` (body file at the repo root) exiting 2 with `--kind=audit needs --audit-slug=<template slug>` on stderr instead of "workflow steps only" (verified against dist/cli.js in a scratch repo)
<!-- bkit:task 1 end -->
