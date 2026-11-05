Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A malformed Jira credential is exposed in live-probe diagnostics.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `docs/plans/202611/logs/826-append-routine-workflow/spike/tracker-contract.ts:35`
  - **DONE WHEN:** Every error diagnostic emitted by the live contract probe redacts configured tracker credential values before truncation and JSON serialization. The direct Jira schema-discovery fetch must not print the Authorization value when header validation fails. Preserve the diagnostic stage, useful non-secret failure classification, opt-in target checks and existing provider evidence. This enforces `docs/security.md` § Secrets Management and the plan's Security & Privacy requirement for redacted build evidence.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/tracker.integration.test.ts` `redacts malformed Jira authorization from live probe diagnostics` fails on the actual probe's `--discover` execution emitting a synthetic Jira token with an embedded newline in stdout or stderr; exercise the real header-validation failure without network traffic, including a long token whose unredacted message would be truncated, and assert the failure stage remains observable.

<!-- bkit:task 1 end -->

## Evidence and scope

Partial diff coverage. The supplied artifact is capped at 500 lines per selected file and omits complete files. The security review expanded the full changed engine hunks for `tracker.ts`, `locks.ts`, `issues.ts`, `workflows.ts`, their posting callers and the command runner; it also examined session-bearing workflow changes, ownership and diagnostic documentation, the live probe and its dependency boundary. Generated mirrors and third-party reference material are not claimed as independently complete code coverage.

The new probe's `jiraSchemas` calls `fetch` directly, unlike the production `post` helper that converts network errors into bounded safe reasons. `reason` copies `error.message.slice(0, 600)`, and the `jira-schema-unavailable` record prints it. A local execution of the actual probe with a synthetic embedded-newline Jira credential produced a `TypeError` whose message included the full synthetic Authorization value. Linear and GitHub credentials were set empty in that child process. Header validation failed before network I/O; no live provider call or real credential was used. The same run's production Jira transport emitted only `fetch failed`, demonstrating the existing safe boundary the probe bypasses.

Local reproduction from the feature worktree:

```bash
node --import tsx --input-type=module -e 'process.env.BKIT_GH_TOKEN = ""; process.env.BKIT_LINEAR_API_KEY = ""; process.env.BKIT_JIRA_API_KEY = "synthetic-secret-1234\n5678"; process.argv = [process.execPath, "tracker-contract.ts", "--discover"]; await import("./docs/plans/202611/logs/826-append-routine-workflow/spike/tracker-contract.ts");'
```

The session association uses real-path containment, progress filenames are derived from hashes, cached source files are created with private permissions, and the changed provider writes use structured subprocess arguments or GraphQL/MCP variables. No runtime dependency or package-lock change was introduced. No additional injection, cross-target privilege escalation or dependency finding was confirmed. The existing Task 6 requirement to preserve human edits remains applicable to lost-acknowledgment recognition; this report adds no duplicate task for that already identified repair.

No broad tests, source edits, live mutations, builds or commits were performed in this review. The local header-validation reproduction exited zero because discovery catches and records the failure; that exit is not evidence of safe diagnostic output or a passing full gate.
