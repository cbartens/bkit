Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

Coverage: partial diff coverage; supplemented by the supplied full raw diff.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** Substitute unrelated green Actions evidence into scoped MCP facts to authorize a merge
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/runs.ts:2027`
  - **DONE WHEN:** The MCP adapter rejects CI evidence whose repository or configured workflow does not match the requested scope, and rejects jobs whose run identity or head does not match the selected run. Missing provenance fails closed. Update the fallback facts contract and fixtures together while retaining valid scoped evidence and paginated jobs.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `rejects MCP green runs from another repository or workflow at the same head` fails because a correct PR/base envelope containing a successful run for another repository or workflow at the requested SHA currently passes. Give the foreign run a successful capstone, keep the envelope and base valid, and assert a nonzero gate exit with `passed: false`.
    - `.bkit/core/engine/commands/workflow/runs.test.ts` `rejects MCP capstone jobs belonging to another run` fails because the adapter returns the same `ci.jobs` payload for any requested run ID present in `ci.workflowRuns`; a successful capstone with a different `run_id`, `run_url` or `head_sha` can satisfy the selected run. Assert refusal with otherwise valid run, PR and base evidence, and acceptance of the matching control.

<!-- bkit:task 1 end -->

Evidence: The new adapter at `runs.ts:2027-2040` checks the requested endpoint and whether its run ID appears in the supplied list, but does not validate the returned records' provenance. `shipGate` filters runs by head/event at `runs.ts:1342-1381`, then accepts the capstone's name/conclusion at `runs.ts:1418-1430`; it trusts the server-side endpoint scope that this adapter replaces. The existing MCP test at `runs.test.ts:1033` checks stale/missing base and outer-envelope mismatch, not nested Actions provenance. These two additional cases are not existing named plan regressions.

Security cross-reference: `docs/security.md` section Untrusted Content & Prompt Injection requires structural controls before privileged mutation; `docs/testing.md` section Ship merge-gate + bookkeeping test coverage identifies the executable gate as the irreversible-merge control. `docs/observability.md` promises that mismatched MCP evidence cannot authorize a merge. GitHub's [workflow-run API](https://docs.github.com/en/rest/actions/workflow-runs#list-workflow-runs-for-a-workflow) exposes repository/workflow identity, and its [workflow-job API](https://docs.github.com/en/rest/actions/workflow-jobs#list-jobs-for-a-workflow-run) exposes `run_id`, `run_url` and `head_sha`; the adapter can bind those facts without another transport or broader credentials.

Read-only reproduction: invoked the existing compiled CLI with `runs gate --pr=7 --repo=example/example --validated=<40 a characters> --fresh-base --facts-file=/dev/stdin --json`, supplying synthetic JSON on stdin and no record/snapshot options. A valid outer PR/base envelope with a green run under `foreign/repo`, workflow path `.github/workflows/unrelated.yml`, and a foreign capstone returned process exit 0 and `passed: true`; output simultaneously reported `repo: example/example`, `ciWorkflow: bkit-ci.yml` and the foreign run URL. A second invocation used a correctly scoped run ID 1900 but a green job with run ID 1800 and a different head SHA; it also returned exit 0 and `passed: true`. No network mutation, source edit, new test file or merge was performed.

Coverage notes: Reviewed the supplied plan and the full raw diff sections for all changed engine commands, command tests, workflow invariants, ship workflow and conflict resolver, supplementing the trimmed artifact's partial diff coverage. Generated provider/compiled surfaces were treated as derivatives of those source changes; the two reproductions exercised the existing compiled adapter. Installed skills were reviewed as external guidance through their entry points, security-relevant examples and lock provenance, not activated. Their broad activation demands and alternative-tooling recommendations do not override `.agents/skills.md` Activation Rules. No package manifest or package-manager lockfile dependency changed, so new runtime-dependency CVE/install-script review was not applicable. No new authentication/session/data-store/tenant surface or credentials were introduced.

Existing-plan gap, not a duplicate task: Step 9 can adopt newly observed remote code, and Step 10 exit 17 returns there without setting `RECONCILE_REQUIRED`. That can omit the inherited-dev and refreshed sweep/docs checks. The fix is already required by plan Tasks 2 and 7, whose DONE WHEN clauses require changed retry candidates to be checked and imported feature code to invalidate coverage. This report does not add another task for that work. A passing security remediation must not be taken as evidence that the existing plan gap is resolved.
