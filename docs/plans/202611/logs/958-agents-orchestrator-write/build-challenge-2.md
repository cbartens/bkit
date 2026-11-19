Verdict: CONCERNS
Failures: 3
Fingerprint: 8763417755fd378fe26cd2fef7a2677fa49dfd73b8c08c7b6ddf3f8f527aee59
<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

Coverage: partial diff coverage — `tmp/bkit-diff-958-agents-orchestrator-write.md` shows 20 of 265 files; of the files not shown whole, those touching secrets, input handling or data access were challenged with `git diff origin/dev...HEAD -- <file>`: `workflows.ts` (`scrubSecrets`, `scrubFailureFiles`), `decisions.ts` (`apply --by=owner`, `--answer`, `--fix-task`, `--reason-file`), `ledgers.ts` (`findings`), `audit-report.ts`, `issues.ts` (`--report`, `--audit-slug`), `status.ts`, `ledgers/status.ts`, `steps.ts` (`bodyProblem`, re-ask `problem`), and the Failure Path / context-fetch / ship-confirm hunks of `bkit-build.md`, `bkit-debug.md`, `bkit-ship.md`, `bkit-auto.md`, `bkit-plan.md`, `bkit-design.md`, `bkit-audit-generate.md`. Rendered mirrors, `dist/`, audit templates and ledgers stayed out of scope.

## Scope

- Range `origin/dev...HEAD`, partial diff coverage. The shown diff was read in full; the security-relevant not-shown files listed above were read through `git diff`.
- Not read: the rest of `decisions.ts` outside `apply` / `answers` / `readBaseCheck`, the rest of `steps.ts` outside `readHeader` / `bodyProblem` / `finish`, `open-decision.ts` beyond the shown hunks, `challenge.ts`, `tasks.ts`, `summary.ts` and every test file other than the scrub tests in `workflows.test.ts`. Evidence is therefore incomplete.
- Supply chain: no `package.json` or lockfile change in the range; no new dependency.

## Notes

