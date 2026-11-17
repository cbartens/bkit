Verdict: CONCERNS
Failures: 2
Fingerprint: 35777bc9b2610c37287d2c51b60c5b92f2c745b506cff678eac8d9d9d591c385
<!-- verdict:end -->

## Scope

- Round 2 of 2, security lens. Diff: `tmp/bkit-diff-920-build-agents-run.md` (4365 lines), read in full; no `partial diff coverage` line.
- Per the caller's scope notes, only issue #920's changes were challenged: the `Local tests first` / `Local pre-commit` rewording in `.bkit/core/.agents/rules.md` and `.bkit/instructions.md`, its six prompt carriers and host mirrors (38 copies of the new bullet in the diff), the three new corpus tests in `.bkit/core/engine/tools/instructions.test.ts`, the ship Step 2 exit-80 arm and its test in `ship-invariants.test.ts`, the `bkit-debug-failure-reproduce` carrier, and the `docs/security.md` accepted-risk paragraph with its `docs/decisions.jsonl` row. Commits from #911, #915 and #929 were left out of scope.
- Plan: `docs/plans/202611/920-build-agents-run-plan.md`.
- Docs: `.agents/docs.md`, `docs/security.md` (present, read in full), `docs/decisions.jsonl` (the `920-audit-reports-may-skip-ci-on-dev` row), `docs/deferrals.jsonl` (the 911 ship Step 2 row).
- Not re-reported, per the caller: the missing exit-80 arm, the missing reproduce carrier, the rule clash, and the audit-report skip-CI risk on `dev`.

## Notes

- Rule rewording and carriers: no auth, secret, input or data-exposure surface. The new text names no runner or stack, adds no command an agent interpolates, and keeps `Pre-push: NEVER push with --no-verify` in `bkit-debug-failure-remediate`. The full suite now runs only in the pre-push hook, which still runs the full gate for any code change (the light gate applies only to files bkit writes). No finding.
- TASK 1 basis: `.bkit/core/workflows/bkit-ship.md:53` and `:349` map `bkit prs checks` to `pull_request_read` (`get_status`). In the GitHub MCP server that method returns the combined commit status (the legacy Statuses API: `error`, `failure`, `pending`, `success`). It holds no Actions check runs, and no `cancelled`, `action_required` or `stale` conclusion. I could not check the live tool schema (the server is remote, `https://api.githubcopilot.com/mcp/`), so this rests on the server's published implementation. The backstop is narrower than round 1's note assumed. Step 10's `bkit runs gate` (`.bkit/core/engine/commands/workflow/runs.ts:1747-1763`) refuses only a non-success run of the selected CI workflow and its capstone. Step 2 sub-step 5 is the only gate that reads every check on the PR, the `bkit-trivy` secret scan included. Plan Task 3's DONE WHEN, and the closed deferral row `911-ship-failed-merge-challenge-low-...-345`, both say the MCP path stops on a cancelled check. On this data source it cannot. With no commit statuses at all, the arm fails closed (`no check` -> Failure Path), so the exposure needs a consumer whose PRs also carry a third-party commit status (for example a deploy preview). Cross-referenced with `docs/security.md` § Untrusted Content & Prompt Injection (the load-bearing control is structural: scan text before a privileged action) and § Supply-Chain (scanner isolation).
- TASK 2 basis: `.bkit/templates/.husky/pre-push:114-116` adds both `refs/heads/dev` and `refs/heads/main` to `PUSH_SHARED_SHAS`, and `:186-193` allows a `[skip ci]` head on either when `bkit ci min-push --ref` passes. The decision row's summary and rationale cover `dev` only. bkit's own `main` is PR-only with push protection (`docs/security.md` § Repository controls), so the gap matters for consumers with an unprotected `main`.
- Test logic, read against the code the diff leaves: TASK 1's test fails because the exit-80 arm at `bkit-ship.md:349` names `get_status`. TASK 2's test fails because the hook exits 0 for a `docs/audits/**`-only `[skip ci]` push to `refs/heads/main`: the same path the new test at `husky-pre-push.integration.test.ts:1212` asserts as allowed for `dev`.
- Supply chain: #920 adds no dependency.
- Data access / tenancy, auth, sessions, RLS: not applicable (bkit has no database or user-auth surface, `docs/security.md` § Scope / § RLS).
- Embedded directives: none found in the diff content.
- Parallel run: no sibling challenge output was read or referenced.

## Findings Log

<!-- bkit:task 1 start -->
- [ ] **TASK 1:** On the MCP path (exit 80) ship Step 2 reads `pull_request_read` `get_status`, the combined commit status, which carries no GitHub Actions check runs and no cancelled, action-required or stale state, so a PR whose `bkit-trivy` secret scan was cancelled, awaits approval or failed reaches Step 3 when any other commit status is green
  **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/workflows/bkit-ship.md:349` · **Round:** 1
  - **DONE WHEN:** Step 2 sub-step 5's exit-80 arm and the **gh MCP fallback** mapping for `bkit prs checks --number` (the shared clause in `.bkit/instructions.md`, carried into `bkit-ship`, `bkit-build`, `bkit-debug`, `bkit-plan`, `bkit-design`) read check-run conclusions for the PR head (`pull_request_read` `get_check_runs`, or `actions_list` runs for the head SHA), not `get_status`, so the cancelled / action-required / stale arm and the concluded-failure arm can match on the MCP path as they do on the `gh` path; mirrors and `__snapshots__/bkit-ship.none.txt` carry the same text.
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/workflows/ship-invariants.test.ts` `Step 2's exit-80 arm reads check-run conclusions, not the combined commit status` fails on the exit-80 arm line naming `get_status` and naming neither `get_check_runs` nor `actions_list`
<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->
- [ ] **TASK 2:** The new accepted-risk paragraph records that an audit report may reach `main` unscanned under a `[skip ci]` head, but the owner's decision accepted `dev` only, so a direct audit-only push to an unprotected consumer `main` skips every workflow with no recorded acceptance
  **Severity:** LOW · **Class:** architectural · **Fixable:** false · **Location:** `docs/security.md:25` · **Round:** 1
  - **DONE WHEN:** No agent can settle it: `920-audit-reports-may-skip-ci-on-dev` in `docs/decisions.jsonl` accepts the risk for `dev`, while `.bkit/templates/.husky/pre-push:115` and `:188` apply the same `bkit ci min-push --ref` allowance to `refs/heads/main`, and `docs/security.md:25` states `dev` or `main`. The owner decides whether `main` is accepted too (then the decision row names `main`), or whether the skip-CI guard blocks a `[skip ci]` head to `main` that changes `docs/audits/**` or an audit template's project section (then the hook and `docs/security.md` say `dev` only).
  - **TEST FIRST:**
    - `.bkit/core/engine/audits/templates/husky-pre-push.integration.test.ts` `.bkit/templates/.husky/pre-push: audit report to main under a [skip ci] head → blocked before any gate` fails on the hook exiting 0 for a `docs/audits/202611/security.md`-only push to `refs/heads/main` whose head carries `[skip ci]`
<!-- bkit:task 2 end -->
