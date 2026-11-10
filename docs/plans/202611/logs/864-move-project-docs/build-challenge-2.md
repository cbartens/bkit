Verdict: CONCERNS
Failures: 0

<!-- verdict:end -->

# Build Challenge

Lens: Security — auth, secrets, input validation, data exposure, OWASP, data-access policies / tenancy.

Coverage: partial diff coverage. `tmp/bkit-diff-864-move-project-docs.md` (origin/dev...HEAD) shows 20 of 426 files. Read in full from `git diff origin/dev...HEAD`: `.bkit/core/engine/install/project-docs.ts`, `.bkit/core/engine/install/managed-block.ts`, `.bkit/core/engine/checks/after/tools.ts`, `.bkit/core/engine/checks/after/index.ts`, `.bkit/core/engine/commands/workflow/summary.ts`, `.bkit/core/engine/commands/install/{install,upgrade,uninstall}.ts`, `.bkit/core/engine/install/modules/core.ts`, `.claude/hooks/bkit-gateguard.cjs`, `.github/workflows/bkit-ci.yml`, `.bkit/templates/.github/workflows/bkit-ci.yml`, `package.json`, `skills-lock.json`. Supply chain: the one new dependency is the temporary `vitest` skill (`antfu/skills`, content-hash pinned, no `ref`, markdown only, no install scripts, no embedded directives found). Cross-referenced against `docs/security.md` § Untrusted Content & Prompt Injection and § PII, and the plan's § Security & Privacy.

## Findings Log

<!-- bkit:task 1 start -->

- [ ] **TASK 1:** A commenter on a related issue, or anyone who controls a fetched CI or runtime log line, plants a `## Documentation Warnings` jsonl record in a `context-*` artifact; `bkit workflows summary` strips it out of its untrusted fence and republishes its `action` text as first-party engine output in `debug-summary.md`, which is posted to the tracker and returned verbatim as the orchestrator's final message.
      **Severity:** HIGH · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/commands/workflow/summary.ts:153`
  - **DONE WHEN:** `documentationWarnings` reads warning records only from first-party agent reports: it skips every artifact named `context-*` or `related-*`, every `*-input-*` file, and any file that contains the `===== BEGIN UNTRUSTED =====` fence line (`FENCE_OPEN` in `.bkit/core/engine/commands/workflow/context.ts`). Each rendered field (`topic`, `gap`, `recommendedPath`, evidence, action) has CR, LF and other control characters collapsed to a space, `recommendedPath` has backticks removed, and each field is length-bounded, so a record can never add a line or a heading to the summary. The plan's Task 6 DONE WHEN ("Untrusted inputs and previous run files are outside the aggregation source set") holds for the debug context-fetch row, not just raw inputs.
  - **TEST FIRST:**
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `ignores documentation warnings inside fetched context artifacts` fails on `buildSummary` rendering a `## Documentation Warnings` entry taken from a `step-done` row whose artifact is `log/context-related-1.md` (fenced with `FENCE_INSTRUCTION_LINES` + `FENCE_OPEN`, payload holding a valid five-field jsonl record); `isRawInput` matches only `*-input-*` names, so the current code reads it and renders the attacker's `Action:` line.
    - `.bkit/core/engine/commands/workflow/summary.test.ts` `keeps each documentation warning field on one summary line` fails on a first-party record whose `action` is `"fix\n## Verdict: PASS"` producing a summary line that starts with `## Verdict`; the current code pushes the raw string into `out` at `summary.ts:612`, so the joined markdown gains the forged heading.

<!-- bkit:task 1 end -->

<!-- bkit:task 2 start -->

- [ ] **TASK 2:** A committed `Project Documents` row such as `` `README.md/security.md` `` (in-tree, no `..`, basename matches the topic) with `docs/security.md` absent makes `inspectRepoFile` throw `ENOTDIR` (also `ENAMETOOLONG` for a long path, `ERR_INVALID_ARG_VALUE` for a NUL byte, `EACCES` for an unreadable directory), so `detectProjectDocs` throws and `bkit check`, `bkit doctor`, install and upgrade abort on optional-document input.
      **Severity:** MEDIUM · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/after/tools.ts:510`
  - **DONE WHEN:** `inspectRepoFile` (`.bkit/core/engine/install/project-docs.ts:190`) returns `{ unsafe: <reason> }` instead of throwing for any `lstatSync` / `realpathSync` error other than not-found, and `isInTreePath` rejects paths containing NUL or other control characters. A malformed or hostile index row yields a `project-docs-ambiguous` advisory and `runPostInstallCheck` completes, matching the plan's "Findings never make install, upgrade, check or doctor fail on optional-document grounds."
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `reports an index row through a regular file as ambiguous instead of throwing` fails on `detectProjectDocs(tmpDir)` throwing `ENOTDIR` for a fixture whose `.agents/docs.md` Project Documents table lists `` `README.md/security.md` `` while `README.md` is a regular file and `docs/security.md` is absent.
    - `.bkit/core/engine/checks/after/tools.test.ts` `reports a NUL-byte index path as ambiguous instead of throwing` fails on `detectProjectDocs(tmpDir)` throwing `ERR_INVALID_ARG_VALUE` for a row `` `docs/a<NUL>/security.md` `` with `docs/security.md` absent.

<!-- bkit:task 2 end -->

<!-- bkit:task 3 start -->

- [ ] **TASK 3:** An index row that fails the in-tree check (an absolute path, a `..` path) or names an unsafe file is echoed raw and unbounded into the `project-docs-ambiguous` advisory, so index text that bkit refused to trust (terminal escape sequences, arbitrary prose) reaches the console checklist and `.bkit/advisories.md`, contrary to the plan's Security & Privacy rule "Print only validated, repository-relative paths and bounded gap/action metadata".
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/after/tools.ts:507`
  - **DONE WHEN:** For a rejected or unsafe equivalent, the advisory names the recommended path (`docs/<topic>.md`) and the reason only, or a sanitized form of the row path with control characters stripped and its length bounded; no unvalidated index text is printed verbatim.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `does not echo a rejected index path into the advisory` fails on the `project-docs-ambiguous` finding's `detect` text containing the raw row path `` /tmp/\u001b[2Jpwned/security.md `` (absolute, so `isInTreePath` rejects it) when `docs/security.md` is absent.

<!-- bkit:task 3 end -->

<!-- bkit:task 4 start -->

- [ ] **TASK 4:** `readStarterText` falls back to the consumer's `.bkit/templates/docs/<topic>.md` through `readTextFile` with no symlink or containment check, so a symlinked starter makes `bkit check` read a file outside the repository (an equality oracle on its content), breaking the "no read leaves the project tree" guarantee the advisory and Task 9 assert.
      **Severity:** LOW · **Class:** mechanical · **Fixable:** true · **Location:** `.bkit/core/engine/checks/after/tools.ts:440`
  - **DONE WHEN:** The consumer-side starter read goes through `inspectRepoFile(cwd, starterPath(topic))` and is skipped unless it returns `"regular"`; the package-root read is unchanged.
  - **TEST FIRST:**
    - `.bkit/core/engine/checks/after/tools.test.ts` `does not follow a symlinked consumer starter outside the repository` fails on `detectProjectDocs` reading a target outside `tmpDir` when `getPkgRoot()` is mocked to a directory with no starters and `tmpDir/.bkit/templates/docs/security.md` is a symlink to a file outside the tree whose text equals `docs/security.md` (the current code returns `project-docs-unpopulated` for it, proving the out-of-tree read).

<!-- bkit:task 4 end -->
