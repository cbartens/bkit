Verdict: CONCERNS
Failures: 1
Fingerprint: 9bfad094ff7816cdf3c95aa8d36c2fc41ec901cf5ad6e41be49f24533549a6f2
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- Diff: `tmp/bkit-diff-812-keep-steps-placeholder.md`, read in full. Its first line is a `diff --git` header, so coverage is full (no `partial diff coverage`).
- Plan: `docs/plans/202611/812-keep-steps-placeholder-plan.md`.
- Surfaces challenged: the `--derived-artifact` flag in `.bkit/core/engine/commands/workflow/steps.ts` (`GateOptions`, `gateChecks`, `finish`, the flag spec) and its build in `dist/commands/workflow/steps.js`; the one workflow call at `.bkit/core/workflows/bkit-plan.md:331` and its rendered mirrors and snapshot; the `cli.md` and `workflows.md` doc lines; the new tests in `steps.test.ts` and `workflow-shape.test.ts`; the `.bkit/version` hashes.
- Docs loaded: `.agents/docs.md`; `docs/security.md` (§ Trust boundaries, § Input validation, § Untrusted Content & Prompt Injection, § Workflow comment ownership, § Secrets, § Public repo content, § Shell Injection, § PII, § RLS); `.bkit/workflows.md` line 428 and the verdict-header rules. `docs/knowledge.jsonl` was searched for placeholder entries only. `docs/architecture.md`, `docs/testing.md`, `docs/data-schema.md`, `docs/observability.md` and `docs/capabilities.md` were not read in full, because nothing in them bears on the security of this diff.

## Vectors Checked

- Authentication and authorisation: no token, session or permission code changed.
- Data access and tenancy: bkit has no database (`docs/security.md` § RLS), so nothing applies.
- Input validation and path traversal: a derived path goes through the same `artifactProblem` inside-the-checkout check as `--artifact` (`steps.ts:1165`), so an existing path outside the checkout is refused with `EXIT_ARTIFACT` before anything is written. URLs fall out at the existence filter (`steps.ts:1155`). `<attempt>` patterns reach `laterAttempts`, which escapes the file name before building its regex. No new subprocess call, so no shell-injection surface.
- Untrusted content: the change closes an availability hole. Before it, anyone able to comment on a related issue could stop plan Step 4 by writing a bare `PENDING` line, which `bkit issues related` copied into `related-issues.md`. The PENDING scan was never an injection control, so skipping it on that file loses no protection. Finding 1 covers the position-based reads that still treat derived text as the step's own output.
- Secrets: none added. `.bkit/version` holds file hashes only.
- Data exposure and PII: the row records the path only. The file was already recorded, linked and committed as an `--optional-artifact` before the change, so nothing new reaches git or the tracker.
- Supply chain: no dependency added or changed.

## Notes

- Finding 1 is not reachable from today's only call site: `bkit-plan.md:331` passes two `--artifact` files ahead of the derived one, no `--agent`, no `--comment-body` and no `<done>` in its `--message`. It guards the next workflow step that uses the flag.
- Considered and not raised: passing one path as both `--artifact` and `--derived-artifact` drops the PENDING scan on it, because `steps.ts:871` matches by string. Only the caller who writes the command can do that, and that caller can already leave the flag out, so it gives an attacker nothing new. It is a correctness question, outside this lens.
- Out of scope, proposed separately: `bkit issues related` (`.bkit/core/engine/commands/workflow/issues.ts:1017`) writes other issues' bodies and comments to `related-issues.md` with no `===== BEGIN UNTRUSTED =====` fence, and the plan's Step 5 reviewers read that file (`bkit-plan.md:369`, `bkit-plan.md:374`, `bkit-plan.md:379`). `docs/security.md` § Untrusted Content exempts tracker bodies because they are the task specification, but related issues are not this run's task. The plan's security row says the file is still read as untrusted data by later steps; that holds only through the standing header contract, not through a fence. This diff does not change that behaviour.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A `--derived-artifact` file of copied external text joins the step's own artifact list, so a finish with no own artifact posts an issue commenter's text as the bkit `--comment-body`, reads an `--agent` verdict from it, or puts its DONE line in the commit message
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/steps.ts:1161` · **Round:** 1
  - **DONE WHEN:** `finish` keeps derived artifacts out of every position-based read: the `--agent` count check and verdict reads (`steps.ts:1174`, `steps.ts:1187`), the `build-challenge` findings parse (`steps.ts:1226`), `continueCheck` and the BLOCKED-line read of `artifacts[0]` (`steps.ts:1330`, `steps.ts:1360`), the `<done>` description (`steps.ts:1604`) and the `--comment-body` source (`steps.ts:1658`) read only `--artifact` / `--optional-artifact` files; derived files are still presence-checked, recorded on the row and linked in the comment
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `a --derived-artifact is never the --comment-body source` fails on `r.json.comment` holding the derived file's text when the finish passes `--comment-body --number=4 --title=Fetch Context` with only `--derived-artifact=logs/related.md`
    - `.bkit/core/engine/commands/workflow/steps.test.ts` `an --agent never reads its verdict from a --derived-artifact` fails on the finish reading `Verdict: PASS` from `logs/related.md` instead of refusing with "each --agent reads the --artifact in the same position" when `--agent=bkit-build-plan-verify` is paired with only `--derived-artifact=logs/related.md`
<!-- bkit:task 1 end -->
