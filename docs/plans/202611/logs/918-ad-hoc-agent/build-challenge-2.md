Verdict: CONCERNS
Failures: 2
Fingerprint: 04d8596e1e1983a08abd3843b8cce791260b0332415ee1c44f2d5885bb4b70a9
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Scope

- partial diff coverage: `tmp/bkit-diff-918-ad-hoc-agent.md` covers origin/dev...HEAD (46390 diff lines across 524 files, 20 largest files shown) and mixes in unrelated unpushed local `dev` work. The feature was judged from `git diff 90251a7c4 HEAD`, as the caller directed.
- Challenged in full: `.bkit/core/engine/commands/workflow/tracker.ts` (`sessionsRoot`, `canonicalPath`, `commentRunProof`, `sessionPublication`, `endedRunActionKey`), `.bkit/core/engine/commands/workflow/issues.ts` (`comment.run` guard placement, `buildComment` audit slug check), `.bkit/core/.agents/rules.md`, `.bkit/core/.bkit/workflows.md`, `.bkit/core/workflows/bkit-auto.md` / `bkit-build.md` (Comments clause, `SESSION_DIR`), `.bkit/core/engine/ledgers/journal.integration.test.ts`, `docs/security.md`.
- Out of scope: the unrelated `dev` work in the partial diff file; mirrors under `.claude/`, `.cursor/`, `.opencode/`, `.codex/`, `.agents/` (rendered copies of the sources above).

## Notes

- Docs loaded: `.agents/docs.md` (Build column) and `docs/security.md`. Task 1 matches `docs/security.md` § CI Auto-Route Trust (FID slug allowlist: assert a strict slug allowlist before any path construction) and the plan's own Architecture § `tracker.ts` (`o.auditSlug` matches `^[a-z0-9-]+$`). Task 2 contradicts the plan's Assumption that the guard is a speed bump.
- Task 1 is not a live bypass today: `buildComment` (`issues.ts:846`) rejects the traversal slug after the guard, so no comment is printed or posted. The finding is that the guard itself accepts it, against the plan's design.
- Checked and clean: the guard runs before `commentBody`, any file read and any tracker request, and outside the exit-0 `preparation` catch; the refusal is a fixed string that echoes no path or body; `commentRunProof` fails closed (catch returns null; no Git-common dir returns null); `endedRunActionKey` / `commentKey` are read-only; `--file` must be a regular file; session check compares realpaths of the nearest existing ancestor, so symlinks resolve to their target and `..` is normalised by `path.resolve`; the audit body file must sit directly in its folder (nested refused).
- Not logged (covered by the plan's Assumption and Recommendations for a future phase): any local caller can mint or guess a session path, or reuse a committed `status.jsonl`, and neither proof is bound to the issue.
- No new dependency, secret, env var, route or data-access policy in the feature range.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** An ad-hoc caller passes --kind=audit --audit-slug=x/../../.. --body-file=agenda.md and the audit run proof accepts it, because the unvalidated slug walks audit-{slug} up out of the outbox to the repo root
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/tracker.ts:2019` · **Round:** 1
  - **DONE WHEN:** commentRunProof returns "audit" only when --audit-slug matches ^[a-z0-9-]+$ (the allowlist the plan's Architecture section for tracker.ts names and buildComment already applies at .bkit/core/engine/commands/workflow/issues.ts:846), so a traversal slug is refused by the guard itself with the "workflow steps only" message instead of relying on the later buildComment slug check to stop the comment
  - **TEST FIRST:**
    - .bkit/core/engine/commands/workflow/issues.test.ts `audit proof refuses a slug that walks out of the audit outbox folder` fails on `issues comment --kind=audit --audit-slug=x/../../.. --body-file=<repo>/plain.md` passing the guard (stderr carries the --audit-slug usage error from buildComment, not "workflow steps only")
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** docs/security.md says an ad-hoc agent "cannot post" a marked comment, yet any agent passes the guard with a guessed --session-dir=.git/bkit-outbox/sessions/x (the folder need not exist) or a committed status.jsonl, so a reviewer relying on the doc treats a speed bump as a boundary
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `docs/security.md:62` · **Round:** 1
  - **DONE WHEN:** § Workflow comment ownership states the refusal as a misuse guard, not an authorization boundary: it says the proofs (a path under the Git-common bkit-outbox/sessions/, a run status.jsonl, an audit outbox body file) can be supplied by any local caller, and that the marker carries no provenance, matching the plan's own Assumption ("The guard is a speed bump")
  - **TEST FIRST:**
    - .bkit/core/engine/audits/repo/shipped-docs-refs.test.ts `security doc does not present the issues comment run proof as a hard boundary` fails on docs/security.md § Workflow comment ownership containing "cannot post a comment that carries the `bkit:generated` marker"
<!-- bkit:task 2 end -->