- Evidence for Tasks 1-3: the four `TOKEN_SHAPES` regexes were copied verbatim from `.bkit/core/engine/commands/workflow/workflows.ts:362-365` into a one-off `node -e` run over fake strings. Unquoted `Authorization: Bearer X` was scrubbed; the quoted and JSON header forms, `refresh_token=`, `id_token=`, `sk_live_`, `ghu_`, `ghr_`, `ASIA`, `AIza`, `npm_` and a PEM tail without its BEGIN line all came through unscrubbed. The existing scrub tests (`workflows.test.ts:947`, `:1014`) cover none of these forms, and every plan task (1-50) is ticked, so none of them is covered.
- Cross-reference: `docs/security.md` § Public repo content (line 239, NEVER commit any token or key) is the rule each of Tasks 1-3 breaks; § Secret scanning (line 233, push protection) blocks most of the Task 2 prefixes on a GitHub-hosted repo, but not a generic JWT (Task 1), a refresh token or a key fragment (Task 3), and not consumer repos on other hosts. The accepted `[skip ci]` risk at `docs/security.md:101` names only audit reports, not the Failure Path files. `docs/observability.md:9` (scrub sensitive fields at the source) agrees with the engine-side scrub the plan chose.
- Not raised, already covered: an unscrubbed failure file committed by later bookkeeping when `workflows fail` never ran is the plan's deferred earlier finding; publishing a context-fetch script that inlines a secret is the owner's accepted Q10 A (plan line 341); the first-time publication of failure text on a private-tracker repo is Task 23's accepted design.
- Checked and clean: owner words no longer reach argv (`--reason-file`, the ship `ship-owner-reason-{RUN}-{ENTRY}.md` file, and the decision file written with the file tool); `--answer` and `--fix-task` are parsed against `^Q([1-9][0-9]*)=([A-Z])$` and `^Q([1-9][0-9]*)=([1-9][0-9]*)$` (`decisions.ts:723`, `:742`); `status row` refuses the engine-only `decision-counts` / `decision-answer` types; `--base-check` is validated field by field; `issues comment --kind=audit` still checks the slug against `^[a-z0-9-]+$` (`issues.ts:642`); the re-ask `problem` text holds fixed wording plus the agent's own header values, so nothing crosses a trust boundary; the context-fetch script written with the file tool removes the old heredoc delimiter-injection path; status rows store repo-relative paths, not home paths; the only token-shaped literal added is an obvious fake test value.
- Trust model, unchanged by this diff: `decisions apply --by=owner` accepts any caller, and no hook stops a subagent from recording an owner answer. Before the diff, any agent could equally write a `Decision:` line into the decision file. Propose separately if a hook gate is wanted.
- Out of scope, proposed separately: `bkit-auto`'s Failure Path posts `.worktrees/bkit-error-auto.md` through `issues comment`, which applies only the tracker-key `redact`, not `scrubSecrets`. The file is gitignored (`.gitignore:52`), so the gap is the tracker comment only, and it predates this diff.
- Outside this lens, proposed separately: `bkit-audit-generate.md:182-183` says to append the printed `ledgerRows` and also never to lower a row's severity, but `auditLedgerRows` (`audit-report.ts:110`) always writes the finding's severity, and `ledgerKeys` holds no prior severity, so reusing a HIGH row's key for a LOW finding lowers it.
- Embedded directives: none found in the diff, plan or log content read.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** A failed Node command prints an axios-style error dump, `headers: { Authorization: 'Bearer <runtime-minted JWT>' }` or `{"Authorization":"Bearer <token>"}`; the Authorization rule needs `Authorization:` followed directly by whitespace and `Bearer|Basic`, so the quote between them defeats it, and a token held in no env var lands raw in the committed `{LOG_DIR}/{workflow}-stderr.md` / `-error.md`, pushed under `[skip ci]` where no secret scan runs and push protection recognises no generic JWT
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:363` · **Round:** 1
  - **DONE WHEN:** `scrubSecrets` replaces the credential after `Bearer` / `Basic` when the header name or the value is quoted (`Authorization: 'Bearer X'`, `"Authorization": "Bearer X"`, `'authorization': 'Basic X'`), case-insensitively, so after `bkit workflows fail` both failure files hold `<redacted>` in place of the value; the Task 48 unquoted `Authorization: Bearer X` case still passes.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail > redacts a Bearer value in a quoted or JSON Authorization header from the error and stderr files` fails on both files still holding the fake runtime-built bearer value, written as `headers: { Authorization: 'Bearer <fake>' }` and as `{"Authorization":"Bearer <fake>"}`, after the call
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** A failed e2e test prints an OAuth callback URL carrying `refresh_token=` / `id_token=`, or a tool prints a `ghu_` / `ghr_` GitHub token, a Stripe `sk_live_` / `rk_live_` key, an `ASIA` AWS session key id, an `AIza` Google key or an `npm_` token that no env var holds; the `token=` rule anchors `\b` before `token`, so `refresh_token=` and `id_token=` never match, and the prefix list stops at `gh[pos]_` and `sk-`, so each value lands raw in the committed failure files on a repo without push protection, and the refresh token gets past push protection too
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:364` · **Round:** 1
  - **DONE WHEN:** `scrubSecrets` redacts the value of any `*_token=` query or fragment parameter (`refresh_token`, `id_token`, `access_token`, `token`) and values with the prefixes `ghu_`, `ghr_`, `sk_live_`, `rk_live_`, `ASIA`, `AIza` and `npm_`, whatever the env holds, in both failure files; the Task 48 prefixes still pass.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail > redacts refresh and id tokens and the remaining well-known token prefixes from the error and stderr files` fails on both files still holding a fake `refresh_token=` value, a fake `id_token=` value and fake `ghu_`-, `sk_live_`- and `AIza`-prefixed values (each built at runtime, none set in any env var) after the call
<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->
- [ ] **TASK 3:** A failed command's stderr ends with a private key longer than 20 lines; the Failure Path tells the orchestrator to write only the last 20 lines, so the `-----BEGIN … PRIVATE KEY-----` line is cut before the engine sees the file, the PEM rule needs both BEGIN and END, and up to 19 base64 lines of key material land raw in the committed `{LOG_DIR}/{workflow}-stderr.md`
  **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/workflows.ts:362` · **Round:** 1
  - **DONE WHEN:** `scrubSecrets` also redacts the key body that runs up to an `-----END … PRIVATE KEY-----` line with no matching BEGIN line in the file (from the file start, or from the run of base64 lines right before the END line), so a stderr file that holds only the tail of a key keeps none of its body; a full BEGIN…END block is still redacted whole.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/workflows.test.ts` `bkit workflows fail > redacts the body of a private key whose BEGIN line fell outside the stderr tail` fails on the stderr file still holding the fake base64 body lines written above a lone `-----END RSA PRIVATE KEY-----` line after the call
<!-- bkit:task 3 end -->
